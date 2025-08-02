import React, { useEffect, useState } from "react";
import { useGame } from "../state/gameStore";
import { LETTER_VALUES } from "@ss/shared";

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
    <div style={{ 
      position: "absolute", 
      bottom: 0, 
      left: 0, 
      right: 320, 
      padding: 16, 
      background: "linear-gradient(to bottom, #8B6B47, #6D5437)", 
      borderTop: "2px solid #5A4529",
      boxShadow: "inset 0 2px 8px rgba(0, 0, 0, 0.3)"
    }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        {rack.map(t => {
          const letterValue = LETTER_VALUES[t.letter as keyof typeof LETTER_VALUES];
          const isAnimating = animatingTiles.has(t.id);
          
          return (
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
                width: 44, 
                height: 44, 
                border: "none",
                borderRadius: "6px",
                background: isAnimating ? "#C8E6C9" :
                           dumpMode ? "#FFCDD2" : 
                           "#FAF8F3",
                boxShadow: isAnimating ? "0 6px 20px rgba(76, 175, 80, 0.4)" :
                          dumpMode ? "0 4px 12px rgba(244, 67, 54, 0.3)" :
                          "0 4px 8px rgba(0, 0, 0, 0.2)",
                transform: isAnimating ? "scale(1.15) translateY(-2px)" : 
                          dumpMode ? "scale(1.05)" : "scale(1)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: "pointer",
                position: "relative",
                fontFamily: "Georgia, serif",
                fontSize: "20px",
                fontWeight: "bold",
                color: "#3E2723",
                outline: "none"
              }}
              onMouseEnter={(e) => {
                if (!isAnimating && !dumpMode) {
                  e.currentTarget.style.transform = "scale(1.05) translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 6px 12px rgba(0, 0, 0, 0.25)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isAnimating && !dumpMode) {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
                }
              }}
            >
              <div style={{ position: "relative", width: "100%", height: "100%" }}>
                <span style={{ 
                  position: "absolute", 
                  top: "50%", 
                  left: "50%", 
                  transform: "translate(-50%, -60%)",
                  lineHeight: "1"
                }}>
                  {t.letter}
                </span>
                <span style={{ 
                  position: "absolute", 
                  bottom: "2px", 
                  right: "4px", 
                  fontSize: "8px", 
                  color: "#8B6B47",
                  fontFamily: "Arial, sans-serif",
                  fontWeight: "normal"
                }}>
                  {letterValue}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
