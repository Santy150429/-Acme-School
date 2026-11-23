import { iniciarBaseDatos, obtenerSesion } from "./storage/database.js";
import "./components/acme-navbar.js";
import "./components/exam-card.js";
import "./components/exam-timer.js";
import { iniciarLogin, cerrarSesion } from "./modules/auth.js";
import { iniciarModuloUsuarios } from "./modules/users.js";
import { iniciarModuloExamenes } from "./modules/exams.js";
import { iniciarModuloResolucion } from "./modules/quiz-player.js";

const VISTAS_PRIVADAS = ["vista-usuarios", "vista-gestion-examenes"];

const navbar = document.getElementById("navbar");
const modulos = {};

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

// Si hay un examen en curso, se pide confirmación antes de salir de él.
function confirmarSalidaDeExamen() {
  if (!modulos.resolucion.examenEnCurso()) return true;
  return confirm("Tienes un examen en curso. Si sales ahora perderás tus respuestas. ¿Quieres salir?");
}

function mostrarVista(idVista) {
  const sesion = obtenerSesion();

  // Protección de módulos privados: sin sesión se redirige al login.
  if (VISTAS_PRIVADAS.includes(idVista) && !sesion) {
    mostrarMensaje("Debes iniciar sesión para acceder a este módulo", "error");
    idVista = "vista-login";
  }

  document.querySelectorAll(".vista").forEach((sec) => {
    sec.classList.add("oculto");
  });

  const destino = document.getElementById(idVista) || document.getElementById("vista-examenes");
  destino.classList.remove("oculto");
  navbar.setActivo(destino.id);

  if (destino.id === "vista-examenes") modulos.resolucion.refrescarCatalogo();
  if (destino.id === "vista-usuarios") modulos.usuarios.refrescarUsuarios();
  if (destino.id === "vista-gestion-examenes") modulos.examenes.refrescarExamenes();
}

function iniciarAplicacion() {
  iniciarBaseDatos();
  navbar.setUsuario(obtenerSesion());

  modulos.resolucion = iniciarModuloResolucion(mostrarMensaje);

  modulos.usuarios = iniciarModuloUsuarios(mostrarMensaje, () => {
    navbar.setUsuario(obtenerSesion());
  });

  modulos.examenes = iniciarModuloExamenes(mostrarMensaje, () => {
    modulos.resolucion.refrescarCatalogo();
  });

  iniciarLogin((usuario) => {
    navbar.setUsuario(usuario);
    mostrarVista("vista-gestion-examenes");
  }, mostrarMensaje);

  navbar.addEventListener("navegar", (ev) => {
    if (!confirmarSalidaDeExamen()) return;
    mostrarVista(ev.detail.vista);
  });

  navbar.addEventListener("cerrar-sesion", () => {
    if (!confirmarSalidaDeExamen()) return;
    cerrarSesion(() => {
      navbar.setUsuario(null);
      mostrarVista("vista-login");
    }, mostrarMensaje);
  });

  // Avisa si se intenta cerrar o recargar la pestaña durante un examen.
  window.addEventListener("beforeunload", (ev) => {
    if (modulos.resolucion.examenEnCurso()) {
      ev.preventDefault();
      ev.returnValue = "";
    }
  });

  // Errores de localStorage (por ejemplo, almacenamiento lleno).
  document.addEventListener("almacenamiento-error", (ev) => {
    mostrarMensaje(ev.detail.mensaje, "error");
  });

  mostrarVista("vista-examenes");
}

iniciarAplicacion();
