import {
  AcademicYear,
  Semester,
  Department,
  Program,
  StudentGroup,
  RoomType,
  Room,
  Teacher,
  TeacherAvailability,
  TeacherPreference,
  Course,
  CourseOffering,
  Timeslot,
  BlockedTimeslot,
  ConstraintWeight,
  ScheduleVersion,
  ScheduleEntry,
  User,
  AppSettings,
  ScheduleChangeLog,
  AuditLog,
} from '../types';

export const initialSettings: AppSettings = {
  system_name_th: 'ระบบจัดตารางเรียนตารางสอนอัตโนมัติ',
  system_name_en: 'Automated Timetable Scheduling System',
  system_logo_url: '',
  institution_name_th: 'มหาวิทยาลัยนครพนม',
  institution_name_en: 'Nakhon Phanom University',
  faculty_name: 'วิทยาลัยธาตุพนม / คณะวิทยาการจัดการและเทคโนโลยีสารสนเทศ',
  campus_name: 'วิทยาเขตหลัก',
  contact_email: 'academic@npu.ac.th',
  contact_phone: '042-511-222',
  working_days: [1, 2, 3, 4, 5, 6, 7],
  day_start_time: '06:00',
  day_end_time: '21:00',
  period_duration_minutes: 60,
  lunch_start_time: '12:00',
  lunch_end_time: '13:00',
  activity_day: 3, // Wednesday
  activity_start_time: '15:00',
  activity_end_time: '16:00',
  max_teacher_periods_per_day: 8,
  max_consecutive_periods: 4,
  document_signer_1_title: 'ผู้จัดทำตาราง',
  document_signer_1_name: 'อ.อรัญญา วงศ์สุวรรณ',
  document_signer_2_title: 'หัวหน้าสาขาวิชา',
  document_signer_2_name: 'ดร.กิตติศักดิ์ ศรีวิชัย',
  document_signer_3_title: 'หัวหน้างานหลักสูตร/ฝ่ายวิชาการ',
  document_signer_3_name: 'ผศ.ดร.สมเกียรติ พัฒนกิจ',
  document_signer_4_title: 'รองผู้อำนวยการ/คณบดี/อธิการบดี',
  document_signer_4_name: 'ศ.ดร.ประสิทธิ์ สุขสมบูรณ์',
  official_note: '*ข้อมูลที่ปรากฏอยู่ในตารางประกอบด้วย รหัสวิชา-กลุ่ม อาคารและห้องเรียนตามลำดับ',
};

export const initialAcademicYears: AcademicYear[] = [
  { id: 1, year_th: '2569', year_en: '2026', is_current: true },
  { id: 2, year_th: '2568', year_en: '2025', is_current: false },
];

export const initialSemesters: Semester[] = [
  {
    id: 1,
    academic_year_id: 1,
    term: 1,
    name: 'ภาคการศึกษา 1/2569',
    start_date: '2026-06-01',
    end_date: '2026-10-31',
    is_current: true,
  },
  {
    id: 2,
    academic_year_id: 1,
    term: 2,
    name: 'ภาคการศึกษา 2/2569',
    start_date: '2026-11-15',
    end_date: '2027-03-31',
    is_current: false,
  },
];

export const initialDepartments: Department[] = [
  { id: 4, faculty_name: 'มหาวิทยาลัยนครพนม', code: 'TP', name: 'วิทยาลัยธาตุพนม' },
  { id: 1, faculty_name: 'คณะเทคโนโลยีสารสนเทศและการสื่อสาร', code: 'IT', name: 'สาขาวิชาเทคโนโลยีสารสนเทศ' },
  { id: 2, faculty_name: 'คณะเทคโนโลยีสารสนเทศและการสื่อสาร', code: 'BC', name: 'สาขาวิชาคอมพิวเตอร์ธุรกิจ' },
  { id: 3, faculty_name: 'คณะวิศวกรรมศาสตร์', code: 'SE', name: 'สาขาวิชาวิศวกรรมซอฟต์แวร์' },
];

export const initialPrograms: Program[] = [
  { id: 4, department_id: 4, code: 'VOC-TP', name: 'ประกาศนียบัตรวิชาชีพ (ปวช.)', education_level: 'Vocational' },
  { id: 5, department_id: 4, code: 'HVOC-TP', name: 'ประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.)', education_level: 'High Vocational' },
  { id: 1, department_id: 1, code: 'DIT-VOC', name: 'ปวช. เทคโนโลยีสารสนเทศ', education_level: 'Vocational' },
  { id: 2, department_id: 2, code: 'BC-HVOC', name: 'ปวส. คอมพิวเตอร์ธุรกิจ', education_level: 'High Vocational' },
  { id: 3, department_id: 3, code: 'SE-BENG', name: 'วศ.บ. วิศวกรรมซอฟต์แวร์', education_level: 'Bachelor' },
];

export const initialStudentGroups: StudentGroup[] = [
  { id: 6, program_id: 4, department_id: 4, code: 'คธ.1', name: 'ปวช.1 คอมพิวเตอร์ธุรกิจ ห้อง 1', year_level: 1, student_count: 30, advisor_teacher_id: 11 },
  { id: 7, program_id: 4, department_id: 4, code: 'กต.อ.1', name: 'ปวช.1 การตลาด ห้อง 1', year_level: 1, student_count: 25, advisor_teacher_id: 11 },
  { id: 8, program_id: 4, department_id: 4, code: 'บช.ช.2', name: 'บช.ช.2', year_level: 2, student_count: 0, advisor_teacher_id: 11 },
  { id: 9, program_id: 4, department_id: 4, code: 'ทต.ช.2', name: 'ทต.ช.2', year_level: 2, student_count: 0, advisor_teacher_id: 11 },
  { id: 10, program_id: 5, department_id: 4, code: 'คธ.ส.1', name: 'คธ.ส.1', year_level: 1, student_count: 27, advisor_teacher_id: 11 },
  { id: 11, program_id: 5, department_id: 4, code: 'คธ.ส.2', name: 'คธ.ส.2', year_level: 2, student_count: 0, advisor_teacher_id: 11 },
  { id: 1, program_id: 2, department_id: 2, code: 'BC66-1', name: 'ปวส.2 คอมพิวเตอร์ธุรกิจ ก.1', year_level: 2, student_count: 30, advisor_teacher_id: 1 },
  { id: 2, program_id: 2, department_id: 2, code: 'BC66-2', name: 'ปวส.2 คอมพิวเตอร์ธุรกิจ ก.2', year_level: 2, student_count: 28, advisor_teacher_id: 2 },
  { id: 3, program_id: 1, department_id: 1, code: 'IT67-1', name: 'ปวช.1 เทคโนโลยีสารสนเทศ ก.1', year_level: 1, student_count: 35, advisor_teacher_id: 3 },
  { id: 4, program_id: 3, department_id: 3, code: 'SE65-1', name: 'วศ.บ.3 วิศวกรรมซอฟต์แวร์ ก.1', year_level: 3, student_count: 25, advisor_teacher_id: 4 },
  { id: 5, program_id: 3, department_id: 3, code: 'SE66-1', name: 'วศ.บ.2 วิศวกรรมซอฟต์แวร์ ก.1', year_level: 2, student_count: 32, advisor_teacher_id: 5 },
];

export const initialRoomTypes: RoomType[] = [
  { id: 1, name: 'ห้องบรรยาย (Lecture Room)', code: 'LEC' },
  { id: 2, name: 'ห้องปฏิบัติการคอมพิวเตอร์ (Computer Lab)', code: 'LAB' },
  { id: 3, name: 'ห้องปฏิบัติการเครือข่ายและฮาร์ดแวร์ (Hardware Lab)', code: 'NET_LAB' },
  { id: 4, name: 'ห้องปฏิบัติการมัลติมีเดีย (Multimedia Lab)', code: 'MEDIA_LAB' },
];

