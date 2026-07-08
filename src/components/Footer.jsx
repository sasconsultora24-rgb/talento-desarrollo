import { Link } from "react-router-dom";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-navy-200 mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <Logo dark />
          <p className="mt-4 text-sm text-navy-400 leading-relaxed">
            Impulsamos tu talento, transformamos PYMEs.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold text-sm mb-3">Para profesionales</h4>
          <ul className="space-y-2 text-sm text-navy-400">
            <li><Link to="/vacantes" className="hover:text-teal-300">Buscar empleo</Link></li>
            <li><Link to="/capacitaciones" className="hover:text-teal-300">Capacitaciones</Link></li>
            <li><Link to="/mentorias" className="hover:text-teal-300">Mentorías</Link></li>
            <li><Link to="/registro" className="hover:text-teal-300">Crear mi perfil</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold text-sm mb-3">Para PYMEs</h4>
          <ul className="space-y-2 text-sm text-navy-400">
            <li><Link to="/pymes" className="hover:text-teal-300">Nuestros servicios</Link></li>
            <li><Link to="/registro?tipo=empresa" className="hover:text-teal-300">Publicar vacante</Link></li>
            <li><Link to="/pymes#planes" className="hover:text-teal-300">Planes y precios</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold text-sm mb-3">SAS Consultora</h4>
          <ul className="space-y-2 text-sm text-navy-400">
            <li>Unidad de negocios de RRHH</li>
            <li>sasconsultora24@gmail.com</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-navy-800 py-5 text-center text-xs text-navy-500">
        © {new Date().getFullYear()} SAS Talento & Desarrollo — Prototipo de plataforma.
      </div>
    </footer>
  );
}
