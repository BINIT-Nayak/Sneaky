import { apiRequest } from "./api";

export type UserEventType =
  | "IMPRESSION"
  | "VIEW"
  | "CLICK"
  | "SKIP"
  | "WISHLIST"
  | "CART"
  | "PURCHASE";

export type TrackUserEventRequest = {
  productId: string;
  type: UserEventType;
  source?: string;
  position?: number;
  quantity?: number;
  metadata?: Record<string, unknown>;
};

export const eventApi = {
  track: (payload: TrackUserEventRequest) =>
    apiRequest<void>("/api/events", {
      auth: true,
      method: "POST",
      body: payload,
    }),
};
