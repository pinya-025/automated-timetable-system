import React from 'react';
import { Sparkles, Check, X, Calendar, Clock, DoorClosed, ThumbsUp } from 'lucide-react';
import { ScheduleEntry, CourseOffering, Course, Teacher, Room, Timeslot } from '../../types';
import { getDayName } from '../../services/schedulerEngine';

interface SuggestSlotOption {
  day: number;
  startSlot: number;
  endSlot: number;
  roomId: number;
  roomNumber: string;
  penaltyScore: number;
  tags: string[];
}

interface SuggestSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: ScheduleEntry | null;
  offering: CourseOffering | null;
  course: Course | null;
  teacher: Teacher | null;
  suggestedSlots: SuggestSlotOption[];
  onApplySlot: (day: number, startSlot: number, roomId: number) => void;
}

export const SuggestSlotModal: React.FC<SuggestSlotModalProps> = ({
  isOpen,
  onClose,
  entry,
  offering,
  course,
  teacher,
  suggestedSlots,
  onApplySlot,
}) => {
  if (!isOpen || !entry || !course) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-700 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">ค้นหาช่วงเวลาที่เหมาะสมที่สุด</h3>
              <p className="text-xs text-blue-100">
                วิชา {course.code} {course.name_th} ({entry.period_length} คาบ)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[420px] overflow-y-auto">
          <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
            <span>ผู้สอน: <strong className="text-slate-800">{teacher?.prefix}{teacher?.name}</strong></span>
            <span>ความยาวคาบ: <strong className="text-slate-800">{entry.period_length} คาบต่อเนื่อง</strong></span>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              ช่วงเวลาที่ผ่าน Hard Constraints และมี Penalty Score ต่ำสุด ({suggestedSlots.length} ตัวเลือก)
            </h4>

            {suggestedSlots.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                ไม่พบช่วงเวลาที่ว่างโดยไม่มีข้อขัดแย้งเลย กรุณาตรวจสอบตารางหรือขยายช่วงเวลา
              </div>
            ) : (
              suggestedSlots.map((slot, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/30 transition-all flex items-center justify-between gap-4 shadow-xs"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800">
                        {getDayName(slot.day)}
                      </span>
                      <span className="text-xs font-semibold text-slate-800 flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>คาบที่ {slot.startSlot} - {slot.endSlot}</span>
                      </span>
                      <span className="text-xs text-slate-600 flex items-center space-x-1 font-mono">
                        <DoorClosed className="w-3.5 h-3.5 text-slate-400" />
                        <span>ห้อง {slot.roomNumber}</span>
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-1">
                      {slot.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        Penalty: {slot.penaltyScore}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onApplySlot(slot.day, slot.startSlot, slot.roomId)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0 flex items-center space-x-1 active:scale-95"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>ใช้ช่องนี้</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  );
};
