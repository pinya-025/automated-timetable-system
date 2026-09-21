import React from 'react';
import { AlertOctagon, AlertTriangle, CheckCircle, X, Sparkles } from 'lucide-react';
import { ConflictItem } from '../../types';

interface ConflictRejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  hardConflicts: ConflictItem[];
  softWarnings: ConflictItem[];
  onConfirmMoveAnyway: () => void;
  onOpenSuggestSlot: () => void;
}

export const ConflictRejectModal: React.FC<ConflictRejectModalProps> = ({
  isOpen,
  onClose,
  hardConflicts,
  softWarnings,
  onConfirmMoveAnyway,
  onOpenSuggestSlot,
}) => {
  if (!isOpen) return null;

  const isHardConflict = hardConflicts.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div
          className={`p-5 flex items-center justify-between border-b ${
            isHardConflict ? 'bg-rose-50 border-rose-200' : 'bg-amber-50 border-amber-200'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isHardConflict ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'
              }`}
            >
              {isHardConflict ? <AlertOctagon className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className={`font-bold text-base ${isHardConflict ? 'text-rose-950' : 'text-amber-950'}`}>
                {isHardConflict ? 'ไม่อนุญาตให้ย้ายคาบ (Hard Conflict)' : 'คำเตือนเงื่อนไขยืดหยุ่น (Soft Constraint)'}
              </h3>
              <p className="text-xs text-slate-600">
                {isHardConflict
                  ? 'การย้ายคาบนี้ละเมิดกฎหลักที่ไม่สามารถผ่อนปรนได้'
                  : 'การย้ายคาบนี้อาจส่งผลต่อความเหมาะสมของตาราง'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-96 overflow-y-auto">
          {/* Hard Conflicts List */}
          {hardConflicts.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center space-x-1.5">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                <span>ข้อขัดแย้งร้ายแรง ({hardConflicts.length} รายการ)</span>
              </h4>
              <div className="space-y-2">
                {hardConflicts.map((c, i) => (
                  <div key={i} className="p-3 rounded-lg bg-rose-50/70 border border-rose-200 text-xs">
                    <p className="font-semibold text-rose-900">{c.title}</p>
                    <p className="text-slate-600 mt-0.5">{c.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Soft Warnings List */}
          {softWarnings.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>ข้อควรพิจารณา ({softWarnings.length} รายการ)</span>
              </h4>
              <div className="space-y-2">
                {softWarnings.map((w, i) => (
                  <div key={i} className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-xs">
                    <p className="font-semibold text-amber-900">{w.title}</p>
                    <p className="text-slate-600 mt-0.5">{w.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assistant Suggestion Tip */}
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-start space-x-3 text-xs">
            <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900">แนะนำการแก้ปัญหา</p>
              <p className="text-blue-700 mt-0.5">
                ท่านสามารถให้ระบบ CP-SAT ช่วยค้นหาช่องเวลาว่างที่เหมาะสมที่สุดโดยปราศจากข้อขัดแย้งได้ทันที
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onOpenSuggestSlot}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>ค้นหาช่วงเวลาที่เหมาะสม (Suggest)</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors"
            >
              ปิดหน้าต่าง
            </button>

            {!isHardConflict && softWarnings.length > 0 && (
              <button
                type="button"
                onClick={onConfirmMoveAnyway}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 shadow-xs transition-colors"
              >
                ยืนยันการย้ายต่อไป
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
