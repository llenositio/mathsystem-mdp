// --- 004_VF.gs (MODULAR - RECIBE FILA DIRECTA) ---
/**
 * Procesa una fila de tipo VF y la convierte en el objeto que espera el JS.
 * @param {Array} fila - Los datos de la fila de la planilla.
 * @param {Number} i - El índice de la pregunta para generar un ID único.
 */
function procesarModular_VF(fila, i) {
  try {
    const listaTextos = fila[11] ? fila[11].split(",,,") : [];
    const listaResp = fila[12] ? fila[12].split(",,,") : [];

    // Lógica modular: El especialista decide el enunciado
    let enunciadoFinal = "Indica si es Verdadero (V) o Falso (F):sdgsdfg"; // Texto por defecto
    
    if (fila[10] && fila[10].trim() !== "") {
      enunciadoFinal = fila[10].trim(); // Si hay algo en Columna K, manda eso
    }

    return {
      id: "pre_vf_" + i,
      tipo: "VF", 
      enunciado: enunciadoFinal, 
      subPreguntas: listaTextos.map((texto, idx) => {
        return {
          texto: texto.trim(),
          correcta: (listaResp[idx] ? listaResp[idx].trim().toUpperCase() : "V")
        };
      })
    };
  } catch (e) {
    return { id: "error_" + i, tipo: "VF", enunciado: "Error en Especialista VF: " + e.toString() };
  }
}
