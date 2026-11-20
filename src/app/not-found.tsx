import type { Metadata } from "next";
import Link from "next/link";
import FerryEgg from "@/components/FerryEgg";
import { Brace, GdgLogo } from "@/components/shapes";
import { event } from "@/content/site";

export const metadata: Metadata = {
  title: "Page not found · DevFest Kochi",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main id="main" className="relative flex min-h-[100svh] flex-col items-center overflow-hidden px-4 pt-5">
      <Link href="/" className="ink-border flex items-center gap-2.5 rounded-full bg-white py-2 pr-4 pl-3 text-[15px] font-bold tracking-tight">
        <GdgLogo className="h-6 w-auto" />
        DevFest Kochi
      </Link>

      <div className="my-auto flex flex-col items-center py-16 text-center">
        <h1 className="flex items-center gap-[0.04em] text-[clamp(5rem,22vw,13rem)] leading-[0.9] font-bold tracking-[-0.045em]">
          <Brace side="left" className="h-[1.1em] w-auto text-(--track)" />
          <span className="px-[0.04em] pb-[0.08em]">404</span>
          <Brace side="right" className="h-[1.1em] w-auto text-(--track)" />
          <span className="sr-only">: page not found</span>
        </h1>

        <p className="mt-4 flex items-stretch overflow-hidden rounded-full ink-border bg-white text-[clamp(1rem,2.6vw,1.5rem)]">
          <span className="px-5 py-1.5 sm:px-7">This page missed the ferry</span>
          <span className="border-l-2 border-ink bg-(--track) px-5 py-1.5 sm:px-7">Kochi</span>
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
          <Link
            href="/"
            className="group ink-border inline-flex items-center gap-3 rounded-full bg-ink py-3.5 pr-3.5 pl-7 text-lg font-bold text-paper transition-transform hover:-rotate-2 active:scale-95 sm:text-xl"
          >
            Back to DevFest Kochi
            <span aria-hidden className="grid size-9 place-items-center rounded-full bg-(--track) text-ink transition-transform duration-300 group-hover:-translate-x-1">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 9H4M8 4 3 9l5 5" />
              </svg>
            </span>
          </Link>
          <a href={event.ticketsUrl} target="_blank" rel="noopener" className="font-bold underline decoration-2 underline-offset-4 hover:decoration-(--track)">
            Get tickets
          </a>
        </div>
      </div>

      {/* The ferry rides between the two waves, so its hull sits in the water. */}
      <div className="relative h-[clamp(6.5rem,14vw,9.5rem)] w-[calc(100%+2rem)] shrink-0">
        <div aria-hidden className="wave-back absolute inset-x-0 bottom-0 h-12" />
        <div className="sail absolute bottom-4 left-0 h-[clamp(4.5rem,10vw,7rem)]">
          <FerryEgg />
        </div>
        <div aria-hidden className="wave-front pointer-events-none absolute inset-x-0 bottom-0 h-[30px]" />
      </div>
    </main>
  );
}
