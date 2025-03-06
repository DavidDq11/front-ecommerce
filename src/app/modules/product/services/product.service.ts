import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, throwError } from 'rxjs';
import { Product } from '../model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private url = environment.baseAPIURL + 'product'; // Cambia 'products' por 'product'
  products = new BehaviorSubject<Product[]>([]);
  ratingList: boolean[] = [];

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.url + 's').pipe( // Añade 's' para obtener todos los productos desde /products
      map((data: Product[]) => {
        this.products.next(data); // Actualiza el BehaviorSubject con el array directamente
        return data;
      }),
      catchError((error: any) => throwError(() => new Error(error.message)))
    );
  }

  getByCategory(category: string): Observable<Product[] | any> {
    return this.http.get(this.url + 's', { // Añade 's' para /products con filtros
      params: new HttpParams().set('category', category)
    });
  }

  getRelated(category: string, limit: number = 6, offset: number = 0): Observable<{ products: Product[], total: number, page: number, totalPages: number }> {
    let params = new HttpParams()
      .set('category', category)
      .set('limit', limit.toString())
      .set('offset', offset.toString());
    
    return this.http.get<{ products: Product[], total: number, page: number, totalPages: number }>(this.url + 's', { params }).pipe(
      catchError((error: any) => throwError(() => new Error(error.message)))
    );
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.url}/${id}`); // Usa directamente el ID sin '/product/'
  }

  search(query: string): Observable<Product[]> {
    return this.http.get<Product[]>(this.url + 's', { // Añade 's' para /products con búsqueda
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