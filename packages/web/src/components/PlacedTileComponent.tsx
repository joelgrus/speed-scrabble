import React, { useState, useRef, useCallback, useMemo } from "react";
import type { KonvaEventObject } from "konva/lib/Node";
import { Group, Rect, Text } from "react-konva";
import { PlacedTile, LETTER_VALUES } from "@ss/shared";

interface PlacedTileComponentProps {
  tile: PlacedTile;
  x: number;
  y: number;
  isInvalid: boolean;
  onRemove: (x: number, y: number) => void;
  onCursorMove: (x: number, y: number) => void;
}

const CELL = 40;

export default function PlacedTileComponent({ tile, x, y, isInvalid, onRemove, onCursorMove }: PlacedTileComponentProps) {
  const [isLongPress, setIsLongPress] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout>();
  
  const handleTileClick = useCallback((e: KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true; // Prevent grid click
    
    // Right click
    if (e.evt.button === 2) {
      e.evt.preventDefault();
      onRemove(tile.x, tile.y);
      return;
    }
    
    // Cmd/Ctrl + Left click
    if (e.evt.button === 0 && (e.evt.metaKey || e.evt.ctrlKey)) {
      e.evt.preventDefault();
      onRemove(tile.x, tile.y);
      return;
    }
    
    // Normal left click - move cursor
    if (e.evt.button === 0) {
      onCursorMove(tile.x, tile.y);
    }
  }, [tile.x, tile.y, onRemove, onCursorMove]);
  
  const handleContextMenu = useCallback((e: KonvaEventObject<Event>) => {
    e.evt.preventDefault(); // Prevent browser context menu
  }, []);
  
  const handleTouchStart = useCallback((e: KonvaEventObject<TouchEvent>) => {
    e.cancelBubble = true;
    setIsLongPress(false);
    
    longPressTimer.current = setTimeout(() => {
      setIsLongPress(true);
      onRemove(tile.x, tile.y);
      // Optional: Add haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }, 500);
  }, [tile.x, tile.y, onRemove]);
  
  const handleTouchEnd = useCallback((e: KonvaEventObject<TouchEvent>) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    setIsLongPress(false);
  }, []);
  
  const letterValue = useMemo(() => LETTER_VALUES[tile.letter as keyof typeof LETTER_VALUES], [tile.letter]);
  const tileScale = useMemo(() => isLongPress ? 1.1 : isHovered ? 1.05 : 1, [isLongPress, isHovered]);
  const tileLift = useMemo(() => isLongPress ? -2 : isHovered ? -1 : 0, [isLongPress, isHovered]);
  
  return (
    <Group 
      x={x} 
      y={y + tileLift}
      onClick={handleTileClick}
      onContextMenu={handleContextMenu}
      onMouseDown={handleTileClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={useCallback(() => setIsHovered(true), [])}
      onMouseLeave={useCallback(() => setIsHovered(false), [])}
    >
      {/* Simplified shadow - only render when needed */}
      {(isHovered || isLongPress || isInvalid) && (
        <Rect 
          width={CELL} 
          height={CELL} 
          x={3}
          y={3}
          fill={isInvalid ? "rgba(255, 0, 0, 0.4)" : "rgba(0, 0, 0, 0.25)"}
          cornerRadius={6}
          scaleX={tileScale}
          scaleY={tileScale}
          offsetX={isLongPress ? CELL * 0.05 : 0}
          offsetY={isLongPress ? CELL * 0.05 : 0}
        />
      )}
      
      {/* Main tile - simplified styling */}
      <Rect 
        width={CELL} 
        height={CELL} 
        fill={isInvalid ? "#FF6B6B" : "#FAF8F3"}
        stroke={isInvalid ? "#FF0000" : "#D4C4B0"} 
        strokeWidth={isInvalid ? 3 : 1}
        cornerRadius={6}
        scaleX={tileScale}
        scaleY={tileScale}
        offsetX={isLongPress ? CELL * 0.05 : 0}
        offsetY={isLongPress ? CELL * 0.05 : 0}
      />
      
      {/* Top highlight - only when not invalid */}
      {!isInvalid && (
        <Rect 
          width={CELL - 4} 
          height={2}
          x={2}
          y={2}
          fill="rgba(255, 255, 255, 0.6)"
          cornerRadius={[4, 4, 0, 0]}
          scaleX={tileScale}
          scaleY={tileScale}
          offsetX={isLongPress ? CELL * 0.05 : 0}
          offsetY={isLongPress ? CELL * 0.05 : 0}
        />
      )}
      
      {/* Letter text with serif font */}
      <Text 
        text={tile.letter} 
        fontSize={26} 
        fontFamily="Georgia, serif"
        fontStyle="bold"
        fill="#3E2723"
        x={CELL / 2}
        y={CELL / 2 - 2}
        offsetX={13}
        offsetY={13}
        scaleX={tileScale}
        scaleY={tileScale}
      />
      
      {/* Point value in bottom right */}
      <Text 
        text={letterValue.toString()} 
        fontSize={10} 
        fontFamily="Arial, sans-serif"
        fill="#8B6B47"
        x={CELL - 8}
        y={CELL - 10}
        scaleX={tileScale}
        scaleY={tileScale}
        offsetX={isLongPress ? CELL * 0.05 : 0}
        offsetY={isLongPress ? CELL * 0.05 : 0}
      />
    </Group>
  );
}