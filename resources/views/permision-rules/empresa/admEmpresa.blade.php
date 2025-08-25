<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Registrar Empresa') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="container mx-auto w-full">
            <div class="flex flex-wrap">
                <div class="w-full md:w-1/3 px-4 md:mt-0">
                    <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                        <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                            Buscar Empresa
                        </h3>
                        <div class="overflow-auto">
                            <form method="POST" action="{{ route('empresas.obtenerDataEmpresa') }}">
                                @csrf
                                <!-- Name -->
                                <div>
                                    <x-input-label for="ruc" :value="__('ruc')" />
                                    <x-text-input id="ruc" class="block mt-1 w-full" type="text" name="ruc"
                                        :value="old('ruc')" required autofocus autocomplete="ruc" />
                                    <x-input-error :messages="$errors->get('ruc')" class="mt-2" />
                                </div>

                                <div class="flex items-center justify-end mt-4">
                                    <x-primary-button class="ms-4">
                                        {{ __('Validar') }}
                                    </x-primary-button>
                                </div>
                            </form>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                            {{ isset($empresa) && $empresa->id != 0 ? 'Editar Empresa' : 'Crear Empresa' }}
                        </h3>

                        <div class="overflow-auto">
                            <form method="POST"
                                action="{{ isset($empresa->id) && $empresa->id > 0 ? route('empresas.update', $empresa->id) : route('empresas.store') }}">
                                @csrf
                                @if (isset($empresa->id) && $empresa->id > 0)
                                    @method('PUT') <!-- Método PUT para actualizar -->
                                @endif

                                <!-- Razón Social -->
                                <div>
                                    <x-input-label for="razonSocial" :value="__('Razon Social')" />
                                    <x-text-input id="razonSocial" class="block mt-1 w-full" type="text" name="razonSocial"
                                        :value="old('razonSocial', $empresa->razonSocial ?? ($empresa->razonSocial ?? ''))" required autofocus />
                                </div>

                                <!-- Número de Documento -->
                                <div>
                                    <x-input-label for="numeroDocumento" :value="__('Ruc')" />
                                    <x-text-input id="numeroDocumento" class="block mt-1 w-full" type="text" name="numeroDocumento"
                                        :value="old('numeroDocumento', $empresa->numeroDocumento ?? ($empresa->numeroDocumento ?? ''))" required autofocus />
                                </div>

                                <!-- Estado de la Empresa -->
                                <div>
                                    <x-input-label for="estadoempresa" :value="__('Estado')" />
                                    <x-text-input id="estadoempresa" class="block mt-1 w-full" type="text" name="estadoempresa"
                                        :value="old('estadoempresa', $empresa->estadoempresa ?? ($empresa->estado ?? ''))" required autofocus />
                                </div>

                                <!-- Dirección de la Empresa -->
                                <div>
                                    <x-input-label for="direccionempresa" :value="__('Dirección')" />
                                    <x-text-input id="direccionempresa" class="block mt-1 w-full" type="text" name="direccionempresa"
                                        :value="old('direccionempresa', $empresa->direccionempresa ?? ($empresa->direccion ?? ''))" required autofocus />
                                </div>

                                <!-- Distrito de la Empresa -->
                                <div>
                                    <x-input-label for="distritoempresa" :value="__('Distrito')" />
                                    <x-text-input id="distritoempresa" class="block mt-1 w-full" type="text" name="distritoempresa"
                                        :value="old('distritoempresa', $empresa->distritoempresa ?? ($empresa->distrito ?? ''))" required autofocus />
                                </div>
    
                                <!-- Provincia de la Empresa -->
                                <div>
                                    <x-input-label for="provinciaempresa" :value="__('Distrito')" />
                                    <x-text-input id="provinciaempresa" class="block mt-1 w-full" type="text" name="provinciaempresa"
                                        :value="old('provinciaempresa', $empresa->provinciaempresa ?? ($empresa->provincia ?? ''))" required autofocus />
                                </div>

                                <!-- Departamento de la Empresa -->
                                <div>
                                    <x-input-label for="departamentoempresa" :value="__('Distrito')" />
                                    <x-text-input id="departamentoempresa" class="block mt-1 w-full" type="text" name="departamentoempresa"
                                        :value="old('departamentoempresa', $empresa->departamentoempresa ?? ($empresa->departamento ?? ''))" required autofocus />
                                </div>

                                <!-- Botón de acción -->
                                <div class="flex items-center justify-end mt-4">
                                    <x-primary-button class="ml-4">
                                        {{ isset($empresa->id) && $empresa->id > 0 ? __('Actualizar') : __('Guardar') }}
                                    </x-primary-button>
                                </div>
                            </form>

                        </div>

                    </div>
                </div>
                <div class="w-full md:w-2/3 px-4 md:mt-0">
                    <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                        <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Lista de Empresas </h3>
                        <div class="overflow-x-auto">
                            <table
                                class="min-w-full w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                <thead
                                    class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" class="px-6 py-3">ID</th>
                                        <th scope="col" class="px-6 py-3">Razón Social</th>
                                        <th scope="col" class="px-6 py-3">Número de Documento</th>
                                        <th scope="col" class="px-6 py-3">Estado</th>
                                        <th scope="col" class="px-6 py-3">Dirección</th>
                                        <th scope="col" class="px-6 py-3">Editar</th>
                                        <th scope="col" class="px-6 py-3">Eliminar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach ($empresas as $empresa)
                                        <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                            <td class="px-6 py-4">{{ $empresa->id }}</td>
                                            <td class="px-6 py-4">{{ $empresa->razonSocial }}</td>
                                            <td class="px-6 py-4">{{ $empresa->numeroDocumento }}</td>
                                            <td class="px-6 py-4">
                                                <span
                                                    class="{{ $empresa->estadoempresa == 'ACTIVO' ? 'text-green-500' : 'text-red-500' }}">
                                                    {{ $empresa->estadoempresa }}
                                                </span>
                                            </td>
                                            <td class="px-6 py-4">{{ $empresa->direccionempresa }}</td>
                                            <td class="px-6 py-4">
                                                <a href="{{ route('empresas.edit', $empresa->id) }}"
                                                    class="text-blue-600">Editar</a>
                                            </td>
                                            <td class="px-6 py-4">
                                                <form action="{{ route('empresas.destroy', $empresa->id) }}"
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

    {{-- <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-gray-900 dark:text-gray-100">
                    <form method="POST" action="{{ route('recibirParametros') }}">
                        @csrf
                        <!-- Name -->
                        <div>
                            <x-input-label for="ruc" :value="__('ruc')" />
                            <x-text-input id="ruc" class="block mt-1 w-full" type="text" name="ruc"
                                :value="old('ruc')" required autofocus autocomplete="ruc" />
                            <x-input-error :messages="$errors->get('ruc')" class="mt-2" />
                        </div>

                        <div class="flex items-center justify-end mt-4">
                            <x-primary-button class="ms-4">
                                {{ __('Validar') }}
                            </x-primary-button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-gray-900 dark:text-gray-100" id="resultados">
                    <div class="p-6 text-gray-900 dark:text-gray-100" id="resultados">
                        <form method="POST">
                            @csrf

                            <!-- RazonSocial -->
                            <div>
                                <x-input-label for="razonSocial" :value="__('Razon Social')" />
                                <x-text-input id="razonSocial" class="block mt-1 w-full" type="text"
                                    name="razonSocial" :value="old('razonSocial', $empresa->razonSocial ?? '')" required autofocus
                                    autocomplete="razonSocial" />
                                <x-input-error :messages="$errors->get('razonSocial')" class="mt-2" />
                            </div>
                            <!-- NumeroDocumento -->
                            <div>
                                <x-input-label for="numeroRuc" :value="__('Numero RUC')" />
                                <x-text-input id="numeroRuc" class="block mt-1 w-full" type="text" name="numeroRuc"
                                    :value="old('numeroRuc', $empresa->numeroDocumento ?? '')" required autofocus autocomplete="numeroRuc" />
                                <x-input-error :messages="$errors->get('numeroRuc')" class="mt-2" />
                            </div>
                            <!-- Estado -->
                            <div>
                                <x-input-label for="estadoempresa" :value="__('Estado')" />
                                <x-text-input id="estadoempresa" class="block mt-1 w-full" type="text"
                                    name="estadoempresa" :value="old('estadoempresa', $empresa->estado ?? '')" required autofocus
                                    autocomplete="estadoempresa" />
                                <x-input-error :messages="$errors->get('estadoempresa')" class="mt-2" />
                            </div>
                            <!-- Direccion -->
                            <div>
                                <x-input-label for="direccionempresa" :value="__('Direccion')" />
                                <x-text-input id="direccionempresa" class="block mt-1 w-full" type="text"
                                    name="direccionempresa" :value="old('direccionempresa', $empresa->direccion ?? '')" required autofocus
                                    autocomplete="direccionempresa" />
                                <x-input-error :messages="$errors->get('direccionempresa')" class="mt-2" />
                            </div>
                            <!-- Distrito -->
                            <div>
                                <x-input-label for="distritoempresa" :value="__('Distrito')" />
                                <x-text-input id="distritoempresa" class="block mt-1 w-full" type="text"
                                    name="distritoempresa" :value="old('distritoempresa', $empresa->distrito ?? '')" required autofocus
                                    autocomplete="distritoempresa" />
                                <x-input-error :messages="$errors->get('distritoempresa')" class="mt-2" />
                            </div>
                            <!-- Provincia -->
                            <div>
                                <x-input-label for="provinciaempresa" :value="__('Provincia')" />
                                <x-text-input id="provinciaempresa" class="block mt-1 w-full" type="text"
                                    name="provinciaempresa" :value="old('provinciaempresa', $empresa->provincia ?? '')" required autofocus
                                    autocomplete="provinciaempresa" />
                                <x-input-error :messages="$errors->get('provinciaempresa')" class="mt-2" />
                            </div>
                            <!-- Departamento -->
                            <div>
                                <x-input-label for="departamentoempresa" :value="__('Departamento')" />
                                <x-text-input id="departamentoempresa" class="block mt-1 w-full" type="text"
                                    name="departamentoempresa" :value="old('departamentoempresa', $empresa->departamento ?? '')" required autofocus
                                    autocomplete="departamentoempresa" />
                                <x-input-error :messages="$errors->get('departamentoempresa')" class="mt-2" />
                            </div>

                            <div class="flex items-center justify-end mt-4">
                                <x-primary-button class="ms-4">
                                    {{ __('Registrar Empresa') }}
                                </x-primary-button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    </div> --}}
</x-app-layout>
