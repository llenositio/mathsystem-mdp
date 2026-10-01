// --- 002_Server.gs (VERSIÓN CORREGIDA - SELECCIÓN POR EJE Y REGISTRO DE NOTAS) ---
// =================================================================
// PUERTA DE ENTRADA API REST (Peticiones desde GitHub / Navegador)
// =================================================================

function doGet(e) {
  try {
    var idParam = e.parameter ? e.parameter.id : null;
    
    if (!idParam) {
      return respuestaJSON({ status: "error", message: "No se proporcionó el parámetro ID." });
    }
    
    // Llamamos a la función existente que procesa la querystring
    var datosExamen = obtenerDatosEvaluacion(idParam);
    
    return respuestaJSON({
      status: "success",
      data: datosExamen
    });
  } catch (error) {
    return respuestaJSON({ status: "error", message: error.toString() });
  }
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return respuestaJSON({ status: "error", message: "No se recibieron datos en la petición POST." });
    }
    
    var payload = JSON.parse(e.postData.contents);
    
    // Procesamos y guardamos el resultado usando la lógica del sistema
    var resultado = registrarResultadoExamen(payload);
    
    return respuestaJSON({
      status: "success",
      data: resultado
    });
  } catch (error) {
    return respuestaJSON({ status: "error", message: error.toString() });
  }
}

// Función auxiliar para formatear la salida JSON y habilitar la comunicación entre dominios (CORS)
function respuestaJSON(contenido) {
  return ContentService.createTextOutput(JSON.stringify(contenido))
    .setMimeType(ContentService.MimeType.JSON);
}
function FORZAR_PERMISOS() {
  DriveApp.getRootFolder();
  SpreadsheetApp.getActive();
}

