export type AsyncStatus = "idle" | "loading" | "succeeded" | "failed";

export interface UIStateProps {
  isAuthModalOpen: boolean;
  isLoggedIn: boolean;

  products: Product[];
  productsLoading: boolean;
  productsError: string | null;

  wishlist: IWishlistItem[];
  wishlistStatus: AsyncStatus;
  wishlistLoading: boolean;
  wishlistError: string | null;

  cart: ICartItem[];
  cartStatus: AsyncStatus;
  cartLoading: boolean;
  cartError: string | null;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  brand: string;
  category: string;
}

export type IWishlistItem = {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  brandName: string;
};

export type IAddToWishlistRequestProp = {
  productId: string;
};

export type ICartItem = {
  productId: string;
  name: string;
  price: number;
  currency: string;
  imageUrl: string;
  brandName: string;
  quantity: number;
  itemTotal: number;
};

export type IAddToCartRequestProp = {
  productId: string;
  quantity?: number;
};

export type IUpdateCartQuantityRequestProp = {
  productId: string;
  quantity: number;
};
