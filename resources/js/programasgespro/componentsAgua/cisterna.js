import { createApp, ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';

export function initCisternaModule() {
    const container = document.getElementById('cisterna-content');
    if (!container) {
        console.error('Contenedor Cisterna no encontrado');
        return;
    }

    // Evitar montar más de una vez
    if (container.__cisternaApp) {
        return;
    }

    const CisternaComponent = {
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
                                <h1 class="text-2xl font-bold text-slate-800">2. CALCULO DEL ALMACENAMIENTO - CISTERNA</h1>
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
                                <h3 class="text-lg font-semibold text-slate-800 mb-4">2.1.1. CÁLCULO DE VOLUMEN</h3>
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
                                    <div class="bg-blue-50 p-4 rounded-lg">
                                        <p class="text-sm text-blue-800 mb-2">VOL. DE CISTERNA = 3/4 x CONSUMO DIARIO TOTAL</p>
                                        <p class="text-lg font-semibold text-blue-900">Vol. De Cisterna = {{ volumenCisterna.toFixed(2) }} m³</p>
                                        <p class="text-sm text-slate-600 mt-2">Vol. Total mínimo = {{ volumenTotal.toFixed(2) }} m³</p>
                                        <p class="text-sm text-slate-600">Altura de agua mín. = {{ alturaAguaMin.toFixed(2) }} m</p>
                                    </div>
                                </div>
                            </div>

                            <div class="bg-slate-50 rounded-lg p-6">
                                <h3 class="text-lg font-semibold text-slate-800 mb-4">Dimensiones de la Cisterna</h3>
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-slate-700 mb-2">Largo (L) m</label>
                                        <input type="number" step="0.01" v-model="largo"
                                               class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-slate-700 mb-2">Ancho (A) m</label>
                                        <input type="number" step="0.01" v-model="ancho"
                                               class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-slate-700 mb-2">Altura Útil (H) m</label>
                                        <input type="number" step="0.01" v-model="alturaUtil"
                                               class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-slate-700 mb-2">Borde Libre (bl) m</label>
                                        <input type="number" step="0.01" v-model="bordeLibre"
                                               class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-slate-700 mb-2">Nivel m</label>
                                        <input type="number" step="0.01" v-model="nivelagua"
                                               class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-slate-700 mb-2">H. techo (Ht) m</label>
                                        <input type="number" step="0.01" v-model="alturaTecho"
                                               class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                    </div>
                                </div>
                                <div class="mt-4 p-4 bg-green-50 rounded-lg">
                                    <p class="text-lg font-bold text-green-800">VOLUMEN DE CISTERNA = {{ volumenCalculado.toFixed(2) }} m³</p>
                                    <p v-if="volumenCalculado < volumenCisterna" class="text-base font-semibold text-red-600 mt-2">CORREGIR DIMENSIONES</p>
                                </div>
                            </div>
                        </div>

                        <!-- Graphic Section -->
                        <div class="space-y-6">
                            <div class="bg-white border border-slate-200 rounded-lg p-6">
                                <h3 class="text-lg font-semibold text-slate-800 mb-2">Diagrama de Cisterna</h3>
                                <div class="relative w-full" style="height: 450px;">
                                    <!-- Loading indicator -->
                                    <div v-if="!canvasReady" class="absolute inset-0 flex items-center justify-center bg-gray-50 rounded">
                                        <div class="text-center">
                                            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                            <p class="text-sm text-gray-600">Cargando diagrama...</p>
                                        </div>
                                    </div>
                                    <canvas id="cisternaCanvas" 
                                            class="border border-slate-300 rounded w-full h-full"
                                            style="max-width: 100%; max-height: 450px;"
                                            v-show="canvasReady"></canvas>
                                </div>
                            </div>

                            <div class="bg-slate-50 rounded-lg p-6">
                                <h3 class="text-xs font-semibold text-slate-800 mb-4">2.1.2. DIMENSIONES DE LA CISTERNA</h3>
                                <div class="space-y-3">
                                    <div class="flex justify-between">
                                        <span class="text-slate-600">ANCHO (A): {{ ancho }} m</span>
                                        <span class="font-xs">Ancho de la Cisterna</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-slate-600">LARGO (L): {{ largo }} m</span>
                                        <span class="font-xs">Largo de la Cisterna</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-slate-600">ALTURA DE AGUA (H): {{ alturaUtil }} m</span>
                                        <span class="font-xs">Altura de agua de la Cisterna</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-slate-600">Borde Libre (bl): {{ bordeLibre }} m</span>
                                        <span class="font-xs">Altura de la Cisterna</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-slate-600">Altura total (HT): {{ alturaTotal }} m</span>
                                        <span class="font-xs">Altura total de la Cisterna</span>
                                    </div>
                                    <div class="text-sm text-slate-600 mt-4">
                                        <p><strong>ALTURA DE TUB. REBOSE:</strong> La distancia vertical entre los ejes del tubo de rebose y el máximo nivel de agua será igual al diámetro de aquel y nunca inferior a 0.10 m</p>
                                        <p><strong>ALTURA DE TUB. DE INGRESO:</strong> La distancia vertical entre los ejes de tubos de rebose y entrada de agua será igual al doble del diámetro del primero y en ningún caso menor de 0.15 m</p>
                                        <p><strong>ALTURA DE NIVEL DE TECHO:</strong> La distancia vertical entre el techo del depósito y el eje del tubo de entrada de agua, dependerá del diámetro de este, no pudiendo ser menor de 0.20 m</p>
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
            const canvasReady = ref(false);
            const canvasInitialized = ref(false);
            const updatePending = ref(false);
            const canvas = ref(null);
            const resizeTimeout = ref(null);
            const updateTimeout = ref(null);
            const isDrawing = ref(false);

            const largo = ref(4.40);
            const ancho = ref(2.70);
            const alturaUtil = ref(1.90);
            const bordeLibre = ref(0.50);
            const nivelagua = ref(0.65);
            const alturaTecho = ref(0.20);
            const consumoDiarioInterno = ref(0);

            const volumenCisterna = computed(() => {
                const consumoDiarioM3 = consumoDiarioInterno.value / 1000;
                return (3 / 4) * consumoDiarioM3;
            });

            const volumenTotal = computed(() => volumenCisterna.value);

            const alturaAguaMin = computed(() => {
                if (largo.value === 0 || ancho.value === 0) return 0;
                return parseFloat(volumenCisterna.value / (largo.value * ancho.value));
            });

            const volumenCalculado = computed(() => {
                return parseFloat(largo.value * ancho.value * alturaUtil.value);
            });

            const alturaTotal = computed(() => {
                return parseFloat(alturaUtil.value + bordeLibre.value + alturaTecho.value).toFixed(2);
            });

            const calculatedData = ref({
                alturaIngreso: 0.15,
                volumencisterna: 0.10,
                nivel1: 0,
                nivel2: 0,
                nivel3: 0,
                nivel4: 0,
                nivel5: 0
            });

            const toggleMode = () => {
                mode.value = mode.value === 'view' ? 'edit' : 'view';
            };

            const setupEventListeners = () => {
                const handleDemandaUpdate = (event) => {
                    const totalCaudal = parseFloat(event.detail.totalCaudal || 0);
                    consumoDiario.value = totalCaudal;
                    consumoDiarioInterno.value = consumoDiario.value;
                    calculateCisternaData();
                    updateCanvas();
                    sendDataUpdate();
                };

                document.addEventListener('demanda-diaria-updated', handleDemandaUpdate);

                onUnmounted(() => {
                    document.removeEventListener('demanda-diaria-updated', handleDemandaUpdate);
                });
            };

            const calculateCisternaData = () => {
                const round = (num, decimals = 4) => parseFloat(num.toFixed(decimals));

                const alturaIngreso = (volumenCalculado.value <= 12) ? 0.15 :
                    ((volumenCalculado.value <= 30) ? 0.2 : 0.3);

                const volumencisterna = (volumenCalculado.value > 30) ? 0.15 : 0.10;

                const nivel1 = round(parseFloat(nivelagua.value) - 0.2);
                const nivel2 = round(nivel1 - alturaTecho.value);
                const nivel3 = round(nivel2 - alturaIngreso);
                const nivel4 = round(nivel3 - volumencisterna);
                const nivel5 = round(nivel4 - alturaUtil.value);

                calculatedData.value = {
                    largo: largo.value,
                    ancho: ancho.value,
                    alto: alturaTotal.value,
                    alturaIngreso: alturaIngreso,
                    volumencisterna: volumenCisterna.value,
                    nivel1: nivel1,
                    nivel2: nivel2,
                    nivel3: nivel3,
                    nivel4: nivel4,
                    nivel5: nivel5
                };
            };

            const sendDataUpdate = () => {
                const data = {
                    consumoDiario: consumoDiario.value,
                    largo: largo.value,
                    ancho: ancho.value,
                    alturaUtil: alturaUtil.value,
                    bordeLibre: bordeLibre.value,
                    nivelagua: nivelagua.value,
                    alturaTecho: alturaTecho.value,
                    consumoDiarioInterno: consumoDiarioInterno.value,
                    ...calculatedData.value
                };

                document.dispatchEvent(new CustomEvent('cisterna-updated', {
                    detail: data,
                    bubbles: false
                }));
            };

            const initializeCanvas = async () => {
                if (canvasInitialized.value) return;

                await nextTick();
                const canvasElement = document.getElementById('cisternaCanvas');
                if (!canvasElement) {
                    console.warn('Canvas element not found, retrying...');
                    setTimeout(initializeCanvas, 200);
                    return;
                }

                // Verificar dimensiones del contenedor
                const container = canvasElement.parentElement;
                if (!container || container.clientWidth === 0) {
                    setTimeout(initializeCanvas, 200);
                    return;
                }

                calculateCisternaData();

                // Intentar usar Fabric.js si está disponible, sino usar canvas nativo
                if (typeof fabric !== 'undefined') {
                    initializeFabricCanvas();
                } else {
                    console.warn('Fabric.js no disponible, usando canvas nativo');
                    initializeNativeCanvas();
                }

                makeCanvasResponsive();
                canvasInitialized.value = true;
                canvasReady.value = true;
            };

            const initializeFabricCanvas = () => {
                const canvasElement = document.getElementById('cisternaCanvas');
                const container = canvasElement.parentElement;
                const containerWidth = container.clientWidth || 650;
                const containerHeight = 450;

                canvasElement.width = containerWidth;
                canvasElement.height = containerHeight;

                if (canvas.value) {
                    canvas.value.dispose();
                }

                canvas.value = new fabric.Canvas('cisternaCanvas', {
                    width: containerWidth,
                    height: containerHeight,
                    backgroundColor: '#f8fafc',
                    selection: false,
                    allowTouchScrolling: true
                });

                drawCisternaFabric();
            };

            const initializeNativeCanvas = () => {
                drawCisternaNative();
            };

            const updateCanvas = () => {
                if (updateTimeout.value) {
                    clearTimeout(updateTimeout.value);
                }

                updateTimeout.value = setTimeout(() => {
                    if (!isDrawing.value && canvasInitialized.value) {
                        const canvasElement = document.getElementById('cisternaCanvas');
                        if (!canvasElement) return;

                        const rect = canvasElement.getBoundingClientRect();
                        if (rect.width === 0 || rect.height === 0) return;

                        if (canvas.value && typeof fabric !== 'undefined') {
                            drawCisternaFabric();
                        } else {
                            drawCisternaNative();
                        }
                    }
                }, 150);
            };

            const drawCisternaFabric = () => {
                if (isDrawing.value || !canvas.value) return;
                isDrawing.value = true;

                try {
                    const canvasElement = document.getElementById('cisternaCanvas');
                    const container = canvasElement.parentElement;
                    const containerWidth = container.clientWidth || 650;
                    const containerHeight = 450;

                    canvas.value.setDimensions({
                        width: containerWidth,
                        height: containerHeight
                    });
                    canvas.value.clear();

                    drawStructureFabric(containerWidth, containerHeight);
                    canvas.value.renderAll();

                } catch (error) {
                    console.error('Error al dibujar con Fabric:', error);
                    drawCisternaNative();
                } finally {
                    isDrawing.value = false;
                }
            };

            const drawStructureFabric = (containerWidth, containerHeight) => {
                const marginLeft = 80;
                const marginRight = 200;
                const marginTop = 60;
                const marginBottom = 80;

                const drawingWidth = containerWidth - marginLeft - marginRight;
                const drawingHeight = containerHeight - marginTop - marginBottom;

                const scale = Math.min(drawingWidth / largo.value, drawingHeight / alturaTotal.value) * 0.8;
                const cisternaWidth = largo.value * scale;
                const cisternaHeight = alturaTotal.value * scale;

                const startX = marginLeft + (drawingWidth - cisternaWidth) / 2;
                const startY = marginTop + (drawingHeight - cisternaHeight) / 2;

                // Estructura principal
                const mainRect = new fabric.Rect({
                    left: startX,
                    top: startY,
                    width: cisternaWidth,
                    height: cisternaHeight,
                    fill: '#f1f5f9',
                    stroke: '#334155',
                    strokeWidth: 2,
                    selectable: false,
                    evented: false
                });

                // Área de agua
                const alturaAguaEscalada = alturaUtil.value * scale;
                const waterY = startY + cisternaHeight - alturaAguaEscalada;

                const waterRect = new fabric.Rect({
                    left: startX + 2,
                    top: waterY,
                    width: cisternaWidth - 4,
                    height: alturaAguaEscalada - 2,
                    fill: '#3b82f6',
                    opacity: 0.6,
                    selectable: false,
                    evented: false
                });

                // Líneas divisorias
                const techoY = startY + (alturaTecho.value * scale);

                const waterLine = new fabric.Line([startX, waterY, startX + cisternaWidth, waterY], {
                    stroke: '#64748b',
                    strokeWidth: 2,
                    strokeDashArray: [5, 5],
                    selectable: false,
                    evented: false
                });

                const roofLine = new fabric.Line([startX, techoY, startX + cisternaWidth, techoY], {
                    stroke: '#64748b',
                    strokeWidth: 2,
                    strokeDashArray: [5, 5],
                    selectable: false,
                    evented: false
                });

                // Etiquetas
                const fontSize = Math.max(10, Math.min(14, cisternaWidth / 25));

                const roofLabel = new fabric.Text('TECHO', {
                    left: startX + cisternaWidth / 2,
                    top: startY + (alturaTecho.value * scale) / 2,
                    fontSize: fontSize,
                    fontFamily: 'Arial',
                    fill: '#374151',
                    originX: 'center',
                    originY: 'center',
                    fontWeight: 'bold',
                    selectable: false,
                    evented: false
                });

                const freeboardLabel = new fabric.Text('BORDE LIBRE', {
                    left: startX + cisternaWidth / 2,
                    top: techoY + (bordeLibre.value * scale) / 2,
                    fontSize: fontSize,
                    fontFamily: 'Arial',
                    fill: '#374151',
                    originX: 'center',
                    originY: 'center',
                    fontWeight: 'bold',
                    selectable: false,
                    evented: false
                });

                const waterLabel = new fabric.Text('AGUA', {
                    left: startX + cisternaWidth / 2,
                    top: waterY + alturaAguaEscalada / 2,
                    fontSize: fontSize,
                    fontFamily: 'Arial',
                    fill: '#ffffff',
                    originX: 'center',
                    originY: 'center',
                    fontWeight: 'bold',
                    selectable: false,
                    evented: false
                });

                // Cotas
                const cotaX = startX + cisternaWidth + 20;
                const measureFontSize = Math.max(9, Math.min(12, containerWidth / 60));

                // Líneas de cota
                const mainCotaLine = new fabric.Line([cotaX, startY, cotaX, startY + cisternaHeight], {
                    stroke: '#64748b',
                    strokeWidth: 1,
                    selectable: false,
                    evented: false
                });

                // Marcas de cota
                const cotaMarks = [
                    new fabric.Line([cotaX - 5, startY, cotaX + 5, startY], { stroke: '#64748b', strokeWidth: 1, selectable: false, evented: false }),
                    new fabric.Line([cotaX - 5, techoY, cotaX + 5, techoY], { stroke: '#64748b', strokeWidth: 1, selectable: false, evented: false }),
                    new fabric.Line([cotaX - 5, waterY, cotaX + 5, waterY], { stroke: '#64748b', strokeWidth: 1, selectable: false, evented: false }),
                    new fabric.Line([cotaX - 5, startY + cisternaHeight, cotaX + 5, startY + cisternaHeight], { stroke: '#64748b', strokeWidth: 1, selectable: false, evented: false })
                ];

                // Etiquetas de medidas
                const roofMeasure = new fabric.Text(`${alturaTecho.value} m`, {
                    left: cotaX + 15,
                    top: startY + (alturaTecho.value * scale) / 2,
                    fontSize: measureFontSize,
                    fontFamily: 'Arial',
                    fill: '#374151',
                    originY: 'center',
                    selectable: false,
                    evented: false
                });

                const freeboardMeasure = new fabric.Text(`${bordeLibre.value} m`, {
                    left: cotaX + 15,
                    top: techoY + (bordeLibre.value * scale) / 2,
                    fontSize: measureFontSize,
                    fontFamily: 'Arial',
                    fill: '#374151',
                    originY: 'center',
                    selectable: false,
                    evented: false
                });

                const waterMeasure = new fabric.Text(`${alturaUtil.value} m`, {
                    left: cotaX + 15,
                    top: waterY + alturaAguaEscalada / 2,
                    fontSize: measureFontSize,
                    fontFamily: 'Arial',
                    fill: '#374151',
                    originY: 'center',
                    selectable: false,
                    evented: false
                });

                // Cota inferior
                const bottomCotaY = startY + cisternaHeight + 20;
                const bottomCotaLine = new fabric.Line([startX, bottomCotaY, startX + cisternaWidth, bottomCotaY], {
                    stroke: '#64748b',
                    strokeWidth: 1,
                    selectable: false,
                    evented: false
                });

                const bottomCotaMarks = [
                    new fabric.Line([startX, bottomCotaY - 5, startX, bottomCotaY + 5], { stroke: '#64748b', strokeWidth: 1, selectable: false, evented: false }),
                    new fabric.Line([startX + cisternaWidth, bottomCotaY - 5, startX + cisternaWidth, bottomCotaY + 5], { stroke: '#64748b', strokeWidth: 1, selectable: false, evented: false })
                ];

                const widthMeasure = new fabric.Text(`${largo.value} m`, {
                    left: startX + cisternaWidth / 2,
                    top: bottomCotaY + 15,
                    fontSize: measureFontSize,
                    fontFamily: 'Arial',
                    fill: '#374151',
                    originX: 'center',
                    selectable: false,
                    evented: false
                });

                // Título
                const title = new fabric.Text('CISTERNA - VISTA FRONTAL', {
                    left: containerWidth / 2,
                    top: 20,
                    fontSize: Math.max(12, Math.min(16, containerWidth / 50)),
                    fontFamily: 'Arial',
                    fill: '#1f2937',
                    fontWeight: 'bold',
                    originX: 'center',
                    selectable: false,
                    evented: false
                });

                // Información adicional
                const infoTexts = [
                    `Vol. Requerido: ${volumenCisterna.value.toFixed(2)} m³`,
                    `Vol. Calculado: ${volumenCalculado.value.toFixed(2)} m³`,
                    `Ancho: ${ancho.value} m`
                ];

                const infoObjects = infoTexts.map((text, index) => new fabric.Text(text, {
                    left: 20,
                    top: 50 + (index * (measureFontSize + 5)),
                    fontSize: measureFontSize,
                    fontFamily: 'Arial',
                    fill: '#4b5563',
                    selectable: false,
                    evented: false
                }));

                // Agregar todos los objetos al canvas
                canvas.value.add(
                    mainRect, waterRect, waterLine, roofLine,
                    roofLabel, freeboardLabel, waterLabel,
                    mainCotaLine, ...cotaMarks,
                    roofMeasure, freeboardMeasure, waterMeasure,
                    bottomCotaLine, ...bottomCotaMarks, widthMeasure,
                    title, ...infoObjects
                );
            };

            const drawCisternaNative = () => {
                const canvasElement = document.getElementById('cisternaCanvas');
                if (!canvasElement) return;

                const ctx = canvasElement.getContext('2d');
                const container = canvasElement.parentElement;
                canvasElement.width = container.clientWidth || 650;
                canvasElement.height = 450;

                ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
                ctx.fillStyle = '#f8fafc';
                ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);

                const marginLeft = 80;
                const marginRight = 200;
                const marginTop = 60;
                const marginBottom = 80;
                const drawingWidth = canvasElement.width - marginLeft - marginRight;
                const drawingHeight = canvasElement.height - marginTop - marginBottom;

                const scale = Math.min(drawingWidth / largo.value, drawingHeight / alturaTotal.value) * 0.8;
                const cisternaWidth = largo.value * scale;
                const cisternaHeight = alturaTotal.value * scale;
                const startX = marginLeft + (drawingWidth - cisternaWidth) / 2;
                const startY = marginTop + (drawingHeight - cisternaHeight) / 2;

                // Estructura principal
                ctx.strokeStyle = '#334155';
                ctx.lineWidth = 2;
                ctx.fillStyle = '#f1f5f9';
                ctx.fillRect(startX, startY, cisternaWidth, cisternaHeight);
                ctx.strokeRect(startX, startY, cisternaWidth, cisternaHeight);

                // Área de agua
                const alturaAguaEscalada = alturaUtil.value * scale;
                const waterY = startY + cisternaHeight - alturaAguaEscalada;
                ctx.fillStyle = 'rgba(59, 130, 246, 0.6)';
                ctx.fillRect(startX + 2, waterY, cisternaWidth - 4, alturaAguaEscalada - 2);

                // Líneas divisorias
                ctx.strokeStyle = '#64748b';
                ctx.lineWidth = 1;
                ctx.setLineDash([5, 5]);
                const techoY = startY + (alturaTecho.value * scale);

                ctx.beginPath();
                ctx.moveTo(startX, waterY);
                ctx.lineTo(startX + cisternaWidth, waterY);
                ctx.moveTo(startX, techoY);
                ctx.lineTo(startX + cisternaWidth, techoY);
                ctx.stroke();
                ctx.setLineDash([]);

                // Etiquetas
                const fontSize = Math.max(10, Math.min(14, cisternaWidth / 25));
                ctx.fillStyle = '#374151';
                ctx.font = `bold ${fontSize}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                ctx.fillText('TECHO', startX + cisternaWidth / 2, startY + (alturaTecho.value * scale) / 2);
                ctx.fillText('BORDE LIBRE', startX + cisternaWidth / 2, techoY + (bordeLibre.value * scale) / 2);

                ctx.fillStyle = '#ffffff';
                ctx.fillText('AGUA', startX + cisternaWidth / 2, waterY + alturaAguaEscalada / 2);

                // Cotas y medidas
                const measureFontSize = Math.max(9, Math.min(12, canvasElement.width / 60));
                ctx.fillStyle = '#374151';
                ctx.font = `${measureFontSize}px Arial`;
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';

                const cotaX = startX + cisternaWidth + 25;
                ctx.fillText(`${alturaTecho.value} m`, cotaX, startY + (alturaTecho.value * scale) / 2);
                ctx.fillText(`${bordeLibre.value} m`, cotaX, techoY + (bordeLibre.value * scale) / 2);
                ctx.fillText(`${alturaUtil.value} m`, cotaX, waterY + alturaAguaEscalada / 2);

                ctx.textAlign = 'center';
                ctx.fillText(`${largo.value} m`, startX + cisternaWidth / 2, startY + cisternaHeight + 35);

                // Título
                ctx.font = `bold ${Math.max(12, Math.min(16, canvasElement.width / 50))}px Arial`;
                ctx.fillText('CISTERNA - VISTA FRONTAL', canvasElement.width / 2, 25);

                // Información adicional
                ctx.font = `${measureFontSize}px Arial`;
                ctx.textAlign = 'left';
                ctx.fillStyle = '#4b5563';

                const infoTexts = [
                    `Vol. Requerido: ${volumenCisterna.value.toFixed(2)} m³`,
                    `Vol. Calculado: ${volumenCalculado.value.toFixed(2)} m³`,
                    `Ancho: ${ancho.value} m`
                ];

                infoTexts.forEach((text, index) => {
                    ctx.fillText(text, 20, 60 + (index * (measureFontSize + 5)));
                });
            };

            const makeCanvasResponsive = () => {
                const resizeCanvas = () => {
                    if (resizeTimeout.value) {
                        clearTimeout(resizeTimeout.value);
                    }
                    resizeTimeout.value = setTimeout(() => {
                        if (canvasInitialized.value) {
                            const canvasElement = document.getElementById('cisternaCanvas');
                            if (!canvasElement) return;

                            const container = canvasElement.parentElement;
                            const newWidth = container.clientWidth || 650;
                            const newHeight = 450;

                            if (canvas.value && typeof fabric !== 'undefined') {
                                canvas.value.setDimensions({
                                    width: newWidth,
                                    height: newHeight
                                });
                                drawCisternaFabric();
                            } else {
                                drawCisternaNative();
                            }
                        }
                    }, 200);
                };

                window.addEventListener('resize', resizeCanvas, { passive: true });

                if (window.ResizeObserver) {
                    const resizeObserver = new ResizeObserver(resizeCanvas);
                    const canvasContainer = document.getElementById('cisternaCanvas')?.parentElement;
                    if (canvasContainer) {
                        resizeObserver.observe(canvasContainer);
                    }

                    onUnmounted(() => {
                        resizeObserver.disconnect();
                    });
                }

                onUnmounted(() => {
                    window.removeEventListener('resize', resizeCanvas);
                });
            };

            watch([largo, ancho, alturaUtil, bordeLibre, nivelagua, alturaTecho, consumoDiario], () => {
                consumoDiarioInterno.value = consumoDiario.value;
                calculateCisternaData();

                if (canvasInitialized.value) {
                    updateCanvas();
                }
                sendDataUpdate();
            });

            onMounted(() => {
                consumoDiarioInterno.value = consumoDiario.value;
                calculateCisternaData();
                setupEventListeners();
                initializeCanvas();
            });

            onUnmounted(() => {
                if (resizeTimeout.value) {
                    clearTimeout(resizeTimeout.value);
                }
                if (updateTimeout.value) {
                    clearTimeout(updateTimeout.value);
                }
                if (canvas.value) {
                    canvas.value.dispose();
                }
            });

            return {
                mode,
                consumoDiario,
                canvasReady,
                toggleMode,
                largo,
                ancho,
                alturaUtil,
                bordeLibre,
                nivelagua,
                alturaTecho,
                volumenCisterna,
                volumenTotal,
                alturaAguaMin,
                volumenCalculado,
                alturaTotal
            };
        }
    };

    const app = createApp(CisternaComponent);
    container.innerHTML = '';
    const vm = app.mount(container);
    container.__cisternaApp = { app, vm };
}