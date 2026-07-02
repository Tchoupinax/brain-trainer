export const GRID_COLUMNS = 5;
export const GRID_ROWS = 5;
export const CELL_COUNT = GRID_COLUMNS * GRID_ROWS;
export const START_COUNT = 4;
export const MAX_COUNT = CELL_COUNT;

// Returns the cell index for each number: result[i] is where number i+1 lives.
export function placeNumbers(count: number, rng: () => number = Math.random): number[] {
  if (count < 1 || count > CELL_COUNT) {
    throw new Error(`Count must be between 1 and ${CELL_COUNT}`);
  }
  const cells = Array.from({ length: CELL_COUNT }, (_, i) => i);
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [cells[i], cells[j]] = [cells[j]!, cells[i]!];
  }
  return cells.slice(0, count);
}
