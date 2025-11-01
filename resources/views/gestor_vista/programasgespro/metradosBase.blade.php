<x-app-layout>
    <!-- Tabulator CSS -->
    <link href="https://unpkg.com/tabulator-tables@5.5.0/dist/css/tabulator.min.css" rel="stylesheet">

    <!-- Vue 3 -->
    <script src="https://unpkg.com/vue@3.3.4/dist/vue.global.prod.js"></script>

    <!-- Tabulator JS -->
    <script src="https://unpkg.com/tabulator-tables@5.5.0/dist/js/tabulator.min.js"></script>

    <!-- HyperFormula -->
    <script src="https://cdn.jsdelivr.net/npm/hyperformula/dist/hyperformula.full.min.js"></script>

    <!-- Math.js -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/11.11.0/math.min.js"></script>

    <!-- Arquero -->
    <script src="https://cdn.jsdelivr.net/npm/arquero@5.2.0/dist/arquero.min.js"></script>

    <style>
        .tabulator {
            font-size: 13px;
            border: 1px solid #e5e7eb;
        }

        .tabulator-row {
            min-height: 35px;
        }

        .tabulator-cell {
            padding: 6px 8px;
        }

        .tabulator-header {
            background-color: #f3f4f6;
            border-bottom: 2px solid #d1d5db;
        }

        .btn-action {
            cursor: pointer;
            transition: all 0.2s;
        }

        .btn-action:hover {
            transform: scale(1.1);
        }

        .tabulator .tabulator-cell.wrap-text {
            white-space: normal !important;
            word-wrap: break-word;
            overflow-wrap: break-word;
            line-height: 1.4;
            min-height: 20px;
            max-height: 100px;
            /* Limit cell height */
            overflow-y: auto;
            /* Add scrollbar for overflow */
        }
    </style>
    {{-- <div class="w-full" id="metradotableSystem"></div> --}}
</x-app-layout>
