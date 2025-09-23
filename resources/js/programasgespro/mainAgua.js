// mainAgua.js - Configuración del sistema principal para Vite

import { initDemandaDiariaModule } from './componentsAgua/demandadiaria.js';
import { initCisternaModule } from './componentsAgua/cisterna.js';
import { initTanqueModule } from './componentsAgua/tanque.js';
import { initRedAlimentacionModule } from './componentsAgua/redalimentacion.js';
import { initMaximaDemandaModule } from './componentsAgua/maximademandasimultanea.js';
import { initBombeoTanqueModule } from './componentsAgua/bombeotanque.js';
import { initRedDistribucionModule } from './componentsAgua/tuberiard-grade.js';
import { initRedesInterioresModule } from './componentsAgua/redesinteriores-grades.js';
import { initRedriegosModule } from './componentsAgua/redriego.js';

// Función para registrar el componente Alpine
function registerAguaSystemComponent() {
    // Verificar que Alpine esté disponible globalmente
    if (typeof window.Alpine === 'undefined') {
        console.error('Alpine.js no está disponible globalmente. Verifica app.js');
        return;
    }

    // Evitar registro duplicado
    if (window.Alpine._aguaSystemRegistered) {
        console.log('Componente aguaSystem ya registrado');
        return;
    }

    console.log('Registrando componente aguaSystem...');
    
    window.Alpine.data('aguaSystem', () => ({
        // Estado del sistema - Inicializar correctamente
        activeTab: 'demandaDiaria',
        systemData: {
            demandaDiaria: {},
            cisterna: {},
            tanque: {},
            redAlimentacion: {},
            maximaDemandaSimultanea: {},
            bombeoTanqueElevado: {},
            tuberiasRD: {},
            redesInteriores: {},
            redRiego: {}
        },
        
        // Variables de control
        isInitialized: false,
        modulesLoaded: false,
        _eventListenersSetup: false,

        // Configuración de tabs
        tabs: [
            { id: 'demandaDiaria', name: 'DEMANDA DIARIA', icon: 'fa-chart-bar' },
            { id: 'cisterna', name: 'CISTERNA', icon: 'fa-cube' },
            { id: 'tanque', name: 'TANQUE', icon: 'fa-water' },
            { id: 'redAlimentacion', name: 'RED DE ALIMENTACIÓN', icon: 'fa-diagram-project' },
            { id: 'maximademandasimultanea', name: 'MÁXIMA DEMANDA SIMULTÁNEA', icon: 'fa-wave-square' },
            { id: 'bombeoTanqueElevado', name: 'BOMBEO AL TANQUE ELEVADO', icon: 'fa-pump' },
            { id: 'tuberiasRD', name: 'TUB.RD', icon: 'fa-pipes' },
            { id: 'redesInteriores', name: 'REDES INTERIORES', icon: 'fa-network-wired' },
            { id: 'redRiego', name: 'RED DE RIEGO', icon: 'fa-spray-can-sparkles' }
        ],

        // Inicialización
        init() {
            if (this.isInitialized) {
                console.log('Sistema ya inicializado, evitando duplicación');
                return;
            }

            console.log('Inicializando Sistema de Agua...');
            
            try {
                this.setupEventListeners();
                
                // Usar nextTick para asegurar que el DOM esté listo
                this.$nextTick(() => {
                    this.initializeModules();
                });
                
                this.isInitialized = true;
                console.log('Sistema de Agua inicializado correctamente');
            } catch (error) {
                console.error('Error al inicializar el sistema:', error);
            }
        },

        // Cambiar de tab
        changeTab(tabId) {
            if (!tabId || typeof tabId !== 'string') {
                console.error('ID de tab inválido:', tabId);
                return;
            }

            const tabExists = this.tabs.some(tab => tab.id === tabId);
            if (!tabExists) {
                console.error('Tab no encontrado:', tabId);
                return;
            }

            console.log('Cambiando a tab:', tabId);
            this.activeTab = tabId;
            
            try {
                // Usar una función personalizada para el evento
                this.emitTabChangeEvent(tabId);
            } catch (error) {
                console.error('Error al cambiar tab:', error);
            }
        },

        // Emitir evento de cambio de tab de forma segura
        emitTabChangeEvent(tabId) {
            const eventDetail = { 
                currentTab: tabId, 
                allData: this.systemData || {} 
            };
            
            try {
                const event = new CustomEvent('tab-changed', { detail: eventDetail });
                document.dispatchEvent(event);
                console.log('Evento tab-changed emitido:', eventDetail);
            } catch (error) {
                console.error('Error al emitir evento tab-changed:', error);
            }
        },

        // Inicializar módulos
        initializeModules() {
            if (this.modulesLoaded) {
                console.log('Módulos ya cargados');
                return;
            }

            console.log('Cargando módulos del sistema...');
            
            // Esperar a que Alpine termine de renderizar el DOM
            this.$nextTick(() => {
                // Delay adicional para asegurar que los elementos estén en el DOM
                setTimeout(() => {
                    try {
                        this.loadTabContent();
                        this.modulesLoaded = true;
                        console.log('Todos los módulos cargados');
                    } catch (error) {
                        console.error('Error al cargar módulos:', error);
                    }
                }, 500); // Aumentar delay
            });
        },

        // Configurar event listeners
        setupEventListeners() {
            if (this._eventListenersSetup) {
                console.log('Event listeners ya configurados');
                return;
            }

            try {
                // Listeners para actualizaciones de datos de cada tab
                this.tabs.forEach(tab => {
                    const eventName = `${tab.id}-data-updated`;
                    
                    const handler = (event) => {
                        this.handleTabDataUpdate(tab.id, event.detail);
                    };
                    
                    document.addEventListener(eventName, handler);
                    console.log(`Event listener registrado para: ${eventName}`);
                });

                // Listeners del sistema
                document.addEventListener('system-data-export', () => {
                    this.exportSystemData();
                });

                document.addEventListener('system-data-import', (event) => {
                    this.importSystemData(event.detail);
                });

                this._eventListenersSetup = true;
                console.log('Todos los event listeners configurados');
            } catch (error) {
                console.error('Error al configurar event listeners:', error);
            }
        },

        // Cargar contenido de tabs
        loadTabContent() {
            const modules = [
                { func: initDemandaDiariaModule, name: 'DemandaDiaria', containerId: 'demandaDiaria-content' },
                { func: initCisternaModule, name: 'Cisterna', containerId: 'cisterna-content' },
                { func: initTanqueModule, name: 'Tanque', containerId: 'tanque-content' },
                { func: initRedAlimentacionModule, name: 'RedAlimentacion', containerId: 'red-alimentacion-content' },
                { func: initMaximaDemandaModule, name: 'MaximaDemanda', containerId: 'maximademanda-simultanea-content' },
                { func: initBombeoTanqueModule, name: 'BombeoTanque', containerId: 'bombeo-tanque-elevado-content' },
                { func: initRedDistribucionModule, name: 'RedDistribucion', containerId: 'tuberias-rd-grades-content' },
                { func: initRedesInterioresModule, name: 'RedesInteriores', containerId: 'redes-interiores-grades-content' },
                { func: initRedriegosModule, name: 'Redriegos', containerId: 'red-griego-content' }
            ];

            let loadedCount = 0;
            let errorCount = 0;

            // Verificar que todos los contenedores existan antes de inicializar módulos
            const missingContainers = [];
            modules.forEach(module => {
                const container = document.getElementById(module.containerId);
                if (!container) {
                    missingContainers.push(module.containerId);
                }
            });

            if (missingContainers.length > 0) {
                console.warn('Contenedores faltantes:', missingContainers);
                // Reintentar después de un delay más largo
                setTimeout(() => {
                    this.loadTabContent();
                }, 1000);
                return;
            }

            modules.forEach(module => {
                try {
                    if (typeof module.func === 'function') {
                        module.func();
                        loadedCount++;
                        console.log(`✓ Módulo ${module.name} inicializado`);
                    } else {
                        console.warn(`⚠ Función de módulo ${module.name} no disponible`);
                    }
                } catch (error) {
                    errorCount++;
                    console.error(`✗ Error al inicializar módulo ${module.name}:`, error);
                }
            });

            console.log(`Módulos cargados: ${loadedCount}, Errores: ${errorCount}`);
        },

        // Manejar actualización de datos de cada tab
        handleTabDataUpdate(tabId, data) {
            if (!tabId || !this.systemData || !this.systemData.hasOwnProperty(tabId)) {
                console.error('TabId inválido o systemData no disponible:', tabId);
                return;
            }

            try {
                // Asegurar que data sea un objeto
                const safeData = data && typeof data === 'object' ? data : {};
                
                // Actualizar datos de manera segura
                this.systemData[tabId] = { 
                    ...this.systemData[tabId], 
                    ...safeData 
                };

                // Emitir evento de cambio de datos del sistema
                const eventDetail = { 
                    source: tabId, 
                    data: this.systemData[tabId], 
                    allData: this.systemData 
                };

                document.dispatchEvent(new CustomEvent('system-data-changed', {
                    detail: eventDetail
                }));

                console.log(`Datos actualizados para tab: ${tabId}`, eventDetail);
            } catch (error) {
                console.error('Error al actualizar datos del tab:', error);
            }
        },

        // Exportar datos del sistema
        exportSystemData() {
            try {
                const exportData = {
                    timestamp: new Date().toISOString(),
                    version: '1.0',
                    data: this.systemData || {}
                };

                document.dispatchEvent(new CustomEvent('system-data-exported', {
                    detail: exportData
                }));

                console.log('Datos exportados correctamente:', exportData);
                return exportData;
            } catch (error) {
                console.error('Error al exportar datos:', error);
                return null;
            }
        },

        // Importar datos al sistema
        importSystemData(importedData) {
            if (!importedData || typeof importedData !== 'object' || !importedData.data) {
                console.error('Datos de importación inválidos:', importedData);
                return false;
            }

            try {
                this.systemData = { ...importedData.data };
                
                document.dispatchEvent(new CustomEvent('system-data-imported', {
                    detail: this.systemData
                }));

                console.log('Datos importados correctamente:', this.systemData);
                return true;
            } catch (error) {
                console.error('Error al importar datos:', error);
                return false;
            }
        },

        // Obtener datos de un tab
        getTabData(tabId) {
            if (!tabId || !this.systemData || !this.systemData.hasOwnProperty(tabId)) {
                console.warn('TabId inválido o no encontrado:', tabId);
                return {};
            }
            return this.systemData[tabId] || {};
        }
    }));

    // Marcar como registrado
    window.Alpine._aguaSystemRegistered = true;
    console.log('Componente aguaSystem registrado correctamente');
}

// Verificar si estamos en la página correcta antes de registrar
function shouldRegisterComponent() {
    // Verificar si es la página de agua por URL o por presencia de elementos
    const isWaterPage = window.location.pathname.includes('agua') || 
                       document.querySelector('[x-data="aguaSystem"]') !== null;
    
    return isWaterPage;
}

// Registrar el componente cuando Alpine esté listo
if (shouldRegisterComponent()) {
    // Si Alpine ya está disponible, registrar inmediatamente
    if (typeof window.Alpine !== 'undefined') {
        registerAguaSystemComponent();
    } else {
        // Si no está disponible, esperar a que se cargue
        document.addEventListener('alpine:init', () => {
            registerAguaSystemComponent();
        });
        
        // Fallback: esperar un poco más si es necesario
        setTimeout(() => {
            if (typeof window.Alpine !== 'undefined' && !window.Alpine._aguaSystemRegistered) {
                registerAguaSystemComponent();
            }
        }, 100);
    }
}

console.log('mainAgua.js cargado - Esperando Alpine.js...');