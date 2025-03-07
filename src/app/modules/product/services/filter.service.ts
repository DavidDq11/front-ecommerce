import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CategoryFilter, Product } from '../model';
import { ProductService } from './product.service';

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  public filteredProducts = new BehaviorSubject<Product[]>([]);
  filterList = new BehaviorSubject<CategoryFilter[]>([]);
  products!: Product[];
  private allProducts: Product[] = [];
  category = '';
  selectedCategoryId = new BehaviorSubject<number | null>(null);
  cloneOfProducts!: Product[];

  constructor(private productService: ProductService) {}

  // Emitir productos filtrados
  filterProduct(products: Product[]) {
    return this.filteredProducts.next(products);
  }

  // Establecer todos los productos iniciales
  setAllProducts(products: Product[]) {
    this.allProducts = products;
    this.cloneOfProducts = [...products];
    this.filteredProducts.next(products); // Mostrar todos inicialmente
  }

  // Obtener productos filtrados por tipo
  getProductTypeFilter(type: string) {
    let prodTypes: CategoryFilter[] = [];
    this.category = type; // Podrías renombrar esta variable a 'type' para evitar confusión
    this.productService.getByType(type).subscribe(
      (data: { products: Product[]; total: number; page: number; totalPages: number }) => {
        this.products = data.products;
        this.cloneOfProducts = data.products;
        const types = [...new Set(this.cloneOfProducts.map(item => item.type))];
        const typeMap = {
          'Alimento': 1, 'Juguete': 2, 'Higiene': 3, 'Accesorio': 4,
          'Snack': 5, 'Habitat': 6, 'Equipo': 7, 'Suplemento': 8
        };

        types.forEach((typeValue) => {
          const id = typeMap[typeValue as keyof typeof typeMap] || 1;
          prodTypes.push({
            label: typeValue,
            value: typeValue,
            checked: id === this.selectedCategoryId.getValue(),
            id: id
          });
        });
        this.filterList.next(prodTypes);

        const selectedId = this.selectedCategoryId.getValue();
        if (selectedId) {
          const checkedItems = prodTypes.map(item => ({
            ...item,
            checked: item.id === selectedId
          }));
          this.handleCatFilter(checkedItems);
        } else {
          this.filterProduct(this.cloneOfProducts);
        }
      },
      error => console.error('Error fetching product types:', error)
    );
  }

  // Filtrar por precio
  handlePriceFilter(min: number, max: number) {
    const products = this.cloneOfProducts.filter(item => item.price >= min && item.price <= max);
    this.filterProduct(products);
  }

  // Filtrar por tipo (en el frontend)
  handleCatFilter(checkedItems: CategoryFilter[]): Product[] {
    let filteredProducts = [...this.cloneOfProducts];
    const checkedValues = checkedItems.filter(item => item.checked).map(item => item.value);

    if (checkedValues.length > 0) {
      filteredProducts = filteredProducts.filter(product => checkedValues.includes(product.type));
    }

    this.filterProduct(filteredProducts);
    return filteredProducts;
  }

  // Filtrar por calificación
  handleRateFilter(rating: number): Product[] {
    this.productService.getByCategory(this.category).subscribe(data => this.products = data); // Esto sigue usando category
    this.filterProduct(this.products);
    this.filteredProducts.subscribe((data: Product[]) => {
      this.products = data.filter(item => rating <= Math.trunc(item.rating.rate));
    });
    return this.products;
  }

  // Establecer categoría seleccionada
  setSelectedCategory(categoryId: number | null) {
    this.selectedCategoryId.next(categoryId);
  }
}