"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { event } from "@/content/site";
import { Sticker } from "./Kochi";
import { Asterisk, Globe, Hash, TabCard } from "./shapes";

const shimmer = {
  animate: { opacity: [0.35, 0.7, 0.35] },
  transition: { duration: 2.4, repeat: Infinity, ease: "easeInOut" as const },
};

function Bar({ className = "", delay = 0 }: { className?: string; delay?: number }) {
  return <motion.span aria-hidden {...shimmer} transition={{ ...shimmer.transition, delay }} className={`block h-2.5 rounded-full bg-ink/25 ${className}`} />;
}

function Teaser({ title, fill, icon, children, caption }: { title: string; fill: string; icon: ReactNode; children: ReactNode; caption: string }) {
  return (
    <TabCard
      as="li"
      fill={fill}
      className="flex flex-col"
      tab={
        <span className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight">{title}</span>
          <span className="rounded-full border-[1.5px] border-ink bg-white px-2 py-px font-mono text-[11px]">TBA</span>
        </span>
      }
    >
      <div className="flex flex-1 flex-col px-5 pt-2 pb-5">
        <span aria-hidden className="self-end -mt-1">
          {icon}
        </span>
        <div aria-hidden className="ink-border mt-3 flex-1 rounded-2xl bg-white/80 p-4">
          {children}
        </div>
        <p className="mt-4 text-[15px] leading-snug">{caption}</p>
      </div>
    </TabCard>
  );
}

export default function ComingSoon() {
  return (
    <section id="lineup" aria-labelledby="lineup-title" className="relative mx-auto max-w-6xl px-5 pb-20 sm:pb-32">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <h2 id="lineup-title" className="max-w-[11ch] text-[clamp(2.4rem,5.5vw,4.25rem)] leading-[0.98] font-bold tracking-[-0.035em]">
          The lineup drops soon
        </h2>
        <div className="max-w-[40ch]">
          <p className="text-lg text-ink/75">
            We&apos;re locking in tracks, sessions and speakers for {event.dateLabel}. Passes are open now, so grab yours before the reveal.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={event.ticketsUrl}
              target="_blank"
              rel="noopener"
              className="ink-border inline-block rounded-full bg-ink px-5 py-2.5 font-bold text-paper transition-transform hover:-rotate-1 active:scale-95"
            >
              Get your pass
            </a>
            <a
              href={`mailto:${event.email}?subject=Speaking at ${event.name}`}
              className="ink-border inline-block rounded-full bg-white px-5 py-2.5 font-bold transition-transform hover:rotate-1 active:scale-95"
            >
              Pitch a talk
            </a>
          </div>
        </div>
      </div>

      <div className="relative mt-14 sm:mt-20">
      <div className="pointer-events-none absolute -top-12 right-2 z-10 max-md:hidden [&>img]:pointer-events-auto">
        <Sticker id="houseboat" className="h-20 w-auto" tilt={-4} />
      </div>
      <ul className="grid gap-5 md:grid-cols-3">
        <Teaser
          title="Tracks"
          fill="var(--color-pastel-red)"
          icon={<Asterisk size={44} />}
          caption="Themes across AI, mobile, cloud and the web."
        >
          <div className="flex flex-wrap gap-2">
            {["#ff7daf", "#5cdb6d", "#57caff", "#ffd427"].map((c, i) => (
              <motion.span
                key={c}
                {...shimmer}
                transition={{ ...shimmer.transition, delay: i * 0.25 }}
                className="grid h-9 w-[calc(50%-0.25rem)] place-items-center rounded-full border-[1.5px] border-dashed border-ink font-mono text-sm"
                style={{ background: c }}
              >
                ?
              </motion.span>
            ))}
          </div>
          <Bar className="mt-4 w-4/5" />
          <Bar className="mt-2 w-3/5" delay={0.3} />
        </Teaser>

        <Teaser
          title="Agenda"
          fill="var(--color-pastel-green)"
          icon={<Hash size={44} />}
          caption={`A full day, ${event.timeLabel}, session by session.`}
        >
          <ol className="space-y-2.5">
            {["9:30", "10:15", "11:30", "2:00"].map((t, i) => (
              <li key={t} className="flex items-center gap-3">
                <span className="w-11 shrink-0 font-mono text-xs text-ink-soft">{t}</span>
                <span className="size-2.5 shrink-0 rounded-full border-[1.5px] border-ink bg-(--color-halftone-green)" />
                <Bar className={i % 2 ? "w-1/2" : "w-3/4"} delay={i * 0.2} />
              </li>
            ))}
          </ol>
        </Teaser>

        <Teaser
          title="Speakers"
          fill="var(--color-pastel-blue)"
          icon={<Globe size={44} />}
          caption="New faces on stage. Meet past speakers below."
        >
          <div className="flex -space-x-3">
            {["#ffe7a5", "#ccf6c5", "#f8d8d8", "#c3ecf6"].map((c, i) => (
              <motion.span
                key={c}
                whileHover={{ y: -6, rotate: -6 }}
                className="ink-border grid size-14 place-items-center rounded-full text-xl font-bold"
                style={{ background: c, zIndex: 4 - i }}
              >
                ?
              </motion.span>
            ))}
          </div>
          <Bar className="mt-4 w-2/3" />
          <Bar className="mt-2 w-1/2" delay={0.3} />
        </Teaser>
      </ul>
      </div>
    </section>
  );
}
