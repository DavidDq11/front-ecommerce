import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/modules/product/model';
import { ProductService } from 'src/app/modules/product/services/product.service';
import { CartService } from 'src/app/core/services/cart.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { Brand, RawBrand } from 'src/app/modules/product/model/Brand.model';

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
    private cartService: CartService,
    private http: HttpClient,
    private router: Router
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
          image: brand.image || undefined
        }));
        // console.log('Marcas obtenidas:', this.brands);
        this.brands.forEach(brand => {
          if (brand.image) {
            const img = new Image();
            img.src = brand.image;
            img.onload = () => 
              // console.log(`Imagen cargada exitosamente: ${brand.image}`);
            img.onerror = (error) => console.error(`Error al cargar imagen: ${brand.image}`, error);
          }
        });
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
    this.selectedCategoryId = null;
    // console.log('Seleccionando marca:', brandId, brandName);
    this.router.navigate([`/brands/${this.selectedBrandId}`]);
  }

  selectCategory(categoryId: number) {
    this.selectedCategoryId = categoryId;
    this.selectedBrandId = null;
    this.selectedBrandName = null;
    const categoryPath = this.getCategoryPath(categoryId);
    this.router.navigate([`/categories/${categoryPath}`], { queryParams: { category: categoryPath } });
    this.newArrivalProducts();
  }

  newArrivalProducts() {
    this.isLoading = true;
    const params: any = {
      limit: 50,
      offset: 0
    };
    const categoryPath = this.getCategoryPath(this.selectedCategoryId);
    if (categoryPath) {
      params.category = categoryPath;
    }

    this._productService.getByCategory(categoryPath || 'DryFood', params).subscribe(
      (response: { products: Product[], total: number }) => {
        this.isLoading = false;
        const data = response.products;

        if (data.length === 0) {
          console.warn('No products returned', params);
          this.products = [];
          return;
        }

        // Establecer tamaño predeterminado para cada producto
        this.products = data.map(product => {
          if (product.sizes && product.sizes.length > 0) {
            return {
              ...product,
              size: product.sizes[0].size,
              size_id: product.sizes[0].size_id,
              price: product.sizes[0].price
            };
          }
          return product;
        });

        const today = new Date();
        const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

        const seededShuffle = (array: Product[], seed: number) => {
          const rng = (seed: number) => {
            const x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
          };
          const shuffled = [...array];
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(rng(seed + i) * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }
          return shuffled;
        };

        const shuffledProducts = seededShuffle(this.products, seed);
        this.products = shuffledProducts.slice(0, 5);
      },
      (error) => {
        this.isLoading = false;
        this.error = error.message;
        console.error('HTTP Error:', error);
      }
    );
  }

  selectSize(product: Product, size: { size_id: number; size: string; price: number; stock_quantity: number; image_url?: string }) {
    // Actualizar el producto con el tamaño seleccionado
    const updatedProducts = this.products.map(p => {
      if (p.id === product.id) {
        return {
          ...p,
          size: size.size,
          size_id: size.size_id,
          price: size.price
        };
      }
      return p;
    });
    this.products = [...updatedProducts];
  }

  getCategoryPath(categoryId: number | null): string {
    const categoryMap: Record<number, string> = {
      1: 'DryFood',
      2: 'WetFood',
      3: 'Snacks',
      4: 'Litter'
    };
    return categoryId && categoryMap[categoryId] ? categoryMap[categoryId] : 'DryFood';
  }

  getProductImageUrl(product: Product): string {
    return product.images && product.images.length > 0 ? product.images[0].image_url : 'assets/placeholder.jpg';
  }

  scrollBrands(direction: 'left' | 'right') {
    const container = document.querySelector('.brands-container') as HTMLElement;
    if (container) {
      const scrollAmount = container.clientWidth * 0.8;
      if (direction === 'left') {
        container.scrollLeft -= scrollAmount;
      } else {
        container.scrollLeft += scrollAmount;
      }
    }
  }

  validateImages() {
    // console.log('Validating images:', this.images);
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/placeholder.jpg';
    // console.log('Error cargando imagen:', (event.target as HTMLImageElement).src);
  }

  onBrandImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/placeholder.jpg';
    // console.log('Error cargando imagen de marca:', imgElement.src);
  }

  addToCart(product: Product) {
    // console.log('Agregando producto desde Home:', JSON.stringify(product, null, 2));
    this.cartService.addToCart(product);
  }

  removeFromCart(product: Product) {
    // console.log('Eliminando producto desde Home:', product);
    this.cartService.remove(product);
  }

  isProductInCart(product: Product) {
    return this.cartService.getCart().some((item: Product) => item.id === product.id);
  }

  getRatingStar(product: Product): boolean[] {
    if (!product.rating || !product.rating.rate) {
      return [false, false, false, false, false];
    }
    const rating = Math.round(product.rating.rate);
    return Array(5).fill(false).map((_, index) => index < rating);
  }
}