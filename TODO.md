# Speed Scrabble - Production Readiness TODO

## 🚨 P0: Critical Issues (Must fix before production)

### TypeScript Strict Mode ✅ COMPLETED
- [x] Enable `"strict": true` in both tsconfig.json files
- [x] Fix all resulting type errors from strict mode
- [x] Enable `"strictNullChecks": true` specifically
- [x] Enable `"strictFunctionTypes": true` specifically
- [x] Remove all uses of `any` type (replaced with proper `unknown` typing)

### Schema/Type Alignment ✅ COMPLETED
- [x] Update `schemas.ts` to use `drawAmount` instead of `peelDraw`
- [x] Add Zod schemas for GameRules, TimedGameRules, BaseRules types
- [x] Add schema validation for all new game mode types
- [x] Ensure runtime validation matches TypeScript types exactly

### Error Boundaries
- [ ] Wrap BoardCanvas component with error boundary
- [ ] Wrap TileRack component with error boundary
- [ ] Wrap Controls component with error boundary
- [ ] Add error logging/reporting to error boundaries
- [ ] Create user-friendly error recovery UI

### Critical Bug Fixes
- [ ] Fix silent failures in placeTile() - should notify user on error
- [ ] Fix silent failures in removeTile() - should notify user on error
- [ ] Add proper error recovery mechanisms throughout gameStore
- [ ] Fix missing bounds checking for grid coordinates
- [ ] Validate tile IDs before all array operations

## 🔧 P1: Architecture & Performance (Fix before scaling)

### State Management Refactor
- [ ] Split gameStore.ts into focused stores:
  - [ ] `useGameStore` - board, tiles, validation only
  - [ ] `useTimerStore` - timer, penalties, game duration
  - [ ] `useUIStore` - cursor, modes, UI state
  - [ ] `useShareStore` - share functionality
- [ ] Remove cross-store dependencies
- [ ] Implement proper event system for store communication

### Data Structure Optimization
- [ ] Replace string-based board keys with proper data structure:
  ```typescript
  // Current: board["x,y"]
  // Better: board.get(hash(x,y)) or board[x][y]
  ```
- [ ] Implement coordinate hashing function for O(1) lookups
- [ ] Consider using Map or 2D array instead of object
- [ ] Cache coordinate parsing results

### Algorithm Improvements
- [ ] Optimize extractWords() to avoid O(n²) behavior:
  - [ ] Cache word boundaries
  - [ ] Update incrementally on tile placement/removal
  - [ ] Use spatial indexing for word detection
- [ ] Optimize isConnected() BFS:
  - [ ] Only run when tiles added/removed
  - [ ] Cache connectivity state
  - [ ] Use union-find for faster connectivity checks

### Performance Optimizations
- [ ] Add React.memo to PlacedTileComponent
- [ ] Memoize tiles array in BoardCanvas (currently recreated every render)
- [ ] Implement virtual scrolling for large boards
- [ ] Use Web Workers for validation on large boards
- [ ] Add proper useCallback for all event handlers

## 🏗️ P2: Code Quality & Best Practices

### Configuration Management
- [ ] Create `packages/shared/src/config/` directory with:
  - [ ] `gameConfig.ts` - game rules, tile distribution
  - [ ] `uiConfig.ts` - sizes, colors, animations
  - [ ] `performanceConfig.ts` - debounce times, limits
- [ ] Remove all magic numbers/strings:
  - [ ] `window.innerWidth - 320` → UI_CONFIG.SIDEBAR_WIDTH
  - [ ] Animation durations → ANIMATION_CONFIG
  - [ ] Grid sizes → GRID_CONFIG

### Input Validation
- [ ] Create validation middleware for all user inputs
- [ ] Add coordinate bounds checking everywhere
- [ ] Validate all tile operations before execution
- [ ] Add validation for localStorage data on load
- [ ] Create comprehensive error types:
  ```typescript
  class GameError extends Error {
    constructor(message: string, code: string, recoverable: boolean)
  }
  ```

### Test Coverage
- [ ] Add component tests for:
  - [ ] BoardCanvas interactions
  - [ ] TileRack drag/drop
  - [ ] Keyboard navigation
  - [ ] Timer functionality
- [ ] Add integration tests for:
  - [ ] Complete game flow
  - [ ] State persistence
  - [ ] Error recovery
- [ ] Add performance tests:
  - [ ] Large board stress test
  - [ ] Rapid tile placement test
  - [ ] Memory leak detection

## 🚀 P3: Production Infrastructure

### Security
- [ ] Add Content Security Policy headers
- [ ] Implement localStorage encryption/signing
- [ ] Add XSS protection for user content
- [ ] Sanitize all displayed text
- [ ] Add rate limiting for actions

### Build & Deployment
- [ ] Set up environment configuration:
  - [ ] `.env.development`
  - [ ] `.env.production`
  - [ ] `.env.staging`
- [ ] Configure production build optimizations:
  - [ ] Code splitting by route
  - [ ] Tree shaking unused code
  - [ ] Asset optimization
- [ ] Add error monitoring (Sentry)
- [ ] Add analytics (privacy-friendly)

### Browser Support
- [ ] Add polyfills for older browsers
- [ ] Add feature detection for:
  - [ ] Canvas API
  - [ ] Konva compatibility
  - [ ] LocalStorage availability
- [ ] Add proper viewport meta tags
- [ ] Test on major browsers (Chrome, Firefox, Safari, Edge)

### Performance Monitoring
- [ ] Add performance metrics collection
- [ ] Monitor render performance
- [ ] Track memory usage
- [ ] Add user timing API integration
- [ ] Create performance dashboard

## 📋 Nice to Have (Post-launch)

### Developer Experience
- [ ] Add Storybook for component documentation
- [ ] Create development style guide
- [ ] Add visual regression testing
- [ ] Implement E2E tests with Playwright
- [ ] Add commit message validation

### Advanced Features
- [ ] Implement undo/redo system
- [ ] Add game replay functionality
- [ ] Create tutorial mode
- [ ] Add accessibility features (screen reader support)
- [ ] Implement offline mode with service worker

### Code Documentation
- [ ] Add JSDoc to all public APIs
- [ ] Create architecture diagrams
- [ ] Write ADRs for major decisions
- [ ] Document performance optimizations
- [ ] Create troubleshooting guide

## 🎯 Priority Order for Production

### Week 1: Critical Fixes
1. Enable TypeScript strict mode and fix errors
2. Add comprehensive error boundaries
3. Fix schema/type mismatches
4. Add proper error handling to all operations

### Week 2: Architecture
1. Refactor state management into focused stores
2. Optimize data structures (board representation)
3. Improve algorithm performance
4. Add proper memoization

### Week 3: Production Ready
1. Set up build configuration
2. Add security headers
3. Configure monitoring
4. Performance testing

### Success Metrics
- [ ] Zero unhandled errors in production
- [ ] <100ms validation time for full board
- [ ] <16ms render time (60fps)
- [ ] 90%+ test coverage
- [ ] Zero TypeScript errors with strict mode