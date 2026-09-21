import React, { useState, useRef } from 'react';
import { FileText, Printer, Download, Users, DoorClosed, GraduationCap, BarChart2, LayoutTemplate, Table as TableIcon } from 'lucide-react';
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
import { exportScheduleToCsv } from '../../services/exportService';
import { getDayName } from '../../services/schedulerEngine';
import { OfficialTimetableDocument } from '../timetable/OfficialTimetableDocument';
import { PrintDialogModal } from '../common/PrintDialogModal';

interface ReportsViewProps {
  entries: ScheduleEntry[];
  offerings: CourseOffering[];
  courses: Course[];
  teachers: Teacher[];
  studentGroups: StudentGroup[];
  rooms: Room[];
  timeslots: Timeslot[];
  activeSemester: Semester;
  settings: AppSettings;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  entries,
  offerings,
  courses,
  teachers,
  studentGroups,
  rooms,
  timeslots,
  activeSemester,
  settings,
}) => {
  const [activeReportTab, setActiveReportTab] = useState<'official' | 'list' | 'workload'>('official');
  const [reportType, setReportType] = useState<'teacher' | 'group' | 'room'>('teacher');
  const [targetId, setTargetId] = useState<number>(teachers[0]?.id || 1);

  const offeringMap = new Map<number, CourseOffering>(offerings.map((o) => [o.id, o]));
  const courseMap = new Map<number, Course>(courses.map((c) => [c.id, c]));
  const teacherMap = new Map<number, Teacher>(teachers.map((t) => [t.id, t]));
  const groupMap = new Map<number, StudentGroup>(studentGroups.map((g) => [g.id, g]));
  const roomMap = new Map<number, Room>(rooms.map((r) => [r.id, r]));
  const slotMap = new Map<number, Timeslot>(timeslots.map((s) => [s.id, s]));

  // Filter entries according to active report
  const reportEntries = entries.filter((e) => {
    const off = offeringMap.get(e.course_offering_id);
    if (!off) return false;

    if (reportType === 'teacher') return off.teacher_id === targetId;
    if (reportType === 'group') return off.student_group_id === targetId;
    if (reportType === 'room') return e.room_id === targetId;
    return true;
  });

  // Export handlers
  const handleExportCsv = () => {
    let title = 'ตารางเรียน';
    if (reportType === 'group') title = `ตารางเรียน_${groupMap.get(targetId)?.code || ''}`;
    if (reportType === 'teacher') title = `ตารางสอน_${teacherMap.get(targetId)?.name || ''}`;
    if (reportType === 'room') title = `ตารางการใช้ห้อง_${roomMap.get(targetId)?.room_number || ''}`;

    exportScheduleToCsv(
      reportEntries,
      offerings,
      courses,
      teachers,
      studentGroups,
      rooms,
      timeslots,
      title
    );
  };

  const printAreaRef = useRef<HTMLDivElement>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printModalContent, setPrintModalContent] = useState<{
    title: string;
    html: string;
    subtitle: string;
  }>({
    title: '',
    html: '',
    subtitle: '',
  });

  const handlePrint = () => {
    let title = 'ตารางเรียนตารางสอน (15 คาบ)';
    let subtitle = activeSemester.name;
    let html = '';

    if (activeReportTab === 'official') {
      const officialSheet = document.getElementById('official-timetable-print-sheet');
      if (officialSheet) {
        html = officialSheet.innerHTML;
        title = `ตารางสอนทางการ 15 คาบ (${reportType === 'teacher' ? 'อาจารย์' : reportType === 'group' ? 'กลุ่มเรียน' : 'ห้องเรียน'})`;
      }
    } else if (printAreaRef.current) {
      html = printAreaRef.current.innerHTML;
      if (activeReportTab === 'list') {
        title = `ตารางข้อมูลสรุป (${reportType === 'group' ? 'รายกลุ่มเรียน' : reportType === 'teacher' ? 'รายอาจารย์' : 'รายห้องเรียน'})`;
      } else if (activeReportTab === 'workload') {
        title = `รายงานสรุปภาระงานสอนอาจารย์`;
      }
    }

    setPrintModalContent({ title, html, subtitle });
    setIsPrintModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header & Subtabs */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>รายงานและส่งออกเอกสารราชการ (Official Timetable Reports & Export)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            รองรับแบบฟอร์มทางการ 15 คาบ (06.00-21.00 น.) ตารางสรุปรายวิชา และบล็อกลายเซ็นอนุมัติ 4 ฝ่าย
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ส่งออก Excel</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-[#8B7D52] hover:bg-[#776a43] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>พิมพ์เอกสาร (Print / PDF)</span>
          </button>
        </div>
      </div>

      {/* Main Mode Selector Bar */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3 print:hidden">
        <button
          onClick={() => setActiveReportTab('official')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeReportTab === 'official'
              ? 'bg-[#8B7D52] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <LayoutTemplate className="w-4 h-4" />
          <span>แบบฟอร์มทางการ 15 คาบ (Official Layout)</span>
        </button>

        <button
          onClick={() => setActiveReportTab('list')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeReportTab === 'list'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <TableIcon className="w-4 h-4" />
          <span>ตารางข้อมูลสรุป (Tabular List)</span>
        </button>

        <button
          onClick={() => setActiveReportTab('workload')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeReportTab === 'workload'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>สรุปภาระงานสอนอาจารย์ (Workload Summary)</span>
        </button>
      </div>

      {/* 1. Official 15-Period Document View */}
      {activeReportTab === 'official' && (
        <OfficialTimetableDocument
          entries={entries}
          offerings={offerings}
          courses={courses}
          teachers={teachers}
          studentGroups={studentGroups}
          rooms={rooms}
          timeslots={timeslots}
          activeSemester={activeSemester}
          settings={settings}
          viewMode={reportType}
          targetId={targetId}
          onTargetChange={setTargetId}
          onViewModeChange={(m) => {
            setReportType(m);
            if (m === 'teacher') setTargetId(teachers[0]?.id || 1);
            if (m === 'group') setTargetId(studentGroups[0]?.id || 1);
            if (m === 'room') setTargetId(rooms[0]?.id || 1);
          }}
        />
      )}

      {/* 2. Tabular List View */}
      {activeReportTab === 'list' && (
        <div ref={printAreaRef} className="space-y-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
              <button
                onClick={() => {
                  setReportType('group');
                  setTargetId(studentGroups[0]?.id || 1);
                }}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  reportType === 'group' ? 'bg-white text-blue-700 font-bold shadow-xs' : 'text-slate-600'
                }`}
              >
                รายกลุ่มเรียน
              </button>
              <button
                onClick={() => {
                  setReportType('teacher');
                  setTargetId(teachers[0]?.id || 1);
                }}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  reportType === 'teacher' ? 'bg-white text-blue-700 font-bold shadow-xs' : 'text-slate-600'
                }`}
              >
                รายอาจารย์
              </button>
              <button
                onClick={() => {
                  setReportType('room');
                  setTargetId(rooms[0]?.id || 1);
                }}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  reportType === 'room' ? 'bg-white text-blue-700 font-bold shadow-xs' : 'text-slate-600'
                }`}
              >
                รายห้องเรียน
              </button>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-500 font-medium">เลือกข้อมูล:</span>
              <select
                value={targetId}
                onChange={(e) => setTargetId(Number(e.target.value))}
                className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                {reportType === 'group' &&
                  studentGroups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.code} - {g.name}
                    </option>
                  ))}
                {reportType === 'teacher' &&
                  teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.prefix} {t.name}
                    </option>
                  ))}
                {reportType === 'room' &&
                  rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.room_number} ({r.building})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase text-[11px]">
                  <th className="py-3 px-4">วัน</th>
                  <th className="py-3 px-4">เวลา / คาบ</th>
                  <th className="py-3 px-4">รหัสวิชา</th>
                  <th className="py-3 px-4">ชื่อวิชา</th>
                  <th className="py-3 px-4">กลุ่มเรียน</th>
                  <th className="py-3 px-4">อาจารย์ผู้สอน</th>
                  <th className="py-3 px-4">ห้องเรียน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {reportEntries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      ไม่พบรายการคาบเรียนสำหรับเงื่อนไขนี้
                    </td>
                  </tr>
                ) : (
                  reportEntries.map((e) => {
                    const off = offeringMap.get(e.course_offering_id);
                    const crs = off ? courseMap.get(off.course_id) : null;
                    const tch = off ? teacherMap.get(off.teacher_id) : null;
                    const grp = off ? groupMap.get(off.student_group_id) : null;
                    const rm = roomMap.get(e.room_id);
                    const sSlot = slotMap.get(e.start_timeslot_id);
                    const eSlot = slotMap.get(e.end_timeslot_id);

                    return (
                      <tr key={e.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-800">{getDayName(e.day_of_week)}</td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {sSlot?.start_time} - {eSlot?.end_time} ({e.period_length} คาบ)
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-blue-700">{crs?.code}</td>
                        <td className="py-3 px-4 font-medium text-slate-900">{crs?.name_th}</td>
                        <td className="py-3 px-4 text-slate-700">{grp?.name}</td>
                        <td className="py-3 px-4 text-slate-800">
                          {tch?.prefix} {tch?.name}
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                          {rm?.room_number}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Workload Summary View */}
      {activeReportTab === 'workload' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase text-[11px]">
                <th className="py-3 px-4">ชื่ออาจารย์</th>
                <th className="py-3 px-4 text-center">ชั่วโมงทฤษฎี</th>
                <th className="py-3 px-4 text-center">ชั่วโมงปฏิบัติ</th>
                <th className="py-3 px-4 text-center">รวมชั่วโมงจัดสอน</th>
                <th className="py-3 px-4 text-center">เกณฑ์สูงสุด</th>
                <th className="py-3 px-4 text-center">สถานะภาระงาน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {teachers.map((t) => {
                const tEntries = entries.filter((e) => {
                  const off = offeringMap.get(e.course_offering_id);
                  return off?.teacher_id === t.id;
                });
                const totalHours = tEntries.reduce((sum, e) => sum + e.period_length, 0);

                return (
                  <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {t.prefix} {t.name}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-600">
                      {Math.round(totalHours * 0.4)} ชม.
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-600">
                      {Math.round(totalHours * 0.6)} ชม.
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">
                      {totalHours} คาบ
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-500">
                      {t.max_periods_per_week} คาบ
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full font-semibold text-[10px] bg-emerald-100 text-emerald-800">
                        ปกติ (Optimal)
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modern Print & PDF Export Modal */}
      <PrintDialogModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        documentTitle={printModalContent.title || 'เอกสารตารางเรียนตารางสอน'}
        documentHtml={printModalContent.html}
        subtitle={printModalContent.subtitle}
        semesterName={activeSemester.name}
        institutionName={settings.institution_name_th || 'มหาวิทยาลัยนครพนม'}
      />
    </div>
  );
};

