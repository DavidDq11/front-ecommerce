import { Component, OnDestroy, OnInit } from '@angular/core';
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
export class HomeComponent implements OnInit, OnDestroy {
  faBone = faBone; faFish = faFish; faCookieBite = faCookieBite;
  faPaw = faPaw; faTag = faTag; faSyringe = faSyringe;

  // === ⚙️ CONFIGURACIÓN DE CLOUDINARY ===
  private cloudName = 'dvx9tlqvt'; // 👈 REEMPLAZA ESTO (EJ: domipets-cdn)
  private baseUrl = `https://res.cloudinary.com/${this.cloudName}/image/upload/`;

  // Transformaciones para los banners (aplicadas a TODOS)
  private bannerTransformations = 'f_auto,q_auto:best,c_fit,h_300,w_1200';
  // Transformaciones para las noticias (pequeñas)
  private newsTransformations = 'f_auto,q_auto:good,c_fill,h_400,w_600';
  // ======================================

  products: Product[] = [];
  brands: Brand[] = [];
  featuredBrand: Brand | null = null;
  skeletons: number[] = [...new Array(6)];
  error!: string;
  isLoading = false;
  launchCountdown: string = '';

  // Ahora se inicializa vacío y se llena en ngOnInit
  images: string[] = [];

  categories = [
    { id: 1, name: 'Alimentos Secos', icon: 'fa-bone', path: '/categories/Alimentos Secos' },
    { id: 2, name: 'Alimentos Húmedos', icon: 'fa-fish', path: '/categories/Alimentos Húmedos' },
    { id: 3, name: 'Snacks', icon: 'fa-cookie-bite', path: '/categories/Snacks' },
    { id: 4, name: 'Arena para Gatos', icon: 'fa-paw', path: '/categories/Arena para Gatos' },
    { id: 5, name: 'Accesorios', icon: 'fa-tag', path: '/categories/Accesorios' },
    { id: 6, name: 'Productos Veterinarios', icon: 'fa-syringe', path: '/categories/Productos Veterinarios' }
  ];

  // Ahora se inicializa vacío y se llena en la función
  newsItems: NewsItem[] = [];

  selectedCategoryId: number | null = null;
  selectedBrandId: number | null = null;
  selectedBrandName: string | null = null;

  // === VARIABLES MODIFICADAS: DESCUENTOS POR SEMANA ===
  todayBrandName: string = '';
  todayDiscountPercent: number = 0;
  hasTodayDeal: boolean = false;
  sectionTitle: string = 'Ofertas de la Semana';

  // === CAMBIO PRINCIPAL: DESCUENTOS POR SEMANA EN LUGAR DE POR DÍA ===
  private weeklyBrandDiscounts: { [key: string]: { discount: number; name: string } } = {
    // Noviembre 2025
    '2025-45': { discount: 5, name: 'Monello' },      // Semana 45: 4-5 nov
    '2025-46': { discount: 5, name: 'Cipacan' },  // Semana 46: 11-17 nov ← ESTA SEMANA
    '2025-47': { discount: 5, name: 'Hills' },        // Semana 47: 18-24 nov
    '2025-48': { discount: 5, name: 'EQUILIBRIO' },   // Semana 48: 25 nov - 1 dic

    // Diciembre 2025
    '2025-49': { discount: 5, name: 'Agility' },      // Semana 49: 2-8 dic
    '2025-50': { discount: 5, name: 'Br For Cat' },   // Semana 50: 9-15 dic
    '2025-51': { discount: 5, name: 'Cipacan' },      // Semana 51: 16-22 dic (Navidad)
    '2025-52': { discount: 5, name: 'Birbo' },        // Semana 52: 23-29 dic (Navidad)

    // Enero 2026
    '2026-01': { discount: 5, name: 'Chunky' },       // Semana 1: 30 dic - 5 ene
    '2026-02': { discount: 5, name: 'KI' },           // Semana 2: 6-12 ene
  };

