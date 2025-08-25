<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class NotificationController extends Controller
{
    public function markAsRead($id)
    {
        try {
            DB::beginTransaction();

            $notification = auth()->user()
                ->notifications()
                ->where('id', $id)
                ->first();

            if ($notification) {
                // Actualizamos directamente en la base de datos
                DB::table('notifications')
                    ->where('id', $id)
                    ->where('notifiable_id', auth()->id())
                    ->update(['read_at' => Carbon::now()]);

                DB::commit();

                return redirect()->back()
                    ->with('success', 'Notificación marcada como leída.');
            }

            DB::rollBack();
            return redirect()->back()
                ->with('error', 'No se encontró la notificación.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Error al marcar la notificación como leída.');
        }
    }

    public function markAllAsRead()
    {
        try {
            DB::beginTransaction();

            // Actualizamos directamente todas las notificaciones no leídas del usuario
            DB::table('notifications')
                ->where('notifiable_id', auth()->id())
                ->where('notifiable_type', get_class(auth()->user()))
                ->whereNull('read_at')
                ->update(['read_at' => Carbon::now()]);

            DB::commit();

            return redirect()->back()
                ->with('success', 'Todas las notificaciones han sido marcadas como leídas.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Error al marcar las notificaciones como leídas.');
        }
    }

    // Método para obtener las notificaciones actualizadas
    public function index()
    {
        $notifications = auth()->user()
            ->notifications()
            ->orderBy('created_at', 'desc')
            ->get();

        $unreadCount = auth()->user()
            ->unreadNotifications()
            ->count();

        return view('notifications.index', compact('notifications', 'unreadCount'));
    }
}
