"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useLayoutEffect, useRef, type ReactNode, type SVGProps } from "react";
import { braceD, braceTransform, braceViewBox, gdgPieces, gdgViewBox } from "./shape-data";

const INK = "#1e1e1e";

/* GDG chevrons. On hover they squash into one pill. */
const squashSpring = { type: "spring", stiffness: 420, damping: 22 } as const;

export function GdgLogo({ className, squash }: { className?: string; squash?: boolean }) {
  return (
    <motion.svg viewBox={gdgViewBox} className={className} aria-hidden initial="rest" animate={squash ? "squash" : "rest"} whileHover="squash">
      {gdgPieces.map((p) => (
        <motion.g
          key={p.fill}
          variants={{ rest: { rotate: 0, x: 0, y: 0 }, squash: p.squash }}
          transition={squashSpring}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        >
          <path transform={`matrix(1,0,0,-1,${p.t})`} d={p.d} fill={p.fill} stroke={INK} strokeWidth={9.5} />
        </motion.g>
      ))}
    </motion.svg>
  );
}

/* Bold curly braces. */
export function Brace({ side, className, ...rest }: { side: "left" | "right" } & SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox={braceViewBox} className={className} aria-hidden {...rest}>
      <path
        transform={braceTransform[side]}
        d={braceD[side]}
        fill="currentColor"
        stroke={INK}
        strokeWidth={6}
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* Notched "folder tab" card, the main container shape. */
export function tabPath(w: number, h: number, tw: number, th: number, r: number, s: number) {
  const i = s / 2;
  const R = Math.min(r, th / 2, (w - tw) / 2);
  if (w <= 0 || h <= 0) return "";
  tw = Math.min(Math.max(tw, 2 * R), w - 2 * R);
  return [
    `M${i + R} ${i}`,
    `H${tw - R}`,
    `A${R} ${R} 0 0 1 ${tw} ${i + R}`,
    `V${th - R}`,
    `A${R} ${R} 0 0 0 ${tw + R} ${th}`,
    `H${w - i - R}`,
    `A${R} ${R} 0 0 1 ${w - i} ${th + R}`,
    `V${h - i - R}`,
    `A${R} ${R} 0 0 1 ${w - i - R} ${h - i}`,
    `H${i + R}`,
    `A${R} ${R} 0 0 1 ${i} ${h - i - R}`,
    `V${i + R}`,
    `A${R} ${R} 0 0 1 ${i + R} ${i}`,
    "Z",
  ].join("");
}

export function TabCard({
  tab,
  children,
  className = "",
  tabClassName = "",
  fill = "#ffffff",
  radius = 22,
  as: Tag = "div",
}: {
  tab: ReactNode;
  children: ReactNode;
  className?: string;
  tabClassName?: string;
  fill?: string;
  radius?: number;
  as?: "div" | "article" | "li";
}) {
  const root = useRef<HTMLDivElement>(null);
  const tabEl = useRef<HTMLDivElement>(null);
  const w = useMotionValue(0);
  const h = useMotionValue(0);
  const th = useMotionValue(0);
  const tw = useSpring(0, { stiffness: 380, damping: 32 });

  useLayoutEffect(() => {
    const measure = () => {
      if (!root.current || !tabEl.current) return;
      w.set(root.current.offsetWidth);
      h.set(root.current.offsetHeight);
      th.set(tabEl.current.offsetHeight);
      const target = tabEl.current.offsetWidth + 6;
      if (tw.get() === 0) tw.jump(target);
      else tw.set(target);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (root.current) ro.observe(root.current);
    if (tabEl.current) ro.observe(tabEl.current);
    return () => ro.disconnect();
  }, [w, h, th, tw]);

  const d = useTransform(() => tabPath(w.get(), h.get(), tw.get(), th.get(), radius, 2));

  return (
    <Tag ref={root as never} className={`relative isolate ${className}`}>
      <svg className="pointer-events-none absolute inset-0 -z-10 h-full w-full overflow-visible" aria-hidden>
        <motion.path d={d} fill={fill} stroke={INK} strokeWidth={2} />
      </svg>
      <div ref={tabEl} className={`inline-flex w-fit items-center gap-2 px-5 pt-3.5 pb-3 ${tabClassName}`}>
        {tab}
      </div>
      {children}
    </Tag>
  );
}

/* Monoline glyphs, drawn as strokes so they scale crisply. */
type IconProps = SVGProps<SVGSVGElement> & { size?: number };
const line = (size: number, rest: SVGProps<SVGSVGElement>) => ({
  width: size,
  height: size,
  viewBox: "0 0 48 48",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  ...rest,
});

export const Asterisk = ({ size = 40, ...r }: IconProps) => (
  <svg {...line(size, r)}>
    <path d="M24 4v40M4 24h40M9.9 9.9l28.2 28.2M38.1 9.9 9.9 38.1" />
  </svg>
);
export const Hash = ({ size = 40, ...r }: IconProps) => (
  <svg {...line(size, r)}>
    <path d="M19 6 15 42M33 6l-4 36M8 17h34M6 31h34" />
  </svg>
);
export const Globe = ({ size = 40, ...r }: IconProps) => (
  <svg {...line(size, r)}>
    <circle cx="24" cy="24" r="19" />
    <ellipse cx="24" cy="24" rx="9" ry="19" />
    <path d="M6 17h36M6 31h36" />
  </svg>
);
export const Cloud = ({ size = 40, ...r }: IconProps) => (
  <svg {...line(size, r)}>
    <path d="M12 36H36A8 8 0 0 0 36.5 20A11 11 0 0 0 15.5 18.6A9 9 0 0 0 12 36Z" />
  </svg>
);
export const Scallops = ({ size = 40, ...r }: IconProps) => (
  <svg {...line(size, { viewBox: "0 0 24 64", width: (size * 24) / 64, height: size, ...r })}>
    <path d="M6 2a7.5 7.5 0 0 1 0 15 7.5 7.5 0 0 1 0 15 7.5 7.5 0 0 1 0 15 7.5 7.5 0 0 1 0 15" />
  </svg>
);
export const CurveArrow = ({ size = 40, ...r }: IconProps) => (
  <svg {...line(size, r)}>
    <path d="M4 24h38M30 10c2 8 6 12 12 14-6 2-10 6-12 14" />
  </svg>
);

export const trackIcon = { ai: Asterisk, mobile: Hash, cloud: Cloud, web: Globe } as const;
