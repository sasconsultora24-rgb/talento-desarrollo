import { Link, useSearchParams } from "react-router-dom";
import { Briefcase, Users, GraduationCap, HeartHandshake, Check, ArrowRight } from "lucide-react";
import { Card, Button, SectionTitle, Badge } from "../components/ui.jsx";
import { planesEmpresas } from "../data/seed.js";
import { useApp } from "../data/store.jsx";
import { useScrollToAnchor } from "../utils/useScrollToAnchor.js";
import ProcesoSeleccionModular from "../components/ProcesoSeleccionModular.jsx";

const areas = [
  {
    id: "reclutamiento",
    icon: Briefcase,
    title: "Reclutamiento y Selección",
    pitch: "El punto de partida: encontrar a la persona correcta, sin que te tome semanas de tu propio tiempo.",
    items: [
      "Publicación de ofertas laborales en la plataforma",
      "Base de datos con candidatos preseleccionados",
      "Procesos de selección a medida (búsqueda activa, entrevistas, evaluaciones)",
      "Inducción breve para nuevas contrataciones",
    ],
    incluido: [
      "Plan Por Vacante: pago único de $80.000 por búsqueda, activa 45 días, sin suscripción mensual",
      "Hasta 5 vacantes activas en el plan Avanzado",
      "Vacantes ilimitadas en Premium y Platino",
      "Ordenamiento automático de postulantes por afinidad con tu vacante, en todos los planes",
      "Premium: Fase 1 (definición del perfil) y Fase 2 (búsqueda y preselección) incluidas",
      "Platino: suma la Fase 3 (evaluación y presentación del finalista)",
    ],
    aparte: [
      "Selección a medida completa o por fases, para los puestos clave — ver la sección Selección a medida más abajo",
      "Búsquedas ejecutivas o de alta especialización, cotizadas según el perfil buscado",
      "Procesos con evaluaciones psicotécnicas, cotizados según el alcance",
      "Fase 4 (acompañamiento post-incorporación): siempre se contrata aparte, en todos los planes",
    ],
  },
  {
    id: "retencion-talento",
    icon: Users,
    title: "Desarrollo y Retención de Talento",
    pitch: "Conseguir a la persona es la mitad del trabajo. La otra mitad es que se quede y crezca con vos.",
    items: [
      "Diagnóstico organizacional sobre rotación de personal",
      "Planes de fidelización y estrategias de retención",
      "Evaluación de clima laboral y satisfacción de empleados",
      "Coaching y mentoring para líderes y equipos",
    ],
    incluido: [
      "Diagnóstico de clima laboral en Premium y Platino (Platino con mayor frecuencia y alcance)",
      "1 Espacio de Orden (mentoría) incluido por mes en Premium, para quien la empresa asigne",
      "1 Espacio de Orden Y 1 Mentoría Refoco incluidos por mes en Platino",
    ],
    aparte: [
      "Mentorías individuales (Espacio de Orden o Refoco) compradas sueltas, al precio de socio publicado en cada paquete",
      "Diagnóstico de clima laboral a medida, para PYMEs en plan Por Vacante o Avanzado",
    ],
  },
  {
    id: "capacitacion-desarrollo",
    icon: GraduationCap,
    title: "Capacitación y Desarrollo",
    pitch: "Equipos que se forman rinden más y se van menos. Por eso está adentro del servicio, no como un extra.",
    items: [
      "Programas de formación en liderazgo, comunicación y trabajo en equipo",
      "Capacitaciones técnicas según necesidades específicas",
      "Talleres de team building",
    ],
    incluido: [
      "Desde Avanzado, cada integrante de tu equipo tiene acceso propio a las capacitaciones (gratuitas siempre, más un cupo mensual de pagas: 1 en Avanzado, 2 en Premium, sin límite en Platino)",
      "Certificado de participación en cada capacitación",
    ],
    aparte: [
      "Capacitaciones pagas sueltas, disponibles para cualquier plan sin necesitar cupo de integrante, al precio publicado en cada una",
      "Programas de formación a medida para tu equipo, fuera del calendario estándar, cotizados según temática y alcance",
    ],
  },
  {
    id: "capital-humano",
    icon: HeartHandshake,
    title: "Gestión del Capital Humano",
    destacada: true,
    pitch:
      "Es el corazón de lo que hace SAS Consultora: acompañar a quienes sostienen responsabilidades — dueños, mandos medios, líderes de equipo — para ordenar lo humano de su rol y de su gente. No es diseño organizacional ni recetas de RRHH: es leer lo que está pasando, habilitar las conversaciones que se evitan y aliviar el desgaste que nadie nombra.",
    items: [
      "RE-MEDIO: acompañamiento a mandos medios para ganar autonomía, comunicar mejor hacia arriba y hacia abajo, y aliviar la carga de estar \"en el medio\" de todo",
      "Jornadas y talleres vivenciales con equipos completos, para ordenar la comunicación y bajar la tensión relacional",
      "Intervenciones puntuales ante conflictos concretos o un clima que se deterioró",
      "Acompañamiento sostenido a dueños y líderes con equipo a cargo, individual o grupal — conversaciones reales, no manuales",
    ],
    resultados: [
      "La persona deja de sentirse sola en el rol",
      "Aparecen las conversaciones que estaban trabadas",
      "Baja la tensión del equipo y el trabajo pesa menos",
      "El liderazgo se vuelve más habitable, con decisiones más claras",
    ],
    incluido: [
      "Hasta 20% de descuento en estos acompañamientos cuando se contratan a medida, en el plan Platino (el % exacto depende del alcance del proceso) — igual que el resto de servicios de consultoría a la carta",
    ],
    aparte: [
      "RE-MEDIO, jornadas con equipos completos e intervenciones ante conflictos, contratados a medida por fuera del abono",
      "Se cotiza según cantidad de personas y alcance del proceso — el mismo servicio de consultoría tradicional que SAS presta hoy, llevado a la plataforma",
    ],
  },
];

