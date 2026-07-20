import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Briefcase, Users, GraduationCap, LineChart, Check, Info } from "lucide-react";
import { Card, Button, SectionTitle, Badge } from "../components/ui.jsx";
import { planesEmpresas } from "../data/seed.js";
import { useApp } from "../data/store.jsx";

const areas = [
  {
    id: "reclutamiento",
    icon: Briefcase,
    title: "Reclutamiento y Selección",
    items: [
      "Publicación de ofertas laborales en la plataforma",
      "Base de datos con candidatos preseleccionados",
      "Procesos de selección a medida (búsqueda activa, entrevistas, evaluaciones)",
      "Inducción breve para nuevas contrataciones",
    ],
    incluido: "Según cantidad de vacantes activas: 1 en Básico, hasta 5 en Avanzado, ilimitadas en Premium y Platino.",
    aparte: "Búsquedas ejecutivas o procesos con evaluaciones psicotécnicas se cotizan a medida.",
  },
  {
    id: "retencion-talento",
    icon: Users,
    title: "Desarrollo y Retención de Talento",
    items: [
      "Diagnóstico organizacional sobre rotación de personal",
      "Planes de fidelización y estrategias de retención",
      "Evaluación de clima laboral y satisfacción de empleados",
      "Coaching y mentoring para líderes y equipos",
    ],
    incluido:
      "Premium y Platino incluyen diagnóstico de clima laboral (Platino con mayor frecuencia y alcance) y mentorías de acompañamiento: 1 por período en Premium, ilimitadas en Platino.",
    aparte:
      "Básico y Avanzado no incluyen diagnóstico de clima ni mentorías — se pueden comprar por separado desde Capacitaciones y mentorías, al precio publicado en cada paquete.",
  },
  {
    id: "capacitacion-desarrollo",
    icon: GraduationCap,
    title: "Capacitación y Desarrollo",
    items: [
      "Programas de formación en liderazgo, comunicación y trabajo en equipo",
      "Capacitaciones técnicas según necesidades específicas",
      "Talleres de team building",
    ],
    incluido: "Avanzado, Premium y Platino incluyen el acceso de tu equipo a las capacitaciones grupales, sin costo adicional.",
    aparte:
      "Básico no incluye capacitaciones (se cobran por separado si están disponibles como pagas). Algunos programas puntuales fuera del calendario estándar también se cobran aparte, con precio publicado en cada capacitación.",
  },
  {
    id: "capital-humano",
    icon: LineChart,
    title: "Gestión del Capital Humano",
    items: [
      "Diseño de estructuras organizacionales",
      "Planes de carrera y desarrollo profesional",
      "Implementación de evaluaciones de desempeño",
    ],
    incluido: "Platino incluye reporte trimestral de benchmarking salarial y 30% de descuento en estos servicios cuando se contratan a medida.",
    aparte:
      "Diseño de estructuras organizacionales, planes de carrera y evaluaciones de desempeño se cotizan a medida según el alcance del proyecto, dentro del catálogo de SAS Consultora — escribinos para el detalle.",
  },
];

export default function ParaPymes() {
  const { session } = useApp();
  const esEmpresaLogueada = session.role === "empresa";
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const ver = searchParams.get("ver");
    if (ver) document.getElementById(ver)?.scrollIntoView({ behavior: "smooth" });
  }, [searchParams]);

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
            integral pensado para pequeñas y medianas empresas.
          </p>
          <Link to={esEmpresaLogueada ? "/empresa?tab=plan" : "/registro?tipo=empresa"}>
            <Button variant="terracotta" className="mt-6 px-6 py-3">
              {esEmpresaLogueada ? "Ir a mi panel" : "Registrar mi PYME"}
            </Button>
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <SectionTitle
          title="Nuestras áreas de servicio"
          subtitle="No es solo conseguirte personal: es acompañar el crecimiento de tu equipo y de tu PYME en el tiempo."
        />
        <div className="grid md:grid-cols-2 gap-6">
          {areas.map((a) => (
            <Card key={a.title} id={a.id} className="p-6 scroll-mt-24">
              <div className="w-11 h-11 rounded-xl bg-gold-50 flex items-center justify-center text-gold-600 mb-3">
                <a.icon size={22} />
              </div>
              <h3 className="font-bold text-forest-900 mb-3">{a.title}</h3>
              <ul className="space-y-2">
                {a.items.map((i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-forest-500">
                    <Check size={16} className="text-gold-500 mt-0.5 shrink-0" />
                    {i}
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-forest-100 space-y-2">
                <p className="text-xs text-forest-600"><strong>Incluido en el abono:</strong> {a.incluido}</p>
                <p className="text-xs text-forest-400"><strong>Se cobra aparte:</strong> {a.aparte}</p>
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-6 flex items-start gap-2 text-sm text-forest-500 bg-forest-50 border border-forest-100 rounded-lg px-4 py-3">
          <Info size={16} className="mt-0.5 shrink-0 text-gold-600" />
          <span>
            El detalle completo de qué incluye cada plan está en la tabla de abajo. Cualquier servicio de SAS Consultora
            fuera de este alcance (por ejemplo, consultoría legal o contable) se cotiza por separado.
          </span>
        </div>
      </section>

      <section id="planes" className="bg-white border-t border-forest-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <SectionTitle
            eyebrow="Precios"
            title="Planes de Reclutamiento y Selección"
            subtitle="Elegí el nivel de acompañamiento que necesita tu PYME."
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
