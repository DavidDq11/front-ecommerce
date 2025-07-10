import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { CartService } from 'src/app/core/services/cart.service';
import { AuthService } from 'src/app/shared/services/auth/auth.service';
import { Product } from 'src/app/modules/product/model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @ViewChild('carousel') carousel!: ElementRef;
  mobileMenuOpen = false;
  showAccountMenu = false;
  activeDropdown: string | null = null;
  cart: Product[] = [];
  isHeaderTopHidden = false; // Always false to keep header visible
  isHeaderFixedHidden = false; // Always false to keep header visible
  userName: string | null = null;
  isCartModalOpen = false;
  private userSubscription: Subscription = new Subscription();

  constructor(private cartService: CartService, public authService: AuthService) {}

  ngOnInit(): void {
    this.cart = this.cartService.getCart();
    this.checkUserStatus();
    this.userSubscription = this.authService.user$.subscribe(user => {
      this.userName = user?.name || null;
    });
    this.cartService.cartUpdated.subscribe(() => {
      this.cart = this.cartService.getCart();
      // console.log('Cart updated in Header:', this.cart);
    });
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }

  checkUserStatus() {
    if (this.authService.isLoggedIn()) {
      const user = this.authService.getUserData();
      this.userName = user?.name || 'Usuario';
    } else {
      this.userName = null;
    }
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    if (this.mobileMenuOpen) {
      this.activeDropdown = null;
    }
    if (!this.mobileMenuOpen) {
      this.showAccountMenu = false;
    }
  }

  toggleAccountMenu() {
    this.showAccountMenu = !this.showAccountMenu;
    if (this.showAccountMenu) {
      this.activeDropdown = null; // Cerrar dropdowns de categorías
      if (window.innerWidth <= 768) {
        this.mobileMenuOpen = true; // Mantener menú móvil abierto
      }
    } else if (window.innerWidth <= 768) {
      this.mobileMenuOpen = false; // Cerrar menú móvil al ocultar cuenta
    }
  }

  toggleDropdown(category: string, event?: Event) {
    if (event) {
      event.stopPropagation(); // Evitar propagación del evento
    }
    if (this.activeDropdown === category) {
      this.activeDropdown = null;
    } else {
      this.activeDropdown = category;
      this.showAccountMenu = false; // Cerrar menú de cuenta
      if (window.innerWidth <= 768 && this.mobileMenuOpen) {
        this.mobileMenuOpen = false; // Cerrar menú hamburguesa en móviles si está abierto
      }
    }
  }

  onMouseEnter(category: string) {
    if (window.innerWidth > 768) {
      if (this.activeDropdown !== null && this.activeDropdown !== category) {
        this.activeDropdown = null;
      }
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.group') && !target.closest('.dropdown-menu')) {
      this.activeDropdown = null;
    }
    if (!target.closest('.group') && !target.closest('.account-menu')) {
      this.showAccountMenu = false;
    }
  }

  logOut() {
    this.authService.logout();
    this.userName = null;
    this.showAccountMenu = false;
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
    // console.log('Opening cart modal');
    this.isCartModalOpen = true;
  }

  closeCartModal() {
    // console.log('Closing cart modal');
    this.isCartModalOpen = false;
  }
}