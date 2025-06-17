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

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private filterService: FilterService
  ) {}

  ngOnInit(): void {
    this.subscribeToFilteredProducts();
    this.route.params.subscribe((data: Params) => {
      this.category = data['category'];
      this.getProductsByCategory();
    });
  }

  subscribeToFilteredProducts() {
    this.subsFilterProducts = this.filterService.filteredProducts.subscribe((data) => {
      this.products = data;
      console.log('Productos filtrados actualizados:', this.products);
    });
  }

  getProductsByCategory(): void {
    this.isLoading = true;
    this.ratingList = [false, false, false, false];
    this.resetFilter();
    this.productService.getByCategory(this.category).subscribe(
      (data) => {
        this.isLoading = false;
        this.products = data;
        this.cloneOfProducts = [...data];
        this.filterService.setAllProducts(data);
        this.filterService.getProductTypeFilter(this.category);

        const initialCategoryId = this.getCategoryIdFromLabel(this.category);
        if (initialCategoryId) {
          this.selectedFilter.categoryId.next(initialCategoryId);
          this.filterService.setSelectedCategory(initialCategoryId);
          this.applyInitialFilter(initialCategoryId);
        }
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

  ngOnDestroy(): void {
    if (this.subsFilterProducts) {
      this.subsFilterProducts.unsubscribe();
    }
  }
}