// ui.js - Manejo de la interfaz, cambio de TPs y reinicio

// Evento que se dispara cuando los datos de Google Sheets / CSV terminan de cargar
document.addEventListener("datosTPsCargados", function() {
  window.cargarDesplegableTPs();
});

// Función para poblar el menú desplegable con los TPs disponibles
window.cargarDesplegableTPs = function() {
  const selectTP = document.getElementById("select-tp");
  if (!selectTP) return;

  selectTP.innerHTML = '<option value="">-- Seleccionar TP o Examen --</option>';

  const tps = window.TP_DATOS_TECNICA_1 ? window.TP_DATOS_TECNICA_1.tps : {};
  const claves = Object.keys(tps);

  if (claves.length === 0) {
    selectTP.innerHTML = '<option value="">No hay TPs disponibles</option>';
    return;
  }

  claves.forEach(clave => {
    const option = document.createElement("option");
    option.value = clave;
    option.textContent = tps[clave].titulo;
    selectTP.appendChild(option);
  });

  // Si no hay evento change asignado previamente, se asigna
  selectTP.onchange = function() {
    const tpClaveSeleccionada = this.value;
    if (tpClaveSeleccionada && tps[tpClaveSeleccionada]) {
      window.cargarTP(tpClaveSeleccionada);
    }
  };
};

// Función para cargar las preguntas del TP seleccionado
window.cargarTP = function(clave) {
  if (typeof window.reiniciarEvaluacion === "function") {
    window.reiniciarEvaluacion(); // Resetea vidas, puntaje y estado previo
  }

  const tpData = window.TP_DATOS_TECNICA_1.tps[clave];
  if (!tpData) return;

  window.tpClaveActual = clave;
  window.preguntasActuales = tpData.preguntas;
  window.preguntaIndiceActual = 0;

  // Actualizar títulos en la interfaz
  const elementoTitulo = document.getElementById("tp-titulo");
  if (elementoTitulo) elementoTitulo.textContent = tpData.titulo;

  // Mostrar la primera pregunta
  if (typeof window.renderizarPregunta === "function") {
    window.renderizarPregunta(0);
  }
};

// Asignación del botón Reiniciar
document.addEventListener("DOMContentLoaded", function() {
  const btnReiniciar = document.getElementById("btn-reiniciar");
  if (btnReiniciar) {
    btnReiniciar.addEventListener("click", function() {
      if (window.tpClaveActual) {
        window.cargarTP(window.tpClaveActual);
      } else {
        if (typeof window.reiniciarEvaluacion === "function") {
          window.reiniciarEvaluacion();
        }
      }
    });
  }
});
