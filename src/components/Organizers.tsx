import type { ReactNode } from "react";
import organizersJson from "@/content/organizers.json";
import { Sticker } from "./Kochi";

type Organizer = { name: string; role: string; job: string; photo?: string; linkedin?: string; x?: string; gdg?: string };

const organizers = organizersJson as Organizer[];

const tints = ["var(--color-pastel-blue)", "var(--color-pastel-red)", "var(--color-pastel-green)", "var(--color-pastel-yellow)"];

const LinkedIn = () => (
  <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
  </svg>
);

const XLogo = () => (
  <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.65l-5.21-6.82-5.97 6.82H1.68l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64z" />
  </svg>
);

function Social({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      aria-label={label}
      className="ink-border grid size-10 place-items-center rounded-full bg-white transition-transform hover:-rotate-6 active:scale-90"
    >
      {children}
    </a>
  );
}

export default function Organizers() {
  return (
    <section id="team" aria-labelledby="team-title" className="mx-auto max-w-6xl px-5 pb-20 sm:pb-32">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex items-end gap-3 sm:gap-5">
          <h2 id="team-title" className="max-w-[12ch] text-[clamp(2.4rem,5.5vw,4.25rem)] leading-[0.98] font-bold tracking-[-0.035em]">
            Meet the organizers
          </h2>
          <Sticker id="mattancherry" className="h-20 w-auto shrink-0 sm:h-28" tilt={6} />
        </div>
        <p className="max-w-[40ch] text-lg text-ink/75">DevFest Kochi is run by volunteers from GDG Cochin, the Google Developer Group for Kochi.</p>
      </div>

      <ul className="mt-8 grid gap-5 sm:mt-12 sm:grid-cols-2">
        {organizers.map((o, i) => (
          <li key={o.name} className="ink-border flex items-center gap-5 rounded-[22px] bg-white p-5 sm:gap-6 sm:p-6">
            {o.photo ? (
              <img src={o.photo} alt="" loading="lazy" className="ink-border size-24 shrink-0 rounded-full object-cover sm:size-28" style={{ background: tints[i % tints.length] }} />
            ) : (
              <span aria-hidden className="ink-border size-24 shrink-0 rounded-full sm:size-28" style={{ background: tints[i % tints.length] }} />
            )}
            <div className="min-w-0">
              <span className="inline-block rounded-full bg-(--track) px-2.5 py-0.5 font-mono text-xs transition-colors duration-500">{o.role}</span>
              <h3 className="mt-2 text-xl leading-tight font-bold sm:text-2xl">{o.name}</h3>
              <p className="mt-1 text-ink/70">{o.job}</p>
              <div className="mt-3 flex gap-2">
                {o.linkedin && (
                  <Social href={o.linkedin} label={`${o.name} on LinkedIn`}>
                    <LinkedIn />
                  </Social>
                )}
                {o.x && (
                  <Social href={o.x} label={`${o.name} on X`}>
                    <XLogo />
                  </Social>
                )}
                {o.gdg && (
                  <Social href={o.gdg} label={`${o.name} on GDG Community`}>
                    <span className="font-mono text-[11px] font-bold">GDG</span>
                  </Social>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
