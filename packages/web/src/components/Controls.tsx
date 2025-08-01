import React from "react";
import { useGame } from "../state/gameStore";

export default function Controls() {
  const peel = useGame(s => s.peel);
  const canPeel = useGame(s => s.canPeel());
  const pool = useGame(s => s.poolRemaining);
  const reset = useGame(s => s.reset);
  const orientation = useGame(s => s.cursor.orient);

  return (
    <div style={{ padding: 16, borderLeft: "1px solid #eee" }}>
      <h3>Game</h3>
      <p>Pool: {pool}</p>
      <p>Direction: <strong>{orientation === "H" ? "Horizontal →" : "Vertical ↓"}</strong></p>
      <button disabled={!canPeel} onClick={peel} style={{ padding: "8px 12px" }}>
        Peel (draw 2)
      </button>
      <div style={{ marginTop: 12 }}>
        <button onClick={reset}>Reset</button>
      </div>
      <hr/>
      <h4>Controls</h4>
      <p style={{ fontSize: 12, color: "#666" }}>
        <strong>Mouse:</strong> Click grid to move cursor<br/>
        <strong>Arrow keys:</strong> Move cursor<br/>
        <strong>Spacebar:</strong> Toggle direction<br/>
        <strong>Letter keys:</strong> Place tile from rack<br/>
        <strong>Click tiles:</strong> Place at cursor
      </p>
    </div>
  );
}
