$(document).ready(function () {
    // Función para obtener el token CSRF
    function getCSRFToken() {
        return $('meta[name="csrf-token"]').attr('content');
    }

    // Obtener el ID de la empresa desde un campo de entrada o un valor específico
    const empresaId = document.getElementById('empresaId').value;

    // Realizar la solicitud AJAX para obtener los trabajadores
    $.ajax({
        url: `/listar_trab/${empresaId}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': getCSRFToken()
        },
        success: function (data) {
            // Asegurar que 'data' sea un array
            const workers = Array.isArray(data) ? data : Object.values(data);
            if (workers.length > 0) {
                const selectElement = $('#task-assigned-to');
                const selectElementedit = $('#edit-task-assigned-to');
                const selectElementsearch = $('#search-task-assigned-to');
                const selectElementsearchModal = $('#search-task-assigned-to-modal');
    
                // Limpiar selects antes de agregar nuevas opciones
                selectElement.html('<option value="">Asignar a</option>');
                selectElementedit.html('<option value="">Asignar a</option>');
                selectElementsearch.html('<option value="">Asignar a</option>');
                selectElementsearchModal.html('<option value="">Seleccione el Personal</option>');
    
                // Iterar sobre 'workers' en lugar de 'data'
                workers.forEach(user => {
                    selectElement.append(
                        `<option value="${user.id}">${user.name}</option>`
                    );
                    selectElementedit.append(
                        `<option value="${user.id}">${user.name}</option>`
                    );
                    selectElementsearch.append(
                        `<option value="${user.id}">${user.name}</option>`
                    );
                    
                    selectElementsearchModal.append(
                        `<option value="${user.id}">${user.name}</option>`
                    );
                });
            } else {
                console.warn('No se encontraron trabajadores.');
            }
        },
        error: function (error) {
            console.error('Error al obtener los trabajadores:', error);
        }
    });

    $.ajax({
        url: `/listar_pro/${empresaId}`, // Llamada a la ruta que retorna los proyectos de la empresa
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': getCSRFToken() // Asegúrate de tener el CSRF token en tu función getCSRFToken
        },
        success: function (data) {
            // Verifica si 'data' ya es un array
            const proyectos = Array.isArray(data) ? data : [];
    
            if (proyectos.length > 0) {
                const selectElement = $('#task-project');
                const selectElementedit = $('#edit-task-project');
    
                // Limpiar selects antes de agregar nuevas opciones
                selectElement.html('<option value="">Selecciona un proyecto</option>');
                selectElementedit.html('<option value="">Selecciona un proyecto</option>');
    
                // Agregar opciones al select
                proyectos.forEach(proyecto => {
                    selectElement.append(
                        `<option value="${proyecto.id_proyectos}">${proyecto.nombre_proyecto}</option>`
                    );
                    selectElementedit.append(
                        `<option value="${proyecto.id_proyectos}">${proyecto.nombre_proyecto}</option>`
                    );
                });
            } else {
                console.warn("No hay proyectos disponibles.");
            }
        },
        error: function (error) {
            console.error('Error al obtener los Proyectos:', error);
        }
    });

    const form = $('#edit-task-form');
    form.on('submit', function (event) {
        event.preventDefault();
        const taskId = $('#edit-taskId').val();
        const taskName = $('#edit-task-name').val();
        const projectId = $('#edit-task-project').val();
        const assignedToId = $('#edit-task-assigned-to').val();
        const diasAsignados = $('#edit-task-dias-asignados').val();
        const porcentDesignados = $('#edit-task-porcent-avance').val();

        $.ajax({
            url: `/actualizar_fichas/${taskId}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            data: JSON.stringify({
                nameActividad: taskName,
                projectActividad: projectId,
                usuario_designado: assignedToId,
                diasAsignados: diasAsignados,
                porcentajeTarea: porcentDesignados,
            }),
            success: function (data) {
                if (data.success) {
                    // Mostrar alerta de éxito con SweetAlert2
                    Swal.fire({
                        icon: 'success',
                        title: 'Tarea actualizada con éxito',
                        text: 'La tarea se ha actualizado correctamente.',
                        confirmButtonText: 'Aceptar'
                    }).then(function() {
                        // Ocultar el formulario y modal cuando se confirma la alerta
                        $('#edit-task-form').addClass('hidden');
                        $('#edit-task-modal').hide();
                    });
                } else {
                    // Mostrar alerta de error con SweetAlert2
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al actualizar la tarea',
                        text: 'Hubo un problema al intentar actualizar la tarea. Intenta de nuevo.',
                        confirmButtonText: 'Aceptar'
                    });
                }
            },
            error: function (xhr, status, error) {
                // Mostrar alerta de error con SweetAlert2
                console.error('Error al actualizar la tarea:', error);
                console.error('Detalles del error:', xhr.responseText);
                console.error('Status:', status);
                
                Swal.fire({
                    icon: 'error',
                    title: 'Error al actualizar la tarea',
                    text: 'Hubo un error al actualizar la tarea. Detalles: ' + xhr.responseText,
                    confirmButtonText: 'Aceptar'
                });
            }            
        });
    });
    
    document.getElementById('export-ip-btn').addEventListener('click', () => {
        const selectElement = document.getElementById('search-task-assigned-to-modal');
        const selectedName = selectElement.options[selectElement.selectedIndex].text;
        const selectedId = selectElement.value;

        const monthSelect = document.getElementById('month-select');
        const selectedMonth = monthSelect.options[monthSelect.selectedIndex].text;
        const selectedMonthValue = monthSelect.value;

        // Nuevos campos
        const adelanto = document.getElementById('adelanto').value;
        const permisos = document.getElementById('permisos').value;
        const incMof = document.getElementById('incMof').value;
        const bondtrab = document.getElementById('bondtrab').value;
        const descuenttrab = document.getElementById('descuenttrab').value;
        const empresaId = document.getElementById('empresaId').value;

        $.ajax({
            url: '/actividades-personal/exportar',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCSRFToken()
            },
            data: JSON.stringify({
                user_id: selectedId,
                user_name: selectedName,
                month: selectedMonthValue,
                month_text: selectedMonth,
                adelanto: adelanto,
                permisos: permisos,
                incMof: incMof,
                bondtrab: bondtrab,
                descuenttrab: descuenttrab,
                empresaId: empresaId,
            }),
            success: function (response) {
                //console.log('Datos enviados con éxito:', response);

                // Extract data from response
                const tareas = response.tareas || [];
                const tareasnoaprobados = response.tareasnoaprobados || [];
                const trabajador = [response.usuario]; // Convert usuario to array for consistency
                const adelantos = response.extras.adelanto || "0";
                const permisos = response.extras.permisos || "0";
                const incMof = response.extras.incMof || "0";
                const bondtrab = response.extras.bondtrab || "0";
                const descuenttrab = response.extras.descuenttrab || "0";
                const proyectos = []; // Assuming proyectos are not in response; adjust if available
                const id_empresa = parseInt(response.idEmpresa || 1); // Hardcoded for example; replace with dynamic value
                const id_trabajador = parseInt(response.usuario.id || 1);
                const Messelect = parseInt(response.mes || 1); // Hardcoded for example; replace with dynamic value (e.g., from form)

                // Call the informe_pago_personal function
                informe_pago_personal(tareas, tareasnoaprobados, trabajador, adelantos, permisos, incMof, bondtrab, descuenttrab, proyectos, id_empresa, id_trabajador, Messelect);
            },
            error: function (xhr) {
                console.error('Error al enviar los datos:', xhr.responseText);
            }
        });

        // Cerrar modal
        document.getElementById('modal-personal').classList.add('hidden');
    });

    // Function to format the date
    function formatearFecha(fecha) {
        const opcionesFecha = {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        };
        const opcionesHora = {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };

        const parteFecha = fecha.toLocaleDateString('es-ES', opcionesFecha);
        const parteHora = fecha.toLocaleTimeString('es-ES', opcionesHora);

        return `${parteFecha.toUpperCase()} Hora: ${parteHora}`;
    }

    // Placeholder for proyecto_efectuadoIP (adjust based on your requirements)
    function proyecto_efectuadoIP(dataIP) {
        // Example implementation: Map tasks to project data
        const proyectos = dataIP.map(tarea => {
            return [
                tarea.titulo || "Proyecto Desconocido",
                tarea.fecha || "N/A",
                tarea.fecha || "N/A",
                tarea.diasAsignados || "0",
                tarea.status || "N/A"
            ];
        });
        // Add a total row if needed
        proyectos.push(["TOTAL", "", "", dataIP.reduce((sum, tarea) => sum + parseFloat(tarea.diasAsignados || 0), 0), ""]);
        return proyectos;
    }

    // Placeholder for descuentosBonificacion (adjust based on your requirements)
    function descuentosBonificacion(dataIP, sueldoPIP, Messelect, conteoDiasNA) {
        let totalDescuento = 0;
        let totalBonificacion = 0;
        if (sueldoPIP !== undefined && sueldoPIP !== null && sueldoPIP > 0) {
            // Iterar sobre las tareas para calcular los días de bonificación y descuento
            dataIP.forEach(tarea => {
                const porcentajeAvance = tarea.procentaje_trabajador ? tarea.procentaje_trabajador /
                    100 : 0; // Convertir el porcentaje a un valor entre 0 y 1
                // Calcular los días de bonificación o descuento según el porcentaje de avance
                if (porcentajeAvance <= 0.1) {
                    totalDescuento += 1;
                } else if (porcentajeAvance <= 0.25) {
                    totalDescuento += 0.75;
                } else if (porcentajeAvance <= 0.50) {
                    totalDescuento += 0.50;
                } else if (porcentajeAvance <= 0.75) {
                    totalDescuento += 0.25;
                } else if (porcentajeAvance <= 0.97) {
                    totalDescuento += 0.10;
                } else if (porcentajeAvance < 0.98) {
                    totalDescuento += 0;
                }

                // Calcular la bonificación si el porcentaje de avance supera el 98%
                if (porcentajeAvance > 0.98) {
                    totalBonificacion +=
                        porcentajeAvance; // Bonificación equivalente al porcentaje que supera el 98%
                }
            });

            const sueldoPersonal = sueldoPIP;
            const sueldoGeneral = sueldoPersonal; // Sueldo general

            //const diasLaborablesMes = 26; // Número de días laborables en el mes
            const fechaActual = new Date();
            const year = fechaActual.getFullYear(); // Obtener el año actual
            const month = Messelect; // Obtener el mes actual (0 = enero, ..., 11 = diciembre)
            const diasLaborablesMes = obtenerDiasLaborables(year, month);

            const sueldoDiario = sueldoGeneral / diasLaborablesMes; // Calcular sueldo diario
            //descuento
            const incumplimiento = (conteoDiasNA * sueldoDiario).toFixed(2);

            //ENTRADAS 

            const adelantoc = parseFloat(document.getElementById('adelanto').value);
            const permisosc = parseFloat(document.getElementById('permisos').value);
            const incumpliminetoMof = parseFloat(document.getElementById('incMof').value);

            const descuentos = parseFloat(document.getElementById('descuenttrab').value);
            const bonificacion = parseFloat(document.getElementById('bondtrab').value);

            //FORMULAS
            const totaladelanto = parseFloat(sueldoDiario * adelantoc).toFixed(2);
            const totalPermisos = parseFloat(sueldoDiario * permisosc).toFixed(2);
            const totalIncMof = parseFloat(sueldoDiario * incumpliminetoMof).toFixed(2);

            const totalDescuentos = parseFloat(sueldoDiario * descuentos).toFixed(2);

            const totalBonos = parseFloat(sueldoDiario * bonificacion).toFixed(2);

            //const totalDescuentoMonetario = (parseFloat(totalDescuentos) + parseFloat(totaladelanto) + parseFloat(totalPermisos) + parseFloat(totalIncMof) + parseFloat(incumplimiento)).toFixed(2);
            const totalDescuentoMonetario = (parseFloat(totalDescuentos) + parseFloat(totaladelanto) +
                parseFloat(totalPermisos) + parseFloat(totalIncMof)).toFixed(2);
            //const totalDiasDescuento = adelantoc + permisosc + incumpliminetoMof + descuentos + totalDescuento;
            const totalDiasDescuento = adelantoc + permisosc + incumpliminetoMof + descuentos;
            //MOSTRAR EN LA TABLA LOS DATOS
            // Calcular el total de bonificación multiplicando por el sueldo diario
            const bonificacionMonto = totalBonificacion * sueldoDiario;

            // Filas para "PERMISOS", "ADELANTO", "INCUMPLIMIENTO DEL LAB", "INCUMPLIMIENTO DEL MOF (2 HORAS)"
            const permisos = ["PERMISOS", permisosc, totalPermisos];
            const adelanto = ["ADELANTO", adelantoc, totaladelanto];
            const incumplimientoLab = ["INCUMPLIMIENTO DEL LAB", conteoDiasNA, incumplimiento];
            //const incumplimientoLab = ["INCUMPLIMIENTO DEL LAB", 0, '0.00'];
            const incumplimientoMof = ["INCUMPLIMIENTO DEL MOF (2 HORAS)", incumpliminetoMof, totalIncMof];
            const descuento = ["DESCUENTO", descuentos, totalDescuentos];

            // Fila para "TOTAL DE DESCUENTO"
            //const totalDescuentoRow = ["TOTAL DE DESCUENTO", totalDescuento, incumplimiento];
            const totalDescuentoRow = ["TOTAL DE DESCUENTO", totalDiasDescuento, totalDescuentoMonetario];
            //const totalDescuentoRow = ["TOTAL DE DESCUENTO", '0', '0.00'];

            // Fila para "BONIFICACIÓN"
            const bonificacionRow = ["BONIFICACIÓN", bonificacion, totalBonos];

            // Fila para "SUMA DE BONIFICACIÓN"
            const sumaBonificacionRow = ["TOTAL DE BONIFICACIÓN", bonificacion, totalBonos];

            // Retornar las filas
            return [permisos, adelanto, incumplimientoLab, incumplimientoMof, descuento, totalDescuentoRow,
                bonificacionRow, sumaBonificacionRow
            ];
        } else {
            console.error("Error: sueldoPIP no está definido o está vacío.");
            return [];
        }
    }

    // Placeholder for calcularSueldoDescuentos (adjust based on your requirements)
    function calcularSueldoDescuentos(totalDiasTrabajados, sueldoPIP, Messelect) {
        // Example: Calculate net salary based on days worked
        const diasLaborables = obtenerDiasLaborables(26);
        const sueldoDiario = sueldoPIP / diasLaborables;
        return (sueldoDiario * totalDiasTrabajados).toFixed(2);
    }

    // Placeholder for obtenerDiasLaborables (adjust based on your requirements)
    function obtenerDiasLaborables(year, month) {
        // Example: Return number of working days in the month
        const date = new Date(year, month - 1, 1);
        let diasLaborables = 26;
        //const ultimoDia = new Date(year, month, 0).getDate();
        //for (let i = 1; i <= ultimoDia; i++) {
            //date.setDate(i);
            //if (date.getDay() !== 0 && date.getDay() !== 6) {
                //diasLaborables++;
            //}
        //}
        return diasLaborables;
    }

    // Main function to generate the PDF
    function informe_pago_personal(tareas, tareasnoaprobados, trabajador, adelantos, permisos, incMof, bondtrab, descuenttrab, proyectos, id_empresa, id_trabajador, Messelect) {
        const trabajadorEncontrado = trabajador.find(t => t.id == id_trabajador);
        let trabajadorDatos = "";
        if (trabajadorEncontrado) {
            trabajadorDatos = {
                name: trabajadorEncontrado.nombre,
                surname: trabajadorEncontrado.apellido,
                dni_user: trabajadorEncontrado.dni,
                sueldo_base: trabajadorEncontrado.sueldo_base,
                area_laboral: trabajadorEncontrado.area_laboral,
            };
        } else {
            console.log("No se encontró el trabajador con el ID proporcionado.");
            return;
        }

        const dataIP = tareas.map(tarea => {
            //console.log("Tarea:", tarea);

            // Ensure trabajadorDatos is valid
            const nombreTrabajador = trabajadorDatos && trabajadorDatos.name && trabajadorDatos.surname
                ? `${trabajadorDatos.name} ${trabajadorDatos.surname}`
                : "Trabajador no especificado";

            return {
                ...tarea,
                nombre_proyecto: tarea.titulo || (tarea.proyecto && tarea.proyecto.nombre_proyecto) || "Proyecto no encontrado",
                nombre_trabajador: nombreTrabajador
            };
        });

        const conteoDiasNA = tareasnoaprobados.reduce((total, tarea) => {
            const dias = parseFloat(tarea.diasAsignados); // Convertir a número
            return total + (isNaN(dias) ? 0 : dias); // Sumar, ignorando valores no numéricos
        }, 0);

        let nombre_empresa = '';
        switch (id_empresa) {
            case 1:
                nombre_empresa = "Rizabal & Asociados ING. estruc";
                break;
            case 2:
                nombre_empresa = "CONTRUYEHCO";
                break;
            case 3:
                nombre_empresa = "SEVEN HEART";
                break;
            case 4:
                nombre_empresa = "DML arquitectos";
                break;
            case 5:
                nombre_empresa = "HYPERIUM";
                break;
            default:
                nombre_empresa = "Empresa no reconocida";
        }

        const nombres = (trabajadorDatos.name + ' ' + trabajadorDatos.surname).split(' ');
        let iniciales = '';
        nombres.forEach(nombre => {
            iniciales += nombre.charAt(0);
        });

        const pdf_IP = new window.jspdf.jsPDF();
        const date = new Date();
        const anioactual = date.getFullYear();
        const fechaFormateada = formatearFecha(date);
        const mesActual = new Intl.DateTimeFormat('es', { month: 'long' }).format(date).toUpperCase();
        const primerDiaMes = new Date(anioactual, date.getMonth(), 1);
        const inicioMes = primerDiaMes.toLocaleDateString('es', { day: '2-digit', month: 'long' });
        const ultimoDiaMes = new Date(anioactual, date.getMonth() + 1, 0);
        const finMes = ultimoDiaMes.toLocaleDateString('es', { day: '2-digit', month: 'long' });

        let nombre_mes;
        switch (parseInt(Messelect)) {
            case 1:
                nombre_mes = "ENERO";
                break;
            case 2:
                nombre_mes = "FEBRERO";
                break;
            case 3:
                nombre_mes = "MARZO";
                break;
            case 4:
                nombre_mes = "ABRIL";
                break;
            case 5:
                nombre_mes = "MAYO";
                break;
            case 6:
                nombre_mes = "JUNIO";
                break;
            case 7:
                nombre_mes = "JULIO";
                break;
            case 8:
                nombre_mes = "AGOSTO";
                break;
            case 9:
                nombre_mes = "SEPTIEMBRE";
                break;
            case 10:
                nombre_mes = "OCTUBRE";
                break;
            case 11:
                nombre_mes = "NOVIEMBRE";
                break;
            case 12:
                nombre_mes = "DICIEMBRE";
                break;
            default:
                nombre_mes = "MES INVÁLIDO";
        }

        let rol = '';
        if (['JOSE EDUARDO', 'LUIS DANIEL', 'EMERSON MESIAS'].includes(trabajadorDatos.name)) {
            rol = 'Jefe de Área';
        } else {
            rol = 'Asistente';
        }

        pdf_IP.setFontSize(11);
        pdf_IP.setFont("Arial", "bold"); // Use Arial instead of Arial Narrow
        pdf_IP.text("INFORME N°" + ("00" + Messelect).slice(-2) + "-" + anioactual + "/" + nombre_empresa + "-" + iniciales, 20, 20);
        pdf_IP.setFont("Arial", "bold");
        pdf_IP.setFontSize(10);
        pdf_IP.text("SEÑOR(A): ", 20, 30);
        pdf_IP.setFont("Arial", "normal");
        pdf_IP.text("Andrea Alexandra Paredes Sánchez", 40, 30);
        pdf_IP.setFont("Arial", "bold");
        pdf_IP.text("Administradora", 40, 35);
        pdf_IP.setFont("Arial", "bold");
        pdf_IP.text("DE: ", 20, 40);
        pdf_IP.setFont("Arial", "normal");
        pdf_IP.text((trabajadorDatos.name + ' ' + trabajadorDatos.surname), 40, 40);
        pdf_IP.setFont("Arial", "bold");
        pdf_IP.setFontSize(10);
        pdf_IP.text(rol, 40, 45);
        pdf_IP.setFont("Arial", "bold");
        pdf_IP.text("ASUNTO:", 20, 50);
        pdf_IP.setFont("Arial", "normal");
        pdf_IP.text("INFORME DE PAGO DEL MES DE " + nombre_mes + " del " + anioactual, 40, 50);
        pdf_IP.setFont("Arial", "bold");
        pdf_IP.text("FECHA:", 20, 55);
        pdf_IP.setFont("Arial", "normal");
        pdf_IP.text("HUANUCO, " + fechaFormateada, 40, 55);

        let imagenEmpresa = '';
        switch (id_empresa) {
            case 1:
                imagenEmpresa = "{{ asset('storage/avatar_empresa/logo_rizabal.png') }}";
                break;
            case 2:
                imagenEmpresa = "{{ asset('storage/avatar_empresa/logo_contruyehco.png') }}";
                break;
            case 3:
                imagenEmpresa = "{{ asset('storage/avatar_empresa/logo_sevenheart.png') }}";
                break;
            case 4:
                imagenEmpresa = "{{ asset('storage/avatar_empresa/logo_dml.png') }}";
                break;
            case 5:
                imagenEmpresa = "{{ asset('storage/avatar_empresa/logo_hyperium.png') }}";
                break;
            default:
                imagenEmpresa = "{{ asset('storage/avatar_empresa/logo_default.png') }}";
        }

        let tipoGerencia = '';
        if (id_empresa == 1) {
            tipoGerencia = "Área Campo";
        } else if (id_empresa == 2) {
            tipoGerencia = "ÁREA OFICINA TECNICA";
        } else if (id_empresa == 3) {
            tipoGerencia = "Área de Obras";
        } else if (id_empresa == 4) {
            tipoGerencia = "Área Arquitectura";
        } else if (id_empresa == 5) {
            tipoGerencia = "Área de Informatica";
        } else if (id_empresa == 6) {
            tipoGerencia = "Área de Obras";
        }

        // Note: Image loading requires actual image URLs or base64 data
        // pdf_IP.addImage(imagenEmpresa, "JPEG", 125, -5, 80, 50); // Uncomment when images are available
        pdf_IP.setFontSize(9);
        pdf_IP.text(
            "Por medio de la presente me es grato dirigirme a Ud. Cordialmente y felicitarlo por la acertada labor que viene desempeñando, así mismo",
            20, 65);
        pdf_IP.text(
            "entrego a su despacho el informe de avance del personal, para ello se detalla a continuación:",
            20, 70);
        var sueldoPIP = parseFloat(trabajadorDatos.sueldo_base);
        pdf_IP.autoTable({
            head: [["PROYECTOS EFECTUADOS", "INICIO DE PROYECTO", "FIN DE PROYECTO", "DIAS", "CIERRE"]],
            body: proyecto_efectuadoIP(dataIP),
            startY: 85,
            styles: {
                fontSize: 8,
                valign: 'middle',
                halign: 'center',
                lineWidth: 0.1,
            },
            theme: 'plain',
        });

        const descuentosBonificacionData = descuentosBonificacion(dataIP, sueldoPIP, Messelect, conteoDiasNA);
        pdf_IP.autoTable({
            head: [["DESCUENTOS Y BONIFICACIONES", "CANT.", "MONTO"]],
            body: descuentosBonificacionData,
            startY: pdf_IP.autoTable.previous.finalY + 10,
            styles: {
                fontSize: 8,
                valign: 'middle',
                halign: 'left',
                lineWidth: 0.1,
            },
            theme: 'plain',
            didParseCell: (data) => {
                if (data.row.index === descuentosBonificacionData.findIndex(row => row[0] === "TOTAL DE DESCUENTO")) {
                    data.cell.styles.fontStyle = 'bold';
                }
                if (data.row.index === descuentosBonificacionData.length - 1) {
                    data.cell.styles.fontStyle = 'bold';
                }
            },
        });

        const dataProyectos = proyecto_efectuadoIP(dataIP);
        const dataDescuentos = descuentosBonificacion(dataIP, sueldoPIP, Messelect);
        let totalDiasTrabajados = 0;
        for (let i = 0; i < dataProyectos.length - 1; i++) {
            totalDiasTrabajados += parseFloat(dataProyectos[i][3]);
        }

        const year = new Date().getFullYear();
        const diasLaborablesMes = obtenerDiasLaborables(year, parseInt(Messelect));
        if (totalDiasTrabajados >= 24.90 && totalDiasTrabajados <= diasLaborablesMes) {
            totalDiasTrabajados = diasLaborablesMes;
        }

        const totalDescuentoSoles = parseFloat(dataDescuentos[5][2]);
        const totalbonosSoles = parseFloat(dataDescuentos[6][2]);
        const sueldoNeto = calcularSueldoDescuentos(totalDiasTrabajados, sueldoPIP, Messelect);
        const SaltoDescontado = parseFloat(sueldoNeto) + totalbonosSoles - totalDescuentoSoles;

        pdf_IP.setFont("Arial", "bold");
        pdf_IP.setFontSize(11);
        pdf_IP.text("MONTO TOTAL DE PAGO: ", 20, pdf_IP.autoTable.previous.finalY + 20);
        pdf_IP.setFont("Arial", "normal");
        pdf_IP.text("S/.: " + SaltoDescontado.toFixed(2), 75, pdf_IP.autoTable.previous.finalY + 20);

        let posY = pdf_IP.autoTable.previous.finalY + 30;
        pdf_IP.setFont("Arial", "bold");
        pdf_IP.text("DNI:", 20, posY + 5);
        pdf_IP.setFont("Arial", "normal");
        pdf_IP.text(String(trabajadorDatos.dni_user), 30, posY + 5);

        pdf_IP.setFont("Arial", "bold");
        pdf_IP.text("ANEXOS:", 20, posY + 10);
        pdf_IP.setFont("Arial", "normal");
        pdf_IP.text("LAP mensual, Recibo por Honorarios.", 40, posY + 15);

        pdf_IP.setFontSize(9);
        pdf_IP.setFont("Arial", "normal");
        pdf_IP.text("Sin otro particular aprovecho la oportunidad para reiterarle las muestras de mi", 30, posY + 25);
        pdf_IP.text("especial consideración y estima personal.", 20, posY + 30);
        pdf_IP.text("Atentamente", 20, posY + 35);

        // // Option 1: Display PDF in an embed element
        // const string = pdf_IP.output('datauristring');
        // const embedElement = document.createElement('embed');
        // embedElement.setAttribute('width', '100%');
        // embedElement.setAttribute('height', '100%');
        // embedElement.setAttribute('src', string);
        // const divMostrarInformePago = document.getElementById('mostrarInformePago');
        // divMostrarInformePago.innerHTML = '';
        // divMostrarInformePago.appendChild(embedElement);

        // Option 2: Download the PDF
        pdf_IP.save(`Informe_Pago_${trabajadorDatos.name}_${nombre_mes}_${anioactual}.pdf`);
    }
});

