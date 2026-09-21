import React, { useState } from 'react';
import {
  ShieldCheck,
  UserCheck,
  Lock,
  Check,
  X,
  Plus,
  Pencil,
  Trash2,
  Search,
  KeyRound,
  Mail,
  Phone,
  Building,
  UserPlus,
  GraduationCap,
  Users,
  CheckCircle2,
  AlertTriangle,
  LogIn,
  Eye,
  EyeOff,
  Filter,
} from 'lucide-react';
import { User, RoleType, Department, Teacher, StudentGroup } from '../../types';

interface UserRoleManagementProps {
  users: User[];
  onUsersChange: (users: User[]) => void;
  currentRole: RoleType;
  onRoleChange: (role: RoleType) => void;
  currentUser?: User | null;
  onSwitchUser?: (user: User) => void;
  departments?: Department[];
  teachers?: Teacher[];
  studentGroups?: StudentGroup[];
}

export const UserRoleManagement: React.FC<UserRoleManagementProps> = ({
  users,
  onUsersChange,
  currentRole,
  onRoleChange,
  currentUser,
  onSwitchUser,
  departments = [],
  teachers = [],
  studentGroups = [],
}) => {
  const [activeTab, setActiveTab] = useState<'users_list' | 'roles_matrix'>('users_list');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isResetPwModalOpen, setIsResetPwModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    password: string;
    role: RoleType;
    department_id?: number;
    teacher_id?: number;
    student_group_id?: number;
    phone: string;
    is_active: boolean;
  }>({
    name: '',
    email: '',
    password: 'password123',
    role: 'teacher',
    phone: '',
    is_active: true,
  });

  const [notification, setNotification] = useState<string | null>(null);

  const isSuperAdmin = currentRole === 'super_admin';

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Role info list
  const rolesInfo: {
    role: RoleType;
    name: string;
    desc: string;
    color: string;
    badge: string;
  }[] = [
    {
      role: 'super_admin',
      name: 'Super Admin',
      desc: 'ผู้ดูแลระบบสูงสุด จัดการผู้ใช้งาน สิทธิ์ และระบบฐานข้อมูลทั้งหมด',
      color: 'bg-purple-100 text-purple-800 border-purple-300',
      badge: 'bg-purple-500 text-white',
    },
    {
      role: 'academic_admin',
      name: 'Academic Admin',
      desc: 'ฝ่ายวิชาการ จัดการตารางเรียน รัน AI CP-SAT Solver ตรวจสอบและ Publish ตาราง',
      color: 'bg-blue-100 text-blue-800 border-blue-300',
      badge: 'bg-blue-500 text-white',
    },
    {
      role: 'department_admin',
      name: 'Department Admin',
      desc: 'หัวหน้าสาขาวิชา บริหารข้อมูลรายวิชาเปิดสอนของแผนก และตรวจสอบตารางสาขา',
      color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      badge: 'bg-emerald-500 text-white',
    },
    {
      role: 'teacher',
      name: 'Teacher',
      desc: 'อาจารย์ผู้สอน กำหนดเวลาสะดวกสอน (Availability) และดูตารางสอนส่วนตัว',
      color: 'bg-amber-100 text-amber-800 border-amber-300',
      badge: 'bg-amber-500 text-white',
    },
    {
      role: 'student',
      name: 'Student',
      desc: 'นักศึกษา ดูตารางเรียนประจำกลุ่มของตนเอง และส่งออกไฟล์ PDF/Excel',
      color: 'bg-slate-100 text-slate-800 border-slate-300',
      badge: 'bg-slate-500 text-white',
    },
  ];

  const permissionsMatrix = [
    { feature: 'ดูตารางเรียนตารางสอน (View Timetable)', super: true, acad: true, dept: true, teach: true, stud: true },
    { feature: 'ส่งออกตาราง PDF / Excel (Export)', super: true, acad: true, dept: true, teach: true, stud: true },
    { feature: 'กำหนดเวลาสะดวกสอน (Teacher Availability)', super: true, acad: true, dept: true, teach: true, stud: false },
    { feature: 'จัดการวิชาเปิดสอน (Course Offerings)', super: true, acad: true, dept: true, teach: false, stud: false },
    { feature: 'รันระบบจัดตารางอัตโนมัติ (Generate Timetable)', super: true, acad: true, dept: false, teach: false, stud: false },
    { feature: 'ย้ายคาบเรียน Drag & Drop', super: true, acad: true, dept: false, teach: false, stud: false },
    { feature: 'ประกาศใช้งานตาราง (Publish Version)', super: true, acad: true, dept: false, teach: false, stud: false },
    { feature: 'ตั้งค่าระบบ & Logo (System Settings)', super: true, acad: true, dept: false, teach: false, stud: false },
    { feature: 'เพิ่ม/ลบ/แก้ไข ผู้ใช้งาน (User Management)', super: true, acad: false, dept: false, teach: false, stud: false },
  ];

  // Filtering users
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && u.is_active) ||
      (statusFilter === 'inactive' && !u.is_active);
    return matchSearch && matchRole && matchStatus;
  });

  // Handlers for Add, Edit, Delete
  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      email: '',
      password: 'password123',
      role: 'teacher',
      department_id: departments[0]?.id || undefined,
      teacher_id: teachers[0]?.id || undefined,
      student_group_id: undefined,
      phone: '',
      is_active: true,
    });
    setIsAddModalOpen(true);
  };

  const handleSaveAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      alert('กรุณากรอกชื่อและอีเมลให้ครบถ้วน');
      return;
    }

    // Check duplicate email
    if (users.some((u) => u.email.toLowerCase() === formData.email.toLowerCase().trim())) {
      alert('อีเมลนี้ถูกใช้งานแล้วในระบบ');
      return;
    }

    const newUser: User = {
      id: Math.max(...users.map((u) => u.id), 0) + 1,
      name: formData.name.trim(),
      email: formData.email.toLowerCase().trim(),
      password: formData.password || 'password123',
      role: formData.role,
      department_id: formData.department_id,
      teacher_id: formData.teacher_id,
      student_group_id: formData.student_group_id,
      phone: formData.phone.trim(),
      is_active: formData.is_active,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    const updated = [newUser, ...users];
    onUsersChange(updated);
    setIsAddModalOpen(false);
    showNotification(`เพิ่มผู้ใช้งาน "${newUser.name}" เรียบร้อยแล้ว`);
  };

  const handleOpenEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: user.password || 'password123',
      role: user.role,
      department_id: user.department_id,
      teacher_id: user.teacher_id,
      student_group_id: user.student_group_id,
      phone: user.phone || '',
      is_active: user.is_active,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    // Check duplicate email with others
    if (
      users.some(
        (u) =>
          u.id !== selectedUser.id &&
          u.email.toLowerCase() === formData.email.toLowerCase().trim()
      )
    ) {
      alert('อีเมลนี้ถูกใช้งานโดยผู้ใช้อื่นแล้ว');
      return;
    }

    const updated = users.map((u) => {
      if (u.id === selectedUser.id) {
        return {
          ...u,
          name: formData.name.trim(),
          email: formData.email.toLowerCase().trim(),
          password: formData.password || u.password || 'password123',
          role: formData.role,
          department_id: formData.department_id,
          teacher_id: formData.teacher_id,
          student_group_id: formData.student_group_id,
          phone: formData.phone.trim(),
          is_active: formData.is_active,
        };
      }
      return u;
    });

    onUsersChange(updated);
    setIsEditModalOpen(false);
    showNotification(`แก้ไขข้อมูลผู้ใช้ "${formData.name}" เรียบร้อยแล้ว`);
  };

  const handleToggleStatus = (user: User) => {
    if (user.id === currentUser?.id) {
      alert('ไม่สามารถระงับการใช้งานบัญชีที่กำลังล็อกอินอยู่ได้');
      return;
    }

    const updated = users.map((u) => {
      if (u.id === user.id) {
        return { ...u, is_active: !u.is_active };
      }
      return u;
    });

    onUsersChange(updated);
    showNotification(
      `เปลี่ยนสถานะบัญชี "${user.name}" เป็น ${!user.is_active ? 'เปิดใช้งาน' : 'ระงับใช้งาน'}`
    );
  };

  const handleOpenDeleteModal = (user: User) => {
    if (user.id === currentUser?.id) {
      alert('ไม่สามารถลบบัญชี Super Admin ที่กำลังล็อกอินอยู่ได้');
      return;
    }
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedUser) return;
    const updated = users.filter((u) => u.id !== selectedUser.id);
    onUsersChange(updated);
    setIsDeleteModalOpen(false);
    showNotification(`ลบผู้ใช้งาน "${selectedUser.name}" เรียบร้อยแล้ว`);
  };

  const handleResetPassword = (user: User) => {
    setSelectedUser(user);
    setIsResetPwModalOpen(true);
  };

  const handleConfirmResetPassword = (newPw: string) => {
    if (!selectedUser) return;
    const updated = users.map((u) => (u.id === selectedUser.id ? { ...u, password: newPw } : u));
    onUsersChange(updated);
    setIsResetPwModalOpen(false);
    showNotification(`รีเซ็ตรหัสผ่านสำหรับ "${selectedUser.name}" เป็น "${newPw}" สำเร็จ`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <span>การบริหารผู้ใช้งานและสิทธิ์ตามบทบาท (Super Admin User Management)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            เพิ่ม ลบ แก้ไข ข้อมูลผู้ใช้งาน จัดการสิทธิ์ 5 ระดับ และกำหนดการเชื่อมโยงอาจารย์/กลุ่มเรียน
          </p>
        </div>

        {isSuperAdmin && (
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>เพิ่มผู้ใช้งานใหม่</span>
          </button>
        )}
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center space-x-2.5 shadow-xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{notification}</span>
        </div>
      )}

      {/* Role Switcher Cards (Quick Preview for testing) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {rolesInfo.map((r) => {
          const isSelected = currentRole === r.role;
          const userCount = users.filter((u) => u.role === r.role).length;

          return (
            <button
              key={r.role}
              onClick={() => onRoleChange(r.role)}
              className={`text-left p-3.5 rounded-xl border transition-all space-y-1.5 relative overflow-hidden ${
                isSelected
                  ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-500 ring-offset-2'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${r.color}`}>
                  {r.name}
                </span>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                  {userCount} คน
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">{r.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Tabs: User List vs Permission Matrix */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('users_list')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'users_list'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>รายชื่อผู้ใช้งานทั้งหมด ({users.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('roles_matrix')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'roles_matrix'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>ตารางสิทธิ์การใช้งาน (Permissions Matrix)</span>
        </button>
      </div>

      {/* Tab 1: User Management List */}
      {activeTab === 'users_list' && (
        <div className="bg-white rounded-b-xl border-x border-b border-slate-200 p-5 space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="ค้นหาชื่อ, อีเมล หรือสังกัด..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center space-x-1 text-xs text-slate-500">
                <Filter className="w-3.5 h-3.5" />
                <span>กรองบทบาท:</span>
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-hidden"
              >
                <option value="all">ทุกบทบาทสิทธิ์</option>
                <option value="super_admin">Super Admin</option>
                <option value="academic_admin">Academic Admin</option>
                <option value="department_admin">Department Admin</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-hidden"
              >
                <option value="all">ทุกสถานะ</option>
                <option value="active">เปิดใช้งาน (Active)</option>
                <option value="inactive">ระงับใช้งาน (Inactive)</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase text-[10px]">
                  <th className="py-3 px-4">ผู้ใช้งาน (User)</th>
                  <th className="py-3 px-3">บทบาทสิทธิ์ (Role)</th>
                  <th className="py-3 px-3">แผนก / สังกัด</th>
                  <th className="py-3 px-3">เบอร์โทรศัพท์</th>
                  <th className="py-3 px-3 text-center">สถานะ</th>
                  <th className="py-3 px-4 text-center">จัดการ (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      ไม่พบข้อมูลผู้ใช้งานตามเงื่อนไขที่ค้นหา
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const roleMeta = rolesInfo.find((r) => r.role === user.role);
                    const dept = departments.find((d) => d.id === user.department_id);
                    const isSelf = currentUser?.id === user.id;

                    return (
                      <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                                <span>{user.name}</span>
                                {isSelf && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 font-semibold border border-blue-200">
                                    คุณ
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500">{user.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${roleMeta?.color || 'bg-slate-100'}`}>
                            {roleMeta?.name || user.role}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-slate-600">
                          {dept ? dept.name : '-'}
                        </td>

                        <td className="py-3 px-3 text-slate-500 font-mono">
                          {user.phone || '-'}
                        </td>

                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            disabled={!isSuperAdmin || isSelf}
                            onClick={() => handleToggleStatus(user)}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                              user.is_active
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                            } ${!isSuperAdmin || isSelf ? 'cursor-default opacity-80' : 'cursor-pointer'}`}
                            title={isSuperAdmin && !isSelf ? 'คลิกเพื่อสลับสถานะ' : undefined}
                          >
                            {user.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            {/* Switch to this user for testing */}
                            {onSwitchUser && (
                              <button
                                type="button"
                                onClick={() => onSwitchUser(user)}
                                title="เข้าสู่ระบบในนามผู้ใช้นี้ (Switch Account)"
                                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              >
                                <LogIn className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Reset Password */}
                            {isSuperAdmin && (
                              <button
                                type="button"
                                onClick={() => handleResetPassword(user)}
                                title="รีเซ็ตรหัสผ่าน (Reset Password)"
                                className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Edit */}
                            {isSuperAdmin && (
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(user)}
                                title="แก้ไขข้อมูลผู้ใช้ (Edit)"
                                className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Delete */}
                            {isSuperAdmin && (
                              <button
                                type="button"
                                disabled={isSelf}
                                onClick={() => handleOpenDeleteModal(user)}
                                title={isSelf ? 'ไม่สามารถลบบัญชีตนเองได้' : 'ลบผู้ใช้งาน (Delete)'}
                                className={`p-1.5 rounded-md transition-colors ${
                                  isSelf
                                    ? 'text-slate-300 cursor-not-allowed'
                                    : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                                }`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: RBAC Matrix */}
      {activeTab === 'roles_matrix' && (
        <div className="bg-white rounded-b-xl border-x border-b border-slate-200 p-5 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
            <Lock className="w-4 h-4 text-blue-600" />
            <span>ตารางสิทธิ์การเข้าถึงฟังก์ชันของแต่ละบทบาท (Role-Based Permissions)</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase text-[10px]">
                  <th className="py-2.5 px-3">ฟังก์ชันการทำงาน</th>
                  <th className="py-2.5 px-3 text-center">Super Admin</th>
                  <th className="py-2.5 px-3 text-center">Academic Admin</th>
                  <th className="py-2.5 px-3 text-center">Dept Admin</th>
                  <th className="py-2.5 px-3 text-center">Teacher</th>
                  <th className="py-2.5 px-3 text-center">Student</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {permissionsMatrix.map((p, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-medium text-slate-800">{p.feature}</td>
                    <td className="py-2.5 px-3 text-center">
                      {p.super ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {p.acad ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {p.dept ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {p.teach ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {p.stud ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <span>เพิ่มผู้ใช้งานใหม่เข้าสู่ระบบ</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">ชื่อ-นามสกุล หรือตำแหน่ง</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น ศ.ดร.ประสิทธิ์ สุขสมบูรณ์"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">อีเมล (ใช้เป็น Username)</label>
                  <input
                    type="email"
                    required
                    placeholder="user@college.ac.th"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">รหัสผ่านเริ่มต้น</label>
                  <input
                    type="text"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">บทบาทสิทธิ์ (Role)</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as RoleType })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="super_admin">Super Admin (ผู้ดูแลระบบ)</option>
                    <option value="academic_admin">Academic Admin (ฝ่ายวิชาการ)</option>
                    <option value="department_admin">Department Admin (หัวหน้าสาขา)</option>
                    <option value="teacher">Teacher (อาจารย์ผู้สอน)</option>
                    <option value="student">Student (นักศึกษา)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">แผนกวิชา / สาขา</label>
                  <select
                    value={formData.department_id || ''}
                    onChange={(e) => setFormData({ ...formData, department_id: Number(e.target.value) || undefined })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="">-- ไม่ระบุสาขา --</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">เบอร์โทรศัพท์ติดต่อ</label>
                  <input
                    type="text"
                    placeholder="081-xxx-xxxx"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="add_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <label htmlFor="add_active" className="text-xs font-medium text-slate-700 cursor-pointer">
                    เปิดใช้งานบัญชีทันที (Active)
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs"
                >
                  บันทึกข้อมูลผู้ใช้
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Pencil className="w-5 h-5 text-indigo-600" />
                <span>แก้ไขข้อมูลผู้ใช้งาน: {selectedUser.name}</span>
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">ชื่อ-นามสกุล</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">อีเมล (Username)</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">บทบาทสิทธิ์ (Role)</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as RoleType })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="super_admin">Super Admin (ผู้ดูแลระบบ)</option>
                    <option value="academic_admin">Academic Admin (ฝ่ายวิชาการ)</option>
                    <option value="department_admin">Department Admin (หัวหน้าสาขา)</option>
                    <option value="teacher">Teacher (อาจารย์ผู้สอน)</option>
                    <option value="student">Student (นักศึกษา)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">แผนกวิชา / สาขา</label>
                  <select
                    value={formData.department_id || ''}
                    onChange={(e) => setFormData({ ...formData, department_id: Number(e.target.value) || undefined })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="">-- ไม่ระบุสาขา --</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">เบอร์โทรศัพท์ติดต่อ</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="edit_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <label htmlFor="edit_active" className="text-xs font-medium text-slate-700 cursor-pointer">
                    สถานะบัญชีเปิดใช้งาน (Active)
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs"
                >
                  บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {isDeleteModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">ยืนยันการลบผู้ใช้งาน</h3>
              <p className="text-xs text-slate-500">
                คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีผู้ใช้ <strong>"{selectedUser.name}"</strong> ({selectedUser.email})? การดำเนินการนี้จะไม่สามารถย้อนกลับได้
              </p>
            </div>
            <div className="flex items-center justify-center space-x-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs"
              >
                ยืนยันลบผู้ใช้งาน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {isResetPwModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-in">
            <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
              <KeyRound className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-bold text-slate-900">รีเซ็ตรหัสผ่าน</h3>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-slate-500">
                รีเซ็ตรหัสผ่านสำหรับ: <strong>{selectedUser.name}</strong>
              </p>
              <input
                type="text"
                id="reset_pw_input"
                defaultValue="password123"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsResetPwModalOpen(false)}
                className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-lg text-xs"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById('reset_pw_input') as HTMLInputElement;
                  handleConfirmResetPassword(input?.value || 'password123');
                }}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold"
              >
                ตั้งรหัสผ่านใหม่
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
