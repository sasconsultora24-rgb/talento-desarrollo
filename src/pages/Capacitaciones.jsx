import { useMemo, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Calendar, Users2, CheckCircle2, Clock, Lock } from "lucide-react";
import { useApp } from "../data/store.jsx";
import { Card, Badge, Button, SectionTitle, EmptyState, Input, Select } from "../components/ui.jsx";
import MentoriasPaquetes from "../components/MentoriasPaquetes.jsx";
import { accesoCapacitacion, NOMBRE_PLAN_EMPRESA } from "../utils/capacitaciones.js";
import { formatoPesos } from "../data/mentoriaPaquetes.js";
import { useScrollToAnchor } from "../utils/useScrollToAnchor.js";

export default function Capacitaciones() {
  const { capacitaciones, inscribirCapacitacion, session, empresas, candidatos, pagos, iniciarPago } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  useScrollToAnchor(searchParams);
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("todas");
  const empresa = session.role === "empresa" ? empresas.find((e) => e.id === session.userId) : null;
  const candidato = session.role === "candidato" ? candidatos.find((c) => c.id === session.userId) : null;
  const [comprando, setComprando] = useState(null);

  const categorias = useMemo(() => ["todas", ...new Set(capacitaciones.map((c) => c.categoria).filter(Boolean))], [capacitaciones]);

  const filtradas = capacitaciones.filter((c) => {
    const matchTexto = (c.titulo + " " + (c.descripcion || "")).toLowerCase().includes(busqueda.toLowerCase());
    const matchCategoria = categoria === "todas" || c.categoria === categoria;
    return matchTexto && matchCategoria;
  });

  const [error, setError] = useState("");

  async function handleInscribir(id) {
    if (session.role !== "candidato" && session.role !== "empresa") {
      navigate("/registro");
      return;
    }
    setError("");
    try {
      await inscribirCapacitacion(id, session.userId, session.role);
    } catch (err) {
      console.error(err);
      setError("No pudimos completar la inscripción. Probá de nuevo en unos segundos.");
    }
  }

  async function handleComprarAcceso(id) {
    if (session.role !== "candidato" && session.role !== "empresa") {
      navigate("/registro");
      return;
    }
    setError("");
    setComprando(id);
    try {
      const { initPoint } = await iniciarPago("capacitacion", id);
      window.location.href = initPoint;
    } catch (err) {
      setError(err.message || "No se pudo iniciar el pago.");
      setComprando(null);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div id="capacitacion-continua" className="scroll-mt-24">
        <SectionTitle
          eyebrow="Capacitación continua"
          title="Capacitaciones y talleres"
          subtitle="Programas de liderazgo, comunicación, trabajo en equipo y formación técnica para PYMEs y profesionales."
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <Input
          placeholder="Buscar por título o descripción..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <div className="sm:w-56">
          <Select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            {categorias.map((c) => (
              <option key={c} value={c}>{c === "todas" ? "Todas las categorías" : c}</option>
            ))}
          </Select>
        </div>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2">{error}</div>
      )}

      {filtradas.length === 0 ? (
        <EmptyState text="No encontramos capacitaciones con esos filtros." />
      ) : (
      <div className="grid md:grid-cols-2 gap-5">
        {filtradas.map((c) => {
          const totalInscriptos = c.inscriptosCandidatos.length + c.inscriptosEmpresas.length;
          const cuposLibres = c.cupos - totalInscriptos;
          const acceso = accesoCapacitacion(c, { role: session.role, empresa, candidato, pagos });
          return (
            <Card key={c.id} className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  {c.destacada && <Badge tone="terracotta">Destacada</Badge>}
                  <h3 className="text-lg font-bold text-forest-900 mt-2">{c.titulo}</h3>
                  <Badge tone="gold">{c.categoria}</Badge>
                  {c.accesoTipo === "paga" && acceso.estado !== "inscripto" && (
                    <Badge tone="terracotta">{formatoPesos(c.precio)}</Badge>
                  )}
                  {acceso.estado === "incluida_en_plan" && <Badge tone="gold">Incluida en tu plan</Badge>}
                  {acceso.estado === "requiere_plan" && (
                    <Badge tone="gray">
                      {acceso.planRequerido
                        ? `Incluida desde ${session.role === "candidato" ? "membresía Premium" : `plan ${NOMBRE_PLAN_EMPRESA[acceso.planRequerido]}`}`
                        : "Incluida según tu plan"}
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-sm text-forest-500 mt-3 leading-relaxed">{c.descripcion}</p>
              <div className="flex flex-wrap gap-4 text-sm text-forest-500 mt-4">
                <span className="inline-flex items-center gap-1"><Calendar size={14} />{c.fecha}</span>
                <span className="inline-flex items-center gap-1"><Users2 size={14} />{cuposLibres} cupos disponibles</span>
                <span>{c.modalidad}</span>
              </div>
              <div className="mt-5">
                {acceso.estado === "inscripto" ? (
                  <span className="inline-flex items-center gap-1.5 text-gold-600 text-sm font-semibold">
                    <CheckCircle2 size={18} /> Ya estás inscripto/a
                  </span>
                ) : cuposLibres <= 0 ? (
                  <Button disabled className="w-full sm:w-auto">Sin cupos</Button>
                ) : acceso.estado === "pago_pendiente" ? (
                  <span className="inline-flex items-center gap-1.5 text-terracotta-500 text-sm font-semibold">
                    <Clock size={18} /> Pago pendiente de confirmación
                  </span>
                ) : acceso.estado === "requiere_pago" ? (
                  <Button
                    onClick={() => handleComprarAcceso(c.id)}
                    disabled={comprando === c.id}
                    className="w-full sm:w-auto"
                  >
                    {comprando === c.id ? "Redirigiendo a Mercado Pago..." : `Comprar acceso — ${formatoPesos(acceso.precio)}`}
                  </Button>
                ) : acceso.estado === "requiere_plan" ? (
                  <div className="text-sm text-forest-500">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-forest-600">
                      <Lock size={16} />
                      {acceso.planRequerido
                        ? `Incluida desde ${session.role === "empresa" ? `plan ${NOMBRE_PLAN_EMPRESA[acceso.planRequerido]}` : "la membresía Premium"}`
                        : "No disponible para tu perfil"}
                    </span>
                    <Link
                      to={session.role === "empresa" ? "/empresa?tab=plan" : session.role === "candidato" ? "/candidato?tab=plan" : "/registro"}
                      className="block text-gold-600 font-semibold mt-1"
                    >
                      Ver planes
                    </Link>
                  </div>
                ) : (
                  <Button onClick={() => handleInscribir(c.id)} className="w-full sm:w-auto">
                    {acceso.estado === "incluida_en_plan" ? "Inscribirme (incluida en tu plan)" : "Inscribirme"}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
      )}

      <div className="mt-16 pt-16 border-t border-forest-100 scroll-mt-24" id="mentorias">
        <MentoriasPaquetes titulo="Mentorías y Coaching" />
      </div>
    </div>
  );
}
