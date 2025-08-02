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
      padding: 0
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
            fontSize: 48,
            fontWeight: "bold",
            color: "#4a7",
            background: "rgba(255, 255, 255, 0.95)",
            padding: "20px 40px",
            borderRadius: 12,
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            animation: "fadeInOut 1s ease",
            pointerEvents: "none"
          }}>
            +2 TILES!
          </div>
        )}
        
        {gameWon && (
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}>
            <div style={{
              background: "white",
              borderRadius: 16,
              padding: 40,
              textAlign: "center",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              maxWidth: 400
            }}>
              <h1 style={{ fontSize: 48, margin: "0 0 20px", color: "#4a7" }}>🎉 YOU WIN! 🎉</h1>
              <p style={{ fontSize: 24, margin: "0 0 10px" }}>Amazing!</p>
              <p style={{ fontSize: 18, color: "#666", margin: "0 0 30px" }}>
                You placed all {Object.keys(board).length} tiles in a valid crossword!
              </p>
              <button 
                onClick={reset}
                style={{
                  padding: "12px 32px",
                  fontSize: 18,
                  background: "#4a7",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer"
                }}
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
      <Controls />
    </div>
  );
}
