/**
 * Bulk Data Import & Export Utilities
 * Supports CSV parsing, Excel-compatible Thai UTF-8 export, and schema validation.
 */

import {
  Teacher,
  StudentGroup,
  Room,
  Course,
  CourseOffering,
  Department,
  RoomType,
} from '../types';

export type ImportCategory = 'teachers' | 'studentGroups' | 'rooms' | 'courses' | 'offerings';

export interface ColumnDefinition {
  key: string;
  labelTh: string;
  required: boolean;
  example: string;
  description: string;
}

export const IMPORT_TEMPLATES: Record<ImportCategory, { title: string; columns: ColumnDefinition[] }> = {
  teachers: {
    title: 'อาจารย์ผู้สอน (Teachers)',
    columns: [
      { key: 'prefix', labelTh: 'คำนำหน้า', required: true, example: 'ดร.', description: 'เช่น ดร., ผศ.ดร., อ.' },
      { key: 'name', labelTh: 'ชื่อ-นามสกุล', required: true, example: 'สมเกียรติ สุขสวัสดิ์', description: 'ชื่อและนามสกุลอาจารย์' },
      { key: 'email', labelTh: 'อีเมล', required: false, example: 'somkiat@npu.ac.th', description: 'อีเมลสำหรับติดต่อหรือล็อกอิน' },
      { key: 'phone', labelTh: 'เบอร์โทรศัพท์', required: false, example: '081-234-5678', description: 'เบอร์โทรศัพท์' },
      { key: 'department_id', labelTh: 'รหัสสาขา/แผนก', required: false, example: '2', description: 'ID สาขาวิชา (เช่น 1, 2, 3, 4)' },
      { key: 'max_periods_per_week', labelTh: 'ภาระสอนสูงสุดต่อสัปดาห์', required: false, example: '18', description: 'ค่าปกติ 18-24 คาบ' },
      { key: 'color_code', labelTh: 'รหัสสีประจำตัว', required: false, example: '#3B82F6', description: 'Hex color code เช่น #3B82F6' },
    ],
  },
  studentGroups: {
    title: 'ชั้นปี / กลุ่มเรียนนักศึกษา (Student Groups)',
    columns: [
      { key: 'code', labelTh: 'รหัสกลุ่มเรียน', required: true, example: 'BC67-1', description: 'เช่น BC67-1, ทต.ช.1, SE66-1' },
      { key: 'name', labelTh: 'ชื่อกลุ่มเรียน / ชั้นปี', required: true, example: 'ปวส.2 คอมพิวเตอร์ธุรกิจ ก.1', description: 'ชื่อกลุ่มเรียนและระดับชั้น' },
      { key: 'year_level', labelTh: 'ชั้นปี (1-4)', required: true, example: '2', description: 'เลขชั้นปี เช่น 1, 2, 3, 4' },
      { key: 'student_count', labelTh: 'จำนวนนักศึกษา', required: true, example: '30', description: 'จำนวนคนในกลุ่ม' },
      { key: 'department_id', labelTh: 'รหัสสาขาวิชา', required: false, example: '2', description: 'ID สาขาวิชา' },
    ],
  },
  rooms: {
    title: 'ห้องเรียนและอาคาร (Rooms)',
    columns: [
      { key: 'room_number', labelTh: 'หมายเลขห้อง', required: true, example: '0502-2202', description: 'เช่น LAB-431, 0502-2202' },
      { key: 'building', labelTh: 'อาคาร / สถานที่', required: true, example: 'อาคารบริหารธุรกิจ (ธาตุพนม)', description: 'ชื่ออาคาร' },
      { key: 'floor', labelTh: 'ชั้น', required: false, example: '2', description: 'ชั้นที่ตั้งของห้อง' },
      { key: 'room_type_id', labelTh: 'ประเภทห้อง (1=บรรยาย, 2=Lab)', required: true, example: '2', description: '1=บรรยาย, 2=คอมพิวเตอร์, 3=เครือข่าย, 4=มีเดีย' },
      { key: 'capacity', labelTh: 'ความจุที่นั่ง', required: true, example: '40', description: 'จำนวนที่นั่งสูงสุด' },
    ],
  },
  courses: {
    title: 'รายวิชาตามหลักสูตร (Courses)',
    columns: [
      { key: 'code', labelTh: 'รหัสวิชา', required: true, example: '30204-2001', description: 'รหัสวิชาตามหลักสูตร' },
      { key: 'name_th', labelTh: 'ชื่อวิชา (ภาษาไทย)', required: true, example: 'ระบบจัดการฐานข้อมูล', description: 'ชื่อวิชาภาษาไทย' },
      { key: 'name_en', labelTh: 'ชื่อวิชา (ภาษาอังกฤษ)', required: false, example: 'Database Management Systems', description: 'ชื่อวิชาภาษาอังกฤษ' },
      { key: 'credits', labelTh: 'หน่วยกิต', required: true, example: '3', description: 'จำนวนหน่วยกิต' },
      { key: 'theory_hours', labelTh: 'ชั่วโมงทฤษฎี', required: true, example: '2', description: 'ชั่วโมงบรรยายต่อสัปดาห์' },
      { key: 'practice_hours', labelTh: 'ชั่วโมงปฏิบัติ', required: true, example: '2', description: 'ชั่วโมงปฏิบัติการต่อสัปดาห์' },
      { key: 'default_room_type_id', labelTh: 'ประเภทห้องที่ต้องการ', required: false, example: '2', description: '1=บรรยาย, 2=Lab' },
      { key: 'is_heavy', labelTh: 'วิชาคำนวณ/เนื้อหาหนัก (true/false)', required: false, example: 'true', description: 'true หรือ false' },
    ],
  },
  offerings: {
    title: 'แผนการเปิดสอน / คาบเรียน (Course Offerings)',
    columns: [
      { key: 'course_code', labelTh: 'รหัสวิชา', required: true, example: '30204-2001', description: 'รหัสวิชาที่เปิดสอน' },
      { key: 'student_group_code', labelTh: 'รหัสกลุ่มเรียน', required: true, example: 'BC67-1', description: 'รหัสกลุ่มนักศึกษาที่เรียน' },
      { key: 'teacher_id', labelTh: 'ID อาจารย์ผู้สอน', required: true, example: '1', description: 'ID อาจารย์ผู้สอน' },
      { key: 'room_type_id', labelTh: 'ประเภทห้อง', required: false, example: '2', description: '1=บรรยาย, 2=Lab' },
      { key: 'student_count', labelTh: 'จำนวนนักศึกษา', required: false, example: '30', description: 'จำนวนคนในวิชานี้' },
      { key: 'periods_per_session', labelTh: 'จำนวนคาบต่อครั้ง (คั่นด้วย comma)', required: true, example: '2,2', description: 'เช่น 2,2 (เรียน 2 คาบ 2 วัน) หรือ 4 (เรียนรวดเดียว 4 คาบ)' },
    ],
  },
};

