<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Gestion cisterna') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <section class="bg-white dark:bg-gray-900">
                    <div class="py-8 lg:py-16 px-4 mx-auto max-w-screen-md">
                        <h2
                            class="mb-4 text-4xl tracking-tight font-extrabold text-center text-gray-900 dark:text-white">
                            CALCULO DE VOLUMEN DE LA CISTERNA</h2>
                        <p class="mb-8 lg:mb-16 font-light text-center text-gray-500 dark:text-gray-400 sm:text-xl">
                            Verifica y cambia los dato de ser nesesario.</p>
                        <p class="mb-8 lg:mb-16 font-light text-center text-gray-500 dark:text-gray-400 sm:text-xl">La
                            cantidad de consumo dario total es : {{ $volumendemanda }} Lt/dia</p>
                        <form action="{{ route('exportarpdfcist') }}" method="POST" class="space-y-8">
                            @csrf
                            @php
                                $volcisterna = ((3 / 4) * $volumendemanda) / 1000;
                            @endphp
                            <div class="grid gap-4 sm:grid-cols-3 sm:gap-6">
                                <div class="sm:col-span-3">
                                    <label
                                        class="text-center block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Vol.
                                        DE
                                        CISTERNA = 3/4 x ({{ $volumendemanda }})CONSUMO DIARIO TOTAL</label>
                                    <label
                                        class="text-center block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Vol.
                                        DE
                                        CISTERNA = {{ $volcisterna }}</label>
                                </div>
                                <input type="hidden" name="consumoDiarioTotal" id="consumoDiarioTotal"
                                    value="{{ $volcisterna }}">
                                <div>
                                    <label for="volDeCisterna"
                                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Vol. De
                                        Cisterna (m<sup>3</sup>)</label>
                                    <input type="text" id="volDeCisterna" name="volDeCisterna"
                                        class="text-center shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 dark:shadow-sm-light"
                                        placeholder="0.0" value="{{ $volcisterna }}">
                                </div>
                                <div>
                                    <label for="volTotalMinimo"
                                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Vol. Min
                                        de
                                        Cisterna (m<sup>3</sup>)</label>
                                    <input type="text" id="volTotalMinimo" name="volTotalMinimo"
                                        class="text-center block p-3 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 dark:shadow-sm-light"
                                        placeholder="0.00" value="{{ $volTotalMinimo }}">
                                </div>

                                <div>
                                    <label for="alturaDeAguaMin"
                                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">Altura
                                        de Agua min (m)</label>
                                    <input type="text" id="alturaDeAguaMin" name="alturaDeAguaMin"
                                        class="text-center block p-3 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 dark:shadow-sm-light"
                                        placeholder="0.00" value="{{ $alturaDeAguaMin }}">
                                </div>
                                <div>
                                    <label for="cisternaLargo"
                                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">Largo
                                        (L)</label>
                                    <input type="text" id="cisternaLargo" name="cisternaLargo"
                                        class="text-center block p-3 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 dark:shadow-sm-light"
                                        placeholder="0.00" value="{{ $cisternaLargo }}" required>
                                </div>
                                <div>
                                    <label for="cisternaAncho"
                                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">Ancho
                                        (A)</label>
                                    <input type="text" id="cisternaAncho" name="cisternaAncho"
                                        class="text-center block p-3 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 dark:shadow-sm-light"
                                        placeholder="0.00" value="{{ $cisternaAncho }}" required>
                                </div>

                                <div>
                                    <label for="cisternaAltura"
                                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">Altura
                                        agua (H)</label>
                                    <input type="text" id="cisternaAltura" name="cisternaAltura"
                                        class="text-center block p-3 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 dark:shadow-sm-light"
                                        placeholder="0.00" value="{{ $cisternaAltura }}" required>
                                </div>

                                <div class="sm:col-span-3">
                                    <label for="volumenCisterna"
                                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">Volumen
                                        de Cisterna (m<sup>3</sup>)</label>
                                    <input type="text" id="volumenCisterna" name="volumenCisterna"
                                        class="text-center block p-3 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 dark:shadow-sm-light"
                                        placeholder="0.00" value="">
                                </div>

                                <div class="sm:col-span-3">
                                    <label for="volumenCisternalitros"
                                        class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">Volumen
                                        de Cisterna en Litros (L)</label>
                                    <input type="text" id="volumenCisternalitros" name="volumenCisternalitros"
                                        class="text-center block p-3 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 dark:shadow-sm-light"
                                        placeholder="0.00" value="">
                                </div>
                            </div>
                            <button type="submit"
                                class="py-3 px-5 text-sm font-medium text-center text-white rounded-lg bg-blue-700 sm:w-fit hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Generar
                                PDF</button>
                        </form>
                    </div>
                </section>
            </div>
        </div>
    </div>
    <!-- JavaScript para manejar el cálculo del volumen -->
    <script>
        actualizarVolumen();
        // Función para actualizar el volumen
        function actualizarVolumen() {
            // Capturamos los valores de los tres campos de entrada
            let largo = parseFloat(document.getElementById('cisternaLargo').value) || 0;
            let ancho = parseFloat(document.getElementById('cisternaAncho').value) || 0;
            let altura = parseFloat(document.getElementById('cisternaAltura').value) || 0;

            // Calculamos el volumen (L * A * H)
            let volumen = largo * ancho * altura;
            const volumenlitros = Math.round(volumen * 1000);
            // Mostramos el volumen en el campo correspondiente
            document.getElementById('volumenCisterna').value = volumen.toFixed(2);
            document.getElementById('volumenCisternalitros').value = volumenlitros;
        }

        // Agregamos los eventos para escuchar los cambios en los campos
        document.getElementById('cisternaLargo').addEventListener('input', actualizarVolumen);
        document.getElementById('cisternaAncho').addEventListener('input', actualizarVolumen);
        document.getElementById('cisternaAltura').addEventListener('input', actualizarVolumen);
    </script>
</x-app-layout>
