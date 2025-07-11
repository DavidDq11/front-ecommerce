import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CategoryFilter, Product } from '../model';
import { ProductService } from './product.service';

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  public filteredProducts = new BehaviorSubject<Product[]>([]);
  public filterList = new BehaviorSubject<CategoryFilter[]>([
    { id: 1, label: 'Alimentos Secos', value: 'DryFood', checked: false },
    { id: 2, label: 'Alimentos Húmedos', value: 'WetFood', checked: false },
    { id: 3, label: 'Snacks', value: 'Snacks', checked: false },
    { id: 4, label: 'Arena para Gatos', value: 'Litter', checked: false }
  ]);
  private originalProducts: Product[] = []; // Almacenar productos originales

  constructor(private productService: ProductService) {}

  setAllProducts(products: Product[]) {
    this.originalProducts = [...products]; // Guardar copia de los productos originales
    this.filteredProducts.next([...products]); // Inicializar productos filtrados
  }

  applyPriceFilter(minPrice: number, maxPrice: number) {
    // Filtrar los productos originales según el rango de precios
    const filtered = this.originalProducts.filter(product => 
      product.price >= minPrice && product.price <= maxPrice
    );
    this.filteredProducts.next(filtered);
    // console.log('Productos filtrados por precio:', filtered.length);
  }
}