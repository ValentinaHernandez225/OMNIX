/**
 * Modulo: CampanaNotificaciones.jsx.
 * Responsabilidad: Componente React reutilizable para una parte de la interfaz.
 */

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

import {
  listarNotificaciones,
  contarPendientes,
  marcarNotificacionLeida,
} from "../services/notificaciones.service";

export default function CampanaNotificaciones() {
  const { token, usuario } = useAuth();
  const navigate = useNavigate();

  const [abierto, setAbierto] = useState(false);
  const [avisos, setAvisos] = useState([]);
  const [pendientes, setPendientes] = useState(0);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const actualizar = useCallback(
    async (signal) => {
      if (!token) return;

      try {
        const [lista, cuenta] = await Promise.all([
          listarNotificaciones(token, signal),
          contarPendientes(token, signal),
        ]);

        if (signal?.aborted) return;

        setAvisos(lista);
        setPendientes(cuenta.pendientes);
        setError("");
      } catch (e) {
        if (!signal?.aborted) {
          setError(e.message);
        }
      }
    },
    [token]
  );

  // Consultar cada 30 segundos
  useEffect(() => {
    if (
      !token ||
      usuario?.debe_cambiar_password ||
      usuario?.debeCambiarPassword
    ) {
      return;
    }

    const controller = new AbortController();

    Promise.resolve().then(() =>
      actualizar(controller.signal)
    );

    const intervalo = setInterval(() => {
      actualizar(controller.signal);
    }, 30000);

    return () => {
      controller.abort();
      clearInterval(intervalo);
    };
  }, [
    token,
    usuario?.debe_cambiar_password,
    usuario?.debeCambiarPassword,
    actualizar,
  ]);  // leer: componente React que presenta esta parte de la interfaz y atiende las interacciones del usuario.
  async function leer(aviso) {
    if (cargando) return;

    setCargando(true);

    try {
      if (!aviso.leida) {
        await marcarNotificacionLeida(token, aviso.id);
      }

      await actualizar();
      setAbierto(false);

      if (aviso.ticket_id) {
        navigate("/tickets");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="position-relative">
      <button
        type="button"
        className="btn btn-light position-relative nexdesk-notifications-trigger"
        aria-label={`Notificaciones: ${pendientes} sin leer`}
        aria-expanded={abierto}
        onClick={() => {
          setAbierto(!abierto);

          if (!abierto) {
            void actualizar();
          }
        }}
      >
        <svg className="nexdesk-bell-icon" aria-hidden="true" viewBox="0 0 36 36" fill="none">
          <defs>
            <linearGradient id="bellMetal" x1="8" y1="5" x2="28" y2="32" gradientUnits="userSpaceOnUse"><stop stopColor="#fff" /><stop offset=".52" stopColor="#c8b8dc" /><stop offset="1" stopColor="#f4edff" /></linearGradient>
            <linearGradient id="bellViolet" x1="3" y1="23" x2="33" y2="12" gradientUnits="userSpaceOnUse"><stop stopColor="#7520dc" /><stop offset=".52" stopColor="#dfaaff" /><stop offset="1" stopColor="#8b2cff" /></linearGradient>
            <filter id="bellGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>
          <ellipse cx="18" cy="18" rx="16" ry="5.5" transform="rotate(-24 18 18)" stroke="url(#bellViolet)" strokeWidth="1.25" opacity=".9" />
          <path d="M18 7.8c-4.25 0-7.1 3.35-7.1 7.45v3.1c0 2.5-1.7 4.1-2.7 5.15-.55.58-.16 1.55.64 1.55h18.32c.8 0 1.19-.97.64-1.55-1-1.05-2.7-2.65-2.7-5.15v-3.1c0-4.1-2.85-7.45-7.1-7.45Z" fill="#110d19" stroke="url(#bellMetal)" strokeWidth="1.55" strokeLinejoin="round" />
          <path d="M14.5 28.2c.68 1.48 1.84 2.25 3.5 2.25s2.82-.77 3.5-2.25" stroke="url(#bellViolet)" strokeWidth="1.7" strokeLinecap="round" filter="url(#bellGlow)" />
          <path d="M4.2 22.6c5.9-1.65 15.1-5.15 25.3-10.15" stroke="url(#bellViolet)" strokeWidth="1.7" strokeLinecap="round" filter="url(#bellGlow)" />
        </svg>

        {pendientes > 0 && (
          <span
            className={
              "position-absolute top-0 start-100 " +
              "translate-middle badge rounded-pill nexdesk-notification-count"
            }
          >
            {pendientes > 99 ? "99+" : pendientes}
          </span>
        )}
      </button>

      {abierto && (
        <div
          className={
            "card shadow position-absolute end-0 mt-2 nexdesk-notifications-panel"
          }
          style={{
            width: "min(360px, 90vw)",
            zIndex: 1100,
          }}
        >
          <div
            className={
                "card-header nexdesk-notifications-header d-flex " +
              "justify-content-between align-items-center"
            }
          >
            <strong>Notificaciones</strong>

            <button
              type="button"
              className="btn-close"
              aria-label="Cerrar"
              onClick={() => setAbierto(false)}
            />
          </div>

          {error && (
            <div
              className="alert alert-warning m-2 small"
              role="alert"
            >
              {error}
            </div>
          )}

          <div
            className={
                "list-group list-group-flush overflow-auto nexdesk-notifications-list"
            }
            style={{ maxHeight: 360 }}
          >
            {avisos.length === 0 && (
              <div className="p-3 text-secondary small">
                No tienes notificaciones.
              </div>
            )}

            {avisos.map((aviso) => (
              <button
                key={aviso.id}
                type="button"
                disabled={cargando}
                onClick={() => leer(aviso)}
                className={
                    "list-group-item list-group-item-action nexdesk-notification-item " +
                  "text-start " +
                  (!aviso.leida
                    ? "nexdesk-notification-unread"
                    : "")
                }
              >
                <div
                  className={
                    "d-flex justify-content-between gap-2"
                  }
                >
                  <strong className="small">
                    {aviso.titulo}
                  </strong>

                  {!aviso.leida && (
                    <span className="badge nexdesk-notification-badge">
                      Nueva
                    </span>
                  )}
                </div>

                <div className="small">
                  {aviso.mensaje}
                </div>

                <small className="text-secondary">
                  {new Date(
                    aviso.fecha_creacion
                  ).toLocaleString("es-CO")}
                </small>
              </button>
            ))}
          </div>

          <div className="card-footer nexdesk-notifications-footer text-end">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={() => void actualizar()}
            >
              Actualizar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
