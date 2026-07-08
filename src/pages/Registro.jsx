import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useApp } from "../data/store.jsx";
import { Card, Field, Input, Select, Textarea, Button, Badge } from "../components/ui.jsx";

export default function Registro() {
  const [params] = useSearchParams();
  const tipoInicial = params.get("tipo") === "empresa" ? "empresa" : "candidato";
  const [tipo, setTipo] = useState(tipoInicial);
  const { registrarCandidato, registrarEmpresa } = useApp();
  const navigate = useNavigate();

  const [candidato, setCandidato] = useState({
    nombre: "",
    email: "",
    telefono: "",
    ubicacion: "",
    titulo: "",
    resumen: "",
    habilidades: "",
    nivel: "Junior",
    disponibilidad: "Full time",
  });

  const [empresa, setEmpresa] = useState({
    nombre: "",
    rubro: "",
    tamano: "1-10 empleados",
    ubicacion: "",
    contacto: "",
    email: "",
  });

  function submitCandidato(e) {
    e.preventDefault();
    const id = registrarCandidato({
      ...candidato,
      habilidades: candidato.habilidades
        .split(",")
        .map((h) => h.trim())
        .filter(Boolean),
      experiencia: [],
    });
    if (id) navigate("/candidato");
  }

  function submitEmpresa(e) {
    e.preventDefault();
    const id = registrarEmpresa(empresa);
    if (id) navigate("/empresa");
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-8">
        <Badge tone="teal">Registro gratuito</Badge>
        <h1 className="text-2xl md:text-3xl font-extrabold text-navy-900 mt-3">
          Creá tu cuenta en SAS Talento & Desarrollo
        </h1>
        <p className="text-navy-500 mt-2">
          ¿Ya tenés cuenta? <Link to="/ingresar" className="text-teal-600 font-semibold">Ingresá acá</Link>
        </p>
      </div>

      <div className="flex gap-2 mb-6 bg-navy-50 rounded-xl p-1 max-w-sm mx-auto">
        <button
          onClick={() => setTipo("candidato")}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
            tipo === "candidato" ? "bg-white shadow-sm text-navy-900" : "text-navy-500"
          }`}
        >
          Soy profesional
        </button>
        <button
          onClick={() => setTipo("empresa")}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
            tipo === "empresa" ? "bg-white shadow-sm text-navy-900" : "text-navy-500"
          }`}
        >
          Soy una PYME
        </button>
      </div>

      <Card className="p-6 md:p-8">
        {tipo === "candidato" ? (
          <form onSubmit={submitCandidato}>
            <Field label="Nombre completo">
              <Input required value={candidato.nombre} onChange={(e) => setCandidato({ ...candidato, nombre: e.target.value })} />
            </Field>
            <div className="grid sm:grid-cols-2 gap-x-4">
              <Field label="Email">
                <Input type="email" required value={candidato.email} onChange={(e) => setCandidato({ ...candidato, email: e.target.value })} />
              </Field>
              <Field label="Teléfono">
                <Input value={candidato.telefono} onChange={(e) => setCandidato({ ...candidato, telefono: e.target.value })} />
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-x-4">
              <Field label="Ubicación">
                <Input required value={candidato.ubicacion} onChange={(e) => setCandidato({ ...candidato, ubicacion: e.target.value })} />
              </Field>
              <Field label="Puesto / título profesional">
                <Input required value={candidato.titulo} onChange={(e) => setCandidato({ ...candidato, titulo: e.target.value })} />
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-x-4">
              <Field label="Nivel de experiencia">
                <Select value={candidato.nivel} onChange={(e) => setCandidato({ ...candidato, nivel: e.target.value })}>
                  <option>Junior</option>
                  <option>Semi Senior</option>
                  <option>Senior</option>
                </Select>
              </Field>
              <Field label="Disponibilidad">
                <Select value={candidato.disponibilidad} onChange={(e) => setCandidato({ ...candidato, disponibilidad: e.target.value })}>
                  <option>Full time</option>
                  <option>Part time</option>
                  <option>Freelance</option>
                </Select>
              </Field>
            </div>
            <Field label="Resumen profesional">
              <Textarea rows={3} value={candidato.resumen} onChange={(e) => setCandidato({ ...candidato, resumen: e.target.value })} />
            </Field>
            <Field label="Habilidades" hint="Separadas por coma. Ej: Excel, Liderazgo, Ventas">
              <Input value={candidato.habilidades} onChange={(e) => setCandidato({ ...candidato, habilidades: e.target.value })} />
            </Field>
            <Button type="submit" className="w-full mt-2">Crear mi perfil</Button>
          </form>
        ) : (
          <form onSubmit={submitEmpresa}>
            <Field label="Nombre de la empresa">
              <Input required value={empresa.nombre} onChange={(e) => setEmpresa({ ...empresa, nombre: e.target.value })} />
            </Field>
            <div className="grid sm:grid-cols-2 gap-x-4">
              <Field label="Rubro">
                <Input required value={empresa.rubro} onChange={(e) => setEmpresa({ ...empresa, rubro: e.target.value })} />
              </Field>
              <Field label="Tamaño">
                <Select value={empresa.tamano} onChange={(e) => setEmpresa({ ...empresa, tamano: e.target.value })}>
                  <option>1-10 empleados</option>
                  <option>11-50 empleados</option>
                  <option>51-200 empleados</option>
                </Select>
              </Field>
            </div>
            <Field label="Ubicación">
              <Input required value={empresa.ubicacion} onChange={(e) => setEmpresa({ ...empresa, ubicacion: e.target.value })} />
            </Field>
            <div className="grid sm:grid-cols-2 gap-x-4">
              <Field label="Persona de contacto">
                <Input required value={empresa.contacto} onChange={(e) => setEmpresa({ ...empresa, contacto: e.target.value })} />
              </Field>
              <Field label="Email">
                <Input type="email" required value={empresa.email} onChange={(e) => setEmpresa({ ...empresa, email: e.target.value })} />
              </Field>
            </div>
            <Button type="submit" className="w-full mt-2">Registrar mi PYME</Button>
          </form>
        )}
      </Card>
    </div>
  );
}
