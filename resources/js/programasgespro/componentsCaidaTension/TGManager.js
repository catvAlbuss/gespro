export function initTG() {
    const tg = document.getElementById('tg-content');
    if (!tg) {
        console.error('Contenedor no encontrado');
        return;
    }
    
    tg.innerHTML = `
        <div x-data="tgManager" x-init="init()" class="w-full mx-auto">
            <!-- TG Toolbar -->
            <div class="mb-6 flex flex-wrap gap-3 p-4 bg-gray-50 rounded-lg shadow-sm">
                <button @click="toggleEditMode()"
                    :class="editMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-blue-600 hover:bg-blue-700'"
                    class="px-6 py-3 text-white rounded-lg font-medium shadow transition-colors duration-200">
                    <i :class="editMode ? 'fas fa-eye' : 'fas fa-edit'" class="mr-2"></i>
                    <span x-text="editMode ? 'Modo Vista' : 'Modo Edición'"></span>
                </button>
            </div>

            <!-- Main Circuit Table -->
            <div class="mb-8 bg-white rounded-lg shadow-lg overflow-hidden" x-show="flattenedData.length > 0">
                <div class="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700">
                    <h2 class="text-xl font-bold text-white">Cálculo de Caída de Tensión y Sección del
                        Alimentador</h2>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-sm border-collapse">
                        <thead class="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                            <tr>
                                <template x-for="header in mainHeaders" :key="header.key">
                                    <th class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                                        x-text="header.label"></th>
                                </template>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            <template x-if="!flattenedData || flattenedData.length === 0">
                                <tr>
                                    <td :colspan="mainHeaders.length" class="text-center py-4 text-gray-500">
                                        No hay datos para mostrar.
                                    </td>
                                </tr>
                            </template>

                            <template x-for="row in flattenedData" :key="row.id">
                                <tr :class="{
                                        'bg-gray-100 font-bold': row.isStaticTG, 
                                        'bg-blue-50': row.isMainRow, 
                                        'bg-white': !row.isMainRow && !row.isStaticTG
                                    }">

                                    <template x-if="row.isMainRow || row.isStaticTG">
                                        <td :rowspan="row.rowspan || 1"
                                            class="px-3 py-2 text-center font-bold border-r border-gray-200"
                                            :class="{'bg-gray-200': row.isStaticTG, 'bg-blue-100': row.isMainRow}"
                                            x-text="row.alimentador">
                                        </td>
                                    </template>

                                    <template x-for="header in mainHeaders" :key="header.key">
                                        <template x-if="header.key !== 'alimentador'">
                                            <td :class="getCellClass(header.key, row.id, 'main')"
                                                @click="header.type !== 'calculated' && startEdit(row.id, header.key, 'main')"
                                                x-html="renderEditCell(row, header.key, 'main')">
                                            </td>
                                        </template>
                                    </template>

                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- ATS Table -->
            <div class="mb-8 bg-white rounded-lg shadow-lg overflow-hidden">
                <div class="px-6 py-4 bg-gradient-to-r from-green-600 to-green-700">
                    <h3 class="text-lg font-bold text-white">
                        <i class="fas fa-exchange-alt mr-2"></i>
                        Tabla ATS - Transferencia Automática
                    </h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead class="bg-gradient-to-r from-green-600 to-green-700 text-white">
                            <tr>
                                <template x-for="header in atsHeaders" :key="header.key">
                                    <th class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                                        x-text="header.label"></th>
                                </template>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            <template x-for="row in atsData" :key="row.id">
                                <tr class="hover:bg-gray-50">
                                    <template x-for="header in atsHeaders" :key="header.key">
                                        <td :class="getCellClass(header.key, row.id, 'ats')"
                                            @click="header.type !== 'calculated' && startEdit(row.id, header.key, 'ats')">
                                            <div x-html="renderEditCell(row, header.key, 'ats')"></div>
                                        </td>
                                    </template>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- TG Table -->
            <div class="mb-8 bg-white rounded-lg shadow-lg overflow-hidden">
                <div class="px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700">
                    <h3 class="text-lg font-bold text-white">
                        <i class="fas fa-cog mr-2"></i>
                        Tabla TG - Grupo Electrógeno
                    </h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead class="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
                            <tr>
                                <template x-for="header in tgHeaders" :key="header.key">
                                    <th class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                                        x-text="header.label"></th>
                                </template>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            <template x-for="row in tgData" :key="row.id">
                                <tr class="hover:bg-gray-50">
                                    <template x-for="header in tgHeaders" :key="header.key">
                                        <td :class="getCellClass(header.key, row.id, 'tg')"
                                            @click="header.type !== 'calculated' && startEdit(row.id, header.key, 'tg')">
                                            <div x-html="renderEditCell(row, header.key, 'tg')"></div>
                                        </td>
                                    </template>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- No Data Message -->
            <div x-show="flattenedData.length === 0" class="text-center py-8 bg-white rounded-lg shadow">
                <p class="text-gray-500 text-lg">No hay datos disponibles. Los datos se cargarán automáticamente
                    cuando se actualice TD.</p>
            </div>

            <!-- Totals Summary -->
            <div class="mt-6 bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                <h3 class="text-lg font-semibold mb-4 text-gray-800">Resumen General</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <span class="text-sm font-medium text-gray-600">Potencia Total del Sistema:</span>
                        <div class="text-2xl font-bold text-blue-600"
                            x-text="formatNumber(totals.potenciaInstalada) + ' W'"></div>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <span class="text-sm font-medium text-gray-600">Demanda Máxima del Sistema:</span>
                        <div class="text-2xl font-bold text-blue-600"
                            x-text="formatNumber(totals.maximaDemanda) + ' W'"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const Calculations = {
        evaluateFormula(formula) {
            if (!formula || typeof formula !== 'string') return 0;

            try {
                const cleanFormula = formula
                    .trim()
                    .replace(/^=/, '')
                    .replace(/[^0-9+\-*/().\s]/g, '');

                if (!cleanFormula) return 0;

                const isValid = /^[0-9+\-*/().\s]+$/.test(cleanFormula);
                if (!isValid) {
                    console.warn('Invalid characters in formula:', formula);
                    return 0;
                }

                const result = math.evaluate(cleanFormula);

                if (typeof result !== 'number' || isNaN(result)) {
                    console.warn('Invalid result from math.evaluate:', result);
                    return 0;
                }

                const rounded = parseFloat(result.toFixed(2));
                // console.log('Evaluated result:', rounded);
                return rounded;

            } catch (error) {
                // console.warn('Error evaluating formula:', formula, error);
                const fallback = parseFloat(formula);
                return isNaN(fallback) ? 0 : fallback;
            }
        },

        calculateMaximaDemanda(potenciaInstalada, factorSimultaniedad) {
            return (parseFloat(potenciaInstalada) || 0) * (parseFloat(factorSimultaniedad) || 0);
        },

        calculateCorriente(potenciaInstalada, sistema) {
            const voltage = parseFloat(sistema) || 380;
            const demanda = parseFloat(potenciaInstalada) || 0;
            const sistemacal = voltage === 220 ? demanda / (voltage * 0.9) : demanda / (voltage * 0.9 * 1.732);
            return parseFloat(sistemacal.toFixed(2));
        },

        calculateCorrienteATSTG(maximaDemanda, sistema) {
            const voltage = parseFloat(sistema) || 380;
            const demanda = parseFloat(maximaDemanda) || 0;
            const sistemacal = voltage === 220 ? demanda / (voltage * 0.9) : demanda / (voltage * 0.9 * 1.732);
            return parseFloat(sistemacal.toFixed(2));
        },

        calculateCorrienteDiseno(corrienteA) {
            return parseFloat((parseFloat(corrienteA) || 0) * 1.25).toFixed(2);
        },

        calculateCaidaTension(corrienteDiseno, longitudConductor, seccion, sistema, tgCaidaPorcentaje = 0) {
            const voltage = parseFloat(sistema) || 380;
            const factor = voltage === 220 ? 1 : 1.732;
            let parsedSeccion = parseFloat(seccion) || 1;
            if (parsedSeccion <= 0) {
                console.warn('Sección inválida, usando 1 para evitar división por cero');
                parsedSeccion = 1;
            }
            const caida = factor * (parseFloat(corrienteDiseno) || 0) * 0.0175 * (parseFloat(longitudConductor) || 0) / parsedSeccion;
            return {
                caidaTension: isNaN(caida) ? 0 : parseFloat(caida.toFixed(2)),
                caidaTensionPorcentaje: isNaN(caida) ? 0 : parseFloat(((caida / voltage * 100) + tgCaidaPorcentaje).toFixed(2))
            };
        }
    };

    Alpine.data('tgManager', () => ({
        data: [],
        flattenedData: [],
        atsData: [],
        tgData: [],
        mainHeaders: [
            { key: 'alimentador', label: 'ALIMENTADOR', type: 'text' },
            { key: 'tablero', label: 'TABLERO', type: 'text' },
            {
                key: 'sistema', label: 'SISTEMA', type: 'select', options: [
                    { label: '1ɸ', value: '220' },
                    { label: '3ɸ', value: '380' },
                    { label: '', value: '' }
                ]
            },
            { key: 'potenciaInstalada', label: 'POTENCIA INSTALADA (W)', type: 'number' },
            { key: 'factorSimultaniedad', label: 'FACTOR DE SIMULTANEIDAD F.S', type: 'number' },
            { key: 'maximaDemanda', label: 'MÁXIMA DEMANDA (W)', type: 'calculated' },
            { key: 'corrienteA', label: 'CORRIENTE (A)', type: 'calculated' },
            { key: 'corrienteDiseno', label: 'CORRIENTE DE DISEÑO Id (A)', type: 'calculated' },
            { key: 'longitudConductor', label: 'LONGITUD DE CONDUCTOR (M)', type: 'formula' },
            { key: 'seccion', label: 'SECCIÓN (mm2)', type: 'number' },
            { key: 'caidaTension', label: 'CAÍDA DE TENSIÓN (V)', type: 'calculated' },
            { key: 'caidaTensionPorcentaje', label: 'CAÍDA DE TENSIÓN (%) <1.5%', type: 'calculated' },
            { key: 'interruptor', label: 'INTERRUPTOR (A)', type: 'select_dynamic' },
            {
                key: 'tipoConductor', label: 'TIPO DE CONDUCTOR', type: 'select', options: [
                    { label: 'N2XOH', value: 'N2XOH' },
                    { label: 'THW', value: 'THW' },
                    { label: 'THHN', value: 'THHN' },
                    { label: '', value: '' }
                ]
            },
            {
                key: 'ducto', label: 'DUCTO (mm2)', type: 'select', options: [
                    { label: '15', value: '15' }, { label: '20', value: '20' }, { label: '25', value: '25' },
                    { label: '35', value: '35' }, { label: '40', value: '40' }, { label: '50', value: '50' },
                    { label: '65', value: '65' }, { label: '80', value: '80' }, { label: '100', value: '100' },
                    { label: '150', value: '150' }, { label: '', value: '' }
                ]
            }
        ],
        atsHeaders: [
            { key: 'alimentador', label: 'ALIMENTADOR', type: 'text' },
            { key: 'tablero', label: 'TABLERO', type: 'text' },
            {
                key: 'sistema', label: 'SISTEMA', type: 'select', options: [
                    { label: '1ɸ', value: '220' },
                    { label: '3ɸ', value: '380' },
                    { label: '', value: '' }
                ]
            },
            { key: 'maximademandaats', label: 'MAXIMA DEMANDA', type: 'calculated' },
            { key: 'corrienteA', label: 'CORRIENTE (A)', type: 'calculated' },
            { key: 'corrienteDiseno', label: 'CORRIENTE DE DISEÑO Id (A)', type: 'calculated' },
            { key: 'longitudConductor', label: 'LONGITUD DE CONDUCTOR (M)', type: 'formula' },
            { key: 'seccion', label: 'SECCIÓN (mm2)', type: 'number' },
            { key: 'caidaTension', label: 'CAÍDA DE TENSIÓN (V)', type: 'calculated' },
            { key: 'caidaTensionPorcentaje', label: 'CAÍDA DE TENSIÓN (%) <1.5%', type: 'calculated' },
            { key: 'interruptor', label: 'INTERRUPTOR (A)', type: 'select_dynamic' },
            {
                key: 'tipoConductor', label: 'TIPO DE CONDUCTOR', type: 'select', options: [
                    { label: 'N2XOH', value: 'N2XOH' },
                    { label: 'THW', value: 'THW' },
                    { label: 'THHN', value: 'THHN' },
                    { label: '', value: '' }
                ]
            },
            {
                key: 'ducto', label: 'DUCTO (mm2)', type: 'select', options: [
                    { label: '15', value: '15' }, { label: '20', value: '20' }, { label: '25', value: '25' },
                    { label: '35', value: '35' }, { label: '40', value: '40' }, { label: '50', value: '50' },
                    { label: '65', value: '65' }, { label: '80', value: '80' }, { label: '100', value: '100' },
                    { label: '150', value: '150' }, { label: '', value: '' }
                ]
            }
        ],
        tgHeaders: [
            { key: 'alimentador', label: 'ALIMENTADOR', type: 'text' },
            { key: 'tablero', label: 'TABLERO', type: 'text' },
            {
                key: 'sistema', label: 'SISTEMA', type: 'select', options: [
                    { label: '1ɸ', value: '220' },
                    { label: '3ɸ', value: '380' },
                    { label: '', value: '' }
                ]
            },
            { key: 'maximademandaTG', label: 'MAXIMA DEMANDA', type: 'calculated' },
            { key: 'corrienteA', label: 'CORRIENTE (A)', type: 'calculated' },
            { key: 'corrienteDiseno', label: 'CORRIENTE DE DISEÑO Id (A)', type: 'calculated' },
            { key: 'longitudConductor', label: 'LONGITUD DE CONDUCTOR (M)', type: 'formula' },
            { key: 'seccion', label: 'SECCIÓN (mm2)', type: 'number' },
            { key: 'caidaTension', label: 'CAÍDA DE TENSIÓN (V)', type: 'calculated' },
            { key: 'caidaTensionPorcentaje', label: 'CAÍDA DE TENSIÓN (%) <1.5%', type: 'calculated' },
            { key: 'interruptor', label: 'INTERRUPTOR (A)', type: 'select_dynamic' },
            {
                key: 'tipoConductor', label: 'TIPO DE CONDUCTOR', type: 'select', options: [
                    { label: 'N2XOH', value: 'N2XOH' },
                    { label: 'THW', value: 'THW' },
                    { label: 'THHN', value: 'THHN' },
                    { label: '', value: '' }
                ]
            },
            {
                key: 'ducto', label: 'DUCTO (mm2)', type: 'select', options: [
                    { label: '15', value: '15' }, { label: '20', value: '20' }, { label: '25', value: '25' },
                    { label: '35', value: '35' }, { label: '40', value: '40' }, { label: '50', value: '50' },
                    { label: '65', value: '65' }, { label: '80', value: '80' }, { label: '100', value: '100' },
                    { label: '150', value: '150' }, { label: '', value: '' }
                ]
            }
        ],
        totals: { potenciaInstalada: 0, maximaDemanda: 0 },
        editMode: false,
        editingCell: { rowId: null, cellKey: null, tableType: null },

        interruptorOptions: {
            '220': {
                "2x6": "2x6", "2x10": "2x10", "2x16": "2x16", "2x20": "2x20",
                "2x25": "2x25", "2x32": "2x32", "2x40": "2x40", "2x50": "2x50",
                "2x63": "2x63", "2x80": "2x80", "2x100": "2x100", "2x125": "2x125",
                "2x160": "2x160", "2x200": "2x200", "": ""
            },
            '380': {
                "4x6": "4x6", "4x10": "4x10", "4x16": "4x16", "4x20": "4x20",
                "4x25": "4x25", "4x32": "4x32", "4x40": "4x40", "4x50": "4x50",
                "4x63": "4x63", "4x80": "4x80", "4x100": "4x100", "4x125": "4x125",
                "4x160": "4x160", "4x200": "4x200", "": ""
            }
        },

        init() {
            this.listenForTDUpdates();
            this.initializeStaticData();
            this.updateReactiveData();
        },

        initializeStaticData() {
            this.flattenedData = [{
                id: 'tg-static',
                alimentador: '',
                tablero: 'TG',
                sistema: '380',
                potenciaInstalada: 0,
                factorSimultaniedad: 1.0,
                maximaDemanda: 0,
                corrienteA: 0,
                corrienteDiseno: 0,
                longitudConductor: 0,
                longitudFormula: '',
                seccion: 16.00,
                caidaTension: 0,
                caidaTensionPorcentaje: 0,
                interruptor: '4x120',
                tipoConductor: 'N2XOH',
                ducto: '35',
                isMainRow: false,
                isStaticTG: true,
                rowspan: 1,
            }];
            this.generateATSAndTGData();
            this.recalculateAllRows();
            this.updateReactiveData();
        },

        listenForTDUpdates() {
            document.addEventListener('td-data-updated', (e) => {
                this.processRealData(e.detail);
                this.updateReactiveData();
            });
        },

        updateReactiveData() {
            const eventData = {
                data: this.data,
                flattenedData: this.flattenedData,
                atsData: this.atsData,
                tgData: this.tgData,
                totals: {
                    potenciaInstalada: this.totals.potenciaInstalada,
                    maximaDemanda: this.totals.maximaDemanda
                }
            };
            this.data = this.data;
            this.flattenedData = this.flattenedData;
            this.totals = this.totals;
            document.dispatchEvent(new CustomEvent('tg-data-updated', {
                detail: eventData
            }));
        },

        processRealData(tdData) {
            let tree = Array.isArray(tdData) ? tdData : (tdData?.data || []);
            this.data = tree;
            this.parseTreeData(tree);
            this.updateReactiveData();
        },

        parseTreeData(treeData) {
            this.flattenedData = [this.flattenedData[0]];
            let circuitCounter = 1;

            treeData.forEach(mainGroup => {
                if (mainGroup.children?.length) {
                    mainGroup.children.forEach(subGroup => {
                        const mainRow = this.createMainRowFromSubGroup(subGroup, circuitCounter);
                        this.flattenedData.push(mainRow);

                        if (subGroup.children?.length) {
                            const subRows = this.processSubGroups(subGroup.children, mainRow);
                            this.flattenedData.push(...subRows);
                            mainRow.rowspan = 1 + subRows.length;
                        } else {
                            mainRow.rowspan = 1;
                        }
                        circuitCounter++;
                    });
                }
            });

            this.calculateMainTableTotals();
            this.generateATSAndTGData();
            this.recalculateAllRows();
        },

        createMainRowFromSubGroup(subGroup, circuitNum) {
            const data = subGroup.data || {};
            return {
                id: `c${circuitNum}-main`,
                alimentador: `C-${circuitNum}`,
                tablero: data.tablero || `TD-${circuitNum.toString().padStart(2, '0')}`,
                sistema: data.voltage || '380',
                potenciaInstalada: data.maximaDemanda || 0,
                factorSimultaniedad: data.factorDemanda || 0.80,
                maximaDemanda: 0,
                corrienteA: 0,
                corrienteDiseno: 0,
                longitudConductor: data.longitudConductor || 0,
                longitudFormula: data.longitudFormula || '',
                seccion: data.seccion || 0,
                caidaTension: 0,
                caidaTensionPorcentaje: 0,
                interruptor: data.interruptor || '',
                tipoConductor: data.tipoConductor || '',
                ducto: data.ducto || '',
                isMainRow: true,
                isStaticTG: false,
                rowspan: 1
            };
        },

        processSubGroups(children, parentRow) {
            return children
                .filter(child => child.type === 'subsubgroup' || child.type === 'subgroup')
                .map(child => {
                    const data = child.data || {};
                    return {
                        id: `${parentRow.id}-sub-${child.id}`,
                        alimentador: parentRow.alimentador,
                        tablero: data.tablero || '',
                        sistema: data.voltage || parentRow.sistema,
                        potenciaInstalada: data.maximaDemanda || 0,
                        factorSimultaniedad: data.factorDemanda || 0.80,
                        maximaDemanda: 0,
                        corrienteA: 0,
                        corrienteDiseno: 0,
                        longitudConductor: data.longitudConductor || 0,
                        longitudFormula: data.longitudFormula || '',
                        seccion: data.seccion || 0,
                        caidaTension: 0,
                        caidaTensionPorcentaje: 0,
                        interruptor: data.interruptor || '',
                        tipoConductor: data.tipoConductor || '',
                        ducto: data.ducto || '',
                        isMainRow: false,
                        isStaticTG: false,
                        rowspan: 0
                    };
                });
        },

        generateATSAndTGData() {
            const totalMaximaDemanda = this.totals.maximaDemanda;
            this.atsData = [{
                id: 'ats-main',
                alimentador: '',
                tablero: 'ATS',
                sistema: '380',
                maximademandaats: totalMaximaDemanda,
                corrienteA: Calculations.calculateCorrienteATSTG(totalMaximaDemanda, '380'),
                corrienteDiseno: 0,
                longitudConductor: 9.70,
                longitudFormula: '9.70',
                seccion: 16.00,
                caidaTension: 0,
                caidaTensionPorcentaje: 0,
                interruptor: '4x120',
                tipoConductor: 'N2XOH',
                ducto: '35'
            }];

            this.tgData = [{
                id: 'tg-main',
                alimentador: '',
                tablero: 'TG',
                sistema: '380',
                maximademandaTG: totalMaximaDemanda,
                corrienteA: Calculations.calculateCorrienteATSTG(totalMaximaDemanda, '380'),
                corrienteDiseno: 0,
                longitudConductor: 6.32,
                longitudFormula: '6.32',
                seccion: 16.00,
                caidaTension: 0,
                caidaTensionPorcentaje: 0,
                interruptor: '4x120',
                tipoConductor: 'N2XOH',
                ducto: '35'
            }];
        },

        calculateMainTableTotals() {
            const mainRows = this.flattenedData.filter(row => row.isMainRow && !row.isStaticTG);
            this.totals.potenciaInstalada = mainRows.reduce((sum, item) => sum + (parseFloat(item.potenciaInstalada) || 0), 0);
            this.totals.maximaDemanda = mainRows.reduce((sum, item) => sum + (parseFloat(item.maximaDemanda) || 0), 0);
            this.updateReactiveData();
        },

        recalculateAllRows() {
            // Primero recalcular tgData para obtener caidaTensionPorcentaje
            this.tgData.forEach(row => {
                row.maximademandaTG = this.totals.maximaDemanda;
                row.corrienteA = Calculations.calculateCorrienteATSTG(row.maximademandaTG, row.sistema);
                row.corrienteDiseno = Calculations.calculateCorrienteDiseno(row.corrienteA);
                row.longitudConductor = Calculations.evaluateFormula(row.longitudFormula);
                if (row.corrienteDiseno && row.longitudConductor && row.seccion) {
                    const { caidaTension, caidaTensionPorcentaje } = Calculations.calculateCaidaTension(
                        row.corrienteDiseno,
                        row.longitudConductor,
                        row.seccion,
                        row.sistema,
                        0
                    );
                    row.caidaTension = caidaTension;
                    row.caidaTensionPorcentaje = caidaTensionPorcentaje;
                } else {
                    row.caidaTension = 0;
                    row.caidaTensionPorcentaje = 0;
                }
            });

            // Obtener caidaTensionPorcentaje de tgData
            const tgCaidaPorcentaje = this.tgData[0]?.caidaTensionPorcentaje || 0;

            // Recalcular filas de flattenedData (mainHeaders) usando tgCaidaPorcentaje
            this.flattenedData.forEach(row => {
                if (!row.isStaticTG) {
                    this.recalculateRow(row, tgCaidaPorcentaje);
                }
            });

            // Recalcular totales
            this.calculateMainTableTotals();

            // Actualizar fila estática TG
            const staticTGRow = this.flattenedData.find(row => row.isStaticTG);
            if (staticTGRow) {
                staticTGRow.potenciaInstalada = this.totals.potenciaInstalada;
                staticTGRow.maximaDemanda = this.totals.maximaDemanda;
                staticTGRow.corrienteA = Calculations.calculateCorrienteATSTG(this.totals.maximaDemanda, staticTGRow.sistema);
                this.recalculateRow(staticTGRow, tgCaidaPorcentaje);
            }

            // Recalcular atsData sin usar tgCaidaPorcentaje
            this.atsData.forEach(row => {
                row.maximademandaats = this.totals.maximaDemanda;
                row.corrienteA = Calculations.calculateCorrienteATSTG(row.maximademandaats, row.sistema);
                row.corrienteDiseno = Calculations.calculateCorrienteDiseno(row.corrienteA);
                row.longitudConductor = Calculations.evaluateFormula(row.longitudFormula);
                if (row.corrienteDiseno && row.longitudConductor && row.seccion) {
                    const { caidaTension, caidaTensionPorcentaje } = Calculations.calculateCaidaTension(
                        row.corrienteDiseno,
                        row.longitudConductor,
                        row.seccion,
                        row.sistema,
                        0 // ATS no usa tgCaidaPorcentaje
                    );
                    row.caidaTension = caidaTension;
                    row.caidaTensionPorcentaje = caidaTensionPorcentaje;
                } else {
                    row.caidaTension = 0;
                    row.caidaTensionPorcentaje = 0;
                }
            });

            this.updateReactiveData();
        },

        recalculateRow(row, tgCaidaPorcentaje) {
            row.longitudConductor = Calculations.evaluateFormula(row.longitudFormula);
            if (!row.isStaticTG) {
                row.maximaDemanda = Calculations.calculateMaximaDemanda(row.potenciaInstalada, row.factorSimultaniedad);
                row.corrienteA = Calculations.calculateCorriente(row.potenciaInstalada, row.sistema);
            }
            row.corrienteDiseno = Calculations.calculateCorrienteDiseno(row.corrienteA);

            if (row.corrienteDiseno && row.longitudConductor && row.seccion) {
                const { caidaTension, caidaTensionPorcentaje } = Calculations.calculateCaidaTension(
                    row.corrienteDiseno,
                    row.longitudConductor,
                    row.seccion,
                    row.sistema,
                    tgCaidaPorcentaje
                );
                row.caidaTension = caidaTension;
                row.caidaTensionPorcentaje = caidaTensionPorcentaje;
            } else {
                row.caidaTension = 0;
                row.caidaTensionPorcentaje = 0;
            }
            this.updateReactiveData();
        },

        recalculateATSTGRow(row) {
            row.longitudConductor = Calculations.evaluateFormula(row.longitudFormula);
            row.corrienteDiseno = Calculations.calculateCorrienteDiseno(row.corrienteA);
            if (row.corrienteDiseno && row.longitudConductor && row.seccion) {
                const { caidaTension, caidaTensionPorcentaje } = Calculations.calculateCaidaTension(
                    row.corrienteDiseno,
                    row.longitudConductor,
                    row.seccion,
                    row.sistema,
                    0 // ATS no usa tgCaidaPorcentaje
                );
                row.caidaTension = caidaTension;
                row.caidaTensionPorcentaje = caidaTensionPorcentaje;
            } else {
                row.caidaTension = 0;
                row.caidaTensionPorcentaje = 0;
            }
            this.updateReactiveData();
        },

        toggleEditMode() {
            this.editMode = !this.editMode;
            if (!this.editMode) {
                this.cancelEdit();
            }
            this.updateReactiveData();
        },

        startEdit(rowId, cellKey, tableType) {
            if (!this.editMode || this.editingCell.rowId === rowId && this.editingCell.cellKey === cellKey) return;
            this.editingCell = { rowId, cellKey, tableType };
            this.$nextTick(() => {
                const input = document.querySelector('.editing-input');
                if (input) {
                    input.focus();
                    input.select?.();
                }
            });
        },

        finishEdit(event, rowId, cellKey, tableType) {
            const value = event.target.value;
            this.updateCellValue(rowId, cellKey, value, tableType);
            this.cancelEdit();
            this.recalculateAllRows();
            this.updateReactiveData();
        },

        cancelEdit() {
            this.editingCell = { rowId: null, cellKey: null, tableType: null };
            this.updateReactiveData();
        },

        updateCellValue(rowId, cellKey, value, tableType) {
            const headers = tableType === 'ats' ? this.atsHeaders :
                tableType === 'tg' ? this.tgHeaders :
                    this.mainHeaders;
            const targetData = tableType === 'ats' ? this.atsData :
                tableType === 'tg' ? this.tgData :
                    this.flattenedData;

            const row = targetData.find(r => r.id === rowId);
            const header = headers.find(h => h.key === cellKey);

            if (row && header) {
                if (header.type === 'number') {
                    const num = parseFloat(value) || 0;
                    row[cellKey] = isNaN(num) || num < 0 ? 0 : num;
                } else if (header.type === 'formula') {
                    row.longitudFormula = value;
                    row[cellKey] = Calculations.evaluateFormula(value);
                } else {
                    row[cellKey] = value;
                }
            }
            this.updateReactiveData();
        },

        getCellClass(cellKey, rowId, tableType) {
            const isEditing = this.editingCell.rowId === rowId &&
                this.editingCell.cellKey === cellKey &&
                this.editingCell.tableType === tableType;
            const headers = tableType === 'ats' ? this.atsHeaders :
                tableType === 'tg' ? this.tgHeaders :
                    this.mainHeaders;
            const header = headers.find(h => h.key === cellKey);
            const row = (tableType === 'ats' ? this.atsData :
                tableType === 'tg' ? this.tgData :
                    this.flattenedData).find(r => r.id === rowId);

            let classes = 'px-3 py-2 border-b border-gray-200';
            if (isEditing && this.editMode) {
                classes += ' bg-blue-50 ring-2 ring-blue-300';
            }
            if (header?.type === 'number' || header?.type === 'calculated') {
                classes += ' text-right font-mono';
            }
            if (header?.type === 'calculated') {
                classes += ' bg-gray-50 text-gray-700';
            }
            if (cellKey === 'caidaTensionPorcentaje' && row && row[cellKey] > 1.5) {
                classes += ' bg-red-100 text-red-700';
            }
            return classes;
        },

        renderEditCell(row, cellKey, tableType) {
            const headers = tableType === 'ats' ? this.atsHeaders :
                tableType === 'tg' ? this.tgHeaders :
                    this.mainHeaders;

            const header = headers.find(h => h.key === cellKey);
            const isEditing = this.editingCell.rowId === row.id &&
                this.editingCell.cellKey === cellKey &&
                this.editingCell.tableType === tableType;

            if (!isEditing || !this.editMode) {
                return this.formatCell(row, cellKey, tableType);
            }

            const inputClasses = 'w-full px-2 py-1 text-sm border border-blue-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 editing-input';

            if (
                header.type === 'select' ||
                (header.type === 'select_dynamic' && cellKey === 'interruptor')
            ) {
                let options = [];
                if (header.type === 'select') {
                    options = header.options;
                } else if (header.type === 'select_dynamic') {
                    const sistema = row.sistema || '380';
                    const rawOptions = this.interruptorOptions[sistema] || {};
                    options = Object.entries(rawOptions).map(([value, label]) => ({ label, value }));
                }

                return `
            <select class="${inputClasses}" 
                    x-on:change="finishEdit($event, '${row.id}', '${cellKey}', '${tableType}')"
                    x-on:blur="cancelEdit()"
                    x-on:keydown.escape="cancelEdit()">
                ${options.map(opt =>
                    `<option value="${opt.value}" ${row[cellKey] === opt.value ? 'selected' : ''}>${opt.label}</option>`
                ).join('')}
            </select>
        `;
            }

            const inputType = header.type === 'number' ? 'number' : 'text';
            const step = header.type === 'number' ? 'step="0.01"' : '';

            let value = '';
            if (header.type === 'formula') {
                value = typeof row.longitudFormula === 'string'
                    ? row.longitudFormula
                    : '';
            } else {
                value = row[cellKey] != null ? row[cellKey] : '';
            }

            console.log('Edit value:', value);

            return `<input type="${inputType}" ${step}
              class="${inputClasses}" 
              value="${value}"
              placeholder="${header.type === 'formula' ? 'ej: 9.38+1.8+1.8+0.7' : ''}"
              x-on:blur="finishEdit($event, '${row.id}', '${cellKey}', '${tableType}')"
              x-on:keydown.enter="finishEdit($event, '${row.id}', '${cellKey}', '${tableType}')"
              x-on:keydown.escape="cancelEdit()">`;
        },

        formatCell(row, cellKey, tableType) {
            const headers = tableType === 'ats' ? this.atsHeaders :
                tableType === 'tg' ? this.tgHeaders :
                    this.mainHeaders;

            const header = headers.find(h => h.key === cellKey);
            const value = row[cellKey];

            if (header.type === 'formula') {
                const formula = row.longitudFormula || '';
                const isFormula = typeof formula === 'string' && formula.trim().startsWith('=');

                if (isFormula) {
                    const result = Calculations.evaluateFormula(formula);
                    return result.toFixed(2);
                } else if (!isNaN(parseFloat(formula))) {
                    return parseFloat(formula).toFixed(2);
                } else {
                    return '';
                }
            }

            if ((header.type === 'number' || header.type === 'calculated') && typeof value === 'number') {
                return value.toFixed(2);
            }

            if (header.type === 'select' && cellKey === 'sistema') {
                const option = header.options.find(opt => opt.value == value);
                return option ? option.label : (value || '');
            }

            return value != null ? value : '';
        }

    }));
};