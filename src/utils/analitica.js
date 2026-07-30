import { supabase } from "../data/supabaseClient.js";

// Analítica propia, sin cookies ni terceros.
//
// Por qué no Google Analytics: guardaría datos de tus visitantes en un tercero,
// obligaría a poner cartel de consentimiento, y para el volumen de esta
// plataforma no aporta nada que no se pueda resolver con una tabla propia.
//
// Qué se guarda: el tipo de evento, la ruta, de dónde venía la visita y el rol
// de la sesión (empresa / candidato / anónimo). NO se guarda IP, ni nombre, ni
// email, ni ningún identificador que permita seguir a una persona entre
// visitas. Por eso no hace falta pedir consentimiento.

// Rutas que nunca se registran: pueden llevar tokens en la query.
const RUTAS_SENSIBLES = ["/recuperar", "/pago/resultado"];

// Deja solo la ruta del hash, sin query string, para no guardar nunca un token
// ni un parámetro con datos.
function rutaLimpia() {
  const hash = window.location.hash || "";
  const sinHash = hash.startsWith("#") ? hash.slice(1) : hash;
  return sinHash.split("?")[0] || "/";
}

// El referrer se recorta al dominio: alcanza para saber de dónde llega la
// gente (Google, Instagram, LinkedIn) sin guardar la URL completa que visitó.
function dominioReferrer() {
  try {
    if (!document.referrer) return null;
    const url = new URL(document.referrer);
    if (url.hostname === window.location.hostname) return null;
    return url.hostname;
  } catch {
    return null;
  }
}

/**
 * Registra un evento. Nunca bloquea ni rompe la UI: si falla, se ignora.
 * @param {string} tipo  "pageview" | "registro_completado" | "pago_iniciado" | ...
 * @param {object} extra { rol, meta }
 */
export function registrarEvento(tipo, extra = {}) {
  try {
    const ruta = extra.ruta ?? rutaLimpia();
    if (RUTAS_SENSIBLES.some((r) => ruta.startsWith(r))) return;

    // Fire and forget: no se hace await a propósito, para no demorar la
    // interacción del usuario por una métrica.
    supabase
      .from("eventos")
      .insert({
        tipo,
        ruta,
        referrer: dominioReferrer(),
        rol: extra.rol || null,
        meta: extra.meta || null,
      })
      .then(({ error }) => {
        if (error) console.debug("No se pudo registrar el evento", tipo, error.message);
      });
  } catch (err) {
    console.debug("Error registrando evento", err);
  }
}
