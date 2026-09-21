<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations for the complete Automated Timetable Scheduling System.
     */
    public function up(): void
    {
        // 1. Roles & Permissions (RBAC)
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // super_admin, academic_admin, department_admin, teacher, student
            $table->string('display_name');
            $table->string('description')->nullable();
            $table->timestamps();
        });

        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // e.g. schedule.generate, schedule.publish, course.create
            $table->string('display_name');
            $table->timestamps();
        });

        Schema::create('role_has_permissions', function (Blueprint $table) {
            $table->foreignId('role_id')->constrained('roles')->onDelete('cascade');
            $table->foreignId('permission_id')->constrained('permissions')->onDelete('cascade');
            $table->primary(['role_id', 'permission_id']);
        });

        // 2. Users
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->foreignId('role_id')->constrained('roles');
            $table->unsignedBigInteger('department_id')->nullable()->index();
            $table->unsignedBigInteger('teacher_id')->nullable()->index();
            $table->unsignedBigInteger('student_group_id')->nullable()->index();
            $table->boolean('is_active')->default(true);
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();
        });

        // 3. Academic Structure
        Schema::create('academic_years', function (Blueprint $table) {
            $table->id();
            $table->string('year_th', 4)->unique(); // 2567
            $table->string('year_en', 4); // 2024
            $table->boolean('is_current')->default(false);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('semesters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academic_year_id')->constrained('academic_years')->onDelete('cascade');
            $table->unsignedTinyInteger('term'); // 1, 2, 3
            $table->string('name'); // ภาคเรียนที่ 1/2567
            $table->date('start_date');
            $table->date('end_date');
            $table->boolean('is_current')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['academic_year_id', 'term']);
        });

        Schema::create('faculties', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('faculty_id')->constrained('faculties')->onDelete('cascade');
            $table->string('code')->unique();
            $table->string('name');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('education_levels', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // VOC, HVOC, BACHELOR
            $table->string('name'); // ปวช., ปวส., ปริญญาตรี
            $table->timestamps();
        });

        Schema::create('programs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('department_id')->constrained('departments')->onDelete('cascade');
            $table->foreignId('education_level_id')->constrained('education_levels');
            $table->string('code')->unique();
            $table->string('name');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('curriculums', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained('programs')->onDelete('cascade');
            $table->string('code');
            $table->string('name');
            $table->string('start_year', 4);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('student_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained('programs');
            $table->foreignId('department_id')->constrained('departments');
            $table->string('code')->unique(); // e.g. BC66-1
            $table->string('name'); // ปวส.2 คอมพิวเตอร์ธุรกิจ ก.1
            $table->unsignedTinyInteger('year_level'); // 1, 2, 3, 4
            $table->unsignedSmallInteger('student_count');
            $table->unsignedBigInteger('advisor_teacher_id')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // 4. Rooms & Room Types
        Schema::create('room_types', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // LEC, LAB, NET_LAB, MEDIA_LAB
            $table->string('name');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_type_id')->constrained('room_types');
            $table->string('building');
            $table->unsignedTinyInteger('floor');
            $table->string('room_number')->unique();
            $table->unsignedSmallInteger('capacity');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        // 5. Courses
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('department_id')->constrained('departments');
            $table->string('code')->unique();
            $table->string('name_th');
            $table->string('name_en');
            $table->unsignedTinyInteger('credits');
            $table->unsignedTinyInteger('theory_hours');
            $table->unsignedTinyInteger('practice_hours');
            $table->foreignId('default_room_type_id')->constrained('room_types');
            $table->boolean('is_heavy')->default(false);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('curriculum_courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('curriculum_id')->constrained('curriculums')->onDelete('cascade');
            $table->foreignId('course_id')->constrained('courses')->onDelete('cascade');
            $table->unsignedTinyInteger('suggested_semester');
            $table->timestamps();
        });

        // 6. Teachers & Availability
        Schema::create('teachers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('department_id')->constrained('departments');
            $table->string('prefix', 20); // ดร., อ., ผศ.
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone', 20)->nullable();
            $table->unsignedTinyInteger('max_periods_per_week')->default(18);
            $table->unsignedTinyInteger('max_periods_per_day')->default(6);
            $table->unsignedTinyInteger('max_consecutive_periods')->default(3);
            $table->string('color_code', 10)->default('#3b82f6');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('teacher_workloads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained('teachers')->onDelete('cascade');
            $table->foreignId('semester_id')->constrained('semesters')->onDelete('cascade');
            $table->unsignedTinyInteger('assigned_theory_hours')->default(0);
            $table->unsignedTinyInteger('assigned_practice_hours')->default(0);
            $table->unsignedTinyInteger('total_assigned_hours')->default(0);
            $table->timestamps();

            $table->unique(['teacher_id', 'semester_id']);
        });

        Schema::create('teacher_availability', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained('teachers')->onDelete('cascade');
            $table->unsignedTinyInteger('day_of_week'); // 1 = Mon .. 5 = Fri
            $table->unsignedTinyInteger('timeslot_id');
            $table->boolean('is_available')->default(true);
            $table->timestamps();

            $table->unique(['teacher_id', 'day_of_week', 'timeslot_id']);
        });

        Schema::create('teacher_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained('teachers')->onDelete('cascade');
            $table->unsignedTinyInteger('day_of_week');
            $table->unsignedTinyInteger('timeslot_id');
            $table->unsignedTinyInteger('preference_level')->default(2); // 1 = low, 2 = normal, 3 = preferred
            $table->timestamps();

            $table->unique(['teacher_id', 'day_of_week', 'timeslot_id']);
        });

        // 7. Timeslots & Blocked Timeslots
        Schema::create('timeslots', function (Blueprint $table) {
            $table->id();
            $table->unsignedTinyInteger('period_number'); // 1 - 9
            $table->time('start_time'); // 08:00:00
            $table->time('end_time'); // 09:00:00
            $table->string('label');
            $table->boolean('is_lunch')->default(false);
            $table->timestamps();
        });

        Schema::create('blocked_timeslots', function (Blueprint $table) {
            $table->id();
            $table->unsignedTinyInteger('day_of_week')->default(0); // 0 = all days, 1-5 = Mon-Fri
            $table->unsignedBigInteger('timeslot_id')->nullable();
            $table->time('start_time');
            $table->time('end_time');
            $table->enum('type', ['LUNCH', 'ACTIVITY', 'MEETING', 'HOLIDAY', 'SPECIAL_EVENT']);
            $table->string('title');
            $table->enum('applies_to', ['ALL', 'STUDENT_GROUP', 'TEACHER'])->default('ALL');
            $table->unsignedBigInteger('target_id')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        // 8. Course Offerings & Sessions
        Schema::create('course_offerings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('semester_id')->constrained('semesters')->onDelete('cascade');
            $table->foreignId('course_id')->constrained('courses');
            $table->foreignId('student_group_id')->constrained('student_groups');
            $table->foreignId('teacher_id')->constrained('teachers');
            $table->foreignId('room_type_id')->constrained('room_types');
            $table->unsignedSmallInteger('student_count');
            $table->unsignedTinyInteger('sessions_per_week')->default(1);
            $table->json('periods_per_session'); // e.g. [2, 2]
            $table->boolean('must_be_consecutive')->default(true);
            $table->unsignedTinyInteger('max_sessions_per_day')->default(1);
            $table->foreignId('preferred_room_id')->nullable()->constrained('rooms');
            $table->boolean('is_fixed')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['semester_id', 'teacher_id']);
            $table->index(['semester_id', 'student_group_id']);
        });

        Schema::create('course_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_offering_id')->constrained('course_offerings')->onDelete('cascade');
            $table->unsignedTinyInteger('session_index'); // 0, 1
            $table->unsignedTinyInteger('period_length'); // 2, 3
            $table->timestamps();
        });

        // 9. Constraints & Weights
        Schema::create('constraints', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('type', ['HARD', 'SOFT']);
            $table->unsignedInteger('weight')->default(10);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 10. Schedule Versions & Entries
        Schema::create('schedule_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('semester_id')->constrained('semesters')->onDelete('cascade');
            $table->unsignedInteger('version_number');
            $table->string('name');
            $table->enum('status', ['draft', 'review', 'published', 'archived'])->default('draft');
            $table->decimal('score', 5, 2)->default(0.00);
            $table->unsignedInteger('hard_conflict_count')->default(0);
            $table->unsignedInteger('soft_penalty_score')->default(0);
            $table->text('notes')->nullable();
            $table->string('created_by');
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['semester_id', 'version_number']);
        });

        Schema::create('schedule_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('schedule_version_id')->constrained('schedule_versions')->onDelete('cascade');
            $table->foreignId('course_offering_id')->constrained('course_offerings');
            $table->unsignedTinyInteger('session_index')->default(0);
            $table->unsignedTinyInteger('period_length')->default(2);
            $table->unsignedTinyInteger('day_of_week'); // 1 - 5
            $table->unsignedTinyInteger('start_timeslot_id');
            $table->unsignedTinyInteger('end_timeslot_id');
            $table->foreignId('room_id')->constrained('rooms');
            $table->boolean('is_locked')->default(false);
            $table->timestamps();

            $table->index(['schedule_version_id', 'day_of_week', 'start_timeslot_id']);
            $table->index(['room_id', 'day_of_week', 'start_timeslot_id']);
        });

        // 11. Conflicts & Logs
        Schema::create('conflicts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('schedule_version_id')->constrained('schedule_versions')->onDelete('cascade');
            $table->enum('severity', ['ERROR', 'WARNING', 'INFO']);
            $table->string('type'); // TEACHER_CONFLICT, ROOM_CONFLICT, etc.
            $table->string('title');
            $table->text('description');
            $table->unsignedBigInteger('entry_id')->nullable();
            $table->timestamps();
        });

        Schema::create('schedule_change_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('schedule_version_id')->constrained('schedule_versions')->onDelete('cascade');
            $table->string('course_name');
            $table->string('user_name');
            $table->unsignedTinyInteger('old_day');
            $table->unsignedTinyInteger('old_period_start');
            $table->string('old_room_name');
            $table->unsignedTinyInteger('new_day');
            $table->unsignedTinyInteger('new_period_start');
            $table->string('new_room_name');
            $table->string('reason')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->string('user_name');
            $table->string('action'); // CREATE, UPDATE, DELETE, PUBLISH, GENERATE
            $table->string('entity_type');
            $table->string('entity_id')->nullable();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('schedule_change_logs');
        Schema::dropIfExists('conflicts');
        Schema::dropIfExists('schedule_entries');
        Schema::dropIfExists('schedule_versions');
        Schema::dropIfExists('constraints');
        Schema::dropIfExists('course_sessions');
        Schema::dropIfExists('course_offerings');
        Schema::dropIfExists('blocked_timeslots');
        Schema::dropIfExists('timeslots');
        Schema::dropIfExists('teacher_preferences');
        Schema::dropIfExists('teacher_availability');
        Schema::dropIfExists('teacher_workloads');
        Schema::dropIfExists('teachers');
        Schema::dropIfExists('curriculum_courses');
        Schema::dropIfExists('courses');
        Schema::dropIfExists('rooms');
        Schema::dropIfExists('room_types');
        Schema::dropIfExists('student_groups');
        Schema::dropIfExists('curriculums');
        Schema::dropIfExists('programs');
        Schema::dropIfExists('education_levels');
        Schema::dropIfExists('departments');
        Schema::dropIfExists('faculties');
        Schema::dropIfExists('semesters');
        Schema::dropIfExists('academic_years');
        Schema::dropIfExists('users');
        Schema::dropIfExists('role_has_permissions');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('roles');
    }
};
