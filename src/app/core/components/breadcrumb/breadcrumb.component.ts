import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styles: []
})
export class BreadcrumbComponent implements OnInit {
  breadcrumbList: { path: string; label: string }[] = [];
  @Output() toggleFilterModal = new EventEmitter<void>();

  constructor(private router: Router, private route: ActivatedRoute) {}

  listenRoute() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.breadcrumbList = [];
      let currentRoute = this.route.root;
      let url = '';

      while (currentRoute.firstChild) {
        currentRoute = currentRoute.firstChild;
        const path = currentRoute.snapshot.url.map(segment => segment.path).join('/');
        if (path) {
          url += `/${path}`;
          this.breadcrumbList.push({
            path: url,
            label: this.formatLabel(path)
          });
        }
      }
    });
  }

  // Método para formatear etiquetas de breadcrumb
  private formatLabel(path: string): string {
    return path
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  toggleFilterModalEvent() {
    this.toggleFilterModal.emit();
  }

  ngOnInit(): void {
    this.listenRoute();
  }
}