/**
 * 014_BALANZA: Ecuaciones Interactivas con Balanza
 * Lee del Excel:
 *  - Columna K (índice 10): Enunciado
 *  - Columna L (índice 11): Pasos/Operaciones (Ej: "- 5,,,+ 5,,,* 5,,,/ 5")
 *  - Columna M (índice 12): Respuesta final (Ej: "7")
 */
function procesarModular_BALANZA(fila, i) {
  try {
    var enunciadoRaw = (fila && fila[10]) ? fila[10].toString().trim() : "";
    var configRawStr = (fila && fila[11]) ? fila[11].toString() : "";
    var respuestaCorrecta = (fila && fila[12]) ? fila[12].toString().trim() : "";

    // Mismo desglose usando tu separador ,,,
    var opcionesPasos = configRawStr ? configRawStr.split(',,,').map(function(item) {
      return item.trim();
    }) : [];

    return {
      id: "pre_balanza_" + (i || 0),
      tipo: "BALANZA",
      enunciado: enunciadoRaw,
      pasosDisponibles: opcionesPasos,
      respuestasCorrectas: [respuestaCorrecta]
    };

  } catch (e) {
    return { 
      id: "error_balanza_" + (i || 0), 
      tipo: "BALANZA",
      enunciado: "Ejercicio con formato a revisar",
      pasosDisponibles: [],
      respuestasCorrectas: [""] 
    };
  }
}
