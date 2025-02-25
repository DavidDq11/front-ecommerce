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
    // Optionally, you could load or validate image dimensions here
    this.validateImages();
  }

  newArrivalProducts() {
    this.isLoading = true;
    const startIndex = Math.round(Math.random() * 20);
    const lastIndex = startIndex + 6;
    this._productService.get.subscribe(
      (data) => {
        this.isLoading = false;
        this.products = data.slice(startIndex, lastIndex);
      },
      (error) => (this.error = error.message)
    );
  }

  validateImages() {
    // Example: Log or validate image dimensions (you’d need a library or service for this)
    console.log('Validating images:', this.images);
    // You could use an image loading service or Angular’s HttpClient to fetch and check image dimensions
  }
}