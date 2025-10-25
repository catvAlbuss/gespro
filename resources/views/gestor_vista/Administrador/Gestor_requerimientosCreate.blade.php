<x-app-layout>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Gestion Administrativa') }}
        </h2>
    </x-slot>
    <div class="py-2">
        <div class="max-w-full mx-auto sm:px-1 lg:px-2">
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-gray-900 dark:text-gray-100">
                    <div class="overflow-x-auto">
                        <form id="formulario_requerimiento" class="space-y-4">
                            <!-- Información General -->
                            <div
                                class="bg-white text-gray-950 dark:bg-gray-950 dark:text-gray-50 rounded-2xl shadow-lg p-4 border-l-4 border-primary">
                                <h2 class="text-2xl font-bold mb-6 flex items-center">
                                    <i class="fas fa-info-circle text-primary mr-3"></i>
                                    Información General
                                </h2>

                                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div class="space-y-2">
                                        <label class="flex items-center text-sm font-semibold ">
                                            <i class="fas fa-hashtag  mr-2"></i>
                                            Número de Orden
                                        </label>
                                        <input type="number" id="numero_orden_requerimiento"
                                            class="w-full p-3 text-gray-950 dark:text-gray-950 border border-gray-300 rounded-lg text-center font-bold text-lg"
                                            value="{{ $nuevoNumeroOrden }}" disabled>
                                    </div>

                                    <div class="space-y-2">
                                        <label class="flex items-center text-sm font-semibold ">
                                            <i class="fas fa-project-diagram  mr-2"></i>
                                            Proyecto *
                                        </label>
                                        <select id="proyecto_designado" name="proyecto_designado"
                                            class="w-full p-3 text-gray-950 dark:text-gray-950 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all">
                                            <option value="">Selecciona un proyecto</option>
                                            @foreach ($proyectos as $proyecto)
                                                <option value="{{ $proyecto->id_proyectos }}">
                                                    {{ $proyecto->nombre_proyecto }}</option>
                                            @endforeach
                                        </select>
                                    </div>

                                    <div class="space-y-2">
                                        <label class="flex items-center text-sm font-semibold ">
                                            <i class="fas fa-file-alt  mr-2"></i>
                                            Nombre del Requerimiento *
                                        </label>
                                        <input type="text" name="nombre_requerimiento" id="nombre_requerimiento"
                                            placeholder="Ej: Materiales para construcción"
                                            class="w-full p-3 text-gray-950 dark:text-gray-950 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all">
                                    </div>

                                    <div class="space-y-2">
                                        <label class="flex items-center text-sm font-semibold ">
                                            <i class="fas fa-user  mr-2"></i>
                                            Nombre del Solicitante *
                                        </label>
                                        <input type="text"name="solicitado_requerimiento"
                                            id="solicitado_requerimiento" placeholder="Tu nombre completo"
                                            class="w-full p-3 text-gray-950 dark:text-gray-950 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all">
                                    </div>
                                    <div class="space-y-2">
                                        <label class="flex items-center text-sm font-semibold ">
                                            <i class="fas fa-envelope  mr-2"></i>
                                            Correo Electrónico *
                                        </label>
                                        <input type="email" name="correo_requerimiento" id="correo_requerimiento"
                                            placeholder="tu.email@empresa.com"
                                            class="w-full p-3 text-gray-950 dark:text-gray-950 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all">
                                    </div>

                                    <div class="grid grid-cols-2 gap-2">
                                        <div class="space-y-2">
                                            <label class="flex items-center text-sm font-semibold ">
                                                <i class="fas fa-building  mr-2"></i>
                                                Departamento *
                                            </label>
                                            <select id="departamento_requerimiento" name="departamento_requerimiento"
                                                class="w-full p-3 text-gray-950 dark:text-gray-950 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all">
                                                <option value="">Selecciona tu departamento</option>
                                                <option value="Area de Estructura">Área de Estructura</option>
                                                <option value="Area Tecnica">Área Técnica</option>
                                                <option value="Area supervision">Área Supervisión</option>
                                                <option value="Area campo">Área Campo</option>
                                                <option value="Area Administracion">Área Administración</option>
                                                <option value="Area Logistica">Área Logística</option>
                                                <option value="Area Arquitectura">Área Arquitectura</option>
                                                <option value="Area Sistemas">Área Sistemas</option>
                                            </select>
                                        </div>

                                        <div class="space-y-2">
                                            <label class="flex items-center text-sm font-semibold ">
                                                <i class="fas fa-building  mr-2"></i>
                                                Cargo *
                                            </label>
                                            <select id="cargo_requerimiento" name="cargo_requerimiento"
                                                class="w-full p-3 text-gray-950 dark:text-gray-950 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all">
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
                                            </select>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <!-- Mano de Obra -->
                            <div
                                class="bg-white text-gray-950 dark:bg-gray-950 dark:text-gray-50 rounded-2xl shadow-lg p-4 border-l-4 border-green-500">
                                <h2 class="text-2xl font-bold mb-6 flex items-center">
                                    <i class="fas fa-hard-hat text-green-500 mr-3"></i>
                                    Mano de Obra
                                </h2>

                                <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                    <!-- Formulario de entrada -->
                                    <div class="bg-gray-50 dark:bg-gray-950 rounded-xl p-6 space-y-4">
                                        <h3 class="text-lg font-semibold  mb-4">Agregar Personal</h3>

                                        <div class="space-y-2">
                                            <label class="text-sm font-medium ">Descripción del
                                                Trabajo</label>
                                            <input type="text" id="descripcionmo" name="solicitado_requerimiento"
                                                placeholder="Ej: Albañil especializado"
                                                class="w-full p-3 text-gray-950 dark:text-gray-950 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent">
                                        </div>

                                        <div class="grid grid-cols-2 gap-4">
                                            <div class="space-y-2">
                                                <label class="text-sm font-medium ">Cantidad</label>
                                                <input type="number" id="cantidadmo" name="cantidad_manoobra"
                                                    placeholder="1"
                                                    class="w-full p-3 text-gray-950 dark:text-gray-950 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent">
                                            </div>

                                            <div class="space-y-2">
                                                <label class="text-sm font-medium ">Precio por día
                                                    (S/)</label>
                                                <input type="number" id="precioUnitariomo"
                                                    name="precio_uni_manoobra" step="0.01" placeholder="100.00"
                                                    class="w-full p-3 text-gray-950 dark:text-gray-950 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent">
                                            </div>
                                        </div>

                                        <div class="space-y-2">
                                            <label class="text-sm font-medium ">Total (S/)</label>
                                            <input type="number" id="totalmo" name="total_manoobra"
                                                step="0.01"
                                                class="w-full p-3 text-gray-950 dark:text-gray-950 border border-gray-300 rounded-lg  text-lg font-bold"
                                                disabled>
                                        </div>

                                        <button type="button" id="agregarMano"
                                            class="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center">
                                            <i class="fas fa-plus mr-2"></i>
                                            Agregar Mano de Obra
                                        </button>
                                    </div>

                                    <!-- Tabla de resultados -->
                                    <div class="col-span-2 bg-gray-50 dark:bg-gray-950 rounded-xl p-6">
                                        <h3 class="text-lg font-semibold  mb-4">Personal Solicitado</h3>
                                        <div class="overflow-hidden border border-gray-200 rounded-lg">
                                            <table class="w-full text-sm" id="sumatotalmo">
                                                <thead class="bg-green-500 text-white">
                                                    <tr>
                                                        <th class="px-4 py-3 text-left">#</th>
                                                        <th class="px-4 py-3 text-left">Descripción</th>
                                                        <th class="px-4 py-3 text-center">Cant.</th>
                                                        <th class="px-4 py-3 text-center">Precio</th>
                                                        <th class="px-4 py-3 text-center">Total</th>
                                                        <th class="px-4 py-3 text-center">Acción</th>
                                                    </tr>
                                                </thead>
                                                <tbody id="manoobra"
                                                    class="bg-white dark:bg-gray-950 divide-y divide-gray-200"></tbody>
                                                <tfoot class="">
                                                    <tr>
                                                        <td colspan="4" class="px-4 py-3 text-right font-semibold">
                                                            Subtotal Mano de Obra:</td>
                                                        <td id="subtotal_mo"
                                                            class="px-4 py-3 text-center font-bold text-green-600">S/
                                                            0.00</td>
                                                        <td></td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Materiales -->
                            <div
                                class="bg-white text-gray-950 dark:bg-gray-950 dark:text-gray-50 rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
                                <h2 class="text-2xl font-bold mb-6 flex items-center">
                                    <i class="fas fa-boxes text-purple-500 mr-3"></i>
                                    Materiales
                                </h2>

                                <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                    <!-- Formulario de entrada -->
                                    <div class="bg-gray-50 dark:bg-gray-950 rounded-xl p-6 space-y-4">
                                        <h3 class="text-lg font-semibold  mb-4">Agregar Material</h3>

                                        <div class="space-y-2">
                                            <label class="text-sm font-medium ">Descripción del
                                                Material</label>
                                            <input type="text" id="descripcionInput"
                                                name="descripcion_material_req"
                                                placeholder="Ej: Cemento Portland Tipo I"
                                                class="w-full p-3 text-gray-950 dark:text-gray-950 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent">
                                        </div>

                                        <div class="grid grid-cols-2 gap-4">
                                            <div class="space-y-2">
                                                <label class="text-sm font-medium ">Unidad</label>
                                                <input type="text" id="unidadInput" name="unidad"
                                                    placeholder="Ej: Bolsa, m², kg"
                                                    class="w-full p-3 text-gray-950 dark:text-gray-950 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent">
                                            </div>

                                            <div class="space-y-2">
                                                <label class="text-sm font-medium ">Cantidad</label>
                                                <input type="number" id="cantidadInput" name="cantidad_material_req"
                                                    step="0.01" placeholder="1"
                                                    class="w-full p-3 text-gray-950 dark:text-gray-950 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent">
                                            </div>
                                        </div>

                                        <div class="space-y-2">
                                            <label class="text-sm font-medium ">Precio Unitario
                                                (S/)</label>
                                            <input type="number" id="precioUnitarioInput"
                                                name="precio_unitario_matreq" step="0.01" placeholder="25.00"
                                                class="w-full p-3 text-gray-950 dark:text-gray-950 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent">
                                        </div>

                                        <div class="space-y-2">
                                            <label class="text-sm font-medium">Total (S/)</label>
                                            <input type="number" id="totalInput" name="total_material_req"
                                                step="0.01"
                                                class="w-full p-3 text-gray-950 dark:text-gray-950 border border-gray-300 rounded-lg  text-lg font-bold"
                                                disabled>
                                        </div>

                                        <button type="button" id="agregarMaterial"
                                            class="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center">
                                            <i class="fas fa-plus mr-2"></i>
                                            Agregar Material
                                        </button>
                                    </div>

                                    <!-- Tabla de resultados -->
                                    <div class="col-span-2 bg-gray-50 dark:bg-gray-950 rounded-xl p-6">
                                        <h3 class="text-lg font-semibold  mb-4">Materiales Solicitados
                                        </h3>
                                        <div class="overflow-hidden border border-gray-200 rounded-lg">
                                            <table class="w-full text-sm" id="sumamaterial">
                                                <thead class="bg-purple-500 text-white">
                                                    <tr>
                                                        <th class="px-4 py-3 text-left">#</th>
                                                        <th class="px-4 py-3 text-left">Descripción</th>
                                                        <th class="px-4 py-3 text-center">Unidad</th>
                                                        <th class="px-4 py-3 text-center">Cant.</th>
                                                        <th class="px-4 py-3 text-center">Precio</th>
                                                        <th class="px-4 py-3 text-center">Total</th>
                                                        <th class="px-4 py-3 text-center">Acción</th>
                                                    </tr>
                                                </thead>
                                                <tbody id="materiales" class="bg-white divide-y divide-gray-200">
                                                </tbody>
                                                <tfoot class="">
                                                    <tr>
                                                        <td colspan="5" class="px-4 py-3 text-right font-semibold">
                                                            Subtotal Materiales:</td>
                                                        <td id="subtotal_mat"
                                                            class="px-4 py-3 text-center font-bold text-purple-600">S/
                                                            0.00</td>
                                                        <td></td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Resumen Total -->
                            <div
                                class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
                                <div class="text-center flex flex-col">
                                    <h2 class="text-1xl font-bold mb-4">
                                        <i class="fas fa-calculator mr-3"></i>
                                        Total del Requerimiento
                                    </h2>
                                    <div class="text-5xl font-bold" name="total_requerimientos" id="req_total">S/
                                        0.00</div>
                                    <p class="mt-2 opacity-90">Monto total de la solicitud</p>
                                </div>
                            </div>

                            <!-- Información Bancaria -->
                            <div
                                class="bg-white dark:bg-gray-950 rounded-2xl shadow-lg p-6 border-l-4 border-yellow-500">
                                <h2 class="text-2xl font-bold mb-6 flex items-center">
                                    <i class="fas fa-university text-yellow-500 mr-3"></i>
                                    Información para Depósito
                                </h2>

                                <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                    <div class="space-y-2">
                                        <label class="flex items-center text-sm font-semibold ">
                                            <i class="fas fa-university  mr-2"></i>
                                            Tipo de Depósito
                                        </label>
                                        <select id="banco_req" name="banco_req"
                                            class="w-full p-3 text-gray-950 dark:text-gray-950 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all">
                                            <option value="">Selecciona el banco</option>
                                            <option value="DEPOSITO A TARJETA">DEPÓSITO A TARJETA</option>
                                            <option value="BBVA">BBVA</option>
                                            <option value="BCP">BCP</option>
                                            <option value="INTERBANK">INTERBANK</option>
                                            <option value="BANCO DE LA NACION">Banco de la Nación</option>
                                        </select>
                                    </div>

                                    <div class="space-y-2">
                                        <label class="flex items-center text-sm font-semibold ">
                                            <i class="fas fa-credit-card  mr-2"></i>
                                            Número de Cuenta
                                        </label>
                                        <input type="text" name="nro_banco_req" id="nro_banco_req"
                                            placeholder="100000001"
                                            class="w-full p-3 text-gray-950 dark:text-gray-950 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all">
                                    </div>

                                    <div class="space-y-2">
                                        <label class="flex items-center text-sm font-semibold ">
                                            <i class="fas fa-code  mr-2"></i>
                                            CCI
                                        </label>
                                        <input type="text" name="cci_req" id="cci_req"
                                            placeholder="Código interbancario"
                                            class="w-full p-3 text-gray-950 dark:text-gray-950 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all">
                                    </div>

                                    <div class="space-y-2">
                                        <label class="flex items-center text-sm font-semibold ">
                                            <i class="fas fa-user-tie  mr-2"></i>
                                            Titular de la Cuenta
                                        </label>
                                        <input type="text" name="titular_req" id="titular_req"
                                            placeholder="Nombre del titular"
                                            class="w-full p-3 text-gray-950 dark:text-gray-950 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all">
                                    </div>

                                    <div class="space-y-2">
                                        <label class="flex items-center text-sm font-semibold ">
                                            <i class="fas fa-id-card  mr-2"></i>
                                            DNI
                                        </label>
                                        <input type="text" name="dni_req" id="dni_req" placeholder="12345678"
                                            class="w-full p-3 text-gray-950 dark:text-gray-950 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all">
                                    </div>
                                    <input type="hidden" id="empresaId" name="empresaId"
                                        value="{{ $empresaId }}">
                                </div>
                            </div>

                            <!-- Botones de Acción -->
                            <div class="flex flex-col sm:flex-row gap-4 justify-center">
                                <button type="button"
                                    class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-4 px-8 rounded-lg transition-all flex items-center justify-center">
                                    <i class="fas fa-times mr-2"></i>
                                    Cancelar
                                </button>
                                <button type="submit"
                                    class="bg-green-700 hover:bg-green-400 hover:text-gray-950 text-white font-bold py-4 px-8 rounded-lg transition-all transform">
                                    <i class="fas fa-save mr-2"></i>
                                    Guardar Requerimiento
                                </button>
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
            let contadorFilasmo = 1;
            let contadorFilas = 1;
            let subtotalManoObra = 0;
            let subtotalMateriales = 0;
            let totalGeneral = 0;

            // CÁLCULOS AUTOMÁTICOS - MANO DE OBRA
            function calcularTotalManoObra() {
                const cantidad = parseFloat($("#cantidadmo").val()) || 0;
                const precio = parseFloat($("#precioUnitariomo").val()) || 0;
                const total = cantidad * precio;
                $("#totalmo").val(total.toFixed(2));
            }

            $("#cantidadmo, #precioUnitariomo").on("input", calcularTotalManoObra);

            // CÁLCULOS AUTOMÁTICOS - MATERIALES
            function calcularTotalMaterial() {
                const cantidad = parseFloat($("#cantidadInput").val()) || 0;
                const precio = parseFloat($("#precioUnitarioInput").val()) || 0;
                const total = cantidad * precio;
                $("#totalInput").val(total.toFixed(2));
            }

            $("#cantidadInput, #precioUnitarioInput").on("input", calcularTotalMaterial);

            // FUNCIÓN PARA OBTENER DATOS ACTUALES DE MANO DE OBRA
            function obtenerDatosManoObra() {
                const datosManoObra = [];
                $("#manoobra tr[id^='filamo']").each(function() {
                    const fila = $(this);
                    const descripcion = fila.find("td:eq(1)").text().trim();
                    const cantidad = parseFloat(fila.find("td:eq(2)").text()) || 0;
                    const precio = parseFloat(fila.find("td:eq(3)").text().replace('S/ ', '')) || 0;
                    const total = parseFloat(fila.find("td:eq(4)").text().replace('S/ ', '')) || 0;

                    datosManoObra.push({
                        descripcionmo: descripcion,
                        cantidadmo: cantidad,
                        precioUnitariomo: precio,
                        totalmo: total
                    });
                });
                return datosManoObra;
            }

            // FUNCIÓN PARA OBTENER DATOS ACTUALES DE MATERIALES
            function obtenerDatosMateriales() {
                const datosMateriales = [];
                $("#materiales tr[id^='filam']").each(function() {
                    const fila = $(this);
                    const descripcion = fila.find("td:eq(1)").text().trim();
                    const unidad = fila.find("td:eq(2)").text().trim();
                    const cantidad = parseFloat(fila.find("td:eq(3)").text()) || 0;
                    const precio = parseFloat(fila.find("td:eq(4)").text().replace('S/ ', '')) || 0;
                    const total = parseFloat(fila.find("td:eq(5)").text().replace('S/ ', '')) || 0;

                    datosMateriales.push({
                        descripcionma: descripcion,
                        unidadma: unidad,
                        cantidadma: cantidad,
                        precioUnitarioma: precio,
                        totalma: total
                    });
                });
                return datosMateriales;
            }

            // AGREGAR MANO DE OBRA
            $("#agregarMano").click(function() {
                const descripcion = $("#descripcionmo").val().trim();
                const cantidad = parseFloat($("#cantidadmo").val()) || 0;
                const precio = parseFloat($("#precioUnitariomo").val()) || 0;
                const total = cantidad * precio;

                if (!descripcion || cantidad <= 0 || precio <= 0) {
                    alert("Complete todos los campos con valores válidos");
                    return;
                }

                const nuevaFila = `
                    <tr id="filamo${contadorFilasmo}" class="bg-white dark:bg-gray-950 border-b border-gray-200">
                        <td class="px-4 py-3">${contadorFilasmo}</td>
                        <td class="px-4 py-3">${descripcion}</td>
                        <td class="px-4 py-3 text-center">${cantidad}</td>
                        <td class="px-4 py-3 text-center">S/ ${precio.toFixed(2)}</td>
                        <td class="px-4 py-3 text-center total_mobra">S/ ${total.toFixed(2)}</td>
                        <td class="px-4 py-3 text-center">
                            <button type="button" onclick="eliminarFilaMO(${contadorFilasmo})" 
                                    class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;

                $("#manoobra").append(nuevaFila);
                contadorFilasmo++;
                limpiarCamposManoObra();
                actualizarTotales();
            });

            // AGREGAR MATERIALES
            $("#agregarMaterial").click(function() {
                const descripcion = $("#descripcionInput").val().trim();
                const unidad = $("#unidadInput").val().trim();
                const cantidad = parseFloat($("#cantidadInput").val()) || 0;
                const precio = parseFloat($("#precioUnitarioInput").val()) || 0;
                const total = cantidad * precio;

                if (!descripcion || !unidad || cantidad <= 0 || precio <= 0) {
                    alert("Complete todos los campos con valores válidos");
                    return;
                }

                const nuevaFila = `
                    <tr id="filam${contadorFilas}" class="bg-white dark:bg-gray-950 border-b border-gray-200">
                        <td class="px-4 py-3">${contadorFilas}</td>
                        <td class="px-4 py-3">${descripcion}</td>
                        <td class="px-4 py-3 text-center">${unidad}</td>
                        <td class="px-4 py-3 text-center">${cantidad}</td>
                        <td class="px-4 py-3 text-center">S/ ${precio.toFixed(2)}</td>
                        <td class="px-4 py-3 text-center total_materiales">S/ ${total.toFixed(2)}</td>
                        <td class="px-4 py-3 text-center">
                            <button type="button" onclick="eliminarFilaMaterial(${contadorFilas})" 
                                    class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;

                $("#materiales").append(nuevaFila);
                contadorFilas++;
                limpiarCamposMateriales();
                actualizarTotales();
            });

            // FUNCIONES DE ELIMINACIÓN MEJORADAS
            window.eliminarFilaMO = function(id) {
                // Verificar si la fila existe antes de eliminar
                if ($(`#filamo${id}`).length > 0) {
                    $(`#filamo${id}`).remove();
                    actualizarTotales();
                }
            };

            window.eliminarFilaMaterial = function(id) {
                // Verificar si la fila existe antes de eliminar
                if ($(`#filam${id}`).length > 0) {
                    $(`#filam${id}`).remove();
                    actualizarTotales();
                }
            };

            // ACTUALIZAR TODOS LOS TOTALES
            function actualizarTotales() {
                // Calcular subtotal mano de obra
                subtotalManoObra = 0;
                $(".total_mobra").each(function() {
                    const valor = parseFloat($(this).text().replace('S/ ', '')) || 0;
                    subtotalManoObra += valor;
                });

                // Calcular subtotal materiales
                subtotalMateriales = 0;
                $(".total_materiales").each(function() {
                    const valor = parseFloat($(this).text().replace('S/ ', '')) || 0;
                    subtotalMateriales += valor;
                });

                // Actualizar subtotales en pantalla
                $("#subtotal_mo").text(`S/ ${subtotalManoObra.toFixed(2)}`);
                $("#subtotal_mat").text(`S/ ${subtotalMateriales.toFixed(2)}`);

                // Calcular y mostrar total general
                totalGeneral = subtotalManoObra + subtotalMateriales;
                $("#req_total").text(`S/ ${totalGeneral.toFixed(2)}`);

                // También actualizar input hidden si existe
                $("input[name='total_requerimientos']").val(totalGeneral.toFixed(2));
            }

            // FUNCIONES DE LIMPIEZA
            function limpiarCamposManoObra() {
                $("#descripcionmo, #cantidadmo, #precioUnitariomo, #totalmo").val("");
            }

            function limpiarCamposMateriales() {
                $("#descripcionInput, #unidadInput, #cantidadInput, #precioUnitarioInput, #totalInput").val("");
            }

            // VALIDACIÓN ANTES DEL ENVÍO
            function validarDatos() {
                const manoObraActual = obtenerDatosManoObra();
                const materialesActuales = obtenerDatosMateriales();

                if (manoObraActual.length === 0 && materialesActuales.length === 0) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Advertencia',
                        text: 'Debe agregar al menos un ítem de mano de obra o material.',
                    });
                    return false;
                }

                return true;
            }

            // INICIALIZAR TOTALES AL CARGAR
            actualizarTotales();

            // ENVÍO DEL FORMULARIO MEJORADO
            $('#formulario_requerimiento').submit(function(e) {
                e.preventDefault();

                // Validar antes del envío
                if (!validarDatos()) {
                    return;
                }

                // Obtener datos actuales (solo los visibles en pantalla)
                const filasDataActuales = obtenerDatosManoObra();
                const materialesDataActuales = obtenerDatosMateriales();

                // Datos del formulario
                const numero_orden_requerimiento = $('#numero_orden_requerimiento').val();
                const solicitado_requerimiento = $('#solicitado_requerimiento').val();
                const proyecto_designado = $('#proyecto_designado').val();
                const nombre_requerimiento = $('#nombre_requerimiento').val();
                const departamento_requerimiento = $('#departamento_requerimiento').val();
                const correo_requerimiento = $('#correo_requerimiento').val();
                const cargo_requerimiento = $('#cargo_requerimiento').val();
                const total_requerimientos = parseFloat(totalGeneral);
                const empresaId = $('#empresaId').val();
                const banco_req = $('#banco_req').val();
                const nro_banco_req = $('#nro_banco_req').val();
                const cci_req = $('#cci_req').val();
                const titular_req = $('#titular_req').val();
                const dni_req = parseInt($('#dni_req').val(), 10);

                // Datos agrupados CON LA INFORMACIÓN ACTUAL
                const datosAgrupados = {
                    filasData: filasDataActuales,
                    materialesData: materialesDataActuales,
                    totales: {
                        subtotalManoObra: subtotalManoObra,
                        subtotalMateriales: subtotalMateriales,
                        totalGeneral: totalGeneral,
                        cantidadManoObra: filasDataActuales.length,
                        cantidadMateriales: materialesDataActuales.length
                    }
                };

                console.log('Datos que se enviarán:', datosAgrupados);

                // Crear FormData
                const formData = new FormData(this);
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

                // Mostrar loading
                Swal.fire({
                    title: 'Procesando...',
                    text: 'Enviando requerimiento',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                // Enviar datos
                $.ajax({
                    type: 'POST',
                    url: `/logistica/requerimientos`,
                    data: formData,
                    contentType: false,
                    processData: false,
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                    },
                    success: function(response) {
                        console.log('Respuesta del servidor:', response);
                        Swal.close();

                        if (response.success) {
                            Swal.fire({
                                icon: 'success',
                                title: '¡Éxito!',
                                text: response.message,
                                timer: 2000,
                                timerProgressBar: true
                            }).then(() => {
                                window.location.href = `/logistica/requerimientos/gestor/${response.empresaId}`;
                            });
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: response.message ||
                                    'Ocurrió un error al procesar el requerimiento',
                            });
                        }
                    },
                    error: function(xhr, status, error) {
                        console.error('Error en la petición:', error);
                        Swal.close();
                        Swal.fire({
                            icon: 'error',
                            title: 'Error de conexión',
                            text: 'No se pudo conectar con el servidor. Intente nuevamente.',
                        });
                    }
                });
            });
        });
    </script>
</x-app-layout>