class Task {
    constructor(taskData = {}) {
        try {
            this.id = taskData.actividadId || null;
            this.name = taskData.nameActividad || '';
            this.project = taskData.project_name || '';
            this.projectId = taskData.project_id || '';
            this.assignedTo = taskData.user_name || '';
            this.assignedToId = taskData.user_id || '';
            this.status = taskData.status || 'todo';
            this.fecha = taskData.fecha ? new Date(taskData.fecha).toLocaleString('en-US', { timeZone: 'America/Lima' }) : '';
            this.porcentajeTarea = taskData.porcentajeTarea || 0;
    
            // Validar valores numéricos
            this.diasAsignados = !isNaN(parseFloat(taskData.diasAsignados)) ? parseFloat(taskData.diasAsignados) : 0;
            let elapsed_time = !isNaN(parseFloat(taskData.elapsed_time)) ? parseFloat(taskData.elapsed_time) : 0;
    
            this.diasRestantes = Math.max(0, this.diasAsignados - elapsed_time);
    
            this.fechaInicio = taskData.fechaInicio ? new Date(taskData.fechaInicio).toLocaleString('en-US', { timeZone: 'America/Lima' }) : null;
            this.timeZone = 'America/Lima';
    
            // Iniciar contador si la tarea está en 'doing'
            if (this.status === 'doing') {
                this.iniciarContadorDias();
            }
        } catch (error) {
            console.error('Error initializing task:', error);
            throw new Error('Failed to initialize task');
        }
    }
    
