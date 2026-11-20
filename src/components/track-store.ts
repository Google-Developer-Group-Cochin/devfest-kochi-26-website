"use client";

import { useSyncExternalStore } from "react";
import type { TrackId } from "@/content/site";

let current: TrackId | null = null;
const listeners = new Set<() => void>();

export function setTrack(next: TrackId | null) {
  if (next === current) return;
  const apply = () => {
    current = next;
    if (next) document.documentElement.dataset.track = next;
    else delete document.documentElement.dataset.track;
    listeners.forEach((l) => l());
  };
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (doc.startViewTransition) doc.startViewTransition(apply);
  else apply();
}

export function useTrack() {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => current,
    () => null,
  );
}
