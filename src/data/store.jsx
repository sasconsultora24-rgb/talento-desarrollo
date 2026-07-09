import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase, CV_BUCKET } from "./supabaseClient";

const SESSION_KEY = "std_app_session_v1";

const AppContext = createContext(null);

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("No se pudo leer sesión", e);
  }
  return { role: null, userId: null };
}

// ---------- Mappers: filas de Supabase (snake_case) -> objetos de la app (camelCase) ----------

function mapEmpresa(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    rubro: row.rubro,
    tamano: row.tamano,
    ubicacion: row.ubicacion,
    contacto: row.contacto,
    email: row.email,
    plan: row.plan,
    fechaRegistro: row.created_at ? row.created_at.slice(0, 10) : "",
  };
}

function mapCandidato(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    email: row.email,
    telefono: row.telefono,
    ubicacion: row.ubicacion,
    titulo: row.titulo,
    resumen: row.resumen,
    habilidades: row.habilidades || [],
    nivel: row.nivel,
    disponibilidad: row.disponibilidad,
    membresia: row.membresia,
    cvUrl: row.cv_url,
    cvNombre: row.cv_nombre,
    referencias: row.referencias || [],
    fechaRegistro: row.created_at ? row.created_at.slice(0, 10) : "",
  };
}

function mapVacante(row) {
  return {
    id: row.id,
    empresaId: row.empresa_id,
    titulo: row.titulo,
    area: row.area,
    modalidad: row.modalidad,
    ubicacion: row.ubicacion,
    nivel: row.nivel,
    descripcion: row.descripcion,
    requisitos: row.requisitos || [],
    salario: row.salario,
    estado: row.estado,
    fechaPublicacion: row.fecha_publicacion,
  };
}

function mapPostulacion(row) {
  return {
    id: row.id,
    candidatoId: row.candidato_id,
    vacanteId: row.vacante_id,
    estado: row.estado,
    fecha: row.fecha,
    mensaje: row.mensaje,
  };
}

function mapCapacitacion(row, inscriptos) {
  return {
    id: row.id,
    titulo: row.titulo,
    categoria: row.categoria,
    modalidad: row.modalidad,
    fecha: row.fecha,
    cupos: row.cupos,
    destacada: row.destacada,
    descripcion: row.descripcion,
    inscriptos: inscriptos || [],
  };
}

function mapMentoria(row, reservas) {
  return {
    id: row.id,
    mentor: row.mentor,
    especialidad: row.especialidad,
    modalidad: row.modalidad,
    cuposDisponibles: row.cupos_disponibles,
    reservas: reservas || [],
  };
}

