import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductdetailComponent } from './components/product/productdetail/productdetail.component';
import { ProductComponent } from './components/product/product.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: ':animal_category/:category', component: ProductComponent },
      { path: 'DryFood', component: ProductComponent, data: { category: 'DryFood' } },
      { path: 'WetFood', component: ProductComponent, data: { category: 'WetFood' } },
      { path: 'Snacks', component: ProductComponent, data: { category: 'Snacks' } },
      { path: 'Litter', component: ProductComponent, data: { category: 'Litter' } },
      { path: 'Accessories', component: ProductComponent, data: { category: 'Accessories' } },
      { path: 'Veterinary', component: ProductComponent, data: { category: 'Veterinary' } },
      { path: ':category', component: ProductComponent },
      { path: 'product/:id', component: ProductdetailComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class ProductRoutingModule { }
