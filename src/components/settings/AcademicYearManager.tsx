import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Check,
  Edit2,
  Trash2,
  Sparkles,
  CalendarDays,
  ArrowRight,
} from 'lucide-react';
import { AcademicYear, Semester } from '../../types';

interface AcademicYearManagerProps {
  academicYears: AcademicYear[];
  semesters: Semester[];
  activeSemesterId: number;
  onSelectSemester: (semesterId: number) => void;
  onAddAcademicYear: (yearTh: string, yearEn: string) => void;
  onAddSemester: (
    academicYearId: number,
    term: number,
    name: string,
    startDate: string,
    endDate: string
  ) => void;
  onSetCurrentSemester: (semesterId: number) => void;
  onDeleteSemester?: (semesterId: number) => void;
}

export const AcademicYearManager: React.FC<AcademicYearManagerProps> = ({
  academicYears,
  semesters,
  activeSemesterId,
  onSelectSemester,
  onAddAcademicYear,
  onAddSemester,
  onSetCurrentSemester,
  onDeleteSemester,
}) => {
  const [showAddYearModal, setShowAddYearModal] = useState(false);
  const [showAddSemesterModal, setShowAddSemesterModal] = useState(false);

  // New Year Form
  const [newYearTh, setNewYearTh] = useState('');
  const [newYearEn, setNewYearEn] = useState('');

  // New Semester Form
  const [selectedYearId, setSelectedYearId] = useState<number>(academicYears[0]?.id || 1);
  const [newTerm, setNewTerm] = useState<number>(1);
  const [newSemesterName, setNewSemesterName] = useState('');
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');

  const handleAddYearSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYearTh.trim()) return;
    const yearEn = newYearEn.trim() || String(Number(newYearTh) - 543);
    onAddAcademicYear(newYearTh.trim(), yearEn);
    setNewYearTh('');
    setNewYearEn('');
    setShowAddYearModal(false);
  };

  const handleAddSemesterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const yearObj = academicYears.find((y) => y.id === selectedYearId);
    const termLabel = newTerm === 3 ? 'ฤดูร้อน' : newTerm;
    const autoName = newSemesterName.trim() || `ภาคการศึกษา ${termLabel}/${yearObj?.year_th || ''}`;
    const start = newStartDate || `${Number(yearObj?.year_en || '2026')}-06-01`;
    const end = newEndDate || `${Number(yearObj?.year_en || '2026')}-10-31`;

    onAddSemester(selectedYearId, newTerm, autoName, start, end);
    setShowAddSemesterModal(false);
    setNewSemesterName('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>การตั้งค่าปีการศึกษาและภาคเรียนที่จัดตาราง (Academic Years & Semesters)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            กำหนดปีการศึกษา ภาคเรียนปัจจุบัน และสลับภาคการศึกษาสำหรับสร้างตารางเรียนตารางสอน
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setShowAddYearModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-300"
          >
            <Plus className="w-4 h-4" />
            <span>+ เพิ่มปีการศึกษา</span>
          </button>
          <button
            onClick={() => {
              if (academicYears.length > 0) {
                setSelectedYearId(academicYears[0].id);
              }
              setShowAddSemesterModal(true);
            }}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ เพิ่มภาคการศึกษา</span>
          </button>
        </div>
      </div>

      {/* Grid of Academic Years & Semesters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {academicYears.map((year) => {
          const yearSemesters = semesters.filter((s) => s.academic_year_id === year.id);

          return (
            <div
              key={year.id}
              className={`bg-white rounded-xl border transition-all overflow-hidden ${
                year.is_current ? 'border-blue-400 shadow-md ring-1 ring-blue-400/30' : 'border-slate-200 shadow-xs'
              }`}
            >
              {/* Card Header */}
              <div className="p-4 bg-gradient-to-r from-slate-50 to-blue-50/40 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-base text-slate-900">ปีการศึกษา {year.year_th}</span>
                    <span className="text-xs font-mono text-slate-500">({year.year_en})</span>
                  </div>
                  <span className="text-[11px] text-slate-500">{yearSemesters.length} ภาคการศึกษา</span>
                </div>
                {year.is_current && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-300">
                    ปีการศึกษาปัจจุบัน
                  </span>
                )}
              </div>

              {/* Semesters List */}
              <div className="divide-y divide-slate-100 p-3 space-y-2">
                {yearSemesters.map((sem) => {
                  const isActive = sem.id === activeSemesterId;

                  return (
                    <div
                      key={sem.id}
                      className={`p-3 rounded-lg border transition-all flex flex-col justify-between space-y-2 ${
                        isActive
                          ? 'bg-blue-50/70 border-blue-300 text-blue-900 shadow-2xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-xs">{sem.name}</span>
                            {sem.is_current && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                ภาคเรียนหลัก
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                            <CalendarDays className="w-3 h-3 text-slate-400" />
                            <span>{sem.start_date || 'มิ.ย.'} ถึง {sem.end_date || 'ต.ค.'}</span>
                          </div>
                        </div>

                        {isActive ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white flex items-center space-x-1 shrink-0">
                            <Check className="w-3 h-3" />
                            <span>กำลังจัดตาราง</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onSelectSemester(sem.id)}
                            className="px-2.5 py-1 rounded text-[11px] font-semibold bg-white hover:bg-blue-50 border border-slate-300 text-slate-700 hover:text-blue-700 hover:border-blue-400 transition-colors shrink-0"
                          >
                            เลือกจัดตาราง
                          </button>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px]">
                        {!sem.is_current ? (
                          <button
                            type="button"
                            onClick={() => onSetCurrentSemester(sem.id)}
                            className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>ตั้งเป็นภาคเรียนหลักของระบบ</span>
                          </button>
                        ) : (
                          <span className="text-emerald-700 font-medium flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>ภาคเรียนเริ่มต้นของระบบ</span>
                          </span>
                        )}

                        {onDeleteSemester && yearSemesters.length > 1 && !sem.is_current && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`คุณต้องการลบภาคการศึกษา ${sem.name} หรือไม่?`)) {
                                onDeleteSemester(sem.id);
                              }
                            }}
                            className="text-slate-400 hover:text-rose-600 p-1"
                            title="ลบภาคเรียนนี้"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add Academic Year */}
      {showAddYearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-blue-700 text-white font-bold flex items-center justify-between">
              <span>เพิ่มปีการศึกษาใหม่</span>
              <button onClick={() => setShowAddYearModal(false)} className="text-white/80 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleAddYearSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">ปีการศึกษา (พ.ศ.) *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น 2570"
                  value={newYearTh}
                  onChange={(e) => {
                    setNewYearTh(e.target.value);
                    if (e.target.value.length === 4) {
                      setNewYearEn(String(Number(e.target.value) - 543));
                    }
                  }}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">ปี ค.ศ. (A.D.)</label>
                <input
                  type="text"
                  placeholder="เช่น 2027"
                  value={newYearEn}
                  onChange={(e) => setNewYearEn(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddYearModal(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold shadow-xs hover:bg-blue-700"
                >
                  บันทึกปีการศึกษา
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Semester */}
      {showAddSemesterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-blue-700 text-white font-bold flex items-center justify-between">
              <span>เพิ่มภาคการศึกษาใหม่</span>
              <button onClick={() => setShowAddSemesterModal(false)} className="text-white/80 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleAddSemesterSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">เลือกปีการศึกษา *</label>
                <select
                  value={selectedYearId}
                  onChange={(e) => setSelectedYearId(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  {academicYears.map((y) => (
                    <option key={y.id} value={y.id}>ปีการศึกษา {y.year_th} ({y.year_en})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">ภาคเรียน *</label>
                <select
                  value={newTerm}
                  onChange={(e) => setNewTerm(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value={1}>ภาคเรียนที่ 1 (เทอมต้น)</option>
                  <option value={2}>ภาคเรียนที่ 2 (เทอมปลาย)</option>
                  <option value={3}>ภาคเรียนฤดูร้อน (Summer)</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">ชื่อภาคการศึกษา (ระบุเองหรือให้สร้างอัตโนมัติ)</label>
                <input
                  type="text"
                  placeholder="เช่น ภาคการศึกษา 1/2569"
                  value={newSemesterName}
                  onChange={(e) => setNewSemesterName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">วันที่เริ่มต้นภาคเรียน</label>
                  <input
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">วันที่สิ้นสุดภาคเรียน</label>
                  <input
                    type="date"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddSemesterModal(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold shadow-xs hover:bg-blue-700"
                >
                  บันทึกภาคการศึกษา
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
