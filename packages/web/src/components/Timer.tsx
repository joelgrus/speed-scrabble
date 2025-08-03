import React, { useEffect, useMemo } from "react";
import { useGame } from "../state/gameStore";
import { TIMED_GAME_CONFIG } from "@ss/shared";

interface TimerProps {
  compact?: boolean;
}

export default function Timer({ compact = false }: TimerProps) {
  const isGameActive = useGame(s => s.isGameActive);
  const currentTime = useGame(s => s.currentTime);
  const dumpPenalties = useGame(s => s.dumpPenalties);
  const dumpCount = useGame(s => s.dumpCount);
  const getTotalTime = useGame(s => s.getTotalTime);
  const updateTimer = useGame(s => s.updateTimer);

  // Update timer every second when game is active
  useEffect(() => {
    if (!isGameActive) {
      return;
    }

    const interval = setInterval(() => {
      updateTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [isGameActive, updateTimer]);

  const totalTime = getTotalTime();

  // Format time as MM:SS
  const formattedTime = useMemo(() => {
    const minutes = Math.floor(totalTime / 60);
    const seconds = totalTime % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, [totalTime]);

  // Format base time (without penalties) for display
  const formattedBaseTime = useMemo(() => {
    const minutes = Math.floor(currentTime / 60);
    const seconds = currentTime % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, [currentTime]);

  // Color scheme: green for good time, orange/red as time increases
  const timerColor = useMemo(() => {
    if (totalTime >= 300) return "#FF4444"; // Red for 5+ minutes
    if (totalTime >= 180) return "#FFA500"; // Orange for 3+ minutes  
    return "#4CAF50"; // Green for under 3 minutes
  }, [totalTime]);

  if (compact) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        <span style={{ fontSize: "14px", color: "#FAF8F3" }}>⏱️</span>
        <span
          style={{
            fontSize: "16px",
            fontWeight: "bold",
            color: timerColor,
            fontFamily: "monospace",
          }}
        >
          {formattedTime}
        </span>
        {dumpPenalties > 0 && (
          <span style={{ fontSize: "12px", color: "#FF6B6B" }}>
            🚫{dumpCount}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        background: "linear-gradient(to bottom, #2A2A2A, #1A1A1A)",
        border: "2px solid #444",
        borderRadius: 12,
        padding: "12px 16px",
        margin: "8px 0",
        textAlign: "center",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
      }}
    >
      <div
        style={{
          fontSize: "16px",
          fontWeight: "bold",
          color: "#FAF8F3",
          marginBottom: "4px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        ⏱️ TIME
      </div>
      <div
        style={{
          fontSize: "28px",
          fontWeight: "bold",
          color: timerColor,
          fontFamily: "monospace",
          textShadow: `0 0 8px ${timerColor}40`,
        }}
      >
        {formattedTime}
      </div>
      
      {/* Show breakdown if there are penalties */}
      {dumpPenalties > 0 && (
        <div style={{ fontSize: "11px", color: "#AAA", marginTop: "2px" }}>
          Base: {formattedBaseTime} + {dumpPenalties}s penalties
        </div>
      )}
      
      {dumpPenalties > 0 && (
        <div
          style={{
            fontSize: "12px",
            color: "#FF6B6B",
            marginTop: "2px",
            fontWeight: "bold",
          }}
        >
          🚫 {dumpCount} dump{dumpCount !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}