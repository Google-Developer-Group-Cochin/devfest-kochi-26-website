"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState, useSyncExternalStore, type ChangeEvent } from "react";
import { event, kochi } from "@/content/site";
import { attempt } from "./eggs";
import { braceD, gdgPieces as pieces } from "./shape-data";
import { tabPath } from "./shapes";

const W = 1080;
const H = 1350;
const INK = "#1e1e1e";

const roles = [
  { id: "Developer", fill: "#c3ecf6", accent: "#57caff" },
  { id: "Designer", fill: "#f8d8d8", accent: "#ff7daf" },
  { id: "Student", fill: "#ffe7a5", accent: "#ffd427" },
  { id: "Researcher", fill: "#ccf6c5", accent: "#5cdb6d" },
  { id: "Product manager", fill: "#ffe7a5", accent: "#f9ab00" },
  { id: "Builder", fill: "#c3ecf6", accent: "#4285f4" },
];

/* The attendee's photo never leaves the browser: it's squared and downscaled locally, then kept in
   localStorage so the card comes back with it next visit. If storage is full or blocked it lasts for this visit only. */
const PHOTO_KEY = "devfest-kochi-badge-photo";
let stored: string | null | undefined;
const photoListeners = new Set<() => void>();
const photoStore = {
  subscribe(fn: () => void) {
    photoListeners.add(fn);
    return () => void photoListeners.delete(fn);
  },
  get() {
    if (stored === undefined) {
      try {
        stored = localStorage.getItem(PHOTO_KEY);
      } catch {
        stored = null;
      }
    }
    return stored;
  },
  set(url: string | null) {
    stored = url;
    try {
      if (url) localStorage.setItem(PHOTO_KEY, url);
      else localStorage.removeItem(PHOTO_KEY);
    } catch {
      // not persisted; still shown for this visit
    }
    photoListeners.forEach((fn) => fn());
  },
};

async function squarePhoto(file: File) {
  const bmp = await createImageBitmap(file);
  const s = Math.min(bmp.width, bmp.height);
  const c = document.createElement("canvas");
  c.width = c.height = 480;
  // Nudged up from centre so faces in portrait shots stay in the circle.
  c.getContext("2d")!.drawImage(bmp, (bmp.width - s) / 2, (bmp.height - s) * 0.3, s, s, 0, 0, 480, 480);
  bmp.close();
  return c.toDataURL("image/jpeg", 0.85);
}

function pill(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill: string) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, h / 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.stroke();
}

