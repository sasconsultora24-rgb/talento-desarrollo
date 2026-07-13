import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Paperclip, X } from "lucide-react";
import { useApp } from "../data/store.jsx";
import { Card, Field, Input, Select, Textarea, Button, Badge } from "../components/ui.jsx";
import { emailValido, telefonoValido, archivoValido, CV_MAX_MB } from "../utils/validacion";

const MAX_CV_MB = CV_MAX_MB;

export default function Registro() {
  const [params] = useSearchParams();
  const tipoInicial = params.get("tipo") === "empresa" ? "empresa" : "candidato";
  const [tipo, setTipo] = useState(tipoInicial);
  const { registrarCandidato, registrarEmpresa, subirCV, session, resolviendo } = useApp();
  const navigate = useNavigate();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [revisarEmail, setRevisarEmail] = useState(false);
  const [password, setPassword] = useState("");
  const [intentado, setIntentado] = useState(false);

  useEffect(() => {
    if (!intentado || resolviendo) return;
    if (session.role === "candidato") navigate("/candidato");
    else if (session.role === "empresa") navigate("/empresa");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intentado, resolviendo, session]);

  const [candidato, setCandidato] = useState({
    nombre: "",
    email: "",
    telefono: "",
    ubicacion: "",
    titulo: "",
    resumen: "",
    habilidades: "",
    nivel: "Junior",
    disponibilidad: "Full time",
  });
  const [cvFile, setCvFile] = useState(null);
  const [referencias, setReferencias] = useState([{ nombre: "", contacto: "" }]);

  const [empresa, setEmpresa] = useState({
    nombre: "",
    rubro: "",
    tamano: "1-10 empleados",
    ubicacion: "",
    contacto: "",
    email: "",
  });

  function actualizarReferencia(i, campo, valor) {
    setReferencias((prev) => prev.map((r, idx) => (idx === i ? { ...r, [campo]: valor } : r)));
  }

  function agregarReferencia() {
    if (referencias.length >= 3) return;
    setReferencias((prev) => [...prev, { nombre: "", contacto: "" }]);
  }

  function quitarReferencia(i) {
    setReferencias((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleCvChange(e) {
    const file = e.target.files?.[0];
    setError("");
    if (!file) {
      setCvFile(null);
      return;
    }
    const check = archivoValido(file);
    if (!check.valido) {
      setError(check.error);
      e.target.value = "";
      return;
    }
    setCvFile(file);
  }

  async function submitCandidato(e) {
    e.preventDefault();
    setError("");
    if (!emailValido(candidato.email)) {
      setError("Ingresá un email válido.");
      return;
    }
    if (!telefonoValido(candidato.telefono)) {
      setError("Ingresá un teléfono válido (solo números, espacios, + o -).");
      return;
    }
    setEnviando(true);
    try {
      let cvUrl = null;
      let cvNombre = null;
      if (cvFile) {
        const subido = await subirCV(cvFile);
        cvUrl = subido?.url || null;
        cvNombre = subido?.nombre || null;
      }
      const referenciasLimpias = referencias.filter((r) => r.nombre.trim() || r.contacto.trim());
      const resultado = await registrarCandidato(
        {
          ...candidato,
          habilidades: candidato.habilidades
            .split(",")
            .map((h) => h.trim())
            .filter(Boolean),
          cvUrl,
          cvNombre,
          referencias: referenciasLimpias,
        },
        password
      );
      if (resultado.confirmado) {
        setIntentado(true);
      } else {
        setRevisarEmail(true);
      }
    } catch (err) {
      console.error(err);
      setError(err.message?.includes("already registered") ? "Ese email ya está registrado. Probá ingresar." : "No pudimos crear tu perfil. Probá de nuevo en unos segundos.");
    } finally {
      setEnviando(false);
    }
  }

  async function submitEmpresa(e) {
    e.preventDefault();
    setError("");
    if (!emailValido(empresa.email)) {
      setError("Ingresá un email válido.");
      return;
    }
    setEnviando(true);
    try {
      const resultado = await registrarEmpresa(empresa, password);
      if (resultado.confirmado) {
        setIntentado(true);
      } else {
        setRevisarEmail(true);
      }
    } catch (err) {
      console.error(err);
      setError(err.message?.includes("already registered") ? "Ese email ya está registrado. Probá ingresar." : "No pudimos registrar la PYME. Probá de nuevo en unos segundos.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-8">
        <Badge tone="teal">Registro gratuito</Badge>
        <h1 className="text-2xl md:text-3xl font-extrabold text-navy-900 mt-3">
          Creá tu cuenta en SAS Talento & Desarrollo
        </h1>
        <p className="text-navy-500 mt-2">
          ¿Ya tenés cuenta? <Link to="/ingresar" className="text-teal-600 font-semibold">Ingresá acá</Link>
        </p>
      </div>

      <div className="flex gap-2 mb-6 bg-navy-50 rounded-xl p-1 max-w-sm mx-auto">
        <button
          onClick={() => setTipo("candidato")}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
            tipo === "candidato" ? "bg-white shadow-sm text-navy-900" : "text-navy-500"
          }`}
        >
          Soy profesional
        </button>
        <button
          onClick={() => setTipo("empresa")}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
            tipo === "empresa" ? "bg-white shadow-sm text-navy-900" : "text-navy-500"
          }`}
        >
          Soy una PYME
        </button>
      </div>

      <Card className="p-6 md:p-8">
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        {revisarEmail && (
          <div className="mb-4 text-sm text-teal-700 bg-teal-50 border border-teal-100 rounded-lg px-3 py-2">
            Te enviamos un email para confirmar tu cuenta. Confirmalo y después ingresá desde{" "}
            <Link to="/ingresar" className="font-semibold underline">Ingresar</Link>.
          </div>
        )}
        {tipo === "candidato" ? (
          <form onSubmit={submitCandidato}>
            <Field label="Nombre completo">
              <Input required value={candidato.nombre} onChange={(e) => setCandidato({ ...candidato, nombre: e.target.value })} />
            </Field>
            <div className="grid sm:grid-cols-2 gap-x-4">
              <Field label="Email">
                <Input type="email" required value={candidato.email} onChange={(e) => setCandidato({ ...candidato, email: e.target.value })} />
              </Field>
              <Field label="Teléfono">
                <Input value={candidato.telefono} onChange={(e) => setCandidato({ ...candidato, telefono: e.target.value })} />
              </Field>
            </div>
            <Field label="Contraseña" hint="Mínimo 6 caracteres">
              <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            </Field>
            <div className="grid sm:grid-cols-2 gap-x-4">
              <Field label="Ubicación">
                <Input required value={candidato.ubicacion} onChange={(e) => setCandidato({ ...candidato, ubicacion: e.target.value })} />
              </Field>
              <Field label="Puesto / título profesional">
                <Input required value={candidato.titulo} onChange={(e) => setCandidato({ ...candidato, titulo: e.target.value })} />
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-x-4">
              <Field label="Nivel de experiencia">
                <Select value={candidato.nivel} onChange={(e) => setCandidato({ ...candidato, nivel: e.target.value })}>
                  <option>Junior</option>
                  <option>Semi Senior</option>
                  <option>Senior</option>
                </Select>
              </Field>
              <Field label="Disponibilidad">
                <Select value={candidato.disponibilidad} onChange={(e) => setCandidato({ ...candidato, disponibilidad: e.target.value })}>
                  <option>Full time</option>
                  <option>Part time</option>
                  <option>Freelance</option>
                </Select>
              </Field>
            </div>
            <Field label="Resumen profesional">
              <Textarea rows={3} value={candidato.resumen} onChange={(e) => setCandidato({ ...candidato, resumen: e.target.value })} />
            </Field>
            <Field label="Habilidades" hint="Separadas por coma. Ej: Excel, Liderazgo, Ventas">
              <Input value={candidato.habilidades} onChange={(e) => setCandidato({ ...candidato, habilidades: e.target.value })} />
            </Field>

            <Field label="Adjuntar CV" hint={`PDF o Word, hasta ${MAX_CV_MB}MB (opcional)`}>
              <label className="flex items-center gap-2 border border-dashed border-navy-300 rounded-lg px-3.5 py-2.5 text-sm text-navy-600 cursor-pointer hover:border-teal-400">
                <Paperclip size={16} />
                {cvFile ? cvFile.name : "Elegir archivo..."}
                <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleCvChange} />
              </label>
            </Field>

            <Field label="Referencias laborales" hint="Nombre y contacto de alguien que pueda dar referencias tuyas (opcional)">
              <div className="space-y-2">
                {referencias.map((r, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder="Nombre"
                      value={r.nombre}
                      onChange={(e) => actualizarReferencia(i, "nombre", e.target.value)}
                    />
                    <Input
                      placeholder="Teléfono o email"
                      value={r.contacto}
                      onChange={(e) => actualizarReferencia(i, "contacto", e.target.value)}
                    />
                    {referencias.length > 1 && (
                      <button
                        type="button"
                        onClick={() => quitarReferencia(i)}
                        className="text-navy-400 hover:text-red-500 px-1"
                        aria-label="Quitar referencia"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                ))}
                {referencias.length < 3 && (
                  <button type="button" onClick={agregarReferencia} className="text-teal-600 text-sm font-semibold">
                    + Agregar otra referencia
                  </button>
                )}
              </div>
            </Field>

            <Button type="submit" disabled={enviando} className="w-full mt-2">
              {enviando ? "Creando perfil..." : "Crear mi perfil"}
            </Button>
          </form>
        ) : (
          <form onSubmit={submitEmpresa}>
            <Field label="Nombre de la empresa">
              <Input required value={empresa.nombre} onChange={(e) => setEmpresa({ ...empresa, nombre: e.target.value })} />
            </Field>
            <div className="grid sm:grid-cols-2 gap-x-4">
              <Field label="Rubro">
                <Input required value={empresa.rubro} onChange={(e) => setEmpresa({ ...empresa, rubro: e.target.value })} />
              </Field>
              <Field label="Tamaño">
                <Select value={empresa.tamano} onChange={(e) => setEmpresa({ ...empresa, tamano: e.target.value })}>
                  <option>1-10 empleados</option>
                  <option>11-50 empleados</option>
                  <option>51-200 empleados</option>
                </Select>
              </Field>
            </div>
            <Field label="Ubicación">
              <Input required value={empresa.ubicacion} onChange={(e) => setEmpresa({ ...empresa, ubicacion: e.target.value })} />
            </Field>
            <div className="grid sm:grid-cols-2 gap-x-4">
              <Field label="Persona de contacto">
                <Input required value={empresa.contacto} onChange={(e) => setEmpresa({ ...empresa, contacto: e.target.value })} />
              </Field>
              <Field label="Email">
                <Input type="email" required value={empresa.email} onChange={(e) => setEmpresa({ ...empresa, email: e.target.value })} />
              </Field>
            </div>
            <Field label="Contraseña" hint="Mínimo 6 caracteres">
              <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            </Field>
            <Button type="submit" disabled={enviando} className="w-full mt-2">
              {enviando ? "Registrando..." : "Registrar mi PYME"}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
