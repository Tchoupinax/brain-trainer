import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  generateProblem,
  operationLabel,
  operationSymbol,
  type Operation,
  OPERATIONS,
  type Problem,
} from "./exercises/mentalMath";
import {
  displayDurationMs,
  generateSequence,
  MAX_LENGTH,
  START_LENGTH,
} from "./exercises/numberMemory";
import {
  extendSequence,
  GAP_MS,
  LIT_MS,
  newSequence,
  START_LENGTH as SEQUENCE_START_LENGTH,
  TILE_COUNT,
} from "./exercises/sequenceMemory";
import { averageMs, randomDelayMs } from "./exercises/reactionTime";
import {
  CELL_COUNT,
  GRID_COLUMNS,
  MAX_COUNT as CHIMP_MAX_COUNT,
  placeNumbers,
  START_COUNT as CHIMP_START_COUNT,
} from "./exercises/chimpTest";
import { nextWord, type WordPick } from "./exercises/wordMemory";
import {
  FLASH_MS,
  gridSideForCount,
  MAX_TILES,
  pickTiles,
  START_TILES,
} from "./exercises/visualMemory";
import { formatSeconds, SCHULTE_COUNT, SCHULTE_SIDE, shuffledNumbers } from "./exercises/schulte";
import { nextStroop, STROOP_COLORS, type StroopPrompt } from "./exercises/stroop";
import {
  randomPosition,
  TARGET_COUNT,
  TARGET_SIZE_PX,
  type TargetPosition,
} from "./exercises/aimTrainer";
import {
  generateNBackSequence,
  NBACK_N,
  scoreNBack,
  SEQUENCE_LENGTH as NBACK_LENGTH,
  STEP_MS as NBACK_STEP_MS,
} from "./exercises/nback";
import { getPreferredTheme, THEME_STORAGE_KEY, type ThemeMode } from "./theme";
import "./App.css";

type Screen =
  | "home"
  | "mental-math"
  | "number-memory"
  | "sequence-memory"
  | "reaction-time"
  | "chimp-test"
  | "word-memory"
  | "visual-memory"
  | "schulte-table"
  | "stroop-test"
  | "aim-trainer"
  | "n-back";

const DEFAULT_OPS: ReadonlySet<Operation> = new Set(OPERATIONS);

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>(() => getPreferredTheme());
  const [screen, setScreen] = useState<Screen>("home");

  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-row">
          <div className="hero-text">
            <h1>Brain Trainer</h1>
          </div>
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            title={theme === "dark" ? "Light theme" : "Dark theme"}
          >
            <span className="theme-toggle-icon" aria-hidden>
              {theme === "dark" ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </span>
            <span className="theme-toggle-label">{theme === "dark" ? "Light" : "Dark"}</span>
          </button>
        </div>
        {screen === "home" && (
          <p className="hero-description">
            Short sessions to sharpen memory, speed, and focus. Pick an exercise to begin.
          </p>
        )}
      </header>

      {screen === "home" && <Home onChoose={setScreen} />}
      {screen === "mental-math" && <MentalMath onBack={() => setScreen("home")} />}
      {screen === "number-memory" && <NumberMemory onBack={() => setScreen("home")} />}
      {screen === "sequence-memory" && <SequenceMemory onBack={() => setScreen("home")} />}
      {screen === "reaction-time" && <ReactionTime onBack={() => setScreen("home")} />}
      {screen === "chimp-test" && <ChimpTest onBack={() => setScreen("home")} />}
      {screen === "word-memory" && <WordMemory onBack={() => setScreen("home")} />}
      {screen === "visual-memory" && <VisualMemory onBack={() => setScreen("home")} />}
      {screen === "schulte-table" && <SchulteTable onBack={() => setScreen("home")} />}
      {screen === "stroop-test" && <StroopTest onBack={() => setScreen("home")} />}
      {screen === "aim-trainer" && <AimTrainer onBack={() => setScreen("home")} />}
      {screen === "n-back" && <NBack onBack={() => setScreen("home")} />}
    </div>
  );
}

