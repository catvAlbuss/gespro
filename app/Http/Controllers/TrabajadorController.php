<?php

namespace App\Http\Controllers;

use App\Models\Empresa;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class TrabajadorController extends Controller
{
    public function obtenerUsuarioDNI(Request $request)
    {
        $token = 'apis-token-10424.XUaCDKAX2Wgac4w6lR7-u39Ael3LTdCc';
        $dni = $request->input('dni', 0);
        $empresaId = $request->input('empresaId', 0);
        // Iniciar llamada a API
        $curl = curl_init();

        // Buscar dni
        curl_setopt_array($curl, array(
            CURLOPT_URL => 'https://api.apis.net.pe/v2/reniec/dni?numero=' . $dni,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_SSL_VERIFYPEER => 0,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 2,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_CUSTOMREQUEST => 'GET',
            CURLOPT_HTTPHEADER => array(
                'Referer: https://apis.net.pe/consulta-dni-api',
                'Authorization: Bearer ' . $token
            ),
        ));

        $response = curl_exec($curl);

        curl_close($curl);
        // Datos listos para usar
        $user = json_decode($response);

        if (!isset($user->id)) {
            $user->id = 0; // Asigna 0 si no hay id
        }
        // Obtener todas las empresas para la lista
        //$users = User::all();
        $users = User::whereHas('empresas', function ($query) use ($empresaId) {
            $query->where('empresa_id', $empresaId);
        })
        ->where('name', '!=', 'Administrador') // Excluir usuarios con nombre "Administrador"
        ->get();

        // var_dump($persona);
        return view('gestor_vista.Administrador.Gestor_registrar_personal', compact('user', 'users', 'empresaId'));
    }

    public function index($empresaId)
    {
        $users = User::whereHas('empresas', function ($query) use ($empresaId) {
            $query->where('empresa_id', $empresaId);
        })
        ->where('name', '!=', 'Administrador') // Excluir usuarios con nombre "Administrador"
        ->get();
    
        $empresas = Empresa::all(['id', 'razonSocial']);
        return view('gestor_vista.Administrador.Gestor_registrar_personal', compact('users', 'empresas', 'empresaId'));
    }


    private function uploadFile($file, $folder)
    {
        $fileName = time() . '.' . $file->getClientOriginalExtension();
        $file->move(public_path('storage/' . $folder), $fileName);
        return $fileName;
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'surname' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'dni_user' => 'required|integer|unique:users,dni_user',
            'phone' => 'required|integer',
            'fecha_nac' => 'required|date',
            'sueldo_base' => 'required|numeric',
            'area_laboral' => 'required|string|max:255',
            'nivel_estudio' => 'required|string|max:255',
            'image_user' => 'nullable|image|max:2048',
            'contratouser' => 'nullable|file|mimes:pdf|max:2048',
            'password' => 'required|min:6',
            'empresaId' => 'required|exists:empresas,id',
        ]);

        try {
            $user = User::create([
                'name' => $request->name,
                'surname' => $request->surname,
                'email' => $request->email,
                'dni_user' => $request->dni_user,
                'phone' => $request->phone,
                'fecha_nac' => $request->fecha_nac,
                'sueldo_base' => $request->sueldo_base,
                'area_laboral' => $request->area_laboral,
                'nivel_estudio' => $request->nivel_estudio,
                'contratouser' => $request->hasFile('contratouser') ? $this->uploadFile($request->file('contratouser'), 'contrato') : null,
                'password' => Hash::make($request->password),
            ]);

            if ($request->hasFile('image_user')) {
                $imageName = time() . '.' . $request->image_user->extension();
                $request->image_user->move(public_path('storage/profile'), $imageName);
                $user->image_user = $imageName;
                $user->save();
            }

            $user->empresas()->attach($request->empresaId);

            $trabajadorRole = Role::firstOrCreate(['name' => 'trabajador']);
            $user->assignRole($trabajadorRole);

            return redirect()->route('gestor-registrarPer', ['empresaId' => $request->empresaId])
                ->with('success', 'Usuario creado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->route('gestor-registrarPer', ['empresaId' => $request->empresaId])
                ->with('error', 'Error al crear el usuario: ' . $e->getMessage());
        }
    }

    public function edit(User $trabajadorregister)
    {
        // Obtener todas las empresas asociadas al trabajador
        $empresas = $trabajadorregister->empresas;  // Esto carga todas las empresas asociadas
        
        // Obtener el ID de la primera empresa asociada al trabajador
        $empresaId = $empresas->isNotEmpty() ? $empresas->first()->id : null;
    
        // Obtener todos los usuarios de la misma empresa que el trabajador, excepto el "Administrador"
        $users = User::whereHas('empresas', function ($query) use ($empresaId) {
            $query->where('empresa_id', $empresaId); // Filtra por la empresa asociada al trabajador
        })
        ->where('name', '!=', 'Administrador') // Excluye al usuario "Administrador"
        ->get();
    
        // Pasamos los datos a la vista
        return view('gestor_vista.Administrador.Gestor_registrar_personal', compact('users', 'trabajadorregister', 'empresaId'));
    }

    public function update(Request $request, User $trabajadorregister)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'surname' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $trabajadorregister->id,
            'dni_user' => 'required|integer|unique:users,dni_user,' . $trabajadorregister->id,
            'phone' => 'required|integer',
            'fecha_nac' => 'required|date',
            'sueldo_base' => 'required|numeric',
            'area_laboral' => 'required|string|max:255',
            'nivel_estudio' => 'required|string|max:255',
            'image_user' => 'nullable|image|max:2048',
            'contratouser' => 'nullable|file|mimes:pdf|max:2048',
        ]);

        try {
            // Actualizar otros campos del usuario
            $trabajadorregister->update([
                'name' => $request->name,
                'surname' => $request->surname,
                'email' => $request->email,
                'dni_user' => $request->dni_user,
                'phone' => $request->phone,
                'fecha_nac' => $request->fecha_nac,
                'sueldo_base' => $request->sueldo_base,
                'area_laboral' => $request->area_laboral,
                'nivel_estudio' => $request->nivel_estudio,
                'contratouser' => $request->hasFile('contratouser') ? $this->uploadFile($request->file('contratouser'), 'contrato') : $trabajadorregister->contratouser,
            ]);

            // Manejar la actualización de la imagen de perfil
            if ($request->hasFile('image_user')) {
                // Eliminar la imagen anterior si existe
                if ($trabajadorregister->image_user && $trabajadorregister->image_user !== 'avatarra.jpeg') {
                    $oldImagePath = public_path('storage/profile/' . $trabajadorregister->image_user);
                    if (file_exists($oldImagePath)) {
                        unlink($oldImagePath);
                    }
                }

                // Guardar la nueva imagen
                $imageName = time() . '.' . $request->image_user->extension();
                $request->image_user->move(public_path('storage/profile'), $imageName);

                // Actualizar el campo image_user en la base de datos
                $trabajadorregister->image_user = $imageName;
            }

            // Guardar los cambios en la base de datos
            $trabajadorregister->save();

            // Obtener el ID de la empresa (asumiendo que es el primero de la relación)
            $empresaId = $trabajadorregister->empresas()->first()->id;

            return redirect()->route('gestor-registrarPer', ['empresaId' => $empresaId])
                ->with('success', 'Contabilidad actualizada exitosamente.');
        } catch (\Exception $e) {
            return redirect()->route('gestor-registrarPer', ['empresaId' => $request->empresa_id])
                ->with('error', 'Error al actualizar la contabilidad: ' . $e->getMessage());
        }
    }

    public function destroy(User $user)
    {
        try {
            // Eliminar la imagen de perfil
            if ($user->image_user && $user->image_user !== 'avatarra.jpeg') {
                $oldImagePath = public_path('storage/profile/' . $user->image_user);
                if (file_exists($oldImagePath)) {
                    unlink($oldImagePath);
                }
            }

            // Eliminar el contrato
            if ($user->contratouser) {
                $oldContractPath = public_path('storage/contrato/' . $user->contratouser);
                if (file_exists($oldContractPath)) {
                    unlink($oldContractPath);
                }
            }

            // Eliminar el usuario
            $user->delete();

            return redirect()->route('users.index')->with('success', 'Usuario eliminado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->route('users.index')->with('error', 'Error al eliminar el usuario: ' . $e->getMessage());
        }
    }
}
