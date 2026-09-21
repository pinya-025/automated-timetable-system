import React, { useState } from 'react';
import {
  Layers,
  CheckCircle,
  Clock,
  Archive,
  Copy,
  Lock,
  ArrowRight,
  ShieldAlert,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { ScheduleVersion, ScheduleEntry } from '../../types';

interface VersionManagerProps {
  versions: ScheduleVersion[];
  activeVersionId: number;
  onSelectVersion: (id: number) => void;
  onPublishVersion: (id: number) => void;
  onDuplicateVersion: (id: number) => void;
}

export const VersionManager: React.FC<VersionManagerProps> = ({
  versions,
  activeVersionId,
  onSelectVersion,
  onPublishVersion,
  onDuplicateVersion,
}) => {
  const [publishModalVersionId, setPublishModalVersionId] = useState<number | null>(null);

  const getStatusBadge = (status: ScheduleVersion['status']) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            <span>PUBLISHED (ใช้งานจริง)</span>
          </span>
        );
      case 'review':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>REVIEW (รอตรวจสอบ)</span>
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <Archive className="w-3 h-3 text-slate-500" />
            <span>ARCHIVED (จัดเก็บ)</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
            <span>DRAFT (ฉบับร่าง)</span>
          </span>
        );
    }
  };

  const selectedForPublish = versions.find((v) => v.id === publishModalVersionId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <span>การจัดการเวอร์ชันของตาราง (Schedule Versioning)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            รองรับการแตกแขนง Draft ทดลองจัดตาราง, การเปรียบเทียบผลลัพธ์ และการ Publish ตารางทางการแบบล็อกสิทธิ์
          </p>
        </div>
      </div>

      {/* Version Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase text-[11px]">
              <th className="py-3 px-4">เวอร์ชัน / ชื่อ</th>
              <th className="py-3 px-4">สถานะ</th>
              <th className="py-3 px-4 text-center">Constraint Score</th>
              <th className="py-3 px-4 text-center">Hard Conflicts</th>
              <th className="py-3 px-4 text-center">Soft Penalty</th>
              <th className="py-3 px-4">ผู้สร้าง</th>
              <th className="py-3 px-4">วันที่บันทึก</th>
              <th className="py-3 px-4 text-right">การกระทำ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {versions.map((ver) => {
              const isActive = ver.id === activeVersionId;
              const isPublished = ver.status === 'published';

              return (
                <tr
                  key={ver.id}
                  className={`hover:bg-slate-50/60 transition-colors ${
                    isActive ? 'bg-blue-50/40 font-medium' : ''
                  }`}
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-2">
                      {isActive && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" title="กำลังใช้งานหน้านี้" />
                      )}
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{ver.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">v{ver.version_number}.0</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">{getStatusBadge(ver.status)}</td>

                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-block font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">
                      {ver.score}%
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    {ver.hard_conflict_count === 0 ? (
                      <span className="text-emerald-600 font-bold">0</span>
                    ) : (
                      <span className="text-rose-600 font-bold px-2 py-0.5 rounded bg-rose-50 border border-rose-200">
                        {ver.hard_conflict_count} รายการ
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-center font-mono text-slate-600">
                    {ver.soft_penalty_score}
                  </td>

                  <td className="py-3.5 px-4 text-slate-600">{ver.created_by}</td>

                  <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                    {new Date(ver.created_at).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>

                  <td className="py-3.5 px-4 text-right space-x-2">
                    {!isActive && (
                      <button
                        onClick={() => onSelectVersion(ver.id)}
                        className="px-2.5 py-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded border border-slate-200 transition-colors"
                      >
                        สลับมาดู
                      </button>
                    )}

                    <button
                      onClick={() => onDuplicateVersion(ver.id)}
                      title="คัดลอกเป็น Draft ใหม่"
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors inline-flex items-center"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    {!isPublished && (
                      <button
                        onClick={() => setPublishModalVersionId(ver.id)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold shadow-xs transition-colors"
                      >
                        Publish
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Publish Confirmation Modal */}
      {publishModalVersionId && selectedForPublish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">ยืนยันการประกาศใช้งาน (Publish)</h3>
                <p className="text-xs text-slate-500">เวอร์ชัน: {selectedForPublish.name}</p>
              </div>
            </div>

            {selectedForPublish.hard_conflict_count > 0 ? (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start space-x-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">ไม่สามารถ Publish ได้!</strong>
                  <p className="mt-0.5">
                    ตารางนี้ยังมีข้อขัดแย้ง Hard Conflict อยู่ {selectedForPublish.hard_conflict_count} รายการ
                    ระบบอนุญาตให้ประกาศเฉพาะตารางที่มี Hard Conflict = 0 เท่านั้น
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-slate-600">
                <p>เมื่อกด Publish ระบบจะดำเนินการดังต่อไปนี้โดยอัตโนมัติ:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>ปรับสถานะเวอร์ชันนี้เป็น <strong>PUBLISHED</strong></li>
                  <li>ปรับเวอร์ชันก่อนหน้าให้เป็น <strong>ARCHIVED</strong></li>
                  <li>
                    <strong>ล็อกตาราง</strong> ป้องกันไม่ให้แก้ไขด้วย Drag & Drop โดยตรงเพื่อรักษาความถูกต้อง
                  </li>
                  <li>เปิดสิทธิ์ให้อาจารย์และนักศึกษาดูตารางเรียนทางการ</li>
                </ul>
              </div>
            )}

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setPublishModalVersionId(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                ยกเลิก
              </button>
              {selectedForPublish.hard_conflict_count === 0 && (
                <button
                  type="button"
                  onClick={() => {
                    onPublishVersion(selectedForPublish.id);
                    setPublishModalVersionId(null);
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs"
                >
                  ยืนยัน Publish
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
