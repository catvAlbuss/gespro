<?php
namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class FormularioEnviado extends Mailable
{
    use Queueable, SerializesModels;

    public $datos;

    public function __construct($datos)
    {
        $this->datos = $datos;
    }

    public function build()
    {
        return $this->view('emails.formulario')
                    ->subject('Solicitud de Acceso recibido');
        // return $this->view('emails.formulario')
        //             ->subject('Nuevo Cotizacion del Rizabal & Asociados  recibido')
        //             ->attach(storage_path('app/' . $this->datos['archivo_path']));
    }
}
