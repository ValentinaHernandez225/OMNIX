/**
 * Modulo: tickets.service.js.
 * Responsabilidad: Servicios de negocio o acceso a API: aplican reglas del dominio y consultan o modifican datos.
 */

import { API_URL } from "../config/api";// solicitar: coordina consultas o cambios de datos aplicando las reglas de negocio.
async function solicitar(token, ruta = "", opciones = {}) {
  const respuesta = await fetch(
    `${API_URL}/api/tickets${ruta}`,
    {
      method: opciones.method || "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        ...(opciones.body
          ? { "Content-Type": "application/json" }
          : {}),
      },
      cache: "no-store",
      signal: opciones.signal,
      ...(opciones.body
        ? { body: JSON.stringify(opciones.body) }
        : {}),
    }
  );

  const datos = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    const errores = [
      ...(Array.isArray(datos?.errores) ? datos.errores : []),
      ...(Array.isArray(datos?.errors) ? datos.errors : []),
    ]
      .map((e) => e.msg || e.mensaje)
      .filter(Boolean)
      .join("; ");

    const error = new Error(
      errores ||
      datos?.error ||
      datos?.mensaje ||
      `Error HTTP ${respuesta.status}`
    );

    error.status = respuesta.status;
    throw error;
  }

  return datos;
}// listarTickets: coordina consultas o cambios de datos aplicando las reglas de negocio.
export function listarTickets(token, estado, signal) {
  const parametros = new URLSearchParams();

  if (estado && estado !== "todos") {
    parametros.set("estado", estado);
  }

  const consulta = parametros.toString();

  return solicitar(
    token,
    consulta ? `?${consulta}` : "",
    { signal }
  );
}// obtenerTicket: coordina consultas o cambios de datos aplicando las reglas de negocio.
export function obtenerTicket(token, id) {
  return solicitar(token, `/${id}`);
}// crearTicket: coordina consultas o cambios de datos aplicando las reglas de negocio.
export function crearTicket(token, datos) {
  return solicitar(token, "", {
    method: "POST",
    body: datos,
  });
}// asignarTecnicoTicket: coordina consultas o cambios de datos aplicando las reglas de negocio.
export function asignarTecnicoTicket(token, id, tecnicoId) {
  return solicitar(token, `/${id}/asignar`, {
    method: "PATCH",
    body: {
      tecnico_id: Number(tecnicoId),
    },
  });
}// cambiarEstadoTicket: coordina consultas o cambios de datos aplicando las reglas de negocio.
export function cambiarEstadoTicket(
  token,
  id,
  estado,
  solucion
) {
  return solicitar(token, `/${id}/estado`, {
    method: "PATCH",
    body: {
      estado,
      ...(solucion !== undefined ? { solucion } : {}),
    },
  });
}
