<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use Illuminate\Http\Request;

class permissionController extends Controller
{
    public function index()
    {
        if (auth()->user()->cannot('view permissions') && !auth()->user()->hasRole('Administrador')) {
            abort(403, 'Unauthorized');
        }
        
        $permissions = Permission::all();
        return view('permision-rules.permission.index', compact('permissions'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'guard_name' => 'required',
        ]);

        try {
            Permission::create($request->all());
            return redirect()->route('permissions.index')
                ->with('success', 'Permission created successfully.');
        } catch (\Exception $e) {
            return redirect()->route('permissions.index')
                ->with('error', 'Failed to create permission.');
        }
    }

    public function edit(Permission $permission)
    {
        $permissions = Permission::all();
        return view('permision-rules.permission.index', compact('permissions', 'permission'));
    }

    public function update(Request $request, Permission $permission)
    {
        $request->validate([
            'name' => 'required',
            'guard_name' => 'required',
        ]);

        try {
            $permission->update($request->all());
            return redirect()->route('permissions.index')
                ->with('success', 'Permission updated successfully.');
        } catch (\Exception $e) {
            return redirect()->route('permissions.index')
                ->with('error', 'Failed to update permission.');
        }
    }

    public function destroy(Permission $permission)
    {
        $permission->delete();
        return redirect()->route('permissions.index')
            ->with('success', 'Permission deleted successfully.');
    }
}
