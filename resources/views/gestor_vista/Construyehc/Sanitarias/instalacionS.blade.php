<x-app-layout data-bs-theme="dark">
    <link rel="stylesheet" href="{{ asset('assets/css/styles.css') }}">
    <link href="{{ asset('assets/css/tabulator_simple.min.css') }}" rel="stylesheet">
    <link rel="stylesheet" href="https://jsuites.net/v4/jsuites.css" type="text/css" />
    <link rel="stylesheet" href="https://bossanova.uk/jspreadsheet/v4/jexcel.css" type="text/css" />
    <link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css?family=Material+Icons" />

    <style>
        .tabulator-cell:not(.tabulator-editable):not(.tabulator-calcs>.tabulator-cell) {
            background-color: #f2f2f2 !important;
        }

        * {
            font-size: auto;
        }

        #pdfDoc * {
            font-size: 10px;
        }

        #pdfDoc .cisterna_alm *,
        #pdfDoc .tanque_alm * {
            box-sizing: content-box;
        }

        #pdfDoc input {
            all: unset;
            border: 1px dotted black;
            background-color: yellow;
        }

        .popover-body {
            color: red;
            background-color: lightgray;
        }

        .loading {
            cursor: wait;
            opacity: 0.5;
            pointer-events: none;
        }
    </style>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-gray-900 dark:text-gray-100">
                    <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div class="py-8 px-4 mx-auto max-w-2xl">
                            <h2 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white text-center">Instalación
                                Sanitarias</h2>
                            <form action="#" id="instSanitariasPDF">
                                <div class="grid gap-4 sm:grid-cols-4 sm:gap-6">
                                    <div class="sm:col-span-4">
                                        <label for="proyecto"
                                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">PROYECTO:</label>
                                        <input type="text" name="proyecto" id="proyecto"
                                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                            placeholder="Ingrese el nombre del proyecto"
                                            value='“MEJORAMIENTO DE LOS SERVICIOS DE EDUCACION INICIAL DE LA I.E.I.P N°358 CIUDAD DE CONTAMANA DISTRITO DE CONTAMANA-PROVINCIA DE UCAYALI-DEPARTAMENTO DE LORETO CON CUI. Nº 2484411"'
                                            required="">
                                    </div>
                                    <div class="w-full sm:col-span-2">
                                        <label for="ue"
                                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">UE:</label>
                                        <input type="text" name="ue" id="ue"
                                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                            placeholder="-" value="Municipalidad Provincial de Ucayali" required="">
                                    </div>
                                    <div class="w-full">
                                        <label for="fecha"
                                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">FECHA:</label>
                                        <input type="date" name="fecha" id="fecha"
                                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                            value="2024-07-10" required="">
                                    </div>
                                    <div class="w-full">
                                        <label for="cui"
                                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">CUI:</label>
                                        <input type="text" name="cui" id="cui"
                                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                            placeholder="Ingresar CUI" value="2484411" required="">
                                    </div>
                                    <div class="sm:col-span-2">
                                        <label for="CodigoModular"
                                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Cod-
                                            Modular</label>
                                        <input type="text" name="CodigoModular" id="CodigoModular"
                                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                            placeholder="12" value="0651216" required="">
                                    </div>
                                    <div class="sm:col-span-2">
                                        <label for="CodigoLocal"
                                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Cod.
                                            Local:</label>
                                        <input type="text" name="CodigoLocal" id="CodigoLocal"
                                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                            placeholder="12" value="390867" required="">
                                    </div>
                                    <div class="sm:col-span-4">
                                        <label for="ubicacion"
                                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">UBICACIÓN</label>
                                        <input type="text" name="ubicacion" id="ubicacion"
                                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                            placeholder="Ingresar Ubicacion"
                                            value="Loc. Contamana-Contamana-Ucayali-Loreto" required="">
                                    </div>
                                </div>
                                <button type="submit" formnovalidate="formnovalidate"
                                    class="inline-flex items-center px-5 py-2.5 mt-4 sm:mt-6 text-sm font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800">
                                    Descargar PDF
                                </button>
                        </div>
                        <div class="bg-white dark:bg-gray-50 overflow-hidden shadow-sm sm:rounded-lg">
                            <div class="p-6 text-gray-900 dark:text-gray-950">
                                <div id="pdfDoc"></div>
                            </div>
                        </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>

   <script type="text/javascript" src="https://unpkg.com/tabulator-tables@6.2.1/dist/js/tabulator.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://bossanova.uk/jspreadsheet/v4/jexcel.js"></script>
    <script src="https://jsuites.net/v4/jsuites.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js"
        integrity="sha384-IQsoLXl5PILFhosVNubq5LC7Qb9DXgDA9i+tQ8Zj3iwWAwPtgFTxbJ8NT4GN1R8p" crossorigin="anonymous">
    </script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.min.js"
        integrity="sha384-cVKIPhGWiC2Al4u+LWgxfKTRIcfu0JTxR+EQDz/bgldoEyl4H0zUF0QKbrJ0EcQF" crossorigin="anonymous">
    </script>
    <script type="module" src="{{ asset('assets/js/gestion_instalacion_sanitaria.js') }}"></script>
</x-app-layout>
