import React from 'react';
import {
  Calendar,
  UserCheck,
  Play,
  Printer,
  CheckCircle,
  AlertTriangle,
  LogOut,
  Sliders,
  Shield,
} from 'lucide-react';
import { RoleType, Semester, AppSettings, User } from '../../types';

interface NavbarProps {
  currentRole: RoleType;
  onRoleChange: (role: RoleType) => void;
  activeSemester: Semester;
  semesters?: Semester[];
  onSelectSemester?: (semesterId: number) => void;
  onOpenGenerateModal: () => void;
  onQuickPrint: () => void;
  hardConflictCount: number;
  settings: AppSettings;
  currentUser?: User | null;
  onLogout?: () => void;
  onNavigateToSettings?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  activeSemester,
  semesters = [],
  onSelectSemester,
  onOpenGenerateModal,
  onQuickPrint,
  hardConflictCount,
  settings,
  currentUser,
  onLogout,
  onNavigateToSettings,
}) => {
  const [semesterDropdownOpen, setSemesterDropdownOpen] = React.useState(false);
  const roleNames: Record<RoleType, { label: string; badge: string }> = {
    super_admin: { label: 'Super Admin', badge: 'bg-purple-100 text-purple-800 border-purple-300' },
    academic_admin: { label: 'Academic Admin', badge: 'bg-blue-100 text-blue-800 border-blue-300' },
    department_admin: { label: 'Department Admin', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    teacher: { label: 'Teacher', badge: 'bg-amber-100 text-amber-800 border-amber-300' },
    student: { label: 'Student', badge: 'bg-slate-100 text-slate-800 border-slate-300' },
  };

  const userDisplayName = currentUser?.name || 'ผู้ดูแลระบบ';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="px-4 lg:px-6 h-16 flex items-center justify-between">
        {/* Left: Brand, Logo and Academic Period */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            {settings.system_logo_url ? (
              <img
                src={settings.system_logo_url}
                alt="System Logo"
                className="w-10 h-10 object-contain rounded-xl p-1 bg-white border border-slate-200 shadow-xs"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/30">
                <Calendar className="w-5 h-5" />
              </div>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 tracking-tight text-sm sm:text-base lg:text-lg truncate max-w-[240px] sm:max-w-none">
                  {settings.system_name_th || 'Automated Timetable Scheduling'}
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  15 คาบ
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden md:block">
                {settings.institution_name_th || 'มหาวิทยาลัยนครพนม'} • {settings.system_name_en}
              </p>
            </div>
          </div>

          {/* Academic Semester Selector Dropdown */}
          <div className="relative hidden xl:flex items-center space-x-2 pl-4 border-l border-slate-200 text-xs">
            <span className="font-medium text-slate-500">ภาคเรียน:</span>
            <button
              type="button"
              onClick={() => setSemesterDropdownOpen(!semesterDropdownOpen)}
              className="bg-slate-100 hover:bg-slate-200 font-bold px-2.5 py-1 rounded text-slate-800 border border-slate-300 flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <span>{activeSemester.name}</span>
              <span className="text-[10px] text-slate-500">▼</span>
            </button>

            {semesterDropdownOpen && (
              <div className="absolute top-8 left-16 mt-1 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in space-y-1">
                <div className="px-2.5 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  เลือกภาคการศึกษาที่จัดตาราง
                </div>
                {semesters.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      onSelectSemester?.(s.id);
                      setSemesterDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      s.id === activeSemester.id
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    <span>{s.name}</span>
                    {s.id === activeSemester.id && <span className="text-blue-600 font-bold">✓</span>}
                  </button>
                ))}
                <div className="pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setSemesterDropdownOpen(false);
                      onNavigateToSettings?.();
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-[11px] text-blue-600 hover:bg-blue-50 font-semibold"
                  >
                    ⚙️ จัดการปีการศึกษาและภาคเรียน...
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Controls: Conflict indicator, Actions, User Profile & Logout */}
        <div className="flex items-center space-x-3">
          {/* Conflict indicator */}
          {hardConflictCount === 0 ? (
            <div className="hidden sm:flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span>0 Hard Conflict</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-300 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>{hardConflictCount} Conflicts</span>
            </div>
          )}

          {/* Quick Print Button */}
          <button
            onClick={onQuickPrint}
            title="พิมพ์ตารางเรียนตารางสอน (Print PDF)"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Auto Generate Button (if allowed by role) */}
          {(currentRole === 'super_admin' || currentRole === 'academic_admin') && (
            <button
              onClick={onOpenGenerateModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-all active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">จัดตารางอัตโนมัติ</span>
            </button>
          )}

          {/* Settings quick shortcut (if super_admin or academic_admin) */}
          {(currentRole === 'super_admin' || currentRole === 'academic_admin') && onNavigateToSettings && (
            <button
              onClick={onNavigateToSettings}
              title="ตั้งค่าระบบ & โลโก้"
              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors hidden md:block"
            >
              <Sliders className="w-4 h-4" />
            </button>
          )}

          {/* Role Switcher dropdown */}
          <div className="relative flex items-center space-x-1 pl-2 border-l border-slate-200">
            <UserCheck className="w-4 h-4 text-slate-400 hidden sm:block" />
            <select
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value as RoleType)}
              className="text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg px-2 py-1.5 focus:outline-hidden cursor-pointer max-w-[130px] sm:max-w-none"
              title="ทดสอบสลับบทบาท (Role Switcher)"
            >
              <option value="super_admin">Super Admin</option>
              <option value="academic_admin">Academic Admin</option>
              <option value="department_admin">Dept Admin</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>
          </div>

          {/* Current User Info & Logout Button */}
          <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-xs font-bold text-slate-800 leading-tight max-w-[140px] truncate">
                {userDisplayName}
              </span>
              <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border ${roleNames[currentRole]?.badge}`}>
                {roleNames[currentRole]?.label}
              </span>
            </div>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                title="ออกจากระบบ เพื่อไปยังหน้าล็อกอินแยกตามสิทธิ์"
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">สลับสิทธิ์ / ล็อกอิน</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