    calcularDiasRestantes(taskData) {
        const diasAsignados = parseFloat(taskData.diasAsignados) || 0;
        const elapsedTime = parseFloat(taskData.elapsed_time) || 0;
        return Math.max(0, diasAsignados - elapsedTime);
    }

    iniciarContadorDias() {
        if (this.status !== 'doing') return;
        
        if (this.contadorInterval) clearInterval(this.contadorInterval);

        const verificarYActualizar = () => {
            const now = new Date();
            const horaLima = new Intl.DateTimeFormat('es-PE', { 
                timeZone: 'America/Lima', 
                hour: 'numeric',
                minute: 'numeric',
                hour12: false 
            }).format(now);
            
            const [hora, minuto] = horaLima.split(':').map(Number);
            let reduccion = 0;
            
            // Verificar 2 minutos antes del fin de cada rango
            if ((hora === 9 && minuto >= 58) || (hora === 10 && minuto === 0)) {
                reduccion = 0.25; // Primera reducción
            } else if ((hora === 12 && minuto >= 58) || (hora === 13 && minuto === 0)) {
                reduccion = 0.50; // Segunda reducción
            } else if ((hora === 16 && minuto >= 58) || (hora === 17 && minuto === 0)) {
                reduccion = 0.75; // Tercera reducción
            } else if ((hora === 19 && minuto >= 58) || (hora === 20 && minuto === 0)) {
                reduccion = 1.0; // Reducción final del día
            }

            if (reduccion > 0 && this.diasRestantes > 0) {
                this.diasRestantes = Math.max(0, this.diasRestantes - reduccion);
                this.actualizarDisplay();
                this.syncWithServer();
            }
        };

        // Verificar cada minuto
        verificarYActualizar();
        this.contadorInterval = setInterval(verificarYActualizar, 60000);
    }    

