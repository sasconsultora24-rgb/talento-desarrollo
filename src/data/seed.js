// Datos de ejemplo (seed) para el prototipo de SAS Talento & Desarrollo.
// Todo se guarda luego en localStorage y puede modificarse desde la app.

export const seedEmpresas = [
  {
    id: "emp-1",
    nombre: "Panadería El Trigal",
    rubro: "Alimentos",
    tamano: "11-50 empleados",
    ubicacion: "Rosario, Santa Fe",
    contacto: "Marina Sosa",
    email: "contacto@eltrigal.com",
    plan: "avanzado",
    fechaRegistro: "2026-06-02",
  },
  {
    id: "emp-2",
    nombre: "Estudio Contable Ferreyra & Asoc.",
    rubro: "Servicios profesionales",
    tamano: "1-10 empleados",
    ubicacion: "Córdoba Capital",
    contacto: "Diego Ferreyra",
    email: "diego@ferreyraasoc.com",
    plan: "basico",
    fechaRegistro: "2026-06-10",
  },
  {
    id: "emp-3",
    nombre: "Logística del Sur SRL",
    rubro: "Transporte y logística",
    tamano: "51-200 empleados",
    ubicacion: "Bahía Blanca, Buenos Aires",
    contacto: "Valeria Núñez",
    email: "rrhh@logisticadelsur.com",
    plan: "premium",
    fechaRegistro: "2026-06-15",
  },
];

export const seedCandidatos = [
  {
    id: "can-1",
    nombre: "Julián Acosta",
    email: "julian.acosta@mail.com",
    telefono: "351-555-0142",
    ubicacion: "Córdoba Capital",
    titulo: "Analista Contable",
    resumen:
      "Analista contable con 4 años de experiencia en estudios contables y PYMEs de servicios.",
    habilidades: ["Contabilidad", "Excel avanzado", "Tributación", "SAP"],
    experiencia: [
      { empresa: "Estudio Cabrera", rol: "Asistente contable", periodo: "2022-2025" },
    ],
    nivel: "Semi Senior",
    disponibilidad: "Full time",
    membresia: "free",
    fechaRegistro: "2026-06-11",
  },
  {
    id: "can-2",
    nombre: "Rocío Medina",
    email: "rocio.medina@mail.com",
    telefono: "341-555-0198",
    ubicacion: "Rosario, Santa Fe",
    titulo: "Coordinadora de Producción",
    resumen:
      "Coordinadora con experiencia en plantas de alimentos, gestión de equipos de hasta 15 personas.",
    habilidades: ["Liderazgo", "Control de calidad", "Producción", "Excel"],
    experiencia: [
      { empresa: "Alimentos del Litoral", rol: "Supervisora de línea", periodo: "2021-2026" },
    ],
    nivel: "Senior",
    disponibilidad: "Full time",
    membresia: "premium",
    fechaRegistro: "2026-06-18",
  },
  {
    id: "can-3",
    nombre: "Tomás Ibarra",
    email: "tomas.ibarra@mail.com",
    telefono: "291-555-0177",
    ubicacion: "Bahía Blanca, Buenos Aires",
    titulo: "Chofer de Larga Distancia",
    resumen: "Chofer profesional categoría E1, sin siniestros, disponibilidad para viajar.",
    habilidades: ["Carnet profesional E1", "Logística", "Mantenimiento básico"],
    experiencia: [
      { empresa: "Transportes Andino", rol: "Chofer", periodo: "2019-2026" },
    ],
    nivel: "Senior",
    disponibilidad: "Full time",
    membresia: "free",
    fechaRegistro: "2026-06-20",
  },
];

export const seedVacantes = [
  {
    id: "vac-1",
    empresaId: "emp-1",
    titulo: "Encargado de Turno",
    area: "Producción",
    modalidad: "Presencial",
    ubicacion: "Rosario, Santa Fe",
    nivel: "Semi Senior",
    descripcion:
      "Buscamos encargado/a de turno para coordinar el equipo de producción y control de calidad.",
    requisitos: ["Experiencia en alimentos", "Manejo de equipos", "Disponibilidad horaria"],
    salario: "$950.000 - $1.100.000",
    estado: "aprobada",
    fechaPublicacion: "2026-06-25",
  },
  {
    id: "vac-2",
    empresaId: "emp-2",
    titulo: "Analista Contable Jr/Ssr",
    area: "Administración y Finanzas",
    modalidad: "Híbrido",
    ubicacion: "Córdoba Capital",
    nivel: "Junior",
    descripcion: "Sumate a un estudio contable en crecimiento. Tareas de liquidación e impuestos.",
    requisitos: ["Estudiante avanzado de Contador Público", "Excel intermedio"],
    salario: "$650.000 - $800.000",
    estado: "aprobada",
    fechaPublicacion: "2026-06-28",
  },
  {
    id: "vac-3",
    empresaId: "emp-3",
    titulo: "Chofer Categoría E1",
    area: "Logística",
    modalidad: "Presencial",
    ubicacion: "Bahía Blanca, Buenos Aires",
    nivel: "Senior",
    descripcion: "Viajes de larga distancia dentro de la región. Vehículos de flota propia.",
    requisitos: ["Carnet E1 vigente", "Disponibilidad para viajar"],
    salario: "A convenir + viáticos",
    estado: "pendiente",
    fechaPublicacion: "2026-07-05",
  },
];

