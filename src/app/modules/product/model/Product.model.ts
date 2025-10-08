export interface Product {
  id: number;
  title: string;
  description: string;
  category: 'Alimentos Secos' | 'Alimentos Húmedos' | 'Snacks' | 'Arena para Gatos' | 'Accesorios' | 'Productos Veterinarios';
  type: 'Alimentos' | 'Snack' | 'Juguete' | 'Cuidado' | 'Arena';
  animal_category: 'Perro' | 'Gato' | 'Hámster' | 'Pájaro' | 'Caballo' | 'Vaca' | 'Otros';
  brand?: string;
  sizes: { size_id: number; size: string; price: number; stock_quantity: number; image_url?: string }[];
  images: { image_id: number; image_url: string }[];
  price: number;
  prevprice?: number;
  stock: string;
  rating: { rate: number; count: number };
  size?: string;
  size_id?: number;
  qty?: number;
  totalprice?: number;
}