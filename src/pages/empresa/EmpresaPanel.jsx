import { useState, useMemo } from "react";
import { Briefcase, Users2, Award, PlusCircle, FileText, Search, Mail } from "lucide-react";
import { useApp } from "../../data/store.jsx";
import { Card, Badge, Button, Field, Input, Textarea, Select, EmptyState, StatCard } from "../../components/ui.jsx";
import { planesEmpresas } from "../../data/seed.js";

const TABS = [
  { id: "vacantes", label: "Mis vacantes", icon: Briefcase },
  { id: "candidatos", label: "Candidatos postulados", icon: Users2 },
  { id: "buscar", label: "Buscar candidatos", icon: Search },
  { id: "plan", label: "Mi plan", icon: Award },
];

const estadoBadge = {
  pendiente: "amber",
  aprobada: "teal",
  rechazada: "gray",
  cerrada: "gray",
};

const postulacionBadge = {
  nueva: "gray",
  "en revisión": "amber",
  entrevista: "teal",
  contratado: "teal",
  descartado: "gray",
};

export default function EmpresaPanel() {
  const { session, empresas, vacantes, candidatos, postulaciones, publicarVacante, cambiarEstadoPostulacion, actualizarEmpresa } = useApp();
  const [tab, setTab] = useState("vacantes");
  const [formOpen, setFormOpen] = useState(false);
  const empresa = empresas.find((e) => e.id === session.userId);

  const [nueva, setNueva] = useState({
    titulo: "",
    area: "",
    modalidad: "Presencial",
    ubicacion: empresa?.ubicacion || "",
    nivel: "Junior",
    descripcion: "",
    salario: "",
    requisitos: "",
  });

  const [busqueda, setBusqueda] = useState("");
  const [filtroNivel, setFiltroNivel] = useState("");
  const [filtroDisponibilidad, setFiltroDisponibilidad] = useState("");

  const candidatosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return candidatos.filter((c) => {
      if (filtroNivel && c.nivel !== filtroNivel) return false;
      if (filtroDisponibilidad && c.disponibilidad !== filtroDisponibilidad) return false;
      if (!texto) return true;
      const enTexto = [c.nombre, c.titulo, c.ubicacion, c.resumen, ...(c.habilidades || [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return enTexto.includes(texto);
    });
  }, [candidatos, busqueda, filtroNivel, filtroDisponibilidad]);

  if (!empresa) return null;

  const misVacantes = vacantes.filter((v) => v.empresaId === empresa.id);
  const idsMisVacantes = misVacantes.map((v) => v.id);
  const postulacionesRecibidas = postulaciones.filter((p) => idsMisVacantes.includes(p.vacanteId));

  async function crearVacante(e) {
    e.preventDefault();
    try {
      await publicarVacante(empresa.id, {
        ...nueva,
        requisitos: nueva.requisitos.split(",").map((r) => r.trim()).filter(Boolean),
      });
      setNueva({ titulo: "", area: "", modalidad: "Presencial", ubicacion: empresa.ubicacion, nivel: "Junior", descripcion: "", salario: "", requisitos: "" });
      setFormOpen(false);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <Badge tone="teal">Panel de empresa</Badge>
        <h1 className="text-2xl md:text-3xl font-extrabold text-navy-900 mt-2">{empresa.nombre}</h1>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Vacantes publicadas" value={misVacantes.length} tone="navy" />
        <StatCard label="Postulaciones recibidas" value={postulacionesRecibidas.length} tone="teal" />
        <StatCard label="Plan actual" value={empresa.plan} tone="amber" />
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

      {tab === "vacantes" && (
        <div>
          <div className="flex justify-end mb-4">
            <Button onClick={() => setFormOpen((o) => !o)}>
              <PlusCircle size={16} /> {formOpen ? "Cerrar" : "Publicar vacante"}
            </Button>
          </div>

          {formOpen && (
            <Card className="p-6 mb-6">
              <form onSubmit={crearVacante}>
                <div className="grid sm:grid-cols-2 gap-x-4">
                  <Field label="Puesto"><Input required value={nueva.titulo} onChange={(e) => setNueva({ ...nueva, titulo: e.target.value })} /></Field>
                  <Field label="Área"><Input required value={nueva.area} onChange={(e) => setNueva({ ...nueva, area: e.target.value })} /></Field>
                </div>
                <div className="grid sm:grid-cols-3 gap-x-4">
                  <Field label="Modalidad">
                    <Select value={nueva.modalidad} onChange={(e) => setNueva({ ...nueva, modalidad: e.target.value })}>
                      <option>Presencial</option><option>Híbrido</option><option>Remoto</option>
                    </Select>
                  </Field>
                  <Field label="Nivel">
                    <Select value={nueva.nivel} onChange={(e) => setNueva({ ...nueva, nivel: e.target.value })}>
                      <option>Junior</option><option>Semi Senior</option><option>Senior</option>
                    </Select>
                  </Field>
                  <Field label="Ubicación"><Input required value={nueva.ubicacion} onChange={(e) => setNueva({ ...nueva, ubicacion: e.target.value })} /></Field>
                </div>
                <Field label="Descripción"><Textarea rows={3} required value={nueva.descripcion} onChange={(e) => setNueva({ ...nueva, descripcion: e.target.value })} /></Field>
                <div className="grid sm:grid-cols-2 gap-x-4">
                  <Field label="Rango salarial"><Input value={nueva.salario} onChange={(e) => setNueva({ ...nueva, salario: e.target.value })} /></Field>
                  <Field label="Requisitos" hint="Separados por coma"><Input value={nueva.requisitos} onChange={(e) => setNueva({ ...nueva, requisitos: e.target.value })} /></Field>
                </div>
                <p className="text-xs text-navy-400 mb-4">La vacante quedará en estado "pendiente" hasta que nuestro equipo la revise y apruebe.</p>
                <Button type="submit">Publicar</Button>
              </form>
            </Card>
          )}

          {misVacantes.length === 0 ? (
            <EmptyState text="Todavía no publicaste vacantes." />
          ) : (
            <div className="space-y-3">
              {misVacantes.map((v) => (
                <Card key={v.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-navy-900">{v.titulo}</h3>
                    <p className="text-sm text-navy-500">{v.area} · {v.ubicacion} · Publicada el {v.fechaPublicacion}</p>
                  </div>
                  <Badge tone={estadoBadge[v.estado]}>{v.estado}</Badge>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "candidatos" && (
        <div className="space-y-4">
          {postulacionesRecibidas.length === 0 ? (
            <EmptyState text="Todavía no recibiste postulaciones." />
          ) : (
            postulacionesRecibidas.map((p) => {
              const cand = candidatos.find((c) => c.id === p.candidatoId);
              const vac = vacantes.find((v) => v.id === p.vacanteId);
              return (
                <Card key={p.id} className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-navy-900">{cand?.nombre}</h3>
                      <p className="text-sm text-navy-500">{cand?.titulo} · {cand?.ubicacion}</p>
                      <p className="text-sm text-navy-400 mt-1">Postulado a: <strong>{vac?.titulo}</strong></p>
                      {cand?.habilidades?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {cand.habilidades.map((h) => (
                            <span key={h} className="text-xs bg-navy-50 text-navy-600 px-2 py-0.5 rounded-full">{h}</span>
                          ))}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-3 mt-2">
                        {cand?.cvUrl && (
                          <a href={cand.cvUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-teal-600 font-semibold">
                            <FileText size={15} /> Ver CV
                          </a>
                        )}
                      </div>
                      {cand?.referencias?.length > 0 && (
                        <p className="text-xs text-navy-400 mt-2">
                          Referencias: {cand.referencias.map((r) => `${r.nombre}${r.contacto ? ` (${r.contacto})` : ""}`).join(" · ")}
                        </p>
                      )}
                    </div>
                    <Select
                      value={p.estado}
                      onChange={(e) => cambiarEstadoPostulacion(p.id, e.target.value)}
                      className="sm:w-44"
                    >
                      <option value="nueva">Nueva</option>
                      <option value="en revisión">En revisión</option>
                      <option value="entrevista">Entrevista</option>
                      <option value="contratado">Contratado</option>
                      <option value="descartado">Descartado</option>
                    </Select>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {tab === "buscar" && (
        <div>
          <Card className="p-4 mb-6">
            <div className="grid sm:grid-cols-3 gap-3">
              <Field label="Buscar">
                <Input
                  placeholder="Nombre, puesto, habilidad..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </Field>
              <Field label="Nivel">
                <Select value={filtroNivel} onChange={(e) => setFiltroNivel(e.target.value)}>
                  <option value="">Todos</option>
                  <option>Junior</option>
                  <option>Semi Senior</option>
                  <option>Senior</option>
                </Select>
              </Field>
              <Field label="Disponibilidad">
                <Select value={filtroDisponibilidad} onChange={(e) => setFiltroDisponibilidad(e.target.value)}>
                  <option value="">Todas</option>
                  <option>Full time</option>
                  <option>Part time</option>
                  <option>Freelance</option>
                </Select>
              </Field>
            </div>
          </Card>

          <p className="text-sm text-navy-400 mb-3">
            {candidatosFiltrados.length} candidato{candidatosFiltrados.length === 1 ? "" : "s"} encontrado{candidatosFiltrados.length === 1 ? "" : "s"}
          </p>

          {candidatosFiltrados.length === 0 ? (
            <EmptyState text="No encontramos candidatos con esos filtros." />
          ) : (
            <div className="space-y-3">
              {candidatosFiltrados.map((c) => (
                <Card key={c.id} className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-navy-900">{c.nombre}</h3>
                      <p className="text-sm text-navy-500">
                        {c.titulo} · {c.ubicacion} · {c.nivel} · {c.disponibilidad}
                      </p>
                      {c.resumen && <p className="text-sm text-navy-500 mt-2 max-w-xl">{c.resumen}</p>}
                      {c.habilidades?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {c.habilidades.map((h) => (
                            <span key={h} className="text-xs bg-navy-50 text-navy-600 px-2 py-0.5 rounded-full">{h}</span>
                          ))}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-4 mt-2">
                        {c.cvUrl && (
                          <a href={c.cvUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-teal-600 font-semibold">
                            <FileText size={15} /> Ver CV
                          </a>
                        )}
                        {c.email && (
                          <a href={`mailto:${c.email}`} className="inline-flex items-center gap-1.5 text-sm text-teal-600 font-semibold">
                            <Mail size={15} /> Contactar
                          </a>
                        )}
                      </div>
                    </div>
                    {c.membresia === "premium" && <Badge tone="amber">Perfil premium</Badge>}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "plan" && (
        <div className="grid sm:grid-cols-3 gap-6">
          {planesEmpresas.map((p) => (
            <Card key={p.id} className={`p-5 ${empresa.plan === p.id ? "border-2 border-teal-500" : ""}`}>
              <h3 className="font-bold text-navy-900">{p.nombre}</h3>
              <div className="text-xl font-extrabold text-navy-800 mt-1">{p.precio}</div>
              <ul className="mt-3 space-y-1.5 text-sm text-navy-500">
                {p.incluye.map((i) => <li key={i}>• {i}</li>)}
              </ul>
              {empresa.plan === p.id ? (
                <Badge tone="teal">Plan actual</Badge>
              ) : (
                <Button variant="outline" className="w-full mt-4" onClick={() => actualizarEmpresa(empresa.id, { plan: p.id })}>
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
