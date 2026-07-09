import { useState } from "react";
import { LayoutDashboard, Briefcase, GraduationCap, Building2, Users } from "lucide-react";
import { useApp } from "../../data/store.jsx";
import { Card, Badge, Button, StatCard, EmptyState, Field, Input, Select, Textarea } from "../../components/ui.jsx";

const TABS = [
  { id: "metricas", label: "Métricas", icon: LayoutDashboard },
  { id: "vacantes", label: "Moderar vacantes", icon: Briefcase },
  { id: "formacion", label: "Capacitaciones", icon: GraduationCap },
  { id: "empresas", label: "PYMEs", icon: Building2 },
  { id: "candidatos", label: "Candidatos", icon: Users },
];

const estadoBadge = { pendiente: "amber", aprobada: "teal", rechazada: "gray", cerrada: "gray" };

export default function AdminPanel() {
  const {
    vacantes, empresas, candidatos, postulaciones, capacitaciones, mentorias,
    cambiarEstadoVacante, crearCapacitacion,
  } = useApp();
  const [tab, setTab] = useState("metricas");
  const [nuevaCap, setNuevaCap] = useState({ titulo: "", categoria: "Liderazgo", modalidad: "Online en vivo", fecha: "", cupos: 20, descripcion: "" });

  const pendientes = vacantes.filter((v) => v.estado === "pendiente");

  async function submitCapacitacion(e) {
    e.preventDefault();
    try {
      await crearCapacitacion({ ...nuevaCap, cupos: Number(nuevaCap.cupos) });
      setNuevaCap({ titulo: "", categoria: "Liderazgo", modalidad: "Online en vivo", fecha: "", cupos: 20, descripcion: "" });
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <Badge tone="navy">Panel interno SAS Consultora</Badge>
        <h1 className="text-2xl md:text-3xl font-extrabold text-navy-900 mt-2">Administración</h1>
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

      {tab === "metricas" && (
        <div className="grid sm:grid-cols-3 gap-4">
          <StatCard label="PYMEs registradas" value={empresas.length} tone="navy" />
          <StatCard label="Candidatos en la base" value={candidatos.length} tone="teal" />
          <StatCard label="Vacantes totales" value={vacantes.length} tone="amber" />
          <StatCard label="Vacantes pendientes de aprobar" value={pendientes.length} tone="amber" />
          <StatCard label="Postulaciones totales" value={postulaciones.length} tone="teal" />
          <StatCard label="Capacitaciones activas" value={capacitaciones.length} tone="navy" />
          <StatCard label="Mentorías disponibles" value={mentorias.length} tone="teal" />
          <StatCard label="Candidatos premium" value={candidatos.filter((c) => c.membresia === "premium").length} tone="amber" />
          <StatCard label="PYMEs plan premium" value={empresas.filter((e) => e.plan === "premium").length} tone="navy" />
        </div>
      )}

      {tab === "vacantes" && (
        <div className="space-y-3">
          {vacantes.length === 0 ? (
            <EmptyState text="No hay vacantes cargadas." />
          ) : (
            vacantes.map((v) => {
              const empresa = empresas.find((e) => e.id === v.empresaId);
              return (
                <Card key={v.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-navy-900">{v.titulo}</h3>
                      <Badge tone={estadoBadge[v.estado]}>{v.estado}</Badge>
                    </div>
                    <p className="text-sm text-navy-500">{empresa?.nombre} · {v.ubicacion} · {v.fechaPublicacion}</p>
                  </div>
                  <div className="flex gap-2">
                    {v.estado !== "aprobada" && (
                      <Button variant="primary" onClick={() => cambiarEstadoVacante(v.id, "aprobada")}>Aprobar</Button>
                    )}
                    {v.estado !== "rechazada" && (
                      <Button variant="outline" onClick={() => cambiarEstadoVacante(v.id, "rechazada")}>Rechazar</Button>
                    )}
                    {v.estado === "aprobada" && (
                      <Button variant="ghost" onClick={() => cambiarEstadoVacante(v.id, "cerrada")}>Cerrar</Button>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {tab === "formacion" && (
        <div>
          <Card className="p-6 mb-6 max-w-2xl">
            <h3 className="font-bold text-navy-900 mb-3">Nueva capacitación</h3>
            <form onSubmit={submitCapacitacion}>
              <Field label="Título">
                <Input required value={nuevaCap.titulo} onChange={(e) => setNuevaCap({ ...nuevaCap, titulo: e.target.value })} />
              </Field>
              <div className="grid sm:grid-cols-2 gap-x-4">
                <Field label="Categoría">
                  <Select value={nuevaCap.categoria} onChange={(e) => setNuevaCap({ ...nuevaCap, categoria: e.target.value })}>
                    <option>Liderazgo</option><option>Comunicación</option><option>Técnica</option><option>Trabajo en equipo</option>
                  </Select>
                </Field>
                <Field label="Modalidad">
                  <Select value={nuevaCap.modalidad} onChange={(e) => setNuevaCap({ ...nuevaCap, modalidad: e.target.value })}>
                    <option>Online en vivo</option><option>Online grabado</option><option>Presencial</option>
                  </Select>
                </Field>
              </div>
              <div className="grid sm:grid-cols-2 gap-x-4">
                <Field label="Fecha"><Input type="date" required value={nuevaCap.fecha} onChange={(e) => setNuevaCap({ ...nuevaCap, fecha: e.target.value })} /></Field>
                <Field label="Cupos"><Input type="number" min="1" value={nuevaCap.cupos} onChange={(e) => setNuevaCap({ ...nuevaCap, cupos: e.target.value })} /></Field>
              </div>
              <Field label="Descripción"><Textarea rows={2} value={nuevaCap.descripcion} onChange={(e) => setNuevaCap({ ...nuevaCap, descripcion: e.target.value })} /></Field>
              <Button type="submit">Crear capacitación</Button>
            </form>
          </Card>

          <div className="grid sm:grid-cols-2 gap-4">
            {capacitaciones.map((c) => (
              <Card key={c.id} className="p-4">
                <p className="font-semibold text-navy-900">{c.titulo}</p>
                <p className="text-sm text-navy-500">{c.fecha} · {c.inscriptos.length}/{c.cupos} inscriptos</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tab === "empresas" && (
        <div className="space-y-3">
          {empresas.map((e) => (
            <Card key={e.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-navy-900">{e.nombre}</h3>
                <p className="text-sm text-navy-500">{e.rubro} · {e.ubicacion} · Desde {e.fechaRegistro}</p>
              </div>
              <Badge tone="teal">Plan {e.plan}</Badge>
            </Card>
          ))}
        </div>
      )}

      {tab === "candidatos" && (
        <div className="space-y-3">
          {candidatos.map((c) => (
            <Card key={c.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-navy-900">{c.nombre}</h3>
                <p className="text-sm text-navy-500">{c.titulo} · {c.ubicacion} · Desde {c.fechaRegistro}</p>
              </div>
              <Badge tone={c.membresia === "premium" ? "amber" : "gray"}>{c.membresia}</Badge>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
