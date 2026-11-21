
class ExamTimer extends HTMLElement {
  constructor() {
    super();
    this.segundosRestantes = 0;
    this.intervalo = null;
  }

  connectedCallback() {
    this.pintar();
  }

  disconnectedCallback() {
    this.detener();
  }

  iniciar(minutos) {
    this.detener();
    this.segundosRestantes = Math.max(1, Number(minutos) || 1) * 60;
    this.pintar();

    this.intervalo = setInterval(() => {
      this.segundosRestantes -= 1;
      this.pintar();

      if (this.segundosRestantes <= 0) {
        this.detener();
        this.dispatchEvent(new CustomEvent("tiempo-agotado", {
          bubbles: true
        }));
      }
    }, 1000);
  }

  detener() {
    if (this.intervalo) {
      clearInterval(this.intervalo);
      this.intervalo = null;
    }
  }

  formatearTiempo(totalSegundos) {
    const seguro = Math.max(0, totalSegundos);
    const mins = String(Math.floor(seguro / 60)).padStart(2, "0");
    const segs = String(seguro % 60).padStart(2, "0");
    return `${mins}:${segs}`;
  }

  pintar() {
    const tiempoTexto = this.formatearTiempo(this.segundosRestantes);
    const pocoTiempo = this.segundosRestantes > 0 && this.segundosRestantes <= 60;
    const colorFondo = pocoTiempo ? "#fee2e2" : "#eff6ff";
    const colorTexto = pocoTiempo ? "#b91c1c" : "#1e3a8a";

    this.innerHTML = `
      <div style="background:${colorFondo};color:${colorTexto};padding:10px 16px;border-radius:8px;font-weight:bold;font-size:1.1rem;border:1px solid currentColor;">
        Tiempo restante: ${tiempoTexto}
      </div>
    `;
  }
}

customElements.define("exam-timer", ExamTimer);