import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CartService } from 'src/app/core/services/cart.service';
import { Product } from 'src/app/modules/product/model';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cart-modal',
  templateUrl: './cart-modal.component.html',
  styleUrls: ['./cart-modal.component.scss']
})
export class CartModalComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  cart: Product[] = [];
  total = 0;
  gstAmount = 0;
  estimatedTotal = 0;
  private subscriptions: Subscription = new Subscription();

  constructor(private cartService: CartService, private router: Router) {}

  ngOnInit() {
    console.log('Inicializando CartModalComponent');
    this.subscriptions.add(
      this.cartService.cartUpdated.subscribe(cart => {
        this.cart = cart;
        console.log('Carrito actualizado en CartModal:', cart);
      })
    );

    this.subscriptions.add(
      this.cartService.getTotalAmount().subscribe(total => {
        this.total = Number(total.toFixed(2));
        console.log('Total actualizado:', this.total);
      })
    );

    this.subscriptions.add(
      this.cartService.getGstAmount().subscribe(gst => {
        this.gstAmount = Number(gst.toFixed(2));
        console.log('GST actualizado:', this.gstAmount);
      })
    );

    this.subscriptions.add(
      this.cartService.getEstimatedTotal().subscribe(estimated => {
        this.estimatedTotal = Number(estimated.toFixed(2));
        console.log('Estimated Total actualizado:', this.estimatedTotal);
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    console.log('CartModalComponent destruido');
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
    this.router.navigate(['/checkout']);
    this.close.emit();
  }
}