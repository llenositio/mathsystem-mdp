
  /**
   * Renderiza el especialista de Ecuaciones Interactivas con Balanza.
   * @param {Object} pregunta - Objeto { id, tipo, enunciado, pasosDisponibles, respuestasCorrectas }
   * @param {number} indice - Índice global del ejercicio.
   * @returns {string} HTML generado.
   */
  function renderizarEspecialista_Balanza(pregunta, indice) {
    const idPregunta = (pregunta.id !== undefined && pregunta.id !== null) ? pregunta.id : `pre_balanza_${indice}`;
    const pasos = pregunta.pasosDisponibles || [];

    const htmlBotonesPasos = pasos.map((paso, idx) => {
      const idBtn = `${idPregunta}_paso_${idx}`;
      const pasoEscaped = String(paso).replace(/'/g, "\\'");
      return `
        <button type="button" 
                id="${idBtn}" 
                onclick="seleccionarPasoBalanza('${idPregunta}', '${pasoEscaped}', '${idBtn}')"
                class="btn-paso-balanza px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:border-indigo-400 transition-colors cursor-pointer focus:outline-none">
          ${paso}
        </button>
      `;
    }).join('');

    return `
      <div id="${idPregunta}_container" class="especialista-balanza bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 my-4">
        <h3 class="text-base font-semibold text-slate-800 dark:text-slate-100 mb-2">
          ⚖️ Ecuación / Balanza
        </h3>
        
        <div class="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 mb-4 text-center text-lg font-bold text-indigo-600 dark:text-indigo-400 whitespace-pre-line">
          ${pregunta.enunciado}
        </div>

        <p class="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
          📍 Seleccioná la operación para aplicar en ambos miembros:
        </p>
        
        <div class="flex flex-wrap gap-2 mb-4">
          ${htmlBotonesPasos}
        </div>

        <div class="mt-3">
          <label for="${idPregunta}_resp" class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            Valor final de la incógnita:
          </label>
          <input type="text" 
                 id="${idPregunta}_resp" 
                 name="${idPregunta}_val_resp" 
                 placeholder="Ej: 7" 
                 autocomplete="off"
                 class="w-full p-2.5 text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all">
        </div>

        <input type="hidden" id="${idPregunta}_paso_seleccionado" name="${idPregunta}_val_paso" value="">
      </div>
    `;
  }

  /**
   * Registra visualmente la operación seleccionada para la balanza
   */
  function seleccionarPasoBalanza(idPregunta, paso, idBtnSeleccionado) {
    const contenedor = document.getElementById(`${idPregunta}_container`);
    if (!contenedor) return;

    // Resetear estilos de todos los botones de esta pregunta
    const botones = contenedor.querySelectorAll('.btn-paso-balanza');
    botones.forEach(btn => {
      btn.classList.remove('bg-indigo-600', 'text-white', 'border-indigo-600');
      btn.classList.add('bg-white', 'dark:bg-slate-700', 'text-slate-700', 'dark:text-slate-200');
    });

    // Destacar el botón seleccionado
    const btnActivo = document.getElementById(idBtnSeleccionado);
    if (btnActivo) {
      btnActivo.classList.remove('bg-white', 'dark:bg-slate-700', 'text-slate-700', 'dark:text-slate-200');
      btnActivo.classList.add('bg-indigo-600', 'text-white', 'border-indigo-600');
    }

    // Guardar la elección en el hidden input
    const inputPaso = document.getElementById(`${idPregunta}_paso_seleccionado`);
    if (inputPaso) {
      inputPaso.value = paso;
    }
  }

