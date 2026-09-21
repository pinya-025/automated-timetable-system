<?php

namespace App\Services;

use App\Models\CourseOffering;
use App\Models\Room;
use App\Models\Teacher;
use App\Models\TeacherAvailability;
use App\Models\TeacherPreference;
use App\Models\BlockedTimeslot;
use App\Models\Constraint;
use App\Models\ScheduleVersion;
use App\Models\ScheduleEntry;
use App\Models\Conflict;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Exception;

/**
 * Clean Architecture: Timetable Scheduling Service
 * Manages communication with Python OR-Tools CP-SAT microservice,
 * version creation, conflict logging, and transaction rollbacks.
 */
class TimetableSchedulingService
{
    protected string $engineUrl;

    public function __construct()
    {
        $this->engineUrl = config('services.scheduling_engine.url', 'http://localhost:8001');
    }

    /**
     * Dispatch payload to Python CP-SAT solver and persist schedule entries.
     */
    public function generateSchedule(int $semesterId, string $createdByName): ScheduleVersion
    {
        // 1. Gather all active academic datasets
        $offerings = CourseOffering::with(['course', 'studentGroup', 'teacher'])
            ->where('semester_id', $semesterId)
            ->where('is_active', true)
            ->get();

        if ($offerings->isEmpty()) {
            throw new Exception("ไม่พบรายวิชาที่เปิดสอน (Course Offerings) ในภาคเรียนนี้");
        }

        $rooms = Room::where('is_active', true)->get();
        $teachers = Teacher::all();
        $availabilities = TeacherAvailability::all();
        $preferences = TeacherPreference::all();
        $blockedSlots = BlockedTimeslot::where('is_active', true)->get();
        $weights = Constraint::all();

        // 2. Format JSON payload according to Pydantic ScheduleInputPayload
        $payload = [
            'semester_id' => $semesterId,
            'offerings' => $offerings->map(function ($o) {
                return [
                    'id' => $o->id,
                    'course_id' => $o->course_id,
                    'course_code' => $o->course->code ?? 'CODE',
                    'course_name' => $o->course->name_th ?? 'Course',
                    'student_group_id' => $o->student_group_id,
                    'teacher_id' => $o->teacher_id,
                    'room_type_id' => $o->room_type_id,
                    'student_count' => $o->student_count,
                    'sessions_per_week' => $o->sessions_per_week,
                    'periods_per_session' => $o->periods_per_session,
                    'must_be_consecutive' => $o->must_be_consecutive,
                    'max_sessions_per_day' => $o->max_sessions_per_day,
                    'preferred_room_id' => $o->preferred_room_id,
                    'is_fixed' => $o->is_fixed,
                    'is_active' => $o->is_active,
                ];
            })->toArray(),
            'rooms' => $rooms->map(function ($r) {
                return [
                    'id' => $r->id,
                    'room_number' => $r->room_number,
                    'room_type_id' => $r->room_type_id,
                    'capacity' => $r->capacity,
                    'building' => $r->building,
                    'is_active' => $r->is_active,
                ];
            })->toArray(),
            'teachers' => $teachers->map(function ($t) {
                return [
                    'id' => $t->id,
                    'name' => $t->name,
                    'department_id' => $t->department_id,
                    'max_periods_per_week' => $t->max_periods_per_week,
                    'max_periods_per_day' => $t->max_periods_per_day,
                    'max_consecutive_periods' => $t->max_consecutive_periods,
                ];
            })->toArray(),
            'availabilities' => $availabilities->map(function ($a) {
                return [
                    'teacher_id' => $a->teacher_id,
                    'day_of_week' => $a->day_of_week,
                    'timeslot_id' => $a->timeslot_id,
                    'is_available' => $a->is_available,
                ];
            })->toArray(),
            'preferences' => $preferences->map(function ($p) {
                return [
                    'teacher_id' => $p->teacher_id,
                    'day_of_week' => $p->day_of_week,
                    'timeslot_id' => $p->timeslot_id,
                    'preference_level' => $p->preference_level,
                ];
            })->toArray(),
            'blocked_timeslots' => $blockedSlots->map(function ($b) {
                return [
                    'id' => $b->id,
                    'day_of_week' => $b->day_of_week,
                    'timeslot_id' => $b->timeslot_id,
                    'start_time' => $b->start_time,
                    'end_time' => $b->end_time,
                    'type' => $b->type,
                    'title' => $b->title,
                    'is_active' => $b->is_active,
                ];
            })->toArray(),
            'weights' => $weights->map(function ($w) {
                return [
                    'code' => $w->code,
                    'name' => $w->name,
                    'type' => $w->type,
                    'weight' => $w->weight,
                    'is_active' => $w->is_active,
                ];
            })->toArray(),
            'working_days' => [1, 2, 3, 4, 5],
            'total_timeslots' => 9,
        ];

        // 3. Invoke Python CP-SAT Solver via HTTP REST API
        $response = Http::timeout(45)->post("{$this->engineUrl}/api/v1/optimize-schedule", $payload);

        if (!$response->successful()) {
            throw new Exception("Python Scheduling Engine error: " . $response->body());
        }

        $result = $response->json();

        // 4. Wrap database persistence in safe transaction
        return DB::transaction(function () use ($semesterId, $createdByName, $result) {
            $latestVersion = ScheduleVersion::where('semester_id', $semesterId)->max('version_number') ?? 0;
            $newVersionNumber = $latestVersion + 1;

            $scheduleVersion = ScheduleVersion::create([
                'semester_id' => $semesterId,
                'version_number' => $newVersionNumber,
                'name' => "V{$newVersionNumber}.0 - CP-SAT Optimized",
                'status' => 'draft',
                'score' => $result['score'] ?? 0,
                'hard_conflict_count' => $result['hard_conflict_count'] ?? 0,
                'soft_penalty_score' => $result['soft_penalty_score'] ?? 0,
                'notes' => $result['solver_message'] ?? 'Generated by OR-Tools CP-SAT',
                'created_by' => $createdByName,
            ]);

            // Save individual scheduled entries
            foreach ($result['entries'] as $entry) {
                ScheduleEntry::create([
                    'schedule_version_id' => $scheduleVersion->id,
                    'course_offering_id' => $entry['course_offering_id'],
                    'session_index' => $entry['session_index'],
                    'period_length' => $entry['period_length'],
                    'day_of_week' => $entry['day_of_week'],
                    'start_timeslot_id' => $entry['start_timeslot_id'],
                    'end_timeslot_id' => $entry['end_timeslot_id'],
                    'room_id' => $entry['room_id'],
                    'is_locked' => false,
                ]);
            }

            return $scheduleVersion;
        });
    }

    /**
     * Publish schedule version (locks against further direct mutations).
     */
    public function publishVersion(int $versionId): ScheduleVersion
    {
        return DB::transaction(function () use ($versionId) {
            $version = ScheduleVersion::findOrFail($versionId);

            if ($version->hard_conflict_count > 0) {
                throw new Exception("ไม่สามารถ Publish ตารางที่มีข้อขัดแย้ง Hard Conflict ได้");
            }

            // Archive previous published version for this semester
            ScheduleVersion::where('semester_id', $version->semester_id)
                ->where('status', 'published')
                ->update(['status' => 'archived']);

            $version->status = 'published';
            $version->published_at = now();
            $version->save();

            return $version;
        });
    }
}
