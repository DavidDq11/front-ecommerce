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
  shipping_address: {
    deliveryOption: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    mobile?: string;
    addressType?: string;
    address?: string;
    addressNumber?: string;
    aptoPisoCasa?: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
    deliveryDate: string;
  };
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
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 1;

  private paymentMethodLabels: { [key: string]: string } = {
    credit_card: 'PSE',
    Nequi: 'Nequi',
    cash_on_delivery: 'Contraentrega',
  };

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

  loadOrders(page: number = 1): void {
    this.isLoading = true;
    this.currentPage = page;
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

    const offset = (this.currentPage - 1) * this.pageSize;
    const params = { limit: this.pageSize, offset };

    this.http.get<{ orders: Order[], total: number, totalPages: number }>(`${this.apiUrl}orders`, {
      headers: { Authorization: `Bearer ${token}` },
      params
    }).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (response) => {
        this.orders = response.orders;
        this.totalItems = response.total;
        this.totalPages = response.totalPages;
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
        // Actualizar el estado en el objeto de la orden
        order.status = status;
        // Actualizar el estado en la lista de órdenes
        const orderIndex = this.orders.findIndex(o => o.order_number === order.order_number);
        if (orderIndex !== -1) {
          this.orders[orderIndex].status = status;
        }
        // Actualizar el estado en selectedOrder si está en la vista de detalles
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

  getFullShippingAddress(shippingAddress: Order['shipping_address']): string {
    if (shippingAddress.deliveryOption === 'store') {
      return 'Recoger en tienda: Calle 23 #45-67, Manizales, Caldas';
    }
    const parts = [
      shippingAddress.addressType,
      shippingAddress.address,
      shippingAddress.addressNumber ? `#${shippingAddress.addressNumber}` : '',
      shippingAddress.aptoPisoCasa ? `, ${shippingAddress.aptoPisoCasa}` : '',
      shippingAddress.city,
      shippingAddress.state,
      shippingAddress.country,
      shippingAddress.postalCode ? `, ${shippingAddress.postalCode}` : '',
    ].filter(part => part);
    return parts.join(' ');
  }

  getPaymentMethodLabel(paymentMethod: string): string {
    return this.paymentMethodLabels[paymentMethod] || paymentMethod;
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.loadOrders(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.loadOrders(this.currentPage + 1);
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.loadOrders(page);
    }
  }

  goToFirstPage(): void {
    if (this.currentPage !== 1) {
      this.loadOrders(1);
    }
  }

  goToLastPage(): void {
    if (this.currentPage !== this.totalPages) {
      this.loadOrders(this.totalPages);
    }
  }

  getPageNumbers(): number[] {
    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }
}