<x-app-layout>
    <x-slot name="header">
        @if (Auth::check())
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 class="font-semibold text-2xl text-gray-800 dark:text-gray-200 leading-tight">
                        Bienvenido {{ Auth::user()->name }} {{ Auth::user()->surname }}
                    </h2>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {{ now()->locale('es')->isoFormat('dddd, D [de] MMMM [de] YYYY') }}
                    </p>
                </div>

                <button id="btn-marcar-asistencia" type="button"
                    class=" items-center gap-x-2 px-6 py-3 text-sm font-semibold rounded-lg border border-transparent bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Marcar Asistencia
                </button>

                <!-- Indicador de proceso automático en móvil -->
                <div id="mobile-auto-indicator" class="hidden md:hidden">
                    <div
                        class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg text-white text-sm font-medium shadow-lg">
                        <div class="animate-pulse w-2 h-2 bg-white rounded-full"></div>
                        <span>Iniciando marcado automático...</span>
                    </div>
                </div>
            </div>
            <!-- Datos ocultos para JavaScript -->
            <input type="hidden" id="trabajador_id" value="{{ Auth::user()->id }}">
            <input type="hidden" id="nombre_trab" value="{{ Auth::user()->name }}">
            <input type="hidden" id="empresa_id" value="{{ $empresaId ?? 0 }}">
        @endif
    </x-slot>

    <div id="dashboard-app" class="py-2">
        <!-- Pantalla de carga inicial para móviles -->
        <div id="mobile-loading-screen"
            class="hidden fixed inset-0 z-50 bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600">
            <div class="flex flex-col items-center justify-center h-full px-6">
                <div class="text-center mb-8">
                    <div
                        class="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6 shadow-2xl">
                        <svg class="w-12 h-12 text-cyan-600 animate-pulse" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 class="text-3xl font-bold text-white mb-3">Preparando marcado</h2>
                    <p class="text-white text-opacity-90 text-lg" id="loading-status">Inicializando sistema...</p>
                </div>

                <div class="w-full max-w-md space-y-4">
                    <!-- Progreso de permisos -->
                    <div class="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-white text-sm font-medium">📍 Ubicación</span>
                            <span id="location-status" class="text-white text-xs">⏳ Esperando...</span>
                        </div>
                        <div class="w-full bg-white bg-opacity-30 rounded-full h-2">
                            <div id="location-progress"
                                class="bg-green-400 h-2 rounded-full transition-all duration-500" style="width: 0%">
                            </div>
                        </div>
                    </div>

                    <div class="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-white text-sm font-medium">📷 Cámara</span>
                            <span id="camera-status" class="text-white text-xs">⏳ Esperando...</span>
                        </div>
                        <div class="w-full bg-white bg-opacity-30 rounded-full h-2">
                            <div id="camera-progress" class="bg-green-400 h-2 rounded-full transition-all duration-500"
                                style="width: 0%"></div>
                        </div>
                    </div>

                    <div class="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-white text-sm font-medium">📋 Tareas</span>
                            <span id="tasks-status" class="text-white text-xs">⏳ Esperando...</span>
                        </div>
                        <div class="w-full bg-white bg-opacity-30 rounded-full h-2">
                            <div id="tasks-progress" class="bg-green-400 h-2 rounded-full transition-all duration-500"
                                style="width: 0%"></div>
                        </div>
                    </div>
                </div>

                <div class="mt-8">
                    <p class="text-white text-sm text-opacity-75 text-center">
                        Por favor, acepta los permisos cuando se soliciten
                    </p>
                </div>
            </div>
        </div>

        <!-- Estadísticas Rápidas -->
        <div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8 mb-8">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- Card: Asistencias del Mes -->
                <div
                    class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-green-500 transform hover:scale-105 transition-transform duration-200">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Asistencias</p>
                            <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2" id="stat-asistencias">--
                            </p>
                        </div>
                        <div class="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                            <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <!-- Card: Tardanzas -->
                <div
                    class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-yellow-500 transform hover:scale-105 transition-transform duration-200">
                    <div class="flex items-center justify-between">
                        <!-- Texto y números alineados horizontalmente -->
                        <div>
                            <p class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Puntualidad / Tardanzas
                            </p>
                            <div class="flex flex-row items-center space-x-2">
                                <p class="text-3xl font-bold text-gray-900 dark:text-white" id="stat-puntualidad">--</p>
                                <span class="text-2xl text-gray-500 dark:text-gray-400">/</span>
                                <p class="text-3xl font-bold text-gray-900 dark:text-white" id="stat-tardanzas">--</p>
                            </div>
                        </div>

                        <!-- Ícono decorativo -->
                        <div class="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                            <svg class="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none"
                                stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <!-- Card: Tareas Pendientes -->
                <div
                    class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-500 transform hover:scale-105 transition-transform duration-200">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Tareas Pendientes</p>
                            <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2" id="stat-tareas">--</p>
                        </div>
                        <div class="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                            <svg class="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none"
                                stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                    </div>
                </div>

                <!-- Card: Progreso -->
                <div
                    class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-purple-500 transform hover:scale-105 transition-transform duration-200">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Progreso</p>
                            <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2" id="stat-progreso">--%
                            </p>
                        </div>
                        <div class="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                            <svg class="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none"
                                stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Contenido Principal -->
        <div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="col-span-3">
                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                        <!-- Header -->
                        <div class="p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                                Accesos Directos
                            </h3>
                        </div>

                        <!-- Accesos Directos Content -->
                        <div class="p-4">
                            <!-- Responsive layout: stack on mobile, row on medium+ screens -->
                            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                                <!-- Botón visible solo en desktop -->
                                <a href="{{ route('actividades.kanban.gestor', ['id' => $empresaId]) }}"
                                    class=" items-center gap-x-2 px-6 py-3 text-sm font-semibold rounded-lg border border-transparent bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                                    Planner
                                </a>
                                <a href="{{ route('tramites.view', ['empresaId' => $empresaId]) }}"
                                    class=" items-center gap-x-2 px-6 py-3 text-sm font-semibold rounded-lg border border-transparent bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                                    Trámites
                                </a>

                                <a href="{{ route('actividades.kanban', ['id' => $empresaId]) }}"
                                    class=" items-center gap-x-2 px-6 py-3 text-sm font-semibold rounded-lg border border-transparent bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                                    Kanban
                                </a>

                                <a href="{{ route('proyectos.gestor', ['id' => $empresaId]) }}"
                                    class=" items-center gap-x-2 px-6 py-3 text-sm font-semibold rounded-lg border border-transparent bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                                    proyectos
                                </a>

                                <a href="{{ route('logistica.requerimientos.gestor', ['empresaId' => $empresaId]) }}"
                                    class=" items-center gap-x-2 px-6 py-3 text-sm font-semibold rounded-lg border border-transparent bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                                    Requerimientos
                                </a>

                                <a href="{{ route('proyectos.reportes', ['empresaId' => $empresaId]) }}"
                                    class=" items-center gap-x-2 px-6 py-3 text-xs font-semibold rounded-lg border border-transparent bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                                    Reporte proyectos
                                </a>

                                <a href="{{ route('gestion.contabilidad', ['id' => $empresaId]) }}"
                                    class=" items-center gap-x-2 px-6 py-3 text-sm font-semibold rounded-lg border border-transparent bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                                    Balance
                                </a>

                                <a href="{{ route('logistica.requerimientos.gestor', ['empresaId' => $empresaId]) }}"
                                    class=" items-center gap-x-2 px-6 py-3 text-sm font-semibold rounded-lg border border-transparent bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                                    Requerimientos
                                </a>

                                @if ($empresaId == 3)
                                    <a href="{{ route('campo.principal', ['empresaId' => $empresaId]) }}"
                                        class=" items-center gap-x-2 px-6 py-3 text-xs font-semibold rounded-lg border border-transparent bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                                        Gestion Campo
                                    </a>
                                @endif
                            </div>
                        </div>
                    </div>

                </div>
                <!-- Calendario -->
                <div class="lg:col-span-2">
                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Calendario de
                                Actividades
                            </h3>
                        </div>
                        <div class="p-6">
                            <div id="calendar" class="rounded-lg"></div>
                        </div>
                    </div>
                </div>

                <!-- Panel Lateral -->
                <div class="space-y-6">
                    <!-- Tareas Recientes -->
                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Tareas Recientes</h3>
                        </div>
                        <div class="p-6 max-h-96 overflow-y-auto" id="tareas-recientes">
                            <div class="flex items-center justify-center py-8">
                                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Historial de Asistencia -->
                    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Última Asistencia</h3>
                        </div>
                        <div class="p-6" id="ultima-asistencia">
                            <div class="flex items-center justify-center py-8">
                                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal: Marcar Asistencia -->
    <div id="modal-asistencia" class="hidden fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <!-- Overlay -->
            <div class="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" aria-hidden="true"></div>

            <!-- Modal Panel -->
            <div
                class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <!-- Header -->
                <div class="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4">
                    <div class="flex items-center justify-between">
                        <h3 class="text-xl font-bold text-white flex items-center gap-2">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                            </svg>
                            Escanear QR
                        </h3>
                        <button id="btn-cerrar-modal" class="text-white hover:text-gray-200 transition-colors">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- Body -->
                <div class="px-6 py-6">
                    <!-- Estado del escáner -->
                    <div id="qr-status"
                        class="mb-4 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900 dark:to-cyan-900 border-2 border-blue-200 dark:border-blue-700">
                        <div class="flex items-center justify-center gap-3">
                            <div
                                class="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full">
                            </div>
                            <p class="text-sm font-medium text-blue-800 dark:text-blue-200">
                                Escaneando código QR...
                            </p>
                        </div>
                    </div>

                    <!-- Cola de procesamiento -->
                    <div id="queue-info"
                        class="hidden mb-4 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700">
                        <div class="flex items-center gap-2">
                            <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none"
                                stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p class="text-sm text-yellow-800 dark:text-yellow-200">
                                <span class="font-semibold">En cola:</span>
                                <span id="queue-position">0</span> personas esperando
                            </p>
                        </div>
                    </div>

                    <div id="qr-reader"
                        class="rounded-lg overflow-hidden border-4 border-dashed border-gray-300 dark:border-gray-600 shadow-inner">
                    </div>

                    <div class="mt-4 space-y-2">
                        <div class="flex items-center justify-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clip-rule="evenodd" />
                            </svg>
                            <span>Cámara trasera activada</span>
                        </div>
                        <p class="text-xs text-center text-gray-500 dark:text-gray-400">
                            Mantén el código QR dentro del recuadro y espera el escaneo automático
                        </p>
                    </div>
                </div>

                <!-- Footer -->
                <div class="bg-gray-50 dark:bg-gray-900 px-6 py-4">
                    <button id="btn-cancelar-escaneo"
                        class="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal: Seleccionar Tarea -->
    <div id="modal-tareas" class="hidden fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <!-- Overlay -->
            <div class="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" aria-hidden="true"></div>

            <!-- Modal Panel -->
            <div
                class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                <!-- Header -->
                <div class="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
                    <h3 class="text-xl font-bold text-white">Selecciona tu tarea</h3>
                </div>

                <!-- Body -->
                <div class="px-6 py-6 max-h-96 overflow-y-auto" id="lista-tareas">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <!-- Las tareas se cargarán aquí dinámicamente -->
                    </div>
                </div>

                <!-- Footer -->
                <div class="bg-gray-50 dark:bg-gray-900 px-6 py-4 flex items-center justify-between">
                    <p class="text-sm text-gray-600 dark:text-gray-400" id="contador-tareas">
                        Cargando tareas...
                    </p>
                    <button id="btn-cerrar-tareas"
                        class="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Scripts -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <link rel="stylesheet" href="{{ asset('assets/dist/event-calendar.css') }}" />
    <link rel="stylesheet" href="https://cdn.dhtmlx.com/fonts/wxi/wx-icons.css" />
    <script src="{{ asset('assets/dist/event-calendar.js') }}"></script>
    <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
    <script src="https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

    <!-- Script de inicialización inline para debug -->
    <script>
        console.log('🔧 Verificando carga de librerías...');
        console.log('Vue:', typeof Vue !== 'undefined' ? '✅' : '❌');
        console.log('Html5Qrcode:', typeof Html5Qrcode !== 'undefined' ? '✅' : '❌');
        console.log('Swal:', typeof Swal !== 'undefined' ? '✅' : '❌');

        // Forzar detección móvil para pruebas (ELIMINAR EN PRODUCCIÓN)
        window.FORCE_MOBILE_MODE = window.innerWidth <= 768;
        console.log('🔍 Forzar modo móvil:', window.FORCE_MOBILE_MODE);
    </script>

    {{-- <script src="{{ asset('js/dashboardGeneral.js') }}" type="module"></script> --}}
</x-app-layout>
