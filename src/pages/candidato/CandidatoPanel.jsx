import { useState } from "react";
import { Link } from "react-router-dom";
import { User, Briefcase, GraduationCap, UserRound, Paperclip, X, FileText } from "lucide-react";
import { useApp } from "../../data/store.jsx";
import { Card, Badge, Button, Field, Input, Textarea, Select, EmptyState } from "../../components/ui.jsx";
import { planesCandidatos } from "../../data/seed.js";
import { emailValido, telefonoValido, archivoValido, CV_MAX_MB } from "../../utils/validacion";
import { candidatoPremiumActivo } from "../../utils/planes.js";

const TABS = [
  { id: "perfil", label: "Mi perfil", icon: User },
  { id: "postulaciones", label: "Mis postulaciones", icon: Briefcase },
  { id: "formacion", label: "Capacitaciones y mentorías", icon: GraduationCap },
  { id: "plan", label: "Mi plan", icon: UserRound },
];

const MAX_CV_MB = CV_MAX_MB;

function estadoPlan(vencimientoISO) {
  if (!vencimientoISO) return { texto: "Sin pagos registrados todavía", vencido: true };
  const vence = new Date(vencimientoISO);
  const hoy = new Date();
  const fecha = vence.toLocaleDateString("es-AR");
  if (vence < hoy) return { texto: `Venció el ${fecha}`, vencido: true };
  return { texto: `Vigente hasta el ${fecha}`, vencido: false };
}

