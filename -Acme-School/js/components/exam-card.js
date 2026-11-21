
class ExamCard extends HTMLElement {
  set datos(examen) {
    this._examen = examen;
    this.render();
  }

  render() {
    if (!this._examen) return;

    const { codigo, titulo, tiempoMinutos, porcentajeAprobacion, descripcion, preguntas } = this._examen;
    const totalPreguntas = Array.isArray(preguntas) ? preguntas.length : 0;

    this.innerHTML = `
      <article class="tarjeta" style="display:flex;flex-direction:column;justify-content:space-between;height:100%;gap:12px;">
        <div>
          <div style="font-size:0.8rem;color:#6b7280;font-weight:bold;">Codigo: ${codigo}</div>
          <h3 style="margin:4px 0 8px;color:#1e3a8a;">${titulo}</h3>
          <p style="margin:0 0 12px;color:#4b5563;font-size:0.92rem;">${descripcion}</p>
          <p style="margin:4px 0;font-size:0.9rem;"><strong>Tiempo:</strong> ${tiempoMinutos} min</p>
          <p style="margin:4px 0;font-size:0.9rem;"><strong>Aprobacion:</strong> ${porcentajeAprobacion}%</p>
          <p style="margin:4px 0;font-size:0.9rem;"><strong>Preguntas:</strong> ${totalPreguntas}</p>
        </div>
        <button type="button" class="btn btn-azul" id="btn-elegir">Resolver examen</button>
      </article>
    `;

    this.querySelector("#btn-elegir").addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("seleccionar-examen", {
        detail: { examen: this._examen },
        bubbles: true
      }));
    });
  }
}

customElements.define("exam-card", ExamCard);