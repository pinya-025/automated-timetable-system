import React, { useState, useRef, useEffect } from 'react';
import {
  Home,
  Menu,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Printer,
  ChevronDown,
  User as UserIcon,
  LogOut,
  Sliders,
  Check,
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
  pageTitle?: string;
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
  pageTitle = 'ตารางสอนรายอาจารย์',
}) => {
  const [semesterDropdownOpen, setSemesterDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const semesterRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (semesterRef.current && !semesterRef.current.contains(e.target as Node)) {
        setSemesterDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userName = currentUser?.name || 'ศ.ดร.ประสิทธิ์ สุขสมบูรณ์';

  const roleBadgeText =
    currentRole === 'super_admin'
      ? 'Super Admin'
      : currentRole === 'academic_admin'
      ? 'Academic Admin'
      : currentRole === 'department_admin'
      ? 'Dept Admin'
      : currentRole === 'teacher'
      ? 'Teacher'
      : 'Student';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
      <div className="px-4 lg:px-6 h-16 flex items-center justify-between">
        {/* Left: Hamburger, Breadcrumbs, Semester Selector */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            type="button"
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="สลับแถบเมนู"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb Navigation */}
          <nav className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
            <Home className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>/</span>
            <span className="hover:text-slate-700 cursor-pointer hidden sm:inline">ระบบจัดตาราง</span>
            <span className="hidden sm:inline">/</span>
            <span className="text-blue-600 font-semibold">{pageTitle}</span>
          </nav>

          {/* Semester Selector Dropdown */}
          <div className="relative" ref={semesterRef}>
            <button
              type="button"
              onClick={() => setSemesterDropdownOpen(!semesterDropdownOpen)}
              className="ml-2 sm:ml-4 flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{activeSemester?.name || 'ภาคการศึกษา'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {semesterDropdownOpen && (
              <div className="absolute top-10 left-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in space-y-1">
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
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      s.id === activeSemester.id
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    <span>{s.name}</span>
                    {s.id === activeSemester.id && <Check className="w-3.5 h-3.5 text-blue-600 font-bold" />}
                  </button>
                ))}
                {onNavigateToSettings && (
                  <div className="pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setSemesterDropdownOpen(false);
                        onNavigateToSettings();
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-[11px] text-blue-600 hover:bg-blue-50 font-semibold cursor-pointer"
                    >
                      ⚙️ จัดการปีการศึกษาและภาคเรียน...
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Controls: AI Solver, Conflicts, Print, User Profile */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          {/* AI Auto-generate Button */}
          <button
            type="button"
            onClick={onOpenGenerateModal}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline">จัดตารางอัตโนมัติ (AI Solver)</span>
            <span className="md:hidden">AI Solver</span>
          </button>

          {/* Conflicts Status Button */}
          <div
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border shadow-2xs ${
              hardConflictCount === 0
                ? 'bg-white border-emerald-300 text-emerald-700'
                : 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
            }`}
          >
            {hardConflictCount === 0 ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            )}
            <span>{hardConflictCount} Conflicts</span>
          </div>

          {/* Quick Print Button */}
          <button
            type="button"
            onClick={onQuickPrint}
            title="พิมพ์ตารางด่วน (Quick Print)"
            className="p-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* User Profile & Role Dropdown */}
          <div className="relative" ref={userRef}>
            <button
              type="button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center space-x-2 p-1.5 pl-2 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 shadow-2xs transition-all cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                <UserIcon className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <span className="text-xs font-bold text-slate-800 hidden sm:inline max-w-[140px] truncate">
                {userName}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white shrink-0">
                {roleBadgeText}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 top-11 mt-1 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in space-y-2">
                <div className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-xs font-bold text-slate-800">{userName}</div>
                  <div className="text-[11px] text-slate-500">{currentUser?.email || 'admin@npu.ac.th'}</div>
                </div>

                {/* Role switcher inside dropdown */}
                <div className="px-2 py-1">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    สลับบทบาท (Role Switcher)
                  </div>
                  {(
                    [
                      'super_admin',
                      'academic_admin',
                      'department_admin',
                      'teacher',
                      'student',
                    ] as RoleType[]
                  ).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => {
                        onRoleChange(role);
                        setUserDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs flex items-center justify-between cursor-pointer ${
                        currentRole === role
                          ? 'bg-blue-50 text-blue-700 font-bold'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="capitalize">{role.replace('_', ' ')}</span>
                      {currentRole === role && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>

                <div className="pt-1 border-t border-slate-100 space-y-1">
                  {onNavigateToSettings && (
                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigateToSettings();
                      }}
                      className="w-full flex items-center space-x-2 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-md cursor-pointer"
                    >
                      <Sliders className="w-3.5 h-3.5 text-slate-500" />
                      <span>ตั้งค่าระบบ & โลโก้</span>
                    </button>
                  )}

                  {onLogout && (
                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center space-x-2 px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-md font-semibold cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      <span>ออกจากระบบ / สลับสิทธิ์</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
