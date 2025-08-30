<x-app-layout>
    <x-slot name="header">
        @if (Auth::check())
            <input type="hidden" id="trabajador_id" value="{{ Auth::user()->id }}">
            <input type="hidden" id="nombre_trab" value="{{ Auth::user()->name }}">
            <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                Bienvenido {{ Auth::user()->name }} {{ Auth::user()->surname }}
            </h2>
        @endif

        <div class="flex items-center justify-end -mt-8">
            <!--<button id="marcar-asistencia" type="button" class="m-1 ms-0 relative py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50">Marcar Asistencia
            </button>-->

            <button id="open-asistencia" type="button"
                class="m-1 ms-0 relative py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50">
                Asistencias
            </button>

            <button id="abrir-tareas-trab" type="button"
                class="m-1 ms-0 relative py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50">
                Tareas
                <span class="flex absolute top-0 end-0 -mt-2 -me-2">
                    <span class="animate-ping absolute inline-flex size-full rounded-full bg-red-400 opacity-75"></span>
                    <span id="contador-tareas"
                        class="relative inline-flex text-xs bg-red-500 text-white rounded-full py-0.5 px-1.5">
                        0
                    </span>
                </span>
            </button>

            <button id="abrir_equipamiento" type="button"
                class="m-1 ms-0 relative py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50">Equipos
                Entregado
                <span class="flex absolute top-0 end-0 -mt-2 -me-2">
                    <span class="animate-ping absolute inline-flex size-full rounded-full bg-red-400 opacity-75"></span>
                </span>
            </button>
        </div>
    </x-slot>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <link rel="stylesheet" href="{{ asset('assets/dist/event-calendar.css') }}" />

    <link rel="stylesheet" href="https://cdn.dhtmlx.com/fonts/wxi/wx-icons.css" />

    <link rel="stylesheet" href="{{ asset('assets/demos.css') }}" />

    <script src="{{ asset('assets/dist/event-calendar.js') }}"></script>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/date-fns/2.0.0-alpha0/date_fns.min.js"
        integrity="sha512-0kon+2zxkK5yhflwFqaTaIhLVDKGVH0YH/jm8P8Bab/4EOgC/n7gWyy7WE4EXrfPOVDeNdaebiAng0nsfeFd9A=="
        crossorigin="anonymous" referrerpolicy="no-referrer"></script>

    <script src="https://unpkg.com/html5-qrcode@2.0.9/dist/html5-qrcode.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Imprimir el id de la empresa -->
    @if ($empresaId)
        <div class="mt-4">
            <input type="hidden" id="empresaId" value="{{ $empresaId }}">
        </div>
    @else
        <div class="mt-4">
            <p>No hay empresa asociada.</p>
        </div>
    @endif

    <style>
        /* Estilo para asegurar que los modales estén al frente */
        #modalBienvenida,
        #modalAsistencia,
        #modalMarcarAsistencia,
        #modalTareas,
        #modalValesEquipamiento{
            z-index: 50;
            /* Asegúrate de que estén al frente */
        }
    </style>

    <!-- Modal -->
    <div id="modalBienvenida" class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 hidden">
        <div id="alert-additional-content-1"
            class="p-4 mb-4 text-blue-800 border border-blue-300 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-800 shadow-lg"
            role="alert">
            <div class="flex items-center text-center">
                <svg class="flex-shrink-0 w-4 h-4 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor" viewBox="0 0 20 20">
                    <path
                        d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                </svg>
                <span class="sr-only text-center">Bienvenid@s</span>
                <h3 class="text-lg font-medium text-center">¡Bienvenido a nuestra aplicación Gespro!</h3>
            </div>
            <div class="mt-2 mb-4 text-lg text-center">
                ¡Hola {{ Auth::user()->name }} {{ Auth::user()->surname }}! <br> Estamos encantados de tenerlos aquí.
                Si tienen alguna pregunta, no duden en preguntar.
            </div>
            <div class="flex items-center justify-end mt-8">
                <button id="dismiss-button" type="button"
                    class="text-blue-800 bg-transparent border border-blue-800 hover:bg-blue-900 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-200 font-medium rounded-lg text-xs px-3 py-1.5 text-center dark:hover:bg-blue-600 dark:border-blue-600 dark:text-blue-400 dark:hover:text-white dark:focus:ring-blue-800"
                    aria-label="Close">
                    cerrar
                </button>
            </div>
        </div>
    </div>

    <!-- Modal de Asistencia -->
    <div id="modalAsistencia" class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 hidden">
        <div id="alert-additional-content-3"
            class="p-4 mb-4 text-green-800 border border-green-300 rounded-lg bg-white shadow-lg" role="alert">
            <div class="flex items-center">
                <svg class="flex-shrink-0 w-4 h-4 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor" viewBox="0 0 20 20">
                    <path
                        d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                </svg>
                <span class="sr-only">Info</span>
                <h3 class="text-lg font-medium">Mis Asistencia</h3>
            </div>
            <div class="mt-2 mb-4 text-sm">
                Para mayor información consulte a <strong>Administración</strong>.
                <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th class="px-4 py-6" scope="col">N°</th>
                            <th class="px-4 py-6" scope="col">Nombres</th>
                            <th class="px-4 py-6" scope="col">Listado</th>
                            <th class="px-4 py-6" scope="col">Cantidad</th>
                        </tr>
                    </thead>
                    <tbody id="asistenicaPersonal"></tbody>
                </table>
            </div>
            <div class="flex items-center justify-end mt-8">
                <button type="button" id="dismiss-asistencia"
                    class="text-green-800 bg-transparent border border-green-800 hover:bg-green-900 hover:text-white focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-xs px-3 py-1.5 text-center dark:hover:bg-green-600 dark:border-green-600 dark:text-green-400 dark:hover:text-white dark:focus:ring-green-800"
                    aria-label="Close">
                    Cerrar
                </button>
            </div>
        </div>
    </div>

    <!-- Modal para marcar asistencia -->
    <div id="modalMarcarAsistencia"
         class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 hidden">
        <div id="alert-additional-content-4"
             class="p-4 mb-4 text-yellow-800 border border-yellow-300 rounded-lg bg-white shadow-lg" role="alert">
            <div class="flex items-center">
                <svg class="flex-shrink-0 w-4 h-4 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                     fill="currentColor" viewBox="0 0 20 20">
                    <path
                        d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
                </svg>
                <span class="sr-only">Marcar Asistencia</span>
                <h3 class="text-lg font-medium">Marcar Asistencia</h3>
            </div>
            <div class="mt-2 mb-4 text-sm" id="qr-reader-container">
                <p>Por favor, escanee el código QR para marcar su asistencia.</p>
                <div id="qr-reader"></div>
            </div>
            <div class="flex items-center justify-end mt-8">
                <button type="button" id="dismiss-marcar-asistencia"
                        class="text-yellow-800 bg-transparent border border-yellow-800 hover:bg-yellow-900 hover:text-white focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-xs px-3 py-1.5 text-center dark:hover:bg-yellow-600 dark:border-yellow-600 dark:text-yellow-400 dark:hover:text-white dark:focus:ring-yellow-700"
                        aria-label="Close">
                    Cerrar
                </button>
            </div>
        </div>
    </div>
    
    <!-- Modal para mostrar tareas -->
    <div id="modalTareas"
         class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50 hidden">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl h-[80vh] sm:h-[85vh] md:h-[90vh] max-h-[90vh] m-4 flex flex-col">
            <!-- Encabezado -->
            <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div class="flex items-center">
                    <svg class="flex-shrink-0 w-5 h-5 me-2 text-blue-800 dark:text-blue-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
                    </svg>
                    <h3 class="text-lg font-semibold text-blue-800 dark:text-blue-400">Tareas del Trabajador</h3>
                </div>
                <button id="close-tareas" type="button"
                        class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>
            <!-- Cuerpo con scroll -->
            <div class="flex-1 overflow-y-auto p-4">
                <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Selecciona una tarea para comenzar. Usa el desplazamiento para ver todas las tareas.
                </p>
                <div id="tareas-container" class="flex flex-col gap-2">
                    <!-- Las tareas se renderizarán aquí dinámicamente -->
                </div>
            </div>
            <!-- Pie con conteo y botón -->
            <div class="p-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div id="conteoTareas" class="text-sm text-gray-600 dark:text-gray-300"></div>
                <button id="close-tareas-footer" type="button"
                        class="text-blue-800 bg-transparent border border-blue-800 hover:bg-blue-900 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-200 font-medium rounded-lg text-sm px-4 py-2 text-center dark:hover:bg-blue-600 dark:border-blue-600 dark:text-blue-400 dark:hover:text-white dark:focus:ring-blue-800">
                    Cerrar
                </button>
            </div>
        </div>
    </div>
    
    <!-- Modal Tareas -->
    <div id="modalTareasEntregado" class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 hidden">
        <div id="alert-additional-content-4"
            class="p-6 mb-4 text-yellow-800 border border-yellow-300 rounded-lg bg-white shadow-lg" role="alert">
            <div class="flex items-center">
                <svg class="flex-shrink-0 w-5 h-5 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor" viewBox="0 0 20 20">
                    <path
                        d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                </svg>
                <span class="sr-only">Listado de Tareas</span>
                <h3 class="text-lg font-medium">Listado de Tareas</h3>
            </div>
            <div class="overflow-auto max-h-96 w-full">
                <div class="max-w-screen-xl px-4 py-2 mx-auto lg:px-8 sm:py-2 lg:py-2">
                    <div class="flow-root max-w-3xl mx-auto mt-4 sm:mt-4 lg:mt-4">
                        <div class="divide-y divide-gray-200 dark:divide-gray-700 mx-auto w-full">
                            <div id="tareas-container"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex items-center justify-end mt-6">
                <button type="button" id="dismiss-tareas-list"
                    class="text-yellow-800 bg-transparent border border-yellow-800 hover:bg-yellow-900 hover:text-white focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-xs px-4 py-2 text-center dark:hover:bg-yellow-600 dark:border-yellow-600 dark:text-yellow-400 dark:hover:text-white dark:focus:ring-yellow-700"
                    aria-label="Close">
                    Dismiss
                </button>
            </div>
        </div>
    </div>
    
    <!-- Modal Equipos Entregados -->
    <div id="modalValesEquipamiento"
        class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 hidden">
        <div id="alert-additional-content-4"
            class="p-6 mb-4 text-yellow-800 border border-yellow-300 rounded-lg bg-white shadow-lg" role="alert">
            <div class="flex items-center">
                <svg class="flex-shrink-0 w-5 h-5 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor" viewBox="0 0 20 20">
                    <path
                        d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                </svg>
                <span class="sr-only">Listado de equipos Entregados a su disposición</span>
                <h3 class="text-lg font-medium">Listado de Equipos/Materiales</h3>
            </div>
            <div class="overflow-auto max-h-96 w-full">
                <div class="max-w-screen-xl px-4 py-2 mx-auto lg:px-8 sm:py-2 lg:py-2">
                    <div class="flow-root max-w-3xl mx-auto mt-4 sm:mt-4 lg:mt-4">
                        <div class="divide-y divide-gray-200 dark:divide-gray-700 mx-auto w-full">
                            <div id="contenedorEquipos"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex items-center justify-end mt-6">
                <button type="button" id="dismiss-equipamiento-list"
                    class="text-yellow-800 bg-transparent border border-yellow-800 hover:bg-yellow-900 hover:text-white focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-xs px-4 py-2 text-center dark:hover:bg-yellow-600 dark:border-yellow-600 dark:text-yellow-400 dark:hover:text-white dark:focus:ring-yellow-700"
                    aria-label="Close">
                    Dismiss
                </button>
            </div>
        </div>
    </div>

    <div class="py-12">
        <div class="container mx-auto w-full">
            <div class="flex flex-wrap">
                <div class="w-full md:w-3/3 px-4 py-4 -mt-10 md:-mt-10">
                    <div class="overflow-auto">
                        <style>
                            .wx-event-calendar_mark {
                                display: none;
                                /* Oculta el elemento siempre */
                            }
                             div[style*="background: #ff5252"] {
                                display: none !important;
                                visibility: hidden !important;
                                opacity: 0 !important;
                                pointer-events: none !important;
                            }
                        </style>
                        <div id="calendar" class="rounded-lg "></div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{-- Calendario --}}
    <script>
        // Mostrar el modal al cargar la página
        window.onload = function() {
            document.getElementById('modalBienvenida').classList.remove('hidden');
        };

        // Cerrar el modal al hacer clic en el botón de Dismiss
        document.getElementById('dismiss-button').onclick = function() {
            document.getElementById('modalBienvenida').classList.add('hidden');
        };

        // Abrir el modal de asistencia al hacer clic en el botón correspondiente
        document.getElementById('open-asistencia').onclick = function() {
            document.getElementById('modalAsistencia').classList.remove('hidden');
        };

        // Cerrar el modal de asistencia al hacer clic en el botón de Dismiss
        document.getElementById('dismiss-asistencia').onclick = function() {
            document.getElementById('modalAsistencia').classList.add('hidden');
        };

        // Abrir el modal de Marcar Asistencia al hacer clic en el botón correspondiente
        /*document.getElementById('marcar-asistencia').onclick = function() {
            document.getElementById('modalMarcarAsistencia').classList.remove('hidden');
        };

        // Cerrar el modal de Marcar Asistencia al hacer clic en el botón de Dismiss
        document.getElementById('dismiss-marcar-asistencia').onclick = function() {
            document.getElementById('modalMarcarAsistencia').classList.add('hidden');
        };*/

        // Abrir el modal de Tareas al hacer clic en el botón correspondiente
        document.getElementById('abrir-tareas-trab').onclick = function() {
            document.getElementById('modalTareasEntregado').classList.remove('hidden');
        };

        // Cerrar el modal de Tareas al hacer clic en el botón de Dismiss
        document.getElementById('dismiss-tareas-list').onclick = function() {
            document.getElementById('modalTareasEntregado').classList.add('hidden');
        };
        
         // Abrir el modal de Tareas al hacer clic en el botón correspondiente
        document.getElementById('abrir_equipamiento').onclick = function() {
            document.getElementById('modalValesEquipamiento').classList.remove('hidden');
        };

        // Cerrar el modal de Tareas al hacer clic en el botón de Dismiss
        document.getElementById('dismiss-equipamiento-list').onclick = function() {
            document.getElementById('modalValesEquipamiento').classList.add('hidden');
        };
        const {
            EventCalendar
        } = eventCalendar;
        const {
            format
        } = dateFns;

        document.addEventListener("DOMContentLoaded", () => {
            let contadorTareas = 0;

            // Función para cargar el contador desde localStorage
            function cargarContador() {
                const hoy = new Date();
                const ultimoReinicio = localStorage.getItem('ultimoReinicio');

                // Si es un nuevo domingo, reiniciar el contador
                if (nuevoDomingo(hoy, ultimoReinicio)) {
                    contadorTareas = 0;
                    localStorage.setItem('contadorTareas', contadorTareas);
                    localStorage.setItem('ultimoReinicio', hoy.toISOString());
                } else {
                    contadorTareas = parseInt(localStorage.getItem('contadorTareas')) || 0;
                }

                // Actualizar el contador en la interfaz
                actualizarContadorEnUI();
            }
            // Función para verificar si es un nuevo domingo
            function nuevoDomingo(hoy, ultimoReinicio) {
                const fechaUltimoReinicio = new Date(ultimoReinicio);
                return hoy.getDay() === 0 && hoy > fechaUltimoReinicio; // 0 es domingo
            }

            const empresaId = document.getElementById('empresaId').value;
            const trabajadorId = document.getElementById('trabajador_id').value;
            cargarDatos(empresaId, trabajadorId);

            function cargarDatos(empresaId, trabajadorId) {
                $.ajax({
                    type: 'GET',
                    url: `/calendariotrabajadores/${empresaId}/${trabajadorId}`, // Envía ambos IDs
                    dataType: 'json',
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                    },
                    success: function(data) {
                        const proyectosInput = JSON.stringify(data.proyectos);
                        const trabajadoresInput = JSON.stringify(data.trabajador);
                        const eventData = JSON.stringify(data.events);

                        mostrarDatos(proyectosInput, trabajadoresInput, eventData)
                    },

                    error: function(jqXHR, textStatus, errorThrown) {
                        console.error('Error:', textStatus, errorThrown);
                        //alert('Error al cargar los datos: ' + errorThrown);
                    }
                });
            }

            function mostrarDatos(proyectosInput, trabajadoresInput, eventData) {
                //obtener proyectos del inprut oculto
                const proyectos = JSON.parse(proyectosInput);
                const proyectosOptions = proyectos.map(proyecto => {
                    return {
                        key: "proyecto_id",
                        id: proyecto.id_proyectos,
                        label: proyecto.nombre_proyecto
                    }
                });

                const trabajador = JSON.parse(trabajadoresInput);
                // Si solo tienes un trabajador
                const trabajadors = {
                    id: trabajador.id,
                    label: trabajador.name,
                    readonly: false, // Cambia esto según sea necesario
                    active: true, // Ajusta según tu lógica
                    color: {
                        background: getRandomColor(), // Genera colores aleatorios
                        border: getRandomColor() // Personaliza según sea necesario
                    }
                };

                const eventDat = JSON.parse(eventData);
                // Suponiendo que eventInputs ya es un array de objetos JSON
                const events = eventDat.map(eventData => ({
                    id: eventData.id,
                    text: eventData.text,
                    details: eventData.details,
                    start_date: new Date(eventData.start_date),
                    end_date: new Date(eventData.end_date),
                    allDay: eventData.allDay,
                    type: eventData.usuario_id,
                    proyecto_id: eventData.proyecto_id
                }));

                // Ejemplo de función para generar colores aleatorios
                function getRandomColor() {
                    const letters = '0123456789ABCDEF';
                    let color = '#';
                    for (let i = 0; i < 6; i++) {
                        color += letters[Math.floor(Math.random() * 16)];
                    }
                    return color;
                }

                const editorShape = [{
                        key: "text",
                        name: "text",
                        label: "Título",
                        type: "text"
                    },
                    {
                        key: "details",
                        name: "details",
                        label: "Detalles",
                        type: "textarea"
                    },
                    {
                        key: "start_date",
                        name: "start_date",
                        label: "Fecha de inicio",
                        type: "date",
                        time: true
                    },
                    {
                        key: "end_date",
                        name: "end_date",
                        label: "Fecha de fin",
                        type: "date",
                        time: true
                    },
                    {
                        key: "allDay",
                        name: "allDay",
                        label: "Todo el día",
                        type: "checkbox"
                    },
                    {
                        key: "type",
                        label: "Asignar a",
                        type: "combo",
                        options: trabajador ? [{
                            key: trabajador.id,
                            label: trabajador.name
                        }] : [] // Verifica si hay un trabajador
                    },
                    {
                        key: "proyecto_id",
                        name: "proyecto_id",
                        label: "Proyecto asignado",
                        type: "combo",
                        options: proyectosOptions // Asegúrate de que aquí los datos son correctos
                    }
                ];

                const calendars = [trabajadors];
                // Configuración del calendario
                const calendar = new EventCalendar("#calendar", {
                    events: events,
                    calendars: calendars,
                    theme: "willowDark",
                    date: new Date(),
                    mode: "month",
                    editorShape: editorShape,
                    locale: {
                        monthsShort: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct",
                            "Nov", "Dic"
                        ],
                        months: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto",
                            "Septiembre", "Octubre", "Noviembre", "Diciembre"
                        ],
                        daysShort: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
                        days: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
                        cancel: "Cancelar"
                    },
                    templates: {
                        weekEvent: function({
                            event,
                            calendar
                        }) {
                            const start_date = format(event.start_date, "HH:mm");
                            const end_date = format(event.end_date, "HH:mm");
                            // Asegúrate de que calendars es un array
                            if (!Array.isArray(calendars)) {
                                console.error("Calendars no es un array");
                                return '';
                            }

                            return `
                            <div class="week_event_wrapper">
                                <div>${event.text}</div>
                                <div>${start_date} - ${end_date}</div>
                                <div>Asignado a: ${calendars.find(cal => cal.id === event.calendar_id)?.label || 'Sin asignar'}</div>
                            </div>`;
                        }
                    },
                });
                //funcion para ocultar Create 
                // Selecciona el botón después de que se haya inicializado el calendario
                const button = document.querySelector('.primary.svelte-tksh4t');

                // Verifica si el botón existe antes de ocultarlo
                if (button) {
                    button.style.display = 'none'; // Oculta el botón
                }

                calendar.api.on("select-event", (obj) => {
                    setTimeout(() => {
                        const controlsContainer = document.querySelector(
                            '.wx-event-calendar-controls');

                        if (controlsContainer) {
                            // Oculta los botones de edición y eliminación
                            const editButton = controlsContainer.querySelector('.wxi-edit');
                            const deleteButton = controlsContainer.querySelector('.wxi-delete');

                            if (editButton) {
                                editButton.style.display = 'none'; // Oculta el botón de editar
                            }

                            if (deleteButton) {
                                deleteButton.style.display = 'none'; // Oculta el botón de eliminar
                            }

                            const uploadButton = document.createElement('i');
                            uploadButton.className =
                                'wxi-upload wx-event-calendar-control svelte-tyjvm3';

                            const buttonLabel = document.createElement('span');
                            buttonLabel.className = 'wx-event-calendar-label svelte-tyjvm3';
                            buttonLabel.textContent = 'Subir Tarea';

                            uploadButton.appendChild(buttonLabel);

                            uploadButton.addEventListener('click', () => {
                                const selectedEvent = events.find(event => event.id === obj
                                    .id);
                                if (selectedEvent) {
                                    const eventId = selectedEvent.id;
                                    const eventText = selectedEvent.text;
                                    const fecha_iniciopro = selectedEvent.start_date;
                                    const fecha_finpro = selectedEvent.end_date;
                                    const trabajar_asignadot = selectedEvent.type;
                                    const proyecto_asignadot = selectedEvent.proyecto_id;
                                    // Cerrar el popup del calendario antes de abrir el modal
                                    const calendarPopup = document.querySelector(
                                        '.popup.svelte-3iw5hi');
                                    if (calendarPopup) {
                                        calendarPopup.style.display = 'none';
                                    }

                                    // Crear y mostrar el modal
                                    crearModal(eventText, eventId, fecha_iniciopro,
                                        fecha_finpro, trabajar_asignadot,
                                        proyecto_asignadot);
                                    const modal = document.getElementById('modal');
                                    modal.classList.remove('hidden');
                                } else {
                                    console.error("Evento no encontrado.");
                                }
                            });

                            controlsContainer.appendChild(uploadButton);
                        }
                    }, 100);
                });

                function formatDate(date) {
                    const d = new Date(date);
                    const year = d.getFullYear();
                    const month = ('0' + (d.getMonth() + 1)).slice(-2);
                    const day = ('0' + d.getDate()).slice(-2);
                    const hours = ('0' + d.getHours()).slice(-2);
                    const minutes = ('0' + d.getMinutes()).slice(-2);
                    const seconds = ('0' + d.getSeconds()).slice(-2);
                    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
                }
            };

            function formatToMySQLDate(date) {
                const d = new Date(date);
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0'); // Asegura que el mes tenga 2 dígitos
                const day = String(d.getDate()).padStart(2, '0'); // Asegura que el día tenga 2 dígitos
                const hours = String(d.getHours()).padStart(2, '0'); // Asegura que la hora tenga 2 dígitos
                const minutes = String(d.getMinutes()).padStart(2, '0'); // Asegura que los minutos tengan 2 dígitos
                const seconds = String(d.getSeconds()).padStart(2,
                    '0'); // Asegura que los segundos tengan 2 dígitos

                return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            }

            // Crear el modal y el contenido
            function crearModal(eventText, eventId, fecha_iniciopro, fecha_finpro, trabajar_asignadot,
                proyecto_asignadot) {
                // Remover modal existente si hay uno
                const existingModal = document.getElementById('modal');
                if (existingModal) {
                    existingModal.remove();
                }

                const modal = document.createElement('div');
                modal.id = 'modal';
                modal.className =
                    'fixed inset-0 flex items-center justify-center hidden bg-black bg-opacity-50 z-50';

                const modalContent = document.createElement('div');
                modalContent.className = 'bg-white rounded-lg shadow-lg p-6 w-96';

                const title = document.createElement('h2');
                title.className = 'text-lg font-bold mb-4 text-center';
                title.textContent = 'Registrar la Tarea';

                const currentTime = new Date();
                const startTime = new Date();
                startTime.setHours(8, 0, 0); // 08:00
                const endTime = new Date();
                endTime.setHours(19, 30, 0); // 19:30

                if (currentTime < startTime || currentTime > endTime) {
                    // Si está fuera del horario
                    const warningMessage = document.createElement('p');
                    warningMessage.className = 'text-red-500 mb-4 text-center';
                    warningMessage.textContent =
                        'Registrar la tarea Tardía puede afectar tus días laborados, contacta con tu Jefe de área o a soporte técnico.';

                    modalContent.appendChild(title);
                    modalContent.appendChild(warningMessage);

                    const buttonClose = document.createElement('button');
                    buttonClose.textContent = 'Cerrar';
                    buttonClose.className = 'bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded';
                    buttonClose.onclick = () => {
                        modal.classList.add('hidden');
                    };

                    modalContent.appendChild(buttonClose);
                    modal.appendChild(modalContent);
                } else {
                    // Si está dentro del horario, añadir los inputs
                    const inputTitulo = document.createElement('input');
                    inputTitulo.id = 'titulo';
                    inputTitulo.placeholder = 'Ingrese el título';
                    inputTitulo.value = eventText;
                    inputTitulo.className = 'border border-gray-300 rounded w-full p-2 mb-4 text-center';

                    const inputIdEvento = document.createElement('input');
                    inputIdEvento.id = 'id_evento';
                    inputIdEvento.type = 'hidden';
                    inputIdEvento.value = eventId;

                    const inputPorcentaje = document.createElement('input');
                    inputPorcentaje.id = 'porcentaje';
                    inputPorcentaje.type = 'number';
                    inputPorcentaje.placeholder = 'Ingrese el porcentaje';
                    inputPorcentaje.className = 'border border-gray-300 rounded w-full p-2 mb-4 text-center';
                    inputPorcentaje.min = '0';
                    inputPorcentaje.max = '100';

                    inputPorcentaje.addEventListener('input', () => {
                        let value = parseInt(inputPorcentaje.value, 10);
                        if (value < 0) {
                            inputPorcentaje.value = 0;
                        } else if (value > 100) {
                            inputPorcentaje.value = 100;
                        }
                    });

                    const inputLink = document.createElement('input');
                    inputLink.id = 'link';
                    inputLink.type = 'url';
                    inputLink.placeholder = 'Ingrese el enlace';
                    inputLink.className = 'border border-gray-300 rounded w-full p-2 mb-4 text-center';

                    const buttonContainer = document.createElement('div');
                    buttonContainer.className = 'flex justify-end gap-2';

                    const buttonClose = document.createElement('button');
                    buttonClose.textContent = 'Cerrar';
                    buttonClose.className = 'bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded';
                    buttonClose.onclick = () => {
                        modal.classList.add('hidden');
                    };

                    const buttonSave = document.createElement('button');
                    buttonSave.textContent = 'Guardar';
                    buttonSave.className = 'bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded';

                    buttonSave.onclick = () => {
                        // Obtener la fecha y hora actuales
                        const fechaSubido = new Date(); // Fecha y hora actuales
                        const diaSemana = fechaSubido.toLocaleDateString('es-ES', {
                            weekday: 'long'
                        });

                        // Formatear las fechas correctamente
                        const fechaSubidoFormatted = formatToMySQLDate(fechaSubido);
                        const fechaInicioproFormatted = formatToMySQLDate(
                            fecha_iniciopro); // Asegúrate de que esta variable sea un objeto Date
                        const fechaFinproFormatted = formatToMySQLDate(
                            fecha_finpro); // Asegúrate de que esta variable sea un objeto Date

                        const data = {
                            nombre_tarea: inputTitulo.value,
                            fecha_subido_t: fechaSubidoFormatted, // Fecha formateada
                            fecha_iniciopro: fechaInicioproFormatted, // Fecha formateada
                            fecha_finpro: fechaFinproFormatted, // Fecha formateada
                            porcentaje_tarea: inputPorcentaje.value,
                            diasubido: diaSemana,
                            nombre_documento: inputLink.value,
                            trabajar_asignadot: trabajar_asignadot,
                            proyecto_asignadot: proyecto_asignadot,
                        };
                        $.ajax({
                            type: 'POST',
                            url: '/registrar_tarea', // Asegúrate de que esta ruta sea correcta
                            data: JSON.stringify(data),
                            contentType: 'application/json', // Configura el tipo de contenido
                            headers: {
                                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
                            },
                            success: function(response) {
                                if (response.success) {
                                    // Muestra un mensaje de éxito con SweetAlert 2
                                    Swal.fire({
                                        icon: 'success',
                                        title: 'Tarea guardada con éxito',
                                        text: response.success,
                                        confirmButtonText: 'Aceptar'
                                    }).then((result) => {
                                        if (result.isConfirmed) {
                                            modal.classList.add('hidden');
                                        }
                                        contadorTareas++;
                                        localStorage.setItem('contadorTareas',
                                            contadorTareas);
                                        actualizarContadorEnUI();
                                    });
                                }
                                modal.classList.add('hidden');
                            },
                            error: function(xhr) {
                                console.error('Error:', xhr.responseText); // Manejo de errores
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Oops...',
                                    text: 'Hubo un error al guardar la tarea. Intenta nuevamente.',
                                    confirmButtonText: 'Aceptar'
                                });
                            }
                        });
                    };

                    buttonContainer.appendChild(buttonClose);
                    buttonContainer.appendChild(buttonSave);

                    modalContent.appendChild(title);
                    modalContent.appendChild(inputTitulo);
                    modalContent.appendChild(inputIdEvento);
                    modalContent.appendChild(inputPorcentaje);
                    modalContent.appendChild(inputLink);
                    modalContent.appendChild(buttonContainer);
                    modal.appendChild(modalContent);
                }

                document.body.appendChild(modal);
            }
            // Función para actualizar el contador en la interfaz
            function actualizarContadorEnUI() {
                const contadorElemento = document.getElementById('contador-tareas');
                if (contadorElemento) {
                    contadorElemento.innerHTML = contadorTareas > 0 ? contadorTareas : '0';
                }
            }

            // Llamar a cargarContador al iniciar la aplicación
            cargarContador();
        });
    </script>

    {{-- Marcar asistencia --}}
    <script>
         window.onload = function () {
            // Verificar tareas antes de iniciar el proceso de asistencia
            verificarTareas();
        };
        
        // Variable global para el escáner
        var html5QrcodeScanner;
        
        // Bandera para evitar múltiples registros
        var registroEnProceso = false;
        var registroCompletado = false;
        
        // Función para verificar tareas al cargar la página
        function verificarTareas() {
            const id_trabajador = document.getElementById('trabajador_id').value;
        
            $.ajax({
                url: '/listar-tareas/' + id_trabajador,
                method: 'GET',
                dataType: 'json',
                success: function(data) {
                    if (!data || data.length === 0) {
                        // Mostrar mensaje informativo si no hay tareas
                        Swal.fire({
                            icon: 'info',
                            title: 'Sin tareas asignadas',
                            text: 'Por favor, solicita a tu jefe que agregue tus tareas para poder registrar tu asistencia.',
                            confirmButtonText: 'Aceptar'
                        });
                    } else {
                        window.tareas = data;
                        iniciarProcesoDeAsistencia();
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Error al cargar las tareas: ', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se pudieron cargar las tareas. Serás redirigido al gestor de tareas.',
                        confirmButtonText: 'Aceptar'
                    }).then(() => {
                        window.location.href = `/kanban/${id_trabajador}`;
                    });
                }
            });
        }
        
        // Función principal que determina el flujo de trabajo según el dispositivo
        function iniciarProcesoDeAsistencia() {
            const tipoDispositivo = detectarDispositivo();
            
            if (tipoDispositivo === 'mobile' || tipoDispositivo === 'tablet') {
                document.getElementById('modalMarcarAsistencia').classList.remove('hidden');
                iniciarProcesoMobile();
            } else {
                mostrarMensajePC();
            }
        }
        
        // Función para detectar el tipo de dispositivo
        function detectarDispositivo() {
            const userAgent = navigator.userAgent.toLowerCase();
            const isMobile = /iphone|ipod|android|blackberry|opera mini|opera mobi|skyfire|maemo|windows phone|palm|iemobile|symbian|symbianos|fennec/i.test(userAgent);
            const isTablet = /ipad|android 3|sch-i800|playbook|tablet|kindle|gt-p1000|sgh-t849|shw-m180s|a510|a511|a100|dell streak|silk/i.test(userAgent);
            
            if (isMobile) return 'mobile';
            if (isTablet) return 'tablet';
            return 'desktop';
        }
        
        // Función para mostrar mensaje en dispositivos de escritorio
        function mostrarMensajePC() {
            Swal.fire({
                icon: 'info',
                title: 'Dispositivo detectado: PC/ Modo Escritorio',
                text: 'El marcado de asistencia está optimizado para dispositivos móviles. Por favor, utiliza un smartphone o tablet para una mejor experiencia. y Active su Ubicacion',
                confirmButtonText: 'Entendido'
            });
        }
        
        // Iniciar proceso para dispositivos móviles
        function iniciarProcesoMobile() {
            // Reiniciar banderas de control
            registroEnProceso = false;
            registroCompletado = false;
            
            // Solicitar permisos de ubicación y cámara en secuencia
            solicitarPermisos()
                .then(() => {
                    console.log("Permisos concedidos, iniciando escáner QR");
                    iniciarEscanerQR();
                })
                .catch(error => {
                    console.error("Error al obtener permisos:", error);
                    mostrarErrorPermisos(error);
                });
        }
        
        // Solicitar todos los permisos necesarios
        async function solicitarPermisos() {
            try {
                await obtenerUbicacion();
                console.log("Permiso de ubicación concedido");
                return Promise.resolve();
            } catch (error) {
                return Promise.reject("Se requiere acceso a la ubicación para registrar la asistencia");
            }
        }
        
        // Función para mostrar error de permisos
        function mostrarErrorPermisos(mensaje) {
            Swal.fire({
                icon: 'error',
                title: 'Permisos requeridos',
                text: mensaje || 'Se requieren permisos de ubicación y cámara para marcar asistencia.',
                confirmButtonText: 'Reintentar'
            }).then((result) => {
                if (result.isConfirmed) {
                    iniciarProcesoMobile();
                }
            });
        }
        
        // Cerrar modal de marcar asistencia
        document.getElementById('dismiss-marcar-asistencia').onclick = function () {
            document.getElementById('modalMarcarAsistencia').classList.add('hidden');
            
            // Limpiar el escáner si existe
            if (html5QrcodeScanner) {
                html5QrcodeScanner.clear();
                html5QrcodeScanner = null;
            }
        };
        
        // Iniciar el escáner QR con configuración optimizada para móviles
        function iniciarEscanerQR() {
            // Limpiar el escáner anterior si existe
            if (html5QrcodeScanner) {
                html5QrcodeScanner.clear();
            }
            
            html5QrcodeScanner = new Html5QrcodeScanner(
                "qr-reader", 
                { 
                    fps: 10,
                    qrbox: 250,
                    rememberLastUsedCamera: true,
                    formatsToSupport: [ Html5QrcodeSupportedFormats.QR_CODE ]
                }
            );
        
            html5QrcodeScanner.render(onScanSuccess, onScanError);
        
            // Ocultar el botón de subir imagen con un retraso mayor
            setTimeout(ocultarBotonSubirImagen, 1000);
            
            // Intentar seleccionar la cámara trasera con un retraso más largo
            setTimeout(seleccionarCamaraTrasera, 1500);
        }
        
        // Función para seleccionar automáticamente la cámara trasera
        async function seleccionarCamaraTrasera() {
            try {
                const devices = await Html5Qrcode.getCameras();
                if (!devices || !devices.length) {
                    console.log("No se encontraron cámaras disponibles");
                    return;
                }
                
                console.log("Cámaras disponibles:", devices.map(d => d.label));
                
                const patronesCamaraTrasera = [
                    'back', 'trasera', 'rear', 'environment', 'posterior', 'exterior', 'externa', 'back camera'
                ];
                
                let camaraTrasera = null;
                for (const patron of patronesCamaraTrasera) {
                    camaraTrasera = devices.find(device => 
                        device.label.toLowerCase().includes(patron)
                    );
                    if (camaraTrasera) break;
                }
                
                if (!camaraTrasera && devices.length > 1) {
                    camaraTrasera = devices[devices.length - 1];
                } else if (!camaraTrasera) {
                    camaraTrasera = devices[0];
                }
                
                console.log("Cámara seleccionada:", camaraTrasera.label);
                
                if (html5QrcodeScanner && html5QrcodeScanner.html5Qrcode) {
                    try {
                        await html5QrcodeScanner.html5Qrcode.stop();
                        await html5QrcodeScanner.html5Qrcode.start(
                            camaraTrasera.id, 
                            { 
                                fps: 10,
                                qrbox: 250 
                            },
                            onScanSuccess,
                            onScanError
                        );
                        console.log("Cámara trasera iniciada con éxito");
                        return;
                    } catch (err) {
                        console.error("Error al iniciar cámara directamente:", err);
                    }
                }
                
                const cameraSelector = document.getElementById('qr-reader__camera_selection');
                if (cameraSelector) {
                    cameraSelector.value = camaraTrasera.id;
                    cameraSelector.dispatchEvent(new Event('change', { bubbles: true }));
                    
                    setTimeout(() => {
                        const startButton = document.querySelector('#qr-reader__camera_permission_button');
                        if (startButton) {
                            startButton.click();
                            console.log("Se hizo clic en el botón de iniciar cámara");
                        }
                    }, 500);
                } else {
                    console.log("No se encontró el selector de cámaras en el DOM");
                }
            } catch (error) {
                console.error("Error al seleccionar cámara trasera:", error);
            }
        }
        
        function ocultarBotonSubirImagen() {
            const botonSubirImagen = document.querySelector('#qr-reader__dashboard_section_swaplink');
            if (botonSubirImagen) {
                botonSubirImagen.style.display = 'none';
            }
            
            const headerSection = document.querySelector('#qr-reader__header_message');
            if (headerSection) {
                headerSection.style.fontSize = '14px';
                headerSection.style.padding = '5px';
            }
        }
        
        async function obtenerHoraLima() {
            try {
                const response = await fetch(
                    'https://timeapi.io/api/time/current/zone?timeZone=America%2FLima');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                return new Date(data.dateTime);
            } catch (error) {
                console.error("Error al obtener la hora de Lima:", error);
                const now = new Date();
                const limaOffset = -5 * 60;
                const localOffset = now.getTimezoneOffset();
                return new Date(now.getTime() + (localOffset + limaOffset) * 60000);
            }
        }
        
         function calcularEntrada(horaLimaDateObject) {
            // Es una buena práctica asegurarse de que el argumento es un objeto Date válido.
            if (!(horaLimaDateObject instanceof Date) || isNaN(horaLimaDateObject.getTime())) {
                console.error("El argumento proporcionado no es un objeto Date válido.");
                return 'Error: Fecha inválida'; // O manejar el error como se prefiera
            }
        
            const horas = horaLimaDateObject.getHours(); // Obtiene la hora del día (0-23)
            const minutos = horaLimaDateObject.getMinutes(); // Obtiene los minutos de la hora (0-59)
        
            // --- HORARIO DE MAÑANA ---
            // Entrada Puntual Mañana: Desde las 7:30 AM hasta las 8:20 AM.
            if ((horas === 7 && minutos >= 30) || (horas === 8 && minutos <= 20)) {
                return 'Puntual';
            }
            // Entrada Tarde Mañana: Desde las 8:21 AM hasta las 12:59 PM.
            // (Se asume que el bloque de "Tarde Mañana" termina antes de las 13:00)
            else if (((horas === 8 && minutos >= 21) || (horas > 8 && horas < 13))) {
                return 'Tarde';
            }
        
            // --- HORARIO DE TARDE ---
            // Entrada Puntual Tarde: Desde las 2:30 PM (14:30) hasta las 3:10 PM (15:10).
            else if ((horas === 14 && minutos >= 30) || (horas === 15 && minutos <= 10)) {
                return 'Puntual';
            }
            // Entrada Tarde Tarde: Desde las 3:11 PM (15:11) hasta las 8:00 PM (20:00).
            // (Se asume que el bloque de "Tarde Tarde" termina a las 20:00 inclusive)
            else if (((horas === 15 && minutos >= 11) || (horas > 15 && horas < 20) || (horas === 20 && minutos === 0))) {
                return 'Tarde';
            }
        
            // --- FUERA DE HORARIO ---
            // Si no cumple ninguna de las condiciones anteriores, se considera Fuera de horario.
            else {
                return 'Fuera de horario';
            }
        }
        
        function obtenerMensajeIngreso(entrada) {
            const mensajePuntual = "Excelente trabajo por llegar puntual! Sigue así.";
            const mensajeTarde = "Recuerda que la puntualidad es importante. ¡Esfuérzate por llegar a tiempo!";
            const mensajeFuera = "Estás registrando asistencia fuera del horario laboral regular.";
            
            if (entrada === "Puntual") return mensajePuntual;
            if (entrada === "Tarde") return mensajeTarde;
            return mensajeFuera;
        }
        
        async function obtenerUbicacion() {
            return new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                });
            });
        }
        
        async function obtenerDireccion(position) {
            try {
                const urlNominatim =
                    `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`;
                const response = await fetch(urlNominatim);
                
                if (!response.ok) {
                    throw new Error("Error al obtener dirección");
                }
                
                const data = await response.json();
                const address = data.address || {};
                const numeroCasa = address.house_number || "";
                const calle = address.road || "";
                const ciudad = address.residential || address.city || address.town || address.county || "";
                
                return `${numeroCasa} ${calle}, ${ciudad}`.trim() || `Lat: ${position.coords.latitude.toFixed(5)}, Lon: ${position.coords.longitude.toFixed(5)}`;
            } catch (error) {
                console.error("Error al obtener dirección:", error);
                return `Lat: ${position.coords.latitude.toFixed(5)}, Lon: ${position.coords.longitude.toFixed(5)}`;
            }
        }
        
        function registrarAsistencia(formData) {
            return new Promise((resolve, reject) => {
                if (registroEnProceso) {
                    reject(new Error('Ya hay un registro en proceso'));
                    return;
                }
                
                if (registroCompletado) {
                    reject(new Error('La asistencia ya ha sido registrada hoy'));
                    return;
                }
                
                registroEnProceso = true;
                
                const xhr = new XMLHttpRequest();
                xhr.open('POST', '/registrar_asistencia');
                xhr.setRequestHeader('X-CSRF-TOKEN', document.querySelector('meta[name="csrf-token"]')
                    .getAttribute('content'));
                    
                xhr.timeout = 15000;
        
                xhr.onload = function () {
                    if (xhr.status === 200) {
                        registroCompletado = true;
                        registroEnProceso = false;
                        resolve(xhr.responseText);
                    } else {
                        registroEnProceso = false;
                        reject(new Error(xhr.statusText || 'Error en la respuesta del servidor'));
                    }
                };
                
                xhr.ontimeout = function() {
                    registroEnProceso = false;
                    reject(new Error('Tiempo de espera agotado para la solicitud'));
                };
                
                xhr.onerror = function () {
                    registroEnProceso = false;
                    reject(new Error('Error de red'));
                };
                
                xhr.send(formData);
            });
        }
        
        async function onScanSuccess(decodedText, decodedResult) {
            console.log("QR escaneado con éxito:", decodedText);
            
            if (registroEnProceso) {
                console.log("Ya hay un registro en proceso, ignorando escaneo");
                return;
            }
            
            if (registroCompletado) {
                console.log("La asistencia ya fue registrada, ignorando escaneo");
                Swal.fire({
                    icon: 'info',
                    title: 'Asistencia ya registrada',
                    text: 'Tu asistencia ya ha sido registrada correctamente. No es necesario escanear nuevamente.',
                    confirmButtonText: 'Entendido'
                });
                if (html5QrcodeScanner) {
                    html5QrcodeScanner.clear();
                }
                return;
            }
            
            if (html5QrcodeScanner) {
                try {
                    await html5QrcodeScanner.clear();
                } catch (error) {
                    console.error("Error al detener el escáner:", error);
                }
            }
        
            const id_empresa = document.getElementById('empresaId').value || 0;
            const id_trabajador = document.getElementById('trabajador_id').value;
            const nombre_trabajador = document.getElementById('nombre_trab').value;
        
            try {
                Swal.fire({
                    title: 'Procesando...',
                    text: 'Estamos registrando tu asistencia',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
        
                const fechaHoraLima = await obtenerHoraLima();
        
                if (!(fechaHoraLima instanceof Date) || isNaN(fechaHoraLima.getTime())) {
                    throw new Error('No se pudo obtener la fecha y hora de Lima');
                }
        
                const entrada = calcularEntrada(fechaHoraLima);
                const mensajesingreso = obtenerMensajeIngreso(entrada);
        
                const fechaFormateada = fechaHoraLima.toISOString().split('T')[0];
                const horaLima = fechaHoraLima.toLocaleTimeString('es-PE', {
                    hour12: false
                });
        
                const position = await obtenerUbicacion();
                const ubicacion = await obtenerDireccion(position);
        
                const formData = new FormData();
                formData.append('nombre_trabajador', nombre_trabajador);
                formData.append('tipo_horario', entrada);
                formData.append('fecha', fechaFormateada);
                formData.append('horaLima', horaLima);
                formData.append('ubicacion', ubicacion);
                formData.append('id_trabajador', id_trabajador);
                formData.append('id_empresa', id_empresa);
                formData.append('qr_code', decodedText);
        
                const respuesta = await registrarAsistencia(formData);
                const data = JSON.parse(respuesta);
                if (data.success) {
                    Swal.fire({
                        title: entrada,
                        text: mensajesingreso,
                        icon: 'success',
                        confirmButtonText: 'Aceptar'
                    }).then(() => {
                        // Ocultar el contenedor del escáner
                        //document.getElementById('qr-reader-container').style.display = 'none';
                        // Mostrar el contenedor de tareas
                        //const tareasGrid = document.querySelector('.grid.grid-cols-1.md:grid-cols-2.lg:grid-cols-2.xl:grid-cols-2.2xl:grid-cols-2');
                        //if (tareasGrid) {
                            //tareasGrid.classList.remove('hidden');
                        //}
                        // Mostrar las tareas
                        // Ocultar el modal de asistencia
                        document.getElementById('modalMarcarAsistencia').classList.add('hidden');
                        // Mostrar las tareas en el modal de tareas
                        mostrarTareas();
                    });
                } else {
                    registroCompletado = false;
                    Swal.fire({
                        title: 'Error',
                        text: 'Hubo un error en la respuesta del servidor: ' + (data.error || 'Error desconocido'),
                        icon: 'error',
                        confirmButtonText: 'Reintentar',
                        showCancelButton: true,
                        cancelButtonText: 'Cancelar'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            iniciarEscanerQR();
                        }
                    });
                }
            } catch (error) {
                console.error("Error al registrar la asistencia:", error);
                registroEnProceso = false;
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo registrar la asistencia: ' + (error.message || 'Error desconocido'),
                    confirmButtonText: 'Reintentar',
                    showCancelButton: true,
                    cancelButtonText: 'Cancelar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        iniciarEscanerQR();
                    }
                });
            }
        }
        
        function onScanError(errorMessage) {
            if (errorMessage && !errorMessage.includes('No QR code found')) {
                console.error("Error al escanear:", errorMessage);
            }
        }
        
        // Función para mostrar las tareas después de registrar asistencia
        function mostrarTareas() {
            var idtrabajador = $('#trabajador_id').val();
        
            // Validar que idtrabajador tenga un valor válido
            if (!idtrabajador) {
                console.error('Error: idtrabajador no está definido');
                $('#tareas-container').html('<p>Error: Seleccione un trabajador.</p>');
                document.getElementById('modalTareas').classList.remove('hidden');
                return;
            }
        
            $.ajax({
                url: '/listar-tareas/' + idtrabajador,
                method: 'GET',
                dataType: 'json',
                success: function (data) {
                    $('#tareas-container').empty();
        
                    // Validar que data sea un array y no esté vacío
                    if (Array.isArray(data) && data.length > 0) {
                        data.forEach(function (tarea) {
                            // Verificar que las propiedades esperadas existan
                            if (tarea.actividadId && tarea.nameActividad) {
                                $('#tareas-container').append(
                                    `<div>
                                        <button type="button" id="tarea-${tarea.actividadId}"
                                            class="text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-xs px-5 py-2.5 text-center me-2 mb-2"
                                            data-id="${tarea.actividadId}">
                                            ${tarea.nameActividad}
                                        </button>
                                    </div>`
                                );
                            } else {
                                console.warn('Tarea inválida:', tarea);
                            }
                        });
                        // Actualizar el conteo de tareas
                        $('#conteoTareas').text(`Total de tareas: ${data.length}`);
                    } else {
                        $('#tareas-container').append('<p>No hay tareas para este trabajador.</p>');
                        $('#conteoTareas').text('Total de tareas: 0');
                    }
        
                    // Agregar eventos de clic a los botones
                    agregarEventoClickTareas();
        
                    // Mostrar el modal de tareas
                    document.getElementById('modalTareas').classList.remove('hidden');
                },
                error: function (xhr, status, error) {
                    console.error('Error al cargar las tareas:', {
                        status: status,
                        error: error,
                        response: xhr.responseText
                    });
                    $('#tareas-container').empty().append('<p>Error al cargar las tareas. Por favor, intenta de nuevo.</p>');
                    $('#conteoTareas').text('Total de tareas: 0');
                    document.getElementById('modalTareas').classList.remove('hidden');
                }
            });
        }
        
        // Función para agregar eventos de clic a los botones de tareas
        function agregarEventoClickTareas() {
            $('#tareas-container').find('button').on('click', function () {
                const idTarea = $(this).data('id');
                cambiarEstadoTarea(idTarea);
            });
        }
        
        // Función para cambiar el estado de la tarea
        function cambiarEstadoTarea(idTarea) {
            $.ajax({
                url: '/actualizar-status/' + idTarea + '/doing',
                method: 'POST',
                dataType: 'json',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                success: function (data) {
                    if (data.success) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Tarea Actualizada',
                            text: 'El estado de la tarea ha sido actualizado correctamente.',
                            confirmButtonText: 'Aceptar'
                        }).then(() => {
                            // Ocultar el modal de tareas
                            document.getElementById('modalTareas').classList.add('hidden');
                            // Cerrar el modal de asistencia
                            //document.getElementById('modalMarcarAsistencia').classList.add('hidden');
                            //if (typeof $('#AsistenciaPersonal').modal === 'function') {
                                //$('#AsistenciaPersonal').modal('hide');
                            //}
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: data.error || 'No se pudo actualizar el estado de la tarea.',
                            confirmButtonText: 'Aceptar'
                        });
                    }
                },
                error: function (xhr, status, error) {
                    console.error('Error al cambiar el estado de la tarea: ', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se pudo actualizar el estado de la tarea.',
                        confirmButtonText: 'Aceptar'
                    });
                }
            });
        }
    </script>

    {{-- Tareas Trabajador --}}
    <script>
        async function obtenerTareas(trabajadorId) {
            try {
                const response = await fetch(`/tareas_list_trab/${trabajadorId}`);
                const data = await response.json();

                if (response.ok) {
                    renderizarTareas(data);
                } else {
                    console.error('Error al obtener las tareas:', data.message || data.error);
                }
            } catch (error) {
                console.error('Error de red:', error);
            }
        }

        function renderizarTareas(data) {
            const opcionesFormatoFecha = {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            };
            const opcionesFormatoHora = {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
            };

            // Obtener la fecha actual y calcular la fecha límite (hoy + 6 días)
            const hoy = new Date();
            const fechaLimite = new Date();
            fechaLimite.setDate(hoy.getDate() + 6);

            // Filtrar tareas dentro del rango de fechas
            const tareasFiltradas = data.filter(item => {
                const fechaFin = new Date(item.fecha_finpro);
                return fechaFin >= hoy && fechaFin <= fechaLimite;
            });

            let tareasContent = '';
            tareasFiltradas.forEach((item) => {
                // Formatear fechas
                const fechaInicio = new Date(item.fecha_iniciopro).toLocaleDateString('es-ES',
                    opcionesFormatoFecha);
                const horaInicio = new Date(item.fecha_iniciopro).toLocaleString('es-ES', opcionesFormatoHora);
                const fechaFin = new Date(item.fecha_finpro).toLocaleDateString('es-ES', opcionesFormatoFecha);
                const horaFin = new Date(item.fecha_finpro).toLocaleString('es-ES', opcionesFormatoHora);

                // Icono según el estado de entrega
                const iconoEntrega = item.entregado ?
                    '<svg xmlns="http://www.w3.org/2000/svg" fill="green" viewBox="0 0 20 20" class="w-5 h-5"><path d="M10 15.586l-4.293-4.293a1 1 0 0 1 1.414-1.414L10 12.586l3.879-3.879a1 1 0 0 1 1.414 1.414L10 15.586z"/></svg>' :
                    '<svg xmlns="http://www.w3.org/2000/svg" fill="red" viewBox="0 0 20 20" class="w-5 h-5"><path d="M10 15.586l-4.293-4.293a1 1 0 0 1 1.414-1.414L10 12.586l3.879-3.879a1 1 0 0 1 1.414 1.414L10 15.586z"/></svg>';

                tareasContent += `
                    <div class="flex flex-col gap-2 py-4 sm:gap-6 sm:flex-row sm:items-center border-b border-gray-200 dark:border-gray-700">
                        <div class="flex items-center">
                            ${iconoEntrega}
                            <p class="w-52 text-center text-lg font-normal text-gray-500 sm:text-center dark:text-gray-400 shrink-0">
                                Inicio: ${fechaInicio} ${horaInicio} <br> Fin: ${fechaFin} ${horaFin}
                            </p>
                        </div>
                        <p class="w-52 text-lg font-normal text-gray-500 sm:text-center dark:text-gray-400 shrink-0">
                            ${item.diasubido}
                        </p>
                        <p class="w-52 text-lg font-normal text-gray-500 sm:text-center dark:text-gray-400 shrink-0">
                            ${item.nombre_tarea}
                        </p>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                            <a href="${item.nombre_documento}" target="_blank" class="hover:underline">Link de la Tarea</a>
                        </h3>
                    </div>
                `;
            });

            document.getElementById('tareas-container').innerHTML = tareasContent || '<p>No hay tareas disponibles.</p>';
        }


        // Llamar a obtenerTareas con los IDs correspondientes
        document.addEventListener('DOMContentLoaded', () => {
            const trabajadorId = document.getElementById('trabajador_id').value;
            obtenerTareas(trabajadorId);
        });
    </script>
    
    {{-- Lista de equipos --}}
    <script>
        async function obtenerEquipamiento(trabajadorId) {
            try {
                const response = await fetch(`/valeequipos_list_trab/${trabajadorId}`);
                const data = await response.json();

                if (response.ok) {
                    renderizarEquipos(data); // Llamamos a la función que renderiza la tabla
                } else {
                    console.error('Error al obtener los equipos:', data.message || data.error);
                }
            } catch (error) {
                console.error('Error de red:', error);
            }
        }

        // Función para renderizar los equipos dentro de una tabla
        function renderizarEquipos(data) {
            const contenedor = document.getElementById('contenedorEquipos'); // Contenedor donde se agregará la tabla
            contenedor.innerHTML = ''; // Limpiar el contenedor

            // Crear la tabla HTML
            const tabla = document.createElement('table');
            tabla.classList.add('min-w-full', 'table-auto', 'border-collapse', 'border', 'border-gray-200');

            // Crear encabezado de la tabla
            tabla.innerHTML = `
                <thead class="bg-gray-100">
                    <tr>
                        <th class="px-4 py-2 text-center">TRABAJADOR</th>
                        <th class="px-4 py-2 text-center">FECHA DE ENTREGA</th>
                        <th class="px-4 py-2 text-center">CANTIDAD</th>
                        <th class="px-4 py-2 text-center">ESTADO</th>
                        <th class="px-4 py-2 text-center">EQUIPO ENTREGADO</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            `;

            // Rellenar la tabla con los datos
            const tbody = tabla.querySelector('tbody');

            data.forEach(vale => {
                const fila = document.createElement('tr');
                // Determinar el color según el estado del producto
                let estadoColor = '';
                switch (vale.estado_prod.toLowerCase()) {
                    case 'bien estado':
                        estadoColor = 'bg-green-100'; // Verde claro
                        break;
                    case 'intermedio':
                        estadoColor = 'bg-yellow-100'; // Amarillo claro
                        break;
                    case 'malogrado':
                        estadoColor = 'bg-red-100'; // Rojo claro
                        break;
                    default:
                        estadoColor = 'bg-gray-100'; // Gris claro si no es ninguno de los anteriores
                        break;
                }

                // Crear las celdas de la fila
                fila.innerHTML = `
                    <td class="px-4 py-2 border text-center">${vale.usuario.name} (${vale.usuario.username})</td>
                    <td class="px-4 py-2 border text-center">${vale.fecha_entregado}</td>
                    <td class="px-4 py-2 border text-center">${vale.cantidad_entrega}</td>
                    <td class="px-4 py-2 border text-center ${estadoColor}">${vale.estado_prod}</td>
                    <td class="px-4 py-2 border text-center">${vale.inventario.nombre_equipo} (Código: ${vale.inventario.codigo_inventario})</td>
                `;

                // Agregar la fila a la tabla
                tbody.appendChild(fila);
            });

            // Agregar la tabla al contenedor
            contenedor.appendChild(tabla);
        }

        // Llamada inicial cuando el documento está listo
        document.addEventListener('DOMContentLoaded', () => {
            const trabajadorId = document.getElementById('trabajador_id').value;
            obtenerEquipamiento(trabajadorId);
        });
    </script>

</x-app-layout>
