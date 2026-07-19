import { Link } from "react-router-dom";
import Logo from "./Logo";
import SasConsultoraLogo from "./SasConsultoraLogo";

export default function Footer() {
  return (
    <footer className="bg-forest-900 text-forest-200 mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <Logo dark />
          <p className="mt-4 text-sm text-forest-400 leading-relaxed">
            Impulsamos tu talento, transformamos PYMEs.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold text-sm mb-3">Para profesionales</h4>
          <ul className="space-y-2 text-sm text-forest-400">
            <li><Link to="/vacantes" className="hover:text-gold-300">Buscar empleo</Link></li>
            <li><Link to="/capacitaciones" className="hover:text-gold-300">Capacitaciones</Link></li>
            <li><Link to="/mentorias" className="hover:text-gold-300">Mentorías</Link></li>
            <li><Link to="/registro" className="hover:text-gold-300">Crear mi perfil</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold text-sm mb-3">Para PYMEs</h4>
          <ul className="space-y-2 text-sm text-forest-400">
            <li><Link to="/pymes" className="hover:text-gold-300">Nuestros servicios</Link></li>
            <li><Link to="/registro?tipo=empresa" className="hover:text-gold-300">Publicar vacante</Link></li>
            <li><Link to="/pymes#planes" className="hover:text-gold-300">Planes y precios</Link></li>
          </ul>
        </div>
        <div>
          <SasConsultoraLogo dark className="mb-3" />
          <ul className="space-y-2 text-sm text-forest-400">
            <li>Unidad de negocios de RRHH</li>
            <li>sasconsultora24@gmail.com</li>
            <li><Link to="/privacidad" className="hover:text-gold-300">Política de Privacidad</Link></li>
            <li><Link to="/terminos" className="hover:text-gold-300">Términos y Condiciones</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-forest-800 py-5 text-center text-xs text-forest-500">
        © {new Date().getFullYear()} SAS Talento & Desarrollo — Prototipo de plataforma.
      </div>
    </footer>
  );
}