export const initialRooms: Room[] = [
  { id: 11, room_type_id: 2, building: 'อาคารบริหารธุรกิจ (ธาตุพนม)', floor: 3, room_number: '0502-2303', capacity: 40, is_active: true },
  { id: 12, room_type_id: 2, building: 'อาคารบริหารธุรกิจ (ธาตุพนม)', floor: 2, room_number: '0502-2202', capacity: 40, is_active: true },
  { id: 13, room_type_id: 2, building: 'อาคารบริหารธุรกิจ (ธาตุพนม)', floor: 1, room_number: '0502-2101', capacity: 40, is_active: true },
  { id: 1, room_type_id: 2, building: 'อาคาร 4 ชั้น 3', floor: 3, room_number: 'LAB-431', capacity: 40, is_active: true },
  { id: 2, room_type_id: 2, building: 'อาคาร 4 ชั้น 3', floor: 3, room_number: 'LAB-432', capacity: 35, is_active: true },
  { id: 3, room_type_id: 3, building: 'อาคาร 4 ชั้น 4', floor: 4, room_number: 'LAB-441 (Network)', capacity: 32, is_active: true },
  { id: 4, room_type_id: 4, building: 'อาคาร 4 ชั้น 4', floor: 4, room_number: 'LAB-442 (Design)', capacity: 30, is_active: true },
  { id: 5, room_type_id: 1, building: 'อาคาร 5 ชั้น 2', floor: 2, room_number: 'LEC-521', capacity: 50, is_active: true },
  { id: 6, room_type_id: 1, building: 'อาคาร 5 ชั้น 2', floor: 2, room_number: 'LEC-522', capacity: 45, is_active: true },
  { id: 7, room_type_id: 1, building: 'อาคาร 5 ชั้น 3', floor: 3, room_number: 'LEC-531', capacity: 40, is_active: true },
  { id: 8, room_type_id: 1, building: 'อาคาร 5 ชั้น 3', floor: 3, room_number: 'LEC-532', capacity: 40, is_active: true },
  { id: 9, room_type_id: 1, building: 'อาคารเฉลิมพระเกียรติ', floor: 1, room_number: 'AUDITORIUM-1', capacity: 80, is_active: true },
  { id: 10, room_type_id: 2, building: 'อาคาร 3 ชั้น 2', floor: 2, room_number: 'LAB-321', capacity: 35, is_active: true },
];

export const initialTeachers: Teacher[] = [
  { id: 11, department_id: 4, prefix: 'อ.', name: 'ภิญญา สุขพิพัฒน์', email: 'pinya3603@gmail.com', phone: '042-532-111', max_periods_per_week: 24, max_periods_per_day: 8, max_consecutive_periods: 4, color_code: '#8B7D52' },
  { id: 1, department_id: 2, prefix: 'ดร.', name: 'กิตติศักดิ์ ศรีวิชัย', email: 'kittisak@college.ac.th', phone: '081-234-5671', max_periods_per_week: 18, max_periods_per_day: 6, max_consecutive_periods: 3, color_code: '#3b82f6' },
  { id: 2, department_id: 2, prefix: 'อ.', name: 'พรทิพย์ สุวรรณรัตน์', email: 'porntip@college.ac.th', phone: '081-234-5672', max_periods_per_week: 18, max_periods_per_day: 6, max_consecutive_periods: 3, color_code: '#10b981' },
  { id: 3, department_id: 1, prefix: 'ผศ.ดร.', name: 'อภิชาติ วัฒนาเจริญ', email: 'apichat@college.ac.th', phone: '081-234-5673', max_periods_per_week: 16, max_periods_per_day: 5, max_consecutive_periods: 3, color_code: '#8b5cf6' },
  { id: 4, department_id: 3, prefix: 'ดร.', name: 'ชานนท์ เมธาภัทร', email: 'chanon@college.ac.th', phone: '081-234-5674', max_periods_per_week: 18, max_periods_per_day: 6, max_consecutive_periods: 4, color_code: '#f59e0b' },
  { id: 5, department_id: 3, prefix: 'อ.', name: 'วรรณภา ประเสริฐสุข', email: 'wannapa@college.ac.th', phone: '081-234-5675', max_periods_per_week: 18, max_periods_per_day: 6, max_consecutive_periods: 3, color_code: '#ec4899' },
  { id: 6, department_id: 1, prefix: 'อ.', name: 'ธีรเดช ภักดีชนม์', email: 'teeradej@college.ac.th', phone: '081-234-5676', max_periods_per_week: 16, max_periods_per_day: 6, max_consecutive_periods: 3, color_code: '#06b6d4' },
  { id: 7, department_id: 2, prefix: 'ดร.', name: 'นภัสวรรณ รัตนโยธิน', email: 'napassawan@college.ac.th', phone: '081-234-5677', max_periods_per_week: 16, max_periods_per_day: 5, max_consecutive_periods: 3, color_code: '#14b8a6' },
  { id: 8, department_id: 3, prefix: 'ผศ.', name: 'สมเกียรติ ยิ่งเจริญ', email: 'somkiat@college.ac.th', phone: '081-234-5678', max_periods_per_week: 18, max_periods_per_day: 6, max_consecutive_periods: 3, color_code: '#f97316' },
  { id: 9, department_id: 1, prefix: 'อ.', name: 'สิริพร บุญยืน', email: 'siriporn@college.ac.th', phone: '081-234-5679', max_periods_per_week: 16, max_periods_per_day: 6, max_consecutive_periods: 3, color_code: '#6366f1' },
  { id: 10, department_id: 2, prefix: 'อ.', name: 'วิชัย โชคอนันต์', email: 'wichai@college.ac.th', phone: '081-234-5680', max_periods_per_week: 18, max_periods_per_day: 6, max_consecutive_periods: 3, color_code: '#84cc16' },
];

export const initialTimeslots: Timeslot[] = [
  { id: 1, period_number: 1, start_time: '08:00', end_time: '09:00', label: 'คาบ 1 (08:00 - 09:00)', is_lunch: false },
  { id: 2, period_number: 2, start_time: '09:00', end_time: '10:00', label: 'คาบ 2 (09:00 - 10:00)', is_lunch: false },
  { id: 3, period_number: 3, start_time: '10:00', end_time: '11:00', label: 'คาบ 3 (10:00 - 11:00)', is_lunch: false },
  { id: 4, period_number: 4, start_time: '11:00', end_time: '12:00', label: 'คาบ 4 (11:00 - 12:00)', is_lunch: false },
  { id: 5, period_number: 5, start_time: '12:00', end_time: '13:00', label: 'พัก (12:00 - 13:00)', is_lunch: true },
  { id: 6, period_number: 6, start_time: '13:00', end_time: '14:00', label: 'คาบ 6 (13:00 - 14:00)', is_lunch: false },
  { id: 7, period_number: 7, start_time: '14:00', end_time: '15:00', label: 'คาบ 7 (14:00 - 15:00)', is_lunch: false },
  { id: 8, period_number: 8, start_time: '15:00', end_time: '16:00', label: 'คาบ 8 (15:00 - 16:00)', is_lunch: false },
  { id: 9, period_number: 9, start_time: '16:00', end_time: '17:00', label: 'คาบ 9 (16:00 - 17:00)', is_lunch: false },
  { id: 10, period_number: 10, start_time: '17:00', end_time: '18:00', label: 'คาบ 10 (17:00 - 18:00)', is_lunch: false },
  { id: 11, period_number: 11, start_time: '18:00', end_time: '19:00', label: 'คาบ 11 (18:00 - 19:00)', is_lunch: false },
  { id: 12, period_number: 12, start_time: '19:00', end_time: '20:00', label: 'คาบ 12 (19:00 - 20:00)', is_lunch: false },
  { id: 13, period_number: 13, start_time: '20:00', end_time: '21:00', label: 'คาบ 13 (20:00 - 21:00)', is_lunch: false },
];

export const initialBlockedTimeslots: BlockedTimeslot[] = [
  {
    id: 1,
    day_of_week: 0, // 0 = all days
    timeslot_id: 5,
    start_time: '12:00',
    end_time: '13:00',
    type: 'LUNCH',
    title: 'พักรับประทานอาหารกลางวัน (12:00 - 13:00 น.)',
    applies_to: 'ALL',
    is_active: true,
  },
  {
    id: 2,
    day_of_week: 3, // Wednesday
    timeslot_id: 8,
    start_time: '15:00',
    end_time: '16:00',
    type: 'ACTIVITY',
    title: 'กิจกรรมส่งเสริมวิชาการและชมรม (วันพุธ คาบ 8)',
    applies_to: 'ALL',
    is_active: true,
  },
];

