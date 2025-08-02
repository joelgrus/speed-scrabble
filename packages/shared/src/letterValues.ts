import type { Letter } from "./types";

export const LETTER_VALUES: Readonly<Record<Letter, number>> = Object.freeze({
  // 1 point
  "A": 1, "E": 1, "I": 1, "O": 1, "U": 1, "L": 1, "N": 1, "S": 1, "T": 1, "R": 1,
  // 2 points
  "D": 2, "G": 2,
  // 3 points
  "B": 3, "C": 3, "M": 3, "P": 3,
  // 4 points
  "F": 4, "H": 4, "V": 4, "W": 4, "Y": 4,
  // 5 points
  "K": 5,
  // 8 points
  "J": 8, "X": 8,
  // 10 points
  "Q": 10, "Z": 10
});