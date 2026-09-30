// evaluacion.js - Lógica de preguntas OM (sin sistema de vidas)

window.aciertos = 0;
window.preguntaIndiceActual = 0;

window.reiniciarEvaluacion = function() {
  window.aciertos = 0;
  window.preguntaIndiceActual = 0;
  
  // Ocultar contador de vidas si existe en el HTML
  const contVidas = document.querySelector(".badge, #vidas-count, [class*='Vidas']");
  if (contVidas) contVidas.style.display = "none";

  if (window.preguntasActuales && window.preguntasActuales.length > 0) {
    window.renderizarPregunta(0);
  }
};

window.renderizarPregunta = function(indice) {
  if (!window.preguntasActuales || !window.preguntasActuales[indice]) return;
  
  const pregunta = window.preguntasActuales[indice];
  
  // Actualizar consigna
  const tituloTP = document.getElementById("tp-titulo") || document.querySelector("h3, .card-title");
  if (tituloTP) {
    tituloTP.textContent = pregunta.consigna;
  }
  
  // Buscar o crear el contenedor de las opciones
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
      alert(`¡Has completado el TP! Aciertos: ${window.aciertos} de ${window.preguntasActuales.length}`);
    }
  } else {
    alert("Respuesta incorrecta. Volvé a intentarlo.");
  }
};
