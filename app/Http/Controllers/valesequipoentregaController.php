<?php

namespace App\Http\Controllers;

use App\Models\inventario;
use App\Models\User;
use App\Models\valesequipoentrega;
use Illuminate\Http\Request;

class valesequipoentregaController extends Controller
{
    public function redireccionvalesentregas($empresaId)
    {
        // Obtener los vales de equipo de entrega filtrados por empresaId
        $valeseqentregas = valesequipoentrega::with(['usuario', 'inventario']) // Cargamos las relaciones 'usuario' e 'inventario'
            ->whereHas('usuario', function ($query) use ($empresaId) {
                // Filtrar por empresaId en la relación con Usuario
                $query->whereHas('empresas', function ($query) use ($empresaId) {
                    $query->where('empresa_id', $empresaId);
                });
            })
            ->get();

        // Obtener los trabajadores (usuarios) asociados a la empresa
        $trabajadores = User::whereHas('empresas', function ($query) use ($empresaId) {
            $query->where('empresa_id', $empresaId);
        })->get();

        // Obtener los inventarios asociados a la empresa
        $inventarios = inventario::whereHas('gestionInventario', function ($query) use ($empresaId) {
            $query->where('empresa_designado', $empresaId); // Suponiendo que 'empresa_designado' es el campo de la relación
        })->get();

        // Pasar los datos a la vista
        return view('gestor_vista.Logistico.gestor_vales_entrega', compact(
            'valeseqentregas', // Los vales de entrega
            'trabajadores',    // Los trabajadores (usuarios)
            'inventarios',     // Los inventarios
            'empresaId'        // El ID de la empresa
        ));
    }

    public function getProductos(Request $request, $empresaId)
    {
        // Obtener el término de búsqueda (si existe)
        $search = $request->get('q'); // 'q' es el parámetro de búsqueda en Select2

        // Recuperar los productos de la empresa seleccionada que coinciden con el término de búsqueda
        $productos = inventario::query()
            ->join('gestioninventarios', 'inventarios.inventario_designado', '=', 'gestioninventarios.id_gestion_inv') // Realizamos el join con gestioninventarios
            ->where('gestioninventarios.empresa_designado', $empresaId) // Filtramos por empresa_id en gestioninventarios
            ->where('inventarios.nombre_producto', 'like', '%' . $search . '%') // Filtramos por nombre de producto
            ->get(['inventarios.id_inventario', 'inventarios.nombre_producto', 'inventarios.Stockactual']); // Seleccionamos los campos necesarios de inventarios

        // Formatear los productos para que Select2 los pueda manejar
        return response()->json([
            'results' => $productos->map(function ($item) {
                return [
                    'id' => $item->id_inventario,
                    'text' => $item->nombre_producto,
                    'stockactual' => $item->Stockactual, // Añadimos el stock actual
                ];
            })
        ]);
    }

    public function searchVales(Request $request)
    {
        $searchTerm = $request->input('searchTerm');
        $vales = valesequipoentrega::where('usuario.name', 'like', '%' . $searchTerm . '%')
            ->orWhere('usuario.surname', 'like', '%' . $searchTerm . '%')
            ->orWhere('inventario.nombre_producto', 'like', '%' . $searchTerm . '%')
            ->join('usuario', 'vales_entrega.usuario_id', '=', 'usuario.id')
            ->join('inventario', 'vales_entrega.inventario_id', '=', 'inventario.id')
            ->get();

        return response()->json($vales);
    }
    // Método store para registrar un nuevo Vale de Entrega
    public function store(Request $request)
    {
        // Validamos los datos del formulario
        $request->validate([
            'fecha_entregado' => 'required|date',
            'cantidad_entrega' => 'required|numeric|min:1',
            'estado_prod' => 'required|string',
            'usuario_designado' => 'required|exists:users,id',
            'inventario_designado' => 'required|exists:inventarios,id_inventario',
            'empresa_id' => 'required|integer',
        ]);
        $empresaId = $request->input('empresa_id');
        // Creamos un nuevo Vale de Entrega
        valesequipoentrega::create([
            'fecha_entregado' => $request->input('fecha_entregado'),
            'cantidad_entrega' => $request->input('cantidad_entrega'),
            'estado_prod' => $request->input('estado_prod'),
            'usuario_designado' => $request->input('usuario_designado'),
            'inventario_designado' => $request->input('inventario_designado'),
        ]);

        // Redirigir a la página principal con un mensaje de éxito
        return redirect()->route('gestor_valesentrega', ['empresaId' => $empresaId])
            ->with('success', 'Vale de entrega creado correctamente');
    }

