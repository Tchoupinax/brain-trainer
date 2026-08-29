export const SIZE = 9;
export const CELL_COUNT = SIZE * SIZE;

export type SudokuGrid = number[];

export type SudokuDifficulty = "easy" | "medium" | "hard";

export const SUDOKU_DIFFICULTIES: readonly SudokuDifficulty[] = ["easy", "medium", "hard"];

/** Minimum givens left in the puzzle (higher = easier). */
export const DIFFICULTY_CLUES: Record<SudokuDifficulty, number> = {
  easy: 42,
  medium: 32,
  hard: 26,
};

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function isPlacementValid(grid: SudokuGrid, index: number, value: number): boolean {
  if (value < 1 || value > 9) return value === 0;
  const row = Math.floor(index / SIZE);
  const col = index % SIZE;
  for (let c = 0; c < SIZE; c++) {
    if (c !== col && grid[row * SIZE + c] === value) return false;
  }
  for (let r = 0; r < SIZE; r++) {
    if (r !== row && grid[r * SIZE + col] === value) return false;
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      const i = r * SIZE + c;
      if (i !== index && grid[i] === value) return false;
    }
  }
  return true;
}

function solveSudoku(grid: SudokuGrid): boolean {
  for (let i = 0; i < CELL_COUNT; i++) {
    if (grid[i] !== 0) continue;
    for (let n = 1; n <= 9; n++) {
      if (!isPlacementValid(grid, i, n)) continue;
      grid[i] = n;
      if (solveSudoku(grid)) return true;
      grid[i] = 0;
    }
    return false;
  }
  return true;
}

function fillDiagonalBoxes(grid: SudokuGrid, rng: () => number): void {
  for (let box = 0; box < SIZE; box += 3) {
    const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], rng);
    let k = 0;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        grid[(box + r) * SIZE + box + c] = nums[k++]!;
      }
    }
  }
}

function generateSolution(rng: () => number): SudokuGrid {
  const grid: SudokuGrid = Array(CELL_COUNT).fill(0);
  fillDiagonalBoxes(grid, rng);
  solveSudoku(grid);
  return grid;
}

function countSolutions(grid: SudokuGrid, limit = 2): number {
  let count = 0;
  const work = grid.slice();

  function dfs(): void {
    if (count >= limit) return;
    let empty = -1;
    for (let i = 0; i < CELL_COUNT; i++) {
      if (work[i] === 0) {
        empty = i;
        break;
      }
    }
    if (empty === -1) {
      count++;
      return;
    }
    for (let n = 1; n <= 9; n++) {
      if (!isPlacementValid(work, empty, n)) continue;
      work[empty] = n;
      dfs();
      work[empty] = 0;
    }
  }

  dfs();
  return count;
}

export function generatePuzzle(
  difficulty: SudokuDifficulty,
  rng: () => number = Math.random,
): { puzzle: SudokuGrid; solution: SudokuGrid } {
  const solution = generateSolution(rng);
  const puzzle = solution.slice();
  const clueTarget = DIFFICULTY_CLUES[difficulty];
  const positions = shuffle(Array.from({ length: CELL_COUNT }, (_, i) => i), rng);

  let clues = CELL_COUNT;
  for (const index of positions) {
    if (clues <= clueTarget) break;
    puzzle[index] = 0;
    if (countSolutions(puzzle) === 1) {
      clues--;
    } else {
      puzzle[index] = solution[index]!;
    }
  }

  return { puzzle, solution };
}

export function isGridComplete(grid: SudokuGrid): boolean {
  return grid.every((n) => n >= 1 && n <= 9);
}

export function gridMatches(grid: SudokuGrid, solution: SudokuGrid): boolean {
  for (let i = 0; i < CELL_COUNT; i++) {
    if (grid[i] !== solution[i]) return false;
  }
  return true;
}

export function hasConflict(grid: SudokuGrid, index: number): boolean {
  const value = grid[index];
  if (value === 0) return false;
  return !isPlacementValid(grid, index, value);
}

export function difficultyLabel(d: SudokuDifficulty): string {
  switch (d) {
    case "easy":
      return "Easy";
    case "medium":
      return "Medium";
    case "hard":
      return "Hard";
  }
}

export function formatElapsed(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  if (m > 0) return `${m}:${sec.toString().padStart(2, "0")}`;
  return `${sec}s`;
}

export function givensFromPuzzle(puzzle: SudokuGrid): ReadonlySet<number> {
  const givens = new Set<number>();
  for (let i = 0; i < CELL_COUNT; i++) {
    if (puzzle[i] !== 0) givens.add(i);
  }
  return givens;
}
