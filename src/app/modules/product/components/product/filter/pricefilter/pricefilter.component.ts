import { Component, EventEmitter, OnInit, Output, ViewChild, ElementRef } from '@angular/core';
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
  @Output() priceChange = new EventEmitter<{ minPrice: number, maxPrice: number }>();
  minVal = 100;
  maxVal = 100000;
  min = 0;
  max = 100000;
  step = 100;
  priceDiff = 500;
  @ViewChild('progress') progress!: ElementRef;

  constructor(private renderer: Renderer2) {}

  ngOnInit() {
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
    const value = parseInt((event.target as HTMLInputElement).value);
    this.maxVal = value >= this.minVal + this.priceDiff && value <= this.max ? value : this.minVal + this.priceDiff;
    this.setProgress();
    this.emitPriceChange();
  }

  handleMinRange(event: Event) {
    const value = parseInt((event.target as HTMLInputElement).value);
    this.minVal = value <= this.maxVal - this.priceDiff && value >= this.min ? value : this.maxVal - this.priceDiff;
    this.setProgress();
    this.emitPriceChange();
  }

  onMinChange(event: Event) {
    const value = parseInt((event.target as HTMLInputElement).value);
    this.minVal = value >= this.min && value <= this.maxVal - this.priceDiff ? value : this.min;
    this.setProgress();
    this.emitPriceChange();
  }

  onMaxChange(event: Event) {
    const value = parseInt((event.target as HTMLInputElement).value);
    this.maxVal = value <= this.max && value >= this.minVal + this.priceDiff ? value : this.max;
    this.setProgress();
    this.emitPriceChange();
  }

  emitPriceChange() {
    this.priceChange.emit({ minPrice: this.minVal, maxPrice: this.maxVal });
  }
}