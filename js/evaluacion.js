// evaluacion.js - Diseño idéntico al Aula Virtual original

window.aciertos = 0;
window.preguntaIndiceActual = 0;

window.reiniciarEvaluacion = function() {
  window.aciertos = 0;
  window.preguntaIndiceActual = 0;
  if (window.preguntasActuales && window.preguntasActuales.length > 0) {
    window.renderizarPregunta(0);
  }
};

window.renderizarPregunta = function(indice) {
  if (!window.preguntasActuales || !window.preguntasActuales[indice]) return;

  const pregunta = window.preguntasActuales[indice];
  const tpData = window.TP_DATOS_TECNICA_1.tps[window.tpClaveActual] || {};

  // Buscar o preparar la tarjeta contenedora principal
  let tarjeta = document.querySelector(".card-body") || document.querySelector(".card");
  if (!tarjeta) return;

  // Renderizar la maqueta idéntica
  tarjeta.innerHTML = `
    <div style="max-width: 650px; margin: 0 auto; background: #ffffff; padding: 25px; border-radius: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); font-family: system-ui, -apple-system, sans-serif;">
      
      <!-- Título principal -->
      <h3 style="color: #0d6efd; font-weight: 700; text-align: center; margin-bottom: 2px; font-size: 1.5rem;">
        ${tpData.titulo || "TP Nº 001 - U1"}
      </h3>
      <p style="text-align: center; color: #6c757d; font-size: 0.88rem; font-weight: 600; margin-bottom: 12px;">
        ${tpData.subtitulo || "Escuela: ET24DE17 - Curso: 1º 1"}
      </p>
      
      <div style="height: 3px; background-color: #0d6efd; width: 100%; margin-bottom: 20px;"></div>

      <!-- Banner -->
      <div style="width: 100%; border-radius: 12px; overflow: hidden; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <img src="https://llenositio.github.io/mathsystem-mdp/img/banner.png" 
             onerror="this.src='https://dummyimage.com/600x120/1e3a8a/ffffff&text=AULA+VIRTUAL+llenositio'" 
             alt="Aula Virtual" style="width: 100%; height: auto; display: block;">
      </div>

      <!-- Contador de Pregunta -->
      <p style="color: #475569; font-weight: 700; font-size: 0.95rem; margin-bottom: 10px;">
        Pregunta ${indice + 1} de ${window.preguntasActuales.length}
      </p>

      <!-- Recuadro Gris con la Consigna y Selección -->
      <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <p style="color: #334155; font-size: 0.95rem; line-height: 1.5; text-align: center; margin-bottom: 20px;">
          ${pregunta.consigna}
        </p>

        <!-- Selector Desplegable -->
        <select id="select-opcion-respuesta" style="width: 100%; padding: 10px 14px; font-size: 0.95rem; color: #0d6efd; border: 2px solid #0d6efd; border-radius: 8px; background-color: #ffffff; cursor: pointer; outline: none;">
          <option value="">-- Selecciona una opción --</option>
          ${pregunta.opciones.map((op, idx) => `<option value="${idx}">${op}</option>`).join('')}
        </select>
      </div>

      <!-- Botón de Envío -->
      <button id="btn-responder" style="width: 100%; background-color: #94a3b8; color: #ffffff; border: none; padding: 12px; border-radius: 8px; font-weight: 600; font-size: 1rem; cursor: pointer;">
        Responder
      </button>

    </div>
  `;

  // Asignar eventos de interacción al desplegable y botón
  const selectRespuesta = document.getElementById("select-opcion-respuesta");
  const btnResponder = document.getElementById("btn-responder");

  selectRespuesta.onchange = function() {
    if (this.value !== "") {
      btnResponder.style.backgroundColor = "#0d6efd";
    } else {
      btnResponder.style.backgroundColor = "#94a3b8";
    }
  };

  btnResponder.onclick = function() {
    const seleccion = selectRespuesta.value;
    if (seleccion === "") {
      alert("Por favor selecciona una opción antes de responder.");
      return;
    }
    window.verificarRespuesta(parseInt(seleccion), pregunta.correcta);
  };
};

window.verificarRespuesta = function(seleccionada, correcta) {
  if (seleccionada === correcta) {
    alert("¡Correcto!");
    window.aciertos++;
    window.preguntaIndiceActual++;

    if (window.preguntaIndiceActual < window.preguntasActuales.length) {
      window.renderizarPregunta(window.preguntaIndiceActual);
    } else {
      alert(`¡Has completado el TP!\nAciertos: ${window.aciertos} de ${window.preguntasActuales.length}`);
    }
  } else {
    alert("Respuesta incorrecta. Inténtalo de nuevo.");
  }
};