function draw(
  ctx: CanvasRenderingContext2D,
  name: string,
  role: (typeof roles)[number],
  sans: string,
  mono: string,
  art: HTMLImageElement | null,
  photo: HTMLImageElement | null,
) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#f0f0f0";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = INK;
  ctx.lineJoin = "round";
  ctx.textBaseline = "alphabetic";

  const s = 0.24;
  for (const p of pieces) {
    const [tx, ty] = p.t.split(",").map(Number);
    ctx.save();
    ctx.translate(80 + 8 * s, 78 + 8 * s);
    ctx.scale(s, s);
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

  ctx.font = `500 42px ${sans}`;
  const tabLabel = "I'm attending";
  const tw = ctx.measureText(tabLabel).width + 84;
  ctx.save();
  ctx.translate(60, 220);
  ctx.lineWidth = 4;
  const card = new Path2D(tabPath(960, 1060, tw, 100, 36, 4));
  ctx.fillStyle = role.fill;
  ctx.fill(card);
  ctx.stroke(card);
  ctx.fillStyle = INK;
  ctx.fillText(tabLabel, 42, 66);
  ctx.restore();

  ctx.font = `700 168px ${sans}`;
  ctx.letterSpacing = "-7px";
  const word = ctx.measureText("DevFest").width;
  const bh = 200;
  const bs = bh / 312;
  const bw = 128 * bs;
  const total = word + bw * 2 + 24;
  let x = (W - total) / 2;
  const top = photo ? 332 : 360;
  for (const side of ["left", "right"] as const) {
    ctx.save();
    ctx.translate(side === "left" ? x : x + bw + word + 24, top);
    ctx.scale(bs, bs);
    ctx.transform(1, 0, 0, -1, side === "left" ? 8.05 : 119.85, side === "left" ? 190.82 : 120.83);
    const path = new Path2D(braceD[side]);
    ctx.fillStyle = role.accent;
    ctx.fill(path);
    ctx.lineWidth = 6;
    ctx.stroke(path);
    ctx.restore();
  }
  x += bw + 12;
  ctx.fillStyle = INK;
  ctx.fillText("DevFest", x, top + 158);
  ctx.letterSpacing = "0px";

  ctx.lineWidth = 4;
  ctx.font = `400 46px ${sans}`;
  const kochiW = ctx.measureText("Kochi").width + 70;
  const yearW = ctx.measureText("2026").width + 70;
  const px = (W - kochiW - yearW) / 2;
  const py = photo ? 560 : 600;
  pill(ctx, px, py, kochiW + yearW, 84, "#ffffff");
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(px, py, kochiW + yearW, 84, 42);
  ctx.clip();
  ctx.fillStyle = role.accent;
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

  // Photo: a round sticker with an offset ring in the role colour; the name block moves down to make room.
  const nameY = photo ? 1042 : 880;
  const roleY = photo ? 1066 : 930;
  if (photo) {
    const r = 145;
    const cy = 814;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(W / 2 + 12, cy + 10, r, 0, Math.PI * 2);
    ctx.fillStyle = role.accent;
    ctx.fill();
    ctx.stroke();
    ctx.save();
    ctx.beginPath();
    ctx.arc(W / 2, cy, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(photo, W / 2 - r, cy - r, r * 2, r * 2);
    ctx.restore();
    ctx.beginPath();
    ctx.arc(W / 2, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  const label = name.trim() || "Your name";
  let size = photo ? 88 : 112;
  ctx.font = `700 ${size}px ${sans}`;
  while (ctx.measureText(label).width > 860 && size > 48) ctx.font = `700 ${(size -= 4)}px ${sans}`;
  ctx.textAlign = "center";
  ctx.fillStyle = name.trim() ? INK : "rgba(30,30,30,0.35)";
  ctx.fillText(label, W / 2, nameY);

  ctx.font = `500 44px ${sans}`;
  const rw = ctx.measureText(role.id).width + 80;
  pill(ctx, (W - rw) / 2, roleY, rw, 84, "#ffffff");
  ctx.fillStyle = INK;
  ctx.fillText(role.id, W / 2, roleY + 57);

  ctx.font = `400 34px ${mono}`;
  const day = new Date(event.start).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
  ctx.fillText(`${day} · ${event.place}`, W / 2, photo ? 1198 : 1160);
  ctx.font = `700 34px ${mono}`;
  ctx.fillText("#DevFestKochi", W / 2, photo ? 1242 : 1212);
  ctx.textAlign = "left";

  if (art) {
    const fit = Math.min(300 / art.naturalWidth, 280 / art.naturalHeight);
    const w = art.naturalWidth * fit;
    const h = art.naturalHeight * fit;
    ctx.save();
    ctx.translate(860, 250 - h / 2 + 40);
    ctx.rotate((-6 * Math.PI) / 180);
    ctx.drawImage(art, -w / 2, -h / 2, w, h);
    ctx.restore();
  }
}

export default function BadgeMaker() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState(roles[0]);
  const [ready, setReady] = useState(false);
  const [artId, setArtId] = useState<string | null>("kathakali");
  const [loaded, setLoaded] = useState<{ id: string; img: HTMLImageElement } | null>(null);
  const art = loaded && loaded.id === artId ? loaded.img : null;
  const photoUrl = useSyncExternalStore(photoStore.subscribe, photoStore.get, () => null);
  const [photoImg, setPhotoImg] = useState<{ src: string; img: HTMLImageElement } | null>(null);
  const photo = photoUrl && photoImg?.src === photoUrl ? photoImg.img : null;
  const [photoError, setPhotoError] = useState(false);
  const canShare = useSyncExternalStore(
    () => () => {},
    () => typeof navigator.canShare === "function",
    () => false,
  );

  const rx = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });
  const ry = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });
  const glare = useTransform(() => `radial-gradient(circle at ${50 + ry.get() * 4}% ${50 - rx.get() * 4}%, rgba(255,255,255,0.45), transparent 55%)`);

  useEffect(() => {
    const css = getComputedStyle(document.documentElement);
    const sans = css.getPropertyValue("--font-google-sans") || "sans-serif";
    Promise.all([document.fonts.load(`700 100px ${sans}`), document.fonts.load(`400 100px ${sans}`)]).then(() => setReady(true));
  }, []);

  useEffect(() => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    const css = getComputedStyle(document.documentElement);
    draw(ctx, name, role, css.getPropertyValue("--font-google-sans") || "sans-serif", css.getPropertyValue("--font-google-sans-code") || "monospace", art, photo);
  }, [name, role, ready, art, photo]);

  // Easter egg: one name, written on the card, opens a coupon. Tried once typing pauses.
  useEffect(() => {
    if (name.trim().length < 4) return;
    const t = setTimeout(() => attempt("badge", name), 500);
    return () => clearTimeout(t);
  }, [name]);

  useEffect(() => {
    if (!photoUrl) return;
    const img = new Image();
    img.onload = () => setPhotoImg({ src: photoUrl, img });
    img.src = photoUrl;
  }, [photoUrl]);

  async function upload(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    try {
      photoStore.set(await squarePhoto(f));
      setPhotoError(false);
    } catch {
      setPhotoError(true);
    }
  }

  useEffect(() => {
    if (!artId) return;
    const img = new Image();
    img.onload = () => setLoaded({ id: artId, img });
    img.src = `/kochi/${artId}.svg`;
  }, [artId]);

  const blob = () => new Promise<Blob | null>((r) => canvas.current?.toBlob(r, "image/png"));
  const file = () => `devfest-kochi-26-${(name.trim() || "badge").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;

  async function download() {
    const b = await blob();
    if (!b) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(b);
    a.download = file();
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  async function share() {
    const b = await blob();
    if (!b) return;
    const f = new File([b], file(), { type: "image/png" });
    if (navigator.canShare?.({ files: [f] })) {
      await navigator.share({ files: [f], text: "I'm going to DevFest Kochi '26! #DevFestKochi" }).catch(() => {});
    } else download();
  }

  return (
    <section id="badge" aria-labelledby="badge-title" className="mx-auto max-w-6xl px-5 pb-20 sm:pb-32">
      <div className="grid items-center gap-12 md:grid-cols-[1fr_1.05fr]">
        <div>
          <h2 id="badge-title" className="text-[clamp(2.4rem,5.5vw,4.25rem)] leading-[0.98] font-bold tracking-[-0.035em]">
            Make it official
          </h2>
          <p className="mt-4 max-w-[42ch] text-lg text-ink/75">Make your attendee card and post it with #DevFestKochi.</p>

          <label className="mt-8 block">
            <span className="font-mono text-sm text-ink-soft">Your name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              autoComplete="name"
              placeholder="Your name"
              className="ink-border mt-1.5 block w-full rounded-full bg-white px-5 py-3 text-lg outline-none placeholder:text-ink/35 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue"
            />
          </label>

          <fieldset className="mt-6">
            <legend className="font-mono text-sm text-ink-soft">I&apos;m a</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {roles.map((r) => (
                <label key={r.id} className="cursor-pointer">
                  <input type="radio" name="role" className="peer sr-only" checked={role.id === r.id} onChange={() => setRole(r)} />
                  <span
                    className="ink-border inline-block rounded-full bg-white px-4 py-1.5 transition-[background-color,transform] peer-checked:font-bold peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue active:scale-95"
                    style={role.id === r.id ? { background: r.accent } : undefined}
                  >
                    {r.id}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-6">
            <legend className="font-mono text-sm text-ink-soft">Add a bit of Kochi</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {[null, ...kochi.map((k) => k.id)].map((id) => {
                const k = kochi.find((x) => x.id === id);
                return (
                  <label key={id ?? "none"} className="cursor-pointer">
                    <input type="radio" name="kochi" className="peer sr-only" checked={artId === id} onChange={() => setArtId(id)} />
                    <span
                      className={`grid size-14 place-items-center rounded-2xl border-2 transition-[border-color,background-color,transform] peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue active:scale-90 ${artId === id ? "border-ink bg-(--track-soft)" : "border-ink/20 bg-white hover:border-ink/60"}`}
                    >
                      {k ? (
                        <img src={`/kochi/${k.id}.svg`} alt={k.name} className="max-h-10 max-w-10" draggable={false} />
                      ) : (
                        <span className="font-mono text-xs">none</span>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="mt-6">
            <legend className="font-mono text-sm text-ink-soft">Your photo (optional)</legend>
            <div className="mt-2 flex flex-wrap items-center gap-4">
              <label className="cursor-pointer">
                <input type="file" accept="image/*" className="peer sr-only" onChange={upload} />
                <span className="ink-border inline-flex items-center gap-2.5 rounded-full bg-white py-1.5 pr-5 pl-1.5 transition-transform peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue active:scale-95">
                  {photoUrl ? (
                    <img src={photoUrl} alt="" className="size-9 rounded-full border-2 border-ink object-cover" />
                  ) : (
                    <span aria-hidden className="grid size-9 place-items-center rounded-full bg-(--track-soft)">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 13V3M5 7l4-4 4 4M3 15h12" />
                      </svg>
                    </span>
                  )}
                  {photoUrl ? "Change photo" : "Upload a photo"}
                </span>
              </label>
              {photoUrl && (
                <button type="button" onClick={() => photoStore.set(null)} className="font-mono text-sm underline underline-offset-4 hover:text-ink-soft">
                  Remove
                </button>
              )}
            </div>
            <p role="status" className="mt-2 text-sm text-ink-soft">
              {photoError ? "That file couldn't be read. Try a JPG or PNG." : ""}
            </p>
          </fieldset>

          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" onClick={download} className="ink-border rounded-full bg-ink px-6 py-3 font-bold text-paper transition-transform active:scale-95">
              Download PNG
            </button>
            {canShare && (
              <button type="button" onClick={share} className="ink-border rounded-full bg-white px-6 py-3 transition-transform active:scale-95">
                Share
              </button>
            )}
          </div>
        </div>

        <div className="[perspective:1200px]">
          <motion.div
            className="relative mx-auto w-full max-w-[460px] overflow-hidden rounded-[20px] ink-border"
            style={{ rotateX: rx, rotateY: ry }}
            onPointerMove={(e) => {
              if (e.pointerType !== "mouse") return;
              const b = e.currentTarget.getBoundingClientRect();
              ry.set(((e.clientX - b.left) / b.width - 0.5) * 14);
              rx.set(-((e.clientY - b.top) / b.height - 0.5) * 14);
            }}
            onPointerLeave={() => (rx.set(0), ry.set(0))}
          >
            <canvas ref={canvas} width={W} height={H} className="block h-auto w-full" role="img" aria-label={`Attendee card for ${name || "you"}, ${role.id}, DevFest Kochi 2026`} />
            <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: glare }} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
