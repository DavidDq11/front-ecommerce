import { Component, Input, OnInit } from '@angular/core';
import { Product } from '../../../model';
import { CartService } from 'src/app/core/services/cart.service';
import { ProductService } from '../../../services/product.service';

@Component({
  selector: 'app-productcard',
  templateUrl: './productcard.component.html',
  styles: []
})
export class ProductcardComponent implements OnInit {
  @Input() product!: Product;
  ratingList: boolean[] = [];
  cart: Product[] = [];
  discount?: number;

  constructor(private cartService: CartService, private productService: ProductService) {}

  ngOnInit(): void {
    this.cart = this.cartService.getCart;
    this.calculateDiscount();
    this.getRatingStar();
  }

  calculateDiscount() {
    if (this.product && this.product.prevprice && this.product.prevprice > 0) {
      this.discount = Math.round(100 - (this.product.price / this.product.prevprice) * 100);
    } else {
      this.discount = undefined;
    }
  }

  addToCart(product: Product) {
    this.cartService.add(product);
  }

  removeFromCart(product: Product) {
    this.cartService.remove(product);
  }

  isProductInCart(product: Product) {
    return this.cart.some(item => item.id === product.id);
  }

  getRatingStar() {
    this.ratingList = this.productService.getRatingStar(this.product);
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/placeholder.jpg';
  }
}