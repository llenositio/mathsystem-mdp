
  // ==========================================
  // LÓGICA DE INTERACCIÓN, EVALUACIÓN Y ENVÍO
  // ==========================================
  function procesarPasoBalanza(esCorrecta, mensajeError, btnElement, totalDistractoresPaso) {
    const divError = document.getElementById('balanza_feedback_error');
    const p = PREGUNTAS_DB[indiceActual];
    if (!p) return;

    if (!window.erroresAcumulados[p.id]) window.erroresAcumulados[p.id] = [];
    if (typeof window.descuentosPregunta[p.id] === 'undefined') window.descuentosPregunta[p.id] = 0;

    let rawPasos = p.pasosDisponibles || p.opciones || "";
    let pasos = Array.isArray(rawPasos) ? rawPasos : (typeof rawPasos === 'string' ? rawPasos.split(',,,') : []);
    const totalPasos = pasos.length || 1;

    if (esCorrecta) {
      if (divError) divError.style.display = 'none';
      window.pasoBalanzaActual++;
      renderizarContenido(); 
    } else {
      if (btnElement) {
        btnElement.disabled = true;
        btnElement.style.background = '#f8d7da';
        btnElement.style.color = '#721c24';
        btnElement.style.borderColor = '#f5c6cb';
        btnElement.style.cursor = 'not-allowed';
      }

      const numDistractores = totalDistractoresPaso || 1;
      const valorPaso = 1 / totalPasos;
      const penalizacion = valorPaso / numDistractores;

      window.descuentosPregunta[p.id] += penalizacion;

      let textoPedagógico = mensajeError || (btnElement ? "Revisar elección en el paso " + (window.pasoBalanzaActual + 1) : "");

      if (textoPedagógico) {
        window.erroresAcumulados[p.id].push(textoPedagógico);
        if (divError) {
          divError.innerHTML = "❌ " + (mensajeError || "Opción incorrecta, intentá con otra.");
          divError.style.display = 'block';
        }
      }
    }
  }

  function gestionarNavegacion() {
    const p = PREGUNTAS_DB[indiceActual];
    let respuestaAlumno = "", puntosBrutos = 0;

    if (p.tipo === 'VF') {
      let aciertosSub = 0;
      if (p.subPreguntas && Array.isArray(p.subPreguntas)) {
        p.subPreguntas.forEach((sub, i) => { if (window.respuestasVFActual && window.respuestasVFActual[i] === sub.correcta) aciertosSub++; });
        puntosBrutos = (aciertosSub / p.subPreguntas.length);
      }
      respuestaAlumno = JSON.stringify(window.respuestasVFActual || {});
    } 
    else if (p.tipo === 'OM' || p.tipo === 'VI' || p.tipo === 'RM' || p.tipo === 'PC1') {
      respuestaAlumno = (p.tipo === 'PC1') ? (respuestasFinales[p.id] || "") : ((p.tipo === 'OM') ? document.getElementById('opcionSeleccionada').value : (p.tipo === 'VI' ? window.seleccionVIActual : window.seleccionRMActual));
      const correctaOriginal = (p.respuestasCorrectas && p.respuestasCorrectas[0]) ? p.respuestasCorrectas[0] : (p.respuestaCorrecta || p.correcta || "");
      
      if (p.tipo === 'PC1') {
        let alumLimpio = respuestaAlumno.toString().replace(/[()\s]/g, '');
        let corrLimpia = correctaOriginal.toString().replace(/[()\s]/g, '');
        puntosBrutos = (alumLimpio === corrLimpia && alumLimpio !== "") ? 1 : 0;
      } else {
        puntosBrutos = (normalizarMatematica(respuestaAlumno) === normalizarMatematica(correctaOriginal)) ? 1 : 0;
      }
    }
    else if (p.tipo === 'CV') {
      respuestaAlumno = (window.seleccionCVActual || []).join(", ");
      const correctas = p.respuestasCorrectas || [];
      const esIgual = (window.seleccionCVActual || []).length === correctas.length && (window.seleccionCVActual || []).every(v => correctas.some(c => normalizarMatematica(c) === normalizarMatematica(v)));
      puntosBrutos = esIgual ? 1 : 0;
    }
    else if (p.tipo === 'EM') {
      let aciertosEM = 0, rEM = {};
      if (p.llaves && Array.isArray(p.llaves)) {
        p.llaves.forEach((llave, idx) => {
          let elSel = document.getElementById(`em_sel_${idx}`);
          let val = elSel ? elSel.value : "";
          rEM[llave] = val;
          let par = p.pares ? p.pares.find(par => par.llave === llave) : null;
          if (par && normalizarMatematica(par.valor) === normalizarMatematica(val)) aciertosEM++;
        });
        puntosBrutos = (aciertosEM / p.llaves.length);
      }
      respuestaAlumno = JSON.stringify(rEM);
    }
    else if (p.tipo === 'CA') { 
      if (typeof enviarConArchivo === 'function') { enviarConArchivo(); return; }
    }
    else if (p.tipo === 'FR1' || p.tipo === 'BALANZA' || p.tipo === 'EXAMEN') {
      respuestaAlumno = respuestasFinales[p.id] || "";
      const correcta = (p.respuestasCorrectas && p.respuestasCorrectas[0]) ? p.respuestasCorrectas[0] : "";
      
      const esFinalCorrecta = (normalizarMatematica(respuestaAlumno) === normalizarMatematica(correcta));
      const descuentoTotal = window.descuentosPregunta[p.id] || 0;

      puntosBrutos = esFinalCorrecta ? Math.max(0, 1 - descuentoTotal) : 0;
    }

    respuestasFinales[p.id] = respuestaAlumno;
    puntosFinales[p.id] = puntosBrutos;
    window.pasoBalanzaActual = 0;

    if (indiceActual === PREGUNTAS_DB.length - 1) {
      finalizarYMostrarDiagnostico();
    } else {
      indiceActual++;
      renderizarContenido();
    }
  }

  function finalizarYMostrarDiagnostico() {
    let totalPuntos = 0;
    Object.keys(puntosFinales).forEach(id => { totalPuntos += (puntosFinales[id] || 0); });
    
    const totalPreguntas = PREGUNTAS_DB.length || 1;
    const proporcion = totalPuntos / totalPreguntas;
    const notaExacta = 1 + (proporcion * 9);
    const notaFinal = Math.floor(notaExacta);

    let listaConceptos = [];
    if (window.erroresAcumulados) {
      Object.keys(window.erroresAcumulados).forEach(idPreg => {
        const msjs = window.erroresAcumulados[idPreg];
        if (Array.isArray(msjs)) {
          msjs.forEach(m => { 
            if (m && !listaConceptos.includes(m) && !m.includes("{")) {
              listaConceptos.push(m); 
            }
          });
        }
      });
    }

    const esAprobado = notaFinal >= 6;
    const render = document.getElementById('render');
    const btnSig = document.getElementById('btnSig');
    if (btnSig) btnSig.style.display = 'none';

    let htmlReporte = `<div style="text-align:center; padding: 20px; font-family: Arial, sans-serif;">`;

    if (esAprobado) {
      htmlReporte += `
        <h2 style="color: #28a745; margin-bottom: 10px;">🎉 ¡Felicitaciones, aprobaste el examen!</h2>
        <p style="font-size: 1.4rem; font-weight: bold; margin-bottom: 15px;">
          Tu nota final: <span style="font-size: 2.5rem; color: #28a745;">${notaFinal}</span> / 10
        </p>
        <p style="color: #555;">Tus respuestas y el procedimiento fueron registrados correctamente.</p>`;
      
      if (listaConceptos.length > 0) {
        htmlReporte += `
          <div style="text-align:left; background:#f8f9fa; padding:15px; border-radius:8px; margin-top:20px; border: 1px solid #ced4da;">
            <strong style="color: #333; font-size: 1.05rem;">📌 Detalles a tener en cuenta / revisar:</strong>
            <ul style="margin-top: 10px; color: #495057; line-height: 1.5;">
              ${listaConceptos.map(c => `<li>${renderizarContenidoInteligente(c)}</li>`).join('')}
            </ul>
          </div>`;
      }
    } else {
      htmlReporte += `
        <h2 style="color: #dc3545; margin-bottom: 10px;">📚 Examen no aprobado</h2>
        <p style="font-size: 1.4rem; font-weight: bold; margin-bottom: 15px;">
          Tu nota final: <span style="font-size: 2.5rem; color: #dc3545;">${notaFinal}</span> / 10
        </p>
        <p style="color: #555;">Identificando los siguientes temas vas a preparar mucho mejor el recuperatorio:</p>
        
        <div style="text-align:left; background:#fff3cd; color:#856404; padding:15px; border-radius:8px; margin-top:20px; border:1px solid #ffeeba;">
          <strong style="font-size: 1.05rem;">⚠️ Conceptos clave a repasar:</strong>
          <ul style="margin-top:10px; line-height: 1.5;">
            ${listaConceptos.length > 0 ? listaConceptos.map(c => `<li>${renderizarContenidoInteligente(c)}</li>`).join('') : '<li>Repasar el procedimiento general y las propiedades aplicadas en cada paso.</li>'}
          </ul>
        </div>`;
    }

    htmlReporte += `</div>`;
    if (render) render.innerHTML = htmlReporte;

    if (window.MathJax && MathJax.typesetPromise && render) {
      window.MathJax.typesetPromise([render]);
    }

    let nomReal = capturarNombreAlumnoActivo();
    let infoAlumno = (typeof datosAlumno !== 'undefined') ? datosAlumno : (window.datosAlumno || {});
    infoAlumno.nombre = nomReal || window.nombreAlumnoSeleccionado || "Alumno no especificado";

    let fugas = (typeof contadorFugas !== 'undefined') ? contadorFugas : (window.contadorFugas || 0);
    let detalleFugas = (typeof historialFugas !== 'undefined') ? historialFugas : (window.historialFugas || []);

    if (typeof google !== 'undefined' && google.script && google.script.run) {
      google.script.run.procesarRespuestasFinales({
        respuestas: respuestasFinales,
        puntos: puntosFinales,
        nota: notaFinal,
        errores: listaConceptos,
        datosAlumno: infoAlumno,
        nombreAlumno: nomReal,
        fugasCount: fugas,
        fugasDetalle: detalleFugas
      });
    }
  }

  function validarEM() {
    const p = PREGUNTAS_DB[indiceActual];
    let todas = true;
    if (p.llaves && Array.isArray(p.llaves)) {
      p.llaves.forEach((_, idx) => { if (!document.getElementById(`em_sel_${idx}`).value) todas = false; });
    }
    document.getElementById('btnSig').disabled = !todas;
  }

  function marcarVF(fila, valor) {
    window.respuestasVFActual[fila] = valor;
    document.getElementById(`v_${fila}`).classList.toggle('seleccionado', valor === 'V');
    document.getElementById(`f_${fila}`).classList.toggle('seleccionado', valor === 'F');
    document.getElementById('btnSig').disabled = (Object.keys(window.respuestasVFActual).length !== PREGUNTAS_DB[indiceActual].subPreguntas.length);
  }

  function seleccionarVI(url, idx) {
    window.seleccionVIActual = url;
    document.querySelectorAll('.opcion-imagen').forEach(el => el.classList.remove('seleccionada'));
    document.getElementById(`img_${idx}`).classList.add('seleccionada');
    document.getElementById('btnSig').disabled = false;
  }

  function seleccionarRM(el, idxOp) {
    const p = PREGUNTAS_DB[indiceActual];
    window.seleccionRMActual = p.opciones[idxOp];
    document.querySelectorAll('.tarjeta-rm').forEach(t => t.classList.remove('seleccionada'));
    el.classList.add('seleccionada');
    document.getElementById('btnSig').disabled = false;
  }

  function seleccionarCV(el, idxOp) {
    const p = PREGUNTAS_DB[indiceActual];
    const valor = p.opciones[idxOp];
    if (!Array.isArray(window.seleccionCVActual)) window.seleccionCVActual = [];

    if (window.seleccionCVActual.includes(valor)) {
      window.seleccionCVActual = window.seleccionCVActual.filter(v => v !== valor);
      el.classList.remove('seleccionada');
    } else {
      window.seleccionCVActual.push(valor);
      el.classList.add('seleccionada');
    }
    document.getElementById('btnSig').disabled = (window.seleccionCVActual.length === 0);
  }

  function validarSeleccion() {
    document.getElementById('btnSig').disabled = (document.getElementById('opcionSeleccionada').value === "");
  }

  function validarInputsFR1() {
    const res = document.getElementById('fr1_res') ? document.getElementById('fr1_res').value.trim() : "";
    if (PREGUNTAS_DB[indiceActual]) respuestasFinales[PREGUNTAS_DB[indiceActual].id] = res;
    document.getElementById('btnSig').disabled = (res === "");
  }

  function validarInputsBALANZA() {
    const inputRes = document.getElementById('balanza_res');
    const btnSig = document.getElementById('btnSig');
    const p = PREGUNTAS_DB[indiceActual];
    const res = inputRes ? inputRes.value.trim() : "";
    
    if (p) {
      if (typeof window.respuestasFinales === 'undefined') window.respuestasFinales = {};
      window.respuestasFinales[p.id] = res;
    }
    if (btnSig) btnSig.disabled = (res === "");
  }

  function autocompletarResultadoFinal(val) {
    const inputRes = document.getElementById('balanza_res');
    if (inputRes) {
      inputRes.value = val;
      validarInputsBALANZA();
    }
  }
