<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Calculadora de Pozo a Tierra y Pararrayo') }}
        </h2>
        <p class="text-gray-200">Sistema de cálculo según normas técnicas peruanas</p>
    </x-slot>

    <!-- CSS Libraries -->
    <link href="https://unpkg.com/tabulator-tables@6.3.1/dist/css/tabulator.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
        integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg=="
        crossorigin="anonymous" referrerpolicy="no-referrer" />

    <!-- JavaScript Libraries (sin Alpine.js ya que se carga en app.js) -->
    <script type="text/javascript" src="https://unpkg.com/tabulator-tables@6.3.1/dist/js/tabulator.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/echarts@5.5.0/dist/echarts.min.js"></script>

    <div x-data="pozoTierraPararrayoApp()" x-init="init()" class="max-w-full mx-auto p-4">
        <div class="grid lg:grid-cols-2 gap-6">
            <!-- Panel de Entrada de Datos -->
            <div class="bg-white rounded-lg shadow-lg p-6">
                <h2 class="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2">
                    📊 Datos de Entrada
                </h2>

                <!-- Tabs -->
                <div class="mb-6">
                    <div class="flex border-b">
                        <button @click="activeTab = 'pozo'"
                            :class="activeTab === 'pozo' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'"
                            class="px-4 py-2 font-medium">
                            ⚡ Pozo a Tierra
                        </button>
                        <button @click="activeTab = 'pararrayo'"
                            :class="activeTab === 'pararrayo' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'"
                            class="px-4 py-2 font-medium">
                            🌩️ Pararrayo
                        </button>
                    </div>
                </div>

                <!-- Sección Pozo a Tierra -->
                <div x-show="activeTab === 'pozo'" class="space-y-4">
                    <h3 class="text-lg font-semibold text-gray-700 mb-4">Parámetros del Electrodo</h3>

                    <div class="grid md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Longitud de varilla (L) [m]
                            </label>
                            <input x-model.number="pozo.L" type="number" step="0.1"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>

                        <!-- Diámetro de varilla -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Diámetro de varilla (a) [m]
                            </label>

                            <select x-model="seleccion"
                                @change="personalizado = (seleccion === 'null'); actualizarVarilla()"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <template x-for="opcion in opcionesVarilla" :key="opcion.nombre">
                                    <option :value="opcion.valor" x-text="opcion.nombre"></option>
                                </template>
                            </select>

                            <template x-if="personalizado">
                                <div class="mt-2">
                                    <input x-model.number="seleccion" @input="actualizarVarilla()" type="number"
                                        step="0.001" min="0"
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Ingresa diámetro personalizado">
                                </div>
                            </template>
                        </div>

                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Tipo de Terreno
                        </label>
                        <select x-model="pozo.tipoTerreno" @change="updateResistividad()"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Seleccionar tipo de terreno</option>
                            <option value="GW">Grava de buen grado, mezcla de grava y arena (600-1000 Ω·m)</option>
                            <option value="GP">Grava de bajo grado, mezcla de grava y arena (1000-2500 Ω·m)</option>
                            <option value="GC">Grava con arcilla, mezcla de grava y arcilla (200-400 Ω·m)</option>
                            <option value="SM">Arena con limo, mezcla de bajo grado de arena con limo (100-500 Ω·m)
                            </option>
                            <option value="SC">Arena con arcilla, mezcla de bajo grado de arena con arcilla (50-200
                                Ω·m)
                            </option>
                            <option value="ML">Arena fina con arcilla de ligera plasticidad (30-80 Ω·m)</option>
                            <option value="MH">Arena fina o terreno con limo, terrenos elásticos (80-300 Ω·m)
                            </option>
                            <option value="CL">Arcilla pobre con grava, arena, limo (25-60 Ω·m)</option>
                            <option value="CH">Arcilla inorgánica de alta plasticidad (10-55 Ω·m)</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Resistividad del terreno (ρ) [Ω·m]
                        </label>
                        <input x-model.number="pozo.resistividad" type="number" step="1"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>

                    <button @click="calcularPozoTierra()"
                        class="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium">
                        🔄 Calcular Resistencia de Puesta a Tierra
                    </button>
                </div>

                <!-- Sección Pararrayo -->
                <div x-show="activeTab === 'pararrayo'" class="space-y-4">
                    <h3 class="text-lg font-semibold text-gray-700 mb-4">Parámetros del Pararrayo</h3>

                    <div class="grid md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Isokeraunic Level (Td) [días/año]
                            </label>
                            <input x-model.number="pararrayo.td" type="number" step="1"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>

                        <!-- <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Ng (rayos/km²·año)
                            </label>
                            <input x-model.number="pararrayo.ng" type="number" step="0.1"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div> -->
                    </div>

                    <div class="grid md:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Largo (L) [m]
                            </label>
                            <input x-model.number="pararrayo.L" type="number" step="0.1"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Ancho (W) [m]
                            </label>
                            <input x-model.number="pararrayo.W" type="number" step="0.1"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Altura (H) [m]
                            </label>
                            <input x-model.number="pararrayo.H" type="number" step="0.1"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                    </div>

                    <div class="grid md:grid-cols-5 gap-4">
                        <div>
                            <div x-data="{ show: false }" class="relative">
                                <label class="block text-sm font-medium text-gray-700 mb-2 cursor-pointer"
                                    @mouseenter="show = true" @mouseleave="show = false">
                                    Coeficiente de localización 1.
                                    <span x-show="show"
                                        class="absolute left-full top-0 ml-2 w-96 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10"
                                        style="display: none;" x-transition>
                                        <div class="font-bold mb-1">Ubicación Relativa de la Estructura C1</div>
                                        <table class="w-full text-xs text-left border border-gray-600 mb-2">
                                            <thead>
                                                <tr>
                                                    <th class="border border-gray-600 px-1 py-0.5">Descripción</th>
                                                    <th class="border border-gray-600 px-1 py-0.5">C1</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td class="border border-gray-600 px-1 py-0.5">Estructura situada
                                                        dentro de un espacio que contenga estructuras o árboles de
                                                        similar o mayor altura a una distancia de 3H.</td>
                                                    <td class="border border-gray-600 px-1 py-0.5">0.25</td>
                                                </tr>
                                                <tr>
                                                    <td class="border border-gray-600 px-1 py-0.5">Estructura rodeada
                                                        de estructuras más pequeñas dentro de una distancia de 3H.</td>
                                                    <td class="border border-gray-600 px-1 py-0.5">0.5</td>
                                                </tr>
                                                <tr>
                                                    <td class="border border-gray-600 px-1 py-0.5">Estructura aislada
                                                        sin estructuras situadas dentro de una distancia de 3H.</td>
                                                    <td class="border border-gray-600 px-1 py-0.5">1.0</td>
                                                </tr>
                                                <tr>
                                                    <td class="border border-gray-600 px-1 py-0.5">Estructura aislada
                                                        de una colina</td>
                                                    <td class="border border-gray-600 px-1 py-0.5">2.0</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <div class="text-left">Selecciona el valor según la ubicación relativa de la
                                            estructura.
                                        </div>
                                    </span>
                                </label>
                                <input x-model.number="pararrayo.c1" type="number" step="0.1"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                        </div>
                        <div x-data="{ show: false }" class="relative">
                            <label class="block text-sm font-medium text-gray-700 mb-2 cursor-pointer"
                                @mouseenter="show = true" @mouseleave="show = false">
                                Coeficiente de localización 2.
                                <span x-show="show"
                                    class="absolute left-full top-0 ml-2 w-80 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10"
                                    style="display: none;" x-transition>
                                    <div class="font-bold mb-1">Coeficiente Estructural C2</div>
                                    <table class="w-full text-xs text-center border border-gray-600 mb-2">
                                        <thead>
                                            <tr>
                                                <th class="border border-gray-600 px-1 py-0.5">Estructura</th>
                                                <th class="border border-gray-600 px-1 py-0.5">Techo Metálico</th>
                                                <th class="border border-gray-600 px-1 py-0.5">Techo no Metálico</th>
                                                <th class="border border-gray-600 px-1 py-0.5">Techo Inflamable</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td class="border border-gray-600 px-1 py-0.5">Metálica</td>
                                                <td class="border border-gray-600 px-1 py-0.5">0.5</td>
                                                <td class="border border-gray-600 px-1 py-0.5">1.0</td>
                                                <td class="border border-gray-600 px-1 py-0.5">2.0</td>
                                            </tr>
                                            <tr>
                                                <td class="border border-gray-600 px-1 py-0.5">No Metálica</td>
                                                <td class="border border-gray-600 px-1 py-0.5">1.0</td>
                                                <td class="border border-gray-600 px-1 py-0.5">1.0</td>
                                                <td class="border border-gray-600 px-1 py-0.5">2.5</td>
                                            </tr>
                                            <tr>
                                                <td class="border border-gray-600 px-1 py-0.5">Inflamable</td>
                                                <td class="border border-gray-600 px-1 py-0.5">2.0</td>
                                                <td class="border border-gray-600 px-1 py-0.5">2.5</td>
                                                <td class="border border-gray-600 px-1 py-0.5">3.0</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <div class="text-left">Elige el valor según el tipo de estructura y techo. ¡Fácil
                                        para
                                        todos!</div>
                                </span>
                            </label>
                            <input x-model.number="pararrayo.c2" type="number" step="0.1"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div x-data="{ show: false }" class="relative">
                            <label class="block text-sm font-medium text-gray-700 mb-2 cursor-pointer"
                                @mouseenter="show = true" @mouseleave="show = false">
                                Coeficiente de localización 3.
                                <span x-show="show"
                                    class="absolute left-full top-0 ml-2 w-80 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10"
                                    style="display: none;" x-transition>
                                    <div class="font-bold mb-1">Contenido Estructural C3</div>
                                    <table class="w-full text-xs text-left border border-gray-600 mb-2">
                                        <thead>
                                            <tr>
                                                <th class="border border-gray-600 px-1 py-0.5">Descripción</th>
                                                <th class="border border-gray-600 px-1 py-0.5">C3</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td class="border border-gray-600 px-1 py-0.5">De bajo valor y no
                                                    inflamable</td>
                                                <td class="border border-gray-600 px-1 py-0.5">0.5</td>
                                            </tr>
                                            <tr>
                                                <td class="border border-gray-600 px-1 py-0.5">De valor estándar y no
                                                    inflamable</td>
                                                <td class="border border-gray-600 px-1 py-0.5">1.0</td>
                                            </tr>
                                            <tr>
                                                <td class="border border-gray-600 px-1 py-0.5">De alto valor, moderada
                                                    inflamable</td>
                                                <td class="border border-gray-600 px-1 py-0.5">2.0</td>
                                            </tr>
                                            <tr>
                                                <td class="border border-gray-600 px-1 py-0.5">Valor excepcional
                                                    inflamable, equipos de cómputo o electrónicos</td>
                                                <td class="border border-gray-600 px-1 py-0.5">3.0</td>
                                            </tr>
                                            <tr>
                                                <td class="border border-gray-600 px-1 py-0.5">Valor excepcional,
                                                    bienes
                                                    culturales insustituibles</td>
                                                <td class="border border-gray-600 px-1 py-0.5">4.0</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <div class="text-left">Selecciona el valor según el contenido de la estructura.
                                    </div>
                                </span>
                            </label>
                            <input x-model.number="pararrayo.c3" type="number" step="0.1"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div x-data="{ show: false }" class="relative">
                            <label class="block text-sm font-medium text-gray-700 mb-2 cursor-pointer"
                                @mouseenter="show = true" @mouseleave="show = false">
                                Coeficiente de localización 4.
                                <span x-show="show"
                                    class="absolute left-full top-0 ml-2 w-72 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10"
                                    style="display: none;" x-transition>
                                    <div class="font-bold mb-1">Ocupación Estructural C4</div>
                                    <table class="w-full text-xs text-left border border-gray-600 mb-2">
                                        <thead>
                                            <tr>
                                                <th class="border border-gray-600 px-1 py-0.5">Descripción</th>
                                                <th class="border border-gray-600 px-1 py-0.5">C4</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td class="border border-gray-600 px-1 py-0.5">Desocupado</td>
                                                <td class="border border-gray-600 px-1 py-0.5">0.5</td>
                                            </tr>
                                            <tr>
                                                <td class="border border-gray-600 px-1 py-0.5">Normalmente ocupado</td>
                                                <td class="border border-gray-600 px-1 py-0.5">1.0</td>
                                            </tr>
                                            <tr>
                                                <td class="border border-gray-600 px-1 py-0.5">Difícil de evacuar o
                                                    riesgo de pánico</td>
                                                <td class="border border-gray-600 px-1 py-0.5">3.0</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <div class="text-left">Selecciona el valor según la ocupación de la estructura.
                                    </div>
                                </span>
                            </label>
                            <input x-model.number="pararrayo.c4" type="number" step="0.1"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div x-data="{ show: false }" class="relative">
                            <label class="block text-sm font-medium text-gray-700 mb-2 cursor-pointer"
                                @mouseenter="show = true" @mouseleave="show = false">
                                Coeficiente de localización 5.
                                <span x-show="show"
                                    class="absolute left-full top-0 ml-2 w-80 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10"
                                    style="display: none;" x-transition>
                                    <div class="font-bold mb-1">Consecuencia de un rayo C5</div>
                                    <table class="w-full text-xs text-left border border-gray-600 mb-2">
                                        <thead>
                                            <tr>
                                                <th class="border border-gray-600 px-1 py-0.5">Descripción</th>
                                                <th class="border border-gray-600 px-1 py-0.5">C5</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td class="border border-gray-600 px-1 py-0.5">Continuidad o facilidad
                                                    de servicio no requerida, no hay impacto ambiental.</td>
                                                <td class="border border-gray-600 px-1 py-0.5">1.0</td>
                                            </tr>
                                            <tr>
                                                <td class="border border-gray-600 px-1 py-0.5">Continuidad o facilidad
                                                    de servicio requerida, no hay impacto ambiental.</td>
                                                <td class="border border-gray-600 px-1 py-0.5">5.0</td>
                                            </tr>
                                            <tr>
                                                <td class="border border-gray-600 px-1 py-0.5">Consecuencias para el
                                                    medio ambiente.</td>
                                                <td class="border border-gray-600 px-1 py-0.5">10.0</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <div class="text-left">Selecciona el valor según la consecuencia de un rayo en la
                                        estructura.</div>
                                </span>
                            </label>
                            <input x-model.number="pararrayo.c5" type="number" step="0.1"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                    </div>
                    <button @click="calcularPararrayo()"
                        class="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors font-medium">
                        🔄 Calcular Protección de Pararrayo
                    </button>
                </div>
            </div>

            <!-- Panel de Resultados -->
            <div class="bg-white rounded-lg shadow-lg p-6">
                <h2 class="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2">
                    📈 Resultados
                </h2>

                <!-- Resultados Pozo a Tierra -->
                <div x-show="activeTab === 'pozo' && resultados.pozo.calculado" class="space-y-6 mt-6">
                    <div class="bg-blue-50 p-6 rounded-lg">
                        <h3 class="text-xl font-semibold text-blue-800 mb-4">
                            Resistencia de Puesta a Tierra
                            <span class="text-sm font-normal block">Margen de error: ±0.05</span>
                        </h3>
                        <div class="space-y-4 text-sm">
                            <div class="flex justify-between items-center">
                                <span class="font-medium">Fórmula utilizada:</span>
                                <span class="font-mono text-xs">R = (ρ/2πL) × [Ln(4L/a) - 1]</span>
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div class="bg-white p-4 rounded-lg border">
                                    <div class="text-xs text-gray-600">Resistencia calculada</div>
                                    <div class="text-2xl font-bold text-blue-600"
                                        x-text="resultados.pozo.resistencia + ' Ω'"></div>
                                </div>
                                <div class="bg-white p-4 rounded-lg border">
                                    <div class="text-xs text-gray-600">Estado</div>
                                    <div class="text-lg font-semibold"
                                        :class="resultados.pozo.resistencia <= 25 ? 'text-green-600' : 'text-red-600'"
                                        x-text="resultados.pozo.resistencia <= 25 ? 'CUMPLE' : 'NO CUMPLE'"></div>
                                </div>
                            </div>
                            <div class="p-4 rounded-lg"
                                :class="resultados.pozo.resistencia <= 25 ? 'bg-green-100 text-green-800' :
                                    'bg-red-100 text-red-800'">
                                <div class="font-medium"
                                    x-text="resultados.pozo.resistencia <= 25 ? '✅ Valor aceptable' : '❌ Valor excede límite'">
                                </div>
                                <div class="text-sm mt-1">Límite máximo recomendado: 25 Ω</div>
                            </div>
                        </div>
                    </div>

                    <!-- Parámetros utilizados -->
                    <div class="bg-gray-50 p-6 rounded-lg">
                        <h4 class="font-semibold text-gray-800 mb-4">Parámetros utilizados:</h4>
                        <div class="grid grid-cols-2 gap-4 text-sm">
                            <div>Longitud (L): <span class="font-mono" x-text="pozo.L + ' m'"></span></div>
                            <div>Diámetro (a): <span class="font-mono" x-text="pozo.a + ' m'"></span></div>
                            <div>Resistividad (ρ): <span class="font-mono" x-text="pozo.resistividad + ' Ω·m'"></span>
                            </div>
                            <div>Tipo de terreno: <span class="font-mono"
                                    x-text="pozo.tipoTerreno || 'No seleccionado'"></span></div>
                        </div>
                    </div>

                    <!-- Consideraciones de Diseño -->
                    <div class="bg-gray-50 p-6 rounded-lg">
                        <h4 class="font-semibold text-gray-800 mb-4">Consideraciones de Diseño:</h4>
                        <table class="w-full text-sm border-collapse border border-gray-300">
                            <thead class="bg-blue-100">
                                <tr>
                                    <th class="border border-gray-300 px-4 py-2 text-left">R Inicial (Ω)</th>
                                    <th class="border border-gray-300 px-4 py-2 text-center">% Reducción</th>
                                    <th class="border border-gray-300 px-4 py-2 text-center">R Final (Ω)</th>
                                    <th class="border border-gray-300 px-4 py-2 text-center">Descripción</th>
                                </tr>
                            </thead>
                            <tbody>
                                <template x-for="(dosis, index) in dosisReduccion" :key="index">
                                    <tr class="hover:bg-gray-50">
                                        <td class="border border-gray-300 px-4 py-2"
                                            x-text="dosis.rInicial.toFixed(2)">
                                        </td>
                                        <td class="border border-gray-300 px-4 py-2 text-center">
                                            <input type="number" step="0.01" min="0" max="100"
                                                x-model.number="dosis.reduccion" @input="actualizarReducciones()"
                                                class="w-20 text-right border px-2 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        </td>
                                        <td class="border border-gray-300 px-4 py-2 text-center"
                                            x-text="dosis.rFinal.toFixed(2)"></td>
                                        <td class="border border-gray-300 px-4 py-2 text-center"
                                            x-text="dosis.descripcion"></td>
                                    </tr>
                                </template>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Resultados Pararrayo -->
                <div x-show="activeTab === 'pararrayo' && resultados.pararrayo.calculado" class="space-y-4">
                    <div class="bg-green-50 p-4 rounded-lg">
                        <h3 class="text-lg font-semibold text-green-800 mb-3">Análisis de Protección de Pararrayo</h3>

                        <div class="space-y-3">
                            <!-- 1. Frecuencia anual de caida de rayos -->
                            <div class="bg-white p-3 rounded border">
                                <div class="text-sm font-medium text-gray-700">Frecuencia anual de caida de rayos</div>
                                <div class="grid grid-cols-2 gap-4 text-left">
                                    <!-- Td isocerauno -->
                                    <div>
                                        <div class="text-xs text-gray-500">Td isocerauno</div>
                                        <div class="text-xl font-bold text-green-600"
                                            x-text="resultados.pararrayo.tdisocerauno + ' isocerauno'"></div>
                                    </div>

                                    <!-- Nk = Ng -->
                                    <div>
                                        <div class="text-xs text-gray-500">Nk = Ng (rayos/km²-año)</div>
                                        <div class="text-xl font-bold text-green-600"
                                            x-text="resultados.pararrayo.nkng + ' rayos/km²-año'"></div>
                                    </div>
                                </div>
                            </div>

                            <!-- 2. Área Equivalente -->
                            <div class="bg-white p-3 rounded border">
                                <div class="text-sm font-medium text-gray-700">Área Equivalente (Ae)</div>
                                <div class="text-xl font-bold text-green-600"
                                    x-text="resultados.pararrayo.areaEquivalente + ' m²'"></div>
                                <div class="text-xs text-gray-500">Ae = L×W + 6H(L + W) + 9H²</div>
                            </div>

                            <!-- 3.COEFICIENTES DE FRECUENCIA RELÁMPAGO “Nd” -->
                            <div
                                class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                <!-- Nd -->
                                <div class="p-4 rounded-lg bg-gray-50 hover:shadow transition">
                                    <div class="text-sm font-medium text-gray-600 mb-1">Nd</div>
                                    <div class="text-1xl font-semibold text-green-600"
                                        x-text="resultados.pararrayo.Nd + ' '"></div>
                                    <div class="text-xs text-gray-500 mt-1">Coeficiente de frecuencia del relámpago
                                    </div>
                                </div>

                                <!-- Ng -->
                                <div class="p-4 rounded-lg bg-gray-50 hover:shadow transition">
                                    <div class="text-sm font-medium text-gray-600 mb-1">Ng</div>
                                    <div class="text-1xl font-semibold text-green-600"
                                        x-text="resultados.pararrayo.Ng + ' '"></div>
                                    <div class="text-xs text-gray-500 mt-1">Densidad de descarga atmosférica anual
                                    </div>
                                </div>

                                <!-- Ae -->
                                <div class="p-4 rounded-lg bg-gray-50 hover:shadow transition">
                                    <div class="text-sm font-medium text-gray-600 mb-1">Ae</div>
                                    <div class="text-1xl font-semibold text-green-600"
                                        x-text="resultados.pararrayo.Ae + ' '"></div>
                                    <div class="text-xs text-gray-500 mt-1">Área equivalente de la estructura</div>
                                </div>

                                <!-- C1 -->
                                <div class="p-4 rounded-lg bg-gray-50 hover:shadow transition">
                                    <div class="text-sm font-medium text-gray-600 mb-1">C1</div>
                                    <div class="text-1xl font-semibold text-green-600"
                                        x-text="resultados.pararrayo.C1 + ' '"></div>
                                    <div class="text-xs text-gray-500 mt-1">Coeficiente de localización</div>
                                </div>
                            </div>

                            <!-- Coeficientes -->
                            <div class="grid grid-cols-2 gap-3">
                                <div class="bg-white p-3 rounded border">
                                    <div class="text-sm font-medium text-gray-700">Nd (Impactos/año)</div>
                                    <div class="text-lg font-bold text-blue-600" x-text="resultados.pararrayo.nd">
                                    </div>
                                </div>
                                <div class="bg-white p-3 rounded border">
                                    <div class="text-sm font-medium text-gray-700">Nc (Tolerable)</div>
                                    <div class="text-lg font-bold text-orange-600" x-text="resultados.pararrayo.nc">
                                    </div>
                                </div>
                            </div>

                            <!-- Evaluación -->
                            <div class="p-4 rounded-lg"
                                :class="resultados.pararrayo.requiereProteccion ? 'bg-red-100 border border-red-300' :
                                    'bg-green-100 border border-green-300'">
                                <div class="font-bold text-lg mb-2"
                                    :class="resultados.pararrayo.requiereProteccion ? 'text-red-800' : 'text-green-800'">
                                    <span
                                        x-text="resultados.pararrayo.requiereProteccion ? '⚠️ REQUIERE PROTECCIÓN' : '✅ NO REQUIERE PROTECCIÓN'"></span>
                                </div>

                                <div class="text-sm"
                                    :class="resultados.pararrayo.requiereProteccion ? 'text-red-700' : 'text-green-700'">
                                    <div>Condición: Nd <span
                                            x-text="resultados.pararrayo.requiereProteccion ? '>' : '<='"></span> Nc
                                    </div>
                                    <div
                                        x-text="resultados.pararrayo.nd + (resultados.pararrayo.requiereProteccion ? ' > ' : ' <= ') + resultados.pararrayo.nc">
                                    </div>
                                </div>

                                <div x-show="resultados.pararrayo.requiereProteccion"
                                    class="mt-3 p-3 bg-yellow-100 rounded border border-yellow-300">
                                    <div class="font-semibold text-yellow-800 mb-2">Nivel de Protección Requerido</div>
                                    <div class="text-sm text-yellow-700">
                                        <div>Eficiencia Requerida: <span class="font-mono"
                                                x-text="resultados.pararrayo.eficienciaRequerida"></span></div>
                                        <div>Nivel de Protección: <span class="font-mono font-bold"
                                                x-text="resultados.pararrayo.nivelProteccion"></span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Tabla de Radio de Protección -->
                    <div x-show="resultados.pararrayo.requiereProteccion" class="bg-gray-50 p-4 rounded-lg">
                        <h4 class="font-semibold text-gray-800 mb-3">Radio de Protección Recomendado</h4>
                        <div class="overflow-x-auto">
                            <table class="w-full text-sm border border-gray-300">
                                <thead class="bg-gray-200">
                                    <tr>
                                        <th class="border border-gray-300 px-2 py-1">Tipo SATELIT</th>
                                        <th class="border border-gray-300 px-2 py-1">Altura 10m</th>
                                        <th class="border border-gray-300 px-2 py-1">Altura 15m</th>
                                        <th class="border border-gray-300 px-2 py-1">Altura 20m</th>
                                        <th class="border border-gray-300 px-2 py-1">Altura 30m</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr class="bg-blue-100">
                                        <td class="border border-gray-300 px-2 py-1 font-medium">G2-1000</td>
                                        <td class="border border-gray-300 px-2 py-1 text-center">28</td>
                                        <td class="border border-gray-300 px-2 py-1 text-center">30</td>
                                        <td class="border border-gray-300 px-2 py-1 text-center">30</td>
                                        <td class="border border-gray-300 px-2 py-1 text-center">30</td>
                                    </tr>
                                    <tr>
                                        <td class="border border-gray-300 px-2 py-1 font-medium">G2-2500</td>
                                        <td class="border border-gray-300 px-2 py-1 text-center">44</td>
                                        <td class="border border-gray-300 px-2 py-1 text-center">45</td>
                                        <td class="border border-gray-300 px-2 py-1 text-center">45</td>
                                        <td class="border border-gray-300 px-2 py-1 text-center">45</td>
                                    </tr>
                                    <tr class="bg-blue-100">
                                        <td class="border border-gray-300 px-2 py-1 font-medium">G2-4500</td>
                                        <td class="border border-gray-300 px-2 py-1 text-center">64</td>
                                        <td class="border border-gray-300 px-2 py-1 text-center">65</td>
                                        <td class="border border-gray-300 px-2 py-1 text-center">65</td>
                                        <td class="border border-gray-300 px-2 py-1 text-center">65</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="text-xs text-gray-600 mt-2">
                            * Valores en metros. Fuente: Norma UNE 21186-96 basada en la NFC-17-102/2011
                        </div>
                    </div>
                </div>

                <!-- Información del suelo -->
                <div x-show="activeTab === 'pozo'" class="mt-6 bg-gray-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-gray-800 mb-3">Clasificación de Suelos (SPT)</h4>
                    <div class="text-sm space-y-2">
                        <div class="font-medium">Propiedades típicas según clasificación SUCS:</div>
                        <div class="bg-white p-3 rounded border">
                            <div class="font-medium text-blue-700">SPT-01, SPT-02, SPT-03: Clasificación SUCS CL</div>
                            <div>• Cohesión: C = 0.36-0.39 kg/cm²</div>
                            <div>• Ángulo de fricción: Ø = 0°</div>
                            <div>• Tipo: Arcilla inorgánica de baja plasticidad</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Tabla de Resistividades -->
        <div class="mt-6 bg-white rounded-lg shadow-lg p-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">📋 Tabla de Resistividades Medias de Terrenos Típicos
            </h2>
            <div class="overflow-x-auto">
                <table class="w-full text-sm border-collapse border border-gray-300">
                    <thead class="bg-blue-100">
                        <tr>
                            <th class="border border-gray-300 px-4 py-2 text-left">Terreno</th>
                            <th class="border border-gray-300 px-4 py-2 text-center">Símbolo</th>
                            <th class="border border-gray-300 px-4 py-2 text-center">Resistividad Media (Ω·m)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="hover:bg-gray-50">
                            <td class="border border-gray-300 px-4 py-2">Grava de buen grado, mezcla de grava y arena
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-center font-mono">GW</td>
                            <td class="border border-gray-300 px-4 py-2 text-center">600 – 1000</td>
                        </tr>
                        <tr class="hover:bg-gray-50">
                            <td class="border border-gray-300 px-4 py-2">Grava de bajo grado, mezcla de grava y arena
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-center font-mono">GP</td>
                            <td class="border border-gray-300 px-4 py-2 text-center">1000 – 2500</td>
                        </tr>
                        <tr class="hover:bg-gray-50">
                            <td class="border border-gray-300 px-4 py-2">Grava con arcilla, mezcla de grava y arcilla
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-center font-mono">GC</td>
                            <td class="border border-gray-300 px-4 py-2 text-center">200 – 400</td>
                        </tr>
                        <tr class="hover:bg-gray-50">
                            <td class="border border-gray-300 px-4 py-2">Arena con limo, mezcla de bajo grado de arena
                                con limo</td>
                            <td class="border border-gray-300 px-4 py-2 text-center font-mono">SM</td>
                            <td class="border border-gray-300 px-4 py-2 text-center">100 – 500</td>
                        </tr>
                        <tr class="hover:bg-gray-50">
                            <td class="border border-gray-300 px-4 py-2">Arena con arcilla, mezcla de bajo grado de
                                arena con arcilla</td>
                            <td class="border border-gray-300 px-4 py-2 text-center font-mono">SC</td>
                            <td class="border border-gray-300 px-4 py-2 text-center">50 – 200</td>
                        </tr>
                        <tr class="hover:bg-gray-50">
                            <td class="border border-gray-300 px-4 py-2">Arena fina con arcilla de ligera plasticidad
                            </td>
                            <td class="border border-gray-300 px-4 py-2 text-center font-mono">ML</td>
                            <td class="border border-gray-300 px-4 py-2 text-center">30 – 80</td>
                        </tr>
                        <tr class="hover:bg-gray-50">
                            <td class="border border-gray-300 px-4 py-2">Arena fina o terreno con limo, terrenos
                                elásticos</td>
                            <td class="border border-gray-300 px-4 py-2 text-center font-mono">MH</td>
                            <td class="border border-gray-300 px-4 py-2 text-center">80 – 300</td>
                        </tr>
                        <tr class="hover:bg-gray-50">
                            <td class="border border-gray-300 px-4 py-2">Arcilla pobre con grava, arena, limo</td>
                            <td class="border border-gray-300 px-4 py-2 text-center font-mono">CL</td>
                            <td class="border border-gray-300 px-4 py-2 text-center">25 – 60</td>
                        </tr>
                        <tr class="hover:bg-gray-50">
                            <td class="border border-gray-300 px-4 py-2">Arcilla inorgánica de alta plasticidad</td>
                            <td class="border border-gray-300 px-4 py-2 text-center font-mono">CH</td>
                            <td class="border border-gray-300 px-4 py-2 text-center">10 – 55</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="mt-4 text-sm text-gray-600">
                <strong>Nota:</strong> Estas resistividades clasificadas según el terreno están fuertemente
                influenciadas por la presencia de humedad.
            </div>
        </div>
    </div>

</x-app-layout>
