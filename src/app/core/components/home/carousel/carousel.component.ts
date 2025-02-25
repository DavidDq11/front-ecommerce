// carousel.component.ts
import { Component, Input, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styles: []
})
export class CarouselComponent implements OnInit, AfterViewInit {
  @Input() slideImages: string[] = []; // Images from parent
  @Input() customHeight: string = 'auto'; // Optional input for custom height
  @Input() customWidth: string = '100%'; // Optional input for custom width
  
  @ViewChild('sliderRef') sliderRef!: ElementRef;

  selectedSlide = 0;
  private intervalId: any;

  constructor() {}

  ngOnInit(): void {
    console.log('Imágenes del carrusel:', this.slideImages);
  }

  ngAfterViewInit(): void {
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  selectSlide(index: number) {
    this.selectedSlide = index;
  }

  onPrev() {
    this.selectedSlide = (this.selectedSlide - 1 + this.slideImages.length) % this.slideImages.length;
  }

  onNext() {
    this.selectedSlide = (this.selectedSlide + 1) % this.slideImages.length;
  }

  private startAutoSlide(): void {
    this.intervalId = setInterval(() => {
      this.onNext();
    }, 5000);
  }
}