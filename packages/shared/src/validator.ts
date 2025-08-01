import type { Board, ValidationResult } from "./types";
import { extractWords } from "./board";

export function validateBoard(board: Board, dict: Set<string>): ValidationResult {
  const words = extractWords(board);
  const issues = words
    .filter(w => !dict.has(w.word))
    .map(w => ({ word: w.word, cells: w.cells }));
  return { ok: issues.length === 0, issues };
}
