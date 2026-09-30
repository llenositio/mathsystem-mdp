window.TP_DATOS_TECNICA_1 = {
  modalidad: "Escuela Técnica",
  ano: "1",
  materia: "Matemática 1° Año - Prof. Claudio Llenolio",
  tps: {}
};

function solicitarDatosGoogleSheets() {
  const script = document.createElement('script');
  script.src = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS3jIdoBOGDyAPfT33sIgZ3jVHSawHEUwUbyKcbdwH26Nfq0GmnZNtidsNeYQklJP70hVF3t2x7qgui/gviz/tq?gid=1154233885&tqx=responseHandler:procesarRespuestaSheet";
  document.head.appendChild(script);
}

window.procesarRespuestaSheet = function(datos) {
  try {
    const filas = datos.table.rows;
    const tpsMap = {};

    filas.forEach((fila) => {
      const c = fila.c;
      if (!c) return;

      const unidad = c[0] && c[0].v ? String(c[0].v).trim() : "U1";
      const tpNum = c[1] && c[1].v ? String(c[1].v).trim() : "001";
      const tipo = c[2] && c[2].v ? String(c[2].v).trim() : "OM";
      const mostrarAyuda = c[3] && c[3].v ? String(c[3].v).trim() : "NO";
      const consigna = c[4] && c[4].v ? String(c[4].v).trim() : "";
      const textoOpciones = c[5] && c[5].v ? String(c[5].v).trim() : "";
      const correctaTexto = c[6] && c[6].v ? String(c[6].v).trim() : "";

      if (!consigna) return;

      const tpClave = `TP_${unidad}_${tpNum}`;

      if (!tpsMap[tpClave]) {
        tpsMap[tpClave] = {
          titulo: `TP ${tpNum} (${unidad}): Matemática - Prof. Llenolio`,
          subtitulo: `1° Año Técnica — ${unidad} TP ${tpNum}`,
          tipo: tipo,
          preguntas: []
        };
      }

      const opciones = textoOpciones
        .split(',,,')
        .map(o => o.trim())
        .filter(o => o.length > 0);

      let idxCorrecta = opciones.findIndex(op => op.toLowerCase() === correctaTexto.toLowerCase());
      if (idxCorrecta === -1) idxCorrecta = 0;

      tpsMap[tpClave].preguntas.push({
        consigna: consigna,
        opciones: opciones,
        correcta: idxCorrecta,
        mostrarAyuda: mostrarAyuda.toUpperCase() === "SI"
      });
    });

    window.TP_DATOS_TECNICA_1.tps = tpsMap;
    
    // Disparar evento y ejecutar actualización directa de la interfaz
    document.dispatchEvent(new Event("datosTPsCargados"));
    if (typeof window.cargarDesplegableTPs === 'function') {
      window.cargarDesplegableTPs();
    }
  } catch (err) {
    console.error("Error cargando los TPs reales:", err);
  }
};

// Iniciar carga al terminar de leer el archivo
solicitarDatosGoogleSheets();
