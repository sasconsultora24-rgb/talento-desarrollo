import { useState } from "react";
import { LayoutDashboard, Briefcase, GraduationCap, Building2, Users, Download } from "lucide-react";
import { useApp } from "../../data/store.jsx";
import { Card, Badge, Button, StatCard, EmptyState, Field, Input, Select, Textarea } from "../../components/ui.jsx";
import { descargarCSV } from "../../utils/exportarCsv.js";

const TABS = [
  { id: "metricas", label: "Métricas", icon: LayoutDashboard },
  { id: "vacantes", label: "Moderar vacantes", icon: Briefcase },
  { id: "formacion", label: "Capacitaciones y mentorías", icon: GraduationCap },
  { id: "empresas", label: "PYMEs", icon: Building2 },
  { id: "candidatos", label: "Candidatos", icon: Users },
];

const estadoBadge = { pendiente: "amber", aprobada: "teal", rechazada: "gray", cerrada: "gray" };

export default function AdminPanel() {
  const {
    vacantes, empresas, candidatos, postulaciones, capacitaciones, mentorias,
    cambiarEstadoVacante, crearCapacitacion, crearMentoria,
  } = useApp();
  const [tab, setTab] = useState("metricas");
  const [nuevaCap, setNuevaCap] = useState({ titulo: "", categoria: "Liderazgo", modalidad: "Online en vivo", fecha: "", cupos: 20, descripcion: "" });
  const [capExpandida, setCapExpandida] = useState(null);
  const [nuevaMentoria, setNuevaMentoria] = useState({ mentor: "", especialidad: "", modalidad: "Online, sesiones de 45 min", cuposDisponibles: 5, publico: "candidato" });

  const pendientes = vacantes.filter((v) => v.estado === "pendiente");
  const fechaHoy = new Date().toISOString().slice(0, 10);

  function exportarCandidatos() {
    descargarCSV(
      `candidatos-${fechaHoy}.csv`,
      [
        { titulo: "Nombre", valor: (c) => c.nombre },
        { titulo: "Email", valor: (c) => c.email },
        { titulo: "Teléfono", valor: (c) => c.telefono },
        { titulo: "Ubicación", valor: (c) => c.ubicacion },
        { titulo: "Título", valor: (c) => c.titulo },
        { titulo: "Nivel", valor: (c) => c.nivel },
        { titulo: "Disponibilidad", valor: (c) => c.disponibilidad },
        { titulo: "Habilidades", valor: (c) => (c.habilidades || []).join("; ") },
        { titulo: "Membresía", valor: (c) => c.membresia },
        { titulo: "Membresía vence", valor: (c) => (c.membresiaVencimiento ? c.membresiaVencimiento.slice(0, 10) : "") },
        { titulo: "Registrado el", valor: (c) => c.fechaRegistro },
      ],
      candidatos
    );
  }

  function exportarEmpresas() {
    descargarCSV(
      `pymes-${fechaHoy}.csv`,
      [
        { titulo: "Nombre", valor: (e) => e.nombre },
        { titulo: "Rubro", valor: (e) => e.rubro },
        { titulo: "Tamaño", valor: (e) => e.tamano },
        { titulo: "Ubicación", valor: (e) => e.ubicacion },
        { titulo: "Contacto", valor: (e) => e.contacto },
        { titulo: "Email", valor: (e) => e.email },
        { titulo: "Plan", valor: (e) => e.plan },
        { titulo: "Plan vence", valor: (e) => (e.planVencimiento ? e.planVencimiento.slice(0, 10) : "") },
        { titulo: "Registrada el", valor: (e) => e.fechaRegistro },
      ],
      empresas
    );
  }

  function exportarVacantes() {
    descargarCSV(
      `vacantes-${fechaHoy}.csv`,
      [
        { titulo: "Título", valor: (v) => v.titulo },
        { titulo: "Empresa", valor: (v) => empresas.find((e) => e.id === v.empresaId)?.nombre || "" },
        { titulo: "Área", valor: (v) => v.area },
        { titulo: "Modalidad", valor: (v) => v.modalidad },
        { titulo: "Ubicación", valor: (v) => v.ubicacion },
        { titulo: "Nivel", valor: (v) => v.nivel },
        { titulo: "Salario", valor: (v) => v.salario },
        { titulo: "Estado", valor: (v) => v.estado },
        { titulo: "Publicada el", valor: (v) => v.fechaPublicacion },
      ],
      vacantes
    );
  }

  function exportarPostulaciones() {
    descargarCSV(
      `postulaciones-${fechaHoy}.csv`,
      [
        { titulo: "Candidato", valor: (p) => candidatos.find((c) => c.id === p.candidatoId)?.nombre || "" },
        { titulo: "Vacante", valor: (p) => vacantes.find((v) => v.id === p.vacanteId)?.titulo || "" },
        {
          titulo: "Empresa",
          valor: (p) => {
            const vac = vacantes.find((v) => v.id === p.vacanteId);
            return empresas.find((e) => e.id === vac?.empresaId)?.nombre || "";
          },
        },
        { titulo: "Estado", valor: (p) => p.estado },
        { titulo: "Fecha", valor: (p) => p.fecha },
        { titulo: "Mensaje", valor: (p) => p.mensaje || "" },
      ],
      postulaciones
    );
  }

  async function submitCapacitacion(e) {
    e.preventDefault();
    try {
      await crearCapacitacion({ ...nuevaCap, cupos: Number(nuevaCap.cupos) });
      setNuevaCap({ titulo: "", categoria: "Liderazgo", modalidad: "Online en vivo", fecha: "", cupos: 20, descripcion: "" });
    } catch (err) {
      console.error(err);
    }
  }

  async function submitMentoria(e) {
    e.preventDefault();
    try {
      await crearMentoria({ ...nuevaMentoria, cuposDisponibles: Number(nuevaMentoria.cuposDisponibles) });
      setNuevaMentoria({ mentor: "", especialidad: "", modalidad: "Online, sesiones de 45 min", cuposDisponibles: 5, publico: "candidato" });
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
        <div>
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

          <Card className="p-5 mt-6">
            <h3 className="font-bold text-navy-900 mb-1">Exportar datos</h3>
            <p className="text-sm text-navy-500 mb-4">Descarga en CSV, se abre directo en Excel o Google Sheets.</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={exportarCandidatos}>
                <Download size={15} /> Candidatos
              </Button>
              <Button variant="outline" onClick={exportarEmpresas}>
                <Download size={15} /> PYMEs
              </Button>
              <Button variant="outline" onClick={exportarVacantes}>
                <Download size={15} /> Vacantes
              </Button>
              <Button variant="outline" onClick={exportarPostulaciones}>
                <Download size={15} /> Postulaciones
              </Button>
            </div>
          </Card>
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
            {capacitaciones.map((c) => {
              const expandida = capExpandida === c.id;
              const inscriptosCap = c.inscriptos
                .map((id) => candidatos.find((cand) => cand.id === id))
                .filter(Boolean);
              return (
                <Card key={c.id} className="p-4">
                  <p className="font-semibold text-navy-900">{c.titulo}</p>
                  <p className="text-sm text-navy-500">{c.fecha} · {c.inscriptos.length}/{c.cupos} inscriptos</p>
                  {c.inscriptos.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setCapExpandida(expandida ? null : c.id)}
                      className="text-teal-600 text-sm font-semibold mt-2"
                    >
                      {expandida ? "Ocultar inscriptos" : "Ver inscriptos"}
                    </button>
                  )}
                  {expandida && (
                    <div className="mt-3 space-y-2 border-t border-navy-100 pt-3">
                      {inscriptosCap.map((cand) => (
                        <div key={cand.id} className="text-sm">
                          <p className="font-medium text-navy-800">{cand.nombre}</p>
                          <p className="text-navy-400">
                            {cand.email}
                            {cand.telefono ? ` · ${cand.telefono}` : ""}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          <h3 className="font-bold text-navy-900 mt-10 mb-3">Mentorías</h3>
          <Card className="p-6 mb-6 max-w-2xl">
            <h4 className="font-bold text-navy-900 mb-3">Nueva mentoría</h4>
            <form onSubmit={submitMentoria}>
              <div className="grid sm:grid-cols-2 gap-x-4">
                <Field label="Mentor/a">
                  <Input required value={nuevaMentoria.mentor} onChange={(e) => setNuevaMentoria({ ...nuevaMentoria, mentor: e.target.value })} />
                </Field>
                <Field label="Especialidad">
                  <Input required value={nuevaMentoria.especialidad} onChange={(e) => setNuevaMentoria({ ...nuevaMentoria, especialidad: e.target.value })} />
                </Field>
              </div>
              <div className="grid sm:grid-cols-3 gap-x-4">
                <Field label="Modalidad">
                  <Input value={nuevaMentoria.modalidad} onChange={(e) => setNuevaMentoria({ ...nuevaMentoria, modalidad: e.target.value })} />
                </Field>
                <Field label="Cupos"><Input type="number" min="1" value={nuevaMentoria.cuposDisponibles} onChange={(e) => setNuevaMentoria({ ...nuevaMentoria, cuposDisponibles: e.target.value })} /></Field>
                <Field label="Para quién es" hint="Quién puede verla y reservarla">
                  <Select value={nuevaMentoria.publico} onChange={(e) => setNuevaMentoria({ ...nuevaMentoria, publico: e.target.value })}>
                    <option value="candidato">Candidatos</option>
                    <option value="empresa">Empresas (PYMEs)</option>
                    <option value="ambos">Ambos</option>
                  </Select>
                </Field>
              </div>
              <Button type="submit">Crear mentoría</Button>
            </form>
          </Card>

          <div className="grid sm:grid-cols-2 gap-4">
            {mentorias.map((m) => (
              <Card key={m.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-navy-900">{m.mentor}</p>
                    <p className="text-sm text-navy-500">{m.especialidad}</p>
                  </div>
                  <Badge tone="teal">
                    {m.publico === "empresa" ? "Empresas" : m.publico === "ambos" ? "Ambos" : "Candidatos"}
                  </Badge>
                </div>
                <p className="text-sm text-navy-400 mt-2">
                  {m.reservasCandidatos.length + m.reservasEmpresas.length}/{m.cuposDisponibles} reservas
                </p>
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
