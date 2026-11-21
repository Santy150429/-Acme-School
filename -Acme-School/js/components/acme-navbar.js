
class AcmeNavbar extends HTMLElement {
  constructor() {
    super();
    this.usuario = null;
  }

  connectedCallback() {
    this.render();
  }

  setUsuario(usuario) {
    this.usuario = usuario;
    this.render();
  }

  render() {
    const estaLogueado = Boolean(this.usuario);

    this.innerHTML = `
      <nav style="background:#1e3a8a;color:#ffffff;padding:12px 20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
        <div style="font-weight:bold;font-size:1.1rem;">Acme School</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
          <button type="button" data-ir="vista-examenes" style="padding:7px 12px;border:none;border-radius:6px;cursor:pointer;font-weight:bold;background:#eff6ff;color:#1e3a8a;">Examenes</button>
          ${
            estaLogueado
              ? `
                <button type="button" data-ir="vista-usuarios" style="padding:7px 12px;border:none;border-radius:6px;cursor:pointer;font-weight:bold;background:#eff6ff;color:#1e3a8a;">Usuarios</button>
                <button type="button" data-ir="vista-gestion-examenes" style="padding:7px 12px;border:none;border-radius:6px;cursor:pointer;font-weight:bold;background:#eff6ff;color:#1e3a8a;">Gestion Examenes</button>
                <span style="font-size:0.85rem;padding:0 6px;">${this.usuario.nombre} (${this.usuario.cargo})</span>
                <button type="button" id="btn-salir" style="padding:7px 12px;border:none;border-radius:6px;cursor:pointer;font-weight:bold;background:#dc2626;color:#ffffff;">Salir</button>
              `
              : `
                <button type="button" data-ir="vista-login" style="padding:7px 12px;border:none;border-radius:6px;cursor:pointer;font-weight:bold;background:#2563eb;color:#ffffff;">Login</button>
              `
          }
        </div>
      </nav>
    `;

    this.querySelectorAll("button[data-ir]").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("navegar", {
          detail: { vista: btn.dataset.ir },
          bubbles: true
        }));
      });
    });

    const btnSalir = this.querySelector("#btn-salir");
    if (btnSalir) {
      btnSalir.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("cerrar-sesion", {
          bubbles: true
        }));
      });
    }
  }
}

customElements.define("acme-navbar", AcmeNavbar);