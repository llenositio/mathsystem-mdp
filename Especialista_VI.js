
  /**
   * Renderiza el especialista de Selección Visual / Imágenes (VI).
   * @param {Object} pregunta - Objeto { id, enunciado, imagen, opciones: [...] }
   * @param {number} indice - Índice global del ejercicio.
   * @returns {string} HTML generado.
   */
  function renderizarEspecialista_VI(pregunta, indice) {
    const idPregunta = (pregunta.id !== undefined && pregunta.id !== null) ? pregunta.id : `pre_vi_${indice}`;
    const opciones = pregunta.opciones || [];

    // Tratamiento flexible de enunciado e imagen principal
    const textoEnunciado = pregunta.enunciado || "🖼️ Pregunta Visual";
    const esEnunciadoUrl = typeof pregunta.enunciado === 'string' && (pregunta.enunciado.startsWith('http') || pregunta.enunciado.startsWith('data:'));
    const urlImagenPrincipal = pregunta.imagen || (esEnunciadoUrl ? pregunta.enunciado : "");

    let htmlImagenEnunciado = urlImagenPrincipal ? `
      <div class="mb-4 text-center">
        <img src="${urlImagenPrincipal}" alt="Imagen consigna" class="max-w-full h-auto max-h-64 mx-auto rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
      </div>
    ` : "";

    let htmlTitulo = (!esEnunciadoUrl) ? `
      <h3 class="text-base font-semibold text-slate-800 dark:text-slate-100 mb-3 whitespace-pre-line">
        ${textoEnunciado}
      </h3>
    ` : `
      <h3 class="text-base font-semibold text-slate-800 dark:text-slate-100 mb-3">
        🖼️ Pregunta Visual
      </h3>
    `;

    // Renderiza las opciones visuales en grilla
    const htmlOpciones = opciones.map((urlImg, idx) => {
      const idOpt = `${idPregunta}_opt_${idx}`;
      const urlEscaped = String(urlImg).replace(/'/g, "\\'");
      return `
        <button type="button" 
                id="${idOpt}" 
                onclick="seleccionarOpcionVI('${idPregunta}', '${urlEscaped}', '${idOpt}')"
                class="btn-opcion-vi p-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all shadow-sm flex flex-col items-center justify-center cursor-pointer focus:outline-none">
          <img src="${urlImg}" alt="Opción ${idx + 1}" class="w-full h-32 object-contain rounded-lg pointer-events-none">
        </button>
      `;
    }).join('');

    return `
      <div id="${idPregunta}_container" class="especialista-vi bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 my-4">
        ${htmlTitulo}

        ${htmlImagenEnunciado}

        <p class="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">
          📍 Seleccioná la imagen correcta:
        </p>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          ${htmlOpciones}
        </div>

        <input type="hidden" id="${idPregunta}_seleccion" name="${idPregunta}_val" value="">
      </div>
    `;
  }

  /**
   * Destaca la imagen seleccionada y guarda su URL en el campo oculto
   */
  function seleccionarOpcionVI(idPregunta, urlSeleccionada, idBoton) {
    const contenedor = document.getElementById(`${idPregunta}_container`);
    if (!contenedor) return;

    // Desmarcar todas las opciones del contenedor actual
    const botones = contenedor.querySelectorAll('.btn-opcion-vi');
    botones.forEach(btn => {
      btn.classList.remove('border-indigo-600', 'dark:border-indigo-500', 'ring-2', 'ring-indigo-500');
      btn.classList.add('border-slate-200', 'dark:border-slate-700');
    });

    // Marcar el botón seleccionado
    const btnActivo = document.getElementById(idBoton);
    if (btnActivo) {
      btnActivo.classList.remove('border-slate-200', 'dark:border-slate-700');
      btnActivo.classList.add('border-indigo-600', 'dark:border-indigo-500', 'ring-2', 'ring-indigo-500');
    }

    // Actualizar el valor en el input oculto para sincronización global
    const inputOculto = document.getElementById(`${idPregunta}_seleccion`);
    if (inputOculto) {
      inputOculto.value = urlSeleccionada;
    }
  }

