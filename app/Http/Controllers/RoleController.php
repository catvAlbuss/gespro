<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    // public function index()
    // {
    //     $roles = Role::with('permissions')->get();
    //     $permissions = Permission::all();
    //     return view('permision-rules.role.index', compact('roles', 'permissions'));
    // }
    public function index()
    {
        // Check if the user has the 'view roles' permission, except for administrators
        if (auth()->user()->cannot('view roles') && !auth()->user()->hasRole('Administrador')) {
            abort(403, 'Unauthorized');
        }

        $roles = Role::with('permissions')->get();
        $permissions = Permission::all();
        return view('permision-rules.role.index', compact('roles', 'permissions'));
    }
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'guard_name' => 'required',
            'permissions' => 'array',
        ]);

        try {
            $role = Role::create($request->only(['name', 'guard_name']));
            $role->permissions()->sync($request->permissions);
            return redirect()->route('roles.index')->with('success', 'Role created successfully.');
        } catch (\Exception $e) {
            return redirect()->route('roles.index')->with('error', 'Failed to create role.');
        }
    }

    public function edit(Role $role)
    {
        $roles = Role::with('permissions')->get();
        $permissions = Permission::all();
        return view('permision-rules.role.index', compact('role', 'roles', 'permissions'));
    }

    public function update(Request $request, Role $role)
    {
        $request->validate([
            'name' => 'required',
            'guard_name' => 'required',
            'permissions' => 'array',
        ]);

        try {
            $role->update($request->only(['name', 'guard_name']));
            $role->permissions()->sync($request->permissions);
            return redirect()->route('roles.index')->with('success', 'Role updated successfully.');
        } catch (\Exception $e) {
            return redirect()->route('roles.index')->with('error', 'Failed to update role.');
        }
    }

    public function destroy(Role $role)
    {
        $role->delete();
        return redirect()->route('roles.index')->with('success', 'Role deleted successfully.');
    }
}
// class RoleController extends Controller
// {
//     /**
//      * Display a listing of the resource.
//      */
//     public function index()
//     {
//         $roles = Roles::all();
//         return view('permision-rules.role.index', compact('roles'));
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
//             Roles::create($request->all());
//             return redirect()->route('roles.index')
//                 ->with('success', 'Roles created successfully.');
//         } catch (\Exception $e) {
//             return redirect()->route('roles.index')
//                 ->with('error', 'Failed to create roles.');
//         }
//     }
    
//     /**
//      * Show the form for editing the specified resource.
//      */
//     public function edit(Roles $role)
//     {
//         $roles = Roles::all();
//         return view('permision-rules.role.index', compact('roles', 'role'));
//     }
    

//     /**
//      * Update the specified resource in storage.
//      */
//     public function update(Request $request, Roles $roles)
//     {
//         $request->validate([
//             'name' => 'required',
//             'guard_name' => 'required',
//         ]);

//         try {
//             $roles->update($request->all());
//             return redirect()->route('roles.index')
//                 ->with('success', 'roles updated successfully.');
//         } catch (\Exception $e) {
//             return redirect()->route('roles.index')
//                 ->with('error', 'Failed to update roles.');
//         }
//     }

//     /**
//      * Remove the specified resource from storage.
//      */
//     public function destroy(Roles $roles)
//     {
//         $roles->delete();
//         return redirect()->route('roles.index')
//             ->with('success', 'Roles deleted successfully.');
//     }
// }
