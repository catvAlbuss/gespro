<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Gestor de Permisos') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="container mx-auto w-full">
            <div class="flex flex-wrap">
                <div class="w-full md:w-1/3 px-4 md:mt-0">
                    <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                        <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                            {{ isset($permission) ? 'Editar Permiso' : 'Crear Permiso' }}</h3>
                        <div class="overflow-auto">
                            <form method="POST"
                                action="{{ isset($permission) ? route('permissions.update', $permission->id) : route('permissions.store') }}">
                                @csrf
                                @if (isset($permission))
                                    @method('PUT')
                                @endif

                                <div>
                                    <x-input-label for="name" :value="__('Nombre del Permiso')" />
                                    <x-text-input id="name" class="block mt-1 w-full" type="text" name="name"
                                        value="{{ old('name', $permission->name ?? '') }}" required autofocus />
                                </div>
                                <div>
                                    <x-input-label for="guard_name" :value="__('Descripcion del Permisos')" />
                                    <x-text-input id="guard_name" class="block mt-1 w-full" type="text"
                                        name="guard_name" value="{{ old('guard_name', $permission->guard_name ?? '') }}"
                                        required autofocus />
                                </div>
                                <div class="flex items-center justify-end mt-4">
                                    <x-primary-button class="ml-4">
                                        {{ isset($permission) ? __('Actualizar') : __('Guardar') }}
                                    </x-primary-button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <div class="w-full md:w-2/3 px-4 md:mt-0">
                    <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                        <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Lista de Permisos</h3>
                        <div class="overflow-x-auto">
                            <table
                                class="min-w-full w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                <thead
                                    class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" class="px-6 py-3">ID</th>
                                        <th scope="col" class="px-6 py-3">Nombre</th>
                                        <th scope="col" class="px-6 py-3">Descripcion</th>
                                        <th scope="col" class="px-6 py-3">Editar</th>
                                        <th scope="col" class="px-6 py-3">Eliminar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach ($permissions as $permission)
                                        <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                            <td class="px-6 py-4">{{ $permission->id }}</td>
                                            <td class="px-6 py-4">{{ $permission->name }}</td>
                                            <td class="px-6 py-4">{{ $permission->guard_name }}</td>
                                            <td class="px-6 py-4">
                                                <a href="{{ route('permissions.edit', $permission->id) }}"
                                                    class="text-blue-600">Editar</a>
                                            </td>
                                            <td class="px-6 py-4">
                                                <form action="{{ route('permissions.destroy', $permission->id) }}"
                                                    method="POST" class="inline">
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

    @if (session('success'))
        <script>
            Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: '{{ session('success') }}',
            });
        </script>
    @endif

    @if (session('error'))
        <script>
            Swal.fire({
                icon: 'error',
                title: '¡Error!',
                text: '{{ session('error') }}',
            });
        </script>
    @endif
</x-app-layout>
