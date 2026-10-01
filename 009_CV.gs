// --- 009_CV.gs (MODULAR - RECIBE FILA DIRECTA) ---

/**
 * Procesa una fila de tipo CV (Checklist / Varias)
 * @param {Array} fila - Los datos de la fila de la planilla.
 * @param {Number} i - El índice de la pregunta.
 */
function procesarModular_CV(fila, i) {
  try {
    // Columna K (índice 10): Enunciado
    // Columna L (índice 11): Opciones separadas por ,,,
    // Columna M (índice 12): RESPUESTAS CORRECTAS separadas por ,,,
    
    let opciones = (fila[11] || "").split(",,,")
                    .map(o => o.trim())
                    .filter(o => o !== "");
                     
    let correctas = (fila[12] || "").split(",,,")
                     .map(c => c.trim())
                     .filter(c => c !== "");

    return {
      id: "pre_cv_" + i,
      enunciado: fila[10] ? fila[10].trim() : "Seleccioná todas las opciones correctas:",
      opciones: opciones,
      respuestasCorrectas: correctas // Aquí el array puede tener varios elementos
    };

  } catch (e) {
    return { 
      id: "error_cv_" + i, 
      enunciado: "Error en Especialista CV: " + e.toString() 
    };
  }
}
