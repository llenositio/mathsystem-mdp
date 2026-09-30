window.TP_DATOS_TECNICA_1 = {
  modalidad: "Escuela Técnica",
  ano: "1",
  materia: "Matemática 1° Año - Prof. Claudio Llenolio",
  tps: {}
};

// URL CSV de tu Google Sheet publicada
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS3jIdoBOGDyAPfT33sIgZ3jVHSawHEUwUbyKcbdwH26Nfq0GmnZNtidsNeYQklJP70hVF3t2x7qgui/pub?gid=1154233885&single=true&output=csv";

// Función para parsear correctamente filas CSV respetando comillas
function parseCSVLine(text) {
  const result = [];
  let cell = '';
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      result.push(cell.trim());
      cell = '';
    } else {
      cell += c;
    }
  }
  result.push(cell.trim());
  return result;
}

async function cargarDatosDesdeCSV() {
  try {
    const respuesta = await fetch(CSV_URL);
    if (!respuesta.ok) throw new Error("No se pudo obtener el archivo CSV");
    
    const textoCompleto = await respuesta.text();
    const lineas = textoCompleto.split(/\r?\n/);
    const tpsMap = {};

    lineas.forEach((linea, index) => {
      if (!linea.trim()) return;
      
      const c = parseCSVLine(linea);
      
      // Mapeo de columnas según tu planilla
      const unidad = c[0] || "U1";
      const tpNum = c[1] || "001";
      const tipo = c[2] || "OM";
      const mostrarAyuda = c[3] || "NO";
      const consigna = c[4] || "";
      const textoOpciones = c[5] || "";
      const correctaTexto = c[6] || "";

      // Saltear encabezados si la consigna es el título de la columna o está vacía
      if (!consigna || consigna.toLowerCase() === "consigna" || index === 0) return;

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
    
    // Notificar a la interfaz que los datos están listos
    document.dispatchEvent(new Event("datosTPsCargados"));
    if (typeof window.cargarDesplegableTPs === 'function') {
      window.cargarDesplegableTPs();
    }
  } catch (err) {
    console.error("Error cargando los TPs desde el CSV:", err);
  }
}

// Ejecutar la carga
cargarDatosDesdeCSV();
