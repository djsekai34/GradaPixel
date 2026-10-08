import LegalPage from "@/components/layout/LegalPage"
import { site } from "@/lib/site"

export default function PrivacyPage() {
  return (
    <LegalPage title="Política de privacidad">
      <h2>Responsable del tratamiento</h2>
      <ul>
        <li>Titular: {site.owner}</li>
        <li>NIF/CIF: {site.taxId}</li>
        <li>Domicilio: {site.address}</li>
        <li>
          Correo electrónico: <a href={`mailto:${site.email}`}>{site.email}</a>
        </li>
      </ul>

      <h2>Qué datos tratamos y para qué</h2>
      <h3>Valoración de artículos</h3>
      <p>
        Cuando votas un artículo guardamos el artículo, tu puntuación, la fecha y un identificador
        anónimo generado en tu navegador. No te pedimos nombre ni correo. Aun así, un identificador
        único puede considerarse un dato personal, por lo que lo tratamos como tal.
      </p>
      <ul>
        <li>Finalidad: permitir una votación por lector y artículo y calcular la media.</li>
        <li>Base jurídica: tu solicitud de usar la función de votar y nuestro interés legítimo en evitar votos duplicados.</li>
        <li>Conservación: mientras el artículo siga publicado o hasta que solicites su supresión.</li>
      </ul>

            <h3>Mensajes de contacto</h3>
      <p>
        Si nos escribes por el formulario de contacto o por correo, usaremos tu nombre, tu correo y
        tu mensaje solo para responderte.
      </p>
      <ul>
        <li>Base jurídica: tu consentimiento al escribirnos.</li>
        <li>
          Conservación: el tiempo necesario para atender tu consulta y las obligaciones legales
          aplicables.
        </li>
        <li>
          Destinatarios: EmailJS, que envía el mensaje a nuestro correo electrónico como encargado
          del tratamiento.
        </li>
      </ul>
       <h3>Newsletter</h3>
      <p>
        Si te suscribes, guardamos tu correo electrónico, la fecha de tu solicitud y de tu
        confirmación (la suscripción se confirma en dos pasos) y el estado de tu suscripción.
      </p>
      <ul>
        <li>Finalidad: enviarte por correo avisos de los nuevos artículos que publiquemos.</li>
        <li>Base jurídica: tu consentimiento, que puedes retirar en cualquier momento.</li>
                <li>
          Conservación: mientras estés suscrito. Cuando te das de baja, o si no llegas a confirmar tu
          suscripción, eliminamos tu correo de la lista como máximo en un mes. Para poder acreditar
          que hemos respetado tu decisión, conservamos durante tres años un registro seudonimizado:
          no guardamos tu correo en claro, sino una huella cifrada junto con las fechas de
          suscripción, confirmación y baja.
        </li>
        <li>
          Baja: cada correo incluye un enlace para darte de baja, y también puedes hacerlo desde la
          página de <a href="/newsletter">Newsletter</a>.
        </li>
      </ul>

      <h3>Datos técnicos</h3>
      <p>
        Como en cualquier web, el proveedor de alojamiento y los servicios que usamos pueden
        registrar datos técnicos de conexión (como la dirección IP) por motivos de seguridad y
        funcionamiento.
      </p>

      <h2>Quién más accede a los datos</h2>
      <ul>
        <li>Supabase, que aloja la base de datos de votos y actúa como encargado del tratamiento.</li>
        <li>{site.hosting}, que aloja la web.</li>
        <li>Google (YouTube), solo si pulsas «Cargar vídeo». Consulta la <a href="/cookies">política de cookies</a>.</li>
                <li>Resend, que envía los correos, y Supabase, que guarda la lista de suscriptores, como encargados del tratamiento.</li>
      </ul>
      <p>No vendemos tus datos ni los usamos para publicidad ni para elaborar perfiles.</p>

      <h2>Tus derechos</h2>
      <p>
        Puedes ejercer los derechos de acceso, rectificación, supresión, oposición, limitación del
        tratamiento y portabilidad escribiendo a <a href={`mailto:${site.email}`}>{site.email}</a>.
        Como el identificador de voto es anónimo y se guarda solo en tu navegador, para localizar
        tus votos podemos pedirte el valor de la clave <code>gp-voter-id</code> de tu navegador.
      </p>
      <p>
        Si consideras que no tratamos tus datos correctamente, puedes presentar una reclamación ante
        la Agencia Española de Protección de Datos (
        <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">aepd.es</a>).
      </p>

      <h2>Normativa aplicable</h2>
      <p>
        Reglamento (UE) 2016/679 (RGPD), Ley Orgánica 3/2018 (LOPDGDD) y Ley 34/2002 (LSSI-CE).
      </p>

      <h2>Cambios en esta política</h2>
      <p>
        Publicaremos aquí cualquier cambio e indicaremos la fecha de la última actualización.
      </p>
    </LegalPage>
  )
}