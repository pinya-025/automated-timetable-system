export type RoleType = 'super_admin' | 'academic_admin' | 'department_admin' | 'teacher' | 'student';

export interface User {
  id: number;
  name: string;
  email: string;
  username?: string;
  role: RoleType;
  department_id?: number;
  teacher_id?: number;
  student_group_id?: number;
  is_active: boolean;
  created_at: string;
  password?: string;
  phone?: string;
  avatar_url?: string;
}

export interface AcademicYear {
  id: number;
  year_th: string; // เช่น 2567
  year_en: string; // 2024
  is_current: boolean;
  deleted_at?: string | null;
}

export interface Semester {
  id: number;
  academic_year_id: number;
  term: number; // 1, 2, 3 (Summer)
  name: string; // ภาคเรียนที่ 1/2567
  start_date: string;
  end_date: string;
  is_current: boolean;
  deleted_at?: string | null;
}

export interface Department {
  id: number;
  faculty_name: string;
  code: string;
  name: string;
  deleted_at?: string | null;
}

export interface Program {
  id: number;
  department_id: number;
  code: string;
  name: string;
  education_level: 'Vocational' | 'High Vocational' | 'Bachelor' | 'Master';
  deleted_at?: string | null;
}

export interface StudentGroup {
  id: number;
  program_id: number;
  department_id: number;
  code: string; // เช่น COM66-1
  name: string; // ปวส.2 คอมพิวเตอร์ธุรกิจ ห้อง 1
  year_level: number; // ปี 1, ปี 2
  student_count: number;
  advisor_teacher_id?: number;
  deleted_at?: string | null;
}

export interface RoomType {
  id: number;
  name: string; // Lecture, Computer Lab, Science Lab, Workshop
  code: string;
  deleted_at?: string | null;
}

export interface Room {
  id: number;
  room_type_id: number;
  building: string;
  floor: number;
  room_number: string;
  capacity: number;
  is_active: boolean;
  deleted_at?: string | null;
}

export interface Teacher {
  id: number;
  department_id: number;
  prefix: string;
  name: string;
  email: string;
  phone: string;
  max_periods_per_week: number;
  max_periods_per_day: number;
  max_consecutive_periods: number;
  color_code: string;
  deleted_at?: string | null;
}

export interface TeacherAvailability {
  id: number;
  teacher_id: number;
  day_of_week: number; // 1 = Monday, 2 = Tuesday, ..., 5 = Friday
  timeslot_id: number;
  is_available: boolean; // false = unavailable
}

export interface TeacherPreference {
  id: number;
  teacher_id: number;
  day_of_week: number;
  timeslot_id: number;
  preference_level: number; // 1 = low, 2 = medium, 3 = high preference
}

export interface Course {
  id: number;
  department_id: number;
  code: string; // เช่น 30204-2001
  name_th: string; // ระบบฐานข้อมูล
  name_en: string; // Database Systems
  credits: number; // 3
  theory_hours: number; // 2
  practice_hours: number; // 2
  default_room_type_id: number;
  is_heavy: boolean; // วิชาคำนวณหรือบรรยายหนัก
  is_lab?: boolean; // ปฏิบัติการ
  deleted_at?: string | null;
}

export interface CourseOffering {
  id: number;
  semester_id: number;
  course_id: number;
  student_group_id: number;
  teacher_id: number;
  room_type_id: number;
  student_count: number;
  sessions_per_week: number; // เช่น 2 sessions
  periods_per_session: number[]; // เช่น [2, 2] = 4 คาบต่อสัปดาห์
  must_be_consecutive: boolean;
  max_sessions_per_day: number;
  preferred_room_id?: number | null;
  is_fixed: boolean;
  is_active: boolean;
  deleted_at?: string | null;
}

export interface Timeslot {
  id: number;
  period_number: number; // 1 to 9
  start_time: string; // '08:00'
  end_time: string; // '09:00'
  label: string; // '08:00 - 09:00'
  is_lunch: boolean;
}

export interface BlockedTimeslot {
  id: number;
  day_of_week: number; // 1 = Mon .. 5 = Fri (or 0 for all days)
  timeslot_id?: number | null;
  start_time: string; // '12:00'
  end_time: string; // '13:00'
  type: 'LUNCH' | 'ACTIVITY' | 'MEETING' | 'HOLIDAY' | 'SPECIAL_EVENT';
  title: string;
  applies_to: 'ALL' | 'STUDENT_GROUP' | 'TEACHER';
  target_id?: number | null;
  is_active: boolean;
  deleted_at?: string | null;
}