function Home({ onChoose }: { onChoose: (screen: Screen) => void }) {
  return (
    <section className="exercise-grid" aria-label="Exercises">
      <button
        type="button"
        className="exercise-card exercise-card--active"
        onClick={() => onChoose("mental-math")}
      >
        <span className="exercise-card-icon" aria-hidden>
          ∑
        </span>
        <span className="exercise-card-title">Mental math</span>
        <span className="exercise-card-desc">Addition, subtraction, multiplication, and division.</span>
      </button>
      <button
        type="button"
        className="exercise-card exercise-card--active"
        onClick={() => onChoose("number-memory")}
      >
        <span className="exercise-card-icon" aria-hidden>
          123
        </span>
        <span className="exercise-card-title">Number memory</span>
        <span className="exercise-card-desc">
          Memorize a number, then type it back. One more digit each round.
        </span>
      </button>
      <button
        type="button"
        className="exercise-card exercise-card--active"
        onClick={() => onChoose("sequence-memory")}
      >
        <span className="exercise-card-icon" aria-hidden>
          #
        </span>
        <span className="exercise-card-title">Sequence memory</span>
        <span className="exercise-card-desc">
          Watch tiles light up, then repeat the pattern. It grows every round.
        </span>
      </button>
      <button
        type="button"
        className="exercise-card exercise-card--active"
        onClick={() => onChoose("reaction-time")}
      >
        <span className="exercise-card-icon" aria-hidden>
          !
        </span>
        <span className="exercise-card-title">Reaction time</span>
        <span className="exercise-card-desc">
          Wait for green, then click as fast as you can.
        </span>
      </button>
      <button
        type="button"
        className="exercise-card exercise-card--active"
        onClick={() => onChoose("chimp-test")}
      >
        <span className="exercise-card-icon" aria-hidden>
          1?
        </span>
        <span className="exercise-card-title">Chimp test</span>
        <span className="exercise-card-desc">
          Numbers hide after your first click. Tap them in order from memory.
        </span>
      </button>
      <button
        type="button"
        className="exercise-card exercise-card--active"
        onClick={() => onChoose("word-memory")}
      >
        <span className="exercise-card-icon" aria-hidden>
          Aa
        </span>
        <span className="exercise-card-title">Word memory</span>
        <span className="exercise-card-desc">
          Words go by one at a time. Have you seen this one before?
        </span>
      </button>
      <button
        type="button"
        className="exercise-card exercise-card--active"
        onClick={() => onChoose("visual-memory")}
      >
        <span className="exercise-card-icon" aria-hidden>
          ::
        </span>
        <span className="exercise-card-title">Visual memory</span>
        <span className="exercise-card-desc">
          Tiles flash on a grid. Find them all once they disappear.
        </span>
      </button>
      <button
        type="button"
        className="exercise-card exercise-card--active"
        onClick={() => onChoose("schulte-table")}
      >
        <span className="exercise-card-icon" aria-hidden>
          25
        </span>
        <span className="exercise-card-title">Schulte table</span>
        <span className="exercise-card-desc">
          Find 1 through 25 in order as fast as you can.
        </span>
      </button>
      <button
        type="button"
        className="exercise-card exercise-card--active"
        onClick={() => onChoose("stroop-test")}
      >
        <span className="exercise-card-icon" aria-hidden>
          Cc
        </span>
        <span className="exercise-card-title">Stroop test</span>
        <span className="exercise-card-desc">
          Name the ink color, not the word. Harder than it sounds.
        </span>
      </button>
      <button
        type="button"
        className="exercise-card exercise-card--active"
        onClick={() => onChoose("aim-trainer")}
      >
        <span className="exercise-card-icon" aria-hidden>
          +
        </span>
        <span className="exercise-card-title">Aim trainer</span>
        <span className="exercise-card-desc">
          Click {TARGET_COUNT} targets as fast as you can.
        </span>
      </button>
      <button
        type="button"
        className="exercise-card exercise-card--active"
        onClick={() => onChoose("n-back")}
      >
        <span className="exercise-card-icon" aria-hidden>
          2b
        </span>
        <span className="exercise-card-title">2-back</span>
        <span className="exercise-card-desc">
          Press match when a letter repeats from two steps earlier.
        </span>
      </button>
      <div className="exercise-card exercise-card--soon" aria-disabled>
        <span className="exercise-card-badge">Soon</span>
        <span className="exercise-card-title">More exercises</span>
        <span className="exercise-card-desc">Additional brain games will appear here.</span>
      </div>
    </section>
  );
}

