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
  searchControl = new FormControl('', { nonNullable: true });
  suggestions: Product[] = [];
  isLoading = false;
  private searchSubscription = new Subscription();
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
        const trimmed = query?.trim();
        if (!trimmed) {
          this.suggestions = [];
          return [];
        }
        this.isLoading = true;
        return this.productService.search(trimmed);
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (products) => {
        this.suggestions = products.slice(0, 25);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error en búsqueda:', err);
        this.suggestions = [];
        this.isLoading = false;
      }
    });
  }

  selectSuggestion(product: Product): void {
    this.router.navigate(['/categories', 'product', product.id]);
    this.clearSearch();
  }

  clearSearch(): void {
    this.searchControl.setValue('');
    this.suggestions = [];
    // Opcional: enfocar el input
    setTimeout(() => {
      const input = document.querySelector('.search-input') as HTMLInputElement;
      input?.focus();
    }, 0);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/placeholder.jpg';
  }

  // Mejora de rendimiento
  trackByProductId(index: number, product: Product): any {
    return product.id;
  }

  ngOnDestroy(): void {
    this.searchSubscription.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}