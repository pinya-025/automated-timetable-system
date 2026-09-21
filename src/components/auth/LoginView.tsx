import React, { useState } from 'react';
import {
  ShieldCheck,
  Calendar,
  School,
  GraduationCap,
  Users,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
  UserCheck,
  Building,
  BookOpen,
  ChevronRight,
  Clock,
  Printer,
  Shield,
  Zap,
} from 'lucide-react';
import { User, RoleType, AppSettings, Teacher, StudentGroup } from '../../types';

interface LoginViewProps {
  users: User[];
  settings: AppSettings;
  teachers?: Teacher[];
  studentGroups?: StudentGroup[];
  onLogin: (user: User) => void;
  onBypassAsAdmin?: () => void;
}

interface RoleConfig {
  role: RoleType;
  titleTh: string;
  titleEn: string;
  shortDesc: string;
  badgeClass: string;
  activeTabClass: string;
  accentBg: string;
  accentBorder: string;
  accentText: string;
  gradient: string;
  icon: React.ElementType;
  accessLevel: string;
  scopeList: string[];
  securityNote: string;
  recommendedFor: string;
}

export const LoginView: React.FC<LoginViewProps> = ({
  users,
  settings,
  teachers = [],
  studentGroups = [],
  onLogin,
  onBypassAsAdmin,
}) => {
  // Active selected role portal tab
  const [selectedRole, setSelectedRole] = useState<RoleType>('super_admin');
  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('password123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [selectedStudentGroupId, setSelectedStudentGroupId] = useState<number>(studentGroups[0]?.id || 1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Configuration for each of the 5 distinct roles
  const roleConfigs: Record<RoleType, RoleConfig> = {
    super_admin: {
      role: 'super_admin',
      titleTh: 'ผู้ดูแลระบบสูงสุด',
      titleEn: 'Super Administrator',
      shortDesc: 'บริหารจัดการระบบทั้งหมด สิทธิ์ผู้ใช้งาน การตั้งค่าสถาบัน และฐานข้อมูล Supabase Cloud',
      badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
      activeTabClass: 'border-purple-500 bg-purple-500/10 text-purple-300',
      accentBg: 'bg-purple-600',
      accentBorder: 'border-purple-500/40',
      accentText: 'text-purple-400',
      gradient: 'from-purple-900/60 via-slate-900 to-indigo-950/70',
      icon: ShieldCheck,
      accessLevel: 'ระดับสูงสุด (Level 5 - Full Control)',
      scopeList: [
        'จัดการบัญชีผู้ใช้งานระบบ & กำหนดบทบาทสิทธิ์ (RBAC)',
        'เชื่อมต่อ ตั้งค่า และซิงค์ฐานข้อมูล Supabase Cloud (PostgreSQL)',
        'ตั้งค่าข้อมูลสถาบัน โลโก้ และรายนามผู้ลงนามตารางทางการ มรพ.',
        'เข้าถึงทุกเมนู ทุกข้อมูล และประวัติระบบ (Audit Logs)',
      ],
      securityNote: 'ต้องการสิทธิ์ระดับผู้บริหารหรือผู้ดูแลระบบคอมพิวเตอร์ประจำสถาบัน',
      recommendedFor: 'ผู้บริหารระบบ, หัวหน้าศูนย์คอมพิวเตอร์, ผู้ดูแลระบบ IT',
    },
    academic_admin: {
      role: 'academic_admin',
      titleTh: 'ฝ่ายวิชาการและงานหลักสูตร',
      titleEn: 'Academic Affairs Admin',
      shortDesc: 'จัดทำตารางเรียนตารางสอนอัตโนมัติด้วย AI Solver จัดการคาบเรียน แก้ข้อขัดแย้ง และพิมพ์ตาราง มรพ.',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
      activeTabClass: 'border-blue-500 bg-blue-500/10 text-blue-300',
      accentBg: 'bg-blue-600',
      accentBorder: 'border-blue-500/40',
      accentText: 'text-blue-400',
      gradient: 'from-blue-900/60 via-slate-900 to-slate-950',
      icon: Calendar,
      accessLevel: 'ระดับวิชาการ (Level 4 - Scheduling Engine)',
      scopeList: [
        'ประมวลผลจัดตารางสอนอัตโนมัติ (AI Constraint Solver)',
        'จัดการตารางเรียน ลาก-วาง (Drag & Drop) และสลับคาบเรียน 15 คาบ',
        'ตรวจสอบและแก้ไขข้อขัดแย้งเวลาชน (Real-time Conflict Resolution)',
        'ส่งออกและพิมพ์ตารางสอนทางการ 15 คาบ มาตรฐาน มรพ.',
      ],
      securityNote: 'มีสิทธิ์จัดการตารางสอนและแผนเปิดสอนทั้งหมดของทุกสาขาวิชา',
      recommendedFor: 'เจ้าหน้าที่งานหลักสูตรและตารางสอน, รองผู้อำนวยการฝ่ายวิชาการ',
    },
    department_admin: {
      role: 'department_admin',
      titleTh: 'หัวหน้าแผนก / สาขาวิชา',
      titleEn: 'Department Head Admin',
      shortDesc: 'บริหารรายวิชาเปิดสอนประจำแผนก ตรวจสอบภาระงานสอนอาจารย์ในสังกัด และห้องเรียนสาขา',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      activeTabClass: 'border-emerald-500 bg-emerald-500/10 text-emerald-300',
      accentBg: 'bg-emerald-600',
      accentBorder: 'border-emerald-500/40',
      accentText: 'text-emerald-400',
      gradient: 'from-emerald-900/60 via-slate-900 to-slate-950',
      icon: School,
      accessLevel: 'ระดับสาขาวิชา (Level 3 - Department Scoped)',
      scopeList: [
        'จัดการและเสนอแผนรายวิชาเปิดสอนประจำภาคเรียน (Course Offerings)',
        'ตรวจสอบภาระงานสอนรายสัปดาห์ของอาจารย์ในสาขาวิชา',
        'ตรวจสอบตารางการใช้งานห้องปฏิบัติการคอมพิวเตอร์ประจำสาขา',
        'เข้าดูตารางเรียนและรายชื่อกลุ่มนักศึกษาในสาขาวิชา',
      ],
      securityNote: 'สามารถจัดการข้อมูลเฉพาะหลักสูตรและรายวิชาของแผนกตนเองได้',
      recommendedFor: 'หัวหน้าสาขาวิชา, หัวหน้าแผนกวิชา, กรรมการบริหารหลักสูตร',
    },
    teacher: {
      role: 'teacher',
      titleTh: 'อาจารย์ผู้สอน',
      titleEn: 'Teacher / Faculty Portal',
      shortDesc: 'เข้าดูตารางสอนส่วนบุคคล ระบุเวลาสะดวก/ไม่สะดวกสอน และพิมพ์ตารางสอน A4 แนวตั้ง/แนวนอน',
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
      activeTabClass: 'border-amber-500 bg-amber-500/10 text-amber-300',
      accentBg: 'bg-[#8B7D52]',
      accentBorder: 'border-amber-500/40',
      accentText: 'text-amber-400',
      gradient: 'from-amber-950/60 via-slate-900 to-slate-950',
      icon: GraduationCap,
      accessLevel: 'ระดับอาจารย์ (Level 2 - Instructor Access)',
      scopeList: [
        'เข้าดูตารางสอนส่วนบุคคลแบบ Real-time ตลอด 15 คาบ',
        'ระบุช่วงเวลาสะดวกสอนและเวลาที่ไม่สะดวกสอน (Availability & Preferences)',
        'พิมพ์ตารางสอนส่วนบุคคลแบบฟอร์ม มรพ. หรือ A4 พกพาสะดวก',
        'ตรวจสอบกลุ่มนักศึกษา ห้องเรียน อาคาร และจำนวนคาบสอนต่อสัปดาห์',
      ],
      securityNote: 'สิทธิ์เข้าถึงตารางสอนของตนเองและดูภาพรวมตารางของสถานศึกษา',
      recommendedFor: 'คณาจารย์ผู้สอนทุกท่าน, อาจารย์พิเศษ, ผู้ช่วยสอน',
    },
    student: {
      role: 'student',
      titleTh: 'นักศึกษา / ผู้เข้าชมทั่วไป',
      titleEn: 'Student & Public Portal',
      shortDesc: 'ค้นหาและดูตารางเรียนประจำกลุ่มชั้นปี ตรวจสอบห้องเรียน อาคาร และดาวน์โหลดเอกสาร PDF',
      badgeClass: 'bg-sky-100 text-sky-800 border-sky-300',
      activeTabClass: 'border-sky-500 bg-sky-500/10 text-sky-300',
      accentBg: 'bg-sky-600',
      accentBorder: 'border-sky-500/40',
      accentText: 'text-sky-400',
      gradient: 'from-sky-950/60 via-slate-900 to-slate-950',
      icon: Users,
      accessLevel: 'ระดับนักศึกษา (Level 1 - Read-Only Viewer)',
      scopeList: [
        'ค้นหาและดูตารางเรียนประจำกลุ่มชั้นเรียน (เช่น ทต.ช.1, คธ.ส.1, BC66-1)',
        'ค้นหาห้องเรียน อาคาร และรายชื่ออาจารย์ผู้สอนประจำแต่ละวิชา',
        'ดาวน์โหลดหรือสั่งพิมพ์ตารางเรียนประจำกลุ่มเป็นไฟล์ PDF',
        'เข้าชมได้สะดวกรวดเร็วโดยไม่ต้องใช้รหัสผ่าน (Guest Mode)',
      ],
      securityNote: 'สิทธิ์เข้าดูตารางเรียนอย่างเดียว (Read-Only) ไม่สามารถแก้ไขตารางได้',
      recommendedFor: 'นักศึกษาทุกระดับชั้น, ตัวแทนห้องเรียน, ผู้ปกครอง, ผู้สนใจทั่วไป',
    },
  };

  const currentConfig = roleConfigs[selectedRole];
  const roleUsers = users.filter((u) => u.role === selectedRole && u.is_active);

  // Switch role portal
  const handleSelectRoleTab = (role: RoleType) => {
    setSelectedRole(role);
    setErrorMsg(null);
    setEmailInput('');
  };

  // Direct login with a specific user object
  const executeLogin = (user: User) => {
    setIsLoading(true);
    setErrorMsg(null);
    setTimeout(() => {
      onLogin(user);
    }, 200);
  };

  // Credential form submit
  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const emailToSearch = emailInput.trim().toLowerCase();
    if (!emailToSearch) {
      setErrorMsg('กรุณาระบุอีเมลผู้ใช้งาน');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const user = users.find((u) => u.email.toLowerCase() === emailToSearch);

      if (!user) {
        setErrorMsg(`ไม่พบบัญชี "${emailInput}" ในระบบ กรุณาตรวจสอบอีเมลหรือเลือกจากบัญชีตัวอย่างด้านบน`);
        setIsLoading(false);
        return;
      }

      if (!user.is_active) {
        setErrorMsg('บัญชีผู้ใช้งานนี้ถูกระงับการใช้งานชั่วคราว');
        setIsLoading(false);
        return;
      }

      // Check role match
      if (user.role !== selectedRole) {
        setErrorMsg(`บัญชีนี้อยู่ในสิทธิ์ "${roleConfigs[user.role]?.titleTh || user.role}" กรุณาสลับไปที่แท็บสิทธิ์ดังกล่าว`);
        setIsLoading(false);
        return;
      }

      // Validate password (default demo password is password123 or 123456)
      const validPassword = user.password || 'password123';
      if (passwordInput !== validPassword && passwordInput !== '123456' && passwordInput !== 'admin123') {
        setErrorMsg('รหัสผ่านไม่ถูกต้อง (รหัสผ่านทดสอบ: password123)');
        setIsLoading(false);
        return;
      }

      executeLogin(user);
    }, 250);
  };

  // Student Guest Quick Access
  const handleStudentGuestAccess = () => {
    setIsLoading(true);
    setErrorMsg(null);
    setTimeout(() => {
      // Find existing student user or create a temporary session user
      const existingStudent = users.find((u) => u.role === 'student' && u.is_active);
      const targetGroup = studentGroups.find((g) => g.id === selectedStudentGroupId);
      
      const guestStudentUser: User = existingStudent
        ? {
            ...existingStudent,
            student_group_id: selectedStudentGroupId,
            name: targetGroup ? `นักศึกษา (${targetGroup.name})` : existingStudent.name,
          }
        : {
            id: 9999,
            name: targetGroup ? `นักศึกษา (${targetGroup.name})` : 'นักศึกษาผู้เข้าชมทั่วไป',
            email: 'student.guest@college.ac.th',
            role: 'student',
            student_group_id: selectedStudentGroupId,
            is_active: true,
            created_at: new Date().toISOString(),
          };

      onLogin(guestStudentUser);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-100 selection:bg-[#8B7D52] selection:text-white">
      {/* Top Navigation Bar */}
      <header className="px-6 py-4 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-3">
          {settings.system_logo_url ? (
            <img
              src={settings.system_logo_url}
              alt="Logo"
              className="w-10 h-10 object-contain rounded-xl p-1 bg-white shadow-md"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8B7D52] to-amber-600 flex items-center justify-center text-white shadow-md">
              <Calendar className="w-5 h-5" />
            </div>
          )}
          <div>
            <h1 className="font-bold text-white text-sm sm:text-base leading-tight">
              {settings.system_name_th || 'ระบบจัดตารางเรียนตารางสอนอัตโนมัติ'}
            </h1>
            <p className="text-[11px] text-slate-400">
              {settings.institution_name_th || 'มหาวิทยาลัยนครพนม'} • มาตรฐาน 15 คาบเรียน
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-2 text-xs bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-full text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>เข้าสู่ระบบแยกตามสิทธิ์ (Role-Based Portal)</span>
          </div>

          {onBypassAsAdmin && (
            <button
              type="button"
              onClick={onBypassAsAdmin}
              title="เข้าสู่ระบบทันทีด้วยสิทธิ์ผู้ดูแลสูงสุด"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#8B7D52] hover:bg-[#7a6d45] text-white text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">เข้าใช้งานทันที (Super Admin)</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 flex flex-col items-center justify-center">
        {/* Intro Header */}
        <div className="text-center max-w-2xl mb-6 space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>เลือกพอร์ทัลตามบทบาทและความรับผิดชอบของคุณ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            เข้าสู่ระบบตามสิทธิ์การใช้งาน
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            ระบบแบ่งแยกสิทธิ์ชัดเจน 5 ระดับ เพื่อความปลอดภัยและความสะดวกในการบริหารจัดการตารางเรียนตารางสอน
          </p>
        </div>

        {/* 5 Distinct Role Tabs */}
        <div className="w-full mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 p-2 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl">
            {(Object.keys(roleConfigs) as RoleType[]).map((roleKey) => {
              const cfg = roleConfigs[roleKey];
              const Icon = cfg.icon;
              const isSelected = selectedRole === roleKey;
              const count = users.filter((u) => u.role === roleKey && u.is_active).length;

              return (
                <button
                  key={roleKey}
                  type="button"
                  onClick={() => handleSelectRoleTab(roleKey)}
                  className={`relative flex flex-col items-center sm:items-start p-3 sm:p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? `${cfg.activeTabClass} shadow-lg ring-1 ring-white/20`
                      : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div
                      className={`p-2 rounded-lg transition-colors ${
                        isSelected ? `${cfg.accentBg} text-white` : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${
                        isSelected ? cfg.badgeClass : 'border-slate-700 bg-slate-800 text-slate-400'
                      }`}
                    >
                      {count} บัญชี
                    </span>
                  </div>

                  <span className="font-bold text-xs sm:text-sm text-white leading-tight truncate w-full">
                    {cfg.titleTh}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate w-full mt-0.5">
                    {cfg.titleEn}
                  </span>

                  {isSelected && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-t-full bg-white" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Portal Panel (2 Columns Layout) */}
        <div className="w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-950/80 border border-rose-600/70 text-rose-200 text-xs flex items-center space-x-3 shadow-lg animate-shake">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <div className="flex-1">
                <span className="font-bold block">แจ้งเตือนข้อผิดพลาด:</span>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Role Details & Permissions Scope (5 cols) */}
            <div className="lg:col-span-5 space-y-6 lg:border-r lg:border-slate-800/80 lg:pr-8">
              {/* Role Header Badge */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-2xl ${currentConfig.accentBg} text-white shadow-lg`}>
                    <currentConfig.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${currentConfig.badgeClass}`}>
                      {currentConfig.accessLevel}
                    </span>
                    <h3 className="text-xl font-extrabold text-white mt-1">
                      {currentConfig.titleTh}
                    </h3>
                    <p className="text-xs text-slate-400">{currentConfig.titleEn}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/40 p-3.5 rounded-xl border border-slate-800">
                  {currentConfig.shortDesc}
                </p>
              </div>

              {/* Scoped Permissions Checklist */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-300 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>สิทธิ์การใช้งานที่ได้รับอนุญาตในบทบาทนี้:</span>
                </h4>
                <div className="space-y-2">
                  {currentConfig.scopeList.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start space-x-2.5 text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security & Target Audience Info */}
              <div className="p-3.5 rounded-xl bg-slate-800/30 border border-slate-800 space-y-1.5 text-[11px]">
                <div className="flex items-center space-x-1.5 text-amber-300 font-semibold">
                  <Shield className="w-3.5 h-3.5 shrink-0" />
                  <span>ข้อกำหนดความปลอดภัย:</span>
                </div>
                <p className="text-slate-400">{currentConfig.securityNote}</p>
              </div>
            </div>

            {/* Right Column: Portal Login Methods (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Option A: Quick One-Click Role Accounts */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center space-x-2">
                    <UserCheck className={`w-4 h-4 ${currentConfig.accentText}`} />
                    <span>เข้าสู่ระบบด่วนด้วยบัญชีตัวอย่าง ({roleUsers.length} บัญชี):</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 hidden sm:inline">
                    คลิกเพื่อเข้าใช้งานทันที
                  </span>
                </div>

                {roleUsers.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {roleUsers.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        disabled={isLoading}
                        onClick={() => executeLogin(u)}
                        className="group flex flex-col justify-between p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-500 text-left transition-all cursor-pointer shadow-xs active:scale-98"
                      >
                        <div className="flex items-center justify-between mb-1.5 w-full">
                          <span className="font-bold text-xs text-white group-hover:text-amber-300 transition-colors truncate">
                            {u.name}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 group-hover:text-white transition-all shrink-0 ml-1" />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 w-full">
                          <span className="truncate">{u.email}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 text-slate-300 shrink-0 ml-1">
                            คลิกเข้าใช้
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-800/30 border border-dashed border-slate-700 text-center text-xs text-slate-400">
                    ยังไม่มีบัญชีตัวอย่างสำหรับบทบาทนี้ในระบบ คุณสามารถกรอกอีเมลด้านล่างเพื่อเข้าสู่ระบบได้
                  </div>
                )}
              </div>

              {/* Special Feature for Student: Guest Mode Without Password */}
              {selectedRole === 'student' && (
                <div className="p-4 rounded-2xl bg-sky-950/40 border border-sky-600/40 space-y-3">
                  <div className="flex items-center space-x-2 text-sky-300 font-bold text-xs">
                    <BookOpen className="w-4 h-4 text-sky-400" />
                    <span>เข้าดูตารางเรียนด่วน (Guest Mode - ไม่ต้องใช้รหัสผ่าน):</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    เลือกกลุ่มชั้นเรียนที่คุณต้องการดูตารางเรียน แล้วกดเข้าสู่ระบบได้ทันที:
                  </p>
                  <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                    <select
                      value={selectedStudentGroupId}
                      onChange={(e) => setSelectedStudentGroupId(Number(e.target.value))}
                      className="w-full sm:flex-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                    >
                      {studentGroups.map((g) => (
                        <option key={g.id} value={g.id}>
                          กลุ่ม {g.code} ({g.name}) - {g.student_count || 0} คน
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={handleStudentGuestAccess}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-1.5 shrink-0"
                    >
                      <span>เข้าดูตารางกลุ่มนี้</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-slate-900 px-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider shrink-0">
                  หรือลงชื่อเข้าใช้ด้วยอีเมลประจำสิทธิ์
                </span>
              </div>

              {/* Option B: Standard Email & Password Form for this role */}
              <form onSubmit={handleFormLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>อีเมลผู้ใช้งาน ({currentConfig.titleTh})</span>
                    <span className="text-[10px] text-slate-400">ต้องตรงกับสิทธิ์ที่เลือก</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      placeholder={`เช่น ${roleUsers[0]?.email || 'user@college.ac.th'}`}
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full bg-slate-950/70 border border-slate-700/80 text-white rounded-xl pl-10 pr-3 py-2.5 text-xs focus:ring-2 focus:ring-[#8B7D52] focus:border-transparent focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">รหัสผ่าน (Password)</label>
                    <span className="text-[10px] text-amber-300/80">รหัสเริ่มต้น: password123</span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="รหัสผ่าน"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full bg-slate-950/70 border border-slate-700/80 text-white rounded-xl pl-10 pr-10 py-2.5 text-xs focus:ring-2 focus:ring-[#8B7D52] focus:border-transparent focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer ${currentConfig.accentBg} hover:opacity-90 active:scale-98`}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>เข้าสู่ระบบพอร์ทัล {currentConfig.titleTh}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-slate-800/80 text-center text-xs text-slate-500">
        <p>
          {settings.institution_name_th || 'มหาวิทยาลัยนครพนม'} • {settings.system_name_th} • รองรับมาตรฐาน 15 คาบเรียน มรพ.
        </p>
      </footer>
    </div>
  );
};