export const initialCourses: Course[] = [
  { id: 1, department_id: 2, code: '30204-2001', name_th: 'ระบบจัดการฐานข้อมูล', name_en: 'Database Management Systems', credits: 3, theory_hours: 2, practice_hours: 2, default_room_type_id: 2, is_heavy: true },
  { id: 2, department_id: 2, code: '30204-2002', name_th: 'การเขียนโปรแกรมเชิงวัตถุ', name_en: 'Object-Oriented Programming', credits: 3, theory_hours: 2, practice_hours: 2, default_room_type_id: 2, is_heavy: true },
  { id: 3, department_id: 2, code: '30204-2003', name_th: 'การพัฒนาเว็บไซต์เชิงพาณิชย์', name_en: 'Commercial Web Development', credits: 3, theory_hours: 2, practice_hours: 2, default_room_type_id: 2, is_heavy: false },
  { id: 4, department_id: 2, code: '30204-2101', name_th: 'ความมั่นคงปลอดภัยสารสนเทศ', name_en: 'Information Security', credits: 2, theory_hours: 2, practice_hours: 0, default_room_type_id: 1, is_heavy: false },
  { id: 5, department_id: 1, code: '20204-2001', name_th: 'การวิเคราะห์ระบบสารสนเทศ', name_en: 'Systems Analysis and Design', credits: 3, theory_hours: 3, practice_hours: 0, default_room_type_id: 1, is_heavy: true },
  { id: 6, department_id: 1, code: '20204-2004', name_th: 'เครือข่ายคอมพิวเตอร์เบื้องต้น', name_en: 'Computer Network Fundamentals', credits: 3, theory_hours: 2, practice_hours: 2, default_room_type_id: 3, is_heavy: true },
  { id: 7, department_id: 1, code: '20204-2008', name_th: 'กราฟิกและการออกแบบอินเทอร์เฟซ', name_en: 'UI/UX and Graphic Design', credits: 2, theory_hours: 1, practice_hours: 2, default_room_type_id: 4, is_heavy: false },
  { id: 8, department_id: 1, code: '20000-1201', name_th: 'ภาษาอังกฤษเพื่อการสื่อสารธุรกิจ', name_en: 'English for Business Communication', credits: 2, theory_hours: 2, practice_hours: 0, default_room_type_id: 1, is_heavy: false },
  { id: 9, department_id: 3, code: 'CPE-301', name_th: 'โครงสร้างข้อมูลและขั้นตอนวิธี', name_en: 'Data Structures and Algorithms', credits: 4, theory_hours: 3, practice_hours: 2, default_room_type_id: 2, is_heavy: true },
  { id: 10, department_id: 3, code: 'CPE-302', name_th: 'สถาปัตยกรรมคอมพิวเตอร์และระบบปฏิบัติการ', name_en: 'Computer Architecture & OS', credits: 3, theory_hours: 3, practice_hours: 0, default_room_type_id: 1, is_heavy: true },
  { id: 11, department_id: 3, code: 'CPE-303', name_th: 'วิศวกรรมความต้องการซอฟต์แวร์', name_en: 'Software Requirements Engineering', credits: 3, theory_hours: 2, practice_hours: 2, default_room_type_id: 1, is_heavy: false },
  { id: 12, department_id: 3, code: 'CPE-305', name_th: 'การพัฒนาแอปพลิเคชันบนคลาวด์', name_en: 'Cloud Application Development', credits: 3, theory_hours: 2, practice_hours: 2, default_room_type_id: 2, is_heavy: true },
  { id: 13, department_id: 2, code: '30204-2104', name_th: 'การตลาดดิจิทัลและอีคอมเมิร์ซ', name_en: 'Digital Marketing & E-Commerce', credits: 2, theory_hours: 2, practice_hours: 0, default_room_type_id: 1, is_heavy: false },
  { id: 14, department_id: 1, code: '20204-2102', name_th: 'การเขียนโปรแกรมไพทอนเบื้องต้น', name_en: 'Introduction to Python Programming', credits: 3, theory_hours: 2, practice_hours: 2, default_room_type_id: 2, is_heavy: false },
  { id: 15, department_id: 3, code: 'CPE-401', name_th: 'การทดสอบและการประกันคุณภาพซอฟต์แวร์', name_en: 'Software Testing & QA', credits: 3, theory_hours: 2, practice_hours: 2, default_room_type_id: 2, is_heavy: false },
  { id: 16, department_id: 3, code: 'CPE-490', name_th: 'โครงงานวิศวกรรมซอฟต์แวร์ 1', name_en: 'Software Engineering Capstone 1', credits: 3, theory_hours: 1, practice_hours: 4, default_room_type_id: 2, is_heavy: false },
  { id: 17, department_id: 2, code: '30000-1501', name_th: 'คณิตศาสตร์และสถิติประยุกต์', name_en: 'Applied Mathematics & Statistics', credits: 3, theory_hours: 3, practice_hours: 0, default_room_type_id: 1, is_heavy: true },
  { id: 18, department_id: 1, code: '20000-1101', name_th: 'ทักษะชีวิตและสังคมดิจิทัล', name_en: 'Life Skills and Digital Citizenship', credits: 2, theory_hours: 2, practice_hours: 0, default_room_type_id: 1, is_heavy: false },
  { id: 19, department_id: 3, code: 'CPE-308', name_th: 'ปัญญาประดิษฐ์และการเรียนรู้ของเครื่อง', name_en: 'Artificial Intelligence & Machine Learning', credits: 3, theory_hours: 2, practice_hours: 2, default_room_type_id: 2, is_heavy: true },
  { id: 20, department_id: 2, code: '30204-8001', name_th: 'โครงงานคอมพิวเตอร์ธุรกิจ', name_en: 'Business Computing Capstone Project', credits: 4, theory_hours: 1, practice_hours: 6, default_room_type_id: 2, is_heavy: false },
  // Thatphanom College Courses (from official timetable)
  { id: 21, department_id: 4, code: '202042008', name_th: 'การสร้างเว็บไซต์', name_en: 'Website Development', credits: 3, theory_hours: 2, practice_hours: 2, default_room_type_id: 2, is_heavy: false },
  { id: 22, department_id: 4, code: '219102001', name_th: 'ระบบปฏิบัติการเบื้องต้น', name_en: 'Computer Operating Systems', credits: 3, theory_hours: 2, practice_hours: 2, default_room_type_id: 2, is_heavy: false },
  { id: 23, department_id: 4, code: '219102005', name_th: 'โปรแกรมตารางคำนวณ', name_en: 'Spreadsheet Program', credits: 2, theory_hours: 1, practice_hours: 2, default_room_type_id: 2, is_heavy: false },
  { id: 24, department_id: 4, code: '219102013', name_th: 'ระบบเครือข่ายคอมพิวเตอร์', name_en: 'Computer Network Systems', credits: 2, theory_hours: 1, practice_hours: 3, default_room_type_id: 2, is_heavy: false },
  { id: 25, department_id: 4, code: '219102016', name_th: 'การสร้างเว็บไซต์สำหรับธุรกิจดิจิทัล', name_en: 'Website Creation for Digital Business', credits: 3, theory_hours: 2, practice_hours: 2, default_room_type_id: 2, is_heavy: false },
  { id: 26, department_id: 4, code: '20601001', name_th: 'ระบบปฏิบัติการและบำรุงรักษาคอมพิวเตอร์', name_en: 'OS and Computer Maintenance', credits: 3, theory_hours: 2, practice_hours: 2, default_room_type_id: 2, is_heavy: false },
  { id: 27, department_id: 4, code: '20801313', name_th: 'การจัดการตลาดดิจิทัล', name_en: 'Digital Marketing Management', credits: 3, theory_hours: 2, practice_hours: 2, default_room_type_id: 2, is_heavy: false },
  { id: 28, department_id: 4, code: 'ACTIVITY-WED', name_th: 'กิจกรรมส่งเสริมวิชาการและอบรมฯ', name_en: 'Academic Enhancement & Training Activity', credits: 0, theory_hours: 0, practice_hours: 3, default_room_type_id: 2, is_heavy: false },
];

