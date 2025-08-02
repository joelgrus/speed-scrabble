import React, { useEffect, useState } from "react";
import { useGame } from "./state/gameStore";
import BoardCanvas from "./components/BoardCanvas";
import TileRack from "./components/TileRack";
import Controls from "./components/Controls";
import { useKeyboard } from "./hooks/useKeyboard";

export default function App() {
  const init = useGame(s => s.init);
  const validate = useGame(s => s.validate);
  const justDrew = useGame(s => s.justDrew);
  const gameWon = useGame(s => s.gameWon);
  const reset = useGame(s => s.reset);
  const board = useGame(s => s.board);
  const [loaded, setLoaded] = useState(false);
  
  useKeyboard();

  useEffect(() => {
    // Load dictionary and start with random seed
    fetch(new URL("./assets/words.txt", import.meta.url))
      .then(r => r.text())
      .then(txt => {
        const dict = new Set(txt.split(/\r?\n/).map(w => w.trim().toUpperCase()).filter(Boolean));
        // Generate random seed for each game
        const randomSeed = `game-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        init(dict, randomSeed);
        setLoaded(true);
        validate();
      });
  }, [init, validate]);

  if (!loaded) return <div style={{ padding: 24 }}>Loading…</div>;

  return (
    <div style={{ 
      display: "grid", 
      gridTemplateColumns: "1fr 320px", 
      height: "100vh",
      width: "100vw",
      overflow: "hidden",
      margin: 0,
      padding: 0,
      background: "linear-gradient(to bottom, #1A4D1A, #0D2D0D)",
      fontFamily: "Arial, sans-serif"
    }}>
      <div style={{ position: "relative", overflow: "hidden" }}>
        <BoardCanvas />
        <TileRack />
        {justDrew && (
          <div style={{
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
            textShadow: "2px 2px 4px rgba(0,0,0,0.2)"
          }}>
            🎲 +2 TILES! 🎲
          </div>
        )}
        
        {gameWon && (
          <div style={{
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
            animation: "fadeIn 0.5s ease"
          }}>
            <div style={{
              background: "linear-gradient(to bottom, #FAF8F3, #F5F3EE)",
              borderRadius: 20,
              padding: 50,
              textAlign: "center",
              boxShadow: "0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
              maxWidth: 500,
              border: "2px solid #D4C4B0",
              transform: "scale(1)",
              animation: "victoryPop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)"
            }}>
              <h1 style={{ 
                fontSize: 56, 
                margin: "0 0 20px", 
                color: "#FFD700",
                fontFamily: "Georgia, serif",
                textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                fontWeight: "bold"
              }}>🎉 VICTORY! 🎉</h1>
              <p style={{ 
                fontSize: 28, 
                margin: "0 0 15px",
                color: "#3E2723",
                fontFamily: "Georgia, serif"
              }}>Magnificent!</p>
              <p style={{ 
                fontSize: 20, 
                color: "#8B6B47", 
                margin: "0 0 35px",
                lineHeight: "1.4"
              }}>
                You successfully placed all <strong>{Object.keys(board).length} tiles</strong><br/>
                in a perfect crossword puzzle!
              </p>
              <button 
                onClick={reset}
                style={{
                  padding: "16px 40px",
                  fontSize: 20,
                  background: "linear-gradient(to bottom, #8B6B47, #6D5437)",
                  color: "#FAF8F3",
                  border: "none",
                  borderRadius: 12,
                  cursor: "pointer",
                  fontFamily: "Arial, sans-serif",
                  fontWeight: "bold",
                  boxShadow: "0 6px 15px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 6px 15px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)";
                }}
              >
                🎲 Play Again
              </button>
            </div>
          </div>
        )}
      </div>
      <Controls />
    </div>
  );
}
