import { useNavigate } from "react-router-dom";
import { Calendar, CheckCircle2, Lock, LogOut, Users2 } from "lucide-react";
import { useApp } from "../../data/store.jsx";
import { Card, Badge, Button, SectionTitle, EmptyState } from "../../components/ui.jsx";
import { accesoCapacitacion, NOMBRE_PLAN_EMPRESA, cuposEfectivos } from "../../utils/capacitaciones.js";

// Panel liviano para integrantes de equipo: solo capacitaciones incluidas en
// el plan de su empresa madre. A propósito NO tiene acceso a reclutamiento
// (vacantes/candidatos/postulaciones) — estructuralmente no puede, porque un
// integrante no tiene fila propia en `empresas` y esas tablas filtran por
// dueño de empresa vía RLS.
export default function IntegrantePanel() {
  const { session, empresas, integrantes, capacitaciones, inscribirCapacitacion, logout } = useApp();
  const navigate = useNavigate();

  const integrante = integrantes.find((i) => i.id === session.userId);
  const empresaMadre = empresas.find((e) => e.id === session.empresaId);

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  if (!empresaMadre) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-start justify-between gap-3 mb-8">
        <div>
          <Badge tone="gold">Integrante de equipo</Badge>
          <h1 className="text-2xl font-extrabold text-forest-900 mt-2">
            Hola, {integrante?.nombre?.split(" ")[0] || ""}
          </h1>
          <p className="text-forest-500 text-sm mt-1">
            Accedés a las capacitaciones incluidas en el plan de <strong>{empresaMadre.nombre}</strong> ({NOMBRE_PLAN_EMPRESA[empresaMadre.plan] || empresaMadre.plan}).
          </p>
        </div>
        <Button variant="ghost" onClick={handleLogout} className="!px-3 shrink-0">
          <LogOut size={16} /> Salir
        </Button>
      </div>

      <SectionTitle eyebrow="Tu equipo" title="Capacitaciones de tu empresa" />

      {capacitaciones.length === 0 ? (
        <EmptyState text="Todavía no hay capacitaciones disponibles." />
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {capacitaciones.map((c) => {
            const totalInscriptos = c.inscriptosCandidatos.length + c.inscriptosEmpresas.length + c.inscriptosIntegrantes.length;
            const cuposLibres = cuposEfectivos(c) - totalInscriptos;
            const acceso = accesoCapacitacion(c, { role: "integrante", empresa: empresaMadre, integrante });
            return (
              <Card key={c.id} className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-forest-900">{c.titulo}</h4>
                  {c.accesoTipo === "plan" && c.planMinimoEmpresa && (
                    <Badge tone="gray">Desde {NOMBRE_PLAN_EMPRESA[c.planMinimoEmpresa]}</Badge>
                  )}
                </div>
                <p className="text-sm text-forest-500 mt-1">{c.categoria}</p>
                <p className="text-sm text-forest-400 mt-3 leading-relaxed">{c.descripcion}</p>
                <div className="flex flex-wrap gap-4 text-sm text-forest-500 mt-3">
                  <span className="inline-flex items-center gap-1"><Calendar size={14} />{c.fecha}</span>
                  <span className="inline-flex items-center gap-1"><Users2 size={14} />{cuposLibres} cupos disponibles</span>
                </div>
                <div className="mt-4">
                  {acceso.estado === "inscripto" ? (
                    <span className="inline-flex items-center gap-1.5 text-gold-600 text-sm font-semibold">
                      <CheckCircle2 size={18} /> Ya estás inscripto/a
                    </span>
                  ) : cuposLibres <= 0 ? (
                    <Button disabled className="w-full sm:w-auto">Sin cupos</Button>
                  ) : acceso.estado === "requiere_plan" ? (
                    <span className="inline-flex items-center gap-1.5 font-semibold text-forest-500 text-sm">
                      <Lock size={16} />
                      {acceso.planRequerido
                        ? `Disponible desde el plan ${NOMBRE_PLAN_EMPRESA[acceso.planRequerido]}`
                        : "No incluida en el plan de tu empresa"}
                    </span>
                  ) : (
                    <Button
                      className="w-full sm:w-auto"
                      onClick={() => inscribirCapacitacion(c.id, integrante.id, "integrante")}
                    >
                      Inscribirme
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
