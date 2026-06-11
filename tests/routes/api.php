<?php

use App\Http\Controllers\Api\Admin\AnalyticsController;
use App\Http\Controllers\Api\Admin\BookingAdminController;
use App\Http\Controllers\Api\Admin\ClientAdminController;
use App\Http\Controllers\Api\Admin\PluginAdminController;
use App\Http\Controllers\Api\Admin\ServiceAdminController;
use App\Http\Controllers\Api\Admin\StatsController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AvailabilityController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\PluginController;
use App\Http\Controllers\Api\ServiceController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Публичные маршруты
|--------------------------------------------------------------------------
*/

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
});

Route::get('/services', [ServiceController::class, 'index']);
Route::get('/plugins', [PluginController::class, 'index']);
Route::post('/plugins/requests', [PluginController::class, 'storeRequest'])->middleware('throttle:5,1');
Route::get('/availability', [AvailabilityController::class, 'show']);

/*
|--------------------------------------------------------------------------
| Авторизованные пользователи
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });

    Route::get('/bookings', [BookingController::class, 'index']);
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::delete('/bookings/{booking}', [BookingController::class, 'destroy']);

    /*
    |----------------------------------------------------------------------
    | Админ-панель
    |----------------------------------------------------------------------
    */
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/stats', [StatsController::class, 'index']);

        Route::get('/bookings', [BookingAdminController::class, 'index']);
        Route::patch('/bookings/{booking}/status', [BookingAdminController::class, 'updateStatus']);

        // CRM: клиенты, заметки, аналитика
        Route::get('/clients', [ClientAdminController::class, 'index']);
        Route::get('/clients/{client}', [ClientAdminController::class, 'show']);
        Route::patch('/clients/{client}', [ClientAdminController::class, 'update']);
        Route::post('/clients/{client}/notes', [ClientAdminController::class, 'storeNote']);
        Route::delete('/notes/{note}', [ClientAdminController::class, 'destroyNote']);
        Route::get('/analytics', [AnalyticsController::class, 'index']);

        // Каталог: цены услуг и управление плагинами
        Route::patch('/services/{service}', [ServiceAdminController::class, 'update']);
        Route::post('/plugins', [PluginAdminController::class, 'store']);

        Route::get('/plugin-requests', [PluginAdminController::class, 'requests']);
        Route::patch('/plugins/{plugin}/approve', [PluginAdminController::class, 'approve']);
        Route::delete('/plugins/{plugin}', [PluginAdminController::class, 'destroy']);
    });
});
