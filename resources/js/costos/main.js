import { createApp, ref, reactive, onMounted } from 'vue';

const { costos, presupuestosIds, metradoIds, cronogramaIds, ettpIds, routes, csrfToken } = window.APP_INIT || {};

const app = createApp({
    setup() {
        const metrado = metradoIds?.[0] || {};
        const presupuesto = presupuestosIds?.[0] || {};
        const cronogramas = cronogramaIds?.[0] || {};
        const ettp = ettpIds?.[0] || {};

        // Estructura del árbol con descripciones
        const treeData = reactive({
            name: 'Costos',
            description: 'Gestión integral de costos del proyecto',
            children: [
                {
                    name: 'Metrados',
                    icon: '📐',
                    route: '#metrados',
                    description: 'Cálculo y medición de cantidades de obra por especialidad',
                    children: [
                        {
                            icon: '🏛️',
                            name: 'Metrados Arquitectura',
                            description: 'Mediciones de elementos arquitectónicos: muros, pisos, acabados',
                            route: `${routes.metradoarquitectura}/${metrado.m_arq_id}`
                        },
                        {
                            icon: '🏗️',
                            name: 'Metrado Estructura',
                            description: 'Cuantificación de elementos estructurales: columnas, vigas, losas',
                            route: `${routes.metradoestructuras}/${metrado.m_arq_id}`
                        },
                        {
                            icon: '🚿',
                            name: 'Metrado Sanitarias',
                            description: 'Mediciones de instalaciones de agua y desagüe',
                            route: `${routes.metradosanitarias}/${metrado.m_san_id}`
                        },
                        {
                            icon: '💡',
                            name: 'Metrado Electricas',
                            description: 'Cuantificación de instalaciones eléctricas y alumbrado',
                            route: `${routes.metradoelectricas}/${metrado.m_elec_id}`
                        },
                        {
                            icon: '🧱',
                            name: 'Metrado Comunicaciones',
                            description: 'Mediciones de redes de datos y comunicaciones',
                            route: `${routes.metradocomunicacion}/${metrado.m_com_id}`
                        },
                        {
                            icon: '🔥',
                            name: 'Metrado Gas',
                            description: 'Cuantificación de instalaciones de gas natural',
                            route: `${routes.metradogas}/${metrado.m_gas_id}`
                        }
                    ]
                },
                {
                    name: 'Presupuestos',
                    icon: '💰',
                    description: 'Valorización económica del proyecto y análisis de costos unitarios',
                    route: `${routes.presupuestos}/${presupuesto}`
                },
                {
                    name: 'Cronogramas',
                    icon: '📅',
                    route: '#cronogramas',
                    description: 'Planificación temporal y programación de actividades',
                    children: [
                        {
                            icon: '📊',
                            name: 'Cronograma General',
                            description: 'Programación de actividades y hitos del proyecto',
                            route: `${routes.cronogramageneral}/${cronogramas.cron_gen_id}`
                        },
                        {
                            icon: '💵',
                            name: 'Cronograma Valorizado',
                            description: 'Distribución temporal de costos y avances económicos',
                            route: '#m-est'
                        },
                    ]
                },
                {
                    name: 'Especificaciones Técnicas',
                    icon: '📋',
                    description: 'Documentación técnica detallada de partidas y procedimientos',
                    route: `${routes.especificacionestecnicas}/${ettp}`
                },
                {
                    name: 'Formula Polinómica',
                    icon: '📈',
                    description: 'Cálculo de reajuste de precios por variación de índices',
                    route: '#fp'
                }
            ]
        });

        // Estado para controlar qué nodos están expandidos
        const expanded = ref(new Set());

        // Expandir automáticamente hasta el segundo nivel
        onMounted(() => {
            // Expandir el nodo raíz
            expanded.value.add(treeData.name);

            // Expandir todos los nodos de primer nivel que tienen hijos
            treeData.children.forEach(child => {
                if (child.children && child.children.length > 0) {
                    expanded.value.add(child.name);
                }
            });
        });

        const toggleExpand = (name) => {
            if (expanded.value.has(name)) {
                expanded.value.delete(name);
            } else {
                expanded.value.add(name);
            }
        };

        const isExpanded = (name) => expanded.value.has(name);

        return {
            treeData,
            toggleExpand,
            isExpanded
        };
    },
    template: `
        <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
            <!-- Encabezado mejorado -->
            <div class="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-800 dark:to-indigo-900 rounded-2xl shadow-2xl p-6 mb-6 max-w-7xl mx-auto border border-blue-200 dark:border-blue-700">
                <div class="flex items-center gap-4">
                    <div class="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-lg">
                        <svg class="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div class="flex-1">
                        <h1 class="text-3xl font-bold text-white mb-1">Sistema de Gestión de Costos</h1>
                        <p class="text-blue-100 text-sm">Administración integral de costos, metrados y programación del proyecto</p>
                    </div>
                    <div class="hidden md:flex items-center gap-2 bg-white/20 dark:bg-black/20 backdrop-blur-sm rounded-lg px-4 py-2">
                        <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span class="text-white text-sm font-medium">Sistema Activo</span>
                    </div>
                </div>
            </div>

            <!-- Árbol de costos mejorado -->
            <div class="max-w-7xl mx-auto">
                <TreeNode 
                    :node="treeData" 
                    :level="0" 
                    :expanded="isExpanded" 
                    @toggle="toggleExpand"/>
            </div>
        </div>
`
});

