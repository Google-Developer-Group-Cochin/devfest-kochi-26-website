"use client";

import { useLenis } from "lenis/react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { event } from "@/content/site";
import { EGG_COUNT, eggStore } from "./eggs";

/** The prize card any egg opens: the coupon, a copy button and, for the first three, the fish the net needs. */
export default function EggReveal() {
  const { found, showing } = useSyncExternalStore(eggStore.subscribe, eggStore.get, eggStore.server);
  const prize = showing ? found[showing] : undefined;
  const dialog = useRef<HTMLDialogElement>(null);
  const lenis = useLenis();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (prize && !d.open) {
      d.showModal();
      lenis?.stop();
    } else if (!prize && d.open) d.close();
  }, [prize, lenis]);

  async function copy() {
    if (!prize) return;
    try {
      await navigator.clipboard.writeText(prize.code);
      setCopied(true);
    } catch {}
  }

  return (
    <dialog
      ref={dialog}
      aria-labelledby="egg-title"
      data-lenis-prevent
      onClose={() => {
        eggStore.close();
        lenis?.start();
        setCopied(false);
      }}
      onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
      className="m-auto max-h-[calc(100dvh-1rem)] w-[min(27.5rem,calc(100%-1.5rem))] overscroll-contain bg-transparent p-0 pr-2 pb-2 text-ink backdrop:bg-ink/55 backdrop:backdrop-blur-sm"
    >
      {prize && (
        <div className="ink-border rounded-[1.75rem] bg-paper p-6 shadow-[5px_6px_0_var(--color-ink)] sm:p-7">
          <p className="font-mono text-sm text-ink-soft">
            Easter egg · {Object.keys(found).length} of {EGG_COUNT} found
          </p>
          <h2 id="egg-title" className="mt-2 text-[clamp(2.6rem,11vw,3.6rem)] leading-none font-bold tracking-[-0.04em]">
            {prize.off}
          </h2>
          <p className="mt-2 text-lg text-ink/80">your DevFest Kochi ticket, with this code:</p>

          <div className="ink-border mt-4 flex items-center gap-2 rounded-2xl bg-white py-2 pr-2 pl-4">
            <code className="min-w-0 flex-1 font-mono text-lg font-medium tracking-wide break-all select-all sm:text-xl">{prize.code}</code>
            <button type="button" onClick={copy} className="ink-border shrink-0 rounded-full bg-(--track) px-4 py-2 text-sm font-bold transition-transform active:scale-95">
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p role="status" className="mt-3 text-sm text-ink-soft">
            Apply it at checkout on KonfHub. Each code works once, so the first checkout takes it.
          </p>

          {prize.fish && (
            <p className="mt-5 rounded-2xl border-2 border-dashed border-ink/40 bg-pastel-blue px-4 py-3">
              You also caught a fish: <strong>{prize.fish}</strong>. Keep it. The fishing net at the venue wants three.
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <a href={event.ticketsUrl} target="_blank" rel="noopener" className="ink-border rounded-full bg-ink px-6 py-3 font-bold text-paper transition-transform active:scale-95">
              Get tickets
            </a>
            <button type="button" onClick={() => dialog.current?.close()} className="ink-border rounded-full bg-white px-6 py-3 transition-transform active:scale-95">
              Close
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
