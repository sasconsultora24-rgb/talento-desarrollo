import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Users2, CheckCircle2 } from "lucide-react";
import { useApp } from "../data/store.jsx";
import { Card, Badge, Button, SectionTitle, EmptyState, Input, Select } from "../components/ui.jsx";
import MentoriasPaquetes from "../components/MentoriasPaquetes.jsx";

export default function Capacitaciones() {
  const { capacitaciones, inscribirCapacitacion, session } = useApp();
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("todas");

  const categorias = useMemo(() => ["todas", ...new Set(capacitaciones.map((c) => c.categoria).filter(Boolean))], [capacitaciones]);

  const filtradas = capacitaciones.filter((c) => {
    const matchTexto = (c.titulo + " " + (c.descripcion || "")).toLowerCase().includes(busqueda.toLowerCase());
    const matchCategoria = categoria === "todas" || c.categoria === categoria;
    return matchTexto && matchCategoria;
  });

  async function handleInscribir(id) {
    if (session.role !== "candidato") {
      navigate("/registro");
      return;
    }
    try {
      await inscribirCapacitacion(id, session.userId);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <SectionTitle
        eyebrow="Formación"
        title="Capacitaciones y talleres"
        subtitle="Programas de liderazgo, comunicación, trabajo en equipo y formación técnica para PYMEs y profesionales."
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <Input
          placeholder="Buscar por título o descripción..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <div className="sm:w-56">
          <Select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            {categorias.map((c) => (
              <option key={c} value={c}>{c === "todas" ? "Todas las categorías" : c}</option>
            ))}
          </Select>
        </div>
      </div>

      {filtradas.length === 0 ? (
        <EmptyState text="No encontramos capacitaciones con esos filtros." />
      ) : (
      <div className="grid md:grid-cols-2 gap-5">
        {filtradas.map((c) => {
          const inscripto = session.role === "candidato" && c.inscriptos.includes(session.userId);
          const cuposLibres = c.cupos - c.inscriptos.length;
          return (
            <Card key={c.id} className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  {c.destacada && <Badge tone="terracotta">Destacada</Badge>}
                  <h3 className="text-lg font-bold text-forest-900 mt-2">{c.titulo}</h3>
                  <Badge tone="gold">{c.categoria}</Badge>
                </div>
              </div>
              <p className="text-sm text-forest-500 mt-3 leading-relaxed">{c.descripcion}</p>
              <div className="flex flex-wrap gap-4 text-sm text-forest-500 mt-4">
                <span className="inline-flex items-center gap-1"><Calendar size={14} />{c.fecha}</span>
                <span className="inline-flex items-center gap-1"><Users2 size={14} />{cuposLibres} cupos disponibles</span>
                <span>{c.modalidad}</span>
              </div>
              <div className="mt-5">
                {inscripto ? (
                  <span className="inline-flex items-center gap-1.5 text-gold-600 text-sm font-semibold">
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
      )}

      <div className="mt-16 pt-16 border-t border-forest-100" id="mentorias">
        <MentoriasPaquetes />
      </div>
    </div>
  );
}
