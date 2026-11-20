"use client";

import { motion } from "motion/react";
import { tracks, type TrackId } from "@/content/site";
import { TabCard, trackIcon } from "./shapes";
import { setTrack, useTrack } from "./track-store";

export const trackColor: Record<TrackId, { strong: string; soft: string }> = {
  ai: { strong: "#ff7daf", soft: "#f8d8d8" },
  mobile: { strong: "#5cdb6d", soft: "#ccf6c5" },
  cloud: { strong: "#57caff", soft: "#c3ecf6" },
  web: { strong: "#ffd427", soft: "#ffe7a5" },
};

export default function Tracks() {
  const active = useTrack();

  return (
    <section id="tracks" aria-labelledby="tracks-title" className="mx-auto max-w-6xl px-5 pb-20 sm:pb-32">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <h2 id="tracks-title" className="text-[clamp(2.4rem,5.5vw,4.25rem)] leading-[0.98] font-bold tracking-[-0.035em]">
          Pick your track
        </h2>      </div>

      <ul className="mt-8 sm:mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {tracks.map((t) => {
          const Icon = trackIcon[t.id];
          const on = active === t.id;
          return (
            <TabCard
              as="li"
              key={t.id}
              fill={on ? trackColor[t.id].strong : trackColor[t.id].soft}
              className="flex flex-col"
              tab={
                <span className="text-2xl tracking-tight">
                  {t.name}
                  <b>@DevFest</b>
                </span>
              }
            >
              <div className="relative flex flex-1 flex-col px-5 pt-2 pb-5">
                <motion.span
                  animate={{ rotate: on ? 180 : 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 14 }}
                  className="self-start max-sm:absolute max-sm:top-1 max-sm:right-5 max-sm:[&>svg]:size-10"
                >
                  <Icon size={52} />
                </motion.span>
                <p className="text-[17px] leading-snug max-sm:pr-14 sm:mt-4">{t.blurb}</p>
                <ul className="mt-4 mb-5 flex flex-wrap gap-1.5 sm:mb-6">
                  {t.topics.map((topic) => (
                    <li key={topic} className="rounded-full border-[1.5px] border-ink bg-white/70 px-2.5 py-0.5 font-mono text-xs">
                      {topic}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => setTrack(on ? null : t.id)}
                  className={`ink-border mt-auto rounded-full px-4 py-2.5 font-bold transition-[transform,background-color] active:scale-95 ${on ? "bg-ink text-paper" : "bg-white"}`}
                >
                  {on ? `Following ${t.name}` : `Follow ${t.name}`}
                </button>
              </div>
            </TabCard>
          );
        })}
      </ul>
    </section>
  );
}
