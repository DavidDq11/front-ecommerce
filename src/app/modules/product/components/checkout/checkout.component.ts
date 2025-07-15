import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from 'src/app/core/services/cart.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrderData, OrderService } from 'src/app/shared/services/auth/order.service';
import { AuthService } from 'src/app/shared/services/auth/auth.service';
import { addDays, format, getDay, eachDayOfInterval, isAfter, set } from 'date-fns';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent implements OnInit, OnDestroy {
  checkoutForm: FormGroup;
  cart: any[] = [];
  total = 0;
  isGuest = true;
  orderNumber: string | null = null;
  estimatedTotal = 0;
  deliveryDates: { day: string; date: number; fullDate: string }[] = [];
  currentStep = 1;
  dropdownOpen: { [key in 'city' | 'addressType' | 'paymentMethod']: boolean } = {
    city: false,
    addressType: false,
    paymentMethod: false,
  };
  cities = ['Manizales', 'Villa María'];
  addressTypes = ['Calle', 'Carrera', 'Avenida'];
  paymentMethods = [
    { value: 'credit_card', label: 'Tarjeta de Crédito' },
    { value: 'Nequi', label: 'Nequi' },
    { value: 'cash_on_delivery', label: 'Contraentrega' },
  ];
  paymentMethodLabels: { [key: string]: string } = {
    credit_card: 'Tarjeta de Crédito',
    Nequi: 'Nequi',
    cash_on_delivery: 'Contraentrega',
  };

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
        addressType: ['Calle', Validators.required],
        address: ['', Validators.required],
        addressNumber: ['', Validators.required],
        city: ['Manizales', Validators.required],
        state: ['Caldas', Validators.required],
        country: ['Colombia', Validators.required],
        aptoPisoCasa: [''],
        deliveryDate: ['', Validators.required]
      }),
      billingAddress: this.fb.group({
        firstName: [''],
        lastName: [''],
        email: ['', [Validators.email]],
        mobile: [''],
        address: [''],
        addressNumber: [''],
        addressType: ['Calle'],
        city: [''],
        state: [''],
        country: ['Colombia'],
        aptoPisoCasa: ['']
      }),
      paymentMethod: ['', Validators.required],
    });

    const now = new Date();
    const cutoffTime = set(now, { hours: 16, minutes: 0, seconds: 0, milliseconds: 0 });
    const startDate = isAfter(now, cutoffTime) ? addDays(now, 1) : now;
    const next7Days = eachDayOfInterval({ start: startDate, end: addDays(startDate, 6) });
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    this.deliveryDates = next7Days.map(date => ({
      day: days[getDay(date)],
      date: date.getDate(),
      fullDate: format(date, 'yyyy-MM-dd')
    }));
  }

  ngOnInit() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.cart = this.cartService.getCart();
    this.cartService.getTotalAmount().subscribe((subtotal) => {
      this.total = Number(subtotal.toFixed(2));
      const shippingCost = 6000;
      this.estimatedTotal = this.total + shippingCost;
    });
    const state = history.state;
    this.isGuest = state.isGuest || this.router.getCurrentNavigation()?.extras.queryParams?.['isGuest'] === 'true' || !this.authService.isAuthenticated();
    if (!this.isGuest && !this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }
    document.addEventListener('click', this.closeDropdowns.bind(this));
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.closeDropdowns.bind(this));
  }

  toggleDropdown(field: 'city' | 'addressType' | 'paymentMethod') {
    Object.keys(this.dropdownOpen).forEach(key => {
      if (key !== field) {
        this.dropdownOpen[key as keyof typeof this.dropdownOpen] = false;
      }
    });
    this.dropdownOpen[field] = !this.dropdownOpen[field];
  }

  selectOption(field: string, value: string) {
    this.checkoutForm.get(field)?.setValue(value);
    this.validateField(field);
    const dropdownKey = field.split('.')[1] as keyof typeof this.dropdownOpen || field;
    this.dropdownOpen[dropdownKey] = false;
  }

  closeDropdowns(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-select')) {
      Object.keys(this.dropdownOpen).forEach(key => {
        this.dropdownOpen[key as keyof typeof this.dropdownOpen] = false;
      });
    }
  }

  selectDate(day: string, date: number) {
    const selectedDate = this.deliveryDates.find(d => d.day === day && d.date === date)?.fullDate;
    if (selectedDate) {
      this.checkoutForm.get('shippingAddress.deliveryDate')?.setValue(selectedDate);
      this.validateField('shippingAddress.deliveryDate');
    }
  }

  formatDate(dateStr: string, pattern: string): string {
    return dateStr ? format(new Date(dateStr), pattern) : '';
  }

  validateField(field: string) {
    const control = this.checkoutForm.get(field);
    if (control) {
      control.markAsTouched();
      control.updateValueAndValidity();
    }
  }

  nextStep() {
    if (this.currentStep === 1) {
      if (this.checkoutForm.get('shippingAddress.deliveryDate')?.invalid) {
        this.validateField('shippingAddress.deliveryDate');
        return;
      }
    } else if (this.currentStep === 2) {
      if (this.checkoutForm.get('shippingAddress')?.invalid) {
        this.checkoutForm.get('shippingAddress')?.markAllAsTouched();
        return;
      }
    } else if (this.currentStep === 3) {
      if (this.checkoutForm.get('paymentMethod')?.invalid) {
        this.validateField('paymentMethod');
        return;
      }
    }
    this.currentStep++;
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
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