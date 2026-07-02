export interface StroopColor {
  id: string;
  label: string;
  hex: string;
}

export const STROOP_COLORS: readonly StroopColor[] = [
  { id: "red", label: "Red", hex: "#ef4444" },
  { id: "green", label: "Green", hex: "#22c55e" },
  { id: "blue", label: "Blue", hex: "#3b82f6" },
  { id: "yellow", label: "Yellow", hex: "#eab308" },
];

export interface StroopPrompt {
  word: StroopColor;
  ink: StroopColor;
}

// Mostly incongruent prompts; the answer is always the ink color.
export function nextStroop(rng: () => number = Math.random): StroopPrompt {
  const word = STROOP_COLORS[Math.floor(rng() * STROOP_COLORS.length)]!;
  if (rng() < 0.25) {
    return { word, ink: word };
  }
  const others = STROOP_COLORS.filter((c) => c.id !== word.id);
  return { word, ink: others[Math.floor(rng() * others.length)]! };
}
