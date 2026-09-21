-- ============================================================
-- SQL Schema สำหรับระบบจัดตารางเรียนตารางสอนอัตโนมัติ (15 คาบ)
-- Compatible with Supabase PostgreSQL
-- วิธีใช้งาน: นำคำสั่ง SQL ทั้งหมดไปวางใน Supabase Dashboard -> SQL Editor แล้วกด RUN
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

-- 10. Enable Row Level Security (RLS) & Public Policies for Easy Client Integration
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_offerings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-write for app_settings" ON public.app_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for departments" ON public.departments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for teachers" ON public.teachers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for courses" ON public.courses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for rooms" ON public.rooms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for student_groups" ON public.student_groups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for course_offerings" ON public.course_offerings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for schedule_entries" ON public.schedule_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for audit_logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);
