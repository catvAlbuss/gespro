<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Gestor Campo Mantenimiento') }}
        </h2>
        <link rel="stylesheet" href="https://cdn.datatables.net/2.1.8/css/dataTables.tailwindcss.css">
        <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
        <script src="https://cdn.tailwindcss.com/"></script>
        <script src="https://cdn.datatables.net/2.1.8/js/dataTables.js"></script>
        <script src="https://cdn.datatables.net/2.1.8/js/dataTables.tailwindcss.js"></script>
        <script src="https://cdn.tailwindcss.com/"></script>
        <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

        <div class="flex items-center justify-end -mt-8">

            {{-- <form action="{{ route('mantenimientoCampo.traerdataman') }}" method="POST">
                @csrf
                <input type="hidden" name="tipo" value="mantenimiento">
                <button type="submit"
                    class="m-1 ms-0 relative py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50">
                    Mantenimiento
                </button>
            </form> --}}

            <button type="button"
                class="m-1 ms-0 relative py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                id="openModal">
                Registrar Mantenimiento
            </button>

        </div>
    </x-slot>

    <!-- Modal  crear-->
    <div id="modalCrearMantenimiento"
        class="fixed inset-0 flex items-center justify-center z-50 hidden bg-black bg-opacity-50">
        <div class="bg-white rounded-lg shadow-lg w-11/12 md:w-1/3 p-6">
            <h2 class="text-lg font-semibold mb-4">Registrar Mantenimiento</h2>
            <form method="POST" action="{{ route('mantenimientoCampo.store') }}" class="space-y-4">
                @csrf
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label for="nombre_mant" class="block text-sm font-medium text-gray-700">Nombre de
                            mantenimiento(*)</label>
                        <input id="nombre_mant" name="nombre_proyecto_mant" type="text" required
                            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
                            placeholder="Ingrese el nombre del proyecto">
                    </div>
                    <div>
                        <label for="propietario_mant" class="block text-sm font-medium text-gray-700">Entidad(*)</label>
                        <input id="propietario_mant" name="propietario_mant" type="text" required
                            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
                            placeholder="Ingrese la razón social">
                    </div>
                    <div>
                        <label for="ubicacion_mant" class="block text-sm font-medium text-gray-700">Ubicación(*)</label>
                        <input id="ubicacion_mant" name="ubicacion_mant" type="text" required
                            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
                            placeholder="Ingrese la ubicación">
                    </div>
                    <div>
                        <label for="fecha_pro_mant" class="block text-sm font-medium text-gray-700">Fecha(*)</label>
                        <input id="fecha_pro_mant" name="fecha_pro_mant" type="date" required
                            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2">
                    </div>
                    <div>
                        <label for="cotizacion_mant"
                            class="block text-sm font-medium text-gray-700">Cotización(*)</label>
                        <input id="cotizacion_mant" name="cotizacion_mant" type="number" required
                            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2">
                    </div>
                    <div>
                        <label for="materiales_mant"
                            class="block text-sm font-medium text-gray-700">Materiales(*)</label>
                        <input id="materiales_mant" name="materiales_mant" type="number" required
                            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2">
                    </div>
                    <div>
                        <label for="mano_obra_mant" class="block text-sm font-medium text-gray-700">Maestros(*)</label>
                        <input id="mano_obra_mant" name="mano_obra_mant" type="number" required
                            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2">
                    </div>
                    <div>
                        <label for="gastos_generales" class="block text-sm font-medium text-gray-700">Gastos
                            generales(*)</label>
                        <input id="gastos_generales" name="gastos_generales" type="number" required
                            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2">
                    </div>
                </div>
                <div class="flex items-center justify-end mt-4">
                    <button type="button" class="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                        id="closeModalCrear">Cerrar</button>
                    <button type="submit"
                        class="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Guardar</button>
                </div>
            </form>
        </div>
    </div>


    <div id="modalEditarMantenimiento"
        class="fixed inset-0 flex items-center justify-center z-50 hidden bg-black bg-opacity-50">
        <div class="bg-white rounded-lg shadow-lg w-11/12 md:w-1/3 p-6">
            <h2 class="text-lg font-semibold mb-4">Editar Mantenimiento</h2>
            <form id="editMantenimientoForm" method="POST" action="" class="space-y-4">
                @csrf
                @method('PUT')
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label for="nombre_mant_edit" class="block text-sm font-medium text-gray-700">Nombre de
                            mantenimiento(*)</label>
                        <input id="nombre_mant_edit" name="nombre_proyecto_mant" type="text" required
                            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                    </div>
                    <div>
                        <label for="propietario_mant_edit"
                            class="block text-sm font-medium text-gray-700">Entidad(*)</label>
                        <input id="propietario_mant_edit" name="propietario_mant" type="text" required
                            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                    </div>
                    <div>
                        <label for="ubicacion_mant_edit"
                            class="block text-sm font-medium text-gray-700">Ubicación(*)</label>
                        <input id="ubicacion_mant_edit" name="ubicacion_mant" type="text" required
                            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                    </div>
                    <div>
                        <label for="fecha_pro_edit" class="block text-sm font-medium text-gray-700">Fecha(*)</label>
                        <input id="fecha_pro_edit" name="fecha_pro_mant" type="date" required
                            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                    </div>
                    <div>
                        <label for="cotizacion_mant_edit"
                            class="block text-sm font-medium text-gray-700">Cotización(*)</label>
                        <input id="cotizacion_mant_edit" name="cotizacion_mant" type="number" required
                            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                    </div>
                    <div>
                        <label for="materiales_mant_edit"
                            class="block text-sm font-medium text-gray-700">Materiales(*)</label>
                        <input id="materiales_mant_edit" name="materiales_mant" type="number" required
                            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                    </div>
                    <div>
                        <label for="maestro_edit" class="block text-sm font-medium text-gray-700">Maestros(*)</label>
                        <input id="maestro_edit" name="mano_obra_mant" type="number" required
                            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                    </div>
                    <div>
                        <label for="gastosG_edit" class="block text-sm font-medium text-gray-700">Gastos
                            generales(*)</label>
                        <input id="gastosG_edit" name="gastos_generales" type="number" required
                            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                    </div>
                </div>
                <div class="flex items-center justify-end mt-4">
                    <button type="button" class="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                        id="closeModalEditar">Cerrar</button>
                    <button type="submit"
                        class="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Actualizar</button>
                </div>
            </form>
        </div>
    </div>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div
                class="bg-white dark:bg-gray-800 text-gray-950 dark:text-gray-50 overflow-hidden shadow-sm sm:rounded-lg">
                <table id="mantenimientoTable"
                    class="table-fixed text-sm text-center rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" class="px-2 py-2 text-center">#</th>
                            <th scope="col" class="px-2 py-2 text-center">Obra</th>
                            <th scope="col" class="px-2 py-2 text-center">Contratista</th>
                            <th scope="col" class="px-2 py-2 text-center">Ubicación</th>
                            <th scope="col" class="px-2 py-2 text-center">Fecha</th>
                            <th scope="col" class="px-2 py-2 text-center">Cotización</th>
                            <th scope="col" class="px-2 py-2 text-center">Acciones</th>
                        </tr>
                    </thead>

                    <body>
                        @foreach ($mantenimientos as $index => $mantenimiento)
                            <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                <td class="px-6 py-4 text-center">{{ $index + 1 }}</td>
                                <td class="px-6 py-4 text-center break-words whitespace-normal">
                                    {{ $mantenimiento->nombre_proyecto_mant }}</td>
                                <td class="px-6 py-4 text-center">{{ $mantenimiento->propietario_mant }}
                                </td>
                                <td class="px-6 py-4 text-center">{{ $mantenimiento->ubicacion_mant }}</td>
                                <td class="px-6 py-4 text-center">
                                    {{ \Carbon\Carbon::parse($mantenimiento->fecha_pro_mant)->format('d/m/Y') }}
                                </td>
                                <td class="px-6 py-4 text-center">{{ $mantenimiento->cotizacion_mant }}
                                </td>
                                <td class="px-4 py-3 flex items-center justify-end">
                                    <!-- Botón para abrir el dropdown -->
                                    <button id="menu-button-{{ $mantenimiento->id_mantimiento }}"
                                        class="inline-flex items-center p-0.5 text-sm font-medium text-center text-gray-500 hover:text-gray-800 rounded-lg focus:outline-none dark:text-gray-400 dark:hover:text-gray-100"
                                        type="button"
                                        onclick="toggleDropdown(event, {{ $mantenimiento->id_mantimiento }})">
                                        <svg class="w-5 h-5" aria-hidden="true" fill="currentColor"
                                            viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                                        </svg>
                                    </button>

                                    <!-- Dropdown content -->
                                    <div id="dropdown-{{ $mantenimiento->id_mantimiento }}"
                                        class="hidden z-10 w-44 bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700 dark:divide-gray-600 absolute right-0 mt-2">
                                        <ul class="py-1 text-sm text-gray-700 dark:text-gray-200">
                                            <li>
                                                <a href="{{ route('gestor.mantenimiento', ['id_mantimiento' => $mantenimiento->id_mantimiento]) }}"
                                                    class="block py-2 px-4 hover:bg-blue-600 dark:hover:bg-blue-600 dark:hover:text-white">Abrir</a>
                                            </li>
                                            <li>
                                                <a data-id="{{ $mantenimiento->id_mantimiento }}"
                                                    data-url="{{ route('mantenimientoCampo.edit', $mantenimiento->id_mantimiento) }}"
                                                    class="edit-button block py-2 px-4 hover:bg-yellow-400 dark:hover:bg-yellow-600 dark:hover:text-white">Editar</a>
                                            </li>
                                            <li>
                                                <form
                                                    action="{{ route('mantenimientoCampo.destroy', $mantenimiento->id_mantimiento) }}"
                                                    method="POST" class="inline">
                                                    @csrf
                                                    @method('DELETE')
                                                    <button type="submit"
                                                        class="block py-2 px-4 text-sm text-center align-middle justify-between text-red-700 hover:bg-gray-100 dark:hover:bg-red-700 dark:text-gray-200 dark:hover:text-white">Eliminar</button>
                                                </form>
                                            </li>
                                        </ul>
                                    </div>
                                </td>
                            </tr>
                        @endforeach
                    </body>
                </table>
            </div>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            document.getElementById('openModal').addEventListener('click', function() {
                document.getElementById('modalCrearMantenimiento').classList.remove('hidden');
            });

            document.getElementById('closeModalCrear').addEventListener('click', function() {
                document.getElementById('modalCrearMantenimiento').classList.add('hidden');
            });
        });
    </script>

    <script>
        $(document).ready(function() {
            $('.edit-button').on('click', function(event) {
                event.preventDefault();

                // Obtiene la URL del atributo data-url
                const url = $(this).data('url');
                console.log("URL para editar:", url); // Muestra la URL en la consola

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
                        console.log("Datos recibidos:",
                            response); // Muestra la respuesta en la consola

                        // Llena los campos del formulario con los datos obtenidos
                        $('#nombre_mant_edit').val(response.nombre_proyecto_mant || '');
                        $('#propietario_mant_edit').val(response.propietario_mant || '');
                        $('#ubicacion_mant_edit').val(response.ubicacion_mant || '');
                        $('#fecha_pro_edit').val(response.fecha_pro_mant || '');
                        $('#cotizacion_mant_edit').val(response.cotizacion_mant || '');
                        $('#materiales_mant_edit').val(response.materiales_mant || '');
                        $('#maestro_edit').val(response.mano_obra_mant || '');
                        $('#gastosG_edit').val(response.gastos_generales || '');

                        // Ajusta la acción del formulario para actualizar
                        $('#editMantenimientoForm').attr('action',
                            `/mantenimientoCampo/${response.id_mantimiento}`);

                        // Abre el modal
                        $('#modalEditarMantenimiento').removeClass('hidden');
                    },
                    error: function(xhr) {
                        console.error('Error al cargar los datos:', xhr);
                        alert('Hubo un problema al cargar los datos. Inténtalo de nuevo.');
                    }
                });
            });

            // Cerrar el modal
            $('#closeModalEditar').on('click', function() {
                $('#modalEditarMantenimiento').addClass('hidden');
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
            $('#mantenimientoTable').DataTable({
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
