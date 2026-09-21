import {
  CourseOffering,
  Course,
  Teacher,
  StudentGroup,
  Room,
  RoomType,
  Timeslot,
  BlockedTimeslot,
  TeacherAvailability,
  TeacherPreference,
  ConstraintWeight,
  ScheduleEntry,
  ConflictItem,
  AlternativeSlot,
} from '../types';

export interface SchedulerContext {
  offerings: CourseOffering[];
  courses: Course[];
  teachers: Teacher[];
  studentGroups: StudentGroup[];
  rooms: Room[];
  roomTypes: RoomType[];
  timeslots: Timeslot[];
  blockedTimeslots: BlockedTimeslot[];
  availabilities: TeacherAvailability[];
  preferences: TeacherPreference[];
  weights: ConstraintWeight[];
}

export interface GenerationResult {
  success: boolean;
  entries: ScheduleEntry[];
  totalSessions: number;
  scheduledSessions: number;
  unscheduledSessions: number;
  hardConflictCount: number;
  softPenaltyScore: number;
  score: number;
  conflicts: ConflictItem[];
  executionTimeMs: number;
}

export interface ValidationMoveResult {
  canMove: boolean;
  hasHardConflict: boolean;
  hardConflicts: ConflictItem[];
  softWarnings: ConflictItem[];
  penaltyScore: number;
}

/**
 * Conflict Detection Engine: Verifies all Hard and Soft constraints
 */
