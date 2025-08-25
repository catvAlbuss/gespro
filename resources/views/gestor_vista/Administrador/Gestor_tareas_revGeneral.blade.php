<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Gestion de Tareas') }}
        </h2>
    </x-slot>
    <link rel="stylesheet" href="https://cdn.datatables.net/2.1.8/css/dataTables.tailwindcss.css">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.tailwindcss.com/"></script>
    <script src="https://cdn.datatables.net/2.1.8/js/dataTables.js"></script>
    <script src="https://cdn.datatables.net/2.1.8/js/dataTables.tailwindcss.js"></script>
    <script src="https://cdn.tailwindcss.com/"></script>
    
    <input type="hidden" class="listTrab" id="trabajadores" value="{{ json_encode($usuarios) }}">

    <input type="hidden" class="listproyectos" name="proyectos" id="proyectos" value="{{ json_encode($proyectos) }}">

    <input type="hidden" name="empresa_id" id="empresa_id" value="{{ $empresaId }}">

    <div class="py-12">
        <div class="container mx-auto w-full">
            <div class="flex flex-wrap">
                <div class="w-full md:w-1/4">
                    <div class="p-6 text-gray-900 dark:text-gray-100">
                        <div class="container flex flex-col items-center gap-16 mx-auto my-30">
                            <div
                                class="flex flex-col items-center gap-3 px-8 py-10 bg-white dark:bg-gray-800 border-solid border-2 border-sky-400 rounded-3xl shadow-main">
                                <span class="text-lg font-bold text-blue-500">
                                    Actualizar Tarea
                                </span>
                                <span>
                                    OJO: para editar busque una tarea y precione el boton revisar
                                </span>
                                @if (isset($tarea))
                                    <form method="POST"
                                        action="{{ route('gestorReportes.update', $tarea->id_tarea) }}">
                                        @csrf
                                        @method('PUT')
                                        <div>
                                            <x-input-label for="nombre_tarea" :value="__('Nombre tarea')" />
                                            <x-text-input type="text" name="nombre_tarea"
                                                value="{{ $tarea->nombre_tarea }}" class="block mt-1 w-full text-center"
                                                disabled />
                                        </div>
                                        <div>
                                            <x-input-label for="fecha_subido_t" :value="__('Fecha Registrado')" />
                                            <x-text-input type="text" name="fecha_subido_t"
                                                value="{{ $tarea->fecha_subido_t }}"
                                                class="block mt-1 w-full text-center" disabled />
                                        </div>
                                        <div>
                                            <x-input-label for="porcentaje_tarea" :value="__('Porcentaje Trabajador')" />
                                            <x-text-input type="number" name="porcentaje_tarea"
                                                value="{{ $tarea->porcentaje_tarea }}"
                                                class="block mt-1 w-full text-center" disabled />
                                        </div>
                                        <div>
                                            <x-input-label for="procentaje_trabajador" :value="__('Porcentaje Jefe')" />
                                            <x-text-input type="number" name="procentaje_trabajador"
                                                value="{{ $tarea->procentaje_trabajador }}"
                                                class="block mt-1 w-full text-center" />
                                        </div>
                                        <div>
                                            <x-input-label for="nombre_documento" :value="__('Documento Revisado')" />
                                            <x-text-input type="text" name="nombre_documento"
                                                value="{{ $tarea->nombre_documento }}"
                                                class="block mt-1 w-full text-center" />
                                        </div>
                                        <input type="hidden" name="empresa_id" id="empresa_id"
                                            value="{{ $empresaId }}">
                                        <div class="flex items-center justify-end mt-4">
                                            <x-primary-button class="ml-4">
                                                {{ 'Actualizar' }}
                                            </x-primary-button>
                                        </div>
                                    </form>
                                @endif
                            </div>
                        </div>
                    </div>
                </div>
                <div class="w-full md:w-3/4 px-4 mt-4 md:mt-0">
                    <div class="overflow-x-auto bg-white dark:bg-gray-800 text-gray-950 dark:text-gray-50">
                        <div id="projectFilters" class="mt-4 text-gray-950 dark:text-white"></div>
                        <div id="workerFilters" class="mt-4 text-gray-950 dark:text-white"></div>

                        <x-text-input type="text" id="searchInput" placeholder="Buscar por tarea"
                            class="block mt-1 w-full" />
                        <br>
                        <table id="tareasTable"
                            class="min-w-full table-auto w-full text-sm text-center rtl:text-right text-gray-500 dark:text-gray-400">
                            <thead
                                class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" class="px-6 py-3">Proyecto</th>
                                    <th scope="col" class="px-6 py-3">Trabajador</th>
                                    <th scope="col" class="px-6 py-3">Tarea</th>
                                    <th scope="col" class="px-6 py-3">Fecha Subido</th>
                                    <th scope="col" class="px-6 py-3">Dia Subido</th>
                                    <th scope="col" class="px-6 py-3">% Trabajador</th>
                                    <th scope="col" class="px-6 py-3">% Jefe</th>
                                    <th scope="col" class="px-6 py-3">Doc.</th>
                                    <th scope="col" class="px-6 py-3">Revisar</th>
                                </tr>
                            </thead>
                            <tbody id="projectTable">
                                @foreach ($tareas as $tarea)
                                    <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                        <td class="px-6 py-4">{{ $tarea->proyecto->nombre_proyecto }}</td>
                                        <td class="px-6 py-4">{{ $tarea->user->name }}</td>
                                        <td class="px-6 py-4">{{ $tarea->nombre_tarea }}</td>
                                        <td class="px-6 py-4">{{ $tarea->fecha_subido_t }}</td>
                                        <td class="px-6 py-4">{{ $tarea->diasubido }}</td>
                                        <td class="px-6 py-4">{{ $tarea->porcentaje_tarea }}</td>
                                        <td class="px-6 py-4">{{ $tarea->procentaje_trabajador }}</td>
                                        <td class="px-6 py-4">
                                            <a href="{{ $tarea->nombre_documento }}" class="text-blue-400"
                                                target="_blank" rel="noopener noreferrer">Tarea</a>
                                        </td>
                                        <td class="px-6 py-4">
                                            <a href="{{ route('gestor-tareasRev', ['empresaId' => $empresaId, 'id_tarea' => $tarea->id_tarea]) }}"
                                                class="text-blue-600">Revisar</a>
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
    <!-- Script para filtrar la tabla -->
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const proyectos = JSON.parse(document.getElementById('proyectos').value);
            const trabajadores = JSON.parse(document.getElementById('trabajadores').value);

            const projectFiltersDiv = document.getElementById('projectFilters');
            const workerFiltersDiv = document.getElementById('workerFilters');

            // Generar checkboxes de proyectos
            /*proyectos.forEach(proyecto => {
                const label = document.createElement('label');
                label.innerHTML =
                    `<input type="checkbox" class="projectFilter" value="${proyecto.nombre_proyecto.toLowerCase()}"> ${proyecto.nombre_proyecto}`;
                projectFiltersDiv.appendChild(label);
            });*/
            // Crear el elemento select
            const selectElement = document.createElement('select');
            selectElement.classList.add('block', 'w-full', 'mt-1', 'text-gray-950','px-3', 'py-2', 'border', 'border-gray-300', 'rounded-md', 'focus:outline-none', 'focus:ring-indigo-500', 'focus:border-indigo-500');
            
            // Crear la opción "Seleccione un proyecto"
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Seleccione un proyecto';
            selectElement.appendChild(defaultOption);
            
            // Agregar opciones para cada proyecto
            proyectos.forEach(proyecto => {
                const option = document.createElement('option');
                option.value = proyecto.nombre_proyecto.toLowerCase(); // Valor en minúsculas
                option.textContent = proyecto.nombre_proyecto; // Texto que se muestra al usuario
                selectElement.appendChild(option);
            });
            
            // Agregar el select al contenedor
            projectFiltersDiv.appendChild(selectElement);

         // Lista de nombres a excluir
            const excludedNames = [
                "andrea alexandra", 
                "luis angel", 
                "jorge david", 
                "fernando piero", 
                "yesica",
                "administrador"
            ];
            
            // Generar checkboxes de trabajadores
            trabajadores.forEach(trabajador => {
                // Convertir el nombre a minúsculas para hacer la comparación insensible a mayúsculas/minúsculas
                const trabajadorNameLower = trabajador.name.toLowerCase().trim();
            
                // Verificar si el trabajador no está en la lista de excluidos
                if (!excludedNames.includes(trabajadorNameLower)) {
                    // Crear el elemento label con el checkbox
                    const label = document.createElement('label');
                    label.innerHTML = 
                        `<input type="checkbox" class="workerFilter" value="${trabajadorNameLower}"> ${trabajador.name}`;
                    
                    // Agregar el label al contenedor de filtros
                    workerFiltersDiv.appendChild(label);
                }
            });



            const searchInput = document.getElementById('searchInput');
            const projectFilters = document.querySelectorAll('.projectFilter');
            const workerFilters = document.querySelectorAll('.workerFilter');

            const filterTable = () => {
                const filter = searchInput.value.toLowerCase();
                const selectedProjects = Array.from(projectFilters).filter(cb => cb.checked).map(cb => cb
                    .value);
                const selectedWorkers = Array.from(workerFilters).filter(cb => cb.checked).map(cb => cb.value);
                const rows = document.querySelectorAll('#projectTable tr');

                rows.forEach(row => {
                    const projectCell = row.cells[0].textContent.toLowerCase();
                    const workerCell = row.cells[1].textContent.toLowerCase();
                    const taskCell = row.cells[2].textContent.toLowerCase();
                    const dateCell = row.cells[3].textContent.toLowerCase();
                    const diasCell = row.cells[4].textContent.toLowerCase();

                    const matchesSearch = projectCell.includes(filter) || workerCell.includes(filter) ||
                        taskCell.includes(filter) || dateCell.includes(filter) || diasCell.includes(
                            filter);
                    const matchesProject = selectedProjects.length === 0 || selectedProjects.includes(
                        projectCell);
                    const matchesWorker = selectedWorkers.length === 0 || selectedWorkers.includes(
                        workerCell);

                    row.style.display = matchesSearch && matchesProject && matchesWorker ? '' : 'none';
                });
            };

            searchInput.addEventListener('keyup', filterTable);
            projectFilters.forEach(cb => cb.addEventListener('change', filterTable));
            workerFilters.forEach(cb => cb.addEventListener('change', filterTable));
        });
    </script>
    <script>
        $(document).ready(function() {
            $('#tareasTable').DataTable({
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