    syncWithServer() {
        // Validar valores antes del cálculo
        if (typeof this.diasAsignados !== 'number' || isNaN(this.diasAsignados)) {
            console.error(`❌ Error en Task ${this.id}: diasAsignados es inválido`, this.diasAsignados);
            this.diasAsignados = 0;  // Fallback seguro
        }
        
        if (typeof this.diasRestantes !== 'number' || isNaN(this.diasRestantes)) {
            console.error(`❌ Error en Task ${this.id}: diasRestantes es inválido`, this.diasRestantes);
            this.diasRestantes = 0;  // Fallback seguro
        }
    
        let elapsedTime = this.diasAsignados - this.diasRestantes;
    
        // Validar resultado final
        if (isNaN(elapsedTime) || elapsedTime < 0) {
            console.warn(`⚠️ Task ${this.id}: elapsedTime inválido (${elapsedTime}), asignando 0`);
            elapsedTime = 0;
        }
    
        const payload = {
            status: this.status,
            elapsedTime: elapsedTime,
            diasRestantes: this.diasRestantes
        };
    
        fetch(`/actualizar_actividadcol/${this.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            },
            body: JSON.stringify(payload)
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    console.error('❌ Error del servidor:', text);
                    throw new Error(`HTTP error! Status: ${response.status}`);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log(`✅ Sync exitoso para Task ${this.id}:`, data);
            localStorage.setItem(`task_${this.id}_diasRestantes`, this.diasRestantes.toString());
        })
        .catch(error => {
            console.error('❌ Error sincronizando con servidor:', error);
            if (this.diasRestantes !== undefined) {
                localStorage.setItem(`task_${this.id}_diasRestantes`, this.diasRestantes.toString());
            }
        });
    }    
    
    detenerContador() {
        if (this.contadorInterval) {
            clearInterval(this.contadorInterval);
            this.contadorInterval = null;
        }
    }

    actualizarDisplay() {
        try {
            const taskElement = document.getElementById(`task-${this.id}`);
            if (!taskElement) return;

            const timerBadge = taskElement.querySelector('.timer-badge');
            if (!timerBadge) return;

            // Formatear a 2 decimales
            const diasRestantesFormateado = Number(this.diasRestantes).toFixed(2);
            const diasAsignadosFormateado = Number(this.diasAsignados).toFixed(2);
            
            const isUrgent = this.diasRestantes <= (this.diasAsignados * 0.2);

            timerBadge.className = `timer-badge ${
                isUrgent ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
            } text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded`;

            timerBadge.innerHTML = `
                <svg class="w-5 h-2.5 me-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm3.982 13.982a1 1 0 0 1-1.414 0l-3.274-3.274A1.012 1.012 0 0 1 9 10V6a1 1 0 0 1 2 0v3.586l2.982 2.982a1 1 0 0 1 0 1.414Z"/>
                </svg>
                ${diasRestantesFormateado} / ${diasAsignadosFormateado} días
            `;
        } catch (error) {
            console.error('Error updating display:', error);
        }
    }

    isWithinWorkHours() {
        const now = new Date().toLocaleString('en-US', { timeZone: this.timeZone });
        const currentHour = new Date(now).getHours();
        return currentHour >= 8 && currentHour < 20;
    }

    getInitialElapsedTime(taskData) {
        // Primero intentar obtener el tiempo del localStorage
        const savedTime = localStorage.getItem(`task_${taskData.actividadId}_time`);

        if (savedTime) {
            const parsedTime = parseInt(savedTime, 10);
            // Verificar si el valor es válido
            if (!isNaN(parsedTime) && parsedTime >= 0) {
                return parsedTime;
            }
        }

        // Si no hay tiempo válido en localStorage, usar el tiempo de la base de datos
        if (taskData.elapsed_timeActividadId) {
            // Convertir horas a segundos
            const timeInSeconds = Math.floor(parseFloat(taskData.elapsed_timeActividadId) * 3600);
            // Guardar en localStorage para futura referencia
            if (taskData.actividadId) {
                localStorage.setItem(`task_${taskData.actividadId}_time`, timeInSeconds.toString());
            }
            return timeInSeconds;
        }

        return 0;
    }

    checkAndRestoreTracking() {
        // Comprobar si la tarea estaba en seguimiento antes de cerrar
        const trackingStartTime = localStorage.getItem(`task_${this.id}_tracking_start`);

        if (trackingStartTime) {
            const startTimestamp = parseInt(trackingStartTime, 10);
            const currentTime = Date.now();

            // Calcular tiempo transcurrido desde la última vez que se inició el seguimiento
            if (!isNaN(startTimestamp) && startTimestamp > 0) {
                const elapsedSeconds = Math.floor((currentTime - startTimestamp) / 1000);

                // Solo agregar tiempo si es una cantidad razonable (menos de 24 horas)
                // para evitar errores extremos si la marca de tiempo está corrupta
                if (elapsedSeconds > 0 && elapsedSeconds < 86400) {
                    this.elapsedTime += elapsedSeconds;

                    // Actualizar el tiempo en localStorage
                    localStorage.setItem(`task_${this.id}_time`, this.elapsedTime.toString());
                    // Sincronizar inmediatamente con el servidor
                    this.syncWithServer();
                }
            }

            // Iniciar el seguimiento de nuevo
            this.startTracking();
        }
    }

    updateTimerDisplay() {
        try {
            const taskElement = document.getElementById(`task-${this.id}`);
            if (!taskElement) return;

            const timerBadge = taskElement.querySelector('.timer-badge');
            if (!timerBadge) return;

            const remainingTimeFormatted = this.formatTime(this.remainingTime);
            const totalTimeFormatted = this.formatTime(this.diasAsignados * 12 * 3600);

            const isNearingDeadline = this.remainingTime <= (this.diasAsignados * 12 * 3600 * 0.2);
            timerBadge.className = `timer-badge ${isNearingDeadline ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'} text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded dark:bg-gray-700 border`;

            timerBadge.innerHTML = `
                <svg class="w-5 h-2.5 me-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm3.982 13.982a1 1 0 0 1-1.414 0l-3.274-3.274A1.012 1.012 0 0 1 9 10V6a1 1 0 0 1 2 0v3.586l2.982 2.982a1 1 0 0 1 0 1.414Z"/>
                </svg>
                ${remainingTimeFormatted} / ${totalTimeFormatted}
            `;
        } catch (error) {
            console.error('Error updating timer display:', error);
        }
    }

    startTracking() {
        if (this.status !== 'doing' || this.isTracking || !this.isWithinWorkHours()) {
            return false;
        }

        try {
            this.isTracking = true;
            this.startTime = Date.now();
            localStorage.setItem(`task_${this.id}_tracking_start`, this.startTime.toString());

            if (this.trackingInterval) {
                clearInterval(this.trackingInterval);
            }

            this.trackingInterval = setInterval(() => {
                if (!this.isWithinWorkHours()) {
                    this.pauseTracking();
                    return;
                }

                if (this.remainingTime <= 0) {
                    this.stopTracking();
                    this.status = 'done';
                    this.syncWithServer();
                    return;
                }

                this.elapsedTime += 1;
                this.remainingTime = this.calculateRemainingTime();

                if (this.elapsedTime % 10 === 0) {
                    this.saveToLocalStorage();
                }

                this.updateTimerDisplay();
            }, 1000);

            return true;
        } catch (error) {
            console.error('Error starting tracking:', error);
            this.isTracking = false;
            return false;
        }
    }

    stopTracking() {
        if (!this.isTracking) return;

        // Limpiar el intervalo
        if (this.trackingInterval) {
            clearInterval(this.trackingInterval);
            this.trackingInterval = null;
        }

        // Actualizar estado
        this.isTracking = false;

        // Eliminar marca de tiempo de inicio, pero mantener tiempo acumulado
        localStorage.removeItem(`task_${this.id}_tracking_start`);

        // Sincronizar una última vez con el servidor
        this.syncWithServer();

    }

    calculateWorkTime(totalSeconds) {
        // Calcular días y horas
        const hours = Math.floor(totalSeconds / 3600);
        const days = Math.floor(hours / 8); // Considera un día como 8 horas de trabajo
        const remainingHours = hours % 8;

        return {
            days,
            hours: remainingHours,
            totalHours: hours
        };
    }

    formatTime(totalSeconds) {
        try {
            const days = Math.floor(totalSeconds / (12 * 3600)); // 12 horas por día
            const hours = Math.floor((totalSeconds % (12 * 3600)) / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);

            let timeString = '';
            if (days > 0) timeString += `${days}d `;
            if (hours > 0 || days > 0) timeString += `${hours}h `;
            if (minutes > 0) timeString += `${minutes}m`;

            return timeString.trim() || '0m';
        } catch (error) {
            console.error('Error formatting time:', error);
            return '0m';
        }
    }
}


class TaskManager {
    constructor() {
        this.tasks = [];
        this.currentDate = new Date();
        // Bind methods to ensure correct context
        this.loadTasks = this.loadTasks.bind(this);
        this.populateWorkerDropdown = this.populateWorkerDropdown.bind(this);
        this.setupUserSelectionListener = this.setupUserSelectionListener.bind(this);

        // Initialize methods
        // this.initializeDateNavigation();
        this.setupDateNavigation();
        this.setupEventListeners();
        this.populateWorkerDropdown();
        this.setupUserSelectionListener();
    }

