// --- 010_EM.gs (MODULAR - ESPECIALISTA EN EMPAREJAMIENTO) ---

/**
 * Procesa una fila de tipo EM (Emparejamiento / Unir con flechas)
 * @param {Array} fila - Los datos de la fila de la planilla.
 * @param {Number} i - El índice de la pregunta.
 */
function procesarModular_EM(fila, i) {
  try {
    // Columna K (índice 10): Enunciado (Instrucciones)
    // Columna L (índice 11): PARES separados por ,,, y cada par separado por |=>|
    // Ejemplo en Excel: "Matriz A |=>| \begin{pmatrix}1\\2\end{pmatrix} ,,, Matriz B |=>| \begin{pmatrix}3\\4\end{pmatrix}"
    
    let paresCrudos = (fila[11] || "").split(",,,")
                      .map(p => p.trim())
                      .filter(p => p !== "");

    // Creamos una lista de "llaves" y una lista de "valores" usando el separador seguro |=>|
    let pares = paresCrudos.map(p => {
      // Usamos |=>| en lugar de : para no romper fórmulas de LaTeX
      let partes = p.split("|=>|"); 
      return {
        llave: partes[0] ? partes[0].trim() : "",
        valor: partes[1] ? partes[1].trim() : ""
      };
    });

    return {
      id: "pre_em_" + i,
      tipo: "EM", // Identificador de tipo para el JS
      enunciado: fila[10] || "Emparejá los siguientes elementos:",
      pares: pares, // Estructura completa para validación en JS
      llaves: pares.map(p => p.llave), // Las etiquetas fijas (izquierda)
      // Opciones mezcladas para el selector (derecha)
      opciones: pares.map(p => p.valor).sort(() => Math.random() - 0.5) 
    };

  } catch (e) {
    return { 
      id: "error_em_" + i, 
      enunciado: "Error en Especialista EM: " + e.toString() 
    };
  }
}
