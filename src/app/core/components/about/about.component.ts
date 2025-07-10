import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  ngOnInit(): void {
    // Desplazar al inicio de la página cuando se carga
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/placeholder.jpg';
    // console.log('Error cargando imagen:', (event.target as HTMLImageElement).src);
  }
}