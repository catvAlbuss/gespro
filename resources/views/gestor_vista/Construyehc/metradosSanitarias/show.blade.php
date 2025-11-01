<x-app-layout>
    <link rel="stylesheet" href="{{ asset('assets/css/tabulator_simple.min.css') }}">

    <!-- CDN -->
    <script type="text/javascript" src="https://unpkg.com/tabulator-tables/dist/js/tabulator.min.js"></script>
    {{-- <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script> --}}
    <script src="https://cdn.jsdelivr.net/npm/hyperformula@2.7.0/dist/hyperformula.full.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/arquero@5.2.0/dist/arquero.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    {{-- Librerías no React --}}
    <script src="https://unpkg.com/tabulator-tables/dist/js/tabulator.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/hyperformula@2.7.0/dist/hyperformula.full.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/arquero@5.2.0/dist/arquero.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.3.0/exceljs.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.1/xlsx.full.min.js"></script>
    <input type="hidden" name="id_sanitarias" id="id_sanitarias" value="{{ $metradosanitarias->idmetradosan }}">
    <input type="hidden" name="cantidadModulo" id="cantidadModulo" value="{{ $metradosanitarias->cantidadModulo }}">
    <input type="hidden" id="costos" value='@json($costos)'>
    <!-- Tu JS personalizado -->
    <style>
        .tabulator {
            font-size: 13px;
            border: 1px solid #e5e7eb;
        }

        .tabulator-header {
            background-color: #f3f4f6;
            border-bottom: 2px solid #d1d5db;
        }

        .tabulator .tabulator-cell.wrap-text {
            white-space: normal !important;
            word-wrap: break-word;
            line-height: 1.4;
            min-height: 20px;
            max-height: 100px;
            overflow-y: auto;
        }

        /* Celdas editables/calculables */
        .tabulator .tabulator-cell.bg-yellow-100 {
            background-color: #fef3c7 !important;
        }

        /* Resultado del cálculo */
        .tabulator .tabulator-cell.bg-blue-100 {
            background-color: #dbeafe !important;
            font-weight: 600;
        }

        /* Total */
        .tabulator .tabulator-cell.bg-green-100 {
            background-color: #dcfce7 !important;
            font-weight: bold;
        }

        /* Fila seleccionada */
        .tabulator-row.tabulator-selected {
            background-color: #e0e7ff !important;
        }
    </style>

    <div id="metradoSanitarias" data-module="metrados/metrado_sanitarias" class="p-4 grid grid-cols-1 gap-4"></div>
    @vite(['resources/js/app.js'])
</x-app-layout>
