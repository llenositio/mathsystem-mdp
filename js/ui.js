// ui.js - Lector de Google Sheet publicado como CSV en tiempo real

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS3jIdoBOGDyAPfT33sIgZ3jVHSawHEUwUbyKcbdwH26Nfq0GmnZNtidsNeYQklJP70hVF3t2x7qgui/pub?gid=1154233885&single=true&output=csv";

document.addEventListener("DOMContentLoaded", function() {
  cargarDatosDesdeSheet();
});

// Parsea filas respetando comillas y comas internas
function parsearLineaCSV(texto) {
  const resultado = [];
  let celda = '';
  let enComillas = false;
  
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (c === '"') {
      if (enComillas && texto[i + 1] === '"') {
        celda += '"';
        i++;
      } else {
        enComillas = !enComillas;
      }
    } else if (c === ',' && !enComillas) {
      resultado.push(celda.trim());
      celda = '';
    } else {
      celda += c;
    }
  }
  resultado.push(celda.trim());
  return resultado;
}

async function cargarDatosDesdeSheet() {
  try {
    const respuesta = await fetch(CSV_URL);
    if (!respuesta.ok) throw new Error("Error al obtener la planilla pública");

    const texto = await respuesta.text();
    const lineas = texto.split(/\r?\n/);
    const tpsMap = {};

    lineas.forEach((linea, index) => {
      if (!linea.trim()) return;
      
      const c = parsearLineaCSV(linea);
      
      // Mapeo según la estructura de columnas de tu planilla
      const unidad = c[0] || "U1";
      const tpNum = c[1] || "001";
      const tipo = c[2] || "OM";
      const mostrarAyuda = c[3] || "NO";
      const consigna = c[4] || "";
      const textoOpciones = c[5] || "";
      const correctaTexto = c[6] || "";

      // Evita los encabezados de la tabla
      if (!consigna || index === 0 || consigna.toLowerCase() === "consigna") return;

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

    window.TP_DATOS_TECNICA_1 = { tps: tpsMap };
    poblarDesplegableTPs(tpsMap);

  } catch (err) {
    console.error("Error al cargar Google Sheet:", err);
  }
}

function poblarDesplegableTPs(tps) {
  const selectTP = document.getElementById("select-tp") || document.querySelectorAll("select")[2];
  if (!selectTP) return;

  selectTP.innerHTML = '<option value="">-- Seleccionar TP o Examen --</option>';

  Object.keys(tps).forEach(clave => {
    const option = document.createElement("option");
    option.value = clave;
    option.textContent = tps[clave].titulo;
    selectTP.appendChild(option);
  });

  selectTP.onchange = function() {
    const clave = this.value;
    if (clave && tps[clave]) {
      window.cargarTP(clave);
    }
  };
}

window.cargarTP = function(clave) {
  if (typeof window.reiniciarEvaluacion === "function") {
    window.reiniciarEvaluacion();
  }

  const tpData = window.TP_DATOS_TECNICA_1.tps[clave];
  if (!tpData) return;

  window.tpClaveActual = clave;
  window.preguntasActuales = tpData.preguntas;
  window.preguntaIndiceActual = 0;

  if (typeof window.renderizarPregunta === "function") {
    window.renderizarPregunta(0);
  }
};
