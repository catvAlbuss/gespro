// ============================================================================
// GENERADOR DE INFORME DE PAGO - Vue 3 + jsPDF
// ============================================================================

/**
 * Configuración de empresas
 */
const EMPRESAS_CONFIG = {
  1: {
    nombre: "Rizabal & Asociados ING. estruc",
    area: "Área Campo",
    logo: "/storage/avatar_empresa/logo_rizabal.png"
  },
  2: {
    nombre: "CONTRUYEHCO",
    area: "ÁREA OFICINA TECNICA",
    logo: "/storage/avatar_empresa/logo_contruyehco.png"
  },
  3: {
    nombre: "SEVEN HEART",
    area: "Área de Obras",
    logo: "/storage/avatar_empresa/logo_sevenheart.png"
  },
  4: {
    nombre: "DML arquitectos",
    area: "Área Arquitectura",
    logo: "/storage/avatar_empresa/logo_dml.png"
  },
  5: {
    nombre: "HYPERIUM",
    area: "Área de Informática",
    logo: "/storage/avatar_empresa/logo_hyperium.png"
  }
};

/**
 * Configuración de meses
 */
const MESES = [
  "", "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
  "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
];

/**
 * Lista de jefes de área
 */
const JEFES_AREA = ['JOSE EDUARDO', 'LUIS DANIEL', 'EMERSON MESIAS'];

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Formatea una fecha para mostrar en el documento
 */
const formatearFecha = (fecha) => {
  const opcionesFecha = {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  };
  const opcionesHora = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };

  const parteFecha = fecha.toLocaleDateString('es-ES', opcionesFecha);
  const parteHora = fecha.toLocaleTimeString('es-ES', opcionesHora);

  return `${parteFecha.toUpperCase()} Hora: ${parteHora}`;
};

/**
 * Obtiene días laborables del mes (26 días fijos según tu lógica)
 */
const obtenerDiasLaborables = () => 26;

/**
 * Genera iniciales del nombre completo
 */
const generarIniciales = (nombreCompleto) => {
  return nombreCompleto
    .split(' ')
    .map(nombre => nombre.charAt(0))
    .join('');
};

/**
 * Determina el rol del trabajador
 */
const determinarRol = (nombre) => {
  return JEFES_AREA.includes(nombre.toUpperCase()) ? 'Jefe de Área' : 'Asistente';
};

// ============================================================================
// PROCESADORES DE DATOS
// ============================================================================

/**
 * Procesa los proyectos efectuados
 */
const procesarProyectosEfectuados = (tareasAprobadas) => {
  const proyectos = tareasAprobadas.map(tarea => [
    tarea.titulo || tarea.nombre_proyecto || "Proyecto Desconocido",
    tarea.fecha_inicio || tarea.fecha || "N/A",
    tarea.fecha_fin || tarea.fecha || "N/A",
    parseFloat(tarea.diasAsignados || tarea.dias_asignados || 0).toString(),
    tarea.status || tarea.estado || "N/A"
  ]);

  // Agregar fila de total
  const totalDias = proyectos.reduce((sum, proyecto) =>
    sum + parseFloat(proyecto[3]), 0
  );

  proyectos.push(["TOTAL", "", "", totalDias.toString(), ""]);

  return proyectos;
};

/**
 * Calcula descuentos y bonificaciones
 */
