import { useState, useEffect } from "react";
import { LayoutDashboard, Briefcase, GraduationCap, Building2, Users, Download, CalendarClock, Inbox, BarChart3, Pencil, Trash2 } from "lucide-react";
import { supabase } from "../../data/supabaseClient";
import { useApp } from "../../data/store.jsx";
import { Card, Badge, Button, StatCard, EmptyState, Field, Input, Select, Textarea } from "../../components/ui.jsx";
import { descargarCSV } from "../../utils/exportarCsv.js";
import SasConsultoraLogo from "../../components/SasConsultoraLogo.jsx";
import { MENTORIA_PAQUETES, formatoPesos } from "../../data/mentoriaPaquetes.js";
import { mensajeError } from "../../utils/errores";
import { NOMBRE_PLAN_EMPRESA, precioEfectivo, enPeriodoPromocional } from "../../utils/capacitaciones.js";

const TABS = [
  { id: "metricas", label: "Métricas", icon: LayoutDashboard },
  { id: "solicitudes", label: "Solicitudes", icon: Inbox },
  { id: "vacantes", label: "Moderar vacantes", icon: Briefcase },
  { id: "formacion", label: "Capacitaciones y mentorías", icon: GraduationCap },
  { id: "empresas", label: "PYMEs", icon: Building2 },
  { id: "candidatos", label: "Candidatos", icon: Users },
  { id: "consultorias", label: "Consultorías", icon: CalendarClock },
  { id: "analitica", label: "Analítica", icon: BarChart3 },
];

const estadoBadge = { pendiente: "terracotta", aprobada: "gold", rechazada: "gray", cerrada: "gray" };
const estadoConsultoriaBadge = { solicitada: "terracotta", confirmada: "gold", realizada: "gray", cancelada: "gray" };

// Embudo comercial de las solicitudes de servicio (Propuesta Integral, fases
// incluidas en plan, consultas generales). El orden importa: es el pipeline.
const ESTADOS_SOLICITUD = ["nueva", "contactada", "cotizada", "ganada", "perdida"];
const estadoSolicitudBadge = {
  nueva: "terracotta",
  contactada: "gold",
  cotizada: "gold",
  ganada: "gold",
  perdida: "gray",
};
const NOMBRE_SERVICIO_SOLICITUD = {
  integral: "Propuesta Integral de Selección",
  "fase-1": "Fase 1: Definición del Perfil",
  "fase-2": "Fase 2: Búsqueda y Preselección",
  "fase-3": "Fase 3: Evaluación y Finalista",
  "fase-4": "Fase 4: Post-Incorporación",
  "consulta-general": "Consulta general",
};

