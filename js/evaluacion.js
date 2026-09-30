let MODULO_ACTUAL = null;
let tpClaveActual = "";
let preguntaIdx = 0;
let aciertos = 0;
let vidas = CONFIG.VIDAS_INICIALES;
let tiempoInicio = new Date();
let notaFinalCalculada = 0;

function cargarModuloDirecto() {
  const modalidad = document.getElementById('filtro-modalidad').value;
  const ano = document.getElementById('filtro-ano').value;

  if (modalidad === 'tecnica' && ano === '1' && typeof window.TP_DATOS_TECNICA_1 !== 'undefined') {
    MODULO_ACTUAL = window.TP_DATOS_TECNICA_1;
  } else {
    MODULO_ACTUAL = null;
  }

  const selector = document.getElementById('selector-tp-demo');
  selector.innerHTML = '';

  if (!MODULO_ACTUAL || !MODULO_ACTUAL.tps || Object.keys(MODULO_ACTUAL.tps).length === 0) {
    document.getElementById('tp-titulo').innerText = "Cargando o Sin contenido";
    document.getElementById('tp-subtitulo').innerText = `Descargando TPs de Google Sheets...`;
    selector.innerHTML = '<option value="">Cargando datos...</option>';
    document.getElementById('contenedor-ejercicio').innerHTML = `
      <div class="alert alert-warning text-center">
        <div class="spinner-border text-warning mb-2" role="status"></div>
        <p class="mb-0">Cargando tus TPs reales desde Google Sheets...</p>
      </div>
    `;
    return;
  }

  const tpsClaves = Object.keys(MODULO_ACTUAL.tps);
  tpsClaves.forEach(clave => {
    const opt = document.createElement('option');
    opt.value = clave;
    opt.innerText = MODULO_ACTUAL.tps[clave].titulo;
    selector.appendChild(opt);
  });

  cambiarTpSeleccionado(tpsClaves[0]);
}

function cambiarTpSeleccionado(clave) {
  if(!clave || !MODULO_ACTUAL || !MODULO_ACTUAL.tps[clave]) return;
  tpClaveActual = clave;
  reiniciarEvaluacion();
}

function reiniciarEvaluacion() {
  preguntaIdx = 0;
  aciertos = 0;
  vidas = CONFIG.VIDAS_INICIALES;
  tiempoInicio = new Date();

  document.getElementById('vidas-display').innerHTML = `<i class="bi bi-heart-fill me-1"></i> Vidas: ${vidas}/${CONFIG.VIDAS_INICIALES}`;
  document.getElementById('banner-estado').className = "tp-header-banner";
  
  const tp = MODULO_ACTUAL.tps[tpClaveActual];
  document.getElementById('tp-titulo').innerText = tp.titulo;
  document.getElementById('tp-subtitulo').innerText = tp.subtitulo;

  renderizarPregunta();
}

function renderizarPregunta() {
  const tp = MODULO_ACTUAL.tps[tpClaveActual];
  const data = tp.preguntas[preguntaIdx];

  document.getElementById('num-pregunta').innerText = `${preguntaIdx + 1} DE ${tp.preguntas.length}`;

  let opcionesHTML = '';
  data.opciones.forEach((opc, idx) => {
    opcionesHTML += `
      <div class="form-check mb-2 p-3 border rounded-3 bg-light">
        <input class="form-check-input" type="radio" name="respOption" id="opc_${idx}" value="${idx}">
        <label class="form-check-label ms-2 fw-semibold" for="opc_${idx}">${opc}</label>
      </div>`;
  });

  const bloomBadge = data.bloom ? `<span class="badge bg-primary badge-bloom mb-2">${data.bloom}</span>` : '';

  document.getElementById('contenedor-ejercicio').innerHTML = `
    <div class="mb-3">
      ${bloomBadge}
      <p class="fs-5 fw-semibold mb-0">${data.consigna}</p>
    </div>
    <div class="my-4">${opcionesHTML}</div>
    <button class="btn btn-primary w-100 py-3 fw-bold fs-5" onclick="procesarRespuesta()">
      ${preguntaIdx === tp.preguntas.length - 1 ? 'FINALIZAR Y EVALUAR' : 'SIGUIENTE PREGUNTA'}
    </button>
  `;

  if (window.MathJax && window.MathJax.typesetPromise) {
    MathJax.typesetPromise();
  }
}

function procesarRespuesta() {
  const seleccion = document.querySelector('input[name="respOption"]:checked');
  if (!seleccion) {
    alert("Seleccioná una respuesta antes de continuar.");
    return;
  }

  const tp = MODULO_ACTUAL.tps[tpClaveActual];
  const val = parseInt(seleccion.value);

  if (val === tp.preguntas[preguntaIdx].correcta) {
    aciertos++;
  } else {
    vidas--;
    document.getElementById('vidas-display').innerHTML = `<i class="bi bi-heart-fill me-1"></i> Vidas: ${vidas}/${CONFIG.VIDAS_INICIALES}`;
  }

  if (preguntaIdx + 1 < tp.preguntas.length && vidas > 0) {
    preguntaIdx++;
    renderizarPregunta();
  } else {
    mostrarReporteFinal();
  }
}

function mostrarReporteFinal() {
  const tp = MODULO_ACTUAL.tps[tpClaveActual];
  const tiempoSegs = Math.round((new Date() - tiempoInicio) / 1000);
  notaFinalCalculada = ((aciertos / tp.preguntas.length) * 10).toFixed(1);
  const aprobado = notaFinalCalculada >= CONFIG.NOTA_APROBACION && vidas > 0;

  const banner = document.getElementById('banner-estado');
  banner.className = "tp-header-banner " + (aprobado ? "bg-success" : "bg-danger");
  banner.innerText = "EVALUACIÓN CONCLUIDA";

  document.getElementById('contenedor-ejercicio').innerHTML = `
    <div class="text-center py-3">
      <i class="bi ${aprobado ? 'bi-trophy-fill text-warning' : 'bi-x-circle-fill text-danger'}" style="font-size: 3.5rem;"></i>
      <h3 class="fw-bold mt-2">Nota Obtenida: <span class="${aprobado ? 'text-success' : 'text-danger'}">${notaFinalCalculada} / 10</span></h3>
      
      <div class="card p-3 bg-light border-0 text-start my-4">
        <h6 class="fw-bold text-primary mb-2"><i class="bi bi-file-earmark-spreadsheet-fill me-2"></i>Informe de la Evaluación:</h6>
        <div class="row g-2 small">
          <div class="col-6"><strong>TP Evaluado:</strong> ${tp.titulo}</div>
          <div class="col-6"><strong>Aciertos:</strong> ${aciertos} / ${tp.preguntas.length}</div>
          <div class="col-6"><strong>Tiempo:</strong> ${tiempoSegs} segundos</div>
          <div class="col-6"><strong>Estado:</strong> ${aprobado ? '<span class="badge bg-success">Aprobado</span>' : '<span class="badge bg-danger">Desaprobado</span>'}</div>
        </div>
      </div>

      <div class="d-flex justify-content-center gap-2">
        <button class="btn btn-success fw-bold py-2 px-4" data-bs-toggle="modal" data-bs-target="#modalAlumno">
          <i class="bi bi-send-check me-1"></i> Registrar Nota en la Base de Datos
        </button>
        <button class="btn btn-outline-secondary fw-bold py-2 px-3" onclick="reiniciarEvaluacion()">
          <i class="bi bi-arrow-counterclockwise"></i> Reiniciar
        </button>
      </div>
    </div>
  `;
}
