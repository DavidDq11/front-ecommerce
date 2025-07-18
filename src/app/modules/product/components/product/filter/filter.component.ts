import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
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
  @Output() priceChange = new EventEmitter<{ minPrice: number, maxPrice: number }>();
  @Output() closeModal = new EventEmitter<void>(); // New event for closing the modal

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
  }

  loadCategoryFilters() {
    this.subsFilterList = this.filterService.filterList.subscribe(data => {
      this.filterCategories = data.length ? data : this.filterCategories;
      this.updateCheckedCategory();
    });
  }

  subscribeToSelectedCategory() {
    this.categorySub = this.filterService.filterList.subscribe(() => {
      this.updateCheckedCategory();
    });
  }

  updateCheckedCategory() {
    const selectedCategory = this.category ? this.getCategoryIdFromLabel(this.category) : null;
    this.filterCategories = this.filterCategories.map(cat => ({
      ...cat,
      checked: cat.id === selectedCategory
    }));
  }

  applyFilter(value: number, type: string) {
    if (type === 'category') {
      this.categoryChange.emit(value);
      this.closeModal.emit(); // Close modal when applying a filter
    }
  }

  onPriceFilter(event: { minPrice: number, maxPrice: number }) {
    this.priceChange.emit(event);
    this.closeModal.emit(); // Close modal when applying a price filter
  }

  onClose() {
    this.closeModal.emit(); // Emit closeModal event instead of onFilter
  }

  ngOnDestroy(): void {
    if (this.subsFilterList) this.subsFilterList.unsubscribe();
    if (this.categorySub) this.categorySub.unsubscribe();
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
}