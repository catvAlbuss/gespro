<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Area Contable') }}
        </h2>
    </x-slot>

    <div class="py-2">
        <div class="max-w-full mx-auto sm:px-6 lg:px-8">
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6">
                    <div class="container flex flex-col items-center gap-16 mx-auto my-30">
                        <div class="grid w-full grid-cols-1 gap-5 md:grid-cols-3 lg:grid-cols-4">
                            {{-- Aministracion de Balances  --}}
                            <div
                                class="flex flex-col items-center gap-3 px-8 py-10 bg-sky-500 hover:bg-sky-800 dark:bg-white dark:hover:bg-sky-500 rounded-3xl shadow-main">
                                <span>
                                    <img width="50" height="50" src="https://img.icons8.com/ios/50/scales--v1.png"
                                        alt="scales--v1" />
                                </span>
                                <a href="{{ route('contabilidad.balances', ['empresaId' => $id]) }}">
                                    <p class="text-2xl font-extrabold text-gray-900">Balance</p>
                                </a>
                            </div>

                            {{-- Factura Ingresos --}}
                            <div
                                class="flex flex-col items-center gap-3 px-8 py-10 bg-sky-500 hover:bg-sky-800 dark:bg-white dark:hover:bg-sky-500 rounded-3xl shadow-main">
                                <span>
                                    <img width="50" height="50"
                                        src="https://img.icons8.com/carbon-copy/100/invoice-1.png" alt="invoice-1" />
                                </span>
                                <a href="">
                                    <p class="text-2xl font-extrabold text-gray-900">Factura Ingresos</p>
                                </a>
                            </div>

                            {{-- Factura Egresos --}}
                            <div
                                class="flex flex-col items-center gap-3 px-8 py-10 bg-sky-500 hover:bg-sky-800 dark:bg-white dark:hover:bg-sky-500 rounded-3xl shadow-main">
                                <span>
                                    <img width="50" height="50"
                                        src="https://img.icons8.com/ios/50/billing-machine.png" alt="billing-machine" />
                                </span>
                                <a href="">
                                    <p class="text-2xl font-extrabold text-gray-900">Factura Egresos</p>
                                </a>
                            </div>

                            {{-- Estado de Cuenta --}}
                            <div
                                class="flex flex-col items-center gap-3 px-8 py-10 bg-sky-500 hover:bg-sky-800 dark:bg-white dark:hover:bg-sky-500 rounded-3xl shadow-main">
                                <span>
                                    <img width="50" height="50"
                                        src="https://img.icons8.com/glyph-neue/64/bill.png" alt="bill" />
                                </span>
                                <a href="">
                                    <p class="text-2xl font-extrabold text-gray-900">Estados de cuenta</p>
                                </a>
                            </div>

                            {{-- Informes --}}
                            {{-- <div
                                class="flex flex-col items-center gap-3 px-8 py-10 bg-sky-500 hover:bg-sky-800 dark:bg-white dark:hover:bg-sky-500 rounded-3xl shadow-main">
                                <span>
                                    <img width="50" height="50"
                                        src="https://img.icons8.com/dotty/80/graph-report.png" alt="graph-report" />
                                </span>
                                <a href="{{ route('gestor-informes-contabilidad', ['empresaId' => $id]) }}">
                                    <p class="text-2xl font-extrabold text-gray-900">Informes</p>
                                </a>
                            </div> --}}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

</x-app-layout>
