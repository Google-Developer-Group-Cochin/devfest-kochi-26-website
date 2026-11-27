// Editable content lives in the JSON files next to this one (edited through Pages CMS, see /.pages.yml).
import agendaJson from "./agenda.json";
import eventJson from "./event.json";
import faqsJson from "./faqs.json";
import filmJson from "./film.json";
import roadJson from "./road.json";
import speakersJson from "./speakers.json";
import tracksJson from "./tracks.json";

// The CMS stores local Kochi time (yyyy-MM-ddTHH:mm); IST is UTC+05:30.
const ist = (local: string) => `${local}:00+05:30`;

export const event = { ...eventJson, start: ist(eventJson.start), end: ist(eventJson.end) };

// Vercel sets this at build time; it follows a custom domain once one is attached.
export const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "https://devfest-kochi.vercel.app";

const year = event.start.slice(0, 4);
const day = new Date(event.start).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });
export const seoTitle = `DevFest Kochi ${year} · ${day}, ${event.place} | ${event.host}`;
export const seoDescription = `DevFest Kochi ${year} by ${event.host}: a full day of talks and hands-on workshops on AI, Android, Flutter, Cloud and Web. ${event.dateLabel} at ${event.place}.`;

export type TrackId = "ai" | "mobile" | "cloud" | "web";

export const tracks = tracksJson as { id: TrackId; name: string; blurb: string; topics: string[] }[];

export type Session = {
  start: string;
  end: string;
  title: string;
  kind: "keynote" | "talk" | "workshop" | "break" | "community";
  track?: TrackId;
  room?: string;
};

export const agenda = agendaJson as Session[];

export type Speaker = {
  name: string;
  role: string;
  org: string;
  badges?: string[];
  talk: string;
  track?: TrackId | "";
  photo?: string;
  bio?: string;
  linkedin?: string;
};

export const speakers = speakersJson as { intro: string; editions: { year: string; title: string; comingSoon?: boolean; list: Speaker[] }[] };

/* TODO before the event: "TBA" blocks that are still pending. Set one to false to hide it, true to show it.
   Hidden code is kept, not deleted, so we don't forget it.
   - lineup (hidden): the "The lineup drops soon" section (ComingSoon.tsx) and its nav link. Tracks and agenda are still to be announced.
   - team (showing): the "The team" volunteers placeholder under the organizers (Organizers.tsx). Replace it once the volunteers are added. */
export const showTba = { lineup: false, team: true };

export const road: { date: string; title: string; detail: string; photo?: string; caption?: string }[] = roadJson;

export const film: { photo: string; caption?: string }[] = filmJson;

export const faqs: { q: string; a: string }[] = faqsJson;

// Illustrations live in public/kochi/<id>.svg; w and h are their viewBox sizes.
// KochiArt animates them piece by piece: the first <path> must be the black silhouette, the rest the fills.
export const kochi: { id: string; name: string; w: number; h: number }[] = [
  { id: "cheenavala", name: "Chinese fishing nets", w: 886, h: 629 },
  { id: "synagogue", name: "Paradesi Synagogue", w: 480, h: 912 },
  { id: "jewstreet", name: "Jew Street", w: 902, h: 713 },
  { id: "mattancherry", name: "Mattancherry Palace", w: 955, h: 420 },
  { id: "ferry", name: "Fort Kochi ferry", w: 828, h: 454 },
  { id: "houseboat", name: "Kettuvallam houseboat", w: 907, h: 560 },
  { id: "kathakali", name: "Kathakali", w: 669, h: 883 },
  { id: "edappally", name: "Edappally church", w: 425, h: 914 },
  { id: "malayattoor", name: "Malayattoor hill", w: 784, h: 633 },
];

export function gcalUrl(title: string, start: string, end: string, details = event.theme) {
  const fmt = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${fmt(start)}/${fmt(end)}`,
    location: `${event.venue}, ${event.venueArea}`,
    details,
  });
  return `https://calendar.google.com/calendar/render?${q}`;
}

export const at = (hhmm: string) => ist(`${eventJson.start.slice(0, 10)}T${hhmm}`);
