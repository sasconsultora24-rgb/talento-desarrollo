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

// Devuelve: { estado: "inscripto" | "gratis" | "incluida_en_plan" | "requiere_plan" | "pago_pendiente" | "requiere_pago", ... }
export function accesoCapacitacion(c, { role, empresa, candidato, pagos }) {
  const yaInscripto =
    (role === "candidato" && c.inscriptosCandidatos.includes(candidato?.id)) ||
    (role === "empresa" && c.inscriptosEmpresas.includes(empresa?.id));

  if (yaInscripto) return { estado: "inscripto" };

  const tipo = c.accesoTipo || "gratis";

  if (tipo === "gratis") return { estado: "gratis" };

  if (tipo === "plan") {
    if (role === "empresa") {
      const cumple = empresaCumplePlanMinimo(empresa, c.planMinimoEmpresa);
      return cumple
        ? { estado: "incluida_en_plan" }
        : { estado: "requiere_plan", planRequerido: c.planMinimoEmpresa };
    }
    if (role === "candidato") {
      const cumple = c.planMinimoCandidato ? candidatoCumplePlanMinimo(candidato, c.planMinimoCandidato) : false;
      return cumple
        ? { estado: "incluida_en_plan" }
        : { estado: "requiere_plan", planRequerido: c.planMinimoCandidato ? "premium" : null };
    }
    return { estado: "requiere_plan", planRequerido: null };
  }

  if (tipo === "paga") {
    const entidadId = role === "empresa" ? empresa?.id : candidato?.id;
    const misPagos = (pagos || []).filter(
      (p) => p.tipo === "capacitacion" && p.planId === c.id && p.entidadId === entidadId
    );
    if (misPagos.some((p) => p.estado === "aprobado")) return { estado: "inscripto" };
    if (misPagos.some((p) => p.estado === "pendiente")) return { estado: "pago_pendiente" };
    return { estado: "requiere_pago", precio: c.precio };
  }

  return { estado: "gratis" };
}