export const initialCourseOfferings: CourseOffering[] = [
  // Group 1: BC66-1 (ปวส.2 คอมธุรกิจ ก.1, 30 คน)
  {
    id: 1,
    semester_id: 1,
    course_id: 1, // Database Systems
    student_group_id: 1,
    teacher_id: 1, // ดร.กิตติศักดิ์
    room_type_id: 2, // Computer Lab
    student_count: 30,
    sessions_per_week: 2,
    periods_per_session: [2, 2], // 2 + 2 = 4 periods
    must_be_consecutive: true,
    max_sessions_per_day: 1,
    preferred_room_id: 1, // LAB-431
    is_fixed: false,
    is_active: true,
  },
  {
    id: 2,
    semester_id: 1,
    course_id: 2, // OOP
    student_group_id: 1,
    teacher_id: 2, // อ.พรทิพย์
    room_type_id: 2, // Computer Lab
    student_count: 30,
    sessions_per_week: 2,
    periods_per_session: [2, 2],
    must_be_consecutive: true,
    max_sessions_per_day: 1,
    preferred_room_id: 2, // LAB-432
    is_fixed: false,
    is_active: true,
  },
  {
    id: 3,
    semester_id: 1,
    course_id: 4, // Info Security
    student_group_id: 1,
    teacher_id: 7, // ดร.นภัสวรรณ
    room_type_id: 1, // Lecture
    student_count: 30,
    sessions_per_week: 1,
    periods_per_session: [2],
    must_be_consecutive: true,
    max_sessions_per_day: 1,
    preferred_room_id: 5,
    is_fixed: false,
    is_active: true,
  },
  {
    id: 4,
    semester_id: 1,
    course_id: 17, // Applied Math
    student_group_id: 1,
    teacher_id: 10, // อ.วิชัย
    room_type_id: 1, // Lecture
    student_count: 30,
    sessions_per_week: 1,
    periods_per_session: [3],
    must_be_consecutive: true,
    max_sessions_per_day: 1,
    preferred_room_id: 6,
    is_fixed: false,
    is_active: true,
  },
  {
    id: 5,
    semester_id: 1,
    course_id: 8, // English
    student_group_id: 1,
    teacher_id: 9, // อ.สิริพร
    room_type_id: 1, // Lecture
    student_count: 30,
    sessions_per_week: 1,
    periods_per_session: [2],
    must_be_consecutive: true,
    max_sessions_per_day: 1,
    preferred_room_id: 5,
    is_fixed: false,
    is_active: true,
  },

  // Group 2: BC66-2 (ปวส.2 คอมธุรกิจ ก.2, 28 คน)
  {
    id: 6,
    semester_id: 1,
    course_id: 1, // Database Systems
    student_group_id: 2,
    teacher_id: 1, // ดร.กิตติศักดิ์
    room_type_id: 2,
    student_count: 28,
    sessions_per_week: 2,
    periods_per_session: [2, 2],
    must_be_consecutive: true,
    max_sessions_per_day: 1,
    preferred_room_id: 1,
    is_fixed: false,
    is_active: true,
  },
  {
    id: 7,
    semester_id: 1,
    course_id: 3, // Commercial Web Dev
    student_group_id: 2,
    teacher_id: 2, // อ.พรทิพย์
    room_type_id: 2,
    student_count: 28,
    sessions_per_week: 2,
    periods_per_session: [2, 2],
    must_be_consecutive: true,
    max_sessions_per_day: 1,
    preferred_room_id: 2,
    is_fixed: false,
    is_active: true,
  },
  {
    id: 8,
    semester_id: 1,
    course_id: 13, // Digital Marketing
    student_group_id: 2,
    teacher_id: 7, // ดร.นภัสวรรณ
    room_type_id: 1,
    student_count: 28,
    sessions_per_week: 1,
    periods_per_session: [2],
    must_be_consecutive: true,
    max_sessions_per_day: 1,
    preferred_room_id: 6,
    is_fixed: false,
    is_active: true,
  },

  // Group 3: IT67-1 (ปวช.1 ไอที, 35 คน)
  {
    id: 9,
    semester_id: 1,
    course_id: 6, // Network Fund
    student_group_id: 3,
    teacher_id: 6, // อ.ธีรเดช
    room_type_id: 3, // Hardware / Network Lab
    student_count: 35,
    sessions_per_week: 2,
    periods_per_session: [2, 2],
    must_be_consecutive: true,
    max_sessions_per_day: 1,
    preferred_room_id: 3,
    is_fixed: false,
    is_active: true,
  },
  {
    id: 10,
    semester_id: 1,
    course_id: 14, // Python Intro
    student_group_id: 3,
    teacher_id: 3, // ผศ.ดร.อภิชาติ
    room_type_id: 2,
    student_count: 35,
    sessions_per_week: 2,
    periods_per_session: [2, 2],
    must_be_consecutive: true,
    max_sessions_per_day: 1,
    preferred_room_id: 10,
    is_fixed: false,
    is_active: true,
  },
  {
    id: 11,
    semester_id: 1,
    course_id: 7, // UI/UX Graphic
    student_group_id: 3,
    teacher_id: 9, // อ.สิริพร
    room_type_id: 4, // Media Lab
    student_count: 35,
    sessions_per_week: 1,
    periods_per_session: [3],
    must_be_consecutive: true,
    max_sessions_per_day: 1,
    preferred_room_id: 4,
    is_fixed: false,
    is_active: true,
  },
  {
    id: 12,
    semester_id: 1,
    course_id: 18, // Life Skills
    student_group_id: 3,
    teacher_id: 10, // อ.วิชัย
    room_type_id: 1,
    student_count: 35,
    sessions_per_week: 1,
    periods_per_session: [2],
    must_be_consecutive: true,
    max_sessions_per_day: 1,
    preferred_room_id: 5,
    is_fixed: false,
    is_active: true,
  },

  // Group 4: SE65-1 (วศ.บ.3 Software Eng, 25 คน)
  {
    id: 13,
    semester_id: 1,
    course_id: 9, // Data Structures
    student_group_id: 4,
    teacher_id: 4, // ดร.ชานนท์
    room_type_id: 2,
    student_count: 25,
    sessions_per_week: 2,
    periods_per_session: [2, 2],
    must_be_consecutive: true,
    max_sessions_per_day: 1,
    preferred_room_id: 2,
    is_fixed: false,
    is_active: true,
  },
  {
    id: 14,
    semester_id: 1,
    course_id: 12, // Cloud App
    student_group_id: 4,
    teacher_id: 5, // อ.วรรณภา
    room_type_id: 2,
    student_count: 25,
    sessions_per_week: 2,
    periods_per_session: [2, 2],
    must_be_consecutive: true,
    max_sessions_per_day: 1,
    preferred_room_id: 1,
    is_fixed: false,
    is_active: true,
  },
  {
    id: 15,
    semester_id: 1,
    course_id: 15, // Software QA
    student_group_id: 4,
    teacher_id: 8, // ผศ.สมเกียรติ
    room_type_id: 2,
    student_count: 25,
    sessions_per_week: 1,
    periods_per_session: [3],
    must_be_consecutive: true,
    max_sessions_per_day: 1,
    preferred_room_id: 2,
    is_fixed: false,
    is_active: true,
  },

  // Group 5: SE66-1 (วศ.บ.2 Software Eng, 32 คน)
  {
    id: 16,
    semester_id: 1,
    course_id: 10, // OS & Arch
    student_group_id: 5,
    teacher_id: 4, // ดร.ชานนท์
    room_type_id: 1,
    student_count: 32,
    sessions_per_week: 1,
    periods_per_session: [3],
    must_be_consecutive: true,
    max_sessions_per_day: 1,
    preferred_room_id: 7,
    is_fixed: false,
    is_active: true,
  },
  {
    id: 17,
    semester_id: 1,
    course_id: 11, // Requirements Eng
    student_group_id: 5,
    teacher_id: 5, // อ.วรรณภา
    room_type_id: 1,
    student_count: 32,
    sessions_per_week: 1,
    periods_per_session: [3],
    must_be_consecutive: true,
    max_sessions_per_day: 1,
    preferred_room_id: 8,
    is_fixed: false,
    is_active: true,
  },
  {
    id: 18,
    semester_id: 1,
    course_id: 19, // AI & ML
    student_group_id: 5,
    teacher_id: 3, // ผศ.ดร.อภิชาติ
    room_type_id: 2,
    student_count: 32,
    sessions_per_week: 2,
    periods_per_session: [2, 2],
    must_be_consecutive: true,
    max_sessions_per_day: 1,
    preferred_room_id: 10,
    is_fixed: false,
    is_active: true,
  },

  // Offerings for Teacher 11: อ.ภิญญา สุขพิพัฒน์ (Thatphanom College)
  {
    id: 31,
    semester_id: 1,
    course_id: 23, // 219102005 โปรแกรมตารางคำนวณ (1-2-2)
    student_group_id: 6, // คธ.1
    teacher_id: 11,
    room_type_id: 2,
    student_count: 30,
    sessions_per_week: 1,
    periods_per_session: [3],
    must_be_consecutive: true,
    max_sessions_per_day: 1,
    preferred_room_id: 11, // 0502-2303
    is_fixed: false,
    is_active: true,
  },
  {
    id: 32,
    semester_id: 1,
    course_id: 21, // 202042008 การสร้างเว็บไซต์ (2-2-3)
    student_group_id: 7, // กต.อ.1
    teacher_id: 11,
    room_type_id: 2,
    student_count: 25,
    sessions_per_week: 1,
    periods_per_session: [3],
    must_be_consecutive: true,
    max_sessions_per_day: 1,
    preferred_room_id: 12, // 0502-2202
    is_fixed: false,
    is_active: true,
  },
  {
    id: 33,
    semester_id: 1,
    course_id: 26, // 20601001 ระบบปฏิบัติการและบำรุงรักษาคอมพิวเตอร์ (2-2-3)
    student_group_id: 6, // คธ.1
    teacher_id: 11,
    room_type_id: 2,
    student_count: 30,
    sessions_per_week: 1,
    periods_per_session: [4],
    must_be_consecutive: true,
    max_sessions_per_day: 1,
    preferred_room_id: 12, // 0502-2202
    is_fixed: false,
    is_active: true,
  },
  {
    id: 34,
    semester_id: 1,
    course_id: 22, // 219102001 ระบบปฏิบัติการเบื้องต้น (2-2-3)
    student_group_id: 6, // คธ.1
    teacher_id: 11,
    room_type_id: 2,
    student_count: 30,
    sessions_per_week: 2,
    periods_per_session: [2, 2],
    must_be_consecutive: true,
    max_sessions_per_day: 1,
    preferred_room_id: 12, // 0502-2202
    is_fixed: false,
    is_active: true,
  },
  {
    id: 37,
    semester_id: 1,
    course_id: 28, // ACTIVITY-WED กิจกรรมส่งเสริมวิชาการและอบรมฯ
    student_group_id: 6, // คธ.1
    teacher_id: 11,
    room_type_id: 2,
    student_count: 30,
    sessions_per_week: 1,
    periods_per_session: [3],
    must_be_consecutive: true,
    max_sessions_per_day: 1,
    preferred_room_id: 12, // 0502-2202
    is_fixed: true,
    is_active: true,
  },
  {
    id: 35,
    semester_id: 1,
    course_id: 24, // 219102013 ระบบเครือข่ายคอมพิวเตอร์ (1-3-2)
    student_group_id: 10, // คธ.ส.1
    teacher_id: 11,
    room_type_id: 2,
    student_count: 27,
    sessions_per_week: 1,
    periods_per_session: [4],
    must_be_consecutive: true,
    max_sessions_per_day: 1,
    preferred_room_id: 12, // 0502-2202
    is_fixed: false,
    is_active: true,
  },
  {
    id: 36,
    semester_id: 1,
    course_id: 25, // 219102016 การสร้างเว็บไซต์สำหรับธุรกิจดิจิทัล (2-2-3)
    student_group_id: 10, // คธ.ส.1
    teacher_id: 11,
    room_type_id: 2,
    student_count: 27,
    sessions_per_week: 1,
    periods_per_session: [4],
    must_be_consecutive: true,
    max_sessions_per_day: 1,
    preferred_room_id: 13, // 0502-2101
    is_fixed: false,
    is_active: true,
  },
  {
    id: 37,
    semester_id: 1,
    course_id: 27, // 20801313 การจัดการตลาดดิจิทัล (2-2-3)
    student_group_id: 9, // ทต.ช.2
    teacher_id: 11,
    room_type_id: 2,
    student_count: 22,
    sessions_per_week: 1,
    periods_per_session: [4],
    must_be_consecutive: true,
    max_sessions_per_day: 1,
    preferred_room_id: 12, // 0502-2202
    is_fixed: false,
    is_active: true,
  },
];

