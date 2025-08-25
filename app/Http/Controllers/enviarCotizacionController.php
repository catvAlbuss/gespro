<?php

namespace App\Http\Controllers;

use App\Mail\FormularioEnviado;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class enviarCotizacionController extends Controller
{
    public function enviarCotizacion(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'celular' => 'required|string|max:20',
            'email' => 'required|email|max:255',
            //'archivo' => 'required|file|mimes:pdf|max:10240', // máximo 10MB
        ]);

        $datos = $request->only(['nombre', 'celular', 'email']);

        Mail::to('admon.construyehco@gmail.com')
            ->send(new FormularioEnviado($datos));

        return back()->with('success', 'Formulario enviado con éxito.');
    }
}
