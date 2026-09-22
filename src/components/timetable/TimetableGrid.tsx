import React, { useState } from 'react';
import {
  Users,
  UserCheck,
  DoorClosed,
  LayoutGrid,
  Lock,
  Sparkles,
  Calendar,
  FileSpreadsheet,
  FileText,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  X,
  Send,
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
  onTogglePublish?: () => void;
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
  onTogglePublish,
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
    return studentGroups.find((g) => g.code === 'คธ.1')?.id || studentGroups[0]?.id || 6;
  });

  const [selectedTeacherId, setSelectedTeacherId] = useState<number>(() => {
    if (currentUser?.teacher_id) return currentUser.teacher_id;
    const pinya = teachers.find((t) => t.name.includes('ภิญญา'));
    return pinya ? pinya.id : teachers[0]?.id || 11;
  });

  const [selectedRoomId, setSelectedRoomId] = useState<number>(() => {
    return rooms.find((r) => r.room_number.includes('0502-2303'))?.id || rooms[0]?.id || 11;
  });

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
  const [mStartSlot, setMStartSlot] = useState<number>(6);
  const [mPeriodLength, setMPeriodLength] = useState<number>(2);
  const [mRoomId, setMRoomId] = useState<number>(rooms[0]?.id || 11);

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

  // Export to Excel function
  const handleExportExcel = () => {
    const csvRows = [
      ['วัน', 'คาบเรียน', 'เวลา', 'รหัสวิชา', 'ชื่อวิชา', 'กลุ่มเรียน', 'อาจารย์ผู้สอน', 'ห้องเรียน'],
    ];
    filteredEntries.forEach((entry) => {
      const off = offeringMap.get(entry.course_offering_id);
      const crs = off ? courseMap.get(off.course_id) : null;
      const tch = off ? teacherMap.get(off.teacher_id) : null;
      const grp = off ? groupMap.get(off.student_group_id) : null;
      const rm = roomMap.get(entry.room_id);
      const startSlot = timeslots.find((s) => s.id === entry.start_timeslot_id);
      const endSlot = timeslots.find((s) => s.id === entry.end_timeslot_id);
      csvRows.push([
        getDayName(entry.day_of_week),
        `คาบ ${entry.start_timeslot_id} - ${entry.end_timeslot_id}`,
        `${startSlot?.start_time || ''} - ${endSlot?.end_time || ''}`,
        crs?.code || '',
        crs?.name_th || '',
        grp?.code || '',
        `${tch?.prefix || ''}${tch?.name || ''}`,
        rm?.room_number || '',
      ]);
    });
    const csvContent = '\uFEFF' + csvRows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ตารางเรียน_${viewMode}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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

    // Lunch break clash: slot with is_lunch
    const lunchSlot = timeslots.find((s) => s.is_lunch) || timeslots.find((s) => s.start_time === '12:00');
    const lunchSlotId = lunchSlot ? lunchSlot.id : 5;
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
    setMRoomId(rooms[0]?.id || 11);
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

  const viewTitleText =
    viewMode === 'teacher'
      ? 'รายอาจารย์'
      : viewMode === 'group'
      ? 'รายกลุ่มเรียน'
      : viewMode === 'room'
      ? 'รายห้องเรียน'
      : 'ตารางรวม';

  // Find the selected teacher name for the subtitle / selector
  const activeTeacher = teacherMap.get(selectedTeacherId);

  return (
    <div className="space-y-4">
      {/* Top Header: Title & Main Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-1">
        <div className="flex items-start space-x-3">
          <div className="text-blue-600 p-1 mt-0.5">
            <Calendar className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
              ตารางเรียน - ตารางสอน ({viewTitleText})
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {settings?.faculty_name || 'วิทยาลัยธาตุพนม / คณะวิทยาการจัดการและเทคโนโลยีสารสนเทศ'} •{' '}
              {activeSemester?.name || 'ภาคเรียนที่ 1/2569'}
            </p>
          </div>
        </div>

        {/* Top Right Action Buttons: Excel, PDF, Publish */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={handleExportExcel}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>ส่งออก Excel</span>
          </button>

          <button
            type="button"
            onClick={() => setShowOfficialDoc(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-rose-300 bg-white hover:bg-rose-50 text-rose-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4 text-rose-600" />
            <span>ดูแบบฟอร์มทางการ 15 สัปดาห์ (PDF)</span>
          </button>

          <button
            type="button"
            onClick={() => onTogglePublish?.()}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isVersionPublished ? 'เผยแพร่แล้ว (Published)' : 'เผยแพร่ตาราง (Publish)'}</span>
          </button>
        </div>
      </div>

      {/* Timetable Control & Filter Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
        {/* Row 1: Segmented View Selector, Dropdown Filter, Status Badge, Add Button */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Segmented View Switcher */}
          <div className="inline-flex rounded-lg border border-blue-500 overflow-hidden divide-x divide-blue-400/50 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('group')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 text-xs transition-colors cursor-pointer ${
                viewMode === 'group'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-white text-blue-600 hover:bg-blue-50 font-semibold'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>รายกลุ่มเรียน</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('teacher')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 text-xs transition-colors cursor-pointer ${
                viewMode === 'teacher'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-white text-blue-600 hover:bg-blue-50 font-semibold'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>รายอาจารย์</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('room')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 text-xs transition-colors cursor-pointer ${
                viewMode === 'room'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-white text-blue-600 hover:bg-blue-50 font-semibold'
              }`}
            >
              <DoorClosed className="w-3.5 h-3.5" />
              <span>รายห้องเรียน</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('master')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 text-xs transition-colors cursor-pointer ${
                viewMode === 'master'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-white text-blue-600 hover:bg-blue-50 font-semibold'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>ตารางรวม</span>
            </button>
          </div>

          {/* Dynamic Selector Dropdown based on ViewMode */}
          <div className="flex flex-wrap items-center space-x-3">
            {viewMode === 'group' && (
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-700 whitespace-nowrap">เลือกกลุ่มเรียน:</span>
                <select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(Number(e.target.value))}
                  className="text-xs font-medium border border-slate-300 rounded-lg px-3 py-1.5 bg-white w-64 focus:ring-2 focus:ring-blue-500 focus:outline-hidden cursor-pointer"
                >
                  {studentGroups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.code} - {g.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {viewMode === 'teacher' && (
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-700 whitespace-nowrap">เลือกอาจารย์:</span>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(Number(e.target.value))}
                  className="text-xs font-medium border border-slate-300 rounded-lg px-3 py-1.5 bg-white w-64 sm:w-80 focus:ring-2 focus:ring-blue-500 focus:outline-hidden cursor-pointer"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.prefix}{t.name} (สาขาวิทยาการคอมพิวเตอร์และเทคโนโลยีสารสนเทศ)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {viewMode === 'room' && (
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-700 whitespace-nowrap">เลือกห้องเรียน:</span>
                <select
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(Number(e.target.value))}
                  className="text-xs font-medium border border-slate-300 rounded-lg px-3 py-1.5 bg-white w-64 focus:ring-2 focus:ring-blue-500 focus:outline-hidden cursor-pointer"
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.room_number} ({r.building})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Status Badge */}
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-100 text-amber-900 border border-amber-300">
              <Lock className="w-3.5 h-3.5 text-amber-700" />
              <span>สถานะ: {isVersionPublished ? 'Published (ล็อกแล้ว)' : 'Draft (แก้ไขได้)'}</span>
            </div>

            {/* Add Class Button */}
            <button
              type="button"
              onClick={() => handleOpenManualAdd()}
              className="flex items-center space-x-1 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่มคาบสอน</span>
            </button>
          </div>
        </div>

        {/* Row 2: Legend & Category Colors */}
        <div className="flex flex-wrap items-center space-x-4 text-xs text-slate-700 pt-1">
          <span className="font-bold text-slate-800">ประเภทวิชา:</span>
          <span className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-xs bg-blue-600 inline-block" />
            <span>วิชาบรรยาย (Lecture)</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-xs bg-emerald-600 inline-block" />
            <span>วิชาปฏิบัติการ (Lab)</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-xs bg-amber-500 inline-block" />
            <span>พักกลางวัน (12:00-13:00)</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-xs bg-purple-600 inline-block" />
            <span>กิจกรรมเสริมทักษะวิชาการ</span>
          </span>
        </div>

        {/* Row 3: Hint Note */}
        <div className="flex items-center space-x-1.5 text-xs text-slate-500 pt-0.5">
          <span className="text-amber-500">📍</span>
          <span>คลิกที่ช่องว่างเพื่อเพิ่มวิชาเรียน หรือคลิกไอคอนดินสอบนการ์ดเพื่อแก้ไข</span>
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
        /* Timetable Weekly Matrix Table */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
          <table className="w-full border-collapse text-left min-w-[950px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700">
                <th className="w-28 py-3 px-3 border-r border-slate-200 text-center uppercase tracking-wider">
                  วัน / เวลา
                </th>
                {timeslots.map((slot) => {
                  if (slot.is_lunch) {
                    return (
                      <th
                        key={slot.id}
                        className="py-2.5 px-2 border-r border-dashed border-amber-300 text-center font-semibold bg-amber-50 text-amber-900 w-16"
                      >
                        <div className="text-sm font-bold text-amber-900">พัก</div>
                        <div className="text-xs text-amber-700 font-medium">12:00 - 13:00</div>
                      </th>
                    );
                  }

                  return (
                    <th
                      key={slot.id}
                      className="py-2.5 px-2 border-r border-slate-200 text-center font-semibold"
                    >
                      <div className="text-sm font-bold text-slate-800">คาบ {slot.period_number}</div>
                      <div className="text-xs text-slate-500 font-medium">
                        {slot.start_time} - {slot.end_time}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {days.map((day) => {
                const dayNameEn =
                  day === 1
                    ? 'MONDAY'
                    : day === 2
                    ? 'TUESDAY'
                    : day === 3
                    ? 'WEDNESDAY'
                    : day === 4
                    ? 'THURSDAY'
                    : day === 5
                    ? 'FRIDAY'
                    : day === 6
                    ? 'SATURDAY'
                    : 'SUNDAY';

                return (
                  <tr key={day} className="h-28 hover:bg-slate-50/40 transition-colors">
                    {/* Day Column Header */}
                    <td className="py-2.5 px-3.5 border-r border-slate-200 font-semibold text-sm text-slate-800 bg-slate-50/80 text-center align-middle">
                      <div className="font-bold text-slate-900 text-sm">{getDayName(day)}</div>
                      <div className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5">
                        {dayNameEn}
                      </div>
                    </td>

                    {/* Timeslot Columns */}
                    {timeslots.map((slot) => {
                      // Blocked timeslot check
                      const blocked = getBlockedSlotInfo(day, slot.id);

                      // Lunch break column: special vertical styling
                      if (slot.is_lunch) {
                        return (
                          <td
                            key={slot.id}
                            className="p-0 border-r border-dashed border-amber-300 bg-amber-50/40 text-center align-middle"
                          >
                            <div className="flex flex-col items-center justify-center h-full [writing-mode:vertical-lr] text-amber-600 font-bold text-xs tracking-widest select-none py-4 space-y-1.5">
                              <span className="rotate-90 text-sm">🍴</span>
                              <span>พักกลางวัน</span>
                            </div>
                          </td>
                        );
                      }

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

                      // Wednesday Activity blocked styling
                      if (blocked && blocked.type === 'ACTIVITY') {
                        return (
                          <td
                            key={slot.id}
                            className="p-2 border-r border-slate-200 text-center align-middle bg-purple-50/70 text-purple-800"
                          >
                            <div className="flex flex-col items-center justify-center space-y-1">
                              <Sparkles className="w-4 h-4 text-purple-600" />
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

                            const isActivity =
                              crs?.code === 'ACTIVITY-WED' || off?.course_id === 28;
                            const isLab =
                              !isActivity &&
                              (off?.room_type_id === 2 ||
                                off?.room_type_id === 3 ||
                                off?.room_type_id === 4);

                            return (
                              <div
                                key={entry.id}
                                draggable={!isVersionPublished}
                                onDragStart={(e) => handleDragStart(e, entry.id)}
                                className={`rounded-lg p-2.5 shadow-2xs border transition-all select-none cursor-move hover:shadow-md ${
                                  isActivity
                                    ? 'bg-purple-50/90 border-purple-200 border-l-4 border-l-purple-600 text-purple-950'
                                    : isLab
                                    ? 'bg-emerald-50/90 border-emerald-200 border-l-4 border-l-emerald-600 text-emerald-950'
                                    : 'bg-sky-50/90 border-blue-200 border-l-4 border-l-blue-600 text-blue-950'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-1">
                                  <div className="flex items-center space-x-1.5 flex-wrap">
                                    <span className="font-bold text-xs text-slate-900">
                                      {crs?.code}
                                    </span>
                                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                                      {entry.period_length} คาบ
                                    </span>
                                  </div>

                                  <div className="flex items-center space-x-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditEntry(entry)}
                                      title="แก้ไขคาบ/ห้องเรียน"
                                      className="p-1 text-slate-400 hover:text-blue-600 hover:bg-white rounded transition-colors cursor-pointer"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    {onDeleteEntry && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (
                                            confirm(
                                              `ต้องการปลดวิชา ${crs?.name_th} ออกจากตารางหรือไม่?`
                                            )
                                          ) {
                                            onDeleteEntry(entry.id);
                                          }
                                        }}
                                        title="ลบออกจากตาราง"
                                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded transition-colors cursor-pointer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>

                                <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1 leading-snug">
                                  {crs?.name_th}
                                </h4>

                                <div className="mt-1.5 text-[11px] text-slate-600 space-y-0.5">
                                  <div className="flex items-center justify-between">
                                    <span>📍 ห้อง: {rm?.room_number}</span>
                                    {grp?.code && (
                                      <span className="text-slate-700 font-semibold">
                                        กลุ่ม: {grp?.code}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-slate-600">
                                    👤 {tch?.prefix}
                                    {tch?.name}
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
                              className="w-full h-full min-h-[4.5rem] flex flex-col items-center justify-center text-slate-300 hover:text-blue-600 hover:bg-blue-50/40 rounded transition-all group cursor-pointer"
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
      )}

      {/* Manual Class Scheduling Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden">
            <div className="px-6 py-4 bg-[#1e2430] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-base">
                  {editingEntry ? 'แก้ไขข้อมูลคาบเรียน / ห้องเรียน' : 'จัดวิชาลงตารางด้วยตนเอง (เจ้าหน้าที่)'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsManualModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
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

              {/* Conflict Validation Banner */}
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
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
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
