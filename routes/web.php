<?php

use App\Http\Controllers\actividadespersonalController;
use App\Http\Controllers\admingestController;
use App\Http\Controllers\CalendarioJefesController;
use App\Http\Controllers\CalendariotrabajadorController;
use App\Http\Controllers\CalendarioTrabajadoresController;
use App\Http\Controllers\ContabilidadController;
use App\Http\Controllers\CronogramaController;
use App\Http\Controllers\dml\EditorController;
use App\Http\Controllers\dml\memoriaCalculo;
use App\Http\Controllers\EmpresaController;
use App\Http\Controllers\enviarCotizacionController;
use App\Http\Controllers\EspecificacionesTecnicasController;
use App\Http\Controllers\GastoGeneralController;
use App\Http\Controllers\informesController;
use App\Http\Controllers\instalacionSanitariaController;
use App\Http\Controllers\InventarioController;
use App\Http\Controllers\KanbanController;
use App\Http\Controllers\MantenimientoCampoController;
use App\Http\Controllers\metradocomunicacionController;
use App\Http\Controllers\metradoestructurasController;
use App\Http\Controllers\metradogasController;
use App\Http\Controllers\metradoelectricasController;
use App\Http\Controllers\metradosanitariasController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\permissionController;
use App\Http\Controllers\PresupuestosController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProyectoController;
use App\Http\Controllers\ReportetrabajadorController;
use App\Http\Controllers\RequerimientoController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\TareasController;
use App\Http\Controllers\TrabajadorController;
use App\Http\Controllers\TramitesController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\valesequipoentregaController;
use App\Http\Controllers\valorizacionCampoController;
use App\Models\inventario;
use App\Models\valesequipoentrega;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/dashboard', function () {
    return view('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');


