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

  //proyectos.push(["TOTAL", "", "", totalDias.toString(), ""]);

  return proyectos;
};

/**
 * Calcula descuentos y bonificaciones
 */
const calcularDescuentosBonificaciones = (payload) => {
  const { usuario = {}, extras = {}, tareas_aprobadas = [], tareas_no_aprobadas = [], mes } = payload;
  const sueldoPIP = Number(usuario.sueldo_base);

  if (!sueldoPIP || isNaN(sueldoPIP) || sueldoPIP <= 0) {
    console.error("Error: sueldo_base no está definido o es inválido.");
    return [];
  }

  // Conteo días incumplimiento (forzando Number)
  const conteoDiasNA = tareas_no_aprobadas.reduce((total, tarea) => {
    const dias = Number(tarea.diasAsignados ?? tarea.dias_asignados ?? 0);
    return total + (isNaN(dias) ? 0 : dias);
  }, 0);

  // Bonificaciones por rendimiento (ejemplo tu lógica original)
  let totalBonificacionDias = 0;
  tareas_aprobadas.forEach(tarea => {
    const porcentaje = Number(tarea.procentaje_trabajador ?? tarea.porcentaje ?? 0) / 100;
    if (porcentaje > 0.98) totalBonificacionDias += porcentaje;
  });

  // Días laborables y sueldo diario (asegurar Number)
  const diasLaborables = Number(obtenerDiasLaborables());
  if (!diasLaborables || isNaN(diasLaborables)) {
    console.error("Error: obtenerDiasLaborables() no devolvió un número válido.");
    return [];
  }
  const sueldoDiario = sueldoPIP / diasLaborables;

  // Extraer valores de extras como números (evita concatenaciones)
  const adelanto = Number(extras.adelanto ?? 0);
  const permisos = Number(extras.permisos ?? 0);
  const incMof = Number(extras.incMof ?? 0);
  const bondtrab = Number(extras.bondtrab ?? 0);
  const descuenttrab = Number(extras.descuenttrab ?? 0);

  // Montos (guardamos como número, pero los mostramos con 2 decimales)
  const montos = {
    adelanto: Number((sueldoDiario * adelanto).toFixed(2)),
    permisos: Number((sueldoDiario * permisos).toFixed(2)),
    incumplimiento: Number((sueldoDiario * conteoDiasNA).toFixed(2)),
    incMof: Number((sueldoDiario * incMof).toFixed(2)),
    descuentos: Number((sueldoDiario * descuenttrab).toFixed(2)),
    bonos: Number((sueldoDiario * bondtrab).toFixed(2))
  };

  // Totales (suma numérica correcta)
  const totalDescuentoMonto = (montos.adelanto + montos.permisos + montos.incumplimiento + montos.incMof + montos.descuentos);
  const totalDescuentoDias = adelanto + permisos + conteoDiasNA + incMof + descuenttrab;

  // Armar tabla (cantidad y monto con formato para visualización)
  return [
    ["PERMISOS", permisos.toFixed(2), montos.permisos.toFixed(2)],
    ["ADELANTO", adelanto.toFixed(2), montos.adelanto.toFixed(2)],
    ["INCUMPLIMIENTO DEL LAB", conteoDiasNA.toFixed(2), montos.incumplimiento.toFixed(2)],
    ["INCUMPLIMIENTO DEL MOF (2 HORAS)", incMof.toFixed(2), montos.incMof.toFixed(2)],
    ["DESCUENTO", descuenttrab.toFixed(2), montos.descuentos.toFixed(2)],
    ["TOTAL DE DESCUENTO", totalDescuentoDias.toFixed(2), totalDescuentoMonto.toFixed(2)],
    ["BONIFICACIÓN", bondtrab.toFixed(2), montos.bonos.toFixed(2)],
    ["TOTAL DE BONIFICACIÓN", bondtrab.toFixed(2), montos.bonos.toFixed(2)]
  ];
};

/**
 * Calcula el sueldo neto final
 */

const calcularSueldoNeto = (payload, datosDescuentos, proyectosData) => {
    console.log(proyectosData);
  const { usuario } = payload;
  const sueldoBase = parseFloat(usuario.sueldo_base);
  const diasLaborables = obtenerDiasLaborables();

  // ✅ Paso 1: Calcular sueldo diario
  const sueldoDiario = sueldoBase / diasLaborables;

  // ✅ Paso 2: Calcular total de días trabajados
  let totalDiasTrabajados = 0;
  for (let i = 0; i < proyectosData.length; i++) {
    totalDiasTrabajados += parseFloat(proyectosData[i][3]); // Asumiendo que [3] tiene los días trabajados
  }

  console.log(sueldoBase);
  console.log(diasLaborables);
  console.log(sueldoDiario);
  console.log(totalDiasTrabajados);
  // ✅ Paso 3: Calcular sueldo proporcional
  const sueldoProporcional = sueldoDiario * totalDiasTrabajados;

  // ✅ Paso 4: Obtener descuentos y bonificaciones
  const totalDescuentos = parseFloat(datosDescuentos[5][2]) || 0;      // Total de descuentos
  console.log(totalDescuentos);
  const totalBonificaciones = parseFloat(datosDescuentos[7][2]) || 0;  // Total de bonificaciones
  console.log(totalBonificaciones);
  // ✅ Paso 5: Calcular sueldo neto
  const sueldoNeto = sueldoProporcional + totalBonificaciones - totalDescuentos;
  console.log(sueldoNeto);
  return sueldoNeto.toFixed(2);
};

