export const SCHULTE_SIDE = 5;
export const SCHULTE_COUNT = SCHULTE_SIDE * SCHULTE_SIDE;

export function shuffledNumbers(rng: () => number = Math.random): number[] {
  const numbers = Array.from({ length: SCHULTE_COUNT }, (_, i) => i + 1);
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j]!, numbers[i]!];
  }
  return numbers;
}

export function formatSeconds(ms: number): string {
  return (ms / 1000).toFixed(1) + "s";
}
