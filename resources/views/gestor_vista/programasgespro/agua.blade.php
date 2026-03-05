<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Sistema de Cálculo de Agua') }}
        </h2>
        <p class="text-gray-200">Gestión integral de sistemas de agua</p>
    </x-slot>

    <!-- CSS Libraries -->
    <link href="https://unpkg.com/tabulator-tables@6.3.1/dist/css/tabulator.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
        integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg=="
        crossorigin="anonymous" referrerpolicy="no-referrer" />
    <!-- JavaScript Libraries -->
    <script type="text/javascript" src="https://unpkg.com/tabulator-tables@6.3.1/dist/js/tabulator.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/echarts@5.5.0/dist/echarts.min.js"></script>

    <style>
        .tabulator-modern {
            border: none;
            font-size: 14px;
        }

        .tabulator-modern .tabulator-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
        }

        .tabulator-modern .tabulator-col {
            background: transparent;
            border: none;
            border-right: 1px solid rgba(255, 255, 255, 0.2);
        }

        .tabulator-modern .tabulator-col-title {
            color: white;
            font-weight: 600;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .tabulator-modern .tabulator-row {
            border-bottom: 1px solid #e2e8f0;
        }

        .tabulator-modern .tabulator-row:hover {
            background-color: #f8fafc;
        }

        .tabulator-modern .tabulator-cell {
            border: none;
            border-right: 1px solid #e2e8f0;
            padding: 12px 8px;
        }

        .tabulator-modern .tabulator-cell:last-child {
            border-right: none;
        }

        .tabulator-modern .tabulator-cell input {
            width: 100%;
            padding: 4px 8px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            font-size: 13px;
        }

        .tabulator-modern .tabulator-cell input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        .delete-btn:hover {
            transform: scale(1.05);
        }

        /* Evitar scroll horizontal innecesario */
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }

        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }

        /* Loading animation */
        .pulse-loader {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid rgba(59, 130, 246, 0.3);
            border-radius: 50%;
            border-top-color: #3b82f6;
            animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }

        /* Sistema de agua específico */
        .agua-system-container {
            position: relative;
            min-height: 400px;
        }

        /* Debug info (remover en producción) */
        .debug-info {
            position: fixed;
            bottom: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 8px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 1000;
            display: none;
            /* Ocultar en producción */
        }
    </style>

    <!-- Contenedor principal -->
    <div id="agua-system-app" data-module="pages/calc-agua/AguaSystem" class="agua-system-container w-full">
        <!-- Debug Info (opcional, para desarrollo) -->
        <div class="debug-info" style="display: none;">
            Sistema de Agua convertido a React
        </div>
    </div>

    <!-- Vite ya maneja la carga de scripts, no necesitamos script tag aquí -->
</x-app-layout>
