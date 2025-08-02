import React, { useEffect, useState } from "react";
import { useGame } from "../state/gameStore";

export default function TileRack() {
  const rack = useGame(s => s.rack);
  const placeTile = useGame(s => s.placeTile);
  const cursor = useGame(s => s.cursor);
  const justDrew = useGame(s => s.justDrew);
  const dumpMode = useGame(s => s.dumpMode);
  const dumpTile = useGame(s => s.dumpTile);
  const [animatingTiles, setAnimatingTiles] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    if (justDrew && rack.length >= 2) {
      // Animate the last 2 tiles that were drawn
      const newTileIds = rack.slice(-2).map(t => t.id);
      setAnimatingTiles(new Set(newTileIds));
      
      // Remove animation after delay
      setTimeout(() => {
        setAnimatingTiles(new Set());
      }, 600);
    }
  }, [justDrew, rack]);

  return (
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 320, padding: 12, background: "#fafafa", borderTop: "1px solid #ddd" }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {rack.map(t => (
          <button
            key={t.id}
            onClick={() => {
              if (dumpMode) {
                dumpTile(t.id);
              } else {
                placeTile(t.id, cursor.pos.x, cursor.pos.y);
              }
            }}
            style={{ 
              width: 40, 
              height: 40, 
              border: animatingTiles.has(t.id) ? "3px solid #4a7" : 
                      dumpMode ? "2px solid #f44" : "1px solid #333", 
              background: animatingTiles.has(t.id) ? "#e8f5e9" : 
                         dumpMode ? "#fee" : "white",
              transform: animatingTiles.has(t.id) ? "scale(1.2)" : 
                        dumpMode ? "scale(1.05)" : "scale(1)",
              transition: "all 0.3s ease",
              boxShadow: animatingTiles.has(t.id) ? "0 0 15px rgba(76, 175, 80, 0.6)" : 
                        dumpMode ? "0 0 8px rgba(255, 68, 68, 0.3)" : "none",
              cursor: dumpMode ? "pointer" : "pointer"
            }}
          >
            {t.letter}
          </button>
        ))}
      </div>
    </div>
  );
}
