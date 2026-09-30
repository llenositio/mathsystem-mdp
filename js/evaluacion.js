// evaluacion.js - Lógica de preguntas, vidas y reinicio

window.vidas = 3;
window.notaFinalCalculada = 10;
window.aciertos = 0;

window.reiniciarEvaluacion = function() {
  window.vidas = 3;
  window.aciertos = 0;
  window.preguntaIndiceActual = 0;
  
  const contVidas = document.querySelector(".badge, #vidas-count, [class*='Vidas']");
  if (contVidas) contVidas.textContent = "Vidas: 3/3";
  
  const tituloTP = document.getElementById("tp-titulo");
  if (tituloTP && window.tpClaveActual && window.TP_DATOS_TECNICA_1.tps[window.tpClaveActual]) {
    tituloTP.textContent = window.TP_DATOS_TECNICA_1.tps[window.tpClaveActual].titulo;
  }
};

window.renderizarPregunta = function(indice) {
  if (!window.preguntasActuales || !window.preguntasActuales[indice]) return;
  
  const pregunta = window.preguntasActuales[indice];
  
  // Ocultar mensaje de carga y mostrar contenedor de pregunta
  const tituloTP = document.getElementById("tp-titulo") || document.querySelector("h3, .card-title");
  if (tituloTP) {
    tituloTP.textContent = pregunta.consigna;
  }
  
  // Buscar o crear contenedor de opciones
  let contenedorOpciones = document.getElementById("opciones-container");
  if (!contenedorOpciones) {
    const cardBody = document.querySelector(".card-body") || document.querySelector("main") || document.body;
    contenedorOpciones = document.createElement("div");
    contenedorOpciones.id = "opciones-container";
    contenedorOpciones.className = "mt-3 d-grid gap-2";
    cardBody.appendChild(contenedorOpciones);
  }
  
  contenedorOpciones.innerHTML = "";
  
  pregunta.opciones.forEach((opcionText, idx) => {
    const btn = document.createElement("button");
    btn.className = "btn btn-outline-primary text-start p-3";
    btn.textContent = `${String.fromCharCode(65 + idx)}) ${opcionText}`;
    btn.onclick = function() {
      window.verificarRespuesta(idx, pregunta.correcta);
    };
    contenedorOpciones.appendChild(btn);
  });
};

window.verificarRespuesta = function(seleccionada, correcta) {
  if (seleccionada === correcta) {
    alert("¡Correcto!");
    window.aciertos++;
    window.preguntaIndiceActual++;
    if (window.preguntaIndiceActual < window.preguntasActuales.length) {
      window.renderizarPregunta(window.preguntaIndiceActual);
    } else {
      alert("¡Has completado el TP exitosamente!");
    }
  } else {
    window.vidas--;
    const contVidas = document.querySelector(".badge, #vidas-count, [class*='Vidas']");
    if (contVidas) contVidas.textContent = `Vidas: ${window.vidas}/3`;
    
    if (window.vidas <= 0) {
      alert("Te quedaste sin vidas. Inténtalo de nuevo.");
      window.reiniciarEvaluacion();
      if (window.preguntasActuales) window.renderizarPregunta(0);
    } else {
      alert("Respuesta incorrecta. ¡Intenta con otra opción!");
    }
  }
};
