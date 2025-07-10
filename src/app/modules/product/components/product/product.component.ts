import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../../model';
import { FilterService } from '../../services/filter.service';
import { BehaviorSubject, Subscription, combineLatest } from 'rxjs';

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
  showFilterModal = false;

  selectedFilter: { categoryId: BehaviorSubject<number | null> } = {
    categoryId: new BehaviorSubject<number | null>(null)
  };

  currentPage = 1;
  pageSize = 25;
  totalItems = 0;
  totalPages = 1;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private filterService: FilterService
  ) {}

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.subscribeToFilteredProducts();
    combineLatest([this.route.params, this.route.queryParams]).subscribe(([params, queryParams]) => {
      console.log('Parámetros de la ruta:', params, 'QueryParams:', queryParams);
      this.brandId = params['brand_id'] ? Number(params['brand_id']) : queryParams['brand_id'] ? Number(queryParams['brand_id']) : null;
      this.category = queryParams['category'] || params['category'] || 'DryFood';
      this.currentPage = Number(queryParams['page']) || 1;

      if (this.brandId) {
        this.productService.getBrandName(this.brandId).subscribe(
          name => this.selectedBrandName = name,
          error => this.selectedBrandName = 'Marca desconocida'
        );
      } else {
        this.selectedBrandName = null;
      }

      this.selectedFilter.categoryId.next(this.category ? this.getCategoryIdFromLabel(this.category) : null);
      this.getProducts(this.category, this.brandId, this.currentPage); // Siempre cargar productos
    });
  }

  subscribeToFilteredProducts() {
    this.subsFilterProducts = this.filterService.filteredProducts.subscribe(data => {
      this.pagedProducts = [...data];
      console.log('Productos filtrados actualizados (página', this.currentPage, '):', this.pagedProducts.length);
    });
  }

  getProducts(category: string | null, brandId: number | null, page: number) {
    this.isLoading = true;
    const offset = (page - 1) * this.pageSize;
    const params: any = { limit: this.pageSize, offset };
    if (brandId) params.brand_id = brandId;
    if (category) params.category = category;

    console.log('Solicitando productos con params:', params);
    this.productService.getByCategory(category || 'DryFood', params).subscribe(
      response => {
        this.isLoading = false;
        this.pagedProducts = response.products || [];
        this.totalItems = response.total || 0;
        this.totalPages = response.totalPages || 1;
        this.filterService.setAllProducts(this.pagedProducts);
        console.log('Productos cargados para página', this.currentPage, ':', this.pagedProducts.length, 'Total páginas:', this.totalPages);
      },
      error => {
        this.isLoading = false;
        this.error = error.message || 'Error al cargar productos';
        console.error('Error al cargar productos:', error);
      }
    );
  }

  onCategoryFilter(categoryId: number | null) {
    const category = categoryId ? this.filterService.filterList.getValue().find(item => item.id === categoryId)?.value || null : null;
    this.router.navigate([`/categories/${category || 'DryFood'}`], {
      queryParams: { category: category || 'DryFood', page: 1 }
    });
    console.log('Filtro de categoría aplicado:', category);
    this.showFilterModal = false;
  }

  onPriceFilter({ minPrice, maxPrice }: { minPrice: number; maxPrice: number }) {
    this.filterService.applyPriceFilter(minPrice, maxPrice);
    this.showFilterModal = false;
  }

  private updateQueryParams(changes: { [key: string]: any }) {
    const queryParams = { ...this.route.snapshot.queryParams, ...changes };
    this.router.navigate([], { relativeTo: this.route, queryParams });
    this.currentPage = Number(changes['page']) || this.currentPage; // Actualizar currentPage
    this.getProducts(this.category, this.brandId, this.currentPage); // Recargar productos
    window.scrollTo({ top: 0, behavior: 'smooth' });
    console.log('QueryParams actualizados:', queryParams);
  }

  private getCategoryIdFromLabel(category: string | null): number | null {
    if (!category) return null;
    const typeMap = {
      'DryFood': 1,
      'WetFood': 2,
      'Snacks': 3,
      'Litter': 4,
      'Pet Food': 1,
      'Wet Food': 2,
      'Pet Treats': 3
    };
    return typeMap[category as keyof typeof typeMap] || null;
  }

  onFilter(value: boolean) {
    this.isFilter = value;
  }

  toggleFilterModal() {
    this.showFilterModal = !this.showFilterModal;
  }

  previousPage() { 
    if (this.currentPage > 1) {
      this.updateQueryParams({ page: this.currentPage - 1 });
    }
  }

  nextPage() { 
    if (this.currentPage < this.totalPages) {
      this.updateQueryParams({ page: this.currentPage + 1 });
    }
  }

  goToPage(page: number) { 
    if (page >= 1 && page <= this.totalPages) {
      this.updateQueryParams({ page });
    }
  }

  goToFirstPage() { 
    if (this.currentPage !== 1) {
      this.updateQueryParams({ page: 1 });
    }
  }

  goToLastPage() { 
    if (this.currentPage !== this.totalPages) {
      this.updateQueryParams({ page: this.totalPages });
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
    if (this.subsFilterProducts) this.subsFilterProducts.unsubscribe();
  }
}