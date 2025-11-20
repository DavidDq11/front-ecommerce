import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ProductService } from 'src/app/modules/product/services/product.service';
import { Product } from 'src/app/modules/product/model';

interface WeightRange {
  label: string;
  min: number;
  max: number;
}

@Component({
  selector: 'app-desparasitante-wizard',
  templateUrl: './desparasitante-wizard.component.html',
  styleUrls: ['./desparasitante-wizard.component.scss']
})
export class DesparasitanteWizardComponent implements OnInit {

  @Output() scrollToTop = new EventEmitter<void>();

  step = 1;
  animal: 'perro' | 'gato' | null = null;
  weightLabel = '';
  protection: 'externo' | 'interno' | 'completa' = 'completa';

  allProducts: Product[] = [];
  filteredProducts: Product[] = [];

  weightRanges: WeightRange[] = [
    { label: 'Menos de 2 kg', min: 0, max: 2 },
    { label: '2 - 3.5 kg', min: 2, max: 3.5 },
    { label: '3.5 - 7.5 kg', min: 3.5, max: 7.5 },
    { label: '7.5 - 15 kg', min: 7.5, max: 15 },
    { label: '15 - 30 kg', min: 15, max: 30 },
    { label: '30 - 60 kg', min: 30, max: 60 },
    { label: 'Más de 60 kg', min: 60, max: 200 }
  ];

  availableWeightRanges: WeightRange[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadAntiparasitarios();
  }

  private triggerModalScroll() {
    this.scrollToTop.emit();
  }

  loadAntiparasitarios() {
    this.productService.getByCategory('Productos Veterinarios', { limit: 200 }).subscribe({
      next: (res) => {
        let products = res.products.filter(p =>
          /nexgard|credeli|bravecto|simparica|advocate|advantage|attack|revolution|one blister|capstar|pulsen/i.test(p.title)
        );

        this.allProducts = products.map(p => {
          const title = p.title.toUpperCase();

          const fixes: { [key: string]: string } = {
            'CREDELIO 112 MG 2.5 - 5.5 KG': 'CREDELIO 112 MG DE 2.5 A 5.5 KG',
            'CREDELIO 225 MG 5.5 - 11 KG': 'CREDELIO 225 MG DE 5.5 A 11 KG',
            'CREDELIO 56 MG 1.3 - 2.5 KG': 'CREDELIO 56 MG DE 1.3 A 2.5 KG',
            'CREDELIO PLUS X 56.25 MG': 'CREDELIO PLUS 56.25 MG DE 1.4 A 11 KG',
          };

          let newTitle = p.title;
          for (const [wrong, correct] of Object.entries(fixes)) {
            if (title.includes(wrong)) {
              newTitle = correct;
              break;
            }
          }

          return { ...p, title: newTitle };
        });
      }
    });
  }

  selectAnimal(animal: 'perro' | 'gato') {
    this.animal = animal;

    const productsForAnimal = this.allProducts.filter(p =>
      p.animal_category?.toLowerCase() === this.animal
    );

    this.availableWeightRanges = this.weightRanges.filter(range =>
      productsForAnimal.some(p => this.isProductForWeight(p, range.min, range.max))
    );

    if (this.availableWeightRanges.length === 1) {
      this.weightLabel = this.availableWeightRanges[0].label;
      this.step = 3;
    } else if (this.availableWeightRanges.length === 0) {
      this.step = 3;
    } else {
      this.step = 2;
    }

    this.triggerModalScroll();
  }

  selectWeight(range: WeightRange) {
    this.weightLabel = range.label;
    this.step = 3;
    this.triggerModalScroll();
  }

  selectProtection(type: 'externo' | 'interno' | 'completa') {
    this.protection = type;
    this.step = 4;
    this.filterProducts();
    this.triggerModalScroll();
  }

  goBack() {
    if (this.step > 1) this.step--;
    this.triggerModalScroll();
  }

  reset() {
    this.step = 1;
    this.animal = null;
    this.weightLabel = '';
    this.protection = 'completa';
    this.filteredProducts = [];
    this.availableWeightRanges = [];
    this.triggerModalScroll();
  }

  // ========================= NUEVA LÓGICA MEJORADA =========================

