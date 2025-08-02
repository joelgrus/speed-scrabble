import { z } from "zod";
export const CoordZ = z.object({ x: z.number().int(), y: z.number().int() });
export const OrientationZ = z.union([z.literal("H"), z.literal("V")]);
export const TileZ = z.object({
    id: z.string(),
    letter: z.string().regex(/^[A-Z]$/),
});
export const PlacedTileZ = z.object({
    id: z.string(),
    letter: z.string().regex(/^[A-Z]$/),
    x: z.number().int(),
    y: z.number().int(),
});
export const BoardZ = z.record(z.string(), PlacedTileZ);
export const RulesZ = z.object({
    startDraw: z.number().int().min(1).max(15),
    peelDraw: z.number().int().min(1).max(3),
    dumpEnabled: z.boolean(),
});
export const ValidationIssueZ = z.object({
    word: z.string(),
    cells: z.array(CoordZ),
});
export const ValidationResultZ = z.object({
    ok: z.boolean(),
    issues: z.array(ValidationIssueZ),
});
