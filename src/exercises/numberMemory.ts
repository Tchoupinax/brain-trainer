export const START_LENGTH = 3;
export const MIN_LENGTH = 3;
export const MAX_LENGTH = 20;

export function generateSequence(length: number, rng: () => number = Math.random): string {
  if (length < 1) {
    throw new Error("Length must be at least 1");
  }
  let digits = String(Math.floor(rng() * 9) + 1);
  for (let i = 1; i < length; i++) {
    digits += String(Math.floor(rng() * 10));
  }
  return digits;
}

// Time the number stays visible: base plus a little per extra digit.
export function displayDurationMs(length: number): number {
  return 1200 + length * 550;
}
