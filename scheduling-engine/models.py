"""
Data Models for Timetable Optimization Engine (Pydantic / Dataclasses)
Compatible with Laravel REST API Payload
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class RoomModel(BaseModel):
    id: int
    room_number: str
    room_type_id: int
    capacity: int
    building: str
    is_active: bool = True


class TeacherModel(BaseModel):
    id: int
    name: str
    department_id: int
    max_periods_per_week: int = 18
    max_periods_per_day: int = 6
    max_consecutive_periods: int = 3


class TeacherAvailabilityModel(BaseModel):
    teacher_id: int
    day_of_week: int
    timeslot_id: int
    is_available: bool


class TeacherPreferenceModel(BaseModel):
    teacher_id: int
    day_of_week: int
    timeslot_id: int
    preference_level: int = 2  # 1=low, 2=med, 3=high


class CourseOfferingModel(BaseModel):
    id: int
    course_id: int
    course_code: str
    course_name: str
    student_group_id: int
    teacher_id: int
    room_type_id: int
    student_count: int
    sessions_per_week: int = 1
    periods_per_session: List[int] = [2]
    must_be_consecutive: bool = True
    max_sessions_per_day: int = 1
    preferred_room_id: Optional[int] = None
    is_fixed: bool = False
    is_active: bool = True


class BlockedTimeslotModel(BaseModel):
    id: int
    day_of_week: int  # 0 for all days, 1=Mon, ..., 5=Fri
    timeslot_id: Optional[int] = None
    start_time: str
    end_time: str
    type: str  # LUNCH, ACTIVITY, MEETING, etc.
    title: str
    is_active: bool = True


class ConstraintWeightModel(BaseModel):
    code: str
    name: str
    type: str  # HARD or SOFT
    weight: int = 10
    is_active: bool = True


class ScheduleInputPayload(BaseModel):
    semester_id: int
    version_id: Optional[int] = None
    offerings: List[CourseOfferingModel]
    rooms: List[RoomModel]
    teachers: List[TeacherModel]
    availabilities: List[TeacherAvailabilityModel] = []
    preferences: List[TeacherPreferenceModel] = []
    blocked_timeslots: List[BlockedTimeslotModel] = []
    weights: List[ConstraintWeightModel] = []
    working_days: List[int] = [1, 2, 3, 4, 5]
    total_timeslots: int = 9


class ScheduledEntryResult(BaseModel):
    course_offering_id: int
    session_index: int
    period_length: int
    day_of_week: int
    start_timeslot_id: int
    end_timeslot_id: int
    room_id: int
    is_locked: bool = False


class ScheduleOutputResponse(BaseModel):
    status: str  # OPTIMAL, FEASIBLE, INFEASIBLE
    score: float
    hard_conflict_count: int
    soft_penalty_score: int
    total_sessions: int
    scheduled_sessions: int
    entries: List[ScheduledEntryResult]
    execution_time_seconds: float
    solver_message: str
