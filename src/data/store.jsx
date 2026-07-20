import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, CV_BUCKET } from "./supabaseClient";

const AppContext = createContext(null);

// ---------- Mappers: filas de Supabase (snake_case) -> objetos de la app (camelCase) ----------

function mapEmpresa(row) {
  return {
    id: row.id,
    userId: row.user_id,
    nombre: row.nombre,
    rubro: row.rubro,
    tamano: row.tamano,
    ubicacion: row.ubicacion,
    contacto: row.contacto,
    email: row.email,
    plan: row.plan,
    planVencimiento: row.plan_vencimiento,
    fechaRegistro: row.created_at ? row.created_at.slice(0, 10) : "",
  };
}

function mapCandidato(row) {
  return {
    id: row.id,
    userId: row.user_id,
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
    membresiaVencimiento: row.membresia_vencimiento,
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

function mapPago(row) {
  return {
    id: row.id,
    tipo: row.tipo,
    entidadId: row.entidad_id,
    planId: row.plan_id,
    monto: row.monto,
    estado: row.estado,
    periodoDesde: row.periodo_desde,
    periodoHasta: row.periodo_hasta,
    createdAt: row.created_at,
  };
}

const SESSION_VACIA = { role: null, userId: null, authUserId: null, email: null };

export function AppProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [error, setError] = useState(null);
  const [empresas, setEmpresas] = useState([]);
  const [candidatos, setCandidatos] = useState([]);
  const [vacantes, setVacantes] = useState([]);
  const [postulaciones, setPostulaciones] = useState([]);
  const [capacitaciones, setCapacitaciones] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [session, setSession] = useState(SESSION_VACIA);
  const [resolviendo, setResolviendo] = useState(false);
  const navigate = useNavigate();
  // Cuando alguien hace login mientras ya había otra sesión activa (o el
  // listener de auth dispara más de un evento seguido), pueden quedar dos
  // llamadas a resolverSesion corriendo en paralelo. Sin esto, la más lenta
  // podía "ganarle" a la más nueva y pisar la sesión recién resuelta con
  // datos viejos — eso era la causa de que el login a veces no redirigiera.
  const resolverSesionIdRef = useRef(0);

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
        { data: pagosRows, error: e7 },
      ] = await Promise.all([
        supabase.from("empresas").select("*").order("created_at"),
        supabase.from("candidatos").select("*").order("created_at"),
        supabase.from("vacantes").select("*").order("fecha_publicacion", { ascending: false }),
        supabase.from("postulaciones").select("*"),
        supabase.from("capacitaciones").select("*").order("fecha"),
        supabase.from("capacitacion_inscriptos").select("*"),
        // RLS filtra esto automáticamente: cada candidato/empresa solo ve sus
        // propios pagos, y el admin los ve todos. Sirve para mostrar "ya
        // compraste" en mentorías y el historial de compras en el panel admin.
        supabase.from("pagos").select("*").order("created_at", { ascending: false }),
      ]);

      const firstError = e1 || e2 || e3 || e4 || e5 || e6 || e7;
      if (firstError) throw firstError;

      const inscriptosPorCap = {};
      (inscriptosRows || []).forEach((r) => {
        (inscriptosPorCap[r.capacitacion_id] ||= []).push(r.candidato_id);
      });

      setEmpresas((empresasRows || []).map(mapEmpresa));
      setCandidatos((candidatosRows || []).map(mapCandidato));
      setVacantes((vacantesRows || []).map(mapVacante));
      setPostulaciones((postulacionesRows || []).map(mapPostulacion));
      setCapacitaciones((capacitacionesRows || []).map((r) => mapCapacitacion(r, inscriptosPorCap[r.id])));
      setPagos((pagosRows || []).map(mapPago));
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

  // ---------- Sesión real (Supabase Auth) ----------

  // Resuelve el rol de un usuario autenticado: admin > candidato > empresa.
  // Si el usuario recién confirmó su email y todavía no tiene fila de perfil
  // (quedó pendiente en user_metadata al registrarse), la crea ahora que ya
  // hay una sesión válida.
  const resolverSesion = useCallback(async (authUser) => {
    const miId = ++resolverSesionIdRef.current;
    const esVigente = () => miId === resolverSesionIdRef.current;

    if (!authUser) {
      if (esVigente()) setSession(SESSION_VACIA);
      return;
    }
    setResolviendo(true);
    try {
      const { data: adminRow } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", authUser.id)
        .maybeSingle();
      if (adminRow) {
        if (esVigente()) setSession({ role: "admin", userId: "admin", authUserId: authUser.id, email: authUser.email });
        return;
      }

      const { data: candRow } = await supabase
        .from("candidatos")
        .select("id")
        .eq("user_id", authUser.id)
        .maybeSingle();
      if (candRow) {
        if (esVigente()) setSession({ role: "candidato", userId: candRow.id, authUserId: authUser.id, email: authUser.email });
        return;
      }

      const { data: empRow } = await supabase
        .from("empresas")
        .select("id")
        .eq("user_id", authUser.id)
        .maybeSingle();
      if (empRow) {
        if (esVigente()) setSession({ role: "empresa", userId: empRow.id, authUserId: authUser.id, email: authUser.email });
        return;
      }

      // Sin perfil todavía: ¿venía de un registro pendiente de confirmación de email?
      // (usa upsert-por-conflicto: si dos eventos de auth corren en paralelo y ya
      // se creó el perfil, se recupera la fila existente en vez de duplicar)
      const pendiente = authUser.user_metadata?.pending_profile;
      if (pendiente?.tipo === "candidato") {
        let fila = null;
        const { data: creado, error: insErr } = await supabase
          .from("candidatos")
          .insert({ ...pendiente.datos, user_id: authUser.id })
          .select()
          .single();
        if (!insErr) fila = creado;
        else if (insErr.code === "23505") {
          const { data: existente } = await supabase
            .from("candidatos").select("id").eq("user_id", authUser.id).maybeSingle();
          fila = existente;
        }
        if (fila) {
          await refresh();
          if (esVigente()) setSession({ role: "candidato", userId: fila.id, authUserId: authUser.id, email: authUser.email });
          return;
        }
      }
      if (pendiente?.tipo === "empresa") {
        let fila = null;
        const { data: creada, error: insErr } = await supabase
          .from("empresas")
          .insert({ ...pendiente.datos, user_id: authUser.id })
          .select()
          .single();
        if (!insErr) fila = creada;
        else if (insErr.code === "23505") {
          const { data: existente } = await supabase
            .from("empresas").select("id").eq("user_id", authUser.id).maybeSingle();
          fila = existente;
        }
        if (fila) {
          await refresh();
          if (esVigente()) setSession({ role: "empresa", userId: fila.id, authUserId: authUser.id, email: authUser.email });
          return;
        }
      }

      if (esVigente()) setSession({ role: null, userId: null, authUserId: authUser.id, email: authUser.email });
    } finally {
      if (esVigente()) setResolviendo(false);
    }
  }, [refresh]);

  useEffect(() => {
    let activo = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!activo) return;
      resolverSesion(data.session?.user || null).finally(() => setAuthReady(true));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (event === "PASSWORD_RECOVERY") {
        // Vino de un link de "olvidé mi contraseña": llevar a la pantalla
        // de elegir nueva contraseña en vez de resolver el rol normal.
        navigate("/recuperar");
      }
      resolverSesion(newSession?.user || null);
    });
    return () => {
      activo = false;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(SESSION_VACIA);
  }, []);

  // Registro: crea el usuario de auth. La creación del perfil (candidato/empresa)
  // la hace siempre resolverSesion, disparado por el listener de auth — así
  // evitamos resolver la sesión desde dos lugares en paralelo (signUp/signIn y
  // el listener) y las condiciones de carrera que eso generaba.
  const registrarCandidato = useCallback(async (perfil, password) => {
    const datos = {
      nombre: perfil.nombre,
      email: perfil.email,
      telefono: perfil.telefono,
      ubicacion: perfil.ubicacion,
      titulo: perfil.titulo,
      resumen: perfil.resumen,
      habilidades: perfil.habilidades || [],
      nivel: perfil.nivel,
      disponibilidad: perfil.disponibilidad,
      membresia: "free",
      cv_url: perfil.cvUrl || null,
      cv_nombre: perfil.cvNombre || null,
      referencias: perfil.referencias || [],
      terminos_aceptados_at: new Date().toISOString(),
      visibilidad_autorizada_at: new Date().toISOString(),
    };
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: perfil.email,
      password,
      options: { data: { pending_profile: { tipo: "candidato", datos } } },
    });
    if (signUpError) throw signUpError;
    return { confirmado: !!data.session };
  }, []);

  const registrarEmpresa = useCallback(async (perfil, password) => {
    const datos = {
      nombre: perfil.nombre,
      rubro: perfil.rubro,
      tamano: perfil.tamano,
      ubicacion: perfil.ubicacion,
      contacto: perfil.contacto,
      email: perfil.email,
      plan: "basico",
      terminos_aceptados_at: new Date().toISOString(),
    };
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: perfil.email,
      password,
      options: { data: { pending_profile: { tipo: "empresa", datos } } },
    });
    if (signUpError) throw signUpError;
    return { confirmado: !!data.session };
  }, []);

  const iniciarSesion = useCallback(async (email, password) => {
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) throw signInError;
  }, []);

  // Envía el email de "olvidé mi contraseña". El link lleva de vuelta a la
  // app con un evento PASSWORD_RECOVERY (manejado arriba, en onAuthStateChange).
  const solicitarRecuperacion = useCallback(async (email) => {
    const { error: recError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + window.location.pathname,
    });
    if (recError) throw recError;
  }, []);

  // Se usa en /recuperar, ya con la sesión temporal de recuperación activa.
  const actualizarPassword = useCallback(async (password) => {
    const { error: updError } = await supabase.auth.updateUser({ password });
    if (updError) throw updError;
  }, []);

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

  // ---------- Pagos (Mercado Pago) ----------
  // Pide al backend que arme una preferencia de pago (Checkout Pro) para un
  // plan de empresa o la membresía premium de candidato, y devuelve la URL
  // de pago a la que hay que redirigir. El precio se calcula del lado del
  // servidor, nunca se manda desde acá.
  const iniciarPago = useCallback(async (tipo, planId) => {
    const { data, error: fnError } = await supabase.functions.invoke("crear-preferencia-pago", {
      body: { tipo, planId },
    });
    if (fnError) {
      let mensaje = "No se pudo iniciar el pago.";
      try {
        const body = await fnError.context?.json?.();
        if (body?.error) mensaje = body.error;
      } catch {
        // sin cuerpo de error legible, se usa el mensaje genérico
      }
      throw new Error(mensaje);
    }
    if (!data?.initPoint) throw new Error("No se pudo iniciar el pago.");
    return data.initPoint;
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

  const value = {
    loading,
    authReady,
    resolviendo,
    error,
    empresas,
    candidatos,
    vacantes,
    postulaciones,
    capacitaciones,
    pagos,
    session,
    logout,
    iniciarSesion,
    solicitarRecuperacion,
    actualizarPassword,
    refresh,
    subirCV,
    iniciarPago,
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
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp debe usarse dentro de <AppProvider>");
  return ctx;
}
