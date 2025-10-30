import { Component, OnInit, HostListener, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CartService } from 'src/app/core/services/cart.service';
import { AuthService } from 'src/app/shared/services/auth/auth.service';
import { Product } from 'src/app/modules/product/model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, AfterViewInit {
  @ViewChild('categoryMenu') categoryMenu!: ElementRef;
  @ViewChild('carousel') carousel!: ElementRef;
  
  mobileMenuOpen = false;
  showAccountMenu = false;
  activeDropdown: string | null = null;
  pinnedDropdown: string | null = null;
  cart: Product[] = [];
  isHeaderTopHidden = false;
  isHeaderFixedHidden = false;
  userName: string | null = null;
  isCartModalOpen = false;
  isAdmin: boolean = false;
  
  // Nuevas propiedades para el scroll
  canScrollLeft = false;
  canScrollRight = false;
  showScrollHint = false;
  private userSubscription: Subscription = new Subscription();
  private scrollCheckTimeout: any;

  constructor(private cartService: CartService, public authService: AuthService) {}

  ngOnInit(): void {
    this.cart = this.cartService.getCart();
    this.checkUserStatus();
    this.userSubscription = this.authService.user$.subscribe(user => {
      this.userName = user?.name || null;
      this.isAdmin = user?.admin ?? false;
      this.showAccountMenu = false;
      if (!user) {
        this.mobileMenuOpen = false;
      }
    });
    this.cartService.cartUpdated.subscribe(() => {
      this.cart = this.cartService.getCart();
    });

    // Mostrar hint de scroll para nuevos usuarios (solo una vez por sesión)
    const hasSeenScrollHint = sessionStorage.getItem('hasSeenScrollHint');
    if (!hasSeenScrollHint && window.innerWidth <= 768) {
      setTimeout(() => {
        this.showScrollHint = true;
        setTimeout(() => {
          this.showScrollHint = false;
          sessionStorage.setItem('hasSeenScrollHint', 'true');
        }, 4000);
      }, 1000);
    }
  }

  ngAfterViewInit(): void {
    this.checkScrollability();
    
    // Revisar scrollability después de que la vista se estabilice
    setTimeout(() => {
      this.checkScrollability();
    }, 500);
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
    if (this.scrollCheckTimeout) {
      clearTimeout(this.scrollCheckTimeout);
    }
  }

  checkUserStatus() {
    if (this.authService.isLoggedIn()) {
      const user = this.authService.getUserData();
      this.userName = user?.name || 'Usuario';
      this.isAdmin = user?.admin ?? false;
    } else {
      this.userName = null;
      this.isAdmin = false;
      this.showAccountMenu = false;
      this.mobileMenuOpen = false;
    }
  }

  // Verificar si el menú puede hacer scroll
  checkScrollability() {
    if (!this.categoryMenu?.nativeElement) return;

    const element = this.categoryMenu.nativeElement;
    this.canScrollLeft = element.scrollLeft > 0;
    this.canScrollRight = element.scrollLeft < (element.scrollWidth - element.clientWidth - 1);
    
    // Actualizar clases CSS
    const navElement = document.querySelector('nav');
    if (navElement) {
      navElement.classList.toggle('scrollable-left', this.canScrollLeft);
      navElement.classList.toggle('scrollable-right', this.canScrollRight);
      navElement.classList.toggle('show-scroll-hint', this.showScrollHint);
    }
  }

  // Evento de scroll del menú
  onCategoryScroll() {
    if (this.scrollCheckTimeout) {
      clearTimeout(this.scrollCheckTimeout);
    }
    
    this.scrollCheckTimeout = setTimeout(() => {
      this.checkScrollability();
    }, 100);
  }

  // Método para scroll del menú
  scrollMenu(direction: 'left' | 'right') {
    if (this.categoryMenu && this.categoryMenu.nativeElement) {
      const menu = this.categoryMenu.nativeElement;
      const scrollAmount = 200;
      
      if (direction === 'left') {
        menu.scrollLeft -= scrollAmount;
      } else {
        menu.scrollLeft += scrollAmount;
      }
      
      // Actualizar estado después del scroll
      setTimeout(() => this.checkScrollability(), 150);
    }
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    if (this.mobileMenuOpen) {
      this.activeDropdown = null;
      this.pinnedDropdown = null;
      this.showAccountMenu = false;
    }
  }

  toggleAccountMenu() {
    this.showAccountMenu = !this.showAccountMenu;
    if (this.showAccountMenu) {
      this.activeDropdown = null;
      this.pinnedDropdown = null;
      if (window.innerWidth <= 768) {
        this.mobileMenuOpen = true;
      }
    } else if (window.innerWidth <= 768) {
      this.mobileMenuOpen = false;
    }
  }

  toggleDropdown(category: string, event?: Event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    if (window.innerWidth > 1024) {
      if (this.pinnedDropdown === category) {
        this.pinnedDropdown = null;
        this.activeDropdown = null;
      } else {
        this.pinnedDropdown = category;
        this.activeDropdown = category;
        this.showAccountMenu = false;
      }
    } else {
      if (this.activeDropdown === category) {
        this.activeDropdown = null;
      } else {
        this.activeDropdown = category;
        this.showAccountMenu = false;
      }
      setTimeout(() => {
        this.positionDropdown(category, event);
      }, 10);
    }
  }

  private positionDropdown(category: string, event?: Event) {
    if (window.innerWidth <= 1024) {
      const dropdownMenu = document.querySelector('.dropdown-menu.show') as HTMLElement;
      if (dropdownMenu) {
        if (window.innerWidth <= 768) {
          const navHeight = document.querySelector('nav')?.offsetHeight || 0;
          const headerHeight = document.querySelector('header')?.offsetHeight || 0;
          
          dropdownMenu.style.position = 'fixed';
          dropdownMenu.style.top = `${navHeight + headerHeight + 60}px`;
          dropdownMenu.style.left = '10px';
          dropdownMenu.style.right = 'auto';
          dropdownMenu.style.width = 'calc(100% - 20px)';
          dropdownMenu.style.maxWidth = '300px';
          dropdownMenu.style.margin = '0 auto';
          dropdownMenu.style.zIndex = '25000';
          
          const screenWidth = window.innerWidth;
          const dropdownWidth = 300;
          const leftPosition = (screenWidth - dropdownWidth) / 2;
          dropdownMenu.style.left = `${Math.max(10, leftPosition)}px`;
          dropdownMenu.style.right = 'auto';
          dropdownMenu.style.width = `${Math.min(300, screenWidth - 20)}px`;
        } else {
          const navHeight = document.querySelector('nav')?.offsetHeight || 0;
          const headerHeight = document.querySelector('header')?.offsetHeight || 0;
          
          dropdownMenu.style.position = 'fixed';
          dropdownMenu.style.top = `${navHeight + headerHeight + 60}px`;
          dropdownMenu.style.left = '20px';
          dropdownMenu.style.right = 'auto';
          dropdownMenu.style.width = 'calc(100% - 40px)';
          dropdownMenu.style.maxWidth = '400px';
          dropdownMenu.style.margin = '0 auto';
          dropdownMenu.style.zIndex = '24000';
          
          const screenWidth = window.innerWidth;
          const dropdownWidth = 400;
          const leftPosition = (screenWidth - dropdownWidth) / 2;
          dropdownMenu.style.left = `${Math.max(20, leftPosition)}px`;
          dropdownMenu.style.right = 'auto';
          dropdownMenu.style.width = `${Math.min(400, screenWidth - 40)}px`;
        }
      }
    }
  }

  onMouseEnter(category: string) {
    if (window.innerWidth > 1024) {
      if (!this.pinnedDropdown) {
        this.activeDropdown = category;
        this.showAccountMenu = false;
      }
    } else if (window.innerWidth > 768) {
      this.activeDropdown = category;
      this.showAccountMenu = false;
    }
  }

  onMouseLeave() {
    if (window.innerWidth > 1024) {
      if (!this.pinnedDropdown) {
        this.activeDropdown = null;
      }
    } else if (window.innerWidth > 768) {
      this.activeDropdown = null;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    
    if (window.innerWidth > 1024) {
      if (!target.closest('.group') && !target.closest('.dropdown-menu') && !target.closest('.suggestions-list')) {
        this.activeDropdown = null;
        this.pinnedDropdown = null;
      }
    } else {
      if (!target.closest('.group') && !target.closest('.dropdown-menu') && !target.closest('.suggestions-list')) {
        this.activeDropdown = null;
      }
    }
    
    if (!target.closest('.group') && !target.closest('.account-menu') && !target.closest('.suggestions-list')) {
      this.showAccountMenu = false;
    }
  }

  @HostListener('document:touchstart', ['$event'])
  onTouchStart(event: Event) {
    const target = event.target as HTMLElement;
    
    if (!target.closest('.group') && !target.closest('.dropdown-menu') && !target.closest('.suggestions-list')) {
      this.activeDropdown = null;
      this.pinnedDropdown = null;
    }
    
    if (!target.closest('.group') && !target.closest('.account-menu') && !target.closest('.suggestions-list')) {
      this.showAccountMenu = false;
    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.activeDropdown = null;
    this.pinnedDropdown = null;
    this.showAccountMenu = false;
    
    // Revisar scrollability al cambiar tamaño
    setTimeout(() => {
      this.checkScrollability();
    }, 300);
    
    if (this.activeDropdown) {
      setTimeout(() => {
        this.positionDropdown(this.activeDropdown!);
      }, 100);
    }
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    if (window.innerWidth <= 1024 && this.activeDropdown) {
      this.activeDropdown = null;
      this.pinnedDropdown = null;
    }
  }

  logOut() {
    this.authService.logout();
    this.userName = null;
    this.isAdmin = false;
    this.showAccountMenu = false;
    this.mobileMenuOpen = false;
    this.activeDropdown = null;
    this.pinnedDropdown = null;
  }

  scrollCarousel(direction: 'left' | 'right') {
    const carouselEl = this.carousel.nativeElement;
    const scrollAmount = 150;
    if (direction === 'left') {
      carouselEl.scrollLeft -= scrollAmount;
    } else {
      carouselEl.scrollLeft += scrollAmount;
    }
  }

  openCartModal(event: Event) {
    event.stopPropagation();
    this.isCartModalOpen = true;
    this.activeDropdown = null;
    this.pinnedDropdown = null;
    this.showAccountMenu = false;
  }

  closeCartModal() {
    this.isCartModalOpen = false;
  }

  // Método para mejorar SEO - Estructura semántica
  get structuredData() {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': 'DOMIPETS',
      'url': window.location.origin,
      'logo': 'https://res.cloudinary.com/dgtukxydi/image/upload/v1757113148/Blanco_02_itshur.png',
      'description': 'Tienda veterinaria especializada en alimentos y accesorios para mascotas',
      'telephone': '+57-3016650526',
      'address': {
        '@type': 'PostalAddress',
        'addressCountry': 'CO'
      },
      'sameAs': [
        'https://tiktok.com/@domipets636',
        'https://www.facebook.com/profile.php?id=61577026983860',
        'https://instagram.com/domipetstiendaveterinaria'
      ]
    };
  }

  // Método para trackeo de interacciones (opcional para analytics)
  trackCategoryInteraction(category: string, action: string) {
    // Aquí puedes integrar con Google Analytics o otro servicio
    console.log(`Category ${category} - ${action}`);
    
    // Ejemplo de implementación para Google Analytics:
    // if (typeof gtag !== 'undefined') {
    //   gtag('event', action, {
    //     'event_category': 'Category Navigation',
    //     'event_label': category
    //   });
    // }
  }
}