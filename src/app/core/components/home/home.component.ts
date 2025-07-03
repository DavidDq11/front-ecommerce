import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/modules/product/model';
import { FilterService } from 'src/app/modules/product/services/filter.service';
import { ProductService } from 'src/app/modules/product/services/product.service';
import { CartService } from 'src/app/core/services/cart.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

// Interfaz para los datos crudos del backend
interface RawBrand {
  id: number;
  name: string;
  image_url?: string | null; // Propiedad devuelta por el backend
}

// Interfaz para los datos usados en el frontend
interface Brand {
  id: number;
  name: string;
  image?: string; // Propiedad esperada por el frontend
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  products: Product[] = [];
  brands: Brand[] = [];
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
  selectedBrandId: number | null = null;
  selectedBrandName: string | null = null;

  constructor(
    private _productService: ProductService,
    private _filterService: FilterService,
    private cartService: CartService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.fetchBrands();
    this.newArrivalProducts();
    this.validateImages();
  }

  fetchBrands() {
    this.http.get<RawBrand[]>(`${environment.baseAPIURL}brands`).subscribe(
      (brands) => {
        this.brands = brands.map(brand => ({
          id: brand.id,
          name: brand.name,
          image: brand.image_url || undefined // Mapear image_url a image
        }));
        console.log('Marcas obtenidas:', this.brands);
      },
      (error) => {
        console.error('Error fetching brands:', error);
        this.brands = [];
      }
    );
  }

  selectBrand(brandId: number, brandName: string) {
    this.selectedBrandId = this.selectedBrandId === brandId ? null : brandId;
    this.selectedBrandName = this.selectedBrandId ? brandName : null;
    this.newArrivalProducts();
  }

  newArrivalProducts() {
    this.isLoading = true;
    const params: any = {
      limit: 25, // Default limit
      offset: 0  // Default offset
    };
    if (this.selectedBrandName) {
      params.brand = this.selectedBrandName;
    }
    if (!this.selectedCategoryId) {
      params.category = 'DryFood';
    }
    this._productService.getByCategory(params.category || 'DryFood', params).subscribe(
      (response: { products: Product[], total: number }) => {
        this.isLoading = false;
        console.log('Datos recibidos del backend:', JSON.stringify(response.products, null, 2));
        const data = response.products;
        if (data.length === 0) {
          console.warn('No products returned', params);
          this.products = [];
          return;
        }
        const maxStartIndex = Math.max(0, data.length - 6);
        const startIndex = Math.floor(Math.random() * maxStartIndex);
        const lastIndex = startIndex + 6;
        this.products = data.slice(startIndex, lastIndex);
        console.log('Productos seleccionados:', this.products.map(p => ({ id: p.id, title: p.title, stock: p.stock, images: p.images })));
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
    this.selectedBrandId = null;
    this.selectedBrandName = null;
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
      this.newArrivalProducts();
    }
  }

  scrollBrands(direction: 'left' | 'right') {
    const container = document.querySelector('.brands-container') as HTMLElement;
    if (container) {
      const scrollAmount = container.clientWidth * 0.8; // Scroll 80% of the container width
      if (direction === 'left') {
        container.scrollLeft -= scrollAmount;
      } else {
        container.scrollLeft += scrollAmount;
      }
    }
  }

  validateImages() {
    console.log('Validating images:', this.images);
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/placeholder.jpg';
    console.log('Error cargando imagen:', (event.target as HTMLImageElement).src);
  }

  onBrandImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/placeholder.jpg'; // Usar imagen de respaldo
    console.log('Error cargando imagen de marca:', imgElement.src);
  }

  addToCart(product: Product) {
    console.log('Agregando producto desde Home:', JSON.stringify(product, null, 2));
    this.cartService.add(product);
  }

  removeFromCart(product: Product) {
    console.log('Eliminando producto desde Home:', product);
    this.cartService.remove(product);
  }

  isProductInCart(product: Product) {
    const inCart = this.cartService.getCart.some((item: Product) => item.id === product.id);
    console.log(`¿Producto ${product.id} en carrito?`, inCart);
    return inCart;
  }
}