<style>
  .examen-contenedor-opciones {
    display: flex !important;
    flex-direction: column !important;
    width: 100% !important;
    gap: 14px !important;
    margin-top: 16px !important;
  }
  .examen-opcion-btn {
    display: block !important;
    width: 100% !important;
    clear: both !important;
    text-align: left !important;
    white-space: normal !important;
    word-break: break-word !important;
    box-sizing: border-box !important;
    font-size: 1.15rem !important;
    line-height: 1.6 !important;
    padding: 18px 22px !important;
    border-width: 2px !important;
    overflow-x: auto !important;
  }
  .examen-opcion-btn .mjx-chtml, 
  #contenedor-examen-main .mjx-chtml {
    font-size: 125% !important;
  }
</style>

<script>
/**
 * Separa opciones compuestas de derivadas (u' y v') en dos filas verticales
 */
function formatearTextoOpcionExamen(texto) {
  if (!texto) return '';
  if ((texto.includes("u'") || texto.includes("u(")) && 
      (texto.includes("v'") || texto.includes("v(")) && 
      (texto.includes(" y ") || texto.includes("y "))) {
    
    let partes = texto.split(/\s+y\s+|\s+y\s+(?=\$)/i);
    if (partes.length >= 2) {
      return `
        <div class="flex flex-col gap-2 w-full py-1 text-left">
          <div class="w-full">${partes[0].trim()}</div>
          <div class="w-full pt-2 border-t border-slate-200 text-slate-700">
            <span class="text-xs font-bold text-slate-400 mr-2 uppercase">y</span>
            ${partes.slice(1).join(" y ").trim()}
          </div>
        </div>`;
    }
  }
  return texto;
}

/**
 * Especialista EXAMEN
 */
function renderizarEspecialista_EXAMEN(pregunta, indice) {
  if (!pregunta || !Array.isArray(pregunta.pasos) || pregunta.pasos.length === 0) {
    return `<div class="p-4 bg-rose-50 border border-rose-200 rounded-xl my-3 text-rose-700 text-sm font-semibold">
              ❌ Error: Datos de examen no válidos o sin pasos procesados.
            </div>`;
  }

  window.datosExamen = window.datosExamen || {};
  window.erroresPedagogicos = window.erroresPedagogicos || [];
  window.respuestas = window.respuestas || {};

  window.datosExamen[indice] = {
    pasos: pregunta.pasos,
    totalPasosPregunta: pregunta.pasos.length,
    pasoActual: 0,
    bloqueado: false,
    intentosFallidos: 0,
    erroresCometidos: []
  };

  const primerPaso = pregunta.pasos[0];
  let opcionesHTML = '';
  
  if (primerPaso && Array.isArray(primerPaso.opciones)) {
    primerPaso.opciones.forEach((opc, idx) => {
      const contenidoVisible = formatearTextoOpcionExamen(opc.texto);
      opcionesHTML += `
        <button onclick="evaluarOpcionExamen(${indice}, ${idx})" id="opt-exam-${indice}-${idx}" 
                class="examen-opcion-btn border-slate-300 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all font-medium text-slate-800 shadow-sm cursor-pointer">
          <div>${contenidoVisible}</div>
        </button>`;
    });
  }

  setTimeout(() => {
    if (window.MathJax && MathJax.typesetPromise) {
      const el = document.getElementById(`contenedor-examen-${indice}`);
      if (el) MathJax.typesetPromise([el]).catch(err => console.warn(err));
    }
  }, 100);

  return `
    <div id="contenedor-examen-${indice}" class="p-6 my-4 bg-white border border-slate-200 rounded-2xl shadow-sm w-full block">
      <input type="hidden" id="input-examen-resultado-${indice}" name="respuesta_${indice}" id="respuesta_${indice}" value="" />

      <div class="mb-5 pb-4 border-b border-slate-200 text-lg font-semibold text-slate-900 leading-relaxed">
        ${pregunta.enunciado || ''}
      </div>

      <div id="encabezado-paso-${indice}" class="mb-4">
        <span class="text-xs font-bold text-blue-600 uppercase tracking-wider">Paso 1 de ${pregunta.pasos.length}</span>
        <h3 class="text-base font-bold text-slate-800 mt-1">${primerPaso ? (primerPaso.titulo || '') : ''}</h3>
      </div>

      <div id="feedback-examen-${indice}" class="hidden p-4 mb-4 text-sm font-bold rounded-xl transition-all"></div>

      <div id="opciones-paso-${indice}" class="examen-contenedor-opciones">
        ${opcionesHTML}
      </div>
    </div>
  `;
}

