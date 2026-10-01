// --- 012_PC1.gs (MODULAR - RECIBE FILA DIRECTA) ---

/**
 * Procesa una fila de tipo PC1 (Plano Cartesiano Interactivo)
 */
function procesarModular_PC1(fila, i) {
  try {
    // Leemos la Columna M (índice 12)
    var coordenadaRaw = fila[12] ? fila[12].toString().trim() : "";
    
    // La "cocinamos": le sacamos paréntesis y espacios, dejando solo el formato estandarizado "X;Y"
    var coordenadaLimpia = coordenadaRaw.replace(/[()\s]/g, '');

    return {
      id: "pre_pc1_" + i,
      tipo: "PC1", 
      enunciado: fila[10] ? fila[10].trim() : "Ubicá el punto en el plano cartesiano:",
      respuestasCorrectas: [coordenadaLimpia] // Guarda la coordenada limpia lista para comparar
    };

  } catch (e) {
    return { 
      id: "error_pc1_" + i, 
      enunciado: "Error en Especialista PC1: " + e.toString() 
    };
  }
}
