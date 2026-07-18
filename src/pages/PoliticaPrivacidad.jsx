import { Link } from "react-router-dom";
import { Badge } from "../components/ui.jsx";

function H2({ children }) {
  return <h2 className="text-xl font-extrabold text-navy-900 mt-10 mb-3">{children}</h2>;
}
function P({ children }) {
  return <p className="text-navy-600 leading-relaxed mb-4">{children}</p>;
}
function Li({ children }) {
  return <li className="text-navy-600 leading-relaxed mb-2">{children}</li>;
}

export default function PoliticaPrivacidad() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <Badge tone="teal">Legal</Badge>
      <h1 className="text-3xl font-extrabold text-navy-900 mt-3 mb-2">Política de Privacidad</h1>
      <p className="text-sm text-navy-400 mb-8">Última actualización: 18 de julio de 2026.</p>

      <P>
        Esta Política de Privacidad describe cómo SAS Consultora ("SAS Consultora", "nosotros")
        recolecta, usa, comparte y protege los datos personales de quienes usan
        SAS Talento &amp; Desarrollo (la "Plataforma"), en cumplimiento de la Ley 25.326 de
        Protección de los Datos Personales de la República Argentina y sus normas complementarias.
      </P>

      <H2>1. Quién es el responsable del tratamiento</H2>
      <P>
        El responsable del tratamiento de los datos personales recolectados a través de la
        Plataforma es SAS Consultora, unidad de negocios de RRHH. Podés contactarnos por
        cualquier consulta relacionada con tus datos personales escribiendo a{" "}
        <a href="mailto:sasconsultora24@gmail.com" className="text-teal-600 font-semibold">
          sasconsultora24@gmail.com
        </a>{" "}
        o a{" "}
        <a href="mailto:rrhh@sasconsultora.com" className="text-teal-600 font-semibold">
          rrhh@sasconsultora.com
        </a>
        .
      </P>

      <H2>2. Qué datos recolectamos</H2>
      <P>Según el tipo de cuenta que crees en la Plataforma, recolectamos:</P>
      <ul className="list-disc pl-6 mb-4">
        <Li>
          <strong>Candidatos/profesionales:</strong> nombre, email, teléfono, ubicación, título
          profesional, resumen, habilidades, nivel de experiencia, disponibilidad horaria,
          currículum (CV) en archivo PDF o Word, y referencias laborales que vos mismo cargues
          (nombre y contacto de terceros).
        </Li>
        <Li>
          <strong>Empresas/PYMEs:</strong> nombre de la empresa, rubro, tamaño, ubicación,
          nombre y datos de la persona de contacto, email.
        </Li>
        <Li>
          <strong>Datos de cuenta:</strong> email y contraseña (la contraseña se almacena
          encriptada, nunca en texto plano, a través de nuestro proveedor de autenticación).
        </Li>
        <Li>
          <strong>Datos de uso de la Plataforma:</strong> vacantes a las que te postulás,
          capacitaciones y mentorías en las que te inscribís, plan contratado y estado de tus
          pagos (fecha, monto y estado — nunca el número de tarjeta ni datos financieros
          completos, que son procesados directamente por Mercado Pago).
        </Li>
      </ul>

      <H2>3. Para qué usamos tus datos</H2>
      <P>Usamos los datos que recolectamos para:</P>
      <ul className="list-disc pl-6 mb-4">
        <Li>Crear y administrar tu cuenta y tu perfil en la Plataforma.</Li>
        <Li>
          Conectar candidatos con vacantes publicadas por empresas, y permitir que las empresas
          registradas busquen y contacten candidatos.
        </Li>
        <Li>Gestionar inscripciones a capacitaciones y reservas de mentorías.</Li>
        <Li>Procesar el pago de planes de empresa y de la membresía premium de candidato.</Li>
        <Li>
          Enviarte notificaciones por email relacionadas con tu actividad en la Plataforma (por
          ejemplo, cuando llega una postulación o cambia el estado de una de tus postulaciones).
        </Li>
        <Li>Cumplir obligaciones legales y responder a requerimientos de autoridades competentes.</Li>
      </ul>
      <P>
        No usamos tus datos para publicidad de terceros ni los vendemos a otras empresas.
      </P>

      <H2>4. Con quién compartimos tus datos</H2>
      <ul className="list-disc pl-6 mb-4">
        <Li>
          <strong>Empresas registradas en la Plataforma:</strong> si sos candidato, tu perfil
          (incluido tu CV) es visible para las empresas que buscan candidatos o que reciben tu
          postulación a una vacante. Ver la sección 5 sobre este punto.
        </Li>
        <Li>
          <strong>Proveedores tecnológicos que usamos para operar la Plataforma:</strong>{" "}
          Supabase (base de datos, autenticación y almacenamiento de archivos, con
          infraestructura ubicada en San Pablo, Brasil), Resend (envío de emails
          transaccionales) y Mercado Pago (procesamiento de pagos). Estos proveedores acceden a
          los datos estrictamente necesarios para prestar su servicio y están obligados
          contractualmente a protegerlos.
        </Li>
        <Li>
          <strong>Autoridades públicas:</strong> cuando la ley nos obligue o ante un
          requerimiento judicial válido.
        </Li>
      </ul>
      <P>
        Como parte de nuestra infraestructura está alojada en Brasil, tus datos pueden ser
        transferidos y almacenados fuera de la Argentina. Trabajamos únicamente con proveedores
        que ofrecen garantías de seguridad adecuadas para ese tratamiento.
      </P>

      <H2>5. Visibilidad de tu perfil como candidato</H2>
      <P>
        Si te registrás como candidato, tu perfil (nombre, título, ubicación, nivel,
        habilidades, resumen y CV) queda visible para las empresas registradas en la Plataforma,
        tanto en el buscador de candidatos como cuando te postulás a una vacante puntual. Esto es
        necesario para el funcionamiento del servicio: sin esta visibilidad, las empresas no
        podrían evaluar tu postulación. Al crear tu cuenta te pedimos tu consentimiento explícito
        para esto — podés retirarlo en cualquier momento dándote de baja (ver sección 8).
      </P>

      <H2>6. Cuánto tiempo conservamos tus datos</H2>
      <P>
        Conservamos tus datos mientras tu cuenta esté activa. Si pedís la baja de tu cuenta,
        eliminamos o anonimizamos tus datos personales dentro de un plazo razonable, salvo que
        debamos conservar cierta información por obligaciones legales o contables (por ejemplo,
        registros de pagos).
      </P>

      <H2>7. Seguridad</H2>
      <P>
        Aplicamos medidas técnicas razonables para proteger tus datos: acceso a la base de datos
        restringido por reglas de seguridad a nivel de fila (cada usuario solo accede a lo que le
        corresponde), conexión cifrada (HTTPS) en toda la Plataforma, y contraseñas nunca
        almacenadas en texto plano. Ningún sistema es 100% infalible, pero trabajamos para
        mantener estas protecciones actualizadas.
      </P>

      <H2>8. Tus derechos (Acceso, Rectificación, Actualización y Supresión)</H2>
      <P>
        De acuerdo a la Ley 25.326, tenés derecho a acceder a tus datos personales, pedir su
        rectificación o actualización si están desactualizados, y pedir su supresión cuando
        corresponda. También podés editar la mayoría de tus datos vos mismo desde tu panel
        ("Mi perfil"). Para cualquier otro pedido relacionado con tus datos, incluyendo la baja
        completa de tu cuenta, escribinos a{" "}
        <a href="mailto:sasconsultora24@gmail.com" className="text-teal-600 font-semibold">
          sasconsultora24@gmail.com
        </a>
        .
      </P>
      <P>
        La Agencia de Acceso a la Información Pública (AAIP), Órgano de Control de la Ley
        25.326, es la autoridad de aplicación en materia de protección de datos personales en
        Argentina. Tenés derecho a presentar una reclamación ante la AAIP si considerás que no
        tratamos tus datos de forma adecuada.
      </P>

      <H2>9. Menores de edad</H2>
      <P>
        La Plataforma está destinada a personas mayores de 18 años. No solicitamos
        deliberadamente datos de menores de edad.
      </P>

      <H2>10. Cookies y almacenamiento local</H2>
      <P>
        Usamos almacenamiento local del navegador únicamente con fines técnicos, para mantener tu
        sesión iniciada. No usamos cookies de publicidad ni de seguimiento de terceros.
      </P>

      <H2>11. Cambios a esta política</H2>
      <P>
        Podemos actualizar esta Política de Privacidad para reflejar cambios en la Plataforma o
        en la normativa aplicable. Vamos a publicar cualquier cambio en esta misma página con su
        fecha de actualización.
      </P>

      <P>
        Ver también nuestros{" "}
        <Link to="/terminos" className="text-teal-600 font-semibold">
          Términos y Condiciones
        </Link>
        .
      </P>
    </div>
  );
}
