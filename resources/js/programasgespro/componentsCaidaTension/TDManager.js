export function initTD() {
    const td = document.getElementById('td-content');
    if (!td) {
        console.error('Contenedor Red de Alimentacion no encontrado');
        return;
    }
    
    td.innerHTML = `
        <div x-data="tdManager" x-init="initTD()" class="w-full mx-auto">
            <!-- TD Toolbar -->
            <div class="mb-6 flex flex-wrap gap-3 p-4 bg-gray-50 rounded-lg">
                <button @click="addGroup()"
                    class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2  rounded-lg transition-colors">
                    Agregar Grupo Principal (TG)
                </button>
                <button @click="exportData()"
                    class="bg-green-500 hover:bg-green-600 text-white px-4 py-2  rounded-lg transition-colors">
                    Exportar JSON
                </button>
                <button @click="importData()"
                    class="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2  rounded-lg transition-colors">
                    Importar JSON
                </button>
                <input type="file" @change="handleFileImport($event)" accept=".json" class="hidden"
                    x-ref="fileInput">
                <button @click="toggleEditMode()"
                    class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2  rounded-lg transition-colors">
                    <span x-text="editMode ? 'Modo Vista' : 'Modo Edición'"></span>
                </button>
            </div>

            <!-- TD Table Container -->
            <div class="overflow-x-auto bg-white rounded-lg shadow">
                <table class="w-full border-collapse border border-gray-300 text-xs">
                    <thead>
                        <tr class="bg-orange-200">
                            <template x-for="header in headers" :key="header.key">
                                <th class="border border-gray-300 px-2 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider text-center"
                                    :colspan="header.colspan || 1" :rowspan="header.rowspan || 1"
                                    x-text="header.label">
                                </th>
                            </template>
                        </tr>
                    </thead>
                    <tbody>
                        <template x-for="row in flattenedData" :key="row.uniqueId">
                            <tr :class="getRowClass(row)">
                                <template x-for="(cell, index) in row.cells" :key="index">
                                    <td :class="getCellClass(cell, row)" :colspan="cell.colspan || 1"
                                        :rowspan="cell.rowspan || 1"
                                        @click="startEdit(row.id, cell.key, row.splitIndex)"
                                        @dblclick="startEdit(row.id, cell.key, row.splitIndex)"
                                        x-show="cell.visible !== false">

                                        <!-- Modo edición -->
                                        <template
                                            x-if="editMode && editingCell.rowId === row.id && editingCell.cellKey === cell.key && editingCell.splitIndex === row.splitIndex">
                                            <span>
                                                <template
                                                    x-if="cell.type === 'select' && cell.key === 'voltage'">
                                                    <select x-ref="editInput"
                                                        @change="finishEdit($event, row.id, cell.key, row.splitIndex)"
                                                        @blur="cancelEdit()"
                                                        class="w-full px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                        <template x-for="option in voltageOptions">
                                                            <option :value="option.value"
                                                                :selected="option.value === cell.value"
                                                                x-text="option.label"></option>
                                                        </template>
                                                    </select>
                                                </template>
                                                <template
                                                    x-if="cell.type === 'select' && cell.key === 'interruptor'">
                                                    <select x-ref="editInput"
                                                        @change="finishEdit($event, row.id, cell.key, row.splitIndex)"
                                                        @blur="cancelEdit()"
                                                        class="w-full px-2 py-1 text-gray-850 dark:text-gray-50 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                        <template
                                                            x-for="(value, key) in interruptorOptions[flattenedData.find(r => r.id === row.id).cells.find(c => c.key === 'voltage').value]">
                                                            <option class="text-gray-850 dark:text-gray-50" :value="key"
                                                                :selected="key === cell.value"
                                                                x-text="value">
                                                            </option>
                                                        </template>
                                                    </select>
                                                </template>
                                                <template
                                                    x-if="cell.type === 'select' && cell.key === 'ducto'">
                                                    <select x-ref="editInput"
                                                        @change="finishEdit($event, row.id, cell.key, row.splitIndex)"
                                                        @blur="cancelEdit()"
                                                        class="w-full px-2 py-1 text-gray-850 dark:text-gray-50 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                        <template x-for="(value, key) in ductoOptions">
                                                            <option class="text-gray-850 dark:text-gray-50" :value="key"
                                                                :selected="key === cell.value"
                                                                x-text="value">
                                                            </option>
                                                        </template>
                                                    </select>
                                                </template>
                                                <template
                                                    x-if="cell.type === 'text' || cell.type === 'calculation'">
                                                    <input x-ref="editInput" type="text"
                                                        :value="cell.value"
                                                        @blur="finishEdit($event, row.id, cell.key, row.splitIndex)"
                                                        @keyup.enter="finishEdit($event, row.id, cell.key, row.splitIndex)"
                                                        @keyup.escape="cancelEdit()"
                                                        class="w-full px-2 py-1 text-gray-850 dark:text-gray-50 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        :placeholder="cell.type === 'calculation' ? 'Ej: =100+200' : ''">
                                                </template>
                                                <template x-if="cell.type === 'number'">
                                                    <input x-ref="editInput" type="number"
                                                        :value="cell.value"
                                                        @blur="finishEdit($event, row.id, cell.key, row.splitIndex)"
                                                        @keyup.enter="finishEdit($event, row.id, cell.key, row.splitIndex)"
                                                        @keyup.escape="cancelEdit()"
                                                        class="w-full px-2 py-1 text-gray-850 dark:text-gray-50 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        :step="cell.key === 'factorDemanda' ? '0.01' : 'any'">
                                                </template>
                                            </span>
                                        </template>

                                        <!-- Modo vista -->
                                        <template
                                            x-if="!(editMode && editingCell.rowId === row.id && editingCell.cellKey === cell.key && editingCell.splitIndex === row.splitIndex)">
                                            <span x-text="formatCellValue(cell.value, cell.type)"
                                                class="block"></span>
                                        </template>

                                        <!-- Controles de fila -->
                                        <template
                                            x-if="cell.key === 'descripcion' && editMode && row.splitIndex === 0">
                                            <div class="flex gap-1 mt-1">
                                                <template x-if="row.type === 'group'">
                                                    <button @click="addSubgroup(row.id)"
                                                        class="text-xs bg-blue-400 text-white px-2 py-1 rounded hover:bg-blue-500">
                                                        + Sub
                                                    </button>
                                                </template>
                                                <template x-if="row.type === 'subgroup'">
                                                    <div class="flex gap-1">
                                                        <button @click="addDataRow(row.id)"
                                                            class="text-xs bg-green-400 text-white px-2 py-1 rounded hover:bg-green-500">
                                                            + Normal
                                                        </button>
                                                        <button @click="addSplitRow(row.id)"
                                                            class="text-xs bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500">
                                                            + Split
                                                        </button>
                                                        <button @click="addSubSubgroup(row.id)"
                                                            class="text-xs bg-purple-400 text-white px-2 py-1 rounded hover:bg-purple-500">
                                                            + TD-XX.XX
                                                        </button>
                                                    </div>
                                                </template>
                                                <template x-if="row.type === 'subsubgroup'">
                                                    <div class="flex gap-1">
                                                        <button @click="addDataRow(row.id)"
                                                            class="text-xs bg-green-400 text-white px-2 py-1 rounded hover:bg-green-500">
                                                            + Normal
                                                        </button>
                                                        <button @click="addSplitRow(row.id)"
                                                            class="text-xs bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500">
                                                            + Split
                                                        </button>
                                                    </div>
                                                </template>
                                                <button @click="deleteRow(row.id)"
                                                    class="text-xs bg-red-400 text-white px-2 py-1 rounded hover:bg-red-500">
                                                    X
                                                </button>
                                            </div>
                                        </template>
                                    </td>
                                </template>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>

            <!-- TD Totals Summary -->
            <div class="mt-6 bg-gray-100 p-4 rounded">
                <h3 class="text-lg font-semibold mb-2">Totales Calculados</h3>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <span class="font-medium">Potencia Instalada Total:</span>
                        <div class="text-2xl font-bold text-blue-600"
                            x-text="formatNumber(totals.potenciaInstalada) + ' W'"></div>
                    </div>
                    <div>
                        <span class="font-medium">Máxima Demanda Total:</span>
                        <div class="text-2xl font-bold text-green-600"
                            x-text="formatNumber(totals.maximaDemanda) + ' W'"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    class TableRow {
        constructor(type, id = null, parentId = null) {
            this.id = id || Date.now() + Math.random();
            this.type = type;
            this.parentId = parentId;
            this.children = [];
            this.data = this.getDefaultData(type);
            this.splitData = [];
            this.isSplit = type === 'splitrow';
            this.voltage = '220';
            this.calculationHistory = [];
        }

        getDefaultData(type) {
            const defaultData = {
                tablero: '',
                voltage: 0,
                descripcion: '',
                puntos: 0,
                cargaInstalada: 0,
                potenciaInstalada: 0,
                factorDemanda: 0.9,
                maximaDemanda: 0,
                corrienteA: 0,
                corrienteDiseno: 0,
                longitudConductor: 0,
                seccion: 2.5,
                caidaTension: 0,
                caidaTensionPorcentaje: 0,
                interruptor: '2x16',
                tipoConductor: 'LSOH',
                ducto: '20'
            };

            if (type === 'group') {
                return { ...defaultData, descripcion: 'CUARTO (TABLEROS - GRUPO ELECTRÓGENO)' };
            } else if (type === 'subgroup') {
                return { ...defaultData, descripcion: 'Nuevo Subgrupo' };
            } else if (type === 'subsubgroup') {
                return { ...defaultData, descripcion: 'Nuevo Sub-subgrupo' };
            } else if (type === 'splitrow') {
                return { ...defaultData, descripcion: 'Fila dividida' };
            } else {
                return { ...defaultData, descripcion: 'Nueva fila de datos' };
            }
        }

        addChild(child) {
            this.children.push(child);
            child.parentId = this.id;
        }

        removeChild(childId) {
            this.children = this.children.filter(child => child.id !== childId);
        }

        addSplitData() {
            if (this.isSplit) {
                const splitData = {
                    descripcion: '',
                    puntos: 0,
                    cargaInstalada: 0
                };
                this.splitData.push(splitData);
                if (this.splitData.length > 2) {
                    this.splitData = this.splitData.slice(0, 2);
                }
            }
        }

        calculateTotals() {
            let potenciaInstalada = 0;
            let maximaDemanda = 0;
            let corrienteA = 0;
            let corrienteDiseno = 0;
            let caidaTension = 0;
            let caidaTensionPorcentaje = 0;

            if (this.type === 'datarow' || this.type === 'splitrow') {
                if (this.isSplit) {
                    potenciaInstalada = parseFloat(this.data.potenciaInstalada) || 0;
                } else {
                    potenciaInstalada = parseFloat(this.data.potenciaInstalada) || 0;
                }

                maximaDemanda = potenciaInstalada * (parseFloat(this.data.factorDemanda) || 0.9);
                corrienteA = this.voltage === '220' ? maximaDemanda / (220 * 0.9) : maximaDemanda / (380 * 0.9 * 1.732);
                corrienteDiseno = corrienteA * 1.25;
                caidaTension = 2 * corrienteDiseno * 0.0175 * (parseFloat(this.data.longitudConductor) || 0) /
                    (parseFloat(this.data.seccion) || 2.5);
                caidaTensionPorcentaje = caidaTension / (parseFloat(this.voltage) || 220) * 100;

                this.data.potenciaInstalada = potenciaInstalada;
                this.data.maximaDemanda = maximaDemanda;
                this.data.corrienteA = corrienteA;
                this.data.corrienteDiseno = corrienteDiseno;
                this.data.caidaTension = caidaTension;
                this.data.caidaTensionPorcentaje = caidaTensionPorcentaje;
            } else {
                this.children.forEach(child => {
                    const childTotals = child.calculateTotals();
                    potenciaInstalada += childTotals.potenciaInstalada;
                    maximaDemanda += childTotals.maximaDemanda;
                });
                this.data.potenciaInstalada = potenciaInstalada;
                this.data.maximaDemanda = maximaDemanda;
            }

            return {
                potenciaInstalada,
                maximaDemanda,
                corrienteA,
                corrienteDiseno,
                caidaTension,
                caidaTensionPorcentaje
            };
        }
    }

    class TableManager {
        constructor() {
            this.data = [];
            this.headers = this.getHeaders();
            this.groupCounter = 1;
            this.subgroupCounters = {};
            this.dataRowCounters = {};
            this.subSubgroupCounters = {};
            this.initializeDefaultData();
        }

        getHeaders() {
            return [
                { key: 'tablero', label: 'TABLERO', type: 'text' },
                { key: 'voltage', label: 'VOLTAJE', type: 'select' },
                { key: 'descripcion', label: 'DESCRIPCIÓN DEL LOCAL', type: 'text' },
                { key: 'puntos', label: 'PUNTOS', type: 'text' },
                { key: 'cargaInstalada', label: 'CARGA INSTALADA (W)', type: 'text' },
                { key: 'potenciaInstalada', label: 'POTENCIA INSTALADA (W)', type: 'calculation' },
                { key: 'factorDemanda', label: 'FACTOR DE DEMANDA (fd)', type: 'number' },
                { key: 'maximaDemanda', label: 'MÁXIMA DEMANDA (W)', type: 'number' },
                { key: 'corrienteA', label: 'CORRIENTE (A)', type: 'number' },
                { key: 'corrienteDiseno', label: 'CORRIENTE DE DISEÑO Id (A)', type: 'number' },
                { key: 'longitudConductor', label: 'LONGITUD DE CONDUCTOR (m)', type: 'calculation' },
                { key: 'seccion', label: 'SECCIÓN (mm2)', type: 'number' },
                { key: 'caidaTension', label: 'CAÍDA DE TENSIÓN (V)', type: 'number' },
                { key: 'caidaTensionPorcentaje', label: 'CAÍDA DE TENSIÓN (%) <2.5%', type: 'number' },
                { key: 'interruptor', label: 'INTERRUPTOR (A)', type: 'select' },
                { key: 'tipoConductor', label: 'TIPO DE CONDUCTOR', type: 'text' },
                { key: 'ducto', label: 'DUCTO (mm2)', type: 'select' }
            ];
        }

        initializeDefaultData() {
            const tg = new TableRow('group');
            tg.data.tablero = 'TG';
            tg.data.descripcion = 'CUARTO (TABLEROS - GRUPO ELECTRÓGENO)';
            this.data.push(tg);
            this.calculateAllTotals();
        }

        generateNextTableroName(type, parentId = null) {
            if (type === 'group') {
                return 'TG';
            } else if (type === 'subgroup') {
                const parentTablero = parentId ? this.findById(parentId)?.data?.tablero || 'TG' : 'TG';
                if (!this.subgroupCounters[parentTablero]) {
                    this.subgroupCounters[parentTablero] = 1;
                }
                return `TD-${String(this.subgroupCounters[parentTablero]++).padStart(2, '0')}`;
            } else if (type === 'subsubgroup') {
                const parent = this.findById(parentId);
                if (parent) {
                    const parentTablero = parent.data.tablero;
                    if (!this.subSubgroupCounters[parentTablero]) {
                        this.subSubgroupCounters[parentTablero] = 1;
                    }
                    return `${parentTablero}.${String(this.subSubgroupCounters[parentTablero]++).padStart(2, '0')}`;
                }
                return 'TD-XX.01';
            } else if (type === 'datarow' || type === 'splitrow') {
                const parent = this.findById(parentId);
                if (parent) {
                    const parentTablero = parent.data.tablero || parent.id;
                    if (!this.dataRowCounters[parentTablero]) {
                        this.dataRowCounters[parentTablero] = 1;
                    }
                    return `C-${this.dataRowCounters[parentTablero]++}`;
                }
                return 'C-1';
            }
            return '';
        }

        addGroup() {
            const group = new TableRow('group');
            group.data.tablero = this.generateNextTableroName('group');
            this.data.push(group);
            return group;
        }

        addSubgroup(parentId) {
            const parent = this.findById(parentId);
            if (parent && parent.type === 'group') {
                const subgroup = new TableRow('subgroup', null, parentId);
                subgroup.data.tablero = this.generateNextTableroName('subgroup', parentId);
                subgroup.data.descripcion = subgroup.data.tablero;
                parent.addChild(subgroup);
                return subgroup;
            }
        }

        addSubSubgroup(parentId) {
            const parent = this.findById(parentId);
            if (parent && parent.type === 'subgroup') {
                const subsubgroup = new TableRow('subsubgroup', null, parentId);
                subsubgroup.data.tablero = this.generateNextTableroName('subsubgroup', parentId);
                subsubgroup.data.descripcion = subsubgroup.data.tablero;
                parent.addChild(subsubgroup);
                return subsubgroup;
            }
        }

        addDataRow(parentId) {
            const parent = this.findById(parentId);
            if (parent && (parent.type === 'subgroup' || parent.type === 'subsubgroup')) {
                const dataRow = new TableRow('datarow', null, parentId);
                dataRow.data.tablero = this.generateNextTableroName('datarow', parentId);
                dataRow.data.descripcion = 'Nueva fila de datos';
                parent.addChild(dataRow);
                return dataRow;
            }
        }

        addSplitRow(parentId) {
            const parent = this.findById(parentId);
            if (parent && (parent.type === 'subgroup' || parent.type === 'subsubgroup')) {
                const splitRow = new TableRow('splitrow', null, parentId);
                splitRow.data.tablero = this.generateNextTableroName('splitrow', parentId);
                splitRow.data.descripcion = 'Fila dividida';
                splitRow.addSplitData();
                splitRow.addSplitData();
                parent.addChild(splitRow);
                return splitRow;
            }
        }

        deleteRow(id) {
            const deleteFromArray = (array) => {
                for (let i = 0; i < array.length; i++) {
                    if (array[i].id === id) {
                        array.splice(i, 1);
                        return true;
                    }
                    if (array[i].children && deleteFromArray(array[i].children)) {
                        return true;
                    }
                }
                return false;
            };
            deleteFromArray(this.data);
            this.calculateAllTotals();
        }

        findById(id) {
            const findInArray = (array) => {
                for (let item of array) {
                    if (item.id === id) return item;
                    if (item.children) {
                        const found = findInArray(item.children);
                        if (found) return found;
                    }
                }
                return null;
            };
            return findInArray(this.data);
        }

        flattenData() {
            const result = [];
            const flatten = (array, level = 0) => {
                array.forEach(item => {
                    if (item.isSplit && item.splitData.length > 0) {
                        item.splitData.forEach((splitItem, splitIndex) => {
                            const cells = this.headers.map(header => {
                                let value = '';
                                let colspan = 1;
                                let rowspan = 1;
                                let visible = true;

                                if (['descripcion', 'puntos', 'cargaInstalada'].includes(header.key)) {
                                    value = splitItem[header.key] || '';
                                } else if (header.key === 'tablero') {
                                    if (splitIndex === 0) {
                                        value = item.data[header.key] || '';
                                        rowspan = item.splitData.length;
                                    } else {
                                        visible = false;
                                    }
                                } else if (header.key === 'voltage') {
                                    value = item.voltage;
                                } else {
                                    if (splitIndex === 0) {
                                        value = item.data[header.key] || '';
                                        rowspan = item.splitData.length;
                                    } else {
                                        visible = false;
                                    }
                                }

                                return {
                                    key: header.key,
                                    value: value,
                                    type: header.type,
                                    colspan: colspan,
                                    rowspan: rowspan,
                                    visible: visible
                                };
                            });

                            result.push({
                                id: item.id,
                                uniqueId: `${item.id}-${splitIndex}`,
                                type: item.type,
                                level: level,
                                cells: cells,
                                parentId: item.parentId,
                                splitIndex: splitIndex,
                                isSplit: true,
                                calculationHistory: item.calculationHistory
                            });
                        });
                    } else {
                        const cells = this.headers.map(header => ({
                            key: header.key,
                            value: header.key === 'voltage' ? item.voltage : item.data[header.key] || '',
                            type: header.type
                        }));

                        result.push({
                            id: item.id,
                            uniqueId: item.id,
                            type: item.type,
                            level: level,
                            cells: cells,
                            parentId: item.parentId,
                            splitIndex: 0,
                            isSplit: false,
                            calculationHistory: item.calculationHistory
                        });
                    }

                    if (item.children && item.children.length > 0) {
                        flatten(item.children, level + 1);
                    }
                });
            };
            flatten(this.data);
            return result;
        }

        getCellType(key) {
            return this.headers.find(header => header.key === key)?.type || 'text';
        }

        updateCellValue(rowId, cellKey, value, splitIndex = 0) {
            const row = this.findById(rowId);
            if (row) {
                const cellType = this.getCellType(cellKey);
                let processedValue = value;

                if (cellType === 'calculation' && value.includes('=')) {
                    try {
                        const result = eval(value.replace('=', '')); // Warning: eval() for simple calculations
                        processedValue = parseFloat(result) || 0;
                        row.calculationHistory.push({ expression: value, result: processedValue });
                    } catch (e) {
                        console.error('Invalid calculation:', value);
                        return;
                    }
                } else if (cellType === 'number') {
                    processedValue = parseFloat(value) || 0;
                } else if (cellType === 'text') {
                    processedValue = value.toString();
                }

                if (row.isSplit && ['descripcion', 'puntos', 'cargaInstalada'].includes(cellKey)) {
                    if (row.splitData[splitIndex]) {
                        row.splitData[splitIndex][cellKey] = processedValue;
                    }
                } else if (cellKey === 'voltage') {
                    row.voltage = value;
                } else {
                    row.data[cellKey] = processedValue;
                }

                if (['voltage', 'puntos', 'cargaInstalada', 'potenciaInstalada', 'factorDemanda',
                    'longitudConductor', 'seccion'].includes(cellKey)) {
                    this.calculateAllTotals();
                }
            }
        }

        calculateAllTotals() {
            this.data.forEach(item => item.calculateTotals());
        }

        getTotals() {
            let potenciaInstalada = 0;
            let maximaDemanda = 0;

            this.data.forEach(item => {
                const totals = item.calculateTotals();
                potenciaInstalada += totals.potenciaInstalada;
                maximaDemanda += totals.maximaDemanda;
            });

            return { potenciaInstalada, maximaDemanda };
        }

        exportToJSON() {
            return JSON.stringify(this.data, null, 2);
        }

        importFromJSON(jsonString) {
            try {
                const imported = JSON.parse(jsonString);
                this.data = imported.map(item => this.reconstructTableRow(item));
                this.calculateAllTotals();
                return true;
            } catch (error) {
                console.error('Error importing JSON:', error);
                return false;
            }
        }

        reconstructTableRow(obj) {
            const row = new TableRow(obj.type, obj.id, obj.parentId);
            row.data = obj.data;
            row.splitData = obj.splitData || [];
            row.isSplit = obj.isSplit || false;
            row.voltage = obj.voltage || '220';
            row.calculationHistory = obj.calculationHistory || [];
            row.children = obj.children.map(child => this.reconstructTableRow(child));
            return row;
        }

        getParentOptions() {
            const options = [];
            const traverse = (items, prefix = '') => {
                items.forEach(item => {
                    const label = `${prefix}${item.data.tablero} - ${item.data.descripcion}`;
                    if (item.type === 'group' || item.type === 'subgroup' || item.type === 'subsubgroup') {
                        options.push({ id: item.id, label: label });
                    }
                    if (item.children && item.children.length > 0) {
                        traverse(item.children, prefix + '  ');
                    }
                });
            };
            traverse(this.data);
            return options;
        }
    }

    Alpine.data('tdManager', () => ({
        manager: new TableManager(),
        tableData: [], // Renamed to avoid conflict
        headers: [],
        flattenedData: [],
        totals: { potenciaInstalada: 0, maximaDemanda: 0 },
        editMode: false,
        editingCell: { rowId: null, cellKey: null, splitIndex: 0 },
        showJsonPreview: false,
        selectedParentId: '',
        showCalculationHistory: null,

        initTD() {
            this.headers = this.manager.headers ?? [];
            this.tableData = Array.isArray(this.manager.data) ? this.manager.data : [];
            this.flattenedData = this.manager.flattenData() ?? [];
            this.totals = this.manager.getTotals() ?? { potenciaInstalada: 0, maximaDemanda: 0 };
        },

        // Remove the getter for `data`
        // get data() {
        //     return this.manager.data;
        // },

        get voltageOptions() {
            return [
                { label: '1ɸ', value: '220' },
                { label: '3ɸ', value: '380' },
                { label: '', value: '' }
            ];
        },

        get interruptorOptions() {
            return {
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
            };
        },

        get ductoOptions() {
            return {
                "15": "15", "20": "20", "25": "25", "35": "35", "40": "40",
                "50": "50", "65": "65", "80": "80", "100": "100", "150": "150", "": ""
            };
        },

        addGroup() {
            this.manager.addGroup();
            this.updateReactiveData();
        },

        addSubgroup(parentId = null) {
            const targetParentId = parentId || this.selectedParentId;
            if (targetParentId) {
                this.manager.addSubgroup(targetParentId);
                this.selectedParentId = '';
                this.updateReactiveData();
            } else {
                alert('Por favor seleccione un grupo padre (TG)');
            }
        },

        addSubSubgroup(parentId = null) {
            const targetParentId = parentId || this.selectedParentId;
            if (targetParentId) {
                this.manager.addSubSubgroup(targetParentId);
                this.selectedParentId = '';
                this.updateReactiveData();
            } else {
                alert('Por favor seleccione un subgrupo padre (TD-XX)');
            }
        },

        addDataRow(parentId = null) {
            const targetParentId = parentId || this.selectedParentId;
            if (targetParentId) {
                this.manager.addDataRow(targetParentId);
                this.selectedParentId = '';
                this.updateReactiveData();
            } else {
                alert('Por favor seleccione un subgrupo o sub-subgrupo padre');
            }
        },

        addSplitRow(parentId = null) {
            const targetParentId = parentId || this.selectedParentId;
            if (targetParentId) {
                this.manager.addSplitRow(targetParentId);
                this.selectedParentId = '';
                this.updateReactiveData();
            } else {
                alert('Por favor seleccione un subgrupo o sub-subgrupo padre');
            }
        },

        deleteRow(id) {
            if (confirm('¿Está seguro de eliminar esta fila y todos sus elementos hijos?')) {
                this.manager.deleteRow(id);
                this.updateReactiveData();
            }
        },

        toggleEditMode() {
            this.editMode = !this.editMode;
            this.editingCell = { rowId: null, cellKey: null, splitIndex: 0 };
            this.updateReactiveData();
        },

        startEdit(rowId, cellKey, splitIndex = 0) {
            if (this.editMode) {
                this.editingCell = { rowId, cellKey, splitIndex };
                this.$nextTick(() => {
                    if (this.$refs.editInput) {
                        this.$refs.editInput.focus();
                        this.$refs.editInput.select();
                    }
                });
            } else if ((cellKey === 'potenciaInstalada' || cellKey === 'longitudConductor') &&
                this.manager.findById(rowId)?.calculationHistory?.length) {
                this.showCalculationHistory = rowId;
            }
        },

        finishEdit(event, rowId, cellKey, splitIndex = 0) {
            const value = event.target.value;
            this.manager.updateCellValue(rowId, cellKey, value, splitIndex);
            this.editingCell = { rowId: null, cellKey: null, splitIndex: 0 };
            this.updateReactiveData();
        },

        cancelEdit() {
            this.editingCell = { rowId: null, cellKey: null, splitIndex: 0 };
        },

        getRowClass(row) {
            const baseClass = 'border-b border-gray-200';
            switch (row.type) {
                case 'group':
                    return `${baseClass} bg-gray-800 text-white font-bold`;
                case 'subgroup':
                    return `${baseClass} bg-gray-600 text-white font-semibold`;
                case 'subsubgroup':
                    return `${baseClass} bg-yellow-300 text-gray-800 font-semibold`;
                case 'splitrow':
                    return `${baseClass} split-row ${row.splitIndex > 0 ? 'border-l-4 border-yellow-400' : ''}`;
                default:
                    return `${baseClass} data-row bg-gray-350 hover:bg-gray-350`;
            }
        },

        getCellClass(cell, row) {
            let classes = 'border border-gray-300 px-2 py-1 text-sm editable-cell';
            if (this.editMode && this.editingCell.rowId === row.id &&
                this.editingCell.cellKey === cell.key &&
                this.editingCell.splitIndex === row.splitIndex) {
                classes += ' bg-blue-100';
            }
            if (cell.type === 'number' || cell.type === 'calculation') {
                classes += ' text-right';
            }
            if (cell.rowspan > 1) {
                classes += ' align-middle';
            }
            return classes;
        },

        formatCellValue(value, type) {
            if ((type === 'number' || type === 'calculation') && typeof value === 'number') {
                return value.toLocaleString('es-ES', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
            }
            return value;
        },

        formatNumber(value) {
            return value.toLocaleString('es-ES', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        },

        getParentOptions() {
            return this.manager.getParentOptions();
        },

        exportData() {
            const jsonString = this.manager.exportToJSON();
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `tabla-potencia-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        },

        importData() {
            this.$refs.fileInput.click();
        },

        handleFileImport(event) {
            const file = event.target.files[0];
            if (file && file.type === 'application/json') {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const success = this.manager.importFromJSON(e.target.result);
                    if (success) {
                        alert('Datos importados correctamente');
                        this.updateReactiveData();
                    } else {
                        alert('Error al importar los datos');
                    }
                };
                reader.readAsText(file);
            }
        },

        loadSampleData() {
            const tg = this.manager.data[0];
            const td01 = this.manager.addSubgroup(tg.id);
            const c1 = this.manager.addDataRow(td01.id);
            c1.data.descripcion = 'Alumbrado maestranza+almacén general+pasadizo';
            c1.data.puntos = '9';
            c1.data.cargaInstalada = '756';
            c1.data.potenciaInstalada = 174;
            c1.calculationHistory.push({ expression: '=756', result: 174 });

            const c2Split = this.manager.addSplitRow(td01.id);
            c2Split.splitData[0] = {
                descripcion: 'Alumbrado dep.almacén de materiales+ductos+almacén+grupo eléc.',
                puntos: '15',
                cargaInstalada: '1260'
            };
            c2Split.splitData[1] = {
                descripcion: 'Alumbrado de emergencia SS.HH.',
                puntos: '4',
                cargaInstalada: '200'
            };
            c2Split.data.factorDemanda = 0.9;
            this.manager.calculateAllTotals();
            this.updateReactiveData();
        },

        updateReactiveData() {
            const eventData = JSON.parse(this.manager.exportToJSON());
            console.log(eventData);
            this.tableData = this.manager.data; // Update tableData instead of data
            this.flattenedData = this.manager.flattenData();
            this.totals = this.manager.getTotals();
            document.dispatchEvent(new CustomEvent('td-data-updated', {
                detail: eventData
            }));
        },
    }));
};