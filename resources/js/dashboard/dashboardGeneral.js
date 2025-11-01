// dashboardGeneral.js - Vue 3 + Sistema Optimizado de Asistencias
import { createApp } from 'vue';
console.log('🚀 Cargando módulo dashboardGeneral.js...');
// ============================================
// GESTIÓN DE SESIÓN Y AUTENTICACIÓN
// ============================================

class SessionManager {
    constructor() {
        this.sessionCheckInterval = null;
        this.lastActivity = Date.now();
        this.warningShown = false;
        this.isCheckingSession = false;

        // CRÍTICO: NO definir timeouts en frontend
        // El servidor Laravel es la única fuente de verdad
    }

    init() {
        this.trackActivity();
        this.startSessionCheck();
        this.setupVisibilityListener();
        this.setupBeforeUnload();
    }

    trackActivity() {
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
        events.forEach(event => {
            document.addEventListener(event, () => {
                this.lastActivity = Date.now();
                this.warningShown = false;

                // NUEVO: Notificar actividad al servidor
                this.pingServer();
            }, { passive: true });
        });
    }

    startSessionCheck() {
        // Verificar con el servidor cada 2 minutos
        this.sessionCheckInterval = setInterval(() => {
            this.checkSession();
        }, 2 * 60 * 1000); // 2 minutos

        // Verificación inicial
        this.checkSession();
    }

    async pingServer() {
        // Throttle: solo hacer ping cada 30 segundos como máximo
        const now = Date.now();
        if (this.lastPing && (now - this.lastPing) < 30000) {
            return;
        }

        this.lastPing = now;

        try {
            // Endpoint para mantener la sesión viva
            await fetch('/ping-session', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content
                }
            });
        } catch (error) {
            // Silencioso - no interrumpir la experiencia del usuario
            console.debug('Ping session:', error);
        }
    }

    async checkSession() {
        // Evitar verificaciones simultáneas
        if (this.isCheckingSession) return;

        this.isCheckingSession = true;

        try {
            const response = await fetch('/check-session', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content
                }
            });

            const data = await response.json();

            // El servidor responde con el estado de la sesión
            if (response.status === 401 || !data.authenticated) {
                this.handleSessionExpired();
                return;
            }

            // Verificar si el servidor envía advertencia
            if (data.warning && !this.warningShown) {
                const minutesRemaining = data.minutes_remaining || 15;
                this.showSessionWarning(minutesRemaining);
                this.warningShown = true;
            }

            // Si todo está bien, resetear flag de advertencia
            if (!data.warning) {
                this.warningShown = false;
            }

        } catch (error) {
            console.error('Error verificando sesión:', error);
            // NO cerrar sesión por error de red
            // Solo el servidor decide cuándo cerrar
        } finally {
            this.isCheckingSession = false;
        }
    }

    setupVisibilityListener() {
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                // Al volver a la pestaña, verificar sesión inmediatamente
                this.checkSession();
            }
        });
    }

    setupBeforeUnload() {
        // Limpiar antes de cerrar la ventana
        window.addEventListener('beforeunload', () => {
            this.destroy();
        });
    }

    showSessionWarning(minutes) {
        Swal.fire({
            icon: 'warning',
            title: 'Sesión por expirar',
            html: `Tu sesión expirará en <b>${minutes}</b> minuto${minutes > 1 ? 's' : ''}.<br>
                   Haz clic en el botón para mantenerla activa.`,
            showConfirmButton: true,
            confirmButtonText: 'Mantener sesión activa',
            confirmButtonColor: '#0891b2',
            timer: 60000, // 1 minuto para responder
            timerProgressBar: true,
            allowOutsideClick: false
        }).then((result) => {
            if (result.isConfirmed || result.isDismissed) {
                // Hacer ping al servidor para renovar sesión
                this.pingServer();
                this.lastActivity = Date.now();
                this.warningShown = false;
            }
        });
    }

    handleSessionExpired() {
        clearInterval(this.sessionCheckInterval);

        Swal.fire({
            icon: 'error',
            title: 'Sesión expirada',
            text: 'Tu sesión ha expirado. Serás redirigido al login.',
            showConfirmButton: true,
            confirmButtonText: 'Ir al login',
            confirmButtonColor: '#ef4444',
            allowOutsideClick: false,
            allowEscapeKey: false
        }).then(() => {
            fetch('/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                }
            }).then(() => {
                // Redirigir al login luego del logout
                window.location.href = '/login';
            }).catch((error) => {
                console.error('Error al cerrar sesión:', error);
                window.location.href = '/login'; // Forzar redirección igual
            });
        });
    }

    destroy() {
        if (this.sessionCheckInterval) {
            clearInterval(this.sessionCheckInterval);
        }
    }
}

