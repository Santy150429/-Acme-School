
import { obtenerUsuarios, guardarUsuarios, obtenerSesion } from "../storage/database.js";

export function iniciarModuloUsuarios(mostrarMensaje) {
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
    btnCancelar.classList.add("oculto");
  }

  function cargarEnFormulario(usuario) {
    editandoIdInput.value = usuario.identificacion;
    idInput.value = usuario.identificacion;
    nombreInput.value = usuario.nombre;
    emailInput.value = usuario.email;
    telefonoInput.value = usuario.telefono;
    cargoInput.value = usuario.cargo;
    passwordInput.value = usuario.password;
    tituloForm.textContent = "Actualizar usuario";
    btnCancelar.classList.remove("oculto");
  }

  function renderTabla() {
    const usuarios = obtenerUsuarios();
    tbody.innerHTML = "";

    if (usuarios.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6">No hay usuarios registrados.</td></tr>`;
      return;
    }

    usuarios.forEach((usuario) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${usuario.identificacion}</td>
        <td>${usuario.nombre}</td>
        <td>${usuario.email}</td>
        <td>${usuario.telefono}</td>
        <td>${usuario.cargo}</td>
        <td>
          <button type="button" class="btn btn-gris btn-pequeno btn-editar">Actualizar</button>
          <button type="button" class="btn btn-rojo btn-pequeno btn-eliminar">Eliminar</button>
        </td>
      `;

      tr.querySelector(".btn-editar").addEventListener("click", () => {
        cargarEnFormulario(usuario);
      });

      tr.querySelector(".btn-eliminar").addEventListener("click", () => {
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

        const filtrada = listaActual.filter((u) => u.identificacion !== usuario.identificacion);
        guardarUsuarios(filtrada);
        if (editandoIdInput.value === usuario.identificacion) {
          limpiarFormulario();
        }
        renderTabla();
        mostrarMensaje("Usuario eliminado", "ok");
      });

      tbody.appendChild(tr);
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const identificacion = idInput.value.trim();
    const nombre = nombreInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const telefono = telefonoInput.value.trim();
    const cargo = cargoInput.value;
    const password = passwordInput.value;
    const originalId = editandoIdInput.value.trim();

    if (!identificacion || !nombre || !email || !telefono || !cargo || !password) {
      mostrarMensaje("Todos los campos del usuario son obligatorios", "error");
      return;
    }

    const usuarios = obtenerUsuarios();
    const esEdicion = Boolean(originalId);

    const idRepetido = usuarios.some(
      (u) => u.identificacion === identificacion && u.identificacion !== originalId
    );
    if (idRepetido) {
      mostrarMensaje("Ya existe un usuario con ese numero de identificacion", "error");
      return;
    }

    const emailRepetido = usuarios.some(
      (u) => u.email.toLowerCase() === email && u.identificacion !== originalId
    );
    if (emailRepetido) {
      mostrarMensaje("Ya existe un usuario con ese correo", "error");
      return;
    }

    const nuevoUsuario = { identificacion, nombre, email, telefono, cargo, password };

    if (esEdicion) {
      const actualizada = usuarios.map((u) =>
        u.identificacion === originalId ? nuevoUsuario : u
      );
      guardarUsuarios(actualizada);
      mostrarMensaje("Usuario actualizado", "ok");
    } else {
      usuarios.push(nuevoUsuario);
      guardarUsuarios(usuarios);
      mostrarMensaje("Usuario creado", "ok");
    }

    limpiarFormulario();
    renderTabla();
  });

  btnCancelar.addEventListener("click", limpiarFormulario);

  renderTabla();

  return {
    refrescarUsuarios: renderTabla
  };
}