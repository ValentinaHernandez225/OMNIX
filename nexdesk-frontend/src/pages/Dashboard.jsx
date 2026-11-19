/**
 * Modulo: Dashboard.jsx.
 * Responsabilidad: Pagina React: carga datos y coordina interacciones de la pantalla.
 */
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { menuPorRol } from "../config/menu";
import ToastBienvenida from "../components/ToastBienvenida";
import FlujoTickets from "../components/FlujoTickets";
import AnaliticaTickets from "../components/AnaliticaTickets";
import FlechaVioleta from "../components/FlechaVioleta";
import { listarTickets } from "../services/tickets.service";
import { listarUsuarios } from "../services/usuarios.service";

function IconoAcceso({ ruta }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ruta === "/tickets" && <><rect x="4" y="5" width="16" height="14" rx="3" /><path d="M8 9h8M8 13h5" /></>}
      {ruta === "/usuarios" && <><circle cx="9" cy="8" r="3" /><path d="M3.5 19c.3-3 2.2-4.7 5.5-4.7 3.2 0 5.2 1.7 5.5 4.7M17 8v6m-3-3h6" /></>}
      {ruta === "/tecnicos" && <><circle cx="10" cy="8" r="3" /><path d="M4 19c.3-3 2.4-4.8 6-4.8 1.7 0 3.1.4 4.1 1.3M18 5v5m-2.5-2.5h5" /></>}
      {ruta === "/categorias" && <><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></>}
      {ruta === "/seguimientos" && <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3.2 2" /></>}
      {!["/tickets", "/usuarios", "/tecnicos", "/categorias", "/seguimientos"].includes(ruta) && <><rect x="4" y="4" width="16" height="16" rx="4" /><path d="M8 12h8M12 8v8" /></>}
    </svg>
  );
}

