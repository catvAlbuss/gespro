import { ref, onMounted, inject } from 'vue';

export const AguaSystem = {
    template: `
    <div class="agua-system-container w-full">
      <!-- Header de tabs -->
      <div
        class="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg shadow-lg mb-4 overflow-hidden border-b border-slate-200/60 sticky top-0 z-50">
        <div class="overflow-x-auto scrollbar-hide">
          <nav class="flex whitespace-nowrap min-w-full">
            <button v-for="tab in tabs" :key="tab.id" @click="changeTab(tab.id)"
              :class="[ 'flex items-center space-x-2 px-4 py-3 border-b-2 font-medium text-xs transition-all duration-200',
                activeTab === tab.id ? 'border-cyan-500 bg-gradient-to-b from-cyan-50 to-blue-50 text-cyan-700'
                  : 'border-transparent text-gray-600 hover:text-cyan-600 hover:bg-cyan-50/50']">
              <i :class="['fas', tab.icon, 'text-xs']"></i>
              <span>{{ tab.name }}</span>
            </button>
          </nav>
        </div>
      </div>

      <!-- Contenedor de contenido -->
      <div class="bg-gradient-to-br from-white to-cyan-50/30 rounded-lg shadow-lg border border-blue-100/50 min-h-96">
        <div v-if="loading" class="p-8 text-center">
          <div class="flex items-center justify-center space-x-3 mb-4">
            <div class="pulse-loader"></div>
            <span class="text-gray-600">Inicializando sistema de agua...</span>
          </div>
        </div>

        <div v-else>
          <div v-show="activeTab === 'demandaDiaria'" id="demandaDiaria-content" class="p-4"></div>
          <div v-show="activeTab === 'cisterna'" id="cisterna-content" class="p-4"></div>
          <div v-show="activeTab === 'tanque'" id="tanque-content" class="p-4"></div>
          <div v-show="activeTab === 'redAlimentacion'" id="red-alimentacion-content" class="p-4"></div>
          <div v-show="activeTab === 'maximademandasimultanea'" id="maximademanda-simultanea-content" class="p-4"></div>
          <div v-show="activeTab === 'bombeoTanqueElevado'" id="bombeo-tanque-elevado-content" class="p-4"></div>
          <div v-show="activeTab === 'tuberiasRD'" id="tuberias-rd-grades-content" class="p-4"></div>
          <div v-show="activeTab === 'redesInteriores'" id="redes-interiores-grades-content" class="p-4"></div>
          <div v-show="activeTab === 'redRiego'" id="red-griego-content" class="p-4"></div>
        </div>
      </div>
    </div>
  `,

    setup() {
        const aguaModules = inject('aguaModules');
        const activeTab = ref('demandaDiaria');
        const loading = ref(true);

        const tabs = [
            { id: 'demandaDiaria', name: 'DEMANDA DIARIA', icon: 'fa-chart-bar' },
            { id: 'cisterna', name: 'CISTERNA', icon: 'fa-cube' },
            { id: 'tanque', name: 'TANQUE', icon: 'fa-water' },
            { id: 'redAlimentacion', name: 'RED DE ALIMENTACIÓN', icon: 'fa-diagram-project' },
            { id: 'maximademandasimultanea', name: 'MÁXIMA DEMANDA SIMULTÁNEA', icon: 'fa-wave-square' },
            { id: 'bombeoTanqueElevado', name: 'BOMBEO AL TANQUE ELEVADO', icon: 'fa-pump' },
            { id: 'tuberiasRD', name: 'TUB.RD', icon: 'fa-pipes' },
            { id: 'redesInteriores', name: 'REDES INTERIORES', icon: 'fa-network-wired' },
            { id: 'redRiego', name: 'RED DE RIEGO', icon: 'fa-spray-can-sparkles' },
        ];

        const changeTab = (tabId) => {
            activeTab.value = tabId;
            const event = new CustomEvent('tab-changed', { detail: { currentTab: tabId } });
            document.dispatchEvent(event);
        };

        onMounted(() => {
            // Espera un poco más para asegurar render
            setTimeout(() => {
                loading.value = false;

                setTimeout(() => {  // 🔹 segundo delay garantiza que el DOM ya tenga los elementos
                    try {
                        aguaModules?.initDemandaDiariaModule?.();
                        aguaModules?.initCisternaModule?.();
                        aguaModules?.initTanqueModule?.();
                        aguaModules?.initRedAlimentacionModule?.();
                        aguaModules?.initMaximaDemandaModule?.();
                        aguaModules?.initBombeoTanqueModule?.();
                        aguaModules?.initRedDistribucionModule?.();
                        aguaModules?.initRedesInterioresModule?.();
                        aguaModules?.initRedriegosModule?.();

                        console.log('✅ Todos los módulos de agua inicializados');
                    } catch (e) {
                        console.error('Error al inicializar módulos:', e);
                    }
                }, 100); // <- pequeño retraso para asegurar que el DOM existe
            }, 400);
        });

        return { activeTab, loading, tabs, changeTab };
    },
};