export function detectConflicts(
  entries: ScheduleEntry[],
  context: SchedulerContext,
  targetEntryId?: number
): ConflictItem[] {
  const conflicts: ConflictItem[] = [];
  const entriesToCheck = targetEntryId
    ? entries.filter((e) => e.id === targetEntryId)
    : entries;

  const offeringMap = new Map(context.offerings.map((o) => [o.id, o]));
  const courseMap = new Map(context.courses.map((c) => [c.id, c]));
  const teacherMap = new Map(context.teachers.map((t) => [t.id, t]));
  const groupMap = new Map(context.studentGroups.map((g) => [g.id, g]));
  const roomMap = new Map(context.rooms.map((r) => [r.id, r]));

  // 1. Check individual entry constraints (Room Type, Capacity, Blocked Times, Teacher Availability)
  for (const entry of entriesToCheck) {
    const offering = offeringMap.get(entry.course_offering_id);
    if (!offering) continue;
    const course = courseMap.get(offering.course_id);
    const teacher = teacherMap.get(offering.teacher_id);
    const group = groupMap.get(offering.student_group_id);
    const room = roomMap.get(entry.room_id);

    const periodSlots = [];
    for (let slot = entry.start_timeslot_id; slot <= entry.end_timeslot_id; slot++) {
      periodSlots.push(slot);
    }

    // A. Blocked Timeslots check (Lunch & Wednesday Activity)
    for (const slotId of periodSlots) {
      const slotObj = context.timeslots.find((s) => s.id === slotId);
      const isBlocked = context.blockedTimeslots.find(
        (b) =>
          (b.day_of_week === 0 || b.day_of_week === entry.day_of_week) &&
          (b.timeslot_id === slotId || (slotObj?.is_lunch && b.type === 'LUNCH'))
      );

      if (isBlocked) {
        conflicts.push({
          id: `blocked-${entry.id}-${slotId}`,
          type: 'BLOCKED_TIMESLOT',
          severity: 'ERROR',
          title: `ตรงกับช่วงเวลาห้ามจัด (${isBlocked.title})`,
          description: `วิชา ${course?.name_th || ''} คาบ ${slotId} วัน${getDayName(entry.day_of_week)} ตรงกับ ${isBlocked.title}`,
          entry_id: entry.id,
          day_of_week: entry.day_of_week,
          timeslot_id: slotId,
        });
      }
    }

    // B. Room Type Match Check
    if (room && offering.room_type_id && room.room_type_id !== offering.room_type_id) {
      const expectedType = context.roomTypes.find((rt) => rt.id === offering.room_type_id);
      const actualType = context.roomTypes.find((rt) => rt.id === room.room_type_id);
      conflicts.push({
        id: `roomtype-${entry.id}`,
        type: 'ROOM_TYPE',
        severity: 'ERROR',
        title: 'ประเภทห้องเรียนไม่ตรงกับข้อกำหนด',
        description: `วิชา ${course?.name_th} ต้องการ ${expectedType?.name} แต่จัดใน ${actualType?.name} (${room.room_number})`,
        entry_id: entry.id,
        room_id: room.id,
      });
    }

    // C. Room Capacity Check
    if (room && room.capacity < offering.student_count) {
      conflicts.push({
        id: `capacity-${entry.id}`,
        type: 'ROOM_CAPACITY',
        severity: 'ERROR',
        title: 'ความจุห้องไม่เพียงพอ',
        description: `ห้อง ${room.room_number} จุได้ ${room.capacity} คน แต่กลุ่ม ${group?.name} มีนักศึกษา ${offering.student_count} คน`,
        entry_id: entry.id,
        room_id: room.id,
      });
    }

    // D. Teacher Availability Check
    for (const slotId of periodSlots) {
      const unavailable = context.availabilities.find(
        (a) =>
          a.teacher_id === offering.teacher_id &&
          a.day_of_week === entry.day_of_week &&
          a.timeslot_id === slotId &&
          !a.is_available
      );

      if (unavailable) {
        conflicts.push({
          id: `unavail-${entry.id}-${slotId}`,
          type: 'TEACHER_UNAVAILABLE',
          severity: 'ERROR',
          title: 'อาจารย์ติดภารกิจ/ไม่ว่างในคาบนี้',
          description: `${teacher?.prefix}${teacher?.name} ระบุไม่สะดวกสอนในวัน${getDayName(entry.day_of_week)} คาบ ${slotId}`,
          entry_id: entry.id,
          teacher_id: teacher?.id,
          day_of_week: entry.day_of_week,
          timeslot_id: slotId,
        });
      }
    }
  }

  // 2. Pairwise Checks (Teacher Conflict, Room Conflict, Student Group Conflict)
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const e1 = entries[i];
      const e2 = entries[j];

      if (targetEntryId && e1.id !== targetEntryId && e2.id !== targetEntryId) {
        continue;
      }

      // Must be same day
      if (e1.day_of_week !== e2.day_of_week) continue;

      // Check slot overlap
      const overlap = Math.max(e1.start_timeslot_id, e2.start_timeslot_id) <= Math.min(e1.end_timeslot_id, e2.end_timeslot_id);
      if (!overlap) continue;

      const o1 = offeringMap.get(e1.course_offering_id);
      const o2 = offeringMap.get(e2.course_offering_id);
      if (!o1 || !o2) continue;

      // Teacher Conflict
      if (o1.teacher_id === o2.teacher_id) {
        const teacher = teacherMap.get(o1.teacher_id);
        const c1 = courseMap.get(o1.course_id);
        const c2 = courseMap.get(o2.course_id);
        conflicts.push({
          id: `teach-conflict-${e1.id}-${e2.id}`,
          type: 'TEACHER_CONFLICT',
          severity: 'ERROR',
          title: 'อาจารย์มีตารางสอนซ้อนเวลา',
          description: `${teacher?.prefix}${teacher?.name} ถูกจัดสอนวิชา ${c1?.code} และ ${c2?.code} ซ้อนเวลากันในวัน${getDayName(e1.day_of_week)}`,
          entry_id: e1.id,
          teacher_id: o1.teacher_id,
          day_of_week: e1.day_of_week,
        });
      }

      // Room Conflict
      if (e1.room_id === e2.room_id) {
        const room = roomMap.get(e1.room_id);
        const c1 = courseMap.get(o1.course_id);
        const c2 = courseMap.get(o2.course_id);
        conflicts.push({
          id: `room-conflict-${e1.id}-${e2.id}`,
          type: 'ROOM_CONFLICT',
          severity: 'ERROR',
          title: 'ห้องเรียนถูกใช้งานซ้อนเวลา',
          description: `ห้อง ${room?.room_number} ถูกใช้สำหรับวิชา ${c1?.code} และ ${c2?.code} ในเวลาเดียวกัน วัน${getDayName(e1.day_of_week)}`,
          entry_id: e1.id,
          room_id: e1.room_id,
          day_of_week: e1.day_of_week,
        });
      }

      // Student Group Conflict
      if (o1.student_group_id === o2.student_group_id) {
        const group = groupMap.get(o1.student_group_id);
        const c1 = courseMap.get(o1.course_id);
        const c2 = courseMap.get(o2.course_id);
        conflicts.push({
          id: `group-conflict-${e1.id}-${e2.id}`,
          type: 'GROUP_CONFLICT',
          severity: 'ERROR',
          title: 'กลุ่มเรียนมีตารางเรียนซ้อนเวลา',
          description: `กลุ่ม ${group?.name} มีเรียนวิชา ${c1?.code} ชนกับ ${c2?.code} ในวัน${getDayName(e1.day_of_week)}`,
          entry_id: e1.id,
          student_group_id: o1.student_group_id,
          day_of_week: e1.day_of_week,
        });
      }
    }
  }

  // 3. Soft Constraints Checking (Warnings)
  // Max consecutive teacher periods
  for (const teacher of context.teachers) {
    for (let day = 1; day <= 5; day++) {
      const teacherEntries = entries.filter((e) => {
        const o = offeringMap.get(e.course_offering_id);
        return o?.teacher_id === teacher.id && e.day_of_week === day;
      });

      if (teacherEntries.length >= 2) {
        // Sort by start slot
        teacherEntries.sort((a, b) => a.start_timeslot_id - b.start_timeslot_id);
        let consecutiveHours = 0;
        let lastEndSlot = -1;

        for (const te of teacherEntries) {
          if (lastEndSlot !== -1 && te.start_timeslot_id === lastEndSlot + 1) {
            consecutiveHours += te.period_length;
          } else {
            consecutiveHours = te.period_length;
          }
          lastEndSlot = te.end_timeslot_id;

          if (consecutiveHours > teacher.max_consecutive_periods) {
            conflicts.push({
              id: `max-consec-${teacher.id}-${day}-${te.id}`,
              type: 'MAX_CONSECUTIVE',
              severity: 'WARNING',
              title: 'อาจารย์สอนต่อเนื่องเกินเกณฑ์แนะนำ',
              description: `${teacher.prefix}${teacher.name} สอนต่อเนื่อง ${consecutiveHours} คาบในวัน${getDayName(day)} (เกณฑ์แนะนำไม่เกิน ${teacher.max_consecutive_periods} คาบ)`,
              entry_id: te.id,
              teacher_id: teacher.id,
              day_of_week: day,
            });
            break;
          }
        }
      }
    }
  }

  return conflicts;
}

