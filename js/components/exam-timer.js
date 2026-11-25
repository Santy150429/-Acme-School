const PLANTILLA = `
  <style>
    :host { display: inline-block; }
    .reloj {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 16px;
      border-radius: 8px;
      border: 1px solid #1e3a8a;
      background: #eff6ff;
      color: #1e3a8a;
      font-family: Arial, sans-serif;
      transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
    }
    .etiqueta { font-size: 0.9rem; }
    .tiempo { font-size: 1.5rem; font-variant-numeric: tabular-nums; }
    .reloj.poco { background: #fee2e2; color: #b91c1c; border-color: #b91c1c; }
    .reloj.poco .tiempo { animation: pulso 1s ease-in-out infinite; }
    @keyframes pulso { 50% { opacity: 0.55; } }
    @media (prefers-reduced-motion: reduce) {
      .reloj { transition: none; }
      .reloj.poco .tiempo { animation: none; }
    }
  </style>
  <div class="reloj">
    <span class="etiqueta">Tiempo restante</span>
    <strong class="tiempo">00:00</strong>
  </div>
`;

class ExamTimer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }).innerHTML = PLANTILLA;
    this._reloj = this.shadowRoot.querySelector(".reloj");
    this._tiempo = this.shadowRoot.querySelector(".tiempo");
    this._finEn = 0;
    this._intervalo = null;
    this._ultimoSegundo = null;
  }

  connectedCallback() {
    this.setAttribute("role", "timer");
    this.setAttribute("aria-label", "Tiempo restante del examen");
  }

  disconnectedCallback() {
    this.detener();
  }

  // Inicia la cuenta regresiva. Se calcula con la hora final (Date.now),
  // así el reloj no se atrasa aunque la pestaña quede en segundo plano.
  iniciar(minutos) {
    this.detener();
    this._ultimoSegundo = null;
    this._finEn = Date.now() + Math.max(1, Number(minutos) || 1) * 60 * 1000;
    this.tick();
    this._intervalo = setInterval(() => this.tick(), 250);
  }

  tick() {
    const restante = Math.max(0, Math.ceil((this._finEn - Date.now()) / 1000));

    if (restante !== this._ultimoSegundo) {
      this._ultimoSegundo = restante;
      this.pintar(restante);
    }

    if (restante <= 0) {
      this.detener();
      this.dispatchEvent(new CustomEvent("tiempo-agotado", { bubbles: true }));
    }
  }

  detener() {
    if (this._intervalo) {
      clearInterval(this._intervalo);
      this._intervalo = null;
    }
  }

  formatearTiempo(totalSegundos) {
    const mins = String(Math.floor(totalSegundos / 60)).padStart(2, "0");
    const segs = String(totalSegundos % 60).padStart(2, "0");
    return `${mins}:${segs}`;
  }

  pintar(segundos) {
    this._tiempo.textContent = this.formatearTiempo(segundos);
    this._reloj.classList.toggle("poco", segundos > 0 && segundos <= 60);
  }
}

customElements.define("exam-timer", ExamTimer);
