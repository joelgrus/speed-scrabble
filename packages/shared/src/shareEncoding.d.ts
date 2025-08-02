/**
 * Share encoding for Speed Scrabble game results
 * Encodes (username, date, width, height, grid, time) into a single base64 string
 */
export interface GameResult {
    username: string;
    date: string;
    width: number;
    height: number;
    grid: string;
    time: number;
}
/**
 * Encodes game result into a compact base64 string
 * Format: [usernameLen:1byte][username:usernameLen][dateLen:1byte][date:dateLen][width:2bytes][height:2bytes][time:4bytes][compressedGrid:remaining]
 * Grid compression: Run-length encoding where dots are compressed
 */
export declare function encodeGameResult(result: GameResult): string;
/**
 * Decodes base64 string back to game result
 */
export declare function decodeGameResult(encoded: string): GameResult;
/**
 * Creates a shareable URL for a game result
 */
export declare function createShareUrl(result: GameResult, baseUrl?: string): string;
/**
 * Extracts game result from a share URL
 */
export declare function parseShareUrl(url: string): GameResult;
//# sourceMappingURL=shareEncoding.d.ts.map