/**
 * Computes soft constraint penalty score
 */
export function calculateSoftPenaltyScore(
  entries: ScheduleEntry[],
  context: SchedulerContext
): number {
  let penalty = 0;
  const offeringMap = new Map(context.offerings.map((o) => [o.id, o]));
  const weightMap = new Map(context.weights.map((w) => [w.code, w.weight]));

  // 1. Room preference penalty
  const roomPrefWeight = weightMap.get('ROOM_PREFERENCE') || 7;
  for (const entry of entries) {
    const offering = offeringMap.get(entry.course_offering_id);
    if (offering?.preferred_room_id && offering.preferred_room_id !== entry.room_id) {
      penalty += roomPrefWeight;
    }
  }

  // 2. Same course distribution (multi-session spread across days)
  const spreadWeight = weightMap.get('SAME_COURSE_SPREAD') || 9;
  const courseDayMap = new Map<number, Set<number>>();
  for (const entry of entries) {
    const offering = offeringMap.get(entry.course_offering_id);
    if (!offering) continue;
    if (!courseDayMap.has(offering.id)) {
      courseDayMap.set(offering.id, new Set());
    }
    const days = courseDayMap.get(offering.id)!;
    if (days.has(entry.day_of_week)) {
      // Same course scheduled on same day!
      penalty += spreadWeight;
    }
    days.add(entry.day_of_week);
  }

  // 3. Teacher Preference check
  const teacherPrefWeight = weightMap.get('TEACHER_PREFERENCE') || 8;
  for (const entry of entries) {
    const offering = offeringMap.get(entry.course_offering_id);
    if (!offering) continue;
    const pref = context.preferences.find(
      (p) =>
        p.teacher_id === offering.teacher_id &&
        p.day_of_week === entry.day_of_week &&
        p.timeslot_id >= entry.start_timeslot_id &&
        p.timeslot_id <= entry.end_timeslot_id
    );
    // If teacher had a preference elsewhere but was not placed there
    if (!pref) {
      penalty += Math.round(teacherPrefWeight * 0.5);
    }
  }

  // 4. Student gap penalty
  const studentGapWeight = weightMap.get('MINIMIZE_STUDENT_GAP') || 10;
  for (const group of context.studentGroups) {
    for (let day = 1; day <= 5; day++) {
      const groupEntries = entries
        .filter((e) => {
          const o = offeringMap.get(e.course_offering_id);
          return o?.student_group_id === group.id && e.day_of_week === day;
        })
        .sort((a, b) => a.start_timeslot_id - b.start_timeslot_id);

      if (groupEntries.length >= 2) {
        for (let i = 0; i < groupEntries.length - 1; i++) {
          const gap = groupEntries[i + 1].start_timeslot_id - groupEntries[i].end_timeslot_id - 1;
          // Ignore lunch period
          const inBetweenSlot = context.timeslots.find(
            (t) => t.id === groupEntries[i].end_timeslot_id + 1
          );
          if (gap > 0 && !(gap === 1 && inBetweenSlot?.is_lunch)) {
            penalty += gap * studentGapWeight;
          }
        }
      }
    }
  }

  return penalty;
}

