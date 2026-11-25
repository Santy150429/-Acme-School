
import { obtenerExamenes, obtenerResultados, obtenerSesion, guardarResultado } from "../storage/database.js";
import { escapeHtml } from "../utils/escape.js";

export function iniciarModuloResolucion(mostrarMensaje) {
  const catalogoDiv = document.getElementById("lista-examenes");
  const seccionResultados = document.getElementById("seccion-resultados");
  const tbodyResultados = document.getElementById("tabla-resultados");
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

  function puedeVerResultados() {
    const sesion = obtenerSesion();
    if (!sesion) return false;
    return sesion.cargo === "Administrativo" || sesion.cargo === "Docente";
  }

  function renderResultados() {
    if (!seccionResultados || !tbodyResultados) return;

    if (!puedeVerResultados()) {
      seccionResultados.classList.add("oculto");
      tbodyResultados.innerHTML = "";
      return;
    }

    seccionResultados.classList.remove("oculto");
    const resultados = obtenerResultados();

    if (resultados.length === 0) {
      tbodyResultados.innerHTML = `<tr><td colspan="6" class="vacio">Aún no hay exámenes presentados.</td></tr>`;
      return;
    }

    // Se invierte una copia de la lista para mostrar primero los más recientes.
    tbodyResultados.innerHTML = [...resultados]
      .reverse()
      .map(
        (res) => `
          <tr>
            <td>${escapeHtml(res.identificacionEstudiante)}</td>
            <td>${escapeHtml(res.nombreEstudiante)}</td>
            <td>${escapeHtml(res.tituloExamen)}</td>
            <td>${escapeHtml(res.porcentajeObtenido)}% (${escapeHtml(res.aciertos)} de ${escapeHtml(res.totalPreguntas)})</td>
            <td>
              <span class="${res.aprobado ? "aprobado-texto" : "reprobado-texto"}">
                ${res.aprobado ? "Aprobado" : "No aprobado"}
              </span>
            </td>
            <td>${escapeHtml(new Date(res.fecha).toLocaleString("es-CO"))}</td>
          </tr>
        `
      )
      .join("");
  }

  function mostrarPaso(paso) {
    catalogoDiv.classList.toggle("oculto", paso !== "catalogo");
    registroDiv.classList.toggle("oculto", paso !== "registro");
    pantallaExamenDiv.classList.toggle("oculto", paso !== "examen");
    pantallaResultadoDiv.classList.toggle("oculto", paso !== "resultado");

    if (paso === "catalogo") {
      renderResultados();
    } else if (seccionResultados) {
      seccionResultados.classList.add("oculto");
    }

    window.scrollTo({ top: 0 });

    // Se mueve el foco al inicio de cada paso para quienes usan teclado o lector de pantalla.
    if (paso === "registro") estudianteIdInput.focus();
    if (paso === "examen") tituloExamenActivo.focus();
    if (paso === "resultado") tituloResultado.focus();
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
      catalogoDiv.innerHTML = `<div class="tarjeta"><p>No hay exámenes disponibles por el momento.</p></div>`;
      return;
    }

    examenes.forEach((examen) => {
      const card = document.createElement("exam-card");
      card.datos = examen;
      card.addEventListener("seleccionar-examen", (ev) => {
        examenSeleccionado = ev.detail.examen;
        examenElegidoTexto.textContent = `${examenSeleccionado.titulo} (${examenSeleccionado.tiempoMinutos} min - Mínimo ${examenSeleccionado.porcentajeAprobacion}%)`;
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
      const tarjeta = document.createElement("fieldset");
      tarjeta.className = "tarjeta-pregunta";

      const opcionesHtml = preg.opciones
        .map(
          (op) => `
            <label class="opcion-label">
              <input type="radio" name="pregunta-${idx}" value="${escapeHtml(op.id)}" />
              <span>${escapeHtml(op.texto)}</span>
            </label>
          `
        )
        .join("");

      tarjeta.innerHTML = `
        <legend>${idx + 1}. ${escapeHtml(preg.texto)}</legend>
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

    preguntas.forEach((preg, idx) => {
      const seleccionada = formResolver.querySelector(`input[name="pregunta-${idx}"]:checked`);
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
    const requerido = Number(examenSeleccionado.porcentajeAprobacion);
    // Un decimal: el porcentaje mostrado y la decisión de aprobar siempre coinciden.
    const porcentaje = total > 0 ? Number(((aciertos / total) * 100).toFixed(1)) : 0;
    const aprobo = porcentaje >= requerido;

    guardarResultado({
      codigoExamen: examenSeleccionado.codigo,
      tituloExamen: examenSeleccionado.titulo,
      identificacionEstudiante: datosEstudiante.identificacion,
      nombreEstudiante: datosEstudiante.nombre,
      aciertos,
      totalPreguntas: total,
      porcentajeObtenido: porcentaje,
      porcentajeRequerido: requerido,
      aprobado: aprobo,
      respuestas: respuestasRegistradas,
      fecha: new Date().toISOString()
    });

    tituloResultado.textContent = aprobo ? "¡Examen aprobado!" : "Examen no aprobado";

    detalleResultado.innerHTML = `
      ${motivoAutomatico ? `<p><strong>El tiempo se agotó y el examen se envió automáticamente.</strong></p>` : ""}
      <div class="resultado-porcentaje ${aprobo ? "ok" : "error"}">${porcentaje}%</div>
      <p>
        <span class="${aprobo ? "aprobado-texto" : "reprobado-texto"}">${aprobo ? "Aprobado" : "No aprobado"}</span>
      </p>
      <div class="resultado-datos">
        <p><strong>Estudiante:</strong> ${escapeHtml(datosEstudiante.nombre)} (ID: ${escapeHtml(datosEstudiante.identificacion)})</p>
        <p><strong>Examen:</strong> ${escapeHtml(examenSeleccionado.titulo)}</p>
        <p><strong>Respuestas acertadas:</strong> ${aciertos} de ${total}</p>
        <p><strong>Porcentaje requerido:</strong> ${requerido}%</p>
      </div>
    `;

    mostrarPaso("resultado");
    mostrarMensaje(
      aprobo ? "Felicitaciones, aprobaste el examen" : "No alcanzaste el porcentaje mínimo",
      aprobo ? "ok" : "error"
    );
  }

  btnVolverCatalogo.addEventListener("click", renderCatalogo);

  formEstudiante.addEventListener("submit", (e) => {
    e.preventDefault();
    const identificacion = estudianteIdInput.value.trim();
    const nombre = estudianteNombreInput.value.trim();

    if (!identificacion || !nombre) {
      mostrarMensaje("Ingresa tu número de identificación y nombre completo", "error");
      return;
    }

    datosEstudiante = { identificacion, nombre };
    examenTerminado = false;

    tituloExamenActivo.textContent = examenSeleccionado.titulo;
    infoExamenActivo.textContent = `Estudiante: ${nombre} (${identificacion}) | Total de preguntas: ${(examenSeleccionado.preguntas || []).length} | Aprobación mínima: ${examenSeleccionado.porcentajeAprobacion}%`;

    renderPreguntasExamen();
    mostrarPaso("examen");
    relojExamen.iniciar(examenSeleccionado.tiempoMinutos);
  });

  formResolver.addEventListener("submit", (e) => {
    e.preventDefault();

    const total = (examenSeleccionado.preguntas || []).length;
    const respondidas = formResolver.querySelectorAll("input[type='radio']:checked").length;
    const sinResponder = total - respondidas;

    if (sinResponder > 0) {
      const mensaje = `Te falta${sinResponder === 1 ? "" : "n"} ${sinResponder} pregunta${sinResponder === 1 ? "" : "s"} por responder. ¿Terminar de todos modos?`;
      if (!confirm(mensaje)) return;
    }

    calificarYFinalizar(false);
  });

  relojExamen.addEventListener("tiempo-agotado", () => {
    calificarYFinalizar(true);
  });

  btnFinalExamen.addEventListener("click", renderCatalogo);

  return {
    refrescarCatalogo: renderCatalogo,
    // true mientras el estudiante está resolviendo (reloj corriendo y sin terminar).
    examenEnCurso: () => Boolean(examenSeleccionado && datosEstudiante && !examenTerminado)
  };
}