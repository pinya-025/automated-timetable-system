# ระบบจัดตารางเรียนตารางสอนอัตโนมัติ (Automated Timetable Scheduling System)

ระบบบริหารจัดการและจัดตารางเรียนตารางสอนอัตโนมัติระดับสถาบันการศึกษา (วิทยาลัย / มหาวิทยาลัย) พัฒนาด้วยเทคโนโลยีเว็บสมัยใหม่ **React 19, TypeScript, Vite, Tailwind CSS** พร้อมรองรับการเชื่อมโยงฐานข้อมูล **Supabase (PostgreSQL)** และการคำนวณด้วย **Google OR-Tools CP-SAT (Constraint Programming Solver)**

---

## 🌟 ฟีเจอร์หลัก (Key Features)

1. **Interactive Timetable Grid & Drag & Drop**: แสดงตารางสอนรายสัปดาห์แบบ Matrix (15 คาบเรียน 06:00 - 21:00 น.) ปรับย้ายคาบเรียนได้สะดวก
2. **Real-time Conflict Detection (10 Hard Constraints)**:
   - ป้องกันอาจารย์สอนซ้อนเวลา (Teacher Conflict)
   - ป้องกันการใช้ห้องเรียนชนกัน (Room Conflict)
   - ป้องกันกลุ่มนักเรียนมีตารางชนกัน (Student Group Conflict)
   - ตรวจสอบความจุห้องเรียน (Room Capacity) และประเภทห้อง (Room Type Match เช่น Computer Lab, Media Lab)
   - ป้องกันการจัดสอนในช่วงพักเที่ยง (คาบ 7: 12:00-13:00 น.) และกิจกรรมวันพุธ (คาบ 10: 15:00-16:00 น.)
   - ตรวจสอบภารกิจและเวลาว่างของอาจารย์ (Teacher Availability)
3. **Multi-Engine Scheduling Optimization**:
   - **In-Browser Heuristic Engine**: ระบบประมวลผลอัลกอริทึม Minimum Remaining Values (MRV) บนเบราว์เซอร์ ทำงานได้ 100% ทันทีโดยไม่ต้องเปิดเซิร์ฟเวอร์
   - **Google OR-Tools CP-SAT Python Microservice**: รองรับการยิงเชื่อมต่อไปยัง Optimization API พอร์ต 8001 เพื่อคำนวณผลลัพธ์ที่แม่นยำสูงสุดระดับสมการคณิตศาสตร์
4. **Suggest Alternative Slot**: แนะนำช่วงเวลาว่างที่ดีที่สุดอัตโนมัติ (Zero Conflict Recommendation)
5. **Version Management**: จัดการเวอร์ชันตาราง (Draft, Review, Published, Archived) และระบบล็อคตารางที่ประกาศใช้งานจริง
6. **Official Timetable Document (A4 Print Ready)**: สร้างเอกสารตารางสอนทางการตามระเบียบมหาวิทยาลัย พร้อมบล็อกลงนาม 4 ตำแหน่ง (อาจารย์ผู้สอน, หัวหน้าสาขา, หัวหน้างานหลักสูตร, คณบดี/รองอธิการบดี)
7. **5 Role-Based Access Control (RBAC)**:
   - `super_admin` (ผู้ดูแลระบบสูงสุด)
   - `academic_admin` (เจ้าหน้าที่ฝ่ายวิชาการ/จัดตาราง)
   - `department_admin` (หัวหน้าสาขาวิชา/แผนก)
   - `teacher` (อาจารย์ผู้สอน)
   - `student` (นักเรียน/นักศึกษา)

---

## 🚀 วิธีการ Deploy ขึ้น Vercel (Deployment to Vercel)

โปรเจกต์นี้ได้รับการตั้งค่า `vercel.json` และ Code Splitting ไว้เรียบร้อยแล้ว สามารถนำขึ้น Vercel ได้ 2 วิธี:

### วิธีที่ 1: Deploy ผ่าน GitHub (แนะนำ สะดวกและมี CI/CD อัตโนมัติ)

1. **สร้าง Git Repository บนเครื่องของคุณ**:
   ```bash
   git add .
   git commit -m "feat: ready for vercel production deployment"
   ```

