import { createApp } from 'vue';
import UHData from "./uh-componets.js";

export function initMaximaDemandaModule() {
    const maximademanda = document.getElementById('maximademanda-simultanea-content');
    if (!maximademanda) {
        console.error('Contenedor Red de Alimentacion no encontrado');
        return;
    }

    const MaximaDemandaComponent = {
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
                                    <h1 class="text-2xl font-bold text-slate-800">4. CALCULO DE LA MAXIMA DEMANDA SIMULTANEA</h1>
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
                    <!-- Configuración de Grados -->
                    <div class="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
                        <h2 class="text-base font-bold text-gray-800 mb-6 flex items-center">
                            <svg class="w-7 h-7 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                            </svg>
                            Configuración de Grados Educativos
                        </h2>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <template v-for="(gradeInfo, gradeKey) in gradeOptions" :key="gradeKey">
                                <label class="group cursor-pointer">
                                    <div class="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border-2 transition-all duration-300 hover:shadow-lg"
                                        :class="grades[gradeKey] ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md' : 'border-gray-200 hover:border-blue-300'">
                                        <div class="flex items-start space-x-4">
                                            <div class="flex-shrink-0 mt-1">
                                                <input
                                                    type="checkbox"
                                                    v-model="grades[gradeKey]"
                                                    @change="updateGrades()"
                                                    class="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 transition-colors">
                                            </div>
                                            <div class="flex-1">
                                                <div class="font-bold text-base text-gray-900" v-text="gradeInfo.name"></div>
                                                <div class="text-sm text-gray-600 mt-1" v-text="gradeInfo.description"></div>
                                                <div class="mt-2 text-xs font-medium text-blue-600" v-show="grades[gradeKey]">
                                                    ✓ Seleccionado
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </label>
                            </template>
                        </div>
                    </div>
                    <!-- Anexo-02 -->
                    <div class="bg-white rounded-2xl shadow-lg border border-gray-100 mb-4">
                        <div class="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-t-2xl p-2">
                            <div class="flex items-center justify-between">
                                <h2 class="text-base font-bold text-white flex items-center">
                                    <svg class="w-7 h-7 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                    </svg>
                                    Anexo-02
                                </h2>
                                <button
                                    v-show="mode === 'edit'"
                                    @click="addAnexo02Row()"
                                    class="bg-white text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors font-semibold shadow-md">
                                    + Agregar Aparato
                                </button>
                            </div>
                        </div>
                        <div class="p-6">
                            <div id="anexo02-table" class="rounded-lg overflow-hidden border border-gray-200"></div>
                        </div>
                    </div>
                    <!-- Tablas por Grado -->
                    <div v-show="hasSelectedGrades" class="space-y-8">
                        <h2 class="text-2xl font-bold text-gray-800 flex items-center">
                            <svg class="w-7 h-7 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                            </svg>
                            Cálculos por Grado Educativo
                        </h2>
                        <template v-for="grade in getSelectedGradesList" :key="grade">
                            <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                                <div class="bg-green-500 to-teal-600 p-2">
                                    <div class="flex items-center justify-between">
                                        <h3 class="text-base font-bold text-white flex items-center" v-text="'Cálculos para ' + gradeOptions[grade].name"></h3>
                                        <button
                                            v-show="mode === 'edit'"
                                            @click="addModule(grade)"
                                            class="bg-white text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors font-semibold shadow-md">
                                            + Agregar Módulo
                                        </button>
                                    </div>
                                </div>
                                <div class="p-6">
                                    <div :id="'grade-table-' + grade" class="rounded-lg overflow-hidden border border-gray-200"></div>
                                </div>
                            </div>
                        </template>
                        <!-- Tabla Exterior -->
                        <div class="bg-white rounded-2xl shadow-lg border border-gray-100 mb-4">
                            <div class="p-6">
                                <div id="exteriores-table" class="rounded-lg overflow-hidden border border-gray-200"></div>
                            </div>
                        </div>
                        <!-- Resultados Finales -->
                        <div class="bg-green-50 to-emerald-50 rounded-2xl shadow-xl border-2 border-green-200 p-2">
                            <h2 class="text-base font-bold text-center text-gray-800 mb-8 flex items-center justify-center">
                                <svg class="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                Resultados Finales
                            </h2>
                           
                            <!-- Resultados por Grado -->
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <template v-for="grade in getSelectedGradesList" :key="grade">
                                    <div class="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-100 hover:shadow-xl transition-shadow">
                                        <div class="text-center">
                                            <div class="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                                </svg>
                                            </div>
                                            <h4 class="text-base font-bold text-gray-700 mb-2" v-text="gradeOptions[grade].name"></h4>
                                            <div class="text-base font-extrabold text-green-600 mb-2" v-text="calculateGradeTotal(grade) + ' UD'"></div>
                                            <p class="text-sm text-gray-500">Total de Unidades</p>
                                        </div>
                                    </div>
                                </template>
                            </div>
                            <!-- Total General -->
                            <div class="bg-white rounded-2xl shadow-xl p-8 border-2 border-green-300">
                                <div class="text-center">
                                    <h3 class="text-2xl font-bold text-gray-800 mb-4">Total General de Unidades de Descarga</h3>
                                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
                                        <!-- Grupo 1: DEMANDA SIMULTÁNEA + Q MDS -->
                                        <div class="bg-white shadow rounded-2xl p-4 space-y-4">
                                            <div class="text-center text-sm text-gray-500 font-semibold">SISTEMA INTERIOR</div>
                                            <div class="flex flex-col items-center space-y-2">
                                                <div class="bg-green-500 to-emerald-600 rounded-xl px-6 py-4 text-white w-full text-center">
                                                    <div class="text-sm font-medium mb-1">MÁXIMA DEMANDA SIMULTÁNEA</div>
                                                    <div class="text-3xl font-extrabold" v-text="calculateOverallUDTotal()"></div>
                                                </div>
                                                <div class="text-2xl font-bold text-gray-400">=</div>
                                                <div class="bg-orange-500 to-yellow-500 rounded-xl px-6 py-4 text-white w-full text-center">
                                                    <div class="text-sm font-medium mb-1">Q MDS</div>
                                                    <div class="text-3xl font-extrabold" v-text="calculateMaximademandasimultaneaMDSTotal() + ' UD'"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <!-- Grupo 2: DEMANDA RIEGO + Q MDS RIEGO -->
                                        <div class="bg-white shadow rounded-2xl p-4 space-y-4">
                                            <div class="text-center text-sm text-gray-500 font-semibold">SISTEMA RIEGO</div>
                                            <div class="flex flex-col items-center space-y-2">
                                                <div class="bg-green-500 to-emerald-600 rounded-xl px-6 py-4 text-white w-full text-center">
                                                    <div class="text-sm font-medium mb-1">MÁXIMA DEMANDA SIMULTÁNEA RIEGO</div>
                                                    <div class="text-3xl font-extrabold" v-text="calculateExterioresTotal()"></div>
                                                </div>
                                                <div class="text-2xl font-bold text-gray-400">=</div>
                                                <div class="bg-green-500 to-emerald-600 rounded-xl px-6 py-4 text-white w-full text-center">
                                                    <div class="text-sm font-medium mb-1">Q MDS RIEGO</div>
                                                    <div class="text-3xl font-extrabold" v-text="calculateExteriorQMDSRIEGOTotal() + ' UD'"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <!-- Grupo 3: TOTAL GENERAL -->
                                        <div class="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl px-6 py-6 text-white flex flex-col justify-center items-center">
                                            <div class="text-sm font-medium mb-1">Q MDS TOTAL</div>
                                            <div class="text-4xl font-extrabold" v-text="calculatetotalQMDS()"></div>
                                            <div class="mt-2 text-xs text-indigo-100 italic">Q MDS + Q MDS RIEGO</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- Estado vacío -->
                    <div v-show="!hasSelectedGrades" class="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-lg">
                        <div class="max-w-md mx-auto">
                            <svg class="mx-auto h-16 w-16 text-gray-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                            </svg>
                            <h3 class="text-2xl font-bold text-gray-900 mb-3">Selecciona Grados Educativos</h3>
                            <p class="text-gray-600 mb-6">Para comenzar con los cálculos, selecciona al menos un grado educativo en la configuración superior.</p>
                            <button @click="grades.inicial = true; updateGrades()" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                                Seleccionar Inicial
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        `,
        data() {
            return {
                mode: 'view',
                gradeOptions: {
                    inicial: { name: 'INICIAL', description: 'Educación Inicial (3-5 años)' },
                    primaria: { name: 'PRIMARIA', description: 'Educación Primaria (6-11 años)' },
                    secundaria: { name: 'SECUNDARIA', description: 'Educación Secundaria (12-16 años)' }
                },
                grades: {
                    inicial: true,
                    primaria: false,
                    secundaria: false
                },
                anexo02Data: [
                    { id: Date.now() + 1, aparatoSanitario: 'Inodoro', tipo: 'Con Tanque - Descarga reducida', total: 2.5, afmax: 2.5, acmax: null },
                    { id: Date.now() + 2, aparatoSanitario: 'Inodoro', tipo: 'Con Tanque', total: 5, afmax: 5, acmax: null },
                    { id: Date.now() + 3, aparatoSanitario: 'Inodoro', tipo: 'C/ Válvula semiautomática y automática', total: 8, afmax: 8, acmax: null },
                    { id: Date.now() + 4, aparatoSanitario: 'Inodoro', tipo: 'C/ Válvula semiaut. y autom. descarga reducida', total: 4, afmax: 4, acmax: null },
                    { id: Date.now() + 5, aparatoSanitario: 'Lavatorio', tipo: 'Corriente', total: 2, afmax: 1.5, acmax: 1.5 },
                    { id: Date.now() + 6, aparatoSanitario: 'Lavatorio', tipo: 'Múltiple', total: 2, afmax: 1.5, acmax: 1.5 },
                    { id: Date.now() + 7, aparatoSanitario: 'Lavadero', tipo: 'Hotel restaurante', total: 4, afmax: 3, acmax: 3 },
                    { id: Date.now() + 8, aparatoSanitario: 'Lavadero', tipo: '-', total: 3, afmax: 2, acmax: 2 },
                    { id: Date.now() + 9, aparatoSanitario: 'Ducha', tipo: '-', total: 4, afmax: 3, acmax: 3 },
                    { id: Date.now() + 10, aparatoSanitario: 'Tina', tipo: '-', total: 6, afmax: 3, acmax: 3 },
                    { id: Date.now() + 11, aparatoSanitario: 'Urinario', tipo: 'Con Tanque', total: 3, afmax: 3, acmax: null },
                    { id: Date.now() + 12, aparatoSanitario: 'Urinario', tipo: 'C/ Válvula semiautomática y automática', total: 5, afmax: 5, acmax: null },
                    { id: Date.now() + 13, aparatoSanitario: 'Urinario', tipo: 'C/ Válvula semiaut. y autom. descarga reducida', total: 2.5, afmax: 2.5, acmax: null },
                    { id: Date.now() + 14, aparatoSanitario: 'Urinario', tipo: 'Múltiple', total: 3, afmax: 3, acmax: null },
                    { id: Date.now() + 15, aparatoSanitario: 'Bebedero', tipo: 'Simple', total: 1, afmax: 1, acmax: null },
                    { id: Date.now() + 16, aparatoSanitario: 'Bebedero', tipo: 'Múltiple (UG por cada salida)', total: 1, afmax: 1, acmax: null },
                ],
                exterioresData: {
                    inicial: {
                        nombre: 'AREA VERDE - INICIAL',
                        areaRiego: 491.6,
                        salidasRiego: 6,
                        caudalPorSalida: 0.23,
                        uh: 5.00,
                        uhTotal: 30.00
                    },
                    primaria: {
                        nombre: 'AREA VERDE - PRIMARIA',
                        areaRiego: 41.46,
                        salidasRiego: 2,
                        caudalPorSalida: 0.23,
                        uh: 5.00,
                        uhTotal: 10.00
                    },
                    secundaria: {
                        nombre: 'AREA VERDE - SECUNDARIA',
                        areaRiego: 200.0,
                        salidasRiego: 4,
                        caudalPorSalida: 0.23,
                        uh: 5.00,
                        uhTotal: 20.00
                    }
                },
                tables: {
                    inicial: { modules: [] },
                    primaria: { modules: [] },
                    secundaria: { modules: [] }
                },
                anexo02Table: null,
                exterioresTable: null,
                gradeTables: {},
                categoryMap: {
                    'inodoro': 'inodoro',
                    'urinario': 'urinario',
                    'lavatorio': 'lavatorio',
                    'lavadero': 'lavadero',
                    'lavadero_con_triturador': 'lavatorio',
                    'bebedero': 'lavatorio',
                    'ducha': 'ducha',
                    'tina': 'ducha'
                },
            };
        },
        computed: {
            udValues() {
                const values = {};
                this.anexo02Data.forEach(row => {
                    const normalizedKey = row.aparatoSanitario.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/_$/, '');
                    const categoryKey = this.categoryMap[normalizedKey] || normalizedKey;
                    const udValue = parseInt(row.total) || 0;
                    if (!values[categoryKey] || udValue > values[categoryKey]) {
                        values[categoryKey] = udValue;
                    }
                });
                return values;
            },
            extractedAccessories() {
                const categoriesData = {};
                this.anexo02Data.forEach(row => {
                    const normalizedKey = row.aparatoSanitario.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/_$/, '');
                    const categoryKey = this.categoryMap[normalizedKey] || normalizedKey;
                    if (!categoriesData[categoryKey]) {
                        categoriesData[categoryKey] = {
                            key: categoryKey,
                            label: categoryKey.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase()),
                            udValue: 0,
                            originalItemsCount: {},
                            totalCategoryCount: 0
                        };
                    }
                    if (categoriesData[categoryKey].originalItemsCount[row.aparatoSanitario]) {
                        categoriesData[categoryKey].originalItemsCount[row.aparatoSanitario]++;
                    } else {
                        categoriesData[categoryKey].originalItemsCount[row.aparatoSanitario] = 1;
                    }
                    categoriesData[categoryKey].totalCategoryCount++;
                });
                Object.keys(categoriesData).forEach(categoryKey => {
                    categoriesData[categoryKey].udValue = categoriesData[categoryKey].totalCategoryCount;
                });
                const result = Object.values(categoriesData);
                return result;
            },
            hasSelectedGrades() {
                return Object.values(this.grades).some(selected => selected);
            },
            getSelectedGradesList() {
                return Object.keys(this.grades).filter(grade => this.grades[grade]);
            },
        },
        methods: {
            async init() {
                console.log('Módulo UD inicializado');
                await this.loadTabulatorScript();
                this.setupEventListeners();
                this.initAnexo02Table();
                this.initExterioresTable();
                this.createTablesForGrades();
                this.sendDatamaxdemanUpdate();
            },
            loadTabulatorScript() {
                return new Promise((resolve) => {
                    const script = document.createElement('script');
                    script.src = 'https://unpkg.com/tabulator-tables@6.3.0/dist/js/tabulator.min.js';
                    script.onload = resolve;
                    document.head.appendChild(script);
                });
            },
            normalizeKey(text) {
                return text.toLowerCase()
                    .replace(/[áàäâã]/g, 'a')
                    .replace(/[éèëê]/g, 'e')
                    .replace(/[íìïî]/g, 'i')
                    .replace(/[óòöôõ]/g, 'o')
                    .replace(/[úùüû]/g, 'u')
                    .replace(/[ñ]/g, 'n')
                    .replace(/\s+/g, '_')
                    .replace(/[^a-z0-9_]/g, '');
            },
            toggleMode() {
                this.mode = this.mode === 'view' ? 'edit' : 'view';
                this.updateAllTables();
                this.updateExterioresTable();
            },
            updateGrades() {
                this.createTablesForGrades();
                this.updateExterioresTable();
                this.sendDatamaxdemanUpdate();
                let accesorios = this.extractedAccessories;
                if (!accesorios || accesorios.length === 0) {
                    accesorios = [{
                        key: 'default',
                        label: 'Accesorio Default',
                        udValue: 1,
                        totalCategoryCount: 1
                    }];
                }
                const accesoriosExportados = {
                    accesorios: accesorios,
                };
                const exportData = {
                    grades: this.grades,
                    tables: this.tables,
                    anexo02: this.anexo02Data,
                    exteriores: this.exterioresData,
                    totalUD: this.calculateOverallUDTotal() + this.calculateAnexo02Total()
                };
                document.dispatchEvent(new CustomEvent('grade-changed', {
                    detail: this.grades
                }));
                document.dispatchEvent(new CustomEvent('DOT-data-updated', {
                    detail: {
                        grades: this.grades,
                        tables: { ud: this.tables }
                    }
                }));
                document.dispatchEvent(new CustomEvent('uddesague-data-updated', {
                    detail: accesoriosExportados
                }));
                console.log('Grados actualizados desde UD:', this.grades);
            },
            initAnexo02Table() {
                const columns = [
                    {
                        title: 'Aparato Sanitario',
                        field: 'aparatoSanitario',
                        editor: this.mode === 'edit' ? 'input' : false,
                        cellEdited: (cell) => this.handleAnexo02CellEdit(cell),
                        width: 150
                    },
                    {
                        title: 'Tipo',
                        field: 'tipo',
                        editor: this.mode === 'edit' ? 'input' : false,
                        cellEdited: (cell) => this.handleAnexo02CellEdit(cell),
                    },
                    {
                        title: 'Total UD',
                        field: 'total',
                        bottomCalc: "sum",
                        editor: this.mode === 'edit' ? 'number' : false,
                        editorParams: { min: 0 },
                        formatter: 'number',
                        cellEdited: (cell) => this.handleAnexo02CellEdit(cell),
                        hozAlign: 'center'
                    },
                    {
                        title: 'AF',
                        field: 'afmax',
                        editor: this.mode === 'edit' ? 'input' : false,
                        cellEdited: (cell) => this.handleAnexo02CellEdit(cell),
                    },
                    {
                        title: 'AC',
                        field: 'acmax',
                        editor: this.mode === 'edit' ? 'input' : false,
                        cellEdited: (cell) => this.handleAnexo02CellEdit(cell),
                    },
                ];
                if (this.mode === 'edit') {
                    columns.push({
                        title: 'Acciones',
                        field: '',
                        formatter: () => '<button class="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600">Eliminar</button>',
                        cellClick: (e, cell) => this.removeAnexo02Row(cell.getRow().getData().id),
                        width: 100,
                        hozAlign: 'center'
                    });
                }
                this.anexo02Table = new Tabulator('#anexo02-table', {
                    data: this.anexo02Data,
                    layout: 'fitColumns',
                    columns: columns,
                });
            },
            handleAnexo02CellEdit(cell) {
                const rowData = cell.getRow().getData();
                const index = this.anexo02Data.findIndex(row => row.id === rowData.id);
                if (index !== -1) {
                    this.anexo02Data[index] = {
                        ...rowData,
                        total: parseInt(rowData.total) || 0
                    };
                    this.updateExtractedAccessories();
                    this.recalculateAllGradeTables();
                    this.updateGrades();
                }
                let accesorios = this.extractedAccessories;
                if (!accesorios || accesorios.length === 0) {
                    accesorios = [{
                        key: 'default',
                        label: 'Accesorio Default',
                        udValue: 1,
                        totalCategoryCount: 1
                    }];
                }
                const accesoriosExportados = { accesorios };
                document.dispatchEvent(new CustomEvent('uddesague-data-updated', {
                    detail: accesoriosExportados
                }));
            },
            addAnexo02Row() {
                const newRow = {
                    id: Date.now(),
                    aparatoSanitario: 'Nuevo Aparato',
                    tipo: 'Nuevo Tipo',
                    total: 1
                };
                this.anexo02Data.push(newRow);
                this.anexo02Table.addRow(newRow);
                this.updateExtractedAccessories();
                this.updateGrades();
                let accesorios = this.extractedAccessories;
                if (!accesorios || accesorios.length === 0) {
                    accesorios = [{
                        key: 'default',
                        label: 'Accesorio Default',
                        udValue: 1,
                        totalCategoryCount: 1
                    }];
                }
                const accesoriosExportados = { accesorios };
                document.dispatchEvent(new CustomEvent('uddesague-data-updated', {
                    detail: accesoriosExportados
                }));
            },
            removeAnexo02Row(id) {
                if (!confirm('¿Está seguro de eliminar este aparato sanitario?')) return;
                this.anexo02Data = this.anexo02Data.filter(row => row.id !== id);
                this.anexo02Table.setData(this.anexo02Data);
                this.updateExtractedAccessories();
                this.recalculateAllGradeTables();
                this.updateGrades();
                let accesorios = this.extractedAccessories;
                if (!accesorios || accesorios.length === 0) {
                    accesorios = [{
                        key: 'default',
                        label: 'Accesorio Default',
                        udValue: 1,
                        totalCategoryCount: 1
                    }];
                }
                const accesoriosExportados = { accesorios };
                document.dispatchEvent(new CustomEvent('uddesague-data-updated', {
                    detail: accesoriosExportados
                }));
            },
            calculateAnexo02Total() {
                return this.anexo02Data.reduce((sum, row) => sum + (parseInt(row.total) || 0), 0);
            },
            initExterioresTable() {
                const columns = [
                    {
                        title: 'EXTERIOR',
                        field: 'nombre',
                        editor: this.mode === 'edit' ? 'input' : false,
                        cellEdited: (cell) => this.handleExterioresCellEdit(cell),
                    },
                    {
                        title: 'AREA DE RIEGO',
                        field: 'areaRiego',
                        editor: this.mode === 'edit' ? 'number' : false,
                        editorParams: { min: 0, step: 0.01 },
                        formatter: 'number',
                        cellEdited: (cell) => this.handleExterioresCellEdit(cell),
                        hozAlign: 'center',
                    },
                    {
                        title: 'SALIDAS DE RIEGO',
                        field: 'salidasRiego',
                        editor: this.mode === 'edit' ? 'number' : false,
                        editorParams: { min: 0 },
                        editor: (cell) => {
                            const data = cell.getRow().getData();
                            return (data.grade === 'primaria' || data.grade === 'secundaria') ? false : 'number';
                        },
                        cellEdited: (cell) => this.handleExterioresCellEdit(cell),
                        hozAlign: 'center',
                    },
                    {
                        title: 'CAUDAL POR PUNTO DE SALIDA',
                        field: 'caudalPorSalida',
                        editor: this.mode === 'edit' ? 'number' : false,
                        editorParams: { min: 0, step: 0.01 },
                        formatter: 'number',
                        cellEdited: (cell) => this.handleExterioresCellEdit(cell),
                        hozAlign: 'center',
                    },
                    {
                        title: 'U.H.',
                        field: 'uh',
                        editor: this.mode === 'edit' ? 'number' : false,
                        editorParams: { min: 0, step: 0.01 },
                        formatter: 'number',
                        cellEdited: (cell) => this.handleExterioresCellEdit(cell),
                        hozAlign: 'center',
                    },
                    {
                        title: 'U.H. TOTAL',
                        field: 'uhTotal',
                        formatter: (cell) => {
                            const value = parseFloat(cell.getValue()) || 0;
                            return value.toFixed(2);
                        },
                        bottomCalc: (values, data, calcParams) => {
                            const total = values.reduce((sum, value) => sum + (parseFloat(value) || 0), 0);
                            return total.toFixed(2);
                        },
                        hozAlign: 'center',
                    }
                ];
                const tableData = this.generateExterioresTableData();
                if (tableData.length > 0) {
                    this.exterioresTable = new Tabulator('#exteriores-table', {
                        data: tableData,
                        layout: 'fitColumns',
                        columns: columns,
                        footerElement: '<div class="bg-gray-100 p-2 text-center font-bold text-sm">Total U.H. calculado automáticamente</div>',
                    });
                } else {
                    document.getElementById('exteriores-table').innerHTML = '<p class="text-center text-gray-500 p-4">Seleccione al menos un grado para mostrar áreas exteriores</p>';
                }
            },
            generateExterioresTableData() {
                const selectedGrades = this.getSelectedGradesList;
                const tableData = [];
                selectedGrades.forEach(grade => {
                    if (this.exterioresData[grade]) {
                        const data = {
                            ...this.exterioresData[grade],
                            grade: grade
                        };
                        data.uhTotal = (parseFloat(data.salidasRiego) || 0) * (parseFloat(data.uh) || 0);
                        tableData.push(data);
                    }
                });
                return tableData;
            },
            handleExterioresCellEdit(cell) {
                const row = cell.getRow();
                const rowData = row.getData();
                const field = cell.getField();
                const grade = rowData.grade;
                if (!this.exterioresData[grade]) return;
                this.exterioresData[grade][field] = rowData[field];
                if (grade === 'primaria' || grade === 'secundaria') {
                    if (field === 'areaRiego') {
                        const area = parseFloat(rowData.areaRiego) || 0;
                        const salidas = Math.ceil(area / 100) + 1;
                        rowData.salidasRiego = salidas;
                        this.exterioresData[grade].salidasRiego = salidas;
                        row.update({ salidasRiego: salidas });
                    }
                }
                if (field === 'uh') {
                    const uh = parseFloat(rowData.uh) || 0;
                    const caudal = this.buscarCaudalPorUH(uh);
                    rowData.caudalPorSalida = caudal;
                    this.exterioresData[grade].caudalPorSalida = caudal;
                    row.update({ caudalPorSalida: caudal });
                }
                const salidas = parseFloat(rowData.salidasRiego) || 0;
                const uh = parseFloat(rowData.uh) || 0;
                let uhTotal = salidas * uh;
                rowData.uhTotal = uhTotal;
                this.exterioresData[grade].uhTotal = uhTotal;
                row.update({ uhTotal });
                this.updateGrades();
            },
            buscarCaudalPorUH(uh) {
                const tablaGasto = {
                    1: 0.20,
                    2: 0.30,
                    3: 0.50,
                    4: 0.60,
                    5: 0.80
                };
                return tablaGasto[uh] || "";
            },
            updateExterioresTable() {
                if (this.exterioresTable) {
                    this.exterioresTable.destroy();
                    this.exterioresTable = null;
                }
                this.initExterioresTable();
            },
            updateExtractedAccessories() {
                Object.keys(this.tables).forEach(grade => {
                    if (!this.tables[grade] || !this.tables[grade].modules) return;
                    this.tables[grade].modules.forEach(module => {
                        module.details.forEach(detail => {
                            this.updateAccessoriesForItem(detail);
                            this.calculateRowUD(detail);
                        });
                        module.children.forEach(child => {
                            this.updateAccessoriesForItem(child);
                            this.calculateRowUD(child);
                            child.details.forEach(grandchild => {
                                this.updateAccessoriesForItem(grandchild);
                                this.calculateRowUD(grandchild);
                            });
                        });
                        this.calculateModuleTotal(module);
                    });
                });
            },
            updateAccessoriesForItem(item) {
                const currentAccessories = item.accessories || {};
                const newAccessories = {};
                this.extractedAccessories.forEach(acc => {
                    newAccessories[acc.key] = {
                        cantidad: currentAccessories[acc.key]?.cantidad !== undefined ? currentAccessories[acc.key].cantidad : 0,
                        uh: currentAccessories[acc.key]?.uh !== undefined ? currentAccessories[acc.key].uh : 0
                    };
                });
                item.accessories = newAccessories;
            },
            createTablesForGrades() {
                Object.keys(this.grades).forEach(grade => {
                    if (this.grades[grade]) {
                        if (!this.tables[grade]) {
                            this.tables[grade] = { modules: [] };
                        }
                        if (this.tables[grade].modules.length === 0) {
                            const initialModule = this.createEmptyModule(1);
                            this.tables[grade].modules.push(initialModule);
                        }
                    } else {
                        if (this.tables[grade]) {
                            this.tables[grade].modules = [];
                        }
                    }
                });
                this.updateAllTables();
            },
            updateAllTables() {
                if (this.anexo02Table) {
                    this.anexo02Table.destroy();
                    this.initAnexo02Table();
                }
                this.getSelectedGradesList.forEach(grade => {
                    if (this.gradeTables[grade]) {
                        this.gradeTables[grade].destroy();
                    }
                    this.initGradeTable(grade);
                });
            },
            initGradeTable(grade) {
                const columns = [
                    {
                        title: 'Acciones',
                        frozen: true,
                        width: 120,
                        formatter: (cell) => {
                            const data = cell.getRow().getData();
                            let buttons = '';
                            if (this.mode === 'edit') {
                                if (data.type === 'module') {
                                    buttons = `
                                        <button class="add-btn bg-blue-500 text-white px-1 py-1 rounded text-xs mr-1">➕</button>
                                        <button class="delete-btn bg-red-500 text-white px-1 py-1 rounded text-xs">🗑️</button>
                                    `;
                                } else if (data.type === 'child') {
                                    buttons = `
                                        <button class="add-btn bg-blue-500 text-white px-1 py-1 rounded text-xs mr-1">➕</button>
                                        <button class="delete-btn bg-red-500 text-white px-1 py-1 rounded text-xs">🗑️</button>
                                    `;
                                } else if (data.type === 'grandchild') {
                                    buttons = `
                                        <button class="delete-btn bg-red-500 text-white px-1 py-1 rounded text-xs">🗑️</button>
                                    `;
                                }
                            }
                            return buttons;
                        },
                        cellClick: (e, cell) => this.handleGradeButtonClick(grade, cell, e),
                        hozAlign: 'center'
                    },
                    {
                        title: 'MÓDULO',
                        field: 'name',
                        editor: this.mode === 'edit' ? 'input' : false,
                        cellEdited: (cell) => this.handleGradeCellEdit(grade, cell),
                    },
                    {
                        title: 'NIVEL',
                        field: 'nivel',
                        editor: this.mode === 'edit' ? 'input' : false,
                        cellEdited: (cell) => this.handleGradeCellEdit(grade, cell),
                    },
                    {
                        title: 'DESCRIPCIÓN',
                        field: 'descripcion',
                        editor: this.mode === 'edit' ? 'input' : false,
                        cellEdited: (cell) => this.handleGradeCellEdit(grade, cell),
                    }
                ];
                this.extractedAccessories.forEach(acc => {
                    columns.push({
                        title: `${acc.label}<br><small>(${acc.totalCategoryCount} U.D.)</small>`,
                        columns: [
                            {
                                title: '#',
                                field: `${acc.key}_cantidad`,
                                editor: this.mode === 'edit' ? 'number' : false,
                                editorParams: { min: 0 },
                                cellEdited: (cell) => this.handleGradeCellEdit(grade, cell),
                                hozAlign: 'center',
                                width: 70
                            },
                            {
                                title: 'UH',
                                field: `${acc.key}_uh`,
                                editor: this.mode === 'edit' ? 'number' : false,
                                editorParams: { min: 0, step: 0.1 },
                                formatter: 'number',
                                cellEdited: (cell) => this.handleGradeCellEdit(grade, cell),
                                hozAlign: 'center',
                                width: 70
                            }
                        ]
                    });
                });
                columns.push({
                    title: 'TOTAL U.D.',
                    field: 'udTotal',
                    formatter: (cell) => {
                        const value = parseFloat(cell.getValue()) || 0;
                        return `<strong>${value.toFixed(1)}</strong>`;
                    },
                    bottomCalc: (values, data, calcParams) => {
                        const total = values.reduce((sum, value) => sum + (parseFloat(value) || 0), 0);
                        return `${total.toFixed(1)}`;
                    },
                    width: 100,
                    hozAlign: 'center'
                });
                const dataTree = this.buildTableDataTree(grade);
                this.gradeTables[grade] = new Tabulator(`#grade-table-${grade}`, {
                    data: dataTree,
                    dataTree: true,
                    dataTreeStartExpanded: true,
                    layout: 'fitColumns',
                    columns: columns,
                });
            },
            buildTableDataTree(grade) {
                if (!this.tables[grade] || !this.tables[grade].modules) return [];
                return this.tables[grade].modules.map(module => {
                    const moduleRow = {
                        id: module.id,
                        type: 'module',
                        name: module.name,
                        nivel: '',
                        descripcion: 'Módulo Principal',
                        udTotal: this.calculateModuleTotal(module),
                        _children: []
                    };
                    this.extractedAccessories.forEach(acc => {
                        moduleRow[`${acc.key}_cantidad`] = '';
                        moduleRow[`${acc.key}_uh`] = '';
                    });
                    const allChildren = [
                        ...module.details.map(detail => this.mapItemToTableRow(detail, 'child')),
                        ...module.children.map(child => ({
                            ...this.mapItemToTableRow(child, 'child'),
                            _children: child.details.map(grandchild => this.mapItemToTableRow(grandchild, 'grandchild'))
                        }))
                    ];
                    moduleRow._children = allChildren;
                    return moduleRow;
                });
            },
            mapItemToTableRow(item, type) {
                const row = {
                    id: item.id,
                    type: type,
                    name: '',
                    nivel: item.nivel || '',
                    descripcion: item.descripcion || '',
                    udTotal: item.udTotal || 0
                };
                this.extractedAccessories.forEach(acc => {
                    const accData = item.accessories?.[acc.key];
                    row[`${acc.key}_cantidad`] = accData?.cantidad || 0;
                    row[`${acc.key}_uh`] = accData?.uh || 0;
                });
                return row;
            },
            isBaseNumber(value) {
                return typeof value === 'number' && !isNaN(value) && isFinite(value);
            },
            calculateRowUD(item) {
                let totalUD = 0;
                this.extractedAccessories.forEach(accessory => {
                    const cantidad = item.accessories?.[accessory.key]?.cantidad ? parseFloat(item.accessories[accessory.key].cantidad) : 0;
                    const uh = item.accessories?.[accessory.key]?.uh ? parseFloat(item.accessories[accessory.key].uh) : 0;
                    totalUD += cantidad * uh;
                });
                item.udTotal = this.isBaseNumber(totalUD) ? totalUD : 0;
                return item.udTotal;
            },
            calculateModuleTotal(module) {
                let totalUD = 0;
                if (module.details) {
                    totalUD += module.details.reduce((sum, detail) => {
                        this.calculateRowUD(detail);
                        return sum + (detail.udTotal || 0);
                    }, 0);
                }
                if (module.children) {
                    totalUD += module.children.reduce((sum, child) => {
                        this.calculateRowUD(child);
                        let childTotal = child.udTotal || 0;
                        if (child.details) {
                            childTotal += child.details.reduce((childSum, grandchild) => {
                                this.calculateRowUD(grandchild);
                                return childSum + (grandchild.udTotal || 0);
                            }, 0);
                        }
                        return sum + childTotal;
                    }, 0);
                }
                module.totalUD = this.isBaseNumber(totalUD) ? totalUD : 0;
                return module.totalUD;
            },
            calculateGradeTotal(grade) {
                if (!this.tables[grade] || !this.tables[grade].modules) return 0;
                return this.tables[grade].modules.reduce((sum, module) => {
                    return sum + this.calculateModuleTotal(module);
                }, 0);
            },
            calculateOverallUDTotal() {
                return this.getSelectedGradesList.reduce((sum, grade) => {
                    return sum + this.calculateGradeTotal(grade);
                }, 0);
            },
            calculateExterioresTotal() {
                const selectedGrades = this.getSelectedGradesList;
                const total = selectedGrades.reduce((sum, grade) => {
                    if (this.exterioresData[grade]) {
                        return sum + (parseFloat(this.exterioresData[grade].uhTotal) || 0);
                    }
                    return sum;
                }, 0);
                return total;
            },
            getTankFlow(units) {
                const entry = UHData.find(item => item.units === units);
                return entry ? entry.tankFlow : null;
            },
            calculateMaximademandasimultaneaMDSTotal() {
                const totalgrades = this.calculateOverallUDTotal();
                const tankFlow = this.getTankFlow(totalgrades);
                return tankFlow ? `${tankFlow.toFixed(2)} L/s` : '0.00 L/s';
            },
            calculateExteriorQMDSRIEGOTotal() {
                const totalexteriores = this.calculateExterioresTotal();
                const tankFlow = this.getTankFlow(totalexteriores);
                return tankFlow ? `${tankFlow.toFixed(2)} L/s` : '0.00 L/s';
            },
            calculatetotalQMDS() {
                const mdsFlow = parseFloat(this.calculateMaximademandasimultaneaMDSTotal().replace(' L/s', '')) || 0;
                const exteriorFlow = parseFloat(this.calculateExteriorQMDSRIEGOTotal().replace(' L/s', '')) || 0;
                const totalFlow = mdsFlow + exteriorFlow;
                return `${totalFlow.toFixed(2)} L/s`;
            },
            handleGradeButtonClick(grade, cell, e) {
                const row = cell.getRow();
                const data = row.getData();
                if (e.target.classList.contains('add-btn')) {
                    this.addNewRow(grade, row);
                } else if (e.target.classList.contains('delete-btn')) {
                    this.deleteRow(grade, row);
                }
            },
            handleGradeCellEdit(grade, cell) {
                const rowData = cell.getRow().getData();
                const field = cell.getField();
                const module = this.tables[grade].modules.find(m =>
                    m.id === rowData.id ||
                    m.details.some(d => d.id === rowData.id) ||
                    m.children.some(c => c.id === rowData.id || c.details.some(gc => gc.id === rowData.id))
                );
                if (!module) return;
                let target = null;
                if (rowData.type === 'module') {
                    target = module;
                    target.name = rowData.name;
                } else {
                    target = this.findTargetItem(module, rowData);
                    if (target) {
                        if (field.endsWith('_cantidad') || field.endsWith('_uh')) {
                            const accKey = field.replace(/_(cantidad|uh)$/, '');
                            if (!target.accessories) {
                                target.accessories = {};
                            }
                            if (!target.accessories[accKey]) {
                                target.accessories[accKey] = { cantidad: 0, uh: 0 };
                            }
                            if (field.endsWith('_cantidad')) {
                                target.accessories[accKey].cantidad = parseFloat(rowData[field]) || 0;
                            } else {
                                target.accessories[accKey].uh = parseFloat(rowData[field]) || 0;
                            }
                            this.calculateRowUD(target);
                        } else {
                            target.nivel = rowData.nivel || target.nivel;
                            target.descripcion = rowData.descripcion || target.descripcion;
                        }
                    }
                }
                this.calculateModuleTotal(module);
                this.updateSingleTableRow(grade, cell.getRow());
                this.updateGrades();
            },
            updateSingleTableRow(grade, row) {
                if (!this.gradeTables[grade]) return;
                const rowData = row.getData();
                const module = this.tables[grade].modules.find(m =>
                    m.id === rowData.id ||
                    m.details.some(d => d.id === rowData.id) ||
                    m.children.some(c => c.id === rowData.id || c.details.some(gc => gc.id === rowData.id))
                );
                if (!module) return;
                let target = null;
                if (rowData.type === 'module') {
                    target = module;
                } else {
                    target = this.findTargetItem(module, rowData);
                }
                if (target) {
                    row.update({ udTotal: target.udTotal });
                    const updates = {};
                    this.extractedAccessories.forEach(acc => {
                        const accData = target.accessories?.[acc.key];
                        if (accData) {
                            updates[`${acc.key}_cantidad`] = accData.cantidad || 0;
                            updates[`${acc.key}_uh`] = accData.uh || 0;
                        }
                    });
                    if (Object.keys(updates).length > 0) {
                        row.update(updates);
                    }
                }
            },
            findTargetItem(module, rowData) {
                let target = module.details.find(d => d.id === rowData.id);
                if (target) return target;
                target = module.children.find(c => c.id === rowData.id);
                if (target) return target;
                for (let child of module.children) {
                    target = child.details.find(gc => gc.id === rowData.id);
                    if (target) return target;
                }
                return null;
            },
            updateTableRow(grade, id) {
                if (!this.gradeTables[grade]) return;
                const dataTree = this.buildTableDataTree(grade);
                this.gradeTables[grade].setData(dataTree);
                this.updateGrades();
            },
            addNewRow(grade, row) {
                const rowData = row.getData();
                const module = this.tables[grade].modules.find(m =>
                    m.id === rowData.id ||
                    m.details.some(d => d.id === rowData.id) ||
                    m.children.some(c => c.id === rowData.id || c.details.some(gc => gc.id === rowData.id))
                );
                if (!module) return;
                if (rowData.type === 'module') {
                    const newChild = this.createEmptyChild();
                    module.children.push(newChild);
                    this.calculateRowUD(newChild);
                } else if (rowData.type === 'child' && rowData._children && rowData._children.length > 0) {
                    const child = module.children.find(c => c.id === rowData.id);
                    if (child) {
                        const newGrandchild = this.createEmptyGrandchild();
                        child.details.push(newGrandchild);
                        this.calculateRowUD(newGrandchild);
                    }
                } else if (rowData.type === 'child') {
                    const newDetail = this.createEmptyDetail();
                    module.details.push(newDetail);
                    this.calculateRowUD(newDetail);
                }
                this.calculateModuleTotal(module);
                this.updateTableRow(grade, module.id);
            },
            deleteRow(grade, row) {
                if (!confirm('¿Está seguro de eliminar esta fila?')) return;
                const rowData = row.getData();
                const module = this.tables[grade].modules.find(m =>
                    m.id === rowData.id ||
                    m.details.some(d => d.id === rowData.id) ||
                    m.children.some(c => c.id === rowData.id || c.details.some(gc => gc.id === rowData.id))
                );
                if (!module) return;
                if (rowData.type === 'module') {
                    this.tables[grade].modules = this.tables[grade].modules.filter(m => m.id !== rowData.id);
                } else if (rowData.type === 'child') {
                    if (module.details.some(d => d.id === rowData.id)) {
                        module.details = module.details.filter(d => d.id !== rowData.id);
                    } else {
                        module.children = module.children.filter(c => c.id !== rowData.id);
                    }
                } else if (rowData.type === 'grandchild') {
                    const parent = module.children.find(c => c.details.some(gc => gc.id === rowData.id));
                    if (parent) {
                        parent.details = parent.details.filter(gc => gc.id !== rowData.id);
                    }
                }
                this.calculateModuleTotal(module);
                this.updateTableRow(grade, module.id);
            },
            createEmptyDetail() {
                const accessories = {};
                const uhPorAccesorio = {
                    inodoro: 5,
                    urinario: 3,
                    lavatorio: 2,
                    lavadero: 3,
                    ducha: 4
                };
                this.extractedAccessories.forEach(acc => {
                    accessories[acc.key] = {
                        cantidad: 0,
                        uh: uhPorAccesorio[acc.key] || 0
                    };
                });
                return {
                    id: Date.now() + Math.random(),
                    type: 'child',
                    nivel: 'NIVEL',
                    descripcion: 'Descripción del Nivel/Aula',
                    accessories: accessories,
                    udTotal: 0
                };
            },
            createEmptyChild() {
                const accessories = {};
                this.extractedAccessories.forEach(acc => {
                    accessories[acc.key] = {
                        cantidad: 0,
                        uh: 0
                    };
                });
                return {
                    id: Date.now() + Math.random(),
                    type: 'child',
                    nivel: 'SUB-NIVEL',
                    descripcion: 'Descripción del Sub-Nivel',
                    accessories: accessories,
                    udTotal: 0,
                    details: []
                };
            },
            createEmptyGrandchild() {
                const accessories = {};
                this.extractedAccessories.forEach(acc => {
                    accessories[acc.key] = {
                        cantidad: 0,
                        uh: 0
                    };
                });
                return {
                    id: Date.now() + Math.random(),
                    type: 'grandchild',
                    descripcion: 'Descripción del Detalle',
                    accessories: accessories,
                    udTotal: 0
                };
            },
            createEmptyModule(moduleNumber) {
                const newModule = {
                    id: Date.now() + Math.random(),
                    type: 'module',
                    name: `MÓDULO ${moduleNumber}`,
                    details: [],
                    children: [],
                    totalUD: 0
                };
                const initialDetail = this.createEmptyDetail();
                newModule.details.push(initialDetail);
                this.calculateRowUD(initialDetail);
                this.calculateModuleTotal(newModule);
                return newModule;
            },
            addModule(grade) {
                const newModule = this.createEmptyModule(this.tables[grade].modules.length + 1);
                this.tables[grade].modules.push(newModule);
                this.updateTableRow(grade, newModule.id);
            },
            sendDatamaxdemanUpdate() {
                const totalUDPorGrado = {};
                this.getSelectedGradesList.forEach(grade => {
                    totalUDPorGrado[grade] = this.calculateGradeTotal(grade);
                });
                const data = {
                    grades: this.grades,
                    tables: this.tables,
                    exterioresData: this.exterioresData,
                    totals: {
                        sistemasInterior: {
                            maximaDemandaSimultanea: this.calculateOverallUDTotal(),
                            qmds: this.calculateMaximademandasimultaneaMDSTotal()
                        },
                        sistemaRiego: {
                            maximaDemandaSimultaneaRiego: this.calculateExterioresTotal(),
                            qmdsRiego: this.calculateExteriorQMDSRIEGOTotal()
                        },
                        qmdsTotal: this.calculatetotalQMDS(),
                        totalUDPorGrado
                    }
                };
                document.dispatchEvent(new CustomEvent('maxima-demanda-simultanea-updated', {
                    detail: data
                }));
            },
            setupEventListeners() {
                // Implementa aquí cualquier listener de eventos si es necesario
            },
            recalculateAllGradeTables() {
                this.getSelectedGradesList.forEach(grade => {
                    this.tables[grade].modules.forEach(module => {
                        this.calculateModuleTotal(module);
                    });
                });
            },
            updateDetailUD(module, detail) {
                let totalUD = 0;
                this.extractedAccessories.forEach(accessory => {
                    const quantity = parseFloat(detail.accessories[accessory.key]) || 0;
                    const udValueForCalculation = accessory.udValue;
                    totalUD += quantity * udValueForCalculation;
                });
                detail.udTotal = totalUD;
                this.updateModuleTotalUD(module);
            },
            updateModuleTotalUD(module) {
                // Esta función parece no usarse directamente, pero si es necesaria, impleméntala
            },
        },
        mounted() {
            this.init();
        }
    };

    createApp(MaximaDemandaComponent).mount(maximademanda);
}