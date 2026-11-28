"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useState } from "react";
import { event, speakers, type Speaker } from "@/content/site";
import { Sticker } from "./Kochi";
import { Globe } from "./shapes";
import SpeakerShare, { googleTint } from "./SpeakerShare";
import { trackColor } from "./Tracks";

const initials = (name: string) =>
  name
    .split(" ")
    .filter((p) => p.length > 1)
    .slice(0, 2)
    .map((p) => p[0])
    .join("");

const editions = speakers.editions.filter((e) => e.comingSoon || e.list.length);
const currentYear = event.start.slice(0, 4);

function Portrait({ speaker, featured, tint }: { speaker: Speaker; featured: boolean; tint: string }) {
  const size = featured ? "size-28 sm:size-32" : "size-16 sm:size-20";
  if (speaker.photo) {
    return <motion.img layout="position" src={speaker.photo} alt="" loading="lazy" className={`ink-border ${size} shrink-0 rounded-full object-cover object-top`} style={{ background: tint }} />;
  }
  return (
    <motion.span layout="position" aria-hidden className={`ink-border grid ${size} shrink-0 place-items-center rounded-full font-bold ${featured ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"}`} style={{ background: tint }}>
      {initials(speaker.name)}
    </motion.span>
  );
}

// Spans that make the closing card fill whatever is left of the last row (a full row when it's already complete)
// at 4 columns on large screens. Static strings so Tailwind picks them up.
const span4 = ["lg:col-span-4", "lg:col-span-3", "lg:col-span-2", "lg:col-span-1"];

const shimmer = { opacity: [0.35, 0.7, 0.35] };
const shimmerTiming = { duration: 2.4, repeat: Infinity, ease: "easeInOut" as const };

// Closing card on this year's grid: hints that more speakers are on the way, in the same style as the
// "lineup drops soon" teasers. It fills whatever is left of the last row (1 / 2 / 4 cols).
function TeaserCard({ cells }: { cells: number }) {
  const spans = `row-span-4 col-span-1 ${cells % 2 === 0 ? "sm:col-span-2" : "sm:col-span-1"} ${span4[cells % 4]}`;
  return (
    <motion.li
      layout
      transition={{ type: "spring", stiffness: 340, damping: 32 }}
      className={`ink-border relative mb-3 flex flex-col justify-center rounded-[22px] bg-(--color-pastel-blue) p-5 sm:p-6 ${spans}`}
    >
      <Globe size={40} aria-hidden className="absolute top-5 right-5 sm:top-6 sm:right-6" />
      <span aria-hidden className="flex -space-x-3">
        {["#ffe7a5", "#ccf6c5", "#f8d8d8", "#ffffff"].map((c, i) => (
          <motion.span
            key={c}
            whileHover={{ y: -6, rotate: -6 }}
            className="ink-border grid size-14 place-items-center rounded-full text-xl font-bold"
            style={{ background: c, zIndex: 4 - i }}
          >
            ?
          </motion.span>
        ))}
      </span>
      <span className="mt-5 flex flex-wrap items-center gap-2">
        <span className="text-xl leading-tight font-bold sm:text-2xl">More speakers loading</span>
        <span className="rounded-full border-[1.5px] border-ink bg-white px-2 py-px font-mono text-[11px]">TBA</span>
      </span>
      <span aria-hidden className="mt-3 flex flex-col gap-2">
        <motion.span animate={shimmer} transition={shimmerTiming} className="block h-2.5 w-2/3 max-w-60 rounded-full bg-ink/25" />
        <motion.span animate={shimmer} transition={{ ...shimmerTiming, delay: 0.3 }} className="block h-2.5 w-1/2 max-w-44 rounded-full bg-ink/25" />
      </span>
      <span className="mt-4 text-[15px] leading-snug">A few more names are locked in and sworn to secrecy. The reveal drops soon, so keep an eye on this space.</span>
    </motion.li>
  );
}

