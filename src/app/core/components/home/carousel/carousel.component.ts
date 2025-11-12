// carousel.component.ts
import { Component, Input, OnInit, ViewChild, ElementRef, AfterViewInit, Output, EventEmitter } from '@angular/core';  // 👈 Agrega Output y EventEmitter

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

  @Output() slideChanged = new EventEmitter<number>();  // 👈 Nueva salida para notificar cambios de slide

  constructor() {}

  ngOnInit(): void {
    // console.log('Imágenes del carrusel:', this.slideImages);
  }

  ngAfterViewInit(): void {
    this.startAutoSlide();
    this.slideChanged.emit(this.selectedSlide);  // 👈 Emite el slide inicial (0)
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  selectSlide(index: number) {
    this.selectedSlide = index;
    this.slideChanged.emit(this.selectedSlide);  // 👈 Emite el nuevo índice
  }

  onPrev() {
    this.selectedSlide = (this.selectedSlide - 1 + this.slideImages.length) % this.slideImages.length;
    this.slideChanged.emit(this.selectedSlide);  // 👈 Emite el nuevo índice
  }

  onNext() {
    this.selectedSlide = (this.selectedSlide + 1) % this.slideImages.length;
    this.slideChanged.emit(this.selectedSlide);  // 👈 Emite el nuevo índice
  }

  private startAutoSlide(): void {
    this.intervalId = setInterval(() => {
      this.onNext();
    }, 10000);  // 👈 Cambiado a 8000 ms (8 segundos). Ajusta según necesites.
  }
}