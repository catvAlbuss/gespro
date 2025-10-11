// dashboardGeneral.js - Vue 3 + Sistema de Colas Optimizado
import { createApp } from 'vue';

// ============================================
// SISTEMA DE COLA DE ASISTENCIAS
// ============================================

class AttendanceQueue {
    constructor() {
        this.queue = [];
        this.processing = false;
        this.maxRetries = 3;
    }

    add(attendanceData) {
        const queueItem = {
            id: Date.now() + Math.random(),
            data: attendanceData,
            retries: 0,
            timestamp: Date.now()
        };

        this.queue.push(queueItem);
        this.updateQueueUI();

        if (!this.processing) {
            this.processNext();
        }

        return queueItem.id;
    }

    async processNext() {
        if (this.queue.length === 0) {
            this.processing = false;
            this.updateQueueUI();
            return;
        }

        this.processing = true;
        const item = this.queue[0];

        try {
            await this.processItem(item);
            this.queue.shift(); // Eliminar del queue si fue exitoso
            this.processNext(); // Procesar siguiente
        } catch (error) {
            console.error('Error procesando item de la cola:', error);

            item.retries++;
            if (item.retries >= this.maxRetries) {
                console.error('Máximo de reintentos alcanzado, eliminando de la cola');
                this.queue.shift();
            }

            // Reintentar después de un delay
            setTimeout(() => this.processNext(), 1000);
        }
    }

    async processItem(item) {
        // Este método será sobrescrito por la implementación real
        throw new Error('processItem debe ser implementado');
    }

    updateQueueUI() {
        const queueInfo = document.getElementById('queue-info');
        const queuePosition = document.getElementById('queue-position');

        if (!queueInfo || !queuePosition) return;

        if (this.queue.length > 0) {
            queueInfo.classList.remove('hidden');
            queuePosition.textContent = this.queue.length;
        } else {
            queueInfo.classList.add('hidden');
        }
    }

    clear() {
        this.queue = [];
        this.processing = false;
        this.updateQueueUI();
    }
}

// ============================================
// SERVICIOS Y UTILIDADES
// ============================================

class ApiService {
    constructor() {
        this.csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    }

    async get(url) {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-CSRF-TOKEN': this.csrfToken
            }
        });

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        return response.json();
    }

    async post(url, data) {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'X-CSRF-TOKEN': this.csrfToken
            },
            body: data instanceof FormData ? data : JSON.stringify(data)
        });

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        return response.json();
    }
}

class TimeService {
    static async getPeruTime() {
        try {
            const response = await fetch('https://timeapi.io/api/time/current/zone?timeZone=America%2FLima');
            if (!response.ok) throw new Error('Time API Error');

            const data = await response.json();
            return new Date(data.dateTime);
        } catch (error) {
            console.warn('Error obteniendo hora de Lima, usando hora local:', error);
            const now = new Date();
            const limaOffset = -5 * 60;
            const localOffset = now.getTimezoneOffset();
            return new Date(now.getTime() + (localOffset + limaOffset) * 60000);
        }
    }

    static calculateAttendanceType(dateTime) {
        const hour = dateTime.getHours();
        const minute = dateTime.getMinutes();

        // Horario Mañana: 7:30 - 8:30 Puntual, 8:31 - 12:59 Tarde
        if ((hour === 7 && minute >= 30) || (hour === 8 && minute <= 30)) {
            return 'Puntual';
        }
        if ((hour === 8 && minute >= 31) || (hour > 8 && hour < 13)) {
            return 'Tarde';
        }

        // Horario Tarde: 14:30 - 15:10 Puntual, 15:11 - 20:00 Tarde
        if ((hour === 14 && minute >= 30) || (hour === 15 && minute <= 10)) {
            return 'Puntual';
        }
        if ((hour === 15 && minute >= 11) || (hour > 15 && hour < 20) || (hour === 20 && minute === 0)) {
            return 'Tarde';
        }

        return 'Fuera de horario';
    }

