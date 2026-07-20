import { useState } from "react";
import { LayoutDashboard, Briefcase, GraduationCap, Building2, Users, Download } from "lucide-react";
import { useApp } from "../../data/store.jsx";
import { Card, Badge, Button, StatCard, EmptyState, Field, Input, Select, Textarea } from "../../components/ui.jsx";
import { descargarCSV } from "../../utils/exportarCsv.js";
import SasConsultoraLogo from "../../components/SasConsultoraLogo.jsx";
import { MENTORIA_PAQUETES, formatoPesos } from "../../data/mentoriaPaquetes.js";
import { mensajeError } from "../../utils/errores";

const TABS = [
  { id: "metricas", label: "Métricas", icon: LayoutDashboard },
  { id: "vacantes", label: "Moderar vacantes", icon: Briefcase },
  { id: "formacion", label: "Capacitaciones y mentorías", icon: GraduationCap },
  { id: "empresas", label: "PYMEs", icon: Building2 },
  { id: "candidatos", label: "Candidatos", icon: Users },
];

const estadoBadge = { pendiente: "terracotta", aprobada: "gold", rechazada: "gray", cerrada: "gray" };

export default function AdminPanel() {
  const {
    vacantes, empresas, candidatos, postulaciones, capacitaciones, pagos,
    cambiarEstadoVacante, crearCapacitacion,
  } = useApp();
  const [tab, setTab] = useState("metricas");
  const [nuevaCap, setNuevaCap] = useState({ titulo: "", categoria: "Liderazgo", modalidad: "Online en vivo", fecha: "", cupos: 20, descripcion: "" });
  const [capExpandida, setCapExpandida] = useState(null);
  const [errorCap, setErrorCap] = useState("");

  const comprasMentorias = pagos
    .filter((p) => p.tipo === "mentoria")
    .map((p) => {
      const paquete = MENTORIA_PAQUETES.find((mp) => mp.id === p.planId);
      const candidato = candidatos.find((c) => c.id === p.entidadId);
      const empresa = candidato ? null : empresas.find((e) => e.id === p.entidadId);
      const comprador = candidato || empresa;
      return {
        ...p,
        paqueteNombre: paquete?.nombre || p.planId,
        compradorNombre: comprador?.nombre || "—",
        compradorEmail: comprador?.email || "",
        compradorTipo: candidato ? "Candidato" : empresa ? "PYME" : "—",
      };
    });

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
    setErrorCap("");
    try {
      await crearCapacitacion({ ...nuevaCap, cupos: Number(nuevaCap.cupos) });
      setNuevaCap({ titulo: "", categoria: "Liderazgo", modalidad: "Online en vivo", fecha: "", cupos: 20, descripcion: "" });
    } catch (err) {
      console.error(err);
      setErrorCap(mensajeError(err, "No pudimos crear la capacitación. Probá de nuevo en unos segundos."));
    }
  }

  function exportarMentorias() {
    descargarCSV(
      `compras-mentorias-${fechaHoy}.csv`,
      [
        { titulo: "Comprador", valor: (p) => p.compradorNombre },
        { titulo: "Tipo", valor: (p) => p.compradorTipo },
        { titulo: "Email", valor: (p) => p.compradorEmail },
        { titulo: "Paquete", valor: (p) => p.paqueteNombre },
        { titulo: "Monto", valor: (p) => p.monto },
        { titulo: "Estado", valor: (p) => p.estado },
        { titulo: "Fecha", valor: (p) => (p.createdAt ? p.createdAt.slice(0, 10) : "") },
      ],
      comprasMentorias
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <Badge tone="forest">Panel interno</Badge>
          <h1 className="text-2xl md:text-3xl font-extrabold text-forest-900 mt-2">Administración</h1>
        </div>
        <SasConsultoraLogo />
      </div>

      <div className="flex flex-wrap gap-2 mb-8 border-b border-forest-100 pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-t-lg text-sm font-semibold ${
              tab === t.id ? "bg-white border border-b-0 border-forest-100 text-gold-600" : "text-forest-400 hover:text-forest-600"
            }`}
          >
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {tab === "metricas" && (
        <div>
          <div className="grid sm:grid-cols-3 gap-4">
            <StatCard label="PYMEs registradas" value={empresas.length} tone="forest" />
            <StatCard label="Candidatos en la base" value={candidatos.length} tone="gold" />
            <StatCard label="Vacantes totales" value={vacantes.length} tone="terracotta" />
            <StatCard label="Vacantes pendientes de aprobar" value={pendientes.length} tone="terracotta" />
            <StatCard label="Postulaciones totales" value={postulaciones.length} tone="gold" />
            <StatCard label="Capacitaciones activas" value={capacitaciones.length} tone="forest" />
            <StatCard label="Mentorías compradas" value={comprasMentorias.filter((p) => p.estado === "aprobado").length} tone="gold" />
            <StatCard label="Candidatos premium" value={candidatos.filter((c) => c.membresia === "premium").length} tone="terracotta" />
            <StatCard label="PYMEs plan premium" value={empresas.filter((e) => e.plan === "premium").length} tone="forest" />
          </div>

          <Card className="p-5 mt-6">
            <h3 className="font-bold text-forest-900 mb-1">Exportar datos</h3>
            <p className="text-sm text-forest-500 mb-4">Descarga en CSV, se abre directo en Excel o Google Sheets.</p>
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
              <Button variant="outline" onClick={exportarMentorias}>
                <Download size={15} /> Compras de mentorías
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
                      <h3 className="font-bold text-forest-900">{v.titulo}</h3>
                      <Badge tone={estadoBadge[v.estado]}>{v.estado}</Badge>
                    </div>
                    <p className="text-sm text-forest-500">{empresa?.nombre} · {v.ubicacion} · {v.fechaPublicacion}</p>
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
            <h3 className="font-bold text-forest-900 mb-3">Nueva capacitación</h3>
            {errorCap && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2">{errorCap}</div>
            )}
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
              const inscriptosCand = c.inscriptosCandidatos
                .map((id) => candidatos.find((cand) => cand.id === id))
                .filter(Boolean)
                .map((cand) => ({ tipo: "Candidato", nombre: cand.nombre, email: cand.email, telefono: cand.telefono }));
              const inscriptosEmp = c.inscriptosEmpresas
                .map((id) => empresas.find((emp) => emp.id === id))
                .filter(Boolean)
                .map((emp) => ({ tipo: "PYME", nombre: `${emp.nombre} (${emp.contacto})`, email: emp.email, telefono: "" }));
              const inscriptosCap = [...inscriptosCand, ...inscriptosEmp];
              const totalInscriptos = inscriptosCap.length;
              return (
                <Card key={c.id} className="p-4">
                  <p className="font-semibold text-forest-900">{c.titulo}</p>
                  <p className="text-sm text-forest-500">{c.fecha} · {totalInscriptos}/{c.cupos} inscriptos</p>
                  {totalInscriptos > 0 && (
                    <button
                      type="button"
                      onClick={() => setCapExpandida(expandida ? null : c.id)}
                      className="text-gold-600 text-sm font-semibold mt-2"
                    >
                      {expandida ? "Ocultar inscriptos" : "Ver inscriptos"}
                    </button>
                  )}
                  {expandida && (
                    <div className="mt-3 space-y-2 border-t border-forest-100 pt-3">
                      {inscriptosCap.map((insc, i) => (
                        <div key={i} className="text-sm">
                          <p className="font-medium text-forest-800">{insc.nombre} <span className="text-forest-400 font-normal">· {insc.tipo}</span></p>
                          <p className="text-forest-400">
                            {insc.email}
                            {insc.telefono ? ` · ${insc.telefono}` : ""}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-10 mb-3">
            <h3 className="font-bold text-forest-900">Mentorías — compras</h3>
            <Button variant="outline" onClick={exportarMentorias}>
              <Download size={15} /> Exportar
            </Button>
          </div>
          <p className="text-sm text-forest-400 mb-4">
            Espacio de Orden ({formatoPesos(MENTORIA_PAQUETES[0].precioSocio)}) y Mentoría Refoco ({formatoPesos(MENTORIA_PAQUETES[1].precioSocio)})
            se compran directo desde Capacitaciones — acá aparece cada compra para coordinar las sesiones.
          </p>
          {comprasMentorias.length === 0 ? (
            <EmptyState text="Todavía no hay compras de mentorías." />
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {comprasMentorias.map((p) => (
                <Card key={p.id} className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-forest-900">{p.compradorNombre}</p>
                      <p className="text-sm text-forest-500">{p.compradorTipo} · {p.compradorEmail}</p>
                    </div>
                    <Badge tone={p.estado === "aprobado" ? "gold" : p.estado === "pendiente" ? "terracotta" : "gray"}>
                      {p.estado}
                    </Badge>
                  </div>
                  <p className="text-sm text-forest-400 mt-2">
                    {p.paqueteNombre} · {formatoPesos(p.monto)} · {p.createdAt ? p.createdAt.slice(0, 10) : ""}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "empresas" && (
        <div className="space-y-3">
          {empresas.map((e) => (
            <Card key={e.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-forest-900">{e.nombre}</h3>
                <p className="text-sm text-forest-500">{e.rubro} · {e.ubicacion} · Desde {e.fechaRegistro}</p>
              </div>
              <Badge tone="gold">Plan {e.plan}</Badge>
            </Card>
          ))}
        </div>
      )}

      {tab === "candidatos" && (
        <div className="space-y-3">
          {candidatos.map((c) => (
            <Card key={c.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-forest-900">{c.nombre}</h3>
                <p className="text-sm text-forest-500">{c.titulo} · {c.ubicacion} · Desde {c.fechaRegistro}</p>
              </div>
              <Badge tone={c.membresia === "premium" ? "terracotta" : "gray"}>{c.membresia}</Badge>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
