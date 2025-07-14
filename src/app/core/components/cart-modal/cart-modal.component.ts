import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CartService } from 'src/app/core/services/cart.service';
import { Product } from 'src/app/modules/product/model';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { AuthService } from 'src/app/shared/services/auth/auth.service';

@Component({
  selector: 'app-cart-modal',
  templateUrl: './cart-modal.component.html',
  styleUrls: ['./cart-modal.component.scss'],
})
export class CartModalComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  cart: Product[] = [];
  total = 0;
  shippingCost = 6000;
  estimatedTotal = 0;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private cartService: CartService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.subscriptions.add(
      this.cartService.cartUpdated.subscribe((cart) => {
        this.cart = cart;
        this.updateTotals();
      })
    );
    this.subscriptions.add(
      this.cartService.getTotalAmount().subscribe((total) => {
        this.total = Number(total.toFixed(2));
        this.updateTotals();
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private updateTotals() {
    this.estimatedTotal = Number((this.total + this.shippingCost).toFixed(2));
  }

  closeModal(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }

  addQty(product: Product) {
    const currentQty = product.qty ?? 1;
    this.cartService.updateQuantity(product, currentQty + 1);
  }

  lessQty(product: Product) {
    const currentQty = product.qty ?? 1;
    if (currentQty > 1) {
      this.cartService.updateQuantity(product, currentQty - 1);
    } else {
      this.cartService.remove(product);
    }
  }

  removeFromCart(product: Product) {
    this.cartService.remove(product);
  }

  goToCheckout() {
    if (this.cart.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Carrito Vacío',
        text: 'Tu carrito está vacío. Añade productos antes de continuar.',
        confirmButtonColor: '#1e3a8a',
        confirmButtonText: 'Aceptar',
        target: document.body, // Forzar que el modal se añada al body
        backdrop: true // Asegurar que el backdrop cubra toda la pantalla
      });
      return;
    }

    const isAuthenticated = this.authService.isAuthenticated();
    if (isAuthenticated) {
      this.router.navigate(['/checkout'], {
        state: { isGuest: false },
        queryParams: { isGuest: 'false' }
      });
      this.close.emit();
    } else {
      this.close.emit(); // Cerrar el modal del carrito
      Swal.fire({
        title: '¿Cómo deseas continuar?',
        text: 'Puedes realizar tu pedido como invitado o iniciar sesión/registrarte para disfrutar de beneficios adicionales.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#1e3a8a',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Continuar como invitado',
        cancelButtonText: 'Iniciar sesión',
        showDenyButton: true,
        denyButtonText: 'Registrarse',
        denyButtonColor: '#1e3a8a',
        target: document.body, // Forzar que el modal se añada al body
        backdrop: true // Asegurar que el backdrop cubra toda la pantalla
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: '¡Regístrate y disfruta de más beneficios!',
            text: 'Al registrarte, podrás hacer seguimiento de tus pedidos, acceder a descuentos exclusivos, guardar tu historial de compras y recibir ofertas personalizadas.',
            icon: 'info',
            confirmButtonColor: '#1e3a8a',
            confirmButtonText: 'Continuar como invitado',
            showCancelButton: true,
            cancelButtonColor: '#6b7280',
            cancelButtonText: 'Registrarse ahora',
            target: document.body, // Forzar que el modal se añada al body
            backdrop: true // Asegurar que el backdrop cubra toda la pantalla
          }).then((guestResult) => {
            if (guestResult.isConfirmed) {
              this.router.navigate(['/checkout'], {
                state: { isGuest: true },
                queryParams: { isGuest: 'true' }
              });
            } else if (guestResult.isDismissed) {
              this.router.navigate(['/register'], {
                queryParams: { returnUrl: '/checkout' }
              });
            }
          });
        } else if (result.isDismissed) {
          this.router.navigate(['/login'], {
            queryParams: { returnUrl: '/checkout' }
          });
        } else if (result.isDenied) {
          this.router.navigate(['/register'], {
            queryParams: { returnUrl: '/checkout' }
          });
        }
      });
    }
  }
}