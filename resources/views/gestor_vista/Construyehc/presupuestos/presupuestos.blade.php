<x-app-layout>
    <x-slot name="header">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Archivo+Narrow:ital,wght@0,400..700;1,400..700&display=swap"
            rel="stylesheet">
        <link href="https://cdn.jsdelivr.net/npm/tabulator-tables@6.3.1/dist/css/tabulator.min.css" rel="stylesheet">
        <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
        <script type="text/javascript" src="https://unpkg.com/tabulator-tables@6.3.1/dist/js/tabulator.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/exceljs/dist/exceljs.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/decimal.js/10.4.1/decimal.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
        <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js"></script>

        <div class="flex justify-between items-center mb-2 h-2">
            <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                {{ __('Gestion Presupuestos') }}
            </h2>
            <button id="addParentRow" title="especialidad"
                class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg">
                ➕
            </button>

            <!-- Modal toggle -->
            <button data-modal-target="default-modal" data-modal-toggle="default-modal" title="cargar metrados"
                class="block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                type="button">
                <img class="h-5 w-5"
                    src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAkElEQVR4nO2UbQqAIAxA3ykyumIdN/o4zUKYIJL9aka1B0NBZE83BefldBqP0AOLRpw3JQAzIBo7MDyVXFpK9MCqCdOYz1fLcoTs5JueNgl02ZrJTYST5GQCWEqESvJSwExiuqhvKVD2Sdx7C2Oluc4EkkTcY45UBJohLoCXAG9C/BnKrz+i7yM3xXsFnO9zAAsGbeXvq0QtAAAAAElFTkSuQmCC"
                    alt="upload">
            </button>

            <button id="savedata" title="guardar archivo"
                class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
                💾
            </button>

            <button id="download-xlsx" title="descargar excel"
                class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg">
                <img class="h-5 w-6"
                    src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAACnElEQVR4nO2aT4hPURTHP36IsfGriQXNRmhkdrIgJSVNIUXMQtmRxSArlGLFbMfGahak1BQpC6ZRUqYoC6nfSiGisaD8m5iRpzvdqdeZ897v/p773n0971t38e49nXO+79577rl/IF80gPXAIeAycB+YBCYoMRYDG4EjwDAwDnwCooRSCjSBHcBp4BrwAphRnP0DvARGgXNAf0giq4CdwCngOtCyDkqnZ2ybkTkD7AW6FX25E1kIrLEOXATu2vGsDYtvwDPrtCG4DehytJMbkRPAU2AqwemPwBgwBAzYyWsmcVbkRmQ6pvwVcAs4D+wBVnu2tSRl8mcpb+28m8VcpZnARUS2KAcysyg6ivi0F8V11UQyou4RBfXQ8oF2uVfUpmi65n9UkUg3cFCU3SkOrlXkV6YQ8YHIhYjJvZ4rf2RzgtIJIdeyC2BwIthkUGa6t5mP/Qphk+aXKvyOCgcNsT7Rcy0hc8PVeJFEeoDvKY4eFW1f7B7Gyfg/Iuo0al0Qzv4G1gFLbdIWbztZ5vDbBbwWCq8Ax0WdCQ6LykzE4ICy4Xoi5s5W2iPo0JrDWMqfGsENpSDSl3Ba8hlYkcV4KCK9wE+FyJQ9uOjYeAgiDeBxytC6l8V4CCKDwvFxO6Tidfs6MB4kavUAX4VCczR0VdS9AZaVmcgdZb1o2BX8h2i75EjEB6JOiAwof2VXrH1ItP0CNrgaL4rIcuC9cPShkGkqp+6PgAVlIjIiHDSr9yZF7qzSa4ddjBdBZLuyF7mZkou9E7KTCaeXhRPpB46JYqJXErYo8r3tjIdYR3whaPj1icoR8YGoJuIBdY/8d0Or6Um5q3HvV2/TBV6Gkudl6GBVrqcr82Cgck84Kv+optLPnHCE9vDsA/DAt6W/1JiouJQVC6gAAAAASUVORK5CYII="
                    alt="ms-excel">
            </button>

            <button id="download-pdf" title="descargar excel"
                class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg">
                <img class="h-5 w-6"
                    src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAACLUlEQVR4nO2YzUsVURjGf+JXcqWsBBVBiggFbxAkrQR34kJcKAaCu4jai+3a+A+ItFJCQldt2gRqC3UT4RcIhSJoiAqRLlrUIjJ14tArHC6D4T0fc89lHjicOzPnfZ73mTMz59wXUoSFyFF7B1QWg5EImAGu+DZiE7qZRaDaKnsCRr5JvwBkLGt4NdIMHMjvD8BVyzqxoq44bwFf5HgNuGlZK1bUFWcTsC3n1oFay3qxoq4464ENOb8JNIRqRKEO+CTXtoBGH6KuOG8Aq3J9F7jtQ9QVZw2wJGP2gDs+RF1xXgM+yrh94K4PUVecGWBeWzyzPkTz4bxsO7QhahMmG82CMpJIHlFq5B/URrCcgGekDHgDnMhL+iBUI50S90f6t6EaeSxxO9J/DtVIu8SdSa/2T0nkYUxQAfzQ4icJ+PP7UovvC9nIfS0+G7KRR1q8Ki6UJpSHMcFriT2VfjihPIwIVDn0u3y1+oFfsjgOeM7DmOCpxC3L8aCYOgaeAM9kxuZksXzxn7pWlISRCvmLquK6gYfAkFZZvKgWXFBGnkuMuvtHMQmfb1ty21fLeRgRZHMWwvPSzhjQI/UqVcMaF6P6uJFCMNIBvNe2JOquTwFtF8So0k8X0Au0WMojb4IqYDrnzv4G7mEXkWsjr2Ke9VETwaSM/MwxsSKzFJyRCW3MLHDdRCxJIyXyQreaiFjIwz2BJUSpEUE6I5YRpY9WsT5aUYG0vFE0RlLgGX8BLOq9fheWgQQAAAAASUVORK5CYII="
                    alt="pdf--v1">
            </button>

            {{-- Renumeracion --}}
            <button data-modal-target="renumeracion-modal" data-modal-toggle="renumeracion-modal" title="Renumaracion"
                class="block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                type="button">
                <img class="h-5 w-6"
                    src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAXUlEQVR4nGNgGAUjEXgwMDA8ZmBg+E8l/AhqJkHwiIqWIltOEMAU01IMKxi5Fv+nMh78Fo+8OEYGo4nr/2jigoLRxPV/tOQa1AUI3S1+NFBNHw8qW050Y28UDC8AAB3nTvnRHhzNAAAAAElFTkSuQmCC"
                    alt="table-1">
            </button>

            <input type="hidden" name="proyecto_id" id="proyecto_id" value="1">
            <input type="hidden" name="id_presupuestos" id="id_presupuestos" value="1">
            <input type="hidden" name="costodirectovalue" id="costodirectovalue">
            <input type="hidden" name="gastoGeneralTotal" id="gastoGeneralTotal" value="2">

        </div>
    </x-slot>

    <div class="py-2">
        <div class="grid grid-cols-2 gap-2">
            {{-- Metrados --}}
            <div class="2/6 border rounded-lg shadow-sm">
                <div id="tabla"></div>
            </div>
            {{-- Acus --}}
            <div class="4/6 border rounded-lg shadow-sm" id="detallecontainer">
                <div id="tabla-detall"></div>
            </div>

            {{--  Gastos Generales --}}
            <div class="col-span-2">
                <div class="flex flex-col gap-2">
                    <!-- Barra superior de Tabs -->
                    <div class="bg-gray-800 p-4 rounded-t-lg">
                        <ul class="flex space-x-2 text-xs" id="tab-list">
                            <li role="presentation">
                                <button class="tab-button w-32 text-left p-4 rounded-lg bg-gray-700 text-green-500"
                                    data-tab="consolidado">
                                    Consolidado
                                </button>
                            </li>
                            <li role="presentation">
                                <button
                                    class="tab-button w-48 text-left p-4 rounded-lg text-gray-300 hover:text-blue-600 hover:bg-gray-600"
                                    data-tab="gastos-Generales">
                                    Gastos Generales
                                </button>
                            </li>
                            <li role="presentation">
                                <button
                                    class="tab-button w-48 text-left p-4 rounded-lg text-gray-300 hover:text-blue-600 hover:bg-gray-600"
                                    data-tab="gasto-fijo">
                                    Gastos Fijos
                                </button>
                            </li>
                            <li role="presentation">
                                <button
                                    class="tab-button w-48 text-left p-4 rounded-lg text-gray-300 hover:text-blue-600 hover:bg-gray-600"
                                    data-tab="supervision">
                                    Supervisión
                                </button>
                            </li>
                            <!-- <li role="presentation">
                                <button
                                    class="tab-button w-48 text-left p-4 rounded-lg text-gray-300 hover:text-blue-600 hover:bg-gray-600"
                                    data-tab="gastos-supervision">
                                    Gastos Supervisión
                                </button>
                            </li> -->
                            <li role="presentation">
                                <button
                                    class="tab-button w-48 text-left p-4 rounded-lg text-gray-300 hover:text-blue-600 hover:bg-gray-600"
                                    data-tab="renumeracion">
                                    Control Concurrente
                                </button>
                            </li>
                        </ul>
                    </div>

                    <!-- Contenido de los Tabs -->
                    <div id="tab-content" class="bg-white p-4 rounded-lg shadow-md -mt-5">
                        <div class="tab-panel hidden p-4 rounded-xs bg-white shadow-md" id="consolidado">
                            <div id="consolidado_table" class="w-full h-full overflow-x-auto"></div>
                            {{-- <table
                                class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 border rounded-lg shadow-sm bg-blue-500">
                                <tbody class="text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr class="bg-blue-500 text-gray-50">
                                        <th class="px-6 py-3">Costo Directo</th>
                                        <td class="px-6 py-3"></td>
                                        <td class="px-6 py-3">S/. <span class="costodirecto_gen"
                                                id="costodirecto">0.00</span></td>
                                    </tr>
                                    <tr>
                                        <th class="px-6 py-3">Gastos Generales</th>
                                        <td class="px-6 py-3">
                                            <div class="relative">
                                                <label for="porcentajegastos" class="sr-only"> Gastos Generales
                                                </label>

                                                <input type="text" id="porcentajegastos" name="porcentajegastos"
                                                    placeholder="Gastos Generales"
                                                    class="w-full text-gray-900  rounded-md border-gray-200 py-2.5 pe-10 shadow-xs sm:text-sm" />

                                                <span class="absolute inset-y-0 end-0 grid w-10 place-content-center">
                                                    <button type="button" class="text-gray-600 hover:text-gray-700">
                                                        <span class="sr-only">Search</span>
                                                        <img class="w-5 h-5"
                                                            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAsTAAALEwEAmpwYAAABMElEQVR4nO2UQUoDMRiFv5WeQAXHWepNeiZ7ESld240UV7Y3KCJuWyi4agvtyoIO3VcCrxCGTCaZjF3NB2Hgn+R/k+TNg46OOC6Ad2BGAnfAGCiADTAEbmrW9IEjME8R3auJPXZAVrEmBw6a12sqPFaDNwmZMVFtVLPGPBtTqElW2tFp12V6enfQvMYcNULqxlBL1R9TRGOFT4b6Ai5J5FfNjMl8R92KoWxe1WwicTOmqj23bSibB+Db8Tttgdu2DVXGOPpFx74CnoArh6HMHZ+NvkSX+ohy0hW6rvs2RXOHoaqSbu9JumhchvIlnbmuZKoM5Uu6n1RRX0LFBE40voT6N+G8JqF2gUkXTV1CjQKTLoqQhMqsXVclXTSLwIS6BgbA2pF0jfgEPqyE6ugghD9WEYrI0h9bwAAAAABJRU5ErkJggg=="
                                                            alt="percentage">
                                                    </button>
                                                </span>
                                            </div>
                                        </td>
                                        <td class="px-6 py-3">S/. <span id="gastosgenerales">0.00</span></td>
                                    </tr>
                                    <tr>
                                        <th class="px-6 py-3">Utilidad</th>
                                        <td class="px-6 py-3">
                                            <div class="relative">
                                                <label for="porcentajeutilidad" class="sr-only"> Search </label>

                                                <input type="text" id="porcentajeutilidad"
                                                    name="porcentajeutilidad" placeholder="Utilidad"
                                                    class="w-full text-gray-900  rounded-md border-gray-200 py-2.5 pe-10 shadow-xs sm:text-sm" />

                                                <span class="absolute inset-y-0 end-0 grid w-10 place-content-center">
                                                    <button type="button" class="text-gray-600 hover:text-gray-700">
                                                        <span class="sr-only">Search</span>
                                                        <img class="w-5 h-5"
                                                            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAsTAAALEwEAmpwYAAABMElEQVR4nO2UQUoDMRiFv5WeQAXHWepNeiZ7ESld240UV7Y3KCJuWyi4agvtyoIO3VcCrxCGTCaZjF3NB2Hgn+R/k+TNg46OOC6Ad2BGAnfAGCiADTAEbmrW9IEjME8R3auJPXZAVrEmBw6a12sqPFaDNwmZMVFtVLPGPBtTqElW2tFp12V6enfQvMYcNULqxlBL1R9TRGOFT4b6Ai5J5FfNjMl8R92KoWxe1WwicTOmqj23bSibB+Db8Tttgdu2DVXGOPpFx74CnoArh6HMHZ+NvkSX+ohy0hW6rvs2RXOHoaqSbu9JumhchvIlnbmuZKoM5Uu6n1RRX0LFBE40voT6N+G8JqF2gUkXTV1CjQKTLoqQhMqsXVclXTSLwIS6BgbA2pF0jfgEPqyE6ugghD9WEYrI0h9bwAAAAABJRU5ErkJggg=="
                                                            alt="percentage">
                                                    </button>
                                                </span>
                                            </div>
                                            
                                        </td>
                                        <td class="px-6 py-3">S/. <span id="utilidad">0.00</span></td>
                                    </tr>
                                    <tr>
                                        <th class="px-6 py-3">Parcial</th>
                                        <td class="px-6 py-3"></td>
                                        <td class="px-6 py-3">S/. <span id="parcial">0.00</span></td>
                                    </tr>
                                    <tr>
                                        <th class="px-6 py-3">I.G.V.</th>
                                        <td class="px-6 py-3">
                                            <div class="relative">
                                                <label for="porcentajeigv" class="sr-only"> Search </label>

                                                <input type="text" id="porcentajeigv" name="porcentajeigv"
                                                    placeholder="IGV"
                                                    class="w-full text-gray-900  rounded-md border-gray-200 py-2.5 pe-10 shadow-xs sm:text-sm" />

                                                <span class="absolute inset-y-0 end-0 grid w-10 place-content-center">
                                                    <button type="button" class="text-gray-600 hover:text-gray-700">
                                                        <span class="sr-only">Search</span>
                                                        <img class="w-5 h-5"
                                                            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAsTAAALEwEAmpwYAAABMElEQVR4nO2UQUoDMRiFv5WeQAXHWepNeiZ7ESld240UV7Y3KCJuWyi4agvtyoIO3VcCrxCGTCaZjF3NB2Hgn+R/k+TNg46OOC6Ad2BGAnfAGCiADTAEbmrW9IEjME8R3auJPXZAVrEmBw6a12sqPFaDNwmZMVFtVLPGPBtTqElW2tFp12V6enfQvMYcNULqxlBL1R9TRGOFT4b6Ai5J5FfNjMl8R92KoWxe1WwicTOmqj23bSibB+Db8Tttgdu2DVXGOPpFx74CnoArh6HMHZ+NvkSX+ohy0hW6rvs2RXOHoaqSbu9JumhchvIlnbmuZKoM5Uu6n1RRX0LFBE40voT6N+G8JqF2gUkXTV1CjQKTLoqQhMqsXVclXTSLwIS6BgbA2pF0jfgEPqyE6ugghD9WEYrI0h9bwAAAAABJRU5ErkJggg=="
                                                            alt="percentage">
                                                    </button>
                                                </span>
                                            </div>
                                         
                                        </td>
                                        <td class="px-6 py-3">S/. <span id="igv">0.00</span></td>
                                    </tr>
                                    <tr class="bg-blue-500 text-gray-50">
                                        <th class="px-6 py-3 font-bold">SUB TOTAL :</th>
                                        <td class="px-6 py-3"></td>
                                        <td class="px-6 py-3">S/. <span id="subtotal">0.00</span></td>
                                    </tr>
                                    <tr>
                                        <th class="px-6 py-3">*Elaboracion del Expediente Tecnico</th>
                                        <td class="px-6 py-3"></td>
                                        <td class="px-6 py-3">
                                            <div class="relative">
                                                <label for="elabexpetecnico" class="sr-only">elaboracion
                                                    tecnico</label>
                                                <span class="absolute inset-y-0 end-0 grid w-10 place-content-center">
                                                    <button type="button" class="text-gray-950 hover:text-gray-700">
                                                        <span class="sr-only">elaboracion tecnico</span>
                                                        S/.
                                                    </button>
                                                </span>
                                                <input type="text" id="elabexpetecnico" name="elabexpetecnico"
                                                    placeholder="expediente tecnico"
                                                    class="w-full text-gray-900  rounded-md border-gray-200 py-2.5 pe-10 shadow-xs sm:text-sm" />
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th class="px-6 py-3">* Gastos Supervision</th>
                                        <td class="px-6 py-3">
                                            <div class="relative">
                                                <label for="porcentajegasoperacion" class="sr-only"> Gastos
                                                    Supervision </label>

                                                <input type="text" id="porcentajegasoperacion"
                                                    name="porcentajegasoperacion" placeholder="porcentajegasoperacion"
                                                    class="w-full text-gray-900  rounded-md border-gray-200 py-2.5 pe-10 shadow-xs sm:text-sm" />

                                                <span class="absolute inset-y-0 end-0 grid w-10 place-content-center">
                                                    <button type="button" class="text-gray-600 hover:text-gray-700">
                                                        <span class="sr-only">Gastos Supervision</span>
                                                        <img class="w-5 h-5"
                                                            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAsTAAALEwEAmpwYAAABMElEQVR4nO2UQUoDMRiFv5WeQAXHWepNeiZ7ESld240UV7Y3KCJuWyi4agvtyoIO3VcCrxCGTCaZjF3NB2Hgn+R/k+TNg46OOC6Ad2BGAnfAGCiADTAEbmrW9IEjME8R3auJPXZAVrEmBw6a12sqPFaDNwmZMVFtVLPGPBtTqElW2tFp12V6enfQvMYcNULqxlBL1R9TRGOFT4b6Ai5J5FfNjMl8R92KoWxe1WwicTOmqj23bSibB+Db8Tttgdu2DVXGOPpFx74CnoArh6HMHZ+NvkSX+ohy0hW6rvs2RXOHoaqSbu9JumhchvIlnbmuZKoM5Uu6n1RRX0LFBE40voT6N+G8JqF2gUkXTV1CjQKTLoqQhMqsXVclXTSLwIS6BgbA2pF0jfgEPqyE6ugghD9WEYrI0h9bwAAAAABJRU5ErkJggg=="
                                                            alt="percentage">
                                                    </button>
                                                </span>
                                            </div>
                                        </td>
                                        <td class="px-6 py-3">S/:<span id="gastosupervicion">0.00</span></td>
                                    </tr>
                                    <tr class="bg-blue-500 text-gray-50">
                                        <th class="px-6 py-3 font-bold">TOTAL :</th>
                                        <td class="px-6 py-3"></td>
                                        <td class="px-6 py-3">S/. <span id="total">0.00</span></td>
                                    </tr>
                                </tbody>

                            </table> --}}
                        </div>
                        <div class="tab-panel hidden p-4 rounded-xs bg-white shadow-md" id="gastos-Generales">
                            <div class="flex">
                                <p class="text-base text-gray-500">Contenido de <strong>gastos-Generales</strong>.</p>
                                <button class="guardar-gastos-fijos text-xs" id="guardar-gastos-generales">💾</button>
                                <p class="tex-xs px-5">Que porcentaje deseas Calcular</p>
                                <input type="text" id="porcentajeCalc"
                                    class="w-48 inline-block pl-2 bg-transparent border-b-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md text-sm">
                            </div>

                            <h2 class="text-base font-bold mb-2">01) GASTOS GENERALES FIJOS <button
                                    class="add-row-fatherGG">➕</button></h2>
                            <div id="gastosGenerales"></div>

                            <h2 class="text-base font-bold mt-4 mb-2">02) GASTOS GENERALES VARIABLES <button
                                    class="add-row-fatherGE">➕</button></h2>
                            <div id="gastosEspecificos"></div>
                        </div>

                        <div class="tab-panel hidden p-4 rounded-xs bg-white shadow-md" id="gasto-fijo">
                            <p class="text-base text-gray-500">Contenido de <strong>gasto-fijo</strong>.</p>
                            <button class="guardar-gastos-fijos text-xs" id="guardar-gastos-fijos">💾</button>
                            <div class="overflow-x-auto">
                                <div class="flex items-center justify-between mb-2">
                                    <h3 class="text-lg font-semibold">Detalles del Gasto General</h3>
                                    <button id="toggleTable" class="bg-gray-500 text-white px-4 py-2 rounded-md">
                                        Abrir/Cerrar Tabla
                                    </button>
                                </div>

                                <table id="table"
                                    class="min-w-full table-auto border-separate border-spacing-0 border border-gray-300 text-sm hidden">
                                    <thead class="bg-gray-500">
                                        <tr>
                                            <th class="border px-4 py-1 text-left">Descripción</th>
                                            <th class="border px-4 py-1 text-left">Ingreso de Datos</th>
                                            <th class="border px-4 py-1 text-left">Resultado</th>
                                        </tr>
                                    </thead>
                                    <tbody class="text-xs">
                                        <tr>
                                            <td class="border px-4 py-1">Costo Directo</td>
                                            <td class="border px-4 py-1 hover:bg-gray-100">
                                                <div class="flex items-center space-x-2">
                                                    <span class="text-gray-700">S/.</span>
                                                    <input type="text" name="costoDirecto_gfijo"
                                                        id="costoDirecto_gfijo"
                                                        class="w-48 inline-block pl-2 bg-transparent border-b-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md text-sm"
                                                        value="10" disabled>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="border px-4 py-1">GGF</td>
                                            <td class="border px-4 py-1">
                                                <input type="text" name="ggf" id="ggf"
                                                    class="w-48 inline-block pl-2 bg-transparent border-b-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md text-sm"
                                                    value="100">
                                            </td>
                                            <td class="border px-4 py-1" id="resultadoGGF">0.00</td>
                                        </tr>
                                        <tr>
                                            <td class="border px-4 py-1">GGV</td>
                                            <td class="border px-4 py-1">
                                                <input type="text" name="ggv" id="ggv"
                                                    class="w-48 inline-block pl-2 bg-transparent border-b-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md text-sm"
                                                    value="100">
                                            </td>
                                            <td class="border px-4 py-1" id="resultadoGGV">0.00</td>
                                        </tr>
                                        <tr>
                                            <td class="border px-4 py-1">UTILIDAD</td>
                                            <td class="border px-4 py-1">
                                                <input type="text" name="utilidadgfijos" id="utilidadgfijos"
                                                    class="w-48 inline-block pl-2 bg-transparent border-b-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md text-sm"
                                                    value="155150.03">
                                            </td>
                                            <td class="border px-4 py-1" id="resultadoUtilidad">0.00</td>
                                        </tr>
                                        <tr>
                                            <td class="border px-4 py-1">SUB TOTAL (sin IGV)</td>
                                            <td class="border px-4 py-1">
                                                <strong>S/. <span id="subtotalgfijos"
                                                        class="w-48">0.00</span></strong>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="border px-4 py-1"><strong>Monto contrato Garantizar</strong>
                                            </td>
                                            <td class="border px-4 py-1"><strong>S/. <span id="montocontratov"
                                                        class="w-48">0.00</span></strong></td>
                                        </tr>
                                        <tr>
                                            <td class="border px-4 py-1">Duración obra</td>
                                            <td class="border px-4 py-1">
                                                <div class="flex items-center space-x-2">
                                                    <input type="text" name="duracionobra" id="duracionobra"
                                                        class="w-48 inline-block pl-2 bg-transparent border-b-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md text-sm"
                                                        value="180"> dias
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div class="mt-5" id="gastosfijos"></div>
                        </div>

                        <!-- Primer div -->
                        <div class="tab-panel hidden rounded-lg bg-white shadow-md w-full" id="supervision">
                            <div class="flex">
                                <p class="text-sm text-gray-500">Contenido de <strong>supervision</strong>.
                                    {{-- <button class="add-row-fatherSupervicion">➕</button> --}}
                                    <button class="guardar-supervision text-xs" id="guardar-supervision">💾</button>
                                </p>
                                <br>
                                <label for="totalsupervision">Total <span id="totalsupervision"
                                        class="border-2 border-yellow-500 bg-yellow-100 p-2"></span></label>
                                <p class="tex-xs px-5">Que porcentaje deseas Calcular</p>
                                <input type="text" id="porcentajeCalcSuper"
                                    class="w-48 inline-block pl-2 bg-transparent border-b-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md text-sm">
                            </div>
                            <div class="w-full h-full">
                                <style>
                                    .tabulator .tabulator-header .tabulator-col {
                                        font-size: 10px;
                                        color: black;
                                        font-weight: bolder;
                                        /* Ajusta el tamaño de letra de encabezados */
                                    }

                                    .tabulator .tabulator-row {
                                        font-size: 9px;
                                        color: black;
                                        font-weight: bolder;
                                        /* Ajusta el tamaño de letra de las filas */
                                    }

                                    .tabulator .tabulator-cell {
                                        padding: 8px;
                                        color: black;
                                        font-weight: bolder;
                                        /* Ajusta el padding interno de las celdas */
                                    }
                                </style>
                                <div id="supervition_base" class="w-full h-full overflow-x-auto"></div>
                                <div id="gastosSupervision" class="w-full h-full overflow-x-auto"></div>
                            </div>
                        </div>

                        <!-- Segundo div -->
                        {{-- <div class="tab-panel hidden p-4 rounded-lg bg-white shadow-md w-full md:w-1/2"
                            id="gastos-supervision">
                            <p class="text-sm text-gray-500">Contenido de <strong>gastos-supervision</strong>.</p>
                            <div id=""></div>
                        </div> --}}
                        <div class="tab-panel hidden p-4 rounded-lg bg-white shadow-md" id="renumeracion">
                            <p class="text-sm text-gray-500">Contenido de <strong>CONTROL CONCURRENTE</strong>.
                                <button class="add-row-fatherCCuncurrente">➕</button>
                                <button class="savecontrolCun">💾</button>
                            </p>
                            <div id="controlcuncurrente"></div>
                        </div>
                    </div>
                </div>
                {{--  Gastos Supervicion --}}
            </div>
        </div>

        <div id="observationModal"
            class="hidden fixed inset-0 flex justify-end items-stard py-23 px-8 bg-opacity-50 border rounded-lg shadow-sm">
            <div
                class="bg-gray-800 text-gray-50 dark:bg-gray-300 dark:text-gray-950 w-1/3 h-72 p-6 border rounded-lg shadow-lg flex flex-col">
                <h2 class="text-lg font-semibold mb-4">Agregar Observación</h2>
                <textarea id="observationText" class="w-full h-64 p-2 border rounded-lg focus:ring focus:ring-blue-300"></textarea>
                <div class="mt-4 flex justify-end space-x-2">
                    <button id="cancelObservation"
                        class="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">Cancelar</button>
                    <button id="saveObservation"
                        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Guardar</button>
                </div>
            </div>
        </div>

        <!-- Main modal -->
        <div id="default-modal" tabindex="-1" aria-hidden="true"
            class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
            <div class="relative p-4 w-full max-w-2xl max-h-full">
                <!-- Modal content -->
                <div class="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
                    <!-- Modal header -->
                    <div
                        class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
                        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                            Metrados a cargar
                        </h3>
                        <button type="button"
                            class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                            data-modal-hide="default-modal">
                            <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                            </svg>
                            <span class="sr-only">Close modal</span>
                        </button>
                    </div>
                    {{-- <form method="POST" action="{{ route('obtenerresumMetrados') }}"> --}}
                    <form id="resumenMetradosForm">
                        @csrf
                        <!-- Modal body -->
                        <div class="flex items-center justify-center">
                            <ul
                                class="w-48 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg dark:bg-gray-300 dark:border-gray-300 dark:text-gray-950">
                                <!-- Estructura Checkbox -->
                                <li class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-500">
                                    <div class="flex items-center ps-3">
                                        <input id="estructura-checkbox" name="estructura-checkbox" type="checkbox"
                                            value="true"
                                            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500">
                                        <label for="estructura-checkbox"
                                            class="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-950">Estructura</label>
                                    </div>
                                </li>

                                <!-- Arquitectura Checkbox -->
                                <li class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-500">
                                    <div class="flex items-center ps-3">
                                        <input id="arquitectura-checkbox" name="arquitectura-checkbox"
                                            type="checkbox" value="true"
                                            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500">
                                        <label for="arquitectura-checkbox"
                                            class="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-950">Arquitectura</label>
                                    </div>
                                </li>

                                <!-- Sanitarias Checkbox -->
                                <li class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-500">
                                    <div class="flex items-center ps-3">
                                        <input id="sanitarias-checkbox" name="sanitarias-checkbox" type="checkbox"
                                            value="true"
                                            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500">
                                        <label for="sanitarias-checkbox"
                                            class="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-950">Sanitaria</label>
                                    </div>
                                </li>

                                <!-- Electricas Checkbox -->
                                <li class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
                                    <div class="flex items-center ps-3">
                                        <input id="electricas-checkbox" name="electricas-checkbox" type="checkbox"
                                            value="true"
                                            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500">
                                        <label for="electricas-checkbox"
                                            class="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-950">Electricas</label>
                                    </div>
                                </li>

                                <!-- Comunicacion Checkbox -->
                                <li class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
                                    <div class="flex items-center ps-3">
                                        <input id="comunicacion-checkbox" name="comunicacion-checkbox"
                                            type="checkbox" value="true"
                                            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500">
                                        <label for="comunicacion-checkbox"
                                            class="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-950">Comunicacion</label>
                                    </div>
                                </li>

                                <!-- Gas Checkbox -->
                                <li class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
                                    <div class="flex items-center ps-3">
                                        <input id="gas-checkbox" name="gas-checkbox" type="checkbox" value="true"
                                            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500">
                                        <label for="gas-checkbox"
                                            class="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-950">Gas</label>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <input type="text" name="proyecto_id" id="proyecto_id" value="1">

                        <!-- Modal footer -->
                        <div
                            class="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
                            <button id="obtenerResumenMetrados" type="button"
                                class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                Solicitar documentos
                            </button>

                            <button type="button"
                                class="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                                Cerrar/cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        {{-- Renumeracion --}}
        <div id="renumeracion-modal" tabindex="-1" aria-hidden="true"
            class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)]">
            <div class="relative p-4 w-full bg-white rounded-lg shadow-lg dark:bg-gray-800">
                <!-- Modal content -->
                <div
                    class="flex items-center justify-between p-4 border-b rounded-t dark:border-gray-600 border-gray-200">
                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                        Renumeracion <button class="add-row-father-remuneracion">➕</button>
                    </h3>
                    <button type="button"
                        class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                        data-modal-hide="renumeracion-modal">
                        <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                            viewBox="0 0 14 14">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                        </svg>
                        <span class="sr-only">Close modal</span>
                    </button>
                </div>
                <div class="relative bg-white dark:bg-gray-700 p-4 rounded-b">
                    <!-- Modal body (Aquí va el contenido de la numeración) -->
                    <div id="renumeracionBase" class="w-full overflow-auto"></div>
                    <div class="flex justify-between mt-4">
                        <button type="button" id="guardarRemuneracion"
                            class="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                            Guardar
                        </button>

                        <button type="button"
                            class="text-gray-700 bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                            id="cerrarRemuneracion">
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <script>
            // Función para abrir y cerrar el modal del "default-modal"
            const modalButtonDefault = document.querySelector('[data-modal-toggle="default-modal"]');
            const modalDefault = document.getElementById('default-modal');
            const closeModalButtonDefault = document.querySelector('[data-modal-hide="default-modal"]');

            // Función para abrir el modal "default-modal"
            modalButtonDefault.addEventListener('click', () => {
                modalDefault.classList.remove('hidden');
                modalDefault.classList.add('flex'); // Mostrar el modal
            });

            // Función para cerrar el modal "default-modal"
            closeModalButtonDefault.addEventListener('click', () => {
                modalDefault.classList.add('hidden');
                modalDefault.classList.remove('flex'); // Ocultar el modal
            });

            // Cerrar el modal "default-modal" si haces clic fuera de él
            window.addEventListener('click', (event) => {
                if (event.target === modalDefault) {
                    modalDefault.classList.add('hidden');
                    modalDefault.classList.remove('flex');
                }
            });

            // Función para abrir y cerrar el modal del "renumeracion-modal"
            const modalButtonRenumeracion = document.querySelector('[data-modal-toggle="renumeracion-modal"]');
            const modalRenumeracion = document.getElementById('renumeracion-modal');
            const closeModalButtonRenumeracion = document.querySelector('[data-modal-hide="renumeracion-modal"]');
            const cerrarRemuneracion = document.getElementById('cerrarRemuneracion');
            // Función para abrir el modal "renumeracion-modal"
            modalButtonRenumeracion.addEventListener('click', () => {
                modalRenumeracion.classList.remove('hidden');
                modalRenumeracion.classList.add('flex'); // Mostrar el modal
            });

            closeModalButtonRenumeracion.addEventListener('click', () => {
                modalRenumeracion.classList.add('hidden');
                modalRenumeracion.classList.remove('flex'); // Ocultar el modal
            });

            cerrarRemuneracion.addEventListener('click', () => {
                modalRenumeracion.classList.add('hidden');
                modalRenumeracion.classList.remove('flex'); // Ocultar el modal
            });

            // Cerrar el modal "renumeracion-modal" si haces clic fuera de él
            window.addEventListener('click', (event) => {
                if (event.target === modalRenumeracion) {
                    modalRenumeracion.classList.add('hidden');
                    modalRenumeracion.classList.remove('flex');
                }
            });
        </script>

        <script type="module" src="{{ asset('assets/js/presupuestos.js') }}"></script>
</x-app-layout>
