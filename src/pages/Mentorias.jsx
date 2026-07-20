import { Navigate } from "react-router-dom";

// Las mentorías dejaron de ser una página propia con listado de mentores:
// ahora son una sección dentro de Capacitaciones (ver MentoriasPaquetes.jsx).
// Esta ruta se mantiene solo para no romper links/bookmarks viejos.
export default function Mentorias() {
  return <Navigate to="/capacitaciones" replace />;
}