export default function ParaPymes() {
  const { session } = useApp();
  const esEmpresaLogueada = session.role === "empresa";
  const [searchParams] = useSearchParams();
  useScrollToAnchor(searchParams);

  return (
    <div>
      <section className="bg-gradient-to-br from-forest-900 to-forest-700 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <Badge tone="gold">Servicio para PYMEs</Badge>
          <h1 className="text-3xl md:text-4xl font-extrabold font-display mt-4 max-w-2xl">
            Todo el respaldo de un área de RRHH, sin montar una estructura interna.
          </h1>
          <p className="mt-4 text-forest-200 max-w-2xl leading-relaxed">
            Reclutamos, retenemos y desarrollamos el talento de tu equipo con un servicio
            integral pensado para pequeñas y medianas empresas — no solo conseguirte personal,
            sino acompañar el crecimiento de tu PYME en el tiempo.
          </p>
          <Link to={esEmpresaLogueada ? "/empresa?tab=plan" : "/registro?tipo=empresa"}>
            <Button variant="terracotta" className="mt-6 px-6 py-3">
              {esEmpresaLogueada ? "Ir a mi panel" : "Registrar mi PYME"}
            </Button>
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-8">
        <SectionTitle
          eyebrow="Nuestro servicio"
          title="4 áreas, un solo lugar"
          subtitle="Cada una ataca una etapa distinta del ciclo de vida de tu equipo. Bajá para ver el detalle de cada una: qué incluye, qué está en tu abono y qué es un servicio adicional."
        />
      </section>

      {areas.map((a, i) => (
        <section
          key={a.id}
          id={a.id}
          className={`scroll-mt-24 border-t ${a.destacada ? "border-gold-200 bg-forest-900 text-white" : `border-forest-100 ${i % 2 === 1 ? "bg-white" : "bg-forest-50/40"}`}`}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 grid md:grid-cols-5 gap-10 items-start">
            <div className="md:col-span-2">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${a.destacada ? "bg-gold-500/20 text-gold-300" : "bg-gold-50 text-gold-600"}`}>
                <a.icon size={24} />
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider ${a.destacada ? "text-gold-300" : "text-gold-600"}`}>
                {a.destacada ? "El corazón de SAS Consultora" : `Área ${i + 1} de ${areas.length}`}
              </span>
              <h3 className={`text-2xl font-extrabold mt-1 mb-3 ${a.destacada ? "text-white" : "text-forest-900"}`}>{a.title}</h3>
              <p className={`text-sm leading-relaxed mb-4 ${a.destacada ? "text-forest-200" : "text-forest-500"}`}>{a.pitch}</p>
              <ul className="space-y-2">
                {a.items.map((it) => (
                  <li key={it} className={`flex items-start gap-2 text-sm ${a.destacada ? "text-forest-100" : "text-forest-600"}`}>
                    <Check size={16} className={`mt-0.5 shrink-0 ${a.destacada ? "text-gold-400" : "text-gold-500"}`} />
                    {it}
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-3 grid sm:grid-cols-2 gap-5">
              <div className={`rounded-2xl border p-5 ${a.destacada ? "border-gold-500/30 bg-white/5" : "border-gold-200 bg-gold-50/60"}`}>
                <Badge tone="gold">Incluido en el abono</Badge>
                <ul className="mt-3 space-y-2.5">
                  {a.incluido.map((linea) => (
                    <li key={linea} className={`text-sm leading-relaxed flex items-start gap-2 ${a.destacada ? "text-forest-100" : "text-forest-700"}`}>
                      <Check size={15} className={`mt-0.5 shrink-0 ${a.destacada ? "text-gold-400" : "text-gold-600"}`} />
                      {linea}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`rounded-2xl border p-5 ${a.destacada ? "border-white/15 bg-white/5" : "border-forest-100 bg-white"}`}>
                <Badge tone={a.destacada ? "gray" : "gray"}>Servicio adicional</Badge>
                <ul className="mt-3 space-y-2.5">
                  {a.aparte.map((linea) => (
                    <li key={linea} className={`text-sm leading-relaxed ${a.destacada ? "text-forest-300" : "text-forest-500"}`}>
                      {linea}
                    </li>
                  ))}
                </ul>
              </div>

              {a.resultados && (
                <div className="sm:col-span-2 rounded-2xl border border-gold-500/30 bg-white/5 p-5">
                  <span className="text-xs font-bold uppercase tracking-wider text-gold-300">Qué cambia cuando funciona</span>
                  <div className="grid sm:grid-cols-2 gap-2.5 mt-3">
                    {a.resultados.map((r) => (
                      <div key={r} className="flex items-start gap-2 text-sm text-forest-100">
                        <Check size={15} className="text-gold-400 mt-0.5 shrink-0" />
                        {r}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="sm:col-span-2">
                <Link
                  to={esEmpresaLogueada ? "/empresa?tab=plan" : "/registro?tipo=empresa"}
                  className={`inline-flex items-center gap-1.5 font-semibold text-sm hover:gap-2 transition-all ${a.destacada ? "text-gold-300" : "text-gold-600"}`}
                >
                  Ver de qué plan depende esto <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      ))}

      <section id="seleccion-a-medida" className="scroll-mt-24 bg-forest-50/40 border-t border-forest-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <SectionTitle
            eyebrow="Selección a medida"
            title="Cuando el puesto es clave, no alcanza con publicar la vacante"
            subtitle="Para roles críticos —un líder, un mando medio, un perfil difícil de conseguir— hacemos la búsqueda nosotros: definimos el perfil, salimos a buscar activamente, evaluamos y te presentamos al finalista con un informe. Contratalo completo o solo las fases que te hagan falta."
          />
          <ProcesoSeleccionModular />
        </div>
      </section>

      <section id="planes" className="bg-white border-t border-forest-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <SectionTitle
            eyebrow="Precios"
            title="Planes de Reclutamiento y Desarrollo"
            subtitle="Elegí el nivel de acompañamiento que necesita tu PYME. Cada plan también define qué tenés incluido en las otras 3 áreas de arriba."
            center
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {planesEmpresas.map((p, i) => (
              <Card key={p.id} className={`p-6 flex flex-col ${i === 1 ? "border-2 border-gold-500 shadow-soft" : ""}`}>
                {i === 1 && <Badge tone="gold">Más elegido</Badge>}
                <h3 className="text-xl font-bold text-forest-900 mt-3">{p.nombre}</h3>
                <div className="text-2xl font-extrabold text-forest-800 mt-1">{p.precio}</div>
                <ul className="mt-4 space-y-2 flex-1">
                  {p.incluye.map((inc) => (
                    <li key={inc} className="flex items-start gap-2 text-sm text-forest-500">
                      <Check size={16} className="text-gold-500 mt-0.5 shrink-0" />
                      {inc}
                    </li>
                  ))}
                </ul>
                <Link to={esEmpresaLogueada ? "/empresa?tab=plan" : "/registro?tipo=empresa"} className="mt-6">
                  <Button variant={i === 1 ? "primary" : "outline"} className="w-full">
                    {esEmpresaLogueada ? `Pagar plan ${p.nombre}` : `Elegir ${p.nombre}`}
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