Route::middleware(['auth', 'role.redirect'])->group(function () {
    Route::get('/admin/dashboard', function () {
        return view('gestor_vista.Administrador.AdministradorGeneral');
    })->name('admin.dashboard')->middleware('verified');

    Route::get('/manager/dashboard', function () {
        return view('gestor_vista.Gerencia.GerenteGeneral');
    })->name('manager.dashboard')->middleware('verified');

    Route::get('/administradores/dashboard', function () {
        // Obtener el ID de la empresa desde la sesión (si existe)
        $empresaId = session('empresa_id');

        // Si no hay un ID de empresa en la sesión, asignamos un valor por defecto
        if (!$empresaId) {
            $empresaId = null;
        }

        // Obtener todas las empresas del usuario (asumimos que el usuario está asociado a varias empresas)
        $empresas = auth()->user()->empresas;

        // Si el usuario tiene una sola empresa
        if ($empresas->count() == 1) {
            // Asignamos el ID de la única empresa
            $empresaId = $empresas->first()->id;

            // Limpiar la sesión si no es necesario
            session()->forget('empresa_id');

            // Redirigir a la vista 'gestor_admCon' con el ID de la empresa
            return view('gestor_vista.AdmContabilidad.gestor_admCon', ['empresaId' => $empresaId]);
        }

        // Si tiene varias empresas, enviamos a la vista para seleccionar empresa
        if ($empresas->count() > 1) {
            // Convertir las empresas a un array simple si es necesario
            $empresasArray = $empresas->toArray();  // Convertir la colección a un array de PHP

            // Si no se ha seleccionado una empresa, no asignamos un ID
            if (count($empresasArray) > 1) {
                $empresaId = null;  // No asignamos un ID si hay más de una empresa
            } else {
                $empresaId = $empresasArray[0]['id'] ?? null;  // Si hay solo una empresa, selecciona el primer ID
            }

            // Mostrar la vista para seleccionar la empresa
            return view('gestor_vista.AdmContabilidad.index', [
                'empresasArray' => $empresasArray,  // Pasar todas las empresas
                'empresaId' => $empresaId,         // Pasar el ID de la empresa seleccionada
            ]);
        }

        // Si no tiene empresas, redirigir a la página de creación de empresa o mostrar un error
        return redirect()->route('crear.empresa')->with('error', 'No tienes empresas registradas.');
    })->name('administradores.dashboard')->middleware('verified');

    /*Route::get('/logistico/dashboard', function () {
        $empresas = session('empresa_id');

        // Convertir la colección a un array de PHP si es necesario
        $empresasArray = $empresas->toArray();  // Esto convierte la colección en un array simple

        if (count($empresasArray) > 1) {
            $empresaId = null;  // No asignamos un ID si hay más de una empresa
        } else {
            $empresaId = $empresasArray[0]['id'] ?? null;  // Si hay solo una empresa, selecciona el primer ID
        }

        return view('gestor_vista.Logistico.gestor_logistico', compact('empresaId', 'empresasArray'));
    })->name('logistico.dashboard')->middleware('verified');*/
    Route::get('/logistico/dashboard', function () {
        // Obtener el ID de la empresa desde la sesión
        $empresaId = session('empresa_id');

        // Si no hay un ID de empresa en la sesión, asignamos un valor por defecto
        if (!$empresaId) {
            $empresaId = null;
        }

        // Obtener todas las empresas del usuario
        $empresas = auth()->user()->empresas;

        // Si el usuario tiene una sola empresa
        if ($empresas->count() == 1) {
            // Asignamos el ID de la única empresa
            $empresaId = $empresas->first()->id;

            // Limpiar la sesión para evitar pasar datos no deseados
            session()->forget('empresa_id'); // Limpiar la sesión si no es necesario

            return view('gestor_vista.Logistico.panelLogisctico', ['empresaId' => $empresaId]);
        }

        // Si tiene varias empresas, enviamos a la vista del gestor logístico con todas las empresas
        if ($empresas->count() > 1) {
            if (count($empresas) > 1) {
                $empresaId = null;  // No asignamos un ID si hay más de una empresa
            } else {
                $empresaId = $empresasArray[0]['id'] ?? null;  // Si hay solo una empresa, selecciona el primer ID
            }
            return view('gestor_vista.Logistico.gestor_logistico', [
                'empresasArray' => $empresas,  // Pasar todas las empresas
                'empresaId' => $empresaId,     // Pasar el ID de la empresa seleccionada
            ]);
        }

        // Si no tiene empresas, redirigir a una página de error o de creación
        return redirect()->route('crear.empresa')->with('error', 'No tienes empresas registradas.');
    })->name('logistico.dashboard')->middleware('verified');

    Route::get('/jefe/dashboard', function () {
        $empresaId = session('empresa_id'); // Obtener el id de la empresa de la sesión
        return view('gestor_vista.Jefe.JefesArea', compact('empresaId'));
    })->name('jefe.dashboard')->middleware('verified');

    Route::get('/trabajador/dashboard', function () {
        $empresaId = session('empresa_id');
        return view('gestor_vista.Trabajador.panelTrabajadores', compact('empresaId'));
    })->name('trabajador.dashboard')->middleware('verified');

    Route::get('/home', function () {
        return view('home');
    })->name('home')->middleware('verified');
});


Route::post('gestor-admingest', [admingestController::class, 'index'])->name('gestor-admingest');
Route::post('gestor-adminpanel', [admingestController::class, 'indexadm'])->name('gestor-adminpanel');

Route::resource('permissions', PermissionController::class);
Route::resource('roles', RoleController::class);
Route::resource('users', UserController::class);
Route::resource('empresas', EmpresaController::class);

/*****************************
 *          INFORMES
 *****************************/
Route::get('gestor-informes-contabilidad/{empresaId}', [informesController::class, 'getInformesPersonalEmpresa'])->name('gestor-informes-contabilidad');

//CONTABILIDAD Y BALANCES
Route::resource('contabilidads', ContabilidadController::class);
Route::get('gestor-contabilidad-bal/{empresaId}', [ContabilidadController::class, 'index'])->name('gestor-contabilidad-bal');
Route::get('redirect-to-balance/{id}', [ContabilidadController::class, 'redirectWithData'])->name('redirectToBalance');

