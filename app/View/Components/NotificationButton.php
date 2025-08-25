<?php

namespace App\View\Components;

use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class NotificationButton extends Component
{
    public $notifications;
    public $unreadNotifications;

    public function __construct()
    {
        $user = auth()->user();  // Obtener el usuario autenticado
        $this->notifications = $user->notifications;  // Obtener todas las notificaciones
        $this->unreadNotifications = $user->unreadNotifications;  // Obtener las notificaciones no leídas
    }

    public function render()
    {
        return view('components.notification-button');
    }
}