/**
 * Validate hypothetical move (used for Drag & Drop)
 */
export function validateMove(
  entryId: number,
  targetDay: number,
  targetStartSlot: number,
  targetRoomId: number,
  currentEntries: ScheduleEntry[],
  context: SchedulerContext
): ValidationMoveResult {
  const currentEntry = currentEntries.find((e) => e.id === entryId);
  if (!currentEntry) {
    return {
      canMove: false,
      hasHardConflict: true,
      hardConflicts: [
        {
          id: 'not-found',
          type: 'INVALID_SESSION_PATTERN',
          severity: 'ERROR',
          title: 'ไม่พบข้อมูลคาบเรียน',
          description: 'ไม่พบรายการคาบเรียนที่ต้องการย้าย',
        },
      ],
      softWarnings: [],
      penaltyScore: 999,
    };
  }

  const targetEndSlot = targetStartSlot + currentEntry.period_length - 1;

  // Boundary check: cannot exceed total periods (15 periods)
  const maxAllowedSlot = context.timeslots?.length || 15;
  if (targetEndSlot > maxAllowedSlot) {
    return {
      canMove: false,
      hasHardConflict: true,
      hardConflicts: [
        {
          id: 'out-of-bounds',
          type: 'INVALID_SESSION_PATTERN',
          severity: 'ERROR',
          title: 'เกินช่วงเวลาที่กำหนด',
          description: `คาบเรียนยาว ${currentEntry.period_length} คาบ หากเริ่มที่คาบ ${targetStartSlot} จะเกินเวลาสิ้นสุดคาบเรียนที่กำหนด (คาบ ${maxAllowedSlot})`,
        },
      ],
      softWarnings: [],
      penaltyScore: 999,
    };
  }

  // Create cloned entries with hypothetical replacement
  const hypotheticalEntries = currentEntries.map((e) => {
    if (e.id === entryId) {
      return {
        ...e,
        day_of_week: targetDay,
        start_timeslot_id: targetStartSlot,
        end_timeslot_id: targetEndSlot,
        room_id: targetRoomId,
      };
    }
    return e;
  });

  const conflicts = detectConflicts(hypotheticalEntries, context, entryId);
  const hardConflicts = conflicts.filter((c) => c.severity === 'ERROR');
  const softWarnings = conflicts.filter((c) => c.severity === 'WARNING');
  const penalty = calculateSoftPenaltyScore(hypotheticalEntries, context);

  return {
    canMove: hardConflicts.length === 0,
    hasHardConflict: hardConflicts.length > 0,
    hardConflicts,
    softWarnings,
    penaltyScore: penalty,
  };
}

