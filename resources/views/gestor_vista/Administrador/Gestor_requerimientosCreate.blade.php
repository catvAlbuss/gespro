<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Gestion Administrativa') }}
        </h2>
    </x-slot>
    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-gray-900 dark:text-gray-100">
                    <div class="overflow-x-auto">
                        <form method="POST" id="formulario_requerimiento">
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {{-- OBSERVACIONES AL MOMENTO DE REGISTRAR EL DEPOSITO COLOCAR TARJETA Y EVITAR DEMAS DATOS --}}
                                <div>
                                    <div class="mb-4">
                                        <div>
                                            <x-input-label for="numero_orden_requerimiento" :value="__('N°')" />
                                            <x-text-input type="number" name="numero_orden_requerimiento"
                                                id="numero_orden_requerimiento" value="{{ $nuevoNumeroOrden }}"
                                                class="block mt-1 w-full text-center" disabled />
                                        </div>
                                    </div>
                                    <div class="mb-4">
                                        <div>
                                            <x-input-label for="proyecto_designado" :value="__('Proyectos')" />
                                            <x-input-select id="proyecto_designado" class="block mt-1 w-full"
                                                name="proyecto_designado" required>
                                                <option selected="selected">Selecciona el proyecto</option>
                                                @foreach ($proyectos as $proyecto)
                                                    <option value="{{ $proyecto->id_proyectos }}">
                                                        {{ $proyecto->nombre_proyecto }}</option>
                                                @endforeach
                                            </x-input-select>
                                        </div>
                                    </div>
                                    <div class="mb-4">
                                        <div>
                                            <x-input-label for="nombre_requerimiento" :value="__('Nombre Requerimiento')" />
                                            <x-text-input type="text" name="nombre_requerimiento"
                                                id="nombre_requerimiento" class="block mt-1 w-full text-center" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div class="mb-4">
                                        <div>
                                            <x-input-label for="solicitado_requerimiento" :value="__('Nombre solicitante')" />
                                            <x-text-input type="text" name="solicitado_requerimiento"
                                                id="solicitado_requerimiento" class="block mt-1 w-full text-center" />
                                        </div>
                                    </div>
                                    <div class="mb-4">
                                        <div>
                                            <x-input-label for="departamento_requerimiento" :value="__('Departamente')" />
                                            <x-input-select id="departamento_requerimiento" class="block mt-1 w-full"
                                                name="departamento_requerimiento" required>
                                                <option selected="selected">Selecciona el Departamento
                                                </option>
                                                <option value="Area de Estructura">Area de Estructura</option>
                                                <option value="Area Tecnica">Area Tecnica</option>
                                                <option value="Area supervision">Area supervision</option>
                                                <option value="Area campo">Area campo</option>
                                                <option value="Area Administracion">Area Administracion</option>
                                                <option value="Area Logistica">Area Logistica</option>
                                                <option value="Area Arquitectura">Area Arquitectura</option>
                                                <option value="Area Sistemas">Area Sistemas</option>
                                            </x-input-select>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div class="mb-4">
                                        <div>
                                            <x-input-label for="correo_requerimiento" :value="__('Correo del solicitante')" />
                                            <x-text-input type="email" name="correo_requerimiento"
                                                id="correo_requerimiento" class="block mt-1 w-full text-center" />
                                        </div>
                                    </div>
                                    <div class="mb-4">
                                        <div>
                                            <x-input-label for="cargo_requerimiento" :value="__('Cargo')" />
                                            <x-input-select id="cargo_requerimiento" class="block mt-1 w-full"
                                                name="cargo_requerimiento" required>
                                                <option selected="selected" disabled>Selecciona el Cargo</option>
                                                <option value="Jefe del Area de Estructura">Jefe del Area de Estructura
                                                </option>
                                                <option value="Jefe del Area Tecnica">Jefe del Area tecnica</option>
                                                <option value="Jefe de supervision">Jefe de supervision</option>
                                                <option value="Jefe de Supervision">Jefe de campo</option>
                                                <option value="Administracion">Administracion</option>
                                                <option value="Logistica">Logistica</option>
                                                <option value="Jefe de Arquitectura">Jefe de Arquitectura</option>
                                                <option value="Jefe de Sistemas">Jefe de Sistemas</option>
                                            </x-input-select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {{-- MANO DE OBRA --}}
                            <div class="overflow-x-auto">
                                <h3 class="text-center text-2xl text-gray-950 dark:text-white">MANO DE OBRA</h3>
                                <div class="container mx-auto w-full">
                                    <div class="flex flex-wrap">
                                        <div class="w-full md:w-1/3">
                                            <div>
                                                <x-input-label for="solicitado_requerimiento" :value="__('Descripcion')" />
                                                <x-text-input type="text" name="solicitado_requerimiento"
                                                    id="descripcionmo" class="block mt-1 w-full text-center" />
                                            </div>
                                            <div>
                                                <x-input-label for="cantidad_manoobra" :value="__('Cantidad')" />
                                                <x-text-input type="number" name="cantidad_manoobra" id="cantidadmo"
                                                    class="block mt-1 w-full text-center" step="any" />
                                            </div>
                                            <div>
                                                <x-input-label for="precio_uni_manoobra" :value="__('Precio Unitario')" />
                                                <x-text-input type="number" name="precio_uni_manoobra"
                                                    id="precioUnitariomo" class="block mt-1 w-full text-center"
                                                    step="any" />
                                            </div>
                                            <div>
                                                <x-input-label for="total_manoobra" :value="__('Total')" />
                                                <x-text-input type="number" name="total_manoobra" id="totalmo"
                                                    class="block mt-1 w-full text-center" step="any" disabled />
                                            </div>
                                            <div class="flex items-center justify-end mt-4">
                                                <x-primary-button type="button" class="ml-4" id="agregarMano">
                                                    {{ 'Agregar' }}
                                                </x-primary-button>
                                            </div>
                                        </div>
                                        <div class="w-full md:w-2/3 px-4 mt-4 md:mt-5">
                                            <table
                                                class="min-w-full w-full table-auto text-sm text-center rtl:text-right text-gray-500 dark:text-gray-400"
                                                id="sumatotalmo">
                                                <thead
                                                    class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                                    <tr>
                                                        <th scope="col" class="px-6 py-3">#</th>
                                                        <th scope="col" class="px-6 py-3">Descripcion</th>
                                                        <th scope="col" class="px-6 py-3">Cantidad</th>
                                                        <th scope="col" class="px-6 py-3">Precio Unitario</th>
                                                        <th scope="col" class="px-6 py-3">Total</th>
                                                        <th scope="col" class="px-6 py-3">Eliminar</th>
                                                    </tr>
                                                </thead>
                                                <tbody id="manoobra"></tbody>
                                                <tfoot>
                                                    <tr>
                                                        <th colspan="4" class="text-right px-6 py-3">Subtotal Mano
                                                            de Obra:</th>
                                                        <th id="subtotal_mo" class="px-6 py-3">0.00</th>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <br>
                            {{-- MATERIALES --}}
                            <div class="overflow-x-auto">
                                <h3 class="text-center text-2xl text-gray-950 dark:text-white">MATERIALES</h3>
                                <div class="container mx-auto w-full">
                                    <div class="flex flex-wrap">
                                        <div class="w-full md:w-1/3">
                                            <div>
                                                <x-input-label for="descripcion_material_req" :value="__('Descripcion')" />
                                                <x-text-input type="text" name="descripcion_material_req"
                                                    id="descripcionInput" class="block mt-1 w-full text-center" />
                                            </div>
                                            <div>
                                                <x-input-label for="unidad" :value="__('Unidad')" />
                                                <x-text-input type="text" name="unidad" id="unidadInput"
                                                    class="block mt-1 w-full text-center" />
                                            </div>
                                            <div>
                                                <x-input-label for="cantidad_material_req" :value="__('Cantidad')" />
                                                <x-text-input type="text" name="cantidad_material_req"
                                                    id="cantidadInput" class="block mt-1 w-full text-center" />
                                            </div>
                                            <div>
                                                <x-input-label for="precio_unitario_matreq" :value="__('Precio Unitario')" />
                                                <x-text-input type="text" name="precio_unitario_matreq"
                                                    id="precioUnitarioInput" class="block mt-1 w-full text-center" />
                                            </div>
                                            <div>
                                                <x-input-label for="total_material_req" :value="__('Total')" />
                                                <x-text-input type="text" name="total_material_req"
                                                    id="totalInput" class="block mt-1 w-full text-center" />
                                            </div>
                                            <div class="flex items-center justify-end mt-4">
                                                <x-primary-button type="button" class="ml-4" id="agregarMaterial">
                                                    {{ 'Agregar' }}
                                                </x-primary-button>
                                            </div>
                                        </div>
                                        <div class="w-full md:w-2/3 px-4 mt-4 md:mt-5">
                                            <table
                                                class="min-w-full w-full table-auto text-sm text-center rtl:text-right text-gray-500 dark:text-gray-400"
                                                id="sumamaterial">
                                                <thead
                                                    class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                                    <tr>
                                                        <th scope="col" class="px-6 py-3">#</th>
                                                        <th scope="col" class="px-6 py-3">Descripcion</th>
                                                        <th scope="col" class="px-6 py-3">Unidad</th>
                                                        <th scope="col" class="px-6 py-3">Cantidad</th>
                                                        <th scope="col" class="px-6 py-3">Precio Unitario</th>
                                                        <th scope="col" class="px-6 py-3">Total</th>
                                                        <th scope="col" class="px-6 py-3">Eliminar</th>
                                                    </tr>
                                                </thead>
                                                <tbody id="materiales"></tbody>
                                                <tfoot>
                                                    <tr>
                                                        <th colspan="5" class="text-right px-6 py-3">Subtotal
                                                            Materiales:</th>
                                                        <th id="subtotal_mat" class="px-6 py-3">0.00</th>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <br>
                            {{-- TOTAL REQUERIMIENTOS --}}
                            <div class="overflow-x-auto">
                                <div class="flex items-center justify-end mt-4">
                                    <x-input-label for="req_total" :value="__('Total Requerimientos  :')" />
                                    <x-text-input type="text" name="total_requerimientos" id="req_total"
                                        class="block mt-1 w-40 text-center" disabled />
                                </div>
                            </div>
                            <br>
                            {{-- DEPOSITOS --}}
                            <div class="overflow-x-auto">
                                <h3 class="text-center text-2xl text-gray-950 dark:text-white">DEPOSITO</h3>
                                <div class="grid grid-cols-1 md:grid-cols-5 gap-6">
                                    <div>
                                        <div class="mb-4">
                                            <div>
                                                <x-input-label for="banco_req" :value="__('Tipo de Deposito BANCO')" />
                                                <x-input-select id="banco_req" class="block mt-1 w-full"
                                                    name="banco_req" required>
                                                    <option selected disabled>Selecciona el banco</option>
                                                    <option value="DEPOSITO A TARJETA">DEPOSITO A TARJETA</option>
                                                    <option value="BBVA">BBVA</option>
                                                    <option value="BCP">BCP</option>
                                                    <option value="INTERBANK">INTERBANK</option>
                                                    <option value="BANCO DE LA  NACION">Banco de la Nacion</option>
                                                </x-input-select>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div class="mb-4">
                                            <div>
                                                <x-input-label for="nro_banco_req" :value="__('Numero de Cuenta')" />
                                                <x-text-input type="text" name="nro_banco_req" id="nro_banco_req"
                                                    placeholder="100000001" class="block mt-1 w-full text-center" />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div class="mb-4">
                                            <div>
                                                <x-input-label for="cci_req" :value="__('Codigo de cuenta Interbancario')" />
                                                <x-text-input type="text" name="cci_req" id="cci_req"
                                                    placeholder="100000001" class="block mt-1 w-full text-center" />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div class="mb-4">
                                            <div>
                                                <x-input-label for="titular_req" :value="__('Titular de la Cuenta')" />
                                                <x-text-input type="text" name="titular_req" id="titular_req"
                                                    placeholder="example admin"
                                                    class="block mt-1 w-full text-center" />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div class="mb-4">
                                            <div>
                                                <x-input-label for="dni_req" :value="__('DNI')" />
                                                <x-text-input type="number" name="dni_req" id="dni_req"
                                                    placeholder="89281928" class="block mt-1 w-full text-center" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <input type="hidden" id="empresaId" name="empresaId" value="{{ $empresaId }}">
                            <div class="flex items-center justify-end mt-4">
                                <x-primary-button class="ml-4">
                                    {{ 'Guardar Requerimientos' }}
                                </x-primary-button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script>
        $(document).ready(function() {
            var contadorFilasmo = 1;
            var materialesData = [];
            var contadorFilas = 1;
            var filasData = [];

            // Función para calcular total de mano de obra individual
            function calcularTotalmo() {
                var cantidadmo = parseFloat($("#cantidadmo").val()) || 0;
                var precioUnitariomo = parseFloat($("#precioUnitariomo").val()) || 0;
                var totalmo = cantidadmo * precioUnitariomo;
                $("#totalmo").val(totalmo.toFixed(2));
            }

            // Eventos para mano de obra
            $("#cantidadmo, #precioUnitariomo").on("input", calcularTotalmo);

            $("#agregarMano").click(function() {
                var descripcionmo = $("#descripcionmo").val();
                var cantidadmo = parseFloat($("#cantidadmo").val()) || 0;
                var precioUnitariomo = parseFloat($("#precioUnitariomo").val()) || 0;
                var totalmo = cantidadmo * precioUnitariomo;

                if (cantidadmo && descripcionmo && precioUnitariomo) {
                    var nuevaFilamo = $(
                            "<tr class='bg-white border-b dark:bg-gray-800 dark:border-gray-700'>")
                        .attr("id", "filamo" + contadorFilasmo)
                        .appendTo("#manoobra");

                    $("<td class='px-6 py-3'>").text(contadorFilasmo).appendTo(nuevaFilamo);
                    $("<td class='px-6 py-3'>").text(descripcionmo).appendTo(nuevaFilamo);
                    $("<td class='px-6 py-3'>").text(cantidadmo).appendTo(nuevaFilamo);
                    $("<td class='px-6 py-3'>").text(precioUnitariomo).appendTo(nuevaFilamo);
                    $("<td>").text(totalmo.toFixed(2)).addClass("total_mobra px-6 py-3").appendTo(
                        nuevaFilamo);
                    $("<td class='px-6 py-3'>").html(
                        '<button class="text-red-500" onclick="eliminarFila(\'filamo' +
                        contadorFilasmo + '\', \'mo\')">Eliminar</button>'
                    ).appendTo(nuevaFilamo);

                    contadorFilasmo++;
                    actualizarTotalesGenerales();
                    limpiarcell();

                    filasData.push({
                        descripcionmo: descripcionmo,
                        cantidadmo: cantidadmo,
                        precioUnitariomo: precioUnitariomo,
                        totalmo: totalmo.toFixed(2)
                    });
                } else {
                    alert("Por favor, complete todos los campos antes de agregar a la lista.");
                }
            });

            // Función para calcular total de materiales individual
            function calcularTotal() {
                var cantidad = parseFloat($("#cantidadInput").val()) || 0;
                var precioUnitario = parseFloat($("#precioUnitarioInput").val()) || 0;
                var total = cantidad * precioUnitario;
                $("#totalInput").val(total.toFixed(2));
            }

            $("#cantidadInput, #precioUnitarioInput").on("input", calcularTotal);

            $("#agregarMaterial").click(function() {
                var cantidad = parseFloat($("#cantidadInput").val()) || 0;
                var descripcion = $("#descripcionInput").val();
                var unidad = $("#unidadInput").val();
                var precioUnitario = parseFloat($("#precioUnitarioInput").val()) || 0;

                if (cantidad && descripcion && unidad && precioUnitario) {
                    var total = cantidad * precioUnitario;

                    var nuevaFila = $(
                            "<tr class='bg-white border-b dark:bg-gray-800 dark:border-gray-700'>")
                        .attr("id", "filam" + contadorFilas)
                        .appendTo("#materiales");

                    $("<td class='px-6 py-3'>").text(contadorFilas).appendTo(nuevaFila);
                    $("<td class='px-6 py-3'>").text(descripcion).appendTo(nuevaFila);
                    $("<td class='px-6 py-3'>").text(unidad).appendTo(nuevaFila);
                    $("<td class='px-6 py-3'>").text(cantidad).appendTo(nuevaFila);
                    $("<td class='px-6 py-3'>").text(precioUnitario).appendTo(nuevaFila);
                    $("<td>").text(total.toFixed(2)).addClass("total_materiales px-6 py-3").appendTo(
                        nuevaFila);
                    $("<td class='px-6 py-3'>").html(
                        '<button class="text-red-500" onclick="eliminarFila(\'filam' + contadorFilas +
                        '\', \'mat\')">Eliminar</button>'
                    ).appendTo(nuevaFila);

                    contadorFilas++;
                    actualizarTotalesGenerales();
                    limpiarcampomaterial();

                    materialesData.push({
                        cantidadma: cantidad,
                        descripcionma: descripcion,
                        unidadma: unidad,
                        precioUnitarioma: precioUnitario,
                        totalma: total.toFixed(2)
                    });
                } else {
                    alert("Por favor, complete todos los campos antes de agregar a la lista.");
                }
            });

            // Funciones de limpieza
            function limpiarcell() {
                $("#descripcionmo, #cantidadmo, #precioUnitariomo, #totalmo").val("");
            }

            function limpiarcampomaterial() {
                $("#cantidadInput, #descripcionInput, #unidadInput, #precioUnitarioInput, #totalInput").val("");
            }

            // Función mejorada para eliminar filas
            window.eliminarFila = function(filaId, tipo) {
                $("#" + filaId).remove();
                actualizarTotalesGenerales();
            };

            // Función principal para actualizar todos los totales
            function actualizarTotalesGenerales() {
                var totalManoObra = 0;
                var totalMateriales = 0;

                // Suma mano de obra
                $('.total_mobra').each(function() {
                    totalManoObra += parseFloat($(this).text()) || 0;
                });

                // Suma materiales
                $('.total_materiales').each(function() {
                    totalMateriales += parseFloat($(this).text()) || 0;
                });

                // Actualizar subtotales en las tablas
                $('#subtotal_mo').text(totalManoObra.toFixed(2));
                $('#subtotal_mat').text(totalMateriales.toFixed(2));

                // Actualizar total general en el input
                var totalGeneral = totalManoObra + totalMateriales;
                $("#req_total").val(totalGeneral.toFixed(2));
            }

            // Inicializar los totales
            actualizarTotalesGenerales();

            $('#formulario_requerimiento').submit(e => {
                e.preventDefault();

                const numero_orden_requerimiento = $('#numero_orden_requerimiento').val();
                const solicitado_requerimiento = $('#solicitado_requerimiento').val();
                const proyecto_designado = $('#proyecto_designado').val(); // Debería ser un número entero
                const nombre_requerimiento = $('#nombre_requerimiento').val();
                const departamento_requerimiento = $('#departamento_requerimiento').val();
                const correo_requerimiento = $('#correo_requerimiento').val();
                const cargo_requerimiento = $('#cargo_requerimiento').val();
                const total_requerimientos = parseFloat($('#req_total').val());
                const empresaId = $('#empresaId').val();
                const banco_req = $('#banco_req').val();
                const nro_banco_req = ($('#nro_banco_req').val());
                const cci_req = ($('#cci_req').val());
                const titular_req = $('#titular_req').val();
                const dni_req = parseInt($('#dni_req').val(), 10);

                const datosAgrupados = {
                    filasData: filasData,
                    materialesData: materialesData,
                };

                const formData = new FormData($('#formulario_requerimiento')[0]);
                formData.append('numero_orden_requerimiento', numero_orden_requerimiento);
                formData.append('solicitado_requerimiento', solicitado_requerimiento);
                formData.append('proyecto_designado', proyecto_designado);
                formData.append('nombre_requerimiento', nombre_requerimiento);
                formData.append('departamento_requerimiento', departamento_requerimiento);
                formData.append('correo_requerimiento', correo_requerimiento);
                formData.append('cargo_requerimiento', cargo_requerimiento);
                formData.append('total_requerimientos', total_requerimientos);
                formData.append('empresaId', empresaId);
                formData.append('banco_req', banco_req);
                formData.append('nro_banco_req', nro_banco_req);
                formData.append('cci_req', cci_req);
                formData.append('titular_req', titular_req);
                formData.append('dni_req', dni_req);
                formData.append('datosAgrupados', JSON.stringify(datosAgrupados));

                $.ajax({
                    type: 'POST',
                    url: `/requerimiento_register/store`,
                    data: formData,
                    contentType: false,
                    processData: false,
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                    },
                    success: function(response) {
                        console.log(response); // Maneja la respuesta del servidor
                        if (response.success) { // Cambia 'status' por 'success'
                            Swal.fire({
                                icon: 'success',
                                title: '¡Éxito!',
                                text: response.message,
                            }).then(() => {
                                // Usa 'response.empresaId' en lugar de 'data.empresaId'
                                window.location.href = `/gestor-requerimientog/${response.empresaId}`;
                            });
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: response.message,
                            });
                        }
                    },
                });
            });

        })
    </script>
</x-app-layout>