function evaluarOpcionExamen(indice, idxOpcion) {
  const estado = window.datosExamen[indice];
  if (!estado || estado.bloqueado) return;

  const paso = estado.pasos[estado.pasoActual];
  if (!paso || !paso.opciones || !paso.opciones[idxOpcion]) return;

  const opcion = paso.opciones[idxOpcion];
  const btn = document.getElementById(`opt-exam-${indice}-${idxOpcion}`);
  const fb = document.getElementById(`feedback-examen-${indice}`);

  if (opcion.esCorrecta) {
    estado.bloqueado = true;
    
    paso.opciones.forEach((_, i) => {
      const b = document.getElementById(`opt-exam-${indice}-${i}`);
      if (b) b.disabled = true;
    });

    if (btn) {
      btn.style.backgroundColor = "#dcfce7";
      btn.style.borderColor = "#22c55e";
    }
    
    if (fb) {
      fb.className = 'p-4 mb-4 text-sm font-bold rounded-xl transition-all bg-green-100 text-green-800 border border-green-300 block';
      fb.innerHTML = "✔ ¡Paso Correcto! Avanzando...";
    }

    setTimeout(() => {
      estado.pasoActual++;
      estado.bloqueado = false;

      if (estado.pasoActual >= estado.pasos.length) {
        finalizarEjercicioExamen(indice);
      } else {
        actualizarVistaExamen(indice);
      }
    }, 1000);
  } else {
    if (btn) {
      btn.style.backgroundColor = "#fee2e2";
      btn.style.borderColor = "#ef4444";
      btn.disabled = true;
    }

    estado.intentosFallidos++;
    const errorTexto = opcion.errorMsg || "Error conceptual en este paso.";
    
    if (fb) {
      fb.className = 'p-4 mb-4 text-sm font-bold rounded-xl transition-all bg-rose-100 text-rose-700 border border-rose-200 block';
      fb.innerHTML = "⚠️ " + errorTexto;
    }

    const errorFormateado = `Pregunta ${indice + 1} (Paso ${estado.pasoActual + 1}): ${errorTexto}`;
    estado.erroresCometidos.push(errorFormateado);

    if (!window.erroresPedagogicos.includes(errorFormateado)) {
      window.erroresPedagogicos.push(errorFormateado);
    }
  }
}

function sincronizarResultadoExamen(indice, resumenString) {
  window.respuestas = window.respuestas || {};
  window.respuestas[indice] = resumenString;

  const inputH = document.getElementById(`input-examen-resultado-${indice}`);
  if (inputH) inputH.value = resumenString;

  const inputSel = document.getElementById(`pre_examen_${indice}_seleccion`);
  if (inputSel) inputSel.value = resumenString;

  const contenedor = document.getElementById(`contenedor-examen-${indice}`);
  if (contenedor) {
    const inputVisible = contenedor.querySelector('input[type="text"]') || 
                         document.getElementById(`input_res_${indice}`) ||
                         document.getElementById(`respuesta_${indice}`);
    if (inputVisible) {
      inputVisible.value = resumenString;
    }
  }
}