/**
 * Suggest Alternative Slots that have ZERO Hard Conflicts, sorted by best soft score
 */
export function suggestAlternativeSlots(
  entryId: number,
  currentEntries: ScheduleEntry[],
  context: SchedulerContext
): AlternativeSlot[] {
  const currentEntry = currentEntries.find((e) => e.id === entryId);
  if (!currentEntry) return [];

  const offering = context.offerings.find((o) => o.id === currentEntry.course_offering_id);
  if (!offering) return [];

  // Filter valid rooms by required room type and capacity
  const validRooms = context.rooms.filter(
    (r) =>
      r.is_active &&
      r.room_type_id === offering.room_type_id &&
      r.capacity >= offering.student_count
  );

  const candidates: AlternativeSlot[] = [];
  const days = [1, 2, 3, 4, 5];
  const maxAllowedSlot = context.timeslots?.length || 15;
  const maxStartSlot = maxAllowedSlot - currentEntry.period_length + 1;
  const lunchSlotId = context.timeslots.find((t) => t.is_lunch)?.id || 7;

  for (const day of days) {
    for (let slot = 1; slot <= maxStartSlot; slot++) {
      const endSlot = slot + currentEntry.period_length - 1;

      // Skip if spans over lunch (only slot 7 is lunch 12:00-13:00)
      if (slot <= lunchSlotId && endSlot >= lunchSlotId) continue;
      // Skip if spans over Wednesday activity (Wed day 3, slot 10 is 15:00-16:00)
      if (day === 3 && slot <= 10 && endSlot >= 10) continue;

      for (const room of validRooms) {
        // Test move
        const moveRes = validateMove(entryId, day, slot, room.id, currentEntries, context);
        if (moveRes.canMove) {
          const notes: string[] = [];
          if (offering.preferred_room_id === room.id) {
            notes.push('ห้องเรียนประจำที่ต้องการ');
          }
          if (endSlot <= 6) {
            notes.push('ช่วงเช้า');
          } else if (slot >= 8 && endSlot <= 11) {
            notes.push('ช่วงบ่าย');
          } else if (slot >= 12) {
            notes.push('ช่วงค่ำ');
          }

          candidates.push({
            day_of_week: day,
            day_name: getDayName(day),
            start_timeslot_id: slot,
            end_timeslot_id: endSlot,
            time_label: `${getTimeslotLabel(slot, endSlot)}`,
            room_id: room.id,
            room_number: room.room_number,
            room_name: room.building,
            penalty_score: moveRes.penaltyScore,
            soft_notes: notes,
          });
        }
      }
    }
  }

  // Sort candidates by lowest penalty score
  candidates.sort((a, b) => a.penalty_score - b.penalty_score);
  return candidates.slice(0, 5); // Return top 5 suggestions
}

/**
 * Automated Timetable Generator Engine (Heuristic CP-SAT style constraint solver)
 */
