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
        //Log::info('=== INICIO DEL PROCESO DE CREACIÓN ===');
        //Log::info('Datos recibidos del BACKEND', $request->all());

        try {
            // Obtener plugins (puede venir como array o string JSON)
            $pluginsData = $request->input('plugins');

            // Si viene como string, decodificar
            if (is_string($pluginsData)) {
                $pluginsData = json_decode($pluginsData, true);
                //Log::info('Plugins decodificados desde JSON string');
            }

            //Log::info('Plugins procesados', ['plugins' => $pluginsData]);

            if (empty($pluginsData) || !is_array($pluginsData)) {
                //Log::error('Estructura de plugins inválida', ['plugins' => $pluginsData]);
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

            //Log::info('Reglas base de validación creadas', ['campos_base' => array_keys($rules)]);

            // Validación dinámica según plugins activos Y si los datos están presentes
            if (!empty($pluginsData['metrados']) && is_array($pluginsData['metrados'])) {
                if ($request->has('especialidad') && $request->has('metrado')) {
                    $metradosLower = array_map('strtolower', $pluginsData['metrados']);
                    $rules['especialidad'] = 'required|string|in:' . implode(',', $metradosLower);
                    $rules['metrado'] = 'required|array';
                    // Log::info('✓ Validación de metrados agregada', [
                    //     'especialidades_permitidas' => $metradosLower
                    // ]);
                } else {
                    //Log::info('⊘ Plugin metrados activo pero datos no enviados en la petición');
                }
            } else {
                //Log::info('⊘ No se requiere validación de metrados (plugin no activo)');
            }

            if (!empty($pluginsData['presupuesto']) && $pluginsData['presupuesto'] === true) {
                if ($request->has('presupuesto')) {
                    $rules['presupuesto'] = 'required|array';
                    //Log::info('✓ Validación de presupuesto agregada');
                } else {
                    //Log::info('⊘ Plugin presupuesto activo pero datos no enviados en la petición');
                }
            } else {
                //Log::info('⊘ No se requiere validación de presupuesto (plugin no activo)');
            }

            if (!empty($pluginsData['especificaciones']) && $pluginsData['especificaciones'] === true) {
                if ($request->has('especificaciones_tecnicas')) {
                    $rules['especificaciones_tecnicas'] = 'required|array';
                    //Log::info('✓ Validación de especificaciones técnicas agregada');
                } else {
                    //Log::info('⊘ Plugin especificaciones activo pero datos no enviados en la petición');
                }
            } else {
                //Log::info('⊘ No se requiere validación de especificaciones (plugin no activo)');
            }

            if (!empty($pluginsData['cronogramas']) && is_array($pluginsData['cronogramas'])) {
                if ($request->has('cronogramas')) {
                    foreach ($pluginsData['cronogramas'] as $cronograma) {
                        if ($request->has("cronogramas.{$cronograma}")) {
                            $rules["cronogramas.{$cronograma}"] = 'required|array';
                        }
                    }
                    // Log::info('✓ Validación de cronogramas agregada', [
                    //     'tipos_cronogramas' => $pluginsData['cronogramas']
                    // ]);
                } else {
                    //Log::info('⊘ Plugin cronogramas activo pero datos no enviados en la petición');
                }
            } else {
                //Log::info('⊘ No se requiere validación de cronogramas (plugin no activo)');
            }

            // Log::info('Reglas finales de validación', [
            //     'total_reglas' => count($rules),
            //     'campos' => array_keys($rules)
            // ]);

            // Realizar validación
            //Log::info('Iniciando validación de datos...');
            $validatedData = $request->validate($rules);
            //Log::info('✓✓✓ Validación exitosa ✓✓✓');

            // Validar código modular
            //Log::info('Validando código modular...');
            $codigoModular = json_decode($validatedData['codigomodular'], true);
            //Log::info('Código modular decodificado', ['codigomodular' => $codigoModular]);

            if (empty($codigoModular) || !is_array($codigoModular)) {
                //Log::error('✗ Código modular inválido', ['codigomodular' => $codigoModular]);
                return response()->json([
                    'success' => false,
                    'message' => 'Debe seleccionar al menos un nivel educativo con su código correspondiente'
                ], 422);
            }
            //Log::info('✓ Código modular válido');

            //Log::info('=== INICIANDO TRANSACCIÓN DE BASE DE DATOS ===');
            DB::beginTransaction();

            // Crear el proyecto principal (Costos)
            //Log::info('Creando registro principal en tabla Costos...');
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
            // Log::info('✓✓✓ Costo creado exitosamente ✓✓✓', [
            //     'costo_id' => $costo->id,
            //     'nombre' => $costo->name
            // ]);

            // Procesar Metrados solo si existen
            //Log::info('========================================');
            //Log::info('=== PROCESANDO PLUGINS (RAMAS) ===');
            //Log::info('========================================');

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
                                //Log::info('Metrado arquitectura creado y vinculado', ['id' => $costoMetrado->m_arq_id]);
                                break;
                            case 'estructuras':
                            case 'estructura':
                                $metradoEst = metradoestructuras::create([
                                    'especialidad' => 'estructuras',
                                    'documentosdata' => json_encode([]),
                                    'resumenmetrados' => null,
                                ]);
                                $costoMetrado->m_est_id = $metradoEst->idmetradoestructuras ?? $metradoEst->getKey();
                                //Log::info('Metrado estructuras creado y vinculado', ['id' => $costoMetrado->m_est_id]);
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
                                //Log::info('Metrado sanitarias creado y vinculado', ['id' => $costoMetrado->m_san_id]);
                                break;
                            case 'electricas':
                                $metradoElec = metradoelectricas::create([
                                    'especialidad' => 'electricas',
                                    'documentosdata' => json_encode([]),
                                    'resumenmetrados' => null,
                                ]);
                                $costoMetrado->m_elec_id = $metradoElec->idmeelectrica ?? $metradoElec->getKey();
                                //Log::info('Metrado electricas creado y vinculado', ['id' => $costoMetrado->m_elec_id]);
                                break;
                            case 'comunicacion':
                            case 'comunicaciones':
                                $metradoCom = metradocomunicacion::create([
                                    'especialidad' => 'comunicacion',
                                    'documentosdata' => json_encode([]),
                                    'resumenmetrados' => null,
                                ]);
                                $costoMetrado->m_com_id = $metradoCom->idmetradocomunicacion ?? $metradoCom->getKey();
                                //Log::info('Metrado comunicacion creado y vinculado', ['id' => $costoMetrado->m_com_id]);
                                break;
                            case 'gas':
                                $metradoGas = metradogas::create([
                                    'especialidad' => 'gas',
                                    'documentosdata' => json_encode([]),
                                    'resumenmetrados' => null,
                                ]);
                                $costoMetrado->m_gas_id = $metradoGas->idmetradogas ?? $metradoGas->getKey();
                                //Log::info('Metrado gas creado y vinculado', ['id' => $costoMetrado->m_gas_id]);
                                break;
                            default:
                                //Log::warning('Tipo de metrado no reconocido al procesar plugins', ['tipo' => $tipoLower]);
                                break;
                        }
                    }

                    // Guardar la relación costos_metrados con los ids enlazados
                    $costoMetrado->costos_id = $costo->id;
                    $costoMetrado->save();
                    //Log::info('Fila costos_metrados guardada/actualizada con metrado(s) vinculados', ['costos_id' => $costo->id, 'record_id' => $costoMetrado->id ?? null]);
                }
            } catch (Exception $e) {
                //Log::warning('Error creando metrados desde plugins: ' . $e->getMessage());
            }

            // Crear presupuesto solo si está activo
            if (!empty($pluginsData['presupuesto']) && $pluginsData['presupuesto'] === true) {
                //Log::info('--- Plugin: PRESUPUESTO ---');

                if (!empty($validatedData['presupuesto'])) {
                    //Log::info('Creando presupuesto con datos recibidos...');
                    presupuestos::create([
                        'datapresupuestos' => json_encode($validatedData['presupuesto']),
                        'costos_pres_id' => $costo->id,
                    ]);
                    //Log::info('✓ Presupuesto creado exitosamente');
                } else {
                    // Crear presupuesto vacío para reservar la rama
                    presupuestos::create([
                        'datapresupuestos' => json_encode([]),
                        'costos_pres_id' => $costo->id,
                    ]);
                    //Log::info('Presupuesto creado (vacío) porque el plugin está activo', ['costos_id' => $costo->id]);
                }
            } else {
                //Log::info('⊘ Plugin PRESUPUESTO no está activo - No se creará');
            }

            // Crear especificaciones técnicas solo si están activas
            if (!empty($pluginsData['especificaciones']) && $pluginsData['especificaciones'] === true) {
                //Log::info('--- Plugin: ESPECIFICACIONES TÉCNICAS ---');

                if (!empty($validatedData['especificaciones_tecnicas'])) {
                    //Log::info('Creando especificaciones técnicas con datos recibidos...');
                    especificacionesTecnicas::create([
                        'datosEspecificacionTecnica' => json_encode($validatedData['especificaciones_tecnicas']),
                        'costos_ettp_id' => $costo->id,
                    ]);
                    //Log::info('✓ Especificaciones técnicas creadas exitosamente');
                } else {
                    // Crear especificación técnica vacía para reservar la rama
                    especificacionesTecnicas::create([
                        'datosEspecificacionTecnica' => json_encode([]),
                        'costos_ettp_id' => $costo->id,
                    ]);
                    //Log::info('Especificaciones técnicas creadas (vacío) porque el plugin está activo', ['costos_id' => $costo->id]);
                }
            } else {
                //Log::info('⊘ Plugin ESPECIFICACIONES TÉCNICAS no está activo - No se creará');
            }

            // Crear cronogramas solo si existen
            if (!empty($pluginsData['cronogramas']) && is_array($pluginsData['cronogramas'])) {
                //Log::info('--- Plugin: CRONOGRAMAS ---');

                // Verificar si el cronograma general está en los activos
                if (in_array('general', $pluginsData['cronogramas'])) {
                    //Log::info('Creando cronograma general...');

                    // Crear cronograma general (campos pueden ser null)
                    $cronogramaGeneral = Cronograma::create([
                        'montos' => null,
                        'datacronograma' => null,
                    ]);

                    //Log::info('✓ Cronograma general creado', [
                        //'cronograma_id' => $cronogramaGeneral->id
                    //]);

                    // Crear la relación en costo_cronograma
                    costo_cronograma::create([
                        'costos_cron_id' => $costo->id,
                        'cron_gen_id' => $cronogramaGeneral->id,
                        'cron_val_id' => null,
                        'cron_mat_id' => null,
                    ]);

                    //Log::info('✓✓✓ Relación costo_cronograma creada con cronograma general ✓✓✓', [
                       // 'costos_id' => $costo->id,
                       // 'cron_gen_id' => $cronogramaGeneral->id
                    //]);
                } else {
                    //Log::info('⊘ Cronograma general no está en los plugins activos');
                }
            } else {
                //Log::info('⊘ Plugin CRONOGRAMAS no está activo - No se creará');
            }

            //Log::info('========================================');
            //Log::info('=== FINALIZANDO TRANSACCIÓN ===');
            //Log::info('========================================');
            DB::commit();

            //Log::info('✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓');
            //Log::info('✓✓✓ PROYECTO CREADO EXITOSAMENTE ✓✓✓');
            //Log::info('✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓');
            // Log::info('Resumen:', [
            //     'costo_id' => $costo->id,
            //     'nombre' => $costo->name,
            //     'plugins_procesados' => array_keys(array_filter([
            //         'metrados' => !empty($pluginsData['metrados']),
            //         'presupuesto' => !empty($pluginsData['presupuesto']),
            //         'especificaciones' => !empty($pluginsData['especificaciones']),
            //         'cronogramas' => !empty($pluginsData['cronogramas']),
            //     ]))
            // ]);

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
            //Log::error('✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗');
            //Log::error('✗✗✗ ERROR DE VALIDACIÓN ✗✗✗');
            //Log::error('✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗');
            // //Log::error('Errores de validación:', [
            //     'errors' => $e->errors(),
            //     'message' => $e->getMessage()
            // ]);

            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            //Log::error('✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗');
            //Log::error('✗✗✗ ERROR CRÍTICO ✗✗✗');
            //Log::error('✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗');
            // Log::error('Detalles del error:', [
            //     'message' => $e->getMessage(),
            //     'file' => $e->getFile(),
            //     'line' => $e->getLine(),
            //     'trace' => $e->getTraceAsString()
            // ]);

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
        //Log::info('--- Plugin: METRADOS ---');
        //Log::info('Iniciando procesamiento de metrados...');

        // Verificar si hay metrados activos
        if (empty($pluginsData['metrados']) || !is_array($pluginsData['metrados'])) {
            //Log::warning('⊘ No hay metrados activos en los plugins - No se creará ningún metrado');
            return;
        }

        //Log::info('Metrados activos en plugins:', ['metrados' => $pluginsData['metrados']]);

        // Verificar si vienen los datos de especialidad y metrado
        if (empty($validatedData['especialidad']) || empty($validatedData['metrado'])) {
            //Log::warning('⊘ Plugin metrados activo pero sin datos de especialidad o metrado en la solicitud');
            return;
        }

        $especialidad = strtolower($validatedData['especialidad']);
        $modulo = $validatedData['metrado'];

        // Log::info('Datos del metrado a procesar:', [
        //     'especialidad' => $especialidad,
        //     'items_metrado' => is_array($modulo) ? count($modulo) : 'no es array'
        // ]);

        // Verificar que la especialidad seleccionada esté en los plugins activos
        $metradosPermitidos = array_map('strtolower', $pluginsData['metrados']);
        if (!in_array($especialidad, $metradosPermitidos)) {
            // Log::error('✗ Especialidad no permitida', [
            //     'especialidad_solicitada' => $especialidad,
            //     'especialidades_permitidas' => $metradosPermitidos
            // ]);
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
            // Log::error('✗ Especialidad no reconocida en el sistema', [
            //     'especialidad' => $especialidad,
            //     'especialidades_validas' => array_keys($metradoMap)
            // ]);
            throw new \Exception("Especialidad '{$especialidad}' no reconocida en el sistema.");
        }

        // Crear el metrado correspondiente
        $config = $metradoMap[$especialidad];
        // Log::info("Creando metrado de {$especialidad}...", [
        //     'model' => $config['model'],
        //     'key' => $config['key'],
        //     'primary_key' => $config['primary_key']
        // ]);

        $metradoInstance = $config['model']::create([
            'especialidad' => $especialidad,
            'documentosdata' => json_encode($modulo),
        ]);

        // Obtener el ID usando el primary key correcto
        $metradoId = $metradoInstance->{$config['primary_key']};

        // Log::info("✓ Metrado de {$especialidad} creado exitosamente", [
        //     'metrado_id' => $metradoId,
        //     'primary_key_usado' => $config['primary_key'],
        //     'tabla' => $config['key']
        // ]);

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
        // Log::info('Creando relación costos_metrados...', [
        //     'costos_id' => $costoId,
        //     'campo_metrado' => $config['key'],
        //     'metrado_id' => $metradoId
        // ]);

        $costoMetrado = costo_metrado::create($metradoIds);

        // Log::info('✓✓✓ Relación costos_metrados creada exitosamente ✓✓✓', [
        //     'costo_metrado_id' => $costoMetrado->id,
        //     'relacion_creada' => $config['key'] . ' => ' . $metradoId
        // ]);
    }

    /**
     * Procesa los cronogramas según los tipos activos
     */
    private function processCronogramas($validatedData, $cronogramasActivos, $costoId)
    {
        //Log::info('Tipos de cronogramas activos:', ['tipos' => $cronogramasActivos]);

        // Verificar si hay datos de cronogramas
        if (empty($validatedData['cronogramas'])) {
            //Log::warning('⊘ Plugin cronogramas activo pero sin datos en la solicitud');
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
                    //Log::info("Procesando cronograma tipo: {$tipo}");

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

                    // Log::info("✓ Cronograma '{$tipo}' creado exitosamente", [
                    //     'cronograma_id' => $cronograma->id,
                    //     'items' => is_array($cronogramaData) ? count($cronogramaData) : 'no es array'
                    // ]);
                } else {
                    //Log::warning("⊘ Cronograma '{$tipo}' activo pero sin datos en la solicitud");
                }
            } else {
                // Log::warning("⊘ Tipo de cronograma '{$tipo}' no reconocido", [
                //     'tipos_validos' => array_keys($cronogramaMap)
                // ]);
            }
        }

        // Solo crear la relación si al menos un cronograma tiene datos
        if ($hasData) {
            // Log::info('Creando relación costo_cronograma en base de datos...', [
            //     'costos_cron_id' => $costoId,
            //     'cronogramas_incluidos' => $cronogramasProcesados,
            //     'ids_cronogramas' => array_filter($cronogramaIds, fn($v) => !is_null($v))
            // ]);

            $costoCronograma = costo_cronograma::create($cronogramaIds);

            // Log::info('✓✓✓ Relación costo_cronograma creada exitosamente ✓✓✓', [
            //     'costo_cronograma_id' => $costoCronograma->id,
            //     'cronogramas_vinculados' => $cronogramasProcesados
            // ]);
        } else {
            //Log::warning('⊘ No se creó ninguna relación costo_cronograma porque ningún cronograma tiene datos');
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
    public function edit($id)
    {
        //Log::info('========================================');
        //Log::info('=== INICIANDO EDIT - ID: ' . $id . ' ===');
        //Log::info('========================================');

        try {
            // 1. Buscar el proyecto con sus relaciones principales
            //Log::info('Paso 1: Buscando proyecto con relaciones...');

            $costos = Costos::with([
                'costoMetrado',
                'presupuesto',
                'especificacionesTecnicas',
                'costoCronograma',
            ])->findOrFail($id);

            // Log::info('✓ Proyecto encontrado', [
            //     'id' => $costos->id,
            //     'nombre' => $costos->name
            // ]);

            // // 2. Log de relaciones encontradas
            // Log::info('Relaciones cargadas:', [
            //     'costoMetrado' => $costos->costoMetrado ? 'SÍ (ID: ' . $costos->costoMetrado->id . ')' : 'NO',
            //     'presupuesto' => $costos->presupuesto ? 'SÍ (ID: ' . $costos->presupuesto->id . ')' : 'NO',
            //     'especificacionesTecnicas' => $costos->especificacionesTecnicas ? 'SÍ (ID: ' . $costos->especificacionesTecnicas->id . ')' : 'NO',
            //     'costoCronograma' => $costos->costoCronograma ? 'SÍ (ID: ' . $costos->costoCronograma->id . ')' : 'NO',
            // ]);

            // 3. Detectar plugins activos
            //Log::info('Paso 2: Detectando plugins activos...');

            $pluginsActivos = [
                'metrados' => [],
                'presupuesto' => false,
                'especificaciones' => false,
                'cronogramas' => []
            ];

            $cantidadModulos = 0;

            // 4. METRADOS
            if ($costos->costoMetrado) {
                //Log::info('--- Procesando METRADOS ---');
                $metrado = $costos->costoMetrado;

                // Log::info('IDs de metrados encontrados:', [
                //     'm_arq_id' => $metrado->m_arq_id,
                //     'm_est_id' => $metrado->m_est_id,
                //     'm_san_id' => $metrado->m_san_id,
                //     'm_elec_id' => $metrado->m_elec_id,
                //     'm_com_id' => $metrado->m_com_id,
                //     'm_gas_id' => $metrado->m_gas_id,
                // ]);

                // Arquitectura
                if ($metrado->m_arq_id) {
                    $existe = metradoarquitectura::where('id_arquitectura', $metrado->m_arq_id)->exists();
                    if ($existe) {
                        $pluginsActivos['metrados'][] = 'arquitectura';
                        //Log::info('✓ Arquitectura activo (ID: ' . $metrado->m_arq_id . ')');
                    } else {
                        //Log::warning('⚠ Arquitectura ID existe pero registro no encontrado');
                    }
                }

                // Estructuras
                if ($metrado->m_est_id) {
                    $existe = metradoestructuras::where('idmetradoestructuras', $metrado->m_est_id)->exists();
                    if ($existe) {
                        $pluginsActivos['metrados'][] = 'estructuras';
                        //Log::info('✓ Estructuras activo (ID: ' . $metrado->m_est_id . ')');
                    } else {
                        //Log::warning('⚠ Estructuras ID existe pero registro no encontrado');
                    }
                }

                // Sanitarias
                if ($metrado->m_san_id) {
                    $sanitaria = metradosanitarias::where('idmetradosan', $metrado->m_san_id)->first();
                    if ($sanitaria) {
                        $pluginsActivos['metrados'][] = 'sanitarias';
                        $cantidadModulos = $sanitaria->cantidadModulo ?? 0;
                        //Log::info('✓ Sanitarias activo (ID: ' . $metrado->m_san_id . ', Módulos: ' . $cantidadModulos . ')');
                    } else {
                        //Log::warning('⚠ Sanitarias ID existe pero registro no encontrado');
                    }
                }

                // Eléctricas
                if ($metrado->m_elec_id) {
                    $existe = metradoelectricas::where('idmeelectrica', $metrado->m_elec_id)->exists();
                    if ($existe) {
                        $pluginsActivos['metrados'][] = 'electricas';
                        //Log::info('✓ Eléctricas activo (ID: ' . $metrado->m_elec_id . ')');
                    } else {
                        //Log::warning('⚠ Eléctricas ID existe pero registro no encontrado');
                    }
                }

                // Comunicación
                if ($metrado->m_com_id) {
                    $existe = metradocomunicacion::where('idmetradocomunicacion', $metrado->m_com_id)->exists();
                    if ($existe) {
                        $pluginsActivos['metrados'][] = 'comunicacion';
                        //Log::info('✓ Comunicación activo (ID: ' . $metrado->m_com_id . ')');
                    } else {
                        //Log::warning('⚠ Comunicación ID existe pero registro no encontrado');
                    }
                }

                // Gas
                if ($metrado->m_gas_id) {
                    $existe = metradogas::where('idmetradogas', $metrado->m_gas_id)->exists();
                    if ($existe) {
                        $pluginsActivos['metrados'][] = 'gas';
                        //Log::info('✓ Gas activo (ID: ' . $metrado->m_gas_id . ')');
                    } else {
                        //Log::warning('⚠ Gas ID existe pero registro no encontrado');
                    }
                }

                //Log::info('Metrados detectados: ' . implode(', ', $pluginsActivos['metrados']));
            } else {
                //Log::info('⊘ No hay metrados configurados');
            }

            // 5. PRESUPUESTO
            if ($costos->presupuesto) {
                $pluginsActivos['presupuesto'] = true;
                //Log::info('✓ Presupuesto activo (ID: ' . $costos->presupuesto->id . ')');
            } else {
                //Log::info('⊘ No hay presupuesto configurado');
            }

            // 6. ESPECIFICACIONES TÉCNICAS
            if ($costos->especificacionesTecnicas) {
                $pluginsActivos['especificaciones'] = true;
                //Log::info('✓ Especificaciones Técnicas activas (ID: ' . $costos->especificacionesTecnicas->id . ')');
            } else {
                //Log::info('⊘ No hay especificaciones técnicas configuradas');
            }

            // 7. CRONOGRAMAS
            if ($costos->costoCronograma) {
                //Log::info('--- Procesando CRONOGRAMAS ---');
                $cronograma = $costos->costoCronograma;

                // Log::info('IDs de cronogramas encontrados:', [
                //     'cron_gen_id' => $cronograma->cron_gen_id,
                //     'cron_val_id' => $cronograma->cron_val_id,
                //     'cron_mat_id' => $cronograma->cron_mat_id,
                // ]);

                // Cronograma General
                if ($cronograma->cron_gen_id) {
                    $existe = Cronograma::where('id', $cronograma->cron_gen_id)->exists();
                    if ($existe) {
                        $pluginsActivos['cronogramas'][] = 'general';
                        //Log::info('✓ Cronograma General activo (ID: ' . $cronograma->cron_gen_id . ')');
                    } else {
                        //Log::warning('⚠ Cronograma General ID existe pero registro no encontrado');
                    }
                }

                // Cronograma Valorizado (cuando esté implementado)
                if ($cronograma->cron_val_id) {
                    $pluginsActivos['cronogramas'][] = 'valorizado';
                    //Log::info('✓ Cronograma Valorizado activo (ID: ' . $cronograma->cron_val_id . ')');
                }

                // Cronograma de Materiales (cuando esté implementado)
                if ($cronograma->cron_mat_id) {
                    $pluginsActivos['cronogramas'][] = 'materiales';
                    //Log::info('✓ Cronograma de Materiales activo (ID: ' . $cronograma->cron_mat_id . ')');
                }

                //Log::info('Cronogramas detectados: ' . implode(', ', $pluginsActivos['cronogramas']));
            } else {
                //Log::info('⊘ No hay cronogramas configurados');
            }

            // 8. Preparar respuesta
            //Log::info('========================================');
            //Log::info('=== RESUMEN DE PLUGINS DETECTADOS ===');
            //Log::info('========================================');
            //Log::info('Metrados: ' . (count($pluginsActivos['metrados']) > 0 ? implode(', ', $pluginsActivos['metrados']) : 'Ninguno'));
            //Log::info('Presupuesto: ' . ($pluginsActivos['presupuesto'] ? 'SÍ' : 'NO'));
            //Log::info('Especificaciones: ' . ($pluginsActivos['especificaciones'] ? 'SÍ' : 'NO'));
            //Log::info('Cronogramas: ' . (count($pluginsActivos['cronogramas']) > 0 ? implode(', ', $pluginsActivos['cronogramas']) : 'Ninguno'));
            //Log::info('Cantidad Módulos Sanitarios: ' . $cantidadModulos);
            //Log::info('========================================');

            $responseData = [
                'success' => true,
                'id' => $costos->id,
                'name' => $costos->name,
                'codigouei' => $costos->codigouei,
                'codigosnip' => $costos->codigosnip,
                'codigocui' => $costos->codigocui,
                'unidad_ejecutora' => $costos->unidad_ejecutora,
                'codigolocal' => $costos->codigolocal,
                'codigomodular' => $costos->codigomodular,
                'fecha' => $costos->fecha,
                'region' => $costos->region,
                'provincia' => $costos->provincia,
                'distrito' => $costos->distrito,
                'centropoblado' => $costos->centropoblado,
                'plugins' => $pluginsActivos,
                'cantmodulos' => $cantidadModulos
            ];

            //Log::info('✓✓✓ RESPUESTA PREPARADA EXITOSAMENTE ✓✓✓');

            return response()->json($responseData);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            //Log::error('✗✗✗ PROYECTO NO ENCONTRADO ✗✗✗');
            //Log::error('ID: ' . $id);

            return response()->json([
                'success' => false,
                'message' => 'Proyecto no encontrado'
            ], 404);
        } catch (\Exception $e) {
            //Log::error('✗✗✗ ERROR CRÍTICO ✗✗✗');
            //Log::error('Mensaje: ' . $e->getMessage());
            //Log::error('Archivo: ' . $e->getFile());
            //Log::error('Línea: ' . $e->getLine());

            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor',
                'error' => $e->getMessage()
            ], 500);
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
        //Log::info('=== INICIO DE ACTUALIZACIÓN ===');
        //Log::info('ID del proyecto', ['id' => $id]);
        //Log::info('Datos recibidos', $request->all());

        try {
            // Obtener plugins
            $pluginsData = $request->input('plugins');
            if (is_string($pluginsData)) {
                $pluginsData = json_decode($pluginsData, true);
            }

            //Log::info('Plugins procesados', ['plugins' => $pluginsData]);

            // Validación base
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
                'centropoblado' => 'nullable|string|max:255',
                'plugins' => 'nullable',
            ];

            $validatedData = $request->validate($rules);

            // Validar código modular
            $codigoModular = json_decode($validatedData['codigomodular'], true);
            if (empty($codigoModular) || !is_array($codigoModular)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Debe seleccionar al menos un nivel educativo'
                ], 422);
            }

            DB::beginTransaction();

            // Actualizar datos básicos del proyecto
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

            //Log::info('✓ Datos básicos actualizados');

            // ==========================================
            // GESTIÓN DE PLUGINS (AGREGAR/QUITAR)
            // ==========================================

            if (!empty($pluginsData)) {
                // METRADOS
                $this->updateMetrados($costos, $pluginsData, $request);

                // PRESUPUESTO
                $this->updatePresupuesto($costos, $pluginsData);

                // ESPECIFICACIONES TÉCNICAS
                $this->updateEspecificaciones($costos, $pluginsData);

                // CRONOGRAMAS
                $this->updateCronogramas($costos, $pluginsData);
            }

            DB::commit();

            //Log::info('✓✓✓ PROYECTO ACTUALIZADO EXITOSAMENTE ✓✓✓');

            return response()->json([
                'success' => true,
                'message' => 'Proyecto actualizado exitosamente',
                'data' => $costos->fresh()
            ]);
        } catch (ValidationException $e) {
            DB::rollBack();
            //Log::error('✗ ERROR DE VALIDACIÓN', ['errors' => $e->errors()]);
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            // Log::error('✗ ERROR CRÍTICO', [
            //     'message' => $e->getMessage(),
            //     'file' => $e->getFile(),
            //     'line' => $e->getLine(),
            //     'trace' => $e->getTraceAsString()
            // ]);
            return response()->json([
                'success' => false,
                'message' => 'Error interno: ' . $e->getMessage()
            ], 500);
        }
    }
    /**
     * Actualizar metrados (agregar nuevos o eliminar existentes)
     */
    /**
     * Actualizar metrados (agregar nuevos o desvincular existentes)
     * IMPORTANTE: NO elimina registros, solo pone los IDs en NULL
     */
    private function updateMetrados($costos, $pluginsData, $request)
    {
        //Log::info('========================================');
        //Log::info('--- Actualizando METRADOS ---');
        //Log::info('========================================');

        // Obtener o crear relación costos_metrados
        $costoMetrado = costo_metrado::firstOrNew(['costos_id' => $costos->id]);

        // Si es nuevo, inicializar todos los campos en null
        if (!$costoMetrado->exists) {
            $costoMetrado->costos_id = $costos->id;
            $costoMetrado->m_arq_id = null;
            $costoMetrado->m_est_id = null;
            $costoMetrado->m_san_id = null;
            $costoMetrado->m_elec_id = null;
            $costoMetrado->m_com_id = null;
            $costoMetrado->m_gas_id = null;
        }

        // Metrados solicitados (activos en el request)
        $metradosSolicitados = !empty($pluginsData['metrados'])
            ? array_map('strtolower', $pluginsData['metrados'])
            : [];

        //Log::info('Metrados solicitados:', $metradosSolicitados);

        // Metrados actuales (los que ya están vinculados)
        $metradosActuales = [];
        if ($costoMetrado->m_arq_id) $metradosActuales[] = 'arquitectura';
        if ($costoMetrado->m_est_id) $metradosActuales[] = 'estructuras';
        if ($costoMetrado->m_san_id) $metradosActuales[] = 'sanitarias';
        if ($costoMetrado->m_elec_id) $metradosActuales[] = 'electricas';
        if ($costoMetrado->m_com_id) $metradosActuales[] = 'comunicacion';
        if ($costoMetrado->m_gas_id) $metradosActuales[] = 'gas';

        //Log::info('Metrados actuales:', $metradosActuales);

        // ==========================================
        // AGREGAR nuevos metrados
        // ==========================================
        $metradosAAgregar = array_diff($metradosSolicitados, $metradosActuales);

        if (count($metradosAAgregar) > 0) {
            //Log::info('➕ Agregando metrados:', $metradosAAgregar);
        }

        foreach ($metradosAAgregar as $tipo) {
            switch ($tipo) {
                case 'arquitectura':
                    $metrado = metradoarquitectura::create([
                        'especialidad' => 'arquitectura',
                        'documentosdata' => json_encode([]),
                        'resumenmetrados' => null,
                    ]);
                    $costoMetrado->m_arq_id = $metrado->id_arquitectura ?? $metrado->getKey();
                    //Log::info('✓ Arquitectura agregado', ['id' => $costoMetrado->m_arq_id]);
                    break;

                case 'estructuras':
                case 'estructura':
                    $metrado = metradoestructuras::create([
                        'especialidad' => 'estructuras',
                        'documentosdata' => json_encode([]),
                        'resumenmetrados' => null,
                    ]);
                    $costoMetrado->m_est_id = $metrado->idmetradoestructuras ?? $metrado->getKey();
                    //Log::info('✓ Estructuras agregado', ['id' => $costoMetrado->m_est_id]);
                    break;

                case 'sanitarias':
                    $cantidadModulos = $request->input('cantmodulos', 0);
                    $metrado = metradosanitarias::create([
                        'especialidad' => 'sanitarias',
                        'cantidadModulo' => (int)$cantidadModulos,
                        'documentosdata' => json_encode([]),
                        'resumenmetrados' => null,
                    ]);
                    $costoMetrado->m_san_id = $metrado->idmetradosan ?? $metrado->getKey();
                    // Log::info('✓ Sanitarias agregado', [
                    //     'id' => $costoMetrado->m_san_id,
                    //     'modulos' => $cantidadModulos
                    // ]);
                    break;

                case 'electricas':
                    $metrado = metradoelectricas::create([
                        'especialidad' => 'electricas',
                        'documentosdata' => json_encode([]),
                        'resumenmetrados' => null,
                    ]);
                    $costoMetrado->m_elec_id = $metrado->idmeelectrica ?? $metrado->getKey();
                    //Log::info('✓ Electricas agregado', ['id' => $costoMetrado->m_elec_id]);
                    break;

                case 'comunicacion':
                case 'comunicaciones':
                    $metrado = metradocomunicacion::create([
                        'especialidad' => 'comunicacion',
                        'documentosdata' => json_encode([]),
                        'resumenmetrados' => null,
                    ]);
                    $costoMetrado->m_com_id = $metrado->idmetradocomunicacion ?? $metrado->getKey();
                    //Log::info('✓ Comunicacion agregado', ['id' => $costoMetrado->m_com_id]);
                    break;

                case 'gas':
                    $metrado = metradogas::create([
                        'especialidad' => 'gas',
                        'documentosdata' => json_encode([]),
                        'resumenmetrados' => null,
                    ]);
                    $costoMetrado->m_gas_id = $metrado->idmetradogas ?? $metrado->getKey();
                    //Log::info('✓ Gas agregado', ['id' => $costoMetrado->m_gas_id]);
                    break;
            }
        }

        // ==========================================
        // DESVINCULAR metrados (poner en NULL, NO eliminar)
        // ==========================================
        $metradosADesvincular = array_diff($metradosActuales, $metradosSolicitados);

        if (count($metradosADesvincular) > 0) {
            //Log::info('➖ Desvinculando metrados:', $metradosADesvincular);
        }

        foreach ($metradosADesvincular as $tipo) {
            switch ($tipo) {
                case 'arquitectura':
                    //Log::info('⊘ Desvinculando arquitectura (ID: ' . $costoMetrado->m_arq_id . ')');
                    $costoMetrado->m_arq_id = null;
                    break;

                case 'estructuras':
                    //Log::info('⊘ Desvinculando estructuras (ID: ' . $costoMetrado->m_est_id . ')');
                    $costoMetrado->m_est_id = null;
                    break;

                case 'sanitarias':
                    //Log::info('⊘ Desvinculando sanitarias (ID: ' . $costoMetrado->m_san_id . ')');
                    $costoMetrado->m_san_id = null;
                    break;

                case 'electricas':
                    //Log::info('⊘ Desvinculando electricas (ID: ' . $costoMetrado->m_elec_id . ')');
                    $costoMetrado->m_elec_id = null;
                    break;

                case 'comunicacion':
                    //Log::info('⊘ Desvinculando comunicacion (ID: ' . $costoMetrado->m_com_id . ')');
                    $costoMetrado->m_com_id = null;
                    break;

                case 'gas':
                    //Log::info('⊘ Desvinculando gas (ID: ' . $costoMetrado->m_gas_id . ')');
                    $costoMetrado->m_gas_id = null;
                    break;
            }
        }

        // ==========================================
        // ACTUALIZAR cantidad de módulos sanitarios si cambió
        // ==========================================
        if (in_array('sanitarias', $metradosSolicitados) && $costoMetrado->m_san_id) {
            $cantidadModulosNueva = $request->input('cantmodulos', 0);
            $sanitaria = metradosanitarias::find($costoMetrado->m_san_id);

            if ($sanitaria && $sanitaria->cantidadModulo != $cantidadModulosNueva) {
                $sanitaria->cantidadModulo = (int)$cantidadModulosNueva;
                $sanitaria->save();
                // Log::info('✓ Cantidad de módulos sanitarios actualizada', [
                //     'anterior' => $sanitaria->getOriginal('cantidadModulo'),
                //     'nueva' => $cantidadModulosNueva
                // ]);
            }
        }

        // Guardar cambios en la tabla pivote
        $costoMetrado->save();

        //Log::info('✓✓✓ Metrados actualizados exitosamente ✓✓✓');
        // Log::info('Estado final:', [
        //     'm_arq_id' => $costoMetrado->m_arq_id,
        //     'm_est_id' => $costoMetrado->m_est_id,
        //     'm_san_id' => $costoMetrado->m_san_id,
        //     'm_elec_id' => $costoMetrado->m_elec_id,
        //     'm_com_id' => $costoMetrado->m_com_id,
        //     'm_gas_id' => $costoMetrado->m_gas_id,
        // ]);
    }

    /**
     * Actualizar presupuesto (crear o desvincular)
     */
    private function updatePresupuesto($costos, $pluginsData)
    {
        //Log::info('========================================');
        //Log::info('--- Actualizando PRESUPUESTO ---');
        //Log::info('========================================');

        $presupuestoActivo = !empty($pluginsData['presupuesto']) && $pluginsData['presupuesto'] === true;
        $presupuestoExiste = presupuestos::where('costos_pres_id', $costos->id)->exists();

        // Log::info('Estado:', [
        //     'activo_solicitado' => $presupuestoActivo,
        //     'existe_actualmente' => $presupuestoExiste
        // ]);

        if ($presupuestoActivo && !$presupuestoExiste) {
            // CREAR presupuesto
            presupuestos::create([
                'datapresupuestos' => json_encode([]),
                'costos_pres_id' => $costos->id,
            ]);
            //Log::info('✓ Presupuesto creado');
        } elseif (!$presupuestoActivo && $presupuestoExiste) {
            // DESVINCULAR presupuesto (poner costos_pres_id en NULL o eliminar si prefieres)
            // Opción 1: Desvincular (recomendado para mantener histórico)
            presupuestos::where('costos_pres_id', $costos->id)->update(['costos_pres_id' => null]);
            //Log::info('⊘ Presupuesto desvinculado');

            // Opción 2: Eliminar (si no necesitas histórico)
            // presupuestos::where('costos_pres_id', $costos->id)->delete();
            // Log::info('✗ Presupuesto eliminado');

        } elseif ($presupuestoActivo && $presupuestoExiste) {
            //Log::info('⇄ Presupuesto ya existe, sin cambios');
        } else {
            //Log::info('⊘ Presupuesto no activo, sin cambios');
        }
    }

    /**
     * Actualizar especificaciones técnicas (crear o desvincular)
     */
    private function updateEspecificaciones($costos, $pluginsData)
    {
        //Log::info('========================================');
        //Log::info('--- Actualizando ESPECIFICACIONES TÉCNICAS ---');
        //Log::info('========================================');

        $especificacionesActivas = !empty($pluginsData['especificaciones']) && $pluginsData['especificaciones'] === true;
        $especificacionesExisten = especificacionesTecnicas::where('costos_ettp_id', $costos->id)->exists();

        // Log::info('Estado:', [
        //     'activo_solicitado' => $especificacionesActivas,
        //     'existe_actualmente' => $especificacionesExisten
        // ]);

        if ($especificacionesActivas && !$especificacionesExisten) {
            // CREAR especificaciones
            especificacionesTecnicas::create([
                'datosEspecificacionTecnica' => json_encode([]),
                'costos_ettp_id' => $costos->id,
            ]);
            //Log::info('✓ Especificaciones técnicas creadas');
        } elseif (!$especificacionesActivas && $especificacionesExisten) {
            // DESVINCULAR especificaciones
            especificacionesTecnicas::where('costos_ettp_id', $costos->id)->update(['costos_ettp_id' => null]);
            //Log::info('⊘ Especificaciones técnicas desvinculadas');
        } elseif ($especificacionesActivas && $especificacionesExisten) {
            //Log::info('⇄ Especificaciones técnicas ya existen, sin cambios');
        } else {
            //Log::info('⊘ Especificaciones técnicas no activas, sin cambios');
        }
    }

    /**
     * Actualizar cronogramas (agregar o desvincular)
     */
    private function updateCronogramas($costos, $pluginsData)
    {
        //Log::info('========================================');
        //Log::info('--- Actualizando CRONOGRAMAS ---');
        //Log::info('========================================');

        $cronogramasSolicitados = !empty($pluginsData['cronogramas']) && is_array($pluginsData['cronogramas'])
            ? $pluginsData['cronogramas']
            : [];

        //Log::info('Cronogramas solicitados:', $cronogramasSolicitados);

        // Obtener o crear relación costo_cronograma
        $costoCronograma = costo_cronograma::firstOrNew(['costos_cron_id' => $costos->id]);

        if (!$costoCronograma->exists) {
            $costoCronograma->costos_cron_id = $costos->id;
            $costoCronograma->cron_gen_id = null;
            $costoCronograma->cron_val_id = null;
            $costoCronograma->cron_mat_id = null;
        }

        // Cronogramas actuales
        $cronogramasActuales = [];
        if ($costoCronograma->cron_gen_id) $cronogramasActuales[] = 'general';
        if ($costoCronograma->cron_val_id) $cronogramasActuales[] = 'valorizado';
        if ($costoCronograma->cron_mat_id) $cronogramasActuales[] = 'materiales';

        //Log::info('Cronogramas actuales:', $cronogramasActuales);

        // ==========================================
        // Cronograma GENERAL
        // ==========================================
        if (in_array('general', $cronogramasSolicitados) && !in_array('general', $cronogramasActuales)) {
            // CREAR
            $cronograma = Cronograma::create([
                'montos' => null,
                'datacronograma' => null,
            ]);
            $costoCronograma->cron_gen_id = $cronograma->id;
            //Log::info('✓ Cronograma general creado', ['id' => $cronograma->id]);
        } elseif (!in_array('general', $cronogramasSolicitados) && in_array('general', $cronogramasActuales)) {
            // DESVINCULAR
            //Log::info('⊘ Desvinculando cronograma general (ID: ' . $costoCronograma->cron_gen_id . ')');
            $costoCronograma->cron_gen_id = null;
        }

        // ==========================================
        // Cronograma VALORIZADO (cuando esté implementado)
        // ==========================================
        if (in_array('valorizado', $cronogramasSolicitados) && !in_array('valorizado', $cronogramasActuales)) {
            // CREAR cuando esté implementado
            //Log::info('⚠ Cronograma valorizado pendiente de implementación');
        } elseif (!in_array('valorizado', $cronogramasSolicitados) && in_array('valorizado', $cronogramasActuales)) {
            // DESVINCULAR
            $costoCronograma->cron_val_id = null;
        }

        // ==========================================
        // Cronograma MATERIALES (cuando esté implementado)
        // ==========================================
        if (in_array('materiales', $cronogramasSolicitados) && !in_array('materiales', $cronogramasActuales)) {
            // CREAR cuando esté implementado
            //Log::info('⚠ Cronograma materiales pendiente de implementación');
        } elseif (!in_array('materiales', $cronogramasSolicitados) && in_array('materiales', $cronogramasActuales)) {
            // DESVINCULAR
            $costoCronograma->cron_mat_id = null;
        }

        // Guardar cambios
        $costoCronograma->save();

        //Log::info('✓✓✓ Cronogramas actualizados exitosamente ✓✓✓');
        // Log::info('Estado final:', [
        //     'cron_gen_id' => $costoCronograma->cron_gen_id,
        //     'cron_val_id' => $costoCronograma->cron_val_id,
        //     'cron_mat_id' => $costoCronograma->cron_mat_id,
        // ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            DB::beginTransaction();

            $Costos = Costos::findOrFail($id);

            //Log::info('========================================');
            //Log::info('=== INICIANDO ELIMINACIÓN DE PROYECTO ===');
            //Log::info('========================================');
            // Log::info('Proyecto a eliminar:', [
            //     'costos_id' => $id,
            //     'nombre' => $Costos->name
            // ]);

            // ============================================
            // 1. ELIMINAR PRESUPUESTOS Y SUS RAMAS
            // ============================================
            //Log::info('--- Eliminando PRESUPUESTOS y sus ramas ---');
            $presupuestos = presupuestos::where('costos_pres_id', $id)->get();

            foreach ($presupuestos as $presupuesto) {
                //Log::info('Procesando presupuesto', ['presupuesto_id' => $presupuesto->id]);

                // Eliminar ramas de presupuesto
                if (Schema::hasTable('presupuesto_detalles')) {
                    DB::table('presupuesto_detalles')
                        ->where('presupuesto_id', $presupuesto->id)
                        ->delete();
                    //Log::info('Detalles de presupuesto eliminados', ['presupuesto_id' => $presupuesto->id]);
                }

                if (Schema::hasTable('presupuesto_partidas')) {
                    DB::table('presupuesto_partidas')
                        ->where('presupuesto_id', $presupuesto->id)
                        ->delete();
                    //Log::info('Partidas de presupuesto eliminadas', ['presupuesto_id' => $presupuesto->id]);
                }

                if (Schema::hasTable('analisis_precios_unitarios')) {
                    DB::table('analisis_precios_unitarios')
                        ->where('presupuesto_id', $presupuesto->id)
                        ->delete();
                    //Log::info('APUs eliminados', ['presupuesto_id' => $presupuesto->id]);
                }

                $presupuesto->delete();
                //Log::info('✓ Presupuesto eliminado', ['presupuesto_id' => $presupuesto->id]);
            }

            //Log::info('✓✓✓ Presupuestos y ramas eliminados exitosamente');

            // ============================================
            // 2. ELIMINAR ESPECIFICACIONES TÉCNICAS
            // ============================================
            //Log::info('--- Eliminando ESPECIFICACIONES TÉCNICAS ---');
            $especificaciones = especificacionesTecnicas::where('costos_ettp_id', $id)->get();

            foreach ($especificaciones as $especificacion) {
                $especificacion->delete();
                //Log::info('✓ Especificación técnica eliminada', ['especificacion_id' => $especificacion->id]);
            }

            //Log::info('✓✓✓ Especificaciones técnicas eliminadas exitosamente');

            // ============================================
            // 3. ELIMINAR CRONOGRAMAS Y SUS RAMAS
            // ============================================
            //Log::info('--- Eliminando CRONOGRAMAS y sus ramas ---');
            $costoCron = costo_cronograma::where('costos_cron_id', $id)->first();

            if ($costoCron) {
                // Guardar los IDs de los cronogramas antes de eliminar la relación
                $cronGenId = $costoCron->cron_gen_id;
                $cronValId = $costoCron->cron_val_id;
                $cronMatId = $costoCron->cron_mat_id;

                // PRIMERO: Eliminar la relación costo_cronograma para evitar restricción de FK
                //Log::info('Eliminando relación costo_cronograma PRIMERO');
                $costoCron->delete();
                //Log::info('✓ Registro costo_cronograma eliminado');

                // DESPUÉS: Eliminar cronograma general
                if (!empty($cronGenId)) {
                    $cronogramaGeneral = Cronograma::find($cronGenId);
                    if ($cronogramaGeneral) {
                        if (Schema::hasTable('cronograma_actividades')) {
                            DB::table('cronograma_actividades')
                                ->where('cronograma_id', $cronogramaGeneral->id)
                                ->delete();
                            //Log::info('Actividades de cronograma general eliminadas');
                        }

                        $cronogramaGeneral->delete();
                        //Log::info('✓ Cronograma general eliminado', ['id' => $cronGenId]);
                    }
                }

                // Eliminar cronograma valorizado
                if (!empty($cronValId)) {
                    $cronogramaValorizado = Cronograma::find($cronValId);
                    if ($cronogramaValorizado) {
                        if (Schema::hasTable('cronograma_valorizado_detalles')) {
                            DB::table('cronograma_valorizado_detalles')
                                ->where('cronograma_id', $cronogramaValorizado->id)
                                ->delete();
                            //Log::info('Detalles de cronograma valorizado eliminados');
                        }

                        $cronogramaValorizado->delete();
                        //Log::info('✓ Cronograma valorizado eliminado', ['id' => $cronValId]);
                    }
                }

                // Eliminar cronograma de materiales
                if (!empty($cronMatId)) {
                    $cronogramaMateriales = Cronograma::find($cronMatId);
                    if ($cronogramaMateriales) {
                        if (Schema::hasTable('cronograma_materiales_detalles')) {
                            DB::table('cronograma_materiales_detalles')
                                ->where('cronograma_id', $cronogramaMateriales->id)
                                ->delete();
                            //Log::info('Detalles de cronograma materiales eliminados');
                        }

                        $cronogramaMateriales->delete();
                        //Log::info('✓ Cronograma materiales eliminado', ['id' => $cronMatId]);
                    }
                }
            } else {
                //Log::info('⊘ No existe registro costo_cronograma para este proyecto');
            }

            //Log::info('✓✓✓ Cronogramas y ramas eliminados exitosamente');

            // ============================================
            // 4. ELIMINAR METRADOS Y SUS RAMAS
            // ============================================
            //Log::info('--- Eliminando METRADOS y sus ramas ---');
            $costoMet = costo_metrado::where('costos_id', $id)->first();

            if ($costoMet) {
                // Guardar los IDs antes de eliminar la relación
                $mArqId = $costoMet->m_arq_id;
                $mEstId = $costoMet->m_est_id;
                $mSanId = $costoMet->m_san_id;
                $mElecId = $costoMet->m_elec_id;
                $mComId = $costoMet->m_com_id;
                $mGasId = $costoMet->m_gas_id;

                // PRIMERO: Eliminar la relación costos_metrados
                //Log::info('Eliminando relación costos_metrados PRIMERO');
                $costoMet->delete();
                //Log::info('✓ Registro costos_metrados eliminado');

                // DESPUÉS: Eliminar cada metrado
                // Metrado de Arquitectura
                if (!empty($mArqId)) {
                    $metradoArq = metradoarquitectura::where('id_arquitectura', $mArqId)->first();
                    if ($metradoArq) {
                        if (Schema::hasTable('metrado_arquitectura_detalles')) {
                            DB::table('metrado_arquitectura_detalles')
                                ->where('metrado_arq_id', $metradoArq->id_arquitectura)
                                ->delete();
                            //Log::info('Detalles de metrado arquitectura eliminados');
                        }

                        $metradoArq->delete();
                        //Log::info('✓ Metrado arquitectura eliminado', ['id' => $mArqId]);
                    }
                }

                // Metrado de Estructuras
                if (!empty($mEstId)) {
                    $metradoEst = metradoestructuras::where('idmetradoestructuras', $mEstId)->first();
                    if ($metradoEst) {
                        if (Schema::hasTable('metrado_estructuras_detalles')) {
                            DB::table('metrado_estructuras_detalles')
                                ->where('metrado_est_id', $metradoEst->idmetradoestructuras)
                                ->delete();
                            //Log::info('Detalles de metrado estructuras eliminados');
                        }

                        $metradoEst->delete();
                        //Log::info('✓ Metrado estructuras eliminado', ['id' => $mEstId]);
                    }
                }

                // Metrado de Sanitarias
                if (!empty($mSanId)) {
                    $metradoSan = metradosanitarias::where('idmetradosan', $mSanId)->first();
                    if ($metradoSan) {
                        if (Schema::hasTable('metrado_sanitarias_detalles')) {
                            DB::table('metrado_sanitarias_detalles')
                                ->where('metrado_san_id', $metradoSan->idmetradosan)
                                ->delete();
                            //Log::info('Detalles de metrado sanitarias eliminados');
                        }

                        $metradoSan->delete();
                        //Log::info('✓ Metrado sanitarias eliminado', ['id' => $mSanId]);
                    }
                }

                // Metrado de Eléctricas
                if (!empty($mElecId)) {
                    $metradoElec = metradoelectricas::where('idmeelectrica', $mElecId)->first();
                    if ($metradoElec) {
                        if (Schema::hasTable('metrado_electricas_detalles')) {
                            DB::table('metrado_electricas_detalles')
                                ->where('metrado_elec_id', $metradoElec->idmeelectrica)
                                ->delete();
                            //Log::info('Detalles de metrado eléctricas eliminados');
                        }

                        $metradoElec->delete();
                        //Log::info('✓ Metrado eléctricas eliminado', ['id' => $mElecId]);
                    }
                }

                // Metrado de Comunicación
                if (!empty($mComId)) {
                    $metradoCom = metradocomunicacion::where('idmetradocomunicacion', $mComId)->first();
                    if ($metradoCom) {
                        if (Schema::hasTable('metrado_comunicacion_detalles')) {
                            DB::table('metrado_comunicacion_detalles')
                                ->where('metrado_com_id', $metradoCom->idmetradocomunicacion)
                                ->delete();
                            //Log::info('Detalles de metrado comunicación eliminados');
                        }

                        $metradoCom->delete();
                        //Log::info('✓ Metrado comunicación eliminado', ['id' => $mComId]);
                    }
                }

                // Metrado de Gas
                if (!empty($mGasId)) {
                    $metradoGas = metradogas::where('idmetradogas', $mGasId)->first();
                    if ($metradoGas) {
                        if (Schema::hasTable('metrado_gas_detalles')) {
                            DB::table('metrado_gas_detalles')
                                ->where('metrado_gas_id', $metradoGas->idmetradogas)
                                ->delete();
                            //Log::info('Detalles de metrado gas eliminados');
                        }

                        $metradoGas->delete();
                        //Log::info('✓ Metrado gas eliminado', ['id' => $mGasId]);
                    }
                }
            } else {
                //Log::info('⊘ No existe registro costos_metrados para este proyecto');
            }

            //Log::info('✓✓✓ Metrados y ramas eliminados exitosamente');

            // ============================================
            // 5. ELIMINAR EL PROYECTO PRINCIPAL (COSTOS)
            // ============================================
            //Log::info('--- Eliminando proyecto principal (COSTOS) ---');
            $Costos->delete();
            // Log::info('✓✓✓ Proyecto Costos eliminado exitosamente', [
            //     'costos_id' => $id,
            //     'nombre' => $Costos->name
            // ]);

            DB::commit();

            //Log::info('========================================');
            //Log::info('✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓');
            //Log::info('✓✓✓ ELIMINACIÓN COMPLETADA EXITOSAMENTE ✓✓✓');
            //Log::info('✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓');
            //Log::info('========================================');

            return redirect()->route('costos.index')
                ->with('success', 'Proyecto y todas sus ramas eliminadas exitosamente');
        } catch (ModelNotFoundException $e) {
            DB::rollback();
            // Log::error('✗✗✗ Proyecto no encontrado ✗✗✗', [
            //     'costos_id' => $id,
            //     'error' => $e->getMessage()
            // ]);

            return redirect()->back()
                ->with('error', 'El proyecto no fue encontrado');
        } catch (Exception $e) {
            DB::rollback();

            //Log::error('========================================');
            //Log::error('✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗');
            //Log::error('✗✗✗ ERROR AL ELIMINAR PROYECTO ✗✗✗');
            //Log::error('✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗✗');
            //Log::error('========================================');
            // Log::error('Detalles del error:', [
            //     'costos_id' => $id,
            //     'message' => $e->getMessage(),
            //     'file' => $e->getFile(),
            //     'line' => $e->getLine(),
            //     'trace' => $e->getTraceAsString()
            // ]);

            return redirect()->back()
                ->with('error', 'Error al eliminar el proyecto: ' . $e->getMessage());
        }
    }
}
