<?php

namespace App\Http\Controllers;

use App\Models\Empresa;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{

    public function index()
    {
        // Check if the user has the 'view users' permission, except for administrators
        if (auth()->user()->cannot('view users') && !auth()->user()->hasRole('Administrador')) {
            abort(403, 'Unauthorized');
        }

        $users = User::with('roles')->get();
        $roles = Role::all();
        $empresas = Empresa::all(['id', 'razonSocial']);
        return view('permision-rules.user.index', compact('users', 'roles', 'empresas'));
    }

    // public function store(Request $request)
    // {
    //     $request->validate([
    //         'name' => 'required',
    //         'email' => 'required|email|unique:users,email',
    //         'password' => 'required|min:6',
    //         'roles' => 'required|string|exists:roles,id', // Asegúrate de que sea un string y no un array
    //         'permissions' => 'array',
    //     ]);

    //     try {
    //         $user = User::create([
    //             'name' => $request->name,
    //             'email' => $request->email,
    //             'password' => Hash::make($request->password),
    //         ]);

    //         // Asignar el rol al usuario
    //         $user->assignRole(Role::findById($request->roles)); // Usar findById en lugar de find
    //         return redirect()->route('users.index')->with('success', 'Usuario creado exitosamente.');
    //     } catch (\Exception $e) {
    //         return redirect()->route('users.index')->with('error', 'Error al crear el usuario.');
    //     }
    // }
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'roles' => 'required|string|exists:roles,id',
            'empresas' => 'required|array', // Asegúrate de que empresas sea un array
            'empresas.*' => 'exists:empresas,id', // Verifica que cada id de empresa exista
        ]);

        try {
            // Crear el usuario
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            // Asignar el rol al usuario
            $user->assignRole(Role::findById($request->roles));

            // Asociar el usuario con las empresas
            $user->empresas()->attach($request->empresas);

            return redirect()->route('users.index')->with('success', 'Usuario creado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->route('users.index')->with('error', 'Error al crear el usuario: ' . $e->getMessage());
        }
    }

    public function edit(User $user)
    {
        $roles = Role::all();
        $users = User::with('roles')->get();
        $empresas = Empresa::all(); // Obtén todas las empresas
        return view('permision-rules.user.index', compact('user', 'users', 'roles', 'empresas'));
    }
    
    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'roles' => 'required|string|exists:roles,id',
            'empresas' => 'required|array', // Asegúrate de que empresas sea un array
            'empresas.*' => 'exists:empresas,id', // Verifica que cada id de empresa exista
        ]);

        try {
            // Actualiza el usuario
            $user->update($request->only(['name', 'email']));

            // Actualiza la contraseña si se proporciona
            if ($request->filled('password')) {
                $user->update(['password' => Hash::make($request->password)]);
            }

            // Sincroniza el rol del usuario
            $user->syncRoles([Role::findById($request->roles)]);

            // Sincroniza las empresas del usuario
            $user->empresas()->sync($request->empresas);

            return redirect()->route('users.index')->with('success', 'Usuario actualizado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->route('users.index')->with('error', 'Error al actualizar el usuario: ' . $e->getMessage());
        }
    }

    // public function update(Request $request, User $user)
    // {
    //     $request->validate([
    //         'name' => 'required',
    //         'email' => 'required|email|unique:users,email,' . $user->id,
    //         'roles' => 'required|string|exists:roles,id', // Asegúrate de que sea un string y no un array
    //     ]);

    //     try {
    //         $user->update($request->only(['name', 'email']));

    //         if ($request->filled('password')) {
    //             $user->update(['password' => Hash::make($request->password)]);
    //         }

    //         // Sincronizar el rol del usuario
    //         $user->syncRoles([Role::findById($request->roles)]); // Asegúrate de pasar un array con un solo rol
    //         return redirect()->route('users.index')->with('success', 'Usuario actualizado exitosamente.');
    //     } catch (\Exception $e) {
    //         return redirect()->route('users.index')->with('error', 'Error al actualizar el usuario.');
    //     }
    // }

    public function destroy(User $user)
    {
        $user->delete();
        return redirect()->route('users.index')->with('success', 'Usuario eliminado exitosamente.');
    }
}
// {
//     /**
//      * Display a listing of the resource.
//      */
//     public function index()
//     {
//         $users = User::all();
//         return view('permision-rules.user.index', compact('users'));
//     }

//     /**
//      * Store a newly created resource in storage.
//      */
//     public function store(Request $request)
//     {
//         $request->validate([
//             'name' => 'required',
//             'guard_name' => 'required',
//         ]);

//         try {
//             User::create($request->all());
//             return redirect()->route('Users.index')
//                 ->with('success', 'Users created successfully.');
//         } catch (\Exception $e) {
//             return redirect()->route('Users.index')
//                 ->with('error', 'Failed to create Users.');
//         }
//     }

//     /**
//      * Show the form for editing the specified resource.
//      */
//     public function edit(User $user)
//     {
//         $users = User::all();
//         return view('permision-rules.user.index', compact('users', 'user'));
//     }

//     /**
//      * Update the specified resource in storage.
//      */
//     public function update(Request $request, User $user)
//     {
//         $request->validate([
//             'name' => 'required',
//             'guard_name' => 'required',
//         ]);

//         try {
//             $user->update($request->all());
//             return redirect()->route('users.index')
//                 ->with('success', 'Permission updated successfully.');
//         } catch (\Exception $e) {
//             return redirect()->route('users.index')
//                 ->with('error', 'Failed to update permission.');
//         }
//     }

//     /**
//      * Remove the specified resource from storage.
//      */
//     public function destroy(User $users)
//     {
//         $users->delete();
//         return redirect()->route('users.index')
//             ->with('success', 'User deleted successfully.');
//     }
// }
