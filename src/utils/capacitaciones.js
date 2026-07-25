// Resuelve el estado de acceso de un usuario a una capacitación con gating,
// según su tipo de acceso: "gratis" (todos), "paga" (pago único vía Mercado
// Pago) o "plan" (incluida desde cierto plan de PYME o membresía de candidato).
// La misma lógica de ranking de planes está espejada del lado del servidor
// (funciones `empresa_cumple_plan_minimo` / `candidato_cumple_plan_minimo` en
// Supabase) — esto es solo la versión de UI, el bloqueo real está en la RLS.

const RANK_EMPRESA = { basico: 0, avanzado: 1, premium: 2, platino: 3 };

export const NOMBRE_PLAN_EMPRESA = { avanzado: "Avanzado", premium: "Premium", platino: "Platino" };

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

// `integrante` es la fila propia de empresa_integrantes (con su id); `empresa`
// para role "integrante" debe ser la EMPRESA MADRE (de la que depende su
// plan), resuelta por quien llama accesoCapacitacion — no una empresa propia.
// Devuelve: { estado: "inscripto" | "gratis" | "incluida_en_plan" | "requiere_plan" | "pago_pendiente" | "requiere_pago", ... }
export function accesoCapacitacion(c, { role, empresa, candidato, integrante, pagos }) {
  const yaInscripto =
    (role === "candidato" && c.inscriptosCandidatos.includes(candidato?.id)) ||
    (role === "empresa" && c.inscriptosEmpresas.includes(empresa?.id)) ||
    (role === "integrante" && c.inscriptosIntegrantes.includes(integrante?.id));

  if (yaInscripto) return { estado: "inscripto" };

  const tipo = c.accesoTipo || "gratis";

  if (tipo === "gratis") return { estado: "gratis" };

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
    // Los integrantes de equipo no compran capacitaciones sueltas por su
    // cuenta en esta primera versión — solo acceden a las incluidas en el
    // plan de su empresa madre.
    if (role === "integrante") return { estado: "requiere_plan", planRequerido: null };
    // Nota: el beneficio "capacitaciones pagas incluidas" de la membresía
    // Desarrollo Profesional se resuelve del lado del servidor (edge function
    // crear-preferencia-pago), igual que la inclusión de mentorías por plan.
    // Acá seguimos mostrando el botón de compra normal; si corresponde, el
    // servidor aprueba sin cobrar y el estado pasa a "inscripto" tras refrescar.
    const entidadId = role === "empresa" ? empresa?.id : candidato?.id;
    const misPagos = (pagos || []).filter(
      (p) => p.tipo === "capacitacion" && p.planId === c.id && p.entidadId === entidadId
    );
    if (misPagos.some((p) => p.estado === "aprobado")) return { estado: "inscripto" };
    if (misPagos.some((p) => p.estado === "pendiente")) return { estado: "pago_pendiente" };
    return { estado: "requiere_pago", precio: precioEfectivo(c) };
  }

  return { estado: "gratis" };
}
