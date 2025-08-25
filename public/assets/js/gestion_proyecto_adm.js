$(document).ready(function () {
    const id_proyecto = $('#id_proyecto').val();
    const id_empresa = $('#id_empresa').val();

    obtener_trabajadores();
    function obtener_trabajadores() {
        // Obtener todos los trabajadores
        const trabajadores = [];
        document.querySelectorAll('.trabajador').forEach(input => {
            trabajadores.push(JSON.parse(input.value));
        });
        traer_datos(trabajadores);
    }

    function traer_datos(trabajadores) {
        const documento_proyecto = $('#documento_proyecto').val();
        try {
            const proyectoData = JSON.parse(documento_proyecto);
            obtener_promedio_trab(proyectoData, trabajadores);
        } catch (e) {
            console.error('Error parsing JSON:', e);
        }
    }

    function obtener_promedio_trab(proyectoData, trabajadores) {
        const tareas = [];
        document.querySelectorAll('.tarea').forEach(input => {
            tareas.push(JSON.parse(input.value));
        });
        console.log(tareas);
        const tareasAgrupadas = obtener_promedio_porcentaje(tareas);
        cargarGantt(proyectoData, trabajadores, tareasAgrupadas);

        // const funcion = 'revisar_tareas_trabajador';
        // const id_proyecto = $('#id_proyecto').val();
        // $.post('../Controlador/tareas_trabajadorControlador.php', { funcion, id_proyecto }, (response) => {
        //     //console.log(response);
        //     const tareasCache = JSON.parse(response);
        //     const tareasAgrupadas = obtener_promedio_porcentaje(tareasCache);

        // });
    }

    function obtener_promedio_porcentaje(tareas) {
        const tareasAgrupadas = {};
        tareas.forEach(tarea => {
            const key = `${tarea.nombre_tarea.toLowerCase()}_${tarea.id_proyectos}`;
            if (!tareasAgrupadas[key]) {
                tareasAgrupadas[key] = {
                    nombre: tarea.nombre_tarea,
                    id_proyectos: tarea.id_proyectos,
                    sumPorcentaje: 0,
                    count: 0,
                    dia_laborado: tarea.diasubido
                };
            }
            // Limitar el porcentaje a 100 si es mayor
            const porcentaje = parseInt(tarea.porcentaje_tarea);
            tareasAgrupadas[key].sumPorcentaje += porcentaje > 100 ? 100 : porcentaje;
            tareasAgrupadas[key].count += 1;
        });
    
        return Object.values(tareasAgrupadas);
    }
    
    //diagrama de GANTT
    function cargarGantt(data, trabajadores, tareasAgrupadas) {
        const id_proyecto = $('#id_proyecto').val();
        gantt.config.xml_date = "%d-%m-%Y %H:%i";
        gantt.i18n.setLocale("es");
        gantt.init("gantt_here");

        function updatePorcValues() {
            gantt.eachTask(function (task) {
                if (gantt.hasChild(task.id)) { // If the task has children
                    var children = gantt.getChildren(task.id); // Get the children
                    var childPorc = (task.porc / children.length).toFixed(2); // Calculate the child 'porc' value

                    children.forEach(function (childId) {
                        var child = gantt.getTask(childId);
                        child.porc = childPorc; // Assign the calculated 'porc' value to each child
                    });
                }
            });
        }

        gantt.attachEvent("onParse", function () {
            updatePorcValues(); // Update the 'porc' values after parsing
        });

        gantt.attachEvent("onAfterTaskUpdate", function (id, item) {
            updatePorcValues(); // Update the 'porc' values after a task is updated
            gantt.refreshData(); // Refresh the data to display the new values
        });

        function updateSubTotalValues(task) {
            var sum = 0;
            gantt.eachTask(function (child) {
                if (child.parent == task.id) {
                    if (gantt.hasChild(child.id)) { // Si el hijo tiene sus propios hijos
                        sum += Number(updateSubTotalValues(child)); // Llamada recursiva para actualizar los subtotales de los subhijos
                    } else {
                        sum += Number(child.sub_total); // Suma los valores de 'sub_total' de los hijos
                    }
                }
            });
            task.sub_total = sum.toFixed(2); // Asigna la suma redondeada a dos decimales al valor 'sub_total' del encabezado o sub-encabezado
            return task.sub_total;
        }

        gantt.attachEvent("onParse", function () {
            gantt.eachTask(function (task) {
                if (gantt.hasChild(task.id)) { // Si el encabezado tiene hijos
                    task.sub_total = updateSubTotalValues(task); // Actualiza los subtotales de los encabezados
                }
            });
        });

        gantt.attachEvent("onAfterTaskUpdate", function (id, item) {
            gantt.eachTask(function (task) {
                if (gantt.hasChild(task.id)) { // Si el encabezado tiene hijos
                    task.sub_total = updateSubTotalValues(task); // Actualiza los subtotales de los encabezados
                }
            });
            gantt.refreshData(); // Refresca los datos para mostrar los nuevos valores
        });

        //Listado de los Usuarios y los Trabajadores junto a sus tareas Realizadas
        const usuarios = trabajadores.map(trabajador => ({
            key: trabajador.id,
            label: trabajador.name
        }));

        console.log(tareasAgrupadas);

        const tareas = tareasAgrupadas.map(tareaAgrupada => ({
            tarea_trabajadas: tareaAgrupada.nombre,
            dias_laborables: tareaAgrupada.count,
            promedio_laboral: tareaAgrupada.sumPorcentaje / tareaAgrupada.count, // Asegúrate de que esto sea válido
        }));

        gantt.locale.labels.column_user = gantt.locale.labels.section_user = "Trabajador";
        gantt.locale.labels.column_porc = gantt.locale.labels.section_porc = "Porcentaje por Item";
        gantt.config.columns = [
            { name: "text", tree: true, label: "Proyecto", width: "*", min_width: 120, resize: true },
            {
                name: "user", width: 70, label: "Usuario", align: "center", resize: true, template: function (task) {
                    var result = "";
                    var user = task.usuario;
                    if (!user)
                        return "";
                    if (user.length === 1) {
                        return byId(gantt.serverList("user", usuarios), user[0]);
                    }
                    user.forEach(function (element) {
                        var usuario = byId(gantt.serverList("user", usuarios), element);
                        result += "<div class='owner-label' title='" + usuario + "'>" + usuario.substr(0, 1) + "</div>";
                    });
                    return result;
                }
            },
            { name: "porc", label: "% item", width: "*", min_width: 60, resize: true },
            { name: "sub_total", label: "% Real", width: "*", min_width: 60, resize: true },
            { name: "total", label: "% Completado", width: "*", min_width: 60, resize: true },
            { name: "retraso", label: "Días Atrasados", width: "*", min_width: 60, resize: true },
            // { name: "retraso", label: "Días Atrasados", width: "*", min_width: 20, resize: true },
            { name: "start_date", align: "center", resize: true },
            { name: "duration", align: "center", width: 70, resize: true },
            { name: "add", width: 44 }
        ];

        const tasks = data.data.map(item => {

            const plazoFinalTarea = item.duration;
            let diasTrabajdosAtrazados = 0;
            // Función para eliminar números de una cadena
            const eliminarNumeros = (cadena) => cadena.replace(/[\d.]+/g, '');

            // Asegúrate de que tareasAgrupadas sea un array antes de mapear
            const tareas = Array.isArray(tareasAgrupadas)
                ? tareasAgrupadas.map(tareaAgrupada => ({
                    tarea_trabajadas: tareaAgrupada.nombre,
                    dias_laborables: tareaAgrupada.count,
                    promedio_laboral: tareaAgrupada.sumPorcentaje / tareaAgrupada.count,
                }))
                : [];

            const tareaAgrupada = tareas.find(t => item.text.includes(t.tarea_trabajadas));

            const diasTrabReal = tareaAgrupada ? tareaAgrupada.dias_laborables : 0;

            const avanceTotalPorcentajes = tareaAgrupada ? tareaAgrupada.promedio_laboral / 100 : 0;

            const avanceProgramadoTotal = (diasTrabReal * 1) / plazoFinalTarea;

            //porcentaje sumas
            const porcentaje_completado = tareaAgrupada ? tareaAgrupada.promedio_laboral : 0; //sumas del total
            const Porcentaje = parseFloat(item.porc) || 0;
            let avances_secction_por = 0;

            if (!item.parent) {
                const subItemsSeccion = data.data.filter(subItem => subItem.parent === item.id);

                const sumaPorcentajesSubItems = subItemsSeccion.reduce((total, subItem) => {
                    if (subItem.text !== item.text) { // Evitar sumar la sección misma
                        return total + (parseFloat(subItem.porc) || 0);
                    }
                    return total;
                }, 0);
                avances_secction_por = sumaPorcentajesSubItems / subItemsSeccion.length;
            }

            if ((avanceProgramadoTotal - avanceTotalPorcentajes) * plazoFinalTarea > 0) {
                diasTrabajdosAtrazados = Math.ceil((avanceProgramadoTotal - avanceTotalPorcentajes) * plazoFinalTarea);
                //console.log(diasTrabajdosAtrazados);
            } else {
                diasTrabajdosAtrazados = 0;
            }
            //const porcentaje_real = ((Porcentaje * 100) * (porcentaje_completado / 100) / 100);
            const porcentaje_real = ((Porcentaje * 100) * (porcentaje_completado / 100) / 100).toFixed(2);

            return {
                id: item.id,
                text: item.text,
                start_date: item.start_date,
                usuario: item.usuario,
                porc: Porcentaje,
                sub_total: porcentaje_real,
                total: porcentaje_completado,
                // retraso: diasTrabajdosAtrazados, // Mostrar el porcentaje transcurrido en lugar del original
                retraso: diasTrabajdosAtrazados,
                duration: item.duration,
                progress: diasTrabajdosAtrazados,
                open: item.open,
                end_date: item.end_date,
                parent: item.parent,
                priority: item.priority,
                stage: item.stage,
            };
        });

        const sumaPorcentajesReales = tasks.reduce((total, task) => {
            const porcentajeReal = parseFloat(task.sub_total) || 0; // si es NaN, usar 0
            return total + porcentajeReal;
        }, 0);

        // Verifica si la suma es un número válido
        if (!isNaN(sumaPorcentajesReales)) {
            // Redondea hacia arriba solo si el valor decimal es mayor o igual a 0.5
            const sumaRedondeada = Math.floor(sumaPorcentajesReales + 0.5);

            // Actualiza el elemento HTML con el nuevo porcentaje redondeado y el color correspondiente
            const porcentajeElement = document.getElementById('procentaje_Total');

            let colorClass = '';
            let estadoProceso = '';

            if (sumaRedondeada >= 0 && sumaRedondeada <= 30) {
                colorClass = 'bg-red-500 text-white'; // Color rojo
                estadoProceso = 'Empezando';
            } else if (sumaRedondeada >= 31 && sumaRedondeada <= 89) {
                colorClass = 'bg-yellow-500 text-white'; // Color amarillo
                estadoProceso = 'En proceso';
            } else if (sumaRedondeada >= 90 && sumaRedondeada <= 100) {
                colorClass = 'bg-green-500 text-white'; // Color verde
                estadoProceso = 'Terminado';
            } else {
                console.error("Porcentaje fuera de rango");
            }

            //porcentajeElement.innerHTML = `<span class="badge ${colorClass}">el Proyecto esta ${estadoProceso} con el ${sumaRedondeada}%</span>`;
            porcentajeElement.innerHTML = `
                <span class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${colorClass}">
                    El proyecto está ${estadoProceso} con el ${sumaRedondeada}%
                </span>
            `;
            // Llama a la función para actualizar los porcentajes en la base de datos
            const id_proyectos = id_proyecto; // Reemplaza esto con tu lógica para obtener el ID del proyecto
            actualizarPorcentajesEnBaseDeDatos(id_proyectos, sumaRedondeada);
        } else {
            console.error("Error al calcular la suma de porcentajes reales");
        }

        const links = data.links || [];


        gantt.config.lightbox.sections = [
            { name: "description", height: 38, map_to: "text", type: "textarea", focus: true },
            {
                name: "user",
                type: "checkbox",
                map_to: "usuario",
                options: gantt.serverList("user", usuarios),
                height: "auto",
                vertical: true
            },
            { name: "porc", height: 38, map_to: "porc", type: "textarea", focus: true },
            { name: "time", type: "duration", map_to: "auto" },
        ];

        gantt.config.lightbox.sections.forEach(section => {
            section.map_to = section.map_to || "auto";
        });

        gantt.templates.task_class = function (start, end, task) {
            return task.retraso > 0 ? "task-retraso" : "";
        };

        gantt.parse({
            data: tasks,
            links: links
        });

        gantt.locale.labels["gantt_save_btn"] = "Guardar";
        gantt.locale.labels["gantt_cancel_btn"] = "Cancelar";
        //gantt.locale.labels["botton_subir_btn"] = "Agregar Tarea";

        // Variable de control para evitar múltiples clics
        let isButtonClicked = false;

        // Agregar un evento al hacer clic en un botón en la luz emergente del Gantt
        gantt.attachEvent("onLightboxButton", function (button_id, node, e) {
            if (button_id === "botton_subir_btn") {
                // Verificar si el botón ha sido clickeado previamente
                if (!isButtonClicked) {
                    // Marcar el botón como clickeado
                    isButtonClicked = true;
                    // Deshabilitar el botón
                    node.disabled = true;

                    // Obtener la tarea seleccionada en el Gantt
                    const selectedTaskId = gantt.getSelectedId();

                    if (selectedTaskId) {
                        const task = gantt.getTask(selectedTaskId);

                        // Obtener los IDs de los usuarios seleccionados
                        const selectedUserCheckboxes = document.querySelectorAll("input[name=user]:checked");
                        const id_trabajadores = Array.from(selectedUserCheckboxes).map(checkbox => checkbox.value);

                        if (id_trabajadores.length > 0) {

                            // Función para convertir fecha a formato MySQL
                            function toMySQLFormat(date) {
                                return window.moment(date).utcOffset('-0500').format('YYYY-MM-DD HH:mm:ss');
                            }

                            // Construir la fecha de inicio con hora a las 8:00 AM
                            const start_date = new Date(task.start_date);
                            start_date.setHours(8, 0, 0);

                            // Construir la fecha de finalización con hora a las 19:30 PM si hay una fecha de finalización
                            let end_date = null;
                            if (task.end_date) {
                                end_date = new Date(task.end_date);
                                end_date.setHours(19, 30, 0);

                                // Reducir un día a la fecha de finalización
                                end_date.setTime(end_date.getTime() - (24 * 60 * 60 * 1000));
                            }

                            // Convertir las fechas al formato deseado
                            const formattedStartDate = toMySQLFormat(start_date);
                            const formattedEndDate = end_date ? toMySQLFormat(end_date) : null;
                            //console.log(formattedStartDate);
                            //console.log(formattedEndDate);


                            // Simular el envío de datos a la base de datos
                            // enviarDatosALaBaseDeDatos(id_trabajadores, task.text, formattedStartDate, formattedEndDate)
                            //     .then(() => {
                            //         // Reiniciar la variable de control después de un tiempo
                            //         isButtonClicked = false;
                            //         // Habilitar el botón
                            //         node.disabled = false;
                            //     })
                            //     .catch(error => {
                            //         console.error("Error al enviar datos a la base de datos:", error);
                            //         // Habilitar el botón en caso de error
                            //         isButtonClicked = false;
                            //         node.disabled = false;
                            //     });

                            return true;
                        } else {
                            alert("Debes seleccionar al menos un usuario antes de cargar el calendario.");
                        }
                    }
                } else {
                    alert("Por favor espera a que termine el proceso anterior.");
                }
            }
        });

        /*gantt.attachEvent("onLightboxButton", function (button_id, node, e) {

            if (button_id === "botton_subir_btn") {
                const selectedTaskId = gantt.getSelectedId();

                if (selectedTaskId) {
                    const task = gantt.getTask(selectedTaskId);

                    // Obtener los IDs de los usuarios seleccionados
                    const selectedUserCheckboxes = document.querySelectorAll("input[name=user]:checked");
                    const id_trabajadores = Array.from(selectedUserCheckboxes).map(checkbox => checkbox.value);

                    if (id_trabajadores.length > 0) {
                        // Construir la fecha de inicio con hora a las 8:00 AM
                        const start_date = new Date(task.start_date);
                        start_date.setHours(8, 0, 0);

                        // Construir la fecha de finalización con hora a las 10:00 PM si hay una fecha de finalización
                        let end_date = null;
                        if (task.end_date) {
                            end_date = new Date(task.end_date);
                            end_date.setHours(22, 0, 0);

                            // Reducir un día a la fecha de finalización
                            end_date.setTime(end_date.getTime() - (24 * 60 * 60 * 1000));
                        }

                        // Convertir las fechas al formato deseado
                        const formattedStartDate = start_date.toLocaleString('es-PE', { timeZone: 'America/Lima' });
                        const formattedEndDate = end_date ? end_date.toLocaleString('es-PE', { timeZone: 'America/Lima' }) : null;
                        console.log(formattedEndDate);

                        for (const id_trabajador of id_trabajadores) {
                            enviarDatosALaBaseDeDatos(id_trabajador, task.text, formattedStartDate, formattedEndDate);
                        }

                        return true;
                    } else {
                        alert("Debes seleccionar al menos un usuario antes de cargar el calendario.");
                    }

                }
            }
        });*/

    }

    function byId(list, id) {
        for (var i = 0; i < list.length; i++) {
            if (list[i].key == id)
                return list[i].label || "";
        }
        return "";
    }

    function actualizarPorcentajesEnBaseDeDatos(id_proyectos, nuevoPorcentaje) {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/proyecto/actualizar', true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

        const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
        xhr.setRequestHeader('X-CSRF-TOKEN', token);

        const datos = `id_proyecto=${id_proyectos}&porcentaje_total=${nuevoPorcentaje}`;

        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    console.log('Respuesta del servidor:', response);
                } catch (e) {
                    console.error('Error al parsear la respuesta:', e);
                }
            } else {
                console.error('Error al actualizar porcentajes en la base de datos. Estado:', xhr.status);
                console.log('Respuesta del servidor:', xhr.responseText); // Agrega esto
            }
        };
        xhr.onerror = function () {
            console.error('Error en la conexión');
        };
        xhr.send(datos);
    }

    $('#guardar_dat').on('click', function () {
        const id_proyecto = $('#id_proyecto').val();
        const plazo_total_pro = $('#plazo_total').val(); // Plazo total
        var tasksData = gantt.serialize();
        const data = JSON.stringify(tasksData);
        const documento_proyecto = data; // Asegúrate de tener este campo en tu HTML
        
        console.log(documento_proyecto);
        // Obtener el token CSRF
        const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    
        $.ajax({
            url: '/proyecto/actualizardata',
            method: 'POST',
            data: {
                id_proyecto,
                plazo_total_pro,
                documento_proyecto,
                _token: token // Incluye el token CSRF aquí
            },
            success: function (response) {
                Swal.fire({
                    position: "center",
                    icon: "success",
                    title: "El diagrama fue guardado con éxito",
                    showConfirmButton: false,
                    timer: 1500
                });
            },
            error: function (error) {
                console.error('Error al intentar guardar los datos:', error.responseText);
                alert('Error al intentar guardar los datos');
            }
        });
    });
    
});