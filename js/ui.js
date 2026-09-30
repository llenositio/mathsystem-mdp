// ui.js - Sincronización completa con Google Sheets CSV

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS3jIdoBOGDyAPfT33sIgZ3jVHSawHEUwUbyKcbdwH26Nfq0GmnZNtidsNeYQklJP70hVF3t2x7qgui/pub?gid=1154233885&single=true&output=csv";

document.addEventListener("DOMContentLoaded", function() {
  cargarDatosDesdeSheet();
});

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
    if (!respuesta.ok) throw new Error("Error al obtener la planilla");

    const texto = await respuesta.text();
    const lineas = texto.split(/\r?\n/);
    const tpsMap = {};

    lineas.forEach((linea, index) => {
      if (!linea.trim()) return;
      
      const c = parsearLineaCSV(linea);
      
      const unidad = c[0] || "U1";
      const tpNum = c[1] || "001";
      const tipo = c[2] || "OM";
      const mostrarAyuda = c[3] || "NO";
      const consigna = c[4] || "";
      const textoOpciones = c[5] || "";
      const correctaTexto = c[6] || "";

      if (!consigna || index === 0 || consigna.toLowerCase() === "consigna") return;

      const tpClave = `TP_${unidad}_${tpNum}`;

      if (!tpsMap[tpClave]) {
        tpsMap[tpClave] = {
          titulo: `TP ${tpNum} (${unidad}): Matemática - Prof. Llenolio`,
          subtitulo: `Escuela: ET24DE17 - Curso: 1º 1`,
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
  // Busca cualquier select desplegable disponible en la sección de selección
  const selects = document.querySelectorAll("select");
  const selectTP = selects.length >= 3 ? selects[2] : document.getElementById("select-tp");
  
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
  if (!window.TP_DATOS_TECNICA_1 || !window.TP_DATOS_TECNICA_1.tps[clave]) return;

  const tpData = window.TP_DATOS_TECNICA_1.tps[clave];

  window.tpClaveActual = clave;
  window.preguntasActuales = tpData.preguntas;
  window.preguntaIndiceActual = 0;
  window.aciertos = 0;

  if (typeof window.renderizarPregunta === "function") {
    window.renderizarPregunta(0);
  }
};