  filterProducts() {
    if (!this.animal || !this.weightLabel) return;

    const { min, max } = this.weightRanges.find(r => r.label === this.weightLabel)!;

    this.filteredProducts = this.allProducts
      .filter(p =>
        p.animal_category?.toLowerCase() === this.animal &&
        this.isProductForWeight(p, min, max)
      )
      .filter(p => {
        const type = this.getProtectionType(p);
        if (type === 'completa') return this.protection === 'completa';
        if (type === 'externa') return this.protection === 'externo';
        if (type === 'interna') return this.protection === 'interno';
        return false;
      })
      .sort((a, b) => {
        const order = ['Nexgard', 'Simparica', 'Credelio', 'Bravecto', 'Advocate', 'Advantage', 'ELANCO', 'ZOETIS', 'MSD', 'HOLLIDAY'];
        const ia = order.indexOf(a.brand || '');
        const ib = order.indexOf(b.brand || '');
        return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
      })
      .slice(0, 12);
  }

  private getProtectionType(p: Product): 'externa' | 'interna' | 'completa' {
    const text = (p.title + ' ' + (p.description || '')).toLowerCase();
    const titleUpper = p.title.toUpperCase();

    // 1. Reglas por marca/título (lo más fiable de todo)
    if (/spectra|trio|plus.*credeli|advocate|revolution/i.test(titleUpper)) return 'completa';
    if (/bravecto|credeli(?!.*plus)|advantage(?!.*advocate)|attack|capstar|pulsen|simparica(?!.*trio)/i.test(titleUpper)) return 'externa';
    if (/one blister|drontal|milbemax|profender/i.test(titleUpper)) return 'interna';

    // 2. Palabras clave fuertes
    const hasInternalStrong = /gusanos intestinales|dirofilariosis|gusano del corazón|tenias|anquilostomas|ascárides|lombrices.*(pulgas|garrapatas)|corazón.*(pulgas|garrapatas)/.test(text);
    if (hasInternalStrong) return 'completa';

    // 3. Análisis clásico mejorado
    const hasInternal = /gusanos|lombrices|tenias|dirofilariosis|corazón|intestinales|anquilostomas|ascárides/.test(text);
    const hasExternal = /pulgas|garrapatas|ácaros|demodex|sarna/.test(text);

    if (hasInternal && hasExternal) return 'completa';
    if (hasExternal) return 'externa';
    if (hasInternal) return 'interna';

    return 'externa'; // fallback seguro
  }

  private isProductForWeight(product: Product, selectedMin: number, selectedMax: number): boolean {
    const title = product.title.toUpperCase().replace(/[^\w\s\.\-–]/g, ' ').replace(/\s+/g, ' ').trim();

    const patterns = [
      /(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*KG/,                    // 2-3.5 KG / 15-30 KG
      /DE\s+(\d+(?:\.\d+)?)\s*A\s+(\d+(?:\.\d+)?)\s*KG/,                  // DE 2 A 3.5 KG
      /(\d+(?:\.\d+)?)\s*A\s+(\d+(?:\.\d+)?)\s*KG/,                        // 2 A 3.5 KG
      /DE\s+(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*KG/,                // DE 2 - 3.5 KG
      /HASTA\s+(\d+(?:\.\d+)?)\s*KG/,                                      // HASTA 4 KG
      /DE\s+(\d+(?:\.\d+)?)\s*KG/,                                         // DE 4 KG (segundo número en descripción)
      /(\d+(?:\.\d+)?)\s*KG\s*.*\s+(\d+(?:\.\d+)?)\s*KG/,                  // casos raros con dos rangos
    ];

    for (const regex of patterns) {
      const match = title.match(regex);
      if (match) {
        const nums = match.slice(1).map(n => parseFloat(n)).filter(n => !isNaN(n));
        if (nums.length === 0) continue;

        const prodMin = Math.min(...nums);
        const prodMax = nums.length > 1 ? Math.max(...nums) : Infinity;

        if (selectedMin <= prodMax && selectedMax >= prodMin) {
          return true;
        }
      }
    }

    // Casos ultra-específicos que fallaban
    if (title.includes('CREDELIO PLUS 56.25 MG')) return selectedMax >= 1.4 && selectedMin <= 11;
    if (title.includes('REVOLUTION 6% DE 0 A 2.5 KG')) return selectedMax <= 2.5;

    return false;
  }
}