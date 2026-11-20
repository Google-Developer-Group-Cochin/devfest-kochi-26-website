import { event } from "@/content/site";
import NetEgg from "./NetEgg";
import { TabCard } from "./shapes";

export default function Venue() {
  return (
    <section id="venue" aria-labelledby="venue-title" className="mx-auto max-w-6xl px-5 pb-20 sm:pb-32">
      <TabCard
        fill="var(--track-soft)"
        tab={
          <h2 id="venue-title" className="text-[clamp(1.6rem,3.5vw,2.4rem)] font-bold tracking-tight">
            Venue
          </h2>
        }
      >
        <div className="grid items-center gap-6 px-5 pt-2 pb-8 sm:gap-10 sm:px-8 md:grid-cols-2">
          <div>
            <p className="text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.02] font-bold tracking-[-0.03em]">{event.place}</p>
            <p className="mt-3 text-lg">
              <span className="font-bold">{event.venue}</span>
              <br />
              {event.venueArea}
            </p>
            <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-5 gap-y-1.5 font-mono text-sm">
              <dt className="text-ink-soft">date</dt>
              <dd>{event.dateLabel}</dd>
              <dt className="text-ink-soft">time</dt>
              <dd>{event.timeLabel}</dd>
            </dl>
            <a
              href={event.mapsUrl}
              target="_blank"
              rel="noopener"
              className="ink-border mt-7 inline-block rounded-full bg-white px-6 py-3 font-bold transition-transform hover:-rotate-1 active:scale-95"
            >
              Open in Google Maps
            </a>
          </div>
          <NetEgg className="mx-auto w-full max-w-[17rem] sm:max-w-md" />
        </div>
      </TabCard>
    </section>
  );
}
