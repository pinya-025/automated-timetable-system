import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configuration storage keys
const SUPABASE_URL_KEY = 'npu_supabase_url';
const SUPABASE_KEY_KEY = 'npu_supabase_anon_key';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
}

/**
 * Get the current Supabase configuration from environment variables or LocalStorage
 */
export function getSupabaseConfig(): SupabaseConfig {
  const metaEnv = (import.meta as any).env || {};
  const envUrl = metaEnv.VITE_SUPABASE_URL || '';
  const envKey = metaEnv.VITE_SUPABASE_ANON_KEY || '';

  const storedUrl = localStorage.getItem(SUPABASE_URL_KEY) || '';
  const storedKey = localStorage.getItem(SUPABASE_KEY_KEY) || '';

  const url = storedUrl || envUrl;
  const anonKey = storedKey || envKey;

  return {
    url,
    anonKey,
    isConnected: Boolean(url && anonKey),
  };
}

/**
 * Save user custom Supabase configuration to LocalStorage
 */
export function saveSupabaseConfig(url: string, anonKey: string) {
  if (url && anonKey) {
    localStorage.setItem(SUPABASE_URL_KEY, url.trim());
    localStorage.setItem(SUPABASE_KEY_KEY, anonKey.trim());
  } else {
    localStorage.removeItem(SUPABASE_URL_KEY);
    localStorage.removeItem(SUPABASE_KEY_KEY);
  }
}

let cachedClient: SupabaseClient | null = null;
let lastClientKey = '';

/**
 * Returns a configured Supabase client instance or null if not yet configured
 */
export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }

  const currentKey = `${config.url}_${config.anonKey}`;
  if (cachedClient && lastClientKey === currentKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    lastClientKey = currentKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

/**
 * Test connectivity to a Supabase project by querying system tables or pinging the REST endpoint
 */
export async function testSupabaseConnection(
  url: string,
  anonKey: string
): Promise<{ success: boolean; message: string }> {
  if (!url || !anonKey) {
    return { success: false, message: 'กรุณากรอก Supabase Project URL และ Anon Key ให้ครบถ้วน' };
  }

  try {
    const tempClient = createClient(url.trim(), anonKey.trim());
    // Try pinging any table or health check
    const { error } = await tempClient.from('app_settings').select('count', { count: 'exact', head: true });

    if (error && error.code !== 'PGRST116') {
      // If table doesn't exist yet, it still proves connection works!
      if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: true,
          message: 'เชื่อมต่อ Supabase สำเร็จ! (แต่ยังไม่พบ Tables ในฐานข้อมูล สามารถกดคัดลอก SQL ด้านล่างไปรันใน Supabase SQL Editor ได้)',
        };
      }
      return { success: false, message: `ข้อผิดพลาดจาก Supabase: ${error.message}` };
    }

    return {
      success: true,
      message: 'เชื่อมต่อกับ Supabase ฐานข้อมูลสำเร็จและพร้อมใช้งานเรียบร้อย!',
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'ไม่สามารถติดต่อ Supabase ได้ กรุณาตรวจสอบ URL และ Key',
    };
  }
}

/**
 * Delete a record from Supabase table by ID
 */
export async function deleteRecordFromSupabase(
  table: string,
  id: number | string
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: true };
  }

  try {
    const { error } = await client.from(table).delete().eq('id', id);
    if (error) {
      console.warn(`Supabase delete error on ${table} [id=${id}]:`, error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.warn(`Supabase delete exception on ${table} [id=${id}]:`, err);
    return { success: false, error: err?.message };
  }
}

/**
 * Delete a course from Supabase including child offerings and entries
 */
export async function deleteCourseFromSupabase(courseId: number): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: true };

  try {
    // 1. Find offerings for this course
    const { data: offs } = await client.from('course_offerings').select('id').eq('course_id', courseId);
    if (offs && offs.length > 0) {
      const offIds = offs.map((o: any) => o.id);
      // Delete child schedule entries
      await client.from('schedule_entries').delete().in('course_offering_id', offIds);
      // Delete offerings
      await client.from('course_offerings').delete().in('id', offIds);
    }
    // 2. Delete the course
    const { error } = await client.from('courses').delete().eq('id', courseId);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('Failed to delete course from Supabase:', err);
    return { success: false, error: err?.message };
  }
}

