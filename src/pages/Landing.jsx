import { Link } from "react-router-dom";
import {
  Briefcase,
  GraduationCap,
  Users,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useApp } from "../data/store.jsx";
import { Button, Card, Badge, SectionTitle, StatCard } from "../components/ui.jsx";

export default function Landing() {
  const { vacantes, empresas, candidatos, capacitaciones } = useApp();
  const vacantesAbiertas = vacantes.filter((v) => v.estado === "aprobada");

  return (
    <div>
      {/* HERO */}
      <section className="bg-gradient-to-br from-forest-900 via-forest-800 to-forest-700 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <Badge tone="gold">Unidad de RRHH de SAS Consultora</Badge>
            <h1 className="mt-4 text-4xl md:text-5xl font-extrabold font-display leading-tight">
              Impulsamos tu talento,<br /> transformamos <span className="text-gold-300">PYMEs</span>.
            </h1>
            <p className="mt-5 text-forest-200 text-lg leading-relaxed max-w-lg">
              No somos una bolsa de trabajo más. Conectamos PYMEs con el talento que necesitan
              y acompañamos el crecimiento de ambos lados con capacitación, mentorías y todo
              el respaldo de SAS Consultora — antes, durante y después de cada contratación.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/registro">
                <Button variant="terracotta" className="text-base px-6 py-3">
                  Soy profesional <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/registro?tipo=empresa">
                <Button variant="outline" className="!text-white !border-white/30 hover:!border-gold-300 hover:!text-gold-300 text-base px-6 py-3">
                  Soy una PYME
                </Button>
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Vacantes activas" value={vacantesAbiertas.length} tone="gold" />
            <StatCard label="PYMEs registradas" value={empresas.length} tone="terracotta" />
            <StatCard label="Profesionales en la base" value={candidatos.length} tone="forest" />
            <StatCard label="Capacitaciones disponibles" value={capacitaciones.length} tone="gold" />
          </div>
        </div>
      </section>

      {/* SERVICIOS PARA PYMES */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <SectionTitle
          eyebrow="Para PYMEs"
          title="Un servicio integral de RRHH, sin la estructura de un área interna"
          subtitle="Reclutamiento, retención y desarrollo del talento humano en un solo lugar."
        />
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Briefcase,
              title: "Reclutamiento y selección",
              text: "Publicación de vacantes, base de candidatos preseleccionados y procesos a medida.",
            },
            {
              icon: Users,
              title: "Retención de talento",
              text: "Diagnóstico de rotación, clima laboral y planes de fidelización de equipos.",
            },
            {
              icon: GraduationCap,
              title: "Capacitación y desarrollo",
              text: "Formación en liderazgo, comunicación y habilidades técnicas para tus equipos.",
            },
          ].map((s) => (
            <Card key={s.title} className="p-6">
              <div className="w-11 h-11 rounded-xl bg-gold-50 flex items-center justify-center text-gold-600 mb-4">
                <s.icon size={22} />
              </div>
              <h3 className="font-bold text-forest-900 mb-1.5">{s.title}</h3>
              <p className="text-sm text-forest-500 leading-relaxed">{s.text}</p>
            </Card>
          ))}
        </div>
        <div className="mt-6">
          <Link to="/pymes" className="text-gold-600 font-semibold text-sm inline-flex items-center gap-1 hover:gap-2 transition-all">
            Ver todos los servicios para PYMEs <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* SERVICIOS PARA PROFESIONALES */}
      <section className="bg-white border-y border-forest-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <SectionTitle
            eyebrow="Para profesionales"
            title="Oportunidades reales y acompañamiento para crecer"
            subtitle="Tu perfil queda en nuestra base sin costo. Vos elegís cuánto querés potenciarlo."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Briefcase,
                title: "Ofertas laborales",
                text: "Accedé a vacantes de PYMEs de la región alineadas a tu perfil.",
              },
              {
                icon: Sparkles,
                title: "Mentorías y coaching",
                text: "Sesiones individuales para tu desarrollo profesional y toma de decisiones.",
              },
              {
                icon: TrendingUp,
                title: "Capacitación continua",
                text: "Talleres de liderazgo, comunicación y trabajo en equipo.",
              },
            ].map((s) => (
              <Card key={s.title} className="p-6">
                <div className="w-11 h-11 rounded-xl bg-terracotta-50 flex items-center justify-center text-terracotta-500 mb-4">
                  <s.icon size={22} />
                </div>
                <h3 className="font-bold text-forest-900 mb-1.5">{s.title}</h3>
                <p className="text-sm text-forest-500 leading-relaxed">{s.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* VACANTES DESTACADAS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <SectionTitle eyebrow="Oportunidades" title="Vacantes recientes" />
        <div className="grid md:grid-cols-3 gap-5">
          {vacantesAbiertas.slice(0, 3).map((v) => {
            const empresa = empresas.find((e) => e.id === v.empresaId);
            return (
              <Card key={v.id} className="p-5 flex flex-col">
                <Badge tone="gold">{v.area}</Badge>
                <h3 className="font-bold text-forest-900 mt-3">{v.titulo}</h3>
                <p className="text-sm text-forest-500 mt-1">{empresa?.nombre} · {v.ubicacion}</p>
                <p className="text-sm text-forest-400 mt-3 flex-1 line-clamp-3">{v.descripcion}</p>
                <Link to="/vacantes" className="mt-4">
                  <Button variant="outline" className="w-full">Ver detalle</Button>
                </Link>
              </Card>
            );
          })}
        </div>
      </section>

      {/* DIFERENCIACION */}
      <section className="bg-forest-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <ShieldCheck className="text-gold-300" size={36} />
            <h2 className="text-2xl md:text-3xl font-extrabold font-display mt-4">
              La diferencia con otras consultoras de RRHH
            </h2>
            <p className="mt-4 text-forest-300 leading-relaxed">
              La mayoría de las plataformas de empleo terminan la relación apenas se cierra una
              búsqueda o se paga una suscripción. Talento &amp; Desarrollo es la unidad de SAS
              Consultora pensada para seguir después de eso: mentorías de adaptación para quien
              se suma a un equipo nuevo, capacitación continua, y desarrollo organizacional real
              para la PYME que lo incorpora — con el resto de los servicios de SAS Consultora
              disponibles en el mismo lugar. Construimos relaciones de largo plazo, no búsquedas puntuales.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              "Selección a medida",
              "Mentorías personalizadas",
              "Capacitación continua",
              "Diagnóstico de clima laboral",
            ].map((f) => (
              <div key={f} className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-semibold">
                {f}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h2 className="text-2xl md:text-3xl font-extrabold text-forest-900">
          ¿Listo para empezar?
        </h2>
        <p className="text-forest-500 mt-2">Registrate gratis como profesional o publicá tu primera vacante como PYME.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/registro"><Button variant="primary" className="px-6 py-3">Crear mi perfil</Button></Link>
          <Link to="/registro?tipo=empresa"><Button variant="secondary" className="px-6 py-3">Registrar mi PYME</Button></Link>
        </div>
      </section>
    </div>
  );
}
