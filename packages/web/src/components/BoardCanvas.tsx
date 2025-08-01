import React, { useMemo, useRef, useEffect } from "react";
import { Stage, Layer, Rect, Group, Text } from "react-konva";
import { useGame } from "../state/gameStore";
import { key, PlacedTile } from "@ss/shared";

const CELL = 40;
const GRID_SIZE = 25; // visible span around origin

export default function BoardCanvas() {
  const board = useGame(s => s.board);
  const invalidCells = useGame(s => s.invalidCells);
  const validate = useGame(s => s.validate);
  const cursor = useGame(s => s.cursor);
  const setCursor = useGame(s => s.setCursor);

  // center origin
  const originX = GRID_SIZE * CELL;
  const originY = GRID_SIZE * CELL;

  useEffect(() => {
    // revalidate after any board change (debounced in real code)
    validate();
  }, [board, validate]);

  const tiles = useMemo(() => Object.values(board), [board]);

  const handleGridClick = (e: any) => {
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    const gridX = Math.floor((point.x - originX) / CELL);
    const gridY = Math.floor((point.y - originY) / CELL);
    setCursor({ pos: { x: gridX, y: gridY } });
  };

  return (
    <Stage 
      width={window.innerWidth - 320} 
      height={window.innerHeight - 120}
      onClick={handleGridClick}
    >
      <Layer>
        {/* Grid */}
        {[...Array(GRID_SIZE*2+1)].map((_, i) => (
          <Rect key={`v${i}`} x={i*CELL} y={0} width={1} height={window.innerHeight} fill="#f0f0f0" />
        ))}
        {[...Array(GRID_SIZE*2+1)].map((_, i) => (
          <Rect key={`h${i}`} x={0} y={i*CELL} width={window.innerWidth} height={1} fill="#f0f0f0" />
        ))}
      </Layer>

      <Layer>
        {/* Placed tiles */}
        {tiles.map((t: PlacedTile) => {
          const screenX = originX + t.x * CELL;
          const screenY = originY + t.y * CELL;
          const bad = invalidCells.has(key(t.x, t.y));
          return (
            <Group key={t.id} x={screenX} y={screenY}>
              <Rect width={CELL} height={CELL} fill="#fff" stroke={bad ? "#f44" : "#333"} strokeWidth={2} />
              <Text text={t.letter} fontSize={24} x={12} y={8} />
            </Group>
          );
        })}
      </Layer>

      <Layer>
        {/* Cursor - on top layer for visibility */}
        <Group x={originX + cursor.pos.x * CELL} y={originY + cursor.pos.y * CELL}>
          <Rect
            width={CELL}
            height={CELL}
            fill="transparent"
            stroke="rgba(0, 100, 255, 1)"
            strokeWidth={3}
          />
          {/* Orientation indicator */}
          <Rect
            x={cursor.orient === "H" ? CELL - 10 : CELL/2 - 5}
            y={cursor.orient === "H" ? CELL/2 - 5 : CELL - 10}
            width={cursor.orient === "H" ? 20 : 10}
            height={cursor.orient === "H" ? 10 : 20}
            fill="rgba(0, 100, 255, 0.8)"
          />
        </Group>
      </Layer>
    </Stage>
  );
}
