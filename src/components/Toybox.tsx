"use client";

import { Canvas, useFrame, useLoader, useThree, type ThreeEvent } from "@react-three/fiber";
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";
import brand from "@/content/brand-bits.json";
import data from "@/content/culture.json";

type Piece = (typeof data.pieces)[number];
type Move = "thump" | "turn" | "sway";
type Item = { geo: THREE.BufferGeometry; face: THREE.Material; calm?: boolean; move?: Move };
type Body = {
  pos: THREE.Vector2;
  vel: THREE.Vector2;
  home: THREE.Vector2;
  z: number;
  rot: number;
  spin: number;
  homeRot: number;
  radius: number;
  phase: number;
  wakeAt: number;
  off: boolean;
};

/* Calm pieces (the deity and the lamp) float but never get flung into a spin.
   thump: the drum beats; turn: rotates slowly in place; sway: rocks side to side. */
const traits: Record<string, { calm?: boolean; move?: Move }> = {
  theyyam: { calm: true },
  nilavilakku: { calm: true },
  chenda: { move: "thump" },
  pookalam: { move: "turn" },
  chaaya: { move: "sway" },
  elaneer: { move: "sway" },
};
const onPhones = ["kathakali", "sadya", "theyyam", "elaneer"];
const bitsOnPhones = 4;

/* Sizes are dealt once per visit: the shown pieces are shuffled onto a ladder from big to small,
   so every load has a couple of large ones and a few small ones, and a resize doesn't reshuffle. */
const roll = Object.fromEntries(data.pieces.map((p) => [p.id, Math.random()]));
const bitSize = brand.bits.map(() => 0.7 + Math.random() * 0.7);
const ladder = (n: number, i: number, top: number) => top - ((top - 0.6) * i) / Math.max(1, n - 1);

const INK = new THREE.MeshBasicMaterial({ color: "#1e1e1e" });
const UNIT = 1 / 1920;
const PIECE = 300;
const BIT = 100;

/* Thick slab with an ink rim. With uv, cap UVs (in outline pixels) are mapped onto a w×h texture;
   side UVs don't matter, the sides are ink. */
function extrude(shapes: THREE.Shape[], k: number, uv?: [number, number]) {
  const geo = new THREE.ExtrudeGeometry(shapes, {
    depth: 22 / k,
    bevelEnabled: true,
    bevelThickness: 4 / k,
    bevelSize: 5 / k,
    bevelSegments: 1,
    curveSegments: uv ? 1 : 12,
  });
  if (uv) {
    const a = geo.attributes.uv;
    for (let i = 0; i < a.count; i++) a.setXY(i, a.getX(i) / uv[0], a.getY(i) / uv[1]);
  }
  geo.scale(k, k, k);
  geo.center();
  geo.computeBoundingSphere();
  return geo;
}

/* A die-cut sticker: the art's outline, with the art printed on the face. */
function pieceGeometry(p: Piece, size: number) {
  const shapes = p.outline
    .split("Z")
    .filter(Boolean)
    .map((part) => new THREE.Shape(part.slice(1).split("L").map((pt) => {
      const [x, y] = pt.split(" ").map(Number);
      return new THREE.Vector2(x, p.h - y);
    })));
  return extrude(shapes, (PIECE * size) / Math.sqrt(p.w * p.h), [p.w, p.h]);
}

/* The small Google brand shapes sprinkled between the pieces for colour. */
function bitGeometry(d: string, i: number) {
  const shapes = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${d}"/></svg>`).paths.flatMap((p) => p.toShapes());
  const box = new THREE.Box2().setFromPoints(shapes.flatMap((s) => s.getPoints()));
  const { x, y } = box.getSize(new THREE.Vector2());
  return extrude(shapes, (BIT * bitSize[i]) / Math.sqrt(x * y));
}

type Rect = { x0: number; x1: number; y0: number; y1: number };

/* Deterministic scatter that keeps stickers fully on screen, off the text and below the nav strip.
   A sticker with no clean spot (short or narrow screens) gets no home and sits out. */
