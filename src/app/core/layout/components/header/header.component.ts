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
  activeDropdown: string | null = null;
  cart: any[] = [];
  isHeaderTopHidden = false;
  userName: string | null = null; // Nombre del usuario
  private userSubscription: Subscription = new Subscription();

  constructor(private cartService: CartService, public authService: AuthService) {}

  ngOnInit(): void {
    this.cart = this.cartService.getCart;
    this.checkUserStatus(); // Verificar estado del usuario al iniciar

    this.userSubscription = this.authService.user$.subscribe(user => {
      this.userName = user?.name || null; // Actualiza userName dinámicamente
    });

    this.checkUserStatus();
  }

  ngOnDestroy(): void {
    // Desuscribirse para evitar memory leaks
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  // Verificar si hay un usuario autenticado y obtener su nombre
  checkUserStatus() {
    if (this.authService.isLoggedIn()) {
      const user = this.authService.getUserData(); // Asume que tienes un método para obtener datos del usuario
      this.userName = user?.name || 'Usuario'; // Ajusta según la estructura de tu usuario
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

  toggleDropdown(category: string) {
    if (this.activeDropdown === category) {
      this.activeDropdown = null;
    } else {
      this.activeDropdown = category;
      this.showAccountMenu = false;
      if (window.innerWidth <= 765) {
        this.mobileMenuOpen = false;
      }
    }
  }

  logOut() {
    this.authService.logout();
    this.userName = null; // Resetear el nombre al cerrar sesión
    this.showAccountMenu = false; // Cerrar el menú al cerrar sesión
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