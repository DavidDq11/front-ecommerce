import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, throwError } from 'rxjs';
import { Product } from '../model';

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

  getByCategory(category: string, limit: number = 25, offset: number = 0): Observable<{ products: Product[]; total: number; totalPages: number }> {
    const categoryMap = {
      'DryFood': 'Pet Food',
      'WetFood': 'Wet Food',
      'Snacks': 'Pet Treats',
      'Litter': 'Litter'
    };
    const backendCategory = categoryMap[category as keyof typeof categoryMap] || category;
    let params = new HttpParams()
      .set('category', backendCategory)
      .set('limit', limit.toString())
      .set('offset', offset.toString());
    console.log('Requesting category:', backendCategory, 'with limit:', limit, 'offset:', offset); // Debug log
    return this.http.get<{ products: Product[]; total: number; totalPages: number }>(`${environment.baseAPIURL}products`, { params });
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

  getRatingStar(product: Product) {
    this.ratingList = [];
    [...Array(5)].map((_, index) => {
      return index + 1 <= Math.trunc(product?.rating.rate) ? this.ratingList.push(true) : this.ratingList.push(false);
    });
    return this.ratingList;
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