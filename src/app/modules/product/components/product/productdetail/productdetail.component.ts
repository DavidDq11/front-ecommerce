import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../model';
import { CartService } from 'src/app/core/services/cart.service';

@Component({
  selector: 'app-productdetail',
  templateUrl: './productdetail.component.html',
  styleUrls: ['./productdetail.component.scss']
})
export class ProductdetailComponent implements OnInit {
  isLoading = false;
  selectedSize?: string;
  selectedSizeObj?: { size_id: number; size: string; price: number; stock_quantity: number; image_url?: string }; // Nueva propiedad
  category!: string;
  cart: Product[] = [];
  relatedProductList: Product[] = [];
  ratingList: boolean[] = [true, true, true, true, true]; // Valor por defecto: 5 estrellas llenas
  images: { image_id: number; image_url: string }[] = [];
  imageSrc?: { image_id: number; image_url: string };
  selectedImage?: number;
  discount?: number;
  title: string = '';
  currentPage = 1;
  totalPages = 1;
  pageSize = 5;
  product!: Product;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.cart = this.cartService.getCart();
    this.cartService.cartUpdated.subscribe((cart) => {
      this.cart = cart;
    });
    this.route.params.subscribe(() => {
      this.getProduct();
      this.scrollToTop();
    });
  }

  getProduct() {
    this.isLoading = true;
    const id = this.route.snapshot.params['id'];
    this.productService.getProduct(id).subscribe(
      (data: Product) => {
        this.isLoading = false;
        if (!data || Object.keys(data).length === 0) {
          console.warn('No product recibido para ID:', id);
          return;
        }
        this.product = data;
        this.images = this.transformImages(data.images || []);
        this.imageSrc = this.images.length > 0 ? this.images[0] : { image_id: 1, image_url: 'assets/placeholder.jpg' };
        // Asignar tamaño predeterminado si existe
        if (data.sizes && data.sizes.length > 0) {
          this.selectedSize = data.sizes[0].size;
          this.selectedSizeObj = data.sizes[0];
          this.product.price = data.sizes[0].price; // Actualizar precio inicial
          this.product.size = data.sizes[0].size; // Asignar tamaño predeterminado
          this.product.size_id = data.sizes[0].size_id; // Asignar size_id predeterminado
        } else {
          this.selectedSize = undefined;
          this.selectedSizeObj = undefined;
        }
        this.category = data.category;
        this.title = data.title;
        this.calculateDiscount();
        this.getRatingStar();
        this.relatedProducts();
      },
      (error) => {
        this.isLoading = false;
        console.error('Error al cargar producto:', error);
      }
    );
  }

  private transformImages(images: any[]): { image_id: number; image_url: string }[] {
    if (!images || !Array.isArray(images)) return [];
    if (typeof images[0] === 'string') {
      return images.map((url, index) => ({
        image_id: index + 1,
        image_url: url as string
      }));
    }
    return images as { image_id: number; image_url: string }[];
  }

  calculateDiscount() {
    const currentPrice = this.selectedSizeObj?.price || this.product.price;
    if (this.product.prevprice && this.product.prevprice > 0) {
      this.discount = Math.round(100 - (currentPrice / this.product.prevprice) * 100);
    } else {
      this.discount = undefined;
    }
  }

  scrollToTop() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        window.scrollTo(0, 0);
      }
    });
  }

  getRatingStar() {
    if (!this.product.rating || !this.product.rating.rate) {
      this.ratingList = [true, true, true, true, true];
    } else {
      this.ratingList = this.productService.getRatingStar(this.product);
    }
  }

  addToCart(product: Product) {
    let productToAdd: Product;

    if (product.sizes && product.sizes.length > 0) {
      if (!this.selectedSize || !this.selectedSizeObj) {
        alert('Por favor, selecciona un tamaño antes de agregar al carrito.');
        return;
      }
      productToAdd = {
        ...product,
        size: this.selectedSizeObj.size,
        size_id: this.selectedSizeObj.size_id, // Asignar el size_id
        price: this.selectedSizeObj.price, // Usar el precio del tamaño seleccionado
        qty: 1,
        totalprice: this.selectedSizeObj.price
      };
    } else {
      // Manejar productos sin tamaños
      productToAdd = {
        ...product,
        size: undefined,
        size_id: undefined,
        qty: 1,
        totalprice: product.price
      };
    }

    console.log('Producto agregado al carrito:', productToAdd); // Log para depuración
    this.cartService.addToCart(productToAdd);
  }

  removeFromCart(product: Product) {
    this.cartService.remove(product);
  }

  isProductInCart(product: Product) {
    return this.cart.some(item => item.id === product.id && item.size === this.selectedSize);
  }

  relatedProducts() {
    this.isLoading = true;
    const offset = (this.currentPage - 1) * this.pageSize;
    this.productService.getRelated(this.product.category, this.pageSize, offset).subscribe(
      (data) => {
        this.isLoading = false;
        this.relatedProductList = data.products.filter((item: Product) => 
          (item.category === this.product.category) && item.id !== this.product.id
        );
        this.totalPages = Math.ceil(this.relatedProductList.length / this.pageSize) || 1;
      },
      (error) => {
        this.isLoading = false;
        console.error('Error al cargar productos relacionados:', error);
      }
    );
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.relatedProducts();
    }
  }

  addSize(size: { size_id: number; size: string; price: number; stock_quantity: number; image_url?: string }) {
    this.selectedSize = size.size;
    this.selectedSizeObj = size;
    this.product.size = size.size;
    this.product.size_id = size.size_id; // Actualizar size_id
    this.product.price = size.price; // Actualizar el precio del producto
    this.calculateDiscount(); // Recalcular el descuento
  }

  onImage(image: { image_id: number; image_url: string }, index: number) {
    this.imageSrc = image;
    this.selectedImage = index;
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/placeholder.jpg';
  }

  isInStock(): boolean {
    if (this.selectedSizeObj) {
      return this.selectedSizeObj.stock_quantity > 0;
    }
    return this.product.stock === 'In stock';
  }
}