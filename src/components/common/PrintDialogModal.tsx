import React, { useEffect, useState, useMemo } from 'react';
import {
  Printer,
  Download,
  ExternalLink,
  FileText,
  AlertCircle,
  Info,
  X,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import {
  generatePrintableDocumentHtml,
  openPrintableInNewTab,
  downloadPrintableHtmlFile,
} from '../../services/exportService';

interface PrintDialogModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  documentHtml: string;
  subtitle?: string;
  semesterName?: string;
  institutionName?: string;
  defaultOrientation?: 'portrait' | 'landscape';
}

export const PrintDialogModal: React.FC<PrintDialogModalProps> = ({
  isOpen,
  onClose,
  documentTitle,
  documentHtml,
  subtitle = '',
  semesterName = 'ภาคการศึกษา 1/2569',
  institutionName = 'มหาวิทยาลัยนครพนม',
  defaultOrientation = 'portrait',
}) => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(defaultOrientation);
  const [blobUrl, setBlobUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [printError, setPrintError] = useState<string | null>(null);

  // Synchronize default orientation when modal opens
  useEffect(() => {
    if (isOpen) {
      setOrientation(defaultOrientation);
    }
  }, [isOpen, defaultOrientation]);

  // Check if inside sandboxed iframe
  const isInIframe = useMemo(() => {
    try {
      return typeof window !== 'undefined' && window.self !== window.top;
    } catch {
      return true;
    }
  }, []);

  // Generate full HTML and Blob URL whenever documentHtml, orientation, or props change
  const fullHtml = useMemo(() => {
    return generatePrintableDocumentHtml(documentHtml, {
      title: documentTitle,
      subtitle,
      semesterName,
      institutionName,
      orientation,
    });
  }, [documentHtml, documentTitle, subtitle, semesterName, institutionName, orientation]);

  useEffect(() => {
    if (!isOpen || !fullHtml) return;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    setBlobUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [isOpen, fullHtml]);

  if (!isOpen) return null;

  const handleOpenNewTab = () => {
    setPrintError(null);
    const result = openPrintableInNewTab(fullHtml, documentTitle);
    if (!result.openedSuccessfully) {
      setPrintError('เบราว์เซอร์อาจบล็อกป๊อปอัป กรุณาคลิกลิงก์ด้านล่างเพื่อเปิดโดยตรง');
    }
  };

  const handleDownload = () => {
    const filename = `${documentTitle.replace(/[\/\s\\:*?"<>|]+/g, '_')}_${new Date().toISOString().slice(0, 10)}.html`;
    downloadPrintableHtmlFile(fullHtml, filename);
  };

  const handleDirectPrint = () => {
    setPrintError(null);
    try {
      window.print();
    } catch (err) {
      console.warn('Direct window.print() failed:', err);
      setPrintError('เบราว์เซอร์บล็อกการสั่งพิมพ์จากหน้าจอนี้ กรุณาใช้ปุ่ม "เปิดหน้าพิมพ์ในแท็บใหม่" ด้านบน');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#8B7D52] rounded-xl text-white">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                พิมพ์เอกสารและส่งออก PDF
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {documentTitle} • {semesterName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* iFrame Notice (Crucial for AI Studio Preview Environment) */}
          {isInIframe && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start space-x-3 text-amber-900 text-xs">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-amber-900">
                  กำลังใช้งานในหน้าจอพรีวิว (AI Studio Preview)
                </p>
                <p className="text-amber-800/90 leading-relaxed">
                  เนื่องจากเบราว์เซอร์จำกัดสิทธิ์หน้าต่างสั่งพิมพ์ (`window.print`) ในกรอบ iframe sandbox แนะนำให้กดปุ่ม{' '}
                  <span className="font-bold text-amber-950 underline">"เปิดหน้าพิมพ์ในแท็บใหม่"</span> ด้านล่างนี้ หรือกดปุ่มเปิดแท็บใหม่ที่แถบเครื่องมือด้านขวาบน เพื่อสั่งพิมพ์หรือบันทึก PDF ได้ทันที 100%
                </p>
              </div>
            </div>
          )}

          {printError && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start space-x-2.5 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="font-medium">{printError}</p>
            </div>
          )}

          {/* Orientation Selector */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                <span>การวางแนวหน้ากระดาษ (Page Orientation)</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                กำหนดทิศทางของเอกสาร A4 สำหรับการสั่งพิมพ์และบันทึกเป็น PDF
              </p>
            </div>
            <div className="inline-flex rounded-lg border border-slate-300 p-1 bg-white shadow-xs self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setOrientation('portrait')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  orientation === 'portrait'
                    ? 'bg-[#8B7D52] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>📄</span>
                <span>แนวตั้ง (Portrait)</span>
                <span className="text-[9.5px] bg-white/20 px-1 py-0.2 rounded font-normal">แนะนำ</span>
              </button>
              <button
                type="button"
                onClick={() => setOrientation('landscape')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  orientation === 'landscape'
                    ? 'bg-[#8B7D52] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>📑</span>
                <span>แนวนอน (Landscape)</span>
              </button>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="space-y-3">
            {/* Option 1: Open in New Tab (Highest Reliability) */}
            <div className="p-4 rounded-xl bg-blue-50/60 border-2 border-blue-500/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-blue-600 text-white rounded-md tracking-wider">
                    แนะนำสูงสุด
                  </span>
                  <h4 className="text-sm font-bold text-blue-950">
                    เปิดหน้าพิมพ์ในแท็บใหม่ (Open in New Tab)
                  </h4>
                </div>
                <p className="text-xs text-blue-800/80">
                  เปิดเอกสารทางการ 15 คาบ ({orientation === 'portrait' ? 'แนวตั้ง' : 'แนวนอน'}) ในหน้าต่างใหม่ พร้อมเปิดกล่องโต้ตอบสั่งพิมพ์และบันทึก PDF ทันที
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto shrink-0">
                <button
                  onClick={handleOpenNewTab}
                  className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>เปิดแท็บใหม่และพิมพ์</span>
                </button>
              </div>
            </div>

            {/* Direct Fallback Link in case popup blocked */}
            {blobUrl && (
              <div className="text-center text-xs text-slate-500">
                <span>หากแท็บไม่เปิดอัตโนมัติ: </span>
                <a
                  href={blobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-blue-600 hover:text-blue-800 underline inline-flex items-center space-x-1"
                >
                  <span>คลิกที่นี่เพื่อเปิดหน้าพิมพ์โดยตรง ({orientation === 'portrait' ? 'แนวตั้ง' : 'แนวนอน'})</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {/* Option 2 & 3 Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Option 2: Download HTML File */}
              <button
                onClick={handleDownload}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-left transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg w-fit mb-2.5">
                    <Download className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    ดาวน์โหลดไฟล์เอกสาร (.HTML)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    บันทึกไฟล์หน้าเอกสารทางการลงเครื่อง ({orientation === 'portrait' ? 'แนวตั้ง' : 'แนวนอน'}) เปิดดูและสั่งพิมพ์หรือแปลงเป็น PDF ได้ตลอดเวลาแม้ไม่มีอินเทอร์เน็ต
                  </p>
                </div>
                <div className="mt-3 text-[11px] font-semibold text-emerald-600 flex items-center space-x-1">
                  <span>ดาวน์โหลดไฟล์</span>
                  <span>→</span>
                </div>
              </button>

              {/* Option 3: Direct In-Page Print */}
              <button
                onClick={handleDirectPrint}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-left transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="p-2 bg-[#8B7D52]/15 text-[#8B7D52] rounded-lg w-fit mb-2.5">
                    <Printer className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#8B7D52] transition-colors">
                    สั่งพิมพ์ในหน้านี้ทันที (Browser Print)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    เรียกคำสั่งพิมพ์ของเบราว์เซอร์โดยตรง (เหมาะสำหรับกรณีเปิดเว็บแอปในแท็บปกติอยู่แล้ว)
                  </p>
                </div>
                <div className="mt-3 text-[11px] font-semibold text-[#8B7D52] flex items-center space-x-1">
                  <span>สั่งพิมพ์ทันที</span>
                  <span>→</span>
                </div>
              </button>
            </div>
          </div>

          {/* Recommended Print Settings Guide */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-2">
            <div className="flex items-center space-x-2 font-bold text-slate-800">
              <Sliders className="w-4 h-4 text-[#8B7D52]" />
              <span>คำแนะนำการตั้งค่าในหน้าพิมพ์ (Print / PDF Settings)</span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11.5px] pl-1">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span><strong>การวางแนว (Layout):</strong> {orientation === 'portrait' ? 'แนวตั้ง (Portrait)' : 'แนวนอน (Landscape)'}</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span><strong>ขนาดกระดาษ (Paper size):</strong> A4</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span><strong>กราฟิกพื้นหลัง:</strong> ติ๊กเลือก 'เปิด' (Background graphics)</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span><strong>ระยะขอบ (Margins):</strong> ค่าเริ่มต้น หรือ กำหนดเอง (5 มม.)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            ระบบจัดตารางเรียนตารางสอน • มหาวิทยาลัยนครพนม
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
