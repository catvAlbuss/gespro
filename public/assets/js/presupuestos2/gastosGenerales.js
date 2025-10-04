import gastosFijos from "./gastosGeneralesFijos.js";
document.addEventListener("DOMContentLoaded", function () {
    const tabButtons = document.querySelectorAll(".tab-button");
    const tabPanels = document.querySelectorAll(".tab-panel");

    tabButtons.forEach(button => {
        button.addEventListener("click", function () {
            const targetTab = this.getAttribute("data-tab");

            // Oculta todos los paneles y remueve la clase activa
            tabPanels.forEach(panel => panel.classList.add("hidden"));
            tabButtons.forEach(btn => btn.classList.remove("active", "border-green-500", "text-green-500"));

            // Muestra el contenido de la pestaña seleccionada
            document.getElementById(targetTab).classList.remove("hidden");

            // Resalta la pestaña activa
            this.classList.add("active", "border-green-500", "text-green-500");
        });
    });
});

class Gastos {
    constructor() {
        this.gastosGenerales = null;
        this.gastosEspecificos = null;
        this.gastofijo = new gastosFijos();
        // Mantener los datos de ejemplo
        this.dataGenerales = [
            {
                id: 1,
                item: "01.01.00",
                descripcion: "Fianzas: Contratación",
                unidad: "",
                children: [
                    {
                        id: 2,
                        item: "",
                        descripcion: "Fianza por Garantía de Fiel Cumplimiento (Vigencia hasta la liquidación)",
                        unidad: "UND",
                        cantidad: 1,
                        costounitario: 7099.00,
                        parcialgen: 7099
                    },
                    {
                        id: 3,
                        item: "",
                        descripcion: "Fianza por Garantía de Adelanto en Efectivo",
                        unidad: "UND",
                        cantidad: 1,
                        costounitario: 6186.27,
                        parcialgen: 6186.27
                    },
                    {
                        id: 4,
                        item: "",
                        descripcion: "Fianza por Garantía de Adelanto en Materiales",
                        unidad: "UND",
                        cantidad: 1,
                        costounitario: 12372.54,
                        parcialgen: 12372.54
                    }
                ]
            },
            {
                id: 5,
                item: "01.02.00",
                descripcion: "Seguros: Contratación",
                unidad: "",
                children: [
                    {
                        id: 6,
                        item: "",
                        descripcion: "Póliza de Seguros C.A.R. Contra Todo Riesgo (vigencia durante ejecución de la obra)",
                        unidad: "UND",
                        cantidad: 1,
                        costounitario: 7301.83,
                        parcialgen: 7301.83
                    },
                    {
                        id: 7,
                        item: "",
                        descripcion: "Póliza SCTR del Personal de Administración y Control de Obra - Gastos Generales",
                        unidad: "UND",
                        cantidad: 1,
                        costounitario: 3100.71,
                        parcialgen: 3100.71
                    },
                    {
                        id: 8,
                        item: "",
                        descripcion: "PÓLIZA DE SEGUROS ESSALUD + VIDA",
                        unidad: "UND",
                        cantidad: 1,
                        costounitario: 1129.43,
                        parcialgen: 1129.43
                    }
                ]
            },
            {
                id: 9,
                item: "01.03.00",
                descripcion: "Impuestos Pago Sencico e ITF",
                unidad: "",
                children: [
                    {
                        id: 10,
                        item: "",
                        descripcion: "Sencico (0.20% del ppto)",
                        unidad: "UND",
                        cantidad: 1,
                        costounitario: 9735.77,
                        parcialgen: 9735.77
                    },
                    {
                        id: 11,
                        item: "",
                        descripcion: "Impuestos ITF",
                        unidad: "UND",
                        cantidad: 1,
                        costounitario: 738.46,
                        parcialgen: 738.46
                    }
                ]
            }
        ];

        this.dataEspecificos = [
            {
                id: 1,
                item: "02.01.00",
                descripcion: "GASTOS DE ADMINISTRACIÓN EN OBRA",
                unidad: "",
                children: [
                    {
                        id: 2,
                        item: "",
                        descripcion: "Sueldos y beneficios",
                        unidad: "",
                        dataremuneraciones: true,
                        children: [],
                    },
                ]
            },
            {
                id: 5,
                item: "02.02.00",
                descripcion: "Pago de Beneficios Sociales",
                unidad: "",
                dataremuneracionespbs: true,
                children: []
            },
            {
                id: 6,
                item: "02.03.00",
                descripcion: "Equipamiento y Mobiliario",
                unidad: "",
                children: [
                    {
                        id: 13,
                        item: "",
                        descripcion: "Utiles de escritorio, ploteos",
                        unidad: "",
                    },
                ]
            },
            {
                id: 7,
                item: "02.04.00",
                descripcion: "Ensayos y pruebas de calidad",
                unidad: "",
                children: []
            },
            {
                id: 8,
                item: "02.05.00",
                descripcion: "Ensayos y pruebas de calidad",
                unidad: "",
                children: []
            },
            {
                id: 9,
                item: "02.06.00",
                descripcion: "Ensayos y pruebas de calidad",
                unidad: "",
                children: []
            },
            {
                id: 10,
                item: "02.07.00",
                descripcion: "Gastos Finacieros Complementarios - Renovacion de Fianzas",
                unidad: "",
                children: [
                    {
                        id: 11,
                        item: "-",
                        descripcion: "Fianza por Garantía de Adelanto en Efectivo",
                        unidad: "",
                        cantidad: 1,
                        costounitario: 709,
                        gastofijo: true,
                    },
                    {
                        id: 12,
                        item: "-",
                        descripcion: "Fianza por Garantía de Adelanto en Materiales",
                        unidad: "",
                        costounitario: 70,
                        gastofijo: true,
                    }
                ]
            },
        ];

        // Propiedad para almacenar la suma total
        // Propiedad para almacenar la suma total
        this.totalGeneral = 0;
        this.totalGastoGeneralFijo = 0;
        this.totalGastoGeneralVariable = 0;
        this.costoDirectoG = 0;
        this.tables = {
            fianzaCumplimiento: null, // Aquí podrías inicializar tus instancias de Tabulator si ya las tienes
            fianzaAdelantoEfectivo: null,
            fianzaAdelantoMateriales: null,
            polizaCAR: null,
            seguroSCTR: null,
            polizaEssalud: null,
            pagoSencico: null,
            impuestosITF: null
        };
        this.loadData()
    }

    init() {
        document.addEventListener("DOMContentLoaded", () => {
            this.configurarTablas();
            this.agregarEventos();
            this.actualizarTotalGeneral();
            this.loadDataCostoDirecto();
            //this.crearElementoTotalGeneral();
            this.setupEventListeners();
        });
    }

    setupEventListeners() {
        document.getElementById('guardar-gastos-generales').addEventListener('click', () => this.exportarDatos());
    }

