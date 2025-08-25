<?php

namespace App\Http\Controllers;

use App\Models\Empresa;
use Illuminate\Http\Request;

class admingestController extends Controller
{

    public function index(Request $request)
    {
        // Recuperamos el ID de la empresa seleccionada desde el formulario
        $empresaId = $request->input('empresa_id');

        // Verifica si $empresaId está presente
        if (!$empresaId) {
            // Si no se ha enviado un empresa_id, puedes hacer una redirección o manejar el error
            return redirect()->route('logistico.dashboard')->with('error', 'No se seleccionó ninguna empresa.');
        }

        // Ahora solo pasamos el empresaId a la vista
        return view('gestor_vista.Logistico.panelLogisctico', compact('empresaId'));
    }

    public function indexadm(Request $request)
    {
        // Recuperamos el ID de la empresa seleccionada desde el formulario
        $empresaId = $request->input('empresa_id');
        // Verifica si $empresaId está presente
        if (!$empresaId) {
            // Si no se ha enviado un empresa_id, puedes hacer una redirección o manejar el error
            return redirect()->route('administradores.dashboard')->with('error', 'No se seleccionó ninguna empresa.');
        }
        // Ahora solo pasamos el empresaId a la vista
        return view('gestor_vista.AdmContabilidad.gestor_admCon', compact('empresaId'));
    }

  
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
