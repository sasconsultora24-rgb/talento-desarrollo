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
    codigoPostal: row.codigo_postal,
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
    codigoPostal: row.codigo_postal,
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
    fechaVencimiento: row.fecha_vencimiento,
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
  const inscriptosCandidatos = inscriptos?.candidatos || [];
  const inscriptosEmpresas = inscriptos?.empresas || [];
  // Integrantes de equipo se inscriben de a uno (no comparten el cupo de la
  // empresa), gateados por el plan de su empresa. Ver utils/capacitaciones.js.
  const inscriptosIntegrantes = inscriptos?.integrantes || [];
  return {
    id: row.id,
    titulo: row.titulo,
    categoria: row.categoria,
    modalidad: row.modalidad,
    fecha: row.fecha,
    cupos: row.cupos,
    destacada: row.destacada,
    descripcion: row.descripcion,
    // Acceso: "gratis" (default), "paga" (requiere pago único vía Mercado Pago,
    // ver utils/capacitaciones.js) o "plan" (incluida solo desde cierto plan).
    accesoTipo: row.acceso_tipo || "gratis",
    precio: row.precio,
    precioUsd: row.precio_usd,
    // Precio/cupos de lanzamiento, vigentes hasta promocionHasta (inclusive).
    // Ver utils/capacitaciones.js: precioEfectivo() / cuposEfectivos().
    precioPromocional: row.precio_promocional,
    precioPromocionalUsd: row.precio_promocional_usd,
    promocionHasta: row.promocion_hasta,
    cuposPromocional: row.cupos_promocional,
    // Link a la grabación/reunión/material — se manda por email al inscribirse.
    enlaceAcceso: row.enlace_acceso,
    planMinimoEmpresa: row.plan_minimo_empresa,
    planMinimoCandidato: row.plan_minimo_candidato,
    inscriptosCandidatos,
    inscriptosEmpresas,
    inscriptosIntegrantes,
    // Compatibilidad: código viejo que solo conocía candidatos sigue funcionando.
    inscriptos: inscriptosCandidatos,
  };
}

function mapIntegrante(row) {
  return {
    id: row.id,
    empresaId: row.empresa_id,
    userId: row.user_id,
    nombre: row.nombre,
    email: row.email,
    fechaAlta: row.created_at ? row.created_at.slice(0, 10) : "",
  };
}