// Componente recursivo mejorado para nodos del árbol
app.component('TreeNode', {
    props: ['node', 'level', 'expanded'],
    emits: ['toggle'],
    setup(props, { emit }) {
        const hasChildren = props.node.children && props.node.children.length > 0;

        const handleClick = () => {
            if (hasChildren) {
                emit('toggle', props.node.name);
            }
        };

        const getLevelStyle = () => {
            const styles = {
                0: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-xl border-2 border-blue-300',
                1: 'bg-white dark:bg-gray-700 shadow-lg hover:shadow-xl border-l-4 border-blue-500',
                2: 'bg-gradient-to-r from-blue-50 to-blue-50 dark:from-gray-800 dark:to-gray-800 shadow-md hover:shadow-lg border-l-4 border-blue-400'
            };
            return styles[props.level] || 'bg-white dark:bg-gray-800 shadow hover:shadow-md';
        };

        const getIconStyle = () => {
            const styles = {
                0: 'text-white text-2xl',
                1: 'text-blue-600 dark:text-blue-400 text-xl',
                2: 'text-blue-600 dark:text-blue-400 text-lg'
            };
            return styles[props.level] || 'text-gray-600';
        };

        return {
            hasChildren,
            handleClick,
            getLevelStyle,
            getIconStyle
        };
    },
    template: `
        <div class="mb-3" :style="{ paddingLeft: level > 0 ? '2rem' : '0' }">
            <div 
                class="relative flex items-start p-4 rounded-xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
                :class="getLevelStyle()"
                @click="handleClick">
                
                <!-- Indicador de conexión para niveles hijos -->
                <div v-if="level > 0" class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-400 to-blue-400 rounded-l-xl"></div>
                
                <!-- Ícono expansión/colapso -->
                <div v-if="hasChildren" class="flex-shrink-0 w-8 h-8 flex items-center justify-center mr-3 rounded-lg transition-all duration-300"
                    :class="level === 0 ? 'bg-white/20' : 'bg-indigo-100 dark:bg-gray-600'">
                    <span class="transition-transform duration-300" :class="{ 'rotate-90': expanded(node.name) }" :style="{ color: level === 0 ? 'white' : '#4f46e5' }">
                        ▶
                    </span>
                </div>
                
                <!-- Ícono del nodo -->
                <div v-else class="flex-shrink-0 w-8 h-8 flex items-center justify-center mr-3 rounded-lg"
                    :class="level === 0 ? 'bg-white/20' : level === 1 ? 'bg-indigo-100 dark:bg-gray-600' : 'bg-blue-100 dark:bg-gray-700'">
                    <span :class="getIconStyle()">{{ node.icon || '•' }}</span>
                </div>

                <!-- Contenido del nodo -->
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="font-bold text-lg" :class="level === 0 ? 'text-white' : 'text-gray-800 dark:text-white'">
                            {{ node.name }}
                        </span>
                        
                        <!-- Badge de nivel -->
                        <span v-if="hasChildren" class="px-2 py-0.5 text-xs font-semibold rounded-full"
                            :class="level === 0 ? 'bg-white/30 text-white' : level === 1 ? 'bg-indigo-200 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' : 'bg-purple-200 text-purple-800 dark:bg-purple-900 dark:text-purple-200'">
                            {{ node.children.length }} {{ node.children.length === 1 ? 'elemento' : 'elementos' }}
                        </span>
                    </div>
                    
                    <!-- Descripción -->
                    <p v-if="node.description" class="text-sm mt-1 leading-relaxed" 
                        :class="level === 0 ? 'text-blue-100' : 'text-gray-600 dark:text-gray-300'">
                        {{ node.description }}
                    </p>
                </div>

                <!-- Botón de acción -->
                <a v-if="!hasChildren && node.route" 
                    :href="node.route"
                    @click.stop
                    class="flex-shrink-0 ml-3 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                    :class="level === 0 ? 'bg-white text-blue-600 hover:bg-blue-50' : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'">
                    <span class="flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Ver
                    </span>
                </a>
            </div>

            <!-- Hijos expandidos con animación -->
            <transition
                enter-active-class="transition-all duration-300 ease-out"
                enter-from-class="opacity-0 -translate-y-2"
                enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transition-all duration-200 ease-in"
                leave-from-class="opacity-100 translate-y-0"
                leave-to-class="opacity-0 -translate-y-2">
                <div v-if="hasChildren && expanded(node.name)" class="mt-3 space-y-2">
                    <TreeNode
                        v-for="(child, index) in node.children"
                        :key="index"
                        :node="child"
                        :level="level + 1"
                        :expanded="expanded"
                        @toggle="$emit('toggle', $event)"/>
                </div>
            </transition>
        </div>
    `
});

app.mount('#SystemControlCostos');