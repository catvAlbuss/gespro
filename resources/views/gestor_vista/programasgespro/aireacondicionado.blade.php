<x-app-layout>
    <!-- CSS Libraries -->
    <link href="https://unpkg.com/tabulator-tables@6.3.1/dist/css/tabulator.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
        integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg=="
        crossorigin="anonymous" referrerpolicy="no-referrer" />

    <!-- JavaScript Libraries (sin Alpine.js ya que se carga en app.js) -->
    <script type="text/javascript" src="https://unpkg.com/tabulator-tables@6.3.1/dist/js/tabulator.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/echarts@5.5.0/dist/echarts.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.3.0/exceljs.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/exceljs/dist/exceljs.min.js"></script>

    <div x-data="acCalculatorApp()" x-init="init()" class="w-full mx-auto px-4 py-2">
        <!-- Header -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z">
                            </path>
                        </svg>
                    </div>
                    <div>
                        <h1 class="text-2xl font-bold text-gray-800">Calculadora Aire Acondicionado</h1>
                        <p class="text-gray-600">Sistema profesional de cálculo de carga térmica</p>
                    </div>
                </div>
                <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button @click="exportToExcel()"
                        class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        Exportar Excel
                    </button>
                    <button @click="resetAll()"
                        class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        Reiniciar
                    </button>
                    <button @click="showSummary = !showSummary"
                        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Resumen
                    </button>
                </div>
            </div>

            <!-- Climate Type Selector -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Clima</label>
                    <select x-model="climateType" @change="updateClimateSettings($event)"
                        class="w-full appearance-none bg-white border-2 border-gray-200 rounded-xl px-4 py-3 pr-10 text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 font-medium">
                        <option value="F">❄️ Frío - 500 BTU/m²</option>
                        <option value="T">🌤️ Templado - 550 BTU/m²</option>
                        <option value="C">☀️ Caliente - 600 BTU/m²</option>
                        <option value="MC">🔥 Muy Caliente - 650 BTU/m²</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Agregar Hojas</label>
                    <div class="flex space-x-2">
                        <input type="number" x-model="newSheetsCount" min="1" max="10"
                            class="w-full appearance-none bg-white border-2 border-gray-200 rounded-xl px-4 py-3 pr-10 text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 font-medium">
                        <button @click="addSheets()"
                            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                            +
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Error Display -->
        <div x-show="error" x-transition class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <span x-text="error"></span>
        </div>

        <!-- Success Display -->
        <div x-show="success" x-transition
            class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <span x-text="success"></span>
        </div>

        <!-- Summary Modal -->
        <div x-show="showSummary" x-transition:enter="transition ease-out duration-300"
            x-transition:enter-start="opacity-0" x-transition:enter-end="opacity-100"
            x-transition:leave="transition ease-in duration-200" x-transition:leave-start="opacity-100"
            x-transition:leave-end="opacity-0"
            class="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-lg max-w-4xl w-full max-h-96 overflow-y-auto">
                <div class="p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold">Resumen General</h3>
                        <button @click="showSummary = false" class="text-gray-400 hover:text-gray-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="bg-blue-50 p-4 rounded-lg">
                            <h4 class="font-semibold text-blue-800">Total Carga Térmica</h4>
                            <p class="text-2xl font-bold text-blue-600" x-text="getTotalThermalLoad() + ' BTU'"></p>
                        </div>
                        <div class="bg-green-50 p-4 rounded-lg">
                            <h4 class="font-semibold text-green-800">Total AC Requerido</h4>
                            <p class="text-2xl font-bold text-green-600" x-text="getTotalACRequired() + ' BTU'"></p>
                        </div>
                        <div class="bg-yellow-50 p-4 rounded-lg">
                            <h4 class="font-semibold text-yellow-800">Hojas Activas</h4>
                            <p class="text-2xl font-bold text-yellow-600" x-text="sheets.length"></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Tables Container -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <template x-for="(sheet, index) in sheets" :key="sheet.id">
                <div class="bg-white rounded-lg shadow-lg overflow-hidden">
                    <!-- Sheet Header -->
                    <div class="bg-blue-600 text-white p-4 flex justify-between items-center">
                        <div>
                            <h3 class="font-semibold" x-text="sheet.name"></h3>
                            <p class="text-sm opacity-90" x-text="'Área: ' + sheet.area + ' m²'"></p>
                        </div>
                        <div class="flex space-x-2">
                            <button @click="editSheetName(index)" class="p-2 hover:bg-blue-700 rounded">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z">
                                    </path>
                                </svg>
                            </button>
                            <button @click="removeSheet(index)" class="p-2 hover:bg-red-600 rounded">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                                    </path>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Sheet Content -->
                    <div class="p-4">
                        <!-- Area Input -->
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Área (m²)</label>
                            <input type="number" x-model="sheet.area" @input="updateSheetCalculations(index)"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Ingrese el área">
                        </div>

                        <!-- Thermal Load Section -->
                        <div class="mb-6">
                            <div class="flex justify-between items-center mb-3">
                                <h4 class="font-semibold text-gray-800">Carga Térmica</h4>
                                <button @click="addThermalLoadRow(index)"
                                    class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors">
                                    + Agregar
                                </button>
                            </div>
                            <div class="space-y-2">
                                <template x-for="(item, itemIndex) in sheet.thermalLoad" :key="item.id">
                                    <div class="flex items-center space-x-2 bg-gray-50 p-2 rounded">
                                        <input type="text" x-model="item.description" placeholder="Descripción"
                                            class="flex-1 px-2 py-1 border border-gray-300 rounded text-sm">
                                        <input type="number" x-model="item.btu"
                                            @input="updateSheetCalculations(index)" placeholder="BTU/UND"
                                            class="w-20 px-2 py-1 border border-gray-300 rounded text-sm">
                                        <input type="number" x-model="item.quantity"
                                            @input="updateSheetCalculations(index)" placeholder="Cant."
                                            class="w-16 px-2 py-1 border border-gray-300 rounded text-sm">
                                        <span class="w-20 text-sm font-medium"
                                            x-text="(item.btu * item.quantity) || 0"></span>
                                        <button @click="removeThermalLoadRow(index, itemIndex)"
                                            class="p-1 text-red-600 hover:bg-red-100 rounded">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor"
                                                viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M6 18L18 6M6 6l12 12"></path>
                                            </svg>
                                        </button>
                                    </div>
                                </template>
                            </div>
                        </div>

                        <!-- Results -->
                        <div class="border-t pt-4 space-y-2">
                            <div class="flex justify-between text-sm">
                                <span>Carga por área:</span>
                                <span x-text="getAreaLoad(sheet) + ' BTU'"></span>
                            </div>
                            <div class="flex justify-between text-sm">
                                <span>Carga térmica total:</span>
                                <span x-text="getThermalLoadTotal(sheet) + ' BTU'"></span>
                            </div>
                            <div class="flex justify-between text-sm">
                                <span>Capacidad total AC:</span>
                                <span x-text="getACTotal(sheet) + ' BTU'"></span>
                            </div>
                            <div class="flex justify-between font-semibold text-lg border-t pt-2"
                                :class="getSheetTotal(sheet) >= 0 ? 'text-green-600' : 'text-red-600'">
                                <span>Balance:</span>
                                <span x-text="getSheetTotal(sheet) + ' BTU'"></span>
                            </div>
                            <!-- AC Type Section -->
                            <div class="mb-4">
                                <div class="space-y-2">
                                    <template x-for="(ac, acIndex) in sheet.acTypes" :key="ac.id">
                                        <div class="flex items-center space-x-2 bg-blue-50 p-2 rounded">
                                            <label class="block text-xs font-medium text-gray-700 mb-2">TIPO DE AIRE
                                                ACONDICIONADO</label>
                                            <select x-model="ac.btu" @change="updateSheetCalculations(index)"
                                                class="w-full appearance-none text-xs bg-white border-2 border-gray-200 rounded-xl px-4 py-2 pr-10 text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 font-medium">
                                                <option value="9000">9000 BTU</option>
                                                <option value="12000">12000 BTU</option>
                                                <option value="15000">15000 BTU</option>
                                                <option value="18000">18000 BTU</option>
                                                <option value="24000">24000 BTU</option>
                                                <option value="36000">36000 BTU</option>
                                                <option value="60000">60000 BTU/m²</option>
                                            </select>
                                        </div>
                                    </template>
                                </div>
                            </div>

                            <div class="flex justify-between text-sm">
                                <span>Cantidad de Aire ACONDICIONADO:</span>
                                <span
                                    x-text="Math.ceil(((getSheetTotal(sheet) + getThermalLoadTotal(sheet)) / getACTotal(sheet)) || 0)"></span>
                            </div>

                        </div>
                    </div>
                </div>
            </template>
        </div>

        <!-- Add New Sheet Button -->
        <div class="mt-6 text-center" x-show="sheets.length === 0">
            <button @click="addSheet()"
                class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Agregar Primera Hoja de Cálculo
            </button>
        </div>
    </div>

</x-app-layout>
