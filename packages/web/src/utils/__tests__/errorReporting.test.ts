import { describe, it, expect, beforeEach, vi } from 'vitest'
import { errorReporter, getSafeGameState } from '../errorReporting'

// Mock console methods
const mockConsole = {
  group: vi.fn(),
  groupEnd: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
}

Object.assign(console, mockConsole)

describe('ErrorReportingService', () => {
  beforeEach(() => {
    errorReporter.clearErrors()
    vi.clearAllMocks()
  })

  describe('reportException', () => {
    it('should capture and store error details', () => {
      const testError = new Error('Test error message')
      
      errorReporter.reportException(testError, {
        component: 'TestComponent',
        action: 'testAction',
      })

      const errors = errorReporter.getRecentErrors()
      expect(errors).toHaveLength(1)
      
      const reportedError = errors[0]
      expect(reportedError.message).toBe('Test error message')
      expect(reportedError.component).toBe('TestComponent')
      expect(reportedError.stack).toBe(testError.stack)
      expect(reportedError.userAgent).toBe(navigator.userAgent)
      expect(reportedError.url).toBe(window.location.href)
      expect(reportedError.timestamp).toBeDefined()
    })

    it('should limit stored errors to max limit', () => {
      // Report more than max errors
      for (let i = 0; i < 60; i++) {
        errorReporter.reportException(new Error(`Error ${i}`), {
          component: 'TestComponent',
        })
      }

      const errors = errorReporter.getRecentErrors()
      expect(errors.length).toBeLessThanOrEqual(50) // maxErrors is 50
      
      // Should keep the most recent errors
      const lastError = errors[errors.length - 1]
      expect(lastError.message).toBe('Error 59')
    })

    it('should log errors to console', () => {
      const testError = new Error('Console test error')
      
      errorReporter.reportException(testError, {
        component: 'ConsoleTestComponent',
      })

      expect(mockConsole.group).toHaveBeenCalledWith('🚨 Game Error in ConsoleTestComponent')
      expect(mockConsole.error).toHaveBeenCalledWith('Error:', 'Console test error')
      expect(mockConsole.groupEnd).toHaveBeenCalled()
    })
  })

  describe('clearErrors', () => {
    it('should clear all stored errors', () => {
      // Add some errors
      errorReporter.reportException(new Error('Error 1'), { component: 'Test' })
      errorReporter.reportException(new Error('Error 2'), { component: 'Test' })
      
      expect(errorReporter.getRecentErrors()).toHaveLength(2)
      
      errorReporter.clearErrors()
      expect(errorReporter.getRecentErrors()).toHaveLength(0)
    })
  })

  describe('getSafeGameState', () => {
    it('should return safe state object without throwing', () => {
      const safeState = getSafeGameState()
      
      expect(safeState).toBeDefined()
      expect(typeof safeState).toBe('object')
      
      // Should have expected properties
      if (typeof safeState === 'object' && safeState !== null && !('error' in safeState)) {
        expect(safeState).toHaveProperty('hasBoard')
        expect(safeState).toHaveProperty('rackSize')
        expect(safeState).toHaveProperty('bagSize')
      }
    })

    it('should handle missing game store gracefully', () => {
      // Remove game store from window if it exists
      const originalStore = (window as any).__GAME_STORE_STATE__
      delete (window as any).__GAME_STORE_STATE__
      
      const safeState = getSafeGameState()
      expect(safeState).toBeDefined()
      
      // Restore original store
      if (originalStore) {
        (window as any).__GAME_STORE_STATE__ = originalStore
      }
    })
  })

  describe('reportError (boundary errors)', () => {
    it('should capture React error boundary information', () => {
      const testError = new Error('Boundary error')
      const errorInfo = {
        componentStack: '\n    in TestComponent\n    in App'
      }
      
      errorReporter.reportError(testError, errorInfo, {
        component: 'BoundaryTestComponent',
        gameState: { test: 'data' }
      })

      const errors = errorReporter.getRecentErrors()
      expect(errors).toHaveLength(1)
      
      const reportedError = errors[0]
      expect(reportedError.component).toBe('BoundaryTestComponent')
      expect(reportedError.gameState).toEqual({ test: 'data' })
    })
  })
})