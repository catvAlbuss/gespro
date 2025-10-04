import { createApp, ref, reactive, computed, onMounted, nextTick, onUnmounted, watch } from 'vue';

const app = createApp({
    setup() {

        return
    },
    template: `
        <div class="min-h-screen bg-gradient-to-br from-blue-950 to-indigo-200 p-1">
            <!-- Barra de herramientas -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-1">
                <div class="flex flex-wrap gap-3 items-center">
                    <!-- Título -->
                    <h1 class="text-1xl text-gray-980 dark:text-white font-bold text-blue-900 mr-auto">
                        costos
                    </h1>

                    <!-- Separador -->
                    <div class="h-8 w-px bg-gray-300"></div>
                </div>
            </div>
        </div>
    `
})
app.mount('#SystemCostos');