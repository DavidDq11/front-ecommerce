import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Product } from 'src/app/modules/product/model';

export interface OrderData {
  user_id: number | null;
  items: { id: number; title: string; price: number; qty: number; totalprice: number }[];
  shipping_address: {
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  billing_address: {
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  } | null;
  payment_method: string;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = environment.baseAPIURL;

  constructor(private http: HttpClient) {}

  placeOrder(orderData: OrderData): Observable<any> {
    return this.http.post(`${this.apiUrl}orders`, orderData).pipe(
      catchError(error => {
        console.error('Error al procesar el pedido:', error);
        return throwError(() => error);
      })
    );
  }
}