function layout(radii: number[], w: number, h: number, text: Rect[], navTop: number, floor: number) {
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const homes: (THREE.Vector2 | null)[] = [];
  const placed: number[] = [];
  // Biggest first, so the small bits fill the gaps the art leaves.
  [...radii.keys()].sort((a, b) => radii[b] - radii[a]).forEach((i) => {
    const r = radii[i];
    let best = new THREE.Vector2();
    let bestScore = -Infinity;
    for (let t = 0; t < 200; t++) {
      const c = new THREE.Vector2((rand() - 0.5) * (w - r * 2.3), (rand() - 0.5) * (h - r * 2.3));
      const overText = text.some((t) => c.x > t.x0 - r && c.x < t.x1 + r && c.y > t.y0 - r * 0.8 && c.y < t.y1 + r * 0.8);
      const underNav = c.y + r * 0.9 > navTop || c.y - r < floor;
      const gap = placed.reduce((m, j) => Math.min(m, c.distanceTo(homes[j]!) - r - radii[j]), Infinity);
      const score = (overText ? -10 : 0) + (underNav ? -4 : 0) + Math.min(gap, 2);
      if (score > bestScore) [best, bestScore] = [c, score];
    }
    homes[i] = bestScore > -radii[i] * 0.3 ? best : null;
    if (homes[i]) placed.push(i);
  });
  return homes;
}

