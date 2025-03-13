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
    { id: 1, name: 'Decoración', icon: 'fa-paint-roller', path: '/categories/decoracion' },
    { id: 2, name: 'Cocina', icon: 'fa-blender', path: '/categories/cocina' },
    { id: 3, name: 'Organización', icon: 'fa-boxes-stacked', path: '/categories/organizacion' },
    { id: 4, name: 'Hogar Inteligente', icon: 'fa-lightbulb', path: '/categories/hogar-inteligente' },
    { id: 5, name: 'Limpieza', icon: 'fa-broom', path: '/categories/limpieza' },
    { id: 6, name: 'Muebles', icon: 'fa-couch', path: '/categories/muebles' },
    { id: 7, name: 'Jardín', icon: 'fa-leaf', path: '/categories/jardin' },
    { id: 8, name: 'Iluminación', icon: 'fa-lamp', path: '/categories/iluminacion' }
  ];

  selectedCategoryId: number | null = null;

  newsItems = [
    {
      title: 'Nuevas tendencias en decoración minimalista',
      summary: 'Descubre cómo transformar tu hogar con nuestras nuevas piezas de decoración exclusivas.',
      link: '#'
    },
    {
      title: 'Guía para un hogar inteligente este 2025',
      summary: 'Aprovecha nuestros productos de hogar inteligente para modernizar tu espacio.',
      link: '#'
    },
    {
      title: 'Lanzamiento de herramientas de limpieza ecológicas',
      summary: 'Conoce nuestra nueva línea de productos sostenibles para mantener tu casa impecable.',
      link: '#'
    }
  ];

  constructor(private _productService: ProductService, private _filterService: FilterService) {}

  ngOnInit(): void {
    this.newArrivalProducts();
    this.validateImages();
  }

  selectCategory(categoryId: number) {
    this.selectedCategoryId = categoryId;
    this._filterService.setSelectedCategory(categoryId);
    const categoryMap: Record<number, string> = {
      1: 'Decoracion', 2: 'Cocina', 3: 'Organizacion', 4: 'HogarInteligente',
      5: 'Limpieza', 6: 'Muebles', 7: 'Jardin', 8: 'Iluminacion'
    };
    const type = categoryMap[categoryId];
    if (type) {
      this._filterService.getProductTypeFilter(type);
    }
  }

  newArrivalProducts() {
    this.isLoading = true;
    this._productService.getProducts().subscribe(
      (data) => {
        this.isLoading = false;
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