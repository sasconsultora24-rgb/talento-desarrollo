import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Briefcase, Users2, Award, PlusCircle, FileText, Search, Mail, Lock, UserRound, CheckCircle2 } from "lucide-react";
import { useApp } from "../../data/store.jsx";
import { Card, Badge, Button, Field, Input, Textarea, Select, EmptyState, StatCard } from "../../components/ui.jsx";
import { planesEmpresas } from "../../data/seed.js";
import { candidatoPremiumActivo } from "../../utils/planes.js";

const DIAS_PRUEBA = 14;

function estadoPlan(vencimientoISO) {
  if (!vencimientoISO) return { texto: "Sin pagos registrados todavía", vencido: true };
  const vence = new Date(vencimientoISO);
  const hoy = new Date();
  const fecha = vence.toLocaleDateString("es-AR");
  if (vence < hoy) return { texto: `Venció el ${fecha}`, vencido: true };
  return { texto: `Vigente hasta el ${fecha}`, vencido: false };
}

// Determina si la empresa tiene acceso activo a los servicios de la plataforma:
// plan pagado vigente, o (si nunca pagó) todavía dentro del período de prueba
// gratis de 14 días desde el registro. Coincide con la lógica de RLS del lado
// del servidor (función `empresa_tiene_acceso` en Supabase) — esto es solo la
// versión de UI para mostrar el mensaje correcto; el bloqueo real ya está en la base.
function estadoAcceso(empresa) {
  const ahora = new Date();
  if (empresa.planVencimiento) {
    const vence = new Date(empresa.planVencimiento);
    if (vence >= ahora) return { activo: true, texto: `Plan vigente hasta el ${vence.toLocaleDateString("es-AR")}.` };
    return {
      activo: false,
      texto: `Tu plan venció el ${vence.toLocaleDateString("es-AR")}. Elegí un plan para volver a acceder.`,
    };
  }
  if (empresa.fechaRegistro) {
    const finPrueba = new Date(empresa.fechaRegistro);
    finPrueba.setDate(finPrueba.getDate() + DIAS_PRUEBA);
    if (finPrueba >= ahora) {
      const diasRestantes = Math.max(1, Math.ceil((finPrueba - ahora) / (1000 * 60 * 60 * 24)));
      return {
        activo: true,
        texto: `Estás en período de prueba: ${diasRestantes} día${diasRestantes === 1 ? "" : "s"} restante${diasRestantes === 1 ? "" : "s"}.`,
      };
    }
    return {
      activo: false,
      texto: "Tu período de prueba de 14 días terminó. Elegí un plan para seguir usando la plataforma.",
    };
  }
  return { activo: false, texto: "No pudimos verificar tu plan." };
}

const TABS = [
  { id: "vacantes", label: "Mis vacantes", icon: Briefcase },
  { id: "candidatos", label: "Candidatos postulados", icon: Users2 },
  { id: "buscar", label: "Buscar candidatos", icon: Search },
  { id: "mentorias", label: "Mentorías", icon: UserRound },
  { id: "plan", label: "Mi plan", icon: Award },
];

const estadoBadge = {
  pendiente: "terracotta",
  aprobada: "gold",
  rechazada: "gray",
  cerrada: "gray",
};

const postulacionBadge = {
  nueva: "gray",
  "en revisión": "terracotta",
  entrevista: "gold",
  contratado: "gold",
  descartado: "gray",
};

