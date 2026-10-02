  /**
   * Renderiza las subpreguntas de Verdadero / Falso mediante tarjetas interactivas.
   * @param {Object} pregunta - Objeto con { id, tipo, enunciado, subPreguntas: [{texto, correcta}] }
   * @param {number} indice - Índice global del ejercicio.
   * @returns {string} HTML generado.
   */
  function renderizarEspecialista_VF(pregunta, indice) {
    const idPregunta = (pregunta.id !== undefined && pregunta.id !== null) ? pregunta.id : `pre_vf_${indice}`;
    const subPreguntas = pregunta.subPreguntas || [];

    const htmlSubpreguntas = subPreguntas.map((sub, idx) => {
      const idSub = `${idPregunta}_sub_${idx}`;
      return `
        <div class="subpregunta-card p-3 my-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span class="text-sm text-slate-800 dark:text-slate-200 font-medium">
            ${sub.texto}
          </span>
          <div class="inline-flex rounded-md shadow-sm self-end sm:self-auto" role="group">
            <button type="button" 
                    id="${idSub}_btn_V"
                    onclick="seleccionarOpcionVF('${idSub}', 'V')"
                    class="px-3 py-1.5 text-xs font-semibold rounded-l-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 transition-colors">
              Verdadero
            </button>
            <button type="button" 
                    id="${idSub}_btn_F"
                    onclick="seleccionarOpcionVF('${idSub}', 'F')"
                    class="px-3 py-1.5 text-xs font-semibold rounded-r-lg border-t border-b border-r border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition-colors">
              Falso
            </button>
          </div>
          <input type="hidden" id="${idSub}_val" name="${idPregunta}_val_${idx}" value="" />
        </div>
      `;
    }).join('');

    return `
      <div id="${idPregunta}_container" class="especialista-vf bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 my-4">
        <h3 class="text-base font-semibold text-slate-800 dark:text-slate-100 mb-3 whitespace-pre-line">
          ${pregunta.enunciado}
        </h3>
        <div class="space-y-2">
          ${htmlSubpreguntas}
        </div>
      </div>
    `;
  }

  /**
   * Maneja la interacción visual de selección para los botones V/F.
   */
  function seleccionarOpcionVF(idSub, valor) {
    const btnV = document.getElementById(`${idSub}_btn_V`);
    const btnF = document.getElementById(`${idSub}_btn_F`);
    const inputVal = document.getElementById(`${idSub}_val`);

    if (!inputVal) return;

    inputVal.value = valor;

    // Resetear estilos base
    [btnV, btnF].forEach(btn => {
      if (btn) {
        btn.className = btn.className
          .replace(/bg-emerald-600|bg-rose-600|text-white/g, '')
          .trim();
        btn.classList.add('bg-white', 'dark:bg-slate-700', 'text-slate-700', 'dark:text-slate-200');
      }
    });

    // Aplicar estilo activo
    if (valor === 'V' && btnV) {
      btnV.classList.remove('bg-white', 'dark:bg-slate-700', 'text-slate-700', 'dark:text-slate-200');
      btnV.classList.add('bg-emerald-600', 'text-white');
    } else if (valor === 'F' && btnF) {
      btnF.classList.remove('bg-white', 'dark:bg-slate-700', 'text-slate-700', 'dark:text-slate-200');
      btnF.classList.add('bg-rose-600', 'text-white');
    }
  }
