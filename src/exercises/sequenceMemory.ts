export const TILE_COUNT = 9;
export const START_LENGTH = 1;

// Timings for playing the sequence back to the user.
export const LIT_MS = 420;
export const GAP_MS = 180;

export function extendSequence(
  sequence: readonly number[],
  rng: () => number = Math.random,
): number[] {
  return [...sequence, Math.floor(rng() * TILE_COUNT)];
}

export function newSequence(length: number, rng: () => number = Math.random): number[] {
  let seq: number[] = [];
  for (let i = 0; i < length; i++) {
    seq = extendSequence(seq, rng);
  }
  return seq;
}