/**
 * Delete a student group from Supabase including child offerings and entries
 */
export async function deleteStudentGroupFromSupabase(groupId: number): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: true };

  try {
    const { data: offs } = await client.from('course_offerings').select('id').eq('student_group_id', groupId);
    if (offs && offs.length > 0) {
      const offIds = offs.map((o: any) => o.id);
      await client.from('schedule_entries').delete().in('course_offering_id', offIds);
      await client.from('course_offerings').delete().in('id', offIds);
    }
    const { error } = await client.from('student_groups').delete().eq('id', groupId);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('Failed to delete student group from Supabase:', err);
    return { success: false, error: err?.message };
  }
}

/**
 * Delete an offering from Supabase including its schedule entries
 */
export async function deleteOfferingFromSupabase(offeringId: number): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: true };

  try {
    await client.from('schedule_entries').delete().eq('course_offering_id', offeringId);
    const { error } = await client.from('course_offerings').delete().eq('id', offeringId);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('Failed to delete offering from Supabase:', err);
    return { success: false, error: err?.message };
  }
}

/**
 * Delete a teacher from Supabase (nullifies teacher_id on offerings first to prevent FK violation)
 */
export async function deleteTeacherFromSupabase(teacherId: number): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: true };

  try {
    await client.from('course_offerings').update({ teacher_id: null }).eq('teacher_id', teacherId);
    const { error } = await client.from('teachers').delete().eq('id', teacherId);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('Failed to delete teacher from Supabase:', err);
    return { success: false, error: err?.message };
  }
}

/**
 * Delete a room from Supabase (nullifies room_id on schedule_entries first to prevent FK violation)
 */
export async function deleteRoomFromSupabase(roomId: number): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: true };

  try {
    await client.from('schedule_entries').update({ room_id: null }).eq('room_id', roomId);
    const { error } = await client.from('rooms').delete().eq('id', roomId);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('Failed to delete room from Supabase:', err);
    return { success: false, error: err?.message };
  }
}

/**
 * Delete a schedule entry from Supabase
 */
export async function deleteScheduleEntryFromSupabase(entryId: number): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: true };

  try {
    const { error } = await client.from('schedule_entries').delete().eq('id', entryId);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('Failed to delete schedule entry from Supabase:', err);
    return { success: false, error: err?.message };
  }
}

/**
 * Upsert a single record into a Supabase table
 */
export async function upsertRecordToSupabase(table: string, record: any): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: true };

  try {
    const { error } = await client.from(table).upsert(record);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error(`Failed to upsert into ${table} on Supabase:`, err);
    return { success: false, error: err?.message };
  }
}

/**
 * Pull all data from Supabase with safe normalization and default fallbacks
 */
