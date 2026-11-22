
import { escapeHtml } from "../utils/escape.js";

class AcmeNavbar extends HTMLElement {
  constructor() {
    super();
    this.usuario = null;
    this.vistaActiva = "vista-examenes";

    // Un solo listener delegado: sigue funcionando aunque render() reemplace el HTML.
    this.addEventListener("click", (ev) => {
      const boton = ev.target.closest("button");
      if (!boton) return;

      if (boton.dataset.ir) {
        this.dispatchEvent(
          new CustomEvent("navegar", {
            detail: { vista: boton.dataset.ir },
            bubbles: true
          })
        );
      } else if (boton.id === "btn-salir") {
        this.dispatchEvent(new CustomEvent("cerrar-sesion", { bubbles: true }));
      }
    });
  }

  connectedCallback() {
    this.render();
  }

  setUsuario(usuario) {
    this.usuario = usuario;
    this.render();
  }

  setActivo(idVista) {
    this.vistaActiva = idVista;
    this.render();
  }

  botonNavegacion(idVista, texto, claseExtra = "") {
    const activo = this.vistaActiva === idVista;
    return `
      <button type="button"
        class="nav-btn ${claseExtra} ${activo ? "activo" : ""}"
        data-ir="${idVista}"
        ${activo ? 'aria-current="page"' : ""}>${texto}</button>
    `;
  }

  render() {
    const estaLogueado = Boolean(this.usuario);

    const opcionesPrivadas = estaLogueado
      ? `
        ${this.botonNavegacion("vista-usuarios", "Usuarios")}
        ${this.botonNavegacion("vista-gestion-examenes", "Gestión de exámenes")}
        <span class="nav-usuario">${escapeHtml(this.usuario.nombre)} (${escapeHtml(this.usuario.cargo)})</span>
        <button type="button" id="btn-salir" class="nav-btn nav-btn-salir">Salir</button>
      `
      : this.botonNavegacion("vista-login", "Login", "nav-btn-acento");

    this.innerHTML = `
      <nav class="nav" aria-label="Navegación principal">
        <div class="nav-contenido">
          <span class="nav-marca">Acme School</span>
          <div class="nav-acciones">
            ${this.botonNavegacion("vista-examenes", "Exámenes")}
            ${opcionesPrivadas}
          </div>
        </div>
      </nav>
    `;
  }
}

customElements.define("acme-navbar", AcmeNavbar);