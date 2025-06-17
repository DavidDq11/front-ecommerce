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
  private allProducts: Product[] = [];
  selectedCategoryId = new BehaviorSubject<number | null>(null);

  constructor(private productService: ProductService) {}

  filterProduct(products: Product[]) {
    this.filteredProducts.next(products);
  }

  setAllProducts(products: Product[]) {
    this.allProducts = products;
    this.filteredProducts.next(products);
  }

  getProductTypeFilter(category: string) {
    const categoryMap = {
      'DryFood': 'Pet Food',
      'WetFood': 'Wet Food',
      'Snacks': 'Pet Treats',
      'Litter': 'Litter'
    };
    const backendCategory = categoryMap[category as keyof typeof categoryMap] || category;

    this.productService.getByCategory(backendCategory).subscribe(
      (response: { products: Product[], total: number }) => {
        this.setAllProducts(response.products);
        const prodTypes: CategoryFilter[] = [
          { id: 1, label: 'Alimentos Secos', value: 'Pet Food', checked: false },
          { id: 2, label: 'Alimentos Húmedos', value: 'Wet Food', checked: false },
          { id: 3, label: 'Snacks', value: 'Pet Treats', checked: false },
          { id: 4, label: 'Arena para Gatos', value: 'Litter', checked: false }
        ];

        const selectedId = this.selectedCategoryId.getValue();
        if (selectedId) {
          const checkedItems = prodTypes.map(item => ({
            ...item,
            checked: item.id === selectedId
          }));
          this.filterList.next(checkedItems);
          this.handleCatFilter(checkedItems);
        } else {
          this.filterList.next(prodTypes);
          this.filterProduct(response.products);
        }
      },
      error => console.error('Error fetching products:', error)
    );
  }

  handlePriceFilter(min: number, max: number) {
    const products = this.allProducts.filter(item => item.price >= min && item.price <= max);
    this.filterProduct(products);
  }

  handleCatFilter(checkedItems: CategoryFilter[]): Product[] {
    let filteredProducts = [...this.allProducts];
    const checkedValues = checkedItems.filter(item => item.checked).map(item => item.value);

    if (checkedValues.length > 0) {
      filteredProducts = filteredProducts.filter(product => checkedValues.includes(product.category));
    }

    this.filterProduct(filteredProducts);
    return filteredProducts;
  }

  handleRateFilter(rating: number): Product[] {
    const filteredProducts = this.allProducts.filter(item => Math.trunc(item.rating.rate) >= rating);
    this.filterProduct(filteredProducts);
    return filteredProducts;
  }

  setSelectedCategory(categoryId: number | null) {
    this.selectedCategoryId.next(categoryId);
  }
}