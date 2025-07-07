import { Component, OnDestroy, OnInit } from '@angular/core';
import { Product } from 'src/app/modules/product/model';
import { CartService } from '../../services/cart.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styles: [
    `
      ::-webkit-scrollbar {
        width: 0px;
      }
      ::-webkit-scrollbar-thumb {
        background: rgba(136, 136, 136, 0.281);
      }
      ::-webkit-scrollbar-thumb:hover {
        background: #555;
      }
    `
  ]
})
export class CartComponent implements OnInit, OnDestroy {
  cart: Product[] = [];
  total: number = 0;
  gstAmount: number = 0;
  estimatedTotal: number = 0;
  gstRate = 0.19;
  shippingCost = 0;
  private subsTotal!: Subscription;
  private subsGST!: Subscription;
  private subsEstimatedTotal!: Subscription;
  private subsCart!: Subscription;

  constructor(private cartService: CartService, private router: Router) {}

  ngOnInit() {
    this.cart = this.cartService.getCart();
    this.subsCart = this.cartService.cartUpdated.subscribe((cart) => {
      this.cart = cart;
    });
    this.subsTotal = this.cartService.getTotalAmount().subscribe((data) => {
      this.total = Number(data.toFixed(2));
    });
    this.subsGST = this.cartService.getGstAmount().subscribe((data) => {
      this.gstAmount = Number(data.toFixed(2));
    });
    this.subsEstimatedTotal = this.cartService.getEstimatedTotal().subscribe((data) => {
      this.estimatedTotal = Number(data.toFixed(2));
    });
  }

  goToCheckout() {
    this.router.navigate(['/checkout']);
  }

  ngOnDestroy(): void {
    this.subsTotal?.unsubscribe();
    this.subsGST?.unsubscribe();
    this.subsEstimatedTotal?.unsubscribe();
    this.subsCart?.unsubscribe();
  }
}