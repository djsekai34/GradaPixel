import LegalPage from "@/components/layout/LegalPage"
import { site } from "@/lib/site"

export default function TermsPage() {
  return (
    <LegalPage title="Términos y condiciones de uso">
      <h2>Titular del sitio web</h2>
      <p>
        En cumplimiento del artículo 10 de la Ley 34/2002 de servicios de la sociedad de la
        información y de comercio electrónico, te informamos de que este sitio web, {site.name}{" "}
        ({site.url}), es titularidad de:
      </p>
      <ul>
        <li>Titular: {site.owner}</li>
        <li>NIF/CIF: {site.taxId}</li>
        <li>Domicilio: {site.address}</li>
        <li>
          Correo electrónico: <a href={`mailto:${site.email}`}>{site.email}</a>
        </li>
      </ul>

      <h2>Objeto</h2>
      <p>
        {site.name} es un medio digital de información sobre deporte y videojuegos. El acceso y uso
        del sitio implican la aceptación de estos términos.
      </p>

      <h2>Uso del sitio</h2>
      <p>
        Te comprometes a usar la web de forma lícita y a no realizar acciones que puedan dañarla,
        sobrecargarla o falsear las valoraciones de los artículos (por ejemplo, votando de forma
        automatizada).
      </p>

      <h2>Propiedad intelectual</h2>
      <p>
        Los textos, imágenes, logotipos, diseños y demás contenidos de {site.name} están protegidos
        por la normativa de propiedad intelectual e industrial. Queda prohibida su reproducción,
        distribución o comunicación pública sin autorización, salvo los usos permitidos por la ley,
        como el derecho de cita con mención de la fuente y enlace al artículo original. Las marcas y
        contenidos de terceros mencionados pertenecen a sus respectivos titulares.
      </p>

      <h2>Contenidos y responsabilidad</h2>
      <p>
        Procuramos que la información sea rigurosa y esté actualizada, pero no garantizamos que
        carezca de errores ni que el sitio funcione sin interrupciones. Si detectas un error en una
        noticia, escríbenos para que lo revisemos. Las opiniones firmadas por sus autores no reflejan
        necesariamente la posición de {site.name}.
      </p>

      <h2>Enlaces y contenidos de terceros</h2>
      <p>
        Esta web puede enlazar a sitios externos o incrustar contenidos de terceros, como vídeos de
        YouTube. No controlamos esos sitios ni somos responsables de sus contenidos o políticas.
      </p>

      <h2>Privacidad y cookies</h2>
      <p>
        El tratamiento de tus datos se explica en la <a href="/privacidad">política de privacidad</a>{" "}
        y el uso de cookies en la <a href="/cookies">política de cookies</a>.
      </p>

      <h2>Modificaciones</h2>
      <p>
        Podemos modificar estos términos cuando sea necesario. La versión vigente es la publicada en
        esta página, con su fecha de actualización.
      </p>

      <h2>Legislación aplicable</h2>
      <p>
        Estos términos se rigen por la legislación española. Para cualquier controversia, serán
        competentes los juzgados y tribunales que correspondan conforme a la normativa vigente.
      </p>
    </LegalPage>
  )
}