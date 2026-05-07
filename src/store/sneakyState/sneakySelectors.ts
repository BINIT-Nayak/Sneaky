import { useSelector } from "react-redux";

import type { AsyncStatus, UIStateProps } from "../types";

export const useSneakyStateSlice = {
  getIsAuthModalOpen: (): boolean => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useSelector(
      ({ sneakyState }: { sneakyState: UIStateProps }) =>
        sneakyState.isAuthModalOpen,
    );
  },
  getIsLoggedIn: (): boolean => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useSelector(
      ({ sneakyState }: { sneakyState: UIStateProps }) =>
        sneakyState.isLoggedIn,
    );
  },
  getProducts: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useSelector(
      ({ sneakyState }: { sneakyState: UIStateProps }) => sneakyState.products,
    );
  },
  getProductsLoading: (): boolean => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useSelector(
      ({ sneakyState }: { sneakyState: UIStateProps }) =>
        sneakyState.productsLoading,
    );
  },
  getProductsError: (): string | null => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useSelector(
      ({ sneakyState }: { sneakyState: UIStateProps }) =>
        sneakyState.productsError,
    );
  },

  getWishlist: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useSelector(
      ({ sneakyState }: { sneakyState: UIStateProps }) => sneakyState.wishlist,
    );
  },

  getWishlistLoading: (): boolean => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useSelector(
      ({ sneakyState }: { sneakyState: UIStateProps }) =>
        sneakyState.wishlistLoading,
    );
  },

  getWishlistStatus: (): AsyncStatus => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useSelector(
      ({ sneakyState }: { sneakyState: UIStateProps }) =>
        sneakyState.wishlistStatus,
    );
  },

  getWishlistError: (): string | null => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useSelector(
      ({ sneakyState }: { sneakyState: UIStateProps }) =>
        sneakyState.wishlistError,
    );
  },
};