Route::post('empresas/obtener-data', [EmpresaController::class, 'obtenerDataEmpresa'])->name('empresas.obtenerDataEmpresa');

Route::get('gestor-admon/{id}/{razonSocial}', function ($id, $razonSocial) {
    return view('gestor_vista.Administrador.Gestor_general', compact('id', 'razonSocial'));
})->name('gestoradmon');

Route::get('gestor-admin/{id}', function ($id) {
    return view('gestor_vista.Administrador.Gestor_admin', compact('id'));
})->name('gestoradmin');

Route::get('gestor-contabilidad/{id}', function ($id) {
    return view('gestor_vista.Administrador.Gestor_contabilidad', compact('id'));
})->name('gestorcontabilidad');

/*Route::get('gestor-balance/{id}', function ($id) {
    return view('gestor_vista.Administrador.Gestor_balance', compact('id'));
})->name('gestorbalance');*/
Route::get('/gestor-balance/{id}', [ContabilidadController::class, 'show'])->name('gestorbalance');
// web.php
Route::post('/actualizar-balance-real', [ContabilidadController::class, 'updatebalancereal']);

Route::post('/obtener-balance-real', [ContabilidadController::class, 'obtenerBalance']);
Route::post('/obtener-listado-balance', [ContabilidadController::class, 'listarBalancesFinan']);
Route::post('/obtener-resumen-balances', [ContabilidadController::class, 'getResumBalances']);

Route::post('/actualizar-balance-programado', [ContabilidadController::class, 'updatebalanceprogramado']);
Route::post('/obtener-balance-programado', [ContabilidadController::class, 'obtenerBalanceProgramado']);

/*Route::post('/actualizar-balance-real', [ContabilidadController::class, 'updatebalancereal'])->name('actualizarbalancereal');
Route::post('/actualizar-balance-programado', [ContabilidadController::class, 'updatebalanceprogramado'])->name('actualizarbalanceprogramado')*/
//PROYECTOS
Route::resource('proyectos', ProyectoController::class);
Route::get('gestor-proyectos/{empresaId}', [ProyectoController::class, 'index'])->name('gestor-proyectos');

Route::get('redirect_proyecto/{id}/{empresa_id}', [ProyectoController::class, 'redirectProyecto'])->name('redirect_proyecto');

Route::get('gestor-proyectos/{id}', function ($id) {
    return view('gestor_vista.Administrador.Gestor_Proyectos', compact('id'));
})->name('gestorproyectos');

Route::get('gestor-proyectos-ges/{id}', function ($id) {
    return view('gestor_vista.Administrador.Gestor_Proyectos_ges', compact('id'));
})->name('gestorproyectosges');

Route::post('/proyecto/actualizar', [ProyectoController::class, 'actualizarPorcentaje']);
Route::post('/proyecto/actualizardata', [ProyectoController::class, 'actualizarDocumentoProyecto']);

//REQUERIMIENTOS
//GESTOR DE TRABAJADOR
Route::get('gestor-trabajadorgen/{id}', function ($id) {
    return view('gestor_vista.Administrador.Gestor_personal_general', compact('id'));
})->name('gestortrabajadorgen');
//CRUD TRABAJADOR 
Route::resource('trabajadorregister', TrabajadorController::class);
Route::post('trabajadorregister/obtener-data', [TrabajadorController::class, 'obtenerUsuarioDNI'])->name('trabajadorregister.obtenerUsuarioDNI');
Route::get('gestor-registrarPer/{empresaId}', [TrabajadorController::class, 'index'])->name('gestor-registrarPer');

//CRUD PHHP GESTOR ACTIVIDADES
Route::get('kanban/{id}', function ($id) {
    return view('gestor_vista.Administrador.gestion_tareasPHHA', compact('id'));
})->name('kanban');
//======================TRAMITES======================
Route::get('Tramites/{empresaId}', function ($empresaId) {
    return view('gestor_vista.contabilidad.tramites.tramites', compact('empresaId'));
})->name('Tramites');

