<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('PROYECTO ') }} {{ $nombre_proyecto }}
        </h2>
        <h1 id="procentaje_Total"></h1>
    </x-slot>

    <script src="https://docs.dhtmlx.com/gantt/codebase/dhtmlxgantt.js?v=6.0.0"></script>
    <link rel="stylesheet" href="https://docs.dhtmlx.com/gantt/codebase/dhtmlxgantt.css?v=6.0.0">
    <script src="https://code.jquery.com/jquery-1.7.1.min.js?v=8.0.3"></script>

    <!-- Moment.js -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js"></script>

    <!-- Moment Timezone.js -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/moment-timezone/0.5.34/moment-timezone-with-data.min.js"></script>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <input type="hidden" id="id_proyecto" value="{{ $id }}">
            <input type="hidden" id="id_empresa" class="text-gray-800" value="{{ $empresa_id }}">
            <input type="hidden" id="nombre_proyecto" class="text-gray-800" value="{{ $nombre_proyecto }}">
            <input type="hidden" id="documento_proyecto" class="text-gray-800" value="{{ $documento_proyecto }}">

            <!-- Inputs ocultos para las tareas -->
            @foreach ($tareas as $tarea)
                <input type="hidden" class="tarea text-gray-800" id="tareas" value="{{ json_encode($tarea) }}">
            @endforeach

            <!-- Inputs ocultos para los trabajadores -->
            @foreach ($trabajadores as $trabajador)
                <input type="hidden" class="trabajador text-gray-800" id="trabajador"
                    value="{{ json_encode($trabajador) }}">
            @endforeach

            <div class="overflow-x-auto">
                <style>
                    html,
                    body {
                        padding: 0px;
                        margin: 0px;
                        height: 100%;
                    }

                    #gantt_here {
                        width: 100%;
                        height: 800px;
                        height: calc(100vh - 52px);
                    }

                    .gantt_grid_scale .gantt_grid_head_cell,
                    .gantt_task .gantt_task_scale .gantt_scale_cell {
                        font-weight: bold;
                        font-size: 14px;
                        color: rgba(0, 0, 0, 0.7);
                    }

                    /* .gantt_task_line.task-retraso {
                                        background-color: red;
                                    } */

                    .task-retraso {
                        background-color: red !important;
                        /* Puedes ajustar el estilo según tus preferencias */
                    }

                    .resource_marker div {
                        width: 28px;
                        height: 28px;
                        line-height: 29px;
                        display: inline-block;

                        color: #FFF;
                        margin: 3px;
                    }

                    .resource_marker.workday_ok div {
                        border-radius: 15px;
                        background: #51c185;
                    }

                    .resource_marker.workday_over div {
                        border-radius: 3px;
                        background: #ff8686;
                    }

                    .folder_row {
                        font-weight: bold;
                    }

                    .highlighted_resource,
                    .highlighted_resource.odd {
                        background-color: rgba(255, 251, 224, 0.6);
                    }

                    .resource-controls .gantt_layout_content {
                        padding: 7px;
                        overflow: hidden;
                    }

                    .resource-controls label {
                        margin: 0 10px;
                        vertical-align: bottom;
                        display: inline-block;
                        color: #3e3e3e;
                        padding: 2px;
                        transition: box-shadow 0.2s;
                    }

                    .resource-controls label:hover {
                        box-shadow: 0 2px rgba(84, 147, 255, 0.42);
                    }

                    .resource-controls label.active,
                    .resource-controls label.active:hover {
                        box-shadow: 0 2px #5493ffae;
                        color: #1f1f1f;
                    }

                    .resource-controls input {
                        vertical-align: top;
                    }

                    .gantt_task_cell.week_end {
                        background-color: #e8e8e87d;
                    }

                    .gantt_task_row.gantt_selected .gantt_task_cell.week_end {
                        background-color: #e8e8e87d !important;
                    }


                    .group_row,
                    .group_row.odd,
                    .gantt_task_row.group_row {
                        background-color: rgba(232, 232, 232, 0.6);
                        font-weight: bold;
                    }

                    .owner-label {
                        width: 20px;
                        height: 20px;
                        line-height: 20px;
                        font-size: 12px;
                        display: inline-block;
                        border: 1px solid #cccccc;
                        border-radius: 25px;
                        background: #e6e6e6;
                        color: #6f6f6f;
                        margin: 0 3px;
                        font-weight: bold;
                    }
                </style>
                <div id="gantt_here" style='width:100%; height:calc(100vh - 52px);'></div>
                <div class="overflow-x-auto">
                    <div class="flex items-center justify-end mt-4">
                        <x-input-label for="plazo_total" :value="__('Plazo Total')" />
                        <div>
                            <x-text-input id="plazo_total" class="block mt-1 w-full" type="number" name="plazo_total"
                                value="{{ old('plazo_total', $plazo_total_pro ?? '') }}" required autofocus />
                        </div>

                        <div>
                            <button
                                class="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                                type="submit" id="guardar_dat">Guardar</button>
                        </div>

                        <div>
                            <input
                                class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                                value="Export to PDF" type="button" onclick='gantt.exportToPDF()'>
                        </div>

                        <div>
                            <input
                                class="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                                value="Export to Excel" type="button" onclick='gantt.exportToExcel()'>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>

<script src="codebase/dhtmlxgantt.js"></script>
<script src="https://export.dhtmlx.com/gantt/api.js"></script>
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="{{ asset('assets/js/gestion_proyecto_adm.js') }}"></script>
