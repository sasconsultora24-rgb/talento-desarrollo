import { Link } from "react-router-dom";
import {
  UserPlus,
  FileText,
  Send,
  ListFilter,
  MessagesSquare,
  Handshake,
  Sparkles,
  ArrowRight,
  Check,
} from "lucide-react";
import { Card, Button, SectionTitle, Badge } from "../components/ui.jsx";
import { useApp } from "../data/store.jsx";
import ProcesoSeleccionModular from "../components/ProcesoSeleccionModular.jsx";

// Explica el circuito completo de punta a punta. Existe porque el proceso
// estaba implementado pero en ningún lado escrito: ni la PYME ni el
// profesional podían saber qué pasa después de registrarse, ni dónde
// interviene SAS. Cada paso aclara quién hace qué.

const PASOS = [
  {
    n: 1,
    icon: UserPlus,
    titulo: "Cada parte crea su perfil",
    pyme: "La PYME se registra, carga los datos de la empresa y elige un plan (o arranca con el pago único por vacante).",
    profesional:
      "El profesional crea su perfil gratis: experiencia, habilidades, nivel, ubicación, disponibilidad y CV.",
    sas: "La plataforma exige los datos mínimos de forma automática, al instante. Un perfil a medias no compite bien: cuanto más completo, mejor puntúa después en el filtro de afinidad.",
  },
  {
    n: 2,
    icon: FileText,
    titulo: "La búsqueda se publica al instante",
    destacado: true,
    pyme: "Carga el puesto —descripción, requisitos, nivel, modalidad, ubicación y rango salarial— y queda publicada en el momento, sin esperar que nadie la apruebe. Recibe el mail de confirmación al toque.",
    profesional:
      "Ve la vacante enseguida. Y si su perfil encaja con los requisitos, le llega un email avisándole de la nueva búsqueda: no depende de entrar a mirar todos los días.",
    sas: "Automático. SAS recibe un aviso de cada vacante publicada y la revisa después: si hay requisitos vagos o algo que no corresponde, la despublica y le escribe a la PYME para ajustarla. Se controla la calidad sin frenar la publicación.",
  },
  {
    n: 3,
    icon: Send,
    titulo: "Los profesionales se postulan",
    pyme: "Ve entrar las postulaciones en su panel, en tiempo real.",
    profesional:
      "Busca entre las vacantes activas y se postula con un click. Un solo perfil sirve para todas las búsquedas: no hay que volver a cargar nada.",
    sas: "Automático: la plataforma avisa por email a la PYME cuando entra una postulación, y al profesional cuando cambia el estado de la suya. Nadie tiene que acordarse de mandar el aviso.",
  },
  {
    n: 4,
    icon: ListFilter,
    titulo: "El filtro automático ordena por afinidad",
    destacado: true,
    pyme: "Cada postulación llega con un porcentaje de match contra TU vacante y las de mayor afinidad aparecen arriba. Podés filtrar y ver solo las de afinidad alta.",
    profesional:
      "Cuanto más completo el perfil, mejor puntúa. Con Desarrollo Profesional, además, tenés prioridad dentro de tu franja de afinidad.",
    sas: "Automático, sin intervención de nadie: el puntaje compara el perfil contra los requisitos, el nivel, la ubicación y la modalidad de la vacante, y siempre muestra por qué dio ese número. Ordena y orienta: no descarta a nadie ni oculta postulaciones.",
  },
  {
    n: 5,
    icon: MessagesSquare,
    titulo: "Entrevistas y seguimiento",
    pyme: "Mueve a cada persona por los estados: nueva, en revisión, entrevista, contratado o descartado. Siempre sabe en qué punto está cada búsqueda.",
    profesional:
      "Ve el estado de cada una de sus postulaciones desde su panel. No queda esperando sin novedades.",
    sas: "En los planes Premium y Platino, SAS hace las entrevistas preliminares y de fondo (según corresponda) y presenta finalistas, en vez de dejar todo el trabajo del lado de la PYME.",
  },
  {
    n: 6,
    icon: Handshake,
    titulo: "Contratación",
    pyme: "Marca la postulación como contratada y la vacante se cierra.",
    profesional: "Recibe la confirmación y arranca en el nuevo puesto.",
    sas: "Acompaña la negociación de la oferta si la PYME lo contrata (Fase 4 del servicio de selección).",
  },
  {
    n: 7,
    icon: Sparkles,
    titulo: "Lo que pasa después — acá está la diferencia",
    destacado: true,
    pyme: "Capacitaciones para el equipo, mentorías para los líderes, diagnóstico de clima y desarrollo organizacional. La relación no termina con la contratación.",
    profesional:
      "Capacitaciones, mentorías de adaptación al nuevo puesto y acompañamiento de carrera, siga o no en ese trabajo.",
    sas: "Es la razón de ser de Talento & Desarrollo: la mayoría de las plataformas de empleo se despiden cuando se cierra la búsqueda. Nosotros recién ahí empezamos la otra mitad del trabajo.",
  },
];

