export function initSELECCION() {
    const selector = document.getElementById('selection-content');
    if (!selector) {
        console.error('Contenedor no encontrado');
        return;
    }
    
    selector.innerHTML = `
        <style>
            .table-container {
                @apply mb-8 bg-white rounded-lg shadow-lg overflow-hidden;
            }

            .table-inner {
                @apply w-full;
            }

            .table-title {
                @apply px-6 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white text-lg font-bold flex items-center;
            }

            .table-main {
                @apply w-full text-sm border-collapse;
            }

            .table-header {
                @apply px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white;
            }

            .table-row-main {
                @apply bg-blue-50 font-medium;
            }

            .table-row-sub {
                @apply bg-white;
            }

            .table-cell {
                @apply px-3 py-2 border-b border-gray-200;
            }

            .alimentador-cell {
                @apply text-center font-bold bg-blue-100;
            }

            .edit-input {
                @apply w-full px-2 py-1 text-sm border border-blue-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
            }
        </style>

        <div x-data="selectionManager()" x-init="init()" class="w-full mx-auto">
            <div class="text-center py-12 px-4">
                <div class="max-w-4xl mx-auto text-right mb-4">
                    <button @click="toggleEditMode()"
                        :class="isEditing ? 'bg-gray-600 hover:bg-gray-700' : 'bg-blue-600 hover:bg-blue-700'"
                        class="px-6 py-3 text-white rounded-lg font-medium shadow transition-colors duration-200">
                        <i :class="isEditing ? 'fas fa-eye' : 'fas fa-edit'" class="mr-2"></i>
                        <span x-text="isEditing ? 'Modo Vista' : 'Modo Edición'"></span>
                    </button>
                    <button @click="generateReport()"
                        class="bg-green-600 hover:bg-green-700 px-6 py-3 text-white rounded-lg font-medium shadow transition-colors duration-200">
                        <i class="fas fa-file-alt mr-2"></i>
                        Generar Reporte
                    </button>
                </div>

                <div class="bg-white border border-gray-200 rounded-lg p-6 max-w-4xl mx-auto text-sm shadow-md">

                    <h4 class="text-lg font-semibold text-gray-800 mb-4 text-left border-b pb-2">Selección de
                        Grupo
                        Electrógeno Contamana</h4>
                    <div class="overflow-x-auto">
                        <table class="min-w-full text-left border-collapse table-auto">
                            <thead class="bg-gray-100 border-b-2 border-gray-300">
                                <tr>
                                    <th class="py-2 px-3 font-semibold text-gray-700">DESCRIPCIÓN</th>
                                    <th class="py-2 px-3 font-semibold text-gray-700">CANTIDAD / POTENCIA
                                        (Watts)</th>
                                    <th class="py-2 px-3 font-semibold text-gray-700">Potencia Instalada (kW)
                                    </th>
                                    <th class="py-2 px-3 font-semibold text-gray-700">F.D. (Factor de Demanda)
                                    </th>
                                    <th class="py-2 px-3 font-semibold text-gray-700 text-right">Máxima Demanda
                                        (kW)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="border-b border-gray-200 hover:bg-gray-50">
                                    <td class="py-3 px-3 font-medium text-gray-800">TG</td>
                                    <td class="py-3 px-3">
                                        <span x-show="!isEditing"
                                            x-text="cantidadPotenciaWatts.toFixed(2)"></span>
                                        <template x-if="isEditing">
                                            <input type="number" step="0.01"
                                                x-model.number="cantidadPotenciaWatts"
                                                class="w-full p-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                                        </template>
                                    </td>
                                    <td class="py-3 px-3" x-text="potenciaInstaladaKw.toFixed(2)"></td>
                                    <td class="py-3 px-3">
                                        <span x-show="!isEditing" x-text="factorDemanda.toFixed(2)"></span>
                                        <template x-if="isEditing">
                                            <input type="number" step="0.01" x-model.number="factorDemanda"
                                                class="w-full p-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                                        </template>
                                    </td>
                                    <td class="py-3 px-3 font-medium text-gray-900 text-right"
                                        x-text="maximaDemandaKw.toFixed(2)"></td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr class="border-t-2 border-gray-300 bg-gray-50">
                                    <td colspan="4" class="py-3 px-3 font-bold text-gray-800">POTENCIA TOTAL
                                    </td>
                                    <td class="py-3 px-3 font-bold text-gray-900 text-right"
                                        x-text="potenciaTotalKw.toFixed(2)"></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <h4 class="text-lg font-semibold text-gray-800 mt-8 mb-4 text-left border-b pb-2">Selección
                        de Grupo
                        Electrógeno</h4>
                    <div class="overflow-x-auto">
                        <table class="min-w-full text-left border-collapse table-auto">
                            <thead class="bg-gray-100 border-b-2 border-gray-300">
                                <tr>
                                    <th class="py-2 px-3 font-semibold text-gray-700">Descripción</th>
                                    <th class="py-2 px-3 font-semibold text-gray-700">Factor de Carga</th>
                                    <th class="py-2 px-3 font-semibold text-gray-700 text-right">Potencia
                                        Calculada (kW)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="border-b border-gray-200 hover:bg-gray-50">
                                    <td class="py-3 px-3 font-medium text-gray-800" colspan="2">POTENCIA TOTAL
                                    </td>
                                    <td class="py-3 px-3 font-medium text-gray-900 text-right"
                                        x-text="potenciaTotalKw.toFixed(2)"></td>
                                </tr>

                                <tr class="border-b border-gray-200 hover:bg-gray-50">
                                    <td class="py-3 px-3">Grupo Electrógeno a 145.35 m.s.n.m</td>
                                    <td class="py-3 px-3">
                                        <span x-show="!isEditing" x-text="factorCarga1.toFixed(2)"></span>
                                        <template x-if="isEditing">
                                            <input type="number" step="0.01" x-model.number="factorCarga1"
                                                class="w-full p-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                                        </template>
                                    </td>
                                    <td class="py-3 px-3 text-right" x-text="grupoElectrogeno145.toFixed(2)">
                                    </td>
                                </tr>

                                <tr class="border-b border-gray-200 hover:bg-gray-50">
                                    <td class="py-3 px-3">El grupo electrógeno funcionará al 80% de su máxima
                                        capacidad</td>
                                    <td class="py-3 px-3">
                                        <span x-show="!isEditing" x-text="factorCarga2.toFixed(2)"></span>
                                        <template x-if="isEditing">
                                            <input type="number" step="0.01" x-model.number="factorCarga2"
                                                class="w-full p-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                                        </template>
                                    </td>
                                    <td class="py-3 px-3 text-right" x-text="grupoElectrogeno80.toFixed(2)">
                                    </td>
                                </tr>

                                <tr class="border-b border-gray-200 hover:bg-gray-50">
                                    <td class="py-3 px-3" colspan="2">Grupo electrógeno con potencia STAND BY en
                                        kW a 145.35 m.s.n.m será:</td>
                                    <td class="py-3 px-3 text-right"
                                        x-text="grupoElectrogenoStandBy.toFixed(2)"></td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr class="border-t-2 border-gray-300 bg-gray-50">
                                    <td class="py-3 px-3 font-bold text-gray-800" colspan="2">GRUPO ELECTROGENO
                                        ESTABILIZADO EN STAND BY (kW)</td>
                                    <td class="py-3 px-3 font-bold text-gray-900 text-right">
                                        <span x-show="!isEditing"
                                            x-text="potenciaEstabilizadaStandby.toFixed(0)"></span>
                                        <template x-if="isEditing">
                                            <input type="number" step="1"
                                                x-model.number="potenciaEstabilizadaStandby"
                                                class="w-full p-1 border border-gray-300 rounded-md text-right focus:ring-blue-500 focus:border-blue-500">
                                        </template>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;

    Alpine.data('selectionManager', () => ({
        // Valores base que pueden ser editados
        isEditing: false,
        cantidadPotenciaWatts: 44953.28,
        factorDemanda: 1.00,
        factorCarga1: 0.90,
        factorCarga2: 0.80,
        potenciaEstabilizadaStandby: 68,

        // Función de inicialización para escuchar eventos
        init() {
            //this.listenForTgDataUpdates();
            this.listenForTDUpdates();
        },

        listenForTDUpdates() {
            document.addEventListener('tg-data-updated', (e) => {
                this.processRealData(e.detail);
                //this.updateReactiveData();
            });
        },

        // --- Métodos ---
        toggleEditMode() {
            this.isEditing = !this.isEditing;
        },

        processRealData(tgData) {
            // Escucha el evento 'tg-data-updated' para actualizar la potencia inicial.
            document.addEventListener('tg-data-updated', (event) => {
                //console.log('Evento "tg-data-updated" recibido:', event.detail);
                if (event.detail && event.detail.totals && typeof event.detail.totals.maximaDemanda !== 'undefined') {
                    this.cantidadPotenciaWatts = event.detail.totals.maximaDemanda;
                }
            });
        },

        // --- CÁLCULOS DINÁMICOS (GETTERS) ---
        // Se recalculan automáticamente cuando cambian los valores base.

        // Potencia Instalada (kW) = Cantidad Potencia (Watts) / 1000
        get potenciaInstaladaKw() {
            return this.cantidadPotenciaWatts / 1000;
        },

        // Máxima Demanda (kW) = Potencia Instalada (kW) * Factor de Demanda
        get maximaDemandaKw() {
            return this.potenciaInstaladaKw * this.factorDemanda;
        },

        // Potencia Total es igual a la Máxima Demanda para este caso de una sola fila
        get potenciaTotalKw() {
            return this.maximaDemandaKw;
        },

        // Grupo Electrógeno a 145.35 = Potencia Total / Factor de Carga 1
        get grupoElectrogeno145() {
            // Evitar división por cero
            if (this.factorCarga1 === 0) return 0;
            return this.potenciaTotalKw / this.factorCarga1;
        },

        // Funcionamiento al 80% = (Resultado anterior) / Factor de Carga 2
        get grupoElectrogeno80() {
            // Evitar división por cero
            if (this.factorCarga2 === 0) return 0;
            return this.grupoElectrogeno145 / this.factorCarga2;
        },

        // Potencia Stand By es una réplica del cálculo anterior
        get grupoElectrogenoStandBy() {
            return this.grupoElectrogeno80;
        }
    }));
};
