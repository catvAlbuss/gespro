import { createApp, ref, onMounted, computed } from 'vue';
import { exportarIP as generarInformePago } from './informe-pago-generator.js'; // ← AGREGAR ESTO

// Obtener datos de configuración inicial
const { empresaId, trabajadorId, csrfToken } = window.APP_INIT || {};

const app = createApp({
  setup() {
    // Estados reactivos principales
    const tramites = ref([]);
    const tipoTramite = ref('');
    const descripcion = ref('');
    const error = ref('');
    const success = ref('');
    const loading = ref(false);
    const selectedTramite = ref(null);
    const showModal = ref(false);
    const observaciones = ref('');
    const userRole = ref('');
    const activeTab = ref('pendientes');
    const activities = ref([]);
    const descuentos = ref([]);
    const tareasejecutadas = ref([]);
    const mes = ref("");

    // Computadas de permisos
    const canEditDiscount = computed(() => {
      //const allowed = ['gerencia', 'administracion', 'admin_proyectos', 'contabilidad'];
      const allowed = ['administracion'];
      return allowed.includes(userRole.value);
    });

    // Función para normalizar roles
    const normalizeRoleKey = (rol) => {
      if (!rol) return '';
      const r = String(rol).trim();
      const map = {
        'Gerencia': 'gerencia',
        'gerencia': 'gerencia',
        'Administración': 'administracion',
        'Administracion': 'administracion',
        'administracion': 'administracion',
        'Administrador de Proyectos': 'admin_proyectos',
        'Administrador de proyectos': 'admin_proyectos',
        'admin_proyectos': 'admin_proyectos',
        'Jefe de area': 'jefe_area',
        'Jefe de Área': 'jefe_area',
        'jefe_area': 'jefe_area',
        'Asistente': 'asistente',
        'asistente': 'asistente',
        'Contabilidad': 'contabilidad',
        'contabilidad': 'contabilidad',
      };
      return map[r] || r.toLowerCase().replace(/[^a-z0-9_]+/g, '_');
    };

    // Jerarquía de roles
    const rolesHierarchy = {
      'gerencia': ['gerencia', 'administracion', 'admin_proyectos', 'jefe_area', 'asistente', 'contabilidad'],
      'administracion': ['administracion', 'admin_proyectos', 'jefe_area', 'asistente'],
      'admin_proyectos': ['admin_proyectos', 'jefe_area', 'asistente'],
      'jefe_area': ['jefe_area', 'asistente'],
      'contabilidad': ['contabilidad', 'gerencia', 'administracion', 'admin_proyectos', 'jefe_area', 'asistente'],
      'asistente': []
    };

    const meses = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];


    // Computed para filtrar trámites
    const tramitesFiltrados = computed(() =>
      tramites.value.filter(t => {
        if (t.empresa_id !== undefined && t.empresa_id !== null) {
          return String(t.empresa_id) === String(empresaId);
        }
        return true;
      })
    );

    const tramitesPendientes = computed(() =>
      tramitesFiltrados.value.filter(t => t.estado_actual === 'En proceso')
    );

    const tramitesCompletados = computed(() =>
      tramitesFiltrados.value.filter(t => t.estado_actual === 'Completado')
    );

    const tramitesRechazados = computed(() =>
      tramitesFiltrados.value.filter(t => t.estado_actual === 'Rechazado')
    );

    // Funciones de permisos
    const puedeModificarTramite = (tramite) => {
      if (!userRole.value || !rolesHierarchy[userRole.value]) return false;

      let creatorRoleRaw = '';
      if (tramite.creador) {
        creatorRoleRaw = tramite.creador.rol_normalized || tramite.creador.area_laboral || '';
      }
      const creatorRole = normalizeRoleKey(creatorRoleRaw);

      const rolesPermitidos = rolesHierarchy[userRole.value] || [];
      return rolesPermitidos.includes(creatorRole);
    };

    const mostrarBotonesAccion = (tramite) => {
      if (tramite.estado_actual !== 'En proceso') return false;
      if (!puedeModificarTramite(tramite)) return false;

      if (tramite.creador && tramite.creador.id === trabajadorId) {
        const role = userRole.value || '';
        if (role === 'jefe_area' && tramite.tipo === 'Informe de Pago') return true;
        if ((role === 'administracion' || role === 'admin_proyectos' || role === 'gerencia') && tramite.tipo === 'Informe de Pago') return true;
        return false;
      }

      return true;
    };

    // Funciones de carga de datos
    const cargarDatosUsuario = async () => {
      try {
        const res = await fetch('/tramites/user-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-TOKEN': csrfToken,
          },
          body: JSON.stringify({
            id: trabajadorId,
            empresaId: empresaId
          })
        });

        if (res.ok) {
          const userData = await res.json();
          const rawRole = userData.rol || userData.area_laboral || '';
          userRole.value = normalizeRoleKey(rawRole);
        } else {
          console.error('Error en la respuesta:', res.status);
        }
      } catch (err) {
        console.error('Error al cargar datos del usuario:', err);
      }
    };

    const cargarTramites = async () => {
      try {
        loading.value = true;
        const includeSub = (userRole.value === 'jefe_area' || userRole.value === 'gerencia' || userRole.value === 'administracion');
        console.log(userRole.value)
        console.log(includeSub)
        const res = await fetch(`/tramites?empresa_id=${empresaId}` + (includeSub ? '&include_subordinates=1' : ''), {
          headers: {
            'Accept': 'application/json',
            'X-CSRF-TOKEN': csrfToken,
          }
        });

        if (res.ok) {
          const data = await res.json();
          console.log('trámites recibidos:', data);

          const normalized = data.map(t => {
            if (t.creador) {
              const raw = t.creador.rol || t.creador.area_laboral || '';
              t.creador.rol_normalized = normalizeRoleKey(raw);
            }
            return t;
          });

          tramites.value = normalized;
        } else {
          throw new Error('Error al cargar trámites');
        }
      } catch (err) {
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    };

    const getDataActivityPersonal = async (userId = trabajadorId, mesSolicitado, tramiteId) => {
      try {
        const fecha = new Date();
        const mesSolicitadoInfo = mesSolicitado || fecha.getMonth();
        const idtramite = tramiteId || 1;
        const response = await fetch('/tramites/actividad-personal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken,
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            user_id: userId,
            month: mesSolicitadoInfo,
            empresaId: empresaId,
            tramitedesing: idtramite,
            adelanto: 0,
            permisos: 0,
            incMof: 0,
            bondtrab: 0,
            descuenttrab: 0,
          })
        });

        if (!response.ok) {
          throw new Error(`Error en la exportación: ${response.statusText}`);
        }

        const data = await response.json();

        activities.value = Array.isArray(data.tareas) ? data.tareas : (data.tareas || []);
        tareasejecutadas.value = data;

        const extras = data.extras || {};
        const built = [
          { key: 'permisos', label: 'Permisos', cantidad: Number(extras.permisos || 0) },
          { key: 'adelanto', label: 'Adelanto', cantidad: Number(extras.adelantos || extras.adelanto || 0) },
          { key: 'incLab', label: 'INCUMPLIMIENTO DEL LAB', cantidad: Number(data.incumplimientolab || extras.incumplimientolab || 0) },
          { key: 'incMof', label: 'INCUMPLIMIENTO DEL MOF (2 HORAS)', cantidad: Number(extras.incumplimientomof || extras.incMof || 0) },
          { key: 'descuenttrab', label: 'Descuento Trabajador', cantidad: Number(extras.descuento || extras.descuenttrab || 0) },
          { key: 'bondtrab', label: 'Bonificacion', cantidad: Number(extras.bonificacion || extras.bondtrab || 0) },

        ];

        const seen = new Set();
        const unique = [];
        for (const d of built) {
          if (!d || !d.key) continue;
          if (seen.has(d.key)) continue;
          seen.add(d.key);
          unique.push(d);
        }
        descuentos.value = unique;

        updateMofDiscount();
        //console.log('Exportación completada', { actividades: activities.value.length, descuentos: descuentos.value });
      } catch (err) {
        console.error('Error al cargar actividades:', err);
      }
    };

    // Funciones CRUD de trámites
    const enviarTramite = async () => {
      if (!tipoTramite.value || !mes.value || !descripcion.value) {
        error.value = 'Todos los campos son requeridos';
        return;
      }
      console.log(userRole.value);
      try {
        loading.value = true;
        error.value = '';
        const formData = new FormData();
        formData.append('tipo', tipoTramite.value);
        formData.append('fecha_informe_sol', mes.value);
        formData.append('descripcion', descripcion.value);
        formData.append('empresa_id', empresaId);
        formData.append('rolUser', userRole.value);

        const res = await fetch('/tramites', {
          method: 'POST',
          headers: {
            'X-CSRF-TOKEN': csrfToken,
          },
          body: formData,
        });

        if (res.ok) {
          tipoTramite.value = '';
          descripcion.value = '';
          success.value = 'Trámite enviado correctamente';
          await cargarTramites();
          setTimeout(() => success.value = '', 3000);
        } else {
          const data = await res.json();
          error.value = data.message || 'Error al enviar trámite';
        }
      } catch (err) {
        error.value = 'Error de conexión';
      } finally {
        loading.value = false;
      }
    };

    const aprobarTramite = async (tramiteId) => {
      try {
        loading.value = true;
        const res = await fetch(`/tramites/${tramiteId}/aprobar`, {
          method: 'POST',
          headers: {
            'X-CSRF-TOKEN': csrfToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            observaciones: observaciones.value,
            empresa_id: empresaId
          })
        });

        if (res.ok) {
          success.value = 'Trámite aprobado correctamente';
          await cargarTramites();
          closeModal();
          setTimeout(() => success.value = '', 3000);
        } else {
          const data = await res.json();
          error.value = data.message || 'Error al aprobar trámite';
        }
      } catch (err) {
        error.value = 'Error de conexión';
      } finally {
        loading.value = false;
      }
    };

    const rechazarTramite = async (tramiteId) => {
      if (!observaciones.value.trim()) {
        error.value = 'Las observaciones son requeridas para rechazar';
        return;
      }

      try {
        loading.value = true;
        const res = await fetch(`/tramites/${tramiteId}/rechazar`, {
          method: 'POST',
          headers: {
            'X-CSRF-TOKEN': csrfToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            observaciones: observaciones.value,
            empresa_id: empresaId
          })
        });

        if (res.ok) {
          success.value = 'Trámite rechazado';
          await cargarTramites();
          closeModal();
          setTimeout(() => success.value = '', 3000);
        } else {
          const data = await res.json();
          error.value = data.message || 'Error al rechazar trámite';
        }
      } catch (err) {
        error.value = 'Error de conexión';
      } finally {
        loading.value = false;
      }
    };

    const reenviarTramite = async (tramiteId) => {
      try {
        loading.value = true;
        const res = await fetch(`/tramites/${tramiteId}/reenviar`, {
          method: 'POST',
          headers: {
            'X-CSRF-TOKEN': csrfToken,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ empresa_id: empresaId })
        });

        if (res.ok) {
          success.value = 'Trámite reenviado y reiniciado correctamente';
          await cargarTramites();
          setTimeout(() => success.value = '', 3000);
        } else {
          const data = await res.json();
          error.value = data.message || 'Error al reenviar trámite';
        }
      } catch (err) {
        error.value = 'Error de conexión';
      } finally {
        loading.value = false;
      }
    };

    const saveDiscounts = async (tramiteId) => {
      if (!canEditDiscount.value) {
        error.value = 'No tiene permiso para modificar descuentos';
        return;
      }

      try {
        loading.value = true;
        error.value = '';
        const payload = {
          tramitedesing: tramiteId,
          descuentos: descuentos.value
        };
        console.log(payload);
        const res = await fetch('/tramites/guardar-descuentos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken,
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          success.value = 'Descuentos guardados correctamente';
          await getDataActivityPersonal();
          setTimeout(() => success.value = '', 3000);
        } else {
          const d = await res.json();
          error.value = d.message || 'Error al guardar descuentos';
        }
      } catch (err) {
        error.value = 'Error de conexión al guardar descuentos';
      } finally {
        loading.value = false;
      }
    };

    // Funciones de modal
    const openModal = async (tramite) => {
      selectedTramite.value = tramite;
      observaciones.value = '';
      const creatorId = tramite && tramite.creador && (tramite.creador.id || tramite.creador.user_id) ? (tramite.creador.id || tramite.creador.user_id) : trabajadorId;
      const mesSolicitado = tramite.fecha_informe_sol;
      const tramiteId = tramite.id;
      console.log(tramite);
      await getDataActivityPersonal(creatorId, mesSolicitado, tramiteId);
      showModal.value = true;
      updateMofDiscount();
    };

    const closeModal = () => {
      selectedTramite.value = null;
      observaciones.value = '';
      showModal.value = false;
      error.value = '';
    };

    // Funciones de utilidad
    const getEstadoColor = (estado) => {
      switch (estado) {
        case 'En proceso': return 'bg-yellow-100 text-yellow-800';
        case 'Completado': return 'bg-green-100 text-green-800';
        case 'Rechazado': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    const getRolColor = (rol) => {
      const key = normalizeRoleKey(rol);
      const colores = {
        'gerencia': 'bg-purple-100 text-purple-800',
        'administracion': 'bg-blue-100 text-blue-800',
        'admin_proyectos': 'bg-indigo-100 text-indigo-800',
        'jefe_area': 'bg-green-100 text-green-800',
        'contabilidad': 'bg-orange-100 text-orange-800',
        'asistente': 'bg-gray-100 text-gray-800'
      };
      return colores[key] || 'bg-gray-100 text-gray-800';
    };

    const formatearRol = (rol) => {
      const key = normalizeRoleKey(rol);
      const nombres = {
        'gerencia': 'Gerencia',
        'administracion': 'Administración',
        'admin_proyectos': 'Admin. Proyectos',
        'jefe_area': 'Jefe de Área',
        'contabilidad': 'Contabilidad',
        'asistente': 'Asistente'
      };
      return nombres[key] || rol || '';
    };

    const calcularProgreso = (aprobaciones) => {
      if (!aprobaciones || aprobaciones.length === 0) return 0;
      const total = aprobaciones.length;
      const aprobadas = aprobaciones.filter(a => a.aprobado).length;
      return Math.round((aprobadas / total) * 100);
    };

    const getTramitesActivos = () => {
      switch (activeTab.value) {
        case 'pendientes': return tramitesPendientes.value;
        case 'completados': return tramitesCompletados.value;
        case 'rechazados': return tramitesRechazados.value;
        default: return [];
      }
    };

    const obtenerMotivoRechazo = (tramite) => {
      if (!tramite || !tramite.aprobaciones) return null;
      const rechazo = [...tramite.aprobaciones].reverse().find(a => {
        return (a.aprobado === false || a.aprobado === 0) && a.usuario_id && a.observaciones;
      });
      if (!rechazo) return null;
      return {
        observaciones: rechazo.observaciones,
        usuario: rechazo.usuario ? (rechazo.usuario.name || '') : (rechazo.usuario_name || ''),
        fecha: rechazo.fecha_aprobacion || rechazo.updated_at || null
      };
    };

    const exportarIP = async (tramite) => {
      try {
        // Usar la función importada del generador
        await generarInformePago(tramite, csrfToken, empresaId);

        success.value = 'Informe de pago generado correctamente';
        setTimeout(() => success.value = '', 3000);

      } catch (err) {
        console.error("Error al exportar informe de pago:", err);
        error.value = err.message || "Error al generar el informe de pago";
        setTimeout(() => error.value = '', 5000);
      }
    };

    // Totales calculados
    const totalDiasProgramados = computed(() => 26);

    const totalDiasEjecutados = computed(() => {
      return tareasejecutadas.value.totalDiasAprobados
    });

    const updateMofDiscount = () => {
      const totalProg = Number(totalDiasProgramados.value) || 0;
      const totalEjec = Number(totalDiasEjecutados.value) || 0;

      // Diferencia de días
      const diff = Math.max(0, totalProg - totalEjec);

      // Buscar específicamente la clave 'incLab'
      const idx = descuentos.value.findIndex(d => d.key === 'incLab');

      if (idx !== -1) {
        // Actualizar cantidad con el dato real del backend si existe
        descuentos.value[idx].cantidad = tareasejecutadas.value?.totalDiasNoAprobados ?? diff;
      } else {
        // Insertar si no existe
        descuentos.value.push({
          key: 'incLab',
          label: 'Incumplimiento del LAB',
          cantidad: tareasejecutadas.value?.totalDiasNoAprobados ?? diff
        });
      }
    };

    // Lifecycle hook
    onMounted(async () => {
      await getDataActivityPersonal();
      await cargarDatosUsuario();
      await cargarTramites();
    });

    // Retorno de todas las funciones y estados
    return {
      tramites: tramitesFiltrados,
      tramitesPendientes,
      tramitesCompletados,
      tramitesRechazados,
      tipoTramite,
      descripcion,
      error,
      success,
      loading,
      selectedTramite,
      showModal,
      observaciones,
      userRole,
      activeTab,
      mes,

      enviarTramite,
      aprobarTramite,
      rechazarTramite,
      openModal,
      closeModal,
      getEstadoColor,
      getRolColor,
      formatearRol,
      calcularProgreso,
      mostrarBotonesAccion,
      puedeModificarTramite,
      getTramitesActivos,
      obtenerMotivoRechazo,
      reenviarTramite,
      meses,
      activities,
      descuentos,
      tareasejecutadas,
      saveDiscounts,
      canEditDiscount,
      totalDiasProgramados,
      totalDiasEjecutados,
      exportarIP
    };
  },

  template: `
    <div class="max-w-6xl mx-auto space-y-6">
      
      <!-- ALERTAS DE ERROR Y ÉXITO -->
      <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
        </svg>
        {{ error }}
      </div>

      <div v-if="success" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
        </svg>
        {{ success }}
      </div>

      <!-- FORMULARIO DE NUEVO TRÁMITE -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Nuevo Trámite</h3>
        <form @submit.prevent="enviarTramite" class="space-y-4">
          <div class="flex flex-row gap-6">
            <!-- Tipo de trámite -->
            <div class="w-1/2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Tipo de trámite
              </label>
              <select 
                v-model="tipoTramite" 
                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
                <option disabled value="">-- Seleccionar tipo --</option>
                <option>Informe de Pago</option>
                <option>Requerimiento</option>
              </select>
            </div>

            <!-- Mes -->
            <div class="w-1/2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Mes
              </label>
              <select 
                v-model="mes" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
                <option disabled value="">-- Seleccionar mes --</option>
                <option v-for="m in meses" :key="m" :value="m">
                  {{ m }}
                </option>
              </select>
            </div>
          </div>


          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
            <textarea v-model="descripcion" 
                      class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      rows="3" 
                      placeholder="Describe detalladamente el trámite..." 
                      required></textarea>
          </div>

          <button type="submit" 
                  :disabled="loading"
                  class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium px-6 py-2 rounded-md transition-colors duration-200 flex items-center">
            <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ loading ? 'Enviando...' : 'Enviar Trámite' }}
          </button>
        </form>
      </div>

      <!-- TABS DE TRÁMITES -->
      <div class="bg-white rounded-lg shadow-md">
        <div class="border-b border-gray-200">
          <nav class="flex space-x-8 px-6" aria-label="Tabs">
            <button @click="activeTab = 'pendientes'" 
                    :class="activeTab === 'pendientes' ? 'border-yellow-500 text-yellow-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
                    class="py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap">
              En Proceso ({{ tramitesPendientes.length }})
            </button>
            <button @click="activeTab = 'completados'"
                    :class="activeTab === 'completados' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
                    class="py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap">
              Completados ({{ tramitesCompletados.length }})
            </button>
            <button @click="activeTab = 'rechazados'"
                    :class="activeTab === 'rechazados' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
                    class="py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap">
              Rechazados ({{ tramitesRechazados.length }})
            </button>
          </nav>
        </div>

        <!-- LISTA DE TRÁMITES -->
        <div class="p-6">
          <!-- Loading spinner -->
          <div v-if="loading" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>

          <!-- Estado vacío -->
          <div v-else-if="getTramitesActivos().length === 0" class="text-center py-8 text-gray-500">
            <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 48 48">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m6 0h6m-6 6v6m6-12v12a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8a2 2 0 012 2v4z"/>
            </svg>
            No hay trámites {{ activeTab === 'pendientes' ? 'en proceso' : activeTab }}
          </div>

          <!-- Lista de tarjetas de trámites -->
          <div v-else class="grid gap-4">
            <div v-for="tramite in getTramitesActivos()" 
                 :key="tramite.id"
                 class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
              
              <!-- Header de la tarjeta -->
              <div class="flex justify-between items-start mb-3">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <h4 class="font-semibold text-gray-900">{{ tramite.tipo }}</h4>
                    <span :class="getRolColor(tramite.creador.rol)" class="px-2 py-1 rounded-full text-xs font-medium">
                      {{ formatearRol(tramite.creador.rol) }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-600 mb-2">{{ tramite.descripcion }}</p>
                  <div class="flex flex-wrap gap-4 text-xs text-gray-500">
                    <span>Creado por: {{ tramite.creador.name }}</span>
                    <span>Fecha: {{ new Date(tramite.created_at).toLocaleDateString() }}</span>
                    <span v-if="tramite.fecha_actualizacion">
                      Actualizado: {{ new Date(tramite.fecha_actualizacion).toLocaleDateString() }}
                    </span>
                  </div>
                </div>
                
                <!-- Botones de acción -->
                <div class="flex items-center space-x-2 ml-4">
                  <span :class="getEstadoColor(tramite.estado_actual)" class="px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                    {{ tramite.estado_actual }}
                  </span>
                  <button v-if="mostrarBotonesAccion(tramite)" 
                          @click="openModal(tramite)"
                          class="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap">
                    Revisar
                  </button>

                  <!-- Botón especial para Jefe de Área: aprobar informe y aprobar asistentes -->
                  <button v-if="userRole === 'jefe_area' && tramite.creador && tramite.creador.rol_normalized === 'asistente'"
                          @click="openModal(tramite)"
                          class="bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap">
                    Aprobar Informe
                  </button>
                  
                  <!-- Botón emitir informe: solo cuando esté completado y sea Informe de Pago -->
                  <button v-if="tramite.estado_actual === 'Completado' && tramite.tipo === 'Informe de Pago'"
                          @click.prevent="exportarIP(tramite)"
                          class="bg-indigo-100 hover:bg-indigo-200 text-indigo-800 px-3 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap">
                    Emitir informe
                  </button>
                </div>
              </div>

              <!-- Barra de progreso -->
              <div class="mb-3" v-if="tramite.aprobaciones && tramite.aprobaciones.length > 0">
                <div class="flex justify-between items-center mb-1">
                  <span class="text-sm text-gray-600">Progreso de Aprobación</span>
                  <span class="text-sm text-gray-600">{{ calcularProgreso(tramite.aprobaciones) }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                       :style="{ width: calcularProgreso(tramite.aprobaciones) + '%' }"></div>
                </div>
              </div>

              <!-- Etapas de aprobación -->
              <div v-if="tramite.aprobaciones && tramite.aprobaciones.length > 0" 
                   class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                <div v-for="aprobacion in tramite.aprobaciones" 
                     :key="aprobacion.id"
                     class="text-center">
                  <div :class="aprobacion.aprobado ? 'bg-green-100 text-green-800' : aprobacion.rechazado ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'"
                       class="p-2 rounded text-xs font-medium mb-1">
                    <div class="flex justify-center mb-1">
                      <svg v-if="aprobacion.aprobado" class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                      </svg>
                      <svg v-else-if="aprobacion.rechazado" class="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
                      </svg>
                      <svg v-else class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"></circle>
                      </svg>
                    </div>
                    {{ aprobacion.etapa }}
                  </div>
                  <div v-if="aprobacion.fecha_aprobacion" class="text-xs text-gray-500">
                    {{ new Date(aprobacion.fecha_aprobacion).toLocaleDateString() }}
                  </div>
                </div>
              </div>

              <!-- Observaciones del trámite -->
              <div v-if="tramite.observaciones" class="mt-3 p-3 bg-gray-50 rounded-md">
                <p class="text-sm text-gray-600"><strong>Observaciones:</strong></p>
                <p class="text-sm text-gray-800 mt-1">{{ tramite.observaciones }}</p>
              </div>

              <!-- Mostrar motivo de rechazo cuando el estado es Rechazado -->
              <div v-if="tramite.estado_actual === 'Rechazado'" class="mt-3 p-3 bg-red-50 rounded-md border border-red-100">
                <p class="text-sm text-red-700 font-medium">Motivo de rechazo</p>
                <p class="text-sm text-red-800 mt-1" v-if="obtenerMotivoRechazo(tramite)">
                  {{ obtenerMotivoRechazo(tramite).observaciones }}
                </p>
                <p class="text-sm text-red-600 mt-1" v-else>No hay motivo registrado.</p>

                <div class="mt-3 flex space-x-2">
                  <button @click="reenviarTramite(tramite.id)"
                          class="px-3 py-1 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700">
                    Reenviar trámite
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- MODAL DE APROBACIÓN/RECHAZO -->
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-50 overflow-y-auto py-10">
        <div class="w-full max-w-6xl bg-white rounded-lg shadow-xl p-6 relative">
          
          <!-- Header del modal -->
          <div class="flex justify-between items-center border-b pb-4 mb-4">
            <h2 class="text-xl font-semibold text-gray-800">Revisar Trámite</h2>
            <button @click="closeModal" class="text-gray-500 hover:text-gray-700">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Información del trámite -->
          <div class="bg-gray-50 p-4 rounded mb-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
              <p><strong>Tipo:</strong> {{ selectedTramite?.tipo }}</p>
              <p><strong>Creado por:</strong> {{ selectedTramite?.creador.name }}</p>
              <p><strong>Rol:</strong> {{ formatearRol(selectedTramite?.creador.area_laboral) }}</p>
            </div>
            <div class="mt-3">
              <p class="text-sm font-medium text-gray-800">Descripción:</p>
              <p class="text-sm text-gray-700 mt-1">{{ selectedTramite?.descripcion }}</p>
            </div>
          </div>

          <!-- Sección de Actividades -->
          <div class="mb-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mb-2">
              <h3 class="text-sm font-semibold text-gray-800 md:col-span-2">Actividades</h3>
              <!-- Resumen del pago mensual -->
              <div v-if="activities.length > 0" class="text-sm text-gray-700 text-right md:text-right">
                Pago mensual: 
                <span class="font-semibold text-green-600 ml-1">
                  {{ totalDiasEjecutados }} / {{ totalDiasProgramados }} días
                </span>
                <div class="text-xs text-gray-500">(Ejecutados / Programados)</div>
              </div>
            </div>
            <div class="overflow-x-auto max-h-48 border rounded-md">
              <table class="min-w-full text-sm text-left">
                <thead class="bg-gray-100 sticky top-0">
                  <tr>
                    <th class="px-3 py-2">Tarea</th>
                    <th class="px-3 py-2">Inicio</th>
                    <th class="px-3 py-2">Fin</th>
                    <th class="px-3 py-2">Días Ejecutados</th>
                    <th class="px-3 py-2">Días Programados</th>
                    <th class="px-3 py-2">Cierre</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="activities.length === 0">
                    <td class="px-3 py-2 text-gray-500" colspan="6">No hay actividades registradas.</td>
                  </tr>
                  <tr v-for="act in activities" :key="act.id">
                    <td class="px-3 py-2">{{ act.tarea || act.titulo || act.name || '-' }}</td>
                    <td class="px-3 py-2">{{ act.fecha_inicio || '-' }}</td>
                    <td class="px-3 py-2">{{ act.fecha_fin || '-' }}</td>
                    <td class="px-3 py-2">{{ act.diasEjecutados || 0 }}</td>
                    <td class="px-3 py-2">{{ act.diasProgramado || 0 }}</td>
                    <td class="px-3 py-2">{{ act.status || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Sección de Descuentos -->
          <div class="mb-6">
            <h3 class="text-sm font-semibold text-gray-800 mb-2">Descuentos</h3>
            <div class="overflow-x-auto max-h-40 border rounded-md">
              <table class="min-w-full text-sm text-left">
                <thead class="bg-gray-100 sticky top-0">
                  <tr>
                    <th class="px-3 py-2">Concepto</th>
                    <th class="px-3 py-2">Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="descuentos.length === 0">
                    <td class="px-3 py-2 text-gray-500" colspan="2">No hay descuentos registrados.</td>
                  </tr>
                  <tr v-for="(d, idx) in descuentos" :key="d.key" :class="d.key === 'incLab' ? 'bg-red-50' : ''">
                    <td class="px-3 py-2" :class="d.key === 'incLab' ? 'font-medium text-red-600' : ''">{{ d.label }}</td>
                    <td class="px-3 py-2" :class="d.key === 'incLab' ? 'text-red-600' : ''">
                      <template v-if="d.key === 'incLab'">{{ Math.max(0, Math.round(d.cantidad || 0)) }}</template>
                      <template v-else>
                        <input v-if="canEditDiscount" type="number" step="0.01" min="0" v-model.number="descuentos[idx].cantidad"
                            class="w-28 border rounded px-2 py-1 text-sm" />
                        <span v-else>{{ d.cantidad }}</span>
                      </template>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="flex justify-end mt-3">
              <button v-if="canEditDiscount" @click="saveDiscounts(selectedTramite?.id)" :disabled="loading"
                      class="px-4 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                Guardar descuentos
              </button>
            </div>
          </div>

          <!-- Campo de Observaciones -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Observaciones <span class="text-red-500">*</span>
            </label>
            <textarea v-model="observaciones" rows="3"
                      placeholder="Ingrese sus observaciones (requeridas para rechazo)..."
                      class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
          </div>

          <!-- Botones del modal -->
          <div class="flex justify-end space-x-3">
            <button @click="closeModal"
                    class="px-4 py-2 text-sm bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200">
              Cancelar
            </button>
            <button @click="rechazarTramite(selectedTramite?.id)" :disabled="loading"
                    class="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-400 rounded-md">
              <span v-if="loading">Procesando...</span>
              <span v-else>Rechazar</span>
            </button>
            <button @click="aprobarTramite(selectedTramite?.id)" :disabled="loading"
                    class="px-4 py-2 text-sm text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 rounded-md">
              <span v-if="loading">Procesando...</span>
              <span v-else>Aprobar</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  `
});
app.mount('#tramites-app');