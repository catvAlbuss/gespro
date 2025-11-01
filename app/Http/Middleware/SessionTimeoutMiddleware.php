<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class SessionTimeoutMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Verificar si hay un usuario autenticado
        if (!Auth::check()) {
            if ($request->expectsJson() || $request->ajax()) {
                return response()->json([
                    'message' => 'Sesión expirada. Por favor, inicia sesión nuevamente.',
                    'redirect' => route('login'),
                    'session_expired' => true
                ], 401);
            }

            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')
                ->with('session_expired', 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        }


        // Actualizar el timestamp de última actividad
        session(['last_activity' => now()]);

        return $next($request);
    }
}
