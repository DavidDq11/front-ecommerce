import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/shared/services/auth/auth.service';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import Sweetalert2 from 'sweetalert2';
import { finalize } from 'rxjs';

interface Order {
  id: number;
  user_id: number | null;
  items: Array<{
    id: number;
    title: string;
    size?: string;
    totalprice: number;
    images?: Array<{ image_id: number; image_url: string }>;
    sizes?: Array<{ size_id: number; size: string; price: number; stock_quantity: number; image_url?: string }>;
  }>;
  shipping_address: any;
  billing_address: any | null;
  payment_method: string;
  total: number;
  created_at: string;
  status: string;
  order_number: string;
  transaction_id: string | null;
}

@Component({
  selector: 'app-admin-orders',
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.scss']
})
export class AdminOrdersComponent implements OnInit {
  orders: Order[] = [];
  selectedOrder: Order | null = null;
  apiUrl = environment.baseAPIURL;
  isLoading = false;

  constructor(private http: HttpClient, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (!this.authService.isAdmin()) {
      Sweetalert2.fire({
        title: 'Acceso Denegado',
        text: 'Error de permisos.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      }).then(() => {
        this.router.navigate(['/']);
      });
      return;
    }
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    const token = this.authService.getToken();
    if (!token) {
      Sweetalert2.fire({
        title: 'Error',
        text: 'No se encontró el token de autenticación.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      }).then(() => {
        this.router.navigate(['/login']);
      });
      return;
    }
    this.http.get<Order[]>(`${this.apiUrl}orders`, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (orders) => {
        this.orders = orders;
      },
      error: (error) => {
        Sweetalert2.fire({
          title: 'Error',
          text: 'No se pudieron cargar las órdenes: ' + error.message,
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }

  updateOrderStatus(order: Order, status: string): void {
    const token = this.authService.getToken();
    if (!token) {
      Sweetalert2.fire({
        title: 'Error',
        text: 'No se encontró el token de autenticación.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      }).then(() => {
        this.router.navigate(['/login']);
      });
      return;
    }
    this.http.put(`${this.apiUrl}orders/${order.order_number}/status`, { status }, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => {
        Sweetalert2.fire({
          title: 'Éxito',
          text: `Estado de la orden ${order.order_number} actualizado a ${status}`,
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
        order.status = status;
        if (this.selectedOrder && this.selectedOrder.order_number === order.order_number) {
          this.selectedOrder.status = status;
        }
      },
      error: (error) => {
        Sweetalert2.fire({
          title: 'Error',
          text: 'No se pudo actualizar el estado: ' + error.message,
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }

  viewOrderDetails(order: Order): void {
    this.isLoading = true;
    const token = this.authService.getToken();
    if (!token) {
      Sweetalert2.fire({
        title: 'Error',
        text: 'No se encontró el token de autenticación.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      }).then(() => {
        this.router.navigate(['/login']);
      });
      return;
    }
    this.http.get<Order>(`${this.apiUrl}orders/${order.order_number}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (detailedOrder) => {
        this.selectedOrder = detailedOrder;
      },
      error: (error) => {
        Sweetalert2.fire({
          title: 'Error',
          text: 'No se pudieron cargar los detalles de la orden: ' + error.message,
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }

  closeOrderDetails(): void {
    this.selectedOrder = null;
  }
}