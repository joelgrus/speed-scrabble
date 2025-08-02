import { describe, it, expect } from "vitest";
import {
  validateCoordinates,
  validateTileId,
  validateLetter,
  sanitizeForDisplay,
  validateArrayAccess,
  safeArraySplice,
  validateNumberInRange,
  validateGameState,
} from "../validation";

describe("validateCoordinates", () => {
  it("should validate valid integer coordinates", () => {
    expect(validateCoordinates(0, 0)).toEqual({ x: 0, y: 0 });
    expect(validateCoordinates(10, -5)).toEqual({ x: 10, y: -5 });
    expect(validateCoordinates(-100, 100)).toEqual({ x: -100, y: 100 });
  });

  it("should reject non-number coordinates", () => {
    expect(validateCoordinates("0", 0)).toBeNull();
    expect(validateCoordinates(0, "0")).toBeNull();
    expect(validateCoordinates(null, 0)).toBeNull();
    expect(validateCoordinates(undefined, 0)).toBeNull();
  });

  it("should reject non-integer coordinates", () => {
    expect(validateCoordinates(1.5, 0)).toBeNull();
    expect(validateCoordinates(0, 2.7)).toBeNull();
  });

  it("should reject infinite coordinates", () => {
    expect(validateCoordinates(Infinity, 0)).toBeNull();
    expect(validateCoordinates(0, -Infinity)).toBeNull();
    expect(validateCoordinates(NaN, 0)).toBeNull();
  });

  it("should reject coordinates outside reasonable bounds", () => {
    expect(validateCoordinates(10001, 0)).toBeNull();
    expect(validateCoordinates(0, -10001)).toBeNull();
  });
});

describe("validateTileId", () => {
  it("should validate correct tile ID format", () => {
    expect(validateTileId("t0")).toBe("t0");
    expect(validateTileId("t123")).toBe("t123");
    expect(validateTileId("t999999")).toBe("t999999");
  });

  it("should reject invalid tile ID format", () => {
    expect(validateTileId("tile1")).toBeNull();
    expect(validateTileId("T0")).toBeNull();
    expect(validateTileId("t")).toBeNull();
    expect(validateTileId("t-1")).toBeNull();
    expect(validateTileId("ta")).toBeNull();
  });

  it("should reject non-string inputs", () => {
    expect(validateTileId(123)).toBeNull();
    expect(validateTileId(null)).toBeNull();
    expect(validateTileId(undefined)).toBeNull();
    expect(validateTileId({})).toBeNull();
  });

  it("should reject empty string", () => {
    expect(validateTileId("")).toBeNull();
  });
});

describe("validateLetter", () => {
  it("should validate uppercase letters", () => {
    expect(validateLetter("A")).toBe("A");
    expect(validateLetter("Z")).toBe("Z");
    expect(validateLetter("M")).toBe("M");
  });

  it("should reject lowercase letters", () => {
    expect(validateLetter("a")).toBeNull();
    expect(validateLetter("z")).toBeNull();
  });

  it("should reject non-letters", () => {
    expect(validateLetter("1")).toBeNull();
    expect(validateLetter("!")).toBeNull();
    expect(validateLetter(" ")).toBeNull();
  });

  it("should reject multi-character strings", () => {
    expect(validateLetter("AB")).toBeNull();
    expect(validateLetter("AA")).toBeNull();
  });

  it("should reject non-string inputs", () => {
    expect(validateLetter(65)).toBeNull(); // ASCII for 'A'
    expect(validateLetter(null)).toBeNull();
    expect(validateLetter(undefined)).toBeNull();
  });
});

describe("sanitizeForDisplay", () => {
  it("should escape HTML characters", () => {
    expect(sanitizeForDisplay("<script>")).toBe("&lt;script&gt;");
    expect(sanitizeForDisplay("&amp;")).toBe("&amp;amp;");
    expect(sanitizeForDisplay('"quoted"')).toBe("&quot;quoted&quot;");
    expect(sanitizeForDisplay("'single'")).toBe("&#39;single&#39;");
  });

  it("should trim whitespace", () => {
    expect(sanitizeForDisplay("  hello  ")).toBe("hello");
    expect(sanitizeForDisplay("\t\ntest\n\t")).toBe("test");
  });

  it("should convert non-strings to strings", () => {
    expect(sanitizeForDisplay(123)).toBe("123");
    expect(sanitizeForDisplay(null)).toBe("null");
    expect(sanitizeForDisplay(undefined)).toBe("undefined");
  });

  it("should handle complex HTML injection attempts", () => {
    const malicious = '<img src="x" onerror="alert(1)">';
    expect(sanitizeForDisplay(malicious)).toBe(
      "&lt;img src=&quot;x&quot; onerror=&quot;alert(1)&quot;&gt;"
    );
  });
});