export default function CandidatoPanel() {
  const {
    session, candidatos, vacantes, empresas, postulaciones, capacitaciones, mentorias,
    actualizarCandidato, subirCV, iniciarPago,
  } = useApp();
  const [tab, setTab] = useState("perfil");
  const candidato = candidatos.find((c) => c.id === session.userId);
  const [form, setForm] = useState(candidato);
  const [cvFile, setCvFile] = useState(null);
  const [referencias, setReferencias] = useState(candidato?.referencias?.length ? candidato.referencias : [{ nombre: "", contacto: "" }]);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [mensajeEsError, setMensajeEsError] = useState(false);
  const [pagando, setPagando] = useState(null);
  const [errorPago, setErrorPago] = useState("");

  if (!candidato) return null;

  const misPostulaciones = postulaciones.filter((p) => p.candidatoId === candidato.id);
  const misCapacitaciones = capacitaciones.filter((c) => c.inscriptos.includes(candidato.id));
  const misMentorias = mentorias.filter((m) => m.reservasCandidatos.includes(candidato.id));

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
    if (!file) return;
    const check = archivoValido(file);
    if (!check.valido) {
      setMensajeEsError(true);
      setMensaje(check.error);
      e.target.value = "";
      return;
    }
    setMensaje("");
    setCvFile(file);
  }

  async function guardarPerfil(e) {
    e.preventDefault();
    setMensaje("");
    setMensajeEsError(false);
    if (!emailValido(form.email)) {
      setMensajeEsError(true);
      setMensaje("Ingresá un email válido.");
      return;
    }
    if (!telefonoValido(form.telefono)) {
      setMensajeEsError(true);
      setMensaje("Ingresá un teléfono válido (solo números, espacios, + o -).");
      return;
    }
    setGuardando(true);
    try {
      let cvUrl = form.cvUrl;
      let cvNombre = form.cvNombre;
      if (cvFile) {
        const subido = await subirCV(cvFile);
        cvUrl = subido?.url || cvUrl;
        cvNombre = subido?.nombre || cvNombre;
      }
      await actualizarCandidato(candidato.id, {
        ...form,
        habilidades:
          typeof form.habilidades === "string"
            ? form.habilidades.split(",").map((h) => h.trim()).filter(Boolean)
            : form.habilidades,
        cvUrl,
        cvNombre,
        referencias: referencias.filter((r) => r.nombre.trim() || r.contacto.trim()),
      });
      setCvFile(null);
      setMensaje("Perfil actualizado.");
    } catch (err) {
      console.error(err);
      setMensajeEsError(true);
      setMensaje("No pudimos guardar los cambios. Probá de nuevo.");
    } finally {
      setGuardando(false);
    }
  }

  async function pagarPlan(planId) {
    setErrorPago("");
    setPagando(planId);
    try {
      const initPoint = await iniciarPago("membresia_candidato", planId);
      window.location.href = initPoint;
    } catch (err) {
      setErrorPago(err.message || "No se pudo iniciar el pago.");
      setPagando(null);
    }
  }

  const estadoTono = {
    nueva: "gray",
    "en revisión": "amber",
    entrevista: "teal",
    contratado: "teal",
    descartado: "gray",
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <Badge tone="teal">Panel del profesional</Badge>
        <h1 className="text-2xl md:text-3xl font-extrabold text-navy-900 mt-2">Hola, {candidato.nombre.split(" ")[0]}</h1>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 border-b border-navy-100 pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-t-lg text-sm font-semibold ${
              tab === t.id ? "bg-white border border-b-0 border-navy-100 text-teal-600" : "text-navy-400 hover:text-navy-600"
            }`}
          >
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {tab === "perfil" && (
        <Card className="p-6 max-w-2xl">
          {mensaje && (
            <p className={`text-sm mb-4 ${mensajeEsError ? "text-red-600" : "text-teal-600"}`}>{mensaje}</p>
          )}
          <form onSubmit={guardarPerfil}>
            <div className="grid sm:grid-cols-2 gap-x-4">
              <Field label="Nombre completo">
                <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
              </Field>
              <Field label="Título profesional">
                <Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-x-4">
              <Field label="Email">
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </Field>
              <Field label="Teléfono">
                <Input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-x-4">
              <Field label="Ubicación">
                <Input value={form.ubicacion} onChange={(e) => setForm({ ...form, ubicacion: e.target.value })} />
              </Field>
              <Field label="Nivel">
                <Select value={form.nivel} onChange={(e) => setForm({ ...form, nivel: e.target.value })}>
                  <option>Junior</option>
                  <option>Semi Senior</option>
                  <option>Senior</option>
                </Select>
              </Field>
            </div>
            <Field label="Resumen profesional">
              <Textarea rows={3} value={form.resumen} onChange={(e) => setForm({ ...form, resumen: e.target.value })} />
            </Field>
            <Field label="Habilidades" hint="Separadas por coma">
              <Input
                value={Array.isArray(form.habilidades) ? form.habilidades.join(", ") : form.habilidades}
                onChange={(e) => setForm({ ...form, habilidades: e.target.value })}
              />
            </Field>

            <Field label="CV" hint={`PDF o Word, hasta ${MAX_CV_MB}MB`}>
              {form.cvUrl && !cvFile && (
                <a
                  href={form.cvUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-teal-600 font-semibold mb-2"
                >
                  <FileText size={16} /> Ver CV actual ({form.cvNombre || "archivo"})
                </a>
              )}
              <label className="flex items-center gap-2 border border-dashed border-navy-300 rounded-lg px-3.5 py-2.5 text-sm text-navy-600 cursor-pointer hover:border-teal-400">
                <Paperclip size={16} />
                {cvFile ? cvFile.name : form.cvUrl ? "Reemplazar archivo..." : "Elegir archivo..."}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleCvChange}
                />
              </label>
            </Field>

            <Field label="Referencias laborales">
              <div className="space-y-2">
                {referencias.map((r, i) => (
                  <div key={i} className="flex gap-2">
                    <Input placeholder="Nombre" value={r.nombre} onChange={(e) => actualizarReferencia(i, "nombre", e.target.value)} />
                    <Input placeholder="Teléfono o email" value={r.contacto} onChange={(e) => actualizarReferencia(i, "contacto", e.target.value)} />
                    {referencias.length > 1 && (
                      <button type="button" onClick={() => quitarReferencia(i)} className="text-navy-400 hover:text-red-500 px-1">
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

            <Button type="submit" disabled={guardando}>{guardando ? "Guardando..." : "Guardar cambios"}</Button>
          </form>
        </Card>
      )}

      {tab === "postulaciones" && (
        <div className="space-y-4">
          {misPostulaciones.length === 0 ? (
            <EmptyState text="Todavía no te postulaste a ninguna vacante." />
          ) : (
            misPostulaciones.map((p) => {
              const vac = vacantes.find((v) => v.id === p.vacanteId);
              const emp = empresas.find((e) => e.id === vac?.empresaId);
              return (
                <Card key={p.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-navy-900">{vac?.titulo}</h3>
                    <p className="text-sm text-navy-500">{emp?.nombre} · Postulado el {p.fecha}</p>
                  </div>
                  <Badge tone={estadoTono[p.estado] || "gray"}>{p.estado}</Badge>
                </Card>
              );
            })
          )}
          <Link to="/vacantes"><Button variant="outline">Buscar más vacantes</Button></Link>
        </div>
      )}

      {tab === "formacion" && (
        <div className="space-y-8">
          <div>
            <h3 className="font-bold text-navy-900 mb-3">Capacitaciones inscriptas</h3>
            {misCapacitaciones.length === 0 ? (
              <EmptyState text="Sin capacitaciones inscriptas." />
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {misCapacitaciones.map((c) => (
                  <Card key={c.id} className="p-4">
                    <p className="font-semibold text-navy-900">{c.titulo}</p>
                    <p className="text-sm text-navy-500">{c.fecha} · {c.modalidad}</p>
                  </Card>
                ))}
              </div>
            )}
            <Link to="/capacitaciones" className="text-teal-600 text-sm font-semibold inline-block mt-3">Ver más capacitaciones</Link>
          </div>
          <div>
            <h3 className="font-bold text-navy-900 mb-3">Mentorías reservadas</h3>
            {misMentorias.length === 0 ? (
              <EmptyState text="Sin mentorías reservadas." />
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {misMentorias.map((m) => (
                  <Card key={m.id} className="p-4">
                    <p className="font-semibold text-navy-900">{m.mentor}</p>
                    <p className="text-sm text-navy-500">{m.especialidad}</p>
                  </Card>
                ))}
              </div>
            )}
            <Link to="/mentorias" className="text-teal-600 text-sm font-semibold inline-block mt-3">Ver más mentorías</Link>
          </div>
        </div>
      )}

      {tab === "plan" && (
        <div className="max-w-2xl">
          {errorPago && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2">{errorPago}</div>
          )}
          {candidato.membresia === "premium" && !candidatoPremiumActivo(candidato) && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2">
              Tu membresía premium venció, así que ya no tenés prioridad en el buscador de las empresas. Renová para recuperarla.
            </div>
          )}
          {candidatoPremiumActivo(candidato) && (
            <div className="mb-4 text-sm text-teal-700 bg-teal-50 border border-teal-100 rounded-lg px-4 py-2">
              Con tu membresía activa, tu perfil aparece primero en el buscador de las empresas y tus postulaciones se muestran primero en su bandeja.
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-6">
            {planesCandidatos.map((p) => {
              const esActual = candidato.membresia === p.id;
              const esGratis = p.id === "free";
              const estado = esActual && !esGratis ? estadoPlan(candidato.membresiaVencimiento) : null;
              return (
                <Card key={p.id} className={`p-5 flex flex-col ${esActual ? "border-2 border-teal-500" : ""}`}>
                  <h3 className="font-bold text-navy-900">{p.nombre}</h3>
                  <div className="text-xl font-extrabold text-navy-800 mt-1">{p.precio}</div>
                  <ul className="mt-3 space-y-1.5 text-sm text-navy-500 flex-1">
                    {p.incluye.map((i) => <li key={i}>• {i}</li>)}
                  </ul>
                  {esActual && (
                    <div className="mt-3">
                      <Badge tone="teal">Plan actual</Badge>
                      {estado && <p className={`text-xs mt-1.5 ${estado.vencido ? "text-red-600" : "text-navy-400"}`}>{estado.texto}</p>}
                    </div>
                  )}
                  {esGratis ? (
                    !esActual && (
                      <Button
                        variant="outline"
                        className="w-full mt-4"
                        onClick={() => actualizarCandidato(candidato.id, { membresia: "free" })}
                      >
                        Volver al plan gratuito
                      </Button>
                    )
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      disabled={pagando === p.id}
                      onClick={() => pagarPlan(p.id)}
                    >
                      {pagando === p.id ? "Redirigiendo a Mercado Pago..." : esActual ? "Renovar" : "Elegir y pagar este plan"}
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>
          <p className="text-xs text-navy-400 mt-6">
            El pago se procesa con Mercado Pago. Cada pago aprobado extiende la vigencia de la membresía 30 días desde hoy (o desde el vencimiento actual, si todavía está vigente).
          </p>
        </div>
      )}
    </div>
  );
}
