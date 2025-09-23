// cisterna.js - Versión optimizada y corregida
let cisternaCanvas = null;
let resizeObserver = null;
let animationFrameId = null;

// Configuración global para optimización
const CONFIG = {
    CANVAS_UPDATE_DELAY: 100,
    RESIZE_DEBOUNCE: 300,
    MAX_CANVAS_RETRIES: 5,
    RETRY_DELAY: 200
};

export function initCisternaModule() {
    const cisterna = document.getElementById('cisterna-content');
    if (!cisterna) {
        console.error('Contenedor Cisterna no encontrado');
        return;
    }

    cisterna.innerHTML = `
        <div x-data="cisternaModule" class="max-w-full mx-auto p-4">
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
                <div class="p-6">
                    <!-- Input Parameters -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div class="space-y-6">
                            <div class="bg-slate-50 rounded-lg p-6">
                                <h3 class="text-lg font-semibold text-slate-800 mb-4">2.1.1. CÁLCULO DE VOLUMEN</h3>
                                <div class="space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium text-slate-700 mb-2">Consumo Diario Total (Lt/día)</label>
                                        <input type="number" step="0.01" x-model="consumoDiario"
                                               class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                               readonly>
                                        <p class="text-xs text-slate-500 mt-1">
                                            <span x-show="!consumoDiario || consumoDiario === 0">Ingresa datos en "Cálculo de la Demanda Diaria" (sección 1)</span>
                                            <span x-show="consumoDiario && consumoDiario > 0">Valor recibido de la sección de Demanda Diaria.</span>
                                        </p>
                                    </div>
                                    <div class="bg-blue-50 p-4 rounded-lg">
                                        <p class="text-sm text-blue-800 mb-2">VOL. DE CISTERNA = 3/4 x CONSUMO DIARIO TOTAL</p>
                                        <p class="text-lg font-semibold text-blue-900">Vol. De Cisterna = <span x-text="cisterna.volumenCisterna.toFixed(2)"></span> m³</p>
                                        <p class="text-sm text-slate-600 mt-2">Vol. Total mínimo = <span x-text="cisterna.volumenTotal.toFixed(2)"></span> m³</p>
                                        <p class="text-sm text-slate-600">Altura de agua mín. = <span x-text="cisterna.alturaAguaMin.toFixed(2)"></span> m</p>
                                    </div>
                                </div>
                            </div>

                            <div class="bg-slate-50 rounded-lg p-6">
                                <h3 class="text-lg font-semibold text-slate-800 mb-4">Dimensiones de la Cisterna</h3>
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-slate-700 mb-2">Largo (L) m</label>
                                        <input type="number" step="0.01" x-model="cisterna.largo"
                                               class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-slate-700 mb-2">Ancho (A) m</label>
                                        <input type="number" step="0.01" x-model="cisterna.ancho"
                                               class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-slate-700 mb-2">Altura Útil (H) m</label>
                                        <input type="number" step="0.01" x-model="cisterna.alturaUtil"
                                               class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-slate-700 mb-2">Borde Libre (bl) m</label>
                                        <input type="number" step="0.01" x-model="cisterna.bordeLibre"
                                               class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-slate-700 mb-2">Nivel m</label>
                                        <input type="number" step="0.01" x-model="cisterna.nivelagua"
                                               class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-slate-700 mb-2">H. techo (Ht) m</label>
                                        <input type="number" step="0.01" x-model="cisterna.alturaTecho"
                                               class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                    </div>
                                </div>
                                <div class="mt-4 p-4 bg-green-50 rounded-lg">
                                    <p class="text-lg font-bold text-green-800">VOLUMEN DE CISTERNA = <span x-text="cisterna.volumenCalculado.toFixed(2)"></span> m³</p>
                                    <template x-if="cisterna.volumenCalculado < cisterna.volumenCisterna">
                                        <p class="text-base font-semibold text-red-600 mt-2">CORREGIR DIMENSIONES</p>
                                    </template>
                                </div>
                            </div>
                        </div>

                        <!-- Graphic Section -->
                        <div class="space-y-6">
                            <div class="bg-white border border-slate-200 rounded-lg p-6">
                                <h3 class="text-lg font-semibold text-slate-800 mb-2">Diagrama de Cisterna</h3>
                                <div class="relative w-full" style="height: 450px;">
                                    <!-- Loading indicator -->
                                    <div x-show="!canvasReady" class="absolute inset-0 flex items-center justify-center bg-gray-50 rounded">
                                        <div class="text-center">
                                            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                            <p class="text-sm text-gray-600">Cargando diagrama...</p>
                                        </div>
                                    </div>
                                    <canvas id="cisternaCanvas" 
                                            class="border border-slate-300 rounded w-full h-full"
                                            style="max-width: 100%; max-height: 450px;"
                                            x-show="canvasReady"></canvas>
                                </div>
                            </div>

                            <div class="bg-slate-50 rounded-lg p-6">
                                <h3 class="text-lg font-semibold text-slate-800 mb-4">2.1.2. DIMENSIONES DE LA CISTERNA</h3>
                                <div class="space-y-3">
                                    <div class="flex justify-between">
                                        <span class="text-slate-600">ANCHO (A): <span x-text="cisterna.ancho"></span> m</span>
                                        <span class="font-medium">Ancho de la Cisterna</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-slate-600">LARGO (L): <span x-text="cisterna.largo"></span> m</span>
                                        <span class="font-medium">Largo de la Cisterna</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-slate-600">ALTURA DE AGUA (H): <span x-text="cisterna.alturaUtil"></span> m</span>
                                        <span class="font-medium">Altura de agua de la Cisterna</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-slate-600">Borde Libre (bl): <span x-text="cisterna.bordeLibre"></span> m</span>
                                        <span class="font-medium">Altura de la Cisterna</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-slate-600">Altura total (HT): <span x-text="cisterna.alturaTotal"></span> m</span>
                                        <span class="font-medium">Altura total de la Cisterna</span>
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
    `;

    // Inicializar Alpine.js data
    Alpine.data('cisternaModule', () => ({
        mode: 'view',
        consumoDiario: 0,
        canvasReady: false,
        canvasInitialized: false,
        updatePending: false,
        canvas: null,
        resizeTimeout: null,
        updateTimeout: null,
        isDrawing: false,

        cisterna: {
            largo: 4.40,
            ancho: 2.70,
            alturaUtil: 1.90,
            bordeLibre: 0.50,
            nivelagua: 0.65,
            alturaTecho: 0.20,
            consumoDiarioInterno: 0,

            get volumenCisterna() {
                const consumoDiarioM3 = this.consumoDiarioInterno / 1000;
                return (3 / 4) * consumoDiarioM3;
            },

            get volumenTotal() {
                return this.volumenCisterna;
            },

            get alturaAguaMin() {
                if (this.largo === 0 || this.ancho === 0) return 0;
                return (this.volumenCisterna / (this.largo * this.ancho));
            },

            get volumenCalculado() {
                return this.largo * this.ancho * this.alturaUtil;
            },

            get alturaTotal() {
                return this.alturaUtil + this.bordeLibre + this.alturaTecho;
            }
        },

        calculatedData: {
            alturaIngreso: 0.15,
            volumencisterna: 0.10,
            nivel1: 0,
            nivel2: 0,
            nivel3: 0,
            nivel4: 0,
            nivel5: 0
        },

        init() {
            this.cisterna.consumoDiarioInterno = this.consumoDiario;
            this.calculateCisternaData();
            this.setupEventListeners();
            this.setupWatchers();

            // Inicializar canvas con delay para asegurar que el DOM esté listo
            this.$nextTick(() => {
                setTimeout(() => {
                    this.initializeCanvas();
                }, 100);
            });
        },

        setupEventListeners() {
            document.addEventListener('demanda-diaria-updated', (event) => {
                const totalCaudal = parseFloat(event.detail.totalCaudal || 0);
                this.consumoDiario = totalCaudal;
                this.cisterna.consumoDiarioInterno = this.consumoDiario;
                this.calculateCisternaData();
                this.updateCanvas();
                this.sendDataUpdate();
            });
        },

        setupWatchers() {
            const properties = [
                'cisterna.largo', 'cisterna.ancho', 'cisterna.alturaUtil',
                'cisterna.bordeLibre', 'cisterna.nivelagua', 'cisterna.alturaTecho',
                'consumoDiario'
            ];

            properties.forEach(prop => {
                this.$watch(prop, () => {
                    if (prop === 'consumoDiario') {
                        this.cisterna.consumoDiarioInterno = this.consumoDiario;
                    }
                    this.calculateCisternaData();

                    if (this.canvasInitialized) {
                        this.updateCanvas();
                    }
                    this.sendDataUpdate();
                });
            });
        },

        calculateCisternaData() {
            const cisterna = this.cisterna;
            const round = (num, decimals = 4) => parseFloat(num.toFixed(decimals));

            const alturaIngreso = (cisterna.volumenCalculado <= 12) ? 0.15 :
                ((cisterna.volumenCalculado <= 30) ? 0.2 : 0.3);

            const volumencisterna = (cisterna.volumenCalculado > 30) ? 0.15 : 0.10;

            const nivel1 = round(parseFloat(cisterna.nivelagua) - 0.2);
            const nivel2 = round(nivel1 - cisterna.alturaTecho);
            const nivel3 = round(nivel2 - alturaIngreso);
            const nivel4 = round(nivel3 - volumencisterna);
            const nivel5 = round(nivel4 - cisterna.alturaUtil);

            this.calculatedData = {
                largo: cisterna.largo,
                ancho: cisterna.ancho,
                alto: cisterna.alturaTotal,
                alturaIngreso: alturaIngreso,
                volumencisterna: cisterna.volumenCisterna,
                nivel1: nivel1,
                nivel2: nivel2,
                nivel3: nivel3,
                nivel4: nivel4,
                nivel5: nivel5
            };
        },

        toggleMode() {
            this.mode = this.mode === 'view' ? 'edit' : 'view';
        },

        initializeCanvas() {
            if (this.canvasInitialized) return;

            const canvasElement = document.getElementById('cisternaCanvas');
            if (!canvasElement) {
                console.warn('Canvas element not found, retrying...');
                setTimeout(() => this.initializeCanvas(), 200);
                return;
            }

            // Verificar dimensiones del contenedor
            const container = canvasElement.parentElement;
            if (!container || container.clientWidth === 0) {
                setTimeout(() => this.initializeCanvas(), 200);
                return;
            }

            this.calculateCisternaData();

            // Intentar usar Fabric.js si está disponible, sino usar canvas nativo
            if (typeof fabric !== 'undefined') {
                this.initializeFabricCanvas();
            } else {
                console.warn('Fabric.js no disponible, usando canvas nativo');
                this.initializeNativeCanvas();
            }

            this.makeCanvasResponsive();
            this.canvasInitialized = true;
            this.canvasReady = true;
        },

        initializeFabricCanvas() {
            const canvasElement = document.getElementById('cisternaCanvas');
            const container = canvasElement.parentElement;
            const containerWidth = container.clientWidth || 650;
            const containerHeight = 450;

            canvasElement.width = containerWidth;
            canvasElement.height = containerHeight;

            if (this.canvas) {
                this.canvas.dispose();
            }

            this.canvas = new fabric.Canvas('cisternaCanvas', {
                width: containerWidth,
                height: containerHeight,
                backgroundColor: '#f8fafc',
                selection: false,
                allowTouchScrolling: true
            });

            this.drawCisternaFabric();
        },

        initializeNativeCanvas() {
            this.drawCisternaNative();
        },

        updateCanvas() {
            if (this.updateTimeout) {
                clearTimeout(this.updateTimeout);
            }

            this.updateTimeout = setTimeout(() => {
                if (!this.isDrawing && this.canvasInitialized) {
                    const canvasElement = document.getElementById('cisternaCanvas');
                    if (!canvasElement) return;

                    const rect = canvasElement.getBoundingClientRect();
                    if (rect.width === 0 || rect.height === 0) return;

                    if (this.canvas && typeof fabric !== 'undefined') {
                        this.drawCisternaFabric();
                    } else {
                        this.drawCisternaNative();
                    }
                }
            }, 150);
        },

        drawCisternaFabric() {
            if (this.isDrawing || !this.canvas) return;
            this.isDrawing = true;

            try {
                const canvasElement = document.getElementById('cisternaCanvas');
                const container = canvasElement.parentElement;
                const containerWidth = container.clientWidth || 650;
                const containerHeight = 450;

                this.canvas.setDimensions({
                    width: containerWidth,
                    height: containerHeight
                });
                this.canvas.clear();

                this.drawStructureFabric(containerWidth, containerHeight);
                this.canvas.renderAll();

            } catch (error) {
                console.error('Error al dibujar con Fabric:', error);
                this.drawCisternaNative();
            } finally {
                this.isDrawing = false;
            }
        },

        drawStructureFabric(containerWidth, containerHeight) {
            const cisterna = this.cisterna;
            const marginLeft = 80;
            const marginRight = 200;
            const marginTop = 60;
            const marginBottom = 80;

            const drawingWidth = containerWidth - marginLeft - marginRight;
            const drawingHeight = containerHeight - marginTop - marginBottom;

            const scale = Math.min(drawingWidth / cisterna.largo, drawingHeight / cisterna.alturaTotal) * 0.8;
            const cisternaWidth = cisterna.largo * scale;
            const cisternaHeight = cisterna.alturaTotal * scale;

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
            const alturaAguaEscalada = cisterna.alturaUtil * scale;
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
            const techoY = startY + (cisterna.alturaTecho * scale);

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
                top: startY + (cisterna.alturaTecho * scale) / 2,
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
                top: techoY + (cisterna.bordeLibre * scale) / 2,
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
            const roofMeasure = new fabric.Text(`${cisterna.alturaTecho} m`, {
                left: cotaX + 15,
                top: startY + (cisterna.alturaTecho * scale) / 2,
                fontSize: measureFontSize,
                fontFamily: 'Arial',
                fill: '#374151',
                originY: 'center',
                selectable: false,
                evented: false
            });

            const freeboardMeasure = new fabric.Text(`${cisterna.bordeLibre} m`, {
                left: cotaX + 15,
                top: techoY + (cisterna.bordeLibre * scale) / 2,
                fontSize: measureFontSize,
                fontFamily: 'Arial',
                fill: '#374151',
                originY: 'center',
                selectable: false,
                evented: false
            });

            const waterMeasure = new fabric.Text(`${cisterna.alturaUtil} m`, {
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

            const widthMeasure = new fabric.Text(`${cisterna.largo} m`, {
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
                `Vol. Requerido: ${cisterna.volumenCisterna.toFixed(2)} m³`,
                `Vol. Calculado: ${cisterna.volumenCalculado.toFixed(2)} m³`,
                `Ancho: ${cisterna.ancho} m`
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
            this.canvas.add(
                mainRect, waterRect, waterLine, roofLine,
                roofLabel, freeboardLabel, waterLabel,
                mainCotaLine, ...cotaMarks,
                roofMeasure, freeboardMeasure, waterMeasure,
                bottomCotaLine, ...bottomCotaMarks, widthMeasure,
                title, ...infoObjects
            );
        },

        drawCisternaNative() {
            const canvas = document.getElementById('cisternaCanvas');
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            const container = canvas.parentElement;
            canvas.width = container.clientWidth || 650;
            canvas.height = 450;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const cisterna = this.cisterna;
            const marginLeft = 80;
            const marginRight = 200;
            const marginTop = 60;
            const marginBottom = 80;
            const drawingWidth = canvas.width - marginLeft - marginRight;
            const drawingHeight = canvas.height - marginTop - marginBottom;

            const scale = Math.min(drawingWidth / cisterna.largo, drawingHeight / cisterna.alturaTotal) * 0.8;
            const cisternaWidth = cisterna.largo * scale;
            const cisternaHeight = cisterna.alturaTotal * scale;
            const startX = marginLeft + (drawingWidth - cisternaWidth) / 2;
            const startY = marginTop + (drawingHeight - cisternaHeight) / 2;

            // Estructura principal
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 2;
            ctx.fillStyle = '#f1f5f9';
            ctx.fillRect(startX, startY, cisternaWidth, cisternaHeight);
            ctx.strokeRect(startX, startY, cisternaWidth, cisternaHeight);

            // Área de agua
            const alturaAguaEscalada = cisterna.alturaUtil * scale;
            const waterY = startY + cisternaHeight - alturaAguaEscalada;
            ctx.fillStyle = 'rgba(59, 130, 246, 0.6)';
            ctx.fillRect(startX + 2, waterY, cisternaWidth - 4, alturaAguaEscalada - 2);

            // Líneas divisorias
            ctx.strokeStyle = '#64748b';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            const techoY = startY + (cisterna.alturaTecho * scale);

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

            ctx.fillText('TECHO', startX + cisternaWidth / 2, startY + (cisterna.alturaTecho * scale) / 2);
            ctx.fillText('BORDE LIBRE', startX + cisternaWidth / 2, techoY + (cisterna.bordeLibre * scale) / 2);

            ctx.fillStyle = '#ffffff';
            ctx.fillText('AGUA', startX + cisternaWidth / 2, waterY + alturaAguaEscalada / 2);

            // Cotas y medidas
            const measureFontSize = Math.max(9, Math.min(12, canvas.width / 60));
            ctx.fillStyle = '#374151';
            ctx.font = `${measureFontSize}px Arial`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';

            const cotaX = startX + cisternaWidth + 25;
            ctx.fillText(`${cisterna.alturaTecho} m`, cotaX, startY + (cisterna.alturaTecho * scale) / 2);
            ctx.fillText(`${cisterna.bordeLibre} m`, cotaX, techoY + (cisterna.bordeLibre * scale) / 2);
            ctx.fillText(`${cisterna.alturaUtil} m`, cotaX, waterY + alturaAguaEscalada / 2);

            ctx.textAlign = 'center';
            ctx.fillText(`${cisterna.largo} m`, startX + cisternaWidth / 2, startY + cisternaHeight + 35);

            // Título
            ctx.font = `bold ${Math.max(12, Math.min(16, canvas.width / 50))}px Arial`;
            ctx.fillText('CISTERNA - VISTA FRONTAL', canvas.width / 2, 25);

            // Información adicional
            ctx.font = `${measureFontSize}px Arial`;
            ctx.textAlign = 'left';
            ctx.fillStyle = '#4b5563';

            const infoTexts = [
                `Vol. Requerido: ${cisterna.volumenCisterna.toFixed(2)} m³`,
                `Vol. Calculado: ${cisterna.volumenCalculado.toFixed(2)} m³`,
                `Ancho: ${cisterna.ancho} m`
            ];

            infoTexts.forEach((text, index) => {
                ctx.fillText(text, 20, 60 + (index * (measureFontSize + 5)));
            });
        },

        makeCanvasResponsive() {
            const resizeCanvas = () => {
                if (this.resizeTimeout) {
                    clearTimeout(this.resizeTimeout);
                }
                this.resizeTimeout = setTimeout(() => {
                    if (this.canvasInitialized) {
                        const canvasElement = document.getElementById('cisternaCanvas');
                        if (!canvasElement) return;

                        const container = canvasElement.parentElement;
                        const newWidth = container.clientWidth || 650;
                        const newHeight = 450;

                        if (this.canvas && typeof fabric !== 'undefined') {
                            this.canvas.setDimensions({
                                width: newWidth,
                                height: newHeight
                            });
                            this.drawCisternaFabric();
                        } else {
                            this.drawCisternaNative();
                        }
                    }
                }, 200);
            };

            window.addEventListener('resize', resizeCanvas, { passive: true });

            if (window.ResizeObserver) {
                const resizeObserver = new ResizeObserver(() => resizeCanvas());
                const canvasContainer = document.getElementById('cisternaCanvas')?.parentElement;
                if (canvasContainer) {
                    resizeObserver.observe(canvasContainer);
                }
            }
        },

        sendDataUpdate() {
            const data = {
                consumoDiario: this.consumoDiario,
                ...this.cisterna,
                ...this.calculatedData
            };

            document.dispatchEvent(new CustomEvent('cisterna-updated', {
                detail: data,
                bubbles: false
            }));
        }
    }));
}
// Inicializar cuando el DOM esté listo
//document.addEventListener('DOMContentLoaded', initCisternaModule);
