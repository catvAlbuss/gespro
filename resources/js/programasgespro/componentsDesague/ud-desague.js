export function initUDModule() {
    console.log('Inicializando módulo UD');

    const udContent = document.getElementById('ud-content');

    if (!udContent) {
        console.error('Contenedor UD no encontrado');
        return;
    }

    // Incluir Tabulator CSS y JS desde CDN
    const tabulatorCss = document.createElement('link');
    tabulatorCss.rel = 'stylesheet';
    tabulatorCss.href = 'https://unpkg.com/tabulator-tables@6.3.0/dist/css/tabulator.min.css';
    document.head.appendChild(tabulatorCss);

    udContent.innerHTML = `
        <div x-data="udModule" class="max-w-full mx-auto p-4">
            <!-- Header -->
            <div class="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-4 mb-4 shadow-xl">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-base font-bold text-white mb-2">Unidades de Descarga (UD)</h1>
                        <p class="text-blue-100">Sistema de cálculo para instituciones educativas</p>
                    </div>
                    <button
                        @click="toggleMode()"
                        :class="mode === 'edit' ? 'bg-green-500 hover:bg-green-600' : 'bg-white hover:bg-gray-50'"
                        :class="mode === 'edit' ? 'text-white' : 'text-gray-800'"
                        class="px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                        <span class="flex items-center space-x-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                      :d="mode === 'edit' ? 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' : 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'"></path>
                            </svg>
                            <span x-text="mode === 'edit' ? 'Modo Vista' : 'Modo Editor'"></span>
                        </span>
                    </button>
                </div>
            </div>

            <!-- Configuración de Grados -->
            <div class="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
                <h2 class="text-base font-bold text-gray-800 mb-6 flex items-center">
                    <svg class="w-7 h-7 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                    Configuración de Grados Educativos
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <template x-for="(gradeInfo, gradeKey) in gradeOptions" :key="gradeKey">
                        <label class="group cursor-pointer">
                            <div class="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border-2 transition-all duration-300 hover:shadow-lg"
                                 :class="grades[gradeKey] ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md' : 'border-gray-200 hover:border-blue-300'">
                                <div class="flex items-start space-x-4">
                                    <div class="flex-shrink-0 mt-1">
                                        <input
                                            type="checkbox"
                                            x-model="grades[gradeKey]"
                                            @change="updateGrades()"
                                            class="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 transition-colors">
                                    </div>
                                    <div class="flex-1">
                                        <div class="font-bold text-base text-gray-900" x-text="gradeInfo.name"></div>
                                        <div class="text-sm text-gray-600 mt-1" x-text="gradeInfo.description"></div>
                                        <div class="mt-2 text-xs font-medium text-blue-600" x-show="grades[gradeKey]">
                                            ✓ Seleccionado
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </label>
                    </template>
                </div>
            </div>

            <!-- Anexo-06 -->
            <div class="bg-white rounded-2xl shadow-lg border border-gray-100 mb-4">
                <div class="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-t-2xl p-2">
                    <div class="flex items-center justify-between">
                        <h2 class="text-base font-bold text-white flex items-center">
                            <svg class="w-7 h-7 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            Anexo-06 - Valores de Unidades de Descarga
                        </h2>
                        <button 
                            x-show="mode === 'edit'" 
                            @click="addAnexo06Row()"
                            class="bg-white text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors font-semibold shadow-md">
                            + Agregar Aparato
                        </button>
                    </div>
                </div>
                <div class="p-6">
                    <div id="anexo06-table" class="rounded-lg overflow-hidden border border-gray-200"></div>
                    <div class="mt-6 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-4 border border-yellow-200">
                        <div class="flex items-center justify-between">
                            <span class="text-base font-semibold text-gray-800">Total de Unidades de Descarga (Anexo-06):</span>
                            <span class="text-base font-bold text-orange-700" x-text="calculateAnexo06Total() + ' UD'"></span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tablas por Grado -->
            <div x-show="hasSelectedGrades()" x-transition class="space-y-8">
                <h2 class="text-2xl font-bold text-gray-800 flex items-center">
                    <svg class="w-7 h-7 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                    Cálculos por Grado Educativo
                </h2>

                <template x-for="grade in getSelectedGradesList()" :key="grade">
                    <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div class="bg-gradient-to-r from-green-500 to-teal-600 p-2">
                            <div class="flex items-center justify-between">
                                <h3 class="text-base font-bold text-white flex items-center" x-text="'Cálculos para ' + gradeOptions[grade].name"></h3>
                                <button 
                                    x-show="mode === 'edit'"
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

                <!-- Resultados Finales -->
                <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-xl border-2 border-green-200 p-2">
                    <h2 class="text-base font-bold text-center text-gray-800 mb-8 flex items-center justify-center">
                        <svg class="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Resultados Finales
                    </h2>
                    
                    <!-- Resultados por Grado -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <template x-for="grade in getSelectedGradesList()" :key="grade">
                            <div class="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-100 hover:shadow-xl transition-shadow">
                                <div class="text-center">
                                    <div class="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                        </svg>
                                    </div>
                                    <h4 class="text-base font-bold text-gray-700 mb-2" x-text="gradeOptions[grade].name"></h4>
                                    <div class="text-base font-extrabold text-green-600 mb-2" x-text="calculateGradeTotal(grade) + ' UD'"></div>
                                    <p class="text-sm text-gray-500">Total de Unidades</p>
                                </div>
                            </div>
                        </template>
                    </div>

                    <!-- Total General -->
                    <div class="bg-white rounded-2xl shadow-xl p-8 border-2 border-green-300">
                        <div class="text-center">
                            <h3 class="text-2xl font-bold text-gray-800 mb-4">Total General de Unidades de Descarga</h3>
                            <div class="flex items-center justify-center space-x-4">
                                <div class="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
                                    <div class="text-sm font-medium mb-1">Grados Educativos</div>
                                    <div class="text-3xl font-extrabold" x-text="calculateOverallUDTotal() + ' UD'"></div>
                                </div>
                                <div class="text-2xl font-bold text-gray-400">+</div>
                                <div class="bg-gradient-to-r from-orange-500 to-yellow-600 rounded-2xl p-6 text-white">
                                    <div class="text-sm font-medium mb-1">Anexo-06</div>
                                    <div class="text-3xl font-extrabold" x-text="calculateAnexo06Total() + ' UD'"></div>
                                </div>
                                <div class="text-2xl font-bold text-gray-400">=</div>
                                <div class="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-6 text-white">
                                    <div class="text-sm font-medium mb-1">Total Final</div>
                                    <div class="text-4xl font-extrabold" x-text="(calculateOverallUDTotal() + calculateAnexo06Total()) + ' UD'"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Estado vacío -->
            <div x-show="!hasSelectedGrades()" x-transition class="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-lg">
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
        </div>
    `;

    // Inicializar componente Alpine.js
    Alpine.data('udModule', () => ({
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

        anexo06Data: [
            { id: Date.now() + 1, aparatoSanitario: 'Inodoro', tipo: 'Con Tanque - Descarga reducida', total: 2 }, // Corregido a 2 según la primera imagen
            { id: Date.now() + 2, aparatoSanitario: 'Inodoro', tipo: 'Con Tanque', total: 4 }, // Agregado
            { id: Date.now() + 3, aparatoSanitario: 'Inodoro', tipo: 'C/ Válvula semiautomática y automática', total: 8 }, // Agregado
            { id: Date.now() + 4, aparatoSanitario: 'Inodoro', tipo: 'C/ Válvula semiaut. y autom. descarga reducida', total: 4 }, // Agregado
            { id: Date.now() + 5, aparatoSanitario: 'Lavatorio', tipo: 'Corriente', total: 2 }, // Agregado
            { id: Date.now() + 6, aparatoSanitario: 'Lavadero', tipo: 'Cocina, ropa', total: 2 }, // Agregado
            { id: Date.now() + 7, aparatoSanitario: 'Lavadero con triturador', tipo: '-', total: 3 }, // Agregado
            { id: Date.now() + 8, aparatoSanitario: 'Ducha', tipo: '-', total: 3 }, // Agregado
            { id: Date.now() + 9, aparatoSanitario: 'Tina', tipo: '-', total: 3 }, // Agregado
            { id: Date.now() + 10, aparatoSanitario: 'Urinario', tipo: 'Con Tanque', total: 4 }, // Agregado
            { id: Date.now() + 11, aparatoSanitario: 'Urinario', tipo: 'C/ Válvula semiautomática y automática', total: 8 }, // Agregado
            { id: Date.now() + 12, aparatoSanitario: 'Urinario', tipo: 'C/ Válvula semiaut. y autom. descarga reducida', total: 4 }, // Agregado
            { id: Date.now() + 13, aparatoSanitario: 'Urinario', tipo: 'Múltiple', total: 4 }, // Agregado
            { id: Date.now() + 14, aparatoSanitario: 'Bebedero', tipo: 'Simple', total: 2 }, // Agregado
            { id: Date.now() + 15, aparatoSanitario: 'Sumidero', tipo: 'Simple', total: 2 }, // Agregado
        ],

        tables: {
            inicial: { modules: [] },
            primaria: { modules: [] },
            secundaria: { modules: [] }
        },

        anexo06Table: null,
        gradeTables: {},

        categoryMap: {
            'inodoro': 'inodoro',
            'urinario': 'urinario',
            'lavatorio': 'lavatorio',
            'lavadero': 'lavatorio', // Agrupamos 'lavadero' bajo 'lavatorio'
            'lavadero_con_triturador': 'lavatorio', // Agrupamos 'lavadero con triturador' bajo 'lavatorio'
            'ducha': 'ducha',
            'tina': 'ducha', // Agrupamos 'tina' bajo 'ducha' si se considera similar para UD
            'bebedero': 'lavatorio', // Puedes agrupar bebedero bajo lavatorio si el uso de UD es similar
            'sumidero': 'sumidero',
        },

        // `UD_VALUES` ahora se basa en las categorías y toma el UD más alto por categoría
        get UD_VALUES() {
            const values = {};
            this.anexo06Data.forEach(row => {
                const normalizedKey = row.aparatoSanitario.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/_$/, '');
                const categoryKey = this.categoryMap[normalizedKey] || normalizedKey;

                const udValue = parseInt(row.total) || 0; // Este es el UD del Anexo-06 original

                if (!values[categoryKey] || udValue > values[categoryKey]) {
                    values[categoryKey] = udValue;
                }
            });
            return values;
        },

        // Propiedad computada para generar las columnas de accesorios dinámicas
        get extractedAccessories() {
            const categoriesData = {};

            this.anexo06Data.forEach(row => {
                const normalizedKey = row.aparatoSanitario.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/_$/, '');
                const categoryKey = this.categoryMap[normalizedKey] || normalizedKey;

                if (!categoriesData[categoryKey]) {
                    categoriesData[categoryKey] = {
                        key: categoryKey,
                        label: categoryKey.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase()),
                        // *** CAMBIO CLAVE AQUÍ: udValue ahora será totalCategoryCount ***
                        udValue: 0, // Se inicializa a 0, se actualizará abajo
                        originalItemsCount: {},
                        totalCategoryCount: 0
                    };
                }

                if (categoriesData[categoryKey].originalItemsCount[row.aparatoSanitario]) {
                    categoriesData[categoryKey].originalItemsCount[row.aparatoSanitario]++;
                } else {
                    categoriesData[categoryKey].originalItemsCount[row.aparatoSanitario] = 1;
                }
                categoriesData[categoryKey].totalCategoryCount++; // Incrementa el conteo de elementos originales en esta categoría
            });

            // *** SEGUNDO CAMBIO CLAVE AQUÍ: Asignar totalCategoryCount a udValue después de contar ***
            // Recorre las categorías para asignar el totalCategoryCount a udValue
            Object.keys(categoriesData).forEach(categoryKey => {
                categoriesData[categoryKey].udValue = categoriesData[categoryKey].totalCategoryCount;
            });


            const result = Object.values(categoriesData);
            // console.log('Accesorios Extraídos para Columnas (totalCategoryCount como UD):', result);
            return result;
        },

        // La función de cálculo debe usar el udValue que ahora es el totalCategoryCount
        updateDetailUD(module, detail) {
            let totalUD = 0;
            this.extractedAccessories.forEach(accessory => {
                const quantity = parseFloat(detail.accessories[accessory.key]) || 0;
                // Aquí, accessory.udValue ya contiene el totalCategoryCount
                const udValueForCalculation = accessory.udValue; // Usamos el udValue que ahora es totalCategoryCount
                totalUD += quantity * udValueForCalculation;
            });
            detail.udTotal = totalUD;
            this.updateModuleTotalUD(module);
        },

        async init() {
            //console.log('Módulo UD inicializado');
            await this.loadTabulatorScript();
            this.setupEventListeners();
            this.initAnexo06Table();
            this.createTablesForGrades();
            // Escuchar eventos del sistema
            document.addEventListener('system-grade-updated', (event) => {
                this.grades = event.detail.grades;
            });
        },

        loadTabulatorScript() {
            return new Promise((resolve) => {
                const script = document.createElement('script');
                script.src = 'https://unpkg.com/tabulator-tables@6.3.0/dist/js/tabulator.min.js';
                script.onload = resolve;
                document.head.appendChild(script);
            });
        },

        setupEventListeners() {
            document.addEventListener('system-grade-updated', (event) => {
                this.grades = event.detail.grades;
                this.createTablesForGrades();
            });
        },

        // Función para normalizar claves
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
        },

        updateGrades() {
            this.createTablesForGrades();
            // Preparar datos para exportar
            let accesorios = this.extractedAccessories;
            // Si no hay accesorios, poner uno por defecto
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
                anexo06: this.anexo06Data,
                totalUD: this.calculateOverallUDTotal() + this.calculateAnexo06Total()
            };

            // Notificar cambio de grado
            document.dispatchEvent(new CustomEvent('grade-changed', {
                detail: this.grades
            }));

            // Notificar datos actualizados
            document.dispatchEvent(new CustomEvent('DOT-data-updated', {
                detail: {
                    grades: this.grades,
                    tables: { ud: this.tables }
                }
            }));
            // Enviar datos actualizados para UV
            document.dispatchEvent(new CustomEvent('uddesague-data-updated', {
                detail: accesoriosExportados
            }));

            //console.log('Grados actualizados desde UD:', this.grades);
            //console.log('Grados actualizados desde UD:', this.grades);
        },

        // === ANEXO-06 FUNCTIONS ===
        initAnexo06Table() {
            const columns = [
                {
                    title: 'Aparato Sanitario',
                    field: 'aparatoSanitario',
                    editor: this.mode === 'edit' ? 'input' : false,
                    cellEdited: (cell) => this.handleAnexo06CellEdit(cell),
                    width: 150
                },
                {
                    title: 'Tipo',
                    field: 'tipo',
                    editor: this.mode === 'edit' ? 'input' : false,
                    cellEdited: (cell) => this.handleAnexo06CellEdit(cell),
                },
                {
                    title: 'Total UD',
                    field: 'total',
                    bottomCalc: "sum",
                    editor: this.mode === 'edit' ? 'number' : false,
                    editorParams: { min: 0 },
                    formatter: 'number',
                    cellEdited: (cell) => this.handleAnexo06CellEdit(cell),
                    hozAlign: 'center'
                }
            ];

            if (this.mode === 'edit') {
                columns.push({
                    title: 'Acciones',
                    field: '',
                    formatter: () => '<button class="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600">Eliminar</button>',
                    cellClick: (e, cell) => this.removeAnexo06Row(cell.getRow().getData().id),
                    width: 100,
                    hozAlign: 'center'
                });
            }

            this.anexo06Table = new Tabulator('#anexo06-table', {
                data: this.anexo06Data,
                layout: 'fitColumns',
                columns: columns,
                //footerElement: '<div class="bg-gray-100 p-2 text-center font-bold">Total calculado automáticamente</div>',
            });
        },

        handleAnexo06CellEdit(cell) {
            const rowData = cell.getRow().getData();
            const index = this.anexo06Data.findIndex(row => row.id === rowData.id);
            if (index !== -1) {
                this.anexo06Data[index] = {
                    ...rowData,
                    total: parseInt(rowData.total) || 0
                };
                this.updateExtractedAccessories();
                this.recalculateAllGradeTables();
                this.updateGrades(); // Enviar datos actualizados
            }
            // Enviar accesorios actualizados a UV
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

        addAnexo06Row() {
            const newRow = {
                id: Date.now(),
                aparatoSanitario: 'Nuevo Aparato',
                tipo: 'Nuevo Tipo',
                total: 1
            };
            this.anexo06Data.push(newRow);
            this.anexo06Table.addRow(newRow);
            this.updateExtractedAccessories();
            this.updateGrades(); // Enviar datos actualizados
            // Enviar accesorios actualizados a UV
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

        removeAnexo06Row(id) {
            if (!confirm('¿Está seguro de eliminar este aparato sanitario?')) return;
            this.anexo06Data = this.anexo06Data.filter(row => row.id !== id);
            this.anexo06Table.setData(this.anexo06Data);
            this.updateExtractedAccessories();
            this.recalculateAllGradeTables();
            this.updateGrades(); // Enviar datos actualizados
            // Enviar accesorios actualizados a UV
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

        calculateAnexo06Total() {
            return this.anexo06Data.reduce((sum, row) => sum + (parseInt(row.total) || 0), 0);
        },

        // === GRADE TABLES FUNCTIONS ===
        updateExtractedAccessories() {
            // Actualizar accesorios en todas las tablas existentes
            Object.keys(this.tables).forEach(grade => {
                if (!this.tables[grade] || !this.tables[grade].modules) return;

                this.tables[grade].modules.forEach(module => {
                    // Actualizar detalles del módulo
                    module.details.forEach(detail => {
                        this.updateAccessoriesForItem(detail);
                        this.calculateRowUD(detail);
                    });

                    // Actualizar hijos del módulo
                    module.children.forEach(child => {
                        this.updateAccessoriesForItem(child);
                        this.calculateRowUD(child);

                        // Actualizar nietos
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
                newAccessories[acc.key] = currentAccessories[acc.key] !== undefined ?
                    currentAccessories[acc.key] : 0;
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
            // Actualizar tabla anexo-06
            if (this.anexo06Table) {
                this.anexo06Table.destroy();
                this.initAnexo06Table();
            }

            // Actualizar tablas de grados
            this.getSelectedGradesList().forEach(grade => {
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

            // Agregar columnas de accesorios dinámicamente
            this.extractedAccessories.forEach(acc => {
                columns.push({
                    title: `${acc.label}<br><small>(${acc.totalCategoryCount} U.D.)</small>`,
                    field: `accessories.${acc.key}`,
                    editor: this.mode === 'edit' ? 'number' : false,
                    editorParams: { min: 0, step: 0.1 },
                    formatter: (cell) => {
                        const value = parseFloat(cell.getValue()) || 0;
                        return value.toFixed(1);
                    },
                    bottomCalc: (values, data, calcParams) => {
                        const total = values.reduce((sum, value) => sum + (parseFloat(value) || 0), 0);
                        return total.toFixed(1);
                    },
                    cellEdited: (cell) => this.handleGradeCellEdit(grade, cell),
                    width: 100,
                    hozAlign: 'center'
                });
            });

            // Columna de total UD
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

            // Crear estructura de datos para la tabla
            const dataTree = this.buildTableDataTree(grade);

            this.gradeTables[grade] = new Tabulator(`#grade-table-${grade}`, {
                data: dataTree,
                dataTree: true,
                dataTreeStartExpanded: true,
                layout: 'fitColumns',
                columns: columns,
                //footerElement: '<div class="bg-gray-100 p-2 text-center font-bold">Totales calculados automáticamente</div>',
            });
        },

        buildTableDataTree(grade) {
            if (!this.tables[grade] || !this.tables[grade].modules) return [];

            return this.tables[grade].modules.map(module => ({
                id: module.id,
                type: 'module',
                name: module.name,
                nivel: '',
                descripcion: 'Módulo Principal',
                accessories: {},
                udTotal: this.calculateModuleTotal(module),
                _children: [
                    ...module.details.map(detail => ({
                        id: detail.id,
                        type: 'child',
                        name: '',
                        nivel: detail.nivel,
                        descripcion: detail.descripcion,
                        accessories: { ...detail.accessories },
                        udTotal: detail.udTotal,
                        _children: []
                    })),
                    ...module.children.map(child => ({
                        id: child.id,
                        type: 'child',
                        name: '',
                        nivel: child.nivel,
                        descripcion: child.descripcion,
                        accessories: { ...child.accessories },
                        udTotal: child.udTotal,
                        _children: child.details.map(grandchild => ({
                            id: grandchild.id,
                            type: 'grandchild',
                            name: '',
                            nivel: '',
                            descripcion: grandchild.descripcion,
                            accessories: { ...grandchild.accessories },
                            udTotal: grandchild.udTotal,
                        }))
                    }))
                ]
            }));
        },

        // === CALCULATION FUNCTIONS ===
        calculateRowUD(item) {
            let totalUD = 0;
            this.extractedAccessories.forEach(accessory => {
                const quantity = parseFloat(item.accessories[accessory.key]) || 0;
                const udValue = accessory.udValue || 0;
                totalUD += quantity * udValue;
            });

            item.udTotal = totalUD;
            return totalUD;
        },

        calculateModuleTotal(module) {
            let total = 0;

            // Sumar detalles directos del módulo
            module.details.forEach(detail => {
                total += parseFloat(detail.udTotal) || 0;
            });

            // Sumar hijos y sus detalles
            module.children.forEach(child => {
                total += parseFloat(child.udTotal) || 0;
                child.details.forEach(grandchild => {
                    total += parseFloat(grandchild.udTotal) || 0;
                });
            });

            module.totalUD = total;
            return total;
        },

        calculateGradeTotal(grade) {
            if (!this.tables[grade] || !this.tables[grade].modules) return 0;

            return this.tables[grade].modules.reduce((sum, module) => {
                return sum + this.calculateModuleTotal(module);
            }, 0);
        },

        calculateOverallUDTotal() {
            return this.getSelectedGradesList().reduce((sum, grade) => {
                return sum + this.calculateGradeTotal(grade);
            }, 0);
        },

        // === EVENT HANDLERS ===
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
            // Encontrar el módulo correspondiente
            const module = this.tables[grade].modules.find(m =>
                m.id === rowData.id ||
                m.details.some(d => d.id === rowData.id) ||
                m.children.some(c => c.id === rowData.id || c.details.some(gc => gc.id === rowData.id))
            );

            if (!module) return;

            // Actualizar datos según el tipo de fila
            if (rowData.type === 'module') {
                module.name = rowData.name;
            } else {
                let target = this.findTargetItem(module, rowData);
                if (target) {
                    this.updateTargetItem(target, rowData, field);
                    this.calculateRowUD(target);
                }
            }

            this.calculateModuleTotal(module);
            this.updateTableRow(grade, rowData.id);
        },

        findTargetItem(module, rowData) {
            // Buscar en detalles directos
            let target = module.details.find(d => d.id === rowData.id);
            if (target) return target;

            // Buscar en hijos
            target = module.children.find(c => c.id === rowData.id);
            if (target) return target;

            // Buscar en nietos
            for (let child of module.children) {
                target = child.details.find(gc => gc.id === rowData.id);
                if (target) return target;
            }

            return null;
        },

        updateTargetItem(target, rowData, field) {
            target.nivel = rowData.nivel;
            target.descripcion = rowData.descripcion;

            if (field.startsWith('accessories.')) {
                const key = field.split('.')[1];
                target.accessories[key] = parseFloat(rowData.accessories[key]) || 0;
            }
        },

        updateTableRow(grade, rowId) {
            if (this.gradeTables[grade]) {
                const dataTree = this.buildTableDataTree(grade);
                this.gradeTables[grade].setData(dataTree);
            }
        },

        // === ROW MANAGEMENT ===
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
                // Verificar si es un detalle directo o un hijo
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

        // === FACTORY METHODS ===
        createEmptyDetail() {
            const accessories = {};
            this.extractedAccessories.forEach(acc => {
                accessories[acc.key] = 0;
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
                accessories[acc.key] = 0;
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
                accessories[acc.key] = 0;
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

        // === UTILITY FUNCTIONS ===
        hasSelectedGrades() {
            return Object.values(this.grades).some(selected => selected);
        },

        getSelectedGradesList() {
            return Object.keys(this.grades).filter(grade => this.grades[grade]);
        },
        // Verificar si hay grados seleccionados
        hasSelectedGrades() {
            return Object.values(this.grades).some(selected => selected);
        },

        // Obtener lista de grados seleccionados
        getSelectedGradesList() {
            return Object.keys(this.grades).filter(grade => this.grades[grade]);
        },

        // Obtener texto de grados seleccionados
        getSelectedGradesText() {
            const selected = this.getSelectedGradesList();
            return selected.length > 0 ? selected.map(g => g.toUpperCase()).join(', ') : 'Ninguno';
        }
    }));
}

//document.addEventListener('DOMContentLoaded', initUDModule);