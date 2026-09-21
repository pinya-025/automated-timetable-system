import React, { useState } from 'react';
import {
  Upload,
  Download,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Database,
  Users,
  Building,
  BookOpen,
  Layers,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import {
  ImportCategory,
  IMPORT_TEMPLATES,
  generateCsvTemplate,
  downloadCsv,
  parseCsvText,
} from '../../services/importExportUtils';
import {
  Teacher,
  StudentGroup,
  Room,
  Course,
  CourseOffering,
} from '../../types';

interface DataImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: ImportCategory;
  onImportTeachers: (newTeachers: Omit<Teacher, 'id'>[], mode: 'append' | 'replace') => void;
  onImportGroups: (newGroups: Omit<StudentGroup, 'id'>[], mode: 'append' | 'replace') => void;
  onImportRooms: (newRooms: Omit<Room, 'id'>[], mode: 'append' | 'replace') => void;
  onImportCourses: (newCourses: Omit<Course, 'id'>[], mode: 'append' | 'replace') => void;
  onImportOfferings: (rawOfferings: any[], mode: 'append' | 'replace') => void;
}

export const DataImportModal: React.FC<DataImportModalProps> = ({
  isOpen,
  onClose,
  defaultCategory = 'teachers',
  onImportTeachers,
  onImportGroups,
  onImportRooms,
  onImportCourses,
  onImportOfferings,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ImportCategory>(defaultCategory);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [fileContent, setFileContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<Record<string, string>[]>([]);
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentTemplate = IMPORT_TEMPLATES[selectedCategory];

  const categoryIcons: Record<ImportCategory, React.ComponentType<{ className?: string }>> = {
    teachers: Users,
    studentGroups: Layers,
    rooms: Building,
    courses: BookOpen,
    offerings: Database,
  };

  const handleDownloadTemplate = () => {
    const csvContent = generateCsvTemplate(selectedCategory);
    downloadCsv(`template_${selectedCategory}.csv`, csvContent);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setValidationError(null);
    setImportSuccess(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setFileContent(text);
      processInputData(text);
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleTextPaste = (text: string) => {
    setFileContent(text);
    setFileName('pasted_data.txt');
    processInputData(text);
  };

  const processInputData = (text: string) => {
    try {
      // Check if JSON
      if (text.trim().startsWith('[') || text.trim().startsWith('{')) {
        const json = JSON.parse(text);
        const rows = Array.isArray(json) ? json : [json];
        if (rows.length === 0) {
          setValidationError('ไม่พบข้อมูลในไฟล์ JSON');
          return;
        }
        setParsedHeaders(Object.keys(rows[0]));
        setParsedRows(rows.map((r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, String(v)]))));
        return;
      }

      // Parse CSV / TSV
      const { headers, rows } = parseCsvText(text);
      if (rows.length === 0) {
        setValidationError('ไม่พบแถวข้อมูลในไฟล์ CSV (หรือรูปแบบคอลัมน์ไม่ตรง)');
        setParsedRows([]);
        return;
      }
      setParsedHeaders(headers);
      setParsedRows(rows);
    } catch (err: any) {
      setValidationError(`ข้อผิดพลาดในการอ่านไฟล์: ${err?.message || 'รูปแบบไม่ถูกต้อง'}`);
    }
  };

  const handleExecuteImport = () => {
    if (parsedRows.length === 0) {
      setValidationError('ไม่มีข้อมูลที่พร้อมนำเข้า');
      return;
    }

    try {
      switch (selectedCategory) {
        case 'teachers': {
          const newTeachers: Omit<Teacher, 'id'>[] = parsedRows.map((r) => ({
            prefix: r.prefix || 'อ.',
            name: r.name || 'ไม่ระบุชื่อ',
            email: r.email || '',
            phone: r.phone || '',
            department_id: Number(r.department_id) || 1,
            max_periods_per_week: Number(r.max_periods_per_week) || 18,
            max_periods_per_day: 6,
            max_consecutive_periods: 3,
            color_code: r.color_code || '#3B82F6',
          }));
          onImportTeachers(newTeachers, importMode);
          break;
        }
        case 'studentGroups': {
          const newGroups: Omit<StudentGroup, 'id'>[] = parsedRows.map((r) => ({
            program_id: 1,
            department_id: Number(r.department_id) || 1,
            code: r.code || 'GRP',
            name: r.name || r.code || 'กลุ่มเรียนใหม่',
            year_level: Number(r.year_level) || 1,
            student_count: Number(r.student_count) || 30,
          }));
          onImportGroups(newGroups, importMode);
          break;
        }
        case 'rooms': {
          const newRooms: Omit<Room, 'id'>[] = parsedRows.map((r) => ({
            room_number: r.room_number || 'ROOM',
            building: r.building || 'อาคารเรียนหลัก',
            floor: Number(r.floor) || 1,
            room_type_id: Number(r.room_type_id) || 1,
            capacity: Number(r.capacity) || 40,
            is_active: true,
          }));
          onImportRooms(newRooms, importMode);
          break;
        }
        case 'courses': {
          const newCourses: Omit<Course, 'id'>[] = parsedRows.map((r) => ({
            department_id: 1,
            code: r.code || 'CRS',
            name_th: r.name_th || 'วิชาใหม่',
            name_en: r.name_en || '',
            credits: Number(r.credits) || 3,
            theory_hours: Number(r.theory_hours) || 2,
            practice_hours: Number(r.practice_hours) || 2,
            default_room_type_id: Number(r.default_room_type_id) || 1,
            is_heavy: r.is_heavy === 'true' || r.is_heavy === '1',
          }));
          onImportCourses(newCourses, importMode);
          break;
        }
        case 'offerings': {
          onImportOfferings(parsedRows, importMode);
          break;
        }
      }

      setImportSuccess(`นำเข้าข้อมูล ${currentTemplate.title} จำนวน ${parsedRows.length} รายการ เรียบร้อยแล้ว!`);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setValidationError(`ไม่สามารถนำเข้าข้อมูลได้: ${err?.message || 'ตรวจสอบรูปแบบข้อมูล'}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/20">
              <Upload className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h3 className="font-bold text-base">ศูนย์นำเข้าข้อมูลอัตโนมัติ (Bulk Data Import Center)</h3>
              <p className="text-xs text-blue-200">นำเข้าข้อมูล อาจารย์, กลุ่มเรียน/ชั้นปี, ห้องเรียน, รายวิชา, แผนการสอน (CSV / Excel / JSON)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 overflow-x-auto gap-2">
          {(Object.keys(IMPORT_TEMPLATES) as ImportCategory[]).map((cat) => {
            const Icon = categoryIcons[cat];
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setParsedRows([]);
                  setParsedHeaders([]);
                  setFileContent('');
                  setFileName('');
                  setValidationError(null);
                  setImportSuccess(null);
                }}
                className={`flex items-center space-x-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 whitespace-nowrap ${
                  isSelected
                    ? 'border-blue-600 text-blue-700 bg-white shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{IMPORT_TEMPLATES[cat].title}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Step 1: Template Download & Guidance */}
          <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="font-bold text-sm text-blue-950 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-700" />
                <span>ดาวน์โหลดไฟล์ตัวอย่างสำหรับ {currentTemplate.title}</span>
              </p>
              <p className="text-xs text-blue-700 mt-1">
                เปิดแก้ไขใน Excel แล้วบันทึกเป็น CSV (UTF-8) หรือคัดลอกข้อมูลมาวางในช่องด้านล่าง
              </p>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center space-x-1.5 shadow-xs transition-colors shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลด Template (.csv)</span>
            </button>
          </div>

          {/* Step 2: Upload File or Paste */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* File Upload Box */}
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 hover:border-blue-500 transition-colors bg-slate-50/60 flex flex-col items-center justify-center text-center">
              <Upload className="w-8 h-8 text-blue-600 mb-2" />
              <p className="font-semibold text-slate-800">เลือกไฟล์ CSV หรือ JSON จากเครื่อง</p>
              <p className="text-[11px] text-slate-500 mt-0.5">รองรับไฟล์ .csv, .txt, .json</p>
              <label className="mt-3 px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer font-bold shadow-xs transition-colors">
                <span>เลือกไฟล์จากเครื่อง</span>
                <input
                  type="file"
                  accept=".csv,.txt,.json"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {fileName && (
                <span className="mt-2 text-[11px] text-emerald-600 font-semibold truncate max-w-xs">
                  ✓ {fileName}
                </span>
              )}
            </div>

            {/* Direct Paste Box */}
            <div className="flex flex-col space-y-1.5">
              <label className="font-semibold text-slate-700 flex items-center justify-between">
                <span>หรือวางข้อมูล (Copy & Paste Text)</span>
                <span className="text-[11px] text-slate-400 font-normal">คัดลอกตารางจาก Excel มาวางได้เลย</span>
              </label>
              <textarea
                value={fileContent}
                onChange={(e) => handleTextPaste(e.target.value)}
                placeholder={`วางข้อมูลหัวคอลัมน์และแถวข้อมูล เช่น:\n${currentTemplate.columns.map((c) => c.key).join(',')}\n...`}
                className="w-full flex-1 p-2.5 rounded-xl border border-slate-300 font-mono text-[11px] focus:ring-2 focus:ring-blue-500 focus:outline-hidden min-h-[110px]"
              />
            </div>
          </div>

          {/* Import Mode Options */}
          <div className="flex items-center space-x-6 p-3 rounded-lg bg-slate-100/70 border border-slate-200">
            <span className="font-bold text-slate-700">รูปแบบการนำเข้า:</span>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="importMode"
                value="append"
                checked={importMode === 'append'}
                onChange={() => setImportMode('append')}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="font-medium text-slate-700">เพิ่มต่อท้ายข้อมูลเดิม (Append)</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="importMode"
                value="replace"
                checked={importMode === 'replace'}
                onChange={() => setImportMode('replace')}
                className="text-rose-600 focus:ring-rose-500"
              />
              <span className="font-medium text-rose-700">แทนที่ข้อมูลเดิมทั้งหมด (Replace All)</span>
            </label>
          </div>

          {/* Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-white">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>ตัวอย่างข้อมูลที่ตรวจพบ ({parsedRows.length} รายการ)</span>
                </span>
                <span className="text-slate-500 text-[11px]">แสดง 5 รายการแรก</span>
              </div>
              <div className="overflow-x-auto max-h-48 border border-slate-200 rounded-lg">
                <table className="w-full text-left text-[11px] divide-y divide-slate-200">
                  <thead className="bg-slate-100 font-semibold text-slate-700">
                    <tr>
                      <th className="p-2 w-8">#</th>
                      {parsedHeaders.map((h) => (
                        <th key={h} className="p-2 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600 font-mono">
                    {parsedRows.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2 font-bold text-slate-400">{idx + 1}</td>
                        {parsedHeaders.map((h) => (
                          <td key={h} className="p-2 whitespace-nowrap truncate max-w-[160px]">
                            {row[h] || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Notifications */}
          {validationError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {importSuccess && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{importSuccess}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg font-bold text-xs transition-colors"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleExecuteImport}
            disabled={parsedRows.length === 0}
            className={`px-5 py-2.5 rounded-lg font-bold text-xs flex items-center space-x-2 shadow-xs transition-all ${
              parsedRows.length > 0
                ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>ยืนยันนำเข้าข้อมูล ({parsedRows.length} รายการ)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
