export const START_TILES = 3;
export const MAX_TILES = 20;
export const FLASH_MS = 1300;

export function gridSideForCount(count: number): number {
  if (count <= 4) return 3;
  if (count <= 7) return 4;
  if (count <= 11) return 5;
  if (count <= 16) return 6;
  return 7;
}

export function pickTiles(
  count: number,
  cellCount: number,
  rng: () => number = Math.random,
): number[] {
  if (count > cellCount) {
    throw new Error("Cannot pick more tiles than cells");
  }
  const cells = Array.from({ length: cellCount }, (_, i) => i);
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [cells[i], cells[j]] = [cells[j]!, cells[i]!];
  }
  return cells.slice(0, count);
}