    public function edit(string $id, Request $request)
    {
        $empresaId = $request->query('empresa_id'); // Obtén el parametro de empresa_id de la URL

        // Obtener el vale de entrega por su id
        $vale = valesequipoentrega::findOrFail($id); // Encuentra el vale de entrega o lanza un error 404 si no se encuentra.

        // Cargar relaciones (usuario, inventario)
        $vale->load('usuario', 'inventario');

        // Obtener los trabajadores (usuarios) asociados a la empresa
        $trabajadores = User::whereHas('empresas', function ($query) use ($empresaId) {
            $query->where('empresa_id', $empresaId);
        })->get();

        // Obtener los inventarios asociados a la empresa
        $inventarios = Inventario::whereHas('gestionInventario', function ($query) use ($empresaId) {
            $query->where('empresa_designado', $empresaId);
        })->get();

        // Obtener los vales de equipo de entrega filtrados por empresaId
        $valeseqentregas = valesequipoentrega::with(['usuario', 'inventario'])
            ->whereHas('usuario', function ($query) use ($empresaId) {
                $query->whereHas('empresas', function ($query) use ($empresaId) {
                    $query->where('empresa_id', $empresaId);
                });
            })
            ->get();

        // Pasar los datos a la vista de edición
        return view('gestor_vista.Logistico.gestor_vales_entrega', compact('vale', 'trabajadores', 'inventarios', 'valeseqentregas', 'empresaId'));
    }

    // Método update para actualizar un Vale de Entrega
    public function update(Request $request, string $id)
    {
        // Validamos los datos del formulario
        $request->validate([
            'fecha_entregado' => 'required|date',
            'cantidad_entrega' => 'required|numeric|min:1',
            'estado_prod' => 'required|string',
            'usuario_designado' => 'required|exists:users,id',
            'inventario_designado' => 'required|exists:inventarios,id_inventario',
            'empresa_id' => 'required|integer',
        ]);
        $empresaId = $request->input('empresa_id');
        // Buscar el Vale de Entrega por su ID
        $vale = valesequipoentrega::findOrFail($id);

        // Actualizar los datos del Vale de Entrega
        $vale->update([
            'fecha_entregado' => $request->input('fecha_entregado'),
            'cantidad_entrega' => $request->input('cantidad_entrega'),
            'estado_prod' => $request->input('estado_prod'),
            'usuario_designado' => $request->input('usuario_designado'),
            'inventario_designado' => $request->input('inventario_designado'),
        ]);

        // Redirigir a la página principal con un mensaje de éxito
        return redirect()->route('gestor_valesentrega', ['empresaId' => $empresaId])
            ->with('success', 'Vale de entrega creado correctamente');
    }

    public function destroy(Request $request, string $id)
    {
        $empresaId = $request->input('empresa_id');
        // Buscar el Vale de Entrega por su ID
        $vale = valesequipoentrega::find($id);

        // Verificar si el Vale de Entrega existe
        if (!$vale) {
            return redirect()->route('gestor_valesentrega', ['empresaId' => $empresaId])->with('error', 'Vale de entrega no encontrado.');
        }

        // Eliminar el registro
        $vale->delete();

        // Redirigir a la lista de vales de entrega con un mensaje de éxito
        return redirect()->route('gestor_valesentrega', ['empresaId' => $empresaId])
            ->with('success', 'Vale de entrega eliminado correctamente.');
    }

    public function listadoEquipos($trabajadorId)
    {
        // Obtener los vales de equipo filtrados por 'usuario_designado' (trabajadorId)
        $valeseqentregas = valesequipoentrega::with(['usuario', 'inventario']) // Relación con 'usuario' e 'inventario'
            ->where('usuario_designado', $trabajadorId) // Filtrar por trabajadorId
            ->get();

        // Formatear los datos para enviarlos al frontend
        $valesData = $valeseqentregas->map(function ($vale) {
            return [
                'id_vaeqen' => $vale->id_vaeqen,
                'fecha_entregado' => $vale->fecha_entregado,
                'cantidad_entrega' => $vale->cantidad_entrega,
                'estado_prod' => $vale->estado_prod,
                'usuario' => [
                    'name' => $vale->usuario->name,        // Nombre del usuario (trabajador)
                    'username' => $vale->usuario->surname // Username del usuario (trabajador)
                ],
                'inventario' => [
                    'nombre_equipo' => $vale->inventario->nombre_producto, // Nombre del equipo entregado
                    'codigo_inventario' => $vale->inventario->id_inventario // Código o identificador del equipo
                ]
            ];
        });

        // Retornar los datos en formato JSON para el frontend
        return response()->json($valesData);
    }
}
