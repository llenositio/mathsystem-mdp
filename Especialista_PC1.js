<!-- Especialista_PC1.html -->
<script>
  /**
   * Renderiza el especialista de Plano Cartesiano Interactivo (PC1).
   */
  function renderizarEspecialista_PC1(pregunta, indice) {
    const idPregunta = (pregunta.id !== undefined && pregunta.id !== null) ? pregunta.id : `pre_pc1_${indice}`;

    return `
      <div id="${idPregunta}_container" class="especialista-pc1 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 my-4 text-center">
        <h3 class="text-base font-semibold text-slate-800 dark:text-slate-100 mb-2 whitespace-pre-line">
          ${pregunta.enunciado}
        </h3>

        <p class="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">
          📍 Hacé clic en el plano para ubicar el punto:
        </p>

        <div class="relative inline-block border border-slate-300 dark:border-slate-700 rounded-lg bg-white overflow-hidden shadow-sm">
          <canvas id="${idPregunta}_canvas" width="300" height="300" class="cursor-pointer touch-none" onclick="marcarPuntoPC1(event, '${idPregunta}')"></canvas>
        </div>

        <div class="mt-3 text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400">
          Coordenada seleccionada: <span id="${idPregunta}_display" class="font-mono bg-indigo-50 dark:bg-indigo-950/50 px-2 py-1 rounded">(ninguna)</span>
        </div>

        <input type="hidden" id="${idPregunta}_seleccion" name="${idPregunta}_val" value="">
      </div>
    `;
  }

  /**
   * Inicializa el lienzo con los ejes X e Y (rango de -5 a 5)
   * Restaura automáticamente el punto previo si existía una selección guardada.
   */
  function inicializarCanvasPC1(idPregunta, xSel = null, ySel = null) {
    const canvas = document.getElementById(`${idPregunta}_canvas`);
    if (!canvas) return;

    // Si no se pasan coordenadas explícitas, verificar si ya existe un valor previo guardado
    if (xSel === null || ySel === null) {
      const inputOculto = document.getElementById(`${idPregunta}_seleccion`);
      if (inputOculto && inputOculto.value) {
        const partes = inputOculto.value.split(';');
        if (partes.length === 2) {
          xSel = parseInt(partes[0], 10);
          ySel = parseInt(partes[1], 10);
        }
      }
    }

    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const centroX = w / 2;
    const centroY = h / 2;
    const escala = w / 12; // Rango de -5 a 5 con margen

    ctx.clearRect(0, 0, w, h);

    // Dibuja la cuadrícula
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let i = -5; i <= 5; i++) {
      // Líneas verticales
      ctx.beginPath();
      ctx.moveTo(centroX + i * escala, 0);
      ctx.lineTo(centroX + i * escala, h);
      ctx.stroke();

      // Líneas horizontales
      ctx.beginPath();
      ctx.moveTo(0, centroY + i * escala);
      ctx.lineTo(w, centroY + i * escala);
      ctx.stroke();
    }

    // Ejes X e Y
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, centroY); ctx.lineTo(w, centroY); // Eje X
    ctx.moveTo(centroX, 0); ctx.lineTo(centroX, h); // Eje Y
    ctx.stroke();

    // Dibuja el punto si fue seleccionado
    if (xSel !== null && ySel !== null && !isNaN(xSel) && !isNaN(ySel)) {
      const px = centroX + xSel * escala;
      const py = centroY - ySel * escala;

      ctx.fillStyle = '#4f46e5';
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  /**
   * Registra el clic en el plano cartesiano y actualiza el valor seleccionado
   */
  function marcarPuntoPC1(event, idPregunta) {
    const canvas = document.getElementById(`${idPregunta}_canvas`);
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    const w = canvas.width;
    const h = canvas.height;
    const centroX = w / 2;
    const centroY = h / 2;
    const escala = w / 12;

    // Calcula la coordenada entera más cercana (-5 a 5)
    const coordX = Math.round((clickX - centroX) / escala);
    const coordY = Math.round((centroY - clickY) / escala);

    if (coordX < -5 || coordX > 5 || coordY < -5 || coordY > 5) return;

    // Renderiza de nuevo el plano con el punto marcado
    inicializarCanvasPC1(idPregunta, coordX, coordY);

    const formatoCoordenada = `${coordX};${coordY}`;
    const display = document.getElementById(`${idPregunta}_display`);
    const inputOculto = document.getElementById(`${idPregunta}_seleccion`);

    if (display) display.innerText = `(${coordX} ; ${coordY})`;
    if (inputOculto) inputOculto.value = formatoCoordenada;
  }
</script>
