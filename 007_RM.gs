// --- 007_RM.gs (MODULAR - RECIBE FILA DIRECTA) ---

/**
 * Procesa una fila de tipo RM (Relación/Tarjetas)
 */
function procesarModular_RM(fila, i) {
  try {
    let opcionesCrudas = fila[11] ? fila[11].split(",,,") : [];
    let opcionesLimpias = opcionesCrudas.map(opt => opt.trim()).filter(opt => opt !== "");

    return {
      id: "pre_rm_" + i,
      tipo: "RM", // <--- AGREGADO: Para que en WEB_Resultados figure RM
      enunciado: fila[10] ? fila[10].trim() : "Relacioná el concepto:",
      opciones: opcionesLimpias,
      respuestasCorrectas: [fila[12] ? fila[12].trim() : ""]
    };

  } catch (e) {
    return { 
      id: "error_rm_" + i, 
      enunciado: "Error en Especialista RM: " + e.toString() 
    };
  }
}
