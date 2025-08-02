import { describe, it, expect, beforeEach, vi } from 'vitest'
import { notificationService } from '../notifications'

describe('NotificationService', () => {
  beforeEach(() => {
    notificationService.clear()
  })

  describe('notify', () => {
    it('should create and store notifications', () => {
      const id = notificationService.notify('info', 'Test Title', 'Test message')
      
      expect(id).toBeDefined()
      
      const notifications = notificationService.getAll()
      expect(notifications).toHaveLength(1)
      
      const notification = notifications[0]
      expect(notification.id).toBe(id)
      expect(notification.type).toBe('info')
      expect(notification.title).toBe('Test Title')
      expect(notification.message).toBe('Test message')
      expect(notification.timestamp).toBeDefined()
    })

    it('should auto-remove notifications with duration', (done) => {
      const id = notificationService.notify('info', 'Test', 'Message', 50)
      
      expect(notificationService.getAll()).toHaveLength(1)
      
      setTimeout(() => {
        expect(notificationService.getAll()).toHaveLength(0)
        done()
      }, 60)
    })

    it('should not auto-remove notifications without duration', (done) => {
      notificationService.notify('info', 'Test', 'Message')
      
      expect(notificationService.getAll()).toHaveLength(1)
      
      setTimeout(() => {
        expect(notificationService.getAll()).toHaveLength(1)
        done()
      }, 50)
    })
  })

  describe('remove', () => {
    it('should remove notification by ID', () => {
      const id1 = notificationService.notify('info', 'Test 1', 'Message 1')
      const id2 = notificationService.notify('warning', 'Test 2', 'Message 2')
      
      expect(notificationService.getAll()).toHaveLength(2)
      
      notificationService.remove(id1)
      
      const remaining = notificationService.getAll()
      expect(remaining).toHaveLength(1)
      expect(remaining[0].id).toBe(id2)
    })

    it('should handle removing non-existent ID gracefully', () => {
      notificationService.notify('info', 'Test', 'Message')
      
      expect(() => {
        notificationService.remove('non-existent-id')
      }).not.toThrow()
      
      expect(notificationService.getAll()).toHaveLength(1)
    })
  })

  describe('clear', () => {
    it('should remove all notifications', () => {
      notificationService.notify('info', 'Test 1', 'Message 1')
      notificationService.notify('error', 'Test 2', 'Message 2')
      notificationService.notify('success', 'Test 3', 'Message 3')
      
      expect(notificationService.getAll()).toHaveLength(3)
      
      notificationService.clear()
      
      expect(notificationService.getAll()).toHaveLength(0)
    })
  })

  describe('convenience methods', () => {
    it('should create error notifications', () => {
      const id = notificationService.error('Error Title', 'Error message')
      
      const notification = notificationService.getAll()[0]
      expect(notification.type).toBe('error')
      expect(notification.title).toBe('Error Title')
      expect(notification.message).toBe('Error message')
      expect(notification.duration).toBe(5000)
    })

    it('should create warning notifications', () => {
      const id = notificationService.warning('Warning Title', 'Warning message')
      
      const notification = notificationService.getAll()[0]
      expect(notification.type).toBe('warning')
      expect(notification.duration).toBe(4000)
    })

    it('should create info notifications', () => {
      const id = notificationService.info('Info Title', 'Info message')
      
      const notification = notificationService.getAll()[0]
      expect(notification.type).toBe('info')
      expect(notification.duration).toBe(3000)
    })

    it('should create success notifications', () => {
      const id = notificationService.success('Success Title', 'Success message')
      
      const notification = notificationService.getAll()[0]
      expect(notification.type).toBe('success')
      expect(notification.duration).toBe(3000)
    })
  })

  describe('subscription', () => {
    it('should notify listeners when notifications change', () => {
      const listener = vi.fn()
      
      const unsubscribe = notificationService.subscribe(listener)
      
      notificationService.notify('info', 'Test', 'Message')
      
      expect(listener).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'info',
            title: 'Test',
            message: 'Message'
          })
        ])
      )
      
      unsubscribe()
    })

    it('should allow unsubscribing from notifications', () => {
      const listener = vi.fn()
      
      const unsubscribe = notificationService.subscribe(listener)
      unsubscribe()
      
      notificationService.notify('info', 'Test', 'Message')
      
      expect(listener).not.toHaveBeenCalled()
    })

    it('should handle listener errors gracefully', () => {
      const badListener = vi.fn().mockImplementation(() => {
        throw new Error('Listener error')
      })
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      notificationService.subscribe(badListener)
      
      expect(() => {
        notificationService.notify('info', 'Test', 'Message')
      }).not.toThrow()
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error in notification listener:',
        expect.any(Error)
      )
      
      consoleSpy.mockRestore()
    })
  })
})