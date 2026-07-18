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

export default function TerminosCondiciones() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <Badge tone="teal">Legal</Badge>
      <h1 className="text-3xl font-extrabold text-navy-900 mt-3 mb-2">Términos y Condiciones</h1>
      <p className="text-sm text-navy-400 mb-8">Última actualización: 18 de julio de 2026.</p>

      <P>
        Estos Términos y Condiciones regulan el uso de SAS Talento &amp; Desarrollo (la
        "Plataforma"), operada por SAS Consultora. Al crear una cuenta o usar la Plataforma,
        aceptás estos términos.
      </P>

      <H2>1. Qué es la Plataforma</H2>
      <P>
        SAS Talento &amp; Desarrollo conecta a pequeñas y medianas empresas ("PYMEs") con
        candidatos y profesionales, y ofrece publicación de vacantes, búsqueda de candidatos,
        capacitaciones, mentorías y servicios de recursos humanos gestionados por SAS Consultora.
      </P>

      <H2>2. Cuentas y veracidad de la información</H2>
      <ul className="list-disc pl-6 mb-4">
        <Li>Para usar la mayoría de las funciones de la Plataforma necesitás crear una cuenta.</Li>
        <Li>
          Sos responsable de mantener la confidencialidad de tu contraseña y de toda la actividad
          que ocurra en tu cuenta.
        </Li>
        <Li>
          Te comprometés a cargar información veraz sobre vos (o tu empresa) y a mantenerla
          actualizada. Podemos suspender o dar de baja cuentas con información falsa.
        </Li>
      </ul>

      <H2>3. Publicación de vacantes</H2>
      <P>
        Toda vacante publicada por una empresa queda en estado "pendiente" hasta que un
        administrador de SAS Consultora la revisa y aprueba. Nos reservamos el derecho de
        rechazar o dar de baja vacantes que incumplan la ley (por ejemplo, ofertas
        discriminatorias) o que no correspondan a un puesto de trabajo real.
      </P>

      <H2>4. Postulaciones y contacto entre usuarios</H2>
      <P>
        La Plataforma facilita el contacto entre candidatos y empresas, pero SAS Consultora no
        es parte de ninguna relación laboral que eventualmente se genere entre ellos. No
        garantizamos que una postulación derive en una contratación, ni intervenimos en las
        condiciones laborales que acuerden candidato y empresa por fuera de los servicios que
        SAS Consultora presta directamente (por ejemplo, un proceso de selección a medida).
      </P>

      <H2>5. Planes pagos y pagos</H2>
      <ul className="list-disc pl-6 mb-4">
        <Li>
          Los planes de empresa y la membresía premium de candidato son pagos mensuales que se
          procesan a través de Mercado Pago. SAS Consultora no almacena datos de tarjetas ni
          medios de pago.
        </Li>
        <Li>
          Un pago aprobado extiende la vigencia del plan por 30 días desde la fecha de pago (o
          desde el vencimiento anterior, si renovás antes de que venza).
        </Li>
        <Li>
          Si un pago es rechazado o no se renueva, el plan queda vencido; te avisamos el estado
          de tu plan desde tu panel.
        </Li>
        <Li>
          Los precios pueden actualizarse. Cualquier cambio de precio aplica a partir de la
          siguiente renovación, no de forma retroactiva a un período ya pagado.
        </Li>
        <Li>
          Ante cualquier problema con un pago o una duda sobre reembolsos, escribinos a{" "}
          <a href="mailto:sasconsultora24@gmail.com" className="text-teal-600 font-semibold">
            sasconsultora24@gmail.com
          </a>{" "}
          y lo vemos caso por caso.
        </Li>
      </ul>

      <H2>6. Uso aceptable</H2>
      <P>No podés usar la Plataforma para:</P>
      <ul className="list-disc pl-6 mb-4">
        <Li>Publicar contenido falso, engañoso, discriminatorio o ilegal.</Li>
        <Li>Intentar acceder a cuentas o datos de otros usuarios sin autorización.</Li>
        <Li>
          Extraer datos de la Plataforma de forma masiva o automatizada (scraping) sin nuestro
          consentimiento expreso.
        </Li>
        <Li>Usar los datos de contacto de otros usuarios para fines distintos a los previstos por la Plataforma (por ejemplo, envío de spam).</Li>
      </ul>

      <H2>7. Propiedad intelectual</H2>
      <P>
        La marca, el diseño y el software de la Plataforma pertenecen a SAS Consultora. El
        contenido que vos cargás (tu CV, la descripción de tu empresa, etc.) sigue siendo tuyo;
        al cargarlo, nos das permiso para mostrarlo dentro de la Plataforma con los fines
        descriptos en la Política de Privacidad.
      </P>

      <H2>8. Limitación de responsabilidad</H2>
      <P>
        La Plataforma se ofrece "tal cual está". Hacemos un esfuerzo razonable para mantenerla
        disponible y funcionando correctamente, pero no garantizamos que esté libre de errores o
        interrupciones. En la medida permitida por la ley, SAS Consultora no es responsable por
        daños indirectos derivados del uso de la Plataforma, ni por las decisiones de
        contratación que tomen las empresas ni por la información que carguen los usuarios.
      </P>

      <H2>9. Suspensión y baja de cuenta</H2>
      <P>
        Podés dar de baja tu cuenta cuando quieras escribiéndonos. Podemos suspender o dar de
        baja una cuenta que incumpla estos Términos, previo aviso salvo casos graves.
      </P>

      <H2>10. Ley aplicable</H2>
      <P>
        Estos Términos se rigen por las leyes de la República Argentina. Cualquier conflicto se
        resuelve ante los tribunales competentes de Paraná, Entre Ríos, sin perjuicio de las
        normas de protección al consumidor que resulten aplicables.
      </P>

      <H2>11. Cambios a estos Términos</H2>
      <P>
        Podemos actualizar estos Términos para reflejar cambios en la Plataforma. Vamos a
        publicar cualquier cambio en esta misma página con su fecha de actualización.
      </P>

      <P>
        Ver también nuestra{" "}
        <Link to="/privacidad" className="text-teal-600 font-semibold">
          Política de Privacidad
        </Link>
        .
      </P>
    </div>
  );
}