function MentalMath({ onBack }: { onBack: () => void }) {
  const [enabledOps, setEnabledOps] = useState<ReadonlySet<Operation>>(DEFAULT_OPS);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<"idle" | "correct" | "wrong">("idle");
  const [correctCount, setCorrectCount] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeOps = useMemo(() => OPERATIONS.filter((o) => enabledOps.has(o)), [enabledOps]);

  const nextProblem = useCallback(() => {
    if (activeOps.length === 0) return;
    setProblem(generateProblem(activeOps));
    setInput("");
    setFeedback("idle");
  }, [activeOps]);

  useEffect(() => {
    if (feedback !== "correct" && feedback !== "wrong") return;
    const delay = feedback === "correct" ? 55 : 380;
    const id = window.setTimeout(() => nextProblem(), delay);
    return () => window.clearTimeout(id);
  }, [feedback, nextProblem]);

  useEffect(() => {
    if (feedback !== "correct" && feedback !== "wrong") return;
    const onDocKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        nextProblem();
      }
    };
    document.addEventListener("keydown", onDocKeyDown);
    return () => document.removeEventListener("keydown", onDocKeyDown);
  }, [feedback, nextProblem]);

  useEffect(() => {
    if (activeOps.length === 0) {
      setProblem(null);
      return;
    }
    if (!problem) {
      setProblem(generateProblem(activeOps));
      setInput("");
      setFeedback("idle");
    }
  }, [activeOps, problem]);

  useEffect(() => {
    if (problem && feedback === "idle") {
      inputRef.current?.focus();
    }
  }, [problem, feedback]);

  const toggleOp = (op: Operation) => {
    setEnabledOps((prev) => {
      const next = new Set(prev);
      if (next.has(op)) {
        if (next.size <= 1) return prev;
        next.delete(op);
      } else {
        next.add(op);
      }
      return next;
    });
    setProblem(null);
    setInput("");
    setFeedback("idle");
  };

  const submit = () => {
    if (!problem || feedback !== "idle") return;
    const trimmed = input.trim();
    if (trimmed === "") return;
    const n = Number.parseInt(trimmed, 10);
    if (!Number.isFinite(n)) return;

    setAttemptCount((c) => c + 1);
    if (n === problem.answer) {
      setFeedback("correct");
      setCorrectCount((c) => c + 1);
    } else {
      setFeedback("wrong");
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    e.stopPropagation();
    if (feedback === "idle") submit();
  };

  return (
    <div className="mental-math">
      <div className="mental-math-toolbar">
        <button type="button" className="btn btn--ghost" onClick={onBack}>
          ← Home
        </button>
        <div className="mental-math-stats" aria-live="polite">
          <span className="mental-math-stat">
            Score <strong>{correctCount}</strong> / {attemptCount}
          </span>
        </div>
      </div>

      <div className="chart-card mental-math-card">
        <h2 className="mental-math-heading">Operations</h2>
        <p className="section-desc mental-math-hint">Turn operations on or off. At least one must stay on.</p>
        <div className="op-toggles" role="group" aria-label="Enabled operations">
          {OPERATIONS.map((op) => {
            const on = enabledOps.has(op);
            return (
              <button
                key={op}
                type="button"
                className={`op-toggle ${on ? "op-toggle--on" : ""}`}
                onClick={() => toggleOp(op)}
                aria-pressed={on}
              >
                {operationLabel(op)}
              </button>
            );
          })}
        </div>

        {activeOps.length === 0 && (
          <p className="error mental-math-error" role="alert">
            Enable at least one operation.
          </p>
        )}

        {problem && activeOps.length > 0 && (
          <>
            <div className="problem-display" aria-live="polite">
              <span className="problem-numbers">
                {problem.left}{" "}
                <span className="problem-op">{operationSymbol(problem.op)}</span> {problem.right}
                <span className="problem-eq"> = </span>
              </span>
            </div>

            <div className="answer-row">
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                pattern="-?[0-9]*"
                className="answer-input"
                value={input}
                onChange={(e) => setInput(e.target.value.replace(/[^\d-]/g, ""))}
                onKeyDown={onKeyDown}
                disabled={feedback !== "idle"}
                aria-label="Your answer"
                autoComplete="off"
                autoCorrect="off"
              />
              {feedback === "idle" && (
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={submit}
                  disabled={input.trim() === ""}
                >
                  Check
                </button>
              )}
            </div>

            {feedback === "correct" && (
              <p className="feedback feedback--ok" role="status">
                Correct.
              </p>
            )}
            {feedback === "wrong" && (
              <p className="feedback feedback--bad" role="alert">
                Not quite — <strong>{problem.answer}</strong>. Press Enter to skip ahead.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

type MemoryPhase = "ready" | "showing" | "recall" | "correct" | "wrong";

function NumberMemory({ onBack }: { onBack: () => void }) {
  const [phase, setPhase] = useState<MemoryPhase>("ready");
  const [length, setLength] = useState(START_LENGTH);
  const [sequence, setSequence] = useState("");
  const [input, setInput] = useState("");
  const [bestLength, setBestLength] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const startRound = useCallback((len: number) => {
    setLength(len);
    setSequence(generateSequence(len));
    setInput("");
    setPhase("showing");
  }, []);

  useEffect(() => {
    if (phase !== "showing") return;
    const id = window.setTimeout(() => setPhase("recall"), displayDurationMs(length));
    return () => window.clearTimeout(id);
  }, [phase, length]);

  useEffect(() => {
    if (phase === "recall") {
      inputRef.current?.focus();
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== "correct" && phase !== "wrong") return;
    const onDocKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        startRound(phase === "correct" ? Math.min(length + 1, MAX_LENGTH) : START_LENGTH);
      }
    };
    document.addEventListener("keydown", onDocKeyDown);
    return () => document.removeEventListener("keydown", onDocKeyDown);
  }, [phase, length, startRound]);

  const submit = () => {
    if (phase !== "recall" || input.trim() === "") return;
    if (input.trim() === sequence) {
      setBestLength((b) => Math.max(b, length));
      setPhase("correct");
    } else {
      setPhase("wrong");
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    e.stopPropagation();
    if (phase === "recall") submit();
  };

  return (
    <div className="mental-math">
      <div className="mental-math-toolbar">
        <button type="button" className="btn btn--ghost" onClick={onBack}>
          ← Home
        </button>
        <div className="mental-math-stats" aria-live="polite">
          <span className="mental-math-stat">
            Level <strong>{length}</strong>
            {bestLength > 0 && (
              <>
                {" "}
                / Best <strong>{bestLength}</strong>
              </>
            )}
          </span>
        </div>
      </div>

      <div className="chart-card mental-math-card">
        <h2 className="mental-math-heading">Number memory</h2>
        <p className="section-desc mental-math-hint">
          A number appears for a few seconds. Memorize it, then type it back. Each success adds a
          digit.
        </p>

        {phase === "ready" && (
          <div className="memory-start">
            <button type="button" className="btn btn--primary" onClick={() => startRound(START_LENGTH)}>
              Start
            </button>
          </div>
        )}

        {phase === "showing" && (
          <div className="problem-display" aria-live="polite">
            <span className="problem-numbers">{sequence}</span>
            <span
              key={sequence}
              className="memory-timer"
              style={{ animationDuration: `${displayDurationMs(length)}ms` }}
              aria-hidden
            />
          </div>
        )}

        {phase === "recall" && (
          <>
            <div className="problem-display">
              <span className="problem-numbers problem-eq">What was the number?</span>
            </div>
            <div className="answer-row">
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className="answer-input"
                value={input}
                onChange={(e) => setInput(e.target.value.replace(/\D/g, ""))}
                onKeyDown={onKeyDown}
                aria-label="The number you memorized"
                autoComplete="off"
                autoCorrect="off"
              />
              <button
                type="button"
                className="btn btn--primary"
                onClick={submit}
                disabled={input.trim() === ""}
              >
                Check
              </button>
            </div>
          </>
        )}

        {phase === "correct" && (
          <>
            <p className="feedback feedback--ok" role="status">
              Correct. Next round: <strong>{Math.min(length + 1, MAX_LENGTH)}</strong> digits.
            </p>
            <div className="answer-row">
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => startRound(Math.min(length + 1, MAX_LENGTH))}
              >
                Continue
              </button>
            </div>
          </>
        )}

        {phase === "wrong" && (
          <>
            <p className="feedback feedback--bad" role="alert">
              The number was <strong>{sequence}</strong>, you typed{" "}
              <strong>{input.trim() || "nothing"}</strong>. You reached{" "}
              <strong>{length}</strong> digits.
            </p>
            <div className="answer-row">
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => startRound(START_LENGTH)}
              >
                Try again
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

type SequencePhase = "ready" | "showing" | "repeat" | "correct" | "wrong";

function SequenceMemory({ onBack }: { onBack: () => void }) {
  const [phase, setPhase] = useState<SequencePhase>("ready");
  const [sequence, setSequence] = useState<number[]>([]);
  const [litTile, setLitTile] = useState<number | null>(null);
  const [pressedTile, setPressedTile] = useState<number | null>(null);
  const [repeatPos, setRepeatPos] = useState(0);
  const [bestLevel, setBestLevel] = useState(0);

  const level = sequence.length;

  const startRound = useCallback((seq: number[]) => {
    setSequence(seq);
    setRepeatPos(0);
    setLitTile(null);
    setPressedTile(null);
    setPhase("showing");
  }, []);

  useEffect(() => {
    if (phase !== "showing") return;
    let step = 0;
    const timers: number[] = [];
    const playStep = () => {
      if (step >= sequence.length) {
        setLitTile(null);
        setPhase("repeat");
        return;
      }
      setLitTile(sequence[step]!);
      timers.push(
        window.setTimeout(() => {
          setLitTile(null);
          step += 1;
          timers.push(window.setTimeout(playStep, GAP_MS));
        }, LIT_MS),
      );
    };
    timers.push(window.setTimeout(playStep, 500));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [phase, sequence]);

  useEffect(() => {
    if (phase !== "correct") return;
    const id = window.setTimeout(() => startRound(extendSequence(sequence)), 750);
    return () => window.clearTimeout(id);
  }, [phase, sequence, startRound]);

  useEffect(() => {
    if (phase !== "wrong") return;
    const onDocKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        startRound(newSequence(SEQUENCE_START_LENGTH));
      }
    };
    document.addEventListener("keydown", onDocKeyDown);
    return () => document.removeEventListener("keydown", onDocKeyDown);
  }, [phase, startRound]);

  useEffect(() => {
    if (pressedTile === null) return;
    const id = window.setTimeout(() => setPressedTile(null), 200);
    return () => window.clearTimeout(id);
  }, [pressedTile]);

  const pressTile = (tile: number) => {
    if (phase !== "repeat") return;
    setPressedTile(tile);
    if (tile !== sequence[repeatPos]) {
      setPhase("wrong");
      return;
    }
    if (repeatPos + 1 === sequence.length) {
      setBestLevel((b) => Math.max(b, sequence.length));
      setPhase("correct");
    } else {
      setRepeatPos(repeatPos + 1);
    }
  };

  return (
    <div className="mental-math">
      <div className="mental-math-toolbar">
        <button type="button" className="btn btn--ghost" onClick={onBack}>
          ← Home
        </button>
        <div className="mental-math-stats" aria-live="polite">
          <span className="mental-math-stat">
            Level <strong>{level > 0 ? level : "-"}</strong>
            {bestLevel > 0 && (
              <>
                {" "}
                / Best <strong>{bestLevel}</strong>
              </>
            )}
          </span>
        </div>
      </div>

      <div className="chart-card mental-math-card">
        <h2 className="mental-math-heading">Sequence memory</h2>
        <p className="section-desc mental-math-hint">
          Watch the tiles light up, then click them in the same order. Each round adds one step.
        </p>

        {phase === "ready" && (
          <div className="memory-start">
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => startRound(newSequence(SEQUENCE_START_LENGTH))}
            >
              Start
            </button>
          </div>
        )}

        {phase !== "ready" && (
          <>
            <div
              className={`sequence-grid ${phase === "repeat" ? "sequence-grid--active" : ""}`}
              role="group"
              aria-label="Sequence tiles"
            >
              {Array.from({ length: TILE_COUNT }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`sequence-tile ${litTile === i ? "sequence-tile--lit" : ""} ${
                    pressedTile === i ? "sequence-tile--pressed" : ""
                  }`}
                  onClick={() => pressTile(i)}
                  disabled={phase !== "repeat"}
                  aria-label={`Tile ${i + 1}`}
                />
              ))}
            </div>

            <p className="sequence-status" aria-live="polite">
              {phase === "showing" && "Watch the pattern..."}
              {phase === "repeat" && `Your turn: ${repeatPos} / ${sequence.length}`}
              {phase === "correct" && "Correct."}
              {phase === "wrong" && "\u00A0"}
            </p>

            {phase === "wrong" && (
              <>
                <p className="feedback feedback--bad" role="alert">
                  Wrong tile. You reached level <strong>{level}</strong>.
                </p>
                <div className="answer-row">
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={() => startRound(newSequence(SEQUENCE_START_LENGTH))}
                  >
                    Try again
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

type ReactionPhase = "ready" | "waiting" | "go" | "result" | "early";

function ReactionTime({ onBack }: { onBack: () => void }) {
  const [phase, setPhase] = useState<ReactionPhase>("ready");
  const [times, setTimes] = useState<number[]>([]);
  const timerRef = useRef(0);
  const goAtRef = useRef(0);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const arm = () => {
    setPhase("waiting");
    timerRef.current = window.setTimeout(() => {
      goAtRef.current = performance.now();
      setPhase("go");
    }, randomDelayMs());
  };

  const onPadClick = () => {
    if (phase === "ready" || phase === "result" || phase === "early") {
      arm();
      return;
    }
    if (phase === "waiting") {
      window.clearTimeout(timerRef.current);
      setPhase("early");
      return;
    }
    // phase === "go"
    const elapsed = Math.round(performance.now() - goAtRef.current);
    setTimes((t) => [...t, elapsed]);
    setPhase("result");
  };

  const last = times[times.length - 1];
  const best = times.length > 0 ? Math.min(...times) : null;

  return (
    <div className="mental-math">
      <div className="mental-math-toolbar">
        <button type="button" className="btn btn--ghost" onClick={onBack}>
          ← Home
        </button>
        <div className="mental-math-stats" aria-live="polite">
          {times.length > 0 && (
            <span className="mental-math-stat">
              Best <strong>{best} ms</strong> / Avg <strong>{averageMs(times)} ms</strong> (
              {times.length})
            </span>
          )}
        </div>
      </div>

      <div className="chart-card mental-math-card">
        <h2 className="mental-math-heading">Reaction time</h2>
        <p className="section-desc mental-math-hint">
          Click the pad, wait for it to turn green, then click again as fast as you can.
        </p>

        <button
          type="button"
          className={`reaction-pad reaction-pad--${phase}`}
          onClick={onPadClick}
        >
          {phase === "ready" && "Click to start"}
          {phase === "waiting" && "Wait for green..."}
          {phase === "go" && "Click!"}
          {phase === "result" && (
            <>
              <span className="reaction-result">{last} ms</span>
              <span className="reaction-sub">Click to go again</span>
            </>
          )}
          {phase === "early" && (
            <>
              <span className="reaction-result">Too soon</span>
              <span className="reaction-sub">Click to retry</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

type ChimpPhase = "ready" | "showing" | "playing" | "correct" | "wrong";

function ChimpTest({ onBack }: { onBack: () => void }) {
  const [phase, setPhase] = useState<ChimpPhase>("ready");
  const [cells, setCells] = useState<number[]>([]);
  const [nextNumber, setNextNumber] = useState(1);
  const [count, setCount] = useState(CHIMP_START_COUNT);
  const [bestCount, setBestCount] = useState(0);

  const startRound = useCallback((n: number) => {
    setCount(n);
    setCells(placeNumbers(n));
    setNextNumber(1);
    setPhase("showing");
  }, []);

  useEffect(() => {
    if (phase !== "correct") return;
    const id = window.setTimeout(
      () => startRound(Math.min(count + 1, CHIMP_MAX_COUNT)),
      750,
    );
    return () => window.clearTimeout(id);
  }, [phase, count, startRound]);

  useEffect(() => {
    if (phase !== "wrong") return;
    const onDocKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        startRound(CHIMP_START_COUNT);
      }
    };
    document.addEventListener("keydown", onDocKeyDown);
    return () => document.removeEventListener("keydown", onDocKeyDown);
  }, [phase, startRound]);

  const pressCell = (cell: number) => {
    if (phase !== "showing" && phase !== "playing") return;
    const numberAt = cells.indexOf(cell) + 1;
    if (numberAt === 0) return;
    if (numberAt !== nextNumber) {
      setPhase("wrong");
      return;
    }
    if (nextNumber === cells.length) {
      setBestCount((b) => Math.max(b, cells.length));
      setPhase("correct");
      return;
    }
    setNextNumber(nextNumber + 1);
    if (phase === "showing") setPhase("playing");
  };

  return (
    <div className="mental-math">
      <div className="mental-math-toolbar">
        <button type="button" className="btn btn--ghost" onClick={onBack}>
          ← Home
        </button>
        <div className="mental-math-stats" aria-live="polite">
          <span className="mental-math-stat">
            Numbers <strong>{count}</strong>
            {bestCount > 0 && (
              <>
                {" "}
                / Best <strong>{bestCount}</strong>
              </>
            )}
          </span>
        </div>
      </div>

      <div className="chart-card mental-math-card">
        <h2 className="mental-math-heading">Chimp test</h2>
        <p className="section-desc mental-math-hint">
          Click the numbers in ascending order. After you click 1, the rest turn blank. Each round
          adds a number.
        </p>

        {phase === "ready" && (
          <div className="memory-start">
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => startRound(CHIMP_START_COUNT)}
            >
              Start
            </button>
          </div>
        )}

        {phase !== "ready" && (
          <>
            <div
              className="chimp-grid"
              style={{ gridTemplateColumns: `repeat(${GRID_COLUMNS}, 1fr)` }}
              role="group"
              aria-label="Number cells"
            >
              {Array.from({ length: CELL_COUNT }, (_, i) => {
                const numberAt = cells.indexOf(i) + 1;
                if (numberAt === 0) {
                  return <span key={i} className="chimp-cell chimp-cell--empty" aria-hidden />;
                }
                const done = numberAt < nextNumber;
                return (
                  <button
                    key={i}
                    type="button"
                    className={`chimp-cell ${done ? "chimp-cell--done" : "chimp-cell--live"}`}
                    onClick={() => pressCell(i)}
                    disabled={done || (phase !== "showing" && phase !== "playing")}
                    aria-label={phase === "showing" ? `Number ${numberAt}` : "Hidden number"}
                  >
                    {phase === "showing" || done ? numberAt : ""}
                  </button>
                );
              })}
            </div>

            <p className="sequence-status" aria-live="polite">
              {phase === "showing" && "Memorize, then click 1."}
              {phase === "playing" && `Next: ${nextNumber} / ${cells.length}`}
              {phase === "correct" && "Correct."}
              {phase === "wrong" && "\u00A0"}
            </p>

            {phase === "wrong" && (
              <>
                <p className="feedback feedback--bad" role="alert">
                  Wrong cell. You reached <strong>{count}</strong> numbers.
                </p>
                <div className="answer-row">
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={() => startRound(CHIMP_START_COUNT)}
                  >
                    Try again
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

type WordPhase = "ready" | "playing" | "wrong";

function WordMemory({ onBack }: { onBack: () => void }) {
  const [phase, setPhase] = useState<WordPhase>("ready");
  const [seen, setSeen] = useState<ReadonlySet<string>>(new Set());
  const [pick, setPick] = useState<WordPick | null>(null);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);

  const start = useCallback(() => {
    const empty = new Set<string>();
    setSeen(empty);
    setScore(0);
    setPick(nextWord(empty, null));
    setPhase("playing");
  }, []);

  useEffect(() => {
    if (phase !== "wrong") return;
    const onDocKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        start();
      }
    };
    document.addEventListener("keydown", onDocKeyDown);
    return () => document.removeEventListener("keydown", onDocKeyDown);
  }, [phase, start]);

  const answer = (guessSeen: boolean) => {
    if (phase !== "playing" || !pick) return;
    if (guessSeen !== pick.isSeen) {
      setBestScore((b) => Math.max(b, score));
      setPhase("wrong");
      return;
    }
    const nextSeen = new Set(seen);
    nextSeen.add(pick.word);
    setSeen(nextSeen);
    setScore(score + 1);
    setPick(nextWord(nextSeen, pick.word));
  };

  return (
    <div className="mental-math">
      <div className="mental-math-toolbar">
        <button type="button" className="btn btn--ghost" onClick={onBack}>
          ← Home
        </button>
        <div className="mental-math-stats" aria-live="polite">
          <span className="mental-math-stat">
            Score <strong>{score}</strong>
            {bestScore > 0 && (
              <>
                {" "}
                / Best <strong>{bestScore}</strong>
              </>
            )}
          </span>
        </div>
      </div>

      <div className="chart-card mental-math-card">
        <h2 className="mental-math-heading">Word memory</h2>
        <p className="section-desc mental-math-hint">
          Words appear one at a time. Say whether each one already appeared in this run.
        </p>

        {phase === "ready" && (
          <div className="memory-start">
            <button type="button" className="btn btn--primary" onClick={start}>
              Start
            </button>
          </div>
        )}

        {phase === "playing" && pick && (
          <>
            <div className="problem-display" aria-live="polite">
              <span className="problem-numbers word-display">{pick.word}</span>
            </div>
            <div className="word-actions">
              <button type="button" className="btn btn--primary" onClick={() => answer(true)}>
                Seen
              </button>
              <button type="button" className="btn btn--primary" onClick={() => answer(false)}>
                New
              </button>
            </div>
          </>
        )}

        {phase === "wrong" && pick && (
          <>
            <p className="feedback feedback--bad" role="alert">
              <strong>{pick.word}</strong> was {pick.isSeen ? "already seen" : "new"}. You scored{" "}
              <strong>{score}</strong>.
            </p>
            <div className="answer-row">
              <button type="button" className="btn btn--primary" onClick={start}>
                Try again
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

type VisualPhase = "ready" | "showing" | "recall" | "correct" | "wrong";

function VisualMemory({ onBack }: { onBack: () => void }) {
  const [phase, setPhase] = useState<VisualPhase>("ready");
  const [count, setCount] = useState(START_TILES);
  const [tiles, setTiles] = useState<ReadonlySet<number>>(new Set());
  const [found, setFound] = useState<ReadonlySet<number>>(new Set());
  const [bestCount, setBestCount] = useState(0);

  const side = gridSideForCount(count);

  const startRound = useCallback((n: number) => {
    setCount(n);
    setTiles(new Set(pickTiles(n, gridSideForCount(n) ** 2)));
    setFound(new Set());
    setPhase("showing");
  }, []);

  useEffect(() => {
    if (phase !== "showing") return;
    const id = window.setTimeout(() => setPhase("recall"), FLASH_MS);
    return () => window.clearTimeout(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "correct") return;
    const id = window.setTimeout(() => startRound(Math.min(count + 1, MAX_TILES)), 750);
    return () => window.clearTimeout(id);
  }, [phase, count, startRound]);

  useEffect(() => {
    if (phase !== "wrong") return;
    const onDocKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        startRound(START_TILES);
      }
    };
    document.addEventListener("keydown", onDocKeyDown);
    return () => document.removeEventListener("keydown", onDocKeyDown);
  }, [phase, startRound]);

  const pressTile = (cell: number) => {
    if (phase !== "recall" || found.has(cell)) return;
    if (!tiles.has(cell)) {
      setPhase("wrong");
      return;
    }
    const nextFound = new Set(found);
    nextFound.add(cell);
    setFound(nextFound);
    if (nextFound.size === tiles.size) {
      setBestCount((b) => Math.max(b, tiles.size));
      setPhase("correct");
    }
  };

  return (
    <div className="mental-math">
      <div className="mental-math-toolbar">
        <button type="button" className="btn btn--ghost" onClick={onBack}>
          ← Home
        </button>
        <div className="mental-math-stats" aria-live="polite">
          <span className="mental-math-stat">
            Tiles <strong>{count}</strong>
            {bestCount > 0 && (
              <>
                {" "}
                / Best <strong>{bestCount}</strong>
              </>
            )}
          </span>
        </div>
      </div>

      <div className="chart-card mental-math-card">
        <h2 className="mental-math-heading">Visual memory</h2>
        <p className="section-desc mental-math-hint">
          Tiles flash briefly. Once they disappear, click every tile that was lit. Each round adds
          one tile.
        </p>

        {phase === "ready" && (
          <div className="memory-start">
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => startRound(START_TILES)}
            >
              Start
            </button>
          </div>
        )}

        {phase !== "ready" && (
          <>
            <div
              className={`sequence-grid visual-grid ${phase === "recall" ? "sequence-grid--active" : ""}`}
              style={{ gridTemplateColumns: `repeat(${side}, 1fr)` }}
              role="group"
              aria-label="Memory tiles"
            >
              {Array.from({ length: side * side }, (_, i) => {
                const lit =
                  (phase === "showing" && tiles.has(i)) ||
                  (phase === "wrong" && tiles.has(i) && !found.has(i));
                return (
                  <button
                    key={i}
                    type="button"
                    className={`sequence-tile ${lit ? "sequence-tile--lit" : ""} ${
                      found.has(i) ? "sequence-tile--pressed" : ""
                    } ${phase === "wrong" && tiles.has(i) && !found.has(i) ? "sequence-tile--missed" : ""}`}
                    onClick={() => pressTile(i)}
                    disabled={phase !== "recall"}
                    aria-label={`Tile ${i + 1}`}
                  />
                );
              })}
            </div>

            <p className="sequence-status" aria-live="polite">
              {phase === "showing" && "Memorize the lit tiles..."}
              {phase === "recall" && `Found ${found.size} / ${tiles.size}`}
              {phase === "correct" && "Correct."}
              {phase === "wrong" && "\u00A0"}
            </p>

            {phase === "wrong" && (
              <>
                <p className="feedback feedback--bad" role="alert">
                  Wrong tile. The missed tiles are highlighted. You reached{" "}
                  <strong>{count}</strong> tiles.
                </p>
                <div className="answer-row">
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={() => startRound(START_TILES)}
                  >
                    Try again
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

type SchultePhase = "ready" | "playing" | "done";

function SchulteTable({ onBack }: { onBack: () => void }) {
  const [phase, setPhase] = useState<SchultePhase>("ready");
  const [numbers, setNumbers] = useState<number[]>([]);
  const [next, setNext] = useState(1);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [errors, setErrors] = useState(0);
  const [errorCell, setErrorCell] = useState<number | null>(null);
  const [bestMs, setBestMs] = useState<number | null>(null);
  const startRef = useRef(0);

  const start = useCallback(() => {
    setNumbers(shuffledNumbers());
    setNext(1);
    setErrors(0);
    setElapsedMs(0);
    startRef.current = performance.now();
    setPhase("playing");
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    const id = window.setInterval(
      () => setElapsedMs(performance.now() - startRef.current),
      100,
    );
    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (errorCell === null) return;
    const id = window.setTimeout(() => setErrorCell(null), 300);
    return () => window.clearTimeout(id);
  }, [errorCell]);

  const pressCell = (index: number) => {
    if (phase !== "playing") return;
    const value = numbers[index]!;
    if (value !== next) {
      setErrors((e) => e + 1);
      setErrorCell(index);
      return;
    }
    if (value === SCHULTE_COUNT) {
      const final = performance.now() - startRef.current;
      setElapsedMs(final);
      setBestMs((b) => (b === null ? final : Math.min(b, final)));
      setPhase("done");
      return;
    }
    setNext(value + 1);
  };

  return (
    <div className="mental-math">
      <div className="mental-math-toolbar">
        <button type="button" className="btn btn--ghost" onClick={onBack}>
          ← Home
        </button>
        <div className="mental-math-stats" aria-live="polite">
          <span className="mental-math-stat">
            Time <strong>{formatSeconds(elapsedMs)}</strong>
            {bestMs !== null && (
              <>
                {" "}
                / Best <strong>{formatSeconds(bestMs)}</strong>
              </>
            )}
          </span>
        </div>
      </div>

      <div className="chart-card mental-math-card">
        <h2 className="mental-math-heading">Schulte table</h2>
        <p className="section-desc mental-math-hint">
          Click 1 through {SCHULTE_COUNT} in ascending order as fast as you can. Try to keep your
          eyes on the center.
        </p>

        {phase === "ready" && (
          <div className="memory-start">
            <button type="button" className="btn btn--primary" onClick={start}>
              Start
            </button>
          </div>
        )}

        {phase === "playing" && (
          <>
            <div
              className="chimp-grid schulte-grid"
              style={{ gridTemplateColumns: `repeat(${SCHULTE_SIDE}, 1fr)` }}
              role="group"
              aria-label="Number table"
            >
              {numbers.map((value, i) => {
                const done = value < next;
                return (
                  <button
                    key={i}
                    type="button"
                    className={`chimp-cell ${done ? "chimp-cell--done" : "chimp-cell--live"} ${
                      errorCell === i ? "schulte-cell--error" : ""
                    }`}
                    onClick={() => pressCell(i)}
                    disabled={done}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
            <p className="sequence-status" aria-live="polite">
              Next: {next}
              {errors > 0 && ` (misses: ${errors})`}
            </p>
          </>
        )}

        {phase === "done" && (
          <>
            <p className="feedback feedback--ok" role="status">
              Finished in <strong>{formatSeconds(elapsedMs)}</strong>
              {errors > 0 ? (
                <>
                  {" "}
                  with <strong>{errors}</strong> {errors === 1 ? "miss" : "misses"}.
                </>
              ) : (
                <> with no misses.</>
              )}
            </p>
            <div className="answer-row">
              <button type="button" className="btn btn--primary" onClick={start}>
                Play again
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StroopTest({ onBack }: { onBack: () => void }) {
  const [prompt, setPrompt] = useState<StroopPrompt>(() => nextStroop());
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [flash, setFlash] = useState<"ok" | "bad" | null>(null);

  useEffect(() => {
    if (flash === null) return;
    const id = window.setTimeout(() => setFlash(null), 350);
    return () => window.clearTimeout(id);
  }, [flash]);

  const answer = useCallback(
    (colorId: string) => {
      setAttempts((a) => a + 1);
      if (colorId === prompt.ink.id) {
        setScore((s) => s + 1);
        setFlash("ok");
      } else {
        setFlash("bad");
      }
      setPrompt(nextStroop());
    },
    [prompt],
  );

  useEffect(() => {
    const onDocKeyDown = (e: globalThis.KeyboardEvent) => {
      const idx = Number.parseInt(e.key, 10) - 1;
      if (idx >= 0 && idx < STROOP_COLORS.length) {
        e.preventDefault();
        answer(STROOP_COLORS[idx]!.id);
      }
    };
    document.addEventListener("keydown", onDocKeyDown);
    return () => document.removeEventListener("keydown", onDocKeyDown);
  }, [answer]);

  return (
    <div className="mental-math">
      <div className="mental-math-toolbar">
        <button type="button" className="btn btn--ghost" onClick={onBack}>
          ← Home
        </button>
        <div className="mental-math-stats" aria-live="polite">
          <span className="mental-math-stat">
            Score <strong>{score}</strong> / {attempts}
          </span>
        </div>
      </div>

      <div className="chart-card mental-math-card">
        <h2 className="mental-math-heading">Stroop test</h2>
        <p className="section-desc mental-math-hint">
          Pick the color of the ink, not the word itself. Keys 1-{STROOP_COLORS.length} work too.
        </p>

        <div className={`problem-display stroop-display ${flash ? `stroop-display--${flash}` : ""}`} aria-live="polite">
          <span className="problem-numbers stroop-word" style={{ color: prompt.ink.hex }}>
            {prompt.word.label}
          </span>
        </div>

        <div className="stroop-actions" role="group" aria-label="Ink color choices">
          {STROOP_COLORS.map((c, i) => (
            <button
              key={c.id}
              type="button"
              className="btn btn--primary stroop-btn"
              onClick={() => answer(c.id)}
            >
              <span className="stroop-swatch" style={{ background: c.hex }} aria-hidden />
              {c.label}
              <span className="stroop-key" aria-hidden>
                {i + 1}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

type AimPhase = "ready" | "playing" | "done";

function AimTrainer({ onBack }: { onBack: () => void }) {
  const [phase, setPhase] = useState<AimPhase>("ready");
  const [remaining, setRemaining] = useState(TARGET_COUNT);
  const [pos, setPos] = useState<TargetPosition>(() => randomPosition());
  const [times, setTimes] = useState<number[]>([]);
  const [bestAvg, setBestAvg] = useState<number | null>(null);
  const spawnRef = useRef(0);

  const start = () => {
    setRemaining(TARGET_COUNT);
    setTimes([]);
    setPos(randomPosition());
    spawnRef.current = performance.now();
    setPhase("playing");
  };

  const hitTarget = () => {
    if (phase !== "playing") return;
    const elapsed = performance.now() - spawnRef.current;
    const nextTimes = [...times, elapsed];
    setTimes(nextTimes);
    if (remaining === 1) {
      const avg = nextTimes.reduce((a, b) => a + b, 0) / nextTimes.length;
      setBestAvg((b) => (b === null ? avg : Math.min(b, avg)));
      setPhase("done");
      return;
    }
    setRemaining(remaining - 1);
    setPos(randomPosition());
    spawnRef.current = performance.now();
  };

  const avgMs =
    times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;

  return (
    <div className="mental-math">
      <div className="mental-math-toolbar">
        <button type="button" className="btn btn--ghost" onClick={onBack}>
          ← Home
        </button>
        <div className="mental-math-stats" aria-live="polite">
          {bestAvg !== null && (
            <span className="mental-math-stat">
              Best avg <strong>{Math.round(bestAvg)} ms</strong>
            </span>
          )}
        </div>
      </div>

      <div className="chart-card mental-math-card">
        <h2 className="mental-math-heading">Aim trainer</h2>
        <p className="section-desc mental-math-hint">
          Hit {TARGET_COUNT} targets as fast as you can. Average time per target is your score.
        </p>

        {phase === "ready" && (
          <div className="memory-start">
            <button type="button" className="btn btn--primary" onClick={start}>
              Start
            </button>
          </div>
        )}

        {phase === "playing" && (
          <>
            <div className="aim-area">
              <button
                type="button"
                className="aim-target"
                style={{
                  left: `${pos.xPct}%`,
                  top: `${pos.yPct}%`,
                  width: TARGET_SIZE_PX,
                  height: TARGET_SIZE_PX,
                }}
                onClick={hitTarget}
                aria-label="Target"
              />
            </div>
            <p className="sequence-status" aria-live="polite">
              Remaining: {remaining} / {TARGET_COUNT}
            </p>
          </>
        )}

        {phase === "done" && (
          <>
            <p className="feedback feedback--ok" role="status">
              Average <strong>{avgMs} ms</strong> per target over {TARGET_COUNT} targets.
            </p>
            <div className="answer-row">
              <button type="button" className="btn btn--primary" onClick={start}>
                Play again
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

type NBackPhase = "ready" | "playing" | "done";

function NBack({ onBack }: { onBack: () => void }) {
  const [phase, setPhase] = useState<NBackPhase>("ready");
  const [seq, setSeq] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [pressed, setPressed] = useState(false);
  const responsesRef = useRef<Set<number>>(new Set());

  const start = useCallback(() => {
    setSeq(generateNBackSequence());
    setIndex(0);
    setPressed(false);
    responsesRef.current = new Set();
    setPhase("playing");
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    const id = window.setInterval(() => setIndex((i) => i + 1), NBACK_STEP_MS);
    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    setPressed(false);
    if (phase === "playing" && index >= seq.length) {
      setPhase("done");
    }
  }, [index, phase, seq.length]);

  const pressMatch = useCallback(() => {
    if (phase !== "playing" || index >= seq.length) return;
    responsesRef.current.add(index);
    setPressed(true);
  }, [phase, index, seq.length]);

  useEffect(() => {
    const onDocKeyDown = (e: globalThis.KeyboardEvent) => {
      if (phase === "playing" && (e.key === " " || e.key.toLowerCase() === "m")) {
        e.preventDefault();
        pressMatch();
      }
      if (phase === "done" && e.key === "Enter") {
        e.preventDefault();
        start();
      }
    };
    document.addEventListener("keydown", onDocKeyDown);
    return () => document.removeEventListener("keydown", onDocKeyDown);
  }, [phase, pressMatch, start]);

  const result = phase === "done" ? scoreNBack(seq, responsesRef.current) : null;

  return (
    <div className="mental-math">
      <div className="mental-math-toolbar">
        <button type="button" className="btn btn--ghost" onClick={onBack}>
          ← Home
        </button>
        <div className="mental-math-stats" aria-live="polite">
          {phase === "playing" && (
            <span className="mental-math-stat">
              Letter <strong>{Math.min(index + 1, seq.length)}</strong> / {seq.length}
            </span>
          )}
        </div>
      </div>

      <div className="chart-card mental-math-card">
        <h2 className="mental-math-heading">2-back</h2>
        <p className="section-desc mental-math-hint">
          Letters appear one at a time. Press Match (or Space) when the current letter is the same
          as the one {NBACK_N} steps earlier. {NBACK_LENGTH} letters per run.
        </p>

        {phase === "ready" && (
          <div className="memory-start">
            <button type="button" className="btn btn--primary" onClick={start}>
              Start
            </button>
          </div>
        )}

        {phase === "playing" && index < seq.length && (
          <>
            <div className="problem-display" aria-live="polite">
              <span className="problem-numbers nback-letter">{seq[index]}</span>
            </div>
            <div className="word-actions">
              <button
                type="button"
                className={`btn btn--primary nback-match ${pressed ? "nback-match--pressed" : ""}`}
                onClick={pressMatch}
                disabled={pressed}
              >
                {pressed ? "Marked" : "Match"}
              </button>
            </div>
          </>
        )}

        {phase === "done" && result && (
          <>
            <p className="feedback feedback--ok" role="status">
              Hits <strong>{result.hits}</strong> / {result.matches} matches, missed{" "}
              <strong>{result.misses}</strong>, false alarms <strong>{result.falseAlarms}</strong>.
            </p>
            <div className="answer-row">
              <button type="button" className="btn btn--primary" onClick={start}>
                Play again
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
