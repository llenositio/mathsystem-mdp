<script>

  // Cuenta las veces que pediste ayuda en el ejercicio actual
  let consultasUsadas = 0; 
// JS_Utilidades
  function normalizarMatematica(texto) {
    if (!texto) return "";
    
    let t = texto.toString().toLowerCase();

    // Eliminar caracteres escapados por LaTeX
    t = t.replace(/\x08/g, "b");
    t = t.replace(/\x0c/g, "f");
    t = t.replace(/\x0d/g, "r");
    t = t.replace(/\x09/g, "t");
    t = t.replace(/[\x00-\x1F\x7F-\x9F]/g, "");

    // Normalizar LaTeX
    if (t.startsWith("egin")) t = "begin" + t.slice(4);
    
    // Quitar todo lo que no sea alfanumérico
    t = t.replace(/\\/g, '').replace(/[^a-z0-9]/g, '');

    return t;
  }

  function renderizarContenidoInteligente(dato, esPrincipal = false) {
    if (!dato) return "";
    let d = dato.toString().trim();

    const regexUrl = /(https?:\/\/[^\s]+)/g;
    const tieneUrl = d.match(regexUrl);

    if (tieneUrl) {
      const url = tieneUrl[0];
      const textoLimpio = d.replace(url, "").trim();
      
      const estiloImg = esPrincipal 
        ? `width:100%; max-width:600px; display:block; margin: 15px auto; border-radius:10px; box-shadow: 0 4px 10px rgba(0,0,0,0.2);` 
        : `max-width:100%; max-height:120px; border-radius:5px;`;

      return `
        <div>
          ${textoLimpio ? `<p style="margin-bottom:10px;">${textoLimpio}</p>` : ""}
          <img src="${url}" style="${estiloImg}">
        </div>
      `;
    }

    return `<span>${d}</span>`;
  }

  function procesarArchivo(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      window.archivoEnBase64 = {
        base64: e.target.result.split(",")[1],
        mimeType: file.type,
        nombre: file.name
      };
      document.getElementById('textoArchivo').innerText = "✅ Archivo cargado";
      document.getElementById('fileLabel').innerText = "Adjunto: " + file.name;
      document.getElementById('btnSig').disabled = false;
    };
    reader.readAsDataURL(file);
  }
</script>
