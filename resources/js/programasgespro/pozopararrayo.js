window.pozoTierraPararrayoApp = function () {
    return {
        activeTab: 'pozo',

        // Datos del pozo a tierra
        pozo: {
            L: 2.4, // Longitud de la varilla en metros
            a: 0.016, // Diámetro de la varilla en metros
            resistividad: 45, // Resistividad del terreno en Ω·m
            tipoTerreno: 'CH'
        },

        opcionesVarilla: [
            { nombre: '3/8″ (0.0095 m)', valor: 0.0095 },
            { nombre: '1/2″ (0.0127 m)', valor: 0.0127 },
            { nombre: '5/8″ (0.015875 m)', valor: 0.015875 },
            { nombre: '3/4″ (0.0190 m)', valor: 0.0190 },
            { nombre: '1″ (0.0254 m)', valor: 0.0254 },
            { nombre: 'Otro', valor: null }
        ],
        seleccion: 0.015875, // valor por defecto (coincide con opción 5/8″)
        personalizado: false,

        get aSeleccionado() {
            // Si es personalizado, devuelve lo que haya escrito
            return this.personalizado ? this.seleccion : parseFloat(this.seleccion);
        },

        actualizarVarilla() {
            this.pozo.a = this.aSeleccionado;
        },
        // Datos del pararrayo
        pararrayo: {
            td: 80, // Isokeraunic level
            ng: 3.570, // Rayos por km² por año
            L: 103.08, // Largo en metros
            W: 46.92, // Ancho en metros
            H: 13.94, // Altura en metros
            h: 10, // Altura de la punta
            c1: 0.5,
            c2: 1,
            c3: 1,
            c4: 1,
            c5: 1,
        },

        // Resultados
        resultados: {
            pozo: {
                calculado: false,
                resistencia: 0
            },
            pararrayo: {
                calculado: false,
                areaEquivalente: 0,
                nd: 0,
                nc: 0,
                requiereProteccion: false,
                eficienciaRequerida: 0,
                nivelProteccion: 1
            }
        },

        // Coeficientes para pararrayo
        coeficientes: {
            C2: 1, C3: 1, C4: 1, C5: 1
        },

        // Tabla de dosis
        dosisReduccion: [
            { rInicial: 0, reduccion: 0, rFinal: 0, descripcion: '1ra dosis' },
            { rInicial: 0, reduccion: 0, rFinal: 0, descripcion: '2da dosis' },
            { rInicial: 0, reduccion: 0, rFinal: 0, descripcion: '3ra dosis' }
        ],

        init() {
            // Inicialización si es necesaria
        },

        // Actualizar resistividad según tipo de terreno
        updateResistividad() {
            const resistividades = {
                'GW': 800,   // Promedio de 600-1000
                'GP': 1750,  // Promedio de 1000-2500
                'GC': 300,   // Promedio de 200-400
                'SM': 300,   // Promedio de 100-500
                'SC': 125,   // Promedio de 50-200
                'ML': 55,    // Promedio de 30-80
                'MH': 190,   // Promedio de 80-300
                'CL': 42.5,  // Promedio de 25-60
                'CH': 32.5   // Promedio de 10-55
            };

            if (this.pozo.tipoTerreno && resistividades[this.pozo.tipoTerreno]) {
                this.pozo.resistividad = resistividades[this.pozo.tipoTerreno];
            }
        },

        // Calcular resistencia de puesta a tierra
        calcularPozoTierra() {
            const { L, a, resistividad } = this.pozo;
            if (!L || !a || !resistividad || a <= 0) {
                alert('Por favor, completa todos los campos requeridos.');
                return;
            }
            const factor1 = resistividad / (2 * Math.PI * L);
            const factor2 = Math.log((4 * L) / a) - 1;
            const resistencia = factor1 * factor2;
            this.resultados.pozo.resistencia = Math.round(resistencia * 100) / 100;
            this.resultados.pozo.calculado = true;
            this.dosisReduccion[0].rInicial = this.resultados.pozo.resistencia;
            this.dosisReduccion[0].rFinal = this.resultados.pozo.resistencia;
            this.actualizarReducciones();
        },

        actualizarReducciones() {
            for (let i = 0; i < this.dosisReduccion.length; i++) {
                const prevFinal = i === 0 ? this.resultados.pozo.resistencia : this.dosisReduccion[i - 1].rFinal;
                this.dosisReduccion[i].rInicial = prevFinal;

                const reduccion = this.dosisReduccion[i].reduccion;

                const rFinal = prevFinal - (reduccion * prevFinal);
                this.dosisReduccion[i].rFinal = Math.round(rFinal * 100) / 100;
            }
        },


        // Calcular pararrayo
        calcularPararrayo() {
            if (!this.pararrayo.td || !this.pararrayo.ng || !this.pararrayo.L ||
                !this.pararrayo.W || !this.pararrayo.H) {
                alert('Por favor, complete todos los campos requeridos');
                return;
            }

            const L = this.pararrayo.L;
            const W = this.pararrayo.W;
            const H = this.pararrayo.H;
            const Ng = this.pararrayo.ng;
            // 0. Frecuencia anual de caida de rayos
            const nkng = (Math.pow(this.pararrayo.td, 1.25) * 0.04).toFixed(3); //POTENCIA(C3;1.25)*0.04;
            // 1. Calcular área equivalente
            // Ae = L×W + 6H(L + W) + π·9·H²
            const areaEquivalente = (L * W) + (6 * H * (L + W)) + (Math.PI * 9 * H * H);
            const Aeresult = Math.round(areaEquivalente * 100) / 100;
            // 2. Calcular Nd (número de impactos directos por año)
            // Nd = Ng × Ae × C1 × 10⁻⁶
            const NdExacto = nkng * Aeresult * this.pararrayo.c1 * 1e-6;
            const Nd = Math.round(NdExacto * 1e6) / 1e6;


            const C1 = 1; // Coeficiente de instalación
            //const nd = Ng * Aeresult * C1 * Math.pow(10, -6);

            // 3. Calcular Nc (número tolerable de impactos)
            // Nc = 1.5 × 10⁻³ / (C2 × C3 × C4 × C5)
            const nc = (1.5 * Math.pow(10, -3)) / (this.pararrayo.c2 * this.pararrayo.c3 * this.pararrayo.c4 * this.pararrayo.c5);

            // 4. Evaluar si requiere protección
            const requiereProteccion = Nd > nc;

            // 5. Calcular eficiencia requerida si necesita protección
            let eficienciaRequerida = 0;
            let nivelProteccion = 1;

            if (requiereProteccion) {
                eficienciaRequerida = 1 - (nc / Nd);

                // Determinar nivel de protección
                if (eficienciaRequerida >= 0.98) {
                    nivelProteccion = 1;
                } else if (eficienciaRequerida >= 0.95) {
                    nivelProteccion = 2;
                } else if (eficienciaRequerida >= 0.80) {
                    nivelProteccion = 3;
                } else {
                    nivelProteccion = 4;
                }
            }

            // Guardar resultados
            this.resultados.pararrayo = {
                calculado: true,
                tdisocerauno: this.pararrayo.td,
                nkng: nkng,
                areaEquivalente: Aeresult,//Math.round(areaEquivalente * 100) / 100,
                Nd: Nd,
                Ng: nkng,
                Ae: Aeresult,
                C1: this.pararrayo.c1,
                nd: Math.round(Nd * 1000000) / 1000000, // 6 decimales
                nc: Math.round(nc * 1000000) / 1000000, // 6 decimales
                requiereProteccion: requiereProteccion,
                eficienciaRequerida: Math.round(eficienciaRequerida * 1000) / 1000,
                nivelProteccion: nivelProteccion
            };
        }
    }
}