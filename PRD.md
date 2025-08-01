# PRD — **Speed Scrabble Online** (Local-first → Multiplayer)

## 1) Vision & Goals

Build a **fast**, **fair**, **beginner-friendly** Speed Scrabble you can share via a link. Focus MVP on **desktop single-player**, then add **2–4 player rooms** with spectators. Keep costs near-zero.

**Primary goals**

* Frictionless **tile placement**, **rearrangement**, and **validation**.
* Clean, latency-fair **peel** flow (for multiplayer phase).
* **Local-first** MVP that’s fun on its own and doubles as the UI foundation.

**Non-goals (v0.1)**

* Public matchmaking, rankings, moderation, deep authentication.

---

## 2) Rules (defaults, configurable later)

* **Tiles:** Standard English Scrabble distribution **without blanks** (MVP).
* **Start:** Draw **7**.
* **Peel:** When your rack is empty and your grid is valid, hit **Peel** ⇒ draw **2**.
* **Dump (later toggle):** Trade 1 tile, draw +3 penalty.
* **End:** Pool can’t satisfy next peel; first valid finisher wins.
* **Dictionary:** Start with a permissive open list (see §7 Data).
* **Scoring (tracking only):** For non-winners, compute letter-score totals and show in post-game history (for multi-game sessions).

---

## 3) Target Users / Sessions

* **Solo practice / time trial** (optimize first).
* **Friends/family rooms** (2–4 players), plus **spectators** who see status during play and full boards at reveal.

---

## 4) Success Metrics

* **Flow:** Median tile place/move < 400 ms on a mid-range laptop.
* **Validation feel:** < 120 ms from drop/stamp to underline feedback (local / debounced).
* **First-session retention:** ≥ 50% start a second round in the same session.
* **Cost:** Able to host multiplayer on a single tiny instance (≤ \$5–10/mo) at small scale.

---

## 5) UX & Interaction

**Canvas & controls (desktop first)**

* **react-konva** grid with snapping (faint cells).
* Two modes:

  * **Drag mode**: drag tiles/words; snap on drop.
  * **Type mode**: arrow keys move a cursor; **H/V** toggles orientation; typing consumes rack in order; **Backspace** removes last typed; **Enter** stamps.
* **Select word as a block**: **Shift+click** (desktop) / **long-press** (mobile later).
* **Staging tray** above rack to park letters while reworking.
* **Validation feedback**: subtle red underlines on invalid words (per-word, not per-tile boxouts).
* **Peel button** lights only when: rack empty **and** zero invalid words.
* **Opponent visibility (multiplayer)**: right rail shows name, tiles placed / total drawn, last peel time. Boards remain private until reveal.

**Keyboard shortcuts**

* **Space** toggle Drag/Type • **Arrows** move cursor • **H/V** orientation
* **Enter** stamp • **Backspace** undo last letter in active word
* **Shift+drag** select word block • **P** Peel (if eligible) • **D** Dump (if enabled)

**Accessibility**

* Color+icon (✓/!) for color-blind support; labels on controls; scalable UI.

---

## 6) Technology Choices (beginner-friendly)

**Frontend**

* **React + TypeScript + Vite**
* **react-konva (KonvaJS)** for canvas
* **Zustand** for local state (lightweight)
* **Zod** for shared schemas & runtime validation
* (Later) **Socket.IO client** for realtime
* (Optional) **React Query** for non-WS calls (e.g., session history)

**Backend (multiplayer phase)**

* **Node.js + TypeScript**
* **Fastify** (HTTP) + **Socket.IO** (realtime)
* **Zod** shared between client/server
* **In-memory** room store for single-instance; **Redis** later for multi-instance
* **Seeded PRNG** per room for fair, reproducible shuffles

**Hosting (cheap)**

* **Local-first MVP**: static site—no server needed.
* **Multiplayer**: one small VM/container (e.g., any low-cost host). Scale to Redis only when needed.

---

## 7) Data & Game Logic

**Tile distribution (English, no blanks)**
(98 tiles; you can paste as a constant)

```
E×12; A×9; I×9; O×8; N×6; R×6; T×6; L×4; S×4; U×4; D×4; G×3;
B×2; C×2; M×2; P×2; F×2; H×2; V×2; W×2; Y×2;
K×1; J×1; X×1; Q×1; Z×1
```

**Letter scores** (for loser-points tracking later; standard Scrabble scores).

**Dictionary (MVP)**

* Start with a permissive, open list: e.g., an MIT/CC-licensed **word list** filtered to:

  * UPPERCASE A–Z only
  * length ≥ 2
  * optional “no proper nouns” heuristic (reject capitalized-only entries if your source marks them)
* Load into memory as `Set<string>` for O(1) lookups. Later, add **SOWPODS/TWL** options.

**Board model (sparse)**

```ts
type Coord = { x: number; y: number };              // integers, (0,0) arbitrary
type PlacedTile = { id: string; letter: string; x: number; y: number };
type Board = Record<string /* `${x},${y}` */, PlacedTile>;
```

**Word extraction (server or local)**

* Scan **rows** then **cols**:

  1. For each placed tile, if left/up neighbor absent ⇒ start of a word.
  2. Walk forward until gap; collect letters; if length ≥ 2, emit.
* Validate: every formed word ∈ dictionary; otherwise return the word’s coordinates to underline.

