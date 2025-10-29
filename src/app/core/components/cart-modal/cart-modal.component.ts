import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CartService } from 'src/app/core/services/cart.service';
import { Product } from 'src/app/modules/product/model';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { AuthService } from 'src/app/shared/services/auth/auth.service';

interface Neighborhood {
  name: string;
  shipping: number;
}

@Component({
  selector: 'app-cart-modal',
  templateUrl: './cart-modal.component.html',
  styleUrls: ['./cart-modal.component.scss'],
})
export class CartModalComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  cart: Product[] = [];
  total = 0;
  shippingCost = 0;
  estimatedTotal = 0;

  selectedNeighborhood: Neighborhood | null = null;

  // === BUSCADOR ===
  searchTerm = '';
  filteredNeighborhoods: Neighborhood[] = [];
  allNeighborhoods: Neighborhood[] = [];

  private subscriptions: Subscription = new Subscription();

  neighborhoods: Neighborhood[] = [
    // === TUS PRECIOS ORIGINALES + NUEVOS BARRIOS 3000-6000 ===
    { name: 'AGUSTINOS/SAN ANTONIO', shipping: 3000 },
    { name: 'ALAMOS', shipping: 6000 },
    { name: 'ALBANIA', shipping: 8000 },
    { name: 'ALBERGUE/MARQUESA', shipping: 8000 },
    { name: 'ALCAZARES/FRANCIA', shipping: 3000 },
    { name: 'ALFEREZ REAL', shipping: 8000 },
    { name: 'ALHAMBRA', shipping: 5000 },
    { name: 'ALTA SUIZA/COLSEGUROS', shipping: 5000 },
    { name: 'ALTO TABLAZO', shipping: 4000 },
    { name: 'ALTOS DE CAPRI', shipping: 6500 },
    { name: 'ALTOS DE GRANADA', shipping: 5500 },
    { name: 'AMARELLO/EXPOFERIAS', shipping: 6000 },
    { name: 'AMERICAS', shipping: 7000 },
    { name: 'ARANJUEZ', shipping: 7500 },
    { name: 'ARBOLEDA', shipping: 5500 },
    { name: 'ARENILLO', shipping: 4000 },
    { name: 'ARGENTINA', shipping: 5500 },
    { name: 'ARRAYANES', shipping: 7000 },
    { name: 'ASTURIAS', shipping: 9000 },
    { name: 'ASUNCION', shipping: 5500 },
    { name: 'AUTONOMA', shipping: 6000 },
    { name: 'BAJA SUIZA', shipping: 5500 },
    { name: 'BAJO TABLAZO', shipping: 4000 },
    { name: 'BARRIO 20 DE JULIO', shipping: 7000 },
    { name: 'BELEN', shipping: 5000 },
    { name: 'BELLA MONTAÑA/MORICHAL', shipping: 10000 },
    { name: 'BENGALA', shipping: 7000 },
    { name: 'BOSQUE', shipping: 7500 },
    { name: 'BOSQUES DE ENCENILLO', shipping: 7000 },
    { name: 'BOSQUES DE NIZA', shipping: 5500 },
    { name: 'BOSQUES DEL NORTE', shipping: 3000 },
    { name: 'BOSQUES ENEA', shipping: 8000 },
    { name: 'CAMBULOS/CASTILLA', shipping: 8500 },
    { name: 'CAMILO TORRES', shipping: 7000 },
    { name: 'CAMPIN', shipping: 5000 },
    { name: 'CARIBE', shipping: 6000 },
    { name: 'CARMEN', shipping: 3000 },
    { name: 'CAROLA/A DE GRANADA', shipping: 5000 },
    { name: 'CC CABLE PLAZA/SANCANCIO', shipping: 4000 },
    { name: 'CC FUNDADORES/MALL PLAZA', shipping: 3000 },
    { name: 'CC PARQUE CALDAS', shipping: 3000 },
    { name: 'CEDROS', shipping: 4000 },
    { name: 'CENTENARIO/CASTELLANA', shipping: 4000 },
    { name: 'CENTRO', shipping: 3000 },
    { name: 'CERRO DE ORO AVIÓN', shipping: 6000 },
    { name: 'CERVANTES/CAMPOAMOR', shipping: 6000 },
    { name: 'CHIPRE/CAMPOHERMOSO', shipping: 3000 },
    { name: 'COLINAS', shipping: 7000 },
    { name: 'COLOMBIA', shipping: 6000 },
    { name: 'COLON', shipping: 7000 },
    { name: 'COMUNEROS', shipping: 7000 },
    { name: 'CONJUNTO TORREAR', shipping: 5500 },
    { name: 'CUMBRE/VILLA LUZ', shipping: 6000 },
    { name: 'CUCHILLA DEL SALADO', shipping: 3000 },
    { name: 'EL PALMAR', shipping: 6500 },
    { name: 'ENEA', shipping: 7000 },
    { name: 'ESTACION URIBE', shipping: 6000 },
    { name: 'ESTAMBUL', shipping: 10000 },
    { name: 'ESTRELLA/BELEN', shipping: 5000 },
    { name: 'EUCALIPTUS', shipping: 7000 },
    { name: 'ESTACION URIBE (TU Y YO, CHEC)', shipping: 5500 },
    { name: 'FANEÓN', shipping: 4500 },
    { name: 'FANNY GONZALES', shipping: 4000 },
    { name: 'FATIMA/BETANIA', shipping: 3500 },
    { name: 'FLORIDA', shipping: 5000 },
    { name: 'FLORIDA P. DE LA SALUD', shipping: 5500 },
    { name: 'FUNDADORES/DELICIAS', shipping: 3000 },
    { name: 'GALAN', shipping: 4500 },
    { name: 'GALERIA', shipping: 4000 },
    { name: 'GUAMAL', shipping: 5000 },
    { name: 'ISABELLA', shipping: 4500 },
    { name: 'LAS DELICIAS', shipping: 3000 },
    { name: 'LAURELES/RAMBLA', shipping: 3500 },
    { name: 'LEONORA', shipping: 3000 },
    { name: 'LIBORIO', shipping: 4500 },
    { name: 'LINDA', shipping: 6000 },
    { name: 'LLERAS', shipping: 3500 },
    { name: 'LUSITANIA', shipping: 5000 },
    { name: 'MALHABAR', shipping: 4500 },
    { name: 'MALHABAR BAJO', shipping: 4000 },
    { name: 'MALTERIA (CAI)', shipping: 5500 },
    { name: 'MALTERIA (PROGEL-TRULULU)', shipping: 6000 },
    { name: 'MILAN/CAMELIA', shipping: 3000 },
    { name: 'MINITAS/VIVEROS', shipping: 3500 },
    { name: 'MIRADOR SANCANCIO', shipping: 3000 },
    { name: 'MIRADOR VILLAPILAR', shipping: 5500 },
    { name: 'MOLINOS', shipping: 5000 },
    { name: 'MORROGACHO', shipping: 6000 },
    { name: 'NEVADO', shipping: 4500 },
    { name: 'NOGALES', shipping: 5000 },
    { name: 'ONDAS DE OTÚN', shipping: 3000 },
    { name: 'PALERMO/PALOGRANDE', shipping: 3000 },
    { name: 'PALONEGRO', shipping: 4500 },
    { name: 'PANORAMA', shipping: 5000 },
    { name: 'PARQUE DEL AGUA', shipping: 4500 },
    { name: 'PEÑOL', shipping: 5000 },
    { name: 'PERALONSO', shipping: 3000 },
    { name: 'PERSIA ALTO/GONZALES', shipping: 4500 },
    { name: 'PERSIA/PARAISO', shipping: 4000 },
    { name: 'PIO XII', shipping: 3000 },
    { name: 'PORVENIR', shipping: 3000 },
    { name: 'PRADO ALTO/MEDIO', shipping: 4500 },
    { name: 'PRADO BAJO', shipping: 4000 },
    { name: 'PUERTAS DEL SOL', shipping: 5000 },
    { name: 'RAMBLA/RESIDENCIAS', shipping: 3000 },
    { name: 'RESERVA CAMPESTRE', shipping: 5000 },
    { name: 'RETIRO', shipping: 5500 },
    { name: 'RINCON DE LA FRANCIA', shipping: 5500 },
    { name: 'ROSALES', shipping: 3000 },
    { name: 'RUTA 30/PORTAL SAN LUIS/VILLA KEMPIS', shipping: 6000 },
    { name: 'SAENZ/AUTONOMA', shipping: 3000 },
    { name: 'SAMARIA/SOLFERINO', shipping: 4500 },
    { name: 'SAN ANTONIO', shipping: 4500 },
    { name: 'SAN CAYETAN', shipping: 4500 },
    { name: 'SAN JOAQUIN', shipping: 3000 },
    { name: 'SAN JORGE/SOL', shipping: 3500 },
    { name: 'SAN JOSE', shipping: 4500 },
    { name: 'SAN MARCEL', shipping: 3000 },
    { name: 'SAN SEBASTIAN', shipping: 5000 },
    { name: 'SANTA HELENA', shipping: 3000 },
    { name: 'SANTOS', shipping: 4500 },
    { name: 'SINAI', shipping: 4500 },
    { name: 'SOLFERINO/LA UNIÓN', shipping: 4000 },
    { name: 'SULTANA', shipping: 3000 },
    { name: 'SULTANA LA FINCA', shipping: 3500 },
    { name: 'TERRAZAS DEL RIO', shipping: 3000 },
    { name: 'TOPACIO', shipping: 5500 },
    { name: 'TORRES SAN VICENTE', shipping: 4500 },
    { name: 'TOSCANA', shipping: 3000 },
    { name: 'TREBOL/TEJARES', shipping: 3500 },
    { name: 'URIBE AV PARALELA', shipping: 3000 },
    { name: 'VELEZ', shipping: 3000 },
    { name: 'VERACRUZ', shipping: 6000 },
    { name: 'VERSALLES', shipping: 3500 },
    { name: 'VILLA CARMENZA/FUENTE', shipping: 4500 },
    { name: 'VILLA JULIA', shipping: 5000 },
    { name: 'VILLA LUZ', shipping: 3000 },
    { name: 'VILLA PILAR/SACATÍN', shipping: 5000 },
    { name: 'VILLAHERMOSA', shipping: 3000 },
    { name: 'VILLAMARÍA/PRADERA/TURÍN', shipping: 6000 },
    { name: 'VIÑA/VILLA DEL RIO', shipping: 3000 },
    { name: 'Otro barrio', shipping: 0 }
  ].sort((a, b) => a.name.localeCompare(b.name));

  constructor(
    private cartService: CartService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.subscriptions.add(
      this.cartService.cartUpdated.subscribe((cart) => {
        this.cart = cart;
        this.updateTotals();
      })
    );
    this.subscriptions.add(
      this.cartService.getTotalAmount().subscribe((total) => {
        this.total = Number(total.toFixed(2));
        this.updateTotals();
      })
    );

    // Inicializar buscador
    this.allNeighborhoods = [...this.neighborhoods];
    this.filteredNeighborhoods = [...this.neighborhoods];
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  // === BUSCADOR ===
  filterNeighborhoods() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredNeighborhoods = [...this.allNeighborhoods];
      return;
    }

    this.filteredNeighborhoods = this.allNeighborhoods.filter(n =>
      n.name.toLowerCase().includes(term)
    );
  }

  selectNeighborhood(neighborhood: Neighborhood) {
    this.selectedNeighborhood = neighborhood;
    this.shippingCost = neighborhood.shipping;
    this.updateTotals();
    this.searchTerm = neighborhood.name;
    this.filteredNeighborhoods = []; // Cerrar lista
  }

  private updateTotals() {
    this.estimatedTotal = Number((this.total + this.shippingCost).toFixed(2));
  }

  closeModal(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }

  addQty(product: Product) {
    const currentQty = product.qty ?? 1;
    this.cartService.updateQuantity(product, currentQty + 1);
  }

  lessQty(product: Product) {
    const currentQty = product.qty ?? 1;
    if (currentQty > 1) {
      this.cartService.updateQuantity(product, currentQty - 1);
    } else {
      this.cartService.remove(product);
    }
  }

  removeFromCart(product: Product) {
    this.cartService.remove(product);
  }

  goToCheckout() {
    if (this.cart.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Carrito Vacío',
        text: 'Tu carrito está vacío. Añade productos antes de continuar.',
        confirmButtonColor: '#1e3a8a',
      });
      return;
    }

    if (!this.selectedNeighborhood) {
      Swal.fire({
        icon: 'info',
        title: 'Falta el barrio',
        text: 'Por favor selecciona el barrio de entrega.',
        confirmButtonColor: '#1e3a8a',
      });
      return;
    }

    const isAuthenticated = this.authService.isAuthenticated();
    if (isAuthenticated) {
      this.router.navigate(['/checkout'], {
        state: { 
          isGuest: false,
          neighborhood: this.selectedNeighborhood,
          shippingCost: this.shippingCost
        },
        queryParams: { isGuest: 'false' }
      });
      this.close.emit();
    } else {
      this.close.emit();
      Swal.fire({
        title: '¿Cómo deseas continuar?',
        text: 'Puedes realizar tu pedido como invitado o iniciar sesión/registrarte.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#1e3a8a',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Continuar como invitado',
        cancelButtonText: 'Iniciar sesión',
        showDenyButton: true,
        denyButtonText: 'Registrarse',
        denyButtonColor: '#1e3a8a',
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/checkout'], {
            state: { 
              isGuest: true,
              neighborhood: this.selectedNeighborhood,
              shippingCost: this.shippingCost
            },
            queryParams: { isGuest: 'true' }
          });
        } else if (result.isDenied) {
          this.router.navigate(['/register']);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          this.router.navigate(['/login']);
        }
      });
    }
  }
}