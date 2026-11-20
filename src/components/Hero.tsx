"use client";

import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { event } from "@/content/site";
import { Brace } from "./shapes";
import { useNow } from "./use-now";

const Toybox = dynamic(() => import("./Toybox"), { ssr: false });

const spring = { type: "spring", stiffness: 260, damping: 22 } as const;

function canRender3D() {
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
  if (nav.connection?.saveData || (navigator.hardwareConcurrency ?? 4) < 3) return false;
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

export default function Hero() {
  const hero = useRef<HTMLElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [toybox, setToybox] = useState(false);

  // Counted from when the hero's bottom reaches the screen's bottom: on short screens the hero is taller than the
  // viewport, and fading from the top would dim the button and countdown before they're ever fully in view.
  const { scrollYProgress } = useScroll({ target: hero, offset: ["end end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 220]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  useEffect(() => {
    if (!canRender3D()) return;
    const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 200));
    idle(() => setToybox(true));
  }, []);

  return (
    <section ref={hero} id="top" className="relative flex min-h-[100svh] flex-col items-center justify-end overflow-hidden px-4 pt-24 pb-16 [mask-image:linear-gradient(to_top,transparent,black_3.5rem)] sm:justify-center sm:pt-28 sm:pb-10">
      {toybox && <Toybox source={hero} clear={content} />}

      <motion.div ref={content} style={{ y, scale, opacity }} className="pointer-events-none relative z-10 flex flex-col items-center text-center">
        <h1 className="flex items-center gap-[0.04em] text-[clamp(3.3rem,16vw,11.5rem)] leading-[0.9] font-bold tracking-[-0.045em]">
          <span className="sr-only">DevFest Kochi 2026</span>
          <motion.span aria-hidden initial={{ x: -60, opacity: 0, rotate: -12 }} animate={{ x: 0, opacity: 1, rotate: 0 }} transition={{ ...spring, delay: 0.15 }}>
            <Brace side="left" className="h-[1.15em] w-auto text-(--track) transition-colors duration-500" />
          </motion.span>
          <span aria-hidden className="flex overflow-hidden px-[0.04em] pb-[0.08em]">
            {"DevFest".split("").map((c, i) => (
              <motion.span key={i} initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ ...spring, delay: 0.25 + i * 0.045 }}>
                {c}
              </motion.span>
            ))}
          </span>
          <motion.span aria-hidden initial={{ x: 60, opacity: 0, rotate: 12 }} animate={{ x: 0, opacity: 1, rotate: 0 }} transition={{ ...spring, delay: 0.15 }}>
            <Brace side="right" className="h-[1.15em] w-auto text-(--track) transition-colors duration-500" />
          </motion.span>
        </h1>

        <motion.div
          className="mt-3 flex items-stretch overflow-hidden rounded-full ink-border bg-white text-[clamp(1rem,2.6vw,1.6rem)] sm:mt-5"
          initial={{ scaleX: 0.2, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ ...spring, delay: 0.6 }}
        >
          <span className="px-5 py-1.5 sm:px-7">
            <span lang="ml" className="font-malayalam">കൊച്ചി</span> <span className="text-ink-soft">|</span> Kochi
          </span>
          <span className="border-l-2 border-ink bg-(--track) px-5 py-1.5 transition-colors duration-500 sm:px-7">2026</span>
        </motion.div>

        <motion.p
          className="mt-6 max-w-[30ch] text-[clamp(1.05rem,2.2vw,1.5rem)] leading-snug text-balance sm:mt-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.5 }}
        >
          {event.theme}
        </motion.p>
        <motion.p
          className="mt-2.5 font-mono text-[13px] text-ink-soft sm:mt-3 sm:text-base"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <time dateTime={event.start}>
            <span className="sm:hidden">{event.shortLabel}</span>
            <span className="max-sm:hidden">
              {event.dateLabel} · {event.timeLabel} · {event.place}
            </span>
          </time>
        </motion.p>

        <motion.a
          href={event.ticketsUrl}
          target="_blank"
          rel="noopener"
          className="group ink-border pointer-events-auto mt-7 inline-flex items-center gap-3 rounded-full bg-ink py-4 pr-4 pl-8 text-xl font-bold whitespace-nowrap text-paper transition-transform hover:-rotate-2 active:scale-95 sm:mt-9 sm:py-5 sm:pr-5 sm:pl-10 sm:text-2xl"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.5 }}
        >
          Get tickets
          <span aria-hidden className="grid size-9 place-items-center rounded-full bg-(--track) text-ink transition-[transform,background-color] duration-300 group-hover:translate-x-1 sm:size-11">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9h11M10 4l5 5-5 5" />
            </svg>
          </span>
        </motion.a>

        <Countdown />
      </motion.div>
    </section>
  );
}

const units = [
  ["days", 86400, Infinity],
  ["hours", 3600, 24],
  ["min", 60, 60],
  ["sec", 1, 60],
] as const;

function Countdown() {
  const now = useNow();

  const start = Date.parse(event.start);
  const end = Date.parse(event.end);
  const left = now === null ? null : Math.max(0, Math.floor((start - now) / 1000));

  if (now !== null && now >= start) {
    return (
      <p className="mt-8 font-mono text-lg sm:mt-12" role="status">
        {now < end ? `We're live at ${event.place} right now.` : "That's a wrap. See you at DevFest 2027."}
      </p>
    );
  }

  return (
    <div className="mt-8 flex gap-2 sm:mt-12 sm:gap-3" role="timer" aria-label="Time until DevFest Kochi starts">
      {units.map(([label, size, mod]) => {
        const value = left === null ? null : Math.floor(left / size) % mod;
        const text = value === null ? "--" : String(value).padStart(2, "0");
        return (
          <div key={label} className="ink-border flex min-w-[4.1rem] flex-col items-center rounded-[1.25rem] bg-white/85 px-2.5 pt-1.5 pb-1 backdrop-blur-sm sm:min-w-[5.4rem] sm:rounded-3xl sm:px-3 sm:pt-2 sm:pb-1.5">
            <span className="relative flex h-8 overflow-hidden font-mono text-[1.75rem] leading-8 font-medium tabular-nums sm:h-11 sm:text-4xl sm:leading-11">
              {text.split("").map((ch, i) => (
                <AnimatePresence key={i} mode="popLayout" initial={false}>
                  <motion.span key={ch} initial={{ y: "-100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 500, damping: 34 }}>
                    {ch}
                  </motion.span>
                </AnimatePresence>
              ))}
            </span>
            <span className="font-mono text-xs text-ink-soft">{label}</span>
          </div>
        );
      })}
    </div>
  );
}
