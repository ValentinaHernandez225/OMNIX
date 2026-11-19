/**
 * Modulo: notificaciones.service.js.
 * Responsabilidad: Servicios de negocio o acceso a API: aplican reglas del dominio y consultan o modifican datos.
 */

import { API_URL } from "../config/api";// solicitar: coordina consultas o cambios de datos aplicando las reglas de negocio.
async function solicitar(token, ruta, opciones = {}) {
  const respuesta = await fetch(
    `${API_URL}/api/notificaciones${ruta}`,
    {
      method: opciones.method || "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: opciones.signal,
    }
  );

  const datos = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    throw new Error(
      datos?.error || `Error HTTP ${respuesta.status}`
    );
  }

  return datos;
}// listarNotificaciones: coordina consultas o cambios de datos aplicando las reglas de negocio.
export function listarNotificaciones(token, signal) {
  return solicitar(token, "/", { signal });
}// contarPendientes: coordina consultas o cambios de datos aplicando las reglas de negocio.
export function contarPendientes(token, signal) {
  return solicitar(token, "/pendientes", { signal });
}// marcarNotificacionLeida: coordina consultas o cambios de datos aplicando las reglas de negocio.
export function marcarNotificacionLeida(token, id) {
  return solicitar(token, `/${id}/leida`, {
    method: "PATCH",
  });
}