**Peel fairness (multiplayer)**

* Server is authoritative for the **tile bag**.
* On `peel/request` from a player with empty rack and valid grid, server broadcasts **`peel/scheduled { resolveAt = now+500ms }`**.
* All clients draw exactly at `resolveAt` (guards against latency races).

**Session history**

* Keep an in-memory array of results (winner, finish time, total letters placed, loser points). Persist to localStorage (solo) or server memory (room).

---

## 8) Architecture (evolution)

**Phase A — Local-first (no backend)**

```
React (Konva, Zustand, Zod)
 ├─ Tile bag, RNG in browser
 ├─ Local validator (Set-based)
 └─ Local session history (localStorage)
```

**Phase B — Realtime multiplayer (single instance)**

```
React client ── Socket.IO ──> Fastify/Node (authoritative engine)
  ▲    ▲                          ├─ In-memory rooms
  │    └─ Zod schemas             └─ Word list loaded in memory
  └─ Static hosting
```

**Phase C — Scale (if needed)**

```
Node instances behind LB ─ Redis (rooms, pub/sub, rate limits)
```

---

## 9) Implementation Roadmap (with milestones)

### **Milestone 0 — Repo & Foundations (0.5–1 day)**

* Monorepo (`pnpm` workspaces): `/web`, `/shared`
* `/shared`: Zod schemas for tiles, board, rules, validation response
* `/web`: React+TS+Vite, Zustand store, Konva stage with pan/zoom grid
* Add a tiny open word list, pre-processed during build

**Deliverable:** App boots; shows rack + empty grid.

---

### **Milestone 1 — Single-Player Core (3–5 days)**

* **Tile bag & rack**: build bag from distribution; draw start=7; peel draws=2
* **Drag mode** with snapping; **Type mode** with H/V, cursor, Enter, Backspace
* **Word extraction & validation** (local): underline invalid words; block Peel until valid
* **Peel flow** (local): deal 2, animate to rack; pool exhaustion → finish state
* **Post-game modal**: total time, words formed, letter score for grid, “Play again”

**Deliverable:** Fully playable **solo** Speed Scrabble in browser.

---

### **Milestone 2 — UX Polish for Speed (2–3 days)**

* **Select word as block** (Shift+click) and drag
* **Staging tray** for temporary parking
* **Ghost alignment hints** (green/red) when dragging near existing letters
* **Keyboard tweaks** (Space toggle, P Peel)
* Robust **undo** of last stamped word in Type mode

**Deliverable:** Fast, comfortable solo experience.

---

### **Milestone 3 — Roomed Multiplayer (5–8 days)**

* Add `/server` (Fastify + Socket.IO + Zod)
* **Rooms**: create/join/start; guest nicknames; simple invite link
* **Authoritative tile bag & seeded RNG** per room
* **Realtime validation**: server stores each player’s board (diffs or snapshots) and returns per-word invalids
* **Peel fairness**: `peel/request` → `peel/scheduled { resolveAt }` → clients draw at timestamp
* **End condition & reveal**: winner name, timestamp; reveal frozen boards; compute **loser points** and append to room’s session history
* **Spectators**: can join read-only; see status bars during play; full reveal at end

**Deliverable:** 2–4 players + spectators can complete a game with fair peel.

---

### **Milestone 4 — Options & Backlog (2–5 days, pick items)**

* **Dump** rule toggle (+3 penalty), simple UI
* **Room presets** (US/INTL dicts; start=5/7; peel=1/2)
* **Mobile pass**: tap targets, long-press to select word, bottom Peel button
* **Loser-points tracking across games** (simple table)
* **Export/share**: image snapshot of board
* **Basic rate limiting** on server; heartbeat presence; reconnection

---

## 10) Testing Strategy

* **Unit**: word extraction (rows/cols), tile bag counts, seeded RNG reproducibility.
* **Integration**: peel scheduling (simulate latency/jitter), dump penalty logic.
* **UX**: keyboard-only flows; word-block drag; staging tray interactions.
* **Perf**: 2k+ tiles validated/sec locally; debounce 80–120 ms for smoothness.

---

## 11) Risks & Mitigations

* **Dictionary quality/licensing** → start with permissive list; upgrade to curated lists later; make it swappable.
* **Canvas precision (touch)** → desktop first; add mobile pass when you tackle Milestone 4.
* **Cheating (multiplayer)** → server-side authoritative bag + validation; boards private until reveal; keep diffs/audit if needed.

---

## 12) Backlog (explicit work items)

* **Add blanks** (tile distribution, UI for blank letter assignment, validation rules).
* **Mobile UX** (tap-hold selection, bottom controls, zoom affordances).
* **Alternate dictionaries** (SOWPODS/TWL room options).
* **Scoring mode** (winner by points, letter multipliers—optional variant).
* **AI opponent** (later; careful to avoid unfairness—could simulate “peels” on a timer rather than solving).
* **Persistence** (server session history to Redis/Postgres if you want long-term stats).
* **Authentication** (optional: magic-link or OAuth).

---

## 13) Concrete next steps (1–2 days)

1. Scaffold monorepo (`/web`, `/shared`), add Konva grid + rack.
2. Implement tile bag (constant distribution above), local RNG, and start draw=7.
3. Add Type mode + Drag mode; basic validation against local `Set`.
4. Wire local Peel button + end state.

