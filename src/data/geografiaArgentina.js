// Provincias y ciudades principales de Argentina, para los selectores de
// ubicación (registro y perfil). No pretende ser exhaustivo: cubre las
// localidades más pobladas de cada provincia. Si la ciudad de alguien no
// está en la lista, puede elegir "Otra localidad" y escribirla a mano.

export const PROVINCIAS_ARGENTINA = [
  "Buenos Aires",
  "Ciudad Autónoma de Buenos Aires",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán",
];

export const OTRA_LOCALIDAD = "Otra localidad";

export const CIUDADES_POR_PROVINCIA = {
  "Buenos Aires": [
    "La Plata", "Mar del Plata", "Bahía Blanca", "Tandil", "Quilmes",
    "Lomas de Zamora", "San Isidro", "Morón", "Vicente López", "Avellaneda",
    "Pilar", "Tigre", "San Nicolás de los Arroyos", "Junín", "Olavarría",
    "Necochea", "Zárate", "Campana", "Luján", "Chivilcoy",
  ],
  "Ciudad Autónoma de Buenos Aires": ["Ciudad Autónoma de Buenos Aires"],
  "Catamarca": ["San Fernando del Valle de Catamarca", "Recreo", "Andalgalá", "Belén", "Tinogasta", "Santa María"],
  "Chaco": ["Resistencia", "Presidencia Roque Sáenz Peña", "Villa Ángela", "Charata", "Barranqueras", "General San Martín"],
  "Chubut": ["Comodoro Rivadavia", "Trelew", "Puerto Madryn", "Rawson", "Esquel", "Sarmiento"],
  "Córdoba": ["Córdoba", "Río Cuarto", "Villa María", "San Francisco", "Alta Gracia", "Villa Carlos Paz", "Bell Ville", "Jesús María", "Río Tercero"],
  "Corrientes": ["Corrientes", "Goya", "Mercedes", "Curuzú Cuatiá", "Paso de los Libres", "Santo Tomé"],
  "Entre Ríos": ["Paraná", "Concordia", "Gualeguaychú", "Concepción del Uruguay", "Gualeguay", "Villaguay"],
  "Formosa": ["Formosa", "Clorinda", "Pirané", "El Colorado"],
  "Jujuy": ["San Salvador de Jujuy", "Palpalá", "Perico", "Libertador General San Martín", "San Pedro de Jujuy"],
  "La Pampa": ["Santa Rosa", "General Pico", "Toay", "Realicó"],
  "La Rioja": ["La Rioja", "Chilecito", "Aimogasta", "Chamical"],
  "Mendoza": ["Mendoza", "San Rafael", "Godoy Cruz", "Guaymallén", "Las Heras", "Maipú", "Luján de Cuyo", "San Martín"],
  "Misiones": ["Posadas", "Oberá", "Eldorado", "Puerto Iguazú", "Apóstoles"],
  "Neuquén": ["Neuquén", "Cutral Có", "Plottier", "San Martín de los Andes", "Zapala", "Villa La Angostura"],
  "Río Negro": ["Viedma", "San Carlos de Bariloche", "General Roca", "Cipolletti", "Villa Regina", "El Bolsón"],
  "Salta": ["Salta", "San Ramón de la Nueva Orán", "Tartagal", "Metán", "Cafayate"],
  "San Juan": ["San Juan", "Rivadavia", "Chimbas", "Rawson", "Pocito"],
  "San Luis": ["San Luis", "Villa Mercedes", "Merlo", "Concarán"],
  "Santa Cruz": ["Río Gallegos", "Caleta Olivia", "El Calafate", "Puerto Deseado", "Pico Truncado"],
  "Santa Fe": ["Santa Fe", "Rosario", "Rafaela", "Venado Tuerto", "Reconquista", "Villa Constitución", "San Lorenzo", "Casilda"],
  "Santiago del Estero": ["Santiago del Estero", "La Banda", "Termas de Río Hondo", "Añatuya"],
  "Tierra del Fuego": ["Ushuaia", "Río Grande", "Tolhuin"],
  "Tucumán": ["San Miguel de Tucumán", "Tafí Viejo", "Yerba Buena", "Concepción", "Aguilares", "Banda del Río Salí"],
};

// Intenta parsear un texto de ubicación libre (formato histórico "Ciudad,
// Provincia") en { provincia, ciudad, esOtra }. Si no matchea nada
// reconocible, devuelve provincia/ciudad vacías para caer al modo manual.
export function parsearUbicacion(texto) {
  if (!texto) return { provincia: "", ciudad: "", esOtra: false };
  const partes = texto.split(",").map((p) => p.trim()).filter(Boolean);
  const candidataProvincia = partes.length > 1 ? partes[partes.length - 1] : "";
  const candidataCiudad = partes.length > 1 ? partes.slice(0, -1).join(", ") : partes[0] || "";

  const provinciaMatch = PROVINCIAS_ARGENTINA.find(
    (p) => p.toLowerCase() === candidataProvincia.toLowerCase()
      || (candidataProvincia.toLowerCase() === "caba" && p === "Ciudad Autónoma de Buenos Aires")
  );
  if (!provinciaMatch) return { provincia: "", ciudad: "", esOtra: false };

  const ciudades = CIUDADES_POR_PROVINCIA[provinciaMatch] || [];
  const ciudadMatch = ciudades.find((c) => c.toLowerCase() === candidataCiudad.toLowerCase());
  if (ciudadMatch) return { provincia: provinciaMatch, ciudad: ciudadMatch, esOtra: false };
  return { provincia: provinciaMatch, ciudad: candidataCiudad, esOtra: true };
}