// const calcularSueldoNeto = (payload, datosDescuentos, proyectosData) => {
//   const { usuario } = payload;
//   const sueldoBase = parseFloat(usuario.sueldo_base);
//   const diasLaborables = obtenerDiasLaborables();

//   // Calcular días trabajados
//   let totalDiasTrabajados = 0;
//   for (let i = 0; i < proyectosData.length - 1; i++) {
//     totalDiasTrabajados += parseFloat(proyectosData[i][3]);
//   }

//   // Ajuste si está cerca del máximo
//   if (totalDiasTrabajados >= 24.90 && totalDiasTrabajados <= diasLaborables) {
//     totalDiasTrabajados = diasLaborables;
//   }

//   const sueldoProporcional = (sueldoBase / diasLaborables) * totalDiasTrabajados;
//   const totalDescuentos = parseFloat(datosDescuentos[5][2]); // TOTAL DE DESCUENTO
//   const totalBonificaciones = parseFloat(datosDescuentos[7][2]); // TOTAL DE BONIFICACIÓN

//   return (sueldoProporcional + totalBonificaciones - totalDescuentos).toFixed(2);
// };

// ============================================================================
// GENERADOR DE PDF
// ============================================================================
const checkAndAddPage = (pdf, currentY, requiredHeight) => {
  const pageHeight = pdf.internal.pageSize.getHeight();
  const bottomMargin = 20; // Un margen de seguridad en la parte inferior de la página

  if (currentY + requiredHeight > pageHeight - bottomMargin) {
    pdf.addPage();
    return 20; // Retornamos el margen superior para la nueva página
  }

  return currentY; // Aún hay espacio, continuamos en la misma posición
};

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
 * Dibuja la sección final del documento en un diseño de dos columnas.
 * Izquierda: Info bancaria y texto final.
 * Derecha: Firmas.
 */
const agregarSeccionFinalEnColumnas = async (pdf, payload, sueldoNeto, startY) => {
  // 1. Definir las posiciones X de las columnas
  const xColumnaIzquierda = 20; // Margen izquierdo para el texto
  const xColumnaDerecha = 130;  // Dónde empieza la columna de firmas

  // 2. Dibujar la columna de la izquierda
  // Llama a las funciones que ya tienes, pasándoles la posición X correcta.
  let yFinalIzquierda = agregarInfoBancaria(pdf, payload.usuario, startY, xColumnaIzquierda);
  yFinalIzquierda = agregarSeccionFinal(pdf, payload, sueldoNeto, yFinalIzquierda, xColumnaIzquierda);

  // 3. Dibujar la columna de la derecha (firmas)
  // Nota que empieza desde la misma 'startY' para que se alineen horizontalmente.
  const yFinalDerecha = await agregarFirmas(pdf, payload, startY + 10, xColumnaDerecha);

  // 4. Determinar la altura final
  // La nueva posición Y será la del elemento que haya quedado más abajo.
  return Math.max(yFinalIzquierda, yFinalDerecha);
};

/**
 * Agrega la información bancaria en una posición X específica.
 */
const agregarInfoBancaria = (pdf, usuario, startY, startX = 20) => {
  if (!usuario.banco?.nombre || !usuario.banco?.cuenta) {
    return startY;
  }

  let currentY = startY + 10;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text("INFORMACIÓN BANCARIA:", startX, currentY);

  currentY += 5;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text(`Banco: ${usuario.banco.nombre}`, startX, currentY);

  currentY += 5;
  pdf.text(`Número de Cuenta: ${usuario.banco.cuenta}`, startX, currentY);

  if (usuario.banco.cci) {
    currentY += 5;
    pdf.text(`CCI: ${usuario.banco.cci}`, startX, currentY);
  }

  return currentY + 5; // Retornamos la Y final
};
/**
 * Agrega el monto total y la información final en una posición X específica.
 */
