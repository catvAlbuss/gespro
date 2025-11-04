// mainAgua.js — Versión Vue 3 (reemplaza Alpine completamente)
import { createApp } from 'vue';

// Importamos los módulos (tu lógica existente)
import { initDemandaDiariaModule } from './componentsAgua/demandadiaria.js';
import { initCisternaModule } from './componentsAgua/cisterna.js';
import { initTanqueModule } from './componentsAgua/tanque.js';
import { initRedAlimentacionModule } from './componentsAgua/redalimentacion.js';
import { initMaximaDemandaModule } from './componentsAgua/maximademandasimultanea.js';
import { initBombeoTanqueModule } from './componentsAgua/bombeotanque.js';
import { initRedDistribucionModule } from './componentsAgua/tuberiard-grade.js';
import { initRedesInterioresModule } from './componentsAgua/redesinteriores-grades.js';
import { initRedriegosModule } from './componentsAgua/redriego.js';

// Importamos el componente principal
import { AguaSystem } from './AguaSystem.js';

// Creamos y montamos la app Vue
const app = createApp(AguaSystem);

// Pasamos los módulos al componente raíz (opcional)
app.provide('aguaModules', {
    initDemandaDiariaModule,
    initCisternaModule,
    initTanqueModule,
    initRedAlimentacionModule,
    initMaximaDemandaModule,
    initBombeoTanqueModule,
    initRedDistribucionModule,
    initRedesInterioresModule,
    initRedriegosModule,
});

app.mount('#agua-system-app');

console.log('✅ Sistema de Agua inicializado con Vue 3');
