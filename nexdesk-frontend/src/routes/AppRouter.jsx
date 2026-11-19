/**
 * Modulo: AppRouter.jsx.
 * Responsabilidad: Rutas HTTP: conectan metodo y URL con validacion, autenticacion, autorizacion y controlador.
 */
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import RutaProtegida from "./RutaProtegida";

import MainLayout from "../layouts/MainLayout";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Perfil from "../pages/Perfil";
import CambiarPassword from "../pages/CambiarPassword";
import Usuarios from "../pages/Usuarios";
import Tecnicos from "../pages/Tecnicos";
import Categorias from "../pages/Categorias";
import Tickets from "../pages/Tickets";
import Seguimientos from "../pages/Seguimientos";
// Router requiereCambio: cada endpoint especifica metodo HTTP, ruta y controles antes del controlador.
function requiereCambio(usuario) {
  return Boolean(
    usuario?.debeCambiarPassword ||
    usuario?.debe_cambiar_password
  );
}
// Router RutaLogin: cada endpoint especifica metodo HTTP, ruta y controles antes del controlador.
function RutaLogin() {
  const { usuario, cargandoSesion } = useAuth();

  if (cargandoSesion) {
    return (
      <div className="container py-5 text-center">
        Verificando sesión...
      </div>
    );
  }

  if (usuario) {
    return (
      <Navigate
        to={
          requiereCambio(usuario)
            ? "/cambiar-password"
            : "/dashboard"
        }
        replace
      />
    );
  }

  return <Login />;
}
// Router RutaPorRol: cada endpoint especifica metodo HTTP, ruta y controles antes del controlador.
function RutaPorRol({ roles, children }) {
  const { usuario } = useAuth();

  if (!roles.includes(usuario?.rol)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<RutaLogin />} />

        <Route element={<RutaProtegida />}>
          <Route
            path="/cambiar-password"
            element={<CambiarPassword />}
          />

          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/perfil" element={<Perfil />} />

            <Route
              path="/usuarios"
              element={
                <RutaPorRol roles={["superadmin", "admin"]}>
                  <Usuarios />
                </RutaPorRol>
              }
            />

            <Route
              path="/tecnicos"
              element={
                <RutaPorRol roles={["superadmin", "admin"]}>
                  <Tecnicos />
                </RutaPorRol>
              }
            />

            <Route
              path="/categorias"
              element={
                <RutaPorRol roles={["superadmin", "admin"]}>
                  <Categorias />
                </RutaPorRol>
              }
            />

            <Route
              path="/tickets"
              element={<Tickets />}
            />

            <Route
              path="/seguimientos"
              element={<Seguimientos />}
            />
          </Route>
        </Route>

        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
