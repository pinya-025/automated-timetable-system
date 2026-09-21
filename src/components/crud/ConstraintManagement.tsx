import React from 'react';
import { Sliders, AlertOctagon, Sparkles, Check, HelpCircle } from 'lucide-react';
import { ConstraintWeight } from '../../types';

interface ConstraintManagementProps {
  constraints: ConstraintWeight[];
  onUpdateWeight: (code: string, newWeight: number) => void;
}

export const ConstraintManagement: React.FC<ConstraintManagementProps> = ({
  constraints,
  onUpdateWeight,
}) => {
  const hardConstraints = constraints.filter((c) => c.type === 'HARD');
  const softConstraints = constraints.filter((c) => c.type === 'SOFT');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-blue-600" />
            <span>การกำหนดเงื่อนไขและการให้น้ำหนัก (Constraints & Weights)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Hard Constraints ต้องเป็น 0 (ห้ามละเมิด) ส่วน Soft Constraints ปรับค่าน้ำหนัก Penalty เพื่อให้ CP-SAT ทำการหาจุด Optimize ที่ดีที่สุด
          </p>
        </div>
      </div>

      {/* 2-Column Split: Hard vs Soft */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hard Constraints (10 Items) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <AlertOctagon className="w-4 h-4 text-rose-600" />
              <h3 className="font-bold text-sm text-slate-900">
                10 Hard Constraints (กฎเหล็กห้ามละเมิด)
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
              Non-Negotiable
            </span>
          </div>

          <div className="space-y-2.5">
            {hardConstraints.map((c, i) => (
              <div
                key={c.code}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] font-bold text-slate-400">#{i + 1}</span>
                    <h4 className="font-bold text-slate-900">{c.name}</h4>
                  </div>
                  <p className="text-[11px] text-slate-600">{c.description}</p>
                </div>
                <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                  บังคับ 100%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Soft Constraints (8 Items with Weight Sliders) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-900">
                8 Soft Constraints (การปรับแต่งค่าน้ำหนัก Penalty)
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
              Penalty Weights (1 - 20)
            </span>
          </div>

          <div className="space-y-3">
            {softConstraints.map((c, i) => (
              <div
                key={c.code}
                className="p-3 rounded-lg border border-slate-200 bg-white shadow-xs space-y-2 text-xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[10px] font-bold text-slate-400">S#{i + 1}</span>
                      <h4 className="font-bold text-slate-900">{c.name}</h4>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{c.description}</p>
                  </div>
                  <span className="font-mono font-bold text-indigo-700 text-xs px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200">
                    Weight: {c.weight}
                  </span>
                </div>

                {/* Slider */}
                <div className="flex items-center space-x-3 pt-1">
                  <span className="text-[10px] text-slate-400">น้อย</span>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={c.weight}
                    onChange={(e) => onUpdateWeight(c.code, Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                  />
                  <span className="text-[10px] text-slate-400">มาก</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
