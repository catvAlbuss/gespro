<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Editar Metrados Estructuras') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-2xl mx-auto bg-white p-6 rounded shadow">
            <h2 class="text-xl font-bold mb-4">Editar Metrado Estructuras</h2>

            @if (session('success'))
                <div class="bg-green-500 text-white p-2 rounded mb-4">
                    {{ session('success') }}
                </div>
            @endif

            <form action="{{ route('metradoestructuras.update', $metrado->idmetradoestructuras) }}" method="POST">
                @csrf
                @method('PUT')

                <div class="mb-4">
                    <label class="block text-gray-700">Nombre Proyecto</label>
                    <input type="text" name="nombre_proyecto"
                        value="{{ old('nombre_proyecto', $metrado->nombre_proyecto) }}"
                        class="w-full p-2 border rounded">
                    @error('nombre_proyecto')
                        <small class="text-red-500">{{ $message }}</small>
                    @enderror
                </div>

                <div class="mb-4">
                    <label class="block text-gray-700">CUI</label>
                    <input type="text" name="cui" value="{{ old('cui', $metrado->cui) }}"
                        class="w-full p-2 border rounded">
                    @error('cui')
                        <small class="text-red-500">{{ $message }}</small>
                    @enderror
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700">Codigo Modular</label>
                    <input type="text" name="codigo_modular" value="{{ old('codigo_modular', $metrado->codigo_modular) }}"
                        class="w-full p-2 border rounded">
                    @error('codigo_modular')
                        <small class="text-red-500">{{ $message }}</small>
                    @enderror
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700">Codigo Local</label>
                    <input type="text" name="codigo_local" value="{{ old('codigo_local', $metrado->codigo_local) }}"
                        class="w-full p-2 border rounded">
                    @error('codigo_local')
                        <small class="text-red-500">{{ $message }}</small>
                    @enderror
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700">Unidad Ejecutora</label>
                    <input type="text" name="unidad_ejecutora" value="{{ old('unidad_ejecutora', $metrado->unidad_ejecutora) }}"
                        class="w-full p-2 border rounded">
                    @error('unidad_ejecutora')
                        <small class="text-red-500">{{ $message }}</small>
                    @enderror
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700">Fecha</label>
                    <input type="date" name="fecha" value="{{ old('fecha', $metrado->fecha) }}"
                        class="w-full p-2 border rounded">
                    @error('fecha')
                        <small class="text-red-500">{{ $message }}</small>
                    @enderror
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700">Especialidad</label>
                    <input type="text" name="especialidad" value="{{ old('especialidad', $metrado->especialidad) }}"
                        class="w-full p-2 border rounded">
                    @error('especialidad')
                        <small class="text-red-500">{{ $message }}</small>
                    @enderror
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700">Localidad</label>
                    <input type="text" name="localidad" value="{{ old('localidad', $metrado->localidad) }}"
                        class="w-full p-2 border rounded">
                    @error('localidad')
                        <small class="text-red-500">{{ $message }}</small>
                    @enderror
                </div>



                <div class="flex justify-end space-x-2">
                    <a href="{{ route('metradoelectricas.index') }}"
                        class="px-4 py-2 bg-gray-500 text-white rounded">Cancelar</a>
                    <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded">Guardar</button>
                </div>
            </form>
        </div>
    </div>

</x-app-layout>