// Ruta para obtener perfil del usuario (necesaria para el frontend)
Route::post('/get-user-profile', [TramitesController::class, 'getUserProfile'])
    ->name('user.profile');

// Ruta principal de trámites con parámetro de empresa
Route::get('/tramites', [TramitesController::class, 'index'])
    ->name('tramites.index');

// Crear nuevo trámite
Route::post('/tramites', [TramitesController::class, 'store'])
    ->name('tramites.store');

// Ver detalles de un trámite específico
Route::get('/tramites/{tramite}', [TramitesController::class, 'show'])
    ->name('tramites.show');

// Aprobar trámite
Route::post('/tramites/{tramite}/aprobar', [TramitesController::class, 'aprobar'])
    ->name('tramites.aprobar');

// Rechazar trámite
Route::post('/tramites/{tramite}/rechazar', [TramitesController::class, 'rechazar'])
    ->name('tramites.rechazar');

// Reenviar (reiniciar) trámite rechazado
Route::post('/tramites/{tramite}/reenviar', [TramitesController::class, 'reenviar'])
    ->name('tramites.reenviar');

// Estadísticas de trámites
Route::get('/tramites-estadisticas', [TramitesController::class, 'estadisticas'])
    ->name('tramites.estadisticas');

// Obtener Actividad Mensual y Descuentos
Route::post('/get-Actividad-Personal', [TramitesController::class, 'getDataActivityPersonalMount']);

//obtener informe de pago firmado y sellado
Route::post('/get-informe-pago-tramitado', [TramitesController::class, 'getDataInformePago']);

// Ruta para mostrar la vista de trámites de una empresa específica
Route::get('/Tramites/{empresa_id}', function ($empresa_id) {
    return view('tramites.index', compact('empresa_id'));
})->where('empresa_id', '[0-9]+')->name('tramites.empresa');

//======================Actividades
Route::resource('actividadpersonal', actividadespersonalController::class);
Route::get('listar_trab/{empresaId}', [actividadespersonalController::class, 'listar_trabajador'])->name('listar_trab');
Route::get('listar_pro/{empresaId}', [actividadespersonalController::class, 'listar_proyectos'])->name('listar_pro');
Route::post('actualizar_actividadcol/{taskId}', [actividadespersonalController::class, 'update_colum_task'])->name('actualizar_actividadcol');
Route::post('actualizar_fichas/{taskId}', [actividadespersonalController::class, 'update_fichas'])->name('actualizar_fichas');
Route::post('/actividades-personal/exportar', [actividadespersonalController::class, 'exportarIp']);

// Ruta para actualizar elapsed_time
Route::post('/update-elapsed-time/{id}', [actividadespersonalController::class, 'actividadPersonal']);
Route::get('/cron/update-elapsed', [actividadespersonalController::class, 'updateElapsedTime']);
//CRUD CALENDARIOS
// Asegúrate de que el namespace del controlador esté importado correctamente
Route::get('gestor-calendariogen/{id}', [CalendariotrabajadorController::class, 'show'])
    ->name('gestorcalendariogen');
Route::resource('calendariotrabajador', CalendariotrabajadorController::class);

//CRUD KAMBAN
Route::get('gestor-kanbangen/{id}', [KanbanController::class, 'show'])->name('gestorkanbangen');
Route::resource('kanbantrabajador', KanbanController::class);
Route::put('kanbantrabajador/move/{id}', [KanbanController::class, 'move'])->name('kanbantrabajador.move');

