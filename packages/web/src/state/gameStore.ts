import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  mulberry32,
  seedFromString,
  buildBag,
  validateBoard,
  key,
  DEFAULT_GAME_RULES,
  DUMP_CONFIG,
  PERFORMANCE_CONFIG,
  ANIMATION_DURATIONS,
  TIMED_GAME_CONFIG,
} from "@ss/shared";
import type { Board, Cursor, Rules, Tile, ValidationIssue } from "@ss/shared";
import { validateCoordinates, validateTileId, safeArraySplice } from "../utils/validation";
import { errorReporter, getSafeGameState } from "../utils/errorReporting";

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
  
  // Timer state  
  gameStartTime: number | null;
  currentTime: number;
  dumpPenalties: number; // Total penalty seconds from dumps
  isGameActive: boolean;

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
  
  // Timer methods
  startGame(): void;
  updateTimer(): void;
  endGame(): void;
  addDumpPenalty(): void;
  getTotalTime(): number;
  
  // Share methods
  getShareableResult(): { username: string; date: string; width: number; height: number; grid: string; time: number } | null;
};

const DEFAULT_RULES: Rules = DEFAULT_GAME_RULES;

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
      
      // Timer state
      gameStartTime: null,
      currentTime: 0,
      dumpPenalties: 0,
      isGameActive: false,

      init(dict, seed = "local") {
        const rng = mulberry32(seedFromString(seed));
        const bag = buildBag(rng);
        const rack = bag.splice(0, DEFAULT_GAME_RULES.startDraw);
        set({
          dict,
          seed,
          rngSeed: seedFromString(seed),
          bag,
          rack,
          board: {},
          invalidCells: new Set(),
          invalidWords: [],
          connected: true,
          poolRemaining: bag.length,
          justDrew: false,
          gameWon: false,
          dumpMode: false,
          
          // Start the game timer immediately  
          gameStartTime: Date.now(),
          currentTime: 0,
          dumpPenalties: 0,
          isGameActive: true,
        });
      },

      draw(n) {
        const { bag, rack } = get();
        const drawn = bag.splice(0, Math.min(n, bag.length)); // Don't try to draw more than available
        set({ rack: rack.concat(drawn), poolRemaining: bag.length, justDrew: false });
      },

      placeTile(tileId, x, y) {
        try {
          const { rack, board, cursor } = get();

          // Validate inputs
          const validCoords = validateCoordinates(x, y);
          if (!validCoords) {
            console.warn("Invalid coordinates for tile placement:", x, y);
            return;
          }

          const validTileId = validateTileId(tileId);
          if (!validTileId) {
            console.warn("Invalid tile ID for placement:", tileId);
            return;
          }

          // Don't allow placing on occupied squares
          if (board[key(validCoords.x, validCoords.y)]) return;

          const idx = rack.findIndex(t => t.id === validTileId);
          if (idx === -1) {
            console.warn("Tile not found in rack:", validTileId);
            return;
          }

          // Safely remove tile from rack
          const removedTiles = safeArraySplice(rack, idx, 1);
          if (removedTiles.length === 0) {
            console.warn("Failed to remove tile from rack");
            return;
          }

          const [t] = removedTiles;
          board[key(validCoords.x, validCoords.y)] = {
            id: t.id,
            letter: t.letter,
            x: validCoords.x,
            y: validCoords.y,
          };

          // Advance cursor after placing
          const nextX = cursor.orient === "H" ? validCoords.x + 1 : validCoords.x;
          const nextY = cursor.orient === "V" ? validCoords.y + 1 : validCoords.y;

          set({
            rack: [...rack],
            board: { ...board },
            cursor: { ...cursor, pos: { x: nextX, y: nextY } },
          });

          // Trigger validation after placement
          get().validate();
        } catch (error) {
          console.error("Error placing tile:", error);
          if (error instanceof Error) {
            errorReporter.reportException(error, {
              component: 'gameStore.placeTile',
              action: `placeTile(${tileId}, ${x}, ${y})`,
              gameState: getSafeGameState(),
            });
          }
        }
      },

      removeTile(x, y) {
        try {
          const { rack, board } = get();

          // Validate coordinates
          const validCoords = validateCoordinates(x, y);
          if (!validCoords) {
            console.warn("Invalid coordinates for tile removal:", x, y);
            return;
          }

          const pt = board[key(validCoords.x, validCoords.y)];
          if (!pt) return;

          delete board[key(validCoords.x, validCoords.y)];
          rack.push({ id: pt.id, letter: pt.letter });
          set({ rack: [...rack], board: { ...board } });

          // Trigger validation after removal
          get().validate();
        } catch (error) {
          console.error("Error removing tile:", error);
          if (error instanceof Error) {
            errorReporter.reportException(error, {
              component: 'gameStore.removeTile',
              action: `removeTile(${x}, ${y})`,
              gameState: getSafeGameState(),
            });
          }
        }
      },

      setCursor(c) {
        try {
          const cur = get().cursor;

          // Validate cursor update
          const newCursor = { ...cur, ...c };
          if (c.pos) {
            newCursor.pos = { ...cur.pos, ...c.pos };

            // Validate new position if provided
            if (c.pos.x !== undefined || c.pos.y !== undefined) {
              const validCoords = validateCoordinates(
                c.pos.x !== undefined ? c.pos.x : cur.pos.x,
                c.pos.y !== undefined ? c.pos.y : cur.pos.y
              );
              if (!validCoords) {
                console.warn("Invalid cursor coordinates:", c.pos);
                return;
              }
              newCursor.pos = validCoords;
            }
          }

          // Validate orientation if provided
          if (c.orient && c.orient !== "H" && c.orient !== "V") {
            console.warn("Invalid cursor orientation:", c.orient);
            return;
          }

          set({ cursor: newCursor });
        } catch (error) {
          console.error("Error setting cursor:", error);
        }
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
          get().endGame();
        }

        // Auto-draw if conditions are met - debounced to avoid rapid calls
        setTimeout(() => {
          get().autoDraw();
        }, PERFORMANCE_CONFIG.autoDrawDelayMs);
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
        setTimeout(() => set({ justDrew: false }), ANIMATION_DURATIONS.drawNotification);

        state.draw(rules.drawAmount);
      },

      toggleDumpMode() {
        const { dumpMode } = get();
        set({ dumpMode: !dumpMode });
      },

      canDump() {
        const { rack, bag } = get();
        return rack.length > 0 && bag.length >= DUMP_CONFIG.minimumBagSize;
      },

      dumpTile(tileId) {
        try {
          const { rack, bag, rngSeed } = get();
          if (!get().canDump()) return;

          // Validate tile ID
          const validTileId = validateTileId(tileId);
          if (!validTileId) {
            console.warn("Invalid tile ID for dump:", tileId);
            return;
          }

          // Find and remove the tile from rack
          const idx = rack.findIndex(t => t.id === validTileId);
          if (idx === -1) {
            console.warn("Tile not found in rack for dump:", validTileId);
            return;
          }

          // Add dump penalty first
          get().addDumpPenalty();

          // Safely remove tile from rack
          const dumpedTiles = safeArraySplice(rack, idx, 1);
          if (dumpedTiles.length === 0) {
            console.warn("Failed to remove tile from rack for dump");
            return;
          }

          const [dumpedTile] = dumpedTiles;

          // Add dumped tile back to bag
          bag.push(dumpedTile);

          // Shuffle the bag (since we added a tile back)
          const rng = mulberry32(rngSeed);
          for (let i = bag.length - 1; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1));
            [bag[i], bag[j]] = [bag[j], bag[i]];
          }

          // Draw configured number of tiles (or as many as available)
          const drawCount = Math.min(DUMP_CONFIG.tilesPerDump, bag.length);
          const drawn = safeArraySplice(bag, 0, drawCount);

          set({
            rack: [...rack, ...drawn],
            bag: [...bag],
            poolRemaining: bag.length,
            dumpMode: false, // Exit dump mode after dumping
          });

          // Validate after dump
          get().validate();
        } catch (error) {
          console.error("Error dumping tile:", error);
          if (error instanceof Error) {
            errorReporter.reportException(error, {
              component: 'gameStore.dumpTile',
              action: `dumpTile(${tileId})`,
              gameState: getSafeGameState(),
            });
          }
        }
      },

      reset() {
        const { dict } = get();
        // Generate new random seed for each reset
        const newSeed = `game-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        get().init(dict, newSeed);
      },

      // Timer methods
      startGame() {
        try {
          const now = Date.now();
          set({
            gameStartTime: now,
            currentTime: 0,
            dumpPenalties: 0,
            isGameActive: true,
          });
        } catch (error) {
          console.error("Error starting game:", error);
        }
      },

      updateTimer() {
        try {
          const { gameStartTime, isGameActive } = get();
          
          if (!isGameActive || !gameStartTime) {
            return;
          }

          const now = Date.now();
          const elapsed = Math.floor((now - gameStartTime) / 1000);
          
          set({ currentTime: elapsed });
        } catch (error) {
          console.error("Error updating timer:", error);
        }
      },

      endGame() {
        try {
          set({
            isGameActive: false,
            gameWon: true,
          });
        } catch (error) {
          console.error("Error ending game:", error);
        }
      },

      addDumpPenalty() {
        try {
          const { dumpPenalties } = get();
          set({
            dumpPenalties: dumpPenalties + TIMED_GAME_CONFIG.dumpTimePenalty,
          });
        } catch (error) {
          console.error("Error adding dump penalty:", error);
        }
      },

      getTotalTime() {
        try {
          const { currentTime, dumpPenalties } = get();
          return currentTime + dumpPenalties;
        } catch (error) {
          console.error("Error calculating total time:", error);
          return 0;
        }
      },

      getShareableResult() {
        try {
          const { board, gameWon } = get();
          
          if (!gameWon || Object.keys(board).length === 0) {
            return null;
          }

          // Find bounding box of the board
          const coords = Object.keys(board).map(k => {
            const [x, y] = k.split(',').map(Number);
            return { x, y };
          });

          if (coords.length === 0) return null;

          const minX = Math.min(...coords.map(c => c.x));
          const maxX = Math.max(...coords.map(c => c.x));
          const minY = Math.min(...coords.map(c => c.y));
          const maxY = Math.max(...coords.map(c => c.y));

          const width = maxX - minX + 1;
          const height = maxY - minY + 1;

          // Build grid string
          let grid = '';
          for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
              const tile = board[key(x, y)];
              grid += tile ? tile.letter : '.';
            }
          }

          // For now, use placeholder values - in the future this will come from user auth and daily puzzle system
          const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
          const username = 'Player'; // Placeholder - will be replaced with actual user system
          
          return {
            username,
            date: today,
            width,
            height,
            grid,
            time: get().getTotalTime()
          };
        } catch (error) {
          console.error("Error creating shareable result:", error);
          return null;
        }
      },
    }),
    {
      name: "ss-local",
      version: 1,
      migrate: (persistedState: unknown) => {
        // Type guard for persisted state
        if (!persistedState || typeof persistedState !== "object") {
          return persistedState;
        }

        const state = persistedState as Record<string, unknown>;

        // Migrate old peelDraw to drawAmount
        if (state.rules && typeof state.rules === "object" && "peelDraw" in state.rules) {
          const rules = state.rules as Record<string, unknown>;
          rules.drawAmount = rules.peelDraw || 2;
          delete rules.peelDraw;
        }
        // Ensure drawAmount exists
        if (state.rules && typeof state.rules === "object" && !("drawAmount" in state.rules)) {
          (state.rules as Record<string, unknown>).drawAmount = 2;
        }
        return state;
      },
    }
  )
);
