import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Product } from '../../../model';
import { CartService } from 'src/app/core/services/cart.service';
import { ProductService } from '../../../services/product.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-productcard',
  templateUrl: './productcard.component.html',
  styles: []
})
export class ProductcardComponent implements OnInit, OnDestroy {
  @Input() product!: Product;
  ratingList: boolean[] = [];
  cart: Product[] = [];
  discount?: number;
  private subscription: Subscription = new Subscription();

  constructor(private cartService: CartService, private productService: ProductService) {}

  ngOnInit(): void {
    // Suscribirse al carrito para mantenerlo actualizado
    this.subscription.add(
      this.cartService.cartUpdated.subscribe(cart => {
        this.cart = cart;
        console.log('Carrito actualizado en Productcard:', cart);
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

  addToCart(product: Product) {
    console.log('Agregando producto desde Productcard:', product);
    this.cartService.add(product);
  }

  removeFromCart(product: Product) {
    console.log('Eliminando producto desde Productcard:', product);
    this.cartService.remove(product);
  }

  isProductInCart(product: Product) {
    const inCart = this.cart.some(item => item.id === product.id);
    console.log(`¿Producto ${product.id} en carrito?`, inCart);
    return inCart;
  }

  getRatingStar() {
    this.ratingList = this.productService.getRatingStar(this.product);
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/placeholder.jpg';
  }
}