<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight text-dark">
            {{ __('Gestor Valorizacion') }}
        </h2>
    </x-slot>

    <input type="hidden" id="id_valorizacion" value="{{ $id_valorizacion }}">
    <!-- Campo input hidden donde almacenarás el JSON -->
    <input type="hidden" id="valorizacionData" value='@json($valorizaciones)' />

    <style>
        .tabulator-cell:not(.tabulator-editable):not(.tabulator-calcs>.tabulator-cell) {
            background-color: #f2f2f2 !important;
        }

        .addColumn {
            padding: 0px;
            width: 50px;
            margin-left: 10px;
            border-radius: 0px;
        }

        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .card-title {
            margin: 0;
            font-size: 1.25rem;
            font-weight: bold;
        }

        .tipo-select {
            width: 150px;
            /* Adjust width as needed */
        }
    </style>

    <br>
    <br>
    <section class="content">
        <div class="container-fluid">
            <div class="card card-info p-0 m-0">
                <!-- -------PRESUPUESTO------- -->
                <div class="card-header d-flex justify-content-between">
                    <h3 class="card-title">RESUMEN DEL PRESUPUESTO BASE</h3>
                    <button class="collapsible-btn ml-auto" onclick="displayToggle(event)" data-target="content0">ver /
                        ocultar</button>
                </div>
                <div class="card-body p-0 m-0" class="collapsible-content" id="content0">
                    <div class="card m-0">
                        <div class="card-body collapsible-content mb-3">
                            <div class="d-flex flex-column">
                                <div class="col-md-8 mx-auto">
                                    <h2 class="text-center">RESUMEN DEL PRESUPUESTO BASE</h2>
                                    <form action="#" id="resumen_presupuesto">
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="container-fluid d-none" id="valorizacion">
            <div id="ficha_tecnica" class="card card-info p-0 m-0">
            </div>
            <div id="metrado_diario" class="card card-info p-0 m-0">
                <!-- -------COTIZACIONES------- -->
                <div class="card-header d-flex justify-content-between">
                    <h3 class="card-title">METRADO DIARIO</h3>
                    <button class="collapsible-btn ml-auto" onclick="displayToggle(event)" data-target="content8">ver /
                        ocultar</button>
                </div>
                <!-- Tablas interiores -->
                <div class="d-none card-body p-0" class="collapsible-content" id="content8">
                    <!-- Masa o peso -->
                    <div class="card m-0">
                        <div class="card-body collapsible-content mb-3">
                            <div class="d-flex flex-column">
                                <div class="row">
                                    <div class="col-md-12 justify-content-center mb-3">
                                        <div id="tbl_metrado_diario"></div>
                                    </div>
                                    <div class="col-sm-12 text-right">
                                        <button type="button" class="btn btn-primary"
                                            id="generarMetrado">METRADO</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="metrado" class="card card-info p-0 m-0">
            </div>
            <div id="desagregado" class="card card-info p-0 m-0">
            </div>
            <div class="card card-info p-0 m-0">
                <!-- -------COTIZACIONES------- -->
                <div class="card-header d-flex justify-content-between">
                    <h3 class="card-title">PROGRAMACION</h3>
                    <button class="collapsible-btn ml-auto" onclick="displayToggle(event)" data-target="content4">ver /
                        ocultar</button>
                </div>
                <!-- Tablas interiores -->
                <div class="d-none card-body p-0" class="collapsible-content" id="content4">
                    <!-- Masa o peso -->
                    <div class="card m-0">
                        <div class="card-body collapsible-content mb-3">
                            <div class="d-flex flex-column">
                                <div class="row">
                                    <div class="col-md-12 justify-content-center mb-3">
                                        <div id="tbl_programacion"></div>
                                    </div>
                                    <div class="col-sm-12 text-right">
                                        <button type="button" class="btn btn-primary" id="guardar">GUARDAR</button>
                                        <button type="submit" class="btn btn-primary"
                                            id="generar_grafico">GRAFICO</button>
                                    </div>
                                    <div class="col-md-12">
                                        <canvas id="chart_programacion"></canvas>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <script>
        function displayToggle(event) {
            const targetId = event.target.getAttribute("data-target");
            document.getElementById(targetId)?.classList.toggle("d-none");
        }
    </script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js"
        integrity="sha384-IQsoLXl5PILFhosVNubq5LC7Qb9DXgDA9i+tQ8Zj3iwWAwPtgFTxbJ8NT4GN1R8p" crossorigin="anonymous">
    </script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.min.js"
        integrity="sha384-cVKIPhGWiC2Al4u+LWgxfKTRIcfu0JTxR+EQDz/bgldoEyl4H0zUF0QKbrJ0EcQF" crossorigin="anonymous">
    </script>
    <link rel="stylesheet" href="{{ asset('assets/css/tabulator_simple.min.css') }}">
    <script src="https://cdn.jsdelivr.net/npm/hyperformula/dist/hyperformula.full.min.js"></script>
    <script type="text/javascript" src="https://unpkg.com/tabulator-tables/dist/js/tabulator.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js"></script>
    <script type="module" src="{{ asset('assets/js/gestion_valorizacion.js') }}"></script>
</x-app-layout>
