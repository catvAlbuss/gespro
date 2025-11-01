<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;

class RoleRedirect
{
    public function handle($request, Closure $next)
    {
        $user = Auth::user();

        if (!$user) {
            Auth::logout();
            return redirect()->route('login')->with('error', 'Tu sesión ha expirado.');
        }

        // Rutas de administrador
        $adminRoutes = ['permissions', 'roles', 'users', 'admin/dashboard'];
        $isAdminRoute = collect($adminRoutes)->contains(fn($route) => $request->is($route) || $request->is($route . '/*'));

        // Mapear roles a rutas
        $roleRoutes = [
            1 => 'admin.dashboard',
            2 => 'manager.dashboard',
            3 => 'administradores.dashboard',
            4 => 'logistico.dashboard',
            5 => 'jefe.dashboard',
            6 => 'trabajador.dashboard',
        ];

        $roleId = $user->roles->first()->id ?? null;

        if (!$roleId || !isset($roleRoutes[$roleId])) {
            Auth::logout();
            return redirect()->route('login')->with('error', 'No tienes un rol asignado.');
        }

        // Si entra a rutas admin sin ser admin → lo mando a su dashboard
        if ($isAdminRoute && $roleId !== 1) {
            return redirect()->route($roleRoutes[$roleId])->with('error', 'No tienes permiso para acceder a esta ruta.');
        }

        // Si la ruta actual no coincide con su dashboard → redirigir
        $expectedPath = str_replace('.dashboard', '/dashboard', $roleRoutes[$roleId]);
        if (!$request->is($expectedPath)) {
            return redirect()->route($roleRoutes[$roleId]);
        }

        return $next($request);
    }
}
