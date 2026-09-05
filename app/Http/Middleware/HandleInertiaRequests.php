<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');
        $user = $request->user();
        
        // Load the unit relationship if user exists
        if ($user) {
            $user->loadMissing('unit');
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'version' => config('app.version'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'unit_id' => $user->unit_id,
                    'unit' => $user->unit ? [ 
                        'id' => $user->unit->id,
                        'codee' => $user->unit->unit_code,
                        'name' => $user->unit->unit_name,
                    ] : null,
                    'permissions' => $user->getAllPermissions(),
                    'roles' => $user->getRoleNames(),
                ] : null,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',

            // Info sesi untuk countdown & notifikasi session expiry di sisi klien
            'session_expiry' => function () use ($request) {
                if (! $request->user()) {
                    return null;
                }

                $session = CheckSessionExpiry::sessionRow($request);

                if ($session === null) {
                    return null;
                }

                $lifetime = (int) config('session.lifetime') * 60;

                return [
                    'last_activity' => (int) $session->last_activity,
                    'lifetime_seconds' => $lifetime,
                    'remaining_seconds' => max(0, (int) $session->last_activity + $lifetime - time()),
                ];
            },
            
            // Sharing flash messages ke Inertia Vue
            'flash' => [
                'sonner'  => fn () => $request->session()->get('sonner'),
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
                'info'    => fn () => $request->session()->get('info'),
            ],
        ];
    }
}