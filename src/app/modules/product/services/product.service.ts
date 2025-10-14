import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, throwError } from 'rxjs';
import { Product } from '../model';
import { RawBrand } from '../model/Brand.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private url = environment.baseAPIURL + 'product';
  private searchUrl = environment.baseAPIURL + 'search';
  products = new BehaviorSubject<Product[]>([]);
  ratingList: boolean[] = [];

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.url + 's').pipe(
      map((data: Product[]) => {
        this.products.next(data);
        return data;
      }),
      catchError((error: any) => throwError(() => new Error(error.message)))
    );
  }

  getByCategory(category: string, params: any = {}): Observable<{ products: Product[], total: number, totalPages: number }> {
    let httpParams = new HttpParams();
    const categoryMapping: { [key: string]: { category?: string, type?: string } } = {
      'alimento': { type: 'Alimentos' },
      'snacks': { category: 'Snacks' },
      'juguetes': { type: 'Juguete' },
      'jaulas': { category: 'Accesorios' },
      'cuidado': { category: 'Productos Veterinarios' }
    };
    for (const key in params) {
      if (params.hasOwnProperty(key) && params[key] !== undefined && params[key] !== null && params[key] !== '') {
        httpParams = httpParams.set(key, params[key].toString());
      }
    }
    if (category && category !== '') {
      const mapped = categoryMapping[category.toLowerCase()];
      if (mapped) {
        if (mapped.category) {
          httpParams = httpParams.set('category', mapped.category);
        } else if (mapped.type) {
          httpParams = httpParams.set('type', mapped.type);
        }
      } else {
        httpParams = httpParams.set('category', category);
      }
    }
    return this.http.get<{ products: Product[], total: number, totalPages: number }>(
      this.url + 's', // Siempre usa /products
      { params: httpParams }
    ).pipe(
      map(response => {
        return response;
      }),
      catchError(error => {
        console.error('Error en getByCategory:', error);
        return throwError(() => new Error(error.message));
      })
    );
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.url}/${id}`);
  }

  getRelated(category: string, limit: number = 6, offset: number = 0): Observable<{ products: Product[]; total: number; page: number; totalPages: number }> {
    const backendCategory = this.mapCategory(category);
    let params = new HttpParams()
      .set('category', backendCategory)
      .set('limit', limit.toString())
      .set('offset', offset.toString());
    
    return this.http.get<{ products: Product[]; total: number }>(this.url + 's', { params }).pipe(
      map(response => ({
        products: response.products,
        total: response.total,
        page: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(response.total / limit)
      })),
      catchError((error: any) => throwError(() => new Error(error.message)))
    );
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.url}/${id}`);
  }

  search(query: string): Observable<Product[]> {
    if (!query || query.trim() === '') {
      return of([]);
    }
    return this.http.get<Product[]>(this.searchUrl, {
      params: new HttpParams().set('q', query.trim())
    }).pipe(
      catchError(error => {
        console.error('Error en búsqueda:', error);
        return of([]);
      })
    );
  }

  getBrandName(brandId: number): Observable<string> {
    return this.http.get<RawBrand>(`${environment.baseAPIURL}brands/${brandId}`).pipe(
      map(brand => brand.name),
      catchError(error => {
        console.error('Error al obtener el nombre de la marca:', error);
        return of('Marca desconocida');
      })
    );
  }

  getRatingStar(product: Product): boolean[] {
    if (!product.rating || !product.rating.rate) {
      return [true, true, true, true, true]; // 5 estrellas llenas por defecto
    }
    const rating = Math.round(product.rating.rate);
    return Array(5).fill(false).map((_, index) => index < rating);
  }

  private mapCategory(category: string): string {
    const categoryMap = {
      'DryFood': 'Pet Food',
      'WetFood': 'Wet Food',
      'Snacks': 'Pet Treats',
      'Litter': 'Litter'
    };
    return categoryMap[category as keyof typeof categoryMap] || category;
  }
}