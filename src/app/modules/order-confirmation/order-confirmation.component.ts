import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

interface Order {
  order_number: string;
  status: string;
  total: number;
  created_at: string;
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
  payment_method: string;
}

@Component({
  selector: 'app-order-confirmation',
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.scss'],
})
export class OrderConfirmationComponent implements OnInit {
  order: Order | null = null;
  displayOrder: Order | null = null;
  orderNumber: string | null = null;
  isGuest: boolean = true;

  // Mapeo de métodos de pago a etiquetas legibles
  private paymentMethodLabels: { [key: string]: string } = {
    credit_card: 'PSE',
    Nequi: 'Nequi',
    cash_on_delivery: 'Contraentrega',
  };

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    const state = history.state;
    this.orderNumber = state.orderNumber;
    this.isGuest = state.isGuest ?? true;
    console.log('OrderConfirmationComponent: orderNumber=', this.orderNumber, 'isGuest=', this.isGuest);
    if (this.orderNumber) {
      this.loadOrder();
    } else {
      console.error('OrderConfirmationComponent: No order number provided');
      alert('No se proporcionó un número de pedido válido');
      this.router.navigate(['/']);
    }
  }

  loadOrder() {
    console.log('OrderConfirmationComponent: Loading order with number:', this.orderNumber);
    this.http.get<Order>(`${environment.baseAPIURL}orders/${this.orderNumber}`).subscribe({
      next: (order) => {
        console.log('OrderConfirmationComponent: Order loaded:', order);
        this.order = order;
        this.displayOrder = order;
      },
      error: (error) => {
        console.error('OrderConfirmationComponent: Error fetching order:', error);
        alert(`Error al cargar los detalles del pedido: ${error.error?.message || error.statusText || 'No se pudo conectar con el servidor'}`);
      },
    });
  }

  // Formatear la dirección de envío completa
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
    ].filter(part => part); // Filtra partes vacías
    return parts.join(' ');
  }

  // Obtener etiqueta legible del método de pago
  getPaymentMethodLabel(paymentMethod: string): string {
    return this.paymentMethodLabels[paymentMethod] || paymentMethod;
  }

  confirmationOrder() {
    this.router.navigate(['/']);
  }
}