# Entity Relationship (ER) Diagram & Schema Specification

```mermaid
erDiagram
    USERS ||--o{ AUDIT_LOGS : performs
    ROLES ||--o{ USERS : assigns
    ROLES ||--o{ ROLE_HAS_PERMISSIONS : has
    PERMISSIONS ||--o{ ROLE_HAS_PERMISSIONS : includes

    ACADEMIC_YEARS ||--o{ SEMESTERS : contains
    FACULTIES ||--o{ DEPARTMENTS : has
    DEPARTMENTS ||--o{ PROGRAMS : offers
    EDUCATION_LEVELS ||--o{ PROGRAMS : categorizes
    PROGRAMS ||--o{ CURRICULUMS : defines
    PROGRAMS ||--o{ STUDENT_GROUPS : enrolls

    DEPARTMENTS ||--o{ COURSES : owns
    CURRICULUMS ||--o{ CURRICULUM_COURSES : prescribes
    COURSES ||--o{ CURRICULUM_COURSES : listed_in

    DEPARTMENTS ||--o{ TEACHERS : belongs_to
    TEACHERS ||--o{ TEACHER_WORKLOADS : tracks
    TEACHERS ||--o{ TEACHER_AVAILABILITY : submits
    TEACHERS ||--o{ TEACHER_PREFERENCES : prefers

    ROOM_TYPES ||--o{ ROOMS : classifies
    ROOM_TYPES ||--o{ COURSES : requires_default

    TIMESLOTS ||--o{ BLOCKED_TIMESLOTS : restricts
    TIMESLOTS ||--o{ SCHEDULE_ENTRIES : occupies

    SEMESTERS ||--o{ COURSE_OFFERINGS : schedules
    COURSES ||--o{ COURSE_OFFERINGS : instantiated_in
    STUDENT_GROUPS ||--o{ COURSE_OFFERINGS : attends
    TEACHERS ||--o{ COURSE_OFFERINGS : teaches
    ROOM_TYPES ||--o{ COURSE_OFFERINGS : needs

    COURSE_OFFERINGS ||--o{ COURSE_SESSIONS : splits_into
    SEMESTERS ||--o{ SCHEDULE_VERSIONS : organizes
    SCHEDULE_VERSIONS ||--o{ SCHEDULE_ENTRIES : contains
    COURSE_OFFERINGS ||--o{ SCHEDULE_ENTRIES : placed_as
    ROOMS ||--o{ SCHEDULE_ENTRIES : hosts

    SCHEDULE_VERSIONS ||--o{ CONFLICTS : logs
    SCHEDULE_VERSIONS ||--o{ SCHEDULE_CHANGE_LOGS : tracks
```

## Relational Constraints & Rules
- **Course Offering to Schedule Entry**: 1 Offering produces $N$ discrete session entries (e.g. 4 hours split into $2 + 2$ consecutive periods).
- **Cascade Deletes**:
  - Soft deletes on Master Data (`courses`, `teachers`, `rooms`, `student_groups`) preserve historic schedules.
  - Cascades apply only on transient/child entries (`schedule_entries`, `conflicts` when a version is deleted).
- **Immutability of Published Schedules**:
  - When `schedule_versions.status = 'published'`, updates are rejected. A new `draft` version must be branched.
