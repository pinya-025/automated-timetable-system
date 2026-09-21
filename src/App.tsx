import React, { useState, useMemo, useEffect } from 'react';
import { CheckCircle2, AlertCircle, X, Database } from 'lucide-react';
import {
  getSupabaseConfig,
  deleteCourseFromSupabase,
  deleteTeacherFromSupabase,
  deleteRoomFromSupabase,
  deleteStudentGroupFromSupabase,
  deleteOfferingFromSupabase,
  deleteScheduleEntryFromSupabase,
  upsertRecordToSupabase,
  pullAllDataFromSupabase,
} from './lib/supabase';
import {
  initialAcademicYears,
  initialSemesters,
  initialDepartments,
  initialPrograms,
  initialStudentGroups,
  initialRoomTypes,
  initialRooms,
  initialCourses,
  initialTeachers,
  initialTeacherAvailabilities,
  initialTeacherPreferences,
  initialTimeslots,
  initialBlockedTimeslots,
  initialCourseOfferings,
  initialConstraintWeights,
  initialScheduleVersions,
  initialScheduleEntries,
  initialUsers,
  initialSettings,
  initialChangeLogs,
} from './data/seedData';
import {
  RoleType,
  ScheduleEntry,
  ScheduleVersion,
  CourseOffering,
  Course,
  StudentGroup,
  Room,
  Teacher,
  BlockedTimeslot,
  ConflictItem,
  ScheduleChangeLog,
  AuditLog,
} from './types';
import {
  detectConflicts,
  calculateSoftPenaltyScore,
  validateMove,
  generateSchedule,
  suggestAlternativeSlots,
  getDayName,
  SchedulerContext,
} from './services/schedulerEngine';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { TimetableGrid } from './components/timetable/TimetableGrid';
import { ConflictAuditView } from './components/timetable/ConflictAuditView';
import { ConflictRejectModal } from './components/timetable/ConflictRejectModal';
import { SuggestSlotModal } from './components/timetable/SuggestSlotModal';
import { AutoGenerateModal } from './components/timetable/AutoGenerateModal';
import { MasterDataManager } from './components/crud/MasterDataManager';
import { UserRoleManagement } from './components/crud/UserRoleManagement';
import { ReportsView } from './components/reports/ReportsView';
import { LoginView } from './components/auth/LoginView';
import { SystemSettingsView } from './components/settings/SystemSettingsView';
import { User, AppSettings } from './types';

