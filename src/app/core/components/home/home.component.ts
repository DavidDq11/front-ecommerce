import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/modules/product/model';
import { ProductService } from 'src/app/modules/product/services/product.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styles: []
})
export class HomeComponent implements OnInit {
  products: Product[] = [];
  skeletons: number[] = [...new Array(6)];
  error!: string;
  isLoading = false;
  images: string[] = [
    'assets/banner/banner1.jpg',
    'assets/banner/banner2.jpg',
    'assets/banner/banner3.jpg'
  ];

  constructor(private _productService: ProductService) {}

  ngOnInit(): void {
    this.newArrivalProducts();
    this.validateImages();
  }

  newArrivalProducts() {
    this.isLoading = true;
    this._productService.getProducts().subscribe(
      (data) => {
        this.isLoading = false;
        console.log('Datos recibidos:', data); // Verifica los datos
        const startIndex = Math.floor(Math.random() * (data.length - 6)); // Asegura que haya al menos 6 elementos
        const lastIndex = startIndex + 6;
        this.products = data.slice(startIndex, lastIndex);
        console.log('Productos seleccionados:', this.products); // Verifica los productos finales
      },
      (error) => {
        this.isLoading = false;
        this.error = error.message;
        console.error('HTTP Error:', error);
      }
    );
  }

  validateImages() {
    console.log('Validating images:', this.images);
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/placeholder.jpg'; // Imagen fallback
    console.log('Error cargando imagen:', (event.target as HTMLImageElement).src);
  }
}