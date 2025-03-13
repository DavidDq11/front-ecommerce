import { Component, OnInit, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import { CartService } from 'src/app/core/services/cart.service';
import { AuthService } from 'src/app/shared/services/auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  mobileMenuOpen = false;
  showAccountMenu = false;
  showSearch = false;
  cart: any[] = [];
  userName: string | null = null;
  searchQuery: string = '';
  searchSuggestions: string[] = [];
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

  toggleMobileMenu(event: Event) {
    event.stopPropagation();
    this.mobileMenuOpen = !this.mobileMenuOpen;
    if (this.mobileMenuOpen) {
      this.showAccountMenu = false;
      this.showSearch = false;
    }
    console.log('Mobile menu toggled:', this.mobileMenuOpen);
  }

  toggleAccountMenu(event: Event) {
    event.stopPropagation();
    this.showAccountMenu = !this.showAccountMenu;
    if (this.mobileMenuOpen) {
    }
  }

  toggleSearch(event: Event) {
    event.stopPropagation();
    this.showSearch = !this.showSearch;
    if (this.showSearch) {
      this.mobileMenuOpen = false;
      this.showAccountMenu = false;
    }
    console.log('Search toggled:', this.showSearch);
  }

  onSearchInput(event: Event) {
    const input = (event.target as HTMLInputElement).value;
    this.searchQuery = input;
    if (input.length > 2) {
      this.searchSuggestions = [
        'Lámparas únicas de diseño',
        'Utensilios exclusivos de cocina',
        'Organizadores innovadores',
        'Dispositivos inteligentes únicos'
      ].filter(suggestion => suggestion.toLowerCase().includes(input.toLowerCase()));
    } else {
      this.searchSuggestions = [];
    }
  }

  trackCTAClick() {
    console.log('CTA clicked: ¡Explora lo Único – Compra Ahora!');
    // Aquí puedes integrar Google Analytics o cualquier herramienta de seguimiento
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.account-menu-container') && !target.closest('.account-menu')) {
      this.showAccountMenu = false;
    }
    if (!target.closest('.branding') && !target.closest('.mobile-menu')) {
      this.mobileMenuOpen = false;
    }
    if (!target.closest('.search-bar') && !target.closest('.search-suggestions')) {
      this.searchSuggestions = [];
      this.showSearch = false;
    }
  }

  logOut() {
    this.authService.logout();
    this.userName = null;
    this.showAccountMenu = false;
  }
}