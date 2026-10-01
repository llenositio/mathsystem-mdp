// ------ 006_CA (Carga de Archivos)---
function procesarModular_CA(fila, i) {
  try {
    // Tomamos el enunciado de la Columna K (índice 10)
    let enunciadoBase = fila[10] || "Por favor, subí el desarrollo de tu trabajo práctico.";
    
    // Tomamos el link del video de la Columna M (índice 12)
    let linkVideo = fila[12] || ""; 

    // Si hay algo en la Columna M, lo sumamos al texto
    if (linkVideo && linkVideo.includes("http")) {
      enunciadoBase += "\n\n🎬 VIDEO DE AYUDA: " + linkVideo;
    }

    return {
      id: i,
      enunciado: enunciadoBase, 
      imagen: fila[11] || "",    // Columna L (índice 11)
      video: "",                 // IMPORTANTE: Lo mandamos vacío para que el botón de carga NO desaparezca
      tipo: "CA"
    };

  } catch (e) {
    return { 
      id: i, 
      enunciado: "Error en Especialista CA: " + e.toString(),
      tipo: "ERROR"
    };
  }
}