const calcularDescuentosBonificaciones = (payload) => {
  const { usuario, extras, tareas_aprobadas, tareas_no_aprobadas, mes } = payload;
  const sueldoPIP = parseFloat(usuario.sueldo_base);

  if (!sueldoPIP || sueldoPIP <= 0) {
    console.error("Error: sueldo_base no está definido o es inválido.");
    return [];
  }

  // Calcular días de incumplimiento
  const conteoDiasNA = tareas_no_aprobadas.reduce((total, tarea) => {
    const dias = parseFloat(tarea.diasAsignados || tarea.dias_asignados || 0);
    return total + (isNaN(dias) ? 0 : dias);
  }, 0);

  // Calcular bonificaciones por rendimiento
  let totalBonificacionDias = 0;
  tareas_aprobadas.forEach(tarea => {
    const porcentaje = parseFloat(tarea.procentaje_trabajador || tarea.porcentaje || 0) / 100;
    if (porcentaje > 0.98) {
      totalBonificacionDias += porcentaje;
    }
  });

  // Días laborables y sueldo diario
  const diasLaborables = obtenerDiasLaborables();
  const sueldoDiario = sueldoPIP / diasLaborables;

  // Extraer valores de extras
  const {
    adelanto = 0,
    permisos = 0,
    incMof = 0,
    bondtrab = 0,
    descuenttrab = 0
  } = extras;

  // Calcular montos
  const montos = {
    adelanto: (sueldoDiario * adelanto).toFixed(2),
    permisos: (sueldoDiario * permisos).toFixed(2),
    incumplimiento: (sueldoDiario * conteoDiasNA).toFixed(2),
    incMof: (sueldoDiario * incMof).toFixed(2),
    descuentos: (sueldoDiario * descuenttrab).toFixed(2),
    bonos: (sueldoDiario * bondtrab).toFixed(2)
  };

  // Total descuentos
  const totalDescuentoMonto = (
    parseFloat(montos.adelanto) +
    parseFloat(montos.permisos) +
    parseFloat(montos.incumplimiento) +
    parseFloat(montos.incMof) +
    parseFloat(montos.descuentos)
  ).toFixed(2);

  const totalDescuentoDias = adelanto + permisos + conteoDiasNA + incMof + descuenttrab;

  // Armar tabla de descuentos y bonificaciones
  return [
    ["PERMISOS", permisos, montos.permisos],
    ["ADELANTO", adelanto, montos.adelanto],
    ["INCUMPLIMIENTO DEL LAB", conteoDiasNA, montos.incumplimiento],
    ["INCUMPLIMIENTO DEL MOF (2 HORAS)", incMof, montos.incMof],
    ["DESCUENTO", descuenttrab, montos.descuentos],
    ["TOTAL DE DESCUENTO", totalDescuentoDias, totalDescuentoMonto],
    ["BONIFICACIÓN", bondtrab, montos.bonos],
    ["TOTAL DE BONIFICACIÓN", bondtrab, montos.bonos]
  ];
};

/**
 * Calcula el sueldo neto final
 */
const calcularSueldoNeto = (payload, datosDescuentos, proyectosData) => {
  const { usuario } = payload;
  const sueldoBase = parseFloat(usuario.sueldo_base);
  const diasLaborables = obtenerDiasLaborables();

  // Calcular días trabajados
  let totalDiasTrabajados = 0;
  for (let i = 0; i < proyectosData.length - 1; i++) {
    totalDiasTrabajados += parseFloat(proyectosData[i][3]);
  }

  // Ajuste si está cerca del máximo
  if (totalDiasTrabajados >= 24.90 && totalDiasTrabajados <= diasLaborables) {
    totalDiasTrabajados = diasLaborables;
  }

  const sueldoProporcional = (sueldoBase / diasLaborables) * totalDiasTrabajados;
  const totalDescuentos = parseFloat(datosDescuentos[5][2]); // TOTAL DE DESCUENTO
  const totalBonificaciones = parseFloat(datosDescuentos[7][2]); // TOTAL DE BONIFICACIÓN

  return (sueldoProporcional + totalBonificaciones - totalDescuentos).toFixed(2);
};

// ============================================================================
// GENERADOR DE PDF
// ============================================================================

/**
 * Configura el encabezado del documento
 */
