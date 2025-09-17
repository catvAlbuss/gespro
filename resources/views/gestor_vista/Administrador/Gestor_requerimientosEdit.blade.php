<x-app-layout>
    <x-slot name="header">
        <div class="flex items-center justify-between">
            <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                {{ __('Editar Requerimiento') }}
            </h2>
            <div class="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                E000{{ $requerimiento->numero_orden_requerimiento }}
            </div>
        </div>
        <input type="hidden" id="trabajador_id" value="{{ Auth::user()->id }}">
    </x-slot>

    {{-- Modal Mano de Obra --}}
    <div id="updateModal" class="fixed inset-0 flex items-center justify-center z-50 hidden bg-black bg-opacity-50">
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-bold text-gray-900 dark:text-white">Actualizar Mano de Obra</h2>
                <button type="button" onclick="closeModal()" class="text-gray-400 hover:text-gray-600">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            <form id="updateForm" method="POST" action="{{ route('gestorrequerimientos_mobra.actualizarmanoObra', '') }}">
                @csrf
                @method('PUT')
                <input type="hidden" name="id_mano_obra" id="modal_id_mano_obra" value="">
                <div class="space-y-4">
                    <div>
                        <label for="descripcion_manoobra" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
                        <input type="text" name="descripcion_manoobra" id="modal_descripcion_manoobra" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required>
                    </div>
                    <div>
                        <label for="cantidad_manoobra" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Cantidad</label>
                        <input type="number" name="cantidad_manoobra" id="modal_cantidad_manoobra" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required>
                    </div>
                    <div>
                        <label for="precio_uni_manoobra" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Precio Unitario</label>
                        <input type="number" name="precio_uni_manoobra" id="modal_precio_uni_manoobra" step="any" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required>
                    </div>
                </div>
                <input type="hidden" name="id_requerimientos" value="{{ $id }}">
                
                <div class="flex justify-end space-x-3 mt-6">
                    <button type="button" onclick="closeModal()" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                        Cancelar
                    </button>
                    <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                        Actualizar
                    </button>
                </div>
            </form>
        </div>
    </div>

    {{-- Modal Materiales --}}
    <div id="updateMaterialModal" class="fixed inset-0 flex items-center justify-center z-50 hidden bg-black bg-opacity-50">
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-bold text-gray-900 dark:text-white">Actualizar Material</h2>
                <button type="button" onclick="closeMaterialModal()" class="text-gray-400 hover:text-gray-600">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            <form id="updateMaterialForm" method="POST" action="{{ route('gestorrequerimientos_material.actualizarmaterial', '') }}">
                @csrf
                @method('PUT')
                <input type="hidden" name="id_materiales_req" id="modal_id_materiales_req" value="">
                <div class="space-y-4">
                    <div>
                        <label for="descripcion_material_req" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
                        <input type="text" name="descripcion_material_req" id="modal_descripcion_material" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required>
                    </div>
                    <div>
                        <label for="unidad" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Unidad</label>
                        <input type="text" name="unidad" id="modal_unidad" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required>
                    </div>
                    <div>
                        <label for="cantidad_material_req" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Cantidad</label>
                        <input type="number" name="cantidad_material_req" id="modal_cantidad_material" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required>
                    </div>
                    <div>
                        <label for="precio_unitario_matreq" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Precio Unitario</label>
                        <input type="number" name="precio_unitario_matreq" id="modal_precio_unitario" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required>
                    </div>
                </div>
                <input type="hidden" name="id_requerimientos" value="{{ $id }}">

                <div class="flex justify-end space-x-3 mt-6">
                    <button type="button" onclick="closeMaterialModal()" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                        Cancelar
                    </button>
                    <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                        Actualizar
                    </button>
                </div>
            </form>
        </div>
    </div>

    {{-- Modal Depósitos --}}
    <div id="updateDepositoModal" class="fixed inset-0 flex items-center justify-center z-50 hidden bg-black bg-opacity-50">
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-bold text-gray-900 dark:text-white">Actualizar Depósito</h2>
                <button type="button" onclick="closeDepositoModal()" class="text-gray-400 hover:text-gray-600">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            <form id="updateDepositoForm" method="POST" action="{{ route('gestorrequerimientos_dep.actualizardeposito', '') }}">
                @csrf
                @method('PUT')
                <input type="hidden" name="id_depositoreq" id="modal_id_depositoreq" value="">
                <div class="space-y-4">
                    <div>
                        <label for="banco_req" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Banco</label>
                        <input type="text" name="banco_req" id="modal_banco_req" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required>
                    </div>
                    <div>
                        <label for="nro_banco_req" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Número de Banco</label>
                        <input type="text" name="nro_banco_req" id="modal_nro_banco_req" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required>
                    </div>
                    <div>
                        <label for="cci_req" class="block text-sm font-medium text-gray-700 dark:text-gray-300">CCI</label>
                        <input type="text" name="cci_req" id="modal_cci_req" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required>
                    </div>
                    <div>
                        <label for="titular_req" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Titular</label>
                        <input type="text" name="titular_req" id="modal_titular_req" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required>
                    </div>
                    <div>
                        <label for="dni_req" class="block text-sm font-medium text-gray-700 dark:text-gray-300">DNI</label>
                        <input type="text" name="dni_req" id="modal_dni_req" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required>
                    </div>
                </div>
                <input type="hidden" name="id_requerimientos" value="{{ $id }}">

                <div class="flex justify-end space-x-3 mt-6">
                    <button type="button" onclick="closeDepositoModal()" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                        Cancelar
                    </button>
                    <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                        Actualizar
                    </button>
                </div>
            </form>
        </div>
    </div>

    @php
        $permisos = auth()->user()->roles->first()->permissions;
        $hasAdminPermission = $permisos->contains('name', 'Administrativo');
        $hasLogisticPermission = $permisos->contains('name', 'Logistico');
    @endphp

    <div class="py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-xl sm:rounded-lg">
                <div class="p-6">
                    <!-- Header Information -->
                    <div class="mb-8">
                        <h1 class="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">
                            Gestión de Requerimiento
                        </h1>
                        
                        <!-- Status Badges -->
                        <div class="flex justify-center space-x-2 mb-6">
                            @if($requerimiento->aprobado_logistica)
                                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                                    </svg>
                                    Aprobado Logística
                                </span>
                            @else
                                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                                    </svg>
                                    Pendiente Logística
                                </span>
                            @endif

                            @if($requerimiento->aprobado_contabilidad)
                                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                                    </svg>
                                    Aprobado Contabilidad
                                </span>
                            @else
                                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                                    </svg>
                                    Pendiente Contabilidad
                                </span>
                            @endif

                            @if($requerimiento->aprobado_requerimiento)
                                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                                    </svg>
                                    Completamente Aprobado
                                </span>
                            @endif
                        </div>
                        
                        <!-- Basic Information Grid -->
                        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div class="space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">N° Orden</label>
                                        <input type="text" value="E000{{ $requerimiento->numero_orden_requerimiento }}" class="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 text-center" disabled>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Solicitante</label>
                                        <input type="text" value="{{ $requerimiento->solicitado_requerimiento }}" class="mt-1 block w-full rounded-md border-gray-300 bg-gray-100" disabled>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Departamento</label>
                                        <input type="text" value="{{ $requerimiento->departamento_requerimiento }}" class="mt-1 block w-full rounded-md border-gray-300 bg-gray-100" disabled>
                                    </div>
                                </div>
                                <div class="space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha Solicitado</label>
                                        <input type="text" value="{{ $requerimiento->fecha_requerimiento }}" class="mt-1 block w-full rounded-md border-gray-300 bg-gray-100" disabled>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Correo</label>
                                        <input type="text" value="{{ $requerimiento->correo_requerimiento }}" class="mt-1 block w-full rounded-md border-gray-300 bg-gray-100" disabled>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre Requerimiento</label>
                                        <input type="text" value="{{ $requerimiento->nombre_requerimiento }}" class="mt-1 block w-full rounded-md border-gray-300 bg-white">
                                    </div>
                                </div>
                                <div class="space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Proyecto</label>
                                        <input type="text" value="{{ $requerimiento->proyecto->nombre_proyecto }}" class="mt-1 block w-full rounded-md border-gray-300 bg-gray-100" disabled>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Cargo</label>
                                        <input type="text" value="{{ $requerimiento->cargo_requerimiento }}" class="mt-1 block w-full rounded-md border-gray-300 bg-gray-100" disabled>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Mano de Obra Section -->
                    @if($requerimiento->manoObra->count() > 0)
                        <div class="mb-8">
                            <div class="flex items-center mb-4">
                                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Mano de Obra</h3>
                                <span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {{ $requerimiento->manoObra->count() }} items
                                </span>
                            </div>
                            <div class="overflow-x-auto">
                                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead class="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">#</th>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Descripción</th>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cantidad</th>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Precio Unit.</th>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
                                            @if ($hasAdminPermission)
                                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                                            @endif
                                        </tr>
                                    </thead>
                                    <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        @foreach ($requerimiento->manoObra as $obra)
                                            @php
                                                $montoTotal = $obra->cantidad_manoobra * $obra->precio_uni_manoobra;
                                            @endphp
                                            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ $obra->id_mano_obra }}</td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ $obra->descripcion_manoobra }}</td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ $obra->cantidad_manoobra }}</td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">S/{{ number_format($obra->precio_uni_manoobra, 2) }}</td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">S/{{ number_format($montoTotal, 2) }}</td>
                                                @if ($hasAdminPermission)
                                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div class="flex space-x-2">
                                                            <button onclick="openModal({{ $obra }})" class="text-indigo-600 hover:text-indigo-900">Editar</button>
                                                            <form action="{{ route('gestorrequerimientos.eliminarmanoObra', $obra->id_mano_obra) }}" method="POST" class="inline">
                                                                @csrf
                                                                @method('DELETE')
                                                                <input type="hidden" name="id_requerimientos" value="{{ $id }}">
                                                                <button type="submit" class="text-red-600 hover:text-red-900" onclick="return confirm('¿Está seguro?')">Eliminar</button>
                                                            </form>
                                                        </div>
                                                    </td>
                                                @endif
                                            </tr>
                                        @endforeach
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    @endif

                    <!-- Materiales Section -->
                    @if($requerimiento->materiales->count() > 0)
                        <div class="mb-8">
                            <div class="flex items-center mb-4">
                                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Materiales</h3>
                                <span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {{ $requerimiento->materiales->count() }} items
                                </span>
                            </div>
                            <div class="overflow-x-auto">
                                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead class="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">#</th>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Descripción</th>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Unidad</th>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cantidad</th>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Precio Unit.</th>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
                                            @if ($hasAdminPermission)
                                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                                            @endif
                                        </tr>
                                    </thead>
                                    <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        @foreach ($requerimiento->materiales as $material)
                                            @php
                                                $montoTotalmat = $material->cantidad_material_req * $material->precio_unitario_matreq;
                                            @endphp
                                            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ $material->id_materiales_req }}</td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ $material->descripcion_material_req }}</td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ $material->unidad }}</td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ $material->cantidad_material_req }}</td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">S/{{ number_format($material->precio_unitario_matreq, 2) }}</td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">S/{{ number_format($montoTotalmat, 2) }}</td>
                                                @if ($hasAdminPermission)
                                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div class="flex space-x-2">
                                                            <button onclick="openMaterialEditModal({{ $material }})" class="text-indigo-600 hover:text-indigo-900">Editar</button>
                                                            <form action="{{ route('gestorrequerimientos.eliminarmateriales', $material->id_materiales_req) }}" method="POST" class="inline">
                                                                @csrf
                                                                @method('DELETE')
                                                                <input type="hidden" name="id_requerimientos" value="{{ $id }}">
                                                                <button type="submit" class="text-red-600 hover:text-red-900" onclick="return confirm('¿Está seguro?')">Eliminar</button>
                                                            </form>
                                                        </div>
                                                    </td>
                                                @endif
                                            </tr>
                                        @endforeach
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    @endif

                    {{-- Total Amount Section --}}
                    @php
                        $montoTotalMat = 0;
                        foreach ($requerimiento->materiales as $material) {
                            $montoTotalMat += $material->cantidad_material_req * $material->precio_unitario_matreq;
                        }
                    
                        $montoTotalObra = 0;
                        foreach ($requerimiento->manoObra as $obra) {
                            $montoTotalObra += $obra->cantidad_manoobra * $obra->precio_uni_manoobra;
                        }
                    
                        $montoTotalMat = is_numeric($montoTotalMat) ? $montoTotalMat : 0;
                        $montoTotalObra = is_numeric($montoTotalObra) ? $montoTotalObra : 0;
                    
                        $montoTotal = $montoTotalMat + $montoTotalObra;
                    @endphp

                    @if($montoTotal > 0)
                        <div class="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 mb-8">
                            <div class="flex items-center justify-between">
                                <span class="text-lg font-semibold text-blue-900 dark:text-blue-100">Total del Requerimiento:</span>
                                <span class="text-2xl font-bold text-blue-900 dark:text-blue-100">S/{{ number_format($montoTotal, 2) }}</span>
                            </div>
                        </div>
                    @endif

                    <!-- Datos Bancarios Section -->
                    @if($requerimiento->depositos->count() > 0)
                        <div class="mb-8">
                            <div class="flex items-center mb-4">
                                <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Datos Bancarios</h3>
                                <span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    {{ $requerimiento->depositos->count() }} cuenta(s)
                                </span>
                            </div>
                            <div class="overflow-x-auto">
                                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead class="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">#</th>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Banco</th>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">N° Cuenta</th>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">CCI</th>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Titular</th>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">DNI</th>
                                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Monto</th>
                                            @if ($hasAdminPermission)
                                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                                            @endif
                                        </tr>
                                    </thead>
                                    <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        @foreach ($requerimiento->depositos as $deposito)
                                            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ $deposito->id_depositoreq }}</td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ $deposito->banco_req }}</td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-mono">{{ $deposito->nro_banco_req }}</td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-mono">{{ $deposito->cci_req }}</td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ $deposito->titular_req }}</td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-mono">{{ $deposito->dni_req }}</td>
                                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">S/{{ number_format($montoTotal, 2) }}</td>
                                                @if ($hasAdminPermission)
                                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <button onclick="openDepositoEditModal({{ $deposito }})" class="text-indigo-600 hover:text-indigo-900">Editar</button>
                                                    </td>
                                                @endif
                                            </tr>
                                        @endforeach
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    @endif

                    <!-- Dynamic Action Buttons -->
                    @if ($hasAdminPermission || $hasLogisticPermission)
                        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-8">
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
                                Acciones de Aprobación
                            </h3>
                            
                            <div class="flex flex-wrap justify-center gap-4">
                                @php
                                    $userRole = auth()->user()->roles->first()->name;
                                    $canApproveLogistics = $hasLogisticPermission && !$requerimiento->aprobado_logistica;
                                    //$canApproveAccounting = $hasAdminPermission && $requerimiento->aprobado_logistica && !$requerimiento->aprobado_contabilidad;
                                    $canApproveAccounting = $hasAdminPermission;
                                    $canFinalApprove = $hasAdminPermission && $requerimiento->aprobado_logistica && $requerimiento->aprobado_contabilidad && !$requerimiento->aprobado_requerimiento;
                                @endphp

                                <!-- Logistics Approval -->
                                @if($canApproveLogistics)
                                    <form action="{{ route('requerimientos_aprobar.aprobar', $requerimiento->id_requerimiento) }}" method="POST" class="inline">
                                        @csrf
                                        <input type="hidden" name="rolesAsignado" value="{{ $userRole }}">
                                        <input type="hidden" name="empresaId" value="{{ $requerimiento->empresa_designado }}">
                                        <button type="submit" class="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 active:bg-green-900 focus:outline-none focus:border-green-900 focus:ring ring-green-300">
                                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                            Aprobar Logística
                                        </button>
                                    </form>
                                @endif

                                <!-- Accounting Approval -->
                                @if($canApproveAccounting)
                                    <form action="{{ route('requerimientos_aprobar.aprobar', $requerimiento->id_requerimiento) }}" method="POST" class="inline">
                                        @csrf
                                        <input type="hidden" name="rolesAsignado" value="administradores">
                                        <input type="hidden" name="empresaId" value="{{ $requerimiento->empresa_designado }}">
                                        <button type="submit" class="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 active:bg-blue-900 focus:outline-none focus:border-blue-900 focus:ring ring-blue-300">
                                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                            Aprobar Contabilidad
                                        </button>
                                    </form>
                                @endif

                                <!-- Final Approval -->
                                @if($canFinalApprove)
                                    <form action="{{ route('requerimientos_aprobar.aprobar', $requerimiento->id_requerimiento) }}" method="POST" class="inline">
                                        @csrf
                                        <input type="hidden" name="rolesAsignado" value="{{ $userRole }}">
                                        <input type="hidden" name="empresaId" value="{{ $requerimiento->empresa_designado }}">
                                        <button type="submit" class="inline-flex items-center px-4 py-2 bg-purple-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-purple-700 active:bg-purple-900 focus:outline-none focus:border-purple-900 focus:ring ring-purple-300">
                                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                            Aprobación Final
                                        </button>
                                    </form>
                                @endif

                                <!-- Pending Button -->
                                @if(!$requerimiento->aprobado_requerimiento)
                                    <form action="{{ route('requerimientos_pendiente.pendiente', $requerimiento->id_requerimiento) }}" method="POST" class="inline">
                                        @csrf
                                        <input type="hidden" name="rolesAsignado" value="{{ $userRole }}">
                                        <input type="hidden" name="empresaId" value="{{ $requerimiento->empresa_designado }}">
                                        <button type="submit" class="inline-flex items-center px-4 py-2 bg-yellow-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-yellow-700 active:bg-yellow-900 focus:outline-none focus:border-yellow-900 focus:ring ring-yellow-300">
                                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                            Marcar Pendiente
                                        </button>
                                    </form>
                                @endif

                                <!-- Reject/Delete Button -->
                                <form action="{{ route('requerimientos_eliminar.eliminar', $requerimiento->id_requerimiento) }}" method="POST" class="inline" onsubmit="return confirm('¿Está seguro de que desea rechazar/eliminar este requerimiento?')">
                                    @csrf
                                    @method('DELETE')
                                    <input type="hidden" name="empresaId" value="{{ $requerimiento->empresa_designado }}">
                                    <input type="hidden" name="solicitado_requerimiento" value="{{ $requerimiento->solicitado_requerimiento }}">
                                    <input type="hidden" name="nombre_requerimiento" value="{{ $requerimiento->nombre_requerimiento }}">
                                    <button type="submit" class="inline-flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-700 active:bg-red-900 focus:outline-none focus:border-red-900 focus:ring ring-red-300">
                                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                        </svg>
                                        Rechazar/Eliminar
                                    </button>
                                </form>
                            </div>
                        </div>
                    @endif

                    <!-- Sustentation Section -->
                    @if($requerimiento->aprobado_logistica && $requerimiento->aprobado_contabilidad && $requerimiento->aprobado_requerimiento)
                        <div class="bg-green-50 dark:bg-green-900 rounded-lg p-6">
                            <h3 class="text-lg font-semibold text-green-900 dark:text-green-100 mb-4 text-center">
                                Sustentación de Requerimiento
                            </h3>
                            <div class="flex justify-center">
                                <button id="open_sustentoreque" class="inline-flex items-center px-6 py-3 bg-green-600 border border-transparent rounded-md font-semibold text-sm text-white uppercase tracking-widest hover:bg-green-700 active:bg-green-900 focus:outline-none focus:border-green-900 focus:ring ring-green-300">
                                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                    </svg>
                                    Gestionar Sustentación
                                </button>
                            </div>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>

    {{-- Modal Sustentación --}}
    <div id="sustentoRequerimientosModal" class="fixed inset-0 flex items-center justify-center z-50 hidden bg-black bg-opacity-50">
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-bold text-gray-900 dark:text-white">Sustentación del Requerimiento</h2>
                <button type="button" id="dismiss_sustentoreque" class="text-gray-400 hover:text-gray-600">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <div class="space-y-6">
                <!-- Upload Form -->
                <form action="{{ route('actualizarSustento.actualizarsustento', $requerimiento->id_requerimiento) }}" method="POST" enctype="multipart/form-data" class="space-y-4">
                    @csrf
                    <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Requerimiento</label>
                                <input type="text" value="{{ $requerimiento->nombre_requerimiento }}" class="w-full rounded-md border-gray-300 bg-gray-100" disabled>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto Total</label>
                                <input type="text" value="S/{{ number_format($montoTotal, 2) }}" class="w-full rounded-md border-gray-300 bg-gray-100" disabled>
                            </div>
                        </div>
                        <div>
                            <label for="sustento_requerimiento" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Documento de Sustentación
                            </label>
                            <input id="sustento_requerimiento" name="sustento_requerimiento" type="file" 
                                   class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                                   accept="image/*,.pdf">
                        </div>
                    </div>
                    
                    <input type="hidden" name="empresaId" value="{{ $requerimiento->empresa_designado }}">
                    
                    <div class="flex justify-end">
                        <button type="submit" class="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                            </svg>
                            Subir Documento
                        </button>
                    </div>
                </form>

                <!-- Current Document Display -->
                @if ($requerimiento->sustento_requerimiento)
                    <div class="border-t pt-6">
                        <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Documento Actual</h4>
                        @php
                            $extension = pathinfo($requerimiento->sustento_requerimiento, PATHINFO_EXTENSION);
                        @endphp

                        @if (in_array(strtolower($extension), ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg']))
                            <div class="text-center">
                                <img src="{{ asset('storage/sustento_requerimiento/' . $requerimiento->sustento_requerimiento) }}" 
                                     alt="Sustento Requerimiento" 
                                     class="max-w-full h-auto rounded-lg shadow-lg">
                            </div>
                        @elseif(strtolower($extension) == 'pdf')
                            <div class="text-center p-8 bg-red-50 rounded-lg">
                                <svg class="w-16 h-16 mx-auto text-red-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                                </svg>
                                <a href="{{ asset('storage/sustento_requerimiento/' . $requerimiento->sustento_requerimiento) }}" 
                                   target="_blank" 
                                   class="inline-flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-700">
                                    Ver Documento PDF
                                </a>
                            </div>
                        @else
                            <div class="text-center p-8 bg-gray-50 rounded-lg">
                                <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                                <a href="{{ asset('storage/sustento_requerimiento/' . $requerimiento->sustento_requerimiento) }}" 
                                   class="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700">
                                    Descargar Archivo
                                </a>
                            </div>
                        @endif
                    </div>
                @else
                    <div class="text-center p-8 bg-yellow-50 rounded-lg">
                        <svg class="w-16 h-16 mx-auto text-yellow-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                        </svg>
                        <p class="text-yellow-800 font-medium">No hay documento de sustentación disponible</p>
                    </div>
                @endif
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
            document.getElementById('updateForm').action = '/gestorrequerimientos_mobra/' + obra.id_mano_obra;
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
            document.getElementById('updateMaterialModal').classList.remove('hidden');
            document.getElementById('updateMaterialForm').action = '/gestorrequerimientos_material/' + material.id_materiales_req;
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
            document.getElementById('updateDepositoModal').classList.remove('hidden');
            document.getElementById('updateDepositoForm').action = '/gestorrequerimientos_dep/' + deposito.id_depositoreq;
        }

        function closeDepositoModal() {
            document.getElementById('updateDepositoModal').classList.add('hidden');
        }

        // Sustentation Modal
        document.getElementById('open_sustentoreque').onclick = function() {
            document.getElementById('sustentoRequerimientosModal').classList.remove('hidden');
        };

        document.getElementById('dismiss_sustentoreque').onclick = function() {
            document.getElementById('sustentoRequerimientosModal').classList.add('hidden');
        };

        // Close modals when clicking outside
        window.onclick = function(event) {
            const modals = ['updateModal', 'updateMaterialModal', 'updateDepositoModal', 'sustentoRequerimientosModal'];
            modals.forEach(modalId => {
                const modal = document.getElementById(modalId);
                if (event.target === modal) {
                    modal.classList.add('hidden');
                }
            });
        };
    </script>
</x-app-layout>