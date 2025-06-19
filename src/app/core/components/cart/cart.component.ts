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
  total!: number;
  gstAmount!: number;
  estimatedTotal!: number;
  gstRate = 0.19;
  shippingCost = 0;
  subsTotal!: Subscription;
  subsGST!: Subscription;
  subsEstimatedTotal!: Subscription;
  subsCart!: Subscription;

  constructor(private cartService: CartService, private router: Router) {}

  ngOnInit(): void {
    this.getCart();
    this.getTotal();
    this.subsCart = this.cartService.cartUpdated.subscribe(() => {
      this.cart = this.cartService.getCart;
    });
  }

  getCart() {
    this.cart = this.cartService.getCart;
  }

  getTotal() {
    this.total = this.cartService.getTotal();
    this.subsTotal = this.cartService.getTotalAmount().subscribe(data => this.total = parseInt(data.toFixed(2)));
    this.subsGST = this.cartService.getGstAmount().subscribe(data => this.gstAmount = parseInt(data.toFixed(2)));
    this.subsEstimatedTotal = this.cartService.getEstimatedTotal().subscribe(data => this.estimatedTotal = parseInt(data.toFixed(2)));
  }

  goToCheckout() {
    this.router.navigate(['/checkout']);
  }

  unsubscribeSubject() {
    this.subsTotal.unsubscribe();
    this.subsGST.unsubscribe();
    this.subsEstimatedTotal.unsubscribe();
    this.subsCart?.unsubscribe();
  }

  ngOnDestroy(): void {
    this.unsubscribeSubject();
  }
}