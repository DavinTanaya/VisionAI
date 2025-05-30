<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\MusicController;
use App\Http\Controllers\UserSessionController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json(['message' => 'Hello world!']);
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('auth/google', [AuthController::class, 'redirectToGoogle']);
Route::get('auth/google/callback', [AuthController::class, 'handleGoogleCallback']);

Route::middleware('jwt')->group(function () {
    Route::get('/user', [AuthController::class, 'getUser']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/user', [AuthController::class, 'updateUser']);

    Route::prefix(('music'))->group(function() {
        Route::get('/', [MusicController::class, 'getMusic']);
        Route::post('/', [MusicController::class, 'addMusic']);
        Route::patch('/{id}', [MusicController::class, 'updateMusic']);
        Route::delete('/{id}', [MusicController::class, 'deleteMusic']);
    });

    Route::prefix('session')->group(function() {
        Route::get('/', [UserSessionController::class, 'getSession']);
        Route::get('/{id}', [UserSessionController::class, 'getSessionById']);
        Route::post('/', [UserSessionController::class, 'addSession']);
        Route::patch('/{id}', [UserSessionController::class, 'updateSession']);
        Route::get('/{id}/runtime', [UserSessionController::class, 'incrementRuntime']);
        Route::get('/{id}/yawning', [UserSessionController::class, 'incrementYawning']);
        Route::get('/{id}/closed', [UserSessionController::class, 'incrementClosed']);
        Route::get('/{id}/done', [UserSessionController::class, 'incrementDone']);
    });

});