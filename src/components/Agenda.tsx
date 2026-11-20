"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { agenda, at, gcalUrl, tracks, type Session } from "@/content/site";
import { Sticker } from "./Kochi";
import { TabCard, trackIcon } from "./shapes";
import { setTrack, useTrack } from "./track-store";
import { trackColor } from "./Tracks";

const to12h = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")}`;
};

const kindLabel: Record<Session["kind"], string> = {
  keynote: "Keynote",
  talk: "Talk",
  workshop: "Workshop",
  break: "Break",
  community: "Community",
};

export default function Agenda() {
  const active = useTrack();
  const rows = agenda.filter((s) => !active || !s.track || s.track === active);

  return (
    <section id="agenda" aria-labelledby="agenda-title" className="relative mx-auto max-w-6xl px-5 pb-20 sm:pb-32">
      <div className="pointer-events-none absolute -top-[4.1rem] right-6 z-10 sm:-top-14 sm:right-14 [&>img]:pointer-events-auto">
        <Sticker id="houseboat" className="h-16 w-auto sm:h-32" tilt={-3} />
      </div>
      <TabCard
        fill="#ffffff"
        tab={
          <>
            <h2 id="agenda-title" className="text-[clamp(1.6rem,3.5vw,2.4rem)] font-bold tracking-tight">
              Agenda
            </h2>
            <span className="rounded-full bg-(--track) px-2.5 py-0.5 font-mono text-xs transition-colors duration-500">provisional</span>
          </>
        }
      >
        <div className="px-4 pt-3 pb-6 sm:px-7 sm:pb-8">
          <p className="max-w-[60ch] text-ink/75">
            Session titles and speakers go up once the lineup is announced.
          </p>

          <div role="group" aria-label="Filter by track" className="mt-6 flex flex-wrap gap-2">
            <Chip on={!active} onClick={() => setTrack(null)}>
              Everything
            </Chip>
            {tracks.map((t) => {
              const Icon = trackIcon[t.id];
              return (
                <Chip key={t.id} on={active === t.id} onClick={() => setTrack(active === t.id ? null : t.id)} color={trackColor[t.id].strong}>
                  <Icon size={18} strokeWidth={2.6} />
                  {t.name}
                </Chip>
              );
            })}
          </div>

          <ol className="mt-6">
            <AnimatePresence initial={false} mode="popLayout">
              {rows.map((s) => {
                const Icon = s.track ? trackIcon[s.track] : null;
                const muted = s.kind === "break";
                return (
                  <motion.li
                    layout
                    key={s.title}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ type: "spring", stiffness: 380, damping: 34 }}
                    className="group grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1.5 border-t-[1.5px] border-ink/15 py-3.5 sm:grid-cols-[8.5rem_1fr_auto] sm:gap-x-4 sm:py-4"
                  >
                    <span className={`w-fit rounded-full px-2.5 py-0.5 font-mono text-[13px] tabular-nums sm:px-3 sm:py-1 sm:text-sm ${muted ? "bg-ink/6" : "bg-pastel-yellow"}`}>
                      {to12h(s.start)}–{to12h(s.end)}
                    </span>
                    <div className="min-w-0 max-sm:col-start-1">
                      <p className={`text-lg leading-snug ${muted ? "text-ink-soft" : "font-bold"}`}>{s.title}</p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-3 font-mono text-xs text-ink-soft">
                        <span>{kindLabel[s.kind]}</span>
                        {s.room && <span>{s.room}</span>}
                        {s.track && Icon && (
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-px text-ink" style={{ background: trackColor[s.track].soft }}>
                            <Icon size={13} strokeWidth={3} />
                            {tracks.find((t) => t.id === s.track)?.name}
                          </span>
                        )}
                      </p>
                    </div>
                    {!muted && (
                      <a
                        href={gcalUrl(s.title, at(s.start), at(s.end), `DevFest Kochi '26${s.room ? `, ${s.room}` : ""}`)}
                        target="_blank"
                        rel="noopener"
                        className="col-start-2 row-span-2 row-start-1 grid size-10 place-items-center justify-self-end rounded-full border-[1.5px] border-ink text-sm transition-colors hover:bg-ink hover:text-paper sm:col-start-3 sm:row-span-1 sm:block sm:size-auto sm:px-3 sm:py-1"
                      >
                        <span aria-hidden className="max-sm:text-xl">+</span>
                        <span className="max-sm:sr-only"> Calendar</span>
                        <span className="sr-only">: add {s.title}</span>
                      </a>
                    )}
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ol>
        </div>
      </TabCard>
    </section>
  );
}

function Chip({ on, onClick, color, children }: { on: boolean; onClick: () => void; color?: string; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className="ink-border inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 font-medium transition-[background-color,transform] active:scale-95"
      style={{ background: on ? (color ?? "var(--track)") : "#fff" }}
    >
      {children}
    </button>
  );
}
