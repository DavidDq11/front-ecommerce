import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from 'src/app/modules/product/model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartSubject = new BehaviorSubject<Product[]>([]);
  private totalAmount = new BehaviorSubject<number>(0);
  private gstAmount = new BehaviorSubject<number>(0);
  private estimatedTotal = new BehaviorSubject<number>(0);
  private gstRate: number = 0.19;
  cartUpdated: Observable<Product[]> = this.cartSubject.asObservable();
  totalAmount$: Observable<number> = this.totalAmount.asObservable();
  gstAmount$: Observable<number> = this.gstAmount.asObservable();
  estimatedTotal$: Observable<number> = this.estimatedTotal.asObservable();

  constructor() {
    this.loadCart();
  }

  private loadCart() {
    const cart = localStorage.getItem('cart');
    if (cart) {
      this.cartSubject.next(JSON.parse(cart));
      this.updateTotals();
    }
  }

  get getCart(): Product[] {
    return this.cartSubject.getValue();
  }

  getTotalAmount(): Observable<number> {
    return this.totalAmount$;
  }

  getGstAmount(): Observable<number> {
    return this.gstAmount$;
  }

  getEstimatedTotal(): Observable<number> {
    return this.estimatedTotal$;
  }

  add(product: Product) {
    console.log('Ejecutando método add en CartService');
    console.log('Intentando agregar producto:', JSON.stringify(product, null, 2));
    const currentCart = this.cartSubject.getValue();
    const existingProduct = currentCart.find(item => item.id === product.id);
    if (existingProduct) {
      existingProduct.qty = (existingProduct.qty ?? 0) + 1;
      existingProduct.totalprice = existingProduct.price * existingProduct.qty;
    } else {
      const normalizedImages = Array.isArray(product.images)
        ? product.images.map((img, i) => typeof img === 'string' ? { image_id: i + 1, image_url: img } : img)
        : [];
      const newProduct: Product = { ...product, qty: 1, totalprice: product.price, images: normalizedImages };
      currentCart.push(newProduct);
    }
    this.cartSubject.next([...currentCart]);
    localStorage.setItem('cart', JSON.stringify(currentCart));
    console.log('Carrito guardado en localStorage:', localStorage.getItem('cart'));
    this.updateTotals();
    console.log('Carrito actualizado:', currentCart);
  }

  remove(product: Product) {
    let currentCart = this.cartSubject.getValue();
    currentCart = currentCart.filter(item => item.id !== product.id);
    this.cartSubject.next([...currentCart]);
    localStorage.setItem('cart', JSON.stringify(currentCart));
    this.updateTotals();
  }

  updateQuantity(product: Product, quantity: number) {
    const currentCart = this.cartSubject.getValue();
    const existingProduct = currentCart.find(item => item.id === product.id);
    if (existingProduct) {
      existingProduct.qty = quantity;
      existingProduct.totalprice = existingProduct.price * quantity;
      this.cartSubject.next([...currentCart]);
      localStorage.setItem('cart', JSON.stringify(currentCart));
      this.updateTotals();
    }
  }

  clearCart() {
    this.cartSubject.next([]);
    localStorage.removeItem('cart');
    this.updateTotals();
  }

  getTotal(): number {
    return this.totalAmount.getValue();
  }

  private updateTotals() {
    const currentCart = this.cartSubject.getValue();
    const subtotal = currentCart.reduce((sum, item) => sum + (item.totalprice ?? 0), 0);
    const gst = subtotal * this.gstRate;
    this.totalAmount.next(subtotal);
    this.gstAmount.next(gst);
    this.estimatedTotal.next(subtotal + gst);
  }
}