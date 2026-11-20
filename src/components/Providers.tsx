"use client";

import { ReactLenis } from "lenis/react";
import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="never">
      <ReactLenis root options={{ anchors: { offset: -88 }, lerp: 0.12, autoRaf: true }}>
        {children}
      </ReactLenis>
    </MotionConfig>
  );
}
