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
  faBone = faBone; faFish = faFish; faCookieBite = faCookieBite;
  faPaw = faPaw; faTag = faTag; faSyringe = faSyringe;

  products: Product[] = [];
  brands: Brand[] = [];
  featuredBrand: Brand | null = null;
  skeletons: number[] = [...new Array(6)];
  error!: string;
  isLoading = false;
  launchCountdown: string = '';
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

  // === VARIABLES DE OFERTA DEL DÍA ===
  todayBrandName: string = '';
  todayDiscountPercent: number = 0;
  hasTodayDeal: boolean = false;
  sectionTitle: string = 'Nuevos Productos';

  // === MAPA DE DESCUENTOS POR DÍA ===
  private dailyBrandDiscounts: { [key: number]: { discount: number; name: string } } = {
    0: { discount: 10, name: 'Monello' },
    1: { discount: 5, name: 'Hills' },
    2: { discount: 5, name: 'EQUILIBRIO' },
    3: { discount: 5, name: 'Br For Cat' },
    4: { discount: 5, name: 'Agility' },
    5: { discount: 5, name: 'Br For Dog' },
    6: { discount: 10, name: 'Cipacan' }
  };

  // === ORDEN PERSONALIZADO DE MARCAS ===
  private customBrandOrder: string[] = [
    'Select', 'Monello', 'Hills', 'EQUILIBRIO', 'Agility', 'Br For Cat', 'Br For Dog',
    'Cipacan', 'Birbo', 'Chunky', 'KI', 'Kitten Paw', 'MAX', 'Nutrecan', 'SOLLA'
  ];

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
    this.metaService.updateTag({ name: 'description', content: 'Alimentos, medicamentos y accesorios para mascotas con entrega el mismo día en Manizales.' });

    this.fetchBrands();
    this.newArrivalProducts(); // ← AQUÍ SE BUSCA EN TODAS LAS CATEGORÍAS
    this.startLaunchCountdown();
  }

  // === NORMALIZACIÓN ROBUSTA ===
  private normalize(str?: string): string {
    if (!str) return '';
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ');
  }

  fetchBrands() {
    this.http.get<RawBrand[]>(`${environment.baseAPIURL}brands`).subscribe(
      (brands) => {
        this.brands = brands.map(brand => ({
          id: brand.id,
          name: brand.name,
          image: brand.image || undefined
        }));

        this.brands.sort((a, b) => {
          const aIndex = this.customBrandOrder.indexOf(a.name);
          const bIndex = this.customBrandOrder.indexOf(b.name);
          if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
          if (aIndex !== -1) return -1;
          if (bIndex !== -1) return 1;
          return a.name.localeCompare(b.name);
        });

        this.featuredBrand = this.brands[6] || null;
      },
      () => this.brands = []
    );
  }

  startLaunchCountdown() {
    const launchDate = new Date();
    launchDate.setDate(launchDate.getDate() + 7);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDate.getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        this.launchCountdown = '¡Oferta terminada!';
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      this.launchCountdown = `${days}d ${hours}h ${minutes}m`;
    }, 60000);
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
    this.newArrivalProducts(); // ← Recarga oferta al cambiar categoría
  }

  // === NUEVA LÓGICA: BUSCAR EN TODAS LAS CATEGORÍAS ===
  newArrivalProducts() {
    this.isLoading = true;
    this.products = [];

    const allCategories = this.categories.map(c => c.name);
    const allProducts: Product[] = [];
    let completed = 0;

    console.log('%c[OFERTA DEL DÍA] Buscando en TODAS las categorías...', 'color: #10b981; font-weight: bold');

    allCategories.forEach(categoryName => {
      const params = { limit: 50, offset: 0 }; // Más productos por categoría

      this._productService.getByCategory(categoryName, params).subscribe(
        (response: { products: Product[], total: number }) => {
          const validProducts = response.products.filter(p => {
            const firstSize = p.sizes?.[0];
            return firstSize?.price && firstSize.price > 0;
          });
          allProducts.push(...validProducts);
          completed++;

          console.log(`%c[${categoryName}] ${validProducts.length} productos válidos`, 'color: #3b82f6');

          if (completed === allCategories.length) {
            console.log('%c[TODOS] Total productos válidos:', 'color: #8b5cf6', allProducts.length);
            this.processAllProductsForDeal(allProducts);
          }
        },
        (error) => {
          completed++;
          console.error(`%c[ERROR en ${categoryName}]`, 'color: #ef4444', error);
          if (completed === allCategories.length) {
            this.processAllProductsForDeal(allProducts);
          }
        }
      );
    });
  }

  // === PROCESAR TODOS LOS PRODUCTOS PARA OFERTA ===
  private processAllProductsForDeal(data: Product[]) {
    this.isLoading = false;

    if (data.length === 0) {
      console.warn('%c[OFERTA] No hay productos válidos', 'color: #f59e0b');
      this.products = [];
      // this.updateSectionTitle(false);
      return;
    }

    const today = new Date().getDay();
    const todayDeal = this.dailyBrandDiscounts[today];

    console.log(`%c[HOY] Día: ${today} (${['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][today]})`, 'color: #3b82f6');
    console.log('%c[MARCA DEL DÍA]', 'color: #8b5cf6; font-weight: bold', todayDeal);

    if (!todayDeal) {
      console.warn('%c[OFERTA] No hay oferta programada para hoy', 'color: #ef4444');
      // this.updateSectionTitle(false);
      this.applyGeneralDiscount(data);
      return;
    }

    // === FILTRO POR MARCA ===
    const dealProducts = data.filter(p => {
      const pb = this.normalize(p.brand);
      const db = this.normalize(todayDeal.name);
      const match = pb && (pb === db || pb.includes(db));
      if (match) {
        console.log(`%cCOINCIDENCIA: "${p.brand}" (Categoría: ${p.category})`, 'color: #22c55e');
      }
      return match;
    });

    console.log(`%c[RESULTADO] Productos de "${todayDeal.name}": ${dealProducts.length}`, 'color: #10b981; font-weight: bold');

    if (dealProducts.length > 0) {
      this.hasTodayDeal = true;
      this.todayBrandName = todayDeal.name;
      this.todayDiscountPercent = todayDeal.discount;

      this.products = dealProducts.map(product => {
        const firstSize = product.sizes![0];
        const discountedPrice = Math.round(firstSize.price * (1 - todayDeal.discount / 100));

        return {
          ...product,
          price: discountedPrice,
          prevprice: firstSize.price,
          size: firstSize.size,
          size_id: firstSize.size_id,
          sizes: product.sizes || [],
          isTodayDeal: true
        };
      });

      // this.updateSectionTitle(true);
      console.log('%cOFERTA ACTIVADA EN TODAS LAS CATEGORÍAS', 'color: #22c55e; font-weight: bold', this.sectionTitle);
    } else {
      console.warn('%c[OFERTA] No se encontraron productos de la marca del día', 'color: #f59e0b');
      // this.updateSectionTitle(false);
      this.applyGeneralDiscount(data);
    }

    const seed = new Date().getTime();
    this.products = this.seededShuffle(this.products, seed).slice(0, 5);
  }

  // private updateSectionTitle(hasDeal: boolean) {
  //   if (hasDeal) {
  //     this.sectionTitle = `Oferta del Día: ${this.todayBrandName} -${this.todayDiscountPercent}%`;
  //   } else {
  //     this.sectionTitle = 'Explora nuestras marcas premium';
  //   }
  //   console.log('%c[TÍTULO]', 'color: #6366f1', this.sectionTitle);
  // }

  private applyGeneralDiscount(data: Product[]) {
    this.hasTodayDeal = false;
    this.products = data.map(product => {
      const firstSize = product.sizes![0];
      const discountedPrice = Math.round(firstSize.price * 0.9);

      return {
        ...product,
        price: discountedPrice,
        prevprice: firstSize.price,
        size: firstSize.size,
        size_id: firstSize.size_id,
        sizes: product.sizes || [],
        isTodayDeal: false
      };
    });
  }

  private seededShuffle(array: Product[], seed: number): Product[] {
    const rng = (s: number) => {
      const x = Math.sin(s++) * 10000;
      return x - Math.floor(x);
    };
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rng(seed + i) * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  selectSize(product: Product, size: { size_id: number; size: string; price: number; stock_quantity: number; image_url?: string }) {
    const updatedProducts = this.products.map(p => {
      if (p.id === product.id) {
        const discount = this.hasTodayDeal ? (1 - this.todayDiscountPercent / 100) : 0.9;
        const discountedPrice = Math.round(size.price * discount);
        return {
          ...p,
          size: size.size,
          size_id: size.size_id,
          price: discountedPrice,
          prevprice: size.price
        };
      }
      return p;
    });
    this.products = [...updatedProducts];
  }

  getDiscountPercent(product: Product): number {
    if (!product.prevprice || product.prevprice <= product.price) return 0;
    return Math.round((product.prevprice - product.price) / product.prevprice * 100);
  }

  getStockQuantity(product: Product): number {
    if (!product.sizes || product.sizes.length === 0) return 0;
    if (product.size_id) {
      return product.sizes.find(s => s.size_id === product.size_id)?.stock_quantity ?? 0;
    }
    return product.sizes[0].stock_quantity ?? 0;
  }

  scrollBrands(direction: 'left' | 'right') {
    const container = document.querySelector('.brands-container') as HTMLElement;
    if (container) {
      const scrollAmount = container.clientWidth * 0.8;
      container.scrollLeft += direction === 'left' ? -scrollAmount : scrollAmount;
    }
  }

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
}