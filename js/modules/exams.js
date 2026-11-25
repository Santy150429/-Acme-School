
import { obtenerExamenes, guardarExamenes } from "../storage/database.js";
import { escapeHtml } from "../utils/escape.js";

function nuevoId(prefijo) {
  return `${prefijo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function crearPreguntaVacia() {
  return {
    id: nuevoId("preg"),
    texto: "",
    opciones: [
      { id: nuevoId("op"), texto: "", correcta: true },
      { id: nuevoId("op"), texto: "", correcta: false }
    ]
  };
}

export function iniciarModuloExamenes(mostrarMensaje, alCambiarExamenes) {
  const form = document.getElementById("form-examen");
  const tituloForm = document.getElementById("titulo-form-examen");
  const editandoCodigoInput = document.getElementById("examen-editando-codigo");
  const btnCancelar = document.getElementById("btn-cancelar-examen");
  const btnAgregarPregunta = document.getElementById("btn-agregar-pregunta");
  const contenedorPreguntas = document.getElementById("lista-constructor-preguntas");
  const tbody = document.getElementById("tabla-examenes");

  const codigoInput = document.getElementById("examen-codigo");
  const tituloInput = document.getElementById("examen-titulo");
  const tiempoInput = document.getElementById("examen-tiempo");
  const aprobacionInput = document.getElementById("examen-aprobacion");
  const descripcionInput = document.getElementById("examen-descripcion");

  let borradorPreguntas = [crearPreguntaVacia()];

  function notificarCambio() {
    if (typeof alCambiarExamenes === "function") alCambiarExamenes();
  }

  /* ---------- Constructor de preguntas ---------- */

  function renderConstructorPreguntas() {
    contenedorPreguntas.innerHTML = borradorPreguntas
      .map((preg, p) => {
        const opcionesHtml = preg.opciones
          .map(
            (op, o) => `
              <div class="fila-opcion-editor">
                <input type="text" class="input-opcion-texto"
                  data-p="${p}" data-o="${o}"
                  value="${escapeHtml(op.texto)}"
                  placeholder="Descripción de la respuesta ${o + 1}"
                  aria-label="Respuesta ${o + 1} de la pregunta ${p + 1}" />
                <label class="etiqueta-correcta">
                  <input type="radio" class="radio-opcion-correcta"
                    name="correcta-preg-${p}" data-p="${p}" data-o="${o}"
                    ${op.correcta ? "checked" : ""} />
                  Correcta
                </label>
                ${
                  preg.opciones.length > 2
                    ? `<button type="button" class="btn btn-gris btn-pequeno" data-accion="quitar-opcion"
                        data-p="${p}" data-o="${o}" aria-label="Quitar la respuesta ${o + 1}">X</button>`
                    : ""
                }
              </div>
            `
          )
          .join("");

        return `
          <div class="caja-pregunta-editor">
            <div class="fila-entre">
              <strong>Pregunta ${p + 1}</strong>
              <div>
                <button type="button" class="btn btn-gris btn-pequeno" data-accion="agregar-opcion" data-p="${p}">+ Respuesta</button>
                ${
                  borradorPreguntas.length > 1
                    ? `<button type="button" class="btn btn-rojo btn-pequeno" data-accion="quitar-pregunta" data-p="${p}">Quitar</button>`
                    : ""
                }
              </div>
            </div>
            <div class="campo campo-enunciado">
              <input type="text" class="input-pregunta-texto" data-p="${p}"
                value="${escapeHtml(preg.texto)}"
                placeholder="Escribe el enunciado de la pregunta"
                aria-label="Enunciado de la pregunta ${p + 1}" />
            </div>
            <div class="lista-opciones-editor">${opcionesHtml}</div>
          </div>
        `;
      })
      .join("");
  }

  // Listeners delegados: se registran una sola vez, sin importar cuántas veces se renderice.
  contenedorPreguntas.addEventListener("input", (e) => {
    const campo = e.target;
    const p = Number(campo.dataset.p);
    const o = Number(campo.dataset.o);

    if (campo.classList.contains("input-pregunta-texto")) {
      borradorPreguntas[p].texto = campo.value;
    } else if (campo.classList.contains("input-opcion-texto")) {
      borradorPreguntas[p].opciones[o].texto = campo.value;
    }
  });

  contenedorPreguntas.addEventListener("change", (e) => {
    const campo = e.target;
    if (!campo.classList.contains("radio-opcion-correcta")) return;

    const p = Number(campo.dataset.p);
    const o = Number(campo.dataset.o);
    borradorPreguntas[p].opciones.forEach((op, idx) => {
      op.correcta = idx === o;
    });
  });

  contenedorPreguntas.addEventListener("click", (e) => {
    const boton = e.target.closest("button[data-accion]");
    if (!boton) return;

    const p = Number(boton.dataset.p);
    const o = Number(boton.dataset.o);

    if (boton.dataset.accion === "agregar-opcion") {
      borradorPreguntas[p].opciones.push({ id: nuevoId("op"), texto: "", correcta: false });
      renderConstructorPreguntas();
      const inputs = contenedorPreguntas.querySelectorAll(`.input-opcion-texto[data-p="${p}"]`);
      inputs[inputs.length - 1]?.focus();
      return;
    }

    if (boton.dataset.accion === "quitar-opcion") {
      const eraCorrecta = borradorPreguntas[p].opciones[o].correcta;
      borradorPreguntas[p].opciones.splice(o, 1);
      if (eraCorrecta && borradorPreguntas[p].opciones.length > 0) {
        borradorPreguntas[p].opciones[0].correcta = true;
      }
    }

    if (boton.dataset.accion === "quitar-pregunta") {
      borradorPreguntas.splice(p, 1);
    }

    renderConstructorPreguntas();
  });

  btnAgregarPregunta.addEventListener("click", () => {
    borradorPreguntas.push(crearPreguntaVacia());
    renderConstructorPreguntas();
    const inputs = contenedorPreguntas.querySelectorAll(".input-pregunta-texto");
    inputs[inputs.length - 1]?.focus();
  });

  /* ---------- Formulario ---------- */

  function limpiarFormulario() {
    form.reset();
    editandoCodigoInput.value = "";
    tituloForm.textContent = "Nuevo examen";
    btnCancelar.classList.add("oculto");
    borradorPreguntas = [crearPreguntaVacia()];
    renderConstructorPreguntas();
  }

  function cargarExamenEnFormulario(examen) {
    editandoCodigoInput.value = examen.codigo;
    codigoInput.value = examen.codigo;
    tituloInput.value = examen.titulo;
    tiempoInput.value = examen.tiempoMinutos;
    aprobacionInput.value = examen.porcentajeAprobacion;
    descripcionInput.value = examen.descripcion;

    borradorPreguntas = JSON.parse(JSON.stringify(examen.preguntas || []));
    if (borradorPreguntas.length === 0) {
      borradorPreguntas = [crearPreguntaVacia()];
    }

    tituloForm.textContent = "Actualizar examen";
    btnCancelar.classList.remove("oculto");
    renderConstructorPreguntas();
    tituloForm.scrollIntoView({ behavior: "smooth", block: "start" });
    tituloInput.focus();
  }

  /* ---------- Tabla ---------- */

  function renderTabla() {
    const examenes = obtenerExamenes();

    if (examenes.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="vacio">No hay exámenes registrados.</td></tr>`;
      return;
    }

    tbody.innerHTML = examenes
      .map((examen) => {
        const totalPreg = Array.isArray(examen.preguntas) ? examen.preguntas.length : 0;
        return `
          <tr>
            <td>${escapeHtml(examen.codigo)}</td>
            <td>${escapeHtml(examen.titulo)}</td>
            <td>${escapeHtml(examen.tiempoMinutos)} min</td>
            <td>${escapeHtml(examen.porcentajeAprobacion)}%</td>
            <td>${totalPreg}</td>
            <td>
              <div class="acciones-celda">
                <button type="button" class="btn btn-gris btn-pequeno" data-accion="editar"
                  data-codigo="${escapeHtml(examen.codigo)}"
                  aria-label="Actualizar el examen ${escapeHtml(examen.titulo)}">Actualizar</button>
                <button type="button" class="btn btn-rojo btn-pequeno" data-accion="eliminar"
                  data-codigo="${escapeHtml(examen.codigo)}"
                  aria-label="Eliminar el examen ${escapeHtml(examen.titulo)}">Eliminar</button>
              </div>
            </td>
          </tr>
        `;
      })
      .join("");
  }

  tbody.addEventListener("click", (e) => {
    const boton = e.target.closest("button[data-accion]");
    if (!boton) return;

    const examenes = obtenerExamenes();
    const examen = examenes.find((ex) => ex.codigo === boton.dataset.codigo);
    if (!examen) return;

    if (boton.dataset.accion === "editar") {
      cargarExamenEnFormulario(examen);
      return;
    }

    if (boton.dataset.accion === "eliminar") {
      if (!confirm(`¿Eliminar el examen "${examen.titulo}"? Esta acción no se puede deshacer.`)) {
        return;
      }

      guardarExamenes(examenes.filter((ex) => ex.codigo !== examen.codigo));
      if (editandoCodigoInput.value === examen.codigo) {
        limpiarFormulario();
      }
      renderTabla();
      notificarCambio();
      mostrarMensaje("Examen eliminado", "ok");
    }
  });

  btnCancelar.addEventListener("click", limpiarFormulario);

  /* ---------- Guardar ---------- */

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const codigo = codigoInput.value.trim();
    const titulo = tituloInput.value.trim();
    const tiempoMinutos = Number(tiempoInput.value);
    const porcentajeAprobacion = Number(aprobacionInput.value);
    const descripcion = descripcionInput.value.trim();
    const codigoOriginal = editandoCodigoInput.value.trim();

    if (
      !codigo ||
      !titulo ||
      !descripcion ||
      !(tiempoMinutos > 0) ||
      !(porcentajeAprobacion > 0) ||
      porcentajeAprobacion > 100
    ) {
      mostrarMensaje("Revisa los datos del examen (tiempo mayor a 0 y porcentaje entre 1 y 100)", "error");
      return;
    }

    const preguntasLimpias = [];
    for (let i = 0; i < borradorPreguntas.length; i += 1) {
      const p = borradorPreguntas[i];
      const textoPregunta = p.texto.trim();

      if (!textoPregunta) {
        mostrarMensaje(`La pregunta ${i + 1} no tiene enunciado`, "error");
        return;
      }

      const opcionesLimpias = p.opciones
        .map((op, idx) => ({
          id: op.id || nuevoId(`op${idx}`),
          texto: op.texto.trim(),
          correcta: Boolean(op.correcta)
        }))
        .filter((op) => op.texto.length > 0);

      if (opcionesLimpias.length < 2) {
        mostrarMensaje(`La pregunta ${i + 1} necesita al menos 2 respuestas con texto`, "error");
        return;
      }

      const correctasCount = opcionesLimpias.filter((op) => op.correcta).length;
      if (correctasCount !== 1) {
        mostrarMensaje(`La pregunta ${i + 1} debe tener exactamente una respuesta correcta con texto`, "error");
        return;
      }

      preguntasLimpias.push({
        id: p.id || nuevoId("preg"),
        texto: textoPregunta,
        opciones: opcionesLimpias
      });
    }

    if (preguntasLimpias.length === 0) {
      mostrarMensaje("Agrega al menos una pregunta al examen", "error");
      return;
    }

    const examenes = obtenerExamenes();
    const codigoRepetido = examenes.some(
      (ex) => ex.codigo === codigo && ex.codigo !== codigoOriginal
    );
    if (codigoRepetido) {
      mostrarMensaje("Ya existe un examen con ese código", "error");
      return;
    }

    const nuevoExamen = {
      codigo,
      titulo,
      tiempoMinutos,
      porcentajeAprobacion,
      descripcion,
      preguntas: preguntasLimpias
    };

    if (codigoOriginal) {
      guardarExamenes(examenes.map((ex) => (ex.codigo === codigoOriginal ? nuevoExamen : ex)));
      mostrarMensaje("Examen actualizado", "ok");
    } else {
      examenes.push(nuevoExamen);
      guardarExamenes(examenes);
      mostrarMensaje("Examen creado", "ok");
    }

    limpiarFormulario();
    renderTabla();
    notificarCambio();
  });

  renderConstructorPreguntas();
  renderTabla();

  return {
    refrescarExamenes: renderTabla
  };
}
