import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CartService } from 'src/app/core/services/cart.service';
import { OrderService } from 'src/app/shared/services/auth/order.service'; // Asegúrate de importar el servicio
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth/auth.service'; // Para obtener user_id
import { ShippingForm } from './model/ShippingForm.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styles: []
})
export class CheckoutComponent implements OnInit {
  gstAmount!: number;
  grandTotal!: number;
  shippingForm!: FormGroup;

  constructor(
    private cartService: CartService,
    private formBuilder: FormBuilder,
    private orderService: OrderService,
    private router: Router,
    private authService: AuthService
  ) {
    this.shippingForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]],
      lastName: ['', [Validators.minLength(3), Validators.maxLength(15)]],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', [Validators.required, Validators.minLength(10)]],
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      country: ['', [Validators.required]],
      postalCode: ['', [Validators.required]],
      paymentMethod: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.getTotal();
  }

  cancel() {
    this.router.navigate(['/cart']);
  }

  getTotal() {
    this.cartService.getGstAmount().subscribe(data => this.gstAmount = parseInt(data.toFixed(2)));
    this.cartService.getEstimatedTotal().subscribe(data => this.grandTotal = parseInt(data.toFixed(2)));
  }

  get firstName() { return this.shippingForm.get('firstName'); }
  get lastName() { return this.shippingForm.get('lastName'); }
  get email() { return this.shippingForm.get('email'); }
  get mobile() { return this.shippingForm.get('mobile'); }
  get address() { return this.shippingForm.get('address'); }
  get state() { return this.shippingForm.get('state'); }
  get city() { return this.shippingForm.get('city'); }
  get country() { return this.shippingForm.get('country'); }
  get postalCode() { return this.shippingForm.get('postalCode'); }

  onSave() {
    if (this.shippingForm.valid) {
      const userData = this.authService.getUserData();
      const orderData = {
        user_id: userData?.id || null,
        items: this.cartService.getCart.map(item => ({
          id: item.id,
          title: item.title,
          price: item.price,
          qty: item.qty || 1, // Valor por defecto si es undefined
          totalprice: item.totalprice || (item.price * (item.qty || 1)) // Calcula si es undefined
        })),
        shipping_address: {
          firstName: this.shippingForm.get('firstName')?.value,
          lastName: this.shippingForm.get('lastName')?.value,
          email: this.shippingForm.get('email')?.value,
          mobile: this.shippingForm.get('mobile')?.value,
          address: this.shippingForm.get('address')?.value,
          city: this.shippingForm.get('city')?.value,
          state: this.shippingForm.get('state')?.value,
          country: this.shippingForm.get('country')?.value,
          postalCode: this.shippingForm.get('postalCode')?.value
        },
        billing_address: null,
        payment_method: this.shippingForm.get('paymentMethod')?.value || 'credit_card', // Usa el valor del formulario
        total: this.grandTotal
      };

      this.orderService.placeOrder(orderData).subscribe({
        next: (response) => {
          Swal.fire({
            icon: 'success',
            title: '¡Pedido Realizado!',
            text: `Tu pedido #${response.order.order_number} ha sido procesado exitosamente.`,
            confirmButtonText: 'OK'
          });
          this.cartService.clearCart();
          this.router.navigate(['/order-confirmation'], { state: { orderId: response.order.order_number } });
          this.shippingForm.reset();
        },
        error: (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'No se pudo procesar el pedido. Intenta de nuevo.',
            confirmButtonText: 'OK'
          });
        }
      });
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario Incompleto',
        text: 'Por favor, completa todos los campos requeridos.',
        confirmButtonText: 'OK'
      });
    }
  }
}