import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import Logo from "./Logo";
import { useApp } from "../data/store.jsx";
import { Button } from "./ui.jsx";

export default function Navbar() {
  const { session, logout, candidatos, empresas } = useApp();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const usuario =
    session.role === "candidato"
      ? candidatos.find((c) => c.id === session.userId)
      : session.role === "empresa"
      ? empresas.find((e) => e.id === session.userId)
      : session.role === "admin"
      ? { nombre: "Admin SAS" }
      : null;

  const panelPath =
    session.role === "candidato"
      ? "/candidato"
      : session.role === "empresa"
      ? "/empresa"
      : session.role === "admin"
      ? "/admin"
      : null;

  async function handleLogout() {
    await logout();
    navigate("/");
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-forest-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Logo />

        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-forest-600">
          <Link to="/vacantes" className="hover:text-gold-600">Vacantes</Link>
          <Link to="/capacitaciones" className="hover:text-gold-600">Capacitaciones</Link>
          <Link to="/mentorias" className="hover:text-gold-600">Mentorías</Link>
          <Link to="/pymes" className="hover:text-gold-600">Para PYMEs</Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {usuario ? (
            <>
              <Link to={panelPath} className="text-sm font-semibold text-forest-700 hover:text-gold-600">
                Hola, {usuario.nombre.split(" ")[0]}
              </Link>
              <Button variant="ghost" onClick={handleLogout} className="!px-3">
                <LogOut size={16} /> Salir
              </Button>
            </>
          ) : (
            <>
              <Link to="/ingresar">
                <Button variant="ghost">Ingresar</Button>
              </Link>
              <Link to="/registro">
                <Button variant="primary">Registrarme</Button>
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden text-forest-700" onClick={() => setOpen((o) => !o)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-forest-100 px-4 py-4 space-y-3 bg-white">
          <Link to="/vacantes" onClick={() => setOpen(false)} className="block text-forest-700 font-medium">Vacantes</Link>
          <Link to="/capacitaciones" onClick={() => setOpen(false)} className="block text-forest-700 font-medium">Capacitaciones</Link>
          <Link to="/mentorias" onClick={() => setOpen(false)} className="block text-forest-700 font-medium">Mentorías</Link>
          <Link to="/pymes" onClick={() => setOpen(false)} className="block text-forest-700 font-medium">Para PYMEs</Link>
          <div className="pt-3 border-t border-forest-100 flex flex-col gap-2">
            {usuario ? (
              <>
                <Link to={panelPath} onClick={() => setOpen(false)}>
                  <Button variant="secondary" className="w-full">Mi panel</Button>
                </Link>
                <Button variant="ghost" onClick={handleLogout} className="w-full">Salir</Button>
              </>
            ) : (
              <>
                <Link to="/ingresar" onClick={() => setOpen(false)}>
                  <Button variant="outline" className="w-full">Ingresar</Button>
                </Link>
                <Link to="/registro" onClick={() => setOpen(false)}>
                  <Button variant="primary" className="w-full">Registrarme</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
