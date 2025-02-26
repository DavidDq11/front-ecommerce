import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/modules/product/model';
import { ProductService } from 'src/app/modules/product/services/product.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
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

  categories = [
    { id: 1, name: 'Alimentos', icon: 'fa-bone' },
    { id: 2, name: 'Juguetes', icon: 'fa-dice' },
    { id: 3, name: 'Cuidado', icon: 'fa-paw' },
    { id: 4, name: 'Accesorios', icon: 'fa-gem' },
    { id: 5, name: 'Snacks', icon: 'fa-cookie-bite' }
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
        console.log('Datos recibidos:', data);
        const startIndex = Math.floor(Math.random() * (data.length - 6));
        const lastIndex = startIndex + 6;
        this.products = data.slice(startIndex, lastIndex);
        console.log('Productos seleccionados:', this.products);
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
    (event.target as HTMLImageElement).src = 'assets/placeholder.jpg';
    console.log('Error cargando imagen:', (event.target as HTMLImageElement).src);
  }
}