const CLAVES = {
  usuarios: "acme_usuarios",
  examenes: "acme_examenes",
  resultados: "acme_resultados",
  sesion: "acme_sesion"
};

const usuariosIniciales = [
  {
    identificacion: "1001",
    nombre: "Admin Acme",
    email: "admin@acme.edu",
    telefono: "3000000000",
    cargo: "Administrativo",
    password: "admin123"
  },
  {
    identificacion: "1002",
    nombre: "Carlos Docente",
    email: "docente@acme.edu",
    telefono: "3001112233",
    cargo: "Docente",
    password: "docente123"
  }
];

const examenesIniciales = [
  {
    codigo: "EX01",
    titulo: "Básicos de JavaScript",
    tiempoMinutos: 5,
    porcentajeAprobacion: 70,
    descripcion: "Preguntas sobre variables, funciones y lógica.",
    preguntas: [
      {
        id: "p1",
        texto: "¿Qué palabra declara una variable que puede cambiar de valor?",
        opciones: [
          { id: "o1", texto: "let", correcta: true },
          { id: "o2", texto: "const", correcta: false },
          { id: "o3", texto: "function", correcta: false }
        ]
      },
      {
        id: "p2",
        texto: "¿Cómo se guarda un arreglo u objeto en localStorage?",
        opciones: [
          { id: "o1", texto: "JSON.stringify()", correcta: true },
          { id: "o2", texto: "JSON.parse()", correcta: false },
          { id: "o3", texto: "Number()", correcta: false }
        ]
      },
      {
        id: "p3",
        texto: "¿Qué método agrega un elemento al final de un arreglo?",
        opciones: [
          { id: "o1", texto: "push()", correcta: true },
          { id: "o2", texto: "pop()", correcta: false },
          { id: "o3", texto: "shift()", correcta: false }
        ]
      },
      {
        id: "p4",
        texto: "¿Qué operador compara valor y tipo al mismo tiempo?",
        opciones: [
          { id: "o1", texto: "===", correcta: true },
          { id: "o2", texto: "==", correcta: false },
          { id: "o3", texto: "=", correcta: false }
        ]
      }
    ]
  },
  {
    codigo: "EX02",
    titulo: "HTML y CSS esencial",
    tiempoMinutos: 4,
    porcentajeAprobacion: 60,
    descripcion: "Etiquetas semánticas, estilos y maquetación básica.",
    preguntas: [
      {
        id: "p1",
        texto: "¿Qué etiqueta HTML define el contenido principal de la página?",
        opciones: [
          { id: "o1", texto: "<main>", correcta: true },
          { id: "o2", texto: "<aside>", correcta: false },
          { id: "o3", texto: "<footer>", correcta: false }
        ]
      },
      {
        id: "p2",
        texto: "¿Qué propiedad CSS cambia el color de fondo de un elemento?",
        opciones: [
          { id: "o1", texto: "background-color", correcta: true },
          { id: "o2", texto: "color", correcta: false },
          { id: "o3", texto: "border-color", correcta: false }
        ]
      },
      {
        id: "p3",
        texto: "¿Qué valor de display activa Flexbox?",
        opciones: [
          { id: "o1", texto: "flex", correcta: true },
          { id: "o2", texto: "block", correcta: false },
          { id: "o3", texto: "inline", correcta: false }
        ]
      }
    ]
  },
  {
    codigo: "EX03",
    titulo: "DOM y eventos",
    tiempoMinutos: 6,
    porcentajeAprobacion: 70,
    descripcion: "Manipulación del DOM y manejo de eventos en el navegador.",
    preguntas: [
      {
        id: "p1",
        texto: "¿Qué método selecciona un elemento por su id?",
        opciones: [
          { id: "o1", texto: "document.getElementById()", correcta: true },
          { id: "o2", texto: "document.createElement()", correcta: false },
          { id: "o3", texto: "document.write()", correcta: false }
        ]
      },
      {
        id: "p2",
        texto: "¿Qué método asocia una función a un evento de un elemento?",
        opciones: [
          { id: "o1", texto: "addEventListener()", correcta: true },
          { id: "o2", texto: "querySelector()", correcta: false },
          { id: "o3", texto: "setAttribute()", correcta: false }
        ]
      },
      {
        id: "p3",
        texto: "¿Qué propiedad inserta texto sin interpretarlo como HTML?",
        opciones: [
          { id: "o1", texto: "textContent", correcta: true },
          { id: "o2", texto: "innerHTML", correcta: false },
          { id: "o3", texto: "outerHTML", correcta: false }
        ]
      }
    ]
  }
];

function avisarErrorAlmacenamiento() {
  document.dispatchEvent(
    new CustomEvent("almacenamiento-error", {
      detail: { mensaje: "No se pudo guardar la información en el navegador" }
    })
  );
}

function leer(clave, defecto) {
  try {
    const dato = localStorage.getItem(clave);
    if (!dato) return defecto;
    return JSON.parse(dato);
  } catch (e) {
    return defecto;
  }
}

function guardar(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
    return true;
  } catch (e) {
    console.error("Error al guardar en localStorage:", e);
    avisarErrorAlmacenamiento();
    return false;
  }
}

export function iniciarBaseDatos() {
  if (leer(CLAVES.usuarios, null) === null) {
    guardar(CLAVES.usuarios, usuariosIniciales);
  }
  if (leer(CLAVES.examenes, null) === null) {
    guardar(CLAVES.examenes, examenesIniciales);
  }
  if (leer(CLAVES.resultados, null) === null) {
    guardar(CLAVES.resultados, []);
  }
}

export function obtenerUsuarios() {
  return leer(CLAVES.usuarios, []);
}

export function guardarUsuarios(lista) {
  return guardar(CLAVES.usuarios, lista);
}

export function obtenerExamenes() {
  return leer(CLAVES.examenes, []);
}

export function guardarExamenes(lista) {
  return guardar(CLAVES.examenes, lista);
}

export function obtenerResultados() {
  return leer(CLAVES.resultados, []);
}

export function guardarResultado(resultado) {
  const lista = leer(CLAVES.resultados, []);
  lista.push(resultado);
  return guardar(CLAVES.resultados, lista);
}

export function obtenerSesion() {
  return leer(CLAVES.sesion, null);
}

export function guardarSesion(usuario) {
  return guardar(CLAVES.sesion, {
    identificacion: usuario.identificacion,
    nombre: usuario.nombre,
    email: usuario.email,
    cargo: usuario.cargo
  });
}

export function cerrarSesionStorage() {
  try {
    localStorage.removeItem(CLAVES.sesion);
  } catch (e) {
    console.error("Error al cerrar la sesión:", e);
  }
}
