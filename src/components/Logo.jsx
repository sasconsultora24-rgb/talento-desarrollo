import { Link } from "react-router-dom";

export default function Logo({ dark = false }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 group">
      <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-navy-700 flex items-center justify-center text-white font-display font-extrabold text-sm shadow-sm">
        T+D
      </span>
      <span className={`font-display font-extrabold text-[15px] leading-tight ${dark ? "text-white" : "text-navy-900"}`}>
        SAS <span className="text-teal-600">Talento</span> & Desarrollo
      </span>
    </Link>
  );
}
