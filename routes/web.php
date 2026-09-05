<?php

use App\Http\Controllers\Api\MaintenanceController;
use App\Http\Middleware\CheckSessionExpiry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Modules\Report\Http\Controllers\DashboardController;

Route::get('/', function () {
    if (Auth::check()) {
        // Jika sudah login, redirect ke dashboard
        return redirect()->route('dashboard');
    }
    return redirect()->route('login');
})->name('home');

Route::get('dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware(['auth', 'verified'])->group(
    function () {
        Route::get('/user', function () {
            return Inertia::render(component: 'admin/users/Index');
        })->name('admin.users');

        Route::get('/role', function () {
            return Inertia::render(component: 'admin/roles/Index');
        })->name('admin.roles');
    }
);

Route::get('/maintenance/clear-cache', [MaintenanceController::class, 'clearCache']);
Route::get('/maintenance/activate-storage', [MaintenanceController::class, 'activateStorage']);

Route::get('/debug-vite', function () {
    return [
        'public_path' => public_path(),
        'manifest_path' => public_path('build/manifest.json'),
        'manifest_exists' => file_exists(public_path('build/manifest.json')),
    ];
});

Route::get('/debug-storage', function () {
    return [
        'storage_path' => storage_path(),
        'logs_exists' => is_dir(storage_path('logs')),
        'logs_writable' => is_writable(storage_path('logs')),
    ];
});

Route::get('/storage-debug', function () {
    return [
        'storage_link_exists' => file_exists(public_path('storage')),
        'is_link' => is_link(public_path('storage')),
        'storage_target' => storage_path('app/public'),
        'symlink_function' => function_exists('symlink'),
    ];
});

Route::get('/test-log', function () {
    \Log::info('TEST LOG ' . now());
    return 'OK';
});

Route::get('/cek-middleware', function() {
    $router = app('router');
    $webMiddleware = $router->getMiddlewareGroups()['web'] ?? [];
    
    return response()->json([
        'web_middleware' => $webMiddleware,
        'ada_CheckSessionExpiry' => in_array(
            'App\Http\Middleware\CheckSessionExpiry', 
            $webMiddleware
        )
    ]);
});

Route::get('/cek-lifetime', function() {
    return response()->json([
        'lifetime' => config('session.lifetime'),
        'lifetime_seconds' => config('session.lifetime') * 60,
        'env_value' => env('SESSION_LIFETIME'),
        'server_time' => now()->toDateTimeString()
    ]);
});

// ========== SESSION EXPIRY / HEARTBEAT ==========
// Dipanggil klien (countdown sesi habis) agar server memvalidasi & logout
// dengan notifikasi redirect ke login.
Route::post('/session-expire', function (Request $request) {
    // Kalau benar-benar expired → logout + redirect ke login dengan notifikasi.
    if (CheckSessionExpiry::isExpired($request)) {
        return CheckSessionExpiry::expire($request);
    }

    // Belum expired → tetap di halaman (jaga-jaga bila countdown klien tidak sinkron).
    return redirect()->back();
})->name('session.expire');

// Heartbeat: dikirim saat user masih aktif, agar last_activity server
// tetap segar dan sesi tidak dianggap idle oleh middleware.
Route::get('/session/heartbeat', function () {
    return response()->noContent();
})->name('session.heartbeat');

require __DIR__ . '/settings.php';
