<x-app-layout>
    <x-slot name="header">
        <div class="flex flex-col sm:flex-row items-end justify-stard space-x-2">
            <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                {{ __('Registrar de Trabajadores') }}
            </h2>
        </div>
    </x-slot>


    <div class="py-12">
        <div class="container mx-auto w-full">
            <div class="flex flex-wrap">

                <div class="w-full md:w-1/3 px-4 md:mt-0">
                    <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                        <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                            Buscar Trabajador
                        </h3>

                        <div class="overflow-auto">
                            <form method="POST" action="{{ route('personal.obtener.dni') }}">
                                @csrf
                                <!-- Name -->
                                <div>
                                    <x-input-label for="dni" :value="__('DNI')" />
                                    <x-text-input id="dni" class="block mt-1 w-full" type="text" name="dni"
                                        :value="old('dni')" required autofocus autocomplete="dni" />
                                    <x-input-error :messages="$errors->get('dni')" class="mt-2" />
                                </div>

                                <input type="hidden" name="empresaId" id="empresaId" value="{{ $empresaId }}">

                                <div class="flex items-center justify-end mt-4">
                                    <x-primary-button class="ms-4">
                                        {{ __('Validar') }}
                                    </x-primary-button>
                                </div>
                            </form>
                        </div>

                        <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                            {{ isset($user) ? 'Editar Usuario' : 'Crear Usuario' }}
                        </h3>

                        <div class="overflow-auto">
                            <form method="POST" enctype="multipart/form-data"
                                action="{{ isset($trabajadore) ? route('personal.trabajadores.update', $trabajadore->id) : route('personal.trabajadores.store') }}">
                                @csrf
                                @if (isset($trabajadore))
                                    @method('PUT')
                                @endif
                                <div>
                                    <x-input-label for="name" :value="__('Nombre Usuario')" />
                                    <x-text-input id="name" class="block mt-1 w-full" type="text" name="name"
                                        :value="old('name', $trabajadore->name ?? ($user->nombres ?? ''))" required autofocus />
                                </div>
                                <div>
                                    <x-input-label for="surname" :value="__('Apellido Usuario')" />
                                    <x-text-input id="surname" class="block mt-1 w-full" type="text" name="surname"
                                        :value="old(
                                            'surname',
                                            $trabajadore->surname ??
                                                ($user->apellidoPaterno ?? '') . ' ' . ($user->apellidoMaterno ?? ''),
                                        )" required autofocus />
                                </div>
                                <div>
                                    <x-input-label for="email" :value="__('Correo Electrónico')" />
                                    <x-text-input id="email" class="block mt-1 w-full" type="email" name="email"
                                        value="{{ old('email', $trabajadore->email ?? '') }}" required />
                                </div>
                                <div>
                                    <x-input-label for="dni_user" :value="__('Documento Nacional de Identidad (DNI)')" />
                                    <x-text-input id="dni_user" class="block mt-1 w-full" type="number"
                                        name="dni_user" :value="old(
                                            'dni_user',
                                            $trabajadore->dni_user ?? ($user->numeroDocumento ?? ''),
                                        )" required autofocus />
                                </div>
                                <div>
                                    <x-input-label for="phone" :value="__('Celular User')" />
                                    <x-text-input id="phone" class="block mt-1 w-full" type="number" name="phone"
                                        value="{{ old('phone', $trabajadore->phone ?? '') }}" required autofocus />
                                </div>
                                <div>
                                    <x-input-label for="fecha_nac" :value="__('Fecha de nacimiento')" />
                                    <x-text-input id="fecha_nac" class="block mt-1 w-full" type="date"
                                        name="fecha_nac"
                                        value="{{ old('fecha_nac', isset($trabajadore->fecha_nac) ? \Carbon\Carbon::parse($trabajadore->fecha_nac)->format('Y-m-d') : '') }}"
                                        required autofocus />
                                </div>
                                <div>
                                    <x-input-label for="sueldo_base" :value="__('Sueldo Base')" />
                                    <x-text-input id="sueldo_base" class="block mt-1 w-full" type="number"
                                        name="sueldo_base"
                                        value="{{ old('sueldo_base', $trabajadore->sueldo_base ?? '') }}" required
                                        autofocus />
                                </div>
                                <div>
                                    <x-input-label for="area_laboral" :value="__('Area Laboral')" />
                                    <x-input-select id="area_laboral" class="block mt-1 w-full" name="area_laboral"
                                        required>
                                        <option value="Asistente"
                                            {{ old('area_laboral', $trabajadore->area_laboral ?? '') == 'Asistente' ? 'selected' : '' }}>
                                            Asistente</option>
                                        <option value="Jefe de area"
                                            {{ old('area_laboral', $trabajadore->area_laboral ?? '') == 'Jefe de area' ? 'selected' : '' }}>
                                            Jefe de area</option>
                                        <option value="Administrador de Proyectos"
                                            {{ old('area_laboral', $trabajadore->area_laboral ?? '') == 'Administrador de Proyectos' ? 'selected' : '' }}>
                                            Administrador de Proyectos</option>
                                        <option value="Logistico"
                                            {{ old('area_laboral', $trabajadore->area_laboral ?? '') == 'Logistico' ? 'selected' : '' }}>
                                            Logistico</option>
                                        <option value="Administracion"
                                            {{ old('area_laboral', $trabajadore->area_laboral ?? '') == 'Administracion' ? 'selected' : '' }}>
                                            Administracion</option>
                                        <option value="Contabilidad"
                                            {{ old('area_laboral', $trabajadore->area_laboral ?? '') == 'Contabilidad' ? 'selected' : '' }}>
                                            Contabilidad</option>
                                    </x-input-select>
                                </div>
                                <div>
                                    <x-input-label for="nivel_estudio" :value="__('Nivel de Estudio')" />
                                    <x-input-select id="nivel_estudio" class="block mt-1 w-full" name="nivel_estudio"
                                        required>
                                        <option value="Segundaria_completa"
                                            {{ old('nivel_estudio', $trabajadore->nivel_estudio ?? '') == 'Segundaria_completa' ? 'selected' : '' }}>
                                            Secundaria Completa</option>
                                        <option value="practicante"
                                            {{ old('nivel_estudio', $trabajadore->nivel_estudio ?? '') == 'practicante' ? 'selected' : '' }}>
                                            Practicante</option>
                                        <option value="tecnico"
                                            {{ old('nivel_estudio', $trabajadore->nivel_estudio ?? '') == 'tecnico' ? 'selected' : '' }}>
                                            Tecnico</option>
                                        <option value="universitario"
                                            {{ old('nivel_estudio', $trabajadore->nivel_estudio ?? '') == 'universitario' ? 'selected' : '' }}>
                                            Universitario</option>
                                        <option value="egresado"
                                            {{ old('nivel_estudio', $trabajadore->nivel_estudio ?? '') == 'egresado' ? 'selected' : '' }}>
                                            Egresado</option>
                                        <option value="bachiller"
                                            {{ old('nivel_estudio', $trabajadore->nivel_estudio ?? '') == 'bachiller' ? 'selected' : '' }}>
                                            Bachiller</option>
                                        <option value="titulado"
                                            {{ old('nivel_estudio', $trabajadore->nivel_estudio ?? '') == 'titulado' ? 'selected' : '' }}>
                                            Titulado</option>
                                    </x-input-select>
                                </div>
                                <br>

                                <div class="form-group flex justify-center">
                                    <img src="{{ asset('/storage/profile/' . ($trabajadore->image_user ?? '')) }}"
                                        class="rounded-3xl" alt="Profile Image" width="150">
                                </div>
                                <br>
                                <div>
                                    <x-input-label for="image_user" :value="__('Imagen Perfil')" />
                                    <x-text-input id="image_user" name="image_user" type="file"
                                        class="block mt-1 w-full" accept="image/*" />
                                </div>

                                <br>
                                <div>
                                    <x-input-label for="contratouser" :value="__('Contrato User')" />

                                    @if (isset($trabajadore) && $trabajadore->contratouser)
                                        <div class="flex justify-center mb-2">
                                            <a href="{{ asset('/storage/contrato/' . $trabajadore->contratouser) }}"
                                                target="_blank" class="text-blue-600">
                                                Ver Contrato
                                            </a>
                                        </div>
                                    @endif

                                    <x-text-input id="contratouser" name="contratouser" type="file"
                                        class="block mt-1 w-full" accept="application/pdf" />
                                </div>

                                @if (!isset($trabajadore))
                                    <div>
                                        <x-input-label for="password" :value="__('Contraseña')" />
                                        <x-text-input id="password" class="block mt-1 w-full" type="password"
                                            name="password" value="{{ old('password') }}" required />
                                    </div>
                                @endif
                                <input type="hidden" name="empresaId" id="empresaId" value="{{ $empresaId }}">
                                <div class="flex items-center justify-end mt-4">
                                    <x-primary-button class="ml-4">
                                        {{ isset($trabajadore) ? __('Actualizar') : __('Guardar') }}
                                    </x-primary-button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <div class="w-full md:w-2/3 px-4 md:mt-0">
                    <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                        <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Lista de Personal
                        </h3>
                        <div class="p-6">
                            <div class="container flex flex-col items-center gap-16 mx-auto my-30">
                                <div class="grid w-full grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                                    @if ($users->isEmpty())
                                        <p class="text-gray-950 dark:text-gray-200">No hay usuarios asociados a esta
                                            empresa.</p>
                                    @else
                                        @foreach ($users as $user)
                                            <div
                                                class="relative flex flex-col text-gray-700 bg-white shadow-md bg-clip-border rounded-xl w-60">
                                                <div
                                                    class="relative mx-4 mt-4 overflow-hidden text-gray-700 bg-white bg-clip-border rounded-xl h-48">
                                                    <img src="{{ asset('/storage/profile/' . $user->image_user) }}"
                                                        alt="card-image" class="object-cover w-full h-48" />
                                                </div>
                                                <div class="p-6">
                                                    <div class="flex items-center justify-between mb-2">
                                                        <p
                                                            class="block font-sans text-base text-center antialiased font-medium leading-relaxed text-blue-gray-900">
                                                            {{ $user->name }} {{ $user->surname }}
                                                        </p>
                                                    </div>
                                                    @php
                                                        $fecha_nac = $user->fecha_nac;

                                                        // Crear un objeto DateTime para la fecha de nacimiento
                                                        $fechaNacimiento = new DateTime($fecha_nac);

                                                        // Obtener la fecha actual
                                                        $fechaActual = new DateTime();

                                                        // Calcular la diferencia entre las dos fechas
                                                        $edad = $fechaActual->diff($fechaNacimiento)->y;
                                                    @endphp
                                                    <p
                                                        class="block font-sans text-base text-center antialiased font-medium leading-relaxed text-blue-gray-900">
                                                        {{ $edad }} Años
                                                    </p>
                                                    <p
                                                        class="block font-sans text-sm antialiased font-normal leading-normal text-gray-700 opacity-75">
                                                        DNI: {{ $user->dni_user }}
                                                    </p>
                                                    <p
                                                        class="block font-sans text-sm antialiased font-normal leading-normal text-gray-700 opacity-75">
                                                        Celular: {{ $user->phone }}
                                                    </p>
                                                    <p
                                                        class="block font-sans text-sm antialiased font-normal leading-normal text-gray-700 opacity-75">
                                                        Area Laboral: {{ $user->area_laboral }}
                                                    </p>
                                                    <p
                                                        class="block font-sans text-sm antialiased font-normal leading-normal text-gray-700 opacity-75">
                                                        Nivel de Estudio: {{ $user->nivel_estudio }}
                                                    </p>
                                                </div>
                                                <div class="p-2 pt-0">
                                                    <a href="{{ route('personal.trabajadores.edit', $user->id) }}"
                                                        class="text-blue-600 align-middle select-none font-sans font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-1 px-6 rounded-lg shadow-gray-900/10 hover:shadow-gray-900/20 focus:opacity-[0.85] active:opacity-[0.85] active:shadow-none block w-full bg-blue-gray-900/10 text-blue-gray-900 shadow-none hover:scale-105 hover:shadow-none focus:scale-105 focus:shadow-none active:scale-100">Editar</a>
                                                    <form
                                                        action="{{ route('personal.trabajadores.destroy', $user->id) }}"
                                                        method="POST" class="inline">
                                                        @csrf
                                                        @method('DELETE')
                                                        <button type="submit"
                                                            class="text-red-600 align-middle select-none font-sans font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-1 px-6 rounded-lg shadow-gray-900/10 hover:shadow-gray-900/20 focus:opacity-[0.85] active:opacity-[0.85] active:shadow-none block w-full bg-blue-gray-900/10 text-blue-gray-900 shadow-none hover:scale-105 hover:shadow-none focus:scale-105 focus:shadow-none active:scale-100">Eliminar</button>
                                                    </form>
                                                    {{-- <button 
                                                        class="align-middle select-none font-sans font-bold text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-1 px-6 rounded-lg shadow-gray-900/10 hover:shadow-gray-900/20 focus:opacity-[0.85] active:opacity-[0.85] active:shadow-none block w-full bg-blue-gray-900/10 text-blue-gray-900 shadow-none hover:scale-105 hover:shadow-none focus:scale-105 focus:shadow-none active:scale-100"
                                                        type="button">
                                                        Mas Informacion
                                                    </button> --}}
                                                </div>
                                            </div>
                                        @endforeach
                                    @endif
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
