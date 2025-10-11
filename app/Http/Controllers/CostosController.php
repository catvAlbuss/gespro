<?php

namespace App\Http\Controllers;

use App\Models\costo_cronograma;
use App\Models\costo_metrado;
use App\Models\Costos;
use App\Models\Cronograma;
use App\Models\especificacionesTecnicas;
use App\Models\metradoarquitectura;
use App\Models\metradocomunicacion;
use App\Models\metradoelectricas;
use App\Models\metradoestructuras;
use App\Models\metradogas;
use App\Models\metradosanitarias;
use App\Models\presupuestos;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

class CostosController extends Controller
{
    /**
     * Display a listing of the resource.resources/views/gestor_vista/Construyehc/costos/index.blade.php
     */
    public function index()
    {
        try {
            $costos = Costos::orderBy('created_at', 'desc')->get();
            return view('gestor_vista.Construyehc.costos.index', compact('costos'));
        } catch (Exception $e) {
            return redirect()->back()->with('error', 'Error al cargar los costos');
        }
    }


    /**
     * Create costos
     */
    public function store(Request $request)
    {
        Log::info('=== INICIO DEL PROCESO DE CREACIÓN ===');
        Log::info('Datos recibidos del BACKEND', $request->all());

        try {
            // Obtener plugins (puede venir como array o string JSON)
            $pluginsData = $request->input('plugins');

            // Si viene como string, decodificar
            if (is_string($pluginsData)) {
                $pluginsData = json_decode($pluginsData, true);
                Log::info('Plugins decodificados desde JSON string');
            }

            Log::info('Plugins procesados', ['plugins' => $pluginsData]);

            if (empty($pluginsData) || !is_array($pluginsData)) {
                Log::error('Estructura de plugins inválida', ['plugins' => $pluginsData]);
                throw new \Exception('La estructura de plugins es inválida o está vacía');
            }

            // Validación base (campos siempre requeridos)
            $rules = [
                'name' => 'required|string|max:500',
                'codigouei' => 'required|string|max:255',
                'codigosnip' => 'required|string|max:255',
                'codigocui' => 'required|string|max:255',
                'unidad_ejecutora' => 'required|string|max:255',
                'codigolocal' => 'required|string|max:255',
                'codigomodular' => 'required|string',
                'fecha' => 'required|date',
                'region' => 'required|string|max:255',
                'provincia' => 'required|string|max:255',
                'distrito' => 'required|string|max:255',
                'centropoblado' => 'required|string|max:255',
                'plugins' => 'required',
            ];

            Log::info('Reglas base de validación creadas', ['campos_base' => array_keys($rules)]);

            // Validación dinámica según plugins activos Y si los datos están presentes
            if (!empty($pluginsData['metrados']) && is_array($pluginsData['metrados'])) {
                if ($request->has('especialidad') && $request->has('metrado')) {
                    $metradosLower = array_map('strtolower', $pluginsData['metrados']);
                    $rules['especialidad'] = 'required|string|in:' . implode(',', $metradosLower);
                    $rules['metrado'] = 'required|array';
                    Log::info('✓ Validación de metrados agregada', [
                        'especialidades_permitidas' => $metradosLower
                    ]);
                } else {
                    Log::info('⊘ Plugin metrados activo pero datos no enviados en la petición');
                }
            } else {
                Log::info('⊘ No se requiere validación de metrados (plugin no activo)');
            }

            if (!empty($pluginsData['presupuesto']) && $pluginsData['presupuesto'] === true) {
                if ($request->has('presupuesto')) {
                    $rules['presupuesto'] = 'required|array';
                    Log::info('✓ Validación de presupuesto agregada');
                } else {
                    Log::info('⊘ Plugin presupuesto activo pero datos no enviados en la petición');
                }
            } else {
                Log::info('⊘ No se requiere validación de presupuesto (plugin no activo)');
            }

            if (!empty($pluginsData['especificaciones']) && $pluginsData['especificaciones'] === true) {
                if ($request->has('especificaciones_tecnicas')) {
                    $rules['especificaciones_tecnicas'] = 'required|array';
                    Log::info('✓ Validación de especificaciones técnicas agregada');
                } else {
                    Log::info('⊘ Plugin especificaciones activo pero datos no enviados en la petición');
                }
            } else {
                Log::info('⊘ No se requiere validación de especificaciones (plugin no activo)');
            }

            if (!empty($pluginsData['cronogramas']) && is_array($pluginsData['cronogramas'])) {
                if ($request->has('cronogramas')) {
                    foreach ($pluginsData['cronogramas'] as $cronograma) {
                        if ($request->has("cronogramas.{$cronograma}")) {
                            $rules["cronogramas.{$cronograma}"] = 'required|array';
                        }
                    }
                    Log::info('✓ Validación de cronogramas agregada', [
                        'tipos_cronogramas' => $pluginsData['cronogramas']
                    ]);
                } else {
                    Log::info('⊘ Plugin cronogramas activo pero datos no enviados en la petición');
                }
            } else {
                Log::info('⊘ No se requiere validación de cronogramas (plugin no activo)');
            }

            Log::info('Reglas finales de validación', [
                'total_reglas' => count($rules),
                'campos' => array_keys($rules)
            ]);

            // Realizar validación
            Log::info('Iniciando validación de datos...');
            $validatedData = $request->validate($rules);
            Log::info('✓✓✓ Validación exitosa ✓✓✓');

            // Validar código modular
            Log::info('Validando código modular...');
            $codigoModular = json_decode($validatedData['codigomodular'], true);
            Log::info('Código modular decodificado', ['codigomodular' => $codigoModular]);

            if (empty($codigoModular) || !is_array($codigoModular)) {
                Log::error('✗ Código modular inválido', ['codigomodular' => $codigoModular]);
                return response()->json([
                    'success' => false,
                    'message' => 'Debe seleccionar al menos un nivel educativo con su código correspondiente'
                ], 422);
            }
            Log::info('✓ Código modular válido');

            Log::info('=== INICIANDO TRANSACCIÓN DE BASE DE DATOS ===');
            DB::beginTransaction();

            // Crear el proyecto principal (Costos)
            Log::info('Creando registro principal en tabla Costos...');
            $costo = Costos::create([
                'name' => $validatedData['name'],
                'codigouei' => $validatedData['codigouei'],
                'codigosnip' => $validatedData['codigosnip'],
                'codigocui' => $validatedData['codigocui'],
                'unidad_ejecutora' => $validatedData['unidad_ejecutora'],
                'codigolocal' => $validatedData['codigolocal'],
                'codigomodular' => $validatedData['codigomodular'],
                'fecha' => $validatedData['fecha'],
                'region' => $validatedData['region'],
                'provincia' => $validatedData['provincia'],
                'distrito' => $validatedData['distrito'],
                'centropoblado' => $validatedData['centropoblado'],
            ]);
            Log::info('✓✓✓ Costo creado exitosamente ✓✓✓', [
                'costo_id' => $costo->id,
                'nombre' => $costo->name
            ]);

            // Procesar Metrados solo si existen
            Log::info('========================================');
            Log::info('=== PROCESANDO PLUGINS (RAMAS) ===');
            Log::info('========================================');

            $this->processMetrados($validatedData, $pluginsData, $costo->id);

            // Procesar metrados basados en los tipos seleccionados en plugins
            try {
                if (!empty($pluginsData['metrados']) && is_array($pluginsData['metrados'])) {
                    // Obtener o crear la fila costos_metrados para este costo
                    $costoMetrado = costo_metrado::firstOrNew(['costos_id' => $costo->id]);

                    // Inicializar campos por si la fila es nueva
                    $costoMetrado->m_arq_id = $costoMetrado->m_arq_id ?? null;
                    $costoMetrado->m_est_id = $costoMetrado->m_est_id ?? null;
                    $costoMetrado->m_san_id = $costoMetrado->m_san_id ?? null;
                    $costoMetrado->m_elec_id = $costoMetrado->m_elec_id ?? null;
                    $costoMetrado->m_com_id = $costoMetrado->m_com_id ?? null;
                    $costoMetrado->m_gas_id = $costoMetrado->m_gas_id ?? null;

                    foreach ($pluginsData['metrados'] as $tipo) {
                        $tipoLower = strtolower($tipo);
                        switch ($tipoLower) {
                            case 'arquitectura':
                                $metradoArq = metradoarquitectura::create([
                                    'especialidad' => 'arquitectura',
                                    'documentosdata' => json_encode([]),
                                    'resumenmetrados' => null,
                                ]);
                                // usar primary key personalizado si existe
                                $costoMetrado->m_arq_id = $metradoArq->id_arquitectura ?? $metradoArq->getKey();
                                Log::info('Metrado arquitectura creado y vinculado', ['id' => $costoMetrado->m_arq_id]);
                                break;
                            case 'estructuras':
                            case 'estructura':
                                $metradoEst = metradoestructuras::create([
                                    'especialidad' => 'estructuras',
                                    'documentosdata' => json_encode([]),
                                    'resumenmetrados' => null,
                                ]);
                                $costoMetrado->m_est_id = $metradoEst->idmetradoestructuras ?? $metradoEst->getKey();
                                Log::info('Metrado estructuras creado y vinculado', ['id' => $costoMetrado->m_est_id]);
                                break;
                            case 'sanitarias':
                                $cantidadModulos = $request->input('cantmodulos', 0);
                                $metradoSan = metradosanitarias::create([
                                    'especialidad' => 'sanitarias',
                                    'cantidadModulo' => (int)$cantidadModulos, // Usar la cantidad del request
                                    'documentosdata' => json_encode([]),
                                    'resumenmetrados' => null,
                                ]);
                                $costoMetrado->m_san_id = $metradoSan->idmetradosan ?? $metradoSan->getKey();
                                Log::info('Metrado sanitarias creado y vinculado', ['id' => $costoMetrado->m_san_id]);
                                break;
                            case 'electricas':
                                $metradoElec = metradoelectricas::create([
                                    'especialidad' => 'electricas',
                                    'documentosdata' => json_encode([]),
                                    'resumenmetrados' => null,
                                ]);
                                $costoMetrado->m_elec_id = $metradoElec->idmeelectrica ?? $metradoElec->getKey();
                                Log::info('Metrado electricas creado y vinculado', ['id' => $costoMetrado->m_elec_id]);
                                break;
                            case 'comunicacion':
                            case 'comunicaciones':
                                $metradoCom = metradocomunicacion::create([
                                    'especialidad' => 'comunicacion',
                                    'documentosdata' => json_encode([]),
                                    'resumenmetrados' => null,
                                ]);
                                $costoMetrado->m_com_id = $metradoCom->idmetradocomunicacion ?? $metradoCom->getKey();
                                Log::info('Metrado comunicacion creado y vinculado', ['id' => $costoMetrado->m_com_id]);
                                break;
                            case 'gas':
                                $metradoGas = metradogas::create([
                                    'especialidad' => 'gas',
                                    'documentosdata' => json_encode([]),
                                    'resumenmetrados' => null,
                                ]);
                                $costoMetrado->m_gas_id = $metradoGas->idmetradogas ?? $metradoGas->getKey();
                                Log::info('Metrado gas creado y vinculado', ['id' => $costoMetrado->m_gas_id]);
                                break;
                            default:
                                Log::warning('Tipo de metrado no reconocido al procesar plugins', ['tipo' => $tipoLower]);
                                break;
                        }
                    }

                    // Guardar la relación costos_metrados con los ids enlazados
                    $costoMetrado->costos_id = $costo->id;
                    $costoMetrado->save();
                    Log::info('Fila costos_metrados guardada/actualizada con metrado(s) vinculados', ['costos_id' => $costo->id, 'record_id' => $costoMetrado->id ?? null]);
                }
            } catch (Exception $e) {
                Log::warning('Error creando metrados desde plugins: ' . $e->getMessage());
            }

            // Crear presupuesto solo si está activo
            if (!empty($pluginsData['presupuesto']) && $pluginsData['presupuesto'] === true) {
                Log::info('--- Plugin: PRESUPUESTO ---');

                if (!empty($validatedData['presupuesto'])) {
                    Log::info('Creando presupuesto con datos recibidos...');
                    presupuestos::create([
                        'datapresupuestos' => json_encode($validatedData['presupuesto']),
                        'costos_pres_id' => $costo->id,
                    ]);
                    Log::info('✓ Presupuesto creado exitosamente');
                } else {
                    // Crear presupuesto vacío para reservar la rama
                    presupuestos::create([
                        'datapresupuestos' => json_encode([]),
                        'costos_pres_id' => $costo->id,
                    ]);
                    Log::info('Presupuesto creado (vacío) porque el plugin está activo', ['costos_id' => $costo->id]);
                }
            } else {
                Log::info('⊘ Plugin PRESUPUESTO no está activo - No se creará');
            }

            // Crear especificaciones técnicas solo si están activas
            if (!empty($pluginsData['especificaciones']) && $pluginsData['especificaciones'] === true) {
                Log::info('--- Plugin: ESPECIFICACIONES TÉCNICAS ---');

                if (!empty($validatedData['especificaciones_tecnicas'])) {
                    Log::info('Creando especificaciones técnicas con datos recibidos...');
                    especificacionesTecnicas::create([
                        'datosEspecificacionTecnica' => json_encode($validatedData['especificaciones_tecnicas']),
                        'costos_ettp_id' => $costo->id,
                    ]);
                    Log::info('✓ Especificaciones técnicas creadas exitosamente');
                } else {
                    // Crear especificación técnica vacía para reservar la rama
                    especificacionesTecnicas::create([
                        'datosEspecificacionTecnica' => json_encode([]),
                        'costos_ettp_id' => $costo->id,
                    ]);
                    Log::info('Especificaciones técnicas creadas (vacío) porque el plugin está activo', ['costos_id' => $costo->id]);
                }
            } else {
                Log::info('⊘ Plugin ESPECIFICACIONES TÉCNICAS no está activo - No se creará');
            }

            // Crear cronogramas solo si existen
            if (!empty($pluginsData['cronogramas']) && is_array($pluginsData['cronogramas'])) {
                Log::info('--- Plugin: CRONOGRAMAS ---');

                // Verificar si el cronograma general está en los activos
                if (in_array('general', $pluginsData['cronogramas'])) {
                    Log::info('Creando cronograma general...');

                    // Crear cronograma general (campos pueden ser null)
                    $cronogramaGeneral = Cronograma::create([
                        'montos' => null,
                        'datacronograma' => null,
                    ]);

                    Log::info('✓ Cronograma general creado', [
                        'cronograma_id' => $cronogramaGeneral->id
                    ]);

                    // Crear la relación en costo_cronograma
                    costo_cronograma::create([
                        'costos_cron_id' => $costo->id,
                        'cron_gen_id' => $cronogramaGeneral->id,
                        'cron_val_id' => null,
                        'cron_mat_id' => null,
                    ]);

                    Log::info('✓✓✓ Relación costo_cronograma creada con cronograma general ✓✓✓', [
                        'costos_id' => $costo->id,
                        'cron_gen_id' => $cronogramaGeneral->id
                    ]);
                } else {
                    Log::info('⊘ Cronograma general no está en los plugins activos');
                }
            } else {
                Log::info('⊘ Plugin CRONOGRAMAS no está activo - No se creará');
            }

            Log::info('========================================');
            Log::info('=== FINALIZANDO TRANSACCIÓN ===');
            Log::info('========================================');
            DB::commit();

            Log::info('✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓');
            Log::info('✓✓✓ PROYECTO CREADO EXITOSAMENTE ✓✓✓');
            Log::info('✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓');
            Log::info('Resumen:', [
                'costo_id' => $costo->id,
                'nombre' => $costo->name,
                'plugins_procesados' => array_keys(array_filter([
                    'metrados' => !empty($pluginsData['metrados']),
                    'presupuesto' => !empty($pluginsData['presupuesto']),
                    'especificaciones' => !empty($pluginsData['especificaciones']),
                    'cronogramas' => !empty($pluginsData['cronogramas']),
                ]))
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Proyecto creado exitosamente con los plugins seleccionados.',
                'data' => [
                    'costo' => $costo,
                    'plugins_procesados' => $pluginsData
                ]
            ]);
        } catch (ValidationException $e) {
            DB::rollBack();
            Log::error('✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗');
            Log::error('✗✗✗ ERROR DE VALIDACIÓN ✗✗✗');
            Log::error('✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗');
            Log::error('Errores de validación:', [
                'errors' => $e->errors(),
                'message' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗');
            Log::error('✗✗✗ ERROR CRÍTICO ✗✗✗');
            Log::error('✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗');
            Log::error('Detalles del error:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Procesa los metrados según las especialidades activas
     */
    private function processMetrados($validatedData, $pluginsData, $costoId)
    {
        Log::info('--- Plugin: METRADOS ---');
        Log::info('Iniciando procesamiento de metrados...');

        // Verificar si hay metrados activos
        if (empty($pluginsData['metrados']) || !is_array($pluginsData['metrados'])) {
            Log::warning('⊘ No hay metrados activos en los plugins - No se creará ningún metrado');
            return;
        }

        Log::info('Metrados activos en plugins:', ['metrados' => $pluginsData['metrados']]);

        // Verificar si vienen los datos de especialidad y metrado
        if (empty($validatedData['especialidad']) || empty($validatedData['metrado'])) {
            Log::warning('⊘ Plugin metrados activo pero sin datos de especialidad o metrado en la solicitud');
            return;
        }

        $especialidad = strtolower($validatedData['especialidad']);
        $modulo = $validatedData['metrado'];

        Log::info('Datos del metrado a procesar:', [
            'especialidad' => $especialidad,
            'items_metrado' => is_array($modulo) ? count($modulo) : 'no es array'
        ]);

        // Verificar que la especialidad seleccionada esté en los plugins activos
        $metradosPermitidos = array_map('strtolower', $pluginsData['metrados']);
        if (!in_array($especialidad, $metradosPermitidos)) {
            Log::error('✗ Especialidad no permitida', [
                'especialidad_solicitada' => $especialidad,
                'especialidades_permitidas' => $metradosPermitidos
            ]);
            throw new \Exception("La especialidad '{$especialidad}' no está habilitada en los plugins.");
        }

        // Mapeo de especialidades a modelos, claves y primary keys
        $metradoMap = [
            'arquitectura' => [
                'model' => metradoarquitectura::class,
                'key' => 'm_arq_id',
                'primary_key' => 'id_arquitectura'
            ],
            'estructuras' => [
                'model' => metradoestructuras::class,
                'key' => 'm_est_id',
                'primary_key' => 'idmetradoestructuras'
            ],
            'estructura' => [
                'model' => metradoestructuras::class,
                'key' => 'm_est_id',
                'primary_key' => 'idmetradoestructuras'
            ],
            'sanitarias' => [
                'model' => metradosanitarias::class,
                'key' => 'm_san_id',
                'primary_key' => 'idmetradosan'
            ],
            'electricas' => [
                'model' => metradoelectricas::class,
                'key' => 'm_elec_id',
                'primary_key' => 'idmeelectrica'
            ],
            'comunicaciones' => [
                'model' => metradocomunicacion::class,
                'key' => 'm_com_id',
                'primary_key' => 'idmetradocomunicacion'
            ],
            'comunicacion' => [
                'model' => metradocomunicacion::class,
                'key' => 'm_com_id',
                'primary_key' => 'idmetradocomunicacion'
            ],
            'gas' => [
                'model' => metradogas::class,
                'key' => 'm_gas_id',
                'primary_key' => 'idmetradogas'
            ],
        ];

        if (!isset($metradoMap[$especialidad])) {
            Log::error('✗ Especialidad no reconocida en el sistema', [
                'especialidad' => $especialidad,
                'especialidades_validas' => array_keys($metradoMap)
            ]);
            throw new \Exception("Especialidad '{$especialidad}' no reconocida en el sistema.");
        }

        // Crear el metrado correspondiente
        $config = $metradoMap[$especialidad];
        Log::info("Creando metrado de {$especialidad}...", [
            'model' => $config['model'],
            'key' => $config['key'],
            'primary_key' => $config['primary_key']
        ]);

        $metradoInstance = $config['model']::create([
            'especialidad' => $especialidad,
            'documentosdata' => json_encode($modulo),
        ]);

        // Obtener el ID usando el primary key correcto
        $metradoId = $metradoInstance->{$config['primary_key']};

        Log::info("✓ Metrado de {$especialidad} creado exitosamente", [
            'metrado_id' => $metradoId,
            'primary_key_usado' => $config['primary_key'],
            'tabla' => $config['key']
        ]);

        // Preparar los datos para costos_metrados
        $metradoIds = [
            'costos_id' => $costoId,
            'm_arq_id' => null,
            'm_est_id' => null,
            'm_san_id' => null,
            'm_elec_id' => null,
            'm_com_id' => null,
            'm_gas_id' => null,
        ];

        // Asignar el ID al campo correspondiente
        $metradoIds[$config['key']] = $metradoId;

        // Crear la relación costos_metrados
        Log::info('Creando relación costos_metrados...', [
            'costos_id' => $costoId,
            'campo_metrado' => $config['key'],
            'metrado_id' => $metradoId
        ]);

        $costoMetrado = costo_metrado::create($metradoIds);

        Log::info('✓✓✓ Relación costos_metrados creada exitosamente ✓✓✓', [
            'costo_metrado_id' => $costoMetrado->id,
            'relacion_creada' => $config['key'] . ' => ' . $metradoId
        ]);
    }

    /**
     * Procesa los cronogramas según los tipos activos
     */
    private function processCronogramas($validatedData, $cronogramasActivos, $costoId)
    {
        Log::info('Tipos de cronogramas activos:', ['tipos' => $cronogramasActivos]);

        // Verificar si hay datos de cronogramas
        if (empty($validatedData['cronogramas'])) {
            Log::warning('⊘ Plugin cronogramas activo pero sin datos en la solicitud');
            return;
        }

        $cronogramaIds = [
            'costos_cron_id' => $costoId,
            'cron_gen_id' => null,
            'cron_val_id' => null,
            'cron_mat_id' => null,
        ];

        $cronogramaMap = [
            'general' => [
                'field' => 'cron_gen_id',
                'table' => 'cronogramageneral'
            ],
            'valorizado' => [
                'field' => 'cron_val_id',
                'table' => 'cronogramavalorizado'
            ],
            'materiales' => [
                'field' => 'cron_mat_id',
                'table' => 'cronogramamateriales'
            ],
        ];

        $cronogramasProcesados = [];
        $hasData = false;

        foreach ($cronogramasActivos as $tipo) {
            if (isset($cronogramaMap[$tipo])) {
                if (!empty($validatedData['cronogramas'][$tipo])) {
                    Log::info("Procesando cronograma tipo: {$tipo}");

                    // Crear el cronograma en su tabla correspondiente
                    $cronogramaData = $validatedData['cronogramas'][$tipo];

                    // Aquí debes crear el registro en la tabla correspondiente
                    // Por ahora, asumiendo que usas el modelo Cronograma para todos
                    // Ajusta según tus modelos específicos
                    $cronograma = Cronograma::create([
                        'nombrecronograma' => 10.2,
                        'datacronograma' => json_encode($cronogramaData),
                    ]);

                    // Guardar el ID del cronograma creado
                    $cronogramaIds[$cronogramaMap[$tipo]['field']] = $cronograma->id;
                    $cronogramasProcesados[] = $tipo;
                    $hasData = true;

                    Log::info("✓ Cronograma '{$tipo}' creado exitosamente", [
                        'cronograma_id' => $cronograma->id,
                        'items' => is_array($cronogramaData) ? count($cronogramaData) : 'no es array'
                    ]);
                } else {
                    Log::warning("⊘ Cronograma '{$tipo}' activo pero sin datos en la solicitud");
                }
            } else {
                Log::warning("⊘ Tipo de cronograma '{$tipo}' no reconocido", [
                    'tipos_validos' => array_keys($cronogramaMap)
                ]);
            }
        }

        // Solo crear la relación si al menos un cronograma tiene datos
        if ($hasData) {
            Log::info('Creando relación costo_cronograma en base de datos...', [
                'costos_cron_id' => $costoId,
                'cronogramas_incluidos' => $cronogramasProcesados,
                'ids_cronogramas' => array_filter($cronogramaIds, fn($v) => !is_null($v))
            ]);

            $costoCronograma = costo_cronograma::create($cronogramaIds);

            Log::info('✓✓✓ Relación costo_cronograma creada exitosamente ✓✓✓', [
                'costo_cronograma_id' => $costoCronograma->id,
                'cronogramas_vinculados' => $cronogramasProcesados
            ]);
        } else {
            Log::warning('⊘ No se creó ninguna relación costo_cronograma porque ningún cronograma tiene datos');
        }
    }

    /**
     * Display the specified resource.
     */
    /**
     * Display the specified resource.
     *
     * Note: This route will render a view that receives sensitive data server-side
     * and does NOT expose the data in the URL. For the AJAX edit modal we provide
     * an explicit edit() method that returns JSON.
     */
    // public function show(string $id)
    // {
    //     try {
    //         $costos = Costos::findOrFail($id);

    //         // Render the controlCostos view and pass the model.
    //         // The view can read the data without exposing it in query params.
    //         return view('gestor_vista.Construyehc.costos.controlCostos', compact('costos'));
    //     } catch (Exception $e) {
    //         return redirect()->back()->with('error', 'Costos no encontrado');
    //     }
    // }

    /**
     * Return the resource data as JSON for AJAX edit modal.
     * This keeps the edit modal population separate from the show view.
     */
    public function edit(string $id)
    {
        try {
            $costos = Costos::findOrFail($id);

            $data = [
                'id' => $costos->id,
                'name' => $costos->name,
                'codigouei' => $costos->codigouei,
                'codigosnip' => $costos->codigosnip,
                'codigocui' => $costos->codigocui,
                'unidad_ejecutora' => $costos->unidad_ejecutora,
                'codigolocal' => $costos->codigolocal,
                'codigomodular' => $costos->codigomodular,
                'fecha' => $costos->fecha,
                'region' =>  $costos->region,
                'provincia' =>  $costos->provincia,
                'distrito' =>  $costos->distrito,
                'centropoblado' =>  $costos->centropoblado,
            ];

            return response()->json($data);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Costos no encontrado'
            ], 404);
        }
    }

    /**
     * Securely render the controlCostos view using POST (id in request body).
     * This avoids exposing sensitive data in the URL.
     */
    public function showSecure(Request $request)
    {
        try {
            $request->validate(['id' => 'required|integer']);
            $id = $request->input('id');

            // Eager load metrados relation and extract ids for the frontend tree
            $costos = Costos::with('metrados')->findOrFail($id);

            // Map related metrados to their ids only (if you only need ids for the tree)
            $costoMetrados = costo_metrado::where('costos_id', $id)->get();
            $presupuestos = presupuestos::where('costos_pres_id', $id)->pluck('id');
            $costoCronograma = costo_cronograma::where('costos_cron_id', $id)->get();
            $ettp = especificacionesTecnicas::where('costos_ettp_id', $id)->pluck('id');

            return view('gestor_vista.Construyehc.costos.controlCostos', [
                'id' => $id,
                'costos' => $costos,
                'metradoIds' => $costoMetrados,
                'presupuestosIds' => $presupuestos,
                'conogramaIds' => $costoCronograma,
                'ettpIds' => $ettp,
            ]);
        } catch (ValidationException $e) {
            return redirect()->back()->with('error', 'ID inválido');
        } catch (Exception $e) {
            return redirect()->back()->with('error', 'Costos no encontrado');
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            // Validación de los datos
            $validatedData = $request->validate([
                'name' => 'required|string|max:500',
                'codigouei' => 'required|string|max:255',
                'codigosnip' => 'required|string|max:255',
                'codigocui' => 'required|string|max:255',
                'unidad_ejecutora' => 'required|string|max:255',
                'codigolocal' => 'required|string|max:255',
                'codigomodular' => 'required|string',
                'fecha' => 'required|date',
                'region' => 'required|string|max:255',
                'provincia' => 'required|string|max:255',
                'distrito' => 'required|string|max:255',
                'centropoblado' => 'required|string|max:255',
            ], [
                'name.required' => 'El nombre del proyecto es obligatorio',
                'name.max' => 'El nombre del proyecto no puede exceder 500 caracteres',
                'codigouei.required' => 'La UEI es obligatoria',
                'codigosnip.required' => 'El código SNIP es obligatorio',
                'codigocui.required' => 'El código CUI es obligatorio',
                'unidad_ejecutora.required' => 'La unidad ejecutora es obligatoria',
                'codigolocal.required' => 'El código local es obligatorio',
                'codigomodular.required' => 'Debe seleccionar al menos un nivel educativo',
                'especialidad.required' => 'La especialidad es obligatoria',
                'fecha.required' => 'La fecha es obligatoria',
                'fecha.date' => 'La fecha debe ser una fecha válida',
                'region.required' => 'La region es obligatoria',
                'provincia.required' => 'La region es obligatoria',
                'distrito.required' => 'La region es obligatoria',
            ]);

            // Validar que el JSON de codigomodular tenga al menos un nivel educativo
            $codigoModular = json_decode($validatedData['codigomodular'], true);
            if (empty($codigoModular) || !is_array($codigoModular)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Debe seleccionar al menos un nivel educativo con su código correspondiente'
                ], 422);
            }

            // Iniciar transacción
            DB::beginTransaction();

            // Buscar y actualizar el metrado
            $costos = Costos::findOrFail($id);

            $costos->update([
                'name' => $validatedData['name'],
                'codigouei' => $validatedData['codigouei'],
                'codigosnip' => $validatedData['codigosnip'],
                'codigocui' => $validatedData['codigocui'],
                'unidad_ejecutora' => $validatedData['unidad_ejecutora'],
                'codigolocal' => $validatedData['codigolocal'],
                'codigomodular' => $validatedData['codigomodular'],
                'fecha' => $validatedData['fecha'],
                'region' => $validatedData['region'],
                'provincia' => $validatedData['provincia'],
                'distrito' => $validatedData['distrito'],
                'centropoblado' => $validatedData['centropoblado'],
            ]);

            // Confirmar transacción
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Costos actualizado exitosamente',
                'data' => $costos
            ]);
        } catch (ValidationException $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            DB::beginTransaction();

            $Costos = Costos::findOrFail($id);

            Log::info('========================================');
            Log::info('=== INICIANDO ELIMINACIÓN DE PROYECTO ===');
            Log::info('========================================');
            Log::info('Proyecto a eliminar:', [
                'costos_id' => $id,
                'nombre' => $Costos->name
            ]);

            // ============================================
            // 1. ELIMINAR PRESUPUESTOS Y SUS RAMAS
            // ============================================
            Log::info('--- Eliminando PRESUPUESTOS y sus ramas ---');
            $presupuestos = presupuestos::where('costos_pres_id', $id)->get();

            foreach ($presupuestos as $presupuesto) {
                Log::info('Procesando presupuesto', ['presupuesto_id' => $presupuesto->id]);

                //     // Eliminar ramas de presupuesto (ajusta según tus tablas relacionadas)
                //     // Ejemplo: si tienes tablas como presupuesto_detalles, presupuesto_partidas, etc.

                //     // Si tienes una tabla de detalles de presupuesto
                //     if (Schema::hasTable('presupuesto_detalles')) {
                //         DB::table('presupuesto_detalles')
                //             ->where('presupuesto_id', $presupuesto->id)
                //             ->delete();
                //         Log::info('Detalles de presupuesto eliminados', ['presupuesto_id' => $presupuesto->id]);
                //     }

                //     // Si tienes una tabla de partidas de presupuesto
                //     if (Schema::hasTable('presupuesto_partidas')) {
                //         DB::table('presupuesto_partidas')
                //             ->where('presupuesto_id', $presupuesto->id)
                //             ->delete();
                //         Log::info('Partidas de presupuesto eliminadas', ['presupuesto_id' => $presupuesto->id]);
                //     }

                //     // Si tienes una tabla de análisis de precios unitarios
                //     if (Schema::hasTable('analisis_precios_unitarios')) {
                //         DB::table('analisis_precios_unitarios')
                //             ->where('presupuesto_id', $presupuesto->id)
                //             ->delete();
                //         Log::info('APUs eliminados', ['presupuesto_id' => $presupuesto->id]);
                //     }

                // Eliminar el presupuesto principal
                $presupuesto->delete();
                Log::info('✓ Presupuesto eliminado', ['presupuesto_id' => $presupuesto->id]);
            }

            Log::info('✓✓✓ Presupuestos y ramas eliminados exitosamente');

            // ============================================
            // 2. ELIMINAR ESPECIFICACIONES TÉCNICAS
            // ============================================
            Log::info('--- Eliminando ESPECIFICACIONES TÉCNICAS ---');
            $especificaciones = especificacionesTecnicas::where('costos_ettp_id', $id)->get();

            foreach ($especificaciones as $especificacion) {
                // Si tienes sub-tablas de especificaciones técnicas, elimínalas aquí
                // Ejemplo: detalles de especificaciones, documentos adjuntos, etc.

                $especificacion->delete();
                Log::info('✓ Especificación técnica eliminada', ['especificacion_id' => $especificacion->id]);
            }

            Log::info('✓✓✓ Especificaciones técnicas eliminadas exitosamente');

            // ============================================
            // 3. ELIMINAR CRONOGRAMAS Y SUS RAMAS
            // ============================================
            Log::info('--- Eliminando CRONOGRAMAS y sus ramas ---');
            $costoCron = costo_cronograma::where('costos_cron_id', $id)->first();

            if ($costoCron) {
                // Eliminar cronograma general
                if (!empty($costoCron->cron_gen_id)) {
                    $cronogramaGeneral = Cronograma::find($costoCron->cron_gen_id);
                    if ($cronogramaGeneral) {
                        // Si tienes sub-tablas de cronograma general
                        if (Schema::hasTable('cronograma_actividades')) {
                            DB::table('cronograma_actividades')
                                ->where('cronograma_id', $cronogramaGeneral->id)
                                ->delete();
                            Log::info('Actividades de cronograma general eliminadas');
                        }

                        $cronogramaGeneral->delete();
                        Log::info('✓ Cronograma general eliminado', ['id' => $costoCron->cron_gen_id]);
                    }
                }

                // Eliminar cronograma valorizado
                if (!empty($costoCron->cron_val_id)) {
                    $cronogramaValorizado = Cronograma::find($costoCron->cron_val_id);
                    if ($cronogramaValorizado) {
                        // Si tienes sub-tablas de cronograma valorizado
                        if (Schema::hasTable('cronograma_valorizado_detalles')) {
                            DB::table('cronograma_valorizado_detalles')
                                ->where('cronograma_id', $cronogramaValorizado->id)
                                ->delete();
                            Log::info('Detalles de cronograma valorizado eliminados');
                        }

                        $cronogramaValorizado->delete();
                        Log::info('✓ Cronograma valorizado eliminado', ['id' => $costoCron->cron_val_id]);
                    }
                }

                // Eliminar cronograma de materiales
                if (!empty($costoCron->cron_mat_id)) {
                    $cronogramaMateriales = Cronograma::find($costoCron->cron_mat_id);
                    if ($cronogramaMateriales) {
                        // Si tienes sub-tablas de cronograma de materiales
                        if (Schema::hasTable('cronograma_materiales_detalles')) {
                            DB::table('cronograma_materiales_detalles')
                                ->where('cronograma_id', $cronogramaMateriales->id)
                                ->delete();
                            Log::info('Detalles de cronograma materiales eliminados');
                        }

                        $cronogramaMateriales->delete();
                        Log::info('✓ Cronograma materiales eliminado', ['id' => $costoCron->cron_mat_id]);
                    }
                }

                // Eliminar la relación costo_cronograma
                $costoCron->delete();
                Log::info('✓ Registro costo_cronograma eliminado');
            } else {
                Log::info('⊘ No existe registro costo_cronograma para este proyecto');
            }

            Log::info('✓✓✓ Cronogramas y ramas eliminados exitosamente');

            // ============================================
            // 4. ELIMINAR METRADOS Y SUS RAMAS
            // ============================================
            Log::info('--- Eliminando METRADOS y sus ramas ---');
            $costoMet = costo_metrado::where('costos_id', $id)->first();

            if ($costoMet) {
                // Metrado de Arquitectura
                if (!empty($costoMet->m_arq_id)) {
                    $metradoArq = metradoarquitectura::where('id_arquitectura', $costoMet->m_arq_id)->first();
                    if ($metradoArq) {
                        // Si tienes sub-tablas de metrado arquitectura
                        if (Schema::hasTable('metrado_arquitectura_detalles')) {
                            DB::table('metrado_arquitectura_detalles')
                                ->where('metrado_arq_id', $metradoArq->id_arquitectura)
                                ->delete();
                            Log::info('Detalles de metrado arquitectura eliminados');
                        }

                        $metradoArq->delete();
                        Log::info('✓ Metrado arquitectura eliminado', ['id' => $costoMet->m_arq_id]);
                    }
                }

                // Metrado de Estructuras
                if (!empty($costoMet->m_est_id)) {
                    $metradoEst = metradoestructuras::where('idmetradoestructuras', $costoMet->m_est_id)->first();
                    if ($metradoEst) {
                        // Si tienes sub-tablas de metrado estructuras
                        if (Schema::hasTable('metrado_estructuras_detalles')) {
                            DB::table('metrado_estructuras_detalles')
                                ->where('metrado_est_id', $metradoEst->idmetradoestructuras)
                                ->delete();
                            Log::info('Detalles de metrado estructuras eliminados');
                        }

                        $metradoEst->delete();
                        Log::info('✓ Metrado estructuras eliminado', ['id' => $costoMet->m_est_id]);
                    }
                }

                // Metrado de Sanitarias
                if (!empty($costoMet->m_san_id)) {
                    $metradoSan = metradosanitarias::where('idmetradosan', $costoMet->m_san_id)->first();
                    if ($metradoSan) {
                        // Si tienes sub-tablas de metrado sanitarias
                        if (Schema::hasTable('metrado_sanitarias_detalles')) {
                            DB::table('metrado_sanitarias_detalles')
                                ->where('metrado_san_id', $metradoSan->idmetradosan)
                                ->delete();
                            Log::info('Detalles de metrado sanitarias eliminados');
                        }

                        $metradoSan->delete();
                        Log::info('✓ Metrado sanitarias eliminado', [
                            'id' => $costoMet->m_san_id,
                            'cantidad_modulos' => $metradoSan->cantidadModulo
                        ]);
                    }
                }

                // Metrado de Eléctricas
                if (!empty($costoMet->m_elec_id)) {
                    $metradoElec = metradoelectricas::where('idmeelectrica', $costoMet->m_elec_id)->first();
                    if ($metradoElec) {
                        // Si tienes sub-tablas de metrado eléctricas
                        if (Schema::hasTable('metrado_electricas_detalles')) {
                            DB::table('metrado_electricas_detalles')
                                ->where('metrado_elec_id', $metradoElec->idmeelectrica)
                                ->delete();
                            Log::info('Detalles de metrado eléctricas eliminados');
                        }

                        $metradoElec->delete();
                        Log::info('✓ Metrado eléctricas eliminado', ['id' => $costoMet->m_elec_id]);
                    }
                }

                // Metrado de Comunicación
                if (!empty($costoMet->m_com_id)) {
                    $metradoCom = metradocomunicacion::where('idmetradocomunicacion', $costoMet->m_com_id)->first();
                    if ($metradoCom) {
                        // Si tienes sub-tablas de metrado comunicación
                        if (Schema::hasTable('metrado_comunicacion_detalles')) {
                            DB::table('metrado_comunicacion_detalles')
                                ->where('metrado_com_id', $metradoCom->idmetradocomunicacion)
                                ->delete();
                            Log::info('Detalles de metrado comunicación eliminados');
                        }

                        $metradoCom->delete();
                        Log::info('✓ Metrado comunicación eliminado', ['id' => $costoMet->m_com_id]);
                    }
                }

                // Metrado de Gas
                if (!empty($costoMet->m_gas_id)) {
                    $metradoGas = metradogas::where('idmetradogas', $costoMet->m_gas_id)->first();
                    if ($metradoGas) {
                        // Si tienes sub-tablas de metrado gas
                        if (Schema::hasTable('metrado_gas_detalles')) {
                            DB::table('metrado_gas_detalles')
                                ->where('metrado_gas_id', $metradoGas->idmetradogas)
                                ->delete();
                            Log::info('Detalles de metrado gas eliminados');
                        }

                        $metradoGas->delete();
                        Log::info('✓ Metrado gas eliminado', ['id' => $costoMet->m_gas_id]);
                    }
                }

                // Eliminar la relación costos_metrados
                $costoMet->delete();
                Log::info('✓ Registro costos_metrados eliminado');
            } else {
                Log::info('⊘ No existe registro costos_metrados para este proyecto');
            }

            Log::info('✓✓✓ Metrados y ramas eliminados exitosamente');

            // ============================================
            // 5. ELIMINAR EL PROYECTO PRINCIPAL (COSTOS)
            // ============================================
            Log::info('--- Eliminando proyecto principal (COSTOS) ---');
            $Costos->delete();
            Log::info('✓✓✓ Proyecto Costos eliminado exitosamente', [
                'costos_id' => $id,
                'nombre' => $Costos->name
            ]);

            DB::commit();

            Log::info('========================================');
            Log::info('✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓');
            Log::info('✓✓✓ ELIMINACIÓN COMPLETADA EXITOSAMENTE ✓✓✓');
            Log::info('✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓');
            Log::info('========================================');

            return redirect()->route('costos.index')
                ->with('success', 'Proyecto y todas sus ramas eliminadas exitosamente');
        } catch (ModelNotFoundException $e) {
            DB::rollback();
            Log::error('✗✗✗ Proyecto no encontrado ✗✗✗', [
                'costos_id' => $id,
                'error' => $e->getMessage()
            ]);

            return redirect()->back()
                ->with('error', 'El proyecto no fue encontrado');
        } catch (Exception $e) {
            DB::rollback();

            Log::error('========================================');
            Log::error('✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗');
            Log::error('✗✗✗ ERROR AL ELIMINAR PROYECTO ✗✗✗');
            Log::error('✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗');
            Log::error('========================================');
            Log::error('Detalles del error:', [
                'costos_id' => $id,
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()
                ->with('error', 'Error al eliminar el proyecto: ' . $e->getMessage());
        }
    }
}
