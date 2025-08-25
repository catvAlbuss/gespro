<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RequirementCreate extends Notification
{
    use Queueable;
    protected $mensaje;
    protected $requerimiento;

    /**
     * Create a new notification instance.
     */
    public function __construct($requerimiento, $mensaje)
    {
        $this->requerimiento = $requerimiento;
        $this->mensaje = $mensaje;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'requerimiento_id' => $this->requerimiento['id'],
            'mensaje' => $this->mensaje,
            'tipo' => 'Crear_requerimiento',
            'usuario_creado' => auth()->id(),
            'fecha' => now()->toDateTimeString(),
            'detalles' => $this->requerimiento['detalles']
        ];
    }
}
