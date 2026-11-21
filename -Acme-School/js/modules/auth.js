
import { obtenerUsuarios, guardarSesion, cerrarSesionStorage } from "../storage/database.js";

export function iniciarLogin(alAutenticar, mostrarMensaje) {
  const form = document.getElementById("form-login");
  const emailInput = document.getElementById("login-email");
  const passwordInput = document.getElementById("login-password");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    if (!email || !password) {
      mostrarMensaje("Completa correo y contrasena", "error");
      return;
    }

    const usuarios = obtenerUsuarios();
    const encontrado = usuarios.find(
      (u) => u.email.toLowerCase() === email && u.password === password
    );

    if (!encontrado) {
      mostrarMensaje("Correo o contrasena incorrectos", "error");
      return;
    }

    guardarSesion(encontrado);
    form.reset();
    mostrarMensaje(`Bienvenido, ${encontrado.nombre}`, "ok");

    if (typeof alAutenticar === "function") {
      alAutenticar(encontrado);
    }
  });
}

export function cerrarSesion(alCerrar, mostrarMensaje) {
  cerrarSesionStorage();
  mostrarMensaje("Sesion cerrada", "ok");
  if (typeof alCerrar === "function") {
    alCerrar();
  }
}