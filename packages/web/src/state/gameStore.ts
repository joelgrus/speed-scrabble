import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mulberry32, seedFromString, buildBag, validateBoard, key } from "@ss/shared";
import type { Board, Cursor, Rules, Tile } from "@ss/shared";

type GameState = {
  rules: Rules;
  seed: string;
  rngSeed: number;
  bag: Tile[];
  rack: Tile[];
  board: Board;
  cursor: Cursor;
  dict: Set<string>;
  invalidCells: Set<string>;
  poolRemaining: number;

  init(dict: Set<string>, seed?: string): void;
  draw(n: number): void;
  placeTile(tileId: string, x: number, y: number): void;
  removeTile(x: number, y: number): void;
  setCursor(c: Partial<Cursor>): void;
  validate(): void;
  peel(): void;
  canPeel(): boolean;
  reset(): void;
};

const DEFAULT_RULES: Rules = { startDraw: 7, peelDraw: 2, dumpEnabled: false };

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      rules: DEFAULT_RULES,
      seed: "local",
      rngSeed: seedFromString("local"),
      bag: [],
      rack: [],
      board: {},
      cursor: { pos: { x: 0, y: 0 }, orient: "H" },
      dict: new Set<string>(),
      invalidCells: new Set<string>(),
      poolRemaining: 0,

      init(dict, seed = "local") {
        const rng = mulberry32(seedFromString(seed));
        const bag = buildBag(rng);
        const rack = bag.splice(0, DEFAULT_RULES.startDraw);
        set({
          dict, seed, rngSeed: seedFromString(seed),
          bag, rack, board: {}, invalidCells: new Set(), poolRemaining: bag.length
        });
      },

      draw(n) {
        const { bag, rack } = get();
        const drawn = bag.splice(0, n);
        set({ rack: rack.concat(drawn), poolRemaining: bag.length });
      },

      placeTile(tileId, x, y) {
        const { rack, board, cursor } = get();
        const idx = rack.findIndex(t => t.id === tileId);
        if (idx === -1) return;
        const [t] = rack.splice(idx, 1);
        board[key(x,y)] = { id: t.id, letter: t.letter, x, y };
        // Advance cursor after placing
        const nextX = cursor.orient === "H" ? x + 1 : x;
        const nextY = cursor.orient === "V" ? y + 1 : y;
        set({ 
          rack, 
          board: { ...board },
          cursor: { ...cursor, pos: { x: nextX, y: nextY } }
        });
      },

      removeTile(x, y) {
        const { rack, board } = get();
        const pt = board[key(x,y)];
        if (!pt) return;
        delete board[key(x,y)];
        rack.push({ id: pt.id, letter: pt.letter });
        set({ rack: [...rack], board: { ...board } });
      },

      setCursor(c) {
        const cur = get().cursor;
        set({ cursor: { ...cur, ...c, pos: { ...cur.pos, ...c.pos } } });
      },

      validate() {
        const { board, dict } = get();
        const res = validateBoard(board, dict);
        const bad = new Set<string>();
        for (const issue of res.issues) {
          for (const c of issue.cells) bad.add(key(c.x, c.y));
        }
        set({ invalidCells: bad });
      },

      canPeel() {
        const { rack, invalidCells } = get();
        return rack.length === 0 && invalidCells.size === 0;
      },

      peel() {
        const { rules } = get();
        if (!get().canPeel()) return;
        get().draw(rules.peelDraw);
      },

      reset() {
        const { dict, seed } = get();
        get().init(dict, seed);
      }
    }),
    { name: "ss-local" }
  )
);
