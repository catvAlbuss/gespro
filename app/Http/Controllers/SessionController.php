<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SessionController extends Controller
{
    /**
     * Verificar estado de la sesión
     */
    public function checkSession(Request $request)
    {
        if (!Auth::check()) {
            return response()->json([
                'authenticated' => false,
                'message' => 'Sesión no válida'
            ], 401);
        }

        try {
            $lastActivity = $request->session()->get('last_activity');

            // Si por alguna razón no existe, forzamos valor actual
            if (!$lastActivity || !is_numeric($lastActivity)) {
                $lastActivity = time();
            }

            $sessionLifetime = config('session.lifetime', 120) * 60; // por si está mal configurado
            $elapsed = time() - $lastActivity;
            $remaining = $sessionLifetime - $elapsed;

            $warning = ($remaining < 900); // < 15 min

            return response()->json([
                'authenticated' => true,
                'warning' => $warning,
                'minutes_remaining' => $warning ? ceil($remaining / 60) : null,
                'session_lifetime' => $sessionLifetime / 60
            ]);
        } catch (\Exception $e) {
            // Devuelve error legible en vez de 500
            return response()->json([
                'authenticated' => false,
                'error' => 'Error al verificar la sesión.',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Hacer ping para mantener sesión activa
     */
    public function pingSession(Request $request)
    {
        if (!Auth::check()) {
            return response()->json([
                'authenticated' => false
            ], 401);
        }

        // Actualizar timestamp de última actividad
        $request->session()->put('last_activity', time());

        return response()->json([
            'success' => true,
            'message' => 'Sesión renovada'
        ]);
    }
}
