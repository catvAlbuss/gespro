<x-app-layout>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <!-- Agregar el CSS de Select2 en el head -->
    <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />
    <!-- Agregar jQuery (necesario para Select2) -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

    <!-- Agregar el JS de Select2 -->
    <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>

    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Gestion Administrativa') }}
        </h2>
    </x-slot>
    <div class="py-12">
        <div class="container mx-auto w-full">
            <div class="flex flex-wrap">
                <div class="w-full md:w-1/3">
                    <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                        <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4"></h3>
                        <div class="overflow-auto">
                            <form
                                action="{{ isset($vale) ? route('vales_entrega.update', $vale->id_vaeqen) : route('vales_entrega.store') }}"
                                method="POST">
                                @csrf

                                <!-- Si estamos editando, usaremos el método PUT -->
                                @if (isset($vale))
                                    @method('PUT')
                                @endif

                                <!-- Campo de Empresa (puede ser oculto o visible, dependiendo de tu necesidad) -->
                                <input type="hidden" id="empresa_id" name="empresa_id"
                                    value="{{ old('empresa_id', $empresaId) }}">

                                <!-- Campo para trabajador -->
                                <div>
                                    <x-input-label for="usuario_designado" :value="__('Trabajador')" />
                                    <x-input-select id="usuario_designado" class="block mt-1 w-full"
                                        name="usuario_designado" required>
                                        <option value="" disabled selected>Selecciona un trabajador</option>
                                         @foreach ($trabajadores as $trabajador)
                                                @php
                                                    $excludedNames = [
                                                        "ANDREA ALEXANDRA", 
                                                        "LUIS ANGEL", 
                                                        "JORGE DAVID", 
                                                        "FERNANDO PIERO", 
                                                        "YESICA",
                                                        "Administrador"
                                                    ];
                                                @endphp
                                                
                                                @if (!in_array($trabajador->name, $excludedNames))
                                                    <option value="{{ $trabajador->id }}">{{ $trabajador->name }}</option>
                                                @endif
                                            @endforeach
                                    </x-input-select>
                                </div>

                                <!-- Campo para equipos -->
                                <div>
                                    <x-input-label for="inventario_designado" :value="__('Producto')" />
                                    <x-input-select id="inventario_designado" class="block mt-1 w-full"
                                        name="inventario_designado" required>
                                        <option value="" disabled selected>Selecciona un producto</option>
                                        @foreach ($inventarios as $inventario)
                                            <option value="{{ $inventario->id_inventario }}"
                                                {{ old('inventario_designado', $vale->inventario_designado ?? '') == $inventario->id_inventario ? 'selected' : '' }}>
                                                {{ $inventario->nombre_producto }}
                                            </option>
                                        @endforeach
                                    </x-input-select>
                                </div>

                                <!-- Campo para cantidad entrega -->
                                <div>
                                    <x-input-label for="stock" :value="__('Stock')" />
                                    <x-text-input id="stock" class="block mt-1 w-full" type="number" name="stock"
                                        :value="old('stock', $vale->inventario->Stockactual ?? '')" required disabled />
                                </div>
                                <!-- Campo para fecha entregado -->
                                <div>
                                    <x-input-label for="fecha_entregado" :value="__('Fecha Entregado')" />
                                    <x-text-input id="fecha_entregado" class="block mt-1 w-full" type="date"
                                        name="fecha_entregado" :value="old(
                                            'fecha_entregado',
                                            $vale->fecha_entregado ?? ($vale->fecha_entregado ?? ''),
                                        )" required autofocus />
                                </div>

                                <!-- Campo para cantidad entrega -->
                                <div>
                                    <x-input-label for="cantidad_entrega" :value="__('Cantidad Entregada')" />
                                    <x-text-input id="cantidad_entrega" class="block mt-1 w-full" type="number"
                                        name="cantidad_entrega" :value="old(
                                            'cantidad_entrega',
                                            $vale->cantidad_entrega ?? ($vale->cantidad_entrega ?? ''),
                                        )" required autofocus />
                                </div>

                                <!-- Campo para Estado de entrega -->
                                <div>
                                    <x-input-label for="estado_prod" :value="__('Estado del Equipo')" />
                                    <x-input-select id="estado_prod" class="block mt-1 w-full" name="estado_prod"
                                        required>
                                        <option value="Buen estado"
                                            {{ old('estado_prod', $vale->estado_prod ?? '') == 'Buen estado' ? 'selected' : '' }}>
                                            Buen Estado</option>
                                        <option value="Intermedio"
                                            {{ old('estado_prod', $vale->estado_prod ?? '') == 'Intermedio' ? 'selected' : '' }}>
                                            Intermedio</option>
                                        <option value="Malogrado"
                                            {{ old('estado_prod', $vale->estado_prod ?? '') == 'Malogrado' ? 'selected' : '' }}>
                                            Malogrado</option>
                                    </x-input-select>
                                </div>
                                <!-- Botón de submit -->
                                <div class="mb-4">
                                    <button type="submit" id="submit-button"
                                        class="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">
                                        {{ isset($vale) ? 'Actualizar' : 'Crear' }} Vale de Entrega
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <script>
                    $(document).ready(function() {
                        $('#inventario_designado').select2({
                            placeholder: "Selecciona un producto", // Mensaje por defecto
                            allowClear: true, // Permitir limpiar la selección
                            width: '100%' // Asegura que el select ocupe todo el ancho disponible
                        });
                    });
                    $(document).ready(function() {
                        // Inicializamos Select2 en el campo de productos
                        const empresaId = document.getElementById("empresa_id").value;
                        $('#inventario_designado').select2({
                            placeholder: "Selecciona un producto",
                            allowClear: true,
                            width: '100%',
                            ajax: {
                                url: '{{ route('productos.get', ['empresaId' => '__empresaId__']) }}'.replace(
                                    '__empresaId__', empresaId),
                                dataType: 'json',
                                delay: 250, // Retraso en la búsqueda
                                processResults: function(data) {
                                    // Mapeamos la respuesta para que Select2 la pueda usar
                                    return {
                                        results: data.results // Usamos los resultados devueltos por el controlador
                                    };
                                },
                                cache: true
                            }
                        });

                        // Cuando se seleccione un producto, actualizar el stock
                        $('#inventario_designado').on('select2:select', function(e) {
                            var selectedProduct = e.params.data; // Obtiene el producto seleccionado
                            // Actualizar el campo de Stock con el stock actual del producto seleccionado
                            $('#stock').val(selectedProduct.stockactual).prop('disabled',
                                true); // Deshabilitar el campo de stock

                            // Verificar si el stock es 0 y deshabilitar el botón de submit si es necesario
                            if (selectedProduct.stockactual <= 0) {
                                $('#cantidad_entrega').prop('disabled',
                                    true); // Deshabilitar cantidad_entrega si el stock es 0
                                $('#submit-button').prop('disabled', true); // Deshabilitar el botón de submit
                                alert('No hay stock disponible para este producto.');
                            } else {
                                $('#cantidad_entrega').prop('disabled',
                                    false); // Habilitar cantidad_entrega si hay stock
                                $('#submit-button').prop('disabled', false); // Habilitar el botón de submit
                            }
                        });
                    });
                </script>

                <div class="w-full md:w-2/3 px-4 mt-4 md:mt-0">
                    <div class="overflow-auto">
                        <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                            <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Lista de Equipos /
                                Prendas entregados</h3>
                            <div class="overflow-x-auto">
                                <!-- Start coding here -->
                                <div class="bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden">
                                    <div
                                        class="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
                                        <div class="w-full md:w-1/2">
                                            <form class="flex items-center">
                                                <label for="simple-search" class="sr-only">Search</label>
                                                <div class="relative w-full">
                                                    <div
                                                        class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                        <svg aria-hidden="true"
                                                            class="w-5 h-5 text-gray-500 dark:text-gray-400"
                                                            fill="currentColor" viewbox="0 0 20 20"
                                                            xmlns="http://www.w3.org/2000/svg">
                                                            <path fill-rule="evenodd"
                                                                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                                                clip-rule="evenodd" />
                                                        </svg>
                                                    </div>
                                                    <input type="text" id="simple-search"
                                                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                                        placeholder="Search" required="">
                                                </div>
                                            </form>
                                        </div>
                                        <div
                                            class="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
                                            <div class="flex items-center space-x-3 w-full md:w-auto">
                                                <div id="actionsDropdown"
                                                    class="hidden z-10 w-44 bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700 dark:divide-gray-600">
                                                    <ul class="py-1 text-sm text-gray-700 dark:text-gray-200"
                                                        aria-labelledby="actionsDropdownButton">
                                                        <li>
                                                            <a href="#"
                                                                class="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Mass
                                                                Edit</a>
                                                        </li>
                                                    </ul>
                                                    <div class="py-1">
                                                        <a href="#"
                                                            class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Delete
                                                            all</a>
                                                    </div>
                                                </div>
                                                <button id="filterDropdownButton" data-dropdown-toggle="filterDropdown"
                                                    class="w-full md:w-auto flex items-center justify-center py-2 px-4 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                                                    type="button">
                                                    <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
                                                        class="h-4 w-4 mr-2 text-gray-400" viewbox="0 0 20 20"
                                                        fill="currentColor">
                                                        <path fill-rule="evenodd"
                                                            d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                                                            clip-rule="evenodd" />
                                                    </svg>
                                                    Filter
                                                    <svg class="-mr-1 ml-1.5 w-5 h-5" fill="currentColor"
                                                        viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"
                                                        aria-hidden="true">
                                                        <path clip-rule="evenodd" fill-rule="evenodd"
                                                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                                    </svg>
                                                </button>
                                                <div id="filterDropdown"
                                                    class="z-10 hidden w-48 p-3 bg-white rounded-lg shadow dark:bg-gray-700">
                                                    <h6 class="mb-3 text-sm font-medium text-gray-900 dark:text-white">
                                                        Choose brand</h6>
                                                    <ul class="space-y-2 text-sm"
                                                        aria-labelledby="filterDropdownButton">
                                                        <li class="flex items-center">
                                                            <input id="apple" type="checkbox" value=""
                                                                class="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500">
                                                            <label for="apple"
                                                                class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">Apple
                                                                (56)</label>
                                                        </li>
                                                        <li class="flex items-center">
                                                            <input id="fitbit" type="checkbox" value=""
                                                                class="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500">
                                                            <label for="fitbit"
                                                                class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">Microsoft
                                                                (16)</label>
                                                        </li>
                                                        <li class="flex items-center">
                                                            <input id="razor" type="checkbox" value=""
                                                                class="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500">
                                                            <label for="razor"
                                                                class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">Razor
                                                                (49)</label>
                                                        </li>
                                                        <li class="flex items-center">
                                                            <input id="nikon" type="checkbox" value=""
                                                                class="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500">
                                                            <label for="nikon"
                                                                class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">Nikon
                                                                (12)</label>
                                                        </li>
                                                        <li class="flex items-center">
                                                            <input id="benq" type="checkbox" value=""
                                                                class="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500">
                                                            <label for="benq"
                                                                class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">BenQ
                                                                (74)</label>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="overflow-x-auto">
                                        <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                            <thead
                                                class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                                <tr>
                                                    <th scope="col" class="px-4 py-3">#</th>
                                                    <th scope="col" class="px-4 py-3">Trabajador</th>
                                                    <th scope="col" class="px-4 py-3">Fecha Entrega</th>
                                                    <th scope="col" class="px-4 py-3">Cantidad Entregado</th>
                                                    <th scope="col" class="px-4 py-3">Estado</th>
                                                    <th scope="col" class="px-4 py-3">Equipo</th>
                                                    <th scope="col" class="px-4 py-3">Detalles</th>
                                                    <th scope="col" class="px-4 py-3">Stock Total</th>
                                                    <th scope="col" class="px-4 py-3">
                                                        <span class="sr-only">Actions</span>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                @foreach ($valeseqentregas as $vale)
                                                    @php
                                                        $cantidadStoktotal =
                                                            $vale->inventario->stock - $vale->inventario->Stockactual;
                                                    @endphp
                                                    <tr class="border-b dark:border-gray-700">
                                                        <td class="px-4 py-3 text-center">{{ $loop->iteration }}</td>
                                                        <th scope="row"
                                                            class="px-4 py-3 text-center font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                            {{ $vale->usuario->name }} {{ $vale->usuario->surname }}
                                                        </th>
                                                        <td class="px-4 py-3 text-center">{{ $vale->fecha_entregado }}
                                                        </td>
                                                        <td class="px-4 py-3 text-center">
                                                            {{ $vale->cantidad_entrega }}</td>
                                                        @php
                                                            $property = 'estado_prod'; // Esto es solo un ejemplo. Usa la variable que desees.
                                                        @endphp
                                                        <td
                                                            class="px-4 py-3 text-center 
                                                            @if ($vale->$property == 'Buen estado') bg-green-200 text-green-800
                                                            @elseif ($vale->$property == 'Intermedio') bg-yellow-200 text-yellow-800
                                                            @elseif ($vale->$property == 'Malogrado') bg-red-200 text-red-800
                                                            @else bg-red-600 text-white @endif">
                                                            {{ $vale->$property }}
                                                        </td>
                                                        <td class="px-4 py-3 text-center">
                                                            {{ $vale->inventario->nombre_producto }}</td>
                                                        <td class="px-4 py-3 text-center">
                                                            {{ $vale->inventario->detalles_prod }}</td>
                                                        <td
                                                            class="px-4 py-3 text-center
                                                        @if ($cantidadStoktotal > 10) bg-green-200 text-green-800
                                                        @elseif ($cantidadStoktotal >= 5 && $cantidadStoktotal <= 9) bg-yellow-200 text-yellow-800
                                                        @elseif ($cantidadStoktotal <= 4 && $cantidadStoktotal >= 0) bg-red-200 text-red-800
                                                        @else bg-red-600 text-white @endif">
                                                            {{ $cantidadStoktotal }}
                                                        </td>
                                                        <td class="px-4 py-3 flex items-center justify-end">
                                                            <form
                                                                action="{{ route('vales_entrega.edit', $vale->id_vaeqen) }}"
                                                                method="GET">
                                                                <!-- Enviar el id del vale y empresa_id como campos ocultos -->
                                                                <input type="hidden" name="empresa_id"
                                                                    value="{{ $empresaId }}">
                                                                <button type="submit"
                                                                    class="block py-2 px-4 text-yellow-300 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-yellow-600">
                                                                    Edit
                                                                </button>
                                                            </form>
                                                        </td>
                                                        <td class="px-4 py-3 flex items-center justify-end">
                                                            <form
                                                                action="{{ route('vales_entrega.destroy', $vale->id_vaeqen) }}"
                                                                method="POST" class="inline">
                                                                @csrf
                                                                @method('DELETE')
                                                                <input type="hidden" name="empresa_id"
                                                                    value="{{ $empresaId }}">
                                                                <button type="submit"
                                                                    class="text-red-600">Eliminar</button>
                                                            </form>
                                                        </td>
                                                    </tr>
                                                @endforeach
                                            </tbody>
                                        </table>
                                    </div>
                                    <nav class="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4"
                                        aria-label="Table navigation">
                                        <span class="text-sm font-normal text-gray-500 dark:text-gray-400">
                                            datos
                                            <span class="font-semibold text-gray-900 dark:text-white">1-10</span>
                                            de
                                            <span class="font-semibold text-gray-900 dark:text-white">1000</span>
                                        </span>
                                        <ul class="inline-flex items-stretch -space-x-px">
                                            <li>
                                                <a href="#"
                                                    class="flex items-center justify-center h-full py-1.5 px-3 ml-0 text-gray-500 bg-white rounded-l-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                                                    <span class="sr-only">Anterior</span>
                                                    <svg class="w-5 h-5" aria-hidden="true" fill="currentColor"
                                                        viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                        <path fill-rule="evenodd"
                                                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                                            clip-rule="evenodd" />
                                                    </svg>
                                                </a>
                                            </li>
                                            <li>
                                                <a href="#"
                                                    class="flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">1</a>
                                            </li>
                                            <li>
                                                <a href="#"
                                                    class="flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">2</a>
                                            </li>
                                            <li>
                                                <a href="#" aria-current="page"
                                                    class="flex items-center justify-center text-sm z-10 py-2 px-3 leading-tight text-primary-600 bg-primary-50 border border-primary-300 hover:bg-primary-100 hover:text-primary-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white">3</a>
                                            </li>
                                            <li>
                                                <a href="#"
                                                    class="flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">...</a>
                                            </li>
                                            <li>
                                                <a href="#"
                                                    class="flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">100</a>
                                            </li>
                                            <li>
                                                <a href="#"
                                                    class="flex items-center justify-center h-full py-1.5 px-3 leading-tight text-gray-500 bg-white rounded-r-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                                                    <span class="sr-only">Despues</span>
                                                    <svg class="w-5 h-5" aria-hidden="true" fill="currentColor"
                                                        viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                        <path fill-rule="evenodd"
                                                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                                            clip-rule="evenodd" />
                                                    </svg>
                                                </a>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <script>
            // Asume que tienes jQuery disponible
            $('#searchInput').on('input', function() {
                var searchTerm = $(this).val();

                $.ajax({
                    url: '/search-vales',
                    method: 'GET',
                    data: {
                        searchTerm: searchTerm
                    },
                    success: function(data) {
                        updateTable(data);
                    },
                    error: function(xhr, status, error) {
                        console.error(error);
                    }
                });
            });

            function updateTable(data) {
                var tableBody = $('#tableBody');
                tableBody.empty();

                $.each(data, function(index, vale) {
                    var row = $('<tr>').addClass('border-b dark:border-gray-700');

                    row.append($('<td>').addClass('px-4 py-3 text-center').text(index + 1));
                    row.append($('<th>').addClass(
                            'px-4 py-3 text-center font-medium text-gray-900 whitespace-nowrap dark:text-white')
                        .text(vale.usuario.name + ' ' + vale.usuario.surname));
                    row.append($('<td>').addClass('px-4 py-3 text-center').text(vale.fecha_entregado));
                    row.append($('<td>').addClass('px-4 py-3 text-center').text(vale.cantidad_entrega));
                    // Agrega el resto de los campos de la fila

                    tableBody.append(row);
                });
            }
        </script>
    </div>
</x-app-layout>
