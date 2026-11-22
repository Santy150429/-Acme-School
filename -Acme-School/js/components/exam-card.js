
import { escapeHtml } from "../utils/escape.js";

class ExamCard extends HTMLElement {
  set datos(examen) {
    this._examen = examen;
    this.render();
  }

  get datos() {
    return this._examen;
  }

  render() {
    if (!this._examen) return;

    const { codigo, titulo, tiempoMinutos, porcentajeAprobacion, descripcion, preguntas } = this._examen;
    const totalPreguntas = Array.isArray(preguntas) ? preguntas.length : 0;

    this.innerHTML = `
      <article class="tarjeta">
        <div>
          <div class="card-codigo">Código: ${escapeHtml(codigo)}</div>
          <h3 class="card-titulo">${escapeHtml(titulo)}</h3>
          <p class="card-descripcion">${escapeHtml(descripcion)}</p>
          <p class="card-dato"><strong>Tiempo:</strong> ${escapeHtml(tiempoMinutos)} min</p>
          <p class="card-dato"><strong>Aprobación:</strong> ${escapeHtml(porcentajeAprobacion)}%</p>
          <p class="card-dato"><strong>Preguntas:</strong> ${totalPreguntas}</p>
        </div>
        <button type="button" class="btn btn-azul" id="btn-elegir"
          aria-label="Resolver el examen ${escapeHtml(titulo)}">Resolver examen</button>
      </article>
    `;

    this.querySelector("#btn-elegir").addEventListener("click", () => {
      this.dispatchEvent(
        new CustomEvent("seleccionar-examen", {
          detail: { examen: this._examen },
          bubbles: true
        })
      );
    });
  }
}

customElements.define("exam-card", ExamCard);