export interface ConstraintWeight {
  id: number;
  code: string;
  name: string;
  description: string;
  type: 'HARD' | 'SOFT';
  weight: number; // 1 - 20 for soft constraints
  is_active: boolean;
}

export type ScheduleStatus = 'draft' | 'review' | 'published' | 'archived';

export interface ScheduleVersion {
  id: number;
  semester_id: number;
  version_number: number;
  name: string; // e.g. "V1.0 - Auto Generated"
  status: ScheduleStatus;
  score: number;
  hard_conflict_count: number;
  soft_penalty_score: number;
  notes?: string;
  created_by: string;
  created_at: string;
  published_at?: string | null;
}

export interface ScheduleEntry {
  id: number;
  schedule_version_id: number;
  course_offering_id: number;
  session_index: number; // 0 or 1 for multi-session offerings
  period_length: number; // 1, 2, 3 periods
  day_of_week: number; // 1 (Mon) to 5 (Fri)
  start_timeslot_id: number;
  end_timeslot_id: number;
  room_id: number;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
}

export type ConflictSeverity = 'ERROR' | 'WARNING' | 'INFO';

export type ConflictType =
  | 'TEACHER_CONFLICT'
  | 'ROOM_CONFLICT'
  | 'GROUP_CONFLICT'
  | 'ROOM_CAPACITY'
  | 'ROOM_TYPE'
  | 'TEACHER_UNAVAILABLE'
  | 'BLOCKED_TIMESLOT'
  | 'MAX_CONSECUTIVE'
  | 'INVALID_SESSION_PATTERN'
  | 'STUDENT_GAP'
  | 'TEACHER_PREFERENCE';

export interface ConflictItem {
  id: string;
  type: ConflictType;
  severity: ConflictSeverity;
  title: string;
  description: string;
  entry_id?: number;
  course_offering_id?: number;
  teacher_id?: number;
  room_id?: number;
  student_group_id?: number;
  day_of_week?: number;
  timeslot_id?: number;
}

export interface AlternativeSlot {
  day_of_week: number;
  day_name: string;
  start_timeslot_id: number;
  end_timeslot_id: number;
  time_label: string;
  room_id: number;
  room_number: string;
  room_name: string;
  penalty_score: number;
  soft_notes: string[];
}

export interface ScheduleChangeLog {
  id: number;
  schedule_version_id: number;
  course_name: string;
  user_name: string;
  old_day: number;
  old_period_start: number;
  old_room_name: string;
  new_day: number;
  new_period_start: number;
  new_room_name: string;
  reason?: string;
  ip_address: string;
  created_at: string;
}

export interface AuditLog {
  id: number;
  user_name: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE' | 'GENERATE' | 'PUBLISH' | 'IMPORT' | 'EXPORT' | 'LOGIN' | 'LOGOUT' | 'UPDATE_SETTINGS';
  entity_type: string;
  entity_id?: number | string;
  old_values?: string;
  new_values?: string;
  ip_address: string;
  created_at: string;
}

export interface AppSettings {
  system_name_th: string;
  system_name_en: string;
  system_logo_url?: string;
  institution_name_th: string;
  institution_name_en: string;
  faculty_name?: string;
  campus_name?: string;
  contact_email?: string;
  contact_phone?: string;
  working_days: number[]; // [1, 2, 3, 4, 5]
  day_start_time: string; // 08:00
  day_end_time: string; // 17:00
  period_duration_minutes: number; // 60
  lunch_start_time: string; // 12:00
  lunch_end_time: string; // 13:00
  activity_day: number; // 3 (Wednesday)
  activity_start_time: string; // 15:00
  activity_end_time: string; // 16:00
  max_teacher_periods_per_day: number;
  max_consecutive_periods: number;
  document_signer_1_title?: string;
  document_signer_1_name?: string;
  document_signer_2_title?: string;
  document_signer_2_name?: string;
  document_signer_3_title?: string;
  document_signer_3_name?: string;
  document_signer_4_title?: string;
  document_signer_4_name?: string;
  official_note?: string;
}
