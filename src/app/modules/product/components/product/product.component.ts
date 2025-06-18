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
  pagedProducts: Product[] = []; // Only current page's products
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

  // Pagination variables
  currentPage = 1;
  pageSize = 25;
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
      this.currentPage = 1; // Reset to page 1 on category change
      this.getProductsByCategory();
    });
  }

  subscribeToFilteredProducts() {
    this.subsFilterProducts = this.filterService.filteredProducts.subscribe((data) => {
      this.pagedProducts = [...data]; // Sync with filtered paginated data
      console.log('Productos filtrados actualizados (page', this.currentPage, '):', this.pagedProducts.length, this.pagedProducts);
    });
  }

  getProductsByCategory(): void {
    this.isLoading = true;
    this.ratingList = [false, false, false, false];
    this.resetFilter();
    const offset = (this.currentPage - 1) * this.pageSize;
    console.log('Fetching page', this.currentPage, 'with offset', offset, 'limit', this.pageSize);
    this.productService.getByCategory(this.category, this.pageSize, offset).subscribe(
      (response) => {
        this.isLoading = false;
        if (response.products.length === 0) {
          this.pagedProducts = [];
          this.totalItems = 0;
          this.totalPages = 1;
          this.filterService.setAllProducts([]);
          this.filterService.filterProduct([]);
        } else {
          this.pagedProducts = [...response.products];
          this.totalItems = response.total;
          this.totalPages = response.totalPages;
          this.filterService.setAllProducts(this.pagedProducts);
          this.filterService.filterProduct(this.pagedProducts);
        }
        const initialCategoryId = this.getCategoryIdFromLabel(this.category);
        if (initialCategoryId && this.currentPage === 1) {
          this.selectedFilter.categoryId.next(initialCategoryId);
          this.filterService.setSelectedCategory(initialCategoryId);
          this.applyInitialFilter(initialCategoryId);
        }
        console.log('Backend response for page', this.currentPage, ':', response);
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

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getProductsByCategory();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.getProductsByCategory();
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.getProductsByCategory();
    }
  }

  goToFirstPage() {
    if (this.currentPage !== 1) {
      this.currentPage = 1;
      this.getProductsByCategory();
    }
  }

  goToLastPage() {
    if (this.currentPage !== this.totalPages) {
      this.currentPage = this.totalPages;
      this.getProductsByCategory();
    }
  }

  getPageNumbers(): number[] {
    const pages = [];
    const maxPagesToShow = 5; // Número máximo de páginas visibles
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  ngOnDestroy(): void {
    if (this.subsFilterProducts) {
      this.subsFilterProducts.unsubscribe();
    }
  }
}