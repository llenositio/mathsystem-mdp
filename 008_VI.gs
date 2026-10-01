// --- 008_VI.gs (MODULAR - RECIBE FILA DIRECTA) ---

/**
 * Procesa una fila de tipo VI (Visual/Imagen)
 * @param {Array} fila - Los datos de la fila de la planilla.
 * @param {Number} i - El índice de la pregunta.
 */
function procesarModular_VI(fila, i) {
  try {
    // Columna K (índice 10): Link de la imagen principal (Consigna)
    // Columna L (índice 11): Links de imágenes opciones separadas por ,,,
    // Columna M (índice 12): Link de la imagen correcta
    
    let opcionesCrudas = fila[11] ? fila[11].split(",,,") : [];
    let opcionesLimpias = opcionesCrudas.map(opt => opt.trim()).filter(opt => opt !== "");

    return {
      id: "pre_vi_" + i,
      enunciado: fila[10] ? fila[10].trim() : "", 
      opciones: opcionesLimpias,
      respuestasCorrectas: [fila[12] ? fila[12].trim() : ""]
    };

  } catch (e) {
    return { 
      id: "error_vi_" + i, 
      enunciado: "Error en Especialista VI: " + e.toString() 
    };
  }
}
