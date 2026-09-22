import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Database,
  Users,
  Cloud,
  RotateCcw,
  GraduationCap,
} from 'lucide-react';
import { RoleType, AppSettings, User } from '../../types';

export type ActiveTab =
  | 'dashboard'
  | 'timetable'
  | 'conflicts'
  | 'master_data'
  | 'reports'
  | 'users'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentRole: RoleType;
  conflictCount: number;
  settings?: AppSettings;
  currentUser?: User | null;
  onLogout?: () => void;
  onResetData?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentRole,
  conflictCount,
  settings,
  currentUser,
  onResetData,
}) => {
  const menuSections = [
    {
      title: 'ระบบจัดตารางเรียนตารางสอน',
      items: [
        {
          id: 'dashboard',
          label: 'แดชบอร์ดภาพรวม',
          icon: LayoutDashboard,
          allowed: true,
        },
        {
          id: 'timetable',
          label: 'ตารางเรียน / สอน',
          icon: Calendar,
          allowed: true,
          badge: '15 คาบ',
          badgeClass: 'bg-white/25 text-white',
        },
        {
          id: 'reports',
          label: 'ตารางทางราชการ 15 สัปดาห์',
          icon: FileText,
          allowed: true,
          badge: 'มรภ.',
          badgeClass: 'bg-teal-600 text-white',
        },
      ],
    },
    {
      title: 'ข้อมูลหลัก & ตั้งค่าระบบ',
      items: [
        {
          id: 'master_data',
          label: 'จัดการข้อมูลหลัก (วิชา/ห้อง/ครู)',
          icon: Database,
          allowed: true,
        },
        {
          id: 'users',
          label: 'ผู้ใช้งาน & กำหนดสิทธิ์',
          icon: Users,
          allowed: true,
          badge: '5 ระดับ',
          badgeClass: 'bg-slate-800 text-slate-300 border border-slate-700',
        },
        {
          id: 'settings',
          label: 'เชื่อมต่อ Supabase & Database',
          icon: Cloud,
          allowed: true,
        },
      ],
    },
  ];

  const displayName = currentUser?.name || 'ศ.ดร.ประสิทธิ์ สุขสมบูรณ์';
  const displayRoleLabel =
    currentRole === 'super_admin'
      ? 'Super Admin (Online)'
      : currentRole === 'academic_admin'
      ? 'Academic Admin (Online)'
      : currentRole === 'department_admin'
      ? 'Dept Admin (Online)'
      : currentRole === 'teacher'
      ? 'Teacher (Online)'
      : 'Student (Online)';

  return (
    <aside className="w-64 bg-[#1e2430] text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-slate-800/80 select-none z-20">
      {/* Top Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30 shrink-0">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div className="truncate">
          <div className="text-sm font-bold text-white tracking-wide uppercase">ACADEMIC PORTAL</div>
          <div className="text-[11px] text-slate-400 truncate">
            {settings?.institution_name_th || 'มหาวิทยาลัยนครพนม'}
          </div>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-b border-slate-800/80 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full border-2 border-blue-500 overflow-hidden bg-slate-800 shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-sm">
          {currentUser?.avatar_url ? (
            <img src={currentUser.avatar_url} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="truncate">
          <div className="text-sm font-semibold text-white truncate leading-tight">{displayName}</div>
          <div className="text-xs text-emerald-400 flex items-center space-x-1.5 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse shrink-0" />
            <span className="truncate">{displayRoleLabel}</span>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 py-4 overflow-y-auto space-y-6 px-3">
        {menuSections.map((section, sIdx) => {
          const visibleItems = section.items.filter((item) => item.allowed);
          if (visibleItems.length === 0) return null;

          return (
            <div key={sIdx}>
              <h3 className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                {section.title}
              </h3>
              <div className="space-y-1">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as ActiveTab)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-colors text-left cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white font-semibold shadow-xs'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white font-medium'
                      }`}
                    >
                      <div className="flex items-center space-x-3 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            isActive ? 'bg-white/20 text-white' : item.badgeClass
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Reset Data Button */}
      <div className="p-3 border-t border-slate-800/80">
        <button
          type="button"
          onClick={onResetData}
          className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-semibold text-amber-400 hover:text-amber-300 hover:bg-slate-800/60 rounded-lg transition-colors cursor-pointer"
          title="รีเซ็ตข้อมูลตัวอย่างทั้งหมดกลับเป็นค่าเริ่มต้น"
        >
          <RotateCcw className="w-4 h-4 text-amber-400 shrink-0" />
          <span>รีเซ็ตตัวอย่างข้อมูล</span>
        </button>
      </div>
    </aside>
  );
};