    // Función para formatear números con el formato peruano (S/. 0,000.00)
    formatearMoneda(valor) {
        return `S/. ${parseFloat(valor).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    }

    agregarDatosEspecificos(datosServidor) {
        // Verificar si datosServidor es un array
        if (!Array.isArray(datosServidor)) {
            try {
                datosServidor = this.convertirAArray(datosServidor);
            } catch (error) {
                console.error('Error con el formato de datos:', error);
                return;
            }
        }

        // Crear una copia de la estructura dataEspecificos para evitar modificaciones in-place
        const newDataEspecificos = JSON.parse(JSON.stringify(this.dataEspecificos));

        // **Procesamiento para "Sueldos y beneficios"**
        const datosSueldosFiltrados = datosServidor.filter(item => item && !item.isStaticRow && item.item !== "MENSUAL" && item.item !== "TOTAL");

        const datosSueldosMappeds = datosSueldosFiltrados.map(item => ({
            id: item.id || Math.random().toString(36).substr(2, 9),
            item: "",
            descripcion: item.item || "",
            unidad: "UND",
            cantidad: item.cantidad || 1,
            cantidadtiempo: item.meses || 0,
            participacion: item.porcentaje || 0,
            costounitario: item.precioUnitario || 0,
            parcialespecifico: item.totalPagarMes || 0
        }));

        const nodoSueldos = this.buscarNodo(newDataEspecificos, "Sueldos y beneficios");
        if (nodoSueldos) {
            nodoSueldos.children = datosSueldosMappeds; // Reemplazar los hijos en la copia
        } else {
            console.error("❌ No se encontró el nodo 'Sueldos y beneficios' en dataEspecificos");
        }

        // **Procesamiento para "Pago de Beneficios Sociales"**
        const filaTotal = datosServidor.find(item => item.item === "TOTAL");
        if (filaTotal) {
            const beneficios = [
                { descripcion: "Asignación Familiar (10% de RMV)", valor: filaTotal.asignacionFamiliar },
                { descripcion: "ESSALUD (9% P. Unit. - Aporta el Empleador)", valor: filaTotal.essalud },
                { descripcion: "C.T.S. (8.3333% P. Unit.)", valor: filaTotal.cts },
                { descripcion: "Vacaciones (1/12 de (P. Unit.+ Asig. Fam.))", valor: filaTotal.vacaciones },
                { descripcion: "Gratificación (1/6 PUnit. x 2)", valor: filaTotal.gratifica }
            ];
            const datosBeneficiosMappeds = beneficios.map((beneficio, index) => ({
                id: Date.now() + index,
                item: "",
                descripcion: beneficio.descripcion,
                unidad: "UND",
                cantidad: 1,
                cantidadtiempo: 1,
                participacion: 10,
                costounitario: beneficio.valor || 0,
                parcialespecifico: beneficio.valor || 0
            }));
            const nodoPBS = this.buscarNodo(newDataEspecificos, "Pago de Beneficios Sociales");
            if (nodoPBS) {
                nodoPBS.children = datosBeneficiosMappeds; // Reemplazar los hijos en la copia
            } else {
                console.error("❌ No se encontró el nodo 'Pago de Beneficios Sociales' en dataEspecificos");
            }
        } else {
            console.error("❌ Error: No se encontró la fila 'TOTAL' en datosServidor para PBS");
        }

        // Actualizar la tabla con la nueva estructura de datos
        if (this.gastosEspecificos) { // Verificar si la tabla está inicializada
            this.gastosEspecificos.setData(newDataEspecificos);
        } else {
            console.error("❌ Error: this.gastosEspecificos no está inicializado al intentar setData.");
        }
    }

    convertirAArray(data) {
        if (typeof data === "string") {
            return JSON.parse(data);
        } else if (typeof data === "object" && data !== null) {
            return Object.values(data);
        }
        throw new Error("Formato de datos inválido: Se esperaba una cadena JSON o un objeto.");
    }

    buscarNodo(data, descripcion) {
        for (const item of data) {
            if (item.descripcion === descripcion) {
                return item;
            }
            if (item.children && Array.isArray(item.children)) {
                const found = this.buscarNodo(item.children, descripcion);
                if (found) return found;
            }
        }
        return null;
    }

    // Función para cargar los datos del servidor
    loadData() {
        const id_presupuesto = document.getElementById('id_presupuestos').value;
        let gastosFijosTotals = {};
        let costoDirectoFromServer = 0;
        let remuneracionesData = null; // Variable para almacenar las remuneraciones más recientes

        // Primero obtenemos el costo directo
        $.ajax({
            url: "/obtener-costo_directo",
            type: "POST",
            data: JSON.stringify({ id_presupuesto }),
            contentType: "application/json",
            dataType: "json",
            headers: {
                "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content")
            },
            success: (response) => {
                if (response && response.costo_directo) {
                    costoDirectoFromServer = parseFloat(response.costo_directo);
                } else {
                    console.error("Error al cargar el costo directo o respuesta inesperada.");
                }

                // Una vez obtenido el costo directo, cargamos las remuneraciones
                this.cargarRemuneraciones(id_presupuesto, costoDirectoFromServer);
            },
            error: (xhr, status, error) => {
                console.error("Error al cargar el costo directo:", error);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "No se pudo cargar el costo directo."
                });

                // Aún así, intentamos cargar las remuneraciones
                this.cargarRemuneraciones(id_presupuesto, costoDirectoFromServer);
            }
        });
    }

    // Método nuevo para cargar remuneraciones en secuencia
    cargarRemuneraciones(id_presupuesto, costoDirectoFromServer) {
        $.ajax({
            url: "/obtener-remuneraciones",
            type: "POST",
            data: JSON.stringify({ id_presupuesto }),
            contentType: "application/json",
            dataType: "json",
            headers: {
                "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content")
            },
            success: (response) => {
                if (response.status === "success" && response.data) {
                    const remuneracionesString = response.data.remuneraciones;
                    try {
                        const remuneracionesArray = JSON.parse(remuneracionesString);

                        // Guardamos las remuneraciones para usarlas más tarde
                        this.remuneracionesActuales = remuneracionesArray;

                        // Aplicamos las remuneraciones a los datos específicos
                        this.agregarDatosEspecificos(remuneracionesArray);

                    } catch (error) {
                        console.error('Error al parsear las remuneraciones:', error);
                        console.log('Respuesta del servidor:', response.data);
                    }
                }

                // Continuamos con la carga de gastos fijos
                this.cargarGastosFijos(id_presupuesto, costoDirectoFromServer);
            },
            error: (xhr, status, error) => {
                console.error("Error al cargar datos de remuneraciones:", error);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "No se pudieron cargar los datos de remuneraciones."
                });

                // Continuamos con la carga de gastos fijos
                this.cargarGastosFijos(id_presupuesto, costoDirectoFromServer);
            }
        });
    }

    // Método nuevo para cargar gastos fijos en secuencia
    cargarGastosFijos(id_presupuesto, costoDirectoFromServer) {
        let gastosFijosTotals = {};

        $.ajax({
            url: "/obtener-gastos-fijos",
            type: "POST",
            data: JSON.stringify({ id_presupuesto }),
            contentType: "application/json",
            dataType: "json",
            headers: {
                "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content")
            },
            success: (response) => {
                if (response && response.status === "success" && response.data && response.data.gastos_fijos) {
                    try {
                        const data = JSON.parse(response.data.gastos_fijos);
                        if (data && data.tables) {
                            for (const tableName in data.tables) {
                                if (data.tables.hasOwnProperty(tableName) && data.tables[tableName] && data.tables[tableName].total) {
                                    gastosFijosTotals[tableName] = data.tables[tableName].total;
                                }
                            }
                        }
                    } catch (error) {
                        console.error("Error al analizar los datos JSON de gastos fijos:", error);
                    }
                }

                // Finalmente, cargamos los gastos generales, llevando las remuneraciones actuales
                this.loadGastosGenerales(id_presupuesto, gastosFijosTotals, costoDirectoFromServer);
            },
            error: (xhr, status, error) => {
                console.error("Error al cargar datos de gastos fijos:", error);

                // Aún así, intentamos cargar los gastos generales
                this.loadGastosGenerales(id_presupuesto, gastosFijosTotals, costoDirectoFromServer);
            }
        });
    }

    // Método modificado para cargar gastos generales considerando remuneraciones
    loadGastosGenerales(id_presupuesto, gastosFijosTotals, costoDirectoFromServer) {
        let gastoGeneralTotal = 0;

        $.ajax({
            url: "/obtener-gasto_generales",
            type: "POST",
            data: JSON.stringify({ id_presupuesto }),
            contentType: "application/json",
            dataType: "json",
            headers: {
                "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content")
            },
            success: (response) => {
                if (response && response.status === 'success' && response.data) {
                    const data = JSON.parse(response.data.gastos_generales);
                    let datagg = data.gastosGenerales;
                    let datage = data.gastosEspecificos;
                    gastoGeneralTotal = data.totalGeneral;
                    document.getElementById("gastoGeneralTotal").value = gastoGeneralTotal || 20;

                    // Procesar gastos generales normalmente
                    datagg = datagg.map(item => {
                        if (item.descripcion === "Fianzas: Contratación" && item.children) {
                            item.children = item.children.map(child => {
                                // Código para mapear fianzas...
                                switch (child.descripcion) {
                                    case "Fianza por Garantía de Fiel Cumplimiento (Vigencia hasta la liquidación)":
                                        child.costounitario = gastosFijosTotals["fianzaCumplimiento"] || 0;
                                        child.parcialgen = child.cantidad * child.costounitario;
                                        break;
                                    case "Fianza por Garantía de Adelanto en Efectivo":
                                        child.costounitario = gastosFijosTotals["fianzaAdelantoEfectivo"] || 0;
                                        child.parcialgen = child.cantidad * child.costounitario;
                                        break;
                                    case "Fianza por Garantía de Adelanto en Materiales":
                                        child.costounitario = gastosFijosTotals["fianzaAdelantoMateriales"] || 0;
                                        child.parcialgen = child.cantidad * child.costounitario;
                                        break;
                                }
                                return child;
                            });
                        }
                        return item;
                    });

                    // CLAVE: Si tenemos remuneraciones actuales, actualizar los nodos correspondientes en datage
                    if (this.remuneracionesActuales) {
                        // Procesamos los nodos de sueldos y beneficios
                        const datosSueldosFiltrados = this.remuneracionesActuales.filter(item =>
                            item && !item.isStaticRow && item.item !== "MENSUAL" && item.item !== "TOTAL");

                        const datosSueldosMapped = datosSueldosFiltrados.map(item => ({
                            id: item.id || Math.random().toString(36).substr(2, 9),
                            item: "",
                            descripcion: item.item || "",
                            unidad: "UND",
                            cantidad: item.cantidad || 1,
                            cantidadtiempo: item.meses || 0,
                            participacion: item.porcentaje || 0,
                            costounitario: item.precioUnitario || 0,
                            parcialespecifico: item.totalPagarMes || 0
                        }));

                        // Actualizar nodo de sueldos en datage
                        const nodoSueldosIndex = datage.findIndex(node =>
                            node.descripcion === "GASTOS DE ADMINISTRACIÓN EN OBRA");

                        if (nodoSueldosIndex >= 0) {
                            const sueldosNodeIndex = datage[nodoSueldosIndex].children.findIndex(
                                child => child.descripcion === "Sueldos y beneficios");

                            if (sueldosNodeIndex >= 0) {
                                datage[nodoSueldosIndex].children[sueldosNodeIndex].children = datosSueldosMapped;
                            }
                        }

                        // Procesar beneficios sociales
                        const filaTotal = this.remuneracionesActuales.find(item => item.item === "TOTAL");
                        if (filaTotal) {
                            const beneficios = [
                                { descripcion: "Asignación Familiar (10% de RMV)", valor: filaTotal.asignacionFamiliar },
                                { descripcion: "ESSALUD (9% P. Unit. - Aporta el Empleador)", valor: filaTotal.essalud },
                                { descripcion: "C.T.S. (8.3333% P. Unit.)", valor: filaTotal.cts },
                                { descripcion: "Vacaciones (1/12 de (P. Unit.+ Asig. Fam.))", valor: filaTotal.vacaciones },
                                { descripcion: "Gratificación (1/6 PUnit. x 2)", valor: filaTotal.gratifica }
                            ];

                            const datosBeneficiosMapped = beneficios.map((beneficio, index) => ({
                                id: Date.now() + index,
                                item: "",
                                descripcion: beneficio.descripcion,
                                unidad: "UND",
                                cantidad: 1,
                                cantidadtiempo: 1,
                                participacion: 10,
                                costounitario: beneficio.valor || 0,
                                parcialespecifico: beneficio.valor || 0
                            }));

                            // Actualizar nodo de beneficios en datage
                            const nodoPBSIndex = datage.findIndex(node =>
                                node.descripcion === "Pago de Beneficios Sociales");

                            if (nodoPBSIndex >= 0) {
                                datage[nodoPBSIndex].children = datosBeneficiosMapped;
                            }
                        }
                    }

                    // Procesar los nodos de gastos financieros
                    datage = datage.map(item => {
                        if (item.descripcion === "Gastos Finacieros Complementarios - Renovacion de Fianzas" && item.children) {
                            item.children = item.children.map(child => {
                                switch (child.descripcion) {
                                    case "Fianza por Garantía de Adelanto en Efectivo":
                                        child.participacion = 1;
                                        child.costounitario = gastosFijosTotals["fianzaAdelantoEfectivo"] || 0;
                                        child.parcialespecifico = child.participacion * child.costounitario;
                                        break;
                                    case "Fianza por Garantía de Adelanto en Materiales":
                                        child.participacion = 1;
                                        child.costounitario = gastosFijosTotals["fianzaAdelantoMateriales"] || 0;
                                        child.parcialespecifico = child.participacion * child.costounitario;
                                        break;
                                }
                                return child;
                            });
                        }
                        return item;
                    });

                    // Actualizar las tablas
                    this.gastosGenerales.setData(datagg);
                    this.gastosEspecificos.setData(datage);
                    this.crearElementoTotalGeneral(costoDirectoFromServer, gastoGeneralTotal);
                }
            },
            error: (error) => {
                console.error("Error en la petición AJAX para gastos generales:", error);
            }
        });
    }
    /*loadGastosGenerales(id_presupuesto, gastosFijosTotals, costoDirectoFromServer) {
        let gastoGeneralTotal = 0;
        $.ajax({
            url: "/obtener-gasto_generales",
            type: "POST",
            data: JSON.stringify({ id_presupuesto }),
            contentType: "application/json",
            dataType: "json",
            headers: {
                "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content")
            },
            success: (response) => {
                //console.log("Datos recibidos en loadGastosGenerales:", response);
                if (response && response.status === 'success' && response.data) {
                    const data = JSON.parse(response.data.gastos_generales);
                    let datagg = data.gastosGenerales;
                    let datage = data.gastosEspecificos;
                    gastoGeneralTotal = data.totalGeneral;
                    document.getElementById("gastoGeneralTotal").value = gastoGeneralTotal || 20;
                    // Mapear los totales de gastos fijos a la columna costoUnitario de dataGenerales
                    datagg = datagg.map(item => {
                        if (item.descripcion === "Fianzas: Contratación" && item.children) {
                            item.children = item.children.map(child => {
                                switch (child.descripcion) {
                                    case "Fianza por Garantía de Fiel Cumplimiento (Vigencia hasta la liquidación)":
                                        child.costounitario = gastosFijosTotals["fianzaCumplimiento"] || 0;
                                        child.parcialgen = child.cantidad * child.costounitario;
                                        break;
                                    case "Fianza por Garantía de Adelanto en Efectivo":
                                        child.costounitario = gastosFijosTotals["fianzaAdelantoEfectivo"] || 0;
                                        child.parcialgen = child.cantidad * child.costounitario;
                                        break;
                                    case "Fianza por Garantía de Adelanto en Materiales":
                                        child.costounitario = gastosFijosTotals["fianzaAdelantoMateriales"] || 0;
                                        child.parcialgen = child.cantidad * child.costounitario;
                                        break;
                                    default:
                                        break;
                                }
                                return child;
                            });
                        }
                        return item;
                    });
                    datage = datage.map(item => {
                        if (item.descripcion === "Gastos Finacieros Complementarios - Renovacion de Fianzas" && item.children) {
                            item.children = item.children.map(child => {
                                switch (child.descripcion) {
                                    case "Fianza por Garantía de Adelanto en Efectivo":
                                        child.participacion = 1;
                                        child.costounitario = gastosFijosTotals["fianzaAdelantoEfectivo"] || 0;
                                        child.parcialespecifico = child.participacion * child.costounitario;
                                        break;
                                    case "Fianza por Garantía de Adelanto en Materiales":
                                        child.participacion = 1;
                                        child.costounitario = gastosFijosTotals["fianzaAdelantoMateriales"] || 0;
                                        child.parcialespecifico = child.participacion * child.costounitario;
                                        break;
                                    default://costounitario
                                        break;
                                }
                                return child;
                            });
                        }
                        return item;
                    });

                    this.gastosGenerales.setData(datagg);
                    this.gastosEspecificos.setData(datage);
                    console.log(datage);
                    this.crearElementoTotalGeneral(costoDirectoFromServer, gastoGeneralTotal);
                } else {
                    console.error("Error: La respuesta del servidor de gastos generales no tiene el formato esperado.");
                }
            },
            error: (error) => {
                console.error("Error en la petición AJAX para gastos generales:", error);
            }
        });
    }*/

    recalcularParcial(e, cell) {
        const rowData = cell.getRow().getData();
        const cantidad = rowData.cantidad || 0;
        const costounitario = rowData.costounitario || 0;
        cell.getRow().update({ parcialgen: cantidad * costounitario });
        this.gastosGenerales.recalculate(); // Recalcular los bottomCalc
    }

    loadDataCostoDirecto() {
        const id_presupuesto = document.getElementById('id_presupuestos').value;
        $.ajax({
            url: "/obtener-costo_directo", // URL de la API
            type: "POST",
            data: JSON.stringify({ id_presupuesto }), // Enviar el ID
            contentType: "application/json",
            dataType: "json",
            headers: {
                "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content")
            },
            success: (response) => {
                const CostoDirecto = parseFloat(response.costo_directo);
                this.costoDirectoG = CostoDirecto; // Asigna el valor recibido a this.costoDirect
            },
            error: (xhr, status, error) => {
                console.error("Error al cargar datos:", error);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "No se pudieron cargar los datos del balance."
                });
            }
        });
    }

    configurarTablas() {
        // Configuración para formateo de moneda con S/.
        const formatoMoneda = {
            decimal: ".",
            thousand: ",",
            symbol: "S/. ",
            symbolAfter: false,
            precision: 2
        };

        this.gastosGenerales = new Tabulator("#gastosGenerales", {
            dataTree: true,
            dataTreeStartExpanded: true,
            layout: "fitColumns",
            maxHeight: "100%",
            dataTreeChildField: "children",
            data: this.dataGenerales,
            placeholder: "No hay gastos generales",
            columns: this.getColumnas(formatoMoneda),
            footerElement: `<strong>TOTAL GASTOS GENERALES:</strong>`,
            responsiveLayout: "collapse",
        });

        this.gastosEspecificos = new Tabulator("#gastosEspecificos", {
            dataTree: true,
            treeView: true,
            dataTreeStartExpanded: true,
            layout: "fitColumns",
            //maxHeight: "100%",
            dataTreeChildField: "children",
            data: this.dataEspecificos,
            placeholder: "No hay gastos específicos",
            columns: this.getColumnasvar(formatoMoneda),
            footerElement: `<strong>TOTAL GASTOS ESPECÍFICOS:</strong>`,
            responsiveLayout: "collapse",
        });
        const inputFGFC = document.getElementById('porcentajeCalc');
        if (inputFGFC) {
            inputFGFC.addEventListener('input', () => this.calcularValorPorcentual());
        } else {
            console.error("Input 'porcentajeCalc' no encontrado en el DOM.");
        }

        // Agregamos eventos para actualizar el total general cuando se actualicen las tablas
        this.gastosGenerales.on("tableBuilt", () => this.actualizarTotalGeneral());
        this.gastosEspecificos.on("tableBuilt", () => this.actualizarTotalGeneral());

    }

    getColumnas(formatoMoneda) {
        return [
            { title: "Item", field: "item", width: 100 },
            { title: "Descripción", field: "descripcion", widthGrow: 2, editor: "input" },
            { title: "Unidad", field: "unidad", widthGrow: 1, editor: "input" },
            {
                title: "Cantidad",
                field: "cantidad",
                editor: "number",
                formatter: "number",
                formatterParams: { precision: 2 },
                cellEdited: this.recalcularParcial.bind(this)
            },
            {
                title: "Costo Unitario",
                field: "costounitario",
                formatter: "money",
                formatterParams: formatoMoneda,
            },
            {
                title: "PARCIAL",
                field: "parcialgen",
                formatter: "money",
                bottomCalc: "sum",
                bottomCalcFormatter: "money",
                formatterParams: formatoMoneda
            },
            //this.getAccionesColumn()
        ];
    }

    getColumnasvar(formatoMoneda) {
        return [
            { title: "ITEM", field: "item", width: 100 },
            { title: "DESCRIPCION", field: "descripcion", widthGrow: 2, editor: "input" },
            { title: "UNIDAD", field: "unidad", widthGrow: 1, editor: "input" },
            {
                title: "CANTIDAD <br> DE <br> DESCRIPCION",
                field: "cantidad",
                editor: "number",
                formatter: "number",
                cellEdited: this.recalcularParcial.bind(this)
            },
            {
                title: "CANTIDAD (tiempo o N°)",
                field: "cantidadtiempo",
                editor: "number",
                formatter: "number",
                cellEdited: this.recalcularParcial.bind(this)
            },
            {
                title: "PARTICIPACION",
                field: "participacion",
                editor: "number",
                formatter: "number",
                cellEdited: this.recalcularParcial.bind(this)
            },
            {
                title: "PRECIO",
                field: "costounitario",
                editor: "number",
                formatter: "money",
                formatterParams: formatoMoneda,
                cellEdited: this.recalcularParcial.bind(this)
            },
            {
                title: "PARCIAL",
                field: "parcialespecifico",
                formatter: "money",
                bottomCalc: "sum",
                bottomCalcFormatter: "money",
                formatterParams: formatoMoneda
            },
            this.getAccionesColumn()
        ];
    }

    getAccionesColumn() {
        const isDescendantOfHiddenParent = (row) => {
            let parent = row.getTreeParent();
            while (parent) {
                const parentData = parent.getData();
                if (parentData.descripcion === "GASTOS DE ADMINISTRACIÓN EN OBRA" || parentData.descripcion === "Pago de Beneficios Sociales") {
                    return true;
                }
                parent = parent.getTreeParent();
            }
            return false;
        };
        return {
            title: "Acciones",
            //formatter: () => `<button class="add-row">➕</button> <button class="add-desc">📝</button> <button class="delete-row">🗑️</button>`,
            formatter: (cell) => {
                const row = cell.getRow();
                const rowData = row.getData();
                if (rowData.descripcion === "Fianza por Garantía de Adelanto en Efectivo" || rowData.descripcion === "Fianza por Garantía de Adelanto en Materiales") {
                    return "";
                } else if (rowData.descripcion === "GASTOS DE ADMINISTRACIÓN EN OBRA" || rowData.descripcion === "Pago de Beneficios Sociales" || isDescendantOfHiddenParent(row)) {
                    return ""; // Ocultar los botones para estas filas y sus descendientes
                } else {
                    return `<button class="add-row">➕</button> <button class="add-desc">📝</button> <button class="delete-row">🗑️</button>`;
                }
            },
            width: 80,
            cellClick: (e, cell) => this.manejarAccion(e, cell),
        };
    }

    manejarAccion(e, cell) {
        const row = cell.getRow();
        const rowData = row.getData();
        const tableType = cell.getTable() === this.gastosGenerales ? "generales" : "especificos";
        const action = e.target.className;
        if (action.includes("add-row")) {
            this.agregarFila(tableType, row);
        } else if (action.includes("add-desc")) {
            this.agregarDescripcion(tableType, row);
        } else if (action.includes("delete-row")) {
            this.eliminarFila(tableType, row);
        }
    }

    getTableTotal(table, field) {
        if (!table) return 0;
        return table.getData().reduce((sum, row) => sum + (parseFloat(row[field]) || 0), 0);
    }

    getGarantiasVariables() {
        if (!this.gastofijo || !this.gastofijo.tables) return null;

        const tables = this.gastofijo.tables;

        // Obtener datos de fianza adelanto efectivo
        const efectivoData = tables.fianzaAdelantoEfectivo ? tables.fianzaAdelantoEfectivo.getData() : [];
        const garantiasEfectivo = efectivoData.map(row => ({
            garantiaTotalefe: row.garantiaTotalefe || 0,
            factor: row.factor || 0,
            renovacion: row.renovacion || 0
        }));

        // Obtener datos de fianza adelanto materiales
        const materialesData = tables.fianzaAdelantoMateriales ? tables.fianzaAdelantoMateriales.getData() : [];
        const garantiasMateriales = materialesData.map(row => ({
            garantiaTotalMaterial: row.garantiaTotalMaterial || 0,
            factor: row.factor || 0,
            renovacion: row.renovacion || 0
        }));

        return {
            efectivo: garantiasEfectivo,
            materiales: garantiasMateriales
        };
    }

    actualizarDatosGastosFijos(dataTables, dataGvariables) {
        // Aquí puedes implementar la lógica para actualizar los datos en tu tabla principal
        // Por ejemplo, actualizar las filas correspondientes en this.dataGenerales
        if (!dataTables || !dataGvariables) return;

        const actualizarFila = (descripcion, valor) => {
            this.gastosGenerales.getRows().forEach(row => {
                const data = row.getData();
                if (data.descripcion === descripcion) {
                    row.update({
                        costounitario: valor,
                        parcialgen: valor
                    });
                }
            });
        };

        // Actualizar los valores en la tabla principal
        actualizarFila("Fianza por Garantía de Fiel Cumplimiento (Vigencia hasta la liquidación)",
            dataTables.fianzaCumplimiento);
        actualizarFila("Fianza por Garantía de Adelanto en Efectivo",
            dataTables.fianzaAdelantoEfectivo);
        actualizarFila("Fianza por Garantía de Adelanto en Materiales",
            dataTables.fianzaAdelantoMateriales);
        // ... actualizar otras filas según sea necesario
    }

    agregarFila(tabla, parentRow = null) {
        const tabulator = tabla === "generales" ? this.gastosGenerales : this.gastosEspecificos;
        const parentData = parentRow ? parentRow.getData() : null;
        const childrenCount = parentRow ? `0${parentRow.getTreeChildren().length + 1}` : `0${tabulator.getData().length + 1}`;
        const newItem = parentData ? `${parentData.item}.${childrenCount}` : `${tabla === "generales" ? "01" : "02"}.${childrenCount}.00`;

        const parcialField = tabla === "generales" ? "parcialgen" : "parcialespecifico";
        const nuevaFila = {
            id: Date.now(),
            item: newItem,
            descripcion: "Nuevo Gasto",
            unidad: "",
            cantidad: 1,
            costounitario: 0,
            [parcialField]: 0,
        };

        if (parentRow) {
            parentRow.addTreeChild(nuevaFila);
        } else {
            tabulator.addRow(nuevaFila);
        }

        // Actualizar totales después de agregar la fila
        this.actualizarTotalGeneral();
    }

    agregarDescripcion(tabla, parentRow) {
        const parcialField = tabla === "generales" ? "parcialgen" : "parcialespecifico";
        const nuevaFila = {
            id: Date.now(),
            item: "",
            descripcion: "Nueva Descripción",
            unidad: "",
            cantidad: 0,
            costounitario: 0,
            [parcialField]: 0,
            isDescriptionRow: true
        };
        parentRow.addTreeChild(nuevaFila);
    }

    eliminarFila(tabla, row) {
        if (!confirm("¿Está seguro de eliminar esta fila?")) return;

        const parent = row.getTreeParent();
        row.delete();

        if (parent) {
            this.reordenarHermanos(parent.getTreeChildren());
        }

        this.actualizarTotal(tabla);
        this.actualizarTotalGeneral();
    }

    reordenarHermanos(children) {
        children.forEach((child, index) => {
            const data = child.getData();
            if (data.item) {
                const baseItem = data.item.split(".").slice(0, -1).join(".");
                data.item = `${baseItem}.${(index + 1).toString().padStart(2, '0')}`;
                child.update(data);
            }
        });
    }

    recalcularParcial(cell) {
        let row = cell.getRow();
        let data = row.getData();
        let tabla = cell.getTable() === this.gastosGenerales ? "generales" : "especificos";

        // Asegurarse de que los valores son números y usar 0 como valor predeterminado
        let cantidad = parseFloat(data.cantidad) || 1;
        let precio = parseFloat(data.costounitario) || 1;
        let cantidadtiempo = parseInt(data.cantidadtiempo) || 1;
        let participacion = parseInt(data.participacion) || 1;
        // Convertir el valor de participacion a porcentaje (por ejemplo, 100 -> 1, 20 -> 0.2)
        let participacionDecimal = participacion / 100;
        // Calcular el parcial con precisión de 2 decimales
        let parcial = parseFloat((cantidad * precio).toFixed(2));
        let parcialEspecifico = parseFloat(cantidad * cantidadtiempo * participacionDecimal * precio);
        // Actualizar el campo correspondiente según la tabla
        if (tabla === "generales") {
            row.update({ parcialgen: parcial });
        } else {
            row.update({ parcialespecifico: parcialEspecifico });
        }

        // Actualizar la tabla para que se recalculen los `bottomCalc`
        row.getTable().redraw(true);

        // Actualizar el total general
        this.actualizarTotalGeneral();
    }

    calcularValorPorcentual() {
        // --- 1. Validación y obtención de entradas ---
        const inputValdeseado = document.getElementById('porcentajeCalc');
        if (!inputValdeseado || inputValdeseado.value.trim() === '') {
            console.warn("Input de porcentaje no encontrado o vacío.");
            return;
        }

        let porcentajeDeseado;
        try {
            porcentajeDeseado = new Decimal(inputValdeseado.value);
            if (porcentajeDeseado.isNaN()) {
                console.warn("Valor de porcentaje inválido:", inputValdeseado.value);
                return;
            }
            // Permitimos porcentajes negativos si el usuario los ingresa
        } catch (e) {
            console.error("Error al convertir el porcentaje deseado a Decimal:", e);
            return;
        }

        const costoDirectoDecimal = new Decimal(this.costoDirectoG || 0);
        if (costoDirectoDecimal.isZero()) {
            this.actualizarPorcentajeTotalGeneral(new Decimal(0));
            return;
        }

        // --- 2. Calcular el monto total objetivo basado en el porcentaje deseado ---
        const montoDeseadoTotalDecimal = costoDirectoDecimal.times(porcentajeDeseado).dividedBy(100);

        // --- 3. Calcular totales actuales ---
        const totalGeneralesResult = this.actualizarTotal("generales");
        const totalEspecificosResult = this.actualizarTotal("especificos");

        const totalGeneralesDecimal = totalGeneralesResult.totalCompleto;
        const totalEspecificosDecimal = totalEspecificosResult.totalCompleto;
        const totalActualCompletoDecimal = totalGeneralesDecimal.plus(totalEspecificosDecimal);

        // --- 4. Identificar el item a modificar ---
        const table = this.gastosEspecificos;
        const data = table.getData();

        // Buscar el ítem "Utiles de escritorio, ploteos" dentro de "Equipamiento y Mobiliario"
        let rutaItem = null;
        let parcialEspecificoOriginalDecimal = new Decimal(0);

        // Esta función recursiva busca el ítem en los datos
        function buscarItem(items, path = []) {
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const currentPath = [...path, i];

                if (item.descripcion === "Equipamiento y Mobiliario" && item.children) {
                    for (let j = 0; j < item.children.length; j++) {
                        const child = item.children[j];
                        const childPath = [...currentPath, 'children', j];

                        if (child.descripcion === "Utiles de escritorio, ploteos") {
                            parcialEspecificoOriginalDecimal = new Decimal(child.parcialespecifico || 0);
                            return {
                                path: childPath,
                                item: child
                            };
                        }
                    }
                }
            }
            return null;
        }

        const itemInfo = buscarItem(data);

        if (!itemInfo) {
            console.warn("No se encontró la fila 'Utiles de escritorio, ploteos'. Verifica la estructura de datos.");
            const porcentajeActualDecimal = totalActualCompletoDecimal.times(100).dividedBy(costoDirectoDecimal);
            this.actualizarPorcentajeTotalGeneral(porcentajeActualDecimal);
            return;
        }

        // --- 5. Calcular el valor exacto necesario para el item ---
        // Total de todos los elementos excepto el que ajustaremos
        const totalSinItemAjustado = totalActualCompletoDecimal.minus(parcialEspecificoOriginalDecimal);

        // Valor exacto que debe tener nuestro item para alcanzar el monto deseado
        const valorExactoParaItem = montoDeseadoTotalDecimal.minus(totalSinItemAjustado);

        // --- 6. Actualizar los datos directamente en la tabla ---
        try {
            // Obtener el ID único del ítem
            const itemId = itemInfo.item.id;

            // En lugar de actualizar por datos, buscar la fila directamente por ID
            const row = table.getRow(itemId);

            if (!row) {
                // Si no podemos encontrar por ID, intentamos obtener todas las filas y buscar por descripción
                const allRows = table.getRows();
                let foundRow = null;

                // Función recursiva para buscar en filas anidadas
                function findRowByDescription(rows) {
                    for (const r of rows) {
                        const data = r.getData();
                        if (data.descripcion === "Utiles de escritorio, ploteos") {
                            return r;
                        }

                        const children = r.getTreeChildren();
                        if (children && children.length > 0) {
                            const found = findRowByDescription(children);
                            if (found) return found;
                        }
                    }
                    return null;
                }

                foundRow = findRowByDescription(allRows);

                if (foundRow) {
                    // Si encontramos la fila, actualizamos su valor
                    foundRow.update({ parcialespecifico: valorExactoParaItem.toString() });
                } else {
                    throw new Error("No se pudo encontrar la fila ni por ID ni por descripción.");
                }
            } else {
                // Actualizar el valor del ítem
                row.update({ parcialespecifico: valorExactoParaItem.toString() });
            }

            // --- 7. Recalcular todos los totales después de la actualización ---
            setTimeout(() => {
                this.actualizarTotalGeneral();

                // --- 8. Verificar el resultado y mostrar el porcentaje final ---
                const totalFinalDecimal = this.totalGeneral;
                const porcentajeFinalCalculadoDecimal = totalFinalDecimal.times(100).dividedBy(costoDirectoDecimal);

                // Actualizar el display con el porcentaje deseado original
                this.actualizarPorcentajeTotalGeneral(porcentajeDeseado);
            }, 100); // Pequeño retraso para asegurar que la actualización se complete

        } catch (error) {

            // Plan B: actualizar directamente el objeto de datos y luego toda la tabla
            const newData = JSON.parse(JSON.stringify(data)); // Copia profunda

            // Función recursiva para encontrar y actualizar el ítem en la estructura de datos
            function updateItemInData(items) {
                for (let item of items) {
                    if (item.descripcion === "Equipamiento y Mobiliario" && item.children) {
                        for (let child of item.children) {
                            if (child.descripcion === "Utiles de escritorio, ploteos") {
                                child.parcialespecifico = valorExactoParaItem.toString();
                                return true;
                            }
                        }
                    }
                }
                return false;
            }

            if (updateItemInData(newData)) {
                table.setData(newData)
                    .then(() => {
                        setTimeout(() => this.actualizarTotalGeneral(), 100);
                        this.actualizarPorcentajeTotalGeneral(porcentajeDeseado);
                    })
                    .catch(err => console.error("Error en el plan B:", err));
            } else {
                console.error("No se pudo encontrar el ítem en los datos para el plan B.");
            }
        }
    }

    /**
     * Actualiza el display del porcentaje total en la UI
     * @param {Decimal} porcentajeDecimal - El objeto Decimal del porcentaje a mostrar.
     */
    actualizarPorcentajeTotalGeneral(porcentajeDecimal) {
        const elementoDisplay = document.getElementById('porcentajeTotalDisplay');
        if (elementoDisplay) {
            // Usar mismos decimales que el input original
            const numDecimalesMostrar = porcentajeDecimal.decimalPlaces();
            const porcentajeTexto = porcentajeDecimal.toFixed(numDecimalesMostrar);
            elementoDisplay.textContent = porcentajeTexto + "%";
        } else {
            console.warn("Elemento 'porcentajeTotalDisplay' no encontrado en el DOM.");
        }
    }

    /**
     * Actualiza y calcula los totales para una tabla específica usando Decimal
     * @param {string} tabla - "generales" o "especificos" 
     * @returns {Object} Objeto con totales precisos como Decimal
     */
    actualizarTotal(tabla) {
        const tabulator = tabla === "generales" ? this.gastosGenerales : this.gastosEspecificos;
        const parcialField = tabla === "generales" ? "parcialgen" : "parcialespecifico";

        // Inicializar con Decimal
        let datavaluesAd = new Decimal(0);
        let itemEncontrado = false;

        // Función para calcular recursivamente los totales con Decimal
        function calcularTotalesRecursivos(rows) {
            let total = new Decimal(0);

            rows.forEach(row => {
                const data = row.getData();
                const children = row.getTreeChildren();

                // Si tiene hijos, calcular recursivamente su total
                if (children && children.length > 0) {
                    const totalHijos = calcularTotalesRecursivos(children);
                    // Actualizar el valor del padre con la suma de sus hijos
                    row.update({ [parcialField]: totalHijos.toString() }, true);
                    total = total.plus(totalHijos);
                } else {
                    // Es un nodo hoja, usar su valor propio
                    const valorNodo = new Decimal(data[parcialField] || 0);
                    total = total.plus(valorNodo);

                    // Verificar si es el valor especial que necesitamos
                    if (data.descripcion === "Utiles de escritorio, ploteos") {
                        datavaluesAd = valorNodo;
                        itemEncontrado = true;
                    }
                }
            });

            return total;
        }

        // Obtener filas raíz
        const rootRows = tabulator.getRows().filter(row => row.getTreeParent() === false);

        // Calcular el total general usando Decimal
        const totalGeneral = calcularTotalesRecursivos(rootRows);

        // Calcular total sin el valor especial
        const totalSinEspecial = itemEncontrado ? totalGeneral.minus(datavaluesAd) : totalGeneral;

        // Actualizar la visualización en UI
        const footerElement = document.getElementById(`total-${tabla}`);
        if (footerElement) {
            footerElement.textContent = totalGeneral.toFixed(2);
        }

        // Devolver objetos Decimal precisos
        return {
            totalCompleto: totalGeneral,
            totalConResta: totalSinEspecial,
            valorEspecial: datavaluesAd,
            itemEncontrado: itemEncontrado
        };
    }

    /**
     * Actualiza todos los totales generales y específicos, y actualiza la UI
     * @returns {Decimal} El total general como objeto Decimal
     */
    actualizarTotalGeneral() {
        // Calcular totales usando Decimal
        const totalGeneralesResult = this.actualizarTotal("generales");
        const totalEspecificosResult = this.actualizarTotal("especificos");

        // Extraer los valores Decimal
        const totalGeneralesDecimal = totalGeneralesResult.totalCompleto;
        const totalEspecificosDecimal = totalEspecificosResult.totalCompleto;

        // Calcular total general
        const totalGeneralDecimal = totalGeneralesDecimal.plus(totalEspecificosDecimal);

        // Guardar los valores Decimal en las propiedades de la clase
        this.totalGastoGeneralFijo = totalGeneralesDecimal;
        this.totalGastoGeneralVariable = totalEspecificosDecimal;
        this.totalGeneral = totalGeneralDecimal;

        // Actualizar UI con valores formateados
        document.getElementById("ggf").value = totalGeneralesDecimal.toFixed(2);
        document.getElementById("ggv").value = totalEspecificosDecimal.toFixed(2);

        const totalGeneralElement = document.getElementById('totalGeneral');
        if (totalGeneralElement) {
            totalGeneralElement.querySelector('span').textContent = this.formatearMoneda(totalGeneralDecimal);
        }

        // Calcular y mostrar el porcentaje real si hay costo directo
        if (this.costoDirectoG && !new Decimal(this.costoDirectoG).isZero()) {
            const costoDirectoDecimal = new Decimal(this.costoDirectoG);
            const porcentajeRealDecimal = totalGeneralDecimal.times(100).dividedBy(costoDirectoDecimal);

            // Opcionalmente mostrar el porcentaje real calculado (solo si no estamos en medio de un ajuste)
            if (!this._ajusteEnProceso) {
                this.actualizarPorcentajeTotalGeneral(porcentajeRealDecimal);
            }
        }

        return totalGeneralDecimal;
    }

    /**
     * Formatea un valor Decimal como moneda
     * @param {Decimal} valor - Valor a formatear
     * @returns {string} Valor formateado como moneda
     */
    formatearMoneda(valor) {
        if (!(valor instanceof Decimal)) {
            valor = new Decimal(valor || 0);
        }

        // Formatear con 2 decimales
        return valor.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    crearElementoTotalGeneral(costoDirectoFromServer, gastoGeneralTotal) {
        // Crear el total general div antes de esperar
        const totalElement = document.createElement('div');
        totalElement.id = 'totalGeneral';
        totalElement.className = 'total-general';
        totalElement.innerHTML = '<strong>TOTAL GENERAL: </strong><span>S/. 0.00</span>';

        // Insertamos el elemento después del contenedor
        const container = document.querySelector('#gastosEspecificos');
        if (container) {
            container.parentNode.insertBefore(totalElement, container.nextSibling);
        }

        // Obtener el valor de Costo Directo
        this.costoDirectoParaTablaGeneral = parseFloat(costoDirectoFromServer);
        this.gastosGeneralesParaTablaGeneral = parseFloat(gastoGeneralTotal);

        // Calcular el porcentaje inicial
        let porcentajeInicial = 0;
        if (this.gastosGeneralesParaTablaGeneral !== 0 && this.costoDirectoParaTablaGeneral) {
            porcentajeInicial = ((this.gastosGeneralesParaTablaGeneral / this.costoDirectoParaTablaGeneral) * 100);
        }
        this.porcentajeTotalGeneralElement; // Variable para almacenar la referencia al td de porcentaje

        // Crear la mini tabla
        const tabla = document.createElement('table');
        tabla.className = 'tabla-total-general w-82 mt-5 text-base text-left rtl:text-right text-gray-950 dark:text-gray-950 border rounded-lg shadow-sm bg-blue-500';

        // Crear las filas de la tabla
        tabla.innerHTML = `
                <thead>
                    <tr>
                        <th class="py-2 px-2">Descripción</th>
                        <th class="py-2 px-2">Valor</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="py-2 px-2">Costo Directo</td>
                        <td class="py-2 px-2">S/. ${this.costoDirectoParaTablaGeneral ? this.costoDirectoParaTablaGeneral : '0.00'}</td>
                    </tr>
                    <tr>
                        <td class="py-2 px-2">Gastos Generales</td>
                        <td class="py-2 px-2">S/. ${this.gastosGeneralesParaTablaGeneral ? this.gastosGeneralesParaTablaGeneral : '0.00'}</td>
                    </tr>
                    <tr>
                        <td class="py-2 px-2">Porcentaje</td>
                        <td class="py-2 px-2" id="porcentaje-total-general">${(porcentajeInicial)}%</td>
                    </tr>
                </tbody>
            `;

        // Insertar la tabla después del contenedor
        if (container) {
            container.parentNode.insertBefore(tabla, container.nextSibling);
            this.porcentajeTotalGeneralElement = document.getElementById('porcentaje-total-general');
        }
    }

    actualizarPorcentajeTotalGeneral(porcentaje) {
        if (this.porcentajeTotalGeneralElement) {
            this.porcentajeTotalGeneralElement.textContent = `${Math.round(porcentaje)}%`;
        }
    }

    agregarEventos() {
        document.querySelector(".add-row-fatherGG")?.addEventListener("click", () => {
            this.agregarFila("generales");
            this.actualizarTotalGeneral();
        });

        document.querySelector(".add-row-fatherGE")?.addEventListener("click", () => {
            this.agregarFila("especificos");
            this.actualizarTotalGeneral();
        });

        // Agregar botón para exportar datos si es necesario
        document.querySelector(".exportar-datos")?.addEventListener("click", () => this.exportarDatos());
    }

    // Método opcional para exportar datos
    exportarDatos() {
        const idPresupuesto = document.getElementById('id_presupuestos').value;
        if (!idPresupuesto) {
            throw new Error('ID de presupuesto no encontrado');
        }

        const datosGenerales = this.gastosGenerales.getData();
        const datosEspecificos = this.gastosEspecificos.getData();

        const datos = {
            gastosGenerales: datosGenerales,
            gastosEspecificos: datosEspecificos,
            totalGeneral: this.totalGeneral.toString(),
            totalGastoGeneralFijo: this.totalGastoGeneralFijo.toString(),
            totalGastoGeneralVariable: this.totalGastoGeneralVariable.toString(),
        };
        // Crear archivo de texto para descargar
        //const dataStr = JSON.stringify(datos, null, 2);
        const dataStr = JSON.stringify({ gastos_generales: datos });
        $.ajax({
            url: `/guardar-gastos-generales/${idPresupuesto}`,
            type: "POST",
            data: dataStr,
            contentType: "application/json",
            headers: {
                "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content")
            },
            success: (response) => {
                Swal.fire({
                    title: "Éxito",
                    text: "Datos guardados correctamente",
                    icon: "success",
                    timer: 1500
                });
            },
            error: (xhr, status, error) => {
                console.error("Error al guardar:", error);
                Swal.fire({
                    title: "Error",
                    text: "No se pudieron guardar los datos",
                    icon: "error"
                });
            }
        });

        // const dataBlob = new Blob([dataStr], { type: 'application/json' });
        // const url = URL.createObjectURL(dataBlob);

        // const a = document.createElement('a');
        // a.href = url;
        // a.download = 'gastos_exportados.json';
        // document.body.appendChild(a);
        // a.click();
        // document.body.removeChild(a);
        // URL.revokeObjectURL(url);
    }
}

export default Gastos;