// Logo real de SAS Consultora (el archivo que Seba compartió, recortado a su
// contenido y servido tal cual desde /public — no es una recreación en CSS).
// Como el "SAS" del archivo es siempre verde bosque sobre fondo transparente,
// en secciones de fondo oscuro hay que ponerlo sobre un chip claro (ver
// Footer.jsx y Landing.jsx) en vez de recolorear el logo.
export default function SasConsultoraLogo({ className = "" }) {
  return (
    <img
      src="/sas-consultora-logo.png"
      alt="SAS Consultora"
      className={`h-8 w-auto ${className}`}
    />
  );
}
