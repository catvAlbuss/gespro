<nav x-data="{ open: false, dropdownOpen: false }"
    class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-lg backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 sticky top-0 z-50">
    <div class="max-w-full mx-auto px-2 sm:px-4 lg:px-6">
        <div class="flex justify-between items-center h-14 sm:h-16">

            <!-- Logo Section - Pegado a la izquierda -->
            <div class="flex items-center flex-shrink-0 min-w-0">
                <a href="{{ route('admin.dashboard') }}" class="flex items-center space-x-2 sm:space-x-3 group">
                    <div class="flex-shrink-0">
                        <x-application-logo
                            class="h-8 w-8 sm:h-9 sm:w-9 fill-current text-cyan-600 dark:text-cyan-400 group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors duration-200" />
                    </div>
                    <span
                        class="font-bold text-sm sm:text-base text-gray-800 dark:text-gray-200 truncate group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors duration-200 hidden xs:block">
                        {{ config('app.name', 'App') }}
                    </span>
                </a>
            </div>

            <!-- Navigation Center - Oculto en móvil -->
            <div class="hidden lg:flex lg:items-center lg:space-x-1 xl:space-x-2 flex-1 justify-center max-w-2xl">
                @role('Administrador')
                    <x-nav-link :href="route('admin.dashboard')" :active="request()->routeIs('admin.dashboard')"
                        class="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all duration-200">
                        <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        {{ __('Inicio') }}
                    </x-nav-link>

                    <!-- Improved Dropdown Menu -->
                    <div class="relative" x-data="{ dropdownOpen: false }" @click.away="dropdownOpen = false">
                        <button @click="dropdownOpen = !dropdownOpen"
                            class="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all duration-200 group"
                            :class="{ 'bg-gray-100 dark:bg-gray-800 text-cyan-600 dark:text-cyan-400': dropdownOpen }">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                            </svg>
                            <span>{{ __('Gestión Adm') }}</span>
                            <svg class="w-4 h-4 transition-transform duration-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-400"
                                :class="{ 'rotate-180': dropdownOpen }" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M5.25 7.5L10 12.25 14.75 7.5H5.25z" clip-rule="evenodd" />
                            </svg>
                        </button>

                        <div x-show="dropdownOpen" x-transition:enter="transition ease-out duration-200"
                            x-transition:enter-start="opacity-0 transform scale-95"
                            x-transition:enter-end="opacity-100 transform scale-100"
                            x-transition:leave="transition ease-in duration-150"
                            x-transition:leave-start="opacity-100 transform scale-100"
                            x-transition:leave-end="opacity-0 transform scale-95"
                            class="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 border border-gray-200 dark:border-gray-700 z-50">
                            <div class="p-2">
                                <a href="{{ route('permissions.index') }}"
                                    class="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all duration-200 group">
                                    <svg class="w-4 h-4 mr-3 text-gray-400 group-hover:text-cyan-500" fill="none"
                                        stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    {{ __('Permisos') }}
                                </a>
                                <a href="{{ route('roles.index') }}"
                                    class="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all duration-200 group">
                                    <svg class="w-4 h-4 mr-3 text-gray-400 group-hover:text-cyan-500" fill="none"
                                        stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                    </svg>
                                    {{ __('Roles') }}
                                </a>
                                <a href="{{ route('users.index') }}"
                                    class="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all duration-200 group">
                                    <svg class="w-4 h-4 mr-3 text-gray-400 group-hover:text-cyan-500" fill="none"
                                        stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                    </svg>
                                    {{ __('Usuarios') }}
                                </a>
                                <a href="{{ route('empresas.index') }}"
                                    class="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all duration-200 group">
                                    <svg class="w-4 h-4 mr-3 text-gray-400 group-hover:text-cyan-500" fill="none"
                                        stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    {{ __('Empresas') }}
                                </a>
                            </div>
                        </div>
                    </div>
                @endrole

                @role('Gerente')
                    <x-nav-link :href="route('manager.dashboard')" :active="request()->routeIs('manager.dashboard')"
                        class="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all duration-200">
                        <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        {{ __('Inicio') }}
                    </x-nav-link>
                @endrole
                
                @role('administradores')
                @endrole

                @role('Jefe de Area')
                    {{-- Inicio --}}
                    <x-nav-link :href="route('jefe.dashboard')" :active="request()->routeIs('admin.dashboard')"
                        class="px-1 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all duration-200">
                        <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M3 9.75L12 4l9 5.75v10.5a.75.75 0 01-.75.75H3.75a.75.75 0 01-.75-.75V9.75z" />
                        </svg>
                        {{ __('Inicio') }}
                    </x-nav-link>

                    {{-- Requerimientos --}}
                    <x-nav-link :href="route('gestorrequerimientog', ['empresaId' => session('empresa_id')])"
                        class="px-1 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all duration-200">
                        <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                        </svg>
                        {{ __('Requerimientos') }}
                    </x-nav-link>

                    {{-- Planner --}}
                    <x-nav-link :href="route('gestorkanbangen', ['id' => session('empresa_id')])"
                        class="px-1 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all duration-200">
                        <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        {{ __('Planner') }}
                    </x-nav-link>

                    {{-- Kanban --}}
                    <x-nav-link :href="route('kanban', ['id' => session('empresa_id')])"
                        class="px-1 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all duration-200">
                        <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 6h4v12H4zM10 6h4v12h-4zM16 6h4v12h-4z" />
                        </svg>
                        {{ __('Kanban') }}
                    </x-nav-link>

                    {{-- Proyectos --}}
                    <x-nav-link :href="route('gestorproyectos', ['id' => session('empresa_id')])"
                        class="px-1 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all duration-200">
                        <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M3 7h18M3 12h18M3 17h18" />
                        </svg>
                        {{ __('Proyectos') }}
                    </x-nav-link>

                    {{-- Reportes --}}
                    <x-nav-link :href="route('gestoreportesGen', ['id' => session('empresa_id')])"
                        class="px-1 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all duration-200">
                        <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 0h6m2 0a2 2 0 002-2V5a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2h2" />
                        </svg>
                        {{ __('Reportes') }}
                    </x-nav-link>

                    {{-- Trámites --}}
                    <x-nav-link :href="route('Tramites', ['empresaId' => session('empresa_id')])"
                        class="px-1 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all duration-200">
                        <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                        </svg>
                        {{ __('Trámites') }}
                    </x-nav-link>

                    {{-- Programas (empresa_id 1 o 2) --}}
                    @if (session('empresa_id') == 1 || session('empresa_id') == 2)
                        <x-nav-link :href="route('gestorconstruye', ['empresaId' => session('empresa_id')])"
                            class="px-1 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all duration-200">
                            <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 8v4l3 3m6-9a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {{ __('Programas') }}
                        </x-nav-link>
                    @endif

                    {{-- Gestión Campo (empresa_id 3) --}}
                    @if (session('empresa_id') == 3)
                        <x-nav-link :href="route('mantenimientoCampo.rederigircampo', ['empresaId' => session('empresa_id')])"
                            class="px-1 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all duration-200">
                            <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M5 13l4 4L19 7" />
                            </svg>
                            {{ __('Gestion Campo') }}
                        </x-nav-link>
                    @endif
                @endrole


                @role('trabajador')
                    <x-nav-link :href="route('trabajador.dashboard')" :active="request()->routeIs('trabajador.dashboard')"
                        class="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all duration-200">
                        <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        {{ __('Inicio') }}
                    </x-nav-link>
                    <x-nav-link :href="route('kanban', ['id' => session('empresa_id')])"
                        class="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all duration-200">
                        <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                        </svg>
                        {{ __('Kanban') }}
                    </x-nav-link>
                    <x-nav-link :href="route('Tramites', ['empresaId' => session('empresa_id')])"
                        class="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all duration-200">
                        <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                        </svg>
                        {{ __('Trámites') }}
                    </x-nav-link>
                @endrole
            </div>


            <!-- Right Section - Notifications + User Profile -->
            <div class="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">

                <!-- Enhanced Notifications -->
                <x-notification-button />
                {{-- <div class="relative" x-data="{ notificationOpen: false }" @click.away="notificationOpen = false">
                    <button @click="notificationOpen = !notificationOpen"
                        class="relative p-2 text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900">
                        <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M15 17h5l-5 5v-5zM10.07 2.82l-.9 1.63A9 9 0 003 12v3.8a.6.6 0 00.6.6h6.8l5.3 5.3a.6.6 0 001-.4v-3.8a9 9 0 00-6.07-8.48l-.9 1.63z" />
                        </svg>
                        <!-- Notification Badge -->
                        <span
                            class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">3</span>
                    </button>

                    <!-- Notifications Dropdown -->
                    <div x-show="notificationOpen" x-transition:enter="transition ease-out duration-200"
                        x-transition:enter-start="opacity-0 transform scale-95"
                        x-transition:enter-end="opacity-100 transform scale-100"
                        x-transition:leave="transition ease-in duration-150"
                        x-transition:leave-start="opacity-100 transform scale-100"
                        x-transition:leave-end="opacity-0 transform scale-95"
                        class="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden">

                        <div class="p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Notificaciones</h3>
                        </div>

                        <div class="max-h-64 overflow-y-auto">
                            <!-- Sample notification items -->
                            <div
                                class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700">
                                <div class="flex items-start space-x-3">
                                    <div class="flex-shrink-0">
                                        <div
                                            class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                            <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor"
                                                viewBox="0 0 20 20">
                                                <path
                                                    d="M8.707 7.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2a1 1 0 00-1.414-1.414L11 7.586V3a1 1 0 10-2 0v4.586l-.293-.293z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <p class="text-sm font-medium text-gray-900 dark:text-white">Nueva tarea
                                            asignada</p>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">Se te ha asignado una nueva
                                            tarea en el proyecto Alpha</p>
                                        <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Hace 5 minutos</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="p-4 text-center border-t border-gray-200 dark:border-gray-700">
                            <a href="#"
                                class="text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300">
                                Ver todas las notificaciones
                            </a>
                        </div>
                    </div>
                </div> --}}

                <!-- Enhanced User Dropdown -->
                <div class="relative" x-data="{ userDropdownOpen: false }" @click.away="userDropdownOpen = false">
                    <button @click="userDropdownOpen = !userDropdownOpen"
                        class="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900">
                        @if (Auth::user()->image_user)
                            <img src="{{ asset('/storage/profile/' . Auth::user()->image_user) }}" alt="profile"
                                class="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-2 ring-cyan-500/50 hover:ring-cyan-500 transition-all duration-200">
                        @else
                            <div
                                class="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-medium text-sm ring-2 ring-cyan-500/50 hover:ring-cyan-500 transition-all duration-200">
                                {{ strtoupper(substr(Auth::user()->name, 0, 1)) }}
                            </div>
                        @endif
                        <div class="hidden sm:block text-left">
                            <p
                                class="text-sm font-medium text-gray-800 dark:text-gray-200 truncate max-w-24 lg:max-w-32">
                                {{ Auth::user()->name }}</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400 truncate max-w-24 lg:max-w-32">
                                {{ Auth::user()->getRoleNames()->first() }}</p>
                        </div>
                        <svg class="hidden sm:block w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200"
                            :class="{ 'rotate-180': userDropdownOpen }" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M5.25 7.5L10 12.25 14.75 7.5H5.25z" clip-rule="evenodd" />
                        </svg>
                    </button>

                    <!-- User Dropdown Menu -->
                    <div x-show="userDropdownOpen" x-transition:enter="transition ease-out duration-200"
                        x-transition:enter-start="opacity-0 transform scale-95"
                        x-transition:enter-end="opacity-100 transform scale-100"
                        x-transition:leave="transition ease-in duration-150"
                        x-transition:leave-start="opacity-100 transform scale-100"
                        x-transition:leave-end="opacity-0 transform scale-95"
                        class="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 border border-gray-200 dark:border-gray-700 z-50">

                        <!-- User Info Header -->
                        <div
                            class="px-4 py-3 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-t-xl">
                            <div class="flex items-center space-x-3">
                                @if (Auth::user()->image_user)
                                    <img src="{{ asset('/storage/profile/' . Auth::user()->image_user) }}"
                                        alt="profile"
                                        class="w-12 h-12 rounded-full object-cover ring-2 ring-white dark:ring-gray-700">
                                @else
                                    <div
                                        class="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-bold text-lg ring-2 ring-white dark:ring-gray-700">
                                        {{ strtoupper(substr(Auth::user()->name, 0, 1)) }}
                                    </div>
                                @endif
                                <div class="flex-1 min-w-0">
                                    <p class="font-semibold text-gray-900 dark:text-white truncate">
                                        {{ Auth::user()->name }}</p>
                                    <p class="text-sm text-gray-600 dark:text-gray-400 truncate">
                                        {{ Auth::user()->email }}</p>
                                    <span
                                        class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200 mt-1">
                                        {{ Auth::user()->getRoleNames()->first() }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Menu Items -->
                        <div class="py-2">
                            <a href="{{ route('profile.edit') }}"
                                class="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all duration-200 group">
                                <svg class="w-5 h-5 mr-3 text-gray-400 group-hover:text-cyan-500" fill="none"
                                    stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                {{ __('Mi Perfil') }}
                            </a>

                            <div class="border-t border-gray-200 dark:border-gray-700 my-1"></div>

                            <form method="POST" action="{{ route('logout') }}">
                                @csrf
                                <button type="submit"
                                    class="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 group">
                                    <svg class="w-5 h-5 mr-3 text-gray-400 group-hover:text-red-500" fill="none"
                                        stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    {{ __('Cerrar Sesión') }}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <!-- Mobile Hamburger Menu -->
                <div class="flex lg:hidden">
                    <button @click="open = !open"
                        class="inline-flex items-center justify-center p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-200">
                        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path :class="{ 'hidden': open, 'inline-flex': !open }" class="inline-flex"
                                stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 6h16M4 12h16M4 18h16" />
                            <path :class="{ 'hidden': !open, 'inline-flex': open }" class="hidden"
                                stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Enhanced Mobile Menu -->
    <div :class="{ 'block': open, 'hidden': !open }"
        class="hidden lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg">

        <!-- Mobile Navigation Links -->
        <div class="px-4 py-4 space-y-2 max-h-screen overflow-y-auto">
            @role('Administrador')
                <a href="{{ route('admin.dashboard') }}"
                    class="flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-lg transition-all duration-200">
                    <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    {{ __('Inicio') }}
                </a>

                <!-- Mobile Admin Management Section -->
                <div class="space-y-1">
                    <div class="px-4 py-2">
                        <span
                            class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{{ __('Gestión Administrativa') }}</span>
                    </div>
                    <a href="{{ route('permissions.index') }}"
                        class="flex items-center px-4 py-3 ml-4 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-lg transition-all duration-200">
                        <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        {{ __('Permisos') }}
                    </a>
                    <a href="{{ route('roles.index') }}"
                        class="flex items-center px-4 py-3 ml-4 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-lg transition-all duration-200">
                        <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        {{ __('Roles') }}
                    </a>
                    <a href="{{ route('users.index') }}"
                        class="flex items-center px-4 py-3 ml-4 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-lg transition-all duration-200">
                        <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        {{ __('Usuarios') }}
                    </a>
                    <a href="{{ route('empresas.index') }}"
                        class="flex items-center px-4 py-3 ml-4 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-lg transition-all duration-200">
                        <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {{ __('Empresas') }}
                    </a>
                </div>
            @endrole

            @role('Gerente')
                <a href="{{ route('manager.dashboard') }}"
                    class="flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-lg transition-all duration-200">
                    <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    {{ __('Inicio') }}
                </a>
            @endrole

            @role('Jefe de Area')
                <!-- Enhanced Mobile Menu -->
                <div :class="{ 'block': open, 'hidden': !open }"
                    class="hidden lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg">

                    <!-- Mobile Navigation Links -->
                    <a href="{{ route('jefe.dashboard') }}"
                        class="flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-lg transition-all duration-200">
                        <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M3 9.75L12 4l9 5.75v10.5a.75.75 0 01-.75.75H3.75a.75.75 0 01-.75-.75V9.75z" />
                        </svg>
                        {{ __('Inicio') }}
                    </a>

                    <a href="{{ route('gestorrequerimientog', ['empresaId' => session('empresa_id')]) }}"
                        class="flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-lg transition-all duration-200">
                        <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                        </svg>
                        {{ __('Requerimientos') }}
                    </a>

                    <a href="{{ route('gestorkanbangen', ['id' => session('empresa_id')]) }}"
                        class="flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-lg transition-all duration-200">
                        <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        {{ __('Planner') }}
                    </a>

                    <a href="{{ route('kanban', ['id' => session('empresa_id')]) }}"
                        class="flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-lg transition-all duration-200">
                        <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 6h4v12H4zM10 6h4v12h-4zM16 6h4v12h-4z" />
                        </svg>
                        {{ __('Kanban') }}
                    </a>

                    <a href="{{ route('gestorproyectos', ['id' => session('empresa_id')]) }}"
                        class="flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-lg transition-all duration-200">
                        <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M3 7h18M3 12h18M3 17h18" />
                        </svg>
                        {{ __('Proyectos') }}
                    </a>

                    <a href="{{ route('gestoreportesGen', ['id' => session('empresa_id')]) }}"
                        class="flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-lg transition-all duration-200">
                        <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 0h6m2 0a2 2 0 002-2V5a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2h2" />
                        </svg>
                        {{ __('Reportes') }}
                    </a>

                    <a href="{{ route('Tramites', ['empresaId' => session('empresa_id')]) }}"
                        class="flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-lg transition-all duration-200">
                        <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                        </svg>
                        {{ __('Trámites') }}
                    </a>

                    @if (session('empresa_id') == 1 || session('empresa_id') == 2)
                        <a href="{{ route('gestorconstruye', ['empresaId' => session('empresa_id')]) }}"
                            class="flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-lg transition-all duration-200">
                            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 8v4l3 3m6-9a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {{ __('Programas') }}
                        </a>
                    @endif

                    @if (session('empresa_id') == 3)
                        <a href="{{ route('mantenimientoCampo.rederigircampo', ['empresaId' => session('empresa_id')]) }}"
                            class="flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-lg transition-all duration-200">
                            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M5 13l4 4L19 7" />
                            </svg>
                            {{ __('Gestión Campo') }}
                        </a>
                    @endif
                </div>
            @endrole

            @role('trabajador')
                <a href="{{ route('trabajador.dashboard') }}"
                    class="flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-lg transition-all duration-200">
                    <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    {{ __('Inicio') }}
                </a>
                <a href="{{ route('kanban', ['id' => session('empresa_id')]) }}"
                    class="flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-lg transition-all duration-200">
                    <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                    </svg>
                    {{ __('Kanban') }}
                </a>
                <a href="{{ route('Tramites', ['empresaId' => session('empresa_id')]) }}"
                    class="flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-lg transition-all duration-200">
                    <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                    </svg>
                    {{ __('Trámites') }}
                </a>
            @endrole
        </div>

        <!-- Mobile User Section -->
        <div class="px-4 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div class="flex items-center space-x-4 mb-4">
                @if (Auth::user()->image_user)
                    <img src="{{ asset('/storage/profile/' . Auth::user()->image_user) }}" alt="profile"
                        class="w-12 h-12 rounded-full object-cover ring-2 ring-cyan-500/50">
                @else
                    <div
                        class="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-bold text-lg ring-2 ring-cyan-500/50">
                        {{ strtoupper(substr(Auth::user()->name, 0, 1)) }}
                    </div>
                @endif
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">{{ Auth::user()->name }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ Auth::user()->email }}</p>
                    <span
                        class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200 mt-1">
                        {{ Auth::user()->getRoleNames()->first() }}
                    </span>
                </div>
            </div>

            <div class="space-y-2">
                <a href="{{ route('profile.edit') }}"
                    class="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-lg transition-all duration-200">
                    <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {{ __('Mi Perfil') }}
                </a>

                <form method="POST" action="{{ route('logout') }}">
                    @csrf
                    <button type="submit"
                        class="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-all duration-200">
                        <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        {{ __('Cerrar Sesión') }}
                    </button>
                </form>
            </div>
        </div>
    </div>
</nav>

<!-- Custom CSS for extra small screens -->
<style>
    @media (min-width: 475px) {
        .xs\:block {
            display: block;
        }
    }

    /* Smooth transitions for dropdowns */
    .dropdown-enter {
        opacity: 0;
        transform: scale(0.95);
    }

    .dropdown-enter-active {
        opacity: 1;
        transform: scale(1);
        transition: opacity 200ms ease-out, transform 200ms ease-out;
    }

    .dropdown-exit {
        opacity: 1;
        transform: scale(1);
    }

    .dropdown-exit-active {
        opacity: 0;
        transform: scale(0.95);
        transition: opacity 150ms ease-in, transform 150ms ease-in;
    }

    /* Custom scrollbar for notifications */
    .notification-scroll::-webkit-scrollbar {
        width: 4px;
    }

    .notification-scroll::-webkit-scrollbar-track {
        background: transparent;
    }

    .notification-scroll::-webkit-scrollbar-thumb {
        background: #e5e7eb;
        border-radius: 2px;
    }

    .dark .notification-scroll::-webkit-scrollbar-thumb {
        background: #374151;
    }

    /* Backdrop blur support fallback */
    @supports not (backdrop-filter: blur(12px)) {
        nav {
            background: rgba(255, 255, 255, 0.98);
        }

        .dark nav {
            background: rgba(17, 24, 39, 0.98);
        }
    }
</style>
