import {Profile} from "../profiles/types";

export function compatibilityScore (
    a : Profile,
    b : Profile
) : number {
    let score = 100;

    score -= Math.abs(a.budget - b.budget) / 10;
    score -= Math.abs(a.bedtime - b.bedtime) * 5;
    score -= Math.abs(a.cleanliness - b.cleanliness) * 4;

    return Math.max(0, Math.round(score)); // return score
}