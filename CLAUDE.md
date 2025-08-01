# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Speed Scrabble - A fast, multiplayer word game built with React, TypeScript, and react-konva. The project is structured as a pnpm monorepo with two packages:
- `@ss/shared`: Core game logic, types, and validation
- `@ss/web`: React frontend with canvas-based game board

## Development Commands

```bash
# Install dependencies (from root)
pnpm install

# Run development server (from root)
cd packages/web && pnpm dev

# Build for production (from packages/web)
pnpm build

# Preview production build (from packages/web)
pnpm preview
```

## Architecture

### Core Game Flow
1. **Tile Bag**: Seeded RNG generates a shuffled bag of tiles from standard Scrabble distribution (no blanks)
2. **Board State**: Sparse representation using coordinate keys (`x,y`) mapping to PlacedTiles
3. **Validation**: Word extraction scans rows and columns, validates against in-memory dictionary Set
4. **State Management**: Zustand store in `gameStore.ts` manages all game state with localStorage persistence

### Key Components
- **BoardCanvas** (`packages/web/src/components/BoardCanvas.tsx`): react-konva canvas for tile placement
- **TileRack** (`packages/web/src/components/TileRack.tsx`): Player's available tiles
- **Controls** (`packages/web/src/components/Controls.tsx`): Game controls (Peel, Reset, etc.)

### Shared Logic (`packages/shared/src/`)
- `types.ts`: Core type definitions (Tile, Board, Rules, etc.)
- `schemas.ts`: Zod schemas for runtime validation
- `bag.ts`: Tile bag creation with standard distribution
- `board.ts`: Board utilities and coordinate helpers
- `validator.ts`: Word extraction and dictionary validation
- `rng.ts`: Seeded random number generation

### State Architecture
The game uses Zustand with the following key state:
- `board`: Sparse board representation
- `rack`: Player's current tiles
- `bag`: Remaining tiles in the bag
- `invalidCells`: Set of coordinates for invalid word tiles
- `cursor`: Type mode cursor position and orientation

### Interaction Modes
1. **Drag Mode**: Mouse-based tile placement with snapping
2. **Type Mode**: Keyboard navigation with H/V orientation, typing consumes rack tiles

## Implementation Status

Currently at Milestone 1 (Single-Player Core) per PRD:
- ✅ Tile bag and rack management
- ✅ Basic board placement and validation
- ✅ Local dictionary validation
- 🚧 Drag/Type modes partially implemented
- 🚧 Peel flow needs completion
- ⏳ Multiplayer infrastructure not started

## Next Steps (from PRD)
1. Complete Type mode implementation with cursor navigation
2. Add Peel button functionality and end-game detection
3. Implement word selection and drag-as-block
4. Add staging tray for temporary tile storage