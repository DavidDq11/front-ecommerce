import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import { Product } from 'src/app/modules/product/model';
import { ProductService } from 'src/app/modules/product/services/product.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {
onImageError($event: ErrorEvent) {
throw new Error('Method not implemented.');
}
  searchControl = new FormControl('');
  suggestions: Product[] = [];
  isLoading = false;
  private searchSubscription: Subscription = new Subscription();
  private destroy$ = new Subject<void>();

  constructor(
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.searchSubscription = this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query || query.trim() === '') {
          this.suggestions = [];
          return [];
        }
        this.isLoading = true;
        return this.productService.search(query);
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (products: Product[]) => {
        this.suggestions = products.slice(0, 5); // Limitar a 5 sugerencias
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error en búsqueda:', error);
        this.suggestions = [];
        this.isLoading = false;
      }
    });
  }

  selectSuggestion(product: Product): void {
    // Navegar a la página de detalles del producto, igual que en HomeComponent
    this.router.navigate(['/categories', 'product', product.id]);
    this.searchControl.setValue(''); // Limpiar el input
    this.suggestions = []; // Limpiar sugerencias
  }

  clearSearch(): void {
    this.searchControl.setValue('');
    this.suggestions = [];
  }

  ngOnDestroy(): void {
    this.searchSubscription.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}