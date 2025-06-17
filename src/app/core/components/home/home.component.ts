import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/modules/product/model';
import { FilterService } from 'src/app/modules/product/services/filter.service';
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
    { id: 1, name: 'Alimentos Secos', icon: 'fa-bone', path: '/categories/DryFood' },
    { id: 2, name: 'Alimentos Húmedos', icon: 'fa-fish', path: '/categories/WetFood' },
    { id: 3, name: 'Snacks', icon: 'fa-cookie-bite', path: '/categories/Snacks' },
    { id: 4, name: 'Arena para Gatos', icon: 'fa-paw', path: '/categories/Litter' }
  ];

  newsItems = [
    { title: 'Nueva línea de alimentos orgánicos', summary: 'Descubre nuestra nueva gama de productos naturales para tus mascotas.', link: '#' },
    { title: 'Evento de adopción este fin de semana', summary: 'Únete a nosotros para encontrar un nuevo amigo peludo.', link: '#' },
    { title: 'Consejos para el cuidado de gatos', summary: 'Aprende cómo mantener a tu gato feliz y saludable.', link: '#' }
  ];

  selectedCategoryId: number | null = null;

  constructor(private _productService: ProductService, private _filterService: FilterService) {}

  ngOnInit(): void {
    this.newArrivalProducts();
    this.validateImages();
  }

  newArrivalProducts() {
    this.isLoading = true;
    this._productService.getByCategory('DryFood').subscribe(
      (response: { products: Product[], total: number }) => {
        this.isLoading = false;
        console.log('Datos recibidos del backend:', response);
        const data = response.products;
        if (data.length === 0) {
          console.warn('No products returned for DryFood');
          this.products = [];
          return;
        }
        const maxStartIndex = Math.max(0, data.length - 6);
        const startIndex = Math.floor(Math.random() * maxStartIndex);
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

  selectCategory(categoryId: number) {
    this.selectedCategoryId = categoryId;
    this._filterService.setSelectedCategory(categoryId);
    const categoryMap: Record<number, string> = {
      1: 'DryFood',
      2: 'WetFood',
      3: 'Snacks',
      4: 'Litter'
    };
    const category = categoryMap[categoryId];
    if (category) {
      this._filterService.getProductTypeFilter(category);
    }
  }

  validateImages() {
    console.log('Validating images:', this.images);
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/placeholder.jpg';
    console.log('Error cargando imagen:', (event.target as HTMLImageElement).src);
  }
}