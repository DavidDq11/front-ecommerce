export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  type: string;
  sizes?: { size_id: number; size: string; price: number; stock_quantity: number; image_url?: string }[];
  size?: string;
  images: { image_id: number; image_url: string }[];
  stock: string;
  price: number;
  prevprice?: number;
  qty?: number;
  discount?: number;
  totalprice?: number;
  rating: {
    rate: number;
    count: number;
  };
}