    static getAttendanceMessage(type) {
        const messages = {
            'Puntual': '¡Excelente! Llegaste a tiempo. Sigue así. 🎉',
            'Tarde': 'Recuerda que la puntualidad es importante. ⏰',
            'Fuera de horario': 'Estás registrando fuera del horario laboral. ⚠️'
        };
        return messages[type] || messages['Fuera de horario'];
    }
}

class LocationService {
    static async getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocalización no disponible'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                resolve,
                reject,
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    }

    static async getAddress(latitude, longitude) {
        try {
            const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
            const response = await fetch(url);

            if (!response.ok) throw new Error('Error obteniendo dirección');

            const data = await response.json();
            const address = data.address || {};

            const parts = [
                address.house_number,
                address.road,
                address.residential || address.city || address.town || address.county
            ].filter(Boolean);

            return parts.join(', ') || `Lat: ${latitude.toFixed(5)}, Lon: ${longitude.toFixed(5)}`;
        } catch (error) {
            console.error('Error obteniendo dirección:', error);
            return `Lat: ${latitude.toFixed(5)}, Lon: ${longitude.toFixed(5)}`;
        }
    }
}

class DeviceService {
    static detect() {
        // Permitir forzar modo móvil desde window (para desarrollo)
        if (window.FORCE_MOBILE_MODE === true) {
            console.log('🔧 Modo móvil forzado activo');
            return 'mobile';
        }

        const userAgent = navigator.userAgent.toLowerCase();
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const isSmallScreen = window.innerWidth <= 768;

        // Forzar modo móvil si es pantalla pequeña o tiene touch
        if (isSmallScreen || isTouchDevice) {
            return 'mobile';
        }

        if (/iphone|ipod|android|blackberry|opera mini|iemobile|mobile/i.test(userAgent)) {
            return 'mobile';
        }
        if (/ipad|tablet|playbook|kindle/i.test(userAgent)) {
            return 'tablet';
        }
        return 'desktop';
    }

    static isMobileDevice() {
        const deviceType = this.detect();
        console.log('Tipo de dispositivo detectado:', deviceType); // Debug
        return deviceType === 'mobile' || deviceType === 'tablet';
    }
}

// ============================================
// QR SCANNER SERVICE
// ============================================
class QRScannerService {
    constructor() {
        this.scanner = null;
        this.isScanning = false;
        this.html5QrCode = null;
    }

    async start(elementId, onSuccess, onError) {
        if (this.isScanning) {
            console.warn('Scanner ya está activo');
            return;
        }

        try {
            // Primero seleccionar la cámara trasera
            const cameras = await Html5Qrcode.getCameras();
            const backCamera = this.findBackCamera(cameras);

            if (!backCamera) {
                throw new Error('No se encontró cámara trasera');
            }

            // Iniciar con la cámara trasera directamente
            this.html5QrCode = new Html5Qrcode(elementId);

            await this.html5QrCode.start(
                backCamera.id,
                {
                    fps: 30, // Aumentado para mejor rendimiento
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                    disableFlip: false,
                    videoConstraints: {
                        facingMode: { exact: "environment" },
                        advanced: [
                            { zoom: 1.5 } // Zoom para mejor lectura
                        ]
                    }
                },
                onSuccess,
                onError
            );

            this.isScanning = true;
            console.log('Scanner iniciado con cámara trasera:', backCamera.label);

            // Optimizaciones UI
            setTimeout(() => this.optimizeUI(), 300);

        } catch (error) {
            console.error('Error iniciando scanner:', error);

            // Fallback: usar el scanner con UI por defecto
            try {
                this.scanner = new Html5QrcodeScanner(elementId, {
                    fps: 30,
                    qrbox: { width: 250, height: 250 },
                    rememberLastUsedCamera: true,
                    formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
                    showTorchButtonIfSupported: true
                });

                this.scanner.render(onSuccess, onError);
                this.isScanning = true;

                setTimeout(() => {
                    this.hideFileInput();
                    this.selectBackCamera();
                }, 500);
            } catch (fallbackError) {
                console.error('Error en fallback del scanner:', fallbackError);
                throw fallbackError;
            }
        }
    }

