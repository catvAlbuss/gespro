<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class gestionRoles extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        if ($request->user()->hasRole('administrador')) {
            return view('AdministradorGeneral');
        } elseif ($request->user()->hasRole('gerencia')) {
            return view('GerenteGeneral');
        } else {
            // Redirigir a una vista por defecto o mostrar un error
            return redirect()->route('home')->with('error', 'No tienes permisos para acceder al dashboard.');
        }
    }

    /**
     * Show the form for creating a new resource.
     */
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
