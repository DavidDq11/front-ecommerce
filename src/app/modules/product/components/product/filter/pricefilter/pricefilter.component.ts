import { Component, ViewChild, ElementRef, OnInit, Input } from '@angular/core';
import { FilterService } from 'src/app/modules/product/services/filter.service';
import { Renderer2 } from '@angular/core';

@Component({
  selector: 'app-pricefilter',
  templateUrl: './pricefilter.component.html',
  styles: [`
    input[type=range] {
      width: 100%;
      height: 4px;
      position: absolute;
      z-index: 25;
      background: none;
      pointer-events: none;
      -webkit-appearance: none;
      -moz-appearance: none;
    }
    input[type=range]::-webkit-slider-thumb {
      height: 1rem;
      width: 1rem;
      border-radius: 50%;
      pointer-events: auto;
      cursor: pointer;
      background: #000;
      -webkit-appearance: none;
    }
  `]
})
export class PricefilterComponent implements OnInit {
  @Input() products: any[] = [];
  minVal = 100;
  maxVal = 100000;
  min = 0;
  max = 100000;
  step = 100;
  priceDiff = 500;
  @ViewChild('progress') progress!: ElementRef;

  constructor(private renderer: Renderer2, private filterService: FilterService) {}

  ngOnInit() {
    this.updatePriceRange();
  }

  updatePriceRange() {
    if (this.products.length > 0) {
      const prices = this.products.map(p => p.price).filter(p => p !== null && p !== undefined);
      if (prices.length > 0) {
        this.min = Math.min(...prices);
        this.max = Math.max(...prices);
        this.minVal = this.min;
        this.maxVal = this.max;
      }
    }
    this.setProgress();
  }

  setProgress() {
    if (this.progress && this.progress.nativeElement) {
      const minPercent = (this.minVal / this.max) * 100;
      const maxPercent = (this.maxVal / this.max) * 100;
      this.renderer.setStyle(this.progress.nativeElement, 'left', `${minPercent}%`);
      this.renderer.setStyle(this.progress.nativeElement, 'width', `${maxPercent - minPercent}%`);
    }
  }

  handleMaxRange(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = parseInt(target.value);
    if (value >= this.minVal + this.priceDiff && value <= this.max) {
      this.maxVal = value;
    } else if (value < this.minVal + this.priceDiff) {
      this.maxVal = this.minVal + this.priceDiff;
    }
    this.setProgress();
    this.filterProduct();
  }

  handleMinRange(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = parseInt(target.value);
    if (value <= this.maxVal - this.priceDiff && value >= this.min) {
      this.minVal = value;
    } else if (value > this.maxVal - this.priceDiff) {
      this.minVal = this.maxVal - this.priceDiff;
    }
    this.setProgress();
    this.filterProduct();
  }

  onMinChange(event: Event) {
    const value = parseInt((event.target as HTMLInputElement).value);
    if (value >= this.min && value <= this.maxVal - this.priceDiff) {
      this.minVal = value;
    } else {
      this.minVal = this.min;
    }
    this.setProgress();
    this.filterProduct();
  }

  onMaxChange(event: Event) {
    const value = parseInt((event.target as HTMLInputElement).value);
    if (value <= this.max && value >= this.minVal + this.priceDiff) {
      this.maxVal = value;
    } else {
      this.maxVal = this.max;
    }
    this.setProgress();
    this.filterProduct();
  }

  filterProduct() {
    this.filterService.handlePriceFilter(this.minVal, this.maxVal);
  }
}