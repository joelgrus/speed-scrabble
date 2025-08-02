import React, { useEffect, useState } from "react";
import { useGame } from "./state/gameStore";
import BoardCanvas from "./components/BoardCanvas";
import TileRack from "./components/TileRack";
import Controls from "./components/Controls";
import ErrorBoundary from "./components/ErrorBoundary";
import GameErrorBoundary from "./components/GameErrorBoundary";
import ErrorMonitor from "./components/ErrorMonitor";
import { useKeyboard } from "./hooks/useKeyboard";
import { createShareUrl } from "@ss/shared";
import { errorReporter, getSafeGameState } from "./utils/errorReporting";

export default function App() {
  const init = useGame(s => s.init);
  const validate = useGame(s => s.validate);
  const justDrew = useGame(s => s.justDrew);
  const gameWon = useGame(s => s.gameWon);
  const reset = useGame(s => s.reset);
  const board = useGame(s => s.board);
  const getTotalTime = useGame(s => s.getTotalTime);
  const getShareableResult = useGame(s => s.getShareableResult);
  const [loaded, setLoaded] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  useKeyboard();

  useEffect(() => {
    // Load dictionary and start with random seed
    fetch(new URL("./assets/words.txt", import.meta.url))
      .then(r => r.text())
      .then(txt => {
        const dict = new Set(
          txt
            .split(/\r?\n/)
            .map(w => w.trim().toUpperCase())
            .filter(Boolean)
        );
        // Generate random seed for each game
        const randomSeed = `game-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        init(dict, randomSeed);
        setLoaded(true);
        validate();
      });
  }, [init, validate]);

  const handleShare = async () => {
    const result = getShareableResult();
    if (!result) return;
    
    const url = createShareUrl(result, window.location.origin);
    setShareUrl(url);
    
    try {
      await navigator.clipboard.writeText(url);
    } catch (error) {
      console.warn("Could not copy to clipboard:", error);
    }
  };

  if (!loaded) return <div style={{ padding: 24 }}>Loading…</div>;

  return (
    <ErrorBoundary>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          height: "100vh",
          width: "100vw",
          overflow: "hidden",
          margin: 0,
          padding: 0,
          background: "linear-gradient(to bottom, #1A4D1A, #0D2D0D)",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ position: "relative", overflow: "hidden" }}>
          <GameErrorBoundary component="BoardCanvas">
            <BoardCanvas />
          </GameErrorBoundary>
          <GameErrorBoundary component="TileRack">
            <TileRack />
          </GameErrorBoundary>
          {justDrew && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontSize: 52,
                fontWeight: "bold",
                fontFamily: "Georgia, serif",
                color: "#FFD700",
                background: "linear-gradient(to bottom, #FAF8F3, #F0EDE6)",
                padding: "25px 50px",
                borderRadius: 16,
                border: "2px solid #D4C4B0",
                boxShadow: "0 8px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
                animation: "fadeInOut 1.5s ease",
                pointerEvents: "none",
                textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
              }}
            >
              🎲 +2 TILES! 🎲
            </div>
          )}

          {gameWon && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0, 0, 0, 0.85)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
                animation: "fadeIn 0.5s ease",
              }}
            >
              <div
                style={{
                  background: "linear-gradient(to bottom, #FAF8F3, #F5F3EE)",
                  borderRadius: 20,
                  padding: 50,
                  textAlign: "center",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
                  maxWidth: 500,
                  border: "2px solid #D4C4B0",
                  transform: "scale(1)",
                  animation: "victoryPop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
                }}
              >
                <h1
                  style={{
                    fontSize: 56,
                    margin: "0 0 20px",
                    color: "#FFD700",
                    fontFamily: "Georgia, serif",
                    textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                    fontWeight: "bold",
                  }}
                >
                  🎉 VICTORY! 🎉
                </h1>
                <p
                  style={{
                    fontSize: 28,
                    margin: "0 0 15px",
                    color: "#3E2723",
                    fontFamily: "Georgia, serif",
                  }}
                >
                  Magnificent Speed!
                </p>
                <p
                  style={{
                    fontSize: 20,
                    color: "#8B6B47",
                    margin: "0 0 20px",
                    lineHeight: "1.4",
                  }}
                >
                  You placed all <strong>{Object.keys(board).length} tiles</strong> in a perfect crossword puzzle!
                </p>
                <div
                  style={{
                    fontSize: 36,
                    fontWeight: "bold",
                    color: "#4CAF50",
                    fontFamily: "monospace",
                    marginBottom: "20px",
                    textShadow: "0 0 10px #4CAF5040",
                  }}
                >
                  {(() => {
                    const totalTime = getTotalTime();
                    const minutes = Math.floor(totalTime / 60);
                    const seconds = totalTime % 60;
                    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
                  })()}
                </div>
                <p
                  style={{
                    fontSize: 16,
                    color: "#8B6B47",
                    margin: "0 0 35px",
                    fontStyle: "italic",
                  }}
                >
                  Challenge yourself to beat this time!
                </p>
                {shareUrl && (
                  <div
                    style={{
                      fontSize: 14,
                      color: "#4CAF50",
                      margin: "0 0 20px",
                      fontWeight: "bold",
                    }}
                  >
                    📋 Link copied to clipboard!
                  </div>
                )}
                <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                  <button
                    onClick={handleShare}
                    style={{
                      padding: "16px 32px",
                      fontSize: 18,
                      background: "linear-gradient(to bottom, #4CAF50, #388E3C)",
                      color: "#FAF8F3",
                      border: "none",
                      borderRadius: 12,
                      cursor: "pointer",
                      fontFamily: "Arial, sans-serif",
                      fontWeight: "bold",
                      boxShadow:
                        "0 6px 15px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 8px 20px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 6px 15px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)";
                    }}
                  >
                    📤 Share Result
                  </button>
                  <button
                    onClick={reset}
                    style={{
                      padding: "16px 32px",
                      fontSize: 18,
                      background: "linear-gradient(to bottom, #8B6B47, #6D5437)",
                      color: "#FAF8F3",
                      border: "none",
                      borderRadius: 12,
                      cursor: "pointer",
                      fontFamily: "Arial, sans-serif",
                      fontWeight: "bold",
                      boxShadow:
                        "0 6px 15px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 8px 20px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 6px 15px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)";
                    }}
                  >
                    🎲 Play Again
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <GameErrorBoundary component="Controls">
          <Controls />
        </GameErrorBoundary>
      </div>
      <ErrorMonitor />
    </ErrorBoundary>
  );
}
