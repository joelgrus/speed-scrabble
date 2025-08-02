import React, { useMemo, useEffect, useState, useRef } from "react";
import { Stage, Layer, Rect, Group } from "react-konva";
import { useGame } from "../state/gameStore";
import { key, PlacedTile } from "@ss/shared";
import PlacedTileComponent from "./PlacedTileComponent";

const CELL = 40;
const GRID_SIZE = 25; // visible span around origin

export default function BoardCanvas() {
  const board = useGame(s => s.board);
  const invalidCells = useGame(s => s.invalidCells);
  const validate = useGame(s => s.validate);
  const cursor = useGame(s => s.cursor);
  const setCursor = useGame(s => s.setCursor);
  const removeTile = useGame(s => s.removeTile);

  const stageRef = useRef<any>();
  const [stageScale, setStageScale] = useState(1);
  const [stageX, setStageX] = useState(0);
  const [stageY, setStageY] = useState(0);

  // Dynamic origin based on stage position
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
    // Account for stage transform
    const gridX = Math.floor(((point.x - stageX) / stageScale - originX) / CELL);
    const gridY = Math.floor(((point.y - stageY) / stageScale - originY) / CELL);
    setCursor({ pos: { x: gridX, y: gridY } });
  };

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    
    // Zoom factor
    const scaleBy = 1.1;
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    
    // Clamp zoom
    const clampedScale = Math.max(0.3, Math.min(3, newScale));
    
    const newPos = {
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    };
    
    setStageScale(clampedScale);
    setStageX(newPos.x);
    setStageY(newPos.y);
  };

  const handleDragEnd = (e: any) => {
    setStageX(e.target.x());
    setStageY(e.target.y());
  };

  return (
    <Stage 
      ref={stageRef}
      width={window.innerWidth - 320} 
      height={window.innerHeight - 64}
      onClick={handleGridClick}
      onWheel={handleWheel}
      onDragEnd={handleDragEnd}
      scaleX={stageScale}
      scaleY={stageScale}
      x={stageX}
      y={stageY}
      draggable
    >
      <Layer>
        {/* Grid */}
        {[...Array(GRID_SIZE*2+1)].map((_, i) => (
          <Rect key={`v${i}`} x={i*CELL} y={0} width={1} height={GRID_SIZE*2*CELL} fill="#f0f0f0" />
        ))}
        {[...Array(GRID_SIZE*2+1)].map((_, i) => (
          <Rect key={`h${i}`} x={0} y={i*CELL} width={GRID_SIZE*2*CELL} height={1} fill="#f0f0f0" />
        ))}
      </Layer>

      <Layer>
        {/* Placed tiles */}
        {tiles.map((t: PlacedTile) => (
          <PlacedTileComponent
            key={t.id}
            tile={t}
            x={originX + t.x * CELL}
            y={originY + t.y * CELL}
            isInvalid={invalidCells.has(key(t.x, t.y))}
            onRemove={removeTile}
            onCursorMove={(x, y) => setCursor({ pos: { x, y } })}
          />
        ))}
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
