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
          /nexgard|credeli|bravecto|simparica|advocate|advantage/i.test(p.title)
        );

        this.allProducts = products.map(p => {
          const title = p.title.toUpperCase();

          const fixes: { [key: string]: string } = {
            'CREDELIO 112 MG 2.5 - 5.5 KG': 'CREDELIO 112 MG DE 2.5 A 5.5 KG',
            'CREDELIO 225 MG 5.5 - 11 KG': 'CREDELIO 225 MG DE 5.5 A 11 KG',
            'CREDELIO 56 MG 1.3 - 2.5 KG': 'CREDELIO 56 MG DE 1.3 A 2.5 KG',
            'CREDELIO COMPRIMIDO MASTICABLE POR 450MG': 'CREDELIO 450 MG DE 11 A 22 KG',
            'CREDELIO 900 MG': 'CREDELIO 900 MG DE 22 A 45 KG',
            'CREDELIO CAT POR 48MG': 'CREDELIO CAT 48 MG DE 2 A 8 KG',
            'CREDELIO GATOS 12 MG 0.5 - 2 KG': 'CREDELIO GATOS 12 MG DE 0.5 A 2 KG',
            'CREDELIO PLUS X 450 MG': 'CREDELIO PLUS 450 MG DE 11 A 22 KG',
            'CREDELIO PLUS ANTIPARASITARIO MASTICABLE DE 900 MG': 'CREDELIO PLUS 900 MG DE 22 A 45 KG',
            'CREDELIO PLUS X 56.25 MG': 'CREDELIO PLUS 56.25 MG DE 2 A 11 KG',
            'ADVANTAGE ANTIPULGAS PARA GATOS (HASTA 4 KG)': 'ADVANTAGE PARA GATOS HASTA 4 KG',
            'ADVANTAGE ANTIPULGAS PARA GATOS (DE 4 A 8 KG)': 'ADVANTAGE PARA GATOS DE 4 A 8 KG',
            'ADVOCATE ANTIPARASITARIO PARA GATOS (HASTA 4 KG)': 'ADVOCATE PARA GATOS HASTA 4 KG',
            'ADVOCATE ANTIPARASITARIO PARA GATOS (HASTA 8 KG)': 'ADVOCATE PARA GATOS HASTA 8 KG',
            'ADVOCATE ANTIPARASITARIO PARA PERROS (DE 4 A 10 KG)': 'ADVOCATE PARA PERROS DE 4 A 10 KG',
            'ADVOCATE ANTIPARASITARIO PARA PERROS (DE 25 A 40 KG)': 'ADVOCATE PARA PERROS DE 25 A 40 KG'
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

  filterProducts() {
    if (!this.animal || !this.weightLabel) return;

    const { min, max } = this.weightRanges.find(r => r.label === this.weightLabel)!;

    let candidates = this.allProducts.filter(p =>
      p.animal_category?.toLowerCase() === this.animal &&
      this.isProductForWeight(p, min, max)
    );

    if (this.protection === 'completa') {
      candidates = candidates.filter(p => this.isFullProtection(p));
    } else if (this.protection === 'externo') {
      candidates = candidates.filter(p => !this.isFullProtection(p));
    }

    const brandOrder = ['Nexgard', 'Simparica', 'Credelio', 'Bravecto', 'Advocate', 'Advantage'];
    this.filteredProducts = candidates
      .sort((a, b) => {
        const ia = brandOrder.indexOf(a.brand || '');
        const ib = brandOrder.indexOf(b.brand || '');
        return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
      })
      .slice(0, 12);
  }

  private isFullProtection(p: Product): boolean {
    const text = (p.title + ' ' + p.description).toLowerCase();
    return /spectra|trio|plus|advocate|amplio espectro|parásitos internos|interno|gusanos|lombrices/.test(text);
  }

  private isProductForWeight(product: Product, selectedMin: number, selectedMax: number): boolean {
    const title = product.title.toUpperCase();

    const match = title.match(/(\d+\.?\d*)\s*[-A]\s*(\d+\.?\d*)\s*KG/);
    if (match) {
      const min = parseFloat(match[1]);
      const max = parseFloat(match[2]);
      return selectedMin <= max && selectedMax >= min;
    }

    const hastaMatch = title.match(/(HASTA|MENOS DE)\s*(\d+\.?\d*)\s*KG/);
    if (hastaMatch) {
      const max = parseFloat(hastaMatch[2]);
      return selectedMax <= max;
    }

    return false;
  }
}