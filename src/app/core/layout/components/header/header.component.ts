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
  pinnedDropdown: string | null = null; // Nueva variable para rastrear el menú fijado por clic
  cart: Product[] = [];
  isHeaderTopHidden = false;
  isHeaderFixedHidden = false;
  userName: string | null = null;
  isCartModalOpen = false;
  isAdmin: boolean = false;
  private userSubscription: Subscription = new Subscription();

  constructor(private cartService: CartService, public authService: AuthService) {}

  ngOnInit(): void {
    this.cart = this.cartService.getCart();
    this.checkUserStatus();
    this.userSubscription = this.authService.user$.subscribe(user => {
      this.userName = user?.name || null;
      this.isAdmin = user?.admin ?? false; // Usar ?? para manejar undefined
      this.showAccountMenu = false;
      if (!user) {
        this.mobileMenuOpen = false;
      }
    });
    this.cartService.cartUpdated.subscribe(() => {
      this.cart = this.cartService.getCart();
    });
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }

  checkUserStatus() {
    if (this.authService.isLoggedIn()) {
      const user = this.authService.getUserData();
      this.userName = user?.name || 'Usuario';
      this.isAdmin = user?.admin ?? false; // Usar ?? para manejar undefined
    } else {
      this.userName = null;
      this.isAdmin = false;
      this.showAccountMenu = false;
      this.mobileMenuOpen = false;
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
      this.pinnedDropdown = null; // Cerrar cualquier menú desplegable al abrir el menú de cuenta
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
      // En pantallas grandes: fijar el menú al hacer clic
      if (this.pinnedDropdown === category) {
        this.pinnedDropdown = null; // Desfijar si se hace clic en el mismo menú
        this.activeDropdown = null;
      } else {
        this.pinnedDropdown = category; // Fijar el nuevo menú
        this.activeDropdown = category;
        this.showAccountMenu = false;
      }
    } else {
      // En móviles y tablets: comportamiento existente
      if (this.activeDropdown === category) {
        this.activeDropdown = null;
      } else {
        this.activeDropdown = category;
        this.showAccountMenu = false;
      }
      // Posicionar el dropdown correctamente según el tamaño de pantalla
      setTimeout(() => {
        this.positionDropdown(category, event);
      }, 10);
    }
  }

  private positionDropdown(category: string, event?: Event) {
    if (window.innerWidth <= 1024) {
      const dropdownMenu = document.querySelector('.dropdown-menu.show') as HTMLElement;
      if (dropdownMenu) {
        if (window.innerWidth <= 768) {
          // Para móviles: posición fija centrada
          const navHeight = document.querySelector('nav')?.offsetHeight || 0;
          const headerHeight = document.querySelector('header')?.offsetHeight || 0;
          
          dropdownMenu.style.position = 'fixed';
          dropdownMenu.style.top = `${navHeight + headerHeight + 60}px`;
          dropdownMenu.style.left = '10px';
          dropdownMenu.style.right = 'auto';
          dropdownMenu.style.width = 'calc(100% - 20px)';
          dropdownMenu.style.maxWidth = '300px';
          dropdownMenu.style.margin = '0 auto';
          dropdownMenu.style.zIndex = '25000';
          
          // Centrar horizontalmente
          const screenWidth = window.innerWidth;
          const dropdownWidth = 300; // max-width
          const leftPosition = (screenWidth - dropdownWidth) / 2;
          dropdownMenu.style.left = `${Math.max(10, leftPosition)}px`;
          dropdownMenu.style.right = 'auto';
          dropdownMenu.style.width = `${Math.min(300, screenWidth - 20)}px`;
          
        } else {
          // Para tablets: posición fija mejorada
          const navHeight = document.querySelector('nav')?.offsetHeight || 0;
          const headerHeight = document.querySelector('header')?.offsetHeight || 0;
          
          dropdownMenu.style.position = 'fixed';
          dropdownMenu.style.top = `${navHeight + headerHeight + 60}px`;
          dropdownMenu.style.left = '20px';
          dropdownMenu.style.right = 'auto';
          dropdownMenu.style.width = 'calc(100% - 40px)';
          dropdownMenu.style.maxWidth = '400px';
          dropdownMenu.style.margin = '0 auto';
          dropdownMenu.style.zIndex = '24000';
          
          // Centrar horizontalmente para tablets
          const screenWidth = window.innerWidth;
          const dropdownWidth = 400; // max-width
          const leftPosition = (screenWidth - dropdownWidth) / 2;
          dropdownMenu.style.left = `${Math.max(20, leftPosition)}px`;
          dropdownMenu.style.right = 'auto';
          dropdownMenu.style.width = `${Math.min(400, screenWidth - 40)}px`;
        }
      }
    }
  }

  onMouseEnter(category: string) {
    if (window.innerWidth > 1024) {
      // En pantallas grandes: mostrar el menú solo si no hay un menú fijado
      if (!this.pinnedDropdown) {
        this.activeDropdown = category;
        this.showAccountMenu = false;
      }
    } else if (window.innerWidth > 768) {
      // En tablets: comportamiento existente
      this.activeDropdown = category;
      this.showAccountMenu = false;
    }
  }

  onMouseLeave() {
    if (window.innerWidth > 1024) {
      // En pantallas grandes: cerrar el menú solo si no está fijado
      if (!this.pinnedDropdown) {
        this.activeDropdown = null;
      }
    } else if (window.innerWidth > 768) {
      // En tablets: comportamiento existente
      this.activeDropdown = null;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    
    // Cerrar dropdowns si se hace clic fuera en pantallas grandes
    if (window.innerWidth > 1024) {
      if (!target.closest('.group') && !target.closest('.dropdown-menu')) {
        this.activeDropdown = null;
        this.pinnedDropdown = null; // Desfijar el menú al hacer clic fuera
      }
    } else {
      // Comportamiento existente para móviles y tablets
      if (!target.closest('.group') && !target.closest('.dropdown-menu')) {
        this.activeDropdown = null;
      }
    }
    
    // Cerrar menú de cuenta si se hace clic fuera
    if (!target.closest('.group') && !target.closest('.account-menu')) {
      this.showAccountMenu = false;
    }
  }

  @HostListener('document:touchstart', ['$event'])
  onTouchStart(event: Event) {
    const target = event.target as HTMLElement;
    
    // Cerrar dropdowns si se toca fuera
    if (!target.closest('.group') && !target.closest('.dropdown-menu')) {
      this.activeDropdown = null;
      this.pinnedDropdown = null; // Desfijar el menú al tocar fuera
    }
    
    // Cerrar menú de cuenta si se toca fuera
    if (!target.closest('.group') && !target.closest('.account-menu')) {
      this.showAccountMenu = false;
    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    // Cerrar todos los menús al cambiar el tamaño de ventana
    this.activeDropdown = null;
    this.pinnedDropdown = null; // Desfijar al cambiar el tamaño
    this.showAccountMenu = false;
    
    // Ajustar posición de dropdowns si están abiertos
    if (this.activeDropdown) {
      setTimeout(() => {
        this.positionDropdown(this.activeDropdown!);
      }, 100);
    }
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    // Cerrar dropdowns al hacer scroll en móviles/tablets
    if (window.innerWidth <= 1024 && this.activeDropdown) {
      this.activeDropdown = null;
      this.pinnedDropdown = null; // Desfijar al hacer scroll
    }
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
    this.isCartModalOpen = true;
    // Cerrar otros menús al abrir el carrito
    this.activeDropdown = null;
    this.pinnedDropdown = null; // Desfijar al abrir el carrito
    this.showAccountMenu = false;
  }

  closeCartModal() {
    this.isCartModalOpen = false;
  }
}