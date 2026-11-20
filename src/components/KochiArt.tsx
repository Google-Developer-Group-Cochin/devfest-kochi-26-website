"use client";

import { useInView } from "motion/react";
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { kochi } from "@/content/site";

/* The traced art is a black silhouette with colour fills on top; the gaps between fills are the ink lines.
   Each fill becomes a piece with its own outline so it can pop in on its own; the silhouette fades in last
   to bring back the black-only details (pupils, poles, trunks). */

type Piece = { d: string; fill: string };
type Art = { sil: string; pieces: Piece[]; boxes: Box[] };
type Box = { x0: number; x1: number; y0: number; y1: number };

const INK = "#1e1e1e";
const byId = Object.fromEntries(kochi.map((k) => [k.id, k]));
const cache = new Map<string, Promise<Art>>();

function load(id: string) {
  if (!cache.has(id)) {
    cache.set(
      id,
      fetch(`/kochi/${id}.svg`)
        .then((r) => r.text())
        .then((svg) => {
          const [sil, ...pieces] = [...svg.matchAll(/<path[^>]*?fill="([^"]+)"[^>]*? d="([^"]+)"/g)].map((m) => ({ fill: m[1], d: m[2] }));
          return { sil: sil.d, pieces, boxes: measure(pieces, byId[id].w, byId[id].h) };
        }),
    );
  }
  return cache.get(id)!;
}

/* Idle loops: the boat rocks on still water, the net dips, the sun bobs.
   `part` picks the pieces that move (by normalised bbox); without it the whole art moves. */
type Idle = { kind: "rock" | "dip" | "bob" | "sway" | "breathe"; dur: number; origin: [number, number]; part?: (b: Box) => boolean };
const idles: Record<string, Idle> = {
  houseboat: { kind: "rock", dur: 4.2, origin: [0.6, 0.88], part: (b) => b.x0 > 0.19 && b.y0 < 0.85 },
  ferry: { kind: "rock", dur: 3.6, origin: [0.5, 0.88], part: (b) => b.y0 < 0.85 },
  cheenavala: { kind: "dip", dur: 5, origin: [0.25, 0.8], part: (b) => b.y0 < 0.785 },
  malayattoor: { kind: "bob", dur: 3, origin: [0.67, 0.1], part: (b) => b.y1 < 0.2 },
  kathakali: { kind: "sway", dur: 4.8, origin: [0.5, 1] },
  synagogue: { kind: "sway", dur: 6, origin: [0.5, 1] },
  edappally: { kind: "sway", dur: 6.4, origin: [0.5, 1] },
  jewstreet: { kind: "breathe", dur: 3.4, origin: [0.5, 1] },
  mattancherry: { kind: "breathe", dur: 3.8, origin: [0.5, 1] },
};

const STROKE = 12;

const settle = (s: number) => [
  { transform: "scale(0.6, 0)", opacity: 0 },
  { transform: `scale(${1 + 0.1 * s}, ${1 - 0.3 * s})`, opacity: 1, offset: 0.3 },
  { transform: `scale(${1 - 0.06 * s}, ${1 + 0.12 * s})`, offset: 0.6 },
  { transform: `scale(${1 + 0.02 * s}, ${1 - 0.03 * s})`, offset: 0.82 },
  { transform: "scale(1, 1)" },
];
const pop = [
  { transform: "scale(0)", opacity: 0 },
  { transform: "scale(1.25)", opacity: 1, offset: 0.45 },
  { transform: "scale(0.92)", offset: 0.75 },
  { transform: "scale(1)" },
];
/** `crop` ([x0, y0, x1, y1], 0–1) trims the art, e.g. to drop a boat's own water when it sits on a shared one.
    `instant` skips the piece-by-piece build and shows the art whole. */
