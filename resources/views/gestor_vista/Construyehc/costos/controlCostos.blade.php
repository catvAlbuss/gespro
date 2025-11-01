<x-app-layout>
    <div class="" id="SystemControlCostos" data-module="costos/main"></div>

    {{-- Inyectar los datos necesarios para el frontend (sin exponerlos en la URL) --}}
    <script>
        window.APP_INIT = {
            id: @json($id),
            costos: @json($costos),
            presupuestosIds: @json($presupuestosIds),
            metradoIds: @json($metradoIds),
            cronogramaIds: @json($conogramaIds),
            ettpIds: @json($ettpIds),
            csrfToken: @json(csrf_token()),

            routes: {
                metradoarquitectura: "{{ url('/metrados/arquitectura') }}",
                metradoestructuras: "{{ url('/metrados/estructuras') }}",
                metradosanitarias: "{{ url('/metrados/sanitarias') }}",
                metradoelectricas: "{{ url('/metrados/electricas') }}",
                metradocomunicacion: "{{ url('/metrados/comunicacion') }}",
                metradogas: "{{ url('/metrados/gas') }}",

                presupuestos: "{{ url('/presupuestos') }}",

                cronogramageneral: "{{ url('/cronogramas') }}",
                cronogramavalorizado: "{{ url('/cronogramavalorizado') }}",

                especificacionestecnicas: "{{ url('/especificaciones') }}",
            }
        }
    </script>
</x-app-layout>
