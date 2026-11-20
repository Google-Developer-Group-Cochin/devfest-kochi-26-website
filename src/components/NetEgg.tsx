"use client";

import { useLenis } from "lenis/react";
import { motion } from "motion/react";
import { useRef, useState, useSyncExternalStore, type CSSProperties, type FormEvent } from "react";
import { attempt, eggStore, normalize } from "./eggs";
import { KochiArt } from "./KochiArt";

/* The last easter egg: the Chinese fishing net at the venue hauls in the top coupon once it's given the three fish
   the other eggs hand out. Order doesn't matter, and fish caught in this browser are filled in. */
export default function NetEgg({ className, style }: { className?: string; style?: CSSProperties }) {
  const { found } = useSyncExternalStore(eggStore.subscribe, eggStore.get, eggStore.server);
  const dialog = useRef<HTMLDialogElement>(null);
  const lenis = useLenis();
  const [fish, setFish] = useState(["", "", ""]);
  const [status, setStatus] = useState<"idle" | "checking" | "miss">("idle");

  function open() {
    const caught = Object.values(found).flatMap((p) => (p?.fish ? [p.fish] : []));
    setFish([0, 1, 2].map((i) => caught[i] ?? ""));
    setStatus("idle");
    dialog.current?.showModal();
    lenis?.stop();
  }

  async function haul(e: FormEvent) {
    e.preventDefault();
    setStatus("checking");
    if (await attempt("net", fish.map(normalize).sort().join(" "))) {
      setStatus("idle");
      dialog.current?.close();
    } else setStatus("miss");
  }

  return (
    <>
      <motion.button
        type="button"
        aria-label="Chinese fishing net"
        onClick={open}
        initial={{ rotate: -2 }}
        whileHover={{ rotate: -4 }}
        whileTap={{ rotate: -10, y: 6 }}
        transition={{ type: "spring", stiffness: 300, damping: 14 }}
        className={`block origin-bottom-left select-none ${className ?? ""}`}
        style={style}
      >
        <KochiArt id="cheenavala" className="h-auto w-full" />
      </motion.button>

      <dialog
        ref={dialog}
        aria-labelledby="net-title"
        data-lenis-prevent
        onClose={() => lenis?.start()}
        onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
        className="m-auto max-h-[calc(100dvh-1rem)] w-[min(26.5rem,calc(100%-1.5rem))] overscroll-contain bg-transparent p-0 pr-2 pb-2 text-ink backdrop:bg-ink/55 backdrop:backdrop-blur-sm"
      >
        <form onSubmit={haul} className="ink-border rounded-[1.75rem] bg-paper p-5 shadow-[5px_6px_0_var(--color-ink)] sm:p-6">
          <h2 id="net-title" className="text-2xl font-bold tracking-tight">
            The old fishing net
          </h2>
          <p className="mt-1 text-ink/75">It hauls in the last coupon once it holds three fish.</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {fish.map((f, i) => (
              <label key={i}>
                <span className="sr-only">Fish {i + 1}</span>
                <input
                  value={f}
                  onChange={(e) => {
                    setFish(fish.map((x, j) => (j === i ? e.target.value : x)));
                    setStatus("idle");
                  }}
                  placeholder={`Fish ${i + 1}`}
                  autoComplete="off"
                  autoCapitalize="none"
                  className="ink-border block w-full min-w-0 rounded-full bg-white px-3 py-2.5 text-center outline-none placeholder:text-ink/35 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue"
                />
              </label>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button type="submit" disabled={status === "checking"} className="ink-border rounded-full bg-ink px-6 py-3 font-bold text-paper transition-transform active:scale-95">
              Haul it in
            </button>
            <button type="button" onClick={() => dialog.current?.close()} className="ink-border rounded-full bg-white px-6 py-3 transition-transform active:scale-95">
              Close
            </button>
          </div>
          <p role="status" className="mt-2 min-h-5 text-sm text-ink-soft">
            {status === "miss" ? "The net came up empty. Check your fish." : ""}
          </p>
        </form>
      </dialog>
    </>
  );
}
