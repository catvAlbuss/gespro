<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Requerimiento Edit') }}
        </h2>
        <input type="hidden" id="trabajador_id" value="{{ Auth::user()->id }}">
    </x-slot>
    {{-- Modal Mano de Obra --}}
    <div id="updateModal" class="fixed inset-0 flex items-center justify-center z-50 hidden">
        <div class="bg-white p-5 rounded shadow-lg">
            <h2 class="text-lg font-bold">Actualizar Mano de Obra</h2>
            <form id="updateForm" method="POST"
                action="{{ route('gestorrequerimientos_mobra.actualizarmanoObra', '') }}">
                @csrf
                @method('PUT')
                <input type="hidden" name="id_mano_obra" id="modal_id_mano_obra" value="">
                <div>
                    <label for="descripcion_manoobra" class="block">Descripción</label>
                    <input type="text" name="descripcion_manoobra" id="modal_descripcion_manoobra"
                        class="block w-full" required>
                </div>
                <div>
                    <label for="cantidad_manoobra" class="block">Cantidad</label>
                    <input type="number" name="cantidad_manoobra" id="modal_cantidad_manoobra" class="block w-full"
                        required>
                </div>
                <div>
                    <label for="precio_uni_manoobra" class="block">Precio Unitario</label>
                    <input type="number" name="precio_uni_manoobra" id="modal_precio_uni_manoobra" step="any" class="block w-full"
                        required>
                </div>
                <input type="hidden" name="id_requerimientos" id="id_requerimientos" value="{{ $id }}"
                    readonly>

                <div class="mt-4">
                    <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">Actualizar</button>
                    <button type="button" onclick="closeModal()"
                        class="bg-gray-300 text-black px-4 py-2 rounded">Cerrar</button>
                </div>
            </form>
        </div>
    </div>

    {{-- Modal Materiales --}}
    <div id="updateMaterialModal" class="fixed inset-0 flex items-center justify-center z-50 hidden">
        <div class="bg-white p-5 rounded shadow-lg">
            <h2 class="text-lg font-bold">Actualizar Material</h2>
            <form id="updateMaterialForm" method="POST"
                action="{{ route('gestorrequerimientos_material.actualizarmaterial', '') }}">
                @csrf
                @method('PUT')
                <input type="hidden" name="id_materiales_req" id="modal_id_materiales_req" value="">
                <div>
                    <label for="descripcion_material_req" class="block">Descripción</label>
                    <input type="text" name="descripcion_material_req" id="modal_descripcion_material"
                        class="block w-full" required>
                </div>
                <div>
                    <label for="unidad" class="block">Unidad</label>
                    <input type="text" name="unidad" id="modal_unidad" class="block w-full" required>
                </div>
                <div>
                    <label for="cantidad_material_req" class="block">Cantidad</label>
                    <input type="number" name="cantidad_material_req" id="modal_cantidad_material" class="block w-full"
                        required>
                </div>
                <div>
                    <label for="precio_unitario_matreq" class="block">Precio Unitario</label>
                    <input type="number" name="precio_unitario_matreq" id="modal_precio_unitario" class="block w-full"
                        required>
                </div>
                <input type="hidden" name="id_requerimientos" id="id_requerimientos" value="{{ $id }}"
                    readonly>

                <div class="mt-4">
                    <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">Actualizar</button>
                    <button type="button" onclick="closeMaterialModal()"
                        class="bg-gray-300 text-black px-4 py-2 rounded">Cerrar</button>
                </div>
            </form>
        </div>
    </div>

    {{-- Modal Depósitos --}}
    <div id="updateDepositoModal" class="fixed inset-0 flex items-center justify-center z-50 hidden">
        <div class="bg-white p-5 rounded shadow-lg">
            <h2 class="text-lg font-bold">Actualizar Depósito</h2>
            <form id="updateDepositoForm" method="POST"
                action="{{ route('gestorrequerimientos_dep.actualizardeposito', '') }}">
                @csrf
                @method('PUT')
                <input type="hidden" name="id_depositoreq" id="modal_id_depositoreq" value="">
                <div>
                    <label for="banco_req" class="block">Banco</label>
                    <input type="text" name="banco_req" id="modal_banco_req" class="block w-full" required>
                </div>
                <div>
                    <label for="nro_banco_req" class="block">Número de Banco</label>
                    <input type="text" name="nro_banco_req" id="modal_nro_banco_req" class="block w-full"
                        required>
                </div>
                <div>
                    <label for="cci_req" class="block">CCI</label>
                    <input type="text" name="cci_req" id="modal_cci_req" class="block w-full" required>
                </div>
                <div>
                    <label for="titular_req" class="block">Titular</label>
                    <input type="text" name="titular_req" id="modal_titular_req" class="block w-full" required>
                </div>
                <div>
                    <label for="dni_req" class="block">DNI</label>
                    <input type="text" name="dni_req" id="modal_dni_req" class="block w-full" required>
                </div>
                <input type="hidden" name="id_requerimientos" id="id_requerimientos" value="{{ $id }}"
                    readonly>

                <div class="mt-4">
                    <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">Actualizar</button>
                    <button type="button" onclick="closeDepositoModal()"
                        class="bg-gray-300 text-black px-4 py-2 rounded">Cerrar</button>
                </div>
            </form>
        </div>
    </div>


    @php
        $permisos = auth()->user()->roles->first()->permissions;
    @endphp

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-gray-900 dark:text-gray-100">
                    <div class="overflow-x-auto">
                        <h1 class="text-2xl font-bold text-center">Editar, Aprobar y/o Desaprobar Requerimiento</h1>
                        <div class="p-6 rounded-lg shadow-md">
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <div class="mb-4">
                                        <div>
                                            <x-input-label for="numero_orden_requerimiento" :value="__('N°')" />
                                            <x-text-input type="text" name="numero_orden_requerimiento"
                                                value="E000{{ $requerimiento->numero_orden_requerimiento }}"
                                                class="block mt-1 w-full text-center" disabled />
                                        </div>
                                    </div>
                                    <div class="mb-4">
                                        <div>
                                            <x-input-label for="solicitado_requerimiento" :value="__('Nombre solicitante')" />
                                            <x-text-input type="text" name="solicitado_requerimiento"
                                                value="{{ $requerimiento->solicitado_requerimiento }}"
                                                class="block mt-1 w-full text-center" disabled />
                                        </div>
                                    </div>
                                    <div class="mb-4">
                                        <div>
                                            <x-input-label for="departamento_requerimiento" :value="__('Departamente')" />
                                            <x-text-input type="text" name="departamento_requerimiento"
                                                value="{{ $requerimiento->departamento_requerimiento }}"
                                                class="block mt-1 w-full text-center" disabled />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div class="mb-4">
                                        <div>
                                            <x-input-label for="fecha_requerimiento" :value="__('Fecha Solicitado')" />
                                            <x-text-input type="text" name="fecha_requerimiento"
                                                value="{{ $requerimiento->fecha_requerimiento }}"
                                                class="block mt-1 w-full text-center" disabled />
                                        </div>
                                    </div>
                                    <div class="mb-4">
                                        <div>
                                            <x-input-label for="correo_requerimiento" :value="__('Correo del solicitante')" />
                                            <x-text-input type="text" name="correo_requerimiento"
                                                value="{{ $requerimiento->correo_requerimiento }}"
                                                class="block mt-1 w-full text-center" disabled />
                                        </div>
                                    </div>
                                    <div class="col-span-2 mb-4">
                                        <div>
                                            <x-input-label for="nombre_requerimiento" :value="__('Nombre Requerimiento')" />
                                            <x-text-input type="text" name="nombre_requerimiento"
                                                value="{{ $requerimiento->nombre_requerimiento }}"
                                                class="block mt-1 w-full text-center" />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div class="mb-4">
                                        <div>
                                            <x-input-label for="nombre_tarea" :value="__('Nombre Proyecto')" />
                                            <x-text-input type="text" name="nombre_requerimiento"
                                                value="{{ $requerimiento->proyecto->nombre_proyecto }}"
                                                class="block mt-1 w-full text-center" disabled />
                                        </div>
                                    </div>
                                    <div class="mb-4">
                                        <div>
                                            <x-input-label for="cargo_requerimiento" :value="__('Cargo')" />
                                            <x-text-input type="text" name="cargo_requerimiento"
                                                value="{{ $requerimiento->cargo_requerimiento }}"
                                                class="block mt-1 w-full text-center" disabled />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <h3 class="text-gray-950 dark:text-white text-2xl">Mano de Obra</h3>
                            <table
                                class="min-w-full w-full text-sm text-center rtl:text-right text-gray-500 dark:text-gray-400">
                                <thead
                                    class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" class="px-6 py-3">#</th>
                                        <th scope="col" class="px-6 py-3">Descripción</th>
                                        <th scope="col" class="px-6 py-3">Cantidad</th>
                                        <th scope="col" class="px-6 py-3">Precio Unitario</th>
                                        <th scope="col" class="px-6 py-3">Total</th>
                                        @if ($permisos->contains('name', 'Administrativo'))
                                            <th scope="col" class="px-6 py-3">Editar</th>
                                            <th scope="col" class="px-6 py-3">Eliminar</th>
                                        @endif
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach ($requerimiento->manoObra as $obra)
                                        @php
                                            $montoTotal = $obra->cantidad_manoobra * $obra->precio_uni_manoobra;
                                        @endphp
                                        <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                            <td class="px-6 py-4">{{ $obra->id_mano_obra }}</td>
                                            <td class="px-6 py-4">{{ $obra->descripcion_manoobra }}</td>
                                            <td class="px-6 py-4">{{ $obra->cantidad_manoobra }}</td>
                                            <td class="px-6 py-4">S/:{{ $obra->precio_uni_manoobra }}</td>
                                            <td class="px-6 py-4">S/:{{ number_format($montoTotal, 2) }}</td>
                                            @if ($permisos->contains('name', 'Administrativo'))
                                                <td class="px-6 py-4">
                                                    <a href="#" onclick="openModal({{ $obra }})"
                                                        class="text-blue-600">Editar</a>
                                                </td>
                                                <td class="px-6 py-4">
                                                    <form
                                                        action="{{ route('gestorrequerimientos.eliminarmanoObra', $obra->id_mano_obra) }}"
                                                        method="POST" class="inline">
                                                        @csrf
                                                        @method('DELETE')
                                                        <input type="hidden" name="id_requerimientos"
                                                            value="{{ $id }}" readonly>
                                                        <button type="submit" class="text-red-600">Eliminar</button>
                                                    </form>
                                                </td>
                                            @endif
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                            <br>
                            <h3 class="text-gray-950 dark:text-white text-2xl">Materiales</h3>
                            <table
                                class="min-w-full w-full text-sm text-center rtl:text-right text-gray-500 dark:text-gray-400">
                                <thead
                                    class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" class="px-6 py-3">#</th>
                                        <th scope="col" class="px-6 py-3">Descripción</th>
                                        <th scope="col" class="px-6 py-3">Unidad</th>
                                        <th scope="col" class="px-6 py-3">Cantidad</th>
                                        <th scope="col" class="px-6 py-3">Precio Unitario</th>
                                        <th scope="col" class="px-6 py-3">Total</th>
                                        @if ($permisos->contains('name', 'Administrativo'))
                                            <th scope="col" class="px-6 py-3">Editar</th>
                                            <th scope="col" class="px-6 py-3">Eliminar</th>
                                        @endif
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach ($requerimiento->materiales as $material)
                                        @php
                                            $montoTotalmat =
                                                $material->cantidad_material_req * $material->precio_unitario_matreq;
                                        @endphp
                                        <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                            <td class="px-6 py-4">{{ $material->id_materiales_req }}</td>
                                            <td class="px-6 py-4">{{ $material->descripcion_material_req }}</td>
                                            <td class="px-6 py-4">{{ $material->unidad }}</td>
                                            <td class="px-6 py-4">{{ $material->cantidad_material_req }}</td>
                                            <td class="px-6 py-4">S/:{{ $material->precio_unitario_matreq }}</td>
                                            <td class="px-6 py-4">{{ number_format($montoTotalmat, 2) }}</td>
                                            @if ($permisos->contains('name', 'Administrativo'))
                                                <td class="px-6 py-4">
                                                    <a href="#" class="text-blue-600"
                                                        onclick="openMaterialEditModal({{ $material }})">Editar</a>
                                                </td>
                                                <td class="px-6 py-4">
                                                    <form
                                                        action="{{ route('gestorrequerimientos.eliminarmateriales', $material->id_materiales_req) }}"
                                                        method="POST" class="inline">
                                                        @csrf
                                                        @method('DELETE')
                                                        <input type="hidden" name="id_requerimientos"
                                                            value="{{ $id }}" readonly>
                                                        <button type="submit" class="text-red-600">Eliminar</button>
                                                    </form>
                                                </td>
                                            @endif
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>

                            {{-- Monto total requerimientos --}}
                            @php
                                $montoTotalMat = 0;
                                foreach ($requerimiento->materiales as $material) {
                                    $montoTotalMat += $material->cantidad_material_req * $material->precio_unitario_matreq;
                                }
                            
                                $montoTotalObra = 0;
                                foreach ($requerimiento->manoObra as $obra) {
                                    $montoTotalObra += $obra->cantidad_manoobra * $obra->precio_uni_manoobra;
                                }
                            
                                // Asegurarse de que ambas variables sean numéricas, y si no lo son, asignarles 0
                                $montoTotalMat = is_numeric($montoTotalMat) ? $montoTotalMat : 0;
                                $montoTotalObra = is_numeric($montoTotalObra) ? $montoTotalObra : 0;
                            
                                $montoTotal = $montoTotalMat + $montoTotalObra;
                            @endphp

                            <div class="flex items-center justify-end mt-4">
                                <x-input-label for="monto_total_requerimiento" :value="__('Monto Total Requerimientos  :')" />
                                <x-text-input type="text" name="monto_total_requerimiento"
                                    value="{{ number_format($montoTotal, 2) }}" readonly
                                    class="block mt-1 w-32 text-center" disabled />
                            </div>

                            <h3 class="text-gray-950 dark:text-white text-2xl">Usuario Depositado</h3>
                            <table
                                class="min-w-full w-full text-sm text-center rtl:text-right text-gray-500 dark:text-gray-400">
                                <thead
                                    class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" class="px-6 py-3">#</th>
                                        <th scope="col" class="px-6 py-3">Tipo Banco</th>
                                        <th scope="col" class="px-6 py-3">N° Cuenta</th>
                                        <th scope="col" class="px-6 py-3">N° CCI</th>
                                        <th scope="col" class="px-6 py-3">Titular de la cuenta</th>
                                        <th scope="col" class="px-6 py-3">DNI</th>
                                        <th scope="col" class="px-6 py-3">Monto Depositado</th>
                                        @if ($permisos->contains('name', 'Administrativo'))
                                            <th scope="col" class="px-6 py-3">Editar</th>
                                        @endif
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach ($requerimiento->depositos as $deposito)
                                        <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                            <td class="px-6 py-4">{{ $deposito->id_depositoreq }}</td>
                                            <td class="px-6 py-4">{{ $deposito->banco_req }}</td>
                                            <td class="px-6 py-4">{{ $deposito->nro_banco_req }}</td>
                                            <td class="px-6 py-4">{{ $deposito->cci_req }}</td>
                                            <td class="px-6 py-4">{{ $deposito->titular_req }}</td>
                                            <td class="px-6 py-4">{{ $deposito->dni_req }}</td>
                                            <td class="px-6 py-4">S/:{{ number_format($montoTotal, 2) }}</td>
                                            @if ($permisos->contains('name', 'Administrativo'))
                                                <td class="px-6 py-4">
                                                    <a href="#" class="text-blue-600"
                                                        onclick="openDepositoEditModal({{ $deposito }})">Editar</a>
                                                </td>
                                            @endif
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>

                            @if ($permisos->contains('name', 'Administrativo') || $permisos->contains('name', 'Logistico'))
                                <h3 class="text-gray-950 dark:text-white text-2xl text-center mt-7">Aprobar solicitud
                                </h3>
                            @endif
                            
                            <div class="flex items-center justify-center mt-7">

                                <!-- Formulario para Aprobar -->
                                @if ($permisos->contains('name', 'Administrativo') || $permisos->contains('name', 'Logistico'))
                                    <!-- Verifica si el usuario tiene el permiso -->
                                    <form
                                        action="{{ route('requerimientos_aprobar.aprobar', $requerimiento->id_requerimiento) }}"
                                        method="POST" class="inline">
                                        @csrf

                                        <!-- Campo oculto para enviar el rol -->
                                        @php
                                            $rol = auth()->user()->roles->first()->name;
                                        @endphp

                                        <!-- Campo oculto para enviar el rol -->
                                        <input type="hidden" id="rolesAsignado" name="rolesAsignado"
                                            value="{{ $rol }}">

                                        <!-- Campo para la empresa -->
                                        <input type="hidden" name="empresaId"
                                            value="{{ $requerimiento->empresa_designado }}">

                                        <!-- Botón de enviar -->
                                        <x-primary-button type="submit" class="ml-4">
                                            {{ 'Aprobar' }}
                                        </x-primary-button>
                                    </form>
                                @endif
                                
                                @if ( $permisos->contains('name', 'Administrativo') !== 'Logistico' &&  // Verifica que el rol no sea "logistico"
                                    $permisos->contains('name', 'Administrativo') &&
                                    $requerimiento->aprobado_logistica == 1 &&
                                    $requerimiento->aprobado_contabilidad == 0 &&
                                    $requerimiento->aprobado_requerimiento == 0)
                                    <form
                                        action="{{ route('requerimientos_aprobar.aprobar', $requerimiento->id_requerimiento) }}"
                                        method="POST" class="inline">
                                        @csrf
                                
                                        <!-- Campo oculto para enviar el rol -->
                                        @php
                                            $rol = "administradores";
                                        @endphp
                                
                                        <!-- Campo oculto para enviar el rol -->
                                        <input type="hidden" id="rolesAsignado" name="rolesAsignado"
                                            value="{{ $rol }}">
                                
                                        <!-- Campo para la empresa -->
                                        <input type="hidden" name="empresaId" value="{{ $requerimiento->empresa_designado }}">
                                
                                        <!-- Botón de enviar -->
                                        <x-primary-button type="submit" class="ml-4">
                                            {{ 'Aprobar contabilidad' }}
                                        </x-primary-button>
                                    </form>
                                @endif
                                
                                <!-- Formulario para Pendiente -->
                                @if ($permisos->contains('name', 'Administrativo')|| $permisos->contains('name', 'Logistico'))
                                    <!-- Verifica si el usuario tiene el permiso -->
                                    <form
                                        action="{{ route('requerimientos_pendiente.pendiente', $requerimiento->id_requerimiento) }}"
                                        method="POST" class="inline" id="pendienteForm">
                                        @csrf

                                        <!-- Campo oculto para enviar el rol -->
                                        @php
                                            $rol = auth()->user()->roles->first()->name;
                                        @endphp

                                        <!-- Campo oculto para enviar el rol -->
                                        <input type="hidden" id="rolesAsignado" name="rolesAsignado"
                                            value="{{ $rol }}">
                                        <input type="hidden" name="empresaId"
                                            value="{{ $requerimiento->empresa_designado }}">

                                        <!-- Botón de enviar -->
                                        <x-primary-button type="submit" class="ml-4">
                                            {{ 'Pendiente' }}
                                        </x-primary-button>
                                    </form>
                                @endif

                                <!-- Botón Rechazar/Eliminar -->
                                @if ($permisos->contains('name', 'Administrativo')|| $permisos->contains('name', 'Logistico'))
                                    <form
                                        action="{{ route('requerimientos_eliminar.eliminar', $requerimiento->id_requerimiento) }}"
                                        method="POST" class="inline">
                                        @csrf
                                        <input type="hidden" name="empresaId"
                                            value="{{ $requerimiento->empresa_designado }}">
                                        <input type="hidden" name="solicitado_requerimiento"
                                            value="{{ $requerimiento->solicitado_requerimiento }}">
                                        <input type="hidden" name="nombre_requerimiento"
                                            value="{{ $requerimiento->nombre_requerimiento }}">
                                        @method('DELETE') <!-- Usa DELETE para eliminar -->
                                        <x-primary-button type="submit" class="ml-4 bg-red-600 text-white">
                                            {{ 'Rechazar/Eliminar' }}
                                        </x-primary-button>
                                    </form>
                                @endif
                            </div>
                            
                            <div class="flex items-center justify-center mt-7">
                                <!-- Botón sustentar -->
                                @if (
                                        $requerimiento->aprobado_logistica == 1 &&
                                        $requerimiento->aprobado_contabilidad == 1 &&
                                        $requerimiento->aprobado_requerimiento == 1)
                                    <x-primary-button type="button" id="open_sustentoreque"
                                        class="ml-4 bg-red-600 text-white">
                                        {{ 'Sustentar Requerimientos' }}
                                    </x-primary-button>
                                @endif
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{-- Modal Sustentos --}}
    <div id="sustentoRequerimientosModal" class="fixed inset-0 flex items-center justify-center z-50 hidden">
        <div class="bg-white p-5 rounded shadow-lg">
            <h2 class="text-lg font-bold">Sustento Requerimientos</h2>
            <div class="overflow-auto max-h-96 w-full">
                <div class="max-w-screen-xl px-4 py-2 mx-auto lg:px-8 sm:py-2 lg:py-2">
                    <div class="flow-root max-w-3xl mx-auto mt-4 sm:mt-4 lg:mt-4">
                        <div class="divide-y divide-gray-200 dark:divide-gray-700 mx-auto w-full">
                            <!-- Botón Sustentar Formulario -->
                            <form
                                action="{{ route('actualizarSustento.actualizarsustento', $requerimiento->id_requerimiento) }}"
                                method="POST" accept-charset="UTF-8" enctype="multipart/form-data">
                                @csrf
                                @method('POST')
                                <div class="flex items-center justify-end mt-4">
                                    <label class="text-gray-950" for="monto_total_requerimiento">Nombre del
                                        requerimiento</label>
                                    <x-text-input type="text" name="monto_total_requerimiento"
                                        value="{{ $requerimiento->nombre_requerimiento }}" readonly
                                        class="block mt-1 w-full text-center" disabled />
                                </div>
                                <div class="flex items-center justify-end mt-4">
                                    <label class="text-gray-950" for="monto_total_requerimiento">Monto Total
                                        Sstentado</label>
                                    <x-text-input type="text" name="monto_total_requerimiento"
                                        value="{{ number_format($montoTotal, 2) }}" readonly
                                        class="block mt-1 w-full text-center" disabled />
                                </div>
                                <div class="flex items-center justify-end mt-4">
                                    <div>
                                        <label class="text-gray-950" for="sustento_requerimiento">Documento</label>
                                        <x-text-input id="sustento_requerimiento" name="sustento_requerimiento"
                                            type="file" class="block mt-1 w-full text-center"
                                            accept="image/*,.pdf" />
                                    </div>
                                </div>

                                <input type="hidden" name="empresaId"
                                    value="{{ $requerimiento->empresa_designado }}">

                                <div class="flex items-center justify-end mt-4">
                                    <x-primary-button class="ml-4 border-yellow-800">
                                        {{ __('Guardar') }}
                                    </x-primary-button>
                                </div>
                            </form>
                        </div>
                        <div class="divide-y divide-gray-200 dark:divide-gray-700 mx-auto w-full">
                            @if ($requerimiento->sustento_requerimiento)
                                @php
                                    // Obtiene la extensión del archivo
                                    $extension = pathinfo($requerimiento->sustento_requerimiento, PATHINFO_EXTENSION);
                                @endphp

                                @if (in_array(strtolower($extension), ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg']))
                                    <!-- Si es una imagen, mostrarla -->
                                    <div class="mb-4">
                                        <img src="{{ asset('storage/sustento_requerimiento/' . $requerimiento->sustento_requerimiento) }}"
                                            alt="Sustento Requerimiento" class="w-full h-auto">
                                    </div>
                                @elseif(strtolower($extension) == 'pdf')
                                    <!-- Si es un PDF, mostrar un enlace para ver o descargar -->
                                    <div class="mb-4">
                                        <a href="{{ asset('storage/sustento_requerimiento/' . $requerimiento->sustento_requerimiento) }}"
                                            target="_blank" class="text-blue-600 hover:underline">
                                            Ver documento PDF
                                        </a>
                                    </div>
                                @else
                                    <!-- Si el archivo es de otro tipo, mostrar un enlace de descarga -->
                                    <div class="mb-4">
                                        <a href="{{ asset('storage/sustento_requerimiento/' . $requerimiento->sustento_requerimiento) }}"
                                            class="text-blue-600 hover:underline">
                                            Descargar archivo
                                        </a>
                                    </div>
                                @endif
                            @else
                                <p>No hay sustento disponible.</p>
                            @endif
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex items-center justify-end mt-6">
                <button type="button" id="dismiss_sustentoreque"
                    class="text-yellow-800 bg-transparent border border-yellow-800 hover:bg-yellow-900 hover:text-white focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-xs px-4 py-2 text-center dark:hover:bg-yellow-600 dark:border-yellow-600 dark:text-yellow-400 dark:hover:text-white dark:focus:ring-yellow-700"
                    aria-label="Close">
                    Cerrar
                </button>
            </div>
        </div>
    </div>

    <script>
        function openModal(obra) {
            document.getElementById('modal_id_mano_obra').value = obra.id_mano_obra;
            document.getElementById('modal_descripcion_manoobra').value = obra.descripcion_manoobra;
            document.getElementById('modal_cantidad_manoobra').value = obra.cantidad_manoobra;
            document.getElementById('modal_precio_uni_manoobra').value = obra.precio_uni_manoobra;

            document.getElementById('updateModal').classList.remove('hidden');
            document.getElementById('updateForm').action = '/gestorrequerimientos_mobra/' + obra
                .id_mano_obra; // Cambia la URL si es necesario
        }

        function closeModal() {
            document.getElementById('updateModal').classList.add('hidden');
        }

        function openMaterialEditModal(material) {
            document.getElementById('modal_id_materiales_req').value = material.id_materiales_req;
            document.getElementById('modal_descripcion_material').value = material.descripcion_material_req;
            document.getElementById('modal_unidad').value = material.unidad;
            document.getElementById('modal_cantidad_material').value = material.cantidad_material_req;
            document.getElementById('modal_precio_unitario').value = material.precio_unitario_matreq;

            // Mostrar el modal
            document.getElementById('updateMaterialModal').classList.remove('hidden');
            document.getElementById('updateMaterialForm').action = '/gestorrequerimientos_material/' + material
                .id_materiales_req; // Cambia la URL si es necesario
        }

        function closeMaterialModal() {
            document.getElementById('updateMaterialModal').classList.add('hidden');
        }

        function openDepositoEditModal(deposito) {
            document.getElementById('modal_id_depositoreq').value = deposito.id_depositoreq;
            document.getElementById('modal_banco_req').value = deposito.banco_req;
            document.getElementById('modal_nro_banco_req').value = deposito.nro_banco_req;
            document.getElementById('modal_cci_req').value = deposito.cci_req;
            document.getElementById('modal_titular_req').value = deposito.titular_req;
            document.getElementById('modal_dni_req').value = deposito.dni_req;

            // Mostrar el modal
            document.getElementById('updateDepositoModal').classList.remove('hidden');
            document.getElementById('updateDepositoForm').action = '/gestorrequerimientos_dep/' + deposito.id_depositoreq;
        }

        function closeDepositoModal() {
            document.getElementById('updateDepositoModal').classList.add('hidden');
        }

        // Abrir el modal de asistencia al hacer clic en el botón correspondiente
        document.getElementById('open_sustentoreque').onclick = function() {
            document.getElementById('sustentoRequerimientosModal').classList.remove('hidden');
        };

        // Cerrar el modal de asistencia al hacer clic en el botón de Dismiss
        document.getElementById('dismiss_sustentoreque').onclick = function() {
            document.getElementById('sustentoRequerimientosModal').classList.add('hidden');
        };
    </script>

</x-app-layout>
