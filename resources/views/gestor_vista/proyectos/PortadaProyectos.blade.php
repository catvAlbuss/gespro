<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Gestor Proyectos') }}
        </h2>
    </x-slot>

    <div id="appProyectos" class="font-sans antialiased">
        {{-- ======================= SCRIPTS & STYLES ======================= --}}
        <link rel="stylesheet" href="https://cdn.datatables.net/2.1.8/css/dataTables.tailwindcss.css">
        <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
        <script src="https://cdn.tailwindcss.com/"></script>
        <script src="https://cdn.datatables.net/2.1.8/js/dataTables.js"></script>
        <script src="https://cdn.datatables.net/2.1.8/js/dataTables.tailwindcss.js"></script>
        <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>

        {{-- ======================= MAIN CONTENT ======================= --}}
        <div class="py-12">
            <div class="container mx-auto w-full">
                <!-- El contenido será renderizado por Vue -->
            </div>
        </div>

        {{-- ======================= DATA INITIALIZATION ======================= --}}
        @php
            $permisos = auth()->user()->roles->first()->permissions;
            $canManageTasks =
                $permisos->contains('name', 'Jefe') ||
                $permisos->contains('name', 'Administrador') ||
                $permisos->contains('name', 'Administrativo');
            $permisosUser = $permisos->contains('name', 'Jefe') || $permisos->contains('name', 'Administrador');
        @endphp

        <script>
            window.APP_INIT = {
                empresaId: @json($empresaId),
                trabajadorId: @json(Auth::user()->id),
                rolUser: @json($permisos->pluck('name')->contains('Jefe') || Auth::user()->id == 16),
                canManageTasks: @json($canManageTasks),
                permisosUser: @json($permisosUser),
                csrfToken: @json(csrf_token()),
                proyectos: @json($proyectos),
                routes: {
                    store: @json(route('proyectos.store')),
                    update: @json(route('proyectos.update', ':id')),
                    destroy: @json(route('proyectos.destroy', ':id')),
                    edit: @json(route('proyectos.edit', ':id')),
                    redirect: @json(route('redirect_proyecto', ['id' => ':id', 'empresa_id' => ':empresa_id'])),
                    reportes: @json(route('gestor_reports_proyectos', ['empresaId' => $empresaId])) //
                }
            };
        </script>

        {{-- ======================= VUE SCRIPTS ======================= --}}
        @vite(['resources/js/proyectos/portadaproyectos.js'])
    </div>
</x-app-layout>
