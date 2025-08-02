import React from "react";
import { useGame } from "../state/gameStore";

export default function Controls() {
  const pool = useGame(s => s.poolRemaining);
  const reset = useGame(s => s.reset);
  const toggleDumpMode = useGame(s => s.toggleDumpMode);
  const canDump = useGame(s => s.canDump());
  const dumpMode = useGame(s => s.dumpMode);
  const orientation = useGame(s => s.cursor.orient);
  const invalidCells = useGame(s => s.invalidCells);
  const invalidWords = useGame(s => s.invalidWords);
  const connected = useGame(s => s.connected);
  const board = useGame(s => s.board);
  const rack = useGame(s => s.rack);
  const justDrew = useGame(s => s.justDrew);

  return (
    <div style={{ padding: 16, borderLeft: "1px solid #eee" }}>
      <h3>Game</h3>
      <p>Pool: {pool}</p>
      <p>Tiles: {Object.keys(board).length} placed, {rack.length} in rack</p>
      <p>Direction: <strong>{orientation === "H" ? "Horizontal →" : "Vertical ↓"}</strong></p>
      
      {invalidWords.length > 0 || (!connected && Object.keys(board).length > 1) ? (
        <div style={{ color: "#f44", fontSize: 14 }}>
          {invalidWords.length > 0 && (
            <>
              <p>⚠️ Invalid words ({invalidCells.size} tiles):</p>
              <ul style={{ margin: "4px 0", paddingLeft: "16px" }}>
                {invalidWords.map((issue, i) => (
                  <li key={i} style={{ fontSize: 12 }}>"{issue.word}"</li>
                ))}
              </ul>
            </>
          )}
          {!connected && Object.keys(board).length > 1 && (
            <p>⚠️ Tiles must be connected</p>
          )}
        </div>
      ) : Object.keys(board).length > 0 ? (
        <p style={{ color: "#4a7", fontSize: 14 }}>
          ✅ All words valid and connected
        </p>
      ) : null}
      
      {justDrew ? (
        <p style={{ fontSize: 16, color: "#4a7", fontWeight: "bold" }}>
          🎉 Drew 2 tiles!
        </p>
      ) : (
        <p style={{ fontSize: 14, color: "#666", fontStyle: "italic" }}>
          Auto-draws 2 tiles when rack is empty and grid is valid
        </p>
      )}
      
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={reset} style={{ padding: "8px 12px" }}>
          Reset Game
        </button>
        
        <button 
          onClick={toggleDumpMode}
          disabled={!canDump}
          style={{ 
            padding: "8px 12px",
            background: dumpMode ? "#f44" : canDump ? "#fff" : "#eee",
            color: dumpMode ? "#fff" : "#000",
            border: dumpMode ? "1px solid #f44" : "1px solid #ccc",
            cursor: canDump ? "pointer" : "not-allowed"
          }}
        >
          {dumpMode ? "Cancel Dump" : "Dump (1→3)"}
        </button>
      </div>
      
      {dumpMode && (
        <p style={{ fontSize: 13, color: "#f44", marginTop: 8 }}>
          Click a tile in your rack to dump it
        </p>
      )}
      <hr/>
      <h4>Controls</h4>
      <p style={{ fontSize: 12, color: "#666" }}>
        <strong>Place tiles:</strong><br/>
        • Click grid to move cursor<br/>
        • Type letters or click rack tiles<br/>
        • Spacebar: Toggle direction<br/>
        • Arrow keys: Move cursor<br/>
        <br/>
        <strong>Remove tiles:</strong><br/>
        • Backspace at cursor<br/>
        • Right-click on tile<br/>
        • Cmd/Ctrl+click on tile<br/>
        • Touch: Hold tile for 0.5s<br/>
        <br/>
        <strong>Navigate:</strong><br/>
        • Mouse wheel: Zoom in/out<br/>
        • Drag canvas: Pan around
      </p>
    </div>
  );
}
