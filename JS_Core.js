// --- JS_Core: Lógica Central de Orquestación y Envío (Desacoplado - API Rest) ---

// URL de tu API en Google Apps Script
const API_URL = "https://script.google.com/macros/s/AKfycbw8lIPEu2WbomHfjKngFSvpqBCSIZDd6OKbPv1tQ8e7lXqbKHULMFgHLKdhnqz4zfUo/exec";

// Captura el parámetro 'id' directamente desde la URL del navegador en GitHub Pages
function obtenerIdDesdeUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  let id = urlParams.get('id') || "";
  try {
    if (id && typeof id === 'string') {
      while (id.includes('%')) { 
        id = decodeURIComponent(id); 
      }
    }
  } catch (e) { 
    console.error("Error decodificando ID:", e); 
  }
  return (id || "").trim();
}

const ID_LINK = obtenerIdDesdeUrl();
const PARTES = ID_LINK.split("/");

// Estado Global de la Aplicación
let PREGUNTAS_DB = [];
let indiceActual = 0;
let respuestasFinales = {};
let puntosFinales = {};

window.archivoEnBase64 = null; 

/**
 * Carga inicial de metadatos y nómina de alumnos vía API REST
 */
window.onload = () => {
  const elTitulo = document.getElementById('tituloTP');
  const elInfo = document.getElementById('infoExtra');
  const btnInicio = document.getElementById("btnComenzar");
  const selector = document.getElementById('selAlu');

  if (elTitulo) elTitulo.innerText = "TP Nº " + (PARTES[0] || "?") + " - " + (PARTES[1] || "Examen");
  if (elInfo) elInfo.innerText = "Escuela: " + (PARTES[2] || "?") + " - Curso: " + (PARTES[3] || "?") + "º " + (PARTES[4] || "?");

  if (btnInicio) {
    btnInicio.disabled = true;
    btnInicio.innerText = "CARGANDO DATOS...";
  }

  // Petición a la API desacoplada con redirección habilitada
  fetch(`${API_URL}?id=${encodeURIComponent(ID_LINK)}`, {
    method: "GET",
    redirect: "follow"
  })
    .then(response => response.json())
    .then(res => {
      if (!res) {
        if (btnInicio) btnInicio.innerText = "ERROR AL CARGAR";
        alert("No se recibieron datos del servidor.");
        return;
      }

      if (selector) {
        selector.innerHTML = "";
        selector.add(new Option("-- Elegí tu nombre --", ""));

        if (Array.isArray(res.alu) && res.alu.length > 0) {
          res.alu.forEach(nombre => selector.add(new Option(nombre, nombre)));
          if (btnInicio) {
            btnInicio.disabled = false;
            btnInicio.innerText = "COMENZAR EXAMEN";
          }
        } else {
          selector.add(new Option("No se encontraron alumnos", ""));
          if (btnInicio) btnInicio.innerText = "SIN ALUMNOS REGISTRADOS";
        }
      }
    })
    .catch(err => {
      console.error("Error en servidor:", err);
      if (btnInicio) btnInicio.innerText = "ERROR DE CONEXIÓN";
      alert("Error de conexión: " + (err.message || err));
    });
};

/**
 * Agrupa las filas por EJE, determina la cantidad de ejercicios según las filas
 * de cada EJE, sortea 1 EJE al azar por cada ejercicio y mezcla la secuencia final.
 */
