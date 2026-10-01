/**
 * 013_FR1: Fracciones Interactivas (Paso a paso)
 * Lee del Excel:
 *  - Columna K (índice 10): Enunciado
 *  - Columna L (índice 11): Configuración de pasos (Ej: "SUMA,,,mcm:7,,,Equivalentes:12,4,20")
 *  - Columna M (índice 12): Respuesta final simplificada
 */
function procesarModular_FR1(fila, i) {
  try {
    var enunciadoRaw = (fila && fila[10]) ? fila[10].toString().trim() : "";
    var configRawStr = (fila && fila[11]) ? fila[11].toString() : "";
    var respuestaCorrecta = (fila && fila[12]) ? fila[12].toString().trim() : "";

    var configRaw = configRawStr ? configRawStr.split(',,,') : [];
    
    var tipoOperacion = "SUMA";
    if (configRaw.length > 0 && configRaw[0].trim() !== "") {
      tipoOperacion = configRaw[0].trim().toUpperCase();
    }

    var pasos = {};
    for (var j = 1; j < configRaw.length; j++) {
      var item = configRaw[j];
      if (item && item.indexOf(':') !== -1) {
        var partes = item.split(':');
        var clave = partes[0].trim().toLowerCase();
        var valor = partes[1].trim();
        pasos[clave] = valor;
      }
    }

    return {
      id: "pre_fr1_" + (i || 0),
      tipo: "FR1",
      enunciado: enunciadoRaw,
      operacion: tipoOperacion,
      pasos: pasos,
      respuestasCorrectas: [respuestaCorrecta]
    };

  } catch (e) {
    // Si falla algo en la fila, devuelve una pregunta por defecto limpia para no congelar la app
    return { 
      id: "error_fr1_" + (i || 0), 
      tipo: "FR1",
      enunciado: "Ejercicio con formato a revisar",
      operacion: "SUMA",
      pasos: {},
      respuestasCorrectas: [""] 
    };
  }
}

function evaluarModular_FR1(pregunta, respuestaAlumno) {
  try {
    var resAlumno = "";
    if (typeof respuestaAlumno === 'object' && respuestaAlumno !== null) {
      resAlumno = respuestaAlumno.resultado || "";
    } else if (respuestaAlumno) {
      resAlumno = respuestaAlumno.toString();
    }

    var correcta = (pregunta && pregunta.respuestasCorrectas && pregunta.respuestasCorrectas[0]) 
                   ? pregunta.respuestasCorrectas[0] 
                   : "";

    return resAlumno.trim().replace(/\s+/g, '') === correcta.trim().replace(/\s+/g, '');
  } catch (err) {
    return false;
  }
}