const configurarEncabezado = (pdf, payload) => {
  const { usuario, mes, idEmpresa } = payload;
  const fechaActual = new Date();
  const anioActual = fechaActual.getFullYear();
  const empresaConfig = EMPRESAS_CONFIG[idEmpresa];
  const iniciales = generarIniciales(usuario.nombreCompleto);
  const nombreMes = MESES[mes];
  const rol = determinarRol(usuario.nombreCompleto.split(' ')[0]);

  // Configurar fuente y tamaño
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);

  // Número de informe
  const numeroInforme = `INFORME N°${String(mes).padStart(2, '0')}-${anioActual}/${empresaConfig.nombre}-${iniciales}`;
  pdf.text(numeroInforme, 20, 20);

  // Información básica
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.text("SEÑOR(A): ", 20, 30);
  pdf.setFont("helvetica", "normal");
  pdf.text("Andrea Alexandra Paredes Sánchez", 40, 30);
  pdf.setFont("helvetica", "bold");
  pdf.text("Administradora", 40, 35);

  pdf.setFont("helvetica", "bold");
  pdf.text("DE: ", 20, 40);
  pdf.setFont("helvetica", "normal");
  pdf.text(usuario.nombreCompleto, 40, 40);
  pdf.setFont("helvetica", "bold");
  pdf.text(rol, 40, 45);

  pdf.setFont("helvetica", "bold");
  pdf.text("ASUNTO:", 20, 50);
  pdf.setFont("helvetica", "normal");
  pdf.text(`INFORME DE PAGO DEL MES DE ${nombreMes} del ${anioActual}`, 40, 50);

  pdf.setFont("helvetica", "bold");
  pdf.text("FECHA:", 20, 55);
  pdf.setFont("helvetica", "normal");
  pdf.text(`HUÁNUCO, ${formatearFecha(fechaActual)}`, 40, 55);

  return 65; // Posición Y donde termina el encabezado
};

/**
 * Agrega la introducción del documento
 */
const agregarIntroduccion = (pdf, startY) => {
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");

  const textos = [
    "Por medio de la presente me es grato dirigirme a Ud. cordialmente y felicitarlo por la acertada labor que viene",
    "desempeñando, así mismo entrego a su despacho el informe de avance del personal, para ello se detalla a continuación:"
  ];

  let currentY = startY;
  textos.forEach(texto => {
    pdf.text(texto, 20, currentY);
    currentY += 5;
  });

  return currentY + 5; // Espacio adicional después de la introducción
};

/**
 * Agrega la tabla de proyectos efectuados
 */
const agregarTablaProyectos = (pdf, proyectosData, startY) => {
  pdf.autoTable({
    head: [["PROYECTOS EFECTUADOS", "INICIO DE PROYECTO", "FIN DE PROYECTO", "DÍAS", "CIERRE"]],
    body: proyectosData,
    startY: startY,
    styles: {
      fontSize: 8,
      valAlign: 'middle',
      halign: 'center',
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: 'bold'
    },
    theme: 'grid',
    didParseCell: (data) => {
      // Destacar la fila TOTAL
      if (data.row.raw[0] === "TOTAL") {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [250, 250, 250];
      }
    }
  });

  return pdf.autoTable.previous.finalY;
};

/**
 * Agrega la tabla de descuentos y bonificaciones
 */
const agregarTablaDescuentos = (pdf, descuentosData, startY) => {
  pdf.autoTable({
    head: [["DESCUENTOS Y BONIFICACIONES", "CANT.", "MONTO (S/)"]],
    body: descuentosData,
    startY: startY + 10,
    styles: {
      fontSize: 8,
      valAlign: 'middle',
      halign: 'left',
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: 'bold'
    },
    theme: 'grid',
    didParseCell: (data) => {
      const texto = data.row.raw[0];
      // Destacar filas de totales
      if (texto.includes("TOTAL")) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [250, 250, 250];
      }
    }
  });

  return pdf.autoTable.previous.finalY;
};

/**
 * Agrega la información bancaria
 */
const agregarInfoBancaria = (pdf, usuario, startY) => {
  if (!usuario.banco?.nombre || !usuario.banco?.cuenta) {
    return startY; // Sin información bancaria
  }

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text("INFORMACIÓN BANCARIA:", 20, startY + 10);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text(`Banco: ${usuario.banco.nombre}`, 20, startY + 15);
  pdf.text(`Número de Cuenta: ${usuario.banco.cuenta}`, 20, startY + 20);

  if (usuario.banco.cci) {
    pdf.text(`CCI: ${usuario.banco.cci}`, 20, startY + 25);
    return startY + 30;
  }

  return startY + 30;
};

/**
 * Agrega el monto total y información final
 */
