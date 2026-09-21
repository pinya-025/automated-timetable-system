import { ScheduleEntry, CourseOffering, Course, Teacher, StudentGroup, Room, Timeslot, AppSettings, Semester } from '../types';
import { getDayName, getDayShortName } from './schedulerEngine';

export function exportScheduleToCsv(
  entries: ScheduleEntry[],
  offerings: CourseOffering[],
  courses: Course[],
  teachers: Teacher[],
  groups: StudentGroup[],
  rooms: Room[],
  timeslots: Timeslot[],
  title: string
) {
  const offeringMap = new Map(offerings.map((o) => [o.id, o]));
  const courseMap = new Map(courses.map((c) => [c.id, c]));
  const teacherMap = new Map(teachers.map((t) => [t.id, t]));
  const groupMap = new Map(groups.map((g) => [g.id, g]));
  const roomMap = new Map(rooms.map((r) => [r.id, r]));
  const slotMap = new Map(timeslots.map((s) => [s.id, s]));

  const headers = ['วัน', 'เวลาเริ่ม', 'เวลาสิ้นสุด', 'รหัสวิชา', 'ชื่อวิชา', 'กลุ่มเรียน', 'อาจารย์ผู้สอน', 'ห้องเรียน', 'อาคาร'];
  
  const rows = entries.map((e) => {
    const off = offeringMap.get(e.course_offering_id);
    const crs = off ? courseMap.get(off.course_id) : null;
    const tch = off ? teacherMap.get(off.teacher_id) : null;
    const grp = off ? groupMap.get(off.student_group_id) : null;
    const rm = roomMap.get(e.room_id);
    const sSlot = slotMap.get(e.start_timeslot_id);
    const eSlot = slotMap.get(e.end_timeslot_id);

    return [
      `"${getDayName(e.day_of_week)}"`,
      `"${sSlot ? sSlot.start_time : ''}"`,
      `"${eSlot ? eSlot.end_time : ''}"`,
      `"${crs ? crs.code : ''}"`,
      `"${crs ? crs.name_th : ''}"`,
      `"${grp ? grp.name : ''}"`,
      `"${tch ? tch.prefix + tch.name : ''}"`,
      `"${rm ? rm.room_number : ''}"`,
      `"${rm ? rm.building : ''}"`,
    ];
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export interface PrintableDocumentOptions {
  title: string;
  subtitle?: string;
  institutionName?: string;
  semesterName?: string;
  orientation?: 'portrait' | 'landscape';
}

export function generatePrintableDocumentHtml(
  contentHtml: string,
  options: PrintableDocumentOptions
): string {
  const {
    title,
    subtitle = '',
    institutionName = 'มหาวิทยาลัยนครพนม',
    semesterName = 'ภาคการศึกษา 1/2569',
    orientation = 'portrait',
  } = options;

  const isPortrait = orientation === 'portrait';

  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - ${institutionName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.cdnfonts.com/css/google-sans" rel="stylesheet">
  <link href="https://fonts.cdnfonts.com/css/google-sans-2" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@400;500;600;700&family=Sarabun:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style id="page-orientation-style">
    @page {
      size: A4 ${orientation};
      margin: 5mm;
    }
  </style>
  <style>
    @media print {
      .screen-only-header {
        display: none !important;
      }
      body {
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .print-page-container {
        max-width: 100% !important;
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        box-shadow: none !important;
      }
      table {
        min-width: 0 !important;
        width: 100% !important;
      }
    }
    *, body, button, input, select, table, th, td {
      font-family: 'Google Sans', 'Google Sans Text', 'Product Sans', 'Prompt', 'Sarabun', -apple-system, sans-serif;
    }
    body {
      margin: 0;
      padding: 0;
      background: #f8fafc;
      color: #0f172a;
    }
    .screen-only-header {
      position: sticky;
      top: 0;
      z-index: 999;
      background: #0f172a;
      color: #ffffff;
      padding: 12px 24px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .screen-only-header h1 {
      font-size: 15px;
      font-weight: 700;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .action-btn {
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
    }
    .btn-primary {
      background: #8B7D52;
      color: #ffffff;
    }
    .btn-primary:hover {
      background: #756841;
    }
    .btn-secondary {
      background: #334155;
      color: #ffffff;
    }
    .btn-secondary:hover {
      background: #475569;
    }
    .print-page-container {
      max-width: ${isPortrait ? '850px' : '1240px'};
      margin: 20px auto;
      background: #ffffff;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      transition: max-width 0.2s ease;
    }
    table {
      border-collapse: collapse;
      width: 100%;
    }
  </style>
</head>
<body>
  <div class="screen-only-header">
    <div>
      <h1>
        <span>🏛️</span>
        <span>${institutionName} - เอกสารตารางเรียนตารางสอนมาตรฐาน 15 คาบ</span>
      </h1>
      <p style="font-size: 11px; color: #94a3b8; margin: 3px 0 0 0;">
        ${title} • ${semesterName} ${subtitle ? '• ' + subtitle : ''}
      </p>
    </div>
    <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
      <!-- Orientation Switcher -->
      <div style="display: inline-flex; background: #1e293b; border-radius: 8px; padding: 3px; gap: 3px; align-items: center; border: 1px solid #334155;">
        <button id="btn-portrait" type="button" class="action-btn" style="padding: 6px 12px; font-size: 12px; background: ${isPortrait ? '#8B7D52' : 'transparent'}; color: white;" onclick="setOrientation('portrait')">
          📄 แนวตั้ง (Portrait)
        </button>
        <button id="btn-landscape" type="button" class="action-btn" style="padding: 6px 12px; font-size: 12px; background: ${!isPortrait ? '#8B7D52' : 'transparent'}; color: white;" onclick="setOrientation('landscape')">
          📑 แนวนอน (Landscape)
        </button>
      </div>

      <button class="action-btn btn-primary" onclick="window.print()">
        <svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <polyline points="6 9 6 2 18 2 18 9"></polyline>
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
          <rect x="6" y="14" width="12" height="8"></rect>
        </svg>
        <span>สั่งพิมพ์ / บันทึก PDF</span>
      </button>
      <button class="action-btn btn-secondary" onclick="window.close()">
        <span>ปิดหน้าต่าง</span>
      </button>
    </div>
  </div>

  <div class="print-page-container">
    ${contentHtml}
  </div>

  <script>
    function setOrientation(mode) {
      var style = document.getElementById('page-orientation-style');
      if (style) {
        style.innerHTML = '@page { size: A4 ' + mode + '; margin: 5mm; }';
      }
      var btnP = document.getElementById('btn-portrait');
      var btnL = document.getElementById('btn-landscape');
      var container = document.querySelector('.print-page-container');
      if (mode === 'portrait') {
        if (btnP) btnP.style.background = '#8B7D52';
        if (btnL) btnL.style.background = 'transparent';
        if (container) container.style.maxWidth = '850px';
      } else {
        if (btnP) btnP.style.background = 'transparent';
        if (btnL) btnL.style.background = '#8B7D52';
        if (container) container.style.maxWidth = '1240px';
      }
    }

    window.addEventListener('load', function() {
      // Delay print trigger slightly to ensure web fonts and styles render
      setTimeout(function() {
        try {
          window.print();
        } catch (e) {
          console.warn('Auto-print blocked:', e);
        }
      }, 400);
    });
  </script>
</body>
</html>`;
}

export function openPrintableInNewTab(
  fullHtml: string,
  title: string
): { blobUrl: string; openedSuccessfully: boolean } {
  try {
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const newWindow = window.open(blobUrl, '_blank');
    return { blobUrl, openedSuccessfully: !!newWindow };
  } catch (err) {
    console.error('Error opening printable document in new tab:', err);
    return { blobUrl: '', openedSuccessfully: false };
  }
}

export function downloadPrintableHtmlFile(fullHtml: string, filename: string): void {
  try {
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  } catch (err) {
    console.error('Error downloading printable HTML file:', err);
  }
}

export function printScheduleDocument(
  title: string,
  subtitle: string,
  institutionName: string,
  semesterName: string,
  gridDataHtml: string
) {
  const fullHtml = generatePrintableDocumentHtml(gridDataHtml, {
    title,
    subtitle,
    institutionName,
    semesterName,
  });

  const result = openPrintableInNewTab(fullHtml, title);
  if (!result.openedSuccessfully) {
    // Fallback to in-page print if popup fails
    try {
      window.print();
    } catch {
      // Ignore if blocked
    }
  }
}
