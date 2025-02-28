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