export type Operation = "add" | "sub" | "mul" | "div";

export const OPERATIONS: readonly Operation[] = ["add", "sub", "mul", "div"];

export interface Problem {
  op: Operation;
  left: number;
  right: number;
  answer: number;
}

function randInt(min: number, max: number, rng: () => number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function generateProblem(ops: Operation[], rng: () => number = Math.random): Problem {
  if (ops.length === 0) {
    throw new Error("At least one operation is required");
  }
  const op = ops[Math.floor(rng() * ops.length)]!;
  switch (op) {
    case "add": {
      const a = randInt(5, 99, rng);
      const b = randInt(5, 99, rng);
      return { op, left: a, right: b, answer: a + b };
    }
    case "sub": {
      const a = randInt(10, 99, rng);
      const b = randInt(5, a, rng);
      return { op, left: a, right: b, answer: a - b };
    }
    case "mul": {
      const a = randInt(2, 12, rng);
      const b = randInt(2, 12, rng);
      return { op, left: a, right: b, answer: a * b };
    }
    case "div": {
      const divisor = randInt(2, 12, rng);
      const quotient = randInt(2, 12, rng);
      const dividend = divisor * quotient;
      return { op, left: dividend, right: divisor, answer: quotient };
    }
  }
}

export function operationSymbol(op: Operation): string {
  switch (op) {
    case "add":
      return "+";
    case "sub":
      return "−";
    case "mul":
      return "×";
    case "div":
      return "÷";
  }
}

export function operationLabel(op: Operation): string {
  switch (op) {
    case "add":
      return "Addition";
    case "sub":
      return "Subtraction";
    case "mul":
      return "Multiplication";
    case "div":
      return "Division";
  }
}
