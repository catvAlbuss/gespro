<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Gestor de Roles') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="container mx-auto w-full">
            <div class="flex flex-wrap">
                <div class="w-full md:w-1/3 px-4 md:mt-0">
                    <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                        <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                            {{ isset($role) ? 'Editar Roles' : 'Crear Roles' }}
                        </h3>
                        <div class="overflow-auto">
                            <form method="POST"
                                action="{{ isset($role) ? route('admin.roles.update', $role->id) : route('admin.roles.store') }}">
                                @csrf
                                @if (isset($role))
                                    @method('PUT')
                                @endif
                                <div>
                                    <x-input-label for="name" :value="__('Nombre Roles')" />
                                    <x-text-input id="name" class="block mt-1 w-full" type="text" name="name"
                                        value="{{ old('name', $role->name ?? '') }}" required autofocus />
                                </div>
                                <div>
                                    <x-input-label for="guard_name" :value="__('Descripcion de Roles')" />
                                    <x-text-input id="guard_name" class="block mt-1 w-full" type="text"
                                        name="guard_name" value="{{ old('guard_name', $role->guard_name ?? '') }}"
                                        required autofocus />
                                </div>
                                <div>
                                    <x-input-label for="permissions" :value="__('Permisos')" />
                                    <x-input-checkbox-group :name="'permissions'" :options="$permissions->pluck('name', 'id')->toArray()" :selected="isset($role) ? $role->permissions->pluck('id')->toArray() : []" />
                                </div>

                                {{-- <div>
                                    <x-input-label for="permissions" :value="__('Permisos')" />
                                    <x-input-select id="permissions" name="permissions[]" :options="$permissions->pluck('name', 'id')->toArray()" multiple
                                        class="block mt-1 w-full" />
                                          @if (isset($role))
                                        <div>
                                            <h4 class="text-gray-800 dark:text-gray-200">Permisos Seleccionados:</h4>
                                            <ul>
                                                @foreach ($role->permissions as $permission)
                                                    <li class="text-gray-800 dark:text-gray-200">{{ $permission->name }}</li>
                                                @endforeach
                                            </ul>
                                        </div>
                                    @endif
                                    @if (isset($role))
                                        <div>
                                            <h4 class="text-gray-800 dark:text-gray-200">Permisos Seleccionados:</h4>
                                            <ul>
                                                @foreach ($role->permissions as $permission)
                                                    <li class="text-gray-800 dark:text-gray-200">{{ $permission->name }}
                                                    </li>
                                                @endforeach
                                            </ul>
                                        </div>
                                    @endif
                                </div> --}}
                                <div class="flex items-center justify-end mt-4">
                                    <x-primary-button class="ml-4">
                                        {{ isset($role) ? __('Actualizar') : __('Guardar') }}
                                    </x-primary-button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <div class="w-full md:w-2/3 px-4 md:mt-0">
                    <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                        <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Lista de Roles -
                            Permisos</h3>
                        <div class="overflow-x-auto">
                            <table
                                class="min-w-full w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                <thead
                                    class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" class="px-6 py-3">ID</th>
                                        <th scope="col" class="px-6 py-3">Nombre</th>
                                        <th scope="col" class="px-6 py-3">Descripcion</th>
                                        <th scope="col" class="px-6 py-3">Permisos</th>
                                        <th scope="col" class="px-6 py-3">Editar</th>
                                        <th scope="col" class="px-6 py-3">Eliminar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach ($roles as $role)
                                        <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                            <td class="px-6 py-4">{{ $role->id }}</td>
                                            <td class="px-6 py-4">{{ $role->name }}</td>
                                            <td class="px-6 py-4">{{ $role->guard_name }}</td>
                                            <td class="px-6 py-4">
                                                <ul>
                                                    @foreach ($role->permissions as $permission)
                                                        <li>{{ $permission->name }}</li>
                                                    @endforeach
                                                </ul>
                                            </td>
                                            <td class="px-6 py-4">
                                                <a href="{{ route('admin.roles.edit', $role->id) }}"
                                                    class="text-blue-600">Editar</a>
                                            </td>
                                            <td class="px-6 py-4">
                                                <form action="{{ route('admin.roles.destroy', $role->id) }}" method="POST"
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
