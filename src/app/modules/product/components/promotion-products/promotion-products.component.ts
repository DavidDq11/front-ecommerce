// promotion-products.component.ts - VERSIÓN CON DEPURACIÓN
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
    '2025-45': { discount: 5, name: 'Monello' },
    '2025-46': { discount: 5, name: 'Cipacan' },
    '2025-47': { discount: 5, name: 'Hills' },
    '2025-48': { discount: 5, name: 'EQUILIBRIO' },
    '2025-49': { discount: 5, name: 'Agility' },
    '2025-50': { discount: 5, name: 'Br For Cat' },
    '2025-51': { discount: 5, name: 'Cipacan' },
    '2025-52': { discount: 5, name: 'Birbo' },
    '2026-01': { discount: 5, name: 'Chunky' },
    '2026-02': { discount: 5, name: 'KI' },
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

  private forceScrollToTop(): void {
    window.scrollTo(0, 0);
  }

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

  // 🎯 MÉTODO CON LOGS DETALLADOS - ACTUALIZADO PARA SIZES[]
  private applyWeeklyDiscount(product: Product, weeklyDeal: any): Product {
    console.log('🔧 Aplicando descuento a producto:', {
      producto: product.title,
      marca: product.brand,
      precioOriginalPrimerTamaño: product.sizes?.[0]?.price,
      ofertaSemanal: weeklyDeal
    });

    if (!weeklyDeal) {
      console.log('❌ No hay oferta semanal esta semana');
      const firstSize = product.sizes?.[0];
      return {
        ...product,
        price: firstSize?.price || 0,
        prevprice: undefined,
        discountPercent: undefined,
        size: firstSize?.size,
        size_id: firstSize?.size_id,
        sizes: product.sizes || [],
        isWeeklyDeal: false,
        qty: product.qty || 1,
        totalprice: (firstSize?.price || 0) * (product.qty || 1)
      };
    }

    const normalizedProductBrand = this.normalize(product.brand);
    const normalizedDealBrand = this.normalize(weeklyDeal.name);
    
    console.log('🔍 Comparando marcas:', {
      marcaProducto: normalizedProductBrand,
      marcaOferta: normalizedDealBrand
    });

    const hasWeeklyDiscount = normalizedProductBrand && 
                             (normalizedProductBrand === normalizedDealBrand || 
                              normalizedProductBrand.includes(normalizedDealBrand));

    if (hasWeeklyDiscount && product.sizes && product.sizes.length > 0) {
      // Aplicar descuento a TODOS los tamaños
      const discountedSizes = product.sizes.map(size => {
        const discountedPrice = Math.round(size.price * (1 - weeklyDeal.discount / 100));
        console.log('   📏 Descuento en tamaño:', {
          tamaño: size.size,
          precioOriginal: size.price,
          precioConDescuento: discountedPrice
        });
        return {
          ...size,
          price: discountedPrice
        };
      });

      const firstDiscountedSize = discountedSizes[0];
      const originalFirstPrice = product.sizes[0].price;
      
      console.log('✅ APLICANDO DESCUENTO:', {
        producto: product.title,
        precioOriginal: originalFirstPrice,
        descuento: weeklyDeal.discount + '%',
        precioConDescuento: firstDiscountedSize.price,
        ahorro: originalFirstPrice - firstDiscountedSize.price
      });

      return {
        ...product,
        sizes: discountedSizes,
        price: firstDiscountedSize.price,
        prevprice: originalFirstPrice,
        discountPercent: weeklyDeal.discount,
        size: firstDiscountedSize.size,
        size_id: firstDiscountedSize.size_id,
        isWeeklyDeal: true,
        qty: product.qty || 1,
        totalprice: firstDiscountedSize.price * (product.qty || 1)
      };
    } else {
      console.log('❌ Producto no califica para descuento:', {
        producto: product.title,
        motivo: !hasWeeklyDiscount ? 'Marca no coincide' : 'No tiene tamaños'
      });
      const firstSize = product.sizes?.[0];
      return {
        ...product,
        price: firstSize?.price || 0,
        prevprice: undefined,
        discountPercent: undefined,
        size: firstSize?.size,
        size_id: firstSize?.size_id,
        sizes: product.sizes || [],
        isWeeklyDeal: false,
        qty: product.qty || 1,
        totalprice: (firstSize?.price || 0) * (product.qty || 1)
      };
    }
  }

  // 🎯 MÉTODO MEJORADO CON MÁS LOGS
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
    this.hasWeeklyDeal = !!weeklyDeal;

    console.log(`%c📅 [PROMOCIONES] Semana ${currentWeek}`, 'color: #3b82f6; font-weight: bold', {
      oferta: weeklyDeal,
      marca: this.weeklyBrandName,
      descuento: this.weeklyDiscountPercent + '%',
      tieneOferta: this.hasWeeklyDeal
    });

    // 🎯 VERIFICAR SEMANA ACTUAL MANUALMENTE
    console.log('🔍 VERIFICANDO SEMANA ACTUAL:', {
      fechaActual: new Date(),
      semanaCalculada: currentWeek,
      ofertasConfiguradas: Object.keys(this.weeklyBrandDiscounts)
    });

    categories.forEach(category => {
      this.productService.getByCategory(category, { limit: 100, offset: 0 }).subscribe({
        next: (response) => {
          console.log(`📦 [${category}] Productos recibidos:`, response.products.length);

          const validProducts = response.products.filter(p => {
            const firstSize = p.sizes?.[0];
            const isValid = firstSize?.price && firstSize.price > 0;
            if (!isValid) {
              console.log('❌ Producto inválido:', { 
                producto: p.title, 
                tieneSizes: !!p.sizes,
                precio: firstSize?.price 
              });
            }
            return isValid;
          });

          console.log(`✅ [${category}] Productos válidos:`, validProducts.length);

          // Aplicar descuentos
          const weeklyProducts = validProducts
            .map(product => this.applyWeeklyDiscount(product, weeklyDeal))
            .filter(product => {
              const hasDiscount = product.isWeeklyDeal;
              if (hasDiscount) {
                console.log('🎯 PRODUCTO CON OFERTA ENCONTRADO:', {
                  categoria: category,
                  producto: product.title,
                  precio: product.price,
                  precioOriginal: product.prevprice,
                  descuento: product.discountPercent + '%'
                });
              }
              return hasDiscount;
            });

          console.log(`🔥 [${category}] Productos con oferta:`, weeklyProducts.length);

          allProducts = [...allProducts, ...weeklyProducts];
          completed++;

          if (completed === categories.length) {
            this.promotionProducts = this.sortProducts(allProducts);
            this.totalItems = allProducts.length;
            this.totalPages = Math.ceil(allProducts.length / this.pageSize);
            this.isLoading = false;
            
            // 🎯 RESUMEN FINAL
            console.log(`%c🎉 [PROMOCIONES FINAL]`, 'color: #22c55e; font-weight: bold', {
              totalProductos: allProducts.length,
              productosConDescuento: allProducts.filter(p => p.isWeeklyDeal).length,
              marcaOferta: this.weeklyBrandName,
              descuentoAplicado: this.weeklyDiscountPercent + '%'
            });

            // 🎯 MOSTRAR LOS PRIMEROS 5 PRODUCTOS PARA VERIFICAR
            if (allProducts.length > 0) {
              console.log('📋 MUESTRA DE PRODUCTOS CON DESCUENTO:');
              allProducts.slice(0, 5).forEach((product, index) => {
                console.log(`   ${index + 1}. ${product.title}`, {
                  marca: product.brand,
                  precio: product.price,
                  precioOriginal: product.prevprice,
                  descuento: product.discountPercent + '%',
                  tieneDescuento: product.isWeeklyDeal
                });
              });
            }
          }
        },
        error: (error) => {
          console.error(`❌ Error loading ${category}:`, error);
          completed++;
          if (completed === categories.length) {
            this.isLoading = false;
          }
        }
      });
    });
  }

  // 🎯 MÉTODO PARA VERIFICAR SI HAY PRODUCTOS CON DESCUENTO
  checkDiscounts() {
    const productsWithDiscount = this.promotionProducts.filter(p => p.isWeeklyDeal);
    console.log('🔍 VERIFICACIÓN MANUAL DE DESCUENTOS:', {
      totalProductos: this.promotionProducts.length,
      productosConDescuento: productsWithDiscount.length,
      productos: productsWithDiscount.map(p => ({
        title: p.title,
        brand: p.brand,
        price: p.price,
        prevprice: p.prevprice,
        discount: p.discountPercent
      }))
    });
  }

  private sortProducts(products: Product[]): Product[] {
    return products.sort((a, b) => {
      if (a.brand === this.weeklyBrandName && b.brand !== this.weeklyBrandName) return -1;
      if (a.brand !== this.weeklyBrandName && b.brand === this.weeklyBrandName) return 1;
      
      const discountA = this.getDiscountPercent(a);
      const discountB = this.getDiscountPercent(b);
      return discountB - discountA;
    });
  }

  addToCart(product: Product) {
    console.log('🛒 Agregando al carrito:', {
      producto: product.title,
      precio: product.price,
      precioOriginal: product.prevprice,
      tieneDescuento: product.isWeeklyDeal
    });

    const productToAdd: Product = {
      ...product,
      qty: product.qty || 1,
      totalprice: product.price * (product.qty || 1)
    };
    
    this.cartService.addToCart(productToAdd);
  }

  removeFromCart(product: Product) {
    this.cartService.remove(product);
  }

  isProductInCart(product: Product): boolean {
    return this.cartService.getCart().some((item: Product) => 
      item.id === product.id && item.size === product.size
    );
  }

  // Métodos de paginación (sin cambios)
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

  getDiscountPercent(product: Product): number {
    if (!product.prevprice || product.prevprice <= product.price) return 0;
    return Math.round((product.prevprice - product.price) / product.prevprice * 100);
  }

  // 🎯 MÉTODO PARA FORZAR LA VERIFICACIÓN
  forceCheckDiscounts() {
    this.checkDiscounts();
  }
}