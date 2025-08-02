import React, { useState, useRef } from "react";
import { Group, Rect, Text } from "react-konva";
import { PlacedTile } from "@ss/shared";

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
  const longPressTimer = useRef<NodeJS.Timeout>();
  
  const handleTileClick = (e: any) => {
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
  };
  
  const handleContextMenu = (e: any) => {
    e.evt.preventDefault(); // Prevent browser context menu
  };
  
  const handleTouchStart = (e: any) => {
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
  };
  
  const handleTouchEnd = (e: any) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    setIsLongPress(false);
  };
  
  return (
    <Group 
      x={x} 
      y={y}
      onClick={handleTileClick}
      onContextMenu={handleContextMenu}
      onMouseDown={handleTileClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <Rect 
        width={CELL} 
        height={CELL} 
        fill="#fff" 
        stroke={isInvalid ? "#f44" : "#333"} 
        strokeWidth={2}
        scaleX={isLongPress ? 1.1 : 1}
        scaleY={isLongPress ? 1.1 : 1}
        offsetX={isLongPress ? CELL * 0.05 : 0}
        offsetY={isLongPress ? CELL * 0.05 : 0}
      />
      <Text 
        text={tile.letter} 
        fontSize={24} 
        x={12} 
        y={8}
        scaleX={isLongPress ? 1.1 : 1}
        scaleY={isLongPress ? 1.1 : 1}
      />
    </Group>
  );
}