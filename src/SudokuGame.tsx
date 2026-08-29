import { useCallback, useEffect, useRef, useState } from "react";
import {
  CELL_COUNT,
  difficultyLabel,
  formatElapsed,
  generatePuzzle,
  givensFromPuzzle,
  gridMatches,
  hasConflict,
  isGridComplete,
  SIZE,
  SUDOKU_DIFFICULTIES,
  type SudokuDifficulty,
  type SudokuGrid,
} from "./exercises/sudoku";

type SudokuPhase = "ready" | "playing" | "won";

function isSudokuHighlighted(index: number, selected: number): boolean {
  const sr = Math.floor(selected / SIZE);
  const sc = selected % SIZE;
  const r = Math.floor(index / SIZE);
  const c = index % SIZE;
  return (
    r === sr ||
    c === sc ||
    (Math.floor(r / 3) === Math.floor(sr / 3) && Math.floor(c / 3) === Math.floor(sc / 3))
  );
}

export function SudokuGame({ onBack }: { onBack: () => void }) {
  const [phase, setPhase] = useState<SudokuPhase>("ready");
  const [difficulty, setDifficulty] = useState<SudokuDifficulty>("medium");
  const [solution, setSolution] = useState<SudokuGrid>(() => Array(CELL_COUNT).fill(0));
  const [userGrid, setUserGrid] = useState<SudokuGrid>(() => Array(CELL_COUNT).fill(0));
  const [givens, setGivens] = useState<ReadonlySet<number>>(() => new Set());
  const [selected, setSelected] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [bestMs, setBestMs] = useState<Record<SudokuDifficulty, number | null>>({
    easy: null,
    medium: null,
    hard: null,
  });
  const startRef = useRef(0);

  const startGame = useCallback((diff: SudokuDifficulty) => {
    const { puzzle, solution: sol } = generatePuzzle(diff);
    setDifficulty(diff);
    setSolution(sol);
    setUserGrid(puzzle.slice());
    setGivens(givensFromPuzzle(puzzle));
    setSelected(null);
    startRef.current = performance.now();
    setElapsedMs(0);
    setPhase("playing");
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    const id = window.setInterval(() => setElapsedMs(performance.now() - startRef.current), 200);
    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "playing" || !isGridComplete(userGrid)) return;
    if (gridMatches(userGrid, solution)) {
      const final = performance.now() - startRef.current;
      setElapsedMs(final);
      setBestMs((b) => ({
        ...b,
        [difficulty]: b[difficulty] === null ? final : Math.min(b[difficulty]!, final),
      }));
      setPhase("won");
    }
  }, [phase, userGrid, solution, difficulty]);

  const setCellValue = useCallback(
    (index: number, value: number) => {
      if (givens.has(index)) return;
      setUserGrid((grid) => {
        const next = grid.slice();
        next[index] = value;
        return next;
      });
      if (value !== 0) setSelected(index);
    },
    [givens],
  );

  const moveSelection = useCallback((deltaRow: number, deltaCol: number) => {
    setSelected((sel) => {
      const i = sel ?? 0;
      const row = Math.floor(i / SIZE);
      const col = i % SIZE;
      const nr = Math.max(0, Math.min(SIZE - 1, row + deltaRow));
      const nc = Math.max(0, Math.min(SIZE - 1, col + deltaCol));
      return nr * SIZE + nc;
    });
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      const digit = Number.parseInt(e.key, 10);
      if (digit >= 1 && digit <= 9 && selected !== null && !givens.has(selected)) {
        e.preventDefault();
        setCellValue(selected, digit);
        return;
      }
      if ((e.key === "Backspace" || e.key === "Delete" || e.key === "0") && selected !== null) {
        e.preventDefault();
        setCellValue(selected, 0);
        return;
      }
      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          moveSelection(-1, 0);
          break;
        case "ArrowDown":
          e.preventDefault();
          moveSelection(1, 0);
          break;
        case "ArrowLeft":
          e.preventDefault();
          moveSelection(0, -1);
          break;
        case "ArrowRight":
          e.preventDefault();
          moveSelection(0, 1);
          break;
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [phase, selected, givens, setCellValue, moveSelection]);

  const best = bestMs[difficulty];

  return (
    <div className="mental-math">
      <div className="mental-math-toolbar">
        <button type="button" className="btn btn--ghost" onClick={onBack}>
          ← Home
        </button>
        <div className="mental-math-stats" aria-live="polite">
          {phase !== "ready" && (
            <span className="mental-math-stat">
              Time <strong>{formatElapsed(elapsedMs)}</strong>
              {best !== null && (
                <>
                  {" "}
                  / Best <strong>{formatElapsed(best)}</strong>
                </>
              )}
            </span>
          )}
        </div>
      </div>

      <div className="chart-card mental-math-card sudoku-card">
        <h2 className="mental-math-heading">Sudoku</h2>
        <p className="section-desc mental-math-hint">
          Each row, column, and 3×3 box must contain 1–9 without repeats. Click a cell, type a
          digit, or use the number pad.
        </p>

        <div className="op-toggles" role="group" aria-label="Difficulty">
          {SUDOKU_DIFFICULTIES.map((d) => (
            <button
              key={d}
              type="button"
              className={`op-toggle ${difficulty === d ? "op-toggle--on" : ""}`}
              onClick={() => setDifficulty(d)}
              disabled={phase === "playing"}
              aria-pressed={difficulty === d}
            >
              {difficultyLabel(d)}
            </button>
          ))}
        </div>

        {phase === "ready" && (
          <div className="memory-start">
            <button type="button" className="btn btn--primary" onClick={() => startGame(difficulty)}>
              New puzzle
            </button>
          </div>
        )}

        {phase === "playing" && (
          <>
            <div className="sudoku-grid" role="grid" aria-label="Sudoku board">
              {userGrid.map((value, i) => {
                const row = Math.floor(i / SIZE);
                const col = i % SIZE;
                const given = givens.has(i);
                const conflict = !given && hasConflict(userGrid, i);
                const isSelected = selected === i;
                const highlighted = selected !== null && isSudokuHighlighted(i, selected);
                return (
                  <button
                    key={i}
                    type="button"
                    role="gridcell"
                    className={`sudoku-cell ${given ? "sudoku-cell--given" : ""} ${
                      isSelected ? "sudoku-cell--selected" : ""
                    } ${highlighted && !isSelected ? "sudoku-cell--highlight" : ""} ${
                      conflict ? "sudoku-cell--conflict" : ""
                    } ${col === 2 || col === 5 ? "sudoku-cell--box-right" : ""} ${
                      row === 2 || row === 5 ? "sudoku-cell--box-bottom" : ""
                    }`}
                    onClick={() => setSelected(i)}
                    aria-label={
                      given
                        ? `Given ${value}, row ${row + 1} column ${col + 1}`
                        : value > 0
                          ? `${value}, row ${row + 1} column ${col + 1}`
                          : `Empty, row ${row + 1} column ${col + 1}`
                    }
                    aria-selected={isSelected}
                  >
                    {value > 0 ? value : ""}
                  </button>
                );
              })}
            </div>

            <div className="sudoku-pad" role="group" aria-label="Number pad">
              {Array.from({ length: 9 }, (_, n) => n + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  className="sudoku-pad-btn"
                  onClick={() => selected !== null && setCellValue(selected, n)}
                  disabled={selected === null || givens.has(selected)}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                className="sudoku-pad-btn sudoku-pad-btn--clear"
                onClick={() => selected !== null && setCellValue(selected, 0)}
                disabled={selected === null || givens.has(selected)}
                aria-label="Clear cell"
              >
                ⌫
              </button>
            </div>

            <div className="answer-row sudoku-actions">
              <button type="button" className="btn btn--primary" onClick={() => startGame(difficulty)}>
                New puzzle
              </button>
            </div>
          </>
        )}

        {phase === "won" && (
          <>
            <p className="feedback feedback--ok" role="status">
              Puzzle solved in <strong>{formatElapsed(elapsedMs)}</strong> ({difficultyLabel(difficulty)}).
            </p>
            <div className="answer-row">
              <button type="button" className="btn btn--primary" onClick={() => startGame(difficulty)}>
                New puzzle
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