//CRUD REPORTES GENERALES
Route::resource('gestorReportes', ReportetrabajadorController::class);
Route::get('gestor-reportesGen/{id}', [ReportetrabajadorController::class, 'show'])->name('gestoreportesGen');
Route::post('gestorReportes/obtenerTareasIp', [ReportetrabajadorController::class, 'obtenerTareasIp'])->name('gestorReportes.obtenerTareasIp');
Route::post('gestorReportes/obtenerTareasMensual', [ReportetrabajadorController::class, 'obtenerTareasMensual'])->name('gestorReportes.obtenerTareasMensual');
Route::post('gestorReportes/obtenerTareasSemanal', [ReportetrabajadorController::class, 'obtenerTareasSemanal'])->name('gestorReportes.obtenerTareasSemanal');
Route::post('gestorReportes/obtenerAsistenciaPersonal/{empresaId}/{mes_reporte_asistencia}/{anio_reporte_asistencia?}', [ReportetrabajadorController::class, 'listarAsistenciatrabajador'])->name('gestorReportes.obtenerAsistenciaPersonal');

//CRUD TAREAS GENERAL REV
Route::get('gestor-tareasRev/{empresaId}/{id_tarea?}', [ReportetrabajadorController::class, 'vistaTareas'])->name('gestor-tareasRev');

//CRUD PARA REQUERIMIENTOS LOGISTICA GENERAL
Route::get('gestor-logisticoGen/{empresaId}', function ($empresaId) {
    return view('gestor_vista.Administrador.Gestor_Glogistica', compact('empresaId'));
})->name('gestorlogisticoGen');

Route::get('gestor-requerimientog/{empresaId}', [RequerimientoController::class, 'show'])->name('gestorrequerimientog');
Route::resource('gestorrequerimientos', RequerimientoController::class);
Route::put('gestorrequerimientos_mobra/{id_mano_obra}', [RequerimientoController::class, 'actualizarmanoObra'])->name('gestorrequerimientos_mobra.actualizarmanoObra');
Route::delete('gestorrequerimientos/manoObra/{id}', [RequerimientoController::class, 'eliminarmanoObra'])->name('gestorrequerimientos.eliminarmanoObra');
Route::put('gestorrequerimientos_material/{id_materiales_req}', [RequerimientoController::class, 'actualizarmaterial'])->name('gestorrequerimientos_material.actualizarmaterial');
Route::delete('gestorrequerimientos/materiales/{id}', [RequerimientoController::class, 'eliminarmateriales'])->name('gestorrequerimientos.eliminarmateriales');
Route::put('gestorrequerimientos_dep/{id_depositoreq}', [RequerimientoController::class, 'actualizardeposito'])->name('gestorrequerimientos_dep.actualizardeposito');
Route::post('/requerimientos_aprobar/{id}', [RequerimientoController::class, 'aprobar'])->name('requerimientos_aprobar.aprobar');
Route::post('/requerimientos_pendiente/{id}', [RequerimientoController::class, 'pendiente'])->name('requerimientos_pendiente.pendiente');
Route::delete('/requerimientos_eliminar/{id}', [RequerimientoController::class, 'eliminar'])->name('requerimientos_eliminar.eliminar');
Route::get('requerimiento_create/{empresaId}', [RequerimientoController::class, 'create'])->name('requerimientocreate.create');
Route::post('requerimiento_register/store', [RequerimientoController::class, 'store'])->name('requerimiento_register.store');
Route::post('actualizarSustento/{id}', [RequerimientoController::class, 'actualizarsustento'])->name('actualizarSustento.actualizarsustento');
// Marcar una notificación como leída
Route::post('notifications/{id}/mark-as-read', [NotificationController::class, 'markAsRead'])
    ->name('notifications.markAsRead');

// Marcar todas las notificaciones como leídas
Route::post('notifications/mark-all-as-read', [NotificationController::class, 'markAllAsRead'])
    ->name('notifications.markAllAsRead');

