
  function abrirChatAyuda() {
    if (consultasUsadas >= 3) {
      alert("⛔ Ya usaste las 3 ayudas para este ejercicio. ¡Seguí intentando solo!");
      return;
    }
    consultasUsadas++;
    let restantes = 3 - consultasUsadas;
    
    const botonAyuda = document.getElementById('btnAyuda');
    if (botonAyuda) {
      botonAyuda.innerText = "💬 Ayuda (" + restantes + " restantes)";
      if (restantes === 0) {
        botonAyuda.disabled = true;
        botonAyuda.style.opacity = "0.5";
      }
    }

    const modalChat = document.getElementById('modalChat');
    if (modalChat) {
      modalChat.style.display = 'flex';
      
      const p = PREGUNTAS_DB[indiceActual];
      if (p && p.tipo === 'PC1') {
        const canvas = document.getElementById(`canvas_preg_${indiceActual}`);
        const coordenada = canvas ? canvas.dataset.coordenadaActual : null;
        const chatMensajes = document.getElementById('chatMensajes');
        chatMensajes.innerHTML = ''; 
        
        if (coordenada) {
          agregarMensajeAlChat('profe', `👋 ¡Hola! Como me pediste ayuda, miré tu lienzo. Te digo dónde tocaste por última vez: ${coordenada}. ¿Te coincide con el punto del enunciado?`);
        } else {
          agregarMensajeAlChat('profe', `👋 ¡Hola! Veo que todavía no marcaste ningún punto en el plano. Hacé clic en la grilla y si tenés dudas volveme a preguntar.`);
        }
      }
    } else {
      alert("Error: No se encontró la ventana del chat. Recargá la página.");
    }
  }

  function cerrarChat() {
    document.getElementById('modalChat').style.display = 'none';
  }

  function insertarSimbolo(tipo) {
    const input = document.getElementById('chatInput');
    if (!input) return;

    const start = input.selectionStart;
    const end = input.selectionEnd;
    const texto = input.value;
    let insertar = '', cursorPos = 0;

    if (tipo === 'raiz_cuadrada') { insertar = '√()'; cursorPos = 2; }
    else if (tipo === 'raiz_enesima') { insertar = 'raiz()'; cursorPos = 5; }
    else if (tipo === 'potencia') { insertar = '^()'; cursorPos = 2; }
    else if (tipo === 'fraccion') { insertar = '/'; cursorPos = 1; }
    else if (tipo === 'parentesis') { insertar = '()'; cursorPos = 1; }
    else if (tipo === 'integral') { insertar = '∫()dx'; cursorPos = 2; }
    else if (tipo === 'derivada') { insertar = "f'()"; cursorPos = 3; }
    else if (tipo === 'limite') { insertar = 'lim(x→)'; cursorPos = 7; }
    else if (tipo === 'infinito') { insertar = '∞'; cursorPos = 1; }
    else if (tipo === 'multiplicacion') { insertar = '*'; cursorPos = 1; }
    else if (tipo === 'matriz') { insertar = '[[ ]]'; cursorPos = 3; }
    else if (tipo === 'sistema') { insertar = '{ }'; cursorPos = 2; }

    input.value = texto.substring(0, start) + insertar + texto.substring(end);
    input.selectionStart = input.selectionEnd = start + cursorPos;
    input.focus();
  }

  function enviarMensajeChat() {
    const input = document.getElementById('chatInput');
    const mensaje = input.value.trim();
    if (!mensaje) return;
    
    input.value = '';
    agregarMensajeAlChat('alumno', mensaje);
    
    const chatMensajes = document.getElementById('chatMensajes');
    const indicador = document.createElement('div');
    indicador.id = 'indicadorCarga';
    indicador.style.cssText = 'margin-bottom:10px; padding:10px; background:#f1f3f4; border-radius:8px; color:#777; font-style:italic;';
    indicador.textContent = 'El profe está pensando...';
    chatMensajes.appendChild(indicador);
    chatMensajes.scrollTop = chatMensajes.scrollHeight;
    
    const enunciado = PREGUNTAS_DB[indiceActual] ? PREGUNTAS_DB[indiceActual].enunciado : '';
    
    let anio = "1";
    try {
      let partes = ID_LINK.split('/');
      if (partes.length >= 4 && !isNaN(parseInt(partes[3]))) {
        anio = partes[3];
      }
    } catch(e) {
      console.log("Usando año 1 por defecto");
    }

    const historial = [];
    const mensajes = chatMensajes.children;
    for (let i = 0; i < mensajes.length; i++) {
      const div = mensajes[i];
      if (div.id === 'indicadorCarga') continue;
      const esAlumno = div.style.marginLeft === 'auto' || div.style.textAlign === 'right';
      historial.push({ rol: esAlumno ? 'alumno' : 'profe', mensaje: div.textContent });
    }
    
    google.script.run
      .withSuccessHandler(respuesta => {
        const ind = document.getElementById('indicadorCarga');
        if (ind) ind.remove();
        agregarMensajeAlChat('profe', respuesta);
      })
      .withFailureHandler(error => {
        const ind = document.getElementById('indicadorCarga');
        if (ind) ind.remove();
        agregarMensajeAlChat('profe', 'Error: ' + error.message);
      })
      .consultarTutorIA(enunciado, mensaje, historial, anio);
  }

  function agregarMensajeAlChat(emisor, texto) {
    const contenedor = document.getElementById('chatMensajes');
    const div = document.createElement('div');
    div.style.marginBottom = '10px';
    div.style.padding = '10px';
    div.style.borderRadius = '8px';
    div.style.maxWidth = '80%';
    
    if (emisor === 'alumno') {
      div.style.background = '#1a73e8';
      div.style.color = 'white';
      div.style.marginLeft = 'auto';
      div.style.textAlign = 'right';
    } else {
      div.style.background = '#f1f3f4';
      div.style.color = '#333';
      div.style.marginRight = 'auto';
    }
    
    div.textContent = texto;
    contenedor.appendChild(div);
    contenedor.scrollTop = contenedor.scrollHeight;
  }

