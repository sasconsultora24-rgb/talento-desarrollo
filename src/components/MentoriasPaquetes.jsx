import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Clock, Compass } from "lucide-react";
import { useApp } from "../data/store.jsx";
import { Card, Badge, Button } from "./ui.jsx";
import { MENTORIA_PAQUETES, formatoPesos } from "../data/mentoriaPaquetes.js";

// Mentorías personalizadas: 2 paquetes fijos de acompañamiento 1 a 1 (no un
// listado de mentores), comprables por cualquier candidato o empresa
// registrado, a un precio especial solo por estar registrado en la plataforma.
// Se usa como sección dentro de Capacitaciones y también en los paneles.
export default function MentoriasPaquetes({ titulo = "Mentorías personalizadas", mostrarIntro = true }) {
  const { session, pagos, iniciarPago, empresas } = useApp();
  const navigate = useNavigate();
  const [comprando, setComprando] = useState(null);
  const [error, setError] = useState("");

  const puedeComprar = session.role === "candidato" || session.role === "empresa";
  const empresaActual = session.role === "empresa" ? empresas.find((e) => e.id === session.userId) : null;
  const mentoriasIncluidasEnPlan =
    empresaActual?.plan === "platino"
      ? "Tu plan Platino incluye mentorías ilimitadas, sin costo adicional."
      : empresaActual?.plan === "premium"
      ? "Tu plan Premium incluye 1 mentoría sin costo por período. Las siguientes se cobran al precio de socio."
      : null;

  async function handleComprar(paqueteId) {
    if (!puedeComprar) {
      navigate("/registro");
      return;
    }
    setError("");
    setComprando(paqueteId);
    try {
      const resultado = await iniciarPago("mentoria", paqueteId);
      if (resultado.incluido) {
        setComprando(null);
        return;
      }
      window.location.href = resultado.initPoint;
    } catch (err) {
      setError(err.message || "No se pudo iniciar el pago.");
      setComprando(null);
    }
  }

  function estadoCompra(paqueteId) {
    if (!puedeComprar) return null;
    const misPagos = pagos.filter(
      (p) => p.tipo === "mentoria" && p.planId === paqueteId && p.entidadId === session.userId
    );
    const aprobado = misPagos.find((p) => p.estado === "aprobado");
    if (aprobado) return Number(aprobado.monto) === 0 ? "incluido" : "aprobado";
    if (misPagos.some((p) => p.estado === "pendiente")) return "pendiente";
    return null;
  }

  return (
    <div>
      {mostrarIntro && (
        <div className="mb-8">
          <div className="text-gold-600 font-bold text-xs uppercase tracking-wider mb-2 inline-flex items-center gap-1.5">
            <Compass size={14} /> Acompañamiento 1 a 1
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-forest-900">{titulo}</h2>
          <p className="text-forest-500 mt-2 max-w-2xl leading-relaxed">
            No son sesiones con un mentor a elección: son 2 procesos de acompañamiento individual, a precio
            especial por estar registrado en Talento &amp; Desarrollo — sin importar si sos candidato o PYME.
          </p>
        </div>
      )}

      {mentoriasIncluidasEnPlan && (
        <div className="mb-4 text-sm text-gold-700 bg-gold-50 border border-gold-100 rounded-lg px-4 py-2">
          {mentoriasIncluidasEnPlan}
        </div>
      )}

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2">{error}</div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {MENTORIA_PAQUETES.map((p) => {
          const estado = estadoCompra(p.id);
          return (
            <Card key={p.id} className="p-6 flex flex-col">
              <Badge tone="gold">{p.sesiones} sesiones</Badge>
              <h3 className="text-xl font-extrabold text-forest-900 mt-3">{p.nombre}</h3>
              <p className="text-sm font-semibold text-forest-700 mt-1">{p.tagline}</p>
              <p className="text-sm text-forest-500 mt-3 leading-relaxed flex-1">{p.descripcion}</p>
              <p className="text-sm text-forest-800 font-semibold italic mt-3">"{p.frase}"</p>
              <p className="text-xs text-forest-400 mt-2">{p.ideal}</p>

              <div className="mt-5 pt-4 border-t border-forest-100">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-forest-900">{formatoPesos(p.precioSocio)}</span>
                  <span className="text-sm text-forest-400 line-through">{formatoPesos(p.precioLista)}</span>
                </div>
                <p className="text-xs text-gold-600 font-semibold mt-0.5">Precio especial por estar registrado</p>
              </div>

              <div className="mt-4">
                {estado === "incluido" ? (
                  <span className="inline-flex items-center gap-1.5 text-gold-600 text-sm font-semibold">
                    <CheckCircle2 size={18} /> Incluida en tu plan — te contactamos para coordinar
                  </span>
                ) : estado === "aprobado" ? (
                  <span className="inline-flex items-center gap-1.5 text-gold-600 text-sm font-semibold">
                    <CheckCircle2 size={18} /> Ya compraste este paquete — te contactamos para coordinar
                  </span>
                ) : estado === "pendiente" ? (
                  <span className="inline-flex items-center gap-1.5 text-terracotta-500 text-sm font-semibold">
                    <Clock size={18} /> Pago pendiente de confirmación
                  </span>
                ) : (
                  <Button
                    className="w-full"
                    disabled={comprando === p.id}
                    onClick={() => handleComprar(p.id)}
                  >
                    {comprando === p.id
                      ? "Redirigiendo a Mercado Pago..."
                      : puedeComprar
                      ? "Comprar este paquete"
                      : "Registrarme para acceder"}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
      <p className="text-xs text-forest-400 mt-6">
        El pago se procesa con Mercado Pago. Después de la confirmación, nos contactamos para coordinar día y
        horario de tus sesiones.
      </p>
    </div>
  );
}
