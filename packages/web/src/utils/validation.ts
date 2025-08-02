/**
 * Input validation utilities for the Speed Scrabble game
 */
import { VALIDATION_BOUNDS } from "@ss/shared";

/**
 * Validates that coordinates are valid integers
 */
export function validateCoordinates(x: unknown, y: unknown): { x: number; y: number } | null {
  if (typeof x !== "number" || typeof y !== "number") {
    return null;
  }

  if (!Number.isInteger(x) || !Number.isInteger(y)) {
    return null;
  }

  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return null;
  }

  // Reasonable bounds check (board can be large but not infinite)
  if (
    x > VALIDATION_BOUNDS.maxCoordinate ||
    x < VALIDATION_BOUNDS.minCoordinate ||
    y > VALIDATION_BOUNDS.maxCoordinate ||
    y < VALIDATION_BOUNDS.minCoordinate
  ) {
    return null;
  }

  return { x, y };
}

/**
 * Validates that a tile ID is a valid string
 */
export function validateTileId(tileId: unknown): string | null {
  if (typeof tileId !== "string") {
    return null;
  }

  if (tileId.length === 0 || tileId.length > VALIDATION_BOUNDS.maxStringLength) {
    return null;
  }

  // Check format: should be 't' followed by digits
  if (!/^t\d+$/.test(tileId)) {
    return null;
  }

  // Extract and validate the numeric part
  const numericPart = tileId.slice(1);
  const tileNumber = parseInt(numericPart, 10);
  
  // Ensure it's a reasonable tile number (not negative, not too large)
  if (isNaN(tileNumber) || tileNumber < 0 || tileNumber > 999999) {
    return null;
  }

  return tileId;
}

/**
 * Validates that a letter is a valid single uppercase letter
 */
export function validateLetter(letter: unknown): string | null {
  if (typeof letter !== "string") {
    return null;
  }

  if (letter.length !== 1) {
    return null;
  }

  if (!/^[A-Z]$/.test(letter)) {
    return null;
  }

  return letter;
}

/**
 * Validates and sanitizes user input for display
 */
export function sanitizeForDisplay(input: unknown): string {
  if (typeof input !== "string") {
    return String(input);
  }

  // Basic HTML escape to prevent XSS
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .trim();
}

/**
 * Validates array bounds before accessing
 */
export function validateArrayAccess<T>(array: unknown, index: number): T | null {
  if (!Array.isArray(array)) {
    return null;
  }

  if (!Number.isInteger(index)) {
    return null;
  }

  if (index < 0 || index >= array.length) {
    return null;
  }

  return (array as T[])[index];
}

/**
 * Safely removes items from array with bounds checking
 */
export function safeArraySplice<T>(array: T[], start: number, deleteCount: number = 1): T[] {
  if (!Array.isArray(array)) {
    throw new Error("First argument must be an array");
  }

  // Check array size bounds
  if (array.length > VALIDATION_BOUNDS.maxArrayLength) {
    throw new Error(`Array too large: ${array.length} > ${VALIDATION_BOUNDS.maxArrayLength}`);
  }

  if (!Number.isInteger(start)) {
    throw new Error("Start index must be an integer");
  }

  if (!Number.isInteger(deleteCount) || deleteCount < 0) {
    throw new Error("Delete count must be a non-negative integer");
  }

  // Bounds check for start index
  if (start < 0 || start >= array.length) {
    return []; // Nothing to remove
  }

  // Prevent excessive deletion attempts
  if (deleteCount > VALIDATION_BOUNDS.maxArrayLength) {
    throw new Error(`Delete count too large: ${deleteCount} > ${VALIDATION_BOUNDS.maxArrayLength}`);
  }

  const actualDeleteCount = Math.min(deleteCount, array.length - start);
  return array.splice(start, actualDeleteCount);
}

/**
 * Validates that a number is within specified bounds
 */
export function validateNumberInRange(
  value: unknown,
  min: number,
  max: number,
  integer: boolean = false
): number | null {
  if (typeof value !== "number") {
    return null;
  }

  if (!Number.isFinite(value)) {
    return null;
  }

  if (integer && !Number.isInteger(value)) {
    return null;
  }

  if (value < min || value > max) {
    return null;
  }

  return value;
}

/**
 * Validates game state integrity
 */
export interface GameStateValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateGameState(state: unknown): GameStateValidationResult {
  const errors: string[] = [];

  // Check that state is an object
  if (!state || typeof state !== "object") {
    return { valid: false, errors: ["Game state must be an object"] };
  }

  const gameState = state as Record<string, unknown>;

  // Validate rack is an array
  if (!Array.isArray(gameState.rack)) {
    errors.push("Rack must be an array");
  } else {
    // Validate each tile in rack
    gameState.rack.forEach((tile: unknown, index: number) => {
      if (!tile || typeof tile !== "object") {
        errors.push(`Rack tile at index ${index} must be an object`);
        return;
      }

      const tileObj = tile as Record<string, unknown>;

      if (!validateTileId(tileObj.id)) {
        errors.push(`Rack tile at index ${index} has invalid ID`);
      }

      if (!validateLetter(tileObj.letter)) {
        errors.push(`Rack tile at index ${index} has invalid letter`);
      }
    });
  }

  // Validate bag is an array
  if (!Array.isArray(gameState.bag)) {
    errors.push("Bag must be an array");
  }

  // Validate board is an object
  if (!gameState.board || typeof gameState.board !== "object") {
    errors.push("Board must be an object");
  } else {
    // Validate each placed tile
    Object.entries(gameState.board as Record<string, unknown>).forEach(
      ([key, tile]: [string, unknown]) => {
        if (!tile || typeof tile !== "object") {
          errors.push(`Board tile at ${key} must be an object`);
          return;
        }

        const tileObj = tile as Record<string, unknown>;

        if (!validateTileId(tileObj.id)) {
          errors.push(`Board tile at ${key} has invalid ID`);
        }

        if (!validateLetter(tileObj.letter)) {
          errors.push(`Board tile at ${key} has invalid letter`);
        }

        const coords = validateCoordinates(tileObj.x, tileObj.y);
        if (!coords) {
          errors.push(`Board tile at ${key} has invalid coordinates`);
        }
      }
    );
  }

  // Validate cursor
  if (!gameState.cursor || typeof gameState.cursor !== "object") {
    errors.push("Cursor must be an object");
  } else {
    const cursor = gameState.cursor as Record<string, unknown>;

    if (!cursor.pos || typeof cursor.pos !== "object") {
      errors.push("Cursor position must be an object");
    } else {
      const pos = cursor.pos as Record<string, unknown>;
      const coords = validateCoordinates(pos.x, pos.y);
      if (!coords) {
        errors.push("Cursor has invalid coordinates");
      }
    }

    if (cursor.orient !== "H" && cursor.orient !== "V") {
      errors.push('Cursor orientation must be "H" or "V"');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