    setupDateNavigation() {
        const prevButton = document.getElementById('prev-date');
        const nextButton = document.getElementById('next-date');

        prevButton.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.updateDateDisplay();
            this.loadTasks();
        });

        nextButton.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.updateDateDisplay();
            this.loadTasks();
        });

        this.updateDateDisplay();
    }

    updateDateDisplay() {
        const monthNames = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
            'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
        const limaDate = new Date(this.currentDate.toLocaleString('en-US', { timeZone: 'America/Lima' }));
        const monthDisplay = document.getElementById('month_now');
        console.log(monthNames);
        console.log(limaDate);
        console.log(monthDisplay);
        monthDisplay.textContent = `${monthNames[limaDate.getMonth()]}-${limaDate.getFullYear()}`;
    }

    isSelectedMonth(taskDate) {
        console.log(taskDate);
        try {
            // Ensure taskDate is a valid string
            if (!taskDate) {
                console.error('taskDate is not defined:', taskDate);
                return false;
            }
    
            // Parse taskDate as a local date in America/Lima (YYYY-MM-DD)
            const [year, month, day] = taskDate.split('-').map(Number);
            const limaDate = new Date(year, month - 1, day); // Create date in local timezone
    
            // Get the current date in America/Lima
            const currentLimaDate = new Date(this.currentDate.toLocaleString('en-US', { timeZone: 'America/Lima' }));
    
            console.log('Parsed task date:', limaDate);
            console.log('Current date:', currentLimaDate);
    
            // Compare month and year
            return limaDate.getMonth() === currentLimaDate.getMonth() &&
                   limaDate.getFullYear() === currentLimaDate.getFullYear();
        } catch (error) {
            console.error('Error comparing dates:', error, { taskDate });
            return false;
        }
    }
    // Enhanced CRUD Operations
    createTask(taskData) {
        return fetch('/actividadpersonal', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': this.getCSRFToken()
            },
            body: JSON.stringify({
                ...taskData,
                approvalStatus: null // Default approval status
            })
        })
            .then(response => {
                if (!response.ok) throw new Error('Failed to create task');
                return response.json();
            })
            .then(createdTask => {
                const task = new Task(createdTask);
                this.tasks.push(task);
                this.renderTask(task);
                return task;
            })
            .catch(error => {
                console.error('Error creating task:', error);
                alert('No se pudo crear la tarea. Intente de nuevo.');
            });
    }

    setupUserSelectionListener() {
        const workerSelect = document.getElementById('search-task-assigned-to');
        const usuarioId = document.getElementById('trabajador_id').value;

        if (workerSelect) {
            // Remove any existing event listeners to prevent multiple bindings
            workerSelect.removeEventListener('change', this.loadTasks);

            // Add event listener for user selection changes
            workerSelect.addEventListener('change', (event) => {
                let selectedWorkerId = event.target.value;

                // If no worker is selected, use trabajador_id as default
                if (!selectedWorkerId && usuarioId) {
                    selectedWorkerId = usuarioId;
                }

                // If a worker is selected, load their tasks
                if (selectedWorkerId) {
                    this.loadTasks(selectedWorkerId);
                } else {
                    // If no worker is selected, clear tasks or load default view
                    this.tasks = [];
                    this.renderTasks();
                }
            });
        }
    }

     loadTasks(selectedWorkerId = null) {
        const empresaId = document.getElementById('empresaId')?.value;
        const usuarioId = document.getElementById('trabajador_id')?.value;
    
        if (!empresaId) {
            console.error('empresaId no definido');
            return Promise.reject('empresaId no definido');
        }
    
        const url = new URL('/actividadpersonal', window.location.origin);
        url.searchParams.append('empresaId', empresaId);
        if (selectedWorkerId || usuarioId) {
            url.searchParams.append('usuarioId', selectedWorkerId || usuarioId);
        }
    
        return fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': this.getCSRFToken()
            }
        })
        .then(response => {
            if (!response.ok) throw new Error('No se pudieron cargar las tareas');
            return response.json();
        })
        .then(tasksData => {
            this.tasks = [];
    
            // Solo contaremos tareas del mes visible
            const dias = {
                todo: 0,
                doing: 0,
                done: 0,
                approved: 0,
            };
    
            tasksData.forEach(taskData => {
                const task = taskData.task || taskData;
    
                // Validar fecha
                if (!task.fecha || !/^\d{4}-\d{2}-\d{2}/.test(task.fecha)) return;
    
                // Solo considerar tareas del mes seleccionado
                if (!this.isSelectedMonth(task.fecha)) return;
    
                const estado = task.status;
                const diasAsignados = parseFloat(task.diasAsignados) || 0;
    
                if (dias[estado] !== undefined) {
                    dias[estado] += diasAsignados;
                }
    
                const newTask = new Task({
                    ...task,
                    user_name: taskData.user_name || task.user_name,
                    user_id: taskData.user_id || task.user_id,
                    project_name: taskData.project_name || task.project_name,
                    project_id: taskData.project_id || task.project_id,
                });
    
                this.tasks.push(newTask);
            });
    
            // Actualizar los elementos del DOM
            document.getElementById('totaldiashacer').textContent = `${dias.todo} días`;
            document.getElementById('totaldiashaciendo').textContent = `${dias.doing} días`;
            document.getElementById('totaldiashecho').textContent = `${dias.done} días`;
            document.getElementById('totaldiasaprobado').textContent = `${dias.approved} días`;
    
            this.renderTasks();
            this.updateTaskDisplay();
        })
        .catch(error => {
            console.error('Error cargando tareas:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar las tareas. Intente de nuevo.',
                confirmButtonText: 'Aceptar'
            });
        });
    }



    updateTaskDisplay() {
        const noTasksMessage = document.getElementById('no-tasks-message');
        if (noTasksMessage) {
            if (this.tasks.length === 0) {
                noTasksMessage.classList.remove('hidden');
            } else {
                noTasksMessage.classList.add('hidden');
            }
        }
    }

    populateWorkerDropdown() {
        const workerSelect = document.getElementById('search-task-assigned-to');
        const usuarioId = document.getElementById('trabajador_id').value;
        // Ensure the select element exists
        if (!workerSelect) {
            console.error('Worker select element not found');
            return;
        }

        // Clear existing options except the first one
        while (workerSelect.options.length > 1) {
            workerSelect.remove(1);
        }

        // Get the company ID from the input field
        const empresaId = document.getElementById('empresaId').value;

        // Fetch workers for the current company
        fetch(`/listar_trab/${empresaId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': this.getCSRFToken()
            }
        })
            .then(response => {
                if (!response.ok) throw new Error('Failed to load workers');
                return response.json();
            })
            .then(data => {
                const workers = Object.values(data); // Convertir el objeto en array
                if (!Array.isArray(workers)) {
                    throw new Error('Expected an array but got something else');
                }
                // Limpiar opciones excepto la primera
                while (workerSelect.options.length > 1) {
                    workerSelect.remove(1);
                }

                // Rellenar el select con los trabajadores
                workers.forEach(worker => {
                    const option = document.createElement('option');
                    option.value = worker.id;
                    option.textContent = worker.name || worker.username;
                    workerSelect.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Error loading workers:', error);
                alert('No se pudieron cargar los trabajadores. Intente de nuevo.');
            });

    }

    updateTask(taskId, updateData) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return Promise.reject('Task not found');

        try {
            // Preparar los datos según el formato esperado por el backend
            const payload = {
                status: updateData.status || task.status,
                elapsedTime: task.elapsedTime ? (task.elapsedTime / 3600) : 0,  // Convertir a horas
                diasRestantes: updateData.diasRestantes,
                fechaInicio: updateData.fechaInicio
            };

            return fetch(`/actualizar_actividadcol/${taskId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': this.getCSRFToken()
                },
                body: JSON.stringify(payload)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(updatedTask => {
                const index = this.tasks.findIndex(t => t.id === taskId);
                if (index !== -1) {
                    this.tasks[index] = new Task({
                        ...updatedTask,
                        diasAsignados: task.diasAsignados,
                        fechaInicio: updateData.fechaInicio || task.fechaInicio
                    });

                    if (this.tasks[index].status === 'doing') {
                        this.tasks[index].iniciarContadorDias();
                    }
                    this.renderTasks();
                }
                return updatedTask;
            })
            .catch(error => {
                console.error('Error updating task:', error);
                // En caso de error, mantener el estado local
                if (task.elapsedTime) {
                    localStorage.setItem(`task_${taskId}_time`, task.elapsedTime.toString());
                }
                throw error;
            });
        } catch (error) {
            console.error('Error in updateTask:', error);
            return Promise.reject(error);
        }
    }

    deleteTask(taskId) {
        return fetch(`/actividadpersonal/${taskId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': this.getCSRFToken()
            }
        })
            .then(response => {
                if (!response.ok) throw new Error('Failed to delete task');

                this.tasks = this.tasks.filter(t => t.id !== taskId);

                const taskElement = document.getElementById(`task-${taskId}`);
                if (taskElement) taskElement.remove();
            })
            .catch(error => {
                console.error('Error deleting task:', error);
                alert('No se pudo eliminar la tarea. Intente de nuevo.');
            });
    }

    // Enhanced Rendering Methods

    renderTasks() {
        const columns = {
            'todo-column': [],
            'doing-column': [],
            'done-column': [],
            'approved-column': []
        };

        // Organizar tareas por estado
        this.tasks.forEach(task => {
            switch (task.status) {
                case 'todo': columns['todo-column'].push(task); break;
                case 'doing': columns['doing-column'].push(task); break;
                case 'done': columns['done-column'].push(task); break;
                case 'approved': columns['approved-column'].push(task); break;
            }
        });

        // Limpiar y volver a renderizar cada columna
        Object.keys(columns).forEach(columnId => {
            const column = document.getElementById(columnId);
            column.innerHTML = ''; // Limpiar tareas existentes
            columns[columnId].forEach(task => this.renderTask(task, column));
        });

        this.setupDragAndDrop();
    }

    // Modified approval methods
    renderTask(task, column) {
        const permisosUser = document.getElementById('rolUser').value;
        const taskElement = document.createElement('div');
        taskElement.id = `task-${task.id}`;
        taskElement.className = 'task-card p-4 bg-white shadow rounded mb-2 cursor-pointer overflow-hidden relative';

        // Asegurarse de que la tarea sea "draggable"
        taskElement.draggable = true;

        // Efecto hover para expansión, sin afectar el movimiento
        taskElement.style.transition = 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out';

        // Al pasar el ratón, se agranda ligeramente para indicar interacción
        taskElement.addEventListener('mouseover', () => {
            taskElement.style.transform = 'scale(1.05)'; // Aumenta ligeramente el tamaño
            taskElement.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'; // Sombra más prominente
        });

        taskElement.addEventListener('mouseleave', () => {
            taskElement.style.transform = 'scale(1)'; // Vuelve al tamaño original
            taskElement.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.1)'; // Sombra normal
        });

        // Botones de aprobación solo si el estado es 'done'
        const approveButton = task.status === 'done' && permisosUser === 'true'
            ? `
                <div class="approval-controls flex space-x-1 mt-2">
                    <button onclick="taskManager.approveTask(${task.id}, true)" class="px-3 py-2 text-xs font-medium text-center inline-flex items-center text-white bg-green-700 rounded-lg hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Aprobar</button>
                    <button onclick="taskManager.approveTask(${task.id}, false)" class="px-3 py-2 text-xs font-medium text-center inline-flex items-center text-white bg-red-700 rounded-lg hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800">Desaprobar</button>
                </div>
            `
            : '';

        // Estructura HTML con los botones de edición y eliminación
        taskElement.innerHTML = `
            <div class="flex justify-between items-center">
                <h3 class="text-base font-bold">${task.name}</h3>
                <span class="timer-badge ${task.diasRestantes <= Math.ceil(task.diasAsignados * 0.2) ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'} text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded">
                    ${task.diasRestantes} / ${task.diasAsignados} días
                </span>
            </div>
            <div class="task-details mt-2 text-gray-600 hidden">
                <p class="text-xs font-semibold">proyecto: ${task.project}</p>
                <p class="text-xs font-semibold">Trabajador.: ${task.assignedTo}</p>
                <div class="task-controls flex space-x-1 mt-2">
                    <button onclick="taskManager.editTask(${task.id})" class="bg-blue-500 text-white px-3 py-2 text-xs rounded mr-2">Editar</button>
                    <button onclick="taskManager.deleteTask(${task.id})" class="bg-red-500 text-white px-3 py-2 text-xs rounded">Eliminars</button>
                </div>
                ${approveButton}
            </div>

        `;

        // Muestra los detalles al expandir
        const taskDetails = taskElement.querySelector('.task-details');
        taskElement.addEventListener('mouseover', () => {
            taskDetails.classList.remove('hidden');
        });
        taskElement.addEventListener('mouseleave', () => {
            taskDetails.classList.add('hidden');
        });

        // Renderizar en la columna correspondiente
        const targetColumn = column || document.getElementById(`${task.status}-column`);
        targetColumn.appendChild(taskElement);

        // Si está en 'doing', iniciar seguimiento
        if (task.status === 'doing') {
            task.iniciarContadorDias();
        }
    }

    approveTask(taskId, approve) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        if (approve) {
            // Move to approved column
            task.stopTracking();
            this.updateTask(taskId, {
                status: 'approved',
                approvalStatus: 'approved',
                elapsedTime: task.elapsedTime
            });
        } else {
            // Move back to todo column, preserving elapsed time
            task.stopTracking();
            this.updateTask(taskId, {
                status: 'todo',
                approvalStatus: 'rejected',
                elapsedTime: task.elapsedTime
            });
        }
    }

    handleAddTask(event) {
        event.preventDefault();
        const nameInput = document.getElementById('task-name');
        const projectInput = document.getElementById('task-project');
        const assignedToInput = document.getElementById('task-assigned-to');
        const diasAsignadosToInput = document.getElementById('task-dias-asignados');
        const porcentToInput = document.getElementById('task-porcent-avance');

        if (nameInput.value && projectInput.value && assignedToInput.value) {
            this.createTask({
                name: nameInput.value,
                project: projectInput.value,
                assignedTo: assignedToInput.value,
                diasTo: diasAsignadosToInput.value,
                porcentTo: porcentToInput.value,
                status: 'todo',
                fecha: getCurrentDate()
            });

            // Clear inputs
            nameInput.value = '';
            projectInput.value = '';
            assignedToInput.value = '';
            diasAsignadosToInput.value = '';
            porcentToInput.value = '';
        }
    }

    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        const editModal = document.getElementById('edit-task-modal');
        if (editModal) {
            // Rellenar los campos con los valores de la tarea
            document.getElementById('edit-taskId').value = taskId;
            document.getElementById('edit-task-name').value = task.name;
            // Establecer el valor de los select para proyecto y usuario (si existen)
            document.getElementById('edit-task-project').value = task.projectId;
            document.getElementById('edit-task-assigned-to').value = task.assignedToId;
            document.getElementById('edit-task-dias-asignados').value = task.diasAsignados;
            document.getElementById('edit-task-porcent-avance').value = task.porcentajeTarea;

            // Almacenar el ID de la tarea en el modal para la actualización
            editModal.dataset.taskId = taskId;

            // Mostrar el modal
            editModal.classList.remove('hidden');

            // Inicializar Select2 después de asignar el valor
            $('#edit-task-project').trigger('change'); // Trigger para actualizar Select2
            $('#edit-task-assigned-to').trigger('change'); // Trigger para actualizar Select2

            // Añadir evento para cerrar el modal
            const cerrarmodal = document.getElementById('cerrar_modal');
            cerrarmodal.addEventListener('click', function () {
                editModal.classList.add('hidden');
            });
        }
    }

    saveEditedTask() {
        const editModal = document.getElementById('edit-task-modal');
        const taskId = parseInt(editModal.dataset.taskId);

        const updatedTaskData = {
            name: document.getElementById('edit-task-name').value,
            project: document.getElementById('edit-task-project').value,
            assignedTo: document.getElementById('edit-task-assigned-to').value
        };

        this.updateTask(taskId, updatedTaskData)
            .then(() => {
                // Hide modal
                editModal.classList.add('hidden');
            });
    }

    // Drag and Drop Methods
    setupDragAndDrop() {
        const taskCards = document.querySelectorAll('.task-card');
        const columns = document.querySelectorAll('.column');

        taskCards.forEach(card => {
            card.addEventListener('dragstart', this.handleDragStart);
            card.addEventListener('dragend', this.handleDragEnd);
        });

        columns.forEach(column => {
            column.addEventListener('dragover', this.handleDragOver);
            column.addEventListener('drop', this.handleDrop.bind(this));
        });
    }

    handleDragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.id);
        e.target.classList.add('opacity-50');
    }

    handleDragEnd(e) {
        e.target.classList.remove('opacity-50');
    }

    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Additional Helper Methods
    getCSRFToken() {
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    }

    setupEventListeners() {
        const addTaskForm = document.getElementById('add-task-form');
        if (addTaskForm) {
            addTaskForm.addEventListener('submit', this.handleAddTask.bind(this));
        }
    }

    // Enhanced Drag and Drop to handle task status and timing
    handleDrop(e) {
        e.preventDefault();
        try {
            const taskId = parseInt(e.dataTransfer.getData('text/plain').replace('task-', ''));
            const targetColumn = e.currentTarget;
            const newStatus = targetColumn.id.replace('-column', '');

            const task = this.tasks.find(t => t.id === taskId);
            if (!task) return;

            // Actualizar estado y tiempo
            const updateData = {
                status: newStatus,
                diasRestantes: task.diasRestantes,
                fechaInicio: newStatus === 'doing' ? new Date() : task.fechaInicio
            };

            // Manejar el contador según el estado
            if (newStatus === 'doing') {
                task.iniciarContadorDias();
            } else {
                task.detenerContador();
            }

            this.updateTask(taskId, updateData)
                .catch(error => {
                    console.error('Error en handleDrop:', error);
                    // Revertir cambios visuales si hay error
                    this.renderTasks();
                });
        } catch (error) {
            console.error('Error en handleDrop:', error);
        }
    }

    // Método para sincronizar todas las tareas en 'doing'
    syncDoingTasks() {
        const doingTasks = this.tasks.filter(task =>
            task.status === 'doing' && task.elapsedTime > 0
        );

        if (doingTasks.length > 0) {
            const updates = doingTasks.map(task => ({
                id: task.id,
                elapsedTime: task.elapsedTime
            }));
            // Enviar actualización masiva al servidor
            fetch('/actualizar_tiempos_actividades', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': this.getCSRFToken()
                },
                body: JSON.stringify({ updates })
            })
                .then(response => response.json())
                .catch(error => console.error('Error syncing times:', error));
        }
    }
}

// Función para obtener la fecha actual en formato MySQL (YYYY-MM-DD)
function getCurrentDate() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Mes (debe ser 01-12)
    const day = currentDate.getDate().toString().padStart(2, '0'); // Día (debe ser 01-31)
    return `${year}-${month}-${day}`;
}
// Initialize the task management system
document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();

    // Cargar tareas iniciales
    window.taskManager.loadTasks().then(() => {
        // Iniciar seguimiento para tareas en 'doing'
        window.taskManager.tasks.forEach(task => {
            if (task.status === 'doing') {
                task.startTracking();
            }
        });
    });
});

// Actualizar tareas cada 1 hora
setInterval(() => {
    if (window.taskManager) {
        // Obtener el trabajador seleccionado
        const workerSelect = document.getElementById('search-task-assigned-to');
        const selectedWorkerId = workerSelect ? workerSelect.value : null;
        window.taskManager.loadTasks(selectedWorkerId);
    }
}, (0.1) * 60 * 1000); // 1 hora en milisegundos

// Sincronizar tareas cada 4 horas
setInterval(() => {
    if (window.taskManager) {
        window.taskManager.syncDoingTasks();

        // Obtener el trabajador seleccionado y actualizar la vista
        const workerSelect = document.getElementById('search-task-assigned-to');
        const selectedWorkerId = workerSelect ? workerSelect.value : null;
        window.taskManager.loadTasks(selectedWorkerId);
    }
}, 4 * 60 * 60 * 1000); // 4 horas en milisegundos (14400000 ms)

// Inicialización y actualizaciones periódicas
document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
    window.taskManager.loadTasks();
});

// Actualizar cada día a medianoche
function programarActualizacionDiaria() {
    const ahora = new Date();
    const medianoche = new Date(ahora);
    medianoche.setHours(24, 0, 0, 0);
    
    const tiempoHastaMedianoche = medianoche - ahora;
    
    setTimeout(() => {
        if (window.taskManager) {
            window.taskManager.tasks.forEach(task => {
                if (task.status === 'doing') {
                    task.actualizarDisplay();
                    task.syncWithServer();
                }
            });
        }
        // Programar la siguiente actualización
        programarActualizacionDiaria();
    }, tiempoHastaMedianoche);
}

programarActualizacionDiaria();

// Agregar esta función de utilidad global
function getCurrentLimaTime() {
    return new Date().toLocaleString('es-PE', { 
        timeZone: 'America/Lima'
    });
}