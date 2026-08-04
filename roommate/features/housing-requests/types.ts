export type HousingRequestStatus = "active" | "matched" | "closed";

export interface HousingRequest {
  id: number;
  ownerId: number;
  title: string;
  maxRent: number;
  preferredLocation: string;
  description: string;
  moveInDate: string;
  moveOutDate: string;
  bedroomsNeeded: number;
  status: HousingRequestStatus;
  requestedBy: string;
}

// The browser supplies the request details, but never the id or owner id.
// Those facts are created by the server from the authenticated session.
export type CreateHousingRequestInput = Omit<
  HousingRequest,
  "id" | "ownerId" | "requestedBy" | "status"
>;