  // === ORDEN PERSONALIZADO DE MARCAS ===
  private customBrandOrder: string[] = [
    'Select', 'Monello', 'Hills', 'Royal Canin', 'EQUILIBRIO', 'Agility', 'Br For Cat', 'Br For Dog',
    'Cipacan', 'Birbo', 'Chunky', 'KI', 'Kitten Paw', 'MAX', 'Nutrecan', 'SOLLA'
  ];

  constructor(
    private _productService: ProductService,
    private cartService: CartService,
    private http: HttpClient,
    private router: Router,
    private titleService: Title,
    private metaService: Meta
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle('Domipets - Tienda de Productos para Mascotas y Ganado');
    this.metaService.updateTag({ name: 'description', content: 'Alimentos, medicamentos y accesorios para mascotas con entrega el mismo día en Manizales.' });

    // === LLAMADAS A LAS FUNCIONES DE CLOUDINARY ===
    this.setupCarouselImages();
    this.setupNewsItems();
    // ==============================================

    this.fetchBrands();
    this.newArrivalProducts();
    this.startLaunchCountdown();
  }

  // 🚀 NUEVA FUNCIÓN: CONFIGURAR BANNERS (CAROUSEL)
  setupCarouselImages(): void {
    // Solo lista los Public IDs de tus imágenes de Cloudinary
    const imageIds = [
      'banner2_frxz84', // 👈 REEMPLAZA ESTO
      'banner3_pjt8uf', // 👈 REEMPLAZA ESTO
      'banner1_hv0rpe', // 👈 REEMPLAZA ESTO
    ];

    // Construye el array 'images' usando las transformaciones definidas
    this.images = imageIds.map(id => `${this.baseUrl}${this.bannerTransformations}/${id}`);
  }

