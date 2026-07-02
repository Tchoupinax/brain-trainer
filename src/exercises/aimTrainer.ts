export const TARGET_COUNT = 20;
export const TARGET_SIZE_PX = 52;

export interface TargetPosition {
  xPct: number;
  yPct: number;
}

// Percent-based position inside the play area, with margins so the
// target never overflows the edges.
export function randomPosition(rng: () => number = Math.random): TargetPosition {
  return {
    xPct: 8 + rng() * 84,
    yPct: 10 + rng() * 80,
  };
}
