<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Gestion DML') }}
        </h2>
    </x-slot>

    <style>
        .card-primary:not(.card-outline)>.card-header {
            background-color: #1a2128;
        }

        .card-info:not(.card-outline)>.card-header {
            background-color: #1a2128;
        }

        #page {
            width: 210mm;
            box-shadow: 0 0 0.5cm rgba(0, 0, 0, 0.5);
            margin: 0 auto;
            padding-left: 30mm;
            padding-right: 30mm;
            padding-top: 20mm;
            padding-bottom: 25mm;
            box-sizing: border-box;
        }
    </style>

    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.5.4/dist/umd/popper.min.js"></script>
    <link href="https://unpkg.com/tabulator-tables@6.2.1/dist/css/tabulator.min.css" rel="stylesheet">
    <script type="text/javascript" src="https://unpkg.com/tabulator-tables@6.2.1/dist/js/tabulator.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script type="module" src="{{ asset('assets/js/memc.js') }}" defer></script>
    {{-- <link rel="stylesheet" href="{{ asset('assets/css/stylev.css') }}"> --}}

    <div class="py-6">
        <div class="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div class="p-6">
                    <!-- Contenedor principal flex -->
                    <div class="flex flex-col lg:flex-row gap-6">
                        <!-- Formulario - lado izquierdo -->
                        <div class="w-full lg:w-2/5">
                            <form id="datos_generales" method="POST" class="space-y-6">
                                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md">
                                    <div class="bg-gray-900 text-white px-4 py-3 rounded-t-lg">
                                        <h3 class="text-lg font-medium">Datos Generales</h3>
                                    </div>
                                    <div class="p-4 space-y-4">
                                        <!-- Grid para inputs -->
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <!-- Código Modular -->
                                            <div>
                                                <label class="block text-sm font-medium text-gray-950 dark:text-gray-50">
                                                    Código(s) Modular(es)
                                                </label>
                                                <input type="text" 
                                                    class="mt-1 block w-full rounded-md text-gray-950 dark:text-gray-50 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                                                    id="codigo_modular"
                                                    name="codigo_modular">
                                            </div>
                                            
                                            <!-- Continuar el mismo patrón para los demás inputs -->
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Nombre Proyecto
                                                </label>
                                                <input type="text" 
                                                    class="mt-1 block w-full rounded-md text-gray-950 dark:text-gray-50 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                                                    id="nombre_del_proyecto"
                                                    name="nombre_del_proyecto">
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Unidad Ejecutora
                                                </label>
                                                <input type="text" 
                                                    class="mt-1 block w-full rounded-md text-gray-950 dark:text-gray-50 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                                                    id="unidad_ejecutora"
                                                    name="unidad_ejecutora">
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Nombre de la IE
                                                </label>
                                                <input type="text" 
                                                    class="mt-1 block w-full rounded-md text-gray-950 dark:text-gray-50 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                                                    id="nombre_de_la_ie"
                                                    name="nombre_de_la_ie">
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Codigo Local
                                                </label>
                                                <input type="text" 
                                                    class="mt-1 block w-full rounded-md text-gray-950 dark:text-gray-50 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                                                    id="codigo_de_local"
                                                    name="codigo_de_local">
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Código Unificado
                                                </label>
                                                <input type="text" 
                                                    class="mt-1 block w-full rounded-md text-gray-950 dark:text-gray-50 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                                                    id="codigo_cui"
                                                    name="codigo_cui">
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Código SNIP
                                                </label>
                                                <input type="text" 
                                                    class="mt-1 block w-full rounded-md text-gray-950 dark:text-gray-50 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                                                    id="codigo_snip"
                                                    name="codigo_snip">
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Departamento
                                                </label>
                                                <select class="mt-1 block w-full rounded-md text-gray-950 dark:text-gray-50 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                                                    id="region"
                                                    name="region">
                                                </select>
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Provincia
                                                </label>
                                                <select class="mt-1 block w-full rounded-md text-gray-950 dark:text-gray-50 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                                                    id="provincia"
                                                    name="provincia">
                                                </select>
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Distrito
                                                </label>
                                                <select class="mt-1 block w-full rounded-md text-gray-950 dark:text-gray-50 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                                                    id="distrito"
                                                    name="distrito">
                                                </select>
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Localidad
                                                </label>
                                                <input type="text" 
                                                    class="mt-1 block w-full rounded-md text-gray-950 dark:text-gray-50 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                                                    id="centro_poblado"
                                                    name="centro_poblado">
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Logo de Encabezado
                                                </label>
                                                <input type="file" 
                                                    class="mt-1 block w-full rounded-md text-gray-950 dark:text-gray-50 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                                                    id="logo"
                                                    name="logo">
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Introducción
                                                </label>
                                                <select class="mt-1 block w-full rounded-md text-gray-950 dark:text-gray-50 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                                                    id="intro"
                                                    name="intro">
                                                    <option value="sector_privado">Sector Privado</option>
                                                    <option value="educacion">Educación</option>
                                                    <option value="salud">Salud</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Responsable
                                                </label>
                                                <input type="text" 
                                                    class="mt-1 block w-full rounded-md text-gray-950 dark:text-gray-50 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                                                    id="responsable"
                                                    name="responsable">
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Select M.S
                                                </label>
                                                <select class="mt-1 block w-full rounded-md text-gray-950 dark:text-gray-50 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                                                    id="Select"
                                                    name="Select">
                                                    <option value="e_basico">E.basico</option>
                                                    <option value="e_superior">E.Superior</option>
                                                    <option value="salud">Salud</option>
                                                    <option value="comercio">Comercio</option>
                                                    <option value="vivienda">Vivienda</option>
                                                    <option value="hospedaje">Hospedaje</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Imagen Sello y Firma
                                                </label>
                                                <input type="file" 
                                                    class="mt-1 block w-full rounded-md text-gray-950 dark:text-gray-50 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                                                    id="sello_firma"
                                                    name="sello_firma">
                                            </div>
                                        </div>

                                        <!-- Botón submit -->
                                        <div class="mt-4">
                                            <button type="submit" 
                                                class="w-full bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600">
                                                Generar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <!-- Preview PDF - lado derecho -->
                        <div class="w-full lg:w-3/5">
                            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md h-full">
                                <div class="bg-gray-900 text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
                                    <h3 class="text-lg font-medium">Editor</h3>
                                    <div class="space-x-2">
                                        <button id="anterior" 
                                            class="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600">
                                            Anterior
                                        </button>
                                        <button id="siguiente" 
                                            class="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600">
                                            Siguiente
                                        </button>
                                    </div>
                                </div>
                                
                                <div class="p-4">
                                    <!-- Vista previa PDF -->
                                    <div id="page" class="bg-white shadow-lg mx-auto">
                                        <div></div>
                                    </div>

                                    <!-- Botón descargar -->
                                    <form id="generate_pdf" method="POST" class="mt-4">
                                        <button type="submit" 
                                            class="w-full bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600">
                                            Descargar Documento
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Estilos adicionales -->
    <style>
        #page {
            width: 100%;
            max-width: 210mm;
            min-height: 297mm;
            padding: 20mm 30mm;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 0.5cm rgba(0,0,0,0.5);
        }

        @media (max-width: 1024px) {
            #page {
                padding: 10mm 15mm;
            }
        }
    </style>
</x-app-layout>
