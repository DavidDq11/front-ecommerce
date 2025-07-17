export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  type: string;
  animal_category: string;
  brand?: string;
  sizes: { size_id: number; size: string; price: number; stock_quantity: number; image_url?: string }[];
  images: { image_id: number; image_url: string }[];
  price: number;
  prevprice?: number;
  stock: string;
  rating: { rate: number; count: number };
  size?: string; // Tamaño seleccionado
  size_id?: number; // ID del tamaño seleccionado (opcional)
  qty?: number; // Cantidad en el carrito
  totalprice?: number; // Precio total (price * qty)
}