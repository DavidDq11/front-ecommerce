import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { Product } from 'src/app/modules/product/model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cart = new BehaviorSubject<Product[]>([]);
  cartUpdated = this.cart.asObservable();
  private readonly CART_KEY = 'cart';

  constructor() {
    this.loadCart();
  }

  private loadCart() {
    const savedCart = localStorage.getItem(this.CART_KEY);
    if (savedCart) {
      this.cart.next(JSON.parse(savedCart));
    }
  }

  private saveCart() {
    localStorage.setItem(this.CART_KEY, JSON.stringify(this.cart.value));
  }

  addToCart(product: Product) {
    const currentCart = this.cart.value;
    const existingProduct = currentCart.find(
      (item) => item.id === product.id && item.size === product.size
    );
    if (existingProduct) {
      existingProduct.qty = (existingProduct.qty ?? 1) + 1;
      existingProduct.totalprice = existingProduct.price * existingProduct.qty;
    } else {
      product.qty = 1;
      product.totalprice = product.price;
      currentCart.push(product);
    }
    this.cart.next([...currentCart]);
    this.saveCart();
  }

  updateQuantity(product: Product, qty: number) {
    const currentCart = this.cart.value;
    const existingProduct = currentCart.find(
      (item) => item.id === product.id && item.size === product.size
    );
    if (existingProduct) {
      existingProduct.qty = qty;
      existingProduct.totalprice = existingProduct.price * qty;
      this.cart.next([...currentCart]);
      this.saveCart();
    }
  }

  remove(product: Product) {
    const currentCart = this.cart.value.filter(
      (item) => !(item.id === product.id && item.size === product.size)
    );
    this.cart.next([...currentCart]);
    this.saveCart();
  }

  getCart() {
    return this.cart.value;
  }

  getTotalAmount() {
    return this.cartUpdated.pipe(
      map((cart) => cart.reduce((sum, item) => sum + (item.totalprice || 0), 0))
    );
  }

  getGstAmount() {
    return this.getTotalAmount().pipe(
      map((total) => total * 0.19) // Suponiendo IVA del 19%
    );
  }

  getEstimatedTotal() {
    return this.getTotalAmount().pipe(
      map((total) => total + total * 0.19)
    );
  }

  clearCart() {
    this.cart.next([]);
    this.saveCart();
  }
}