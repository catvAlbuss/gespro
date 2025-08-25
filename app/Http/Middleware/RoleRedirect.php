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
            return redirect()->route('login');
        }

        // Rutas protegidas para el Administrador
        $adminRoutes = ['permissions', 'roles', 'users', 'admin/dashboard'];

        // Verificar si la ruta actual está en las rutas protegidas
        $isAdminRoute = collect($adminRoutes)->contains(function ($route) use ($request) {
            return $request->is($route) || $request->is($route . '/*');
        });

        if ($user->roles->contains('id', 1)) { // Administrador
            if (!$isAdminRoute) {
                return redirect()->route('admin.dashboard');
            }
        } elseif ($user->roles->contains('id', 2)) { // Gerente
            if ($isAdminRoute) {
                abort(403, 'Acceso no autorizado.');
            }
            if (!$request->is('manager/dashboard')) {
                return redirect()->route('manager.dashboard');
            }
        } elseif ($user->roles->contains('id', 3)) { // Jefe
            if ($isAdminRoute) {
                abort(403, 'Acceso no autorizado.');
            }
            if (!$request->is('administradores/dashboard')) {
                return redirect()->route('administradores.dashboard');
            }
        } elseif ($user->roles->contains('id', 4)) { // Logístico
            if ($isAdminRoute) {
                abort(403, 'Acceso no autorizado.');
            }
            if (!$request->is('logistico/dashboard')) {
                return redirect()->route('logistico.dashboard');
            }
        } elseif ($user->roles->contains('id', 5)) { // Jefe de área
            if ($isAdminRoute) {
                abort(403, 'Acceso no autorizado.');
            }
            if (!$request->is('jefe/dashboard')) {
                return redirect()->route('jefe.dashboard');
            }
        } elseif ($user->roles->contains('id', 6)) { // Trabajador
            if ($isAdminRoute) {
                abort(403, 'Acceso no autorizado.');
            }
            if (!$request->is('trabajador/dashboard')) {
                return redirect()->route('trabajador.dashboard');
            }
        } else {
            // Si el usuario no tiene ningún rol válido, redirige a la página de inicio
            return redirect()->route('home');
        }

        return $next($request);
    }
}