export async function pullAllDataFromSupabase() {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const [deptRes, teacherRes, roomRes, courseRes, groupRes, offeringRes, entryRes] = await Promise.all([
      client.from('departments').select('*'),
      client.from('teachers').select('*'),
      client.from('rooms').select('*'),
      client.from('courses').select('*'),
      client.from('student_groups').select('*'),
      client.from('course_offerings').select('*'),
      client.from('schedule_entries').select('*'),
    ]);

    // Sanitize and ensure periods_per_session is always a valid array
    const sanitizedOfferings = offeringRes.data?.map((o: any) => {
      let periods = o.periods_per_session;
      if (typeof periods === 'string') {
        try {
          periods = JSON.parse(periods);
        } catch {
          periods = periods
            .replace(/[{}[\]]/g, '')
            .split(',')
            .map((p: string) => parseInt(p.trim(), 10))
            .filter((p: number) => !isNaN(p));
        }
      }
      if (!Array.isArray(periods) || periods.length === 0) {
        const sessions = Number(o.sessions_per_week) || 1;
        periods = sessions === 2 ? [2, 2] : [2];
      } else {
        periods = periods.map((p: any) => Number(p) || 2);
      }

      return {
        ...o,
        id: Number(o.id),
        semester_id: Number(o.semester_id) || 1,
        course_id: Number(o.course_id),
        student_group_id: Number(o.student_group_id),
        teacher_id: o.teacher_id ? Number(o.teacher_id) : 0,
        room_type_id: Number(o.room_type_id) || 1,
        student_count: Number(o.student_count) || 30,
        sessions_per_week: Number(o.sessions_per_week) || periods.length,
        periods_per_session: periods,
        must_be_consecutive: o.must_be_consecutive ?? true,
        max_sessions_per_day: Number(o.max_sessions_per_day) || 1,
        preferred_room_id: o.preferred_room_id ? Number(o.preferred_room_id) : undefined,
        is_fixed: Boolean(o.is_fixed),
        is_active: o.is_active ?? true,
      };
    });

    return {
      departments: deptRes.data && deptRes.data.length > 0 ? deptRes.data : undefined,
      teachers: teacherRes.data && teacherRes.data.length > 0 ? teacherRes.data : undefined,
      rooms: roomRes.data && roomRes.data.length > 0 ? roomRes.data : undefined,
      courses: courseRes.data && courseRes.data.length > 0 ? courseRes.data : undefined,
      studentGroups: groupRes.data && groupRes.data.length > 0 ? groupRes.data : undefined,
      offerings: sanitizedOfferings && sanitizedOfferings.length > 0 ? sanitizedOfferings : undefined,
      entries: entryRes.data && entryRes.data.length > 0 ? entryRes.data : undefined,
    };
  } catch (err) {
    console.error('Failed to pull data from Supabase:', err);
    return null;
  }
}

/**
 * Standard PostgreSQL SQL Schema for Supabase SQL Editor
 */
