import type { Board, Coord, PlacedTile } from "./types";
export declare function key(x: number, y: number): string;
export declare function get(board: Board, x: number, y: number): PlacedTile | undefined;
export declare function set(board: Board, t: PlacedTile): void;
export declare function del(board: Board, x: number, y: number): void;
export declare function isConnected(board: Board): boolean;
export declare function extractWords(board: Board): {
    word: string;
    cells: Coord[];
}[];
//# sourceMappingURL=board.d.ts.map