"use client";

import { AnimatePresence, motion } from "motion/react";
import { useId, useState } from "react";
import { faqs } from "@/content/site";
import { Sticker } from "./Kochi";

// Turns emails and https links in an answer into real links.
const linkPattern = /([\w.+-]+@[\w-]+\.[\w.]+[a-z]|https:\/\/[^\s]+[^\s.,])/gi;

function linkify(text: string) {
  return text.split(linkPattern).map((part, i) => {
    if (i % 2 === 0) return part;
    const email = part.includes("@") && !part.startsWith("http");
    return (
      <a
        key={i}
        href={email ? `mailto:${part}` : part}
        {...(email ? {} : { target: "_blank", rel: "noopener" })}
        className="font-bold text-ink underline decoration-2 underline-offset-4"
      >
        {email ? part : part.replace(/^https:\/\//, "")}
      </a>
    );
  });
}

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const base = useId();

  return (
    <section id="faq" aria-labelledby="faq-title" className="mx-auto grid max-w-6xl gap-10 px-5 pb-20 sm:pb-32 md:grid-cols-[1fr_1.6fr]">
      <div>
        <h2 id="faq-title" className="text-[clamp(2.4rem,5.5vw,4.25rem)] leading-[0.98] font-bold tracking-[-0.035em]">
          Good questions
        </h2>
        <Sticker id="malayattoor" className="mt-10 h-auto w-[min(18rem,80%)] max-md:hidden" tilt={-4} />
      </div>
      <ul>
        {faqs.map((f, i) => {
          const on = open === i;
          const id = `${base}-${i}`;
          return (
            <li key={f.q}>
              <h3>
                <button
                  type="button"
                  aria-expanded={on}
                  aria-controls={id}
                  onClick={() => setOpen(on ? null : i)}
                  className="flex w-full items-center justify-between gap-6 py-3.5 text-left text-xl font-bold"
                >
                  {f.q}
                  <motion.span
                    aria-hidden
                    animate={{ rotate: on ? 45 : 0, backgroundColor: on ? "var(--track)" : "#ffffff" }}
                    className="ink-border grid size-9 shrink-0 place-items-center rounded-full text-xl leading-none font-normal"
                  >
                    +
                  </motion.span>
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {on && (
                  <motion.div
                    id={id}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 34 }}
                    className="overflow-hidden"
                  >
                    <p className="max-w-[60ch] pb-6 text-lg leading-relaxed text-ink/80">{linkify(f.a)}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
