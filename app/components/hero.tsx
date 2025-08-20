"use client";

import React, { useEffect, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";

const TYPEFORM_LINK =
  process.env.NEXT_PUBLIC_TYPEFORM_URL ||
  "https://form.typeform.com/to/ei83l0Mg";

/* ---------------- Icons ---------------- */
function IconPlay({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path d="M4 2v20l18-10L4 2z" fill="currentColor" />
    </svg>
  );
}
function IconCheck({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path
        d="M20.285 6.708a1 1 0 0 0-1.414-1.416L9 15.17 5.129 11.3A1 1 0 0 0 3.715 12.715l4.243 4.243a1 1 0 0 0 1.414 0l9.913-9.913z"
        fill="currentColor"
      />
    </svg>
  );
}

/* ---------------- Modal with focus-trap ---------------- */
function DemoModal({
  open,
  onClose,
  src,
  title = "Demo video",
}: {
  open: boolean;
  onClose: () => void;
  src?: string;
  title?: string;
}) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";

    const el = dialogRef.current;
    if (!el) return;

    // focus first focusable element or dialog container
    const focusableSelector =
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
    const nodes = Array.from(
      el.querySelectorAll<HTMLElement>(focusableSelector)
    ).filter((n) => n.offsetWidth > 0 || n.offsetHeight > 0 || n.tabIndex >= 0);
    const first = nodes[0] ?? el;
    (first as HTMLElement).focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab") {
        // focus trap
        const all = nodes.length ? nodes : [el];
        const firstNode = all[0];
        const lastNode = all[all.length - 1];
        if (e.shiftKey && document.activeElement === firstNode) {
          e.preventDefault();
          (lastNode as HTMLElement).focus();
        } else if (!e.shiftKey && document.activeElement === lastNode) {
          e.preventDefault();
          (firstNode as HTMLElement).focus();
        }
      }
    }

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      try {
        previouslyFocused.current?.focus();
      } catch {}
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
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
        <h2 id="demo-modal-title" className="sr-only">
          {title}
        </h2>

        <div className="relative pb-[56.25%]">
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

/* ---------------- Hero ---------------- */
export default function HeroWithDemo() {
  const [modalOpen, setModalOpen] = useState(false);
  const demoEmbed = undefined;

  function scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const headerEl = document.querySelector("header[role='banner']");
    const headerHeight =
      headerEl instanceof HTMLElement ? headerEl.offsetHeight : 72;
    const rect = el.getBoundingClientRect();
    const absoluteTop = window.scrollY + rect.top;
    const targetY = Math.max(0, Math.floor(absoluteTop - headerHeight - 12));
    try {
      window.scrollTo({ top: targetY, behavior: "smooth" });
    } catch {
      el.scrollIntoView({ block: "start", behavior: "smooth" });
    }
    try {
      void trackEvent?.({ name: "hero_cta_scroll", params: { to: id } });
    } catch {}
  }

  function onPrimaryCta() {
    try {
      void trackEvent({
        name: "cta_click",
        params: { cta: "hero_beta", location: "hero" },
      });
    } catch {}
  }

  useEffect(() => {
    // small mount debug left commented — can enable if needed
    // console.debug("[HeroWithDemo] mounted");
  }, []);

  return (
    <>
      <section
        id="hero"
        aria-labelledby="hero-title"
        className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center pt-2"
      >
        {/* LEFT: copy */}
        <div>
          <h1
            id="hero-title"
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight gradient-text"
            style={{ lineHeight: 1.02 }}
          >
            De 1 episodio a 10 publicaciones — sin perder horas.
          </h1>

          <p className="mt-4 text-lg text-[var(--text)]">
            Sube el episodio y <strong>OasiClips</strong> genera clips
            optimizados, captions y thumbnails, y los programa en tus
            plataformas favoritas.{" "}
            <span className="ml-1 font-medium text-sm text-[var(--navy)]">
              3 meses Pro gratis para early-birds.
            </span>
          </p>

          <div className="mt-6 flex flex-wrap gap-3 items-center">
            <a
              href={TYPEFORM_LINK}
              target="_blank"
              rel="noreferrer"
              onClick={onPrimaryCta}
              className="inline-flex items-center gap-3 px-5 py-3 rounded-md font-medium shadow-md focus:outline-none btn-primary"
              aria-label="Accede a la beta (3 meses gratis)"
            >
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/10">
                <IconPlay className="w-3 h-3" />
              </span>
              Accede a la beta (3 meses gratis)
            </a>

            <button
              type="button"
              className="inline-flex items-center gap-2 text-sm px-4 py-3 rounded-md border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--turquoise)] btn-muted"
              onClick={() => scrollToSection("como-funciona")}
              aria-label="Ver cómo funciona"
            >
              Ver cómo funciona
            </button>
          </div>

          <ul className="mt-6 space-y-3 text-base text-[var(--text)]">
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

          <div className="mt-6 text-sm text-[var(--text)]">
            ¿Prefieres probar sin compromiso? Regístrate y recibirás créditos
            gratis para tus primeros 5 exports.
          </div>
        </div>

        {/* RIGHT: demo card */}
        <div>
          <div
            className="bg-white rounded-xl p-6 card-lift"
            style={{ boxShadow: "var(--shadow)" }}
          >
            <div className="text-sm font-medium text-[var(--text)]">
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
                aria-haspopup="dialog"
                aria-expanded={modalOpen}
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

            <div className="mt-4 text-sm text-[var(--text)]">
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
                className="block w-full text-center px-4 py-2 rounded-md font-semibold btn-primary"
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
    </>
  );
}
