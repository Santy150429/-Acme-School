import { obtenerUsuarios, guardarUsuarios, obtenerSesion, guardarSesion } from "../storage/database.js";
import { escapeHtml } from "../utils/escape.js";

const LONGITUD_MINIMA_PASSWORD = 6;

export function iniciarModuloUsuarios(mostrarMensaje, alActualizarSesion) {
  const form = document.getElementById("form-usuario");
  const tituloForm = document.getElementById("titulo-form-usuario");
  const editandoIdInput = document.getElementById("usuario-editando-id");
  const btnCancelar = document.getElementById("btn-cancelar-usuario");
  const tbody = document.getElementById("tabla-usuarios");

  const idInput = document.getElementById("usuario-id");
  const nombreInput = document.getElementById("usuario-nombre");
  const emailInput = document.getElementById("usuario-email");
  const telefonoInput = document.getElementById("usuario-telefono");
  const cargoInput = document.getElementById("usuario-cargo");
  const passwordInput = document.getElementById("usuario-password");

  function limpiarFormulario() {
    form.reset();
    editandoIdInput.value = "";
    tituloForm.textContent = "Nuevo usuario";
    passwordInput.required = true;
    passwordInput.placeholder = "";
    btnCancelar.classList.add("oculto");
  }

  function cargarEnFormulario(usuario) {
    editandoIdInput.value = usuario.identificacion;
    idInput.value = usuario.identificacion;
    nombreInput.value = usuario.nombre;
    emailInput.value = usuario.email;
    telefonoInput.value = usuario.telefono;
    cargoInput.value = usuario.cargo;

    // La contraseña actual no se muestra: si se deja vacía, se conserva.
    passwordInput.value = "";
    passwordInput.required = false;
    passwordInput.placeholder = "Vacía = conservar la actual";

    tituloForm.textContent = "Actualizar usuario";
    btnCancelar.classList.remove("oculto");
    tituloForm.scrollIntoView({ behavior: "smooth", block: "start" });
    nombreInput.focus();
  }

  function renderTabla() {
    const usuarios = obtenerUsuarios();

    if (usuarios.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="vacio">No hay usuarios registrados.</td></tr>`;
      return;
    }

    tbody.innerHTML = usuarios
      .map(
        (usuario) => `
          <tr>
            <td>${escapeHtml(usuario.identificacion)}</td>
            <td>${escapeHtml(usuario.nombre)}</td>
            <td>${escapeHtml(usuario.email)}</td>
            <td>${escapeHtml(usuario.telefono)}</td>
            <td>${escapeHtml(usuario.cargo)}</td>
            <td>
              <div class="acciones-celda">
                <button type="button" class="btn btn-gris btn-pequeno" data-accion="editar"
                  data-id="${escapeHtml(usuario.identificacion)}"
                  aria-label="Actualizar a ${escapeHtml(usuario.nombre)}">Actualizar</button>
                <button type="button" class="btn btn-rojo btn-pequeno" data-accion="eliminar"
                  data-id="${escapeHtml(usuario.identificacion)}"
                  aria-label="Eliminar a ${escapeHtml(usuario.nombre)}">Eliminar</button>
              </div>
            </td>
          </tr>
        `
      )
      .join("");
  }

  function eliminarUsuario(usuario) {
    const listaActual = obtenerUsuarios();
    const sesion = obtenerSesion();

    if (sesion && sesion.identificacion === usuario.identificacion) {
      mostrarMensaje("No puedes eliminar tu propio usuario activo", "error");
      return;
    }

    const adminsRestantes = listaActual.filter(
      (u) => u.cargo === "Administrativo" && u.identificacion !== usuario.identificacion
    );
    if (usuario.cargo === "Administrativo" && adminsRestantes.length === 0) {
      mostrarMensaje("Debe existir al menos un usuario Administrativo", "error");
      return;
    }

    if (!confirm(`¿Eliminar al usuario ${usuario.nombre}? Esta acción no se puede deshacer.`)) {
      return;
    }

    guardarUsuarios(listaActual.filter((u) => u.identificacion !== usuario.identificacion));
    if (editandoIdInput.value === usuario.identificacion) {
      limpiarFormulario();
    }
    renderTabla();
    mostrarMensaje("Usuario eliminado", "ok");
  }

  // Un solo listener para todos los botones de la tabla.
  tbody.addEventListener("click", (e) => {
    const boton = e.target.closest("button[data-accion]");
    if (!boton) return;

    const usuario = obtenerUsuarios().find((u) => u.identificacion === boton.dataset.id);
    if (!usuario) return;

    if (boton.dataset.accion === "editar") cargarEnFormulario(usuario);
    if (boton.dataset.accion === "eliminar") eliminarUsuario(usuario);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const identificacion = idInput.value.trim();
    const nombre = nombreInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const telefono = telefonoInput.value.trim();
    const cargo = cargoInput.value;
    const passwordNueva = passwordInput.value;
    const originalId = editandoIdInput.value.trim();
    const esEdicion = Boolean(originalId);

    if (!identificacion || !nombre || !email || !telefono || !cargo) {
      mostrarMensaje("Todos los campos del usuario son obligatorios", "error");
      return;
    }

    if (!esEdicion && !passwordNueva) {
      mostrarMensaje("La contraseña es obligatoria para un usuario nuevo", "error");
      return;
    }

    if (passwordNueva && passwordNueva.length < LONGITUD_MINIMA_PASSWORD) {
      mostrarMensaje(`La contraseña debe tener al menos ${LONGITUD_MINIMA_PASSWORD} caracteres`, "error");
      return;
    }

    const usuarios = obtenerUsuarios();

    const idRepetido = usuarios.some(
      (u) => u.identificacion === identificacion && u.identificacion !== originalId
    );
    if (idRepetido) {
      mostrarMensaje("Ya existe un usuario con ese número de identificación", "error");
      return;
    }

    const emailRepetido = usuarios.some(
      (u) => u.email.toLowerCase() === email && u.identificacion !== originalId
    );
    if (emailRepetido) {
      mostrarMensaje("Ya existe un usuario con ese correo", "error");
      return;
    }

    const usuarioAnterior = usuarios.find((u) => u.identificacion === originalId);
    const password = passwordNueva || (usuarioAnterior ? usuarioAnterior.password : "");
    const nuevoUsuario = { identificacion, nombre, email, telefono, cargo, password };

    const resultante = esEdicion
      ? usuarios.map((u) => (u.identificacion === originalId ? nuevoUsuario : u))
      : [...usuarios, nuevoUsuario];

    if (!resultante.some((u) => u.cargo === "Administrativo")) {
      mostrarMensaje("Debe existir al menos un usuario Administrativo", "error");
      return;
    }

    guardarUsuarios(resultante);

    // Si el usuario editado es quien tiene la sesión abierta, se actualiza la sesión.
    const sesion = obtenerSesion();
    if (esEdicion && sesion && sesion.identificacion === originalId) {
      guardarSesion(nuevoUsuario);
      if (typeof alActualizarSesion === "function") alActualizarSesion();
    }

    mostrarMensaje(esEdicion ? "Usuario actualizado" : "Usuario creado", "ok");
    limpiarFormulario();
    renderTabla();
  });

  btnCancelar.addEventListener("click", limpiarFormulario);

  renderTabla();

  return {
    refrescarUsuarios: renderTabla
  };
}
