import { Navigate } from "react-router-dom";
import { useApp } from "../data/store.jsx";

export default function RequireRole({ role, children }) {
  const { session } = useApp();
  if (session.role !== role) {
    return <Navigate to="/ingresar" replace />;
  }
  return children;
}
