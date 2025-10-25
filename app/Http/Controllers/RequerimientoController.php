<?php

namespace App\Http\Controllers;

use App\Models\depositorequerimiento;
use App\Models\manoobrarequerimiento;
use App\Models\materialrequerimiento;
use App\Models\Proyecto;
use App\Models\requerimiento;
use App\Models\User;
use App\Notifications\NotificacionAprobado;
use App\Notifications\RequirementCreate;
use App\Notifications\RequirementDeleted;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Symfony\Component\Console\Input\Input;

class RequerimientoController extends Controller
{
    public function createrequerimiento($empresaId)
    {
        // Obtener proyectos relacionados a la empresa
        $proyectos = Proyecto::where('empresa_id', $empresaId)->get(['id_proyectos', 'nombre_proyecto']);

        // Obtener el último valor de numero_orden_requerimiento
        $ultimoNumeroOrden = Requerimiento::max('numero_orden_requerimiento');

        // Calcular el nuevo valor
        $nuevoNumeroOrden = $ultimoNumeroOrden ? $ultimoNumeroOrden + 1 : 1; // Si no hay registros, comienza en 1

        return view('gestor_vista.Administrador.Gestor_requerimientosCreate', compact('empresaId', 'proyectos', 'nuevoNumeroOrden'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'numero_orden_requerimiento' => 'required|integer|min:1',
            'solicitado_requerimiento' => 'required|string',
            'proyecto_designado' => 'required|integer',
            'nombre_requerimiento' => 'required|string|max:250',
            'departamento_requerimiento' => 'required|string|max:100',
            'correo_requerimiento' => 'required|string|max:255',
            'cargo_requerimiento' => 'required|string',
            'total_requerimientos' => 'required|numeric|min:0',
            'empresaId' => 'required|integer',
            'banco_req' => 'required|string|max:40',
            'nro_banco_req' => 'required|string|max:20',   // Ejemplo: máximo 20 caracteres
            'cci_req'       => 'required|string|max:30',   // Ejemplo: máximo 30 caracteres
            'titular_req' => 'required|string|max:50',
            'dni_req' => 'required|integer|min:0|max:99999999',
            'datosAgrupados' => 'required|json',
        ]);

        // Decodificar datos agrupados
        $datosAgrupados = json_decode($request->input('datosAgrupados'), true);
        $filasData = $datosAgrupados['filasData'] ?? [];
        $materialesData = $datosAgrupados['materialesData'] ?? [];
        //Crear el registro principal
        $requerimiento = Requerimiento::create([
            'nombre_requerimiento' => $request->nombre_requerimiento,
            'numero_orden_requerimiento' => $request->numero_orden_requerimiento,
            'fecha_requerimiento' => Carbon::now(),
            'correo_requerimiento' => $request->correo_requerimiento,
            'solicitado_requerimiento' => $request->solicitado_requerimiento,
            'cargo_requerimiento' => $request->cargo_requerimiento,
            'departamento_requerimiento' => $request->departamento_requerimiento,
            'total_requerimientos' => $request->total_requerimientos,
            'aprobado_logistica' => 0,
            'aprobado_contabilidad' => 0,
            'aprobado_requerimiento' => 0,
            'sustento_requerimiento' => '-',
            'proyecto_designado' => $request->proyecto_designado,
            'empresa_designado' => $request->empresaId,
        ]);

        // Registrar en la tabla de materiales
        foreach ($materialesData as $material) {
            MaterialRequerimiento::create([
                'requerimiento_manterialdesing' => $requerimiento->id_requerimiento,
                'cantidad_material_req' => $material['cantidadma'], // Asegúrate de que esto coincida con el nombre en tu modelo
                'descripcion_material_req' => $material['descripcionma'], // Igual aquí
                'unidad' => $material['unidadma'], // Y aquí
                'precio_unitario_matreq' => $material['precioUnitarioma'], // Asegúrate de que coincida
                'total_material_req' => $material['totalma'], // Igualmente
            ]);
        }

        // Registrar en la tabla de mano de obra
        foreach ($filasData as $manoObra) {
            manoobrarequerimiento::create([
                'requerimiento_manodesignado' => $requerimiento->id_requerimiento,
                'descripcion_manoobra' => $manoObra['descripcionmo'],
                'cantidad_manoobra' => $manoObra['cantidadmo'],
                'precio_uni_manoobra' => $manoObra['precioUnitariomo'],
                'total_manoobra' => $manoObra['totalmo'],
            ]);
        }

        // Registrar en la tabla de depósitos (una sola vez)
        depositorequerimiento::create([
            'deposito_desingreq' => $requerimiento->id_requerimiento, // Relacionar con el id_requerimiento
            'banco_req' => $request->banco_req,
            'nro_banco_req' => $request->nro_banco_req,
            'cci_req' => $request->cci_req,
            'titular_req' => $request->titular_req,
            'dni_req' => $request->dni_req,
        ]);


        // === NOTIFICACIÓN A USUARIOS DE ADMINISTRACIÓN ===
        $usuariosAdministracion = User::where('area_laboral', 'Administracion')->get();

        $usuarioCreador = auth()->user(); // Usuario actual autenticado

        $mensaje = sprintf(
            '%s %s ha creado un nuevo requerimiento: %s (#%s) el %s',
            $usuarioCreador->name,
            $usuarioCreador->surname,
            $requerimiento->nombre_requerimiento,
            $requerimiento->id_requerimiento,
            now()->format('d/m/Y H:i:s')
        );

        foreach ($usuariosAdministracion as $usuario) {
            $usuario->notify(new RequirementCreate($requerimiento, $mensaje));
        }

        return response()->json([
            'success' => true,
            'message' => 'Registro exitoso',
            'empresaId' => $requerimiento->empresa_designado,
        ]);
    }

