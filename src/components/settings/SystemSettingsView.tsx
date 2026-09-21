import React, { useState } from 'react';
import {
  Sliders,
  Save,
  RotateCcw,
  Image,
  Upload,
  Building,
  School,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Calendar,
  Sparkles,
  Phone,
  Mail,
  ShieldAlert,
  Database,
  History as HistoryIcon,
} from 'lucide-react';
import {
  AppSettings,
  RoleType,
  Department,
  Teacher,
  Room,
  Course,
  StudentGroup,
  CourseOffering,
  ScheduleEntry,
  Timeslot,
  BlockedTimeslot,
  ScheduleChangeLog,
  AuditLog,
  AcademicYear,
  Semester,
} from '../../types';
import { initialSettings } from '../../data/seedData';
import { SupabaseConnectionCard } from './SupabaseConnectionCard';
import { TimeslotManagement } from '../crud/TimeslotManagement';
import { AuditLogView } from '../audit/AuditLogView';
import { AcademicYearManager } from './AcademicYearManager';

interface SystemSettingsViewProps {
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  currentRole: RoleType;
  departments?: Department[];
  teachers?: Teacher[];
  rooms?: Room[];
  courses?: Course[];
  studentGroups?: StudentGroup[];
  offerings?: CourseOffering[];
  entries?: ScheduleEntry[];
  timeslots?: Timeslot[];
  blockedTimeslots?: BlockedTimeslot[];
  onAddBlockedTimeslot?: (item: Omit<BlockedTimeslot, 'id'>) => void;
  onDeleteBlockedTimeslot?: (id: number) => void;
  changeLogs?: ScheduleChangeLog[];
  auditLogs?: AuditLog[];
  academicYears?: AcademicYear[];
  semesters?: Semester[];
  activeSemesterId?: number;
  onSelectSemester?: (semesterId: number) => void;
  onAddAcademicYear?: (yearTh: string, yearEn: string) => void;
  onAddSemester?: (
    academicYearId: number,
    term: number,
    name: string,
    startDate: string,
    endDate: string
  ) => void;
  onSetCurrentSemester?: (semesterId: number) => void;
  onDeleteSemester?: (semesterId: number) => void;
  onOpenImportModal?: (category?: any) => void;
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

export const SystemSettingsView: React.FC<SystemSettingsViewProps> = ({
  settings,
  onSaveSettings,
  currentRole,
  departments = [],
  teachers = [],
  rooms = [],
  courses = [],
  studentGroups = [],
  offerings = [],
  entries = [],
  timeslots = [],
  blockedTimeslots = [],
  onAddBlockedTimeslot,
  onDeleteBlockedTimeslot,
  changeLogs = [],
  auditLogs = [],
  academicYears = [],
  semesters = [],
  activeSemesterId = 1,
  onSelectSemester,
  onAddAcademicYear,
  onAddSemester,
  onSetCurrentSemester,
  onDeleteSemester,
  onOpenImportModal,
  onDataLoadedFromSupabase,
}) => {
  const [formData, setFormData] = useState<AppSettings>({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<
    'general' | 'academic_years' | 'data_import' | 'schedule' | 'timeslots' | 'signers' | 'database' | 'audit' | 'preview'
  >('general');

  const isSuperAdmin = currentRole === 'super_admin';

  // Preset logo options
  const presetLogos = [
    {
      id: 'default',
      name: 'ค่าเริ่มต้น (ปฏิทินทอง)',
      url: '',
      iconText: '🏛️',
    },
    {
      id: 'npu_seal',
      name: 'ตรามหาวิทยาลัยนครพนม (NPU Crest)',
      url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=120&auto=format&fit=crop&q=80',
      iconText: '🎓',
    },
    {
      id: 'tech_crest',
      name: 'ตราอาชีวศึกษา / เทคนิค',
      url: 'https://images.unsplash.com/photo-1562774053-701939374585?w=120&auto=format&fit=crop&q=80',
      iconText: '⚙️',
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('ขนาดไฟล์ต้องไม่เกิน 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData((prev) => ({
            ...prev,
            system_logo_url: event.target?.result as string,
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  const handleReset = () => {
    if (confirm('คุณต้องการรีเซ็ตการตั้งค่าระบบกลับเป็นค่าเริ่มต้นใช่หรือไม่?')) {
      setFormData({ ...initialSettings });
      onSaveSettings({ ...initialSettings });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-[#8B7D52]" />
            <span>การตั้งค่าระบบและอัตลักษณ์สถาบัน (System Settings & Branding)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            ปรับแต่งโลโก้, ชื่อระบบ, ชื่อสถาบันการศึกษา, คณะ/วิทยาลัย และข้อมูลผู้ลงนามในเอกสารทางการ
          </p>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {isSuperAdmin && (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center space-x-1.5 px-3 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>รีเซ็ตค่าเริ่มต้น</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center space-x-1.5 px-4 py-2 bg-[#8B7D52] hover:bg-[#756841] active:bg-[#635735] text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>บันทึกการตั้งค่า</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center space-x-2.5 shadow-xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">
            บันทึกการตั้งค่าระบบเรียบร้อยแล้ว การเปลี่ยนแปลงจะมีผลกับทุกหน้าจอและเอกสารพิมพ์ทันที!
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
            activeTab === 'general'
              ? 'border-[#8B7D52] text-[#8B7D52]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>อัตลักษณ์ & ชื่อระบบ (Branding)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('academic_years')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
            activeTab === 'academic_years'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span>ปีการศึกษา & ภาคเรียน (Academic Years)</span>
        </button>
        <button
          type="button"
          onClick={() => {
            if (onOpenImportModal) {
              onOpenImportModal();
            } else {
              setActiveTab('data_import');
            }
          }}
          className="px-4 py-2.5 text-xs font-bold border-b-2 border-transparent text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 transition-all flex items-center space-x-2 whitespace-nowrap cursor-pointer"
        >
          <Upload className="w-4 h-4 text-emerald-600" />
          <span>ศูนย์นำเข้าข้อมูล (Data Import)</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
            CSV / Excel
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('database')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
            activeTab === 'database'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="w-4 h-4 text-emerald-600" />
          <span>ฐานข้อมูล Supabase (Database)</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-100 text-emerald-800 font-semibold border border-emerald-300">
            Cloud
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('timeslots')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
            activeTab === 'timeslots'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4 text-blue-600" />
          <span>คาบเรียน & Blocked Times</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
            activeTab === 'schedule'
              ? 'border-[#8B7D52] text-[#8B7D52]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>เงื่อนไขเวลา & พักกลางวัน</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('signers')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
            activeTab === 'signers'
              ? 'border-[#8B7D52] text-[#8B7D52]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>ผู้ลงนามเอกสาร 15 คาบ (Signers)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
            activeTab === 'audit'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <HistoryIcon className="w-4 h-4 text-indigo-600" />
          <span>ประวัติระบบ & Logs (Audit)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
            activeTab === 'preview'
              ? 'border-[#8B7D52] text-[#8B7D52]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>ตัวอย่างแสดงผล (Live Preview)</span>
        </button>
      </div>

      {/* Tab 1: General & Branding */}
      {activeTab === 'general' && (
        <div className="bg-white rounded-b-xl border-x border-b border-slate-200 p-6 space-y-6">
          {/* Logo Setting Section */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-2">
              <Image className="w-4 h-4 text-[#8B7D52]" />
              <span>โลโก้ระบบ / ตราสัญลักษณ์สถาบัน (System Logo)</span>
            </h3>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Logo Preview Box */}
              <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 bg-white p-2 flex flex-col items-center justify-center shrink-0 shadow-xs relative group overflow-hidden">
                {formData.system_logo_url ? (
                  <img
                    src={formData.system_logo_url}
                    alt="Logo Preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center">
                    <span className="text-2xl">🏛️</span>
                    <span className="text-[10px] text-slate-400 block mt-1">โลโก้เริ่มต้น</span>
                  </div>
                )}
              </div>

              {/* Logo Controls */}
              <div className="flex-1 space-y-3 w-full">
                <div className="flex flex-wrap gap-2">
                  <label className="cursor-pointer inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>อัปโหลดรูปภาพใหม่ (PNG, JPG, SVG)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  {formData.system_logo_url && (
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, system_logo_url: '' }))}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-medium"
                    >
                      ใช้ค่าเริ่มต้น
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600">หรือระบุ URL รูปภาพโลโก้:</label>
                  <input
                    type="url"
                    placeholder="https://example.com/logo.png"
                    value={formData.system_logo_url || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, system_logo_url: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#8B7D52] focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* System & Institution Text Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">ชื่อระบบภาษาไทย (System Name TH)</label>
              <input
                type="text"
                required
                value={formData.system_name_th}
                onChange={(e) => setFormData((prev) => ({ ...prev, system_name_th: e.target.value }))}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#8B7D52] focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">ชื่อระบบภาษาอังกฤษ (System Name EN)</label>
              <input
                type="text"
                required
                value={formData.system_name_en}
                onChange={(e) => setFormData((prev) => ({ ...prev, system_name_en: e.target.value }))}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#8B7D52] focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">ชื่อสถาบันการศึกษา / มหาวิทยาลัย (TH)</label>
              <input
                type="text"
                required
                value={formData.institution_name_th}
                onChange={(e) => setFormData((prev) => ({ ...prev, institution_name_th: e.target.value }))}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#8B7D52] focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">ชื่อสถาบันการศึกษา / มหาวิทยาลัย (EN)</label>
              <input
                type="text"
                required
                value={formData.institution_name_en}
                onChange={(e) => setFormData((prev) => ({ ...prev, institution_name_en: e.target.value }))}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#8B7D52] focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">คณะ / วิทยาลัย (Faculty / College)</label>
              <input
                type="text"
                value={formData.faculty_name || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, faculty_name: e.target.value }))}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#8B7D52] focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">วิทยาเขต / แผนกวิชา (Campus)</label>
              <input
                type="text"
                value={formData.campus_name || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, campus_name: e.target.value }))}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#8B7D52] focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>อีเมลติดต่อฝ่ายวิชาการ (Contact Email)</span>
              </label>
              <input
                type="email"
                value={formData.contact_email || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, contact_email: e.target.value }))}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#8B7D52] focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>เบอร์โทรศัพท์ติดต่อ (Contact Phone)</span>
              </label>
              <input
                type="text"
                value={formData.contact_phone || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, contact_phone: e.target.value }))}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#8B7D52] focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Document Signers (ผู้ลงนามในเอกสารทางการ 15 คาบ) */}
      {activeTab === 'signers' && (
        <div className="bg-white rounded-b-xl border-x border-b border-slate-200 p-6 space-y-6">
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
            <strong>หมายเหตุ:</strong> ข้อมูลผู้ลงนามทั้ง 4 ตำแหน่งจะถูกนำไปแสดงที่ส่วนท้ายของแบบฟอร์มเอกสารตารางเรียนตารางสอนทางการ 15 คาบ เพื่อการพิมพ์หรือแปลงเป็น PDF ให้ถูกต้องตามระเบียบของสถาบัน
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Signer 1 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-[#8B7D52] text-white flex items-center justify-center text-xs font-bold">1</span>
                <h4 className="text-xs font-bold text-slate-800">ผู้ลงนามตำแหน่งที่ 1 (ผู้จัดทำ)</h4>
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="ชื่อตำแหน่ง เช่น (ผู้จัดทำตาราง)"
                  value={formData.document_signer_1_title || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, document_signer_1_title: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                />
                <input
                  type="text"
                  placeholder="ชื่อ-นามสกุล เช่น อ.อรัญญา วงศ์สุวรรณ"
                  value={formData.document_signer_1_name || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, document_signer_1_name: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-medium"
                />
              </div>
            </div>

            {/* Signer 2 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-[#8B7D52] text-white flex items-center justify-center text-xs font-bold">2</span>
                <h4 className="text-xs font-bold text-slate-800">ผู้ลงนามตำแหน่งที่ 2 (หัวหน้าแผนก/สาขาวิชา)</h4>
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="ชื่อตำแหน่ง เช่น (หัวหน้าสาขาวิชา)"
                  value={formData.document_signer_2_title || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, document_signer_2_title: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                />
                <input
                  type="text"
                  placeholder="ชื่อ-นามสกุล เช่น ดร.กิตติศักดิ์ ศรีวิชัย"
                  value={formData.document_signer_2_name || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, document_signer_2_name: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-medium"
                />
              </div>
            </div>

            {/* Signer 3 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-[#8B7D52] text-white flex items-center justify-center text-xs font-bold">3</span>
                <h4 className="text-xs font-bold text-slate-800">ผู้ลงนามตำแหน่งที่ 3 (หัวหน้างานหลักสูตร/ฝ่ายวิชาการ)</h4>
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="ชื่อตำแหน่ง เช่น (หัวหน้างานพัฒนาหลักสูตรฯ)"
                  value={formData.document_signer_3_title || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, document_signer_3_title: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                />
                <input
                  type="text"
                  placeholder="ชื่อ-นามสกุล เช่น ผศ.ดร.สมเกียรติ พัฒนกิจ"
                  value={formData.document_signer_3_name || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, document_signer_3_name: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-medium"
                />
              </div>
            </div>

            {/* Signer 4 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-[#8B7D52] text-white flex items-center justify-center text-xs font-bold">4</span>
                <h4 className="text-xs font-bold text-slate-800">ผู้ลงนามตำแหน่งที่ 4 (ผู้อำนวยการ/อธิการบดี)</h4>
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="ชื่อตำแหน่ง เช่น (รองผู้อำนวยการฝ่ายวิชาการ ปฏิบัติราชการแทนฯ)"
                  value={formData.document_signer_4_title || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, document_signer_4_title: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                />
                <input
                  type="text"
                  placeholder="ชื่อ-นามสกุล เช่น ศ.ดร.ประสิทธิ์ สุขสมบูรณ์"
                  value={formData.document_signer_4_name || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, document_signer_4_name: e.target.value }))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-medium"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-bold text-slate-700">ข้อความหมายเหตุใต้ตารางเอกสารทางการ (Official Note)</label>
            <input
              type="text"
              value={formData.official_note || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, official_note: e.target.value }))}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#8B7D52] focus:outline-hidden"
            />
          </div>
        </div>
      )}

      {/* Tab 3: Schedule Rules */}
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-b-xl border-x border-b border-slate-200 p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <label className="text-xs font-bold text-slate-700">เวลาเริ่มเรียน (Start Time)</label>
              <input
                type="time"
                value={formData.day_start_time}
                onChange={(e) => setFormData((prev) => ({ ...prev, day_start_time: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-mono"
              />
              <span className="text-[10px] text-slate-500 block">มาตรฐาน: 06:00 (คาบ 1)</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <label className="text-xs font-bold text-slate-700">เวลาสิ้นสุดการเรียน (End Time)</label>
              <input
                type="time"
                value={formData.day_end_time}
                onChange={(e) => setFormData((prev) => ({ ...prev, day_end_time: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-mono"
              />
              <span className="text-[10px] text-slate-500 block">มาตรฐาน: 21:00 (คาบ 15)</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <label className="text-xs font-bold text-slate-700">ระยะเวลาต่อคาบ (นาที)</label>
              <input
                type="number"
                min="30"
                max="120"
                value={formData.period_duration_minutes}
                onChange={(e) => setFormData((prev) => ({ ...prev, period_duration_minutes: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-mono"
              />
              <span className="text-[10px] text-slate-500 block">มาตรฐาน: 60 นาที / คาบ</span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 space-y-3">
            <h4 className="text-xs font-bold text-amber-900 flex items-center space-x-2">
              <span>🍱</span>
              <span>ช่วงเวลาพักรับประทานอาหารกลางวัน (Lunch Break)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-medium text-slate-700">เวลาเริ่มพักกลางวัน:</label>
                <input
                  type="time"
                  value={formData.lunch_start_time}
                  onChange={(e) => setFormData((prev) => ({ ...prev, lunch_start_time: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-700">เวลาสิ้นสุดพักกลางวัน:</label>
                <input
                  type="time"
                  value={formData.lunch_end_time}
                  onChange={(e) => setFormData((prev) => ({ ...prev, lunch_end_time: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-mono"
                />
              </div>
            </div>
            <p className="text-[11px] text-amber-800">
              *ตามข้อกำหนด คาบพักรับประทานอาหารกลางวันถูกล็อกให้อยู่ที่ <strong>คาบ 7 (12:00 - 13:00 น.)</strong> เท่านั้น โดยคาบ 5 (10:00 - 11:00 น.) พร้อมสำหรับการจัดสอนตามปกติ
            </p>
          </div>
        </div>
      )}

      {/* Tab 4: Live Preview */}
      {activeTab === 'preview' && (
        <div className="bg-white rounded-b-xl border-x border-b border-slate-200 p-6 space-y-6">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              ตัวอย่างการแสดงผลแถบหัวเรื่อง (Navbar Brand Preview)
            </h3>
            <div className="p-4 bg-white border border-slate-300 rounded-xl shadow-xs flex items-center space-x-3">
              {formData.system_logo_url ? (
                <img
                  src={formData.system_logo_url}
                  alt="Logo"
                  className="w-10 h-10 object-contain rounded-lg p-1 bg-white border border-slate-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-xs">
                  <Calendar className="w-5 h-5" />
                </div>
              )}
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900 text-base">
                    {formData.system_name_th || 'ระบบจัดตารางเรียนตารางสอนอัตโนมัติ'}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    OR-Tools
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {formData.institution_name_th || 'มหาวิทยาลัยนครพนม'} • {formData.system_name_en}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              ตัวอย่างหัวกระดาษเอกสารทางการ 15 คาบ (Official Document Header Preview)
            </h3>
            <div className="p-6 bg-slate-50 border border-slate-300 rounded-xl space-y-4">
              <div className="flex items-start justify-between border-b-2 border-slate-800 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-14 h-14 border border-slate-400 bg-white flex items-center justify-center rounded">
                    {formData.system_logo_url ? (
                      <img src={formData.system_logo_url} alt="Logo" className="w-12 h-12 object-contain" />
                    ) : (
                      <span className="text-2xl">🏛️</span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      {formData.institution_name_th}
                    </h2>
                    <p className="text-xs text-slate-600 font-medium">
                      {formData.faculty_name} {formData.campus_name ? `• ${formData.campus_name}` : ''}
                    </p>
                    <p className="text-xs text-slate-800 font-bold mt-0.5">
                      ตารางสอนประจำภาคการศึกษา 1/2569 (มาตรฐาน 15 คาบ)
                    </p>
                  </div>
                </div>
              </div>

              {/* Signer preview */}
              <div className="grid grid-cols-4 gap-2 pt-2 text-center text-[10px] text-slate-700">
                <div className="border-t border-slate-400 pt-1">
                  <div className="font-bold">{formData.document_signer_1_name}</div>
                  <div className="text-slate-500">{formData.document_signer_1_title}</div>
                </div>
                <div className="border-t border-slate-400 pt-1">
                  <div className="font-bold">{formData.document_signer_2_name}</div>
                  <div className="text-slate-500">{formData.document_signer_2_title}</div>
                </div>
                <div className="border-t border-slate-400 pt-1">
                  <div className="font-bold">{formData.document_signer_3_name}</div>
                  <div className="text-slate-500">{formData.document_signer_3_title}</div>
                </div>
                <div className="border-t border-slate-400 pt-1">
                  <div className="font-bold">{formData.document_signer_4_name}</div>
                  <div className="text-slate-500">{formData.document_signer_4_title}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Supabase Cloud Database */}
      {activeTab === 'database' && (
        <div className="bg-white rounded-b-xl border-x border-b border-slate-200 p-6 space-y-6">
          <SupabaseConnectionCard
            departments={departments}
            teachers={teachers}
            rooms={rooms}
            courses={courses}
            studentGroups={studentGroups}
            offerings={offerings}
            entries={entries}
            settings={settings}
            onDataLoadedFromSupabase={onDataLoadedFromSupabase}
          />
        </div>
      )}

      {/* Tab 6: Timeslots & Blocked Times */}
      {activeTab === 'timeslots' && (
        <div className="bg-white rounded-b-xl border-x border-b border-slate-200 p-6">
          <TimeslotManagement
            timeslots={timeslots}
            blockedTimeslots={blockedTimeslots}
            onAddBlockedTimeslot={onAddBlockedTimeslot || (() => {})}
            onDeleteBlockedTimeslot={onDeleteBlockedTimeslot || (() => {})}
          />
        </div>
      )}

      {/* Tab 7: Audit Logs & Change History */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-b-xl border-x border-b border-slate-200 p-6">
          <AuditLogView changeLogs={changeLogs} auditLogs={auditLogs} />
        </div>
      )}

      {/* Tab 8: Academic Years & Semesters */}
      {activeTab === 'academic_years' && (
        <div className="bg-white rounded-b-xl border-x border-b border-slate-200 p-6">
          <AcademicYearManager
            academicYears={academicYears}
            semesters={semesters}
            activeSemesterId={activeSemesterId}
            onSelectSemester={onSelectSemester || (() => {})}
            onAddAcademicYear={onAddAcademicYear || (() => {})}
            onAddSemester={onAddSemester || (() => {})}
            onSetCurrentSemester={onSetCurrentSemester || (() => {})}
            onDeleteSemester={onDeleteSemester}
          />
        </div>
      )}
    </div>
  );
};
