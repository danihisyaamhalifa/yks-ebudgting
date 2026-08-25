<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CheckSessionExpiry
{
    public function handle(Request $request, Closure $next)
    {
        // Skip untuk route publik / Auth Fortify
        if (
            $request->is('login') ||
            $request->is('logout') ||
            $request->is('two-factor*') ||
            $request->is('forgot-password*') ||
            $request->is('register*')
        ) {
            return $next($request);
        }

        if (Auth::check()) {
            $sessionId = session()->getId();

            $session = DB::table('sessions')
                ->where('id', $sessionId)
                ->first();

            if ($session) {
                $lifetime = config('session.lifetime') * 60;
                $idleTime = time() - $session->last_activity;

                // EXPIRED!
                if ($idleTime > $lifetime) {
                    // Hapus session dari database
                    DB::table('sessions')->where('id', $sessionId)->delete();

                    // Logout
                    Auth::guard('web')->logout();
                    $request->session()->invalidate();
                    $request->session()->regenerateToken();

                    // Redirect dengan query string
                    return redirect('/login?expired=1&type=warning&title=' . urlencode('Session Expired') . '&message=' . urlencode('Sesi Anda telah berakhir karena tidak aktif selama ' . config('session.lifetime') . ' menit. Silakan login kembali.'));
                }

                // Update last_activity
                DB::table('sessions')
                    ->where('id', $sessionId)
                    ->update([
                        'last_activity' => time()
                    ]);
            } else {
                // Session tidak ada di database
                Auth::guard('web')->logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return redirect('/login?expired=1&type=error&title=' . urlencode('Session Invalid') . '&message=' . urlencode('Session tidak valid. Silakan login kembali.'));
            }
        }

        return $next($request);
    }
}