"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useLenis } from "lenis/react";
import { useEffect, useRef, useState } from "react";
import { event } from "@/content/site";
import { GdgLogo } from "./shapes";

const links = [
  { href: "#lineup", label: "Lineup" },
  { href: "#speakers", label: "Speakers" },
  { href: "#badge", label: "Badge" },
  { href: "#venue", label: "Venue" },
  { href: "#faq", label: "FAQ" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const lenis = useLenis();
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const button = toggle.current;
    lenis?.stop();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      window.removeEventListener("keydown", onKey);
      button?.focus();
    };
  }, [open, lenis]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
        <nav
          aria-label="Main"
          className="ink-border mx-auto flex max-w-6xl items-center gap-1.5 rounded-full bg-paper/90 py-1.5 pr-1.5 pl-3 whitespace-nowrap backdrop-blur-md sm:gap-2 sm:pl-4"
        >
          <a href="#top" className="flex min-w-0 items-center gap-2 rounded-full py-1 pr-1 sm:gap-2.5 sm:pr-2" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            <GdgLogo className="h-5 w-auto shrink-0 sm:h-6" squash={hover} />
            <span className="truncate text-sm font-bold tracking-tight sm:text-[15px]">DevFest Kochi</span>
          </a>
          <ul className="ml-auto hidden items-center lg:flex">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="rounded-full px-3 py-2 text-[15px] transition-colors hover:bg-ink/6">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href={event.ticketsUrl}
            target="_blank"
            rel="noopener"
            className="ink-border ml-auto shrink-0 rounded-full bg-(--track) px-4 py-2 text-[15px] font-bold transition-transform active:scale-95 max-md:hidden lg:ml-2"
          >
            Get tickets
          </a>
          <button
            ref={toggle}
            type="button"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
            className="ink-border grid size-9 shrink-0 place-items-center rounded-full bg-white max-md:ml-auto sm:size-10 lg:hidden"
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
              <motion.path animate={{ d: open ? "M3 3L15 15" : "M2 5H16" }} stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <motion.path animate={{ d: open ? "M3 15L15 3" : "M2 13H16" }} stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            data-lenis-prevent
            className="fixed inset-0 z-40 overflow-y-auto overscroll-contain bg-paper px-5 pt-24 pb-8 lg:hidden"
            initial={{ clipPath: "circle(0% at calc(100% - 44px) 40px)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 44px) 40px)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 44px) 40px)" }}
            transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] }}
          >
            <ul className="grid gap-1 [@media(max-height:520px)]:grid-cols-2">
              {links.map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + i * 0.04, type: "spring", stiffness: 400, damping: 30 }}
                >
                  <a href={l.href} onClick={() => setOpen(false)} className="block py-2 text-5xl font-bold tracking-tight [@media(max-height:520px)]:text-4xl">
                    {l.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <p className="mt-10 font-mono text-sm text-ink-soft [@media(max-height:520px)]:mt-4">
              {event.dateLabel}
              <br />
              {event.place}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <TicketButton hidden={open} />
    </>
  );
}

/* Phones only: the nav CTA is hidden there, so this takes over once the hero's button scrolls away. */
function TicketButton({ hidden }: { hidden: boolean }) {
  const [past, setPast] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", () => {
    const hero = document.getElementById("top");
    const footer = document.querySelector("footer");
    const heroGone = !hero || hero.getBoundingClientRect().bottom < window.innerHeight * 0.3;
    setPast(heroGone && (!footer || footer.getBoundingClientRect().top > window.innerHeight));
  });

  return (
    <AnimatePresence>
      {past && !hidden && (
        <motion.a
          href={event.ticketsUrl}
          target="_blank"
          rel="noopener"
          className="ink-border fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 inline-flex items-center gap-2 rounded-full bg-(--track) py-3 pr-5 pl-4 text-lg font-bold shadow-[3px_4px_0_var(--color-ink)] transition-colors duration-500 active:translate-y-0.5 active:shadow-[1px_2px_0_var(--color-ink)] md:hidden"
          initial={{ y: 90, rotate: -8 }}
          animate={{ y: 0, rotate: 0 }}
          exit={{ y: 90, rotate: 8 }}
          transition={{ type: "spring", stiffness: 420, damping: 26 }}
        >
          <svg aria-hidden width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round">
            <path d="M3 8a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2a2 2 0 0 0 0 4v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2a2 2 0 0 0 0-4Z" />
            <path d="M14 7v10" strokeDasharray="2 2" />
          </svg>
          Get tickets
        </motion.a>
      )}
    </AnimatePresence>
  );
}
