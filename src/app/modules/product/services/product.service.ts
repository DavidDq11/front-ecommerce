import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, throwError } from 'rxjs';
import { Product} from '../model';
import { RawBrand } from '../model/Brand.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private url = environment.baseAPIURL + 'product';
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
    // console.log('Parámetros recibidos en getByCategory:', params, 'category:', category);

    // Solo incluir parámetros válidos y excluir category si brand_id está presente
    for (const key in params) {
      if (params.hasOwnProperty(key) && params[key] !== undefined && params[key] !== null && params[key] !== '' && !(key === 'category' && params.brand_id)) {
        httpParams = httpParams.set(key, params[key].toString());
      }
    }

    // console.log('Parámetros enviados al backend:', httpParams.toString());

    if (params.brand_id) {
      return this.http.get<{ products: Product[], total: number, totalPages: number }>(
        `${this.url}s/${params.brand_id}`,
        { params: httpParams }
      ).pipe(
        map(response => {
          // console.log('Respuesta para brand_id:', response);
          return response;
        }),
        catchError(error => {
          console.error('Error en getByCategory (brand_id):', error);
          return throwError(() => new Error(error.message));
        })
      );
    }

    if (category && category !== '') {
      httpParams = httpParams.set('category', category);
    }

    return this.http.get<{ products: Product[], total: number, totalPages: number }>(
      this.url + 's',
      { params: httpParams }
    ).pipe(
      map(response => {
        // console.log('Respuesta para categoría:', response);
        return response;
      }),
      catchError(error => {
        console.error('Error en getByCategory (categoría):', error);
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
    return this.http.get<Product[]>(this.url + 's', {
      params: new HttpParams().set('q', query)
    });
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