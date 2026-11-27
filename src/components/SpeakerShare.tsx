"use client";

import { useLenis } from "lenis/react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { event, type Speaker } from "@/content/site";
import { braceD, gdgPieces as pieces } from "./shape-data";
import { tabPath } from "./shapes";

const W = 1080;
const H = 1350;
const INK = "#1e1e1e";

/* Same Google pastel kit the badge maker / tracks use — stable random pick per speaker name. */
const kit = [
  { fill: "#c3ecf6", accent: "#57caff" },
  { fill: "#f8d8d8", accent: "#ff7daf" },
  { fill: "#ccf6c5", accent: "#5cdb6d" },
  { fill: "#ffe7a5", accent: "#ffd427" },
  { fill: "#c3ecf6", accent: "#4285f4" },
  { fill: "#f8d8d8", accent: "#ea4335" },
];

export function googleTint(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return kit[h % kit.length];
}

function pill(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill: string) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, h / 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.stroke();
}

function wrap(ctx: CanvasRenderingContext2D, text: string, max: number) {
  const lines: string[] = [];
  for (const word of text.split(" ")) {
    const next = lines.length ? `${lines[lines.length - 1]} ${word}` : word;
    if (lines.length && ctx.measureText(next).width <= max) lines[lines.length - 1] = next;
    else lines.push(word);
  }
  return lines;
}