    public function show($empresaId)
    {
        // Filtrar requerimientos por la empresa designada
        $requerimientos = Requerimiento::with(['proyecto'])->where('empresa_designado', $empresaId)->get()->map(function ($requerimiento) {
            $aprobaciones = [
                $requerimiento->aprobado_logistica,
                $requerimiento->aprobado_contabilidad,
                $requerimiento->aprobado_requerimiento
            ];

            // Contar el número de aprobaciones
            $contadorAprobaciones = array_sum($aprobaciones);

            // Determinar el estado del requerimiento
            if ($contadorAprobaciones === 0) {
                $estado = 'Desaprobado';
            } elseif ($contadorAprobaciones >= 2) {
                $estado = 'Sustentado';
            } else {
                $estado = 'En Proceso';
            }

            // Añadir el estado al requerimiento
            $requerimiento->estado = $estado;

            return $requerimiento;
        });

        return view('gestor_vista.Administrador.Gestor_requerimiento', compact('requerimientos', 'empresaId'));
    }

    public function edit(string $id)
    {
        // Busca el requerimiento junto con los modelos relacionados
        $requerimiento = Requerimiento::with(['proyecto', 'materiales', 'manoObra', 'depositos'])->findOrFail($id);

        // Devuelve la vista con el requerimiento y sus datos relacionados
        return view('gestor_vista.Administrador.Gestor_requerimientosEdit', compact('requerimiento', 'id'));
    }

    public function actualizarmanoObra(Request $request)
    {
        $validatedData = $request->validate([
            'id_mano_obra' => 'required|integer',
            'descripcion_manoobra' => 'required|string|max:100',
            'cantidad_manoobra' => 'required|integer',
            'precio_uni_manoobra' => 'required|numeric',
            'id_requerimientos' => 'required|integer',
        ]);

        try {
            $id_requerimientos = $validatedData['id_requerimientos'];
            $obra = manoobrarequerimiento::findOrFail($validatedData['id_mano_obra']);

            $data = $request->only(['descripcion_manoobra', 'cantidad_manoobra', 'precio_uni_manoobra']);
            $data['total_manoobra'] = $validatedData['cantidad_manoobra'] * $validatedData['precio_uni_manoobra'];

            $obra->update($data);

            // *** ACTUALIZAR EL TOTAL DEL REQUERIMIENTO ***
            $requerimiento = Requerimiento::findOrFail($id_requerimientos);
            $requerimiento->actualizarTotal();

            return redirect()->route('logistica.requerimientos.edit', $id_requerimientos)
                ->with('success', 'Mano de obra actualizada exitosamente.');
        } catch (\Exception $e) {
            return redirect()->route('logistica.requerimientos.edit', $id_requerimientos)
                ->with('error', 'Error al actualizar la mano de obra.');
        }
    }