const agregarSeccionFinal = (pdf, payload, sueldoNeto, startY) => {
  const { usuario } = payload;

  // Monto total
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text("MONTO TOTAL DE PAGO: ", 20, startY + 5);
  pdf.setFont("helvetica", "normal");
  pdf.text(`S/ ${sueldoNeto}`, 75, startY + 5);

  let currentY = startY + 10;

  // DNI
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.text("DNI:", 20, currentY);
  pdf.setFont("helvetica", "normal");
  pdf.text(String(usuario.dni), 35, currentY);

  // Anexos
  pdf.setFont("helvetica", "bold");
  pdf.text("ANEXOS:", 20, currentY + 5);
  pdf.setFont("helvetica", "normal");
  pdf.text("LAP mensual, Recibo por Honorarios.", 40, currentY + 5);

  // Despedida
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.text("Sin otro particular aprovecho la oportunidad para reiterarle las muestras de mi", 20, currentY + 10);
  pdf.text("especial consideración y estima personal.", 20, currentY + 15);
  pdf.text("Atentamente,", 20, currentY + 25);

  return currentY + 45;
};

/**
 * Agregar Firmas segun los checks en orden
 */
// Helper: convierte un archivo remoto en Base64
const loadImageAsBase64 = async (filename) => {
  try {
    // 🔹 Ruta directa a public/storage/firmas/
    const fullUrl = `/storage/firmas/${filename}`;

    const response = await fetch(fullUrl);

    if (!response.ok) {
      throw new Error(`No se pudo cargar la firma: ${response.status} - ${filename}`);
    }

    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Error al convertir imagen a Base64'));
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error(`Error cargando imagen ${filename}:`, error);
    throw error;
  }
};

const agregarFirmas = async (pdf, payload, startY) => {
  try {
    // 🔹 Usar las firmas del payload
    const firmasDisponibles = payload.firmas_disponibles || [];

    if (firmasDisponibles.length === 0) {
      console.warn('No hay firmas disponibles para mostrar');
      return startY;
    }

    console.log(`Agregando ${firmasDisponibles.length} firmas al PDF`);

    let xPosition = 20;
    const spacing = 60; // Espaciado entre firmas
    const maxFirmasPorFila = 3;
    let firmasEnFila = 0;
    let currentY = startY;

    for (const firmaData of firmasDisponibles) {
      try {
        console.log(`Procesando firma: ${firmaData.etapa} - ${firmaData.archivo}`);

        // Cargar imagen de firma
        const firmaBase64 = await loadImageAsBase64(firmaData.archivo);

        // Si ya hay 3 firmas en la fila, saltar a la siguiente
        if (firmasEnFila >= maxFirmasPorFila) {
          currentY += 45;
          xPosition = 20;
          firmasEnFila = 0;
        }

        // Agregar firma al PDF
        pdf.addImage(firmaBase64, "PNG", xPosition, currentY, 30, 20);

        // Agregar etiqueta con información del aprobador
        pdf.setFontSize(7);
        pdf.setFont("helvetica", "bold");
        pdf.text(firmaData.etapa, xPosition + 15, currentY + 25, { align: 'center' });

        pdf.setFont("helvetica", "normal");
        if (firmaData.usuario_aprobador) {
          const nombreCompleto = `${firmaData.usuario_aprobador.nombre} ${firmaData.usuario_aprobador.apellido}`;
          pdf.text(nombreCompleto, xPosition + 15, currentY + 29, { align: 'center' });
        }

        // Fecha de aprobación (formato más compacto)
        if (firmaData.fecha_aprobacion) {
          const fecha = new Date(firmaData.fecha_aprobacion).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
          });
          pdf.text(fecha, xPosition + 15, currentY + 33, { align: 'center' });
        }

        console.log(`✅ Firma ${firmaData.etapa} agregada en posición x: ${xPosition}`);

        xPosition += spacing;
        firmasEnFila++;

      } catch (firmaError) {
        console.warn(`❌ Error con firma ${firmaData.etapa}:`, firmaError.message);
        // Continuar con las siguientes firmas
      }
    }

    return currentY + 50; // Espacio para firmas + etiquetas + margen extra
  } catch (error) {
    console.error("Error general al agregar firmas:", error);
    return startY;
  }
};

