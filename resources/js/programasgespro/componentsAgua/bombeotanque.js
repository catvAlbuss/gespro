import longEquival from "./longitud-components.js";

export function initBombeoTanqueModule() {
    const bombeotanque = document.getElementById('bombeo-tanque-elevado-content');
    if (!bombeotanque) {
        console.error('Contenedor Red de Alimentacion no encontrado');
        return;
    }

    bombeotanque.innerHTML = `
      <div x-data="bombeotanqueModule" class="max-w-full mx-auto p-4">
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
                                    <span x-text="mode === 'edit' ? 'Edición' : 'Vista'"></span>
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
                                    <input type="number" x-model.number="caudalImpulsion.volumenTE.toFixed(2)" step="0.001" disabled
                                        class="w-full px-3 py-2 bg-yellow-100 border-2 border-yellow-300 text-gray-700 font-semibold rounded-l-md focus:outline-none">
                                    <span class="px-3 py-2 bg-gray-200 text-sm text-gray-700 rounded-r-md border-t border-b border-r border-gray-300">L</span>
                                </div>
                            </div>

                            <!-- Tiempo Llenado -->
                            <div class="space-y-1">
                                <label class="block text-xs font-semibold text-gray-600 tracking-wide">TIEMPO DE LLENADO</label>
                                <div class="flex items-center">
                                    <input type="number" x-model.number="caudalImpulsion.tiempoLlenadobomb" step="0.1"
                                        @input="caudalImpulsion.updateCalculations()"
                                        class="w-full px-3 py-2 bg-yellow-100 border-2 border-yellow-300 text-gray-700 font-semibold rounded-l-md focus:outline-none">
                                    <span class="px-3 py-2 bg-gray-200 text-sm text-gray-700 rounded-r-md border-t border-b border-r border-gray-300">hrs</span>
                                </div>
                            </div>

                            <!-- Q Llenado -->
                            <div class="space-y-1">
                                <label class="block text-xs font-semibold text-gray-600 tracking-wide">CAUDAL DE LLENADO</label>
                                <div class="flex items-center">
                                    <input type="text" :value="caudalImpulsion.qLlenado" readonly
                                        class="w-full px-3 py-2 bg-gray-50 border border-gray-300 text-gray-900 font-bold rounded-l-md">
                                    <span class="px-3 py-2 bg-gray-200 text-sm text-gray-700 rounded-r-md border-t border-b border-r border-gray-300">L/s</span>
                                </div>
                            </div>

                            <!-- Q MDS -->
                            <div class="space-y-1">
                                <label class="block text-xs font-semibold text-gray-600 tracking-wide">Q MDS</label>
                                <div class="flex items-center">
                                    <input type="text" :value="caudalImpulsion.QMDS" readonly
                                        class="w-full px-3 py-2 bg-gray-50 border border-gray-300 text-gray-900 font-bold rounded-l-md">
                                    <span class="px-3 py-2 bg-gray-200 text-sm text-gray-700 rounded-r-md border-t border-b border-r border-gray-300">L/s</span>
                                </div>
                            </div>

                            <!-- Q Impulsión -->
                            <div class="space-y-1">
                                <label class="block text-xs font-semibold text-gray-600 tracking-wide">Q IMPULSIÓN</label>
                                <div class="flex items-center">
                                    <input type="text" :value="caudalImpulsion.Qimpul" readonly
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
                                        <span x-text="perdidaCargaSuccion.configuracion.diametroConexion"></span>
                                        <span class="text-xs text-blue-600">Auto</span>
                                    </div>
                                    <!-- Select oculto para mantener funcionalidad si es necesario -->
                                    <select x-model="perdidaCargaSuccion.configuracion.diametroConexion" 
                                            style="display: none;" 
                                            disabled>
                                        <template x-for="(val, key) in config.diametros" :key="key">
                                            <option :value="key" x-text="key"></option>
                                        </template>
                                    </select>
                                </div>
                                <div class="space-y-2">
                                    <label class="block text-sm font-semibold text-gray-700">Longitud de la Tubería (m)</label>
                                    <div class="flex items-center gap-2">
                                        <input type="number" x-model.number="perdidaCargaSuccion.configuracion.longitudTuberia"
                                            @input="perdidaCargaSuccion.actualizar()" step="0.01" min="0"
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
                                        <template x-for="(accesorio, idx) in perdidaCargaSuccion.accesorios" :key="idx">
                                            <tr class="hover:bg-gray-50 transition-all duration-200">
                                                <template x-if="idx === 0">
                                                    <td :rowspan="perdidaCargaSuccion.accesorios.length"
                                                        class="px-6 py-3 align-top font-semibold text-blue-600 text-center"
                                                        x-text="caudalImpulsion.Qimpul + ' L/s'"></td>
                                                </template>
                                                <template x-if="idx === 0">
                                                    <td :rowspan="perdidaCargaSuccion.accesorios.length"
                                                        class="px-6 py-3 align-top font-semibold text-center"
                                                        x-text="perdidaCargaSuccion.configuracion.diametroConexion"></td>
                                                </template>
                                                <template x-if="idx === 0">
                                                    <td :rowspan="perdidaCargaSuccion.accesorios.length"
                                                        class="px-6 py-3 align-top font-semibold text-green-600 text-center"
                                                        x-text="perdidaCargaSuccion.velocidad + ' m/s'"></td>
                                                </template>
                                                <td class="px-6 py-3">
                                                    <select x-model="accesorio.tipo"
                                                        @change="perdidaCargaSuccion.actualizarLeqAccesorio(accesorio)"
                                                        class="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200">
                                                        <option value="">Seleccione</option>
                                                        <template x-for="item in config.accesoriosDisponibles" :key="item.key">
                                                            <option :value="item.key" x-text="item.label"></option>
                                                        </template>
                                                    </select>
                                                </td>
                                                <td class="px-6 py-3">
                                                    <input type="number" min="0" step="1" x-model.number="accesorio.cantidad"
                                                        @input="perdidaCargaSuccion.actualizar()"
                                                        class="w-20 px-3 py-2 border border-gray-200 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200">
                                                </td>
                                                <td class="px-6 py-3 text-center" x-text="accesorio.leq.toFixed(3)"></td>
                                                <td class="px-6 py-3 text-center font-semibold"
                                                    x-text="(accesorio.cantidad * accesorio.leq).toFixed(3)"></td>
                                                <template x-if="idx === 0">
                                                    <td :rowspan="perdidaCargaSuccion.accesorios.length"
                                                        class="px-6 py-3 align-top font-semibold text-center"
                                                        x-text="perdidaCargaSuccion.configuracion.longitudTuberia + ' m'"></td>
                                                </template>
                                                <template x-if="idx === 0">
                                                    <td :rowspan="perdidaCargaSuccion.accesorios.length"
                                                        class="px-6 py-3 align-top font-semibold text-purple-600 text-center"
                                                        x-text="perdidaCargaSuccion.longitudTotal + ' m'"></td>
                                                </template>
                                                <template x-if="idx === 0">
                                                    <td :rowspan="perdidaCargaSuccion.accesorios.length"
                                                        class="px-6 py-3 align-top font-mono text-xs text-center"
                                                        x-text="perdidaCargaSuccion.pendienteHidraulica"></td>
                                                </template>
                                                <template x-if="idx === 0">
                                                    <td :rowspan="perdidaCargaSuccion.accesorios.length"
                                                        class="px-6 py-3 align-top font-bold text-red-600 text-center"
                                                        x-text="perdidaCargaSuccion.perdidaPorFriccion + ' m'"></td>
                                                </template>
                                            </tr>
                                        </template>
                                    </tbody>
                                    <tfoot>
                                        <tr class="bg-gray-50 text-sm font-semibold">
                                            <td colspan="6" class="px-6 py-3 text-right">LONGITUD TOTAL EQUIVALENTE (m):</td>
                                            <td class="px-6 py-3 font-bold text-blue-600 text-center"
                                                x-text="perdidaCargaSuccion.leqTotal.toFixed(3)"></td>
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
                                        <span x-text="perdidaCargaImpulsion.configuracion.diametroConexion"></span>
                                        <span class="text-xs text-green-600">Auto</span>
                                    </div>
                                    <!-- Select oculto para mantener funcionalidad si es necesario -->
                                    <select x-model="perdidaCargaImpulsion.configuracion.diametroConexion" 
                                            style="display: none;" 
                                            disabled>
                                        <template x-for="(val, key) in config.diametros" :key="key">
                                            <option :value="key" x-text="key"></option>
                                        </template>
                                    </select>
                                </div>
                                <div class="space-y-2">
                                    <label class="block text-sm font-semibold text-gray-700">Longitud de la Tubería (m)</label>
                                    <div class="flex items-center gap-2">
                                        <input type="number" x-model.number="perdidaCargaImpulsion.configuracion.longitudTuberia"
                                            @input="perdidaCargaImpulsion.actualizar()" step="0.01" min="0"
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
                                        <template x-for="(accesorio, idx) in perdidaCargaImpulsion.accesorios" :key="idx">
                                            <tr class="hover:bg-gray-50 transition-all duration-200">
                                                <template x-if="idx === 0">
                                                    <td :rowspan="perdidaCargaImpulsion.accesorios.length"
                                                        class="px-6 py-3 align-top font-semibold text-green-600 text-center"
                                                        x-text="caudalImpulsion.Qimpul + ' L/s'"></td>
                                                </template>
                                                <template x-if="idx === 0">
                                                    <td :rowspan="perdidaCargaImpulsion.accesorios.length"
                                                        class="px-6 py-3 align-top font-semibold text-center"
                                                        x-text="perdidaCargaImpulsion.configuracion.diametroConexion"></td>
                                                </template>
                                                <template x-if="idx === 0">
                                                    <td :rowspan="perdidaCargaImpulsion.accesorios.length"
                                                        class="px-6 py-3 align-top font-semibold text-green-600 text-center"
                                                        x-text="perdidaCargaImpulsion.velocidad + ' m/s'"></td>
                                                </template>
                                                <td class="px-6 py-3">
                                                    <select x-model="accesorio.tipo"
                                                        @change="perdidaCargaImpulsion.actualizarLeqAccesorio(accesorio)"
                                                        class="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200">
                                                        <option value="">Seleccione</option>
                                                        <template x-for="item in config.accesoriosDisponibles" :key="item.key">
                                                            <option :value="item.key" x-text="item.label"></option>
                                                        </template>
                                                    </select>
                                                </td>
                                                <td class="px-6 py-3">
                                                    <input type="number" min="0" step="1" x-model.number="accesorio.cantidad"
                                                        @input="perdidaCargaImpulsion.actualizar()"
                                                        class="w-20 px-3 py-2 border border-gray-200 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200">
                                                </td>
                                                <td class="px-6 py-3 text-center" x-text="accesorio.leq.toFixed(3)"></td>
                                                <td class="px-6 py-3 text-center font-semibold"
                                                    x-text="(accesorio.cantidad * accesorio.leq).toFixed(3)"></td>
                                                <template x-if="idx === 0">
                                                    <td :rowspan="perdidaCargaImpulsion.accesorios.length"
                                                        class="px-6 py-3 align-top font-semibold text-center"
                                                        x-text="perdidaCargaImpulsion.configuracion.longitudTuberia + ' m'"></td>
                                                </template>
                                                <template x-if="idx === 0">
                                                    <td :rowspan="perdidaCargaImpulsion.accesorios.length"
                                                        class="px-6 py-3 align-top font-semibold text-purple-600 text-center"
                                                        x-text="perdidaCargaImpulsion.longitudTotal + ' m'"></td>
                                                </template>
                                                <template x-if="idx === 0">
                                                    <td :rowspan="perdidaCargaImpulsion.accesorios.length"
                                                        class="px-6 py-3 align-top font-mono text-xs text-center"
                                                        x-text="perdidaCargaImpulsion.pendienteHidraulica"></td>
                                                </template>
                                                <template x-if="idx === 0">
                                                    <td :rowspan="perdidaCargaImpulsion.accesorios.length"
                                                        class="px-6 py-3 align-top font-bold text-red-600 text-center"
                                                        x-text="perdidaCargaImpulsion.perdidaPorFriccion + ' m'"></td>
                                                </template>
                                            </tr>
                                        </template>
                                    </tbody>
                                    <tfoot>
                                        <tr class="bg-gray-50 text-sm font-semibold">
                                            <td colspan="6" class="px-6 py-3 text-right">LONGITUD TOTAL EQUIVALENTE (m):</td>
                                            <td class="px-6 py-3 font-bold text-green-600 text-center"
                                                x-text="perdidaCargaImpulsion.leqTotal.toFixed(3)"></td>
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
                            <span x-text="alturaDinamicaTotal.nivelFondoTanque.toFixed(2) + ' m'">+13.85 m</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Nivel de Agua del Tanque Elevado =</span>
                            <span x-text="alturaDinamicaTotal.nivelAguaTanque.toFixed(2) + ' m'">+15.75 m</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Nivel de Fondo de Cisterna =</span>
                            <span x-text="alturaDinamicaTotal.nivelFondoCisterna.toFixed(2) + ' m'">-1.95 m</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Presión de Salida =</span>
                            <div class="space-y-2">
                                <div class="flex items-center gap-2">
                                    <input type="number" x-model.number="alturaDinamicaTotal.presionSalida"
                                        @input="alturaDinamicaTotal.actualizar()" step="0.01" min="0"
                                        class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700 transition">
                                    <span class="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">m</span>
                                </div>
                            </div>
                        </div>
                        <div class="flex justify-between">
                            <span>Pérdida de carga Tub. Succión =</span>
                            <span x-text="alturaDinamicaTotal.perdidaSuccion.toFixed(2) + ' m'">0.21 m</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Pérdida de carga Tub. Impulsión =</span>
                            <span x-text="alturaDinamicaTotal.perdidaImpulsion.toFixed(2) + ' m'">2.07 m</span>
                        </div>

                        <div class="flex justify-center pt-6">
                            <div class="bg-yellow-100 border border-gray-400 px-6 py-2 rounded text-center">
                                <span class="font-semibold">HDT =</span>
                                <span class="text-lg font-bold" x-text="alturaDinamicaTotal.hdt.toFixed(2)">22.00</span>
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
                            <span x-text="caudalImpulsion.Qimpul + ' Ls/s'">2.07 m</span>
                        </div>

                        <!-- Altura Dinámica Total -->
                        <div class="flex justify-between">
                            <span>Altura Dinámica Total =</span>
                            <span x-text="alturaDinamicaTotal.hdt.toFixed(2) + ' m'">2.07 m</span>
                        </div>

                        <!-- Eficiencia -->
                        <div class="flex justify-between">
                            <span>Eficiencia =</span>
                            <div class="flex items-center gap-2">
                                <input type="number" x-model.number="calculoSistemaBombeo.eficiencia" step="0.01" min="0" max="1"
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
                                <span x-text="calculoSistemaBombeo.potencia.toFixed(2)"></span>
                                <span class="mx-2">→</span>
                                <!-- INPUT EDITABLE -->
                                <div class="inline-flex items-center bg-yellow-100 px-3 py-1 border border-gray-400 rounded">
                                    <input
                                        type="number"
                                        step="0.01"
                                        class="bg-yellow-100 w-16 text-right focus:outline-none"
                                        x-model.number="calculoSistemaBombeo.potenciaManual"
                                        :placeholder="calculoSistemaBombeo.potenciaEstimada.toFixed(2)"
                                    />
                                    <span class="ml-1">HP</span>
                                </div>
                            </div>
                        </div>

                        <!-- NOTA ACTUALIZADA CON potenciaEstimada -->
                        <div class="mt-4 text-sm text-gray-600 border-l-4 border-green-400 pl-4">
                            De acuerdo a la existencia en el mercado con los diámetros más similares a la de succión e impulsión requeridos,
                            se asume la potencia es de
                            <strong><span x-text="calculoSistemaBombeo.potenciaEstimada.toFixed(0) + ' HP'"></span></strong>.
                        </div>

                    </div>
                </div>

            </main>
        </div>
    `;

    Alpine.data('bombeotanqueModule', () => ({
        mode: 'view',

        // ==============================================
        // CONFIGURACIÓN GLOBAL Y CONSTANTES
        // ==============================================
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
            leqTabla: longEquival, // Asegúrate de que longEquival esté definido globalmente o como constante
        },

        // ==============================================
        // MÓDULO 5.1 : CAUDAL DE IMPULSION
        // ==============================================
        caudalImpulsion: {
            volumenTE: 2268,
            tiempoLlenadobomb: 2,
            QMDS: 0,

            get qLlenado() {
                if (this.tiempoLlenadobomb <= 0 || this.volumenTE <= 0) return 0;
                return parseFloat((this.volumenTE / (this.tiempoLlenadobomb * 3600)).toFixed(3));
            },

            get Qimpul() {
                return Math.max(this.qLlenado, this.QMDS);
            },

            actualizar() {
                this.notificarCambio();
            },

            notificarCambio() {
                document.dispatchEvent(new CustomEvent('caudal-actualizado', {
                    detail: { qLlenado: this.qLlenado }
                }));
            },

            validar() {
                return {
                    valido: this.volumenTE > 0 && this.tiempoLlenadobomb > 0,
                    errores: []
                };
            }
        },

        // ==============================================
        // MÓDULO 5.2.1 : PERDIDA DE CARGA SUCCIÓN
        // ==============================================
        perdidaCargaSuccion: {
            configuracion: {
                diametroConexion: '2 1/2 pulg',
                micromedidor: 'SI',
                longitudTuberia: 4.25,
                hfMedidor: 1.10
            },
            accesorios: [
                { tipo: 'codo45', cantidad: 0, leq: 0.477 },
                { tipo: 'codo90', cantidad: 1, leq: 1.023 },
                { tipo: 'codo90', cantidad: 0, leq: 2.045 },
                { tipo: 'valCompuerta', cantidad: 1, leq: 0.216 },
                { tipo: 'canastilla', cantidad: 1, leq: 2.114 },
                { tipo: 'reduc2', cantidad: 0, leq: 1.045 }
            ],
            caudal: 0,
            cargaDisponible: 0,
            analisisCarga: [{ d: 25.4 }, { d: 31.8 }, { d: 38.1 }],

            init() {
                this.caudal = this.parent ? this.parent.caudalImpulsion.qLlenado : 0;
                this.cargaDisponible = this.parent ? this.parent.cargaDisponible?.cargaDisponibleTotal || 0 : 0;
                this.actualizarDiametroSegunQimpul();
            },

            // CORREGIDO: Buscar diámetro según tabla de succión
            actualizarDiametroSegunQimpul() {
                const q = this.parent?.caudalImpulsion?.Qimpul || 0;
                const tabla = this.parent?.config?.diametrotubsuccion || {};

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

                if (valorMasCercano !== null) {
                    this.configuracion.diametroConexion = tabla[valorMasCercano];
                    //console.log(`Succión - Diámetro seleccionado: ${this.configuracion.diametroConexion} para Q: ${q}`);
                }
            },

            get caudalM3h() {
                return parseFloat((this.parent ? this.parent.caudalImpulsion.qLlenado * 3.6 : 0).toFixed(2));
            },

            // CORREGIDO: Cálculo de velocidad usando fórmula correcta
            get velocidad() {
                const diametroInfo = this.obtenerInfoDiametro();
                if (!diametroInfo) return 0;

                const q_m3s = (this.parent ? this.parent.caudalImpulsion.Qimpul : 0) / 1000;
                const d_m = diametroInfo.mm * 2.54 / 100; // pulgadas a metros
                const area_m2 = Math.PI * Math.pow(d_m, 2) / 4; // área en m²

                try {
                    const velocidad = q_m3s / area_m2;
                    return parseFloat(velocidad.toFixed(2));
                } catch (error) {
                    console.error('Error calculando velocidad en succión:', error);
                    return 0;
                }
            },

            get leqTotal() {
                return this.accesorios.reduce((sum, acc) => sum + (acc.cantidad * acc.leq), 0);
            },

            get longitudTotal() {
                return parseFloat((this.leqTotal + this.configuracion.longitudTuberia).toFixed(2));
            },

            // CORREGIDO: Cálculo de pendiente hidráulica usando fórmula correcta
            get pendienteHidraulica() {
                const diametroInfo = this.obtenerInfoDiametro();
                if (!diametroInfo) return 0;

                const q_m3s = (this.parent ? this.parent.caudalImpulsion.Qimpul : 0) / 1000;
                const d_m = diametroInfo.mm * 2.54 / 100; // pulgadas a metros

                try {
                    const numerador = q_m3s;
                    const denominador = 0.2785 * 140 * Math.pow(d_m, 2.63);
                    const pendiente = Math.pow(numerador / denominador, 1.85);
                    return parseFloat(pendiente.toFixed(6));
                } catch (error) {
                    console.error('Error calculando pendiente hidráulica en succión:', error);
                    return 0;
                }
            },

            get perdidaPorFriccion() {
                return parseFloat((this.longitudTotal * this.pendienteHidraulica).toFixed(2));
            },

            get perdidaPorMedidor() {
                return this.configuracion.micromedidor === 'SI' ? parseFloat(this.configuracion.hfMedidor.toFixed(2)) : 0;
            },

            get perdidaTotalCarga() {
                return parseFloat((this.perdidaPorFriccion + this.perdidaPorMedidor).toFixed(2));
            },

            get esSistemaViable() {
                return this.cargaDisponible > this.perdidaTotalCarga;
            },

            get cargaDisponibleHdTRMD() {
                return this.cargaDisponible - this.configuracion.hfMedidor - this.perdidaPorFriccion;
            },

            obtenerInfoDiametro() {
                return this.parent ? this.parent.config.diametros[this.configuracion.diametroConexion] || null : null;
            },

            actualizarLeqAccesorio(accesorio) {
                const leqTabla = this.parent ? this.parent.config.leqTabla || {} : {};
                accesorio.leq = leqTabla[accesorio.tipo]?.[this.configuracion.diametroConexion] || 0;
                this.actualizar();
            },

            agregarAccesorio(tipo = 'codo90') {
                const nuevoAccesorio = { tipo, cantidad: 1, leq: 0 };
                this.actualizarLeqAccesorio(nuevoAccesorio);
                this.accesorios.push(nuevoAccesorio);
            },

            eliminarAccesorio(index) {
                this.accesorios.splice(index, 1);
                this.actualizar();
            },

            agregarFilaAnalisis() {
                this.analisisCarga.push({ d: 25.4 });
                if (this.parent && this.parent.analisisTuberias) {
                    this.parent.analisisTuberias.modulos.push({ longitudTotal: 4.25 });
                }
            },

            updateRow(index) {
                // Lógica adicional si es necesaria
            },

            actualizar() {
                this.actualizarDiametroSegunQimpul();
                this.notificarCambio();
            },

            notificarCambio() {
                document.dispatchEvent(new CustomEvent('perdida-carga-succion-actualizada', {
                    detail: {
                        perdidaTotal: this.perdidaTotalCarga,
                        velocidad: this.velocidad,
                        viable: this.esSistemaViable
                    }
                }));
            },

            validar() {
                const errores = [];
                const caudal = this.parent ? this.parent.caudalImpulsion.qLlenado : 0;
                if (caudal <= 0) errores.push('El caudal debe ser mayor a 0');
                if (this.velocidad > 3) errores.push('Velocidad excesiva (> 3 m/s)');
                if (!this.esSistemaViable) errores.push('Sistema no viable: pérdida > carga disponible');
                return {
                    valido: errores.length === 0,
                    errores,
                    advertencias: this.velocidad > 2 ? ['Velocidad alta (> 2 m/s)'] : []
                };
            }
        },

        // ==============================================
        // MÓDULO 5.2.2 : PERDIDA DE CARGA IMPULSIÓN
        // ==============================================
        perdidaCargaImpulsion: {
            configuracion: {
                diametroConexion: '1 pulg',
                micromedidor: 'SI',
                longitudTuberia: 16.95,
                hfMedidor: 1.10
            },
            accesorios: [
                { tipo: 'codo45', cantidad: 0, leq: 0.477 },
                { tipo: 'codo90', cantidad: 2, leq: 1.023 },
                { tipo: 'tee', cantidad: 2, leq: 2.045 },
                { tipo: 'valCompuerta', cantidad: 0, leq: 0.216 },
                { tipo: 'valCheck', cantidad: 0, leq: 2.114 },
                { tipo: 'reduc2', cantidad: 0, leq: 1.045 }
            ],
            caudal: 0,
            cargaDisponible: 0,
            analisisCarga: [{ d: 25.4 }, { d: 31.8 }, { d: 38.1 }],

            init() {
                this.caudal = this.parent ? this.parent.caudalImpulsion.qLlenado : 0;
                this.cargaDisponible = this.parent ? this.parent.cargaDisponible?.cargaDisponibleTotal || 0 : 0;
                this.actualizarDiametroSegunQimpul();
            },

            // CORREGIDO: Buscar diámetro según tabla de impulsión
            actualizarDiametroSegunQimpul() {
                const q = this.parent?.caudalImpulsion?.Qimpul || 0;
                const tabla = this.parent?.config?.diametrotubimpulsion || {};

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

                if (valorMasCercano !== null) {
                    this.configuracion.diametroConexion = tabla[valorMasCercano];
                    //console.log(`Impulsión - Diámetro seleccionado: ${this.configuracion.diametroConexion} para Q: ${q}`);
                }
            },

            get caudalM3h() {
                return parseFloat((this.parent ? this.parent.caudalImpulsion.qLlenado * 3.6 : 0).toFixed(2));
            },

            // CORREGIDO: Cálculo de velocidad usando fórmula correcta
            get velocidad() {
                const diametroInfo = this.obtenerInfoDiametro();
                if (!diametroInfo) return 0;

                const q_m3s = (this.parent ? this.parent.caudalImpulsion.Qimpul : 0) / 1000;
                const d_m = diametroInfo.mm * 2.54 / 100; // pulgadas a metros
                const area_m2 = Math.PI * Math.pow(d_m, 2) / 4; // área en m²

                try {
                    const velocidad = q_m3s / area_m2;
                    return parseFloat(velocidad.toFixed(2));
                } catch (error) {
                    console.error('Error calculando velocidad en impulsión:', error);
                    return 0;
                }
            },

            get leqTotal() {
                return this.accesorios.reduce((sum, acc) => sum + (acc.cantidad * acc.leq), 0);
            },

            get longitudTotal() {
                return parseFloat((this.leqTotal + this.configuracion.longitudTuberia).toFixed(2));
            },

            // CORREGIDO: Cálculo de pendiente hidráulica usando fórmula correcta
            get pendienteHidraulica() {
                const diametroInfo = this.obtenerInfoDiametro();
                if (!diametroInfo) return 0;

                const q_m3s = (this.parent ? this.parent.caudalImpulsion.Qimpul : 0) / 1000;
                const d_m = diametroInfo.mm * 2.54 / 100; // pulgadas a metros

                try {
                    const numerador = q_m3s;
                    const denominador = 0.2785 * 140 * Math.pow(d_m, 2.63);
                    const pendiente = Math.pow(numerador / denominador, 1.85);
                    return parseFloat(pendiente.toFixed(6));
                } catch (error) {
                    console.error('Error calculando pendiente hidráulica en impulsión:', error);
                    return 0;
                }
            },

            get perdidaPorFriccion() {
                return parseFloat((this.longitudTotal * this.pendienteHidraulica).toFixed(2));
            },

            get perdidaPorMedidor() {
                return this.configuracion.micromedidor === 'SI' ? parseFloat(this.configuracion.hfMedidor.toFixed(2)) : 0;
            },

            get perdidaTotalCarga() {
                return parseFloat((this.perdidaPorFriccion + this.perdidaPorMedidor).toFixed(2));
            },

            get esSistemaViable() {
                return this.cargaDisponible > this.perdidaTotalCarga;
            },

            get cargaDisponibleHdTRMD() {
                return this.cargaDisponible - this.configuracion.hfMedidor - this.perdidaPorFriccion;
            },

            obtenerInfoDiametro() {
                return this.parent ? this.parent.config.diametros[this.configuracion.diametroConexion] || null : null;
            },

            actualizarLeqAccesorio(accesorio) {
                const leqTabla = this.parent ? this.parent.config.leqTabla || {} : {};
                accesorio.leq = leqTabla[accesorio.tipo]?.[this.configuracion.diametroConexion] || 0;
                this.actualizar();
            },

            agregarAccesorio(tipo = 'codo90') {
                const nuevoAccesorio = { tipo, cantidad: 1, leq: 0 };
                this.actualizarLeqAccesorio(nuevoAccesorio);
                this.accesorios.push(nuevoAccesorio);
            },

            eliminarAccesorio(index) {
                this.accesorios.splice(index, 1);
                this.actualizar();
            },

            agregarFilaAnalisis() {
                this.analisisCarga.push({ d: 25.4 });
                if (this.parent && this.parent.analisisTuberias) {
                    this.parent.analisisTuberias.modulos.push({ longitudTotal: 5.40 });
                }
            },

            updateRow(index) {
                // Lógica adicional si es necesaria
            },

            actualizar() {
                this.actualizarDiametroSegunQimpul();
                this.notificarCambio();
            },

            notificarCambio() {
                document.dispatchEvent(new CustomEvent('perdida-carga-impulsion-actualizada', {
                    detail: {
                        perdidaTotal: this.perdidaTotalCarga,
                        velocidad: this.velocidad,
                        viable: this.esSistemaViable
                    }
                }));
            },

            validar() {
                const errores = [];
                const caudal = this.parent ? this.parent.caudalImpulsion.qLlenado : 0;
                if (caudal <= 0) errores.push('El caudal debe ser mayor a 0');
                if (this.velocidad > 3) errores.push('Velocidad excesiva (> 3 m/s)');
                if (!this.esSistemaViable) errores.push('Sistema no viable: pérdida > carga disponible');
                return {
                    valido: errores.length === 0,
                    errores,
                    advertencias: this.velocidad > 2 ? ['Velocidad alta (> 2 m/s)'] : []
                };
            }
        },

        // ==============================================
        // MÓDULO 5.3.:  ALTURA DINAMICA TOTAL - HDT
        // ==============================================
        alturaDinamicaTotal: {
            nivelFondoTanque: 13.85,
            nivelAguaTanque: 0,
            nivelFondoCisterna: 0,
            presionSalida: 2.00,
            get perdidaSuccion() {
                return this.parent ? this.parent.perdidaCargaSuccion.perdidaPorFriccion : 0;
            },
            get perdidaImpulsion() {
                return this.parent ? this.parent.perdidaCargaImpulsion.perdidaPorFriccion : 0;
            },
            get hdt() {
                const total = this.perdidaImpulsion + this.perdidaSuccion + this.presionSalida + (this.nivelAguaTanque - this.nivelFondoCisterna);
                return Math.ceil(total);
            },
            actualizar() {
                // Trigger UI update if needed (Alpine handles reactivity, but can dispatch event if needed)
                document.dispatchEvent(new CustomEvent('hdt-updated', { detail: { hdt: this.hdt } }));
            },
            parent: null // will be set in init
        },
        // ==============================================
        // MÓDULO 5.4. : CALCULO DEL SISTEMA DE BOMBEO
        // ==============================================
        calculoSistemaBombeo: {
            eficiencia: 0.6,
            parent: null,
            potenciaManual: null, // valor editable (null por defecto)

            get Qimpul() {
                return this.parent ? this.parent.caudalImpulsion.Qimpul : 0;
            },
            get hdt() {
                return this.parent ? this.parent.alturaDinamicaTotal.hdt : 0;
            },
            get potencia() {
                if (this.eficiencia === 0) return 0;
                return (this.Qimpul * this.hdt) / (75 * this.eficiencia);
            },
            get potenciaEstimada() {
                return this.potenciaManual !== null ? this.potenciaManual : Math.ceil(this.potencia);
            }
        },
        // ==============================================
        // INICIALIZACIÓN Y EVENTOS
        // ==============================================
        init() {
            // Establecer referencias parent
            this.caudalImpulsion.parent = this;
            this.perdidaCargaSuccion.parent = this;
            this.perdidaCargaImpulsion.parent = this;
            this.alturaDinamicaTotal.parent = this;
            this.calculoSistemaBombeo.parent = this;

            // Inicializar módulos
            this.perdidaCargaSuccion.init();
            this.perdidaCargaImpulsion.init();

            this.configurarEventos();
            //console.log("LEQ Tabla cargada:", this.config.leqTabla);
        },

        configurarEventos() {
            document.addEventListener('red-alimentacion-updated', (event) => {
                if (event.detail) {
                    //console.log(event.detail)
                    this.alturaDinamicaTotal.nivelFondoTanque = event.detail.config.altasumfondotanqueelevado ?
                        (parseFloat(event.detail.config.altasumfondotanqueelevado)) : 0;
                    this.actualizarTodosLosModulos();
                }
            })
            document.addEventListener('cisterna-updated', (event) => {
                if (event.detail) {
                    ////console.log(event.detail)
                    this.alturaDinamicaTotal.nivelFondoCisterna = event.detail.nivel5 ?
                        (parseFloat(event.detail.nivel5)) : 0;
                    this.actualizarTodosLosModulos();
                }
            })
            document.addEventListener('tanque-updated', (event) => {
                if (event.detail) {
                    const niveles = event.detail.niveles;

                    // Buscar el nivel con numero 4 (Nivel Rebose)
                    const nivelRebose = Array.isArray(niveles)
                        ? niveles.find(n => n.numero === 4)
                        : null;

                    // Verificamos y cargamos si existe
                    if (nivelRebose) {
                        this.alturaDinamicaTotal.nivelAguaTanque = parseFloat(nivelRebose.valor);
                    }

                    this.caudalImpulsion.volumenTE = event.detail.volumenCalculado ?
                        (parseFloat(event.detail.volumenCalculado) * 1000) : 0;

                    this.actualizarTodosLosModulos();
                }
            });

            document.addEventListener('maxima-demanda-simultanea-updated', (event) => {
                if (event.detail) {
                    this.caudalImpulsion.QMDS = event.detail.totals.qmdsTotal ?
                        (parseFloat(event.detail.totals.qmdsTotal)) : 0;
                    this.actualizarTodosLosModulos();
                }
            });

            document.addEventListener('caudal-actualizado', (event) => {
                this.actualizarTodosLosModulos();
            });
        },

        actualizarTodosLosModulos() {
            // Actualizar diámetros automáticamente
            this.perdidaCargaSuccion.actualizarDiametroSegunQimpul();
            this.perdidaCargaImpulsion.actualizarDiametroSegunQimpul();

            // Actualizar caudales en los módulos de pérdida de carga
            this.perdidaCargaSuccion.caudal = this.caudalImpulsion.qLlenado;
            this.perdidaCargaImpulsion.caudal = this.caudalImpulsion.qLlenado;

            // Notificar cambios
            this.perdidaCargaSuccion.actualizar();
            this.perdidaCargaImpulsion.actualizar();
        }
    }));
}
// Inicializar cuando el DOM esté listo
//document.addEventListener('DOMContentLoaded', initBombeoTanqueModule);