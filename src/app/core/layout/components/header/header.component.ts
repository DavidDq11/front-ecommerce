// src/app/header.component.ts
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
  isHeaderFixedHidden = false;
  userName: string | null = null;
  isCartModalOpen = false;
  private userSubscription: Subscription = new Subscription();
  private lastScrollTop = 0;
  private scrollThreshold = 50;

  constructor(private cartService: CartService, public authService: AuthService) {}

  ngOnInit(): void {
    this.cart = this.cartService.getCart;
    this.checkUserStatus();
    this.userSubscription = this.authService.user$.subscribe(user => {
      this.userName = user?.name || null;
    });
    this.cartService.cartUpdated.subscribe(() => {
      this.cart = this.cartService.getCart;
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

  toggleDropdown(category: string) {
    if (this.activeDropdown === category) {
      this.activeDropdown = null;
    } else {
      this.activeDropdown = category;
      this.showAccountMenu = false;
      if (window.innerWidth <= 768) {
        this.mobileMenuOpen = false;
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
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollDifference = Math.abs(currentScrollTop - this.lastScrollTop);

    if (scrollDifference >= this.scrollThreshold) {
      if (currentScrollTop <= 0) {
        this.isHeaderTopHidden = false;
        this.isHeaderFixedHidden = false;
      } else if (currentScrollTop > this.lastScrollTop) {
        this.isHeaderTopHidden = true;
        this.isHeaderFixedHidden = true;
      } else {
        this.isHeaderTopHidden = false;
        this.isHeaderFixedHidden = false;
      }
      this.lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
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

  // Methods for cart modal
  openCartModal() {
    this.isCartModalOpen = true;
  }

  closeCartModal() {
    this.isCartModalOpen = false;
  }
}