Route::get('/listar-tareas/{idtrabajador}', [actividadespersonalController::class, 'listartarea']);
Route::post('/actualizar-status/{idTarea}/{status}', [actividadespersonalController::class, 'actualizarStatusUser']);
Route::get('/tareas/doing/{empresaId}', [actividadespersonalController::class, 'listartareajefes']);
Route::get('/requerimiento-count', [actividadespersonalController::class, 'countRequerimientoAdmin']);
//CRUD INVENTARIOS
Route::resource('gestorinventarioge', InventarioController::class);
Route::get('gestor-inventarioprin/{empresaId}', [InventarioController::class, 'show'])->name('gestorinventarioprin');
Route::get('gestor-inventario/{id_gestion_inv}', [InventarioController::class, 'showInventario'])->name('gestorinventario');
Route::post('gestor-inventarioReg', [InventarioController::class, 'insertarexcel'])->name('gestorinventarioReg.insertarexcel');
Route::put('gestor-inventario/{id}', [InventarioController::class, 'editinventario'])->name('gestorinventarioge.editinventario');
Route::delete('gestor-inventario/{id}', [InventarioController::class, 'destroyinventario'])->name('gestorinventarioge.destroyinventario');

//CRUD CALENDARIOS JEFES
Route::resource('calendariojefes', CalendarioJefesController::class);
Route::post('registrar_tarea', [TareasController::class, 'store'])->name('registrar_tarea.store');
//CRUD CALENDARIOS TRABAJADOR
Route::get('calendariotrabajadores/{empresaId}/{trabajadorId}', [CalendarioTrabajadoresController::class, 'show']);
Route::post('registrar_asistencia', [CalendarioTrabajadoresController::class, 'store'])->name('registrar_asistencia.store');
Route::get('asistencia_list_trab/{empresaId}/{trabajadorId}', [CalendarioTrabajadoresController::class, 'listarAsistenciaUser']);
Route::get('tareas_list_trab/{trabajadorId}', [CalendarioTrabajadoresController::class, 'listarTareasUser']);

Route::get('gestor_reports_proyectos/{empresaId}', [ProyectoController::class, 'reports_proyectos'])->name('gestor_reports_proyectos');
Route::get('reportes/proyecto/{grupo_id}/{nombre_proyecto}/{empresaId}', [ProyectoController::class, 'reporteDetalles'])->name('reporte_detalles');
Route::put('actualizarpresupuesto', [ProyectoController::class, 'actualizar_presupuesto_proyecto'])->name('actualizarpresupuesto');
Route::put('actualizarinversion', [ProyectoController::class, 'actualizar_inversion'])->name('actualizarinversion');

Route::get('gestor-princampo/{empresaId}', function ($empresaId) {
    return view('gestor_vista.Campo.index', compact('empresaId'));
})->name('gestorprincampo');

Route::get('mantenimientoCampo/rederigircampo/{empresaId}', [MantenimientoCampoController::class, 'rederigircampo'])
    ->name('mantenimientoCampo.rederigircampo');
Route::post('mantenimientoCampo/traerdataman', [MantenimientoCampoController::class, 'ObtenerMant'])
    ->name('mantenimientoCampo.traerdataman');
Route::get('/gestor-mantenimiento/{id_mantimiento}', [MantenimientoCampoController::class, 'gestorMantenimiento'])->name('gestor.mantenimiento');
Route::put('actualizarmantenimiento', [MantenimientoCampoController::class, 'guardar_mantenimiento'])->name('actualizarmantenimiento');
Route::resource('mantenimientoCampo', MantenimientoCampoController::class);

Route::get('valorizacionCampo/rederigircampoval/{empresaId}', [valorizacionCampoController::class, 'rederigircampoval'])
    ->name('valorizacionCampo.rederigircampoval');
Route::put('actualizarvalorizacion', [valorizacionCampoController::class, 'actualizarvalorizaciones'])->name('actualizarvalorizacion');
Route::resource('valorizacionCampo', valorizacionCampoController::class);

//======================COTIZACIONES Y PETICIONES DE CUENTAS =================//
Route::post('/cotizarcuentas', [enviarCotizacionController::class, 'enviarCotizacion'])->name('cotizarcuentas');

