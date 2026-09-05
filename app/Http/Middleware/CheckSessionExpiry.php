<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CheckSessionExpiry
{
    /**
     * Route publik / auth Fortify yang tidak perlu dicek.
     */
    protected function isPublicRoute(Request $request): bool
    {
        return $request->is('login') ||
            $request->is('logout') ||
            $request->is('two-factor*') ||
            $request->is('forgot-password*') ||
            $request->is('register*');
    }

    public function handle(Request $request, Closure $next)
    {
        if ($this->isPublicRoute($request)) {
            return $next($request);
        }

        $sessionId = $request->session()->getId();

        $session = DB::table('sessions')->where('id', $sessionId)->first();

        // EXPIRED: row session masih ada, tapi sudah melewati batas idle.
        // Catatan: cek dari database row (bukan Auth::check()) karena
        // StartSession sudah "menganggap" session basi lebih dulu,
        // sehingga Auth::check() sudah false saat middleware ini berjalan.
        if ($session && self::isExpired($request)) {
            return self::expire($request);
        }

        // Defensif: user terautentikasi tapi row session tidak ditemukan.
        if (Auth::check() && ! $session) {
            return self::expire(
                $request,
                'Session Invalid',
                'Session tidak valid. Silakan login kembali.',
                'error'
            );
        }

        // Perbarui last_activity agar shared prop session_expiry tetap akurat.
        if ($session && Auth::check()) {
            DB::table('sessions')->where('id', $sessionId)->update([
                'last_activity' => time(),
            ]);
        }

        return $next($request);
    }

    /**
     * Ambil row session saat ini dari database.
     */
    public static function sessionRow(Request $request): ?object
    {
        return DB::table('sessions')
            ->where('id', $request->session()->getId())
            ->first();
    }

    /**
     * Sisa waktu session dalam detik, atau null bila row session tidak ada.
     */
    public static function remainingSeconds(Request $request): ?int
    {
        $session = self::sessionRow($request);

        if ($session === null) {
            return null;
        }

        return (int) $session->last_activity + ((int) config('session.lifetime') * 60) - time();
    }

    /**
     * Apakah session sudah melewati batas idle (expired).
     *
     * Konsisten dengan logika DatabaseSessionHandler::expired() bawaan Laravel.
     */
    public static function isExpired(Request $request): bool
    {
        $remaining = self::remainingSeconds($request);

        return $remaining !== null && $remaining < 0;
    }

    /**
     * Logout + invalidasi session, lalu redirect ke halaman login dengan notifikasi.
     */
    public static function expire(
        Request $request,
        string $title = 'Session Expired',
        ?string $message = null,
        string $type = 'warning'
    ): RedirectResponse {
        $message ??= 'Sesi Anda telah berakhir karena tidak aktif selama '
            . config('session.lifetime') . ' menit. Silakan login kembali.';

        DB::table('sessions')->where('id', $request->session()->getId())->delete();

        if (Auth::check()) {
            Auth::guard('web')->logout();
        }

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/login?' . http_build_query([
            'expired' => 1,
            'type' => $type,
            'title' => $title,
            'message' => $message,
        ]));
    }
}
