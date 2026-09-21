import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Users,
  DoorClosed,
  GraduationCap,
  Sparkles,
  Search,
} from 'lucide-react';
import { ConflictItem, ScheduleVersion, ScheduleEntry } from '../../types';

interface ConflictAuditViewProps {
  conflicts: ConflictItem[];
  activeVersion: ScheduleVersion;
  entries: ScheduleEntry[];
  onOpenSuggestSlot: (entryId: number) => void;
  onNavigateTimetable: () => void;
}

export const ConflictAuditView: React.FC<ConflictAuditViewProps> = ({
  conflicts,
  activeVersion,
  entries,
  onOpenSuggestSlot,
  onNavigateTimetable,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'ERROR' | 'WARNING'>('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');

  const filtered = conflicts.filter((c) => {
    if (filterSeverity !== 'ALL' && c.severity !== filterSeverity) return false;
    if (searchKeyword) {
      const match =
        c.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        c.description.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        c.type.toLowerCase().includes(searchKeyword.toLowerCase());
      if (!match) return false;
    }
    return true;
  });

  const hardCount = conflicts.filter((c) => c.severity === 'ERROR').length;
  const softCount = conflicts.filter((c) => c.severity === 'WARNING').length;

  return (
    <div className="space-y-5">
      {/* Header and Summary Cards */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-slate-800">ศูนย์ตรวจสอบและวิเคราะห์ข้อขัดแย้ง (Conflict Auditing)</h2>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
              {activeVersion.name}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ระบบทำการตรวจสอบตารางเทียบกับ 10 Hard Constraints และ 8 Soft Constraints แบบ Real-time
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-center">
            <span className="block text-xs text-rose-600 font-medium">Hard Conflicts</span>
            <span className="text-xl font-bold">{hardCount}</span>
          </div>
          <div className="px-4 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-center">
            <span className="block text-xs text-amber-600 font-medium">Soft Warnings</span>
            <span className="text-xl font-bold">{softCount}</span>
          </div>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาข้อขัดแย้ง, ชื่ออาจารย์, ห้อง..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setFilterSeverity('ALL')}
              className={`px-3 py-1 rounded-md transition-all ${
                filterSeverity === 'ALL' ? 'bg-white font-bold shadow-xs text-slate-800' : 'text-slate-600'
              }`}
            >
              ทั้งหมด ({conflicts.length})
            </button>
            <button
              onClick={() => setFilterSeverity('ERROR')}
              className={`px-3 py-1 rounded-md transition-all ${
                filterSeverity === 'ERROR' ? 'bg-white font-bold shadow-xs text-rose-700' : 'text-slate-600'
              }`}
            >
              Hard ({hardCount})
            </button>
            <button
              onClick={() => setFilterSeverity('WARNING')}
              className={`px-3 py-1 rounded-md transition-all ${
                filterSeverity === 'WARNING' ? 'bg-white font-bold shadow-xs text-amber-700' : 'text-slate-600'
              }`}
            >
              Soft ({softCount})
            </button>
          </div>
        </div>

        <button
          onClick={onNavigateTimetable}
          className="text-xs text-blue-600 hover:text-blue-700 font-semibold hover:underline"
        >
          กลับไปยังหน้าตารางเรียน &rarr;
        </button>
      </div>

      {/* Conflict List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl p-12 border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">ไม่พบข้อขัดแย้งในหมวดหมู่นี้</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              ตารางเรียนตารางสอนฉบับนี้สอดคล้องกับข้อกำหนดและไม่มีการละเมิดเงื่อนไขในตัวกรองปัจจุบัน
            </p>
          </div>
        ) : (
          filtered.map((item, idx) => {
            const isError = item.severity === 'ERROR';

            return (
              <div
                key={idx}
                className={`bg-white rounded-xl p-4 border shadow-xs transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  isError ? 'border-rose-300 hover:border-rose-400' : 'border-amber-200 hover:border-amber-300'
                }`}
              >
                <div className="flex items-start space-x-3.5">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      isError ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {isError ? <AlertOctagon className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isError ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.type}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                  </div>
                </div>

                {item.entry_id && (
                  <button
                    onClick={() => onOpenSuggestSlot(item.entry_id!)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200 transition-colors shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>ค้นหาช่องเวลาแก้ไข</span>
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
