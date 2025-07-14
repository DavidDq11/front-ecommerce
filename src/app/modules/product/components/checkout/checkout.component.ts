import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from 'src/app/core/services/cart.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrderData, OrderService } from 'src/app/shared/services/auth/order.service';
import { AuthService } from 'src/app/shared/services/auth/auth.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent implements OnInit {
  checkoutForm: FormGroup;
  cart: any[] = [];
  total = 0;
  isGuest = true;
  orderNumber: string | null = null;
  estimatedTotal = 0;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private orderService: OrderService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.checkoutForm = this.fb.group({
      shippingAddress: this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        mobile: ['', Validators.required],
        address: ['', Validators.required],
        city: ['Manizales', Validators.required], // Default to Manizales
        state: ['Caldas', Validators.required], // Default to Caldas
        country: ['Colombia', Validators.required], // Default to Colombia
      }),
      billingAddress: this.fb.group({
        firstName: [''],
        lastName: [''],
        email: ['', [Validators.email]],
        mobile: [''],
        address: [''],
        city: [''],
        state: [''],
        country: ['Colombia'], // Default to Colombia
      }),
      paymentMethod: ['', Validators.required],
    });
  }

  ngOnInit() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.cart = this.cartService.getCart();
    this.cartService.getTotalAmount().subscribe((subtotal) => {
      this.total = Number(subtotal.toFixed(2));
      const shippingCost = 6000; // Costo fijo de domicilio
      this.estimatedTotal = this.total + shippingCost; // Solo subtotal + envío
    });
    const state = history.state;
    this.isGuest = state.isGuest || this.router.getCurrentNavigation()?.extras.queryParams?.['isGuest'] === 'true' || !this.authService.isAuthenticated();
    if (!this.isGuest && !this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }
  }

  submitOrder() {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    const orderData: OrderData = {
      user_id: null,
      items: this.cart.map(item => ({
        id: item.id,
        title: item.title,
        price: item.price,
        qty: item.qty || 1,
        totalprice: item.price * (item.qty || 1)
      })),
      shipping_address: this.checkoutForm.get('shippingAddress')?.value,
      billing_address: this.checkoutForm.get('billingAddress')?.value || null,
      payment_method: this.checkoutForm.get('paymentMethod')?.value,
      total: this.total,
    };

    // console.log('CheckoutComponent: Submitting order with isGuest=', this.isGuest, 'data=', orderData);

    this.orderService.placeOrder(orderData, this.isGuest).subscribe({
      next: (response: any) => {
        this.orderNumber = response.order.order_number;
        this.cartService.clearCart();
        this.router.navigate(['/order-confirmation'], {
          state: { orderNumber: this.orderNumber, isGuest: this.isGuest },
        });
      },
      error: (error) => {
        console.error('CheckoutComponent: Error placing order:', error);
        alert('Error al realizar el pedido: ' + (error.statusText || 'No se pudo conectar con el servidor'));
      },
    });
  }
}