import React, { useMemo, useEffect, useState, useRef, useCallback } from "react";
import type { KonvaEventObject } from "konva/lib/Node";
import type { Stage as StageType } from "konva/lib/Stage";
import { Stage, Layer, Rect, Group } from "react-konva";
import { useGame } from "../state/gameStore";
import { key, PlacedTile, CELL_SIZE, GRID_SIZE, ZOOM_CONFIG, PERFORMANCE_CONFIG } from "@ss/shared";
import PlacedTileComponent from "./PlacedTileComponent";

const CELL = CELL_SIZE;
const GRID = GRID_SIZE;

export default function BoardCanvas() {
  const board = useGame(s => s.board);
  const invalidCells = useGame(s => s.invalidCells);
  const validate = useGame(s => s.validate);
  const cursor = useGame(s => s.cursor);
  const setCursor = useGame(s => s.setCursor);
  const removeTile = useGame(s => s.removeTile);

  const stageRef = useRef<StageType | null>(null);
  const [stageScale, setStageScale] = useState(1);
  const [stageX, setStageX] = useState(0);
  const [stageY, setStageY] = useState(0);

  // Dynamic origin based on stage position
  const originX = GRID * CELL;
  const originY = GRID * CELL;

  useEffect(() => {
    // Debounce validation to avoid excessive calls
    const timeoutId = setTimeout(() => {
      validate();
    }, PERFORMANCE_CONFIG.validationDebounceMs);

    return () => clearTimeout(timeoutId);
  }, [board, validate]);

  const tiles = useMemo(() => Object.values(board), [board]);

  const handleGridClick = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage();
      const point = stage.getPointerPosition();
      // Account for stage transform
      const gridX = Math.floor(((point.x - stageX) / stageScale - originX) / CELL);
      const gridY = Math.floor(((point.y - stageY) / stageScale - originY) / CELL);
      
      // If clicking on the already-selected cell, toggle orientation
      if (cursor.pos.x === gridX && cursor.pos.y === gridY) {
        setCursor({ orient: cursor.orient === "H" ? "V" : "H" });
      } else {
        setCursor({ pos: { x: gridX, y: gridY } });
      }
    },
    [stageX, stageY, stageScale, originX, originY, setCursor, cursor.pos.x, cursor.pos.y, cursor.orient]
  );

  const handleWheel = useCallback((e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();

    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    // Zoom factor
    const scaleBy = ZOOM_CONFIG.step;
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

    // Clamp zoom
    const clampedScale = Math.max(ZOOM_CONFIG.min, Math.min(ZOOM_CONFIG.max, newScale));

    const newPos = {
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    };

    setStageScale(clampedScale);
    setStageX(newPos.x);
    setStageY(newPos.y);
  }, []);

  const handleDragEnd = useCallback((e: KonvaEventObject<DragEvent>) => {
    setStageX(e.target.x());
    setStageY(e.target.y());
  }, []);

  return (
    <Stage
      ref={stageRef}
      width={window.innerWidth - 320}
      height={window.innerHeight - 80}
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
        {/* Felt background - covers much larger area */}
        <Rect
          x={-GRID * CELL}
          y={-GRID * CELL}
          width={GRID * 4 * CELL}
          height={GRID * 4 * CELL}
          fill="#2C5F2D"
        />

        {/* Simplified grid using fewer elements */}
        {/* Vertical lines */}
        {[...Array(GRID * 4 + 1)].map((_, i) => (
          <Rect
            key={`v${i}`}
            x={(i - GRID) * CELL}
            y={-GRID * CELL}
            width={0.5}
            height={GRID * 4 * CELL}
            fill="rgba(255, 255, 255, 0.08)"
          />
        ))}
        {/* Horizontal lines */}
        {[...Array(GRID * 4 + 1)].map((_, i) => (
          <Rect
            key={`h${i}`}
            x={-GRID * CELL}
            y={(i - GRID) * CELL}
            width={GRID * 4 * CELL}
            height={0.5}
            fill="rgba(255, 255, 255, 0.08)"
          />
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
            stroke="#FFD700"
            strokeWidth={2}
            shadowColor="rgba(0, 0, 0, 0.3)"
            shadowBlur={4}
            shadowOffset={{ x: 0, y: 2 }}
          />
          {/* Orientation indicator */}
          <Rect
            x={cursor.orient === "H" ? CELL - 12 : CELL / 2 - 6}
            y={cursor.orient === "H" ? CELL / 2 - 6 : CELL - 12}
            width={cursor.orient === "H" ? 24 : 12}
            height={cursor.orient === "H" ? 12 : 24}
            fill="#FFD700"
            cornerRadius={2}
            shadowColor="rgba(0, 0, 0, 0.3)"
            shadowBlur={2}
            shadowOffset={{ x: 0, y: 1 }}
          />
        </Group>
      </Layer>
    </Stage>
  );
}
