import { useNavigate } from "react-router-dom";
import { UserRound, CheckCircle2 } from "lucide-react";
import { useApp } from "../data/store.jsx";
import { Card, Badge, Button, SectionTitle } from "../components/ui.jsx";

export default function Mentorias() {
  const { mentorias, reservarMentoria, session } = useApp();
  const navigate = useNavigate();

  function handleReservar(id) {
    if (session.role !== "candidato") {
      navigate("/registro");
      return;
    }
    reservarMentoria(id, session.userId);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <SectionTitle
        eyebrow="Acompañamiento"
        title="Mentorías individuales"
        subtitle="Sesiones personalizadas de coaching y desarrollo profesional con mentores de nuestra red."
      />
      <div className="grid md:grid-cols-2 gap-5">
        {mentorias.map((m) => {
          const reservado = session.role === "candidato" && m.reservas.includes(session.userId);
          const cuposLibres = m.cuposDisponibles - m.reservas.length;
          return (
            <Card key={m.id} className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                  <UserRound size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-navy-900">{m.mentor}</h3>
                  <p className="text-sm text-navy-500">{m.especialidad}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 mt-4 text-sm text-navy-500">
                <Badge tone="gray">{m.modalidad}</Badge>
                <span>{cuposLibres} cupos disponibles</span>
              </div>
              <div className="mt-5">
                {reservado ? (
                  <span className="inline-flex items-center gap-1.5 text-teal-600 text-sm font-semibold">
                    <CheckCircle2 size={18} /> Sesión reservada
                  </span>
                ) : cuposLibres <= 0 ? (
                  <Button disabled className="w-full sm:w-auto">Sin cupos</Button>
                ) : (
                  <Button onClick={() => handleReservar(m.id)} className="w-full sm:w-auto">
                    Reservar sesión
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
