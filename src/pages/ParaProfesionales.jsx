import { Link, useSearchParams } from "react-router-dom";
import { Briefcase, GraduationCap, Compass, Check, ArrowRight } from "lucide-react";
import { Card, Button, SectionTitle, Badge } from "../components/ui.jsx";
import { planesCandidatos } from "../data/seed.js";
import { useApp } from "../data/store.jsx";
import { useScrollToAnchor } from "../utils/useScrollToAnchor.js";
import MentoriasPaquetes from "../components/MentoriasPaquetes.jsx";

const areas = [
  {
    id: "ofertas-laborales",
    icon: Briefcase,
    title: "Ofertas laborales",
    pitch: "Vacantes reales de PYMEs de la región, no un pizarrón genérico: cada búsqueda está gestionada por una empresa que efectivamente está contratando.",
    items: [
      "Postulación directa a vacantes activas",
      "Perfil único que usás para postularte a todas las búsquedas",
      "Seguimiento del estado de cada postulación (nueva, en revisión, entrevista)",
    ],
    incluido: [
      "Perfil en la base de datos y postulación ilimitada, sin costo",
    ],
    aparte: [
      "Con Desarrollo Profesional tu perfil aparece primero en el buscador de las PYMEs y en el orden de postulaciones recibidas — más visibilidad, no más trámite.",
    ],
  },
  {
    id: "capacitacion-continua",
    icon: GraduationCap,
    title: "Capacitación continua",
    pitch: "Talleres y cursos de liderazgo, comunicación y herramientas técnicas, en vivo y on-demand, para seguir creciendo aunque tu empresa actual no te los pague.",
    items: [
      "Cursos gratuitos disponibles para cualquier perfil registrado",
      "Cursos pagos, en vivo u on-demand, con precio de lanzamiento por tiempo limitado",
      "Certificado de participación en cada capacitación",
    ],
    incluido: [
      "Las capacitaciones gratuitas están disponibles sin costo para cualquier perfil registrado",
    ],
    aparte: [
      "Con Desarrollo Profesional sumás hasta 2 capacitaciones pagas por mes incluidas, sin costo adicional — las gratuitas ya están incluidas siempre, para cualquier perfil.",
    ],
  },
  {
    id: "mentorias",
    icon: Compass,
    title: "Mentorías y Coaching",
    pitch: "Acompañamiento 1 a 1 para destrabar decisiones de carrera, no charlas genéricas: dos procesos concretos, a precio especial por estar registrado en la plataforma.",
    items: [
      "Espacio de Orden: 2 sesiones para ordenar una decisión puntual",
      "Refoco: 4 sesiones de acompañamiento más sostenido",
    ],
    incluido: [
      "Precio de socio (más bajo que el precio de lista) para cualquier perfil registrado, gratis o Desarrollo Profesional",
    ],
    aparte: [
      "Se contratan por sesión/paquete, vía Mercado Pago, coordinando el horario después de la confirmación del pago",
    ],
  },
];

export default function ParaProfesionales() {
  const { session } = useApp();
  const esCandidatoLogueado = session.role === "candidato";
  const [searchParams] = useSearchParams();
  useScrollToAnchor(searchParams);

  return (
    <div>
      <section className="bg-gradient-to-br from-forest-900 to-forest-700 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <Badge tone="gold">Servicio para profesionales</Badge>
          <h1 className="text-3xl md:text-4xl font-extrabold font-display mt-4 max-w-2xl">
            Oportunidades reales y acompañamiento para crecer, no solo un currículum en una base de datos.
          </h1>
          <p className="mt-4 text-forest-200 max-w-2xl leading-relaxed">
            Tu perfil queda cargado sin costo. Vos elegís cuánto querés potenciarlo: desde postularte a
            vacantes de PYMEs de la región hasta capacitarte y tener acompañamiento 1 a 1 para tu carrera.
          </p>
          <Link to={esCandidatoLogueado ? "/candidato?tab=plan" : "/registro?tipo=candidato"}>
            <Button variant="terracotta" className="mt-6 px-6 py-3">
              {esCandidatoLogueado ? "Ir a mi panel" : "Registrarme como profesional"}
            </Button>
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-8">
        <SectionTitle
          eyebrow="Nuestro servicio"
          title="3 áreas, un solo lugar"
          subtitle="Bajá para ver el detalle de cada una: qué tenés siempre sin costo y qué se suma con la membresía Desarrollo Profesional."
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
                <Badge tone="gold">Incluido siempre</Badge>
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
                <Badge tone="gray">Con Desarrollo Profesional</Badge>
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
                  to={esCandidatoLogueado ? "/candidato?tab=plan" : "/registro?tipo=candidato"}
                  className="inline-flex items-center gap-1.5 text-gold-600 font-semibold text-sm hover:gap-2 transition-all"
                >
                  Ver de qué depende esto <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      ))}

      <section id="mentorias-detalle" className="bg-forest-50/40 border-t border-forest-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <MentoriasPaquetes titulo="Mentorías y Coaching" mostrarIntro={false} />
        </div>
      </section>

      <section id="plan" className="bg-white border-t border-forest-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <SectionTitle
            eyebrow="Precios"
            title="Tu perfil, gratis. Tu crecimiento, a un click."
            subtitle="Podés postularte a vacantes con el plan gratuito. Desarrollo Profesional suma capacitaciones incluidas y prioridad frente a las PYMEs."
            center
          />
          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {planesCandidatos.map((p, i) => (
              <Card key={p.id} className={`p-6 flex flex-col ${i === 1 ? "border-2 border-gold-500 shadow-soft" : ""}`}>
                {i === 1 && <Badge tone="gold">Recomendado</Badge>}
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
                <Link to={esCandidatoLogueado ? "/candidato?tab=plan" : "/registro?tipo=candidato"} className="mt-6">
                  <Button variant={i === 1 ? "primary" : "outline"} className="w-full">
                    {esCandidatoLogueado ? `Elegir ${p.nombre}` : "Registrarme"}
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
