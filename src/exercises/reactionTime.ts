export const MIN_DELAY_MS = 1500;
export const MAX_DELAY_MS = 4000;

export function randomDelayMs(rng: () => number = Math.random): number {
  return Math.round(MIN_DELAY_MS + rng() * (MAX_DELAY_MS - MIN_DELAY_MS));
}

export function averageMs(times: readonly number[]): number {
  if (times.length === 0) return 0;
  return Math.round(times.reduce((a, b) => a + b, 0) / times.length);
}
