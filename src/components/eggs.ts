import sealed from "@/content/eggs.json";

/* Easter eggs: four coupons hidden around the site. Each is sealed with AES-GCM under a key derived from its egg's
   answer, so solving the egg is the only way to read the code. Redemption limits live on KonfHub, nothing here is a server. */

export type EggId = keyof typeof sealed.eggs;
export type Prize = { code: string; off: string; fish?: string };
export const EGG_COUNT = Object.keys(sealed.eggs).length;

// The coupons were sealed with this exact normalisation, so changing it locks every egg.
export const normalize = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");

const bytes = (b64: string) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

/** Tries an answer. A wrong key fails AES-GCM's integrity check, so a miss is just null. */
export async function crack(id: EggId, answer: string): Promise<Prize | null> {
  const egg = sealed.eggs[id];
  if (!egg || !globalThis.crypto?.subtle) return null;
  try {
    const { subtle } = crypto;
    const base = await subtle.importKey("raw", new TextEncoder().encode(normalize(answer)), "PBKDF2", false, ["deriveKey"]);
    const key = await subtle.deriveKey(
      { name: "PBKDF2", salt: bytes(egg.salt), iterations: sealed.iterations, hash: "SHA-256" },
      base,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"],
    );
    const plain = await subtle.decrypt({ name: "AES-GCM", iv: bytes(egg.iv) }, key, bytes(egg.data));
    return JSON.parse(new TextDecoder().decode(plain));
  } catch {
    return null;
  }
}

/* What this browser has found, kept in localStorage so codes and fish survive a reload. */
const KEY = "devfest-kochi-eggs-v2";
type State = { found: Partial<Record<EggId, Prize>>; showing: EggId | null };
let state: State | undefined;
const listeners = new Set<() => void>();
const server: State = { found: {}, showing: null };

function read(): State {
  if (!state) {
    let found = {};
    try {
      found = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    } catch {}
    state = { found, showing: null };
  }
  return state;
}

function write(next: State) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next.found));
  } catch {
    // not persisted; still shown for this visit
  }
  listeners.forEach((fn) => fn());
}

export const eggStore = {
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => void listeners.delete(fn);
  },
  get: read,
  server: () => server,
  reveal(id: EggId, prize: Prize) {
    const s = read();
    write({ found: { ...s.found, [id]: prize }, showing: id });
  },
  close() {
    write({ ...read(), showing: null });
  },
};

export async function attempt(id: EggId, answer: string) {
  const prize = await crack(id, answer);
  if (prize) eggStore.reveal(id, prize);
  return !!prize;
}