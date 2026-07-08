import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Building2, CheckCircle2 } from "lucide-react";
import { useApp } from "../data/store.jsx";
import { Card, Badge, Button, SectionTitle, EmptyState, Input, Select } from "../components/ui.jsx";

export default function Vacantes() {
  const { vacantes, empresas, postulaciones, postular, session } = useApp();
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");
  const [area, setArea] = useState("todas");
  const [confirmado, setConfirmado] = useState(null);

  const aprobadas = vacantes.filter((v) => v.estado === "aprobada");
  const areas = useMemo(() => ["todas", ...new Set(aprobadas.map((v) => v.area))], [aprobadas]);

  const filtradas = aprobadas.filter((v) => {
    const matchTexto = (v.titulo + v.ubicacion).toLowerCase().includes(busqueda.toLowerCase());
    const matchArea = area === "todas" || v.area === area;
    return matchTexto && matchArea;
  });

  function handlePostular(vacanteId) {
    if (session.role !== "candidato") {
      navigate("/registro");
      return;
    }
    postular(session.userId, vacanteId);
    setConfirmado(vacanteId);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <SectionTitle
        eyebrow="Empleo"
        title="Vacantes activas"
        subtitle="Oportunidades publicadas por PYMEs de la región, aprobadas por nuestro equipo."
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <Input
          placeholder="Buscar por puesto o ubicación..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <div className="sm:w-56">
          <Select value={area} onChange={(e) => setArea(e.target.value)}>
            {areas.map((a) => (
              <option key={a} value={a}>{a === "todas" ? "Todas las áreas" : a}</option>
            ))}
          </Select>
        </div>
      </div>

      {filtradas.length === 0 ? (
        <EmptyState text="No encontramos vacantes con esos filtros." />
      ) : (
        <div className="space-y-4">
          {filtradas.map((v) => {
            const empresa = empresas.find((e) => e.id === v.empresaId);
            const yaPostulado =
              session.role === "candidato" &&
              postulaciones.some((p) => p.candidatoId === session.userId && p.vacanteId === v.id);
            return (
              <Card key={v.id} className="p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge tone="teal">{v.area}</Badge>
                      <Badge tone="gray">{v.modalidad}</Badge>
                      <Badge tone="amber">{v.nivel}</Badge>
                    </div>
                    <h3 className="text-lg font-bold text-navy-900">{v.titulo}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-navy-500 mt-1.5">
                      <span className="inline-flex items-center gap-1"><Building2 size={14} />{empresa?.nombre}</span>
                      <span className="inline-flex items-center gap-1"><MapPin size={14} />{v.ubicacion}</span>
                    </div>
                    <p className="text-sm text-navy-500 mt-3 leading-relaxed">{v.descripcion}</p>
                    {v.requisitos?.length > 0 && (
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {v.requisitos.map((r) => (
                          <li key={r} className="text-xs bg-navy-50 text-navy-600 px-2.5 py-1 rounded-full">
                            {r}
                          </li>
                        ))}
                      </ul>
                    )}
                    <p className="text-sm font-semibold text-navy-700 mt-3">{v.salario}</p>
                  </div>
                  <div className="md:w-44 flex md:flex-col gap-2">
                    {yaPostulado || confirmado === v.id ? (
                      <span className="inline-flex items-center gap-1.5 text-teal-600 text-sm font-semibold">
                        <CheckCircle2 size={18} /> Postulación enviada
                      </span>
                    ) : (
                      <Button onClick={() => handlePostular(v.id)} className="w-full">
                        Postularme
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
