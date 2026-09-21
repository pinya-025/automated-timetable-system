<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\CourseOfferingController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\AuthController;

/*
|--------------------------------------------------------------------------
| API Routes - Automated Timetable Scheduling System
|--------------------------------------------------------------------------
*/

// Authentication
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

// Protected Routes
Route::middleware(['auth:sanctum'])->group(function () {

    // Master Data CRUD
    Route::apiResource('teachers', TeacherController::class);
    Route::apiResource('courses', CourseController::class);
    Route::apiResource('rooms', RoomController::class);
    Route::apiResource('course-offerings', CourseOfferingController::class);

    // Scheduling Engine & Timetable Operations
    Route::prefix('schedules')->group(function () {
        Route::post('/validate', [ScheduleController::class, 'validateDataset']);
        Route::post('/generate', [ScheduleController::class, 'generate']);
        Route::get('/{version}', [ScheduleController::class, 'showVersion']);
        Route::post('/validate-move', [ScheduleController::class, 'validateMove']);
        Route::put('/entries/{id}', [ScheduleController::class, 'updateEntry']);
        Route::post('/suggest-slot', [ScheduleController::class, 'suggestSlot']);
        Route::post('/publish', [ScheduleController::class, 'publish']);
    });

    // Reports
    Route::prefix('reports')->group(function () {
        Route::get('/teacher/{teacher_id}', [ReportController::class, 'teacherSchedule']);
        Route::get('/group/{group_id}', [ReportController::class, 'groupSchedule']);
        Route::get('/room/{room_id}', [ReportController::class, 'roomSchedule']);
        Route::get('/workload', [ReportController::class, 'teacherWorkloadSummary']);
        Route::get('/utilization', [ReportController::class, 'roomUtilizationSummary']);
    });

    // Exports
    Route::prefix('export')->group(function () {
        Route::get('/pdf', [ExportController::class, 'exportPdf']);
        Route::get('/excel', [ExportController::class, 'exportExcel']);
    });
});
