import React, { Component, ErrorInfo, ReactNode } from "react";
import { errorReporter, getSafeGameState } from "../utils/errorReporting";

interface Props {
  children: ReactNode;
  component: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  fallback?: (error: Error, retry: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  retryCount: number;
}

export default class GameErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Report error with context
    errorReporter.reportError(error, errorInfo, {
      component: this.props.component,
      gameState: getSafeGameState(),
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  retry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        retryCount: prevState.retryCount + 1,
      }));
    } else {
      // Too many retries, force page refresh
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.retry);
      }

      // Default fallback UI based on component type
      return this.getDefaultFallback();
    }

    return this.props.children;
  }

  private getDefaultFallback(): ReactNode {
    const { component } = this.props;
    const { error, retryCount } = this.state;
    const canRetry = retryCount < this.maxRetries;

    const commonStyles = {
      padding: "20px",
      margin: "10px",
      border: "2px solid #DC143C",
      borderRadius: "8px",
      backgroundColor: "#FFE4E1",
      textAlign: "center" as const,
      fontFamily: "Arial, sans-serif",
    };

    if (component === "BoardCanvas") {
      return (
        <div style={{ ...commonStyles, height: "300px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h3 style={{ color: "#DC143C", margin: "0 0 10px 0" }}>🎯 Game Board Error</h3>
          <p style={{ color: "#3E2723", margin: "0 0 15px 0" }}>
            The game board encountered an error. Your progress is saved.
          </p>
          {canRetry ? (
            <button
              onClick={this.retry}
              style={{
                padding: "10px 20px",
                backgroundColor: "#8B6B47",
                color: "#FAF8F3",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold",
                marginRight: "10px",
              }}
            >
              🔄 Try Again ({this.maxRetries - retryCount} attempts left)
            </button>
          ) : (
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "10px 20px",
                backgroundColor: "#DC143C",
                color: "#FAF8F3",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              🔄 Refresh Game
            </button>
          )}
        </div>
      );
    }

    if (component === "TileRack") {
      return (
        <div style={{ ...commonStyles, minHeight: "100px" }}>
          <h4 style={{ color: "#DC143C", margin: "0 0 10px 0" }}>🎲 Tile Rack Error</h4>
          <p style={{ color: "#3E2723", margin: "0 0 15px 0", fontSize: "14px" }}>
            The tile rack had an issue. You can still play using keyboard controls.
          </p>
          {canRetry && (
            <button
              onClick={this.retry}
              style={{
                padding: "8px 16px",
                backgroundColor: "#8B6B47",
                color: "#FAF8F3",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              🔄 Restore Rack
            </button>
          )}
        </div>
      );
    }

    if (component === "Controls") {
      return (
        <div style={{ ...commonStyles }}>
          <h4 style={{ color: "#DC143C", margin: "0 0 10px 0" }}>⚙️ Controls Error</h4>
          <p style={{ color: "#3E2723", margin: "0 0 15px 0", fontSize: "14px" }}>
            Game controls encountered an error. You can still use keyboard shortcuts.
          </p>
          <div style={{ fontSize: "12px", color: "#8B6B47", marginBottom: "15px" }}>
            <div>• Arrow keys: Move cursor</div>
            <div>• Space: Toggle orientation</div>
            <div>• R: Reset game</div>
          </div>
          {canRetry && (
            <button
              onClick={this.retry}
              style={{
                padding: "8px 16px",
                backgroundColor: "#8B6B47",
                color: "#FAF8F3",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              🔄 Restore Controls
            </button>
          )}
        </div>
      );
    }

    // Generic fallback
    return (
      <div style={commonStyles}>
        <h4 style={{ color: "#DC143C", margin: "0 0 10px 0" }}>⚠️ {component} Error</h4>
        <p style={{ color: "#3E2723", margin: "0 0 15px 0", fontSize: "14px" }}>
          The {component.toLowerCase()} component encountered an error.
        </p>
        <details style={{ textAlign: "left", marginTop: "15px", fontSize: "12px" }}>
          <summary style={{ cursor: "pointer", color: "#8B6B47" }}>
            Error Details (click to expand)
          </summary>
          <pre
            style={{
              background: "#f5f5f5",
              padding: "10px",
              borderRadius: "4px",
              fontSize: "11px",
              overflow: "auto",
              marginTop: "10px",
              maxHeight: "100px",
            }}
          >
            {error?.message}
          </pre>
        </details>
        {canRetry ? (
          <button
            onClick={this.retry}
            style={{
              marginTop: "15px",
              padding: "8px 16px",
              backgroundColor: "#8B6B47",
              color: "#FAF8F3",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            🔄 Try Again
          </button>
        ) : (
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "15px",
              padding: "8px 16px",
              backgroundColor: "#DC143C",
              color: "#FAF8F3",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            🔄 Refresh Game
          </button>
        )}
      </div>
    );
  }
}