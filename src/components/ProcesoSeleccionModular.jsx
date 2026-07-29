import { Link } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";
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

// Muestra el servicio de Selección a medida en sus dos formatos: completo
// (Propuesta Integral) o fase por fase (Modular). Se usa en /pymes y también
// dentro del panel de la empresa, por eso vive en components/ y no en pages/.
export default function ProcesoSeleccionModular({ planEmpresa = null, mostrarCta = true }) {
  const ahorro = ahorroIntegral();

  return (
    <div>
      {/* PROPUESTA INTEGRAL */}
      <Card className="p-6 md:p-8 border-2 border-gold-500 shadow-soft mb-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Badge tone="gold">Recomendado</Badge>
            <h3 className="text-2xl font-extrabold text-forest-900 mt-3">
              {PAQUETE_INTEGRAL.nombre}
            </h3>
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
            <span className="text-xs font-bold uppercase tracking-wider text-forest-500">
              Desde
            </span>
            <div className="text-3xl font-extrabold text-forest-900 mt-1">
              {formatoPesos(PAQUETE_INTEGRAL.precio)}
            </div>
            <p className="text-xs text-forest-400 mt-1">por búsqueda</p>
            {ahorro > 0 && (
              <p className="text-xs text-gold-700 font-semibold mt-3">
                {formatoPesos(ahorro)} menos que contratar las 4 fases por separado
                ({formatoPesos(totalFasesSueltas())}).
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
            {mostrarCta && (
              <Link to="/pymes#contacto-seleccion" className="mt-auto pt-5">
                <Button variant="primary" className="w-full">
                  Pedir esta propuesta
                </Button>
              </Link>
            )}
          </div>
        </div>
      </Card>

      {/* PROPUESTA MODULAR */}
      <div className="mb-5">
        <h3 className="text-xl font-extrabold text-forest-900">O contratá solo las fases que necesitás</h3>
        <p className="text-sm text-forest-500 mt-1 max-w-3xl leading-relaxed">
          Si tu equipo ya resuelve parte del proceso, tomá únicamente las etapas donde
          te hace falta ayuda. {FORMA_PAGO_MODULAR}.
        </p>
      </div>

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
                  <Badge tone="gold">Ya incluida en tu plan</Badge>
                ) : (
                  <>
                    <div className="text-lg font-extrabold text-forest-900">
                      desde {formatoPesos(f.precio)}
                    </div>
                    {f.incluidaEn.length > 0 && (
                      <p className="text-xs text-forest-400 mt-1">
                        Incluida en{" "}
                        {f.incluidaEn.map((p) => NOMBRE_PLAN_EMPRESA[p] || p).join(" y ")}
                      </p>
                    )}
                  </>
                )}
                <p className="text-xs text-forest-400 mt-1">{f.duracion}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-forest-400 mt-5 leading-relaxed max-w-3xl">
        Los valores se publican como referencia y pueden ajustarse según la complejidad
        del perfil buscado (seniority, especialización, urgencia y alcance geográfico de
        la búsqueda). Te confirmamos el precio final antes de arrancar, siempre por escrito.
      </p>

      {mostrarCta && (
        <div id="contacto-seleccion" className="scroll-mt-24 mt-8">
          <Card className="p-6 bg-forest-50/60">
            <h4 className="font-bold text-forest-900">¿Arrancamos con una búsqueda?</h4>
            <p className="text-sm text-forest-500 mt-1 leading-relaxed max-w-2xl">
              Escribinos con el puesto que necesitás cubrir y te devolvemos una propuesta
              concreta, con precio cerrado y plazos, en 48 horas hábiles.
            </p>
            <a href="mailto:sasconsultora24@gmail.com?subject=Quiero%20cotizar%20una%20b%C3%BAsqueda%20de%20personal">
              <Button variant="primary" className="mt-4">
                Pedir propuesta <ArrowRight size={16} />
              </Button>
            </a>
          </Card>
        </div>
      )}
    </div>
  );
}