// ============================================
// SISTEMA DE COLA CON IDENTIFICACIÓN ÚNICA
// ============================================

class AttendanceQueue {
    constructor(apiService) {
        this.apiService = apiService;
        this.processing = false;
        this.maxRetries = 3;
        this.retryDelay = 1000;
        this.requestId = this.generateUniqueId();
    }

    generateUniqueId() {
        // ID único por sesión de usuario + timestamp + random
        const sessionId = sessionStorage.getItem('session_id') || this.createSessionId();
        return `${sessionId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    createSessionId() {
        const id = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('session_id', id);
        return id;
    }

    async process(attendanceData) {
        if (this.processing) {
            throw new Error('Ya hay una asistencia en proceso. Por favor espera.');
        }

        this.processing = true;
        let retries = 0;

        while (retries < this.maxRetries) {
            try {
                const result = await this.processWithTimeout(attendanceData, 15000);
                this.processing = false;
                return result;
            } catch (error) {
                retries++;
                console.error(`Intento ${retries} fallido:`, error);

                if (retries >= this.maxRetries) {
                    this.processing = false;
                    throw new Error('No se pudo completar el registro después de varios intentos.');
                }

                // Esperar antes de reintentar con backoff exponencial
                await this.sleep(this.retryDelay * retries);
            }
        }
    }

    async processWithTimeout(data, timeout) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            // Agregar ID único a la petición
            data.append('request_id', this.generateUniqueId());
            data.append('timestamp', Date.now().toString());

            const response = await fetch('/calendarios/registrar-asistencia', {
                method: 'POST',
                body: data,
                signal: controller.signal,
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': this.apiService.csrfToken
                }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                console.log('✅ Datos de última asistencia recibidos:', response.json());
       
                if (response.status === 401) {
                    throw new Error('SESSION_EXPIRED');
                }
                throw new Error(`Error HTTP: ${response.status}`);
            }

            return await response.json();

        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Tiempo de espera agotado');
            }
            throw error;
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// ============================================
// SERVICIOS OPTIMIZADOS
// ============================================

class ApiService {
    constructor() {
        this.csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        this.cache = new Map();
        this.cacheTTL = 5 * 60 * 1000; // 5 minutos
    }

    async get(url, useCache = true) {
        // Verificar cache
        if (useCache && this.cache.has(url)) {
            const cached = this.cache.get(url);
            if (Date.now() - cached.timestamp < this.cacheTTL) {
                return cached.data;
            }
            this.cache.delete(url);
        }

        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'X-CSRF-TOKEN': this.csrfToken
            }
        });

        if (response.status === 401) {
            throw new Error('SESSION_EXPIRED');
        }

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();

        // Guardar en cache
        if (useCache) {
            this.cache.set(url, { data, timestamp: Date.now() });
        }

        return data;
    }

    async post(url, data) {
        const response = await fetch(url, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': this.csrfToken
            },
            body: JSON.stringify(data)
        });

        if (response.status === 401) {
            throw new Error('SESSION_EXPIRED');
        }

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        return response.json();
    }

    clearCache() {
        this.cache.clear();
    }
}

class TimeService {
    static async getPeruTime() {
        try {
            const response = await Promise.race([
                fetch('https://timeapi.io/api/time/current/zone?timeZone=America%2FLima'),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
            ]);

            if (!response.ok) throw new Error('API Error');
            const data = await response.json();
            return new Date(data.dateTime);
        } catch (error) {
            console.warn('Usando hora local ajustada:', error);
            return this.getLocalPeruTime();
        }
    }

    static getLocalPeruTime() {
        const now = new Date();
        const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
        return new Date(utcTime + (-5 * 3600000)); // UTC-5
    }

    static calculateAttendanceType(dateTime) {
        const hour = dateTime.getHours();
        const minute = dateTime.getMinutes();
        const totalMinutes = hour * 60 + minute;

        // Mañana: 7:30-8:30 Puntual, 8:31-12:59 Tarde
        if (totalMinutes >= 450 && totalMinutes <= 510) return 'Puntual'; // 7:30-8:30
        if (totalMinutes > 510 && totalMinutes < 780) return 'Tarde'; // 8:31-12:59

        // Tarde: 14:30-15:10 Puntual, 15:11-20:00 Tarde
        if (totalMinutes >= 870 && totalMinutes <= 910) return 'Puntual'; // 14:30-15:10
        if (totalMinutes > 910 && totalMinutes <= 1200) return 'Tarde'; // 15:11-20:00

        return 'Fuera de horario';
    }

    static getAttendanceMessage(type) {
        const messages = {
            'Puntual': '¡Excelente! Llegaste a tiempo. 🎉',
            'Tarde': 'Recuerda la importancia de la puntualidad. ⏰',
            'Fuera de horario': 'Registro fuera del horario laboral. ⚠️'
        };
        return messages[type] || messages['Fuera de horario'];
    }
}

class LocationService {
    static async getCurrentPosition() {
        if (!navigator.geolocation) {
            throw new Error('Geolocalización no disponible');
        }

        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error('Tiempo de espera agotado para ubicación'));
            }, 10000);

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    clearTimeout(timeoutId);
                    resolve(position);
                },
                (error) => {
                    clearTimeout(timeoutId);
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 8000,
                    maximumAge: 5000
                }
            );
        });
    }

    static async getAddress(latitude, longitude) {
        try {
            const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
            const response = await Promise.race([
                fetch(url),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
            ]);

            if (!response.ok) throw new Error('Error');

            const data = await response.json();
            const addr = data.address || {};
            const parts = [addr.house_number, addr.road, addr.residential || addr.city || addr.town].filter(Boolean);

            return parts.length > 0 ? parts.join(', ') : `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
        } catch {
            return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
        }
    }
}

