import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "../data/store.jsx";
import { Card, Field, Input, Button, Badge } from "../components/ui.jsx";

export default function Ingresar() {
  const { iniciarSesion } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      const resuelta = await iniciarSesion(email, password);
      if (resuelta.role === "candidato") navigate("/candidato");
      else if (resuelta.role === "empresa") navigate("/empresa");
      else if (resuelta.role === "admin") navigate("/admin");
      else setError("Tu cuenta no tiene un perfil asociado todavía. Contactanos si creés que es un error.");
    } catch (err) {
      console.error(err);
      setError(
        err.message?.includes("Invalid login")
          ? "Email o contraseña incorrectos."
          : err.message?.includes("Email not confirmed")
          ? "Todavía no confirmaste tu email. Revisá tu casilla de correo."
          : "No pudimos iniciar sesión. Probá de nuevo en unos segundos."
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-8">
        <Badge tone="teal">Ingresar</Badge>
        <h1 className="text-2xl font-extrabold text-navy-900 mt-3">Iniciá sesión</h1>
        <p className="text-navy-500 mt-2 text-sm">
          ¿Sos nuevo? <Link to="/registro" className="text-teal-600 font-semibold">Registrate</Link>
        </p>
      </div>

      <Card className="p-6">
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <Field label="Email">
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Contraseña">
            <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          <Button type="submit" disabled={enviando} className="w-full">
            {enviando ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
