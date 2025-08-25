<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RequirementDeleted extends Notification
{
    use Queueable;

    protected $requerimiento;
    protected $mensaje;

    public function __construct($requerimiento, $mensaje)
    {
        $this->requerimiento = $requerimiento;
        $this->mensaje = $mensaje;
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'requerimiento_id' => $this->requerimiento['id'],
            'mensaje' => $this->mensaje,
            'tipo' => 'eliminacion_requerimiento',
            'usuario_eliminador_id' => auth()->id(),
            'fecha' => now()->toDateTimeString(),
            'detalles' => $this->requerimiento['detalles']
        ];
    }
}
