
import { obtenerExamenes, guardarResultado } from "../storage/database.js";

export function iniciarModuloResolucion(mostrarMensaje) {
  const catalogoDiv = document.getElementById("lista-examenes");
  const registroDiv = document.getElementById("registro-estudiante");
  const examenElegidoTexto = document.getElementById("examen-elegido-texto");
  const formEstudiante = document.getElementById("form-estudiante");
  const estudianteIdInput = document.getElementById("estudiante-id");
  const estudianteNombreInput = document.getElementById("estudiante-nombre");
  const btnVolverCatalogo = document.getElementById("btn-volver-catalogo");

  const pantallaExamenDiv = document.getElementById("pantalla-examen");
  const tituloExamenActivo = document.getElementById("titulo-examen-activo");
  const infoExamenActivo = document.getElementById("info-examen-activo");
  const relojExamen = document.getElementById("reloj-examen");
  const formResolver = document.getElementById("form-resolver-examen");
  const preguntasResolverDiv = document.getElementById("preguntas-resolver");

  const pantallaResultadoDiv = document.getElementById("pantalla-resultado");
  const tituloResultado = document.getElementById("titulo-resultado");
  const detalleResultado = document.getElementById("detalle-resultado");
  const btnFinalExamen = document.getElementById("btn-final-examen");

  let examenSeleccionado = null;
  let datosEstudiante = null;
  let examenTerminado = false;

  function mostrarPaso(paso) {
    catalogoDiv.classList.add("oculto");
    registroDiv.classList.add("oculto");
    pantallaExamenDiv.classList.add("oculto");
    pantallaResultadoDiv.classList.add("oculto");

    if (paso === "catalogo") catalogoDiv.classList.remove("oculto");
    if (paso === "registro") registroDiv.classList.remove("oculto");
    if (paso === "examen") pantallaExamenDiv.classList.remove("oculto");
    if (paso === "resultado") pantallaResultadoDiv.classList.remove("oculto");
  }

  function renderCatalogo() {
    relojExamen.detener();
    examenSeleccionado = null;
    datosEstudiante = null;
    examenTerminado = false;
    mostrarPaso("catalogo");

    const examenes = obtenerExamenes();
    catalogoDiv.innerHTML = "";

    if (examenes.length === 0) {
      catalogoDiv.innerHTML = `<div class="tarjeta"><p>No hay examenes disponibles por el momento.</p></div>`;
      return;
    }

    examenes.forEach((examen) => {
      const card = document.createElement("exam-card");
      card.datos = examen;
      card.addEventListener("seleccionar-examen", (ev) => {
        examenSeleccionado = ev.detail.examen;
        examenElegidoTexto.textContent = `${examenSeleccionado.titulo} (${examenSeleccionado.tiempoMinutos} min - Minimo ${examenSeleccionado.porcentajeAprobacion}%)`;
        formEstudiante.reset();
        mostrarPaso("registro");
      });
      catalogoDiv.appendChild(card);
    });
  }

  function renderPreguntasExamen() {
    const preguntas = examenSeleccionado.preguntas || [];
    preguntasResolverDiv.innerHTML = "";

    preguntas.forEach((preg, idx) => {
      const tarjeta = document.createElement("div");
      tarjeta.className = "tarjeta-pregunta";

      const opcionesHtml = preg.opciones
        .map(
          (op) => `
            <label class="opcion-label">
              <input
                type="radio"
                name="respuesta-${preg.id}"
                value="${op.id}"
              />
              <span>${op.texto}</span>
            </label>
          `
        )
        .join("");

      tarjeta.innerHTML = `
        <p style="margin:0 0 8px;font-weight:bold;">${idx + 1}. ${preg.texto}</p>
        ${opcionesHtml}
      `;

      preguntasResolverDiv.appendChild(tarjeta);
    });
  }

  function calificarYFinalizar(motivoAutomatico = false) {
    if (examenTerminado || !examenSeleccionado) return;
    examenTerminado = true;
    relojExamen.detener();

    const preguntas = examenSeleccionado.preguntas || [];
    let aciertos = 0;
    const respuestasRegistradas = [];

    preguntas.forEach((preg) => {
      const seleccionada = formResolver.querySelector(`input[name="respuesta-${preg.id}"]:checked`);
      const opcionId = seleccionada ? seleccionada.value : null;
      const opcionObj = preg.opciones.find((o) => o.id === opcionId) || null;
      const esCorrecta = Boolean(opcionObj && opcionObj.correcta);

      if (esCorrecta) aciertos += 1;

      respuestasRegistradas.push({
        preguntaId: preg.id,
        opcionSeleccionadaId: opcionId,
        correcta: esCorrecta
      });
    });

    const total = preguntas.length;
    const porcentaje = total > 0 ? Math.round((aciertos / total) * 100) : 0;
    const aprobo = porcentaje >= Number(examenSeleccionado.porcentajeAprobacion);

    guardarResultado({
      codigoExamen: examenSeleccionado.codigo,
      tituloExamen: examenSeleccionado.titulo,
      identificacionEstudiante: datosEstudiante.identificacion,
      nombreEstudiante: datosEstudiante.nombre,
      aciertos,
      totalPreguntas: total,
      porcentajeObtenido: porcentaje,
      porcentajeRequerido: Number(examenSeleccionado.porcentajeAprobacion),
      aprobado: aprobo,
      respuestas: respuestasRegistradas,
      fecha: new Date().toISOString()
    });

    tituloResultado.innerHTML = aprobo
      ? `Examen APROBADO <span class="aprobado-texto">Aprobado</span>`
      : `Examen NO APROBADO <span class="reprobado-texto">No aprobado</span>`;

    detalleResultado.innerHTML = `
      ${motivoAutomatico ? "<p><strong>El tiempo se agoto y el examen se envio automaticamente.</strong></p>" : ""}
      <p><strong>Estudiante:</strong> ${datosEstudiante.nombre} (ID: ${datosEstudiante.identificacion})</p>
      <p><strong>Examen:</strong> ${examenSeleccionado.titulo}</p>
      <p><strong>Aciertos:</strong> ${aciertos} de ${total}</p>
      <p><strong>Porcentaje obtenido:</strong> ${porcentaje}% (Requerido: ${examenSeleccionado.porcentajeAprobacion}%)</p>
    `;

    mostrarPaso("resultado");
    mostrarMensaje(aprobo ? "Felicitaciones, aprobaste el examen" : "No alcanzaste el porcentaje minimo", aprobo ? "ok" : "error");
  }

  btnVolverCatalogo.addEventListener("click", renderCatalogo);

  formEstudiante.addEventListener("submit", (e) => {
    e.preventDefault();
    const identificacion = estudianteIdInput.value.trim();
    const nombre = estudianteNombreInput.value.trim();

    if (!identificacion || !nombre) {
      mostrarMensaje("Ingresa tu numero de identificacion y nombre completo", "error");
      return;
    }

    datosEstudiante = { identificacion, nombre };
    examenTerminado = false;

    tituloExamenActivo.textContent = examenSeleccionado.titulo;
    infoExamenActivo.textContent = `Estudiante: ${nombre} (${identificacion}) | Total preguntas: ${(examenSeleccionado.preguntas || []).length} | Aprobacion minima: ${examenSeleccionado.porcentajeAprobacion}%`;

    renderPreguntasExamen();
    mostrarPaso("examen");
    relojExamen.iniciar(examenSeleccionado.tiempoMinutos);
  });

  formResolver.addEventListener("submit", (e) => {
    e.preventDefault();
    calificarYFinalizar(false);
  });

  relojExamen.addEventListener("tiempo-agotado", () => {
    calificarYFinalizar(true);
  });

  btnFinalExamen.addEventListener("click", renderCatalogo);

  return {
    refrescarCatalogo: renderCatalogo
  };
}