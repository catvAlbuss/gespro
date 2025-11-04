import { createApp } from 'vue';
import longEquival from "./longitud-components.js";

export function initBombeoTanqueModule() {
    const bombeotanque = document.getElementById('bombeo-tanque-elevado-content');
    if (!bombeotanque) {
        console.error('Contenedor Red de Alimentacion no encontrado');
        return;
    }

    const BombeoTanqueComponent = {
        template: `
          <div class="max-w-full mx-auto p-4">
                <!-- Header Principal -->
                <header class="bg-white/80 backdrop-blur-lg border-b border-slate-200/60 shadow-lg sticky top-12 z-50">
                    <div class="max-w-7xl mx-auto px-6 py-4">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-4">
                                <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg">
                                    <i class="fas fa-water text-white text-lg"></i>
                                </div>
                                <div>
                                    <h1 class="text-2xl font-bold text-slate-800">5. CALCULO DEL SISTEMA DE BOMBEO AL TANQUE ELEVADO</h1>
                                    <p class="text-sm text-slate-600">Cálculo de consumo de agua</p>
                                </div>
                            </div>
                            
                            <div class="flex items-center space-x-3">
                                <div class="flex items-center space-x-2">
                                    <span class="text-sm text-slate-600">Modo:</span>
                                    <button @click="toggleMode()" 
                                            class="px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200"
                                            :class="mode === 'edit' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'">
                                        <i class="fas" :class="mode === 'edit' ? 'fa-edit' : 'fa-eye'"></i>
                                        <span v-text="mode === 'edit' ? 'Edición' : 'Vista'"></span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>
                
                <main class="max-w-full mx-auto px-2 py-4 space-y-6">
                    <!-- 5.1. CAUDAL DE IMPULSION -->
                    <div class="bg-white rounded-lg shadow-md border border-gray-200">
                        <div class="bg-gray-100 px-4 py-3 border-b">
                            <h2 class="text-lg font-semibold text-gray-800">5.1. CAUDAL DE IMPULSION</h2>
                            <p class="text-sm text-slate-600">En el inciso d) del ITEM 2.5. ELEVACION, el caudal de bombeo debe ser equivalente a la máxima demanda simultánea y en ningún caso inferior a la necesaria para llenar el </p>
                        </div>
                        <div class="p-6">
                            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 p-4 bg-white rounded-xl shadow">
                                <!-- Volumen Cisterna -->
                                <div class="space-y-1">
                                    <label class="block text-xs font-semibold text-gray-600 tracking-wide">VOLUMEN DE LA CISTERNA</label>
                                    <div class="flex items-center">
                                        <input type="number" :value="volumenTE.toFixed(2)" step="0.001" disabled
                                            class="w-full px-3 py-2 bg-yellow-100 border-2 border-yellow-300 text-gray-700 font-semibold rounded-l-md focus:outline-none">
                                        <span class="px-3 py-2 bg-gray-200 text-sm text-gray-700 rounded-r-md border-t border-b border-r border-gray-300">L</span>
                                    </div>
                                </div>

                                <!-- Tiempo Llenado -->
                                <div class="space-y-1">
                                    <label class="block text-xs font-semibold text-gray-600 tracking-wide">TIEMPO DE LLENADO</label>
                                    <div class="flex items-center">
                                        <input type="number" v-model.number="tiempoLlenadobomb" step="0.1"
                                            @input="updateCalculations"
                                            class="w-full px-3 py-2 bg-yellow-100 border-2 border-yellow-300 text-gray-700 font-semibold rounded-l-md focus:outline-none">
                                        <span class="px-3 py-2 bg-gray-200 text-sm text-gray-700 rounded-r-md border-t border-b border-r border-gray-300">hrs</span>
                                    </div>
                                </div>

                                <!-- Q Llenado -->
                                <div class="space-y-1">
                                    <label class="block text-xs font-semibold text-gray-600 tracking-wide">CAUDAL DE LLENADO</label>
                                    <div class="flex items-center">
                                        <input type="text" :value="qLlenado" readonly
                                            class="w-full px-3 py-2 bg-gray-50 border border-gray-300 text-gray-900 font-bold rounded-l-md">
                                        <span class="px-3 py-2 bg-gray-200 text-sm text-gray-700 rounded-r-md border-t border-b border-r border-gray-300">L/s</span>
                                    </div>
                                </div>

                                <!-- Q MDS -->
                                <div class="space-y-1">
                                    <label class="block text-xs font-semibold text-gray-600 tracking-wide">Q MDS</label>
                                    <div class="flex items-center">
                                        <input type="text" :value="QMDS" readonly
                                            class="w-full px-3 py-2 bg-gray-50 border border-gray-300 text-gray-900 font-bold rounded-l-md">
                                        <span class="px-3 py-2 bg-gray-200 text-sm text-gray-700 rounded-r-md border-t border-b border-r border-gray-300">L/s</span>
                                    </div>
                                </div>

                                <!-- Q Impulsión -->
                                <div class="space-y-1">
                                    <label class="block text-xs font-semibold text-gray-600 tracking-wide">Q IMPULSIÓN</label>
                                    <div class="flex items-center">
                                        <input type="text" :value="Qimpul" readonly
                                            class="w-full px-3 py-2 bg-gray-50 border border-gray-300 text-gray-900 font-bold rounded-l-md">
                                        <span class="px-3 py-2 bg-gray-200 text-sm text-gray-700 rounded-r-md border-t border-b border-r border-gray-300">L/s</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    <!-- 5.2. PERDIDA DE CARGA -->
                    <div class="bg-white rounded-lg shadow-md border border-gray-200">
                        <div class="bg-gray-100 px-4 py-3 border-b">
                            <h2 class="text-lg font-semibold text-gray-800">5.2. PERDIDA DE CARGA</h2>
                        </div>
                        <div class="p-6 space-y-8">

                            <!-- 5.2.1. PERDIDA DE CARGA SUCCIÓN -->
                            <div class="space-y-6">
                                <h3 class="text-lg font-semibold text-gray-800">5.2.1. PERDIDA DE CARGA SUCCIÓN</h3>

                                <!-- Controles de configuración -->
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div class="space-y-2">
                                        <label class="block text-sm font-semibold text-gray-700">Diámetro tub. Succión (Ø) - Calculado Automáticamente</label>
                                        <div class="w-full px-4 py-2 bg-blue-100 border border-blue-300 rounded-lg text-gray-700 font-semibold flex items-center justify-between">
                                            <span v-text="diametroSuccion"></span>
                                            <span class="text-xs text-blue-600">Auto</span>
                                        </div>
                                        <!-- Select oculto para mantener funcionalidad si es necesario -->
                                        <select v-model="diametroSuccion" 
                                                style="display: none;" 
                                                disabled>
                                            <template v-for="(val, key) in config.diametros" :key="key">
                                                <option :value="key" v-text="key"></option>
                                            </template>
                                        </select>
                                    </div>
                                    <div class="space-y-2">
                                        <label class="block text-sm font-semibold text-gray-700">Longitud de la Tubería (m)</label>
                                        <div class="flex items-center gap-2">
                                            <input type="number" v-model.number="longitudTuberiaSuccion"
                                                @input="actualizarSuccion" step="0.01" min="0"
                                                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 transition">
                                            <span class="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">m</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Tabla de Succión -->
                                <div class="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                                    <table class="min-w-full divide-y divide-gray-200">
                                        <thead class="bg-blue-600 to-indigo-600 text-white text-sm font-semibold">
                                            <tr>
                                                <th rowspan="2" class="px-6 py-3 text-center">q (L/s)</th>
                                                <th rowspan="2" class="px-6 py-3 text-center">Diámetro</th>
                                                <th rowspan="2" class="px-6 py-3 text-center">V (m/s)</th>
                                                <th colspan="4" class="px-6 py-3 text-center">L accesorios</th>
                                                <th rowspan="2" class="px-6 py-3 text-center">L tubería (m)</th>
                                                <th rowspan="2" class="px-6 py-3 text-center">L total (m)</th>
                                                <th rowspan="2" class="px-6 py-3 text-center">S (m/m)</th>
                                                <th rowspan="2" class="px-6 py-3 text-center">hf (m)</th>
                                            </tr>
                                            <tr class="bg-gradient-to-r from-blue-700 to-indigo-700">
                                                <th class="px-6 py-3 text-center">Accesorio</th>
                                                <th class="px-6 py-3 text-center">#</th>
                                                <th class="px-6 py-3 text-center">Leq</th>
                                                <th class="px-6 py-3 text-center">Leq.T</th>
                                            </tr>
                                        </thead>
                                        <tbody class="bg-white divide-y divide-gray-100 text-sm text-gray-800">
                                            <template v-for="(accesorio, idx) in accesoriosSuccion" :key="idx">
                                                <tr class="hover:bg-gray-50 transition-all duration-200">
                                                    <template v-if="idx === 0">
                                                        <td :rowspan="accesoriosSuccion.length"
                                                            class="px-6 py-3 align-top font-semibold text-blue-600 text-center"
                                                            v-text="Qimpul + ' L/s'"></td>
                                                    </template>
                                                    <template v-if="idx === 0">
                                                        <td :rowspan="accesoriosSuccion.length"
                                                            class="px-6 py-3 align-top font-semibold text-center"
                                                            v-text="diametroSuccion"></td>
                                                    </template>
                                                    <template v-if="idx === 0">
                                                        <td :rowspan="accesoriosSuccion.length"
                                                            class="px-6 py-3 align-top font-semibold text-green-600 text-center"
                                                            v-text="velocidadSuccion + ' m/s'"></td>
                                                    </template>
                                                    <td class="px-6 py-3">
                                                        <select v-model="accesorio.tipo"
                                                                @change="actualizarLeqAccesorioSuccion(idx)"
                                                                class="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200">
                                                            <option value="">Seleccione</option>
                                                            <template v-for="item in config.accesoriosDisponibles" :key="item.key">
                                                                <option :value="item.key" v-text="item.label"></option>
                                                            </template>
                                                        </select>
                                                    </td>
                                                    <td class="px-6 py-3">
                                                        <input type="number" min="0" step="1" v-model.number="accesorio.cantidad"
                                                               @input="actualizarSuccion"
                                                               class="w-20 px-3 py-2 border border-gray-200 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200">
                                                    </td>
                                                    <td class="px-6 py-3 text-center" v-text="accesorio.leq.toFixed(3)"></td>
                                                    <td class="px-6 py-3 text-center font-semibold"
                                                        v-text="(accesorio.cantidad * accesorio.leq).toFixed(3)"></td>
                                                    <template v-if="idx === 0">
                                                        <td :rowspan="accesoriosSuccion.length"
                                                            class="px-6 py-3 align-top font-semibold text-center"
                                                            v-text="longitudTuberiaSuccion + ' m'"></td>
                                                    </template>
                                                    <template v-if="idx === 0">
                                                        <td :rowspan="accesoriosSuccion.length"
                                                            class="px-6 py-3 align-top font-semibold text-purple-600 text-center"
                                                            v-text="longitudTotalSuccion + ' m'"></td>
                                                    </template>
                                                    <template v-if="idx === 0">
                                                        <td :rowspan="accesoriosSuccion.length"
                                                            class="px-6 py-3 align-top font-mono text-xs text-center"
                                                            v-text="pendienteHidraulicaSuccion"></td>
                                                    </template>
                                                    <template v-if="idx === 0">
                                                        <td :rowspan="accesoriosSuccion.length"
                                                            class="px-6 py-3 align-top font-bold text-red-600 text-center"
                                                            v-text="perdidaPorFriccionSuccion + ' m'"></td>
                                                    </template>
                                                </tr>
                                            </template>
                                        </tbody>
                                        <tfoot>
                                            <tr class="bg-gray-50 text-sm font-semibold">
                                                <td colspan="6" class="px-6 py-3 text-right">LONGITUD TOTAL EQUIVALENTE (m):</td>
                                                <td class="px-6 py-3 font-bold text-blue-600 text-center"
                                                    v-text="leqTotalSuccion.toFixed(3)"></td>
                                                <td colspan="4"></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            <!-- 5.2.2. PERDIDA DE CARGA IMPULSIÓN -->
                            <div class="space-y-6">
                                <h3 class="text-lg font-semibold text-gray-800">5.2.2. PERDIDA DE CARGA IMPULSIÓN</h3>

                                <!-- Controles de configuración -->
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div class="space-y-2">
                                        <label class="block text-sm font-semibold text-gray-700">Diámetro tub. Impulsión (Ø) - Calculado Automáticamente</label>
                                        <div class="w-full px-4 py-2 bg-green-100 border border-green-300 rounded-lg text-gray-700 font-semibold flex items-center justify-between">
                                            <span v-text="diametroImpulsion"></span>
                                            <span class="text-xs text-green-600">Auto</span>
                                        </div>
                                        <!-- Select oculto para mantener funcionalidad si es necesario -->
                                        <select v-model="diametroImpulsion" 
                                                style="display: none;" 
                                                disabled>
                                            <template v-for="(val, key) in config.diametros" :key="key">
                                                <option :value="key" v-text="key"></option>
                                            </template>
                                        </select>
                                    </div>
                                    <div class="space-y-2">
                                        <label class="block text-sm font-semibold text-gray-700">Longitud de la Tubería (m)</label>
                                        <div class="flex items-center gap-2">
                                            <input type="number" v-model.number="longitudTuberiaImpulsion"
                                                @input="actualizarImpulsion" step="0.01" min="0"
                                                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700 transition">
                                            <span class="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">m</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Tabla de Impulsión -->
                                <div class="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                                    <table class="min-w-full divide-y divide-gray-200">
                                        <thead class="bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-semibold">
                                            <tr>
                                                <th rowspan="2" class="px-6 py-3 text-center">q (L/s)</th>
                                                <th rowspan="2" class="px-6 py-3 text-center">Diámetro</th>
                                                <th rowspan="2" class="px-6 py-3 text-center">V (m/s)</th>
                                                <th colspan="4" class="px-6 py-3 text-center">L accesorios</th>
                                                <th rowspan="2" class="px-6 py-3 text-center">L tubería (m)</th>
                                                <th rowspan="2" class="px-6 py-3 text-center">L total (m)</th>
                                                <th rowspan="2" class="px-6 py-3 text-center">S (m/m)</th>
                                                <th rowspan="2" class="px-6 py-3 text-center">hf (m)</th>
                                            </tr>
                                            <tr class="bg-gradient-to-r from-green-700 to-emerald-700">
                                                <th class="px-6 py-3 text-center">Accesorio</th>
                                                <th class="px-6 py-3 text-center">#</th>
                                                <th class="px-6 py-3 text-center">Leq</th>
                                                <th class="px-6 py-3 text-center">Leq.T</th>
                                            </tr>
                                        </thead>
                                        <tbody class="bg-white divide-y divide-gray-100 text-sm text-gray-800">
                                            <template v-for="(accesorio, idx) in accesoriosImpulsion" :key="idx">
                                                <tr class="hover:bg-gray-50 transition-all duration-200">
                                                    <template v-if="idx === 0">
                                                        <td :rowspan="accesoriosImpulsion.length"
                                                            class="px-6 py-3 align-top font-semibold text-green-600 text-center"
                                                            v-text="Qimpul + ' L/s'"></td>
                                                    </template>
                                                    <template v-if="idx === 0">
                                                        <td :rowspan="accesoriosImpulsion.length"
                                                            class="px-6 py-3 align-top font-semibold text-center"
                                                            v-text="diametroImpulsion"></td>
                                                    </template>
                                                    <template v-if="idx === 0">
                                                        <td :rowspan="accesoriosImpulsion.length"
                                                            class="px-6 py-3 align-top font-semibold text-green-600 text-center"
                                                            v-text="velocidadImpulsion + ' m/s'"></td>
                                                    </template>
                                                    <td class="px-6 py-3">
                                                        <select v-model="accesorio.tipo"
                                                                @change="actualizarLeqAccesorioImpulsion(idx)"
                                                                class="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200">
                                                            <option value="">Seleccione</option>
                                                            <template v-for="item in config.accesoriosDisponibles" :key="item.key">
                                                                <option :value="item.key" v-text="item.label"></option>
                                                            </template>
                                                        </select>
                                                    </td>
                                                    <td class="px-6 py-3">
                                                        <input type="number" min="0" step="1" v-model.number="accesorio.cantidad"
                                                               @input="actualizarImpulsion"
                                                               class="w-20 px-3 py-2 border border-gray-200 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200">
                                                    </td>
                                                    <td class="px-6 py-3 text-center" v-text="accesorio.leq.toFixed(3)"></td>
                                                    <td class="px-6 py-3 text-center font-semibold"
                                                        v-text="(accesorio.cantidad * accesorio.leq).toFixed(3)"></td>
                                                    <template v-if="idx === 0">
                                                        <td :rowspan="accesoriosImpulsion.length"
                                                            class="px-6 py-3 align-top font-semibold text-center"
                                                            v-text="longitudTuberiaImpulsion + ' m'"></td>
                                                    </template>
                                                    <template v-if="idx === 0">
                                                        <td :rowspan="accesoriosImpulsion.length"
                                                            class="px-6 py-3 align-top font-semibold text-purple-600 text-center"
                                                            v-text="longitudTotalImpulsion + ' m'"></td>
                                                    </template>
                                                    <template v-if="idx === 0">
                                                        <td :rowspan="accesoriosImpulsion.length"
                                                            class="px-6 py-3 align-top font-mono text-xs text-center"
                                                            v-text="pendienteHidraulicaImpulsion"></td>
                                                    </template>
                                                    <template v-if="idx === 0">
                                                        <td :rowspan="accesoriosImpulsion.length"
                                                            class="px-6 py-3 align-top font-bold text-red-600 text-center"
                                                            v-text="perdidaPorFriccionImpulsion + ' m'"></td>
                                                    </template>
                                                </tr>
                                            </template>
                                        </tbody>
                                        <tfoot>
                                            <tr class="bg-gray-50 text-sm font-semibold">
                                                <td colspan="6" class="px-6 py-3 text-right">LONGITUD TOTAL EQUIVALENTE (m):</td>
                                                <td class="px-6 py-3 font-bold text-green-600 text-center"
                                                    v-text="leqTotalImpulsion.toFixed(3)"></td>
                                                <td colspan="4"></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 5.3. ALTURA DINAMICA TOTAL - HDT -->
                    <div class="bg-white rounded-lg shadow-md border border-gray-200">
                        <div class="bg-gray-100 px-4 py-3 border-b">
                            <h2 class="text-lg font-semibold text-gray-800">5.3. ALTURA DINAMICA TOTAL - HDT</h2>
                        </div>
                        <div class="p-6 space-y-2 text-sm text-gray-800">
                            <div class="flex justify-between">
                                <span>Nivel de Fondo del Tanque Elevado =</span>
                                <span v-text="nivelFondoTanque.toFixed(2) + ' m'"></span>
                            </div>
                            <div class="flex justify-between">
                                <span>Nivel de Agua del Tanque Elevado =</span>
                                <span v-text="nivelAguaTanque.toFixed(2) + ' m'"></span>
                            </div>
                            <div class="flex justify-between">
                                <span>Nivel de Fondo de Cisterna =</span>
                                <span v-text="nivelFondoCisterna.toFixed(2) + ' m'"></span>
                            </div>
                            <div class="flex justify-between">
                                <span>Presión de Salida =</span>
                                <div class="space-y-2">
                                    <div class="flex items-center gap-2">
                                        <input type="number" v-model.number="presionSalida"
                                            @input="actualizarHdt" step="0.01" min="0"
                                            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700 transition">
                                        <span class="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">m</span>
                                    </div>
                                </div>
                            </div>
                            <div class="flex justify-between">
                                <span>Pérdida de carga Tub. Succión =</span>
                                <span v-text="perdidaPorFriccionSuccion.toFixed(2) + ' m'"></span>
                            </div>
                            <div class="flex justify-between">
                                <span>Pérdida de carga Tub. Impulsión =</span>
                                <span v-text="perdidaPorFriccionImpulsion.toFixed(2) + ' m'"></span>
                            </div>

                            <div class="flex justify-center pt-6">
                                <div class="bg-yellow-100 border border-gray-400 px-6 py-2 rounded text-center">
                                    <span class="font-semibold">HDT =</span>
                                    <span class="text-lg font-bold" v-text="hdt.toFixed(2)"></span>
                                </div>
                            </div>
                        </div>
                    </div>


                    <!-- 5.4. CALCULO DEL SISTEMA DE BOMBEO -->
                    <div class="bg-white rounded-lg shadow-md border border-gray-200">
                        <div class="bg-gray-100 px-4 py-3 border-b">
                            <h2 class="text-lg font-semibold text-gray-800">5.4. CÁLCULO DEL SISTEMA DE BOMBEO</h2>
                        </div>
                        <div class="p-6 space-y-4 text-sm text-gray-800">

                            <!-- Caudal de Impulsión -->
                            <div class="flex justify-between">
                                <span>Caudal de Impulsión =</span>
                                <span v-text="Qimpul + ' L/s'"></span>
                            </div>

                            <!-- Altura Dinámica Total -->
                            <div class="flex justify-between">
                                <span>Altura Dinámica Total =</span>
                                <span v-text="hdt.toFixed(2) + ' m'"></span>
                            </div>

                            <!-- Eficiencia -->
                            <div class="flex justify-between">
                                <span>Eficiencia =</span>
                                <div class="flex items-center gap-2">
                                    <input type="number" v-model.number="eficiencia" step="0.01" min="0" max="1"
                                        class="w-24 px-4 py-2 border border-yellow-400 bg-yellow-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500">
                                    <span class="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">%</span>
                                </div>
                            </div>

                            <!-- Fórmula -->
                            <div class="border-t pt-4 text-center">
                                <p class="text-xs text-gray-500 italic">
                                    POTENCIA = (Caudal L/s × Altura m) / (75 × Eficiencia)
                                </p>
                                <div class="mt-2 font-bold text-lg">
                                    POTENCIA (POT) =
                                    <span v-text="potencia.toFixed(2)"></span>
                                    <span class="mx-2">→</span>
                                    <!-- INPUT EDITABLE -->
                                    <div class="inline-flex items-center bg-yellow-100 px-3 py-1 border border-gray-400 rounded">
                                        <input
                                            type="number"
                                            step="0.01"
                                            class="bg-yellow-100 w-16 text-right focus:outline-none"
                                            v-model.number="potenciaManual"
                                            :placeholder="potenciaEstimada.toFixed(2)"
                                        />
                                        <span class="ml-1">HP</span>
                                    </div>
                                </div>
                            </div>

                            <!-- NOTA ACTUALIZADA CON potenciaEstimada -->
                            <div class="mt-4 text-sm text-gray-600 border-l-4 border-green-400 pl-4">
                                De acuerdo a la existencia en el mercado con los diámetros más similares a la de succión e impulsión requeridos,
                                se asume la potencia es de
                                <strong><span v-text="potenciaEstimada.toFixed(0) + ' HP'"></span></strong>.
                            </div>

                        </div>
                    </div>

                </main>
            </div>
        `,
        data() {
            return {
                mode: 'view',
                config: {
                    diametros: {
                        '1/2 pulg': { mm: 0.5, area: 0.000177, pulg: '1/2' },
                        '3/4 pulg': { mm: 0.75, area: 0.000314, pulg: '3/4' },
                        '1 pulg': { mm: 1, area: 0.000491, pulg: '1' },
                        '1 1/4 pulg': { mm: 1.25, area: 0.000804, pulg: '1 1/4' },
                        '1 1/2 pulg': { mm: 1.5, area: 0.001257, pulg: '1 1/2' },
                        '2 pulg': { mm: 2, area: 0.001963, pulg: '2' },
                        '2 1/2 pulg': { mm: 2.5, area: 0.001963, pulg: '2 1/2' },
                        '3 pulg': { mm: 3, area: 0.001963, pulg: '3' },
                        '4 pulg': { mm: 4, area: 0.001963, pulg: '4' },
                        '6 pulg': { mm: 6, area: 0.001963, pulg: '6' },
                        '8 pulg': { mm: 8, area: 0.001963, pulg: '8' },
                    },
                    accesoriosDisponibles: [
                        { label: 'Codo de 45°', key: 'codo45' },
                        { label: 'Codo de 90°', key: 'codo90' },
                        { label: 'Tee', key: 'tee' },
                        { label: 'Válvula Compuerta', key: 'valCompuerta' },
                        { label: 'Válvula Check', key: 'valCheck' },
                        { label: 'Canastilla', key: 'canastilla' },
                        { label: 'Reducción 1', key: 'reduccion1' },
                        { label: 'Reducción 2', key: 'reduccion2' }
                    ],
                    diametrotubsuccion: {
                        '0.00': '1 pulg',
                        '0.50': '1 1/4 pulg',
                        '1.00': '1 1/2 pulg',
                        '1.60': '2 pulg',
                        '3.00': '2 1/2 pulg',
                        '5.00': '3 pulg',
                        '8.00': '4 pulg',
                        '15.0': '6 pulg',
                        '25.0': '8 pulg',
                    },
                    diametrotubimpulsion: {
                        '0.00': '3/4 pulg',
                        '0.50': '1 pulg',
                        '1.00': '1 1/4 pulg',
                        '1.60': '1 1/2 pulg',
                        '3.00': '2 pulg',
                        '5.00': '2 1/2 pulg',
                        '8.00': '3 pulg',
                        '15.0': '4 pulg',
                        '25.0': '6 pulg',
                    },
                    leqTabla: longEquival,
                },
                volumenTE: 2268,
                tiempoLlenadobomb: 2,
                QMDS: 0,
                longitudTuberiaSuccion: 4.25,
                micromedidorSuccion: 'SI',
                hfMedidorSuccion: 1.10,
                cargaDisponibleSuccion: 0,
                accesoriosSuccion: [
                    { tipo: 'codo45', cantidad: 0, leq: 0.477 },
                    { tipo: 'codo90', cantidad: 1, leq: 1.023 },
                    { tipo: 'codo90', cantidad: 0, leq: 2.045 },
                    { tipo: 'valCompuerta', cantidad: 1, leq: 0.216 },
                    { tipo: 'canastilla', cantidad: 1, leq: 2.114 },
                    { tipo: 'reduc2', cantidad: 0, leq: 1.045 }
                ],
                analisisCargaSuccion: [{ d: 25.4 }, { d: 31.8 }, { d: 38.1 }],
                longitudTuberiaImpulsion: 16.95,
                micromedidorImpulsion: 'SI',
                hfMedidorImpulsion: 1.10,
                cargaDisponibleImpulsion: 0,
                accesoriosImpulsion: [
                    { tipo: 'codo45', cantidad: 0, leq: 0.477 },
                    { tipo: 'codo90', cantidad: 2, leq: 1.023 },
                    { tipo: 'tee', cantidad: 2, leq: 2.045 },
                    { tipo: 'valCompuerta', cantidad: 0, leq: 0.216 },
                    { tipo: 'valCheck', cantidad: 0, leq: 2.114 },
                    { tipo: 'reduc2', cantidad: 0, leq: 1.045 }
                ],
                analisisCargaImpulsion: [{ d: 25.4 }, { d: 31.8 }, { d: 38.1 }],
                nivelFondoTanque: 13.85,
                nivelAguaTanque: 0,
                nivelFondoCisterna: 0,
                presionSalida: 2.00,
                eficiencia: 0.6,
                potenciaManual: null,
            };
        },
        computed: {
            qLlenado() {
                if (this.tiempoLlenadobomb <= 0 || this.volumenTE <= 0) return 0;
                return parseFloat((this.volumenTE / (this.tiempoLlenadobomb * 3600)).toFixed(3));
            },
            Qimpul() {
                return Math.max(this.qLlenado, this.QMDS);
            },
            diametroSuccion() {
                const q = this.Qimpul || 0;
                const tabla = this.config.diametrotubsuccion || {};

                let valorMasCercano = null;
                let diferenciaMinima = Infinity;

                for (const clave in tabla) {
                    const valorNumerico = parseFloat(clave);
                    const diferencia = Math.abs(valorNumerico - q);

                    if (diferencia < diferenciaMinima) {
                        diferenciaMinima = diferencia;
                        valorMasCercano = clave;
                    }
                }

                return valorMasCercano !== null ? tabla[valorMasCercano] : '1 pulg';
            },
            velocidadSuccion() {
                const diametroInfo = this.config.diametros[this.diametroSuccion];
                if (!diametroInfo) return 0;

                const q_m3s = this.Qimpul / 1000;
                const d_m = diametroInfo.mm * 2.54 / 100;
                const area_m2 = Math.PI * Math.pow(d_m, 2) / 4;

                const velocidad = q_m3s / area_m2;
                return parseFloat(velocidad.toFixed(2));
            },
            leqTotalSuccion() {
                return this.accesoriosSuccion.reduce((sum, acc) => sum + (acc.cantidad * acc.leq), 0);
            },
            longitudTotalSuccion() {
                return parseFloat((this.leqTotalSuccion + this.longitudTuberiaSuccion).toFixed(2));
            },
            pendienteHidraulicaSuccion() {
                const diametroInfo = this.config.diametros[this.diametroSuccion];
                if (!diametroInfo) return 0;

                const q_m3s = this.Qimpul / 1000;
                const d_m = diametroInfo.mm * 2.54 / 100;

                const numerador = q_m3s;
                const denominador = 0.2785 * 140 * Math.pow(d_m, 2.63);
                const pendiente = Math.pow(numerador / denominador, 1.85);
                return parseFloat(pendiente.toFixed(6));
            },
            perdidaPorFriccionSuccion() {
                return parseFloat((this.longitudTotalSuccion * this.pendienteHidraulicaSuccion).toFixed(2));
            },
            perdidaPorMedidorSuccion() {
                return this.micromedidorSuccion === 'SI' ? parseFloat(this.hfMedidorSuccion.toFixed(2)) : 0;
            },
            perdidaTotalCargaSuccion() {
                return parseFloat((this.perdidaPorFriccionSuccion + this.perdidaPorMedidorSuccion).toFixed(2));
            },
            esSistemaViableSuccion() {
                return this.cargaDisponibleSuccion > this.perdidaTotalCargaSuccion;
            },
            diametroImpulsion() {
                const q = this.Qimpul || 0;
                const tabla = this.config.diametrotubimpulsion || {};

                let valorMasCercano = null;
                let diferenciaMinima = Infinity;

                for (const clave in tabla) {
                    const valorNumerico = parseFloat(clave);
                    const diferencia = Math.abs(valorNumerico - q);

                    if (diferencia < diferenciaMinima) {
                        diferenciaMinima = diferencia;
                        valorMasCercano = clave;
                    }
                }

                return valorMasCercano !== null ? tabla[valorMasCercano] : '3/4 pulg';
            },
            velocidadImpulsion() {
                const diametroInfo = this.config.diametros[this.diametroImpulsion];
                if (!diametroInfo) return 0;

                const q_m3s = this.Qimpul / 1000;
                const d_m = diametroInfo.mm * 2.54 / 100;
                const area_m2 = Math.PI * Math.pow(d_m, 2) / 4;

                const velocidad = q_m3s / area_m2;
                return parseFloat(velocidad.toFixed(2));
            },
            leqTotalImpulsion() {
                return this.accesoriosImpulsion.reduce((sum, acc) => sum + (acc.cantidad * acc.leq), 0);
            },
            longitudTotalImpulsion() {
                return parseFloat((this.leqTotalImpulsion + this.longitudTuberiaImpulsion).toFixed(2));
            },
            pendienteHidraulicaImpulsion() {
                const diametroInfo = this.config.diametros[this.diametroImpulsion];
                if (!diametroInfo) return 0;

                const q_m3s = this.Qimpul / 1000;
                const d_m = diametroInfo.mm * 2.54 / 100;

                const numerador = q_m3s;
                const denominador = 0.2785 * 140 * Math.pow(d_m, 2.63);
                const pendiente = Math.pow(numerador / denominador, 1.85);
                return parseFloat(pendiente.toFixed(6));
            },
            perdidaPorFriccionImpulsion() {
                return parseFloat((this.longitudTotalImpulsion * this.pendienteHidraulicaImpulsion).toFixed(2));
            },
            perdidaPorMedidorImpulsion() {
                return this.micromedidorImpulsion === 'SI' ? parseFloat(this.hfMedidorImpulsion.toFixed(2)) : 0;
            },
            perdidaTotalCargaImpulsion() {
                return parseFloat((this.perdidaPorFriccionImpulsion + this.perdidaPorMedidorImpulsion).toFixed(2));
            },
            esSistemaViableImpulsion() {
                return this.cargaDisponibleImpulsion > this.perdidaTotalCargaImpulsion;
            },
            hdt() {
                const total = this.perdidaPorFriccionImpulsion + this.perdidaPorFriccionSuccion + this.presionSalida + (this.nivelAguaTanque - this.nivelFondoCisterna);
                return Math.ceil(total);
            },
            potencia() {
                if (this.eficiencia === 0) return 0;
                return (this.Qimpul * this.hdt) / (75 * this.eficiencia);
            },
            potenciaEstimada() {
                return this.potenciaManual !== null ? this.potenciaManual : Math.ceil(this.potencia);
            }
        },
        methods: {
            toggleMode() {
                this.mode = this.mode === 'view' ? 'edit' : 'view';
            },
            updateCalculations() {
                this.actualizarTodosLosModulos();
            },
            actualizarLeqAccesorioSuccion(idx) {
                const accesorio = this.accesoriosSuccion[idx];
                const leqTabla = this.config.leqTabla || {};
                accesorio.leq = leqTabla[accesorio.tipo]?.[this.diametroSuccion] || 0;
                this.actualizarSuccion();
            },
            actualizarSuccion() {
                this.notificarSuccionCambio();
            },
            notificarSuccionCambio() {
                document.dispatchEvent(new CustomEvent('perdida-carga-succion-actualizada', {
                    detail: {
                        perdidaTotal: this.perdidaTotalCargaSuccion,
                        velocidad: this.velocidadSuccion,
                        viable: this.esSistemaViableSuccion
                    }
                }));
            },
            actualizarLeqAccesorioImpulsion(idx) {
                const accesorio = this.accesoriosImpulsion[idx];
                const leqTabla = this.config.leqTabla || {};
                accesorio.leq = leqTabla[accesorio.tipo]?.[this.diametroImpulsion] || 0;
                this.actualizarImpulsion();
            },
            actualizarImpulsion() {
                this.notificarImpulsionCambio();
            },
            notificarImpulsionCambio() {
                document.dispatchEvent(new CustomEvent('perdida-carga-impulsion-actualizada', {
                    detail: {
                        perdidaTotal: this.perdidaTotalCargaImpulsion,
                        velocidad: this.velocidadImpulsion,
                        viable: this.esSistemaViableImpulsion
                    }
                }));
            },
            actualizarHdt() {
                document.dispatchEvent(new CustomEvent('hdt-updated', { detail: { hdt: this.hdt } }));
            },
            init() {
                this.configurarEventos();
            },
            configurarEventos() {
                document.addEventListener('red-alimentacion-updated', (event) => {
                    if (event.detail) {
                        this.nivelFondoTanque = event.detail.config.altasumfondotanqueelevado ? parseFloat(event.detail.config.altasumfondotanqueelevado) : 0;
                        this.actualizarTodosLosModulos();
                    }
                });
                document.addEventListener('cisterna-updated', (event) => {
                    if (event.detail) {
                        this.nivelFondoCisterna = event.detail.nivel5 ? parseFloat(event.detail.nivel5) : 0;
                        this.actualizarTodosLosModulos();
                    }
                });
                document.addEventListener('tanque-updated', (event) => {
                    if (event.detail) {
                        const niveles = event.detail.niveles;
                        const nivelRebose = Array.isArray(niveles) ? niveles.find(n => n.numero === 4) : null;
                        if (nivelRebose) {
                            this.nivelAguaTanque = parseFloat(nivelRebose.valor);
                        }
                        this.volumenTE = event.detail.volumenCalculado ? (parseFloat(event.detail.volumenCalculado) * 1000) : 0;
                        this.actualizarTodosLosModulos();
                    }
                });
                document.addEventListener('maxima-demanda-simultanea-updated', (event) => {
                    if (event.detail) {
                        this.QMDS = event.detail.totals.qmdsTotal ? parseFloat(event.detail.totals.qmdsTotal) : 0;
                        this.actualizarTodosLosModulos();
                    }
                });
            },
            actualizarTodosLosModulos() {
                this.actualizarSuccion();
                this.actualizarImpulsion();
            }
        },
        mounted() {
            this.init();
        }
    };

    createApp(BombeoTanqueComponent).mount(bombeotanque);
}