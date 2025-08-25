<?php

namespace App\Http\Controllers;

use App\Models\depositorequerimiento;
use App\Models\manoobrarequerimiento;
use App\Models\materialrequerimiento;
use App\Models\Proyecto;
use App\Models\requerimiento;
use App\Models\User;
use App\Notifications\RequirementDeleted;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\Console\Input\Input;

class RequerimientoController extends Controller
{


    public function create($empresaId)
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
            'nro_banco_req' => 'required|integer|max:999999999999999999999999',
            'cci_req' => 'required|integer|max:999999999999999999999999',
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
        // Validar los datos del request
        $validatedData = $request->validate([
            'id_mano_obra' => 'required|integer',
            'descripcion_manoobra' => 'required|string|max:100',
            'cantidad_manoobra' => 'required|integer',
            'precio_uni_manoobra' => 'required|numeric',
            'id_requerimientos' => 'required|integer',
        ]);

        try {
            // Obtener el ID del requerimiento
            $id_requerimientos = $validatedData['id_requerimientos'];

            // Buscar el modelo usando el ID de la mano de obra
            $obra = manoobrarequerimiento::findOrFail($validatedData['id_mano_obra']);

            // Preparar los datos a actualizar
            $data = $request->only(['descripcion_manoobra', 'cantidad_manoobra', 'precio_uni_manoobra']);

            // Calcular el total
            $data['total_manoobra'] = $validatedData['cantidad_manoobra'] * $validatedData['precio_uni_manoobra'];

            // Actualizar el modelo
            $obra->update($data);

            // Redireccionar a la ruta de edición del requerimiento con el ID correspondiente
            return redirect()->route('gestorrequerimientos.edit', $id_requerimientos,)
                ->with('success', 'Mano de obra actualizada exitosamente.');
        } catch (\Exception $e) {
            // Manejo de errores en caso de excepción
            return redirect()->route('gestorrequerimientos.edit', $id_requerimientos)
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
            return redirect()->route('gestorrequerimientos.edit', $id_requerimiento)->with('success', 'Mano de obra eliminada exitosamente.');
        } catch (\Exception $e) {
            return redirect()->route('gestorrequerimientos.edit', $id_requerimiento)->with('error', 'Error al eliminar la mano de obra: ' . $e->getMessage());
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
            $data = $request->only(['descripciondescripcion_material_req_material', 'unidad', 'cantidad_material_req', 'precio_unitario_matreq']);

            // Calcular el total
            $data['total_material_req'] = $validatedData['cantidad_material_req'] * $validatedData['precio_unitario_matreq'];

            // Actualizar el modelo
            $material->update($data);

            // Redireccionar
            return redirect()->route('gestorrequerimientos.edit', $validatedData['id_requerimientos'])
                ->with('success', 'Material actualizado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->route('gestorrequerimientos.edit', $validatedData['id_requerimientos'])
                ->with('error', 'Error al actualizar el material.');
        }
    }

    public function eliminarmateriales(Request $request, $id_materiales_req)
    {
        // Validar que el id_requerimientos se ha enviado
        $request->validate([
            'id_requerimientos' => 'required|integer',
        ]);

        try {
            // Captura el ID del requerimiento
            $id_requerimiento = $request->input('id_requerimientos');

            // Encuentra el material por ID
            $material = MaterialRequerimiento::findOrFail($id_materiales_req);

            // Elimina el material
            $material->delete();

            // Redirecciona a la vista de edición del requerimiento
            return redirect()->route('gestorrequerimientos.edit', $id_requerimiento)
                ->with('success', 'Material eliminado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->route('gestorrequerimientos.edit', $id_requerimiento)
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
            'dni_req' => 'required|string|max:8', // Asegúrate de que el tamaño sea el adecuado
            'id_requerimientos' => 'required|integer',
        ]);
        //var_dump($validatedData);
        try {
            $deposito = depositorequerimiento::findOrFail($validatedData['id_depositoreq']);
            $data = $request->only(['banco_req', 'nro_banco_req', 'cci_req', 'titular_req', 'dni_req']);

            // Actualizar el modelo
            $deposito->update($data);

            // Redireccionar
            return redirect()->route('gestorrequerimientos.edit', $validatedData['id_requerimientos'])
                ->with('success', 'Depósito actualizado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->route('gestorrequerimientos.edit', $validatedData['id_requerimientos'])
                ->with('error', 'Error al actualizar el depósito.');
        }
    }

    public function aprobar(Request $request, $id)
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
                $requerimiento->aprobado_logistica = 1;
            } elseif ($rolAsignado == 'administradores') {
                // Si el rol es administrador, actualizar la columna aprobado_contabilidad
                $requerimiento->aprobado_contabilidad = 1;
            } elseif ($rolAsignado == 'Gerente') {
                // Si el rol es gerente, actualizar la columna aprobado_requerimiento
                $requerimiento->aprobado_requerimiento = 1;
            }

            // Guardar los cambios en la base de datos
            $requerimiento->save();

            // Redirigir con éxito
            return redirect()->route('gestorrequerimientos.show', $empresaId)
                ->with('success', 'Requerimiento aprobado exitosamente.');
        } catch (\Exception $e) {
            // Manejar el error en caso de que algo falle
            return redirect()->route('gestorrequerimientos.show', $empresaId)
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
            return redirect()->route('gestorrequerimientos.show', $empresaId)
                ->with('success', 'Requerimiento aprobado exitosamente.');
        } catch (\Exception $e) {
            // Manejar el error en caso de que algo falle
            return redirect()->route('gestorrequerimientos.show', $empresaId)
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

            return redirect()->route('gestorrequerimientos.show', $empresaId)
                ->with('success', 'Requerimiento eliminado exitosamente.');
        } catch (\Exception $e) {
            DB::rollBack();

            // \Log::error('Error en eliminación de requerimiento', [
            //     'error' => $e->getMessage(),
            //     'trace' => $e->getTraceAsString()
            // ]);

            return redirect()->route('gestorrequerimientos.show', $empresaId)
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
        return redirect()->route('gestorrequerimientos.show', $empresaId)
        ->with('success', 'Requerimiento aprobado exitosamente.');
        //return redirect()->route('requerimientos.index')->with('success', 'Sustento actualizado correctamente.');
    }
}
