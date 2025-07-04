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
  pagedProducts: Product[] = [];
  category: string | null = null;
  brandId: number | null = null;
  selectedBrandName: string | null = null;
  isLoading = false;
  isFilter = false;
  error!: string;
  subsFilterProducts!: Subscription;

  selectedFilter: { rating: BehaviorSubject<number | null>; categoryId: BehaviorSubject<number | null> } = {
    rating: new BehaviorSubject<number | null>(null),
    categoryId: new BehaviorSubject<number | null>(null)
  };
  ratingList: boolean[] = [];

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
      console.log('Parámetros de la ruta:', data);
      if (data['brand_id'] && !isNaN(Number(data['brand_id']))) {
        this.brandId = Number(data['brand_id']);
        this.category = null;
        this.productService.getBrandName(this.brandId).subscribe(
          name => {
            this.selectedBrandName = name;
            console.log('Nombre de la marca:', this.selectedBrandName);
          },
          error => {
            console.error('Error al obtener el nombre de la marca:', error);
            this.selectedBrandName = 'Marca desconocida';
          }
        );
      } else if (data['category']) {
        const param = data['category'];
        if (!isNaN(Number(param))) {
          this.brandId = Number(param);
          this.category = null;
          this.productService.getBrandName(this.brandId).subscribe(
            name => {
              this.selectedBrandName = name;
              console.log('Nombre de la marca (desde category):', this.selectedBrandName);
            },
            error => {
              console.error('Error al obtener el nombre de la marca:', error);
              this.selectedBrandName = 'Marca desconocida';
            }
          );
        } else {
          this.category = param || 'DryFood';
          this.brandId = null;
          this.selectedBrandName = null;
        }
      } else {
        this.category = 'DryFood';
        this.brandId = null;
        this.selectedBrandName = null;
      }
      this.currentPage = 1;
      this.getProductsByCategory();
    });
  }

  subscribeToFilteredProducts() {
    this.subsFilterProducts = this.filterService.filteredProducts.subscribe((data) => {
      this.pagedProducts = [...data];
      console.log('Productos filtrados actualizados (página', this.currentPage, 'a las', new Date().toLocaleString(), '):', this.pagedProducts.length, this.pagedProducts);
    });
  }

  getProductsByCategory(): void {
    this.isLoading = true;
    this.ratingList = [false, false, false, false];
    this.resetFilter();
    const offset = (this.currentPage - 1) * this.pageSize;
    console.log('Obteniendo página', this.currentPage, 'con offset', offset, 'límite', this.pageSize, 'a las', new Date().toLocaleString());
    const params: any = { limit: this.pageSize, offset };

    if (this.brandId) {
      params.brand_id = this.brandId;
      console.log('Filtrando por brand_id:', this.brandId);
    } else if (this.category) {
      params.category = this.category;
      console.log('Filtrando por categoría:', this.category);
    }

    const categoryForService = this.brandId ? '' : this.category || 'DryFood';
    console.log('categoryForService:', categoryForService, 'params:', params);

    if (this.brandId) {
      this.filterService.setSelectedCategory(null);
      this.selectedFilter.categoryId.next(null);
    }

    this.productService.getByCategory(categoryForService, params).subscribe(
      (response) => {
        this.isLoading = false;
        console.log('Respuesta del backend:', response);
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
        const initialCategoryId = this.brandId ? null : this.getCategoryIdFromLabel(this.category || 'DryFood');
        if (initialCategoryId && this.currentPage === 1 && !this.brandId) {
          this.selectedFilter.categoryId.next(initialCategoryId);
          this.filterService.setSelectedCategory(initialCategoryId);
          this.applyInitialFilter(initialCategoryId);
        }
        console.log('Productos cargados para página', this.currentPage, ':', this.pagedProducts);
      },
      (error) => {
        this.isLoading = false;
        this.error = error.message;
        console.error('Error al cargar productos:', error);
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
    const maxPagesToShow = 3;
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