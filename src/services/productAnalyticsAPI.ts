import { apiRequest } from "./api";

export const productAnalyticsApi = {
  recordProductPass: (productId: string) =>
    apiRequest<void>(`/api/product-analytics/products/${productId}/pass`, {
      auth: true,
      method: "POST",
    }),
};
