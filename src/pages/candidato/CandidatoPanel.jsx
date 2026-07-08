import { useState } from "react";
import { Link } from "react-router-dom";
import { User, Briefcase, GraduationCap, UserRound } from "lucide-react";
import { useApp } from "../../data/store.jsx";
import { Card, Badge, Button, Field, Input, Textarea, Select, EmptyState } from "../../components/ui.jsx";
import { planesCandidatos } from "../../data/seed.js";

const TABS = [
  { id: "perfil", label: "Mi perfil", icon: User },
  { id: "postulaciones", label: "Mis postulaciones", icon: Briefcase },
  { id: "formacion", label: "Capacitaciones y mentorías", icon: GraduationCap },
  { id: "plan", label: "Mi plan", icon: UserRound },
];

export default function CandidatoPanel() {
  const { session, candidatos, vacantes, empresas, postulaciones, capacitaciones, mentorias, actualizarCandidato } = useApp();
  const [tab, setTab] = useState("perfil");
  const candidato = candidatos.find((c) => c.id === session.userId);
  const [form, setForm] = useState(candidato);

  if (!candidato) return null;

  const misPostulaciones = postulaciones.filter((p) => p.candidatoId === candidato.id);
  const misCapacitaciones = capacitaciones.filter((c) => c.inscriptos.includes(candidato.id));
  const misMentorias = mentorias.filter((m) => m.reservas.includes(candidato.id));

  function guardarPerfil(e) {
    e.preventDefault();
    actualizarCandidato(candidato.id, {
      ...form,
      habilidades:
        typeof form.habilidades === "string"
          ? form.habilidades.split(",").map((h) => h.trim()).filter(Boolean)
          : form.habilidades,
    });
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
            <Button type="submit">Guardar cambios</Button>
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
        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl">
          {planesCandidatos.map((p) => (
            <Card key={p.id} className={`p-5 ${candidato.membresia === p.id ? "border-2 border-teal-500" : ""}`}>
              <h3 className="font-bold text-navy-900">{p.nombre}</h3>
              <div className="text-xl font-extrabold text-navy-800 mt-1">{p.precio}</div>
              <ul className="mt-3 space-y-1.5 text-sm text-navy-500">
                {p.incluye.map((i) => <li key={i}>• {i}</li>)}
              </ul>
              {candidato.membresia === p.id ? (
                <Badge tone="teal">Plan actual</Badge>
              ) : (
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => actualizarCandidato(candidato.id, { membresia: p.id })}
                >
                  Elegir este plan
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
