import { Component, OnInit } from '@angular/core';
import { faBone, faFish, faCookieBite, faPaw, faTag, faSyringe } from '@fortawesome/free-solid-svg-icons';
import { Product } from 'src/app/modules/product/model';
import { ProductService } from 'src/app/modules/product/services/product.service';
import { CartService } from 'src/app/core/services/cart.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { Brand, RawBrand } from 'src/app/modules/product/model/Brand.model';

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  image: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  faBone = faBone;
  faFish = faFish;
  faCookieBite = faCookieBite;
  faPaw = faPaw;
  faTag = faTag;
  faSyringe = faSyringe;

  products: Product[] = [];
  brands: Brand[] = [];
  skeletons: number[] = [...new Array(6)];
  error!: string;
  isLoading = false;
  images: string[] = [
    'assets/banner/banner1.png',
    'assets/banner/banner2.jpg',
    'assets/banner/banner3.jpg'
  ];

  categories = [
    { id: 1, name: 'Alimentos Secos', icon: 'fa-bone', path: '/categories/Alimentos Secos' },
    { id: 2, name: 'Alimentos Húmedos', icon: 'fa-fish', path: '/categories/Alimentos Húmedos' },
    { id: 3, name: 'Snacks', icon: 'fa-cookie-bite', path: '/categories/Snacks' },
    { id: 4, name: 'Arena para Gatos', icon: 'fa-paw', path: '/categories/Arena para Gatos' },
    { id: 5, name: 'Accesorios', icon: 'fa-tag', path: '/categories/Accesorios' },
    { id: 6, name: 'Productos Veterinarios', icon: 'fa-syringe', path: '/categories/Productos Veterinarios' }
  ];

  newsItems: NewsItem[] = [
    {
      id: 1,
      title: '¡Cuidamos a tu Mascota! Consultas Veterinarias en Tienda o a Domicilio',
      summary: 'Visítanos en nuestro punto físico en Manizales o agenda una consulta veterinaria a domicilio. Nuestros expertos están listos para mantener a tus mascotas sanas y felices. ¡Contáctanos hoy!',
      image: 'assets/images/Veterinario.webp'
    },
    {
      id: 2,
      title: '¡Productos para Mascotas en tu Puerta el Mismo Día!',
      summary: 'Pide alimentos, accesorios, o medicamentos antes de las 3 p.m. y recíbelos hoy mismo en cualquier parte de Manizales. ¡Compra ahora y consiente a tu mascota!',
      image: 'assets/images/Domicilio.webp'
    },
    {
      id: 3,
      title: '¡Nuevos Medicamentos y Vitaminas para tus Mascotas!',
      summary: 'Explora nuestra gama de medicamentos y vitaminas de alta calidad para perros, gatos y ganado. Fortalece su salud con productos confiables. ¡Pídelos hoy en Domipets!',
      image: 'assets/images/Medicamentos.webp'
    }
  ];

  selectedCategoryId: number | null = null;
  selectedBrandId: number | null = null;
  selectedBrandName: string | null = null;

  constructor(
    private _productService: ProductService,
    private cartService: CartService,
    private http: HttpClient,
    private router: Router,
    private titleService: Title,
    private metaService: Meta
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('Domipets - Tienda de Productos para Mascotas y Ganado');
    this.metaService.updateTag({
      name: 'description',
      content: 'Explora nuestra amplia gama de alimentos, accesorios, medicamentos veterinarios y consultas veterinarias en Manizales y Villa María. ¡Entregas rápidas el mismo día!'
    });
    this.metaService.updateTag({
      name: 'keywords',
      content: 'mascotas, ganado, alimentos secos, accesorios, medicamentos veterinarios, consultas veterinarias, domicilios Manizales, Villa María'
    });

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Domipets - Inicio',
      description: 'Explora nuestros productos y servicios para mascotas y ganado, incluyendo consultas veterinarias, entregas rápidas y medicamentos en Manizales.',
      url: 'https://www.domipets.com.co/',
      hasPart: this.categories.map(category => ({
        '@type': 'Collection',
        name: category.name,
        url: `https://www.domipets.com.co${category.path}`
      })),
      mainEntity: {
        '@type': 'NewsArticle',
        headline: 'Noticias de Domipets',
        description: 'Descubre nuestras consultas veterinarias, entregas rápidas en Manizales y nuevos medicamentos para tus mascotas.',
        publisher: {
          '@type': 'Organization',
          name: 'Domipets',
          logo: {
            '@type': 'ImageObject',
            url: 'https://www.domipets.com.co/assets/logo.png'
          }
        },
        articleSection: this.newsItems.map(item => ({
          '@type': 'Article',
          headline: item.title,
          description: item.summary,
          image: `https://www.domipets.com.co/${item.image}`
        }))
      }
    };
    this.metaService.addTag({ name: 'application/ld+json', content: JSON.stringify(schema) });

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
        this.brands.forEach(brand => {
          if (brand.image) {
            const img = new Image();
            img.src = brand.image;
            img.onload = () => {};
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
    this.router.navigate([`/brands/${this.selectedBrandId}`]);
  }

  selectCategory(categoryId: number) {
    this.selectedCategoryId = categoryId;
    this.selectedBrandId = null;
    this.selectedBrandName = null;
    const category = this.categories.find(c => c.id === categoryId)?.name || 'Alimentos Secos';
    this.router.navigate([`/categories/${category}`]);
    this.newArrivalProducts();
  }

  newArrivalProducts() {
    this.isLoading = true;
    const params: any = {
      limit: 5,
      offset: 0
    };
    const category = this.categories.find(c => c.id === this.selectedCategoryId)?.name;
    if (category) {
      params.category = category;
    }

    this._productService.getByCategory(category || 'Alimentos Secos', params).subscribe(
      (response: { products: Product[], total: number }) => {
        this.isLoading = false;
        const data = response.products;

        if (data.length === 0) {
          console.warn('No products returned', params);
          this.products = [];
          return;
        }

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
      1: 'Alimentos Secos',
      2: 'Alimentos Húmedos',
      3: 'Snacks',
      4: 'Arena para Gatos',
      5: 'Accesorios',
      6: 'Productos Veterinarios'
    };
    return categoryId && categoryMap[categoryId] ? categoryMap[categoryId] : 'Alimentos Secos';
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

  validateImages() {}

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/placeholder.jpg';
  }

  onBrandImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/placeholder.jpg';
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product);
  }

  removeFromCart(product: Product) {
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