// Servicio de Selección de Personal a medida de SAS Consultora, llevado a la
// plataforma tal como se venía cotizando por fuera (ver propuesta "Líder de
// Equipo"): se puede contratar completo o fase por fase.
//
// Los precios se publican como "desde" porque el valor final depende de la
// complejidad del perfil (un operario no cuesta lo mismo que un gerente).
// Esto deja margen para cotizar más arriba sin contradecir lo publicado.

export const FASES_SELECCION = [
  {
    id: "fase-1",
    numero: 1,
    nombre: "Definición del Perfil y Estrategia",
    resumen:
      "Antes de publicar nada, definimos con precisión a quién estamos buscando y cómo lo vamos a encontrar.",
    incluye: [
      "Sesión de alineación para definir el perfil ideal y la estrategia de reclutamiento",
      "Creación de la descripción de puesto, atractiva y efectiva",
    ],
    precio: 180000,
    duracion: "1 semana",
    // Planes mensuales que ya la traen incluida.
    incluidaEn: ["premium", "platino"],
  },
  {
    id: "fase-2",
    numero: 2,
    nombre: "Búsqueda y Preselección de Candidatos",
    resumen:
      "Salimos a buscar activamente, no esperamos a que lleguen. Filtramos y entrevistamos antes de que la búsqueda llegue a tu escritorio.",
    incluye: [
      "Publicación de la oferta y búsqueda activa, con prioridad en headhunting",
      "Filtro de currículums y entrevistas iniciales",
    ],
    precio: 220000,
    duracion: "2 a 3 semanas",
    incluidaEn: ["premium", "platino"],
  },
  {
    id: "fase-3",
    numero: 3,
    nombre: "Evaluación y Presentación del Finalista",
    resumen:
      "Evaluación en profundidad de los preseleccionados y presentación del finalista con un informe que fundamenta la decisión.",
    incluye: [
      "Entrevistas en profundidad con foco en competencias",
      "Evaluaciones prácticas cuando el rol lo requiere",
      "Informe detallado del candidato finalista",
    ],
    precio: 260000,
    duracion: "2 a 3 semanas",
    incluidaEn: ["platino"],
  },
  {
    id: "fase-4",
    numero: 4,
    nombre: "Acompañamiento Post-Incorporación",
    resumen:
      "Contratar es la mitad del trabajo. Acompañamos a la persona en su primer mes, que es cuando se define si se queda.",
    incluye: [
      "Sesión de coaching inicial",
      "Seguimiento durante los primeros 30 días",
    ],
    precio: 90000,
    duracion: "30 días",
    // Siempre se contrata aparte, en todos los planes.
    incluidaEn: [],
  },
];

export const PAQUETE_INTEGRAL = {
  id: "integral",
  nombre: "Propuesta Integral",
  resumen:
    "Todo el proceso de punta a punta, de la definición del perfil al seguimiento post-incorporación. Sale menos que contratar las fases por separado.",
  precio: 750000,
  duracion: "35 a 45 días",
  formaPago: "50% al inicio y 50% al finalizar el proceso",
  incluye: [
    "Definición del perfil y estrategia de búsqueda",
    "Búsqueda activa con prioridad en headhunting",
    "Filtro de currículums y entrevistas preliminares",
    "Evaluación en profundidad: entrevistas por competencias y pruebas específicas",
    "Presentación del candidato finalista con informe detallado",
    "Acompañamiento en la negociación de la oferta laboral (opcional)",
    "Seguimiento post-incorporación durante los primeros 30 días (opcional)",
  ],
};

export const FORMA_PAGO_MODULAR = "Se abona al inicio de cada fase contratada";

// Total de las 4 fases sueltas, para poder mostrar el ahorro real del integral
// sin inventar un porcentaje.
export function totalFasesSueltas() {
  return FASES_SELECCION.reduce((acc, f) => acc + f.precio, 0);
}

export function ahorroIntegral() {
  return totalFasesSueltas() - PAQUETE_INTEGRAL.precio;
}

// Fases que un plan mensual ya trae incluidas.
export function fasesIncluidasEn(planId) {
  return FASES_SELECCION.filter((f) => f.incluidaEn.includes(planId));
}
