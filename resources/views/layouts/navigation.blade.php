<nav x-data="{ open: false }" class="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
    <!-- Primary Navigation Menu -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
            <div class="flex">
                <!-- Logo -->
                <div class="shrink-0 flex items-center">
                    @role('Administrador')
                        <a href="{{ route('admin.dashboard') }}">
                            <x-application-logo class="block h-9 w-auto fill-current text-gray-800 dark:text-gray-200" />
                        </a>
                    @endrole

                    @role('Gerente')
                        <a href="{{ route('manager.dashboard') }}">
                            <x-application-logo class="block h-9 w-auto fill-current text-gray-800 dark:text-gray-200" />
                        </a>
                    @endrole

                    @role('administradores')
                        <a href="{{ route('administradores.dashboard') }}">
                            <x-application-logo class="block h-9 w-auto fill-current text-gray-800 dark:text-gray-200" />
                        </a>
                    @endrole

                    @role('logistico')
                        <a href="{{ route('logistico.dashboard') }}">
                            <x-application-logo class="block h-9 w-auto fill-current text-gray-800 dark:text-gray-200" />
                        </a>
                    @endrole

                    @role('Jefe de Area')
                        <a href="{{ route('jefe.dashboard') }}">
                            <x-application-logo class="block h-9 w-auto fill-current text-gray-800 dark:text-gray-200" />
                        </a>
                    @endrole

                    @role('trabajador')
                        <a href="{{ route('trabajador.dashboard') }}">
                            <x-application-logo class="block h-9 w-auto fill-current text-gray-800 dark:text-gray-200" />
                        </a>
                    @endrole
                </div>
                <!-- Navigation Links -->
                <div class="hidden sm:flex sm:space-x-8 sm:-my-px sm:ms-10 sm:flex-wrap">
                    @role('Administrador')
                        <x-nav-link :href="route('admin.dashboard')" :active="request()->routeIs('admin.dashboard')">
                            {{ __('Inicio') }}
                        </x-nav-link>
                        <div class="hidden sm:flex sm:items-center sm:ms-6">
                            <x-dropdown align="right" width="48">
                                <x-slot name="trigger">
                                    <button
                                        class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none transition ease-in-out duration-150">
                                        <div>{{ __('Gestion del Adm') }}</div>
                                        <div class="ms-1">
                                            <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20">
                                                <path fill-rule="evenodd"
                                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                    clip-rule="evenodd" />
                                            </svg>
                                        </div>
                                    </button>
                                </x-slot>
                                <x-slot name="content">
                                    <x-dropdown-link :href="route('permissions.index')" :active="request()->routeIs('permissions.*')">
                                        {{ __('Gestion de Permissions') }}
                                    </x-dropdown-link>
                                    <x-dropdown-link :href="route('roles.index')" :active="request()->routeIs('roles.*')">
                                        {{ __('Gestion de Roles') }}
                                    </x-dropdown-link>
                                    <x-dropdown-link :href="route('users.index')" :active="request()->routeIs('users.*')">
                                        {{ __('Gestion de Usuario') }}
                                    </x-dropdown-link>
                                    <x-dropdown-link :href="route('empresas.index')" :active="request()->routeIs('empresas.*')">
                                        {{ __('Gestion de Empresa') }}
                                    </x-dropdown-link>
                                    {{-- <x-dropdown-sub label="{{ __('Gestion Adm') }}" :links="[
                                        ['route' => 'permissions.index', 'label' => __('Gestion Permisos')],
                                        ['route' => 'roles.index', 'label' => __('Gestion Roles')],
                                        ['route' => 'users.index', 'label' => __('Gestion usuario')],
                                    ]" /> --}}
                                </x-slot>
                            </x-dropdown>
                        </div>
                    @endrole

                    @role('Gerente')
                        <x-nav-link :href="route('manager.dashboard')" :active="request()->routeIs('manager.dashboard')">
                            {{ __('Inicio') }}
                        </x-nav-link>
                    @endrole

                    @role('administradores')
                        <x-nav-link :href="route('administradores.dashboard')" :active="request()->routeIs('admin.dashboard')">
                            {{ __('Inicio') }}
                        </x-nav-link>
                       
                    @endrole

                    @role('logistico')
                        <x-nav-link :href="route('logistico.dashboard')" :active="request()->routeIs('admin.dashboard')">
                            {{ __('Inicio') }}
                        </x-nav-link>
                    @endrole

                    @role('Jefe de Area')
                        <x-nav-link :href="route('jefe.dashboard')" :active="request()->routeIs('admin.dashboard')">
                            {{ __('Inicio') }}
                        </x-nav-link>
                        <x-nav-link :href="route('gestorrequerimientog', ['empresaId' => session('empresa_id')])">
                            {{ __('Requerimientos') }}
                        </x-nav-link>
                        <x-nav-link :href="route('gestorkanbangen', ['id' => session('empresa_id')])">
                            {{ __('Planner') }}
                        </x-nav-link>
                        <x-nav-link :href="route('gestor-tareasRev', ['empresaId' => session('empresa_id')])">
                            {{ __('Tareas Trabajador') }}
                        </x-nav-link>
                         <x-nav-link :href="route('gestorproyectos', ['id' => session('empresa_id')])">
                            {{ __('Proyectos') }}
                        </x-nav-link>
                        <x-nav-link :href="route('gestoreportesGen', ['id' => session('empresa_id')])">
                            {{ __('Reportes General') }}
                        </x-nav-link>
                        <x-nav-link :href="route('gestortareasphha', ['id' => session('empresa_id')])">
                            {{ __('kanban') }}
                        </x-nav-link>
                        <x-nav-link :href="route('gestor_reports_proyectos', ['empresaId' => session('empresa_id')])">
                            {{ __('Reporte de proyectos') }}
                        </x-nav-link>
                         <?php if (session('empresa_id') == 1 || session('empresa_id') == 2): ?>
                        <x-nav-link :href="route('gestorconstruye', ['empresaId' => session('empresa_id')])">
                            {{ __('Programas') }}
                        </x-nav-link>
                        <?php endif; ?>
                        <?php if (session('empresa_id') == 3): ?>
                        <x-nav-link :href="route('mantenimientoCampo.rederigircampo', ['empresaId' => session('empresa_id')])">
                            {{ __('Gestion Campo') }}
                        </x-nav-link>
                        <?php endif; ?>
                    @endrole

                    @role('trabajador')
                        <x-nav-link :href="route('trabajador.dashboard')" :active="request()->routeIs('admin.dashboard')">
                            {{ __('Inicio') }}
                        </x-nav-link>
                         <x-nav-link :href="route('gestortareasphha', ['id' => session('empresa_id')])">
                            {{ __('kanban') }}
                        </x-nav-link>
                        <?php if (session('empresa_id') == 1 || session('empresa_id') == 2): ?>
                        <x-nav-link :href="route('gestorconstruye', ['empresaId' => session('empresa_id')])">
                            {{ __('Programas') }}
                        </x-nav-link>
                        <?php endif; ?>
                    @endrole
                </div>
            </div>

            <!-- Settings Dropdown -->
            <!-- Settings Dropdown -->
            <div class="hidden sm:flex sm:items-center sm:ms-6">
                <x-notification-button />
                <x-dropdown align="right" width="48" class="ml-5">
                    <x-slot name="trigger">
                        @if (Auth::user()->image_user)
                            <img id="avatarButton" type="button" data-dropdown-toggle="userDropdown"
                                data-dropdown-placement="bottom-start" class="w-10 h-10 rounded-full cursor-pointer"
                                src="{{ asset('/storage/profile/' . Auth::user()->image_user) }}" alt="profile_image">
                        @endif
                    </x-slot>

                    <x-slot name="content">
                        <div class="text-center px-4 py-3 text-sm text-gray-900 dark:text-white">
                            <div>{{ Auth::user()->name }}</div>
                            <div class="font-medium truncate">{{ Auth::user()->email }}</div>
                        </div>
                        <x-dropdown-link :href="route('profile.edit')">
                            {{ __('Perfil') }}
                        </x-dropdown-link>

                        <!-- Authentication -->
                        <form method="POST" action="{{ route('logout') }}">
                            @csrf

                            <x-dropdown-link :href="route('logout')"
                                onclick="event.preventDefault();
                                                this.closest('form').submit();">
                                {{ __('Salir') }}
                            </x-dropdown-link>
                        </form>
                    </x-slot>
                </x-dropdown>
            </div>

            <!-- Hamburger -->
            <div class="-me-2 flex items-center sm:hidden">
                <button @click="open = ! open"
                    class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-900 focus:text-gray-500 dark:focus:text-gray-400 transition duration-150 ease-in-out">
                    <svg class="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                        <path :class="{ 'hidden': open, 'inline-flex': !open }" class="inline-flex"
                            stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 6h16M4 12h16M4 18h16" />
                        <path :class="{ 'hidden': !open, 'inline-flex': open }" class="hidden" stroke-linecap="round"
                            stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    </div>

    <!-- Responsive Navigation Menu -->
    <div :class="{ 'block': open, 'hidden': !open }" class="hidden sm:hidden">
        <div class="pt-2 pb-3 space-y-1">
            @role('Administrador')
                <x-responsive-nav-link :href="route('admin.dashboard')" :active="request()->routeIs('admin.dashboard')">
                    {{ __('Dashboard') }}
                </x-responsive-nav-link>
            @endrole
            @role('Gerente')
                <x-responsive-nav-link :href="route('manager.dashboard')" :active="request()->routeIs('manager.dashboard')">
                    {{ __('Inicio') }}
                </x-responsive-nav-link>
            @endrole
            @role('Jefes de Area')
                <x-responsive-nav-link :href="route('jefe.dashboard')" :active="request()->routeIs('jefe.dashboard')">
                    {{ __('Inicio') }}
                </x-responsive-nav-link>
            @endrole
        </div>

        <!-- Responsive Settings Options -->
        <div class="pt-4 pb-1 border-t border-gray-200 dark:border-gray-600">
            <div class="px-4">
                <div class="font-medium text-base text-gray-800 dark:text-gray-200">{{ Auth::user()->name }}</div>
                <div class="font-medium text-sm text-gray-500">{{ Auth::user()->email }}</div>
            </div>

            <div class="mt-3 space-y-1">
                @role('Administrador')
                    <x-responsive-nav-link :href="route('profile.edit')">
                        {{ __('Profile') }}
                    </x-responsive-nav-link>
                    <x-responsive-nav-link :href="route('permissions.index')">
                        {{ __('Permisos') }}
                    </x-responsive-nav-link>
                    <x-responsive-nav-link :href="route('roles.index')">
                        {{ __('Roles') }}
                    </x-responsive-nav-link>
                    <x-responsive-nav-link :href="route('users.index')">
                        {{ __('Usuarios') }}
                    </x-responsive-nav-link>
                    <x-responsive-nav-link :href="route('empresas.index')">
                        {{ __('Empresas') }}
                    </x-responsive-nav-link>
                @endrole

                @role('Jefe de Area')
                    <x-responsive-nav-link :href="route('jefe.dashboard')">
                        {{ __('Inicio') }}
                    </x-responsive-nav-link>
                    <x-responsive-nav-link :href="route('gestorrequerimientog', ['empresaId' => session('empresa_id')])">
                        {{ __('Requerimiento') }}
                    </x-responsive-nav-link>
                    <x-responsive-nav-link :href="route('gestor-tareasRev', ['empresaId' => session('empresa_id')])">
                        {{ __('Tareas Trabajadores') }}
                    </x-responsive-nav-link>
                    <x-responsive-nav-link :href="route('gestor_reports_proyectos', ['empresaId' => session('empresa_id')])">
                        {{ __('Reporte Proyectos') }}
                    </x-responsive-nav-link>
                @endrole
                <!-- Authentication -->
                <form method="POST" action="{{ route('logout') }}">
                    @csrf

                    <x-responsive-nav-link :href="route('logout')"
                        onclick="event.preventDefault();
                                        this.closest('form').submit();">
                        {{ __('Cerrar Session') }}
                    </x-responsive-nav-link>
                </form>
            </div>
        </div>
    </div>
</nav>
