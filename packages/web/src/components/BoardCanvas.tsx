import React, { useMemo, useEffect, useState, useRef, useCallback } from "react";
import type { KonvaEventObject } from "konva/lib/Node";
import type { Stage as StageType } from "konva/lib/Stage";
import { Stage, Layer, Rect, Group } from "react-konva";
import { useGame } from "../state/gameStore";
import { key, PlacedTile, CELL_SIZE, GRID_SIZE, ZOOM_CONFIG, PERFORMANCE_CONFIG } from "@ss/shared";
import PlacedTileComponent from "./PlacedTileComponent";

const CELL = CELL_SIZE;
const GRID = GRID_SIZE;

interface BoardCanvasProps {
  isMobile?: boolean;
}

export default function BoardCanvas({ isMobile = false }: BoardCanvasProps) {
  const board = useGame(s => s.board);
  const invalidCells = useGame(s => s.invalidCells);
  const validate = useGame(s => s.validate);
  const cursor = useGame(s => s.cursor);
  const setCursor = useGame(s => s.setCursor);
  const removeTile = useGame(s => s.removeTile);
  const moveTile = useGame(s => s.moveTile);

  const stageRef = useRef<StageType | null>(null);
  const [stageScale, setStageScale] = useState(1);
  const [stageX, setStageX] = useState(0);
  const [stageY, setStageY] = useState(0);


  const handleTouchMove = useCallback((e: KonvaEventObject<TouchEvent>) => {
    const touches = e.evt.touches;
    
    if (touches.length === 2) {
      // Pinch-to-zoom gesture
      const stage = stageRef.current;
      if (!stage) return;
      
      const currentDistance = getTouchDistance(touches);
      
      if (lastTouchDistance.current > 0) {
        const scale = currentDistance / lastTouchDistance.current;
        const oldScale = stageScale;
        const newScale = Math.max(ZOOM_CONFIG.min, Math.min(ZOOM_CONFIG.max, oldScale * scale));
        
        // Simple center-based zoom
        const center = stage.getPointerPosition();
        if (center) {
          const scaleBy = newScale / oldScale;
          const newX = center.x - (center.x - stageX) * scaleBy;
          const newY = center.y - (center.y - stageY) * scaleBy;
          
          // Update state
          setStageScale(newScale);
          setStageX(newX);
          setStageY(newY);
          
          // Force redraw
          stage.batchDraw();
        }
      }
      
      lastTouchDistance.current = currentDistance;
    }
  }, [stageScale, stageX, stageY]);

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
      if (!stage) return;
      
      const point = stage.getPointerPosition();
      if (!point) return;
      
      // Get current stage position (not from state, which may be stale)
      const currentStageX = stage.x();
      const currentStageY = stage.y();
      const currentStageScale = stage.scaleX();
      
      // Account for stage transform
      const gridX = Math.floor(((point.x - currentStageX) / currentStageScale - originX) / CELL);
      const gridY = Math.floor(((point.y - currentStageY) / currentStageScale - originY) / CELL);
      
      // If clicking on the already-selected cell, toggle orientation
      if (cursor.pos.x === gridX && cursor.pos.y === gridY) {
        setCursor({ orient: cursor.orient === "H" ? "V" : "H" });
      } else {
        setCursor({ pos: { x: gridX, y: gridY } });
      }
    },
    [originX, originY, setCursor, cursor.pos.x, cursor.pos.y, cursor.orient]
  );

  const handleGridTap = useCallback(
    (e: KonvaEventObject<TouchEvent>) => {
      const stage = e.target.getStage();
      if (!stage) return;
      
      const point = stage.getPointerPosition();
      if (!point) return;
      
      // Get current stage position (not from state, which may be stale)
      const currentStageX = stage.x();
      const currentStageY = stage.y();
      const currentStageScale = stage.scaleX();
      
      // Account for stage transform
      const gridX = Math.floor(((point.x - currentStageX) / currentStageScale - originX) / CELL);
      const gridY = Math.floor(((point.y - currentStageY) / currentStageScale - originY) / CELL);
      
      // If tapping on the already-selected cell, toggle orientation
      if (cursor.pos.x === gridX && cursor.pos.y === gridY) {
        setCursor({ orient: cursor.orient === "H" ? "V" : "H" });
      } else {
        setCursor({ pos: { x: gridX, y: gridY } });
      }
    },
    [originX, originY, setCursor, cursor.pos.x, cursor.pos.y, cursor.orient]
  );

  const handleWheel = useCallback((e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();

    const stage = e.target.getStage();
    if (!stage) return;
    
    const oldScale = stageScale;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stageX) / oldScale,
      y: (pointer.y - stageY) / oldScale,
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
  }, [stageScale, stageX, stageY]);

  const handleDragEnd = useCallback((e: KonvaEventObject<DragEvent>) => {
    setStageX(e.target.x());
    setStageY(e.target.y());
  }, []);

  // Touch gesture handling for pinch-to-zoom
  const lastTouchDistance = useRef<number>(0);
  const lastTouchCenter = useRef<{ x: number; y: number } | null>(null);

  const getTouchDistance = (touches: TouchList) => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  const getTouchCenter = (touches: TouchList) => {
    if (touches.length < 2) return null;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    };
  };


  const handleTouchStart = useCallback((e: KonvaEventObject<TouchEvent>) => {
    const touches = e.evt.touches;
    
    if (touches.length === 2) {
      // Start pinch gesture
      e.evt.preventDefault();
      
      lastTouchDistance.current = getTouchDistance(touches);
      lastTouchCenter.current = getTouchCenter(touches);
    } else {
      // Reset for single touch
      lastTouchDistance.current = 0;
      lastTouchCenter.current = null;
    }
  }, []);

  const handleTouchEnd = useCallback((e: KonvaEventObject<TouchEvent>) => {
    const touches = e.evt.touches;
    const changedTouches = e.evt.changedTouches;
    
    if (touches.length < 2) {
      // Reset when less than 2 touches
      lastTouchDistance.current = 0;
      lastTouchCenter.current = null;
    }
    
    // Single tap (when all touches end) - only if it wasn't a drag
    if (touches.length === 0 && changedTouches.length === 1) {
      const stage = e.target.getStage();
      if (stage && !stage.isDragging()) {
        handleGridTap(e);
      }
    }
  }, [handleGridTap]);

  return (
    <Stage
      ref={stageRef}
      width={isMobile ? window.innerWidth : window.innerWidth - 320}
      height={isMobile ? 600 : window.innerHeight - 80}
      onClick={handleGridClick}
      onWheel={handleWheel}
      onDragEnd={handleDragEnd}
      onDragMove={handleDragEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      scaleX={stageScale}
      scaleY={stageScale}
      x={stageX}
      y={stageY}
      draggable
      style={{ 
        touchAction: 'manipulation',
        WebkitUserSelect: 'none',
        userSelect: 'none'
      }}
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
            onTileMove={moveTile}
            onToggleOrientation={() => setCursor({ orient: cursor.orient === "H" ? "V" : "H" })}
            isAtCursor={cursor.pos.x === t.x && cursor.pos.y === t.y}
          />
        ))}
      </Layer>

      <Layer listening={false}>
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
