import { Link } from "react-router-dom";
import { Briefcase, Users, GraduationCap, LineChart, Check } from "lucide-react";
import { Card, Button, SectionTitle, Badge } from "../components/ui.jsx";
import { planesEmpresas } from "../data/seed.js";

const areas = [
  {
    icon: Briefcase,
    title: "Reclutamiento y Selección",
    items: [
      "Publicación de ofertas laborales en la plataforma",
      "Base de datos con candidatos preseleccionados",
      "Procesos de selección a medida (búsqueda activa, entrevistas, evaluaciones)",
      "Inducción breve para nuevas contrataciones",
    ],
  },
  {
    icon: Users,
    title: "Desarrollo y Retención de Talento",
    items: [
      "Diagnóstico organizacional sobre rotación de personal",
      "Planes de fidelización y estrategias de retención",
      "Evaluación de clima laboral y satisfacción de empleados",
      "Coaching y mentoring para líderes y equipos",
    ],
  },
  {
    icon: GraduationCap,
    title: "Capacitación y Desarrollo",
    items: [
      "Programas de formación en liderazgo, comunicación y trabajo en equipo",
      "Capacitaciones técnicas según necesidades específicas",
      "Talleres de team building",
    ],
  },
  {
    icon: LineChart,
    title: "Gestión del Capital Humano",
    items: [
      "Diseño de estructuras organizacionales",
      "Planes de carrera y desarrollo profesional",
      "Implementación de evaluaciones de desempeño",
    ],
  },
];

export default function ParaPymes() {
  return (
    <div>
      <section className="bg-gradient-to-br from-navy-900 to-navy-700 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <Badge tone="teal">Servicio para PYMEs</Badge>
          <h1 className="text-3xl md:text-4xl font-extrabold font-display mt-4 max-w-2xl">
            Todo el respaldo de un área de RRHH, sin montar una estructura interna.
          </h1>
          <p className="mt-4 text-navy-200 max-w-2xl leading-relaxed">
            Reclutamos, retenemos y desarrollamos el talento de tu equipo con un servicio
            integral pensado para pequeñas y medianas empresas.
          </p>
          <Link to="/registro?tipo=empresa">
            <Button variant="amber" className="mt-6 px-6 py-3">Registrar mi PYME</Button>
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <SectionTitle title="Nuestras áreas de servicio" />
        <div className="grid md:grid-cols-2 gap-6">
          {areas.map((a) => (
            <Card key={a.title} className="p-6">
              <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 mb-3">
                <a.icon size={22} />
              </div>
              <h3 className="font-bold text-navy-900 mb-3">{a.title}</h3>
              <ul className="space-y-2">
                {a.items.map((i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-navy-500">
                    <Check size={16} className="text-teal-500 mt-0.5 shrink-0" />
                    {i}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      <section id="planes" className="bg-white border-t border-navy-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <SectionTitle
            eyebrow="Precios"
            title="Planes de Reclutamiento y Selección"
            subtitle="Elegí el nivel de acompañamiento que necesita tu PYME."
            center
          />
          <div className="grid md:grid-cols-3 gap-6">
            {planesEmpresas.map((p, i) => (
              <Card key={p.id} className={`p-6 flex flex-col ${i === 1 ? "border-2 border-teal-500 shadow-soft" : ""}`}>
                {i === 1 && <Badge tone="teal">Más elegido</Badge>}
                <h3 className="text-xl font-bold text-navy-900 mt-3">{p.nombre}</h3>
                <div className="text-2xl font-extrabold text-navy-800 mt-1">{p.precio}</div>
                <ul className="mt-4 space-y-2 flex-1">
                  {p.incluye.map((inc) => (
                    <li key={inc} className="flex items-start gap-2 text-sm text-navy-500">
                      <Check size={16} className="text-teal-500 mt-0.5 shrink-0" />
                      {inc}
                    </li>
                  ))}
                </ul>
                <Link to="/registro?tipo=empresa" className="mt-6">
                  <Button variant={i === 1 ? "primary" : "outline"} className="w-full">
                    Elegir {p.nombre}
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
