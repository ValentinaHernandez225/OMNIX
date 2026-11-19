/**
 * Modulo: Login.jsx.
 * Responsabilidad: Pagina React: carga datos y coordina interacciones de la pantalla.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import EstadoBackend from "../components/EstadoBackend";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  // 1. Navegación y autenticación
  const navigate = useNavigate();
  const { login } = useAuth();

  // 2. Estados del formulario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  // 3. Procesar inicio de sesión
  async function manejarLogin(evento) {
    evento.preventDefault();

    setError("");
    setCargando(true);

    // Evitar conservar una bienvenida anterior
    sessionStorage.removeItem(
      "nexdesk_mostrar_bienvenida"
    );

    try {
      // Autenticación mediante la API REST
      const perfil = await login(email, password);

      // Verificar cambio obligatorio de contraseña
      if (
        perfil.debeCambiarPassword ||
        perfil.debe_cambiar_password
      ) {
        navigate("/cambiar-password", {
          replace: true,
        });
      } else {
        // Activar notificación de bienvenida
        sessionStorage.setItem(
          "nexdesk_mostrar_bienvenida",
          "1"
        );

        // Acceder al dashboard
        navigate("/dashboard", {
          replace: true,
        });
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No fue posible iniciar sesión."
      );
    } finally {
      setCargando(false);
    }
  }

  // 4. Interfaz de inicio de sesión
  return (
    <main className="omnix-login-page">
      <div className="omnix-login-orbit omnix-login-orbit-one" aria-hidden="true" />
      <div className="omnix-login-orbit omnix-login-orbit-two" aria-hidden="true" />
      <div className="omnix-login-shell">
        <section className="omnix-login-story" aria-label="Acerca de OMNIX">
          <a className="omnix-login-brand" href="/login" aria-label="OMNIX, inicio de sesi&#243;n">
            <img src="/omnix-logo.svg" alt="OMNIX" />
          </a>
          <div className="omnix-login-copy">
            <span className="omnix-login-kicker"><i /> SISTEMA DE SOPORTE T&#201;CNICO</span>
            <h1>Bienvenido a<br /><span>OMNIX</span></h1>
            <p>Gestiona tus tickets y da seguimiento a cada solicitud desde un solo lugar.</p>
          </div>
        </section>
        <section className="omnix-login-panel" aria-labelledby="login-title">
          <div className="omnix-login-panel-mark"><img src="/omnix-mark.svg" alt="" /></div>
          <div className="omnix-login-heading">
            <span className="omnix-login-mobile-brand">OMNIX <i>&middot;</i> TICKET SYSTEM</span>
            <h2 id="login-title">Iniciar <span>sesi&#243;n</span></h2><p>Accede a tu cuenta para continuar</p>
          </div>
          {error && <div className="alert alert-danger omnix-login-error" role="alert">{error}</div>}
          <form className="omnix-login-form" onSubmit={manejarLogin}>
            <label htmlFor="email">Correo electr&#243;nico</label>
            <div className="omnix-login-field"><span aria-hidden="true">@</span><input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" placeholder="nombre@empresa.com" required /></div>
            <label htmlFor="password">Contrase&#241;a</label>
            <div className="omnix-login-field"><span aria-hidden="true">*</span><input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" placeholder="Ingresa tu contrase&#241;a" required /></div>
            <button type="submit" className="omnix-login-submit" disabled={cargando}>INGRESAR</button>
          </form>
          <div className="omnix-login-backend"><EstadoBackend /></div>
          <p className="omnix-login-footer">Acceso autorizado <i>|</i> OMNIX</p>
        </section>
      </div>
    </main>
  );
}
