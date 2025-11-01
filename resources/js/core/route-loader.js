/**
 * 🧠 ROUTE-LOADER v2.1 (Optimizado para Laravel + Vite)
 * -----------------------------------------------------
 * Carga dinámica de módulos JS, JSX y VUE basados en data-module.
 * Cada vista Blade define qué módulo cargar sin sobrecargar app.js.
 * 
 * ✅ Ventajas:
 * - Lazy loading por vista (reduce el tamaño inicial del bundle)
 * - Soporta React, Vue y JS puro
 * - Compatible con build de Vite
 * - Logs claros y útiles para depuración
 * - Cachea módulos ya cargados (útil en Livewire o SPA parcial)
 */

console.info("✅ route-loader inicializado");

const container = document.querySelector("[data-module]");

if (!container) {
    console.warn("⚠️ No se encontró ningún elemento con [data-module].");
} else {
    const moduleName = container.dataset.module;
    console.info(`🔍 Intentando cargar módulo dinámico: ${moduleName}`);

    // Cache local para evitar recargar módulos ya importados
    const moduleCache = new Map();

    const importModule = async () => {
        try {
            // Escanea todos los archivos dentro de /resources/js/
            const modules = import.meta.glob("../**/*.{js,jsx,vue}");

            // Buscar coincidencia flexible del módulo solicitado
            const matchKey = Object.keys(modules).find((key) =>
                key.includes(`${moduleName}.js`) ||
                key.includes(`${moduleName}.jsx`) ||
                key.includes(`${moduleName}.vue`) ||
                key.includes(moduleName) // Permite coincidencia parcial
            );

            if (matchKey) {
                // Evitar doble carga del mismo módulo
                if (moduleCache.has(matchKey)) {
                    console.log(`⚡ Módulo ya cargado: ${matchKey}`);
                    return;
                }

                // Importación asíncrona
                await modules[matchKey]();
                moduleCache.set(matchKey, true);
                console.log(`✅ Módulo cargado correctamente: ${matchKey}`);
            } else {
                console.error(`❌ No se encontró módulo: ${moduleName}`);
                console.groupCollapsed("📋 Módulos disponibles:");
                console.table(Object.keys(modules));
                console.groupEnd();
            }
        } catch (err) {
            console.error(`💥 Error cargando módulo "${moduleName}"`, err);
        }
    };

    importModule();
}
