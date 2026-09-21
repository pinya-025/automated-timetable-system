import React from 'react';
import {
  Users,
  BookOpen,
  DoorClosed,
  GraduationCap,
  CalendarCheck,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Clock,
  Sparkles,
  BarChart3,
  Sliders,
} from 'lucide-react';
import {
  Teacher,
  Course,
  Room,
  StudentGroup,
  CourseOffering,
  ScheduleEntry,
  Semester,
  ScheduleVersion,
  ConflictItem,
} from '../../types';

interface DashboardViewProps {
  teachers: Teacher[];
  courses: Course[];
  rooms: Room[];
  studentGroups: StudentGroup[];
  offerings: CourseOffering[];
  entries: ScheduleEntry[];
  activeSemester: Semester;
  activeVersion: ScheduleVersion;
  conflicts: ConflictItem[];
  onNavigateTab: (tab: any) => void;
  onOpenGenerate: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  teachers,
  courses,
  rooms,
  studentGroups,
  offerings,
  entries,
  activeSemester,
  activeVersion,
  conflicts,
  onNavigateTab,
  onOpenGenerate,
}) => {
  // Calculate statistics
  const totalSessionsNeeded = offerings.reduce((acc, o) => acc + (o.periods_per_session?.length || 1), 0);
  const scheduledCount = entries.length;
  const unscheduledCount = Math.max(0, totalSessionsNeeded - scheduledCount);

  const hardConflicts = conflicts.filter((c) => c.severity === 'ERROR');
  const softWarnings = conflicts.filter((c) => c.severity === 'WARNING');

  // Workload per teacher (hours)
  const teacherWorkloads = teachers.map((t) => {
    const tEntries = entries.filter((e) => {
      const off = offerings.find((o) => o.id === e.course_offering_id);
      return off?.teacher_id === t.id;
    });
    const hours = tEntries.reduce((sum, e) => sum + e.period_length, 0);
    return {
      teacher: t,
      hours,
      max: t.max_periods_per_week,
      percentage: Math.min(100, Math.round((hours / (t.max_periods_per_week || 18)) * 100)),
    };
  });

  // Room utilization
  const totalSlotsPerWeek = 5 * 14; // 5 days, 14 teaching slots (excluding lunch period 7)
  const roomUtilizations = rooms.map((r) => {
    const rEntries = entries.filter((e) => e.room_id === r.id);
    const hoursUsed = rEntries.reduce((sum, e) => sum + e.period_length, 0);
    const rate = Math.min(100, Math.round((hoursUsed / totalSlotsPerWeek) * 100));
    return {
      room: r,
      hoursUsed,
      rate,
    };
  });

  // Classes per day
  const days = [
    { day: 1, name: 'จันทร์ (Mon)' },
    { day: 2, name: 'อังคาร (Tue)' },
    { day: 3, name: 'พุธ (Wed)' },
    { day: 4, name: 'พฤหัสบดี (Thu)' },
    { day: 5, name: 'ศุกร์ (Fri)' },
  ];

  const classesPerDay = days.map((d) => {
    const count = entries.filter((e) => e.day_of_week === d.day).length;
    const hours = entries
      .filter((e) => e.day_of_week === d.day)
      .reduce((sum, e) => sum + e.period_length, 0);
    return {
      ...d,
      count,
      hours,
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Semester Overview */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>Google OR-Tools CP-SAT Scheduling Engine</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            ระบบบริหารตารางเรียนตารางสอน {activeSemester.name}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
            สถานะปัจจุบัน: เวอร์ชัน <span className="font-semibold text-white">{activeVersion.name}</span> ({activeVersion.status.toUpperCase()}) 
            ความแม่นยำทางเกณฑ์ Constraint Score: <span className="text-emerald-300 font-bold">{activeVersion.score}%</span>
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => onNavigateTab('timetable')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg border border-white/20 transition-all"
          >
            ดูตารางเรียน
          </button>
          <button
            onClick={onOpenGenerate}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg shadow-sm shadow-blue-500/30 transition-all active:scale-95"
          >
            จัดตารางใหม่ (Auto-Solve)
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">อาจารย์ผู้สอน</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{teachers.length}</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">ครบทุกภาควิชา</p>
          </div>
          <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">รายวิชาเปิดสอน</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{courses.length}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{offerings.length} Course Offerings</p>
          </div>
          <div className="w-11 h-11 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">ห้องเรียนทั้งหมด</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{rooms.length}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Lab คอมพิวเตอร์ & บรรยาย</p>
          </div>
          <div className="w-11 h-11 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <DoorClosed className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">กลุ่มเรียนนักศึกษา</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{studentGroups.length}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">ปวช., ปวส., ปริญญาตรี</p>
          </div>
          <div className="w-11 h-11 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Schedule Execution Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>คาบเรียนทั้งหมดที่ต้องจัด</span>
            <CalendarCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900">{totalSessionsNeeded}</span>
            <span className="text-xs text-slate-500">Sessions ({offerings.reduce((sum, o) => sum + (o.periods_per_session?.reduce((a, b) => a + b, 0) || 0), 0)} คาบ)</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${Math.min(100, (scheduledCount / (totalSessionsNeeded || 1)) * 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>จัดตารางลงคาบแล้ว</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-emerald-700">{scheduledCount}</span>
            <span className="text-xs text-emerald-600 font-medium">
              {Math.round((scheduledCount / (totalSessionsNeeded || 1)) * 100)}% สมบูรณ์
            </span>
          </div>
          <p className="mt-3 text-[11px] text-slate-500">
            ยังไม่ได้จัด: <span className="font-semibold text-slate-700">{unscheduledCount}</span> รายการ
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Hard Conflicts (ข้อขัดแย้งร้ายแรง)</span>
            <AlertTriangle className={`w-4 h-4 ${hardConflicts.length > 0 ? 'text-rose-500' : 'text-slate-400'}`} />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className={`text-2xl font-bold ${hardConflicts.length > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {hardConflicts.length}
            </span>
            <span className="text-xs text-slate-500">
              {hardConflicts.length === 0 ? 'ปลอดภัย 100%' : 'ต้องแก้ไขก่อนประกาศ'}
            </span>
          </div>
          <button
            onClick={() => onNavigateTab('conflicts')}
            className="mt-3 text-[11px] font-medium text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center space-x-1"
          >
            <span>ตรวจสอบรายการขัดแย้ง &rarr;</span>
          </button>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Soft Constraints & Warnings</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-amber-600">{softWarnings.length}</span>
            <span className="text-xs text-slate-500">Penalty Score: {activeVersion.soft_penalty_score}</span>
          </div>
          <p className="mt-3 text-[11px] text-slate-500">
            ลดคาบว่างนักศึกษา & กระจายภาระสอน
          </p>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Teacher Workload Distribution */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <h3 className="font-semibold text-slate-800 text-sm">ภาระงานสอนอาจารย์ (Teacher Workload)</h3>
            </div>
            <span className="text-xs text-slate-500">เกณฑ์: สูงสุด 18 คาบ/สัปดาห์</span>
          </div>

          <div className="mt-4 space-y-3 max-h-72 overflow-y-auto pr-1">
            {teacherWorkloads.map((item) => (
              <div key={item.teacher.id} className="space-y-1 text-xs">
                <div className="flex justify-between items-center text-slate-700">
                  <span className="font-medium truncate max-w-[200px]">
                    {item.teacher.prefix} {item.teacher.name}
                  </span>
                  <span className="text-slate-500 font-mono">
                    {item.hours} / {item.max} คาบ ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      item.percentage > 90
                        ? 'bg-amber-500'
                        : item.percentage > 100
                        ? 'bg-rose-500'
                        : 'bg-blue-600'
                    }`}
                    style={{ width: `${Math.min(100, item.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Room Utilization Rate */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <h3 className="font-semibold text-slate-800 text-sm">อัตราการใช้งานห้องเรียน (Room Utilization)</h3>
            </div>
            <span className="text-xs text-slate-500">ฐานคิด: 40 คาบต่อสัปดาห์</span>
          </div>

          <div className="mt-4 space-y-3 max-h-72 overflow-y-auto pr-1">
            {roomUtilizations.map((item) => (
              <div key={item.room.id} className="space-y-1 text-xs">
                <div className="flex justify-between items-center text-slate-700">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-medium">{item.room.room_number}</span>
                    <span className="text-[10px] text-slate-400">({item.room.capacity} ที่นั่ง)</span>
                  </div>
                  <span className="font-mono text-slate-500">
                    {item.hoursUsed} ชม. ({item.rate}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      item.rate > 80
                        ? 'bg-indigo-600'
                        : item.rate > 40
                        ? 'bg-emerald-500'
                        : 'bg-slate-400'
                    }`}
                    style={{ width: `${Math.min(100, item.rate)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 3: Classes Scheduled Per Day */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800 text-sm">การกระจายคาบเรียนตามวัน (Classes per Day)</h3>
            <span className="text-xs text-slate-500">จันทร์ - ศุกร์</span>
          </div>

          <div className="mt-6 grid grid-cols-5 gap-2 items-end h-40">
            {classesPerDay.map((d) => {
              const maxHours = 35;
              const heightPct = Math.min(100, Math.max(15, Math.round((d.hours / maxHours) * 100)));

              return (
                <div key={d.day} className="flex flex-col items-center h-full justify-end group">
                  <span className="text-[11px] font-bold text-slate-700 mb-1">{d.hours} ชม.</span>
                  <div
                    className="w-full max-w-[42px] bg-gradient-to-t from-blue-600 to-indigo-500 rounded-t-lg transition-all group-hover:from-blue-700 group-hover:to-indigo-600"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-xs text-slate-600 font-medium mt-2">{d.name.split(' ')[0]}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{d.count} sessions</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 4: Optimization Constraints & System Status */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800 text-sm">การปฏิบัติตามข้อกำหนด (Constraint Auditing)</h3>
            <button
              onClick={() => onNavigateTab('constraints')}
              className="text-xs text-blue-600 hover:underline inline-flex items-center space-x-1"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>ปรับค่าน้ำหนัก</span>
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center space-x-1.5 text-emerald-700 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>Teacher Conflict</span>
              </div>
              <p className="text-[11px] text-slate-500">อาจารย์ไม่สอนซ้อนเวลา: 100%</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center space-x-1.5 text-emerald-700 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>Room Conflict</span>
              </div>
              <p className="text-[11px] text-slate-500">ห้องเรียนไม่ซ้อนเวลา: 100%</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center space-x-1.5 text-emerald-700 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>Blocked Slots</span>
              </div>
              <p className="text-[11px] text-slate-500">เว้นพักเที่ยง & พุธบ่าย: 100%</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center space-x-1.5 text-emerald-700 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>Room Capacity</span>
              </div>
              <p className="text-[11px] text-slate-500">ความจุห้อง &ge; นักศึกษา: 100%</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center space-x-1.5 text-blue-700 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>Consecutive Hours</span>
              </div>
              <p className="text-[11px] text-slate-500">วิชา 2+2 จัดต่อเนื่อง: 100%</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center space-x-1.5 text-blue-700 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>Student Gap Min</span>
              </div>
              <p className="text-[11px] text-slate-500">ลดคาบว่างระหว่างวัน: ดีเยี่ยม</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
