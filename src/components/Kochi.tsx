import { KochiArt } from "./KochiArt";

/** A Kochi landmark that builds itself piece by piece when it scrolls in. Decorative by default. */
export function Sticker({ id, className = "", alt = "", tilt = -6 }: { id: string; className?: string; alt?: string; tilt?: number }) {
  return <KochiArt id={id} alt={alt} className={`select-none ${className}`} style={{ rotate: `${tilt}deg` }} />;
}

const sky = [
  ["malayattoor", 1.05],
  ["edappally", 1.5],
  ["jewstreet", 1],
  ["synagogue", 1.4],
  ["cheenavala", 0.95],
  ["mattancherry", 0.75],
  ["kathakali", 0.85],
  ["houseboat", 0.8],
  ["ferry", 0.7],
] as const;

/** Kochi skyline that stands on the top edge of the footer. */
export function Skyline() {
  return (
    <div aria-hidden className="flex items-end justify-center gap-[1.5vw] overflow-hidden px-3 pt-6">
      {sky.map(([id, s], i) => (
        <KochiArt
          key={id}
          id={id}
          className={`w-auto shrink ${i % 3 === 2 ? "max-md:hidden" : ""}`}
          style={{ height: `calc(clamp(4rem, 9vw, 8.5rem) * ${s})`, minWidth: 0 }}
        />
      ))}
    </div>
  );
}