function generarExamenUnico(bancoCompleto) {
  if (!bancoCompleto || !Array.isArray(bancoCompleto) || bancoCompleto.length === 0) {
    return bancoCompleto || [];
  }

  try {
    const gruposEje = {};

    bancoCompleto.forEach(preg => {
      if (!preg) return;

      const claveEje = String(
        preg.eje || 
        preg.EJE || 
        preg.nDeTp || 
        preg['N° de TP'] || 
        preg['N° DE TP'] || 
        preg.tp || 
        'EJE1'
      ).trim();

      if (!gruposEje[claveEje]) {
        gruposEje[claveEje] = [];
      }
      gruposEje[claveEje].push(preg);
    });

    const nombresEjes = Object.keys(gruposEje);
    if (nombresEjes.length === 0) return bancoCompleto;

    let totalEjercicios = 0;
    nombresEjes.forEach(eje => {
      if (gruposEje[eje].length > totalEjercicios) {
        totalEjercicios = gruposEje[eje].length;
      }
    });

    const examenSeleccionado = [];

    for (let i = 0; i < totalEjercicios; i++) {
      const opcionesParaEsteEjercicio = [];

      nombresEjes.forEach(eje => {
        if (gruposEje[eje] && gruposEje[eje][i]) {
          opcionesParaEsteEjercicio.push(gruposEje[eje][i]);
        }
      });

      if (opcionesParaEsteEjercicio.length > 0) {
        const indiceAzar = Math.floor(Math.random() * opcionesParaEsteEjercicio.length);
        examenSeleccionado.push(opcionesParaEsteEjercicio[indiceAzar]);
      }
    }

    for (let i = examenSeleccionado.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [examenSeleccionado[i], examenSeleccionado[j]] = [examenSeleccionado[j], examenSeleccionado[i]];
    }

    return examenSeleccionado.length > 0 ? examenSeleccionado : bancoCompleto;
  } catch (err) {
    console.error("Error al generar examen único:", err);
    return bancoCompleto;
  }
}

/**
 * Inicializa la sesión del alumno y recupera el cuestionario vía API REST
 */
function empezar() {
  const sel = document.getElementById('selAlu');
  if (!sel || !sel.value) return alert("Por favor, seleccioná tu nombre.");
  
  const nombreAlumno = sel.value;
  window.nombreAlumnoSeleccionado = nombreAlumno;

  const elAlumnoHeader = document.getElementById('alumnoHeader');
  if (elAlumnoHeader) {
    elAlumnoHeader.innerText = "Alumno/a: " + nombreAlumno;
    elAlumnoHeader.style.display = 'block';
  }

  const btn = document.getElementById('btnComenzar');
  if (btn) {
    btn.disabled = true;
    btn.innerText = "OBTENIENDO EXAMEN...";
  }

  // Petición a la API para traer preguntas del examen
  fetch(`${API_URL}?id=${encodeURIComponent(ID_LINK)}&alumno=${encodeURIComponent(nombreAlumno)}`, {
    method: "GET",
    redirect: "follow"
  })
    .then(response => response.json())
    .then(datos => {
      try {
        if (datos && datos.pre && datos.pre.length > 0) {
          const examenPersonalizado = generarExamenUnico(datos.pre);

          PREGUNTAS_DB = examenPersonalizado;
          window.preguntas = examenPersonalizado;
          
          indiceActual = 0;

          const paso1 = document.getElementById('paso1');
          const paso2 = document.getElementById('paso2');
          
          if (paso1) paso1.style.display = 'none';
          if (paso2) paso2.style.display = 'block';
          
          actualizarInterfazExamen();
        } else {
          if (btn) {
            btn.disabled = false;
            btn.innerText = "COMENZAR EXAMEN";
          }
          alert("No se pudieron obtener las preguntas para este examen.");
        }
      } catch (err) {
        console.error("Error al procesar preguntas del examen:", err);
        if (btn) {
          btn.disabled = false;
          btn.innerText = "COMENZAR EXAMEN";
        }
        alert("Error al armar el examen: " + err.message);
      }
    })
    .catch(err => {
      if (btn) {
        btn.disabled = false;
        btn.innerText = "COMENZAR EXAMEN";
      }
      alert("Error al cargar el examen: " + (err.message || err));
    });
}

/**
 * Orquesta el renderizado mediante JS_Render y actualiza controles de la interfaz
 */
