<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Gestor Proyectos') }}
        </h2>

    </x-slot>
    <link rel="stylesheet" href="https://cdn.datatables.net/2.1.8/css/dataTables.tailwindcss.css">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.tailwindcss.com/"></script>
    <script src="https://cdn.datatables.net/2.1.8/js/dataTables.js"></script>
    <script src="https://cdn.datatables.net/2.1.8/js/dataTables.tailwindcss.js"></script>
    <script src="https://cdn.tailwindcss.com/"></script>

    <div class="py-12">
        <div class="container mx-auto w-full">
            <div class="flex flex-wrap">
                <div class="w-full md:w-1/3">
                    <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                        <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4"></h3>
                        <div class="overflow-auto">
                            {{-- <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                                {{ isset($proyecto) ? 'Editar Proyecto' : 'Crear Proyecto' }}</h3> --}}

                            <form method="POST"
                                action="{{ isset($proyecto) ? route('proyectos.update', $proyecto->id_proyectos) : route('proyectos.store') }}">
                                @csrf
                                @if (isset($proyecto))
                                    @method('PUT')
                                @endif
                                <div>
                                    <x-input-label for="nombre_proyecto" :value="__('Nombre Proyecto')" />
                                    <x-text-input id="nombre_proyecto" class="block mt-1 w-full" type="text"
                                        name="nombre_proyecto"
                                        value="{{ old('nombre_proyecto', $proyecto->nombre_proyecto ?? '') }}" required
                                        autofocus />
                                </div>
                                <div>
                                    <x-input-label for="descripcion_proyecto" :value="__('Descripción del Proyecto')" />
                                    <x-text-input id="descripcion_proyecto" class="block mt-1 w-full" type="text"
                                        name="descripcion_proyecto"
                                        value="{{ old('descripcion_proyecto', $proyecto->descripcion_proyecto ?? '') }}"
                                        required autofocus />
                                </div>
                                <div>
                                    <x-input-label for="tipoproyecto" :value="__('Tipo Proyecto')" />
                                    <x-input-select id="tipoproyecto" class="block mt-1 w-full" name="tipoproyecto"
                                        required>
                                        <option value="oficina"
                                            {{ old('tipoproyecto', $proyecto->tipoproyecto ?? '') == 'oficina' ? 'selected' : '' }}>
                                            OFICINA</option>
                                        <option value="campo"
                                            {{ old('tipoproyecto', $proyecto->tipoproyecto ?? '') == 'campo' ? 'selected' : '' }}>
                                            CAMPO</option>
                                    </x-input-select>
                                </div>
                               {{-- @unless (isset($proyecto))
                                    @foreach ($proyectos as $proyectoItem)
                                        <div>
                                            @php
                                                $documento_proyecto = json_decode(
                                                    $proyectoItem->documento_proyecto,
                                                    true,
                                                );
                                                $estructuraObjeto = [
                                                    'data' => [
                                                        [
                                                            'id' => 1,
                                                            'text' => '1.ADMISIBILIDAD',
                                                            'start_date' => '01-11-2023 00:00',
                                                            'porc' => 0,
                                                            'sub_total' => 1.25,
                                                            'total' => 0,
                                                            'retraso' => 0,
                                                            'duration' => 18,
                                                            'progress' => 0,
                                                            'open' => true,
                                                            'end_date' => '19-11-2023 00:00',
                                                            'parent' => 0,
                                                        ],
                                                        // Otros datos aquí...
                                                    ],
                                                    'links' => [
                                                        ['id' => 1, 'source' => 1, 'target' => 2, 'type' => '1'],
                                                        ['id' => 2, 'source' => 2, 'target' => 3, 'type' => '0'],
                                                    ],
                                                ];

                                                $value = json_encode($documento_proyecto ?: $estructuraObjeto);
                                            @endphp
                                            <x-input-checkbox-pro name="documento_proyecto" :options="[$value => $proyectoItem->nombre_proyecto]" />
                                        </div>
                                    @endforeach
                                @endunless --}}
                                {{-- <input type="hidden" name="empresa_id"
                                    value="{{ old('empresa_id', $proyecto->empresa_id ?? $empresaId) }}"> --}}
                                <br>
                                <div class="flex items-center justify-end mt-4">
                                    <x-primary-button class="ml-4">
                                        {{ isset($proyecto) ? __('Actualizar') : __('Guardar') }}
                                    </x-primary-button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {{-- <div class="w-full md:w-2/3 px-4 mt-4 md:mt-0">
                    <div class="overflow-auto">
                        <div class="bg-white dark:bg-gray-800 text-gray-950 dark:text-gray-50 shadow-md rounded-lg p-6">
                            <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Lista de
                                Contabilidad</h3>
                            <div class="overflow-x-auto">
                                <x-text-input type="text" id="searchInput" placeholder="Buscar por nombre"
                                    class="block mt-1 w-full" />
                                <br>
                                <table  id="proyectosTable"
                                    class="min-w-full w-full text-sm text-center rtl:text-right text-gray-500 dark:text-gray-400">
                                    <thead
                                        class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                        <tr>
                                            <th scope="col" class="px-6 py-3 text-center">#</th>
                                            <th scope="col" class="px-6 py-3 text-center">Nombre</th>
                                            <th scope="col" class="px-6 py-3 text-center">Porcentaje</th>
                                            <th scope="col" class="px-6 py-3 text-center">Mostrar</th>
                                            <th scope="col" class="px-6 py-3 text-center">Editar</th>
                                            <th scope="col" class="px-6 py-3 text-center">Eliminar</th>
                                        </tr>
                                    </thead>
                                    <tbody id="projectTable">
                                        @foreach ($proyectos as $index => $proyecto)
                                            <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                                <td class="px-6 py-4">{{ $index + 1 }}</td>
                                                <td class="px-6 py-4">{{ $proyecto->nombre_proyecto }}</td>
                                                <td class="px-6 py-4">
                                                    <div class="w-full bg-gray-200 rounded-full dark:bg-gray-700">
                                                        @php
                                                            $color = 'bg-red-600'; // Color por defecto para 0-20%

                                                            if (
                                                                $proyecto->porcentaje_total > 30 &&
                                                                $proyecto->porcentaje_total <= 60
                                                            ) {
                                                                $color = 'bg-yellow-600';
                                                            } elseif ($proyecto->porcentaje_total > 61) {
                                                                $color = 'bg-green-600';
                                                            }
                                                        @endphp

                                                        <div class="{{ $color }} text-xs font-medium text-white text-center p-0.5 leading-none rounded-full"
                                                            style="width: {{ $proyecto->porcentaje_total }}%">
                                                            {{ $proyecto->porcentaje_total }}%
                                                        </div>
                                                    </div>
                                                </td>
                                                <td class="px-6 py-4">
                                                    <a href="{{ route('redirect_proyecto', ['id' => $proyecto->id_proyectos, 'empresa_id' => $proyecto->empresa_id]) }}"
                                                        class="text-blue-600">Abrir</a>
                                                </td>
                                                <td class="px-6 py-4">
                                                    <a href="{{ route('proyectos.edit', $proyecto->id_proyectos) }}"
                                                        class="text-blue-600">Editar</a>
                                                </td>
                                                <td class="px-6 py-4">
                                                    <form
                                                        action="{{ route('proyectos.destroy', $proyecto->id_proyectos) }}"
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
                </div> --}}
            </div>
        </div>
    </div>
    <!-- Script para filtrar la tabla -->
    <script>
        document.getElementById('searchInput').addEventListener('keyup', function() {
            const filter = this.value.toLowerCase();
            const rows = document.querySelectorAll('#projectTable tr');

            rows.forEach(row => {
                const nameCell = row.cells[1].textContent.toLowerCase();
                row.style.display = nameCell.includes(filter) ? '' : 'none';
            });
        });
    </script>
    <script>
        $(document).ready(function() {
            $('#proyectosTable').DataTable({
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
