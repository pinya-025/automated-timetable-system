import React, { useState } from 'react';
import {
  BookOpen,
  Users,
  DoorClosed,
  GraduationCap,
  Layers,
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  Clock,
  Building,
  Calendar,
  AlertTriangle,
  Info,
  ChevronRight,
} from 'lucide-react';
import {
  Course,
  Teacher,
  Room,
  StudentGroup,
  CourseOffering,
  Department,
  RoomType,
  Timeslot,
  TeacherAvailability,
} from '../../types';

interface MasterDataManagerProps {
  courses: Course[];
  teachers: Teacher[];
  rooms: Room[];
  studentGroups: StudentGroup[];
  offerings: CourseOffering[];
  departments: Department[];
  roomTypes: RoomType[];
  timeslots: Timeslot[];
  availabilities: TeacherAvailability[];
  // Courses CRUD
  onAddCourse: (c: Omit<Course, 'id'>) => void;
  onUpdateCourse: (c: Course) => void;
  onDeleteCourse: (id: number) => void;
  // Teachers CRUD
  onAddTeacher: (t: Omit<Teacher, 'id'>) => void;
  onUpdateTeacher: (t: Teacher) => void;
  onDeleteTeacher: (id: number) => void;
  onToggleAvailability: (teacherId: number, day: number, slotId: number) => void;
  // Rooms CRUD
  onAddRoom: (r: Omit<Room, 'id'>) => void;
  onUpdateRoom: (r: Room) => void;
  onDeleteRoom: (id: number) => void;
  // Groups CRUD
  onAddGroup: (g: Omit<StudentGroup, 'id'>) => void;
  onUpdateGroup: (g: StudentGroup) => void;
  onDeleteGroup: (id: number) => void;
  // Offerings CRUD
  onAddOffering: (o: Omit<CourseOffering, 'id'>) => void;
  onUpdateOffering: (o: CourseOffering) => void;
  onDeleteOffering: (id: number) => void;
}

type TabKey = 'courses' | 'teachers' | 'rooms' | 'groups' | 'offerings';