export default function EmpresaPanel() {
  const { session, empresas, vacantes, candidatos, postulaciones, mentorias, publicarVacante, cambiarEstadoPostulacion, iniciarPago, reservarMentoria } = useApp();
  const [searchParams] = useSearchParams();
  const tabInicial = TABS.some((t) => t.id === searchParams.get("tab")) ? searchParams.get("tab") : "vacantes";
  const [tab, setTab] = useState(tabInicial);
  const [formOpen, setFormOpen] = useState(false);
  const [pagando, setPagando] = useState(null);
  const [errorPago, setErrorPago] = useState("");
  const [reservandoMentoria, setReservandoMentoria] = useState(null);
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
    return candidatos
      .filter((c) => {
        if (filtroNivel && c.nivel !== filtroNivel) return false;
        if (filtroDisponibilidad && c.disponibilidad !== filtroDisponibilidad) return false;
        if (!texto) return true;
        const enTexto = [c.nombre, c.titulo, c.ubicacion, c.resumen, ...(c.habilidades || [])]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return enTexto.includes(texto);
      })
      // Beneficio real del plan premium de candidato: aparece primero en el buscador.
      .sort((a, b) => Number(candidatoPremiumActivo(b)) - Number(candidatoPremiumActivo(a)));
  }, [candidatos, busqueda, filtroNivel, filtroDisponibilidad]);

  if (!empresa) return null;

  const acceso = estadoAcceso(empresa);
  const misVacantes = vacantes.filter((v) => v.empresaId === empresa.id);
  const idsMisVacantes = misVacantes.map((v) => v.id);
  // Beneficio real del plan premium de candidato: sus postulaciones aparecen primero.
  const postulacionesRecibidas = postulaciones
    .filter((p) => idsMisVacantes.includes(p.vacanteId))
    .sort((a, b) => {
      const premA = candidatoPremiumActivo(candidatos.find((c) => c.id === a.candidatoId));
      const premB = candidatoPremiumActivo(candidatos.find((c) => c.id === b.candidatoId));
      return Number(premB) - Number(premA);
    });

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

  const mentoriasVisibles = mentorias.filter((m) => m.publico === "empresa" || m.publico === "ambos");

  async function handleReservarMentoria(mentoriaId) {
    setReservandoMentoria(mentoriaId);
    try {
      await reservarMentoria(mentoriaId, empresa.id, "empresa");
    } catch (err) {
      console.error(err);
    } finally {
      setReservandoMentoria(null);
    }
  }

  async function pagarPlan(planId) {
    setErrorPago("");
    setPagando(planId);
    try {
      const initPoint = await iniciarPago("plan_empresa", planId);
      window.location.href = initPoint;
    } catch (err) {
      setErrorPago(err.message || "No se pudo iniciar el pago.");
      setPagando(null);
    }
  }

  function Paywall() {
    return (
      <Card className="p-8 text-center">
        <Lock className="mx-auto text-forest-300" size={32} />
        <h3 className="font-bold text-forest-900 mt-3">Esta sección requiere un plan activo</h3>
        <p className="text-sm text-forest-500 mt-1 max-w-md mx-auto">{acceso.texto}</p>
        <Button className="mt-4" onClick={() => setTab("plan")}>Ver planes</Button>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <Badge tone="gold">Panel de empresa</Badge>
        <h1 className="text-2xl md:text-3xl font-extrabold text-forest-900 mt-2">{empresa.nombre}</h1>
      </div>

      {acceso.activo && acceso.texto.startsWith("Estás en período de prueba") && (
        <div className="mb-6 text-sm text-terracotta-700 bg-terracotta-50 border border-terracotta-100 rounded-lg px-4 py-2">
          {acceso.texto}
        </div>
      )}
      {!acceso.activo && (
        <div className="mb-6 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2">
          {acceso.texto}
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Vacantes publicadas" value={misVacantes.length} tone="forest" />
        <StatCard label="Postulaciones recibidas" value={postulacionesRecibidas.length} tone="gold" />
        <StatCard label="Plan actual" value={planesEmpresas.find((p) => p.id === empresa.plan)?.nombre || empresa.plan} tone="terracotta" />
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

      {tab === "vacantes" && !acceso.activo && <Paywall />}
      {tab === "vacantes" && acceso.activo && (
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
                <p className="text-xs text-forest-400 mb-4">La vacante quedará en estado "pendiente" hasta que nuestro equipo la revise y apruebe.</p>
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
                    <h3 className="font-bold text-forest-900">{v.titulo}</h3>
                    <p className="text-sm text-forest-500">{v.area} · {v.ubicacion} · Publicada el {v.fechaPublicacion}</p>
                  </div>
                  <Badge tone={estadoBadge[v.estado]}>{v.estado}</Badge>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "candidatos" && !acceso.activo && <Paywall />}
      {tab === "candidatos" && acceso.activo && (
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
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-forest-900">{cand?.nombre}</h3>
                        {candidatoPremiumActivo(cand) && <Badge tone="terracotta">Perfil premium</Badge>}
                      </div>
                      <p className="text-sm text-forest-500">{cand?.titulo} · {cand?.ubicacion}</p>
                      <p className="text-sm text-forest-400 mt-1">Postulado a: <strong>{vac?.titulo}</strong></p>
                      {cand?.habilidades?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {cand.habilidades.map((h) => (
                            <span key={h} className="text-xs bg-forest-50 text-forest-600 px-2 py-0.5 rounded-full">{h}</span>
                          ))}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-3 mt-2">
                        {cand?.cvUrl && (
                          <a href={cand.cvUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-gold-600 font-semibold">
                            <FileText size={15} /> Ver CV
                          </a>
                        )}
                      </div>
                      {cand?.referencias?.length > 0 && (
                        <p className="text-xs text-forest-400 mt-2">
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

      {tab === "buscar" && !acceso.activo && <Paywall />}
      {tab === "buscar" && acceso.activo && (
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

          <p className="text-sm text-forest-400 mb-3">
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
                      <h3 className="font-bold text-forest-900">{c.nombre}</h3>
                      <p className="text-sm text-forest-500">
                        {c.titulo} · {c.ubicacion} · {c.nivel} · {c.disponibilidad}
                      </p>
                      {c.resumen && <p className="text-sm text-forest-500 mt-2 max-w-xl">{c.resumen}</p>}
                      {c.habilidades?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {c.habilidades.map((h) => (
                            <span key={h} className="text-xs bg-forest-50 text-forest-600 px-2 py-0.5 rounded-full">{h}</span>
                          ))}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-4 mt-2">
                        {c.cvUrl && (
                          <a href={c.cvUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-gold-600 font-semibold">
                            <FileText size={15} /> Ver CV
                          </a>
                        )}
                        {c.email && (
                          <a href={`mailto:${c.email}`} className="inline-flex items-center gap-1.5 text-sm text-gold-600 font-semibold">
                            <Mail size={15} /> Contactar
                          </a>
                        )}
                      </div>
                    </div>
                    {candidatoPremiumActivo(c) && <Badge tone="terracotta">Perfil premium</Badge>}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "mentorias" && !acceso.activo && <Paywall />}
      {tab === "mentorias" && acceso.activo && (
        <div>
          <p className="text-sm text-forest-400 mb-4">
            Sesiones de mentoría para tu equipo o para vos como dueño/responsable de la PYME.
          </p>
          {mentoriasVisibles.length === 0 ? (
            <EmptyState text="Todavía no hay mentorías disponibles para empresas." />
          ) : (
            <div className="grid md:grid-cols-2 gap-5">
              {mentoriasVisibles.map((m) => {
                const totalReservas = m.reservasCandidatos.length + m.reservasEmpresas.length;
                const cuposLibres = m.cuposDisponibles - totalReservas;
                const reservado = m.reservasEmpresas.includes(empresa.id);
                return (
                  <Card key={m.id} className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-gold-50 flex items-center justify-center text-gold-600">
                        <UserRound size={22} />
                      </div>
                      <div>
                        <h3 className="font-bold text-forest-900">{m.mentor}</h3>
                        <p className="text-sm text-forest-500">{m.especialidad}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-4 text-sm text-forest-500">
                      <Badge tone="gray">{m.modalidad}</Badge>
                      <span>{cuposLibres} cupos disponibles</span>
                    </div>
                    <div className="mt-5">
                      {reservado ? (
                        <span className="inline-flex items-center gap-1.5 text-gold-600 text-sm font-semibold">
                          <CheckCircle2 size={18} /> Sesión reservada
                        </span>
                      ) : cuposLibres <= 0 ? (
                        <Button disabled className="w-full sm:w-auto">Sin cupos</Button>
                      ) : (
                        <Button
                          disabled={reservandoMentoria === m.id}
                          onClick={() => handleReservarMentoria(m.id)}
                          className="w-full sm:w-auto"
                        >
                          {reservandoMentoria === m.id ? "Reservando..." : "Reservar sesión"}
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "plan" && (
        <div>
          {errorPago && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2">{errorPago}</div>
          )}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {planesEmpresas.map((p) => {
              const esActual = empresa.plan === p.id;
              const estado = esActual && empresa.planVencimiento ? estadoPlan(empresa.planVencimiento) : null;
              return (
                <Card key={p.id} className={`p-5 flex flex-col ${esActual ? "border-2 border-gold-500" : ""}`}>
                  <h3 className="font-bold text-forest-900">{p.nombre}</h3>
                  <div className="text-xl font-extrabold text-forest-800 mt-1">{p.precio}</div>
                  <ul className="mt-3 space-y-1.5 text-sm text-forest-500 flex-1">
                    {p.incluye.map((i) => <li key={i}>• {i}</li>)}
                  </ul>
                  {esActual && (
                    <div className="mt-3">
                      <Badge tone="gold">Plan actual</Badge>
                      <p className={`text-xs mt-1.5 ${estado ? (estado.vencido ? "text-red-600" : "text-forest-400") : acceso.activo ? "text-terracotta-600" : "text-red-600"}`}>
                        {estado ? estado.texto : acceso.texto}
                      </p>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    disabled={pagando === p.id}
                    onClick={() => pagarPlan(p.id)}
                  >
                    {pagando === p.id ? "Redirigiendo a Mercado Pago..." : esActual ? "Renovar" : "Elegir y pagar este plan"}
                  </Button>
                </Card>
              );
            })}
          </div>
          <p className="text-xs text-forest-400 mt-6">
            El pago se procesa con Mercado Pago. Cada pago aprobado extiende la vigencia del plan 30 días desde hoy (o desde el vencimiento actual, si todavía está vigente).
          </p>
        </div>
      )}
    </div>
  );
}
