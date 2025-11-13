<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Calculadora de Pozo a Tierra y Pararrayo') }}
        </h2>
        <p class="text-gray-200">Sistema de cálculo según normas técnicas peruanas</p>
    </x-slot>

    <!-- CSS Libraries -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
        integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg=="
        crossorigin="anonymous" referrerpolicy="no-referrer" />

    <!-- JavaScript Libraries (sin Alpine.js ya que se carga en app.js) -->
    <!-- Add this script tag in the blade file after other scripts -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js"></script>

    <div id="app" data-module="programasgespro/pozopararrayo" class="max-w-full mx-auto p-4">
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
                        <!-- Add this in the results panel, before the conditional results divs -->
                        <button @click="exportClick"
                            class="bg-purple-600 text-white py-1 px-2 rounded-md hover:bg-purple-700 transition-colors font-medium">
                            📥 Exportar a Excel
                        </button>
                    </div>
                </div>

                <!-- Sección Pozo a Tierra -->
                <div v-show="activeTab === 'pozo'" class="space-y-4">
                    <h3 class="text-lg font-semibold text-gray-700 mb-4">Parámetros del Electrodo</h3>

                    <div class="grid md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Longitud de varilla (L) [m]
                            </label>
                            <input v-model.number="pozo.L" type="number" step="0.1"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>

                        <!-- Diámetro de varilla -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Diámetro de varilla (a) [m]
                            </label>

                            <select v-model="seleccion"
                                @change="personalizado = (seleccion === 'null'); actualizarVarilla()"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <template v-for="opcion in opcionesVarilla" :key="opcion.nombre">
                                    <option :value="opcion.valor">@{{ opcion.nombre }}</option>
                                </template>
                            </select>

                            <template v-if="personalizado">
                                <div class="mt-2">
                                    <input v-model.number="seleccion" @input="actualizarVarilla()" type="number"
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
                        <select v-model="pozo.tipoTerreno" @change="updateResistividad()"
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
                        <input v-model.number="pozo.resistividad" type="number" step="1"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>

                    <button @click="calcularPozoTierra()"
                        class="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium">
                        🔄 Calcular Resistencia de Puesta a Tierra
                    </button>
                </div>

                <!-- Sección Pararrayo -->
                <div v-show="activeTab === 'pararrayo'" class="space-y-4">
                    <h3 class="text-lg font-semibold text-gray-700 mb-4">Parámetros del Pararrayo</h3>

                    <div class="grid md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Isokeraunic Level (Td) [días/año]
                            </label>
                            <input v-model.number="pararrayo.td" type="number" step="1"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>

                        <!-- <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Ng (rayos/km²·año)
                            </label>
                            <input v-model.number="pararrayo.ng" type="number" step="0.1"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div> -->
                    </div>

                    <div class="grid md:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Largo (L) [m]
                            </label>
                            <input v-model.number="pararrayo.L" type="number" step="0.1"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Ancho (W) [m]
                            </label>
                            <input v-model.number="pararrayo.W" type="number" step="0.1"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Altura (H) [m]
                            </label>
                            <input v-model.number="pararrayo.H" type="number" step="0.1"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                    </div>

                    <div class="grid md:grid-cols-5 gap-4">
                        <!-- C1 -->
                        <div class="relative" @mouseenter="showTooltip.c1 = true"
                            @mouseleave="showTooltip.c1 = false">
                            <label class="block text-sm font-medium text-gray-700 mb-2 cursor-pointer">
                                Coeficiente de localización 1.
                            </label>

                            <!-- Tooltip -->
                            <transition name="fade">
                                <div v-if="showTooltip.c1"
                                    class="absolute left-full top-0 ml-2 w-96 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
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
                                                    dentro de un espacio con estructuras o árboles similares a una
                                                    distancia de 3H.</td>
                                                <td class="border border-gray-600 px-1 py-0.5">0.25</td>
                                            </tr>
                                            <tr>
                                                <td class="border border-gray-600 px-1 py-0.5">Estructura rodeada de
                                                    estructuras más pequeñas dentro de 3H.</td>
                                                <td class="border border-gray-600 px-1 py-0.5">0.5</td>
                                            </tr>
                                            <tr>
                                                <td class="border border-gray-600 px-1 py-0.5">Estructura aislada sin
                                                    estructuras dentro de 3H.</td>
                                                <td class="border border-gray-600 px-1 py-0.5">1.0</td>
                                            </tr>
                                            <tr>
                                                <td class="border border-gray-600 px-1 py-0.5">Estructura aislada en
                                                    una colina.</td>
                                                <td class="border border-gray-600 px-1 py-0.5">2.0</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <div class="text-left">
                                        Selecciona el valor según la ubicación relativa de la estructura.
                                    </div>
                                </div>
                            </transition>

                            <input v-model.number="pararrayo.c1" type="number" step="0.1"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>

                        <!-- C2 -->
                        <div class="relative" @mouseenter="showTooltip.c2 = true"
                            @mouseleave="showTooltip.c2 = false">
                            <label class="block text-sm font-medium text-gray-700 mb-2 cursor-pointer">
                                Coeficiente de localización 2.
                            </label>

                            <transition name="fade">
                                <div v-if="showTooltip.c2"
                                    class="absolute left-full top-0 ml-2 w-80 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
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
                                    <div class="text-left">Elige el valor según el tipo de estructura y techo.</div>
                                </div>
                            </transition>

                            <input v-model.number="pararrayo.c2" type="number" step="0.1"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>

                        <!-- C3 -->
                        <div class="relative" @mouseenter="showTooltip.c3 = true"
                            @mouseleave="showTooltip.c3 = false">
                            <label class="block text-sm font-medium text-gray-700 mb-2 cursor-pointer">
                                Coeficiente de localización 3.
                            </label>

                            <transition name="fade">
                                <div v-if="showTooltip.c3"
                                    class="absolute left-full top-0 ml-2 w-80 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
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
                                                <td class="border border-gray-600 px-1 py-0.5">Valor estándar no
                                                    inflamable</td>
                                                <td class="border border-gray-600 px-1 py-0.5">1.0</td>
                                            </tr>
                                            <tr>
                                                <td class="border border-gray-600 px-1 py-0.5">De alto valor,
                                                    moderadamente inflamable</td>
                                                <td class="border border-gray-600 px-1 py-0.5">2.0</td>
                                            </tr>
                                            <tr>
                                                <td class="border border-gray-600 px-1 py-0.5">Valor excepcional
                                                    inflamable o electrónico</td>
                                                <td class="border border-gray-600 px-1 py-0.5">3.0</td>
                                            </tr>
                                            <tr>
                                                <td class="border border-gray-600 px-1 py-0.5">Bienes culturales
                                                    insustituibles</td>
                                                <td class="border border-gray-600 px-1 py-0.5">4.0</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </transition>

                            <input v-model.number="pararrayo.c3" type="number" step="0.1"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>

                        <!-- C4 -->
                        <div class="relative" @mouseenter="showTooltip.c4 = true"
                            @mouseleave="showTooltip.c4 = false">
                            <label class="block text-sm font-medium text-gray-700 mb-2 cursor-pointer">
                                Coeficiente de localización 4.
                            </label>

                            <transition name="fade">
                                <div v-if="showTooltip.c4"
                                    class="absolute left-full top-0 ml-2 w-72 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
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
                                </div>
                            </transition>

                            <input v-model.number="pararrayo.c4" type="number" step="0.1"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>

                        <!-- C5 -->
                        <div class="relative" @mouseenter="showTooltip.c5 = true"
                            @mouseleave="showTooltip.c5 = false">
                            <label class="block text-sm font-medium text-gray-700 mb-2 cursor-pointer">
                                Coeficiente de localización 5.
                            </label>

                            <transition name="fade">
                                <div v-if="showTooltip.c5"
                                    class="absolute left-full top-0 ml-2 w-80 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
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
                                                <td class="border border-gray-600 px-1 py-0.5">Sin impacto ambiental
                                                </td>
                                                <td class="border border-gray-600 px-1 py-0.5">1.0</td>
                                            </tr>
                                            <tr>
                                                <td class="border border-gray-600 px-1 py-0.5">Servicio requerido, sin
                                                    impacto ambiental</td>
                                                <td class="border border-gray-600 px-1 py-0.5">5.0</td>
                                            </tr>
                                            <tr>
                                                <td class="border border-gray-600 px-1 py-0.5">Consecuencias para el
                                                    medio ambiente</td>
                                                <td class="border border-gray-600 px-1 py-0.5">10.0</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </transition>

                            <input v-model.number="pararrayo.c5" type="number" step="0.1"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
                <div v-show="activeTab === 'pozo' && resultados.pozo.calculado" class="space-y-6 mt-6">
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
                                    <div class="text-2xl font-bold text-blue-600">@{{ resultados.pozo.resistencia }} Ω</div>
                                </div>
                                <div class="bg-white p-4 rounded-lg border">
                                    <div class="text-xs text-gray-600">Estado</div>
                                    <div class="text-lg font-semibold"
                                        :class="resultados.pozo.resistencia <= 25 ? 'text-green-600' : 'text-red-600'">
                                        @{{ resultados.pozo.resistencia <= 25 ? 'CUMPLE' : 'NO CUMPLE' }}</div>
                                </div>
                            </div>
                            <div class="p-4 rounded-lg"
                                :class="resultados.pozo.resistencia <= 25 ? 'bg-green-100 text-green-800' :
                                    'bg-red-100 text-red-800'">
                                <div class="font-medium">@{{ resultados.pozo.resistencia <= 25 ? '✅ Valor aceptable' : '❌ Valor excede límite' }}</div>
                                <div class="text-sm mt-1">Límite máximo recomendado: 25 Ω</div>
                            </div>
                        </div>
                    </div>

                    <!-- Parámetros utilizados -->
                    <div class="bg-gray-50 p-6 rounded-lg">
                        <h4 class="font-semibold text-gray-800 mb-4">Parámetros utilizados:</h4>
                        <div class="grid grid-cols-2 gap-4 text-sm">
                            <div>Longitud (L): <span class="font-mono">@{{ pozo.L }} m</span></div>
                            <div>Diámetro (a): <span class="font-mono">@{{ pozo.a }} m</span></div>
                            <div>Resistividad (ρ): <span class="font-mono">@{{ pozo.resistividad }} Ω·m</span>
                            </div>
                            <div>Tipo de terreno: <span class="font-mono">@{{ pozo.tipoTerreno || 'No seleccionado' }}</span></div>
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
                                <template v-for="(dosis, index) in dosisReduccion" :key="index">
                                    <tr class="hover:bg-gray-50">
                                        <td class="border border-gray-300 px-4 py-2">
                                            @{{ dosis.rInicial.toFixed(2) }}
                                        </td>
                                        <td class="border border-gray-300 px-4 py-2 text-center">
                                            <input type="number" step="0.01" min="0" max="100"
                                                v-model.number="dosis.reduccion" @input="actualizarReducciones()"
                                                class="w-20 text-right border px-2 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        </td>
                                        <td class="border border-gray-300 px-4 py-2 text-center">
                                            @{{ dosis.rFinal.toFixed(2) }}</td>
                                        <td class="border border-gray-300 px-4 py-2 text-center">
                                            @{{ dosis.descripcion }}</td>
                                    </tr>
                                </template>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Resultados Pararrayo -->
                <div v-show="activeTab === 'pararrayo' && resultados.pararrayo.calculado" class="space-y-4">
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
                                        <div class="text-xl font-bold text-green-600">
                                            @{{ resultados.pararrayo.tdisocerauno }} isocerauno</div>
                                    </div>

                                    <!-- Nk = Ng -->
                                    <div>
                                        <div class="text-xs text-gray-500">Nk = Ng (rayos/km²-año)</div>
                                        <div class="text-xl font-bold text-green-600">
                                            @{{ resultados.pararrayo.nkng }}
                                            rayos/km²-año</div>
                                    </div>
                                </div>
                            </div>

                            <!-- 2. Área Equivalente -->
                            <div class="bg-white p-3 rounded border">
                                <div class="text-sm font-medium text-gray-700">Área Equivalente (Ae)</div>
                                <div class="text-xl font-bold text-green-600">
                                    @{{ resultados.pararrayo.areaEquivalente }} m²</div>
                                <div class="text-xs text-gray-500">Ae = L×W + 6H(L + W) + 9H²</div>
                            </div>

                            <!-- 3.COEFICIENTES DE FRECUENCIA RELÁMPAGO “Nd” -->
                            <div
                                class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                <!-- Nd -->
                                <div class="p-4 rounded-lg bg-gray-50 hover:shadow transition">
                                    <div class="text-sm font-medium text-gray-600 mb-1">Nd</div>
                                    <div class="text-1xl font-semibold text-green-600">
                                        @{{ resultados.pararrayo.Nd }}
                                    </div>
                                    <div class="text-xs text-gray-500 mt-1">Coeficiente de frecuencia del relámpago
                                    </div>
                                </div>

                                <!-- Ng -->
                                <div class="p-4 rounded-lg bg-gray-50 hover:shadow transition">
                                    <div class="text-sm font-medium text-gray-600 mb-1">Ng</div>
                                    <div class="text-1xl font-semibold text-green-600">
                                        @{{ resultados.pararrayo.Ng }}
                                    </div>
                                    <div class="text-xs text-gray-500 mt-1">Densidad de descarga atmosférica anual
                                    </div>
                                </div>

                                <!-- Ae -->
                                <div class="p-4 rounded-lg bg-gray-50 hover:shadow transition">
                                    <div class="text-sm font-medium text-gray-600 mb-1">Ae</div>
                                    <div class="text-1xl font-semibold text-green-600">
                                        @{{ resultados.pararrayo.Ae }}
                                    </div>
                                    <div class="text-xs text-gray-500 mt-1">Área equivalente de la estructura</div>
                                </div>

                                <!-- C1 -->
                                <div class="p-4 rounded-lg bg-gray-50 hover:shadow transition">
                                    <div class="text-sm font-medium text-gray-600 mb-1">C1</div>
                                    <div class="text-1xl font-semibold text-green-600">
                                        @{{ resultados.pararrayo.C1 }}
                                    </div>
                                    <div class="text-xs text-gray-500 mt-1">Coeficiente de localización</div>
                                </div>
                            </div>

                            <!-- Coeficientes -->
                            <div class="grid grid-cols-2 gap-3">
                                <div class="bg-white p-3 rounded border">
                                    <div class="text-sm font-medium text-gray-700">Nd (Impactos/año)</div>
                                    <div class="text-lg font-bold text-blue-600">@{{ resultados.pararrayo.Nd }}
                                    </div>
                                </div>
                                <div class="bg-white p-3 rounded border">
                                    <div class="text-sm font-medium text-gray-700">Nc (Tolerable)</div>
                                    <div class="text-lg font-bold text-orange-600">@{{ resultados.pararrayo.nc }}
                                    </div>
                                </div>
                            </div>

                            <!-- Evaluación -->
                            <div class="p-4 rounded-lg"
                                :class="resultados.pararrayo.requiereProteccion ? 'bg-red-100 border border-red-300' :
                                    'bg-green-100 border border-green-300'">
                                <div class="font-bold text-lg mb-2"
                                    :class="resultados.pararrayo.requiereProteccion ? 'text-red-800' : 'text-green-800'">
                                    <span>@{{ resultados.pararrayo.requiereProteccion ? '⚠️ REQUIERE PROTECCIÓN' : '✅ NO REQUIERE PROTECCIÓN' }}</span>
                                </div>

                                <div class="text-sm"
                                    :class="resultados.pararrayo.requiereProteccion ? 'text-red-700' : 'text-green-700'">
                                    <div>Condición: Nd
                                        <span>@{{ resultados.pararrayo.requiereProteccion ? '>' : '<=' }}</span> Nc
                                    </div>
                                    <div>
                                        @{{ resultados.pararrayo.Nd + (resultados.pararrayo.requiereProteccion ? ' > ' : ' <= ') + resultados.pararrayo.nc }}
                                    </div>
                                </div>

                                <div v-show="resultados.pararrayo.requiereProteccion"
                                    class="mt-3 p-3 bg-yellow-100 rounded border border-yellow-300">
                                    <div class="font-semibold text-yellow-800 mb-2">Nivel de Protección Requerido</div>
                                    <div class="text-sm text-yellow-700">
                                        <div>Eficiencia Requerida: <span
                                                class="font-mono">@{{ resultados.pararrayo.eficienciaRequerida }}</span>
                                        </div>
                                        <div>Nivel de Protección: <span
                                                class="font-mono font-bold">@{{ resultados.pararrayo.nivelProteccion }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Tabla de Radio de Protección -->
                    <div v-show="resultados.pararrayo.requiereProteccion" class="bg-gray-50 p-4 rounded-lg">
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
                <div v-show="activeTab === 'pozo'" class="mt-6 bg-gray-50 p-4 rounded-lg">
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
        <!-- Add this in the results panel, after the export select -->
        <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <!-- CONTENEDOR PRINCIPAL DEL MODAL -->
            <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <h2 class="text-2xl font-semibold mb-6 text-center text-gray-800">
                    Subir Logos y Datos del Proyecto
                </h2>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- LOGOS -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Logo 1 (Celda A1)</label>
                        <input type="file" accept="image/*" @change="logo1 = $event.target.files[0]"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Logo 2 (Celda N1)</label>
                        <input type="file" accept="image/*" @change="logo2 = $event.target.files[0]"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>

                    <!-- DATOS DEL PROYECTO -->
                    <div class="col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Nombre del Proyecto</label>
                        <textarea v-model="proyecto" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"></textarea>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">CUI</label>
                        <input type="text" v-model="cui"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Código Modular</label>
                        <input type="text" v-model="codigoModular"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Código Local</label>
                        <input type="text" v-model="codigoLocal"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Unidad Ejecutora</label>
                        <input type="text" v-model="unidadEjecutora"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>
                </div>

                <!-- BOTONES -->
                <div class="flex justify-end space-x-3 pt-6 border-t mt-6">
                    <button @click="showModal = false"
                        class="bg-gray-500 text-white py-2 px-5 rounded-md hover:bg-gray-600 transition">
                        Cancelar
                    </button>
                    <button @click="proceedExport"
                        class="bg-blue-600 text-white py-2 px-5 rounded-md hover:bg-blue-700 transition">
                        Exportar
                    </button>
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
