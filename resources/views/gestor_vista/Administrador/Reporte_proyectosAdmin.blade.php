<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Lista de Proyectos') }}
        </h2>
    </x-slot>
    <link rel="stylesheet" href="https://cdn.datatables.net/2.1.8/css/dataTables.tailwindcss.css">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.tailwindcss.com/"></script>
    <script src="https://cdn.datatables.net/2.1.8/js/dataTables.js"></script>
    <script src="https://cdn.datatables.net/2.1.8/js/dataTables.tailwindcss.js"></script>
    <script src="https://cdn.tailwindcss.com/"></script>
    
    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white dark:bg-gray-800 text-gray-950 dark:text-gray-50 overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-gray-900 dark:text-gray-100">
                    <table id="proyectosrpTabla"
                        class="min-w-full table-auto w-full text-sm text-center rtl:text-right text-gray-500 dark:text-gray-400">
                        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" class="px-6 py-3">Nombre Proyecto</th>
                                <th scope="col" class="px-6 py-3">Monto Presupuestado</th>
                                <th scope="col" class="px-6 py-3">Monto Invertido</th>
                                <th scope="col" class="px-6 py-3">Utilidad</th>
                                <th scope="col" class="px-6 py-3">Porcentaje Utilidad</th>
                                <th scope="col" class="px-6 py-3">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            @php
                                $total_monto_designado = 0;
                                $total_monto_invertido = 0;
                                $total_utilidad = 0;
                            @endphp
                            @foreach ($json as $proyecto)
                                @php
                                    $monto_designado = floatval($proyecto['total_monto_designado']);
                                    $monto_invertido = floatval($proyecto['total_monto_invertido']);
                                    $utilidad = $monto_designado - $monto_invertido;
                                    $porcentaje_utilidad =
                                        $monto_designado > 0 ? ($utilidad / $monto_designado) * 100 : 0;

                                    // Acumular totales
                                    $total_monto_designado += $monto_designado;
                                    $total_monto_invertido += $monto_invertido;
                                    $total_utilidad += $utilidad;
                                @endphp
                                <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td class="px-6 py-3">
                                        <input type="hidden" name="id_proyectos" id="id_proyectos"
                                            value="{{ $proyecto['grupo_id'] }}">
                                        {{ $proyecto['nombre_comun'] }}
                                    </td>
                                    <td class="px-6 py-3">S/ {{ number_format($monto_designado, 2) }}</td>
                                    <td class="px-6 py-3">S/ {{ number_format($monto_invertido, 2) }}</td>
                                    <td class="px-6 py-3">S/ {{ number_format($utilidad, 2) }}</td>
                                    <td class="px-6 py-3">{{ number_format($porcentaje_utilidad, 2) }}%</td>
                                    <td class="px-6 py-3">
                                        <a class="text-blue-500 hover:text-blue-800"
                                            href="{{ route('reporte_detalles', ['grupo_id' => $proyecto['grupo_id'], 'nombre_proyecto' => urlencode($proyecto['nombre_comun']), 'empresaId' => $proyecto['empresaId']]) }}">
                                            Abrir Proyecto
                                        </a>
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                        <tfoot>
                            <tr>
                                <td class="px-6 py-3">TOTAL</td>
                                <td class="px-6 py-3">S/ {{ number_format($total_monto_designado, 2) }}</td>
                                <td class="px-6 py-3">S/ {{ number_format($total_monto_invertido, 2) }}</td>
                                <td class="px-6 py-3">S/ {{ number_format($total_utilidad, 2) }}</td>
                                <td class="px-6 py-3">
                                    {{ $total_monto_designado > 0 ? number_format(($total_utilidad / $total_monto_designado) * 100, 2) : 0 }}%
                                </td>
                                <td class="px-6 py-3"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    </div>
    <script>
        $(document).ready(function() {
            $('#proyectosrpTabla').DataTable({
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
