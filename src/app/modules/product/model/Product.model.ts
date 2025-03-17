export interface Product {
  id: number | string; // Allow both number and string for Rocketfy products
  title: string;
  description: string;
  category: string;
  type: string;
  sizes?: string[];
  size?: string;
  images: string[];
  stock: string;
  price: number;
  prevprice: number;
  qty?: number;
  discount?: number;
  totalprice?: number;
  rating: {
    rate: number;
    count: number;
  };
  source?: string; // Optional field to identify the source ("Database" or "Rocketfy")
}