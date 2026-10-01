<!-- Especialista_EM.html -->
<script>
  /**
   * Renderiza el especialista de Emparejamiento / Unir (EM).
   * @param {Object} pregunta - Objeto { id, tipo, enunciado, pares: [{llave, valor}], opciones: [] }
   * @param {number} indice - Índice global del ejercicio.
   * @returns {string} HTML generado.
   */
  function renderizarEspecialista_EM(pregunta, indice) {
    const idPregunta = (pregunta.id !== undefined && pregunta.id !== null) ? pregunta.id : `pre_em_${indice}`;
    const pares = pregunta.pares || [];
    // Si no se proveen opciones mezcladas explícitas, se obtienen de las respuestas de los pares
    const opcionesMezcladas = pregunta.opciones || pares.map(p => p.valor).filter(Boolean);

    // Genera las opciones para los <select>
    const optionsHtml = `
      <option value="">-- Seleccionar --</option>
      ${opcionesMezcladas.map(opt => {
        const optStr = String(opt);
        const optEscaped = optStr.replace(/"/g, '&quot;');
        return `<option value="${optEscaped}">${optStr}</option>`;
      }).join('')}
    `;

    // Genera las filas de emparejamiento (llave fija a la izquierda, select a la derecha)
    const filasParesHtml = pares.map((par, idx) => {
      const idSelect = `${idPregunta}_select_${idx}`;
      const llaveStr = String(par.llave);
      const llaveEscaped = llaveStr.replace(/"/g, '&quot;');

      return `
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <div class="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 w-full sm:w-1/2 break-words">
            ${llaveStr}
          </div>
          <div class="w-full sm:w-1/2">
            <select id="${idSelect}" 
                    data-llave="${llaveEscaped}"
                    onchange="actualizarSeleccionEM('${idPregunta}')"
                    class="select-opcion-em w-full p-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 cursor-pointer">
              ${optionsHtml}
            </select>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div id="${idPregunta}_container" class="especialista-em bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 my-4">
        <h3 class="text-base font-semibold text-slate-800 dark:text-slate-100 mb-2 whitespace-pre-line">
          ${pregunta.enunciado}
        </h3>

        <p class="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">
          🔗 Seleccioná la correspondencia correcta para cada elemento:
        </p>

        <div class="space-y-2.5">
          ${filasParesHtml}
        </div>

        <input type="hidden" id="${idPregunta}_seleccion" name="${idPregunta}_val" value="">
      </div>
    `;
  }

  /**
   * Recopila todos los pares seleccionados (Llave |=>| Valor) y los guarda separándolos por ,,,
   */
  function actualizarSeleccionEM(idPregunta) {
    const contenedor = document.getElementById(`${idPregunta}_container`);
    if (!contenedor) return;

    const selects = contenedor.querySelectorAll('.select-opcion-em');
    const selecciones = [];

    selects.forEach(select => {
      const llave = select.getAttribute('data-llave');
      const valor = select.value;
      if (valor !== '') {
        selecciones.push(`${llave}|=>|${valor}`);
      }
    });

    const inputOculto = document.getElementById(`${idPregunta}_seleccion`);
    if (inputOculto) {
      inputOculto.value = selecciones.join(',,,');
    }
  }
</script>
