<!-- Especialista_RM.html -->
<script>
  /**
   * Renderiza el especialista de Relación / Tarjetas (RM).
   * @param {Object} pregunta - Objeto { id, tipo, enunciado, opciones, respuestasCorrectas }
   * @param {number} indice - Índice global del ejercicio.
   * @returns {string} HTML generado.
   */
  function renderizarEspecialista_RM(pregunta, indice) {
    const idPregunta = (pregunta.id !== undefined && pregunta.id !== null) ? pregunta.id : `pre_rm_${indice}`;
    const opciones = pregunta.opciones || [];

    const htmlOpciones = opciones.map((opt, idx) => {
      const idOpt = `${idPregunta}_opt_${idx}`;
      const optEscaped = String(opt).replace(/'/g, "\\'");
      return `
        <button type="button" 
                id="${idOpt}" 
                onclick="seleccionarOpcionRM('${idPregunta}', '${optEscaped}', '${idOpt}')"
                class="btn-opcion-rm w-full p-3 text-left text-xs sm:text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all shadow-sm cursor-pointer focus:outline-none">
          ${opt}
        </button>
      `;
    }).join('');

    return `
      <div id="${idPregunta}_container" class="especialista-rm bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 my-4">
        <h3 class="text-base font-semibold text-slate-800 dark:text-slate-100 mb-3 whitespace-pre-line">
          ${pregunta.enunciado}
        </h3>

        <p class="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">
          📍 Seleccioná la opción o relación correcta:
        </p>

        <div class="grid grid-cols-1 gap-2.5">
          ${htmlOpciones}
        </div>

        <input type="hidden" id="${idPregunta}_seleccion" name="${idPregunta}_val" value="">
      </div>
    `;
  }

  /**
   * Selecciona una opción en el módulo RM y la destaca visualmente
   */
  function seleccionarOpcionRM(idPregunta, valor, idBoton) {
    const contenedor = document.getElementById(`${idPregunta}_container`);
    if (!contenedor) return;

    // Quitar estilos de selección de todos los botones de este grupo
    const botones = contenedor.querySelectorAll('.btn-opcion-rm');
    botones.forEach(btn => {
      btn.classList.remove('bg-indigo-600', 'text-white', 'border-indigo-600', 'dark:bg-indigo-600');
      btn.classList.add('bg-white', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-200');
    });

    // Marcar el botón seleccionado
    const btnActivo = document.getElementById(idBoton);
    if (btnActivo) {
      btnActivo.classList.remove('bg-white', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-200');
      btnActivo.classList.add('bg-indigo-600', 'text-white', 'border-indigo-600');
    }

    // Guardar el valor seleccionado en el hidden input
    const inputOculto = document.getElementById(`${idPregunta}_seleccion`);
    if (inputOculto) {
      inputOculto.value = valor;
    }
  }
</script>
