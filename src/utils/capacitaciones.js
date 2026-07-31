// Resuelve el estado de acceso de un usuario a una capacitación con gating,
// según su tipo de acceso: "gratis" (todos), "paga" (pago único vía Mercado
// Pago) o "plan" (incluida desde cierto plan de PYME o membresía de candidato).
// La misma lógica de ranking de planes está espejada del lado del servidor
// (funciones `empresa_cumple_plan_minimo` / `candidato_cumple_plan_minimo` en
// Supabase) — esto es solo la versión de UI, el bloqueo real está en la RLS.

const RANK_EMPRESA = { basico: 0, avanzado: 1, premium: 2, platino: 3 };

export const NOMBRE_PLAN_EMPRESA = { avanzado: "Avanzado", premium: "Premium", platino: "Platino" };

// Un ebook o guía en PDF no se "inscribe": se descarga. La inscripción se
// registra igual por detrás (así el perfil queda en la base y sale el email con
// el enlace), pero para la persona el botón dice "Descargar" y el archivo se
// abre en el momento. Sin esto, quien ya se había inscripto veía "Ya estás
// inscripto" y se quedaba sin forma de abrir el material.
export const MODALIDAD_MATERIAL = "Material descargable";

export function esMaterialDescargable(capacitacion) {
  return capacitacion?.modalidad === MODALIDAD_MATERIAL;
}

// Abre el material o la sala en una pestaña nueva. El rel evita que la página
// destino pueda manipular la nuestra a través de window.opener.
export function abrirEnlaceAcceso(url) {
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
}

export function empresaCumplePlanMinimo(empresa, planMinimo) {
  if (!planMinimo || !empresa) return false;
  if (!empresa.planVencimiento || new Date(empresa.planVencimiento) < new Date()) return false;
  const rankActual = RANK_EMPRESA[empresa.plan] ?? -1;
  const rankRequerido = RANK_EMPRESA[planMinimo] ?? 99;
  return rankActual >= rankRequerido;
}

export function candidatoCumplePlanMinimo(candidato, planMinimo) {
  if (!planMinimo) return true; // sin requisito para candidatos
  if (!candidato || candidato.membresia !== "premium") return false;
  if (!candidato.membresiaVencimiento) return false;
  return new Date(candidato.membresiaVencimiento) >= new Date();
}

// Un candidato con membresía Desarrollo Profesional (premium) vigente tiene
// incluido el acceso a las capacitaciones pagas de a una, sin pagar cada una.
export function candidatoEsPremiumVigente(candidato) {
  if (!candidato || candidato.membresia !== "premium") return false;
  if (!candidato.membresiaVencimiento) return false;
  return new Date(candidato.membresiaVencimiento) >= new Date();
}

// Precio y cupos vigentes hoy: si hay precio/cupos promocional y todavía no
// pasó la fecha límite (inclusive), rige la promo; si no, el valor normal.
export function precioEfectivo(c) {
  if (c.precioPromocional != null && c.promocionHasta) {
    const hoy = new Date().toISOString().slice(0, 10);
    if (hoy <= c.promocionHasta) return Number(c.precioPromocional);
  }
  return c.precio != null ? Number(c.precio) : null;
}

// Precio en USD vigente hoy (valor exacto cargado por el admin, no una
// conversión automática de precioEfectivo). Puede ser null si no se cargó.
export function precioUsdEfectivo(c) {
  if (c.precioPromocionalUsd != null && c.promocionHasta) {
    const hoy = new Date().toISOString().slice(0, 10);
    if (hoy <= c.promocionHasta) return Number(c.precioPromocionalUsd);
  }
  return c.precioUsd != null ? Number(c.precioUsd) : null;
}

export function cuposEfectivos(c) {
  if (c.cuposPromocional != null && c.promocionHasta) {
    const hoy = new Date().toISOString().slice(0, 10);
    if (hoy <= c.promocionHasta) return c.cuposPromocional;
  }
  return c.cupos;
}

export function enPeriodoPromocional(c) {
  if (c.precioPromocional == null || !c.promocionHasta) return false;
  const hoy = new Date().toISOString().slice(0, 10);
  return hoy <= c.promocionHasta;
}

const DIA_MS = 24 * 60 * 60 * 1000;

// Cuántos materiales "con ritmo" van desbloqueados a hoy para quien se
// registró en fechaRegistro: el 1° desde el día 0, el 2° a los 30 días, el 3°
// a los 60, etc. Espejo exacto de orden_desbloqueado() en Supabase — el
// bloqueo real está en esa función vía RLS, esto es solo para la UI.
export function ordenDesbloqueado(fechaRegistro) {
  if (!fechaRegistro) return Infinity;
  const dias = (Date.now() - new Date(fechaRegistro).getTime()) / DIA_MS;
  return Math.floor(dias / 30) + 1;
}

