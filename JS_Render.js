<script>
  // ==========================================
  // ESTADO GLOBAL Y RENDERIZADO DE PREGUNTAS
  // ==========================================
  window.pasoBalanzaActual = 0;
  window.nombreAlumnoSeleccionado = "";

  if (typeof window.erroresAcumulados === 'undefined') window.erroresAcumulados = {}; 
  if (typeof window.descuentosPregunta === 'undefined') window.descuentosPregunta = {}; 
  window.examenMezclado = false; 

  function renderizarContenido() {
    const contenedor = document.getElementById('render');
    const boton = document.getElementById('btnSig');
    const p = PREGUNTAS_DB[indiceActual];
    if (!p) return;

    capturarNombreAlumnoActivo();

    if (!window.examenMezclado && PREGUNTAS_DB && PREGUNTAS_DB.length > 1) {
      PREGUNTAS_DB.sort(() => Math.random() - 0.5);
      window.examenMezclado = true;
    }

    const TIPO_ACTUAL = p.tipo;

    if (typeof respuestasFinales === 'undefined') {
      window.respuestasFinales = {};
    }

    let html = `<h3>Pregunta ${indiceActual + 1} de ${PREGUNTAS_DB.length}</h3>`;

    if (TIPO_ACTUAL === 'VF') {
      html += `<div style="margin-bottom:20px; text-align:center; font-weight:bold;">
                  ${renderizarContenidoInteligente(p.enunciado, true)}
                </div>
                <table class="grid-table">
                  <thead><tr><th>Concepto</th><th>V</th><th>F</th></tr></thead>
                  <tbody>`;
      if (p.subPreguntas && Array.isArray(p.subPreguntas)) {
        p.subPreguntas.forEach((sub, i) => {
          html += `<tr>
                      <td class="consigna">${renderizarContenidoInteligente(sub.texto)}</td>
                      <td><button class="btn-vf btn-v" id="v_${i}" onclick="marcarVF(${i}, 'V')">V</button></td>
                      <td><button class="btn-vf btn-f" id="f_${i}" onclick="marcarVF(${i}, 'F')">F</button></td>
                    </tr>`;
        });
      }
      html += `</tbody></table>`;
      window.respuestasVFActual = {}; 
    }
    else if (TIPO_ACTUAL === 'OM') {
      html += `<div class="pregunta-om-container">
                  <div style="margin:20px 0; text-align:center;">
                    ${renderizarContenidoInteligente(p.enunciado, true)}
                  </div>
                  <select id="opcionSeleccionada" class="select-estilizado" onchange="validarSeleccion()">
                    <option value="">-- Selecciona una opción --</option>
                    ${p.opciones ? p.opciones.map(opt => `<option value="${opt}">${opt}</option>`).join('') : ''}
                  </select>
                </div>`;
    }
    else if (TIPO_ACTUAL === 'VI') {
      html += `<div style="text-align:center;">
                  <img src="${p.enunciado}" class="img-consigna">
                  <div class="grid-imagenes">
                    ${p.opciones ? p.opciones.map((img, idx) => `<img src="${img}" class="opcion-imagen" id="img_${idx}" onclick="seleccionarVI('${img}',${idx})">`).join('') : ''}
                  </div></div>`;
    }
    else if (TIPO_ACTUAL === 'RM' || TIPO_ACTUAL === 'CV') {
      let inst = TIPO_ACTUAL === 'CV' ? "Seleccioná todas las correctas" : "Seleccioná la correcta";
      
      if (TIPO_ACTUAL === 'CV') {
        window.seleccionCVActual = [];
      } else {
        window.seleccionRMActual = "";
      }

      html += `<p style="text-align:center; color:#666;">${inst}</p>
                <div style="font-size:1.2rem; margin:15px 0; text-align:center;">
                  ${renderizarContenidoInteligente(p.enunciado, true)} 
                </div>
                <div class="grid-rm">
                  ${p.opciones ? p.opciones.map((opt, idx) => `
                    <div class="tarjeta-rm" id="opt_${idx}" onclick="${TIPO_ACTUAL === 'RM' ? 'seleccionarRM(this, ' + idx + ')' : 'seleccionarCV(this, ' + idx + ')'}">
                      ${renderizarContenidoInteligente(opt)} 
                    </div>`).join('') : ''}
                </div>`;
    }
    else if (TIPO_ACTUAL === 'EM') {
      html += `<p style="text-align:center;">${p.enunciado}</p>
                <table class="grid-table">
                <thead><tr><th>Elemento</th><th>Pareja Correcta</th></tr></thead>
                <tbody>`;
      if (p.llaves && Array.isArray(p.llaves)) {
        p.llaves.forEach((llave, idx) => {
          html += `<tr>
                     <td class="consigna">${renderizarContenidoInteligente(llave)}</td>
                     <td>
                       <select class="select-estilizado" id="em_sel_${idx}" onchange="validarEM()">
                         <option value="">-- Elegí --</option>
                         ${p.opciones ? p.opciones.map(opt => `<option value="${opt}">${opt}</option>`).join('') : ''}
                       </select>
                     </td></tr>`;
        });
      }
      html += `</tbody></table>`;
    }
    else if (TIPO_ACTUAL === 'CA') {
      html += `<div class="pregunta-ca-container" style="text-align:center;">
                  <p style="white-space: pre-wrap; text-align: left; font-weight: bold; margin-bottom:15px;">${p.enunciado}</p>`;
      if (p.imagen && p.imagen.includes("http")) {
        html += `<div style="margin:15px 0;"><img src="${p.imagen}" style="max-width:100%; border-radius:8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"></div>`;
      }
      let urlVideo = p.video || p.linkVideo || "";
      if (urlVideo && urlVideo.includes("http")) {
        let vId = urlVideo.includes("youtu.be/") ? urlVideo.split("youtu.be/")[1].split(/[?#]/)[0] : (urlVideo.includes("v=") ? urlVideo.split("v=")[1].split("&")[0] : "");
        if (vId) {
          html += `<div style="margin:20px 0; position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:10px; background:#000;">
                      <iframe style="position:absolute; top:0; left:0; width:100%; height:100%;" src="https://www.youtube.com/embed/${vId}" frameborder="0" allowfullscreen></iframe>
                     </div>`;
        }
      }
      html += `<div class="drop-zone" onclick="document.getElementById('archivoInput').click()" style="border: 2px dashed #007bff; padding: 25px; cursor: pointer; background: #f0f7ff; border-radius: 10px; margin-top:20px;">
                   <p id="textoArchivo" style="color:#007bff; font-weight:bold;">📸 Click aquí para sacar foto o subir archivo</p>
                   <input type="file" id="archivoInput" style="display:none" onchange="procesarArchivo(this)">
                 </div>
                 <p id="fileLabel" class="file-info" style="margin-top:10px; color:green; font-weight:bold;"></p>
                </div>`;
    }
    else if (TIPO_ACTUAL === 'PC1') {
      html += `<div class="pregunta-pc1" style="text-align: center; margin: 20px 0;">
                  <div style="margin: 20px 0; font-size: 1.2rem; font-weight: bold;">${renderizarContenidoInteligente(p.enunciado, true)}</div>
                  <canvas id="canvas_preg_${indiceActual}" width="300" height="300" style="border: 2px solid #333; background: #fff; cursor: crosshair; touch-action: none; border-radius: 4px;"></canvas>
                </div>`;
      
      setTimeout(() => {
        const canvas = document.getElementById(`canvas_preg_${indiceActual}`);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const CENTRO = 150, ESCALA = 25;

        function dibujarPlano() {
          ctx.clearRect(0, 0, 300, 300);
          ctx.strokeStyle = '#e8e8e8'; ctx.lineWidth = 1;
          for (let i = -5; i <= 5; i++) {
            let pos = CENTRO + (i * ESCALA);
            ctx.beginPath(); ctx.moveTo(pos, 0); ctx.lineTo(pos, 300); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, pos); ctx.lineTo(300, pos); ctx.stroke();
          }
          ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(0, CENTRO); ctx.lineTo(300, CENTRO); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(CENTRO, 0); ctx.lineTo(CENTRO, 300); ctx.stroke();
          ctx.fillStyle = '#333'; ctx.font = '10px Arial'; ctx.textAlign = 'center';
          for (let i = -5; i <= 5; i++) {
            if (i === 0) continue;
            let pos = CENTRO + (i * ESCALA);
            ctx.fillText(i, pos, CENTRO + 14);
            ctx.fillText(i, CENTRO - 12, CENTRO - (i * ESCALA) + 4);
          }
        }
        dibujarPlano();
        
        canvas.addEventListener('pointerdown', function(e) {
          const rect = canvas.getBoundingClientRect();
          const mathX = Math.round(((e.clientX - rect.left) - CENTRO) / ESCALA);
          const mathY = Math.round((CENTRO - (e.clientY - rect.top)) / ESCALA);
          if (Math.abs(mathX) > 5 || Math.abs(mathY) > 5) return;
          dibujarPlano();
          ctx.fillStyle = '#007bff';
          ctx.beginPath();
          ctx.arc(CENTRO + (mathX * ESCALA), CENTRO - (mathY * ESCALA), 6, 0, 2 * Math.PI);
          ctx.fill();
          if (boton) boton.disabled = false;
          canvas.dataset.coordenadaActual = `(${mathX}; ${mathY})`;
          respuestasFinales[p.id] = `${mathX};${mathY}`;
        });
      }, 150);
    }
    else if (TIPO_ACTUAL === 'FR1') {
      const op = (p.operacion && p.operacion !== "") ? p.operacion : 'SUMA';
      html += `<div class="pregunta-fr1" style="text-align: left; margin: 10px 0;">
                  <div style="text-align: center; margin-bottom: 20px; font-size: 1.3rem; font-weight: bold;">
                    ${renderizarContenidoInteligente(p.enunciado, true)}
                  </div>`;
      if (op === 'SUMA') {
        html += `<div style="margin-bottom: 15px;"><label style="font-weight: bold; font-size: 0.95rem; color: #444;">Paso 1: MCM</label><input type="text" id="fr1_mcm" class="form-control" placeholder="Ej: 12" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #aaa; margin-top: 5px;" oninput="validarInputsFR1()"></div>
                  <div style="margin-bottom: 15px;"><label style="font-weight: bold; font-size: 0.95rem; color: #444;">Paso 2: Numeradores</label><input type="text" id="fr1_num" class="form-control" placeholder="Ej: 4, 15, -2" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #aaa; margin-top: 5px;" oninput="validarInputsFR1()"></div>`;
      } else if (op === 'MULT') {
        html += `<div style="margin-bottom: 15px;"><label style="font-weight: bold; color: #555;">Paso 1: Producto Numeradores</label><input type="text" id="fr1_pnum" class="form-control" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #aaa; margin-top: 5px;" placeholder="Ej: -12" oninput="validarInputsFR1()"></div>
                  <div style="margin-bottom: 15px;"><label style="font-weight: bold; color: #555;">Paso 2: Producto Denominadores</label><input type="text" id="fr1_pden" class="form-control" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #aaa; margin-top: 5px;" placeholder="Ej: 36" oninput="validarInputsFR1()"></div>`;
      } else if (op === 'DIV') {
        html += `<div style="margin-bottom: 15px;"><label style="font-weight: bold; color: #555;">Paso 1: Invertir a multiplicación</label><input type="text" id="fr1_inv" class="form-control" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #aaa; margin-top: 5px;" placeholder="Ej: -5/3 * (-1/3)" oninput="validarInputsFR1()"></div>`;
      }
      html += `<hr style="border: none; border-top: 1px dashed #ccc; margin: 20px 0;">
                <div style="margin-bottom: 15px;"><label style="font-weight: bold; font-size: 0.95rem; color: #0275d8;">Resultado simplificado</label><input type="text" id="fr1_res" class="form-control" placeholder="Ej: 5/4" style="width: 100%; padding: 10px; border-radius: 8px; border: 2px solid #0275d8; margin-top: 5px;" oninput="validarInputsFR1()"></div></div>`;
    }
    else if (TIPO_ACTUAL === 'EXAMEN') {
      // CORRECCIÓN: Renderizar usando el especialista exclusivo de EXAMEN
      if (typeof renderizarEspecialista_EXAMEN === 'function') {
        html += renderizarEspecialista_EXAMEN(p, indiceActual);
      } else {
        html += `<div style="padding: 15px; background: #f8d7da; color: #721c24; border-radius: 8px; text-align: center; font-weight: bold;">
                  ❌ Error: No se encontró la función renderizarEspecialista_EXAMEN.
                </div>`;
      }
    }
    else if (TIPO_ACTUAL === 'BALANZA') {
      const respGuardada = (typeof respuestasFinales !== 'undefined' && respuestasFinales[p.id]) ? respuestasFinales[p.id] : "";
      
      let rawPasos = p.pasos || p.pasosDisponibles || p.opciones || "";
      let pasos = Array.isArray(rawPasos) ? rawPasos : (typeof rawPasos === 'string' && rawPasos.trim() !== '' ? rawPasos.split(',,,').map(item => item.trim()) : []);

      const totalPasos = pasos.length;
      const pasoActual = window.pasoBalanzaActual || 0;
      const estaBloqueado = totalPasos > 0 && pasoActual < totalPasos;

      let listaEcuaciones = p.enunciado ? String(p.enunciado).split(',,,').map(e => e.trim()) : [];
      let ecuacionAMostrar = listaEcuaciones[pasoActual] || listaEcuaciones[listaEcuaciones.length - 1] || p.enunciado || "";

      let resCorrectaRaw = (p.respuestasCorrectas && p.respuestasCorrectas.length > 0) ? String(p.respuestasCorrectas[0]).trim() : (p.correcta ? String(p.correcta).trim() : "");

      let contenidoEcuacion = (pasoActual >= totalPasos && resCorrectaRaw !== "") 
        ? (resCorrectaRaw.startsWith('$$') ? resCorrectaRaw : `$$${resCorrectaRaw}$$`) 
        : renderizarContenidoInteligente(ecuacionAMostrar, true);

      html += `<div class="pregunta-balanza" style="text-align: center; margin: 15px 0;">
                  <div style="margin-bottom: 10px; font-size: 1.3rem; font-weight: bold;">${contenidoEcuacion}</div>
                  <p style="font-size: 0.95rem; color: #555; margin-bottom: 15px;">
                    ${totalPasos > 0 && pasoActual < totalPasos ? `Paso ${pasoActual + 1} de${totalPasos}: Seleccioná la opción conveniente:` : '¡Todos los pasos completados! Podés finalizar o revisar.'}
                  </p>`;

      if (totalPasos > 0 && pasoActual < totalPasos) {
        let pasoTexto = pasos[pasoActual];
        let opcionesDelPaso = (typeof pasoTexto === 'string') ? pasoTexto.split(';') : (Array.isArray(pasoTexto) ? pasoTexto : [pasoTexto]);
        opcionesDelPaso.sort(() => Math.random() - 0.5);

        const totalDistractoresPaso = opcionesDelPaso.filter(o => !String(o).trim().startsWith('*')).length;

        html += `<div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-bottom: 15px;">`;

        opcionesDelPaso.forEach(opcionRaw => {
          let opcion = String(opcionRaw).trim();
          let esCorrecta = opcion.startsWith('*');
          let textoBoton = opcion.replace('*', '');
          let mensajeError = "";

          if (textoBoton.includes(':')) {
            let partes = textoBoton.split(':');
            textoBoton = partes[0].trim();
            mensajeError = partes.slice(1).join(':').trim();
          }

          let msjAtributo = mensajeError ? mensajeError.replace(/'/g, "&#39;").replace(/"/g, "&quot;") : "";
          let esImagen = /^(http:\/\/|https:\/\/|data:image\/)/i.test(textoBoton) || /\.(png|jpg|jpeg|gif|svg|webp)$/i.test(textoBoton);
          let contenidoBoton = esImagen ? `<img src="${textoBoton}" alt="Opción" style="max-height: 40px; max-width: 100%; object-fit: contain; vertical-align: middle;">` : renderizarContenidoInteligente(textoBoton);

          html += `<button type="button" onclick="procesarPasoBalanza(${esCorrecta}, '${msjAtributo}', this, ${totalDistractoresPaso})" style="padding: 10px 16px; font-size: 1rem; font-weight: bold; border: 2px solid #1a73e8; background: #fff; color: #1a73e8; border-radius: 8px; cursor: pointer; transition: all 0.2s;">
                      ${contenidoBoton}
                    </button>`;
        });

        html += `</div>`;
      }

      html += `<div id="balanza_feedback_error" style="display: none; background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; padding: 10px; border-radius: 8px; margin: 10px auto; max-width: 450px; text-align: center; font-size: 0.95rem;"></div>`;

      let valEscapado = resCorrectaRaw.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/"/g, "&quot;");

      html += `<div style="margin-top: 15px; background: #f8f9fa; padding: 15px; border-radius: 10px;">
                  ${!estaBloqueado ? `
                    <button type="button" onclick="autocompletarResultadoFinal('${valEscapado}')" style="margin-bottom: 12px; padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 0.95rem; box-shadow: 0 2px 4px rgba(0,0,0,0.15);">
                      ✨ Insertar este resultado final
                    </button>
                  ` : ''}
                  <label style="display: block; font-weight: bold; margin-bottom: 8px; color: #1a73e8;">Resultado final:</label>
                  <input type="text" id="balanza_res" value="${respGuardada}" ${estaBloqueado ? 'disabled' : ''} placeholder="${estaBloqueado ? 'Completá los pasos previos...' : 'Ej: 4'}" style="width: 100%; max-width: 320px; text-align: center; padding: 10px; border-radius: 8px; border: 2px solid #1a73e8; font-size: 1rem; margin: 0 auto; display: block;" oninput="validarInputsBALANZA()">
                </div>
              </div>`;
    }

    if (contenedor) contenedor.innerHTML = html;

    if (boton) {
      boton.innerText = (indiceActual === PREGUNTAS_DB.length - 1) ? "FINALIZAR Y ENVIAR" : "SIGUIENTE";
      boton.disabled = true;
    }

    if (window.MathJax && MathJax.typesetPromise && contenedor) {
      window.MathJax.typesetPromise([contenedor]);
    }

    consultasUsadas = 0;
    const botonAyuda = document.getElementById('btnAyuda');
    if (botonAyuda) {
      if (p && p.mostrarAyuda) {
        botonAyuda.style.display = 'block'; 
        botonAyuda.disabled = false; 
        botonAyuda.style.opacity = "1";
        botonAyuda.innerText = "💬 ¿Necesitás ayuda? Preguntale al profe";
      } else {
        botonAyuda.style.display = 'none';
      }
    }
  }

  function capturarNombreAlumnoActivo() {
    let nom = "";
    if (typeof nombreAlumno !== 'undefined' && nombreAlumno && !nombreAlumno.includes("Alumno")) nom = nombreAlumno;
    else if (typeof alumnoSeleccionado !== 'undefined' && alumnoSeleccionado) nom = alumnoSeleccionado;
    else if (typeof datosAlumno !== 'undefined' && datosAlumno.nombre) nom = datosAlumno.nombre;
    else if (typeof window.datosAlumno !== 'undefined' && window.datosAlumno.nombre) nom = window.datosAlumno.nombre;

    if (!nom) {
      const selectores = ['selectAlumno', 'alumno', 'comboAlumnos', 'alu', 'select-alumnos'];
      for (let s of selectores) {
        let el = document.getElementById(s);
        if (el) {
          if (el.options && el.selectedIndex >= 0) {
            let txt = el.options[el.selectedIndex].text;
            if (txt && !txt.includes("--") && !txt.toLowerCase().includes("seleccion")) {
              nom = txt.trim(); break;
            }
          }
          if (el.value && !el.value.includes("--")) {
            nom = el.value.trim(); break;
          }
        }
      }
    }

    if (nom) window.nombreAlumnoSeleccionado = nom;
    return window.nombreAlumnoSeleccionado;
  }
</script>
