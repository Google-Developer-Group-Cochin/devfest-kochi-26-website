import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { braceD, braceTransform, braceViewBox, gdgPieces, gdgViewBox } from "@/components/shape-data";
import { event } from "@/content/site";

/* The link-preview card (1200×630), rendered at build time from the CMS event data. */

export const ogSize = { width: 1200, height: 630 };
export const ogAlt = `${event.name}: ${event.dateLabel} at ${event.place}`;

const INK = "#1e1e1e";
const root = process.cwd();
const font = (f: string) => readFile(join(root, "src/app/fonts/og", f));
const art = async (id: string) => `data:image/svg+xml;base64,${(await readFile(join(root, "public/kochi", `${id}.svg`))).toString("base64")}`;

const tracks = [
  ["AI", "#f8d8d8"],
  ["Mobile", "#ccf6c5"],
  ["Cloud", "#c3ecf6"],
  ["Web", "#ffe7a5"],
];

function Brace({ side, h }: { side: "left" | "right"; h: number }) {
  return (
    <svg viewBox={braceViewBox} width={(h * 128) / 312} height={h}>
      <path transform={braceTransform[side]} d={braceD[side]} fill="#f9ab00" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    </svg>
  );
}

export async function renderOgCard() {
  const [bold, regular, mono, houseboat, kathakali, cheenavala] = await Promise.all([
    font("GoogleSans-Bold.ttf"),
    font("GoogleSans-Regular.ttf"),
    font("GoogleSansCode-Medium.ttf"),
    art("houseboat"),
    art("kathakali"),
    art("cheenavala"),
  ]);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#f0f0f0", color: INK, fontFamily: "Google Sans", position: "relative" }}>
        <div style={{ display: "flex", flexDirection: "column", padding: "56px 0 0 64px", width: 700 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 28, fontWeight: 700, letterSpacing: -0.5 }}>
            <svg viewBox={gdgViewBox} width={62} height={37}>
              {gdgPieces.map((p) => (
                <path key={p.fill} transform={`matrix(1,0,0,-1,${p.t})`} d={p.d} fill={p.fill} stroke={INK} strokeWidth={9.5} />
              ))}
            </svg>
            {event.host}
          </div>

          <div style={{ display: "flex", alignItems: "center", marginTop: 34, marginLeft: -6 }}>
            <Brace side="left" h={150} />
            <div style={{ fontSize: 128, fontWeight: 700, letterSpacing: -6, lineHeight: 1, padding: "0 6px 14px" }}>DevFest</div>
            <Brace side="right" h={150} />
          </div>

          <div style={{ display: "flex", marginTop: 22, fontSize: 36, border: `3px solid ${INK}`, borderRadius: 999, overflow: "hidden", alignSelf: "flex-start", background: "#fff" }}>
            <div style={{ padding: "6px 28px" }}>Kochi</div>
            <div style={{ padding: "6px 28px", background: "#f9ab00", borderLeft: `3px solid ${INK}` }}>{event.start.slice(0, 4)}</div>
          </div>

          <div style={{ display: "flex", marginTop: 34, fontFamily: "Google Sans Code", fontSize: 22, color: "#5f6368" }}>
            {event.dateLabel} · {event.timeLabel}
          </div>
          <div style={{ display: "flex", marginTop: 6, fontSize: 52, fontWeight: 700, letterSpacing: -1.5 }}>{event.place}</div>
        </div>

        <div
          style={{
            position: "absolute",
            top: 40,
            right: 48,
            bottom: 48,
            width: 420,
            display: "flex",
            background: "#ccf6c5",
            border: `3px solid ${INK}`,
            borderRadius: 36,
            boxShadow: `6px 8px 0 ${INK}`,
            overflow: "hidden",
          }}
        >
          <img alt="" src={kathakali} width={170} height={224} style={{ position: "absolute", top: 30, left: 26, transform: "rotate(-8deg)" }} />
          <img alt="" src={cheenavala} width={200} height={142} style={{ position: "absolute", top: 136, right: 14, transform: "rotate(4deg)" }} />
          <img alt="" src={houseboat} width={360} height={222} style={{ position: "absolute", bottom: 22, left: 28 }} />
        </div>

        <div style={{ position: "absolute", left: 64, bottom: 44, display: "flex", gap: 12 }}>
          {tracks.map(([label, bg]) => (
            <div key={label} style={{ display: "flex", padding: "6px 20px", fontSize: 24, background: bg, border: `2.5px solid ${INK}`, borderRadius: 999 }}>
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: "Google Sans", data: bold, weight: 700, style: "normal" },
        { name: "Google Sans", data: regular, weight: 400, style: "normal" },
        { name: "Google Sans Code", data: mono, weight: 500, style: "normal" },
      ],
    },
  );
}
