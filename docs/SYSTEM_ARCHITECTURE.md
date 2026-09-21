# Automated Timetable Scheduling System Architecture

## 1. Executive Summary & Technology Stack
The **Automated Timetable Scheduling System** is an enterprise-grade academic solution engineered to automate complex multi-variable course, room, instructor, and student group timetabling without human-introduced scheduling conflicts.

```
+-----------------------------------------------------------------------------------+
|                            CLIENT PRESENTATION LAYER                              |
|   Bootstrap 5 / Modern Dashboard UI | FullCalendar & Interactive Grid             |
|   Role-Based Views: Super Admin | Academic Admin | Dept Admin | Teacher | Student|
+-----------------------------------------------------------------------------------+
                                         |
                                         | (RESTful HTTPS / JSON / JWT)
                                         v
+-----------------------------------------------------------------------------------+
|                         APPLICATION & API LAYER (Laravel)                         |
|   - Controllers & Form Request Validation                                         |
|   - TimetableSchedulingService (Clean Architecture Orchestrator)                  |
|   - Repositories & Eloquent Models (SoftDeletes, Auditing)                         |
|   - Export Generators: Dompdf (Official PDF) & PhpSpreadsheet (Excel)             |
+-----------------------------------------------------------------------------------+
             |                                                  |
             | (Internal REST / RPC)                            | (MySQL Query / PDO)
             v                                                  v
+-------------------------------------+        +------------------------------------+
|     SCHEDULING ENGINE (Python)      |        |        DATABASE LAYER (MySQL)      |
|   - Google OR-Tools CP-SAT          |        |   - 25+ Normalized Entities        |
|   - Hard Constraints Formulation    |        |   - Foreign Keys & Indexes         |
|   - Soft Penalty Optimization       |        |   - Schedule Versions & History    |
|   - Alternative Slot Ranking        |        |   - Audit & Change Logs            |
+-------------------------------------+        +------------------------------------+
```

## 2. Component Architecture
1. **Laravel Web Application (API & Back-office)**
   - Manages Master Data CRUD (Semesters, Teachers, Rooms, Courses, Offerings, Constraints, Timeslots).
   - Validates user input before dispatching jobs.
   - Handles Versioning (`draft`, `review`, `published`, `archived`) and locks published schedules.
   - Enforces Role-Based Access Control (RBAC).

2. **Dedicated Scheduling Engine (Python + Google OR-Tools CP-SAT)**
   - Built with Constraint Programming (CP) via Satisfiability (SAT).
   - Variables: $x(session, day, slot, room) \in \{0, 1\}$.
   - Zero-conflict enforcement for 10 distinct Hard Constraints.
   - Cost-penalty minimization for 8 Soft Constraints.

3. **Database Layer (MySQL)**
   - Strict relational schema with foreign key integrity.
   - Soft delete enabled on master data to prevent orphan cascade accidents.
   - Audit trail capturing user actions, IP addresses, and before/after values.
