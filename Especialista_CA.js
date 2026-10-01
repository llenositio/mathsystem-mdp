<!-- Especialista_CA.html -->
<script>
  /**
   * Renderiza el especialista de Carga de Archivos (CA).
   * @param {Object} pregunta - Objeto { id, enunciado, imagen, video, tipo }
   * @param {number} indice - Índice global del ejercicio.
   * @returns {string} HTML generado.
   */
  function renderizarEspecialista_CA(pregunta, indice) {
    const idPregunta = (pregunta.id !== undefined && pregunta.id !== null) ? pregunta.id : `ca_preg_${indice}`;
    const urlImagen = pregunta.imagen || "";

    let htmlImagen = urlImagen ? `
      <div class="my-3 text-center">
        <img src="${urlImagen}" class="max-w-full h-auto rounded-lg shadow-sm mx-auto border border-slate-200 dark:border-slate-700" alt="Imagen del ejercicio" />
      </div>
    ` : "";

    return `
      <div id="${idPregunta}_container" class="especialista-ca bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 my-4">
        <h3 class="text-base font-semibold text-slate-800 dark:text-slate-100 mb-3 whitespace-pre-line">
          ${pregunta.enunciado}
        </h3>

        ${htmlImagen}

        <div class="mt-4 p-4 border-2 border-dashed border-indigo-300 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl text-center">
          <p class="text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-2">
            📎 Adjuntá una foto o archivo con el desarrollo de tu trabajo:
          </p>
          <input type="file" 
                 id="${idPregunta}_file" 
                 onchange="procesarArchivoCA(this, '${idPregunta}')" 
                 accept="image/*,application/pdf"
                 class="block w-full text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer" />
          <p id="${idPregunta}_estado" class="text-xs text-slate-500 dark:text-slate-400 mt-2 hidden">
            ⏳ Procesando archivo...
          </p>
          <input type="hidden" id="${idPregunta}_seleccion" name="${idPregunta}_val" value="">
        </div>
      </div>
    `;
  }

  /**
   * Convierte el archivo seleccionado a Base64 para enviarlo a Google Drive.
   * Asigna sincrónicamente window.archivoEnBase64 y el valor del campo oculto.
   */
  function procesarArchivoCA(input, idPregunta) {
    const estado = document.getElementById(`${idPregunta}_estado`);
    const inputOculto = document.getElementById(`${idPregunta}_seleccion`);

    if (input.files && input.files[0]) {
      const archivo = input.files[0];

      if (estado) {
        estado.classList.remove('hidden');
        estado.innerHTML = `<span class="text-amber-600 dark:text-amber-400">⏳ Leyendo archivo...</span>`;
      }

      const lector = new FileReader();
      lector.onload = function(e) {
        window.archivoEnBase64 = e.target.result;
        
        if (estado) {
          estado.innerHTML = `<span class="text-emerald-600 dark:text-emerald-400 font-medium">📄 Archivo listo: ${archivo.name}</span>`;
        }
        if (inputOculto) {
          inputOculto.value = archivo.name;
        }
      };

      lector.onerror = function() {
        window.archivoEnBase64 = null;
        if (estado) {
          estado.innerHTML = `<span class="text-rose-600 font-medium">❌ Error al procesar el archivo. Intentá de nuevo.</span>`;
        }
        if (inputOculto) inputOculto.value = "";
      };

      lector.readAsDataURL(archivo);
    } else {
      window.archivoEnBase64 = null;
      if (estado) {
        estado.classList.add('hidden');
        estado.innerHTML = "";
      }
      if (inputOculto) inputOculto.value = "";
    }
  }
</script>
