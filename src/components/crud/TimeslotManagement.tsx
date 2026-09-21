import React, { useState } from 'react';
import { Clock, Coffee, Flag, Plus, Shield, CheckCircle2, Trash2 } from 'lucide-react';
import { Timeslot, BlockedTimeslot } from '../../types';
import { getDayName } from '../../services/schedulerEngine';

interface TimeslotManagementProps {
  timeslots: Timeslot[];
  blockedTimeslots: BlockedTimeslot[];
  onAddBlockedTimeslot: (item: Omit<BlockedTimeslot, 'id'>) => void;
  onDeleteBlockedTimeslot: (id: number) => void;
}

export const TimeslotManagement: React.FC<TimeslotManagementProps> = ({
  timeslots,
  blockedTimeslots,
  onAddBlockedTimeslot,
  onDeleteBlockedTimeslot,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<BlockedTimeslot['type']>('MEETING');
  const [dayOfWeek, setDayOfWeek] = useState<number>(3);
  const [timeslotId, setTimeslotId] = useState<number>(8);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    onAddBlockedTimeslot({
      day_of_week: dayOfWeek,
      timeslot_id: timeslotId,
      start_time: '15:00',
      end_time: '16:00',
      type,
      title,
      applies_to: 'ALL',
      is_active: true,
    });

    setTitle('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span>การจัดการคาบเรียน และช่วงเวลาห้ามจัด (Timeslots & Blocked Times)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            กำหนดคาบเรียน 9 คาบต่อวัน (08:00 - 17:00) และเงื่อนไขห้ามจัดตาราง เช่น พักกลางวัน (12:00-13:00) และกิจกรรมวันพุธบ่าย
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มช่วงเวลาห้ามจัด</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeslot Master Schedule */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3">
          <h3 className="font-bold text-sm text-slate-800 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>ตารางเวลามาตรฐาน (15 คาบเรียนต่อวัน 06:00 - 21:00 น.)</span>
          </h3>

          <div className="divide-y divide-slate-100 text-xs">
            {timeslots.map((slot) => (
              <div
                key={slot.id}
                className={`py-2.5 px-3 flex items-center justify-between rounded-lg ${
                  slot.is_lunch ? 'bg-amber-50 font-semibold text-amber-900' : 'text-slate-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="w-6 text-center font-mono font-bold text-slate-400">
                    {slot.period_number}
                  </span>
                  <span className="font-medium">{slot.label}</span>
                </div>
                <div className="flex items-center space-x-2 font-mono text-slate-500">
                  <span>{slot.start_time} - {slot.end_time}</span>
                  {slot.is_lunch && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-200 text-amber-800 font-bold">
                      พักกลางวัน
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Blocked Timeslots */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3">
          <h3 className="font-bold text-sm text-slate-800 flex items-center space-x-2">
            <Shield className="w-4 h-4 text-rose-600" />
            <span>ช่วงเวลาห้ามจัดคาบเรียน (Blocked Timeslots)</span>
          </h3>

          <div className="space-y-2.5">
            {blockedTimeslots.map((b) => (
              <div
                key={b.id}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                    {b.type === 'LUNCH' ? <Coffee className="w-4 h-4" /> : <Flag className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{b.title}</h4>
                    <p className="text-[11px] text-slate-500">
                      {b.day_of_week === 0 ? 'ทุกวันจันทร์ - ศุกร์' : getDayName(b.day_of_week)} (
                      {b.start_time} - {b.end_time})
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                    Active
                  </span>
                  {b.id > 2 && (
                    <button
                      onClick={() => onDeleteBlockedTimeslot(b.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-base text-slate-900">เพิ่มช่วงเวลาห้ามจัดตาราง</h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">ชื่อกิจกรรม / เหตุผล</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น ประชุมคณะกรรมการประจำคณะ"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">วันในสัปดาห์</label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                  >
                    <option value={0}>ทุกวัน (Mon - Fri)</option>
                    <option value={1}>วันจันทร์</option>
                    <option value={2}>วันอังคาร</option>
                    <option value={3}>วันพุธ</option>
                    <option value={4}>วันพฤหัสบดี</option>
                    <option value={5}>วันศุกร์</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">คาบเรียน</label>
                  <select
                    value={timeslotId}
                    onChange={(e) => setTimeslotId(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                  >
                    {timeslots.map((s) => (
                      <option key={s.id} value={s.id}>
                        คาบ {s.period_number} ({s.start_time})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
