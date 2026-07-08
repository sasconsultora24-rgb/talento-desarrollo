import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  seedEmpresas,
  seedCandidatos,
  seedVacantes,
  seedPostulaciones,
  seedCapacitaciones,
  seedMentorias,
} from "./seed";

const STORAGE_KEY = "std_app_data_v1";
const SESSION_KEY = "std_app_session_v1";

const AppContext = createContext(null);

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("No se pudo leer localStorage", e);
  }
  return {
    empresas: seedEmpresas,
    candidatos: seedCandidatos,
    vacantes: seedVacantes,
    postulaciones: seedPostulaciones,
    capacitaciones: seedCapacitaciones,
    mentorias: seedMentorias,
  };
}

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("No se pudo leer sesión", e);
  }
  return { role: null, userId: null };
}

let idCounter = 1000;
function uid(prefix) {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

export function AppProvider({ children }) {
  const [data, setData] = useState(loadInitial);
  const [session, setSession] = useState(loadSession);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }, [session]);

  // ---------- Sesión ----------
  const login = useCallback((role, userId) => setSession({ role, userId }), []);
  const logout = useCallback(() => setSession({ role: null, userId: null }), []);

  // ---------- Candidatos ----------
  const registrarCandidato = useCallback((perfil) => {
    const nuevo = {
      id: uid("can"),
      membresia: "free",
      fechaRegistro: new Date().toISOString().slice(0, 10),
      habilidades: [],
      experiencia: [],
      ...perfil,
    };
    setData((d) => ({ ...d, candidatos: [...d.candidatos, nuevo] }));
    setSession({ role: "candidato", userId: nuevo.id });
    return nuevo.id;
  }, []);

  const actualizarCandidato = useCallback((id, cambios) => {
    setData((d) => ({
      ...d,
      candidatos: d.candidatos.map((c) => (c.id === id ? { ...c, ...cambios } : c)),
    }));
  }, []);

  // ---------- Empresas ----------
  const registrarEmpresa = useCallback((perfil) => {
    const nueva = {
      id: uid("emp"),
      plan: "basico",
      fechaRegistro: new Date().toISOString().slice(0, 10),
      ...perfil,
    };
    setData((d) => ({ ...d, empresas: [...d.empresas, nueva] }));
    setSession({ role: "empresa", userId: nueva.id });
    return nueva.id;
  }, []);

  const actualizarEmpresa = useCallback((id, cambios) => {
    setData((d) => ({
      ...d,
      empresas: d.empresas.map((e) => (e.id === id ? { ...e, ...cambios } : e)),
    }));
  }, []);

  // ---------- Vacantes ----------
  const publicarVacante = useCallback((empresaId, vacante) => {
    const nueva = {
      id: uid("vac"),
      empresaId,
      estado: "pendiente",
      fechaPublicacion: new Date().toISOString().slice(0, 10),
      requisitos: [],
      ...vacante,
    };
    setData((d) => ({ ...d, vacantes: [...d.vacantes, nueva] }));
    return nueva.id;
  }, []);

  const cambiarEstadoVacante = useCallback((vacanteId, estado) => {
    setData((d) => ({
      ...d,
      vacantes: d.vacantes.map((v) => (v.id === vacanteId ? { ...v, estado } : v)),
    }));
  }, []);

  // ---------- Postulaciones ----------
  const postular = useCallback((candidatoId, vacanteId, mensaje = "") => {
    setData((d) => {
      const yaPostulo = d.postulaciones.some(
        (p) => p.candidatoId === candidatoId && p.vacanteId === vacanteId
      );
      if (yaPostulo) return d;
      const nueva = {
        id: uid("post"),
        candidatoId,
        vacanteId,
        estado: "nueva",
        fecha: new Date().toISOString().slice(0, 10),
        mensaje,
      };
      return { ...d, postulaciones: [...d.postulaciones, nueva] };
    });
  }, []);

  const cambiarEstadoPostulacion = useCallback((postulacionId, estado) => {
    setData((d) => ({
      ...d,
      postulaciones: d.postulaciones.map((p) =>
        p.id === postulacionId ? { ...p, estado } : p
      ),
    }));
  }, []);

  // ---------- Capacitaciones ----------
  const inscribirCapacitacion = useCallback((capacitacionId, candidatoId) => {
    setData((d) => ({
      ...d,
      capacitaciones: d.capacitaciones.map((c) =>
        c.id === capacitacionId && !c.inscriptos.includes(candidatoId)
          ? { ...c, inscriptos: [...c.inscriptos, candidatoId] }
          : c
      ),
    }));
  }, []);

  const crearCapacitacion = useCallback((capacitacion) => {
    const nueva = { id: uid("cap"), inscriptos: [], destacada: false, ...capacitacion };
    setData((d) => ({ ...d, capacitaciones: [...d.capacitaciones, nueva] }));
  }, []);

  // ---------- Mentorías ----------
  const reservarMentoria = useCallback((mentoriaId, candidatoId) => {
    setData((d) => ({
      ...d,
      mentorias: d.mentorias.map((m) =>
        m.id === mentoriaId && !m.reservas.includes(candidatoId)
          ? { ...m, reservas: [...m.reservas, candidatoId] }
          : m
      ),
    }));
  }, []);

  const value = {
    ...data,
    session,
    login,
    logout,
    registrarCandidato,
    actualizarCandidato,
    registrarEmpresa,
    actualizarEmpresa,
    publicarVacante,
    cambiarEstadoVacante,
    postular,
    cambiarEstadoPostulacion,
    inscribirCapacitacion,
    crearCapacitacion,
    reservarMentoria,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp debe usarse dentro de <AppProvider>");
  return ctx;
}
