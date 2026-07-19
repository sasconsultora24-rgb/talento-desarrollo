import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "../data/store.jsx";
import { Card, Field, Input, Button, Badge } from "../components/ui.jsx";

export default function Ingresar() {
  const { iniciarSesion, solicitarRecuperacion, session, resolviendo } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [intentado, setIntentado] = useState(false);
  const [modoRecuperar, setModoRecuperar] = useState(false);
  const [recuperando, setRecuperando] = useState(false);
  const [mensajeRecuperar, setMensajeRecuperar] = useState("");

  useEffect(() => {
    if (!intentado || resolviendo) return;
    if (session.role === "candidato") navigate("/candidato");
    else if (session.role === "empresa") navigate("/empresa");
    else if (session.role === "admin") navigate("/admin");
    else if (session.authUserId) {
      setError("Tu cuenta no tiene un perfil asociado todavía. Contactanos si creés que es un error.");
      setIntentado(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intentado, resolviendo, session]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      await iniciarSesion(email, password);
      setIntentado(true);
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

  async function handleRecuperar(e) {
    e.preventDefault();
    setMensajeRecuperar("");
    setRecuperando(true);
    try {
      await solicitarRecuperacion(email);
      setMensajeRecuperar("Si ese email está registrado, te enviamos un link para elegir una nueva contraseña. Revisá tu casilla.");
    } catch (err) {
      console.error(err);
      setMensajeRecuperar("No pudimos enviar el email. Probá de nuevo en unos segundos.");
    } finally {
      setRecuperando(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-8">
        <Badge tone="gold">Ingresar</Badge>
        <h1 className="text-2xl font-extrabold text-forest-900 mt-3">Iniciá sesión</h1>
        <p className="text-forest-500 mt-2 text-sm">
          ¿Sos nuevo? <Link to="/registro" className="text-gold-600 font-semibold">Registrate</Link>
        </p>
      </div>

      <Card className="p-6">
        {modoRecuperar ? (
          <>
            <p className="text-sm text-forest-500 mb-4">
              Ingresá tu email y te mandamos un link para elegir una nueva contraseña.
            </p>
            {mensajeRecuperar && (
              <div className="mb-4 text-sm text-gold-700 bg-gold-50 border border-gold-100 rounded-lg px-3 py-2">
                {mensajeRecuperar}
              </div>
            )}
            <form onSubmit={handleRecuperar}>
              <Field label="Email">
                <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </Field>
              <Button type="submit" disabled={recuperando} className="w-full">
                {recuperando ? "Enviando..." : "Enviar link de recuperación"}
              </Button>
            </form>
            <button
              type="button"
              onClick={() => { setModoRecuperar(false); setMensajeRecuperar(""); }}
              className="text-gold-600 text-sm font-semibold mt-4"
            >
              ← Volver a ingresar
            </button>
          </>
        ) : (
          <>
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
              <Button type="submit" disabled={enviando || (intentado && resolviendo)} className="w-full">
                {enviando || (intentado && resolviendo) ? "Ingresando..." : "Ingresar"}
              </Button>
            </form>
            <button
              type="button"
              onClick={() => setModoRecuperar(true)}
              className="text-gold-600 text-sm font-semibold mt-4"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </>
        )}
      </Card>
    </div>
  );
}
