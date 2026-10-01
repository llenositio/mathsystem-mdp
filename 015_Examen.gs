/**
 * PROCESADOR MODULAR: EXAMEN (Paso a Paso)
 * Parsea y mezcla aleatoriamente las opciones de la pregunta.
 */
function procesarModular_EXAMEN(fila, i) {
  try {
    const rawColK = fila[10] ? fila[10].toString().trim() : "";
    const rawColL = fila[11] ? fila[11].toString().trim() : "";

    if (!rawColK || !rawColL) {
      throw new Error("Las columnas K o L están vacías.");
    }

    // 1. Separamos los bloques de Columna K por ',,,'
    const partesK = rawColK.split(",,,").map(p => p.trim());
    const primeraParteK = partesK[0];
    const idxUltimoColon = primeraParteK.lastIndexOf(":");

    let enunciadoGlobal = primeraParteK;
    let tituloPaso1 = "Paso 1";

    if (idxUltimoColon !== -1) {
      enunciadoGlobal = primeraParteK.substring(0, idxUltimoColon).trim();
      tituloPaso1 = primeraParteK.substring(idxUltimoColon + 1).trim();
    }

    const titulosPasos = [tituloPaso1];
    for (let k = 1; k < partesK.length - 1; k++) {
      titulosPasos.push(partesK[k]);
    }

    // 2. Parseamos y mezclamos las opciones de cada paso
    const bloquesPasosL = rawColL.split(",,,");

    const pasosParsed = bloquesPasosL.map((bloque, idxPaso) => {
      const opcionesRaw = bloque.split(";");
      let opcionesParsed = opcionesRaw.map(opcStr => {
        let txt = opcStr.trim();
        let esCorrecta = false;
        let errorMsg = "";

        if (txt.startsWith("*")) {
          esCorrecta = true;
          txt = txt.substring(1).trim();
        }

        if (txt.includes(":")) {
          const idxDosPuntos = txt.indexOf(":");
          errorMsg = txt.substring(idxDosPuntos + 1).trim();
          txt = txt.substring(0, idxDosPuntos).trim();
        }

        return {
          texto: txt,
          esCorrecta: esCorrecta,
          errorMsg: errorMsg
        };
      });

      // Mezclar opciones aleatoriamente
      opcionesParsed = mezclarArrayExamen(opcionesParsed);

      return {
        titulo: titulosPasos[idxPaso] || `Paso ${idxPaso + 1}`,
        opciones: opcionesParsed
      };
    });

    return {
      id: i,
      tipo: "EXAMEN",
      enunciado: enunciadoGlobal,
      pasos: pasosParsed,
      puntajeTotal: parseFloat(fila[13]) || 1
    };
  } catch (err) {
    console.error("Error procesando EXAMEN en fila " + i + ":", err);
    return {
      id: i,
      tipo: "ERROR",
      enunciado: "Error al procesar la estructura del Examen: " + err.message,
      pasos: null
    };
  }
}

/**
 * Mezcla de manera aleatoria el array de opciones (Algoritmo Fisher-Yates)
 */
function mezclarArrayExamen(array) {
  const copia = [...array];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}
