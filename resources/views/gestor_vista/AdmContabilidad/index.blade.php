<x-app-layout>
    <x-slot name="header">
        @if (Auth::check())
            <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                Bienvenido {{ Auth::user()->name }} {{ Auth::user()->surname }} Selecciona la <strong>EMPRESA</strong>
                con la que va a trabajar
            </h2>
        @endif
    </x-slot>

    <div class="py-12">
        <div class="container mx-auto w-full">
            <div class="flex flex-wrap">
                <div class="w-full md:w-3/3 px-4 py-4 -mt-10 md:-mt-10">
                    <div class="p-6 text-gray-900 dark:text-gray-100">
                        <div class="overflow-auto">
                            @if (count($empresasArray) > 1)
                                <!-- Si tiene más de una empresa, muestra las tarjetas para seleccionar una empresa -->
                                <form action="{{ route('gestor-adminpanel') }}" method="POST">
                                    @csrf
                                    <x-input-label for="empresa_id" :value="__('Selecciona la Empresa')" class="block mb-4" />

                                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        @foreach ($empresasArray as $empresa)
                                            <label for="empresa_{{ $empresa['id'] }}" class="cursor-pointer">
                                                <div
                                                    class="relative bg-white shadow-md rounded-lg p-6 flex flex-col items-center justify-center transition-transform transform hover:scale-105 hover:shadow-lg 
                                                    @if ($empresa['id'] == $empresaId) border-4 border-green-500 bg-green-100 @endif 
                                                    h-full">

                                                    <!-- Input radio (checkbox oculto visualmente) -->
                                                    <input type="radio" id="empresa_{{ $empresa['id'] }}"
                                                        name="empresa_id" value="{{ $empresa['id'] }}" class="hidden"
                                                        {{ $empresa['id'] == $empresaId ? 'checked' : '' }} required>

                                                    <!-- Icono de check verde (visible solo cuando está seleccionado) -->
                                                    <div class="absolute top-2 right-2">
                                                        <input type="checkbox" id="checkbox_{{ $empresa['id'] }}"
                                                            class="hidden"
                                                            {{ $empresa['id'] == $empresaId ? 'checked' : '' }}>
                                                        <label for="checkbox_{{ $empresa['id'] }}"
                                                            class="text-green-500">
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                                                                viewBox="0 0 24 24" stroke="currentColor"
                                                                class="w-6 h-6">
                                                                <path stroke-linecap="round" stroke-linejoin="round"
                                                                    stroke-width="2" d="M5 13l4 4L19 7"></path>
                                                            </svg>
                                                        </label>
                                                    </div>

                                                    <!-- Nombre de la empresa -->
                                                    <div class="text-base text-center font-semibold text-gray-800 mt-4">
                                                        {{ $empresa['razonSocial'] }}
                                                    </div>
                                                </div>
                                            </label>
                                        @endforeach
                                    </div>

                                    <button type="submit"
                                        class="btn btn-primary mt-4 w-full py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none">
                                        Cambiar Empresa
                                    </button>
                                </form>
                            @else
                                <!-- Si solo tiene una empresa seleccionada, muestra la razón social directamente -->
                                <p>Estás trabajando con la empresa: {{ $empresasArray[0]['razonSocial'] }}</p>
                            @endif
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>


</x-app-layout>
