// app/page.tsx
import Header from "@/app/components/header";
import CookieConsent from "@/app/components/cookieConsent";
import Hero from "@/app/components/hero";

export const metadata = {
  title: "OasiClips",
  description: "Repurpose + Distribute for Podcasters",
};

const TYPEFORM_LINK =
  process.env.NEXT_PUBLIC_TYPEFORM_URL ||
  "https://form.typeform.com/to/ei83l0Mg";

export default function Landing() {
  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--background)", color: "var(--text)" }}
    >
      {/* SKIP LINK */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 px-3 py-2 rounded shadow"
        style={{
          background: "var(--card-bg)",
          color: "var(--text-strong)",
          zIndex: 9999,
        }}
      >
        Ir al contenido
      </a>

      <Header />

      <main
        id="main"
        className="max-w-6xl mx-auto px-6"
        style={{
          paddingTop: "calc(var(--header-height, 72px) + 3rem)",
          paddingBottom: "3rem",
        }}
      >
        {/* ---- HERO ---- */}
        <Hero />

        {/* ---- Features ---- */}
        <section id="features" className="mt-16">
          <h3
            className="text-2xl font-bold"
            style={{ color: "var(--text-strong)" }}
          >
            Lo que hace por tí
          </h3>

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

        {/* ---- Cómo funciona ---- */}
        <section
          id="como-funciona"
          className="mt-16 p-8 rounded-xl shadow"
          style={{
            background: "var(--card-bg)",
            border: `1px solid var(--border)`,
          }}
        >
          <h3
            className="text-2xl font-bold"
            style={{ color: "var(--text-strong)" }}
          >
            Cómo funciona — 3 pasos
          </h3>
          <ol
            className="mt-6 space-y-4 list-decimal pl-5"
            style={{ color: "var(--text)" }}
          >
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

        {/* ---- Pricing ---- */}
        <section id="pricing" className="mt-16">
          <h3
            className="text-2xl font-bold"
            style={{ color: "var(--text-strong)" }}
          >
            Pricing (preview)
          </h3>

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

          <div className="mt-4 text-sm" style={{ color: "var(--muted)" }}>
            ¿Buscas pricing custom? Contáctanos para planes enterprise y
            partnerships.
          </div>
        </section>

        {/* ---- FAQ ---- */}
        <section
          id="faq"
          className="mt-16 p-8 rounded-xl shadow"
          style={{
            background: "var(--card-bg)",
            border: `1px solid var(--border)`,
          }}
        >
          <h3
            className="text-2xl font-bold"
            style={{ color: "var(--text-strong)" }}
          >
            FAQ
          </h3>

          <details className="mt-4">
            <summary className="cursor-pointer font-medium">
              ¿Cómo se publica en plataformas?
            </summary>
            <p className="mt-2" style={{ color: "var(--text)" }}>
              Usamos las APIs públicas (YouTube Data API) y workflows asistidos
              para plataformas que limitan la publicación automática. Empezamos
              con YouTube y TikTok (beta).
            </p>
          </details>

          <details className="mt-4">
            <summary className="cursor-pointer font-medium">
              ¿Qué datos recogéis?
            </summary>
            <p className="mt-2" style={{ color: "var(--text)" }}>
              Recolectamos métricas públicas de rendimiento (views, likes) y
              datos de cuenta para publicar. No compartimos tus datos con
              terceros sin permiso.
            </p>
          </details>

          <details className="mt-4">
            <summary className="cursor-pointer font-medium">
              ¿Cuál es el incentivo para early-birds?
            </summary>
            <p className="mt-2" style={{ color: "var(--text)" }}>
              3 meses Pro gratis al registrarte en la beta — plazas limitadas.
            </p>
          </details>
        </section>
      </main>

      <footer
        className="mt-12 border-t"
        style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}
      >
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between">
          <div className="text-sm" style={{ color: "var(--muted)" }}>
            © {new Date().getFullYear()} OasiClips — Built for podcasters.
          </div>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a
              href="#"
              className="text-sm hover:underline"
              style={{ color: "var(--muted)" }}
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-sm hover:underline"
              style={{ color: "var(--muted)" }}
            >
              Terms
            </a>
          </div>
        </div>
      </footer>

      <CookieConsent />
    </div>
  );
}

/* ----------------------- Helpers ----------------------- */
interface FeatureCardProps {
  title: string;
  desc: string;
}
function FeatureCard({ title, desc }: FeatureCardProps) {
  return (
    <div
      className="p-4 rounded-lg shadow-sm"
      style={{
        background: "var(--card-bg)",
        border: `1px solid var(--border)`,
      }}
    >
      <h4 className="font-semibold" style={{ color: "var(--text-strong)" }}>
        {title}
      </h4>
      <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
        {desc}
      </p>
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
      className="p-6 rounded-xl"
      style={{
        background: "var(--card-bg)",
        border: `2px solid ${
          highlight ? "rgba(99,102,241,0.25)" : "var(--border)"
        }`,
        boxShadow: highlight ? "0 8px 28px rgba(2,6,23,0.08)" : "var(--shadow)",
      }}
    >
      <div className="flex items-baseline justify-between">
        <h4
          className="text-lg font-semibold"
          style={{ color: "var(--text-strong)" }}
        >
          {title}
        </h4>
        <div
          className="text-2xl font-bold"
          style={{ color: "var(--text-strong)" }}
        >
          {price}
        </div>
      </div>
      <ul className="mt-4 space-y-2 text-sm" style={{ color: "var(--muted)" }}>
        {bullets.map((b, i) => (
          <li key={i}>• {b}</li>
        ))}
      </ul>
      {note && (
        <div
          className="mt-4 text-xs font-medium"
          style={{ color: "var(--turquoise)" }}
        >
          {note}
        </div>
      )}
      <a
        href={TYPEFORM_LINK}
        target="_blank"
        rel="noreferrer"
        className="mt-6 inline-block w-full text-center px-4 py-2 rounded-md"
        style={{
          background: "#4f46e5" /* indigo-600 */,
          color: "#ffffff",
          boxShadow: "var(--shadow)",
          fontWeight: 600,
        }}
      >
        Únete a la beta
      </a>
    </div>
  );
}
