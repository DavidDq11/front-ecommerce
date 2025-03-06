import { Component, EventEmitter, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { ActivatedRoute, Params } from '@angular/router';
import { CategoryFilter, Product } from '../../model';
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
  }
  ratingList: boolean[] = [];

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private filterService: FilterService
  ) { }

  ngOnInit(): void {
    this.subscribeToFilteredProducts();
    this.route.params.subscribe((data: Params) => {
      this.category = data['category'];
      this.loadProducts();
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
    this.route.params.subscribe((data: Params) => {
      this.category = data['category'];
      this.ratingList = [false, false, false, false];
      this.resetFilter();
      this.productService.getByCategory(this.category).subscribe(
        (data) => {
          this.isLoading = false;
          this.products = data;
          this.cloneOfProducts = data;
          this.filterService.filterProduct(data); // Inicializa con todos los productos
          this.filterService.getProductTypeFilter(this.category);
  
          // Sincronizar con el selectedCategoryId desde FilterService
          const initialCategoryId = this.getCategoryIdFromLabel(this.category);
          if (initialCategoryId) {
            this.selectedFilter.categoryId.next(initialCategoryId);
            this.filterService.setSelectedCategory(initialCategoryId);
          }
  
          // Esperar a que filterList esté listo y aplicar el filtro inicial
          this.filterService.filterList.subscribe(() => {
            const selectedId = this.filterService.selectedCategoryId.getValue();
            if (selectedId) {
              this.applyInitialFilter(selectedId);
            }
          });
        },
        (error) => (this.error = error.message)
      );
    });
  }
  loadProducts() {
    this.isLoading = true;
    this.productService.getProducts().subscribe(
      (data) => {
        this.isLoading = false;
        this.products = data;
        this.cloneOfProducts = [...data];
        this.filterService.setAllProducts(data); // Ensure FilterService has all products
        this.filterService.getProductTypeFilter(this.category); // Trigger filtering
      },
      (error) => {
        this.isLoading = false;
        this.error = error.message;
        console.error('Error loading products:', error);
      }
    );
  }
  
  // Método auxiliar para mapear la categoría del URL a un ID
  private getCategoryIdFromLabel(category: string): number | null {
    const typeMap = {
      'Alimento': 1, 'Juguete': 2, 'Higiene': 3, 'Accesorio': 4,
      'Snack': 5, 'Habitat': 6, 'Equipo': 7, 'Suplemento': 8
    };
    return typeMap[category as keyof typeof typeMap] || null;
  }

  // Nueva función para aplicar el filtro inicial
  private applyInitialFilter(categoryId: number): void {
    const checkedItems = this.filterService.filterList.getValue().map(item =>
      item.id === categoryId ? { ...item, checked: true } : { ...item, checked: false }
    );
    const filteredProducts = this.filterService.handleCatFilter(checkedItems);
    this.filterService.filterProduct(filteredProducts);
  }

  handleFilter() {
    this.subsFilterProducts = this.filterService.filteredProducts.subscribe((data) => {
      this.products = data;
    });
  }

  onFilter(value: boolean) {
    this.isFilter = value;
  }

  resetFilter() {
    this.selectedFilter.categoryId.next(null);
    this.selectedFilter.rating.next(null);
  }


  ngOnDestroy(): void {
    this.subsFilterProducts.unsubscribe();
  }
}
