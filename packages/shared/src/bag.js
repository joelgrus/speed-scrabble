const DIST = {
    A: 9, B: 2, C: 2, D: 4, E: 12, F: 2, G: 3, H: 2, I: 9, J: 1, K: 1, L: 4, M: 2,
    N: 6, O: 8, P: 2, Q: 1, R: 6, S: 4, T: 6, U: 4, V: 2, W: 2, X: 1, Y: 2, Z: 1
};
export function buildBag(rng) {
    const tiles = [];
    let id = 0;
    Object.keys(DIST).forEach(letter => {
        const n = DIST[letter];
        for (let i = 0; i < n; i++)
            tiles.push({ id: `t${id++}`, letter });
    });
    // Fisher–Yates shuffle
    for (let i = tiles.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
    return tiles;
}
