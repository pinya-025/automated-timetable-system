import React, { useState } from 'react';
import {
  Filter,
  Users,
  GraduationCap,
  DoorClosed,
  Building,
  Layers,
  Lock,
  Sparkles,
  Move,
  Info,
  Calendar,
  Coffee,
  Flag,
  RotateCcw,
  FileText,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  X,
  Printer,
} from 'lucide-react';
import {
  ScheduleEntry,
  CourseOffering,
  Course,
  Teacher,
  StudentGroup,
  Room,
  Timeslot,
  BlockedTimeslot,
  RoleType,
  Semester,
  AppSettings,
} from '../../types';
import { getDayName, getDayShortName } from '../../services/schedulerEngine';
import { initialSemesters, initialSettings } from '../../data/seedData';
import { OfficialTimetableDocument } from './OfficialTimetableDocument';

interface TimetableGridProps {
  entries: ScheduleEntry[];
  offerings: CourseOffering[];
  courses: Course[];
  teachers: Teacher[];
  studentGroups: StudentGroup[];
  rooms: Room[];
  timeslots: Timeslot[];
  blockedTimeslots: BlockedTimeslot[];
  currentRole: RoleType;
  isVersionPublished: boolean;
  onRequestMove: (entryId: number, targetDay: number, targetSlot: number, targetRoomId: number) => void;
  onOpenSuggestModal: (entryId: number) => void;
  onAddEntry?: (entry: Omit<ScheduleEntry, 'id'>) => void;
  onUpdateEntry?: (entry: ScheduleEntry) => void;
  onDeleteEntry?: (entryId: number) => void;
  activeSemester?: Semester;
  settings?: AppSettings;
  currentUser?: import('../../types').User | null;
}

type ViewMode = 'group' | 'teacher' | 'room' | 'master';

