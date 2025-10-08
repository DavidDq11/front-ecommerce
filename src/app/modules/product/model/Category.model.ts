import { Product } from './Product.model';
export interface Category {
  id: number;
  title: string;
  products: string[];
}

export interface CategoryFilter {
  id: number;
  label: string;
  value: Product['category']; // Usar el tipo de unión literal de Product
  checked: boolean;
}
