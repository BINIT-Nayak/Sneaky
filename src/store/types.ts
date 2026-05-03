import type { Product } from "../samples/product";

export interface UIStateProps {
  isAuthModalOpen: boolean;
  isLoggedIn: boolean;
  products: Product[];
  productsLoading: boolean;
  productsError: string | null;
}
