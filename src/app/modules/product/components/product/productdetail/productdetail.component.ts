import { Component,OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../model';
import { CartService } from 'src/app/core/services/cart.service';

@Component({
  selector: 'app-productdetail',
  templateUrl: './productdetail.component.html',
  styles: [
  ]
})
export class ProductdetailComponent implements OnInit{
  isLoading=false;
  selectedSize!:string;
  category!:string;
  cart:Product[]=[];
  relatedProductList:Product[]=[];
  ratingList:boolean[]=[];
  images!:string[];
  product!:Product;
  imageSrc!:string;
  selectedImage!:number;
  discount=0;
  title:string='';
  currentPage = 1; // Current pagination page
  totalPages = 1; // Total number of pages
  pageSize = 5; // Products per page
  constructor(private route:ActivatedRoute, private productService:ProductService, private cartService:CartService, private router:Router){}

  ngOnInit(): void {
    this.getProduct();
    this.cart=this.cartService.getCart;
    this.route.params.subscribe(()=>{
      this.getProduct();
      this.scrollToTop();
    })
  }

  getProduct() {
    this.isLoading = true;
    const id = this.route.snapshot.params['id'];
    console.log('ID recibido:', id); // Verifica que el ID sea correcto
    this.productService.getProduct(id).subscribe(
      (data: Product) => {
        this.isLoading = false;
        if (!data) {
          console.warn('No se recibió ningún producto para el ID:', id);
          return;
        }
        this.product = data;
        console.log('Producto cargado:', data); // Verifica los datos
        const { images } = this.product;
        this.images = images;
        this.imageSrc = images[0];
        this.category = data.category;
        this.title = data.title;
        this.discount = this.product && Math.round(100 - (this.product.price / this.product.prevprice) * 100);
        this.getRatingStar();
        this.relatedProducts();
      },
      (error) => {
        this.isLoading = false;
        console.error('Error al cargar el producto:', error); // Verifica errores
      }
    );
  }
  
  scrollToTop(){
    this.router.events.subscribe((event) => {
      if (!(event instanceof NavigationEnd)) {
          return;
      }
      window.scrollTo(0, 0)
    });
  }

  getRatingStar(){
    this.ratingList=this.productService.getRatingStar(this.product);
  }
  addToCart(product:Product){
    this.cartService.add(product);
  }
  removeFromCart(product:Product){
    this.cartService.remove(product);    
  }
  isProductInCart(product:Product){
    return this.cart.some(item=>item.id==product.id);
  }

  relatedProducts() {
    this.isLoading = true;
    const offset = (this.currentPage - 1) * this.pageSize;
    this.productService.getRelated(this.product.category, this.pageSize, offset).subscribe(
      (data) => {
        this.isLoading = false;
        this.relatedProductList = data.products.filter((item: Product) => item.id !== this.product.id);
        this.totalPages = data.totalPages;
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
      this.relatedProducts(); // Fetch products for the new page
    }
  }

  addSize(value:string,index:string){
    this.selectedSize=index;
    this.product.size=value;
  }
  onImage(value:string,index:number){
    this.imageSrc=value;
    this.selectedImage=index;
  }
  
}