export const initialConstraintWeights: ConstraintWeight[] = [
  // Hard constraints
  { id: 1, code: 'TEACHER_CONFLICT', name: 'อาจารย์ห้ามสอนซ้อนเวลา (Teacher Conflict)', description: 'อาจารย์คนเดียวกันห้ามสอนหลายวิชาในเวลาเดียวกัน', type: 'HARD', weight: 9999, is_active: true },
  { id: 2, code: 'ROOM_CONFLICT', name: 'ห้องเรียนห้ามถูกใช้พร้อมกัน (Room Conflict)', description: 'ห้องเดียวกันห้ามมีหลายกลุ่มเรียนในเวลาเดียวกัน', type: 'HARD', weight: 9999, is_active: true },
  { id: 3, code: 'GROUP_CONFLICT', name: 'กลุ่มเรียนห้ามเรียนซ้อนเวลา (Student Group Conflict)', description: 'นักศึกษากลุ่มเดียวกันห้ามมีตารางเรียนชนกัน', type: 'HARD', weight: 9999, is_active: true },
  { id: 4, code: 'ROOM_CAPACITY', name: 'ความจุห้องต้องเพียงพอ (Room Capacity)', description: 'จำนวนนักศึกษาในกลุ่มต้องไม่เกินความจุที่นั่งของห้อง', type: 'HARD', weight: 9999, is_active: true },
  { id: 5, code: 'ROOM_TYPE', name: 'ประเภทห้องต้องตรงกับวิชา (Room Type Match)', description: 'วิชาปฏิบัติการต้องจัดในห้อง Lab ตรงประเภท', type: 'HARD', weight: 9999, is_active: true },
  { id: 6, code: 'TEACHER_AVAILABILITY', name: 'เวลาไม่ว่างของอาจารย์ (Teacher Availability)', description: 'ห้ามจัดในเวลาที่อาจารย์บันทึกว่าติดภารกิจ/ไม่สะดวก', type: 'HARD', weight: 9999, is_active: true },
  { id: 7, code: 'BLOCKED_TIMESLOT', name: 'ช่วงเวลาห้ามจัดสอน (Blocked Timeslots)', description: 'ห้ามจัดช่วงพักกลางวัน 12:00-13:00 และคาบกิจกรรมพุธ 15:00-16:00', type: 'HARD', weight: 9999, is_active: true },
  { id: 8, code: 'CONSECUTIVE_PERIOD', name: 'คาบเรียนต้องต่อเนื่อง (Consecutive Periods)', description: 'วิชาที่มีคาบต่อเนื่อง (2 หรือ 3 คาบ) ต้องจัดติดกันในวันเดียวกัน', type: 'HARD', weight: 9999, is_active: true },

  // Soft constraints with adjustable weights
  { id: 9, code: 'MINIMIZE_STUDENT_GAP', name: 'ลดคาบว่างของนักศึกษา (Minimize Student Gap)', description: 'หลีกเลี่ยงการมีช่องว่างหรือคาบว่างระหว่างวันของนักเรียน', type: 'SOFT', weight: 10, is_active: true },
  { id: 10, code: 'TEACHER_PREFERENCE', name: 'ตรงตามเวลาที่อาจารย์ต้องการ (Teacher Preference)', description: 'จัดสอนในช่วงเวลาเช้า/บ่ายที่อาจารย์ระบุเป็นพิเศษ', type: 'SOFT', weight: 8, is_active: true },
  { id: 11, code: 'TEACHER_WORKLOAD_BALANCE', name: 'กระจายภาระสอนตลอดสัปดาห์ (Workload Balance)', description: 'กระจายชั่วโมงสอนให้อาจารย์อย่างสมดุล ไม่กระจุกตัววันเดียว', type: 'SOFT', weight: 5, is_active: true },
  { id: 12, code: 'MAX_CONSECUTIVE_TEACHING', name: 'จำกัดคาบสอนต่อเนื่องของอาจารย์ (Max Consecutive)', description: 'ไม่ให้อาจารย์สอนต่อเนื่องเกิน 3-4 คาบโดยไม่มีเวลาพัก', type: 'SOFT', weight: 6, is_active: true },
  { id: 13, code: 'HEAVY_COURSE_DISTRIBUTION', name: 'กระจายวิชาบรรยายหนัก (Heavy Course Distribution)', description: 'ไม่จัดวิชาคำนวณหรือบรรยายหนักติดกันเกิน 3 คาบในวันเดียว', type: 'SOFT', weight: 4, is_active: true },
  { id: 14, code: 'STUDENT_DAILY_LOAD', name: 'จำกัดคาบเรียนต่อวันของนักศึกษา (Student Daily Load)', description: 'ไม่จัดวิชาให้นักเรียนเกิน 6 คาบในวันเดียว', type: 'SOFT', weight: 5, is_active: true },
  { id: 15, code: 'ROOM_PREFERENCE', name: 'เลือกห้องประจำหรือห้องที่ต้องการ (Room Preference)', description: 'พยายามจัดห้องที่ระบุเป็น preferred_room ก่อน', type: 'SOFT', weight: 7, is_active: true },
  { id: 16, code: 'SAME_COURSE_SPREAD', name: 'กระจายวิชาเดียวกันข้ามวัน (Same Course Distribution)', description: 'สำหรับวิชาที่มี 2 sessions ให้จัดคนละวัน (เช่น จันทร์ + พฤหัส)', type: 'SOFT', weight: 9, is_active: true },
];

