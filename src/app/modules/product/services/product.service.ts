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
  private rocketfyUrl = environment.baseAPIURL + 'rocketfy-products';
  products = new BehaviorSubject<Product[]>([]);
  ratingList: boolean[] = [];

  constructor(private http: HttpClient) {}

  // Obtener todos los productos sin filtros
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.url + 's').pipe(
      map((data: Product[]) => {
        // Ensure all products conform to the updated Product interface
        const normalizedData = data.map(product => ({
          ...product,
          id: typeof product.id === 'string' ? product.id : product.id.toString(), // Normalize ID to string if needed
          price: Number(product.price), // Ensure price is a number
          prevprice: product.prevprice ? Number(product.prevprice) : 0,
          rating: product.rating || { rate: 0, count: 0 },
          images: Array.isArray(product.images) ? product.images : [],
          stock: product.stock || 'In stock',
        }));
        this.products.next(normalizedData); // Update the BehaviorSubject
        return normalizedData;
      }),
      catchError((error: any) => throwError(() => new Error(error.message)))
    );
  }

  // En ProductService
  getRocketfyProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.rocketfyUrl).pipe(
      map((data: Product[]) => {
        console.log('Datos de Rocketfy desde /rocketfy-products:', data); // Verifica los datos crudos
        const normalizedData = data.map(product => ({
          ...product,
          id: typeof product.id === 'string' ? product.id : product.id.toString(),
          price: Number(product.price),
          prevprice: product.prevprice ? Number(product.prevprice) : 0,
          rating: product.rating || { rate: 0, count: 0 },
          images: Array.isArray(product.images) ? product.images : [],
          stock: product.stock || 'In stock',
        }));
        console.log('Productos normalizados de Rocketfy:', normalizedData); // Verifica después de normalizar
        this.products.next(normalizedData);
        return normalizedData;
      }),
      catchError((error: any) => {
        console.error('Error al obtener productos de Rocketfy:', error);
        return throwError(() => new Error(error.message));
      })
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