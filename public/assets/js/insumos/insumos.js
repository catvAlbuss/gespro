document.addEventListener('DOMContentLoaded', () => {
    losdInsumosCompletos();
    const modal = document.getElementById('insumosModal');
    const closeModalBtn = document.getElementById('closeModal');
    const buttonIds = [
        { id: 'modalInsumosMO', tipo: 'manoobra' }, // Mano de obra
        { id: 'modalInsumosMat', tipo: 'materiales' }, // Materiales
        { id: 'modalInsumosEq', tipo: 'equipos' } // Equipos
    ];

    // Initialize tabs
    const tabs = document.querySelectorAll('#insumosTabs button');
    const tabContents = document.querySelectorAll('#insumosTabsContent > div');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active classes
            tabs.forEach(t => {
                t.classList.remove('border-blue-600', 'text-blue-600');
                t.classList.add('border-transparent', 'text-gray-500');
            });
            tabContents.forEach(content => content.classList.add('hidden'));

            // Add active classes to clicked tab
            tab.classList.remove('border-transparent', 'text-gray-500');
            tab.classList.add('border-blue-600', 'text-blue-600');

            // Show corresponding content
            const contentId = tab.getAttribute('data-tabs-target');
            document.querySelector(contentId).classList.remove('hidden');
        });
    });

    // Set first tab as active by default
    tabs[0].classList.remove('border-transparent', 'text-gray-500');
    tabs[0].classList.add('border-blue-600', 'text-blue-600');
    tabContents[0].classList.remove('hidden');

    // Variable para almacenar el tipo de insumo seleccionado
    let selectedTipoInsumo = null;

    // Open modal and set tipoinsumo
    buttonIds.forEach(button => {
        const btnElement = document.getElementById(button.id);
        if (btnElement) {
            btnElement.addEventListener('click', () => {
                selectedTipoInsumo = button.tipo; // Guardar el tipo de insumo seleccionado
                modal.classList.remove('hidden');
                setTimeout(() => {
                    modal.querySelector('.scale-95').classList.remove('scale-95');
                }, 10);

                // Cargar datos para las tablas
                loadTableData();
            });
        }
    });

    // Close modal
    closeModalBtn.addEventListener('click', () => {
        modal.querySelector('.relative').classList.add('scale-95');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            modal.querySelector('.relative').classList.add('scale-95');
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 300);
        }
    });

    function getCSRFToken() {
        return $('meta[name="csrf-token"]').attr('content');
    }

    // Inicializar Select2 con búsqueda unidad_medida
    $('#unidad_medida').select2({
        placeholder: 'Busque una unidad de medida',
        allowClear: true,
        width: '100%',

    });

    // Evento para capturar el valor seleccionado (abreviatura)
    $('#unidad_medida').on('select2:select', function (e) {
        const selectedValue = e.params.data.id; // Obtener el value (abreviatura)
        console.log('Unidad seleccionada:', selectedValue);
        // Aquí puedes usar selectedValue para otras operaciones
    });

    // Inicializar Select2 con búsqueda unidad_compra
    $('#unidad_compra').select2({
        placeholder: 'Busque una unidad de medida',
        allowClear: true,
        width: '100%',

    });

    // Evento para capturar el valor seleccionado (abreviatura)
    $('#unidad_compra').on('select2:select', function (e) {
        const selectedValue = e.params.data.id; // Obtener el value (abreviatura)
        console.log('Unidad seleccionada:', selectedValue);
        // Aquí puedes usar selectedValue para otras operaciones
    });

    // Inicializar Select2 en el select con id="grupo_gen"
    $('#grupo_gen').select2({
        placeholder: 'Seleccione un grupo genérico',
        allowClear: true,
        width: '100%'
    });

    // Evento para capturar el id de la opción seleccionada
    $('#grupo_gen').on('select2:select', function (e) {
        const selectedId = e.params.data.id; // ID de la opción seleccionada
        console.log('ID seleccionado:', selectedId);
        const proveedordata = document.getElementById('proveedor').value;
        // Realizar una solicitud AJAX con el ID seleccionado
        $.ajax({
            url: '/listar_codigo_unico', // <-- ajusta esta URL
            method: 'GET',
            data: { id: selectedId, proveedor: proveedordata },
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCSRFToken()
            },
            success: function (response) {
                //console.log('Respuesta del servidor:', response);

                // Aquí puedes actualizar algún componente, input o tabla según el response
                // Por ejemplo, mostrar más detalles del insumo seleccionado
                $('#codigo').val(response.codigo_unico);
            },
            error: function (xhr) {
                console.error('Error en la consulta:', xhr.responseText);
            }
        });
    });

    // LISTADO DE INDICES PARA EL SELECT2
    $.ajax({
        url: `/listar_indice`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': getCSRFToken()
        },
        success: function (data) {
            // Convertir data en un array si no lo es
            const workers = Array.isArray(data) ? data : Object.values(data);

            if (workers.length > 0) {
                const selectElement = $('#grupo_gen');

                // Limpiar el select antes de agregar nuevas opciones
                selectElement.html('<option value="">Mano de obra (incluido leyes sociales)</option>');

                // Agregar las opciones dinámicamente
                workers.forEach(indice => {
                    const option = new Option(`${indice.codigo} - ${indice.descripcion}`, indice.id, false, false);
                    selectElement.append(option);
                });

                // Actualizar Select2 con las nuevas opciones
                selectElement.trigger('change');
            } else {
                console.warn('No se encontraron índices.');
            }
        },
        error: function (error) {
            console.error('Error al obtener los índices:', error);
        }
    });

    // TABLAS TABULATOR PARA EL LISTADO, EDITADO, ELIMINADO, SELECCIONADO Y AGREGADO
    var remplazar = new Tabulator("#reemplace", {
        height: "380px",
        layout: "fitColumns",
        pagination: "local",
        paginationSize: 6,
        paginationSizeSelector: [3, 6, 8, 10],
        movableColumns: true,
        paginationCounter: "rows",
        placeholder: "No existen insumos para reemplazar",
        columns: [
            { title: "#", field: "numeracion", hozAlign: "center", },
            { title: "IU", field: "grupogenerico", width: 60, sorter: "number", headerFilter: "input" },
            { title: "Prov.", field: "proveedor", width: 60, sorter: "number", headerFilter: "input" },
            { title: "Cod.", field: "codigo", width: 60, sorter: "number", headerFilter: "input" },
            { title: "Cod. Elec.", field: "codelectrico", width: 60, sorter: "number", headerFilter: "input" },
            { title: "Descripcion", field: "descripcion", width: 250, headerFilter: "input" },
            { title: "Especificaciones", field: "especificaciones", width: 150, headerFilter: "input" },
            {
                title: "Unidad",
                field: "unidad",
                editor: "select",
                editorParams: {
                    values: {
                        "m2": "[m2] GENERAL - % apli. al total del pre...",
                        "bls": "[bls] GENERAL - BALDE",
                        "bol": "[bol] GENERAL - BOLSA",
                        "cja": "[cja] GENERAL - CAJA",
                        "cjt": "[cjt] GENERAL - CONJUNTO",
                        "cm": "[cm] GENERAL - CENTIMETRO",
                        "cm2": "[cm2] GENERAL - CENTIMETRO CUADRADO",
                        "cm3": "[cm3] GENERAL - CENTIMETRO CUBICO",
                        "cto": "[cto] GENERAL - CONJUNTO",
                        "est": "[est] GLOBAL - ESTIMADO",
                        "gal": "[gal] GLOBAL - GALON",
                        "glb": "[glb] GLOBAL - GLOBAL",
                        "gl": "[gl] GLOBAL - GLOBAL",
                        "ha": "[ha] GENERAL - HECTAREA",
                        "hom": "[hom] GENERAL - HOMBRE - MES",
                        "jgo": "[jgo] GENERAL - JUEGO",
                        "kg": "[kg] GENERAL - KILOGRAMO",
                        "kit": "[kit] GENERAL - KIT",
                        "km": "[km] GENERAL - KILOMETRO",
                        "l": "[l] GENERAL - LITRO",
                        "lb": "[lb] GENERAL - LIBRA",
                        "m": "[m] GLOBAL - METRO LINEAL",
                        "m2": "[m2] GLOBAL - METRO CUADRADO",
                        "m3": "[m3] GLOBAL - METRO CUBICO",
                        "mil": "[mil] GENERAL - MILLAR",
                        "p2": "[p2] GENERAL - PIE CUADRADO",
                        "par": "[par] GENERAL - JUEGO",
                        "plg": "[plg] GENERAL - PLANCHA",
                        "pin": "[pin] GENERAL - PINTA",
                        "ppt": "[ppt] GENERAL - PUNTO",
                        "pto": "[pto] GENERAL - PIEZA",
                        "ril": "[ril] GENERAL - ROLLO",
                        "sac": "[sac] GENERAL - SACO",
                        "sco": "[sco] GENERAL - SACO",
                        "tm": "[tm] GENERAL - TONELADA METRICA",
                        "tub": "[tub] GENERAL - TUBERIA",
                        "und": "[und] GLOBAL - UNIDAD",
                        "uni": "[uni] GLOBAL - UNIDAD",
                        "var": "[var] GLOBAL - VARILLA"
                    },
                    clearable: true
                },
                headerFilter: true,
                headerFilterParams: {
                    values: {
                        "m2": "[m2] GENERAL - % apli. al total del pre...",
                        "bls": "[bls] GENERAL - BALDE",
                        "bol": "[bol] GENERAL - BOLSA",
                        "cja": "[cja] GENERAL - CAJA",
                        "cjt": "[cjt] GENERAL - CONJUNTO",
                        "cm": "[cm] GENERAL - CENTIMETRO",
                        "cm2": "[cm2] GENERAL - CENTIMETRO CUADRADO",
                        "cm3": "[cm3] GENERAL - CENTIMETRO CUBICO",
                        "cto": "[cto] GENERAL - CONJUNTO",
                        "est": "[est] GLOBAL - ESTIMADO",
                        "gal": "[gal] GLOBAL - GALON",
                        "glb": "[glb] GLOBAL - GLOBAL",
                        "gl": "[gl] GLOBAL - GLOBAL",
                        "ha": "[ha] GENERAL - HECTAREA",
                        "hom": "[hom] GENERAL - HOMBRE - MES",
                        "jgo": "[jgo] GENERAL - JUEGO",
                        "kg": "[kg] GENERAL - KILOGRAMO",
                        "kit": "[kit] GENERAL - KIT",
                        "km": "[km] GENERAL - KILOMETRO",
                        "l": "[l] GENERAL - LITRO",
                        "lb": "[lb] GENERAL - LIBRA",
                        "m": "[m] GLOBAL - METRO LINEAL",
                        "m2": "[m2] GLOBAL - METRO CUADRADO",
                        "m3": "[m3] GLOBAL - METRO CUBICO",
                        "mil": "[mil] GENERAL - MILLAR",
                        "p2": "[p2] GENERAL - PIE CUADRADO",
                        "par": "[par] GENERAL - JUEGO",
                        "plg": "[plg] GENERAL - PLANCHA",
                        "pin": "[pin] GENERAL - PINTA",
                        "ppt": "[ppt] GENERAL - PUNTO",
                        "pto": "[pto] GENERAL - PIEZA",
                        "ril": "[ril] GENERAL - ROLLO",
                        "sac": "[sac] GENERAL - SACO",
                        "sco": "[sco] GENERAL - SACO",
                        "tm": "[tm] GENERAL - TONELADA METRICA",
                        "tub": "[tub] GENERAL - TUBERIA",
                        "und": "[und] GLOBAL - UNIDAD",
                        "uni": "[uni] GLOBAL - UNIDAD",
                        "var": "[var] GLOBAL - VARILLA",
                        "": ""
                    },
                    clearable: true
                }
            },
            { title: "Precio", field: "preciounitario", width: 80, sorter: "number" }
        ],
    });

    // Inicializar tabla insumoAcu
    var insumoAcu = new Tabulator("#insumoCompuesto", {
        height: "380px",
        layout: "fitColumns",
        pagination: "local",
        paginationSize: 6,
        paginationSizeSelector: [3, 6, 8, 10],
        movableColumns: true,
        paginationCounter: "rows",
        columns: [
            { title: "#", field: "numeracion", hozAlign: "center" },
            { title: "IU", field: "grupogenerico", width: 60, sorter: "number", headerFilter: "input" },
            { title: "Grupo.", field: "proveedor", width: 60, sorter: "number", headerFilter: "input" },
            { title: "Cod.", field: "codigo", width: 60, sorter: "number", headerFilter: "input" },
            { title: "Descripcion", field: "descripcion", width: 250, headerFilter: "input" },
            { title: "Especificaciones", field: "Especificaciones", width: 150, headerFilter: "input" },
            {
                title: "Unidad",
                field: "unidad",
                editor: "select",
                editorParams: {
                    values: {
                        "m2": "[m2] GENERAL - % apli. al total del pre...",
                        "bls": "[bls] GENERAL - BALDE",
                        "bol": "[bol] GENERAL - BOLSA",
                        "cja": "[cja] GENERAL - CAJA",
                        "cjt": "[cjt] GENERAL - CONJUNTO",
                        "cm": "[cm] GENERAL - CENTIMETRO",
                        "cm2": "[cm2] GENERAL - CENTIMETRO CUADRADO",
                        "cm3": "[cm3] GENERAL - CENTIMETRO CUBICO",
                        "cto": "[cto] GENERAL - CONJUNTO",
                        "est": "[est] GLOBAL - ESTIMADO",
                        "gal": "[gal] GLOBAL - GALON",
                        "glb": "[glb] GLOBAL - GLOBAL",
                        "gl": "[gl] GLOBAL - GLOBAL",
                        "ha": "[ha] GENERAL - HECTAREA",
                        "hom": "[hom] GENERAL - HOMBRE - MES",
                        "jgo": "[jgo] GENERAL - JUEGO",
                        "kg": "[kg] GENERAL - KILOGRAMO",
                        "kit": "[kit] GENERAL - KIT",
                        "km": "[km] GENERAL - KILOMETRO",
                        "l": "[l] GENERAL - LITRO",
                        "lb": "[lb] GENERAL - LIBRA",
                        "m": "[m] GLOBAL - METRO LINEAL",
                        "m2": "[m2] GLOBAL - METRO CUADRADO",
                        "m3": "[m3] GLOBAL - METRO CUBICO",
                        "mil": "[mil] GENERAL - MILLAR",
                        "p2": "[p2] GENERAL - PIE CUADRADO",
                        "par": "[par] GENERAL - JUEGO",
                        "plg": "[plg] GENERAL - PLANCHA",
                        "pin": "[pin] GENERAL - PINTA",
                        "ppt": "[ppt] GENERAL - PUNTO",
                        "pto": "[pto] GENERAL - PIEZA",
                        "ril": "[ril] GENERAL - ROLLO",
                        "sac": "[sac] GENERAL - SACO",
                        "sco": "[sco] GENERAL - SACO",
                        "tm": "[tm] GENERAL - TONELADA METRICA",
                        "tub": "[tub] GENERAL - TUBERIA",
                        "und": "[und] GLOBAL - UNIDAD",
                        "uni": "[uni] GLOBAL - UNIDAD",
                        "var": "[var] GLOBAL - VARILLA"
                    },
                    clearable: true
                },
                headerFilter: true,
                headerFilterParams: {
                    values: {
                        "m2": "[m2] GENERAL - % apli. al total del pre...",
                        "bls": "[bls] GENERAL - BALDE",
                        "bol": "[bol] GENERAL - BOLSA",
                        "cja": "[cja] GENERAL - CAJA",
                        "cjt": "[cjt] GENERAL - CONJUNTO",
                        "cm": "[cm] GENERAL - CENTIMETRO",
                        "cm2": "[cm2] GENERAL - CENTIMETRO CUADRADO",
                        "cm3": "[cm3] GENERAL - CENTIMETRO CUBICO",
                        "cto": "[cto] GENERAL - CONJUNTO",
                        "est": "[est] GLOBAL - ESTIMADO",
                        "gal": "[gal] GLOBAL - GALON",
                        "glb": "[glb] GLOBAL - GLOBAL",
                        "gl": "[gl] GLOBAL - GLOBAL",
                        "ha": "[ha] GENERAL - HECTAREA",
                        "hom": "[hom] GENERAL - HOMBRE - MES",
                        "jgo": "[jgo] GENERAL - JUEGO",
                        "kg": "[kg] GENERAL - KILOGRAMO",
                        "kit": "[kit] GENERAL - KIT",
                        "km": "[km] GENERAL - KILOMETRO",
                        "l": "[l] GENERAL - LITRO",
                        "lb": "[lb] GENERAL - LIBRA",
                        "m": "[m] GLOBAL - METRO LINEAL",
                        "m2": "[m2] GLOBAL - METRO CUADRADO",
                        "m3": "[m3] GLOBAL - METRO CUBICO",
                        "mil": "[mil] GENERAL - MILLAR",
                        "p2": "[p2] GENERAL - PIE CUADRADO",
                        "par": "[par] GENERAL - JUEGO",
                        "plg": "[plg] GENERAL - PLANCHA",
                        "pin": "[pin] GENERAL - PINTA",
                        "ppt": "[ppt] GENERAL - PUNTO",
                        "pto": "[pto] GENERAL - PIEZA",
                        "ril": "[ril] GENERAL - ROLLO",
                        "sac": "[sac] GENERAL - SACO",
                        "sco": "[sco] GENERAL - SACO",
                        "tm": "[tm] GENERAL - TONELADA METRICA",
                        "tub": "[tub] GENERAL - TUBERIA",
                        "und": "[und] GLOBAL - UNIDAD",
                        "uni": "[uni] GLOBAL - UNIDAD",
                        "var": "[var] GLOBAL - VARILLA",
                        "": ""
                    },
                    clearable: true
                }
            },
            { title: "Precio", field: "preciounitario", width: 80, sorter: "number" }
        ],
    });

    // Función para cargar datos en las tablas
    function loadTableData() {
        console.log('Cargando datos para el tipo de insumo:', selectedTipoInsumo); // Log para verificar el tipo de insumo seleccionado
        $.ajax({
            url: `/insumos/${selectedTipoInsumo}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCSRFToken()
            },
            success: function (response) {
                const datosFormateadosremplazar = response.map((item, index) => {
                    return {
                        id: item.id,
                        numeracion: index + 1,
                        codigo: item.codigo?.toString().slice(-4), // Solo los últimos 4 dígitos
                        codigounico: item.codigo, // Solo los últimos 4 dígitos
                        proveedor: item.proveedor,
                        descripcion: item.descripcion,
                        marca: item.marca,
                        especificaciones: item.especificaciones,
                        tipoinsumo: item.tipoinsumo,
                        unidad: item.unidad,
                        unidadcompra: item.unidadcompra,
                        preciounitario: parseFloat(item.preciounitario),
                        fecha: item.fecha,
                        fichatecnica: item.fichatecnica,
                        codigoelectrico: item.codigoelectrico,
                        habilitar: item.habilitar,
                        grupogenerico: item.indice?.codigo ?? item.grupogenerico, // prioriza el código del índice si existe
                    };
                });
                console.log('Respuesta del servidor:', datosFormateadosremplazar); // Log para verificar la respuesta
                remplazar.setData(datosFormateadosremplazar); // Datos ya filtrados por el servidor
            },
            error: function (error) {
                console.error('Error al obtener los insumos:', error);
                Swal.fire('Error', 'No se pudieron cargar los insumos.', 'error');
            }
        });
        // Cargar datos en la tabla insumoAcu (sin filtro por tipo de insumo)
        $.ajax({
            url: '/insumos',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCSRFToken()
            },
            success: function (response) {
                // Transformar datos
                const datosFormateados = response.map((item, index) => {
                    return {
                        id: item.id,
                        numeracion: index + 1,
                        codigo: item.codigo?.toString().slice(-4), // Solo los últimos 4 dígitos
                        codigounico: item.codigo, // Solo los últimos 4 dígitos
                        proveedor: item.proveedor,
                        descripcion: item.descripcion,
                        marca: item.marca,
                        especificaciones: item.especificaciones,
                        tipoinsumo: item.tipoinsumo,
                        unidad: item.unidad,
                        unidadcompra: item.unidadcompra,
                        preciounitario: parseFloat(item.preciounitario),
                        fecha: item.fecha,
                        fichatecnica: item.fichatecnica,
                        codigoelectrico: item.codigoelectrico,
                        habilitar: item.habilitar,
                        grupogenerico: item.indice?.codigo ?? item.grupogenerico, // prioriza el código del índice si existe
                    };
                });
                insumoAcu.setData(datosFormateados);
            },
            error: function (error) {
                console.error('Error al obtener los insumos:', error);
                Swal.fire('Error', 'No se pudieron cargar los insumos.', 'error');
            }
        });
    }

    function losdInsumosCompletos() {
        $.ajax({
            url: '/insumos',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCSRFToken()
            },
            success: function (response) {
                // Transformar datos
                const datosFormateados = response.map((item, index) => {
                    return {
                        id: item.id,
                        numeracion: index + 1,
                        codigo: item.codigo?.toString().slice(-4), // Solo los últimos 4 dígitos
                        codigounico: item.codigo, // Solo los últimos 4 dígitos
                        proveedor: item.proveedor,
                        descripcion: item.descripcion,
                        marca: item.marca,
                        especificaciones: item.especificaciones,
                        tipoinsumo: item.tipoinsumo,
                        unidad: item.unidad,
                        unidadcompra: item.unidadcompra,
                        preciounitario: parseFloat(item.preciounitario),
                        fecha: item.fecha,
                        fichatecnica: item.fichatecnica,
                        codigoelectrico: item.codigoelectrico,
                        habilitar: item.habilitar,
                        grupogenerico: item.indice?.codigo ?? item.grupogenerico, // prioriza el código del índice si existe
                    };
                });
                insumoAcu.setData(datosFormateados);
            },
            error: function (error) {
                console.error('Error al obtener los insumos:', error);
                Swal.fire('Error', 'No se pudieron cargar los insumos.', 'error');
            }
        });
    }

    // Row click event with SweetAlert2
    function handleRowClick(e, row, table) {
        Swal.fire({
            title: 'Opciones',
            text: `Seleccionaste el insumo: ${row.getData().descripcion}`,
            showCancelButton: true,
            showDenyButton: true,
            showConfirmButton: true,
            confirmButtonText: 'Seleccionar',
            denyButtonText: 'Editar',
            cancelButtonText: 'Eliminar',
            confirmButtonColor: '#3085d6',
            denyButtonColor: '#f0ad4e',
            cancelButtonColor: '#d33',
        }).then((result) => {
            if (result.isConfirmed) {
                // Option 1: Select (log to console)
                console.log('Insumo seleccionado:', row.getData());
                Swal.fire('Seleccionado', 'La información se ha mostrado en la consola.', 'success');
            } else if (result.isDenied) {
                // Option 2: Edit (load data into form)
                const insumoId = row.getData().id;
                console.log('Insumo ID:', insumoId);
                console.log('Datos de la fila:', row.getData());

                // Fetch insumo data from server to ensure all fields are available
                $.ajax({
                    url: `/insumos/${insumoId}`,
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': getCSRFToken()
                    },
                    success: function (data) {
                        console.log('Datos del servidor:', data);

                        // Populate form fields
                        document.getElementById('insumo_id').value = data.id || '';
                        document.getElementById('codigo').value = data.codigo || '';
                        // document.getElementById('grupo_gen').value = data.grupogenerico || '';
                        $('#grupo_gen').val(data.grupogenerico).trigger('change');
                        document.getElementById('proveedor').value = data.proveedor || '';
                        document.getElementById('descripcion').value = data.descripcion || '';
                        // document.getElementById('marca').value = data.marca || 'null';
                        document.getElementById('especificaciones').value = data.especificaciones || '';
                        document.getElementById('tipo_insumo').value = data.tipoinsumo || '';
                        $('#unidad_medida').val(data.unidad).trigger('change');
                        // $('#unidad_compra').val(data.unidadcompra).trigger('change');
                        // document.getElementById('unidad_medida').value = data.unidad || '';
                        // document.getElementById('unidad_compra').value = data.unidadcompra || '';
                        document.getElementById('preciounitario').value = data.preciounitario || '';
                        // document.getElementById('fecha').value = data.fecha || '';
                        // document.getElementById('ficha_tecnica').value = data.fichatecnica || '';
                        document.getElementById('habilitado').checked = data.habilitar === 1 || data.habilitar === true;
                        // document.getElementById('codelectrico').checked = data.codigoelectrico === 1 || data.codigoelectrico === true;

                        // Handle codelectrico if present
                        const codelectricoInput = document.querySelector('input[name="codelectrico"]');
                        const codelectricoCheck = document.querySelector('input[name="codelectrico_check"]');
                        if (codelectricoInput && codelectricoCheck) {
                            codelectricoInput.value = data.codelectrico || '';
                            codelectricoCheck.checked = !!data.codelectrico;
                        }

                        // Ensure modal is visible
                        document.getElementById('insumosModal').classList.remove('hidden');

                        // Switch to the Edit tab
                        const editTab = document.getElementById('edit-replace-tab');
                        if (editTab) {
                            editTab.click();
                            // Force tab content to be visible
                            document.getElementById('edit-replace').classList.remove('hidden');
                            document.getElementById('replace').classList.add('hidden');
                            // document.getElementById('compound').classList.add('hidden');
                        } else {
                            console.error('Edit tab not found');
                        }

                        Swal.fire('Editar', 'Formulario cargado para edición.', 'info');
                    },
                    error: function (error) {
                        console.error('Error al obtener datos del insumo:', error);
                        Swal.fire('Error', 'No se pudieron cargar los datos del insumo.', 'error');
                    }
                });
            } else if (result.isDismissed && result.dismiss === Swal.DismissReason.cancel) {
                // Option 3: Delete
                Swal.fire({
                    title: '¿Estás seguro?',
                    text: `Vas a eliminar el insumo: ${row.getData().descripcion}`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Sí, eliminar',
                    cancelButtonText: 'Cancelar'
                }).then((deleteResult) => {
                    if (deleteResult.isConfirmed) {
                        $.ajax({
                            url: `/insumos/${row.getData().id}`,
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': getCSRFToken()
                            },
                            success: function () {
                                table.deleteRow(row);
                                Swal.fire('Eliminado', 'El insumo ha sido eliminado.', 'success');
                            },
                            error: function (error) {
                                console.error('Error al eliminar:', error);
                                Swal.fire('Error', 'No se pudo eliminar el insumo.', 'error');
                            }
                        });
                    }
                });
            }
        });
    }

    remplazar.on("rowClick", function (e, row) {
        handleRowClick(e, row, remplazar);
    });

    insumoAcu.on("rowClick", function (e, row) {
        handleRowClick(e, row, insumoAcu);
    });

    // Form submission for add/edit
    document.getElementById('insumoForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const form = this;
        const formData = new FormData(form);
        console.log('Form data:', formData); // Log the FormData object 
        const insumoId = document.getElementById('insumo_id').value;
        const url = insumoId ? `/insumos/${insumoId}` : '/insumos';

        if (insumoId) {
            formData.append('_method', 'PUT'); // Laravel necesita esto para actualizaciones
        }

        $.ajax({
            url: url,
            method: 'POST', // Siempre POST al usar FormData con PUT simulado
            data: formData,
            processData: false,
            contentType: false,
            headers: {
                'X-CSRF-TOKEN': getCSRFToken()
            },
            success: function (response) {
                remplazar.setData('/insumos');
                insumoAcu.setData('/insumos');

                Swal.fire({
                    title: 'Éxito',
                    text: insumoId ? 'Insumo actualizado.' : 'Insumo creado.',
                    icon: 'success',
                    confirmButtonText: 'Aceptar'
                }).then(() => {
                    form.reset(); // Limpiar formulario después de la confirmación
                    document.getElementById('insumo_id').value = '';
                });
            },
            error: function (error) {
                console.error('Error al guardar:', error);
                Swal.fire('Error', 'No se pudo guardar el insumo.', 'error');
            }
        });
    });

    document.getElementById('addInsumoBtn') && document.getElementById('addInsumoBtn').addEventListener('click', function () {
        document.getElementById('insumoForm').reset();
        document.getElementById('insumo_id').value = '';
        document.getElementById('edit-replace-tab').click();
        Swal.fire('Nuevo', 'Formulario listo para agregar un nuevo insumo.', 'info');
    });


});