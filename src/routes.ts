export const GAME_SCREENS = [
  "mental-math",
  "number-memory",
  "sequence-memory",
  "reaction-time",
  "chimp-test",
  "word-memory",
  "visual-memory",
  "schulte-table",
  "stroop-test",
  "aim-trainer",
  "n-back",
  "sudoku",
] as const;

export type GameScreen = (typeof GAME_SCREENS)[number];
export type Screen = "home" | GameScreen;

function isGameScreen(value: string): value is GameScreen {
  return (GAME_SCREENS as readonly string[]).includes(value);
}

/** Vite `base` — `/` or `/repo-name/` */
export function appBase(): string {
  const base = import.meta.env.BASE_URL;
  return base.endsWith("/") ? base : `${base}/`;
}

function pathSegment(): string {
  let path = window.location.pathname;
  const base = appBase();
  if (base !== "/" && path.startsWith(base)) {
    path = path.slice(base.length);
  }
  const segment = path.replace(/^\/+|\/+$/g, "").split("/")[0] ?? "";
  if (segment === "index.html") return "";
  return segment;
}

export function screenFromPath(): Screen {
  const segment = pathSegment();
  if (segment === "") return "home";
  if (isGameScreen(segment)) return segment;
  return "home";
}

export function pathForScreen(screen: Screen): string {
  const base = appBase();
  if (screen === "home") return base;
  return `${base}${screen}`;
}

export function pathsMatch(screen: Screen): boolean {
  const want = new URL(pathForScreen(screen), window.location.origin).pathname;
  return window.location.pathname === want;
}

export function navigateToScreen(screen: Screen): void {
  if (!pathsMatch(screen)) {
    history.pushState(null, "", pathForScreen(screen));
  }
}