function actualizarInterfazExamen() {
  const contenedor = document.getElementById('render');
  const elProgreso = document.getElementById('progreso');
  const btnSig = document.getElementById('btnSig');
  const btnAyuda = document.getElementById('btnAyuda');

  if (!contenedor) return;

  if (!PREGUNTAS_DB || PREGUNTAS_DB.length === 0 || !PREGUNTAS_DB[indiceActual]) {
    contenedor.innerHTML = '<div class="p-4 bg-rose-100 text-rose-700 rounded-lg">No hay preguntas disponibles.</div>';
    return;
  }

  const pregActual = PREGUNTAS_DB[indiceActual];

  if (typeof renderizarContenido === 'function') {
    renderizarContenido();
  } else {
    contenedor.innerHTML = '<div class="p-4 bg-rose-100 text-rose-700 rounded-lg">Error: Sistema de renderizado no disponible.</div>';
  }

  if (typeof inicializarEspecialistasPostRender === 'function') {
    inicializarEspecialistasPostRender(PREGUNTAS_DB);
  }

  if (elProgreso) {
    elProgreso.innerText = `Pregunta ${indiceActual + 1} de ${PREGUNTAS_DB.length}`;
  }

  if (btnSig) {
    btnSig.disabled = false;
    btnSig.innerText = (indiceActual === PREGUNTAS_DB.length - 1) ? "FINALIZAR EXAMEN" : "SIGUIENTE";
  }

  let permiteAyuda = false;
  if (pregActual && typeof pregActual === 'object') {
    for (let key in pregActual) {
      if (Object.prototype.hasOwnProperty.call(pregActual, key)) {
        let keyLimpia = key.trim().toLowerCase();
        if (
          keyLimpia === 'q' || 
          keyLimpia === 'ayuda' || 
          keyLimpia === 'colq' || 
          keyLimpia === 'columnaq' || 
          keyLimpia.includes('ayuda') || 
          keyLimpia.includes('tutor')
        ) {
          let valStr = String(pregActual[key]).trim().toLowerCase();
          if (valStr === "1" || valStr === "true" || valStr === "si" || valStr === "sí") {
            permiteAyuda = true;
            break;
          }
        }
      }
    }
  }

  if (btnAyuda) {
    btnAyuda.style.display = permiteAyuda ? 'inline-block' : 'none';
  }

  if (window.MathJax && typeof MathJax.typesetPromise === 'function') {
    MathJax.typesetPromise([contenedor]).catch(err => console.error("Error MathJax:", err));
  }
}

/**
 * Colecta unificada de respuestas para cualquier especialista
 */
function capturarRespuestaActual(pregActual) {
  if (!pregActual) return "";
  const idPregunta = pregActual.id;
  const contenedor = document.getElementById(`${idPregunta}_container`) || document.getElementById('render') || document;

  const inputs = contenedor.querySelectorAll(`[name*="${idPregunta}"]`);
  if (!inputs || inputs.length === 0) return "";

  let respuestasObj = {};
  let listaValores = [];

  inputs.forEach(input => {
    const name = input.name || "";
    if (input.type === 'radio' || input.type === 'checkbox') {
      if (input.checked) {
        listaValores.push(input.value);
      }
    } else if (input.value !== undefined && input.value !== "") {
      if (name.includes('_val_')) {
        const subClave = name.split('_val_')[1] || name;
        respuestasObj[subClave] = input.value.trim();
      } else {
        listaValores.push(input.value.trim());
      }
    }
  });

  if (Object.keys(respuestasObj).length > 0) {
    return respuestasObj;
  }

  return listaValores.length > 1 ? listaValores.join(',,,') : (listaValores[0] || "");
}

function esRespuestaValida(val) {
  if (val === null || val === undefined) return false;
  if (typeof val === 'string') return val.trim().length > 0;
  if (typeof val === 'number' || typeof val === 'boolean') return true;
  if (Array.isArray(val)) {
    return val.length > 0 && val.some(item => esRespuestaValida(item));
  }
  if (typeof val === 'object') {
    const keys = Object.keys(val);
    if (keys.length === 0) return false;
    return keys.some(k => esRespuestaValida(val[k]));
  }
  return false;
}

