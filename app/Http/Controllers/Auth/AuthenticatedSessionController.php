<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): View
    {
        return view('auth.login');
    }

    /**
     * Handle an incoming authentication request.
     */
    // public function store(LoginRequest $request): RedirectResponse
    // {
    //     $request->authenticate();

    //     $request->session()->regenerate();

    //     return redirect()->intended(route('dashboard', absolute: false));
    // }
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();
        $request->session()->regenerate();

        $user = Auth::user();
        if (!$user) {
            return redirect()->route('login'); // Manejo del caso en que el usuario no está autenticado
        }

        // Obtener la primera empresa asociada (o decidir otra lógica)
        // $empresa = $user->empresas()->first(); // Obtiene la primera empresa asociada
        // if ($empresa) {
        //     session(['empresa_id' => $empresa->id]); // Almacenar el empresa_id en la sesión
        // }
        // Obtener las empresas asociadas al usuario
        $empresas = $user->empresas; // Esto obtiene todas las empresas asociadas

        if ($empresas->count() === 1) {
            // Si solo tiene una empresa, guardamos el ID de esa empresa
            session(['empresa_id' => $empresas->first()->id]);
        } elseif ($empresas->count() > 1) {
            // Si tiene varias empresas, guarda un array con los IDs y las razones sociales
            $empresasArray = $empresas->map(function ($empresa) {
                return ['id' => $empresa->id, 'razonSocial' => $empresa->razonSocial];
            });
            session(['empresa_id' => $empresasArray]); // Guardar las empresas en la sesión
        }else {
            // Si no tiene ninguna empresa, manejar el caso según lo necesites
            session(['empresa_id' => null]); // O alguna lógica por defecto
        }


        // dd($user->roles);
        // dd($request->path(), $user->roles->contains('id', 6));

        if ($user->roles->contains('id', 1) && !$request->is('admin/dashboard')) {
            //dd('Redirigiendo a admin.dashboard');
            return redirect()->route('admin.dashboard');
        } elseif ($user->roles->contains('id', 2) && !$request->is('manager/dashboard')) {
            //dd('Redirigiendo a manager.dashboard');
            return redirect()->route('manager.dashboard');
        } elseif ($user->roles->contains('id', 3) && !$request->is('administradores/dashboard')) {
            //dd('Redirigiendo a administradores.dashboard');
            return redirect()->route('administradores.dashboard');
        } elseif ($user->roles->contains('id', 4) && !$request->is('logistico/dashboard')) {
            //dd('Redirigiendo a logistico.dashboard');
            return redirect()->route('logistico.dashboard');
        } elseif ($user->roles->contains('id', 5) && !$request->is('jefe/dashboard')) {
            //dd('Redirigiendo a jefe.dashboard');
            return redirect()->route('jefe.dashboard');
        } elseif ($user->roles->contains('id', 6) && !$request->is('trabajador/dashboard')) {
            //dd('Redirigiendo a trabajador.dashboard');
            return redirect()->route('trabajador.dashboard');
        }


        return redirect()->intended(route('dashboard', absolute: false));
    }

    // public function store(LoginRequest $request): RedirectResponse
    // {
    //     $request->authenticate();

    //     $request->session()->regenerate();

    //     $user = Auth::user();
    //     if (!$user) {
    //         return redirect()->route('login'); // Asegúrate de manejar el caso en que el usuario no está autenticado
    //     }

    //     if ($user->roles->contains('id', 1) && !$request->is('admin/dashboard')) { // Verificar si el usuario tiene el rol con ID 1
    //         return redirect()->route('admin.dashboard');
    //     } elseif ($user->roles->contains('id', 2) && !$request->is('manager/dashboard')) { // Verificar si el usuario tiene el rol con ID 2
    //         return redirect()->route('manager.dashboard');
    //     } elseif ($user->roles->contains('id', 3) && !$request->is('jefe/dashboard')) {
    //         return redirect()->route('jefe.dashboard');
    //     }

    //     return redirect()->intended(route('dashboard', absolute: false));
    // }
    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
