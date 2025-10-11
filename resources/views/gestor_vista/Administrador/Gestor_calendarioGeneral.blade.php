<x-app-layout>

    <link rel="stylesheet" href="{{ asset('assets/dist/event-calendar.css') }}" />

    <link rel="stylesheet" href="https://cdn.dhtmlx.com/fonts/wxi/wx-icons.css" />

    <link rel="stylesheet" href="{{ asset('assets/demos.css') }}" />

    <script src="{{ asset('assets/dist/event-calendar.js') }}"></script>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/date-fns/2.0.0-alpha0/date_fns.min.js"
        integrity="sha512-0kon+2zxkK5yhflwFqaTaIhLVDKGVH0YH/jm8P8Bab/4EOgC/n7gWyy7WE4EXrfPOVDeNdaebiAng0nsfeFd9A=="
        crossorigin="anonymous" referrerpolicy="no-referrer"></script>
        
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Gestor Calendarios General') }}
        </h2>
    </x-slot>
    <style>
        .wx-event-calendar_mark {
            display: none;
            /* Oculta el elemento siempre */
        }
    </style>
    <div class="py-10">
        <div class="max-w-9xl mx-auto sm:px-6 lg:px-8">
            <div id="calendar" class="shadow-lg rounded-lg p-4"></div>
        </div>
    </div>
    @foreach ($events as $event)
        <input type="hidden" class="eventosCalendar" value="{{ json_encode($event) }}">
    @endforeach

    <input type="hidden" class="listTrab" id="trabajadores" value="{{ json_encode($usuarios) }}">

    <input type="hidden" class="listproyectos" id="proyectos" value="{{ json_encode($proyectos) }}">


    <script>
        const {
            EventCalendar
        } = eventCalendar;
        const {
            format
        } = dateFns;


        document.addEventListener("DOMContentLoaded", () => {
            //obtener proyectos del inprut oculto
            const proyectosInput = document.getElementById('proyectos').value;
            const proyectos = JSON.parse(proyectosInput);
            const proyectosOptions = proyectos.map(proyecto => {
                return {
                    key: "proyecto_id",
                    id: proyecto.id_proyectos,
                    label: proyecto.nombre_proyecto
                }
            });
            // Obtener trabajadores del input oculto y convertirlos en calendarios
            const trabajadoresInput = document.getElementById('trabajadores').value;
            const trabajadores = JSON.parse(trabajadoresInput);
            /*const calendars = trabajadores.map(trabajador => {
                return {
                    id: trabajador.id,
                    label: trabajador.name,
                    readonly: false, // Puedes cambiar esto según sea necesario
                    active: true, // O ajustarlo según tu lógica
                    color: {
                        background: getRandomColor(), // Función para generar colores aleatorios
                        border: getRandomColor() // Otra vez, puedes personalizar esto
                    }
                };
            });*/
            const calendars = trabajadores
                    .filter(trabajador => trabajador.name !== "Administrador")
                    .map(trabajador => {
                        return {
                            id: trabajador.id,
                            label: trabajador.name,
                            readonly: false, // Puedes cambiar esto según sea necesario
                            active: true, // O ajustarlo según tu lógica
                            color: {
                                background: getRandomColor(), // Función para generar colores aleatorios
                                border: getRandomColor() // Personaliza según lo que necesites
                            }
                        };
                    });

            const eventInputs = document.querySelectorAll('.eventosCalendar');
            const events = Array.from(eventInputs).map(input => {
                const eventData = JSON.parse(input.value);
                return {
                    id: eventData.id,
                    text: eventData.text,
                    details: eventData.details,
                    start_date: new Date(eventData.start_date),
                    end_date: new Date(eventData.end_date),
                    allDay: eventData.allDay,
                    type: eventData.usuario_id,
                    proyecto_id: eventData.proyecto_id
                };
            });

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
                    options: calendars.map(calendar => ({
                        key: calendar.id,
                        label: calendar.text
                    }))
                },
                {
                    key: "proyecto_id",
                    name: "proyecto_id",
                    label: "Proyecto asignado",
                    type: "combo",
                    options: proyectosOptions // Asegúrate de que aquí los datos son correctos
                }
            ];


            // Configuración del calendario
            const calendar = new EventCalendar("#calendar", {
                events: events,
                calendars: calendars,
                theme: "willowDark",
                date: new Date(),
                mode: "month",
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
                editorShape: editorShape,
                templates: {
                    weekEvent: function({
                        event,
                        calendar
                    }) {
                        const start_date = format(event.start_date, "HH:mm");
                        const end_date = format(event.end_date, "HH:mm");
                        return `
                            <div class="week_event_wrapper">
                                <div>${event.text}</div>
                                <div>${start_date} - ${end_date}</div>
                                <div>Asignado a: ${calendars.find(cal => cal.id === event.calendar_id)?.text || 'Sin asignar'}</div>
                            </div>
                        `;
                    }
                }
            });

            calendar.api.on("add-event", (obj) => {
                const eventData = {
                    text: obj.event.text,
                    details: obj.event.details,
                    start_date: formatDate(obj.event.start_date),
                    end_date: formatDate(obj.event.end_date),
                    allDay: obj.event.allDay,
                    usuario_id: obj.event.type, // Aquí debes asignar el ID del usuario autenticado
                    proyecto_id: obj.event.proyecto_id,
                };
                fetch('{{ route('calendarios.trabajador.store') }}', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')
                                .getAttribute('content'), // Agregar token CSRF
                        },
                        body: JSON.stringify(eventData),
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log('Evento guardado:', data);
                        Swal.fire({
                            icon: 'success',
                            title: '¡Evento Creado!',
                            text: 'El evento ha sido Creado exitosamente.',
                        });
                        // Aquí puedes manejar la respuesta, como mostrar una notificación o actualizar la interfaz
                    })
                    .catch((error) => {
                        console.error('Error al guardar el evento:', error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Hubo un problema al Crear el evento. Inténtalo de nuevo.',
                        });
                    });
            });

            calendar.api.on("update-event", (obj) => {
                const updatedEventData = {
                    text: obj.event.text,
                    details: obj.event.details,
                    start_date: formatDate(obj.event.start_date),
                    end_date: formatDate(obj.event.end_date),
                    allDay: obj.event.allDay,
                    usuario_id: obj.event.type, // Aquí debes asignar el ID del usuario autenticado
                    proyecto_id: obj.event.proyecto_id,
                };
                const updateUrl = `/calendarios/trabajador/${obj.event.id}`;

                fetch(updateUrl, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')
                                .getAttribute('content'),
                        },
                        body: JSON.stringify(updatedEventData),
                    })
                    .then(response => {
                        if (!response.ok) {
                            return response.json().then(err => {
                                throw err;
                            });
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log('Evento actualizado:', data);
                        Swal.fire({
                            icon: 'success',
                            title: '¡Evento Actualizado!',
                            text: 'El evento ha sido Actualizado exitosamente.',
                        });
                        // Aquí puedes manejar la respuesta, como mostrar una notificación o actualizar la interfaz
                    })
                    .catch((error) => {
                        console.error('Error al actualizar el evento:', error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Hubo un problema al Actualizar el evento. Inténtalo de nuevo.',
                        });
                    });
            });

            calendar.api.on("delete-event", (obj) => {
                console.log("Eliminando evento con id:", obj.event.id);

                const deleteUrl = `/calendarios/trabajador/${obj.event.id}`;

                fetch(deleteUrl, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')
                                .getAttribute('content'),
                        },
                    })
                    .then(response => {
                        if (!response.ok) {
                            return response.json().then(err => {
                                throw err;
                            });
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log('Evento eliminado:', data);
                        Swal.fire({
                            icon: 'success',
                            title: '¡Evento eliminado!',
                            text: 'El evento ha sido eliminado exitosamente.',
                        });
                        // Aquí puedes manejar la respuesta, como mostrar una notificación o actualizar la interfaz
                    })
                    .catch((error) => {
                        console.error('Error al eliminar el evento:', error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Hubo un problema al eliminar el evento. Inténtalo de nuevo.',
                        });
                    });
            });

            // Manejar eventos del calendario
            calendar.api.on("EventClick", (event) => {
                console.log("Evento clickeado:", event);
            });
            calendar.api.on("EventDblClick", (event) => {
                console.log("Evento doble clickeado:", event);
            });
            calendar.api.on("DateClick", (date) => {
                console.log("Fecha clickeada:", date);
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
        });
    </script>

</x-app-layout>
