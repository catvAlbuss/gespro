<x-app-layout>
    <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
    <!-- jsPDF + AutoTable -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js"></script>

    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Gestión de Reportes Mensuales') }}
        </h2>
    </x-slot>

    <div class="py-6 px-4 sm:px-6 lg:px-8">
        <div id="reportes-app-container" data-module="contabilidad/reporteskanban"></div>
    </div>

    <script>
        window.APP_INIT = {
            empresaId: {{ $empresaId }},
            trabajadores: @json($usuarios),
            proyectos: @json($proyectos),
            csrfToken: @json(csrf_token()),
            Logo: {
                1: "{{ asset('storage/avatar_empresa/logo_rizabal.png') }}",
                2: "{{ asset('storage/avatar_empresa/logo_contruyehco.png') }}",
                3: "{{ asset('storage/avatar_empresa/logo_sevenheart.png') }}",
                4: "{{ asset('storage/avatar_empresa/logo_dml.png') }}",
                5: "{{ asset('storage/avatar_empresa/logo_hyperium.png') }}"
            }
        };
    </script>
</x-app-layout>
