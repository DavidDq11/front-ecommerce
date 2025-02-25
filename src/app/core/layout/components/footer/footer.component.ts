import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  brandlogo = 'https://www.pngkey.com/png/detail/361-3617936_b2b-e-commerce-b2b-e-commerce-icon.png';
  year = new Date().getFullYear();
  brand = 'DOGMYCAT';
}