
import { iniciarBaseDatos, obtenerSesion } from "./storage/database.js";
import "./components/acme-navbar.js";
import "./components/exam-card.js";
import "./components/exam-timer.js";
import { iniciarLogin, cerrarSesion } from "./modules/auth.js";
import { iniciarModuloUsuarios } from "./modules/users.js";
import { iniciarModuloExamenes } from "./modules/exams.js";
import { iniciarModuloResolucion } from "./modules/quiz-player.js";

const VISTAS_PRIVADAS = ["vista-usuarios", "vista-gestion-examenes"];

function mostrarMensaje(texto, tipo = "ok") {
  const caja = document.getElementById("mensajes");
  const aviso = document.createElement("div");
  aviso.className = `aviso ${tipo === "error" ? "aviso-error" : "aviso-ok"}`;
  aviso.textContent = texto;
  caja.appendChild(aviso);

  setTimeout(() => {
    aviso.remove();
  }, 3000);
}

function mostrarVista(idVista, moduloResolucion, moduloUsuarios, moduloExamenes) {
  const sesion = obtenerSesion();

  if (VISTAS_PRIVADAS.includes(idVista) && !sesion) {
    mostrarMensaje("Debes iniciar sesion para acceder a este modulo", "error");
    idVista = "vista-login";
  }

  document.querySelectorAll(".vista").forEach((sec) => {
    sec.classList.add("oculto");
  });

  const destino = document.getElementById(idVista) || document.getElementById("vista-examenes");
  destino.classList.remove("oculto");

  if (destino.id === "vista-examenes" && moduloResolucion) {
    moduloResolucion.refrescarCatalogo();
  }
  if (destino.id === "vista-usuarios" && moduloUsuarios) {
    moduloUsuarios.refrescarUsuarios();
  }
  if (destino.id === "vista-gestion-examenes" && moduloExamenes) {
    moduloExamenes.refrescarExamenes();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  iniciarBaseDatos();

  const navbar = document.getElementById("navbar");
  let sesionActual = obtenerSesion();
  navbar.setUsuario(sesionActual);

  let moduloResolucion = null;
  let moduloUsuarios = null;
  let moduloExamenes = null;

  moduloResolucion = iniciarModuloResolucion(mostrarMensaje);

  moduloUsuarios = iniciarModuloUsuarios(mostrarMensaje);

  moduloExamenes = iniciarModuloExamenes(mostrarMensaje, () => {
    moduloResolucion.refrescarCatalogo();
  });

  iniciarLogin(
    (usuario) => {
      sesionActual = usuario;
      navbar.setUsuario(sesionActual);
      mostrarVista("vista-gestion-examenes", moduloResolucion, moduloUsuarios, moduloExamenes);
    },
    mostrarMensaje
  );

  navbar.addEventListener("navegar", (ev) => {
    const destino = ev.detail.vista;
    mostrarVista(destino, moduloResolucion, moduloUsuarios, moduloExamenes);
  });

  navbar.addEventListener("cerrar-sesion", () => {
    cerrarSesion(() => {
      sesionActual = null;
      navbar.setUsuario(null);
      mostrarVista("vista-login", moduloResolucion, moduloUsuarios, moduloExamenes);
    }, mostrarMensaje);
  });

  mostrarVista("vista-examenes", moduloResolucion, moduloUsuarios, moduloExamenes);
});