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

## Engineering Best Practices

### Code Quality Standards

#### **Testing Requirements**
- **Minimum 80% test coverage** on all core game logic (`packages/shared/src/`)
- **Unit tests required** for all pure functions before PR approval
- **Integration tests required** for state management and component interactions
- **Use deterministic testing** with seeded RNG for reproducible results
- **Test edge cases**: empty states, boundary conditions, invalid inputs

#### **Type Safety Standards**
- **Zero `any` types allowed** - use proper TypeScript typing throughout
- **Runtime validation required** at all external boundaries using Zod schemas
- **Strict TypeScript configuration** with `strict: true`, `noImplicitAny: true`
- **Type guards required** for external data (localStorage, API responses)
- **Event handlers must be properly typed** - no generic `any` parameters

#### **Error Handling Requirements**
- **React Error Boundaries** required around all major component trees
- **Input validation mandatory** for all user actions and state transitions
- **Graceful degradation** - app should never crash from user input
- **Error logging** for all caught exceptions
- **Recovery mechanisms** for corrupted state

#### **Performance Standards**
- **No unnecessary re-renders** - use `useCallback`, `useMemo` appropriately
- **Debounce expensive operations** (validation should not exceed 60fps)
- **Batch state updates** - avoid multiple sequential state changes
- **Conditional rendering** for expensive UI elements (shadows, animations)
- **Event handler stability** - avoid recreation on every render

#### **State Management Patterns**
- **Immutable state updates** - always spread objects and arrays
- **Single source of truth** - avoid duplicating state across components
- **Validation after state changes** - ensure consistency
- **Predictable state transitions** - document and test all state changes
- **Persistence validation** - validate all data loaded from localStorage

### Architecture Guidelines

#### **Component Design Principles**
- **Single Responsibility** - components should have one clear purpose
- **Separation of Concerns** - separate rendering, logic, and state management
- **Composition over Inheritance** - use hooks and composition patterns
- **Props validation** - validate all component props with TypeScript and runtime checks
- **Event handling separation** - extract complex event logic to custom hooks

#### **Module Organization**
- **Domain-driven structure** - organize by business domain, not technical layer
- **Clean import paths** - use absolute imports and proper module boundaries
- **Shared logic in `@ss/shared`** - no business logic duplication between packages
- **Configuration centralization** - all constants in centralized config files
- **Dependency direction** - UI depends on domain, never the reverse

#### **State Architecture Patterns**
- **Command Query Separation** - separate read and write operations
- **Event-driven updates** - use events for complex state coordination
- **Optimistic updates** with rollback for better UX
- **State machines** for complex workflows (game states, timer states)
- **Immutable data structures** for predictable updates

### Security & Reliability

#### **Input Validation**
- **Sanitize all user-displayable content** - prevent XSS attacks
- **Validate coordinates** before board operations - prevent out-of-bounds errors
- **Check array bounds** before splice/access operations
- **Validate tile IDs** exist before operations
- **Escape localStorage data** before use

#### **Error Recovery**
- **Graceful fallbacks** for all external dependencies (dictionary loading)
- **State corruption detection** and automatic recovery
- **Network error handling** with retry mechanisms
- **User feedback** for all error states
- **Diagnostic information** for debugging without exposing internals

### Development Workflow

#### **Code Review Requirements**
- **All code must be reviewed** before merging to main branch
- **Tests must pass** and coverage must not decrease
- **Performance impact** must be assessed for UI changes
- **Type safety** must be maintained - no new `any` types
- **Documentation updates** required for API changes

#### **Git Commit Standards**
- **Atomic commits** - one logical change per commit
- **Descriptive commit messages** with context and reasoning
- **Reference issues/tickets** in commit messages
- **Squash feature branches** before merging to main
- **Never commit secrets** or sensitive configuration

#### **Documentation Requirements**
- **JSDoc comments** required for all public APIs
- **README updates** for significant architectural changes
- **ADRs (Architecture Decision Records)** for major technical decisions  
- **Component prop documentation** for complex components
- **Setup and deployment guides** must be kept current

### Performance Guidelines

#### **Rendering Optimization**
- **Minimize React re-renders** - use React DevTools Profiler to identify issues
- **Virtualization** for large lists (future tile history, word lists)
- **Memoization** for expensive calculations (word validation, scoring)
- **Lazy loading** for non-critical components
- **Bundle size monitoring** - track and optimize JavaScript bundle size

#### **State Management Performance**
- **Selective subscriptions** - components should only subscribe to needed state
- **Derived state computation** should be memoized
- **Background processing** for non-critical operations
- **Debounced side effects** to prevent excessive API calls
- **Efficient data structures** for large datasets (Sets for lookups)

#### **Canvas Performance (react-konva)**
- **Layer optimization** - use appropriate Konva layers for different element types  
- **Conditional rendering** - only render visible elements
- **Event delegation** - minimize individual element event handlers
- **Animation performance** - use requestAnimationFrame for smooth animations
- **Memory management** - properly dispose of Konva objects

### Testing Strategy

#### **Test Categories**
1. **Unit Tests**: Pure functions, utilities, business logic
2. **Integration Tests**: Component interactions, state management
3. **E2E Tests**: Complete user workflows, game scenarios
4. **Performance Tests**: Rendering performance, memory usage
5. **Visual Regression Tests**: UI consistency across changes

#### **Test Data Management**
- **Deterministic data** - use seeded RNG for reproducible tests
- **Test fixtures** - standardized data sets for common scenarios
- **Mock external dependencies** - dictionary loading, localStorage
- **Edge case coverage** - test boundary conditions and error states
- **Performance assertions** - test rendering and update performance

## Current Development Phase

**Status**: Visual polish complete ✅ → **NEXT**: Engineering foundation
**Priority**: Fix code quality issues before adding timed gameplay features
**Target**: Build reliable, maintainable foundation for future feature development

See TODO.md for detailed implementation roadmap and current task priorities.