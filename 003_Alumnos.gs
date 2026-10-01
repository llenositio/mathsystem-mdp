// --- 003_Alumnos.gs (Módulo compartido - ACTUALIZADO PARA ID CORTO) ---

function especialista_Alumnos(ss, partes) {
  try {
    const hoja = ss.getSheetByName("Alumnos");
    const datos = hoja.getDataRange().getValues();
    
    // IMPORTANTE: Al quitar el TIPO del link, las posiciones cambian:
    // ID: 001 / UR / ET24DE17 / 2 / 6 / ...
    // Ind: [0] / [1] / [2]    / [3]/ [4]/ ...
    
    const cursoBusqueda = String(partes[3] || "").trim();
    const divBusqueda = String(partes[4] || "").trim();
    
    // Filtramos: Columna B (índice 1) = Curso, Columna C (índice 2) = División
    let lista = datos.slice(1)
      .filter(fila => {
        let cursoFila = String(fila[1]).trim();
        let divFila = String(fila[2]).trim();
        // Usamos comparación exacta o include según prefieras, aquí mantengo lógica flexible
        return cursoFila.includes(cursoBusqueda) && divFila.includes(divBusqueda);
      })
      .map(fila => fila[0]); // Columna A: Nombre del Alumno

    if (lista.length === 0) {
      console.warn("Filtro vacío para " + cursoBusqueda + "-" + divBusqueda + ". Cargando todos.");
      lista = datos.slice(1).map(fila => fila[0]);
    }
    
    return lista.sort();
  } catch (e) {
    return ["Error al cargar alumnos: " + e.toString()];
  }
}
