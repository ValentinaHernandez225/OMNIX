/**
 * Modulo: api.js.
 * Responsabilidad: Configuracion y conexiones con servicios externos.
 */
// Solo configuraciones públicas: nunca colocar secretos en VITE_*.
export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");
