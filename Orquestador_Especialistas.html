/**
 * Función puente que llama JS_Core.html vía google.script.run
 */
function consultarProfe(mensajeAlumno, pregActual) {
  try {
    var enunciado = "";
    if (pregActual) {
      enunciado = pregActual.enunciado || pregActual.pregunta || pregActual.consina || pregActual.A || "";
    }

    var anio = 3;
    if (pregActual && (pregActual.anio || pregActual.curso)) {
      anio = parseInt(pregActual.anio || pregActual.curso, 10) || 3;
    }

    var historial = [
      { rol: "alumno", mensaje: mensajeAlumno }
    ];

    return consultarTutorIA(enunciado, mensajeAlumno, historial, anio);

  } catch (err) {
    return "Error al procesar la consulta: " + err.message;
  }
}

/**
 * Lógica principal del tutor con conexión a la API de Groq
 */
function consultarTutorIA(enunciado, mensajeAlumno, historial, anio) {
  try {
    const GROQ_API_KEY = PropertiesService.getScriptProperties().getProperty('GROQ_API_KEY');
    
    if (!GROQ_API_KEY) {
      return "Error: No se ha configurado la clave GROQ_API_KEY en Script Properties.";
    }

    // 1. Detección de materia
    const enunciadoLower = (enunciado || "").toLowerCase();
    const palabrasFisica = ["velocidad", "aceleración", "fuerza", "masa", "metros", "segundos", "newton", "mru", "mruv", "caída libre", "gravedad", "energía", "trabajo", "presión", "calor", "temperatura", "dinámica", "cinemática"];
    let esFisica = palabrasFisica.some(palabra => enunciadoLower.includes(palabra));
    
    // 2. Prompt del sistema
    let promptSistema = `Sos un profesor de escuela técnica en Argentina. Tratás a los alumnos de "vos", con paciencia, cercanía y un poco de humor, pero exigiendo rigor técnico. `;
    promptSistema += `El alumno está en ${anio}° año. `;
    
    if (esFisica) {
      promptSistema += `MATERIA: FÍSICA.\n`;
      promptSistema += `- Usá fórmulas clásicas (v=d/t, F=m.a, Ec=1/2 m v^2, etc.).\n`;
      promptSistema += `- SIEMPRE mencioná las unidades (m, s, m/s, N, kg, J) en cada paso.\n`;
      promptSistema += `- Ayudá al alumno a identificar los DATOS y a elegir la FÓRMULA correcta antes de calcular.\n`;
    } else {
      promptSistema += `MATERIA: MATEMÁTICA (Nivel ${anio}°).\n`;
      if (anio <= 2) {
        promptSistema += `- Nivel Básico: Lenguaje muy simple. Usá ejemplos de la vida real. Explicá conceptos como suma, resta, ecuaciones simples y geometría básica.\n`;
      } else if (anio == 3) {
        promptSistema += `- Nivel Intermedio: Sistemas de ecuaciones, funciones lineales y cuadráticas.\n`;
        promptSistema += `- Para sistemas: Usá llaves { x+y=1, 2x-y=3 } o el método de sustitución/igualación.\n`;
        promptSistema += `- Para matrices (si las hay): Representá con corchetes [ [1, 2], [3, 4] ].\n`;
      } else {
        promptSistema += `- Nivel Avanzado (Análisis Matemático): Usá cálculo diferencial e integral, límites y matrices avanzadas.\n`;
      }
    }

    // 3. Reglas de notación
    promptSistema += `\nNOTACIÓN Y SÍMBOLOS (MUY IMPORTANTE):\n`;
    promptSistema += `- DECIMALES: En Argentina usamos COMA (3,5). NUNCA uses punto para decimales.\n`;
    promptSistema += `- MULTIPLICACIÓN: El alumno usará el punto '.', el asterisco '*' o juntará términos (3x). Entendé todos como multiplicación. Vos usá '*' o juntá términos (3x) para no confundir con decimales.\n`;
    promptSistema += `- SÍMBOLOS DEL TECLADO DEL ALUMNO:\n`;
    promptSistema += `  * Raíz cuadrada: (número)\n`;
    promptSistema += `  * Raíz enésima: raiz(indice, número)\n`;
    promptSistema += `  * Potencias: base^(exponente) -> x^(2), 2^(10)\n`;
    promptSistema += `  * Fracciones: numerador/denominador -> 2/3, (x+1)/(x-2)\n`;
    promptSistema += `  * Integrales: (función)dx o integral(función)dx\n`;
    promptSistema += `  * Derivadas: f'(x) o derivada(f, x)\n`;
    promptSistema += `  * Límites: lim(x→valor). Si es lateral: lim(x→2+) derecha, lim(x→2-) izquierda. Infinito: lim(x→∞)\n`;
    promptSistema += `  * Matrices: [[a, b], [c, d]]\n`;
    promptSistema += `  * Sistemas: { ecuacion1, ecuacion2 }\n`;

    // 4. Reglas pedagógicas
    promptSistema += `\nREGLAS DE ORO:\n`;
    promptSistema += `1. NUNCA des la respuesta final ni resuelvas el ejercicio por él. Si el alumno insiste, decile: "Te creo que podés, intentá este paso vos solo".\n`;
    promptSistema += `2. Dividí en pasos MUY pequeños. Una pregunta a la vez. Esperá la respuesta antes de avanzar.\n`;
    promptSistema += `3. Si se equivoca, NUNCA digas "está mal". Usá preguntas guía como: "¿Revisaste el signo?", "¿Qué pasa si multiplicás cruzado?", "¿Te acordás qué pasa con los negativos?".\n`;
    promptSistema += `4. Tu respuesta debe ser MÁXIMO 3 líneas. Corta y al pie.\n`;
    promptSistema += `5. Interpretá el lenguaje informal del alumno (ej: "raiz de 9", "menos 7", "la x de allá").\n`;
    promptSistema += `6. Cuando el alumno acierte, felicitá brevemente: "¡Exacto!", "¡Dale!", "¡Bien ahí!". No exageres con los elogios.\n`;
    promptSistema += `7. Si el alumno parece frustrado, bajá la dificultad del paso siguiente y decile: "Tranqui, vamos más despacio. Empecemos por esto más fácil..."\n`;
    promptSistema += `8. Usá analogías simples cuando sirva.\n`;
    promptSistema += `9. NO uses emojis excesivos. Máximo uno por mensaje.\n`;
    promptSistema += `10. Si después de 2 intentos el alumno no avanza, ofrecé una pista más concreta sin dar la respuesta.\n`;
    promptSistema += `11. FRASE PERSONALIZADA DEL PROFE: Si comete un error recurrente del historial, podés decirle: "Jajaja, te avisé 😅".\n`;
    promptSistema += `12. LÍMITE DE TEMA: Respondé SOLO sobre el ejercicio actual del TP.\n`;

    // 5. Contexto de usuario
    let promptUsuario = `EJERCICIO: ${enunciado ? enunciado.replace(/\$/g, '') : 'Sin enunciado'}\n`;
    promptUsuario += `HISTORIAL:\n${historial && historial.length > 0 ? historial.map(h => `${h.rol}:${h.mensaje}`).join('\n') : 'Inicio del chat'}\n`;
    
    if (!historial || historial.length <= 1) {
      promptUsuario += "El alumno envía su primer mensaje. Respondé de forma breve y cálida, y guiálo con el primer paso del ejercicio.";
    } else {
      promptUsuario += "Respondé al último mensaje del alumno siguiendo las reglas de oro. Si lo que dijo está bien, avanzá al siguiente paso. Si está mal, guiálo con una pregunta.";
    }

    // 6. Petición HTTP a Groq
    const url = "https://api.groq.com/openai/v1/chat/completions";
    const payload = {
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: promptSistema },
        { role: "user", content: promptUsuario }
      ],
      temperature: 0.7,
      max_tokens: 300
    };
    
    const options = {
      method: 'post',
      contentType: 'application/json',
      headers: { 'Authorization': 'Bearer ' + GROQ_API_KEY },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    
    if (responseCode !== 200) {
      return "Error de conexión con el Tutor IA (Código: " + responseCode + ")";
    }
    
    const data = JSON.parse(response.getContentText());
    return data.choices[0].message.content;
    
  } catch (e) {
    return "Error interno: " + e.message;
  }
}


function testAutorizacion() {
  // Esta función es solo para forzar la autorización dee Groq
  const url = "https://api.groq.com/openai/v1/chat/completions";
  const payload = {
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: "Hola" }],
    max_tokens: 10
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + PropertiesService.getScriptProperties().getProperty('GROQ_API_KEY')
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  UrlFetchApp.fetch(url, options);
  Logger.log("Autorización exitosa");
}
