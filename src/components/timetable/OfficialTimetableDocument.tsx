import React, { useRef, useState } from 'react';
import { Printer, Download, Share2, ZoomIn, ZoomOut, Check, ChevronDown } from 'lucide-react';
import { PrintDialogModal } from '../common/PrintDialogModal';
import {
  ScheduleEntry,
  CourseOffering,
  Course,
  Teacher,
  StudentGroup,
  Room,
  Timeslot,
  Semester,
  AppSettings,
} from '../../types';

interface OfficialTimetableDocumentProps {
  entries: ScheduleEntry[];
  offerings: CourseOffering[];
  courses: Course[];
  teachers: Teacher[];
  studentGroups: StudentGroup[];
  rooms: Room[];
  timeslots: Timeslot[];
  activeSemester: Semester;
  settings: AppSettings;
  viewMode: 'teacher' | 'group' | 'room';
  targetId: number;
  onTargetChange?: (id: number) => void;
  onViewModeChange?: (mode: 'teacher' | 'group' | 'room') => void;
}

// Day code mapping (M, TU, W, TH, F, SA, SU)
const DAY_CODES: Record<number, string> = {
  1: 'M',
  2: 'TU',
  3: 'W',
  4: 'TH',
  5: 'F',
  6: 'SA',
  7: 'SU',
};

const DAY_NAMES_TH: Record<number, string> = {
  1: 'จันทร์',
  2: 'อังคาร',
  3: 'พุธ',
  4: 'พฤหัส',
  5: 'ศุกร์',
  6: 'เสาร์',
  7: 'อาทิตย์',
};

// 15 Periods time intervals
const PERIOD_TIMES = [
  { p: 1, start: '06.00', end: '07.00' },
  { p: 2, start: '07.00', end: '08.00' },
  { p: 3, start: '08.00', end: '09.00' },
  { p: 4, start: '09.00', end: '10.00' },
  { p: 5, start: '10.00', end: '11.00' },
  { p: 6, start: '11.00', end: '12.00' },
  { p: 7, start: '12.00', end: '13.00' },
  { p: 8, start: '13.00', end: '14.00' },
  { p: 9, start: '14.00', end: '15.00' },
  { p: 10, start: '15.00', end: '16.00' },
  { p: 11, start: '16.00', end: '17.00' },
  { p: 12, start: '17.00', end: '18.00' },
  { p: 13, start: '18.00', end: '19.00' },
  { p: 14, start: '19.00', end: '20.00' },
  { p: 15, start: '20.00', end: '21.00' },
];

