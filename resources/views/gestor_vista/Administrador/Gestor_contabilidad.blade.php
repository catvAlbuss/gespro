{{--<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Area Contable') }}
        </h2>
    </x-slot>


    <div class="py-2">
        <div class="max-w-full mx-auto sm:px-6 lg:px-8">
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6">
                    <div class="container flex flex-col items-center gap-16 mx-auto my-30">
                        <div class="grid w-full grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                            <div
                                class="flex flex-col items-center gap-3 px-8 py-10 bg-sky-500 hover:bg-sky-800 dark:bg-white dark:hover:bg-sky-500 rounded-3xl shadow-main">
                                <span></span>
                                <a href="">
                                    <p class="text-2xl font-extrabold text-gray-900">Balance</p>
                                </a>
                            </div>
                            <div
                                class="flex flex-col items-center gap-3 px-8 py-10 bg-sky-500 hover:bg-sky-800 dark:bg-white dark:hover:bg-sky-500 rounded-3xl shadow-main">
                                <span></span>
                                <a href="">
                                    <p class="text-2xl font-extrabold text-gray-900">Factura Ingresos</p>
                                </a>
                            </div>

   
                            <div
                                class="flex flex-col items-center gap-3 px-8 py-10 bg-sky-500 hover:bg-sky-800 dark:bg-white dark:hover:bg-sky-500 rounded-3xl shadow-main">
                                <span></span>
                                <a href="">
                                    <p class="text-2xl font-extrabold text-gray-900">Factura Egresos</p>
                                </a>
                            </div>

               
                            <div
                                class="flex flex-col items-center gap-3 px-8 py-10 bg-sky-500 hover:bg-sky-800 dark:bg-white dark:hover:bg-sky-500 rounded-3xl shadow-main">
                                <span></span>
                                <a href="">
                                    <p class="text-2xl font-extrabold text-gray-900">Estados de cuenta</p>
                                </a>
                            </div>

       
                            <div
                                class="flex flex-col items-center gap-3 px-8 py-10 bg-sky-500 hover:bg-sky-800 dark:bg-white dark:hover:bg-sky-500 rounded-3xl shadow-main">
                                <span></span>
                                <a href="">
                                    <p class="text-2xl font-extrabold text-gray-900">Informes</p>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

</x-app-layout>--}}
<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Area Contable') }} 
        </h2>
    </x-slot>


    <div class="py-12">
        <div class="container mx-auto w-full">
            <div class="flex flex-wrap">
                <div class="w-full md:w-1/3">
                    <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                        <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4"></h3>
                        <div class="overflow-auto">
                            <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                                {{ isset($contabilidad) ? 'Editar Balance' : 'Crear Balance' }}</h3>
                            <form method="POST"
                                action="{{ isset($contabilidad) ? route('contabilidads.update', $contabilidad->id) : route('contabilidads.store') }}">
                                @csrf
                                @if (isset($contabilidad))
                                    @method('PUT')
                                @endif
                                <div>
                                    <x-input-label for="nombre_balance" :value="__('Nombre Balance')" />
                                    <x-text-input id="nombre_balance" class="block mt-1 w-full" type="text"
                                        name="nombre_balance"
                                        value="{{ old('nombre_balance', $contabilidad->nombre_balance ?? '') }}"
                                        required autofocus />
                                </div>
                                <div>
                                    <x-input-label for="descripcion" :value="__('Descripción del Balance')" />
                                    <x-text-input id="descripcion" class="block mt-1 w-full" type="text"
                                        name="descripcion"
                                        value="{{ old('descripcion', $contabilidad->descripcion ?? '') }}" required
                                        autofocus />
                                </div>
                                <div>
                                    <x-input-label for="montoInicial" :value="__('Monto Inicial')" />
                                    <x-text-input id="montoInicial" class="block mt-1 w-full" type="number"
                                        name="montoInicial" step="any"
                                        value="{{ old('montoInicial', $contabilidad->montoInicial ?? '') }}" required
                                        autofocus />
                                </div>
                                <div>
                                    <x-input-label for="fecha_ingreso_doc" :value="__('Fecha de Ingreso')" />
                                    <x-text-input id="fecha_ingreso_doc" class="block mt-1 w-full" type="date"
                                        name="fecha_ingreso_doc"
                                        value="{{ old('fecha_ingreso_doc', $contabilidad->fecha_ingreso_doc ?? '') }}"
                                        required autofocus />
                                </div>
                                <input type="hidden" name="empresa_id"
                                    value="{{ old('empresa_id', $contabilidad->empresa_id ?? $empresaId) }}">
                                <input type="hidden" name="documentos_cont" id="documentos_cont" value="">
                                <input type="hidden" name="balance_programado" id="balance_programado" value="">

                                <div class="flex items-center justify-end mt-4">
                                    <x-primary-button class="ml-4">
                                        {{ isset($contabilidad) ? __('Actualizar') : __('Guardar') }}
                                    </x-primary-button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <div class="w-full md:w-2/3 px-4 mt-4 md:mt-0">
                    <div class="overflow-auto">
                        <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                            <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Lista de
                                Contabilidad</h3>
                            <div class="overflow-x-auto">
                                <x-text-input type="text" id="searchInput" placeholder="Buscar por nombre"
                                    class="block mt-1 w-full" />
                                <br>
                                <table
                                    class="min-w-full w-full text-sm text-center rtl:text-right text-gray-500 dark:text-gray-400">
                                    <thead
                                        class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                        <tr>
                                            <th scope="col" class="px-6 py-3">#</th>
                                            <th scope="col" class="px-6 py-3">Nombre</th>
                                            <th scope="col" class="px-6 py-3">Descripcion</th>
                                            <th scope="col" class="px-6 py-3">Monto Inicial</th>
                                            <th scope="col" class="px-6 py-3">Fecha</th>
                                            <th scope="col" class="px-6 py-3">Mostrar</th>
                                            <th scope="col" class="px-6 py-3">Editar</th>
                                            <th scope="col" class="px-6 py-3">Eliminar</th>
                                        </tr>
                                    </thead>
                                    <tbody id="projectTable">
                                        @foreach ($contabilidads as $contabilidad)
                                            <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                                <td class="px-6 py-4">{{ $contabilidad->id }}</td>
                                                <td class="px-6 py-4">{{ $contabilidad->nombre_balance }}</td>
                                                <td class="px-6 py-4">{{ $contabilidad->descripcion }}</td>
                                                <td class="px-6 py-4">{{ $contabilidad->montoInicial }}</td>
                                                <td class="px-6 py-4">{{ $contabilidad->fecha_ingreso_doc }}</td>
                                                <td class="px-6 py-4">
                                                    <a href="{{ route('gestorbalance', ['id' => $contabilidad->id]) }}"
                                                        class="text-blue-600 hover:underline">
                                                        Abrir
                                                    </a>
                                                </td>
                                                <td class="px-6 py-4">
                                                    <a href="{{ route('contabilidads.edit', $contabilidad->id) }}"
                                                        class="text-blue-600">Editar</a>
                                                </td>
                                                <td class="px-6 py-4">
                                                    <form
                                                        action="{{ route('contabilidads.destroy', $contabilidad->id) }}"
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
</x-app-layout> 

