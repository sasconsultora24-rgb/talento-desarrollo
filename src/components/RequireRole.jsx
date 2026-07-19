import { Navigate } from "react-router-dom";
import { useApp } from "../data/store.jsx";

export default function RequireRole({ role, children }) {
  const { session, authReady } = useApp();

  if (!authReady) {
    return (
      <div className="flex items-center justify-center py-32 text-forest-400 text-sm">
        Verificando sesión...
      </div>
    );
  }

  if (session.role !== role) {
    return <Navigate to="/ingresar" replace />;
  }
  return children;
}
