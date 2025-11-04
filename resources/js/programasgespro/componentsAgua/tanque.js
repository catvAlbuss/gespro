import { createApp, ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';

export function initTanqueModule() {
    const container = document.getElementById('tanque-content');
    if (!container) {
        console.error('Contenedor tanque no encontrado');
        return;
    }

    // Evitar montar más de una vez
    if (container.__tanqueApp) {
        return;
    }

    const TanqueComponent = {
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
                                <h1 class="text-2xl font-bold text-slate-800">2. CALCULO DEL ALMACENAMIENTO - TANQUE</h1>
                                <p class="text-sm text-slate-600">Cálculo de consumo de agua</p>
                            </div>
                        </div>
                        
                        <div class="flex items-center space-x-3">
                            <div class="flex items-center space-x-2">
                                <span class="text-sm text-slate-600">Modo:</span>
                                <button @click="toggleMode" 
                                        class="px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200"
                                        :class="mode === 'edit' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'">
                                    <i class="fas" :class="mode === 'edit' ? 'fa-edit' : 'fa-eye'"></i>
                                    <span>{{ mode === 'edit' ? 'Edición' : 'Vista' }}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            
            <main class="max-w-full mx-auto px-2 py-4 space-y-6">
              <div class="p-6">
                    <!-- Input Parameters -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div class="space-y-6">
                            <div class="bg-slate-50 rounded-lg p-6">
                                <h3 class="text-lg font-semibold text-slate-800 mb-4">2.2.1. CÁLCULO DE VOLUMEN DEL
                                    TANQUE ELEVADO</h3>
                                <div class="space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium text-slate-700 mb-2">Consumo Diario Total (Lt/día)</label>
                                        <input type="number" step="0.01" v-model="consumoDiario"
                                               class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                               readonly>
                                        <p class="text-xs text-slate-500 mt-1">
                                            <span v-if="!consumoDiario || consumoDiario === 0">Ingresa datos en "Cálculo de la Demanda Diaria" (sección 1)</span>
                                            <span v-else>Valor recibido de la sección de Demanda Diaria.</span>
                                        </p>
                                    </div>
                                    <div class="bg-emerald-50 p-4 rounded-lg">
                                        <p class="text-sm text-emerald-800 mb-2">VOL. DE TANQUE ELEVADO = 1/3 x
                                            CONSUMO
                                            DIARIO TOTAL</p>
                                        <p class="text-lg font-semibold text-emerald-900">Vol. De T.E. = {{ volumenTE.toFixed(2) }} m³</p>
                                        <p class="text-sm text-slate-600 mt-2">Vol. Total (Calculado + Reserva) =
                                            {{ volumenReserva.toFixed(2) }} m³
                                        </p>
                                        <p class="text-sm text-slate-600">Altura de agua mín. = {{ alturaAguaMin.toFixed(2) }} m</p>
                                    </div>
                                </div>
                            </div>

                            <div class="bg-slate-50 rounded-lg p-6">
                                <h3 class="text-lg font-semibold text-slate-800 mb-4">Dimensiones del Tanque Elevado
                                </h3>
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-slate-700 mb-2">Largo (L)
                                            m</label>
                                        <input type="number" step="0.01" v-model="largo"
                                            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-slate-700 mb-2">Ancho (A)
                                            m</label>
                                        <input type="number" step="0.01" v-model="ancho"
                                            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-slate-700 mb-2">Altura agua (H)
                                            m</label>
                                        <input type="number" step="0.01" v-model="alturaAgua"
                                            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-slate-700 mb-2">Altura Limpieza
                                            (hl) m</label>
                                        <input type="number" step="0.01" v-model="alturaLimpieza"
                                            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-slate-700 mb-2">Borde Libre
                                            (bl)
                                            m</label>
                                        <input type="number" step="0.01" v-model="bordeLibre"
                                            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-slate-700 mb-2">Altura total
                                            (HT)
                                            m</label>
                                        <input type="number" step="0.01" v-model="alturaTotal"
                                            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                                    </div>

                                    <div>
                                        <label class="block text-sm font-medium text-slate-700 mb-2">H. techo (Ht)
                                            m</label>
                                        <input type="number" step="0.01" v-model="htecho"
                                            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-slate-700 mb-2">H. ingreso (Hi)
                                            m</label>
                                        <input type="number" step="0.01" v-model="hingreso"
                                            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-slate-700 mb-2">H. rebose (Hr)
                                            m</label>
                                        <input type="number" step="0.01" v-model="hrebose"
                                            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-slate-700 mb-2">Altura Libre (HL)
                                            m</label>
                                        <input type="number" step="0.01" v-model="alturalibre"
                                            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                                    </div>
                                </div>
                                <div class="mt-4 p-4 bg-green-50 rounded-lg">
                                    <p class="text-lg font-bold text-green-800">VOLUMEN DE TANQUE ELEVADO = {{ volumenCalculado.toFixed(2) }} m³</p>
                                    <p v-if="volumenCalculado < volumenTE" class="text-base font-semibold text-red-600 mt-2">CORREGIR DIMENSIONES</p>
                                </div>
                            </div>

                            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <p class="text-sm text-yellow-800">
                                    <strong>Altura asumida como mínimo para mantenimiento y limpieza de tanque
                                        elevado</strong>
                                </p>
                            </div>
                        </div>

                        <!-- Graphic Section -->
                        <div class="space-y-6">
                            <div class="bg-white border border-slate-200 rounded-lg p-6">
                                <h3 class="text-lg font-semibold text-slate-800 mb-4">Diagrama de Tanque Elevado
                                </h3>
                                <div class="relative w-full">
                                    <canvas id="tanqueCanvas" 
                                        class="border border-slate-300 rounded w-full max-w-full"
                                        style="width: 100%; height: 450px;">
                                    </canvas>
                                </div>
                            </div>

                            <div class="bg-slate-50 rounded-lg p-6">
                                <h3 class="text-lg font-semibold text-slate-800 mb-4">2.1.2. DIMENSIONES DEL TANQUE
                                    ELEVADO</h3>
                                <div class="space-y-3">
                                    <div class="flex justify-between">
                                        <span class="text-slate-600">ANCHO (A): {{ ancho }} m</span>
                                        <span class="font-medium">Ancho del Tanque Elevado</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-slate-600">LARGO (L): {{ largo }} m</span>
                                        <span class="font-medium">Largo del Tanque Elevado</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-slate-600">ALTURA DE AGUA (H): {{ alturaAgua }} m</span>
                                        <span class="font-medium">Altura de agua del Tanque Elevado</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-slate-600">ALTURA DE LIMPIEZA (hl): {{ alturaLimpieza }} m</span>
                                        <span class="font-medium">Altura de limpieza del Tanque Elevado</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-slate-600">BORDE LIBRE (bl): {{ bordeLibre }} m</span>
                                        <span class="font-medium">borde del Tanque Elevado</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-slate-600">Altura Total (HT): {{ alturaTotal }} m</span>
                                        <span class="font-medium">Altura total del Tanque Elevado</span>
                                    </div>
                                    <div class="text-sm text-slate-600 mt-4">
                                        <p><strong>ALTURA DE TUB. REBOSE:</strong> La distancia vertical entre los
                                            ejes
                                            del tubo de rebose y el máximo nivel de agua será igual al diámetro de
                                            aquel
                                            y nunca inferior a 0.10 m</p>
                                        <p><strong>ALTURA DE TUB. DE INGRESO:</strong> La distancia vertical entre
                                            los
                                            ejes de tubos de rebose y entrada de agua será igual al doble del
                                            diámetro
                                            del primero y en ningún caso menor de 0.15 m</p>
                                        <p><strong>ALTURA DE NIVEL DE TECHO:</strong> La distancia vertical entre el
                                            techo del depósito y el eje del tubo de entrada de agua, dependerá del
                                            diámetro de este, no pudiendo ser menor de 0.20 m</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
        `,
        setup() {
            const mode = ref('view');
            const consumoDiario = ref(0);
            const tanqueCanvas = ref(null);
            const isDrawing = ref(false);
            const drawTimeout = ref(null);
            const resizeTimeout = ref(null);

            const consumoDiarioInterno = ref(0);
            const largo = ref(4.40);
            const ancho = ref(2.70);
            const alturaAgua = ref(1.15);
            const alturaLimpieza = ref(0.10);
            const bordeLibre = ref(0.45);
            const alturaTotal = ref(1.70);
            const htecho = ref(0.20);
            const hingreso = ref(0.15);
            const hrebose = ref(0.10);
            const alturalibre = ref(0.10);

            const volumenTE = computed(() => {
                return ((1 / 3) * (parseFloat(consumoDiarioInterno.value) || 0)) / 1000;
            });

            const volumenReserva = computed(() => {
                return volumenTE.value * 1.25;
            });

            const volumenTotal = computed(() => {
                return volumenTE.value + volumenReserva.value;
            });

            const alturaAguaMin = computed(() => {
                return (volumenTE.value / (parseFloat(largo.value) * parseFloat(ancho.value))) || 0;
            });

            const volumenCalculado = computed(() => {
                return (parseFloat(largo.value) * parseFloat(ancho.value) * parseFloat(alturaAgua.value)) || 0;
            });

            // Niveles del tanque enumerados y calculados
            const niveles = computed(() => {
                const base = 16.40;
                const htechoVal = parseFloat(htecho.value) || 0;
                const hingresoVal = parseFloat(hingreso.value) || 0;
                const hreboseVal = parseFloat(hrebose.value) || 0;
                const alturalibreVal = parseFloat(alturalibre.value) || 0;
                const alturaTotalVal = parseFloat(alturaTotal.value) || 0;
                return [
                    { numero: 1, nombre: 'Nivel Superior', valor: +(base).toFixed(2) },
                    { numero: 2, nombre: 'Nivel Techo', valor: +(base - htechoVal * 1).toFixed(2) },
                    { numero: 3, nombre: 'Nivel Ingreso', valor: +(base - htechoVal - hingresoVal).toFixed(2) },
                    { numero: 4, nombre: 'Nivel Rebose', valor: +(base - htechoVal - hingresoVal - hreboseVal).toFixed(2) },
                    { numero: 5, nombre: 'Nivel Salida', valor: +(base - alturaTotalVal + alturalibreVal).toFixed(2) },
                    { numero: 6, nombre: 'Nivel Inferior', valor: +(base - alturaTotalVal).toFixed(2) }
                ];
            });

            // Unificada: Enviar todos los datos relevantes del tanque (predeterminados y actualizados)
            const sendDataUpdate = () => {
                const data = {
                    // Datos principales del tanque
                    consumoDiario: consumoDiario.value,
                    consumoDiarioInterno: consumoDiarioInterno.value,
                    largo: largo.value,
                    ancho: ancho.value,
                    alturaAgua: alturaAgua.value,
                    alturaLimpieza: alturaLimpieza.value,
                    bordeLibre: bordeLibre.value,
                    alturaTotal: alturaTotal.value,
                    htecho: htecho.value,
                    hingreso: hingreso.value,
                    hrebose: hrebose.value,
                    alturalibre: alturalibre.value,
                    volumenTE: volumenTE.value,
                    volumenReserva: volumenReserva.value,
                    volumenTotal: volumenTotal.value,
                    alturaAguaMin: alturaAguaMin.value,
                    volumenCalculado: volumenCalculado.value,
                    mode: mode.value,
                    // Niveles enumerados y calculados
                    niveles: niveles.value
                };
                //console.log(data);
                document.dispatchEvent(new CustomEvent('tanque-updated', {
                    detail: data
                }));
            };

            const toggleMode = () => {
                mode.value = mode.value === 'view' ? 'edit' : 'view';
            };

            const setupEventListeners = () => {
                const handleDemandaUpdate = (event) => {
                    const totalCaudal = parseFloat(event.detail.totalCaudal || 0);
                    consumoDiario.value = totalCaudal;
                    consumoDiarioInterno.value = totalCaudal;
                    normalizeTanqueNumbers();
                    if (drawTimeout.value) {
                        clearTimeout(drawTimeout.value);
                    }
                    drawTimeout.value = setTimeout(() => {
                        drawTanque();
                    }, 100);
                    sendDataUpdate(); // Enviar datos al modificar consumo diario
                };

                document.addEventListener('demanda-diaria-updated', handleDemandaUpdate);

                onUnmounted(() => {
                    document.removeEventListener('demanda-diaria-updated', handleDemandaUpdate);
                });
            };

            const initCanvas = async () => {
                await nextTick();
                // Check if Fabric.js and canvas element are available
                if (typeof fabric === 'undefined' || !document.getElementById('tanqueCanvas')) {
                    console.warn('Fabric.js or canvas element not found. Retrying in 200ms.');
                    setTimeout(initCanvas, 200);
                    return;
                }

                drawTanque();
                setupCanvasResponsive();
            };

            const drawTanque = () => {
                if (isDrawing.value) return; // Prevent concurrent draws
                isDrawing.value = true;

                const canvasElement = document.getElementById('tanqueCanvas');
                if (!canvasElement) {
                    console.warn('Canvas element not found.');
                    isDrawing.value = false;
                    return;
                }

                // Normalize numbers before drawing
                normalizeTanqueNumbers();

                // Set canvas dimensions
                const containerWidth = 650;
                const containerHeight = 450;
                canvasElement.width = containerWidth;
                canvasElement.height = containerHeight;

                // Dispose previous canvas safely
                if (tanqueCanvas.value && typeof tanqueCanvas.value.dispose === 'function') {
                    try {
                        tanqueCanvas.value.dispose();
                        tanqueCanvas.value = null;
                    } catch (e) {
                        console.warn('Error disposing canvas:', e);
                    }
                }

                // Initialize new Fabric.js canvas
                try {
                    tanqueCanvas.value = new fabric.Canvas('tanqueCanvas', {
                        width: containerWidth,
                        height: containerHeight,
                        backgroundColor: '#f8fafc'
                    });
                } catch (e) {
                    console.error('Error initializing Fabric.js canvas:', e);
                    isDrawing.value = false;
                    return;
                }

                // Calculate scale and positions
                const margin = 40;
                const availableWidth = containerWidth - (margin * 2);
                const availableHeight = containerHeight - (margin * 2);

                const scaleX = Math.min(availableWidth * 0.35, 180) / (parseFloat(largo.value) || 1);
                const scaleY = Math.min(availableHeight * 0.6, 200) / (parseFloat(alturaTotal.value) || 1);
                const scale = Math.min(scaleX, scaleY);

                const tanqueWidth = (parseFloat(largo.value) || 1) * scale;
                const tanqueHeight = (parseFloat(alturaTotal.value) || 1) * scale;
                const startX = margin + 80;
                const startY = margin + 80;

                // Draw tank components
                drawTanqueSupport(startX, startY + tanqueHeight, tanqueWidth, tanqueHeight);
                drawTanqueMainStructure(startX, startY, tanqueWidth, tanqueHeight, scale);
                drawTanquePipes(startX, startY, tanqueWidth, tanqueHeight, scale);
                drawTanqueWaterLevels(startX, startY, tanqueWidth, tanqueHeight, scale);
                drawTanqueLabelsAndMeasurements(startX, startY, tanqueWidth, tanqueHeight, scale, containerWidth);

                isDrawing.value = false;
            };

            const drawTanqueSupport = (x, y, width, height) => {
                const columnWidth = 15;
                const columnHeight = 80;
                const numColumns = 4;
                const columnSpacing = width / (numColumns - 1);

                for (let i = 0; i < numColumns; i++) {
                    const columnX = x + (i * columnSpacing) - columnWidth / 2;
                    const column = new fabric.Rect({
                        left: columnX,
                        top: y,
                        width: columnWidth,
                        height: columnHeight,
                        fill: '#6b7280',
                        stroke: '#374151',
                        strokeWidth: 2
                    });
                    tanqueCanvas.value.add(column);
                }

                const beam = new fabric.Rect({
                    left: x - 20,
                    top: y + columnHeight - 15,
                    width: width + 40,
                    height: 15,
                    fill: '#6b7280',
                    stroke: '#374151',
                    strokeWidth: 2
                });
                tanqueCanvas.value.add(beam);

                const foundation = new fabric.Rect({
                    left: x - 30,
                    top: y + columnHeight,
                    width: width + 60,
                    height: 12,
                    fill: '#9ca3af',
                    stroke: '#374151',
                    strokeWidth: 2
                });
                tanqueCanvas.value.add(foundation);
            };

            const drawTanqueMainStructure = (x, y, width, height, scale) => {
                const background = new fabric.Rect({
                    left: x - 12,
                    top: y - 15,
                    width: width + 24,
                    height: height + 30,
                    fill: '#e2e8f0',
                    stroke: '#64748b',
                    strokeWidth: 2,
                    rx: 3,
                    ry: 3
                });
                tanqueCanvas.value.add(background);

                const roof = new fabric.Rect({
                    left: x - 12,
                    top: y - 15,
                    width: width + 24,
                    height: 15,
                    fill: '#d1d5db',
                    stroke: '#374151',
                    strokeWidth: 2
                });
                tanqueCanvas.value.add(roof);

                const walls = [
                    { left: x - 12, width: 12 },
                    { left: x + width, width: 12 }
                ];

                walls.forEach(wall => {
                    const wallRect = new fabric.Rect({
                        left: wall.left,
                        top: y,
                        width: wall.width,
                        height: height,
                        fill: '#e2e8f0',
                        stroke: '#374151',
                        strokeWidth: 2
                    });
                    tanqueCanvas.value.add(wallRect);
                });

                const floor = new fabric.Rect({
                    left: x - 12,
                    top: y + height,
                    width: width + 24,
                    height: 15,
                    fill: '#d1d5db',
                    stroke: '#374151',
                    strokeWidth: 2
                });
                tanqueCanvas.value.add(floor);

                const interior = new fabric.Rect({
                    left: x,
                    top: y,
                    width: width,
                    height: height,
                    fill: '#ffffff',
                    stroke: '#334155',
                    strokeWidth: 2
                });
                tanqueCanvas.value.add(interior);

                drawWaterZones(x, y, width, height, scale);
            };

            const drawWaterZones = (x, y, width, height, scale) => {
                const cleaningHeight = (parseFloat(alturaLimpieza.value) || 0) * scale;
                const cleaningArea = new fabric.Rect({
                    left: x + 2,
                    top: y + height - cleaningHeight,
                    width: width - 4,
                    height: cleaningHeight - 2,
                    fill: '#fef3c7',
                    opacity: 0.8
                });
                tanqueCanvas.value.add(cleaningArea);

                const waterHeight = (parseFloat(alturaAgua.value) || 0) * scale;
                const waterY = y + height - waterHeight;
                const waterArea = new fabric.Rect({
                    left: x + 2,
                    top: waterY,
                    width: width - 4,
                    height: waterHeight - cleaningHeight,
                    fill: '#3b82f6',
                    opacity: 0.7
                });
                tanqueCanvas.value.add(waterArea);

                const bordeLibreHeight = (parseFloat(bordeLibre.value) || 0) * scale;
                const bordeLibreArea = new fabric.Rect({
                    left: x + 2,
                    top: y + 2,
                    width: width - 4,
                    height: bordeLibreHeight,
                    fill: '#fbbf24',
                    opacity: 0.3
                });
                tanqueCanvas.value.add(bordeLibreArea);

                const bordeLibreText = new fabric.Text('BORDE LIBRE', {
                    left: x + width / 2,
                    top: y + bordeLibreHeight / 2,
                    fontSize: 12,
                    fontFamily: 'Arial',
                    fill: '#92400e',
                    textAlign: 'center',
                    originX: 'center',
                    originY: 'center',
                    fontWeight: 'bold'
                });
                tanqueCanvas.value.add(bordeLibreText);
            };

            const drawTanquePipes = (x, y, width, height, scale) => {
                const pipeWidth = 8;
                const pipeLength = 25;

                const pipes = [
                    {
                        name: 'techo',
                        rect: { left: x + width / 2 - pipeWidth / 2, top: y - 15 - pipeLength, width: pipeWidth, height: pipeLength },
                        color: '#8b5cf6'
                    },
                    {
                        name: 'ingreso',
                        rect: { left: x - pipeLength, top: y + ((parseFloat(htecho.value) || 0) * scale), width: pipeLength, height: pipeWidth },
                        color: '#f59e0b'
                    },
                    {
                        name: 'rebose',
                        rect: { left: x + width, top: y + ((parseFloat(htecho.value) || 0) * scale) + ((parseFloat(hingreso.value) || 0) * scale), width: pipeLength, height: pipeWidth },
                        color: '#ef4444'
                    },
                    {
                        name: 'salida',
                        rect: { left: x + width, top: y + height - ((parseFloat(alturalibre.value) || 0) * scale), width: pipeLength, height: pipeWidth },
                        color: '#10b981'
                    }
                ];

                pipes.forEach(pipe => {
                    const pipeRect = new fabric.Rect({
                        ...pipe.rect,
                        fill: pipe.color,
                        stroke: pipe.color === '#8b5cf6' ? '#7c3aed' : pipe.color,
                        strokeWidth: 2
                    });
                    tanqueCanvas.value.add(pipeRect);
                });

                drawPipeLevelLines(x, y, width, height, scale);
            };

            const drawPipeLevelLines = (x, y, width, height, scale) => {
                const lines = [
                    { y: y + ((parseFloat(htecho.value) || 0) * scale) + ((parseFloat(hingreso.value) || 0) * scale), color: '#f59e0b' },
                    { y: y + ((parseFloat(htecho.value) || 0) * scale) + ((parseFloat(hingreso.value) || 0) * scale) + ((parseFloat(hrebose.value) || 0) * scale), color: '#ef4444' },
                    { y: y + height - ((parseFloat(alturalibre.value) || 0) * scale), color: '#10b981' }
                ];

                lines.forEach(line => {
                    const levelLine = new fabric.Line([x, line.y + 4, x + width, line.y + 4], {
                        stroke: line.color,
                        strokeWidth: 2,
                        strokeDashArray: [5, 5]
                    });
                    tanqueCanvas.value.add(levelLine);
                });
            };

            const drawTanqueWaterLevels = (x, y, width, height, scale) => {
                const rightX = x + width + 50;

                const levels = [
                    { name: 'Nivel', value: '+16.40', color: '#1f2937', y: y - 20 },
                    { name: 'Nivel', value: '+16.20', color: '#ef4444', y: y + ((parseFloat(htecho.value) || 0) * scale * 0.5) },
                    { name: 'Nivel', value: '+16.00', color: '#f59e0b', y: y + ((parseFloat(htecho.value) || 0) * scale) + ((parseFloat(hingreso.value) || 0) * scale * 0.5) },
                    { name: 'Nivel', value: '+15.85', color: '#10b981', y: y + ((parseFloat(htecho.value) || 0) * scale) + ((parseFloat(hingreso.value) || 0) * scale) },
                    { name: 'Nivel', value: '+15.75', color: '#3b82f6', y: y + ((parseFloat(htecho.value) || 0) * scale) + ((parseFloat(hingreso.value) || 0) * scale) + ((parseFloat(hrebose.value) || 0) * scale) },
                    { name: 'Nivel', value: '+14.60', color: '#8b5cf6', y: y + height - ((parseFloat(alturalibre.value) || 0) * scale) - 10 },
                    { name: 'Nivel', value: '+14.50', color: '#6b7280', y: y + height - 5 }
                ];

                levels.forEach((level, index) => {
                    const line = new fabric.Line([rightX, level.y, rightX + 100, level.y], {
                        stroke: level.color,
                        strokeWidth: 2
                    });
                    tanqueCanvas.value.add(line);

                    const textBg = new fabric.Rect({
                        left: rightX + 105,
                        top: level.y - 8,
                        width: 110,
                        height: 16,
                        fill: level.color,
                        stroke: '#374151',
                        strokeWidth: 1,
                        rx: 2,
                        ry: 2
                    });
                    tanqueCanvas.value.add(textBg);

                    const text = new fabric.Text(`${level.name} = ${level.value} m`, {
                        left: rightX + 110,
                        top: level.y,
                        fontSize: 10,
                        fontFamily: 'Arial',
                        fill: '#ffffff',
                        originY: 'center'
                    });
                    tanqueCanvas.value.add(text);

                    if (index > 0) {
                        const connector = new fabric.Line([x + width, level.y, rightX, level.y], {
                            stroke: level.color,
                            strokeWidth: 1,
                            strokeDashArray: [3, 3]
                        });
                        tanqueCanvas.value.add(connector);
                    }
                });
            };

            const drawTanqueLabelsAndMeasurements = (x, y, width, height, scale, containerWidth) => {
                const title = new fabric.Text('Tanque Elevado cuyas dimensiones serán:', {
                    left: containerWidth / 2,
                    top: 15,
                    fontSize: 16,
                    fontFamily: 'Arial',
                    fill: '#1f2937',
                    fontWeight: 'bold',
                    originX: 'center'
                });
                tanqueCanvas.value.add(title);

                const measurements = [
                    { label: 'H. techo', value: parseFloat(htecho.value) || 0, color: '#8b5cf6' },
                    { label: 'H. ingreso', value: parseFloat(hingreso.value) || 0, color: '#f59e0b' },
                    { label: 'H. rebose', value: parseFloat(hrebose.value) || 0, color: '#ef4444' }
                ];

                let measureY = y + 20;
                measurements.forEach(measure => {
                    const measureText = new fabric.Text(`${measure.label} (H) = ${measure.value.toFixed(2)} m`, {
                        left: Math.min(x + width + 280, containerWidth - 200),
                        top: measureY,
                        fontSize: 11,
                        fontFamily: 'Arial',
                        fill: measure.color,
                        fontWeight: 'bold'
                    });
                    tanqueCanvas.value.add(measureText);
                    measureY += 20;
                });

                const mainDimensions = [
                    `Nivel Superior = +${(16.40).toFixed(2)} m`,
                    `Largo: ${(parseFloat(largo.value) || 0).toFixed(2)} m`,
                    `Ancho: ${(parseFloat(ancho.value) || 0).toFixed(2)} m`,
                    `Altura Total: ${(parseFloat(alturaTotal.value) || 0).toFixed(2)} m`,
                    `Volumen TE: ${(volumenTE.value || 0).toFixed(2)} m³`,
                    `Volumen Total: ${(volumenTotal.value || 0).toFixed(2)} m³`
                ];

                let dimY = y - 20;
                mainDimensions.forEach(dim => {
                    const dimText = new fabric.Text(dim, {
                        left: 15,
                        top: dimY,
                        fontSize: 10,
                        fontFamily: 'Arial',
                        fill: '#4b5563'
                    });
                    tanqueCanvas.value.add(dimText);
                    dimY += 18;
                });

                drawHeightMeasurement(x, y, height);
            };

            const drawHeightMeasurement = (x, y, height) => {
                const heightLine = new fabric.Line([x - 35, y, x - 35, y + height], {
                    stroke: '#6b7280',
                    strokeWidth: 2
                });
                tanqueCanvas.value.add(heightLine);

                const topArrow = new fabric.Triangle({
                    left: x - 35,
                    top: y - 5,
                    width: 8,
                    height: 8,
                    fill: '#6b7280',
                    angle: 180
                });
                tanqueCanvas.value.add(topArrow);

                const bottomArrow = new fabric.Triangle({
                    left: x - 35,
                    top: y + height,
                    width: 8,
                    height: 8,
                    fill: '#6b7280'
                });
                tanqueCanvas.value.add(bottomArrow);

                const heightText = new fabric.Text('HT', {
                    left: x - 55,
                    top: y + height / 2,
                    fontSize: 14,
                    fontFamily: 'Arial',
                    fill: '#374151',
                    fontWeight: 'bold',
                    originY: 'center'
                });
                tanqueCanvas.value.add(heightText);
            };

            const setupCanvasResponsive = () => {
                const resizeCanvas = () => {
                    if (document.getElementById('tanqueCanvas')) {
                        drawTanque();
                    }
                };

                window.addEventListener('resize', () => {
                    if (resizeTimeout.value) {
                        clearTimeout(resizeTimeout.value);
                    }
                    resizeTimeout.value = setTimeout(resizeCanvas, 100);
                });

                if (window.ResizeObserver) {
                    const resizeObserver = new ResizeObserver(() => {
                        if (resizeTimeout.value) {
                            clearTimeout(resizeTimeout.value);
                        }
                        resizeTimeout.value = setTimeout(resizeCanvas, 100);
                    });
                    const container = document.getElementById('tanqueCanvas')?.parentElement;
                    if (container) {
                        resizeObserver.observe(container);
                    }

                    onUnmounted(() => {
                        resizeObserver.disconnect();
                    });
                }

                onUnmounted(() => {
                    window.removeEventListener('resize', resizeCanvas);
                });
            };

            const normalizeTanqueNumbers = () => {
                const refs = { largo, ancho, alturaAgua, alturaLimpieza, bordeLibre, alturaTotal, htecho, hingreso, hrebose, alturalibre, consumoDiarioInterno };

                Object.keys(refs).forEach(key => {
                    const refVar = refs[key];
                    const value = parseFloat(refVar.value);
                    refVar.value = isNaN(value) ? 0 : value;
                });
            };

            watch([largo, ancho, alturaAgua, alturaLimpieza, bordeLibre, alturaTotal, htecho, hingreso, hrebose, alturalibre, consumoDiario], () => {
                consumoDiarioInterno.value = parseFloat(consumoDiario.value) || 0;
                normalizeTanqueNumbers();
                if (drawTimeout.value) {
                    clearTimeout(drawTimeout.value);
                }
                drawTimeout.value = setTimeout(() => {
                    drawTanque();
                }, 50);
                sendDataUpdate(); // Enviar datos al modificar inputs/calculos
            });

            onMounted(() => {
                normalizeTanqueNumbers();
                setupEventListeners();
                consumoDiarioInterno.value = parseFloat(consumoDiario.value) || 0;
                sendDataUpdate(); // Enviar datos al iniciar
                initCanvas();
            });

            onUnmounted(() => {
                if (drawTimeout.value) {
                    clearTimeout(drawTimeout.value);
                }
                if (resizeTimeout.value) {
                    clearTimeout(resizeTimeout.value);
                }
                if (tanqueCanvas.value) {
                    tanqueCanvas.value.dispose();
                }
            });

            return {
                mode,
                consumoDiario,
                toggleMode,
                largo,
                ancho,
                alturaAgua,
                alturaLimpieza,
                bordeLibre,
                alturaTotal,
                htecho,
                hingreso,
                hrebose,
                alturalibre,
                volumenTE,
                volumenReserva,
                volumenTotal,
                alturaAguaMin,
                volumenCalculado,
                niveles
            };
        }
    };

    const app = createApp(TanqueComponent);
    container.innerHTML = '';
    const vm = app.mount(container);
    container.__tanqueApp = { app, vm };
}