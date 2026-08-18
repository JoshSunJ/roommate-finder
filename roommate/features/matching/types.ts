import type { Listing } from "@/features/listings/types";

export type MatchCriterionStatus = "strong" | "tradeoff" | "weak";

export type MatchCriterion = {
  key: "budget" | "location" | "availability" | "bedrooms";
  label: string;
  points: number;
  maxPoints: number;
  status: MatchCriterionStatus;
  explanation: string;
};

export type MatchBand = "strong" | "promising" | "stretch";

export type ListingRecommendation = {
  listing: Listing;
  score: number;
  band: MatchBand;
  criteria: MatchCriterion[];
};
