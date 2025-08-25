<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Gestion Metrados') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-gray-900 dark:text-gray-100"></div>
            </div>
        </div>
        @if (session('success'))
            <div class="alert alert-success">
                {{ session('success') }}
            </div>
        @endif

        <section class="bg-gray-50 dark:bg-gray-900 py-3 sm:py-5 rounded-lg">
            <div class="px-4 mx-auto max-w-screen-2xl lg:px-12">
                <div class="relative overflow-hidden bg-white shadow-md dark:bg-gray-800 sm:rounded-lg">
                    <div
                        class="flex flex-col px-4 py-3 space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 lg:space-x-4">
                        <div
                            class="flex flex-col flex-shrink-0 space-y-3 md:flex-row md:items-center lg:justify-end md:space-y-0 md:space-x-3">
                            <button type="button" id="agregar_ms" data-modal-target="crud-modal"
                                data-modal-toggle="crud-modal"
                                class="block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                Agregar Metrados Estructura
                            </button>
                        </div>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead
                                class="text-xs text-gray-700 text-center uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" class="p-4">
                                        <div class="flex items-center">
                                            <input id="checkbox-all" type="checkbox"
                                                class="w-4 h-4 bg-gray-100 border-gray-300 rounded text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                                            <label for="checkbox-all" class="sr-only">checkbox</label>
                                        </div>
                                    </th>
                                    <th scope="col" class="px-4 py-3">Nombre Proyecto</th>
                                    <th scope="col" class="px-4 py-3">Fecha</th>
                                    <th scope="col" class="px-4 py-3">Especialidad</th>
                                    <th scope="col" class="px-4 py-3">Locacion</th>
                                    <th scope="col" class="px-4 py-3">Modulo</th>
                                    <th scope="col" class="px-4 py-3">Visualizar</th>
                                    <th scope="col" class="px-4 py-3">Editar</th>
                                    <th scope="col" class="px-4 py-3">Eliminar</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach ($metradoestructuras as $metrado)
                                    <tr
                                        class="border-b dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-center">
                                        <td class="w-4 px-4 py-3">
                                            <div class="flex items-center">
                                                <input id="checkbox-table-search-1" type="checkbox"
                                                    onclick="event.stopPropagation()"
                                                    class="w-4 h-4 bg-gray-100 border-gray-300 rounded text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                                                <label for="checkbox-table-search-1" class="sr-only">checkbox</label>
                                            </div>
                                        </td>
                                        <th scope="col"
                                            class="items-center px-4 py-2 font-medium text-gray-900 dark:text-white">
                                            {{ $metrado->nombre_proyecto }}
                                        </th>
                                        <td class="px-4 py-2">
                                            <span
                                                class="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">{{ $metrado->fecha }}</span>
                                        </td>
                                        <td class="px-4 py-2 font-medium text-gray-900  dark:text-white">
                                            {{ $metrado->especialidad }}
                                        </td>
                                        <td class="px-4 py-2 font-medium text-gray-900  dark:text-white">
                                            {{ $metrado->localidad }}</td>
                                        <td class="px-4 py-2 font-medium text-gray-900  dark:text-white">
                                            {{ $metrado->modulo }}</td>
                                        <td class="px-4 py-2 font-medium text-gray-900  dark:text-white">
                                            <a href="{{route('metradoestructuras.show', $metrado->idmetradoestructuras)}}" class="btn text-blue-500">Visualizar</a>
                                        </td>
                                        <td class="px-4 py-2 font-medium text-gray-900 dark:text-white">
                                            <a href="{{ route('metradoestructuras.edit', $metrado->idmetradoestructuras) }}" class="btn text-yellow-500">Editar</a>
                                        </td>
                                        <td class="px-4 py-2">
                                            <form
                                                action="{{ route('metradoestructuras.destroy', $metrado->idmetradoestructuras) }}"
                                                method="POST"
                                                onsubmit="return confirm('¿Estás seguro de eliminar este registro?');">
                                                @csrf
                                                @method('DELETE')
                                                <button type="submit" class="btn text-red-500">Eliminar</button>
                                            </form>
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    </div>

    <!-- Main modal -->
    <div id="crud-modal" tabindex="-1" aria-hidden="true"
        class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
        <div class="relative p-4 w-full max-w-md max-h-full">
            <!-- Modal content -->
            <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
                <!-- Modal header -->
                <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                        Registrar Metrados Estructuras
                    </h3>
                    <button type="button"
                        class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                        id="close-modal">
                        <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                            viewBox="0 0 14 14">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                        </svg>
                        <span class="sr-only">Close modal</span>
                    </button>
                </div>
                <!-- Modal body -->
                <form class="p-4 md:p-5" method="POST" action="{{ route('metradoestructuras.store') }}">
                    @csrf
                    <div class="grid gap-4 mb-4 grid-cols-2">
                        <div class="col-span-2">
                            <label for="nombre_proyecto"
                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nombre de
                                Proyecto</label>
                            <textarea id="nombre_proyecto" name="nombre_proyecto" rows="4"
                                class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                placeholder="Escribe el nombre del documento"></textarea>
                        </div>
                        <div class="col-span-2 sm:col-span-1">
                            <label for="entidadm"
                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">UEI</label>
                            <input type="text" name="entidadm" id="entidadm"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                placeholder="2999" required="">
                        </div>
                        <div class="col-span-2 sm:col-span-1">
                            <label for="fecha"
                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Fecha</label>
                            <input type="date" name="fecha" id="fecha"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                placeholder="2999" required="">
                        </div>
                        <div class="col-span-2">
                            <label for="especialidad"
                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Especialidad</label>
                            <input type="text" name="especialidad" id="especialidad"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                placeholder="especialidad" required="">
                        </div>
                        <div class="col-span-2 sm:col-span-1">
                            <label for="cui"
                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">CUI</label>
                            <input type="text" name="cui" id="cui"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                placeholder="2999" required="">
                        </div>
                        <div class="col-span-2 sm:col-span-1">
                            <label for="codigo_modular"
                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">CÓDIGO
                                MODULAR</label>
                            <input type="text" name="codigo_modular" id="codigo_modular"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                placeholder="2999" required="">
                        </div>
                        <div class="col-span-2 sm:col-span-1">
                            <label for="codigo_local"
                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">CÓDIGO
                                LOCAL</label>
                            <input type="text" name="codigo_local" id="codigo_local"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                placeholder="2999" required="">
                        </div>
                        <div class="col-span-2 sm:col-span-1">
                            <label for="Modulo"
                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Modulo</label>
                            <input type="text" name="modulo" id="modulo"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                placeholder="GENERAL" value="GENERAL" required="">
                        </div>
                        <div class="col-span-2 sm:col-span-2">
                            <label for="localidad"
                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Localidad</label>
                            <input type="text" name="localidad" id="localidad"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                placeholder="Huanuco" required="">
                        </div>
                    </div>
                    <button type="submit"
                        class="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                        <svg class="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd"
                                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                clip-rule="evenodd"></path>
                        </svg>
                        Agregar Metrados Estructuras
                    </button>
                </form>
            </div>
        </div>
    </div>

    <script>
        // Obtener el modal y el botón de abrir
        const modal = document.getElementById('crud-modal');
        const openModalButton = document.getElementById('agregar_ms');
        const closeModalButton = document.getElementById('close-modal');
        const nameInput = document.getElementById('name');

        // Abrir el modal al hacer clic en el botón
        openModalButton.addEventListener('click', () => {
            modal.classList.remove('hidden'); // Muestra el modal
            nameInput.focus(); // Enfoca el campo de "Name" al abrir el modal
        });

        // Cerrar el modal al hacer clic en el botón de cerrar
        closeModalButton.addEventListener('click', () => {
            modal.classList.add('hidden'); // Oculta el modal
        });
    </script>
</x-app-layout>
