import { useNavigate } from "react-router-dom";
import { Calendar, Users2, CheckCircle2 } from "lucide-react";
import { useApp } from "../data/store.jsx";
import { Card, Badge, Button, SectionTitle } from "../components/ui.jsx";

export default function Capacitaciones() {
  const { capacitaciones, inscribirCapacitacion, session } = useApp();
  const navigate = useNavigate();

  function handleInscribir(id) {
    if (session.role !== "candidato") {
      navigate("/registro");
      return;
    }
    inscribirCapacitacion(id, session.userId);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <SectionTitle
        eyebrow="Formación"
        title="Capacitaciones y talleres"
        subtitle="Programas de liderazgo, comunicación, trabajo en equipo y formación técnica para PYMEs y profesionales."
      />
      <div className="grid md:grid-cols-2 gap-5">
        {capacitaciones.map((c) => {
          const inscripto = session.role === "candidato" && c.inscriptos.includes(session.userId);
          const cuposLibres = c.cupos - c.inscriptos.length;
          return (
            <Card key={c.id} className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  {c.destacada && <Badge tone="amber">Destacada</Badge>}
                  <h3 className="text-lg font-bold text-navy-900 mt-2">{c.titulo}</h3>
                  <Badge tone="teal">{c.categoria}</Badge>
                </div>
              </div>
              <p className="text-sm text-navy-500 mt-3 leading-relaxed">{c.descripcion}</p>
              <div className="flex flex-wrap gap-4 text-sm text-navy-500 mt-4">
                <span className="inline-flex items-center gap-1"><Calendar size={14} />{c.fecha}</span>
                <span className="inline-flex items-center gap-1"><Users2 size={14} />{cuposLibres} cupos disponibles</span>
                <span>{c.modalidad}</span>
              </div>
              <div className="mt-5">
                {inscripto ? (
                  <span className="inline-flex items-center gap-1.5 text-teal-600 text-sm font-semibold">
                    <CheckCircle2 size={18} /> Ya estás inscripto/a
                  </span>
                ) : cuposLibres <= 0 ? (
                  <Button disabled className="w-full sm:w-auto">Sin cupos</Button>
                ) : (
                  <Button onClick={() => handleInscribir(c.id)} className="w-full sm:w-auto">
                    Inscribirme
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
