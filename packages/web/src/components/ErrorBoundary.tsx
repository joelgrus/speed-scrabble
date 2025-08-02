import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
    
    // In production, you might want to send error to logging service
    if (process.env.NODE_ENV === 'production') {
      // Example: logErrorToService(error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI
      return (
        <div style={{
          padding: '20px',
          margin: '20px',
          border: '2px solid #DC143C',
          borderRadius: '8px',
          backgroundColor: '#FFE4E1',
          textAlign: 'center',
          fontFamily: 'Arial, sans-serif'
        }}>
          <h2 style={{ color: '#DC143C', margin: '0 0 10px 0' }}>
            🚨 Something went wrong
          </h2>
          <p style={{ color: '#3E2723', margin: '0 0 15px 0' }}>
            The game encountered an unexpected error. Please try refreshing the page.
          </p>
          <details style={{ textAlign: 'left', marginTop: '15px' }}>
            <summary style={{ cursor: 'pointer', color: '#8B6B47' }}>
              Technical Details (click to expand)
            </summary>
            <pre style={{
              background: '#f5f5f5',
              padding: '10px',
              borderRadius: '4px',
              fontSize: '12px',
              overflow: 'auto',
              marginTop: '10px'
            }}>
              {this.state.error?.message}
              {'\n'}
              {this.state.error?.stack}
            </pre>
          </details>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '15px',
              padding: '10px 20px',
              backgroundColor: '#8B6B47',
              color: '#FAF8F3',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            🔄 Refresh Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}