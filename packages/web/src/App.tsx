import React, { useEffect, useState } from "react";
import { useGame } from "./state/gameStore";
import BoardCanvas from "./components/BoardCanvas";
import TileRack from "./components/TileRack";
import Controls from "./components/Controls";
import { useKeyboard } from "./hooks/useKeyboard";

export default function App() {
  const init = useGame(s => s.init);
  const validate = useGame(s => s.validate);
  const [loaded, setLoaded] = useState(false);
  
  useKeyboard();

  useEffect(() => {
    // Load a small word list into a Set
    fetch(new URL("./assets/words.txt", import.meta.url))
      .then(r => r.text())
      .then(txt => {
        const dict = new Set(txt.split(/\r?\n/).map(w => w.trim().toUpperCase()).filter(Boolean));
        init(dict, "local-seed");
        setLoaded(true);
        validate();
      });
  }, [init, validate]);

  if (!loaded) return <div style={{ padding: 24 }}>Loading…</div>;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", height: "100vh" }}>
      <div style={{ position: "relative" }}>
        <BoardCanvas />
        <TileRack />
      </div>
      <Controls />
    </div>
  );
}
