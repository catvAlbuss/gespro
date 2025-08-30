<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Empresa;
use App\Models\actividadespersonal;
use Carbon\Carbon;

class informesController extends Controller
{
    public function getInformesPersonalEmpresa(Request $request, $empresaId = null)
    {
        $userId = $request->input('user_id');

        // Validación de entrada
        if (!$userId && !$empresaId) {
            return redirect()->back()->withErrors(['error' => 'Debe proporcionar user_id o empresa_id']);
        }

        try {
            // Si se proporciona ID de usuario
            if ($userId) {
                return $this->procesarInformeUsuario($userId);
            }

            // Si se proporciona ID de empresa
            if ($empresaId) {
                return $this->procesarInformeEmpresa($empresaId);
            }
        } catch (\Exception $e) {
            //\Log::error('Error en getInformesPersonalEmpresa: ' . $e->getMessage());
            return redirect()->back()->withErrors(['error' => 'Error interno del servidor']);
        }
    }

    private function procesarInformeUsuario($userId)
    {
        $user = User::find($userId);
        if (!$user) {
            return redirect()->back()->withErrors(['error' => 'Usuario no encontrado']);
        }

        $actividades = $this->obtenerActividadesAprobadas($userId);
        $datos = $this->formatearDatosUsuario($user, $actividades);

        return view('gestor_vista.contabilidad.portadaInformes', compact('datos'));
    }

    private function procesarInformeEmpresa($empresaId)
    {
        $empresa = Empresa::find($empresaId);
        if (!$empresa) {
            return redirect()->back()->withErrors(['error' => 'Empresa no encontrada']);
        }

        // Query base: usuarios vinculados al pivot empresa_user con la empresa solicitada
        $usuariosQuery = \App\Models\User::query()
            ->select('users.*')
            ->join('empresa_user', 'users.id', '=', 'empresa_user.user_id')
            ->where('empresa_user.empresa_id', $empresaId)
            ->with('empresas');

        // Excluir siempre ROOT y Gerencia
        $usuariosQuery->whereNotIn('users.area_laboral', ['ROOT', 'Gerencia']);

        // Regla: si la empresa solicitada es la #3 permitimos los roles especiales (Logistico, Administracion, Administrador de Proyectos)
        // si NO es la #3 solo mostramos Jefe de area y asistentes (es decir, "la empresa correspondiente").
        if ($empresaId == 3) {
            // Para empresa 3 no aplicamos más filtros de area_laboral (ya excluimos ROOT y Gerencia arriba)
        } else {
            // Solo permitir Jefe de area y asistentes para empresas distintas de la 3
            $usuariosQuery->whereIn('users.area_laboral', ['Jefe de area', 'Asistente']);
        }

        // Evitar duplicados por joins múltiples
        $usuarios = $usuariosQuery->distinct('users.id')->get();

        $resultados = [];
        foreach ($usuarios as $user) {
            $actividades = $this->obtenerActividadesAprobadas($user->id);
            $resultados[] = $this->formatearDatosUsuario($user, $actividades, $empresa->razonSocial);
        }

        return view('gestor_vista.contabilidad.portadaInformes', compact('resultados', 'empresa'));
    }

    private function obtenerActividadesAprobadas($userId)
    {
        return actividadespersonal::where('usuario_designado', $userId)
            ->where('status', 'approved')
            ->whereMonth('fecha', Carbon::now()->month)
            ->whereYear('fecha', Carbon::now()->year)
            ->select([
                'nameActividad',
                'status',
                'fecha',
                'diasAsignados',
                'projectActividad',
                'porcentajeTarea'
            ])
            ->with(['proyecto:id_proyectos,nombre_proyecto']) // Eager loading del proyecto
            ->orderBy('fecha', 'desc')
            ->get()
            ->map(function ($actividad) {
                return [
                    'nameActividad' => $actividad->nameActividad,
                    'status' => $actividad->status,
                    'fecha' => $actividad->fecha,
                    'diasAsignados' => $actividad->diasAsignados,
                    'porcentajeTarea' => $actividad->porcentajeTarea,
                    'proyecto' => $actividad->proyecto ? $actividad->proyecto->nombre_proyecto : 'Sin proyecto'
                ];
            });
    }

    private function formatearDatosUsuario($user, $actividades, $empresaNombre = null)
    {
        return [
            'id_user' => $user->id,
            'nombre' => $user->name,
            'apellido' => $user->surname,
            'dni' => $user->dni_user,
            'sueldo' => $user->sueldo_base,
            'area_laboral' => $user->area_laboral,
            'empresa' => $empresaNombre ?? ($user->empresas->first() ? $user->empresas->first()->razonSocial : 'Sin empresa'),
            'actividades' => $actividades,
            'total_actividades' => $actividades->count(),
            'total_dias_asignados' => $actividades->sum('diasAsignados')
        ];
    }
}
