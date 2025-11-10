// promotion-products.component.ts
import { Component, OnInit } from '@angular/core';
import { Product } from '../../model';
import { ProductService } from '../../services/product.service';
import { CartService } from 'src/app/core/services/cart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-promotion-products',
  templateUrl: './promotion-products.component.html',
})
export class PromotionProductsComponent implements OnInit {
  promotionProducts: Product[] = [];
  isLoading = false;
  currentPage = 1;
  pageSize = 20;
  totalItems = 0;
  totalPages = 1;
  weeklyBrandName: string = '';
  weeklyDiscountPercent: number = 0;
  hasWeeklyDeal: boolean = false;

  // Descuentos por semana
  private weeklyBrandDiscounts: { [key: string]: { discount: number; name: string } } = {
    // Noviembre 2025
    '2025-45': { discount: 5, name: 'Monello' },      // Semana 45: 4-5 nov
    '2025-46': { discount: 5, name: 'Royal Canin' },  // Semana 46: 11-17 nov ← ESTA SEMANA
    '2025-47': { discount: 5, name: 'Hills' },        // Semana 47: 18-24 nov
    '2025-48': { discount: 5, name: 'EQUILIBRIO' },   // Semana 48: 25 nov - 1 dic
    
    // Diciembre 2025
    '2025-49': { discount: 5, name: 'Agility' },      // Semana 49: 2-8 dic
    '2025-50': { discount: 5, name: 'Br For Cat' },   // Semana 50: 9-15 dic
    '2025-51': { discount: 5, name: 'Cipacan' },      // Semana 51: 16-22 dic (Navidad)
    '2025-52': { discount: 5, name: 'Birbo' },        // Semana 52: 23-29 dic (Navidad)
    
    // Enero 2026
    '2026-01': { discount: 5, name: 'Chunky' },       // Semana 1: 30 dic - 5 ene
    '2026-02': { discount: 5, name: 'KI' },           // Semana 2: 6-12 ene
  };

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPromotionProducts();
    this.forceScrollToTop();
  }

  // Función mejorada para scroll en móviles
  private forceScrollToTop(): void {
    // Método 1: Scroll inmediato
    window.scrollTo(0, 0);
    
    // Método 2: Scroll suave después de un pequeño delay
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 100);

    // Método 3: Para iOS/Safari - usar diferentes enfoques
    setTimeout(() => {
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
      
      // Alternativa para Safari
      if ('scrollBehavior' in document.documentElement.style) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo(0, 0);
      }
    }, 150);
  }

  // También puedes agregar esta función pública para llamarla desde el home
  scrollToTop(): void {
    this.forceScrollToTop();
  }

  private getWeekNumber(date: Date): string {
    const startDate = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + 1) / 7);
    return `${date.getFullYear()}-${weekNumber.toString().padStart(2, '0')}`;
  }

  private normalize(str?: string): string {
    if (!str) return '';
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ');
  }

  private applyWeeklyDiscount(product: Product, weeklyDeal: any): Product {
    if (!weeklyDeal) {
      // ⚠️ IMPORTANTE: Si no hay oferta semanal, NO aplicar descuento
      const firstSize = product.sizes![0];
      return {
        ...product,
        price: firstSize.price, // Precio original SIN descuento
        prevprice: undefined,   // No hay precio anterior
        discountPercent: undefined,
        size: firstSize.size,
        size_id: firstSize.size_id,
        sizes: product.sizes || [],
        isWeeklyDeal: false
      };
    }

    const normalizedProductBrand = this.normalize(product.brand);
    const normalizedDealBrand = this.normalize(weeklyDeal.name);
    
    const hasWeeklyDiscount = normalizedProductBrand && 
                             (normalizedProductBrand === normalizedDealBrand || 
                              normalizedProductBrand.includes(normalizedDealBrand));

    const firstSize = product.sizes![0];
    
    if (hasWeeklyDiscount && firstSize) {
      const discountedPrice = Math.round(firstSize.price * (1 - weeklyDeal.discount / 100));
      
      return {
        ...product,
        price: discountedPrice,
        prevprice: firstSize.price,
        discountPercent: weeklyDeal.discount,
        size: firstSize.size,
        size_id: firstSize.size_id,
        sizes: product.sizes || [],
        isWeeklyDeal: true
      };
    }
    
    // ⚠️ IMPORTANTE: Si el producto no es de la marca en oferta, NO aplicar descuento
    return {
      ...product,
      price: firstSize.price, // Precio original
      prevprice: undefined,   // No hay precio anterior
      discountPercent: undefined,
      size: firstSize.size,
      size_id: firstSize.size_id,
      sizes: product.sizes || [],
      isWeeklyDeal: false
    };
  }

  loadPromotionProducts() {
    this.isLoading = true;
    this.promotionProducts = [];

    const categories = ['Alimentos Secos', 'Alimentos Húmedos', 'Snacks', 'Arena para Gatos', 'Accesorios', 'Productos Veterinarios'];
    let allProducts: Product[] = [];
    let completed = 0;

    // Obtener oferta de la semana actual
    const currentWeek = this.getWeekNumber(new Date());
    const weeklyDeal = this.weeklyBrandDiscounts[currentWeek];
    
    this.weeklyBrandName = weeklyDeal?.name || '';
    this.weeklyDiscountPercent = weeklyDeal?.discount || 0;
    this.hasWeeklyDeal = !!weeklyDeal; // Solo true si hay oferta esta semana

    console.log(`%c[PROMOCIONES] Semana ${currentWeek} - Oferta: ${this.weeklyBrandName || 'Ninguna'}`, 'color: #3b82f6');

    categories.forEach(category => {
      this.productService.getByCategory(category, { limit: 50, offset: 0 }).subscribe({
        next: (response) => {
          const validProducts = response.products.filter(p => {
            const firstSize = p.sizes?.[0];
            return firstSize?.price && firstSize.price > 0;
          });

          // Aplicar descuentos y filtrar SOLO productos con oferta semanal
          const weeklyProducts = validProducts
            .map(product => this.applyWeeklyDiscount(product, weeklyDeal))
            .filter(product => product.isWeeklyDeal); // ⚠️ Solo productos con oferta real

          allProducts = [...allProducts, ...weeklyProducts];
          completed++;

          console.log(`%c[${category}] Productos con oferta: ${weeklyProducts.length}`, 'color: #10b981');

          if (completed === categories.length) {
            this.promotionProducts = allProducts;
            this.totalItems = allProducts.length;
            this.totalPages = Math.ceil(allProducts.length / this.pageSize);
            this.isLoading = false;
            
            console.log(`%c[PROMOCIONES FINAL] Total productos con oferta: ${allProducts.length}`, 'color: #22c55e; font-weight: bold');
          }
        },
        error: (error) => {
          console.error(`Error loading ${category}:`, error);
          completed++;
          if (completed === categories.length) {
            this.isLoading = false;
          }
        }
      });
    });
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product);
  }

  removeFromCart(product: Product) {
    this.cartService.remove(product);
  }

  isProductInCart(product: Product): boolean {
    return this.cartService.getCart().some((item: Product) => 
      item.id === product.id && item.size === product.size
    );
  }

  // Métodos de paginación
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  get paginatedProducts(): Product[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.promotionProducts.slice(startIndex, endIndex);
  }

  getPageNumbers(): number[] {
    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Método para obtener el porcentaje de descuento
  getDiscountPercent(product: Product): number {
    if (!product.prevprice || product.prevprice <= product.price) return 0;
    return Math.round((product.prevprice - product.price) / product.prevprice * 100);
  }
}