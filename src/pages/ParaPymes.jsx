import { Link, useSearchParams } from "react-router-dom";
import { Briefcase, Users, GraduationCap, LineChart, Check, ArrowRight } from "lucide-react";
import { Card, Button, SectionTitle, Badge } from "../components/ui.jsx";
import { planesEmpresas } from "../data/seed.js";
import { useApp } from "../data/store.jsx";
import { useScrollToAnchor } from "../utils/useScrollToAnchor.js";

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
      "1 vacante activa en el plan Básico",
      "Hasta 5 vacantes activas en el plan Avanzado",
      "Vacantes ilimitadas en Premium y Platino",
      "Entrevistas y shortlisting desde Avanzado",
    ],
    aparte: [
      "Búsquedas ejecutivas o de alta especialización",
      "Procesos con evaluaciones psicotécnicas",
      "Ambos se cotizan a medida según el perfil buscado",
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
      "1 mentoría de acompañamiento incluida por período en Premium",
      "Mentorías ilimitadas incluidas en Platino",
    ],
    aparte: [
      "Básico y Avanzado no incluyen diagnóstico de clima ni mentorías",
      "Se compran por separado desde Capacitaciones y mentorías, al precio de socio publicado en cada paquete",
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
      "Acceso de todo tu equipo a las capacitaciones grupales desde el plan Avanzado",
      "Sin costo adicional por persona inscripta, mientras el plan esté vigente",
    ],
    aparte: [
      "El plan Básico no incluye capacitaciones — se cobran por separado si están disponibles como pagas",
      "Programas puntuales fuera del calendario estándar, con precio publicado en cada capacitación",
    ],
  },
  {
    id: "capital-humano",
    icon: LineChart,
    title: "Gestión del Capital Humano",
    pitch:
      "Es el corazón de lo que SAS Consultora hace desde siempre como consultora de RRHH tradicional, ahora también disponible desde la plataforma: ordenar cómo funciona tu gente, no solo conseguirla o retenerla.",
    items: [
      "Diseño de estructura organizacional: organigramas, descripciones de puesto y niveles de reporte",
      "Bandas salariales y política de compensaciones, con benchmarking del rubro",
      "Manuales de políticas internas y procesos de RRHH (onboarding, legajos, procedimientos)",
      "Evaluaciones de desempeño y planes de carrera y sucesión",
    ],
    incluido: [
      "Reporte trimestral de benchmarking salarial del rubro en el plan Platino",
      "30% de descuento en cualquiera de estos proyectos cuando se contratan a medida, también en Platino",
    ],
    aparte: [
      "Diseño organizacional, bandas salariales, manuales de políticas, evaluaciones de desempeño y planes de sucesión",
      "Es el mismo servicio de consultoría tradicional que SAS Consultora presta hoy fuera de la plataforma — se cotiza a medida según el alcance del proyecto y el tamaño del equipo",
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
          className={`scroll-mt-24 border-t border-forest-100 ${i % 2 === 1 ? "bg-white" : "bg-forest-50/40"}`}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 grid md:grid-cols-5 gap-10 items-start">
            <div className="md:col-span-2">
              <div className="w-12 h-12 rounded-xl bg-gold-50 flex items-center justify-center text-gold-600 mb-4">
                <a.icon size={24} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-gold-600">Área {i + 1} de {areas.length}</span>
              <h3 className="text-2xl font-extrabold text-forest-900 mt-1 mb-3">{a.title}</h3>
              <p className="text-sm text-forest-500 leading-relaxed mb-4">{a.pitch}</p>
              <ul className="space-y-2">
                {a.items.map((it) => (
                  <li key={it} className="flex items-start gap-2 text-sm text-forest-600">
                    <Check size={16} className="text-gold-500 mt-0.5 shrink-0" />
                    {it}
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-3 grid sm:grid-cols-2 gap-5">
              <div className="rounded-2xl border border-gold-200 bg-gold-50/60 p-5">
                <Badge tone="gold">Incluido en el abono</Badge>
                <ul className="mt-3 space-y-2.5">
                  {a.incluido.map((linea) => (
                    <li key={linea} className="text-sm text-forest-700 leading-relaxed flex items-start gap-2">
                      <Check size={15} className="text-gold-600 mt-0.5 shrink-0" />
                      {linea}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-forest-100 bg-white p-5">
                <Badge tone="gray">Servicio adicional</Badge>
                <ul className="mt-3 space-y-2.5">
                  {a.aparte.map((linea) => (
                    <li key={linea} className="text-sm text-forest-500 leading-relaxed">
                      {linea}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="sm:col-span-2">
                <Link
                  to={esEmpresaLogueada ? "/empresa?tab=plan" : "/registro?tipo=empresa"}
                  className="inline-flex items-center gap-1.5 text-gold-600 font-semibold text-sm hover:gap-2 transition-all"
                >
                  Ver de qué plan depende esto <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      ))}

      <section id="planes" className="bg-white border-t border-forest-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <SectionTitle
            eyebrow="Precios"
            title="Planes de Reclutamiento y Selección"
            subtitle="Elegí el nivel de acompañamiento que necesita tu PYME. Cada plan también define qué tenés incluido en las otras 3 áreas de arriba."
            center
          />
          <div className="grid md:grid-cols-3 gap-6">
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
