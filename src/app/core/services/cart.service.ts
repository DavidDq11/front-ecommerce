import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from 'src/app/modules/product/model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartSubject = new BehaviorSubject<Product[]>([]);
  public cartUpdated = this.cartSubject.asObservable();
  private totalAmountSubject = new BehaviorSubject<number>(0);
  public totalAmount = this.totalAmountSubject.asObservable();
  private gstAmountSubject = new BehaviorSubject<number>(0);
  public gstAmount = this.gstAmountSubject.asObservable();
  private estimatedTotalSubject = new BehaviorSubject<number>(0);
  public estimatedTotal = this.estimatedTotalSubject.asObservable();

  constructor() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const cart = JSON.parse(savedCart);
        this.cartSubject.next(cart);
        this.updateTotals();
        console.log('Carrito cargado desde localStorage:', cart);
      } catch (error) {
        console.error('Error al cargar carrito desde localStorage:', error);
      }
    }
  }

  get getCart(): Product[] {
    return this.cartSubject.getValue();
  }

  add(product: Product) {
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
    this.updateTotals();
    console.log('Carrito actualizado:', currentCart);
  }

  remove(product: Product) {
    console.log('Intentando eliminar producto:', product);
    const currentCart = this.cartSubject.getValue().filter(item => item.id !== product.id);
    this.cartSubject.next([...currentCart]);
    localStorage.setItem('cart', JSON.stringify(currentCart));
    this.updateTotals();
    console.log('Carrito actualizado tras eliminación:', currentCart);
  }

  addQty(product: Product) {
    console.log('Aumentando cantidad de:', product);
    const currentCart = this.cartSubject.getValue();
    const existingProduct = currentCart.find(item => item.id === product.id);
    if (existingProduct) {
      existingProduct.qty = (existingProduct.qty ?? 0) + 1;
      existingProduct.totalprice = existingProduct.price * existingProduct.qty;
      this.cartSubject.next([...currentCart]);
      localStorage.setItem('cart', JSON.stringify(currentCart));
      this.updateTotals();
      console.log('Carrito actualizado tras aumentar cantidad:', currentCart);
    }
  }

  lessQty(product: Product) {
    console.log('Reduciendo cantidad de:', product);
    const currentCart = this.cartSubject.getValue();
    const existingProduct = currentCart.find(item => item.id === product.id);
    if (existingProduct && (existingProduct.qty ?? 0) > 1) {
      existingProduct.qty = (existingProduct.qty ?? 0) - 1;
      existingProduct.totalprice = existingProduct.price * existingProduct.qty;
      this.cartSubject.next([...currentCart]);
      localStorage.setItem('cart', JSON.stringify(currentCart));
      this.updateTotals();
      console.log('Carrito actualizado tras reducir cantidad:', currentCart);
    } else if (existingProduct && (existingProduct.qty ?? 0) === 1) {
      this.remove(product);
    }
  }

  private updateTotals() {
    const subtotal = this.cartSubject.getValue().reduce((sum, item) => sum + (item.totalprice ?? item.price * (item.qty ?? 0)), 0);
    const gst = subtotal * 0.19;
    const estimatedTotal = subtotal + gst;

    this.totalAmountSubject.next(subtotal);
    this.gstAmountSubject.next(gst);
    this.estimatedTotalSubject.next(estimatedTotal);
    console.log('Totales actualizados:', { subtotal, gst, estimatedTotal });
  }

  getTotal(): number {
    return this.cartSubject.getValue().reduce((sum, item) => sum + (item.totalprice ?? item.price * (item.qty ?? 0)), 0);
  }
}