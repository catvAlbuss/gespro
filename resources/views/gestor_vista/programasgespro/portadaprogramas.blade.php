<x-app-layout>
    <div id="appProgramas" data-module="programasgespro/cotizador" class="font-sans antialiased">
        {{-- ======================= SCRIPTS & STYLES ======================= --}}
        <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
        <script src="https://cdn.tailwindcss.com/"></script>
        <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>

        {{-- ======================= MAIN CONTENT ======================= --}}
        <div class="py-8">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <!-- Page Title -->
                <div class="mb-8">
                    <h2 class="text-3xl font-bold text-gray-900 dark:text-white">
                        Cotizador de Proyectos
                    </h2>
                    <p class="mt-2 text-gray-600 dark:text-gray-400">
                        Genera cotizaciones para elaboración de planos y ejecución de obra
                    </p>
                </div>

                <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <!-- Formulario de Datos -->
                    <div class="xl:col-span-1">
                        <div
                            class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                            <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                                <h3 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                                    <svg class="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Datos del Proyecto
                                </h3>
                            </div>

                            <div class="p-6 space-y-6">
                                <!-- Área -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Área (A)
                                    </label>
                                    <div class="relative">
                                        <input v-model.number="proyecto.area" type="number" min="0"
                                            step="any"
                                            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="100">
                                        <span
                                            class="absolute right-3 top-3 text-gray-500 dark:text-gray-400 text-sm">m²</span>
                                    </div>
                                </div>

                                <!-- Número de Pisos -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Número de Pisos (Np)
                                    </label>
                                    <div class="relative">
                                        <input v-model.number="proyecto.pisos" type="number" min="1"
                                            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="5">
                                        <span
                                            class="absolute right-3 top-3 text-gray-500 dark:text-gray-400 text-sm">pisos</span>
                                    </div>
                                </div>

                                <!-- Tipo de Uso -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Tipo de Uso (U)
                                    </label>
                                    <select v-model.number="proyecto.categoria"
                                        class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                        <option value="1">Vivienda Unifamiliar</option>
                                        <option value="1.2">Multifamiliar</option>
                                        <option value="1.22">Hotel/Oficinas</option>
                                        <option value="1.5">Clínica</option>
                                        <option value="1.3">Colegio</option>
                                        <option value="1.4">Centro comercial</option>
                                        <option value="1.2">Almacén</option>
                                    </select>
                                </div>

                                <!-- Servicios Adicionales -->
                                <div class="space-y-4">
                                    <h4 class="text-lg font-medium text-gray-900 dark:text-white">Servicios Adicionales
                                    </h4>

                                    <div class="space-y-3">
                                        <label
                                            class="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                                            <div class="flex items-center">
                                                <input v-model="proyecto.gestionLicencia" type="checkbox"
                                                    class="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500">
                                                <div class="ml-3">
                                                    <span
                                                        class="text-sm font-medium text-gray-900 dark:text-white">Gestión
                                                        de licencia</span>
                                                    <p class="text-xs text-gray-500 dark:text-gray-400">Tramitación de
                                                        permisos</p>
                                                </div>
                                            </div>
                                            <span class="text-sm text-green-600 dark:text-green-400 font-medium">S/.
                                                2,000</span>
                                        </label>

                                        <label
                                            class="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                                            <div class="flex items-center">
                                                <input v-model="proyecto.estudioSuelos" type="checkbox"
                                                    class="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500">
                                                <div class="ml-3">
                                                    <span
                                                        class="text-sm font-medium text-gray-900 dark:text-white">Estudio
                                                        de suelos</span>
                                                    <p class="text-xs text-gray-500 dark:text-gray-400">Análisis de
                                                        mecánica de suelos</p>
                                                </div>
                                            </div>
                                            <span class="text-sm text-green-600 dark:text-green-400 font-medium">S/.
                                                1,200</span>
                                        </label>

                                        <label
                                            class="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                                            <div class="flex items-center">
                                                <input v-model="proyecto.igv" type="checkbox"
                                                    class="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500">
                                                <div class="ml-3">
                                                    <span
                                                        class="text-sm font-medium text-gray-900 dark:text-white">Incluir
                                                        IGV</span>
                                                    <p class="text-xs text-gray-500 dark:text-gray-400">18% de impuesto
                                                    </p>
                                                </div>
                                            </div>
                                            <span
                                                class="text-sm text-blue-600 dark:text-blue-400 font-medium">18%</span>
                                        </label>
                                    </div>
                                </div>

                                <!-- Botón Calcular -->
                                <button @click="calcular"
                                    class="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transform transition duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                                    <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    Generar Cotización
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Resultados -->
                    <!-- Cotización Planos -->
                    <div
                        class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                                <svg class="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Elaboración de Planos
                            </h3>
                            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Cotización referencial para el
                                desarrollo de documentos técnicos</p>
                        </div>

                        <div class="p-6">
                            <!-- Tabla de cotización planos -->
                            <div class="overflow-x-auto">
                                <table class="w-full text-sm">
                                    <thead class="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th class="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">
                                                Especialidad</th>
                                            <th class="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                                                Precio</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-200 dark:divide-gray-600">
                                        <tr v-for="item in cotizacionPlanos.items" :key="item.nombre"
                                            class="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td class="px-4 py-3 text-gray-900 dark:text-white">@{{ item.nombre }}
                                            </td>
                                            <td class="px-4 py-3 text-right text-gray-900 dark:text-white">S/.
                                                @{{ item.precio.toFixed(2) }}</td>
                                        </tr>
                                        <tr class="bg-blue-50 dark:bg-blue-900/20 font-semibold">
                                            <td class="px-4 py-4 text-gray-900 dark:text-white">TOTAL</td>
                                            <td class="px-4 py-4 text-right text-blue-600 dark:text-blue-400 text-lg">
                                                S/. @{{ cotizacionPlanos.total.toFixed(2) }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <!-- Cotización Obra -->
                    <div
                        class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                                <svg class="w-6 h-6 mr-2 text-orange-600" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                Ejecución de Obra
                            </h3>
                            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Cotización referencial para la
                                construcción del proyecto</p>
                        </div>

                        <div class="p-6">
                            <!-- Tabla de cotización obra -->
                            <div class="overflow-x-auto">
                                <table class="w-full text-sm">
                                    <thead class="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th class="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">
                                                Especialidad</th>
                                            <th class="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                                                Precio</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-200 dark:divide-gray-600">
                                        <tr v-for="item in cotizacionObra.items" :key="item.nombre"
                                            class="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td class="px-4 py-3 text-gray-900 dark:text-white">@{{ item.nombre }}
                                            </td>
                                            <td class="px-4 py-3 text-right text-gray-900 dark:text-white">S/.
                                                @{{ item.precio.toFixed(2) }}</td>
                                        </tr>
                                        <tr class="bg-orange-50 dark:bg-orange-900/20 font-semibold">
                                            <td class="px-4 py-4 text-gray-900 dark:text-white">TOTAL</td>
                                            <td
                                                class="px-4 py-4 text-right text-orange-600 dark:text-orange-400 text-lg">
                                                S/. @{{ cotizacionObra.total.toFixed(2) }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div class="xl:col-span-3 space-y-8">
                        <!-- Información de contacto -->
                        <div class="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg text-white p-6">
                            <div class="text-center">
                                <h3 class="text-xl font-bold mb-2">¿Necesita una cotización personalizada?</h3>
                                <p class="mb-4 opacity-90">Nuestro equipo de especialistas está listo para atenderlo
                                </p>
                                <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <a href="tel:953992277"
                                        class="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-200 flex items-center">
                                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        953 992 277
                                    </a>
                                    <span class="text-white/80">Asesoría inmediata y sin compromiso</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <script>
            window.APP_INIT = {
                empresaId: @json($empresaId),
            }
        </script>
    </div>
</x-app-layout>