export function AppProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [empresas, setEmpresas] = useState([]);
  const [candidatos, setCandidatos] = useState([]);
  const [vacantes, setVacantes] = useState([]);
  const [postulaciones, setPostulaciones] = useState([]);
  const [capacitaciones, setCapacitaciones] = useState([]);
  const [mentorias, setMentorias] = useState([]);
  const [session, setSession] = useState(loadSession);

  useEffect(() => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }, [session]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        { data: empresasRows, error: e1 },
        { data: candidatosRows, error: e2 },
        { data: vacantesRows, error: e3 },
        { data: postulacionesRows, error: e4 },
        { data: capacitacionesRows, error: e5 },
        { data: inscriptosRows, error: e6 },
        { data: mentoriasRows, error: e7 },
        { data: reservasRows, error: e8 },
      ] = await Promise.all([
        supabase.from("empresas").select("*").order("created_at"),
        supabase.from("candidatos").select("*").order("created_at"),
        supabase.from("vacantes").select("*").order("fecha_publicacion", { ascending: false }),
        supabase.from("postulaciones").select("*"),
        supabase.from("capacitaciones").select("*").order("fecha"),
        supabase.from("capacitacion_inscriptos").select("*"),
        supabase.from("mentorias").select("*"),
        supabase.from("mentoria_reservas").select("*"),
      ]);

      const firstError = e1 || e2 || e3 || e4 || e5 || e6 || e7 || e8;
      if (firstError) throw firstError;

      const inscriptosPorCap = {};
      (inscriptosRows || []).forEach((r) => {
        (inscriptosPorCap[r.capacitacion_id] ||= []).push(r.candidato_id);
      });
      const reservasPorMentoria = {};
      (reservasRows || []).forEach((r) => {
        (reservasPorMentoria[r.mentoria_id] ||= []).push(r.candidato_id);
      });

      setEmpresas((empresasRows || []).map(mapEmpresa));
      setCandidatos((candidatosRows || []).map(mapCandidato));
      setVacantes((vacantesRows || []).map(mapVacante));
      setPostulaciones((postulacionesRows || []).map(mapPostulacion));
      setCapacitaciones((capacitacionesRows || []).map((r) => mapCapacitacion(r, inscriptosPorCap[r.id])));
      setMentorias((mentoriasRows || []).map((r) => mapMentoria(r, reservasPorMentoria[r.id])));
    } catch (err) {
      console.error("Error cargando datos de Supabase", err);
      setError(err.message || "No se pudieron cargar los datos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // ---------- Sesión ----------
  const login = useCallback((role, userId) => setSession({ role, userId }), []);
  const logout = useCallback(() => setSession({ role: null, userId: null }), []);

  // ---------- Archivos (CV) ----------
  const subirCV = useCallback(async (file) => {
    if (!file) return null;
    const path = `${Date.now()}-${crypto.randomUUID()}-${file.name}`.replace(/\s+/g, "_");
    const { error: uploadError } = await supabase.storage.from(CV_BUCKET).upload(path, file);
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from(CV_BUCKET).getPublicUrl(path);
    return { url: data.publicUrl, nombre: file.name };
  }, []);

  // ---------- Candidatos ----------
  const registrarCandidato = useCallback(async (perfil) => {
    const payload = {
      nombre: perfil.nombre,
      email: perfil.email,
      telefono: perfil.telefono,
      ubicacion: perfil.ubicacion,
      titulo: perfil.titulo,
      resumen: perfil.resumen,
      habilidades: perfil.habilidades || [],
      nivel: perfil.nivel,
      disponibilidad: perfil.disponibilidad,
      membresia: perfil.membresia || "free",
      cv_url: perfil.cvUrl || null,
      cv_nombre: perfil.cvNombre || null,
      referencias: perfil.referencias || [],
    };
    const { data, error: insertError } = await supabase
      .from("candidatos")
      .insert(payload)
      .select()
      .single();
    if (insertError) throw insertError;
    const nuevo = mapCandidato(data);
    setCandidatos((prev) => [...prev, nuevo]);
    setSession({ role: "candidato", userId: nuevo.id });
    return nuevo.id;
  }, []);

  const actualizarCandidato = useCallback(async (id, cambios) => {
    const payload = {};
    if ("nombre" in cambios) payload.nombre = cambios.nombre;
    if ("email" in cambios) payload.email = cambios.email;
    if ("telefono" in cambios) payload.telefono = cambios.telefono;
    if ("ubicacion" in cambios) payload.ubicacion = cambios.ubicacion;
    if ("titulo" in cambios) payload.titulo = cambios.titulo;
    if ("resumen" in cambios) payload.resumen = cambios.resumen;
    if ("habilidades" in cambios) payload.habilidades = cambios.habilidades;
    if ("nivel" in cambios) payload.nivel = cambios.nivel;
    if ("disponibilidad" in cambios) payload.disponibilidad = cambios.disponibilidad;
    if ("membresia" in cambios) payload.membresia = cambios.membresia;
    if ("cvUrl" in cambios) payload.cv_url = cambios.cvUrl;
    if ("cvNombre" in cambios) payload.cv_nombre = cambios.cvNombre;
    if ("referencias" in cambios) payload.referencias = cambios.referencias;

    const { data, error: updateError } = await supabase
      .from("candidatos")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (updateError) throw updateError;
    const actualizado = mapCandidato(data);
    setCandidatos((prev) => prev.map((c) => (c.id === id ? actualizado : c)));
  }, []);

  // ---------- Empresas ----------
  const registrarEmpresa = useCallback(async (perfil) => {
    const payload = {
      nombre: perfil.nombre,
      rubro: perfil.rubro,
      tamano: perfil.tamano,
      ubicacion: perfil.ubicacion,
      contacto: perfil.contacto,
      email: perfil.email,
      plan: perfil.plan || "basico",
    };
    const { data, error: insertError } = await supabase
      .from("empresas")
      .insert(payload)
      .select()
      .single();
    if (insertError) throw insertError;
    const nueva = mapEmpresa(data);
    setEmpresas((prev) => [...prev, nueva]);
    setSession({ role: "empresa", userId: nueva.id });
    return nueva.id;
  }, []);

  const actualizarEmpresa = useCallback(async (id, cambios) => {
    const payload = {};
    if ("nombre" in cambios) payload.nombre = cambios.nombre;
    if ("rubro" in cambios) payload.rubro = cambios.rubro;
    if ("tamano" in cambios) payload.tamano = cambios.tamano;
    if ("ubicacion" in cambios) payload.ubicacion = cambios.ubicacion;
    if ("contacto" in cambios) payload.contacto = cambios.contacto;
    if ("email" in cambios) payload.email = cambios.email;
    if ("plan" in cambios) payload.plan = cambios.plan;

    const { data, error: updateError } = await supabase
      .from("empresas")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (updateError) throw updateError;
    const actualizada = mapEmpresa(data);
    setEmpresas((prev) => prev.map((e) => (e.id === id ? actualizada : e)));
  }, []);

  // ---------- Vacantes ----------
  const publicarVacante = useCallback(async (empresaId, vacante) => {
    const payload = {
      empresa_id: empresaId,
      titulo: vacante.titulo,
      area: vacante.area,
      modalidad: vacante.modalidad,
      ubicacion: vacante.ubicacion,
      nivel: vacante.nivel,
      descripcion: vacante.descripcion,
      requisitos: vacante.requisitos || [],
      salario: vacante.salario,
      estado: "pendiente",
    };
    const { data, error: insertError } = await supabase
      .from("vacantes")
      .insert(payload)
      .select()
      .single();
    if (insertError) throw insertError;
    const nueva = mapVacante(data);
    setVacantes((prev) => [nueva, ...prev]);
    return nueva.id;
  }, []);

  const cambiarEstadoVacante = useCallback(async (vacanteId, estado) => {
    const { data, error: updateError } = await supabase
      .from("vacantes")
      .update({ estado })
      .eq("id", vacanteId)
      .select()
      .single();
    if (updateError) throw updateError;
    const actualizada = mapVacante(data);
    setVacantes((prev) => prev.map((v) => (v.id === vacanteId ? actualizada : v)));
  }, []);

  // ---------- Postulaciones ----------
  const postular = useCallback(async (candidatoId, vacanteId, mensaje = "") => {
    const { data, error: insertError } = await supabase
      .from("postulaciones")
      .insert({ candidato_id: candidatoId, vacante_id: vacanteId, mensaje })
      .select()
      .single();
    if (insertError) {
      if (insertError.code === "23505") return; // ya se había postulado
      throw insertError;
    }
    setPostulaciones((prev) => [...prev, mapPostulacion(data)]);
  }, []);

  const cambiarEstadoPostulacion = useCallback(async (postulacionId, estado) => {
    const { data, error: updateError } = await supabase
      .from("postulaciones")
      .update({ estado })
      .eq("id", postulacionId)
      .select()
      .single();
    if (updateError) throw updateError;
    const actualizada = mapPostulacion(data);
    setPostulaciones((prev) => prev.map((p) => (p.id === postulacionId ? actualizada : p)));
  }, []);

  // ---------- Capacitaciones ----------
  const inscribirCapacitacion = useCallback(async (capacitacionId, candidatoId) => {
    const { error: insertError } = await supabase
      .from("capacitacion_inscriptos")
      .insert({ capacitacion_id: capacitacionId, candidato_id: candidatoId });
    if (insertError && insertError.code !== "23505") throw insertError;
    setCapacitaciones((prev) =>
      prev.map((c) =>
        c.id === capacitacionId && !c.inscriptos.includes(candidatoId)
          ? { ...c, inscriptos: [...c.inscriptos, candidatoId] }
          : c
      )
    );
  }, []);

  const crearCapacitacion = useCallback(async (capacitacion) => {
    const payload = {
      titulo: capacitacion.titulo,
      categoria: capacitacion.categoria,
      modalidad: capacitacion.modalidad,
      fecha: capacitacion.fecha,
      cupos: capacitacion.cupos,
      destacada: capacitacion.destacada || false,
      descripcion: capacitacion.descripcion,
    };
    const { data, error: insertError } = await supabase
      .from("capacitaciones")
      .insert(payload)
      .select()
      .single();
    if (insertError) throw insertError;
    setCapacitaciones((prev) => [...prev, mapCapacitacion(data, [])]);
  }, []);

  // ---------- Mentorías ----------
  const reservarMentoria = useCallback(async (mentoriaId, candidatoId) => {
    const { error: insertError } = await supabase
      .from("mentoria_reservas")
      .insert({ mentoria_id: mentoriaId, candidato_id: candidatoId });
    if (insertError && insertError.code !== "23505") throw insertError;
    setMentorias((prev) =>
      prev.map((m) =>
        m.id === mentoriaId && !m.reservas.includes(candidatoId)
          ? { ...m, reservas: [...m.reservas, candidatoId] }
          : m
      )
    );
  }, []);

  const value = {
    loading,
    error,
    empresas,
    candidatos,
    vacantes,
    postulaciones,
    capacitaciones,
    mentorias,
    session,
    login,
    logout,
    refresh,
    subirCV,
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
