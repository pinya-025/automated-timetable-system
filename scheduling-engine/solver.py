"""
Google OR-Tools CP-SAT Timetable Optimizer Engine
Automated Scheduling with Constraint Programming
"""

import time
from typing import Dict, List, Tuple
from ortools.sat.python import cp_model
from models import ScheduleInputPayload, ScheduleOutputResponse, ScheduledEntryResult


class TimetableCPSATSolver:
    def __init__(self, data: ScheduleInputPayload):
        self.data = data
        self.model = cp_model.CpModel()
        self.solver = cp_model.CpSolver()
        self.solver.parameters.max_time_in_seconds = 30.0
        self.solver.parameters.num_search_workers = 4

        # Unpack sessions
        self.sessions = []
        for off in self.data.offerings:
            if not off.is_active:
                continue
            for idx, period_len in enumerate(off.periods_per_session):
                self.sessions.append({
                    "id": f"{off.id}_{idx}",
                    "offering_id": off.id,
                    "session_index": idx,
                    "period_length": period_len,
                    "teacher_id": off.teacher_id,
                    "group_id": off.student_group_id,
                    "room_type_id": off.room_type_id,
                    "student_count": off.student_count,
                    "preferred_room_id": off.preferred_room_id,
                })

        self.days = self.data.working_days
        self.timeslots = list(range(1, self.data.total_timeslots + 1))
        self.x = {}  # Decision variables: x[(session_id, day, start_slot, room_id)]
        self.penalties = []

    def build_variables_and_domain(self):
        """Create boolean decision variables for feasible combinations."""
        # Blocked slots set: (day, slot)
        blocked_set = set()
        for b in self.data.blocked_timeslots:
            if not b.is_active:
                continue
            target_days = self.days if b.day_of_week == 0 else [b.day_of_week]
            for d in target_days:
                if b.timeslot_id:
                    blocked_set.add((d, b.timeslot_id))
                elif b.type == "LUNCH":
                    blocked_set.add((d, 5))  # Period 5 is 12:00-13:00

        # Teacher unavailable set: (teacher_id, day, slot)
        teacher_unavail = set()
        for a in self.data.availabilities:
            if not a.is_available:
                teacher_unavail.add((a.teacher_id, a.day_of_week, a.timeslot_id))

        # Room lookups
        valid_rooms = [r for r in self.data.rooms if r.is_active]

        for s in self.sessions:
            s_id = s["id"]
            p_len = s["period_length"]
            max_start = self.data.total_timeslots - p_len + 1

            for day in self.days:
                for start_slot in range(1, max_start + 1):
                    end_slot = start_slot + p_len - 1
                    slots_covered = list(range(start_slot, end_slot + 1))

                    # Hard constraint: Check Blocked Timeslots
                    if any((day, slot) in blocked_set for slot in slots_covered):
                        continue

                    # Hard constraint: Check Teacher Availability
                    if any((s["teacher_id"], day, slot) in teacher_unavail for slot in slots_covered):
                        continue

                    # Iterate suitable rooms
                    for room in valid_rooms:
                        # Hard constraint: Room Type Match
                        if room.room_type_id != s["room_type_id"]:
                            continue
                        # Hard constraint: Room Capacity
                        if room.capacity < s["student_count"]:
                            continue

                        # Feasible variable
                        var = self.model.NewBoolVar(f"x_{s_id}_d{day}_s{start_slot}_r{room.id}")
                        self.x[(s_id, day, start_slot, room.id)] = var

    def add_hard_constraints(self):
        """Add all non-negotiable hard constraints."""
        # 1. Exactly one assignment per session
        for s in self.sessions:
            s_id = s["id"]
            session_vars = [
                var for (s_k, d, sl, r), var in self.x.items() if s_k == s_id
            ]
            if session_vars:
                self.model.Add(sum(session_vars) == 1)

        # 2. Teacher No Overlap (At each day, slot, teacher has <= 1 class)
        for t in self.data.teachers:
            for day in self.days:
                for slot in self.timeslots:
                    competing_vars = []
                    for (s_k, d, sl, r), var in self.x.items():
                        s_info = next(s for s in self.sessions if s["id"] == s_k)
                        if s_info["teacher_id"] == t.id and d == day:
                            # Does session occupy this slot?
                            if sl <= slot <= sl + s_info["period_length"] - 1:
                                competing_vars.append(var)
                    if len(competing_vars) > 1:
                        self.model.Add(sum(competing_vars) <= 1)

        # 3. Room No Overlap (At each day, slot, room has <= 1 class)
        for room in self.data.rooms:
            for day in self.days:
                for slot in self.timeslots:
                    competing_vars = []
                    for (s_k, d, sl, r), var in self.x.items():
                        s_info = next(s for s in self.sessions if s["id"] == s_k)
                        if r == room.id and d == day:
                            if sl <= slot <= sl + s_info["period_length"] - 1:
                                competing_vars.append(var)
                    if len(competing_vars) > 1:
                        self.model.Add(sum(competing_vars) <= 1)

        # 4. Student Group No Overlap
        groups = {s["group_id"] for s in self.sessions}
        for grp_id in groups:
            for day in self.days:
                for slot in self.timeslots:
                    competing_vars = []
                    for (s_k, d, sl, r), var in self.x.items():
                        s_info = next(s for s in self.sessions if s["id"] == s_k)
                        if s_info["group_id"] == grp_id and d == day:
                            if sl <= slot <= sl + s_info["period_length"] - 1:
                                competing_vars.append(var)
                    if len(competing_vars) > 1:
                        self.model.Add(sum(competing_vars) <= 1)

        # 5. Same Course Spread (if offering has 2 sessions, don't put both on the same day)
        offering_sessions = {}
        for s in self.sessions:
            offering_sessions.setdefault(s["offering_id"], []).append(s)

        for off_id, sess_list in offering_sessions.items():
            if len(sess_list) > 1:
                for day in self.days:
                    # Sum of all sessions of this offering on day <= 1
                    day_vars = [
                        var for (s_k, d, sl, r), var in self.x.items()
                        if any(s["id"] == s_k for s in sess_list) and d == day
                    ]
                    if len(day_vars) > 1:
                        self.model.Add(sum(day_vars) <= 1)

    def add_soft_constraints(self):
        """Minimize soft penalties: Room preferences, teacher preferences, etc."""
        # Weight values
        weights = {w.code: w.weight for w in self.data.weights}
        room_pref_w = weights.get("ROOM_PREFERENCE", 7)
        teach_pref_w = weights.get("TEACHER_PREFERENCE", 8)

        # Room preference: penalty if not preferred room
        for (s_k, d, sl, r), var in self.x.items():
            s_info = next(s for s in self.sessions if s["id"] == s_k)
            if s_info["preferred_room_id"] and s_info["preferred_room_id"] != r:
                self.penalties.append(var * room_pref_w)

        if self.penalties:
            self.model.Minimize(sum(self.penalties))

    def solve(self) -> ScheduleOutputResponse:
        start_t = time.time()
        self.build_variables_and_domain()
        self.add_hard_constraints()
        self.add_soft_constraints()

        status = self.solver.Solve(self.model)
        exec_time = time.time() - start_t

        status_str = "INFEASIBLE"
        if status == cp_model.OPTIMAL:
            status_str = "OPTIMAL"
        elif status == cp_model.FEASIBLE:
            status_str = "FEASIBLE"

        results: List[ScheduledEntryResult] = []
        if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
            for (s_k, d, sl, r), var in self.x.items():
                if self.solver.Value(var) == 1:
                    s_info = next(s for s in self.sessions if s["id"] == s_k)
                    results.append(ScheduledEntryResult(
                        course_offering_id=s_info["offering_id"],
                        session_index=s_info["session_index"],
                        period_length=s_info["period_length"],
                        day_of_week=d,
                        start_timeslot_id=sl,
                        end_timeslot_id=sl + s_info["period_length"] - 1,
                        room_id=r,
                        is_locked=False
                    ))

        total_sessions = len(self.sessions)
        scheduled_sessions = len(results)
        soft_penalty = int(self.solver.ObjectiveValue()) if status in (cp_model.OPTIMAL, cp_model.FEASIBLE) and self.penalties else 0
        hard_conflicts = 0 if scheduled_sessions == total_sessions else (total_sessions - scheduled_sessions)
        score = max(0.0, 100.0 - (hard_conflicts * 25.0) - min(25.0, soft_penalty * 0.5))

        return ScheduleOutputResponse(
            status=status_str,
            score=score,
            hard_conflict_count=hard_conflicts,
            soft_penalty_score=soft_penalty,
            total_sessions=total_sessions,
            scheduled_sessions=scheduled_sessions,
            entries=results,
            execution_time_seconds=round(exec_time, 3),
            solver_message=f"CP-SAT Solver finished with status {status_str} in {round(exec_time, 2)}s"
        )
