import type { ErrorInfo } from 'react';

export interface GameError {
  message: string;
  stack?: string;
  component?: string;
  timestamp: string;
  userAgent: string;
  url: string;
  gameState?: unknown;
}

export interface ErrorContext {
  component: string;
  action?: string;
  gameState?: unknown;
}

class ErrorReportingService {
  private errors: GameError[] = [];
  private maxErrors = 50; // Keep last 50 errors in memory

  /**
   * Report an error from an Error Boundary
   */
  reportError(error: Error, errorInfo: ErrorInfo, context?: ErrorContext): void {
    const gameError: GameError = {
      message: error.message,
      stack: error.stack,
      component: context?.component || 'Unknown',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      gameState: context?.gameState,
    };

    this.addError(gameError);
    this.logError(gameError, errorInfo);

    // In production, send to external service
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalService(gameError);
    }
  }

  /**
   * Report a non-boundary error (e.g., from try/catch blocks)
   */
  reportException(error: Error, context?: ErrorContext): void {
    const gameError: GameError = {
      message: error.message,
      stack: error.stack,
      component: context?.component || 'Unknown',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      gameState: context?.gameState,
    };

    this.addError(gameError);
    this.logError(gameError);

    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalService(gameError);
    }
  }

  /**
   * Get recent errors for debugging
   */
  getRecentErrors(): GameError[] {
    return [...this.errors];
  }

  /**
   * Clear error history
   */
  clearErrors(): void {
    this.errors = [];
  }

  private addError(error: GameError): void {
    this.errors.push(error);
    
    // Keep only the most recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }
  }

  private logError(error: GameError, errorInfo?: ErrorInfo): void {
    console.group(`🚨 Game Error in ${error.component}`);
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.info('Component:', error.component);
    console.info('Timestamp:', error.timestamp);
    
    if (errorInfo) {
      console.info('Component Stack:', errorInfo.componentStack);
    }
    
    if (error.gameState) {
      console.info('Game State:', error.gameState);
    }
    
    console.groupEnd();
  }

  private async sendToExternalService(error: GameError): Promise<void> {
    try {
      // Example implementation - replace with your preferred service
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(error),
      // });
      
      // For now, just log that we would send it
      console.info('📤 Would send error to external service:', error.message);
    } catch (sendError) {
      console.warn('Failed to send error to external service:', sendError);
    }
  }
}

// Singleton instance
export const errorReporter = new ErrorReportingService();

// Helper function to get safe game state for error reporting
export function getSafeGameState(): unknown {
  try {
    // Get a subset of game state that's safe to log
    const gameStore = (window as any).__GAME_STORE_STATE__ || {};
    return {
      hasBoard: Boolean(gameStore.board && Object.keys(gameStore.board).length > 0),
      rackSize: gameStore.rack?.length || 0,
      bagSize: gameStore.bag?.length || 0,
      gameWon: Boolean(gameStore.gameWon),
      invalidCells: gameStore.invalidCells?.size || 0,
    };
  } catch (error) {
    return { error: 'Could not capture game state' };
  }
}