<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>CONSTRUYEHCO</title>
    <link rel="icon" type="image/x-icon" href="{{ url('/storage/avatar_empresa/logo_gespro.png') }}">
    <!-- Fonts -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/flowbite@2.5.2/dist/flowbite.min.css" rel="stylesheet" />
    <style>
        .custom-shape-divider {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            overflow: hidden;
            line-height: 0;
            transform: rotate(180deg);
        }

        .custom-shape-divider svg {
            position: relative;
            display: block;
            width: calc(100% + 1.3px);
            height: 150px;
        }

        .custom-shape-divider .shape-fill {
            fill: #FFFFFF;
        }
    </style>
</head>

<body class="font-sans antialiased dark:bg-black dark:text-white/50">
    <header class="fixed w-full z-50 bg-gray-900 shadow-lg">
        <nav class="bg-gray-900 border-gray-700 py-2.5">
            <div class="flex flex-wrap items-center justify-between max-w-screen-xl px-4 mx-auto">
                <a href="#" class="flex items-center">
                    <img src="{{ asset('/storage/avatar_empresa/logo_gespro.png') }}" class="h-12 mr-3 sm:h-14"
                        alt="Gespro Logo" />
                    <span class="self-center text-2xl font-extrabold whitespace-nowrap text-white">CONSTRYE HCO</span>
                </a>
                <div class="flex items-center lg:order-2">
                    @if (Route::has('login'))
                        @auth
                            <a href="{{ url('/dashboard') }}"
                                class="text-white bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:ring-blue-200 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 sm:mr-2 lg:mr-0 dark:focus:ring-blue-900">
                                Dashboard
                            </a>
                        @else
                            <a href="{{ route('login') }}"
                                class="text-white bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:ring-blue-200 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 sm:mr-2 lg:mr-0 dark:focus:ring-blue-900">
                                Login
                            </a>
                        @endauth
                    @endif
                    <button data-collapse-toggle="mobile-menu-2" type="button"
                        class="inline-flex items-center p-2 ml-1 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                        aria-controls="mobile-menu-2" aria-expanded="false">
                        <span class="sr-only">Open main menu</span>
                        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd"
                                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                                clip-rule="evenodd"></path>
                        </svg>
                        <svg class="hidden w-6 h-6" fill="currentColor" viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clip-rule="evenodd"></path>
                        </svg>
                    </button>
                </div>
                <div class="items-center justify-between hidden w-full lg:flex lg:w-auto lg:order-1" id="mobile-menu-2">
                    <ul class="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
                        <li>
                            <a href="#"
                                class="block py-2 pl-3 pr-4 text-blue-600 rounded lg:bg-transparent lg:text-blue-600 lg:p-0 dark:text-white"
                                aria-current="page">Inicio</a>
                        </li>
                        <li>
                            <a href="#"
                                class="block py-2 pl-3 pr-4 text-gray-400 border-b border-gray-700 hover:bg-gray-700 lg:hover:bg-transparent lg:border-0 lg:hover:text-blue-600 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700">
                                Proyectos
                            </a>
                        </li>
                        <li>
                            <a href="#"
                                class="block py-2 pl-3 pr-4 text-gray-400 border-b border-gray-700 hover:bg-gray-700 lg:hover:bg-transparent lg:border-0 lg:hover:text-blue-600 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700">
                                Servicios
                            </a>
                        </li>
                        <li>
                            <a href="#"
                                class="block py-2 pl-3 pr-4 text-gray-400 border-b border-gray-700 hover:bg-gray-700 lg:hover:bg-transparent lg:border-0 lg:hover:text-blue-600 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700">
                                Contacto
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    </header>

    <section class="bg-white dark:bg-gray-900 text-gray-950 dark:text-white py-32 md:py-40">
        <div class="grid max-w-screen-xl px-4 mx-auto lg:gap-8 xl:gap-0 lg:py-16 lg:grid-cols-12">
            <div class="mr-auto place-self-center lg:col-span-7 animate-fadeIn">
                <h1
                    class="max-w-2xl mb-4 text-5xl font-extrabold leading-none tracking-tight md:text-6xl xl:text-7xl animate-pulse">
                    CONSTRUYE HCO
                </h1>
                <p class="max-w-3xl mb-6 font-semibold lg:mb-8 md:text-lg lg:text-xl animate-pulse">
                    Servicios expertos de consultoría de construción para hacer realidad su visión
                </p>
                <div class="space-y-4 sm:flex sm:space-y-0 sm:space-x-4">
                    <a href="#"
                        class="inline-flex items-center justify-center w-full px-5 py-3 text-sm font-medium text-center text-white bg-blue-500 rounded-lg sm:w-auto hover:bg-blue-600 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 animate-bounce">
                        Contactenos
                    </a>
                </div>
            </div>
            <div class="hidden lg:-mt-24 lg:col-span-5 lg:flex animate-fadeInRight">
                <div id="indicators-carousel" class="relative w-full" data-carousel="slide">
                    <!-- Carousel wrapper -->
                    <div class="relative h-56 overflow-hidden rounded-lg md:h-96">
                        <!-- Item 1 -->
                        <div class="hidden duration-700 ease-in-out" data-carousel-item="active">
                            <img src="{{ asset('/storage/avatar_gespro/07.jpg') }}"
                                class="absolute block w-full h-full object-contain -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
                                alt="...">
                        </div>
                        <!-- Item 2 -->
                        <div class="hidden duration-700 ease-in-out" data-carousel-item>
                            <img src="{{ asset('/storage/avatar_gespro/03.jpg') }}"
                                class="absolute block w-full h-full object-contain -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
                                alt="...">
                        </div>
                        <!-- Item 3 -->
                        <div class="hidden duration-700 ease-in-out" data-carousel-item>
                            <img src="{{ asset('/storage/avatar_gespro/proyectoV.jpg') }}"
                                class="absolute block w-full h-full object-contain -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
                                alt="...">
                        </div>
                        <!-- Item 4 -->
                        <div class="hidden duration-700 ease-in-out" data-carousel-item>
                            <img src="{{ asset('/storage/avatar_gespro/04.jpg') }}"
                                class="absolute block w-full h-full object-contain -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
                                alt="...">
                        </div>
                        <!-- Item 5 -->
                        <div class="hidden duration-700 ease-in-out" data-carousel-item>
                            <img src="{{ asset('/storage/avatar_gespro/07.jpg') }}"
                                class="absolute block w-full h-full object-contain -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
                                alt="...">
                        </div>
                    </div>
                    <!-- Slider indicators -->
                    <div class="absolute z-30 flex -translate-x-1/2 space-x-3 rtl:space-x-reverse bottom-5 left-1/2">
                        <button type="button" class="w-3 h-3 rounded-full" aria-current="true" aria-label="Slide 1"
                            data-carousel-slide-to="0"></button>
                        <button type="button" class="w-3 h-3 rounded-full" aria-current="false" aria-label="Slide 2"
                            data-carousel-slide-to="1"></button>
                        <button type="button" class="w-3 h-3 rounded-full" aria-current="false"
                            aria-label="Slide 3" data-carousel-slide-to="2"></button>
                        <button type="button" class="w-3 h-3 rounded-full" aria-current="false"
                            aria-label="Slide 4" data-carousel-slide-to="3"></button>
                        <button type="button" class="w-3 h-3 rounded-full" aria-current="false"
                            aria-label="Slide 5" data-carousel-slide-to="4"></button>
                    </div>
                    <!-- Slider controls -->
                    <button type="button"
                        class="absolute top-0 start-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
                        data-carousel-prev>
                        <span
                            class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
                            <svg class="w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180" aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="2" d="M5 1 1 5l4 4" />
                            </svg>
                            <span class="sr-only">Previous</span>
                        </span>
                    </button>
                    <button type="button"
                        class="absolute top-0 end-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
                        data-carousel-next>
                        <span
                            class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
                            <svg class="w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180" aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="2" d="m1 9 4-4-4-4" />
                            </svg>
                            <span class="sr-only">Next</span>
                        </span>
                    </button>
                </div>
            </div>
            {{-- <div class="hidden lg:mt-0 lg:col-span-5 lg:flex animate-fadeInRight">
                <div class="grid grid-cols-3 gap-4">
                    <div
                        class="col-span-2 row-span-2 animate-zoomIn duration-500 hover:scale-105 hover:shadow-xl rounded-tl-3xl rounded-br-3xl">
                        <img src="{{ asset('/storage/avatar_gespro/07.jpg') }}" alt="Imagen 1"
                            class="w-full h-auto rounded-tl-3xl rounded-br-3xl shadow-lg">
                    </div>
                    <div class="animate-slideInLeft duration-500 hover:scale-105 hover:shadow-xl rounded-tr-3xl">
                        <img src="{{ asset('/storage/avatar_gespro/03.jpg') }}" alt="Imagen 2"
                            class="w-full h-auto rounded-tr-3xl shadow-lg">
                    </div>
                    <div class="animate-slideInRight duration-500 hover:scale-105 hover:shadow-xl rounded-bl-3xl">
                        <img src="{{ asset('/storage/avatar_gespro/proyectoV.jpg') }}" alt="Imagen 3"
                            class="w-full h-auto rounded-bl-3xl shadow-lg">
                    </div>
                    <div class="animate-zoomIn duration-500 hover:scale-105 hover:shadow-xl rounded-br-3xl">
                        <img src="{{ asset('/storage/avatar_gespro/04.jpg') }}" alt="Imagen 4"
                            class="w-full h-auto rounded-br-3xl shadow-lg">
                    </div>
                    <div
                        class="col-span-2 row-span-2 animate-zoomIn duration-500 hover:scale-105 hover:shadow-xl rounded-tl-3xl rounded-br-3xl">
                        <img src="{{ asset('/storage/avatar_gespro/07.jpg') }}" alt="Imagen 1"
                            class="w-full h-auto rounded-tl-3xl rounded-br-3xl shadow-lg">
                    </div>
                    <div class="animate-slideInLeft duration-500 hover:scale-105 hover:shadow-xl rounded-tr-3xl">
                        <img src="{{ asset('/storage/avatar_gespro/03.jpg') }}" alt="Imagen 2"
                            class="w-full h-auto rounded-tr-3xl shadow-lg">
                    </div>
                </div>
            </div> --}}
        </div>
    </section>

    <div class="custom-shape-divider">
        <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg"
            class="w-10 h-10 mb-2 text-blue-600 md:w-12 md:h-12 dark:text-blue-500" viewBox="0 0 1200 120"
            preserveAspectRatio="none">
            <path
                d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
                opacity=".25" class="shape-fill"></path>
            <path
                d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
                opacity=".5" class="shape-fill"></path>
            <path
                d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
                class="shape-fill"></path>
        </svg>
    </div>

    <section class="bg-white dark:bg-gray-900">
        <div
            class="items-center max-w-screen-xl px-4 py-12 mx-auto lg:grid lg:grid-cols-4 lg:gap-16 xl:gap-24 lg:py-24 lg:px-6">
            <div class="col-span-2 mb-8">
                <p class="text-lg font-medium text-blue-600 dark:text-blue-500">Juntos Costruimos tus sueños</p>
                <h2 class="mt-3 mb-4 text-3xl font-extrabold tracking-tight text-gray-900 md:text-3xl dark:text-white">
                    NOSOTROS</h2>
                <p class="font-light text-gray-500 sm:text-xl dark:text-gray-400">Somos una empresa especializada en la
                    creación, ejecución y supervisión de proyectos de infraestructura, tanto públicos como privados,
                    comprometida con ofrecer un trabajo de máxima calidad...</p>
            </div>
            <div class="col-span-2 space-y-8 md:grid md:grid-cols-2 md:gap-12 md:space-y-0">
                <!-- Proyecto -->
                <div class="relative text-center">
                    <div class="relative flex justify-center items-center">
                        <svg enable-background="new 0 0 128 128" height="80px" width="80px" id="Слой_1"
                            version="1.1" viewBox="0 0 128 128" xml:space="preserve"
                            xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                            <g />
                            <path
                                d="M119,90.2c-1.1,0-2.4,0.2-3.8,0.6l-21.3,7.4c0-0.1,0-0.1,0-0.2c0-0.1,0-0.2,0-0.3c0-0.2,0-0.3,0-0.5  c0-0.1,0-0.2,0-0.2c0,0,0-0.1,0-0.1c0,0,0-0.1,0-0.1c0-0.2-0.1-0.5-0.1-0.7c0,0,0,0,0-0.1l0,0c-0.9-3.9-4.5-6.8-8.7-6.8H68.2  c-7.8-9.9-25.9-10-26.7-10h-13v-4.8H2v44.1h26.5v-4.2l32.8,10.4c0.2,0.1,5.1,1.5,10.7,1.5h0c3.4,0,6.4-0.5,9-1.6  c6.6-2.7,33.1-16.9,41.1-21.2c2.2-1.2,5.2-4.6,3.5-8.7C124.3,91.7,122.1,90.2,119,90.2z M24.5,114.4H6V78.3h18.5V79v33.8V114.4z   M120.1,99.8c-7.9,4.3-34.3,18.3-40.7,21c-2,0.8-4.5,1.3-7.4,1.3h0c-5.1,0-9.6-1.3-9.6-1.3l-34-10.7V83h13c0.2,0,17.8,0.1,24,9.2  l0.6,0.9h18.9c2.5,0,4.6,1.8,4.9,4.2c0,0,0,0.1,0,0.1c0,0.2,0,0.3,0,0.5c0,0.2,0,0.4-0.1,0.6c0,0.1,0,0.2,0,0.3  c0,0.2-0.1,0.4-0.2,0.6c0,0.1,0,0.2-0.1,0.2c-0.1,0.3-0.2,0.5-0.4,0.7l0,0c-0.8,1.2-2.2,2-3.8,2h-26v4h26c2.7,0,5.2-1.3,6.8-3.3  l24.3-8.4c1-0.3,1.9-0.4,2.7-0.4c1.5,0,2.2,0.5,2.8,1.9C122.6,98,120.7,99.5,120.1,99.8z"
                                fill="#3EBBC4" />
                            <path
                                d="M105.4,73V35.2l4.7,4.7l2.8-2.8l-7.5-7.5V9.4H93.3v8L79,3.2L45.1,37.1l2.8,2.8l4.7-4.7V73H105.4z M97.3,27.1  V13.4h4.1v17.7v0.1V69H56.6V31.2L79,8.8L97.3,27.1z"
                                fill="#3EBBC4" />
                        </svg>
                    </div>
                    <h3 class="text-4xl font-bold text-gray-900 dark:text-white" id="counter-projects">0</h3>
                    <p class="font-light text-gray-500 dark:text-gray-400">PROYECTOS EJECUTADOS</p>
                </div>

                <!-- Clientes -->
                <div class="relative text-center">
                    <div class="relative flex justify-center items-center">
                        <svg enable-background="new 0 0 160 240" height="80px" width="80px" id="Layer_1"
                            version="1.1" viewBox="0 0 160 240" xml:space="preserve"
                            xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                            <g>
                                <path
                                    d="M127.6,220.9c17.2-9.6,4.2-17-11.8-24.6c-17.8-8.5-24.2-10.6-40.5-1.6c-13.9,7.6-1.6,14.9,14.6,22.5   C108.4,225.8,115.5,227.8,127.6,220.9z"
                                    opacity="0.2" />
                                <path
                                    d="M86.9,192.6c-3.4,2.5-6.8,4-9.8,5.6c-3,1.6-4.5,3.1-4.1,4.5c0.3,1.5,3,3.2,7.6,3s12-4.4,13.4-4.5   c1.4-0.1,1.1,0.8,2.1,0.8c1,0,6.4-1,7-1.7c0.6-0.7-0.1-5.7-0.1-5.7L86.9,192.6z"
                                    fill="#262626" />
                                <path
                                    d="M103.1,200.3c0.3-0.4,0.3-1.8,0.2-3.1c-1.3,1.2-3.5,1.9-5.7,2c-2.6,0.1-5.7,0.6-9.3,2.9   c-3.6,2.3-16,4.2-14.6-1.4c-0.6,0.7-0.9,1.4-0.7,2.1c0.3,1.5,3,3.2,7.6,3c4.6-0.2,12-4.4,13.4-4.5c1.4-0.1,1.1,0.8,2.1,0.8   C97.1,202,102.5,201,103.1,200.3z"
                                    opacity="0.5" />
                                <path
                                    d="M89.1,114c-0.9,6.6-1.3,29.8-0.4,40.3c0.8,10.6,0.7,25.9-0.1,31.2c-0.6,3.9-2.5,6-2,7.4   c0.5,1.5,5,4.6,10.2,5.2c5.1,0.6,7.2-0.2,7.9-2.2c0.6-2,2.8-23.5,3.5-37c0.6-12,1.7-45.1,1.7-45.1H89.1z"
                                    fill="#656565" />
                                <path
                                    d="M89.1,114c-0.9,6.6-1.3,29.8-0.4,40.3c0.8,10.6,0.7,25.9-0.1,31.2c-0.6,3.9-2.5,6-2,7.4   c0.5,1.5,5,4.6,10.2,5.2c5.1,0.6,7.2-0.2,7.9-2.2c0.6-2,2.8-23.5,3.5-37c0.6-12,1.7-45.1,1.7-45.1H89.1z"
                                    opacity="0.3" />
                                <path
                                    d="M117.9,204.6c-0.8,2.3-4.3,8-5,9.4c-0.8,1.4-2.3,3.3-1.3,4.7c1,1.5,5.7,3.3,10.4,1c4.7-2.2,5.5-7.7,5.5-7.7   h0.8c0,0,1-2.3,1-3.9c0-1.6-0.3-2.6-0.3-2.6L117.9,204.6z"
                                    fill="#262626" />
                                <path
                                    d="M127.5,212.1h0.8c0,0,1-2.3,1-3.9c0-1.6-0.3-2.6-0.3-2.6l-0.1,0c-0.1,0.2-0.1,0.4-0.1,0.6   c-0.2,1.3-2.5,8.3-3.8,10c-3.4,4.4-12.6,5.4-13.5,0.3c-0.3,0.8-0.4,1.6,0.1,2.2c1,1.5,5.7,3.3,10.4,1   C126.7,217.5,127.5,212.1,127.5,212.1z"
                                    opacity="0.5" />
                                <path
                                    d="M101,114.7c0.1,4.3,4.5,9.3,5.8,15.4c1.3,6.1,5.3,36.3,6.3,45.2c1.5,12.9,2.8,31.7,3.2,31.9   c0.4,0.1,3.7-1.9,6.9-0.2c3.2,1.7,6.8,1,7.9,0.2c1-0.8,0.6-9.4,0.2-14.6c-0.3-5.1-1.9-43.6-1.8-48.8c0.1-5.2,1.8-19.3,1.4-22.6   c-0.4-3.4-2.3-7.3-2.3-7.3L101,114.7z"
                                    fill="#656565" />
                                <path
                                    d="M101,114.7c0.1,4.3,4.5,9.3,5.8,15.4c1.3,6.1,5.3,36.3,6.3,45.2c1.5,12.9,2.8,31.7,3.2,31.9   c0.4,0.1,3.7-1.9,6.9-0.2c3.2,1.7,6.8,1,7.9,0.2c1-0.8,0.6-9.4,0.2-14.6c-0.3-5.1-1.9-43.6-1.8-48.8c0.1-5.2,1.8-19.3,1.4-22.6   c-0.4-3.4-2.3-7.3-2.3-7.3L101,114.7z"
                                    opacity="0.15" />
                                <path
                                    d="M90.8,67.4c-2.5,4-5.1,10.3-6.6,14.5c-1.5,4.2-5.4,11.7-5.7,12.7c-0.2,0.9-0.1,4.6,3.4,5.7s5.2,1.8,5.8,0.9   c0.5-0.8,4.2-5,4.2-5L90.8,67.4z"
                                    fill="#656565" />
                                <path
                                    d="M90.8,67.4c-2.5,4-5.1,10.3-6.6,14.5c-1.5,4.2-5.4,11.7-5.7,12.7c-0.2,0.9-0.1,4.6,3.4,5.7s5.2,1.8,5.8,0.9   c0.5-0.8,4.2-5,4.2-5L90.8,67.4z"
                                    opacity="0.15" />
                                <path
                                    d="M103.6,39.7c-2,1.6-10.2,13.3-10.6,27.7s3.2,21.1,3.2,21.1s10.9-29.1,16.9-35.5c6-6.4,5.6-11.5,5.6-11.5   s-3.8-2.6-7.9-2.9S103.6,39.7,103.6,39.7z"
                                    fill="#FFFFFF" />
                                <path
                                    d="M103.3,49.7l2.3,6.4l6.4-4.3l-6.8,6L103,50l-1-0.2l-3.8,4.3c0,0,0-4.1,0-3.8c0,0.3,0.3,1.9,0.3,1.9l3.5-3.4   L103.3,49.7z"
                                    opacity="0.2" />
                                <path
                                    d="M100.4,54.3l-0.1-3.8l1.5-1.6l1.5,0.7l1,2.7l-2.3,2.3c0,0-2.1,18.1-2.3,20.4s-3.1,13-3.1,13   s-4.5-12.5-4.3-12.7C92.4,75,100.4,54.3,100.4,54.3z"
                                    fill="#28896D" />
                                <path
                                    d="M136.6,122.9c-0.3,1-0.2,2-2,3.2c-1.7,1.3-3.1,3.6-3.5,5.2c-0.4,1.6-1.7,3.5-1.9,4.7   c-0.1,1.2,0.8,2,1.8,1.1c1-0.8,2.9-4.5,3.9-4.8c1-0.3,1.3,2.9,1.4,4c0.1,1-1.5,3-2.2,4c-0.8,1-0.1,1.9,1,1.6s5.9-2.9,7.1-7.9   c1.3-5,0.7-12,0.7-12L136.6,122.9z"
                                    fill="#FBD7C7" />
                                <path
                                    d="M134.4,122.2l-0.1,2c0,0,3.8,0.9,6.9,0.6c3.1-0.3,3.8-1,3.8-1l-0.3-3L134.4,122.2z"
                                    fill="#FFFFFF" />
                                <path
                                    d="M107.3,38.8c-2.1,0.3-9.2-2-13.2,4.1s-4.7,12.6-4.9,18.3s-1.2,43-1.2,49.5c0,6.6,0.1,9.5,3,10.4   c3.4,1.1,5.9-1.9,6-3.8c0.1-2-0.3-30.7-0.3-30.7s-5.1-12-1.8-25.8s8.5-18.4,8.5-18.4l4.1-3.5L107.3,38.8z"
                                    fill="#656565" />
                                <path
                                    d="M117.5,40.4c0,0,4,3.3,6.2,5.1c2.2,1.8,11.9,10.5,12.9,11.7c1,1.2,2.2,2.4,2.2,5.7s0.4,8.4,1.7,11.9   c4.1,10.6,4.3,15.2,4.6,19.8s0.9,26.6,0.9,26.6s-1.3,1.2-6.4,1.8c-5.2,0.6-6.4-0.1-6.4-0.1s-1.5-14.2-2.3-19.3   c-1.3-7.8-5-16.1-5-16.1s-0.6,3.5-0.3,5.6c0.3,2.1,4.1,19.3,4.9,22.1c0.8,2.7,1.7,6.1,1.7,6.1s-4.2,6.6-15.6,6.1s-18.2-4-19.6-11   c-1.4-7-1.7-24.5,0.1-34.3s9.7-25.6,14.9-31.4S117.5,40.4,117.5,40.4z"
                                    fill="#656565" />
                                <path
                                    d="M97.5,86.7c0,0,3.5-8.9,8.9-16.5c3.8-5.2,7.8-8.6,7.8-8.6l-0.3-3.4l4.1-1.5l2.5-13.7l0.5,0.5l-1.7,14.1   l-4.6,1l1,3.5c0,0-5.4,4.7-9,9.2C102.8,76.1,97.5,86.7,97.5,86.7z"
                                    opacity="0.2" />
                                <path
                                    d="M101.8,18.8c-3.8,2.8-4,10.3-3.9,15.4c0.1,5.1,0.7,9.3,1.5,9.7c0.8,0.4,2.4,0.6,2.4,0.6s-0.1,4.9,1.1,5.1   c1.2,0.3,7.8-2.8,10.9-6c3.1-3.1,3.5-3.8,3.5-3.8s4.3-7.9,3.6-14.1C120,19.5,112.4,11.1,101.8,18.8z"
                                    fill="#FBD7C7" />
                                <path
                                    d="M98.5,21.9c-0.6,1,1.5,0.8,4.5,5.4c3.1,4.6,6.6,2.6,7.6,2.6c0.3,2.5,2.4,2.1,4.3,4.3c0,0,0.7-2.5,2.1-2.6   c1.4-0.1,0.9,4.2,0.9,4.2s0.2,1.7,1.2,2c1,0.3,4.7-8.8,2.8-14.7C119,13.7,105.4,10.4,98.5,21.9z"
                                    fill="#762C07" />
                                <path
                                    d="M79.4,95c0.5-0.5,3.6-0.4,5.3,1.3c1.7,1.7,2.2,3.6,1.9,4.1c-0.2,0.4-2.4,0.2-4.9-1.5   C79.3,97.2,78.9,95.7,79.4,95z"
                                    fill="#FFFFFF" />
                                <path
                                    d="M80,95.4c1.2-0.4,3.1,0.1,4.3,1.3c1.2,1.1,1.7,2.2,1.6,3s-1,2.7-1.2,3.6c-0.2,0.8-2.7,4.2-3.5,5.3   c-0.7,1.2-1.6,1.7-1.8,3.5c-0.2,1.8-0.8,2.7-2.1,2.8c-1.3,0.1-6.1-2.9-5.2-7.2c0.9-4.2,2.6-6.7,3.6-8.1c0.5-0.7,2.6-1.8,3.3-2.3   C79.8,96.7,79.5,95.6,80,95.4z"
                                    fill="#FBD7C7" />
                            </g>
                            <g>
                                <path
                                    d="M73.6,231c17.2-9.6,4.2-17-11.8-24.6c-17.8-8.5-24.9-11.7-40.5-1.6c-9.5,6.1-2.4,15.9,13.8,23.5   C53.5,236.9,61.4,237.8,73.6,231z"
                                    opacity="0.2" />
                                <path
                                    d="M21.6,214.3c0,2.1-0.1,5.9,3.8,5.9s5.9-2.9,6.2-3.8c0.3-1-0.1-3,1.3-3.8c1.3-0.8,6.3-2.5,6.6-7.1   c0.4-4.9-1.8-5-3.5-5c-1.7,0-5.9,0.3-5.9,0.3L21.6,214.3z"
                                    fill="#262626" />
                                <path
                                    d="M38,200.8c1.2,1.5,1,3.9,0.1,5.7c-1.9,3.6-6.4,3.1-6.8,5.2c-0.4,2.1-2.7,5.6-5.4,6c-2,0.3-3.2-0.3-4.2-1.2   c0.2,1.8,1,3.6,3.8,3.6c4,0,5.9-2.9,6.2-3.8c0.3-1-0.1-3,1.3-3.8c1.3-0.8,6.3-2.5,6.6-7.1C39.8,202.4,39,201.3,38,200.8z"
                                    opacity="0.5" />
                                <path
                                    d="M21,126.3c-0.3,6,1.4,21.3,1.2,32.8c-0.2,11.5-2.8,43.8-2.5,47.6c0.3,3.8-0.3,8.8,3.8,9.6   c3.2,0.6,7.4-1.8,9-4.3c1.6-2.5,2.6-6.2,2.7-10.5c0.1-4.3,9.4-58.4,9.5-60.6c0.1-2.2-1-13.8-1-13.8L21,126.3z"
                                    fill="#06547A" />
                                <path
                                    d="M21,126.3c-0.3,6,1.4,21.3,1.2,32.8c-0.2,11.5-2.8,43.8-2.5,47.6c0.3,3.8-0.3,8.8,3.8,9.6   c3.2,0.6,7.4-1.8,9-4.3c1.6-2.5,2.6-6.2,2.7-10.5c0.1-4.3,9.4-58.4,9.5-60.6c0.1-2.2-1-13.8-1-13.8L21,126.3z"
                                    opacity="0.3" />
                                <path
                                    d="M49.9,28.4c2.5,1,4.3,3.8,4.7,10.3c0.4,6.5,0,11.6-1.5,12.3c-1.5,0.7-2.5,0.4-2.5,0.4l1.1,7.1l-16.8-4.7   c0,0,0.3-3.9-0.6-6.4s-3.5-11.2-0.8-15.2C36.3,28.2,41.9,25.4,49.9,28.4z"
                                    fill="#FBD7C7" />
                                <path
                                    d="M10.2,114.6c0,0-0.8,7-0.5,8.7c0.3,1.7,3.5,9.6,5.3,10c1.8,0.4,3.6-1,3.4-2.3c-0.2-1.2-2-3.3-2.1-5.4   s-0.1-5.3,0.8-5.7c0.9-0.5,2.9,2,3.8,3.1c0.9,1.1,2.5,0.7,2.5-0.2c0-0.8-1.9-2.6-2.3-4.1c-0.4-1.5-1.2-2.7-2.3-4   c-1.1-1.4-1.5-2.3-1.5-2.3L10.2,114.6z"
                                    fill="#FBD7C7" />
                                <path
                                    d="M9,112.5c0,0-0.6,3.1,0.5,3.8c0.9,0.5,4.5,1.2,6.8,0.3c2-0.8,3.1-1.5,3.2-2.2c0.1-0.7-0.8-2-0.8-2L9,112.5z   "
                                    fill="#FFFFFF" />
                                <path
                                    d="M48.7,225c0,2,0,3.3,0,4.1c0,0.8,0.1,2.9,4.3,2.6s6.4-1.2,6.6-1.5c0.2-0.3,0.7-1.1,0.7-1.1   s7.2,0.6,12.4-1.6c5.4-2.3,8.6-7.3,4-9.4c-2.8-1.3-4.4,0.3-8.6-0.2c-4.5-0.5-7.1-2.7-7.1-2.7L48.7,225z"
                                    fill="#262626" />
                                <path
                                    d="M72.8,227.4c5.4-2.3,8.6-7.3,4-9.4c4.8,4.5-4.5,8.7-8.6,9c-2.7,0.2-8.6,0.5-12.4,1.3   c-3.1,0.6-6.2,0.4-7.1-0.8c0,0.7,0,1.3,0,1.7c0,0.8,0.1,2.9,4.3,2.6c4.3-0.3,6.4-1.2,6.6-1.5c0.2-0.3,0.7-1.1,0.7-1.1   S67.6,229.5,72.8,227.4z"
                                    opacity="0.5" />
                                <path
                                    d="M38.1,129.4c-0.4,6.2,2.3,19.4,3.4,26.8c1,7.4,2.9,38.7,3.7,46.5c0.6,6.3,2.7,23.4,3.9,24.3   c1.2,0.9,9.6-0.3,13.1-2.6c2.3-1.6,4.9-4.7,4.5-6.8c-0.4-2.1-3.1-4.1-3.5-14.9c-0.3-10.8,0.9-30.2,0.6-44.9   c-0.3-14.8-1-31.5-1-31.5L38.1,129.4z"
                                    fill="#06547A" />
                                <path
                                    d="M38.1,129.4c-0.4,6.2,2.3,19.4,3.4,26.8c1,7.4,2.9,38.7,3.7,46.5c0.6,6.3,2.7,23.4,3.9,24.3   c1.2,0.9,9.6-0.3,13.1-2.6c2.3-1.6,4.9-4.7,4.5-6.8c-0.4-2.1-3.1-4.1-3.5-14.9c-0.3-10.8,0.9-30.2,0.6-44.9   c-0.3-14.8-1-31.5-1-31.5L38.1,129.4z"
                                    opacity="0.15" />
                                <path
                                    d="M17.4,56.9c-1.2,1.4-2,5.5-2.3,7.6c-0.3,2.1-5.7,19.3-6.6,22.7c-0.9,3.4-0.8,9.1-0.6,14.4   C8,107,8,113.3,8.1,114.3c0.1,1,4,2,6.9,1.6c2.9-0.4,4.6-1.2,4.9-3.6s1.8-13.9,3.8-18.1c2-4.2,4.9-11.7,4.9-11.7L17.4,56.9z"
                                    fill="#06547A" />
                                <path
                                    d="M17.4,56.9c-1.2,1.4-2,5.5-2.3,7.6c-0.3,2.1-5.7,19.3-6.6,22.7c-0.9,3.4-0.8,9.1-0.6,14.4   C8,107,8,113.3,8.1,114.3c0.1,1,4,2,6.9,1.6c2.9-0.4,4.6-1.2,4.9-3.6s1.8-13.9,3.8-18.1c2-4.2,4.9-11.7,4.9-11.7L17.4,56.9z"
                                    opacity="0.15" />
                                <path
                                    d="M70.5,104.3l0.1,8.8c0,0,4.1,1.1,7.1-0.5c3-1.6,5.2-4.7,5.2-5.8c0-1.1-0.3-2.4-1.3-2.4   c-1.1,0-2,1.6-3.2,0.3c-1.3-1.3-0.4-2.2,0.6-2.9c0.9-0.7,1.3-2.5-0.8-2.3c-1,0.1-1.9,0.8-2.5,1.3c-0.9,0.8-1.8,1.8-3,2.8   C71.3,104.7,70.5,104.3,70.5,104.3z"
                                    fill="#FBD7C7" />
                                <path
                                    d="M35,50.3l-3.6,0.8l0.1,0.9c0,0-5.5-0.7-9.4,1.4c-4,2.1-6.1,4-5.6,7.3c0.6,3.4,3.9,15.1,6.1,21.1   c2.2,6,3.5,9.3,2.9,14.2s-7.1,27.7-6.7,31.2s5.8,6.1,12.5,7.9c6.9,1.8,31.9,3.2,32.4-1.9s0.5-18.9,0.5-18.9s7.1,1.3,8.4-0.4   c1.3-1.7,2.8-4.5,1.2-7.9c-1.5-3.4-2.1-3.5-3.1-3.8c-1-0.3-5.5-1-6.8-2.7c-1.3-1.6-0.3-7.8-0.3-15.7s0.3-13.6-3.2-17.3   c-3.5-3.7-7.5-8.9-10.8-10.1C45.2,55,34.3,55.3,35,50.3z"
                                    fill="#06547A" />
                                <path
                                    d="M32.3,51c0,0,0.1,5.2,7.4,6.1c6.9,0.9,19,8.5,19,8.5s-13-7.3-18.9-7.8c-8.8-0.7-8.4-6.8-8.4-6.8L32.3,51z"
                                    opacity="0.2" />
                                <path
                                    d="M48.4,43.8c0.1,0.8,1-1.3,1.7-3.1c0.7-1.9,2-4.3,2.7-7c0.7-2.7,1.3-1.7,1.4-2.9c0.1-1.2-5.7-8.9-16.3-5.2   s-8,16-7.1,19.4c1,3.4,4.1,7.3,7.1,7.3c3-0.1,6.5-2.4,6.8-6.8S48.3,42,48.4,43.8z"
                                    fill="#825012" />
                            </g>
                        </svg>
                    </div>
                    <h3 class="text-4xl font-bold text-gray-900 dark:text-white" id="counter-clients">0</h3>
                    <p class="font-light text-gray-500 dark:text-gray-400">CLIENTES SATISFECHOS</p>
                </div>

                <!-- proyectos ejecutados -->
                <div class="relative text-center">
                    <div class="relative flex justify-center items-center">
                        <svg enable-background="new 0 0 128 128" height="80px" width="80px" id="Слой_1"
                            version="1.1" viewBox="0 0 128 128" xml:space="preserve"
                            xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                            <g>
                                <rect fill="#3EBBC4" height="4" width="40" x="24" y="112" />
                                <path
                                    d="M6,100h26v0v2H14c-6.6,0-12,5.4-12,12s5.4,12,12,12h60c6.6,0,12-5.4,12-12s-5.4-12-12-12H56v-2l10,0   c3.9,0,7-3.1,7-7V80.7c0-2.1-0.6-4.2-1.6-6l-5.5-9.5l21.7-33.6l26.1,44.9c0.9,1.5,2.3,2.6,4,3c0.6,0.1,1.1,0.2,1.7,0.2   c0.1,0,0.2,0,0.3,0v4.6l-28.7,6.3l-2.5-4.5l-3.5,2l6.8,12.2c4.3,7.7,12.4,12.2,20.8,12.2c1.9,0,3.8-0.2,5.8-0.7   c3.1-0.8,5.3-3.6,5.3-6.8V78.2c2.3-2,2.9-5.4,1.4-8.1l-28.8-52c1.5-3,0.6-6.7-2.2-8.7c-3-2.2-7.2-1.6-9.5,1.4L53.8,50   c-0.2,0-0.5,0-0.7,0H32v15H20c-2.2,0-4,1.8-4,4v6H6c-2.2,0-4,1.8-4,4v17C2,98.2,3.8,100,6,100z M119.6,105.1c0,1.4-0.9,2.6-2.3,2.9   c-8.7,2.2-17.8-1.8-22.1-9.6l-2.3-4.1l26.7-5.9V105.1z M82,114c0,4.4-3.6,8-8,8H14c-4.4,0-8-3.6-8-8s3.6-8,8-8h60   C78.4,106,82,109.6,82,114z M52,102H36v-2l16,0V102z M69,80.7v5.9l-24.6-4.8C43,81.5,42,80.3,42,78.9V54h11.1   c1.1,0,2.1,0.6,2.6,1.5l12.2,21.2C68.6,77.9,69,79.3,69,80.7z M120.6,75.5c-0.6,0.3-1.3,0.4-1.9,0.3c-0.7-0.2-1.2-0.6-1.6-1.2   L90,27.9l3.8-5.9L121.6,72C122.2,73.2,121.8,74.8,120.6,75.5z M87.8,13.2c1-1.2,2.7-1.5,4-0.6c1.3,0.9,1.6,2.6,0.8,4L63.7,61.3   l-4.5-7.8c-0.4-0.7-0.9-1.3-1.5-1.8L87.8,13.2z M36,54h2v24.9c0,3.4,2.4,6.2,5.7,6.9L69,90.6V93c0,1.7-1.3,3-3,3l-30,0V54z M20,69   h12v6H20V69z M6,79h3v7h4v-7h19v17H6V79z"
                                    fill="#3EBBC4" />
                                <circle cx="14" cy="114" fill="#3EBBC4" r="3" />
                                <circle cx="74" cy="114" fill="#3EBBC4" r="3" />
                            </g>
                        </svg>
                    </div>
                    <h3 class="text-4xl font-bold text-gray-900 dark:text-white" id="regions-ejecutados">0</h3>
                    <p class="font-light text-gray-500 dark:text-gray-400">PROYECTOS EJECUTÁNDOSE</p>
                </div>

                <!-- Regiones -->
                <div class="relative text-center">
                    <div class="relative flex justify-center items-center">
                        <svg id="Layer_1" style="enable-background:new 0 0 120 120;" height="80px" width="80px"
                            version="1.1" viewBox="0 0 120 120" xml:space="preserve"
                            xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                            <style type="text/css">
                                .st0 {
                                    fill: #75ABF9;
                                }

                                .st1 {
                                    fill: #FFFFFF;
                                }

                                .st2 {
                                    fill: #D90049;
                                }
                            </style>
                            <g>
                                <circle class="st0" cx="60" cy="60" r="45.1" />
                                <g>
                                    <path class="st1"
                                        d="M64.5,100.4c8.8-1,16.7-4.7,22.9-10.4c-2.9-2.6-6.1-4.8-9.7-6.6C74.5,89.9,70,95.7,64.5,100.4z" />
                                    <path class="st1"
                                        d="M74,81.9c-3.8-1.4-7.8-2.2-12-2.4v17.8C67,93,71.1,87.8,74,81.9z" />
                                    <path class="st1"
                                        d="M79.1,62H62v13.4c4.8,0.2,9.4,1.2,13.6,2.8C77.7,73.2,78.9,67.7,79.1,62z" />
                                    <path class="st1"
                                        d="M79.3,79.8c4,1.9,7.6,4.4,10.9,7.4c6.1-6.7,9.9-15.5,10.4-25.2H83.1C82.9,68.3,81.6,74.3,79.3,79.8z" />
                                    <path class="st1"
                                        d="M83.1,58h17.5c-0.5-9.7-4.3-18.4-10.4-25.2c-3.2,3-6.9,5.5-10.9,7.4C81.6,45.8,82.9,51.7,83.1,58z" />
                                    <path class="st1"
                                        d="M77.7,36.6c3.5-1.7,6.8-4,9.7-6.6c-6.2-5.7-14.1-9.4-22.9-10.4C70,24.3,74.5,30.1,77.7,36.6z" />
                                    <path class="st1"
                                        d="M75.6,41.8c-4.3,1.6-8.9,2.6-13.6,2.8V58h17.1C78.9,52.3,77.7,46.8,75.6,41.8z" />
                                    <path class="st1"
                                        d="M62,22.8v17.8c4.2-0.2,8.2-1,12-2.4C71.1,32.2,67,27,62,22.8z" />
                                    <path class="st1"
                                        d="M46,38.1c3.8,1.4,7.8,2.2,12,2.4V22.8C53,27,48.9,32.2,46,38.1z" />
                                    <path class="st1"
                                        d="M55.5,19.6c-8.8,1-16.7,4.7-22.9,10.4c2.9,2.6,6.1,4.8,9.7,6.6C45.5,30.1,50,24.3,55.5,19.6z" />
                                    <path class="st1"
                                        d="M40.9,58H58V44.6c-4.8-0.2-9.4-1.2-13.7-2.8C42.3,46.8,41.1,52.3,40.9,58z" />
                                    <path class="st1"
                                        d="M44.4,78.2c4.3-1.6,8.9-2.6,13.7-2.8V62H40.9C41.1,67.7,42.3,73.2,44.4,78.2z" />
                                    <path class="st1"
                                        d="M58,97.3V79.4c-4.2,0.2-8.2,1-12,2.4C48.9,87.8,53,93,58,97.3z" />
                                    <path class="st1"
                                        d="M42.3,83.4c-3.5,1.7-6.8,4-9.7,6.6c6.2,5.7,14.1,9.4,22.9,10.4C50,95.7,45.5,89.9,42.3,83.4z" />
                                    <path class="st1"
                                        d="M36.9,62H19.4c0.5,9.7,4.3,18.4,10.4,25.2c3.2-3,6.9-5.5,10.9-7.4C38.4,74.3,37.1,68.3,36.9,62z" />
                                    <path class="st1"
                                        d="M40.7,40.2c-4-1.9-7.7-4.4-10.9-7.4c-6.1,6.7-9.9,15.5-10.4,25.2h17.5C37.1,51.7,38.4,45.8,40.7,40.2z" />
                                </g>
                            </g>
                            <g>
                                <path class="st2"
                                    d="M28.3,59.6l-3.7-4.2c-2.3-2.6-1.8-6.6,1-8.5l0,0c2-1.4,4.6-1.4,6.5,0l0,0c2.8,2,3.3,6,1,8.5l-3.7,4.2   C29.1,60,28.5,60,28.3,59.6z" />
                                <circle class="st1" cx="28.8" cy="51.6" r="3.1" />
                            </g>
                            <g>
                                <path class="st2"
                                    d="M59.5,76.8l-3.7-4.2c-2.3-2.6-1.8-6.6,1-8.5l0,0c2-1.4,4.6-1.4,6.5,0l0,0c2.8,2,3.3,6,1,8.5l-3.7,4.2   C60.3,77.2,59.7,77.2,59.5,76.8z" />
                                <circle class="st1" cx="60" cy="68.8" r="3.1" />
                            </g>
                            <g>
                                <path class="st2"
                                    d="M45.5,39.5l-3.7-4.2c-2.3-2.6-1.8-6.6,1-8.5l0,0c2-1.4,4.6-1.4,6.5,0l0,0c2.8,2,3.3,6,1,8.5l-3.7,4.2   C46.3,39.9,45.7,39.9,45.5,39.5z" />
                                <circle class="st1" cx="46" cy="31.5" r="3.1" />
                            </g>
                        </svg>
                    </div>
                    <h3 class="text-4xl font-bold text-gray-900 dark:text-white" id="counter-regions">0</h3>
                    <p class="font-light text-gray-500 dark:text-gray-400">REGIONES EJECUTADAS</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Animación de Conteo -->
    <script>
        // Contadores
        function animateCounter(id, start, end, duration) {
            let current = start;
            let range = end - start;
            let increment = end > start ? 1 : -1;
            let stepTime = Math.abs(Math.floor(duration / range));
            let counterElement = document.getElementById(id);

            let timer = setInterval(function() {
                current += increment;
                counterElement.innerText = current + (current === end ? '+' : '');
                if (current === end) {
                    clearInterval(timer);
                }
            }, stepTime);
        }

        // Activar el conteo para cada número
        window.onload = function() {
            animateCounter('counter-projects', 0, 120, 2000);
            animateCounter('counter-clients', 0, 180, 2500);
            animateCounter('counter-regions', 0, 5, 2000);
            animateCounter('regions-ejecutados', 0, 9, 2000);
        };
    </script>

    <section class="bg-gray-50 dark:bg-gray-800">
        <div class="max-w-screen-xl px-4 py-8 mx-auto space-y-12 lg:space-y-20 lg:py-24 lg:px-6">
            <!-- Row -->
            <div class="items-center gap-8 lg:grid lg:grid-cols-2 xl:gap-16">
                <div class="text-gray-500 sm:text-lg dark:text-gray-400">
                    <h2 class="mb-4 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">NUESTRA
                        VISION</h2>
                    <p class="mb-8 font-light lg:text-xl">Ser el líder en el sector de la construcción y la
                        arquitectura mediante la integración de tecnología avanzada y prácticas innovadoras. Aspiramos a
                        transformar la industria con soluciones de diseño y construcción que sean sostenibles,
                        eficientes y accesibles, ofreciendo una experiencia única a nuestros clientes y contribuyendo al
                        desarrollo de infraestructuras de alta calidad.</p>
                </div>
                <img class="hidden mb-4 rounded-lg lg:mb-0 lg:flex h-80 w-82"
                    src="{{ asset('/storage/avatar_gespro/vision.png') }}" alt="dashboard feature image">
            </div>
            <!-- Row -->
            <div class="items-center gap-8 lg:grid lg:grid-cols-2 xl:gap-16">
                <img class="hidden w-full mb-4 rounded-lg lg:mb-0 lg:flex"
                    src="{{ asset('/storage/avatar_gespro/mision.png') }}" alt="feature image 2">
                <div class="text-gray-500 sm:text-lg dark:text-gray-400">
                    <h2 class="mb-4 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">NUESTRA
                        MISION</h2>
                    <p class="mb-8 font-light lg:text-xl">Nuestra misión es proporcionar servicios de construcción y
                        diseño arquitectónico que superen las expectativas de nuestros clientes a través de la
                        excelencia en la ejecución y el uso de tecnología avanzada. Nos comprometemos a ofrecer
                        soluciones personalizadas y eficientes, garantizando la calidad y la satisfacción en cada
                        proyecto. buscamos mejorar la gestión de proyectos y facilitar la colaboración, promoviendo
                        prácticas de construcción responsables y sostenibles.</p>
                </div>
            </div>
        </div>
    </section>

    <section class="bg-white dark:bg-gray-900">
        <div class="max-w-screen-xl px-4 py-8 mx-auto lg:py-24 lg:px-6">
            <div class="max-w-screen-md mx-auto mb-8 text-center lg:mb-12">
                <h2 class="mb-4 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">SERVICIOS DE
                    CALIDAD </h2>
                <p class="mb-5 font-light text-gray-500 sm:text-xl dark:text-gray-400">Mejore sus proyectos con nuestra
                    experiencia</p>
            </div>
            <div class="space-y-8 lg:grid lg:grid-cols-4 sm:gap-6 xl:gap-10 lg:space-y-0">
                <!-- Elaboracion de expedientes tecnicos -->
                <div class="w-72 bg-white shadow-md rounded-xl duration-500 hover:scale-105 hover:shadow-xl">
                    <a href="#">
                        <img src="{{ asset('/storage/avatar_gespro/Imagen7.jpg') }}" alt="Product"
                            class="h-80 w-72 object-cover  rounded-t-xl" />
                        <div class="px-4 py-3 w-72">
                            <p class="text-base text-center font-bold text-black truncate block capitalize">ELABORACIÓN
                                DE EXPEDIENTES <br>TÉCNICOS</p>
                            <span class="text-gray-950 font-semibold text-center mr-3 uppercase text-xs">Preparación
                                meticulosa de
                                archivos técnicos para garantizar que su proyecto cumpla con todos los requisitos
                                reglamentarios
                                y técnicos necesarios.</span>
                        </div>
                    </a>
                </div>
                {{-- <div
                    class="flex flex-col max-w-lg p-6 mx-auto text-center text-gray-900 bg-white border border-gray-100 rounded-lg shadow dark:border-gray-600 xl:p-8 dark:bg-gray-800 dark:text-white">
                    <h3 class="mb-4 text-2xl font-semibold">ELABORACIÓN DE EXPEDIENTES TÉCNICOS</h3>
                    <p class="font-light text-gray-500 sm:text-lg dark:text-gray-400">Preparación meticulosa de
                        archivos técnicos para garantizar que su proyecto cumpla con todos los requisitos reglamentarios
                        y técnicos necesarios.</p>
                </div> --}}

                <!-- Ejecucion de proyectos -->
                <div class="w-72 bg-white shadow-md rounded-xl duration-500 hover:scale-105 hover:shadow-xl">
                    <a href="#">
                        <img src="{{ asset('/storage/avatar_gespro/Imagen2.jpg') }}" alt="Product"
                            class="h-80 w-72 object-cover rounded-t-xl" />
                        <div class="px-4 py-3 w-72">
                            <p class="text-base text-center font-bold text-black truncate block capitalize">EJECUCIÓN
                                DE PROYECTOS</p>
                            <span class="text-gray-950 font-semibold text-center mr-3 uppercase text-xs">Preparación
                                Ejecución experta de proyectos,
                                haciendo realidad su visión a través de una gestión e implementación de proyectos
                                eficiente y
                                eficaz.</span>
                        </div>
                    </a>
                </div>
                {{-- <div
                    class="flex flex-col max-w-lg p-6 mx-auto text-center text-gray-900 bg-white border border-gray-100 rounded-lg shadow dark:border-gray-600 xl:p-8 dark:bg-gray-800 dark:text-white">
                    <h3 class="mb-4 text-2xl font-semibold">EJECUCIÓN DE PROYECTOS</h3>
                    <p class="font-light text-gray-500 sm:text-lg dark:text-gray-400">Ejecución experta de proyectos,
                        haciendo realidad su visión a través de una gestión e implementación de proyectos eficiente y
                        eficaz.</p>
                </div> --}}

                <!-- Supervicion de proyectos -->
                <div class="w-72 bg-white shadow-md rounded-xl duration-500 hover:scale-105 hover:shadow-xl">
                    <a href="#">
                        <img src="{{ asset('/storage/avatar_gespro/Imagen11.png') }}" alt="Product"
                            class="h-80 w-72 object-cover rounded-t-xl" />
                        <div class="px-4 py-3 w-72">
                            <p class="text-base text-center font-bold text-black truncate block capitalize">SUPERVISIÓN
                                DE PROYECTOS</p>
                            <span class="text-gray-950 font-semibold text-center mr-3 uppercase text-xs">Servicios
                                integrales de
                                supervisión para supervisar cada fase de su proyecto, garantizando el cumplimiento de
                                los
                                estándares de calidad y los plazos.</span>
                        </div>
                    </a>
                </div>
                {{-- <div
                    class="flex flex-col max-w-lg p-6 mx-auto text-center text-gray-900 bg-white border border-gray-100 rounded-lg shadow dark:border-gray-600 xl:p-8 dark:bg-gray-800 dark:text-white">
                    <h3 class="mb-4 text-2xl font-semibold">SUPERVISIÓN DE PROYECTOS</h3>
                    <p class="font-light text-gray-500 sm:text-lg dark:text-gray-400">Servicios integrales de
                        supervisión para supervisar cada fase de su proyecto, garantizando el cumplimiento de los
                        estándares de calidad y los plazos.</p>
                </div> --}}


                <!-- REFORZAMIENTO Y REHABILITACIÓN DE PROYECTOS -->
                <div class="w-72 bg-white shadow-md rounded-xl duration-500 hover:scale-105 hover:shadow-xl">
                    <a href="#">
                        <img src="{{ asset('/storage/avatar_gespro/Imagen5.jpg') }}" alt="Product"
                            class="h-80 w-72 object-cover rounded-t-xl" />
                        <div class="px-4 py-3 w-72">
                            <p class="text-base text-center font-bold text-black truncate block capitalize">
                                REFORZAMIENTO Y REHABILITACIÓN DE PROYECTOS</p>
                            <span class="text-gray-950 font-semibold text-center mr-3 uppercase text-xs">Servicios
                                especializados en el
                                refuerzo y rehabilitación de proyectos, mejorando la durabilidad y alargando la vida
                                útil de su
                                infraestructura.</span>
                        </div>
                    </a>
                </div>
                {{-- <div
                    class="flex flex-col max-w-lg p-6 mx-auto text-center text-gray-900 bg-white border border-gray-100 rounded-lg shadow dark:border-gray-600 xl:p-8 dark:bg-gray-800 dark:text-white">
                    <h3 class="mb-4 text-2xl font-semibold">REFORZAMIENTO Y REHABILITACIÓN DE PROYECTOS</h3>
                    <p class="font-light text-gray-500 sm:text-lg dark:text-gray-400">Servicios especializados en el
                        refuerzo y rehabilitación de proyectos, mejorando la durabilidad y alargando la vida útil de su
                        infraestructura.</p>
                </div> --}}

                <!-- EVALUCIÓN DE EXPEDIENTES TECNICOS -->
                <div class="w-72 bg-white shadow-md rounded-xl duration-500 hover:scale-105 hover:shadow-xl">
                    <a href="#">
                        <img src="{{ asset('/storage/avatar_gespro/Imagen12.png') }}" alt="Product"
                            class="h-80 w-72 object-cover rounded-t-xl" />
                        <div class="px-4 py-3 w-72">
                            <p class="text-base text-center font-bold text-black truncate block capitalize">EVALUCIÓN
                                DE EXPEDIENTES TECNICOS</p>
                            <span class="text-gray-950 font-semibold text-center mr-3 uppercase text-xs">Evaluación
                                exhaustiva de archivos
                                técnicos para evaluar el cumplimiento y la calidad, brindándole información y
                                recomendaciones
                                confiables.</span>
                        </div>
                    </a>
                </div>

                {{-- <div
                    class="flex flex-col max-w-lg p-6 mx-auto text-center text-gray-900 bg-white border border-gray-100 rounded-lg shadow dark:border-gray-600 xl:p-8 dark:bg-gray-800 dark:text-white">
                    <h3 class="mb-4 text-2xl font-semibold">EVALUCIÓN DE EXPEDIENTES TECNICOS</h3>
                    <p class="font-light text-gray-500 sm:text-lg dark:text-gray-400">Evaluación exhaustiva de archivos
                        técnicos para evaluar el cumplimiento y la calidad, brindándole información y recomendaciones
                        confiables.</p>
                </div> --}}

                <!-- MANTENIMIENTO DE PROYECTOS -->
                <div class="w-72 bg-white shadow-md rounded-xl duration-500 hover:scale-105 hover:shadow-xl">
                    <a href="#">
                        <img src="{{ asset('/storage/avatar_gespro/Imagen13.png') }}" alt="Product"
                            class="h-80 w-72 object-cover rounded-t-xl" />
                        <div class="px-4 py-3 w-72">
                            <p class="text-base text-center font-bold text-black truncate block capitalize">
                                MANTENIMIENTO DE PROYECTOS<< /p>
                                    <span
                                        class="text-gray-950 font-semibold text-center mr-3 uppercase text-xs">Servicios
                                        de mantenimiento
                                        confiables para mantener sus proyectos en óptimas condiciones, garantizando
                                        rendimiento y
                                        sostenibilidad a largo plazo.</span>
                        </div>
                    </a>
                </div>
                {{-- <div
                    class="flex flex-col max-w-lg p-6 mx-auto text-center text-gray-900 bg-white border border-gray-100 rounded-lg shadow dark:border-gray-600 xl:p-8 dark:bg-gray-800 dark:text-white">
                    <h3 class="mb-4 text-2xl font-semibold">MANTENIMIENTO DE PROYECTOS</h3>
                    <p class="font-light text-gray-500 sm:text-lg dark:text-gray-400">Servicios de mantenimiento
                        confiables para mantener sus proyectos en óptimas condiciones, garantizando rendimiento y
                        sostenibilidad a largo plazo.</p>
                </div> --}}
            </div>
        </div>
    </section>

    <section class="bg-white dark:bg-gray-900">
        <div class="max-w-screen-xl px-4 py-8 mx-auto lg:py-24 lg:px-6">
            <div class="max-w-screen-md mx-auto mb-8 text-center lg:mb-12">
                <h2 class="mb-4 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">NUESTRAS OBRAS
                    MÁS RECIENTES</h2>
                <p class="mb-5 font-light text-gray-500 sm:text-xl dark:text-gray-400">Diseños y proyectos innovadores
                    ejecutado y finalizados</p>
            </div>
            <div class="space-y-8 lg:grid lg:grid-cols-4 sm:gap-6 xl:gap-10 lg:space-y-0">
                <div class="w-72 bg-white shadow-md rounded-xl duration-500 hover:scale-105 hover:shadow-xl">
                    <a href="#">
                        <img src="{{ asset('/storage/avatar_gespro/03.jpg') }}" alt="Product"
                            class="h-80 w-72 object-cover rounded-xl" />

                    </a>
                </div>
                <div class="w-72 bg-white shadow-md rounded-xl duration-500 hover:scale-105 hover:shadow-xl">
                    <a href="#">
                        <img src="{{ asset('/storage/avatar_gespro/adventista.jpg') }}" alt="Product"
                            class="h-80 w-72 object-cover rounded-xl" />

                    </a>
                </div>
                <div class="w-72 bg-white shadow-md rounded-xl duration-500 hover:scale-105 hover:shadow-xl">
                    <a href="#">
                        <img src="{{ asset('/storage/avatar_gespro/09.jpg') }}" alt="Product"
                            class="h-80 w-72 object-cover rounded-xl" />

                    </a>
                </div>
                <div class="w-72 bg-white shadow-md rounded-xl duration-500 hover:scale-105 hover:shadow-xl">
                    <a href="#">
                        <img src="{{ asset('/storage/avatar_gespro/04.jpg') }}" alt="Product"
                            class="h-80 w-72 object-cover rounded-xl" />

                    </a>
                </div>
                <div class="w-72 bg-white shadow-md rounded-xl duration-500 hover:scale-105 hover:shadow-xl">
                    <a href="#">
                        <img src="{{ asset('/storage/avatar_gespro/07.jpg') }}" alt="Product"
                            class="h-80 w-72 object-cover rounded-xl" />

                    </a>
                </div>
                <div class="w-72 bg-white shadow-md rounded-xl duration-500 hover:scale-105 hover:shadow-xl">
                    <a href="#">
                        <img src="{{ asset('/storage/avatar_gespro/05.jpg') }}" alt="Product"
                            class="h-80 w-72 object-cover rounded-xl" />

                    </a>
                </div>
                <div class="w-72 bg-white shadow-md rounded-xl duration-500 hover:scale-105 hover:shadow-xl">
                    <a href="#">
                        <img src="{{ asset('/storage/avatar_gespro/02.jpg') }}" alt="Product"
                            class="h-80 w-72 object-cover rounded-xl" />

                    </a>
                </div>
                <div class="w-72 bg-white shadow-md rounded-xl duration-500 hover:scale-105 hover:shadow-xl">
                    <a href="#">
                        <img src="{{ asset('/storage/avatar_gespro/10.jpg') }}" alt="Product"
                            class="h-80 w-72 object-cover rounded-xl" />

                    </a>
                </div>
            </div>
        </div>
    </section>

    <section class="bg-white dark:bg-gray-900">
        <div class="max-w-screen-xl px-4 py-8 mx-auto lg:py-24 lg:px-6">
            <div class="max-w-screen-md mx-auto mb-8 text-center lg:mb-12">
                <h2 class="mb-4 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">NUESTRAS VALIOSAS
                    ALIANZAS</h2>
                <p class="mb-5 font-light text-gray-500 sm:text-xl dark:text-gray-400">Tenemos nuestros a nuestros
                    aliados</p>
            </div>
            <div class="w-full">
                <div class="flex flex-col w-full mb-10 sm:flex-row">
                    <div class="w-full mb-10 sm:mb-0 sm:w-1/2">
                        <div class="relative h-full ml-0 mr-0 sm:mr-10">
                            <span
                                class="absolute top-0 left-0 w-full h-full mt-1 ml-1 bg-indigo-500 rounded-lg"></span>
                            <div class="relative h-full p-5 bg-white border-2 border-indigo-500 rounded-lg">
                                <div class="flex items-center -mt-1">
                                    <h3 class="my-2 ml-3 text-lg font-bold text-gray-800">SEVEN HEART</h3>
                                </div>
                                <!-- List -->
                                <ul role="list" class="mb-8 space-y-4 text-left">
                                    <li class="flex items-center space-x-3">
                                        <!-- Icon -->
                                        <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400"
                                            fill="currentColor" viewBox="0 0 20 20"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path fill-rule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clip-rule="evenodd"></path>
                                        </svg>
                                        <span class="text-gray-950">Ubicación: <span class="font-semibold"><strong>Jr.
                                                    Hermilio Valdizán
                                                    859-885, Huanuco -Perú</strong></span></span>
                                    </li>
                                    <li class="flex items-center space-x-3">
                                        <!-- Icon -->
                                        <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400"
                                            fill="currentColor" viewBox="0 0 20 20"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path fill-rule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clip-rule="evenodd"></path>
                                        </svg>
                                        <span class="text-gray-950">Telefono: <span class="font-semibold"><strong>+51
                                                    979 537
                                                    439</strong></span></span>
                                    </li>
                                    <li class="flex items-center space-x-3">
                                        <!-- Icon -->
                                        <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400"
                                            fill="currentColor" viewBox="0 0 20 20"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path fill-rule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clip-rule="evenodd"></path>
                                        </svg>
                                        <span class="text-gray-950">Correo: <span
                                                class="font-semibold"><strong>sevenheart.inversiones@gmail.com</strong></span></span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="w-full sm:w-1/2">
                        <div class="relative h-full ml-0 md:mr-10">
                            <span
                                class="absolute top-0 left-0 w-full h-full mt-1 ml-1 bg-purple-500 rounded-lg"></span>
                            <div class="relative h-full p-5 bg-white border-2 border-purple-500 rounded-lg">
                                <div class="flex items-center -mt-1">
                                    <h3 class="my-2 ml-3 text-lg font-bold text-gray-800">TERRA Y CRETO</h3>
                                </div>
                                <!-- List -->
                                <ul role="list" class="mb-8 space-y-4 text-left">
                                    <li class="flex items-center space-x-3">
                                        <!-- Icon -->
                                        <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400"
                                            fill="currentColor" viewBox="0 0 20 20"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path fill-rule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clip-rule="evenodd"></path>
                                        </svg>
                                        <span class="text-gray-950">Ubicación: <span
                                                class="font-semibold"><strong>Avenida Javier Heraud N°110, Amarillis,
                                                    Huánuco - Perú</strong></span></span>
                                    </li>
                                    <li class="flex items-center space-x-3">
                                        <!-- Icon -->
                                        <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400"
                                            fill="currentColor" viewBox="0 0 20 20"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path fill-rule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clip-rule="evenodd"></path>
                                        </svg>
                                        <span class="text-gray-950">Telefono: <span class="font-semibold"><strong>+51
                                                    932 364 340</strong></span></span>
                                    </li>
                                    <li class="flex items-center space-x-3">
                                        <!-- Icon -->
                                        <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400"
                                            fill="currentColor" viewBox="0 0 20 20"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path fill-rule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clip-rule="evenodd"></path>
                                        </svg>
                                        <span class="text-gray-950">Correo: <span
                                                class="font-semibold"><strong>terraycreto.labmat@gmail.com</strong></span></span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flex flex-col w-full mb-10 sm:flex-row">
                    <div class="w-full mb-10 sm:mb-0 sm:w-1/2">
                        <div class="relative h-full ml-0 mr-0 sm:mr-10">
                            <span class="absolute top-0 left-0 w-full h-full mt-1 ml-1 bg-blue-400 rounded-lg"></span>
                            <div class="relative h-full p-5 bg-white border-2 border-blue-400 rounded-lg">
                                <div class="flex items-center -mt-1">
                                    <h3 class="my-2 ml-3 text-lg font-bold text-gray-800">DML ARQUITECTOS</h3>
                                </div>
                                <!-- List -->
                                <ul role="list" class="mb-8 space-y-4 text-left">
                                    <li class="flex items-center space-x-3">
                                        <!-- Icon -->
                                        <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400"
                                            fill="currentColor" viewBox="0 0 20 20"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path fill-rule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clip-rule="evenodd"></path>
                                        </svg>
                                        <span class="text-gray-950">Ubicación: <span
                                                class="font-semibold"><strong>Avenida Brasil N°435, Huánuco -
                                                    Perú</strong></span></span>
                                    </li>
                                    <li class="flex items-center space-x-3">
                                        <!-- Icon -->
                                        <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400"
                                            fill="currentColor" viewBox="0 0 20 20"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path fill-rule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clip-rule="evenodd"></path>
                                        </svg>
                                        <span class="text-gray-950">Telefono: <span class="font-semibold"><strong>+51
                                                    918 713 679</strong></span></span>
                                    </li>
                                    <li class="flex items-center space-x-3">
                                        <!-- Icon -->
                                        <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400"
                                            fill="currentColor" viewBox="0 0 20 20"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path fill-rule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clip-rule="evenodd"></path>
                                        </svg>
                                        <span class="text-gray-950">Correo: <span
                                                class="font-semibold"><strong>arquitectosdml@gmail.com</strong></span></span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="w-full mb-10 sm:mb-0 sm:w-1/2">
                        <div class="relative h-full ml-0 mr-0 sm:mr-10">
                            <span
                                class="absolute top-0 left-0 w-full h-full mt-1 ml-1 bg-yellow-400 rounded-lg"></span>
                            <div class="relative h-full p-5 bg-white border-2 border-yellow-400 rounded-lg">
                                <div class="flex items-center -mt-1">
                                    <h3 class="my-2 ml-3 text-lg font-bold text-gray-800">RIZABAL & ASOCIADOS</h3>
                                </div>
                                <!-- List -->
                                <ul role="list" class="mb-8 space-y-4 text-left">
                                    <li class="flex items-center space-x-3">
                                        <!-- Icon -->
                                        <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400"
                                            fill="currentColor" viewBox="0 0 20 20"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path fill-rule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clip-rule="evenodd"></path>
                                        </svg>
                                        <span class="text-gray-950">Ubicación: <span
                                                class="font-semibold"><strong>Jirón Hermilio Valdizán 859-885, Huánuco
                                                    - Perú</strong></span></span>
                                    </li>
                                    <li class="flex items-center space-x-3">
                                        <!-- Icon -->
                                        <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400"
                                            fill="currentColor" viewBox="0 0 20 20"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path fill-rule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clip-rule="evenodd"></path>
                                        </svg>
                                        <span class="text-gray-950">Telefono: <span class="font-semibold"><strong>+51
                                                    979 537 439</strong></span></span>
                                    </li>
                                    <li class="flex items-center space-x-3">
                                        <!-- Icon -->
                                        <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400"
                                            fill="currentColor" viewBox="0 0 20 20"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path fill-rule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clip-rule="evenodd"></path>
                                        </svg>
                                        <span class="text-gray-950">Correo: <span
                                                class="font-semibold"><strong>risabal&asociados@gmail.com</strong></span></span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flex flex-col w-full mb-10 sm:flex-row">
                    <div class="w-full sm:w-1/2">
                        <div class="relative h-full ml-0 md:mr-10">
                            <span class="absolute top-0 left-0 w-full h-full mt-1 ml-1 bg-green-500 rounded-lg"></span>
                            <div class="relative h-full p-5 bg-white border-2 border-green-500 rounded-lg">
                                <div class="flex items-center -mt-1">
                                    <h3 class="my-2 ml-3 text-lg font-bold text-gray-800">INSTITUTO ISABEL LA CATOLICA
                                    </h3>
                                </div>
                                <!-- List -->
                                <ul role="list" class="mb-8 space-y-4 text-left">
                                    <li class="flex items-center space-x-3">
                                        <!-- Icon -->
                                        <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400"
                                            fill="currentColor" viewBox="0 0 20 20"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path fill-rule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clip-rule="evenodd"></path>
                                        </svg>
                                        <span class="text-gray-950">Ubicación: <span
                                                class="font-semibold"><strong>Urb. Leoncio Prado Calle 8 Llicua Baja,
                                                    Amarilis, Huánuco - Perú</strong></span></span>
                                    </li>
                                    <li class="flex items-center space-x-3">
                                        <!-- Icon -->
                                        <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400"
                                            fill="currentColor" viewBox="0 0 20 20"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path fill-rule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clip-rule="evenodd"></path>
                                        </svg>
                                        <span class="text-gray-950">Telefono: <span class="font-semibold"><strong>+51
                                                    965 894 926</strong></span></span>
                                    </li>
                                    <li class="flex items-center space-x-3">
                                        <!-- Icon -->
                                        <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400"
                                            fill="currentColor" viewBox="0 0 20 20"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path fill-rule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clip-rule="evenodd"></path>
                                        </svg>
                                        <span class="text-gray-950">Correo: <span
                                                class="font-semibold"><strong>informes@institutolacatolica.edu.pe</strong></span></span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="w-full sm:w-1/2">
                        <div class="relative h-full ml-0 md:mr-10">
                            <span class="absolute top-0 left-0 w-full h-full mt-1 ml-1 bg-red-500 rounded-lg"></span>
                            <div class="relative h-full p-5 bg-white border-2 border-red-500 rounded-lg">
                                <div class="flex items-center -mt-1">
                                    <h3 class="my-2 ml-3 text-lg font-bold text-gray-800">Servicio Nacional de
                                        Adiestramiento en Trabajo Industrial (SENATI)
                                    </h3>
                                </div>
                                <!-- List -->
                                <ul role="list" class="mb-8 space-y-4 text-left">
                                    <li class="flex items-center space-x-3">
                                        <!-- Icon -->
                                        <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400"
                                            fill="currentColor" viewBox="0 0 20 20"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path fill-rule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clip-rule="evenodd"></path>
                                        </svg>
                                        <span class="text-gray-950">Ubicación: <span class="font-semibold"><strong>Ca.
                                                    5, Mz D, Lote 5, Urb. Primavera, Huánuco -
                                                    Perú</strong></span></span>
                                    </li>
                                    <li class="flex items-center space-x-3">
                                        <!-- Icon -->
                                        <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400"
                                            fill="currentColor" viewBox="0 0 20 20"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path fill-rule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clip-rule="evenodd"></path>
                                        </svg>
                                        <span class="text-gray-950">Telefono: <span class="font-semibold"><strong>+51
                                                    946 973 754</strong></span></span>
                                    </li>
                                    <li class="flex items-center space-x-3">
                                        <!-- Icon -->
                                        <svg class="flex-shrink-0 w-5 h-5 text-green-500 dark:text-green-400"
                                            fill="currentColor" viewBox="0 0 20 20"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path fill-rule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clip-rule="evenodd"></path>
                                        </svg>
                                        <span class="text-gray-950">Correo: <span
                                                class="font-semibold"><strong>contacto@senati.edu.pe</strong></span></span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- End block -->
    <section class="bg-gray-50 dark:bg-gray-800 py-8">
        <div class="max-w-screen-xl px-4 mx-auto lg:px-6">
            <div class="max-w-screen-sm mx-auto text-center">
                <h2 class="mb-4 text-3xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-white">
                    Contactenos y Adquiere tu cuenta
                </h2>
                <p class="mb-6 font-light text-gray-500 dark:text-gray-400 md:text-lg">
                    Dirección: <strong>Jr. Bolivar 487, Huánuco, Peru</strong>
                </p>
                <p class="mb-6 font-light text-gray-500 dark:text-gray-400 md:text-lg">
                    Telefono: <strong>+51 953 992 277</strong>
                </p>
                <p class="mb-6 font-light text-gray-500 dark:text-gray-400 md:text-lg">
                    Correo: <strong>info.construyehco@gmail.com</strong>
                </p>
            </div>

            <!-- Contact form section -->
            <div class="mt-12 max-w-screen-sm mx-auto bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg">
                <form method="POST" action="{{ route('cotizarcuentas') }}">
                    @csrf
                    <!-- Nombre -->
                    <div>
                        <x-input-label for="nombre" :value="__('Nombre')" />
                        <x-text-input id="nombre" class="block mt-1 w-full" type="text" name="nombre"
                            :value="old('nombre')" required />
                        <x-input-error :messages="$errors->get('nombre')" class="mt-2" />
                    </div>

                    <!-- Celular -->
                    <div class="mt-4">
                        <x-input-label for="celular" :value="__('Celular')" />
                        <x-text-input id="celular" class="block mt-1 w-full" type="tel" name="celular"
                            :value="old('celular')" required />
                        <x-input-error :messages="$errors->get('celular')" class="mt-2" />
                    </div>

                    <!-- Correo Electrónico -->
                    <div class="mt-4">
                        <x-input-label for="email" :value="__('Correo Electrónico')" />
                        <x-text-input id="email" class="block mt-1 w-full" type="email" name="email"
                            :value="old('email')" required />
                        <x-input-error :messages="$errors->get('email')" class="mt-2" />
                    </div>

                    <div class="flex items-center justify-end mt-4">
                        <x-primary-button class="ms-3">
                            {{ __('Enviar') }}
                        </x-primary-button>
                    </div>
                </form>
            </div>
        </div>
    </section>

    <!-- End block -->
    <script src="https://cdn.jsdelivr.net/npm/flowbite@2.5.2/dist/flowbite.min.js"></script>
</body>

</html>
