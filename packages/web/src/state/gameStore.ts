import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mulberry32, seedFromString, buildBag, validateBoard, key } from "@ss/shared";
import type { Board, Cursor, Rules, Tile, ValidationIssue } from "@ss/shared";

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
  invalidWords: ValidationIssue[];
  connected: boolean;
  poolRemaining: number;
  justDrew: boolean;
  gameWon: boolean;
  dumpMode: boolean;

  init(dict: Set<string>, seed?: string): void;
  draw(n: number): void;
  placeTile(tileId: string, x: number, y: number): void;
  removeTile(x: number, y: number): void;
  setCursor(c: Partial<Cursor>): void;
  validate(): void;
  autoDraw(): void;
  canDraw(): boolean;
  toggleDumpMode(): void;
  dumpTile(tileId: string): void;
  canDump(): boolean;
  reset(): void;
};

const DEFAULT_RULES: Rules = { startDraw: 7, drawAmount: 2, dumpEnabled: true };

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
      invalidWords: [],
      connected: true,
      poolRemaining: 0,
      justDrew: false,
      gameWon: false,
      dumpMode: false,

      init(dict, seed = "local") {
        const rng = mulberry32(seedFromString(seed));
        const bag = buildBag(rng);
        const rack = bag.splice(0, DEFAULT_RULES.startDraw);
        set({
          dict, seed, rngSeed: seedFromString(seed),
          bag, rack, board: {}, invalidCells: new Set(), invalidWords: [], connected: true, 
          poolRemaining: bag.length, justDrew: false, gameWon: false, dumpMode: false
        });
      },

      draw(n) {
        const { bag, rack } = get();
        const drawn = bag.splice(0, Math.min(n, bag.length)); // Don't try to draw more than available
        set({ rack: rack.concat(drawn), poolRemaining: bag.length, justDrew: false });
      },

      placeTile(tileId, x, y) {
        const { rack, board, cursor } = get();
        
        // Don't allow placing on occupied squares
        if (board[key(x,y)]) return;
        
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
        
        // Trigger validation after placement
        get().validate();
      },

      removeTile(x, y) {
        const { rack, board } = get();
        const pt = board[key(x,y)];
        if (!pt) return;
        delete board[key(x,y)];
        rack.push({ id: pt.id, letter: pt.letter });
        set({ rack: [...rack], board: { ...board } });
        
        // Trigger validation after removal
        get().validate();
      },

      setCursor(c) {
        const cur = get().cursor;
        set({ cursor: { ...cur, ...c, pos: { ...cur.pos, ...c.pos } } });
      },

      validate() {
        const { board, dict, rack, bag } = get();
        const res = validateBoard(board, dict);
        const bad = new Set<string>();
        for (const issue of res.issues) {
          for (const c of issue.cells) bad.add(key(c.x, c.y));
        }
        set({ invalidCells: bad, invalidWords: res.issues, connected: res.connected });
        
        // Check for win condition
        if (rack.length === 0 && bag.length === 0 && res.ok) {
          set({ gameWon: true });
        }
        
        // Auto-draw if conditions are met
        setTimeout(() => {
          get().autoDraw();
        }, 100); // Small delay to let state settle
      },

      canDraw() {
        const { rack, invalidCells, connected } = get();
        return rack.length === 0 && invalidCells.size === 0 && connected;
      },

      autoDraw() {
        const state = get();
        const { rules } = state;
        
        if (!state.canDraw()) return;
        
        // Show draw feedback briefly
        set({ justDrew: true });
        setTimeout(() => set({ justDrew: false }), 1000);
        
        state.draw(rules.drawAmount);
      },

      toggleDumpMode() {
        const { dumpMode } = get();
        set({ dumpMode: !dumpMode });
      },

      canDump() {
        const { rack, bag } = get();
        return rack.length > 0 && bag.length >= 3; // Need at least 3 tiles to draw
      },

      dumpTile(tileId) {
        const { rack, bag, rngSeed } = get();
        if (!get().canDump()) return;
        
        // Find and remove the tile from rack
        const idx = rack.findIndex(t => t.id === tileId);
        if (idx === -1) return;
        
        const [dumpedTile] = rack.splice(idx, 1);
        
        // Add dumped tile back to bag
        bag.push(dumpedTile);
        
        // Shuffle the bag (since we added a tile back)
        const rng = mulberry32(rngSeed);
        for (let i = bag.length - 1; i > 0; i--) {
          const j = Math.floor(rng() * (i + 1));
          [bag[i], bag[j]] = [bag[j], bag[i]];
        }
        
        // Draw 3 tiles
        const drawn = bag.splice(0, 3);
        
        set({ 
          rack: [...rack, ...drawn], 
          bag: [...bag],
          poolRemaining: bag.length,
          dumpMode: false // Exit dump mode after dumping
        });
        
        // Validate after dump
        get().validate();
      },

      reset() {
        const { dict } = get();
        // Generate new random seed for each reset
        const newSeed = `game-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        get().init(dict, newSeed);
      }
    }),
    { 
      name: "ss-local",
      version: 1,
      migrate: (persistedState: any) => {
        // Migrate old peelDraw to drawAmount
        if (persistedState.rules && 'peelDraw' in persistedState.rules) {
          persistedState.rules.drawAmount = persistedState.rules.peelDraw || 2;
          delete persistedState.rules.peelDraw;
        }
        // Ensure drawAmount exists
        if (persistedState.rules && !persistedState.rules.drawAmount) {
          persistedState.rules.drawAmount = 2;
        }
        return persistedState;
      }
    }
  )
);
