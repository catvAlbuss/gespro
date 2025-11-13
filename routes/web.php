<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Auth;

/*
|--------------------------------------------------------------------------
| CONTROLADORES IMPORTADOS
|--------------------------------------------------------------------------
*/
use App\Http\Controllers\{
    ProfileController,
    UserController,
    EmpresaController,
    ProyectoController,
    TrabajadorController,
    NotificationController
};

use App\Http\Controllers\admingestController;
use App\Http\Controllers\permissionController;
use App\Http\Controllers\RoleController;

// Controladores de Calendario y Tareas
use App\Http\Controllers\{
    CalendarioJefesController,
    CalendariotrabajadorController,
    CalendarioTrabajadoresController,
    TareasController,
    KanbanController
};

// Controladores de Logística e Inventario
use App\Http\Controllers\{
    RequerimientoController,
    InventarioController,
    valesequipoentregaController
};

// Controladores de Contabilidad y Finanzas
use App\Http\Controllers\{
    ContabilidadController,
    TramitesController,
    enviarCotizacionController
};

// Controladores de Actividades y Reportes
use App\Http\Controllers\{
    actividadespersonalController,
    ReportetrabajadorController,
    informesController
};

// Controladores de Construcción y Metrados
use App\Http\Controllers\{
    CostosController,
    PresupuestosController,
    MetradoarquitecturaController,
    metradosanitariasController,
    metradoelectricasController,
    metradocomunicacionController,
    metradogasController,
    metradoestructurasController,
    instalacionSanitariaController
};

// Controladores de Especificaciones y Cronogramas
use App\Http\Controllers\{
    EspecificacionesTecnicasController,
    CronogramaController,
    DashboardController,
    GastoGeneralController,
    InsumosAcuController,
    SessionController
};

// Controladores de Campo
use App\Http\Controllers\{
    MantenimientoCampoController,
    valorizacionCampoController
};

// Controladores DML
use App\Http\Controllers\dml\{
    EditorController,
    memoriaCalculo
};

/*
|--------------------------------------------------------------------------
| RUTAS PÚBLICAS
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return view('welcome');
});

/*
|--------------------------------------------------------------------------
| RUTAS DE AUTENTICACIÓN
|--------------------------------------------------------------------------
*/
require __DIR__ . '/auth.php';

/*
|--------------------------------------------------------------------------
| RUTAS DE RECURSOS ESTÁTICOS (Imágenes y Archivos)
|--------------------------------------------------------------------------
*/
Route::prefix('storage')->group(function () {
    // Imágenes de perfil
    Route::get('/profile/{filename}', function ($filename) {
        $path = public_path('storage/profile/' . $filename);
        if (!File::exists($path)) {
            return response()->json(['message' => 'Imagen no encontrada.'], 404);
        }
        return Response::make(File::get($path), 200)
            ->header("Content-Type", File::mimeType($path));
    });

    // Firmas
    Route::get('/firmas/{filename}', function ($filename) {
        $path = storage_path('app/public/firmas/' . $filename);
        if (!file_exists($path)) {
            abort(404);
        }
        return response()->file($path, [
            'Content-Type' => 'image/png',
            'Cache-Control' => 'public, max-age=3600'
        ]);
    })->name('get.firma');
});

