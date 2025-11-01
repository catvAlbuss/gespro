@inject('roles', 'Spatie\Permission\Models\Role')
<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Gestor de Usuario') }}
        </h2>
    </x-slot>


    <div class="py-12">
        <div class="container mx-auto w-full">
            <div class="flex flex-wrap">
                <div class="w-full md:w-1/3 px-4 md:mt-0">
                    <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                        <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                            {{ isset($user) ? 'Editar Usuario' : 'Crear Usuario' }}
                        </h3>
                        <div class="overflow-auto">
                            <form method="POST"
                                action="{{ isset($user) ? route('admin.users.update', $user->id) : route('admin.users.store') }}">
                                @csrf
                                @if (isset($user))
                                    @method('PUT')
                                @endif
                                <div>
                                    <x-input-label for="name" :value="__('Nombre Usuario')" />
                                    <x-text-input id="name" class="block mt-1 w-full" type="text" name="name"
                                        value="{{ old('name', $user->name ?? '') }}" required autofocus />
                                </div>
                                <div>
                                    <x-input-label for="email" :value="__('Correo Electrónico')" />
                                    <x-text-input id="email" class="block mt-1 w-full" type="email" name="email"
                                        value="{{ old('email', $user->email ?? '') }}" required />
                                </div>
                                @if (!isset($user))
                                    <div>
                                        <x-input-label for="password" :value="__('Contraseña')" />
                                        <x-text-input id="password" class="block mt-1 w-full" type="password"
                                            name="password" value="{{ old('password') }}" required />
                                    </div>
                                @endif
                                <div>
                                    <x-input-label for="roles" :value="__('Roles')" />
                                    <x-input-checkbox :name="'roles'" :options="$roles->pluck('name', 'id')->toArray()" :selected="isset($user) && $user->roles->isNotEmpty()
                                        ? $user->roles->first()->id
                                        : null" />
                                    {{-- <x-input-checkbox :name="'roles'" :options="$roles->pluck('name', 'id')->toArray()" :selected="isset($user) ? $user->roles->first()->id : null" /> --}}
                                </div>
                                <div>
                                    <x-input-label for="empresas" :value="__('Empresas')" />
                                    <x-input-checkbox-group name="empresas" :options="$empresas->pluck('razonSocial', 'id')->toArray()" :selected="isset($user) ? $user->empresas->pluck('id')->toArray() : []" />
                                </div>

                                <div class="flex items-center justify-end mt-4">
                                    <x-primary-button class="ml-4">
                                        {{ isset($user) ? __('Actualizar') : __('Guardar') }}
                                    </x-primary-button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <div class="w-full md:w-2/3 px-4 md:mt-0">
                    <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                        <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Lista de Personal - Rol
                        </h3>
                        <div class="overflow-x-auto">
                            <table
                                class="min-w-full w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                <thead
                                    class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" class="px-6 py-3">ID</th>
                                        <th scope="col" class="px-6 py-3">Nombre</th>
                                        <th scope="col" class="px-6 py-3">Correo Electrónico</th>
                                        <th scope="col" class="px-6 py-3">Permisos</th>
                                        <th scope="col" class="px-6 py-3">Empresas</th>
                                        <th scope="col" class="px-6 py-3">Editar</th>
                                        <th scope="col" class="px-6 py-3">Eliminar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach ($users as $user)
                                        <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                            <td class="px-6 py-4">{{ $user->id }}</td>
                                            <td class="px-6 py-4">{{ $user->name }}</td>
                                            <td class="px-6 py-4">{{ $user->email }}</td>
                                            <td class="px-6 py-4">
                                                <ul>
                                                    @foreach ($user->roles as $role)
                                                        <li>{{ $role->name }}</li>
                                                    @endforeach
                                                </ul>
                                            </td>
                                            <td class="px-6 py-4">
                                                <ul>
                                                    @foreach ($user->empresas as $empresa) <!-- Cambia $user->$empresas a $user->empresas -->
                                                        <li>{{ $empresa->razonSocial }}</li>
                                                    @endforeach
                                                </ul>
                                            </td>
                                            <td class="px-6 py-4">
                                                <a href="{{ route('admin.users.edit', $user->id) }}"
                                                    class="text-blue-600">Editar</a>
                                            </td>
                                            <td class="px-6 py-4">
                                                <form action="{{ route('admin.users.destroy', $user->id) }}" method="POST"
                                                    class="inline">
                                                    @csrf
                                                    @method('DELETE')
                                                    <button type="submit" class="text-red-600">Eliminar</button>
                                                </form>
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
