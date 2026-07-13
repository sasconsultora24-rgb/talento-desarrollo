import { Link } from "react-router-dom";

export default function Logo({ dark = false }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 group">
      <span className="w-9 h-9 rounded-xl bg-navy-900 flex items-center justify-center text-forest font-display font-extrabold text-[10px] tracking-wide shadow-sm">
        SAS
      </span>
      <span className={`font-display font-extrabold text-[15px] leading-tight ${dark ? "text-white" : "text-forest"}`}>
        Talento <span className="text-gold">&amp;</span> Desarrollo
      </span>
    </Link>
  );
}
