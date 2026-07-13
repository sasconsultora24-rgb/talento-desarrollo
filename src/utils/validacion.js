// Validaciones compartidas de formularios (registro, edición de perfil, vacantes).
// Centralizadas acá para no repetir regex/reglas distintas en cada página.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
// Acepta dígitos, espacios, +, -, paréntesis. Entre 6 y 20 caracteres.
const TELEFONO_RE = /^[0-9+()\-\s]{6,20}$/;

export const CV_EXTENSIONES = [".pdf", ".doc", ".docx"];
export const CV_MAX_MB = 5;

export function emailValido(email) {
  return EMAIL_RE.test((email || "").trim());
}

// El teléfono es opcional en varios formularios: si viene vacío, se considera válido
// (la obligatoriedad la maneja el atributo `required` del input, no este validador).
export function telefonoValido(telefono) {
  const valor = (telefono || "").trim();
  if (!valor) return true;
  return TELEFONO_RE.test(valor);
}

export function archivoValido(file, { maxMB = CV_MAX_MB, extensiones = CV_EXTENSIONES } = {}) {
  if (!file) return { valido: true };
  const nombre = file.name.toLowerCase();
  const extensionOk = extensiones.some((ext) => nombre.endsWith(ext));
  if (!extensionOk) {
    return { valido: false, error: `Formato no permitido. Usá: ${extensiones.join(", ")}` };
  }
  if (file.size > maxMB * 1024 * 1024) {
    return { valido: false, error: `El archivo supera los ${maxMB}MB.` };
  }
  return { valido: true };
}
