import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { FilterService } from '../../../services/filter.service';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styles: []
})
export class FilterComponent implements OnInit, OnDestroy {
  @Input() category!: string;
  @Output() onFilter = new EventEmitter<boolean>();
  @Output() categoryChange = new EventEmitter<number | null>();
  @Output() ratingChange = new EventEmitter<number | null>();
  @Output() priceChange = new EventEmitter<{ minPrice: number, maxPrice: number }>();
  @Input() ratingList!: boolean[];
  @Input() selectedFilter!: { rating: BehaviorSubject<number | null>, categoryId: BehaviorSubject<number | null> };

  filterCategories = [
    { id: 1, label: 'Alimentos Secos', value: 'DryFood', checked: false },
    { id: 2, label: 'Alimentos Húmedos', value: 'WetFood', checked: false },
    { id: 3, label: 'Snacks', value: 'Snacks', checked: false },
    { id: 4, label: 'Arena para Gatos', value: 'Litter', checked: false }
  ];
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
      this.filterCategories = data.length ? data : this.filterCategories;
      this.updateCheckedCategory();
    });
  }

  subscribeToSelectedCategory() {
    this.categorySub = this.selectedFilter.categoryId.subscribe(categoryId => {
      this.updateCheckedCategory();
    });
  }

  updateCheckedCategory() {
    const selectedId = this.selectedFilter.categoryId.getValue();
    this.filterCategories = this.filterCategories.map(cat => ({
      ...cat,
      checked: cat.id === selectedId
    }));
  }

  applyFilter(value: number, type: string) {
    if (type === 'rating') {
      this.ratingChange.emit(value);
    }
    if (type === 'category') {
      this.categoryChange.emit(value);
    }
  }

  onPriceFilter(event: { minPrice: number, maxPrice: number }) {
    this.priceChange.emit(event);
  }

  onClose() {
    this.onFilter.emit(false);
  }

  ngOnDestroy(): void {
    if (this.subsFilterList) this.subsFilterList.unsubscribe();
    if (this.categorySub) this.categorySub.unsubscribe();
  }

  initFilterValues() {
    this.selectedFilter.rating.subscribe(value => {
      this.ratingList = [false, false, false, false].map((_, i) => value ? i + 1 <= value : false);
    });
  }
}