// src/types/product.ts
export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  brand: string;
  category: string;
}

export const sampleProducts: Product[] = [
  {
    id: "1",
    name: "Nike Air Max 2024",
    price: 12999,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
    description: "The latest Air Max with maximum comfort and style",
    brand: "Nike",
    category: "Sneakers"
  },
  {
    id: "2",
    name: "Adidas Ultraboost",
    price: 15999,
    image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500",
    description: "Ultimate running comfort with energy return",
    brand: "Adidas",
    category: "Running"
  },
  {
    id: "3",
    name: "Puma Suede Classic",
    price: 4999,
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500",
    description: "Classic suede sneakers for everyday wear",
    brand: "Puma",
    category: "Casual"
  },
  {
    id: "4",
    name: "Vans Old Skool",
    price: 5999,
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500",
    description: "Iconic skate shoe with durable construction",
    brand: "Vans",
    category: "Skate"
  },
  {
    id: "5",
    name: "Converse Chuck Taylor",
    price: 3999,
    image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=500",
    description: "Timeless classic high-top sneakers",
    brand: "Converse",
    category: "Casual"
  }
];