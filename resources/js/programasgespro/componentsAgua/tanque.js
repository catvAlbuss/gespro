export function initTanqueModule() {
    const tanque = document.getElementById('tanque-content');
    if (!tanque) {
        console.error('Contenedor tanque no encontrado');
        return;
    }

    tanque.innerHTML = `
        <div x-data="tanqueModule" class="max-w-full mx-auto p-4">
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
                                <h3 class="text-lg font-semibold text-slate-800 mb-4">2.2.1. CÁLCULO DE VOLUMEN DEL
                                    TANQUE ELEVADO</h3>
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
                                    <div class="bg-emerald-50 p-4 rounded-lg">
                                        <p class="text-sm text-emerald-800 mb-2">VOL. DE TANQUE ELEVADO = 1/3 x
                                            CONSUMO
                                            DIARIO TOTAL</p>
                                        <p class="text-lg font-semibold text-emerald-900">Vol. De T.E. = <span
                                                x-text="tanque.volumenTE.toFixed(2)"></span> m³</p>
                                        <p class="text-sm text-slate-600 mt-2">Vol. Total (Calculado + Reserva) =
                                            <span x-text="tanque.volumenReserva.toFixed(2)"></span> m³
                                        </p>
                                        <p class="text-sm text-slate-600">Altura de agua mín. = <span
                                                x-text="tanque.alturaAguaMin.toFixed(2)"></span> m</p>
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
                                        <input type="number" step="0.01" x-model="tanque.largo"
                                            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-slate-700 mb-2">Ancho (A)
                                            m</label>
                                        <input type="number" step="0.01" x-model="tanque.ancho"
                                            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-slate-700 mb-2">Altura agua (H)
                                            m</label>
                                        <input type="number" step="0.01" x-model="tanque.alturaAgua"
                                            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-slate-700 mb-2">Altura Limpieza
                                            (hl) m</label>
                                        <input type="number" step="0.01" x-model="tanque.alturaLimpieza"
                                            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-slate-700 mb-2">Borde Libre
                                            (bl)
                                            m</label>
                                        <input type="number" step="0.01" x-model="tanque.bordeLibre"
                                            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-slate-700 mb-2">Altura total
                                            (HT)
                                            m</label>
                                        <input type="number" step="0.01" x-model="tanque.alturaTotal"
                                            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                                    </div>

                                    <div>
                                        <label class="block text-sm font-medium text-slate-700 mb-2">H. techo (Ht)
                                            m</label>
                                        <input type="number" step="0.01" x-model="tanque.htecho"
                                            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-slate-700 mb-2">H. ingreso (Hi)
                                            m</label>
                                        <input type="number" step="0.01" x-model="tanque.hingreso"
                                            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-slate-700 mb-2">H. rebose (Hr)
                                            m</label>
                                        <input type="number" step="0.01" x-model="tanque.hrebose"
                                            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-slate-700 mb-2">Altura Libre (HL)
                                            m</label>
                                        <input type="number" step="0.01" x-model="tanque.alturalibre"
                                            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                                    </div>
                                </div>
                                <div class="mt-4 p-4 bg-green-50 rounded-lg">
                                    <p class="text-lg font-bold text-green-800">VOLUMEN DE TANQUE ELEVADO = <span
                                            x-text="tanque.volumenCalculado.toFixed(2)"></span> m³</p>
                                    <template x-if="tanque.volumenCalculado < tanque.volumenTE">
                                        <p class="text-base font-semibold text-red-600 mt-2">CORREGIR DIMENSIONES</p>
                                    </template>
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
                                        <span class="text-slate-600">ANCHO (A): <span
                                                x-text="tanque.ancho"></span> m</span>
                                        <span class="font-medium">Ancho del Tanque Elevado</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-slate-600">LARGO (L): <span
                                                x-text="tanque.largo"></span> m</span>
                                        <span class="font-medium">Largo del Tanque Elevado</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-slate-600">ALTURA DE AGUA (H): <span
                                                x-text="tanque.alturaAgua"></span> m</span>
                                        <span class="font-medium">Altura de agua del Tanque Elevado</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-slate-600">ALTURA DE LIMPIEZA (hl): <span
                                                x-text="tanque.alturaLimpieza"></span> m</span>
                                        <span class="font-medium">Altura de limpieza del Tanque Elevado</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-slate-600">BORDE LIBRE (bl): <span
                                                x-text="tanque.bordeLibre"></span> m</span>
                                        <span class="font-medium">borde del Tanque Elevado</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-slate-600">Altura Total (HT): <span
                                                x-text="tanque.alturaTotal"></span> m</span>
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
    `;

    Alpine.data('tanqueModule', () => ({
        mode: 'view',
        consumoDiario: 0,
        tanqueCanvas: null,
        isDrawing: false, // Flag to prevent concurrent draw calls

        tanque: {
            consumoDiarioInterno: 0,
            largo: 4.40,
            ancho: 2.70,
            alturaAgua: 1.15,
            alturaLimpieza: 0.10,
            bordeLibre: 0.45,
            alturaTotal: 1.70,
            htecho: 0.20,
            hingreso: 0.15,
            hrebose: 0.10,
            alturalibre: 0.10,

            get volumenTE() {
                return ((1 / 3) * (parseFloat(this.consumoDiarioInterno) || 0)) / 1000;
            },
            get volumenReserva() {
                return this.volumenTE * 1.25;
            },
            get volumenTotal() {
                return this.volumenTE + this.volumenReserva;
            },
            get alturaAguaMin() {
                return (this.volumenTE / (parseFloat(this.largo) * parseFloat(this.ancho))) || 0;
            },
            get volumenCalculado() {
                return (parseFloat(this.largo) * parseFloat(this.ancho) * parseFloat(this.alturaAgua)) || 0;
            }
        },

        // Unificada: Enviar todos los datos relevantes del tanque (predeterminados y actualizados)
        sendDataUpdate() {
            const data = {
                // Datos principales del tanque
                consumoDiario: this.consumoDiario,
                ...this.tanque,
                volumenTE: this.tanque.volumenTE,
                volumenReserva: this.tanque.volumenReserva,
                volumenTotal: this.tanque.volumenTotal,
                alturaAguaMin: this.tanque.alturaAguaMin,
                volumenCalculado: this.tanque.volumenCalculado,
                mode: this.mode,
                // Niveles enumerados y calculados
                niveles: this.niveles,
                // Otros datos si existen (compatibilidad)
                totalCaudal: this.totalCaudal,
                tabla1: this.tabla1,
                tabla2: this.tabla2,
                tabla3: this.tabla3
            };
            //console.log(data);
            document.dispatchEvent(new CustomEvent('tanque-updated', {
                detail: data
            }));
        },

        // Niveles del tanque enumerados y calculados
        get niveles() {
            // Ejemplo de valores, puedes ajustar los cálculos según tu lógica real
            // Aquí se usan los mismos valores que en drawTanqueWaterLevels
            const base = 16.40;
            const htecho = parseFloat(this.tanque.htecho) || 0;
            const hingreso = parseFloat(this.tanque.hingreso) || 0;
            const hrebose = parseFloat(this.tanque.hrebose) || 0;
            const alturalibre = parseFloat(this.tanque.alturalibre) || 0;
            const alturaTotal = parseFloat(this.tanque.alturaTotal) || 0;
            return [
                { numero: 1, nombre: 'Nivel Superior', valor: +(base).toFixed(2) },
                { numero: 2, nombre: 'Nivel Techo', valor: +(base - htecho * 1).toFixed(2) },
                { numero: 3, nombre: 'Nivel Ingreso', valor: +(base - htecho - hingreso).toFixed(2) },
                { numero: 4, nombre: 'Nivel Rebose', valor: +(base - htecho - hingreso - hrebose).toFixed(2) },
                { numero: 5, nombre: 'Nivel Salida', valor: +(base - alturaTotal + alturalibre).toFixed(2) },
                { numero: 6, nombre: 'Nivel Inferior', valor: +(base - alturaTotal).toFixed(2) }
            ];
        },

        init() {
            this.normalizeTanqueNumbers();
            this.setupEventListeners();
            this.setupWatchers();
            this.tanque.consumoDiarioInterno = parseFloat(this.consumoDiario) || 0;
            this.sendDataUpdate(); // Enviar datos al iniciar
            this.$nextTick(() => {
                this.initCanvas();
            });
        },

        initCanvas() {
            // Check if Fabric.js and canvas element are available
            if (typeof fabric === 'undefined' || !document.getElementById('tanqueCanvas')) {
                console.warn('Fabric.js or canvas element not found. Retrying in 200ms.');
                setTimeout(() => this.initCanvas(), 200);
                return;
            }

            this.drawTanque();
            this.setupCanvasResponsive();
        },


        drawTanque() {
            if (this.isDrawing) return; // Prevent concurrent draws
            this.isDrawing = true;

            const canvasElement = document.getElementById('tanqueCanvas');
            if (!canvasElement) {
                console.warn('Canvas element not found.');
                this.isDrawing = false;
                return;
            }

            // Normalize numbers before drawing
            this.normalizeTanqueNumbers();

            // Set canvas dimensions
            const containerWidth = 650;
            const containerHeight = 450;
            canvasElement.width = containerWidth;
            canvasElement.height = containerHeight;

            // Dispose previous canvas safely
            if (this.tanqueCanvas && typeof this.tanqueCanvas.dispose === 'function') {
                try {
                    this.tanqueCanvas.dispose();
                    this.tanqueCanvas = null;
                } catch (e) {
                    console.warn('Error disposing canvas:', e);
                }
            }

            // Initialize new Fabric.js canvas
            try {
                this.tanqueCanvas = new fabric.Canvas('tanqueCanvas', {
                    width: containerWidth,
                    height: containerHeight,
                    backgroundColor: '#f8fafc'
                });
            } catch (e) {
                console.error('Error initializing Fabric.js canvas:', e);
                this.isDrawing = false;
                return;
            }

            // Calculate scale and positions
            const margin = 40;
            const availableWidth = containerWidth - (margin * 2);
            const availableHeight = containerHeight - (margin * 2);

            const scaleX = Math.min(availableWidth * 0.35, 180) / (parseFloat(this.tanque.largo) || 1);
            const scaleY = Math.min(availableHeight * 0.6, 200) / (parseFloat(this.tanque.alturaTotal) || 1);
            const scale = Math.min(scaleX, scaleY);

            const tanqueWidth = (parseFloat(this.tanque.largo) || 1) * scale;
            const tanqueHeight = (parseFloat(this.tanque.alturaTotal) || 1) * scale;
            const startX = margin + 80;
            const startY = margin + 80;

            // Draw tank components
            this.drawTanqueSupport(startX, startY + tanqueHeight, tanqueWidth, tanqueHeight);
            this.drawTanqueMainStructure(startX, startY, tanqueWidth, tanqueHeight, scale);
            this.drawTanquePipes(startX, startY, tanqueWidth, tanqueHeight, scale);
            this.drawTanqueWaterLevels(startX, startY, tanqueWidth, tanqueHeight, scale);
            this.drawTanqueLabelsAndMeasurements(startX, startY, tanqueWidth, tanqueHeight, scale, containerWidth);

            this.isDrawing = false;
        },

        drawTanqueSupport(x, y, width, height) {
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
                this.tanqueCanvas.add(column);
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
            this.tanqueCanvas.add(beam);

            const foundation = new fabric.Rect({
                left: x - 30,
                top: y + columnHeight,
                width: width + 60,
                height: 12,
                fill: '#9ca3af',
                stroke: '#374151',
                strokeWidth: 2
            });
            this.tanqueCanvas.add(foundation);
        },

        drawTanqueMainStructure(x, y, width, height, scale) {
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
            this.tanqueCanvas.add(background);

            const roof = new fabric.Rect({
                left: x - 12,
                top: y - 15,
                width: width + 24,
                height: 15,
                fill: '#d1d5db',
                stroke: '#374151',
                strokeWidth: 2
            });
            this.tanqueCanvas.add(roof);

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
                this.tanqueCanvas.add(wallRect);
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
            this.tanqueCanvas.add(floor);

            const interior = new fabric.Rect({
                left: x,
                top: y,
                width: width,
                height: height,
                fill: '#ffffff',
                stroke: '#334155',
                strokeWidth: 2
            });
            this.tanqueCanvas.add(interior);

            this.drawWaterZones(x, y, width, height, scale);
        },

        drawWaterZones(x, y, width, height, scale) {
            const cleaningHeight = (parseFloat(this.tanque.alturaLimpieza) || 0) * scale;
            const cleaningArea = new fabric.Rect({
                left: x + 2,
                top: y + height - cleaningHeight,
                width: width - 4,
                height: cleaningHeight - 2,
                fill: '#fef3c7',
                opacity: 0.8
            });
            this.tanqueCanvas.add(cleaningArea);

            const waterHeight = (parseFloat(this.tanque.alturaAgua) || 0) * scale;
            const waterY = y + height - waterHeight;
            const waterArea = new fabric.Rect({
                left: x + 2,
                top: waterY,
                width: width - 4,
                height: waterHeight - cleaningHeight,
                fill: '#3b82f6',
                opacity: 0.7
            });
            this.tanqueCanvas.add(waterArea);

            const bordeLibreHeight = (parseFloat(this.tanque.bordeLibre) || 0) * scale;
            const bordeLibreArea = new fabric.Rect({
                left: x + 2,
                top: y + 2,
                width: width - 4,
                height: bordeLibreHeight,
                fill: '#fbbf24',
                opacity: 0.3
            });
            this.tanqueCanvas.add(bordeLibreArea);

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
            this.tanqueCanvas.add(bordeLibreText);
        },

        drawTanquePipes(x, y, width, height, scale) {
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
                    rect: { left: x - pipeLength, top: y + ((parseFloat(this.tanque.htecho) || 0) * scale), width: pipeLength, height: pipeWidth },
                    color: '#f59e0b'
                },
                {
                    name: 'rebose',
                    rect: { left: x + width, top: y + ((parseFloat(this.tanque.htecho) || 0) * scale) + ((parseFloat(this.tanque.hingreso) || 0) * scale), width: pipeLength, height: pipeWidth },
                    color: '#ef4444'
                },
                {
                    name: 'salida',
                    rect: { left: x + width, top: y + height - ((parseFloat(this.tanque.alturalibre) || 0) * scale), width: pipeLength, height: pipeWidth },
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
                this.tanqueCanvas.add(pipeRect);
            });

            this.drawPipeLevelLines(x, y, width, height, scale);
        },

        drawPipeLevelLines(x, y, width, height, scale) {
            const lines = [
                { y: y + ((parseFloat(this.tanque.htecho) || 0) * scale) + ((parseFloat(this.tanque.hingreso) || 0) * scale), color: '#f59e0b' },
                { y: y + ((parseFloat(this.tanque.htecho) || 0) * scale) + ((parseFloat(this.tanque.hingreso) || 0) * scale) + ((parseFloat(this.tanque.hrebose) || 0) * scale), color: '#ef4444' },
                { y: y + height - ((parseFloat(this.tanque.alturalibre) || 0) * scale), color: '#10b981' }
            ];

            lines.forEach(line => {
                const levelLine = new fabric.Line([x, line.y + 4, x + width, line.y + 4], {
                    stroke: line.color,
                    strokeWidth: 2,
                    strokeDashArray: [5, 5]
                });
                this.tanqueCanvas.add(levelLine);
            });
        },

        drawTanqueWaterLevels(x, y, width, height, scale) {
            const rightX = x + width + 50;

            const levels = [
                { name: 'Nivel', value: '+16.40', color: '#1f2937', y: y - 20 },
                { name: 'Nivel', value: '+16.20', color: '#ef4444', y: y + ((parseFloat(this.tanque.htecho) || 0) * scale * 0.5) },
                { name: 'Nivel', value: '+16.00', color: '#f59e0b', y: y + ((parseFloat(this.tanque.htecho) || 0) * scale) + ((parseFloat(this.tanque.hingreso) || 0) * scale * 0.5) },
                { name: 'Nivel', value: '+15.85', color: '#10b981', y: y + ((parseFloat(this.tanque.htecho) || 0) * scale) + ((parseFloat(this.tanque.hingreso) || 0) * scale) },
                { name: 'Nivel', value: '+15.75', color: '#3b82f6', y: y + ((parseFloat(this.tanque.htecho) || 0) * scale) + ((parseFloat(this.tanque.hingreso) || 0) * scale) + ((parseFloat(this.tanque.hrebose) || 0) * scale) },
                { name: 'Nivel', value: '+14.60', color: '#8b5cf6', y: y + height - ((parseFloat(this.tanque.alturalibre) || 0) * scale) - 10 },
                { name: 'Nivel', value: '+14.50', color: '#6b7280', y: y + height - 5 }
            ];

            levels.forEach((level, index) => {
                const line = new fabric.Line([rightX, level.y, rightX + 100, level.y], {
                    stroke: level.color,
                    strokeWidth: 2
                });
                this.tanqueCanvas.add(line);

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
                this.tanqueCanvas.add(textBg);

                const text = new fabric.Text(`${level.name} = ${level.value} m`, {
                    left: rightX + 110,
                    top: level.y,
                    fontSize: 10,
                    fontFamily: 'Arial',
                    fill: '#ffffff',
                    originY: 'center'
                });
                this.tanqueCanvas.add(text);

                if (index > 0) {
                    const connector = new fabric.Line([x + width, level.y, rightX, level.y], {
                        stroke: level.color,
                        strokeWidth: 1,
                        strokeDashArray: [3, 3]
                    });
                    this.tanqueCanvas.add(connector);
                }
            });
        },

        drawTanqueLabelsAndMeasurements(x, y, width, height, scale, containerWidth) {
            const title = new fabric.Text('Tanque Elevado cuyas dimensiones serán:', {
                left: containerWidth / 2,
                top: 15,
                fontSize: 16,
                fontFamily: 'Arial',
                fill: '#1f2937',
                fontWeight: 'bold',
                originX: 'center'
            });
            this.tanqueCanvas.add(title);

            const measurements = [
                { label: 'H. techo', value: parseFloat(this.tanque.htecho) || 0, color: '#8b5cf6' },
                { label: 'H. ingreso', value: parseFloat(this.tanque.hingreso) || 0, color: '#f59e0b' },
                { label: 'H. rebose', value: parseFloat(this.tanque.hrebose) || 0, color: '#ef4444' }
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
                this.tanqueCanvas.add(measureText);
                measureY += 20;
            });

            const mainDimensions = [
                `Nivel Superior = +${(16.40).toFixed(2)} m`,
                `Largo: ${(parseFloat(this.tanque.largo) || 0).toFixed(2)} m`,
                `Ancho: ${(parseFloat(this.tanque.ancho) || 0).toFixed(2)} m`,
                `Altura Total: ${(parseFloat(this.tanque.alturaTotal) || 0).toFixed(2)} m`,
                `Volumen TE: ${(this.tanque.volumenTE || 0).toFixed(2)} m³`,
                `Volumen Total: ${(this.tanque.volumenTotal || 0).toFixed(2)} m³`
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
                this.tanqueCanvas.add(dimText);
                dimY += 18;
            });

            this.drawHeightMeasurement(x, y, height);
        },

        drawHeightMeasurement(x, y, height) {
            const heightLine = new fabric.Line([x - 35, y, x - 35, y + height], {
                stroke: '#6b7280',
                strokeWidth: 2
            });
            this.tanqueCanvas.add(heightLine);

            const topArrow = new fabric.Triangle({
                left: x - 35,
                top: y - 5,
                width: 8,
                height: 8,
                fill: '#6b7280',
                angle: 180
            });
            this.tanqueCanvas.add(topArrow);

            const bottomArrow = new fabric.Triangle({
                left: x - 35,
                top: y + height,
                width: 8,
                height: 8,
                fill: '#6b7280'
            });
            this.tanqueCanvas.add(bottomArrow);

            const heightText = new fabric.Text('HT', {
                left: x - 55,
                top: y + height / 2,
                fontSize: 14,
                fontFamily: 'Arial',
                fill: '#374151',
                fontWeight: 'bold',
                originY: 'center'
            });
            this.tanqueCanvas.add(heightText);
        },

        setupCanvasResponsive() {
            const resizeCanvas = () => {
                if (document.getElementById('tanqueCanvas')) {
                    this.drawTanque();
                }
            };

            window.addEventListener('resize', () => {
                clearTimeout(this.resizeTimeout);
                this.resizeTimeout = setTimeout(resizeCanvas, 100);
            });

            if (window.ResizeObserver) {
                const resizeObserver = new ResizeObserver(() => {
                    clearTimeout(this.resizeTimeout);
                    this.resizeTimeout = setTimeout(resizeCanvas, 100);
                });
                const container = document.getElementById('tanqueCanvas')?.parentElement;
                if (container) {
                    resizeObserver.observe(container);
                }
            }
        },

        setupEventListeners() {
            document.addEventListener('demanda-diaria-updated', (event) => {
                const totalCaudal = parseFloat(event.detail.totalCaudal || 0);
                this.consumoDiario = totalCaudal;
                this.tanque.consumoDiarioInterno = totalCaudal;
                this.normalizeTanqueNumbers();
                clearTimeout(this.drawTimeout);
                this.drawTimeout = setTimeout(() => {
                    this.drawTanque();
                }, 100);
                this.sendDataUpdate(); // Enviar datos al modificar consumo diario
            });
        },

        setupWatchers() {
            const properties = [
                'tanque.largo', 'tanque.ancho', 'tanque.alturaAgua',
                'tanque.alturaLimpieza', 'tanque.bordeLibre', 'tanque.alturaTotal',
                'tanque.htecho', 'tanque.hingreso', 'tanque.hrebose', 'tanque.alturalibre',
                'consumoDiario'
            ];

            properties.forEach(prop => {
                this.$watch(prop, () => {
                    if (prop === 'consumoDiario') {
                        this.tanque.consumoDiarioInterno = parseFloat(this.consumoDiario) || 0;
                    }
                    this.normalizeTanqueNumbers();
                    clearTimeout(this.drawTimeout);
                    this.drawTimeout = setTimeout(() => {
                        this.drawTanque();
                    }, 50);
                    this.sendDataUpdate(); // Enviar datos al modificar inputs/calculos
                });
            });
        },

        normalizeTanqueNumbers() {
            const keys = [
                'largo', 'ancho', 'alturaAgua', 'alturaLimpieza', 'bordeLibre',
                'alturaTotal', 'htecho', 'hingreso', 'hrebose', 'alturalibre', 'consumoDiarioInterno'
            ];
            keys.forEach(key => {
                const value = parseFloat(this.tanque[key]);
                this.tanque[key] = isNaN(value) ? 0 : value;
            });
        },

        toggleMode() {
            this.mode = this.mode === 'view' ? 'edit' : 'view';
        }
    }));
}
// Inicializar cuando el DOM esté listo
//document.addEventListener('DOMContentLoaded', initTanqueModule);