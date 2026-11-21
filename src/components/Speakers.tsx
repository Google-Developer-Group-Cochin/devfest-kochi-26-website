"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { event, speakers } from "@/content/site";
import { Sticker } from "./Kochi";
import { trackIcon } from "./shapes";
import { trackColor } from "./Tracks";

const initials = (name: string) =>
  name
    .split(" ")
    .filter((p) => p.length > 1)
    .slice(0, 2)
    .map((p) => p[0])
    .join("");

const editions = speakers.editions.filter((e) => e.comingSoon || e.list.length);

// Spans that make the closing card fill whatever is left of the last row (a full row when it's already complete)
// at each breakpoint's column count: 2 on phones, 3 from sm, 4 from lg. Static strings so Tailwind picks them up.
const span2 = ["col-span-2", "col-span-1"];
const span3 = ["sm:col-span-3", "sm:col-span-2", "sm:col-span-1"];
const span4 = ["lg:col-span-4", "lg:col-span-3", "lg:col-span-2", "lg:col-span-1"];

function PitchCard({ cells, pitch }: { cells: number; pitch: ReactNode }) {
  return (
    <motion.li
      layout
      transition={{ type: "spring", stiffness: 340, damping: 32 }}
      className={`flex flex-col justify-center rounded-[22px] border-2 border-dashed border-ink/40 bg-(--track-soft) p-5 transition-colors duration-500 ${span2[cells % 2]} ${span3[cells % 3]} ${span4[cells % 4]}`}
    >
      <span className="text-lg leading-tight font-bold">Your face here in 2026?</span>
      <span className="mt-1.5 text-sm text-ink/75">The lineup is still open. {pitch}.</span>
    </motion.li>
  );
}

export default function Speakers() {
  const [open, setOpen] = useState<string | null>(null);
  const [year, setYear] = useState(() => (editions.find((e) => e.list.length) ?? editions[0])?.year);
  const edition = editions.find((e) => e.year === year);
  if (!edition) return null;
  const pitch = (
    <a className="font-bold underline decoration-2 underline-offset-4" href={`mailto:${event.email}?subject=Speaking at ${event.name}`}>
      Pitch us a talk
    </a>
  );

  return (
    <section id="speakers" aria-labelledby="speakers-title" className="mx-auto max-w-6xl px-5 pb-20 sm:pb-32">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex items-end gap-3 sm:gap-5">
          <h2 id="speakers-title" className="max-w-[14ch] text-[clamp(2.4rem,5.5vw,4.25rem)] leading-[0.98] font-bold tracking-[-0.035em]">
            {edition.title}
          </h2>
          <Sticker id="kathakali" className="h-24 w-auto shrink-0 sm:h-36" tilt={8} />
        </div>
        <p className="max-w-[40ch] text-lg text-ink/75">
          {speakers.intro} {pitch}.
        </p>
      </div>

      {editions.length > 1 && (
        <div role="group" aria-label="Edition" className="mt-8 flex flex-wrap gap-2 sm:mt-10">
          {editions.map((e) => {
            const on = e.year === year;
            return (
              <button
                key={e.year}
                type="button"
                aria-pressed={on}
                onClick={() => {
                  setYear(e.year);
                  setOpen(null);
                }}
                className={`ink-border relative inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-[15px] font-medium transition-colors ${on ? "text-paper" : "bg-white hover:bg-ink/5"}`}
              >
                {on && <motion.span layoutId="edition-pill" className="absolute inset-0 -z-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                <span className="relative">{e.year}</span>
                {e.comingSoon && <span className="relative rounded-full bg-(--track) px-2 py-px font-sans text-xs font-bold text-ink transition-colors duration-500">Coming soon</span>}
              </button>
            );
          })}
        </div>
      )}

      {edition.list.length === 0 ? (
        <motion.div
          key={edition.year}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
        >
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className={`flex aspect-[4/5] flex-col justify-end rounded-[22px] border-2 border-dashed border-ink/30 p-5 ${i > 1 ? "max-sm:hidden" : ""}`}>
              <span className="mb-auto grid size-16 place-items-center rounded-full border-2 border-dashed border-ink/30 text-2xl text-ink/30 sm:size-20">?</span>
              <span className="h-3 w-3/4 rounded-full bg-ink/10" />
              <span className="mt-2 h-3 w-1/2 rounded-full bg-ink/10" />
            </div>
          ))}
          <p className="col-span-full mt-3 text-lg">
            The {edition.year} lineup drops soon. Have a talk in you? {pitch}.
          </p>
        </motion.div>
      ) : (
      <LayoutGroup>
        <ul key={edition.year} className="mt-6 grid grid-flow-dense grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {edition.list.map((s) => {
            const on = open === s.name;
            const Icon = s.track ? trackIcon[s.track] : null;
            const tint = s.track ? trackColor[s.track].soft : "var(--color-pastel-yellow)";
            return (
              <motion.li
                layout
                key={s.name}
                transition={{ type: "spring", stiffness: 340, damping: 32 }}
                className={`ink-border overflow-hidden rounded-[22px] bg-white ${on ? "col-span-2" : ""}`}
              >
                <button
                  type="button"
                  disabled={!s.talk}
                  aria-expanded={s.talk ? on : undefined}
                  onClick={() => setOpen(on ? null : s.name)}
                  className="flex h-full w-full flex-col p-4 text-left sm:p-5"
                >
                  <motion.span layout="position" className="flex w-full items-start justify-between">
                    {s.photo ? (
                      <img src={s.photo} alt="" loading="lazy" className="ink-border size-16 rounded-full object-cover sm:size-20" style={{ background: tint }} />
                    ) : (
                      <span aria-hidden className="ink-border grid size-16 place-items-center rounded-full text-xl font-bold sm:size-20 sm:text-2xl" style={{ background: tint }}>
                        {initials(s.name)}
                      </span>
                    )}
                    {s.talk && (
                      <motion.span aria-hidden animate={{ rotate: on ? 135 : 0 }} className="grid size-8 place-items-center rounded-full border-[1.5px] border-ink text-lg leading-none">
                        +
                      </motion.span>
                    )}
                  </motion.span>
                  <motion.span layout="position" className="mt-4 block text-lg leading-tight font-bold">
                    {s.name}
                  </motion.span>
                  <motion.span layout="position" className="mt-1 block text-sm text-ink/70">
                    {[s.role, s.org].filter(Boolean).join(", ")}
                  </motion.span>
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.span
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0, transition: { delay: 0.12 } }}
                        exit={{ opacity: 0, transition: { duration: 0.1 } }}
                        className="mt-4 block border-t-[1.5px] border-ink/15 pt-3"
                      >
                        <span className="flex items-center gap-1.5 font-mono text-xs text-ink-soft">
                          {Icon && <Icon size={14} strokeWidth={3} />} The talk
                        </span>
                        <span className="mt-1 block text-lg leading-snug">{s.talk}</span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </motion.li>
            );
          })}
          <PitchCard cells={edition.list.length + (open ? 1 : 0)} pitch={pitch} />
        </ul>
      </LayoutGroup>
      )}
    </section>
  );
}
