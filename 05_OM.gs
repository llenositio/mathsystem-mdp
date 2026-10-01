// --- 005_OM.gs (MODULAR - RECIBE FILA DIRECTA) ---

/**
 * Procesa una fila de tipo OM y la convierte en el objeto que espera el JS.
 * @param {Array} fila - Los datos de la fila de la planilla.
 * @param {Number} i - El índice de la pregunta para generar un ID único.
 */
function procesarModular_OM(fila, i) {
  try {
    // Columna K (índice 10): Enunciado
    // Columna L (índice 11): Opciones separadas por ,,,
    // Columna M (índice 12): Respuesta correcta
    
    return {
      id: "pre_om_" + i,
      enunciado: fila[10] || "Seleccioná la opción correcta:",
      opciones: fila[11] ? fila[11].split(",,,").map(opt => opt.trim()) : [],
      respuestasCorrectas: [fila[12] ? fila[12].trim() : ""]
    };

  } catch (e) {
    return { id: "error_om_" + i, enunciado: "Error en Especialista OM: " + e.toString() };
  }
}
