import { eventApi } from "./eventAPI";

export const productAnalyticsApi = {
  recordProductPass: (productId: string) =>
    eventApi.track({
      productId,
      type: "SKIP",
      source: "DISCOVERY_FEED",
    }),
};
