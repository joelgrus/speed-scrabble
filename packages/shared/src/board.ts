import type { Board, Coord, PlacedTile } from "./types";

export function key(x: number, y: number) { return `${x},${y}`; }

export function get(board: Board, x: number, y: number): PlacedTile | undefined {
  return board[key(x,y)];
}

export function set(board: Board, t: PlacedTile): void {
  board[key(t.x,t.y)] = t;
}

export function del(board: Board, x: number, y: number): void {
  delete board[key(x,y)];
}

function collectWord(board: Board, x: number, y: number, dx: number, dy: number) {
  // move to start of the run
  while (get(board, x - dx, y - dy)) { x -= dx; y -= dy; }
  const letters: string[] = [];
  const cells: Coord[] = [];
  while (true) {
    const pt = get(board, x, y);
    if (!pt) break;
    letters.push(pt.letter);
    cells.push({ x, y });
    x += dx; y += dy;
  }
  return { word: letters.join(""), cells };
}

// Check if all tiles form a single connected component
export function isConnected(board: Board): boolean {
  const tiles = Object.values(board);
  if (tiles.length <= 1) return true;
  
  // BFS to find connected component starting from first tile
  const visited = new Set<string>();
  const queue = [tiles[0]];
  visited.add(key(tiles[0].x, tiles[0].y));
  
  while (queue.length > 0) {
    const tile = queue.shift()!;
    // Check all 4 adjacent cells
    const neighbors = [
      [tile.x + 1, tile.y],
      [tile.x - 1, tile.y], 
      [tile.x, tile.y + 1],
      [tile.x, tile.y - 1]
    ];
    
    for (const [nx, ny] of neighbors) {
      const neighborKey = key(nx, ny);
      if (board[neighborKey] && !visited.has(neighborKey)) {
        visited.add(neighborKey);
        queue.push(board[neighborKey]);
      }
    }
  }
  
  // All tiles should be visited if connected
  return visited.size === tiles.length;
}

// Extract all across & down words (length >= 2)
export function extractWords(board: Board) {
  const seen = new Set<string>();
  const words: { word: string; cells: Coord[] }[] = [];

  for (const k in board) {
    const { x, y } = board[k];
    // across start: no left neighbor
    if (!get(board, x-1, y) && get(board, x+1, y)) {
      const w = collectWord(board, x, y, 1, 0);
      if (w.cells.length >= 2) {
        const sig = `H:${w.cells[0].x},${w.cells[0].y}:${w.cells.length}`;
        if (!seen.has(sig)) { seen.add(sig); words.push(w); }
      }
    }
    // down start: no up neighbor
    if (!get(board, x, y-1) && get(board, x, y+1)) {
      const w = collectWord(board, x, y, 0, 1);
      if (w.cells.length >= 2) {
        const sig = `V:${w.cells[0].x},${w.cells[0].y}:${w.cells.length}`;
        if (!seen.has(sig)) { seen.add(sig); words.push(w); }
      }
    }
  }
  return words;
}