export default function ComoFunciona() {
  const { session } = useApp();
  const esEmpresa = session.role === "empresa";
  const esCandidato = session.role === "candidato";

  return (
    <div>
      <section className="bg-gradient-to-br from-forest-900 to-forest-700 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <Badge tone="gold">Cómo funciona</Badge>
          <h1 className="text-3xl md:text-4xl font-extrabold font-display mt-4 max-w-3xl">
            De la vacante publicada a la persona incorporada — y lo que viene después.
          </h1>
          <p className="mt-4 text-forest-200 max-w-2xl leading-relaxed">
            El proceso completo, paso por paso, con lo que hace cada parte: la PYME,
            el profesional y SAS Consultora. Sin letra chica.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="space-y-5">
          {PASOS.map((p) => (
            <Card
              key={p.n}
              className={`p-6 ${p.destacado ? "border-2 border-gold-500 shadow-soft" : ""}`}
            >
              <div className="grid md:grid-cols-4 gap-6">
                <div className="md:col-span-1">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gold-50 flex items-center justify-center text-gold-600 shrink-0">
                      <p.icon size={22} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-gold-600">
                      Paso {p.n}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-forest-900 mt-3 leading-snug">{p.titulo}</h3>
                </div>

                <div className="md:col-span-3 grid sm:grid-cols-3 gap-4">
                  <div className="rounded-xl bg-forest-50/60 border border-forest-100 p-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-forest-500">
                      La PYME
                    </span>
                    <p className="text-sm text-forest-600 mt-1.5 leading-relaxed">{p.pyme}</p>
                  </div>
                  <div className="rounded-xl bg-terracotta-50/50 border border-terracotta-100 p-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-terracotta-600">
                      El profesional
                    </span>
                    <p className="text-sm text-forest-600 mt-1.5 leading-relaxed">
                      {p.profesional}
                    </p>
                  </div>
                  <div className="rounded-xl bg-gold-50/60 border border-gold-200 p-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-gold-700">
                      SAS Consultora
                    </span>
                    <p className="text-sm text-forest-600 mt-1.5 leading-relaxed">{p.sas}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CÓMO FUNCIONA EL FILTRO, EN DETALLE */}
      <section id="filtro" className="scroll-mt-24 bg-forest-50/40 border-y border-forest-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <SectionTitle
            eyebrow="El filtro, en detalle"
            title="Cómo evitamos que pierdas tiempo con perfiles que no encajan"
            subtitle="Este es el punto que más preocupa a una PYME: publicar una búsqueda y que lleguen 80 CV, de los cuales 5 sirven. Así lo resolvemos."
          />
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-bold text-forest-900 mb-3">Qué mira el sistema</h3>
              <ul className="space-y-2.5">
                {[
                  "Requisitos de la vacante contra las habilidades, el título, el resumen y la experiencia del perfil (45% del puntaje)",
                  "Nivel buscado contra el nivel del candidato, contemplando también la sobrecalificación (25%)",
                  "Ubicación: misma ciudad, misma provincia u otra — salvo que la vacante sea remota (20%)",
                  "Disponibilidad declarada contra la modalidad del puesto (10%)",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2 text-sm text-forest-600">
                    <Check size={16} className="text-gold-500 mt-0.5 shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="p-6">
              <h3 className="font-bold text-forest-900 mb-3">Y qué NO hace</h3>
              <ul className="space-y-2.5 text-sm text-forest-600">
                <li className="leading-relaxed">
                  <strong className="text-forest-800">No descarta a nadie.</strong> Ninguna
                  postulación se oculta. Ordena y te avisa dónde mirar primero, pero vos
                  seguís viendo a todos y podés abrir cualquier CV.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-forest-800">No es una caja negra.</strong> Al lado
                  de cada puntaje está el detalle de por qué dio ese número y qué requisitos
                  no surgen del perfil, para que puedas desconfiar cuando corresponda.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-forest-800">No reemplaza tu criterio.</strong> Una
                  persona con puntaje bajo puede ser la indicada: el sistema lee palabras, no
                  entiende contextos ni potencial.
                </li>
              </ul>
            </Card>
          </div>
          <p className="text-sm text-forest-500 mt-6 max-w-3xl leading-relaxed">
            Para los puestos donde esto no alcanza —un líder, un mando medio, un perfil muy
            específico— existe el servicio de selección a medida, donde el filtro lo hacemos
            nosotros a mano, con entrevistas y evaluación en profundidad.
          </p>
        </div>
      </section>

      {/* SELECCIÓN A MEDIDA */}
      <section id="seleccion" className="scroll-mt-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <SectionTitle
            eyebrow="Cuando el puesto es clave"
            title="Selección a medida: la búsqueda la hacemos nosotros"
            subtitle="Completa o por fases, según cuánto del proceso quieras delegar."
          />
          <ProcesoSeleccionModular mostrarCta={false} />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-forest-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold font-display">
            ¿Empezamos?
          </h2>
          <p className="text-forest-300 mt-3 max-w-xl mx-auto leading-relaxed">
            Registrarte es gratis en los dos lados. Recién elegís plan cuando lo necesitás.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link to={esCandidato ? "/candidato" : "/registro"}>
              <Button variant="terracotta" className="px-6 py-3">
                {esCandidato ? "Ir a mi panel" : "Soy profesional"} <ArrowRight size={18} />
              </Button>
            </Link>
            <Link to={esEmpresa ? "/empresa" : "/registro?tipo=empresa"}>
              <Button
                variant="outline"
                className="!text-white !border-white/30 hover:!border-gold-300 hover:!text-gold-300 px-6 py-3"
              >
                {esEmpresa ? "Ir a mi panel" : "Soy una PYME"}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
