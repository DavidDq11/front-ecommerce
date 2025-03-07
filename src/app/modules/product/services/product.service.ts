import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, throwError } from 'rxjs';
import { Product } from '../model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private url = environment.baseAPIURL + 'product'; // Base URL: /product
  products = new BehaviorSubject<Product[]>([]);
  ratingList: boolean[] = [];

  constructor(private http: HttpClient) {}

  // Obtener todos los productos sin filtros
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.url + 's').pipe( // /products
      map((data: Product[]) => {
        this.products.next(data);
        return data;
      }),
      catchError((error: any) => throwError(() => new Error(error.message)))
    );
  }

  // Filtrar productos por categoría
  getByCategory(category: string): Observable<Product[] | any> {
    return this.http.get(this.url + 's', { // /products?category={category}
      params: new HttpParams().set('category', category)
    });
  }

  // Filtrar productos por tipo (nuevo método)
  getByType(type: string, limit: number = 1000, offset: number = 0): Observable<{ products: Product[], total: number, page: number, totalPages: number }> {
    let params = new HttpParams()
      .set('type', type)
      .set('limit', limit.toString())
      .set('offset', offset.toString());
    
    return this.http.get<{ products: Product[], total: number, page: number, totalPages: number }>(this.url + 's', { params }).pipe(
      catchError((error: any) => throwError(() => new Error(error.message)))
    );
  }

  // Obtener productos relacionados por categoría (con paginación)
  getRelated(category: string, limit: number = 6, offset: number = 0): Observable<{ products: Product[], total: number, page: number, totalPages: number }> {
    let params = new HttpParams()
      .set('category', category)
      .set('limit', limit.toString())
      .set('offset', offset.toString());
    
    return this.http.get<{ products: Product[], total: number, page: number, totalPages: number }>(this.url + 's', { params }).pipe(
      catchError((error: any) => throwError(() => new Error(error.message)))
    );
  }

  // Obtener un producto por ID
  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.url}/${id}`); // /product/{id}
  }

  // Búsqueda de productos (sin implementación en el backend aún)
  search(query: string): Observable<Product[]> {
    return this.http.get<Product[]>(this.url + 's', { // /products?q={query}
      params: new HttpParams().set('q', query)
    });
  }

  // Generar lista de estrellas para la calificación
  getRatingStar(product: Product) {
    this.ratingList = [];
    [...Array(5)].map((_, index) => {
      return index + 1 <= Math.trunc(product?.rating.rate) ? this.ratingList.push(true) : this.ratingList.push(false);
    });
    return this.ratingList;
  }
}