function mapConsultoria(row) {
  return {
    id: row.id,
    empresaId: row.empresa_id,
    fechaHora: row.fecha_hora,
    estado: row.estado,
    createdAt: row.created_at,
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
  // RLS: cada empresa ve solo las suyas, el admin las ve todas.
  const [consultorias, setConsultorias] = useState([]);
  // RLS filtra esto: el dueño de la PYME ve a todo su equipo, un integrante
  // solo se ve a sí mismo (y el admin, a todos).
  const [integrantes, setIntegrantes] = useState([]);
  // Código de acceso de la propia empresa (RLS: solo lo ve su dueño/admin).
  const [codigoEmpresa, setCodigoEmpresa] = useState(null);
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
        { data: integrantesRows, error: e8 },
        { data: codigoRows, error: e9 },
        { data: consultoriasRows, error: e10 },
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
        supabase.from("empresa_integrantes").select("*").order("created_at"),
        supabase.from("empresa_codigos").select("*"),
        supabase.from("consultorias_reservadas").select("*").order("fecha_hora"),
      ]);

      const firstError = e1 || e2 || e3 || e4 || e5 || e6 || e7 || e8 || e9 || e10;
      if (firstError) throw firstError;

      const inscriptosPorCap = {};
      (inscriptosRows || []).forEach((r) => {
        const bucket = (inscriptosPorCap[r.capacitacion_id] ||= { candidatos: [], empresas: [], integrantes: [] });
        if (r.candidato_id) bucket.candidatos.push(r.candidato_id);
        if (r.empresa_id) bucket.empresas.push(r.empresa_id);
        if (r.integrante_id) bucket.integrantes.push(r.integrante_id);
      });

      setEmpresas((empresasRows || []).map(mapEmpresa));
      setCandidatos((candidatosRows || []).map(mapCandidato));
      setVacantes((vacantesRows || []).map(mapVacante));
      setPostulaciones((postulacionesRows || []).map(mapPostulacion));
      setCapacitaciones((capacitacionesRows || []).map((r) => mapCapacitacion(r, inscriptosPorCap[r.id])));
      setPagos((pagosRows || []).map(mapPago));
      setIntegrantes((integrantesRows || []).map(mapIntegrante));
      setConsultorias((consultoriasRows || []).map(mapConsultoria));
      // RLS acota esto a lo sumo a una fila (la de la propia empresa) para
      // dueños, o vacío para cualquier otro rol.
      setCodigoEmpresa(codigoRows?.[0]?.codigo || null);
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

      const { data: integRow } = await supabase
        .from("empresa_integrantes")
        .select("id, empresa_id")
        .eq("user_id", authUser.id)
        .maybeSingle();
      if (integRow) {
        if (esVigente())
          setSession({ role: "integrante", userId: integRow.id, empresaId: integRow.empresa_id, authUserId: authUser.id, email: authUser.email });
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
      if (pendiente?.tipo === "integrante") {
        let fila = null;
        const { data: creado, error: insErr } = await supabase
          .from("empresa_integrantes")
          .insert({ ...pendiente.datos, user_id: authUser.id })
          .select()
          .single();
        if (!insErr) fila = creado;
        else if (insErr.code === "23505") {
          const { data: existente } = await supabase
            .from("empresa_integrantes").select("id, empresa_id").eq("user_id", authUser.id).maybeSingle();
          fila = existente;
        }
        if (fila) {
          await refresh();
          if (esVigente())
            setSession({ role: "integrante", userId: fila.id, empresaId: fila.empresa_id, authUserId: authUser.id, email: authUser.email });
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
      codigo_postal: perfil.codigoPostal || null,
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
      codigo_postal: perfil.codigoPostal || null,
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

  // Alta de un integrante de equipo por código de empresa (autorregistro).
  // Valida el código y el cupo ANTES de crear la cuenta para dar un error
  // claro; el cupo se re-valida igual en el servidor (RLS) al insertar la fila.
  const registrarIntegrante = useCallback(async (perfil, password) => {
    const { data: resultados, error: buscarError } = await supabase.rpc("buscar_empresa_por_codigo", {
      p_codigo: perfil.codigoEmpresa,
    });
    if (buscarError) throw buscarError;
    const empresaEncontrada = resultados?.[0];
    if (!empresaEncontrada) throw new Error("No encontramos ninguna PYME con ese código. Revisalo con quien te lo compartió.");
    if (!empresaEncontrada.tiene_cupo) {
      throw new Error("Esa PYME ya usó todos los cupos de integrantes de su plan. Pedile a su administrador que libere un cupo o suba de plan.");
    }
    const datos = {
      empresa_id: empresaEncontrada.empresa_id,
      nombre: perfil.nombre,
      email: perfil.email,
    };
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: perfil.email,
      password,
      options: { data: { pending_profile: { tipo: "integrante", datos } } },
    });
    if (signUpError) throw signUpError;
    return { confirmado: !!data.session, empresaNombre: empresaEncontrada.nombre };
  }, []);

  // El dueño de la PYME da de baja a un integrante (libera su cupo).
  const eliminarIntegrante = useCallback(async (id) => {
    const { error: delError } = await supabase.from("empresa_integrantes").delete().eq("id", id);
    if (delError) throw delError;
    setIntegrantes((prev) => prev.filter((i) => i.id !== id));
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
    if ("codigoPostal" in cambios) payload.codigo_postal = cambios.codigoPostal;
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
    if ("codigoPostal" in cambios) payload.codigo_postal = cambios.codigoPostal;
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
  const iniciarPago = useCallback(async (tipo, planId, opciones = {}) => {
    const { data, error: fnError } = await supabase.functions.invoke("crear-preferencia-pago", {
      body: { tipo, planId, asignadoA: opciones.asignadoA || null },
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
    // Mentorías: si el plan de la PYME ya la incluye (Premium: 1 incluida,
    // Platino: ilimitadas), el backend la aprueba directo sin pasar por
    // Mercado Pago. Refrescamos para que se vea "ya compraste" al toque.
    if (data?.incluido) {
      await refresh();
      return { incluido: true };
    }
    if (!data?.initPoint) throw new Error("No se pudo iniciar el pago.");
    return { initPoint: data.initPoint };
  }, [refresh]);

  // ---------- Vacantes ----------
  // La vacante se publica al instante (estado "aprobada"), sin esperar
  // aprobación manual. Un trigger de base de datos avisa por email a la PYME,
  // a SAS (que la revisa después) y a los profesionales con buena afinidad.
  // Si al revisarla hay algo mal, SAS la despublica desde el panel de admin.
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
      estado: "aprobada",
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

  // Plan Básico (pago por vacante): crea la vacante en estado "pendiente_pago"
  // y arranca el pago de $80.000 en el momento. Recién cuando Mercado Pago
  // aprueba el pago (webhook-pagos) la vacante pasa a "aprobada" —o sea, se
  // publica— con 45 días de vigencia desde la acreditación. Un trigger de la
  // base impide que la empresa se saltee el pago publicándola por su cuenta.
  const publicarVacanteConPago = useCallback(async (empresaId, vacante) => {
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
      estado: "pendiente_pago",
    };
    const { data, error: insertError } = await supabase
      .from("vacantes")
      .insert(payload)
      .select()
      .single();
    if (insertError) throw insertError;
    const nueva = mapVacante(data);
    setVacantes((prev) => [nueva, ...prev]);

    const { data: pagoData, error: fnError } = await supabase.functions.invoke("crear-preferencia-pago", {
      body: { tipo: "vacante_unica", planId: nueva.id },
    });
    if (fnError) {
      let mensaje = "No se pudo iniciar el pago de la vacante.";
      try {
        const body = await fnError.context?.json?.();
        if (body?.error) mensaje = body.error;
      } catch {
        // sin cuerpo de error legible
      }
      throw new Error(mensaje);
    }
    if (!pagoData?.initPoint) throw new Error("No se pudo iniciar el pago de la vacante.");
    return { vacanteId: nueva.id, initPoint: pagoData.initPoint };
  }, []);

  // Reserva de la consultoría de 45 min (beneficio exclusivo Platino). El
  // trigger de base de datos avisa por email a SAS y confirma a la empresa;
  // la RLS ya valida que sea Platino y que falten 7+ días.
  const reservarConsultoria = useCallback(async (empresaId, fechaHoraISO) => {
    const { error: insError } = await supabase
      .from("consultorias_reservadas")
      .insert({ empresa_id: empresaId, fecha_hora: fechaHoraISO });
    if (insError) throw insError;
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

  // Cambia el estado de una consultoría reservada (solo admin, por RLS).
  const cambiarEstadoConsultoria = useCallback(async (consultoriaId, estado) => {
    const { data, error: updateError } = await supabase
      .from("consultorias_reservadas")
      .update({ estado })
      .eq("id", consultoriaId)
      .select()
      .single();
    if (updateError) throw updateError;
    const actualizada = mapConsultoria(data);
    setConsultorias((prev) => prev.map((c) => (c.id === consultoriaId ? actualizada : c)));
  }, []);

  // ---------- Capacitaciones ----------
  // tipo: "candidato" (default), "empresa" o "integrante" — una PYME puede
  // anotar a la persona de contacto / a su equipo, un profesional se anota a
  // sí mismo, y cada integrante de equipo se anota individualmente (no
  // comparte el cupo de inscripción de su empresa).
  const inscribirCapacitacion = useCallback(async (capacitacionId, id, tipo = "candidato") => {
    const payload =
      tipo === "empresa"
        ? { capacitacion_id: capacitacionId, empresa_id: id }
        : tipo === "integrante"
        ? { capacitacion_id: capacitacionId, integrante_id: id }
        : { capacitacion_id: capacitacionId, candidato_id: id };
    const { error: insertError } = await supabase.from("capacitacion_inscriptos").insert(payload);
    if (insertError && insertError.code !== "23505") throw insertError;
    setCapacitaciones((prev) =>
      prev.map((c) => {
        if (c.id !== capacitacionId) return c;
        if (tipo === "empresa") {
          return c.inscriptosEmpresas.includes(id)
            ? c
            : { ...c, inscriptosEmpresas: [...c.inscriptosEmpresas, id] };
        }
        if (tipo === "integrante") {
          return c.inscriptosIntegrantes.includes(id)
            ? c
            : { ...c, inscriptosIntegrantes: [...c.inscriptosIntegrantes, id] };
        }
        return c.inscriptosCandidatos.includes(id)
          ? c
          : { ...c, inscriptosCandidatos: [...c.inscriptosCandidatos, id], inscriptos: [...c.inscriptos, id] };
      })
    );
  }, []);

  // El admin puede cargar/editar el link de acceso (grabación, reunión,
  // materiales) de una capacitación ya creada, sin tocar el resto de sus datos.
  const actualizarEnlaceCapacitacion = useCallback(async (id, enlaceAcceso) => {
    const { error: updError } = await supabase
      .from("capacitaciones")
      .update({ enlace_acceso: enlaceAcceso || null })
      .eq("id", id);
    if (updError) throw updError;
    setCapacitaciones((prev) => prev.map((c) => (c.id === id ? { ...c, enlaceAcceso: enlaceAcceso || null } : c)));
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
      acceso_tipo: capacitacion.accesoTipo || "gratis",
      precio: capacitacion.accesoTipo === "paga" ? capacitacion.precio || null : null,
      precio_usd: capacitacion.accesoTipo === "paga" ? capacitacion.precioUsd || null : null,
      precio_promocional: capacitacion.accesoTipo === "paga" ? capacitacion.precioPromocional || null : null,
      precio_promocional_usd: capacitacion.accesoTipo === "paga" ? capacitacion.precioPromocionalUsd || null : null,
      promocion_hasta: capacitacion.accesoTipo === "paga" ? capacitacion.promocionHasta || null : null,
      cupos_promocional: capacitacion.accesoTipo === "paga" ? capacitacion.cuposPromocional || null : null,
      enlace_acceso: capacitacion.enlaceAcceso || null,
      plan_minimo_empresa: capacitacion.accesoTipo === "plan" ? capacitacion.planMinimoEmpresa || null : null,
      plan_minimo_candidato: capacitacion.accesoTipo === "plan" ? capacitacion.planMinimoCandidato || null : null,
    };
    const { data, error: insertError } = await supabase
      .from("capacitaciones")
      .insert(payload)
      .select()
      .single();
    if (insertError) throw insertError;
    setCapacitaciones((prev) => [...prev, mapCapacitacion(data, { candidatos: [], empresas: [] })]);
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
    publicarVacanteConPago,
    reservarConsultoria,
    cambiarEstadoVacante,
    postular,
    cambiarEstadoPostulacion,
    inscribirCapacitacion,
    crearCapacitacion,
    actualizarEnlaceCapacitacion,
    integrantes,
    codigoEmpresa,
    registrarIntegrante,
    eliminarIntegrante,
    consultorias,
    cambiarEstadoConsultoria,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp debe usarse dentro de <AppProvider>");
  return ctx;
}
