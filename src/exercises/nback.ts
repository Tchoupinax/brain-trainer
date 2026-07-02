export const NBACK_N = 2;
export const SEQUENCE_LENGTH = 30;
export const STEP_MS = 2000;
export const MATCH_RATE = 0.3;

const LETTERS = ["B", "C", "D", "F", "G", "H", "K", "L", "M", "N", "P", "R", "S", "T"];

export function generateNBackSequence(
  length: number = SEQUENCE_LENGTH,
  n: number = NBACK_N,
  matchRate: number = MATCH_RATE,
  rng: () => number = Math.random,
): string[] {
  const seq: string[] = [];
  for (let i = 0; i < length; i++) {
    if (i >= n && rng() < matchRate) {
      seq.push(seq[i - n]!);
    } else {
      const forbidden = i >= n ? seq[i - n] : null;
      const pool = LETTERS.filter((l) => l !== forbidden);
      seq.push(pool[Math.floor(rng() * pool.length)]!);
    }
  }
  return seq;
}

export interface NBackResult {
  hits: number;
  misses: number;
  falseAlarms: number;
  matches: number;
}

export function scoreNBack(
  seq: readonly string[],
  responses: ReadonlySet<number>,
  n: number = NBACK_N,
): NBackResult {
  let hits = 0;
  let misses = 0;
  let falseAlarms = 0;
  let matches = 0;
  for (let i = 0; i < seq.length; i++) {
    const isMatch = i >= n && seq[i] === seq[i - n];
    const responded = responses.has(i);
    if (isMatch) {
      matches += 1;
      if (responded) hits += 1;
      else misses += 1;
    } else if (responded) {
      falseAlarms += 1;
    }
  }
  return { hits, misses, falseAlarms, matches };
}