export default function Dashboard() {
  const { usuario, token } = useAuth();
  const [ticketsAnalitica, setTicketsAnalitica] = useState([]);
  const [cargandoAnalitica, setCargandoAnalitica] = useState(true);
  const [errorAnalitica, setErrorAnalitica] = useState("");
  const [recargaAnalitica, setRecargaAnalitica] = useState(0);
  const [usuariosTotal, setUsuariosTotal] = useState(null);
  const esAdministrador = ["superadmin", "admin"].includes(usuario?.rol);

  useEffect(() => {
    if (!token) return undefined;
    const controlador = new AbortController();
    // cargarAnalitica: React component that presents this part of the interface and handles its user interactions.
    async function cargarAnalitica() {
      setCargandoAnalitica(true);
      try {
        const datos = await listarTickets(token, "todos", controlador.signal);
        if (!Array.isArray(datos)) {
          throw new Error("El servidor no devolvió una lista de tickets.");
        }
        if (!controlador.signal.aborted) {
          setTicketsAnalitica(datos);
          setErrorAnalitica("");
        }
      } catch (err) {
        if (!controlador.signal.aborted) {
          setErrorAnalitica(err instanceof Error ? err.message : "Error de consulta");
        }
      } finally {
        if (!controlador.signal.aborted) setCargandoAnalitica(false);
      }
    }

    cargarAnalitica();
    return () => controlador.abort();
  }, [token, recargaAnalitica]);

  useEffect(() => {
    if (!token || !esAdministrador) {
      setUsuariosTotal(null);
      return undefined;
    }
    const controlador = new AbortController();
    listarUsuarios(token, controlador.signal)
      .then((usuarios) => {
        if (!controlador.signal.aborted && Array.isArray(usuarios)) {
          setUsuariosTotal(usuarios.length);
        }
      })
      .catch(() => {
        if (!controlador.signal.aborted) setUsuariosTotal(null);
      });
    return () => controlador.abort();
  }, [token, esAdministrador]);

  const [mostrarBienvenida, setMostrarBienvenida] = useState(
    () => sessionStorage.getItem("nexdesk_mostrar_bienvenida") === "1"
  );

  const cerrarBienvenida = useCallback(() => {
    sessionStorage.removeItem("nexdesk_mostrar_bienvenida");
    setMostrarBienvenida(false);
  }, []);

  const nombre = usuario?.nombre?.split(" ")[0] || "usuario";
  const opciones = menuPorRol(usuario?.rol);
  const modulos = opciones.filter((opcion) => opcion.ruta !== "/dashboard");
  const fechaActual = new Date().toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const descripciones = {
    "/usuarios": "Administración de cuentas y permisos.",
    "/tecnicos": "Gestión del personal de soporte.",
    "/categorias": "Clasificación de solicitudes.",
    "/tickets": "Registro y gestión de incidentes.",
    "/seguimientos": "Trazabilidad de las atenciones.",
  };

  return (
    <div className="container-fluid omnix-dashboard">
      <section className="omnix-hero mb-4">
        <div className="omnix-hero-grid" aria-hidden="true" />
        <div className="omnix-hero-content">
          <div className="omnix-eyebrow">
            <span className="omnix-status-dot" /> CENTRO DE OPERACIONES
          </div>
          <h1 className="h2 fw-bold mb-2">Hola, {nombre}</h1>
          <p className="omnix-hero-description mb-4">
            Todo el soporte de tu organización, en un solo lugar.
          </p>
          <div className="d-flex flex-wrap gap-2">
            <Link to="/tickets" className="btn btn-primary omnix-hero-cta">
              Ir a tickets <FlechaVioleta />
            </Link>
            {esAdministrador ? (
              <Link to="/usuarios" className="btn omnix-hero-secondary">
                Administrar usuarios
              </Link>
            ) : (
              <Link to="/perfil" className="btn omnix-hero-secondary">
                Editar mi perfil
              </Link>
            )}
          </div>
        </div>

        <aside className="omnix-hero-profile">
          <div className="omnix-profile-topline">
            <span className="omnix-profile-label">SESIÓN ACTIVA</span>
            <span className="omnix-profile-mark" aria-hidden="true">O</span>
          </div>
          <div className="omnix-profile-avatar">
            {usuario?.nombre?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <h2 className="h5 mb-1">
            {[usuario?.nombre, usuario?.apellido].filter(Boolean).join(" ") || "Usuario"}
          </h2>
          <p className="omnix-profile-email mb-3">{usuario?.email}</p>
          <div className="omnix-profile-meta">
            <span className="badge omnix-role-badge">{usuario?.rol || "Cuenta"}</span>
            <span className="omnix-date">{fechaActual}</span>
          </div>
        </aside>
      </section>

      <AnaliticaTickets
        tickets={ticketsAnalitica}
        cargando={cargandoAnalitica}
        error={errorAnalitica}
        onActualizar={() => setRecargaAnalitica((n) => n + 1)}
        usuariosTotal={usuariosTotal}
        esAdministrador={esAdministrador}
        rolUsuario={usuario?.rol}
      />

      <section className="omnix-modules-section mb-4">
        <div className="omnix-section-heading">
          <div>
            <span className="omnix-section-kicker">ESPACIOS DE TRABAJO</span>
            <h2 className="h4 fw-bold mb-1">Accesos r&aacute;pidos</h2>
            <p className="text-secondary small mb-0">Herramientas disponibles seg&uacute;n tu rol.</p>
          </div>
          <span className="omnix-module-count">{modulos.length} accesos</span>
        </div>

        <div className="row g-3">
          {modulos.map((modulo, indice) => (
            <div className="col-12 col-sm-6 col-xl-3" key={modulo.ruta}>
              <Link to={modulo.ruta} className="omnix-access-card">
                <div className="omnix-access-card-top">
                  <span className="omnix-access-icon"><IconoAcceso ruta={modulo.ruta} /></span>
                  <span className="omnix-access-index">{String(indice + 1).padStart(2, "0")}</span>
                </div>
                <div className="omnix-access-copy">
                  <h3>{modulo.titulo}</h3>
                  <p>{descripciones[modulo.ruta]}</p>
                </div>
                <span className="omnix-access-action">Abrir m&oacute;dulo <FlechaVioleta /></span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="omnix-workflow-section mb-4">
        <FlujoTickets />
      </section>

      {mostrarBienvenida && (
        <ToastBienvenida nombre={nombre} onCerrar={cerrarBienvenida} />
      )}
    </div>
  );
}
