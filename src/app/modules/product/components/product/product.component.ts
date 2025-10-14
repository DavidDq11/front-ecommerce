import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../../model';
import { FilterService } from '../../services/filter.service';
import { BehaviorSubject, Subscription, combineLatest } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
})
export class ProductComponent implements OnInit, OnDestroy {
  pagedProducts: Product[] = [];
  category: string | null = null;
  animalCategory: string | null = null;
  brandId: number | null = null;
  selectedBrandName: string | null = null;
  isLoading = false;
  isFilter = false;
  error: string | null = null;
  subsFilterProducts: Subscription | undefined;
  showFilterModal = false;

  selectedFilter: { categoryId: BehaviorSubject<number | null> } = {
    categoryId: new BehaviorSubject<number | null>(null),
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
    combineLatest([
      this.route.params.pipe(
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
      ),
      this.route.queryParams.pipe(
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
      ),
      this.route.data
    ]).subscribe(([params, queryParams, data]) => {

      // Extraer category de params, queryParams o data
      const newCategory = params['category'] ? params['category'].trim() : 
                         queryParams['category'] ? queryParams['category'].trim() : 
                         data['category'] ? data['category'].trim() : null;
      const newAnimalCategory = params['animal_category'] ? params['animal_category'].trim() : null;
      const newBrandId = params['brand_id'] ? Number(params['brand_id']) : null;
      const newPage = Number(queryParams['page']) || 1;
      if (
        newCategory !== this.category ||
        newAnimalCategory !== this.animalCategory ||
        newBrandId !== this.brandId ||
        newPage !== this.currentPage
      ) {
        this.category = newCategory;
        this.animalCategory = newAnimalCategory;
        this.brandId = newBrandId;
        this.currentPage = newPage;
        this.pagedProducts = []; // Resetear pagedProducts

        // Resetear filterList antes de actualizar
        const filterList = this.filterService.filterList.getValue().map(filter => ({
          ...filter,
          checked: false
        }));
        if (this.category) {
          const normalizedCategory = this.category.toLowerCase().trim();
          const updatedFilterList = filterList.map(filter => ({
            ...filter,
            checked: filter.value.toLowerCase().trim() === normalizedCategory
          }));
          this.filterService.filterList.next(updatedFilterList);
        } else {
          this.filterService.filterList.next(filterList);
        }

        if (this.brandId) {
          this.productService.getBrandName(this.brandId).subscribe({
            next: (name) => {
              this.selectedBrandName = name;
            },
            error: () => {
              this.selectedBrandName = 'Marca desconocida';
              console.error('ngOnInit - error al cargar brandName');
            },
          });
        } else {
          this.selectedBrandName = null;
        }

        this.selectedFilter.categoryId.next(this.category ? this.getCategoryIdFromLabel(this.category) : null);
        this.getProducts(this.animalCategory, this.category, this.brandId, this.currentPage);
      }
    });
  }

  subscribeToFilteredProducts() {
    this.subsFilterProducts = this.filterService.filteredProducts.subscribe((data) => {
      this.pagedProducts = [...data];
    });
  }

  getProducts(animalCategory: string | null, category: string | null, brandId: number | null, page: number) {
    this.isLoading = true;
    this.error = null;
    this.pagedProducts = []; // Resetear pagedProducts
    const offset = (page - 1) * this.pageSize;
    const params: any = { limit: this.pageSize, offset };

    if (animalCategory) {
      params.animal_category = animalCategory.charAt(0).toUpperCase() + animalCategory.slice(1).toLowerCase();
    }
    if (brandId) {
      params.brand_id = brandId;
    }

    this.productService.getByCategory(category || '', params).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.pagedProducts = response.products || [];
        this.totalItems = response.total || 0;
        this.totalPages = response.totalPages || 1;
        this.filterService.setAllProducts([...this.pagedProducts], category); // Pasar una copia de pagedProducts
        
      },
      error: (error) => {
        this.isLoading = false;
        this.error = error.message || 'Error al cargar productos';
        console.error('getProducts - error al cargar productos:', error);
      },
    });
  }

  onCategoryFilter(categoryId: number | null) {
    const filterList = this.filterService.filterList.getValue();
    const category = categoryId ? filterList.find((item) => item.id === categoryId)?.value || null : null;
    const updatedFilterList = filterList.map(filter => ({
      ...filter,
      checked: filter.id === categoryId
    }));
    this.filterService.filterList.next(updatedFilterList);
    this.category = category; // Actualizar categoría inmediatamente
    this.pagedProducts = []; // Resetear pagedProducts
    this.currentPage = 1; // Resetear a la primera página
    this.router.navigate([`/categories/${this.animalCategory || ''}/${category || ''}`], {
      queryParams: { page: 1 },
      queryParamsHandling: 'merge',
    });
    this.getProducts(this.animalCategory, category, this.brandId, 1); // Forzar recarga de productos
    this.showFilterModal = false;
  }

  onPriceFilter({ minPrice, maxPrice }: { minPrice: number; maxPrice: number }) {
    this.filterService.applyPriceFilter(minPrice, maxPrice);
    this.showFilterModal = false;
  }

  private updateQueryParams(changes: { [key: string]: any }) {
    const queryParams = { ...this.route.snapshot.queryParams, ...changes };
    this.router.navigate([], { relativeTo: this.route, queryParams });
    this.currentPage = Number(changes['page']) || this.currentPage;
    this.getProducts(this.animalCategory, this.category, this.brandId, this.currentPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private getCategoryIdFromLabel(category: string | null): number | null {
    if (!category) return null;
    const typeMap = {
      'alimentos secos': 1,
      'alimentos húmedos': 2,
      snacks: 3,
      'arena para gatos': 4,
      accesorios: 5,
      'productos veterinarios': 6,
      // Mapeos para rutas estáticas antiguas
      dryfood: 1,
      wetfood: 2,
      litter: 4,
      accessories: 5,
      veterinary: 6,
    };
    const categoryId = typeMap[category.toLowerCase().trim() as keyof typeof typeMap] || null;
    return categoryId;
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