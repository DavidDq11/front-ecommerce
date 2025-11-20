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
          /nexgard|credeli|bravecto|simparica|advocate|advantage|attack|revolution|one blister|capstar|pulfen/i.test(p.title)
        );

        this.allProducts = products.map(p => {
          const title = p.title.toUpperCase();

          const fixes: { [key: string]: string } = {
            'CREDELIO 112 MG 2.5 - 5.5 KG': 'CREDELIO 112 MG DE 2.5 A 5.5 KG',
            'CREDELIO 225 MG 5.5 - 11 KG': 'CREDELIO 225 MG DE 5.5 A 11 KG',
            'CREDELIO 56 MG 1.3 - 2.5 KG': 'CREDELIO 56 MG DE 1.3 A 2.5 KG',
            'CREDELIO PLUS X 56.25 MG': 'CREDELIO PLUS 56.25 MG DE 1.4 A 2.8 KG',
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

  // ========================= LÓGICA MEJORADA Y CORREGIDA =========================

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

    // ==================== REGLA 1: PROTECCIÓN COMPLETA (amplio espectro) ====================
    // Estos productos SIEMPRE son de protección completa
    if (
      /nexgard.*spectra/i.test(titleUpper) ||           // Todos los Nexgard Spectra
      /simparica.*trio/i.test(titleUpper) ||            // Simparica Trio
      /credelio.*plus/i.test(titleUpper) ||             // Credelio Plus
      /advocate/i.test(titleUpper) ||                    // Advocate (todas las presentaciones)
      /revolution/i.test(titleUpper)                     // Revolution
    ) {
      return 'completa';
    }

    // ==================== REGLA 2: PROTECCIÓN SOLO INTERNA ====================
    // Desparasitantes intestinales solamente
    if (
      /one blister|drontal|milbemax|profender|panacur/i.test(titleUpper)
    ) {
      return 'interna';
    }

    // ==================== REGLA 3: PROTECCIÓN SOLO EXTERNA ====================
    // Productos que SOLO controlan pulgas/garrapatas/ácaros externos
    if (
      /bravecto(?!.*plus)/i.test(titleUpper) ||         // Bravecto (sin Plus)
      /credelio(?!.*plus)/i.test(titleUpper) ||         // Credelio normal (sin Plus)
      /advantage(?!.*advocate)/i.test(titleUpper) ||    // Advantage (no Advocate)
      /attack|capstar|pulfen/i.test(titleUpper) ||      // Attack, Capstar, Pulfen
      /simparica(?!.*trio)/i.test(titleUpper)           // Simparica normal (sin Trio)
    ) {
      return 'externa';
    }

    // ==================== REGLA 4: ANÁLISIS POR DESCRIPCIÓN ====================
    // Si no matchea las reglas anteriores, analizar descripción

    // Palabras clave que indican protección COMPLETA
    const hasCompleteProtection = 
      /gusanos intestinales|dirofilariosis|gusano del corazón|anquilostomas|ascárides/.test(text) &&
      /pulgas|garrapatas/.test(text);

    if (hasCompleteProtection) return 'completa';

    // Palabras clave que indican protección EXTERNA
    const hasExternalOnly = 
      /pulgas|garrapatas|ácaros|demodex|sarna/.test(text) &&
      !/gusanos|lombrices|intestinal|corazón|dirofilaria/.test(text);

    if (hasExternalOnly) return 'externa';

    // Palabras clave que indican protección INTERNA
    const hasInternalOnly = 
      /gusanos|lombrices|tenias|intestinal/.test(text) &&
      !/pulgas|garrapatas|ácaros/.test(text);

    if (hasInternalOnly) return 'interna';

    // ==================== FALLBACK ====================
    // Por defecto, asumir que es externa (la mayoría son spot-on o tabletas antipulgas)
    return 'externa';
  }

  private isProductForWeight(product: Product, selectedMin: number, selectedMax: number): boolean {
    const title = product.title
      .toUpperCase()
      .replace(/[^\w\s\.\-–]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // ==================== CASOS ESPECIALES (CORRECCIONES MANUALES) ====================
    const specialCases: { [key: string]: { min: number; max: number } } = {
      'NEXGARD SPECTRA 2-3.5KG': { min: 2, max: 3.5 },
      'NEXGARD SPECTRA 7.5-15KG': { min: 7.5, max: 15 },
      'NEXGARD SPECTRA 15-30KG': { min: 15, max: 30 },
      'NEXGARD SPECTRA 30-60KG': { min: 30, max: 60 },
      
      'CREDELIO 112 MG': { min: 2.5, max: 5.5 },
      'CREDELIO 225 MG': { min: 5.5, max: 11 },
      'CREDELIO 56 MG': { min: 1.3, max: 2.5 },
      'CREDELIO 450 MG': { min: 11, max: 22 },
      'CREDELIO 900 MG': { min: 22, max: 45 },
      
      'CREDELIO PLUS 56.25 MG': { min: 1.4, max: 2.8 },  // ⚠️ CORRECCIÓN CRÍTICA
      'CREDELIO PLUS 450 MG': { min: 11, max: 22 },
      'CREDELIO PLUS 900 MG': { min: 22, max: 45 },
      
      'CREDELIO CAT 48 MG': { min: 2, max: 8 },
      'CREDELIO GATOS 12 MG': { min: 0.5, max: 2 },
      
      'BRAVECTO 250 MG': { min: 4.5, max: 10 },
      'BRAVECTO 500 MG': { min: 10, max: 20 },
      'BRAVECTO 1000 MG': { min: 20, max: 40 },
      
      'ADVANTAGE HASTA 4 KG': { min: 0, max: 4 },
      'ADVANTAGE DE 4 A 8 KG': { min: 4, max: 8 },
      
      'ADVOCATE HASTA 4 KG': { min: 0, max: 4 },
      'ADVOCATE HASTA 8 KG': { min: 0, max: 8 },
      'ADVOCATE DE 4 A 10 KG': { min: 4, max: 10 },
      'ADVOCATE DE 25 A 40 KG': { min: 25, max: 40 },
      
      'SIMPARICA TRIO 5 - 10 KG': { min: 5, max: 10 },
      'SIMPARICA TRIO 10 - 20 KG': { min: 10, max: 20 },
      'SIMPARICA TRIO 20 - 40 KG': { min: 20, max: 40 },
      'SIMPARICA 1.25 - 2.5 KG': { min: 1.25, max: 2.5 },
      'SIMPARICA 20 - 40 KG': { min: 20, max: 40 },
      
      'ATTACK PERRO DE 0 A 5 KG': { min: 0, max: 5 },
      'ATTACK PERRO DE 5 A 15 KG': { min: 5, max: 15 },
      'ATTACK PERRO DE 15 A 35 KG': { min: 15, max: 35 },
      'ATTACK PERRO DE 35 A 60 KG': { min: 35, max: 60 },
      'ATTACK GATOS DE 0 A 5 KG': { min: 0, max: 5 },
      'ATTACK GATOS DE 4 A 8 KG': { min: 4, max: 8 },
      
      'CAPSTAR DE 1 A 11 KG': { min: 1, max: 11 },
      
      'PULFEN SPOT-ON DE 0 A 10 KG': { min: 0, max: 10 },
      'PULFEN SPOT-ON DE 10 A 40 KG': { min: 10, max: 40 },
      
      'REVOLUTION 6% DE 0 A 2.5 KG': { min: 0, max: 2.5 },
      'REVOLUTION 6% DE 2.5 A 7.5 KG': { min: 2.5, max: 7.5 },
      
      'ONE BLISTER': { min: 0, max: 60 }  // Aplica para todos los pesos
    };

    // Buscar coincidencia en casos especiales
    for (const [key, range] of Object.entries(specialCases)) {
      if (title.includes(key.toUpperCase())) {
        return selectedMin <= range.max && selectedMax >= range.min;
      }
    }

    // ==================== DETECCIÓN POR REGEX (BACKUP) ====================
    const patterns = [
      /(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*KG/,              // 2-3.5 KG
      /DE\s+(\d+(?:\.\d+)?)\s*A\s+(\d+(?:\.\d+)?)\s*KG/,            // DE 2 A 3.5 KG
      /(\d+(?:\.\d+)?)\s*A\s+(\d+(?:\.\d+)?)\s*KG/,                 // 2 A 3.5 KG
      /HASTA\s+(\d+(?:\.\d+)?)\s*KG/,                               // HASTA 4 KG
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

    return false;
  }
}