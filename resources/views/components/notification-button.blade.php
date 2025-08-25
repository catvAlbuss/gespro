{{-- resources/views/components/notification-dropdown.blade.php --}}
@props(['notifications', 'unreadCount'])

<div x-data="{ open: false }" @click.away="open = false" class="relative">
    {{-- Botón de notificaciones --}}
    <button @click="open = !open"
        class="py-4 px-5 relative border-2 border-transparent text-gray-800 dark:text-gray-50 rounded-full hover:text-gray-400 focus:outline-none focus:text-gray-500 transition duration-150 ease-in-out">
        <svg class="h-6 w-6" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            viewBox="0 0 24 24" stroke="currentColor">
            <path
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z">
            </path>
        </svg>
        <span class="absolute inset-0 object-right-top -mr-6">
            <div
                class="inline-flex items-center px-1.5 py-0.5 border-2 border-white rounded-full text-xs font-semibold leading-4 bg-red-500 text-white">
                {{ auth()->user()->unreadNotifications->count() }}
            </div>
        </span>
    </button>

    {{-- Panel de notificaciones --}}
    <div x-show="open" x-transition:enter="transition ease-out duration-200"
        x-transition:enter-start="opacity-0 transform scale-95" x-transition:enter-end="opacity-100 transform scale-100"
        x-transition:leave="transition ease-in duration-75" x-transition:leave-start="opacity-100 transform scale-100"
        x-transition:leave-end="opacity-0 transform scale-95"
        class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg dark:bg-gray-800 z-50">

        <div class="p-4 border-b border-gray-200">
            <div class="flex justify-between items-center">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Notificaciones</h3>
                @if (auth()->user()->unreadNotifications->count() > 0)
                    <form action="{{ route('notifications.markAllAsRead') }}" method="POST">
                        @csrf
                        <button type="submit"
                            class="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                            Marcar todas como leídas
                        </button>
                    </form>
                @endif
            </div>
        </div>

        <div class="max-h-96 overflow-y-auto">
              @forelse(auth()->user()->notifications()->orderBy('created_at', 'desc')->get() as $notification)
                @if ($notification->read_at)
                    @continue
                @endif
                <div class="p-4 border-b border-gray-200 {{ $notification->read_at ? 'bg-gray-50' : 'bg-white' }}">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <p
                                class="text-sm {{ $notification->read_at ? 'text-gray-600' : 'font-semibold text-gray-900' }}">
                                {{ $notification->data['mensaje'] }}
                            </p>
                            <p class="text-xs text-gray-500 mt-1">
                                {{ \Carbon\Carbon::parse($notification->created_at)->diffForHumans() }}
                            </p>
                        </div>
                        @unless ($notification->read_at)
                            <form action="{{ route('notifications.markAsRead', $notification->id) }}" method="POST"
                                class="ml-3">
                                @csrf
                                <button type="submit" class="text-blue-600 hover:text-blue-800">
                                    <span class="sr-only">Marcar como leída</span>
                                    <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clip-rule="evenodd" />
                                    </svg>
                                </button>
                            </form>
                        @endunless
                    </div>
                </div>
            @empty
                <div class="p-4 text-center text-gray-500">
                    No hay notificaciones
                </div>
            @endforelse
        </div>
    </div>
</div>
