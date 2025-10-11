<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Stock Inventarios') }}
        </h2>
    </x-slot>
    <!-- Include jQuery and DataTables CSS/JS -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <link rel="stylesheet" href="https://cdn.datatables.net/2.1.8/css/dataTables.dataTables.css">k
    <link rel="stylesheet" href="https://cdn.datatables.net/1.11.5/css/jquery.dataTables.min.css">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.datatables.net/1.11.5/js/jquery.dataTables.min.js"></script>
    <script src="https://cdn.datatables.net/buttons/2.2.2/js/dataTables.buttons.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.53/pdfmake.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.53/vfs_fonts.js"></script>
    <script src="https://cdn.datatables.net/buttons/2.2.2/js/buttons.html5.min.js"></script>


    <style>
        /* Estilo para asegurar que los modales estén al frente */
        #modalRegisterInventario,
        #editModal {
            z-index: 50;
            /* Asegúrate de que estén al frente */
        }
    </style>

    <!-- Modal para registrar inventarios -->
    <div id="modalRegisterInventario"
        class="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center hidden">
        <div class="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-lg">
            <h2 class="text-lg font-semibold mb-4">Registrar Inventarios</h2>
            <form id="productForm" action="{{ route('inventarios.registrar.excel') }}" method="POST"
                enctype="multipart/form-data">
                @csrf
                <div class="mb-4">
                    <h3 class="text-center">Inserte un documento Excel con el formato ya predeterminado</h3>
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700">Documento</label>
                    <input type="file" name="documents"
                        class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500"
                        required accept=".xlsx,.xls,.csv,.xlsm">
                </div>
                <input type="hidden" id="inventario_designado" name="inventario_designado"
                    value="{{ $id_gestion_inv }}">
                <div class="flex justify-end">
                    <button type="button" id="closeModalRegister"
                        class="mr-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-md">Cancelar</button>
                    <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md">Registrar</button>
                </div>
            </form>
        </div>
    </div>


    <!-- Modal -->
    <div id="editModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 hidden">
        <div class="bg-white rounded-lg shadow-lg p-6 w-1/3">
            <h2 class="text-lg font-semibold mb-4">Editar Inventario</h2>
            <form id="editForm" method="POST" action="">
                @csrf
                @method('PUT')
                <!-- Agrega los campos necesarios para editar el inventario aquí -->
                <div class="mb-4">
                    <label for="Stockactual" class="block text-sm font-medium text-gray-700">Nombre</label>
                    <input type="text" name="Stockactual" id="Stockactual"
                        class="mt-1 block w-full border-gray-300 rounded-md" required>
                </div>
                <div class="mb-4">
                    <label for="sustentoactual" class="block text-sm font-medium text-gray-700">Nombre</label>
                    <input type="text" name="sustentoactual" id="sustentoactual"
                        class="mt-1 block w-full border-gray-300 rounded-md" required>
                </div>
                <input type="hidden" id="inventario_designado" name="inventario_designado"
                    value="{{ $id_gestion_inv }}">
                <div class="flex justify-end">
                    <button type="button" class="mr-2 px-4 py-2 bg-gray-200 rounded"
                        onclick="closeModal()">Cancelar</button>
                    <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded">Guardar</button>
                </div>
            </form>
        </div>
    </div>


    <div class="py-12">
        <div class="container mx-auto w-full">
            <div class="flex flex-wrap">
                <div class="w-full md:w-full px-4 mt-4 md:mt-0">
                    <div class="overflow-auto">
                        <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                            <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4"></h3>
                            <div class="overflow-x-auto">
                                <button id="openModalRegister"
                                    class="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-500 active:bg-blue-700 focus:outline-none focus:border-blue-700 focus:ring ring-blue-200 disabled:opacity-25 transition">
                                    Registrar Productos
                                </button>
                                <br>
                                <br>
                                <table id="inventarioTable"
                                    class="min-w-full w-full text-sm text-center rtl:text-right text-gray-50 dark:text-gray-50">
                                    <thead
                                        class="text-xs text-center text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                        <tr>
                                            <th scope="col" class="px-6 py-3">#</th>
                                            <th scope="col" class="px-6 py-3">Nombre Producto</th>
                                            <th scope="col" class="px-6 py-3">Marca</th>
                                            <th scope="col" class="px-10 py-3">Detalles<br>Estado</th>
                                            <th scope="col" class="px-6 py-3">Fecha<br>Registrado</th>
                                            <th scope="col" class="px-6 py-3 bg-yellow-500 text-gray-950">Costo</th>
                                            <th scope="col" class="px-6 py-3 bg-yellow-500 text-gray-950">Stock</th>
                                            <th scope="col" class="px-6 py-3 bg-yellow-500 text-gray-950">Total</th>
                                            <th scope="col" class="px-6 py-3 bg-green-500 text-gray-950">Stock Actual
                                            </th>
                                            <th scope="col" class="px-10 py-3 bg-green-500 text-gray-950">
                                                Detalle<br>Estado</th>
                                            <th scope="col" class="px-6 py-3 bg-red-500 text-gray-950">Stock Real
                                            </th>
                                            <th scope="col" class="px-6 py-3">Editar</th>
                                            <th scope="col" class="px-6 py-3">Eliminar</th>
                                        </tr>
                                    </thead>
                                    <tbody class="bg-gray-50 dark:bg-gray-700">>
                                        @foreach ($inventarios as $index => $inventario)
                                            @php
                                                $costoTotal = $inventario->costo * $inventario->stock;
                                                $stockReal = $inventario->stock - $inventario->Stockactual;
                                            @endphp
                                            <tr class="border-b dark:border-gray-700">
                                                <td class="px-6 py-4 text-gray-950"> {{ $index + 1 }}</td>
                                                <td class="px-6 py-4 break-words text-gray-950">
                                                    {{ $inventario->nombre_producto }}
                                                </td>
                                                <td class="px-6 py-4 break-words text-gray-950">
                                                    {{ $inventario->marca_prod }}</td>
                                                <td class="px-6 py-4 break-words text-gray-950">
                                                    {{ $inventario->detalles_prod }}</td>
                                                <td class="px-6 py-4 break-words text-gray-950">
                                                    {{ $inventario->fecha_inv }}</td>
                                                <td class="px-6 py-4 bg-yellow-500 text-gray-950 break-words">
                                                    {{ number_format($inventario->costo, 2) }}</td>
                                                <td class="px-6 py-4 bg-yellow-500 text-gray-950 break-words">
                                                    {{ $inventario->stock }}</td>
                                                <td class="px-6 py-4 bg-yellow-500 text-gray-950 break-words">
                                                    {{ number_format($costoTotal, 2) }}</td>
                                                <td class="px-6 py-4 bg-green-500 text-gray-950 break-words">
                                                    {{ $inventario->Stockactual }}</td>
                                                <td class="px-6 py-4 bg-green-500 text-gray-950 break-words">
                                                    {{ $inventario->sustentoactual }}</td>
                                                <td class="px-6 py-4 bg-red-500 text-gray-950 break-words">
                                                    {{ $stockReal }}</td>
                                                <td class="px-6 py-4">
                                                    <a href="#" class="text-blue-600"
                                                        onclick="openModal('{{ route('gestorinventarioge.editinventario', $inventario->id_inventario) }}', '{{ $inventario->Stockactual }}', '{{ $inventario->sustentoactual }}')">
                                                        Editar
                                                    </a>
                                                </td>
                                                <td class="px-6 py-4">
                                                    <form
                                                        action="{{ route('gestorinventarioge.destroyinventario', $inventario->id_inventario) }}"
                                                        method="POST" class="inline">
                                                        @csrf
                                                        @method('DELETE')
                                                        <input type="hidden" id="inventario_designado"
                                                            name="inventario_designado"
                                                            value="{{ $id_gestion_inv }}">
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
    <script>
        $(document).ready(function() {
            var table = $('#inventarioTable').DataTable({
                dom: 'Bfrtip',
                buttons: [{
                        extend: 'excel',
                        className: 'bg-green-500 text-white font-semibold py-2 px-4 rounded shadow hover:bg-green-600',
                        text: 'Exportar a Excel'
                    },
                    {
                        extend: 'pdf',
                        className: 'bg-blue-500 text-white font-semibold py-2 px-4 rounded shadow hover:bg-blue-600',
                        text: 'Exportar a PDF'
                    }
                ],
                paging: true,
                searching: true,
                ordering: true,
                info: true,
                language: {
                    // Personaliza el idioma aquí si es necesario
                }
            });
        });

        function openModal(action, Stockactual, sustentoactual) {
            document.getElementById('editForm').action = action;
            document.getElementById('Stockactual').value = Stockactual;
            document.getElementById('sustentoactual').value = sustentoactual;
            document.getElementById('editModal').classList.remove('hidden');
        }

        function closeModal() {
            document.getElementById('editModal').classList.add('hidden');
        }
    </script>
    <script>
        // Modal para registrar inventarios
        const modalRegisterInventario = document.getElementById('modalRegisterInventario');
        const openModalRegister = document.getElementById('openModalRegister'); // Este botón debe existir en el HTML
        const closeModalRegister = document.getElementById('closeModalRegister');

        // Evento para abrir el modal
        openModalRegister.addEventListener('click', () => {
            modalRegisterInventario.classList.remove('hidden');
        });

        // Evento para cerrar el modal
        closeModalRegister.addEventListener('click', () => {
            modalRegisterInventario.classList.add('hidden');
        });


        const insertUrl = "{{ route('inventarios.registrar.excel') }}";

        document.getElementById('productForm').addEventListener('submit', (event) => {
            event.preventDefault(); // Previene el envío por defecto

            const formData = new FormData(event.target);
            $.ajax({
                type: 'POST',
                url: insertUrl,
                data: formData,
                contentType: false,
                processData: false,
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                success: function(response) {
                    console.log(response);
                },
                error: function(xhr) {
                    console.error('Error:', xhr);
                }
            });
        });
    </script>

</x-app-layout>
