import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { CartService } from 'src/app/core/services/cart.service';
import { AuthService } from 'src/app/shared/services/auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @ViewChild('carousel') carousel!: ElementRef;
  mobileMenuOpen = false;
  showAccountMenu = false;
  activeDropdown: string | null = null; // Controla qué menú está abierto
  cart: any[] = [];
  isHeaderTopHidden = false;
  userName: string | null = null;
  private userSubscription: Subscription = new Subscription();

  constructor(private cartService: CartService, public authService: AuthService) {}

  ngOnInit(): void {
    this.cart = this.cartService.getCart;
    this.checkUserStatus();
    this.userSubscription = this.authService.user$.subscribe(user => {
      this.userName = user?.name || null;
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
      this.activeDropdown = null;
    }
  }

  // Alternar el menú al hacer clic
  toggleDropdown(category: string) {
    if (this.activeDropdown === category) {
      this.activeDropdown = null; // Si ya está abierto, ciérralo
    } else {
      this.activeDropdown = category; // Abre el menú seleccionado
      this.showAccountMenu = false;
      if (window.innerWidth <= 768) {
        this.mobileMenuOpen = false;
      }
    }
  }

  // Manejar hover en escritorio
  onMouseEnter(category: string) {
    if (window.innerWidth > 768) { // Solo en escritorio
      if (this.activeDropdown !== null && this.activeDropdown !== category) {
        this.activeDropdown = null; // Desactiva el menú activo por clic
      }
      // Opcional: Activar el nuevo menú al pasar el mouse
      // this.activeDropdown = category;
    }
  }

  // Cerrar dropdown si se hace clic fuera
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.group') && !target.closest('.dropdown-menu')) {
      this.activeDropdown = null;
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
}