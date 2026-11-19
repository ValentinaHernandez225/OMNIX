/**
 * Modulo: AnaliticaTickets.jsx.
 * Responsabilidad: Componente React reutilizable para una parte de la interfaz.
 */

import { useMemo } from "react";
import { Link } from "react-router-dom";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import FlechaVioleta from "./FlechaVioleta";

// ==========================================
// 1. ESTADOS Y COLORES
// ==========================================

const ESTADOS = [
  ["abierto", "Abiertos", "#9b42ff"],
  ["asignado", "Asignados", "#c06cff"],
  ["en_proceso", "En proceso", "#7622ed"],
  ["resuelto", "Resueltos", "#54d6b0"],
  ["cerrado", "Cerrados", "#73708a"],
  ["reabierto", "Reabiertos", "#ed6bc4"],
];

// ==========================================
// 2. UTILIDADES PARA EXPORTACIÓN CSV
// ==========================================

// Protege los campos CSV contra separadores,
// saltos de línea, comillas y fórmulas en Excel.
function escaparCSV(valor) {
  if (valor === null || valor === undefined) {
    return "";
  }

  let texto = String(valor);

  // Evita que Excel interprete como fórmula
  // un valor procedente de los tickets.
  if (/^\s*[=+@-]/.test(texto)) {
  texto = `'${texto}`;
}

  return `"${texto.replace(/"/g, '""')}"`;
}

