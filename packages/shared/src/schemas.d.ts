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
export declare const LetterZ: z.ZodEnum<["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]>;
export declare const TileZ: z.ZodObject<{
    id: z.ZodString;
    letter: z.ZodEnum<["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]>;
}, "strip", z.ZodTypeAny, {
    id: string;
    letter: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z";
}, {
    id: string;
    letter: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z";
}>;
export declare const PlacedTileZ: z.ZodObject<{
    id: z.ZodString;
    letter: z.ZodEnum<["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]>;
    x: z.ZodNumber;
    y: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    x: number;
    y: number;
    id: string;
    letter: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z";
}, {
    x: number;
    y: number;
    id: string;
    letter: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z";
}>;
export declare const BoardZ: z.ZodRecord<z.ZodString, z.ZodObject<{
    id: z.ZodString;
    letter: z.ZodEnum<["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]>;
    x: z.ZodNumber;
    y: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    x: number;
    y: number;
    id: string;
    letter: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z";
}, {
    x: number;
    y: number;
    id: string;
    letter: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z";
}>>;
export declare const GameModeZ: z.ZodEnum<["classic", "timed", "custom"]>;
export declare const BaseRulesZ: z.ZodObject<{
    startDraw: z.ZodNumber;
    drawAmount: z.ZodNumber;
    dumpEnabled: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    startDraw: number;
    drawAmount: number;
    dumpEnabled: boolean;
}, {
    startDraw: number;
    drawAmount: number;
    dumpEnabled: boolean;
}>;
export declare const TimedGameRulesZ: z.ZodObject<{
    startDraw: z.ZodNumber;
    drawAmount: z.ZodNumber;
    dumpEnabled: z.ZodBoolean;
} & {
    gameDuration: z.ZodNumber;
    dumpTimePenalty: z.ZodNumber;
    maxDumps: z.ZodNumber;
    timeBonus: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    startDraw: number;
    drawAmount: number;
    dumpEnabled: boolean;
    gameDuration: number;
    dumpTimePenalty: number;
    maxDumps: number;
    timeBonus: number;
}, {
    startDraw: number;
    drawAmount: number;
    dumpEnabled: boolean;
    gameDuration: number;
    dumpTimePenalty: number;
    maxDumps: number;
    timeBonus: number;
}>;
export declare const GameRulesZ: z.ZodObject<{
    mode: z.ZodEnum<["classic", "timed", "custom"]>;
    base: z.ZodObject<{
        startDraw: z.ZodNumber;
        drawAmount: z.ZodNumber;
        dumpEnabled: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        startDraw: number;
        drawAmount: number;
        dumpEnabled: boolean;
    }, {
        startDraw: number;
        drawAmount: number;
        dumpEnabled: boolean;
    }>;
    timed: z.ZodOptional<z.ZodObject<{
        startDraw: z.ZodNumber;
        drawAmount: z.ZodNumber;
        dumpEnabled: z.ZodBoolean;
    } & {
        gameDuration: z.ZodNumber;
        dumpTimePenalty: z.ZodNumber;
        maxDumps: z.ZodNumber;
        timeBonus: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        startDraw: number;
        drawAmount: number;
        dumpEnabled: boolean;
        gameDuration: number;
        dumpTimePenalty: number;
        maxDumps: number;
        timeBonus: number;
    }, {
        startDraw: number;
        drawAmount: number;
        dumpEnabled: boolean;
        gameDuration: number;
        dumpTimePenalty: number;
        maxDumps: number;
        timeBonus: number;
    }>>;
}, "strip", z.ZodTypeAny, {
    mode: "classic" | "timed" | "custom";
    base: {
        startDraw: number;
        drawAmount: number;
        dumpEnabled: boolean;
    };
    timed?: {
        startDraw: number;
        drawAmount: number;
        dumpEnabled: boolean;
        gameDuration: number;
        dumpTimePenalty: number;
        maxDumps: number;
        timeBonus: number;
    } | undefined;
}, {
    mode: "classic" | "timed" | "custom";
    base: {
        startDraw: number;
        drawAmount: number;
        dumpEnabled: boolean;
    };
    timed?: {
        startDraw: number;
        drawAmount: number;
        dumpEnabled: boolean;
        gameDuration: number;
        dumpTimePenalty: number;
        maxDumps: number;
        timeBonus: number;
    } | undefined;
}>;
export declare const RulesZ: z.ZodObject<{
    startDraw: z.ZodNumber;
    drawAmount: z.ZodNumber;
    dumpEnabled: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    startDraw: number;
    drawAmount: number;
    dumpEnabled: boolean;
}, {
    startDraw: number;
    drawAmount: number;
    dumpEnabled: boolean;
}>;
export declare const CursorZ: z.ZodObject<{
    pos: z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        x: number;
        y: number;
    }, {
        x: number;
        y: number;
    }>;
    orient: z.ZodUnion<[z.ZodLiteral<"H">, z.ZodLiteral<"V">]>;
}, "strip", z.ZodTypeAny, {
    pos: {
        x: number;
        y: number;
    };
    orient: "H" | "V";
}, {
    pos: {
        x: number;
        y: number;
    };
    orient: "H" | "V";
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
    connected: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    issues: {
        word: string;
        cells: {
            x: number;
            y: number;
        }[];
    }[];
    ok: boolean;
    connected: boolean;
}, {
    issues: {
        word: string;
        cells: {
            x: number;
            y: number;
        }[];
    }[];
    ok: boolean;
    connected: boolean;
}>;
//# sourceMappingURL=schemas.d.ts.map