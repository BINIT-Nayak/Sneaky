import type { Product } from "../samples/product";

export interface CartItem extends Product {
  quantity: number;
}

// Wishlist functions
export const getWishlist = (): Product[] => {
  const saved = localStorage.getItem("sneaky_wishlist");
  return saved ? JSON.parse(saved) : [];
};

export const addToWishlist = (product: Product): void => {
  const wishlist = getWishlist();
  if (!wishlist.some((item) => item.id === product.id)) {
    wishlist.push(product);
    localStorage.setItem("sneaky_wishlist", JSON.stringify(wishlist));
  }
};

export const removeFromWishlist = (productId: string): void => {
  const wishlist = getWishlist();
  const filtered = wishlist.filter((item) => item.id !== productId);
  localStorage.setItem("sneaky_wishlist", JSON.stringify(filtered));
};

export const isInWishlist = (productId: string): boolean => {
  return getWishlist().some((item) => item.id === productId);
};

// Cart functions
export const getCart = (): CartItem[] => {
  const saved = localStorage.getItem("sneaky_cart");
  return saved ? JSON.parse(saved) : [];
};

export const addToCart = (product: Product): void => {
  const cart = getCart();
  const existingItem = cart.find((item) => item.id === product.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  localStorage.setItem("sneaky_cart", JSON.stringify(cart));
};

export const removeFromCart = (productId: string): void => {
  const cart = getCart();
  const filtered = cart.filter((item) => item.id !== productId);
  localStorage.setItem("sneaky_cart", JSON.stringify(filtered));
};

export const updateCartQuantity = (
  productId: string,
  quantity: number,
): void => {
  const cart = getCart();
  const item = cart.find((item) => item.id === productId);

  if (item) {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      item.quantity = quantity;
      localStorage.setItem("sneaky_cart", JSON.stringify(cart));
    }
  }
};

export const getCartTotal = (): number => {
  const cart = getCart();
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
};

export const getCartItemCount = (): number => {
  const cart = getCart();
  return cart.reduce((count, item) => count + item.quantity, 0);
};

export const clearCart = (): void => {
  localStorage.removeItem("sneaky_cart");
};
