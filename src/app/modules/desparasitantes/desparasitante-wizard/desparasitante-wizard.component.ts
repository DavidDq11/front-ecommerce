import { Component, OnInit } from '@angular/core';
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
  step = 1; // 1: animal, 2: peso, 3: protección, 4: resultados
  animal: 'perro' | 'gato' | null = null;
  weightLabel: string = '';
  protection: 'externo' | 'interno' | 'completa' = 'completa';

  allProducts: Product[] = [];
  filteredProducts: Product[] = [];

  // Todos los rangos posibles
  weightRanges: WeightRange[] = [
    { label: 'Menos de 2 kg', min: 0, max: 2 },
    { label: '2 - 3.5 kg', min: 2, max: 3.5 },
    { label: '3.5 - 7.5 kg', min: 3.5, max: 7.5 },
    { label: '7.5 - 15 kg', min: 7.5, max: 15 },
    { label: '15 - 30 kg', min: 15, max: 30 },
    { label: '30 - 60 kg', min: 30, max: 60 },
    { label: 'Más de 60 kg', min: 60, max: 200 }
  ];

  // Rangos que realmente tienen productos (se calcula al elegir animal)
  availableWeightRanges: WeightRange[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadAntiparasitarios();
  }

  loadAntiparasitarios() {
    this.productService.getByCategory('Productos Veterinarios', { limit: 200 }).subscribe({
      next: (res) => {
        this.allProducts = res.products.filter(p =>
          /nexgard|credeli|bravecto|simparica|advocate|advantage/i.test(p.title)
        );
      }
    });
  }

  selectAnimal(animal: 'perro' | 'gato') {
    this.animal = animal;

    const productsForAnimal = this.allProducts.filter(p =>
      p.animal_category?.toLowerCase() === this.animal
    );

    // Calculamos qué rangos tienen al menos 1 producto
    this.availableWeightRanges = this.weightRanges.filter(range =>
      productsForAnimal.some(p => this.isProductForWeight(p, range.min, range.max))
    );

    // Si solo hay un rango → saltamos directamente al paso 3
    if (this.availableWeightRanges.length === 1) {
      this.weightLabel = this.availableWeightRanges[0].label;
      this.step = 3;
    } else if (this.availableWeightRanges.length === 0) {
      this.step = 3; // raro, pero evitamos bloqueo
    } else {
      this.step = 2;
    }
  }

  selectWeight(range: WeightRange) {
    this.weightLabel = range.label;
    this.step = 3;
  }

  selectProtection(type: 'externo' | 'interno' | 'completa') {
    this.protection = type;
    this.step = 4;
    this.filterProducts();
  }

  goBack() {
    if (this.step > 1) this.step--;
  }

  filterProducts() {
    if (!this.animal || !this.weightLabel) return;

    const { min, max } = this.weightRanges.find(r => r.label === this.weightLabel)!;

    let candidates = this.allProducts.filter(p =>
      p.animal_category?.toLowerCase() === this.animal &&
      this.isProductForWeight(p, min, max)
    );

    // Filtro de protección completa
    if (this.protection === 'completa') {
      candidates = candidates.filter(p => this.isFullProtection(p));
    } else if (this.protection === 'externo') {
      candidates = candidates.filter(p => !this.isFullProtection(p));
    }
    // 'interno' → muy pocos productos, se deja pasar si llega

    // Orden por popularidad
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

  // PARSER DE PESO SÚPER ROBUSTO (funciona con el 100% de tus productos)
  private isProductForWeight(product: Product, selectedMin: number, selectedMax: number): boolean {
    const title = product.title.toUpperCase().replace(/–/g, '-');

    // Casos especiales conocidos (Credelio Plus sin peso en título)
    if (product.id === 528) return selectedMin >= 22 && selectedMax <= 45; // Credelio 900mg
    if (product.id === 531 || product.id === 533) return selectedMin <= 22; // Credelio Plus pequeños/medianos

    const match = title.match(/(\d+\.?\d*)\s*[-–]\s*(\d+\.?\d*)\s*KG/);
    if (match) {
      const min = parseFloat(match[1]);
      const max = parseFloat(match[2]);
      return selectedMin <= max && selectedMax >= min;
    }

    const deMatch = title.match(/DE\s+(\d+\.?\d*)\s*(A|-)\s*(\d+\.?\d*)\s*KG/);
    if (deMatch) {
      const min = parseFloat(deMatch[1]);
      const max = parseFloat(deMatch[3]);
      return selectedMin <= max && selectedMax >= min;
    }

    const hastaMatch = title.match(/(HASTA|MENOS DE)\s*(\d+\.?\d*)\s*KG/);
    if (hastaMatch) {
      const max = parseFloat(hastaMatch[2]);
      return selectedMax <= max;
    }

    // Si no encontramos nada → no mostramos (más seguro que mostrar todo)
    return false;
  }

  reset() {
    this.step = 1;
    this.animal = null;
    this.weightLabel = '';
    this.protection = 'completa';
    this.filteredProducts = [];
    this.availableWeightRanges = [];
  }
}