// Mentorías personalizadas: no son un listado de mentores individuales, son 2
// paquetes fijos de acompañamiento 1 a 1, con precio especial para cualquier
// candidato o empresa registrado en la plataforma (alcanza con estar registrado,
// no depende de tener un plan pago). Se compran igual que un plan o membresía,
// vía Mercado Pago (ver iniciarPago("mentoria", id) en data/store.jsx).

export const MENTORIA_PAQUETES = [
  {
    id: "espacio_orden",
    nombre: "Espacio de Orden",
    sesiones: 2,
    tagline: "Dos encuentros. Un solo objetivo: que salgas con claridad.",
    descripcion:
      "Es para cuando tenés todo mezclado — el trabajo, el equipo, las decisiones, vos. No es terapia. No es consultoría técnica. Es un espacio corto y concreto donde ordenamos lo que hoy te tiene trabado: qué está pasando, qué depende de vos y cuál es el próximo paso.",
    frase: "Llegás con ruido. Te vas con un mapa.",
    ideal: "Ideal si sentís que necesitás parar la pelota antes de seguir decidiendo a ciegas.",
    precioLista: 150000,
    precioSocio: 120000,
  },
  {
    id: "refoco",
    nombre: "Mentoría Refoco",
    sesiones: 4,
    tagline: "Cuando el día a día te comió, Refoco te devuelve el foco.",
    descripcion:
      "Es un proceso de acompañamiento individual para dueños y líderes que están operando en automático: apagando incendios, resolviendo todo, sin tiempo para pensar el negocio. Trabajamos sobre tu rol real — qué tenés que sostener vos, qué tenés que soltar y hacia dónde estás llevando lo que dirigís.",
    frase: "No es motivación. Es reordenar tu energía donde de verdad mueve la aguja.",
    ideal: "Para el que dirige mucho y se piensa poco.",
    precioLista: 300000,
    precioSocio: 270000,
  },
];

export function formatoPesos(monto) {
  return monto.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
}
