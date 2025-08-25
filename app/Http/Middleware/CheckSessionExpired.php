<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckSessionExpired
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Comprobar si el parametro 'empresa_id' está en la sesión
        if (!session()->has('empresa_id')|| !session()->has('id')) {
            // Si no está presente, destruir la sesión y redirigir al login
            session()->flush();  // Elimina todos los datos de la sesión
            return redirect()->route('login');  // Redirige al login
        }
        return $next($request);
    }
}
