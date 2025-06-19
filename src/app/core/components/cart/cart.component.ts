// src/app/core/components/cart/cart.component.ts
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
    /* hide scrollbar */
    ::-webkit-scrollbar {
      width: 0px;
    }
    ::-webkit-scrollbar-thumb {
      background: rgba(136, 136, 136, 0.281);
    }
    /* Handle on hover */
    ::-webkit-scrollbar-thumb:hover {
      background: #555;
    }
    `
  ]
})
export class CartComponent implements OnInit, OnDestroy {
  cart: Product[] | any = [];
  total!: number;
  gstAmount!: number;
  estimatedTotal!: number;
  gstRate = 0.19;
  shippingCost = 0;
  private subsTotal!: Subscription;
  private subsGST!: Subscription;
  private subsEstimatedTotal!: Subscription;
  private cartSubscription!: Subscription;

  constructor(private cartService: CartService, private router: Router) {}

  ngOnInit(): void {
    // Subscribe to cart updates to refresh the cart and totals
    this.cartSubscription = this.cartService.cartUpdated.subscribe(() => {
      this.cart = this.cartService.getCart;
      this.subsTotal = this.cartService.totalAmount.subscribe((data: number) => {
        this.total = parseInt(data.toFixed(2));
      });
      this.subsGST = this.cartService.gstAmount.subscribe((data: number) => {
        this.gstAmount = parseInt(data.toFixed(2));
      });
      this.subsEstimatedTotal = this.cartService.estimatedTotal.subscribe((data: number) => {
        this.estimatedTotal = parseInt(data.toFixed(2));
      });
    });

    // Initial load
    this.cart = this.cartService.getCart;
  }

  goToCheckout() {
    this.router.navigate(['/checkout']);
  }

  private unsubscribeSubjects() {
    this.subsTotal?.unsubscribe();
    this.subsGST?.unsubscribe();
    this.subsEstimatedTotal?.unsubscribe();
    this.cartSubscription?.unsubscribe();
  }

  ngOnDestroy(): void {
    this.unsubscribeSubjects();
  }
}