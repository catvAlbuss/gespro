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
                                action="{{ isset($contabilidad) ? route('contabilidad.update', $contabilidad->id) : route('contabilidad.store') }}">
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
                                    class="table-fixed min-w-full w-full text-sm text-center rtl:text-right text-gray-500 dark:text-gray-400">
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
                                                    <a href="{{ route('contabilidad.balance.show', ['id' => $contabilidad->id]) }}"
                                                        class="text-blue-600 hover:underline">
                                                        Abrir
                                                    </a>
                                                </td>
                                                <td class="px-6 py-4">
                                                    <a href="{{ route('contabilidad.edit', $contabilidad->id) }}"
                                                        class="text-blue-600">Editar</a>
                                                </td>
                                                <td class="px-6 py-4">
                                                    <form
                                                        action="{{ route('contabilidad.destroy', $contabilidad->id) }}"
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
            "ingresos": [{
                "id": 1,
                "abr": 0,
                "ago": 0,
                "dic": 0,
                "ene": 0,
                "feb": 200,
                "jul": 0,
                "jun": 0,
                "mar": 100,
                "may": 0,
                "nov": 0,
                "oct": 0,
                "sep": 0,
                "total": 300,
                "registro": "123",
                "children": [{
                        "id": 2,
                        "abr": 0,
                        "ago": 0,
                        "dic": 0,
                        "ene": 0,
                        "feb": 200,
                        "jul": 0,
                        "jun": 0,
                        "mar": 100,
                        "may": 0,
                        "nov": 0,
                        "oct": 0,
                        "sep": 0,
                        "total": 300,
                        "registro": "123",
                        "datos_bal": "INGRESOS GENERALES",
                        "children": [{
                            "id": 1761688363368,
                            "item": "01",
                            "datos_bal": "proyecto 1 ",
                            "ene": 0,
                            "feb": 200,
                            "mar": 100,
                            "abr": 0,
                            "may": 0,
                            "jun": 0,
                            "jul": 0,
                            "ago": 0,
                            "sep": 0,
                            "oct": 0,
                            "nov": 0,
                            "dic": 0,
                            "total": 300,
                            "registro": "0",
                            "children": [{
                                    "id": 1761693716657,
                                    "item": "01.01",
                                    "datos_bal": "pago 1 ",
                                    "ene": 0,
                                    "feb": "100",
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
                                    "total": 100,
                                    "registro": 0,
                                    "children": []
                                },
                                {
                                    "id": 1761693717555,
                                    "item": "01.02",
                                    "datos_bal": "pago 2 ",
                                    "ene": 0,
                                    "feb": "100",
                                    "mar": "0",
                                    "abr": 0,
                                    "may": 0,
                                    "jun": 0,
                                    "jul": 0,
                                    "ago": 0,
                                    "sep": 0,
                                    "oct": 0,
                                    "nov": 0,
                                    "dic": 0,
                                    "total": 100,
                                    "registro": 0,
                                    "children": []
                                },
                                {
                                    "id": 1761693718122,
                                    "item": "01.03",
                                    "datos_bal": "Nuevo Item",
                                    "ene": 0,
                                    "feb": 0,
                                    "mar": "100",
                                    "abr": 0,
                                    "may": 0,
                                    "jun": 0,
                                    "jul": 0,
                                    "ago": 0,
                                    "sep": 0,
                                    "oct": 0,
                                    "nov": 0,
                                    "dic": 0,
                                    "total": 100,
                                    "registro": 0,
                                    "children": []
                                }
                            ]
                        }]
                    },
                    {
                        "id": 3,
                        "abr": 0,
                        "ago": 0,
                        "dic": 0,
                        "ene": 0,
                        "feb": 0,
                        "jul": 0,
                        "jun": 0,
                        "mar": 0,
                        "may": 0,
                        "nov": 0,
                        "oct": 0,
                        "sep": 0,
                        "total": 0,
                        "registro": "123",
                        "datos_bal": "INGRESOS DE INVERSION",
                        "children": []
                    },
                    {
                        "id": 4,
                        "abr": 0,
                        "ago": 0,
                        "dic": 0,
                        "ene": "0",
                        "feb": 0,
                        "jul": 0,
                        "jun": 0,
                        "mar": 0,
                        "may": 0,
                        "nov": 0,
                        "oct": 0,
                        "sep": 0,
                        "total": 0,
                        "registro": "123",
                        "datos_bal": "INGRESOS DE FINANCIAMIENTO",
                        "children": []
                    }
                ],
                "datos_bal": "INGRESOS TOTALES"
            }],
            "gastos": [{
                "id": 5,
                "abr": 0,
                "ago": 0,
                "dic": 0,
                "ene": 0,
                "feb": 0,
                "jul": 0,
                "jun": 0,
                "mar": 0,
                "may": 0,
                "nov": 0,
                "oct": 0,
                "sep": 0,
                "total": 0,
                "registro": "F001-34",
                "children": [{
                        "id": 6,
                        "abr": 0,
                        "ago": 0,
                        "dic": 0,
                        "ene": 0,
                        "feb": 0,
                        "jul": 0,
                        "jun": 0,
                        "mar": 0,
                        "may": 0,
                        "nov": 0,
                        "oct": 0,
                        "sep": 0,
                        "total": 0,
                        "registro": "123",
                        "datos_bal": "Gastos operativos",
                        "children": [{
                                "id": 1761693803027,
                                "item": "01",
                                "datos_bal": "Nuevo Item",
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
                                "registro": 0,
                                "children": [{
                                        "id": 1761693804361,
                                        "item": "01.01",
                                        "datos_bal": "Nuevo Item",
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
                                        "registro": "0",
                                        "children": []
                                    },
                                    {
                                        "id": 1761693804977,
                                        "item": "01.02",
                                        "datos_bal": "Nuevo Item",
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
                                        "registro": 0,
                                        "children": []
                                    }
                                ]
                            },
                            {
                                "id": 1761693803505,
                                "item": "02",
                                "datos_bal": "Nuevo Item",
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
                                "registro": 0,
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": 7,
                        "abr": 0,
                        "ago": 0,
                        "dic": 0,
                        "ene": 0,
                        "feb": 0,
                        "jul": 0,
                        "jun": 0,
                        "mar": 0,
                        "may": 0,
                        "nov": 0,
                        "oct": 0,
                        "sep": 0,
                        "total": 0,
                        "registro": "123",
                        "children": [],
                        "datos_bal": "Gastos de inversion"
                    },
                    {
                        "id": 11,
                        "abr": 0,
                        "ago": 0,
                        "dic": 0,
                        "ene": 0,
                        "feb": 0,
                        "jul": 0,
                        "jun": 0,
                        "mar": 0,
                        "may": 0,
                        "nov": 0,
                        "oct": 0,
                        "sep": 0,
                        "registro": "123",
                        "datos_bal": "Gastos de financiamiento",
                        "total": 0,
                        "children": []
                    },
                    {
                        "id": 1761693653641,
                        "item": "04",
                        "datos_bal": "Nuevo Item",
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
                        "registro": 0,
                        "children": []
                    }
                ],
                "datos_bal": "GASTOS TOTALES"
            }],
            "estado": [{
                    "id": "estado-1",
                    "datos_bal": "Estado de cuenta",
                    "registro": "",
                    "total": 0,
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
                    "id": "estado-2",
                    "datos_bal": "Diferencia de balances",
                    "registro": "",
                    "total": 0,
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
            ],
            "resumen": [{
                    "id": "resumen-1",
                    "datos_bal": "Monto2023",
                    "registro": "",
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
                    "id": "resumen-2",
                    "datos_bal": "Ingresos",
                    "registro": "",
                    "ene": 0,
                    "feb": 200,
                    "mar": 100,
                    "abr": 0,
                    "may": 0,
                    "jun": 0,
                    "jul": 0,
                    "ago": 0,
                    "sep": 0,
                    "oct": 0,
                    "nov": 0,
                    "dic": 0,
                    "total": 300
                },
                {
                    "id": "resumen-3",
                    "datos_bal": "Gastos",
                    "registro": "",
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
                    "id": "resumen-4",
                    "datos_bal": "Saldo",
                    "registro": "",
                    "ene": 0,
                    "feb": 200,
                    "mar": 100,
                    "abr": 0,
                    "may": 0,
                    "jun": 0,
                    "jul": 0,
                    "ago": 0,
                    "sep": 0,
                    "oct": 0,
                    "nov": 0,
                    "dic": 0,
                    "total": 300
                },
                {
                    "id": "resumen-5",
                    "datos_bal": "Ahorro Neto",
                    "registro": "",
                    "ene": 0,
                    "feb": 200,
                    "mar": 300,
                    "abr": 300,
                    "may": 300,
                    "jun": 300,
                    "jul": 300,
                    "ago": 300,
                    "sep": 300,
                    "oct": 300,
                    "nov": 300,
                    "dic": 300,
                    "total": 300
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