// ============================================================================
// FUNCIÓN PRINCIPAL
// ============================================================================

/**
 * Genera el informe de pago en PDF
 */
const informe_pago_personal = async (payload) => {
  try {
    console.log("Generando PDF con payload:", payload);

    // Validaciones básicas
    if (!payload?.usuario?.sueldo_base || !payload?.mes) {
      throw new Error("Datos insuficientes para generar el informe");
    }

    // Procesar datos
    const proyectosData = procesarProyectosEfectuados(payload.tareas_aprobadas);
    const descuentosData = calcularDescuentosBonificaciones(payload);
    const sueldoNeto = calcularSueldoNeto(payload, descuentosData, proyectosData);

    // Crear documento PDF
    const pdf = new window.jspdf.jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Configurar documento
    let currentY = configurarEncabezado(pdf, payload);
    currentY = agregarIntroduccion(pdf, currentY);
    currentY = agregarTablaProyectos(pdf, proyectosData, currentY);
    currentY = agregarTablaDescuentos(pdf, descuentosData, currentY);
    currentY = agregarInfoBancaria(pdf, payload.usuario, currentY);
    currentY = agregarSeccionFinal(pdf, payload, sueldoNeto, currentY);
    currentY = await agregarFirmas(pdf, payload, currentY);


    // Generar nombre del archivo
    const fechaActual = new Date();
    const nombreMes = MESES[payload.mes];
    const nombreArchivo = `Informe_Pago_${payload.usuario.nombreCompleto.replace(/\s+/g, '_')}_${nombreMes}_${fechaActual.getFullYear()}.pdf`;

    // Descargar PDF
    pdf.save(nombreArchivo);

    console.log(`PDF generado exitosamente: ${nombreArchivo}`);
    return true;

  } catch (error) {
    console.error("Error al generar el PDF:", error);
    throw error;
  }
};

// ============================================================================
// FUNCIÓN DE EXPORTACIÓN (Para usar en Vue)
// ============================================================================

/**
 * Función principal para exportar desde Vue 3
 */
const exportarIP = async (tramite, csrfToken, empresaId) => {
  try {
    const fechaActual = new Date();

    const response = await fetch('/get-informe-pago-tramitado', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        user_id: tramite.user_id,
        month: fechaActual.getMonth() + 1,
        empresaId: empresaId,
        tramite_id: tramite.id,
        adelanto: 0,
        permisos: 0,
        incMof: 0,
        bondtrab: 0,
        descuenttrab: 0,
      })
    });

    if (!response.ok) {
      throw new Error(`Error en la exportación: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(data);

    if (data.status !== "success") {
      throw new Error(data.message || "Error al procesar datos del informe.");
    }

    // 🔹 Estructurar payload optimizado CON datos de firmas
    const payload = {
      usuario: {
        id: data.usuario.id,
        nombreCompleto: `${data.usuario.nombre} ${data.usuario.apellido}`,
        dni: data.usuario.dni,
        email: data.usuario.email,
        telefono: data.usuario.telefono,
        area_laboral: data.usuario.area_laboral,
        sueldo_base: data.usuario.sueldo_base,
        empresa: data.usuario.empresas?.razonSocial || "",
        banco: {
          nombre: data.usuario.banco?.nombre_banco || "",
          cuenta: data.usuario.banco?.numero_cuenta || "",
          cci: data.usuario.banco?.cci || ""
        }
      },
      mes: data.mes,
      idEmpresa: data.idEmpresa,
      extras: data.extras,
      tareas_aprobadas: data.tareas || [],
      tareas_no_aprobadas: data.tareasnoaprobados || [],
      // 🔹 AGREGAR datos del trámite y firmas
      tramite: data.tramite || null,
      aprobaciones: data.aprobaciones || [],
      firmas_disponibles: data.firmas_disponibles || []
    };

    console.log('Payload con firmas:', payload.firmas_disponibles);

    // Generar PDF
    await informe_pago_personal(payload);

    return payload;

  } catch (error) {
    console.error("Error al exportar informe de pago:", error);
    throw error;
  }
};

// Exportar funciones para uso en Vue
export { exportarIP, informe_pago_personal };