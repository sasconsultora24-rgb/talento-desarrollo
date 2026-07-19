// Logo real de la empresa madre (SAS Consultora), reconstruido en código a
// partir del isologo que Seba compartió: "SAS" en verde bosque, línea
// dorada, "CONSULTORA" en gris con tracking. Se hace en código (no como
// imagen) para que quede nítido en cualquier tamaño de pantalla y coincida
// exacto con la paleta forest/gold ya usada en el logo de Talento & Desarrollo.
export default function SasConsultoraLogo({ dark = false, className = "" }) {
  return (
    <div className={`inline-flex flex-col ${className}`}>
      <span className="font-display font-extrabold text-xl leading-none tracking-tight text-forest">SAS</span>
      <span className="w-full h-px bg-gold my-1.5" />
      <span className={`font-display font-semibold text-[10px] tracking-[0.2em] ${dark ? "text-gray-300" : "text-gray-400"}`}>
        CONSULTORA
      </span>
    </div>
  );
}
