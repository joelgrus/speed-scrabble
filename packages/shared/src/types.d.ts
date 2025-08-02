export type Letter = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z";
export type TileID = string;
export type Tile = {
    id: TileID;
    letter: Letter;
};
export type Coord = {
    x: number;
    y: number;
};
export type PlacedTile = {
    id: TileID;
    letter: Letter;
    x: number;
    y: number;
};
export type Board = Record<string, PlacedTile>;
export type Rules = {
    startDraw: number;
    drawAmount: number;
    dumpEnabled: boolean;
};
export type ValidationIssue = {
    word: string;
    cells: Coord[];
};
export type ValidationResult = {
    ok: boolean;
    issues: ValidationIssue[];
    connected: boolean;
};
export type Orientation = "H" | "V";
export type Cursor = {
    pos: Coord;
    orient: Orientation;
};
export type RNG = () => number;
//# sourceMappingURL=types.d.ts.map