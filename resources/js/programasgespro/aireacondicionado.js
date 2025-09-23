// AC Calculator JavaScript Module - Enhanced Version
window.acCalculatorApp = function () {
    return {
        // State Management
        sheets: [],
        climateType: 'C',
        climateBTU: 600,
        tipoAireAcondicionadobtu: 12000,
        newSheetsCount: 1,
        showSummary: false,
        error: '',
        success: '',
        nextSheetId: 1,
        nextItemId: 1,
        isLoading: false,
        serverUrl: '/api/ac-calculator', // Cambia esta URL por la de tu servidor

        // Climate configurations
        climateConfigs: {
            'F': { name: 'Frío', btu: 500 },
            'T': { name: 'Templado', btu: 550 },
            'C': { name: 'Caliente', btu: 600 },
            'MC': { name: 'Muy Caliente', btu: 650 }
        },

        // Thermal load presets
        thermalLoadPresets: [
            { description: 'PERSONAS', btu: 500 },
            { description: 'MONITOR DE 32" - MINI PC', btu: 400 },
            { description: 'BAÑO MARIA', btu: 400 },
            { description: 'INCUBADORA DE TRES GASES', btu: 400 },
            { description: 'PEACHÍMETRO DE MESA', btu: 400 },
            { description: 'ESTEREOMICROSCOPIO', btu: 400 },
            { description: 'SISTEMA DE PROCESAMIENTO DE IMÁGENES', btu: 400 },
            { description: 'LUMINARIAS', btu: 200 }
        ],

        // AC type presets
        acTypePresets: [
            { btu: 9000, type: 'Split 9000 BTU' },
            { btu: 12000, type: 'Split 12000 BTU' },
            { btu: 15000, type: 'Split 15000 BTU' },
            { btu: 18000, type: 'Split 18000 BTU' },
            { btu: 24000, type: 'Split 24000 BTU' },
            { btu: 36000, type: 'Split 36000 BTU' },
            { btu: 60000, type: 'Split 60000 BTU/m²' }
        ],

        // Initialization
        async init() {
            try {
                this.loadFromStorage();

                // Intentar cargar datos del servidor
                await this.cargarDatosServidor();

                // Si no hay datos, crear hoja por defecto
                if (this.sheets.length === 0) {
                    this.crearHojaPorDefecto();
                }

                this.updateClimateSettings();
                this.showSuccess('Sistema inicializado correctamente');
            } catch (error) {
                this.showError('Error al inicializar el sistema: ' + error.message);
                // Si hay error, crear hoja por defecto
                if (this.sheets.length === 0) {
                    this.crearHojaPorDefecto();
                }
            }
        },

        // Crear hoja por defecto con datos de ejemplo
        crearHojaPorDefecto() {
            const hojaDefecto = {
                id: this.nextSheetId++,
                name: 'LABORATORIO DE BIOLOGÍA MOLECULAR',
                area: 36.22,
                thermalLoad: [
                    { id: this.nextItemId++, description: 'PERSONAS', btu: 500, quantity: 7 },
                    { id: this.nextItemId++, description: 'MONITOR DE 32" - MINI PC', btu: 400, quantity: 5 },
                    { id: this.nextItemId++, description: 'BAÑO MARIA', btu: 400, quantity: 2 },
                    { id: this.nextItemId++, description: 'M11 - M14 - MM2', btu: 400, quantity: 4 },
                    { id: this.nextItemId++, description: 'INCUBADORA DE TRES GASES - INCU. DE CO2', btu: 400, quantity: 2 },
                    { id: this.nextItemId++, description: 'PEACHÍMETRO DE MESA', btu: 400, quantity: 2 },
                    { id: this.nextItemId++, description: 'ESTEREOMICROSCOPIO', btu: 400, quantity: 6 },
                    { id: this.nextItemId++, description: 'SISTEMA DE PROCESAMIENTO DE IMÁGENES DIGITALES', btu: 400, quantity: 1 },
                    { id: this.nextItemId++, description: 'LUMINARIAS', btu: 200, quantity: 6 }
                ],
                acTypes: [{ id: this.nextItemId++, btu: 24000, quantity: 1 }]
            };

            this.sheets.push(hojaDefecto);
            this.saveToStorage();
        },

        // Sheet Management
        addSheet() {
            try {
                const newSheet = {
                    id: this.nextSheetId++,
                    name: `Hoja ${this.sheets.length + 1}`,
                    area: 0,
                    thermalLoad: [],
                    acTypes: [{ id: this.nextItemId++, btu: 12000, quantity: 1 }]
                };
                this.sheets.push(newSheet);
                this.saveToStorage();
                this.showSuccess(`Hoja "${newSheet.name}" agregada correctamente`);
            } catch (error) {
                this.showError('Error al agregar hoja: ' + error.message);
            }
        },

        addSheets() {
            try {
                const count = parseInt(this.newSheetsCount) || 1;
                if (count < 1 || count > 10) {
                    throw new Error('El número de hojas debe estar entre 1 y 10');
                }

                for (let i = 0; i < count; i++) {
                    this.addSheet();
                }
                this.newSheetsCount = 1;
            } catch (error) {
                this.showError(error.message);
            }
        },

        removeSheet(index) {
            try {
                if (this.sheets.length <= 1) {
                    throw new Error('Debe mantener al menos una hoja');
                }

                const sheetName = this.sheets[index].name;
                this.sheets.splice(index, 1);
                this.saveToStorage();
                this.showSuccess(`Hoja "${sheetName}" eliminada correctamente`);
            } catch (error) {
                this.showError(error.message);
            }
        },

        editSheetName(index) {
            try {
                const currentName = this.sheets[index].name;
                const newName = prompt('Ingrese el nuevo nombre:', currentName);

                if (newName && newName.trim() !== '') {
                    this.sheets[index].name = newName.trim();
                    this.saveToStorage();
                    this.showSuccess('Nombre actualizado correctamente');
                }
            } catch (error) {
                this.showError('Error al editar nombre: ' + error.message);
            }
        },

        // Thermal Load Management
        addThermalLoadRow(sheetIndex) {
            try {
                const newItem = {
                    id: this.nextItemId++,
                    description: '',
                    btu: 0,
                    quantity: 1
                };
                this.sheets[sheetIndex].thermalLoad.push(newItem);
                this.saveToStorage();
            } catch (error) {
                this.showError('Error al agregar fila de carga térmica: ' + error.message);
            }
        },

        removeThermalLoadRow(sheetIndex, itemIndex) {
            try {
                this.sheets[sheetIndex].thermalLoad.splice(itemIndex, 1);
                this.updateSheetCalculations(sheetIndex);
                this.saveToStorage();
            } catch (error) {
                this.showError('Error al eliminar fila: ' + error.message);
            }
        },

        // AC Type Management
        addACRow(sheetIndex) {
            try {
                const newAC = {
                    id: this.nextItemId++,
                    btu: 0,
                    quantity: 1
                };
                this.sheets[sheetIndex].acTypes.push(newAC);
                this.saveToStorage();
            } catch (error) {
                this.showError('Error al agregar fila AC: ' + error.message);
            }
        },

        removeACRow(sheetIndex, acIndex) {
            try {
                this.sheets[sheetIndex].acTypes.splice(acIndex, 1);
                if (this.sheets[sheetIndex].acTypes.length === 0) {
                    this.sheets[sheetIndex].acTypes.push({ id: this.nextItemId++, btu: 12000, quantity: 1 });
                }
                this.saveToStorage();
                this.updateSheetCalculations(sheetIndex);
            } catch (error) {
                this.showError('Error al eliminar fila AC: ' + error.message);
            }
        },

        // Calculations
        getAreaLoad(sheet) {
            try {
                return parseFloat(((sheet.area || 0) * this.climateBTU).toFixed(2));
            } catch (error) {
                this.showError('Error en cálculo de área: ' + error.message);
                return 0;
            }
        },

        getAreaLoadBTUPerM2(sheet) {
            try {
                return parseFloat((((sheet.area || 0) * this.climateBTU) / this.tipoAireAcondicionadobtu).toFixed(2));
            } catch (error) {
                this.showError('Error en cálculo de área BTU/m²: ' + error.message);
                return 0;
            }
        },

        getThermalLoadTotal(sheet) {
            try {
                return this.climateBTU;
                // return sheet.thermalLoad.reduce((total, item) => {
                //     const btu = parseFloat(item.btu) || 0;
                //     const quantity = parseFloat(item.quantity) || 0;
                //     return total + (btu * quantity);
                // }, 0);
            } catch (error) {
                this.showError('Error en cálculo de carga térmica: ' + error.message);
                return 0;
            }
        },

        getACTotal(sheet) {
            try {
                return sheet.acTypes.reduce((total, ac) => {
                    const btu = parseFloat(ac.btu) || 0;
                    const quantity = parseFloat(ac.quantity) || 1;
                    return total + (btu * quantity);
                }, 0);
            } catch (error) {
                this.showError('Error en cálculo de AC: ' + error.message);
                return 0;
            }
        },

        getSheetTotal(sheet) {
            try {
                // const totalLoad = this.getAreaLoad(sheet) + this.getThermalLoadTotal(sheet);
                // console.log(this.getAreaLoad(sheet));
                // console.log(this.getThermalLoadTotal(sheet));
                // const totalAC = this.getACTotal(sheet);
                // console.log(totalLoad);
                // console.log(totalAC);
                // return Math.round(totalAC - totalLoad);
                const areaLoad = this.getAreaLoad(sheet);
                const thermalLoad = this.getThermalLoadTotal(sheet);
                const totalLoad = Math.max(areaLoad, thermalLoad);

                console.log('Area Load:', areaLoad);
                console.log('Thermal Load:', thermalLoad);
                console.log('Total Load (mayor):', totalLoad);

                // const totalAC = this.getACTotal(sheet);
                // console.log('Total AC:', totalAC);
                return Math.round(totalLoad);
            } catch (error) {
                this.showError('Error en cálculo total: ' + error.message);
                return 0;
            }
        },

        getTotalThermalLoad() {
            try {
                return this.sheets.reduce((total, sheet) => {
                    return total + this.getAreaLoad(sheet) + this.getThermalLoadTotal(sheet);
                }, 0);
            } catch (error) {
                this.showError('Error en cálculo total de carga: ' + error.message);
                return 0;
            }
        },

        getTotalACRequired() {
            try {
                return this.sheets.reduce((total, sheet) => {
                    return total + this.getACTotal(sheet);
                }, 0);
            } catch (error) {
                this.showError('Error en cálculo total AC: ' + error.message);
                return 0;
            }
        },

        updateSheetCalculations(sheetIndex) {
            try {
                this.sheets[sheetIndex] = { ...this.sheets[sheetIndex] };
                this.saveToStorage();
            } catch (error) {
                this.showError('Error al actualizar cálculos: ' + error.message);
            }
        },

        // Climate Management
        updateClimateSettings(event) {
            try {
                const climate = event ? event.target.value : this.climateType;
                this.climateType = climate;
                this.climateBTU = this.climateConfigs[climate].btu;

                this.sheets.forEach((sheet, index) => {
                    this.updateSheetCalculations(index);
                });

                this.saveToStorage();
            } catch (error) {
                this.showError('Error al actualizar configuración climática: ' + error.message);
            }
        },

        // Excel Export con estructura de tabla
        async exportToExcel() {
            try {
                if (typeof ExcelJS === 'undefined') {
                    throw new Error('ExcelJS no está disponible. Asegúrese de incluir la librería.');
                }

                const workbook = new ExcelJS.Workbook();

                this.sheets.forEach((sheet, sheetIndex) => {
                    const worksheet = workbook.addWorksheet(sheet.name || `Hoja ${sheetIndex + 1}`);

                    // Configurar anchos de columnas
                    worksheet.columns = [
                        { width: 25 }, // A - Descripción/Tipo
                        { width: 15 }, // B - BTU/UND o BTU
                        { width: 10 }, // C - CANT
                        { width: 15 }, // D - TOTAL
                        { width: 15 }, // E - Unidades
                    ];

                    // Título principal
                    worksheet.mergeCells('A1:E1');
                    const titleCell = worksheet.getCell('A1');
                    titleCell.value = 'CALCULO DE AIRE ACONDICIONADO';
                    titleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
                    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E79' } };
                    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

                    // Sección DATOS
                    worksheet.mergeCells('A2:B2');
                    const datosCell = worksheet.getCell('A2');
                    datosCell.value = 'DATOS:';
                    datosCell.font = { bold: true, color: { argb: 'FF000000' } };
                    datosCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC000' } };

                    // Tipo de clima
                    worksheet.getCell('A3').value = 'TIPO DE CLIMA';
                    worksheet.getCell('B3').value = this.climateConfigs[this.climateType].name.toUpperCase();
                    worksheet.getCell('C3').value = `${this.climateBTU}.00 BTU/m2`;

                    // Ambiente
                    worksheet.getCell('A4').value = 'AMBIENTE';
                    worksheet.getCell('B4').value = sheet.name.toUpperCase();
                    worksheet.getCell('C4').value = `${sheet.area} m2`;

                    // Carga térmica header
                    worksheet.mergeCells('A5:B5');
                    const cargaHeader = worksheet.getCell('A5');
                    cargaHeader.value = 'CARGA TÉRMICA';
                    cargaHeader.font = { bold: true };
                    cargaHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC000' } };

                    worksheet.getCell('C5').value = 'BTU /UND';
                    worksheet.getCell('C5').font = { bold: true };
                    worksheet.getCell('C5').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC000' } };

                    worksheet.getCell('D5').value = 'CANT.';
                    worksheet.getCell('D5').font = { bold: true };
                    worksheet.getCell('D5').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC000' } };

                    worksheet.getCell('E5').value = 'TOTAL';
                    worksheet.getCell('E5').font = { bold: true };
                    worksheet.getCell('E5').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC000' } };

                    let currentRow = 6;

                    // Carga térmica por área (clima)
                    worksheet.getCell(`A${currentRow}`).value = `ÁREA (${this.climateConfigs[this.climateType].name.toUpperCase()})`;
                    worksheet.getCell(`B${currentRow}`).value = this.climateBTU;
                    worksheet.getCell(`C${currentRow}`).value = sheet.area;
                    worksheet.getCell(`D${currentRow}`).value = this.getAreaLoad(sheet);
                    currentRow++;

                    // Cargas térmicas adicionales
                    sheet.thermalLoad.forEach(item => {
                        worksheet.getCell(`A${currentRow}`).value = item.description.toUpperCase();
                        worksheet.getCell(`B${currentRow}`).value = item.btu;
                        worksheet.getCell(`C${currentRow}`).value = item.quantity;
                        worksheet.getCell(`D${currentRow}`).value = item.btu * item.quantity;
                        currentRow++;
                    });

                    // Tipo de aire acondicionado
                    const acRow = currentRow;
                    worksheet.mergeCells(`A${acRow}:B${acRow}`);
                    const acCell = worksheet.getCell(`A${acRow}`);
                    acCell.value = 'TIPO DE AIRE ACONDICIONADO';
                    acCell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                    acCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };

                    // Mostrar el AC principal
                    const mainAC = sheet.acTypes[0];
                    worksheet.getCell(`C${acRow}`).value = `${mainAC.btu} BTU`;
                    worksheet.getCell(`C${acRow}`).font = { bold: true };
                    worksheet.getCell(`C${acRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };

                    const totalLoadBTU = this.getAreaLoad(sheet) + this.getThermalLoadTotal(sheet);
                    const unitsNeeded = (totalLoadBTU / mainAC.btu).toFixed(2);
                    worksheet.getCell(`D${acRow}`).value = `${unitsNeeded} Und`;
                    worksheet.getCell(`D${acRow}`).font = { bold: true };

                    const finalUnits = Math.ceil(parseFloat(unitsNeeded));
                    worksheet.getCell(`E${acRow}`).value = `${finalUnits} Und`;
                    worksheet.getCell(`E${acRow}`).font = { bold: true, color: { argb: 'FFFFFFFF' } };
                    worksheet.getCell(`E${acRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };

                    // Aplicar bordes a toda la tabla
                    const borderStyle = { style: 'thin', color: { argb: 'FF000000' } };
                    for (let row = 1; row <= acRow; row++) {
                        for (let col = 1; col <= 5; col++) {
                            const cell = worksheet.getCell(row, col);
                            cell.border = {
                                top: borderStyle,
                                left: borderStyle,
                                bottom: borderStyle,
                                right: borderStyle
                            };
                        }
                    }
                });

                // Generar y descargar el archivo
                const buffer = await workbook.xlsx.writeBuffer();
                const blob = new Blob([buffer], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                });

                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'Calculo_Aire_Acondicionado.xlsx';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                this.showSuccess('Excel exportado correctamente');
            } catch (error) {
                console.error('Error detallado:', error);
                this.showError('Error al exportar Excel: ' + error.message);
            }
        },

        // Preparar datos para envío al servidor
        prepararDatosParaServidor() {
            try {
                const datosCompletos = {
                    // Metadatos
                    fechaCreacion: new Date().toISOString(),
                    version: '1.0',

                    // Configuración climática
                    configuracion: {
                        climateType: this.climateType,
                        climateBTU: this.climateBTU,
                        climateConfig: this.climateConfigs[this.climateType]
                    },

                    // Hojas de cálculo
                    hojas: this.sheets.map(sheet => ({
                        id: sheet.id,
                        nombre: sheet.name,
                        area: sheet.area,

                        // Carga térmica detallada
                        cargaTermica: {
                            porArea: {
                                descripcion: `Área (${this.climateConfigs[this.climateType].name})`,
                                btuPorM2: this.climateBTU,
                                area: sheet.area,
                                totalBTU: this.getAreaLoad(sheet)
                            },
                            itemsAdicionales: sheet.thermalLoad.map(item => ({
                                id: item.id,
                                descripcion: item.description,
                                btuPorUnidad: item.btu,
                                cantidad: item.quantity,
                                totalBTU: item.btu * item.quantity
                            })),
                            totalCargaTermica: this.getAreaLoad(sheet) + this.getThermalLoadTotal(sheet)
                        },

                        // Equipos de aire acondicionado
                        equiposAC: sheet.acTypes.map(ac => ({
                            id: ac.id,
                            capacidadBTU: ac.btu,
                            cantidad: ac.quantity || 1,
                            totalCapacidad: ac.btu * (ac.quantity || 1)
                        })),

                        // Cálculos y resultados
                        calculos: {
                            totalCargaTermica: this.getAreaLoad(sheet) + this.getThermalLoadTotal(sheet),
                            totalCapacidadAC: this.getACTotal(sheet),
                            balance: this.getSheetTotal(sheet),
                            unidadesNecesarias: sheet.acTypes[0] ?
                                Math.ceil((this.getAreaLoad(sheet) + this.getThermalLoadTotal(sheet)) / sheet.acTypes[0].btu) : 0,
                            eficiencia: this.getACTotal(sheet) > 0 ?
                                Math.round(((this.getAreaLoad(sheet) + this.getThermalLoadTotal(sheet)) / this.getACTotal(sheet)) * 100) : 0
                        }
                    })),

                    // Resumen general
                    resumenGeneral: {
                        totalHojas: this.sheets.length,
                        totalArea: this.sheets.reduce((sum, sheet) => sum + (sheet.area || 0), 0),
                        totalCargaTermica: this.getTotalThermalLoad(),
                        totalCapacidadAC: this.getTotalACRequired(),
                        eficienciaGeneral: this.getTotalACRequired() > 0 ?
                            Math.round((this.getTotalThermalLoad() / this.getTotalACRequired()) * 100) : 0
                    }
                };
                console.log(datosCompletos);
                return JSON.stringify(datosCompletos, null, 2);
            } catch (error) {
                this.showError('Error al preparar datos: ' + error.message);
                return null;
            }
        },

        // Guardar datos en el servidor
        async guardarAireAcondicionado() {
            try {
                this.isLoading = true;

                const datosJSON = this.prepararDatosParaServidor();
                if (!datosJSON) {
                    throw new Error('No se pudieron preparar los datos para envío');
                }

                // Validar datos antes de enviar
                if (this.sheets.length === 0) {
                    throw new Error('No hay hojas para guardar');
                }

                // Validar que cada hoja tenga al menos área
                for (let i = 0; i < this.sheets.length; i++) {
                    const sheet = this.sheets[i];
                    if (!sheet.area || sheet.area <= 0) {
                        throw new Error(`La hoja "${sheet.name}" debe tener un área válida`);
                    }
                }

                const response = await fetch(this.serverUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: datosJSON
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
                    throw new Error(errorData.message || `Error del servidor: ${response.status}`);
                }

                const resultado = await response.json();

                this.showSuccess(resultado.message || 'Datos guardados correctamente en el servidor');

                // Opcional: actualizar IDs si el servidor los devuelve
                if (resultado.data && resultado.data.ids) {
                    this.actualizarIdsDesdeServidor(resultado.data.ids);
                }

            } catch (error) {
                console.error('Error al guardar:', error);
                this.showError('Error al guardar datos: ' + error.message);
            } finally {
                this.isLoading = false;
            }
        },

        // Cargar datos desde el servidor
        async cargarDatosServidor() {
            try {
                this.isLoading = true;

                const response = await fetch(this.serverUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });

                if (!response.ok) {
                    if (response.status === 404) {
                        console.log('No hay datos guardados en el servidor');
                        return;
                    }
                    throw new Error(`Error del servidor: ${response.status}`);
                }

                const datos = await response.json();

                if (datos && datos.hojas && Array.isArray(datos.hojas)) {
                    this.cargarDatosDesdeServidor(datos);
                    this.showSuccess('Datos cargados correctamente desde el servidor');
                } else {
                    console.log('No hay datos válidos en el servidor');
                }

            } catch (error) {
                console.warn('No se pudieron cargar datos del servidor:', error.message);
                // No mostrar error si es problema de conexión - permitir funcionamiento offline
            } finally {
                this.isLoading = false;
            }
        },

        // Procesar datos cargados del servidor
        cargarDatosDesdeServidor(datos) {
            try {
                // Restaurar configuración climática
                if (datos.configuracion) {
                    this.climateType = datos.configuracion.climateType || 'C';
                    this.climateBTU = datos.configuracion.climateBTU || 600;
                }

                // Restaurar hojas
                this.sheets = datos.hojas.map(hoja => ({
                    id: hoja.id,
                    name: hoja.nombre,
                    area: hoja.area,
                    thermalLoad: hoja.cargaTermica.itemsAdicionales.map(item => ({
                        id: item.id,
                        description: item.descripcion,
                        btu: item.btuPorUnidad,
                        quantity: item.cantidad
                    })),
                    acTypes: hoja.equiposAC.map(ac => ({
                        id: ac.id,
                        btu: ac.capacidadBTU,
                        quantity: ac.cantidad
                    }))
                }));

                // Actualizar contadores de IDs
                const allIds = [
                    ...this.sheets.map(s => s.id),
                    ...this.sheets.flatMap(s => s.thermalLoad.map(t => t.id)),
                    ...this.sheets.flatMap(s => s.acTypes.map(a => a.id))
                ];

                this.nextSheetId = Math.max(...this.sheets.map(s => s.id), 0) + 1;
                this.nextItemId = Math.max(...allIds, 0) + 1;

                this.saveToStorage();

            } catch (error) {
                this.showError('Error al procesar datos del servidor: ' + error.message);
            }
        },

        // Actualizar IDs después de guardar en servidor
        actualizarIdsDesdeServidor(ids) {
            try {
                if (ids.nextSheetId) this.nextSheetId = ids.nextSheetId;
                if (ids.nextItemId) this.nextItemId = ids.nextItemId;
                this.saveToStorage();
            } catch (error) {
                console.warn('Error al actualizar IDs:', error);
            }
        },

        // Utility Functions
        resetAll() {
            try {
                if (confirm('¿Está seguro de que desea reiniciar todos los datos?')) {
                    this.sheets = [];
                    this.climateType = 'C';
                    this.climateBTU = 600;
                    this.nextSheetId = 1;
                    this.nextItemId = 1;
                    this.crearHojaPorDefecto();
                    this.clearStorage();
                    this.showSuccess('Sistema reiniciado correctamente');
                }
            } catch (error) {
                this.showError('Error al reiniciar: ' + error.message);
            }
        },

        // Storage Management
        saveToStorage() {
            try {
                const data = {
                    sheets: this.sheets,
                    climateType: this.climateType,
                    climateBTU: this.climateBTU,
                    nextSheetId: this.nextSheetId,
                    nextItemId: this.nextItemId,
                    lastSaved: new Date().toISOString()
                };
                // Note: Using a simple variable instead of localStorage for Claude.ai compatibility
                window.acCalculatorData = data;
            } catch (error) {
                console.warn('No se pudo guardar en almacenamiento:', error);
            }
        },

        loadFromStorage() {
            try {
                const data = window.acCalculatorData;
                if (data) {
                    this.sheets = data.sheets || [];
                    this.climateType = data.climateType || 'C';
                    this.climateBTU = data.climateBTU || 600;
                    this.nextSheetId = data.nextSheetId || 1;
                    this.nextItemId = data.nextItemId || 1;
                }
            } catch (error) {
                console.warn('No se pudo cargar desde almacenamiento:', error);
            }
        },

        clearStorage() {
            try {
                window.acCalculatorData = null;
            } catch (error) {
                console.warn('No se pudo limpiar almacenamiento:', error);
            }
        },

        // Message Management
        showError(message) {
            this.error = message;
            this.success = '';
            setTimeout(() => {
                this.error = '';
            }, 5000);
        },

        showSuccess(message) {
            this.success = message;
            this.error = '';
            setTimeout(() => {
                this.success = '';
            }, 3000);
        },

        // Validation Functions
        validateSheetData(sheet) {
            try {
                if (!sheet.area || sheet.area <= 0) {
                    throw new Error('El área debe ser mayor a 0');
                }

                sheet.thermalLoad.forEach((item, index) => {
                    if (!item.description.trim()) {
                        throw new Error(`Descripción requerida en fila ${index + 1} de carga térmica`);
                    }
                    if (item.btu < 0) {
                        throw new Error(`BTU debe ser positivo en fila ${index + 1} de carga térmica`);
                    }
                    if (item.quantity <= 0) {
                        throw new Error(`Cantidad debe ser mayor a 0 en fila ${index + 1} de carga térmica`);
                    }
                });

                sheet.acTypes.forEach((ac, index) => {
                    if (ac.btu <= 0) {
                        throw new Error(`BTU de AC debe ser mayor a 0 en fila ${index + 1}`);
                    }
                });

                return true;
            } catch (error) {
                this.showError(error.message);
                return false;
            }
        },

        // Advanced Features
        duplicateSheet(index) {
            try {
                const originalSheet = this.sheets[index];
                const duplicatedSheet = {
                    id: this.nextSheetId++,
                    name: `${originalSheet.name} (Copia)`,
                    area: originalSheet.area,
                    thermalLoad: originalSheet.thermalLoad.map(item => ({
                        id: this.nextItemId++,
                        description: item.description,
                        btu: item.btu,
                        quantity: item.quantity
                    })),
                    acTypes: originalSheet.acTypes.map(ac => ({
                        id: this.nextItemId++,
                        btu: ac.btu,
                        quantity: ac.quantity || 1
                    }))
                };

                this.sheets.splice(index + 1, 0, duplicatedSheet);
                this.saveToStorage();
                this.showSuccess(`Hoja duplicada: "${duplicatedSheet.name}"`);
            } catch (error) {
                this.showError('Error al duplicar hoja: ' + error.message);
            }
        },

        // Quick Actions
        addPresetThermalLoad(sheetIndex, preset) {
            try {
                const newItem = {
                    id: this.nextItemId++,
                    description: preset.description,
                    btu: preset.btu,
                    quantity: 1
                };
                this.sheets[sheetIndex].thermalLoad.push(newItem);
                this.updateSheetCalculations(sheetIndex);
                this.saveToStorage();
            } catch (error) {
                this.showError('Error al agregar preset: ' + error.message);
            }
        },

        addPresetAC(sheetIndex, preset) {
            try {
                const newAC = {
                    id: this.nextItemId++,
                    btu: preset.btu,
                    quantity: 1
                };
                this.sheets[sheetIndex].acTypes.push(newAC);
                this.saveToStorage();
            } catch (error) {
                this.showError('Error al agregar AC preset: ' + error.message);
            }
        },

        // Optimization Suggestions
        getSheetRecommendations(sheet) {
            try {
                const recommendations = [];
                const totalLoad = this.getAreaLoad(sheet) + this.getThermalLoadTotal(sheet);
                const totalAC = this.getACTotal(sheet);
                const balance = totalAC - totalLoad;

                if (balance < 0) {
                    recommendations.push({
                        type: 'warning',
                        message: `Capacidad insuficiente: faltan ${Math.abs(balance)} BTU`
                    });
                } else if (balance > totalLoad * 0.3) {
                    recommendations.push({
                        type: 'info',
                        message: `Capacidad excesiva: sobran ${balance} BTU (${Math.round((balance / totalLoad) * 100)}%)`
                    });
                }

                if (sheet.area > 0 && sheet.thermalLoad.length === 0) {
                    recommendations.push({
                        type: 'tip',
                        message: 'Considere agregar cargas térmicas adicionales para mayor precisión'
                    });
                }

                return recommendations;
            } catch (error) {
                console.warn('Error al generar recomendaciones:', error);
                return [];
            }
        },

        // Data Import/Export
        importFromJSON(jsonData) {
            try {
                const data = JSON.parse(jsonData);

                if (!data.sheets || !Array.isArray(data.sheets)) {
                    throw new Error('Formato de datos inválido');
                }

                // Validate imported data
                data.sheets.forEach((sheet, index) => {
                    if (!sheet.name || !sheet.area) {
                        throw new Error(`Datos faltantes en hoja ${index + 1}`);
                    }
                });

                this.sheets = data.sheets;
                this.climateType = data.climateType || 'C';
                this.climateBTU = data.climateBTU || 600;
                this.nextSheetId = Math.max(...this.sheets.map(s => s.id)) + 1;

                this.saveToStorage();
                this.showSuccess('Datos importados correctamente');
            } catch (error) {
                this.showError('Error al importar datos: ' + error.message);
            }
        },

        exportToJSON() {
            try {
                const data = {
                    sheets: this.sheets,
                    climateType: this.climateType,
                    climateBTU: this.climateBTU,
                    exportDate: new Date().toISOString(),
                    version: '1.0'
                };

                const jsonString = JSON.stringify(data, null, 2);
                const blob = new Blob([jsonString], { type: 'application/json' });
                const url = URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = url;
                link.download = 'calculo_ac_backup.json';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                URL.revokeObjectURL(url);
                this.showSuccess('Backup exportado correctamente');
            } catch (error) {
                this.showError('Error al exportar backup: ' + error.message);
            }
        },

        // Performance Monitoring
        getSystemStats() {
            try {
                return {
                    totalSheets: this.sheets.length,
                    totalThermalItems: this.sheets.reduce((sum, sheet) => sum + sheet.thermalLoad.length, 0),
                    totalACItems: this.sheets.reduce((sum, sheet) => sum + sheet.acTypes.length, 0),
                    totalArea: this.sheets.reduce((sum, sheet) => sum + (sheet.area || 0), 0),
                    totalLoad: this.getTotalThermalLoad(),
                    totalCapacity: this.getTotalACRequired(),
                    efficiency: this.getTotalACRequired() > 0 ?
                        Math.round((this.getTotalThermalLoad() / this.getTotalACRequired()) * 100) : 0
                };
            } catch (error) {
                console.warn('Error al obtener estadísticas:', error);
                return {};
            }
        },

        // Funciones auxiliares para debugging
        debugPrint() {
            console.log('=== DEBUG INFO ===');
            console.log('Sheets:', this.sheets);
            console.log('Climate:', this.climateType, this.climateBTU);
            console.log('Stats:', this.getSystemStats());
            console.log('JSON Data:', this.prepararDatosParaServidor());
            console.log('================');
        },

        // Auto-save cada cierto tiempo
        enableAutoSave(intervalMinutes = 5) {
            setInterval(() => {
                if (this.sheets.length > 0) {
                    this.saveToStorage();
                    console.log('Auto-save realizado');
                }
            }, intervalMinutes * 60 * 1000);
        }
    }
}