    findBackCamera(cameras) {
        if (!cameras || cameras.length === 0) return null;

        const backCameraPatterns = [
            'back', 'trasera', 'rear', 'environment',
            'posterior', 'externa', 'back camera', 'cámara trasera'
        ];

        // Buscar cámara que coincida con los patrones
        for (const pattern of backCameraPatterns) {
            const camera = cameras.find(cam =>
                cam.label.toLowerCase().includes(pattern)
            );
            if (camera) return camera;
        }

        // Si hay múltiples cámaras, la trasera suele ser la última
        return cameras.length > 1 ? cameras[cameras.length - 1] : cameras[0];
    }

    async stop() {
        if (this.html5QrCode && this.isScanning) {
            try {
                await this.html5QrCode.stop();
                this.html5QrCode = null;
                this.isScanning = false;
            } catch (error) {
                console.error('Error deteniendo html5QrCode:', error);
            }
        }

        if (this.scanner && this.isScanning) {
            try {
                await this.scanner.clear();
                this.scanner = null;
                this.isScanning = false;
            } catch (error) {
                console.error('Error deteniendo scanner:', error);
            }
        }
    }

    hideFileInput() {
        // Ocultar opción de subir imagen
        const fileInput = document.querySelector('#qr-reader__dashboard_section_swaplink');
        if (fileInput) {
            fileInput.style.display = 'none';
            fileInput.remove();
        }

        const fileScanButton = document.querySelector('#qr-reader__filescan_input');
        if (fileScanButton) {
            fileScanButton.style.display = 'none';
            fileScanButton.remove();
        }

        // Ocultar cualquier botón relacionado con archivos
        const dashboardSection = document.querySelector('#qr-reader__dashboard_section');
        if (dashboardSection) {
            const fileButtons = dashboardSection.querySelectorAll('button, a, input[type="file"]');
            fileButtons.forEach(btn => {
                if (btn.textContent.toLowerCase().includes('file') ||
                    btn.textContent.toLowerCase().includes('archivo') ||
                    btn.textContent.toLowerCase().includes('imagen')) {
                    btn.style.display = 'none';
                    btn.remove();
                }
            });
        }
    }

    optimizeUI() {
        this.hideFileInput();

        // Ocultar elementos innecesarios
        const headerMessage = document.querySelector('#qr-reader__header_message');
        if (headerMessage) {
            headerMessage.style.display = 'none';
        }

        // Ajustar el tamaño del video
        const video = document.querySelector('#qr-reader video');
        if (video) {
            video.style.borderRadius = '0.5rem';
            video.style.maxWidth = '100%';
        }
    }

    async selectBackCamera() {
        try {
            const cameras = await Html5Qrcode.getCameras();
            if (!cameras || cameras.length === 0) return;

            const backCamera = this.findBackCamera(cameras);
            if (!backCamera) return;

            const cameraSelector = document.getElementById('qr-reader__camera_selection');
            if (cameraSelector) {
                cameraSelector.value = backCamera.id;
                cameraSelector.dispatchEvent(new Event('change', { bubbles: true }));

                setTimeout(() => {
                    const startButton = document.querySelector('#qr-reader__camera_permission_button');
                    if (startButton && startButton.textContent.includes('Start')) {
                        startButton.click();
                    }
                }, 300);
            }
        } catch (error) {
            console.error('Error seleccionando cámara trasera:', error);
        }
    }
}

// ============================================
// COMPONENTE VUE PRINCIPAL
// ============================================

