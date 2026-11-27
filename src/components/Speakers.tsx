"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { event, speakers, type Speaker } from "@/content/site";
import { Sticker } from "./Kochi";
import SpeakerShare, { googleTint } from "./SpeakerShare";
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
// at each breakpoint's column count: 2 on phones, 3 from sm, 4 from lg. Static strings so Tailwind picks them up.
const span2 = ["col-span-2", "col-span-1"];
const span3 = ["sm:col-span-3", "sm:col-span-2", "sm:col-span-1"];
const span4 = ["lg:col-span-4", "lg:col-span-3", "lg:col-span-2", "lg:col-span-1"];

function PitchCard({ cells, pitch, featured }: { cells: number; pitch: ReactNode; featured?: boolean }) {
  // Featured = 1 / 2 / 4 cols. Past years = 2 / 3 / 4. Using col-span-2 on a 1-col grid
  // creates an implicit second track and crushes the speaker cards into strips.
  const spans = featured
    ? `col-span-1 ${cells % 2 === 0 ? "sm:col-span-2" : "sm:col-span-1"} ${span4[cells % 4]}`
    : `${span2[cells % 2]} ${span3[cells % 3]} ${span4[cells % 4]}`;
  return (
    <motion.li
      layout
      transition={{ type: "spring", stiffness: 340, damping: 32 }}
      className={`flex flex-col justify-center rounded-[22px] border-2 border-dashed border-ink/40 bg-(--track-soft) p-5 transition-colors duration-500 ${spans}`}
    >
      <span className="text-lg leading-tight font-bold">Your face here in 2026?</span>
      <span className="mt-1.5 text-sm text-ink/75">The lineup is still open. {pitch}.</span>
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
            className={`mt-6 grid grid-flow-dense gap-3 ${featured ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"}`}
          >
            {edition.list.map((s) => {
              const on = open === s.name;
              const Icon = s.track ? trackIcon[s.track] : null;
              const tint = s.track ? trackColor[s.track].soft : "var(--color-pastel-yellow)";
              const canExpand = Boolean(s.talk || (featured && (s.bio || s.linkedin)));
              return (
                <motion.li
                  layout
                  key={s.name}
                  transition={{ type: "spring", stiffness: 340, damping: 32 }}
                  animate={featured ? { backgroundColor: on ? googleTint(s.name).fill : "#ffffff" } : undefined}
                  className={`ink-border min-w-0 rounded-[22px] ${featured ? "" : "overflow-hidden bg-white"} ${on ? (featured ? "sm:col-span-2" : "col-span-2") : ""}`}
                >
                  <div className={`flex h-full flex-col ${featured ? "p-5 sm:p-6" : ""}`}>
                    <button
                      type="button"
                      disabled={!canExpand}
                      aria-expanded={canExpand ? on : undefined}
                      onClick={() => setOpen(on ? null : s.name)}
                      className={`flex w-full min-w-0 flex-col text-left ${featured ? "" : "h-full p-4 sm:p-5"}`}
                    >
                      <motion.span layout="position" className="flex w-full items-start justify-between gap-3">
                        <Portrait speaker={s} featured={featured} tint={tint} />
                        {canExpand && (
                          <motion.span aria-hidden animate={{ rotate: on ? 135 : 0 }} transition={{ type: "spring", stiffness: 420, damping: 28 }} className="grid size-8 shrink-0 place-items-center rounded-full border-[1.5px] border-ink text-lg leading-none">
                            +
                          </motion.span>
                        )}
                      </motion.span>
                      <motion.span layout="position" className={`mt-4 block leading-tight font-bold ${featured ? "text-xl sm:text-2xl" : "text-lg"}`}>
                        {s.name}
                      </motion.span>
                      <motion.span layout="position" className="mt-1 block text-sm text-ink/70">
                        {s.role}
                        {s.role && s.org && ", "}
                        {s.org && <strong className="font-bold text-ink">{s.org}</strong>}
                      </motion.span>
                      {featured && !!s.badges?.length && (
                        <motion.span layout="position" data-badges className="mt-3 flex flex-wrap gap-1.5">
                          {s.badges.map((b) => (
                            <span key={b} className="rounded-full border-[1.5px] border-ink/25 bg-white px-2.5 py-1 text-xs leading-tight text-ink/80">
                              {b}
                            </span>
                          ))}
                        </motion.span>
                      )}
                    </button>

                    <AnimatePresence initial={false}>
                      {on && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0, transition: { delay: 0.12 } }}
                          exit={{ opacity: 0, transition: { duration: 0.1 } }}
                          className={`border-t-[1.5px] border-ink/15 pt-3 ${featured ? "mt-4" : "mx-4 mb-4 sm:mx-5 sm:mb-5"}`}
                        >
                          {s.talk && (
                            <>
                              <p className="flex items-center gap-1.5 font-mono text-xs text-ink-soft">
                                {Icon && <Icon size={14} strokeWidth={3} />} The talk
                              </p>
                              <p className="mt-1 text-lg leading-snug sm:text-xl">{s.talk}</p>
                            </>
                          )}
                          {featured && s.bio && <p className="mt-3 text-base leading-relaxed text-ink/80">{s.bio}</p>}
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
                  </div>
                </motion.li>
              );
            })}
            <PitchCard cells={edition.list.length + (open ? 1 : 0)} pitch={pitch} featured={featured} />
          </ul>
        </LayoutGroup>
      )}

      {share && <SpeakerShare speaker={share} onClose={() => setShare(null)} />}
    </section>
  );
}