/*
|--------------------------------------------------------------------------
| RUTAS AUTENTICADAS Y VERIFICADAS
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified', 'check.session'])->group(function () {

    /*
    |--------------------------------------------------------------------------
    | DASHBOARD PRINCIPAL
    |--------------------------------------------------------------------------
    */
    Route::get('/dashboard', function () {
        $user = Auth::user();

        if (!$user) {
            return redirect()->route('login');
        }

        // Mapear roles a rutas específicas
        $roleRoutes = [
            1 => 'admin.dashboard',
            2 => 'manager.dashboard',
            3 => 'administradores.dashboard',
            4 => 'logistico.dashboard',
            5 => 'jefe.dashboard',
            6 => 'trabajador.dashboard',
        ];

        $roleId = $user->roles->first()->id ?? null;

        if (!$roleId || !isset($roleRoutes[$roleId])) {
            Auth::logout();
            return redirect()->route('login')->with('error', 'Rol no válido o sin permisos.');
        }

        return redirect()->route($roleRoutes[$roleId]);
    })->name('dashboard');


    Route::get('/check-session', [SessionController::class, 'checkSession']);
    Route::post('/ping-session', [SessionController::class, 'pingSession']);
    Route::get('/dashboard/stats/{id}', [DashboardController::class, 'getStats']);
    Route::get('/asistencias/ultima/{id}', [DashboardController::class, 'getUltimaAsistencia']);

    /*
    |--------------------------------------------------------------------------
    | DASHBOARDS POR ROL
    |--------------------------------------------------------------------------
    */
    Route::middleware('role.redirect')->group(function () {

        // Dashboard Administrador
        Route::get('/admin/dashboard', function () {
            return view('gestor_vista.Administrador.AdministradorGeneral');
        })->name('admin.dashboard');

        // Dashboard Gerente
        Route::get('/manager/dashboard', function () {
            return view('gestor_vista.Gerencia.GerenteGeneral');
        })->name('manager.dashboard');

        // Dashboard Administrador/Contabilidad
        Route::get('/administradores/dashboard', function () {
            $empresaId = session('empresa_id');
            $empresas = Auth::user()->empresas;

            if ($empresas->count() == 1) {
                $empresaId = $empresas->first()->id;
                session()->forget('empresa_id');
                return view('gestor_vista.AdmContabilidad.gestor_admCon', compact('empresaId'));
            }

            if ($empresas->count() > 1) {
                $empresasArray = $empresas->toArray();
                $empresaId = count($empresasArray) > 1 ? null : ($empresasArray[0]['id'] ?? null);
                return view('gestor_vista.AdmContabilidad.index', compact('empresasArray', 'empresaId'));
            }

            return redirect()->route('crear.empresa')->with('error', 'No tienes empresas registradas.');
        })->name('administradores.dashboard');

        // Dashboard Logístico
        Route::get('/logistico/dashboard', function () {
            $empresaId = session('empresa_id');
            $empresas = Auth::user()->empresas;

            if ($empresas->count() == 1) {
                $empresaId = $empresas->first()->id;
                session()->forget('empresa_id');
                return view('gestor_vista.Logistico.panelLogisctico', compact('empresaId'));
            }

            if ($empresas->count() > 1) {
                $empresaId = count($empresas) > 1 ? null : ($empresas->first()->id ?? null);
                return view('gestor_vista.Logistico.gestor_logistico', [
                    'empresasArray' => $empresas,
                    'empresaId' => $empresaId
                ]);
            }

            return redirect()->route('crear.empresa')->with('error', 'No tienes empresas registradas.');
        })->name('logistico.dashboard');

        // Dashboard Jefe de Área
        Route::get('/jefe/dashboard', function () {
            $empresaId = session('empresa_id');
            return view('gestor_vista.Jefe.JefesArea', compact('empresaId'));
        })->name('jefe.dashboard');

        // Dashboard Trabajador
        Route::get('/trabajador/dashboard', function () {
            $empresaId = session('empresa_id');
            return view('gestor_vista.Trabajador.panelTrabajadores', compact('empresaId'));
        })->name('trabajador.dashboard');

        // Home
        Route::get('/home', function () {
            return view('home');
        })->name('home');
    });

    /*
    |--------------------------------------------------------------------------
    | GESTIÓN DE PERMISOS Y ROLES
    |--------------------------------------------------------------------------
    */
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::resource('permissions', PermissionController::class);
        Route::resource('roles', RoleController::class);
        Route::resource('users', UserController::class);
    });

    /*
    |--------------------------------------------------------------------------
    | GESTIÓN DE EMPRESAS
    |--------------------------------------------------------------------------
    */
    Route::prefix('empresas')->name('empresas.')->group(function () {
        Route::resource('/', EmpresaController::class)->parameters(['' => 'empresa']);
        Route::post('/obtener-data', [EmpresaController::class, 'obtenerDataEmpresa'])->name('obtenerDataEmpresa');
    });

    /*
    |--------------------------------------------------------------------------
    | GESTIÓN ADMINISTRATIVA
    |--------------------------------------------------------------------------
    */
    Route::prefix('gestion')->name('gestion.')->group(function () {
        Route::post('admingest', [admingestController::class, 'index'])->name('admingest');
        Route::post('adminpanel', [admingestController::class, 'indexadm'])->name('adminpanel');

        // Vistas de gestión
        Route::get('admon/{id}/{razonSocial}', function ($id, $razonSocial) {
            return view('gestor_vista.Administrador.Gestor_general', compact('id', 'razonSocial'));
        })->name('admon');

        Route::get('admin/{id}', function ($id) {
            return view('gestor_vista.Administrador.Gestor_admin', compact('id'));
        })->name('admin');

        Route::get('contabilidad/{id}', function ($id) {
            return view('gestor_vista.Administrador.Gestor_contabilidad', compact('id'));
        })->name('contabilidad');
    });

    /*
    |--------------------------------------------------------------------------
    | CONTABILIDAD Y BALANCES
    |--------------------------------------------------------------------------
    */
    Route::prefix('contabilidad')->name('contabilidad.')->group(function () {
        Route::resource('/', ContabilidadController::class)->parameters(['' => 'contabilidad']);

        Route::get('balances/{empresaId}', [ContabilidadController::class, 'index'])->name('balances');
        Route::get('balance/{id}', [ContabilidadController::class, 'show'])->name('balance.show');
        Route::get('redirect-balance/{id}', [ContabilidadController::class, 'redirectWithData'])->name('redirect');

        // Operaciones con balances
        Route::post('actualizar-balance-real', [ContabilidadController::class, 'updatebalancereal'])->name('balance.real.update');
        Route::post('obtener-balance-real', [ContabilidadController::class, 'obtenerBalance'])->name('balance.real.get');
        Route::post('obtener-listado-balance', [ContabilidadController::class, 'listarBalancesFinan'])->name('balance.list');
        Route::post('obtener-resumen-balances', [ContabilidadController::class, 'getResumBalances'])->name('balance.resumen');
        Route::post('actualizar-balance-programado', [ContabilidadController::class, 'updatebalanceprogramado'])->name('balance.programado.update');
        Route::post('obtener-balance-programado', [ContabilidadController::class, 'obtenerBalanceProgramado'])->name('balance.programado.get');
    });

    /*
    |--------------------------------------------------------------------------
    | INFORMES
    |--------------------------------------------------------------------------
    */
    Route::get('informes/contabilidad/{empresaId}', [informesController::class, 'getInformesPersonalEmpresa'])
        ->name('informes.contabilidad');

    /*
    |--------------------------------------------------------------------------
    | PROYECTOS
    |--------------------------------------------------------------------------
    */
    Route::prefix('proyectos')->name('proyectos.')->group(function () {
        Route::resource('/', ProyectoController::class)->parameters(['' => 'proyecto']);

        Route::get('empresa/{empresaId}', [ProyectoController::class, 'index'])->name('empresa');
        Route::get('redirect/{id}/{empresa_id}', [ProyectoController::class, 'redirectProyecto'])->name('redirect');
        Route::get('gestor/{id}', function ($id) {
            return view('gestor_vista.Administrador.Gestor_Proyectos', compact('id'));
        })->name('gestor');
        Route::get('gestor-ges/{id}', function ($id) {
            return view('gestor_vista.Administrador.Gestor_Proyectos_ges', compact('id'));
        })->name('gestor.ges');

        // Operaciones con proyectos
        Route::post('actualizar-porcentaje', [ProyectoController::class, 'actualizarPorcentaje'])->name('actualizar.porcentaje');
        Route::post('actualizar-documento', [ProyectoController::class, 'actualizarDocumentoProyecto'])->name('actualizar.documento');
        Route::put('actualizar-presupuesto', [ProyectoController::class, 'actualizar_presupuesto_proyecto'])->name('actualizar.presupuesto');
        Route::put('actualizar-inversion', [ProyectoController::class, 'actualizar_inversion'])->name('actualizar.inversion');
        Route::post('/actualizardata', [ProyectoController::class, 'actualizarDocumentoProyecto']);
        // Reportes
        Route::get('reportes/{empresaId}', [ProyectoController::class, 'reports_proyectos'])->name('reportes');
        Route::post('reporte-detalles', [ProyectoController::class, 'reporteDetalles'])->name('reporte.detalles');
    });

    /*
    |--------------------------------------------------------------------------
    | PERSONAL Y TRABAJADORES
    |--------------------------------------------------------------------------
    */
    Route::prefix('personal')->name('personal.')->group(function () {
        Route::resource('trabajadores', TrabajadorController::class);

        Route::get('registrarpersonal/{empresaId}', [TrabajadorController::class, 'index'])->name('registrar');
        Route::get('gestor/{id}', function ($id) {
            return view('gestor_vista.Administrador.Gestor_personal_general', compact('id'));
        })->name('gestor');
        // Accept GET and POST to avoid MethodNotAllowed errors when a GET hits this URL
        Route::match(['get', 'post'], 'obtener-dni', [TrabajadorController::class, 'obtenerUsuarioDNI'])->name('obtener.dni');
    });

    /*

    |--------------------------------------------------------------------------
    | ACTIVIDADES Y TAREAS
    |--------------------------------------------------------------------------
    */
    Route::prefix('actividades')->name('actividades.')->group(function () {
        Route::resource('/', actividadespersonalController::class)->parameters(['' => 'actividad']);

        Route::get('trabajadores/{empresaId}', [actividadespersonalController::class, 'listar_trabajador'])->name('trabajadores');
        Route::get('proyectos/{empresaId}', [actividadespersonalController::class, 'listar_proyectos'])->name('proyectos');
        Route::post('actualizar-columna/{taskId}', [actividadespersonalController::class, 'update_colum_task'])->name('actualizar.columna');
        Route::post('actualizar-fichas/{taskId}', [actividadespersonalController::class, 'update_fichas'])->name('actualizar.fichas');
        Route::post('exportar', [actividadespersonalController::class, 'exportarIp'])->name('exportar');
        Route::post('update-elapsed-time/{id}', [actividadespersonalController::class, 'actividadPersonal'])->name('update.elapsed');
        Route::get('cron/update-elapsed', [actividadespersonalController::class, 'updateElapsedTime'])->name('cron.elapsed');

        // Listado de tareas
        Route::get('listar/{idtrabajador}', [actividadespersonalController::class, 'listartarea'])->name('listar');
        Route::post('actualizar-status/{idTarea}/{status}', [actividadespersonalController::class, 'actualizarStatusUser'])->name('actualizar.status');
        Route::get('doing/{empresaId}', [actividadespersonalController::class, 'listartareajefes'])->name('doing');

        // Kanban
        Route::get('kanban/{id}', function ($id) {
            return view('gestor_vista.Administrador.gestion_tareasPHHA', compact('id'));
        })->name('kanban');
        Route::get('kanban/gestor/{id}', [KanbanController::class, 'show'])->name('kanban.gestor');
        Route::resource('kanban', KanbanController::class);
        Route::put('kanban/move/{id}', [KanbanController::class, 'move'])->name('kanban.move');
    });

    /*
    |--------------------------------------------------------------------------
    | CALENDARIOS
    |--------------------------------------------------------------------------
    */
    Route::prefix('calendarios')->name('calendarios.')->group(function () {
        // Calendario trabajador
        //Route::get('trabajador/{id}', [CalendariotrabajadorController::class, 'show'])->name('trabajador.show');
        Route::resource('trabajador', CalendariotrabajadorController::class);

        // Calendario jefes
        Route::resource('jefes', CalendarioJefesController::class);
        Route::post('registrar-tarea', [TareasController::class, 'store'])->name('tarea.registrar');

        // Calendario trabajadores (plural)
        Route::get('trabajadores/{empresaId}/{trabajadorId}', [CalendarioTrabajadoresController::class, 'show'])->name('trabajadores.show');
        Route::post('registrar-asistencia', [CalendarioTrabajadoresController::class, 'store'])->name('asistencia.registrar');
        Route::get('asistencia/{empresaId}/{trabajadorId}', [CalendarioTrabajadoresController::class, 'listarAsistenciaUser'])->name('asistencia.listar');
        Route::get('tareas/{trabajadorId}', [CalendarioTrabajadoresController::class, 'listarTareasUser'])->name('tareas.listar');
    });

    /*
    |--------------------------------------------------------------------------
    | REPORTES
    |--------------------------------------------------------------------------
    */
    Route::prefix('reportes')->name('reportes.')->group(function () {
        Route::resource('/', ReportetrabajadorController::class)->parameters(['' => 'reporte']);


        Route::get('general/{id}', [ReportetrabajadorController::class, 'show'])->name('general');
        Route::get('general/{empresaId}/datos', [ReportetrabajadorController::class, 'reporteMensual']);
        Route::get('general/{empresaId}/datos/proyecto', [ReportetrabajadorController::class, 'reporteMensualPorProyecto']);

        Route::post('tareas-ip', [ReportetrabajadorController::class, 'obtenerTareasIp'])->name('tareas.ip');
        Route::post('tareas-mensual', [ReportetrabajadorController::class, 'obtenerTareasMensual'])->name('tareas.mensual');
        Route::post('tareas-semanal', [ReportetrabajadorController::class, 'obtenerTareasSemanal'])->name('tareas.semanal');
        Route::post(
            'asistencia/{empresaId}/{mes_reporte_asistencia}/{anio_reporte_asistencia?}',
            [ReportetrabajadorController::class, 'listarAsistenciatrabajador']
        )->name('asistencia');

        // Tareas revisión
        Route::get('tareas-revision/{empresaId}/{id_tarea?}', [ReportetrabajadorController::class, 'vistaTareas'])->name('tareas.revision');
    });

    /*
    |--------------------------------------------------------------------------
    | TRÁMITES
    |--------------------------------------------------------------------------
    */
    Route::prefix('tramites')->name('tramites.')->group(function () {
        Route::get('/', [TramitesController::class, 'index'])->name('index');
        Route::get('empresa/{empresa_id}', function ($empresa_id) {
            return view('gestor_vista.contabilidad.tramites.tramites', compact('empresa_id'));
        })->where('empresa_id', '[0-9]+')->name('empresa');

        Route::get('{empresaId}', function ($empresaId) {
            return view('gestor_vista.contabilidad.tramites.tramites', compact('empresaId'));
        })->name('view');

        // Operaciones con trámites
        Route::post('/', [TramitesController::class, 'store'])->name('store');
        Route::get('{tramite}', [TramitesController::class, 'show'])->name('show');
        Route::post('{tramite}/aprobar', [TramitesController::class, 'aprobar'])->name('aprobar');
        Route::post('{tramite}/rechazar', [TramitesController::class, 'rechazar'])->name('rechazar');
        Route::post('{tramite}/reenviar', [TramitesController::class, 'reenviar'])->name('reenviar');

        // Estadísticas y datos
        Route::get('estadisticas', [TramitesController::class, 'estadisticas'])->name('estadisticas');
        Route::post('actividad-personal', [TramitesController::class, 'getDataActivityPersonalMount'])->name('actividad.personal');
        Route::post('informe-pago', [TramitesController::class, 'getDataInformePago'])->name('informe.pago');
        Route::post('guardar-descuentos', [TramitesController::class, 'updateBonificacionDescuento'])->name('guardar.descuentos');

        // Perfil de usuario
        Route::post('user-profile', [TramitesController::class, 'getUserProfile'])->name('user.profile');
    });

    /*
    |--------------------------------------------------------------------------
    | NOTIFICACIONES
    |--------------------------------------------------------------------------
    */
    Route::prefix('notificaciones')->name('notificaciones.')->group(function () {
        Route::post('{id}/marcar-leida', [NotificationController::class, 'markAsRead'])->name('marcar.leida');
        Route::post('marcar-todas-leidas', [NotificationController::class, 'markAllAsRead'])->name('marcar.todas');
        Route::get('count-requerimientos', [actividadespersonalController::class, 'countRequerimientoAdmin'])->name('count.requerimientos');
    });

    /*
    |--------------------------------------------------------------------------
    | LOGÍSTICA Y REQUERIMIENTOS
    |--------------------------------------------------------------------------
    */
    Route::prefix('logistica')->name('logistica.')->group(function () {
        Route::get('general/{empresaId}', function ($empresaId) {
            return view('gestor_vista.Administrador.Gestor_Glogistica', compact('empresaId'));
        })->name('general');

        Route::get('requerimientos/gestor/{empresaId}', [RequerimientoController::class, 'show'])->name('requerimientos.gestor');
        Route::get('requerimientos/crearreque/{empresaId}', [RequerimientoController::class, 'createrequerimiento'])->name('requerimientos.crearreque');
        //Route::post('requerimientos/registrar', [RequerimientoController::class, 'store'])->name('requerimientos.registrar');
        Route::resource('requerimientos', RequerimientoController::class);

        // Operaciones con requerimientos
        Route::put('requerimientos/mano-obra/{id_mano_obra}', [RequerimientoController::class, 'actualizarmanoObra'])->name('requerimientos.mano.obra.actualizar');
        Route::delete('requerimientos/mano-obra/{id}', [RequerimientoController::class, 'eliminarmanoObra'])->name('requerimientos.mano.obra.eliminar');
        Route::put('requerimientos/material/{id_materiales_req}', [RequerimientoController::class, 'actualizarmaterial'])->name('requerimientos.material.actualizar');
        Route::delete('requerimientos/materiales/{id}', [RequerimientoController::class, 'eliminarmateriales'])->name('requerimientos.material.eliminar');
        Route::put('requerimientos/deposito/{id_depositoreq}', [RequerimientoController::class, 'actualizardeposito'])->name('requerimientos.deposito.actualizar');
        Route::post('requerimientos/aprobar/{id}', [RequerimientoController::class, 'aprobar'])->name('requerimientos.aprobar');
        Route::post('requerimientos/pendiente/{id}', [RequerimientoController::class, 'pendiente'])->name('requerimientos.pendiente');
        Route::delete('requerimientos/eliminar/{id}', [RequerimientoController::class, 'eliminar'])->name('requerimientos.eliminar');
        Route::post('requerimientos/sustento/{id}', [RequerimientoController::class, 'actualizarsustento'])->name('requerimientos.sustento');
    });

    /*
    |--------------------------------------------------------------------------
    | INVENTARIOS
    |--------------------------------------------------------------------------
    */
    Route::prefix('inventarios')->name('inventarios.')->group(function () {
        Route::resource('/', InventarioController::class)->parameters(['' => 'inventario']);

        Route::get('principal/{empresaId}', [InventarioController::class, 'show'])->name('principal');
        Route::get('detalle/{id_gestion_inv}', [InventarioController::class, 'showInventario'])->name('detalle');
        Route::post('registrar-excel', [InventarioController::class, 'insertarexcel'])->name('registrar.excel');
        Route::put('editar/{id}', [InventarioController::class, 'editinventario'])->name('editar');
        Route::delete('eliminar/{id}', [InventarioController::class, 'destroyinventario'])->name('eliminar');
    });

    /*
    |--------------------------------------------------------------------------
    | VALES DE ENTREGA DE EQUIPOS
    |--------------------------------------------------------------------------
    */
    Route::prefix('vales')->name('vales.')->group(function () {
        Route::resource('entrega', valesequipoentregaController::class);

        Route::get('gestor/{empresaId}', [valesequipoentregaController::class, 'redireccionvalesentregas'])->name('gestor');
        Route::get('productos/{empresaId}', [valesequipoentregaController::class, 'getProductos'])->name('productos');
        Route::get('buscar', [valesequipoentregaController::class, 'searchVales'])->name('buscar');
        Route::get('trabajador/{trabajadorId}', [valesequipoentregaController::class, 'listadoEquipos'])->name('trabajador');
    });

    /*
    |--------------------------------------------------------------------------
    | COTIZACIONES
    |--------------------------------------------------------------------------
    */
    Route::post('cotizaciones/enviar', [enviarCotizacionController::class, 'enviarCotizacion'])->name('cotizaciones.enviar');

    /*
    |--------------------------------------------------------------------------
    | CAMPO Y MANTENIMIENTO
    |--------------------------------------------------------------------------
    */
    Route::prefix('campo')->name('campo.')->group(function () {
        Route::get('principal/{empresaId}', function ($empresaId) {
            return view('gestor_vista.Campo.index', compact('empresaId'));
        })->name('principal');

        Route::resource('mantenimiento', MantenimientoCampoController::class);
        Route::put('mantenimiento/guardar', [MantenimientoCampoController::class, 'guardar_mantenimiento'])->name('mantenimiento.guardar');

        // Valorización
        Route::resource('valorizacion', valorizacionCampoController::class);
        Route::get('valorizacion/redirigir/{empresaId}', [valorizacionCampoController::class, 'rederigircampoval'])->name('valorizacion.redirigir');
        Route::put('valorizacion/actualizar', [valorizacionCampoController::class, 'actualizarvalorizaciones'])->name('valorizacion.actualizar');
    });

    /*
    |--------------------------------------------------------------------------
    | CONSTRUCCIÓN - CONSTRUYE HC
    |--------------------------------------------------------------------------
    */
    Route::prefix('construye')->name('construye.')->group(function () {
        Route::get('principal/{empresaId}', function ($empresaId) {
            return view('gestor_vista.Construyehc.index', compact('empresaId'));
        })->name('principal');

        // Instalaciones Sanitarias
        Route::get('sanitarias/{empresaId}', function ($empresaId) {
            return view('gestor_vista.Construyehc.Sanitarias.instalacionS', compact('empresaId'));
        })->name('sanitarias');
        Route::post('sanitarias/calcular', [instalacionSanitariaController::class, 'sanitarias'])->name('sanitarias.calcular');
        Route::get('sanitarias/controller', [instalacionSanitariaController::class, 'sanitarias'])->name('sanitarias.controller');

        // Cisterna
        Route::get('cisterna/{empresaId}', function ($empresaId) {
            return view('gestor_vista.Construyehc.Sanitarias.gestorcisternaeternit', compact('empresaId'));
        })->name('cisterna');

        // Tanque
        Route::get('tanque/{empresaId}', function ($empresaId) {
            return view('gestor_vista.Construyehc.Sanitarias.gestortanaqueeternit', compact('empresaId'));
        })->name('tanque');
    });

    /*
    |--------------------------------------------------------------------------
    | METRADOS
    |--------------------------------------------------------------------------
    */
    Route::prefix('metrados')->name('metrados.')->group(function () {
        // Arquitectura
        Route::resource('arquitectura', MetradoarquitecturaController::class);
        Route::post('arquitectura/actualizar', [MetradoarquitecturaController::class, 'actualizar_data_arquitectura'])->name('arquitectura.actualizar');

        // Sanitarias
        Route::resource('sanitarias', metradosanitariasController::class);
        Route::post('sanitarias/actualizar', [metradosanitariasController::class, 'actualizar_data_sanitarias'])->name('sanitarias.actualizar');

        // Eléctricas
        Route::resource('electricas', metradoelectricasController::class);
        Route::post('electricas/actualizar', [metradoelectricasController::class, 'actualizar_data_electricas'])->name('electricas.actualizar');

        // Comunicación
        Route::resource('comunicacion', metradocomunicacionController::class);
        Route::post('comunicacion/actualizar', [metradocomunicacionController::class, 'actualizar_data_comunicacion'])->name('comunicacion.actualizar');

        // Gas
        Route::resource('gas', metradogasController::class);
        Route::post('gas/actualizar', [metradogasController::class, 'actualizar_data_gas'])->name('gas.actualizar');

        // Estructuras
        Route::resource('estructuras', metradoestructurasController::class);
        Route::post('estructuras/actualizar', [metradoestructurasController::class, 'actualizar_data_estructuras'])->name('estructuras.actualizar');
    });

    /*
    |--------------------------------------------------------------------------
    | PRESUPUESTOS Y COSTOS revisar 403, error kanban, tramites, al inicio se va a otro  www.dominio/dashboard, pero la ruta es trabajador/dashboard
    |--------------------------------------------------------------------------
    */
    Route::prefix('presupuestos')->name('presupuestos.')->group(function () {
        Route::resource('/', PresupuestosController::class)->parameters(['' => 'presupuesto']);
        Route::get('detalle/{id}', [PresupuestosController::class, 'show'])->name('detalle');

        Route::post('listar', [PresupuestosController::class, 'index'])->name('listar');
        Route::post('obtener-metrados', [PresupuestosController::class, 'obtenerMetrados'])->name('obtener.metrados');
        Route::post('actualizar-metrados', [PresupuestosController::class, 'actualizarMetrados'])->name('actualizar.metrados');
        Route::post('obtener-completo', [PresupuestosController::class, 'obtenerPresupuestoMOMAEQCompleto'])->name('obtener.completo');
    });

    Route::prefix('costos')->name('costos.')->group(function () {
        Route::resource('/', CostosController::class)->parameters(['' => 'costo'])->except(['show']);;
        Route::post('control', [CostosController::class, 'showSecure'])->name('control');
    });

    /*
    |--------------------------------------------------------------------------
    | INSUMOS
    |--------------------------------------------------------------------------
    */
    Route::prefix('insumos')->name('insumos.')->group(function () {
        Route::resource('/', InsumosAcuController::class)->parameters(['' => 'insumo']);

        Route::get('indice/{empresaId}', function ($empresaId) {
            return view('gestor_vista.Construyehc.presupuestos.insumos.indice', compact('empresaId'));
        })->name('indice');

        // Índices
        Route::get('indices', [InsumosAcuController::class, 'indexIndices'])->name('indices.index');
        Route::post('indices', [InsumosAcuController::class, 'storeIndices'])->name('indices.store');
        Route::put('indices/{id}', [InsumosAcuController::class, 'updateIndices'])->name('indices.update');
        Route::delete('indices/{id}', [InsumosAcuController::class, 'destroyIndices'])->name('indices.destroy');

        // Listados y búsquedas
        Route::get('listar-indice', [InsumosAcuController::class, 'listar_indice'])->name('listar.indice');
        Route::get('listar-codigo', [InsumosAcuController::class, 'codigoInsumos'])->name('listar.codigo');
        Route::get('tipo/{selectedTipoInsumo}', [InsumosAcuController::class, 'buscartipoinsumo'])->name('tipo.buscar');
        Route::get('detalles/{id}', [InsumosAcuController::class, 'getDetailsById'])->name('detalles');
        Route::post('agregar-detalles', [InsumosAcuController::class, 'agregardetallesAcus'])->name('agregar.detalles');

        // Exportaciones
        Route::post('exportar', [InsumosAcuController::class, 'exportarinsumo'])->name('exportar');
        Route::post('exportar-tipo', [InsumosAcuController::class, 'exportartipoinsumo'])->name('exportar.tipo');
        Route::post('exportar-gastos', [InsumosAcuController::class, 'exportarGastosGenerales'])->name('exportar.gastos');
    });

    /*
    |--------------------------------------------------------------------------
    | GASTOS GENERALES
    |--------------------------------------------------------------------------
    */
    Route::prefix('gastos-generales')->name('gastos.')->group(function () {
        Route::post('obtener-costo-directo', [GastoGeneralController::class, 'obtenerCostoDirecto'])->name('costo.directo');
        Route::post('obtener-metrados', [GastoGeneralController::class, 'getDataTotalMetrados'])->name('obtener.metrados');

        // Remuneraciones
        Route::post('remuneraciones/guardar/{id}', [GastoGeneralController::class, 'guardarRemuneraciones'])->name('remuneraciones.guardar');
        Route::post('remuneraciones/obtener', [GastoGeneralController::class, 'ObtenerRemuneraciones'])->name('remuneraciones.obtener');

        // Gastos Fijos
        Route::post('fijos/guardar/{id}', [GastoGeneralController::class, 'guardarGastosFijos'])->name('fijos.guardar');
        Route::post('fijos/obtener', [GastoGeneralController::class, 'ObtenerGastosFijos'])->name('fijos.obtener');

        // Gastos Generales
        Route::post('generales/guardar/{id}', [GastoGeneralController::class, 'guardarGastosGenerales'])->name('generales.guardar');
        Route::post('generales/obtener', [GastoGeneralController::class, 'ObtenerGastosGenerales'])->name('generales.obtener');

        // Supervisión
        Route::post('supervision/guardar/{id}', [GastoGeneralController::class, 'guardarGastosSupervision'])->name('supervision.guardar');
        Route::post('supervision/obtener', [GastoGeneralController::class, 'ObtenerGastosSupervision'])->name('supervision.obtener');

        // Control Concurrente
        Route::post('control/guardar/{id}', [GastoGeneralController::class, 'guardarControlConcurrente'])->name('control.guardar');
        Route::post('control/obtener', [GastoGeneralController::class, 'ObtenerControlConcurrente'])->name('control.obtener');

        // Consolidado
        Route::post('consolidado/guardar/{id}', [GastoGeneralController::class, 'guardarConsolidado'])->name('consolidado.guardar');
        Route::post('consolidado/obtener', [GastoGeneralController::class, 'ObtenerConsolidado'])->name('consolidado.obtener');
    });

    /*
    |--------------------------------------------------------------------------
    | ESPECIFICACIONES TÉCNICAS (ETTP)
    |--------------------------------------------------------------------------
    */
    Route::prefix('especificaciones')->name('especificaciones.')->group(function () {
        Route::resource('/', EspecificacionesTecnicasController::class)->parameters(['' => 'especificacion']);

        Route::post('obtener-metrados', [EspecificacionesTecnicasController::class, 'obtenerMetradosEttp'])->name('obtener.metrados');
        Route::post('obtener-data', [EspecificacionesTecnicasController::class, 'getDataETTP'])->name('obtener.data');
        Route::post('guardar/{id}', [EspecificacionesTecnicasController::class, 'updateETTP'])->name('guardar');
    });

    /*
    |--------------------------------------------------------------------------
    | CRONOGRAMAS Y DIAGRAMAS DE GANTT
    |--------------------------------------------------------------------------
    */
    Route::prefix('cronogramas')->name('cronogramas.')->group(function () {
        Route::resource('/', CronogramaController::class)->parameters(['' => 'cronograma']);

        Route::post('obtener', [CronogramaController::class, 'obtenerCronogramaGantt'])->name('obtener');
        Route::post('guardar/{id}', [CronogramaController::class, 'saveDataCronograma'])->name('guardar');
        Route::post('importar-msproject', [CronogramaController::class, 'importMsProject'])->name('importar.msproject');
        Route::post('exportar-pdf', [CronogramaController::class, 'exportarGanttPDF'])->name('exportar.pdf');
    });

    /*
    |--------------------------------------------------------------------------
    | PROGRAMAS GESPRO
    |--------------------------------------------------------------------------
    */
    Route::prefix('programas-gespro')->name('programas.')->group(function () {
        Route::get('portada/{empresaId}', function ($empresaId) {
            return view('gestor_vista.programasgespro.portadaprogramas', compact('empresaId'));
        })->name('portada');

        Route::get('calculo-agua/{empresaId}', function ($empresaId) {
            return view('gestor_vista.programasgespro.agua', compact('empresaId'));
        })->name('agua');

        Route::get('calculo-desague/{empresaId}', function ($empresaId) {
            return view('gestor_vista.programasgespro.desague', compact('empresaId'));
        })->name('desague');

        Route::get('calculo-aire/{empresaId}', function ($empresaId) {
            return view('gestor_vista.programasgespro.aireacondicionado', compact('empresaId'));
        })->name('aire');

        Route::get('calculo-tension/{empresaId}', function ($empresaId) {
            return view('gestor_vista.programasgespro.caidatension', compact('empresaId'));
        })->name('tension');

        Route::get('calculo-pozo/{empresaId}', function ($empresaId) {
            return view('gestor_vista.programasgespro.pozopararrayo', compact('empresaId'));
        })->name('pozo');

        Route::get('calculo-metrados/{empresaId}', function ($empresaId) {
            return view('gestor_vista.programasgespro.metradosBase', compact('empresaId'));
        })->name('metrados');
    });

    /*
    |--------------------------------------------------------------------------
    | DML (DOCUMENTOS Y MEMORIAS)
    |--------------------------------------------------------------------------
    */
    Route::prefix('dml')->name('dml.')->group(function () {
        Route::get('gestor/{empresaId}', function ($empresaId) {
            return view('gestor_vista.dml.index', compact('empresaId'));
        })->name('principal');

        Route::get('memoria-calculo/{empresaId}', function ($empresaId) {
            return view('gestor_vista.dml.memoriacalculo.index', compact('empresaId'));
        })->name('memoria.calculo');

        Route::post('editor', [EditorController::class, 'stard'])->name('editor');
        Route::post('memoria/pdf', [memoriaCalculo::class, 'generarPDF'])->name('memoria.pdf');
    });

    /*
    |--------------------------------------------------------------------------
    | PERFIL DE USUARIO
    |--------------------------------------------------------------------------
    */
    Route::prefix('profile')->name('profile.')->group(function () {
        Route::get('/', [ProfileController::class, 'edit'])->name('edit');
        Route::patch('/', [ProfileController::class, 'update'])->name('update');
        Route::delete('/', [ProfileController::class, 'destroy'])->name('destroy');
    });
});

/*
|--------------------------------------------------------------------------
| RUTA PARA REFRESCAR SESIÓN (API)
|--------------------------------------------------------------------------
*/
Route::post('/refresh-session', function () {
    if (Auth::check()) {
        session(['last_activity' => now()]);
        return response()->json(['success' => true, 'message' => 'Sesión refrescada']);
    }
    return response()->json(['success' => false, 'message' => 'No autenticado'], 401);
})->middleware('auth')->name('api.refresh.session');