export const OfficialTimetableDocument: React.FC<OfficialTimetableDocumentProps> = ({
  entries,
  offerings,
  courses,
  teachers,
  studentGroups,
  rooms,
  timeslots,
  activeSemester,
  settings,
  viewMode,
  targetId,
  onTargetChange,
  onViewModeChange,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  const offeringMap = new Map<number, CourseOffering>(offerings.map((o) => [o.id, o]));
  const courseMap = new Map<number, Course>(courses.map((c) => [c.id, c]));
  const teacherMap = new Map<number, Teacher>(teachers.map((t) => [t.id, t]));
  const groupMap = new Map<number, StudentGroup>(studentGroups.map((g) => [g.id, g]));
  const roomMap = new Map<number, Room>(rooms.map((r) => [r.id, r]));

  // Selected target entity
  const currentTeacher = teacherMap.get(targetId) || teachers[0];
  const currentGroup = groupMap.get(targetId) || studentGroups[0];
  const currentRoom = roomMap.get(targetId) || rooms[0];

  // Title labels
  let docTitle = 'ตารางสอน';
  let targetName = '';
  let targetSubTitle = 'วิทยาลัยธาตุพนม';
  let roleTitle = 'อาจารย์ประจำ';

  if (viewMode === 'teacher') {
    docTitle = 'ตารางสอน';
    targetName = `ตารางการสอนของ ${currentTeacher?.prefix || ''}${currentTeacher?.name || ''}`;
    targetSubTitle = 'คณะ วิทยาลัยธาตุพนม';
    roleTitle = 'อาจารย์ประจำ';
  } else if (viewMode === 'group') {
    docTitle = 'ตารางเรียน';
    targetName = `ตารางเรียนของ ${currentGroup?.name || ''} (${currentGroup?.code || ''})`;
    targetSubTitle = 'วิทยาลัยธาตุพนม';
    roleTitle = `ระดับชั้น ${currentGroup?.name.split(' ')[0] || 'ปวช.'}`;
  } else {
    docTitle = 'ตารางการใช้ห้องเรียน';
    targetName = `ตารางการใช้ห้อง ${currentRoom?.room_number || ''} (${currentRoom?.building || ''})`;
    targetSubTitle = 'วิทยาลัยธาตุพนม';
    roleTitle = `ความจุ ${currentRoom?.capacity || 0} ที่นั่ง`;
  }

  // Filter entries for this target
  const currentEntries = entries.filter((e) => {
    const off = offeringMap.get(e.course_offering_id);
    if (!off) return false;
    if (viewMode === 'teacher') return off.teacher_id === currentTeacher?.id;
    if (viewMode === 'group') return off.student_group_id === currentGroup?.id;
    if (viewMode === 'room') return e.room_id === currentRoom?.id;
    return false;
  });

  // Collect Course Summaries for Top Table
  // Unique course offerings represented in this schedule
  const relevantOfferingIds = Array.from(new Set(currentEntries.map((e) => e.course_offering_id)));
  
  // If teacher has offerings that might not yet be placed, or currently placed offerings
  const displayOfferings = offerings.filter((off) => {
    if (viewMode === 'teacher') return off.teacher_id === currentTeacher?.id;
    if (viewMode === 'group') return off.student_group_id === currentGroup?.id;
    if (viewMode === 'room') return relevantOfferingIds.includes(off.id);
    return false;
  });

  // Calculate day-time schedule string for each offering
  const summaryRows = displayOfferings.map((off) => {
    const crs = courseMap.get(off.course_id);
    const grp = groupMap.get(off.student_group_id);
    const offEntries = currentEntries.filter((e) => e.course_offering_id === off.id);

    // Group schedule entries by day and time
    const timeSlotsStrings = offEntries.map((e) => {
      const dayCode = DAY_CODES[e.day_of_week] || 'M';
      // Find start & end time from period numbers
      const startPeriod = PERIOD_TIMES.find((pt) => pt.p === e.start_timeslot_id) || PERIOD_TIMES[2];
      const endPeriod = PERIOD_TIMES.find((pt) => pt.p === e.end_timeslot_id) || PERIOD_TIMES[5];
      const startFormatted = startPeriod.start.replace('.', ':');
      const endFormatted = endPeriod.end.replace('.', ':');
      return `${dayCode} ${startFormatted} -${endFormatted}`;
    });

    const creditsFormatted = crs ? `${crs.credits} (${crs.theory_hours}-${crs.practice_hours}-0)` : '3 (2-2-0)';

    return {
      offeringId: off.id,
      courseCode: crs?.code || '',
      courseName: crs?.name_th || '',
      credits: creditsFormatted,
      scheduleString: timeSlotsStrings.length > 0 ? timeSlotsStrings.join('\n') : '-',
      groupCode: grp?.code || grp?.name || '',
      studentCount: off.student_count || 0,
    };
  });

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printHtml, setPrintHtml] = useState('');

  const handlePrint = () => {
    if (printRef.current) {
      setPrintHtml(printRef.current.innerHTML);
    }
    setIsPrintModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Action & Control Bar */}
      <div className="print:hidden bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-700">มุมมองตาราง:</span>
          <div className="inline-flex rounded-lg border border-slate-200 p-1 bg-slate-50 text-xs">
            <button
              onClick={() => {
                onViewModeChange?.('teacher');
                if (onTargetChange) onTargetChange(teachers[0]?.id || 1);
              }}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                viewMode === 'teacher' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              อาจารย์ผู้สอน
            </button>
            <button
              onClick={() => {
                onViewModeChange?.('group');
                if (onTargetChange) onTargetChange(studentGroups[0]?.id || 1);
              }}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                viewMode === 'group' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              กลุ่มเรียน
            </button>
            <button
              onClick={() => {
                onViewModeChange?.('room');
                if (onTargetChange) onTargetChange(rooms[0]?.id || 1);
              }}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                viewMode === 'room' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ห้องเรียน
            </button>
          </div>

          {/* Target Selector */}
          <div className="flex items-center space-x-1.5 ml-2">
            <span className="text-xs text-slate-500">เลือก:</span>
            <select
              value={targetId}
              onChange={(e) => onTargetChange?.(Number(e.target.value))}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
            >
              {viewMode === 'teacher' &&
                teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.prefix} {t.name}
                  </option>
                ))}
              {viewMode === 'group' &&
                studentGroups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.code} - {g.name}
                  </option>
                ))}
              {viewMode === 'room' &&
                rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.room_number} ({r.building})
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center space-x-1 font-medium">
            <Check className="w-3.5 h-3.5" />
            <span>แบบฟอร์มมาตรฐานมหาวิทยาลัยนครพนม (15 คาบ)</span>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-4 py-2 bg-[#8B7D52] hover:bg-[#786b45] text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์เอกสาร (Print / PDF)</span>
          </button>
        </div>
      </div>

      {/* Main Authentic Document Paper Container */}
      <div
        ref={printRef}
        id="official-timetable-print-sheet"
        className="bg-white p-4 sm:p-6 rounded-xl border border-slate-300 shadow-sm print:shadow-none print:border-none print:p-0 print:m-0 text-slate-900 mx-auto max-w-[1200px] print:max-w-none print:w-full"
        style={{ fontFamily: "'Google Sans', 'Google Sans Text', 'Product Sans', 'Prompt', 'Sarabun', -apple-system, sans-serif" }}
      >
        {/* Document Header */}
        <div className="flex items-start justify-between border-b-2 border-slate-800 pb-3 mb-3">
          {/* Left: Logo & University Title */}
          <div className="flex items-center space-x-3.5">
            {/* University Crest / Emblem or Custom Logo */}
            <div className="w-14 h-14 shrink-0 flex items-center justify-center">
              {settings.system_logo_url ? (
                <img
                  src={settings.system_logo_url}
                  alt="Logo"
                  className="w-14 h-14 object-contain rounded"
                />
              ) : (
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xs">
                  {/* Traditional Thai university golden circular seal design */}
                  <circle cx="50" cy="50" r="46" fill="#fdfbf7" stroke="#8B7D52" strokeWidth="3" />
                  <circle cx="50" cy="50" r="41" fill="none" stroke="#8B7D52" strokeWidth="1" strokeDasharray="2,2" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#8B7D52" strokeWidth="1.5" />
                  {/* Spire / Lotus Flame Motif in center */}
                  <path
                    d="M50 16 C48 24, 42 30, 42 38 C42 45, 46 48, 50 54 C54 48, 58 45, 58 38 C58 30, 52 24, 50 16 Z"
                    fill="#8B7D52"
                  />
                  <path
                    d="M50 56 L35 70 C42 74, 58 74, 65 70 Z"
                    fill="#8B7D52"
                  />
                  <circle cx="50" cy="40" r="3" fill="#ffffff" />
                  <path
                    d="M34 46 C34 40, 39 36, 43 38 C41 44, 38 48, 34 50 Z"
                    fill="#b3a270"
                  />
                  <path
                    d="M66 46 C66 40, 61 36, 57 38 C59 44, 62 48, 66 50 Z"
                    fill="#b3a270"
                  />
                  <text
                    x="50"
                    y="83"
                    fontSize="7"
                    textAnchor="middle"
                    fill="#8B7D52"
                    fontWeight="bold"
                    fontFamily="'Google Sans', 'Sarabun', sans-serif"
                  >
                    มรพ.
                  </text>
                </svg>
              )}
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
                {settings.institution_name_th || 'มหาวิทยาลัยนครพนม'}
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-snug">
                {settings.system_name_th || 'ระบบจัดตารางเรียนตารางสอน'}
              </p>
            </div>
          </div>

          {/* Right: Document Category & Semester */}
          <div className="text-right">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
              {docTitle}
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-snug">
              {activeSemester.name || 'ภาคการศึกษา 1/2569'}
            </p>
          </div>
        </div>

        {/* Instructor / Faculty Details Sub-bar */}
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-900 mb-2.5 px-1">
          <div>
            <div>{targetName}</div>
            <div className="font-normal text-slate-700 text-xs mt-0.5">{targetSubTitle}</div>
          </div>
          <div className="text-right text-xs font-semibold text-slate-800">
            {roleTitle}
          </div>
        </div>

        {/* 1. Course Summary Table (ตารางรายการวิชาที่สอน) */}
        <div className="mb-4 overflow-x-auto">
          <table className="w-full text-xs border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-200/90 text-slate-800 font-bold border-b border-slate-300 text-center">
                <th className="border border-slate-300 py-1.5 px-2 w-28">รหัสวิชา</th>
                <th className="border border-slate-300 py-1.5 px-2 text-left">ชื่อวิชา</th>
                <th className="border border-slate-300 py-1.5 px-2 w-24">หน่วยกิต</th>
                <th className="border border-slate-300 py-1.5 px-2 w-44">วันเวลาสอน</th>
                <th className="border border-slate-300 py-1.5 px-2 w-24">กลุ่ม</th>
                <th className="border border-slate-300 py-1.5 px-2 w-28">นศ.ลงทะเบียน</th>
              </tr>
            </thead>
            <tbody>
              {/* Category Subheader */}
              <tr className="bg-slate-100/70 border-b border-slate-300 font-bold text-slate-800 text-[11px]">
                <td colSpan={6} className="py-1 px-3 border border-slate-300">
                  มหาวิทยาลัยนครพนม; ประกาศนียบัตรวิชาชีพ
                </td>
              </tr>

              {summaryRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-3 text-center text-slate-500 border border-slate-300">
                    ไม่พบรายการรายวิชาที่จัดสอน
                  </td>
                </tr>
              ) : (
                summaryRows.map((row) => (
                  <tr key={row.offeringId} className="border-b border-slate-300 text-[11px] hover:bg-slate-50">
                    <td className="border border-slate-300 py-1 px-2 text-center font-mono font-medium">
                      {row.courseCode}
                    </td>
                    <td className="border border-slate-300 py-1 px-2 font-medium">
                      {row.courseName}
                    </td>
                    <td className="border border-slate-300 py-1 px-2 text-center font-mono">
                      {row.credits}
                    </td>
                    <td className="border border-slate-300 py-1 px-2 text-center font-mono whitespace-pre-line text-[10.5px]">
                      {row.scheduleString}
                    </td>
                    <td className="border border-slate-300 py-1 px-2 text-center font-semibold">
                      {row.groupCode}
                    </td>
                    <td className="border border-slate-300 py-1 px-2 text-center font-mono">
                      {row.studentCount}
                    </td>
                  </tr>
                ))
              )}
              {/* Summary Totals Row */}
              {summaryRows.length > 0 && (
                <tr className="bg-slate-100/90 border-t-2 border-slate-300 font-bold text-slate-900 text-[11px]">
                  <td colSpan={2} className="border border-slate-300 py-1.5 px-3 text-right">
                    รวมทั้งสิ้น {summaryRows.length} รายวิชา:
                  </td>
                  <td className="border border-slate-300 py-1.5 px-2 text-center font-mono">
                    {displayOfferings.reduce((sum, o) => {
                      const c = courseMap.get(o.course_id);
                      return sum + (c?.credits || 0);
                    }, 0)} หน่วยกิต
                  </td>
                  <td className="border border-slate-300 py-1.5 px-2 text-center font-mono">
                    รวม {currentEntries.reduce((sum, e) => sum + e.period_length, 0)} คาบ/สัปดาห์
                  </td>
                  <td className="border border-slate-300 py-1.5 px-2 text-center">
                    -
                  </td>
                  <td className="border border-slate-300 py-1.5 px-2 text-center font-mono">
                    {summaryRows.reduce((sum, r) => sum + r.studentCount, 0)} คน
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 2. Authentic 15-Period Timetable Matrix Grid */}
        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full text-xs border-collapse border-2 border-slate-500 min-w-[900px] print:min-w-0 print:w-full print:text-[8px] print:table-fixed">
            <thead>
              {/* Header Row 1: Period Numbers */}
              <tr className="bg-[#8B7D52] text-white font-bold text-center border-b border-[#726640]">
                <th
                  rowSpan={2}
                  className="border border-[#726640] py-1 px-1 sm:px-2 w-12 sm:w-16 print:w-8 text-center font-bold text-xs sm:text-sm print:text-[9px] bg-[#8B7D52]"
                >
                  วัน
                </th>
                {PERIOD_TIMES.map((pt) => (
                  <th key={pt.p} className="border border-[#726640] py-1 px-0.5 font-bold text-xs print:text-[8.5px] print:py-0.5">
                    {pt.p}
                  </th>
                ))}
              </tr>

              {/* Header Row 2: Time Intervals */}
              <tr className="bg-[#8B7D52] text-white font-medium text-center text-[9.5px] print:text-[6.5px] border-b-2 border-slate-600">
                {PERIOD_TIMES.map((pt) => (
                  <th key={`time-${pt.p}`} className="border border-[#726640] py-0.5 px-0.5 font-mono leading-tight print:py-0.2">
                    <div>{pt.start}</div>
                    <div>{pt.end}</div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => {
                // Find all entries on this day
                const dayEntries = currentEntries
                  .filter((e) => e.day_of_week === dayNum)
                  .sort((a, b) => a.start_timeslot_id - b.start_timeslot_id);

                // Build cells for periods 1 to 15
                const cells: React.ReactNode[] = [];
                let currentSlot = 1;

                while (currentSlot <= 15) {
                  // Check if an entry starts at currentSlot
                  const matchingEntry = dayEntries.find((e) => e.start_timeslot_id === currentSlot);

                  if (matchingEntry) {
                    const span = Math.min(15 - currentSlot + 1, matchingEntry.end_timeslot_id - matchingEntry.start_timeslot_id + 1);
                    const off = offeringMap.get(matchingEntry.course_offering_id);
                    const crs = off ? courseMap.get(off.course_id) : null;
                    const grp = off ? groupMap.get(off.student_group_id) : null;
                    const rm = roomMap.get(matchingEntry.room_id);

                    cells.push(
                      <td
                        key={`entry-${matchingEntry.id}`}
                        colSpan={span}
                        className="border border-slate-400 bg-white p-0.5 sm:p-1 print:p-0.5 text-center align-middle hover:bg-amber-50/50 transition-colors"
                        style={{ height: '56px' }}
                      >
                        <div className="font-bold text-[10px] sm:text-[10.5px] print:text-[8px] text-slate-900 leading-tight">
                          {crs?.code || ''}-{grp?.name || grp?.code || ''}
                        </div>
                        <div className="text-[9px] sm:text-[10px] print:text-[7px] text-slate-800 font-medium leading-tight mt-0.5 line-clamp-1">
                          {crs?.name_th || ''}
                        </div>
                        <div className="text-[8.5px] sm:text-[9px] print:text-[6.5px] text-slate-600 leading-tight mt-0.5 font-normal">
                          {rm ? `${rm.building} - ${rm.room_number}` : ''}
                        </div>
                      </td>
                    );

                    currentSlot += span;
                  } else {
                    // Check if currentSlot is covered by an ongoing entry
                    const isCovered = dayEntries.some(
                      (e) => currentSlot >= e.start_timeslot_id && currentSlot <= e.end_timeslot_id
                    );

                    if (!isCovered) {
                      const isLunchSlot = currentSlot === 7;
                      cells.push(
                        <td
                          key={`empty-${dayNum}-${currentSlot}`}
                          className={`border border-slate-300 h-10 sm:h-16 print:h-9 text-center align-middle ${
                            isLunchSlot ? 'bg-amber-50/40' : 'bg-white/70'
                          }`}
                        >
                          {isLunchSlot && (
                            <span className="text-[8.5px] sm:text-[9.5px] print:text-[7px] text-amber-800/60 font-semibold tracking-wider">
                              พัก
                            </span>
                          )}
                        </td>
                      );
                      currentSlot += 1;
                    } else {
                      currentSlot += 1;
                    }
                  }
                }

                return (
                  <tr key={dayNum} className="border-b border-slate-400">
                    {/* Day Column with Olive-Khaki background */}
                    <td className="border border-slate-400 bg-[#8B7D52] text-white font-bold text-center py-1 sm:py-2 print:py-0.5 px-0.5 sm:px-1 text-xs print:text-[8.5px]">
                      {DAY_NAMES_TH[dayNum]}
                    </td>
                    {cells}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footnote matching the document */}
        <div className="mt-2 text-[11px] text-slate-700 font-normal px-1 flex items-center justify-between">
          <span>{settings.official_note || '*ข้อมูลที่ปรากฏอยู่ในตารางประกอบด้วย รหัสวิชา-กลุ่ม อาคารและห้องเรียนตามลำดับ'}</span>
          <span className="text-[10px] text-slate-500">
            พิมพ์เมื่อ: {new Date().toLocaleDateString('th-TH')} {new Date().toLocaleTimeString('th-TH')}
          </span>
        </div>

        {/* Official Approval & Signature Block (4 Columns) */}
        <div className="mt-6 pt-4 border-t border-slate-300 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs text-slate-800">
          <div className="space-y-1">
            <div className="h-9 border-b border-dotted border-slate-400 mx-auto w-4/5" />
            <p className="font-semibold text-slate-900 mt-1">
              ({settings.document_signer_1_name || (currentTeacher ? `${currentTeacher.prefix || ''}${currentTeacher.name}` : '................................................')})
            </p>
            <p className="text-[11px] text-slate-600">
              {settings.document_signer_1_title || 'อาจารย์ผู้สอน'}
            </p>
            <p className="text-[10px] text-slate-500">วันที่ ......./......./.......</p>
          </div>

          <div className="space-y-1">
            <div className="h-9 border-b border-dotted border-slate-400 mx-auto w-4/5" />
            <p className="font-semibold text-slate-900 mt-1">
              ({settings.document_signer_2_name || '................................................'})
            </p>
            <p className="text-[11px] text-slate-600">
              {settings.document_signer_2_title || 'หัวหน้าแผนกวิชา / สาขาวิชา'}
            </p>
            <p className="text-[10px] text-slate-500">วันที่ ......./......./.......</p>
          </div>

          <div className="space-y-1">
            <div className="h-9 border-b border-dotted border-slate-400 mx-auto w-4/5" />
            <p className="font-semibold text-slate-900 mt-1">
              ({settings.document_signer_3_name || '................................................'})
            </p>
            <p className="text-[11px] text-slate-600">
              {settings.document_signer_3_title || 'หัวหน้างานพัฒนาหลักสูตรการเรียนการสอน'}
            </p>
            <p className="text-[10px] text-slate-500">วันที่ ......./......./.......</p>
          </div>

          <div className="space-y-1">
            <div className="h-9 border-b border-dotted border-slate-400 mx-auto w-4/5" />
            <p className="font-semibold text-slate-900 mt-1">
              ({settings.document_signer_4_name || '................................................'})
            </p>
            <p className="text-[11px] text-slate-600">
              {settings.document_signer_4_title || 'รองผู้อำนวยการฝ่ายวิชาการ / คณบดี'}
            </p>
            <p className="text-[10px] text-slate-500">วันที่ ......./......./.......</p>
          </div>
        </div>
      </div>

      {/* Modern Print & PDF Export Modal */}
      <PrintDialogModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        documentTitle={`${docTitle} - ${targetName}`}
        documentHtml={printHtml || printRef.current?.innerHTML || ''}
        subtitle={targetSubTitle}
        semesterName={activeSemester.name}
        institutionName={settings.institution_name_th || 'มหาวิทยาลัยนครพนม'}
      />
    </div>
  );
};