class DeviceService {
    static detect() {
        if (window.FORCE_MOBILE_MODE === true) return 'mobile';

        const ua = navigator.userAgent.toLowerCase();
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const isSmall = window.innerWidth <= 768;

        if (isSmall || isTouch) return 'mobile';
        if (/iphone|ipod|android|mobile/i.test(ua)) return 'mobile';
        if (/ipad|tablet/i.test(ua)) return 'tablet';
        return 'desktop';
    }

    static isMobileDevice() {
        const type = this.detect();
        return type === 'mobile' || type === 'tablet';
    }
}

// ============================================
// QR SCANNER OPTIMIZADO
// ============================================

class QRScannerService {
    constructor() {
        this.scanner = null;
        this.isScanning = false;
        this.lastScan = 0;
        this.scanCooldown = 2000; // 2 segundos entre escaneos
    }

    async start(elementId, onSuccess, onError) {
        if (this.isScanning) return;

        try {
            const cameras = await Html5Qrcode.getCameras();
            const backCamera = this.findBackCamera(cameras);

            if (!backCamera) throw new Error('Cámara no disponible');

            this.scanner = new Html5Qrcode(elementId);

            // Configuración flexible: intenta primero con cámara trasera, luego cualquier cámara
            const configOptions = [
                // Opción 1: Cámara trasera ideal (no exact)
                {
                    fps: 30,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                    videoConstraints: {
                        facingMode: { ideal: "environment" }, // CAMBIO: ideal en vez de exact
                        width: { ideal: 1920 },
                        height: { ideal: 1080 }
                    }
                },
                // Opción 2: Sin restricciones específicas (fallback)
                {
                    fps: 30,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0
                }
            ];

            let scannerStarted = false;
            let lastError = null;

            // Intentar con diferentes configuraciones
            for (const config of configOptions) {
                try {
                    await this.scanner.start(
                        backCamera.id,
                        config,
                        (text) => this.handleScan(text, onSuccess),
                        (err) => this.handleError(err, onError)
                    );
                    scannerStarted = true;
                    break; // Si funciona, salir del loop
                } catch (err) {
                    lastError = err;
                    console.warn('Intento de configuración falló, probando siguiente...', err);
                }
            }

            if (!scannerStarted) {
                throw lastError || new Error('No se pudo iniciar la cámara');
            }

            this.isScanning = true;
            setTimeout(() => this.optimizeUI(), 300);
        } catch (error) {
            console.error('Error iniciando scanner:', error);
            throw error;
        }
    }

