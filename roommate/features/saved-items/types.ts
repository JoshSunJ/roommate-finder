export type SavedItemTargetType = "listing" | "housing_request";

export type SavedItemTarget = {
  targetType: SavedItemTargetType;
  targetId: number;
};

export type SavedItemIds = {
  listingIds: number[];
  housingRequestIds: number[];
};
