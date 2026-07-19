import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useApp } from "../data/store.jsx";

export default function Layout() {
  const { loading, error } = useApp();

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