//======================VALES DE ENTREGA DE EQUIPOR POR PERSONAL ==============//
Route::get('gestor_valesentrega/{empresaId}', [valesequipoentregaController::class, 'redireccionvalesentregas'])->name('gestor_valesentrega');
Route::get('/productos/{empresaId}', [valesequipoentregaController::class, 'getProductos'])->name('productos.get');
Route::get('/search-vales', [valesequipoentregaController::class, 'searchVales'])->name('search-vales.get');
Route::get('valeequipos_list_trab/{trabajadorId}', [valesequipoentregaController::class, 'listadoEquipos']);

Route::resource('vales_entrega', valesequipoentregaController::class);

Route::get('gestor-construye/{empresaId}', function ($empresaId) {
    return view('gestor_vista.Construyehc.index', compact('empresaId'));
})->name('gestorconstruye');

Route::get('gestor-intalacionsanitarias/{empresaId}', function ($empresaId) {
    return view('gestor_vista.Construyehc.Sanitarias.instalacionS', compact('empresaId'));
})->name('gestorinstalacions');

//======================CONSTRUYE PANEL ======================================//
Route::get('gestor-construye/{empresaId}', function ($empresaId) {
    return view('gestor_vista.Construyehc.index', compact('empresaId'));
})->name('gestorconstruye');

Route::get('gestor-intalacionsanitarias/{empresaId}', function ($empresaId) {
    return view('gestor_vista.Construyehc.Sanitarias.instalacionS', compact('empresaId'));
})->name('gestorinstalacions');

Route::post('/instalacionesScontroller', [instalacionSanitariaController::class, 'sanitarias'])->name('instalacionesScontroller');
Route::get('/instsanitariacontroller', [instalacionSanitariaController::class, 'sanitarias'])->name('instsanitariacontroller');

//================================METRADOS ============================//
Route::resource('metradosanitarias', metradosanitariasController::class);
Route::post('update_metrados_sanitarias', [metradosanitariasController::class, 'actualizar_data']);


Route::resource('metradoelectricas', metradoelectricasController::class);
Route::post('update_metrados_electricas', [metradoelectricasController::class, 'actualizar_data_electricas']);


Route::resource('metradocomunicacion', metradocomunicacionController::class);
Route::post('update_metrados_comunicacion', [metradocomunicacionController::class, 'actualizar_data_comunicacion']);

Route::resource('metrado_gas', metradogasController::class);
Route::post('update_metrados_gas', [metradogasController::class, 'actualizar_data_gas']);

Route::resource('metradoestructuras', metradoestructurasController::class);
Route::post('update_metrados_estructuras', [metradoestructurasController::class, 'actualizar_data_estructuras']);

//================================CISTERNA =============================//
Route::get('gestor-cisterna/{empresaId}', function ($empresaId) {
    return view('gestor_vista.Construyehc.Sanitarias.gestorcisternaeternit', compact('empresaId'));
})->name('gestorcisterna');

//================================TANQUE ==============================//
Route::get('gestor-tanque/{empresaId}', function ($empresaId) {
    return view('gestor_vista.Construyehc.Sanitarias.gestortanaqueeternit', compact('empresaId'));
})->name('gestortanque');

//================================Presupuestos ==============================//
Route::get('presupuestos-acu/{empresaId}', function ($empresaId) {
    return view('gestor_vista.Construyehc.presupuestos.presupuestos', compact('empresaId'));
})->name('presupuestosAcu');

Route::post('/obtener-presupuestos', [PresupuestosController::class, 'index']);
Route::post('/obtener-metrados', [PresupuestosController::class, 'obtenerMetrados']);
Route::post('/actualizar-presupuestos', [PresupuestosController::class, 'actualizarMetrados']);

//================================GASTOS GENERALES ==============================//
Route::post('/obtener-costo_directo', [GastoGeneralController::class, 'obtenerCostoDirecto']);
Route::post('/obtener-gasto-metrados', [GastoGeneralController::class, 'getDataTotalMetrados']);

Route::post('/guardar-remuneraciones/{id}', [GastoGeneralController::class, 'guardarRemuneraciones']);
Route::post('/obtener-remuneraciones', [GastoGeneralController::class, 'ObtenerRemuneraciones']);

