import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CategoryFilter, Product } from '../model';
import { ProductService } from './product.service';

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  public filteredProducts = new BehaviorSubject<Product[]>([]);
  public filterList = new BehaviorSubject<CategoryFilter[]>([]);
  private allProducts: Product[] = []; // Holds only the current page's products
  public selectedCategoryId = new BehaviorSubject<number | null>(null);

  constructor(private productService: ProductService) {}

  // Set all products to the current page's data
  setAllProducts(products: Product[]) {
    this.allProducts = [...products]; // Only store the current page's products
    this.filterProduct(products); // Initial filter with current page data
  }

  // Update filtered products based on the input (current page or filtered subset)
  filterProduct(products: Product[]) {
    this.filteredProducts.next([...products]); // Ensure a new array reference
  }

  // Fetch and set product type filter based on category
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
        this.setAllProducts(response.products); // Set only the fetched page's products
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
          this.filterProduct(this.allProducts); // Use current page data
        }
      },
      error => console.error('Error fetching products:', error)
    );
  }

  // Filter by price range using current page's products
  handlePriceFilter(min: number, max: number) {
    const products = this.allProducts.filter(item => item.price >= min && item.price <= max);
    this.filterProduct(products);
  }

  // Filter by category using current page's products
  handleCatFilter(checkedItems: CategoryFilter[]): Product[] {
    let filteredProducts = [...this.allProducts]; // Start with current page data
    const checkedValues = checkedItems.filter(item => item.checked).map(item => item.value);

    if (checkedValues.length > 0) {
      filteredProducts = filteredProducts.filter(product => checkedValues.includes(product.category));
    }

    this.filterProduct(filteredProducts);
    return filteredProducts;
  }

  // Filter by rating using current page's products
  handleRateFilter(rating: number): Product[] {
    const filteredProducts = this.allProducts.filter(item => Math.trunc(item.rating?.rate || 0) >= rating);
    this.filterProduct(filteredProducts);
    return filteredProducts;
  }

  // Update selected category
  setSelectedCategory(categoryId: number | null) {
    this.selectedCategoryId.next(categoryId);
  }
}