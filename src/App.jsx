import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Landing from "./pages/Landing.jsx";
import Vacantes from "./pages/Vacantes.jsx";
import Capacitaciones from "./pages/Capacitaciones.jsx";
import Mentorias from "./pages/Mentorias.jsx";
import ParaPymes from "./pages/ParaPymes.jsx";
import Registro from "./pages/Registro.jsx";
import Ingresar from "./pages/Ingresar.jsx";
import CandidatoPanel from "./pages/candidato/CandidatoPanel.jsx";
import EmpresaPanel from "./pages/empresa/EmpresaPanel.jsx";
import AdminPanel from "./pages/admin/AdminPanel.jsx";
import NotFound from "./pages/NotFound.jsx";
import RequireRole from "./components/RequireRole.jsx";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/vacantes" element={<Vacantes />} />
        <Route path="/capacitaciones" element={<Capacitaciones />} />
        <Route path="/mentorias" element={<Mentorias />} />
        <Route path="/pymes" element={<ParaPymes />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/ingresar" element={<Ingresar />} />
        <Route
          path="/candidato"
          element={
            <RequireRole role="candidato">
              <CandidatoPanel />
            </RequireRole>
          }
        />
        <Route
          path="/empresa"
          element={
            <RequireRole role="empresa">
              <EmpresaPanel />
            </RequireRole>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireRole role="admin">
              <AdminPanel />
            </RequireRole>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