export function generateSchedule(context: SchedulerContext): GenerationResult {
  const startTime = Date.now();
  const offerings = [...context.offerings].filter((o) => o.is_active);

  // Split offerings into discrete schedulable session objects
  interface SessionUnit {
    offeringId: number;
    sessionIndex: number;
    periodLength: number;
    teacherId: number;
    groupId: number;
    roomTypeId: number;
    studentCount: number;
    preferredRoomId: number | null;
  }

  const sessionUnits: SessionUnit[] = [];
  for (const off of offerings) {
    const periods = off.periods_per_session || [2];
    for (let sIdx = 0; sIdx < periods.length; sIdx++) {
      sessionUnits.push({
        offeringId: off.id,
        sessionIndex: sIdx,
        periodLength: periods[sIdx],
        teacherId: off.teacher_id,
        groupId: off.student_group_id,
        roomTypeId: off.room_type_id,
        studentCount: off.student_count,
        preferredRoomId: off.preferred_room_id ?? null,
      });
    }
  }

  // Heuristic Ordering (MRV - Minimum Remaining Values: Hardest sessions first)
  // Lab sessions first, longer periods first, restricted teachers first
  sessionUnits.sort((a, b) => {
    // Lab types (type 2, 3, 4) before standard lecture (type 1)
    if (a.roomTypeId !== b.roomTypeId) {
      return b.roomTypeId - a.roomTypeId;
    }
    // Longer periods first
    return b.periodLength - a.periodLength;
  });

  const generatedEntries: ScheduleEntry[] = [];
  let entryAutoId = 1;

  // Track assignments for rapid conflict-free verification
  // teacherOccupied: Map<"teacherId-day-slot", boolean>
  const teacherOccupied = new Set<string>();
  // roomOccupied: Map<"roomId-day-slot", boolean>
  const roomOccupied = new Set<string>();
  // groupOccupied: Map<"groupId-day-slot", boolean>
  const groupOccupied = new Set<string>();
  // groupDaySessions: Map<"offeringId-day", boolean> (avoid same course multiple times on same day)
  const offeringDayMap = new Set<string>();

  const days = [1, 2, 3, 4, 5];

  for (const session of sessionUnits) {
    let placed = false;

    // Filter candidate rooms
    const candidateRooms = context.rooms.filter(
      (r) =>
        r.is_active &&
        r.room_type_id === session.roomTypeId &&
        r.capacity >= session.studentCount
    );

    // Prioritize preferred room if available
    candidateRooms.sort((a, b) => {
      if (a.id === session.preferredRoomId) return -1;
      if (b.id === session.preferredRoomId) return 1;
      return 0;
    });

    // Permute days and slots
    // For 2nd session of same offering, prefer different day
    const randomizedDays = [...days].sort((a, b) => {
      const aUsed = offeringDayMap.has(`${session.offeringId}-${a}`);
      const bUsed = offeringDayMap.has(`${session.offeringId}-${b}`);
      if (aUsed && !bUsed) return 1;
      if (!aUsed && bUsed) return -1;
      return 0;
    });

    for (const day of randomizedDays) {
      if (placed) break;

      // Available start slots: 1 to (15 - session.periodLength + 1)
      const lunchSlotId = context.timeslots.find((t) => t.is_lunch)?.id || 7;
      const maxAllowedSlot = context.timeslots?.length || 15;
      const maxStart = maxAllowedSlot - session.periodLength + 1;
      // Preferred teaching start slots (prime morning & afternoon slots first, slot 5 is 10:00-11:00 ready for scheduling!)
      const slotOrder = [3, 4, 5, 8, 9, 6, 2, 11, 1, 12, 13, 14, 15].filter((s) => s <= maxStart);

      for (const startSlot of slotOrder) {
        if (placed) break;
        const endSlot = startSlot + session.periodLength - 1;

        // Blocked check: Lunch (only slot 7 is 12:00-13:00)
        if (startSlot <= lunchSlotId && endSlot >= lunchSlotId) continue;
        // Blocked check: Wednesday activity (day 3, slot 10 is 15:00-16:00)
        if (day === 3 && startSlot <= 10 && endSlot >= 10) continue;

        // Check teacher availability
        let teacherAvailable = true;
        for (let s = startSlot; s <= endSlot; s++) {
          const isUnavail = context.availabilities.some(
            (a) =>
              a.teacher_id === session.teacherId &&
              a.day_of_week === day &&
              a.timeslot_id === s &&
              !a.is_available
          );
          if (isUnavail || teacherOccupied.has(`${session.teacherId}-${day}-${s}`)) {
            teacherAvailable = false;
            break;
          }
        }
        if (!teacherAvailable) continue;

        // Check group availability
        let groupAvailable = true;
        for (let s = startSlot; s <= endSlot; s++) {
          if (groupOccupied.has(`${session.groupId}-${day}-${s}`)) {
            groupAvailable = false;
            break;
          }
        }
        if (!groupAvailable) continue;

        // Find available room
        for (const room of candidateRooms) {
          let roomFree = true;
          for (let s = startSlot; s <= endSlot; s++) {
            if (roomOccupied.has(`${room.id}-${day}-${s}`)) {
              roomFree = false;
              break;
            }
          }

          if (roomFree) {
            // Assign!
            for (let s = startSlot; s <= endSlot; s++) {
              teacherOccupied.add(`${session.teacherId}-${day}-${s}`);
              groupOccupied.add(`${session.groupId}-${day}-${s}`);
              roomOccupied.add(`${room.id}-${day}-${s}`);
            }
            offeringDayMap.add(`${session.offeringId}-${day}`);

            generatedEntries.push({
              id: entryAutoId++,
              schedule_version_id: 1,
              course_offering_id: session.offeringId,
              session_index: session.sessionIndex,
              period_length: session.periodLength,
              day_of_week: day,
              start_timeslot_id: startSlot,
              end_timeslot_id: endSlot,
              room_id: room.id,
              is_locked: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

            placed = true;
            break;
          }
        }
      }
    }
  }

  const conflicts = detectConflicts(generatedEntries, context);
  const hardConflictCount = conflicts.filter((c) => c.severity === 'ERROR').length;
  const softPenaltyScore = calculateSoftPenaltyScore(generatedEntries, context);
  const score = Math.max(0, 100 - hardConflictCount * 25 - Math.min(30, Math.floor(softPenaltyScore / 3)));

  return {
    success: hardConflictCount === 0 && generatedEntries.length === sessionUnits.length,
    entries: generatedEntries,
    totalSessions: sessionUnits.length,
    scheduledSessions: generatedEntries.length,
    unscheduledSessions: sessionUnits.length - generatedEntries.length,
    hardConflictCount,
    softPenaltyScore,
    score,
    conflicts,
    executionTimeMs: Date.now() - startTime,
  };
}

export function getDayName(day: number): string {
  switch (day) {
    case 1:
      return 'จันทร์ (Monday)';
    case 2:
      return 'อังคาร (Tuesday)';
    case 3:
      return 'พุธ (Wednesday)';
    case 4:
      return 'พฤหัสบดี (Thursday)';
    case 5:
      return 'ศุกร์ (Friday)';
    default:
      return 'วันไม่ระบุ';
  }
}

export function getDayShortName(day: number): string {
  switch (day) {
    case 1:
      return 'จันทร์';
    case 2:
      return 'อังคาร';
    case 3:
      return 'พุธ';
    case 4:
      return 'พฤหัส';
    case 5:
      return 'ศุกร์';
    default:
      return '';
  }
}

export function getTimeslotLabel(startSlot: number, endSlot: number): string {
  const startHours = 5 + startSlot; // slot 1 = 06:00, slot 5 = 10:00, slot 7 = 12:00
  const endHours = 5 + endSlot + 1;
  const sStr = `${startHours.toString().padStart(2, '0')}:00`;
  const eStr = `${endHours.toString().padStart(2, '0')}:00`;
  return `คาบ ${startSlot}-${endSlot} (${sStr} - ${eStr})`;
}
