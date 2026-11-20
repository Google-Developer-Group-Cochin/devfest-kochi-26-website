"use client";

import { useLenis } from "lenis/react";
import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import puzzle from "@/content/ferry-puzzle.json";
import { attempt } from "./eggs";
import { KochiArt } from "./KochiArt";

/* Easter egg on the 404 page: the ferry drops a boarding pass torn into a sliding puzzle. The pass word is painted on
   the ticket, and the image ships scrambled, so reading it means solving it. Tile 8 is the gap. */
const start = puzzle.board;
const GAP = 8;
const from = (t: number) => start.indexOf(t);

export default function FerryEgg() {
  const dialog = useRef<HTMLDialogElement>(null);
  const lenis = useLenis();
  const [board, setBoard] = useState(start);
  const [word, setWord] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "miss">("idle");
  const solved = board.every((t, i) => t === i);
  const gap = board.indexOf(GAP);

  function slide(p: number) {
    if (solved || p < 0 || p > 8) return;
    const sameRow = Math.floor(p / 3) === Math.floor(gap / 3);
    if (!((Math.abs(p - gap) === 1 && sameRow) || Math.abs(p - gap) === 3)) return;
    const next = [...board];
    [next[p], next[gap]] = [next[gap], next[p]];
    setBoard(next);
  }

  // Arrows push a neighbouring tile into the gap, like sliding it with a finger.
  function onKey(e: KeyboardEvent) {
    const into = { ArrowUp: gap + 3, ArrowDown: gap - 3, ArrowLeft: gap % 3 < 2 ? gap + 1 : -1, ArrowRight: gap % 3 > 0 ? gap - 1 : -1 }[e.key];
    if (into === undefined) return;
    e.preventDefault();
    slide(into);
  }

  async function board_(e: FormEvent) {
    e.preventDefault();
    setStatus("checking");
    if (await attempt("ferry", word)) {
      setStatus("idle");
      dialog.current?.close();
    } else setStatus("miss");
  }

  return (
    <>
      <button
        type="button"
        aria-label="Board the ferry"
        onClick={() => {
          dialog.current?.showModal();
          lenis?.stop();
        }}
        className="block h-full cursor-pointer transition-transform active:scale-95"
      >
        <KochiArt id="ferry" crop={[0, 0, 1, 0.9]} className="h-full w-auto" />
      </button>

      <dialog
        ref={dialog}
        aria-labelledby="ferry-title"
        data-lenis-prevent
        onClose={() => lenis?.start()}
        onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
        className="m-auto max-h-[calc(100dvh-1rem)] w-[min(26.5rem,calc(100%-1.5rem))] overscroll-contain bg-transparent p-0 pr-2 pb-2 text-ink backdrop:bg-ink/55 backdrop:backdrop-blur-sm [@media(max-height:520px)]:w-[min(46rem,calc(100%-1.5rem))]"
      >
        {/* On landscape phones the board sits beside the text, sized to the screen's height, so it's whole on screen. */}
        <div className="ink-border rounded-[1.75rem] bg-paper p-5 text-left shadow-[5px_6px_0_var(--color-ink)] sm:p-6 [@media(max-height:520px)]:grid [@media(max-height:520px)]:grid-cols-[1fr_auto] [@media(max-height:520px)]:grid-rows-[auto_auto_auto_1fr] [@media(max-height:520px)]:gap-x-5 [@media(max-height:520px)]:p-4">
          <h2 id="ferry-title" className="text-2xl font-bold tracking-tight">
            Someone dropped a ticket
          </h2>
          <p className="mt-1 text-ink/75">
            {solved ? "There it is. Read the pass word to board." : "It got torn up. Slide the pieces back together; arrow keys work too."}
          </p>

          <div
            role="group"
            aria-label="Sliding puzzle"
            tabIndex={0}
            onKeyDown={onKey}
            className="ink-border relative mt-4 aspect-square w-full overflow-hidden rounded-2xl bg-paper outline-offset-4 focus-visible:outline-3 focus-visible:outline-blue [@media(max-height:520px)]:col-start-2 [@media(max-height:520px)]:row-span-4 [@media(max-height:520px)]:row-start-1 [@media(max-height:520px)]:mt-0 [@media(max-height:520px)]:w-[min(calc(100dvh-4.5rem),50vw)]"
          >
            {start.map((t) =>
              t === GAP && !solved ? null : (
                <button
                  key={t}
                  type="button"
                  tabIndex={-1}
                  aria-label={`Piece ${t + 1}`}
                  onClick={() => slide(board.indexOf(t))}
                  className="absolute top-0 left-0 size-1/3 transition-transform duration-200 ease-out"
                  style={{
                    transform: `translate(${(board.indexOf(t) % 3) * 100}%, ${Math.floor(board.indexOf(t) / 3) * 100}%)`,
                    backgroundColor: "#ffe7a5",
                    backgroundImage: t === GAP ? undefined : "url(/eggs/ferry-ticket.webp)",
                    backgroundSize: "300% 300%",
                    backgroundPosition: `${(from(t) % 3) * 50}% ${Math.floor(from(t) / 3) * 50}%`,
                    boxShadow: solved ? undefined : "inset 0 0 0 1px #1e1e1e",
                  }}
                />
              ),
            )}
          </div>

          {solved ? (
            <form onSubmit={board_} className="mt-4 flex gap-2">
              <label className="min-w-0 flex-1">
                <span className="sr-only">Pass word</span>
                <input
                  value={word}
                  onChange={(e) => (setWord(e.target.value), setStatus("idle"))}
                  placeholder="Pass word"
                  autoComplete="off"
                  className="ink-border block w-full rounded-full bg-white px-4 py-2.5 text-lg outline-none placeholder:text-ink/35 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue"
                />
              </label>
              <button type="submit" disabled={status === "checking"} className="ink-border shrink-0 rounded-full bg-ink px-5 py-2.5 font-bold text-paper transition-transform active:scale-95">
                Board
              </button>
            </form>
          ) : (
            <button type="button" onClick={() => setBoard(start)} className="mt-3 font-mono text-sm underline underline-offset-4 hover:text-ink-soft">
              Start over
            </button>
          )}
          <p role="status" className="mt-2 min-h-5 text-sm text-ink-soft">
            {status === "miss" ? "The conductor shakes his head. Check the ticket again." : ""}
          </p>
        </div>
      </dialog>
    </>
  );
}
