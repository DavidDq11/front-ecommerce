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
  category!: string;
  cart: Product[] = [];
  relatedProductList: Product[] = [];
  ratingList: boolean[] = [];
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
        console.log('Producto recibido del backend:', JSON.stringify(data, null, 2));
        if (!data || Object.keys(data).length === 0) {
          console.warn('No product received for ID:', id);
          return;
        }
        this.product = data;
        this.images = this.transformImages(data.images || []);
        this.imageSrc = this.images.length > 0 ? this.images[0] : { image_id: 1, image_url: 'assets/placeholder.jpg' };
        this.selectedSize = data.sizes && data.sizes.length > 0 ? data.sizes[0].size : undefined;
        this.category = data.category;
        this.title = data.title;
        this.calculateDiscount();
        this.getRatingStar();
        this.relatedProducts();
      },
      (error) => {
        this.isLoading = false;
        console.error('Error loading product:', error);
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
    if (this.product && this.product.prevprice && this.product.prevprice > 0) {
      this.discount = Math.round(100 - (this.product.price / this.product.prevprice) * 100);
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
    this.ratingList = this.productService.getRatingStar(this.product);
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product);
  }

  removeFromCart(product: Product) {
    this.cartService.remove(product);
  }

  isProductInCart(product: Product) {
    return this.cart.some(item => item.id === product.id);
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
        console.error('Error loading related products:', error);
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
    this.product.size = size.size;
  }

  onImage(image: { image_id: number; image_url: string }, index: number) {
    this.imageSrc = image;
    this.selectedImage = index;
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/placeholder.jpg';
  }

  isInStock(): boolean {
    return this.product.stock === 'In stock';
  }
}