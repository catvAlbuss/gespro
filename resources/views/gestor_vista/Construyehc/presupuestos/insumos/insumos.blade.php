<x-app-layout>
    <link href="https://cdn.jsdelivr.net/npm/tabulator-tables@6.3.1/dist/css/tabulator.min.css" rel="stylesheet">
    <script type="text/javascript" src="https://unpkg.com/tabulator-tables@6.3.1/dist/js/tabulator.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <!-- CSS de Select2 -->
    <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />
    <!-- JS de Select2 -->
    <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>

    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Insumos') }}
        </h2>
    </x-slot>
    <div class="py-12">
        <style>
            .tabulator .tabulator-header .tabulator-col {
                font-size: 10px;
                color: black;
                font-weight: bolder;
                /* Ajusta el tamaño de letra de encabezados */
            }

            .tabulator .tabulator-row {
                font-size: 9px;
                color: black;
                font-weight: bolder;
                /* Ajusta el tamaño de letra de las filas */
            }

            .tabulator .tabulator-cell {
                padding: 8px;
                color: black;
                font-weight: bolder;
                /* Ajusta el padding interno de las celdas */
            }
        </style>
        <div
            class="bg-gradient-to-br from-gray-800 via-gray-900 to-black p-4 rounded-xl text-xs shadow-lg text-gray-200">
            <!-- Header -->
            <div class="flex justify-between items-center mb-3">
                <h3 class="text-sm font-bold text-white">🔍 Análisis de Costos Unitarios</h3>
                <div class="flex gap-2">
                    <button
                        class="guardar-detalle bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md text-white font-semibold shadow">
                        💾 Guardar
                    </button>
                    <a href="{{ route('indices') }}"
                        class="guardar-detalle bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md text-white font-semibold shadow">
                        Indice
                    </a>
                </div>
            </div>

            <!-- Información Principal -->
            <div class="grid grid-cols-2 gap-2 bg-gray-800 p-2 rounded-md shadow-inner">
                <div class="flex flex-col space-y-0.5">
                    <span class="font-semibold text-gray-400">Partida:</span>
                    <span id="items" class="font-medium text-gray-200">${rowData.item} ${rowData.descripcion}</span>
                </div>
                <div class="flex flex-col text-right space-y-0.5">
                    <span class="font-semibold text-gray-400">Costo Unitario (${rowData.detalles.unidadMD ||
                        'm'}):</span>
                    <span id="costostotales" class="font-bold text-green-400">${rowData.precio || 0}</span>
                </div>
            </div>

            <!-- Rendimiento -->
            <div class="flex justify-end items-center mt-2 space-x-1">
                <span class="text-gray-400">Rendimiento:</span>
                <input type="number" id="rendimiento"
                    class="w-16 text-center border border-gray-600 bg-gray-700 text-gray-300 rounded-md px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value="${rowData.detalles.rendimiento || 0}" />
                <select id="unidadSelect"
                    class="w-20 bg-gray-700 border border-gray-600 rounded-md px-2 py-0.5 text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="hh">hh</option>
                    <option value="kg">kg</option>
                    <option value="m">m</option>
                    <option value="m²">m²</option>
                    <option value="m³">m³</option>
                    <option value="bol">bol</option>
                    <option value="p²">p²</option>
                    <option value="p³">p³</option>
                    <option value="und">und</option>
                    <option value="lt">lt</option>
                    <option value="gal">gal</option>
                    <option value="hm">hm</option>
                    <option value="Glb">Glb</option>
                    <option value="par">Par</option>
                    <option value="rll">Rollo</option>
                    <option value="mes">Mes</option>
                </select>
                <span class="font-bold text-green-400">/ Día</span>
            </div>

            <!-- Secciones -->
            <div class="space-y-4 text-xs mt-4">
                <!-- Mano de Obra -->
                <div>
                    <div class="flex justify-between items-center">
                        <h4 class="font-semibold text-white">👷‍♂️ Mano de Obra</h4>
                        <button id="modalInsumosMO"
                            class="add-mo-row bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded-md text-white shadow">
                            ➕
                        </button>
                    </div>
                    <div id="detail-table"></div>
                </div>

                <!-- Materiales -->
                <div>
                    <div class="flex justify-between items-center">
                        <h4 class="font-semibold text-white">🛠 Materiales</h4>
                        <button id="modalInsumosMat"
                            class="add-mt-row bg-green-600 hover:bg-green-700 px-2 py-1 rounded-md text-white shadow">
                            ➕
                        </button>
                    </div>
                    <div id="detail-table-material"></div>
                </div>

                <!-- Equipos -->
                <div>
                    <div class="flex justify-between items-center">
                        <h4 class="font-semibold text-white">🚜 Equipos</h4>
                        <button id="modalInsumosEq"
                            class="add-eq-row bg-yellow-600 hover:bg-yellow-700 px-2 py-1 rounded-md text-white shadow">
                            ➕
                        </button>
                    </div>
                    <div id="detail-table-equipo"></div>
                </div>
            </div>

        </div>
        <!-- Modal Insumos-->
        <div id="insumosModal"
            class="fixed inset-0 bg-gray-800 bg-opacity-60 overflow-y-auto h-full w-full hidden z-50 transition-opacity duration-300">
            <div
                class="relative top-20 mx-auto p-2 border w-full max-w-4xl shadow-2xl rounded-xl bg-white transform transition-all duration-300 scale-95">
                <div class="mt-2">
                    <div class="-mt-4 mb-2">
                        <!-- Tabs Navigation -->
                        <div class="mb-2 border-b border-gray-200">
                            <ul class="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500"
                                id="insumosTabs" role="tablist">
                                <li class="mr-2" role="presentation">
                                    <button
                                        class="inline-block p-2 rounded-t-lg border-b-2 border-transparent hover:text-blue-600 hover:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                        id="replace-tab" data-tabs-target="#replace" type="button" role="tab"
                                        aria-controls="replace" aria-selected="true">Reemplazar por</button>
                                </li>
                                <li class="mr-2" role="presentation">
                                    <button
                                        class="inline-block p-2 rounded-t-lg border-b-2 border-transparent hover:text-blue-600 hover:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                        id="edit-replace-tab" data-tabs-target="#edit-replace" type="button"
                                        role="tab" aria-controls="edit-replace" aria-selected="false">Editar y
                                        Reemplazar</button>
                                </li>
                                <li class="mr-2" role="presentation">
                                    <button
                                        class="inline-block p-2 rounded-t-lg border-b-2 border-transparent hover:text-blue-600 hover:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                        id="compound-tab" data-tabs-target="#compound" type="button" role="tab"
                                        aria-controls="compound" aria-selected="false">Insumos Compuesto (ACU)</button>
                                </li>
                            </ul>
                        </div>
                        <!-- Tabs Content -->
                        <div id="insumosTabsContent">
                            <!-- Reemplazar Por Tab -->
                            <div class="hidden p-2 bg-gray-50 rounded-lg" id="replace" role="tabpanel"
                                aria-labelledby="replace-tab">
                                <div id="reemplace" class="overflow-x-auto border rounded-lg"></div>
                                <div class="mt-2 flex items-center">
                                    <input type="checkbox" id="reemplazar-costo" class="mr-1">
                                    <label for="reemplazar-costo" class="text-sm text-gray-700">Reemplazar
                                        costo</label>
                                </div>
                            </div>
                            <!-- Editar y Reemplazar Tab -->
                            <div class="hidden p-2 bg-gray-50 rounded-lg" id="edit-replace" role="tabpanel"
                                aria-labelledby="edit-replace-tab">
                                <h4 class="text-lg font-medium text-gray-800 mb-4">Insumos Compuestos</h4>
                                <div class="space-y-4 text-sm">
                                    <form id="insumoForm" class="space-y-4 text-sm">
                                        @csrf
                                        <input type="hidden" id="insumo_id" name="insumo_id">
                                        <input type="hidden" id="presupuesto_designado" name="presupuesto_designado" value="1">
                                        <div class="grid grid-cols-3 gap-4">
                                            <div>
                                                <label
                                                    class="block text-sm font-medium text-gray-700 mb-1">Código:</label>
                                                <input type="text" id="codigo" name="codigo"
                                                    class="border border-gray-300 rounded-md w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            </div>
                                            <div class="col-span-2">
                                                <label class="block text-sm font-medium text-gray-700 mb-1">Agregar
                                                    código eléctrico:</label>
                                                <div class="flex items-center">
                                                    <input type="checkbox" name="codelectrico_check" class="mr-2">
                                                    <input type="text" name="codelectrico"
                                                        class="border border-gray-300 rounded-md w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">Grupo
                                                genérico:</label>
                                            <select id="grupo_gen" name="grupo_gen"
                                                class="border border-gray-300 rounded-md w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                <option value="manoobra">Mano de obra (incluido leyes sociales)
                                                </option>
                                                <option value="72">72 - Unión universal galvanizada</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label
                                                class="block text-sm font-medium text-gray-700 mb-1">Proveedor:</label>
                                            <select id="proveedor" name="proveedor"
                                                class="border border-gray-300 rounded-md w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                <option value="001">S10</option>
                                                <option value="002">Otros proveedores</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label
                                                class="block text-sm font-medium text-gray-700 mb-1">Descripción:</label>
                                            <input type="text" id="descripcion" name="descripcion"
                                                class="border border-gray-300 rounded-md w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">Marca:</label>
                                            <select id="marca" name="marca"
                                                class="border border-gray-300 rounded-md w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                <option value="null">[Vacío]</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label
                                                class="block text-sm font-medium text-gray-700 mb-1">Especificaciones:</label>
                                            <textarea id="especificaciones" name="especificaciones"
                                                class="border border-gray-300 rounded-md w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                rows="2"></textarea>
                                        </div>
                                        <div class="grid grid-cols-2 gap-4">
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de
                                                    insumo:</label>
                                                <select id="tipo_insumo" name="tipo_insumo"
                                                    class="border border-gray-300 rounded-md w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                    <option value="MANO DE OBRA">MANO DE OBRA</option>
                                                    <option value="MATERIALES">MATERIALES</option>
                                                    <option value="EQUIPO">EQUIPO</option>
                                                    <option value="SUB-CONTRATOS">SUB-CONTRATOS</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label
                                                    class="block text-sm font-medium text-gray-700 mb-1">Unidad:</label>
                                                <select id="unidad_medida" name="unidad_medida"
                                                    class="border border-gray-300 rounded-md w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                    <option value="" selected>Seleccione una unidad</option>
                                                    <option value="m2">[m²] GENERAL - % apli. al total del pre...
                                                    </option>
                                                    <option value="bls">[bls] GENERAL - BALDE</option>
                                                    <option value="bol">[bol] GENERAL - BOLSA</option>
                                                    <option value="cja">[cja] GENERAL - CAJA</option>
                                                    <option value="cjt">[cjt] GENERAL - CONJUNTO</option>
                                                    <option value="cm">[cm] GENERAL - CENTIMETRO</option>
                                                    <option value="cm2">[cm²] GENERAL - CENTIMETRO CUADRADO</option>
                                                    <option value="cm3">[cm³] GENERAL - CENTIMETRO CUBICO</option>
                                                    <option value="cto">[cto] GENERAL - CONJUNTO</option>
                                                    <option value="est">[est] GLOBAL - ESTIMADO</option>
                                                    <option value="gal">[gal] GLOBAL - GALON</option>
                                                    <option value="glb">[glb] GLOBAL - GLOBAL</option>
                                                    <option value="gl">[gl] GLOBAL - GLOBAL</option>
                                                    <option value="ha">[ha] GENERAL - HECTAREA</option>
                                                    <option value="hom">[hom] GENERAL - HOMBRE - MES</option>
                                                    <option value="jgo">[jgo] GENERAL - JUEGO</option>
                                                    <option value="kg">[kg] GENERAL - KILOGRAMO</option>
                                                    <option value="kit">[kit] GENERAL - KIT</option>
                                                    <option value="km">[km] GENERAL - KILOMETRO</option>
                                                    <option value="l">[l] GENERAL - LITRO</option>
                                                    <option value="lb">[lb] GENERAL - LIBRA</option>
                                                    <option value="m">[m] GLOBAL - METRO LINEAL</option>
                                                    <option value="m2">[m²] GLOBAL - METRO CUADRADO</option>
                                                    <option value="m3">[m³] GLOBAL - METRO CUBICO</option>
                                                    <option value="mil">[mil] GENERAL - MILLAR</option>
                                                    <option value="p2">[p²] GENERAL - PIE CUADRADO</option>
                                                    <option value="par">[par] GENERAL - JUEGO</option>
                                                    <option value="plg">[plg] GENERAL - PLANCHA</option>
                                                    <option value="pin">[pin] GENERAL - PINTA</option>
                                                    <option value="ppt">[ppt] GENERAL - PUNTO</option>
                                                    <option value="pto">[pto] GENERAL - PIEZA</option>
                                                    <option value="ril">[ril] GENERAL - ROLLO</option>
                                                    <option value="sac">[sac] GENERAL - SACO</option>
                                                    <option value="sco">[sco] GENERAL - SACO</option>
                                                    <option value="tm">[tm] GENERAL - TONELADA METRICA</option>
                                                    <option value="tub">[tub] GENERAL - TUBERIA</option>
                                                    <option value="und">[und] GLOBAL - UNIDAD</option>
                                                    <option value="uni">[uni] GLOBAL - UNIDAD</option>
                                                    <option value="var">[var] GLOBAL - VARILLA</option>
                                                </select>
                                                <div class="mt-2">
                                                    <label
                                                        class="block text-sm font-medium text-gray-700 self-center">Unid.
                                                        Compra:</label>
                                                    <select id="unidad_compra" name="unidad_compra"
                                                        class="border border-gray-300 rounded-md w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                        <option value="" selected>Seleccione una unidad</option>
                                                        <option value="m2">[m²] GENERAL - % apli. al total del
                                                            pre...
                                                        </option>
                                                        <option value="bls">[bls] GENERAL - BALDE</option>
                                                        <option value="bol">[bol] GENERAL - BOLSA</option>
                                                        <option value="cja">[cja] GENERAL - CAJA</option>
                                                        <option value="cjt">[cjt] GENERAL - CONJUNTO</option>
                                                        <option value="cm">[cm] GENERAL - CENTIMETRO</option>
                                                        <option value="cm2">[cm²] GENERAL - CENTIMETRO CUADRADO
                                                        </option>
                                                        <option value="cm3">[cm³] GENERAL - CENTIMETRO CUBICO
                                                        </option>
                                                        <option value="cto">[cto] GENERAL - CONJUNTO</option>
                                                        <option value="est">[est] GLOBAL - ESTIMADO</option>
                                                        <option value="gal">[gal] GLOBAL - GALON</option>
                                                        <option value="glb">[glb] GLOBAL - GLOBAL</option>
                                                        <option value="gl">[gl] GLOBAL - GLOBAL</option>
                                                        <option value="ha">[ha] GENERAL - HECTAREA</option>
                                                        <option value="hom">[hom] GENERAL - HOMBRE - MES</option>
                                                        <option value="jgo">[jgo] GENERAL - JUEGO</option>
                                                        <option value="kg">[kg] GENERAL - KILOGRAMO</option>
                                                        <option value="kit">[kit] GENERAL - KIT</option>
                                                        <option value="km">[km] GENERAL - KILOMETRO</option>
                                                        <option value="l">[l] GENERAL - LITRO</option>
                                                        <option value="lb">[lb] GENERAL - LIBRA</option>
                                                        <option value="m">[m] GLOBAL - METRO LINEAL</option>
                                                        <option value="m2">[m²] GLOBAL - METRO CUADRADO</option>
                                                        <option value="m3">[m³] GLOBAL - METRO CUBICO</option>
                                                        <option value="mil">[mil] GENERAL - MILLAR</option>
                                                        <option value="p2">[p²] GENERAL - PIE CUADRADO</option>
                                                        <option value="par">[par] GENERAL - JUEGO</option>
                                                        <option value="plg">[plg] GENERAL - PLANCHA</option>
                                                        <option value="pin">[pin] GENERAL - PINTA</option>
                                                        <option value="ppt">[ppt] GENERAL - PUNTO</option>
                                                        <option value="pto">[pto] GENERAL - PIEZA</option>
                                                        <option value="ril">[ril] GENERAL - ROLLO</option>
                                                        <option value="sac">[sac] GENERAL - SACO</option>
                                                        <option value="sco">[sco] GENERAL - SACO</option>
                                                        <option value="tm">[tm] GENERAL - TONELADA METRICA</option>
                                                        <option value="tub">[tub] GENERAL - TUBERIA</option>
                                                        <option value="und">[und] GLOBAL - UNIDAD</option>
                                                        <option value="uni">[uni] GLOBAL - UNIDAD</option>
                                                        <option value="var">[var] GLOBAL - VARILLA</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="grid grid-cols-2 gap-4">
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-1">Precio
                                                    Unitario:</label>
                                                <input type="text" id="preciounitario" name="preciounitario"
                                                    class="border border-gray-300 rounded-md w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            </div>
                                            <div>
                                                <label
                                                    class="block text-sm font-medium text-gray-700 mb-1">Fecha:</label>
                                                <input type="date" id="fecha" name="fecha"
                                                    class="border border-gray-300 rounded-md w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            </div>
                                        </div>
                                        <div class="grid grid-cols-2 gap-4">
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-1">Ficha
                                                    Técnica:</label>
                                                <select id="ficha_tecnica" name="ficha_tecnica"
                                                    class="border border-gray-300 rounded-md w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                    <option value="">(Ninguno)</option>
                                                </select>
                                            </div>
                                            <div class="flex items-center">
                                                <input type="checkbox" value="1" id="habilitado" name="habilitado"
                                                    class="mr-2 text-sm">
                                                <label class="text-sm font-medium text-gray-700">Habilitado</label>
                                            </div>
                                        </div>
                                        <div class="mt-2 text-sm text-blue-600">
                                            <div class="flex items-center">
                                                <span class="text-blue-500 mr-2 text-sm">ℹ️</span>
                                                <span>Las modificaciones que realice también se aplicará a todos los
                                                    insumos del proyecto</span>
                                            </div>
                                        </div>
                                        <div class="mt-4">
                                            <button type="submit"
                                                class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Guardar</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                            <!-- Insumos Compuesto Tab -->
                            <div class="hidden p-2 bg-gray-50 rounded-lg" id="compound" role="tabpanel"
                                aria-labelledby="compound-tab">
                                <div id="insumoCompuesto" class="overflow-x-auto border rounded-lg"></div>
                            </div>
                        </div>
                    </div>
                    <div class="flex justify-end px-6 py-4 space-x-2">
                        <button
                            class="px-4 py-2 bg-green-600 text-white font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200">Aceptar</button>
                        <button id="closeModal"
                            class="px-4 py-2 bg-gray-600 text-white font-medium rounded-md shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200">Cerrar</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <script type="module" src="{{ asset('assets/js/insumos/insumos.js') }}"></script>
</x-app-layout>
