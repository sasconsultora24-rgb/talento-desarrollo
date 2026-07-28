import { useEffect, useState } from "react";
import { Field, Input, Select } from "./ui.jsx";
import { PROVINCIAS_ARGENTINA, CIUDADES_POR_PROVINCIA, OTRA_LOCALIDAD, parsearUbicacion } from "../data/geografiaArgentina.js";

// Selector de Provincia + Ciudad (dependiente) + Código Postal. Reemplaza el
// campo de texto libre "Ubicación". Sigue produciendo un string "Ciudad,
// Provincia" (mismo formato que se usaba antes) vía onChange, más un
// codigoPostal aparte. Si la ciudad no está en la lista, "Otra localidad"
// habilita un campo de texto libre.
export default function UbicacionSelector({ ubicacion, codigoPostal, onChange, required = true }) {
  const inicial = parsearUbicacion(ubicacion);
  const [provincia, setProvincia] = useState(inicial.provincia);
  const [ciudad, setCiudad] = useState(inicial.esOtra ? OTRA_LOCALIDAD : inicial.ciudad);
  const [ciudadLibre, setCiudadLibre] = useState(inicial.esOtra ? inicial.ciudad : "");
  const [cp, setCp] = useState(codigoPostal || "");

  const ciudades = provincia ? CIUDADES_POR_PROVINCIA[provincia] || [] : [];

  // Notifica al padre cada vez que cambia algo, con el string combinado.
  useEffect(() => {
    const ciudadFinal = ciudad === OTRA_LOCALIDAD ? ciudadLibre.trim() : ciudad;
    const combinada = provincia && ciudadFinal ? `${ciudadFinal}, ${provincia}` : ciudadFinal || provincia || "";
    onChange?.({ ubicacion: combinada, codigoPostal: cp.trim() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provincia, ciudad, ciudadLibre, cp]);

  function handleProvincia(p) {
    setProvincia(p);
    setCiudad("");
    setCiudadLibre("");
  }

  return (
    <div className="grid sm:grid-cols-2 gap-x-4">
      <Field label="Provincia">
        <Select required={required} value={provincia} onChange={(e) => handleProvincia(e.target.value)}>
          <option value="">Elegí una provincia</option>
          {PROVINCIAS_ARGENTINA.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </Select>
      </Field>
      <Field label="Ciudad / Localidad">
        {provincia ? (
          <>
            <Select required={required} value={ciudad} onChange={(e) => setCiudad(e.target.value)}>
              <option value="">Elegí una ciudad</option>
              {ciudades.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
              <option value={OTRA_LOCALIDAD}>{OTRA_LOCALIDAD}</option>
            </Select>
            {ciudad === OTRA_LOCALIDAD && (
              <Input
                required={required}
                className="mt-2"
                placeholder="Nombre de tu localidad"
                value={ciudadLibre}
                onChange={(e) => setCiudadLibre(e.target.value)}
              />
            )}
          </>
        ) : (
          <Select disabled value="">
            <option value="">Elegí primero una provincia</option>
          </Select>
        )}
      </Field>
      <Field label="Código Postal" hint="Opcional">
        <Input value={cp} onChange={(e) => setCp(e.target.value)} placeholder="Ej: C1425 o 2000" maxLength={10} />
      </Field>
    </div>
  );
}
