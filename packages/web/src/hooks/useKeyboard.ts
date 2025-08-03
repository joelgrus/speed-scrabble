import { useEffect } from "react";
import { useGame } from "../state/gameStore";
import { key } from "@ss/shared";

export function useKeyboard() {
  const setCursor = useGame(s => s.setCursor);
  const cursor = useGame(s => s.cursor);
  const rack = useGame(s => s.rack);
  const board = useGame(s => s.board);
  const placeTile = useGame(s => s.placeTile);
  const removeTile = useGame(s => s.removeTile);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Prevent space and backspace from scrolling the page
      if (e.key === " " || e.key === "Backspace") {
        e.preventDefault();
      }

      // Arrow key navigation
      if (e.key === "ArrowLeft") setCursor({ pos: { x: cursor.pos.x - 1, y: cursor.pos.y } });
      if (e.key === "ArrowRight") setCursor({ pos: { x: cursor.pos.x + 1, y: cursor.pos.y } });
      if (e.key === "ArrowUp") setCursor({ pos: { x: cursor.pos.x, y: cursor.pos.y - 1 } });
      if (e.key === "ArrowDown") setCursor({ pos: { x: cursor.pos.x, y: cursor.pos.y + 1 } });

      // Spacebar to toggle orientation
      if (e.key === " ") {
        setCursor({ orient: cursor.orient === "H" ? "V" : "H" });
      }

      // Backspace to remove tile at cursor or move backwards if empty
      if (e.key === "Backspace") {
        const currentKey = key(cursor.pos.x, cursor.pos.y);
        const hasTileAtCursor = board[currentKey] !== undefined;
        
        if (hasTileAtCursor) {
          // Remove tile at current position
          removeTile(cursor.pos.x, cursor.pos.y);
        } else {
          // Move cursor backwards according to orientation
          if (cursor.orient === "H") {
            setCursor({ pos: { x: cursor.pos.x - 1, y: cursor.pos.y } });
          } else {
            setCursor({ pos: { x: cursor.pos.x, y: cursor.pos.y - 1 } });
          }
        }
      }

      // Letter keys to place tiles
      const letter = e.key.toUpperCase();
      if (letter.length === 1 && letter >= "A" && letter <= "Z") {
        // Find first matching tile in rack
        const tile = rack.find(t => t && t.letter === letter);
        if (tile) {
          placeTile(tile.id, cursor.pos.x, cursor.pos.y);
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cursor.pos.x, cursor.pos.y, cursor.orient, setCursor, rack, board, placeTile, removeTile]);
}
