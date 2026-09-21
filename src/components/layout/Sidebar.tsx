import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  AlertOctagon,
  FileText,
  ShieldCheck,
  Database,
  Settings,
  Lock,
  LogOut,
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
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentRole,
  conflictCount,
  settings,
  currentUser,
  onLogout,
}) => {
  const isSuperAdmin = currentRole === 'super_admin';
  const isAcademicAdmin = currentRole === 'academic_admin' || isSuperAdmin;
  const isDeptAdmin = currentRole === 'department_admin' || isAcademicAdmin;

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
          label: 'ตารางเรียนตารางสอน',
          icon: Calendar,
          allowed: true,
          badge: '15 คาบ',
          badgeCount: conflictCount > 0 ? conflictCount : undefined,
        },
        {
          id: 'reports',
          label: 'ตารางทางการ 15 คาบ & พิมพ์',
          icon: FileText,
          allowed: true,
          badge: 'มรพ.',
        },
      ],
    },
    {
      title: 'ข้อมูลหลัก & ตั้งค่าระบบ',
      items: [
        {
          id: 'master_data',
          label: 'จัดการข้อมูลหลัก (CRUD)',
          icon: Database,
          allowed: isDeptAdmin,
          badge: 'วิชา/ครู/ห้อง',
        },
        {
          id: 'users',
          label: 'ผู้ใช้งาน & สิทธิ์ (RBAC)',
          icon: ShieldCheck,
          allowed: isSuperAdmin,
          badge: 'Super Admin',
        },
        {
          id: 'settings',
          label: 'ตั้งค่าระบบ & ฐานข้อมูล',
          icon: Settings,
          allowed: isAcademicAdmin,
          badge: 'Supabase',
        },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] border-r border-slate-800">
      {/* Top Brand Info */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold uppercase tracking-wider text-slate-400">Academic Portal</span>
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="System Online" />
        </div>
        <div className="mt-1 text-base font-semibold text-white flex items-center space-x-2 truncate">
          <span className="truncate">{settings?.institution_name_th || 'สถาบันการอาชีวศึกษา'}</span>
        </div>
        <div className="text-xs text-slate-400 truncate mt-0.5">
          {settings?.faculty_name || 'ฝ่ายวิชาการและจัดตาราง'}
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 py-4 overflow-y-auto space-y-6 px-3">
        {menuSections.map((section, sIdx) => {
          const visibleItems = section.items.filter((item) => item.allowed);
          if (visibleItems.length === 0) return null;

          return (
            <div key={sIdx}>
              <h3 className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                {section.title}
              </h3>
              <div className="space-y-1.5">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as ActiveTab)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm transition-colors text-left ${
                        isActive
                          ? 'bg-blue-600 text-white font-bold shadow-xs'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white font-medium'
                      }`}
                    >
                      <div className="flex items-center space-x-3 truncate">
                        <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="ml-1 text-xs px-2 py-0.5 rounded bg-blue-900/60 text-blue-200 border border-blue-700/50 font-medium">
                          {item.badge}
                        </span>
                      )}
                      {typeof item.badgeCount === 'number' && item.badgeCount > 0 && (
                        <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold">
                          {item.badgeCount}
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

      {/* Bottom User Profile & Logout */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/70 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 truncate">
            <div className="w-7 h-7 rounded-full bg-[#8B7D52] text-white flex items-center justify-center font-bold text-xs shrink-0">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div className="truncate text-left">
              <div className="text-white font-medium text-[11px] truncate">
                {currentUser?.name || 'ศ.ดร.ประสิทธิ์ สุขสมบูรณ์'}
              </div>
              <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                <Lock className="w-2.5 h-2.5 text-amber-400 inline" />
                <span className="truncate uppercase">{currentRole}</span>
              </div>
            </div>
          </div>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              title="ออกจากระบบ เพื่อไปยังหน้าล็อกอินแยกตามสิทธิ์"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="w-full py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white text-[11px] font-semibold transition-all flex items-center justify-center space-x-1.5"
          >
            <LogOut className="w-3 h-3 text-amber-400" />
            <span>สลับสิทธิ์ / หน้าล็อกอิน</span>
          </button>
        )}
      </div>
    </aside>
  );
};
