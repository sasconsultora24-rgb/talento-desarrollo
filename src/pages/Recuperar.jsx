import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../data/store.jsx";
import { Card, Field, Input, Button, Badge } from "../components/ui.jsx";

export default function Recuperar() {
  const { actualizarPassword, session } = useApp();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [listo, setListo] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("La contraseña tiene que tener al menos 8 caracteres.");
      return;
    }
    if (password !== password2) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setEnviando(true);
    try {
      await actualizarPassword(password);
      setListo(true);
    } catch (err) {
      console.error(err);
      setError("No pudimos actualizar la contraseña. Puede que el link haya expirado — pedí uno nuevo desde Ingresar.");
    } finally {
      setEnviando(false);
    }
  }

  function irAlPanel() {
    if (session.role === "candidato") navigate("/candidato");
    else if (session.role === "empresa") navigate("/empresa");
    else if (session.role === "admin") navigate("/admin");
    else navigate("/");
  }

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-8">
        <Badge tone="teal">Recuperar contraseña</Badge>
        <h1 className="text-2xl font-extrabold text-navy-900 mt-3">Elegí una nueva contraseña</h1>
      </div>

      <Card className="p-6">
        {listo ? (
          <>
            <p className="text-sm text-teal-700 bg-teal-50 border border-teal-100 rounded-lg px-3 py-2 mb-4">
              Contraseña actualizada. Ya podés seguir usando tu cuenta.
            </p>
            <Button onClick={irAlPanel} className="w-full">Ir a mi panel</Button>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            <Field label="Nueva contraseña" hint="Mínimo 8 caracteres">
              <Input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
            </Field>
            <Field label="Repetir contraseña">
              <Input type="password" required minLength={8} value={password2} onChange={(e) => setPassword2(e.target.value)} />
            </Field>
            <Button type="submit" disabled={enviando} className="w-full">
              {enviando ? "Guardando..." : "Guardar nueva contraseña"}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