export const TimetableGrid: React.FC<TimetableGridProps> = ({
  entries,
  offerings,
  courses,
  teachers,
  studentGroups,
  rooms,
  timeslots,
  blockedTimeslots,
  currentRole,
  isVersionPublished,
  onRequestMove,
  onOpenSuggestModal,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry,
  activeSemester,
  settings,
  currentUser,
}) => {
  const [showOfficialDoc, setShowOfficialDoc] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (currentRole === 'student') return 'group';
    return 'teacher';
  });
  const [selectedGroupId, setSelectedGroupId] = useState<number>(() => {
    if (currentUser?.student_group_id) return currentUser.student_group_id;
    return studentGroups[0]?.id || 1;
  });
  const [selectedTeacherId, setSelectedTeacherId] = useState<number>(() => {
    if (currentUser?.teacher_id) return currentUser.teacher_id;
    return teachers.find(t => t.name.includes('ภิญญา'))?.id || teachers[0]?.id || 1;
  });
  const [selectedRoomId, setSelectedRoomId] = useState<number>(rooms[0]?.id || 1);
  const [showWeekend, setShowWeekend] = useState(false);

  // Sync if currentUser changes
  React.useEffect(() => {
    if (currentRole === 'teacher' && currentUser?.teacher_id) {
      setViewMode('teacher');
      setSelectedTeacherId(currentUser.teacher_id);
    } else if (currentRole === 'student' && currentUser?.student_group_id) {
      setViewMode('group');
      setSelectedGroupId(currentUser.student_group_id);
    }
  }, [currentRole, currentUser]);

  // Manual scheduling modal state
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ScheduleEntry | null>(null);

  // Form states for manual schedule entry
  const [mOfferingId, setMOfferingId] = useState<number>(offerings[0]?.id || 1);
  const [mDay, setMDay] = useState<number>(1);
  const [mStartSlot, setMStartSlot] = useState<number>(1);
  const [mPeriodLength, setMPeriodLength] = useState<number>(2);
  const [mRoomId, setMRoomId] = useState<number>(rooms[0]?.id || 1);

  // Drag state
  const [draggedEntryId, setDraggedEntryId] = useState<number | null>(null);
  const [dragOverDay, setDragOverDay] = useState<number | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);

  const offeringMap = new Map<number, CourseOffering>(offerings.map((o) => [o.id, o]));
  const courseMap = new Map<number, Course>(courses.map((c) => [c.id, c]));
  const teacherMap = new Map<number, Teacher>(teachers.map((t) => [t.id, t]));
  const groupMap = new Map<number, StudentGroup>(studentGroups.map((g) => [g.id, g]));
  const roomMap = new Map<number, Room>(rooms.map((r) => [r.id, r]));

  // Filter entries according to active view mode
  const filteredEntries = entries.filter((entry) => {
    const off = offeringMap.get(entry.course_offering_id);
    if (!off) return false;

    if (viewMode === 'group') {
      return off.student_group_id === selectedGroupId;
    } else if (viewMode === 'teacher') {
      return off.teacher_id === selectedTeacherId;
    } else if (viewMode === 'room') {
      return entry.room_id === selectedRoomId;
    }
    return true; // Master view
  });

  const days = showWeekend ? [1, 2, 3, 4, 5, 6, 7] : [1, 2, 3, 4, 5];

  // Helper to check if slot is blocked
  const getBlockedSlotInfo = (day: number, slotId: number) => {
    const slotObj = timeslots.find((s) => s.id === slotId);
    return blockedTimeslots.find(
      (b) =>
        b.is_active &&
        (b.day_of_week === 0 || b.day_of_week === day) &&
        (b.timeslot_id === slotId || (slotObj?.is_lunch && b.type === 'LUNCH'))
    );
  };

  // Conflict calculation for manual modal
  const selectedOffering = offeringMap.get(mOfferingId);
  const selectedTeacher = selectedOffering ? teacherMap.get(selectedOffering.teacher_id) : null;
  const selectedGroup = selectedOffering ? groupMap.get(selectedOffering.student_group_id) : null;

  const manualConflicts: string[] = [];
  if (selectedOffering) {
    const endSlot = mStartSlot + mPeriodLength - 1;
    // Check teacher clash
    const teacherClash = entries.some(
      (e) =>
        e.id !== editingEntry?.id &&
        e.day_of_week === mDay &&
        offeringMap.get(e.course_offering_id)?.teacher_id === selectedOffering.teacher_id &&
        !(endSlot < e.start_timeslot_id || mStartSlot > e.end_timeslot_id)
    );
    if (teacherClash) {
      manualConflicts.push(`อาจารย์ ${selectedTeacher?.prefix}${selectedTeacher?.name} ติดสอนวิชาอื่นในช่วงเวลานี้`);
    }

    // Check room clash
    const roomClash = entries.some(
      (e) =>
        e.id !== editingEntry?.id &&
        e.day_of_week === mDay &&
        e.room_id === mRoomId &&
        !(endSlot < e.start_timeslot_id || mStartSlot > e.end_timeslot_id)
    );
    if (roomClash) {
      manualConflicts.push(`ห้อง ${roomMap.get(mRoomId)?.room_number} มีการใช้งานอยู่แล้วในช่วงเวลานี้`);
    }

    // Check group clash
    const groupClash = entries.some(
      (e) =>
        e.id !== editingEntry?.id &&
        e.day_of_week === mDay &&
        offeringMap.get(e.course_offering_id)?.student_group_id === selectedOffering.student_group_id &&
        !(endSlot < e.start_timeslot_id || mStartSlot > e.end_timeslot_id)
    );
    if (groupClash) {
      manualConflicts.push(`กลุ่มนักศึกษา ${selectedGroup?.code} ติดเรียนวิชาอื่นในช่วงเวลานี้`);
    }

    // Lunch break clash: only slot 7 (12:00 - 13:00)
    const lunchSlot = timeslots.find((s) => s.is_lunch) || timeslots.find((s) => s.start_time === '12:00');
    const lunchSlotId = lunchSlot ? lunchSlot.id : 7;
    if (mStartSlot <= lunchSlotId && endSlot >= lunchSlotId) {
      manualConflicts.push('ช่วงเวลานี้ตรงกับช่วงพักกลางวัน (12:00 - 13:00 น.)');
    }
  }

  const handleOpenManualAdd = (day?: number, slot?: number) => {
    setEditingEntry(null);
    if (day) setMDay(day);
    if (slot) setMStartSlot(slot);
    setMPeriodLength(2);
    setMOfferingId(offerings[0]?.id || 1);
    setMRoomId(rooms[0]?.id || 1);
    setIsManualModalOpen(true);
  };

  const handleOpenEditEntry = (entry: ScheduleEntry) => {
    setEditingEntry(entry);
    setMOfferingId(entry.course_offering_id);
    setMDay(entry.day_of_week);
    setMStartSlot(entry.start_timeslot_id);
    setMPeriodLength(entry.period_length);
    setMRoomId(entry.room_id);
    setIsManualModalOpen(true);
  };

  const handleSaveManualSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const endSlot = mStartSlot + mPeriodLength - 1;

    if (editingEntry && onUpdateEntry) {
      onUpdateEntry({
        ...editingEntry,
        course_offering_id: mOfferingId,
        day_of_week: mDay,
        start_timeslot_id: mStartSlot,
        end_timeslot_id: endSlot,
        period_length: mPeriodLength,
        room_id: mRoomId,
      });
    } else if (onAddEntry) {
      onAddEntry({
        schedule_version_id: 1,
        course_offering_id: mOfferingId,
        session_index: 0,
        period_length: mPeriodLength,
        day_of_week: mDay,
        start_timeslot_id: mStartSlot,
        end_timeslot_id: endSlot,
        room_id: mRoomId,
        is_locked: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    setIsManualModalOpen(false);
  };

  const handleDragStart = (e: React.DragEvent, entryId: number) => {
    if (isVersionPublished) {
      e.preventDefault();
      return;
    }
    setDraggedEntryId(entryId);
    e.dataTransfer.setData('text/plain', String(entryId));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, day: number, slotId: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverDay(day);
    setDragOverSlot(slotId);
  };

  const handleDragLeave = () => {
    setDragOverDay(null);
    setDragOverSlot(null);
  };

  const handleDrop = (e: React.DragEvent, targetDay: number, targetSlot: number) => {
    e.preventDefault();
    setDragOverDay(null);
    setDragOverSlot(null);

    const entryId = Number(e.dataTransfer.getData('text/plain'));
    if (!entryId) return;

    const entry = entries.find((en) => en.id === entryId);
    if (!entry) return;

    // Use current room or fallback
    const targetRoomId = viewMode === 'room' ? selectedRoomId : entry.room_id;
    onRequestMove(entryId, targetDay, targetSlot, targetRoomId);
  };

  return (
    <div className="space-y-4">
      {/* Top Filter and Controls Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* View Mode Toggle Buttons */}
        <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
          <button
            onClick={() => setViewMode('group')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all ${
              viewMode === 'group'
                ? 'bg-white text-blue-700 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>รายกลุ่มเรียน</span>
          </button>

          <button
            onClick={() => setViewMode('teacher')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm transition-all ${
              viewMode === 'teacher'
                ? 'bg-white text-blue-700 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>รายอาจารย์</span>
          </button>

          <button
            onClick={() => setViewMode('room')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm transition-all ${
              viewMode === 'room'
                ? 'bg-white text-blue-700 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            <DoorClosed className="w-4 h-4" />
            <span>รายห้องเรียน</span>
          </button>

          <button
            onClick={() => setViewMode('master')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm transition-all ${
              viewMode === 'master'
                ? 'bg-white text-blue-700 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>ตารางรวม</span>
          </button>
        </div>

        {/* Dynamic Selector based on ViewMode */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          {viewMode === 'group' && (
            <div className="flex items-center space-x-2 w-full md:w-auto">
              <span className="text-sm text-slate-600 font-medium whitespace-nowrap">เลือกกลุ่มเรียน:</span>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(Number(e.target.value))}
                className="text-sm font-semibold bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 focus:ring-2 focus:ring-blue-500 w-full md:w-72"
              >
                {studentGroups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.code} - {g.name} ({g.student_count} คน)
                  </option>
                ))}
              </select>
            </div>
          )}

          {viewMode === 'teacher' && (
            <div className="flex items-center space-x-2 w-full md:w-auto">
              <span className="text-sm text-slate-600 font-medium whitespace-nowrap">เลือกอาจารย์:</span>
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(Number(e.target.value))}
                className="text-sm font-semibold bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 focus:ring-2 focus:ring-blue-500 w-full md:w-72"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.prefix} {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {viewMode === 'room' && (
            <div className="flex items-center space-x-2 w-full md:w-auto">
              <span className="text-sm text-slate-600 font-medium whitespace-nowrap">เลือกห้องเรียน:</span>
              <select
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(Number(e.target.value))}
                className="text-sm font-semibold bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 focus:ring-2 focus:ring-blue-500 w-full md:w-72"
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.room_number} ({r.building}, จุ {r.capacity} คน)
                  </option>
                ))}
              </select>
            </div>
          )}

          {isVersionPublished && (
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-xs font-medium">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>ตาราง Publish แล้ว (Locked)</span>
            </div>
          )}

          <button
            onClick={() => setShowWeekend(!showWeekend)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              showWeekend
                ? 'bg-purple-50 text-purple-800 border-purple-300'
                : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
            title="สลับแสดง 5 วัน หรือ 7 วัน"
          >
            {showWeekend ? 'แสดง 7 วัน (จ.-อา.)' : 'แสดง 5 วัน (จ.-ศ.)'}
          </button>

          <button
            onClick={() => handleOpenManualAdd()}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>จัดคาบลงตาราง (เจ้าหน้าที่)</span>
          </button>

          <button
            onClick={() => setShowOfficialDoc(!showOfficialDoc)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              showOfficialDoc
                ? 'bg-[#8B7D52] text-white shadow-xs'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{showOfficialDoc ? 'สลับกลับโหมดจัดตาราง' : 'ดูแบบฟอร์มทางการ 15 คาบ'}</span>
          </button>
        </div>
      </div>

      {showOfficialDoc ? (
        <OfficialTimetableDocument
          entries={entries}
          offerings={offerings}
          courses={courses}
          teachers={teachers}
          studentGroups={studentGroups}
          rooms={rooms}
          timeslots={timeslots}
          activeSemester={activeSemester || initialSemesters[0]}
          settings={settings || initialSettings}
          viewMode={viewMode === 'master' ? 'teacher' : viewMode}
          targetId={viewMode === 'group' ? selectedGroupId : viewMode === 'teacher' ? selectedTeacherId : selectedRoomId}
          onTargetChange={(id) => {
            if (viewMode === 'group') setSelectedGroupId(id);
            if (viewMode === 'teacher') setSelectedTeacherId(id);
            if (viewMode === 'room') setSelectedRoomId(id);
          }}
          onViewModeChange={(m) => setViewMode(m)}
        />
      ) : (
        <>

      {/* Grid Legend & Instructions */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 px-1 gap-2">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-blue-50 border border-blue-200 inline-block" />
            <span>วิชาบรรยาย (Lecture)</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-indigo-100 border border-indigo-300 inline-block" />
            <span>วิชาปฏิบัติการ (Computer Lab)</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-amber-100 border border-amber-300 inline-block" />
            <span>พักกลางวัน (12:00-13:00)</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-purple-100 border border-purple-300 inline-block" />
            <span>คาบกิจกรรม (พุธ 15:00-16:00)</span>
          </span>
        </div>

        <span className="text-[11px] text-slate-400 italic">
          * สามารถคลิกลาก (Drag & Drop) เพื่อย้ายคาบเรียนได้ โดยระบบจะตรวจสอบข้อขัดแย้งแบบ Real-time
        </span>
      </div>

      {/* Timetable Weekly Matrix Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
        <table className="w-full border-collapse text-left min-w-[950px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <th className="w-28 py-3 px-3 border-r border-slate-200 text-center">วัน / เวลา</th>
              {timeslots.map((slot) => (
                <th
                  key={slot.id}
                  className={`py-2 px-2 border-r border-slate-200 text-center font-semibold ${
                    slot.is_lunch ? 'bg-amber-50/70 text-amber-900' : ''
                  }`}
                >
                  <div className="text-sm font-bold text-slate-800">คาบ {slot.period_number}</div>
                  <div className="text-xs text-slate-500 font-mono font-medium">
                    {slot.start_time} - {slot.end_time}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {days.map((day) => {
              return (
                <tr key={day} className="h-28 hover:bg-slate-50/40 transition-colors">
                  {/* Day Column Header */}
                  <td className="py-2.5 px-3.5 border-r border-slate-200 font-semibold text-sm text-slate-800 bg-slate-50/80 text-center align-middle">
                    <div className="font-bold text-slate-900 text-base">{getDayShortName(day)}</div>
                    <div className="text-xs text-slate-500 font-medium">Day {day}</div>
                  </td>

                  {/* 9 Timeslot Columns */}
                  {timeslots.map((slot) => {
                    const blocked = getBlockedSlotInfo(day, slot.id);

                    // Find if any entry starts at this slot for this day
                    const matchingEntries = filteredEntries.filter(
                      (e) => e.day_of_week === day && e.start_timeslot_id === slot.id
                    );

                    // Check if this cell is spanned by an earlier multi-period entry
                    const isSpanned = filteredEntries.some(
                      (e) =>
                        e.day_of_week === day &&
                        slot.id > e.start_timeslot_id &&
                        slot.id <= e.end_timeslot_id
                    );

                    if (isSpanned) {
                      // Already occupied by a multi-period card
                      return null;
                    }

                    // Blocked timeslot styling (Lunch or Wednesday activity)
                    if (blocked) {
                      return (
                        <td
                          key={slot.id}
                          className={`p-2.5 border-r border-slate-200 text-center align-middle ${
                            blocked.type === 'LUNCH'
                              ? 'bg-amber-50/70 text-amber-800'
                              : 'bg-purple-50/70 text-purple-800'
                          }`}
                        >
                          <div className="flex flex-col items-center justify-center space-y-1.5">
                            {blocked.type === 'LUNCH' ? (
                              <Coffee className="w-5 h-5 text-amber-600" />
                            ) : (
                              <Flag className="w-5 h-5 text-purple-600" />
                            )}
                            <span className="text-xs font-bold leading-tight">{blocked.title}</span>
                          </div>
                        </td>
                      );
                    }

                    const isDropTarget = dragOverDay === day && dragOverSlot === slot.id;

                    return (
                      <td
                        key={slot.id}
                        colSpan={matchingEntries.length > 0 ? matchingEntries[0].period_length : 1}
                        onDragOver={(e) => handleDragOver(e, day, slot.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, day, slot.id)}
                        className={`p-1.5 border-r border-slate-200 align-top transition-colors relative ${
                          isDropTarget ? 'bg-blue-100 ring-2 ring-blue-400 ring-inset' : ''
                        }`}
                      >
                        {matchingEntries.map((entry) => {
                          const off = offeringMap.get(entry.course_offering_id);
                          const crs = off ? courseMap.get(off.course_id) : null;
                          const tch = off ? teacherMap.get(off.teacher_id) : null;
                          const grp = off ? groupMap.get(off.student_group_id) : null;
                          const rm = roomMap.get(entry.room_id);

                          const isLab = off?.room_type_id === 2 || off?.room_type_id === 3 || off?.room_type_id === 4;

                          return (
                            <div
                              key={entry.id}
                              draggable={!isVersionPublished}
                              onDragStart={(e) => handleDragStart(e, entry.id)}
                              className={`rounded-lg p-3 shadow-xs border transition-all select-none cursor-move hover:shadow-md ${
                                isLab
                                  ? 'bg-indigo-50/90 border-indigo-200 text-indigo-950'
                                  : 'bg-blue-50/90 border-blue-200 text-blue-950'
                              }`}
                              style={{ borderLeftWidth: '5px', borderLeftColor: tch?.color_code || '#3b82f6' }}
                            >
                              <div className="flex items-start justify-between gap-1">
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-mono text-xs font-bold text-blue-700 bg-white/80 px-1.5 py-0.5 rounded border border-blue-100">
                                      {crs?.code}
                                    </span>
                                    <span className="text-xs px-1.5 py-0.5 rounded bg-white border border-slate-200 font-semibold text-slate-700">
                                      {entry.period_length} คาบ
                                    </span>
                                  </div>
                                  <h4 className="text-sm font-bold leading-snug line-clamp-1">
                                    {crs?.name_th}
                                  </h4>
                                </div>

                                <div className="flex items-center space-x-1 shrink-0">
                                  <button
                                    onClick={() => handleOpenEditEntry(entry)}
                                    title="แก้ไขคาบ/ห้องเรียน (Edit Slot/Room)"
                                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-white rounded-md transition-colors"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => onOpenSuggestModal(entry.id)}
                                    title="ค้นหาช่วงเวลาที่เหมาะสม (Suggest Alternative Slot)"
                                    className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-white rounded-md transition-colors"
                                  >
                                    <Sparkles className="w-4 h-4" />
                                  </button>
                                  {onDeleteEntry && (
                                    <button
                                      onClick={() => {
                                        if (confirm(`ต้องการปลดวิชา ${crs?.name_th} ออกจากตารางหรือไม่? (ระบบจะลบออกจากฐานข้อมูลด้วย)`)) {
                                          onDeleteEntry(entry.id);
                                        }
                                      }}
                                      title="ปลดวิชาออกจากตาราง (Remove from slot)"
                                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-white rounded-md transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>

                              <div className="mt-2.5 pt-2 border-t border-slate-200/80 space-y-1 text-xs text-slate-700">
                                <div className="flex items-center justify-between">
                                  <span className="truncate max-w-[160px]">
                                    ผู้สอน: <span className="font-semibold text-slate-900">{tch?.prefix}{tch?.name}</span>
                                  </span>
                                </div>
                                <div className="flex items-center justify-between font-mono text-xs">
                                  <span>ห้อง: <span className="font-bold text-slate-900 bg-white/70 px-1 py-0.2 rounded border border-slate-200">{rm?.room_number}</span></span>
                                  <span className="text-slate-600 font-medium">กลุ่ม: {grp?.code}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {/* Empty droppable area indicator */}
                        {matchingEntries.length === 0 && (
                          <button
                            type="button"
                            onClick={() => handleOpenManualAdd(day, slot.id)}
                            className="w-full h-full min-h-[5rem] flex flex-col items-center justify-center text-slate-300 hover:text-blue-600 hover:bg-blue-50/40 rounded transition-all group"
                            title="คลิกเพื่อจัดวิชาลงคาบนี้โดยตรง"
                          >
                            <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity mb-0.5" />
                            <span className="text-[10px] font-mono group-hover:font-bold">ว่าง</span>
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
        </>
      )}

      {/* Manual Class Scheduling Modal for Academic Affairs */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-base">
                  {editingEntry ? 'แก้ไขข้อมูลคาบเรียน / ห้องเรียน' : 'จัดวิชาลงตารางด้วยตนเอง (สำหรับฝ่ายวิชาการ)'}
                </h3>
              </div>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManualSchedule} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  วิชาเปิดสอน (Course Offering)
                </label>
                <select
                  value={mOfferingId}
                  onChange={(e) => setMOfferingId(Number(e.target.value))}
                  className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                >
                  {offerings.map((o) => {
                    const c = courseMap.get(o.course_id);
                    const t = teacherMap.get(o.teacher_id);
                    const g = groupMap.get(o.student_group_id);
                    return (
                      <option key={o.id} value={o.id}>
                        [{c?.code}] {c?.name_th} — {t?.name} ({g?.code})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">วันสอน (Day)</label>
                  <select
                    value={mDay}
                    onChange={(e) => setMDay(Number(e.target.value))}
                    className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value={1}>วันจันทร์ (Monday)</option>
                    <option value={2}>วันอังคาร (Tuesday)</option>
                    <option value={3}>วันพุธ (Wednesday)</option>
                    <option value={4}>วันพฤหัสบดี (Thursday)</option>
                    <option value={5}>วันศุกร์ (Friday)</option>
                    <option value={6}>วันเสาร์ (Saturday)</option>
                    <option value={7}>วันอาทิตย์ (Sunday)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">คาบเริ่ม (Start Slot)</label>
                  <select
                    value={mStartSlot}
                    onChange={(e) => setMStartSlot(Number(e.target.value))}
                    className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {timeslots.map((slot) => (
                      <option key={slot.id} value={slot.id}>
                        คาบ {slot.period_number} ({slot.start_time}-{slot.end_time})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">จำนวนคาบ (Duration)</label>
                  <select
                    value={mPeriodLength}
                    onChange={(e) => setMPeriodLength(Number(e.target.value))}
                    className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value={1}>1 คาบ (1 ชม.)</option>
                    <option value={2}>2 คาบ (2 ชม.)</option>
                    <option value={3}>3 คาบ (3 ชม.)</option>
                    <option value={4}>4 คาบ (4 ชม.)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ห้องเรียน (Room)
                </label>
                <select
                  value={mRoomId}
                  onChange={(e) => setMRoomId(Number(e.target.value))}
                  className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.room_number} — {r.building} (ความจุ {r.capacity} ที่นั่ง)
                    </option>
                  ))}
                </select>
              </div>

              {/* Real-time Conflict Validation Banner */}
              <div className="pt-1">
                {manualConflicts.length > 0 ? (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1 text-rose-800">
                    <div className="flex items-center space-x-1.5 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>ตรวจพบข้อขัดแย้ง ({manualConflicts.length} จุด):</span>
                    </div>
                    <ul className="text-xs list-disc list-inside space-y-0.5 pl-1">
                      {manualConflicts.map((c, idx) => (
                        <li key={idx}>{c}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-emerald-800 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>ตรวจสอบแล้ว: ไม่มีข้อขัดแย้งด้านเวลา ห้องเรียน และผู้สอน พร้อมบันทึกลงตาราง</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end items-center space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
                >
                  {editingEntry ? 'บันทึกการแก้ไข' : 'ยืนยันจัดลงตาราง'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
