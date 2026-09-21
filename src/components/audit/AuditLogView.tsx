import React from 'react';
import { History as HistoryIcon, Move, User, Clock, Shield } from 'lucide-react';
import { ScheduleChangeLog, AuditLog } from '../../types';
import { getDayName } from '../../services/schedulerEngine';

interface AuditLogViewProps {
  changeLogs: ScheduleChangeLog[];
  auditLogs: AuditLog[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ changeLogs, auditLogs }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
            <HistoryIcon className="w-5 h-5 text-blue-600" />
            <span>ประวัติการแก้ไขและ Audit Logs (Change History)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            บันทึกประวัติการย้ายคาบเรียนด้วย Drag & Drop, การจัดตารางอัตโนมัติ, ผู้ดำเนินการ และ IP Address
          </p>
        </div>
      </div>

      {/* Schedule Drag & Drop Change Logs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
        <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
          <Move className="w-4 h-4 text-blue-600" />
          <span>ประวัติการปรับย้ายคาบเรียน (Schedule Move Logs)</span>
        </h3>

        <div className="divide-y divide-slate-100 text-xs">
          {changeLogs.length === 0 ? (
            <p className="py-6 text-center text-slate-400">ยังไม่มีประวัติการปรับย้ายคาบเรียนในระบบ</p>
          ) : (
            changeLogs.map((log) => (
              <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">{log.course_name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                      ย้ายตำแหน่ง
                    </span>
                  </div>
                  <p className="text-slate-600">
                    จาก: <strong className="text-slate-800">{getDayName(log.old_day)} คาบ {log.old_period_start} ({log.old_room_name})</strong> &rarr; เป็น:{' '}
                    <strong className="text-blue-700">{getDayName(log.new_day)} คาบ {log.new_period_start} ({log.new_room_name})</strong>
                  </p>
                  <p className="text-[11px] text-slate-400">เหตุผล: {log.reason}</p>
                </div>

                <div className="text-right text-[11px] text-slate-500 font-mono shrink-0">
                  <div className="font-semibold text-slate-700">{log.user_name}</div>
                  <div>{new Date(log.created_at).toLocaleString('th-TH')}</div>
                  <div className="text-slate-400 text-[10px]">IP: {log.ip_address}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* System Audit Trail */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
        <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
          <Shield className="w-4 h-4 text-indigo-600" />
          <span>บันทึกการกระทำของผู้ใช้ (System Audit Trail)</span>
        </h3>

        <div className="divide-y divide-slate-100 text-xs">
          {auditLogs.map((log) => (
            <div key={log.id} className="py-2.5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                  {log.action}
                </span>
                <span className="font-medium text-slate-800">{log.entity_type} #{log.entity_id}</span>
                <span className="text-slate-500">โดย {log.user_name}</span>
              </div>
              <span className="font-mono text-[11px] text-slate-400">
                {new Date(log.created_at).toLocaleTimeString('th-TH')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