    handleScan(text, callback) {
        const now = Date.now();
        if (now - this.lastScan < this.scanCooldown) {
            return; // Ignorar escaneos múltiples
        }

        this.lastScan = now;
        callback(text);
    }

    handleError(error, callback) {
        if (error && !error.includes('No QR') && !error.includes('NotFoundException')) {
            callback(error);
        }
    }

    findBackCamera(cameras) {
        if (!cameras?.length) return null;

        const patterns = ['back', 'trasera', 'rear', 'environment', 'posterior'];
        for (const pattern of patterns) {
            const cam = cameras.find(c => c.label.toLowerCase().includes(pattern));
            if (cam) return cam;
        }

        return cameras.length > 1 ? cameras[cameras.length - 1] : cameras[0];
    }

    async stop() {
        if (this.scanner && this.isScanning) {
            try {
                await this.scanner.stop();
                this.scanner.clear();
                this.scanner = null;
                this.isScanning = false;
            } catch (error) {
                console.error('Error deteniendo scanner:', error);
            }
        }
    }

    optimizeUI() {
        // Ocultar controles innecesarios
        const elements = ['#qr-reader__dashboard_section_swaplink', '#qr-reader__filescan_input', '#qr-reader__header_message'];
        elements.forEach(sel => {
            const el = document.querySelector(sel);
            if (el) el.remove();
        });

        const video = document.querySelector('#qr-reader video');
        if (video) {
            video.style.borderRadius = '0.5rem';
            video.style.maxWidth = '100%';
        }
    }
}

// ============================================
// COMPONENTE VUE OPTIMIZADO
// ============================================

