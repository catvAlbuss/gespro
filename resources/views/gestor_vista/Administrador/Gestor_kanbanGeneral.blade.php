<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Gestor Planner General') }}
        </h2>
    </x-slot>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    @php
        $permisos = auth()->user()->roles->first()->permissions;
    @endphp
    
    @foreach ($eventkbs as $eventkb)
        <input type="hidden" class="eventosKanban" value="{{ json_encode($eventkb) }}">
    @endforeach

    <input type="hidden" class="listTrab" id="id_empresa" value="{{ $empresaId }}">

    <input type="hidden" class="listTrab" id="trabajadores" value="{{ json_encode($usuarios) }}">

    <input type="hidden" class="listproyectos" id="proyectos" value="{{ json_encode($proyectos) }}">

    <input type="hidden" name="rolUser" id="rolUser"
        value="{{$permisos->pluck('name')->contains('Administrador') || $permisos->pluck('name')->contains('Administrativo') ? 'true' : 'false' }}">

    <!-- Modal -->
    <div id="myModal" class="modal hidden fixed w-full h-full top-0 left-0 flex items-center justify-center">
        <div class="modal-overlay absolute w-full h-full bg-gray-900 opacity-50"></div>
        <div class="modal-container bg-white w-11/12 md:max-w-md mx-auto rounded shadow-lg z-50 overflow-y-auto">
            <!-- Add margin if you want to see some of the overlay behind the modal-->
            <div class="modal-content py-4 text-left px-6">
                <!--Title-->
                <div class="flex justify-between items-center pb-3">
                    <p class="text-center text-2xl font-bold">Crear Tarjeta</p>
                    <div id="close-modal" class="modal-close cursor-pointer z-50"></div>
                </div>
                <!--Body-->
                <div class="my-5">
                    <input id="titulo" type="text" placeholder="Titulo"
                        class="w-full border p-2 mb-2 rounded text-center">
                    <textarea id="descripcion" placeholder="Descripcion" class="w-full border p-2 mb-2 rounded text-center"></textarea>
                    <input id="fecha" type="date" value="Fecha"
                        class="w-full border p-2 mb-2 rounded text-center">
                    <input id="monto" type="number" value="100.00"
                        class="w-full border p-2 mb-2 rounded text-center" step="any">
                    <select id="personal" class="w-full border p-2 mb-2 rounded text-center"></select>
                    <select id="proyectoscreate" class="w-full border p-2 mb-2 rounded text-center"></select>
                    <input type="color" id="color" value="#ff0000">
                </div>
                <!--Footer-->
                <div class="flex justify-between pt-2">
                    <button id="close-modal-btn" class="px-4 bg-red-500 p-2 text-white rounded">Cerrar</button>
                    <button id="crear-tarjeta" class="px-4 bg-green-500 p-2 text-white rounded">Crear</button>
                </div>
            </div>
        </div>
    </div>

    <div id="modal" class="modal hidden fixed w-full h-full top-0 left-0 flex items-center justify-center">
        <div class="bg-white p-8 rounded">
            <h2 class="text-2xl text-center font-bold mb-4">Editar Tarjeta</h2>
            <div class="my-5">
                <input type="hidden" id="tarjetaId">
                <input id="edit-titulo" type="text" placeholder="T铆tulo"
                    class="w-full border p-2 mb-2 rounded text-center">
                <textarea id="edit-descripcion" placeholder="Descripci贸n" class="w-full border p-2 mb-2 rounded text-center"></textarea>
                <input id="edit-fecha" type="date" class="w-full border p-2 mb-2 rounded text-center">
                <input id="edit-monto" type="number" value="100.00" class="w-full border p-2 mb-2 rounded text-center"
                    step="any">
                <select id="edit-personal" class="w-full border p-2 mb-2 rounded text-center"></select>
                <select id="edit-proyectos" class="w-full border p-2 mb-2 rounded text-center"></select>
                <input type="color" id="edit-color">
            </div>
            <!--Footer-->
            <div class="flex justify-between pt-2">
                <button id="close_modal_edit"
                    class="px-4 bg-red-500 p-2 text-white rounded focus:outline-none focus:shadow-outline">Cerrar</button>
                <button id="close_modal_eliminar"
                    class="px-4 bg-red-500 p-2 text-white rounded focus:outline-none focus:shadow-outline">Eliminar</button>
                <button id="editar-tarjeta"
                    class="px-4 bg-green-500 p-2 text-white rounded focus:outline-none focus:shadow-outline">Editar</button>
            </div>
        </div>
    </div>

    <div class="py-6">
        <div class="w-full mx-auto sm:px-2 lg:px-2">
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-gray-900 dark:text-gray-100">
                    <div class="flex flex-row justify-center">
                        <div>
                            <button id="pre-month-btn"
                                class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l">
                                Mes Anterior
                            </button>
                        </div>
                        <div>
                            <h3 id="current-month"
                                class="text-base font-semibold text-gray-800 dark:text-gray-200 py-2 px-4 mb-4">Abril
                                2024</h3>
                        </div>
                        <div>
                            <button id="next-month-btn"
                                class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r">
                                Siguiente Mes
                            </button>
                        </div>
                    </div>

                    <div class="overflow-auto">
                        <table class="w-full border-collapse border border-blue-500  mt-1 mx-auto">
                            <thead>
                                <tr class="text-center bg-blue-500 text-white">
                                    <th>Personal / Semana <br><button id="crear-card-btn"
                                            class="bg-green-500 text-white px-4 py-2 rounded"><i
                                                class="ri-file-add-line"></i> Crear
                                            Tarjeta</button></th>
                                    <th>Semana 1</th>
                                    <th>Semana 2</th>
                                    <th>Semana 3</th>
                                    <th>Semana 4</th>
                                </tr>
                            </thead>
                            <tbody class="text-center" id="listTrabKan"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <script>
        document.addEventListener("DOMContentLoaded", () => {
            const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre',
                'Octubre', 'Noviembre', 'Diciembre'
            ];
            let currentMonthIndex = new Date().getMonth();
            let currentYear = new Date().getFullYear();
            const currentMonthElement = document.getElementById('current-month');
            const nextMonthBtn = document.getElementById('next-month-btn');
            const preMonthBtn = document.getElementById('pre-month-btn');

            // Función para actualizar el texto del mes y año
            function actualizarMesYAnio() {
                currentMonthElement.textContent = `${meses[currentMonthIndex]} ${currentYear}`;
                currentMonthElement.style.fontSize = '25px';
                currentMonthElement.style.fontWeight = 'bold';
            }

            // Eventos click para cambiar de mes
            nextMonthBtn.addEventListener('click', () => {
                siguienteMes();
            });

            preMonthBtn.addEventListener('click', () => {
                mesAnterior();
            });

            // Iniciar con el mes y año actual
            actualizarMesYAnio();
            // Función para limpiar las tarjetas de las semanas
            function limpiarTarjetas() {
                const semanas = document.querySelectorAll('.semana');
                semanas.forEach(semana => {
                    semana.innerHTML = '';
                });
            }
            // Función para abrir el modal al hacer clic en el botón "Crear Tarjeta"
            const crearCardBtn = document.getElementById('crear-card-btn');
            const modal = document.getElementById('myModal');
            const closeModal = document.getElementById('close-modal');
            const crearTarjetaBtn = document.getElementById('crear-tarjeta');
            const closeModalBtn = document.getElementById('close-modal-btn');
            // Get reference to the edit modal and the button to close the edit modal
            const modalEdit = document.getElementById('modal');
            const closeModalBtnEdit = document.getElementById('close_modal_edit');

            Lista_trab_reports();
            obtener_proyectos();
            obtenerFichasKanban();
            const trabajadoresData = {}; // Objeto global para almacenar trabajadores

            function Lista_trab_reports() {
                const response = document.getElementById('trabajadores').value;
                const permisos_user = document.getElementById('rolUser').value; // Permiso del usuario
                const Listar_trabs = JSON.parse(response);
                
                let tableRows = '';
                let selectOptions = '';
                let selectOptionsEdit = '';
                
                // Lista de usuarios que deben ocultarse si el permiso es false
                const usuariosExcluidos = ["ANDREA ALEXANDRA", "FERNANDO PIERO", "CESAR RICARDO"];
                
                Listar_trabs.forEach(Listar_trab => {
                    const idTrabajador = Listar_trab.id;
                    const nombreTrabajador = Listar_trab.name;
                
                    // Si el permiso es false, excluimos los usuarios especificados
                    if (permisos_user === "false" && usuariosExcluidos.includes(nombreTrabajador)) {
                        return; // Salta a la siguiente iteración
                    }
                
                    // Construcción de filas de la tabla
                    tableRows += `
                        <tr>
                            <td class="border-solid border-2 border-sky-500">${nombreTrabajador}</td>
                            <td class="semana semana-1-list border-solid border-2 border-sky-500" data-personal="${nombreTrabajador}" data-idtrabajador="${idTrabajador}"></td>
                            <td class="semana semana-2-list border-solid border-2 border-sky-500" data-personal="${nombreTrabajador}" data-idtrabajador="${idTrabajador}"></td>
                            <td class="semana semana-3-list border-solid border-2 border-sky-500" data-personal="${nombreTrabajador}" data-idtrabajador="${idTrabajador}"></td>
                            <td class="semana semana-4-list border-solid border-2 border-sky-500" data-personal="${nombreTrabajador}" data-idtrabajador="${idTrabajador}"></td>
                        </tr>
                    `;
                
                    // Construcción de opciones de selección
                    selectOptions += `<option value="${idTrabajador}">${nombreTrabajador}</option>`;
                    selectOptionsEdit += `<option value="${idTrabajador}">${nombreTrabajador}</option>`;
                });

                // Agrega las filas al tbody
                $('#listTrabKan').html(tableRows);
                // Agrega las opciones al select
                $('#personal').append(selectOptions);
                $('#edit-personal').append(selectOptionsEdit);
            };

            function obtener_proyectos() {
                const response = document.getElementById('proyectos').value;

                try {
                    const proyectos = JSON.parse(response);
                    const selectProyectos = document.getElementById('proyectoscreate');
                    const selectProyectoEdit = document.getElementById('edit-proyectos');

                    // Limpiar los selects antes de agregar opciones nuevas
                    selectProyectos.innerHTML = '';
                    selectProyectoEdit.innerHTML = '';

                    proyectos.forEach(proyecto => {
                        // Crear una opción para cada proyecto en el select de proyectos
                        const optionProyecto = document.createElement('option');
                        optionProyecto.value = proyecto.id_proyectos;
                        optionProyecto.textContent = proyecto.nombre_proyecto;

                        // Crear una opción para cada proyecto en el select de edición de proyectos
                        const optionProyectoEdit = document.createElement('option');
                        optionProyectoEdit.value = proyecto.id_proyectos;
                        optionProyectoEdit.textContent = proyecto.nombre_proyecto;

                        // Agregar las opciones a los respectivos select
                        selectProyectos.appendChild(optionProyecto);
                        selectProyectoEdit.appendChild(optionProyectoEdit);
                    });
                } catch (error) {
                    console.error('Error al parsear el JSON:', error);
                }
            }

            function obtenerFichasKanban() {
                const inicioMes = new Date(currentYear, currentMonthIndex, 1).toISOString().split('T')[
                    0]; // Formato YYYY-MM-DD
                const finMes = new Date(currentYear, currentMonthIndex + 1, 0).toISOString().split('T')[0];

                const listTrab = document.getElementById('trabajadores').value;
                const Listar_trabs = JSON.parse(listTrab);

                // Crear un objeto para mapear ID a nombres de trabajadores
                const trabajadoresMap = {};
                Listar_trabs.forEach(({
                    id,
                    name
                }) => {
                    trabajadoresMap[id] = name;
                });

                const eventKanban = document.querySelectorAll('.eventosKanban');
                Array.from(eventKanban).forEach(input => {
                    const fichaskanban = JSON.parse(input.value);
                    const fecha = new Date(`${fichaskanban.semana_designado}T00:00:00`);
                    // Solo crear fichas para eventos que ocurran en el mes y año actual
                    if (fecha.getMonth() === currentMonthIndex && fecha.getFullYear() === currentYear) {
                        const titulo = fichaskanban.nombre_calmen;
                        const descripcion = fichaskanban.descripcion;
                        const personalIP = fichaskanban.usuario_id;
                        const idTrabajador = personalIP;
                        const personal = trabajadoresMap[idTrabajador];
                        const color = fichaskanban.color;
                        const monto = fichaskanban.monto;
                        const id_ficha = fichaskanban.id;
                        const id_proyecto = fichaskanban.proyecto_id;
                        // Verificar que el usuario_id coincide con un ID de trabajador
                        if (personal) { // Si el trabajador existe
                            // Obtener la semana correspondiente a la fecha
                            const semana = obtenerSemana(fecha, personal);
                            if (semana) { // Asegurarse de que 'semana' no es null
                                crearTarjeta(titulo, descripcion, semana, personal, color, monto, id_ficha,
                                    personalIP, id_proyecto, fecha);
                            }
                        } else {
                            console.warn(`No se encontró trabajador con ID: ${idTrabajador}`);
                        }
                    }
                });
            }

            crearCardBtn.addEventListener('click', () => {
                modal.classList.remove('hidden');
            });

            closeModal.addEventListener('click', () => {
                modal.classList.add('hidden');
            });

            // Add event listener to close the edit modal
            closeModalBtnEdit.addEventListener('click', () => {
                modalEdit.classList.add('hidden');
            });

            // Función para agregar eventos de drag and drop a las celdas de la tabla
            function agregarEventosDragAndDrop() {
                const celdasSemana = document.querySelectorAll('.semana');

                // Agregar evento dragover a todas las celdas semana
                celdasSemana.forEach(celda => {
                    celda.addEventListener('dragover', (event) => {
                        event.preventDefault();
                    });

                    celda.addEventListener('drop', (event) => {
                        event.preventDefault();
                        const tarjeta = document.getElementById(event.dataTransfer.getData(
                            'tarjeta-id'));
                        const tarjetaWeek = event.dataTransfer.getData('week');
                        const tarjetaPersonal = event.dataTransfer.getData('personal');

                        if (tarjetaWeek !== celda.dataset.semana || tarjetaPersonal !== celda
                            .dataset.personal) {
                            // Si la tarjeta no pertenece a la misma semana o persona, moverla
                            celda.appendChild(tarjeta);
                        }
                    });
                });
            }

            // Evento click para crear una nueva tarjeta
            crearTarjetaBtn.addEventListener('click', () => {
                const titulo = document.getElementById('titulo').value;
                const descripcion = document.getElementById('descripcion').value;
                const fechaInput = document.getElementById('fecha').value;
                const personalId = document.getElementById('personal').value;
                const proyectoId = document.getElementById('proyectoscreate').value;
                const color = document.getElementById('color').value;
                const monto = document.getElementById('monto').value;

                // Capturar el ID de la empresa desde la URL
                const urlParams = new URLSearchParams(window.location.search);
                const empresaId = document.getElementById('id_empresa').value;

                const data = {
                    nombre_calmen: titulo,
                    descripcion: descripcion,
                    semana_designado: fechaInput,
                    usuario_id: personalId,
                    proyecto_id: proyectoId,
                    color: color,
                    monto: monto,
                };

                $.ajax({
                    type: 'POST',
                    url: '/actividades/kanban',
                    data: data,
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                    },
                    success: function(response) {
                        if (response.status === 'success') {
                            Swal.fire({
                                icon: 'success',
                                title: '¡Éxito!',
                                text: response.message,
                            }).then(() => {
                                window.location.href = '/actividades/kanban/gestor/' + empresaId;
                            });
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: response.message,
                            });
                        }
                    },
                    error: function(xhr, status, error) {
                        console.log(xhr.responseText);
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Hubo un problema al crear la tarjeta. Por favor, inténtalo de nuevo.',
                        });
                    }
                });

                modal.classList.add('hidden');
            });

            // Agregar evento clic al botón de cerrar modal
            closeModalBtn.addEventListener('click', () => {
                modal.classList.add('hidden');
            });

            // Event listener para cerrar el modal de edición al hacer clic en el botón de cerrar
            closeModalBtnEdit.addEventListener('click', () => {
                modalEdit.classList.add('hidden');
            });

            // Función para crear una tarjeta y agregarla a la semana especificada
            function crearTarjeta(titulo, descripcion, semana, personal, color, monto, id_ficha, personalIP,
                id_proyecto,
                fecha) {
                if (!semana) {
                    console.error('No se encontró la semana correspondiente.');
                    return;
                }

                const semanaNum = semana.classList[1].split('-')[1];
                const celda = document.querySelector(
                    `.semana.semana-${semanaNum}-list[data-personal="${personal}"]`);
                if (!celda) {
                    console.error('No se encontró la celda correspondiente al trabajador seleccionado.');
                    return;
                }
                const fechaOriginal = new Date(fecha);

                const dia = fechaOriginal.getDate();
                const mes = fechaOriginal.getMonth() + 1;
                const anio = fechaOriginal.getFullYear();
                const fechaFormateada = `${dia}/${mes}/${anio}`;

                const tarjeta = document.createElement('div');
                tarjeta.classList.add('p-6', 'max-w-sm', 'mx-auto', 'bg-yellow-100', 'rounded-lg', 'shadow-md',
                    'flex', 'items-center', 'space-x-4');
                tarjeta.draggable = true;

                const contenidoTarjeta = `
                    <div class="flex-shrink-0 text-gray-950 font-bold">
                        <i class="ri-pushpin-2-fill">${monto}</i>
                    </div>
                    <div>
                        <div class="text-xl font-bold text-black">${titulo}</div>
                        <p class="text-gray-500 font-semibold">${descripcion}</p>
                        <p class="text-sm text-gray-500">Fecha: ${fechaFormateada}</p> </div>
                    </div>
                `;

                tarjeta.innerHTML = contenidoTarjeta;
                tarjeta.style.backgroundColor = color;

                const tarjetaId = id_ficha; //`tarjeta-${new Date().getTime()}`;
                tarjeta.id = tarjetaId;

                // Añadir eventos de arrastre a la tarjeta
                tarjeta.addEventListener('dragstart', (event) => {
                    event.dataTransfer.setData('text/plain', tarjeta.textContent);
                    event.dataTransfer.setData('tarjeta-id', tarjetaId);
                    event.dataTransfer.setData('week', semana.dataset.semana);
                    event.dataTransfer.setData('personal', semana.dataset.personal);
                });

                const celdas = document.querySelectorAll('.semana');

                celdas.forEach((celda) => {
                    celda.addEventListener('dragover', (event) => {
                        event.preventDefault();
                    });
                    celda.addEventListener('drop',
                        handleDropOnce); // Agregar el evento 'drop' una sola vez a la celda
                    celda.appendChild(tarjeta);
                });
                //===================EDITAR====================================//
                tarjeta.addEventListener('click', () => {
                    console.log(tarjeta);
                    // Get the data from the card
                    const tituloTarjeta = tarjeta.querySelector('.text-xl').textContent;
                    const descripcionTarjeta = tarjeta.querySelector('.text-gray-500').textContent;
                    const fechaTarjetaText = tarjeta.querySelector('.text-sm').textContent;
                   // Seleccionamos el contenido del <i> dentro de .flex-shrink-0
                   const montotarjeta = tarjeta.querySelector('.flex-shrink-0 i').textContent;
                    const tarjetaId = tarjeta.id;
                    // Remove the "Fecha: " prefix from the date text
                    const fechaSinPrefijo = fechaTarjetaText.replace('Fecha: ', '');
                    // Split the date string by '/' to extract day, month, and year
                    const [day, month, year] = fechaSinPrefijo.split('/');
                    // Format the date string to YYYY-MM-DD (required by input type="date")
                    const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                    // Get reference to the date input element of the modal
                    const modalDate = document.getElementById('edit-fecha');
                    // Set the value of the date input
                    modalDate.value = formattedDate;
                    // Get references to other input elements of the modal
                    const modalTitle = document.getElementById('edit-titulo');
                    const modalDescription = document.getElementById('edit-descripcion');
                    const modalPersonal = document.getElementById('edit-personal');
                    const modalProyecto = document.getElementById('edit-proyectos');
                    const modalTarjetaId = document.getElementById('tarjetaId');
                    const modalmonto = document.getElementById('edit-monto');

                    // Check if the modal elements were found
                    if (!modalTitle || !modalDescription || !modalPersonal || !modalProyecto || !
                        modalTarjetaId) {
                        console.error('No se encontraron todos los elementos del modal.');
                        return;
                    }

                    // Fill the edit modal with the data from the card
                    modalTitle.value = tituloTarjeta;
                    modalDescription.value = descripcionTarjeta;
                    modalPersonal.value = personalIP;
                    modalProyecto.value = id_proyecto;
                    modalTarjetaId.value = tarjetaId;
                    modalmonto.value = montotarjeta;
                    // Show the edit modal
                    const modal = document.getElementById('modal');
                    modal.classList.remove('hidden');
                });

                celda.appendChild(tarjeta);
            }

            // Función para manejar el evento 'drop' una sola vez
            function handleDropOnce(event) {
                event.preventDefault();

                const tarjetaId = event.dataTransfer.getData('tarjeta-id');
                const tarjeta = document.getElementById(tarjetaId);

                if (!tarjeta) {
                    console.error(`No se encontró la tarjeta con el ID ${tarjetaId}`);
                    return;
                }

                const nuevaSemana = event.currentTarget.classList[1];
                const semanaNum = nuevaSemana.split('-')[1];
                const nuevoPersonal = event.currentTarget.dataset.idtrabajador;

                const fechaText = tarjeta.querySelector('.text-sm').textContent.split(': ')[1];
                const fechaParts = fechaText.split('/');
                const dia = parseInt(fechaParts[0], 10);
                const mes = parseInt(fechaParts[1], 10) - 1;
                const anio = parseInt(fechaParts[2], 10);

                if (isNaN(dia) || isNaN(mes) || isNaN(anio)) {
                    console.error('La fecha no es válida:', fechaText);
                    return;
                }

                let nuevaFecha;
                if (semanaNum === '1') {
                    nuevaFecha = new Date(anio, mes, 3);
                } else if (semanaNum === '2') {
                    nuevaFecha = new Date(anio, mes, 10);
                } else if (semanaNum === '3') {
                    nuevaFecha = new Date(anio, mes, 17);
                } else {
                    nuevaFecha = new Date(anio, mes, 24);
                }

                if (isNaN(nuevaFecha.getTime())) {
                    console.error('La nueva fecha no es válida:', nuevaFecha);
                    return;
                }

                const nuevaFechaStr = nuevaFecha.toISOString().split('T')[0];
                const empresaId = document.getElementById('id_empresa').value;
                const data = {
                    semana_designado: nuevaFechaStr,
                    usuario_id: nuevoPersonal
                };

                $.ajax({
                    type: 'PUT',
                    url: '/actividades/kanban/move/' + tarjetaId,
                    data: data,
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                    },
                    success: function(response) {
                        if (response.status === 'success') {
                            if (tarjeta && event.currentTarget) {
                                event.currentTarget.appendChild(tarjeta);
                            } else {
                                if (!event.currentTarget) {
                                    console.error('El elemento que maneja el evento es null');
                                }
                            }
                            Swal.fire({
                                icon: 'success',
                                title: '¡Éxito!',
                                text: response.message,
                            }).then(() => {
                                window.location.href = '/actividades/kanban/gestor/' + empresaId;
                            });
                        } else {
                            console.error('La actualización en el servidor falló');
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: response.message,
                            });
                        }
                    },
                    error: function(xhr, status, error) {
                        console.log(xhr.responseText);
                        console.error('Error en la petición al servidor:', error);
                    }
                });

                event.currentTarget.removeEventListener('drop', handleDropOnce);
            }

            //===================EDITAR====================================//
            // Obtener referencia al botón de editar dentro del modal
            const editarTarjetaBtn = document.getElementById('editar-tarjeta');
            editarTarjetaBtn.addEventListener('click', () => {
                const titulo = document.getElementById('edit-titulo').value;
                const descripcion = document.getElementById('edit-descripcion').value;
                const fecha = document.getElementById('edit-fecha').value;
                const personal = document.getElementById('edit-personal').value;
                const proyecto = document.getElementById('edit-proyectos').value;
                const modalTarjetaId = document.getElementById('tarjetaId');
                const color = document.getElementById('edit-color').value;
                const monto = document.getElementById('edit-monto').value;

                const tarjetaId = modalTarjetaId.value;

                // Capturar el ID de la empresa desde la URL
                const urlParams = new URLSearchParams(window.location.search);
                const empresaId = document.getElementById('id_empresa').value;
                const data = {
                    nombre_calmen: titulo,
                    descripcion: descripcion,
                    semana_designado: fecha,
                    usuario_id: personal,
                    proyecto_id: proyecto,
                    color: color,
                    monto: monto,
                };
                $.ajax({
                    type: 'PUT',
                    url: '/actividades/kanban/' + tarjetaId,
                    data: data,
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                    },
                    success: function(response) {
                        if (response.status === 'success') {
                            Swal.fire({
                                icon: 'success',
                                title: '¡Éxito!',
                                text: response.message,
                            }).then(() => {
                                window.location.href = '/actividades/kanban/gestor/' + empresaId;
                            });
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: response.message,
                            });
                        }
                    },
                    error: function(xhr, status, error) {
                        console.log(xhr.responseText);
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Hubo un problema al editar la ficha. Por favor, inténtalo de nuevo.',
                        });
                    }
                });

                modalEdit.classList.add('hidden');
            });

            //========================ELIMINAR==============================//
            const eliminarTarjetaBtn = document.getElementById('close_modal_eliminar');

            eliminarTarjetaBtn.addEventListener('click', () => {
                Swal.fire({
                    title: '¿Estás seguro?',
                    text: 'Una vez eliminada, no podrás recuperar esta ficha.',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Sí, eliminar',
                    cancelButtonText: 'Cancelar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        const modalTarjetaId = document.getElementById('tarjetaId');
                        const tarjetaId = modalTarjetaId.value;
                        const empresaId = document.getElementById('id_empresa').value;
                        $.ajax({
                            type: 'DELETE',
                            url: '/actividades/kanban/' + tarjetaId,
                            headers: {
                                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                            },
                            success: function(response) {
                                if (response.status === 'success') {
                                    Swal.fire({
                                        icon: 'success',
                                        title: '¡Éxito!',
                                        text: response.message,
                                    }).then(() => {
                                        window.location.href =
                                            '/actividades/kanban/gestor/' + empresaId;
                                    });
                                    modalEdit.classList.add('hidden');
                                } else {
                                    Swal.fire(
                                        'Error',
                                        'Hubo un problema al eliminar la ficha. Por favor, inténtalo de nuevo.',
                                        'error'
                                    );
                                }
                            },
                            error: function(xhr, status, error) {
                                console.log(xhr.responseText);
                                Swal.fire(
                                    'Error',
                                    'Hubo un problema al eliminar la ficha. Por favor, inténtalo de nuevo.',
                                    'error'
                                );
                            }
                        });
                    }
                });
            });

            function limiarEntradas() {
                document.getElementById('titulo').value = '';
                document.getElementById('descripcion').value = '';
                document.getElementById('fecha').value = '';
                document.getElementById('personal').selectedIndex = 0; // Seleccione la primera opción por defecto
                document.getElementById('proyectos').selectedIndex = 0;
            }

            function actualizarInterfaz() {
                actualizarMesYAnio();
                limpiarTarjetas();
                obtenerFichasKanban();
            }

            function obtenerSemana(fecha, personal) {
                // Ajustar la zona horaria a UTC para evitar discrepancias
                const fechaUTC = new Date(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate());

                const dia = fechaUTC.getUTCDate();
                let semana;

                // Determinar la semana según el día del mes
                if (dia >= 1 && dia <= 7) {
                    semana = document.querySelector(`.semana.semana-1-list[data-personal="${personal}"]`);
                } else if (dia <= 14) {
                    semana = document.querySelector(`.semana.semana-2-list[data-personal="${personal}"]`);
                } else if (dia <= 21) {
                    semana = document.querySelector(`.semana.semana-3-list[data-personal="${personal}"]`);
                } else {
                    semana = document.querySelector(`.semana.semana-4-list[data-personal="${personal}"]`);
                }

                return semana;
            }

            function siguienteMes() {
                currentMonthIndex = (currentMonthIndex + 1) % meses.length;
                if (currentMonthIndex === 0) {
                    currentYear++; // Avanza al siguiente año si el mes es enero
                }
                actualizarMesYAnio();
                limpiarTarjetas();
                obtenerFichasKanban();
            }

            function mesAnterior() {
                currentMonthIndex = (currentMonthIndex - 1 + meses.length) % meses.length;
                if (currentMonthIndex === 11) {
                    currentYear--; // Retrocede al año anterior si el mes es diciembre
                }
                actualizarMesYAnio();
                limpiarTarjetas();
                obtenerFichasKanban();
            }
        })
    </script>
</x-app-layout>
