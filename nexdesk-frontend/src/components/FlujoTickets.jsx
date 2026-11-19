import { useState } from "react";
import { Link } from "react-router-dom";
import FlechaVioleta from "./FlechaVioleta";

const etapas = [
  { id: 1, titulo: "Registrar", actor: "Usuario", descripcion: "El usuario registra una solicitud de soporte y describe el incidente o requerimiento.", resultado: "Se crea un ticket en estado abierto." },
  { id: 2, titulo: "Clasificar", actor: "Sistema / soporte", descripcion: "La solicitud se organiza mediante su categor\u00eda y prioridad para facilitar su atenci\u00f3n.", resultado: "El ticket queda identificado para su gesti\u00f3n." },
  { id: 3, titulo: "Asignar", actor: "Administrador", descripcion: "Un responsable autorizado asigna el ticket a un t\u00e9cnico disponible.", resultado: "El ticket queda asociado a un t\u00e9cnico." },
  { id: 4, titulo: "Atender", actor: "T\u00e9cnico", descripcion: "El t\u00e9cnico analiza la solicitud y realiza las acciones necesarias para resolverla.", resultado: "El ticket pasa a estado en proceso." },
  { id: 5, titulo: "Seguimiento", actor: "T\u00e9cnico / soporte", descripcion: "Se registran observaciones, actividades y avances para mantener la trazabilidad.", resultado: "El historial conserva el detalle de la atenci\u00f3n." },
  { id: 6, titulo: "Cerrar", actor: "Responsable autorizado", descripcion: "Al completar la atenci\u00f3n, el responsable registra la soluci\u00f3n y cierra el ticket.", resultado: "El ticket pasa a estado cerrado." },
];

function IconoEtapa({ id }) {
  const props = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" };
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      {id === 1 && <><circle cx="12" cy="8" r="3.2" /><path d="M5.5 20c.4-3.4 2.8-5.2 6.5-5.2s6.1 1.8 6.5 5.2" /></>}
      {id === 2 && <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></>}
      {id === 3 && <><circle cx="9" cy="8" r="3" /><path d="M3.5 19c.3-3 2.2-4.7 5.5-4.7 1.5 0 2.8.4 3.8 1.2M18 12v7m-3.5-3.5h7" /></>}
      {id === 4 && <><circle cx="12" cy="12" r="8.5" /><path d="m8 12.2 2.6 2.6L16.5 9" /></>}
      {id === 5 && <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3.2 2" /></>}
      {id === 6 && <><path d="M6 20V4m1 1h10l-2.4 3L17 11H7" /><path d="M4 20h4" /></>}
    </svg>
  );
}

export default function FlujoTickets() {
  const [seleccionada, setSeleccionada] = useState(1);
  const etapa = etapas.find((item) => item.id === seleccionada) || etapas[0];

  function siguiente() {
    setSeleccionada((actual) => actual === etapas.length ? 1 : actual + 1);
  }

  return (
    <section className="omnix-flow-card" aria-labelledby="titulo-flujo">
      <header className="omnix-flow-header">
        <div>
          <span className="omnix-flow-kicker">PROCESO DE SOPORTE</span>
          <h2 id="titulo-flujo">Flujo de atenci&oacute;n</h2>
          <p>Etapas de una solicitud, desde el registro hasta el cierre.</p>
        </div>
        <Link to="/tickets" className="omnix-flow-tickets-link">Gesti&oacute;n de tickets <FlechaVioleta /></Link>
      </header>

      <div className="omnix-flow-scroll">
        <div className="omnix-flow-timeline" role="group" aria-label="Etapas interactivas del flujo de atenci&oacute;n">
          {etapas.map((item) => {
            const activa = seleccionada === item.id;
            return (
              <button key={item.id} type="button" className={"omnix-flow-stage" + (activa ? " activa" : "")} aria-pressed={activa} onClick={() => setSeleccionada(item.id)}>
                <span className="omnix-flow-node"><IconoEtapa id={item.id} /></span>
                <strong>{item.id}. {item.titulo}</strong>
                <small>{item.actor}</small>
              </button>
            );
          })}
        </div>
      </div>

      <div className="omnix-flow-detail" aria-live="polite">
        <div className="omnix-flow-detail-icon"><IconoEtapa id={etapa.id} /></div>
        <div className="omnix-flow-detail-copy">
          <span>ETAPA {etapa.id} DE {etapas.length}</span>
          <h3>{etapa.titulo}</h3>
          <p>{etapa.descripcion}</p>
        </div>
        <div className="omnix-flow-detail-meta">
          <div><span>RESPONSABLE</span><strong>{etapa.actor}</strong></div>
          <div><span>RESULTADO</span><strong>{etapa.resultado}</strong></div>
        </div>
        <button type="button" className="omnix-flow-next" onClick={siguiente}>{seleccionada === etapas.length ? "Reiniciar" : "Siguiente"}<FlechaVioleta /></button>
      </div>

      <p className="omnix-flow-status-note"><strong>Estados del ticket:</strong> Abierto <FlechaVioleta className="omnix-arrow-compact" /> Asignado <FlechaVioleta className="omnix-arrow-compact" /> En proceso <FlechaVioleta className="omnix-arrow-compact" /> Resuelto <FlechaVioleta className="omnix-arrow-compact" /> Cerrado. Los tickets reabiertos pueden volver a asignaci&oacute;n.</p>
    </section>
  );
}
