
# Acme School - Plataforma de Gestion y Resolucion de Examenes

Aplicacion web desarrollada con **HTML5, CSS3 y JavaScript (ES Modules & Web Components)** para la administracion de usuarios, creacion de evaluaciones academicas, resolucion de examenes con temporizador en tiempo real y consulta de resultados segun el rol del usuario.

---

## Caracteristicas Principales

- **Autenticacion y Control de Roles:** Inicio de sesion con permisos diferenciados para tres perfiles:
  - **Administrativo:** Gestion completa de usuarios, creacion/edicion/eliminacion de examenes y acceso a la tabla general de resultados.
  - **Docente:** Creacion y administracion de examenes, visualizacion de calificaciones y consulta de resultados en el modulo publico de examenes.
  - **Estudiante:** Acceso a los examenes disponibles, presentacion de evaluaciones con limite de tiempo y visualizacion inmediata de su calificacion al finalizar.
- **Resolucion de Examenes en Tiempo Real:**
  - Temporizador regresivo integrado (`<exam-timer>`) con entrega automatica al agotarse el tiempo.
  - Calculo automatico de puntaje sobre escala de 0 a 100 y registro del intento.
- **Arquitectura Modular y Web Components:**
  - Componentes reutilizables construidos con Custom Elements (`<acme-navbar>`, `<exam-card>`, `<exam-timer>`).
  - Logica separada por responsabilidades (autenticacion, usuarios, examenes, reproductor de examen, almacenamiento y utilidades).
- **Persistencia Local:** Almacenamiento estructurado de usuarios, examenes y resultados mediante `localStorage`, con datos iniciales precargados para pruebas rapidas.

---

## Estructura del Proyecto

```text
-Acme-School/
├── index.html                  # Vista principal y contenedores de modulos
├── README.md                   # Documentacion del proyecto
├── css/
│   └── styles.css              # Estilos generales, diseno responsivo y barra superior fija
└── js/
    ├── app.js                  # Punto de entrada, navegacion y control de sesion
    ├── components/
    │   ├── acme-navbar.js      # Web Component de la barra de navegacion superior
    │   ├── exam-card.js        # Web Component para tarjetas de examenes
    │   └── exam-timer.js       # Web Component del temporizador en vivo
    ├── modules/
    │   ├── auth.js             # Logica de inicio y cierre de sesion
    │   ├── users.js            # CRUD de usuarios y asignacion de roles
    │   ├── exams.js            # CRUD de examenes y preguntas
    │   └── quiz-player.js      # Logica de presentacion, calificacion y tabla de resultados
    ├── storage/
    │   └── database.js         # Capa de persistencia en localStorage y datos iniciales
    └── utils/
        └── escape.js           # Sanitizacion de texto para prevenir inyeccion HTML/CSS