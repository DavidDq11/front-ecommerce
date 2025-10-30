import { Component, OnInit, HostListener, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CartService } from 'src/app/core/services/cart.service';
import { AuthService } from 'src/app/shared/services/auth/auth.service';
import { Product } from 'src/app/modules/product/model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, AfterViewInit, OnDestroy {
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
  private userSubscription: Subscription = new Subscription();

  // Variables para la barra indicadora de scroll
  scrollPercentage = 0;
  scrollLeftPercentage = 0;

  constructor(
    private cartService: CartService,
    public authService: AuthService
  ) {}

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
  }

  ngAfterViewInit(): void {
    // Inicializar barra indicadora
    setTimeout(() => this.onMenuScroll(), 100);
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
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

  // === SCROLL DEL MENÚ DE CATEGORÍAS ===
  onMenuScroll() {
    if (!this.categoryMenu) return;

    const menu = this.categoryMenu.nativeElement;
    const maxScroll = menu.scrollWidth - menu.clientWidth;

    if (maxScroll > 0) {
      const scrollLeft = menu.scrollLeft;
      const percentage = (scrollLeft / maxScroll) * 100;
      this.scrollPercentage = (menu.clientWidth / menu.scrollWidth) * 100;
      this.scrollLeftPercentage = percentage * (1 - this.scrollPercentage / 100);
    } else {
      this.scrollPercentage = 100;
      this.scrollLeftPercentage = 0;
    }
  }

  // === TOGGLE MENÚS ===
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
      // Desktop: pin al hacer click
      if (this.pinnedDropdown === category) {
        this.pinnedDropdown = null;
        this.activeDropdown = null;
      } else {
        this.pinnedDropdown = category;
        this.activeDropdown = category;
        this.showAccountMenu = false;
      }
    } else {
      // Móvil/Tablet: toggle simple
      if (this.activeDropdown === category) {
        this.activeDropdown = null;
      } else {
        this.activeDropdown = category;
        this.showAccountMenu = false;
      }
      setTimeout(() => {
        this.positionDropdown(category);
      }, 10);
    }
  }

  private positionDropdown(category: string) {
    if (window.innerWidth > 1024) return;

    const dropdownMenu = document.querySelector('.dropdown-menu.show') as HTMLElement;
    if (!dropdownMenu) return;

    const navHeight = document.querySelector('nav')?.offsetHeight || 0;
    const headerHeight = document.querySelector('header')?.offsetHeight || 0;
    const topOffset = navHeight + headerHeight + 60;

    if (window.innerWidth <= 768) {
      // Móvil
      const screenWidth = window.innerWidth;
      const dropdownWidth = Math.min(300, screenWidth - 20);
      const leftPosition = (screenWidth - dropdownWidth) / 2;

      dropdownMenu.style.position = 'fixed';
      dropdownMenu.style.top = `${topOffset}px`;
      dropdownMenu.style.left = `${Math.max(10, leftPosition)}px`;
      dropdownMenu.style.width = `${dropdownWidth}px`;
      dropdownMenu.style.maxWidth = '300px';
      dropdownMenu.style.zIndex = '25000';
    } else {
      // Tablet
      const screenWidth = window.innerWidth;
      const dropdownWidth = Math.min(400, screenWidth - 40);
      const leftPosition = (screenWidth - dropdownWidth) / 2;

      dropdownMenu.style.position = 'fixed';
      dropdownMenu.style.top = `${topOffset}px`;
      dropdownMenu.style.left = `${Math.max(20, leftPosition)}px`;
      dropdownMenu.style.width = `${dropdownWidth}px`;
      dropdownMenu.style.maxWidth = '400px';
      dropdownMenu.style.zIndex = '24000';
    }
  }

  // === HOVER (solo desktop) ===
  onMouseEnter(category: string) {
    if (window.innerWidth > 1024 && !this.pinnedDropdown) {
      this.activeDropdown = category;
      this.showAccountMenu = false;
    }
  }

  onMouseLeave() {
    if (window.innerWidth > 1024 && !this.pinnedDropdown) {
      this.activeDropdown = null;
    }
  }

  // === CIERRE CON CLICK/TAP FUERA ===
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;

    // Cerrar dropdowns
    if (!target.closest('.group') && !target.closest('.dropdown-menu') && !target.closest('.suggestions-list')) {
      if (window.innerWidth > 1024) {
        this.activeDropdown = null;
        this.pinnedDropdown = null;
      } else {
        this.activeDropdown = null;
      }
    }

    // Cerrar menú de cuenta
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

  // === RESIZE Y SCROLL ===
  @HostListener('window:resize')
  onWindowResize() {
    this.activeDropdown = null;
    this.pinnedDropdown = null;
    this.showAccountMenu = false;

    if (this.activeDropdown) {
      setTimeout(() => this.positionDropdown(this.activeDropdown!), 100);
    }

    setTimeout(() => this.onMenuScroll(), 100);
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    if (window.innerWidth <= 1024 && this.activeDropdown) {
      this.activeDropdown = null;
      this.pinnedDropdown = null;
    }
  }

  // === CARRITO ===
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

  // === CARRUSEL (si lo usas) ===
  scrollCarousel(direction: 'left' | 'right') {
    if (!this.carousel) return;
    const carouselEl = this.carousel.nativeElement;
    const scrollAmount = 150;
    if (direction === 'left') {
      carouselEl.scrollLeft -= scrollAmount;
    } else {
      carouselEl.scrollLeft += scrollAmount;
    }
  }

  // === LOGOUT ===
  logOut() {
    this.authService.logout();
    this.userName = null;
    this.isAdmin = false;
    this.showAccountMenu = false;
    this.mobileMenuOpen = false;
    this.activeDropdown = null;
    this.pinnedDropdown = null;
  }
}