export const initialUsers: User[] = [
  { id: 1, name: 'ศ.ดร.ประสิทธิ์ สุขสมบูรณ์', email: 'admin@college.ac.th', role: 'super_admin', is_active: true, password: 'password123', phone: '081-234-5678', created_at: '2024-01-01 08:00:00' },
  { id: 2, name: 'อ.อรัญญา วงศ์สุวรรณ', email: 'academic@college.ac.th', role: 'academic_admin', is_active: true, password: 'password123', phone: '082-345-6789', created_at: '2024-01-01 08:00:00' },
  { id: 3, name: 'ดร.กิตติศักดิ์ ศรีวิชัย', email: 'kittisak@college.ac.th', role: 'department_admin', department_id: 2, teacher_id: 1, is_active: true, password: 'password123', phone: '083-456-7890', created_at: '2024-01-01 08:00:00' },
  { id: 4, name: 'อ.พรทิพย์ สุวรรณรัตน์', email: 'porntip@college.ac.th', role: 'teacher', department_id: 2, teacher_id: 2, is_active: true, password: 'password123', phone: '084-567-8901', created_at: '2024-01-01 08:00:00' },
  { id: 6, name: 'อ.ภิญญา สุขวิพัฒน์', email: 'pinya3603@gmail.com', role: 'teacher', department_id: 4, teacher_id: 11, is_active: true, password: 'password123', phone: '042-532-111', created_at: '2024-01-01 08:00:00' },
  { id: 5, name: 'นายธนพล เจริญยิ่ง (ตัวแทนกลุ่ม BC66-1)', email: 'student.bc66@college.ac.th', role: 'student', student_group_id: 1, is_active: true, password: 'password123', phone: '085-678-9012', created_at: '2024-01-01 08:00:00' },
];

export const initialScheduleVersions: ScheduleVersion[] = [
  {
    id: 1,
    semester_id: 1,
    version_number: 1,
    name: 'V1.0 - Auto Optimized (CP-SAT Solver)',
    status: 'published',
    score: 96,
    hard_conflict_count: 0,
    soft_penalty_score: 18,
    notes: 'ผ่านการตรวจ Hard Constraints 100% และกระจายภาระสอนสมบูรณ์',
    created_by: 'Academic Admin',
    created_at: '2024-05-10 09:30:00',
    published_at: '2024-05-12 14:00:00',
  },
  {
    id: 2,
    semester_id: 1,
    version_number: 2,
    name: 'V2.0 - Draft Revision (ปรับปรุงคาบอาจารย์)',
    status: 'draft',
    score: 94,
    hard_conflict_count: 0,
    soft_penalty_score: 24,
    notes: 'แบบร่างฉบับปรับแก้เพื่อรองรับการสัมมนา',
    created_by: 'Academic Admin',
    created_at: '2024-05-14 11:20:00',
  },
];

