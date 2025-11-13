import { createApp, reactive } from 'vue';

const app = createApp({
    data() {
        return {
            activeTab: 'pozo',
            exportOption: 'both',
            showModal: false,
            logo1: null,
            logo2: null,
            // Datos del encabezado
            proyecto: '“MEJORAMIENTO DE LOS SERVICIOS DE EDUCACIÓN INICIAL Y PRIMARIA DE LA I.E.P. N°64193 CONTAMANA - DISTRITO DE CONTAMANA - PROVINCIA DE UCAYALI - DEPARTAMENTO DE LORETO”',
            cui: 'CUI: 2484985',
            codigoModular: 'CÓDIGO MODULAR: 0304881; 1307156',
            codigoLocal: 'CÓDIGO LOCAL: 391051',
            unidadEjecutora: 'UNIDAD EJECUTORA: MUNICIPALIDAD PROVINCIAL DE UCAYALI',
            distrito: 'DISTRITO: CONTAMANA',
            provincia: 'PROVINCIA: UCAYALI',
            departamento: 'DEPARTAMENTO: LORETO',
            pararrayo: reactive({
                td: 80,
                L: 103.08,
                W: 46.92,
                H: 13.94,
                h: 10,
                c1: 0.5,
                c2: 1,
                c3: 1,
                c4: 1,
                c5: 1,
            }),
            showTooltip: reactive({
                c1: false,
                c2: false,
                c3: false,
                c4: false,
                c5: false,
            }),
            pozo: {
                L: 2.4,
                a: 0.016,
                resistividad: 45,
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
            seleccion: 0.015875,
            personalizado: false,
            resultados: {
                pozo: { calculado: false, resistencia: 0 },
                pararrayo: {
                    calculado: false,
                    areaEquivalente: 0,
                    Nd: 0,
                    nc: 0,
                    requiereProteccion: false,
                    eficienciaRequerida: 0,
                    nivelProteccion: 1
                }
            },
            dosisReduccion: [
                { rInicial: 0, reduccion: 0, rFinal: 0, descripcion: '1ra dosis' },
                { rInicial: 0, reduccion: 0, rFinal: 0, descripcion: '2da dosis' },
                { rInicial: 0, reduccion: 0, rFinal: 0, descripcion: '3ra dosis' }
            ],
            terrainDescs: {
                'GW': 'Grava de buen grado, mezcla de grava y arena',
                'GP': 'Grava de bajo grado, mezcla de grava y arena',
                'GC': 'Grava con arcilla, mezcla de grava y arcilla',
                'SM': 'Arena con limo, mezcla de bajo grado de arena con limo',
                'SC': 'Arena con arcilla, mezcla de bajo grado de arena con arcilla',
                'ML': 'Arena fina con arcilla de ligera plasticidad',
                'MH': 'Arena fina o terreno con limo, terrenos elásticos',
                'CL': 'Arcilla pobre con grava, arena, limo',
                'CH': 'Arcilla inorgánica de alta plasticidad'
            }
        };
    },

    computed: {
        aSeleccionado() {
            return this.personalizado ? this.seleccion : parseFloat(this.seleccion);
        },
    },

    methods: {
        init() { },

        actualizarVarilla() {
            this.pozo.a = this.aSeleccionado;
        },

        updateResistividad() {
            const resistividades = {
                'GW': 800, 'GP': 1750, 'GC': 300, 'SM': 300, 'SC': 125,
                'ML': 55, 'MH': 190, 'CL': 42.5, 'CH': 32.5
            };
            if (this.pozo.tipoTerreno && resistividades[this.pozo.tipoTerreno]) {
                this.pozo.resistividad = resistividades[this.pozo.tipoTerreno];
            }
        },

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
                const reduccion = this.dosisReduccion[i].reduccion / 100;  // Convertir % a decimal
                const rFinal = prevFinal * (1 - reduccion);
                this.dosisReduccion[i].rFinal = Math.round(rFinal * 100) / 100;
            }
        },

        calcularPararrayo() {
            if (!this.pararrayo.td || !this.pararrayo.L ||
                !this.pararrayo.W || !this.pararrayo.H) {
                alert('Por favor, complete todos los campos requeridos');
                return;
            }

            const { td, L, W, H, c1, c2, c3, c4, c5 } = this.pararrayo;
            const nkng = (Math.pow(td, 1.25) * 0.04).toFixed(3);
            const areaEquivalente = (L * W) + (6 * H * (L + W)) + (Math.PI * 9 * H * H);
            const Aeresult = Math.round(areaEquivalente * 100) / 100;
            const NdExacto = nkng * Aeresult * c1 * 1e-6;
            const Nd = Math.round(NdExacto * 1e6) / 1e6;
            const nc = (1.5 * Math.pow(10, -3)) / (c2 * c3 * c4 * c5);
            const requiereProteccion = Nd > nc;
            let eficienciaRequerida = 0;
            let nivelProteccion = 1;

            if (requiereProteccion) {
                eficienciaRequerida = 1 - (nc / Nd);
                if (eficienciaRequerida >= 0.98) nivelProteccion = 1;
                else if (eficienciaRequerida >= 0.95) nivelProteccion = 2;
                else if (eficienciaRequerida >= 0.80) nivelProteccion = 3;
                else nivelProteccion = 4;
            }

            this.resultados.pararrayo = {
                calculado: true,
                tdisocerauno: td,
                nkng: nkng,
                areaEquivalente: Aeresult,
                Nd: Nd,
                Ng: nkng,
                Ae: Aeresult,
                C1: c1,
                nc: Math.round(nc * 1e6) / 1e6,
                requiereProteccion,
                eficienciaRequerida: Math.round(eficienciaRequerida * 1000) / 1000,
                nivelProteccion
            };
        },

        exportClick() {
            if (!this.logo1 || !this.logo2) {
                this.showModal = true;
                return;
            }
            this.exportToExcel();
        },

        async proceedExport() {
            if (!this.logo1 || !this.logo2) {
                alert('Por favor, selecciona ambos logos antes de exportar.')
                return
            }
            this.showModal = false
            await this.exportToExcel()
        },

        fileToBuffer(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader()
                reader.onload = e => resolve(e.target.result)
                reader.onerror = reject
                reader.readAsArrayBuffer(file)
            })
        },

        // Encabezado común reutilizable
        addEncabezado(sheet, workbook, logo1Buffer, logo1Ext, logo2Buffer, logo2Ext) {
            // Altura fila 1
            sheet.getRow(1).height = 100

            // Insertar logos
            const imageId1 = workbook.addImage({ buffer: logo1Buffer, extension: logo1Ext })
            const imageId2 = workbook.addImage({ buffer: logo2Buffer, extension: logo2Ext })

            sheet.addImage(imageId1, { tl: { col: 0, row: 0 }, ext: { width: 90, height: 90 } })
            sheet.addImage(imageId2, { tl: { col: 13, row: 0 }, ext: { width: 90, height: 90 } })

            // Texto central con saltos de línea
            sheet.mergeCells('B1:M1')
            const cell = sheet.getCell('B1')
            cell.value =
                `${this.proyecto}\n${this.cui}; ${this.codigoModular}; ${this.codigoLocal}\n${this.unidadEjecutora}`

            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
            cell.font = { bold: true, size: 11, name: 'Calibri' }

            // Ajustes de columnas laterales
            sheet.getColumn('A').width = 13
            sheet.getColumn('N').width = 13
        },

        async exportToExcel() {
            // Validaciones
            if ((this.exportOption === 'both' || this.exportOption === 'pozo') && !this.resultados.pozo.calculado) {
                alert('Por favor, calcula el Pozo a Tierra primero.')
                return
            }
            if ((this.exportOption === 'both' || this.exportOption === 'pararrayo') && !this.resultados.pararrayo.calculado) {
                alert('Por favor, calcula el Pararrayo primero.')
                return
            }

            const workbook = new ExcelJS.Workbook()

            // Convertir logos a buffer
            const logo1Buffer = await this.fileToBuffer(this.logo1)
            const logo2Buffer = await this.fileToBuffer(this.logo2)
            let logo1Ext = this.logo1.name.split('.').pop().toLowerCase()
            let logo2Ext = this.logo2.name.split('.').pop().toLowerCase()
            if (logo1Ext === 'jpg') logo1Ext = 'jpeg'
            if (logo2Ext === 'jpg') logo2Ext = 'jpeg'

            // --- HOJA 1: Pozo a Tierra ---
            if (this.exportOption === 'both' || this.exportOption === 'pozo') {
                const sheet = workbook.addWorksheet('Pozo a Tierra')

                // ====== ENCABEZADO COMÚN ======
                this.addEncabezado(sheet, workbook, logo1Buffer, logo1Ext, logo2Buffer, logo2Ext)

                // ====== TÍTULO PRINCIPAL ======
                sheet.mergeCells('B2:I2')
                const title = sheet.getCell('B2')
                title.value = 'CÁLCULO DE LA RESISTENCIA DE PUESTA A TIERRA'
                title.alignment = { horizontal: 'center', vertical: 'middle' }
                title.font = { bold: true, size: 14, color: { argb: '002060' } }

                sheet.addRow([])

                // ====== FORMULA PRINCIPAL ======
                const formulaRow = sheet.addRow(['', 'Ecuación de cálculo:'])
                formulaRow.getCell(2).font = { bold: true, italic: true }
                sheet.addRow(['', 'R = (ρ / 2πL) × [ ln(4L / a) – 1 ]'])
                sheet.getCell(`B${sheet.lastRow.number}`).font = { bold: true, size: 12 }
                sheet.getCell(`B${sheet.lastRow.number}`).alignment = { horizontal: 'center' }

                sheet.addRow(['', 'Donde:'])
                sheet.addRow(['', 'L: Longitud de la varilla de puesta a tierra (electrodos L = ' + this.pozo.L + ' m)'])
                sheet.addRow(['', 'a: Diámetro de la varilla de puesta a tierra (' + this.pozo.a + ' m)'])
                sheet.addRow(['', 'ρ: Resistividad del terreno (' + this.pozo.resistividad + ' Ω·m)'])
                sheet.addRow([])

                // ====== TABLA DE TERRENO ======
                const terrenoTitle = sheet.addRow(['', 'CARACTERÍSTICAS DEL TERRENO'])
                sheet.mergeCells(`B${terrenoTitle.number}:I${terrenoTitle.number}`)
                const terrenoCell = sheet.getCell(`B${terrenoTitle.number}`)
                terrenoCell.font = { bold: true, color: { argb: 'FFFFFF' } }
                terrenoCell.alignment = { horizontal: 'left', vertical: 'middle' }
                terrenoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '002060' } }

                const headerTerreno = sheet.addRow(['', 'I.E. N°', 'Tipo de Terreno', 'ρ (Ω·m)', 'Descripción'])
                headerTerreno.eachCell((cell, colNumber) => {
                    if (colNumber > 1) {
                        cell.font = { bold: true }
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D9E1F2' } }
                        cell.border = {
                            top: { style: 'thin' }, left: { style: 'thin' },
                            right: { style: 'thin' }, bottom: { style: 'thin' }
                        }
                        cell.alignment = { horizontal: 'center', vertical: 'middle' }
                    }
                })

                const rowTerreno = sheet.addRow(['', '64193', this.pozo.tipoTerreno, this.pozo.resistividad, this.terrainDescs[this.pozo.tipoTerreno] || 'No seleccionado'])
                rowTerreno.eachCell((cell, colNumber) => {
                    if (colNumber > 1) {
                        cell.border = {
                            top: { style: 'thin' }, left: { style: 'thin' },
                            right: { style: 'thin' }, bottom: { style: 'thin' }
                        }
                        cell.alignment = { horizontal: colNumber === 4 ? 'right' : 'center' }
                    }
                })

                // Nota de terreno
                const notaTerreno = sheet.addRow(['', 'Nota: La resistencia de terreno es de acuerdo al estudio de suelos del perfil estratigráfico Tabla N°1.'])
                sheet.mergeCells(`B${notaTerreno.number}:I${notaTerreno.number}`)
                notaTerreno.getCell(2).font = { italic: true, size: 10, color: { argb: '808080' } }
                notaTerreno.getCell(2).alignment = { horizontal: 'left' }

                sheet.addRow([])

                // ====== CONSIDERACIONES DE DISEÑO ======
                const consTitle = sheet.addRow(['', 'CONSIDERACIONES DE DISEÑO'])
                sheet.mergeCells(`B${consTitle.number}:I${consTitle.number}`)
                const consCell = sheet.getCell(`B${consTitle.number}`)
                consCell.font = { bold: true, color: { argb: 'FFFFFF' } }
                consCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '002060' } }
                consCell.alignment = { horizontal: 'left', vertical: 'middle' }

                sheet.addRow(['', 'Con electrodo de 5/8” x 2.4 m'])
                sheet.addRow([])

                // ====== TABLA DE CÁLCULO DE RESISTENCIA ======
                const tablaR = sheet.addRow(['', 'I.E. N°', 'Terreno', 'ρ (Ω·m)', 'R (Ω)'])
                tablaR.eachCell((cell, colNumber) => {
                    if (colNumber > 1) {
                        cell.font = { bold: true }
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D9E1F2' } }
                        cell.alignment = { horizontal: 'center' }
                        cell.border = {
                            top: { style: 'thin' }, left: { style: 'thin' },
                            right: { style: 'thin' }, bottom: { style: 'thin' }
                        }
                    }
                })

                const filaR = sheet.addRow(['', '64193', this.pozo.tipoTerreno, this.pozo.resistividad, this.resultados.pozo.resistencia])
                filaR.eachCell((cell, colNumber) => {
                    if (colNumber > 1) {
                        cell.border = {
                            top: { style: 'thin' }, left: { style: 'thin' },
                            right: { style: 'thin' }, bottom: { style: 'thin' }
                        }
                        cell.alignment = { horizontal: colNumber === 5 || colNumber === 4 ? 'right' : 'center' }
                    }
                })

                sheet.addRow([])

                // ====== TABLA DE REDUCCIÓN DE RESISTENCIA ======
                const reduccionTitle = sheet.addRow(['', 'REDUCCIÓN DE LA RESISTENCIA DE PUESTA A TIERRA'])
                sheet.mergeCells(`B${reduccionTitle.number}:I${reduccionTitle.number}`)
                const reduccionCell = sheet.getCell(`B${reduccionTitle.number}`)
                reduccionCell.font = { bold: true, color: { argb: 'FFFFFF' } }
                reduccionCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '002060' } }
                reduccionCell.alignment = { horizontal: 'left', vertical: 'middle' }

                const encabezadoRed = sheet.addRow(['', 'R Inicial (Ω)', '% Reducción', 'R Final (Ω)', 'Descripción'])
                encabezadoRed.eachCell((cell, colNumber) => {
                    if (colNumber > 1) {
                        cell.font = { bold: true }
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D9E1F2' } }
                        cell.alignment = { horizontal: 'center' }
                        cell.border = {
                            top: { style: 'thin' }, left: { style: 'thin' },
                            right: { style: 'thin' }, bottom: { style: 'thin' }
                        }
                    }
                })

                this.dosisReduccion.forEach(d => {
                    const row = sheet.addRow(['', d.rInicial.toFixed(2), d.reduccion, d.rFinal.toFixed(2), d.descripcion])
                    row.eachCell((cell, colNumber) => {
                        if (colNumber > 1) {
                            cell.border = {
                                top: { style: 'thin' }, left: { style: 'thin' },
                                right: { style: 'thin' }, bottom: { style: 'thin' }
                            }
                            if (colNumber < 5) {
                                cell.alignment = { horizontal: 'right' }
                            } else {
                                cell.alignment = { horizontal: 'left' }
                            }
                        }
                    })
                })

                // Fuente
                const fuente = sheet.addRow(['', 'Fuente: Catálogo de CEMENTO CONDUCTIVO'])
                sheet.mergeCells(`B${fuente.number}:I${fuente.number}`)
                fuente.getCell(2).font = { italic: true, size: 10, color: { argb: '808080' } }

                // ====== NOTA FINAL ======
                sheet.addRow([])
                const notaFinal = sheet.addRow(['', 'Los resultados R(Ohm) obtenidos están dentro de los límites permisibles según el C.N.E. SUMINISTRO.'])
                sheet.mergeCells(`B${notaFinal.number}:I${notaFinal.number}`)
                notaFinal.getCell(2).font = { italic: true, size: 10, color: { argb: '808080' } }
                notaFinal.getCell(2).alignment = { horizontal: 'left' }

                // ====== AJUSTES DE COLUMNAS ======
                sheet.getColumn('A').width = 13
                sheet.getColumn('N').width = 13
                sheet.getColumn('B').width = 25
                sheet.getColumn('C').width = 20
                sheet.getColumn('D').width = 20
                sheet.getColumn('E').width = 20
                sheet.getColumn('F').width = 20
                sheet.getColumn('G').width = 20
            }

            // --- HOJA 2: Pararrayo ---
            if (this.exportOption === 'both' || this.exportOption === 'pararrayo') {
                const res = this.resultados.pararrayo
                const sheet = workbook.addWorksheet('Pararrayo')

                // ====== ENCABEZADO COMÚN ======
                this.addEncabezado(sheet, workbook, logo1Buffer, logo1Ext, logo2Buffer, logo2Ext)

                // ====== TÍTULO PRINCIPAL ======
                sheet.mergeCells('B2:M2')
                const title = sheet.getCell('B2')
                title.value = 'CÁLCULO DEL PARARRAYO'
                title.alignment = { horizontal: 'center', vertical: 'middle' }
                title.font = { bold: true, size: 14, color: { argb: '002060' } }

                // ====== SECCIÓN 1: Frecuencia anual de caída de rayos ======
                sheet.addRow([])
                sheet.mergeCells('B4:I4')
                const seccion1 = sheet.getCell('B4')
                seccion1.value = '1 Frecuencia anual de caída de rayos'
                seccion1.font = { bold: true, color: { argb: 'FFFFFF' } }
                seccion1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '002060' } }
                seccion1.alignment = { horizontal: 'left', vertical: 'middle' }

                sheet.addRow(['', 'Td=', res.tdisocerauno, 'isocerauno'])
                sheet.getRow(sheet.lastRow.number).getCell(2).alignment = { horizontal: 'right' }
                sheet.addRow(['', 'Nk = Ng =', res.nkng, 'rayos/km²·año'])
                sheet.getRow(sheet.lastRow.number).getCell(2).alignment = { horizontal: 'right' }

                // ====== SECCIÓN 2: Cálculo de Área Equivalente ======
                sheet.addRow([])
                const rowSec2 = sheet.addRow([])
                sheet.mergeCells(`B${rowSec2.number}:I${rowSec2.number}`)
                const seccion2 = sheet.getCell(`B${rowSec2.number}`)
                seccion2.value = '2 Cálculo de Área Equivalente'
                seccion2.font = { bold: true, color: { argb: 'FFFFFF' } }
                seccion2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '002060' } }
                seccion2.alignment = { horizontal: 'left', vertical: 'middle' }

                sheet.addRow(['', 'A = LW + 6H(L + W) + π9H²'])
                sheet.addRow(['', 'L:', this.pararrayo.L])
                sheet.addRow(['', 'W:', this.pararrayo.W])
                sheet.addRow(['', 'H:', this.pararrayo.H])
                sheet.addRow(['', 'Ae:', res.areaEquivalente.toFixed(4) + ' m²'])
                const aeNote = sheet.addRow(['', 'Área equivalente (Fuente: Norma NFPA 780)'])
                aeNote.getCell(2).font = { italic: true, color: { argb: '808080' } }

                // ====== SECCIÓN 3: Coeficientes Nd ======
                sheet.addRow([])
                const rowSec3 = sheet.addRow([])
                sheet.mergeCells(`B${rowSec3.number}:I${rowSec3.number}`)
                const seccion3 = sheet.getCell(`B${rowSec3.number}`)
                seccion3.value = '3 Coeficientes de Frecuencia de Relámpago “Nd”'
                seccion3.font = { bold: true, color: { argb: 'FFFFFF' } }
                seccion3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '002060' } }
                seccion3.alignment = { horizontal: 'left', vertical: 'middle' }

                // ====== Tabla Nd ======
                sheet.addRow(['', ''])
                const encabezadoNd = sheet.addRow(['', 'Nk', 'Ng', 'Ae', 'C1', 'Nd'])
                encabezadoNd.eachCell((cell, colNumber) => {
                    if (colNumber > 1) {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F2F2F2' } }
                        cell.font = { bold: true }
                        cell.alignment = { horizontal: 'center', vertical: 'middle' }
                        cell.border = {
                            top: { style: 'thin' }, left: { style: 'thin' },
                            right: { style: 'thin' }, bottom: { style: 'thin' }
                        }
                    }
                })

                const filaNd = sheet.addRow(['', res.nkng, res.nkng, res.areaEquivalente, this.pararrayo.c1, res.Nd])
                filaNd.eachCell((cell, colNumber) => {
                    if (colNumber > 1) {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2CC' } }
                        cell.border = {
                            top: { style: 'thin' }, left: { style: 'thin' },
                            right: { style: 'thin' }, bottom: { style: 'thin' }
                        }
                    }
                })

                sheet.addRow(['', 'Nd = Ng * Ae * C1 * 10⁻⁶'])
                sheet.addRow(['', 'Nd: Coeficiente de frecuencia de relámpago'])
                sheet.addRow(['', 'Ng: Densidad de la descarga atmosférica'])
                sheet.addRow(['', 'Ae: Área equivalente de la estructura a proteger'])
                sheet.addRow(['', 'C1: Coeficiente de localización isokeraunico: nivel de rayos por km²·año'])
                sheet.addRow(['', 'Nota: Ng es un valor que expresa el número de relámpagos por kilómetro cuadrado por año de la zona a analizar obtenida del mapa del nivel'])
                sheet.addRow(['', 'isoceraúnico del Perú (calculado como 0.04 * Td^1.25).'])

                // ====== SECCIÓN 4: Coeficientes Nc ======
                sheet.addRow([])
                const rowSec4 = sheet.addRow([])
                sheet.mergeCells(`B${rowSec4.number}:I${rowSec4.number}`)
                const seccion4 = sheet.getCell(`B${rowSec4.number}`)
                seccion4.value = '4 Coeficientes de Frecuencia Relámpago Tolerable “Nc”'
                seccion4.font = { bold: true, color: { argb: 'FFFFFF' } }
                seccion4.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '002060' } }
                seccion4.alignment = { horizontal: 'left', vertical: 'middle' }

                sheet.addRow(['', ''])
                const encabezadoNc = sheet.addRow(['', 'C2', 'C3', 'C4', 'C5', 'Nc'])
                encabezadoNc.eachCell((cell, colNumber) => {
                    if (colNumber > 1) {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F2F2F2' } }
                        cell.font = { bold: true }
                        cell.alignment = { horizontal: 'center', vertical: 'middle' }
                        cell.border = {
                            top: { style: 'thin' }, left: { style: 'thin' },
                            right: { style: 'thin' }, bottom: { style: 'thin' }
                        }
                    }
                })

                const filaNc = sheet.addRow(['', this.pararrayo.c2, this.pararrayo.c3, this.pararrayo.c4, this.pararrayo.c5, res.nc])
                filaNc.eachCell((cell, colNumber) => {
                    if (colNumber > 1) {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2CC' } }
                        cell.border = {
                            top: { style: 'thin' }, left: { style: 'thin' },
                            right: { style: 'thin' }, bottom: { style: 'thin' }
                        }
                    }
                })

                sheet.addRow(['', 'Nc = (1.5 × 10⁻³) / (C2 × C3 × C4 × C5)'])
                sheet.addRow(['', 'Coeficiente de frecuencia de relámpago tolerable (Fuente: NFPA 780)'])

                // ====== SECCIÓN 5: Evaluación ======
                sheet.addRow([])
                const rowSec5 = sheet.addRow([])
                sheet.mergeCells(`B${rowSec5.number}:I${rowSec5.number}`)
                const seccion5 = sheet.getCell(`B${rowSec5.number}`)
                seccion5.value = '5 Evaluación y comparación de los riesgos “Nd” con los riesgos tolerables “Nc”'
                seccion5.font = { bold: true, color: { argb: 'FFFFFF' } }
                seccion5.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '002060' } }
                seccion5.alignment = { horizontal: 'left', vertical: 'middle' }

                sheet.addRow(['', 'Si Nd > Nc ⇒ Requiere protección.'])
                sheet.addRow(['', 'Si Nd < Nc ⇒ Protección opcional.'])
                sheet.addRow([])

                const evalHeader = sheet.addRow(['', 'AREA', 'Nd', 'Nc', 'REQUIERE PROTECCIÓN'])
                evalHeader.eachCell((cell, colNumber) => {
                    if (colNumber > 1) {
                        cell.font = { bold: true }
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D9E1F2' } }
                        cell.alignment = { horizontal: 'center', vertical: 'middle' }
                        cell.border = {
                            top: { style: 'thin' }, left: { style: 'thin' },
                            right: { style: 'thin' }, bottom: { style: 'thin' }
                        }
                    }
                })

                const filaEval = sheet.addRow(['', res.areaEquivalente, res.Nd, res.nc, res.requiereProteccion ? 'SI' : 'NO'])
                filaEval.eachCell((cell, colNumber) => {
                    if (colNumber > 1) {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2CC' } }
                        cell.border = {
                            top: { style: 'thin' }, left: { style: 'thin' },
                            right: { style: 'thin' }, bottom: { style: 'thin' }
                        }
                    }
                })

                sheet.addRow([])
                sheet.addRow(['', 'EFICIENCIA REQUERIDA (E) =', res.eficienciaRequerida])
                sheet.addRow(['', 'NIVEL DE PROTECCIÓN', res.nivelProteccion])
                // ====== Anchos de columnas ======
                sheet.getColumn('A').width = 13
                sheet.getColumn('N').width = 13
                sheet.getColumn('B').width = 25
                sheet.getColumn('C').width = 20
                sheet.getColumn('D').width = 20
                sheet.getColumn('E').width = 20
                sheet.getColumn('F').width = 20
                sheet.getColumn('G').width = 20
            }

            // Descargar archivo
            const buffer = await workbook.xlsx.writeBuffer()
            const blob = new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'CALCULO SPAT, PARARRAYOS.xlsx'
            a.click()
            URL.revokeObjectURL(url)

        }
    },

    mounted() {
        this.init();
    }
});

app.mount('#app');