<script>
    document.addEventListener('DOMContentLoaded', function() {
        //configuracion de fecha
        // Obtenemos la fecha actual
        const fechaActual = new Date();
        // Formateamos la fecha en 'YYYY-MM-DD'
        const año = fechaActual.getFullYear();
        const mes = ('0' + (fechaActual.getMonth() + 1)).slice(-2); // Añadimos un cero para meses de un dígito
        const dia = ('0' + fechaActual.getDate()).slice(-2); // Añadimos un cero para días de un dígito
        // Formato final de la fecha
        const fechaFormateada = `${año}-${mes}-${dia}`;
        // Asignamos la fecha al input oculto
        document.getElementById('fecha_ingreso_doc').value = fechaFormateada;
        //configuracion de data Documents
        const dataJson = JSON.stringify({
            "datosModificados": [{
                    "id": "001",
                    "datos_bal": "INGRESOS TOTALES",
                    "fecha_bal": "2023-01-01",
                    "registro": "123",
                    "ene": 0,
                    "feb": 0,
                    "mar": 0,
                    "abr": 0,
                    "may": 0,
                    "jun": 0,
                    "jul": 0,
                    "ago": 0,
                    "sep": 0,
                    "oct": 0,
                    "nov": 0,
                    "dic": 0,
                    "total": 0,
                    "_children": [{
                            "id": "00001",
                            "datos_bal": "INGRESOS GENERALES",
                            "registro": "123",
                            "ene": "0",
                            "feb": "0",
                            "mar": "0",
                            "abr": "0",
                            "may": "0",
                            "jun": "0",
                            "jul": "0",
                            "ago": "0",
                            "sep": "0",
                            "oct": "0",
                            "nov": "0",
                            "dic": "0",
                            "total": "0"
                        },
                        {
                            "id": "00008",
                            "datos_bal": "INGRESOS DE INVERSION",
                            "registro": "123",
                            "ene": "0",
                            "feb": "0",
                            "mar": "0",
                            "abr": "0",
                            "may": "0",
                            "jun": "0",
                            "jul": "0",
                            "ago": "0",
                            "sep": "0",
                            "oct": "0",
                            "nov": "0",
                            "dic": "0",
                            "total": "0"
                        },
                        {
                            "id": "00010",
                            "datos_bal": "INGRESOS DE FINANCIAMIENTO",
                            "registro": "123",
                            "ene": 0,
                            "feb": 0,
                            "mar": 0,
                            "abr": "0",
                            "may": "0",
                            "jun": "0",
                            "jul": "0",
                            "ago": "0",
                            "sep": "0",
                            "oct": "0",
                            "nov": "0",
                            "dic": "0",
                            "total": 0
                        }
                    ]
                },
                {
                    "id": "00123231",
                    "datos_bal": "GASTOS TOTALES",
                    "fecha_bal": "2023-02-01",
                    "registro": "126",
                    "ene": 0,
                    "total": 0,
                    "feb": 0,
                    "mar": 0,
                    "abr": 0,
                    "may": 2,
                    "jun": 0,
                    "jul": 0,
                    "ago": 0,
                    "sep": 0,
                    "oct": 0,
                    "nov": 0,
                    "dic": 0,
                    "_children": [{
                            "id": "00002",
                            "datos_bal": "Gastos operativos",
                            "registro": "123",
                            "ene": 0,
                            "feb": 0,
                            "mar": 0,
                            "abr": 0,
                            "may": 0,
                            "jun": 0,
                            "jul": 0,
                            "ago": 0,
                            "sep": 0,
                            "oct": 0,
                            "nov": 0,
                            "dic": 0,
                            "total": 0
                        },
                        {
                            "id": "00005",
                            "datos_bal": "Gastos de inversion",
                            "registro": "123",
                            "ene": 0,
                            "feb": 0,
                            "mar": 0,
                            "abr": 0,
                            "may": 0,
                            "jun": 0,
                            "jul": 0,
                            "ago": 0,
                            "sep": 0,
                            "oct": 0,
                            "nov": 0,
                            "dic": 0
                        },
                        {
                            "id": "00006",
                            "datos_bal": "Gastos de financiamiento",
                            "registro": "123",
                            "ene": 0,
                            "feb": 0,
                            "mar": 0,
                            "abr": 0,
                            "may": 0,
                            "jun": 0,
                            "jul": 0,
                            "ago": 0,
                            "sep": 0,
                            "oct": 0,
                            "nov": 0,
                            "dic": 0
                        }
                    ]
                },
                {
                    "id": "subtotal",
                    "datos_bal": "SUBTOTAL",
                    "ene": 0,
                    "feb": 0,
                    "mar": 0,
                    "abr": 0,
                    "may": 0,
                    "jun": 0,
                    "jul": 0,
                    "ago": 0,
                    "sep": 0,
                    "oct": 0,
                    "nov": 0,
                    "dic": 0
                },
                {
                    "id": "total",
                    "datos_bal": "TOTAL",
                    "ene": 0,
                    "feb": 0,
                    "mar": 0,
                    "abr": 0,
                    "may": 0,
                    "jun": 0,
                    "jul": 0,
                    "ago": 0,
                    "sep": 0,
                    "oct": 0,
                    "nov": 0,
                    "dic": 0
                }
            ]
        });
        // Asignamos el JSON al valor del input oculto
        document.getElementById('documentos_cont').value = dataJson;
        const dataJsonpro = JSON.stringify({
            "datosModificadospro": [{
                    "id": "001",
                    "datos_bal": "INGRESOS TOTALES",
                    "fecha_bal": "2023-01-01",
                    "registro": "123",
                    "ene": 0,
                    "feb": 0,
                    "mar": 0,
                    "abr": 0,
                    "may": 0,
                    "jun": 0,
                    "jul": 0,
                    "ago": 0,
                    "sep": 0,
                    "oct": 0,
                    "nov": 0,
                    "dic": 0,
                    "total": 0,
                    "_children": [{
                            "id": "00001",
                            "datos_bal": "INGRESOS GENERALES",
                            "registro": "123",
                            "ene": "0",
                            "feb": "0",
                            "mar": "0",
                            "abr": "0",
                            "may": "0",
                            "jun": "0",
                            "jul": "0",
                            "ago": "0",
                            "sep": "0",
                            "oct": "0",
                            "nov": "0",
                            "dic": "0",
                            "total": "0"
                        },
                        {
                            "id": "00008",
                            "datos_bal": "INGRESOS DE INVERSION",
                            "registro": "123",
                            "ene": "0",
                            "feb": "0",
                            "mar": "0",
                            "abr": "0",
                            "may": "0",
                            "jun": "0",
                            "jul": "0",
                            "ago": "0",
                            "sep": "0",
                            "oct": "0",
                            "nov": "0",
                            "dic": "0",
                            "total": "0"
                        },
                        {
                            "id": "00010",
                            "datos_bal": "INGRESOS DE FINANCIAMIENTO",
                            "registro": "123",
                            "ene": 0,
                            "feb": 0,
                            "mar": 0,
                            "abr": "0",
                            "may": "0",
                            "jun": "0",
                            "jul": "0",
                            "ago": "0",
                            "sep": "0",
                            "oct": "0",
                            "nov": "0",
                            "dic": "0",
                            "total": 0
                        }
                    ]
                },
                {
                    "id": "00123231",
                    "datos_bal": "GASTOS TOTALES",
                    "fecha_bal": "2023-02-01",
                    "registro": "126",
                    "ene": 0,
                    "total": 0,
                    "feb": 0,
                    "mar": 0,
                    "abr": 0,
                    "may": 2,
                    "jun": 0,
                    "jul": 0,
                    "ago": 0,
                    "sep": 0,
                    "oct": 0,
                    "nov": 0,
                    "dic": 0,
                    "_children": [{
                            "id": "00002",
                            "datos_bal": "Gastos operativos",
                            "registro": "123",
                            "ene": 0,
                            "feb": 0,
                            "mar": 0,
                            "abr": 0,
                            "may": 0,
                            "jun": 0,
                            "jul": 0,
                            "ago": 0,
                            "sep": 0,
                            "oct": 0,
                            "nov": 0,
                            "dic": 0,
                            "total": 0
                        },
                        {
                            "id": "00005",
                            "datos_bal": "Gastos de inversion",
                            "registro": "123",
                            "ene": 0,
                            "feb": 0,
                            "mar": 0,
                            "abr": 0,
                            "may": 0,
                            "jun": 0,
                            "jul": 0,
                            "ago": 0,
                            "sep": 0,
                            "oct": 0,
                            "nov": 0,
                            "dic": 0
                        },
                        {
                            "id": "00006",
                            "datos_bal": "Gastos de financiamiento",
                            "registro": "123",
                            "ene": 0,
                            "feb": 0,
                            "mar": 0,
                            "abr": 0,
                            "may": 0,
                            "jun": 0,
                            "jul": 0,
                            "ago": 0,
                            "sep": 0,
                            "oct": 0,
                            "nov": 0,
                            "dic": 0
                        }
                    ]
                },
                {
                    "id": "subtotal",
                    "datos_bal": "SUBTOTAL",
                    "ene": 0,
                    "feb": 0,
                    "mar": 0,
                    "abr": 0,
                    "may": 0,
                    "jun": 0,
                    "jul": 0,
                    "ago": 0,
                    "sep": 0,
                    "oct": 0,
                    "nov": 0,
                    "dic": 0
                },
                {
                    "id": "total",
                    "datos_bal": "TOTAL",
                    "ene": 0,
                    "feb": 0,
                    "mar": 0,
                    "abr": 0,
                    "may": 0,
                    "jun": 0,
                    "jul": 0,
                    "ago": 0,
                    "sep": 0,
                    "oct": 0,
                    "nov": 0,
                    "dic": 0
                }
            ]
        });
        // Asignamos el JSON al valor del input oculto
        document.getElementById('balance_programado').value = dataJsonpro;
    });
</script>
