class TableDetails {
    constructor() {
        this.tableMO = null;
        this.tableMT = null;
        this.tableEQ = null;
        this.callback = null;
        this.detailContainer = document.getElementById("tabla-detall");
    }

    showDetails(row, callback) {
        const rowData = row.getData();
        this.callback = callback;
        this.clearDetails();
        this.createDetailPanel(rowData);
        console.log("datos obtenidos ", rowData)
        // Extraer el ID de detalle_acu desde detalles.id
        const detalleAcuId = rowData.id || null;
        console.log("ID de detalle_acu: ", detalleAcuId);

        // Función que genera una estructura vacía por tipo de insumo
        const generateEmptyGroupedData = () => {
            return {
                materiales: [],
                mano_obra: [],
                equipos: [],
                sin_clasificar: []
            };
        };

        // Si no hay ID válido, cargar estructura vacía
        if (!detalleAcuId) {
            console.warn("No se proporcionó un ID válido para detalle_acu");
            const emptyGroupedData = generateEmptyGroupedData();
            this.createDetailTables(emptyGroupedData);
            return;
        }

        // Realizar la solicitud AJAX
        fetch(`/detalles-acus/${detalleAcuId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error en la solicitud: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                if (!Array.isArray(data) || data.length === 0) {
                    console.warn("La respuesta es vacía o inválida. Cargando estructura vacía.");
                    const emptyGroupedData = generateEmptyGroupedData();
                    this.createDetailTables(emptyGroupedData);
                    return;
                }

                // Parsear los datos y calcular parciales
                const parsedData = data.map(item => {
                    const cantidad = parseFloat(item.cantidad) || 0;
                    const precio = parseFloat(item.precio) || 0;
                    return {
                        id: item.id,
                        ind: item.indice || item.ind,
                        descripcion: item.descripcion,
                        und: item.unidad,
                        cantidad: cantidad,
                        precio: precio,
                        tipoinsumo: item.tipoinsumo || 'sin_clasificar',
                        recursos: item.recursos || '-',
                        parcial: cantidad * precio
                    };
                });

                // Agrupar por tipoinsumo
                const groupedData = parsedData.reduce((acc, item) => {
                    const tipo = item.tipoinsumo;
                    if (!acc[tipo]) {
                        acc[tipo] = [];
                    }
                    acc[tipo].push(item);
                    return acc;
                }, generateEmptyGroupedData());

                // Calcular suma total de parciales
                const totalParcial = parsedData.reduce((sum, item) => sum + item.parcial, 0);

                this.createDetailTables(groupedData);

                // Actualizar callback con datos calculados
                if (this.callback) {
                    this.callback({
                        precio: totalParcial,
                        rendimiento: rowData.rendimiento || rowData.detalles?.rendimiento,
                        detalle_acu_id: detalleAcuId,
                        unidad: rowData.unidad
                    });
                }
            })
            .catch(error => {
                console.error("Error en la solicitud AJAX: ", error);
                const emptyGroupedData = generateEmptyGroupedData();
                this.createDetailTables(emptyGroupedData);
            });
    }

    // showDetails(row, callback) {
    //     const rowData = row.getData();
    //     this.callback = callback;
    //     this.clearDetails();
    //     this.createDetailPanel(rowData);
    //     const detalles = rowData.detalles || this.getDefaultDetails(rowData);
    //     console.log("Detalles: ", detalles);
    //     this.createDetailTables(detalles);
    // }
    clearDetails() {
        this.detailContainer.innerHTML = '';
    }

    createDetailPanel(rowData) {
        this.detailContainer.innerHTML = `
            <div class="bg-gradient-to-br from-gray-800 via-gray-900 to-black p-4 rounded-xl text-xs shadow-lg text-gray-200">
                <!-- Header -->
                <div class="flex justify-between items-center mb-3">
                    <h3 class="text-sm font-bold text-white">🔍 Análisis de Costos Unitarios</h3>
                    <button class="guardar-detalle bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md text-white font-semibold shadow">
                        💾 Guardar
                    </button>
                </div>
        
                <!-- Información Principal -->
                <div class="grid grid-cols-2 gap-2 bg-gray-800 p-2 rounded-md shadow-inner">
                    <div class="flex flex-col space-y-0.5">
                        <span class="font-semibold text-gray-400">Partida:</span>
                        <span id="items" class="font-medium text-gray-200">${rowData.item} ${rowData.descripcion}</span>
                    </div>
                    <div class="flex flex-col text-right space-y-0.5">
                        <span class="font-semibold text-gray-400">Costo Unitario (${rowData?.detalles?.unidadMD || 'm'}):</span>
                        <span id="costostotales" class="font-bold text-green-400">${rowData.precio || 0}</span>
                    </div>
                </div>
        
                <!-- Rendimiento -->
                <div class="flex justify-end items-center mt-2 space-x-1">
                    <span class="text-gray-400">Rendimiento:</span>
                    <input 
                        type="number" 
                        id="rendimiento" 
                        class="w-16 text-center border border-gray-600 bg-gray-700 text-gray-300 rounded-md px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value="${rowData?.detalles?.rendimiento || 0}" 
                    />
                    <select 
                        id="unidadSelect" 
                        class="w-20 bg-gray-700 border border-gray-600 rounded-md px-2 py-0.5 text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500">
                        <option value="hh">hh</option>
                        <option value="kg">kg</option>
                        <option value="m">m</option>
                        <option value="m²">m²</option>
                        <option value="m³">m³</option>
                        <option value="bol">bol</option>
                        <option value="p²">p²</option>
                        <option value="p³">p³</option>
                        <option value="und">und</option>
                        <option value="lt">lt</option>
                        <option value="gal">gal</option>
                        <option value="hm">hm</option>
                        <option value="Glb">Glb</option>
                        <option value="par">Par</option>
                        <option value="rll">Rollo</option>
                        <option value="mes">Mes</option>
                    </select>
                    <span class="font-bold text-green-400">/ Día</span>
                </div>
        
                <!-- Secciones -->
                <div class="space-y-4 text-xs mt-4">
                    <!-- Mano de Obra -->
                    <div>
                        <div class="flex justify-between items-center">
                            <h4 class="font-semibold text-white">👷‍♂️ Mano de Obra</h4>
                            <button id="modalInsumosMO" class="add-mo-row bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded-md text-white shadow">
                                ➕
                            </button>
                        </div>
                        <div id="detail-table"></div>
                    </div>
        
                    <!-- Materiales -->
                    <div>
                        <div class="flex justify-between items-center">
                            <h4 class="font-semibold text-white">🛠 Materiales</h4>
                            <button id="modalInsumosMat" class="add-mt-row bg-green-600 hover:bg-green-700 px-2 py-1 rounded-md text-white shadow">
                                ➕
                            </button>
                        </div>
                        <div id="detail-table-material"></div>
                    </div>
        
                    <!-- Equipos -->
                    <div>
                        <div class="flex justify-between items-center">
                            <h4 class="font-semibold text-white">🚜 Equipos</h4>
                            <button id="modalInsumosEq" class="add-eq-row bg-yellow-600 hover:bg-yellow-700 px-2 py-1 rounded-md text-white shadow">
                                ➕
                            </button>
                        </div>
                        <div id="detail-table-equipo"></div>
                    </div>
                </div>
            </div>
        `;

        const unidadSelect = document.getElementById('unidadSelect');
        unidadSelect.value = rowData?.detalles?.unidadMD || 'm';
        unidadSelect.addEventListener('change', function () {
            console.log("Unidad seleccionada: ", unidadSelect.value);
        });
        this.initializeDetailButtons();

    }

    initializeDetailButtons() {
        const self = this; // <- guarda la referencia al objeto original

        this.detailContainer.querySelector('.guardar-detalle').onclick = () => {
            this.saveAllDetails();
        };

        const modal = document.getElementById('insumosModal');
        const closeModalBtn = document.getElementById('closeModal');
        const buttonIds = [
            { id: 'modalInsumosMO', tipo: 'manoobra' }, // Mano de obra
            { id: 'modalInsumosMat', tipo: 'materiales' }, // Materiales
            { id: 'modalInsumosEq', tipo: 'equipo' } // Equipos
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
        // Evento al seleccionar una opción del select2
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

        // $('#grupo_gen').on('select2:select', function (e) {
        //     const selectedId = e.params.data.id; // Obtener el id de la opción seleccionada
        //     console.log('ID seleccionado:', selectedId);
        //     // Aquí puedes usar el selectedId para otras operaciones
        // });

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

        // Load data into tables
        function loadTableData() {
            $.ajax({
                url: `/insumos/tipo/${selectedTipoInsumo}`,
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
                    // Option 1: Select (add to appropriate detail table)
                    const insumo = row.getData();
                    console.log('Insumo seleccionado:', insumo);
                    // Map insumo data to table row structure
                    const newRow = {
                        id: insumo.id,
                        ind: insumo.codigounico,// insumo.tipoinsumo === 'manoobra' ? 'MO' : insumo.tipoinsumo === 'materiales' ? 'MT' : insumo.tipoinsumo === 'equipo' ? 'EQ' : 'UNKNOWN',
                        codelect: insumo.codelectrico || '',
                        descripcion: insumo.descripcion || 'Insumo sin descripción',
                        und: insumo.unidad || 'und', // Default to 'und' if unidad is empty
                        recursos: insumo.tipoinsumo === 'manoobra' ? 0 : insumo.tipoinsumo === 'materiales' ? '-' : insumo.tipoinsumo === 'equipo' ? 0 : 'UNKNOWN',//insumo.tipoinsumo === 'materiales' ? '-' : '1', // Per your button logic
                        cantidad: 0,
                        precio: insumo.preciounitario || 0,
                        parcial: 0
                    };

                    // Add to the appropriate table based on tipo_insumo
                    try {
                        if (insumo.tipoinsumo === 'manoobra' && self.tableMO) {
                            self.tableMO.addRow(newRow);
                            Swal.fire('Añadido', 'Insumo añadido a la tabla Mano de Obra.', 'success');
                            modal.classList.add('hidden');
                        } else if (insumo.tipoinsumo === 'materiales' && self.tableMT) {
                            self.tableMT.addRow(newRow);
                            Swal.fire('Añadido', 'Insumo añadido a la tabla Materiales.', 'success');
                            modal.classList.add('hidden');
                        } else if (insumo.tipoinsumo === 'equipo' && self.tableEQ) {
                            self.tableEQ.addRow(newRow);
                            Swal.fire('Añadido', 'Insumo añadido a la tabla Equipos.', 'success');
                            modal.classList.add('hidden');
                        } else {
                            Swal.fire('Error', 'Tipo de insumo no válido o tabla no encontrada.', 'error');
                            modal.classList.add('hidden');
                        }
                    } catch (error) {
                        console.error('Error al añadir fila:', error);
                        Swal.fire('Error', 'No se pudo añadir el insumo a la tabla.', 'error');
                    }
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
                            document.getElementById('marca').value = data.marca || 'null';
                            document.getElementById('especificaciones').value = data.especificaciones || '';
                            document.getElementById('tipo_insumo').value = data.tipoinsumo || '';
                            $('#unidad_medida').val(data.unidad).trigger('change');
                            $('#unidad_compra').val(data.unidadcompra).trigger('change');
                            // document.getElementById('unidad_medida').value = data.unidad || '';
                            // document.getElementById('unidad_compra').value = data.unidadcompra || '';
                            document.getElementById('preciounitario').value = data.preciounitario || '';
                            document.getElementById('fecha').value = data.fecha || '';
                            document.getElementById('ficha_tecnica').value = data.fichatecnica || '';
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
                                document.getElementById('compound').classList.add('hidden');
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
    }

    getCSRFToken() {
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (!token) {
            console.error('CSRF token not found in meta tag');
        }
        return token;
    }

    saveAllDetails() {
          const id_presupuesto = document.getElementById('id_presupuestos').value;
        // Recolectar datos de las tablas
        const manoObraData = this.tableMO.getData();
        const materialesData = this.tableMT.getData();
        const equiposData = this.tableEQ.getData();

        // Combinar todos los datos en un solo array para el modelo detallesAcu
        const allItems = [
            ...manoObraData.map(item => ({
                indice: item.ind || item.indice || '',
                descripcion: item.descripcion || '',
                unidad: item.und || item.unidad || '',
                recursos: item.recursos || '-',
                cantidad: parseFloat(item.cantidad) || 0,
                precio: parseFloat(item.precio) || 0,
                total: (parseFloat(item.cantidad) || 0) * (parseFloat(item.precio) || 0),
                tipoinsumo: 'mano_obra',
                id_insumo: item.id_insumo || null, // Asumiendo que id_insumo puede ser null
                presupuesto_designado:id_presupuesto || null,
                idgroupdetails: this.detalleAcuId
            })),
            ...materialesData.map(item => ({
                indice: item.ind || item.indice || '',
                descripcion: item.descripcion || '',
                unidad: item.und || item.unidad || '',
                recursos: item.recursos || '-',
                cantidad: parseFloat(item.cantidad) || 0,
                precio: parseFloat(item.precio) || 0,
                total: (parseFloat(item.cantidad) || 0) * (parseFloat(item.precio) || 0),
                tipoinsumo: 'materiales',
                id_insumo: item.id_insumo || null,
                presupuesto_designado:id_presupuesto || null,
                idgroupdetails: this.detalleAcuId
            })),
            ...equiposData.map(item => ({
                indice: item.ind || item.indice || '',
                descripcion: item.descripcion || '',
                unidad: item.und || item.unidad || '',
                recursos: item.recursos || '-',
                cantidad: parseFloat(item.cantidad) || 0,
                precio: parseFloat(item.precio) || 0,
                total: (parseFloat(item.cantidad) || 0) * (parseFloat(item.precio) || 0),
                tipoinsumo: 'equipos',
                id_insumo: item.id_insumo || null,
                presupuesto_designado:id_presupuesto || null,
                idgroupdetails: this.detalleAcuId
            }))
        ];

        // Datos mínimos para el JSON (callback)
        const jsonDetails = {
            id: this.detalleAcuId,
            rendimiento: document.getElementById("rendimiento").value || '',
            unidad: document.getElementById("unidadSelect").value || '',
            precio: this.calculateTotalGeneral()
        };

        // Enviar datos al servidor mediante AJAX para la base de datos
        const csrfToken = this.getCSRFToken();
        if (!csrfToken) {
            console.error('No se puede proceder con la solicitud AJAX sin el token CSRF');
            return;
        }

        fetch('/agregardetallesAcus', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            },
            body: JSON.stringify({
                idgroupdetails: this.detalleAcuId,
                items: allItems
            })
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => {
                        throw new Error(`Error en la solicitud: ${response.status} - ${err.message || 'Sin mensaje'}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log('Datos guardados exitosamente en la base de datos:', data);
                // Ejecutar callback con datos mínimos para el JSON
                if (this.callback) {
                    this.callback(jsonDetails);
                }
            })
            .catch(error => {
                console.error('Error al guardar los datos en la base de datos:', error);
            });
    }

    /*saveAllDetails() {
        const allDetails = {
            detalles: {
                id: 1736014370240,
                rendimiento: document.getElementById("rendimiento").value,
                unidadMD: document.getElementById("unidadSelect").value,
                manoObra: this.tableMO.getData(),
                materiales: this.tableMT.getData(),
                equipos: this.tableEQ.getData(),
            },
            totalGeneral: this.calculateTotalGeneral()
        };

        if (this.callback) {
            this.callback({
                ...allDetails,
                precio: allDetails.totalGeneral
            });
        }
    }*/

    calculateTotalGeneral() {
        const moTotal = this.tableMO.getCalcResults().bottom.parcial || 0;
        const mtTotal = this.tableMT.getCalcResults().bottom.parcial || 0;
        const eqTotal = this.tableEQ.getCalcResults().bottom.parcial || 0;
        return moTotal + mtTotal + eqTotal;
    }

    createDetailTables(detalles) {
        // Tabla Mano de Obra
        this.tableMO = this.createTable("#detail-table", detalles.manoObra || [], "Mano de Obra");

        // Tabla Materiales
        this.tableMT = this.createTable("#detail-table-material", detalles.materiales || [], "Materiales");

        // Tabla Equipos
        this.tableEQ = this.createTable("#detail-table-equipo", detalles.equipos || [], "Equipos");

        // Actualizar totales iniciales
        this.updateTotals();
    }

    createTable(element, data, title) {
        return new Tabulator(element, {
            data: data,
            headerFilter: true,
            layout: "fitColumns",
            maxHeight: "100%",
            columns: [
                { title: "Ind.", field: "ind", width: 100, editor: "input" },
                {
                    title: "descr.", field: "descripcion", editor: "input", widthGrow: 1,
                    cssClass: "wrap-text"
                },
                {
                    title: "Unid.", field: "und", widthGrow: 1, editor: "list", editorParams: {
                        values: {
                            "hh": "horahombre",
                            "kg": "kilogramo",
                            "m": "metros",
                            "m²": "metroscuadrados",
                            "m³": "metroscubicos",
                            "bol": "bolsa",
                            "p²": "piecuadrado",
                            "p³": "piecubico",
                            "%mo": "porcentajemanoobra",
                            "und": "unidad",
                            "lt": "litro",
                            "gal": "galon",
                            "hm": "horamaquina",
                            "Glb": "galonbolsa",
                            "par": "par",
                            "rll": "rollo",
                            "mes": "mes",
                        },
                    },
                    cellEdited: (cell) => {
                        const selectedValue = cell.getValue();
                        console.log("Unidad seleccionada:", selectedValue); // Muestra el valor seleccionado en la consola
                        const row = cell.getRow();
                        row.update({ cantidad: "" }); // Limpiar el campo cantidad al cambiar unidad
                        row.getCell("cantidad").checkHeight(); // Refrescar celda
                        row.getCell("cantidad").setValue(""); // Asegurar que el valor se limpie

                        if (row.getData().und === "%mo") {
                            this.calculateRowUndMO(row);
                            const precioCell = row.getCell("precio"); // Obtener la celda de precio
                            if (precioCell) {
                                precioCell.getElement().style.backgroundColor = "yellow";
                            }
                            row.update({ recursos: "-" });
                        } else if (row.getData().und === "hh" || row.getData().und === "hm") {
                            const cantidadCell = row.getCell("cantidad");
                            if (cantidadCell) {
                                cantidadCell.getElement().style.backgroundColor = "yellow";
                            }
                        }
                    }
                },
                {
                    title: "rec.", field: "recursos", editor: "input", widthGrow: 1,
                    cellEdited: (cell) => {
                        const row = cell.getRow();
                        const data = row.getData();
                        if (row.getData().und === "hh" || row.getData().und === "hm") {
                            const rendimiento = parseFloat(document.getElementById("rendimiento").value) || 1;
                            const recursos = parseFloat(data.recursos) || 0;
                            const cantidad = (recursos * 8) / rendimiento;
                            const parcial = ((data.precio * cantidad) / 100).toFixed(4);
                            row.update({ cantidad: parseFloat(cantidad.toFixed(4)) });
                            row.update({ parcial: parcial });
                        }
                        else if (row.getData().und === "%mo") {
                            this.calculateRowMOPorcent(row)
                        }
                    }
                },
                {
                    title: "Cant.",
                    field: "cantidad",
                    widthGrow: 1,
                    editor: "input",
                    cellEdited: (cell) => {
                        const row = cell.getRow();
                        if (row.getData().und === "hh" || row.getData().und === "hm") {
                            this.calculateRowParcialcantidad(row);
                        } else if (row.getData().und === "%mo") {
                            this.calculateRowMOPorcent(row)
                        }
                        else {
                            this.processQuantityFormula(row);
                        }
                    }
                },
                {
                    title: "Pre.",
                    field: "precio",
                    editor: "number",
                    widthGrow: 1,
                    cellEdited: (cell) => this.calculateRowParcial(cell.getRow())
                },
                {
                    title: "Parcial",
                    field: "parcial",
                    widthGrow: 1,
                    bottomCalc: "sum",
                    bottomCalcFormatter: "money",
                    formatterParams: {
                        decimal: ".",
                        thousand: ",",
                        precision: 2
                    }
                },
                {
                    title: "",
                    width: 45, // Aumentar ancho para el nuevo botón
                    formatter: function (cell) {
                        const row = cell.getRow();
                        const data = row.getData();
                        return `
                            <button class='delete-btn bg-gray-950'>🗑️</button>
                            <button class='view-btn bg-gray-950'>✉️</button>
                        `;
                    },
                    cellClick: (e, cell) => {
                        const row = cell.getRow();
                        const data = row.getData();
                        if (e.target.classList.contains('delete-btn')) {
                            row.delete();
                        } else if (e.target.classList.contains('view-btn')) {
                            const insumoId = row.getData().id;
                            $.ajax({
                                url: `/insumos/${insumoId}`,
                                method: 'GET',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'X-CSRF-TOKEN': this.getCSRFToken()
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
                                    document.getElementById('marca').value = data.marca || 'null';
                                    document.getElementById('especificaciones').value = data.especificaciones || '';
                                    document.getElementById('tipo_insumo').value = data.tipoinsumo || '';
                                    $('#unidad_medida').val(data.unidad).trigger('change');
                                    $('#unidad_compra').val(data.unidadcompra).trigger('change');
                                    // document.getElementById('unidad_medida').value = data.unidad || '';
                                    // document.getElementById('unidad_compra').value = data.unidadcompra || '';
                                    document.getElementById('preciounitario').value = data.preciounitario || '';
                                    document.getElementById('fecha').value = data.fecha || '';
                                    document.getElementById('ficha_tecnica').value = data.fichatecnica || '';
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
                                        document.getElementById('compound').classList.add('hidden');
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
                            Swal.fire({
                                title: 'Detalles del Insumo',
                                html: `<p><strong>Id:</strong> ${data.id}</p>
                                       <p><strong>Descripción:</strong> ${data.descripcion}</p>
                                       <p><strong>Unidad:</strong> ${data.und}</p>
                                       <p><strong>Cantidad:</strong> ${data.cantidad}</p>`,
                                icon: 'info',
                                confirmButtonText: 'Cerrar'
                            });
                        }
                    }
                }
            ],
            rowAdded: (row) => {
                this.calculateRowParcial(row);
                this.updateTotals();
            },
            dataChanged: () => {
                this.updateTotalParcial();
                this.updateTotals();
            }
        });
    }

    processResourceFormula(row) {
        const data = row.getData();

        // Para otras unidades, procesar como fórmula
        try {
            const formula = data.cantidad;
            if (formula && formula.trim()) {
                // Reemplazar operadores y limpiar espacios
                const sanitizedFormula = formula.replace(/[^0-9+\-*/().]/g, '')
                    .replace(/\s+/g, '');

                // Evaluar la fórmula de manera segura
                if (this.isValidFormula(sanitizedFormula)) {
                    const result = Function('"use strict";return (' + sanitizedFormula + ')')();
                    row.update({ cantidad: parseFloat(result.toFixed(4)) });
                    this.calculateRowParcial(row);
                }
            }
        } catch (error) {
            console.error("Error en la fórmula:", error);
            // Mantener el valor anterior o establecer 0
            row.update({ cantidad: 0 });
        }
    }

    isValidFormula(formula) {
        // Validar que la fórmula solo contenga operaciones matemáticas seguras
        const validPattern = /^[0-9+\-*/().]+$/;
        return validPattern.test(formula) && !formula.includes('..') && !formula.includes('//');
    }

    processQuantityFormula(row) {
        const data = row.getData();
        try {
            const formula = data.cantidad.toString();
            if (formula && formula.trim()) {
                // Reemplazar operadores y limpiar espacios
                const sanitizedFormula = formula.replace(/[^0-9+\-*/().]/g, '')
                    .replace(/\s+/g, '');

                // Evaluar la fórmula de manera segura
                if (this.isValidFormula(sanitizedFormula)) {
                    const result = Function('"use strict";return (' + sanitizedFormula + ')')();
                    row.update({
                        cantidad: parseFloat(result.toFixed(2)),
                        parcial: parseFloat(result.toFixed(2)) * (data.precio || 0)
                    });
                }
            }
        } catch (error) {
            console.error("Error en la fórmula de cantidad:", error);
            // Mantener el valor anterior o establecer 0
            row.update({
                cantidad: 0,
                parcial: 0
            });
        }
    }

    calculateRowParcialcantidad(row) {
        const data = row.getData();
        const rendimiento = parseFloat(document.getElementById("rendimiento").value) || 1;

        if (data.und === "hh" || data.und === "hm") {
            const recursos = parseFloat(data.recursos) || 0;
            const cantidad = (recursos * 8) / rendimiento;
            row.update({ cantidad: parseFloat(cantidad.toFixed(4)) });
        }
    }

    calculateRowParcial(row) {
        const data = row.getData();
        const parcial = ((data.cantidad || 0) * (data.precio || 0)).toFixed(4);
        row.update({ parcial: parcial });
        this.updateTotals();
    }

    calculateRowUndMO(row) {
        const moTotal = this.tableMO.getCalcResults().bottom.parcial || 0;
        console.log("Total MO:", moTotal);
        row.update({ precio: moTotal });
    }

    calculateRowMOPorcent(row) {
        const data = row.getData();
        const cantidad = parseFloat(data.cantidad) || 0;
        const moTotal = this.tableMO.getCalcResults().bottom.parcial || 0;
        const parcial = ((moTotal * cantidad) / 100).toFixed(2);
        row.update({ parcial: parcial });
    }

    updateTotalParcial() {
        const moTotal = this.tableMO.getCalcResults().bottom.parcial || 0;
        const mtTotal = this.tableMT.getCalcResults().bottom.parcial || 0;
        const eqTotal = this.tableEQ.getCalcResults().bottom.parcial || 0;

        const totalGeneral = moTotal + mtTotal + eqTotal;

        if (this.callback) {
            this.callback({
                detalles: {
                    manoObra: this.tableMO.getData(),
                    materiales: this.tableMT.getData(),
                    equipos: this.tableEQ.getData()
                },
                id: 1736014370240,
                precio: totalGeneral,
                rendimiento: document.getElementById("rendimiento").value,
            });
        }
    }

    updateTotals() {
        let basePrice = parseFloat(document.getElementById('costostotales').textContent) || 0;

        // Verificar si la función getCalcResults existe antes de llamarla
        const moTotal = (this.tableMO && typeof this.tableMO.getCalcResults === 'function')
            ? this.tableMO.getCalcResults().bottom.parcial || 0
            : 0;

        const mtTotal = (this.tableMT && typeof this.tableMT.getCalcResults === 'function')
            ? this.tableMT.getCalcResults().bottom.parcial || 0
            : 0;

        const eqTotal = (this.tableEQ && typeof this.tableEQ.getCalcResults === 'function')
            ? this.tableEQ.getCalcResults().bottom.parcial || 0
            : 0;

        const totalGeneral = (moTotal + mtTotal + eqTotal).toFixed(2);
        const montocosto = (totalGeneral == 0) ? basePrice : totalGeneral;
        document.getElementById('costostotales').textContent = montocosto;
    }

}

export default TableDetails;
