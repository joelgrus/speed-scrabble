export type Letter = 
  "A"|"B"|"C"|"D"|"E"|"F"|"G"|"H"|"I"|"J"|"K"|"L"|"M"|
  "N"|"O"|"P"|"Q"|"R"|"S"|"T"|"U"|"V"|"W"|"X"|"Y"|"Z";

export type TileID = string;

export type Tile = {
  id: TileID;
  letter: Letter;
};

export type Coord = { x: number; y: number }; // integer grid cells

export type PlacedTile = {
  id: TileID;
  letter: Letter;
  x: number;
  y: number;
};

export type Board = Record<string /* `${x},${y}` */, PlacedTile>;

export type Rules = {
  startDraw: number;   // default 7
  peelDraw: number;    // default 2
  dumpEnabled: boolean; // later
};

export type ValidationIssue = {
  word: string;
  cells: Coord[]; // coordinates composing the invalid word
};

export type ValidationResult = {
  ok: boolean;
  issues: ValidationIssue[];
};

export type Orientation = "H"|"V";

export type Cursor = {
  pos: Coord;
  orient: Orientation;
};

export type RNG = () => number; // [0,1)
