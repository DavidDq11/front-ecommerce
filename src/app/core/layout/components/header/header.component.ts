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
  cart: Product[] = [];
  menulist: { title: string; path: string }[] = MENU;
  showAccountMenu: boolean = false; 

  constructor(private cartService: CartService, public authService: AuthService) {}

  logOut() {
    this.authService.logout();
  }

  ngOnInit(): void {
    this.cart = this.cartService.getCart;
  }
  toggleAccountMenu(): void {
    this.showAccountMenu = !this.showAccountMenu;
  }
}