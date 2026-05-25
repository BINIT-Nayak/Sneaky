
import type { Product } from "../store/types";

export const UNIQUE_PRODUCT_MESSAGE = "This product is unique";

type ProductDetailsSource = Pick<
  Product,
  "colors" | "id" | "sizes" | "stockStatus"
>;

export const getSneakerDetails = (
  product?: Partial<ProductDetailsSource> | null,
) => {
  const colors = product?.colors ?? [];
  const sizes = product?.sizes ?? [];

  return {
    colors,
    isUnique: colors.length === 0 || sizes.length === 0,
    sizes,
    stockStatus: product?.stockStatus ?? "",
  };
};
