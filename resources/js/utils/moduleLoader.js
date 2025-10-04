// resources/js/utils/moduleLoader.js
class ModuleLoader {
    constructor() {
        this.loadedModules = new Set();
        this.loading = new Map();
    }

    async loadModule(modulePath) {
        // Evitar cargar el mismo módulo múltiples veces
        if (this.loadedModules.has(modulePath)) {
            return;
        }

        // Si ya se está cargando, esperar a que termine
        if (this.loading.has(modulePath)) {
            return this.loading.get(modulePath);
        }

        // Cargar el módulo
        const loadPromise = import(modulePath)
            .then(() => {
                this.loadedModules.add(modulePath);
                this.loading.delete(modulePath);
            })
            .catch(error => {
                console.error(`Error loading module ${modulePath}:`, error);
                this.loading.delete(modulePath);
            });

        this.loading.set(modulePath, loadPromise);
        return loadPromise;
    }

    async loadModulesByRoute(path) {
        const modules = this.getModulesForRoute(path);

        // Cargar módulos en paralelo
        const promises = modules.map(module => this.loadModule(module));
        return Promise.all(promises);
    }

    getModulesForRoute(path) {
        const modules = [];

        // PROGRAMAS GESPRO (rutas absolutas desde resources/js)
        if (path.includes('/portada-programas-gespro')) {
            modules.push('../programasgespro/cotizador.js');
        }
        if (path.includes('/calculo-agua')) {
            modules.push('../programasgespro/mainAgua.js');
        }
        if (path.includes('/calculo-desague')) {
            modules.push('../programasgespro/mainDesague.js');
        }
        if (path.includes('/calculo-aire-acondicionado')) {
            modules.push('../programasgespro/aireacondicionado.js');
        }
        if (path.includes('/calculo-caida-tension')) {
            modules.push('../programasgespro/mainCaidaTension.js');
        }
        if (path.includes('/calculo-pozo-pararrayo')) {
            modules.push('../programasgespro/pozopararrayo.js');
        }

        // METRADOS
        if (path.includes('/metrados')) {
            modules.push('./metrados/gestion_metrados_sanitarias.js');
        }

        return modules;
    }
}

export default ModuleLoader;