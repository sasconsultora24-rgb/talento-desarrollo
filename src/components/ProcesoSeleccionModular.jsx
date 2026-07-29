import { useState } from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { Card, Button, Badge } from "./ui.jsx";
import {
  FASES_SELECCION,
  PAQUETE_INTEGRAL,
  FORMA_PAGO_MODULAR,
  totalFasesSueltas,
  ahorroIntegral,
} from "../data/procesoSeleccion.js";
import { formatoPesos } from "../data/mentoriaPaquetes.js";
import { NOMBRE_PLAN_EMPRESA } from "../utils/capacitaciones.js";
import { useApp } from "../data/store.jsx";
import { mensajeError } from "../utils/errores";
import FormularioSolicitud from "./FormularioSolicitud.jsx";

// Servicio de Selección a medida, en sus dos formatos:
//
//  - Fases sueltas: se pagan por Mercado Pago, una por una, al inicio de cada
//    fase contratada (igual que en la propuesta comercial en papel).
//  - Propuesta Integral: NO se cobra online, porque se abona 50% al inicio y
//    50% al finalizar, y conviene acordar el alcance antes de cobrar. Entra
//    como solicitud registrada, que se sigue desde el panel de admin.
//
// Si el plan de la PYME ya incluye una fase, no se le cobra: el botón pasa a
// ser una solicitud para coordinarla.
export default function ProcesoSeleccionModular({ planEmpresa = null, mostrarCta = true }) {
  const { session, iniciarPago } = useApp();
  const esEmpresa = session.role === "empresa";
  const ahorro = ahorroIntegral();

  const [pagando, setPagando] = useState(null);
  const [error, setError] = useState("");
  // Qué formulario de solicitud está abierto: "integral" o el id de una fase.
  const [solicitando, setSolicitando] = useState(null);

  async function contratarFase(faseId) {
    setError("");
    setPagando(faseId);
    try {
      await iniciarPago("fase_seleccion", faseId);
    } catch (err) {
      setError(mensajeError(err, "No se pudo iniciar el pago de la fase."));
    } finally {
      setPagando(null);
    }
  }

  return (
    <div>
      {/* PROPUESTA INTEGRAL */}
      <Card className="p-6 md:p-8 border-2 border-gold-500 shadow-soft mb-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Badge tone="gold">Recomendado</Badge>
            <h3 className="text-2xl font-extrabold text-forest-900 mt-3">{PAQUETE_INTEGRAL.nombre}</h3>
            <p className="text-sm text-forest-500 leading-relaxed mt-2 max-w-2xl">
              {PAQUETE_INTEGRAL.resumen}
            </p>
            <ul className="mt-5 grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
              {PAQUETE_INTEGRAL.incluye.map((linea) => (
                <li key={linea} className="flex items-start gap-2 text-sm text-forest-600">
                  <Check size={16} className="text-gold-500 mt-0.5 shrink-0" />
                  {linea}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-forest-50/70 border border-forest-100 p-5 flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider text-forest-500">Desde</span>
            <div className="text-3xl font-extrabold text-forest-900 mt-1">
              {formatoPesos(PAQUETE_INTEGRAL.precio)}
            </div>
            <p className="text-xs text-forest-400 mt-1">por búsqueda</p>
            {ahorro > 0 ? (
              <p className="text-xs text-gold-700 font-semibold mt-3">
                {formatoPesos(ahorro)} menos que contratar las 4 fases por separado
                ({formatoPesos(totalFasesSueltas())}).
              </p>
            ) : (
              <p className="text-xs text-forest-500 mt-3 leading-relaxed">
                Mismo valor que las 4 fases por separado ({formatoPesos(totalFasesSueltas())}),
                pero con la negociación de la oferta incluida y un solo plazo cerrado.
              </p>
            )}
            <dl className="mt-4 space-y-2 text-xs text-forest-500">
              <div>
                <dt className="font-bold text-forest-600">Duración</dt>
                <dd>{PAQUETE_INTEGRAL.duracion}</dd>
              </div>
              <div>
                <dt className="font-bold text-forest-600">Forma de pago</dt>
                <dd>{PAQUETE_INTEGRAL.formaPago}</dd>
              </div>
            </dl>
            <div className="mt-auto pt-5">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => setSolicitando(solicitando === "integral" ? null : "integral")}
              >
                {solicitando === "integral" ? "Cerrar" : "Pedir esta propuesta"}
              </Button>
              <p className="text-xs text-forest-400 mt-2 leading-relaxed">
                Se acuerda el alcance antes de cobrar. El pago va 50% al inicio y 50% al final,
                por transferencia o factura.
              </p>
            </div>
          </div>
        </div>

        {solicitando === "integral" && (
          <div className="mt-6 pt-6 border-t border-forest-100">
            <FormularioSolicitud
              servicio="integral"
              titulo="Pedir la Propuesta Integral de Selección"
            />
          </div>
        )}
      </Card>

      {/* PROPUESTA MODULAR */}
      <div className="mb-5">
        <h3 className="text-xl font-extrabold text-forest-900">O contratá solo las fases que necesitás</h3>
        <p className="text-sm text-forest-500 mt-1 max-w-3xl leading-relaxed">
          Si tu equipo ya resuelve parte del proceso, tomá únicamente las etapas donde te hace
          falta ayuda. {FORMA_PAGO_MODULAR}, y las podés pagar directo desde acá.
        </p>
      </div>

      {error && (
        <p className="text-sm text-terracotta-600 font-semibold mb-4">{error}</p>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {FASES_SELECCION.map((f) => {
          const incluida = planEmpresa && f.incluidaEn.includes(planEmpresa);
          return (
            <Card
              key={f.id}
              className={`p-5 flex flex-col ${incluida ? "border-2 border-gold-400 bg-gold-50/30" : ""}`}
            >
              <span className="text-xs font-bold uppercase tracking-wider text-gold-600">
                Fase {f.numero}
              </span>
              <h4 className="font-bold text-forest-900 mt-1 mb-2 leading-snug">{f.nombre}</h4>
              <p className="text-xs text-forest-500 leading-relaxed mb-3">{f.resumen}</p>
              <ul className="space-y-1.5 flex-1">
                {f.incluye.map((i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-forest-600">
                    <Check size={13} className="text-gold-500 mt-0.5 shrink-0" />
                    {i}
                  </li>
                ))}
              </ul>

              <div className="mt-4 pt-4 border-t border-forest-100">
                {incluida ? (
                  <>
                    <Badge tone="gold">Ya incluida en tu plan</Badge>
                    <Button
                      variant="outline"
                      className="w-full mt-3"
                      onClick={() => setSolicitando(solicitando === f.id ? null : f.id)}
                    >
                      {solicitando === f.id ? "Cerrar" : "Coordinar esta fase"}
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="text-lg font-extrabold text-forest-900">
                      desde {formatoPesos(f.precio)}
                    </div>
                    {f.incluidaEn.length > 0 && (
                      <p className="text-xs text-forest-400 mt-1">
                        Incluida en {f.incluidaEn.map((p) => NOMBRE_PLAN_EMPRESA[p] || p).join(" y ")}
                      </p>
                    )}
                    <p className="text-xs text-forest-400 mt-1">{f.duracion}</p>
                    {esEmpresa ? (
                      <Button
                        variant="primary"
                        className="w-full mt-3"
                        disabled={pagando === f.id}
                        onClick={() => contratarFase(f.id)}
                      >
                        {pagando === f.id ? "Abriendo pago..." : "Contratar esta fase"}
                      </Button>
                    ) : (
                      <Link to="/registro?tipo=empresa" className="block mt-3">
                        <Button variant="outline" className="w-full">
                          Registrate para contratarla
                        </Button>
                      </Link>
                    )}
                  </>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Formulario de coordinación de una fase incluida en el plan */}
      {solicitando && solicitando !== "integral" && (
        <div className="mt-6">
          <FormularioSolicitud
            servicio={solicitando}
            titulo={`Coordinar ${FASES_SELECCION.find((f) => f.id === solicitando)?.nombre || "la fase"}`}
          />
        </div>
      )}

      <p className="text-xs text-forest-400 mt-5 leading-relaxed max-w-3xl">
        Los valores se publican como referencia y pueden ajustarse según la complejidad del perfil
        buscado (seniority, especialización, urgencia y alcance geográfico de la búsqueda). Si por
        la complejidad del puesto corresponde otro valor, te lo confirmamos por escrito antes de
        arrancar y no se cobra ninguna diferencia sin tu acuerdo.
      </p>

      {mostrarCta && (
        <div id="contacto-seleccion" className="scroll-mt-24 mt-8">
          <FormularioSolicitud
            servicio="consulta-general"
            titulo="¿No sabés cuál te conviene? Escribinos"
          />
        </div>
      )}
    </div>
  );
}