// Seeded schedule entries for Version 1 (V1.0 - Published)
// Period 1: 06-07, 2: 07-08, 3: 08-09, 4: 09-10, 5: 10-11, 6: 11-12, 7: Lunch(12-13), 8: 13-14, 9: 14-15, 10: 15-16, 11: 16-17, 12: 17-18, 13: 18-19, 14: 19-20, 15: 20-21
// Days: 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri
export const initialScheduleEntries: ScheduleEntry[] = [
  // Thatphanom College - Teacher: อ.ภิญญา สุขพิพัฒน์ (Teacher ID 11) - Matches Official Document reference
  // Mon 13:00-16:00 (periods 6-8): Offering 31 (219102005 โปรแกรมตารางคำนวณ) Room 0502-2303, Group คธ.1
  { id: 41, schedule_version_id: 1, course_offering_id: 31, session_index: 0, period_length: 3, day_of_week: 1, start_timeslot_id: 6, end_timeslot_id: 8, room_id: 11, is_locked: false, created_at: '2026-06-01 08:30:00', updated_at: '2026-06-01 08:30:00' },
  // Tue 09:00-12:00 (periods 2-4): Offering 32 (202042008 การสร้างเว็บไซต์) Room 0502-2202, Group กต.อ.1
  { id: 42, schedule_version_id: 1, course_offering_id: 32, session_index: 0, period_length: 3, day_of_week: 2, start_timeslot_id: 2, end_timeslot_id: 4, room_id: 12, is_locked: false, created_at: '2026-06-01 08:30:00', updated_at: '2026-06-01 08:30:00' },
  // Tue 13:00-17:00 (periods 6-9): Offering 33 (20601001 ระบบปฏิบัติการและบำรุงรักษาคอมพิวเตอร์) Room 0502-2202, Group คธ.1
  { id: 43, schedule_version_id: 1, course_offering_id: 33, session_index: 0, period_length: 4, day_of_week: 2, start_timeslot_id: 6, end_timeslot_id: 9, room_id: 12, is_locked: false, created_at: '2026-06-01 08:30:00', updated_at: '2026-06-01 08:30:00' },
  // Wed 13:00-15:00 (periods 6-7): Offering 34 (219102001 ระบบปฏิบัติการเบื้องต้น) Room 0502-2202, Group คธ.1
  { id: 44, schedule_version_id: 1, course_offering_id: 34, session_index: 0, period_length: 2, day_of_week: 3, start_timeslot_id: 6, end_timeslot_id: 7, room_id: 12, is_locked: false, created_at: '2026-06-01 08:30:00', updated_at: '2026-06-01 08:30:00' },
  // Wed 15:00-18:00 (periods 8-10): Offering 37 (ACTIVITY-WED กิจกรรมส่งเสริมวิชาการและอบรมฯ) Room 0502-2202, Group คธ.1
  { id: 48, schedule_version_id: 1, course_offering_id: 37, session_index: 0, period_length: 3, day_of_week: 3, start_timeslot_id: 8, end_timeslot_id: 10, room_id: 12, is_locked: false, created_at: '2026-06-01 08:30:00', updated_at: '2026-06-01 08:30:00' },
  // Thu 08:00-10:00 (periods 1-2): Offering 34 (219102001 ระบบปฏิบัติการเบื้องต้น Sess 1) Room 0502-2202
  { id: 45, schedule_version_id: 1, course_offering_id: 34, session_index: 1, period_length: 2, day_of_week: 4, start_timeslot_id: 1, end_timeslot_id: 2, room_id: 12, is_locked: false, created_at: '2026-06-01 08:30:00', updated_at: '2026-06-01 08:30:00' },
  // Thu 13:00-17:00 (periods 6-9): Offering 35 (219102013 ระบบเครือข่ายคอมพิวเตอร์) Room 0502-2202
  { id: 46, schedule_version_id: 1, course_offering_id: 35, session_index: 0, period_length: 4, day_of_week: 4, start_timeslot_id: 6, end_timeslot_id: 9, room_id: 12, is_locked: false, created_at: '2026-06-01 08:30:00', updated_at: '2026-06-01 08:30:00' },
  // Fri 13:00-17:00 (periods 6-9): Offering 36 (219102016 การสร้างเว็บไซต์สำหรับธุรกิจดิจิทัล) Room 0502-2101
  { id: 47, schedule_version_id: 1, course_offering_id: 36, session_index: 0, period_length: 4, day_of_week: 5, start_timeslot_id: 6, end_timeslot_id: 9, room_id: 13, is_locked: false, created_at: '2026-06-01 08:30:00', updated_at: '2026-06-01 08:30:00' },

  // Group 1: BC66-1
  // Mon: Offering 1 (Database) Sess 0, 2 periods (08:00-10:00, p3-p4), Room LAB-431
  { id: 1, schedule_version_id: 1, course_offering_id: 1, session_index: 0, period_length: 2, day_of_week: 1, start_timeslot_id: 3, end_timeslot_id: 4, room_id: 1, is_locked: false, created_at: '2024-05-10 09:30:00', updated_at: '2024-05-10 09:30:00' },
  // Mon: Offering 4 (Applied Math) Sess 0, 3 periods (13:00-16:00, p8-p10), Room LEC-522
  { id: 2, schedule_version_id: 1, course_offering_id: 4, session_index: 0, period_length: 3, day_of_week: 1, start_timeslot_id: 8, end_timeslot_id: 10, room_id: 6, is_locked: false, created_at: '2024-05-10 09:30:00', updated_at: '2024-05-10 09:30:00' },

  // Tue: Offering 2 (OOP) Sess 0, 2 periods (08:00-10:00, p3-p4), Room LAB-432
  { id: 3, schedule_version_id: 1, course_offering_id: 2, session_index: 0, period_length: 2, day_of_week: 2, start_timeslot_id: 3, end_timeslot_id: 4, room_id: 2, is_locked: false, created_at: '2024-05-10 09:30:00', updated_at: '2024-05-10 09:30:00' },
  // Tue: Offering 3 (Info Security) Sess 0, 2 periods (10:00-12:00, p5-p6), Room LEC-521
  { id: 4, schedule_version_id: 1, course_offering_id: 3, session_index: 0, period_length: 2, day_of_week: 2, start_timeslot_id: 5, end_timeslot_id: 6, room_id: 5, is_locked: false, created_at: '2024-05-10 09:30:00', updated_at: '2024-05-10 09:30:00' },

  // Wed: Offering 5 (English) Sess 0, 2 periods (09:00-11:00, p4-p5), Room LEC-521
  { id: 5, schedule_version_id: 1, course_offering_id: 5, session_index: 0, period_length: 2, day_of_week: 3, start_timeslot_id: 4, end_timeslot_id: 5, room_id: 5, is_locked: false, created_at: '2024-05-10 09:30:00', updated_at: '2024-05-10 09:30:00' },
  // Note: Wed p10 (15:00-16:00) is Activity blocked for all!

  // Thu: Offering 1 (Database) Sess 1, 2 periods (10:00-12:00, p5-p6), Room LAB-431
  { id: 6, schedule_version_id: 1, course_offering_id: 1, session_index: 1, period_length: 2, day_of_week: 4, start_timeslot_id: 5, end_timeslot_id: 6, room_id: 1, is_locked: false, created_at: '2024-05-10 09:30:00', updated_at: '2024-05-10 09:30:00' },
  // Thu: Offering 2 (OOP) Sess 1, 2 periods (13:00-15:00, p8-p9), Room LAB-432
  { id: 7, schedule_version_id: 1, course_offering_id: 2, session_index: 1, period_length: 2, day_of_week: 4, start_timeslot_id: 8, end_timeslot_id: 9, room_id: 2, is_locked: false, created_at: '2024-05-10 09:30:00', updated_at: '2024-05-10 09:30:00' },

  // Group 2: BC66-2
  // Mon: Offering 6 (Database) Sess 0, 2 periods (10:00-12:00, p5-p6), Room LAB-431
  { id: 8, schedule_version_id: 1, course_offering_id: 6, session_index: 0, period_length: 2, day_of_week: 1, start_timeslot_id: 5, end_timeslot_id: 6, room_id: 1, is_locked: false, created_at: '2024-05-10 09:30:00', updated_at: '2024-05-10 09:30:00' },
  // Tue: Offering 7 (Commercial Web) Sess 0, 2 periods (13:00-15:00, p8-p9), Room LAB-432
  { id: 9, schedule_version_id: 1, course_offering_id: 7, session_index: 0, period_length: 2, day_of_week: 2, start_timeslot_id: 8, end_timeslot_id: 9, room_id: 2, is_locked: false, created_at: '2024-05-10 09:30:00', updated_at: '2024-05-10 09:30:00' },
  // Wed: Offering 8 (Digital Marketing) Sess 0, 2 periods (09:00-11:00, p4-p5), Room LEC-522
  { id: 10, schedule_version_id: 1, course_offering_id: 8, session_index: 0, period_length: 2, day_of_week: 3, start_timeslot_id: 4, end_timeslot_id: 5, room_id: 6, is_locked: false, created_at: '2024-05-10 09:30:00', updated_at: '2024-05-10 09:30:00' },
  // Thu: Offering 6 (Database) Sess 1, 2 periods (08:00-10:00, p3-p4), Room LAB-431
  { id: 11, schedule_version_id: 1, course_offering_id: 6, session_index: 1, period_length: 2, day_of_week: 4, start_timeslot_id: 3, end_timeslot_id: 4, room_id: 1, is_locked: false, created_at: '2024-05-10 09:30:00', updated_at: '2024-05-10 09:30:00' },
  // Fri: Offering 7 (Commercial Web) Sess 1, 2 periods (09:00-11:00, p4-p5), Room LAB-432
  { id: 12, schedule_version_id: 1, course_offering_id: 7, session_index: 1, period_length: 2, day_of_week: 5, start_timeslot_id: 4, end_timeslot_id: 5, room_id: 2, is_locked: false, created_at: '2024-05-10 09:30:00', updated_at: '2024-05-10 09:30:00' },

  // Group 3: IT67-1
  // Mon: Offering 9 (Network) Sess 0, 2 periods (08:00-10:00, p3-p4), Room LAB-441 (Network)
  { id: 13, schedule_version_id: 1, course_offering_id: 9, session_index: 0, period_length: 2, day_of_week: 1, start_timeslot_id: 3, end_timeslot_id: 4, room_id: 3, is_locked: false, created_at: '2024-05-10 09:30:00', updated_at: '2024-05-10 09:30:00' },
  // Mon: Offering 12 (Life Skills) Sess 0, 2 periods (10:00-12:00, p5-p6), Room LEC-521
  { id: 14, schedule_version_id: 1, course_offering_id: 12, session_index: 0, period_length: 2, day_of_week: 1, start_timeslot_id: 5, end_timeslot_id: 6, room_id: 5, is_locked: false, created_at: '2024-05-10 09:30:00', updated_at: '2024-05-10 09:30:00' },
  // Tue: Offering 10 (Python) Sess 0, 2 periods (10:00-12:00, p5-p6), Room LAB-321
  { id: 15, schedule_version_id: 1, course_offering_id: 10, session_index: 0, period_length: 2, day_of_week: 2, start_timeslot_id: 5, end_timeslot_id: 6, room_id: 10, is_locked: false, created_at: '2024-05-10 09:30:00', updated_at: '2024-05-10 09:30:00' },
  // Wed: Offering 11 (UI/UX Graphic) Sess 0, 3 periods (08:00-11:00, p3-p5), Room LAB-442 (Design)
  { id: 16, schedule_version_id: 1, course_offering_id: 11, session_index: 0, period_length: 3, day_of_week: 3, start_timeslot_id: 3, end_timeslot_id: 5, room_id: 4, is_locked: false, created_at: '2024-05-10 09:30:00', updated_at: '2024-05-10 09:30:00' },
  // Thu: Offering 9 (Network) Sess 1, 2 periods (13:00-15:00, p8-p9), Room LAB-441
  { id: 17, schedule_version_id: 1, course_offering_id: 9, session_index: 1, period_length: 2, day_of_week: 4, start_timeslot_id: 8, end_timeslot_id: 9, room_id: 3, is_locked: false, created_at: '2024-05-10 09:30:00', updated_at: '2024-05-10 09:30:00' },
  // Fri: Offering 10 (Python) Sess 1, 2 periods (13:00-15:00, p8-p9), Room LAB-321
  { id: 18, schedule_version_id: 1, course_offering_id: 10, session_index: 1, period_length: 2, day_of_week: 5, start_timeslot_id: 8, end_timeslot_id: 9, room_id: 10, is_locked: false, created_at: '2024-05-10 09:30:00', updated_at: '2024-05-10 09:30:00' },

  // Group 4: SE65-1 (วศ.บ.3)
  // Tue: Offering 13 (Data Structures) Sess 0, 2 periods (08:00-10:00, p3-p4), Room LAB-431
  { id: 19, schedule_version_id: 1, course_offering_id: 13, session_index: 0, period_length: 2, day_of_week: 2, start_timeslot_id: 3, end_timeslot_id: 4, room_id: 1, is_locked: false, created_at: '2024-05-10 09:30:00', updated_at: '2024-05-10 09:30:00' },
  // Tue: Offering 14 (Cloud App) Sess 0, 2 periods (13:00-15:00, p8-p9), Room LAB-431
  { id: 20, schedule_version_id: 1, course_offering_id: 14, session_index: 0, period_length: 2, day_of_week: 2, start_timeslot_id: 8, end_timeslot_id: 9, room_id: 1, is_locked: false, created_at: '2024-05-10 09:30:00', updated_at: '2024-05-10 09:30:00' },
  // Wed: Offering 15 (Software QA) Sess 0, 3 periods (13:00-16:00 p8-p10), Room LAB-432
  { id: 21, schedule_version_id: 1, course_offering_id: 15, session_index: 0, period_length: 3, day_of_week: 3, start_timeslot_id: 8, end_timeslot_id: 10, room_id: 2, is_locked: false, created_at: '2024-05-10 09:30:00', updated_at: '2024-05-10 09:30:00' },
  // Fri: Offering 13 (Data Structures) Sess 1, 2 periods (08:00-10:00, p3-p4), Room LAB-431
  { id: 22, schedule_version_id: 1, course_offering_id: 13, session_index: 1, period_length: 2, day_of_week: 5, start_timeslot_id: 3, end_timeslot_id: 4, room_id: 1, is_locked: false, created_at: '2024-05-10 09:30:00', updated_at: '2024-05-10 09:30:00' },
  // Fri: Offering 14 (Cloud App) Sess 1, 2 periods (10:00-12:00, p5-p6), Room LAB-431
  { id: 23, schedule_version_id: 1, course_offering_id: 14, session_index: 1, period_length: 2, day_of_week: 5, start_timeslot_id: 5, end_timeslot_id: 6, room_id: 1, is_locked: false, created_at: '2024-05-10 09:30:00', updated_at: '2024-05-10 09:30:00' },

  // Group 5: SE66-1 (วศ.บ.2)
  // Mon: Offering 16 (OS & Arch) Sess 0, 3 periods (13:00-16:00, p8-p10), Room LEC-531
  { id: 24, schedule_version_id: 1, course_offering_id: 16, session_index: 0, period_length: 3, day_of_week: 1, start_timeslot_id: 8, end_timeslot_id: 10, room_id: 7, is_locked: false, created_at: '2024-05-10 09:30:00', updated_at: '2024-05-10 09:30:00' },
  // Wed: Offering 17 (Req Eng) Sess 0, 3 periods (08:00-11:00, p3-p5), Room LEC-532
  { id: 25, schedule_version_id: 1, course_offering_id: 17, session_index: 0, period_length: 3, day_of_week: 3, start_timeslot_id: 3, end_timeslot_id: 5, room_id: 8, is_locked: false, created_at: '2024-05-10 09:30:00', updated_at: '2024-05-10 09:30:00' },
  // Thu: Offering 18 (AI & ML) Sess 0, 2 periods (08:00-10:00, p3-p4), Room LAB-321
  { id: 26, schedule_version_id: 1, course_offering_id: 18, session_index: 0, period_length: 2, day_of_week: 4, start_timeslot_id: 3, end_timeslot_id: 4, room_id: 10, is_locked: false, created_at: '2024-05-10 09:30:00', updated_at: '2024-05-10 09:30:00' },
  // Fri: Offering 18 (AI & ML) Sess 1, 2 periods (10:00-12:00, p5-p6), Room LAB-321
  { id: 27, schedule_version_id: 1, course_offering_id: 18, session_index: 1, period_length: 2, day_of_week: 5, start_timeslot_id: 5, end_timeslot_id: 6, room_id: 10, is_locked: false, created_at: '2024-05-10 09:30:00', updated_at: '2024-05-10 09:30:00' },
];

