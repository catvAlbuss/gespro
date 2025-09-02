<x-app-layout>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.14/jspdf.plugin.autotable.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.0/Sortable.min.js"></script>
    <x-slot name="header">
        <h2 class="font-semibold text-2xl text-gray-900 dark:text-gray-100 leading-tight flex items-center gap-2">
            <svg class="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 3h18v2H3V3zm2 4h14v14H5V7zm4 2v10h2V9H9zm4 0v10h2V9h-2z" />
            </svg>
            {{ __('Trámites') }}
        </h2>
    </x-slot>
    <script>
        window.APP_INIT = {
            empresaId: @json($empresaId),
            trabajadorId: @json(Auth::user()->id),
            csrfToken: @json(csrf_token())
        };
    </script>
    <div id="tramites-app" class="p-6">
        <!-- Vue App will be mounted here -->
    </div>

    @vite('resources/js/tramites/tramites.js')
</x-app-layout>