// Fecha (YYYY-MM-DD) en la que se desbloquea un orden dado, a partir de la
// fecha de registro. Solo para mostrarla en la UI ("disponible el ...").
export function fechaDesbloqueo(fechaRegistro, orden) {
  if (!fechaRegistro) return null;
  const base = new Date(fechaRegistro).getTime();
  return new Date(base + (orden - 1) * 30 * DIA_MS).toISOString().slice(0, 10);
}

// `integrante` es la fila propia de empresa_integrantes (con su id); `empresa`
// para role "integrante" debe ser la EMPRESA MADRE (de la que depende su
// plan), resuelta por quien llama accesoCapacitacion — no una empresa propia.
// Devuelve: { estado: "inscripto" | "gratis" | "incluida_en_plan" | "requiere_plan" | "pago_pendiente" | "requiere_pago" | "bloqueado_ritmo", ... }
export function accesoCapacitacion(c, { role, empresa, candidato, integrante, pagos }) {
  const yaInscripto =
    (role === "candidato" && c.inscriptosCandidatos.includes(candidato?.id)) ||
    (role === "empresa" && c.inscriptosEmpresas.includes(empresa?.id)) ||
    (role === "integrante" && c.inscriptosIntegrantes.includes(integrante?.id));

  if (yaInscripto) return { estado: "inscripto" };

  const tipo = c.accesoTipo || "gratis";

  if (tipo === "gratis") {
    // Los materiales gratis con "orden" asignado se liberan de a uno por mes
    // (ver ordenDesbloqueado arriba) para que no se puedan bajar los 8 juntos.
    // Sin "orden" (o tipo distinto de material descargable) siguen sin límite.
    if (c.orden != null && esMaterialDescargable(c)) {
      // Para "integrante" la fecha propia es fechaAlta (su alta en el equipo),
      // no la de la empresa madre — así cada persona tiene su propio ritmo.
      const fechaRegistro =
        role === "candidato" ? candidato?.fechaRegistro
        : role === "integrante" ? integrante?.fechaAlta
        : role === "empresa" ? empresa?.fechaRegistro
        : null;
      if (!fechaRegistro) return { estado: "gratis" }; // sin sesión: se resuelve al registrarse
      if (c.orden > ordenDesbloqueado(fechaRegistro)) {
        return { estado: "bloqueado_ritmo", fechaDesbloqueo: fechaDesbloqueo(fechaRegistro, c.orden) };
      }
    }
    return { estado: "gratis" };
  }

  if (tipo === "plan") {
    if (role === "empresa" || role === "integrante") {
      // Un integrante hereda el plan de su empresa madre (el parámetro
      // `empresa` recibido acá ya es esa empresa madre, no la suya propia).
      const cumple = empresaCumplePlanMinimo(empresa, c.planMinimoEmpresa);
      return cumple
        ? { estado: "incluida_en_plan" }
        : { estado: "requiere_plan", planRequerido: c.planMinimoEmpresa };
    }
    if (role === "candidato") {
      // Si la capacitación no tiene un requisito específico para candidatos
      // (plan_minimo_candidato vacío), el gating es solo para PYMEs — el
      // candidato accede gratis, igual que antes de este cambio.
      if (!c.planMinimoCandidato) return { estado: "gratis" };
      const cumple = candidatoCumplePlanMinimo(candidato, c.planMinimoCandidato);
      return cumple
        ? { estado: "incluida_en_plan" }
        : { estado: "requiere_plan", planRequerido: "premium" };
    }
    return { estado: "requiere_plan", planRequerido: null };
  }

  if (tipo === "paga") {
    // Nota: el beneficio "capacitaciones pagas incluidas" se resuelve del lado
    // del servidor (edge function crear-preferencia-pago) — cada persona
    // (candidato Premium, empresa dueña, o cada integrante de equipo según el
    // plan de su empresa madre) tiene su propio cupo mensual individual. Acá
    // seguimos mostrando el botón de compra normal; si corresponde, el
    // servidor aprueba sin cobrar y el estado pasa a "inscripto" tras refrescar.
    const entidadId = role === "empresa" ? empresa?.id : role === "integrante" ? integrante?.id : candidato?.id;
    const misPagos = (pagos || []).filter(
      (p) => p.tipo === "capacitacion" && p.planId === c.id && p.entidadId === entidadId
    );
    if (misPagos.some((p) => p.estado === "aprobado")) return { estado: "inscripto" };
    if (misPagos.some((p) => p.estado === "pendiente")) return { estado: "pago_pendiente" };
    return { estado: "requiere_pago", precio: precioEfectivo(c) };
  }

  return { estado: "gratis" };
}