const agregarSeccionFinal = (pdf, payload, sueldoNeto, startY, startX = 20) => {
  const { usuario } = payload;
  let currentY = startY;

  // Monto total
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text("MONTO TOTAL DE PAGO: ", startX, currentY + 5);
  pdf.setFont("helvetica", "normal");
  pdf.text(`S/ ${sueldoNeto}`, startX + 55, currentY + 5);

  currentY += 10;

  // DNI
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.text("DNI:", startX, currentY);
  pdf.setFont("helvetica", "normal");
  pdf.text(String(usuario.dni), startX + 15, currentY);

  // Anexos
  currentY += 5;
  pdf.setFont("helvetica", "bold");
  pdf.text("ANEXOS:", startX, currentY);
  pdf.setFont("helvetica", "normal");
  pdf.text("LAP mensual, Recibo por Honorarios.", startX + 20, currentY);

  // Despedida
  currentY += 10;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.text("Sin otro particular aprovecho la oportunidad para reiterarle las muestras de mi", startX, currentY);
  pdf.text("especial consideración y estima personal.", startX, currentY + 5);
  pdf.text("Atentamente,", startX, currentY + 15);

  return currentY + 35;
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

/**
 * Agrega Firmas en una cuadrícula de 3 columnas, con tamaño reducido.
 */
const agregarFirmas = async (pdf, payload, startY, startX) => {
  try {
    const firmasDisponibles = payload.firmas_disponibles || [];
    if (firmasDisponibles.length === 0) return startY;

    // --- CAMBIOS CLAVE ---
    // 1. Reducción considerable del tamaño de la firma
    const firmaWidth = 25; // Reducido de 40
    const firmaHeight = 20; // Reducido de 30

    // 2. Configuración para la cuadrícula de 3 columnas
    const numColumns = 3;
    const spacingX = 5; // Espacio horizontal entre firmas
    const rowHeight = firmaHeight + 12; // Altura total de una fila (imagen + texto + espacio)

    let currentY = startY;
    let colIndex = 0; // Para contar en qué columna estamos (0, 1, o 2)

    for (const firmaData of firmasDisponibles) {
      try {
        // Al inicio de cada nueva fila (cuando la columna es 0),
        // verificamos si hay espacio para una fila completa.
        if (colIndex === 0) {
          currentY = checkAndAddPage(pdf, currentY, rowHeight);
        }

        // 3. Cálculo dinámico de la posición X para cada columna
        const currentX = startX + (colIndex * (firmaWidth + spacingX)) - 10;
        const firmaBase64 = await loadImageAsBase64(firmaData.archivo);

        // Dibuja la imagen de la firma
        pdf.addImage(firmaBase64, "PNG", currentX, currentY, firmaWidth, firmaHeight);

        // Dibuja el texto debajo de la firma
        pdf.setFontSize(7);
        pdf.setFont("helvetica", "bold");
        pdf.text(
          firmaData.etapa,
          currentX + (firmaWidth / 2), // Centra el texto
          currentY + firmaHeight + 4,
          { align: "center" }
        );

        // 4. Lógica para avanzar a la siguiente columna o fila
        colIndex++;
        if (colIndex >= numColumns) {
          colIndex = 0; // Resetea el contador de columna
          currentY += rowHeight; // Baja a la siguiente fila
        }

      } catch (firmaError) {
        console.warn(`❌ Error con la firma ${firmaData.etapa}:`, firmaError.message);
      }
    }

    // Si la última fila no estaba completa, la posición Y final
    // debe considerar la altura de esa fila parcial.
    if (colIndex !== 0) {
      return currentY + rowHeight;
    }

    return currentY; // Retorna la posición Y final

  } catch (error) {
    console.error("Error general al agregar firmas:", error);
    return startY;
  }
};

// ============================================================================
// FUNCIÓN PRINCIPAL
// ============================================================================

/**
 * Genera el informe de pago en PDF, manejando múltiples páginas y columnas.
 */
const informe_pago_personal = async (payload) => {
  try {
    if (!payload?.usuario?.sueldo_base || !payload?.mes) {
      throw new Error("Datos insuficientes para generar el informe");
    }

    const proyectosData = procesarProyectosEfectuados(payload.tareas_aprobadas);
    const descuentosData = calcularDescuentosBonificaciones(payload);
    const sueldoNeto = calcularSueldoNeto(payload, descuentosData, proyectosData);

    const pdf = new window.jspdf.jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // 1. Encabezado e Introducción
    let currentY = configurarEncabezado(pdf, payload);
    currentY = agregarIntroduccion(pdf, currentY);

    // 2. Tabla de Proyectos
    currentY = agregarTablaProyectos(pdf, (proyectosData), currentY);

    // 3. Tabla de Descuentos
    currentY = checkAndAddPage(pdf, currentY, 70);
    currentY = agregarTablaDescuentos(pdf, descuentosData, currentY);

    // 4. SECCIÓN FINAL CON COLUMNAS (IZQUIERDA: INFO, DERECHA: FIRMAS)
    // Estimamos que esta sección combinada necesitará unos 100mm de alto
    currentY = checkAndAddPage(pdf, currentY, 100);
    currentY = await agregarSeccionFinalEnColumnas(pdf, payload, sueldoNeto, currentY);

    // Generar nombre del archivo y descargar
    const fechaActual = new Date();
    const nombreMes = MESES[payload.mes];
    const nombreArchivo = `Informe_Pago_${payload.usuario.nombreCompleto.replace(/\s+/g, '_')}_${nombreMes}_${fechaActual.getFullYear()}.pdf`;

    pdf.save(nombreArchivo);
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
  console.log(tramite.fecha_informe_sol)
  try {
    const fecha = new Date();
    const mesSolicitadoInfo = tramite.fecha_informe_sol || fecha.getMonth();

    const response = await fetch('/tramites/informe-pago', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        user_id: tramite.user_id,
        month: mesSolicitadoInfo,
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

    //console.log('Payload con firmas:', payload.firmas_disponibles);

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