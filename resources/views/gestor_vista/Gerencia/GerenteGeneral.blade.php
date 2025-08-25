@inject('empresas', 'App\Models\Empresa')
<x-app-layout>
    <x-slot name="header">
        @if (Auth::check())
            <h2 class="font-semibold text-3xl text-center text-gray-800 dark:text-gray-200 leading-tight">
                Bienvenido Gerente General Ing. {{ Auth::user()->name }} {{ Auth::user()->surname }}
            </h2>
        @endif
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-gray-900 dark:text-gray-100">
                    <div class="overflow-auto">
                        <div class="p-4 md:p-5 space-y-4">
                            <div class="overflow-x-auto grid w-full grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                                @foreach ($empresas::select('id', 'razonSocial', 'estadoempresa')->get() as $empresa)
                                    <div>
                                        <a href="{{ route('gestoradmon', ['id' => $empresa->id, 'razonSocial' => $empresa->razonSocial]) }}"
                                            class="flex flex-col items-center gap-3 px-8 py-10 rounded-3xl shadow-main
                                                {{ $empresa->estadoempresa == 'ACTIVO' ? 'hover:bg-green-700 dark:hover:bg-green-700' : 'hover:bg-red-700 dark::hover:bg-red-700' }}
                                                {{ $empresa->estadoempresa == 'ACTIVO' ? 'bg-green-500 dark:bg-green-600' : 'bg-red-500 dark:bg-red-600' }} 
                                              dark:border-gray-700">
                                            <h5
                                                class="mb-2 text-sm text-center font-bold tracking-tight text-gray-900 dark:text-white">
                                                {{ $empresa->razonSocial }}</h5>
                                            <p class="font-normal text-center text-gray-700 dark:text-gray-200">
                                                {{ $empresa->estadoempresa }}</p>
                                        </a>
                                    </div>
                                @endforeach
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
