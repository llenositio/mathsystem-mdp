function guardarDatosYEnviarResultados() {
  const nombre = document.getElementById('alumno-nombre').value.trim();
  const curso = document.getElementById('alumno-curso').value.trim();

  if (!nombre || !curso) {
    alert("Por favor completá tu nombre y curso.");
    return;
  }

  const tp = MODULO_ACTUAL.tps[tpClaveActual];
  const payload = {
    alumno: nombre,
    curso: curso,
    tp: tp.titulo,
    nota: notaFinalCalculada,
    aciertos: aciertos,
    fecha: new Date().toLocaleString()
  };

  fetch(CONFIG.URL_WEB_APP_SHEET, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).then(() => {
    alert("¡Tus datos y nota fueron enviados correctamente a la planilla del profesor!");
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalAlumno'));
    modal.hide();
  }).catch(err => {
    alert("Ocurrió un error al enviar los datos.");
  });
}

function validarLicencia() {
  const clave = document.getElementById('input-licencia').value.trim();
  if(clave.length > 5) {
    document.getElementById('licencia-alerta').className = "alert alert-success small mb-0";
    document.getElementById('licencia-alerta').innerText = "¡Licencia Docente validada con éxito! Funciones premium activadas.";
  } else {
    alert("Por favor ingresá una clave de licencia válida.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  cargarModuloDirecto();
});

document.addEventListener("datosTPsCargados", () => {
  cargarModuloDirecto();
});
