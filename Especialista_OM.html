<!-- Especialista_OM.html -->
<script>
  /**
   * Renderiza el especialista de Opción Múltiple (OM) mediante tarjetas interactivas.
   * @param {Object} pregunta - Objeto de la pregunta con enunciado y opciones.
   * @param {number} indice - Índice global del ejercicio.
   * @returns {string} HTML generado.
   */
  function renderizarEspecialista_OM(pregunta, indice) {
    const idPregunta = pregunta.id || `om_preg_${indice}`;
    const opciones = pregunta.opciones || [];
    
    let htmlOpciones = opciones.map((opcion, idx) => {
      const idOpcion = `${idPregunta}_opt_${idx}`;
      return `
        <div class="card-opcion transition-all duration-200 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 rounded-lg p-3 my-2 cursor-pointer flex items-center gap-3 bg-white dark:bg-slate-800"
             onclick="seleccionarOpcionOM('${idPregunta}', '${idOpcion}', ${idx})">
          <input type="radio" id="${idOpcion}" name="${idPregunta}_radio" value="${opcion}" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500">
          <label for="${idOpcion}" class="text-sm font-medium text-slate-700 dark:text-slate-200 cursor-pointer w-full">
            ${opcion}
          </label>
        </div>
      `;
    }).join('');

    return `
      <div id="${idPregunta}_container" class="especialista-om bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 my-4">
        <h3 class="text-base font-semibold text-slate-800 dark:text-slate-100 mb-3">
          ${pregunta.enunciado}
        </h3>
        <div class="opciones-group">
          ${htmlOpciones}
        </div>
        <input type="hidden" id="${idPregunta}_respuesta" name="${idPregunta}_val" value="">
      </div>
    `;
  }

  /**
   * Registra la selección de la opción en el input oculto.
   */
  function seleccionarOpcionOM(idPregunta, idOpcion, idx) {
    const radio = document.getElementById(idOpcion);
    if (radio) {
      radio.checked = true;
      const inputOculto = document.getElementById(`${idPregunta}_respuesta`);
      if (inputOculto) {
        inputOculto.value = radio.value;
      }
    }
  }
</script>
