// Logo real de la empresa madre (SAS Consultora), reconstruido en código a
// partir del isologo que Seba compartió: "SAS" en verde bosque, línea
// dorada, "CONSULTORA" en gris con tracking. Se hace en código (no como
// imagen) para que quede nítido en cualquier tamaño de pantalla y coincida
// exacto con la paleta forest/gold ya usada en el logo de Talento & Desarrollo.
export default function SasConsultoraLogo({ dark = false, compact = false, className = "" }) {
  return (
    <div className={`inline-flex flex-col ${className}`}>
      <span className={`font-display font-extrabold leading-none tracking-tight text-forest ${compact ? "text-sm" : "text-xl"}`}>
        SAS
      </span>
      <span className={`w-full h-px bg-gold ${compact ? "my-1" : "my-1.5"}`} />
      <span
        className={`font-display font-semibold tracking-[0.2em] ${compact ? "text-[6px]" : "text-[10px]"} ${
          dark ? "text-gray-300" : "text-gray-400"
        }`}
      >
        CONSULTORA
      </span>
    </div>
  );
}