export const initialTeacherAvailabilities: TeacherAvailability[] = [
  // Teacher 3 unavailable on Friday afternoon (periods 6-9) due to Faculty Senate Meeting
  { id: 1, teacher_id: 3, day_of_week: 5, timeslot_id: 6, is_available: false },
  { id: 2, teacher_id: 3, day_of_week: 5, timeslot_id: 7, is_available: false },
  { id: 3, teacher_id: 3, day_of_week: 5, timeslot_id: 8, is_available: false },
  { id: 4, teacher_id: 3, day_of_week: 5, timeslot_id: 9, is_available: false },
  // Teacher 1 unavailable on Tuesday morning (periods 1-2) due to Research Committee
  { id: 5, teacher_id: 1, day_of_week: 2, timeslot_id: 1, is_available: false },
  { id: 6, teacher_id: 1, day_of_week: 2, timeslot_id: 2, is_available: false },
];

export const initialTeacherPreferences: TeacherPreference[] = [
  // Teacher 1 prefers morning classes (periods 1-4)
  { id: 1, teacher_id: 1, day_of_week: 1, timeslot_id: 1, preference_level: 3 },
  { id: 2, teacher_id: 1, day_of_week: 1, timeslot_id: 2, preference_level: 3 },
  { id: 3, teacher_id: 1, day_of_week: 4, timeslot_id: 1, preference_level: 3 },
  { id: 4, teacher_id: 1, day_of_week: 4, timeslot_id: 2, preference_level: 3 },
  // Teacher 4 prefers Tuesday & Thursday
  { id: 5, teacher_id: 4, day_of_week: 2, timeslot_id: 1, preference_level: 3 },
  { id: 6, teacher_id: 4, day_of_week: 4, timeslot_id: 1, preference_level: 3 },
];

export const initialChangeLogs: ScheduleChangeLog[] = [
  {
    id: 1,
    schedule_version_id: 1,
    course_name: '30204-2001 ระบบจัดการฐานข้อมูล',
    user_name: 'Academic Admin',
    old_day: 1,
    old_period_start: 3,
    old_room_name: 'LEC-521',
    new_day: 1,
    new_period_start: 1,
    new_room_name: 'LAB-431',
    reason: 'ปรับย้ายเข้าห้องปฏิบัติการคอมพิวเตอร์ตามประเภทวิชา',
    ip_address: '192.168.1.45',
    created_at: '2024-05-11 10:15:22',
  },
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 1,
    user_name: 'Super Admin',
    action: 'CREATE',
    entity_type: 'AcademicYear',
    entity_id: 1,
    new_values: 'Year 2567 (Current)',
    ip_address: '192.168.1.10',
    created_at: '2024-05-01 08:30:00',
  },
  {
    id: 2,
    user_name: 'Academic Admin',
    action: 'GENERATE',
    entity_type: 'ScheduleVersion',
    entity_id: 1,
    new_values: 'Generated Schedule Version 1.0 (27 Sessions, Score 96)',
    ip_address: '192.168.1.45',
    created_at: '2024-05-10 09:30:00',
  },
  {
    id: 3,
    user_name: 'Super Admin',
    action: 'PUBLISH',
    entity_type: 'ScheduleVersion',
    entity_id: 1,
    new_values: 'Published Schedule Version 1.0 for Semester 1/2567',
    ip_address: '192.168.1.10',
    created_at: '2024-05-12 14:00:00',
  },
];
