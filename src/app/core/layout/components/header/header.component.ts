import { Component, OnInit } from '@angular/core';
import { CartService } from 'src/app/core/services/cart.service';
import { Product } from 'src/app/modules/product/model';
import { MENU } from 'src/app/shared/constant';
import { AuthService } from 'src/app/shared/services/auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  mobileMenuOpen = false;
  showAccountMenu = false;
  activeDropdown: string | null = null;
  cart: any[] = [];

  constructor(private cartService: CartService, public authService: AuthService) {}

  logOut() {
    this.authService.logout();
  }

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
  }

  toggleDropdown(category: string) {
    this.activeDropdown = this.activeDropdown === category ? null : category;
  }
}