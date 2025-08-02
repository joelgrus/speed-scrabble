/**
 * Share encoding for Speed Scrabble game results
 * Encodes (username, date, width, height, grid, time) into a single base64 string
 */
/**
 * Compresses a grid string using run-length encoding for dots
 * Format: For each run, if it's dots: [count:1byte], if it's letters: [0:1byte][letter:1byte]
 */
function compressGrid(grid) {
    const result = [];
    let i = 0;
    while (i < grid.length) {
        if (grid[i] === '.') {
            // Count consecutive dots
            let count = 0;
            while (i < grid.length && grid[i] === '.' && count < 255) {
                count++;
                i++;
            }
            result.push(count);
        }
        else {
            // Single letter
            result.push(0); // 0 indicates a letter follows
            result.push(grid.charCodeAt(i));
            i++;
        }
    }
    return new Uint8Array(result);
}
/**
 * Decompresses a grid from run-length encoding
 */
function decompressGrid(compressed) {
    let result = '';
    let i = 0;
    while (i < compressed.length) {
        const byte = compressed[i];
        if (byte === 0) {
            // Next byte is a letter
            if (i + 1 < compressed.length) {
                result += String.fromCharCode(compressed[i + 1]);
                i += 2;
            }
            else {
                throw new Error('Invalid compressed grid: missing letter after 0');
            }
        }
        else {
            // Byte indicates number of dots
            result += '.'.repeat(byte);
            i++;
        }
    }
    return result;
}
/**
 * Encodes game result into a compact base64 string
 * Format: [usernameLen:1byte][username:usernameLen][dateLen:1byte][date:dateLen][width:2bytes][height:2bytes][time:4bytes][compressedGrid:remaining]
 * Grid compression: Run-length encoding where dots are compressed
 */
export function encodeGameResult(result) {
    const { username, date, width, height, grid, time } = result;
    // Validate inputs
    if (!username || username.length === 0 || username.length > 255) {
        throw new Error('Username must be between 1 and 255 characters');
    }
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new Error('Date must be in YYYY-MM-DD format');
    }
    if (width < 1 || width > 255 || height < 1 || height > 255) {
        throw new Error('Width and height must be between 1 and 255');
    }
    if (time < 0 || time > 0xFFFFFFFF) {
        throw new Error('Time must be between 0 and 4294967295 seconds');
    }
    if (grid.length !== width * height) {
        throw new Error(`Grid length ${grid.length} doesn't match dimensions ${width}x${height}`);
    }
    const usernameBytes = new TextEncoder().encode(username);
    const dateBytes = new TextEncoder().encode(date);
    const compressedGrid = compressGrid(grid);
    if (usernameBytes.length > 255) {
        throw new Error('Username too long when encoded as UTF-8');
    }
    if (dateBytes.length > 255) {
        throw new Error('Date too long when encoded as UTF-8');
    }
    // Create binary data
    const headerSize = 1 + usernameBytes.length + 1 + dateBytes.length + 2 + 2 + 4;
    const buffer = new ArrayBuffer(headerSize + compressedGrid.length);
    const view = new DataView(buffer);
    const bytes = new Uint8Array(buffer);
    let offset = 0;
    // Write username length and username
    view.setUint8(offset, usernameBytes.length);
    offset += 1;
    bytes.set(usernameBytes, offset);
    offset += usernameBytes.length;
    // Write date length and date
    view.setUint8(offset, dateBytes.length);
    offset += 1;
    bytes.set(dateBytes, offset);
    offset += dateBytes.length;
    // Write dimensions and time
    view.setUint16(offset, width, false); // big-endian
    offset += 2;
    view.setUint16(offset, height, false);
    offset += 2;
    view.setUint32(offset, time, false);
    offset += 4;
    // Write compressed grid data
    bytes.set(compressedGrid, offset);
    // Convert to base64
    return btoa(String.fromCharCode(...bytes));
}
/**
 * Decodes base64 string back to game result
 */
export function decodeGameResult(encoded) {
    try {
        // Decode base64
        const binaryString = atob(encoded);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        if (bytes.length < 12) { // Minimum: 1+1+1+1+2+2+4 = 12 bytes for shortest possible encoding
            throw new Error('Invalid encoding: too short');
        }
        const view = new DataView(bytes.buffer);
        let offset = 0;
        // Read username
        const usernameLength = view.getUint8(offset);
        offset += 1;
        if (offset + usernameLength > bytes.length) {
            throw new Error('Invalid encoding: username length exceeds data');
        }
        const usernameBytes = bytes.slice(offset, offset + usernameLength);
        const username = new TextDecoder().decode(usernameBytes);
        offset += usernameLength;
        // Read date
        const dateLength = view.getUint8(offset);
        offset += 1;
        if (offset + dateLength > bytes.length) {
            throw new Error('Invalid encoding: date length exceeds data');
        }
        const dateBytes = bytes.slice(offset, offset + dateLength);
        const date = new TextDecoder().decode(dateBytes);
        offset += dateLength;
        // Validate date format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            throw new Error('Invalid date format in encoding');
        }
        // Read dimensions and time
        if (offset + 8 > bytes.length) {
            throw new Error('Invalid encoding: insufficient data for dimensions and time');
        }
        const width = view.getUint16(offset, false);
        offset += 2;
        const height = view.getUint16(offset, false);
        offset += 2;
        const time = view.getUint32(offset, false);
        offset += 4;
        // Validate dimensions
        if (width < 1 || width > 255 || height < 1 || height > 255) {
            throw new Error('Invalid dimensions in encoding');
        }
        // Read compressed grid
        const compressedGridBytes = bytes.slice(offset);
        const grid = decompressGrid(compressedGridBytes);
        // Validate decompressed grid length
        const expectedGridLength = width * height;
        if (grid.length !== expectedGridLength) {
            throw new Error(`Decompressed grid length mismatch: expected ${expectedGridLength}, got ${grid.length}`);
        }
        return { username, date, width, height, grid, time };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to decode game result: ${message}`);
    }
}
/**
 * Creates a shareable URL for a game result
 */
export function createShareUrl(result, baseUrl = '') {
    const encoded = encodeGameResult(result);
    return `${baseUrl}/share?game=${encodeURIComponent(encoded)}`;
}
/**
 * Extracts game result from a share URL
 */
export function parseShareUrl(url) {
    const urlObj = new URL(url);
    const gameParam = urlObj.searchParams.get('game');
    if (!gameParam) {
        throw new Error('No game parameter found in URL');
    }
    return decodeGameResult(decodeURIComponent(gameParam));
}
