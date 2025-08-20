// app/components/HeaderInlineLogo.integratedAnalytics.tsx
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  Variants,
  useReducedMotion,
  useAnimation,
} from "framer-motion";
import { Menu, X } from "lucide-react";
import logoOasi from "@/public/logo-oasiclips.svg";
import { trackEvent } from "@/lib/analytics";
import ThemeToggle from "@/app/components/themeToggle"; // <-- ajusta ruta si lo guardas en otro sitio

/* === config === */
const TYPEFORM_LINK =
  process.env.NEXT_PUBLIC_TYPEFORM_URL ||
  "https://form.typeform.com/to/ei83l0Mg";

const TOP_SCROLL_THRESHOLD = 64;
const NEAR_BOTTOM_THRESHOLD = 100;
const SCROLLSPY_SUPPRESS_MS = 700;
const UNDERLINE_ENTRY_MS = 360;
const MOBILE_CLOSE_DELAY_MS = 720; // corto para evitar race entre scroll y desmontaje

function slugify(label: string) {
  return label
    .normalize("NFD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();
}

export default function Header() {
  const reduce = useReducedMotion();
  const navControls = useAnimation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const navLabels = ["Features", "Cómo funciona", "Pricing", "FAQ"];
  const navItems = navLabels.map((l) => ({ label: l, id: slugify(l) }));

  const headerRef = useRef<HTMLElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const mobileMenuRef = useRef<HTMLElement | null>(null);
  const prevFocusedRef = useRef<HTMLElement | null>(null);
  const suppressScrollSpyRef = useRef(false);
  const suppressTimeoutRef = useRef<number | null>(null);
  const firstMenuEffectRef = useRef(true);

  /* Framer variants */
  const navContainer: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.09, delayChildren: 0.08 } },
  };
  const navItem: Variants = {
    hidden: { opacity: 0, y: -8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.36 } },
  };

  const logoIdle = reduce ? {} : { y: [0, -3, 0], rotate: [0, 0.5, 0] };

  useEffect(() => {
    if (reduce) {
      navControls.set("show");
      return;
    }
    const t = setTimeout(() => navControls.start("show"), 60);
    return () => clearTimeout(t);
  }, [reduce, navControls]);

  useEffect(() => {
    const onScrollHeader = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScrollHeader, { passive: true });
    return () => window.removeEventListener("scroll", onScrollHeader);
  }, []);

  useEffect(() => {
    // fallback if no IntersectionObserver
    if (!("IntersectionObserver" in globalThis)) {
      let raf = 0;
      let ticking = false;
      function getSections() {
        return navItems
          .map((n) => ({ id: n.id, el: document.getElementById(n.id) }))
          .filter((x): x is { id: string; el: HTMLElement } => Boolean(x.el));
      }
      function computeActiveFallback() {
        if (suppressScrollSpyRef.current) return;
        if ((globalThis as any).scrollY < TOP_SCROLL_THRESHOLD)
          return setActiveId(null);

        const secs = getSections();
        if (!secs.length) return setActiveId(null);

        const scrollBottom =
          (globalThis as any).innerHeight + (globalThis as any).scrollY;
        const docHeight = document.documentElement.scrollHeight;
        if (scrollBottom >= docHeight - NEAR_BOTTOM_THRESHOLD) {
          setActiveId(secs[secs.length - 1].id);
          return;
        }

        const vh =
          (globalThis as any).innerHeight ||
          document.documentElement.clientHeight;
        const refY = vh * 0.35;
        let best: { id: string; distance: number } | null = null;
        for (const { id, el } of secs) {
          const r = el.getBoundingClientRect();
          const elemMid = r.top + r.height / 2;
          const dist = Math.abs(elemMid - refY);
          if (!best || dist < best.distance) best = { id, distance: dist };
        }
        if (best) setActiveId(best.id);
      }

      function tick() {
        if (ticking) return;
        ticking = true;
        raf = (globalThis as any).requestAnimationFrame(() => {
          computeActiveFallback();
          ticking = false;
        });
      }

      const initial = (globalThis as any).setTimeout(computeActiveFallback, 80);
      (globalThis as any).addEventListener("scroll", tick, { passive: true });
      (globalThis as any).addEventListener("resize", tick);

      const mo = new MutationObserver(() => tick());
      mo.observe(document.body, { childList: true, subtree: true });

      return () => {
        (globalThis as any).clearTimeout(initial);
        (globalThis as any).cancelAnimationFrame(raf);
        (globalThis as any).removeEventListener("scroll", tick);
        (globalThis as any).removeEventListener("resize", tick);
        mo.disconnect();
      };
    }

    // Preferred: IntersectionObserver branch
    const sections = navItems
      .map((n) => ({ id: n.id, el: document.getElementById(n.id) }))
      .filter((x): x is { id: string; el: HTMLElement } => Boolean(x.el));

    if (sections.length === 0) {
      setActiveId(null);
      return;
    }

    let mounted = true;
    let observer: IntersectionObserver | null = null;

    const headerEl = document.querySelector(
      "header[role='banner']"
    ) as HTMLElement | null;
    const headerHeight = headerEl?.offsetHeight ?? 72;

    const rootMargin = `-${headerHeight + 8}px 0px -40% 0px`;
    const thresholds = [0, 0.15, 0.35, 0.6, 0.9];

    const ratios = new Map<string, number>();

    observer = new IntersectionObserver(
      (entries) => {
        if (!mounted) return;
        if (suppressScrollSpyRef.current) return;

        entries.forEach((ent) => {
          const id = (ent.target as HTMLElement).id;
          ratios.set(id, ent.intersectionRatio);
        });

        const scrollBottom =
          (globalThis as any).innerHeight + (globalThis as any).scrollY;
        const docHeight = document.documentElement.scrollHeight;
        if (scrollBottom >= docHeight - NEAR_BOTTOM_THRESHOLD) {
          const last = sections[sections.length - 1].id;
          setActiveId((prev) => (prev === last ? prev : last));
          return;
        }

        let bestId: string | null = null;
        let bestRatio = 0;
        for (const { id } of sections) {
          const r = ratios.get(id) ?? 0;
          if (r > bestRatio) {
            bestRatio = r;
            bestId = id;
          }
        }

        if ((globalThis as any).scrollY < TOP_SCROLL_THRESHOLD) {
          setActiveId(null);
          return;
        }

        if (bestId && bestRatio > 0.02) {
          setActiveId((prev) => (prev === bestId ? prev : bestId));
        }
      },
      { root: null, rootMargin, threshold: thresholds }
    );

    sections.forEach((s) => observer?.observe(s.el));

    const bootTimeout = (globalThis as any).setTimeout(() => {
      if (suppressScrollSpyRef.current) return;
      const vh =
        (globalThis as any).innerHeight ||
        document.documentElement.clientHeight;
      const refY = vh * 0.35;
      let best: { id: string; distance: number } | null = null;
      for (const { id, el } of sections) {
        const r = el.getBoundingClientRect();
        const elemMid = r.top + r.height / 2;
        const dist = Math.abs(elemMid - refY);
        if (!best || dist < best.distance) best = { id, distance: dist };
      }
      if (best) setActiveId(best.id);
    }, 100);

    const mo = new MutationObserver(() => {
      // noop for now — could re-create observer on significant header-size changes
    });
    mo.observe(document.body, { childList: true, subtree: true });

    function onResizeForObserver() {
      // nudge a scroll event to let IO recalc
      (globalThis as any).dispatchEvent(new Event("scroll"));
    }
    (globalThis as any).addEventListener("resize", onResizeForObserver);

    return () => {
      mounted = false;
      bootTimeout && (globalThis as any).clearTimeout(bootTimeout);
      if (observer) observer.disconnect();
      mo.disconnect();
      (globalThis as any).removeEventListener("resize", onResizeForObserver);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navItems.map((n) => n.id).join(",")]);

  // robust scrollToSection: double RAF then smooth scroll; set active immediately; suppress scrollspy briefly
  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    // compute target top accounting header
    const headerEl = document.querySelector(
      "header[role='banner']"
    ) as HTMLElement | null;
    const headerHeight = headerEl ? headerEl.offsetHeight : 72;

    const rect = el.getBoundingClientRect();
    const absoluteTop = window.scrollY + rect.top;
    const targetY = Math.max(0, Math.floor(absoluteTop - headerHeight - 8));

    // set active visually
    setActiveId(id);

    // suppress scrollspy so it doesn't fight programmatic navigation
    suppressScrollSpyRef.current = true;
    if (suppressTimeoutRef.current)
      window.clearTimeout(suppressTimeoutRef.current);

    // start smooth scroll with double RAF to avoid layout / unmount race
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        try {
          window.scrollTo({ top: targetY, behavior: "smooth" });
        } catch {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });

    suppressTimeoutRef.current = window.setTimeout(() => {
      suppressScrollSpyRef.current = false;
      window.dispatchEvent(new Event("scroll"));
    }, SCROLLSPY_SUPPRESS_MS);
  }, []);

  const isUnderlineVisible = useCallback(
    (id: string) =>
      reduce ? activeId === id : activeId === id || hoverId === id,
    [activeId, hoverId, reduce]
  );

  const underlineAnimate = useCallback(
    (visible: boolean) =>
      reduce
        ? { scaleX: visible ? 1 : 0, opacity: visible ? 1 : 0 }
        : { scaleX: visible ? 1 : 0, opacity: visible ? 1 : 0 },
    [reduce]
  );
  const underlineTransition = reduce
    ? { duration: 0 }
    : { duration: UNDERLINE_ENTRY_MS / 1000 };

  /* Analytics */
  const onCtaClick = useCallback((e: React.MouseEvent) => {
    try {
      void trackEvent({
        name: "cta_click",
        params: { cta: "beta_signup", location: "header", href: TYPEFORM_LINK },
      });
    } catch {}
  }, []);

  const onNavClick = useCallback((label: string, id: string) => {
    try {
      void trackEvent({
        name: "nav_click",
        params: { label, id, location: "header" },
      });
    } catch {}
  }, []);

  /* Mobile menu: ESC to close & focus trap */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && mobileOpen) {
        setMobileOpen(false);
        menuButtonRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) {
      // restore previous focus
      if (prevFocusedRef.current) {
        try {
          prevFocusedRef.current.focus();
        } catch {}
        prevFocusedRef.current = null;
      }
      return;
    }

    // save previously focused element
    prevFocusedRef.current = document.activeElement as HTMLElement | null;

    const container = mobileMenuRef.current;
    if (!container) {
      menuButtonRef.current?.focus();
      return;
    }

    const focusableSelector =
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
    const focusable = Array.from(
      container.querySelectorAll<HTMLElement>(focusableSelector)
    ).filter((el) => el.offsetParent !== null);

    const first = focusable[0] ?? container;
    const last = focusable[focusable.length - 1] ?? container;
    (first as HTMLElement).focus();

    function onKey(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        (first as HTMLElement).focus();
      }
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        (last as HTMLElement).focus();
      }
    }

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  /* analytics: avoid firing on first render */
  useEffect(() => {
    if (firstMenuEffectRef.current) {
      firstMenuEffectRef.current = false;
      return;
    }
    if (mobileOpen) {
      void trackEvent({
        name: "mobile_menu_open",
        params: { location: "header" },
      });
    } else {
      void trackEvent({
        name: "mobile_menu_close",
        params: { location: "header" },
      });
    }
  }, [mobileOpen]);

  // mantener --header-height sincronizada con la altura real del header
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const setHeaderHeight = () => {
      const h = el.offsetHeight || 72;
      document.documentElement.style.setProperty("--header-height", `${h}px`);
    };

    // initial set
    setHeaderHeight();

    // observe header resize (useful si cambia con contenido/animaciones)
    const ro = new ResizeObserver(setHeaderHeight);
    ro.observe(el);

    // guard for window resizes too
    window.addEventListener("resize", setHeaderHeight);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", setHeaderHeight);
    };
  }, []);

  const isReactComponentLogo =
    typeof (logoOasi as any) === "function" ||
    (typeof (logoOasi as any) === "object" && !!(logoOasi as any).$$typeof);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white px-3 py-2 rounded shadow"
        style={{ color: "var(--navy)", zIndex: 9999 }}
      >
        Ir al contenido
      </a>

      <motion.header
        ref={headerRef}
        role="banner"
        initial={false}
        animate={{
          paddingTop: scrolled ? "0.5rem" : "1rem",
          paddingBottom: scrolled ? "0.5rem" : "1rem",
          background: "var(--card-bg)", // antes usabas blanco/rgba fijo
          backdropFilter: scrolled ? "blur(6px)" : "none",
          boxShadow: scrolled ? "none" : "var(--shadow)",
        }}
        transition={{ duration: 0.28 }}
        className="fixed top-0 left-0 w-full z-50"
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 relative">
            <motion.div
              className="flex items-center justify-center rounded-full overflow-visible"
              animate={logoIdle}
              transition={{ duration: 4.5, repeat: Infinity }}
              whileHover={!reduce ? { scale: 1.04, rotate: 2 } : undefined}
              whileTap={!reduce ? { scale: 0.98 } : undefined}
              style={{ position: "relative", zIndex: 10 }}
            >
              <div
                className="rounded-full flex items-center justify-center"
                style={{
                  width: "40px",
                  height: "40px",
                  display: "grid",
                  placeItems: "center",
                  background:
                    "radial-gradient(60% 60% at 30% 20%, rgba(168,230,207,0.10), transparent 40%)",
                  transition: "transform 220ms ease, box-shadow 220ms ease",
                }}
              >
                <div
                  className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14"
                  aria-hidden
                >
                  {isReactComponentLogo ? (
                    // @ts-ignore
                    React.createElement(logoOasi as any, {
                      className: "w-full h-full",
                    })
                  ) : (
                    <Image
                      src={logoOasi as any}
                      alt="OasiClips logo"
                      width={120}
                      height={120}
                      priority
                      sizes="(max-width: 640px) 40px, (min-width: 768px) 48px, 56px"
                      decoding="async"
                      fetchPriority="high"
                      className="object-contain w-full h-full"
                    />
                  )}
                </div>
              </div>

              <motion.span
                aria-hidden="true"
                className="absolute -top-1 -right-1 md:-top-2 md:-right-2 hidden md:inline-flex items-center px-2 py-0.5 text-[10px] md:text-xs font-semibold rounded-full shadow"
                initial={reduce ? false : { scale: 0.9, opacity: 0 }}
                animate={
                  reduce ? {} : { scale: 1, opacity: scrolled ? 0.85 : 1 }
                }
                transition={reduce ? undefined : { duration: 0.26 }}
                whileHover={!reduce ? { scale: 1.06 } : undefined}
                style={{
                  backgroundColor: "var(--mint)",
                  color: "var(--navy)",
                  boxShadow: "0 6px 20px rgba(3,60,87,0.08)",
                }}
              >
                Beta
              </motion.span>

              <span className="sr-only">OasiClips — actualmente en Beta</span>
            </motion.div>

            <div className="leading-tight" style={{ zIndex: 12 }}>
              <h1
                className="text-sm md:text-base lg:text-lg font-extrabold tracking-tight"
                style={{ color: "var(--text-strong)", marginBottom: 2 }}
              >
                OasiClips
              </h1>
              <p
                className="text-xs md:text-sm"
                style={{ color: "var(--text)" }}
              >
                Repurpose + Distribute for Podcasters
              </p>
            </div>
          </div>

          {/* Desktop nav */}
          <motion.nav
            className="hidden md:flex items-center gap-6 text-sm font-medium"
            variants={navContainer}
            initial="hidden"
            animate={navControls}
            aria-label="Main navigation"
            role="navigation"
          >
            {navItems.map(({ label, id }) => {
              const isActive = activeId === id;
              const visible = isUnderlineVisible(id);

              return (
                <motion.a
                  key={id}
                  href={`#${id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavClick(label, id);
                    scrollToSection(id);
                  }}
                  variants={navItem}
                  className={`relative transition-colors group nav-link ${
                    isActive
                      ? "text-[var(--turquoise)] font-bold"
                      : "text-[var(--text-strong)]"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                  onMouseEnter={() => setHoverId(id)}
                  onMouseLeave={() => setHoverId((h) => (h === id ? null : h))}
                  onFocus={() => setHoverId(id)}
                  onBlur={() => setHoverId((h) => (h === id ? null : h))}
                >
                  <span className="relative z-10">{label}</span>

                  <motion.span
                    className="absolute left-0 -bottom-1 h-[2px] bg-[var(--turquoise)] w-full origin-left nav-underline"
                    aria-hidden
                    initial={false}
                    animate={underlineAnimate(visible)}
                    transition={underlineTransition}
                    style={{ transformOrigin: "left", display: "block" }}
                  />
                </motion.a>
              );
            })}
          </motion.nav>

          {/* CTA + ThemeToggle + mobile toggle */}
          <div className="flex items-center gap-3">
            <div className="hidden md:block flex-shrink-0">
              <motion.a
                href={TYPEFORM_LINK}
                target="_blank"
                rel="noreferrer"
                onClick={onCtaClick}
                className="inline-block px-4 py-2.5 rounded-lg text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mint)]"
                style={{
                  backgroundColor: "var(--coral)",
                  color: "var(--white)",
                  boxShadow: "var(--shadow)",
                }}
                initial={{ scale: 0.98, opacity: 0.96 }}
                animate={
                  reduce
                    ? { scale: 1, opacity: 1 }
                    : { scale: [1, 1.06, 1], opacity: 1 }
                }
                transition={{ duration: 1.1 }}
                whileHover={!reduce ? { scale: 1.06 } : undefined}
                aria-label="Apuntate a la beta"
              >
                🚀 Apúntate a la beta
              </motion.a>
            </div>
            {/* Theme toggle (desktop + mobile) */}
            <div className="flex items-center">
              <ThemeToggle />
            </div>

            <button
              onClick={() => setMobileOpen((s) => !s)}
              ref={menuButtonRef}
              className="md:hidden p-2 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mint)] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              style={{ color: "var(--navy)" }}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              id="mobile-menu"
              ref={mobileMenuRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: reduce ? 0.05 : 0.22 }}
              className="md:hidden border-t"
              style={{ background: "var(--white)", borderColor: "#E6E9EB" }}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
            >
              <div className="px-6 py-4 space-y-4 text-sm font-medium">
                {navItems.map(({ label, id }) => {
                  const isActive = activeId === id;
                  return (
                    <a
                      key={id}
                      href={`#${id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onNavClick(label, id);
                        // start robust scroll
                        scrollToSection(id);
                        // close mobile menu shortly after starting scroll to avoid unmount race
                        setTimeout(
                          () => setMobileOpen(false),
                          MOBILE_CLOSE_DELAY_MS
                        );
                      }}
                      className={`block transition-colors ${
                        isActive
                          ? "text-[var(--turquoise)] font-bold"
                          : "text-[var(--text)]"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {label}
                    </a>
                  );
                })}

                <motion.a
                  href={TYPEFORM_LINK}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full px-5 py-2 rounded-lg text-sm font-semibold text-center"
                  style={{
                    backgroundColor: "var(--coral)",
                    color: "var(--white)",
                    boxShadow: "var(--shadow)",
                  }}
                  onClick={() => setMobileOpen(false)}
                  whileHover={!reduce ? { scale: 1.03 } : undefined}
                >
                  🚀 Apúntate a la beta
                </motion.a>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </motion.header>

      <style jsx>{`
        a.nav-link {
          display: inline-block;
        }
      `}</style>
    </>
  );
}
