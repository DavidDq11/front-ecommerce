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
    { id: 1, name: 'Alimentos', icon: 'fa-bone', path: '/categories/Food' },
    { id: 2, name: 'Juguetes', icon: 'fa-dice', path: '/categories/Toys' },
    { id: 3, name: 'Cuidado', icon: 'fa-paw', path: '/categories/Hygiene' },
    { id: 4, name: 'Accesorios', icon: 'fa-gem', path: '/categories/Accessories' },
    { id: 5, name: 'Snacks', icon: 'fa-cookie-bite', path: '/categories/Snacks' },
    { id: 6, name: 'Hábitats', icon: 'fa-home', path: '/categories/Habitats' },
    { id: 7, name: 'Equipos', icon: 'fa-tools', path: '/categories/Equipment' },
    { id: 8, name: 'Suplementos', icon: 'fa-pills', path: '/categories/Supplements' }
  ];

  selectedCategoryId: number | null = null;

  selectCategory(categoryId: number) {
    this.selectedCategoryId = categoryId;
    this._filterService.setSelectedCategory(categoryId);
    const categoryMap: Record<number, string> = {
      1: 'Alimento',
      2: 'Juguete',
      3: 'Higiene',
      4: 'Accesorio',
      5: 'Snack',
      6: 'Habitat',
      7: 'Equipo',
      8: 'Suplemento'
    };
    const type = categoryMap[categoryId];
    if (type) {
      this._filterService.getProductTypeFilter(type);
      console.log('Selected type for categoryId', categoryId, ':', type);
    } else {
      console.warn('No type mapped for categoryId:', categoryId);
    }
  }

  newsItems = [
    {
      title: 'Descubren nueva dieta para perros con alta energía',
      summary: 'Expertos en nutrición animal han desarrollado una dieta especial que mejora la vitalidad de los perros activos. ¡Ideal para combinar con nuestros nuevos snacks!',
      link: '#'
    },
    {
      title: 'Tips de cuidado para el invierno de tus mascotas',
      summary: 'Aprende cómo proteger a tu mascota del frío con accesorios y cuidados esenciales que ofrecemos en nuestra tienda.',
      link: '#'
    },
    {
      title: 'Evento de adopción de mascotas este fin de semana',
      summary: 'Únete a nosotros en un evento local para encontrar a tu nuevo mejor amigo. ¡Trae a tu mascota para una sesión gratis de cuidado!',
      link: '#'
    }
  ];

  constructor(private _productService: ProductService, private _filterService: FilterService) {}

  ngOnInit(): void {
    this.newArrivalProducts();
    this.validateImages();
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