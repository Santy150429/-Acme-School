
import { obtenerExamenes, guardarExamenes } from "../storage/database.js";

function crearPreguntaVacia(indice = 1) {
  return {
    id: `preg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    texto: "",
    opciones: [
      { id: `op-${indice}-1`, texto: "", correcta: true },
      { id: `op-${indice}-2`, texto: "", correcta: false }
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

  let borradorPreguntas = [crearPreguntaVacia(1)];

  function renderConstructorPreguntas() {
    contenedorPreguntas.innerHTML = "";

    borradorPreguntas.forEach((preg, pIndex) => {
      const caja = document.createElement("div");
      caja.className = "caja-pregunta-editor";

      const opcionesHtml = preg.opciones
        .map(
          (op, oIndex) => `
            <div class="fila-opcion-editor">
              <input
                type="text"
                class="input-opcion-texto"
                data-p="${pIndex}"
                data-o="${oIndex}"
                value="${op.texto}"
                placeholder="Descripcion de respuesta ${oIndex + 1}"
              />
              <label style="font-size:0.82rem;display:flex;align-items:center;gap:3px;cursor:pointer;">
                <input
                  type="radio"
                  name="correcta-preg-${pIndex}"
                  class="radio-opcion-correcta"
                  data-p="${pIndex}"
                  data-o="${oIndex}"
                  ${op.correcta ? "checked" : ""}
                />
                Correcta
              </label>
              ${
                preg.opciones.length > 2
                  ? `<button type="button" class="btn btn-gris btn-pequeno btn-quitar-opcion" data-p="${pIndex}" data-o="${oIndex}">X</button>`
                  : ""
              }
            </div>
          `
        )
        .join("");

      caja.innerHTML = `
        <div class="fila-entre">
          <strong>Pregunta ${pIndex + 1}</strong>
          <div>
            <button type="button" class="btn btn-gris btn-pequeno btn-agregar-opcion" data-p="${pIndex}">+ Respuesta</button>
            ${
              borradorPreguntas.length > 1
                ? `<button type="button" class="btn btn-rojo btn-pequeno btn-quitar-pregunta" data-p="${pIndex}">Quitar</button>`
                : ""
            }
          </div>
        </div>
        <div class="campo" style="margin-top:8px;">
          <input
            type="text"
            class="input-pregunta-texto"
            data-p="${pIndex}"
            value="${preg.texto}"
            placeholder="Escribe el enunciado de la pregunta"
          />
        </div>
        <div class="lista-opciones-editor">${opcionesHtml}</div>
      `;

      contenedorPreguntas.appendChild(caja);
    });

    contenedorPreguntas.querySelectorAll(".input-pregunta-texto").forEach((input) => {
      input.addEventListener("input", () => {
        const p = Number(input.dataset.p);
        borradorPreguntas[p].texto = input.value;
      });
    });

    contenedorPreguntas.querySelectorAll(".input-opcion-texto").forEach((input) => {
      input.addEventListener("input", () => {
        const p = Number(input.dataset.p);
        const o = Number(input.dataset.o);
        borradorPreguntas[p].opciones[o].texto = input.value;
      });
    });

    contenedorPreguntas.querySelectorAll(".radio-opcion-correcta").forEach((radio) => {
      radio.addEventListener("change", () => {
        const p = Number(radio.dataset.p);
        const o = Number(radio.dataset.o);
        borradorPreguntas[p].opciones.forEach((op, idx) => {
          op.correcta = idx === o;
        });
      });
    });

    contenedorPreguntas.querySelectorAll(".btn-agregar-opcion").forEach((btn) => {
      btn.addEventListener("click", () => {
        const p = Number(btn.dataset.p);
        const siguienteNum = borradorPreguntas[p].opciones.length + 1;
        borradorPreguntas[p].opciones.push({
          id: `op-${p}-${siguienteNum}-${Date.now().toString().slice(-3)}`,
          texto: "",
          correcta: false
        });
        renderConstructorPreguntas();
      });
    });

    contenedorPreguntas.querySelectorAll(".btn-quitar-opcion").forEach((btn) => {
      btn.addEventListener("click", () => {
        const p = Number(btn.dataset.p);
        const o = Number(btn.dataset.o);
        const eraCorrecta = borradorPreguntas[p].opciones[o].correcta;
        borradorPreguntas[p].opciones.splice(o, 1);
        if (eraCorrecta && borradorPreguntas[p].opciones.length > 0) {
          borradorPreguntas[p].opciones[0].correcta = true;
        }
        renderConstructorPreguntas();
      });
    });

    contenedorPreguntas.querySelectorAll(".btn-quitar-pregunta").forEach((btn) => {
      btn.addEventListener("click", () => {
        const p = Number(btn.dataset.p);
        borradorPreguntas.splice(p, 1);
        renderConstructorPreguntas();
      });
    });
  }

  function limpiarFormulario() {
    form.reset();
    editandoCodigoInput.value = "";
    tituloForm.textContent = "Nuevo examen";
    btnCancelar.classList.add("oculto");
    borradorPreguntas = [crearPreguntaVacia(1)];
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
      borradorPreguntas = [crearPreguntaVacia(1)];
    }
    tituloForm.textContent = "Actualizar examen";
    btnCancelar.classList.remove("oculto");
    renderConstructorPreguntas();
  }

  function renderTabla() {
    const examenes = obtenerExamenes();
    tbody.innerHTML = "";

    if (examenes.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6">No hay examenes registrados.</td></tr>`;
      return;
    }

    examenes.forEach((examen) => {
      const totalPreg = Array.isArray(examen.preguntas) ? examen.preguntas.length : 0;
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${examen.codigo}</td>
        <td>${examen.titulo}</td>
        <td>${examen.tiempoMinutos} min</td>
        <td>${examen.porcentajeAprobacion}%</td>
        <td>${totalPreg}</td>
        <td>
          <button type="button" class="btn btn-gris btn-pequeno btn-editar">Actualizar</button>
          <button type="button" class="btn btn-rojo btn-pequeno btn-eliminar">Eliminar</button>
        </td>
      `;

      tr.querySelector(".btn-editar").addEventListener("click", () => {
        cargarExamenEnFormulario(examen);
      });

      tr.querySelector(".btn-eliminar").addEventListener("click", () => {
        const listaActual = obtenerExamenes();
        const filtrada = listaActual.filter((ex) => ex.codigo !== examen.codigo);
        guardarExamenes(filtrada);
        if (editandoCodigoInput.value === examen.codigo) {
          limpiarFormulario();
        }
        renderTabla();
        if (typeof alCambiarExamenes === "function") alCambiarExamenes();
        mostrarMensaje("Examen eliminado", "ok");
      });

      tbody.appendChild(tr);
    });
  }

  btnAgregarPregunta.addEventListener("click", () => {
    borradorPreguntas.push(crearPreguntaVacia(borradorPreguntas.length + 1));
    renderConstructorPreguntas();
  });

  btnCancelar.addEventListener("click", limpiarFormulario);

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const codigo = codigoInput.value.trim();
    const titulo = tituloInput.value.trim();
    const tiempoMinutos = Number(tiempoInput.value);
    const porcentajeAprobacion = Number(aprobacionInput.value);
    const descripcion = descripcionInput.value.trim();
    const codigoOriginal = editandoCodigoInput.value.trim();

    if (!codigo || !titulo || !descripcion || tiempoMinutos <= 0 || porcentajeAprobacion <= 0 || porcentajeAprobacion > 100) {
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
          id: op.id || `op-${i}-${idx}`,
          texto: op.texto.trim(),
          correcta: Boolean(op.correcta)
        }))
        .filter((op) => op.texto.length > 0);

      if (opcionesLimpias.length < 2) {
        mostrarMensaje(`La pregunta ${i + 1} necesita al menos 2 respuestas`, "error");
        return;
      }

      const correctasCount = opcionesLimpias.filter((op) => op.correcta).length;
      if (correctasCount !== 1) {
        opcionesLimpias.forEach((op, idx) => {
          op.correcta = idx === 0;
        });
      }

      preguntasLimpias.push({
        id: p.id || `preg-${i + 1}`,
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
      mostrarMensaje("Ya existe un examen con ese codigo", "error");
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
      const actualizada = examenes.map((ex) =>
        ex.codigo === codigoOriginal ? nuevoExamen : ex
      );
      guardarExamenes(actualizada);
      mostrarMensaje("Examen actualizado", "ok");
    } else {
      examenes.push(nuevoExamen);
      guardarExamenes(examenes);
      mostrarMensaje("Examen creado", "ok");
    }

    limpiarFormulario();
    renderTabla();
    if (typeof alCambiarExamenes === "function") alCambiarExamenes();
  });

  renderConstructorPreguntas();
  renderTabla();

  return {
    refrescarExamenes: renderTabla
  };
}