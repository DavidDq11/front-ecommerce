// src/app/modules/product/services/filter.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CategoryFilter, Product } from '../model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  public filteredProducts = new BehaviorSubject<Product[]>([]);
  public filterList = new BehaviorSubject<CategoryFilter[]>([]);
  private originalProducts: Product[] = [];

  constructor(private http: HttpClient) {
    this.loadValidCategories();
  }

  private loadValidCategories(): void {
    this.http.get<{ categories: string[] }>(`${environment.baseAPIURL}valid-values`).subscribe(
      (response) => {
        const filterList: CategoryFilter[] = response.categories.map((category, index) => ({
          id: index + 1,
          label: category,
          value: category as Product['category'], // Convertir al tipo de unión literal
          checked: false
        }));
        this.filterList.next(filterList);
      },
      (error) => {
        console.error('Error al cargar categorías válidas:', error);
        const fallbackCategories = [
          'Alimentos Secos',
          'Alimentos Húmedos',
          'Snacks',
          'Arena para Gatos',
          'Accesorios',
          'Productos Veterinarios'
        ] as const; // Inferir tipos literales
        const filterList: CategoryFilter[] = fallbackCategories.map((category, index) => ({
          id: index + 1,
          label: category,
          value: category,
          checked: false
        }));
        this.filterList.next(filterList);
      }
    );
  }

  setAllProducts(products: Product[]): void {
    this.originalProducts = [...products];
    this.applyFilters();
  }

  applyFilters(): void {
    const selectedCategories = this.filterList.value.filter(f => f.checked).map(f => f.value);
    const filtered = this.originalProducts.filter(product => 
      selectedCategories.length === 0 || selectedCategories.includes(product.category)
    );
    this.filteredProducts.next(filtered);
  }

  applyPriceFilter(minPrice: number, maxPrice: number): void {
    const selectedCategories = this.filterList.value.filter(f => f.checked).map(f => f.value);
    const filtered = this.originalProducts.filter(product => 
      (selectedCategories.length === 0 || selectedCategories.includes(product.category)) &&
      product.price >= minPrice && product.price <= maxPrice
    );
    this.filteredProducts.next(filtered);
  }
}