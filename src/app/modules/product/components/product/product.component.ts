import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { ActivatedRoute, Params } from '@angular/router';
import { Product } from '../../model';
import { FilterService } from '../../services/filter.service';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styles: [],
})
export class ProductComponent implements OnInit, OnDestroy {
  cloneOfProducts: Product[] = [];
  products: Product[] = [];
  pagedProducts: Product[] = [];
  category = '';
  isLoading = false;
  isFilter = false;
  error!: string;
  subsFilterProducts!: Subscription;

  selectedFilter: { rating: BehaviorSubject<number | null>; categoryId: BehaviorSubject<number | null> } = {
    rating: new BehaviorSubject<number | null>(null),
    categoryId: new BehaviorSubject<number | null>(null)
  };
  ratingList: boolean[] = [];

  // Variables de paginación
  currentPage = 1;
  pageSize = 25; // 25 productos por página
  totalItems = 0;
  totalPages = 1;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private filterService: FilterService
  ) {}

  ngOnInit(): void {
    this.subscribeToFilteredProducts();
    this.route.params.subscribe((data: Params) => {
      this.category = data['category'];
      this.currentPage = 1; // Reiniciar página al cambiar categoría
      this.getProductsByCategory();
    });
  }

  subscribeToFilteredProducts() {
    this.subsFilterProducts = this.filterService.filteredProducts.subscribe((data) => {
      this.products = [...data]; // Update products with filtered data
      this.updatePagedProducts(); // Update pagedProducts based on filtered data
      console.log('Productos filtrados actualizados (page', this.currentPage, '):', this.products.length, this.products);
    });
  }

  getProductsByCategory(): void {
    this.isLoading = true;
    this.ratingList = [false, false, false, false];
    this.resetFilter();
    const offset = (this.currentPage - 1) * this.pageSize;
    console.log('Fetching page', this.currentPage, 'with offset', offset); // Debug log
    this.productService.getByCategory(this.category, this.pageSize, offset).subscribe(
      (response) => {
        this.isLoading = false;
        if (response.products.length === 0) {
          this.products = [];
          this.cloneOfProducts = [];
          this.totalItems = 0;
          this.totalPages = 1;
          this.filterService.filterProduct([]); // Clear filteredProducts
        } else {
          this.products = [...response.products];
          this.cloneOfProducts = [...response.products];
          this.totalItems = response.total;
          this.totalPages = response.totalPages; // Use totalPages from response
          this.filterService.setAllProducts(this.products); // Update allProducts
          this.filterService.filterProduct(this.products); // Update filteredProducts with new page data
        }
        // Only apply initial filter if it's the first load or category changes
        const initialCategoryId = this.getCategoryIdFromLabel(this.category);
        if (initialCategoryId && this.currentPage === 1) { // Apply filter only on first page
          this.selectedFilter.categoryId.next(initialCategoryId);
          this.filterService.setSelectedCategory(initialCategoryId);
          this.applyInitialFilter(initialCategoryId);
        }
        // No need to call updatePagedProducts here; it will be triggered by the subscription
        console.log('Backend response for page', this.currentPage, ':', response); // Debug response
      },
      (error) => {
        this.isLoading = false;
        this.error = error.message;
        console.error('Error loading products:', error);
      }
    );
  }

  private getCategoryIdFromLabel(category: string): number | null {
    const typeMap = {
      'DryFood': 1,
      'WetFood': 2,
      'Snacks': 3,
      'Litter': 4
    };
    return typeMap[category as keyof typeof typeMap] || null;
  }

  private applyInitialFilter(categoryId: number): void {
    const checkedItems = this.filterService.filterList.getValue().map(item =>
      item.id === categoryId ? { ...item, checked: true } : { ...item, checked: false }
    );
    const filteredProducts = this.filterService.handleCatFilter(checkedItems);
    this.filterService.filterProduct(filteredProducts);
  }

  onFilter(value: boolean) {
    this.isFilter = value;
  }

  resetFilter() {
    this.selectedFilter.categoryId.next(null);
    this.selectedFilter.rating.next(null);
  }

  // Método para actualizar los productos paginados
  updatePagedProducts() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.totalItems); // Ensure endIndex doesn't exceed totalItems
    this.pagedProducts = this.products.slice(startIndex, endIndex);
    console.log('Paged products updated (page', this.currentPage, '):', this.pagedProducts.length, this.pagedProducts, 'from products:', this.products.length, this.products);
  }

  // Métodos para cambiar de página
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getProductsByCategory(); // Recargar productos para la nueva página
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.getProductsByCategory(); // Recargar productos para la nueva página
    }
  }

  ngOnDestroy(): void {
    if (this.subsFilterProducts) {
      this.subsFilterProducts.unsubscribe();
    }
  }
}