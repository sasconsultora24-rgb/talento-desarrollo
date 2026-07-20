// Traduce errores técnicos (Supabase Auth / Postgres / red) a mensajes que
// explican la causa real, en vez de un genérico "algo salió mal, probá de
// nuevo". Cuando no reconoce el error, devuelve el "fallback" que pasa cada
// pantalla (una frase específica de esa acción, no un genérico compartido).
export function mensajeError(err, fallback) {
  const msg = err?.message || "";

  if (/already registered|already exists|duplicate key|23505/i.test(msg)) {
    return "Ese email ya está registrado. Probá ingresar en vez de crear una cuenta nueva.";
  }
  if (/invalid login/i.test(msg)) {
    return "Email o contraseña incorrectos.";
  }
  if (/email not confirmed/i.test(msg)) {
    return "Todavía no confirmaste tu email. Revisá tu casilla de correo (y la carpeta de spam).";
  }
  if (/password.*(at least|should be|weak)/i.test(msg)) {
    return "La contraseña es muy corta o muy débil. Usá al menos 8 caracteres.";
  }
  if (/rate limit|too many requests|only request this after/i.test(msg)) {
    return "Hiciste varios intentos seguidos. Esperá un minuto y probá de nuevo.";
  }
  if (/failed to fetch|network|ERR_INTERNET|ERR_CONNECTION/i.test(msg)) {
    return "No pudimos conectar. Revisá tu conexión a internet y probá de nuevo.";
  }
  if (/jwt expired|invalid.*token|session.*(expired|missing)/i.test(msg)) {
    return "Tu sesión expiró. Volvé a ingresar.";
  }
  if (/email.*invalid|invalid.*email/i.test(msg)) {
    return "Ese email no es válido.";
  }

  return fallback;
}
