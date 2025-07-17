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
  ratingList: boolean[] = [true, true, true, true, true];
  cart: Product[] = [];
  discount?: number;
  selectedSizeObj?: { size_id: number; size: string; price: number; stock_quantity: number; image_url?: string };
  private subscription: Subscription = new Subscription();

  constructor(private cartService: CartService, private productService: ProductService) {}

  ngOnInit(): void {
    this.cart = this.cartService.getCart();
    // Establecer un tamaño predeterminado si el producto tiene tamaños
    if (this.product.sizes && this.product.sizes.length > 0) {
      this.selectedSizeObj = this.product.sizes[0]; // Seleccionar el primer tamaño por defecto
      this.product.price = this.product.sizes[0].price;
      this.product.size = this.product.sizes[0].size;
      this.product.size_id = this.product.sizes[0].size_id;
    }
    this.subscription.add(
      this.cartService.cartUpdated.subscribe(cart => {
        this.cart = cart;
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
      this.ratingList = [true, true, true, true, true];
    } else {
      this.ratingList = this.productService.getRatingStar(this.product);
    }
  }

  selectSize(size: { size_id: number; size: string; price: number; stock_quantity: number; image_url?: string }) {
    this.selectedSizeObj = size;
    this.product.size = size.size;
    this.product.size_id = size.size_id;
    this.product.price = size.price;
    this.calculateDiscount();
  }

  addToCart(product: Product) {
    if (product.sizes && product.sizes.length > 0 && !this.selectedSizeObj) {
      alert('Por favor, selecciona un tamaño antes de agregar al carrito.');
      return;
    }
    const productToAdd: Product = {
      ...product,
      size: this.selectedSizeObj ? this.selectedSizeObj.size : undefined,
      size_id: this.selectedSizeObj ? this.selectedSizeObj.size_id : undefined,
      price: this.selectedSizeObj ? this.selectedSizeObj.price : product.price,
      qty: 1,
      totalprice: (this.selectedSizeObj ? this.selectedSizeObj.price : product.price) * 1
    };
    this.cartService.addToCart(productToAdd);
  }

  removeFromCart(product: Product) {
    this.cartService.remove(product);
  }

  isProductInCart(product: Product): boolean {
    return this.cartService.getCart().some((item: Product) => item.id === product.id && item.size === product.size);
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/placeholder.jpg';
  }
}