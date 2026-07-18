// Un candidato tiene beneficios premium activos solo si su membresía está
// marcada "premium" Y todavía no venció. Si el pago no se renovó, la fila
// puede seguir diciendo "premium" (el downgrade automático no está
// implementado todavía) pero acá se verifica la vigencia real, no solo el
// texto guardado — así los beneficios (prioridad en el buscador y en las
// postulaciones) dejan de aplicar apenas vence, sin depender de un cron.
export function candidatoPremiumActivo(candidato) {
  if (!candidato || candidato.membresia !== "premium") return false;
  if (!candidato.membresiaVencimiento) return false;
  return new Date(candidato.membresiaVencimiento) >= new Date();
}