2. **สร้าง Repository ใหม่บน [GitHub.com](https://github.com/new)** (เช่นชื่อ `automated-timetable-system`)

3. **เชื่อมโยงและ Push โค้ดขึ้น GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/automated-timetable-system.git
   git branch -M main
   git push -u origin main
   ```

4. **Import เข้า Vercel**:
   - เข้าเว็บไซต์ [vercel.com](https://vercel.com) แล้วล็อกอิน
   - กดปุ่ม **"Add New..."** -> **"Project"**
   - เลือก Repository ที่เพิ่ง Push ขึ้นไป แล้วกด **"Import"**
   - การตั้งค่า Build Settings (Vercel จะตรวจจับให้อัตโนมัติ):
     - **Framework Preset**: `Vite`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
   - *(ทางเลือก)* กำหนด Environment Variables:
     - `VITE_SUPABASE_URL`: URL ของ Supabase Project (ถ้าใช้งาน Cloud Database)
     - `VITE_SUPABASE_ANON_KEY`: Anon Key ของ Supabase
   - กดปุ่ม **"Deploy"** ระบบจะ Build และให้ URL พร้อมใช้งานทันที เช่น `https://your-project.vercel.app` 🎉

---

### วิธีที่ 2: Deploy ผ่าน Vercel CLI โดยตรง

1. เปิด Terminal ในโฟลเดอร์โปรเจกต์
2. ติดตั้ง Vercel CLI หรือเรียกผ่าน npx:
   ```bash
   npm i -g vercel
   ```
3. สั่ง Deploy ขึ้น Production:
   ```bash
   vercel --prod
   ```
4. ล็อกอินผ่าน Browser ตามที่ CLI แนะนำ และกดยืนยันการตั้งค่า (ค่า Default ทั้งหมด)

---

## 💻 วิธีการรันโปรเจกต์ในเครื่อง (Run Locally)

### 1. รัน Frontend Web App (โหมด Development)
```bash
# ติดตั้ง dependencies
npm install

# รัน Vite Dev Server (พอร์ต 3000)
npm run dev
```
เปิดบราวเซอร์ที่ `http://localhost:3000`

### 2. รัน Frontend ในโหมด Production Server
```bash
# Build ไฟล์ Production
npm run build

# รัน Production Express Server
npm start
```
เปิดบราวเซอร์ที่ `http://localhost:3000`

---

## 🐍 รัน Google OR-Tools CP-SAT Microservice (Python)

สำหรับผู้ที่ต้องการความสามารถในการแก้ปัญหาขั้นสูงด้วย Constraint Programming:

```bash
cd scheduling-engine

# สร้างและเปิดใช้งาน venv
python -m venv venv
.\venv\Scripts\activate   # สำหรับ Windows
# source venv/bin/activate  # สำหรับ macOS / Linux

# ติดตั้ง requirements (Google OR-Tools, FastAPI, Uvicorn)
pip install -r requirements.txt

# สตาร์ท API Microservice (พอร์ต 8001)
uvicorn api:app --host 0.0.0.0 --port 8001 --reload
```
ตรวจสอบสถานะ API ได้ที่ `http://localhost:8001/docs`

---

## 🗄️ การตั้งค่าฐานข้อมูล Supabase (Free Cloud PostgreSQL)

หากต้องการให้ผู้ใช้งานหลายคนสามารถแก้ไขข้อมูลร่วมกันผ่าน Cloud Database:
1. สมัครใช้งานฟรีที่ [supabase.com](https://supabase.com) และสร้าง Project ใหม่
2. ไปที่เมนู **SQL Editor** ใน Supabase Dashboard
3. คัดลอกคำสั่ง SQL จากไฟล์ [`docs/database/supabase_schema.sql`](docs/database/supabase_schema.sql) ไปวางแล้วกด **Run**
4. นำ **Project URL** และ **Anon Key** จากหน้า *Project Settings -> API* มาใส่ใน:
   - หน้าเว็บ: เมนู **ตั้งค่าระบบ (System Settings)** -> การเชื่อมต่อ Supabase
   - หรือใส่ในไฟล์ `.env.local`

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```
├── docs/                     # สถาปัตยกรรมระบบ, ER Diagram และ Database Schema
│   └── database/
│       └── supabase_schema.sql # SQL Schema สมบูรณ์สำหรับ Supabase
├── scheduling-engine/        # Python FastAPI + Google OR-Tools CP-SAT Solver
│   ├── api.py               # REST API endpoints
│   ├── solver.py            # CP-SAT Constraint solver logic
│   ├── models.py            # Pydantic data schemas
│   └── requirements.txt     # Python dependencies
├── src/                      # React Frontend Source Code
│   ├── components/          # Dashboard, TimetableGrid, Modals, CRUD
│   ├── data/                # Initial seed data (มหาวิทยาลัยนครพนม)
│   ├── lib/                 # Supabase client & sync utilities
│   ├── services/            # In-Browser Scheduler Engine & Export
│   ├── types/               # TypeScript interfaces
│   └── App.tsx              # Main App Controller
├── dist/                     # Optimized Production Bundle
├── server.js                 # Production Express Web Server
├── vercel.json               # Vercel Deployment Configuration
└── vite.config.ts            # Vite Build & Manual Chunks Configuration
```
