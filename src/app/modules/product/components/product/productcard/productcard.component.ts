import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Product } from '../../../model';
import { CartService } from 'src/app/core/services/cart.service';
import { ProductService } from '../../../services/product.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-productcard',
  templateUrl: './productcard.component.html',
  styleUrls: ['./productcard.component.scss'],
})
export class ProductcardComponent implements OnInit, OnDestroy {
  @Input() product!: Product;
  ratingList: boolean[] = [true, true, true, true, true]; // Valor por defecto: 5 estrellas llenas
  cart: Product[] = [];
  discount?: number;
  private subscription: Subscription = new Subscription();

  constructor(private cartService: CartService, private productService: ProductService) {}

  ngOnInit(): void {
    // console.log('Producto recibido en Productcard a las', new Date().toLocaleString(), ':', this.product);
    this.subscription.add(
      this.cartService.cartUpdated.subscribe(cart => {
        this.cart = cart;
        // console.log('Carrito actualizado en Productcard a las', new Date().toLocaleString(), ':', cart);
      })
    );
    this.calculateDiscount();
    this.getRatingStar();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  calculateDiscount() {
    if (this.product && this.product.prevprice && this.product.prevprice > 0) {
      this.discount = Math.round(100 - (this.product.price / this.product.prevprice) * 100);
    } else {
      this.discount = undefined;
    }
  }

  getRatingStar(): void {
    if (!this.product.rating || !this.product.rating.rate) {
      // Si no hay datos de calificación, mantener el valor por defecto (5 estrellas llenas)
      this.ratingList = [true, true, true, true, true];
      // console.log('Usando calificación por defecto (5 estrellas) para producto', this.product.id);
    } else {
      this.ratingList = this.productService.getRatingStar(this.product);
      // console.log('ratingList para producto', this.product.id, ':', this.ratingList);
    }
  }

  addToCart(product: Product) {
    // console.log('Agregando producto desde Productcard a las', new Date().toLocaleString(), ':', product);
    this.cartService.addToCart(product);
  }

  removeFromCart(product: Product) {
    // console.log('Eliminando producto desde Productcard a las', new Date().toLocaleString(), ':', product);
    this.cartService.remove(product);
  }

  isProductInCart(product: Product): boolean {
    return this.cartService.getCart().some((item: Product) => item.id === product.id);
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/placeholder.jpg';
    // console.log('Imagen no encontrada, usando placeholder a las', new Date().toLocaleString());
  }
}