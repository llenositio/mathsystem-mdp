
  /**
   * Renderiza el especialista de Selección Múltiple / Checklist (CV).
   * @param {Object} pregunta - Objeto { id, tipo, enunciado, opciones }
   * @param {number} indice - Índice global del ejercicio.
   * @returns {string} HTML generado.
   */
  function renderizarEspecialista_CV(pregunta, indice) {
    const idPregunta = (pregunta.id !== undefined && pregunta.id !== null) ? pregunta.id : `pre_cv_${indice}`;
    const opciones = pregunta.opciones || [];

    const htmlOpciones = opciones.map((opt, idx) => {
      const idOpt = `${idPregunta}_opt_${idx}`;
      const optStr = String(opt);
      const optEscaped = optStr.replace(/"/g, '&quot;');

      return `
        <label for="${idOpt}" class="flex items-center p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all cursor-pointer shadow-sm">
          <input type="checkbox" 
                 id="${idOpt}" 
                 value="${optEscaped}"
                 onchange="actualizarSeleccionCV('${idPregunta}')"
                 class="chk-opcion-cv w-4 h-4 text-indigo-600 rounded border-slate-300 dark:border-slate-600 focus:ring-indigo-500 cursor-pointer">
          <span class="ml-3 text-xs sm:text-sm font-medium">${optStr}</span>
        </label>
      `;
    }).join('');

    return `
      <div id="${idPregunta}_container" class="especialista-cv bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 my-4">
        <h3 class="text-base font-semibold text-slate-800 dark:text-slate-100 mb-2 whitespace-pre-line">
          ${pregunta.enunciado}
        </h3>

        <p class="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">
          ☑️ Seleccioná todas las opciones que correspondan:
        </p>

        <div class="grid grid-cols-1 gap-2.5">
          ${htmlOpciones}
        </div>

        <input type="hidden" id="${idPregunta}_seleccion" name="${idPregunta}_val" value="">
      </div>
    `;
  }

  /**
   * Junta todas las casillas marcadas y las guarda en el input oculto estándar
   */
  function actualizarSeleccionCV(idPregunta) {
    const contenedor = document.getElementById(`${idPregunta}_container`);
    if (!contenedor) return;

    const checkboxes = contenedor.querySelectorAll('.chk-opcion-cv:checked');
    const seleccionados = Array.from(checkboxes).map(chk => chk.value);

    const inputOculto = document.getElementById(`${idPregunta}_seleccion`);
    if (inputOculto) {
      inputOculto.value = seleccionados.join(',,,');
    }
  }
