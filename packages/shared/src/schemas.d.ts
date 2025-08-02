import { z } from "zod";
export declare const CoordZ: z.ZodObject<{
    x: z.ZodNumber;
    y: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    x: number;
    y: number;
}, {
    x: number;
    y: number;
}>;
export declare const OrientationZ: z.ZodUnion<[z.ZodLiteral<"H">, z.ZodLiteral<"V">]>;
export declare const TileZ: z.ZodObject<{
    id: z.ZodString;
    letter: z.ZodString;
}, "strip", z.ZodTypeAny, {
    letter: string;
    id: string;
}, {
    letter: string;
    id: string;
}>;
export declare const PlacedTileZ: z.ZodObject<{
    id: z.ZodString;
    letter: z.ZodString;
    x: z.ZodNumber;
    y: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    letter: string;
    id: string;
    x: number;
    y: number;
}, {
    letter: string;
    id: string;
    x: number;
    y: number;
}>;
export declare const BoardZ: z.ZodRecord<z.ZodString, z.ZodObject<{
    id: z.ZodString;
    letter: z.ZodString;
    x: z.ZodNumber;
    y: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    letter: string;
    id: string;
    x: number;
    y: number;
}, {
    letter: string;
    id: string;
    x: number;
    y: number;
}>>;
export declare const RulesZ: z.ZodObject<{
    startDraw: z.ZodNumber;
    peelDraw: z.ZodNumber;
    dumpEnabled: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    startDraw: number;
    dumpEnabled: boolean;
    peelDraw: number;
}, {
    startDraw: number;
    dumpEnabled: boolean;
    peelDraw: number;
}>;
export declare const ValidationIssueZ: z.ZodObject<{
    word: z.ZodString;
    cells: z.ZodArray<z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        x: number;
        y: number;
    }, {
        x: number;
        y: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    word: string;
    cells: {
        x: number;
        y: number;
    }[];
}, {
    word: string;
    cells: {
        x: number;
        y: number;
    }[];
}>;
export declare const ValidationResultZ: z.ZodObject<{
    ok: z.ZodBoolean;
    issues: z.ZodArray<z.ZodObject<{
        word: z.ZodString;
        cells: z.ZodArray<z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            x: number;
            y: number;
        }, {
            x: number;
            y: number;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        word: string;
        cells: {
            x: number;
            y: number;
        }[];
    }, {
        word: string;
        cells: {
            x: number;
            y: number;
        }[];
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    ok: boolean;
    issues: {
        word: string;
        cells: {
            x: number;
            y: number;
        }[];
    }[];
}, {
    ok: boolean;
    issues: {
        word: string;
        cells: {
            x: number;
            y: number;
        }[];
    }[];
}>;
//# sourceMappingURL=schemas.d.ts.map