function verificarInteraccionDOM() {
  const render = document.getElementById('render');
  if (!render) return false;

  const marcados = render.querySelectorAll('input[type="radio"]:checked, input[type="checkbox"]:checked');
  if (marcados.length > 0) return true;

  const inputsTexto = render.querySelectorAll('input:not([type="radio"]):not([type="checkbox"]):not([type="hidden"]):not([type="button"]):not([type="submit"]), textarea, select');
  for (let inp of inputsTexto) {
    if (inp.value && inp.value.trim() !== '') return true;
  }

  const seleccionados = render.querySelectorAll(
    '.seleccionado, .selected, .active, .opcion-activa, .btn-seleccionado, [data-selected="true"], .correct, .incorrect, .marcado'
  );
  if (seleccionados.length > 0) return true;

  return false;
}

function obtenerEstadoEspecialista(pregActual) {
  if (!window.datosExamen) return null;
  return window.datosExamen[indiceActual] || (pregActual && window.datosExamen[pregActual.id]) || null;
}

function estaPreguntaCompletada(pregActual, ex) {
  if (ex) {
    if (ex.completado || ex.finalizado || ex.terminado) return true;
    if (ex.totalPasosPregunta && ex.pasoActual >= ex.totalPasosPregunta) return true;
    if (ex.pasos && Array.isArray(ex.pasos) && ex.pasoActual >= ex.pasos.length) return true;
  }

  const render = document.getElementById('render');
  if (render) {
    const textoDOM = render.innerText || "";
    if (textoDOM.includes("Pregunta Completada") || textoDOM.includes("Completaste las")) {
      return true;
    }
  }

  return false;
}

function gestionarNavegacion() {
  if (window.archivoEnBase64) {
    enviarConArchivo();
    return;
  }

  const pregActual = PREGUNTAS_DB[indiceActual];
  if (pregActual) {
    const respuestaCapturada = capturarRespuestaActual(pregActual);
    const tieneRespuestaValida = esRespuestaValida(respuestaCapturada);
    const tieneInteraccionDOM = verificarInteraccionDOM();
    const ex = obtenerEstadoEspecialista(pregActual);
    const yaCompletado = estaPreguntaCompletada(pregActual, ex);

    if (yaCompletado) {
      respuestasFinales[pregActual.id] = tieneRespuestaValida ? respuestaCapturada : "Completado";
      avanzarOSalir();
      return;
    }

    if (!tieneRespuestaValida && !tieneInteraccionDOM && (!ex || (!ex.respondido && (ex.intentosFallidos || 0) === 0))) {
      alert("⚠️ Tenés que responder o seleccionar una opción antes de continuar.");
      return;
    }

    if (ex && !ex.completado) {
      const fallos = ex.intentosFallidos || 1;
      alert(`❌ La opción elegida no es correcta (Intento ${fallos}). Debés seleccionar la respuesta correcta para poder avanzar al siguiente ejercicio.`);
      return;
    }

    respuestasFinales[pregActual.id] = tieneRespuestaValida ? respuestaCapturada : "Respondido";
  }

  avanzarOSalir();
}

function avanzarOSalir() {
  if (indiceActual < PREGUNTAS_DB.length - 1) {
    indiceActual++;
    window.archivoEnBase64 = null; 
    
    const chatMensajes = document.getElementById('chatMensajes');
    if (chatMensajes) {
      chatMensajes.innerHTML = '<div style="color: #999; text-align: center; padding: 20px;">Acá aparecerán los mensajes del chat...</div>';
    } 
    
    const modalChat = document.getElementById('modalChat');
    if (modalChat) {
      modalChat.style.display = 'none';
    } 
    
    actualizarInterfazExamen();
  } else {
    enviarFinal();
  }
}

/**
 * Envío final vía POST JSON hacia la API
 */