function finalizarEjercicioExamen(indice) {
  const estado = window.datosExamen[indice];
  if (!estado) return;

  const resumenString = `Pregunta ${indice + 1}: Completada | Fallos en este ejercicio: ${estado.intentosFallidos} (${estado.erroresCometidos.join(" ; ") || "Sin errores"})`;

  sincronizarResultadoExamen(indice, resumenString);

  let listaErroresHTML = '';
  if (estado.erroresCometidos.length > 0) {
    listaErroresHTML = `
      <div class="mt-3 text-left text-xs bg-white p-3 rounded-xl border border-rose-200 shadow-inner">
        <strong class="text-rose-700 block mb-1 font-bold">Diagnóstico de Errores en esta pregunta:</strong>
        <ul class="list-disc list-inside text-rose-600 space-y-1">
          ${estado.erroresCometidos.map(e => `<li>${e}</li>`).join('')}
        </ul>
      </div>`;
  } else {
    listaErroresHTML = `
      <div class="mt-3 text-xs bg-white p-2 rounded-xl border border-green-200 text-green-700 font-bold">
        ✨ Ejercicio resuelto sin ningún error.
      </div>`;
  }

  const enc = document.getElementById(`encabezado-paso-${indice}`);
  const fb = document.getElementById(`feedback-examen-${indice}`);
  if (enc) enc.style.display = 'none';
  if (fb) fb.style.display = 'none';

  const opcionesContenedor = document.getElementById(`opciones-paso-${indice}`);
  if (opcionesContenedor) {
    opcionesContenedor.innerHTML = `
      <div class="p-6 bg-slate-50 border-2 border-slate-200 rounded-2xl text-center shadow-sm w-full">
        <div class="text-xl font-bold mb-2 text-blue-700">
          ✔ Pregunta Completada
        </div>
        <p class="text-xs text-slate-600">Completaste las ${estado.totalPasosPregunta} opciones de este ejercicio.</p>
        ${listaErroresHTML}
      </div>`;
  }
}

window.insertarResultadoExamen = function(indice) {
  const estado = window.datosExamen[indice];
  const resumen = estado 
    ? `Pregunta ${indice + 1}: Completada | Fallos: ${estado.intentosFallidos}`
    : "Completado";
  sincronizarResultadoExamen(indice, resumen);
};

function actualizarVistaExamen(indice) {
  const estado = window.datosExamen[indice];
  if (!estado) return;

  const paso = estado.pasos[estado.pasoActual];
  if (!paso) return;

  const fb = document.getElementById(`feedback-examen-${indice}`);
  if (fb) fb.className = 'hidden';

  const enc = document.getElementById(`encabezado-paso-${indice}`);
  if (enc) {
    enc.innerHTML = `
      <span class="text-xs font-bold text-blue-600 uppercase tracking-wider">Paso ${estado.pasoActual + 1} de ${estado.pasos.length}</span>
      <h3 class="text-base font-bold text-slate-800 mt-1">${paso.titulo || ''}</h3>
    `;
  }

  let html = '';
  if (Array.isArray(paso.opciones)) {
    paso.opciones.forEach((opc, idx) => {
      const contenidoVisible = formatearTextoOpcionExamen(opc.texto);
      html += `
        <button onclick="evaluarOpcionExamen(${indice}, ${idx})" id="opt-exam-${indice}-${idx}" 
                class="examen-opcion-btn border-slate-300 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all font-medium text-slate-800 shadow-sm cursor-pointer">
          <div>${contenidoVisible}</div>
        </button>`;
    });
  }

  const opcionesContenedor = document.getElementById(`opciones-paso-${indice}`);
  if (opcionesContenedor) {
    opcionesContenedor.innerHTML = html;
  }

  if (window.MathJax && MathJax.typesetPromise) {
    const el = document.getElementById(`contenedor-examen-${indice}`);
    if (el) MathJax.typesetPromise([el]).catch(err => console.warn(err));
  }
}
</script>
