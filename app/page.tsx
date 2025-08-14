import HeaderTransparentOnScroll from "@/app/components/headerTransparentOnScroll";
import CookieConsent from "./components/cookieConsent";
("@/app/components/cookieConsent");

export const metadata = {
  title: "OasiClips",
  description: "Repurpose + Distribute for Podcasters",
};
const TYPEFORM_LINK =
  process.env.NEXT_PUBLIC_TYPEFORM_URL ||
  "https://form.typeform.com/to/ei83l0Mg";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* SKIP LINK global: visible on keyboard focus */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white px-3 py-2 rounded shadow"
        style={{ color: "var(--navy)", zIndex: 9999 }}
      >
        Ir al contenido
      </a>
      <HeaderTransparentOnScroll />
      <main id="main" className="max-w-6xl mx-auto px-6 py-12">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-4xl font-extrabold leading-tight">
              De 1 episodio a 10 publicaciones — sin perder horas.
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Sube el episodio y OasiClips genera clips optimizados, captions,
              thumbnails y los programa en tus plataformas favoritas. 3 meses
              Pro gratis para early-birds.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={TYPEFORM_LINK}
                target="_blank"
                rel="noreferrer"
                className="bg-indigo-600 text-white px-5 py-3 rounded-md font-medium shadow"
              >
                Accede a la beta (3 meses gratis)
              </a>
              <a
                href="#how"
                className="text-sm px-4 py-3 rounded-md border border-gray-200"
              >
                Ver cómo funciona
              </a>
            </div>

            <ul className="mt-6 space-y-3 text-gray-700">
              <li>
                ✅ Ahorra tiempo: edita y publica en múltiples plataformas en
                minutos.
              </li>
              <li>
                ✅ Maximiza alcance: captions y thumbnails optimizados por IA.
              </li>
              <li>
                ✅ Monetiza mejor: conecta con micro-patrocinios (próximamente).
              </li>
            </ul>

            <div className="mt-6 text-sm text-gray-500">
              ¿Prefieres probar sin compromiso? Regístrate y recibirás créditos
              gratis para tus primeros 5 exports.
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-sm text-gray-500">Demo rápido</div>
            <div className="mt-4 rounded-md overflow-hidden bg-black h-56 flex items-center justify-center text-white">
              Vídeo / Mockup
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Sube un episodio, revisa 3 clips sugeridos, edita y programa.
            </div>
            <div className="mt-4">
              <a
                href={TYPEFORM_LINK}
                target="_blank"
                rel="noreferrer"
                className="block text-center bg-indigo-600 text-white px-4 py-2 rounded-md"
              >
                Quiero la beta
              </a>
            </div>
          </div>
        </section>

        <section id="features" className="mt-16">
          <h3 className="text-2xl font-bold">Lo que hace por tí</h3>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              title="Generación automática de clips"
              desc="El sistema detecta momentos relevantes y genera clips verticales/horizontal listos para publicar."
            />
            <FeatureCard
              title="Captions y títulos optimizados"
              desc="Variantes A/B y captions pensados para maximizar retención y clicks."
            />
            <FeatureCard
              title="Publicación & Scheduler"
              desc="Programa y publica en YouTube, TikTok y más con un solo click (beta)."
            />
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              title="Thumbnails y audiograms"
              desc="Miniaturas automáticas y audiograms atractivos para cada clip."
            />
            <FeatureCard
              title="Dashboard de rendimiento"
              desc="Métricas clave por clip y recomendaciones para repostear."
            />
            <FeatureCard
              title="Marketplace de sponsors"
              desc="Matchmaking automático con micro-patrocinios (próximamente)."
            />
          </div>
        </section>

        <section
          id="como-funciona"
          className="mt-16 bg-white p-8 rounded-xl shadow"
        >
          <h3 className="text-2xl font-bold">Cómo funciona — 3 pasos</h3>
          <ol className="mt-6 space-y-4 list-decimal pl-5 text-gray-700">
            <li>
              <strong>Sube tu episodio:</strong> sube audio o vídeo y elige el
              punto de origen.
            </li>
            <li>
              <strong>Genera y revisa:</strong> recibes 3 clips, captions y
              thumbnails — edítalos si quieres.
            </li>
            <li>
              <strong>Programa y publica:</strong> selecciona plataformas y deja
              que el sistema publique o te recuerde.
            </li>
          </ol>
        </section>

        <section id="pricing" className="mt-16">
          <h3 className="text-2xl font-bold">Pricing (preview)</h3>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <PriceCard
              title="Freemium"
              price="0€/mes"
              bullets={[
                "5 exports / mes",
                "Watermark",
                "1 plataforma conectada",
              ]}
              highlight={false}
            />
            <PriceCard
              title="Pro"
              price="15€/mes"
              bullets={[
                "50 exports / mes",
                "2 plataformas",
                "Captions + thumbnails",
                "Soporte básico",
              ]}
              highlight={true}
              note="3 meses gratis para early-birds"
            />
            <PriceCard
              title="Studio"
              price="79€/mes"
              bullets={[
                "Teams hasta 5",
                "Prioridad de render",
                "Routing inteligente",
                "Integraciones a medida",
              ]}
              highlight={false}
            />
          </div>
          <div className="mt-4 text-sm text-gray-600">
            ¿Buscas pricing custom? Contáctanos para planes enterprise y
            partnerships.
          </div>
        </section>

        <section id="faq" className="mt-16 bg-white p-8 rounded-xl shadow">
          <h3 className="text-2xl font-bold">FAQ</h3>
          <details className="mt-4">
            <summary className="cursor-pointer font-medium">
              ¿Cómo se publica en plataformas?
            </summary>
            <p className="mt-2 text-gray-700">
              Usamos las APIs públicas (YouTube Data API) y workflows asistidos
              para plataformas que limitan la publicación automática. Empezamos
              con YouTube y TikTok (beta).
            </p>
          </details>
          <details className="mt-4">
            <summary className="cursor-pointer font-medium">
              ¿Qué datos recogéis?
            </summary>
            <p className="mt-2 text-gray-700">
              Recolectamos métricas públicas de rendimiento (views, likes) y
              datos de cuenta para publicar. No compartimos tus datos con
              terceros sin permiso.
            </p>
          </details>
          <details className="mt-4">
            <summary className="cursor-pointer font-medium">
              ¿Cuál es el incentivo para early-birds?
            </summary>
            <p className="mt-2 text-gray-700">
              3 meses Pro gratis al registrarte en la beta — plazas limitadas.
            </p>
          </details>
        </section>
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between">
          <div className="text-sm text-gray-600">
            © {new Date().getFullYear()} OasiClips — Built for podcasters.
          </div>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="text-sm text-gray-500 hover:underline">
              Privacy
            </a>
            <a href="#" className="text-sm text-gray-500 hover:underline">
              Terms
            </a>
          </div>
        </div>
      </footer>
      <CookieConsent />
    </div>
  );
}
interface FeatureCardProps {
  title: string;
  desc: string;
}
function FeatureCard({ title, desc }: FeatureCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h4 className="font-semibold">{title}</h4>
      <p className="mt-2 text-sm text-gray-600">{desc}</p>
    </div>
  );
}
interface PriceCardProps {
  title: string;
  price: string;
  bullets: string[];
  highlight: boolean;
  note?: string;
}

function PriceCard({ title, price, bullets, highlight, note }: PriceCardProps) {
  return (
    <div
      className={`p-6 rounded-xl ${
        highlight
          ? "border-2 border-indigo-200 shadow-lg"
          : "border border-gray-100"
      } bg-white`}
    >
      <div className="flex items-baseline justify-between">
        <h4 className="text-lg font-semibold">{title}</h4>
        <div className="text-2xl font-bold">{price}</div>
      </div>
      <ul className="mt-4 space-y-2 text-sm text-gray-600">
        {bullets.map((b, i) => (
          <li key={i}>• {b}</li>
        ))}
      </ul>
      {note && (
        <div className="mt-4 text-xs text-indigo-600 font-medium">{note}</div>
      )}
      <a
        href={TYPEFORM_LINK}
        target="_blank"
        rel="noreferrer"
        className="mt-6 inline-block w-full text-center bg-indigo-600 text-white px-4 py-2 rounded-md"
      >
        Únete a la beta
      </a>
    </div>
  );
}
