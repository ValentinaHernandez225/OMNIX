/**
 * Modulo: useAuth.js.
 * Responsabilidad: Hook de React reutilizable.
 */
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.js";
// useAuth: reusable hook for accessing shared behavior.
export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error("useAuth debe utilizarse dentro de AuthProvider");
  return contexto;
}
