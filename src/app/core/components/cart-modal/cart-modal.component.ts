import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CartService } from 'src/app/core/services/cart.service';
import { Product } from 'src/app/modules/product/model';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';

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
  gstAmount = 0;
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
      })
    );
    this.subscriptions.add(
      this.cartService.getTotalAmount().subscribe((total) => {
        this.total = Number(total.toFixed(2));
      })
    );
    this.subscriptions.add(
      this.cartService.getGstAmount().subscribe((gst) => {
        this.gstAmount = Number(gst.toFixed(2));
      })
    );
    this.subscriptions.add(
      this.cartService.getEstimatedTotal().subscribe((estimated) => {
        this.estimatedTotal = Number(estimated.toFixed(2));
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
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
    const isGuest = !this.authService.isAuthenticated();
    console.log('Navigating to checkout with isGuest:', isGuest); // Añadir log para depuración
    this.router.navigate(['/checkout'], { 
      state: { isGuest },
      queryParams: { isGuest: isGuest ? 'true' : 'false' } // Añadir isGuest como query param
    });
    this.close.emit();
  }
}