<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>CONSTRUYE HCO - Empresa Constructora</title>
    <link rel="icon" type="image/x-icon" href="/storage/avatar_empresa/logo_gespro.png">

    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Alpine.js -->
    <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
    <!-- Framer Motion -->
    <script src="https://unpkg.com/framer-motion@10.16.4/dist/framer-motion.js"></script>

    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'corporate-blue': '#003366',
                        'corporate-yellow': '#FFC107',
                        'corporate-red': '#C62828',
                        'corporate-orange': '#FF6F00',
                        'corporate-green': '#388E3C',
                        'corporate-cyan': '#00BCD4',
                        'corporate-dark': '#1a1a1a'
                    },
                    fontFamily: {
                        'arial': ['Arial', 'sans-serif']
                    }
                }
            }
        }
    </script>

    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        body {
            font-family: Arial, sans-serif;
        }

        .hero-gradient {
            background: linear-gradient(135deg, rgba(0, 51, 102, 0.9) 0%, rgba(0, 188, 212, 0.8) 50%, rgba(255, 193, 7, 0.9) 100%);
        }

        .card-hover {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .card-hover:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 20px 40px rgba(0, 51, 102, 0.15);
        }

        .animate-typing {
            overflow: hidden;
            border-right: 3px solid #FFC107;
            white-space: nowrap;
            animation: typing 4s steps(30, end), blink-caret 0.75s step-end infinite;
        }

        @keyframes typing {
            from {
                width: 0
            }

            to {
                width: 100%
            }
        }

        @keyframes blink-caret {

            from,
            to {
                border-color: transparent
            }

            50% {
                border-color: #FFC107
            }
        }

        .floating {
            animation: float 6s ease-in-out infinite;
        }

        @keyframes float {

            0%,
            100% {
                transform: translateY(0px);
            }

            50% {
                transform: translateY(-10px);
            }
        }

        .slide-in-left {
            animation: slideInLeft 1s ease-out;
        }

        @keyframes slideInLeft {
            from {
                transform: translateX(-100px);
                opacity: 0;
            }

            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        .slide-in-right {
            animation: slideInRight 1s ease-out;
        }

        @keyframes slideInRight {
            from {
                transform: translateX(100px);
                opacity: 0;
            }

            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        .fade-in-up {
            animation: fadeInUp 1s ease-out;
        }

        @keyframes fadeInUp {
            from {
                transform: translateY(50px);
                opacity: 0;
            }

            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
    </style>
</head>

<body class="bg-white text-black">
    <!-- Navbar -->
    <nav x-data="{
        isOpen: false,
        scrolled: false,
        init() {
            window.addEventListener('scroll', () => {
                this.scrolled = window.scrollY > 50;
            });
        }}" :class="scrolled ? 'bg-white shadow-lg' : 'bg-transparent'"
        class="fixed w-full z-50 transition-all duration-500">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16 lg:h-20">
                <div class="flex items-center">
                    <div class="flex-shrink-0 flex items-center">
                        <img class="h-10 w-10 lg:h-12 lg:w-12" src="/storage/avatar_empresa/logo_gespro.png"
                            alt="CONSTRUYE HCO">
                        <span :class="scrolled ? 'text-corporate-blue' : 'text-white'"
                            class="ml-2 text-xl lg:text-2xl font-bold transition-colors duration-300">CONSTRUYE
                            HCO</span>
                    </div>
                </div>

                <!-- Desktop Menu -->
                <div class="hidden lg:flex items-center space-x-8">
                    <a href="#inicio"
                        :class="scrolled ? 'text-corporate-blue hover:text-corporate-orange' :
                            'text-white hover:text-corporate-yellow'"
                        class="px-3 py-2 text-sm font-medium transition-colors duration-300">Inicio</a>
                    <a href="#nosotros"
                        :class="scrolled ? 'text-corporate-blue hover:text-corporate-orange' :
                            'text-white hover:text-corporate-yellow'"
                        class="px-3 py-2 text-sm font-medium transition-colors duration-300">Nosotros</a>
                    <a href="#servicios"
                        :class="scrolled ? 'text-corporate-blue hover:text-corporate-orange' :
                            'text-white hover:text-corporate-yellow'"
                        class="px-3 py-2 text-sm font-medium transition-colors duration-300">Servicios</a>
                    <a href="#proyectos"
                        :class="scrolled ? 'text-corporate-blue hover:text-corporate-orange' :
                            'text-white hover:text-corporate-yellow'"
                        class="px-3 py-2 text-sm font-medium transition-colors duration-300">Proyectos</a>
                    <a href="#contacto"
                        :class="scrolled ? 'text-corporate-blue hover:text-corporate-orange' :
                            'text-white hover:text-corporate-yellow'"
                        class="px-3 py-2 text-sm font-medium transition-colors duration-300">Contacto</a>
                    @if (Route::has('login'))
                        @auth
                            <a href="{{ url('/dashboard') }}"
                                class="bg-corporate-orange hover:bg-corporate-red text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105">
                                Dashboard
                            </a>
                        @else
                            <a href="{{ route('login') }}"
                                class="text-white bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:ring-blue-200 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 sm:mr-2 lg:mr-0 dark:focus:ring-blue-900">
                                Login
                            </a>
                        @endauth
                    @endif
                </div>

                <!-- Mobile menu button -->
                <div class="lg:hidden flex items-center">
                    <button @click="isOpen = !isOpen" :class="scrolled ? 'text-corporate-blue' : 'text-white'"
                        class="inline-flex items-center justify-center p-2 rounded-md hover:bg-gray-100 focus:outline-none transition-colors duration-300">
                        <svg class="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                            <path :class="{ 'hidden': isOpen, 'inline-flex': !isOpen }" stroke-linecap="round"
                                stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                            <path :class="{ 'hidden': !isOpen, 'inline-flex': isOpen }" stroke-linecap="round"
                                stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Mobile Menu -->
            <div x-show="isOpen" x-transition class="lg:hidden">
                <div class="px-2 pt-2 pb-3 space-y-1 bg-white shadow-lg rounded-lg mt-2">
                    <a href="#inicio"
                        class="block px-3 py-2 text-corporate-blue hover:text-corporate-orange font-medium">Inicio</a>
                    <a href="#nosotros"
                        class="block px-3 py-2 text-corporate-blue hover:text-corporate-orange font-medium">Nosotros</a>
                    <a href="#servicios"
                        class="block px-3 py-2 text-corporate-blue hover:text-corporate-orange font-medium">Servicios</a>
                    <a href="#proyectos"
                        class="block px-3 py-2 text-corporate-blue hover:text-corporate-orange font-medium">Proyectos</a>
                    <a href="#contacto"
                        class="block px-3 py-2 text-corporate-blue hover:text-corporate-orange font-medium">Contacto</a>
                    @if (Route::has('login'))
                        @auth
                            <a href="{{ url('/dashboard') }}"
                                class="bg-corporate-orange hover:bg-corporate-red text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105">
                                Dashboard
                            </a>
                        @else
                            <a href="{{ route('login') }}"
                                class="text-white bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:ring-blue-200 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 sm:mr-2 lg:mr-0 dark:focus:ring-blue-900">
                                Login
                            </a>
                        @endauth
                    @endif
                </div>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section id="inicio" class="relative h-screen overflow-hidden">
        <!-- Carousel Background -->
        <div x-data="{
            current: 0,
            images: [
                '/storage/avatar_gespro/07.jpg',
                '/storage/avatar_gespro/03.jpg',
                '/storage/avatar_gespro/proyectoV.jpg',
                '/storage/avatar_gespro/04.jpg',
                '/storage/avatar_gespro/adventista.jpg'
            ],
            init() {
                setInterval(() => {
                    this.current = (this.current + 1) % this.images.length;
                }, 5000);
            }
        }" class="absolute inset-0">
            <template x-for="(image, index) in images" :key="index">
                <div x-show="current === index" x-transition:enter="transition ease-out duration-1000"
                    x-transition:enter-start="opacity-0 transform scale-110"
                    x-transition:enter-end="opacity-100 transform scale-100"
                    x-transition:leave="transition ease-in duration-1000" x-transition:leave-start="opacity-100"
                    x-transition:leave-end="opacity-0" class="absolute inset-0">
                    <img :src="image" class="w-full h-full object-cover" loading="lazy">
                    <div class="absolute inset-0 hero-gradient"></div>
                </div>
            </template>
        </div>

        <!-- Hero Content -->
        <div class="relative z-10 flex items-center justify-center h-full px-4">
            <div class="text-center text-white max-w-4xl mx-auto">
                <h1 x-data="{
                    phrases: [
                        'CONSTRUYE TUS SUEÑOS',
                        'INNOVACIÓN EN CONSTRUCCIÓN',
                        'CALIDAD GARANTIZADA',
                        'PROYECTOS DE EXCELENCIA'
                    ],
                    current: 0,
                    init() {
                        setInterval(() => {
                            this.current = (this.current + 1) % this.phrases.length;
                        }, 4000);
                    }
                }" class="text-2xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                    <span x-text="phrases[current]" class="animate-typing inline-block"></span>
                </h1>

                <p class="text-lg md:text-xl lg:text-2xl mb-8 opacity-90 slide-in-left">
                    Servicios expertos de consultoría de construcción para hacer realidad su visión
                </p>

                <div class="flex flex-col sm:flex-row gap-4 justify-center items-center slide-in-right">
                    <button
                        class="bg-corporate-yellow hover:bg-corporate-orange text-corporate-dark px-8 py-4 rounded-lg text-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg">
                        Nuestros Proyectos
                    </button>
                    <button
                        class="border-2 border-white text-white hover:bg-white hover:text-corporate-blue px-8 py-4 rounded-lg text-lg font-bold transition-all duration-300">
                        Contáctanos
                    </button>
                </div>
            </div>
        </div>

        <!-- Scroll Indicator -->
        <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white floating">
            <svg class="w-6 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3">
                </path>
            </svg>
        </div>
    </section>

    <!-- Stats Section -->
    <section class="py-16 bg-gradient-to-r from-corporate-blue to-corporate-cyan">
        <div class="max-w-7xl mx-auto px-4">
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center text-white">
                <div class="fade-in-up">
                    <div class="text-4xl lg:text-5xl font-bold mb-2" x-data="{ count: 0 }" x-init="setInterval(() => { if (count < 120) count++ }, 20)">
                        <span x-text="count"></span>+
                    </div>
                    <p class="text-lg opacity-90">Proyectos Ejecutados</p>
                </div>
                <div class="fade-in-up">
                    <div class="text-4xl lg:text-5xl font-bold mb-2" x-data="{ count: 0 }" x-init="setInterval(() => { if (count < 180) count++ }, 15)">
                        <span x-text="count"></span>+
                    </div>
                    <p class="text-lg opacity-90">Clientes Satisfechos</p>
                </div>
                <div class="fade-in-up">
                    <div class="text-4xl lg:text-5xl font-bold mb-2" x-data="{ count: 0 }" x-init="setInterval(() => { if (count < 9) count++ }, 200)">
                        <span x-text="count"></span>+
                    </div>
                    <p class="text-lg opacity-90">Proyectos en Ejecución</p>
                </div>
                <div class="fade-in-up">
                    <div class="text-4xl lg:text-5xl font-bold mb-2" x-data="{ count: 0 }" x-init="setInterval(() => { if (count < 5) count++ }, 400)">
                        <span x-text="count"></span>+
                    </div>
                    <p class="text-lg opacity-90">Regiones Atendidas</p>
                </div>
            </div>
        </div>
    </section>

    <!-- About Section -->
    <section id="nosotros" class="py-20 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4">
            <div class="grid lg:grid-cols-2 gap-12 items-center">
                <!-- Vision -->
                <div class="slide-in-left">
                    <div class="flex items-center mb-6">
                        <div class="w-2 h-12 bg-corporate-orange mr-4"></div>
                        <h2 class="text-3xl lg:text-4xl font-bold text-corporate-blue">Nuestra Visión</h2>
                    </div>
                    <p class="text-gray-700 text-lg leading-relaxed mb-6">
                        Ser el líder en el sector de la construcción mediante la integración de tecnología avanzada y
                        prácticas innovadoras.
                        Aspiramos a transformar la industria con soluciones sostenibles, eficientes y accesibles.
                    </p>
                    <div class="grid grid-cols-2 gap-4 text-center">
                        <div class="bg-white p-4 rounded-lg shadow-md">
                            <div class="text-2xl font-bold text-corporate-green mb-2">15+</div>
                            <div class="text-sm text-gray-600">Años de Experiencia</div>
                        </div>
                        <div class="bg-white p-4 rounded-lg shadow-md">
                            <div class="text-2xl font-bold text-corporate-orange mb-2">100%</div>
                            <div class="text-sm text-gray-600">Calidad Garantizada</div>
                        </div>
                    </div>
                </div>

                <div class="slide-in-right">
                    <img src="/storage/avatar_gespro/vision.png" alt="Visión"
                        class="w-full h-80 object-cover rounded-lg shadow-lg">
                </div>
            </div>

            <div class="grid lg:grid-cols-2 gap-12 items-center mt-16">
                <div class="slide-in-left order-2 lg:order-1">
                    <img src="/storage/avatar_gespro/mision.png" alt="Misión"
                        class="w-full h-80 object-cover rounded-lg shadow-lg">
                </div>

                <!-- Mission -->
                <div class="slide-in-right order-1 lg:order-2">
                    <div class="flex items-center mb-6">
                        <div class="w-2 h-12 bg-corporate-yellow mr-4"></div>
                        <h2 class="text-3xl lg:text-4xl font-bold text-corporate-blue">Nuestra Misión</h2>
                    </div>
                    <p class="text-gray-700 text-lg leading-relaxed mb-6">
                        Proporcionar servicios de construcción que superen las expectativas a través de la excelencia
                        y tecnología avanzada. Nos comprometemos con soluciones personalizadas, eficientes y
                        sostenibles.
                    </p>
                    <div class="flex items-center space-x-6">
                        <div class="flex items-center">
                            <div class="w-3 h-3 bg-corporate-green rounded-full mr-2"></div>
                            <span class="text-gray-700">Innovación</span>
                        </div>
                        <div class="flex items-center">
                            <div class="w-3 h-3 bg-corporate-orange rounded-full mr-2"></div>
                            <span class="text-gray-700">Calidad</span>
                        </div>
                        <div class="flex items-center">
                            <div class="w-3 h-3 bg-corporate-cyan rounded-full mr-2"></div>
                            <span class="text-gray-700">Sostenibilidad</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Services Section -->
    <section id="servicios" class="py-20 bg-white">
        <div class="max-w-7xl mx-auto px-4">
            <div class="text-center mb-16">
                <h2 class="text-3xl lg:text-4xl font-bold text-corporate-blue mb-4">Servicios de Calidad</h2>
                <p class="text-xl text-gray-600 max-w-3xl mx-auto">Mejore sus proyectos con nuestra experiencia y
                    compromiso con la excelencia</p>
            </div>

            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <!-- Service 1 -->
                <div
                    class="card-hover bg-white rounded-xl shadow-lg overflow-hidden border-t-4 border-corporate-orange">
                    <img src="/storage/avatar_gespro/Imagen7.jpg" alt="Expedientes Técnicos"
                        class="w-full h-48 object-cover">
                    <div class="p-6">
                        <h3 class="text-xl font-bold text-corporate-blue mb-3">Elaboración de Expedientes Técnicos</h3>
                        <p class="text-gray-600 leading-relaxed">Preparación meticulosa de archivos técnicos para
                            garantizar el cumplimiento de todos los requisitos reglamentarios.</p>
                    </div>
                </div>

                <!-- Service 2 -->
                <div
                    class="card-hover bg-white rounded-xl shadow-lg overflow-hidden border-t-4 border-corporate-green">
                    <img src="/storage/avatar_gespro/Imagen2.jpg" alt="Ejecución de Proyectos"
                        class="w-full h-48 object-cover">
                    <div class="p-6">
                        <h3 class="text-xl font-bold text-corporate-blue mb-3">Ejecución de Proyectos</h3>
                        <p class="text-gray-600 leading-relaxed">Ejecución experta de proyectos, haciendo realidad su
                            visión a través de una gestión eficiente y eficaz.</p>
                    </div>
                </div>

                <!-- Service 3 -->
                <div class="card-hover bg-white rounded-xl shadow-lg overflow-hidden border-t-4 border-corporate-cyan">
                    <img src="/storage/avatar_gespro/Imagen11.png" alt="Supervisión"
                        class="w-full h-48 object-cover">
                    <div class="p-6">
                        <h3 class="text-xl font-bold text-corporate-blue mb-3">Supervisión de Proyectos</h3>
                        <p class="text-gray-600 leading-relaxed">Servicios integrales de supervisión para garantizar el
                            cumplimiento de estándares de calidad y plazos.</p>
                    </div>
                </div>

                <!-- Service 4 -->
                <div class="card-hover bg-white rounded-xl shadow-lg overflow-hidden border-t-4 border-corporate-red">
                    <img src="/storage/avatar_gespro/Imagen5.jpg" alt="Reforzamiento"
                        class="w-full h-48 object-cover">
                    <div class="p-6">
                        <h3 class="text-xl font-bold text-corporate-blue mb-3">Reforzamiento y Rehabilitación</h3>
                        <p class="text-gray-600 leading-relaxed">Servicios especializados en refuerzo y rehabilitación,
                            mejorando la durabilidad de su infraestructura.</p>
                    </div>
                </div>

                <!-- Service 5 -->
                <div
                    class="card-hover bg-white rounded-xl shadow-lg overflow-hidden border-t-4 border-corporate-yellow">
                    <img src="/storage/avatar_gespro/Imagen12.png" alt="Evaluación" class="w-full h-48 object-cover">
                    <div class="p-6">
                        <h3 class="text-xl font-bold text-corporate-blue mb-3">Evaluación de Expedientes</h3>
                        <p class="text-gray-600 leading-relaxed">Evaluación exhaustiva de archivos técnicos para
                            evaluar cumplimiento y calidad con recomendaciones confiables.</p>
                    </div>
                </div>

                <!-- Service 6 -->
                <div
                    class="card-hover bg-white rounded-xl shadow-lg overflow-hidden border-t-4 border-corporate-orange">
                    <img src="/storage/avatar_gespro/Imagen13.png" alt="Mantenimiento"
                        class="w-full h-48 object-cover">
                    <div class="p-6">
                        <h3 class="text-xl font-bold text-corporate-blue mb-3">Mantenimiento de Proyectos</h3>
                        <p class="text-gray-600 leading-relaxed">Servicios de mantenimiento confiables para garantizar
                            rendimiento y sostenibilidad a largo plazo.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Projects Gallery -->
    <section id="proyectos" class="py-20 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4">
            <div class="text-center mb-16">
                <h2 class="text-3xl lg:text-4xl font-bold text-corporate-blue mb-4">Nuestras Obras Más Recientes</h2>
                <p class="text-xl text-gray-600">Diseños y proyectos innovadores ejecutados y finalizados con
                    excelencia</p>
            </div>

            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div class="card-hover rounded-xl overflow-hidden shadow-lg">
                    <img src="/storage/avatar_gespro/03.jpg" alt="Proyecto 1" class="w-full h-64 object-cover">
                </div>
                <div class="card-hover rounded-xl overflow-hidden shadow-lg">
                    <img src="/storage/avatar_gespro/adventista.jpg" alt="Proyecto 2"
                        class="w-full h-64 object-cover">
                </div>
                <div class="card-hover rounded-xl overflow-hidden shadow-lg">
                    <img src="/storage/avatar_gespro/09.jpg" alt="Proyecto 3" class="w-full h-64 object-cover">
                </div>
                <div class="card-hover rounded-xl overflow-hidden shadow-lg">
                    <img src="/storage/avatar_gespro/04.jpg" alt="Proyecto 4" class="w-full h-64 object-cover">
                </div>
                <div class="card-hover rounded-xl overflow-hidden shadow-lg">
                    <img src="/storage/avatar_gespro/07.jpg" alt="Proyecto 5" class="w-full h-64 object-cover">
                </div>
                <div class="card-hover rounded-xl overflow-hidden shadow-lg">
                    <img src="/storage/avatar_gespro/05.jpg" alt="Proyecto 6" class="w-full h-64 object-cover">
                </div>
                <div class="card-hover rounded-xl overflow-hidden shadow-lg">
                    <img src="/storage/avatar_gespro/02.jpg" alt="Proyecto 7" class="w-full h-64 object-cover">
                </div>
                <div class="card-hover rounded-xl overflow-hidden shadow-lg">
                    <img src="/storage/avatar_gespro/10.jpg" alt="Proyecto 8" class="w-full h-64 object-cover">
                </div>
            </div>

            <div class="text-center mt-12">
                <button
                    class="bg-corporate-blue hover:bg-corporate-cyan text-white px-8 py-4 rounded-lg text-lg font-bold transition-all duration-300 hover:scale-105">
                    Ver Más Proyectos
                </button>
            </div>
        </div>
    </section>

    <!-- Nuestras Alinzas  -->
    <section id="alianzas" class="py-20 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4">
            <div class="max-w-screen-md mx-auto mb-8 text-center lg:mb-12">
                <h2 class="mb-4 text-3xl font-extrabold tracking-tight text-gray-900">NUESTRAS VALIOSAS
                    ALIANZAS</h2>
                <p class="mb-5 font-light text-gray-500 sm:text-xl">Tenemos nuestros a nuestros
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

    <!-- Contact Section -->
    <section id="contacto" class="py-20 bg-white">
        <div class="max-w-7xl mx-auto px-4">
            <div class="text-center mb-16">
                <h2 class="text-3xl lg:text-4xl font-bold text-corporate-blue mb-4">Contáctanos</h2>
                <p class="text-xl text-gray-600">¿Listo para comenzar tu próximo proyecto? Estamos aquí para ayudarte
                </p>
            </div>

            <div class="grid lg:grid-cols-2 gap-12">
                <!-- Contact Info -->
                <div class="space-y-8">
                    <div class="flex items-center space-x-4">
                        <div class="bg-corporate-orange p-3 rounded-full">
                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z">
                                </path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                        </div>
                        <div>
                            <h3 class="text-lg font-bold text-corporate-blue">Dirección</h3>
                            <p class="text-gray-600">Jr. Bolivar 487, Huánuco, Perú</p>
                        </div>
                    </div>

                    <div class="flex items-center space-x-4">
                        <div class="bg-corporate-green p-3 rounded-full">
                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z">
                                </path>
                            </svg>
                        </div>
                        <div>
                            <h3 class="text-lg font-bold text-corporate-blue">Teléfono</h3>
                            <p class="text-gray-600">+51 953 992 277</p>
                        </div>
                    </div>

                    <div class="flex items-center space-x-4">
                        <div class="bg-corporate-cyan p-3 rounded-full">
                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z">
                                </path>
                            </svg>
                        </div>
                        <div>
                            <h3 class="text-lg font-bold text-corporate-blue">Correo Electrónico</h3>
                            <p class="text-gray-600">info.construyehco@gmail.com</p>
                        </div>
                    </div>

                    <!-- Call to Action -->
                    <div class="bg-gradient-to-r from-corporate-blue to-corporate-cyan p-6 rounded-lg text-white">
                        <h3 class="text-xl font-bold mb-2">¿Tienes un proyecto en mente?</h3>
                        <p class="mb-4">Contáctanos hoy mismo y comencemos a construir tu futuro</p>
                        <button
                            class="bg-corporate-yellow hover:bg-corporate-orange text-corporate-dark px-6 py-3 rounded-lg font-bold transition-all duration-300 hover:scale-105">
                            Solicitar Cotización
                        </button>
                    </div>
                </div>

                <!-- Contact Form -->
                <div class="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                    <h3 class="text-2xl font-bold text-corporate-blue mb-6">Envíanos un Mensaje</h3>

                    <form x-data="{
                        nombre: '',
                        celular: '',
                        email: '',
                        mensaje: '',
                        loading: false,
                        submitted: false,
                        submitForm() {
                            this.loading = true;
                            // Simulate form submission
                            setTimeout(() => {
                                this.loading = false;
                                this.submitted = true;
                                this.nombre = '';
                                this.celular = '';
                                this.email = '';
                                this.mensaje = '';
                                setTimeout(() => { this.submitted = false; }, 3000);
                            }, 1500);
                        }
                    }" @submit.prevent="submitForm()" class="space-y-6">

                        <div>
                            <label for="nombre" class="block text-sm font-medium text-gray-700 mb-2">Nombre
                                Completo</label>
                            <input x-model="nombre" type="text" id="nombre" required
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue focus:border-transparent transition-all duration-300">
                        </div>

                        <div>
                            <label for="celular" class="block text-sm font-medium text-gray-700 mb-2">Celular</label>
                            <input x-model="celular" type="tel" id="celular" required
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue focus:border-transparent transition-all duration-300">
                        </div>

                        <div>
                            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Correo
                                Electrónico</label>
                            <input x-model="email" type="email" id="email" required
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue focus:border-transparent transition-all duration-300">
                        </div>

                        <div>
                            <label for="mensaje" class="block text-sm font-medium text-gray-700 mb-2">Mensaje</label>
                            <textarea x-model="mensaje" id="mensaje" rows="4"
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue focus:border-transparent transition-all duration-300"
                                placeholder="Cuéntanos sobre tu proyecto..."></textarea>
                        </div>

                        <button type="submit" :disabled="loading || submitted"
                            :class="submitted ? 'bg-corporate-green' : 'bg-corporate-blue hover:bg-corporate-cyan'"
                            class="w-full text-white px-6 py-4 rounded-lg font-bold transition-all duration-300 hover:scale-105 disabled:cursor-not-allowed">
                            <span x-show="!loading && !submitted">Enviar Mensaje</span>
                            <span x-show="loading" class="flex items-center justify-center">
                                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10"
                                        stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                    </path>
                                </svg>
                                Enviando...
                            </span>
                            <span x-show="submitted" class="flex items-center justify-center">
                                <svg class="mr-2 h-5 w-5 text-white" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M5 13l4 4L19 7"></path>
                                </svg>
                                ¡Mensaje Enviado!
                            </span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-corporate-dark text-white py-16">
        <div class="max-w-7xl mx-auto px-4">
            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                <!-- Company Info -->
                <div class="lg:col-span-2">
                    <div class="flex items-center mb-6">
                        <img src="/storage/avatar_empresa/logo_gespro.png" alt="CONSTRUYE HCO"
                            class="h-12 w-12 mr-3">
                        <span class="text-2xl font-bold">CONSTRUYE HCO</span>
                    </div>
                    <p class="text-gray-300 leading-relaxed mb-6">
                        Empresa especializada en la creación, ejecución y supervisión de proyectos de infraestructura,
                        comprometida con ofrecer un trabajo de máxima calidad y excelencia en cada proyecto.
                    </p>
                    <div class="flex space-x-4">
                        <a href="#"
                            class="bg-corporate-blue hover:bg-corporate-cyan p-3 rounded-full transition-colors duration-300">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path
                                    d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                            </svg>
                        </a>
                        <a href="#"
                            class="bg-corporate-blue hover:bg-corporate-cyan p-3 rounded-full transition-colors duration-300">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path
                                    d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                            </svg>
                        </a>
                        <a href="#"
                            class="bg-corporate-blue hover:bg-corporate-cyan p-3 rounded-full transition-colors duration-300">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path
                                    d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                        </a>
                    </div>
                </div>

                <!-- Quick Links -->
                <div>
                    <h3 class="text-lg font-bold mb-6">Enlaces Rápidos</h3>
                    <ul class="space-y-3">
                        <li><a href="#nosotros"
                                class="text-gray-300 hover:text-corporate-yellow transition-colors duration-300">Nosotros</a>
                        </li>
                        <li><a href="#servicios"
                                class="text-gray-300 hover:text-corporate-yellow transition-colors duration-300">Servicios</a>
                        </li>
                        <li><a href="#proyectos"
                                class="text-gray-300 hover:text-corporate-yellow transition-colors duration-300">Proyectos</a>
                        </li>
                        <li><a href="#contacto"
                                class="text-gray-300 hover:text-corporate-yellow transition-colors duration-300">Contacto</a>
                        </li>
                    </ul>
                </div>

                <!-- Services -->
                <div>
                    <h3 class="text-lg font-bold mb-6">Nuestros Servicios</h3>
                    <ul class="space-y-3 text-sm">
                        <li class="text-gray-300">Expedientes Técnicos</li>
                        <li class="text-gray-300">Ejecución de Proyectos</li>
                        <li class="text-gray-300">Supervisión</li>
                        <li class="text-gray-300">Reforzamiento</li>
                        <li class="text-gray-300">Evaluación</li>
                        <li class="text-gray-300">Mantenimiento</li>
                    </ul>
                </div>
            </div>

            <!-- Bottom Bar -->
            <div class="border-t border-gray-600 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
                <p class="text-gray-300 text-sm">
                    © 2025 CONSTRUYE HCO. Todos los derechos reservados.
                </p>
                <div class="flex space-x-6 mt-4 md:mt-0">
                    <a href="#"
                        class="text-gray-300 hover:text-corporate-yellow text-sm transition-colors duration-300">Política
                        de Privacidad</a>
                    <a href="#"
                        class="text-gray-300 hover:text-corporate-yellow text-sm transition-colors duration-300">Términos
                        de Servicio</a>
                </div>
            </div>
        </div>
    </footer>

    <!-- WhatsApp Float Button -->
    <div class="fixed bottom-6 right-6 z-50 group">
        <a href="https://wa.me/51953992277" target="_blank"
            class="relative bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center animate-bounce-slow">

            <!-- Ícono WhatsApp -->
            <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path
                    d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.108" />
            </svg>

            <!-- Pulso animado -->
            <span class="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"></span>
        </a>

        <!-- Tooltip -->
        <div
            class="absolute right-20 bottom-1 bg-gray-800 text-white text-sm px-3 py-1 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Escríbenos en WhatsApp
        </div>
    </div>

    <!-- Animación bounce lenta -->
    <style>
        .animate-bounce-slow {
            animation: bounce 3s infinite;
        }
    </style>

    <!-- Scroll to Top Button -->
    <div x-data="{ showButton: false }" x-init="window.addEventListener('scroll', () => { showButton = window.scrollY > 500; })" class="fixed bottom-6 left-6 z-50">
        <button x-show="showButton" x-transition @click="window.scrollTo({ top: 0, behavior: 'smooth' })"
            class="bg-corporate-blue hover:bg-corporate-cyan text-white p-3 rounded-full shadow-lg hover:scale-110 transition-all duration-300">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18">
                </path>
            </svg>
        </button>
    </div>

    <!-- Loading Screen -->
    <div x-data="{ loading: true }" x-init="setTimeout(() => { loading = false }, 2000)" x-show="loading"
        x-transition:leave="transition ease-in duration-500" x-transition:leave-start="opacity-100"
        x-transition:leave-end="opacity-0" class="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div class="text-center">
            <img src="/storage/avatar_empresa/logo_gespro.png" alt="CONSTRUYE HCO"
                class="h-20 w-20 mx-auto mb-4 floating">
            <h2 class="text-2xl font-bold text-corporate-blue mb-4">CONSTRUYE HCO</h2>
            <div class="w-16 h-1 bg-corporate-yellow mx-auto rounded-full">
                <div class="h-full bg-corporate-orange rounded-full animate-pulse" style="width: 60%;"></div>
            </div>
        </div>
    </div>

    <script>
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Intersection Observer for animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe all sections
        document.querySelectorAll('section').forEach(section => {
            observer.observe(section);
        });

        // Optimize images with lazy loading
        if ('loading' in HTMLImageElement.prototype) {
            const images = document.querySelectorAll('img[loading="lazy"]');
            images.forEach(img => {
                img.src = img.src;
            });
        } else {
            // Fallback for browsers that don't support lazy loading
            const script = document.createElement('script');
            script.src = 'https://polyfill.io/v3/polyfill.min.js?features=IntersectionObserver';
            document.head.appendChild(script);
        }
    </script>
</body>

</html>
