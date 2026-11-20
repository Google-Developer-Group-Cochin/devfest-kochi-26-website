"use client";

import { motion } from "motion/react";
import { useRef, type CSSProperties } from "react";
import { event, film, road } from "@/content/site";
import { attempt } from "./eggs";
import { KochiArt } from "./KochiArt";

const frames = [
  ["Build", "bg-pastel-blue", "kathakali"],
  ["Secure", "bg-pastel-red", "ferry"],
  ["Scale", "bg-pastel-green", "cheenavala"],
  ["Agentic era", "bg-pastel-yellow", "houseboat"],
  ["Kochi", "bg-white", "synagogue"],
] as const;

function FilmRoll() {
  const reel = (copy: number) => frames.flatMap(([word, bg, id], i) => {
    const shot = film[i % Math.max(film.length, 1)];
    return [
      <li key={`${copy}-${word}`} className="min-w-[clamp(15rem,30vw,23rem)] shrink-0 px-1.5">
        <div className={`flex h-[clamp(8.5rem,17vw,13rem)] items-center justify-center gap-3 overflow-hidden rounded-[10px] px-6 ${bg}`}>
          <span className="text-[clamp(2rem,4.6vw,3.6rem)] leading-none font-bold tracking-[-0.04em] whitespace-nowrap">{word}</span>
          <KochiArt id={id} instant className="h-[62%] w-auto shrink-0 -rotate-6" />
        </div>
      </li>,
      shot && (
        <li key={`${copy}-${word}-shot`} className="shrink-0 px-1.5">
          <div className="relative h-[clamp(8.5rem,17vw,13rem)] overflow-hidden rounded-[10px]">
            <img src={shot.photo} alt="" loading="lazy" draggable={false} className="aspect-[8/5] h-full w-auto object-cover [filter:sepia(.25)_saturate(.85)]" />
            {shot.caption && (
              <span className="absolute bottom-2 left-2 rounded-full bg-ink/75 px-2.5 py-0.5 font-mono text-xs text-paper">{shot.caption}</span>
            )}
          </div>
        </li>
      ),
    ];
  });

  return (
    <div aria-hidden className="-mx-[4%] -rotate-2 overflow-hidden border-y-2 border-ink bg-ink">
      <ul className="marquee film-holes flex w-max py-7 hover:[animation-play-state:paused]">
        {reel(0)}
        {reel(1)}
      </ul>
    </div>
  );
}

/* A washed-out snapshot: inline under the entry on phones, pops out beside the timeline on hover from md up. */
function Memory({ src, alt, caption, tilt }: { src: string; alt: string; caption: string; tilt: number }) {
  return (
    <motion.figure
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      className="pointer-events-none mt-4 w-[min(17rem,85%)] md:absolute md:top-0 md:right-[calc(100%+1.5rem)] md:mt-0 md:w-72"
    >
      <span
        style={{ "--tilt": `${tilt}deg` } as CSSProperties}
        className="relative block rotate-(--tilt) rounded-md bg-white p-2 pb-2.5 shadow-[3px_4px_0_var(--color-ink)] ink-border transition-[opacity,translate,scale] duration-500 ease-out md:translate-y-3 md:scale-95 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:scale-100 md:group-hover:opacity-100"
      >
        <span className="relative block overflow-hidden rounded-[3px]">
          <img src={src} alt={alt} loading="lazy" width={960} height={600} className="aspect-[8/5] w-full object-cover [filter:sepia(.4)_saturate(.75)_contrast(.95)]" />
          <span aria-hidden className="absolute inset-0 shadow-[inset_0_0_18px_rgba(240,236,226,.55)]" />
        </span>
        <span className="mt-2 block text-center font-mono text-[13px] leading-snug text-balance text-ink/75">{caption}</span>
        <span aria-hidden className="absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 rotate-[-4deg] bg-pastel-yellow/80" />
      </span>
    </motion.figure>
  );
}

export default function Intro() {
  // Easter egg: the year dots, tapped in the right order, open a coupon. Only the last four taps count.
  const taps = useRef<string[]>([]);
  const tapYear = (title: string) => {
    taps.current = [...taps.current, title.replace(/\D/g, "")].slice(-4);
    if (taps.current.length === 4) attempt("timeline", taps.current.join(" "));
  };

  return (
    <section aria-labelledby="intro-title" className="overflow-x-clip pt-12 pb-28">
      <FilmRoll />

      <div className="mx-auto mt-24 grid max-w-6xl gap-16 px-5 md:grid-cols-[1.1fr_1fr] md:gap-20">
        <div>
          <h2 id="intro-title" className="text-[clamp(2.2rem,3.6vw,3rem)] leading-[1.02] font-bold tracking-[-0.035em] text-pretty">
            {event.aboutTitle.replaceAll("-", "\u2011")}
          </h2>
          <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-ink/80">{event.about}</p>
        </div>

        <div>
          <h3 className="text-xl font-bold">DevFest Kochi over the years</h3>
          <ol className="mt-6">
            {road.map((r, i) => {
              const last = i === road.length - 1;
              return (
                <li key={r.title} className="group relative grid grid-cols-[2.5rem_1fr] gap-4 pb-8 last:pb-0">
                  {!last && <span aria-hidden className="absolute top-10 bottom-0 left-[1.2rem] w-0.5 bg-ink" />}
                  <motion.button
                    type="button"
                    aria-label={r.title}
                    onClick={() => tapYear(r.title)}
                    whileTap={{ scale: 0.8 }}
                    className={`ink-border relative size-10 rounded-full transition-[background-color,scale] duration-500 group-hover:scale-110 ${last ? "bg-(--track)" : "bg-pastel-green"}`}
                  />
                  <div className="pt-1.5">
                    <p className="font-mono text-sm text-ink-soft">{r.date}</p>
                    <p className="mt-0.5 text-lg font-bold">{r.title}</p>
                    <p className="text-ink/75">{r.detail}</p>
                    {r.photo && <Memory src={r.photo} alt={`${r.title}, group photo`} caption={r.caption || r.title} tilt={i % 2 ? 3 : -4} />}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