export const SUPABASE_SQL_SCHEMA = `-- ============================================================
-- SQL Schema สำหรับระบบจัดตารางเรียนตารางสอน (15 คาบ)
-- นำไปวางใน Supabase Dashboard -> SQL Editor แล้วกด Run
-- ============================================================

-- 1. ตารางการตั้งค่าระบบ (app_settings)
CREATE TABLE IF NOT EXISTS public.app_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  institution_name_th TEXT NOT NULL DEFAULT 'มหาวิทยาลัยนครพนม',
  institution_name_en TEXT DEFAULT 'Nakhon Phanom University',
  faculty_name TEXT DEFAULT 'คณะวิทยาการจัดการและเทคโนโลยีสารสนเทศ',
  campus_name TEXT DEFAULT 'เขตพื้นที่มุกดาหาร / นครพนม',
  system_name_th TEXT NOT NULL DEFAULT 'ระบบจัดตารางเรียนตารางสอนอัตโนมัติ',
  system_name_en TEXT DEFAULT 'Automated Timetable Scheduling System',
  system_logo_url TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  document_signer_1_name TEXT,
  document_signer_1_title TEXT DEFAULT 'อาจารย์ผู้สอน',
  document_signer_2_name TEXT,
  document_signer_2_title TEXT DEFAULT 'หัวหน้าแผนกวิชา / สาขาวิชา',
  document_signer_3_name TEXT,
  document_signer_3_title TEXT DEFAULT 'หัวหน้างานพัฒนาหลักสูตรการเรียนการสอน',
  document_signer_4_name TEXT,
  document_signer_4_title TEXT DEFAULT 'รองผู้อำนวยการฝ่ายวิชาการ / คณบดี',
  official_note TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. ตารางแผนกวิชา (departments)
CREATE TABLE IF NOT EXISTS public.departments (
  id BIGINT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  faculty_name TEXT DEFAULT 'คณะวิทยาการจัดการและเทคโนโลยีสารสนเทศ',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. ตารางอาจารย์ผู้สอน (teachers)
CREATE TABLE IF NOT EXISTS public.teachers (
  id BIGINT PRIMARY KEY,
  department_id BIGINT REFERENCES public.departments(id) ON DELETE SET NULL,
  prefix TEXT DEFAULT 'อ.',
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  max_periods_per_week INT DEFAULT 24,
  max_periods_per_day INT DEFAULT 6,
  max_consecutive_periods INT DEFAULT 4,
  color_code TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. ตารางรายวิชา (courses)
CREATE TABLE IF NOT EXISTS public.courses (
  id BIGINT PRIMARY KEY,
  department_id BIGINT REFERENCES public.departments(id) ON DELETE SET NULL,
  code TEXT NOT NULL UNIQUE,
  name_th TEXT NOT NULL,
  name_en TEXT,
  credits INT DEFAULT 3,
  theory_hours INT DEFAULT 2,
  practice_hours INT DEFAULT 2,
  default_room_type_id INT DEFAULT 1,
  is_heavy BOOLEAN DEFAULT false,
  is_lab BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. ตารางห้องเรียน (rooms)
CREATE TABLE IF NOT EXISTS public.rooms (
  id BIGINT PRIMARY KEY,
  room_type_id BIGINT DEFAULT 1,
  building TEXT NOT NULL,
  floor INT DEFAULT 1,
  room_number TEXT NOT NULL,
  capacity INT DEFAULT 40,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. ตารางกลุ่มเรียนนักศึกษา (student_groups)
CREATE TABLE IF NOT EXISTS public.student_groups (
  id BIGINT PRIMARY KEY,
  program_id BIGINT DEFAULT 1,
  department_id BIGINT REFERENCES public.departments(id) ON DELETE SET NULL,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  year_level INT DEFAULT 1,
  student_count INT DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 7. ตารางรายวิชาที่เปิดสอนในภาคเรียน (course_offerings)
CREATE TABLE IF NOT EXISTS public.course_offerings (
  id BIGINT PRIMARY KEY,
  semester_id BIGINT NOT NULL,
  course_id BIGINT REFERENCES public.courses(id) ON DELETE CASCADE,
  student_group_id BIGINT REFERENCES public.student_groups(id) ON DELETE CASCADE,
  teacher_id BIGINT REFERENCES public.teachers(id) ON DELETE SET NULL,
  room_type_id BIGINT DEFAULT 1,
  student_count INT DEFAULT 30,
  sessions_per_week INT DEFAULT 1,
  periods_per_session INT[] DEFAULT ARRAY[2],
  must_be_consecutive BOOLEAN DEFAULT true,
  max_sessions_per_day INT DEFAULT 1,
  preferred_room_id BIGINT REFERENCES public.rooms(id) ON DELETE SET NULL,
  is_fixed BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Backward compatibility columns update (Safe to run if table already exists)
ALTER TABLE public.course_offerings ADD COLUMN IF NOT EXISTS periods_per_session INT[] DEFAULT ARRAY[2];
ALTER TABLE public.course_offerings ADD COLUMN IF NOT EXISTS max_sessions_per_day INT DEFAULT 1;
ALTER TABLE public.course_offerings ADD COLUMN IF NOT EXISTS preferred_room_id BIGINT REFERENCES public.rooms(id) ON DELETE SET NULL;
ALTER TABLE public.course_offerings ADD COLUMN IF NOT EXISTS is_fixed BOOLEAN DEFAULT false;
ALTER TABLE public.course_offerings ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 8. ตารางรายการจัดคาบสอน (schedule_entries)
CREATE TABLE IF NOT EXISTS public.schedule_entries (
  id BIGINT PRIMARY KEY,
  schedule_version_id BIGINT NOT NULL DEFAULT 1,
  course_offering_id BIGINT REFERENCES public.course_offerings(id) ON DELETE CASCADE,
  session_index INT DEFAULT 0,
  period_length INT NOT NULL DEFAULT 2,
  day_of_week INT NOT NULL, -- 1=Monday to 5=Friday (or 7=Sunday)
  start_timeslot_id INT NOT NULL, -- 1 to 15
  end_timeslot_id INT NOT NULL,
  room_id BIGINT REFERENCES public.rooms(id) ON DELETE SET NULL,
  is_locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 9. ตารางประวัติการทำงาน (audit_logs)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS) & Public Access Policies for Prototype
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_offerings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow anon read-write for seamless client interaction
CREATE POLICY "Allow public read-write for app_settings" ON public.app_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for departments" ON public.departments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for teachers" ON public.teachers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for courses" ON public.courses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for rooms" ON public.rooms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for student_groups" ON public.student_groups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for course_offerings" ON public.course_offerings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for schedule_entries" ON public.schedule_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for audit_logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);
`;
