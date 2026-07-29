import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Card, Button, Field, Input, Textarea } from "./ui.jsx";
import { useApp } from "../data/store.jsx";
import { mensajeError } from "../utils/errores";
import { emailValido } from "../utils/validacion.js";

// Formulario para pedir un servicio que no se paga online (Propuesta Integral
// de selección, una fase que el plan ya incluye, o un servicio a medida).
// Funciona logueado y sin cuenta: si hay sesión de empresa, precarga los datos
// y vincula la solicitud a esa empresa para poder seguirla desde su panel.
export default function FormularioSolicitud({ servicio, titulo, onListo }) {
  const { session, empresas, crearSolicitudServicio } = useApp();
  // Para el rol "empresa", session.userId es el id de la fila de empresas
  // (no el del usuario de auth), así que se busca directo por id.
  const empresa = session.role === "empresa" ? empresas.find((e) => e.id === session.userId) : null;

  const [form, setForm] = useState({
    nombre: empresa?.contacto || "",
    email: empresa?.email || "",
    telefono: "",
    empresaNombre: empresa?.nombre || "",
    puesto: "",
    mensaje: "",
  });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [listo, setListo] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setError("");
    if (!form.nombre.trim()) return setError("Necesitamos tu nombre para poder responderte.");
    if (!emailValido(form.email)) return setError("Revisá el email: no parece válido.");

    setEnviando(true);
    try {
      await crearSolicitudServicio({
        servicio,
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        telefono: form.telefono.trim(),
        empresaNombre: form.empresaNombre.trim(),
        puesto: form.puesto.trim(),
        mensaje: form.mensaje.trim(),
        empresaId: empresa?.id || null,
      });
      setListo(true);
      if (onListo) onListo();
    } catch (err) {
      setError(mensajeError(err, "No pudimos registrar tu consulta. Probá de nuevo en un momento."));
    } finally {
      setEnviando(false);
    }
  }

  if (listo) {
    return (
      <Card className="p-6 border-2 border-gold-500">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="text-gold-600 shrink-0 mt-0.5" size={22} />
          <div>
            <h4 className="font-bold text-forest-900">Consulta registrada</h4>
            <p className="text-sm text-forest-600 mt-1 leading-relaxed">
              Te mandamos un acuse a <strong>{form.email}</strong>. Vas a recibir una propuesta
              concreta, con precio cerrado y plazos, dentro de las 48 horas hábiles.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h4 className="font-bold text-forest-900">{titulo}</h4>
      <p className="text-sm text-forest-500 mt-1 leading-relaxed">
        Contanos qué puesto necesitás cubrir y te devolvemos una propuesta con precio cerrado
        y plazos en 48 horas hábiles. No hace falta tener cuenta.
      </p>

      <form onSubmit={enviar} className="mt-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Tu nombre">
            <Input
              required
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>
          <Field label="Teléfono" hint="Opcional, agiliza el contacto">
            <Input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
          </Field>
          <Field label="Empresa">
            <Input
              value={form.empresaNombre}
              onChange={(e) => setForm({ ...form, empresaNombre: e.target.value })}
            />
          </Field>
        </div>
        <Field label="Puesto a cubrir" hint="Por ejemplo: Líder de Equipo, Encargado de Turno">
          <Input value={form.puesto} onChange={(e) => setForm({ ...form, puesto: e.target.value })} />
        </Field>
        <Field label="Contanos un poco más" hint="Opcional">
          <Textarea
            rows={3}
            value={form.mensaje}
            onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
            placeholder="Cuántas personas buscás, para cuándo lo necesitás, si ya intentaron la búsqueda antes..."
          />
        </Field>

        {error && <p className="text-sm text-terracotta-600 font-semibold">{error}</p>}

        <Button type="submit" variant="primary" disabled={enviando}>
          {enviando ? "Enviando..." : "Pedir propuesta"}
        </Button>
      </form>
    </Card>
  );
}
