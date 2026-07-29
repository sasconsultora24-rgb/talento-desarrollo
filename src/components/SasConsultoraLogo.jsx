// Logo real de SAS Consultora: el archivo original que Seba compartió
// ("lgo png fondo trasnparente.png"), servido tal cual desde /public — sin
// recortar, sin recolorear, sin chip de fondo y sin deformar. Se muestra a su
// proporción original (el archivo es cuadrado 2000x2000 con fondo transparente),
// así que sólo se ajusta la altura y el ancho sale solo con w-auto.
export default function SasConsultoraLogo({ size = "h-16" }) {
  return (
    <img
      src="/sas-consultora-logo.png"
      alt="SAS Consultora"
      className={`${size} w-auto`}
    />
  );
}