function draw(ctx: CanvasRenderingContext2D, speaker: Speaker, sans: string, mono: string, photo: HTMLImageElement | null) {
  const { fill, accent } = googleTint(speaker.name);

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#f0f0f0";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = INK;
  ctx.lineJoin = "round";
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";

  // GDG mark — same pieces + label as the attendee card.
  const mark = 0.24;
  for (const p of pieces) {
    const [tx, ty] = p.t.split(",").map(Number);
    ctx.save();
    ctx.translate(80 + 8 * mark, 78 + 8 * mark);
    ctx.scale(mark, mark);
    ctx.transform(1, 0, 0, -1, tx, ty);
    const path = new Path2D(p.d);
    ctx.fillStyle = p.fill;
    ctx.fill(path);
    ctx.lineWidth = 9.5;
    ctx.stroke(path);
    ctx.restore();
  }
  ctx.fillStyle = INK;
  ctx.font = `700 40px ${sans}`;
  ctx.fillText("GDG Cochin", 222, 128);

  // TabCard — "Speaking at" instead of "I'm attending".
  ctx.font = `500 42px ${sans}`;
  const tabLabel = "Speaking at";
  const tw = ctx.measureText(tabLabel).width + 84;
  ctx.save();
  ctx.translate(60, 220);
  ctx.lineWidth = 4;
  const card = new Path2D(tabPath(960, 1060, tw, 100, 36, 4));
  ctx.fillStyle = fill;
  ctx.fill(card);
  ctx.stroke(card);
  ctx.fillStyle = INK;
  ctx.fillText(tabLabel, 42, 66);
  ctx.restore();

  // { DevFest } with braces — same lockup as the attendee card.
  ctx.font = `700 168px ${sans}`;
  ctx.letterSpacing = "-7px";
  const word = ctx.measureText("DevFest").width;
  const bh = 200;
  const bs = bh / 312;
  const bw = 128 * bs;
  const total = word + bw * 2 + 24;
  let x = (W - total) / 2;
  const top = 332;
  for (const side of ["left", "right"] as const) {
    ctx.save();
    ctx.translate(side === "left" ? x : x + bw + word + 24, top);
    ctx.scale(bs, bs);
    ctx.transform(1, 0, 0, -1, side === "left" ? 8.05 : 119.85, side === "left" ? 190.82 : 120.83);
    const path = new Path2D(braceD[side]);
    ctx.fillStyle = accent;
    ctx.fill(path);
    ctx.lineWidth = 6;
    ctx.stroke(path);
    ctx.restore();
  }
  x += bw + 12;
  ctx.fillStyle = INK;
  ctx.fillText("DevFest", x, top + 158);
  ctx.letterSpacing = "0px";

  // Kochi | 2026 split pill.
  ctx.lineWidth = 4;
  ctx.font = `400 46px ${sans}`;
  const kochiW = ctx.measureText("Kochi").width + 70;
  const yearW = ctx.measureText("2026").width + 70;
  const px = (W - kochiW - yearW) / 2;
  const py = 560;
  pill(ctx, px, py, kochiW + yearW, 84, "#ffffff");
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(px, py, kochiW + yearW, 84, 42);
  ctx.clip();
  ctx.fillStyle = accent;
  ctx.fillRect(px + kochiW, py, yearW, 84);
  ctx.restore();
  ctx.beginPath();
  ctx.roundRect(px, py, kochiW + yearW, 84, 42);
  ctx.moveTo(px + kochiW, py);
  ctx.lineTo(px + kochiW, py + 84);
  ctx.stroke();
  ctx.fillStyle = INK;
  ctx.fillText("Kochi", px + 35, py + 58);
  ctx.fillText("2026", px + kochiW + 35, py + 58);

  // Centered photo with offset accent ring — same placement as the attendee card.
  const r = 130;
  const cy = 796;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(W / 2 + 12, cy + 10, r, 0, Math.PI * 2);
  ctx.fillStyle = accent;
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(W / 2, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  if (photo) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(W / 2, cy, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(photo, W / 2 - r, cy - r, r * 2, r * 2);
    ctx.restore();
  } else {
    const initials = speaker.name
      .split(" ")
      .filter((p) => p.length > 1)
      .slice(0, 2)
      .map((p) => p[0])
      .join("");
    ctx.textAlign = "center";
    ctx.fillStyle = INK;
    ctx.font = `700 88px ${sans}`;
    ctx.fillText(initials, W / 2, cy + 30);
  }
  ctx.beginPath();
  ctx.arc(W / 2, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  // Name — big, centered, below the photo.
  ctx.textAlign = "center";
  let size = 88;
  ctx.font = `700 ${size}px ${sans}`;
  while (ctx.measureText(speaker.name).width > 860 && size > 48) ctx.font = `700 ${(size -= 4)}px ${sans}`;
  ctx.fillStyle = INK;
  ctx.fillText(speaker.name, W / 2, 1002);

  // Job title with the company in bold under it; both shrink until the box clears the date line.
  const parts = [
    { text: speaker.role, weight: 500 },
    { text: speaker.org, weight: 700 },
  ].filter((p) => p.text);
  if (!parts.length) parts.push({ text: "Speaker", weight: 500 });
  let metaSize = 38;
  let lines: { text: string; weight: number; width: number }[];
  let lh: number;
  for (;;) {
    lines = parts.flatMap(({ text, weight }) => {
      ctx.font = `${weight} ${metaSize}px ${sans}`;
      return wrap(ctx, text, 820).map((line) => ({ text: line, weight, width: ctx.measureText(line).width }));
    });
    lh = Math.round(metaSize * 1.25);
    if (lines.length * lh + 32 <= 144 || metaSize <= 22) break;
    metaSize -= 2;
  }
  const rw = Math.min(Math.max(...lines.map((l) => l.width)) + 80, 900);
  const rh = lines.length * lh + 32;
  ctx.beginPath();
  ctx.roundRect((W - rw) / 2, 1026, rw, rh, Math.min(rh / 2, 42));
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = INK;
  ctx.textBaseline = "middle";
  lines.forEach((l, i) => {
    ctx.font = `${l.weight} ${metaSize}px ${sans}`;
    ctx.fillText(l.text, W / 2, 1026 + 16 + lh * (i + 0.5));
  });
  ctx.textBaseline = "alphabetic";

  // Date · place + hashtag — slightly larger so the preview stays readable on phones.
  ctx.font = `400 38px ${mono}`;
  ctx.fillStyle = INK;
  const day = new Date(event.start).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
  ctx.fillText(`${day} · ${event.place}`, W / 2, 1212);
  ctx.font = `700 38px ${mono}`;
  ctx.fillText("#DevFestKochi", W / 2, 1258);
  ctx.textAlign = "left";
}

export default function SpeakerShare({ speaker, onClose }: { speaker: Speaker; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const lenis = useLenis();
  const [paint, setPaint] = useState(0);
  const [loaded, setLoaded] = useState<{ src: string; img: HTMLImageElement } | null>(null);
  const photo = speaker.photo && loaded?.src === speaker.photo ? loaded.img : null;

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    d.showModal();
    lenis?.stop();
    return () => lenis?.start();
  }, [lenis]);

  useEffect(() => {
    const css = getComputedStyle(document.documentElement);
    const sans = css.getPropertyValue("--font-google-sans") || "sans-serif";
    // The draw effect already painted with fallback fonts; repaint once Google Sans is ready.
    Promise.all([document.fonts.load(`700 100px ${sans}`), document.fonts.load(`400 100px ${sans}`)])
      .then(() => setPaint((n) => n + 1))
      .catch(() => setPaint((n) => n + 1));
  }, []);

  useEffect(() => {
    if (!speaker.photo) return;
    const src = speaker.photo;
    const img = new Image();
    img.onload = () => setLoaded({ src, img });
    img.onerror = () => setLoaded(null);
    img.src = src;
  }, [speaker.photo]);

  useEffect(() => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    const css = getComputedStyle(document.documentElement);
    draw(ctx, speaker, css.getPropertyValue("--font-google-sans") || "sans-serif", css.getPropertyValue("--font-google-sans-code") || "monospace", photo);
  }, [speaker, paint, photo]);

  async function download() {
    const blob = await new Promise<Blob | null>((r) => canvas.current?.toBlob(r, "image/png"));
    if (!blob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `devfest-kochi-26-${speaker.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  return (
    <dialog
      ref={dialog}
      aria-label={`Share card for ${speaker.name}`}
      data-lenis-prevent
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
      className="m-auto max-h-[calc(100dvh-0.75rem)] w-fit max-w-[calc(100vw-1.25rem)] overflow-visible bg-transparent p-0 text-ink backdrop:bg-ink/55 backdrop:backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.94, rotate: -1.5 }}
        animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 26 }}
        className="flex w-[min(32rem,calc(100vw-1.75rem),calc((100dvh-5.5rem)*1080/1350))] flex-col gap-2.5 pr-1.5 pb-1.5 sm:gap-3"
      >
        {/* Fixed 1080×1350 preview — width is clamped by viewport; height always follows the ratio.
            pr/pb leave room for the ink hard-shadow so it never kisses the screen edge. */}
        <canvas
          ref={canvas}
          width={W}
          height={H}
          className="ink-border block aspect-[1080/1350] h-auto w-full rounded-[1.1rem] bg-paper shadow-[5px_6px_0_var(--color-ink)] sm:rounded-[1.25rem]"
          role="img"
          aria-label={`Share card for ${speaker.name} at DevFest Kochi 2026`}
        />
        <div className="flex w-full shrink-0 gap-2 pb-[max(0px,env(safe-area-inset-bottom))]">
          <button type="button" onClick={download} className="ink-border min-h-12 flex-1 rounded-full bg-ink px-4 py-3 text-[15px] font-bold text-paper transition-transform active:scale-95 sm:px-5 sm:text-base">
            Download PNG
          </button>
          <button type="button" onClick={() => dialog.current?.close()} className="ink-border min-h-12 rounded-full bg-paper px-4 py-3 text-[15px] transition-transform active:scale-95 sm:px-5 sm:text-base">
            Close
          </button>
        </div>
      </motion.div>
    </dialog>
  );
}
