/**
 * Modulo: estado.service.js.
 * Responsabilidad: Servicios de negocio o acceso a API: aplican reglas del dominio y consultan o modifican datos.
 */
import { API_URL } from "../config/api";// consultarEstadoBackend: coordina consultas o cambios de datos aplicando las reglas de negocio.
export async function consultarEstadoBackend() {
  const respuesta = await fetch(`${API_URL}/api/estado`);

  if (!respuesta.ok) {
    throw new Error(`Error HTTP ${respuesta.status}`);
  }

  return respuesta.json();
}