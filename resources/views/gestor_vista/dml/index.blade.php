<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Gestion DML') }}
        </h2>
    </x-slot>
    <div class="py">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-gray-900 dark:text-gray-100">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {{-- <div class="overflow-x-auto">
                            <h3 class="text-gray-950 dark:text-gray-50">Instalación</h3>
                            <table class="min-w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                <thead
                                    class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" class="px-6 py-3">Tipo Instalación</th>
                                        <th scope="col" class="px-6 py-3">Tipo</th>
                                        <th scope="col" class="px-6 py-3">Empresa</th>
                                        <th scope="col" class="px-6 py-3">Accion</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr
                                        class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <th scope="row"
                                            class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            Instalacion Sanitarias</th>
                                        <td class="px-6 py-4">Instalacion</td>
                                        <td class="px-6 py-4">Construye</td>
                                        <td class="px-6 py-4">
                                            <a href="{{ route('gestorinstalacions', ['empresaId' => $empresaId]) }}"
                                                class="font-medium text-blue-600 dark:text-blue-500 hover:underline">Abrir</a>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="overflow-x-auto">
                            <h3 class="text-gray-950 dark:text-gray-50">Metrados</h3>
                            <table class="min-w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                <thead
                                    class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" class="px-6 py-3">Tipo Instalación</th>
                                        <th scope="col" class="px-6 py-3">Tipo</th>
                                        <th scope="col" class="px-6 py-3">Empresa</th>
                                        <th scope="col" class="px-6 py-3">Accion</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr
                                        class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <th scope="row"
                                            class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            Metrados Sanitarias</th>
                                        <td class="px-6 py-4">Instalacion</td>
                                        <td class="px-6 py-4">Construye</td>
                                        <td class="px-6 py-4">
                                            <a href="{{ route('metradosanitarias.index') }}"
                                                class="font-medium text-blue-600 dark:text-blue-500 hover:underline">Mostrar</a>
                                        </td>
                                    </tr>
                                    <tr
                                        class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <th scope="row"
                                            class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            Metrados Electricas</th>
                                        <td class="px-6 py-4">Metrados</td>
                                        <td class="px-6 py-4">Construye</td>
                                        <td class="px-6 py-4">
                                            <a href="{{ route('metradoelectricas.index') }}"
                                                class="font-medium text-blue-600 dark:text-blue-500 hover:underline">Mostrar</a>
                                        </td>
                                    </tr>
                                    <tr
                                        class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <th scope="row"
                                            class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            Metrados Comunicaciones</th>
                                        <td class="px-6 py-4">Metrados</td>
                                        <td class="px-6 py-4">Construye</td>
                                        <td class="px-6 py-4">
                                            <a href="{{ route('metradocomunicacion.index') }}"
                                                class="font-medium text-blue-600 dark:text-blue-500 hover:underline">Mostrar</a>
                                        </td>
                                    </tr>
                                    <tr
                                        class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <th scope="row"
                                            class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            Metrados Gas</th>
                                        <td class="px-6 py-4">Metrados</td>
                                        <td class="px-6 py-4">Construye</td>
                                        <td class="px-6 py-4">
                                            <a href="{{ route('metrado_gas.index') }}"
                                                class="font-medium text-blue-600 dark:text-blue-500 hover:underline">Mostrar</a>
                                        </td>
                                    </tr>
                                    <tr
                                        class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <th scope="row"
                                            class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            Metrados Estructuras</th>
                                        <td class="px-6 py-4">Metrados</td>
                                        <td class="px-6 py-4">Construye</td>
                                        <td class="px-6 py-4">
                                            <a href="{{ route('metradoestructuras.index') }}"
                                                class="font-medium text-blue-600 dark:text-blue-500 hover:underline">Mostrar</a>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div> --}}

                        <div class="overflow-x-auto col-span-2">
                            <h3 class="text-gray-950 dark:text-gray-50">Memoria Calculo</h3>
                            <table class="min-w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                <thead
                                    class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" class="px-6 py-3">Especialidad</th>
                                        <th scope="col" class="px-6 py-3">Tipo</th>
                                        <th scope="col" class="px-6 py-3">Empresa</th>
                                        <th scope="col" class="px-6 py-3">Accion</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr
                                        class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <th scope="row"
                                            class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            Memoria Calculo views</th>
                                        <td class="px-6 py-4">Memoria Calculo</td>
                                        <td class="px-6 py-4">DML</td>
                                        <td class="px-6 py-4">
                                            <a href="{{ route('gestormcdml', ['empresaId' => $empresaId]) }}"
                                                class="font-medium text-blue-600 dark:text-blue-500 hover:underline">Visualizar</a>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

</x-app-layout>
