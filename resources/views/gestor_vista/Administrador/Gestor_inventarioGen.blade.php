<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Gestor Inventario') }}
        </h2>
    </x-slot>


    <div class="py-12">
        <div class="container mx-auto w-full">
            <div class="flex flex-wrap">
                <div class="w-full md:w-1/3">
                    <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                        <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4"></h3>
                        <div class="overflow-auto">
                            <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Requerimiento</h3>
                            <form method="POST"
                                action="{{ isset($gestioninventario) ? route('gestorinventarioge.update', $gestioninventario->id_gestion_inv) : route('gestorinventarioge.store') }}">
                                @csrf
                                @if (isset($gestioninventario))
                                    @method('PUT')
                                @endif
                                <div>
                                    <x-input-label for="nombre_gest_inv" :value="__('Nombre Inventario')" />
                                    <x-text-input id="nombre_gest_inv" class="block mt-1 w-full" type="text"
                                        name="nombre_gest_inv"
                                        value="{{ old('nombre_gest_inv', $gestioninventario->nombre_gest_inv ?? '') }}"
                                        required autofocus />
                                </div>
                                <div>
                                    <x-input-label for="area_desiganda" :value="__('Area Designado')" />
                                    <x-text-input id="area_desiganda" class="block mt-1 w-full" type="text"
                                        name="area_desiganda"
                                        value="{{ old('area_desiganda', $gestioninventario->area_desiganda ?? '') }}"
                                        required autofocus />
                                </div>
                                <input type="hidden" name="empresa_id"
                                    value="{{ old('empresa_id', $gestioninventario->empresa_id ?? $empresaId) }}">
                                <div class="flex items-center justify-end mt-4">
                                    <x-primary-button
                                        class="ml-4">{{ isset($gestioninventario) ? __('Actualizar') : __('Guardar') }}</x-primary-button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <div class="w-full md:w-2/3 px-4 mt-4 md:mt-0">
                    <div class="overflow-auto">
                        <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                            <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Lista de
                                Contabilidad</h3>
                            <div class="overflow-x-auto">
                                <table
                                    class="min-w-full w-full text-sm text-center rtl:text-right text-gray-500 dark:text-gray-400">
                                    <thead
                                        class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                        <tr>
                                            <th scope="col" class="px-6 py-3">#</th>
                                            <th scope="col" class="px-6 py-3">Nombre</th>
                                            <th scope="col" class="px-6 py-3">Area Designado</th>
                                            <th scope="col" class="px-6 py-3">Mostrar</th>
                                            <th scope="col" class="px-6 py-3">Editar</th>
                                            <th scope="col" class="px-6 py-3">Eliminar</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        @foreach ($gestioninventarios as $gestioninventario)
                                            <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                                <td class="px-6 py-4">{{ $gestioninventario->id_gestion_inv }}</td>
                                                <td class="px-6 py-4">{{ $gestioninventario->nombre_gest_inv }}</td>
                                                <td class="px-6 py-4">{{ $gestioninventario->area_desiganda }}</td>

                                                <td class="px-6 py-4">
                                                    <a href="{{ route('gestorinventario', $gestioninventario->id_gestion_inv) }}" class="text-green-600">Abrir</a>
                                                </td>
                                                <td class="px-6 py-4">
                                                    <a href="{{ route('gestorinventarioge.edit', $gestioninventario->id_gestion_inv) }}"
                                                        class="text-blue-600">Editar</a>
                                                </td>
                                                <td class="px-6 py-4">
                                                    <form
                                                        action="{{ route('gestorinventarioge.destroy', $gestioninventario->id_gestion_inv) }}"
                                                        method="POST" class="inline">
                                                        @csrf
                                                        @method('DELETE')
                                                        <input type="hidden" name="empresa_id"
                                                            value="{{ old('empresa_id', $gestioninventario->empresa_id ?? $empresaId) }}">
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
    </div>

</x-app-layout>
