<?php

namespace App\Http\Controllers;

use App\Models\Empresa;
use Illuminate\Http\Request;

class EmpresaController extends Controller
{
    public function obtenerDataEmpresa(Request $request)
    {
        $token = 'apis-token-10424.XUaCDKAX2Wgac4w6lR7-u39Ael3LTdCc';
        $ruc = $request->input('ruc', 0);
        //$ruc = '10460278975';
        // Iniciar llamada a API
        $curl = curl_init();
        // Buscar ruc sunat
        curl_setopt_array($curl, array(
            CURLOPT_URL => 'https://api.apis.net.pe/v2/sunat/ruc?numero=' . $ruc,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_SSL_VERIFYPEER => 0,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_CUSTOMREQUEST => 'GET',
            CURLOPT_HTTPHEADER => array(
                'Referer: http://apis.net.pe/api-ruc',
                'Authorization: Bearer ' . $token
            ),
        ));

        $response = curl_exec($curl);

        curl_close($curl);
        // Datos de empresas según padron reducido

        $empresa = json_decode($response);
        if (!isset($empresa->id)) {
            $empresa->id = 0; // Asigna 0 si no hay id
        }
        // Obtener todas las empresas para la lista
        $empresas = Empresa::all();

        return view('permision-rules.empresa.admEmpresa', compact('empresa', 'empresas'));
        //var_dump($empresa);
    }

    public function index()
    {
        if (auth()->user()->cannot('view empresas') && !auth()->user()->hasRole('Administrador') && !auth()->user()->hasRole('Gerencia')) {
            abort(403, 'Unauthorized');
        }

        $empresas = Empresa::all();
        return view('permision-rules.empresa.admEmpresa', compact('empresas'));
    }

    
    public function store(Request $request)
    {
        $request->validate([
            'razonSocial' => 'required|string|max:255',
            'numeroDocumento' => 'required|string|max:11',
            'estadoempresa' => 'required|string|max:255',
            'direccionempresa' => 'required|string|max:255',
            'distritoempresa' => 'required|string|max:255',
            'provinciaempresa' => 'required|string|max:255',
            'departamentoempresa' => 'required|string|max:255',
        ]);
        try {
            Empresa::create($request->all());
            return redirect()->route('empresas.index')
                ->with('success', 'Empresa creada exitosamente.');
        } catch (\Exception $e) {
            return redirect()->route('empresas.index')
                ->with('error', 'Error al crear la empresa.');
        }
    }

    public function edit(Empresa $empresa)
    {
        $empresas = Empresa::all();
        //dd($empresas);
        return view('permision-rules.empresa.admEmpresa', compact('empresas', 'empresa'));
    }

    public function update(Request $request, Empresa $empresa)
    {
        $request->validate([
            'razonSocial' => 'required|string|max:255',
            'numeroDocumento' => 'required|string|max:11',
            'estadoempresa' => 'required|string|max:255',
            'direccionempresa' => 'required|string|max:255',
            'distritoempresa' => 'required|string|max:255',
            'provinciaempresa' => 'required|string|max:255',
            'departamentoempresa' => 'required|string|max:255',
        ]);

        try {
            $empresa->update($request->all());
            return redirect()->route('empresas.index')
                ->with('success', 'Empresa actualizada exitosamente.');
        } catch (\Exception $e) {
            return redirect()->route('empresas.index')
                ->with('error', 'Error al actualizar la empresa.');
        }
    }

    public function destroy(Empresa $empresa)
    {
        $empresa->delete();

        return redirect()->route('empresas.index')->with('success', 'Empresa eliminada exitosamente.');
    }
}
