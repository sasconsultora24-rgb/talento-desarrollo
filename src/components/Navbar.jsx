import { Link, useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { Menu, X, LogOut, ChevronDown } from "lucide-react";
import Logo from "./Logo";
import { useApp } from "../data/store.jsx";
import { Button } from "./ui.jsx";

const ENLACES_PROFESIONALES = [
  { to: "/registro?tipo=candidato", label: "Registrate como profesional" },
  { to: "/vacantes", label: "Ofertas laborales" },
  { to: "/capacitaciones?ver=mentorias", label: "Mentorías y Coaching" },
  { to: "/capacitaciones", label: "Capacitación continua" },
];

const ENLACES_PYMES = [
  { to: "/registro?tipo=empresa", label: "Registrar mi PYME" },
  { to: "/pymes", label: "Ver todas las áreas de servicio" },
  { to: "/pymes?ver=reclutamiento", label: "Reclutamiento y Selección" },
  { to: "/pymes?ver=retencion-talento", label: "Desarrollo y Retención de Talento" },
  { to: "/pymes?ver=capacitacion-desarrollo", label: "Capacitación y Desarrollo" },
  { to: "/pymes?ver=capital-humano", label: "Gestión del Capital Humano" },
];

// Dropdown de navegación reutilizado para "Para Profesionales" y "Para PYMEs":
// abre al pasar el mouse (con un pequeño delay de cierre) o al hacer click/tap.
function NavDropdown({ label, enlaces }) {
  const [abierto, setAbierto] = useState(false);
  const cierreTimeout = useRef(null);

  function abrir() {
    clearTimeout(cierreTimeout.current);
    setAbierto(true);
  }
  function cerrarConDelay() {
    cierreTimeout.current = setTimeout(() => setAbierto(false), 150);
  }

  return (
    <div className="relative" onMouseEnter={abrir} onMouseLeave={cerrarConDelay}>
      <button
        type="button"
        onClick={abrir}
        className="inline-flex items-center gap-1 hover:text-gold-600"
      >
        {label} <ChevronDown size={14} className={abierto ? "rotate-180 transition-transform" : "transition-transform"} />
      </button>
      {abierto && (
        <div className="absolute top-full left-0 pt-2 w-72">
          <div className="bg-white border border-forest-100 rounded-xl shadow-soft py-2">
            {enlaces.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                onClick={() => setAbierto(false)}
                className="block px-4 py-2 text-sm text-forest-600 hover:bg-forest-50 hover:text-gold-600"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function NavDropdownMobile({ label, enlaces, onNavigate }) {
  const [abierto, setAbierto] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setAbierto((o) => !o)}
        className="w-full flex items-center justify-between text-forest-700 font-medium"
      >
        {label}
        <ChevronDown size={16} className={abierto ? "rotate-180 transition-transform" : "transition-transform"} />
      </button>
      {abierto && (
        <div className="pl-3 mt-2.5 space-y-2.5 border-l-2 border-forest-100">
          {enlaces.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              onClick={onNavigate}
              className="block text-sm text-forest-500 font-medium"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

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
          <Link to="/capacitaciones" className="hover:text-gold-600">Capacitaciones y mentorías</Link>
          <NavDropdown label="Para Profesionales" enlaces={ENLACES_PROFESIONALES} />
          <NavDropdown label="Para PYMEs" enlaces={ENLACES_PYMES} />
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
        <div className="md:hidden border-t border-forest-100 px-4 py-4 space-y-4 bg-white">
          <Link to="/vacantes" onClick={() => setOpen(false)} className="block text-forest-700 font-medium">Vacantes</Link>
          <Link to="/capacitaciones" onClick={() => setOpen(false)} className="block text-forest-700 font-medium">Capacitaciones y mentorías</Link>
          <NavDropdownMobile label="Para Profesionales" enlaces={ENLACES_PROFESIONALES} onNavigate={() => setOpen(false)} />
          <NavDropdownMobile label="Para PYMEs" enlaces={ENLACES_PYMES} onNavigate={() => setOpen(false)} />
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