// Convierte una fecha ISO a un formato legible.
function formatearFecha(fecha) {
  if (!fecha) return "";

  const valor = new Date(fecha);

  if (Number.isNaN(valor.getTime())) {
    return String(fecha);
  }

  return valor.toLocaleString("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

// Descarga un archivo CSV compatible con Excel.
function descargarCSV(nombreArchivo, filas) {
  const contenido = filas
    .map((fila) => fila.map(escaparCSV).join(";"))
    .join("\r\n");

  // BOM UTF-8 para reconocer tildes y ñ en Excel.
  const blob = new Blob(
    ["\uFEFF", contenido],
    {
      type: "text/csv;charset=utf-8;",
    }
  );

  const url = URL.createObjectURL(blob);

  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombreArchivo;

  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();

  URL.revokeObjectURL(url);
}

// ==========================================
// 3. COMPONENTE DE ANALÍTICA
// ==========================================

export default function AnaliticaTickets({
  tickets = [],
  cargando = false,
  error = "",
  onActualizar,
  usuariosTotal = null,
  esAdministrador = false,
  rolUsuario = "",
}) {

  // ========================================
  // 4. CALCULAR INDICADORES
  // ========================================

  const resumen = useMemo(() => {
    const total = tickets.length;

    const estados = ESTADOS.map(
      ([clave, nombre, color]) => ({
        clave,
        nombre,
        color,
        cantidad: tickets.filter(
          (ticket) => ticket.estado === clave
        ).length,
      })
    );

    const prioridades = [
      {
        nombre: "Alta",
        color: "#ed6bc4",
        cantidad: tickets.filter(
          (ticket) => ticket.prioridad === "alta"
        ).length,
      },
      {
        nombre: "Media",
        color: "#9b42ff",
        cantidad: tickets.filter(
          (ticket) => ticket.prioridad === "media"
        ).length,
      },
      {
        nombre: "Baja",
        color: "#54d6b0",
        cantidad: tickets.filter(
          (ticket) => ticket.prioridad === "baja"
        ).length,
      },
    ];

    const hoy = new Date();
    const actividadMensual = Array.from({ length: 6 }, (_, indice) => {
      const fechaMes = new Date(hoy.getFullYear(), hoy.getMonth() - 5 + indice, 1);
      const cantidad = tickets.filter((ticket) => {
        if (!ticket.fecha_creacion) return false;
        const fechaTicket = new Date(ticket.fecha_creacion);
        return !Number.isNaN(fechaTicket.getTime()) && fechaTicket.getFullYear() === fechaMes.getFullYear() && fechaTicket.getMonth() === fechaMes.getMonth();
      }).length;
      return { etiqueta: fechaMes.toLocaleDateString("es-CO", { month: "short" }).replace(".", ""), cantidad };
    });

    const activos = tickets.filter(
      (ticket) =>
        !["cerrado", "resuelto"].includes(ticket.estado)
    ).length;

    return {
      total,
      estados,
      prioridades,
      activos,
      actividadMensual,
    };
  }, [tickets]);

  const maxMes = Math.max(1, ...resumen.actividadMensual.map((mes) => mes.cantidad));
  const puntosMes = resumen.actividadMensual.map((mes, indice) => ({ ...mes, x: 42 + indice * 104, y: 154 - (mes.cantidad / maxMes) * 105 }));
  const puntosLinea = puntosMes.map((punto) => punto.x + "," + punto.y).join(" ");
  const puntosArea = "42,154 " + puntosLinea + " 562,154";
  const totalEstados = resumen.estados.reduce((suma, estado) => suma + estado.cantidad, 0);
  let avanceDonut = 0;
  const segmentosDonut = resumen.estados.map((estado) => {
    const inicio = avanceDonut;
    avanceDonut += totalEstados ? (estado.cantidad / totalEstados) * 100 : 0;
    return estado.color + " " + inicio + "% " + avanceDonut + "%";
  });
  const fondoDonut = totalEstados ? "conic-gradient(" + segmentosDonut.join(", ") + ")" : "conic-gradient(#292333 0 100%)";
  const indicadores = [
    ["Tickets totales", resumen.total, "/tickets?estado=todos"],
    ["Tickets abiertos", resumen.estados.find((estado) => estado.clave === "abierto")?.cantidad || 0, "/tickets?estado=abierto"],
    ["Resueltos", resumen.estados.find((estado) => estado.clave === "resuelto")?.cantidad || 0, "/tickets?estado=resuelto"],
    ...(esAdministrador ? [[rolUsuario === "superadmin" ? "Usuarios registrados" : "Cuentas visibles", usuariosTotal ?? "--", "/usuarios"]] : [["Cerrados", resumen.estados.find((estado) => estado.clave === "cerrado")?.cantidad || 0, "/tickets?estado=cerrado"]]),
  ];

  // ========================================
  // 5. EXPORTAR REPORTE CSV
  // ========================================

  function exportarReporteCSV() {
    if (cargando || error || tickets.length === 0) {
      return;
    }

    const encabezados = [
      "ID",
      "Título",
      "Descripción",
      "Prioridad",
      "Estado",
      "Usuario ID",
      "Técnico ID",
      "Categoría ID",
      "Solución",
      "Fecha de creación",
      "Fecha de actualización",
      "Fecha de cierre",
    ];

    const registros = tickets.map((ticket) => [
      ticket.id,
      ticket.titulo,
      ticket.descripcion,
      ticket.prioridad,
      ticket.estado,
      ticket.usuario_id,
      ticket.tecnico_id,
      ticket.categoria_id,
      ticket.solucion,
      formatearFecha(ticket.fecha_creacion),
      formatearFecha(ticket.fecha_actualizacion),
      formatearFecha(ticket.fecha_cierre),
    ]);

    const filas = [
      encabezados,
      ...registros,
    ];

    const fecha = new Date()
      .toLocaleDateString("sv-SE");

    const nombreArchivo =
      `OMNIX_reporte_tickets_${fecha}.csv`;

    descargarCSV(nombreArchivo, filas);
  }

  // ========================================
  // 5B. EXPORTAR REPORTE PDF
  // ========================================

  function exportarReportePDF() {
    if (cargando || error || tickets.length === 0) return;

    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const ancho = pdf.internal.pageSize.getWidth();
    const fechaGeneracion = formatearFecha(new Date());
    const azul = [112, 35, 205];
    const gris = [82, 95, 111];
    const margen = 14;

    pdf.setFillColor(...azul);
    pdf.rect(0, 0, ancho, 28, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(19);
    pdf.text("OMNIX", margen, 13);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text("Sistema Integral de Gestion de Soporte Tecnico", margen, 20);
    pdf.text("REPORTE DE GESTION", ancho - margen, 15, { align: "right" });

    pdf.setTextColor(...gris);
    pdf.setFontSize(9);
    pdf.text(`Generado: ${fechaGeneracion}`, margen, 35);
    pdf.text("Alcance: tickets visibles para el usuario autenticado", margen, 41);

    const resueltos = resumen.estados.find((e) => e.clave === "resuelto")?.cantidad ?? 0;
    const cerrados = resumen.estados.find((e) => e.clave === "cerrado")?.cantidad ?? 0;
    const metricas = [
      ["Tickets visibles", resumen.total],
      ["En atencion / pendientes", resumen.activos],
      ["Resueltos", resueltos],
      ["Cerrados", cerrados],
    ];
    const espacio = (ancho - 2 * margen - 9) / 4;
    metricas.forEach(([etiqueta, valor], i) => {
      const x = margen + i * (espacio + 3);
      pdf.setFillColor(241, 245, 249);
      pdf.roundedRect(x, 47, espacio, 22, 2, 2, "F");
      pdf.setTextColor(...gris);
      pdf.setFontSize(8);
      pdf.text(etiqueta, x + 4, 54);
      pdf.setTextColor(...azul);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(15);
      pdf.text(String(valor), x + 4, 64);
      pdf.setFont("helvetica", "normal");
    });

    pdf.setTextColor(...azul);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text("Por estado", margen, 79);
    pdf.text("Por prioridad", ancho / 2 + 4, 79);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(45, 55, 72);
    resumen.estados.forEach((e, i) => {
      pdf.text(`${e.nombre}: ${e.cantidad}`, margen, 86 + i * 5);
    });
    resumen.prioridades.forEach((p, i) => {
      pdf.text(`${p.nombre}: ${p.cantidad}`, ancho / 2 + 4, 86 + i * 6);
    });

    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...azul);
    pdf.setFontSize(10);
    pdf.text("Detalle de tickets", margen, 123);

    const columnas = [
      "ID", "Titulo", "Prioridad", "Estado", "Usuario ID",
      "Tecnico ID", "Categoria ID", "Fecha creacion", "Fecha cierre",
    ];
    const filas = tickets.map((t) => [
      String(t.id ?? ""),
      String(t.titulo ?? ""),
      String(t.prioridad ?? ""),
      String(t.estado ?? ""),
      String(t.usuario_id ?? ""),
      String(t.tecnico_id ?? "Sin asignar"),
      String(t.categoria_id ?? ""),
      formatearFecha(t.fecha_creacion) || "No disponible",
      formatearFecha(t.fecha_cierre) || "No aplica",
    ]);

    autoTable(pdf, {
      head: [columnas],
      body: filas,
      startY: 127,
      margin: { left: margen, right: margen, bottom: 16 },
      theme: "striped",
      styles: { font: "helvetica", fontSize: 7, cellPadding: 2.3, overflow: "linebreak" },
      headStyles: { fillColor: azul, textColor: [255, 255, 255], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 248, 251] },
      columnStyles: { 1: { cellWidth: 58 }, 7: { cellWidth: 31 }, 8: { cellWidth: 31 } },
    });

    const paginas = pdf.getNumberOfPages();
    for (let pagina = 1; pagina <= paginas; pagina += 1) {
      pdf.setPage(pagina);
      const alto = pdf.internal.pageSize.getHeight();
      pdf.setDrawColor(220, 226, 234);
      pdf.line(margen, alto - 12, ancho - margen, alto - 12);
      pdf.setTextColor(...gris);
      pdf.setFontSize(8);
      pdf.text("OMNIX | Reporte de tickets", margen, alto - 7);
      pdf.text(`Pagina ${pagina} de ${paginas}`, ancho - margen, alto - 7, { align: "right" });
    }

    const fechaArchivo = new Date().toLocaleDateString("sv-SE");
    pdf.save(`OMNIX_reporte_tickets_${fechaArchivo}.pdf`);
  }

  // ========================================
  // 6. INTERFAZ
  // ========================================

  return (
    <section
      className="mb-4"
      aria-label="Analítica de tickets"
    >

      {/* ENCABEZADO */}

      <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap mb-3">

        <div>
          <h2 className="h5 fw-bold mb-1">
            Analítica de soporte
          </h2>

          <p className="text-secondary small mb-0">
            Datos de tickets visibles según tu rol
          </p>
        </div>

        <div className="d-flex gap-2 flex-wrap">

          <button
            type="button"
            className="btn btn-sm btn-outline-success"
            onClick={exportarReporteCSV}
            disabled={
              cargando ||
              Boolean(error) ||
              tickets.length === 0
            }
            title="Descargar reporte de tickets en CSV"
          >
            <span aria-hidden="true">↓ </span>
            Exportar CSV
          </button>

          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={exportarReportePDF}
            disabled={cargando || Boolean(error) || tickets.length === 0}
            title="Descargar reporte de tickets en PDF"
          >
            <span aria-hidden="true">↓ </span>
            Exportar PDF
          </button>

          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={onActualizar}
            disabled={cargando || !onActualizar}
          >
            {cargando
              ? "Actualizando..."
              : "Actualizar gráficas"}
          </button>

        </div>

      </div>

      {/* MENSAJE DE ERROR */}

      {error && (
        <div
          className="alert alert-warning"
          role="alert"
        >
          No se pudieron cargar las gráficas: {error}
        </div>
      )}

      {/* =====================================
          7. TARJETAS DE INDICADORES
      ===================================== */}

      <div className="row g-3 mb-3">

        {indicadores.map(([nombre, valor, ruta], indice) => (
          <div className="col-6 col-xl-3" key={nombre}>
            <Link to={ruta} className="omnix-kpi-link">
              <div className="card omnix-kpi-card h-100">
                <div className="card-body p-3 p-lg-4">
                  <div className="omnix-kpi-top"><span className={"omnix-kpi-mark tone-" + (indice + 1)}>{["T", "P", "R", "U"][indice]}</span><FlechaVioleta className="omnix-kpi-arrow" /></div>
                  <div className="omnix-kpi-value">{cargando && !tickets.length ? "--" : valor}</div>
                  <div className="small text-secondary">{nombre}</div>
                </div>
              </div>
            </Link>
          </div>
        ))}

      </div>

      <div className="row g-3">
        <div className="col-12 col-xl-8">
          <article className="card omnix-chart-card h-100"><div className="card-body p-3 p-lg-4">
            <div className="omnix-chart-heading"><div><span className="omnix-chart-kicker">TENDENCIA</span><h3>Tickets creados</h3></div><span className="omnix-chart-period">Ultimos 6 meses</span></div>
            <div className="omnix-line-chart-wrap"><svg className="omnix-line-chart" viewBox="0 0 604 200" role="img" aria-label="Tickets creados por mes durante los ultimos seis meses">
              <defs><linearGradient id="actividadFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#a855f7" stopOpacity=".27"/><stop offset="1" stopColor="#a855f7" stopOpacity="0"/></linearGradient></defs>
              {[45, 98, 154].map((y) => <line key={y} x1="38" x2="570" y1={y} y2={y} className="omnix-chart-gridline" />)}
              <polygon points={puntosArea} fill="url(#actividadFill)" /><text x="31" y="49" textAnchor="end" className="omnix-chart-label">{maxMes}</text><text x="31" y="157" textAnchor="end" className="omnix-chart-label">0</text><polyline points={puntosLinea} className="omnix-chart-line" />
              {puntosMes.map((punto) => <g key={punto.etiqueta}><circle cx={punto.x} cy={punto.y} r="4" className="omnix-chart-point"><title>{punto.cantidad} tickets</title></circle><text x={punto.x} y="184" textAnchor="middle" className="omnix-chart-label">{punto.etiqueta}</text></g>)}
            </svg></div>
            <div className="omnix-chart-footer"><span>Actividad registrada en el periodo</span><Link to="/tickets">Ver tickets <FlechaVioleta /></Link></div>
          </div></article>
        </div>
        <div className="col-12 col-xl-4">
          <article className="card omnix-chart-card h-100"><div className="card-body p-3 p-lg-4">
            <div className="omnix-chart-heading"><div><span className="omnix-chart-kicker">ESTADO ACTUAL</span><h3>Distribucion</h3></div><Link className="omnix-chart-action" to="/tickets">Ver todos</Link></div>
            <div className="omnix-donut-layout"><div className="omnix-donut" style={{ background: fondoDonut }} role="img" aria-label={"Distribucion de " + totalEstados + " tickets por estado"}><div className="omnix-donut-hole"><strong>{resumen.total}</strong><span>tickets</span></div></div>
              <div className="omnix-donut-legend">{resumen.estados.slice(0, 5).map((estado) => <div className="omnix-legend-row" key={estado.clave}><span><i style={{ backgroundColor: estado.color }} />{estado.nombre}</span><strong>{estado.cantidad}</strong></div>)}</div>
            </div>
          </div></article>
        </div>
      </div>
      <div className="row g-3 mt-1"><div className="col-12">
        <article className="card omnix-chart-card"><div className="card-body p-3 p-lg-4">
          <div className="omnix-chart-heading"><div><span className="omnix-chart-kicker">CAPACIDAD DE ATENCION</span><h3>Tickets por prioridad</h3></div><Link className="omnix-chart-action" to="/tickets">Gestionar tickets</Link></div>
          <div className="row g-3">{resumen.prioridades.map((prioridad) => <div className="col-12 col-md-4" key={prioridad.nombre}><div className="omnix-priority-row"><span>{prioridad.nombre}</span><strong>{prioridad.cantidad}</strong></div><div className="progress omnix-priority-track" role="progressbar" aria-label={"Prioridad " + prioridad.nombre} aria-valuenow={prioridad.cantidad} aria-valuemin={0} aria-valuemax={Math.max(1, resumen.total)}><div className="progress-bar" style={{ width: (resumen.total ? (prioridad.cantidad / resumen.total) * 100 : 0) + "%", backgroundColor: prioridad.color }} /></div></div>)}</div>
        </div></article>
      </div></div>
    </section>
  );
}