const DashboardApp = {
    data() {
        return {
            user: { id: null, name: '', empresaId: null },
            stats: { asistencias: 0, tardanzas: [], tareas: 0, progreso: 0 },
            tareas: [],
            isProcessing: false,
            isMobile: false,
            modals: { asistencia: false, tareas: false },
            qrScanner: null,
            attendanceQueue: null,
            apiService: null,
            sessionManager: null
        };
    },

    mounted() {
        this.initializeApp();
    },

    beforeUnmount() {
        this.cleanup();
    },

    methods: {
        async initializeApp() {
            console.log('🚀 Iniciando aplicación optimizada...');

            // Inicializar servicios
            this.apiService = new ApiService();
            this.sessionManager = new SessionManager();
            this.attendanceQueue = new AttendanceQueue(this.apiService);

            // Iniciar gestión de sesión
            this.sessionManager.init();

            this.loadUserData();
            this.detectDevice();

            await this.$nextTick();

            if (this.isMobile) {
                console.log('📱 Modo automático móvil');
                await this.iniciarProcesoAutomatico();
            } else {
                console.log('💻 Modo desktop');
                this.setupEventListeners();
                await this.loadDashboardData();
            }

            console.log('✅ Aplicación lista');
        },

        detectDevice() {
            this.isMobile = DeviceService.isMobileDevice();
            console.log('Dispositivo:', this.isMobile ? '📱 Móvil' : '💻 Desktop');
        },

        async iniciarProcesoAutomatico() {
            try {
                this.mostrarPantallaCarga('Iniciando sistema...');

                // Verificar permisos en paralelo
                const [tasksOk, locationOk, cameraOk] = await Promise.allSettled([
                    this.verificarTareas(),
                    this.verificarUbicacion(),
                    this.verificarCamara()
                ]);

                if (tasksOk.status === 'rejected') throw tasksOk.reason;
                if (locationOk.status === 'rejected') throw locationOk.reason;
                if (cameraOk.status === 'rejected') throw cameraOk.reason;

                await this.abrirModalAsistenciaAuto();
                this.ocultarPantallaCarga();
            } catch (error) {
                console.error('Error en inicio automático:', error);
                this.ocultarPantallaCarga();

                if (error.message === 'SESSION_EXPIRED') {
                    this.sessionManager.handleSessionExpired();
                    return;
                }

                this.showError('Error de inicio', error.message);
                await this.loadDashboardData();
            }
        },

        async verificarTareas() {
            this.updateProgress('tasks', 0, '⏳ Cargando...');

            try {
                this.tareas = await this.apiService.get(`/actividades/listar/${this.user.id}`);

                if (!this.tareas?.length) {
                    throw new Error('Sin tareas asignadas. Contacta a tu supervisor.');
                }

                this.updateProgress('tasks', 100, '✅ Listas');
            } catch (error) {
                this.updateProgress('tasks', 0, '❌ Error');
                throw error;
            }
        },

        async verificarUbicacion() {
            this.updateProgress('location', 0, '⏳ Solicitando...');

            try {
                await LocationService.getCurrentPosition();
                this.updateProgress('location', 100, '✅ Activa');
            } catch (error) {
                this.updateProgress('location', 0, '❌ Denegada');
                throw new Error('Activa la ubicación para continuar');
            }
        },

        async verificarCamara() {
            this.updateProgress('camera', 50, '⏳ Verificando...');

            try {
                const cameras = await Html5Qrcode.getCameras();
                if (!cameras?.length) throw new Error('Sin cámaras');

                this.updateProgress('camera', 100, '✅ Lista');
            } catch (error) {
                this.updateProgress('camera', 0, '❌ No disponible');
                throw new Error('Se requiere acceso a la cámara');
            }
        },

        updateProgress(tipo, pct, estado) {
            const bar = document.getElementById(`${tipo}-progress`);
            const status = document.getElementById(`${tipo}-status`);

            if (bar) bar.style.width = `${pct}%`;
            if (status) status.textContent = estado;
        },

        mostrarPantallaCarga(msg) {
            const screen = document.getElementById('mobile-loading-screen');
            if (screen) screen.classList.remove('hidden');

            const status = document.getElementById('loading-status');
            if (status) status.textContent = msg;
        },

        ocultarPantallaCarga() {
            setTimeout(() => {
                document.getElementById('mobile-loading-screen')?.classList.add('hidden');
            }, 500);
        },

        async abrirModalAsistenciaAuto() {
            this.modals.asistencia = true;
            document.getElementById('modal-asistencia')?.classList.remove('hidden');

            await this.$nextTick();
            setTimeout(() => this.iniciarScanner(), 300);
        },

        loadUserData() {
            this.user.id = document.getElementById('trabajador_id')?.value;
            this.user.name = document.getElementById('nombre_trab')?.value;
            this.user.empresaId = document.getElementById('empresa_id')?.value;
        },

        setupEventListeners() {
            const handlers = {
                'btn-marcar-asistencia': () => this.iniciarAsistencia(),
                'btn-cerrar-modal': () => this.cerrarModalAsistencia(),
                'btn-cancelar-escaneo': () => this.cerrarModalAsistencia(),
                'btn-cerrar-tareas': () => this.cerrarModalTareas()
            };

            Object.entries(handlers).forEach(([id, handler]) => {
                document.getElementById(id)?.addEventListener('click', handler);
            });
        },

        async loadDashboardData() {
            try {
                const [stats, tasks, attendance] = await Promise.allSettled([
                    this.apiService.get(`/dashboard/stats/${this.user.id}`),
                    this.apiService.get(`/actividades/listar/${this.user.id}`),
                    this.apiService.get(`/asistencias/ultima/${this.user.id}`)
                ]);

                // 🔍 Log detallado: resultados de todas las promesas
                console.log('🔍 Resultado de Promise.allSettled:', {
                    stats,
                    tasks,
                    attendance
                });

                if (stats.status === 'fulfilled') {
                    //console.log('✅ Datos de stats recibidos:', stats.value);
                    this.stats = { ...this.stats, ...stats.value };
                    this.updateStatsUI();
                } else {
                    console.error('❌ Error en stats:', stats.reason);
                }

                if (tasks.status === 'fulfilled') {
                    //console.log('✅ Datos de tareas recibidos:', tasks.value);
                    this.tareas = Array.isArray(tasks.value) ? tasks.value : [];
                    this.renderRecentTasks();
                } else {
                    console.error('❌ Error en tareas:', tasks.reason);
                }

                if (attendance.status === 'fulfilled') {
                    //console.log('✅ Datos de última asistencia recibidos:', attendance.value);
                    this.renderLastAttendance(attendance.value);
                } else {
                    console.error('❌ Error en asistencia:', attendance.reason);
                }

            } catch (error) {
                console.error('🚨 Error inesperado en loadDashboardData:', error);
                if (error.message === 'SESSION_EXPIRED') {
                    this.sessionManager.handleSessionExpired();
                } else {
                    console.error('Error cargando dashboard:', error);
                }
            }
        },

        updateStatsUI() {
            const updates = {
                'stat-asistencias': this.stats.total_asistencias,
                'stat-puntualidad': this.stats.total_Puntual,
                'stat-tardanzas': this.stats.total_tardanza,
                'stat-tareas': this.stats.total_tareas,
                'stat-progreso': `${this.stats.porcentaje_avance_mes}%`
            };

            Object.entries(updates).forEach(([id, value]) => {
                const el = document.getElementById(id);
                if (el) el.textContent = value;
            });
        },

        renderRecentTasks() {
            const container = document.getElementById('tareas-recientes');
            if (!container) return;

            if (!this.tareas.length) {
                container.innerHTML = '<p class="text-center text-gray-500 dark:text-gray-400 py-4">Sin tareas</p>';
                return;
            }

            container.innerHTML = this.tareas.slice(0, 5).map(t => `
                <div class="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
                    <div class="flex-1">
                        <p class="text-sm font-medium text-gray-900 dark:text-white">${t.nameActividad}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${t.status || 'Pendiente'}</p>
                    </div>
                    <span class="px-2 py-1 text-xs rounded-full ${this.getStatusColor(t.status, 'task')}">
                        ${t.status || 'Todo'}
                    </span>
                </div>
            `).join('');
        },

        renderLastAttendance(att) {
            const container = document.getElementById('ultima-asistencia');
            if (!container) return;

            if (!att) {
                container.innerHTML = '<p class="text-center text-gray-500 dark:text-gray-400 py-4">Sin registros</p>';
                return;
            }

            container.innerHTML = `
                <div class="space-y-3">
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-gray-600 dark:text-gray-400">Fecha:</span>
                        <span class="text-sm font-medium text-gray-900 dark:text-white">${att.fecha_registro}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-gray-600 dark:text-gray-400">Hora:</span>
                        <span class="text-sm font-medium text-gray-900 dark:text-white">${att.hora_ingreso}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-gray-600 dark:text-gray-400">Estado:</span>
                        <span class="px-3 py-1 text-xs rounded-full text-gray-900 dark:text-white ${this.getStatusColor(att.tipo_horario, 'attendance')}">
                            ${att.tipo_horario}
                        </span>
                    </div>
                </div>
            `;
        },

        getStatusColor(status, type) {
            const colors = {
                task: {
                    'Todo': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
                    'Doing': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
                    'Done': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                },
                attendance: {
                    'Puntual': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
                    'Tarde': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
                    'Fuera de horario': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                }
            };

            return colors[type]?.[status] || colors[type]?.['Todo'] || '';
        },

        async iniciarAsistencia() {
            if (this.isProcessing) {
                this.showWarning('Proceso en curso');
                return;
            }

            if (!this.tareas.length) {
                await this.loadRecentTasks();
                if (!this.tareas.length) {
                    this.showInfo('Sin tareas', 'Solicita tareas a tu supervisor.');
                    return;
                }
            }

            if (!DeviceService.isMobileDevice()) {
                this.showInfo('Dispositivo no compatible', 'Usa un dispositivo móvil.');
                return;
            }

            try {
                await this.verificarUbicacion();
                this.abrirModalAsistencia();
            } catch (error) {
                this.showError('Permisos requeridos', error.message);
            }
        },

        abrirModalAsistencia() {
            this.modals.asistencia = true;
            document.getElementById('modal-asistencia')?.classList.remove('hidden');
            setTimeout(() => this.iniciarScanner(), 300);
        },

        cerrarModalAsistencia() {
            this.modals.asistencia = false;
            document.getElementById('modal-asistencia')?.classList.add('hidden');

            if (this.qrScanner) {
                this.qrScanner.stop();
                this.qrScanner = null;
            }
        },

        async iniciarScanner() {
            try {
                this.qrScanner = new QRScannerService();
                await this.qrScanner.start(
                    'qr-reader',
                    (text) => this.onQRSuccess(text),
                    (err) => this.onQRError(err)
                );

                this.updateQRStatus('Escaneando... Posiciona el QR', 'info');
            } catch (error) {
                console.error('Error iniciando scanner:', error);
                this.showError('Error', 'No se pudo iniciar la cámara.');
            }
        },

        async onQRSuccess(qrCode) {
            if (this.isProcessing) return;

            this.isProcessing = true;
            this.updateQRStatus('✓ QR detectado, procesando...', 'success');

            try {
                await this.qrScanner?.stop();
                await this.procesarAsistencia(qrCode);
            } catch (error) {
                console.error('Error procesando QR:', error);
                this.isProcessing = false;

                if (error.message === 'SESSION_EXPIRED') {
                    this.sessionManager.handleSessionExpired();
                    return;
                }

                this.showError('Error', error.message || 'No se pudo procesar el QR');

                if (this.modals.asistencia) {
                    setTimeout(() => this.iniciarScanner(), 2000);
                }
            }
        },

        async procesarAsistencia(qrCode) {
            try {
                // Obtener datos en paralelo
                const [fechaHora, position] = await Promise.all([
                    TimeService.getPeruTime(),
                    LocationService.getCurrentPosition()
                ]);

                const tipoAsistencia = TimeService.calculateAttendanceType(fechaHora);
                const ubicacion = await LocationService.getAddress(
                    position.coords.latitude,
                    position.coords.longitude
                );

                // Preparar FormData
                const formData = new FormData();
                formData.append('nombre_trabajador', this.user.name);
                formData.append('tipo_horario', tipoAsistencia);
                formData.append('fecha', fechaHora.toISOString().split('T')[0]);
                formData.append('horaLima', fechaHora.toLocaleTimeString('es-PE', { hour12: false }));
                formData.append('ubicacion', ubicacion);
                formData.append('id_trabajador', this.user.id);
                formData.append('id_empresa', this.user.empresaId);
                formData.append('qr_code', qrCode);

                // Procesar con sistema de cola
                const response = await this.attendanceQueue.process(formData);

                if (response.success) {
                    this.cerrarModalAsistencia();

                    const mensaje = TimeService.getAttendanceMessage(tipoAsistencia);
                    await this.showSuccess(tipoAsistencia, mensaje);

                    this.abrirModalTareas();

                    // Limpiar cache y recargar datos
                    this.apiService.clearCache();
                    await this.loadDashboardData();

                    this.isProcessing = false;
                } else {
                    throw new Error(response.error || 'Error al registrar asistencia');
                }
            } catch (error) {
                this.isProcessing = false;
                throw error;
            }
        },

        onQRError(error) {
            // Ignorar errores comunes de "no QR found"
            if (error && !error.includes('No QR') && !error.includes('NotFoundException')) {
                console.error('QR Error:', error);
            }
        },

        updateQRStatus(message, type = 'info') {
            const statusEl = document.getElementById('qr-status');
            if (!statusEl) return;

            const styles = {
                info: {
                    bg: 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900 dark:to-cyan-900 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200',
                    icon: '<div class="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>'
                },
                success: {
                    bg: 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 border-green-200 dark:border-green-700 text-green-800 dark:text-green-200',
                    icon: '<svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>'
                },
                error: {
                    bg: 'bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900 dark:to-pink-900 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200',
                    icon: '<svg class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>'
                }
            };

            const style = styles[type] || styles.info;
            statusEl.className = `mb-4 p-4 rounded-lg border-2 ${style.bg}`;
            statusEl.innerHTML = `
                <div class="flex items-center justify-center gap-3">
                    ${style.icon}
                    <p class="text-sm font-medium">${message}</p>
                </div>
            `;
        },

        // ============================================
        // MODAL DE TAREAS
        // ============================================

        abrirModalTareas() {
            this.modals.tareas = true;
            document.getElementById('modal-tareas')?.classList.remove('hidden');
            this.renderModalTareas();
        },

        cerrarModalTareas() {
            this.modals.tareas = false;
            document.getElementById('modal-tareas')?.classList.add('hidden');
        },

        renderModalTareas() {
            const container = document.getElementById('lista-tareas');
            const contador = document.getElementById('contador-tareas');

            if (!container) return;

            if (!this.tareas.length) {
                container.innerHTML = '<p class="col-span-2 text-center text-gray-500 dark:text-gray-400 py-8">Sin tareas</p>';
                if (contador) contador.textContent = 'Total: 0 tareas';
                return;
            }

            container.innerHTML = this.tareas.map(t => `
                <button 
                    data-tarea-id="${t.actividadId}"
                    class="tarea-btn p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-cyan-500 dark:hover:border-cyan-400 transition-all transform hover:scale-105 text-left group bg-white dark:bg-gray-800"
                >
                    <div class="flex items-start justify-between">
                        <div class="flex-1">
                            <h4 class="font-semibold text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                                ${t.nameActividad}
                            </h4>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                ${t.descripcion || 'Sin descripción'}
                            </p>
                        </div>
                        <svg class="w-5 h-5 text-gray-400 group-hover:text-cyan-500 transition-colors flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                    </div>
                </button>
            `).join('');

            if (contador) {
                contador.textContent = `Total: ${this.tareas.length} tarea${this.tareas.length !== 1 ? 's' : ''}`;
            }

            // Eventos
            container.querySelectorAll('.tarea-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const tareaId = e.currentTarget.dataset.tareaId;
                    this.seleccionarTarea(tareaId);
                });
            });
        },

        async seleccionarTarea(tareaId) {
            if (this.isProcessing) return;

            this.isProcessing = true;
            this.showLoading('Actualizando tarea...');

            try {
                const response = await this.apiService.post(
                    `/actividades/actualizar-status/${tareaId}/doing`,
                    {}
                );

                if (response.success) {
                    await this.showSuccess('Tarea iniciada', 'Has comenzado a trabajar en esta tarea. ¡Éxito!');
                    this.cerrarModalTareas();

                    // Limpiar cache y recargar
                    this.apiService.clearCache();
                    await this.loadDashboardData();
                } else {
                    throw new Error(response.error || 'Error al actualizar tarea');
                }
            } catch (error) {
                console.error('Error seleccionando tarea:', error);

                if (error.message === 'SESSION_EXPIRED') {
                    this.sessionManager.handleSessionExpired();
                } else {
                    this.showError('Error', 'No se pudo actualizar la tarea');
                }
            } finally {
                this.isProcessing = false;
            }
        },

        // ============================================
        // ALERTAS
        // ============================================

        showLoading(message) {
            Swal.fire({
                title: 'Procesando...',
                text: message,
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                didOpen: () => Swal.showLoading()
            });
        },

        showSuccess(title, message) {
            return Swal.fire({
                icon: 'success',
                title: title,
                text: message,
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#0891b2',
                timer: 3000,
                timerProgressBar: true
            });
        },

        showError(title, message) {
            return Swal.fire({
                icon: 'error',
                title: title,
                text: message,
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#ef4444'
            });
        },

        showWarning(message) {
            return Swal.fire({
                icon: 'warning',
                title: 'Atención',
                text: message,
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#f59e0b'
            });
        },

        showInfo(title, message) {
            return Swal.fire({
                icon: 'info',
                title: title,
                text: message,
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#3b82f6'
            });
        },

        // ============================================
        // LIMPIEZA
        // ============================================

        cleanup() {
            if (this.qrScanner) {
                this.qrScanner.stop();
            }

            if (this.sessionManager) {
                this.sessionManager.destroy();
            }

            if (this.apiService) {
                this.apiService.clearCache();
            }
        }
    }
};

// ============================================
// INICIALIZACIÓN
// ============================================

// Montaje robusto: si el módulo se carga después de DOMContentLoaded,
// document.addEventListener no se disparará — montar inmediatamente si ya está listo.
const mountDashboardApp = () => {
    const app = createApp(DashboardApp);
    app.mount('#dashboard-app');
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountDashboardApp);
} else {
    // DOM ya listo -> montar inmediatamente
    mountDashboardApp();
}

// Exportar para uso global
export {
    DashboardApp,
    ApiService,
    TimeService,
    LocationService,
    QRScannerService,
    AttendanceQueue,
    SessionManager
};