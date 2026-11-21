
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
    titulo: "Basicos de JavaScript",
    tiempoMinutos: 5,
    porcentajeAprobacion: 70,
    descripcion: "Preguntas sobre variables, funciones y logica.",
    preguntas: [
      {
        id: "p1",
        texto: "Que palabra declara una variable que puede cambiar de valor?",
        opciones: [
          { id: "o1", texto: "let", correcta: true },
          { id: "o2", texto: "const", correcta: false },
          { id: "o3", texto: "function", correcta: false }
        ]
      },
      {
        id: "p2",
        texto: "Como se guarda un arreglo u objeto en localStorage?",
        opciones: [
          { id: "o1", texto: "JSON.stringify()", correcta: true },
          { id: "o2", texto: "JSON.parse()", correcta: false },
          { id: "o3", texto: "Number()", correcta: false }
        ]
      }
    ]
  }
];

function leer(clave, defecto) {
  const dato = localStorage.getItem(clave);
  if (!dato) return defecto;
  try {
    return JSON.parse(dato);
  } catch (e) {
    return defecto;
  }
}

function guardar(clave, valor) {
  localStorage.setItem(clave, JSON.stringify(valor));
}

export function iniciarBaseDatos() {
  if (!localStorage.getItem(CLAVES.usuarios)) {
    guardar(CLAVES.usuarios, usuariosIniciales);
  }
  if (!localStorage.getItem(CLAVES.examenes)) {
    guardar(CLAVES.examenes, examenesIniciales);
  }
  if (!localStorage.getItem(CLAVES.resultados)) {
    guardar(CLAVES.resultados, []);
  }
}

export function obtenerUsuarios() {
  return leer(CLAVES.usuarios, []);
}

export function guardarUsuarios(lista) {
  guardar(CLAVES.usuarios, lista);
}

export function obtenerExamenes() {
  return leer(CLAVES.examenes, []);
}

export function guardarExamenes(lista) {
  guardar(CLAVES.examenes, lista);
}

export function guardarResultado(resultado) {
  const lista = leer(CLAVES.resultados, []);
  lista.push(resultado);
  guardar(CLAVES.resultados, lista);
}

export function obtenerSesion() {
  return leer(CLAVES.sesion, null);
}

export function guardarSesion(usuario) {
  guardar(CLAVES.sesion, {
    identificacion: usuario.identificacion,
    nombre: usuario.nombre,
    email: usuario.email,
    cargo: usuario.cargo
  });
}

export function cerrarSesionStorage() {
  localStorage.removeItem(CLAVES.sesion);
}