const DashboardApp = {
    data() {
        return {
            user: {
                id: null,
                name: '',
                empresaId: null
            },
            stats: {
                asistencias: 0,
                tardanzas: 0,
                tareas: 0,
                progreso: 0
            },
            tareas: [],
            isProcessing: false,
            isMobile: false,
            autoStartEnabled: false,
            permissionsGranted: {
                location: false,
                camera: false,
                tasks: false
            },
            modals: {
                asistencia: false,
                tareas: false
            },
            qrScanner: null,
            attendanceQueue: null,
            apiService: new ApiService()
        };
    },

    mounted() {
        this.initializeApp();
    },

    methods: {
        async initializeApp() {
            console.log('🚀 Iniciando aplicación...');

            this.loadUserData();
            this.detectDevice();

            // IMPORTANTE: Dar tiempo para que se cargue el DOM
            await new Promise(resolve => setTimeout(resolve, 100));

            // Si es móvil, iniciar proceso automático
            if (this.isMobile) {
                console.log('📱 Iniciando proceso automático para móvil...');
                await this.iniciarProcesoAutomaticoMovil();
            } else {
                console.log('💻 Cargando dashboard para desktop...');
                // Desktop: cargar dashboard normal
                this.setupEventListeners();
                await this.loadDashboardData();
                this.initializeCalendar();
            }

            // Inicializar sistema de colas
            this.attendanceQueue = new AttendanceQueue();
            this.attendanceQueue.processItem = (item) => this.procesarAsistenciaEnCola(item);

            console.log('✅ Aplicación inicializada correctamente');
        },

        detectDevice() {
            this.isMobile = DeviceService.isMobileDevice();

            console.log('🔍 Detección de dispositivo:', {
                isMobile: this.isMobile,
                width: window.innerWidth,
                height: window.innerHeight,
                userAgent: navigator.userAgent,
                touchPoints: navigator.maxTouchPoints
            });

            if (this.isMobile) {
                console.log('📱 Dispositivo móvil detectado - Iniciando modo automático');
                const indicator = document.getElementById('mobile-auto-indicator');
                if (indicator) {
                    indicator.classList.remove('hidden');
                }
            } else {
                console.log('💻 Dispositivo desktop detectado - Modo manual');
            }
        },

        async iniciarProcesoAutomaticoMovil() {
            console.log('🔄 Iniciando proceso automático móvil...');

            try {
                // Mostrar pantalla de carga
                this.mostrarPantallaCarga();

                console.log('⏳ Paso 1: Verificando tareas...');
                // Paso 1: Verificar y cargar tareas
                await this.verificarTareasConProgreso();

                console.log('⏳ Paso 2: Solicitando ubicación...');
                // Paso 2: Solicitar permiso de ubicación
                await this.solicitarUbicacionConProgreso();

                console.log('⏳ Paso 3: Verificando cámara...');
                // Paso 3: Verificar permisos de cámara (implícito al iniciar scanner)
                await this.verificarCamaraConProgreso();

                console.log('✅ Todos los pasos completados, abriendo scanner...');
                // Todo listo: abrir modal de escaneo automáticamente
                await this.abrirModalAsistenciaAutomatico();

                // Ocultar pantalla de carga
                this.ocultarPantallaCarga();

                console.log('✅ Proceso automático completado exitosamente');

            } catch (error) {
                console.error('❌ Error en proceso automático:', error);
                this.ocultarPantallaCarga();
                this.showError('Error en inicio automático', error.message);

                // Cargar dashboard normal como fallback
                console.log('🔄 Cargando dashboard normal como fallback...');
                this.setupEventListeners();
                await this.loadDashboardData();
            }
        },

        mostrarPantallaCarga() {
            console.log('📺 Mostrando pantalla de carga...');
            const screen = document.getElementById('mobile-loading-screen');
            if (screen) {
                screen.classList.remove('hidden');
                console.log('✅ Pantalla de carga visible');
            } else {
                console.error('❌ No se encontró el elemento mobile-loading-screen');
            }
            this.actualizarEstadoCarga('Iniciando sistema de marcado...', 'loading');
        },

        ocultarPantallaCarga() {
            setTimeout(() => {
                document.getElementById('mobile-loading-screen')?.classList.add('hidden');
            }, 500);
        },

        actualizarEstadoCarga(mensaje, tipo = 'loading') {
            const statusEl = document.getElementById('loading-status');
            if (statusEl) {
                statusEl.textContent = mensaje;
            }
        },

        async verificarTareasConProgreso() {
            this.actualizarProgreso('tasks', 0, '⏳ Cargando...');

            try {
                const tasks = await this.apiService.get(`/actividades/listar/${this.user.id}`);

                if (!tasks || tasks.length === 0) {
                    throw new Error('No tienes tareas asignadas. Solicita a tu supervisor que agregue tus tareas.');
                }

                this.tareas = tasks;
                this.permissionsGranted.tasks = true;
                this.actualizarProgreso('tasks', 100, '✅ Tareas cargadas');

                return true;
            } catch (error) {
                this.actualizarProgreso('tasks', 0, '❌ Error');
                throw error;
            }
        },

        async solicitarUbicacionConProgreso() {
            this.actualizarProgreso('location', 0, '⏳ Solicitando...');

            try {
                // Intentar obtener ubicación
                await LocationService.getCurrentPosition();

                this.permissionsGranted.location = true;
                this.actualizarProgreso('location', 100, '✅ Activada');

                return true;
            } catch (error) {
                this.actualizarProgreso('location', 0, '❌ Denegada');
                throw new Error('Se requiere activar la ubicación para marcar asistencia');
            }
        },

        async verificarCamaraConProgreso() {
            this.actualizarProgreso('camera', 50, '⏳ Verificando...');

            try {
                // Verificar si hay cámaras disponibles
                const cameras = await Html5Qrcode.getCameras();

                if (!cameras || cameras.length === 0) {
                    throw new Error('No se detectaron cámaras en el dispositivo');
                }

                this.permissionsGranted.camera = true;
                this.actualizarProgreso('camera', 100, '✅ Lista');

                return true;
            } catch (error) {
                this.actualizarProgreso('camera', 0, '❌ No disponible');
                throw new Error('Se requiere acceso a la cámara');
            }
        },

        actualizarProgreso(tipo, porcentaje, estado) {
            const progressBar = document.getElementById(`${tipo}-progress`);
            const statusSpan = document.getElementById(`${tipo}-status`);

            if (progressBar) {
                progressBar.style.width = `${porcentaje}%`;
            }

            if (statusSpan) {
                statusSpan.textContent = estado;
            }
        },

        async abrirModalAsistenciaAutomatico() {
            this.modals.asistencia = true;
            document.getElementById('modal-asistencia')?.classList.remove('hidden');

            // Pequeño delay para asegurar que el modal esté renderizado
            await new Promise(resolve => setTimeout(resolve, 300));

            // Iniciar scanner automáticamente
            await this.iniciarScanner();
        },

        loadUserData() {
            this.user.id = document.getElementById('trabajador_id')?.value;
            this.user.name = document.getElementById('nombre_trab')?.value;
            this.user.empresaId = document.getElementById('empresa_id')?.value;
        },

        setupEventListeners() {
            // Botón marcar asistencia (solo para desktop)
            document.getElementById('btn-marcar-asistencia')?.addEventListener('click', () => {
                this.iniciarAsistencia();
            });

            // Cerrar modales
            document.getElementById('btn-cerrar-modal')?.addEventListener('click', () => {
                this.cerrarModalAsistencia();
            });

            document.getElementById('btn-cancelar-escaneo')?.addEventListener('click', () => {
                this.cerrarModalAsistencia();
            });

            document.getElementById('btn-cerrar-tareas')?.addEventListener('click', () => {
                this.cerrarModalTareas();
            });
        },

        async loadDashboardData() {
            try {
                await Promise.all([
                    this.loadStats(),
                    this.loadRecentTasks(),
                    this.loadLastAttendance()
                ]);
            } catch (error) {
                console.error('Error cargando datos del dashboard:', error);
            }
        },

        async loadStats() {
            try {
                const data = await this.apiService.get(`/api/dashboard/stats/${this.user.id}`);
                this.stats = { ...this.stats, ...data };
                this.updateStatsUI();
            } catch (error) {
                console.error('Error cargando estadísticas:', error);
            }
        },

        async loadRecentTasks() {
            try {
                const tasks = await this.apiService.get(`/actividades/listar/${this.user.id}`);
                this.tareas = tasks || [];
                this.renderRecentTasks();
            } catch (error) {
                console.error('Error cargando tareas:', error);
            }
        },

        async loadLastAttendance() {
            try {
                const attendance = await this.apiService.get(`/api/asistencias/ultima/${this.user.id}`);
                this.renderLastAttendance(attendance);
            } catch (error) {
                console.error('Error cargando última asistencia:', error);
            }
        },

        updateStatsUI() {
            document.getElementById('stat-asistencias').textContent = this.stats.asistencias;
            document.getElementById('stat-tardanzas').textContent = this.stats.tardanzas;
            document.getElementById('stat-tareas').textContent = this.stats.tareas;
            document.getElementById('stat-progreso').textContent = `${this.stats.progreso}%`;
        },

        renderRecentTasks() {
            const container = document.getElementById('tareas-recientes');
            if (!container) return;

            if (this.tareas.length === 0) {
                container.innerHTML = '<p class="text-center text-gray-500 dark:text-gray-400 py-4">No hay tareas disponibles</p>';
                return;
            }

            const tasksHTML = this.tareas.slice(0, 5).map(tarea => `
                <div class="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
                    <div class="flex-1">
                        <p class="text-sm font-medium text-gray-900 dark:text-white">${tarea.nameActividad}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${tarea.status || 'Pendiente'}</p>
                    </div>
                    <span class="px-2 py-1 text-xs rounded-full ${this.getTaskStatusColor(tarea.status)}">
                        ${tarea.status || 'Todo'}
                    </span>
                </div>
            `).join('');

            container.innerHTML = tasksHTML;
        },

        renderLastAttendance(attendance) {
            const container = document.getElementById('ultima-asistencia');
            if (!container) return;

            if (!attendance) {
                container.innerHTML = '<p class="text-center text-gray-500 dark:text-gray-400 py-4">Sin registros</p>';
                return;
            }

            container.innerHTML = `
                <div class="space-y-3">
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-gray-600 dark:text-gray-400">Fecha:</span>
                        <span class="text-sm font-medium text-gray-900 dark:text-white">${attendance.fecha}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-gray-600 dark:text-gray-400">Hora:</span>
                        <span class="text-sm font-medium text-gray-900 dark:text-white">${attendance.hora}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-gray-600 dark:text-gray-400">Estado:</span>
                        <span class="px-3 py-1 text-xs rounded-full ${this.getAttendanceStatusColor(attendance.tipo_horario)}">
                            ${attendance.tipo_horario}
                        </span>
                    </div>
                </div>
            `;
        },

        getTaskStatusColor(status) {
            const colors = {
                'Todo': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
                'Doing': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
                'Done': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
            };
            return colors[status] || colors['Todo'];
        },

        getAttendanceStatusColor(type) {
            const colors = {
                'Puntual': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
                'Tarde': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
                'Fuera de horario': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
            };
            return colors[type] || colors['Fuera de horario'];
        },

        initializeCalendar() {
            try {
                const calendar = new eventCalendar.Calendar('#calendar', {
                    // Configuración del calendario
                });
            } catch (error) {
                console.error('Error inicializando calendario:', error);
            }
        },

        // ============================================
        // PROCESO DE ASISTENCIA
        // ============================================

        async iniciarAsistencia() {
            if (this.isProcessing) {
                this.showWarning('Ya hay un proceso en curso');
                return;
            }

            // Verificar tareas
            if (this.tareas.length === 0) {
                await this.loadRecentTasks();

                if (this.tareas.length === 0) {
                    this.showInfo(
                        'Sin tareas asignadas',
                        'Solicita a tu supervisor que asigne tus tareas antes de registrar asistencia.'
                    );
                    return;
                }
            }

            // Verificar tipo de dispositivo
            if (!DeviceService.isMobileDevice()) {
                this.showInfo(
                    'Dispositivo no compatible',
                    'El marcado de asistencia está optimizado para dispositivos móviles. Usa un smartphone o tablet.'
                );
                return;
            }

            // Verificar permisos
            try {
                await this.verificarPermisos();
                this.abrirModalAsistencia();
            } catch (error) {
                this.showError('Permisos requeridos', error.message);
            }
        },

        async verificarPermisos() {
            try {
                await LocationService.getCurrentPosition();
                return true;
            } catch (error) {
                throw new Error('Se requiere acceso a la ubicación para registrar asistencia');
            }
        },

        abrirModalAsistencia() {
            this.modals.asistencia = true;
            document.getElementById('modal-asistencia')?.classList.remove('hidden');

            setTimeout(() => {
                this.iniciarScanner();
            }, 300);
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
                    (decodedText) => this.onQRSuccess(decodedText),
                    (error) => this.onQRError(error)
                );

                this.updateQRStatus('Escaneando... Posiciona el QR frente a la cámara', 'info');
            } catch (error) {
                console.error('Error iniciando scanner:', error);
                this.showError('No se pudo iniciar la cámara. Verifica los permisos.');
            }
        },

        async onQRSuccess(qrCode) {
            if (this.isProcessing) {
                console.log('Proceso en curso, añadiendo a cola...');
                return;
            }

            this.isProcessing = true;
            this.updateQRStatus('✓ QR detectado, procesando...', 'success');

            try {
                // Detener scanner inmediatamente
                if (this.qrScanner) {
                    await this.qrScanner.stop();
                }

                // Agregar a la cola de procesamiento
                const queueId = this.attendanceQueue.add({
                    qrCode: qrCode,
                    userId: this.user.id,
                    userName: this.user.name,
                    empresaId: this.user.empresaId
                });

                console.log('Asistencia agregada a la cola:', queueId);

            } catch (error) {
                console.error('Error al procesar QR:', error);
                this.isProcessing = false;
                this.showError('Error', 'No se pudo procesar el código QR');

                setTimeout(() => {
                    if (this.modals.asistencia) {
                        this.iniciarScanner();
                    }
                }, 2000);
            }
        },

        async procesarAsistenciaEnCola(item) {
            try {
                const data = item.data;

                // Obtener datos necesarios en paralelo para mayor velocidad
                const [fechaHora, position] = await Promise.all([
                    TimeService.getPeruTime(),
                    LocationService.getCurrentPosition()
                ]);

                const tipoAsistencia = TimeService.calculateAttendanceType(fechaHora);
                const ubicacion = await LocationService.getAddress(
                    position.coords.latitude,
                    position.coords.longitude
                );

                // Preparar datos
                const formData = new FormData();
                formData.append('nombre_trabajador', data.userName);
                formData.append('tipo_horario', tipoAsistencia);
                formData.append('fecha', fechaHora.toISOString().split('T')[0]);
                formData.append('horaLima', fechaHora.toLocaleTimeString('es-PE', { hour12: false }));
                formData.append('ubicacion', ubicacion);
                formData.append('id_trabajador', data.userId);
                formData.append('id_empresa', data.empresaId);
                formData.append('qr_code', data.qrCode);

                // Registrar asistencia con timeout
                const response = await Promise.race([
                    this.apiService.post('/calendarios/registrar-asistencia', formData),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Timeout')), 10000)
                    )
                ]);

                if (response.success) {
                    this.cerrarModalAsistencia();

                    const mensaje = TimeService.getAttendanceMessage(tipoAsistencia);

                    await this.showSuccess(tipoAsistencia, mensaje);

                    // Mostrar modal de tareas
                    this.abrirModalTareas();

                    // Actualizar dashboard
                    await this.loadDashboardData();

                    this.isProcessing = false;
                } else {
                    throw new Error(response.error || 'Error al registrar asistencia');
                }
            } catch (error) {
                console.error('Error procesando asistencia:', error);
                throw error; // Propagar error para reintentos
            }
        },

        onQRError(error) {
            // Ignorar errores de "no QR found"
            if (error && !error.includes('No QR code found') && !error.includes('NotFoundException')) {
                console.error('QR Error:', error);
            }
        },

        updateQRStatus(message, type = 'info') {
            const statusEl = document.getElementById('qr-status');
            if (!statusEl) return;

            const colors = {
                info: 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900 dark:to-cyan-900 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200',
                success: 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 border-green-200 dark:border-green-700 text-green-800 dark:text-green-200',
                error: 'bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900 dark:to-pink-900 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200'
            };

            const icons = {
                info: '<div class="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>',
                success: '<svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>',
                error: '<svg class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>'
            };

            statusEl.className = `mb-4 p-4 rounded-lg border-2 ${colors[type]}`;
            statusEl.innerHTML = `
                <div class="flex items-center justify-center gap-3">
                    ${icons[type]}
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

            if (this.tareas.length === 0) {
                container.innerHTML = '<p class="col-span-2 text-center text-gray-500 dark:text-gray-400 py-8">No hay tareas disponibles</p>';
                contador.textContent = 'Total: 0 tareas';
                return;
            }

            const tareasHTML = this.tareas.map(tarea => `
                <button 
                    data-tarea-id="${tarea.actividadId}"
                    class="tarea-btn p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-cyan-500 dark:hover:border-cyan-400 transition-all transform hover:scale-105 text-left group bg-white dark:bg-gray-800"
                >
                    <div class="flex items-start justify-between">
                        <div class="flex-1">
                            <h4 class="font-semibold text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                                ${tarea.nameActividad}
                            </h4>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                ${tarea.descripcion || 'Sin descripción'}
                            </p>
                        </div>
                        <svg class="w-5 h-5 text-gray-400 group-hover:text-cyan-500 transition-colors flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                    </div>
                </button>
            `).join('');

            container.innerHTML = tareasHTML;
            contador.textContent = `Total: ${this.tareas.length} tarea${this.tareas.length !== 1 ? 's' : ''}`;

            // Agregar eventos
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
                    await this.showSuccess(
                        'Tarea iniciada',
                        'Has comenzado a trabajar en esta tarea. ¡Éxito!'
                    );

                    this.cerrarModalTareas();
                    await this.loadDashboardData();
                } else {
                    throw new Error(response.error || 'Error al actualizar tarea');
                }
            } catch (error) {
                console.error('Error seleccionando tarea:', error);
                this.showError('Error', 'No se pudo actualizar la tarea');
            } finally {
                this.isProcessing = false;
            }
        },

        // ============================================
        // ALERTAS Y NOTIFICACIONES
        // ============================================

        showLoading(message) {
            Swal.fire({
                title: 'Procesando...',
                text: message,
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                }
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
        }
    }
};

// ============================================
// INICIALIZACIÓN
// ============================================


document.addEventListener('DOMContentLoaded', () => {
    const app = createApp(DashboardApp);
    app.mount('#dashboard-app');
});

// Exportar para uso global si es necesario
export { DashboardApp, ApiService, TimeService, LocationService, QRScannerService, AttendanceQueue };