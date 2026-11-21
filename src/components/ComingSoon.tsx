import { event } from "@/content/site";
import { Sticker } from "./Kochi";
import { TabCard } from "./shapes";

const items = [
  { label: "Tracks", note: "Topics across AI, Android, Flutter, Cloud and Web" },
  { label: "Agenda", note: "The full day, session by session" },
  { label: "Speakers", note: "The 2026 lineup, once confirmed. Past speakers below." },
];

export default function ComingSoon() {
  return (
    <section id="lineup" aria-labelledby="lineup-title" className="relative mx-auto max-w-6xl px-5 pb-20 sm:pb-32">
      <div className="pointer-events-none absolute -top-[4.1rem] right-6 z-10 sm:-top-14 sm:right-14 [&>img]:pointer-events-auto">
        <Sticker id="houseboat" className="h-16 w-auto sm:h-32" tilt={-3} />
      </div>
      <TabCard
        fill="var(--track-soft)"
        tab={
          <>
            <h2 id="lineup-title" className="text-[clamp(1.6rem,3.5vw,2.4rem)] font-bold tracking-tight">
              Lineup
            </h2>
            <span className="rounded-full bg-(--track) px-2.5 py-0.5 font-mono text-xs transition-colors duration-500">coming soon</span>
          </>
        }
      >
        <div className="px-5 pt-2 pb-8 sm:px-8">
          <p className="max-w-[18ch] text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.02] font-bold tracking-[-0.03em] text-balance">
            The lineup is being finalised.
          </p>
          <p className="mt-3 max-w-[55ch] text-lg text-ink/75">
            Tracks, the agenda and speakers will be announced here soon. Grab your pass now so you don&apos;t miss out.
          </p>

          <ul className="mt-8 grid gap-4 sm:grid-cols-3">
            {items.map((item) => (
              <li key={item.label} className="ink-border rounded-2xl bg-white px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xl font-bold tracking-tight">{item.label}</span>
                  <span className="font-mono text-xs text-ink-soft">soon</span>
                </div>
                <p className="mt-1.5 text-[15px] leading-snug text-ink/75">{item.note}</p>
              </li>
            ))}
          </ul>

          <a
            href={event.ticketsUrl}
            target="_blank"
            rel="noopener"
            className="ink-border mt-8 inline-block rounded-full bg-ink px-6 py-3 font-bold text-paper transition-transform hover:-rotate-1 active:scale-95"
          >
            Get your pass
          </a>
        </div>
      </TabCard>
    </section>
  );
}
