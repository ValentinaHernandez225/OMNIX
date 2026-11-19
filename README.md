# OMNIX

**Sistema de gestión y seguimiento de tickets de soporte técnico.**

OMNIX es una plataforma web diseñada para centralizar la gestión de solicitudes de soporte técnico, facilitando el registro, clasificación, asignación y seguimiento de tickets mediante una interfaz intuitiva y organizada.

El sistema busca optimizar la comunicación entre administradores y técnicos, permitiendo mantener un control estructurado de las solicitudes y su estado durante todo el proceso de atención.

---

## Características principales

- Gestión y registro de tickets.
- Clasificación de solicitudes.
- Asignación de tickets a técnicos.
- Seguimiento del proceso de atención.
- Administración de usuarios y roles.
- Control del estado de las solicitudes.

## Flujo de gestión de tickets

OMNIX organiza el ciclo de vida de cada solicitud en seis etapas:

1. **Registrar:** creación de la solicitud.
2. **Clasificar:** identificación del tipo y prioridad del ticket.
3. **Asignar:** selección del responsable de atención.
4. **Atender:** gestión de la solicitud.
5. **Seguimiento:** supervisión del avance.
6. **Cerrar:** finalización del proceso.

## Roles del sistema

- **Superadministrador:** gestión general y administración del sistema.
- **Administrador:** gestión y supervisión de tickets.
- **Técnico:** atención y seguimiento de las solicitudes asignadas.

## Tecnologías utilizadas

| Área | Tecnología |
|---|---|
| Frontend | React |
| Lenguaje frontend | JavaScript |
| Backend | Node.js |
| Framework backend | Express |
| Base de datos | PostgreSQL |
| Servicio de base de datos | Supabase |
| Comunicación | API REST |

## Arquitectura del proyecto

OMNIX utiliza una arquitectura cliente-servidor que separa la interfaz de usuario, la lógica del servidor y la persistencia de los datos.

- **Frontend:** presenta la interfaz y permite la interacción con el usuario.
- **Backend:** procesa las solicitudes, ejecuta la lógica del sistema y gestiona la comunicación con la base de datos.
- **Base de datos:** almacena la información relacionada con usuarios y tickets.

## Estructura del repositorio

```text
OMNIX/
│
├── nexdesk-frontend/
│   └── Aplicación frontend
│
├── lab-node25_backend_seguro/
│   └── Aplicación backend
│
├── database/
│   └── Archivos relacionados con la base de datos
│
└── README.md
```

## Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone URL_DEL_REPOSITORIO
```

### 2. Acceder al proyecto

```bash
cd OMNIX
```

### 3. Configurar el frontend y el backend

Instalar las dependencias de cada aplicación utilizando:

```bash
npm install
```

### 4. Configurar las variables de entorno

Crear los archivos `.env` correspondientes en cada aplicación, utilizando como referencia los archivos de ejemplo y configurando las credenciales necesarias.

**Importante:** no publicar credenciales, contraseñas ni claves privadas en el repositorio.

### 5. Ejecutar las aplicaciones

Los comandos específicos de ejecución se encuentran definidos en el `package.json` de cada aplicación.

---

## Estado del proyecto

Proyecto en desarrollo.

## Autores

Desarrollado como proyecto académico de Ingeniería de Sistemas.