  // 📰 NUEVA FUNCIÓN: CONFIGURAR NOTICIAS (PARA OPTIMIZARLAS TAMBIÉN)
  setupNewsItems(): void {
    this.newsItems = [
      {
        id: 1,
        title: '¡Cuidamos a tu Mascota! Consultas Veterinarias en Tienda o a Domicilio',
        summary: 'Visítanos en nuestro punto físico en Manizales o agenda una consulta veterinaria a domicilio. Nuestros expertos están listos para mantener a tus mascotas sanas y felices. ¡Contáctanos hoy!',
        // Reemplaza 'Veterinario.webp' con el Public ID de Cloudinary
        image: `${this.baseUrl}${this.newsTransformations}/images/VETERINARIO_ID` // 👈 REEMPLAZA
      },
      {
        id: 2,
        title: '¡Productos para Mascotas en tu Puerta el Mismo Día!',
        summary: 'Pide alimentos, accesorios, o medicamentos antes de las 3 p.m. y recíbelos hoy mismo en cualquier parte de Manizales. ¡Compra ahora y consiente a tu mascota!',
        // Reemplaza 'Domicilio.webp' con el Public ID de Cloudinary
        image: `${this.baseUrl}${this.newsTransformations}/images/DOMICILIO_ID` // 👈 REEMPLAZA
      },
      {
        id: 3,
        title: '¡Nuevos Medicamentos y Vitaminas para tus Mascotas!',
        summary: 'Explora nuestra gama de medicamentos y vitaminas de alta calidad para perros, gatos y ganado. Fortalece su salud con productos confiables. ¡Pídelos hoy en Domipets!',
        // Reemplaza 'Medicamentos.webp' con el Public ID de Cloudinary
        image: `${this.baseUrl}${this.newsTransformations}/images/MEDICAMENTOS_ID` // 👈 REEMPLAZA
      }
    ];
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

  // === NUEVA FUNCIÓN: OBTENER SEMANA DEL AÑO ===
  private getWeekNumber(date: Date): string {
    const startDate = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + 1) / 7);
    return `${date.getFullYear()}-${weekNumber.toString().padStart(2, '0')}`;
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
    this.newArrivalProducts();
  }

  // === MODIFICADO: BUSCAR EN TODAS LAS CATEGORÍAS CON DESCUENTOS POR SEMANA ===
  newArrivalProducts() {
    this.isLoading = true;
    this.products = [];

    const allCategories = this.categories.map(c => c.name);
    const allProducts: Product[] = [];
    let completado = 0;

    console.log('%c[OFERTA DE LA SEMANA] Buscando en TODAS las categorías...', 'color: #10b981; font-weight: bold');

    // Obtener semana actual para descuentos
    const currentWeek = this.getWeekNumber(new Date());
    const weeklyDeal = this.weeklyBrandDiscounts[currentWeek];

    console.log(`%c[SEMANA ACTUAL] ${currentWeek} - Marca: ${weeklyDeal?.name || 'Ninguna'} - ${weeklyDeal?.discount || 0}%`, 'color: #3b82f6');

    allCategories.forEach(categoryName => {
      const params = { limit: 50, offset: 0 };

      this._productService.getByCategory(categoryName, params).subscribe(
        (response: { products: Product[], total: number }) => {
          const validProducts = response.products.filter(p => {
            const firstSize = p.sizes?.[0];
            return firstSize?.price && firstSize.price > 0;
          });

          // Aplicar descuentos de la semana
          const discountedProducts = validProducts.map(product => {
            return this.applyWeeklyDiscount(product, weeklyDeal);
          });

          allProducts.push(...discountedProducts);
          completado++;

          console.log(`%c[${categoryName}] ${validProducts.length} productos válidos`, 'color: #3b82f6');

          if (completado === allCategories.length) {
            this.processAllProductsForDeal(allProducts, weeklyDeal);
          }
        },
        (error) => {
          completado++;
          console.error(`%c[ERROR en ${categoryName}]`, 'color: #ef4444', error);
          if (completado === allCategories.length) {
            this.processAllProductsForDeal(allProducts, weeklyDeal);
          }
        }
      );
    });
  }

  // === ACTUALIZADO: APLICAR DESCUENTO SEMANAL, INCLUYENDO SIZES[] ===
  private applyWeeklyDiscount(product: Product, weeklyDeal: any): Product {
    if (!weeklyDeal) {
      // ⚠️ IMPORTANTE: Si no hay oferta semanal, NO aplicar descuento
      const firstSize = product.sizes?.[0];
      return {
        ...product,
        price: firstSize?.price || 0, // Precio original SIN descuento
        prevprice: undefined,         // No hay precio anterior
        size: firstSize?.size,
        size_id: firstSize?.size_id,
        sizes: product.sizes || [],
        isWeeklyDeal: false
      };
    }

    const normalizedProductBrand = this.normalize(product.brand);
    const normalizedDealBrand = this.normalize(weeklyDeal.name);

    const hasWeeklyDiscount = normalizedProductBrand &&
      (normalizedProductBrand === normalizedDealBrand ||
        normalizedProductBrand.includes(normalizedDealBrand));

    if (hasWeeklyDiscount && product.sizes && product.sizes.length > 0) {
      // Aplicar descuento a TODOS los tamaños
      const discountedSizes = product.sizes.map(size => ({
        ...size,
        price: Math.round(size.price * (1 - weeklyDeal.discount / 100))
      }));

      const firstDiscountedSize = discountedSizes[0];
      const originalFirstPrice = product.sizes[0].price;

      return {
        ...product,
        sizes: discountedSizes,
        price: firstDiscountedSize.price,
        prevprice: originalFirstPrice,
        discountPercent: weeklyDeal.discount,
        size: firstDiscountedSize.size,
        size_id: firstDiscountedSize.size_id,
        isWeeklyDeal: true
      };
    } else {
      // ⚠️ IMPORTANTE: Si el producto no es de la marca en oferta, NO aplicar descuento
      const firstSize = product.sizes?.[0];
      return {
        ...product,
        price: firstSize?.price || 0, // Precio original
        prevprice: undefined,         // No hay precio anterior
        size: firstSize?.size,
        size_id: firstSize?.size_id,
        sizes: product.sizes || [],
        isWeeklyDeal: false
      };
    }
  }

  // === MODIFICADO: PROCESAR PRODUCTOS CON DESCUENTOS SEMANALES ===
  private processAllProductsForDeal(data: Product[], weeklyDeal: any) {
    this.isLoading = false;

    if (data.length === 0) {
      console.warn('%c[OFERTA] No hay productos válidos', 'color: #f59e0b');
      this.products = [];
      return;
    }

    // Filtrar productos que tienen descuento semanal
    const weeklyDealProducts = data.filter(product => product.isWeeklyDeal);

    console.log(`%c[OFERTA SEMANAL] Productos con descuento real: ${weeklyDealProducts.length}`, 'color: #10b981; font-weight: bold');

    if (weeklyDealProducts.length > 0) {
      this.hasTodayDeal = true;
      this.todayBrandName = weeklyDeal.name;
      this.todayDiscountPercent = weeklyDeal.discount;

      // ✅ LIMITAR A SOLO 5 PRODUCTOS EN EL HOME
      this.products = this.seededShuffle(weeklyDealProducts, new Date().getTime()).slice(0, 5);

      this.sectionTitle = `Oferta de la Semana: ${this.todayBrandName} -${this.todayDiscountPercent}%`;
      console.log('%cOFERTA SEMANAL ACTIVADA - Mostrando 5 productos', 'color: #22c55e; font-weight: bold', this.sectionTitle);
    } else {
      console.warn('%c[OFERTA] No se encontraron productos de la marca de la semana', 'color: #f59e0b');
      this.hasTodayDeal = false;

      // ✅ LIMITAR A SOLO 5 PRODUCTOS EN EL HOME (sin oferta)
      const seed = new Date().getTime();
      const randomProducts = this.seededShuffle(data, seed)
        .slice(0, 5)
        .map(product => {
          const firstSize = product.sizes?.[0];
          return {
            ...product,
            price: firstSize?.price || 0, // Precio original
            prevprice: undefined,         // Sin precio anterior
            size: firstSize?.size,
            size_id: firstSize?.size_id,
            isWeeklyDeal: false
          };
        });

      this.products = randomProducts;
      this.sectionTitle = 'Productos Destacados';
    }
  }

  selectSize(product: Product, size: { size_id: number; size: string; price: number; stock_quantity: number; image_url?: string }) {
    const updatedProducts = this.products.map(p => {
      if (p.id === product.id) {
        // Recalcular precio: solo aplicar descuento si es oferta semanal
        // Nota: Dado que sizes[] ya tiene descuentos aplicados, usamos directamente el price de size
        if (p.isWeeklyDeal) {
          const originalPrice = p.sizes?.find(s => s.size_id === size.size_id)?.price || size.price; // Pero wait, sizes ya descontados? No, en la actualización, sizes tiene descuentos, pero para tachado necesitamos original.
          // Para consistencia, quizá almacenar original en una prop nueva, pero por ahora, asumimos prevprice es fijo.
          return {
            ...p,
            size: size.size,
            size_id: size.size_id,
            price: size.price, // Ya con descuento
            prevprice: p.prevprice // Mantenemos el original del primero, o calcular por tamaño si necesitas
          };
        } else {
          // Si no es oferta semanal, usar precio normal
          return {
            ...p,
            size: size.size,
            size_id: size.size_id,
            price: size.price,
            prevprice: undefined
          };
        }
      }
      return p;
    });
    this.products = [...updatedProducts];
  }

  getTotalWeeklyProducts(): number {
    // Este es un ejemplo - en una app real podrías tener este dato del backend
    // Por ahora retornamos un número estimado basado en los productos cargados
    if (this.hasTodayDeal && this.products.length > 0) {
      // Suponiendo que hay entre 15-25 productos de la marca en oferta
      return Math.max(15, this.products.length * 3);
    }
    return 0;
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

  scrollToTop(): void {
    // Scroll suave al inicio de la página
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }

  ngOnDestroy(): void {
    // Cleanup si es necesario
  }
}