function enviarFinal() {
  const btn = document.getElementById('btnSig');
  if (btn) {
    btn.disabled = true;
    btn.innerText = "Enviando...";
  }
  const selVal = document.getElementById('selAlu') ? document.getElementById('selAlu').value : "";

  var totalPasosExamen = 0;
  var totalErroresCometidos = 0;
  var erroresPedagogicos = [];

  if (window.datosExamen) {
    Object.keys(window.datosExamen).forEach(function(idx) {
      var ex = window.datosExamen[idx];
      var pasos = Number(ex.totalPasosPregunta || (ex.pasos ? ex.pasos.length : 0) || 0);
      var fallos = Number(ex.intentosFallidos || 0);
      
      totalPasosExamen += pasos;
      totalErroresCometidos += fallos;

      if (ex.erroresCometidos && Array.isArray(ex.erroresCometidos)) {
        erroresPedagogicos = erroresPedagogicos.concat(ex.erroresCometidos);
      }
    });
  }

  if (totalPasosExamen === 0) {
    totalPasosExamen = PREGUNTAS_DB.length || 1;
  }

  var valorPorPaso = 10 / totalPasosExamen;
  var descuentoTotal = totalErroresCometidos * valorPorPaso;
  
  var notaCalculada = Math.round(10 - descuentoTotal);
  if (notaCalculada < 1) notaCalculada = 1;
  if (notaCalculada > 10) notaCalculada = 10;

  var estadoFinal = notaCalculada >= 6 ? "APROBADO" : "DESAPROBADO";
  var reporteFugasStr = typeof obtenerReporteFugas === 'function' ? obtenerReporteFugas() : "Sin salidas de pantalla";

  const payload = {
    action: "procesarRespuestasFinales",
    datosAlumno: {
      nombre: selVal,
      tp: PARTES[0] || "1",
      unidad: PARTES[1] || "Examen",
      escuela: PARTES[2] || "",
      curso: PARTES[3] || "",
      division: PARTES[4] || "",
      turno: PARTES[5] || "",
      especialidad: PARTES[6] || "",
      profesor: PARTES[7] || ""
    },
    nota: notaCalculada,
    estado: estadoFinal,
    errores: erroresPedagogicos.length > 0 ? erroresPedagogicos : ["Sin errores registrados"],
    respuestas: respuestasFinales,
    puntos: puntosFinales,
    fugasCount: window.contadorFugas || 0,
    fugasDetalle: window.detalleFugas || [],
    reporteFugas: reporteFugasStr
  };

  finalizarModal(notaCalculada, estadoFinal, totalPasosExamen, totalErroresCometidos);

  fetch(API_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
  .then(() => console.log("Entrega enviada al servidor."))
  .catch(err => console.error("Error al guardar entrega:", err));
}

/**
 * Envío condicional de archivos adjuntos vía API
 */
function enviarConArchivo() {
  const btn = document.getElementById('btnSig');
  if (btn) {
    btn.disabled = true;
    btn.innerText = "Subiendo archivo...";
  }
  const selVal = document.getElementById('selAlu') ? document.getElementById('selAlu').value : "";
  
  const payload = {
    action: "guardarArchivoDrive",
    archivo: window.archivoEnBase64,
    alumno: selVal,
    idLink: ID_LINK
  };

  fetch(API_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
  .then(() => {
    if (PREGUNTAS_DB[indiceActual]) {
      respuestasFinales[PREGUNTAS_DB[indiceActual].id] = "Archivo Subido";
      puntosFinales[PREGUNTAS_DB[indiceActual].id] = 0;
    }
    avanzarOSalir();
  })
  .catch(err => {
    console.error("Error al subir archivo:", err);
    avanzarOSalir();
  });
}

function finalizarModal(nota, estado, totalPasos, totalErrores) {
  var esAprobado = estado === "APROBADO";
  var colorEstado = esAprobado ? "#16a34a" : "#dc2626";

  if (typeof Swal !== 'undefined') {
    Swal.fire({
      title: esAprobado ? '🎉 ¡Examen Aprobado!' : '⚠️ Examen Desaprobado',
      html: `
        <div style="font-size: 1.1rem; margin-top: 10px;">
          <p style="margin-bottom: 6px; color: #475569;">Tu nota final es:</p>
          <div style="font-size: 2.8rem; font-weight: 800; color: ${colorEstado};">
            ${nota} / 10
          </div>
          <div style="font-size: 1.3rem; font-weight: 700; color: ${colorEstado}; margin-top: 4px; text-transform: uppercase;">
            ${estado}
          </div>
          <div style="font-size: 0.85rem; color: #64748b; margin-top: 15px; border-top: 1px solid #e2e8f0; padding-top: 10px;">
            Pasos evaluados: <b>${totalPasos}</b> | Errores cometidos: <b>${totalErrores}</b>
          </div>
        </div>
      `,
      icon: esAprobado ? 'success' : 'error',
      confirmButtonText: 'SALIR',
      confirmButtonColor: '#2563eb',
      allowOutsideClick: false
    }).then(function() {
      location.reload();
    });
    return;
  }

  const modalRes = document.getElementById('modalResultado');
  const modalMsg = document.getElementById('modalMensaje');
  const modalIco = document.getElementById('modalIcono');
  const modalTit = document.getElementById('modalTitulo');

  if (modalRes) modalRes.style.display = 'flex';
  if (modalIco) modalIco.innerText = esAprobado ? "🎉" : "⚠️";
  if (modalTit) {
    modalTit.innerText = esAprobado ? "¡Examen Aprobado!" : "Examen Desaprobado";
    modalTit.style.color = colorEstado;
  }
  if (modalMsg) {
    modalMsg.innerHTML = `
      <div style="font-size: 2.2rem; font-weight: bold; color: ${colorEstado}; margin-bottom: 5px;">
        ${nota} / 10
      </div>
      <div style="font-weight: bold; text-transform: uppercase; margin-bottom: 15px;">
        ${estado}
      </div>
      <small style="color: #666;">Pasos evaluados: ${totalPasos} | Errores: ${totalErrores}</small>
    `;
  }
}

/**
 * Consulta al Tutor IA vía API REST
 */
function enviarMensajeChat() {
  const inputMsg = document.getElementById('txtChatInput') || document.getElementById('inputMensajeChat') || document.querySelector('#modalChat textarea');
  const contenedorChat = document.getElementById('chatMensajes');

  if (!inputMsg || !inputMsg.value.trim()) return;

  const textoUsuario = inputMsg.value.trim();
  inputMsg.value = "";

  if (contenedorChat) {
    if (contenedorChat.innerHTML.includes("Acá aparecerán los mensajes")) {
      contenedorChat.innerHTML = "";
    }

    contenedorChat.innerHTML += `
      <div style="display: flex; justify-content: flex-end; margin-bottom: 8px;">
        <div style="background-color: #2563eb; color: white; padding: 8px 12px; border-radius: 12px; max-width: 80%; font-size: 0.9rem;">
          ${textoUsuario}
        </div>
      </div>
    `;
    contenedorChat.scrollTop = contenedorChat.scrollHeight;
  }

  const pregActual = PREGUNTAS_DB[indiceActual] || {};

  const payload = {
    action: "consultarProfe",
    mensaje: textoUsuario,
    pregunta: pregActual
  };

  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify(payload)
  })
  .then(res => res.json())
  .then(data => {
    const respuesta = data.respuesta || "Sin respuesta del Tutor.";
    if (contenedorChat) {
      contenedorChat.innerHTML += `
        <div style="display: flex; justify-content: flex-start; margin-bottom: 8px;">
          <div style="background-color: #f1f5f9; color: #1e293b; padding: 8px 12px; border-radius: 12px; max-width: 80%; font-size: 0.9rem;">
            ${respuesta}
          </div>
        </div>
      `;
      contenedorChat.scrollTop = contenedorChat.scrollHeight;
    }
  })
  .catch(err => {
    console.error("Error al consultar al Profe:", err);
    if (contenedorChat) {
      contenedorChat.innerHTML += `
        <div style="display: flex; justify-content: flex-start; margin-bottom: 8px;">
          <div style="background-color: #fee2e2; color: #991b1b; padding: 8px 12px; border-radius: 12px; max-width: 80%; font-size: 0.9rem;">
            Ocurrió un error al consultar la ayuda. Por favor intentá nuevamente.
          </div>
        </div>
      `;
      contenedorChat.scrollTop = contenedorChat.scrollHeight;
    }
  });
}
