import React from "react";
import { useGame } from "../state/gameStore";

export default function TileRack() {
  const rack = useGame(s => s.rack);
  const placeTile = useGame(s => s.placeTile);
  const cursor = useGame(s => s.cursor);

  return (
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 320, padding: 12, background: "#fafafa", borderTop: "1px solid #ddd" }}>
      <div style={{ display: "flex", gap: 8 }}>
        {rack.map(t => (
          <button
            key={t.id}
            onClick={() => placeTile(t.id, cursor.pos.x, cursor.pos.y)}
            style={{ width: 40, height: 40, border: "1px solid #333", background: "white" }}
          >
            {t.letter}
          </button>
        ))}
      </div>
    </div>
  );
}