export default function Speakers() {
  const [open, setOpen] = useState<string | null>(null);
  const [share, setShare] = useState<Speaker | null>(null);
  const [year, setYear] = useState(() => (editions.find((e) => e.year === currentYear && e.list.length) ?? editions.find((e) => e.list.length) ?? editions[0])?.year);
  const edition = editions.find((e) => e.year === year);
  if (!edition) return null;
  const featured = edition.year === currentYear;
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
          {speakers.intro}
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
                  setShare(null);
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
        <motion.div key={edition.year} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
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
          <ul
            key={edition.year}
            className={`mt-6 grid grid-flow-dense ${featured ? "grid-cols-1 gap-x-3 sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"}`}
          >
            {edition.list.map((s) => {
              const on = open === s.name;
              const tint = s.track ? trackColor[s.track].soft : "var(--color-pastel-yellow)";
              const canExpand = Boolean(featured && (s.bio || s.linkedin));
              const panel = (
                <AnimatePresence initial={false}>
                  {on && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0, transition: { delay: 0.12 } }}
                      exit={{ opacity: 0, transition: { duration: 0.1 } }}
                      className={`border-t-[1.5px] border-ink/15 pt-3 ${featured ? "relative z-10 mt-4" : "mx-4 mb-4 sm:mx-5 sm:mb-5"}`}
                    >
                      {featured && s.bio && <p className="text-base leading-relaxed text-ink/80">{s.bio}</p>}
                      {featured && (
                        <div className="mt-4 flex flex-wrap items-center gap-2.5 sm:gap-3">
                          {s.linkedin && (
                            <a href={s.linkedin} target="_blank" rel="noopener" className="ink-border min-h-11 rounded-full bg-white px-4 py-2.5 text-sm font-bold transition-transform active:scale-95">
                              LinkedIn
                            </a>
                          )}
                          <button type="button" onClick={() => setShare(s)} className="ink-border min-h-11 rounded-full bg-ink px-4 py-2.5 text-sm font-bold text-paper transition-transform active:scale-95">
                            Download share card
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              );
              const plus = canExpand && (
                <motion.span aria-hidden animate={{ rotate: on ? 135 : 0 }} transition={{ type: "spring", stiffness: 420, damping: 28 }} className="grid size-8 shrink-0 place-items-center rounded-full border-[1.5px] border-ink text-lg leading-none">
                  +
                </motion.span>
              );
              const company = (
                <>
                  {s.role}
                  {s.role && s.org && ", "}
                  {s.org && <strong className="font-bold text-ink">{s.org}</strong>}
                </>
              );
              // This year's cards share four rows (photo, name, title, tags) with their neighbours, so each
              // line starts at the same height even when a name or title wraps. The button overlays the card.
              if (featured) {
                return (
                  <motion.li
                    layout
                    key={s.name}
                    transition={{ type: "spring", stiffness: 340, damping: 32 }}
                    animate={{ backgroundColor: on ? googleTint(s.name).fill : "#ffffff" }}
                    className={`ink-border relative isolate row-span-4 mb-3 grid min-w-0 grid-cols-[minmax(0,1fr)] grid-rows-subgrid gap-y-0 rounded-[22px] p-5 sm:p-6 ${on ? "sm:col-span-2" : ""}`}
                  >
                    <button
                      type="button"
                      disabled={!canExpand}
                      aria-label={s.name}
                      aria-expanded={canExpand ? on : undefined}
                      onClick={() => setOpen(on ? null : s.name)}
                      className="absolute inset-0 z-[1] rounded-[22px]"
                    />
                    <motion.span layout="position" className="flex w-full items-start justify-between gap-3">
                      <Portrait speaker={s} featured tint={tint} />
                      {plus}
                    </motion.span>
                    <motion.span layout="position" className="mt-4 block text-xl leading-tight font-bold sm:text-2xl">
                      {s.name}
                    </motion.span>
                    <motion.span layout="position" className="mt-1 block text-sm text-ink/70">
                      {company}
                    </motion.span>
                    <div>
                      {!!s.badges?.length && (
                        <motion.span layout="position" className="mt-3 flex flex-wrap gap-1.5">
                          {s.badges.map((b) => (
                            <span key={b} className="rounded-full border-[1.5px] border-ink/25 bg-white px-2.5 py-1 text-xs leading-tight text-ink/80">
                              {b}
                            </span>
                          ))}
                        </motion.span>
                      )}
                      {panel}
                    </div>
                  </motion.li>
                );
              }
              return (
                <motion.li
                  layout
                  key={s.name}
                  transition={{ type: "spring", stiffness: 340, damping: 32 }}
                  className={`ink-border min-w-0 overflow-hidden rounded-[22px] bg-white ${on ? "col-span-2" : ""}`}
                >
                  <div className="flex h-full flex-col">
                    <button
                      type="button"
                      disabled={!canExpand}
                      aria-expanded={canExpand ? on : undefined}
                      onClick={() => setOpen(on ? null : s.name)}
                      className="flex h-full w-full min-w-0 flex-col p-4 text-left sm:p-5"
                    >
                      <motion.span layout="position" className="flex w-full items-start justify-between gap-3">
                        <Portrait speaker={s} featured={false} tint={tint} />
                        {plus}
                      </motion.span>
                      <motion.span layout="position" className="mt-4 block text-lg leading-tight font-bold">
                        {s.name}
                      </motion.span>
                      <motion.span layout="position" className="mt-1 block text-sm text-ink/70">
                        {company}
                      </motion.span>
                    </button>

                    {panel}
                  </div>
                </motion.li>
              );
            })}
            {featured && <TeaserCard cells={edition.list.length + (open ? 1 : 0)} />}
          </ul>
        </LayoutGroup>
      )}

      {share && <SpeakerShare speaker={share} onClose={() => setShare(null)} />}
    </section>
  );
}
