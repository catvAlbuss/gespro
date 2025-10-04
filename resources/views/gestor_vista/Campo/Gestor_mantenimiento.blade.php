<x-app-layout>
    <div id="mantenimientoSystem" class="font-sans antialiased w-full"></div>

    <!-- Scripts Externos -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    <script type="text/javascript" src="https://unpkg.com/tabulator-tables/dist/js/tabulator.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/hyperformula/dist/hyperformula.full.min.js"></script>
    <script type="text/javascript"
        src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.20/jspdf.plugin.autotable.min.js"></script>
    <link rel="stylesheet" href="{{ asset('assets/css/tabulator_simple.min.css') }}">

    <!-- Inicialización de datos desde Laravel -->
    <script>
        window.APP_INIT = {
            id_mantenimiento: @json($mantenimientos->id_mantimiento),
            datamantemiento: {
                nombre_proyecto_mant: @json($mantenimientos->nombre_proyecto_mant),
                cotizacion_mant: @json($mantenimientos->cotizacion_mant),
                materiales_mant: @json($mantenimientos->materiales_mant),
                mano_obra_mant: @json($mantenimientos->mano_obra_mant),
                gastos_generales: @json($mantenimientos->gastos_generales),
                data_mantenimiento: @json($mantenimientos->data_mantenimiento),
            },
            csrfToken: @json(csrf_token()),
        };
    </script>

    <!-- Estilos personalizados -->
    <style>
        .fade-in {
            animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(10px);
            }

            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .tabulator .tabulator-header {
            @apply !bg-gray-100 dark: !bg-gray-700 !text-gray-800 dark: !text-gray-200;
        }
    </style>

</x-app-layout>
