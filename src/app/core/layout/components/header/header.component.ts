import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
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

  constructor(private cartService: CartService, public authService: AuthService) {}

  ngOnInit(): void {
    this.cart = this.cartService.getCart;
  }


  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    if (!this.mobileMenuOpen) {
      this.showAccountMenu = false;
      this.activeDropdown = null;
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
    }
  }

  logOut() {
    this.authService.logout();
  }

  scrollCarousel(direction: 'left' | 'right') {
    const carouselEl = this.carousel.nativeElement;
    const scrollAmount = 150; // Cantidad de píxeles a desplazar (ajusta según necesites)
    if (direction === 'left') {
      carouselEl.scrollLeft -= scrollAmount;
    } else {
      carouselEl.scrollLeft += scrollAmount;
    }
  }
}