export default function AdminPanel() {
  const {
    vacantes, empresas, candidatos, postulaciones, capacitaciones, pagos,
    cambiarEstadoVacante, crearCapacitacion, actualizarEnlaceCapacitacion,
    consultorias, cambiarEstadoConsultoria,
    solicitudes, cambiarEstadoSolicitud,
    actualizarEmpresa, eliminarEmpresa, actualizarCandidato, eliminarCandidato,
  } = useApp();
  const [errorConsultoria, setErrorConsultoria] = useState("");
  const [errorSolicitud, setErrorSolicitud] = useState("");
  const [filtroSolicitud, setFiltroSolicitud] = useState("abiertas");
  const [empresaEditando, setEmpresaEditando] = useState(null);
  const [formEmpresa, setFormEmpresa] = useState(null);
  const [errorEmpresa, setErrorEmpresa] = useState("");
  const [guardandoEmpresa, setGuardandoEmpresa] = useState(false);
  const [candidatoEditando, setCandidatoEditando] = useState(null);
  const [formCandidato, setFormCandidato] = useState(null);
  const [errorCandidato, setErrorCandidato] = useState("");
  const [guardandoCandidato, setGuardandoCandidato] = useState(false);

  // Analítica: se consulta solo al abrir la pestaña, para no cargar eventos en
  // cada render del panel (la tabla puede crecer mucho más que las demás).
  const [eventos, setEventos] = useState(null);
  const [diasAnalitica, setDiasAnalitica] = useState(30);
  const [cargandoEventos, setCargandoEventos] = useState(false);
  const [tab, setTab] = useState("metricas");
  const [nuevaCap, setNuevaCap] = useState({
    titulo: "", categoria: "Liderazgo", modalidad: "Online en vivo", fecha: "", cupos: 20, descripcion: "",
    // Por defecto, "incluida desde plan Avanzado" para PYMEs (política estándar
    // acordada) y abierta para candidatos. El admin puede cambiarlo por capacitación.
    accesoTipo: "plan", precio: "", precioUsd: "", precioPromocional: "", precioPromocionalUsd: "", promocionHasta: "", cuposPromocional: "",
    planMinimoEmpresa: "avanzado", planMinimoCandidato: "", enlaceAcceso: "",
  });
  const [capExpandida, setCapExpandida] = useState(null);
  const [errorCap, setErrorCap] = useState("");
  const [enlaceEditando, setEnlaceEditando] = useState(null);
  const [enlaceValor, setEnlaceValor] = useState("");
  const [errorEnlace, setErrorEnlace] = useState("");

  useEffect(() => {
    if (tab !== "analitica") return;
    let vigente = true;
    setCargandoEventos(true);
    const desde = new Date();
    desde.setDate(desde.getDate() - diasAnalitica);
    supabase
      .from("eventos")
      .select("tipo, ruta, referrer, rol, meta, created_at")
      .gte("created_at", desde.toISOString())
      .order("created_at", { ascending: false })
      .limit(5000)
      .then(({ data, error: errEv }) => {
        if (!vigente) return;
        if (errEv) console.error("Error cargando eventos", errEv);
        setEventos(data || []);
        setCargandoEventos(false);
      });
    return () => {
      vigente = false;
    };
  }, [tab, diasAnalitica]);

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
      await crearCapacitacion({
        ...nuevaCap,
        cupos: Number(nuevaCap.cupos),
        precio: nuevaCap.precio ? Number(nuevaCap.precio) : null,
        precioUsd: nuevaCap.precioUsd ? Number(nuevaCap.precioUsd) : null,
        precioPromocional: nuevaCap.precioPromocional ? Number(nuevaCap.precioPromocional) : null,
        precioPromocionalUsd: nuevaCap.precioPromocionalUsd ? Number(nuevaCap.precioPromocionalUsd) : null,
        promocionHasta: nuevaCap.promocionHasta || null,
        cuposPromocional: nuevaCap.cuposPromocional ? Number(nuevaCap.cuposPromocional) : null,
        planMinimoEmpresa: nuevaCap.planMinimoEmpresa || null,
        planMinimoCandidato: nuevaCap.planMinimoCandidato || null,
        enlaceAcceso: nuevaCap.enlaceAcceso || null,
      });
      setNuevaCap({
        titulo: "", categoria: "Liderazgo", modalidad: "Online en vivo", fecha: "", cupos: 20, descripcion: "",
        accesoTipo: "plan", precio: "", precioUsd: "", precioPromocional: "", precioPromocionalUsd: "", promocionHasta: "", cuposPromocional: "",
        planMinimoEmpresa: "avanzado", planMinimoCandidato: "", enlaceAcceso: "",
      });
    } catch (err) {
      console.error(err);
      setErrorCap(mensajeError(err, "No pudimos crear la capacitación. Probá de nuevo en unos segundos."));
    }
  }

  function abrirEdicionEmpresa(e) {
    setErrorEmpresa("");
    setEmpresaEditando(e.id);
    setFormEmpresa({
      nombre: e.nombre || "",
      rubro: e.rubro || "",
      ubicacion: e.ubicacion || "",
      contacto: e.contacto || "",
      email: e.email || "",
      plan: e.plan || "basico",
      planVencimiento: e.planVencimiento ? e.planVencimiento.slice(0, 10) : "",
    });
  }

  async function guardarEmpresa(id) {
    setErrorEmpresa("");
    setGuardandoEmpresa(true);
    try {
      await actualizarEmpresa(id, {
        ...formEmpresa,
        planVencimiento: formEmpresa.planVencimiento ? new Date(formEmpresa.planVencimiento).toISOString() : null,
      });
      setEmpresaEditando(null);
    } catch (err) {
      console.error(err);
      setErrorEmpresa(mensajeError(err, "No pudimos guardar los cambios."));
    } finally {
      setGuardandoEmpresa(false);
    }
  }

  async function borrarEmpresa(e) {
    if (!window.confirm(`¿Eliminar definitivamente a "${e.nombre}"? Se borran también sus vacantes, postulaciones y pagos asociados. Esta acción no se puede deshacer.`)) return;
    setErrorEmpresa("");
    try {
      await eliminarEmpresa(e.id);
    } catch (err) {
      console.error(err);
      setErrorEmpresa(mensajeError(err, "No pudimos eliminar la PYME."));
    }
  }

  function abrirEdicionCandidato(c) {
    setErrorCandidato("");
    setCandidatoEditando(c.id);
    setFormCandidato({
      nombre: c.nombre || "",
      email: c.email || "",
      telefono: c.telefono || "",
      ubicacion: c.ubicacion || "",
      titulo: c.titulo || "",
      nivel: c.nivel || "Junior",
      membresia: c.membresia || "free",
      membresiaVencimiento: c.membresiaVencimiento ? c.membresiaVencimiento.slice(0, 10) : "",
    });
  }

  async function guardarCandidato(id) {
    setErrorCandidato("");
    setGuardandoCandidato(true);
    try {
      await actualizarCandidato(id, {
        ...formCandidato,
        membresiaVencimiento: formCandidato.membresiaVencimiento ? new Date(formCandidato.membresiaVencimiento).toISOString() : null,
      });
      setCandidatoEditando(null);
    } catch (err) {
      console.error(err);
      setErrorCandidato(mensajeError(err, "No pudimos guardar los cambios."));
    } finally {
      setGuardandoCandidato(false);
    }
  }

  async function borrarCandidato(c) {
    if (!window.confirm(`¿Eliminar definitivamente a "${c.nombre}"? Se borran también sus postulaciones e inscripciones asociadas. Esta acción no se puede deshacer.`)) return;
    setErrorCandidato("");
    try {
      await eliminarCandidato(c.id);
    } catch (err) {
      console.error(err);
      setErrorCandidato(mensajeError(err, "No pudimos eliminar el candidato."));
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

      {tab === "analitica" && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div className="max-w-2xl">
                <p className="text-sm font-bold text-forest-900">Qué hace la gente que entra al sitio</p>
                <p className="text-xs text-forest-600 mt-1 leading-relaxed">
                  Medición propia, sin cookies ni Google: no se guarda IP, ni nombre, ni nada que
                  permita seguir a una persona entre visitas. Solo qué páginas se ven y qué acciones
                  se hacen. Por eso el sitio no necesita cartel de consentimiento.
                </p>
              </div>
              <Field label="Período">
                <Select
                  value={diasAnalitica}
                  onChange={(e) => setDiasAnalitica(Number(e.target.value))}
                  className="sm:w-40"
                >
                  <option value={7}>Últimos 7 días</option>
                  <option value={30}>Últimos 30 días</option>
                  <option value={90}>Últimos 90 días</option>
                </Select>
              </Field>
            </div>
          </Card>

          {cargandoEventos && <EmptyState text="Cargando datos..." />}

          {!cargandoEventos && eventos && eventos.length === 0 && (
            <EmptyState text="Todavía no hay visitas registradas en este período. Los datos empiezan a acumularse desde ahora." />
          )}

          {!cargandoEventos && eventos && eventos.length > 0 && (() => {
            const visitas = eventos.filter((e) => e.tipo === "pageview");
            const conteo = (arr, campo) => {
              const m = {};
              arr.forEach((e) => {
                const k = e[campo] || "(directo)";
                m[k] = (m[k] || 0) + 1;
              });
              return Object.entries(m).sort((a, b) => b[1] - a[1]);
            };
            const porRuta = conteo(visitas, "ruta").slice(0, 12);
            const porReferrer = conteo(visitas, "referrer").slice(0, 8);
            const porRol = conteo(visitas, "rol");
            const acciones = eventos.filter((e) => e.tipo !== "pageview");
            const porAccion = conteo(acciones, "tipo");
            const maxRuta = porRuta[0]?.[1] || 1;

            return (
              <>
                <div className="grid sm:grid-cols-4 gap-4">
                  <StatCard label="Páginas vistas" value={visitas.length} tone="forest" />
                  <StatCard label="Pagos iniciados" value={acciones.filter((e) => e.tipo === "pago_iniciado").length} tone="gold" />
                  <StatCard label="Solicitudes enviadas" value={acciones.filter((e) => e.tipo === "solicitud_enviada").length} tone="terracotta" />
                  <StatCard label="Visitas de anónimos" value={porRol.find((r) => r[0] === "anonimo")?.[1] || 0} tone="gold" />
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  <Card className="p-5">
                    <h3 className="font-bold text-forest-900 mb-3">Páginas más vistas</h3>
                    <div className="space-y-2">
                      {porRuta.map(([ruta, n]) => (
                        <div key={ruta}>
                          <div className="flex justify-between text-sm text-forest-600">
                            <span className="truncate pr-3">{ruta}</span>
                            <span className="font-bold shrink-0">{n}</span>
                          </div>
                          <div className="h-1.5 bg-forest-50 rounded-full mt-1 overflow-hidden">
                            <div
                              className="h-full bg-gold-500 rounded-full"
                              style={{ width: `${Math.round((n / maxRuta) * 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <div className="space-y-4">
                    <Card className="p-5">
                      <h3 className="font-bold text-forest-900 mb-3">De dónde llegan</h3>
                      {porReferrer.length === 0 ? (
                        <p className="text-sm text-forest-400">Sin datos todavía.</p>
                      ) : (
                        <ul className="space-y-1.5">
                          {porReferrer.map(([ref, n]) => (
                            <li key={ref} className="flex justify-between text-sm text-forest-600">
                              <span className="truncate pr-3">{ref}</span>
                              <span className="font-bold shrink-0">{n}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </Card>

                    <Card className="p-5">
                      <h3 className="font-bold text-forest-900 mb-3">Acciones registradas</h3>
                      {porAccion.length === 0 ? (
                        <p className="text-sm text-forest-400">
                          Todavía nadie inició un pago ni envió una solicitud en este período.
                        </p>
                      ) : (
                        <ul className="space-y-1.5">
                          {porAccion.map(([tipo, n]) => (
                            <li key={tipo} className="flex justify-between text-sm text-forest-600">
                              <span className="capitalize">{tipo.replace(/_/g, " ")}</span>
                              <span className="font-bold">{n}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </Card>

                    <Card className="p-5">
                      <h3 className="font-bold text-forest-900 mb-3">Quién navega</h3>
                      <ul className="space-y-1.5">
                        {porRol.map(([rol, n]) => (
                          <li key={rol} className="flex justify-between text-sm text-forest-600">
                            <span className="capitalize">{rol}</span>
                            <span className="font-bold">{n}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {tab === "solicitudes" && (
        <div className="space-y-3">
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div className="max-w-2xl">
                <p className="text-sm font-bold text-forest-900">Consultas por servicios que no se pagan online</p>
                <p className="text-xs text-forest-600 mt-1 leading-relaxed">
                  Acá caen los pedidos de la Propuesta Integral de Selección, las fases que un plan
                  ya incluye y las consultas generales. Cada una ya recibió un acuse automático:
                  lo que falta es que la contactes y cotices. Movela de estado para no perderle
                  el rastro.
                </p>
              </div>
              <Field label="Ver">
                <Select
                  value={filtroSolicitud}
                  onChange={(e) => setFiltroSolicitud(e.target.value)}
                  className="sm:w-52"
                >
                  <option value="abiertas">Abiertas (sin cerrar)</option>
                  <option value="">Todas</option>
                  {ESTADOS_SOLICITUD.map((es) => (
                    <option key={es} value={es}>{es}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4">
              {ESTADOS_SOLICITUD.map((es) => (
                <div key={es} className="rounded-xl bg-forest-50/60 border border-forest-100 px-3 py-2">
                  <div className="text-lg font-extrabold text-forest-900">
                    {solicitudes.filter((s) => s.estado === es).length}
                  </div>
                  <div className="text-xs text-forest-500 capitalize">{es}</div>
                </div>
              ))}
            </div>
          </Card>

          {errorSolicitud && (
            <p className="text-sm text-terracotta-600 font-semibold">{errorSolicitud}</p>
          )}

          {(() => {
            const visibles = solicitudes.filter((s) => {
              if (filtroSolicitud === "") return true;
              if (filtroSolicitud === "abiertas") return s.estado !== "ganada" && s.estado !== "perdida";
              return s.estado === filtroSolicitud;
            });
            if (visibles.length === 0) {
              return (
                <EmptyState
                  text={
                    solicitudes.length === 0
                      ? "Todavía no entró ninguna solicitud."
                      : "No hay solicitudes con ese estado."
                  }
                />
              );
            }
            return visibles.map((s) => (
              <Card key={s.id} className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-forest-900">
                        {NOMBRE_SERVICIO_SOLICITUD[s.servicio] || s.servicio}
                      </h3>
                      <Badge tone={estadoSolicitudBadge[s.estado] || "gray"}>{s.estado}</Badge>
                      <span className="text-xs text-forest-400">
                        {new Date(s.createdAt).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" })}
                      </span>
                    </div>
                    <p className="text-sm text-forest-700 font-semibold mt-2">
                      {s.nombre}
                      {s.empresaNombre ? ` · ${s.empresaNombre}` : ""}
                    </p>
                    <p className="text-sm text-forest-500">
                      <a href={`mailto:${s.email}`} className="text-gold-600 font-semibold hover:underline">
                        {s.email}
                      </a>
                      {s.telefono ? ` · ${s.telefono}` : ""}
                    </p>
                    {s.puesto && (
                      <p className="text-sm text-forest-600 mt-1">
                        Puesto a cubrir: <strong>{s.puesto}</strong>
                      </p>
                    )}
                    {s.mensaje && (
                      <p className="text-sm text-forest-500 mt-2 leading-relaxed whitespace-pre-line">
                        {s.mensaje}
                      </p>
                    )}
                  </div>
                  <div className="lg:w-52 shrink-0">
                    <Field label="Estado">
                      <Select
                        value={s.estado}
                        onChange={async (e) => {
                          setErrorSolicitud("");
                          try {
                            await cambiarEstadoSolicitud(s.id, { estado: e.target.value });
                          } catch (err) {
                            setErrorSolicitud(mensajeError(err, "No se pudo cambiar el estado."));
                          }
                        }}
                      >
                        {ESTADOS_SOLICITUD.map((es) => (
                          <option key={es} value={es}>{es}</option>
                        ))}
                      </Select>
                    </Field>
                  </div>
                </div>
              </Card>
            ));
          })()}
        </div>
      )}

      {tab === "vacantes" && (
        <div className="space-y-3">
          <Card className="p-4 bg-gold-50/50 border-gold-200">
            <p className="text-sm font-bold text-forest-900">Las vacantes se publican solas</p>
            <p className="text-xs text-forest-600 mt-1 leading-relaxed max-w-3xl">
              Ya no hay que aprobarlas para que salgan: quedan visibles apenas la PYME las carga
              (o apenas se acredita el pago, en el plan Por Vacante) y te llega un email por cada
              una. Esta pantalla es para revisarlas <strong>después</strong>: si alguna tiene los
              requisitos mal cargados o algo que no corresponde, la despublicás acá y la PYME
              recibe el aviso automáticamente.
            </p>
          </Card>

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
                      <Badge tone={estadoBadge[v.estado] || "terracotta"}>
                        {v.estado === "pendiente_pago" ? "esperando pago" : v.estado}
                      </Badge>
                      {v.fechaVencimiento && <span className="text-xs text-forest-400">vence {v.fechaVencimiento}</span>}
                    </div>
                    <p className="text-sm text-forest-500">{empresa?.nombre} · {v.ubicacion} · {v.fechaPublicacion}</p>
                  </div>
                  <div className="flex gap-2">
                    {v.estado === "pendiente_pago" ? (
                      <span className="text-sm text-forest-400">
                        Todavía no se acreditó el pago. Se publica sola cuando entre.
                      </span>
                    ) : (
                      <>
                        {v.estado === "aprobada" && (
                          <>
                            <Button variant="outline" onClick={() => cambiarEstadoVacante(v.id, "rechazada")}>
                              Despublicar
                            </Button>
                            <Button variant="ghost" onClick={() => cambiarEstadoVacante(v.id, "cerrada")}>
                              Cerrar búsqueda
                            </Button>
                          </>
                        )}
                        {v.estado !== "aprobada" && (
                          <Button variant="primary" onClick={() => cambiarEstadoVacante(v.id, "aprobada")}>
                            Volver a publicar
                          </Button>
                        )}
                      </>
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

              <Field label="Acceso" hint="Cómo se habilita la inscripción">
                <Select value={nuevaCap.accesoTipo} onChange={(e) => setNuevaCap({ ...nuevaCap, accesoTipo: e.target.value })}>
                  <option value="gratis">Gratis para todos</option>
                  <option value="paga">Paga (cobro único vía Mercado Pago)</option>
                  <option value="plan">Incluida según plan/membresía</option>
                </Select>
              </Field>

              {nuevaCap.accesoTipo === "paga" && (
                <>
                  <div className="grid sm:grid-cols-2 gap-x-4">
                    <Field label="Precio normal (ARS)" hint="Rige después de la promo, o siempre si no hay promo">
                      <Input type="number" min="0" required value={nuevaCap.precio} onChange={(e) => setNuevaCap({ ...nuevaCap, precio: e.target.value })} />
                    </Field>
                    <Field label="Precio normal (USD)" hint="Opcional — valor exacto, no una conversión">
                      <Input type="number" min="0" value={nuevaCap.precioUsd} onChange={(e) => setNuevaCap({ ...nuevaCap, precioUsd: e.target.value })} />
                    </Field>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-x-4">
                    <Field label="Precio promocional (ARS)" hint="Opcional — precio de lanzamiento">
                      <Input type="number" min="0" value={nuevaCap.precioPromocional} onChange={(e) => setNuevaCap({ ...nuevaCap, precioPromocional: e.target.value })} />
                    </Field>
                    <Field label="Precio promocional (USD)" hint="Opcional">
                      <Input type="number" min="0" value={nuevaCap.precioPromocionalUsd} onChange={(e) => setNuevaCap({ ...nuevaCap, precioPromocionalUsd: e.target.value })} />
                    </Field>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-x-4">
                    <Field label="Promo válida hasta" hint="Última fecha con precio promocional">
                      <Input type="date" value={nuevaCap.promocionHasta} onChange={(e) => setNuevaCap({ ...nuevaCap, promocionHasta: e.target.value })} />
                    </Field>
                    <Field label="Cupos en promo" hint="Cupos durante el período promocional">
                      <Input type="number" min="0" value={nuevaCap.cuposPromocional} onChange={(e) => setNuevaCap({ ...nuevaCap, cuposPromocional: e.target.value })} />
                    </Field>
                  </div>
                </>
              )}

              <Field label="Enlace de acceso" hint="Grabación, reunión o materiales — se manda por email a quien se inscribe. Se puede cargar después.">
                <Input value={nuevaCap.enlaceAcceso} onChange={(e) => setNuevaCap({ ...nuevaCap, enlaceAcceso: e.target.value })} placeholder="https://..." />
              </Field>

              {nuevaCap.accesoTipo === "plan" && (
                <div className="grid sm:grid-cols-2 gap-x-4">
                  <Field label="Plan mínimo de PYME" hint="Dejar vacío si no aplica a empresas">
                    <Select value={nuevaCap.planMinimoEmpresa} onChange={(e) => setNuevaCap({ ...nuevaCap, planMinimoEmpresa: e.target.value })}>
                      <option value="">No aplica a PYMEs</option>
                      <option value="avanzado">Avanzado o superior</option>
                      <option value="premium">Premium o superior</option>
                      <option value="platino">Solo Platino</option>
                    </Select>
                  </Field>
                  <Field label="Membresía mínima candidato" hint="Dejar vacío si no aplica a candidatos">
                    <Select value={nuevaCap.planMinimoCandidato} onChange={(e) => setNuevaCap({ ...nuevaCap, planMinimoCandidato: e.target.value })}>
                      <option value="">No aplica a candidatos</option>
                      <option value="premium">Desarrollo Profesional (premium)</option>
                    </Select>
                  </Field>
                </div>
              )}

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
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-forest-900">{c.titulo}</p>
                    {c.accesoTipo === "paga" && (
                      <Badge tone="terracotta">
                        {enPeriodoPromocional(c)
                          ? `${formatoPesos(precioEfectivo(c))} promo hasta ${c.promocionHasta}`
                          : formatoPesos(precioEfectivo(c))}
                      </Badge>
                    )}
                    {c.accesoTipo === "plan" && (
                      <Badge tone="gray">
                        {c.planMinimoEmpresa ? `Desde ${NOMBRE_PLAN_EMPRESA[c.planMinimoEmpresa]}` : c.planMinimoCandidato ? "Membresía premium" : "Por plan"}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-forest-500">{c.fecha} · {totalInscriptos}/{c.cupos} inscriptos</p>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {totalInscriptos > 0 && (
                      <button
                        type="button"
                        onClick={() => setCapExpandida(expandida ? null : c.id)}
                        className="text-gold-600 text-sm font-semibold"
                      >
                        {expandida ? "Ocultar inscriptos" : "Ver inscriptos"}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setErrorEnlace("");
                        setEnlaceEditando(enlaceEditando === c.id ? null : c.id);
                        setEnlaceValor(c.enlaceAcceso || "");
                      }}
                      className="text-forest-500 text-sm font-semibold"
                    >
                      {c.enlaceAcceso ? "Editar enlace de acceso" : "Cargar enlace de acceso"}
                    </button>
                  </div>
                  {enlaceEditando === c.id && (
                    <form
                      className="mt-3 flex gap-2 border-t border-forest-100 pt-3"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        setErrorEnlace("");
                        try {
                          await actualizarEnlaceCapacitacion(c.id, enlaceValor.trim());
                          setEnlaceEditando(null);
                        } catch (err) {
                          setErrorEnlace(mensajeError(err, "No pudimos guardar el enlace."));
                        }
                      }}
                    >
                      <Input
                        value={enlaceValor}
                        onChange={(e) => setEnlaceValor(e.target.value)}
                        placeholder="https://..."
                        className="flex-1"
                      />
                      <Button type="submit" className="!px-4">Guardar</Button>
                    </form>
                  )}
                  {enlaceEditando === c.id && errorEnlace && (
                    <p className="text-sm text-red-600 mt-1">{errorEnlace}</p>
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
          {errorEmpresa && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2">{errorEmpresa}</div>
          )}
          {empresas.length === 0 ? (
            <EmptyState text="Todavía no hay PYMEs registradas." />
          ) : (
            empresas.map((e) => {
              const editando = empresaEditando === e.id;
              return (
                <Card key={e.id} className="p-5">
                  {!editando ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-bold text-forest-900">{e.nombre}</h3>
                        <p className="text-sm text-forest-500">{e.rubro} · {e.ubicacion} · Desde {e.fechaRegistro}</p>
                        <p className="text-sm text-forest-400">
                          {e.contacto} · <a href={`mailto:${e.email}`} className="text-gold-600 font-semibold hover:underline">{e.email}</a>
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge tone="gold">
                          Plan {e.plan}{e.planVencimiento ? ` · vence ${e.planVencimiento.slice(0, 10)}` : ""}
                        </Badge>
                        <Button variant="outline" className="!px-3 !py-1.5" onClick={() => abrirEdicionEmpresa(e)}>
                          <Pencil size={14} /> Editar
                        </Button>
                        <Button variant="ghost" className="!px-3 !py-1.5 !text-red-600" onClick={() => borrarEmpresa(e)}>
                          <Trash2 size={14} /> Eliminar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid sm:grid-cols-2 gap-x-4">
                        <Field label="Nombre">
                          <Input value={formEmpresa.nombre} onChange={(ev) => setFormEmpresa({ ...formEmpresa, nombre: ev.target.value })} />
                        </Field>
                        <Field label="Rubro">
                          <Input value={formEmpresa.rubro} onChange={(ev) => setFormEmpresa({ ...formEmpresa, rubro: ev.target.value })} />
                        </Field>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-x-4">
                        <Field label="Ubicación">
                          <Input value={formEmpresa.ubicacion} onChange={(ev) => setFormEmpresa({ ...formEmpresa, ubicacion: ev.target.value })} />
                        </Field>
                        <Field label="Persona de contacto">
                          <Input value={formEmpresa.contacto} onChange={(ev) => setFormEmpresa({ ...formEmpresa, contacto: ev.target.value })} />
                        </Field>
                      </div>
                      <Field label="Email">
                        <Input type="email" value={formEmpresa.email} onChange={(ev) => setFormEmpresa({ ...formEmpresa, email: ev.target.value })} />
                      </Field>
                      <div className="grid sm:grid-cols-2 gap-x-4">
                        <Field label="Plan">
                          <Select value={formEmpresa.plan} onChange={(ev) => setFormEmpresa({ ...formEmpresa, plan: ev.target.value })}>
                            <option value="basico">Por Vacante (básico)</option>
                            <option value="avanzado">Avanzado</option>
                            <option value="premium">Premium</option>
                            <option value="platino">Platino</option>
                          </Select>
                        </Field>
                        <Field label="Plan vence" hint="Vacío = sin abono mensual activo">
                          <Input type="date" value={formEmpresa.planVencimiento} onChange={(ev) => setFormEmpresa({ ...formEmpresa, planVencimiento: ev.target.value })} />
                        </Field>
                      </div>
                      {errorEmpresa && <p className="text-sm text-red-600">{errorEmpresa}</p>}
                      <div className="flex gap-2">
                        <Button disabled={guardandoEmpresa} onClick={() => guardarEmpresa(e.id)}>
                          {guardandoEmpresa ? "Guardando..." : "Guardar cambios"}
                        </Button>
                        <Button variant="ghost" onClick={() => setEmpresaEditando(null)}>Cancelar</Button>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      )}

      {tab === "candidatos" && (
        <div className="space-y-3">
          {errorCandidato && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2">{errorCandidato}</div>
          )}
          {candidatos.length === 0 ? (
            <EmptyState text="Todavía no hay candidatos registrados." />
          ) : (
            candidatos.map((c) => {
              const editando = candidatoEditando === c.id;
              return (
                <Card key={c.id} className="p-5">
                  {!editando ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-bold text-forest-900">{c.nombre}</h3>
                        <p className="text-sm text-forest-500">{c.titulo} · {c.ubicacion} · Desde {c.fechaRegistro}</p>
                        <p className="text-sm text-forest-400">
                          <a href={`mailto:${c.email}`} className="text-gold-600 font-semibold hover:underline">{c.email}</a>
                          {c.telefono ? ` · ${c.telefono}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge tone={c.membresia === "premium" ? "terracotta" : "gray"}>
                          {c.membresia}{c.membresiaVencimiento ? ` · vence ${c.membresiaVencimiento.slice(0, 10)}` : ""}
                        </Badge>
                        <Button variant="outline" className="!px-3 !py-1.5" onClick={() => abrirEdicionCandidato(c)}>
                          <Pencil size={14} /> Editar
                        </Button>
                        <Button variant="ghost" className="!px-3 !py-1.5 !text-red-600" onClick={() => borrarCandidato(c)}>
                          <Trash2 size={14} /> Eliminar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid sm:grid-cols-2 gap-x-4">
                        <Field label="Nombre">
                          <Input value={formCandidato.nombre} onChange={(ev) => setFormCandidato({ ...formCandidato, nombre: ev.target.value })} />
                        </Field>
                        <Field label="Título / puesto">
                          <Input value={formCandidato.titulo} onChange={(ev) => setFormCandidato({ ...formCandidato, titulo: ev.target.value })} />
                        </Field>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-x-4">
                        <Field label="Email">
                          <Input type="email" value={formCandidato.email} onChange={(ev) => setFormCandidato({ ...formCandidato, email: ev.target.value })} />
                        </Field>
                        <Field label="Teléfono">
                          <Input value={formCandidato.telefono} onChange={(ev) => setFormCandidato({ ...formCandidato, telefono: ev.target.value })} />
                        </Field>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-x-4">
                        <Field label="Ubicación">
                          <Input value={formCandidato.ubicacion} onChange={(ev) => setFormCandidato({ ...formCandidato, ubicacion: ev.target.value })} />
                        </Field>
                        <Field label="Nivel">
                          <Select value={formCandidato.nivel} onChange={(ev) => setFormCandidato({ ...formCandidato, nivel: ev.target.value })}>
                            <option>Junior</option>
                            <option>Semi Senior</option>
                            <option>Senior</option>
                          </Select>
                        </Field>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-x-4">
                        <Field label="Membresía">
                          <Select value={formCandidato.membresia} onChange={(ev) => setFormCandidato({ ...formCandidato, membresia: ev.target.value })}>
                            <option value="free">Gratis</option>
                            <option value="premium">Desarrollo Profesional (premium)</option>
                          </Select>
                        </Field>
                        <Field label="Membresía vence" hint="Vacío = sin membresía paga activa">
                          <Input type="date" value={formCandidato.membresiaVencimiento} onChange={(ev) => setFormCandidato({ ...formCandidato, membresiaVencimiento: ev.target.value })} />
                        </Field>
                      </div>
                      {errorCandidato && <p className="text-sm text-red-600">{errorCandidato}</p>}
                      <div className="flex gap-2">
                        <Button disabled={guardandoCandidato} onClick={() => guardarCandidato(c.id)}>
                          {guardandoCandidato ? "Guardando..." : "Guardar cambios"}
                        </Button>
                        <Button variant="ghost" onClick={() => setCandidatoEditando(null)}>Cancelar</Button>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      )}

      {tab === "consultorias" && (
        <div className="space-y-3">
          {errorConsultoria && (
            <div className="mb-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2">{errorConsultoria}</div>
          )}
          {consultorias.length === 0 ? (
            <EmptyState text="Todavía no hay consultorías reservadas (beneficio exclusivo del plan Platino)." />
          ) : (
            consultorias.map((cons) => {
              const empresa = empresas.find((e) => e.id === cons.empresaId);
              const fecha = cons.fechaHora ? new Date(cons.fechaHora).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" }) : "—";
              return (
                <Card key={cons.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-forest-900">{empresa?.nombre || "Empresa desconocida"}</h3>
                    <p className="text-sm text-forest-500">Reservada para el {fecha}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge tone={estadoConsultoriaBadge[cons.estado] || "gray"}>{cons.estado}</Badge>
                    <Select
                      value={cons.estado}
                      className="sm:w-44"
                      onChange={async (e) => {
                        setErrorConsultoria("");
                        try {
                          await cambiarEstadoConsultoria(cons.id, e.target.value);
                        } catch (err) {
                          setErrorConsultoria(mensajeError(err, "No pudimos actualizar el estado."));
                        }
                      }}
                    >
                      <option value="solicitada">Solicitada</option>
                      <option value="confirmada">Confirmada</option>
                      <option value="realizada">Realizada</option>
                      <option value="cancelada">Cancelada</option>
                    </Select>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
