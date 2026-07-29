// Motor de afinidad automático entre un postulante y una vacante.
//
// Problema que resuelve: hasta ahora la PYME recibía todas las postulaciones
// mezcladas y sin ninguna señal de si la persona encajaba, así que tenía que
// abrir CV por CV. Acá se calcula un puntaje 0-100 con los datos que ya
// tenemos cargados (no requiere migración ni intervención manual) y se explica
// SIEMPRE por qué dio ese número, para que la PYME pueda desconfiar del
// puntaje cuando corresponda en vez de tratarlo como un veredicto.
//
// Importante: el puntaje ORDENA y ORIENTA, no descarta. Ninguna postulación se
// esconde: una persona con puntaje bajo puede ser igual la indicada y la PYME
// la sigue viendo. Por eso los pesos son deliberadamente simples y auditables.

import { parsearUbicacion } from "../data/geografiaArgentina.js";

const PESOS = {
  requisitos: 45,
  nivel: 25,
  ubicacion: 20,
  disponibilidad: 10,
};

// Quita acentos y pasa a minúscula, para que "Producción" matchee "produccion".
function normalizar(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// Palabras vacías que no aportan al match y ensucian la comparación.
const VACIAS = new Set([
  "de", "del", "la", "el", "los", "las", "y", "o", "en", "con", "para", "por",
  "un", "una", "al", "a", "que", "su", "sus", "sobre", "como", "mas", "muy",
  "experiencia", "manejo", "conocimiento", "conocimientos", "nivel",
]);

function palabras(texto) {
  return normalizar(texto)
    .split(/[^a-z0-9ñ+#.]+/)
    .filter((p) => p.length > 2 && !VACIAS.has(p));
}

// Un requisito se considera cubierto si alguna de sus palabras significativas
// aparece en el perfil del candidato (habilidades, título o resumen).
function requisitoCubierto(requisito, textoPerfil, palabrasPerfil) {
  const req = normalizar(requisito);
  if (!req) return false;
  // Coincidencia literal de la frase completa: la señal más fuerte.
  if (textoPerfil.includes(req)) return true;
  const claves = palabras(requisito);
  if (claves.length === 0) return false;
  const cubiertas = claves.filter((c) => palabrasPerfil.has(c)).length;
  // Con más de la mitad de las palabras clave del requisito presentes ya lo
  // damos por cubierto: exigir el 100% castiga redacciones distintas del mismo
  // requisito ("manejo de equipos" vs "liderazgo de equipos").
  return cubiertas / claves.length > 0.5;
}

const ORDEN_NIVEL = ["junior", "semi senior", "senior"];

function puntajeNivel(nivelCandidato, nivelVacante) {
  const c = ORDEN_NIVEL.indexOf(normalizar(nivelCandidato));
  const v = ORDEN_NIVEL.indexOf(normalizar(nivelVacante));
  if (c === -1 || v === -1) return { ratio: 0.5, detalle: "Nivel sin especificar" };
  if (c === v) return { ratio: 1, detalle: `Nivel ${nivelVacante}: coincide` };
  if (c > v) {
    // Sobrecalificado: sigue siendo apto, pero puede pedir más sueldo o irse.
    return { ratio: 0.7, detalle: `Nivel ${nivelCandidato} por encima del buscado` };
  }
  const distancia = v - c;
  return {
    ratio: distancia === 1 ? 0.4 : 0.1,
    detalle: `Nivel ${nivelCandidato} por debajo del buscado`,
  };
}

function puntajeUbicacion(candidato, vacante) {
  if (normalizar(vacante.modalidad) === "remoto") {
    return { ratio: 1, detalle: "Vacante remota: la ubicación no limita" };
  }
  const crudaC = normalizar(candidato.ubicacion);
  const crudaV = normalizar(vacante.ubicacion);
  // Atajo para perfiles viejos cargados a mano ("Córdoba Capital", sin coma):
  // si el texto es idéntico, es la misma ciudad aunque no se pueda parsear.
  if (crudaC && crudaC === crudaV) {
    return { ratio: 1, detalle: `Vive en ${vacante.ubicacion}` };
  }

  const uc = parsearUbicacion(candidato.ubicacion || "");
  const uv = parsearUbicacion(vacante.ubicacion || "");
  if (!uc.provincia || !uv.provincia) {
    return { ratio: 0.5, detalle: "Ubicación sin provincia cargada" };
  }
  const mismaProvincia = normalizar(uc.provincia) === normalizar(uv.provincia);
  const mismaCiudad = mismaProvincia && normalizar(uc.ciudad) === normalizar(uv.ciudad);
  if (mismaCiudad) return { ratio: 1, detalle: `Vive en ${vacante.ubicacion}` };
  if (mismaProvincia) {
    return { ratio: 0.6, detalle: `Misma provincia, otra localidad (${uc.ciudad || "s/d"})` };
  }
  return { ratio: 0.1, detalle: `Vive en otra provincia (${uc.provincia})` };
}

function puntajeDisponibilidad(candidato, vacante) {
  const disp = normalizar(candidato.disponibilidad);
  const mod = normalizar(vacante.modalidad);
  if (!disp) return { ratio: 0.5, detalle: "Disponibilidad sin especificar" };
  if (mod === "remoto" || disp.includes("full")) {
    return { ratio: 1, detalle: `Disponibilidad ${candidato.disponibilidad}` };
  }
  return { ratio: 0.6, detalle: `Disponibilidad ${candidato.disponibilidad}` };
}

/**
 * Calcula la afinidad entre un candidato y una vacante.
 * @returns {{puntaje:number, nivel:string, motivos:Array<{ok:boolean,texto:string}>,
 *            requisitosCubiertos:string[], requisitosFaltantes:string[]}}
 */
export function calcularAfinidad(candidato, vacante) {
  if (!candidato || !vacante) {
    return {
      puntaje: 0,
      nivel: "sin datos",
      motivos: [],
      requisitosCubiertos: [],
      requisitosFaltantes: [],
    };
  }

  const textoPerfil = normalizar(
    [
      (candidato.habilidades || []).join(" "),
      candidato.titulo,
      candidato.resumen,
      (candidato.experiencia || []).map((e) => `${e.rol || ""} ${e.empresa || ""}`).join(" "),
    ].join(" ")
  );
  const palabrasPerfil = new Set(palabras(textoPerfil));

  const requisitos = (vacante.requisitos || []).filter(Boolean);
  const cubiertos = [];
  const faltantes = [];
  requisitos.forEach((r) => {
    if (requisitoCubierto(r, textoPerfil, palabrasPerfil)) cubiertos.push(r);
    else faltantes.push(r);
  });

  // Si la vacante no cargó requisitos no podemos premiar ni castigar: se toma
  // como neutro (0.5) para no inflar artificialmente el puntaje.
  const ratioRequisitos = requisitos.length === 0 ? 0.5 : cubiertos.length / requisitos.length;

  const nivel = puntajeNivel(candidato.nivel, vacante.nivel);
  const ubic = puntajeUbicacion(candidato, vacante);
  const disp = puntajeDisponibilidad(candidato, vacante);

  const puntaje = Math.round(
    ratioRequisitos * PESOS.requisitos +
      nivel.ratio * PESOS.nivel +
      ubic.ratio * PESOS.ubicacion +
      disp.ratio * PESOS.disponibilidad
  );

  const motivos = [
    {
      ok: ratioRequisitos >= 0.6,
      texto:
        requisitos.length === 0
          ? "La vacante no tiene requisitos cargados"
          : `Cumple ${cubiertos.length} de ${requisitos.length} requisitos`,
    },
    { ok: nivel.ratio >= 0.7, texto: nivel.detalle },
    { ok: ubic.ratio >= 0.6, texto: ubic.detalle },
    { ok: disp.ratio >= 0.6, texto: disp.detalle },
  ];

  return {
    puntaje,
    nivel: etiquetaAfinidad(puntaje),
    motivos,
    requisitosCubiertos: cubiertos,
    requisitosFaltantes: faltantes,
  };
}

export function etiquetaAfinidad(puntaje) {
  if (puntaje >= 75) return "alta";
  if (puntaje >= 50) return "media";
  return "baja";
}

export const TONO_AFINIDAD = {
  alta: "gold",
  media: "terracotta",
  baja: "gray",
  "sin datos": "gray",
};
