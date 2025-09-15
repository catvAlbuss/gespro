$(document).ready(function () {
    // Abrir el modal de Marcar Asistencia al hacer clic en el botón correspondiente
    document.getElementById('actualizar_presupuestos').onclick = function () {
        document.getElementById('modalactualizar_presupuestos').classList.remove('hidden');
    };
    document.getElementById('actualizar_monto_invertido').onclick = function () {
        document.getElementById('modalactualizar_presupuestos').classList.remove('hidden');
    };

    // Cerrar el modal de Marcar Asistencia al hacer clic en el botón de Dismiss
    document.getElementById('dismiss-actualizar_presupuestos').onclick = function () {
        document.getElementById('modalactualizar_presupuestos').classList.add('hidden');
    };

    // Inicializar las funciones para cargar datos
    obtenerProyectosPorGrupo();
    obtenerInversionesPorGrupo();

    // Función para cargar proyectos y sus presupuestos
    function obtenerProyectosPorGrupo() {
        const datosproyectos = document.getElementById('datosproyectos').value;
        const dataProyectos = JSON.parse(datosproyectos);
        let contenedor = document.getElementById("contenedor_presupuesto");

        // Limpiar el contenedor antes de añadir nuevos elementos
        contenedor.innerHTML = '';

        // Función para actualizar los resultados basados en el presupuesto total y porcentajes
        function actualizarResultados() {
            let presupuestoDesignado = parseFloat(document.getElementById("presupuesto_desginado").value);
            dataProyectos.forEach((proyecto) => {
                const nombreLimpio = limpiarNombreProyecto(proyecto.nombre_proyecto);
                let porcentajeInput = document.getElementById(nombreLimpio + "_porcentaje");
                let resultadoInput = document.getElementById(nombreLimpio + "_resultado");
                let porcentaje = parseFloat(porcentajeInput.value);
                if (!isNaN(porcentaje)) {
                    resultadoInput.value = (presupuestoDesignado * (porcentaje / 100)).toFixed(2);
                } else {
                    resultadoInput.value = "0.00";
                }
            });
        }

        let resultados = [];

        dataProyectos.forEach((proyecto) => {
            const nombreLimpio = limpiarNombreProyecto(proyecto.nombre_proyecto);

            // Crear una fila para cada proyecto en el array
            let rowDiv = document.createElement("div");
            rowDiv.className = "flex items-center mb-4"; // Flexbox para la fila y centrar verticalmente

            // Crear el primer input para el porcentaje
            let colDiv1 = document.createElement("div");
            colDiv1.className = "w-full md:w-1/2 lg:w-1/2 pr-2"; // Ajustar el tamaño y añadir padding a la derecha

            let formGroupDiv1 = document.createElement("div");
            formGroupDiv1.className = "mb-4";

            let inputLabel1 = document.createElement("label");
            inputLabel1.className = "block text-sm font-medium text-gray-700"; // Estilos para el label
            inputLabel1.setAttribute("for", nombreLimpio + "_porcentaje");
            inputLabel1.innerHTML = '<i class="fas fa-check"></i> ' + proyecto.nombre_proyecto + ' (%)';

            let inputPorcentaje = document.createElement("input");
            inputPorcentaje.type = "number";
            inputPorcentaje.className = "mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"; // Estilos para el input
            inputPorcentaje.name = nombreLimpio + "_porcentaje";
            inputPorcentaje.id = nombreLimpio + "_porcentaje";
            inputPorcentaje.dataset.id = proyecto.id_proyectos; // Añadir dataset.id para capturar el id del proyecto
            inputPorcentaje.dataset.type = "presupuesto"; // Identificar que es un input de presupuesto
            inputPorcentaje.placeholder = "0.00";
            inputPorcentaje.value = proyecto.porcentaje_designado;
            inputPorcentaje.addEventListener("input", (event) => {
                let porcentaje = parseFloat(event.target.value);
                let resultadoInput = document.getElementById(nombreLimpio + "_resultado");
                let presupuestoDesignado = parseFloat(document.getElementById("presupuesto_desginado").value);
                if (!isNaN(porcentaje)) {
                    resultadoInput.value = (presupuestoDesignado * (porcentaje / 100)).toFixed(2);
                } else {
                    resultadoInput.value = "0.00";
                }
            });

            formGroupDiv1.appendChild(inputLabel1);
            formGroupDiv1.appendChild(inputPorcentaje);
            colDiv1.appendChild(formGroupDiv1);
            rowDiv.appendChild(colDiv1);

            // Crear el segundo input para el resultado
            let colDiv2 = document.createElement("div");
            colDiv2.className = "w-full md:w-1/2 lg:w-1/2 pl-2"; // Ajustar el tamaño y añadir padding a la izquierda

            let formGroupDiv2 = document.createElement("div");
            formGroupDiv2.className = "mb-4";

            let inputLabel2 = document.createElement("label");
            inputLabel2.className = "block text-sm font-medium text-gray-700"; // Estilos para el label
            inputLabel2.setAttribute("for", nombreLimpio + "_resultado");
            inputLabel2.innerHTML = '<i class="fas fa-check"></i> ' + proyecto.nombre_proyecto + ' (Resultado)';

            let inputResultado = document.createElement("input");
            inputResultado.type = "number";
            inputResultado.className = "mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"; // Estilos para el input
            inputResultado.name = nombreLimpio + "_resultado";
            inputResultado.id = nombreLimpio + "_resultado";
            inputResultado.dataset.id = proyecto.id_proyectos; // Añadir dataset.id para capturar el id del proyecto
            inputResultado.dataset.type = "presupuesto"; // Identificar que es un input de presupuesto
            inputResultado.placeholder = "0.00";
            inputResultado.value = proyecto.monto_designado;
            inputResultado.readOnly = true;

            formGroupDiv2.appendChild(inputLabel2);
            formGroupDiv2.appendChild(inputResultado);
            colDiv2.appendChild(formGroupDiv2);
            rowDiv.appendChild(colDiv2);

            // Añadir la fila al contenedor
            contenedor.appendChild(rowDiv);

            resultados.push({
                idProyecto: proyecto.id_proyectos,
                nombreProyecto: nombreLimpio,
                resultado: parseFloat(inputResultado.value) || 0
            });
        });

        // Llamar a la función de gráficos si existe
        if (typeof graficosReportes === 'function') {
            graficosReportes(resultados);
        }

        // Añadir un event listener al input del presupuesto designado para actualizar los resultados
        document.getElementById("presupuesto_desginado").addEventListener("input", actualizarResultados);
    }

    // Función para cargar inversiones
    function obtenerInversionesPorGrupo() {
        // Intentar obtener datos de inversiones específicos, si existe ese elemento
        const datosInversionesElem = document.getElementById('datosinversiones') || document.getElementById('datosproyectos');
        const datosInversiones = datosInversionesElem.value;
        const dataInversiones = JSON.parse(datosInversiones);

        let contenedor = document.getElementById("contenedor_presupuesto_inversion");

        // Limpiar el contenedor antes de añadir nuevos elementos
        contenedor.innerHTML = '';

        // Función para actualizar la suma total de inversiones
        function actualizarResultadosInversion() {
            let totalInversion = 0;

            // Sumar todos los montos introducidos por el usuario
            dataInversiones.forEach((inversion) => {
                const nombreLimpio = limpiarNombreProyecto(inversion.nombre_proyecto);
                let montoInput = document.getElementById(nombreLimpio + "_monto_invertido");
                if (montoInput) {
                    let monto = parseFloat(montoInput.value);
                    if (!isNaN(monto)) {
                        totalInversion += monto;
                    }
                }
            });

            // Mostrar el total en el campo de presupuesto
            document.getElementById("presupuesto_inversion").value = totalInversion.toFixed(2);
        }

        dataInversiones.forEach((inversion) => {
            const nombreLimpio = limpiarNombreProyecto(inversion.nombre_proyecto);

            // Crear una fila para cada inversión en el array
            let rowDiv = document.createElement("div");
            rowDiv.className = "flex items-center mb-4"; // Flexbox para la fila y centrar verticalmente

            // Crear el input para el monto invertido
            let colDiv = document.createElement("div");
            colDiv.className = "w-full"; // Usamos todo el ancho disponible

            let formGroupDiv = document.createElement("div");
            formGroupDiv.className = "mb-4";

            let inputLabel = document.createElement("label");
            inputLabel.className = "block text-sm font-medium text-gray-700"; // Estilos para el label
            inputLabel.setAttribute("for", nombreLimpio + "_monto_invertido");
            inputLabel.innerHTML = '<i class="fas fa-check"></i> ' + inversion.nombre_proyecto + ' (Monto Invertido)';

            let inputMonto = document.createElement("input");
            inputMonto.type = "number";
            inputMonto.className = "mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"; // Estilos para el input
            inputMonto.name = nombreLimpio + "_monto_invertido";
            inputMonto.id = nombreLimpio + "_monto_invertido";
            inputMonto.dataset.id = inversion.id_proyectos; // Añadir dataset.id para capturar el id de la inversión
            inputMonto.dataset.type = "inversion"; // Identificar que es un input de inversión
            inputMonto.placeholder = "0.00";
            inputMonto.value = inversion.monto_invertido || "0.00"; // Usar monto_invertido si existe, si no, 0.00
            inputMonto.step = "0.01"; // Permitir decimales
            inputMonto.addEventListener("input", actualizarResultadosInversion);

            formGroupDiv.appendChild(inputLabel);
            formGroupDiv.appendChild(inputMonto);
            colDiv.appendChild(formGroupDiv);
            rowDiv.appendChild(colDiv);

            // Añadir la fila al contenedor
            contenedor.appendChild(rowDiv);
        });

        // Llamar a actualizarResultadosInversion para inicializar el valor total
        actualizarResultadosInversion();
    }

    // Evento para actualizar presupuestos
    document.getElementById("actualizar_presupuesto").addEventListener("click", () => {
        let proyectos = [];

        // Seleccionar solo los inputs de presupuesto
        document.querySelectorAll("input[data-type='presupuesto']").forEach((input) => {
            // Verificar si es un input de porcentaje
            if (input.id.includes("_porcentaje")) {
                let id_proyecto = input.dataset.id;
                let nombreBase = input.id.split("_")[0];

                let inputResultado = document.getElementById(nombreBase + "_resultado");
                let inputPorcentaje = input; // Ya tenemos referencia al input de porcentaje

                // Validar que los inputs existen
                if (inputResultado && inputPorcentaje) {
                    let monto_designado = parseFloat(inputResultado.value);
                    let porcentaje_designado = parseInt(inputPorcentaje.value);

                    // Solo agregar si no está ya en la lista
                    if (!proyectos.some(p => p.id_proyecto === id_proyecto)) {
                        proyectos.push({
                            id_proyecto,
                            monto_designado,
                            porcentaje_designado
                        });
                    }
                }
            }
        });

        $.ajaxSetup({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            }
        });

        $.ajax({
            url: '/actualizarpresupuesto',
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({ proyectos }),
            success: (response) => {
                Swal.fire({
                    title: '¡Éxito!',
                    text: response.message,
                    icon: 'success',
                    confirmButtonText: 'Aceptar'
                });
            },
            error: (xhr, status, error) => {
                Swal.fire({
                    title: 'Error',
                    text: "Hubo un problema al actualizar los datos: " + xhr.responseText,
                    icon: 'error',
                    confirmButtonText: 'Cerrar'
                });
            }
        });
    });

    // Evento para actualizar montos invertidos
    document.getElementById("actualizar_monto_invertido").addEventListener("click", () => {
        let inversiones = [];

        // Seleccionar solo los inputs de inversión
        document.querySelectorAll("input[data-type='inversion']").forEach((input) => {
            let id_proyecto = input.dataset.id;
            let monto_invertido = parseFloat(input.value);

            // Validar que el monto invertido es un número
            if (!isNaN(monto_invertido)) {
                inversiones.push({
                    id_proyecto,
                    monto_invertido
                });
            }
        });

        // Verificar que hay inversiones para enviar
        if (inversiones.length === 0) {
            Swal.fire({
                title: 'Error',
                text: 'No se han encontrado montos válidos para actualizar.',
                icon: 'error',
                confirmButtonText: 'Cerrar'
            });
            return;
        }

        // Realizar la solicitud AJAX
        $.ajaxSetup({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            }
        });

        $.ajax({
            url: '/actualizar_monto_invertido_proyecto',
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({ proyectos: inversiones }), // Mantener estructura esperada por el servidor
            success: (response) => {
                Swal.fire({
                    title: '¡Éxito!',
                    text: response.message,
                    icon: 'success',
                    confirmButtonText: 'Aceptar'
                });
            },
            error: (xhr, status, error) => {
                Swal.fire({
                    title: 'Error',
                    text: "Hubo un problema al actualizar los datos: " + xhr.responseText,
                    icon: 'error',
                    confirmButtonText: 'Cerrar'
                });
            }
        });
    });

    function limpiarNombreProyecto(nombre) {
        // Busca la posición del guion "-"
        const guionIndex = nombre.indexOf('-');
        if (guionIndex !== -1) {
            // Si hay un guion, toma la parte después del guion
            return nombre.substring(guionIndex + 1).trim();
        } else {
            // Si no hay guion, devuelve el nombre completo
            return nombre.trim();
        }
    }

    obtenerData();
    function obtenerData() {
        const dataproyectos = document.getElementById('tareas').value;
        const dataProyectoreports = JSON.parse(dataproyectos);
        // Obtener la fecha actual
        const today = new Date();
        const currentMonth = today.getMonth() + 1; // Ajustar para que el mes sea 1-indexado
        const lastMonth = new Date(today);
        lastMonth.setMonth(today.getMonth() - 1);

        // Contadores utilizando Map
        let tareasMesActual = new Map();
        let tareasUltimaSemana = new Map();
        let tareasMesAnterior = new Map();
        let tareasHastaMesAnterior = new Map();

        // Obtener la fecha de la última semana del mes
        const lastWeekStart = getLastWeekStart(today);
        const lastWeekEnd = getLastWeekEnd(today);
        dataProyectoreports.forEach(tarea => {
            const fechaFormateada = parseDate(tarea.fecha);  // Usamos fecha
            if (!fechaFormateada) return; // Salir si la fecha no es válida

            const fechaSubido = fechaFormateada.toISOString().split('T')[0];
            const mesSubido = fechaFormateada.getMonth() + 1; // Ajustar para que el mes sea 1-indexado
            const trabajadorId = tarea.usuario_designado;

            // Inicializar los contadores de días únicos si no existen
            [tareasMesActual, tareasUltimaSemana, tareasMesAnterior, tareasHastaMesAnterior].forEach(map => {
                if (!map.has(trabajadorId)) map.set(trabajadorId, new Set());
            });

            // Tareas del mes actual
            if (mesSubido === currentMonth) {
                tareasMesActual.get(trabajadorId).add(fechaSubido);

                // Tareas de la última semana del mes actual
                if (fechaFormateada >= lastWeekStart && fechaFormateada <= lastWeekEnd) {
                    tareasUltimaSemana.get(trabajadorId).add(fechaSubido);
                }
            }

            // Tareas del mes anterior
            if (mesSubido === lastMonth.getMonth() + 1) {
                tareasMesAnterior.get(trabajadorId).add(fechaSubido);
            }

            // Tareas hasta el mes anterior
            if (mesSubido <= lastMonth.getMonth() + 1) {
                tareasHastaMesAnterior.get(trabajadorId).add(fechaSubido);
            }
        });
        // Convertir Sets a la cantidad de días únicos
        const countTasks = (taskMap) => {
            for (const [trabajadorId, set] of taskMap.entries()) {
                taskMap.set(trabajadorId, set.size);
            }
        };

        countTasks(tareasMesActual);
        countTasks(tareasUltimaSemana);
        countTasks(tareasMesAnterior);
        countTasks(tareasHastaMesAnterior);

        // Guarda los datos del proyecto para uso posterior
        $('#dataProyectoreports').data('proyectos', dataProyectoreports);
        $('#dataProyectoreports').data('tareasMesActual', Object.fromEntries(tareasMesActual));
        $('#dataProyectoreports').data('tareasUltimaSemana', Object.fromEntries(tareasUltimaSemana));
        $('#dataProyectoreports').data('tareasMesAnterior', Object.fromEntries(tareasMesAnterior));
        $('#dataProyectoreports').data('tareasHastaMesAnterior', Object.fromEntries(tareasHastaMesAnterior));

        // Llama a obtener_personal después de contar las tareas
        obtener_personal();
    }

    function parseDate(dateString) {
        if (!dateString || typeof dateString !== "string") {
            console.error("Fecha no válida o indefinida:", dateString);
            return null; // Evitar errores si `dateString` no es válido
        }
    
        // Eliminar espacios extras y formatear la fecha
        const fechaSubidoString = dateString.trim();
        const fechaFormateada = new Date(fechaSubidoString);
    
        // Verificar si la fecha es válida
        if (isNaN(fechaFormateada)) {
            console.error("Fecha no válida:", dateString);
            return null; // Salir si la fecha no es válida
        }
    
        return fechaFormateada;
    }

    function getLastWeekStart(today) {
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const lastWeekStart = new Date(lastDayOfMonth);
        lastWeekStart.setDate(lastDayOfMonth.getDate() - 7);
        return lastWeekStart;
    }

    function getLastWeekEnd(today) {
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return lastDayOfMonth;
    }

    // Función para verificar si una fecha está en la última semana de un mes
    function isLastWeek(date, today) {
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const startOfLastWeek = endOfMonth.getDate() - 6;
        return date.getDate() >= startOfLastWeek && date.getDate() <= endOfMonth.getDate();
    }

    function obtener_personal() {
        const peronsalTrab = document.getElementById('listarPersonals').value;
        const listarPersonals = JSON.parse(peronsalTrab);
        const tareasMesActual = $('#dataProyectoreports').data('tareasMesActual');
        const tareasUltimaSemana = $('#dataProyectoreports').data('tareasUltimaSemana');
        const tareasMesAnterior = $('#dataProyectoreports').data('tareasMesAnterior');
        const tareasHastaMesAnterior = $('#dataProyectoreports').data('tareasHastaMesAnterior');

        let template = '';
        var count = 1;
        let sumaTotalGasto = 0; // Inicializamos la variable para la suma total
        // Listar personal con sus tareas
        listarPersonals.forEach(listarPersonal => {
            const trabajadorId = listarPersonal.id_trabajador;
            const tareasTotalAnterior = tareasHastaMesAnterior[trabajadorId] || 0;
            const tareasMes = tareasMesActual[trabajadorId] || 0;
            const tareasSemana = tareasUltimaSemana[trabajadorId] || 0;
            const sueldo_base_personal = (parseFloat(listarPersonal.sueldo_Personal) / 25)
            const gasto_total_personal = (tareasTotalAnterior + tareasMes) * sueldo_base_personal;
            sumaTotalGasto += gasto_total_personal;

            template += `
                    <tr data-id="${trabajadorId}">
                        <th scope="row" class="text-center">${count}</th>
                        <td class="text-center">${listarPersonal.nombre_trab}</td>
                        <td class="text-center">${tareasTotalAnterior}</td>
                        <td class="text-center">${tareasMes}</td>
                        <td class="text-center">${tareasSemana}</td>
                        <td class="text-center">S/: ${gasto_total_personal.toFixed(2)}</td>
                    </tr>
                `;
            count++;
        });

        $('#total_gastos_fecha').html(sumaTotalGasto.toFixed(2));
        // Agregar el resumen al final de la tabla
        const totalTareasAnterior = Object.values(tareasHastaMesAnterior).reduce((acc, val) => acc + val, 0);
        const totalTareasMesActual = Object.values(tareasMesActual).reduce((acc, val) => acc + val, 0);
        const totalTareasSemana = Object.values(tareasUltimaSemana).reduce((acc, val) => acc + val, 0);
        const total_dias = totalTareasAnterior + totalTareasMesActual;
        template += `
                <tr>
                    <th scope="row" class="text-center" colspan="2">Total Tareas Anteriores</th>
                    <td class="text-center">${totalTareasAnterior}</td>
                    <td class="text-center">${totalTareasMesActual}</td>
                    <td class="text-center">${totalTareasSemana}</td>
                    <td class="text-center">S/: ${sumaTotalGasto.toFixed(2)}</td>
                </tr>
            `;

        $('#tabla_datos_avanzados').html(template);
        $('#total_dias_ejecutado_hoy').html(total_dias);

        let encargado = "";
        switch (id_empresa) {
            case '1':
                encargado = "-";
                break;
            case '2':
                encargado = "JOSE EDUARDO NIEVES CUADROS";
                break;
            case '3':
                encargado = "JOSE BENNYN CORTES AGUILAR";
                break;
            case '4':
                encargado = "DORIS DEL PILAR MEZA LOPEZ";
                break;
            case '5':
                encargado = "EMERSON MESIAS ESPINOZA SALAZAR";
                break;
            default:
                encargado = "Encargado no disponible"; // Set a default message
                break;
        }

        // Set the value of the 'encargado' element directly
        $('#encargado').html(encargado);
        // renderizarGraficos(sumaTotalGasto, total_dias);

    }

    function isLastWeek(date, today) {
        const lastWeekStart = new Date(today);
        lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
        const lastWeekEnd = new Date(today);
        lastWeekEnd.setDate(today.getDate() - today.getDay() - 1);
        return date >= lastWeekStart && date <= lastWeekEnd;
    }

    fecha_reportes();

    function fecha_reportes() {
        var fechaElement = document.getElementById("fecha_actual");

        // Obtiene la fecha actual
        const fechaActual = new Date();

        // Formateador de fecha en español
        const fechaFormatter = new Intl.DateTimeFormat('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        // Formatea la fecha actual
        let fechaFormateada = fechaFormatter.format(fechaActual);

        // Inserta la fecha formateada en el elemento
        // fechaElement.innerText = fechaFormateada;
    }

    function graficosReportes(resultados) {
        const id_empresa = document.getElementById('id_empresa').value;
        const datosproyectoss = document.getElementById('datosproyectos').value;
        const avanceporcentajeProyectos = document.getElementById('avanceporcentajeProyectos').value;
        const montoplazoss = document.getElementById('montoplazos').value;
        const listarPersonalss = document.getElementById('listarPersonals').value;
        const reportpresupuestoss = document.getElementById('reportpresupuestos').value;
        const reporterequerimientoProcesos = document.getElementById('reporterequerimientoProceso').value;
        const reporterequerimientosustentadps = document.getElementById('reporterequerimientosustentadp').value;

        const avancePorcentajeProyecto = JSON.parse(avanceporcentajeProyectos);
        const dataProyectos = JSON.parse(datosproyectoss);
        const montoplazos = JSON.parse(montoplazoss);
        const listarPersonals = JSON.parse(listarPersonalss);
        const reportpresupuestos = JSON.parse(reportpresupuestoss);
        const reporterequerimientoProceso = JSON.parse(reporterequerimientoProcesos);
        const reporterequerimientosustentadp = JSON.parse(reporterequerimientosustentadps);

        //fase de pruebas
        let montorequerimientoproceso = 0;
        let montorequerimientosustentado = 0;
        let sumaTotalGastototal = 0; // Variable para almacenar la suma total
        const costoPorTarea = 900; // Costo por tarea en soles
        let montoTareas = 0;
        const montos_invertidos_anterior = parseFloat(document.getElementById('presupuesto_desginado').value) || 0;
        // Cálculos para porcentaje total de proyectos
        let totalPorcentaje = 0;
        // dataProyectos.forEach(dataProyecto => {
        //     //totalPorcentaje += parseFloat(dataProyecto.porcentaje_total);
        // });
        avancePorcentajeProyecto.forEach(avanceProyecto => {
            totalPorcentaje += parseInt(avanceProyecto.porcentaje_total_actividades);
        });
        let promedioPorcentaje = (totalPorcentaje / dataProyectos.length) || 0;
        $('#total_proyecto').html(promedioPorcentaje);
        // Cálculos para montos y plazos
        let totalPlazo = 0;
        let totalmonto = 0;
        let totalmontoInverAnterior = 0;

        montoplazos.forEach(montoplazo => {
            totalPlazo += parseFloat(montoplazo.plazo_total_pro);
            totalmonto += parseFloat(montoplazo.monto_designado);
            totalmontoInverAnterior += parseFloat(montoplazo.monto_invertido_prev);
        });

        //************************FUNCIONALIDAD PARA LISTAR PERSONAL********************* */
        const tareas = document.getElementById('tareas').value;
        const dataProyectoreports = JSON.parse(tareas);

        // 📅 Obtener fechas actuales
        const hoy = new Date();
        const primerDiaMess = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const primerDiaMesAnteriors = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
        const primerDiaSemanas = new Date(hoy);
        primerDiaSemanas.setDate(hoy.getDate() - 7); // Restar 7 días correctamente

        // Función para normalizar fecha (sin horas)
        function normalizarFecha(fecha) {
            const d = new Date(fecha + "T00:00:00"); // Forzar formato YYYY-MM-DD para evitar desfases de zona horaria
            if (isNaN(d.getTime())) {
                console.error("❌ Error: Fecha inválida:", fecha);
                return null;
            }
            return new Date(d.getFullYear(), d.getMonth(), d.getDate()); // Elimina las horas
        }

        // Normalizar fechas de referencia
        const primerDiaMes = normalizarFecha(primerDiaMess.toISOString().split("T")[0]);
        const primerDiaSemana = normalizarFecha(primerDiaSemanas.toISOString().split("T")[0]);
        const primerDiaMesAnterior = normalizarFecha(primerDiaMesAnteriors.toISOString().split("T")[0]);

        // Contadores utilizando Map
        let tareasMesActual = new Map();
        let tareasUltimaSemana = new Map();
        let tareasMesAnterior = new Map();
        let tareasHastaMesAnterior = new Map();

        dataProyectoreports.forEach((tarea, index) => {
            const diasAsignados = parseInt(tarea.diasAsignados, 10) || 0;
            const trabajadorId = tarea.usuario_designado;

            // Convertir fecha correctamente
            const fechaTarea = normalizarFecha(tarea.fecha);
            if (!fechaTarea) return; // Evitar errores si la fecha es inválida

            // 📅 Clasificar según la fecha
            if (fechaTarea >= primerDiaMes) {
                tareasMesActual.set(trabajadorId, (tareasMesActual.get(trabajadorId) || 0) + diasAsignados);
            } else if (fechaTarea >= primerDiaSemana) {
                tareasUltimaSemana.set(trabajadorId, (tareasUltimaSemana.get(trabajadorId) || 0) + diasAsignados);
            } else {
                tareasMesAnterior.set(trabajadorId, (tareasMesAnterior.get(trabajadorId) || 0) + diasAsignados);
            }
            //  else {
            //     tareasHastaMesAnterior.set(trabajadorId, (tareasHastaMesAnterior.get(trabajadorId) || 0) + diasAsignados);
            // }
        });

        // 🔄 Guarda los datos en jQuery para su uso posterior
        $('#dataProyectoreports').data('proyectos', dataProyectoreports);
        $('#dataProyectoreports').data('tareasMesActual', Object.fromEntries(tareasMesActual));
        $('#dataProyectoreports').data('tareasUltimaSemana', Object.fromEntries(tareasUltimaSemana));
        $('#dataProyectoreports').data('tareasMesAnterior', Object.fromEntries(tareasMesAnterior));
        $('#dataProyectoreports').data('tareasHastaMesAnterior', Object.fromEntries(tareasHastaMesAnterior));

        let count = 1;
        let sumaTotalGasto = 0;

        // 🔹 Mapeo de datos de personal
        let seriesData = listarPersonals.map(listarPersonal => {
            const trabajadorId = listarPersonal.id;
            // Obtener tareas acumuladas y actuales
            const tareasHastaMesAnterior = $('#dataProyectoreports').data('tareasMesAnterior') || {};
            const tareasTotalAnterior = tareasHastaMesAnterior[trabajadorId] || 0;
            const tareasMes = tareasMesActual.get(trabajadorId) || 0;

            // Asegurar que sueldo_base_personal sea un número válido
            const sueldo_base_personal = (parseFloat(listarPersonal.sueldo_base) || 0) / 26;

            // 📌 Cálculo del gasto total
            const gasto_total_personal = (tareasTotalAnterior + tareasMes) * sueldo_base_personal;
            sumaTotalGasto += gasto_total_personal;

            return [
                count++,
                listarPersonal.name,
                tareasTotalAnterior,
                tareasMes,
                `S/: ${gasto_total_personal.toFixed(2)}`
            ];
        });
        // 📊 Cálculo de totales
        const totalTareasAnterior = [...tareasMesAnterior.values()].reduce((acc, val) => acc + val, 0);
        const totalTareasMesActual = [...tareasMesActual.values()].reduce((acc, val) => acc + val, 0);
        const total_dias = totalTareasAnterior + totalTareasMesActual;

        // 🟢 Agregar la fila de totales
        seriesData.push([
            '',
            'Total',
            totalTareasAnterior,
            totalTareasMesActual,
            `S/: ${sumaTotalGasto.toFixed(2)}`
        ]);

        //************************FUNCONALIDAD PARA LISTAR AVANCES DE PROYECTOS***********/
        let seriesDatapro = [];
        let labels = [];

        avancePorcentajeProyecto.forEach(avanceProyecto => {
            const porcentajeReal = Math.round(parseInt(avanceProyecto.porcentaje_total_actividades) / total_dias);
            const nombreLimpio = limpiarNombreProyecto(avanceProyecto.nombre_proyecto);
            labels.push(nombreLimpio);
            seriesDatapro.push(porcentajeReal);
        });

        let montoAnterior = 0;
        let montoPresupuestado = 0;

        var nombre_proyecto = document.getElementById('nombre_proyecto').value;

        //console.log(`El proyecto ejecutando es: ${nombre_proyecto}`);

        //====================== Proyectos ejecutados ===================//
        let desagregado, topografia, demolicion, costos_presupuesto, suelos, electricas, inicial_plaza, sanitarias, expedientes, montoActual;

        switch (nombre_proyecto.trim()) {
            case "PROYECTO VINCHOS":
                montoAnterior = parseFloat(0);
                topografia = parseFloat(2751.5);
                desagregado = parseFloat(5637.5);
                demolicion = parseFloat(1090);
                costos_presupuesto = 0;
                suelos = parseFloat(1276.5);
                electricas = parseFloat(817);
                inicial_plaza = parseFloat(85.5);
                sanitarias = parseFloat(519);
                expedientes = parseFloat(724);
                break;
            case "PROYECTO VILCABAMBA":
                montoAnterior = parseFloat(0);
                topografia = parseFloat(1571.25);
                desagregado = parseFloat(4962.5);
                demolicion = parseFloat(910.5);
                costos_presupuesto = parseFloat(0);
                suelos = parseFloat(1307.5);
                electricas = parseFloat(865.5);
                inicial_plaza = parseFloat(0);
                sanitarias = parseFloat(270);
                expedientes = parseFloat(651);
                break;
            case "PROYECTO 358":
                montoAnterior = parseFloat(0.00);
                topografia = parseFloat(0);
                desagregado = parseFloat(0);
                demolicion = parseFloat(0);
                costos_presupuesto = parseFloat(0);
                suelos = parseFloat(0);
                electricas = parseFloat(0);
                inicial_plaza = parseFloat(0);
                sanitarias = parseFloat(0);
                expedientes = parseFloat(0);
                break;
            case "PROYECTO 64193":
                montoAnterior = parseFloat(0);
                topografia = parseFloat(0);
                desagregado = parseFloat(18025);
                demolicion = parseFloat(0);
                costos_presupuesto = parseFloat(0);
                suelos = parseFloat(0);
                electricas = parseFloat(5845.5);
                inicial_plaza = parseFloat(0);
                sanitarias = parseFloat(2237.5);
                expedientes = parseFloat(0);
                break;
            case "PROYECTO MORADA":
                montoAnterior = parseFloat(0.00);
                topografia = parseFloat(0);
                desagregado = parseFloat(0);
                demolicion = parseFloat(0);
                costos_presupuesto = parseFloat(0);
                suelos = parseFloat(0);
                electricas = parseFloat(0);
                inicial_plaza = parseFloat(0);
                sanitarias = parseFloat(0);
                expedientes = parseFloat(0);
                break;
            case "PROYECTO HUALLMISH":
                montoAnterior = parseFloat(0);
                topografia = parseFloat(704.25);
                desagregado = parseFloat(850);
                demolicion = parseFloat(545);
                costos_presupuesto = parseFloat(0);
                suelos = parseFloat(449);
                electricas = parseFloat(19);
                inicial_plaza = parseFloat(0);
                sanitarias = parseFloat(0);
                expedientes = parseFloat(0);
                break;
            case "PROYECTO PRIALE":
                montoAnterior = parseFloat(0);
                topografia = parseFloat(0);
                desagregado = parseFloat(3462.5);
                demolicion = parseFloat(305);
                costos_presupuesto = parseFloat(0);
                suelos = parseFloat(0);
                electricas = parseFloat(0);
                inicial_plaza = parseFloat(0);
                sanitarias = parseFloat(0);
                expedientes = parseFloat(0);
                break;
            case "PUENTE KOKARI":
                montoAnterior = parseFloat(459);
                break;
            case "PTAR OLLACHEA":
                montoAnterior = parseFloat(502);
                break;
            case "PROYECTO ZOOTECNIA UNAS":
                montoAnterior = parseFloat(1964.5);
                break;
            case "PROYECTO PARQUE SAN PEDRO":
                montoAnterior = parseFloat(534);
                break;
            case "PROYECTO INSTITUTO PUERTO INCA":
                montoAnterior = parseFloat(2745.5);
                break;
            case "PROYECTO IE VINCHOS":
                montoAnterior = parseFloat(1039.5);
                break;
            case "PROYECTO IE VILCABAMBA PRIMARIA":
                montoAnterior = parseFloat(2892);
                break;
            case "PROYECTO IE VILCABAMBA INICIAL":
                montoAnterior = parseFloat(42);
                break;
            case "PROYECTO IE PALLANCHACRA":
                montoAnterior = parseFloat(76);
                break;
            case "PROYECTO IE N° 64193":
                montoAnterior = parseFloat(777.5);
                break;
            case "PROYECTO IE ILLATHUPA":
                montoAnterior = parseFloat(152);
                break;
            case "PROYECTO IE HERMILIO VALDIZAN":
                montoAnterior = parseFloat(23);
                break;
            case "PROYECTO IE CAYRAN":
                montoAnterior = parseFloat(23);
                break;
            case "PROYECTO 626 TANQUE ELEVADO Y JARDIN MODELAMIENTO":
                montoAnterior = parseFloat(19);
                break;
            case "CLINICA RENAL CARE":
                montoAnterior = parseFloat(122);
                break;
            case "AMPLIACIÓN DE LA CLINICA ANGEL REYES TINGO MARIA":
                montoAnterior = parseFloat(23);
                break;
            //Seven heard
            case "PROYECTO OFICINA":
                montoAnterior = parseFloat(706);
                montoActual = parseFloat(475.80);
                break;
            case "ESTUDIO DE SUELOS Y CALICAS":
                montoAnterior = parseFloat(103.70);
                break;
            case "EJECUCION POSTA DE SALUD PUCAJAGA":
                montoAnterior = parseFloat(0);
                montoActual = parseFloat(1357.35);
                break;
            case "PROYECTO CASA VALLE":
                montoAnterior = parseFloat(0);
                montoActual = parseFloat(27);
                break;
            case "METODOLOGIA GENERAL (BASE DE DATOS)":
                montoAnterior = parseFloat(0);
                break;
            case "CONCLUCION IBAÑEZ":
                montoAnterior = parseFloat(0);
                montoActual = parseFloat(1128.89);
                break;
            case "PROYECTO IBAÑEZ":
                montoAnterior = parseFloat(0);
                montoActual = parseFloat(5384.90);
                break;
            case "EJECUCION POSTA DE SALUD TAYAGASHA ADMINISTRATIVO":
                montoAnterior = parseFloat(30.50);
                break;
            case "PROYECTO SUPERVICION FORESTALES":
                montoActual = parseFloat(1.83);
                break;
            case "PROYECTO MANTENIMIENTO Y AMPLIACION DE PARQUE SAN PEDRO":
                montoAnterior = parseFloat(0);
                break;
            case "PROYECTO CONSORCIO RINCONADA":
                montoAnterior = parseFloat(378);
                montoActual = parseFloat(100.65);
                break;
            case "SUPERVICION SHAMBO":
                montoActual = parseFloat(445.30);
                break;
            case "ELABORACIOM DE EXPEDIENTILLOS PUESTO DE SALUD":
                montoAnterior = parseFloat(0);
                montoActual = parseFloat(3296);
                break;
            case "EJECUCION POSTA DE SALUD CHINCHAVITO":
                montoAnterior = parseFloat(0);
                montoActual = parseFloat(3296);
                break;
            case "PROYECTO CONSORCIO YANANO":
                montoAnterior = parseFloat(232);
                montoActual = parseFloat(103.7);
                break;
            case "PROYECTO VARIOS":
                montoAnterior = parseFloat(448.25);
                break;
            case "EJECUCION PROYECTO BARRUETA":
                montoActual = parseFloat(539);
                break;
            case "PROYECTO CONSORCIO PILLCO":
                montoAnterior = parseFloat(464);
                montoActual = parseFloat(23057.50);
                break;
            case "PROYECTO : VIVIENDA MULTIFAMILIAR ZAPATA CRUZ":
                montoAnterior = parseFloat(2710);
                break;
            case "PROYECTO SUPERVICION ESTADIO COLON":
                montoAnterior = parseFloat(562);
                break;
            case "PROYECTO ZOOTECNIA":
                montoAnterior = parseFloat(348.50);
                break;
            case "POROYECTO PORTALES CHUI":
                montoAnterior = parseFloat(1083.50);
                break;
            case "PROYECTO RICARDO PALMA":
                montoAnterior = parseFloat(4021);
                break;
            case "PROYECTO ISABEL":
                montoAnterior = parseFloat(596);
                break;
            case "EJECUCION POSTA DE SALUD CHINCHAYCOCHA":
                montoActual = parseFloat(1027);
                break;
            case "EJECUCION PROYECTO IBAÑEZ ADMINISTRATIVO":
                montoAnterior = parseFloat(1627);
                break;
            case "EJECUCION DE COBERTURA HOSPITAL HV":
                montoAnterior = parseFloat(2159);
                break;
            case "prueba":
                montoAnterior = parseFloat(2349);
                break;
            case "EJECUCION POSTA DE SALUD TAYAGASHA":
                montoAnterior = parseFloat(2288);
                montoActual = parseFloat(228);
                break;
            case "SUPERVISION NOLBERTH":
                montoAnterior = parseFloat(2368);
                break;
            case "APYO AL AREA DE ESTRUCTURAS":
                montoAnterior = parseFloat(76);
                break;
            case "PROYECTO CLINICA PRIVADA ANGUEL REYES":
                montoAnterior = parseFloat(57);
                break;
            case "EJECUCION POSTA DE SALUD PAMPAMARCA":
                montoAnterior = parseFloat(410.75);
                montoActual = parseFloat(1718.35);
                break;
            case "PROYECTO OFICINA ADMINISTRATIVO  SEVEN":
                montoAnterior = parseFloat(365);
                break;
            //Hyperium

            case "Rizabal y Asociados":
                montoAnterior = parseFloat(2673);
                break;
            case "proyecto pavco":
                montoAnterior = parseFloat(361);
                break;
            case "GESPRO CAMPO":
                montoAnterior = parseFloat(195);
                break;
            case "Gespro":
                montoAnterior = parseFloat(4736);
                break;
            case "Dml arquitectos":
                montoAnterior = parseFloat(136);
                break;
            case "CONSTRUYE HCO":
                montoAnterior = parseFloat(76);
                break;
            case "Autocad y Matlab":
                montoAnterior = parseFloat(2080);
                break;
            case "Aceros y drywall Titan":
                montoAnterior = parseFloat(850);
                break;
            case "Construtienda":
                montoAnterior = parseFloat(1212);
                break;
            default:
                topografia = parseFloat(0);
                desagregado = parseFloat(0);
                montoActual = parseFloat(0);
                demolicion = parseFloat(0);
                costos_presupuesto = parseFloat(0);
                suelos = parseFloat(0);
                electricas = parseFloat(0);
                inicial_plaza = parseFloat(0);
                sanitarias = parseFloat(0);
                expedientes = parseFloat(0);
                break;
        }

        /**********************DATOS PRESUPUESTADOS DE PROYECTOS *******************************/
        // Preparar datos para gráfico de presupuesto
        let proyectoResultados = {};
        dataProyectos.forEach(result => {
            proyectoResultados[result.idProyecto] = {
                nombre: result.nombreProyecto,
                totalResultado: result.resultado,
                totalSueldos: 0,
                trabajadores: {}
            };
        });

        reportpresupuestos.forEach(record => {
            const { nombre_trab, diasAsignados, proyecto_asignadot, sueldo_Personal } = record;

            if (!proyectoResultados[proyecto_asignadot]) return;

            if (!proyectoResultados[proyecto_asignadot].trabajadores[nombre_trab]) {
                proyectoResultados[proyecto_asignadot].trabajadores[nombre_trab] = {
                    diasTrabajados: new Set(),
                    sueldoDiario: sueldo_Personal / 26
                };
            }

            // Ahora agregamos los días asignados en vez de la fecha
            proyectoResultados[proyecto_asignadot].trabajadores[nombre_trab].diasTrabajados.add(diasAsignados);
        });

        let seriesDataPresupuesto = [];
        for (const id in proyectoResultados) {
            let labels = [proyectoResultados[id].nombre];
            let totalSueldos = 0;
            let trabajadoresTexto = "";

            for (const trabajador in proyectoResultados[id].trabajadores) {
                const dias = proyectoResultados[id].trabajadores[trabajador].diasTrabajados.size;
                const sueldoTotal = proyectoResultados[id].trabajadores[trabajador].sueldoDiario * dias;
                totalSueldos += sueldoTotal;
                trabajadoresTexto += `${trabajador}: ${dias} días\n`;
            }

            seriesDataPresupuesto.push({
                values: [totalSueldos],
                backgroundColor: '#4AC3B9 #6DAACE',
                text: trabajadoresTexto
            });
        }
        //*********************CUADRADO DE COMPARACION DE DIAS PRESUPUESTADO CON DIAS EJECUTADOS**** */
        let comparacionDiariaResultados = {};

        // Inicializar comparacionDiariaResultados con los datos iniciales
        montoplazos.forEach(result => {
            comparacionDiariaResultados[result.id_proyecto] = {
                nombre: result.nombre_proyecto,
                plazoTotal: result.plazo_total_pro,
                montoDesignado: parseFloat(result.monto_designado),
                trabajadores: {},
                diasEjecutados: 0
            };
        });

        reportpresupuestos.forEach(record => {
            const { nombre_trab, diasAsignados, proyecto_asignadot } = record;

            if (!comparacionDiariaResultados[proyecto_asignadot]) return;

            if (!comparacionDiariaResultados[proyecto_asignadot].trabajadores[nombre_trab]) {
                comparacionDiariaResultados[proyecto_asignadot].trabajadores[nombre_trab] = {
                    diasTrabajados: new Set()
                };
            }

            // Ahora agregamos diasAsignados en lugar de fecha_subido_t
            comparacionDiariaResultados[proyecto_asignadot].trabajadores[nombre_trab].diasTrabajados.add(diasAsignados);
        });

        // Calcular los días ejecutados
        Object.keys(comparacionDiariaResultados).forEach(idProyecto => {
            const proyecto = comparacionDiariaResultados[idProyecto];
            let diasEjecutados = 0;

            Object.values(proyecto.trabajadores).forEach(trabajador => {
                diasEjecutados += trabajador.diasTrabajados.size;
            });

            proyecto.diasEjecutados = diasEjecutados;
        });

        // Preparar los datos para ZingChart
        let labelComparacionDiaria = [];
        let diasPresupuestadosComparacionDiaria = [];
        let diasEnEjecucionComparacionDiaria = [];

        Object.values(comparacionDiariaResultados).forEach(proyecto => {
            const nombreLimpio = limpiarNombreProyecto(proyecto.nombre);
            labelComparacionDiaria.push(nombreLimpio);
            diasPresupuestadosComparacionDiaria.push(proyecto.plazoTotal);
            diasEnEjecucionComparacionDiaria.push(proyecto.diasEjecutados);
        });

        // Sumar los días presupuestados
        let sumaDiasPresupuestados = diasPresupuestadosComparacionDiaria.reduce((acc, val) => acc + val, 0);
        //console.log(sumaDiasPresupuestados);

        /**********************GRAFICO SOBRE  RESULTADO***************************************** */
        let calculoAvanceResultados = {};

        // Inicializar calculoAvanceResultados con los datos iniciales
        montoplazos.forEach(result => {
            calculoAvanceResultados[result.id_proyecto] = {
                nombre: result.nombre_proyecto,
                plazoTotal: result.plazo_total_pro,
                montoDesignado: parseFloat(result.monto_designado),
                trabajadores: {},
                diasEjecutados: 0,
                porcentajeAvance: 0
            };
        });

        reportpresupuestos.forEach(record => {
            const { nombre_trab, diasAsignados, proyecto_asignadot } = record; // Cambié fecha_subido_t por diasAsignados

            if (!calculoAvanceResultados[proyecto_asignadot]) return;

            if (!calculoAvanceResultados[proyecto_asignadot].trabajadores[nombre_trab]) {
                calculoAvanceResultados[proyecto_asignadot].trabajadores[nombre_trab] = {
                    diasTrabajados: new Set()
                };
            }

            // Ahora agregamos diasAsignados en lugar de fecha_subido_t
            calculoAvanceResultados[proyecto_asignadot].trabajadores[nombre_trab].diasTrabajados.add(diasAsignados);
        });

        // Calcular los días ejecutados y el porcentaje de avance
        Object.keys(calculoAvanceResultados).forEach(idProyecto => {
            const proyecto = calculoAvanceResultados[idProyecto];
            let diasEjecutados = 0;

            Object.values(proyecto.trabajadores).forEach(trabajador => {
                diasEjecutados += trabajador.diasTrabajados.size;
            });

            proyecto.diasEjecutados = diasEjecutados;
            if (proyecto.plazoTotal > 0) {
                proyecto.porcentajeAvance = (diasEjecutados / proyecto.plazoTotal) * 100;
            }
        });

        // Agrupar los proyectos en uno solo para calcular el total de plazos y días ejecutados
        let totalPlazoCs = 0;
        let totalDiasEjecutados = 0;
        Object.values(calculoAvanceResultados).forEach(proyecto => {
            totalPlazoCs += proyecto.plazoTotal;
            totalDiasEjecutados += proyecto.diasEjecutados;
        });

        // Preparar los datos para el gráfico
        const diasTotales = totalPlazoCs;
        const porcentajeAvanceActual = [];
        const porcentajeAvanceEsperado = [];

        for (let dia = 0; dia <= diasTotales; dia++) {
            const avanceEsperado = (dia / diasTotales) * 100;
            const avanceActual = dia <= total_dias ? (dia / total_dias) * promedioPorcentaje : null;

            porcentajeAvanceEsperado.push(avanceEsperado);
            porcentajeAvanceActual.push(avanceActual);
        }
        //*********************DATOS GENERALES*********************************************** */
        let encargado = "";
        let nombreEmpresa = "";
        switch (id_empresa) {
            case '1':
                encargado = "-";
                nombreEmpresa = "RIZABAL & ASOCIADOS";
                break;
            case '2':
                encargado = "JOSE EDUARDO NIEVES CUADROS";
                nombreEmpresa = "CONSTRUYE HCO";
                break;
            case '3':
                encargado = "JOSE BENNYN CORTES AGUILAR";
                nombreEmpresa = "SEVEN HEART";
                break;
            case '4':
                encargado = "DORIS DEL PILAR MEZA LOPEZ";
                nombreEmpresa = "DML ARQUITECTURA";
                break;
            case '5':
                encargado = "EMERSON MESIAS ESPINOZA SALAZAR";
                nombreEmpresa = "HYPERIUMTECH";
                break;
            default:
                encargado = "Encargado no disponible"; // Set a default message
                nombreEmpresa = "Empresa no disponible";
                break;
        };
        //var nombre_proyecto = document.getElementById('nombre_proyecto').value;
        let bgColorMain = '#FFF';

        let aColors = [
            '#3CC1CF',
            '#FBAE44',
            '#485463',
            '#EF413C',
            '#999999',
            '#4C4C4C',
        ];

        // Obtiene la fecha actual
        const fechaActual = new Date();

        // Formateador de fecha en español
        const fechaFormatter = new Intl.DateTimeFormat('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        let presupuestototals = [];

        let g4 = {
            type: 'grid',
            backgroundColor: bgColorMain,
            height: '5%',
            width: '100%',
            x: '0%',
            y: '28.5%',
            title: {
                text: 'Gastos efectuados mediante requerimientos / Administracion',
                align: 'center',
                backgroundColor: '#485463',
                fontColor: '#3CC1CF',
                fontSize: '21px',
                fontWeight: 'bold',
                offsetY: '5px',
                padding: '8px',
                width: '100%',
            },
            options: {
                colLabels: ['#', 'Proyecto', 'Tipo', 'Total'], // Añadimos una columna "Tipo" para distinguir proceso y sustentado
                colWidths: ['5%', '45%', '25%', '25%'], // Ajustar los anchos de las columnas
                style: {
                    '.th': {
                        backgroundColor: '#fff',
                        borderRight: '0px solid #fff',
                        borderBottom: '1px solid #aaa',
                        color: '#464646',
                        fontSize: '10px',
                        fontWeight: 'normal',
                        textAlign: 'center'
                    },
                    '.td': {
                        backgroundColor: '#fff',
                        borderRight: '0px solid #fff',
                        borderBottom: '1px solid #aaa',
                        fontWeight: 'normal',
                        color: '#464646',
                        height: '30px',
                        textAlign: 'center'
                    },
                }
            },
            plotarea: {
                margin: '70px 50px 40px 40px'
            },
            series: [] // Inicia la serie vacía
        };

        reporterequerimientoProceso.forEach((item, index) => {
            // Convertir el valor de `totalmontoreque` a número y sumar a `montorequerimientoproceso`
            montorequerimientoproceso += parseFloat(item.totalmontoreque);

            g4.series.push({
                values: [
                    index + 1, // Índice de la fila
                    item.nombre_comun, // Columna Nombre Común
                    'En Proceso', // Columna Tipo
                    `S/: ${item.totalmontoreque}` // Columna Total Requerimientos
                ]
            });
        });

        // Llenar la tabla con los datos de `reporterequerimientosustentadp` en filas separadas
        reporterequerimientosustentadp.forEach((item, index) => {
            // Convertir el valor de `totalmontosustentado` a número y sumar a `montorequerimientosustentado`
            montorequerimientosustentado += parseFloat(item.totalmontosustentado);

            g4.series.push({
                values: [
                    reporterequerimientoProceso.length + index + 1, // Continuamos la numeración de las filas
                    item.nombre_comun, // Columna Nombre Común
                    'Sustentado', // Columna Tipo
                    `S/: ${item.totalmontosustentado}` // Columna Total Sustentado
                ]
            });
        });
        //===============================================================
        let resumenProyectosData = [];

        // Rellenar proyectoResultados a partir de resultados
        resultados.forEach(result => {
            proyectoResultados[result.idProyecto] = {
                nombre: result.nombreProyecto,
                totalResultado: result.resultado,
                totalSueldos: 0,
                trabajadores: {}
            };
        });

        reportpresupuestos.forEach(record => {
            // Extraer los datos necesarios
            const { nombre_trab, fecha, ids_proyectos, sueldo_Personal, diasAsignados } = record;

            // Convertir sueldo a número
            const sueldo = parseFloat(sueldo_Personal);
            if (isNaN(sueldo)) return; // Si sueldo no es válido, omitir registro

            // Validar que el proyecto existe
            if (!proyectoResultados[ids_proyectos]) return;
            const proyecto = proyectoResultados[ids_proyectos];

            // Asegurar que el objeto trabajadores existe
            if (!proyecto.trabajadores[nombre_trab]) {
                proyecto.trabajadores[nombre_trab] = {
                    diasTrabajados: new Set(),
                    sueldoDiario: sueldo / 26, // Asumiendo 26 días laborales al mes
                };
            }

            // Validar que diasAsignados es un número válido
            const diasAsignadosNum = parseInt(diasAsignados, 10);
            if (isNaN(diasAsignadosNum) || diasAsignadosNum < 1) return;

            // Agregar los días trabajados
            const fechaBase = new Date(fecha);
            for (let i = 0; i < diasAsignadosNum; i++) {
                const fechaTrabajo = new Date(fechaBase);
                fechaTrabajo.setUTCDate(fechaBase.getUTCDate() + i);
                const fechaString = fechaTrabajo.toISOString().split("T")[0]; // Formato YYYY-MM-DD
                proyecto.trabajadores[nombre_trab].diasTrabajados.add(fechaString);
            }
        });

        // Configuración de gráficos
        let graphHeight = 236;
        let graphGap = 10;

        for (const id in proyectoResultados) {
            if (!proyectoResultados[id].nombre) continue;
            let labels = [];
            let series = [];
            let trabajadoresInfo = [];
            let diasTotales = 0;

            let nombre = proyectoResultados[id].nombre;

            // Si el nombre excede 30 caracteres, dividirlo en líneas
            if (nombre.length > 30) {
                let palabras = nombre.split(' ');
                let nombreConSaltos = '';
                let lineaActual = '';

                palabras.forEach((palabra) => {
                    if ((lineaActual + palabra).length > 30) {
                        nombreConSaltos += lineaActual.trim() + '<br>';
                        lineaActual = '';
                    }
                    lineaActual += palabra + ' ';
                });

                nombreConSaltos += lineaActual.trim();
                nombre = nombreConSaltos;
            }

            labels.push(nombre);
            let totalSueldos = 0;
            let trabajadoresTexto = "";

            // Reiniciar días totales en cada iteración
            diasTotales = 0;

            // Calcular sueldos y días trabajados
            for (const trabajador in proyectoResultados[id].trabajadores) {
                const dias = proyectoResultados[id].trabajadores[trabajador].diasTrabajados.size;
                diasTotales += dias;
                const sueldoTotal = proyectoResultados[id].trabajadores[trabajador].sueldoDiario * dias;
                totalSueldos += sueldoTotal;
                trabajadoresTexto += `${trabajador}: ${dias} días\n`;
            }
            // Guardar datos en resumen
            resumenProyectosData.push({ nombre: nombre, total: totalSueldos });

            // Se debe pasar un número, no un string en `values`
            series.push({
                values: [totalSueldos.toFixed(2)], // NO usar `toFixed(2)`, debe ser un número
                backgroundColor: '#4AC3B9',
                text: trabajadoresTexto
            });

            trabajadoresInfo.push(`Total de días trabajados: ${diasTotales}`);

            // Validar `totalResultado`
            let totalResultado = parseFloat(proyectoResultados[id].totalResultado);
            if (isNaN(totalResultado) || totalResultado < totalSueldos) {
                totalResultado = totalSueldos + 1000; // Evita que el máximo sea menor al valor real
            }

            let presupuesto = {
                type: 'hbar',
                plot: {
                    tooltip: { text: '%v soles' },
                    animation: {
                        delay: 600,
                        effect: 'ANIMATION_FADE_IN',
                        sequence: 'ANIMATION_BY_NODE',
                        speed: 700,
                    },
                    valueBox: {
                        text: `%v soles\n${trabajadoresTexto}`,
                        fontSize: '12px',
                        fontColor: '#0000',
                        placement: 'top-out',
                        offsetX: 0,
                        offsetY: -10,
                    },
                    stacked: true,
                },
                plotarea: { margin: 'dynamic' },
                scaleX: { visible: true, labels: labels },
                scaleY: {
                    format: '%v soles',
                    label: { text: 'Presupuesto Total' },
                    maxValue: totalResultado, // Aseguramos que maxValue siempre sea mayor a totalSueldos
                    markers: [
                        {
                            type: 'line',
                            range: [totalResultado, totalResultado],
                            lineColor: '#FF0000',
                            lineWidth: 2,
                            alpha: 1,
                            lineStyle: 'solid',
                        }
                    ]
                },
                labels: trabajadoresInfo,
                series: series,
            };

            presupuestototals.push(presupuesto);
        }
        ////////////////==========================================
        let g5 = {
            type: 'grid',
            backgroundColor: bgColorMain,
            height: '5%',
            width: '100%',
            x: '0%',
            y: '33%',
            title: {
                text: 'Resumen de Proyectos y Gastos',
                align: 'center',
                backgroundColor: '#485463',
                fontColor: '#3CC1CF',
                fontSize: '21px',
                fontWeight: 'bold',
                offsetY: '5px',
                padding: '8px',
                width: '100%',
            },
            options: {
                colLabels: ['#', 'Proyecto', 'Total'], // Solo se muestran los nombres de proyectos y sus montos
                colWidths: ['5%', '65%', '30%'], // Ajustar los anchos de las columnas
                fontSize: '21px',
                style: {
                    '.th': {
                        backgroundColor: '#fff',
                        borderRight: '0px solid #fff',
                        borderBottom: '1px solid #aaa',
                        color: '#464646',
                        fontSize: '10px',
                        fontWeight: 'normal',
                        textAlign: 'center'
                    },
                    '.td': {
                        backgroundColor: '#fff',
                        borderRight: '0px solid #fff',
                        borderBottom: '1px solid #aaa',
                        fontWeight: 'normal',
                        color: '#464646',
                        height: '30px',
                        textAlign: 'center'
                    },
                }
            },
            plotarea: {
                margin: '50px 50px 40px 40px'
            },
            series: [] // Inicia la serie vacía
        };

        // Rellenar la serie con los datos de los proyectos
        let totalGeneral = 0; // Variable para acumular el total
        // Crear un array para almacenar los proyectos con sus totales
        let proyectosOrdenados = resumenProyectosData.map(proyecto => {
            let totalProyecto = proyecto.total;

            // Verifica si el proyecto es "ADMINISTRATIVO"
            if (proyecto.nombre === "ADMINISTRATIVO") {
                totalProyecto += parseFloat(montoTareas); // Sumar montoTareas al total
            }

            return {
                nombre: proyecto.nombre,
                total: totalProyecto
            };
        });

        // Ordenar los proyectos por el monto total de mayor a menor
        proyectosOrdenados.sort((a, b) => b.total - a.total);

        // Inicializar la serie
        g5.series = [];

        // Agregar los proyectos ordenados a la serie
        proyectosOrdenados.forEach((proyecto, index) => {
            g5.series.push({
                values: [
                    index + 1, // Índice de la fila
                    proyecto.nombre, // Nombre del Proyecto
                    `S/: ${proyecto.total.toFixed(2)}` // Total redondeado a 2 decimales
                ]
            });

            totalGeneral += proyecto.total; // Acumular el total
        });
        // Aquí es donde se agregan las filas solo si el proyecto es reconocido
        const projectValues = [
            { name: 'Topografía', value: topografia },
            { name: 'Desagregado', value: desagregado },
            { name: 'Demolición', value: demolicion },
            { name: 'Costos y Presupuesto', value: costos_presupuesto },
            { name: 'Suelos', value: suelos },
            { name: 'Eléctricas', value: electricas },
            { name: 'Inicial/Plaza', value: inicial_plaza },
            { name: 'Sanitarias', value: sanitarias },
            { name: 'Expedientes', value: expedientes },
            { name: 'Monto Anterior', value: montoAnterior },
            { name: 'Monto Anterior 2024', value: montoActual },
        ];

        if (nombre_proyecto.trim() !== "PROYECTO 358") { // Solo si no es un proyecto no reconocido o el específico
            projectValues.forEach((item, index) => {
                if (item.value > 0) {
                    g5.series.push({
                        values: [
                            resumenProyectosData.length + index + 1,
                            `${item.name} excel`,
                            `S/: ${item.value}`
                        ]
                    });
                }
            });
        }

        // Sumar total adicional, que será 0 si es un proyecto no reconocido
        //const totalAdicional = montoAnterior + topografia + desagregado + demolicion + costos_presupuesto + suelos + electricas + inicial_plaza + sanitarias + expedientes;
        const validarValor = (valor) => {
            return (valor !== undefined && valor !== null && !isNaN(valor)) ? valor : 0;
        };

        const totalAdicional =
            validarValor(montoAnterior) +
            validarValor(topografia) +
            validarValor(desagregado) +
            validarValor(demolicion) +
            validarValor(costos_presupuesto) +
            validarValor(suelos) +
            validarValor(electricas) +
            validarValor(inicial_plaza) +
            validarValor(sanitarias) +
            validarValor(expedientes);
        //const montogeneralprore = parseFloat(totalGeneral) + parseFloat(totalAdicional); // montoAnterior
        const montogeneralprore = parseFloat(sumaTotalGasto) + parseFloat(totalAdicional); // montoAnterior
        // Agregar fila de total general al final
        g5.series.push({
            values: [
                g5.series.length + 2, // Índice para la fila total
                'Total General', // Nombre de la fila total
                `S/: ${montogeneralprore.toFixed(2)}` // Total general
            ]
        });

        // Si es un proyecto no reconocido, se coloca 0 en el total general
        if (totalAdicional === 0) {
            g5.series.push({
                values: [
                    g5.series.length + 1, // Índice para la fila total de 0
                    '', // Nombre de la fila
                    `` // Total general
                ]
            });
        }

        // Actualizar los valores de gastos y nombres de proyectos
        let valoresGastos = resumenProyectosData.map(proyecto => proyecto.total || 0);
        let nombresProyectos = resumenProyectosData.map(proyecto => proyecto.nombre || 'Sin nombre');

        // Sumar ambos montos y almacenarlo en `sumaTotalGasto`
        //sumaTotalGastototal = (parseFloat(montoAnterior) + parseFloat(montorequerimientoproceso) + parseFloat(montorequerimientosustentado) + parseFloat(sumaTotalGasto) + parseFloat(montoTareas)).toFixed(2);
        sumaTotalGastototal = (parseFloat(montogeneralprore) + parseFloat(totalmontoInverAnterior) + parseFloat(montorequerimientoproceso) + parseFloat(montorequerimientosustentado)).toFixed(2);
        const totalsumaRequerimient = (parseFloat(montorequerimientoproceso) + parseFloat(montorequerimientosustentado)).toFixed(2);

        // Calcular el monto final
        const ganpro = parseFloat(totalmonto) - parseFloat(sumaTotalGastototal);
        //console.log(`Monto total: ${sumaTotalGastototal}`);
        const cantidadProyectos = dataProyectos.length;
        //console.log(`cantidad  por proyecto: ${cantidadProyectos}`);
        const montoPorProyecto = parseFloat(sumaTotalGastototal) / cantidadProyectos;
        //console.log(`Monto por proyecto: ${montoPorProyecto}`);

        // Actualizar proyectos automáticamente
        function actualizarProyectosGastos() {
            const proyectos = dataProyectos.map(dataProyecto => ({
                id_proyecto: dataProyecto.id_proyectos,
                monto_actualizado: parseFloat(montoPorProyecto).toFixed(2) // Asegúrate de que sea un número
            }));
            $.ajaxSetup({
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') // Agregamos el token CSRF al encabezado
                }
            });

            $.ajax({
                url: '/actualizarinversion', // Ruta definida en Laravel
                type: 'PUT', // Usamos PUT para la actualización
                contentType: 'application/json',
                data: JSON.stringify({ proyectos }), // Enviamos los datos en formato JSON
                success: (response) => {
                    //console.log(response.message);
                    Swal.fire({
                        title: '¡Éxito!',
                        text: response.message, // Aquí utilizamos la respuesta del servidor
                        icon: 'success',
                        confirmButtonText: 'Aceptar'
                    });
                },
                error: (xhr, status, error) => {
                    //console.error("Error en la solicitud:", xhr.responseText);
                    Swal.fire({
                        title: 'Error',
                        text: "Hubo un problema al actualizar los datos: " + xhr.responseText,
                        icon: 'error',
                        confirmButtonText: 'Cerrar'
                    });
                }
            });
        }

        const porcentaje_utilidad = parseFloat((parseFloat(sumaTotalGastototal) / parseFloat(totalmonto)) * 100).toFixed(2);
        //console.log(porcentaje_utilidad);

        // Determinar el color según el porcentaje
        let color;
        if (porcentaje_utilidad >= 0 && porcentaje_utilidad < 30) {
            color = 'green'; // Menor a 30%
        } else if (porcentaje_utilidad >= 30 && porcentaje_utilidad < 49) {
            color = 'yellow'; // Menor a 49%
        } else if (porcentaje_utilidad >= 50 && porcentaje_utilidad < 80) {
            color = 'red'; // Menor a 80%
        } else {
            color = 'black'; // Mayor o igual a 80%
        }

        function agregarSaltoDeLineNameProyecto(nombre_proyecto) {
            // Verifica si el texto supera los 20 caracteres
            if (nombre_proyecto.length > 15) {
                // Inserta un salto de línea en la posición 20
                nombre_proyecto = nombre_proyecto.slice(0, 15) + '\n' + nombre_proyecto.slice(15);
            }
            return nombre_proyecto;
        }

        const nombre_proyectoSl = agregarSaltoDeLineNameProyecto(nombre_proyecto);

        // Formatea la fecha actual
        //const porcentajeTotal = Math.round(parseInt(totalPorcentaje) / parseInt(total_dias));
        const porcentajeTotal = Math.round(parseInt(totalPorcentaje));
        //const porcentajeTotal = Math.round(parseInt(totalPorcentaje));
        const porcentajeResto = 100 - porcentajeTotal; // Porcentaje restante para completar 100

        const gastoPresupuesto = (porcentajeResto * sumaTotalGastototal) / porcentajeTotal;
        let fechaFormateada = fechaFormatter.format(fechaActual); total_dias;

        const montoInvertidoporc = ((sumaTotalGastototal * 100) / totalmonto)/total_dias;//sumaTotalGastototal
        const montoTotalProyectoporc = 100 - montoInvertidoporc; //totalmonto
        const verificacion = totalmonto - sumaTotalGastototal;
        let colorGasto;

        if (verificacion < -11) {
            colorGasto = 'red'; // El monto no excede y es negativo
        } else if (verificacion >= -10 && verificacion <= 10) {
            colorGasto = 'yellow'; // En el rango de 90 a 110
        } else if (verificacion > 11) {
            colorGasto = 'green'; // Mayor a 10
        } else {
            colorGasto = 'black'; // Si no entra en ninguna de las condiciones anteriores
        }

        let g1 = {
            type: 'ring',
            backgroundColor: bgColorMain,
            borderBottom: '1px solid #EDEDED',
            height: '6%',
            width: '100%',
            y: '0%',
            x: '0%',
            title: {
                text: 'RESUMEN DEL  ' + nombre_proyecto,
                align: 'center',
                fontFamily: 'Arial',
                backgroundColor: '#485463',
                fontColor: '#3CC1CF',
                fontSize: '25px',
                fontWeight: 'bold',
                padding: '8px',
            },
            plot: {
                tooltip: {
                    align: 'center',
                    alpha: 0.75,
                    backgroundColor: '#000',
                    borderRadius: '4px',
                    borderWidth: '0px',
                    callout: true,
                    fontColor: '#fff',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    padding: '5 10 10 5',
                },
                valueBox: {
                    decimals: 0,
                    fontColor: '#D83B01',
                    fontSize: '11px',
                    fontWeight: 'normal',
                    placement: 'out',
                },
                animation: {
                    effect: 3,
                    method: 0,
                    speed: 300,
                    sequence: 1,
                },
                borderWidth: 1,
                detach: false,
                slice: '60%',
            },
            plotarea: {
                margin: '60 0 0 0',
            },
            scale: {
                x: '8%',
                y: '20%',
                offsetX: '15%',
                offsetY: '20%',
                sizeFactor: 1.2,
            },
            scaleR: {
                aperture: 180,
                refAngle: 180,
            },
            labels: [{
                borderBottom: '1px solid #EDEDED',
                width: '100%',
                x: '5px',
                y: '38px',
            },
            {
                text: 'JEFE ENCARGADO: ',
                align: 'left',
                fontFamily: 'Arial',
                fontColor: '#485463',
                fontSize: '20px',
                fontWeight: 'normal',
                padding: '0px',
                x: '2%',
                y: '30%',
            },
            {
                text: encargado,
                align: 'left',
                fontFamily: 'Arial',
                fontColor: '#485463',
                fontSize: '20px',
                fontWeight: 'bold',
                padding: '0px',
                x: '5%',
                y: '38%',
            },
            {
                text: 'EMPRESA:',
                fontFamily: 'Arial',
                align: 'left',
                fontColor: '#485463',
                fontSize: '20px',
                fontWeight: 'normal',
                padding: '0px',
                x: '2%',
                y: '50%',
            },
            {
                text: nombreEmpresa,
                align: 'left',
                fontColor: '#485463',
                fontFamily: 'Arial',
                fontSize: '20px',
                fontWeight: 'bold',
                padding: '0px',
                x: '5%',
                y: '58%',
            },
            {
                text: 'FECHA: ',
                align: 'left',
                fontFamily: 'Arial',
                fontColor: '#485463',
                fontSize: '20px',
                fontWeight: 'normal',
                padding: '0px',
                x: '2%',
                y: '70%',
            },
            {
                text: fechaFormateada,
                align: 'left',
                fontFamily: 'Arial',
                fontColor: '#485463',
                fontSize: '20px',
                fontWeight: 'bold',
                padding: '0px',
                x: '5%',
                y: '78%',
            },
            {
                text: 'PORCENTAJE TOTAL <br> DEL PROYECTO ' + nombre_proyectoSl,
                align: 'center',
                fontFamily: 'Arial',
                fontColor: '#646E7A',
                fontSize: '12px',
                fontWeight: 'bold',
                x: '50%',
                y: '80%',
            },
            //Presupuestado
            {
                text: "S/:" + (totalmonto.toFixed(2)),
                // text: 'S/: ',
                align: 'center',
                fontColor: '#3cc1cf',
                fontSize: '30px',
                fontWeight: 'bold',
                x: '80%',
                y: '25%',
            },
            {
                text: 'Monto Presupuestado (S/:)',
                align: 'center',
                fontColor: '#646E7A',
                fontSize: '12px',
                fontWeight: 'bold',
                x: '83%',
                y: '35%',
            },
            //Invetido
            {
                text: "S/:" + (sumaTotalGastototal),
                // text: 'S/: ',
                align: 'center',
                fontColor: '#3cc1cf',
                fontSize: '30px',
                fontWeight: 'bold',
                x: '80%',
                y: '40%',
            },
            {
                text: 'Monto Invertido (S/:)',
                align: 'center',
                fontColor: '#646E7A',
                fontSize: '12px',
                fontWeight: 'bold',
                x: '83%',
                y: '50%',
            },
            //Gasto presupuestos
            {
                text: "S/." + gastoPresupuesto.toFixed(2),
                align: 'center',
                fontColor: colorGasto,
                fontSize: '30px',
                fontWeight: 'bold',
                x: '80%',
                y: '56%',
            },
            {
                text: 'Gasto Presupuestado (S/:)',
                align: 'center',
                fontColor: '#646E7A',
                fontSize: '12px',
                fontWeight: 'bold',
                x: '83%',
                y: '67%',
            },
            //Dias presupuestado
            {
                text: total_dias + " Dias",
                align: 'center',
                fontColor: '#3cc1cf',
                fontSize: '36px',
                fontWeight: 'bold',
                x: '83%',
                y: '72%',
            },
            {
                text: 'Total de dias ejecutado',
                align: 'center',
                fontColor: '#646E7A',
                fontSize: '12px',
                fontWeight: 'bold',
                x: '83%',
                y: '85%',
            },
            ],
            series: [
                // Serie de avance del proyecto
                {
                    values: [porcentajeTotal],
                    tooltip: {
                        text: '<span style="font-size:16px;color:#3CC1CF;">\u25CF</span> AVANCE %node-value%',
                    },
                    valueBox: {
                        text: 'AVANCE %node-value%',
                        fontColor: '#3CC1CF',
                        fontWeight: 'bold',
                    },
                    backgroundColor: '#3CC1CF',
                },
                // Serie de restante
                {
                    values: [porcentajeResto],
                    tooltip: {
                        text: '<span style="font-size:16px;color:#999999;">\u25CF</span> RESTANTE %node-value%',
                    },
                    valueBox: {
                        text: 'RESTANTE %node-value%',
                        fontColor: '#999999',
                        fontWeight: 'bold',
                    },
                    backgroundColor: '#999999',
                },
                // Nueva serie de montos (puede usarse un color diferente)
                {
                    values: [montoTotalProyectoporc],
                    tooltip: {
                        text: '<span style="font-size:16px;color:#FFA500;">\u25CF</span> TOTAL PROYECTO S/:%node-value%',
                    },
                    valueBox: {
                        text: 'TOTAL S/: %node-value%',
                        fontColor: '#FFA500',
                        fontWeight: 'bold',
                    },
                    backgroundColor: '#FFA500',
                },
                // Nueva serie para el monto invertido
                {
                    values: [montoInvertidoporc],
                    tooltip: {
                        text: '<span style="font-size:16px;color:#00BFFF;">\u25CF</span> INVERTIDO S/:%node-value%',
                    },
                    valueBox: {
                        text: 'INVERTIDO S/: %node-value%',
                        fontColor: '#00BFFF',
                        fontWeight: 'bold',
                    },
                    backgroundColor: '#00BFFF',
                }
            ],
        };

        let gresumenpro = {
            type: 'null',
            backgroundColor: '#fbfcf7',
            borderColor: '#384653',
            borderRadius: '4px',
            borderWidth: '1px',
            height: '3%',
            //width: '30%',
            width: '45%',
            x: '2%',
            y: '6%',
            title: {
                text: 'PROYECTOS ',
                backgroundColor: 'none',
                fontColor: '#384653',
                fontSize: '20px',
                height: '70px',
                textAlign: 'center',
            },
            subtitle: {
                text: 'MONTO INVERTIDO \\nS/:' + montogeneralprore.toFixed(2),
                bold: true,
                fontColor: '#3CC1CF',
                fontSize: '18px',
                height: '40px',
                paddingTop: '90%',
                textAlign: 'center',
            },
        };

        let gresumenreq = {
            type: 'null',
            backgroundColor: '#fbfcf7',
            borderColor: '#384653',
            borderRadius: '4px',
            borderWidth: '1px',
            height: '3%',
            //width: '30%',
            width: '45%',
            //x: '68%',
            x: '53%',
            y: '6%',
            title: {
                text: 'REQUERIMIENTOS',
                backgroundColor: 'none',
                fontColor: '#384653',
                fontSize: '20',
                height: '70px',
                textAlign: 'center',
            },
            subtitle: {
                text: 'MONTO EMITIDO EN REQUERIMIENTOS \\nS/:' + totalsumaRequerimient,
                bold: true,
                fontColor: '#3CC1CF',
                fontSize: '18',
                height: '40px',
                paddingTop: '100%',
                textAlign: 'center',
            },
        };

        let gfinal = {
            type: 'null',
            backgroundColor: '#fbfcf7',
            borderColor: '#384653',
            borderRadius: '4px',
            borderWidth: '1px',
            height: '3%',
            width: '96%',
            x: '2%',
            y: '9.2%',
            title: {
                text: 'RESULTADO / PROYECTO',
                backgroundColor: 'none',
                fontColor: '#384653',
                fontSize: '20px',
                height: '70px',
                textAlign: 'center',
            },
            subtitle: {
                text: `Presupuestos S/: ${totalmonto} - Gastos Generales S/: ${sumaTotalGastototal} = Utilidad S/: ${ganpro.toFixed(2)}
                    (Gastos S/: ${sumaTotalGastototal} / Presupuestos S/: ${totalmonto}) x 100 = ${porcentaje_utilidad}%`,
                bold: true,
                fontColor: '#3CC1CF',
                fontSize: '18px',
                height: '40px',
                paddingTop: '90%',
                textAlign: 'center',
            },
            labels: [{
                text: '',
                backgroundColor: color,
                borderColor: '#000',
                borderWidth: 1,
                height: 40,
                width: 40,
                x: '65%', // Ajusta esta posición según sea necesario
                y: '10%', // Ajusta esta posición según sea necesario
                padding: 0,
            }],
        };

        let g2 = {
            type: 'bar',
            backgroundColor: bgColorMain,
            height: '6%',
            width: '100%',
            x: '0%',
            y: '13%',
            plotarea: {
                margin: '80 50 0 40',
            },
            title: {
                text: 'El siguiente grafico representa el avance porcentual de los sub-proyectos',
                align: 'left',
                fontColor: '#464646',
                fontSize: '13px',
                fontStyle: 'italic',
                fontWeight: 'normal',
                padding: '10 10 10 20',
            },
            legend: {
                backgroundColor: 'none',
                borderWidth: '0px',
                item: {
                    color: '#464646',
                    fontSize: '10px',
                    fontWeight: 'normal',
                },
                layout: '1x',
                margin: '330 auto auto auto',
                marker: {
                    type: 'circle',
                    borderWidth: '0px',
                    size: 8,
                },
            },
            plot: {
                tooltip: {
                    align: 'center',
                    alpha: 0.75,
                    backgroundColor: '#000',
                    borderRadius: '4px',
                    borderWidth: '0px',
                    callout: true,
                    fontColor: '#fff',
                    fontSize: '11px',
                    fontWeight: 'normal',
                    padding: '5 10 10 5',
                },
                animation: {
                    effect: 1,
                    sequence: 2,
                    speed: 100,
                },
                aspect: 'spline',
                hoverMarker: {
                    type: 'circle',
                    size: 5,
                    backgroundColor: '#FFF',
                    borderWidth: '1px',
                    borderColor: '#3CC1CF',
                },
                marker: {
                    type: 'circle',
                    borderWidth: '1px',
                    borderColor: '#3CC1CF',
                    size: 3,
                    backgroundColor: '#3CC1CF',
                },
                valueBox: {
                    text: '%node-value' + '%',
                    fontColor: '#464646',
                    fontWeight: 'normal',
                    fontSize: '10px',
                },
            },
            labels: [{
                text: 'Porcentaje por proyecto',
                align: 'center',
                borderLeft: '2px solid #E5E5E5',
                borderRight: '2px solid #E5E5E5',
                borderTop: '2px solid #E5E5E5',
                fontColor: '#464646',
                fontSize: '12px',
                fontWeight: 'normal',
                id: 'lb2a',
                padding: '6px',
                width: '370px',
                x: '20px',
                y: '35px',
            },
            ],
            scaleX: {
                labels: labels,
                label: {
                    fontColor: '#FFF',
                    "backgroundColor": "#2b5f92",
                    "font-size": "16px",
                    "alpha": 1,
                    "adjust-layout": true,

                },
                item: {
                    angle: 0, // Ángulo en grados
                    fontSize: 14,
                    wrapText: true,
                }
            },
            scaleY: {
                values: '0:100:10',
                label: {
                    text: 'Porcentaje de Avance',
                    fontColor: '#fff',
                },
            },
            series: [{
                text: 'Proyectos',
                tooltip: {
                    text: `<span style="font-size:16px;color:#3CC1CF;">\u25CF</span><b>${labels}</b><br> %scale-key-value: $%node-valuev`,
                },
                values: seriesDatapro,
                lineColor: '#3CC1CF',
                lineWidth: '2px',
            },],
        };

        let g3 = {
            type: 'grid',
            backgroundColor: bgColorMain,
            height: '10%',
            width: '100%',
            x: '0%',
            y: '20%',
            title: {
                text: 'Listado de trabajadores y gastos efectuados por dias laburados',
                align: 'center',
                backgroundColor: '#485463',
                fontColor: '#3CC1CF',
                fontSize: '21px',
                fontWeight: 'bold',
                offsetY: '5px',
                padding: '8px',
                width: '100%',
            },
            subtitle: {
                text: `La tabla representa los personales cuyo datos son sobre la cantidad de dias trabajados (${total_dias} Dias) y la cantidad de dinero (${sumaTotalGasto} Soles) invertido en cada personal <br>para la ejecucion del proyecto.`,
                align: 'left',
                flat: true,
                fontColor: '#464646',
                fontSize: '13px',
                fontStyle: 'italic',
                fontWeight: 'normal',
                offsetY: '-40px',
                padding: '70 10 10 20',
            },
            options: {
                colLabels: ['#', 'Personal', 'Tareas <br> Acumulados', 'Dias Trabajados <br>(Mes)', 'Gasto del<br> personal'],
                colWidths: ['5%', '30%', '10%', '15%', '20%'],
                style: {
                    '.th': {
                        backgroundColor: '#fff',
                        borderRight: '0px solid #fff',
                        borderBottom: '1px solid #aaa',
                        color: '#464646',
                        fontSize: '10px',
                        fontWeight: 'normal',
                        textAlign: 'center'
                    },
                    '.td': {
                        backgroundColor: '#fff',
                        borderRight: '0px solid #fff',
                        borderBottom: '1px solid #aaa',
                        fontWeight: 'normal',
                        color: '#464646',
                        height: '30px',
                        textAlign: 'center'
                    },
                    '.td_1': {
                        paddingLeft: '38px',
                        offsetX: '-30px',
                        textAlign: 'center'
                    },
                    '.td_2': {
                        paddingLeft: '38px',
                        offsetX: '-30px',
                        textAlign: 'center'
                    },
                    '.td_3': {
                        paddingLeft: '38px',
                        offsetX: '-30px',
                        textAlign: 'center'
                    },
                    '.td_4': {
                        paddingLeft: '38px',
                        offsetX: '-30px',
                        textAlign: 'center'
                    },
                    '.td_5': {
                        paddingLeft: '38px',
                        offsetX: '-30px',
                        textAlign: 'center'
                    },
                    '.td_6': {
                        paddingLeft: '38px',
                        offsetX: '-10px',
                        textAlign: 'center'
                    },
                    '.td_0_0': {
                        backgroundColor: '#FF9900',
                        borderColor: 'none',
                        borderRadius: '21px',
                        borderTop: null,
                        borderRight: null,
                        borderBottom: null,
                        borderLeft: null,
                        borderWidth: '8px',
                        color: '#000',
                        textAlign: 'center'
                    },
                    '.td_1_0': {
                        backgroundColor: '#9DCC09',
                        borderColor: 'none',
                        borderRadius: '21px',
                        borderTop: null,
                        borderRight: null,
                        borderBottom: null,
                        borderLeft: null,
                        borderWidth: '8px',
                        color: '#000',
                        textAlign: 'center'
                    },
                    '.td_2_0': {
                        backgroundColor: '#71BDE9',
                        borderColor: 'none',
                        borderRadius: '21px',
                        borderTop: null,
                        borderRight: null,
                        borderBottom: null,
                        borderLeft: null,
                        borderWidth: '8px',
                        color: '#000',
                        textAlign: 'center'
                    },
                    '.td_3_0': {
                        backgroundColor: '#DE6829',
                        borderColor: 'none',
                        borderRadius: '21px',
                        borderTop: null,
                        borderRight: null,
                        borderBottom: null,
                        borderLeft: null,
                        borderWidth: '8px',
                        color: '#000',
                        textAlign: 'center'
                    },
                    '.td_4_0': {
                        backgroundColor: '#EDCE00',
                        borderRadius: '21px',
                        borderColor: 'none',
                        borderTop: null,
                        borderRight: null,
                        borderBottom: null,
                        borderLeft: null,
                        borderWidth: '8px',
                        color: '#000',
                        textAlign: 'center'
                    },
                    '.td_5_0': {
                        backgroundColor: '#B000ED',
                        borderRadius: '21px',
                        borderColor: 'none',
                        borderTop: null,
                        borderRight: null,
                        borderBottom: null,
                        borderLeft: null,
                        borderWidth: '8px',
                        color: '#000',
                        textAlign: 'center'
                    }
                }
            },
            plotarea: {
                margin: '100px 50px 40px 150px'
            },
            series: seriesData.map(row => ({
                values: row
            })),
        };

        let g6 = {
            type: 'hbar',
            backgroundColor: bgColorMain,
            height: '5%',
            width: '100%',
            x: '0%',
            y: '45%',
            title: {
                text: `Presupuestos S/:${totalmonto} - Gastos Generales S/:${sumaTotalGastototal} = Utilidad S/:${ganpro.toFixed(2)}`,
                align: 'center',
                backgroundColor: '#485463',
                fontColor: '#3CC1CF',
                fontSize: '21px',
                fontWeight: 'bold',
                offsetY: '5px',
                padding: '8px',
                width: '100%',
            },
            subtitle: {
                text: `(Gastos S/:${sumaTotalGastototal} / Presupuestos S/:${totalmonto}) x 100 = ${porcentaje_utilidad}%`,
                align: 'left',
                flat: true,
                fontColor: '#464646',
                fontSize: '16px',
                fontStyle: 'italic',
                fontWeight: 'bold',
                offsetY: '-50px',
                offsetX: '400px',
                padding: '70 10 10 20',
            },
            labels: [{
                text: '',
                backgroundColor: color,
                borderColor: '#000',
                borderWidth: 1,
                height: 20,
                width: 20,
                x: '85%', // Ajusta esta posición según sea necesario
                y: '20%', // Ajusta esta posición según sea necesario
                padding: 0,
            }],
            plot: {
                tooltip: {
                    borderRadius: '2px',
                    borderWidth: '0px',
                    visible: false,
                },
                valueBox: {
                    text: '%v',
                    fontColor: '#2A2B3A',
                    fontSize: '14px',
                    visible: true,
                },
                animation: {
                    delay: 200,
                    effect: 'ANIMATION_EXPAND_TOP',
                    method: 'ANIMATION_BOUNCE_EASE_OUT',
                    sequence: 'ANIMATION_BY_PLOT_AND_NODE',
                },
                barsSpaceRight: '20px',
                barsSpaceLeft: '20px',
                stacked: true,
            },
            plotarea: {
                marginBottom: '30px',
                marginLeft: '100px',
                marginTop: '70px',
            },
            scaleX: {
                item: {
                    fontColor: '#2A2B3A',
                    fontSize: '14px',
                },
                labels: ['Monto Total'], // Etiqueta general
                lineColor: '#E71D36',
                tick: {
                    visible: false,
                },
            },
            scaleY: {
                guide: {
                    visible: false,
                },
                lineColor: '#2A2B3A',
                tick: {
                    visible: true,
                },
                visible: true, // Habilitar el eje Y
                maxValue: parseFloat(totalmonto) * 1.1, // Añadir un margen superior
            },
            series: [
                {
                    values: [parseFloat(totalmonto) - parseFloat(sumaTotalGastototal)], // Presupuesto restante
                    backgroundColor: '#2EC4B6', // Color verde
                    borderRadius: '50px 0px 0px 50px',
                    label: {
                        text: 'Restante',
                        fontColor: '#FFFFFF',
                        offsetY: -10,
                    },
                },
                {
                    values: [parseFloat(sumaTotalGastototal)], // Gastos
                    backgroundColor: '#E71D36', // Color rojo
                    borderRadius: '0px 50px 50px 0px',
                    label: {
                        text: 'Gasto Total',
                        fontColor: '#FFFFFF',
                        offsetY: -10,
                    },
                },
            ],
        };

        let g7 = {
            type: 'bar',
            backgroundColor: bgColorMain,
            height: '10%',
            width: '100%',
            x: '0%',
            y: '50%',
            title: {
                text: 'Evaluación del progreso del proyecto en términos de días planificados versus días ejecutados',
                align: 'center',
                backgroundColor: '#485463',
                fontColor: '#3CC1CF',
                fontSize: '21px',
                fontWeight: 'bold',
                offsetY: '5px',
                padding: '8px',
                width: '100%',
            },
            plot: {
                animation: {
                    effect: 'ANIMATION_SLIDE_LEFT',
                    sequence: 0,
                    speed: 800
                }
            },
            plotarea: {
                x: '10%',
                margin: '100 100 80 40'
            },
            scaleX: {
                labels: labelComparacionDiaria,
                item: {
                    fontColor: '#333333',
                    fontSize: 14
                }
            },
            scaleY: {
                format: '%v dias',
                label: {
                    text: `Días (Suma total: ${sumaDiasPresupuestados})`,
                    fontColor: '#333333',
                    fontSize: 14
                },
                item: {
                    fontColor: '#333333',
                    fontSize: 14
                },
                maxValue: sumaDiasPresupuestados,
            },
            series: [
                {
                    values: diasPresupuestadosComparacionDiaria,
                    text: 'Días Presupuestados',
                    backgroundColor: '#3CB371'
                },
                {
                    values: diasEnEjecucionComparacionDiaria,
                    text: 'Días en Ejecución',
                    backgroundColor: '#1E90FF'
                }
            ]
        };

        let g8 = {
            type: 'line',
            backgroundColor: bgColorMain,
            height: '7%',
            width: '100%',
            x: '0%',
            y: '59%',
            title: {
                text: 'Porcentaje de Avance de Proyectos en Términos de Días Presupuestados vs Días Ejecutados',
                align: 'center',
                backgroundColor: '#485463',
                fontColor: '#3CC1CF',
                fontSize: '21px',
                fontWeight: 'bold',
                offsetY: '5px',
                padding: '8px',
                width: '100%',
            },
            plot: {
                animation: {
                    effect: 'ANIMATION_SLIDE_LEFT',
                    sequence: 0,
                    speed: 800
                }
            },
            plotarea: {
                x: '10%',
                margin: '100 100 80 40'
            },
            scaleX: {
                title: {
                    text: 'Días'
                }
            },
            scaleY: {
                label: 'porcentaje',
                title: {
                    text: 'Porcentaje (%)'
                }
            },
            series: [
                {
                    values: porcentajeAvanceEsperado,
                    text: 'Avance Esperado'
                },
                {
                    values: porcentajeAvanceActual,
                    text: 'Avance Actual'
                }
            ]
        };

        //grafico de presupuestos
        let g9 = {
            type: 'bar',
            backgroundColor: bgColorMain,
            height: '50%',
            width: '100%',
            x: '0%',
            y: '65%',
            title: {
                text: 'Presupuestos por Sub-Proyectos',
                align: 'center',
                backgroundColor: '#485463',
                fontColor: '#3CC1CF',
                fontSize: '21px',
                fontWeight: 'bold',
                offsetY: '5px',
                padding: '8px',
                width: '100%',
            },
            subtitle: {
                text: 'El presente grafico muestra el presupuesto desigando y el personal con los dias dedicados por sub - proyectos.',
                align: 'left',
                flat: true,
                fontColor: '#464646',
                fontSize: '13px',
                fontStyle: 'italic',
                fontWeight: 'normal',
                padding: '30 10 10 20',
            },
            plot: {
                tooltip: {
                    align: 'center',
                    alpha: 0.75,
                    backgroundColor: '#000',
                    borderRadius: '4px',
                    borderWidth: '0px',
                    callout: true,
                    fontColor: '#fff',
                    fontSize: '11px',
                    fontWeight: 'normal',
                    padding: '5 10 10 5',
                },
                valueBox: {
                    text: '%node-value%',
                    angle: 270,
                    fontColor: '#464646',
                    fontSize: '9px',
                    fontWeight: 'normal',
                    placement: 'top-out',
                },
                animation: {
                    effect: 3,
                    sequence: 1,
                    speed: 50,
                },
                barsSpaceLeft: 0.25,
                barsSpaceRight: 0.25,
            },
            plotarea: {
                margin: '120 20 30 20',
            },
        };

        let g10 = {
            type: 'bar',
            backgroundColor: bgColorMain,
            height: '100%',
            width: '100%',
            x: '0%',
            y: '70%',
            title: {
                text: '2021: When will consumers begin shopping for Halloween?',
                align: 'left',
                fontColor: '#464646',
                fontSize: '13px',
                fontStyle: 'italic',
                fontWeight: 'normal',
                padding: '20 10 10 20',
            },
            legend: {
                backgroundColor: 'none',
                borderWidth: '0px',
                item: {
                    fontSize: '10px',
                    fontWeight: 'normal',
                    color: '#464646',
                },
                layout: '1x',
                margin: '220 auto 0 auto',
                marker: {
                    type: 'circle',
                    size: 8,
                    borderWidth: '0px',
                },
            },
            plot: {
                tooltip: {
                    align: 'center',
                    alpha: 0.75,
                    backgroundColor: '#000',
                    borderRadius: '4px',
                    borderWidth: '0px',
                    callout: true,
                    fontColor: '#fff',
                    fontSize: '11px',
                    fontWeight: 'normal',
                    padding: '5 10 10 5',
                },
                valueBox: {
                    text: '%node-value%',
                    angle: 270,
                    fontColor: '#464646',
                    fontSize: '9px',
                    fontWeight: 'normal',
                    placement: 'top-out',
                },
                animation: {
                    effect: 3,
                    sequence: 1,
                    speed: 50,
                },
                barsSpaceLeft: 0.25,
                barsSpaceRight: 0.25,
            },
            plotarea: {
                margin: '30 10 30 10',
            },
        };
        //gresumenadm, 
        let chartConfig = {
            graphset: [g1, gresumenpro, gresumenreq, gfinal, g2, g3, g4, g5, g6, g7, g8, g9,
                ...presupuestototals.map((graph, index) => ({
                    ...graph,
                    width: '100%',
                    height: `${graphHeight}px`,
                    x: '1%',
                    y: '80%',
                    y: `${parseInt(g10.y) + parseInt(g10.height) + graphGap + index * (graphHeight + graphGap) + 3150}px`
                }))],
        };

        zingchart.render({
            id: 'mytotal',
            data: chartConfig,
            width: '100%',
            height: '5000px',
        });
        window.selectedIndex = -1;

        // Asignar evento click al botón para actualizar proyectos
        $('#actualizarProyectosBtngastos').on('click', function () {
            actualizarProyectosGastos();
        });

    }
})