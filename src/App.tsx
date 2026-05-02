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
import { getPreferredTheme, THEME_STORAGE_KEY, type ThemeMode } from "./theme";
import "./App.css";

type Screen = "home" | "mental-math";

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

      {screen === "home" && <Home onChooseMentalMath={() => setScreen("mental-math")} />}
      {screen === "mental-math" && <MentalMath onBack={() => setScreen("home")} />}
    </div>
  );
}

function Home({ onChooseMentalMath }: { onChooseMentalMath: () => void }) {
  return (
    <section className="exercise-grid" aria-label="Exercises">
      <button type="button" className="exercise-card exercise-card--active" onClick={onChooseMentalMath}>
        <span className="exercise-card-icon" aria-hidden>
          ∑
        </span>
        <span className="exercise-card-title">Mental math</span>
        <span className="exercise-card-desc">Addition, subtraction, multiplication, and division.</span>
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