export const seedPostulaciones = [
  {
    id: "post-1",
    candidatoId: "can-2",
    vacanteId: "vac-1",
    estado: "entrevista",
    fecha: "2026-06-27",
    mensaje: "Muy interesada, disponibilidad inmediata.",
  },
];

export const seedCapacitaciones = [
  {
    id: "cap-1",
    titulo: "Liderazgo para Mandos Medios",
    categoria: "Liderazgo",
    modalidad: "Online en vivo",
    fecha: "2026-07-22",
    cupos: 20,
    inscriptos: ["can-2"],
    destacada: true,
    descripcion: "Herramientas prácticas para liderar equipos en PYMEs.",
  },
  {
    id: "cap-2",
    titulo: "Comunicación Efectiva y Trabajo en Equipo",
    categoria: "Comunicación",
    modalidad: "Presencial",
    fecha: "2026-08-05",
    cupos: 15,
    inscriptos: [],
    destacada: false,
    descripcion: "Taller vivencial de comunicación para equipos de trabajo.",
  },
  {
    id: "cap-3",
    titulo: "Excel Aplicado a Gestión Contable",
    categoria: "Técnica",
    modalidad: "Online grabado",
    fecha: "2026-07-15",
    cupos: 40,
    inscriptos: ["can-1"],
    destacada: false,
    descripcion: "Curso técnico orientado a analistas contables y administrativos.",
  },
];

export const seedMentorias = [
  {
    id: "men-1",
    mentor: "Claudia Bianchi",
    especialidad: "Liderazgo y gestión de equipos",
    modalidad: "Online, sesiones de 45 min",
    cuposDisponibles: 5,
    reservas: [],
  },
  {
    id: "men-2",
    mentor: "Ramiro Salcedo",
    especialidad: "Desarrollo de carrera y entrevistas",
    modalidad: "Online, sesiones de 30 min",
    cuposDisponibles: 8,
    reservas: ["can-1"],
  },
];

export const planesEmpresas = [
  {
    id: "basico",
    nombre: "Básico",
    precio: "$50.000/mes",
    incluye: [
      "Publicación de 1 vacante activa",
      "Acceso a perfiles filtrados",
      "Capacitaciones y mentorías: se cobran aparte, según disponibilidad",
    ],
  },
  {
    id: "avanzado",
    nombre: "Avanzado",
    precio: "$110.000/mes",
    incluye: [
      "Hasta 5 vacantes activas",
      "Entrevistas y shortlisting",
      "Soporte prioritario",
      "Capacitaciones para tu equipo incluidas",
    ],
  },
  {
    id: "premium",
    nombre: "Premium",
    precio: "$200.000/mes",
    incluye: [
      "Vacantes ilimitadas",
      "Selección + inducción + mentoría de acompañamiento",
      "Diagnóstico de clima laboral",
      "Capacitaciones incluidas + 1 mentoría de acompañamiento incluida por período",
    ],
  },
  {
    id: "platino",
    nombre: "Platino",
    precio: "$380.000/mes",
    incluye: [
      "Todo lo del plan Premium",
      "Selección a medida, diagnóstico de clima e inducción con mayor frecuencia/alcance",
      "Capacitaciones y mentorías ilimitadas incluidas",
      "30% de descuento adicional en servicios a la carta",
      "Soporte prioritario con tiempos de respuesta acotados",
      "Reporte trimestral de benchmarking salarial",
      "Una vacante destacada por mes",
    ],
  },
];

export const planesCandidatos = [
  {
    id: "free",
    nombre: "Gratuito",
    precio: "$0",
    incluye: ["Perfil en la base de datos", "Postulación a vacantes"],
  },
  {
    id: "premium",
    nombre: "Desarrollo Profesional",
    precio: "$10.000/mes",
    incluye: [
      "Prioridad en postulaciones",
      "Mentorías con descuento",
      "Revisión de CV y simulacro de entrevista",
    ],
  },
];
