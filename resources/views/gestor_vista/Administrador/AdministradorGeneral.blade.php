@inject('empresas', 'App\Models\Empresa')

<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-2xl text-gray-900 dark:text-gray-100 leading-tight flex items-center gap-2">
            <svg class="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 3h18v2H3V3zm2 4h14v14H5V7zm4 2v10h2V9H9zm4 0v10h2V9h-2z"/>
            </svg>
            {{ __('Gestión de Empresas') }}
        </h2>
    </x-slot>

    <div class="">
        <div class="container mx-auto px-4">
            <div class="bg-white dark:bg-gray-900 shadow-xl rounded-2xl p-2">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    @foreach ($empresas::select('id', 'razonSocial', 'estadoempresa')->get() as $empresa)
                        <a href="{{ route('gestion.admon', ['id' => $empresa->id, 'razonSocial' => $empresa->razonSocial]) }}"
                            class="relative group flex flex-col items-center justify-center p-6 rounded-2xl shadow-lg transition transform hover:-translate-y-1 hover:shadow-2xl
                                {{ $empresa->estadoempresa == 'ACTIVO' 
                                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                                    : 'bg-gradient-to-r from-red-500 to-red-600 text-white' }}">

                            <!-- Estado Badge -->
                            <span class="absolute top-3 right-3 text-xs px-3 py-1 rounded-full 
                                {{ $empresa->estadoempresa == 'ACTIVO' 
                                    ? 'bg-white/20 text-green-100 border border-green-200' 
                                    : 'bg-white/20 text-red-100 border border-red-200' }}">
                                {{ $empresa->estadoempresa }}
                            </span>

                            <!-- Icono según estado -->
                            <div class="w-14 h-14 flex items-center justify-center rounded-full mb-4 
                                {{ $empresa->estadoempresa == 'ACTIVO' ? 'bg-white/20' : 'bg-white/20' }}">
                                @if ($empresa->estadoempresa == 'ACTIVO')
                                    <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M9 16.2l-3.5-3.6-1.4 1.4L9 19 20 7.9 18.6 6.5z"/>
                                    </svg>
                                @else
                                    <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M6 6l12 12M6 18L18 6"/>
                                    </svg>
                                @endif
                            </div>

                            <!-- Nombre empresa -->
                            <h5 class="text-lg font-bold text-center">
                                {{ $empresa->razonSocial }}
                            </h5>
                        </a>
                    @endforeach
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
