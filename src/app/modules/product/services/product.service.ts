import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, throwError } from 'rxjs';
import { Product } from '../model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl = environment.baseAPIURL;
  private productsUrl = this.baseUrl + 'products'; // Para listar productos
  products = new BehaviorSubject<Product[]>([]);
  ratingList: boolean[] = [];

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.productsUrl).pipe(
      map((data: Product[]) => {
        this.products.next(data);
        return data;
      }),
      catchError((error: any) => throwError(() => new Error(error.message)))
    );
  }

  getByCategory(category: string): Observable<Product[] | any> {
    return this.http.get(this.productsUrl, {
      params: new HttpParams().set('category', category)
    });
  }

  getRelated(type: string): Observable<Product[] | any> {
    return this.http.get(this.productsUrl, {
      params: new HttpParams().set('type', type)
    });
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(this.baseUrl + 'product/' + id); // Usa directamente /product/:id
  }

  search(query: string): Observable<Product[]> {
    return this.http.get<Product[]>(this.productsUrl, {
      params: new HttpParams().set('q', query)
    });
  }

  getRatingStar(product: Product) {
    this.ratingList = [];
    [...Array(5)].map((_, index) => {
      return index + 1 <= Math.trunc(product?.rating.rate) ? this.ratingList.push(true) : this.ratingList.push(false);
    });
    return this.ratingList;
  }
}