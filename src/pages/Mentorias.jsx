import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserRound, CheckCircle2 } from "lucide-react";
import { useApp } from "../data/store.jsx";
import { Card, Badge, Button, SectionTitle, EmptyState, Input } from "../components/ui.jsx";

export default function Mentorias() {
  const { mentorias, reservarMentoria, session } = useApp();
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");

  // A un usuario no logueado le mostramos todo; a un candidato o empresa
  // logueados, solo lo que corresponde a su rol (o "ambos").
  const mentoriasVisibles = mentorias
    .filter((m) => {
      if (session.role === "candidato") return m.publico === "candidato" || m.publico === "ambos";
      if (session.role === "empresa") return m.publico === "empresa" || m.publico === "ambos";
      return true;
    })
    .filter((m) => (m.mentor + " " + m.especialidad).toLowerCase().includes(busqueda.toLowerCase()));

  async function handleReservar(id) {
    if (session.role !== "candidato" && session.role !== "empresa") {
      navigate("/registro");
      return;
    }
    try {
      await reservarMentoria(id, session.userId, session.role);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <SectionTitle
        eyebrow="Acompañamiento"
        title="Mentorías individuales"
        subtitle="Sesiones personalizadas de coaching y desarrollo profesional con mentores de nuestra red, para profesionales y para equipos de PYMEs."
      />

      <div className="mb-8">
        <Input
          placeholder="Buscar por mentor o especialidad..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {mentoriasVisibles.length === 0 ? (
        <EmptyState text="No encontramos mentorías con esa búsqueda." />
      ) : (
      <div className="grid md:grid-cols-2 gap-5">
        {mentoriasVisibles.map((m) => {
          const reservas = [...m.reservasCandidatos, ...m.reservasEmpresas];
          const reservado =
            (session.role === "candidato" && m.reservasCandidatos.includes(session.userId)) ||
            (session.role === "empresa" && m.reservasEmpresas.includes(session.userId));
          const cuposLibres = m.cuposDisponibles - reservas.length;
          return (
            <Card key={m.id} className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gold-50 flex items-center justify-center text-gold-600">
                  <UserRound size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-forest-900">{m.mentor}</h3>
                  <p className="text-sm text-forest-500">{m.especialidad}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 mt-4 text-sm text-forest-500">
                <Badge tone="gray">{m.modalidad}</Badge>
                {m.publico !== "ambos" && (
                  <Badge tone="gold">{m.publico === "empresa" ? "Para empresas" : "Para profesionales"}</Badge>
                )}
                <span>{cuposLibres} cupos disponibles</span>
              </div>
              <div className="mt-5">
                {reservado ? (
                  <span className="inline-flex items-center gap-1.5 text-gold-600 text-sm font-semibold">
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
      )}
    </div>
  );
}
