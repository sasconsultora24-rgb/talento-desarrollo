import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useApp } from "../data/store.jsx";
import { Card, Field, Select, Button, Badge } from "../components/ui.jsx";

export default function Ingresar() {
  const { candidatos, empresas, login } = useApp();
  const navigate = useNavigate();
  const [tipo, setTipo] = useState("candidato");
  const [userId, setUserId] = useState(candidatos[0]?.id || "");

  function ingresar(e) {
    e.preventDefault();
    if (tipo === "admin") {
      login("admin", "admin");
      navigate("/admin");
      return;
    }
    const id = tipo === "candidato" ? userId || candidatos[0]?.id : userId || empresas[0]?.id;
    login(tipo, id);
    navigate(tipo === "candidato" ? "/candidato" : "/empresa");
  }

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-8">
        <Badge tone="teal">Prototipo</Badge>
        <h1 className="text-2xl font-extrabold text-navy-900 mt-3">Ingresar</h1>
        <p className="text-navy-500 mt-2 text-sm">
          Este es un prototipo: elegí un perfil de ejemplo para simular el ingreso, sin
          contraseña. ¿Sos nuevo? <Link to="/registro" className="text-teal-600 font-semibold">Registrate</Link>
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={ingresar}>
          <Field label="¿Cómo querés ingresar?">
            <Select
              value={tipo}
              onChange={(e) => {
                setTipo(e.target.value);
                setUserId(e.target.value === "candidato" ? candidatos[0]?.id : empresas[0]?.id);
              }}
            >
              <option value="candidato">Como profesional</option>
              <option value="empresa">Como PYME</option>
              <option value="admin">Como equipo SAS (admin)</option>
            </Select>
          </Field>

          {tipo === "candidato" && (
            <Field label="Perfil de ejemplo">
              <Select value={userId} onChange={(e) => setUserId(e.target.value)}>
                {candidatos.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre} — {c.titulo}</option>
                ))}
              </Select>
            </Field>
          )}

          {tipo === "empresa" && (
            <Field label="Empresa de ejemplo">
              <Select value={userId} onChange={(e) => setUserId(e.target.value)}>
                {empresas.map((e) => (
                  <option key={e.id} value={e.id}>{e.nombre}</option>
                ))}
              </Select>
            </Field>
          )}

          {tipo === "admin" && (
            <div className="flex items-center gap-2 text-sm text-navy-500 bg-navy-50 rounded-lg p-3 mb-4">
              <ShieldCheck size={18} className="text-teal-600" />
              Acceso interno del equipo de SAS Consultora.
            </div>
          )}

          <Button type="submit" className="w-full">Ingresar</Button>
        </form>
      </Card>
    </div>
  );
}