export function KochiArt({
  id,
  className = "",
  style,
  alt = "",
  crop,
  instant = false,
}: {
  id: string;
  className?: string;
  style?: CSSProperties;
  alt?: string;
  crop?: [number, number, number, number];
  instant?: boolean;
}) {
  const { w, h } = byId[id];
  const [cx0, cy0, cx1, cy1] = crop ?? [0, 0, 1, 1];
  const view = [cx0 * w, cy0 * h, (cx1 - cx0) * w, (cy1 - cy0) * h];
  const uid = useId().replace(/:/g, "");
  const ref = useRef<SVGSVGElement>(null);
  const seen = useInView(ref, { once: true, margin: "-40px" });
  const visible = useInView(ref);
  const [art, setArt] = useState<Art>();
  const [built, setBuilt] = useState(instant);
  const [settled, setSettled] = useState(instant);
  useEffect(() => {
    let live = true;
    load(id).then((a) => live && setArt(a));
    return () => {
      live = false;
    };
  }, [id]);

  const idle = idles[id];
  const boxes = art?.boxes;
  const isPart = (i: number) => !!idle?.part && !!boxes && idle.part(boxes[i]);
  const kept = (i: number) => {
    if (!crop || !boxes) return true;
    const b = boxes[i];
    const x = (b.x0 + b.x1) / 2;
    const y = (b.y0 + b.y1) / 2;
    return x >= cx0 && x <= cx1 && y >= cy0 && y <= cy1;
  };
  const clip = crop ? `url(#${uid}-crop)` : undefined;

  useEffect(() => {
    const svg = ref.current;
    if (instant || !art || !boxes || !seen || !svg) return;
    const els = [...svg.querySelectorAll<SVGPathElement>("[data-piece]")];
    // Ground first, then upwards; within a band the big shapes lead.
    const ranked = els
      .map((el) => ({ el, b: boxes[Number(el.dataset.piece)] }))
      .sort((a, z) => Math.floor(z.b.y1 / 0.08) - Math.floor(a.b.y1 / 0.08) || area(z.b) - area(a.b));
    const spread = Math.min(1.8, ranked.length * 0.12);
    ranked.forEach(({ el, b }, i) => {
      const delay = (spread * i) / ranked.length;
      const small = b.y1 - b.y0 < 0.15 && b.x1 - b.x0 < 0.2;
      el.style.transformOrigin = small ? "50% 50%" : "50% 100%";
      el.animate(small ? pop : settle(Math.min(1, (b.y1 - b.y0) * 2.5)), {
        duration: small ? 480 : 700,
        delay: delay * 1000,
        easing: "ease-out",
        fill: "backwards",
      });
    });
    svg.querySelectorAll("[data-sil]").forEach((el) =>
      el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: (spread + 0.35) * 1000, fill: "backwards" }),
    );
    setBuilt(true);
    const t = setTimeout(() => setSettled(true), (spread + 0.7) * 1000);
    return () => clearTimeout(t);
  }, [art, boxes, seen, instant]);

  const moving = idle && visible && settled ? { "data-idle": idle.kind } : {};
  const pivot = idle
    ? ({ transformBox: "view-box", transformOrigin: `${idle.origin[0] * w}px ${idle.origin[1] * h}px`, "--dur": `${idle.dur}s` } as CSSProperties)
    : {};
  // The moving part's region: its pieces' boxes padded enough to take the ropes and poles that only exist in the silhouette.
  const pad = 40;
  const partD =
    boxes && idle?.part
      ? boxes
          .filter((_, i) => isPart(i))
          .map((b) => `M${b.x0 * w - pad} ${b.y0 * h - pad}H${b.x1 * w + pad}V${b.y1 * h + pad}H${b.x0 * w - pad}Z`)
          .join("")
      : "";

  const piece = (p: Piece, i: number) =>
    kept(i) && (
      <path
        key={i}
        data-piece={i}
        d={p.d}
        fill={p.fill}
        className="art-piece"
        {...(p.fill === INK ? {} : { stroke: INK, strokeWidth: STROKE, strokeLinejoin: "round" as const, paintOrder: "stroke" })}
      />
    );

  return (
    <svg
      ref={ref}
      viewBox={view.join(" ")}
      width={view[2]}
      height={view[3]}
      className={`art overflow-visible ${className}`}
      style={{ aspectRatio: `${view[2]} / ${view[3]}`, ...style }}
      data-built={built ? "" : undefined}
      {...(alt ? { role: "img", "aria-label": alt } : { "aria-hidden": true })}
    >
      {art && boxes && (
        <>
          <defs>
            {crop && (
              <clipPath id={`${uid}-crop`}>
                <rect x={view[0]} y={view[1]} width={view[2]} height={view[3]} />
              </clipPath>
            )}
            {partD && (
              <>
                <mask id={`${uid}-part`} maskUnits="userSpaceOnUse" x={-w} y={-h} width={w * 3} height={h * 3}>
                  <path d={partD} fill="#fff" />
                </mask>
                <mask id={`${uid}-rest`} maskUnits="userSpaceOnUse" x={-w} y={-h} width={w * 3} height={h * 3}>
                  <rect x={-w} y={-h} width={w * 3} height={h * 3} fill="#fff" />
                  <path d={partD} fill="#000" />
                </mask>
              </>
            )}
          </defs>
          {partD ? (
            <>
              {/* Both silhouette halves sit under every fill, so the moving one never paints over still pieces. */}
              <path data-sil d={art.sil} fill={INK} className="art-piece" mask={`url(#${uid}-rest)`} clipPath={clip} />
              <g style={pivot} {...moving}>
                <path data-sil d={art.sil} fill={INK} className="art-piece" mask={`url(#${uid}-part)`} clipPath={clip} />
              </g>
              {art.pieces.map((p, i) => !isPart(i) && piece(p, i))}
              <g style={pivot} {...moving}>
                {art.pieces.map((p, i) => isPart(i) && piece(p, i))}
              </g>
            </>
          ) : (
            <g style={pivot} {...moving}>
              <path data-sil d={art.sil} fill={INK} className="art-piece" clipPath={clip} />
              {art.pieces.map(piece)}
            </g>
          )}
        </>
      )}
    </svg>
  );
}

const area = (b: Box) => (b.x1 - b.x0) * (b.y1 - b.y0);

/* Normalised bounding boxes, measured once per art in a hidden SVG. */
function measure(pieces: Piece[], w: number, h: number): Box[] {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("style", "position:absolute;width:0;height:0;visibility:hidden");
  document.body.append(svg);
  const boxes = pieces.map((p) => {
    const el = document.createElementNS(ns, "path");
    el.setAttribute("d", p.d);
    svg.append(el);
    const b = el.getBBox();
    return { x0: b.x / w, x1: (b.x + b.width) / w, y0: b.y / h, y1: (b.y + b.height) / h };
  });
  svg.remove();
  return boxes;
}
