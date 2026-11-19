/**
 * Modulo: tecnicos.service.js.
 * Responsabilidad: Servicios de negocio o acceso a API: aplican reglas del dominio y consultan o modifican datos.
 */

import { API_URL } from "../config/api";// procesarRespuesta: coordina consultas o cambios de datos aplicando las reglas de negocio.
async function procesarRespuesta(respuesta) {
  const datos = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    const detalles = Array.isArray(datos?.errors)
      ? datos.errors
          .map((e) => e.msg)
          .filter(Boolean)
          .join("; ")
      : Array.isArray(datos?.errores)
        ? datos.errores
            .map((e) => e.msg || e.mensaje)
            .filter(Boolean)
            .join("; ")
        : "";

    const error = new Error(
      detalles ||
      datos?.error ||
      datos?.mensaje ||
      `Error HTTP ${respuesta.status}`
    );

    error.status = respuesta.status;
    throw error;
  }

  return datos;
}// solicitar: coordina consultas o cambios de datos aplicando las reglas de negocio.
async function solicitar(token, ruta, opciones = {}) {
  const respuesta = await fetch(
    `${API_URL}/api/tecnicos${ruta}`,
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

  return procesarRespuesta(respuesta);
}// listarTecnicos: coordina consultas o cambios de datos aplicando las reglas de negocio.
export function listarTecnicos(token, signal) {
  return solicitar(token, "/", { signal });
}// obtenerTecnico: coordina consultas o cambios de datos aplicando las reglas de negocio.
export function obtenerTecnico(token, id) {
  return solicitar(token, `/${id}`);
}// crearTecnico: coordina consultas o cambios de datos aplicando las reglas de negocio.
export function crearTecnico(token, datos) {
  return solicitar(token, "/", {
    method: "POST",
    body: datos,
  });
}// actualizarTecnico: coordina consultas o cambios de datos aplicando las reglas de negocio.
export function actualizarTecnico(token, id, datos) {
  return solicitar(token, `/${id}`, {
    method: "PUT",
    body: datos,
  });
}// cambiarDisponibilidadTecnico: coordina consultas o cambios de datos aplicando las reglas de negocio.
export function cambiarDisponibilidadTecnico(
  token,
  id,
  disponible
) {
  return solicitar(token, `/${id}/disponibilidad`, {
    method: "PATCH",
    body: { disponible },
  });
}