Route::post('/guardar-gastos-fijos/{id}', [GastoGeneralController::class, 'guardarGastosFijos']);
Route::post('/obtener-gastos-fijos', [GastoGeneralController::class, 'ObtenerGastosFijos']);

Route::post('/guardar-gastos-generales/{id}', [GastoGeneralController::class, 'guardarGastosGenerales']);
Route::post('/obtener-gasto_generales', [GastoGeneralController::class, 'ObtenerGastosGenerales']);

Route::post('/guardar-gastos-supervision/{id}', [GastoGeneralController::class, 'guardarGastosSupervision']);
Route::post('/obtener-gasto-supervision', [GastoGeneralController::class, 'ObtenerGastosSupervision']);

Route::post('/guardar-control-concurrente/{id}', [GastoGeneralController::class, 'guardarControlConcurrente']);
Route::post('/obtener-control-concurrente', [GastoGeneralController::class, 'ObtenerControlConcurrente']);

Route::post('/guardar-consolidado/{id}', [GastoGeneralController::class, 'guardarConsolidado']);
Route::post('/obtener-consolidado', [GastoGeneralController::class, 'ObtenerConsolidado']);

//================================ETTP ==============================//
Route::get('especificaciones-tecnicas/{empresaId}', function ($empresaId) {
    return view('gestor_vista.Construyehc.ettp.index', compact('empresaId'));
})->name('especificacionesTecnicas');


Route::post('/obtener-metrados-ettp', [EspecificacionesTecnicasController::class, 'obtenerMetradosEttp']);
Route::post('/obtener-especificaciones-tecnicas', [EspecificacionesTecnicasController::class, 'getDataETTP']);
Route::post('/guardar-especificaciones-tecnicas/{id}', [EspecificacionesTecnicasController::class, 'updateETTP']);

//================================CRONOGRAMAS ==============================//
Route::get('diagrama-gantt/{empresaId}', function ($empresaId) {
    return view('gestor_vista.Construyehc.diagramaGantt.index', compact('empresaId'));
})->name('diagramaGant');
Route::get('/budgets/{id}', [PresupuestosController::class, 'show']); // obtener uno por ID
Route::post('/obtener-cronograma', [CronogramaController::class, 'obtenerCronogramaGantt']);
Route::post('/guardar-cronograma/{id}', [CronogramaController::class, 'saveDataCronograma']);
Route::post('/cronogramas/import-msproject', [CronogramaController::class, 'importMsProject'])->name('cronogramas.import-msproject');
Route::post('/exportar-gantt-pdf', [CronogramaController::class, 'exportarGanttPDF']);


//================================DMML ==============================//
Route::get('gestor-dml/{empresaId}', function ($empresaId) {
    return view('gestor_vista.dml.index', compact('empresaId'));
})->name('gestordml');

Route::get('gestor-mc-dml/{empresaId}', function ($empresaId) {
    return view('gestor_vista.dml.memoriacalculo.index', compact('empresaId'));
})->name('gestormcdml');

Route::post('editor-dml', [EditorController::class, 'stard']);

Route::post('/memoria-calculo', [\App\Http\Controllers\dml\memoriaCalculo::class, 'generarPDF']);

//======================RUTAS PARA LAS IMAGENES===============================//
Route::get('/storage/profile/{filename}', function ($filename) {
    $path = public_path('storage/profile/' . $filename);
    if (!File::exists($path)) {
        return response()->json(['message' => 'Imagen no encontrada.'], 404);
    }
    $file = File::get($path);
    $type = File::mimeType($path);
    $response = Response::make($file, 200);
    $response->header("Content-Type", $type);
    return $response;
});

// routes/web.php
Route::get('/get-firma/{filename}', function ($filename) {
    $path = storage_path('app/public/firmas/' . $filename);

    if (!file_exists($path)) {
        abort(404);
    }

    return response()->file($path, [
        'Content-Type' => 'image/png',
        'Cache-Control' => 'public, max-age=3600'
    ]);
})->name('get.firma');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
