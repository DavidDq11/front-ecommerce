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

  constructor(private http: HttpClient) {
    // console.log('OrderService: Using baseAPIURL=', this.apiUrl); // Log para depuración
  }

  placeOrder(orderData: OrderData, isGuest: boolean): Observable<any> {
    const endpoint = isGuest ? `${this.apiUrl}guest-orders` : `${this.apiUrl}orders`;
    // console.log('OrderService: Placing order to', endpoint, 'with isGuest=', isGuest, 'data=', orderData);
    return this.http.post(endpoint, orderData).pipe(
      catchError(error => {
        console.error('OrderService: Error procesando order:', error);
        return throwError(() => error);
      })
    );
  }
}