/**
 * Pagina para editar los datos del perfil autenticado.
 */
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";

const CAMPOS_INICIALES = { nombre: "", apellido: "", email: "", tipo_documento: "CC", numero_documento: "" };

export default function Perfil() {
  const { usuario, actualizarPerfil } = useAuth();
  const [campos, setCampos] = useState(CAMPOS_INICIALES);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!usuario) return;
    setCampos({ nombre: usuario.nombre || "", apellido: usuario.apellido || "", email: usuario.email || "", tipo_documento: usuario.tipoDocumento || "CC", numero_documento: usuario.numeroDocumento || "" });
  }, [usuario]);

  function cambiarCampo(evento) {
    const { name, value } = evento.target;
    setCampos((actuales) => ({ ...actuales, [name]: value }));
  }

  async function guardar(evento) {
    evento.preventDefault();
    setGuardando(true); setMensaje(""); setError("");
    try {
      await actualizarPerfil(campos);
      setMensaje("Los datos de tu perfil se guardaron correctamente.");
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : "No se pudo guardar el perfil.");
    } finally { setGuardando(false); }
  }

  return (
    <main className="omnix-profile-page">
      <header className="omnix-profile-heading"><span className="omnix-profile-kicker">CUENTA PERSONAL</span><h1>Mi perfil</h1><p>Actualiza tus datos personales y de acceso.</p></header>
      <section className="omnix-profile-card">
        <div className="omnix-profile-card-heading"><div className="omnix-profile-avatar-large">{usuario?.nombre?.charAt(0)?.toUpperCase() || "U"}</div><div><h2>{[usuario?.nombre, usuario?.apellido].filter(Boolean).join(" ") || "Mi cuenta"}</h2><p>{usuario?.rol || "Usuario"}</p></div></div>
        {mensaje && <div className="alert omnix-profile-success" role="status">{mensaje}</div>}
        {error && <div className="alert omnix-profile-error" role="alert">{error}</div>}
        <form onSubmit={guardar}><div className="row g-3">
          <div className="col-12 col-md-6"><label className="form-label" htmlFor="perfil-nombre">Nombre</label><input className="form-control" id="perfil-nombre" name="nombre" value={campos.nombre} onChange={cambiarCampo} maxLength={100} autoComplete="given-name" required /></div>
          <div className="col-12 col-md-6"><label className="form-label" htmlFor="perfil-apellido">Apellido</label><input className="form-control" id="perfil-apellido" name="apellido" value={campos.apellido} onChange={cambiarCampo} maxLength={100} autoComplete="family-name" required /></div>
          <div className="col-12"><label className="form-label" htmlFor="perfil-email">Correo electronico</label><input className="form-control" id="perfil-email" name="email" type="email" value={campos.email} onChange={cambiarCampo} maxLength={150} autoComplete="email" required /><small className="omnix-profile-help">Este tambien sera tu correo para iniciar sesion.</small></div>
          <div className="col-12 col-md-5"><label className="form-label" htmlFor="perfil-tipo-documento">Tipo de documento</label><select className="form-select" id="perfil-tipo-documento" name="tipo_documento" value={campos.tipo_documento} onChange={cambiarCampo} required><option value="CC">Cedula de ciudadania</option><option value="TI">Tarjeta de identidad</option><option value="CE">Cedula de extranjeria</option><option value="PA">Pasaporte</option><option value="PPT">Permiso por proteccion temporal</option><option value="OTRO">Otro</option></select></div>
          <div className="col-12 col-md-7"><label className="form-label" htmlFor="perfil-documento">Numero de documento</label><input className="form-control" id="perfil-documento" name="numero_documento" value={campos.numero_documento} onChange={cambiarCampo} minLength={4} maxLength={30} pattern="[A-Za-z0-9-]{4,30}" required /></div>
        </div><div className="omnix-profile-actions"><button className="btn btn-primary" type="submit" disabled={guardando}>{guardando ? "Guardando..." : "Guardar cambios"}</button></div></form>
      </section>
    </main>
  );
}