function doGet(e) {
  var t = HtmlService.createTemplateFromFile('Interfaz');
  t.idTemporal = e ? (e.parameter.id || "") : ""; 
  return t.evaluate()
      .setTitle("TP de Matemática")
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * DIRECTOR: Selecciona 1 pregunta ALEATORIA por cada EJE (Columna B / índice 1)
 * y delega a los procesadores modulares.
 */
function obtenerDatos(idLink, nombreAlumno) {
  try {
    const ss = SpreadsheetApp.openById(SS_ID);
    
    if (!idLink) {
      return { alu: ["Error"], pre: [{id:0, tipo: "ERROR", enunciado: "No se recibió ningún ID en la URL."}] };
    }

    const partes = idLink.split("/");
    const listaAlu = typeof especialista_Alumnos === 'function' ? especialista_Alumnos(ss, partes) : [];
    
    let filasCandidatas = [];
    if (typeof obtenerExamenPersonalizado === "function" && nombreAlumno) {
      filasCandidatas = obtenerExamenPersonalizado(idLink, nombreAlumno, listaAlu);
    } else {
      const hoja = ss.getSheetByName(NOMBRE_HOJA_PREGUNTAS);
      const datos = hoja.getDataRange().getDisplayValues();
      const targetId = decodeURIComponent(idLink).trim().toLowerCase();
      filasCandidatas = datos.filter(f => f[0] && f[0].toString().trim().toLowerCase() === targetId);
    }
    
    if (!filasCandidatas || filasCandidatas.length === 0) {
      return { alu: listaAlu, pre: [{id:0, tipo: "ERROR", enunciado: "ID no encontrado o sin preguntas: " + idLink}] };
    }

    // --- FILTRADO POR EJE: 1 Pregunta Aleatoria por cada EJE (Columna B / Índice 1) ---
    const gruposPorEje = {};
    filasCandidatas.forEach(fila => {
      const eje = (fila[1] && fila[1].toString().trim()) ? fila[1].toString().trim() : "EJE_GENERAL";
      if (!gruposPorEje[eje]) gruposPorEje[eje] = [];
      gruposPorEje[eje].push(fila);
    });

    const filasTP = [];
    Object.keys(gruposPorEje).forEach(eje => {
      const opciones = gruposPorEje[eje];
      // Selección aleatoria de 1 pregunta por EJE
      const elegida = opciones[Math.floor(Math.random() * opciones.length)];
      filasTP.push(elegida);
    });

    // Mapa de procesadores modulares
    const mapaProcesadores = {
      'VF': typeof procesarModular_VF === 'function' ? procesarModular_VF : null,
      'OM': typeof procesarModular_OM === 'function' ? procesarModular_OM : null,
      'CA': typeof procesarModular_CA === 'function' ? procesarModular_CA : null,
      'VI': typeof procesarModular_VI === 'function' ? procesarModular_VI : null,
      'RM': typeof procesarModular_RM === 'function' ? procesarModular_RM : null,
      'CV': typeof procesarModular_CV === 'function' ? procesarModular_CV : null,
      'EM': typeof procesarModular_EM === 'function' ? procesarModular_EM : null,
      'PC1': typeof procesarModular_PC1 === 'function' ? procesarModular_PC1 : null,
      'FR1': typeof procesarModular_FR1 === 'function' ? procesarModular_FR1 : null,
      'BALANZA': typeof procesarModular_BALANZA === 'function' ? procesarModular_BALANZA : null,
      'EXAMEN': typeof procesarModular_EXAMEN === 'function' ? procesarModular_EXAMEN : null,
      'BALANZA_EXAMEN': typeof procesarModular_BALANZA === 'function' ? procesarModular_BALANZA : null
    };

    let listaPre = filasTP.map((fila, i) => {
      const tipoP = fila[15] ? fila[15].toUpperCase().trim() : "OM";
      const procesador = mapaProcesadores[tipoP];

      let pregunta = procesador 
        ? procesador(fila, i) 
        : { id: i, enunciado: "Tipo desconocido: " + tipoP };

      pregunta.tipo = tipoP; 
      pregunta.mostrarAyuda = (fila[16] && fila[16].toString().trim() === '1');
      return pregunta;
    });

    return { alu: listaAlu, pre: listaPre };
  } catch (e) {
    return { alu: ["Error"], pre: [{id:0, tipo: "ERROR", enunciado: "Error en Server: " + e.toString()}] };
  }
}

/**
 * GESTOR DE ARCHIVOS: Sube a Drive usando la configuración global
 */
function guardarArchivoDrive(objetoArchivo, nombreAlumno, idLink) {
  try {
    const carpeta = DriveApp.getFolderById(ID_CARPETA_ENTREGAS);
    
    const contenidoLimpio = Utilities.base64Decode(objetoArchivo.base64);
    const blob = Utilities.newBlob(contenidoLimpio, objetoArchivo.mimeType, objetoArchivo.nombre);
    
    const idNombreArchivo = idLink.replace(/\//g, "-");
    const nombreFinal = nombreAlumno + " - " + idNombreArchivo + " - " + objetoArchivo.nombre;
    
    blob.setName(nombreFinal);
    const archivoCreado = carpeta.createFile(blob);
    
    return archivoCreado.getUrl();
  } catch (e) {
    console.error("Error en Drive: " + e.toString());
    throw new Error("Error al subir archivo a Drive: " + e.message);
  }
}

/**
 * RECEPTOR PRINCIPAL: Recibe la nota calculada, estado, fugas y lista pedagógica de errores
 */
function procesarRespuestasFinales(datos) {
  try {
    const ss = SpreadsheetApp.openById(SS_ID);
    const hNotas = ss.getSheetByName(NOMBRE_HOJA_NOTAS) || ss.getSheets()[0];
    const hRes = ss.getSheetByName(NOMBRE_HOJA_RESULTADOS);
    
    var info = datos.datosAlumno || {};
    
    var nombreAlumno = info.nombre || info.alumno || info.nombreAlumno || datos.nombreAlumno || "Alumno";
    var nota = (datos.nota !== undefined && datos.nota !== null) ? Number(datos.nota) : 1;
    var estado = datos.estado || (nota >= 6 ? "APROBADO" : "DESAPROBADO");
    
    // Recopilación de errores pedagógicos desde el cliente
    var listaErrores = [];
    if (Array.isArray(datos.errores) && datos.errores.length > 0) {
      listaErrores = listaErrores.concat(datos.errores);
    }
    
    // Extracción complementaria desde el objeto de respuestas
    if (datos.respuestas && typeof datos.respuestas === 'object') {
      for (var k in datos.respuestas) {
        var val = datos.respuestas[k];
        if (typeof val === 'string' && val.trim().length > 0) {
          if (val.includes("FALLOS") || val.includes("Error") || val.includes("ESTADO")) {
            listaErrores.push("P" + (parseInt(k) + 1) + ": " + val);
          }
        }
      }
    }

    var detalleErrores = listaErrores.length > 0 
      ? listaErrores.join(" | ") 
      : "Sin errores registrados";

    var fugasTxt = "Sin salidas de pantalla";
    if (datos.fugasCount && datos.fugasCount > 0) {
      var detalleF = Array.isArray(datos.fugasDetalle) ? datos.fugasDetalle.join(" - ") : datos.fugasDetalle;
      fugasTxt = "Fugas: " + datos.fugasCount + " vez/veces | Detalle: " + detalleF;
    }

    var fecha = new Date();
    
    // 1. Inserción de Fila Principal en Hoja de Notas
    hNotas.appendRow([
      nombreAlumno,                                   // A: Alumno
      info.tp || 1,                                   // B: TP
      info.unidad || "U1",                            // C: Unidad
      nota,                                           // D: Nota (Escala 1 a 10)
      estado,                                         // E: Estado
      fecha,                                          // F: Fecha
      info.curso || "",                               // G: Curso
      info.division || "",                            // H: División
      info.profesor || "",                            // I: Profesor
      fugasTxt,                                       // J: Salidas de pantalla
      "Diagnóstico: " + detalleErrores,               // K: Detalle de Errores Pedagógicos
      JSON.stringify(datos.respuestas || {})          // L: Objeto completo de respuestas
    ]);

    // 2. Inserción por pregunta en WEB_Resultados (si la hoja existe)
    if (hRes && datos.respuestas) {
      for (let idClave in datos.respuestas) {
        hRes.appendRow([
          fecha, nombreAlumno, info.tp || 1, "EXAMEN", info.unidad || "",
          info.escuela || "", info.curso || "", info.division || "",
          info.turno || "", info.especialidad || "", info.profesor || "",
          idClave, datos.respuestas[idClave], (datos.puntos ? datos.puntos[idClave] : 0)
        ]);
      }
    }

    return { exito: true };
  } catch (e) {
    Logger.log("Error en procesarRespuestasFinales: " + e.toString());
    return { exito: false, error: e.toString() };
  }
}
