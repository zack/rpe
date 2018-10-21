
/**
 *  "EffortLevel"
 *
 *  The Rated Perceived Exertion scale is an attempt to quantify a 1-rep max weight given an overall "level of effort" and
 *  "number of reps". Each level of effort bears a different meaning:
 *
 *   6 = Hard
 *     .  .
 *    \____/
 *
 *   7 = Harder
 *     *  *'
 *    \____/
 *
 *   8 = Very Hard
 *     *  *'
 *     ____
 *
 *   9 = Extremely hard
 *     *  *'
 *      O
 *
 *   10 = Maximum Effort
 *     X  X'
 *      O
 *
 *  */
export type EffortLevel = "10" | "9" | "8" | "7" | "6";

/**
 * This RPE chart tracks Rep Counts of 1 - 12
 * */
export type RepCount = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12";

export class RPE {

    static values = new Map<EffortLevel, Map<RepCount, number>>([
        [
            <EffortLevel> "10",
            new Map<RepCount, number>([
                ["1", 1],
                ["2", 0.96],
                ["3", 0.92],
                ["4", 0.89],
                ["5", 0.86],
                ["6", 0.84],
                ["7", 0.81],
                ["8", 0.79],
                ["9", 0.76],
                ["10", 0.74],
                ["11", 0.71],
                ["12", 0.69],
            ])
        ],
        [
            <EffortLevel> "9",
            new Map<RepCount, number>([
                ["1", 0.96,],
                ["2", 0.92,],
                ["3", 0.89,],
                ["4", 0.86,],
                ["5", 0.84,],
                ["6", 0.81,],
                ["7", 0.79,],
                ["8", 0.76,],
                ["9", 0.74,],
                ["10", 0.71,],
                ["11", 0.69,],
                ["12", 0.66],
            ])
        ],
        [
            <EffortLevel> "8",
            new Map<RepCount, number>([
                ["1", 0.92,],
                ["2", 0.89,],
                ["3", 0.86,],
                ["4", 0.84,],
                ["5", 0.81,],
                ["6", 0.79,],
                ["7", 0.76,],
                ["8", 0.74,],
                ["9", 0.71,],
                ["10", 0.68,],
                ["11", 0.66,],
                ["12", 0.63],
            ])
        ],
        [
            <EffortLevel> "7",
            new Map<RepCount, number>([
                ["1", 0.89,],
                ["2", 0.86,],
                ["3", 0.84,],
                ["4", 0.81,],
                ["5", 0.79,],
                ["6", 0.76,],
                ["7", 0.74,],
                ["8", 0.71,],
                ["9", 0.68,],
                ["10", 0.65,],
                ["11", 0.63,],
                ["12", 0.6],
            ])
        ],
        [
            <EffortLevel> "6",
            new Map<RepCount, number>([
                ["1", 0.86],
                ["2", 0.83],
                ["3", 0.8],
                ["4", 0.78],
                ["5", 0.75],
                ["6", 0.73],
                ["7", 0.7],
                ["8", 0.67],
                ["9", 0.65],
                ["10", 0.62],
                ["11", 0.6],
                ["12", 0.57]
            ])
        ]
    ]);

    static getFactor(effort: EffortLevel | string, reps: RepCount | string): number {
        return RPE.values.get(effort as EffortLevel).get(reps as RepCount);
    }

    static get1RM(weight: number, effort: EffortLevel | string, reps: RepCount | string): number {
        return weight / RPE.getFactor(effort, reps);
    }

}