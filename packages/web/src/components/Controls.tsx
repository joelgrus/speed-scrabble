import React, { useMemo } from "react";
import { useGame } from "../state/gameStore";
import Timer from "./Timer";

interface ControlsProps {
  isMobile?: boolean;
}

export default function Controls({ isMobile = false }: ControlsProps) {
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
    <div
      style={{
        padding: isMobile ? 16 : 20,
        borderLeft: isMobile ? "none" : "2px solid #D4C4B0",
        borderTop: isMobile ? "2px solid #D4C4B0" : "none",
        background: "linear-gradient(to bottom, #FAF8F3, #F5F3EE)",
        boxShadow: isMobile 
          ? "inset 0 2px 8px rgba(0, 0, 0, 0.1)" 
          : "inset 2px 0 8px rgba(0, 0, 0, 0.1)",
        height: isMobile ? "120px" : "calc(100vh - 50px)",
        minHeight: isMobile ? "120px" : "auto",
        overflowY: "auto",
        overflowX: "hidden",
        width: isMobile ? "100%" : "auto",
      }}
    >
      {!isMobile && (
        <>
          <h3
            style={{
              margin: "0 0 16px 0",
              color: "#3E2723",
              fontFamily: "Georgia, serif",
              fontSize: "24px",
            }}
          >
            Game
          </h3>
          
          <Timer />
          
          <p style={{ color: "#3E2723", fontSize: "16px", margin: "8px 0" }}>
            Pool: <strong>{pool}</strong>
          </p>
          <p style={{ color: "#3E2723", fontSize: "16px", margin: "8px 0" }}>
            Tiles: <strong>{useMemo(() => Object.keys(board).length, [board])}</strong> placed,{" "}
            <strong>{rack.filter(t => t !== null).length}</strong> in rack
          </p>
          <p style={{ color: "#3E2723", fontSize: "16px", margin: "8px 0" }}>
            Direction:{" "}
            <strong style={{ color: "#8B6B47" }}>
              {orientation === "H" ? "Horizontal →" : "Vertical ↓"}
            </strong>
          </p>
        </>
      )}
      
      {isMobile && (
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          height: "100%",
          padding: isMobile ? "16px 16px 20px 16px" : "0 8px",
        }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Timer compact />
            <span style={{ color: "#3E2723", fontSize: "14px" }}>
              Pool: <strong>{pool}</strong>
            </span>
            <span style={{ color: "#3E2723", fontSize: "14px" }}>
              {orientation === "H" ? "→" : "↓"}
            </span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={reset}
              style={{
                padding: "12px 16px",
                background: "linear-gradient(to bottom, #8B6B47, #6D5437)",
                color: "#FAF8F3",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontFamily: "Arial, sans-serif",
                fontWeight: "bold",
                fontSize: "14px",
                minHeight: "44px",
              }}
            >
              Reset
            </button>
            <button
              onClick={toggleDumpMode}
              disabled={!canDump}
              style={{
                padding: "12px 16px",
                background: dumpMode
                  ? "linear-gradient(to bottom, #DC143C, #B91C3C)"
                  : canDump
                    ? "linear-gradient(to bottom, #FAF8F3, #F0EDE6)"
                    : "linear-gradient(to bottom, #E5E5E5, #D1D1D1)",
                color: dumpMode ? "#FAF8F3" : canDump ? "#3E2723" : "#999",
                border: "none",
                borderRadius: "6px",
                cursor: canDump ? "pointer" : "not-allowed",
                fontFamily: "Arial, sans-serif",
                fontWeight: "bold",
                fontSize: "14px",
                minHeight: "44px",
              }}
            >
              {dumpMode ? "Cancel" : "Dump"}
            </button>
          </div>
        </div>
      )}

      {!isMobile && (
        <div style={{ minHeight: 60, color: "#f44", fontSize: 14 }}>
          {invalidWords.length > 0 || (!connected && Object.keys(board).length > 1) ? (
            <>
              {invalidWords.length > 0 && (
                <>
                  <p>⚠️ Invalid words ({invalidCells.size} tiles):</p>
                  <ul style={{ margin: "4px 0", paddingLeft: "16px" }}>
                    {invalidWords.map((issue, i) => (
                      <li key={i} style={{ fontSize: 12 }}>
                        "{issue.word}"
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {!connected && Object.keys(board).length > 1 && <p>⚠️ Tiles must be connected</p>}
            </>
          ) : Object.keys(board).length > 0 ? (
            <p style={{ color: "#4a7", fontSize: 14 }}>✅ All words valid and connected</p>
          ) : null}
        </div>
      )}

      {!isMobile && (
        <>
          {justDrew ? (
            <p style={{ fontSize: 16, color: "#4a7", fontWeight: "bold" }}>🎉 Drew 2 tiles!</p>
          ) : (
            <p style={{ fontSize: 14, color: "#666", fontStyle: "italic", lineHeight: "1.4" }}>
              Make a single grid of valid words. Use all your tiles to draw two more. 
              Try to finish all tiles as quickly as possible. Dump unusable tiles for a time penalty.
            </p>
          )}

          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <button
              onClick={reset}
              style={{
                padding: "10px 16px",
                background: "linear-gradient(to bottom, #8B6B47, #6D5437)",
                color: "#FAF8F3",
                border: "none",
                borderRadius: "6px",
                boxShadow: "0 3px 6px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                cursor: "pointer",
                fontFamily: "Arial, sans-serif",
                fontWeight: "bold",
                fontSize: "14px",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 4px 8px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 3px 6px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)";
              }}
            >
              Reset Game
            </button>

            <button
              onClick={toggleDumpMode}
              disabled={!canDump}
              style={{
                padding: "10px 16px",
                background: dumpMode
                  ? "linear-gradient(to bottom, #DC143C, #B91C3C)"
                  : canDump
                    ? "linear-gradient(to bottom, #FAF8F3, #F0EDE6)"
                    : "linear-gradient(to bottom, #E5E5E5, #D1D1D1)",
                color: dumpMode ? "#FAF8F3" : canDump ? "#3E2723" : "#999",
                border: "none",
                borderRadius: "6px",
                boxShadow: canDump
                  ? "0 3px 6px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
                  : "0 1px 3px rgba(0, 0, 0, 0.1)",
                cursor: canDump ? "pointer" : "not-allowed",
                fontFamily: "Arial, sans-serif",
                fontWeight: "bold",
                fontSize: "14px",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={e => {
                if (canDump) {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 8px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)";
                }
              }}
              onMouseLeave={e => {
                if (canDump) {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 3px 6px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)";
                }
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
          <hr style={{ border: "none", borderTop: "1px solid #D4C4B0", margin: "20px 0" }} />
          <h4
            style={{
              color: "#3E2723",
              fontFamily: "Georgia, serif",
              fontSize: "20px",
              margin: "0 0 12px 0",
            }}
          >
            Controls
          </h4>
          <p style={{ fontSize: 13, color: "#8B6B47", lineHeight: "1.5" }}>
            <strong>Place tiles:</strong>
            <br />
            • Click grid to move cursor
            <br />
            • Type letters or click rack tiles
            <br />
            • Spacebar: Toggle direction
            <br />
            • Arrow keys: Move cursor
            <br />
            <br />
            <strong>Remove tiles:</strong>
            <br />
            • Backspace at cursor
            <br />
            • Right-click on tile
            <br />
            • Cmd/Ctrl+click on tile
            <br />
            • Touch: Hold tile for 0.5s
            <br />
            <br />
            <strong>Navigate:</strong>
            <br />
            • Mouse wheel: Zoom in/out
            <br />• Drag canvas: Pan around
          </p>
        </>
      )}
    </div>
  );
}
