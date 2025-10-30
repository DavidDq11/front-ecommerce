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

  mobileMenuOpen = false;
  showAccountMenu = false;
  activeDropdown: string | null = null;
  pinnedDropdown: string | null = null;
  cart: Product[] = [];
  isHeaderTopHidden = false;
  isHeaderFixedHidden = false;
  userName: string | null = null;
  isCartModalOpen = false;
  isAdmin = false;
  private userSubscription = new Subscription();

  // Scroll indicator
  scrollPercentage = 100;
  scrollLeftPercentage = 0;

  

  updateScrollIndicator(menu: HTMLElement): void {
    const scrollLeft = menu.scrollLeft;
    const scrollWidth = menu.scrollWidth - menu.clientWidth;

    this.scrollPercentage = (menu.clientWidth / menu.scrollWidth) * 100;
    this.scrollLeftPercentage = (scrollLeft / scrollWidth) * (100 - this.scrollPercentage);
  }

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
      if (!user) this.mobileMenuOpen = false;
    });

    this.cartService.cartUpdated.subscribe(() => {
      this.cart = this.cartService.getCart();
    });
  }

  ngAfterViewInit(): void {
    const menu = this.categoryMenu.nativeElement;
    menu.addEventListener('scroll', () => this.updateScrollIndicator(menu));
    this.updateScrollIndicator(menu);
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }

  private setupMenuScroll() {
    if (!this.categoryMenu) return;
    const menu = this.categoryMenu.nativeElement;
    menu.addEventListener('scroll', () => this.onMenuScroll(), { passive: true });
    menu.style.setProperty('-webkit-overflow-scrolling', 'touch');
  }

  onMenuScroll() {
    if (!this.categoryMenu) return;
    const menu = this.categoryMenu.nativeElement;
    const maxScroll = menu.scrollWidth - menu.clientWidth;

    if (maxScroll <= 0) {
      this.scrollPercentage = 100;
      this.scrollLeftPercentage = 0;
      return;
    }

    const scrollLeft = menu.scrollLeft;
    const ratio = menu.clientWidth / menu.scrollWidth;
    const percentage = (scrollLeft / maxScroll) * 100;

    this.scrollPercentage = ratio * 100;
    this.scrollLeftPercentage = percentage * (1 - ratio);
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
      this.activeDropdown = this.activeDropdown === category ? null : category;
      this.showAccountMenu = false;
      setTimeout(() => this.positionDropdown(category), 10);
    }
  }

  private positionDropdown(category: string) {
    if (window.innerWidth > 1024) return;
    const dropdown = document.querySelector('.dropdown-menu.show') as HTMLElement;
    if (!dropdown) return;

    const nav = document.querySelector('nav') as HTMLElement;
    const header = document.querySelector('header') as HTMLElement;
    const navHeight = nav?.offsetHeight || 48;
    const headerHeight = header?.offsetHeight || 120;
    const topOffset = navHeight + headerHeight + 20;

    const screenWidth = window.innerWidth;
    const maxWidth = window.innerWidth <= 768 ? 300 : 400;
    const width = Math.min(maxWidth, screenWidth - 40);
    const left = (screenWidth - width) / 2;

    dropdown.style.position = 'fixed';
    dropdown.style.top = `${topOffset}px`;
    dropdown.style.left = `${Math.max(10, left)}px`;
    dropdown.style.width = `${width}px`;
    dropdown.style.maxWidth = `${maxWidth}px`;
    dropdown.style.zIndex = '25000';
  }

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

  @HostListener('document:click', ['$event'])
  @HostListener('document:touchstart', ['$event'])
  onGlobalClick(event: Event) {
    const target = event.target as HTMLElement;
    const inDropdown = target.closest('.dropdown-menu') || target.closest('.group');
    const inAccount = target.closest('.account-menu') || target.closest('[data-account]');

    if (!inDropdown) {
      if (window.innerWidth > 1024) {
        this.activeDropdown = null;
        this.pinnedDropdown = null;
      } else {
        this.activeDropdown = null;
      }
    }
    if (!inAccount) this.showAccountMenu = false;
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.activeDropdown = null;
    this.pinnedDropdown = null;
    this.showAccountMenu = false;
    setTimeout(() => this.onMenuScroll(), 100);
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    if (window.innerWidth <= 1024 && this.activeDropdown) {
      this.activeDropdown = null;
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

  logOut() {
    this.authService.logout();
    this.userName = null;
    this.isAdmin = false;
    this.showAccountMenu = false;
    this.mobileMenuOpen = false;
    this.activeDropdown = null;
    this.pinnedDropdown = null;
  }

  checkUserStatus() {
    if (this.authService.isLoggedIn()) {
      const user = this.authService.getUserData();
      this.userName = user?.name || 'Usuario';
      this.isAdmin = user?.admin ?? false;
    } else {
      this.userName = null;
      this.isAdmin = false;
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
    }
  }
  
}