describe("validateArrayAccess", () => {
  const testArray = ["a", "b", "c"];

  it("should return element for valid index", () => {
    expect(validateArrayAccess(testArray, 0)).toBe("a");
    expect(validateArrayAccess(testArray, 1)).toBe("b");
    expect(validateArrayAccess(testArray, 2)).toBe("c");
  });

  it("should return null for out-of-bounds index", () => {
    expect(validateArrayAccess(testArray, -1)).toBeNull();
    expect(validateArrayAccess(testArray, 3)).toBeNull();
    expect(validateArrayAccess(testArray, 100)).toBeNull();
  });

  it("should return null for non-integer index", () => {
    expect(validateArrayAccess(testArray, 1.5)).toBeNull();
    expect(validateArrayAccess(testArray, NaN)).toBeNull();
  });

  it("should return null for non-array input", () => {
    expect(validateArrayAccess("not-array", 0)).toBeNull();
    expect(validateArrayAccess(null, 0)).toBeNull();
    expect(validateArrayAccess(undefined, 0)).toBeNull();
  });
});

describe("safeArraySplice", () => {
  it("should safely splice elements from array", () => {
    const arr = [1, 2, 3, 4, 5];
    const removed = safeArraySplice(arr, 1, 2);

    expect(removed).toEqual([2, 3]);
    expect(arr).toEqual([1, 4, 5]);
  });

  it("should handle out-of-bounds start index", () => {
    const arr = [1, 2, 3];
    expect(safeArraySplice(arr, 10, 1)).toEqual([]);
    expect(safeArraySplice(arr, -1, 1)).toEqual([]);
    expect(arr).toEqual([1, 2, 3]); // Array unchanged
  });

  it("should handle delete count larger than remaining elements", () => {
    const arr = [1, 2, 3];
    const removed = safeArraySplice(arr, 1, 10);

    expect(removed).toEqual([2, 3]);
    expect(arr).toEqual([1]);
  });

  it("should throw error for non-array input", () => {
    expect(() => safeArraySplice("not-array" as unknown as never[], 0, 1)).toThrow(
      "First argument must be an array"
    );
  });

  it("should throw error for non-integer indices", () => {
    const arr = [1, 2, 3];
    expect(() => safeArraySplice(arr, 1.5, 1)).toThrow("Start index must be an integer");
    expect(() => safeArraySplice(arr, 1, 1.5)).toThrow(
      "Delete count must be a non-negative integer"
    );
  });

  it("should throw error for negative delete count", () => {
    const arr = [1, 2, 3];
    expect(() => safeArraySplice(arr, 1, -1)).toThrow(
      "Delete count must be a non-negative integer"
    );
  });
});

describe("validateNumberInRange", () => {
  it("should validate numbers within range", () => {
    expect(validateNumberInRange(5, 0, 10)).toBe(5);
    expect(validateNumberInRange(0, 0, 10)).toBe(0);
    expect(validateNumberInRange(10, 0, 10)).toBe(10);
  });

  it("should reject numbers outside range", () => {
    expect(validateNumberInRange(-1, 0, 10)).toBeNull();
    expect(validateNumberInRange(11, 0, 10)).toBeNull();
  });

  it("should validate integers when required", () => {
    expect(validateNumberInRange(5, 0, 10, true)).toBe(5);
    expect(validateNumberInRange(5.5, 0, 10, true)).toBeNull();
  });

  it("should allow floats when integers not required", () => {
    expect(validateNumberInRange(5.5, 0, 10, false)).toBe(5.5);
    expect(validateNumberInRange(5.5, 0, 10)).toBe(5.5); // default false
  });

  it("should reject non-numbers", () => {
    expect(validateNumberInRange("5", 0, 10)).toBeNull();
    expect(validateNumberInRange(null, 0, 10)).toBeNull();
  });

  it("should reject infinite values", () => {
    expect(validateNumberInRange(Infinity, 0, 10)).toBeNull();
    expect(validateNumberInRange(NaN, 0, 10)).toBeNull();
  });
});

describe("validateGameState", () => {
  const validState = {
    rack: [
      { id: "t1", letter: "A" },
      { id: "t2", letter: "B" },
    ],
    bag: [{ id: "t3", letter: "C" }],
    board: {
      "0,0": { id: "t4", letter: "D", x: 0, y: 0 },
    },
    cursor: {
      pos: { x: 0, y: 0 },
      orient: "H",
    },
  };

  it("should validate correct game state", () => {
    const result = validateGameState(validState);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("should reject non-object state", () => {
    const result = validateGameState("not-object");
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Game state must be an object");
  });

  it("should validate rack is array", () => {
    const invalidState = { ...validState, rack: "not-array" };
    const result = validateGameState(invalidState);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Rack must be an array");
  });

  it("should validate rack tile format", () => {
    const invalidState = {
      ...validState,
      rack: [{ id: "invalid", letter: "A" }],
    };
    const result = validateGameState(invalidState);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Rack tile at index 0 has invalid ID");
  });

  it("should validate board tile coordinates", () => {
    const invalidState = {
      ...validState,
      board: {
        "0,0": { id: "t1", letter: "A", x: "invalid", y: 0 },
      },
    };
    const result = validateGameState(invalidState);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Board tile at 0,0 has invalid coordinates");
  });

  it("should validate cursor format", () => {
    const invalidState = {
      ...validState,
      cursor: { pos: { x: 0, y: 0 }, orient: "invalid" },
    };
    const result = validateGameState(invalidState);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Cursor orientation must be "H" or "V"');
  });
});
