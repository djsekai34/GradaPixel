import LegalPage from "@/components/layout/LegalPage";
import { useConsent } from "@/components/consents/consent-context";
import { site } from "@/lib/site";

export default function CookiesPage() {
  const { setPanel } = useConsent();

  return (
    <LegalPage title="Política de cookies">
      <h2>¿Qué son las cookies y tecnologías similares?</h2>
      <p>
        Son pequeños archivos o datos que una web guarda en tu dispositivo. En{" "}
        {site.name} usamos también el almacenamiento local del navegador
        (localStorage), que funciona de forma parecida y está sujeto a las
        mismas reglas.
      </p>

      <h2>Qué usamos en {site.name}</h2>
      <p>
        Esta web{" "}
        <strong>
          no utiliza cookies de analítica, publicidad ni seguimiento
        </strong>
        . Solo guarda lo siguiente:
      </p>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Finalidad</th>
              <th>Titular</th>
              <th>Duración</th>
              <th>¿Requiere tu consentimiento?</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>gp-cookie-consent</td>
              <td>Recordar tu elección sobre las cookies.</td>
              <td>Propia</td>
              <td>Hasta 24 meses</td>
              <td>No: es necesaria para respetar tu elección.</td>
            </tr>
            <tr>
              <td>theme</td>
              <td>Recordar si prefieres el modo claro o el oscuro.</td>
              <td>Propia</td>
              <td>Hasta que la borres</td>
              <td>No: es una personalización que eliges tú.</td>
            </tr>
            <tr>
              <td>gp-voter-id</td>
              <td>
                Identificador anónimo para que puedas votar una vez por
                artículo.
              </td>
              <td>Propia</td>
              <td>Hasta que la borres</td>
              <td>
                No: es necesaria para la función de votar que tú solicitas.
              </td>
            </tr>
            <tr>
              <td>gp-vote:nombre-del-artículo</td>
              <td>Recordar qué voto diste a cada artículo.</td>
              <td>Propia</td>
              <td>Hasta que la borres</td>
              <td>No: misma razón que la anterior.</td>
            </tr>
            <tr>
              <td>gp-newsletter</td>
              <td>
                Recordar que has cerrado o completado el aviso de la newsletter,
                para no volver a mostrártelo enseguida.
              </td>
              <td>Propia</td>
              <td>
                Hasta que la borres (el aviso puede volver a mostrarse pasados
                30 días)
              </td>
              <td>No: respeta tu elección.</td>
            </tr>
            <tr>
              <td>Cookies de YouTube</td>
              <td>Reproducir los vídeos incrustados.</td>
              <td>Google (YouTube)</td>
              <td>Según Google</td>
              <td>
                Sí. Solo se cargan si aceptas los vídeos en el panel de cookies
                o pulsas «Cargar este vídeo». Antes de eso, YouTube no recibe
                nada.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Cómo cambiar tu elección</h2>
      <p>
        Puedes aceptar, rechazar o cambiar tu elección en cualquier momento, tan
        fácil como la diste:{" "}
        <button
          type="button"
          onClick={() => setPanel("settings")}
          className="text-azul underline"
        >
          abrir la configuración de cookies
        </button>
        . También encontrarás el botón «Configurar cookies» al pie de todas las
        páginas. Pasados 24 meses, o si cambiamos las categorías, te volveremos
        a preguntar.
      </p>

      <h2>Terceros</h2>
      <p>
        Cuando se carga un vídeo, se usa el reproductor de YouTube en su modo de
        privacidad mejorada. Google trata los datos conforme a su propia
        política. Puedes consultarla en{" "}
        <a
          href="https://policies.google.com/technologies/cookies"
          target="_blank"
          rel="noopener noreferrer"
        >
          policies.google.com/technologies/cookies
        </a>
        .
      </p>

      <h2>Cómo borrarlas desde el navegador</h2>
      <p>
        Puedes eliminar los datos guardados desde los ajustes de tu navegador
        (Chrome, Firefox, Safari, Edge...), en el apartado de privacidad o de
        datos de sitios. Si lo haces, se perderá tu preferencia de modo claro u
        oscuro, el recuerdo de tus votos y esta elección, y podrás votar de
        nuevo como si fuera la primera vez.
      </p>

      <h2>Cambios en esta política</h2>
      <p>
        Si añadimos otras cookies (por ejemplo, de analítica o publicidad),
        actualizaremos esta página y te pediremos tu consentimiento antes de
        usarlas.
      </p>

      <h2>Contacto</h2>
      <p>
        Si tienes dudas, escríbenos a{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>
    </LegalPage>
  );
}
