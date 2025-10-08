import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { filter } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

interface ValidValues {
  categories: string[];
  animalCategories: string[];
  types: string[];
}

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit {
  breadcrumbList: { path: string; label: string }[] = [];
  validValues: ValidValues = { categories: [], animalCategories: [], types: [] };
  @Output() toggleFilterModal = new EventEmitter<void>();

  private categoryMapping: { [key: string]: string } = {
    'alimento': 'Alimentos',
    'snacks': 'Snacks',
    'juguetes': 'Juguete',
    'jaulas': 'Accesorios',
    'cuidado': 'Productos Veterinarios',
    'alimentos secos': 'Alimentos Secos',
    'alimentos húmedos': 'Alimentos Húmedos',
    'arena para gatos': 'Arena para Gatos',
    'accesorios': 'Accesorios',
    'productos veterinarios': 'Productos Veterinarios'
  };

  constructor(private router: Router, private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadValidValues().subscribe(
      (data) => {
        this.validValues = data;
        this.listenRoute();
      },
      (error) => {
        console.error('Error al cargar valores válidos:', error);
        this.validValues = {
          categories: [
            'Alimentos Secos',
            'Alimentos Húmedos',
            'Snacks',
            'Arena para Gatos',
            'Accesorios',
            'Productos Veterinarios'
          ],
          animalCategories: ['Perro', 'Gato', 'Hámster', 'Pájaro', 'Caballo', 'Vaca', 'Otros'],
          types: ['Alimentos', 'Snack', 'Juguete', 'Cuidado', 'Arena']
        };
        this.listenRoute();
      }
    );
  }

  private loadValidValues(): Observable<ValidValues> {
    return this.http.get<ValidValues>(`${environment.baseAPIURL}valid-values`);
  }

  private listenRoute() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.breadcrumbList = [];
      let currentRoute = this.route.root;
      let url = '';

      while (currentRoute.firstChild) {
        currentRoute = currentRoute.firstChild;
        const pathSegments = currentRoute.snapshot.url.map(segment => segment.path);
        if (pathSegments.length >= 2 && pathSegments[0] === 'categories') {
          const [_, animal, category] = pathSegments; // e.g., ['categories', 'perro', 'alimento']
          // Agregar animal
          url = `/categories/${animal}`;
          this.breadcrumbList.push({
            path: url,
            label: this.formatLabel(animal, 'animalCategories')
          });
          // Agregar categoría
          if (category) {
            url = `/categories/${animal}/${category}`;
            this.breadcrumbList.push({
              path: url,
              label: this.formatLabel(category, 'categories')
            });
          }
        } else if (pathSegments.length === 1 && pathSegments[0] !== 'categories') {
          url = `/${pathSegments[0]}`;
          this.breadcrumbList.push({
            path: url,
            label: this.formatLabel(pathSegments[0], 'categories')
          });
        }
      }
    });
  }

  private formatLabel(path: string, type: 'categories' | 'animalCategories'): string {
    const decodedPath = decodeURIComponent(path.toLowerCase());
    const validList = this.validValues[type];

    const found = validList.find(item => item.toLowerCase() === decodedPath);
    if (found) {
      return found;
    }

    const mapped = this.categoryMapping[decodedPath];
    if (mapped) {
      return mapped;
    }

    return decodedPath
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  toggleFilterModalEvent() {
    this.toggleFilterModal.emit();
  }
}
