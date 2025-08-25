<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Gestion cisterna') }}
        </h2>
    </x-slot>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://unpkg.com/jspdf@latest/dist/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.14/jspdf.plugin.autotable.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"></script>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <section class="bg-white dark:bg-gray-900 text-gray-950 dark:text-white">
                    <div class="py-8 lg:py-16 px-4 mx-auto max-w-screen-md">
                        <div class="grid gap-4 sm:grid-cols-3 sm:gap-6">

                            <div class="sm:col-span-3">
                                <label for="areaterreno"
                                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Area m
                                    <sup>2</sup></label>
                                <input type="text" id="areaterreno" name="areaterreno"
                                    class="text-center shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 dark:shadow-sm-light"
                                    placeholder="00.0">
                            </div>
                            <div class="sm:col-span-3">
                                <label for="npisos"
                                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Numero de
                                    Pisos</label>
                                <input type="text" id="npisos" name="npisos"
                                    class="text-center shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 dark:shadow-sm-light"
                                    placeholder="00.0">
                            </div>

                            <button type="button" id="calcularcisterna"
                                class="py-3 px-5 text-sm font-medium text-center text-white rounded-lg bg-blue-700 sm:w-fit hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Calcular</button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    </div>
    <div id="resultado" style="width: auto; height: 600px;"></div>


    <script>
        // Creamos un array de objetos para representar la tabla
        const dotaciones = [{
                rango: "0 a 200",
                dotacion: 1500
            },
            {
                rango: "201 a 300",
                dotacion: 1700
            },
            {
                rango: "301 a 400",
                dotacion: 1900
            },
            {
                rango: "401 a 500",
                dotacion: 2100
            },
            {
                rango: "501 a 600",
                dotacion: 2200
            },
            {
                rango: "601 a 700",
                dotacion: 2300
            },
            {
                rango: "701 a 800",
                dotacion: 2400
            },
            {
                rango: "801 a 900",
                dotacion: 2500
            },
            {
                rango: "901 a 1000",
                dotacion: 2600
            },
            {
                rango: "1001 a 1200",
                dotacion: 2800
            },
            {
                rango: "1201 a 1400",
                dotacion: 3000
            },
            {
                rango: "1401 a 1700",
                dotacion: 3400
            },
            {
                rango: "1701 a 2000",
                dotacion: 3800
            },
            {
                rango: "2001 a 2500",
                dotacion: 4500
            },
            {
                rango: "2501 a 3000",
                dotacion: 5000
            },
            {
                rango: "Mayores de 3000",
                formula: '5000 + 100 * (area - 3000) / 100'
            },
        ];

        // Función para obtener la dotación basada en el área del terreno
        function obtenerDotacion(area) {
            const dotacionObj = dotaciones.find(d => {
                // Si el rango es un valor numérico (no es un rango)
                if (typeof d.rango === 'number') {
                    return area === d.rango; // Compara el área con el valor numérico exacto
                }

                // En el caso de un rango
                const [min, max] = d.rango.split(' a ').map(Number); // Convertimos los valores a números

                // Verificamos si el área está dentro del rango (incluye los límites)
                return area >= min && area <= max;
            });

            if (dotacionObj) {
                if (dotacionObj.formula) {
                    // Si hay una fórmula, la evaluamos
                    return eval(dotacionObj.formula);
                } else {
                    return dotacionObj.dotacion;
                }
            } else {
                return 'Área fuera de rango';
            }
        }

        // Evento que se ejecuta cuando se hace clic en el botón
        $('#calcularcisterna').on("click", function() {
            // Obtener los valores de los inputs
            const areaTerreno = $('#areaterreno').val();
            const npisos = $('#npisos').val();

            // Convertir el valor del área a número
            const area = parseFloat(areaTerreno);

            if (isNaN(area)) {
                // Validar que el área sea un número válido
                alert("Por favor ingresa un valor válido para el área.");
                return;
            }
            if (isNaN(npisos)) {
                // Validar que el área sea un número válido
                alert("Por favor ingresa un valor válido para la cantidad de pisos.");
                return;
            }
            // Obtener la dotación
            const valdotacion = obtenerDotacion(area);
            const dotacionFinal = valdotacion * npisos;

            const cisternaElevadoVal = ((3 / 4) * dotacionFinal);
            crearpdfcisterna(area, npisos, valdotacion, dotacionFinal, cisternaElevadoVal)
        });

        const tanquescisternas = [{
                nombre: 'Cisterna de agua de 1,200 Litros',
                capacidad: 1200,
                imagen: "{{ asset('storage/eternit/cisternas/tanque1200.png') }}",
                medidasproporciones: "{{ asset('storage/eternit/cisternas/medidastanque1200.png') }}",
                diagramaintalacion: "{{ asset('storage/eternit/cisternas/instalaciontanque1200.png') }}",
            },
            {
                nombre: 'Cisterna de agua 2,000 Litros',
                capacidad: 2000,
                imagen: "{{ asset('storage/eternit/cisternas/cisterna2000.png') }}",
                medidasproporciones: "{{ asset('storage/eternit/cisternas/mediascisterna200.png') }}",
                diagramaintalacion: "{{ asset('storage/eternit/cisternas/instalacioncisterna2000.png') }}",
            },
            {
                nombre: 'Cisterna de agua 2,800 Litros',
                capacidad: 2800,
                imagen: "{{ asset('storage/eternit/cisternas/cisterna2800.png') }}",
                medidasproporciones: "{{ asset('storage/eternit/cisternas/medidascisterna2800.png') }}",
                diagramaintalacion: "{{ asset('storage/eternit/cisternas/instalacioncisterna2800.png') }}",
            },
            {
                nombre: 'Cisterna de agua 5,000 Litros',
                capacidad: 5000,
                imagen: "{{ asset('storage/eternit/cisternas/cisterna5000.png') }}",
                medidasproporciones: "{{ asset('storage/eternit/cisternas/medidascisterna5000.png') }}",
                diagramaintalacion: "{{ asset('storage/eternit/cisternas/instalacioncisterna5000.png') }}",
            },
            {
                nombre: 'Cisterna de agua 10,000 Litros',
                capacidad: 10000,
                imagen: "{{ asset('storage/eternit/cisternas/cisterna10000.png') }}",
                medidasproporciones: "{{ asset('storage/eternit/cisternas/sininstrucciones.png') }}",
                diagramaintalacion: "{{ asset('storage/eternit/cisternas/sininstrucciones.png') }}",
            },
        ];

        // Función para validar el tanque adecuado
        function validarcisterna(cisternaElevadoVal) {
            const rangoMinimo = cisternaElevadoVal - 400;
            const rangoMaximo = cisternaElevadoVal + 400;

            // Buscar el tanque que esté dentro del rango
            const cisternaEncontrado = tanquescisternas.find(cisterna => {
                return cisterna.capacidad >= rangoMinimo && cisterna.capacidad <= rangoMaximo;
            });

            if (cisternaEncontrado) {
                return {
                    nombre: cisternaEncontrado.nombre,
                    capacidad: cisternaEncontrado.capacidad,
                    imagen: cisternaEncontrado.imagen,
                    medidasproporciones: cisternaEncontrado.medidasproporciones,
                    diagramaintalacion: cisternaEncontrado.diagramaintalacion,
                };
            } else {
                return null; // No se encontró un tanque adecuado
            }
        }
        // Definir los rangos en un array
        const rangos = [{
                min: 0,
                max: 200,
                texto: "=< 200"
            },
            {
                min: 201,
                max: 300,
                texto: "de 201 a 300"
            },
            {
                min: 301,
                max: 400,
                texto: "de 301 a 400"
            },
            {
                min: 401,
                max: 500,
                texto: "de 401 a 500"
            },
            {
                min: 501,
                max: 600,
                texto: "de 501 a 600"
            },
            {
                min: 601,
                max: 700,
                texto: "de 601 a 700"
            },
            {
                min: 701,
                max: 800,
                texto: "de 701 a 800"
            },
            {
                min: 801,
                max: 900,
                texto: "de 801 a 900"
            },
            {
                min: 901,
                max: 1000,
                texto: "de 901 a 1000"
            },
            {
                min: 1001,
                max: 1200,
                texto: "de 1001 a 1200"
            },
            {
                min: 1201,
                max: 1400,
                texto: "de 1201 a 1400"
            },
            {
                min: 1401,
                max: 1700,
                texto: "de 1401 a 1700"
            },
            {
                min: 1701,
                max: 2000,
                texto: "de 1701 a 2000"
            },
            {
                min: 2001,
                max: 2500,
                texto: "de 2001 a 2500"
            },
            {
                min: 2501,
                max: 3000,
                texto: "de 2501 a 3000"
            },
            {
                min: 3001,
                max: Infinity,
                texto: "> de 3000"
            },
        ];

        // Función para determinar el rango
        function determinarRango(area) {
            const rangoEncontrado = rangos.find(rango => area >= rango.min && area <= rango.max);
            return rangoEncontrado ? rangoEncontrado.texto : "Fuera de rango";
        }

        function crearpdfcisterna(area, npisos, valdotacion, dotacionFinal, cisternaElevadoVal) {
            const resultado = validarcisterna(cisternaElevadoVal); // Obtiene el tanque adecuado
            if (!resultado) {
                alert("No se encontró un tanque adecuado.");
                return; // Si no se encuentra un tanque válido, salimos de la función
            }

            const rangoArea = determinarRango(area);
            console.log(`El área ${area} m² está en el rango: ${rangoArea}`);
            const cisternapdf = new window.jspdf.jsPDF();
            cisternapdf.setFontSize(16);
            cisternapdf.setFont("helvetica", "bold");
            cisternapdf.text("Cisterna", 90, 20);

            cisternapdf.setFontSize(11);
            cisternapdf.setFont("helvetica", "bold");

            cisternapdf.text("Datos Ingresados: ", 20, 30);
            cisternapdf.text("Area = " + area + " m2", 40, 40);
            //cisternapdf.text("" + valdotacion + " litros equivalen a " + area + " m2", 40, 50);
            cisternapdf.text("Segun la Normativa IS-010, en una área", 40, 50);
            cisternapdf.text(rangoArea + " equivalen a " + valdotacion + " Litros",
                40, 55);
            cisternapdf.text("# Pisos = " + npisos + " pisos", 40, 65);
            cisternapdf.text("Proceso..", 20, 75);

            cisternapdf.text("Dotación = " + dotacionFinal + " Litros", 40, 85);
            cisternapdf.text("Formula para el Volumen = 3/4 DOTACION", 20, 95);
            cisternapdf.text("Volumen = " + cisternaElevadoVal + " Litros", 40, 105);
            cisternapdf.text("Cisterna: " + resultado.nombre, 40, 115);
            cisternapdf.text("Capacidad: " + String(resultado.capacidad) + " Litros", 120, 115);
            // Agregar la imagen del tanque al PDF
            console.log(resultado.imagen);
            console.log(resultado.medidasproporciones);
            console.log(resultado.diagramaintalacion);
            cisternapdf.addImage(resultado.imagen, 'PNG', 120, 10, 90, 90);
            cisternapdf.addImage(resultado.medidasproporciones, 'PNG', 10, 120, 100, 100);
            cisternapdf.addImage(resultado.diagramaintalacion, 'PNG', 100, 120, 100, 100);

            // Generar el string del PDF
            const string = cisternapdf.output('datauristring');
            // Crear un elemento <embed> para mostrar el PDF
            const embedElement = document.createElement('embed');
            embedElement.setAttribute('width', '100%');
            embedElement.setAttribute('height', '100%');
            embedElement.setAttribute('src', string);

            // Obtener el div donde deseas mostrar el PDF
            const divMostrarInformePago = document.getElementById('resultado');

            // Limpiar cualquier contenido previo dentro del div
            divMostrarInformePago.innerHTML = '';

            // Agregar el elemento <embed> al div
            divMostrarInformePago.appendChild(embedElement);
        }
    </script>
</x-app-layout>
