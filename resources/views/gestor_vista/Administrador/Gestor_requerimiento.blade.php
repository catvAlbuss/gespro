<x-app-layout>

    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Listado de Requerimientos') }}
            <div class="mt-4">
                <a href="{{ route('logistica.requerimientos.crearreque', ['empresaId' => $empresaId]) }}"
                    class="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-500 active:bg-blue-700 focus:outline-none focus:border-blue-700 focus:ring ring-blue-200 disabled:opacity-25 transition">
                    {{ __('Registrar Requerimiento') }}
                </a>
            </div>
        </h2>
    </x-slot>
    <link rel="stylesheet" href="https://cdn.datatables.net/2.1.8/css/dataTables.tailwindcss.css">
    <script src="https://code.jquery.com/jquery-3.7.1.js"></script>
    <script src="https://cdn.tailwindcss.com/"></script>
    <script src="https://cdn.datatables.net/2.1.8/js/dataTables.js"></script>
    <script src="https://cdn.datatables.net/2.1.8/js/dataTables.tailwindcss.js"></script>
    <script src="https://cdn.tailwindcss.com/"></script>
    
    <div class="py-2">
        <div class="max-w-full mx-auto sm:px-6 lg:px-8">
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-gray-900 dark:text-gray-100">
                    <div class="overflow-x-auto">
                        <div>
                            <h2 class="text-lg font-semibold mb-4 text-gray-950 dark:text-white">Requerimientos
                                Desaprobados
                            </h2>
                            <table id="DesaprobadoTable"
                                class="min-w-full w-full table-auto text-sm text-center rtl:text-right text-gray-500 dark:text-gray-400">
                                <thead
                                    class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" class="px-6 py-3 text-center">#</th>
                                        <th scope="col" class="px-6 py-3 text-center">Proyecto</th>
                                        <th scope="col" class="px-6 py-3 text-center">Descripción</th>
                                        <th scope="col" class="px-6 py-3 text-center">Fecha</th>
                                        <th scope="col" class="px-6 py-3 text-center">Solicitado Por</th>
                                        <th scope="col" class="px-6 py-3 text-center">Monto Solicitado</th>
                                        <th scope="col" class="px-6 py-3 text-center">Estado</th>
                                        <th scope="col" class="px-6 py-3 text-center">Mostrar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach ($requerimientos->where('estado', 'Desaprobado') as $requerimiento)
                                        <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                            <td class="px-6 py-4">{{ $requerimiento->numero_orden_requerimiento }}</td>
                                            <td class="px-6 py-4 break-words whitespace-normal">
                                                {{ $requerimiento->proyecto->nombre_proyecto ?? 'No asignado' }}</td>
                                            <td class="px-6 py-4 break-words whitespace-normal">{{ $requerimiento->nombre_requerimiento }}</td>
                                            <td class="px-6 py-4">{{ $requerimiento->fecha_requerimiento }}</td>
                                            <td class="px-6 py-4 break-words whitespace-normal">{{ $requerimiento->solicitado_requerimiento }}</td>
                                            <td class="px-6 py-4">S/ {{ $requerimiento->total_requerimientos }}</td>
                                            <td class="px-6 py-4 text-red-500">{{ $requerimiento->estado }}</td>
                                            <td class="px-6 py-4">
                                                <a href="{{ route('logistica.requerimientos.edit', $requerimiento->id_requerimiento) }}"
                                                    class="text-blue-600">Mostrar</a>
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>

                            <h2 class="text-lg font-semibold mb-4 mt-8 text-gray-950 dark:text-white">Requerimientos en
                                Proceso</h2>
                            <table id="ProcesoTable" class="min-w-full table-auto text-sm text-center rtl:text-right text-gray-500 dark:text-gray-400">
                                <thead
                                    class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" class="px-6 py-3 text-center">#</th>
                                        <th scope="col" class="px-6 py-3 text-center">Proyecto</th>
                                        <th scope="col" class="px-6 py-3 text-center">Descripción</th>
                                        <th scope="col" class="px-6 py-3 text-center">Fecha</th>
                                        <th scope="col" class="px-6 py-3 text-center">Solicitado Por</th>
                                        <th scope="col" class="px-6 py-3 text-center">Monto Solicitado</th>
                                        <th scope="col" class="px-6 py-3 text-center">Estado</th>
                                        <th scope="col" class="px-6 py-3 text-center">Mostrar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach ($requerimientos->where('estado', 'En Proceso') as $requerimiento)
                                        <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                            <td class="px-6 py-4">{{ $requerimiento->numero_orden_requerimiento }}</td>
                                            <td class="px-6 py-4 break-words whitespace-normal">
                                                {{ $requerimiento->proyecto->nombre_proyecto ?? 'No asignado' }}</td>
                                            <td class="px-6 py-4 break-words whitespace-normal">{{ $requerimiento->nombre_requerimiento }}</td>
                                            <td class="px-6 py-4">{{ $requerimiento->fecha_requerimiento }}</td>
                                            <td class="px-6 py-4 break-words whitespace-normal">{{ $requerimiento->solicitado_requerimiento }}</td>
                                            <td class="px-6 py-4">S/: {{ $requerimiento->total_requerimientos }}</td>
                                            <td class="px-6 py-4 text-yellow-500">{{ $requerimiento->estado }}</td>
                                            <td class="px-6 py-4">
                                                <a href="{{ route('logistica.requerimientos.edit', $requerimiento->id_requerimiento) }}"
                                                    class="text-blue-600">Mostrar</a>
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>

                            <h2 class="text-lg font-semibold mb-4 mt-8 text-gray-950 dark:text-white">Requerimientos
                                Sustentados</h2>
                            <table id="SustentadosTable"
                                class="min-w-full w-full table-auto text-sm text-center rtl:text-right text-gray-500 dark:text-gray-400">
                                <thead
                                    class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" class="px-6 py-3 text-center">#</th>
                                        <th scope="col" class="px-6 py-3 text-center">Proyecto</th>
                                        <th scope="col" class="px-6 py-3 text-center">Descripción</th>
                                        <th scope="col" class="px-6 py-3 text-center">Fecha</th>
                                        <th scope="col" class="px-6 py-3 text-center">Solicitado Por</th>
                                        <th scope="col" class="px-6 py-3 text-center">Monto Solicitado</th>
                                        <th scope="col" class="px-6 py-3 text-center">Estado</th>
                                        <th scope="col" class="px-6 py-3 text-center">Mostrar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach ($requerimientos->where('estado', 'Sustentado') as $requerimiento)
                                        <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                            <td class="px-6 py-4">{{ $requerimiento->numero_orden_requerimiento }}
                                            </td>
                                            <td class="px-6 py-4 break-words whitespace-normal">
                                                {{ $requerimiento->proyecto->nombre_proyecto ?? 'No asignado' }}</td>
                                            <td class="px-6 py-4 break-words whitespace-normal">{{ $requerimiento->nombre_requerimiento }}</td>
                                            <td class="px-6 py-4">{{ $requerimiento->fecha_requerimiento }}</td>
                                            <td class="px-6 py-4 break-words whitespace-normal">{{ $requerimiento->solicitado_requerimiento }}</td>
                                            <td class="px-6 py-4">S/ {{ $requerimiento->total_requerimientos }}</td>
                                            <td class="px-6 py-4 text-green-500">{{ $requerimiento->estado }}</td>
                                            <td class="px-6 py-4">
                                                <a href="{{ route('logistica.requerimientos.edit', $requerimiento->id_requerimiento) }}"
                                                    class="text-blue-600">Mostrar</a>
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
    <script>
        $(document).ready(function() {
            $('#DesaprobadoTable').DataTable({
                pagingType: 'simple_numbers', // Paginación con números simples (anterior/siguiente)
                pageLength: 10, // Número de registros por página
                lengthMenu: [10, 25, 50, 100], // Opciones de registros por página
                language: {
                    url: '//cdn.datatables.net/plug-ins/2.1.8/i18n/es-MX.json',
                },

                // Agregar opciones de búsqueda y filtrado en las columnas si es necesario
                columnDefs: [{
                    targets: '_all', // Aplica a todas las columnas
                    searchable: true // Habilitar búsqueda para todas las columnas
                }]
            });
        });
        $(document).ready(function() {
            $('#ProcesoTable').DataTable({
                pagingType: 'simple_numbers', // Paginación con números simples (anterior/siguiente)
                pageLength: 10, // Número de registros por página
                lengthMenu: [10, 25, 50, 100], // Opciones de registros por página
                language: {
                    url: '//cdn.datatables.net/plug-ins/2.1.8/i18n/es-MX.json',
                },

                // Agregar opciones de búsqueda y filtrado en las columnas si es necesario
                columnDefs: [{
                    targets: '_all', // Aplica a todas las columnas
                    searchable: true // Habilitar búsqueda para todas las columnas
                }]
            });
        });
        $(document).ready(function() {
            $('#SustentadosTable').DataTable({
                pagingType: 'simple_numbers', // Paginación con números simples (anterior/siguiente)
                pageLength: 10, // Número de registros por página
                lengthMenu: [10, 25, 50, 100], // Opciones de registros por página
                language: {
                    url: '//cdn.datatables.net/plug-ins/2.1.8/i18n/es-MX.json',
                },

                // Agregar opciones de búsqueda y filtrado en las columnas si es necesario
                columnDefs: [{
                    targets: '_all', // Aplica a todas las columnas
                    searchable: true // Habilitar búsqueda para todas las columnas
                }]
            });
        });
    </script>
</x-app-layout>
