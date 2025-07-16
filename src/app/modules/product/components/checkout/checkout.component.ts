import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from 'src/app/core/services/cart.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrderData, OrderService } from 'src/app/shared/services/auth/order.service';
import { AuthService } from 'src/app/shared/services/auth/auth.service';
import { addDays, format, getDay, eachDayOfInterval, isAfter, set } from 'date-fns';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

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
  dropdownOpen: { [key in 'city' | 'addressType' | 'paymentMethod' | 'deliveryOption']: boolean } = {
    city: false,
    addressType: false,
    paymentMethod: false,
    deliveryOption: false,
  };
  cities = ['Manizales', 'Villa María'];
  addressTypes = ['Calle', 'Carrera', 'Avenida'];
  deliveryOptions = [
    { value: 'home', label: 'Recibir en Domicilio' },
    { value: 'store', label: 'Recoger en Tienda' },
  ];
  paymentMethods = [
    { value: 'credit_card', label: 'PSE' },
    { value: 'Nequi', label: 'Nequi' },
    { value: 'cash_on_delivery', label: 'Contraentrega' },
  ];
  paymentMethodLabels: { [key: string]: string } = {
    credit_card: 'PSE',
    Nequi: 'Nequi',
    cash_on_delivery: 'Contraentrega',
  };

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private orderService: OrderService,
    private router: Router,
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.checkoutForm = this.fb.group({
      shippingAddress: this.fb.group({
        deliveryOption: ['home', Validators.required],
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        mobile: ['', Validators.required],
        addressType: ['Calle'],
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
    const cutoffTime = set(new Date(), { hours: 15, minutes: 0, seconds: 0, milliseconds: 0 });
    const startDate = isAfter(now, cutoffTime) ? addDays(now, 1) : now;
    const next7Days = eachDayOfInterval({ start: startDate, end: addDays(startDate, 6) });
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    this.deliveryDates = next7Days.map(date => ({
      day: days[getDay(date)],
      date: date.getDate(),
      fullDate: format(date, 'yyyy-MM-dd')
    }));
  }

  ngOnInit() {
    console.log('isGuest:', this.isGuest);
    console.log('isAuthenticated:', this.authService.isAuthenticated());
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.cart = this.cartService.getCart();
    this.cartService.getTotalAmount().subscribe((subtotal) => {
      this.total = Number(subtotal.toFixed(2));
      const shippingCost = this.checkoutForm.get('shippingAddress.deliveryOption')?.value === 'store' ? 0 : 6000;
      this.estimatedTotal = this.total + shippingCost;
    });
    const state = history.state;
    this.isGuest = state.isGuest || this.router.getCurrentNavigation()?.extras.queryParams?.['isGuest'] === 'true' || !this.authService.isAuthenticated();
    if (!this.isGuest && !this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }
    if (!this.isGuest) {
      this.fetchUserData();
    }
    this.checkoutForm.get('shippingAddress.deliveryOption')?.valueChanges.subscribe(value => {
      this.updateAddressValidators(value);
      this.updateShippingCost();
    });
    document.addEventListener('click', this.closeDropdowns.bind(this));
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.closeDropdowns.bind(this));
  }

  fetchUserData() {
    this.http.get(`${environment.baseAPIURL}me`).subscribe({
      next: (user: any) => {
        this.checkoutForm.get('shippingAddress')?.patchValue({
          firstName: user.first_name || '',
          lastName: user.last_name || '',
          email: user.email || '',
          mobile: user.phone || '',
          city: user.city || 'Manizales',
          state: user.state || 'Caldas',
          address: user.address || '',
          addressType: user.address ? this.guessAddressType(user.address) : 'Calle',
        });
      },
      error: (error) => {
        console.error('Error fetching user data:', error);
      }
    });
  }

  guessAddressType(address: string): string {
    const lowerAddress = address.toLowerCase();
    if (lowerAddress.includes('calle')) return 'Calle';
    if (lowerAddress.includes('carrera')) return 'Carrera';
    if (lowerAddress.includes('avenida')) return 'Avenida';
    return 'Calle';
  }

  getDeliveryOptionLabel(): string {
    const deliveryOption = this.checkoutForm.get('shippingAddress.deliveryOption')?.value;
    return deliveryOption
      ? this.deliveryOptions.find(opt => opt.value === deliveryOption)?.label || 'Selecciona una opción'
      : 'Selecciona una opción';
  }

  updateAddressValidators(deliveryOption: string) {
    const addressControls = ['addressType', 'address', 'addressNumber', 'city', 'state'];
    addressControls.forEach(control => {
      const formControl = this.checkoutForm.get(`shippingAddress.${control}`);
      if (deliveryOption === 'store') {
        formControl?.clearValidators();
        if (control === 'city') {
          formControl?.setValue('Manizales');
        } else if (control === 'state') {
          formControl?.setValue('Caldas');
        } else if (control === 'addressType') {
          formControl?.setValue('Calle');
        } else if (control === 'address') {
          formControl?.setValue('23');
        } else if (control === 'addressNumber') {
          formControl?.setValue('45-67');
        }
      } else {
        formControl?.setValidators(Validators.required);
      }
      formControl?.updateValueAndValidity();
    });
  }

  updateShippingCost() {
    const shippingCost = this.checkoutForm.get('shippingAddress.deliveryOption')?.value === 'store' ? 0 : 6000;
    this.estimatedTotal = this.total + shippingCost;
  }

  toggleDropdown(field: 'city' | 'addressType' | 'paymentMethod' | 'deliveryOption') {
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
      user_id: this.isGuest ? null : this.authService.getUserData()?.id || null,
      items: this.cart.map(item => ({
        id: item.id,
        title: item.title,
        price: item.price,
        qty: item.qty || 1,
        totalprice: item.price * (item.qty || 1)
      })),
      shipping_address: {
        ...this.checkoutForm.get('shippingAddress')?.value,
        postalCode: '170001'
      },
      billing_address: this.checkoutForm.get('billingAddress')?.value || null,
      payment_method: this.checkoutForm.get('paymentMethod')?.value,
      total: this.estimatedTotal,
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