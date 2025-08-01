import { useEffect } from "react";
import { useGame } from "../state/gameStore";

export function useKeyboard() {
  const setCursor = useGame(s => s.setCursor);
  const cursor = useGame(s => s.cursor);
  const rack = useGame(s => s.rack);
  const placeTile = useGame(s => s.placeTile);
  
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Prevent space from scrolling the page
      if (e.key === " ") {
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
      
      // Letter keys to place tiles
      const letter = e.key.toUpperCase();
      if (letter.length === 1 && letter >= "A" && letter <= "Z") {
        // Find first matching tile in rack
        const tile = rack.find(t => t.letter === letter);
        if (tile) {
          placeTile(tile.id, cursor.pos.x, cursor.pos.y);
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cursor.pos.x, cursor.pos.y, cursor.orient, setCursor, rack, placeTile]);
}