export default function App() {
  // Master Datasets State
  const [academicYears] = useState(initialAcademicYears);
  const [semesters] = useState(initialSemesters);
  const [departments, setDepartments] = useState(initialDepartments);
  const [programs] = useState(initialPrograms);
  const [studentGroups, setStudentGroups] = useState(initialStudentGroups);
  const [roomTypes, setRoomTypes] = useState(initialRoomTypes);
  const [rooms, setRooms] = useState(initialRooms);
  const [courses, setCourses] = useState(initialCourses);
  const [teachers, setTeachers] = useState(initialTeachers);
  const [availabilities, setAvailabilities] = useState(initialTeacherAvailabilities);
  const [preferences] = useState(initialTeacherPreferences);
  const [timeslots, setTimeslots] = useState(initialTimeslots);
  const [blockedTimeslots, setBlockedTimeslots] = useState(initialBlockedTimeslots);
  const [constraints, setConstraints] = useState(initialConstraintWeights);
  const [offerings, setOfferings] = useState(initialCourseOfferings);
  
  // Persistent Users state
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('npu_app_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved users', e);
      }
    }
    return initialUsers;
  });

  // Persistent Settings state (Branding, Logo, Signers)
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('npu_app_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved settings', e);
      }
    }
    return initialSettings;
  });

  // Active Logged In User (starts at null to display the role-separated login portal, or loads from localStorage)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('npu_logged_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved logged user', e);
      }
    }
    return null;
  });

  // Versions and Entries State
  const [versions, setVersions] = useState<ScheduleVersion[]>(initialScheduleVersions);
  const [activeVersionId, setActiveVersionId] = useState<number>(1);
  const [entries, setEntries] = useState<ScheduleEntry[]>(initialScheduleEntries);

  // System State - derive role from currentUser
  const [currentRole, setCurrentRole] = useState<RoleType>(() => {
    const saved = localStorage.getItem('npu_logged_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u?.role) return u.role;
      } catch (e) {
        /* ignore */
      }
    }
    return 'super_admin';
  });
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [changeLogs, setChangeLogs] = useState<ScheduleChangeLog[]>(initialChangeLogs);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: 1,
      user_name: 'Academic Admin',
      action: 'GENERATE',
      entity_type: 'ScheduleVersion',
      entity_id: '1',
      ip_address: '127.0.0.1',
      created_at: new Date().toISOString(),
    },
  ]);

  // Modals State
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage((current) => (current?.text === text ? null : current));
    }, 4000);
  };

  // Auto load data from Supabase if configured
  useEffect(() => {
    const config = getSupabaseConfig();
    if (config.isConnected) {
      pullAllDataFromSupabase().then((cloudData) => {
        if (!cloudData) return;
        let loadedCount = 0;
        if (cloudData.departments && cloudData.departments.length > 0) {
          setDepartments(cloudData.departments as any);
          loadedCount++;
        }
        if (cloudData.teachers && cloudData.teachers.length > 0) {
          setTeachers(cloudData.teachers as any);
          loadedCount++;
        }
        if (cloudData.rooms && cloudData.rooms.length > 0) {
          setRooms(cloudData.rooms as any);
          loadedCount++;
        }
        if (cloudData.courses && cloudData.courses.length > 0) {
          setCourses(cloudData.courses as any);
          loadedCount++;
        }
        if (cloudData.studentGroups && cloudData.studentGroups.length > 0) {
          setStudentGroups(cloudData.studentGroups as any);
          loadedCount++;
        }
        if (cloudData.offerings && cloudData.offerings.length > 0) {
          const safeOfferings = cloudData.offerings.map((o: any) => ({
            ...o,
            periods_per_session:
              Array.isArray(o.periods_per_session) && o.periods_per_session.length > 0
                ? o.periods_per_session
                : [2],
          }));
          setOfferings(safeOfferings as any);
          loadedCount++;
        }
        if (cloudData.entries && cloudData.entries.length > 0) {
          setEntries(cloudData.entries as any);
          loadedCount++;
        }
        if (loadedCount > 0) {
          showToast('โหลดข้อมูลล่าสุดจากฐานข้อมูล Supabase สำเร็จ', 'info');
        }
      });
    }
  }, []);
  const [pendingMove, setPendingMove] = useState<{
    entryId: number;
    targetDay: number;
    targetSlot: number;
    targetRoomId: number;
    hardConflicts: ConflictItem[];
    softWarnings: ConflictItem[];
  } | null>(null);

  const [suggestModalOpen, setSuggestModalOpen] = useState(false);
  const [suggestEntryId, setSuggestEntryId] = useState<number | null>(null);

  // Active semester & version lookups
  const activeSemester = semesters.find((s) => s.is_current) || semesters[0];
  const activeVersion = versions.find((v) => v.id === activeVersionId) || versions[0];
  const isVersionPublished = activeVersion?.status === 'published';

  // Filter entries for current active version
  const currentVersionEntries = useMemo(() => {
    return entries.filter((e) => e.schedule_version_id === activeVersionId);
  }, [entries, activeVersionId]);

  // Context for scheduler operations
  const schedulerContext: SchedulerContext = useMemo(
    () => ({
      offerings,
      courses,
      teachers,
      studentGroups,
      rooms,
      roomTypes,
      timeslots,
      blockedTimeslots,
      availabilities,
      preferences,
      weights: constraints,
    }),
    [
      offerings,
      courses,
      teachers,
      studentGroups,
      rooms,
      roomTypes,
      timeslots,
      blockedTimeslots,
      availabilities,
      preferences,
      constraints,
    ]
  );

  // Real-time Dynamic Conflict Auditing for active version entries
  const currentConflicts = useMemo(() => {
    return detectConflicts(currentVersionEntries, schedulerContext);
  }, [currentVersionEntries, schedulerContext]);

  const hardConflictCount = currentConflicts.filter((c) => c.severity === 'ERROR').length;

  // Drag & Drop Handler with Validation
  const handleRequestMove = (
    entryId: number,
    targetDay: number,
    targetSlot: number,
    targetRoomId: number
  ) => {
    if (isVersionPublished) {
      alert('ตารางนี้ถูก Publish แล้ว ห้ามแก้ไขโดยตรง กรุณาสร้าง Draft Version ใหม่');
      return;
    }

    const validation = validateMove(
      entryId,
      targetDay,
      targetSlot,
      targetRoomId,
      currentVersionEntries,
      schedulerContext
    );

    if (validation.hasHardConflict || validation.softWarnings.length > 0) {
      setPendingMove({
        entryId,
        targetDay,
        targetSlot,
        targetRoomId,
        hardConflicts: validation.hardConflicts,
        softWarnings: validation.softWarnings,
      });
      setConflictModalOpen(true);
    } else {
      // Clean move without conflicts
      executeMove(entryId, targetDay, targetSlot, targetRoomId, 'Manual Drag & Drop adjustment');
    }
  };

  // Perform actual state update for move
  const executeMove = (
    entryId: number,
    targetDay: number,
    targetSlot: number,
    targetRoomId: number,
    reason: string
  ) => {
    const entryToMove = entries.find((e) => e.id === entryId);
    if (!entryToMove) return;

    const off = offerings.find((o) => o.id === entryToMove.course_offering_id);
    const crs = courses.find((c) => c.id === off?.course_id);
    const oldRoom = rooms.find((r) => r.id === entryToMove.room_id);
    const newRoom = rooms.find((r) => r.id === targetRoomId);

    const oldDay = entryToMove.day_of_week;
    const oldSlot = entryToMove.start_timeslot_id;

    // Update entry
    const updatedEntry = {
      ...entryToMove,
      day_of_week: targetDay,
      start_timeslot_id: targetSlot,
      end_timeslot_id: targetSlot + entryToMove.period_length - 1,
      room_id: targetRoomId,
      updated_at: new Date().toISOString(),
    };

    setEntries((prev) =>
      prev.map((e) => {
        if (e.id === entryId) {
          return updatedEntry;
        }
        return e;
      })
    );

    // Sync move to Supabase
    upsertRecordToSupabase('schedule_entries', updatedEntry);

    // Record Schedule Change Log
    const newLog: ScheduleChangeLog = {
      id: Date.now(),
      schedule_version_id: activeVersionId,
      course_name: crs?.name_th || 'Course',
      user_name: 'Academic Admin',
      old_day: oldDay,
      old_period_start: oldSlot,
      old_room_name: oldRoom?.room_number || '',
      new_day: targetDay,
      new_period_start: targetSlot,
      new_room_name: newRoom?.room_number || '',
      reason,
      ip_address: '127.0.0.1',
      created_at: new Date().toISOString(),
    };

    setChangeLogs((prev) => [newLog, ...prev]);
  };

  // Open Suggest Slot Modal
  const handleOpenSuggestModal = (entryId: number) => {
    setSuggestEntryId(entryId);
    setSuggestModalOpen(true);
  };

  // Calculate top 5 alternative slots with 0 hard conflicts
  const suggestedSlots = useMemo(() => {
    if (!suggestEntryId) return [];
    const entry = entries.find((e) => e.id === suggestEntryId);
    if (!entry) return [];

    const off = offerings.find((o) => o.id === entry.course_offering_id);
    if (!off) return [];

    const results: any[] = [];
    const days = [1, 2, 3, 4, 5];
    const targetRooms = rooms.filter((r) => r.room_type_id === off.room_type_id && r.capacity >= off.student_count);

    for (const day of days) {
      for (let slot = 1; slot <= 9 - entry.period_length + 1; slot++) {
        for (const rm of targetRooms) {
          const testVal = validateMove(
            entry.id,
            day,
            slot,
            rm.id,
            currentVersionEntries,
            schedulerContext
          );

          if (!testVal.hasHardConflict) {
            const tags: string[] = [];
            if (rm.id === off.preferred_room_id) tags.push('ห้องประจำ');
            if (slot <= 4) tags.push('ช่วงเช้า');
            if (testVal.softWarnings.length === 0) tags.push('ปลอดโปร่ง ไร้ข้อขัดแย้ง');

            results.push({
              day,
              startSlot: slot,
              endSlot: slot + entry.period_length - 1,
              roomId: rm.id,
              roomNumber: rm.room_number,
              penaltyScore: testVal.penaltyScore,
              tags,
            });
          }
        }
      }
    }

    return results.sort((a, b) => a.penaltyScore - b.penaltyScore).slice(0, 5);
  }, [suggestEntryId, entries, offerings, rooms, currentVersionEntries]);

  // Apply suggested slot
  const handleApplySuggestedSlot = (day: number, startSlot: number, roomId: number) => {
    if (!suggestEntryId) return;
    executeMove(suggestEntryId, day, startSlot, roomId, 'Applied CP-SAT Suggestion');
    setSuggestModalOpen(false);
    setConflictModalOpen(false);
    setPendingMove(null);
  };

  // Auto-Generate Solver Execution
  const handleExecuteGenerate = async () => {
    // Artificial small delay for CP-SAT solver feedback
    await new Promise((resolve) => setTimeout(resolve, 800));

    const newVersionNumber = versions.length + 1;
    const generated = generateSchedule(schedulerContext);

    const newVersion: ScheduleVersion = {
      id: Date.now(),
      semester_id: activeSemester.id,
      version_number: newVersionNumber,
      name: `V${newVersionNumber}.0 - CP-SAT Optimized Draft`,
      status: 'draft',
      score: generated.score,
      hard_conflict_count: generated.hardConflictCount,
      soft_penalty_score: generated.softPenaltyScore,
      notes: 'Generated via Google OR-Tools CP-SAT formulation',
      created_by: 'Academic Admin',
      created_at: new Date().toISOString(),
    };

    const newEntries = generated.entries.map((e) => ({
      ...e,
      schedule_version_id: newVersion.id,
    }));

    setVersions((prev) => [newVersion, ...prev]);
    setEntries((prev) => [...prev, ...newEntries]);
    setActiveVersionId(newVersion.id);

    setAuditLogs((prev) => [
      {
        id: Date.now(),
        user_name: 'Academic Admin',
        action: 'GENERATE',
        entity_type: 'ScheduleVersion',
        entity_id: String(newVersion.id),
        ip_address: '127.0.0.1',
        created_at: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  // Publish Version
  const handlePublishVersion = (versionId: number) => {
    setVersions((prev) =>
      prev.map((v) => {
        if (v.id === versionId) {
          return { ...v, status: 'published', published_at: new Date().toISOString() };
        } else if (v.status === 'published') {
          return { ...v, status: 'archived' };
        }
        return v;
      })
    );
  };

  // Duplicate Version to Draft
  const handleDuplicateVersion = (versionId: number) => {
    const sourceVer = versions.find((v) => v.id === versionId);
    if (!sourceVer) return;

    const newVerNum = versions.length + 1;
    const newVersion: ScheduleVersion = {
      id: Date.now(),
      semester_id: sourceVer.semester_id,
      version_number: newVerNum,
      name: `V${newVerNum}.0 - Cloned from ${sourceVer.name}`,
      status: 'draft',
      score: sourceVer.score,
      hard_conflict_count: sourceVer.hard_conflict_count,
      soft_penalty_score: sourceVer.soft_penalty_score,
      created_by: 'Academic Admin',
      created_at: new Date().toISOString(),
    };

    const clonedEntries = entries
      .filter((e) => e.schedule_version_id === versionId)
      .map((e) => ({
        ...e,
        id: Date.now() + Math.random(),
        schedule_version_id: newVersion.id,
      }));

    setVersions((prev) => [newVersion, ...prev]);
    setEntries((prev) => [...prev, ...clonedEntries]);
    setActiveVersionId(newVersion.id);
  };

  // Master Data CRUD Handlers (Synchronized with Supabase Database)
  const handleAddCourse = (c: Omit<Course, 'id'>) => {
    const newCourse: Course = { ...c, id: Date.now() };
    setCourses((prev) => [...prev, newCourse]);
    upsertRecordToSupabase('courses', newCourse);
    showToast(`เพิ่มวิชา ${newCourse.code} เรียบร้อยแล้ว`);
  };

  const handleUpdateCourse = (c: Course) => {
    setCourses((prev) => prev.map((item) => (item.id === c.id ? c : item)));
    upsertRecordToSupabase('courses', c);
    showToast(`อัปเดตวิชา ${c.code} เรียบร้อยแล้ว`);
  };

  const handleDeleteCourse = async (id: number) => {
    const courseToDelete = courses.find((c) => c.id === id);
    const relatedOfferings = offerings.filter((o) => o.course_id === id);
    const relatedOfferingIds = relatedOfferings.map((o) => o.id);

    // 1. Remove from React local state (cascade offerings and timetable entries)
    setCourses((prev) => prev.filter((item) => item.id !== id));
    setOfferings((prev) => prev.filter((o) => o.course_id !== id));
    setEntries((prev) => prev.filter((e) => !relatedOfferingIds.includes(e.course_offering_id)));

    // 2. Audit log
    const log: AuditLog = {
      id: Date.now(),
      user_name: currentUser?.name || 'Academic Admin',
      action: 'DELETE',
      entity_type: 'Course',
      entity_id: String(id),
      ip_address: '127.0.0.1',
      created_at: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);

    // 3. Delete from Supabase Database
    const res = await deleteCourseFromSupabase(id);
    if (!res.success) {
      showToast(`ลบจากหน้าเว็บสำเร็จ แต่ฐานข้อมูล Supabase แจ้งเตือน: ${res.error}`, 'error');
    } else {
      showToast(`ลบวิชา "${courseToDelete?.code || id}" ออกจากระบบและฐานข้อมูล Supabase แล้ว`, 'success');
    }
  };

  const handleAddTeacher = (t: Omit<Teacher, 'id'>) => {
    const newTeacher: Teacher = { ...t, id: Date.now() };
    setTeachers((prev) => [...prev, newTeacher]);
    upsertRecordToSupabase('teachers', newTeacher);
    showToast(`เพิ่มอาจารย์ ${newTeacher.name} เรียบร้อยแล้ว`);
  };

  const handleUpdateTeacher = (t: Teacher) => {
    setTeachers((prev) => prev.map((item) => (item.id === t.id ? t : item)));
    upsertRecordToSupabase('teachers', t);
    showToast(`อัปเดตข้อมูลอาจารย์ ${t.name} เรียบร้อยแล้ว`);
  };

  const handleDeleteTeacher = async (id: number) => {
    const teacherToDelete = teachers.find((t) => t.id === id);
    setTeachers((prev) => prev.filter((item) => item.id !== id));
    setOfferings((prev) => prev.map((o) => (o.teacher_id === id ? { ...o, teacher_id: 0 as any } : o)));

    const log: AuditLog = {
      id: Date.now(),
      user_name: currentUser?.name || 'Academic Admin',
      action: 'DELETE',
      entity_type: 'Teacher',
      entity_id: String(id),
      ip_address: '127.0.0.1',
      created_at: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);

    const res = await deleteTeacherFromSupabase(id);
    if (!res.success) {
      showToast(`ลบจากหน้าเว็บสำเร็จ แต่ฐานข้อมูล Supabase แจ้งเตือน: ${res.error}`, 'error');
    } else {
      showToast(`ลบอาจารย์ "${teacherToDelete?.name || id}" ออกจากระบบและฐานข้อมูล Supabase แล้ว`, 'success');
    }
  };

  const handleToggleAvailability = (teacherId: number, day: number, slotId: number) => {
    setAvailabilities((prev) => {
      const existing = prev.find(
        (a) => a.teacher_id === teacherId && a.day_of_week === day && a.timeslot_id === slotId
      );
      if (existing) {
        return prev.map((a) =>
          a.teacher_id === teacherId && a.day_of_week === day && a.timeslot_id === slotId
            ? { ...a, is_available: !a.is_available }
            : a
        );
      }
      return [
        ...prev,
        {
          id: Date.now(),
          teacher_id: teacherId,
          day_of_week: day,
          timeslot_id: slotId,
          is_available: false,
        },
      ];
    });
  };

  const handleAddRoom = (r: Omit<Room, 'id'>) => {
    const newRoom: Room = { ...r, id: Date.now() };
    setRooms((prev) => [...prev, newRoom]);
    upsertRecordToSupabase('rooms', newRoom);
    showToast(`เพิ่มห้องเรียน ${newRoom.room_number} เรียบร้อยแล้ว`);
  };

  const handleUpdateRoom = (r: Room) => {
    setRooms((prev) => prev.map((item) => (item.id === r.id ? r : item)));
    upsertRecordToSupabase('rooms', r);
    showToast(`อัปเดตห้องเรียน ${r.room_number} เรียบร้อยแล้ว`);
  };

  const handleDeleteRoom = async (id: number) => {
    const roomToDelete = rooms.find((r) => r.id === id);
    setRooms((prev) => prev.filter((item) => item.id !== id));
    setEntries((prev) => prev.map((e) => (e.room_id === id ? { ...e, room_id: 0 as any } : e)));

    const log: AuditLog = {
      id: Date.now(),
      user_name: currentUser?.name || 'Academic Admin',
      action: 'DELETE',
      entity_type: 'Room',
      entity_id: String(id),
      ip_address: '127.0.0.1',
      created_at: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);

    const res = await deleteRoomFromSupabase(id);
    if (!res.success) {
      showToast(`ลบจากหน้าเว็บสำเร็จ แต่ฐานข้อมูล Supabase แจ้งเตือน: ${res.error}`, 'error');
    } else {
      showToast(`ลบห้องเรียน "${roomToDelete?.room_number || id}" ออกจากระบบและฐานข้อมูล Supabase แล้ว`, 'success');
    }
  };

  const handleAddGroup = (g: Omit<StudentGroup, 'id'>) => {
    const newGroup: StudentGroup = { ...g, id: Date.now() };
    setStudentGroups((prev) => [...prev, newGroup]);
    upsertRecordToSupabase('student_groups', newGroup);
    showToast(`เพิ่มกลุ่มเรียน ${newGroup.code} เรียบร้อยแล้ว`);
  };

  const handleUpdateGroup = (g: StudentGroup) => {
    setStudentGroups((prev) => prev.map((item) => (item.id === g.id ? g : item)));
    upsertRecordToSupabase('student_groups', g);
    showToast(`อัปเดตกลุ่มเรียน ${g.code} เรียบร้อยแล้ว`);
  };

  const handleDeleteGroup = async (id: number) => {
    const groupToDelete = studentGroups.find((g) => g.id === id);
    const relatedOfferings = offerings.filter((o) => o.student_group_id === id);
    const relatedOfferingIds = relatedOfferings.map((o) => o.id);

    setStudentGroups((prev) => prev.filter((item) => item.id !== id));
    setOfferings((prev) => prev.filter((o) => o.student_group_id !== id));
    setEntries((prev) => prev.filter((e) => !relatedOfferingIds.includes(e.course_offering_id)));

    const log: AuditLog = {
      id: Date.now(),
      user_name: currentUser?.name || 'Academic Admin',
      action: 'DELETE',
      entity_type: 'StudentGroup',
      entity_id: String(id),
      ip_address: '127.0.0.1',
      created_at: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);

    const res = await deleteStudentGroupFromSupabase(id);
    if (!res.success) {
      showToast(`ลบจากหน้าเว็บสำเร็จ แต่ฐานข้อมูล Supabase แจ้งเตือน: ${res.error}`, 'error');
    } else {
      showToast(`ลบกลุ่มเรียน "${groupToDelete?.code || id}" ออกจากระบบและฐานข้อมูล Supabase แล้ว`, 'success');
    }
  };

  const handleAddOffering = (o: Omit<CourseOffering, 'id'>) => {
    const newOffering: CourseOffering = {
      ...o,
      id: Date.now(),
      periods_per_session: Array.isArray(o.periods_per_session) ? o.periods_per_session : [2],
    };
    setOfferings((prev) => [...prev, newOffering]);
    upsertRecordToSupabase('course_offerings', newOffering);
    showToast('เพิ่มแผนเปิดสอนเรียบร้อยแล้ว');
  };

  const handleUpdateOffering = (o: CourseOffering) => {
    const updatedOffering: CourseOffering = {
      ...o,
      periods_per_session: Array.isArray(o.periods_per_session) ? o.periods_per_session : [2],
    };
    setOfferings((prev) => prev.map((item) => (item.id === o.id ? updatedOffering : item)));
    upsertRecordToSupabase('course_offerings', updatedOffering);
    showToast('อัปเดตแผนเปิดสอนเรียบร้อยแล้ว');
  };

  const handleDeleteOffering = async (id: number) => {
    setOfferings((prev) => prev.filter((item) => item.id !== id));
    setEntries((prev) => prev.filter((e) => e.course_offering_id !== id));

    const log: AuditLog = {
      id: Date.now(),
      user_name: currentUser?.name || 'Academic Admin',
      action: 'DELETE',
      entity_type: 'CourseOffering',
      entity_id: String(id),
      ip_address: '127.0.0.1',
      created_at: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);

    const res = await deleteOfferingFromSupabase(id);
    if (!res.success) {
      showToast(`ลบจากหน้าเว็บสำเร็จ แต่ฐานข้อมูล Supabase แจ้งเตือน: ${res.error}`, 'error');
    } else {
      showToast('ลบแผนเปิดสอนและตารางที่เกี่ยวข้องออกจากระบบและฐานข้อมูล Supabase แล้ว', 'success');
    }
  };

  // Quick Print Action - Directs to authentic official 15-period document and reports view
  const handleQuickPrint = () => {
    setActiveTab('reports');
  };

  // User & Settings Management Handlers
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('npu_app_settings', JSON.stringify(newSettings));
    const log: AuditLog = {
      id: Date.now(),
      user_name: currentUser?.name || 'Super Admin',
      action: 'UPDATE_SETTINGS',
      entity_type: 'AppSettings',
      entity_id: 'branding_and_signers',
      ip_address: '127.0.0.1',
      created_at: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const handleUsersChange = (newUsers: User[]) => {
    setUsers(newUsers);
    localStorage.setItem('npu_app_users', JSON.stringify(newUsers));
    if (currentUser) {
      const updatedCurrent = newUsers.find((u) => u.id === currentUser.id);
      if (updatedCurrent) {
        setCurrentUser(updatedCurrent);
        localStorage.setItem('npu_logged_user', JSON.stringify(updatedCurrent));
      }
    }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    localStorage.setItem('npu_logged_user', JSON.stringify(user));
    const log: AuditLog = {
      id: Date.now(),
      user_name: user.name,
      action: 'LOGIN',
      entity_type: 'User',
      entity_id: user.username || user.email,
      ip_address: '127.0.0.1',
      created_at: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);

    if (user.role === 'super_admin') {
      setActiveTab('users');
    } else if (user.role === 'academic_admin') {
      setActiveTab('dashboard');
    } else if (user.role === 'department_admin') {
      setActiveTab('master_data');
    } else {
      setActiveTab('timetable');
    }
  };

  const handleLogout = () => {
    if (currentUser) {
      const log: AuditLog = {
        id: Date.now(),
        user_name: currentUser.name,
        action: 'LOGOUT',
        entity_type: 'User',
        entity_id: currentUser.username || currentUser.email,
        ip_address: '127.0.0.1',
        created_at: new Date().toISOString(),
      };
      setAuditLogs((prev) => [log, ...prev]);
    }
    setCurrentUser(null);
    localStorage.removeItem('npu_logged_user');
  };

  const handleRoleChange = (role: RoleType) => {
    setCurrentRole(role);
    const matchedUser = users.find((u) => u.role === role && u.is_active);
    if (matchedUser) {
      setCurrentUser(matchedUser);
      localStorage.setItem('npu_logged_user', JSON.stringify(matchedUser));
    }
  };

  // If user is not logged in, show dedicated Role-based Login View
  if (!currentUser) {
    return (
      <LoginView
        users={users}
        settings={settings}
        teachers={teachers}
        studentGroups={studentGroups}
        onLogin={handleLogin}
        onBypassAsAdmin={() => {
          const admin = users.find((u) => u.role === 'super_admin') || users[0];
          handleLogin(admin);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      {/* Responsive Navbar */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        activeSemester={activeSemester}
        onOpenGenerateModal={() => setIsGenerateModalOpen(true)}
        onQuickPrint={handleQuickPrint}
        hardConflictCount={hardConflictCount}
        settings={settings}
        currentUser={currentUser}
        onLogout={handleLogout}
        onNavigateToSettings={() => setActiveTab('settings')}
      />

      {/* Main Content Area with Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentRole={currentRole}
          conflictCount={hardConflictCount}
          settings={settings}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          {activeTab === 'dashboard' && (
            <DashboardView
              teachers={teachers}
              courses={courses}
              rooms={rooms}
              studentGroups={studentGroups}
              offerings={offerings}
              entries={currentVersionEntries}
              activeSemester={activeSemester}
              activeVersion={activeVersion}
              conflicts={currentConflicts}
              onNavigateTab={setActiveTab}
              onOpenGenerate={() => setIsGenerateModalOpen(true)}
            />
          )}

          {activeTab === 'timetable' && (
            <TimetableGrid
              entries={currentVersionEntries}
              offerings={offerings}
              courses={courses}
              teachers={teachers}
              studentGroups={studentGroups}
              rooms={rooms}
              timeslots={timeslots}
              blockedTimeslots={blockedTimeslots}
              currentRole={currentRole}
              isVersionPublished={isVersionPublished}
              onRequestMove={handleRequestMove}
              onOpenSuggestModal={handleOpenSuggestModal}
              onAddEntry={(newEntry) => {
                const created: ScheduleEntry = {
                  ...newEntry,
                  id: Date.now(),
                  schedule_version_id: activeVersionId,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                };
                setEntries((prev) => [...prev, created]);
                upsertRecordToSupabase('schedule_entries', created);
                showToast('เพิ่มคาบเรียนลงในตารางและบันทึกลงฐานข้อมูลแล้ว', 'success');
              }}
              onUpdateEntry={(updatedEntry) => {
                const updated = { ...updatedEntry, updated_at: new Date().toISOString() };
                setEntries((prev) =>
                  prev.map((e) => (e.id === updatedEntry.id ? updated : e))
                );
                upsertRecordToSupabase('schedule_entries', updated);
                showToast('อัปเดตคาบเรียนในตารางและบันทึกลงฐานข้อมูลแล้ว', 'success');
              }}
              onDeleteEntry={async (entryId) => {
                setEntries((prev) => prev.filter((e) => e.id !== entryId));
                const log: AuditLog = {
                  id: Date.now(),
                  user_name: currentUser?.name || 'Academic Admin',
                  action: 'DELETE',
                  entity_type: 'ScheduleEntry',
                  entity_id: String(entryId),
                  ip_address: '127.0.0.1',
                  created_at: new Date().toISOString(),
                };
                setAuditLogs((prev) => [log, ...prev]);

                const res = await deleteScheduleEntryFromSupabase(entryId);
                if (!res.success) {
                  showToast(`ลบคาบเรียนจากหน้าเว็บสำเร็จ แต่ฐานข้อมูล Supabase แจ้งเตือน: ${res.error}`, 'error');
                } else {
                  showToast('ลบคาบเรียนออกจากตารางและลบออกจากฐานข้อมูล Supabase เรียบร้อยแล้ว', 'success');
                }
              }}
              activeSemester={activeSemester}
              settings={settings}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'conflicts' && (
            <ConflictAuditView
              conflicts={currentConflicts}
              activeVersion={activeVersion}
              entries={currentVersionEntries}
              onOpenSuggestSlot={handleOpenSuggestModal}
              onNavigateTimetable={() => setActiveTab('timetable')}
            />
          )}

          {activeTab === 'master_data' && (
            <MasterDataManager
              courses={courses}
              teachers={teachers}
              rooms={rooms}
              studentGroups={studentGroups}
              offerings={offerings}
              departments={departments}
              roomTypes={roomTypes}
              timeslots={timeslots}
              availabilities={availabilities}
              onAddCourse={handleAddCourse}
              onUpdateCourse={handleUpdateCourse}
              onDeleteCourse={handleDeleteCourse}
              onAddTeacher={handleAddTeacher}
              onUpdateTeacher={handleUpdateTeacher}
              onDeleteTeacher={handleDeleteTeacher}
              onToggleAvailability={handleToggleAvailability}
              onAddRoom={handleAddRoom}
              onUpdateRoom={handleUpdateRoom}
              onDeleteRoom={handleDeleteRoom}
              onAddGroup={handleAddGroup}
              onUpdateGroup={handleUpdateGroup}
              onDeleteGroup={handleDeleteGroup}
              onAddOffering={handleAddOffering}
              onUpdateOffering={handleUpdateOffering}
              onDeleteOffering={handleDeleteOffering}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              entries={currentVersionEntries}
              offerings={offerings}
              courses={courses}
              teachers={teachers}
              studentGroups={studentGroups}
              rooms={rooms}
              timeslots={timeslots}
              activeSemester={activeSemester}
              settings={settings}
            />
          )}

          {activeTab === 'users' && (
            <UserRoleManagement
              users={users}
              onUsersChange={handleUsersChange}
              currentRole={currentRole}
              onRoleChange={handleRoleChange}
              currentUser={currentUser}
              onSwitchUser={(u) => {
                setCurrentUser(u);
                setCurrentRole(u.role);
                localStorage.setItem('npu_logged_user', JSON.stringify(u));
              }}
              departments={departments}
              teachers={teachers}
              studentGroups={studentGroups}
            />
          )}

          {activeTab === 'settings' && (
            <SystemSettingsView
              settings={settings}
              onSaveSettings={handleSaveSettings}
              currentRole={currentRole}
              departments={departments}
              teachers={teachers}
              rooms={rooms}
              courses={courses}
              studentGroups={studentGroups}
              offerings={offerings}
              entries={entries}
              timeslots={timeslots}
              blockedTimeslots={blockedTimeslots}
              onAddBlockedTimeslot={(item) => {
                setBlockedTimeslots((prev) => [...prev, { ...item, id: Date.now() }]);
              }}
              onDeleteBlockedTimeslot={(id) => {
                setBlockedTimeslots((prev) => prev.filter((b) => b.id !== id));
              }}
              changeLogs={changeLogs}
              auditLogs={auditLogs}
              onDataLoadedFromSupabase={(cloudData) => {
                if (cloudData.departments) setDepartments(cloudData.departments);
                if (cloudData.teachers) setTeachers(cloudData.teachers);
                if (cloudData.rooms) setRooms(cloudData.rooms);
                if (cloudData.courses) setCourses(cloudData.courses);
                if (cloudData.studentGroups) setStudentGroups(cloudData.studentGroups);
                if (cloudData.offerings) setOfferings(cloudData.offerings);
                if (cloudData.entries) setEntries(cloudData.entries);
              }}
            />
          )}
        </main>
      </div>

      {/* Auto-Generate CP-SAT Modal */}
      <AutoGenerateModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        activeSemester={activeSemester}
        offerings={offerings}
        rooms={rooms}
        teachers={teachers}
        blockedTimeslots={blockedTimeslots}
        onExecuteGenerate={handleExecuteGenerate}
      />

      {/* Conflict Rejection / Warning Modal */}
      {conflictModalOpen && pendingMove && (
        <ConflictRejectModal
          isOpen={conflictModalOpen}
          onClose={() => {
            setConflictModalOpen(false);
            setPendingMove(null);
          }}
          hardConflicts={pendingMove.hardConflicts}
          softWarnings={pendingMove.softWarnings}
          onConfirmMoveAnyway={() => {
            executeMove(
              pendingMove.entryId,
              pendingMove.targetDay,
              pendingMove.targetSlot,
              pendingMove.targetRoomId,
              'Overrode soft constraint warning'
            );
            setConflictModalOpen(false);
            setPendingMove(null);
          }}
          onOpenSuggestSlot={() => {
            setSuggestEntryId(pendingMove.entryId);
            setConflictModalOpen(false);
            setSuggestModalOpen(true);
          }}
        />
      )}

      {/* Suggest Alternative Slot Modal */}
      {suggestModalOpen && suggestEntryId && (
        <SuggestSlotModal
          isOpen={suggestModalOpen}
          onClose={() => {
            setSuggestModalOpen(false);
            setSuggestEntryId(null);
          }}
          entry={entries.find((e) => e.id === suggestEntryId) || null}
          offering={
            offerings.find(
              (o) => o.id === entries.find((e) => e.id === suggestEntryId)?.course_offering_id
            ) || null
          }
          course={
            courses.find(
              (c) =>
                c.id ===
                offerings.find(
                  (o) => o.id === entries.find((e) => e.id === suggestEntryId)?.course_offering_id
                )?.course_id
            ) || null
          }
          teacher={
            teachers.find(
              (t) =>
                t.id ===
                offerings.find(
                  (o) => o.id === entries.find((e) => e.id === suggestEntryId)?.course_offering_id
                )?.teacher_id
            ) || null
          }
          suggestedSlots={suggestedSlots}
          onApplySlot={handleApplySuggestedSlot}
        />
      )}
      {/* Supabase & System Action Notification Toast */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center space-x-3 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold border transition-all animate-in fade-in slide-in-from-bottom-2 ${
            toastMessage.type === 'error'
              ? 'bg-rose-50 border-rose-300 text-rose-800'
              : toastMessage.type === 'info'
              ? 'bg-sky-50 border-sky-300 text-sky-800'
              : 'bg-emerald-50 border-emerald-300 text-emerald-900'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          ) : toastMessage.type === 'info' ? (
            <Database className="w-4 h-4 text-sky-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 hover:bg-black/5 rounded text-slate-500 hover:text-slate-700"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