/**
 * Generate CSV template with UTF-8 BOM for Microsoft Excel compatibility
 */
export function generateCsvTemplate(category: ImportCategory): string {
  const meta = IMPORT_TEMPLATES[category];
  const headerKeys = meta.columns.map((c) => c.key).join(',');
  const headerLabels = meta.columns.map((c) => `"${c.labelTh} (${c.key})"`).join(',');
  const exampleRow = meta.columns.map((c) => `"${c.example}"`).join(',');

  // UTF-8 BOM \uFEFF ensures Excel on Windows displays Thai characters correctly
  return `\uFEFF# ${meta.title} Template - บรรทัดที่มีเครื่องหมาย # จะถูกข้ามตอนนำเข้า\n${headerKeys}\n${exampleRow}\n`;
}

/**
 * Download a CSV file to client's browser
 */
export function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parse CSV text into array of object records
 */
export function parseCsvText(csvText: string): { headers: string[]; rows: Record<string, string>[] } {
  // Remove BOM if present
  let cleanText = csvText.replace(/^\uFEFF/, '').trim();
  const lines = cleanText.split(/\r?\n/).filter((l) => l.trim().length > 0 && !l.trim().startsWith('#'));

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  // Parse header line (detect comma, tab, or semicolon)
  const delimiter = lines[0].includes('\t') ? '\t' : lines[0].includes(';') ? ';' : ',';
  
  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const rawHeaders = parseLine(lines[0]);
  // Clean headers (e.g. "ชื่อ (name)" -> "name" or keep raw)
  const headers = rawHeaders.map((h) => {
    const match = h.match(/\(([^)]+)\)$/);
    return match ? match[1].trim() : h.trim().toLowerCase();
  });

  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    if (values.length === 0 || values.every((v) => v === '')) continue;
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || '';
    });
    rows.push(row);
  }

  return { headers, rows };
}