export const MasterDataManager: React.FC<MasterDataManagerProps> = ({
  courses,
  teachers,
  rooms,
  studentGroups,
  offerings,
  departments,
  roomTypes,
  timeslots,
  availabilities,
  onAddCourse,
  onUpdateCourse,
  onDeleteCourse,
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
  onToggleAvailability,
  onAddRoom,
  onUpdateRoom,
  onDeleteRoom,
  onAddGroup,
  onUpdateGroup,
  onDeleteGroup,
  onAddOffering,
  onUpdateOffering,
  onDeleteOffering,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('courses');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [modalType, setModalType] = useState<
    'addCourse' | 'editCourse' |
    'addTeacher' | 'editTeacher' | 'availability' |
    'addRoom' | 'editRoom' |
    'addGroup' | 'editGroup' |
    'addOffering' | 'editOffering' | null
  >(null);

  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedTeacherForAvail, setSelectedTeacherForAvail] = useState<Teacher | null>(null);

  // Form states
  // Course form
  const [cCode, setCCode] = useState('');
  const [cNameTh, setCNameTh] = useState('');
  const [cNameEn, setCNameEn] = useState('');
  const [cCredits, setCCredits] = useState(3);
  const [cTheory, setCTheory] = useState(2);
  const [cPractice, setCPractice] = useState(2);
  const [cDeptId, setCDeptId] = useState(departments[0]?.id || 1);
  const [cDefaultRoomType, setCDefaultRoomType] = useState(roomTypes[0]?.id || 1);
  const [cIsLab, setCIsLab] = useState(false);

  // Teacher form
  const [tPrefix, setTPrefix] = useState('อ.');
  const [tName, setTName] = useState('');
  const [tEmail, setTEmail] = useState('');
  const [tPhone, setTPhone] = useState('');
  const [tDeptId, setTDeptId] = useState(departments[0]?.id || 1);
  const [tMaxWeek, setTMaxWeek] = useState(24);
  const [tMaxDay, setTMaxDay] = useState(6);

  // Room form
  const [rNumber, setRNumber] = useState('');
  const [rBuilding, setRBuilding] = useState('อาคาร 1 (วิทยบริการ)');
  const [rFloor, setRFloor] = useState(2);
  const [rTypeId, setRTypeId] = useState(roomTypes[0]?.id || 1);
  const [rCapacity, setRCapacity] = useState(40);

  // Group form
  const [gCode, setGCode] = useState('');
  const [gName, setGName] = useState('');
  const [gDeptId, setGDeptId] = useState(departments[0]?.id || 1);
  const [gYearLevel, setGYearLevel] = useState(1);
  const [gStudentCount, setGStudentCount] = useState(30);

  // Offering form
  const [offCourseId, setOffCourseId] = useState(courses[0]?.id || 1);
  const [offTeacherId, setOffTeacherId] = useState(teachers[0]?.id || 1);
  const [offGroupId, setOffGroupId] = useState(studentGroups[0]?.id || 1);
  const [offRoomTypeId, setOffRoomTypeId] = useState(roomTypes[0]?.id || 1);
  const [offStudentCount, setOffStudentCount] = useState(30);
  const [offPeriodsStr, setOffPeriodsStr] = useState('2, 2');
  const [offPreferredRoomId, setOffPreferredRoomId] = useState<number | undefined>(undefined);

  // Lookup maps
  const deptMap = new Map<number, Department>(departments.map((d) => [d.id, d]));
  const roomTypeMap = new Map<number, RoomType>(roomTypes.map((rt) => [rt.id, rt]));
  const teacherMap = new Map<number, Teacher>(teachers.map((t) => [t.id, t]));
  const courseMap = new Map<number, Course>(courses.map((c) => [c.id, c]));
  const groupMap = new Map<number, StudentGroup>(studentGroups.map((g) => [g.id, g]));
  const roomMap = new Map<number, Room>(rooms.map((r) => [r.id, r]));

  // Open modals with prepopulated values
  const openAddCourse = () => {
    setCCode('');
    setCNameTh('');
    setCNameEn('');
    setCCredits(3);
    setCTheory(2);
    setCPractice(2);
    setCDeptId(departments[0]?.id || 1);
    setCDefaultRoomType(roomTypes[0]?.id || 1);
    setCIsLab(false);
    setEditingItem(null);
    setModalType('addCourse');
  };

  const openEditCourse = (c: Course) => {
    setCCode(c.code);
    setCNameTh(c.name_th);
    setCNameEn(c.name_en || '');
    setCCredits(c.credits);
    setCTheory(c.theory_hours);
    setCPractice(c.practice_hours);
    setCDeptId(c.department_id);
    setCDefaultRoomType(c.default_room_type_id);
    setCIsLab(Boolean(c.practice_hours > 0));
    setEditingItem(c);
    setModalType('editCourse');
  };

  const openAddTeacher = () => {
    setTPrefix('อ.');
    setTName('');
    setTEmail('');
    setTPhone('');
    setTDeptId(departments[0]?.id || 1);
    setTMaxWeek(24);
    setTMaxDay(6);
    setEditingItem(null);
    setModalType('addTeacher');
  };

  const openEditTeacher = (t: Teacher) => {
    setTPrefix(t.prefix || 'อ.');
    setTName(t.name);
    setTEmail(t.email || '');
    setTPhone(t.phone || '');
    setTDeptId(t.department_id);
    setTMaxWeek(t.max_periods_per_week || 24);
    setTMaxDay(t.max_periods_per_day || 6);
    setEditingItem(t);
    setModalType('editTeacher');
  };

  const openAddRoom = () => {
    setRNumber('');
    setRBuilding('อาคาร 1 (วิทยบริการ)');
    setRFloor(2);
    setRTypeId(roomTypes[0]?.id || 1);
    setRCapacity(40);
    setEditingItem(null);
    setModalType('addRoom');
  };

  const openEditRoom = (r: Room) => {
    setRNumber(r.room_number);
    setRBuilding(r.building);
    setRFloor(r.floor);
    setRTypeId(r.room_type_id);
    setRCapacity(r.capacity);
    setEditingItem(r);
    setModalType('editRoom');
  };

  const openAddGroup = () => {
    setGCode('');
    setGName('');
    setGDeptId(departments[0]?.id || 1);
    setGYearLevel(1);
    setGStudentCount(30);
    setEditingItem(null);
    setModalType('addGroup');
  };

  const openEditGroup = (g: StudentGroup) => {
    setGCode(g.code);
    setGName(g.name);
    setGDeptId(g.department_id);
    setGYearLevel(g.year_level);
    setGStudentCount(g.student_count);
    setEditingItem(g);
    setModalType('editGroup');
  };

  const openAddOffering = () => {
    setOffCourseId(courses[0]?.id || 1);
    setOffTeacherId(teachers[0]?.id || 1);
    setOffGroupId(studentGroups[0]?.id || 1);
    setOffRoomTypeId(roomTypes[0]?.id || 1);
    setOffStudentCount(30);
    setOffPeriodsStr('2, 2');
    setOffPreferredRoomId(undefined);
    setEditingItem(null);
    setModalType('addOffering');
  };

  const openEditOffering = (off: CourseOffering) => {
    setOffCourseId(off.course_id);
    setOffTeacherId(off.teacher_id);
    setOffGroupId(off.student_group_id);
    setOffRoomTypeId(off.room_type_id);
    setOffStudentCount(off.student_count);
    const periodsArr = Array.isArray(off.periods_per_session) ? off.periods_per_session : [2];
    setOffPeriodsStr(periodsArr.join(', '));
    setOffPreferredRoomId(off.preferred_room_id || undefined);
    setEditingItem(off);
    setModalType('editOffering');
  };

  // Submit handlers
  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cCode || !cNameTh) return;

    if (modalType === 'addCourse') {
      onAddCourse({
        code: cCode,
        name_th: cNameTh,
        name_en: cNameEn,
        credits: cCredits,
        theory_hours: cTheory,
        practice_hours: cPractice,
        department_id: cDeptId,
        default_room_type_id: cDefaultRoomType,
        is_heavy: false,
        is_lab: cIsLab,
      });
    } else if (modalType === 'editCourse' && editingItem) {
      onUpdateCourse({
        ...editingItem,
        code: cCode,
        name_th: cNameTh,
        name_en: cNameEn,
        credits: cCredits,
        theory_hours: cTheory,
        practice_hours: cPractice,
        department_id: cDeptId,
        default_room_type_id: cDefaultRoomType,
        is_lab: cIsLab,
      });
    }
    setModalType(null);
  };

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tName) return;

    if (modalType === 'addTeacher') {
      onAddTeacher({
        prefix: tPrefix,
        name: tName,
        email: tEmail,
        phone: tPhone,
        department_id: tDeptId,
        max_periods_per_week: tMaxWeek,
        max_periods_per_day: tMaxDay,
        max_consecutive_periods: 4,
        color_code: '#2563eb',
      });
    } else if (modalType === 'editTeacher' && editingItem) {
      onUpdateTeacher({
        ...editingItem,
        prefix: tPrefix,
        name: tName,
        email: tEmail,
        phone: tPhone,
        department_id: tDeptId,
        max_periods_per_week: tMaxWeek,
        max_periods_per_day: tMaxDay,
      });
    }
    setModalType(null);
  };

  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rNumber) return;

    if (modalType === 'addRoom') {
      onAddRoom({
        room_number: rNumber,
        building: rBuilding,
        floor: rFloor,
        room_type_id: rTypeId,
        capacity: rCapacity,
        is_active: true,
      });
    } else if (modalType === 'editRoom' && editingItem) {
      onUpdateRoom({
        ...editingItem,
        room_number: rNumber,
        building: rBuilding,
        floor: rFloor,
        room_type_id: rTypeId,
        capacity: rCapacity,
      });
    }
    setModalType(null);
  };

  const handleSaveGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gCode || !gName) return;

    if (modalType === 'addGroup') {
      onAddGroup({
        code: gCode,
        name: gName,
        department_id: gDeptId,
        program_id: 1,
        year_level: gYearLevel,
        student_count: gStudentCount,
      });
    } else if (modalType === 'editGroup' && editingItem) {
      onUpdateGroup({
        ...editingItem,
        code: gCode,
        name: gName,
        department_id: gDeptId,
        year_level: gYearLevel,
        student_count: gStudentCount,
      });
    }
    setModalType(null);
  };

  const handleSaveOffering = (e: React.FormEvent) => {
    e.preventDefault();
    const periods = offPeriodsStr
      .split(',')
      .map((p) => parseInt(p.trim(), 10))
      .filter((n) => !isNaN(n) && n > 0);

    if (modalType === 'addOffering') {
      onAddOffering({
        semester_id: 1,
        course_id: offCourseId,
        student_group_id: offGroupId,
        teacher_id: offTeacherId,
        room_type_id: offRoomTypeId,
        student_count: offStudentCount,
        sessions_per_week: periods.length,
        periods_per_session: periods.length > 0 ? periods : [2],
        must_be_consecutive: true,
        max_sessions_per_day: 1,
        preferred_room_id: offPreferredRoomId,
        is_fixed: false,
        is_active: true,
      });
    } else if (modalType === 'editOffering' && editingItem) {
      onUpdateOffering({
        ...editingItem,
        course_id: offCourseId,
        student_group_id: offGroupId,
        teacher_id: offTeacherId,
        room_type_id: offRoomTypeId,
        student_count: offStudentCount,
        sessions_per_week: periods.length,
        periods_per_session: periods.length > 0 ? periods : [2],
        preferred_room_id: offPreferredRoomId,
      });
    }
    setModalType(null);
  };

  // Filtered queries
  const q = searchQuery.toLowerCase();

  const filteredCourses = courses.filter(
    (c) => c.code.toLowerCase().includes(q) || c.name_th.toLowerCase().includes(q) || c.name_en.toLowerCase().includes(q)
  );

  const filteredTeachers = teachers.filter(
    (t) => t.name.toLowerCase().includes(q) || (t.email && t.email.toLowerCase().includes(q))
  );

  const filteredRooms = rooms.filter(
    (r) => r.room_number.toLowerCase().includes(q) || r.building.toLowerCase().includes(q)
  );

  const filteredGroups = studentGroups.filter(
    (g) => g.code.toLowerCase().includes(q) || g.name.toLowerCase().includes(q)
  );

  const filteredOfferings = offerings.filter((off) => {
    const crs = courseMap.get(off.course_id);
    const grp = groupMap.get(off.student_group_id);
    const tch = teacherMap.get(off.teacher_id);
    return (
      (crs && (crs.code.toLowerCase().includes(q) || crs.name_th.toLowerCase().includes(q))) ||
      (grp && grp.code.toLowerCase().includes(q)) ||
      (tch && tch.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 mb-1">
            <span>ฝ่ายวิชาการและงานทะเบียน</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-500 font-normal">จัดการข้อมูลหลัก (CRUD)</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>การบริหารจัดการข้อมูลหลัก (Master Data Management)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            เพิ่ม ลบ และแก้ไขข้อมูลรายวิชา, อาจารย์ผู้สอน, ห้องเรียน, กลุ่มเรียน, และแผนการเปิดสอน
          </p>
        </div>

        {/* Action Button */}
        {activeTab === 'courses' && (
          <button
            onClick={openAddCourse}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มรายวิชาใหม่</span>
          </button>
        )}
        {activeTab === 'teachers' && (
          <button
            onClick={openAddTeacher}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มอาจารย์ผู้สอน</span>
          </button>
        )}
        {activeTab === 'rooms' && (
          <button
            onClick={openAddRoom}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มห้องเรียนใหม่</span>
          </button>
        )}
        {activeTab === 'groups' && (
          <button
            onClick={openAddGroup}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มกลุ่มเรียน</span>
          </button>
        )}
        {activeTab === 'offerings' && (
          <button
            onClick={openAddOffering}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มแผนเปิดสอน</span>
          </button>
        )}
      </div>

      {/* Navigation Sub-tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab('courses')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'courses' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>รายวิชา ({courses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('teachers')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'teachers' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>อาจารย์ผู้สอน ({teachers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('rooms')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'rooms' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <DoorClosed className="w-4 h-4" />
            <span>ห้องเรียน ({rooms.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('groups')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'groups' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>กลุ่มเรียน ({studentGroups.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('offerings')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'offerings' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>แผนเปิดสอน ({offerings.length})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาข้อมูล..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
          />
        </div>
      </div>

      {/* Tab 1: Courses Table */}
      {activeTab === 'courses' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase text-[11px]">
                <th className="py-3 px-4 w-32">รหัสวิชา</th>
                <th className="py-3 px-4">ชื่อรายวิชา (ไทย / อังกฤษ)</th>
                <th className="py-3 px-4 text-center w-28">หน่วยกิต (ท-ป-น)</th>
                <th className="py-3 px-4 w-36">ประเภทการสอน</th>
                <th className="py-3 px-4 w-40">สาขาวิชา</th>
                <th className="py-3 px-4 text-right w-24">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    ไม่พบข้อมูลรายวิชา
                  </td>
                </tr>
              ) : (
                filteredCourses.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">{c.code}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{c.name_th}</div>
                      <div className="text-[10.5px] text-slate-400 font-normal">{c.name_en}</div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                      {c.credits} ({c.theory_hours}-{c.practice_hours}-0)
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded text-[10.5px] font-bold ${
                          c.is_lab
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            : 'bg-blue-50 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {c.is_lab ? 'ปฏิบัติการ (Lab)' : 'ทฤษฎี (Lecture)'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {deptMap.get(c.department_id)?.name || 'สาขาวิชาทั่วไป'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => openEditCourse(c)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="แก้ไขข้อมูลวิชา"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`ยืนยันการลบวิชา "${c.code} ${c.name_th}" หรือไม่?\n(ข้อมูลจะถูกลบออกจากทั้งระบบและฐานข้อมูล Supabase)`)) {
                              onDeleteCourse(c.id);
                            }
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="ลบวิชา"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Teachers Table */}
      {activeTab === 'teachers' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase text-[11px]">
                <th className="py-3 px-4">ชื่อ - นามสกุลอาจารย์</th>
                <th className="py-3 px-4">สังกัดสาขาวิชา</th>
                <th className="py-3 px-4">อีเมล / เบอร์โทร</th>
                <th className="py-3 px-4 text-center">ภาระสอนสูงสุด (คาบ/สัปดาห์)</th>
                <th className="py-3 px-4 text-center">เวลาสะดวกสอน</th>
                <th className="py-3 px-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredTeachers.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {t.prefix} {t.name}
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    {deptMap.get(t.department_id)?.name || 'วิทยาลัยธาตุพนม'}
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                    <div>{t.email || '-'}</div>
                    <div className="text-slate-400">{t.phone || ''}</div>
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                    {t.max_periods_per_week || 24} คาบ
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => {
                        setSelectedTeacherForAvail(t);
                        setModalType('availability');
                      }}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-[11px] font-medium transition-colors"
                    >
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>กำหนดเวลาว่าง</span>
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => openEditTeacher(t)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="แก้ไขข้อมูลอาจารย์"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`ยืนยันการลบอาจารย์ "${t.prefix} ${t.name}" หรือไม่?\n(ข้อมูลจะถูกลบออกจากทั้งระบบและฐานข้อมูล Supabase)`)) {
                            onDeleteTeacher(t.id);
                          }
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="ลบอาจารย์"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Rooms Table */}
      {activeTab === 'rooms' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase text-[11px]">
                <th className="py-3 px-4 w-32">เลขที่ห้อง</th>
                <th className="py-3 px-4">อาคารที่ตั้ง</th>
                <th className="py-3 px-4 w-28 text-center">ชั้น</th>
                <th className="py-3 px-4">ประเภทห้อง</th>
                <th className="py-3 px-4 text-center w-28">ความจุ (ที่นั่ง)</th>
                <th className="py-3 px-4 text-right w-24">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRooms.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{r.room_number}</td>
                  <td className="py-3 px-4 font-medium text-slate-800">{r.building}</td>
                  <td className="py-3 px-4 text-center font-mono text-slate-600">ชั้น {r.floor}</td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                      {roomTypeMap.get(r.room_type_id)?.name || 'ห้องบรรยาย'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                    {r.capacity} คน
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => openEditRoom(r)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="แก้ไขห้องเรียน"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`ยืนยันการลบห้อง "${r.room_number}" หรือไม่?\n(ข้อมูลจะถูกลบออกจากทั้งระบบและฐานข้อมูล Supabase)`)) {
                            onDeleteRoom(r.id);
                          }
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="ลบห้องเรียน"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Student Groups Table */}
      {activeTab === 'groups' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase text-[11px]">
                <th className="py-3 px-4 w-32">รหัสกลุ่ม</th>
                <th className="py-3 px-4">ชื่อกลุ่มเรียน</th>
                <th className="py-3 px-4">สาขาวิชา</th>
                <th className="py-3 px-4 text-center w-24">ชั้นปี</th>
                <th className="py-3 px-4 text-center w-28">จำนวนนักศึกษา</th>
                <th className="py-3 px-4 text-right w-24">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredGroups.map((g) => (
                <tr key={g.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-blue-700">{g.code}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{g.name}</td>
                  <td className="py-3 px-4 text-slate-700">{deptMap.get(g.department_id)?.name}</td>
                  <td className="py-3 px-4 text-center font-mono font-semibold text-slate-700">ปี {g.year_level}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">
                    {g.student_count} คน
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => openEditGroup(g)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="แก้ไขกลุ่มเรียน"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`ยืนยันการลบกลุ่มเรียน "${g.code} ${g.name}" หรือไม่?\n(ข้อมูลจะถูกลบออกจากทั้งระบบและฐานข้อมูล Supabase)`)) {
                            onDeleteGroup(g.id);
                          }
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="ลบกลุ่มเรียน"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 5: Course Offerings Table */}
      {activeTab === 'offerings' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase text-[11px]">
                <th className="py-3 px-4">วิชาที่เปิดสอน</th>
                <th className="py-3 px-4">กลุ่มนักศึกษา</th>
                <th className="py-3 px-4">อาจารย์ผู้สอน</th>
                <th className="py-3 px-4">ประเภทห้อง</th>
                <th className="py-3 px-4 text-center">นศ. (คน)</th>
                <th className="py-3 px-4 text-center">รูปแบบคาบ</th>
                <th className="py-3 px-4 text-center">ห้องที่กำหนด</th>
                <th className="py-3 px-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredOfferings.map((off) => {
                const crs = courseMap.get(off.course_id);
                const grp = groupMap.get(off.student_group_id);
                const tch = teacherMap.get(off.teacher_id);
                const rt = roomTypeMap.get(off.room_type_id);
                const prefRm = off.preferred_room_id ? roomMap.get(off.preferred_room_id) : null;

                return (
                  <tr key={off.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-blue-700">{crs?.code}</div>
                      <div className="font-semibold text-slate-900">{crs?.name_th}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">{grp?.code} - {grp?.name}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{tch?.prefix}{tch?.name}</td>
                    <td className="py-3 px-4 text-slate-600">{rt?.name}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">{off.student_count}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-blue-50 text-blue-800 border border-blue-200">
                        {(Array.isArray(off.periods_per_session) ? off.periods_per_session : [2]).join(' + ')} คาบ
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-medium text-slate-700">
                      {prefRm ? `${prefRm.room_number}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => openEditOffering(off)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="แก้ไขแผนเปิดสอน"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('ยืนยันการลบแผนการเปิดสอนนี้หรือไม่?\n(ข้อมูลจะถูกลบออกจากทั้งระบบและฐานข้อมูล Supabase)')) {
                              onDeleteOffering(off.id);
                            }
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="ลบแผนเปิดสอน"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL 1: Course Add/Edit */}
      {(modalType === 'addCourse' || modalType === 'editCourse') && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span>{modalType === 'addCourse' ? 'เพิ่มรายวิชาใหม่' : 'แก้ไขข้อมูลรายวิชา'}</span>
              </h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-3.5 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">รหัสวิชา *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น 30204-2001"
                    value={cCode}
                    onChange={(e) => setCCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">สาขาวิชา</label>
                  <select
                    value={cDeptId}
                    onChange={(e) => setCDeptId(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">ชื่อรายวิชา (ภาษาไทย) *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ระบบฐานข้อมูล"
                  value={cNameTh}
                  onChange={(e) => setCNameTh(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">ชื่อรายวิชา (ภาษาอังกฤษ)</label>
                <input
                  type="text"
                  placeholder="เช่น Database Systems"
                  value={cNameEn}
                  onChange={(e) => setCNameEn(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">หน่วยกิต</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={cCredits}
                    onChange={(e) => setCCredits(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ทฤษฎี (ชม.)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={cTheory}
                    onChange={(e) => setCTheory(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ปฏิบัติ (ชม.)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={cPractice}
                    onChange={(e) => setCPractice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ประเภทห้องที่ต้องการ</label>
                  <select
                    value={cDefaultRoomType}
                    onChange={(e) => setCDefaultRoomType(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                  >
                    {roomTypes.map((rt) => (
                      <option key={rt.id} value={rt.id}>
                        {rt.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cIsLab}
                      onChange={(e) => setCIsLab(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-semibold text-slate-800">เป็นวิชาปฏิบัติการ (Lab)</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Teacher Add/Edit */}
      {(modalType === 'addTeacher' || modalType === 'editTeacher') && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>{modalType === 'addTeacher' ? 'เพิ่มอาจารย์ผู้สอน' : 'แก้ไขข้อมูลอาจารย์ผู้สอน'}</span>
              </h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTeacher} className="space-y-3.5 mt-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">คำนำหน้า *</label>
                  <select
                    value={tPrefix}
                    onChange={(e) => setTPrefix(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="อ.">อ.</option>
                    <option value="ผศ.">ผศ.</option>
                    <option value="ผศ.ดร.">ผศ.ดร.</option>
                    <option value="รศ.">รศ.</option>
                    <option value="รศ.ดร.">รศ.ดร.</option>
                    <option value="ดร.">ดร.</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">ชื่อ - นามสกุล *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น ภิญญา สุขวิพัฒน์"
                    value={tName}
                    onChange={(e) => setTName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">สาขาวิชา</label>
                  <select
                    value={tDeptId}
                    onChange={(e) => setTDeptId(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">อีเมล</label>
                  <input
                    type="email"
                    placeholder="example@npu.ac.th"
                    value={tEmail}
                    onChange={(e) => setTEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ภาระสอนสูงสุดต่อสัปดาห์ (คาบ)</label>
                  <input
                    type="number"
                    min="6"
                    max="40"
                    value={tMaxWeek}
                    onChange={(e) => setTMaxWeek(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ภาระสอนสูงสุดต่อวัน (คาบ)</label>
                  <input
                    type="number"
                    min="2"
                    max="10"
                    value={tMaxDay}
                    onChange={(e) => setTMaxDay(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Room Add/Edit */}
      {(modalType === 'addRoom' || modalType === 'editRoom') && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <DoorClosed className="w-5 h-5 text-blue-600" />
                <span>{modalType === 'addRoom' ? 'เพิ่มห้องเรียนใหม่' : 'แก้ไขข้อมูลห้องเรียน'}</span>
              </h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRoom} className="space-y-3.5 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">เลขที่ห้อง *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น 2202"
                    value={rNumber}
                    onChange={(e) => setRNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ชั้น</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={rFloor}
                    onChange={(e) => setRFloor(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">อาคาร</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น อาคาร 0502 (วิทยบริการ)"
                  value={rBuilding}
                  onChange={(e) => setRBuilding(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ประเภทห้องเรียน</label>
                  <select
                    value={rTypeId}
                    onChange={(e) => setRTypeId(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                  >
                    {roomTypes.map((rt) => (
                      <option key={rt.id} value={rt.id}>
                        {rt.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ความจุ (ที่นั่ง)</label>
                  <input
                    type="number"
                    min="10"
                    max="300"
                    value={rCapacity}
                    onChange={(e) => setRCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Student Group Add/Edit */}
      {(modalType === 'addGroup' || modalType === 'editGroup') && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <span>{modalType === 'addGroup' ? 'เพิ่มกลุ่มเรียนนักศึกษา' : 'แก้ไขข้อมูลกลุ่มเรียน'}</span>
              </h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGroup} className="space-y-3.5 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">รหัสกลุ่ม *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น 682020401"
                    value={gCode}
                    onChange={(e) => setGCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">สาขาวิชา</label>
                  <select
                    value={gDeptId}
                    onChange={(e) => setGDeptId(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">ชื่อกลุ่มเรียน *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ปวช.1 เทคโนโลยีสารสนเทศ ห้อง 1"
                  value={gName}
                  onChange={(e) => setGName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ชั้นปี</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={gYearLevel}
                    onChange={(e) => setGYearLevel(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">จำนวนนักศึกษา (คน)</label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={gStudentCount}
                    onChange={(e) => setGStudentCount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: Course Offering Add/Edit */}
      {(modalType === 'addOffering' || modalType === 'editOffering') && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Layers className="w-5 h-5 text-blue-600" />
                <span>{modalType === 'addOffering' ? 'เพิ่มแผนการเปิดสอน' : 'แก้ไขแผนการเปิดสอน'}</span>
              </h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOffering} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">เลือกรายวิชา *</label>
                <select
                  value={offCourseId}
                  onChange={(e) => setOffCourseId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.name_th} ({c.credits} นก.)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">กลุ่มนักศึกษา *</label>
                  <select
                    value={offGroupId}
                    onChange={(e) => setOffGroupId(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                  >
                    {studentGroups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.code} ({g.name})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">อาจารย์ผู้สอน *</label>
                  <select
                    value={offTeacherId}
                    onChange={(e) => setOffTeacherId(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.prefix} {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ประเภทห้องเรียน</label>
                  <select
                    value={offRoomTypeId}
                    onChange={(e) => setOffRoomTypeId(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                  >
                    {roomTypes.map((rt) => (
                      <option key={rt.id} value={rt.id}>
                        {rt.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ห้องที่เจาะจง (ถ้ามี)</label>
                  <select
                    value={offPreferredRoomId || ''}
                    onChange={(e) => setOffPreferredRoomId(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">- ให้ระบบจัดให้อัตโนมัติ -</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.room_number} ({r.building})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">จำนวน นศ. ลงทะเบียน</label>
                  <input
                    type="number"
                    min="1"
                    max="150"
                    value={offStudentCount}
                    onChange={(e) => setOffStudentCount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    การแบ่งคาบ (เช่น 2, 2 หรือ 3)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น 2, 2 หรือ 3"
                    value={offPeriodsStr}
                    onChange={(e) => setOffPeriodsStr(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-400">คั่นด้วยจุลภาค เช่น "2, 2" = 2 ครั้ง ครั้งละ 2 คาบ</span>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: Teacher Availability Grid */}
      {modalType === 'availability' && selectedTeacherForAvail && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <span>
                    กำหนดเวลาว่าง / ไม่สะดวกสอน: {selectedTeacherForAvail.prefix} {selectedTeacherForAvail.name}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  คลิกที่ช่องเวลาเพื่อสลับสถานะ (เขียว = สะดวกสอน, แดง = ติดภารกิจ/ไม่สะดวกสอน)
                </p>
              </div>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs border-collapse border border-slate-300 text-center">
                <thead>
                  <tr className="bg-slate-100 font-bold text-slate-700">
                    <th className="py-2 px-2 border border-slate-300 w-20">วัน</th>
                    {timeslots.map((slot) => (
                      <th key={slot.id} className="py-1 px-1 border border-slate-300 font-semibold text-[10px]">
                        <div>คาบ {slot.period_number}</div>
                        <div className="text-slate-400 font-mono text-[9px]">{slot.start_time}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map((day) => {
                    const dayNames = ['', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์'];
                    return (
                      <tr key={day}>
                        <td className="py-2 px-2 border border-slate-300 font-bold bg-slate-50 text-slate-800">
                          {dayNames[day]}
                        </td>
                        {timeslots.map((slot) => {
                          const record = availabilities.find(
                            (a) =>
                              a.teacher_id === selectedTeacherForAvail.id &&
                              a.day_of_week === day &&
                              a.timeslot_id === slot.id
                          );
                          const isAvailable = record ? record.is_available : true;

                          return (
                            <td
                              key={slot.id}
                              onClick={() => onToggleAvailability(selectedTeacherForAvail.id, day, slot.id)}
                              className={`border border-slate-300 p-2 cursor-pointer transition-colors select-none ${
                                isAvailable
                                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                                  : 'bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold'
                              }`}
                              title={isAvailable ? 'คลิกเพื่อล็อคไม่สะดวกสอน' : 'คลิกเพื่อเปิดว่าง'}
                            >
                              {isAvailable ? (
                                <Check className="w-3.5 h-3.5 mx-auto text-emerald-600" />
                              ) : (
                                <X className="w-3.5 h-3.5 mx-auto text-rose-600" />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs">
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1.5 text-emerald-700 font-medium">
                  <Check className="w-3.5 h-3.5" />
                  <span>สะดวกสอน</span>
                </span>
                <span className="flex items-center space-x-1.5 text-rose-700 font-medium">
                  <X className="w-3.5 h-3.5" />
                  <span>ไม่สะดวกสอน (Blocked)</span>
                </span>
              </div>
              <button
                onClick={() => setModalType(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs"
              >
                เสร็จสิ้น
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
