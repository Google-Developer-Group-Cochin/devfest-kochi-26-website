import { event } from "@/content/site";
import { GdgLogo } from "./shapes";

const links = [
  { href: event.communityUrl, label: "GDG Cochin community" },
  { href: event.ticketsUrl, label: "Tickets on KonfHub" },
  { href: `mailto:${event.email}`, label: event.email },
  { href: "https://developers.google.com/community/guidelines", label: "Community guidelines" },
];

export default function Footer() {
  return (
    <footer className="bg-ink px-5 pt-20 pb-10 text-paper">
      <div className="mx-auto max-w-6xl">
        <p className="max-w-[18ch] text-[clamp(2.4rem,6vw,4.75rem)] leading-[0.95] font-bold tracking-[-0.04em] text-balance">
          See you at {event.place.split(",")[0]} on{" "}
          {new Date(event.start).toLocaleDateString("en-GB", { day: "numeric", month: "long", timeZone: "Asia/Kolkata" }).replace(" ", "\u00a0")}.
        </p>
        <div className="mt-14 flex flex-wrap items-end justify-between gap-10">
          <div className="flex items-center gap-3">
            <GdgLogo className="h-8 w-auto" />
            <span className="text-lg font-bold">GDG Cochin</span>
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {links.map((l) => (
              <li key={l.label}>
                <a href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noopener" className="underline-offset-4 hover:underline">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-12 max-w-[80ch] border-t border-paper/20 pt-6 text-sm text-paper/60">
          DevFest Kochi is organised by GDG Cochin. Google Developer Groups are independent community groups, and their activities and opinions
          are not those of Google.
        </p>
      </div>
    </footer>
  );
}
