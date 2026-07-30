import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useApp } from "../data/store.jsx";
import { registrarEvento } from "../utils/analitica.js";

export default function Layout() {
  const { loading, error, session } = useApp();
  const location = useLocation();

  // Una visita por cambio de ruta, ni una más.
  //
  // El rol tarda un momento en resolverse (arranca en null y después pasa a
  // "empresa"/"candidato"). Si el efecto dependiera del rol, cada navegación
  // registraría DOS visitas: una como anónimo y otra ya con el rol, duplicando
  // todas las métricas. Por eso se espera un instante a que la sesión se
  // asiente y se lee el rol desde un ref, que siempre tiene el valor actual
  // sin volver a disparar el efecto.
  const rolRef = useRef(session.role);
  rolRef.current = session.role;
  const rutaRegistrada = useRef(null);

  useEffect(() => {
    if (loading) return;
    const ruta = location.pathname + location.search;
    if (rutaRegistrada.current === ruta) return;

    const t = setTimeout(() => {
      rutaRegistrada.current = ruta;
      registrarEvento("pageview", { rol: rolRef.current || "anonimo" });
    }, 900);
    return () => clearTimeout(t);
  }, [location.pathname, location.search, loading]);

  return (
    <div className="min-h-screen flex flex-col bg-sand-50">
      <Navbar />
      {error && (
        <div className="bg-red-50 text-red-600 text-sm text-center py-2 px-4">
          No pudimos conectar con la base de datos: {error}
        </div>
      )}
      <main className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-32 text-forest-400 text-sm">
            Cargando datos...
          </div>
        ) : (
          <Outlet />
        )}
      </main>
      <Footer />
    </div>
  );
}
