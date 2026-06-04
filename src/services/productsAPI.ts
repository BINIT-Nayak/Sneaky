import type { Product } from "../store/types";

import { apiRequest } from "./api";

type GetProductsOptions = {
  excludeProductIds?: string[];
};

export const productsApi = {
  getProducts: ({ excludeProductIds = [] }: GetProductsOptions = {}) => {
    const searchParams = new URLSearchParams();

    excludeProductIds.forEach((productId) => {
      searchParams.append("excludeIds", productId);
    });

    const queryString = searchParams.toString();

    return apiRequest<Product[]>(
      `/api/products/recommended${queryString ? `?${queryString}` : ""}`,
      {
        auth: "optional",
      },
    );
  },
};
