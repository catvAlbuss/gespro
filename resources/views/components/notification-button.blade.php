{{-- resources/views/components/notification-dropdown.blade.php --}}
@props(['notifications', 'unreadCount'])

<div x-data="{ open: false }" @click.away="open = false" class="relative">
    {{-- Botón de notificaciones --}}
    <button @click="open = !open"
        class="relative p-2 text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900">
        <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 17h5l-5 5v-5zM10.07 2.82l-.9 1.63A9 9 0 003 12v3.8a.6.6 0 00.6.6h6.8l5.3 5.3a.6.6 0 001-.4v-3.8a9 9 0 00-6.07-8.48l-.9 1.63z" />
        </svg>
        <!-- Notification Badge -->
        <span
            class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse"> {{ auth()->user()->unreadNotifications->count() }}</span>
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
