import type { Product } from "../store/types";

import { apiRequest } from "./api";

export const productsApi = {
  getProducts: () =>
    apiRequest<Product[]>("/api/products/recommended", {
      auth: "optional",
    }),
};
