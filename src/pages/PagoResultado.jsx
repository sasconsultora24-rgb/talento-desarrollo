import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { Button } from "../components/ui.jsx";
import { useApp } from "../data/store.jsx";

const CONTENIDO = {
  success: {
    icon: CheckCircle2,
    color: "text-gold-600",
    titulo: "¡Pago recibido!",
    texto: "Estamos confirmando el pago con Mercado Pago. Tu plan se actualiza automáticamente en cuanto se confirme, normalmente en unos segundos.",
  },
  pending: {
    icon: Clock,
    color: "text-terracotta-500",
    titulo: "Pago pendiente",
    texto: "Tu pago está pendiente de confirmación (por ejemplo, si pagaste con efectivo o transferencia). En cuanto se acredite, tu plan se actualiza solo.",
  },
  failure: {
    icon: XCircle,
    color: "text-red-500",
    titulo: "El pago no se completó",
    texto: "No pudimos procesar el pago. No se te cobró nada. Podés intentarlo de nuevo desde tu panel.",
  },
};

export default function PagoResultado() {
  const [params] = useSearchParams();
  const { session, refresh } = useApp();
  const estado = params.get("estado") || "pending";
  const info = CONTENIDO[estado] || CONTENIDO.pending;
  const Icon = info.icon;
  const [refrescando, setRefrescando] = useState(true);

  useEffect(() => {
    if (estado !== "success") {
      setRefrescando(false);
      return;
    }
    const t = setTimeout(async () => {
      await refresh();
      setRefrescando(false);
    }, 3000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado]);

  const volverA = session.role === "empresa" ? "/empresa" : session.role === "candidato" ? "/candidato" : "/";

  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <Icon size={56} className={`mx-auto ${info.color}`} />
      <h1 className="text-2xl font-extrabold text-forest-900 mt-4">{info.titulo}</h1>
      <p className="text-forest-500 mt-3">{info.texto}</p>
      {refrescando && <p className="text-sm text-forest-400 mt-3">Actualizando tu plan...</p>}
      <Link to={volverA} className="inline-block mt-6">
        <Button>Volver a mi panel</Button>
      </Link>
    </div>
  );
}
