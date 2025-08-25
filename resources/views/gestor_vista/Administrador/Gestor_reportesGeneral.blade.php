<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Gestion Reportes') }}
        </h2>
    </x-slot>
    <input type="hidden" class="listTrab" id="trabajadores" value="{{ json_encode($usuarios) }}">

    <input type="hidden" class="listproyectos" name="proyectos" id="proyectos" value="{{ json_encode($proyectos) }}">

    <div class="py-12">
        <div class="container mx-auto w-full">
            <div class="flex flex-wrap">
                <div class="w-full md:w-1/3">
                    <div class="p-6 text-gray-900 dark:text-gray-100">
                        <div class="container flex flex-col items-center gap-16 mx-auto my-30">

                            {{-- REPORTE SEMANAL --}}
                            <div
                                class="flex flex-col items-center gap-3 px-8 py-10 bg-white dark:bg-gray-800 border-solid border-2 border-sky-400 rounded-3xl shadow-main">
                                <span class="text-lg font-bold text-blue-500">
                                    Reporte Semanal
                                </span>
                                <form method="POST" id="generar_reportes_semanal">
                                    @csrf
                                    <div>
                                        <x-input-label for="datedesde" :value="__('Desde')" />
                                        <x-text-input id="datedesde" class="block mt-1 w-full" type="date"
                                            name="datedesde" value="0" required autofocus />
                                    </div>
                                    <div>
                                        <x-input-label for="datehasta" :value="__('Hasta')" />
                                        <x-text-input id="datehasta" class="block mt-1 w-full" type="date"
                                            name="datehasta" value="0" required autofocus />
                                    </div>
                                    <input type="hidden" name="empresa_id" id="empresa_id" value="{{ $empresaId }}">
                                    <div class="flex items-center justify-end mt-4">
                                        <x-primary-button class="ml-4">
                                            {{ __('Generar Reporte Semanal') }}
                                        </x-primary-button>
                                    </div>
                                </form>
                            </div>
                            {{-- REPORTE MENSUAL --}}
                            <div
                                class="flex flex-col items-center gap-3 px-8 py-10 bg-white dark:bg-gray-800 border-solid border-2 border-sky-400 rounded-3xl shadow-main">
                                <span class="text-lg font-bold text-blue-500">
                                    Reporte Mensual
                                </span>
                                <form method="POST" id="generar_reportes_mensual">
                                    @csrf
                                    <div>
                                        <x-input-label for="mes_reporte" :value="__('Mes del reporte')" />
                                        <x-input-select id="mes_reporte" class="block mt-1 w-full" name="mes_reporte"
                                            required>
                                            <option selected="true" disabled="disabled">Mes</option>
                                            <option value="1">Enero</option>
                                            <option value="2">Febrero</option>
                                            <option value="3">Marzo</option>
                                            <option value="4">Abril</option>
                                            <option value="5">Mayo</option>
                                            <option value="6">Junio</option>
                                            <option value="7">Julio</option>
                                            <option value="8">Agosto</option>
                                            <option value="9">Setiembre</option>
                                            <option value="10">Octubre</option>
                                            <option value="11">Noviembre</option>
                                            <option value="12">Dicimenbre</option>
                                        </x-input-select>
                                    </div>
                                    <input type="hidden" name="empresa_id" id="empresa_id" value="{{ $empresaId }}">
                                    <div class="flex items-center justify-end mt-4">
                                        <x-primary-button class="ml-4">
                                            {{ __('Generar Reporte Mensual') }}
                                        </x-primary-button>
                                    </div>
                                </form>
                            </div>
                            {{-- REPORTE ASISTENCIA --}}
                            <div
                                class="flex flex-col items-center gap-3 px-8 py-10 bg-white dark:bg-gray-800 border-solid border-2 border-sky-400 rounded-3xl shadow-main">
                                <span class="text-lg font-bold text-blue-500">
                                    Reporte Asistencia
                                </span>
                                <form method="POST" id="generar_reportes_Asistencia">
                                    @csrf
                                    <div>
                                        <x-input-label for="mes_reporte_asistencia" :value="__('Mes del reporte')" />
                                        <x-input-select id="mes_reporte_asistencia" class="block mt-1 w-full"
                                            name="mes_reporte_asistencia" required>
                                            <option selected="true" disabled="disabled">Mes</option>
                                            <option value="1">Enero</option>
                                            <option value="2">Febrero</option>
                                            <option value="3">Marzo</option>
                                            <option value="4">Abril</option>
                                            <option value="5">Mayo</option>
                                            <option value="6">Junio</option>
                                            <option value="7">Julio</option>
                                            <option value="8">Agosto</option>
                                            <option value="9">Setiembre</option>
                                            <option value="10">Octubre</option>
                                            <option value="11">Noviembre</option>
                                            <option value="12">Dicimenbre</option>
                                        </x-input-select>
                                    </div>
                                    <div>
                                        <x-input-label for="anio_reporte_asistencia" :value="__('Año del reporte')" />
                                        <x-input-select id="anio_reporte_asistencia" class="block mt-1 w-full" name="anio_reporte_asistencia" required>
                                            @for ($anio = 2020; $anio <= 2030; $anio++)
                                                <option value="{{ $anio }}" {{ old('anio_reporte_asistencia') == $anio ? 'selected' : '' }}>
                                                    {{ $anio }}
                                                </option>
                                            @endfor
                                        </x-input-select>
                                    </div>
                                    <input type="hidden" name="empresa_id" id="empresa_id" value="{{ $empresaId }}">
                                    <div class="flex items-center justify-end mt-4">
                                        <x-primary-button class="ml-4">
                                            {{ __('Generar Reporte Asistencia') }}
                                        </x-primary-button>
                                    </div>
                                </form>
                            </div>
                            {{-- INFORME DE PAGO MENSUAL --}}
                            <div
                                class="flex flex-col items-center gap-3 px-8 py-10 bg-white dark:bg-gray-800 border-solid border-2 border-sky-400 rounded-3xl shadow-main">
                                <span class="text-lg font-bold text-blue-500">
                                    Informe de Pago Mensual
                                </span>
                                <form method="POST" id="informe_pago_personal">
                                    @csrf
                                    <div>
                                        <x-input-label for="adelanto" :value="__('Adelanto')" />
                                        <x-text-input id="adelanto" class="block mt-1 w-full" type="number"
                                            name="adelanto" value="0" required autofocus />
                                    </div>
                                    <div>
                                        <x-input-label for="permisos" :value="__('Permisos')" />
                                        <x-text-input id="permisos" class="block mt-1 w-full" type="number"
                                            name="permisos" value="0" required autofocus />
                                    </div>
                                    <div>
                                        <x-input-label for="incMof" :value="__('Incumplimineto de MOF')" />
                                        <x-text-input id="incMof" class="block mt-1 w-full" type="number"
                                            name="incMof" value="0" required autofocus />
                                    </div>
                                    <div>
                                        <x-input-label for="bondtrab" :value="__('Bonificacion')" />
                                        <x-text-input id="bondtrab" class="block mt-1 w-full" type="number"
                                            name="bondtrab" value="0" required autofocus />
                                    </div>
                                    <div>
                                        <x-input-label for="descuenttrab" :value="__('Descuentos')" />
                                        <x-text-input id="descuenttrab" class="block mt-1 w-full" type="number"
                                            name="descuenttrab" value="0" required autofocus />
                                    </div>
                                    <div>
                                        <x-input-label for="personalIpago" :value="__('Trabajador')" />
                                        <x-input-select id="personalIpago" class="block mt-1 w-full" name="personalIpago" required>
                                            <option value="">Seleccione un trabajador</option>
                                            @foreach ($usuarios as $usuario)
                                                @php
                                                    $excludedNames = [
                                                        "ANDREA ALEXANDRA", 
                                                        "LUIS ANGEL", 
                                                        "JORGE DAVID", 
                                                        "FERNANDO PIERO", 
                                                        "YESICA",
                                                        "Administrador"
                                                    ];
                                                @endphp
                                                
                                                @if (!in_array($usuario->name, $excludedNames))
                                                    <option value="{{ $usuario->id }}">{{ $usuario->name }}</option>
                                                @endif
                                            @endforeach
                                        </x-input-select>
                                    </div>

                                    <div>
                                        <x-input-label for="informe_pago_mes" :value="__('Mes')" />
                                        <x-input-select id="informe_pago_mes" class="block mt-1 w-full"
                                            name="informe_pago_mes" required>
                                            <option disabled="disabled">Mes</option>
                                            <option value="1">Enero</option>
                                            <option value="2">Febrero</option>
                                            <option value="3">Marzo</option>
                                            <option value="4">Abril</option>
                                            <option value="5">Mayo</option>
                                            <option value="6">Junio</option>
                                            <option value="7">Julio</option>
                                            <option value="8">Agosto</option>
                                            <option value="9">Setiembre</option>
                                            <option value="10">Octubre</option>
                                            <option value="11">Noviembre</option>
                                            <option value="12">Dicimenbre</option>
                                        </x-input-select>
                                    </div>
                                    <input type="hidden" name="empresa_id" id="empresa_id"
                                        value="{{ $empresaId }}">

                                    <div class="flex items-center justify-end mt-4">
                                        <x-primary-button class="ml-4">
                                            {{ __('Generar Informe de Pago') }}
                                        </x-primary-button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="w-full md:w-2/3 px-4 mt-4 md:mt-0">
                    <h3 class="text-blue-500">Vista Previa</h3>
                    <div class="overflow-x-auto" style="height: 900px" id="mostrarInformePago"></div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://unpkg.com/jspdf@latest/dist/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.14/jspdf.plugin.autotable.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"></script>

    {{-- script de reporte semanal --}}
    <script>
        document.addEventListener("DOMContentLoaded", () => {
            $('#generar_reportes_semanal').submit(e => {
                e.preventDefault(); // Evita que se envíe el formulario de forma tradicional
                const formMensual = document.getElementById("generar_reportes_semanal");
                const informeMensual = new FormData(formMensual);
                $.ajax({
                    type: 'POST',
                    url: `/gestorReportes/obtenerTareasSemanal`,
                    data: informeMensual,
                    contentType: false, // Indica que no se envíe un tipo de contenido
                    processData: false, // Evita que jQuery procese los datos
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                    },
                    success: function(response) {
                        console.log(response);
                        const fechaInicio = response.fecha_desde;
                        const fechaFin = response.fecha_hasta;
                        const fechaInicioObj = new Date(fechaInicio);
                        const mesInicio = fechaInicioObj.getMonth() + 1;
                        const mes_reporte = mesInicio;

                        const tareaActualS = response.tareas_actuales;
                        const tareaAnteriorS = response.tareas_anteriores;
                        const dataTrabajadoresS = response.trabajadores;
                        informeSemanalProyectos(tareaActualS, tareaAnteriorS, dataTrabajadoresS,
                            mes_reporte);
                    },
                    error: function(xhr) {
                        console.error(xhr.responseText);
                    }
                });
            });


            function informeSemanalProyectos(tareaActualS, tareaAnteriorS, dataTrabajadoresS, mes_reporte) {
                const id_empresa = parseInt($('#empresa_id').val());
                const dataproyectos = $('#proyectos').val();

                const dataproyectosparses = JSON.parse(dataproyectos);

                const dataMensual = tareaActualS.map(tarea => {
                    // Encontrar el trabajador correspondiente
                    const dattrabajador = dataTrabajadoresS.find(trab => trab.id === tarea
                        .trabajar_asignadot);

                    // Encontrar el proyecto correspondiente
                    const proyecto = dataproyectosparses.find(dataproyecto => dataproyecto
                        .id_proyectos === tarea.proyecto_asignadot);

                    // Retornar un nuevo objeto que combine la tarea, el trabajador y el proyecto
                    return {
                        ...tarea,
                        id_trabajador: dattrabajador ? dattrabajador.id : null, // Asignar id del trabajador
                        nombre_trab: dattrabajador ? dattrabajador.name :
                        null, // Asignar nombre del trabajador
                        id_proyectos: proyecto ? proyecto.id_proyectos : null, // Asignar id del proyecto
                        nombre_proyecto: proyecto ? proyecto.nombre_proyecto :
                            null // Asignar nombre del proyecto
                    };
                });

                // Combinar tareas con proyectos
                const dataGMensual = tareaAnteriorS.map(tarea => {
                    const dattrabajadors = dataTrabajadoresS.find(trab => trab.id === tarea
                        .trabajar_asignadot);

                    const proyecto = dataproyectosparses.find(dataproyectosparse =>
                        dataproyectosparse
                        .id_proyectos === tarea.proyecto_asignadot);

                    return {
                        ...tarea,
                        id_trabajador: dattrabajadors ? dattrabajadors.id :
                        null, // Asignar id del trabajador
                        nombre_trab: dattrabajadors ? dattrabajadors.name :
                        null, // Asignar nombre del trabajador
                        nombre_proyecto: proyecto ? proyecto.nombre_proyecto : null,
                        plazo_total_pro: proyecto ? proyecto.plazo_total_pro : null
                    };
                });

                let nombre_empresa = '';
                let cargo = "";
                let imagenEmpresa = '';
                /*Nombre de la Empresa*/
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
                        nombre_empresa =
                            "Empresa no reconocida"; // Valor por defecto si no coincide con ninguno
                }
                /*cargo*/
                switch (id_empresa) {
                    case 1:
                        cargo = "Sub Gerente de Estructuras";
                        break
                    case 2:
                        cargo = "Sub Gerente de Estudios";
                        break
                    case 3:
                        cargo = "Sub Gerente de Obras";
                        break
                    case 4:
                        cargo = "Sub Gerente de Arquitectura";
                        break
                    case 5:
                        cargo = "Sub Gerente de Informatica";
                        break
                    default:
                        cargo = "cargo no reconocida"; // Valor por defecto si no coincide con ninguno
                }
                /*imagen de la empresa*/
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
                        imagenEmpresa =
                            "{{ asset('storage/avatar_empresa/logo_default.png') }}"; // Imagen por defecto
                }
                const date = new Date();
                const anioactual = new Date().getFullYear();
                const FechaActual = new Date().toLocaleString();
                const mesActual = new Intl.DateTimeFormat('es', {
                    month: 'long'
                }).format(date).toUpperCase();

                // Obtener fecha de inicio del mes actual
                const primerDiaMes = new Date(anioactual, date.getMonth(), 1);
                const inicioMes = primerDiaMes.toLocaleDateString('es', {
                    day: '2-digit',
                    month: 'long'
                });

                // Obtener fecha de fin del mes actual
                const ultimoDiaMes = new Date(anioactual, date.getMonth() + 1, 0);
                const finMes = ultimoDiaMes.toLocaleDateString('es', {
                    day: '2-digit',
                    month: 'long'
                });
                let nombreJefe = '';
                let apellidoJefe = '';
                let tipoGerencia = '';
                // Definimos los jefes por empresa
                const jefesPorEmpresa = {
                        1: {
                            name: 'LUIS DANIEL',
                            surname: 'ARGANDOÑA PILCO',
                            tipoGerencia: 'AREA ESTRUCTURAS'
                        },
                        2: {
                            name: 'JOSE EDUARDO',
                            surname: 'NIEVES CUADROS',
                            tipoGerencia: 'AREA OFICINA TECNICA'
                        },
                        3: {
                            name: 'JOSE FRANCO',
                            surname: 'ROMERO PONCE',
                            tipoGerencia: 'AREA CAMPO'
                        },
                        4: {
                            name: 'DORIS DEL PILAR',
                            surname: 'MEZA LOPEZ',
                            tipoGerencia: 'AREA ARQUITECTURA'
                        },
                        5: {
                            name: 'EMERSON MESIAS',
                            surname: 'ESPINOZA SALAZAR',
                            tipoGerencia: 'AREA SISTEMAS'
                        },
                    };
                const jefe = jefesPorEmpresa[id_empresa];

                if (jefe) {
                    nombreJefe = jefe.name;
                    apellidoJefe = jefe.surname;
                    tipoGerencia = jefe.tipoGerencia;
                }

                const pdf_semanal = new window.jspdf.jsPDF();
                pdf_semanal.setFontSize(11);
                pdf_semanal.setFont("helvetica", "bold");
                pdf_semanal.text("Informe N° 00" + mes_reporte + "-" + anioactual + "/" + nombre_empresa, 20, 20);
                pdf_semanal.setFont("courier", "bold");
                pdf_semanal.setFontSize(10);
                pdf_semanal.text("SEÑOR(A): ", 20, 30);
                pdf_semanal.setFont("courier", "normal");
                pdf_semanal.text("Andrea Alexandra Paredes Sánchez", 40, 30);
                pdf_semanal.setFont("courier", "bold");
                pdf_semanal.text("Administradora ", 40, 35);
                pdf_semanal.setFont("courier", "bold");
                pdf_semanal.text("DE: ", 20, 40);
                pdf_semanal.setFont("courier", "normal");
                pdf_semanal.text(nombreJefe + ' ' + apellidoJefe, 40, 40);
                pdf_semanal.setFont("courier", "bold");
                pdf_semanal.text("Responsable de OFICINA TECNICA", 40, 45);
                pdf_semanal.setFont("courier", "bold");
                pdf_semanal.text("ASUNTO:", 20, 50);
                pdf_semanal.setFont("courier", "normal");
                pdf_semanal.text("INFORME DE AVANCE MENSUAL DEL MES DE " + mesActual + " del " + anioactual, 40,
                    50);
                pdf_semanal.setFont("courier", "bold");
                pdf_semanal.text("FECHA:", 20, 55);
                pdf_semanal.setFont("courier", "normal");
                pdf_semanal.text("HUANUCO," + FechaActual, 40, 55);

                pdf_semanal.addImage(imagenEmpresa, "JPEG", 125, 10, 60, 30);
                pdf_semanal.setFontSize(9);
                pdf_semanal.text(
                    "Por medio de la presente me es grato dirigirme a Ud. Cordialmente y felicitarlo por", 20,
                    65);
                pdf_semanal.text(
                    "la acertada labor que viene desempeñando, así mismo entrego a su despacho el informe", 20,
                    70);
                pdf_semanal.text("de avance del area, para ello se detalla a continuación:", 20, 75);
                pdf_semanal.setFont("courier", "bold");
                pdf_semanal.text("REPORTE MENSUAL DE PROYECTOS-" + tipoGerencia, 20, 85);
                pdf_semanal.setFont("courier", "normal");
                pdf_semanal.text("El resumen de actividades del mes (" + inicioMes + " hasta " + finMes + " del " +
                    anioactual + " ) del personal", 20, 95);
                pdf_semanal.text("a mi responsabilidad es el siguiente: ", 20, 100);

                pdf_semanal.setFontSize(9); // Establecer el tamaño de letra a 9

                // Crear la tabla con autotable
                pdf_semanal.autoTable({
                    head: [
                        ["PROYECTO", "FECHA INICIO", "FECHA FINAL", "DIAS TRABAJADOS", "PLAZO TOTAL",
                            "% DE AVANCE", "% DE AVANCE PROGRAMADO", "CONCLUSION", "DIAS"
                        ]
                    ],
                    body: datamensualsem(dataGMensual),
                    startY: 105, // Ajustar según la posición deseada
                    styles: {
                        fontSize: 8, // Establecer el tamaño de letra a 8
                        valign: 'middle', // Alinear verticalmente al centro
                        halign: 'center', // Alinear horizontalmente al centro
                        lineWidth: 0.5, // Establecer el grosor de los bordes
                        lineColor: '#000000',
                    },
                    theme: 'plain', // Puedes ajustar el tema según tus preferencias
                });

                pdf_semanal.text(
                    "Se presenta el resumen de días trabajados de cada trabajador a mi responsabilidad con sus",
                    20,
                    pdf_semanal.autoTable.previous.finalY + 10);
                pdf_semanal.text("sus proyectos encargados (" + inicioMes + " hasta el " + finMes + " del " +
                    anioactual + ").", 20,
                    pdf_semanal.autoTable.previous.finalY + 15);
                
                const filteredTrabajadores = dataTrabajadoresS.map(data => data.name);
                const excludedNames = [
                    "ANDREA ALEXANDRA", 
                    "LUIS ANGEL", 
                    "JORGE DAVID", 
                    "FERNANDO PIERO", 
                    "YESICA",
                    "Administrador"
                ];
                
                // Filtramos los nombres que no están en excludedNames
                const trabajadores = filteredTrabajadores.filter(trabajador => !excludedNames.includes(trabajador));


                //const trabajadores = dataTrabajadoresS.map(dataTrabajadoresS => dataTrabajadoresS.name);
                const headColumns = ["PROYECTO", "TEST", "DIAS PARCIAL", ...trabajadores, "ACUMULADO"];
                pdf_semanal.autoTable({
                    head: [headColumns], // Utiliza el array headColumns
                    body: mensualPersonalsem(dataMensual, dataGMensual, mes_reporte, trabajadores),
                    startY: pdf_semanal.autoTable.previous.finalY + 20,
                    styles: {
                        fontSize: 8,
                        valign: 'middle',
                        halign: 'center',
                        lineWidth: 0.5, // Establecer el grosor de los bordes
                        lineColor: '#000000',
                    },
                    theme: 'plain',
                });

                pdf_semanal.setFont("courier", "bold");
                pdf_semanal.setFontSize(11);
                pdf_semanal.text("CONCLUSIONES: ", 20, pdf_semanal.autoTable.previous.finalY + 30);
                pdf_semanal.setFontSize(9);
                pdf_semanal.setFont("courier", "normal");
                pdf_semanal.text("Actividad que se trabajo durante este mes.", 20, pdf_semanal.autoTable.previous
                    .finalY + 35);

                pdf_semanal.autoTable({
                    head: [
                        ["PROYECTO", "CONCLUSION", "OBSERVACIONES"]
                    ],
                    body: conclusionMensualsem(dataMensual),
                    startY: pdf_semanal.autoTable.previous.finalY +
                        40, // Dejar espacio entre las dos tablas
                    styles: {
                        fontSize: 8,
                        valign: 'middle',
                        halign: 'center',
                        lineWidth: 0.5, // Establecer el grosor de los bordes
                        lineColor: '#000000',
                    },
                    theme: 'plain',
                });

                // Generar el string del PDF
                const string = pdf_semanal.output('datauristring');
                // Crear un elemento <embed> para mostrar el PDF
                const embedElement = document.createElement('embed');
                embedElement.setAttribute('width', '100%');
                embedElement.setAttribute('height', '100%');
                embedElement.setAttribute('src', string);

                // Obtener el div donde deseas mostrar el PDF
                const divMostrarInformePago = document.getElementById('mostrarInformePago');

                // Limpiar cualquier contenido previo dentro del div
                divMostrarInformePago.innerHTML = '';

                // Agregar el elemento <embed> al div
                divMostrarInformePago.appendChild(embedElement);
            }

            function calcularDiasTrabajosem(diasTrabajo, avanceProgramado, porcentajeTotal, avanceReal,
                plazoTotal) {
                let dias = 0;
                if (((avanceProgramado - porcentajeTotal) / 100) * plazoTotal > 0) {
                    dias = Math.round(parseInt(((avanceProgramado - porcentajeTotal) / 100) * plazoTotal));
                } else {
                    dias = "OK";
                }

                return dias;
            }

            function formatDatesem(date) {
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                return `${day}/${month}/${year}`;
            }

            function datamensualsem(dataGMensual) {
                const proyectosAgrupados = {};
                dataGMensual.forEach(observacion => {
                    const key = observacion.nombre_proyecto;
                    if (!proyectosAgrupados[key]) {
                        proyectosAgrupados[key] = {
                            porcentajeTotal: 0,
                            cantidadTareas: 0,
                            detalle: [],
                            plazoTotalTrab: observacion
                                .plazo_total_pro, // Utilizar el valor de plazo_total_pro
                            fechas: {
                                inicio: null,
                                fin: null
                            }
                        };
                    }
                    proyectosAgrupados[key].porcentajeTotal += parseFloat(observacion.porcentaje_tarea);
                    proyectosAgrupados[key].cantidadTareas++;
                    proyectosAgrupados[key].detalle.push(observacion);
                    const fechaInicio = new Date(observacion.fecha_iniciopro);
                    const fechaFin = new Date(observacion.fecha_finpro);
                    const fechaSubida = new Date(observacion.fecha_subido_t);

                    if (!proyectosAgrupados[key].fechas.inicio || fechaInicio < proyectosAgrupados[key]
                        .fechas.inicio) {
                        proyectosAgrupados[key].fechas.inicio = fechaInicio;
                    }
                    if (!proyectosAgrupados[key].fechas.fin || fechaFin > proyectosAgrupados[key].fechas
                        .fin) {
                        proyectosAgrupados[key].fechas.fin = fechaFin;
                    }
                    // Calcular días trabajados considerando fechas de subida
                    if (!proyectosAgrupados[key].diasTrabajo) {
                        proyectosAgrupados[key].diasTrabajo = {};
                    }
                    const keyFechaSubida = fechaSubida.toISOString().substring(0, 10);
                    if (!proyectosAgrupados[key].diasTrabajo[keyFechaSubida]) {
                        proyectosAgrupados[key].diasTrabajo[keyFechaSubida] = 0;
                    }
                    proyectosAgrupados[key].diasTrabajo[keyFechaSubida]++;
                });

                const result = [];
                for (const proyecto in proyectosAgrupados) {
                    const detalleProyecto = proyectosAgrupados[proyecto].detalle[0];
                    const porcentajeTotal = (proyectosAgrupados[proyecto].porcentajeTotal / proyectosAgrupados[
                        proyecto].cantidadTareas).toFixed(2);
                    const avanceProgramado = (((proyectosAgrupados[proyecto].cantidadTareas * 1) /
                        proyectosAgrupados[proyecto].plazoTotalTrab) * 100).toFixed(2);
                    const avanceProgramadoNumerom = parseFloat(avanceProgramado);
                    const porcentajeTotalNumerom = parseFloat(porcentajeTotal);
                    const conclusion = (avanceProgramadoNumerom > porcentajeTotalNumerom) ? "RETRASADO" : "BIEN";
                    const diasTrabajo = calcularDiasTrabajosem(proyectosAgrupados[proyecto].diasTrabajo,
                        avanceProgramado, porcentajeTotal, avanceProgramado, proyectosAgrupados[proyecto]
                        .plazoTotalTrab);
                    result.push([
                        proyecto,
                        formatDatesem(proyectosAgrupados[proyecto].fechas.inicio),
                        formatDatesem(proyectosAgrupados[proyecto].fechas.fin),
                        proyectosAgrupados[proyecto].cantidadTareas,
                        proyectosAgrupados[proyecto]
                        .plazoTotalTrab, // Utilizar el plazo total proporcionado
                        porcentajeTotal,
                        avanceProgramado,
                        conclusion,
                        diasTrabajo,
                    ]);
                }

                return result;
            }

            function obtenerTareasPorTrabajadorsem(detalleProyecto, trabajadores) {
                const tareasPorTrabajador = new Array(trabajadores.length).fill(0);

                detalleProyecto.forEach(observacion => {
                    const trabajadorIndex = trabajadores.indexOf(observacion.nombre_trab);
                    if (trabajadorIndex !== -1) {
                        if (observacion.fecha_subido_t === observacion.fecha_iniciopro) {
                            tareasPorTrabajador[trabajadorIndex] +=
                                1; // Sumamos 1 si la tarea fue entregada el mismo día
                        } else {
                            tareasPorTrabajador[trabajadorIndex] +=
                                0.5; // Sumamos 0.5 si la tarea fue entregada en otro día
                        }
                    }
                });

                return tareasPorTrabajador;
            }

            function calcularAcumuladosem(dataMensual, proyecto) {
                let totalFilas = 0;

                // Contar el total de filas para el proyecto dado en todas las observaciones mensuales
                dataMensual.forEach(observacion => {
                    if (observacion.nombre_proyecto === proyecto) {
                        if (observacion.fecha_subido_t === observacion.fecha_iniciopro) {
                            totalFilas++; // Si la tarea se entregó el mismo día, se suma como 1
                        } else {
                            totalFilas += 0.5; // Si la tarea se entregó en otro día, se suma como 0.5
                        }
                    }
                });

                return totalFilas;
            }
            // Función para calcular los días parciales hasta el mes anterior al reportado
            function calcularDiasParcialessem(dataGMensual, mes_reporte) {
                let sumaTareas = 0;

                // Filtrar observaciones de dataGMensual para obtener solo las correspondientes al mes anterior al mes reportado
                const observacionesMesAnterior = dataGMensual.filter(observacion => {
                    const fechaSubida = new Date(observacion.fecha_subido_t);
                    const mesSubida = fechaSubida.getMonth() + 1;
                    return mesSubida < mes_reporte;
                });
                console.log(dataGMensual)

                // Calcular la suma de tareas entregadas en el mes anterior al mes reportado
                observacionesMesAnterior.forEach(observacion => {
                    if (observacion.fecha_subido_t === observacion.fecha_iniciopro) {
                        sumaTareas++;
                    } else {
                        sumaTareas += 0.5;
                    }
                });

                return sumaTareas;
            }

            function mensualPersonalsem(dataMensual, dataGMensual, mes_reporte, trabajadores) {
                const proyectosAgrupados = {};

                // Procesar dataMensual
                dataMensual.forEach(observacion => {
                    const key = observacion.nombre_proyecto;
                    if (!proyectosAgrupados[key]) {
                        proyectosAgrupados[key] = {
                            porcentajeTotal: 0,
                            cantidadTareas: 0,
                            detalle: [],
                            fechas: {
                                inicio: null,
                                fin: null
                            }
                        };
                    }
                    proyectosAgrupados[key].porcentajeTotal += parseFloat(observacion.porcentaje_tarea);
                    proyectosAgrupados[key].cantidadTareas++;
                    proyectosAgrupados[key].detalle.push(observacion);
                    const fechaInicio = new Date(observacion.fecha_iniciopro);
                    const fechaFin = new Date(observacion.fecha_finpro);
                    const fechaSubida = new Date(observacion.fecha_subido_t);
                    if (!proyectosAgrupados[key].fechas.inicio || fechaInicio < proyectosAgrupados[key]
                        .fechas.inicio) {
                        proyectosAgrupados[key].fechas.inicio = fechaInicio;
                    }

                    if (!proyectosAgrupados[key].fechas.fin || fechaFin > proyectosAgrupados[key].fechas
                        .fin) {
                        proyectosAgrupados[key].fechas.fin = fechaFin;
                    }

                    // Calcular días trabajados considerando fechas de subida
                    if (!proyectosAgrupados[key].diasTrabajo) {
                        proyectosAgrupados[key].diasTrabajo = {};
                    }
                    const keyFechaSubida = fechaSubida.toISOString().substring(0, 10);
                    if (!proyectosAgrupados[key].diasTrabajo[keyFechaSubida]) {
                        proyectosAgrupados[key].diasTrabajo[keyFechaSubida] = 0;
                    }
                    proyectosAgrupados[key].diasTrabajo[keyFechaSubida]++;
                });

                const result = [];
                for (const proyecto in proyectosAgrupados) {
                    const detalleProyecto = proyectosAgrupados[proyecto].detalle[0];
                    const plazoTotalTrab = calcularDiferenciaDiassem(proyectosAgrupados[proyecto].fechas.inicio,
                        proyectosAgrupados[proyecto].fechas.fin) + 1;
                    const diasParciales = calcularDiasParcialessem(dataGMensual, mes_reporte);
                    const tareasPorTrabajador = obtenerTareasPorTrabajadorsem(proyectosAgrupados[proyecto].detalle,
                        trabajadores);
                    const porcentajeTotal = (proyectosAgrupados[proyecto].porcentajeTotal / proyectosAgrupados[
                        proyecto].cantidadTareas).toFixed(2);
                    const acumulado = calcularAcumuladosem(dataMensual, proyecto) +
                        diasParciales; // Sumar los días parciales al acumulado

                    result.push([
                        proyecto,
                        0, // Valor de test
                        diasParciales,
                        ...tareasPorTrabajador,
                        acumulado,
                    ]);
                }

                // Sumar las tareas entregadas por cada trabajador y mostrar el total
                const totalTareasPorTrabajador = trabajadores.map((trabajador, index) => {
                    return result.reduce((acc, row) => acc + parseFloat(row[index + 3]),
                        0); // Empezamos desde la cuarta columna
                });

                // Agregar fila para mostrar el total de tareas por trabajador
                result.push([
                    'TOTAL DIAS TRABAJADOS',
                    '', // Espacio para la columna de prueba
                    '', // Espacio para la columna de días parciales
                    ...totalTareasPorTrabajador, // Total de tareas por cada trabajador
                    '', // Espacio para la columna de acumulado
                ]);
                return result;
            }

            function conclusionMensualsem(dataMensual) {
                const proyectosAgrupados = {};

                dataMensual.forEach(observacion => {
                    const key = observacion.nombre_proyecto;

                    if (!proyectosAgrupados[key]) {
                        proyectosAgrupados[key] = {
                            porcentajeTotal: 0,
                            cantidadTareas: 0,
                            detalle: [],
                            fechas: {
                                inicio: null,
                                fin: null
                            }
                        };
                    }

                    proyectosAgrupados[key].porcentajeTotal += parseInt(observacion.porcentaje_tarea, 10);
                    proyectosAgrupados[key].cantidadTareas++;
                    proyectosAgrupados[key].detalle.push(observacion);

                    const fechaInicio = new Date(observacion.fecha_iniciopro);
                    const fechaFin = new Date(observacion.fecha_finpro);

                    if (!proyectosAgrupados[key].fechas.inicio || fechaInicio < proyectosAgrupados[key]
                        .fechas.inicio) {
                        proyectosAgrupados[key].fechas.inicio = fechaInicio;
                    }

                    if (!proyectosAgrupados[key].fechas.fin || fechaFin > proyectosAgrupados[key].fechas
                        .fin) {
                        proyectosAgrupados[key].fechas.fin = fechaFin;
                    }
                });

                return Object.entries(proyectosAgrupados).map(([proyecto, {
                    detalle
                }]) => {
                    const detalleProyecto = detalle[0];
                    const plazoTotalTrab = calcularDiferenciaDiassem(proyectosAgrupados[proyecto].fechas
                        .inicio, proyectosAgrupados[proyecto].fechas.fin) + 1;
                    const avanceProgramado = (((proyectosAgrupados[proyecto].cantidadTareas * 1) /
                        plazoTotalTrab) * 100).toFixed(2);
                    const dias = ((avanceProgramado - detalleProyecto.porcentaje_tarea) * (plazoTotalTrab /
                        100)).toFixed(2);
                    const conclusionGeneral = tipoconclusionessem(dias);
                    const obvGneral = observacionessem(dias);

                    return [proyecto, conclusionGeneral, obvGneral];
                });
            }

            function calcularDiferenciaDiassem(fechaInicio, fechaFin) {
                const diferenciaEnMilisegundos = fechaFin - fechaInicio;
                return Math.floor(diferenciaEnMilisegundos / (1000 * 60 * 60 * 24));
            }

            function observacionessem(dias) {
                if (dias > 1) {
                    return "Se considera retraso de " + dias + " dia.";
                } else {
                    return " ";
                }
            }

            function tipoconclusionessem(dias) {
                if (dias > 1) {
                    return "El proyecto se ha completado";
                } else if (dias == 0) {
                    return "El proyecto se ha completado";
                } else {
                    return "El proyecto no se ha concluido.";
                }
            }
        });
    </script>

    {{-- script de reporte Mensual --}}
    <script>
        document.addEventListener("DOMContentLoaded", () => {
            $('#generar_reportes_mensual').submit(e => {
                e.preventDefault(); // Evita que se envíe el formulario de forma tradicional
                const formMensual = document.getElementById("generar_reportes_mensual");
                const informeMensual = new FormData(formMensual);
                $.ajax({
                    type: 'POST',
                    url: `/gestorReportes/obtenerTareasMensual`,
                    data: informeMensual,
                    contentType: false, // Indica que no se envíe un tipo de contenido
                    processData: false, // Evita que jQuery procese los datos
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                    },
                    success: function(response) {
                        const tareaAnterior = response.tareas_anteriores;
                        const tareaActual = response.tareas_actuales;
                        const datatrabajadores = response.trabajadores;
                        const mes_seleccionado = response.mes_seleccionado;
                        informe_mensual(tareaActual, tareaAnterior, datatrabajadores,
                            mes_seleccionado)
                    },
                    error: function(xhr) {
                        console.error(xhr.responseText);
                    }
                });

                function informe_mensual(tareaActual, tareaAnterior, datatrabajadores, mes_seleccionado) {
                    const id_empresa = $('#empresa_id').val();
                    const dataproyectos = $('#proyectos').val();

                    const dataproyectosparses = JSON.parse(dataproyectos);

                    const dataMensual = tareaActual.map(tarea => {
                        // Encontrar el trabajador correspondiente
                        const dattrabajador = datatrabajadores.find(trab => trab.id === tarea
                            .trabajar_asignadot);

                        // Encontrar el proyecto correspondiente
                        const proyecto = dataproyectosparses.find(dataproyecto => dataproyecto
                            .id_proyectos === tarea.proyecto_asignadot);

                        // Retornar un nuevo objeto que combine la tarea, el trabajador y el proyecto
                        return {
                            ...tarea,
                            id_trabajador: dattrabajador ? dattrabajador.id :
                            null, // Asignar id del trabajador
                            nombre_trab: dattrabajador ? dattrabajador.name :
                            null, // Asignar nombre del trabajador
                            id_proyectos: proyecto ? proyecto.id_proyectos :
                            null, // Asignar id del proyecto
                            nombre_proyecto: proyecto ? proyecto.nombre_proyecto :
                                null // Asignar nombre del proyecto
                        };
                    });

                    // Combinar tareas con proyectos
                    const dataGMensual = tareaAnterior.map(tarea => {
                        const dattrabajadors = datatrabajadores.find(trab => trab.id === tarea
                            .trabajar_asignadot);

                        const proyecto = dataproyectosparses.find(dataproyectosparse =>
                            dataproyectosparse
                            .id_proyectos === tarea.proyecto_asignadot);

                        return {
                            ...tarea,
                            id_trabajador: dattrabajadors ? dattrabajadors.id :
                            null, // Asignar id del trabajador
                            nombre_trab: dattrabajadors ? dattrabajadors.name :
                            null, // Asignar nombre del trabajador
                            nombre_proyecto: proyecto ? proyecto.nombre_proyecto : null,
                            plazo_total_pro: proyecto ? proyecto.plazo_total_pro : null
                        };
                    });

                    let nombre_empresa = '';
                    let cargo = "";
                    let imagenEmpresa = '';
                    /*Nombre de la Empresa*/
                    switch (parseInt(id_empresa)) {
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
                            nombre_empresa =
                                "Empresa no reconocida"; // Valor por defecto si no coincide con ninguno
                    }
                    /*cargo*/
                    switch (parseInt(id_empresa)) {
                        case 1:
                            cargo = "Sub Gerente de Estructuras";
                            break
                        case 2:
                            cargo = "Sub Gerente de Estudios";
                            break
                        case 3:
                            cargo = "Sub Gerente de Obras";
                            break
                        case 4:
                            cargo = "Sub Gerente de Arquitectura";
                            break
                        case 5:
                            cargo = "Sub Gerente de Informatica";
                            break
                        default:
                            cargo = "cargo no reconocida";
                    }

                    /*imagen de la empresa*/

                    switch (parseInt(id_empresa)) {
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
                            imagenEmpresa =
                                "{{ asset('storage/avatar_empresa/logo_default.png') }}"; // Imagen por defecto
                    }
                    const date = new Date();
                    const anioactual = new Date().getFullYear();
                    const FechaActual = new Date().toLocaleString();
                    const mesActual = new Intl.DateTimeFormat('es', {
                        month: 'long'
                    }).format(date).toUpperCase();

                    // Obtener fecha de inicio del mes actual
                    const primerDiaMes = new Date(anioactual, date.getMonth(), 1);
                    const inicioMes = primerDiaMes.toLocaleDateString('es', {
                        day: '2-digit',
                        month: 'long'
                    });

                    // Obtener fecha de fin del mes actual
                    const ultimoDiaMes = new Date(anioactual, date.getMonth() + 1, 0);
                    const finMes = ultimoDiaMes.toLocaleDateString('es', {
                        day: '2-digit',
                        month: 'long'
                    });
                    let nombreJefe = '';
                    let apellidoJefe = '';
                    let tipoGerencia = '';
                    // Definimos los jefes por empresa
                   const jefesPorEmpresa = {
                        1: {
                            name: 'LUIS DANIEL',
                            surname: 'ARGANDOÑA PILCO',
                            tipoGerencia: 'AREA ESTRUCTURAS'
                        },
                        2: {
                            name: 'JOSE EDUARDO',
                            surname: 'NIEVES CUADROS',
                            tipoGerencia: 'AREA OFICINA TECNICA'
                        },
                        3: {
                            name: 'JOSE FRANCO',
                            surname: 'ROMERO PONCE',
                            tipoGerencia: 'AREA CAMPO'
                        },
                        4: {
                            name: 'DORIS DEL PILAR',
                            surname: 'MEZA LOPEZ',
                            tipoGerencia: 'AREA ARQUITECTURA'
                        },
                        5: {
                            name: 'EMERSON MESIAS',
                            surname: 'ESPINOZA SALAZAR',
                            tipoGerencia: 'AREA SISTEMAS'
                        },
                    };
                    const jefe = jefesPorEmpresa[id_empresa];
    
                    if (jefe) {
                        nombreJefe = jefe.name;
                        apellidoJefe = jefe.surname;
                        tipoGerencia = jefe.tipoGerencia;
                    }

                    const pdf_mensual = new window.jspdf.jsPDF();
                    pdf_mensual.setFontSize(11);
                    pdf_mensual.setFont("helvetica", "bold");
                    pdf_mensual.text("Informe N° 00" + mes_seleccionado + "-" + anioactual + "/" +
                        nombre_empresa, 20, 20);
                    pdf_mensual.setFont("courier", "bold");
                    pdf_mensual.setFontSize(10);
                    pdf_mensual.text("SEÑOR(A): ", 20, 30);
                    pdf_mensual.setFont("courier", "normal");
                    pdf_mensual.text("Andrea Alexandra Paredes Sánchez", 40, 30);
                    pdf_mensual.setFont("courier", "bold");
                    pdf_mensual.text("Administradora ", 40, 35);
                    pdf_mensual.setFont("courier", "bold");
                    pdf_mensual.text("DE: ", 20, 40);
                    pdf_mensual.setFont("courier", "normal");
                    pdf_mensual.text(nombreJefe + ' ' + apellidoJefe, 40, 40);
                    pdf_mensual.setFont("courier", "bold");
                    pdf_mensual.text(cargo, 40, 45);
                    pdf_mensual.setFont("courier", "bold");
                    pdf_mensual.text("ASUNTO:", 20, 50);
                    pdf_mensual.setFont("courier", "normal");
                    pdf_mensual.text("INFORME DE AVANCE MENSUAL DEL MES DE " + mesActual + " del " +
                        anioactual, 40, 50);
                    pdf_mensual.setFont("courier", "bold");
                    pdf_mensual.text("FECHA:", 20, 55);
                    pdf_mensual.setFont("courier", "normal");
                    pdf_mensual.text("HUANUCO," + FechaActual, 40, 55);
                    pdf_mensual.addImage(imagenEmpresa, "JPEG", 125, 10, 60, 30);
                    pdf_mensual.setFontSize(9);
                    pdf_mensual.text(
                        "Por medio de la presente me es grato dirigirme a Ud. Cordialmente y felicitarlo por",
                        20, 65);
                    pdf_mensual.text(
                        "la acertada labor que viene desempeñando, así mismo entrego a su despacho el informe",
                        20, 70);
                    pdf_mensual.text("de avance del area, para ello se detalla a continuación:", 20, 75);
                    pdf_mensual.setFont("courier", "bold");
                    pdf_mensual.text("REPORTE MENSUAL DE PROYECTOS-" + tipoGerencia, 20, 85);
                    pdf_mensual.setFont("courier", "normal");
                    pdf_mensual.text("El resumen de actividades del mes (" + inicioMes + " hasta " +
                        finMes + " del " + anioactual + " ) del personal", 20, 95);
                    pdf_mensual.text("a mi responsabilidad es el siguiente: ", 20, 100);
                    // Crear la tabla con autotable
                    pdf_mensual.autoTable({
                        head: [
                            ["Nro", "PROYECTO", "FECHA INICIO", "FECHA FINAL",
                                "DIAS TRABAJADOS", "PLAZO TOTAL", "% DE AVANCE",
                                "% DE AVANCE PROGRAMADO", "CONCLUSION", "DIAS"
                            ]
                        ],
                        body: datamensual(dataGMensual),
                        startY: 105, // Ajustar según la posición deseada
                        styles: {
                            fontSize: 6, // Establecer el tamaño de letra a 8
                            valign: 'middle', // Alinear verticalmente al centro
                            halign: 'center', // Alinear horizontalmente al centro
                            lineWidth: 0.3, // Establecer el grosor de los bordes
                            lineColor: '#000000',
                        },
                        theme: 'plain', // Puedes ajustar el tema según tus preferencias
                    });

                    pdf_mensual.text(
                        "Se presenta el resumen de días trabajados de cada trabajador a mi responsabilidad con sus",
                        20, pdf_mensual.autoTable.previous.finalY + 10);
                    pdf_mensual.text("sus proyectos encargados (" + inicioMes + " hasta el " + finMes +
                        " del " + anioactual + ").", 20, pdf_mensual.autoTable.previous.finalY + 15);
                    
                    const filteredTrabajadores = datatrabajadores.map(data => data.name);
                    const excludedNames = [
                        "ANDREA ALEXANDRA", 
                        "LUIS ANGEL", 
                        "JORGE DAVID", 
                        "FERNANDO PIERO", 
                        "YESICA",
                        "Administrador"
                    ];
                    
                    // Filtramos los nombres que no están en excludedNames
                    const trabajadores = filteredTrabajadores.filter(trabajador => !excludedNames.includes(trabajador));
                    
                    //const trabajadores = datatrabajadores.map(datatrabajadores => datatrabajadores.name);

                    const headColumns = ["Nro", "PROYECTO", "DIAS PARCIAL", ...trabajadores,
                        "ACUMULADO"
                    ];
                    pdf_mensual.autoTable({
                        head: [headColumns], // Utiliza el array headColumns
                        body: mensualPersonal(dataMensual, dataGMensual, mes_seleccionado,
                            trabajadores),
                        startY: pdf_mensual.autoTable.previous.finalY + 20,
                        styles: {
                            fontSize: 6,
                            valign: 'middle',
                            halign: 'center',
                            lineWidth: 0.3, // Establecer el grosor de los bordes
                            lineColor: '#000000',
                        },
                        theme: 'plain',
                    });

                    pdf_mensual.setFont("courier", "bold");
                    pdf_mensual.setFontSize(11);
                    pdf_mensual.text("CONCLUSIONES: ", 20, pdf_mensual.autoTable.previous.finalY + 30);
                    pdf_mensual.setFontSize(9);
                    pdf_mensual.setFont("courier", "normal");
                    pdf_mensual.text("Actividad que se trabajo durante este mes.", 20, pdf_mensual.autoTable
                        .previous.finalY + 35);

                    pdf_mensual.autoTable({
                        head: [
                            ["PROYECTO", "CONCLUSION", "OBSERVACIONES"]
                        ],
                        body: conclusionMensual(dataMensual),
                        startY: pdf_mensual.autoTable.previous.finalY +
                            40, // Dejar espacio entre las dos tablas
                        styles: {
                            fontSize: 6,
                            valign: 'middle',
                            halign: 'center',
                            lineWidth: 0.3, // Establecer el grosor de los bordes
                            lineColor: '#000000',
                        },
                        theme: 'plain',
                    });

                    // pdf_mensual.setFontSize(9);
                    // const fileName = `informe_mensual.pdf`;
                    // pdf_mensual.save(fileName);

                    // Generar el string del PDF
                    const string = pdf_mensual.output('datauristring');
                    // Crear un elemento <embed> para mostrar el PDF
                    const embedElement = document.createElement('embed');
                    embedElement.setAttribute('width', '100%');
                    embedElement.setAttribute('height', '100%');
                    embedElement.setAttribute('src', string);

                    // Obtener el div donde deseas mostrar el PDF
                    const divMostrarInformePago = document.getElementById('mostrarInformePago');

                    // Limpiar cualquier contenido previo dentro del div
                    divMostrarInformePago.innerHTML = '';

                    // Agregar el elemento <embed> al div
                    divMostrarInformePago.appendChild(embedElement);
                }

                function calcularDiasTrabajomen(diasTrabajo, avanceProgramado, porcentajeTotal, avanceReal,
                    plazoTotal) {
                    let dias = 0;
                    if (((avanceProgramado - porcentajeTotal) / 100) * plazoTotal > 0) {
                        dias = Math.round(parseInt(((avanceProgramado - porcentajeTotal) / 100) *
                            plazoTotal));
                    } else {
                        dias = "OK";
                    }

                    return dias;
                }

                function formatDatemes(date) {
                    const day = String(date.getDate()).padStart(2, '0');
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const year = date.getFullYear();
                    return `${day}/${month}/${year}`;
                }

                function datamensual(dataGMensual) {
                    const proyectosAgrupados = {};
                    dataGMensual.forEach(observacion => {
                        const key = observacion.nombre_proyecto;
                        if (!proyectosAgrupados[key]) {
                            proyectosAgrupados[key] = {
                                porcentajeTotal: 0,
                                cantidadTareas: 0,
                                detalle: [],
                                plazoTotalTrab: observacion
                                    .plazo_total_pro, // Utilizar el valor de plazo_total_pro
                                fechas: {
                                    inicio: null,
                                    fin: null
                                }
                            };
                        }
                        proyectosAgrupados[key].porcentajeTotal += parseFloat(observacion
                            .porcentaje_tarea);
                        proyectosAgrupados[key].cantidadTareas++;
                        proyectosAgrupados[key].detalle.push(observacion);
                        const fechaInicio = new Date(observacion.fecha_iniciopro);
                        const fechaFin = new Date(observacion.fecha_finpro);
                        const fechaSubida = new Date(observacion.fecha_subido_t);
                        if (!proyectosAgrupados[key].fechas.inicio || fechaInicio <
                            proyectosAgrupados[key].fechas.inicio) {
                            proyectosAgrupados[key].fechas.inicio = fechaInicio;
                        }
                        if (!proyectosAgrupados[key].fechas.fin || fechaFin > proyectosAgrupados[
                                key].fechas.fin) {
                            proyectosAgrupados[key].fechas.fin = fechaFin;
                        }
                        // Calcular días trabajados considerando fechas de subida
                        if (!proyectosAgrupados[key].diasTrabajo) {
                            proyectosAgrupados[key].diasTrabajo = {};
                        }
                        const keyFechaSubida = fechaSubida.toISOString().substring(0, 10);
                        if (!proyectosAgrupados[key].diasTrabajo[keyFechaSubida]) {
                            proyectosAgrupados[key].diasTrabajo[keyFechaSubida] = 0;
                        }
                        proyectosAgrupados[key].diasTrabajo[keyFechaSubida]++;
                    });
                    const result = [];
                    let contadorProyectos = 1; // Iniciar contador de proyectos
                    for (const proyecto in proyectosAgrupados) {
                        const nroPro = 1;
                        const detalleProyecto = proyectosAgrupados[proyecto].detalle[0];
                        const porcentajeTotal = (proyectosAgrupados[proyecto].porcentajeTotal /
                            proyectosAgrupados[proyecto].cantidadTareas).toFixed(2);
                        const avanceProgramado = (((proyectosAgrupados[proyecto].cantidadTareas * 1) /
                            proyectosAgrupados[proyecto].plazoTotalTrab) * 100).toFixed(2);
                        const avanceProgramadoNumerom = parseFloat(avanceProgramado);
                        const porcentajeTotalNumerom = parseFloat(porcentajeTotal);
                        const conclusion = (avanceProgramadoNumerom > porcentajeTotalNumerom) ?
                            "RETRASADO" : "BIEN";
                        const diasTrabajo = calcularDiasTrabajomen(proyectosAgrupados[proyecto].diasTrabajo,
                            avanceProgramado, porcentajeTotal, avanceProgramado, proyectosAgrupados[
                                proyecto].plazoTotalTrab);
                        result.push([
                            contadorProyectos++,
                            proyecto,
                            formatDatemes(proyectosAgrupados[proyecto].fechas.inicio),
                            formatDatemes(proyectosAgrupados[proyecto].fechas.fin),
                            proyectosAgrupados[proyecto].cantidadTareas,
                            proyectosAgrupados[proyecto]
                            .plazoTotalTrab, // Utilizar el plazo total proporcionado
                            porcentajeTotal,
                            avanceProgramado,
                            conclusion,
                            diasTrabajo,
                        ]);
                    }

                    return result;
                }

                function obtenerTareasPorTrabajador(detalleProyecto, trabajadores) {
                    const tareasPorTrabajador = new Array(trabajadores.length).fill(0);

                    detalleProyecto.forEach(observacion => {
                        const trabajadorIndex = trabajadores.indexOf(observacion.nombre_trab);
                        if (trabajadorIndex !== -1) {
                            if (observacion.fecha_subido_t === observacion.fecha_iniciopro) {
                                tareasPorTrabajador[trabajadorIndex] +=
                                    1; // Sumamos 1 si la tarea fue entregada el mismo día
                            } else {
                                tareasPorTrabajador[trabajadorIndex] +=
                                    0.5; // Sumamos 0.5 si la tarea fue entregada en otro día
                            }
                        }
                    });

                    return tareasPorTrabajador;
                }

                function calcularAcumulado(dataMensual, proyecto) {
                    let totalFilas = 0;

                    // Contar el total de filas para el proyecto dado en todas las observaciones mensuales
                    dataMensual.forEach(observacion => {
                        if (observacion.nombre_proyecto === proyecto) {
                            if (observacion.fecha_subido_t === observacion.fecha_iniciopro) {
                                totalFilas++; // Si la tarea se entregó el mismo día, se suma como 1
                            } else {
                                totalFilas +=
                                    0.5; // Si la tarea se entregó en otro día, se suma como 0.5
                            }
                        }
                    });

                    return totalFilas;
                }

                function mensualPersonal(dataMensual, dataGMensual, mes_seleccionado, trabajadores) {
                    const proyectosAgrupados = {};
                    let contadorpersonal = 1;

                    // Función para calcular los días parciales hasta el mes anterior al reportado
                    function calcularDiasParciales(dataGMensual, mes_seleccionado) {
                        let diasParciales = {}; // Diccionario para almacenar días parciales por proyecto

                        // Filtrar observaciones del mes anterior al mes reportado
                        const observacionesMesAnterior = dataGMensual.filter(observacion => {
                            const fechaSubida = new Date(observacion.fecha_subido_t);
                            const mesSubida = fechaSubida.getMonth() + 1;
                            return mesSubida < mes_seleccionado;
                        });

                        // Recorrer las observaciones del mes anterior
                        observacionesMesAnterior.forEach(observacion => {
                            const nombreProyecto = observacion.nombre_proyecto;

                            // Calcular días parciales para el proyecto
                            if (nombreProyecto in diasParciales) {
                                diasParciales[nombreProyecto] += 1;
                            } else {
                                diasParciales[nombreProyecto] = 1;
                            }
                        });

                        return diasParciales;
                    }

                    // Procesar dataMensual
                    dataMensual.forEach(observacion => {
                        const key = observacion.nombre_proyecto;
                        if (!proyectosAgrupados[key]) {
                            proyectosAgrupados[key] = {
                                porcentajeTotal: 0,
                                cantidadTareas: 0,
                                detalle: [],
                                fechas: {
                                    inicio: null,
                                    fin: null
                                }
                            };
                        }
                        proyectosAgrupados[key].porcentajeTotal += parseFloat(observacion
                            .porcentaje_tarea);
                        proyectosAgrupados[key].cantidadTareas++;
                        proyectosAgrupados[key].detalle.push(observacion);
                        const fechaInicio = new Date(observacion.fecha_iniciopro);
                        const fechaFin = new Date(observacion.fecha_finpro);
                        const fechaSubida = new Date(observacion.fecha_subido_t);
                        if (!proyectosAgrupados[key].fechas.inicio || fechaInicio <
                            proyectosAgrupados[key].fechas.inicio) {
                            proyectosAgrupados[key].fechas.inicio = fechaInicio;
                        }

                        if (!proyectosAgrupados[key].fechas.fin || fechaFin > proyectosAgrupados[
                                key].fechas.fin) {
                            proyectosAgrupados[key].fechas.fin = fechaFin;
                        }

                        // Calcular días trabajados considerando fechas de subida
                        if (!proyectosAgrupados[key].diasTrabajo) {
                            proyectosAgrupados[key].diasTrabajo = {};
                        }
                        const keyFechaSubida = fechaSubida.toISOString().substring(0, 10);
                        if (!proyectosAgrupados[key].diasTrabajo[keyFechaSubida]) {
                            proyectosAgrupados[key].diasTrabajo[keyFechaSubida] = 0;
                        }
                        proyectosAgrupados[key].diasTrabajo[keyFechaSubida]++;
                    });

                    // Calcular días parciales
                    const diasParciales = calcularDiasParciales(dataGMensual, mes_seleccionado);
                    console.log(diasParciales);

                    const result = [];
                    for (const proyecto in proyectosAgrupados) {
                        const detalleProyecto = proyectosAgrupados[proyecto].detalle[0];
                        const plazoTotalTrab = calcularDiferenciaDias(proyectosAgrupados[proyecto].fechas
                            .inicio, proyectosAgrupados[proyecto].fechas.fin) + 1;
                        const tareasPorTrabajador = obtenerTareasPorTrabajador(proyectosAgrupados[proyecto]
                            .detalle, trabajadores);
                        const porcentajeTotal = (proyectosAgrupados[proyecto].porcentajeTotal /
                            proyectosAgrupados[proyecto].cantidadTareas).toFixed(2);
                        const acumulado = calcularAcumulado(dataMensual, proyecto) + (diasParciales[
                            proyecto] || 0); // Sumar los días parciales al acumulado
                        result.push([
                            contadorpersonal++,
                            proyecto,
                            (diasParciales[proyecto] || 0),
                            ...tareasPorTrabajador,
                            acumulado,
                        ]);
                    }

                    // Sumar las tareas entregadas por cada trabajador y mostrar el total
                    const totalTareasPorTrabajador = trabajadores.map((trabajador, index) => {
                        return result.reduce((acc, row) => acc + parseFloat(row[index + 3]),
                            0); // Empezamos desde la cuarta columna
                    });

                    // Agregar fila para mostrar el total de tareas por trabajador
                    result.push([
                        'TOTAL DIAS TRABAJADOS',
                        '', // Espacio para la columna de proyectos
                        '', // Espacio para la columna de días parciales
                        ...totalTareasPorTrabajador, // Total de tareas por cada trabajador
                        '', // Espacio para la columna de acumulado
                    ]);
                    return result;
                }

                // Función auxiliar para calcular la diferencia en días entre dos fechas
                function calcularDiferenciaDias(fechaInicio, fechaFin) {
                    const unDia = 24 * 60 * 60 * 1000; // Horas*Minutos*Segundos*Milisegundos
                    return Math.round((fechaFin - fechaInicio) / unDia);
                }

                function conclusionMensual(dataMensual) {
                    const proyectosAgrupados = {};

                    dataMensual.forEach(observacion => {
                        const key = observacion.nombre_proyecto;

                        if (!proyectosAgrupados[key]) {
                            proyectosAgrupados[key] = {
                                porcentajeTotal: 0,
                                cantidadTareas: 0,
                                detalle: [],
                                fechas: {
                                    inicio: null,
                                    fin: null
                                }
                            };
                        }

                        proyectosAgrupados[key].porcentajeTotal += parseInt(observacion
                            .porcentaje_tarea, 10);
                        proyectosAgrupados[key].cantidadTareas++;
                        proyectosAgrupados[key].detalle.push(observacion);

                        const fechaInicio = new Date(observacion.fecha_iniciopro);
                        const fechaFin = new Date(observacion.fecha_finpro);

                        if (!proyectosAgrupados[key].fechas.inicio || fechaInicio <
                            proyectosAgrupados[key].fechas.inicio) {
                            proyectosAgrupados[key].fechas.inicio = fechaInicio;
                        }

                        if (!proyectosAgrupados[key].fechas.fin || fechaFin > proyectosAgrupados[
                                key].fechas.fin) {
                            proyectosAgrupados[key].fechas.fin = fechaFin;
                        }
                    });

                    return Object.entries(proyectosAgrupados).map(([proyecto, {
                        detalle
                    }]) => {
                        const detalleProyecto = detalle[0];
                        const plazoTotalTrab = calcularDiferenciaDias(proyectosAgrupados[proyecto]
                            .fechas.inicio, proyectosAgrupados[proyecto].fechas.fin) + 1;
                        const porcentajeTotal = (proyectosAgrupados[proyecto].porcentajeTotal /
                            proyectosAgrupados[proyecto].cantidadTareas).toFixed(2);
                        const avanceProgramado = ((proyectosAgrupados[proyecto].cantidadTareas /
                            plazoTotalTrab) * 100).toFixed(2);
                        const diasRetraso = ((avanceProgramado - porcentajeTotal) * (
                            plazoTotalTrab / 100)).toFixed(2);
                        const conclusionGeneral = tipoconclusiones(diasRetraso);
                        const obvGeneral = observaciones(diasRetraso);

                        return [proyecto, conclusionGeneral, obvGeneral];
                    });
                }

                function tipoconclusiones(dias) {
                    if (dias > 1) {
                        return "El proyecto se ha completado";
                    } else if (dias == 0) {
                        return "El proyecto se ha completado";
                    } else {
                        return "El proyecto no se ha concluido.";
                    }
                }

                function observaciones(dias) {
                    if (dias > 1) {
                        return `Se considera retraso de ${dias} dia(s).`;
                    } else {
                        return '';
                    }
                }
            });
        });
    </script>

    {{-- script de reporte Mensual Asistencia--}}
    <script>
        document.addEventListener("DOMContentLoaded", () => {
            $('#generar_reportes_Asistencia').submit(function(e) {
                e.preventDefault(); // Evita que se envíe el formulario de forma tradicional

                // Obtener los valores de los inputs
                const empresaId = document.getElementById("empresa_id").value;
                const mes_reporte_asistencia = document.getElementById("mes_reporte_asistencia").value;

                // Crear un objeto FormData solo si es necesario, por ejemplo, si hay archivos
                const formData = new FormData(
                    this); // Si el formulario contiene archivos, los incluyes aquí.

                // Hacer la solicitud AJAX
                $.ajax({
                    type: 'POST',
                    url: `/gestorReportes/obtenerAsistenciaPersonal/${empresaId}/${mes_reporte_asistencia}`, // Enviar empresaId y mes_reporte_asistencia
                    data: formData,
                    contentType: false, // Para no establecer un tipo de contenido manual
                    processData: false, // Para evitar que jQuery procese los datos
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') // CSRF token
                    },
                    success: function(response) {
                        const informeAsistencia = (response);
                        informe_mensual_asistencia(informeAsistencia, empresaId,
                            mes_reporte_asistencia)
                        // Aquí puedes procesar la respuesta, por ejemplo:
                        // - Mostrar los resultados de asistencia en una tabla o gráfico
                    },
                    error: function(xhr, status, error) {
                        console.error('Error:', xhr.responseText);
                           // Parsear el JSON del responseText
                        let errorResponse = {};
                        try {
                            errorResponse = JSON.parse(xhr.responseText);
                        } catch (e) {
                            errorResponse = { message: 'Error desconocido' };  // Si no es un JSON válido, mostramos un mensaje genérico
                        }
                    
                        // Mostrar el mensaje de error con SweetAlert2
                        Swal.fire({
                            icon: 'error',            // El icono será de tipo 'error'
                            title: 'Error',           // Título del modal
                            text: `5:1743 ${errorResponse.message || error}`, // Mostrar el mensaje de error o el error general
                        });

                    }
                });
            });

            function informe_mensual_asistencia(informeAsistencia, empresaId, mes_reporte_asistencia) {

                let nombre_empresa = '';
                let cargo = "";
                let imagenEmpresa = '';
                /*Nombre de la Empresa*/
                switch (parseInt(empresaId)) {
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
                        nombre_empresa =
                            "Empresa no reconocida"; // Valor por defecto si no coincide con ninguno
                }
                /*cargo*/
                switch (parseInt(empresaId)) {
                    case 1:
                        cargo = "Sub Gerente de Estructuras";
                        break
                    case 2:
                        cargo = "Sub Gerente de Estudios";
                        break
                    case 3:
                        cargo = "Sub Gerente de Obras";
                        break
                    case 4:
                        cargo = "Sub Gerente de Arquitectura";
                        break
                    case 5:
                        cargo = "Sub Gerente de Informatica";
                        break
                    default:
                        cargo = "cargo no reconocida";
                }
                /*imagen de la empresa*/
                switch (parseInt(empresaId)) {
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
                        imagenEmpresa =
                            "{{ asset('storage/avatar_empresa/logo_default.png') }}"; // Imagen por defecto
                }
                const date = new Date();
                const anioactual = new Date().getFullYear();
                const FechaActual = new Date().toLocaleString();
                const mesActual = new Intl.DateTimeFormat('es', {
                    month: 'long'
                }).format(date).toUpperCase();

                // Obtener fecha de inicio del mes actual
                const primerDiaMes = new Date(anioactual, date.getMonth(), 1);
                const inicioMes = primerDiaMes.toLocaleDateString('es', {
                    day: '2-digit',
                    month: 'long'
                });

                // Obtener fecha de fin del mes actual
                const ultimoDiaMes = new Date(anioactual, date.getMonth() + 1, 0);
                const finMes = ultimoDiaMes.toLocaleDateString('es', {
                    day: '2-digit',
                    month: 'long'
                });
                let nombreJefe = '';
                let apellidoJefe = '';
                let tipoGerencia = '';
                // Definimos los jefes por empresa
                const jefesPorEmpresa = {
                        1: {
                            name: 'LUIS DANIEL',
                            surname: 'ARGANDOÑA PILCO',
                            tipoGerencia: 'AREA ESTRUCTURAS'
                        },
                        2: {
                            name: 'JOSE EDUARDO',
                            surname: 'NIEVES CUADROS',
                            tipoGerencia: 'AREA OFICINA TECNICA'
                        },
                        3: {
                            name: 'JOSE FRANCO',
                            surname: 'ROMERO PONCE',
                            tipoGerencia: 'AREA CAMPO'
                        },
                        4: {
                            name: 'DORIS DEL PILAR',
                            surname: 'MEZA LOPEZ',
                            tipoGerencia: 'AREA ARQUITECTURA'
                        },
                        5: {
                            name: 'EMERSON MESIAS',
                            surname: 'ESPINOZA SALAZAR',
                            tipoGerencia: 'AREA SISTEMAS'
                        },
                    };
                const jefe = jefesPorEmpresa[empresaId];

                if (jefe) {
                    nombreJefe = jefe.name;
                    apellidoJefe = jefe.surname;
                    tipoGerencia = jefe.tipoGerencia;
                }
                const pdf_mensual = new window.jspdf.jsPDF();
                pdf_mensual.setFontSize(11);
                pdf_mensual.setFont("helvetica", "bold");
                pdf_mensual.text("Informe N° 00" + mes_reporte_asistencia + "-" + anioactual + "/" + nombre_empresa,
                    20,
                    20);
                pdf_mensual.setFont("courier", "bold");
                pdf_mensual.setFontSize(10);
                pdf_mensual.text("SEÑOR(A): ", 20, 30);
                pdf_mensual.setFont("courier", "normal");
                pdf_mensual.text("Andrea Alexandra Paredes Sánchez", 40, 30);
                pdf_mensual.setFont("courier", "bold");
                pdf_mensual.text("Administradora ", 40, 35);
                pdf_mensual.setFont("courier", "bold");
                pdf_mensual.text("DE: ", 20, 40);
                pdf_mensual.setFont("courier", "normal");
                pdf_mensual.text(nombreJefe + ' ' + apellidoJefe, 40, 40);
                pdf_mensual.setFont("courier", "bold");
                pdf_mensual.text(cargo, 40, 45);
                pdf_mensual.setFont("courier", "bold");
                pdf_mensual.text("ASUNTO:", 20, 50);
                pdf_mensual.setFont("courier", "normal");
                pdf_mensual.text("INFORME DE ASISTENCIA MENSUAL DEL MES DE " + mesActual + " del " +
                    anioactual, 40, 50);
                pdf_mensual.setFont("courier", "bold");
                pdf_mensual.text("FECHA:", 20, 55);
                pdf_mensual.setFont("courier", "normal");
                pdf_mensual.text("HUANUCO," + FechaActual, 40, 55);
                pdf_mensual.addImage(imagenEmpresa, "JPEG", 125, 10, 60, 30);
                pdf_mensual.setFontSize(9);
                pdf_mensual.text(
                    "Por medio de la presente me es grato dirigirme a Ud. Cordialmente y felicitarlo por",
                    20, 65);
                pdf_mensual.text(
                    "la acertada labor que viene desempeñando, así mismo entrego a su despacho el informe",
                    20, 70);
                pdf_mensual.text("de las asistencias del personal de area, para ello se detalla a continuación:", 20, 75);
                pdf_mensual.setFont("courier", "bold");
                pdf_mensual.text("REPORTE DE ASISTENCIA DEL PERSONAL DE - " + tipoGerencia, 20, 85);
                pdf_mensual.setFont("courier", "normal");
                pdf_mensual.text("El resumen de actividades del mes (" + inicioMes + " hasta " +
                    finMes + " del " + anioactual + " ) del personal", 20, 95);
                pdf_mensual.text("a mi responsabilidad es el siguiente: ", 20, 100);
                // Crear la tabla con autotable
                pdf_mensual.autoTable({
                    head: [
                        ["Nro", "TRABAJADOR", "PUNTUALIDAD",
                            "TARDANZA", "SIN MARCAR","TOTAL"
                        ]
                    ],
                    body: tablasAsistencia(informeAsistencia),
                    startY: 105, // Ajustar según la posición deseada
                    styles: {
                        fontSize: 6, // Establecer el tamaño de letra a 8
                        valign: 'middle', // Alinear verticalmente al centro
                        halign: 'center', // Alinear horizontalmente al centro
                        lineWidth: 0.3, // Establecer el grosor de los bordes
                        lineColor: '#000000',
                    },
                    theme: 'plain', // Puedes ajustar el tema según tus preferencias
                });

                // pdf_mensual.setFontSize(9);
                // const fileName = `informe_mensual.pdf`;
                // pdf_mensual.save(fileName);

                // Generar el string del PDF
                const string = pdf_mensual.output('datauristring');
                // Crear un elemento <embed> para mostrar el PDF
                const embedElement = document.createElement('embed');
                embedElement.setAttribute('width', '100%');
                embedElement.setAttribute('height', '100%');
                embedElement.setAttribute('src', string);

                // Obtener el div donde deseas mostrar el PDF
                const divMostrarInformePago = document.getElementById('mostrarInformePago');

                // Limpiar cualquier contenido previo dentro del div
                divMostrarInformePago.innerHTML = '';

                // Agregar el elemento <embed> al div
                divMostrarInformePago.appendChild(embedElement);
            }

            function tablasAsistencia(informeAsistencia) {
                // Mapeamos el array de objetos en un array de arrays
                return informeAsistencia.map((asistencia, index) => {
                    const subtotalasistencia = parseInt(asistencia.puntualidad) + parseInt(asistencia
                        .tardanza);
                    const totalnomarcado = 48 - subtotalasistencia;
                     const totalregistro = (parseFloat(asistencia.tardanza) + totalnomarcado) / 2
                    return [
                        index + 1, // Número de la fila (empezando desde 1)
                        asistencia.nombre, // Nombre del trabajador
                        asistencia.puntualidad, // Puntualidad
                        asistencia.tardanza, // Tardanza
                        totalnomarcado, // Sin marcar (puedes cambiarlo si tienes esta información)
                        totalregistro
                    ];
                });
            }

        });
    </script>

    {{-- script de informes de pago --}}
    <script>
        document.addEventListener("DOMContentLoaded", () => {
            $('#informe_pago_personal').submit(e => {
                e.preventDefault(); // Evita que se envíe el formulario de forma tradicional
                const form = document.getElementById("informe_pago_personal");
                const informePersonal = new FormData(form);

                $.ajax({
                    type: 'POST',
                    url: `/gestorReportes/obtenerTareasIp`,
                    data: informePersonal,
                    contentType: false, // Indica que no se envíe un tipo de contenido
                    processData: false, // Evita que jQuery procese los datos
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                    },
                    success: function(response) {
                        const tareas = response.tareas;
                        const trabajador = response.usuarios;
                        const adelantos = response.adelantos;
                        const permisos = response.permisos;
                        const incMof = response.incMof;
                        const bondtrab = response.bondtrab;
                        const descuenttrab = response.descuenttrab;
                        const proyectos = response.proyectos;
                        const id_empresa = parseInt(response.empresaId);
                        const id_trabajador = parseInt(response.personalId);
                        const Messelect = response.informeMes;
                        informe_pago_personal(tareas, trabajador, adelantos, permisos, incMof,
                            bondtrab, descuenttrab, proyectos, id_empresa, id_trabajador,
                            Messelect)
                    },
                    error: function(xhr) {
                        console.error(xhr.responseText);
                    }
                });
            });

            // Función para formatear la fecha
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

                // Concatenar la fecha y la hora
                return `${parteFecha.toUpperCase()} Hora: ${parteHora}`;
            }

            function informe_pago_personal(tareas, trabajador, adelantos, permisos, incMof,
                bondtrab, descuenttrab, proyectos, id_empresa, id_trabajador, Messelect) {

                const trabajadorEncontrado = trabajador.find(t => t.id == id_trabajador);
                let trabajadorDatos = "";
                if (trabajadorEncontrado) {
                    trabajadorDatos = {
                        name: trabajadorEncontrado.name,
                        surname: trabajadorEncontrado.surname,
                        dni_user: trabajadorEncontrado.dni_user,
                        sueldo_base: trabajadorEncontrado.sueldo_base,
                        area_laboral: trabajadorEncontrado.area_laboral,
                    };
                } else {
                    console.log("No se encontró el trabajador con el ID proporcionado.");
                }

                const dataIP = tareas.map(tarea => {
                    const proyectoEncontrado = proyectos.find(proyecto => proyecto.id_proyectos === tarea
                        .proyecto_asignadot);

                    return {
                        ...tarea, // Desestructura todas las propiedades de tarea
                        nombre_proyecto: proyectoEncontrado ? proyectoEncontrado.nombre_proyecto :
                            "Proyecto no encontrado", // Agrega el nombre del proyecto
                        nombre_trabajador: `${trabajadorDatos.name} ${trabajadorDatos.surname}` // Agrega el nombre completo del trabajador
                    };
                });
                
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
                        nombre_empresa = "Empresa no reconocida"; // Valor por defecto si no coincide con ninguno
                }
                // Concatenar el nombre y el apellido, y luego dividir la cadena
                const nombres = (trabajadorDatos.name + ' ' + trabajadorDatos.surname).split(' ');
                // Inicializar una variable para almacenar las iniciales
                let iniciales = '';
                // Iterar sobre cada palabra para obtener la primera letra
                nombres.forEach(nombre => {
                    // Agregar la primera letra de cada palabra a las iniciales
                    iniciales += nombre.charAt(0);
                });

                const pdf_IP = new window.jspdf.jsPDF();
                const date = new Date();
                const anioactual = new Date().getFullYear();
                const FechaActual = new Date().toLocaleString();
                const fechaFormateada = formatearFecha(date);
                date.setMonth(date.getMonth()); // Restar 1 al mes actual
                const mesActual = new Intl.DateTimeFormat('es', {
                    month: 'long'
                }).format(date).toUpperCase();
                // Obtener fecha de inicio del mes actual
                const primerDiaMes = new Date(anioactual, date.getMonth(), 1);
                const inicioMes = primerDiaMes.toLocaleDateString('es', {
                    day: '2-digit',
                    month: 'long'
                });
                // Obtener fecha de fin del mes actual
                const ultimoDiaMes = new Date(anioactual, date.getMonth() + 1, 0);
                const finMes = ultimoDiaMes.toLocaleDateString('es', {
                    day: '2-digit',
                    month: 'long'
                });
                var d = new Date();
                var mesActualIP = (d.getMonth()); // Obtiene el número del mes actual (1 a 12)

                var nombre_mes_ip = parseInt(Messelect);
                var nombre_mes;
                switch (nombre_mes_ip) {
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
                if ((trabajadorDatos.name) == 'JOSE EDUARDO' || (trabajadorDatos.name) == 'LUIS DANIEL' || (
                        trabajadorDatos.name) == 'EMERSON MESIAS' || (trabajadorDatos.name) == 'LUIS DANIEL') {
                    rol = 'Jefe de Área';
                } else {
                    rol = 'Asistente';
                }

                pdf_IP.setFontSize(11);
                pdf_IP.setFont("Arial Narrow", "bold");
                pdf_IP.text("INFORME N°" + ("00" + nombre_mes_ip).slice(-2) + "-" + anioactual + "/" +
                    nombre_empresa + "-" + iniciales, 20, 20);
                pdf_IP.setFont("Arial Narrow", "bold");
                pdf_IP.setFontSize(10);
                pdf_IP.text("SEÑOR(A): ", 20, 30);
                pdf_IP.setFont("Arial Narrow", "normal");
                pdf_IP.text("Andrea Alexandra Paredes Sánchez", 40, 30);
                pdf_IP.setFont("Arial Narrow", "bold");
                pdf_IP.text("Administradora", 40, 35);
                pdf_IP.setFont("Arial Narrow", "bold");
                pdf_IP.text("DE: ", 20, 40);
                pdf_IP.setFont("Arial Narrow", "normal");
                pdf_IP.text((trabajadorDatos.name + ' ' + trabajadorDatos.surname), 40, 40);
                pdf_IP.setFont("Arial Narrow", "bold");
                pdf_IP.setFontSize(10);
                pdf_IP.text(rol, 40, 45);
                pdf_IP.setFont("Arial Narrow", "bold");
                pdf_IP.text("ASUNTO:", 20, 50);
                pdf_IP.setFont("Arial Narrow", "normal");
                pdf_IP.text("INFORME DE PAGO DEL MES DE " + nombre_mes + " del " + anioactual, 40, 50);
                pdf_IP.setFont("Arial Narrow", "bold");
                pdf_IP.text("FECHA:", 20, 55);
                pdf_IP.setFont("Arial Narrow", "normal");
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
                        imagenEmpresa =
                            "{{ asset('storage/avatar_empresa/logo_default.png') }}"; // Imagen por defecto
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

                pdf_IP.addImage(imagenEmpresa, "JPEG", 125, -5, 80, 50);
                // pdf_semanal.addImage("../assets/img/logoEmpresa/logoconstruyehco.jpg", "JPEG", 125, -5, 80, 50);
                pdf_IP.setFontSize(9);
                pdf_IP.text(
                    "Por medio de la presente me es grato dirigirme a Ud. Cordialmente y felicitarlo por la acertada labor que viene desempeñando, así mismo",
                    20, 65);
                pdf_IP.text(
                    "entrego a su despacho el informe de avance del personal, para ello se detalla a continuación:",
                    20, 70);
                pdf_IP.setFont("Arial Narrow", "bold");
                pdf_IP.setFontSize(9); // Establecer el tamaño de letra a 9
                var sueldoPIP = parseFloat(trabajadorDatos.sueldo_base);

                pdf_IP.autoTable({
                    head: [
                        ["PROYECTOS EFECTUADOS", "INICIO DE PROYECTO", "FIN DE PROYECTO", "DIAS",
                            "CIERRE"
                        ]
                    ],
                    body: proyecto_efectuadoIP(dataIP),
                    startY: 85, // Ajustar según la posición deseada
                    styles: {
                        fontSize: 8, // Establecer el tamaño de letra a 8
                        valign: 'middle', // Alinear verticalmente al centro
                        halign: 'center', // Alinear horizontalmente al centro
                        lineWidth: 0.1, // Establecer el ancho de las líneas de borde
                    },
                    theme: 'plain', // Puedes ajustar el tema según tus preferencias
                });

                const descuentosBonificacionData = descuentosBonificacion(dataIP, sueldoPIP, Messelect);
                pdf_IP.autoTable({
                    head: [
                        ["DESCUENTOS Y BONIFICACIONES", "CANT.", "MONTO"]
                    ],
                    body: descuentosBonificacion(dataIP, sueldoPIP, Messelect),
                    startY: pdf_IP.autoTable.previous.finalY + 10, // Dejar espacio entre las dos tablas
                    styles: {
                        fontSize: 8,
                        valign: 'middle',
                        halign: 'left',
                        lineWidth: 0.1, // Establecer el ancho de las líneas de borde
                    },
                    theme: 'plain',
                    didParseCell: (data) => {
                        // Identificar la fila que deseas poner en negrita
                        if (data.row.index === descuentosBonificacionData.findIndex(row => row[0] ===
                                "TOTAL DE DESCUENTO")) {
                            // Aplicar estilo de negrita a esta fila
                            data.cell.styles.fontStyle = 'bold';
                        }
                        if (data.row.index === descuentosBonificacionData.length -
                            1) { // Última fila de datos
                            // Aplicar estilo de negrita a la última fila
                            data.cell.styles.fontStyle = 'bold';
                        }
                    },
                });

                // Obtener los datos de proyectos y descuentos
                const dataProyectos = proyecto_efectuadoIP(dataIP);
                const dataDescuentos = descuentosBonificacion(dataIP, sueldoPIP, Messelect);
                // Calcular el total de días trabajados sumando los días de todos los proyectos excepto el último, que es el total
                let totalDiasTrabajados = 0;
                for (let i = 0; i < dataProyectos.length - 1; i++) {
                    totalDiasTrabajados += parseFloat(dataProyectos[i][3]); // Sumar los días del proyecto actual
                }

                const fechaActual = new Date();
                const year = fechaActual.getFullYear(); // Obtener el año actual
                const month = Messelect; // Obtener el mes actual (0 = enero, ..., 11 = diciembre)
                const diasLaborablesMes = obtenerDiasLaborables(year, month);


                /*if (totalDiasTrabajados >= 24.90 <= diasLaborablesMes) {
                    totalDiasTrabajados = diasLaborablesMes;
                }*/

                //descuentos
                const descuentos = parseInt(document.getElementById('descuenttrab').value);
                const bonificacion = parseInt(document.getElementById('bondtrab').value);

                const totalDescuentoSoles = parseFloat(dataDescuentos[5][2]);
                const totalbonosSoles = parseFloat(dataDescuentos[7][2]);
                // Calcular el sueldo neto
                const sueldoNeto = calcularSueldoDescuentos(totalDiasTrabajados, sueldoPIP, Messelect);
                //sueldo total del cliente
                const SaltoDescontado = sueldoNeto + totalbonosSoles + (-totalDescuentoSoles);


                // Cargar el valor del sueldo neto en el PDF
                pdf_IP.setFont("Arial Narrow", "bold");
                pdf_IP.setFontSize(11);
                pdf_IP.text("MONTO TOTAL DE PAGO: ", 20, pdf_IP.autoTable.previous.finalY + 20);
                pdf_IP.setFont("Arial Narrow", "normal");
                pdf_IP.text("S/.: " + SaltoDescontado.toFixed(2), 75, pdf_IP.autoTable.previous.finalY + 20);

                let posY = pdf_IP.autoTable.previous.finalY + 30;

                // Agregar los datos de cuenta bancaria
                pdf_IP.setFont("Arial Narrow", "bold");
                pdf_IP.text("DNI:", 20, posY + 5);
                pdf_IP.setFont("Arial Narrow", "normal");
                pdf_IP.text(String(trabajadorDatos.dni_user), 30, posY + 5);

                //anexos
                pdf_IP.setFont("Arial Narrow", "bold");
                pdf_IP.text("ANEXOS:", 20, posY + 10);
                pdf_IP.setFont("Arial Narrow", "normal");
                pdf_IP.text("LAP mensual, Recibo por Honorarios.", 40, posY + 15);
                // cierre
                pdf_IP.setFontSize(9);
                pdf_IP.setFont("Arial Narrow", "normal");
                pdf_IP.text("Sin otro particular aprovecho la oportunidad para reiterarle las muestras de mi", 30,
                    posY + 25);
                pdf_IP.setFont("Arial Narrow", "normal");
                pdf_IP.text("especial consideración y estima personal.", 20, posY + 30);
                pdf_IP.setFont("Arial Narrow", "normal");
                pdf_IP.text("Atentamente", 20, posY + 35);

                // Generar el string del PDF
                const string = pdf_IP.output('datauristring');
                // Crear un elemento <embed> para mostrar el PDF
                const embedElement = document.createElement('embed');
                embedElement.setAttribute('width', '100%');
                embedElement.setAttribute('height', '100%');
                embedElement.setAttribute('src', string);

                // Obtener el div donde deseas mostrar el PDF
                const divMostrarInformePago = document.getElementById('mostrarInformePago');

                // Limpiar cualquier contenido previo dentro del div
                divMostrarInformePago.innerHTML = '';

                // Agregar el elemento <embed> al div
                divMostrarInformePago.appendChild(embedElement);
            }

            /*function countTareasMismoDia(dataIP, fecha) {
                // Objeto para almacenar información sobre los proyectos
                let proyectos = {};
                // Contador para el número total de tareas en la fecha dada
                let totalTareas = 0;

                // Iterar sobre cada tarea en el array dataIP
                dataIP.forEach(tarea => {
                    // Verificar si la fecha_subido_t de la tarea coincide con la fecha dada
                    if (tarea.fecha_subido_t === fecha) {
                        // Obtener el idProyecto y el porcentaje de la tarea
                        let idProyecto = tarea.id_proyectos;
                        let porcentaje = tarea.procentaje_trabajador || 0;

                        // Si el proyecto no existe en el objeto proyectos, inicializarlo
                        if (!proyectos[idProyecto]) {
                            proyectos[idProyecto] = {
                                sumPorcentaje: 0,
                                numTareas: 0
                            };
                        }

                        // Incrementar la suma de porcentaje y el número de tareas para el proyecto
                        proyectos[idProyecto].sumPorcentaje += porcentaje;
                        proyectos[idProyecto].numTareas++;
                        // Incrementar el contador de totalTareas
                        totalTareas++;
                    }
                });

                // Objeto para almacenar los tiempos de trabajo calculados para cada proyecto
                let tiemposTrabajo = {};

                // Iterar sobre cada proyecto en el objeto proyectos
                for (let idProyecto in proyectos) {
                    // Calcular el promedio del porcentaje de tareas completadas para el proyecto
                    let promedioPorcentaje = proyectos[idProyecto].numTareas > 0 ? proyectos[idProyecto]
                        .sumPorcentaje / proyectos[idProyecto].numTareas : 0;
                    let tiempoTrabajo;

                    // Asignar un valor de tiempo de trabajo según ciertas condiciones
                    if (promedioPorcentaje < 50) {
                        tiempoTrabajo = 0.5;
                    } else if (promedioPorcentaje >= 50 && promedioPorcentaje < 81) {
                        tiempoTrabajo = 0.8;
                    } else if (promedioPorcentaje >= 81) {
                        tiempoTrabajo = 1;
                    }

                    // Dividir el tiempo de trabajo por el número total de tareas para normalizarlo
                    tiempoTrabajo /= totalTareas;

                    // Almacenar el tiempo de trabajo calculado para el proyecto en el objeto tiemposTrabajo
                    tiemposTrabajo[idProyecto] = tiempoTrabajo;
                }

                // Devolver el objeto tiemposTrabajo que contiene los tiempos de trabajo calculados para cada proyecto en la fecha dada
                return tiemposTrabajo;
            }

            function proyecto_efectuadoIP(dataIP) {
                console.log(dataIP);
                
                const proyectosUnicos = {};
                let totalDias = 0;

                dataIP.forEach(tarea => {
                    const proyectoId = tarea.id_proyectos;
                   // Convertir la fecha_inicio y fecha_fin a formato ISO 8601 con zona horaria
                    const fechaInicioFormatted = new Date(
                        tarea.fecha_iniciopro.replace(' ', 'T') + '-05:00' // Reemplazamos el espacio por T y añadimos zona horaria
                    );
                
                    const fechaFinFormatted = new Date(
                        tarea.fecha_finpro.replace(' ', 'T') + '-05:00' // Reemplazamos el espacio por T y añadimos zona horaria
                    );

                    const opciones = {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    };
                    const fechaInicio = fechaInicioFormatted.toLocaleDateString('es-PE', opciones);
                    const fechaFin = fechaFinFormatted.toLocaleDateString('es-PE', opciones);

                    if (!proyectosUnicos[proyectoId]) {
                        proyectosUnicos[proyectoId] = {
                            nombre_proyecto: tarea.nombre_proyecto,
                            fecha_inicio: fechaInicio,
                            fecha_fin: fechaFin,
                            dias: 0,
                            cierre: ' ',
                        };
                    } else {
                        const proyecto = proyectosUnicos[proyectoId];
                        if (fechaInicio < proyecto.fecha_inicio) {
                            proyecto.fecha_inicio = fechaInicio;
                        }
                        if (fechaFin > proyecto.fecha_fin) {
                            proyecto.fecha_fin = fechaFin;
                        }
                    }

                    if (proyectosUnicos[proyectoId]) {
                        let tiempoTrabajo = countTareasMismoDia(dataIP, tarea.fecha_subido_t)[proyectoId];
                        if (tiempoTrabajo !== undefined) {
                            proyectosUnicos[proyectoId].dias += tiempoTrabajo;
                            totalDias += tiempoTrabajo;
                            if (totalDias > 26) {
                                totalDias = 26;
                            }
                        }
                    }
                });

                const proyectosArray = Object.values(proyectosUnicos);

                const datosTabla = proyectosArray.map(proyecto => [
                    proyecto.nombre_proyecto,
                    proyecto.fecha_inicio,
                    proyecto.fecha_fin,
                    proyecto.dias.toFixed(2),
                    proyecto.cierre
                ]);

                datosTabla.push(["TOTAL", "", "", totalDias.toFixed(2), ""]);
                
                console.log(datosTabla);
                
                return datosTabla;
            }*/
            
            function countTareasMismoDia(dataIP, fecha, nombreProyecto) {
                // Contador para el número total de tareas del proyecto en la fecha dada
                let totalTareasProyecto = 0;
                let sumaPorcentajes = 0;
            
                // Iterar sobre cada tarea en el array dataIP
                const tareasFecha = dataIP.filter(tarea => 
                    tarea.fecha_subido_t === fecha && tarea.nombre_proyecto === nombreProyecto
                );
            
                totalTareasProyecto = tareasFecha.length;
                sumaPorcentajes = tareasFecha.reduce((total, tarea) => 
                    total + (tarea.procentaje_trabajador || 0), 0);
            
                // Calcular promedio de porcentaje
                const promedioPorcentaje = totalTareasProyecto > 0 
                    ? sumaPorcentajes / totalTareasProyecto 
                    : 0;
            
                // Determinar tiempo de trabajo basado en porcentaje
                let tiempoTrabajo;
                if (promedioPorcentaje < 50) {
                    tiempoTrabajo = 0.5;
                } else if (promedioPorcentaje >= 50 && promedioPorcentaje < 81) {
                    tiempoTrabajo = 0.8;
                } else if (promedioPorcentaje >= 81) {
                    tiempoTrabajo = 1;
                }
            
                return tiempoTrabajo || 0;
            }
            
            function proyecto_efectuadoIP(dataIP) {
                // Objeto para almacenar todos los proyectos únicos
                const proyectosUnicos = {};
                let totalDias = 0;
            
                // Obtener nombres de proyectos únicos
                const nombreProyectos = [...new Set(dataIP.map(tarea => tarea.nombre_proyecto))];
            
                // Procesar cada proyecto único
                nombreProyectos.forEach(nombreProyecto => {
                    // Filtrar tareas de este proyecto
                    const tareasProyecto = dataIP.filter(tarea => tarea.nombre_proyecto === nombreProyecto);
                    
                    // Encontrar fechas de inicio y fin más tempranas y más tardías
                    const fechasInicioProyecto = tareasProyecto.map(tarea => 
                        new Date(tarea.fecha_iniciopro.replace(' ', 'T') + '-05:00')
                    );
                    const fechasFinProyecto = tareasProyecto.map(tarea => 
                        new Date(tarea.fecha_finpro.replace(' ', 'T') + '-05:00')
                    );
            
                    const opciones = {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    };
            
                    const fechaInicio = new Date(Math.min(...fechasInicioProyecto)).toLocaleDateString('es-PE', opciones);
                    const fechaFin = new Date(Math.max(...fechasFinProyecto)).toLocaleDateString('es-PE', opciones);
            
                    // Calcular días trabajados
                    const fechasUnicas = [...new Set(tareasProyecto.map(tarea => tarea.fecha_subido_t))];
                    const diasTrabajados = fechasUnicas.reduce((total, fecha) => {
                        return total + (countTareasMismoDia(dataIP, fecha, nombreProyecto) || 0);
                    }, 0);
            
                    // Almacenar información del proyecto
                    proyectosUnicos[nombreProyecto] = {
                        nombre_proyecto: nombreProyecto,
                        fecha_inicio: fechaInicio,
                        fecha_fin: fechaFin,
                        dias: diasTrabajados,
                        cierre: ' '
                    };
            
                    // Acumular total de días
                    totalDias += diasTrabajados;
                });
            
                // Limitar total de días a 26
                totalDias = Math.min(totalDias, 26);
            
                // Convertir a array de datos para tabla
                const datosTabla = Object.values(proyectosUnicos).map(proyecto => [
                    proyecto.nombre_proyecto,
                    proyecto.fecha_inicio,
                    proyecto.fecha_fin,
                    proyecto.dias.toFixed(2),
                    proyecto.cierre
                ]);
            
                // Agregar fila de total
                datosTabla.push(["TOTAL", "", "", totalDias.toFixed(2), ""]);
            
                return datosTabla;
            }

            function obtenerDiasLaborables(year, month) {
                // Definir los días festivos en Perú (formato: 'YYYY-MM-DD')
                const diasFestivos = [
                    '2024-01-01', // Año Nuevo
                    '2024-04-14', // Domingo de Ramos
                    '2024-04-15', // Lunes Santo
                    '2024-04-16', // Martes Santo
                    '2024-05-01', // Día del Trabajo
                    '2024-06-29', // San Pedro y San Pablo
                    '2024-07-28', // Fiestas Patrias
                    '2024-07-29', // Fiestas Patrias
                    '2024-08-30', // Santa Rosa de Lima
                    '2024-10-08', // Combate de Angamos
                    '2024-11-01', // Todos los Santos
                    '2024-12-08', // Inmaculada Concepción
                    '2024-12-25', // Navidad
                    // Agregar más festividades según sea necesario
                ];

                let diasLaborables = 0;

                // Obtener el primer y último día del mes
                const primerDia = new Date(year, month - 1, 1); // Restar 1 porque el mes es 0-indexed
                const ultimoDia = new Date(year, month, 0); // Último día del mes

                // Contar todos los días y restar los festivos
                for (let dia = primerDia; dia <= ultimoDia; dia.setDate(dia.getDate() + 1)) {
                    const diaSemana = dia.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
                    const fechaFormateada = dia.toISOString().split('T')[0]; // Formato 'YYYY-MM-DD'

                    // Contar solo si es de lunes a sábado
                    if (diaSemana !== 0) {
                        diasLaborables++; // Contar el día

                        // Verificar si el día actual es un festivo
                        if (diasFestivos.includes(fechaFormateada)) {
                            diasLaborables--; // Restar si es festivo
                        }
                    }
                }

                return diasLaborables;
            }

            function descuentosBonificacion(dataIP, sueldoPIP, Messelect) {
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
                    const incumplimiento = (totalDescuento * sueldoDiario).toFixed(2);

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
                    const incumplimientoLab = ["INCUMPLIMIENTO DEL LAB", totalDescuento, incumplimiento];
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

            function calcularSueldoDescuentos(totalDiasTrabajados, sueldoPIP, Messelect) {
                // Verificar si sueldoPIP está definido y no está vacío
                if (sueldoPIP !== undefined && sueldoPIP !== null && sueldoPIP > 0) {
                    const sueldoPersonal = sueldoPIP;
                    const sueldoGeneral = sueldoPersonal; // Sueldo general
                    const fechaActual = new Date();
                    const year = fechaActual.getFullYear(); // Obtener el año actual
                    const month = Messelect; // Obtener el mes actual (0 = enero, ..., 11 = diciembre)
                    const diasLaborablesMes = obtenerDiasLaborables(year, month);

                    //const diasLaborablesMes = 26; // Número de días laborables en el mes
                    const sueldoDiario = sueldoGeneral / diasLaborablesMes; // Calcular sueldo diario

                    // Calcular el sueldo neto multiplicando el sueldo diario por el número de días trabajados
                    let sueldoNeto = sueldoDiario * totalDiasTrabajados;

                    // Redondear el sueldo neto a dos decimales
                    sueldoNeto = Math.round(sueldoNeto * 100) / 100;

                    return sueldoNeto;
                } else {
                    console.error("Error: sueldoPIP no está definido o está vacío.");
                    return null;
                }
            }
        });
    </script>
</x-app-layout>