    public function eliminarmanoObra(Request $request, $id_mano_obra)
    {
        $request->validate([
            'id_requerimientos' => 'required|integer'
        ]);

        try {
            $id_requerimiento = $request->input('id_requerimientos');
            $obra = ManoObraRequerimiento::findOrFail($id_mano_obra);
            $obra->delete();

            // *** ACTUALIZAR EL TOTAL DEL REQUERIMIENTO ***
            $requerimiento = Requerimiento::findOrFail($id_requerimiento);
            $requerimiento->actualizarTotal();

            return redirect()->route('logistica.requerimientos.edit', $id_requerimiento)
                ->with('success', 'Mano de obra eliminada exitosamente.');
        } catch (\Exception $e) {
            return redirect()->route('logistica.requerimientos.edit', $id_requerimiento)
                ->with('error', 'Error al eliminar la mano de obra: ' . $e->getMessage());
        }
    }

    public function actualizarmaterial(Request $request)
    {
        $validatedData = $request->validate([
            'id_materiales_req' => 'required|integer',
            'descripcion_material_req' => 'required|string|max:100',
            'unidad' => 'required|string|max:100',
            'cantidad_material_req' => 'required|integer',
            'precio_unitario_matreq' => 'required|numeric',
            'id_requerimientos' => 'required|integer',
        ]);

        try {
            $material = materialrequerimiento::findOrFail($validatedData['id_materiales_req']);

            // CORRECCIÓN: Había un error de tipeo en el código original
            $data = $request->only(['descripcion_material_req', 'unidad', 'cantidad_material_req', 'precio_unitario_matreq']);
            $data['total_material_req'] = $validatedData['cantidad_material_req'] * $validatedData['precio_unitario_matreq'];

            $material->update($data);

            // *** ACTUALIZAR EL TOTAL DEL REQUERIMIENTO ***
            $requerimiento = Requerimiento::findOrFail($validatedData['id_requerimientos']);
            $requerimiento->actualizarTotal();

            return redirect()->route('logistica.requerimientos.edit', $validatedData['id_requerimientos'])
                ->with('success', 'Material actualizado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->route('logistica.requerimientos.edit', $validatedData['id_requerimientos'])
                ->with('error', 'Error al actualizar el material.');
        }
    }

    public function eliminarmateriales(Request $request, $id_materiales_req)
    {
        $request->validate([
            'id_requerimientos' => 'required|integer',
        ]);

        try {
            $id_requerimiento = $request->input('id_requerimientos');
            $material = MaterialRequerimiento::findOrFail($id_materiales_req);
            $material->delete();

            // *** ACTUALIZAR EL TOTAL DEL REQUERIMIENTO ***
            $requerimiento = Requerimiento::findOrFail($id_requerimiento);
            $requerimiento->actualizarTotal();

            return redirect()->route('logistica.requerimientos.edit', $id_requerimiento)
                ->with('success', 'Material eliminado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->route('logistica.requerimientos.edit', $id_requerimiento)
                ->with('error', 'Error al eliminar el material: ' . $e->getMessage());
        }
    }

    public function actualizardeposito(Request $request)
    {
        $validatedData = $request->validate([
            'id_depositoreq' => 'required|integer',
            'banco_req' => 'required|string|max:100',
            'nro_banco_req' => 'required|string|max:100',
            'cci_req' => 'required|string|max:100',
            'titular_req' => 'required|string|max:100',
            'dni_req' => 'required|string|max:8',
            'id_requerimientos' => 'required|integer',
        ]);

        try {
            $deposito = depositorequerimiento::findOrFail($validatedData['id_depositoreq']);
            $data = $request->only(['banco_req', 'nro_banco_req', 'cci_req', 'titular_req', 'dni_req']);
            $deposito->update($data);

            return redirect()->route('logistica.requerimientos.edit', $validatedData['id_requerimientos'])
                ->with('success', 'Depósito actualizado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->route('logistica.requerimientos.edit', $validatedData['id_requerimientos'])
                ->with('error', 'Error al actualizar el depósito.');
        }
    }

    public function actualizarRequerimientos(Request $request) {}

    // public function aprobar(Request $request, $id)
    // {
    //     $request->validate([
    //         'empresaId' => 'required|integer',
    //         'rolesAsignado' => 'required|string'
    //     ]);

    //     // Obtener el valor de los datos
    //     $empresaId = $request->input('empresaId');
    //     $rolAsignado = $request->input('rolesAsignado'); // El rol del usuario enviado en el formulario

    //     try {
    //         // Buscar el requerimiento por su ID
    //         $requerimiento = requerimiento::findOrFail($id);

    //         // Según el rol, actualizar la columna correspondiente
    //         if ($rolAsignado == 'logistico') {
    //             // Si el rol es logistica, actualizar la columna aprobado_logistica
    //             $requerimiento->aprobado_logistica = 1;
    //         } elseif ($rolAsignado == 'administradores') {
    //             // Si el rol es administrador, actualizar la columna aprobado_contabilidad
    //             $requerimiento->aprobado_contabilidad = 1;
    //             $requerimiento->aprobado_logistica = 1;
    //         } elseif ($rolAsignado == 'Gerente') {
    //             // Si el rol es gerente, actualizar la columna aprobado_requerimiento
    //             $requerimiento->aprobado_contabilidad = 1;
    //             $requerimiento->aprobado_requerimiento = 1;
    //             $requerimiento->aprobado_logistica = 1;
    //         }

    //         // Guardar los cambios en la base de datos
    //         $requerimiento->save();

    //         // Redirigir con éxito
    //         return redirect()->route('logistica.requerimientos.show', $empresaId)
    //             ->with('success', 'Requerimiento aprobado exitosamente.');
    //     } catch (\Exception $e) {
    //         // Manejar el error en caso de que algo falle
    //         return redirect()->route('logistica.requerimientos.show', $empresaId)
    //             ->with('error', 'Error al aprobar el requerimiento: ' . $e->getMessage());
    //     }
    // }

    public function aprobar(Request $request, $id)
    {
        $request->validate([
            'empresaId' => 'required|integer',
            'rolesAsignado' => 'required|string',
            'sustento_requerimiento' => 'nullable|file|mimes:pdf,jpg,jpeg,png,gif|max:2048',
        ]);

        $empresaId = $request->input('empresaId');
        $rolAsignado = $request->input('rolesAsignado');

        try {
            $requerimiento = Requerimiento::findOrFail($id);

            // === 1. Cargar o reemplazar el archivo de sustentación ===
            if ($request->hasFile('sustento_requerimiento')) {
                if (
                    $requerimiento->sustento_requerimiento &&
                    $requerimiento->sustento_requerimiento !== 'default.pdf'
                ) {
                    $oldFilePath = public_path('storage/sustento_requerimiento/' . $requerimiento->sustento_requerimiento);
                    if (file_exists($oldFilePath)) {
                        unlink($oldFilePath);
                    }
                }

                $file = $request->file('sustento_requerimiento');
                $fileName = time() . '.' . $file->extension();
                $file->move(public_path('storage/sustento_requerimiento'), $fileName);
                $requerimiento->sustento_requerimiento = $fileName;
            }

            // === 2. Lógica de aprobación por rol ===
            if ($rolAsignado === 'logistico') {
                $requerimiento->aprobado_logistica = 1;
            } elseif ($rolAsignado === 'administradores') {
                $requerimiento->aprobado_logistica = 1;
                $requerimiento->aprobado_contabilidad = 1;
                $requerimiento->aprobado_requerimiento = 1;
            } elseif ($rolAsignado === 'Gerente') {
                $requerimiento->aprobado_logistica = 1;
                $requerimiento->aprobado_contabilidad = 1;
                $requerimiento->aprobado_requerimiento = 1;
            }

            $requerimiento->save();

            // === 3. Notificación a administración y al solicitante ===
            $usuarioActual = auth()->user();

            $mensaje = sprintf(
                '%s %s ha aprobado el requerimiento: "%s" (#%s) el %s',
                $usuarioActual->name,
                $usuarioActual->surname,
                $requerimiento->nombre_requerimiento,
                $requerimiento->id_requerimiento,
                now()->format('d/m/Y H:i:s')
            );

            // Notificar a usuarios del área "Administracion"
            $usuariosAdministracion = User::where('area_laboral', 'Administracion')->get();
            foreach ($usuariosAdministracion as $user) {
                $user->notify(new NotificacionAprobado($requerimiento, $mensaje));
            }

            // === 4. Buscar usuario que hizo el requerimiento (por nombre) y notificar ===
            $solicitadoRequerimiento = $requerimiento->solicitado_requerimiento;

            $nombreCompleto = explode(' ', $solicitadoRequerimiento);

            $prepararTexto = function ($texto) {
                return '%' . trim(str_replace(['%', '_'], ['\\%', '\\_'], $texto)) . '%';
            };

            if (count($nombreCompleto) >= 2) {
                $nombre = $prepararTexto($nombreCompleto[0]);
                $apellido = $prepararTexto(implode(' ', array_slice($nombreCompleto, 1)));

                $usuarioNotificado = User::where(function ($query) use ($nombre, $apellido) {
                    $query->whereRaw('LOWER(name) LIKE LOWER(?)', [$nombre])
                        ->whereRaw('LOWER(surname) LIKE LOWER(?)', [$apellido]);
                })->first();

                if ($usuarioNotificado && $usuarioNotificado->id !== $usuarioActual->id) {
                    $usuarioNotificado->notify(new NotificacionAprobado($requerimiento, $mensaje));
                }
            }

            return redirect()->route('logistica.requerimientos.show', $empresaId)
                ->with('success', 'Requerimiento aprobado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->route('logistica.requerimientos.show', $empresaId)
                ->with('error', 'Error al aprobar el requerimiento: ' . $e->getMessage());
        }
    }

    public function pendiente(request $request, $id)
    {
        $request->validate([
            'empresaId' => 'required|integer',
            'rolesAsignado' => 'required|string'
        ]);

        // Obtener el valor de los datos
        $empresaId = $request->input('empresaId');
        $rolAsignado = $request->input('rolesAsignado'); // El rol del usuario enviado en el formulario

        try {
            // Buscar el requerimiento por su ID
            $requerimiento = requerimiento::findOrFail($id);

            // Según el rol, actualizar la columna correspondiente
            if ($rolAsignado == 'logistico') {
                // Si el rol es logistica, actualizar la columna aprobado_logistica
                $requerimiento->aprobado_logistica = 0;
            } elseif ($rolAsignado == 'administradores') {
                // Si el rol es administrador, actualizar la columna aprobado_contabilidad
                $requerimiento->aprobado_contabilidad = 0;
            } elseif ($rolAsignado == 'Gerente') {
                // Si el rol es gerente, actualizar la columna aprobado_requerimiento
                $requerimiento->aprobado_requerimiento = 0;
            }

            // Guardar los cambios en la base de datos
            $requerimiento->save();

            // Redirigir con éxito
            return redirect()->route('logistica.requerimientos.show', $empresaId)
                ->with('success', 'Requerimiento aprobado exitosamente.');
        } catch (\Exception $e) {
            // Manejar el error en caso de que algo falle
            return redirect()->route('logistica.requerimientos.show', $empresaId)
                ->with('error', 'Error al aprobar el requerimiento: ' . $e->getMessage());
        }
    }

    public function eliminar(Request $request, $id)
    {
        $request->validate([
            'empresaId' => 'required|integer',
            'solicitado_requerimiento' => 'required|string',
            'nombre_requerimiento' => 'required|string',
        ]);

        $empresaId = $request->input('empresaId');
        $solicitadoRequerimiento = trim($request->input('solicitado_requerimiento'));
        $nombre_requerimiento = $request->input('nombre_requerimiento');
        try {
            DB::beginTransaction();

            // Buscar el requerimiento
            $requerimiento = Requerimiento::findOrFail($id);

            // Guardar información antes de eliminar
            $requerimientoInfo = [
                'id' => $requerimiento->id_requerimiento,
                'detalles' => [
                    'codigo' => $requerimiento->codigo,
                    'descripcion' => $requerimiento->descripcion,
                    'fecha_creacion' => $requerimiento->created_at,
                    // Agrega otros campos relevantes aquí
                ]
            ];

            // Mejorada la búsqueda del usuario a notificar
            $nombreCompleto = explode(' ', $solicitadoRequerimiento);

            // Función para limpiar y preparar el texto para la búsqueda
            $prepararTexto = function ($texto) {
                return '%' . trim(str_replace(['%', '_'], ['\\%', '\\_'], $texto)) . '%';
            };

            // Si hay al menos un nombre y un apellido
            if (count($nombreCompleto) >= 2) {
                $nombre = $prepararTexto($nombreCompleto[0]);
                // Une el resto como apellido en caso de apellidos compuestos
                $apellido = $prepararTexto(implode(' ', array_slice($nombreCompleto, 1)));

                $usuarioNotificado = User::where(function ($query) use ($nombre, $apellido) {
                    $query->whereRaw('LOWER(name) LIKE LOWER(?)', [$nombre]);
                })->first();

                if ($usuarioNotificado) {
                    // Usuario actual que realiza la eliminación
                    $usuarioEliminador = auth()->user();

                    // Preparar mensaje de notificación
                    $mensaje = sprintf(
                        '%s %s ha eliminado el requerimiento #%s el %s',
                        $usuarioEliminador->name,
                        $usuarioEliminador->surname,
                        $nombre_requerimiento,
                        $requerimiento->codigo ?? $requerimiento->id_requerimiento,
                        now()->format('d/m/Y H:i:s')
                    );
                    // Enviar notificación
                    $usuarioNotificado->notify(new RequirementDeleted($requerimientoInfo, $mensaje));
                } else {
                    // \Log::warning('Usuario no encontrado para notificación', [
                    //     'nombre_busqueda' => $nombreCompleto[0],
                    //     'apellido_busqueda' => implode(' ', array_slice($nombreCompleto, 1)),
                    //     'empresa_id' => $empresaId
                    // ]);
                }
            }

            // Eliminar relaciones
            $requerimiento->materiales()->delete();
            $requerimiento->manoObra()->delete();
            $requerimiento->depositos()->delete();

            // Eliminar el requerimiento principal
            $requerimiento->delete();

            DB::commit();

            return redirect()->route('logistica.requerimientos.show', $empresaId)
                ->with('success', 'Requerimiento eliminado exitosamente.');
        } catch (\Exception $e) {
            DB::rollBack();

            // \Log::error('Error en eliminación de requerimiento', [
            //     'error' => $e->getMessage(),
            //     'trace' => $e->getTraceAsString()
            // ]);

            return redirect()->route('logistica.requerimientos.show', $empresaId)
                ->with('error', 'Error al eliminar el requerimiento: ' . $e->getMessage());
        }
    }

    public function actualizarsustento(Request $request, $id)
    {
        // Validación del archivo
        $request->validate([
            'sustento_requerimiento' => 'nullable|file|mimes:pdf,jpg,jpeg,png,gif|max:2048', // 2MB máximo
        ]);
        $empresaId = $request->input('empresaId');
        // Obtener el requerimiento por ID
        $requerimiento = Requerimiento::findOrFail($id);

        // Si hay un archivo
        if ($request->hasFile('sustento_requerimiento')) {
            // Eliminar el archivo anterior si existe
            if ($requerimiento->sustento_requerimiento && $requerimiento->sustento_requerimiento !== 'default.pdf') {
                // Ruta del archivo anterior en public_path
                $oldFilePath = public_path('storage/sustento_requerimiento/' . $requerimiento->sustento_requerimiento);
                if (file_exists($oldFilePath)) {
                    unlink($oldFilePath); // Elimina el archivo anterior
                }
            }

            // Guardar el nuevo archivo
            $file = $request->file('sustento_requerimiento');
            $fileName = time() . '.' . $file->extension(); // Generar un nombre único para el archivo

            // Mover el archivo a la carpeta public/storage/sustento_requerimiento
            $file->move(public_path('storage/sustento_requerimiento'), $fileName);

            // Actualizar el campo en la base de datos con el nuevo nombre de archivo
            $requerimiento->sustento_requerimiento = $fileName;
            $requerimiento->save(); // Guardar los cambios en la base de datos
        }

        // Redirigir o mostrar mensaje de éxito
        return redirect()->route('logistica.requerimientos.show', $empresaId)
            ->with('success', 'Requerimiento aprobado exitosamente.');
        //return redirect()->route('requerimientos.index')->with('success', 'Sustento actualizado correctamente.');
    }
}
