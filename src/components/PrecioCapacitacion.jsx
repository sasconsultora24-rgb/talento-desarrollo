import { Flame } from "lucide-react";
import { formatoPesos } from "../data/mentoriaPaquetes.js";
import { precioEfectivo, precioUsdEfectivo, enPeriodoPromocional, cuposEfectivos } from "../utils/capacitaciones.js";

function formatoFecha(iso) {
  if (!iso) return "";
  const [anio, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${anio}`;
}

// Bloque visual de precio para una capacitación paga: precio vigente (pesos +
// dólares, valores exactos, sin "aproximado"), precio normal tachado y cupos
// restantes cuando hay una promo de lanzamiento activa.
export default function PrecioCapacitacion({ c, totalInscriptos, className = "" }) {
  if (c.accesoTipo !== "paga") return null;
  const promo = enPeriodoPromocional(c);
  const precioArs = precioEfectivo(c);
  const precioUsd = precioUsdEfectivo(c);
  const cuposLibres = cuposEfectivos(c) - totalInscriptos;

  return (
    <div className={`rounded-xl border ${promo ? "border-terracotta-200 bg-terracotta-50/60" : "border-forest-100 bg-forest-50/40"} px-4 py-3 ${className}`}>
      <div className="flex items-baseline flex-wrap gap-x-2 gap-y-0.5">
        <span className="text-xl font-extrabold text-forest-900">{formatoPesos(precioArs)}</span>
        {precioUsd != null && <span className="text-sm font-bold text-forest-600">o USD {precioUsd}</span>}
        {promo && (
          <span className="text-sm text-forest-400 line-through">
            {formatoPesos(c.precio)}{c.precioUsd != null && ` / USD ${c.precioUsd}`}
          </span>
        )}
      </div>
      {promo ? (
        <div className="mt-1.5 flex items-center gap-1.5 text-xs font-bold text-terracotta-600">
          <Flame size={14} />
          Precio de lanzamiento hasta el {formatoFecha(c.promocionHasta)} — quedan {Math.max(cuposLibres, 0)} cupo{cuposLibres === 1 ? "" : "s"} a este valor
        </div>
      ) : (
        <p className="text-xs text-forest-400 mt-1">Pago único vía Mercado Pago</p>
      )}
    </div>
  );
}
