<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Gestion Administrativa') }}
        </h2>
    </x-slot>

    <div class="py-1">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6">
                    <div class="container flex flex-col items-center gap-16 mx-auto my-30">
                        <div class="grid w-full grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                            {{-- Registro del personal --}}
                            <div
                                class="flex flex-col items-center gap-3 px-8 py-10 bg-sky-500 hover:bg-sky-800 dark:bg-white dark:hover:bg-sky-500 rounded-3xl shadow-main">
                                <span>
                                    <svg width="80px" height="80px" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
                                            stroke="#000000" stroke-width="2" stroke-linecap="round"
                                            stroke-linejoin="round" />
                                        <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z"
                                            stroke="#000000" stroke-width="2" stroke-linecap="round"
                                            stroke-linejoin="round" />
                                    </svg>
                                </span>
                                <a class="text-lg font-bold text-purple-blue-500"
                                    href="{{ route('gestor-registrarPer', ['empresaId' => $id]) }}">
                                    Creacion de Usuario
                                </a>
                            </div>

                            {{-- cotizador --}}
                            <div
                                class="flex flex-col items-center gap-3 px-8 py-10 bg-sky-500 hover:bg-sky-800 dark:bg-white dark:hover:bg-sky-500 rounded-3xl shadow-main">
                                <span>
                                    <svg width="80px" height="80px" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M9 14H15M9 10H15M12 6V4M7 7H5M7 17H5M19 7H17M19 17H17M12 18V20M7 12C7 14.7614 9.23858 17 12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12Z"
                                            stroke="#000000" stroke-width="2" stroke-linecap="round"
                                            stroke-linejoin="round" />
                                    </svg>
                                </span>
                                <a href="{{ route('gestorprogramasgespro', ['empresaId' => $id]) }}">
                                    <p class="text-2xl font-extrabold text-gray-900">Cotizador</p>
                                </a>
                            </div>

                            {{-- Planner Mensual --}}
                            <div class="flex flex-col items-center gap-3 px-8 py-10 bg-white rounded-3xl shadow-main">
                                <span>
                                    <svg width="80px" height="80px" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M3 9H21M7 3V5M17 3V5M6.2 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4802 21 18.9201 21 17.8V8.2C21 7.07989 21 6.51984 20.782 6.09202C20.5903 5.71569 20.2843 5.40973 19.908 5.21799C19.4802 5 18.9201 5 17.8 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21Z"
                                            stroke="#000000" stroke-width="2" stroke-linecap="round"
                                            stroke-linejoin="round" />
                                    </svg>
                                </span>
                                <a class="text-lg font-bold text-purple-blue-500"
                                    href="{{ route('gestorkanbangen', ['id' => $id]) }}">Planner Mensual</a>
                            </div>

                            {{-- reportes --}}
                            <div
                                class="flex flex-col items-center gap-3 px-8 py-10 bg-sky-500 hover:bg-sky-800 dark:bg-white dark:hover:bg-sky-500 rounded-3xl shadow-main">
                                <span>
                                    <svg width="80px" height="80px" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9 19V13M5 19V9M13 19V11M17 19V5M3 19H21" stroke="#000000"
                                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </span>
                                <a href="{{ route('gestoreportesGen', ['id' => $id]) }}">
                                    <p class="text-2xl font-extrabold text-gray-900">Reportes</p>
                                </a>
                            </div>

                            {{-- Informes --}}
                            <div
                                class="flex flex-col items-center gap-3 px-8 py-10 bg-sky-500 hover:bg-sky-800 dark:bg-white dark:hover:bg-sky-500 rounded-3xl shadow-main">
                                <span>
                                    <svg width="80px" height="80px" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M9 12H15M9 16H12M12 3H8C6.89543 3 6 3.89543 6 5V19C6 20.1046 6.89543 21 8 21H16C17.1046 21 18 20.1046 18 19V9L12 3Z"
                                            stroke="#000000" stroke-width="2" stroke-linecap="round"
                                            stroke-linejoin="round" />
                                        <path d="M12 3V9H18" stroke="#000000" stroke-width="2" stroke-linecap="round"
                                            stroke-linejoin="round" />
                                    </svg>
                                </span>
                                <a href="{{ route('Tramites', ['empresaId' => $id]) }}">
                                    <p class="text-2xl font-extrabold text-gray-900">Tramites</p>
                                </a>
                            </div>

                            {{-- Seguimiento de contratos --}}
                            <div
                                class="flex flex-col items-center gap-3 px-8 py-10 bg-sky-500 hover:bg-sky-800 dark:bg-white dark:hover:bg-sky-500 rounded-3xl shadow-main">
                                <span>
                                    <svg width="80px" height="80px" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M9 12H15M9 16H12M14 3H8C6.89543 3 6 3.89543 6 5V19C6 20.1046 6.89543 21 8 21H16C17.1046 21 18 20.1046 18 19V7L14 3Z"
                                            stroke="#000000" stroke-width="2" stroke-linecap="round"
                                            stroke-linejoin="round" />
                                        <path d="M14 3V7H18" stroke="#000000" stroke-width="2" stroke-linecap="round"
                                            stroke-linejoin="round" />
                                        <path d="M10 9L12 11L16 7" stroke="#000000" stroke-width="2"
                                            stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </span>
                                <a href="{{ route('gestortrabajadorgen', ['id' => $id]) }}">
                                    <p class="text-2xl font-extrabold text-gray-900">Seguimiento de contratos</p>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
