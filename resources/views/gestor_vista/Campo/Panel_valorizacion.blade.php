<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Gestor Campo Valorización') }}
        </h2>
        <div class="flex items-center justify-end -mt-8">
            <button type="button"
                class="m-1 ms-0 relative py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                id="openModal">
                Registrar Valorización
            </button>
        </div>
    </x-slot>
    <link rel="stylesheet" href="https://cdn.datatables.net/2.1.8/css/dataTables.tailwindcss.css">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.tailwindcss.com/"></script>
    <script src="https://cdn.datatables.net/2.1.8/js/dataTables.js"></script>
    <script src="https://cdn.datatables.net/2.1.8/js/dataTables.tailwindcss.js"></script>
    <script src="https://cdn.tailwindcss.com/"></script>

    <!-- Modal  crear-->
    <div id="modalCrearValorizacion"
        class="fixed inset-0 flex items-center justify-center z-50 hidden bg-black bg-opacity-50">
        <div class="bg-white rounded-lg shadow-lg w-11/12 md:w-1/3 p-6">
            <h2 class="text-lg font-semibold mb-4">Registrar Mantenimiento</h2>
            <form method="POST" action="{{ route('valorizacionCampo.store') }}" class="space-y-4">
                @csrf
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="col-span-2">
                        <label for="obra_valo" class="block text-sm font-medium text-gray-700">Nombre de
                            Valorización(*)</label>
                        <input id="obra_valo" name="obra_valo" type="text" required
                            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
                            placeholder="Ingrese el nombre del valorizacion">
                    </div>
                    <div class="col-span-2">
                        <label for="contratista_valo"
                            class="block text-sm font-medium text-gray-700">Contratista(*)</label>
                        <input id="contratista_valo" name="contratista_valo" type="text" required
                            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
                            placeholder="Ingrese la contratista">
                    </div>
                    <div>
                        <label for="plazo_valo" class="block text-sm font-medium text-gray-700">Plazo(*)</label>
                        <input id="plazo_valo" name="plazo_valo" type="number" required
                            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
                            placeholder="Ingrese el plazo">
                    </div>
                    <div>
                        <label for="fecha_inicio_valo" class="block text-sm font-medium text-gray-700">Fecha
                            Inicio(*)</label>
                        <input id="fecha_inicio_valo" name="fecha_inicio_valo" type="date" required
                            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2">
                    </div>
                </div>
                <input type="hidden" name="empresaId" value="{{ $empresaId }}">
                <div class="flex items-center justify-end mt-4">
                    <button type="button" class="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                        id="closeModalCrear">Cerrar</button>
                    <button type="submit"
                        class="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Guardar</button>
                </div>
            </form>
        </div>
    </div>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div
                class="bg-white dark:bg-gray-800 text-gray-950 dark:text-gray-50 overflow-hidden shadow-sm sm:rounded-lg">
                <table id="valorizacionesTable"
                    class="table-fixed text-sm text-center rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" class="px-2 py-2 text-center">#</th>
                            <th scope="col" class="px-2 py-2 text-center">Obra</th>
                            <th scope="col" class="px-2 py-2 text-center">Contratista</th>
                            <th scope="col" class="px-2 py-2 text-center">Plazo</th>
                            <th scope="col" class="px-2 py-2 text-center">Fecha de Inicio</th>
                            <th scope="col" class="px-2 py-2 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($valorizaciones as $index => $valorizacion)
                            <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                <td class="px-6 py-4 text-center">{{ $index + 1 }}</td>
                                <td class="px-6 py-4 text-center break-words whitespace-normal">
                                    {{ $valorizacion->obra_valo }}</td>
                                <td class="px-6 py-4 text-center">{{ $valorizacion->contratista_valo }}</td>
                                <td class="px-6 py-4 text-center">{{ $valorizacion->plazo_valo }}</td>
                                <td class="px-6 py-4 text-center">
                                    {{ \Carbon\Carbon::parse($valorizacion->fecha_inicio_valo)->format('d/m/Y') }}
                                </td>
                                <td class="px-4 py-3 flex items-center justify-end">
                                    <!-- Botón para abrir el dropdown -->
                                    <button id="menu-button-{{ $valorizacion->id_valorizacion }}"
                                        class="inline-flex items-center p-0.5 text-sm font-medium text-center text-gray-500 hover:text-gray-800 rounded-lg focus:outline-none dark:text-gray-400 dark:hover:text-gray-100"
                                        type="button"
                                        onclick="toggleDropdown(event, {{ $valorizacion->id_valorizacion }})">
                                        <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                                        </svg>
                                    </button>

                                    <!-- Dropdown content -->
                                    <div id="dropdown-{{ $valorizacion->id_valorizacion }}"
                                        class="hidden z-10 w-44 bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700 dark:divide-gray-600 absolute right-0 mt-2">
                                        <ul class="py-1 text-sm text-gray-700 dark:text-gray-200">
                                            <li>
                                                <a href="{{ route('valorizacionCampo.show', $valorizacion->id_valorizacion) }}"
                                                    class="block py-2 px-4 hover:bg-blue-600 dark:hover:bg-blue-600 dark:hover:text-white">Abrir</a>
                                            </li>
                                            <li>
                                                <a class="edit-button block py-2 px-4 hover:bg-yellow-400 dark:hover:bg-yellow-600 dark:hover:text-white"
                                                    data-id="{{ $valorizacion->id_valorizacion }}"
                                                    data-url="{{ route('valorizacionCampo.edit', $valorizacion->id_valorizacion) }}">Editar</a>
                                            </li>
                                            <li>
                                                <form
                                                    action="{{ route('valorizacionCampo.destroy', $valorizacion->id_valorizacion) }}"
                                                    method="POST" class="inline">
                                                    @csrf
                                                    @method('DELETE')
                                                    <input type="hidden" name="empresaId"
                                                        value="{{ $empresaId }}">
                                                    <button type="submit"
                                                        class="block py-2 px-4 text-sm text-center align-middle justify-between text-red-700 hover:bg-gray-100 dark:hover:bg-red-700 dark:text-gray-200 dark:hover:text-white">Eliminar</button>
                                                </form>
                                            </li>
                                        </ul>
                                    </div>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>


    <div id="modalEditarValorizacion"
        class="fixed inset-0 flex items-center justify-center z-50 hidden bg-black bg-opacity-50">
        <div class="bg-white rounded-lg shadow-lg w-11/12 md:w-1/3 p-6">
            <h2 class="text-lg font-semibold mb-4">Editar Mantenimiento</h2>
            <form id="editMantenimientoForm" method="POST" class="space-y-4"
                action="{{ route('valorizacionCampo.update', $valorizacion->id_valorizacion) }}">
                @csrf
                @method('PUT') <!-- Asegúrate de que esta directiva esté presente -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="col-span-2">
                        <label for="obra_valo_edit" class="block text-sm font-medium text-gray-700">Nombre de
                            Valorización(*)</label>
                        <input id="obra_valo_edit" name="obra_valo" type="text"
                            value="{{ old('obra_valo', $valorizacion->obra_valo) }}" required
                            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-center">
                    </div>
                    <div class="col-span-2">
                        <label for="contratista_valo_edit"
                            class="block text-sm font-medium text-gray-700">Contratista(*)</label>
                        <input id="contratista_valo_edit" name="contratista_valo" type="text"
                            value="{{ old('contratista_valo', $valorizacion->contratista_valo) }}" required
                            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-center">
                    </div>
                    <div>
                        <label for="plazo_valo_edit" class="block text-sm font-medium text-gray-700">Plazo(*)</label>
                        <input id="plazo_valo_edit" name="plazo_valo" type="number"
                            value="{{ old('plazo_valo', $valorizacion->plazo_valo) }}" required
                            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                    </div>
                    <div>
                        <label for="fecha_inicio_valo_edit"
                            class="block text-sm font-medium text-gray-700">Fecha(*)</label>
                        <input id="fecha_inicio_valo_edit" name="fecha_inicio_valo" type="date"
                            value="{{ old('fecha_inicio_valo', $valorizacion->fecha_inicio_valo) }}" required
                            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                    </div>
                </div>
                <input type="hidden" name="empresaId" value="{{ $empresaId }}">
                <div class="flex items-center justify-end mt-4">
                    <button type="button" class="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                        id="closeModalEditar">Cerrar</button>
                    <button type="submit"
                        class="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Actualizar</button>
                </div>
            </form>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            document.getElementById('openModal').addEventListener('click', function() {
                document.getElementById('modalCrearValorizacion').classList.remove('hidden');
            });

            document.getElementById('closeModalCrear').addEventListener('click', function() {
                document.getElementById('modalCrearValorizacion').classList.add('hidden');
            });
        });
    </script>

    <script>
        $(document).ready(function() {
            $('.edit-button').on('click', function(event) {
                event.preventDefault();

                // Obtiene la URL del atributo data-url
                const url = $(this).data('url');
                console.log("URL para editar:", url);

                // Verifica que la URL no esté vacía
                if (!url) {
                    console.error('No se encontró la URL para editar.');
                    return;
                }

                $.ajax({
                    type: 'GET', // Usar GET para obtener datos
                    url: url,
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                    },
                    success: function(response) {
                        console.log("Datos recibidos:", response);

                        // Llena los campos del formulario con los datos obtenidos
                        $('#obra_valo_edit').val(response.obra_valo || '');
                        $('#contratista_valo_edit').val(response.contratista_valo || '');
                        $('#plazo_valo_edit').val(response.plazo_valo || '');
                        $('#fecha_inicio_valo_edit').val(response.fecha_inicio_valo || '');

                        // Ajusta la acción del formulario para actualizar
                        $('#editMantenimientoForm').attr('action', '/valorizacionCampo/' +
                            response.id_valorizacion);

                        // Abre el modal
                        $('#modalEditarValorizacion').removeClass('hidden');
                    },
                    error: function(xhr) {
                        console.error('Error al cargar los datos:', xhr);
                        alert('Hubo un problema al cargar los datos. Inténtalo de nuevo.');
                    }
                });
            });

            // Cerrar el modal
            $('#closeModalEditar').on('click', function() {
                $('#modalEditarValorizacion').addClass('hidden');
            });
        });
    </script>

    <script>
        // Función para alternar la visibilidad del dropdown
        function toggleDropdown(event, id) {
            const dropdown = document.getElementById(`dropdown-${id}`);

            // Alternar la clase 'hidden' para mostrar/ocultar el dropdown
            dropdown.classList.toggle('hidden');

            // Evitar que el evento de clic se propague al document
            event.stopPropagation();
        }

        // Cerrar el dropdown si el usuario hace clic fuera de él
        document.addEventListener('click', function(event) {
            // Verifica si el clic ocurrió fuera de un botón de menú o de un dropdown
            const dropdowns = document.querySelectorAll('[id^="dropdown-"]');
            const buttons = document.querySelectorAll('[id^="menu-button-"]');

            dropdowns.forEach(dropdown => {
                const menuId = dropdown.id.split('-')[1];
                const button = document.getElementById(`menu-button-${menuId}`);

                if (!button.contains(event.target) && !dropdown.contains(event.target)) {
                    dropdown.classList.add('hidden'); // Ocultar el dropdown
                }
            });
        });
    </script>

    <script>
        $(document).ready(function() {
            $('#valorizacionesTable').DataTable({
                pagingType: 'simple_numbers', // Paginación con números simples (anterior/siguiente)
                pageLength: 10, // Número de registros por página
                lengthMenu: [10, 25, 50, 100], // Opciones de registros por página
                language: {
                    url: 'https://cdn.datatables.net/plug-ins/2.1.8/i18n/es-MX.json',
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
