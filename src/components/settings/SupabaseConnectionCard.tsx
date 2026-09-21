import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  UploadCloud,
  DownloadCloud,
  Shield,
  Key,
  Globe,
  Terminal,
} from 'lucide-react';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
  getSupabaseClient,
  SUPABASE_SQL_SCHEMA,
} from '../../lib/supabase';
import {
  Department,
  Teacher,
  Room,
  Course,
  StudentGroup,
  CourseOffering,
  ScheduleEntry,
  AppSettings,
} from '../../types';

interface SupabaseConnectionCardProps {
  departments: Department[];
  teachers: Teacher[];
  rooms: Room[];
  courses: Course[];
  studentGroups: StudentGroup[];
  offerings: CourseOffering[];
  entries: ScheduleEntry[];
  settings: AppSettings;
  onDataLoadedFromSupabase?: (data: {
    departments?: Department[];
    teachers?: Teacher[];
    rooms?: Room[];
    courses?: Course[];
    studentGroups?: StudentGroup[];
    offerings?: CourseOffering[];
    entries?: ScheduleEntry[];
  }) => void;
}

export const SupabaseConnectionCard: React.FC<SupabaseConnectionCardProps> = ({
  departments,
  teachers,
  rooms,
  courses,
  studentGroups,
  offerings,
  entries,
  settings,
  onDataLoadedFromSupabase,
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSql, setShowSql] = useState(false);

  useEffect(() => {
    const config = getSupabaseConfig();
    setUrl(config.url);
    setAnonKey(config.anonKey);
  }, []);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await testSupabaseConnection(url, anonKey);
      setTestResult(result);
    } catch (err: any) {
      setTestResult({ success: false, message: err?.message || 'การเชื่อมต่อล้มเหลว' });
    } finally {
      setTesting(false);
    }
  };

  const handleSaveConfig = () => {
    saveSupabaseConfig(url, anonKey);
    setTestResult({
      success: true,
      message: 'บันทึกการตั้งค่า Supabase เรียบร้อยแล้ว!',
    });
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  // Push all master data & timetable to Supabase tables
  const handlePushData = async () => {
    const client = getSupabaseClient();
    if (!client) {
      alert('กรุณากรอก Supabase URL และ Anon Key แล้วบันทึกก่อนทำการซิงค์');
      return;
    }

    setSyncing(true);
    try {
      // 1. Settings
      await client.from('app_settings').upsert({
        id: 'default',
        institution_name_th: settings.institution_name_th,
        institution_name_en: settings.institution_name_en,
        faculty_name: settings.faculty_name,
        campus_name: settings.campus_name,
        system_name_th: settings.system_name_th,
        system_name_en: settings.system_name_en,
        system_logo_url: settings.system_logo_url,
        document_signer_1_name: settings.document_signer_1_name,
        document_signer_1_title: settings.document_signer_1_title,
        document_signer_2_name: settings.document_signer_2_name,
        document_signer_2_title: settings.document_signer_2_title,
        document_signer_3_name: settings.document_signer_3_name,
        document_signer_3_title: settings.document_signer_3_title,
        document_signer_4_name: settings.document_signer_4_name,
        document_signer_4_title: settings.document_signer_4_title,
      });

      // 2. Departments
      if (departments.length > 0) {
        await client.from('departments').upsert(
          departments.map((d) => ({
            id: d.id,
            code: d.code,
            name: d.name,
            faculty_name: d.faculty_name,
          }))
        );
      }

      // 3. Rooms
      if (rooms.length > 0) {
        await client.from('rooms').upsert(
          rooms.map((r) => ({
            id: r.id,
            room_type_id: r.room_type_id,
            building: r.building,
            floor: r.floor,
            room_number: r.room_number,
            capacity: r.capacity,
            is_active: r.is_active,
          }))
        );
      }

      // 4. Teachers
      if (teachers.length > 0) {
        await client.from('teachers').upsert(
          teachers.map((t) => ({
            id: t.id,
            department_id: t.department_id,
            prefix: t.prefix,
            name: t.name,
            email: t.email,
            phone: t.phone,
            max_periods_per_week: t.max_periods_per_week,
            max_periods_per_day: t.max_periods_per_day,
            max_consecutive_periods: t.max_consecutive_periods,
            color_code: t.color_code,
          }))
        );
      }

      // 5. Courses
      if (courses.length > 0) {
        await client.from('courses').upsert(
          courses.map((c) => ({
            id: c.id,
            department_id: c.department_id,
            code: c.code,
            name_th: c.name_th,
            name_en: c.name_en,
            credits: c.credits,
            theory_hours: c.theory_hours,
            practice_hours: c.practice_hours,
            default_room_type_id: c.default_room_type_id,
            is_heavy: c.is_heavy,
            is_lab: c.is_lab || false,
          }))
        );
      }

      // 6. Student Groups
      if (studentGroups.length > 0) {
        await client.from('student_groups').upsert(
          studentGroups.map((g) => ({
            id: g.id,
            program_id: g.program_id,
            department_id: g.department_id,
            code: g.code,
            name: g.name,
            year_level: g.year_level,
            student_count: g.student_count,
          }))
        );
      }

      // 7. Course Offerings
      if (offerings.length > 0) {
        await client.from('course_offerings').upsert(
          offerings.map((o) => ({
            id: o.id,
            semester_id: o.semester_id,
            course_id: o.course_id,
            student_group_id: o.student_group_id,
            teacher_id: o.teacher_id,
            room_type_id: o.room_type_id,
            student_count: o.student_count,
            sessions_per_week: o.sessions_per_week,
            periods_per_session: Array.isArray(o.periods_per_session) ? o.periods_per_session : [2],
            must_be_consecutive: o.must_be_consecutive,
            max_sessions_per_day: o.max_sessions_per_day || 1,
            preferred_room_id: o.preferred_room_id || null,
            is_fixed: Boolean(o.is_fixed),
            is_active: o.is_active ?? true,
          }))
        );
      }

      // 8. Schedule Entries
      if (entries.length > 0) {
        await client.from('schedule_entries').upsert(
          entries.map((e) => ({
            id: e.id,
            schedule_version_id: e.schedule_version_id,
            course_offering_id: e.course_offering_id,
            session_index: e.session_index,
            period_length: e.period_length,
            day_of_week: e.day_of_week,
            start_timeslot_id: e.start_timeslot_id,
            end_timeslot_id: e.end_timeslot_id,
            room_id: e.room_id,
            is_locked: e.is_locked,
          }))
        );
      }

      alert('ซิงค์ข้อมูลขึ้น Supabase Cloud สำเร็จเรียบร้อยครบทุกตาราง!');
    } catch (err: any) {
      console.error(err);
      alert(`การซิงค์ข้อมูลล้มเหลว: ${err?.message || 'ข้อผิดพลาดไม่ทราบสาเหตุ'}`);
    } finally {
      setSyncing(false);
    }
  };

  // Pull data from Supabase
  const handlePullData = async () => {
    const client = getSupabaseClient();
    if (!client) {
      alert('กรุณากรอก Supabase URL และ Anon Key ก่อนดึงข้อมูล');
      return;
    }

    setSyncing(true);
    try {
      const [
        deptRes,
        teacherRes,
        roomRes,
        courseRes,
        groupRes,
        offeringRes,
        entryRes,
      ] = await Promise.all([
        client.from('departments').select('*'),
        client.from('teachers').select('*'),
        client.from('rooms').select('*'),
        client.from('courses').select('*'),
        client.from('student_groups').select('*'),
        client.from('course_offerings').select('*'),
        client.from('schedule_entries').select('*'),
      ]);

      if (onDataLoadedFromSupabase) {
        onDataLoadedFromSupabase({
          departments: deptRes.data && deptRes.data.length > 0 ? (deptRes.data as Department[]) : undefined,
          teachers: teacherRes.data && teacherRes.data.length > 0 ? (teacherRes.data as Teacher[]) : undefined,
          rooms: roomRes.data && roomRes.data.length > 0 ? (roomRes.data as Room[]) : undefined,
          courses: courseRes.data && courseRes.data.length > 0 ? (courseRes.data as Course[]) : undefined,
          studentGroups: groupRes.data && groupRes.data.length > 0 ? (groupRes.data as StudentGroup[]) : undefined,
          offerings: offeringRes.data && offeringRes.data.length > 0 ? (offeringRes.data as CourseOffering[]) : undefined,
          entries: entryRes.data && entryRes.data.length > 0 ? (entryRes.data as ScheduleEntry[]) : undefined,
        });
      }

      alert('ดึงข้อมูลจาก Supabase Cloud ลงสู่แอปพลิเคชันเรียบร้อยแล้ว!');
    } catch (err: any) {
      console.error(err);
      alert(`ไม่สามารถดึงข้อมูลได้: ${err?.message || 'ข้อผิดพลาดไม่ทราบสาเหตุ'}`);
    } finally {
      setSyncing(false);
    }
  };

  const isConfigured = Boolean(url && anonKey);

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-slate-800 text-base">การเชื่อมต่อฐานข้อมูล Supabase (PostgreSQL)</h3>
                {isConfigured ? (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>เชื่อมต่อแล้ว</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-800 border border-amber-300 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3 text-amber-600" />
                    <span>โหมด Local Storage</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                เชื่อมโยงข้อมูลอาจารย์, รายวิชา, ห้องเรียน, และตารางเรียนตารางสอน 15 คาบ เข้ากับคลาวด์ดาต้าเบส Supabase แบบ Real-time
              </p>
            </div>
          </div>

          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors w-fit"
          >
            <span>เปิด Supabase Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Configuration Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <h4 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
          <Key className="w-4 h-4 text-emerald-600" />
          <span>ข้อมูลการเชื่อมต่อ (Supabase Project Credentials)</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>Project URL</span>
            </label>
            <input
              type="text"
              placeholder="https://xyzcompany.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono bg-slate-50/50"
            />
            <p className="text-[11px] text-slate-400 mt-1">ดูได้จาก Project Settings &gt; API ใน Supabase</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1.5">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              <span>Project API Anon Key (Public)</span>
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono bg-slate-50/50"
            />
            <p className="text-[11px] text-slate-400 mt-1">คีย์ประเภท `anon` `public` สำหรับเข้าถึงข้อมูล</p>
          </div>
        </div>

        {testResult && (
          <div
            className={`p-3 rounded-lg text-xs flex items-center space-x-2 border ${
              testResult.success
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-rose-50 text-rose-800 border-rose-300'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing || !url || !anonKey}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1.5 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'กำลังทดสอบ...' : 'ทดสอบการเชื่อมต่อ'}</span>
            </button>

            <button
              type="button"
              onClick={handleSaveConfig}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              บันทึกการตั้งค่า
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handlePushData}
              disabled={syncing || !isConfigured}
              title="ส่งข้อมูลทั้งหมดจากเครื่องขึ้นไปยัง Supabase"
              className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold flex items-center space-x-1.5 disabled:opacity-50 transition-colors"
            >
              <UploadCloud className="w-3.5 h-3.5 text-indigo-600" />
              <span>ซิงค์ข้อมูลขึ้น Supabase (Push Data)</span>
            </button>

            <button
              type="button"
              onClick={handlePullData}
              disabled={syncing || !isConfigured}
              title="ดึงข้อมูลล่าสุดจาก Supabase ลงมายังหน้านี้"
              className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-1.5 disabled:opacity-50 transition-colors"
            >
              <DownloadCloud className="w-3.5 h-3.5 text-slate-600" />
              <span>ดึงข้อมูลจาก Cloud (Pull Data)</span>
            </button>
          </div>
        </div>
      </div>

      {/* SQL Script Generator Accordion */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-slate-600" />
            <h4 className="text-sm font-bold text-slate-800">
              SQL Schema สำหรับสร้าง Tables บน Supabase
            </h4>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleCopySql}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-all"
            >
              {copiedSql ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>คัดลอก SQL แล้ว!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-300" />
                  <span>คัดลอก SQL (Copy Script)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowSql(!showSql)}
              className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200"
            >
              {showSql ? 'ซ่อนคำสั่ง SQL' : 'ดูคำสั่ง SQL'}
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-500">
          คำสั่ง SQL ด้านล่างนี้มีโครงสร้างตารางครบถ้วนทั้ง 9 ตาราง (app_settings, departments, teachers, courses, rooms, student_groups, course_offerings, schedule_entries, audit_logs) พร้อมตั้งค่า Row Level Security (RLS) สามารถคัดลอกไปวางในเมนู <strong>SQL Editor</strong> บน Supabase แล้วกด <strong>Run</strong> ได้ทันที
        </p>

        {showSql && (
          <div className="relative mt-3">
            <pre className="p-4 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto max-h-96 leading-relaxed border border-slate-800">
              {SUPABASE_SQL_SCHEMA}
            </pre>
          </div>
        )}
      </div>

      {/* Quick Setup Instructions */}
      <div className="bg-gradient-to-r from-slate-50 to-emerald-50/40 rounded-xl border border-slate-200 p-4 text-xs text-slate-600 space-y-2">
        <h5 className="font-bold text-slate-800 flex items-center space-x-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>ขั้นตอนการเปิดใช้งาน Supabase (ง่ายใน 3 นาที):</span>
        </h5>
        <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1">
          <li>สมัครสมาชิกฟรีและสร้าง New Project ที่ <strong>supabase.com</strong></li>
          <li>ไปที่เมนู <strong>SQL Editor</strong> &gt; วางโค้ด SQL จากปุ่ม <em>คัดลอก SQL</em> ด้านบน แล้วกด <strong>Run</strong></li>
          <li>ไปที่เมนู <strong>Project Settings &gt; API</strong> &gt; คัดลอก <strong>Project URL</strong> และ <strong>anon public key</strong></li>
          <li>นำมากรอกในช่องด้านบน แล้วกด <strong>บันทึกการตั้งค่า</strong> &gt; กด <strong>ซิงค์ข้อมูลขึ้น Supabase</strong> เพื่อย้ายข้อมูลหลักทั้งหมดขึ้นคลาวด์ได้ทันที!</li>
        </ol>
      </div>
    </div>
  );
};
