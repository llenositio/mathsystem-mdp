
  /**
   * Renderiza el especialista de Fracciones Interactivas (FR1).
   * @param {Object} pregunta - Objeto { id, tipo, enunciado, pasos: { mcm } }
   * @param {number} indice - Índice global del ejercicio.
   * @returns {string} HTML generado.
   */
  function renderizarEspecialista_FR1(pregunta, indice) {
    const idPregunta = (pregunta.id !== undefined && pregunta.id !== null) ? pregunta.id : `pre_fr1_${indice}`;
    const pasos = pregunta.pasos || {};
    const tieneMcm = pasos.mcm !== undefined || pregunta.tieneMcm;

    let htmlMcm = '';
    if (tieneMcm) {
      htmlMcm = `
        <div class="flex items-center gap-2 my-2">
          <label for="${idPregunta}_mcm" class="text-xs font-semibold text-slate-600 dark:text-slate-300">m.c.m. de los denominadores:</label>
          <input type="text" 
                 id="${idPregunta}_mcm" 
                 oninput="actualizarRespuestaFR1('${idPregunta}')" 
                 autocomplete="off"
                 class="w-16 p-1 text-center border border-slate-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 transition-all">
        </div>
      `;
    }

    return `
      <div id="${idPregunta}_container" class="especialista-fr1 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 my-4">
        <h3 class="text-base font-semibold text-slate-800 dark:text-slate-100 mb-2 whitespace-pre-line">
          ${pregunta.enunciado}
        </h3>

        <p class="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">
          🧩 Resolvé el ejercicio paso a paso:
        </p>

        ${htmlMcm}

        <div class="flex items-center gap-2 my-3">
          <label for="${idPregunta}_resultado" class="text-xs font-semibold text-slate-600 dark:text-slate-300">Respuesta final (forma a/b):</label>
          <input type="text" 
                 id="${idPregunta}_resultado" 
                 placeholder="Ej: 3/4"
                 autocomplete="off"
                 oninput="actualizarRespuestaFR1('${idPregunta}')" 
                 class="w-24 p-1.5 text-center font-bold border border-indigo-300 dark:border-indigo-700 rounded text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 transition-all">
        </div>

        <input type="hidden" id="${idPregunta}_seleccion" name="${idPregunta}_val" value="">
      </div>
    `;
  }

  /**
   * Actualiza el valor del input oculto con el resultado de la fracción y m.c.m si aplica
   */
  function actualizarRespuestaFR1(idPregunta) {
    const inputRes = document.getElementById(`${idPregunta}_resultado`);
    const inputMcm = document.getElementById(`${idPregunta}_mcm`);
    const inputOculto = document.getElementById(`${idPregunta}_seleccion`);

    if (!inputOculto) return;

    const resVal = inputRes ? inputRes.value.trim() : '';
    const mcmVal = inputMcm ? inputMcm.value.trim() : '';

    if (inputMcm) {
      inputOculto.value = `mcm:${mcmVal}|=>|res:${resVal}`;
    } else {
      inputOculto.value = resVal;
    }
  }

