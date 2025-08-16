// components/HeroWithDemo.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";

const TYPEFORM_LINK =
  process.env.NEXT_PUBLIC_TYPEFORM_URL ||
  "https://form.typeform.com/to/ei83l0Mg";

/** Small SVG icons (inline for fidelity + no extra requests) */
function IconPlay(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <path d="M4 2v20l18-10L4 2z" fill="currentColor" />
    </svg>
  );
}
function IconCheck(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <path
        d="M20.285 6.708a1 1 0 0 0-1.414-1.416L9 15.17 5.129 11.3A1 1 0 0 0 3.715 12.715l4.243 4.243a1 1 0 0 0 1.414 0l9.913-9.913z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Simple accessible modal (no external libs) */
function DemoModal({
  open,
  onClose,
  src,
  title = "Demo video",
}: {
  open: boolean;
  onClose: () => void;
  src?: string; // e.g. YouTube embed url or video url
  title?: string;
}) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const prevActiveRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      prevActiveRef.current = document.activeElement as HTMLElement | null;
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", onKey);
      // focus the dialog container
      setTimeout(() => dialogRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      try {
        prevActiveRef.current?.focus();
      } catch {
        /* ignore */
      }
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative z-10 max-w-3xl w-full rounded-xl overflow-hidden bg-black"
        style={{ boxShadow: "0 20px 48px rgba(3,60,87,0.28)" }}
      >
        <div className="relative pb-[56.25%]">
          {/* 16:9 responsive iframe/video */}
          {src ? (
            <iframe
              src={src}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          ) : (
            <video
              controls
              className="absolute inset-0 w-full h-full object-cover bg-black"
              controlsList="nodownload"
            >
              <source src="/demo-sample.mp4" type="video/mp4" />
              {/* fallback text */}
              Tu navegador no soporta reproduccion de video.
            </video>
          )}
        </div>

        <button
          onClick={onClose}
          aria-label="Cerrar demo"
          className="absolute top-3 right-3 z-20 inline-flex items-center justify-center rounded-full w-9 h-9 text-white/90 bg-black/40 hover:bg-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mint)]"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default function HeroWithDemo() {
  const [modalOpen, setModalOpen] = useState(false);

  // If you have a specific youtube embed (use the embed URL) set here:
  // e.g. "https://www.youtube.com/embed/VIDEO_ID?autoplay=1"
  const demoEmbed = undefined;

  // Smooth scroll helper that accounts for fixed header
  function scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const headerEl = document.querySelector("header[role='banner']");
    const headerHeight =
      headerEl instanceof HTMLElement ? headerEl.offsetHeight : 72;
    const rect = el.getBoundingClientRect();
    const absoluteTop = window.scrollY + rect.top;
    const targetY = Math.max(0, Math.floor(absoluteTop - headerHeight - 12));
    // prefer scrollTo with smooth
    try {
      window.scrollTo({ top: targetY, behavior: "smooth" });
    } catch {
      el.scrollIntoView({ block: "start", behavior: "smooth" });
    }
    // send small analytics event
    try {
      void trackEvent?.({
        name: "hero_cta_scroll",
        params: { to: id },
      });
    } catch {}
  }

  function onPrimaryCta() {
    try {
      void trackEvent({
        name: "cta_click",
        params: { cta: "hero_beta", location: "hero" },
      });
    } catch {}
    // open typeform in new tab handled by anchor
  }

  // Respect reduced motion: don't auto animate heavy things
  const prefersReduced =
    typeof window !== "undefined" &&
    window?.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <>
      <section
        id="hero"
        className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center"
        aria-labelledby="hero-title"
      >
        {/* LEFT: copy */}
        <div>
          <h2
            id="hero-title"
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight"
            style={{
              background:
                "linear-gradient(90deg, var(--turquoise), var(--navy))",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            De 1 episodio a 10 publicaciones — sin perder horas.
          </h2>

          <p className="mt-4 text-lg" style={{ color: "var(--text)" }}>
            Sube el episodio y <strong>OasiClips</strong> genera clips
            optimizados, captions y thumbnails, y los programa en tus
            plataformas favoritas.{" "}
            <span
              className="ml-1 font-medium text-sm"
              style={{ color: "var(--navy)" }}
            >
              3 meses Pro gratis para early-birds.
            </span>
          </p>

          <div className="mt-6 flex flex-wrap gap-3 items-center">
            <a
              href={TYPEFORM_LINK}
              target="_blank"
              rel="noreferrer"
              onClick={onPrimaryCta}
              className="inline-flex items-center gap-3 px-5 py-3 rounded-md font-medium shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mint)]"
              style={{
                backgroundColor: "var(--coral)",
                color: "var(--white)",
                boxShadow: "var(--shadow)",
              }}
              aria-label="Accede a la beta (3 meses gratis)"
            >
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/10">
                <IconPlay className="w-3 h-3" />
              </span>
              Accede a la beta (3 meses gratis)
            </a>

            <button
              type="button"
              className="inline-flex items-center gap-2 text-sm px-4 py-3 rounded-md border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--turquoise)]"
              onClick={() => scrollToSection("como-funciona")}
              style={{
                borderColor: "rgba(3,60,87,0.06)",
                color: "var(--navy)",
                background: "transparent",
              }}
              aria-label="Ver cómo funciona"
            >
              Ver cómo funciona
            </button>
          </div>

          <ul
            className="mt-6 space-y-3 text-base"
            style={{ color: "var(--text)" }}
          >
            <li className="flex items-start gap-3">
              <span
                className="flex-shrink-0 mt-1 text-[var(--mint)]"
                aria-hidden
              >
                <IconCheck className="w-5 h-5" />
              </span>
              <span>
                Ahorra tiempo: edita y publica en múltiples plataformas en
                minutos.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span
                className="flex-shrink-0 mt-1 text-[var(--mint)]"
                aria-hidden
              >
                <IconCheck className="w-5 h-5" />
              </span>
              <span>
                Maximiza alcance: captions y thumbnails optimizados por IA.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span
                className="flex-shrink-0 mt-1 text-[var(--mint)]"
                aria-hidden
              >
                <IconCheck className="w-5 h-5" />
              </span>
              <span>
                Monetiza mejor: conecta con micro-patrocinios (próximamente).
              </span>
            </li>
          </ul>

          <div className="mt-6 text-sm" style={{ color: "var(--text)" }}>
            ¿Prefieres probar sin compromiso? Regístrate y recibirás créditos
            gratis para tus primeros 5 exports.
          </div>
        </div>

        {/* RIGHT: demo card */}
        <div>
          <div
            className="bg-white rounded-xl p-6 transform transition-shadow"
            style={{
              boxShadow: "var(--shadow)",
              transition: prefersReduced
                ? "none"
                : "transform 220ms ease, box-shadow 220ms ease",
            }}
          >
            <div
              className="text-sm font-medium"
              style={{ color: "var(--text)" }}
            >
              Demo rápido
            </div>

            <div
              className="mt-4 rounded-md overflow-hidden relative h-56 flex items-center justify-center"
              role="group"
              aria-label="Demo de OasiClips — vídeo de ejemplo"
              style={{
                background:
                  "linear-gradient(180deg, rgba(3,60,87,0.95) 0%, rgba(0,194,199,0.08) 100%)",
              }}
            >
              {/* Play button */}
              <button
                type="button"
                aria-label="Reproducir demo"
                onClick={() => {
                  setModalOpen(true);
                  try {
                    void trackEvent?.({
                      name: "demo_open",
                      params: { location: "hero" },
                    });
                  } catch {}
                }}
                className="group inline-flex items-center justify-center rounded-full w-14 h-14 md:w-16 md:h-16 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mint)]"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  backdropFilter: "blur(6px)",
                  color: "var(--white)",
                }}
              >
                <IconPlay className="w-6 h-6 md:w-7 md:h-7" />
              </button>

              <div className="absolute bottom-3 left-3 right-3 text-xs text-left text-white/90 pointer-events-none">
                <div className="font-semibold">Vídeo / Mockup</div>
                <div className="mt-1 text-[12px] text-white/80">
                  Súbelo y obtén 3 clips sugeridos listos para publicar.
                </div>
              </div>
            </div>

            <div className="mt-4 text-sm" style={{ color: "var(--text)" }}>
              Sube un episodio, revisa 3 clips sugeridos, edita y programa.
            </div>

            <div className="mt-4">
              <a
                href={TYPEFORM_LINK}
                target="_blank"
                rel="noreferrer"
                onClick={() => {
                  try {
                    void trackEvent({
                      name: "cta_click",
                      params: { cta: "demo_beta", location: "hero_card" },
                    });
                  } catch {}
                }}
                className="block w-full text-center px-4 py-2 rounded-md font-semibold"
                style={{
                  backgroundColor: "var(--coral)",
                  color: "var(--white)",
                  boxShadow: "var(--shadow)",
                }}
                aria-label="Quiero la beta"
              >
                Quiero la beta
              </a>
            </div>
          </div>
        </div>
      </section>

      <DemoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        src={demoEmbed}
        title="OasiClips demo"
      />

      {/* Local styling for tiny entrance & micro-interactions */}
      <style jsx>{`
        :root {
          --underline-duration: 260ms;
          --underline-ease: cubic-bezier(0.22, 1, 0.36, 1);
        }
        /* reveal */
        #hero > div {
          opacity: 0;
          transform: translateY(8px);
          animation: revealUp 520ms var(--underline-ease) forwards;
        }
        #hero > div:nth-child(1) {
          animation-delay: 80ms;
        }
        #hero > div:nth-child(2) {
          animation-delay: 160ms;
        }

        @keyframes revealUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* CTA pulse on first paint (subtle) */
        a[aria-label="Accede a la beta (3 meses gratis)"] {
          animation: ctaPulse 1200ms ease-out 1;
        }
        @keyframes ctaPulse {
          0% {
            transform: scale(0.985);
          }
          50% {
            transform: scale(1.03);
          }
          100% {
            transform: scale(1);
          }
        }

        /* ensure the demo card lifts on hover only on pointer fine devices */
        @media (hover: hover) and (pointer: fine) {
          .bg-white:hover {
            transform: translateY(-6px);
            box-shadow: 0 14px 32px rgba(3, 60, 87, 0.12);
          }
        }

        /* accessible focus styles (complement tailwind) */
        button:focus-visible,
        a:focus-visible {
          outline: none;
          box-shadow: 0 0 0 4px rgba(168, 230, 207, 0.18);
          border-radius: 8px;
        }

        @media (prefers-reduced-motion: reduce) {
          #hero > div {
            animation: none !important;
            transform: none !important;
          }
          a[aria-label="Accede a la beta (3 meses gratis)"] {
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
}