function Stickers({ source, clear }: { source: RefObject<HTMLElement | null>; clear: RefObject<HTMLElement | null> }) {
  const { viewport, size, gl } = useThree();
  const mobile = size.width < 700;
  const pieces = useMemo(() => (mobile ? data.pieces.filter((p) => onPhones.includes(p.id)) : data.pieces), [mobile]);
  const textures = useLoader(THREE.TextureLoader, pieces.map((p) => `/culture/${p.id}.webp`));
  // Bits are interleaved with the pieces so the colour spreads across the frame instead of clumping.
  const items = useMemo(() => {
    const rank = pieces.map((p) => p.id).sort((a, b) => roll[a] - roll[b]);
    const art: Item[] = pieces.map((p, i) => {
      const t = textures[i].clone();
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = gl.capabilities.getMaxAnisotropy();
      const size = ladder(pieces.length, rank.indexOf(p.id), mobile ? 1.1 : 1.3);
      return { geo: pieceGeometry(p, size), face: new THREE.MeshBasicMaterial({ map: t }), ...traits[p.id] };
    });
    const bits: Item[] = brand.bits
      .slice(0, mobile ? bitsOnPhones : undefined)
      .map((b, i) => ({ geo: bitGeometry(b.d, i), face: new THREE.MeshBasicMaterial({ color: b.fill }) }));
    return art.flatMap((a, i) => (bits[i] ? [a, bits[i]] : [a])).concat(bits.slice(art.length));
  }, [pieces, textures, gl, mobile]);
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const pointer = useRef({ x: 0, y: 0, active: false });
  const drag = useRef<{ i: number; ox: number; oy: number; lx: number; ly: number; moved: number } | null>(null);

  // Sized off the visible screen, not the hero: on a landscape phone the hero outgrows the screen and the stickers would balloon.
  const tall = Math.min(size.height, window.innerHeight);
  const scale = Math.min(size.width, tall * (mobile ? 1 : 1.78)) * (viewport.width / size.width) * UNIT * (mobile ? 1.3 : 0.55);

  const bodies = useRef<Body[]>([]);
  const keep = useRef<{ text: Rect[]; w: number; h: number; floor: number }>(null);
  useLayoutEffect(() => {
    const host = source.current;
    const el = clear.current;
    if (!host || !el) return;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    // offset* ignore transforms, so entrance and parallax motion don't skew the measurement
    const W = host.clientWidth;
    const H = host.clientHeight;
    const toX = (px: number) => (px / W - 0.5) * viewport.width;
    const toY = (px: number) => -(px / H - 0.5) * viewport.height;
    const pad = 12;
    const rect = (x: number, y: number, w: number, h: number) => ({ x0: toX(x - pad), x1: toX(x + w + pad), y1: toY(y - pad), y0: toY(y + h + pad) });
    // Desktop keeps the whole text column clear. Phones have no room for that, so each line is cleared on its own,
    // which frees the margins beside the narrower lines for a few stickers.
    // Nothing rests at or below the countdown on phones; that strip runs into the bottom fade.
    const text = mobile
      ? [...el.children].map((c, i, all) => {
          const e = c as HTMLElement;
          const r = rect(el.offsetLeft + e.offsetLeft, el.offsetTop + e.offsetTop, e.offsetWidth, e.offsetHeight);
          return i === all.length - 1 ? { ...r, x0: -viewport.width, x1: viewport.width, y0: -viewport.height } : r;
        })
      : [rect(el.offsetLeft, el.offsetTop, el.offsetWidth, el.offsetHeight)];
    const navTop = toY(84);
    // The hero's bottom 3.5rem fades out (see Hero), so nothing settles in it.
    const floor = toY(H - 56);

    const radii = items.map((it) => it.geo.boundingSphere!.radius * scale * 0.72);
    // Homes are spaced on the full outline so resting stickers clear the text; collisions use the snugger radius.
    const homes = layout(radii.map((r) => r * 1.2), viewport.width, viewport.height, text, navTop, floor);
    keep.current = { text, w: viewport.width / 2, h: viewport.height / 2, floor };
    bodies.current = homes.map((spot, i) => {
      const home = spot ?? new THREE.Vector2(0, viewport.height * 4);
      return {
        home,
        off: !spot,
        // Each piece starts above the frame, off to one side, so it glides in on a slant like a kite.
        pos: still || !spot ? home.clone() : new THREE.Vector2(home.x + (i % 2 ? 1 : -1) * 1.6, viewport.height / 2 + radii[i] + 1 + (i % 4) * 0.8),
        vel: new THREE.Vector2(),
        z: (((i * 5) % 7) - 3) * 0.3,
        rot: still ? 0 : (i % 2 ? 1 : -1) * 0.6,
        spin: 0,
        homeRot: (((i * 37) % 24) - 12) * (Math.PI / 180),
        radius: radii[i],
        phase: i * 1.7,
        wakeAt: still ? -10 : 0.3 + i * 0.09,
      };
    });
  }, [source, clear, items, scale, viewport.width, viewport.height, mobile]);

  useEffect(() => {
    const el = source.current;
    if (!el) return;
    const toWorld = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      return { x: ((e.clientX - r.left) / r.width - 0.5) * viewport.width, y: -((e.clientY - r.top) / r.height - 0.5) * viewport.height };
    };
    const move = (e: PointerEvent) => {
      const p = toWorld(e);
      pointer.current = { ...p, active: e.pointerType === "mouse" };
      const d = drag.current;
      if (d) {
        d.moved += Math.abs(p.x - d.lx) + Math.abs(p.y - d.ly);
        d.lx = p.x;
        d.ly = p.y;
      }
    };
    const leave = () => (pointer.current.active = false);
    const up = () => {
      const d = drag.current;
      const b = d && d.moved < 0.05 ? bodies.current[d.i] : undefined;
      if (b) b.spin += (items[d!.i].calm ? 2.5 : 14) * (Math.random() > 0.5 ? 1 : -1);
      drag.current = null;
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [source, items, viewport.width, viewport.height]);

  const grab = (i: number) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const b = bodies.current[i];
    if (!b) return;
    const px = e.point.x;
    const py = e.point.y;
    if (e.pointerType !== "mouse") {
      const calm = items[i].calm;
      b.vel.add(new THREE.Vector2(b.pos.x - px, b.pos.y - py).setLength(calm ? 3 : 9));
      b.spin += calm ? 2.5 : 12;
      return;
    }
    drag.current = { i, ox: b.pos.x - px, oy: b.pos.y - py, lx: px, ly: py, moved: 0 };
  };

  // Pair collisions are O(n²), fine for a dozen bodies; switch to a grid if the count grows.
  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30);
    const t = state.clock.elapsedTime;
    const p = pointer.current;
    const d = drag.current;
    const all = bodies.current;
    const camera = state.camera;

    all.forEach((b, i) => {
      if (b.off || t < b.wakeAt) return;
      const age = t - b.wakeAt;
      const calm = items[i].calm;
      if (d?.i === i) {
        const tx = d.lx + d.ox;
        const ty = d.ly + d.oy;
        b.vel.set((tx - b.pos.x) / dt, (ty - b.pos.y) / dt).clampLength(0, 40);
        b.pos.set(tx, ty);
      } else {
        // A soft pull while gliding in, firming up once home; the flutter fades as it lands.
        const pull = 2.5 + 6.5 * Math.min(1, age / 2.5);
        const flutter = Math.exp(-age * 0.9) * (calm ? 3 : 7);
        const bob = Math.sin(t * 0.9 + b.phase) * (calm ? 0.04 : 0.07);
        const drift = Math.sin(t * 0.55 + b.phase * 1.3) * 0.05;
        b.vel.x += ((b.home.x + drift - b.pos.x) * pull + Math.sin(t * 3.1 + b.phase) * flutter) * dt;
        b.vel.y += (b.home.y + bob - b.pos.y) * pull * dt;
        if (p.active) {
          const dx = b.pos.x - p.x;
          const dy = b.pos.y - p.y;
          const dist = Math.hypot(dx, dy);
          const reach = b.radius + 1.1;
          if (dist < reach && dist > 0.001) {
            const push = ((reach - dist) / reach) * (calm ? 25 : 60) * dt;
            b.vel.x += (dx / dist) * push;
            b.vel.y += (dy / dist) * push;
          }
        }
        b.vel.multiplyScalar(Math.exp(-3.2 * dt));
        b.pos.addScaledVector(b.vel, dt);
      }
      const move = items[i].move;
      if (move === "turn") b.homeRot += 0.25 * dt;
      const sway = move === "sway" ? Math.sin(t * 1.3 + b.phase) * 0.12 : Math.sin(t * 0.7 + b.phase) * 0.04;
      b.spin += ((b.homeRot + sway - b.rot) * 10 - b.vel.x * 0.6) * dt;
      b.spin *= Math.exp(-3 * dt);
      b.rot += b.spin * dt;
    });

    for (let i = 0; i < all.length; i++) {
      for (let j = i + 1; j < all.length; j++) {
        const a = all[i];
        const b = all[j];
        const dx = b.pos.x - a.pos.x;
        const dy = b.pos.y - a.pos.y;
        const dist = Math.hypot(dx, dy);
        const min = a.radius + b.radius;
        if (dist >= min || dist < 1e-4 || a.off || b.off) continue;
        const nx = dx / dist;
        const ny = dy / dist;
        const overlap = (min - dist) / 2;
        a.pos.x -= nx * overlap;
        a.pos.y -= ny * overlap;
        b.pos.x += nx * overlap;
        b.pos.y += ny * overlap;
        const rel = (b.vel.x - a.vel.x) * nx + (b.vel.y - a.vel.y) * ny;
        if (rel < 0) {
          const k = -rel * 0.7;
          a.vel.x -= nx * k;
          a.vel.y -= ny * k;
          b.vel.x += nx * k;
          b.vel.y += ny * k;
        }
      }
    }

    // Once landed, stickers stay fully on screen (they bounce off the edges) and are eased out from behind the text.
    const k = keep.current;
    all.forEach((b, i) => {
      if (!k || b.off || d?.i === i || t - b.wakeAt < 2) return;
      const r = b.radius * 1.2;
      // Stickers nearer the camera project larger, so their walls pull in to match.
      const near = (camera.position.z - b.z) / camera.position.z;
      const wall = (v: number, lo: number, hi: number, axis: "x" | "y") => {
        if (v < lo) b.vel[axis] = Math.abs(b.vel[axis]) * 0.5;
        if (v > hi) b.vel[axis] = -Math.abs(b.vel[axis]) * 0.5;
        return THREE.MathUtils.clamp(v, lo, hi);
      };
      b.pos.x = wall(b.pos.x, -k.w * near + r, k.w * near - r, "x");
      b.pos.y = wall(b.pos.y, k.floor * near + r, k.h * near - r, "y");
      for (const { x0, x1, y0, y1 } of k.text) {
        const left = b.pos.x - (x0 - r);
        const right = x1 + r - b.pos.x;
        const below = b.pos.y - (y0 - r);
        const above = y1 + r - b.pos.y;
        if (left <= 0 || right <= 0 || below <= 0 || above <= 0) continue;
        const ease = Math.min(1, dt * 6);
        const exit = Math.min(left, right, above, below);
        if (exit === left) b.pos.x -= left * ease;
        else if (exit === right) b.pos.x += right * ease;
        else if (exit === above) b.pos.y += above * ease;
        else b.pos.y -= below * ease;
      }
    });

    all.forEach((b, i) => {
      const m = meshes.current[i];
      if (!m) return;
      m.visible = !b.off;
      // A slow turn on the vertical axis shows off the sticker's thickness; the drum adds a beat.
      const turn = Math.sin(t * 0.5 + b.phase) * 0.22;
      const beat = items[i].move === "thump" ? 1 + 0.07 * Math.exp(-((t + b.phase) % 1.6) * 9) : 1;
      m.position.set(b.pos.x, b.pos.y, b.z);
      m.rotation.set(THREE.MathUtils.clamp(-b.vel.y * 0.07, -0.9, 0.9), THREE.MathUtils.clamp(b.vel.x * 0.07, -0.9, 0.9) + turn, b.rot);
      m.scale.setScalar(scale * beat);
    });

    // Depth parallax: the camera leans toward the pointer, so nearer stickers slide more than far ones.
    const cx = p.active ? p.x * 0.04 : 0;
    const cy = p.active ? p.y * 0.04 : 0;
    camera.position.x += (cx - camera.position.x) * Math.min(1, dt * 2);
    camera.position.y += (cy - camera.position.y) * Math.min(1, dt * 2);
    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      {items.map((it, i) => (
        <mesh
          key={i}
          ref={(m) => {
            meshes.current[i] = m;
          }}
          geometry={it.geo}
          material={[it.face, INK]}
          scale={scale}
          position={[0, viewport.height, 0]}
          onPointerDown={grab(i)}
          onPointerOver={() => (document.body.style.cursor = "grab")}
          onPointerOut={() => (document.body.style.cursor = "")}
        />
      ))}
    </>
  );
}

export default function Toybox({ source, clear }: { source: RefObject<HTMLElement | null>; clear: RefObject<HTMLElement | null> }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    if (wrap.current) io.observe(wrap.current);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={wrap}
      aria-hidden
      className="absolute inset-0 transition-opacity duration-700"
      style={{ opacity: shown ? 1 : 0 }}
    >
      <Canvas
        eventSource={source as RefObject<HTMLElement>}
        frameloop={visible ? "always" : "never"}
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 20], fov: 35 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        onCreated={(state) => {
          // eventPrefix="client" measures from the screen's corner, so once the hero scrolls taps miss the stickers.
          state.setEvents({
            compute: (e, s) => {
              s.pointer.set(((e.clientX - s.size.left) / s.size.width) * 2 - 1, -((e.clientY - s.size.top) / s.size.height) * 2 + 1);
              s.raycaster.setFromCamera(s.pointer, s.camera);
            },
          });
          requestAnimationFrame(() => setShown(true));
        }}
      >
        <Suspense fallback={null}>
          <Stickers source={source} clear={clear} />
        </Suspense>
      </Canvas>
    </div>
  );
}
