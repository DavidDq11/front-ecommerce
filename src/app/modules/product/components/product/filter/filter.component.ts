import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CategoryFilter, Product } from '../../../model';
import { BehaviorSubject, Subscription } from 'rxjs';
import { FilterService } from '../../../services/filter.service';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styles: []
})
export class FilterComponent implements OnInit, OnDestroy {
  @Input() products!: Product[];
  @Input() category!: string;
  @Output() onFilter = new EventEmitter<boolean>();
  @Input() ratingList!: boolean[];
  @Input() selectedFilter!: { rating: BehaviorSubject<number | null>, categoryId: BehaviorSubject<number | null> };

  filterCategories: CategoryFilter[] = [];
  selectedRating: number | null = null;
  selectedCategory: number | null = null;
  filteredProducts: Product[] = [];
  cloneOfProducts!: Product[];
  subsFilterList!: Subscription;
  categorySub!: Subscription;

  constructor(private filterService: FilterService) {}

  ngOnInit(): void {
    this.loadCategoryFilters();
    this.subscribeToSelectedCategory();
    this.initFilterValues();
  }

  loadCategoryFilters() {
    this.subsFilterList = this.filterService.filterList.subscribe(data => {
      this.filterCategories = data.slice();
      this.updateCheckedCategory(); // Update checked state based on selected category
    });
  }

  subscribeToSelectedCategory() {
    this.categorySub = this.filterService.selectedCategoryId.subscribe((categoryId) => {
      this.selectedCategory = categoryId;
      this.updateCheckedCategory();
      if (this.selectedCategory && this.filterCategories.length > 0) {
        this.applyFilter(this.selectedCategory, 'category'); // Asegura que el filtro se aplique
        console.log('Categoría seleccionada actualizada:', this.selectedCategory, 'Categorías de filtro:', this.filterCategories);
      }
    });
  }

  updateCheckedCategory() {
    if (this.selectedCategory && this.filterCategories.length > 0) {
      this.filterCategories = this.filterCategories.map((cat) =>
        cat.id === this.selectedCategory ? { ...cat, checked: true } : { ...cat, checked: false }
      );
    }
  }

  handleCheckbox(id: number): Product[] {
    const checkedItems = this.filterCategories.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    this.filterCategories = checkedItems;
    const prods = this.handleFilter(checkedItems);
    return prods;
  }

  handleRating(rating: number): Product[] {
    this.ratingList = this.ratingList.map((rate, i) => rating >= i + 1 ? true : false);
    const prods = this.filterService.handleRateFilter(rating);
    return prods;
  }

  handleFilter(checkedItems: CategoryFilter[]): Product[] {
    this.cloneOfProducts = [...this.products];
    const prods = this.filterService.handleCatFilter(checkedItems);
    return prods;
  }

  initFilterValues() {
    this.selectedFilter.rating.subscribe(value => this.selectedRating = value);
    this.selectedFilter.categoryId.subscribe(value => this.selectedCategory = value);
  }

  applyFilter(value: number, type: string) {
    let prods = this.products;
    if (type === 'rating') {
      this.selectedRating = value;
      prods = this.handleRating(value);
    }
    if (type === 'category') {
      this.selectedCategory = value;
      prods = this.handleCheckbox(value);
    }
    this.filterService.filterProduct(prods); // Actualizar productos filtrados
  }

  onClose() {
    this.onFilter.emit(false);
  }

  unsubscribeSubject() {
    this.subsFilterList.unsubscribe();
  }

  ngOnDestroy(): void {
    this.unsubscribeSubject();
    if (this.categorySub) {
      this.categorySub.unsubscribe();
    }
  }
}